from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.school import Class, Enrollment
from app.models.game import Game, GameAnalysis

router = APIRouter()


def require_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.teacher, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso exclusivo para professores")
    return current_user


async def _get_class_or_404(class_id: int, teacher_id: int, db: AsyncSession) -> Class:
    result = await db.execute(
        select(Class).where(Class.id == class_id, Class.teacher_id == teacher_id)
    )
    cls = result.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada")
    return cls


class LessonRequest(BaseModel):
    title: str
    description: str | None = None
    positions: list[str] = []


@router.get("/classes")
async def get_classes(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Class).where(Class.teacher_id == current_user.id))
    classes = result.scalars().all()

    output = []
    for c in classes:
        count_result = await db.execute(
            select(Enrollment).where(Enrollment.class_id == c.id)
        )
        n_students = len(count_result.scalars().all())
        output.append({
            "id": c.id,
            "name": c.name,
            "school_id": c.school_id,
            "total_students": n_students,
            "created_at": c.created_at,
        })
    return output


@router.get("/classes/{class_id}/students")
async def get_class_students(
    class_id: int,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    await _get_class_or_404(class_id, current_user.id, db)

    result = await db.execute(
        select(User).join(Enrollment, Enrollment.student_id == User.id)
        .where(Enrollment.class_id == class_id)
    )
    students = result.scalars().all()

    output = []
    for s in students:
        # Conta partidas e análises do aluno
        games_r = await db.execute(select(Game).where(Game.student_id == s.id))
        games = games_r.scalars().all()
        game_ids = [g.id for g in games]

        analyses_count = 0
        if game_ids:
            an_r = await db.execute(
                select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids))
            )
            analyses_count = len(an_r.scalars().all())

        output.append({
            "id": s.id,
            "name": s.name,
            "level": s.level.value if s.level else None,
            "lichess_username": s.lichess_username,
            "total_games": len(games),
            "total_analyzed": analyses_count,
        })
    return output


@router.get("/classes/{class_id}/weekly-review")
async def get_weekly_review(
    class_id: int,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """
    Revisão semanal: as 3 piores jogadas de cada aluno nos últimos 7 dias.
    Baseado nas análises Stockfish já salvas.
    """
    await _get_class_or_404(class_id, current_user.id, db)

    students_r = await db.execute(
        select(User).join(Enrollment, Enrollment.student_id == User.id)
        .where(Enrollment.class_id == class_id)
    )
    students = students_r.scalars().all()

    week_ago = datetime.utcnow() - timedelta(days=7)
    review = []

    for student in students:
        # Partidas da semana
        games_r = await db.execute(
            select(Game).where(Game.student_id == student.id, Game.played_at >= week_ago)
        )
        games = games_r.scalars().all()
        game_ids = [g.id for g in games]

        worst_moves = []
        if game_ids:
            an_r = await db.execute(
                select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids))
            )
            analyses = an_r.scalars().all()

            # Agrega todos os lances do aluno e pega os 3 com maior centipawn loss
            all_moves = []
            for a in analyses:
                if a.moves_detail:
                    game = next((g for g in games if g.id == a.game_id), None)
                    for m in a.moves_detail:
                        if m.get("color") == (game.player_color if game else "white"):
                            all_moves.append({**m, "game_id": a.game_id})

            worst_moves = sorted(all_moves, key=lambda m: m.get("centipawn_loss", 0), reverse=True)[:3]

        review.append({
            "student_id": student.id,
            "student_name": student.name,
            "lichess_username": student.lichess_username,
            "games_this_week": len(games),
            "worst_moves": [
                {
                    "move": m["move_san"],
                    "move_number": m["move_number"],
                    "phase": m["phase"],
                    "classification": m["classification"],
                    "centipawn_loss": m["centipawn_loss"],
                    "game_id": m["game_id"],
                }
                for m in worst_moves
            ],
        })

    return {
        "class_id": class_id,
        "week_start": week_ago.strftime("%d/%m/%Y"),
        "week_end": datetime.utcnow().strftime("%d/%m/%Y"),
        "students": review,
    }


@router.post("/classes/{class_id}/lesson", status_code=status.HTTP_201_CREATED)
async def create_lesson(
    class_id: int,
    data: LessonRequest,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    await _get_class_or_404(class_id, current_user.id, db)
    return {
        "class_id": class_id,
        "title": data.title,
        "description": data.description,
        "created_by": current_user.name,
        "message": "Aula registrada",
    }


@router.get("/classes/{class_id}/report")
async def generate_class_report(
    class_id: int,
    month: str = "",
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    await _get_class_or_404(class_id, current_user.id, db)
    return {
        "class_id": class_id,
        "month": month or datetime.utcnow().strftime("%Y-%m"),
        "message": "Relatório PDF disponível na Etapa 6",
    }
