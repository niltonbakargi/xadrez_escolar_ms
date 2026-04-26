from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class StudentLevel(str, enum.Enum):
    peao = "peao"
    cavalo = "cavalo"
    bispo = "bispo"
    torre = "torre"
    dama = "dama"
    rei = "rei"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.student)
    is_active = Column(Boolean, default=True)
    lgpd_consent = Column(Boolean, default=False)
    image_consent = Column(Boolean, default=False)
    lichess_username = Column(String(100), nullable=True)
    level = Column(SAEnum(StudentLevel), default=StudentLevel.peao)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
