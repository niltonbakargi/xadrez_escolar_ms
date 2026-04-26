"""
Rotas de análise Stockfish — Mapa do Jogo e Impressão Digital do Jogador.
A análise roda em background para não bloquear a requisição.
"""
import asyncio
from collections import Counter
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.game import Game, GameAnalysis, PlayerProfile
from app.services.chess_analysis.analyzer import analyze_pgn

router = APIRouter()


# ---------------------------------------------------------------------------
# Utilitários
# ---------------------------------------------------------------------------

def _can_access_student(current_user: User, student_id: int) -> bool:
    if current_user.role in (UserRole.teacher, UserRole.admin):
        return True
    return current_user.id == student_id


async def _run_analysis(game_id: int, pgn: str, player_color: str, db: AsyncSession):
    """Executa analyze_pgn em thread separada e salva o resultado."""
    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(None, analyze_pgn, pgn, player_color)
    except Exception as e:
        print(f"[Análise] Erro na partida {game_id}: {e}")
        return

    # Salva ou atualiza o registro de análise
    existing = await db.execute(select(GameAnalysis).where(GameAnalysis.game_id == game_id))
    analysis = existing.scalar_one_or_none()

    moves_detail = [
        {
            "move_number": m.move_number,
            "move_san": m.move_san,
            "color": m.color,
            "classification": m.classification,
            "centipawn_loss": m.centipawn_loss,
            "phase": m.phase,
            "piece_moved": m.piece_moved,
        }
        for m in result.moves
    ]

    if analysis:
        analysis.blunders = result.blunders
        analysis.mistakes = result.mistakes
        analysis.inaccuracies = result.inaccuracies
        analysis.opening_accuracy = result.opening_accuracy
        analysis.middlegame_accuracy = result.middlegame_accuracy
        analysis.endgame_accuracy = result.endgame_accuracy
        analysis.moves_detail = moves_detail
    else:
        analysis = GameAnalysis(
            game_id=game_id,
            blunders=result.blunders,
            mistakes=result.mistakes,
            inaccuracies=result.inaccuracies,
            opening_accuracy=result.opening_accuracy,
            middlegame_accuracy=result.middlegame_accuracy,
            endgame_accuracy=result.endgame_accuracy,
            moves_detail=moves_detail,
        )
        db.add(analysis)

    await db.commit()
    print(f"[Análise] Partida {game_id} concluída — "
          f"erros graves: {result.blunders}, erros: {result.mistakes}, imprecisões: {result.inaccuracies}")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/games/{game_id}/analyze")
