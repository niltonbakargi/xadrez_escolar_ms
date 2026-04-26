import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.school import School, Class, Enrollment
from app.models.game import Game, GameAnalysis, Puzzle, PlayerProfile
from app.services.reports.pdf_generator import generate_monthly_report, generate_student_report

router = APIRouter()

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "reports")


def require_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.teacher, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
    return current_user


async def _student_data(student: User, db: AsyncSession) -> dict:
    """Agrega todos os dados necessários para o relatório de um aluno."""
    games_r = await db.execute(select(Game).where(Game.student_id == student.id))
    games = games_r.scalars().all()
    game_ids = [g.id for g in games]

    puzzles_r = await db.execute(select(Puzzle).where(Puzzle.student_id == student.id))
    puzzles = puzzles_r.scalars().all()

    # Agrega análises
    opening_acc, middlegame_acc, endgame_acc = [], [], []
    total_blunders = total_mistakes = total_inaccuracies = 0

    if game_ids:
        an_r = await db.execute(select(GameAnalysis).where(GameAnalysis.game_id.in_(game_ids)))
        for a in an_r.scalars().all():
            if a.opening_accuracy:
                opening_acc.append(a.opening_accuracy)
            if a.middlegame_accuracy:
                middlegame_acc.append(a.middlegame_accuracy)
            if a.endgame_accuracy:
                endgame_acc.append(a.endgame_accuracy)
            total_blunders += a.blunders or 0
            total_mistakes += a.mistakes or 0
            total_inaccuracies += a.inaccuracies or 0

    def avg(lst): return round(sum(lst) / len(lst), 1) if lst else None

    # Perfil do jogador
    prof_r = await db.execute(select(PlayerProfile).where(PlayerProfile.student_id == student.id))
    profile = prof_r.scalar_one_or_none()

    return {
        "name": student.name,
        "level": student.level.value if student.level else "Peão",
        "lichess_username": student.lichess_username,
        "games_played": len(games),
        "puzzles_solved": len(puzzles),
        "opening_accuracy": avg(opening_acc),
        "middlegame_accuracy": avg(middlegame_acc),
        "endgame_accuracy": avg(endgame_acc),
        "blunders": total_blunders,
        "mistakes": total_mistakes,
        "inaccuracies": total_inaccuracies,
        "favorite_opening": profile.favorite_opening if profile else None,
        "strongest_phase": profile.strongest_phase if profile else None,
        "most_lost_piece": profile.most_lost_piece if profile else None,
        "recurring_pattern": profile.recurring_error_pattern if profile else None,
    }


@router.get("/classes/{class_id}/monthly")
async def monthly_report(
    class_id: int,
    month: str = "",
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Gera e retorna relatório mensal da turma em PDF."""
    # Valida turma
    cls_r = await db.execute(select(Class).where(Class.id == class_id))
    cls = cls_r.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada")

    # Valida acesso do professor
    if current_user.role == UserRole.teacher and cls.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    # Escola
    school_r = await db.execute(select(School).where(School.id == cls.school_id))
    school = school_r.scalar_one_or_none()
    school_name = school.name if school else "Escola"

    # Alunos da turma
    enroll_r = await db.execute(
        select(User).join(Enrollment, Enrollment.student_id == User.id)
        .where(Enrollment.class_id == class_id)
    )
    students = enroll_r.scalars().all()
    if not students:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Turma sem alunos matriculados")

    month_label = month or datetime.now().strftime("%B/%Y")
    students_data = [await _student_data(s, db) for s in students]

    filename = f"relatorio_{class_id}_{datetime.now().strftime('%Y%m')}.pdf"
    output_path = os.path.join(REPORTS_DIR, filename)

    generate_monthly_report(
        school_name=school_name,
        class_name=cls.name,
        month=month_label,
        students_data=students_data,
        output_path=output_path,
    )

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/students/{student_id}/progress")
async def student_progress_report(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Relatório individual de evolução do aluno."""
    # Aluno pode gerar o próprio; professor/admin podem gerar de qualquer um
    if current_user.role == UserRole.student and current_user.id != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    student_r = await db.execute(select(User).where(User.id == student_id))
    student = student_r.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado")

    # Turma e escola do aluno
    enroll_r = await db.execute(select(Enrollment).where(Enrollment.student_id == student_id))
    enrollment = enroll_r.scalar_one_or_none()
    class_name = "—"
    school_name = "—"
    if enrollment:
        cls_r = await db.execute(select(Class).where(Class.id == enrollment.class_id))
        cls = cls_r.scalar_one_or_none()
        if cls:
            class_name = cls.name
            sch_r = await db.execute(select(School).where(School.id == cls.school_id))
            sch = sch_r.scalar_one_or_none()
            if sch:
                school_name = sch.name

    data = await _student_data(student, db)

    filename = f"progresso_{student_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    output_path = os.path.join(REPORTS_DIR, filename)

    generate_student_report(
        student_name=student.name,
        school_name=school_name,
        class_name=class_name,
        student_data=data,
        output_path=output_path,
    )

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
