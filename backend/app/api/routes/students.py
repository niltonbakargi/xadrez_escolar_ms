from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.progress import GameDiary, Certificate
from app.models.game import Game, Puzzle

router = APIRouter()


class DiaryEntryRequest(BaseModel):
    reflection: str
    mood_rating: int | None = None  # 1-5
    self_assessment: str | None = None


@router.get("/me/profile")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    games_result = await db.execute(select(Game).where(Game.student_id == current_user.id))
    games = games_result.scalars().all()

    puzzles_result = await db.execute(select(Puzzle).where(Puzzle.student_id == current_user.id))
    puzzles = puzzles_result.scalars().all()

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "level": current_user.level.value if current_user.level else None,
        "lichess_username": current_user.lichess_username,
        "total_games": len(games),
        "total_puzzles": len(puzzles),
        "lgpd_consent": current_user.lgpd_consent,
    }


@router.get("/me/games")
async def get_my_games(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Game).where(Game.student_id == current_user.id).order_by(Game.played_at.desc())
    )
    games = result.scalars().all()
    return [
        {
            "id": g.id,
            "lichess_game_id": g.lichess_game_id,
            "result": g.result,
            "opening": g.opening_name,
            "player_color": g.player_color,
            "played_at": g.played_at,
            "rating_before": g.rating_before,
            "rating_after": g.rating_after,
        }
        for g in games
    ]


@router.get("/me/puzzles")
async def get_my_puzzles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Puzzle).where(Puzzle.student_id == current_user.id).order_by(Puzzle.solved_at.desc())
    )
    puzzles = result.scalars().all()
    return [
        {
            "id": p.id,
            "lichess_puzzle_id": p.lichess_puzzle_id,
            "solved": p.solved,
            "rating": p.rating,
            "solved_at": p.solved_at,
        }
        for p in puzzles
    ]


@router.get("/me/map")
async def get_game_map(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Redireciona para a rota de análise completa."""
    return {"student_id": current_user.id, "message": "Use /api/analysis/students/{id}/game-map"}


@router.get("/me/diary")
async def get_diary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GameDiary).where(GameDiary.student_id == current_user.id).order_by(GameDiary.created_at.desc())
    )
    entries = result.scalars().all()
    return [
        {
            "id": e.id,
            "reflection": e.reflection,
            "mood_rating": e.mood_rating,
            "self_assessment": e.self_assessment,
            "session_date": e.session_date,
        }
        for e in entries
    ]


@router.post("/me/diary", status_code=status.HTTP_201_CREATED)
async def create_diary_entry(
    data: DiaryEntryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = GameDiary(
        student_id=current_user.id,
        reflection=data.reflection,
        mood_rating=data.mood_rating,
        self_assessment=data.self_assessment,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"id": entry.id, "session_date": entry.session_date}


@router.get("/me/certificates")
async def get_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certificate).where(Certificate.student_id == current_user.id)
    )
    certs = result.scalars().all()
    return [
        {
            "id": c.id,
            "level": c.level,
            "issued_at": c.issued_at,
        }
        for c in certs
    ]
