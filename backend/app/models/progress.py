from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base


class Certificate(Base):
    """Certificado digital emitido ao concluir nível ou módulo."""
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    level = Column(String(50), nullable=False)
    issued_at = Column(DateTime, server_default=func.now())
    pdf_path = Column(String(500), nullable=True)


class GameDiary(Base):
    """Diário do jogador — reflexão rápida após cada sessão."""
    __tablename__ = "game_diaries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    session_date = Column(DateTime, server_default=func.now())
    reflection = Column(Text, nullable=False)
    mood_rating = Column(Integer, nullable=True)
    self_assessment = Column(Text, nullable=True)


class ScreenTimeLog(Base):
    """Registro de tempo de tela — conformidade LGPD / Lei Fléxa."""
    __tablename__ = "screen_time_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    session_start = Column(DateTime)
    session_end = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    pause_notified = Column(Integer, default=False)
