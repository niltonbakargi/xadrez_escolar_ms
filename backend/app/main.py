from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, students, teachers, admin, analysis, lichess, reports

app = FastAPI(
    title="Plataforma de Xadrez Escolar",
    description="API para treinamento de xadrez com foco em desenvolvimento cognitivo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["alunos"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["professores"])
app.include_router(admin.router, prefix="/api/admin", tags=["gestão"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["análise"])
app.include_router(lichess.router, prefix="/api/lichess", tags=["lichess"])
app.include_router(reports.router, prefix="/api/reports", tags=["relatórios"])


@app.get("/")
def root():
    return {"status": "online", "plataforma": "Xadrez Escolar"}
