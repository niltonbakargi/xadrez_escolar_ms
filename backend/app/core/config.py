from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Aplicação
    APP_NAME: str = "Plataforma de Xadrez Escolar"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 horas

    # Banco de dados (MySQL via XAMPP — sem senha por padrão)
    DATABASE_URL: str = "mysql+aiomysql://root:@localhost:3306/xadrez"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # lichess
    LICHESS_API_TOKEN: str
    LICHESS_BASE_URL: str = "https://lichess.org/api"

    # Stockfish
    STOCKFISH_PATH: str = "./stockfish/engines/stockfish"
    STOCKFISH_DEPTH: int = 18

    # Redis (Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # IA (Fase 2)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    class Config:
        env_file = ".env"


settings = Settings()
