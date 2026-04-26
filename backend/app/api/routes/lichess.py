from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.game import Game
from app.services.lichess.client import lichess_client

router = APIRouter()


def _parse_result(game: dict, lichess_username: str) -> str:
    """Converte o resultado do Lichess para 'win', 'loss' ou 'draw'."""
    winner = game.get("winner")
    if not winner:
        return "draw"
    players = game.get("players", {})
    white_user = players.get("white", {}).get("user", {}).get("name", "").lower()
    if winner == "white":
        return "win" if white_user == lichess_username.lower() else "loss"
    else:
        return "win" if white_user != lichess_username.lower() else "loss"


def _parse_color(game: dict, lichess_username: str) -> str:
    players = game.get("players", {})
    white_user = players.get("white", {}).get("user", {}).get("name", "").lower()
    return "white" if white_user == lichess_username.lower() else "black"


def _parse_rating(game: dict, color: str) -> tuple[int | None, int | None]:
    players = game.get("players", {})
    player = players.get(color, {})
    rating = player.get("rating")
    diff = player.get("ratingDiff", 0) or 0
    rating_after = (rating + diff) if rating else None
    return rating, rating_after


@router.get("/puzzle/daily")
async def daily_puzzle(current_user: User = Depends(get_current_user)):
    """Retorna o puzzle diário do lichess."""
    try:
        return await lichess_client.get_puzzle()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Lichess indisponível: {str(e)}")


@router.post("/sync")
async def sync_my_games(
    max_games: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sincroniza as últimas partidas do próprio aluno a partir do Lichess."""
    if not current_user.lichess_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username do Lichess não configurado. Atualize seu perfil.",
        )
    return await _sync_games(current_user, max_games, db)


@router.post("/sync/{student_id}")
async def sync_student_games(
    student_id: int,
    max_games: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sincroniza partidas de um aluno (professor ou admin)."""
    if current_user.role == UserRole.student and current_user.id != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    result = await db.execute(select(User).where(User.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado")
    if not student.lichess_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aluno não tem username do Lichess configurado",
        )

    return await _sync_games(student, max_games, db)


async def _sync_games(student: User, max_games: int, db: AsyncSession) -> dict:
    """Lógica central de sincronização — evita duplicatas."""
    try:
        games_data = await lichess_client.get_user_games(student.lichess_username, max_games=max_games)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Erro ao buscar partidas no Lichess: {str(e)}")

    imported = 0
    skipped = 0

    for g in games_data:
        lichess_id = g.get("id")
        if not lichess_id:
            continue

        # Evita duplicatas
        existing = await db.execute(select(Game).where(Game.lichess_game_id == lichess_id))
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        pgn = g.get("pgn") or g.get("moves", "")
        color = _parse_color(g, student.lichess_username)
        rating_before, rating_after = _parse_rating(g, color)
        opening = g.get("opening", {})

        # Determina o oponente
        players = g.get("players", {})
        opp_color = "black" if color == "white" else "white"
        opp_data = players.get(opp_color, {}).get("user", {})
        opponent = opp_data.get("name", "Desconhecido")

        played_ts = g.get("createdAt")
        played_at = datetime.fromtimestamp(played_ts / 1000) if played_ts else None

        game = Game(
            student_id=student.id,
            lichess_game_id=lichess_id,
            pgn=pgn,
            played_at=played_at,
            opening_name=opening.get("name"),
            opening_eco=opening.get("eco"),
            result=_parse_result(g, student.lichess_username),
            player_color=color,
            rating_before=rating_before,
            rating_after=rating_after,
        )
        db.add(game)
        imported += 1

    if imported > 0:
        await db.commit()

    return {
        "student": student.name,
        "lichess_username": student.lichess_username,
        "imported": imported,
        "skipped_duplicates": skipped,
        "total_fetched": len(games_data),
    }


@router.get("/user/{username}")
async def get_lichess_user(
    username: str,
    current_user: User = Depends(get_current_user),
):
    """Consulta perfil do usuário no lichess."""
    try:
        return await lichess_client.get_user(username)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Lichess indisponível: {str(e)}")
