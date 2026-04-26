from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), default="Campo Grande")
    state = Column(String(2), default="MS")
    inep_code = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    classes = relationship("Class", back_populates="school")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    school = relationship("School", back_populates="classes")
    enrollments = relationship("Enrollment", back_populates="class_")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    enrolled_at = Column(DateTime, server_default=func.now())

    class_ = relationship("Class", back_populates="enrollments")