async def analyze_game(
    game_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dispara análise Stockfish em background. Resultado disponível via GET."""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partida não encontrada")

    if not _can_access_student(current_user, game.student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    if not game.pgn:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Partida sem PGN para análise")

    # Cria nova sessão para o background task (não pode reutilizar a sessão da requisição)
    from app.db.base import AsyncSessionLocal

    async def _bg_task():
        async with AsyncSessionLocal() as bg_db:
            await _run_analysis(game.id, game.pgn, game.player_color or "white", bg_db)

    background_tasks.add_task(_bg_task)

    return {
        "message": "Análise iniciada em background",
        "game_id": game_id,
        "status": "processing",
    }


@router.post("/students/{student_id}/analyze-all")
async def analyze_all_games(
    student_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analisa todas as partidas do aluno que ainda não foram analisadas."""
    if not _can_access_student(current_user, student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    games_result = await db.execute(select(Game).where(Game.student_id == student_id))
    games = games_result.scalars().all()

    # Filtra apenas as não analisadas
    analyzed_ids = set()
    for g in games:
        check = await db.execute(select(GameAnalysis.game_id).where(GameAnalysis.game_id == g.id))
        if check.scalar_one_or_none():
            analyzed_ids.add(g.id)

    pending = [g for g in games if g.id not in analyzed_ids]

    from app.db.base import AsyncSessionLocal

    async def _bg_all():
        for game in pending:
            async with AsyncSessionLocal() as bg_db:
                await _run_analysis(game.id, game.pgn, game.player_color or "white", bg_db)

    background_tasks.add_task(_bg_all)

    return {
        "message": f"{len(pending)} partida(s) enfileirada(s) para análise",
        "total_games": len(games),
        "already_analyzed": len(analyzed_ids),
        "pending": len(pending),
    }


@router.get("/games/{game_id}/result")
async def get_analysis_result(
    game_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna resultado da análise Stockfish de uma partida."""
    game_result = await db.execute(select(Game).where(Game.id == game_id))
    game = game_result.scalar_one_or_none()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partida não encontrada")

    if not _can_access_student(current_user, game.student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    result = await db.execute(select(GameAnalysis).where(GameAnalysis.game_id == game_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        return {"status": "pending", "message": "Análise ainda não realizada. Use POST /analyze"}

    return {
        "status": "done",
        "game_id": game_id,
        "blunders": analysis.blunders,
        "mistakes": analysis.mistakes,
        "inaccuracies": analysis.inaccuracies,
        "accuracy": {
            "opening": analysis.opening_accuracy,
            "middlegame": analysis.middlegame_accuracy,
            "endgame": analysis.endgame_accuracy,
        },
        "analyzed_at": analysis.analyzed_at,
        "moves": analysis.moves_detail,
    }


@router.get("/students/{student_id}/game-map")
async def get_game_map(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mapa do jogo: acurácia por fase, erros por tipo, padrão recorrente."""
    if not _can_access_student(current_user, student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    games_result = await db.execute(select(Game).where(Game.student_id == student_id))
    games = games_result.scalars().all()
    game_ids = [g.id for g in games]

    if not game_ids:
        return {"message": "Nenhuma partida encontrada. Sincronize com o Lichess primeiro."}

    analyses_result = await db.execute(
        select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids))
    )
    analyses = analyses_result.scalars().all()

    if not analyses:
        return {
            "message": "Nenhuma partida analisada ainda.",
            "total_games": len(games),
            "hint": f"Use POST /api/analysis/students/{student_id}/analyze-all para analisar todas.",
        }

    # Agrega métricas
    total = len(analyses)
    blunders = sum(a.blunders for a in analyses)
    mistakes = sum(a.mistakes for a in analyses)
    inaccuracies = sum(a.inaccuracies for a in analyses)

    opening_acc = [a.opening_accuracy for a in analyses if a.opening_accuracy]
    middlegame_acc = [a.middlegame_accuracy for a in analyses if a.middlegame_accuracy]
    endgame_acc = [a.endgame_accuracy for a in analyses if a.endgame_accuracy]

    def avg(lst): return round(sum(lst) / len(lst), 1) if lst else None

    # Padrão recorrente: fase com mais erros
    all_moves = []
    for a in analyses:
        if a.moves_detail:
            all_moves.extend(a.moves_detail)

    error_moves = [m for m in all_moves if m.get("classification") in ("mistake", "blunder")]
    phase_counter = Counter(m.get("phase") for m in error_moves)
    recurring_pattern = None
    if phase_counter:
        worst = phase_counter.most_common(1)[0]
        phase_names = {"opening": "abertura", "middlegame": "meio-jogo", "endgame": "final"}
        recurring_pattern = f"Erros concentrados no {phase_names.get(worst[0], worst[0])} ({worst[1]} erros)"

    return {
        "total_games_analyzed": total,
        "total_games": len(games),
        "errors": {
            "blunders": blunders,
            "mistakes": mistakes,
            "inaccuracies": inaccuracies,
        },
        "accuracy_by_phase": {
            "opening": avg(opening_acc),
            "middlegame": avg(middlegame_acc),
            "endgame": avg(endgame_acc),
        },
        "recurring_pattern": recurring_pattern,
    }


@router.get("/students/{student_id}/fingerprint")
async def get_player_fingerprint(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Impressão digital do jogador — gerada a partir das partidas analisadas."""
    if not _can_access_student(current_user, student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    games_result = await db.execute(select(Game).where(Game.student_id == student_id))
    games = games_result.scalars().all()

    if not games:
        return {"message": "Nenhuma partida encontrada."}

    game_ids = [g.id for g in games]
    analyses_result = await db.execute(
        select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids))
    )
    analyses = analyses_result.scalars().all()

    # Abertura favorita (mais frequente)
    openings = [g.opening_name for g in games if g.opening_name]
    favorite_opening = Counter(openings).most_common(1)[0][0] if openings else None

    # Fase mais forte (maior acurácia média)
    phase_scores = {}
    op = [a.opening_accuracy for a in analyses if a.opening_accuracy]
    mg = [a.middlegame_accuracy for a in analyses if a.middlegame_accuracy]
    eg = [a.endgame_accuracy for a in analyses if a.endgame_accuracy]
    if op: phase_scores["abertura"] = round(sum(op) / len(op), 1)
    if mg: phase_scores["meio-jogo"] = round(sum(mg) / len(mg), 1)
    if eg: phase_scores["final"] = round(sum(eg) / len(eg), 1)
    strongest_phase = max(phase_scores, key=phase_scores.get) if phase_scores else None

    # Peça mais perdida em erros graves
    all_moves = []
    for a in analyses:
        if a.moves_detail:
            all_moves.extend(a.moves_detail)

    error_moves = [m for m in all_moves if m.get("classification") in ("mistake", "blunder")]
    piece_counter = Counter(m.get("piece_moved") for m in error_moves if m.get("piece_moved"))
    most_lost_piece = piece_counter.most_common(1)[0][0] if piece_counter else None

    piece_names = {"P": "Peão", "N": "Cavalo", "B": "Bispo", "R": "Torre", "Q": "Dama", "K": "Rei"}

    # Padrão recorrente
    phase_counter = Counter(m.get("phase") for m in error_moves)
    recurring_pattern = None
    if phase_counter:
        worst = phase_counter.most_common(1)[0]
        phase_labels = {"opening": "abertura", "middlegame": "meio-jogo", "endgame": "final"}
        recurring_pattern = f"Erros concentrados no {phase_labels.get(worst[0], worst[0])}"

    # Salva/atualiza perfil
    prof_result = await db.execute(select(PlayerProfile).where(PlayerProfile.student_id == student_id))
    profile = prof_result.scalar_one_or_none()

    if not profile:
        profile = PlayerProfile(student_id=student_id)
        db.add(profile)

    profile.favorite_opening = favorite_opening
    profile.strongest_phase = strongest_phase
    profile.most_lost_piece = most_lost_piece
    profile.recurring_error_pattern = recurring_pattern
    profile.total_games = len(games)
    profile.total_puzzles = 0
    await db.commit()

    return {
        "student_id": student_id,
        "favorite_opening": favorite_opening,
        "strongest_phase": strongest_phase,
        "accuracy_by_phase": phase_scores,
        "most_lost_piece": piece_names.get(most_lost_piece, most_lost_piece),
        "recurring_pattern": recurring_pattern,
        "total_games": len(games),
        "total_analyzed": len(analyses),
    }
