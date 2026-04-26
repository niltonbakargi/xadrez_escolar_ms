import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.school import School, Class, Enrollment
from app.models.game import Game, GameAnalysis, PlayerProfile

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso exclusivo para administradores")
    return current_user


class SchoolRequest(BaseModel):
    name: str
    city: str = "Campo Grande"
    state: str = "MS"
    inep_code: str | None = None


class ClassRequest(BaseModel):
    name: str
    school_id: int
    teacher_id: int


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    schools_r = await db.execute(select(func.count(School.id)))
    classes_r = await db.execute(select(func.count(Class.id)))
    students_r = await db.execute(select(func.count(User.id)).where(User.role == UserRole.student))
    teachers_r = await db.execute(select(func.count(User.id)).where(User.role == UserRole.teacher))
    games_r = await db.execute(select(func.count(Game.id)))
    analyses_r = await db.execute(select(func.count(GameAnalysis.id)))

    return {
        "total_schools": schools_r.scalar() or 0,
        "total_classes": classes_r.scalar() or 0,
        "total_students": students_r.scalar() or 0,
        "total_teachers": teachers_r.scalar() or 0,
        "total_games": games_r.scalar() or 0,
        "total_analyses": analyses_r.scalar() or 0,
    }


@router.get("/schools")
async def list_schools(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(School))
    schools = result.scalars().all()

    output = []
    for s in schools:
        classes_r = await db.execute(select(Class).where(Class.school_id == s.id))
        classes = classes_r.scalars().all()
        class_ids = [c.id for c in classes]

        total_students = 0
        if class_ids:
            count_r = await db.execute(
                select(func.count(Enrollment.id)).where(Enrollment.class_id.in_(class_ids))
            )
            total_students = count_r.scalar() or 0

        output.append({
            "id": s.id,
            "name": s.name,
            "city": s.city,
            "state": s.state,
            "inep_code": s.inep_code,
            "total_classes": len(classes),
            "total_students": total_students,
            "created_at": s.created_at,
        })
    return output


@router.post("/schools", status_code=status.HTTP_201_CREATED)
async def create_school(
    data: SchoolRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    school = School(name=data.name, city=data.city, state=data.state, inep_code=data.inep_code)
    db.add(school)
    await db.commit()
    await db.refresh(school)
    return {"id": school.id, "name": school.name}


@router.get("/schools/{school_id}/metrics")
async def school_metrics(
    school_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    school_r = await db.execute(select(School).where(School.id == school_id))
    school = school_r.scalar_one_or_none()
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Escola não encontrada")

    classes_r = await db.execute(select(Class).where(Class.school_id == school_id))
    classes = classes_r.scalars().all()
    class_ids = [c.id for c in classes]

    # Alunos
    student_ids = []
    if class_ids:
        enroll_r = await db.execute(select(Enrollment).where(Enrollment.class_id.in_(class_ids)))
        student_ids = [e.student_id for e in enroll_r.scalars().all()]

    # Partidas e análises
    total_games = total_analyses = 0
    level_dist: dict = {}
    if student_ids:
        games_r = await db.execute(select(Game).where(Game.student_id.in_(student_ids)))
        games = games_r.scalars().all()
        total_games = len(games)
        game_ids = [g.id for g in games]
        if game_ids:
            an_r = await db.execute(select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids)))
            total_analyses = len(an_r.scalars().all())

        students_r = await db.execute(select(User).where(User.id.in_(student_ids)))
        for s in students_r.scalars().all():
            lv = s.level.value if s.level else "Peão"
            level_dist[lv] = level_dist.get(lv, 0) + 1

    return {
        "school_id": school_id,
        "school_name": school.name,
        "city": school.city,
        "total_classes": len(classes),
        "total_students": len(student_ids),
        "total_games": total_games,
        "total_analyses": total_analyses,
        "level_distribution": level_dist,
    }


@router.post("/classes", status_code=status.HTTP_201_CREATED)
async def create_class(
    data: ClassRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    cls = Class(name=data.name, school_id=data.school_id, teacher_id=data.teacher_id)
    db.add(cls)
    await db.commit()
    await db.refresh(cls)
    return {"id": cls.id, "name": cls.name}


@router.get("/users")
async def list_users(
    role: str = "",
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if role:
        try:
            query = query.where(User.role == UserRole(role))
        except ValueError:
            pass
    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "level": u.level.value if u.level else None,
            "lichess_username": u.lichess_username,
            "is_active": u.is_active,
        }
        for u in users
    ]


@router.get("/export")
async def export_csv(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Exporta dados consolidados de todos os alunos em CSV."""
    students_r = await db.execute(select(User).where(User.role == UserRole.student))
    students = students_r.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Nome", "Email", "Nível", "Lichess",
        "Partidas", "Analisadas", "Abertura%", "Meio%", "Final%",
        "Erros Graves", "Erros", "Imprecisões", "Padrão Recorrente",
    ])

    for s in students:
        games_r = await db.execute(select(Game).where(Game.student_id == s.id))
        games = games_r.scalars().all()
        game_ids = [g.id for g in games]

        op_acc, mg_acc, eg_acc = [], [], []
        blunders = mistakes = inaccuracies = 0

        if game_ids:
            an_r = await db.execute(select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids)))
            for a in an_r.scalars().all():
                if a.opening_accuracy: op_acc.append(a.opening_accuracy)
                if a.middlegame_accuracy: mg_acc.append(a.middlegame_accuracy)
                if a.endgame_accuracy: eg_acc.append(a.endgame_accuracy)
                blunders += a.blunders or 0
                mistakes += a.mistakes or 0
                inaccuracies += a.inaccuracies or 0

        avg = lambda lst: round(sum(lst) / len(lst), 1) if lst else ""

        prof_r = await db.execute(select(PlayerProfile).where(PlayerProfile.student_id == s.id))
        profile = prof_r.scalar_one_or_none()

        writer.writerow([
            s.id, s.name, s.email,
            s.level.value if s.level else "Peão",
            s.lichess_username or "",
            len(games),
            len(op_acc),
            avg(op_acc), avg(mg_acc), avg(eg_acc),
            blunders, mistakes, inaccuracies,
            profile.recurring_error_pattern if profile else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alunos_xadrez.csv"},
    )
