from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Game(Base):
    """Partida importada do lichess ou jogada na plataforma."""
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lichess_game_id = Column(String(20), unique=True, nullable=True)
    pgn = Column(Text, nullable=False)
    played_at = Column(DateTime)
    opening_name = Column(String(255), nullable=True)
    opening_eco = Column(String(5), nullable=True)
    result = Column(String(10))
    player_color = Column(String(5))
    rating_before = Column(Integer, nullable=True)
    rating_after = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    analysis = relationship("GameAnalysis", back_populates="game", uselist=False)


class GameAnalysis(Base):
    """Resultado da análise Stockfish de uma partida."""
    __tablename__ = "game_analyses"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), unique=True)
    analyzed_at = Column(DateTime, server_default=func.now())

    blunders = Column(Integer, default=0)
    mistakes = Column(Integer, default=0)
    inaccuracies = Column(Integer, default=0)
    missed_wins = Column(Integer, default=0)

    opening_accuracy = Column(Float, nullable=True)
    middlegame_accuracy = Column(Float, nullable=True)
    endgame_accuracy = Column(Float, nullable=True)

    moves_detail = Column(JSON, nullable=True)

    game = relationship("Game", back_populates="analysis")


class Puzzle(Base):
    """Puzzle resolvido pelo aluno."""
    __tablename__ = "puzzles"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    lichess_puzzle_id = Column(String(20), nullable=True)
    fen = Column(String(100), nullable=False)
    solved = Column(Integer, default=False)
    attempts = Column(Integer, default=1)
    time_seconds = Column(Integer, nullable=True)
    solved_at = Column(DateTime, server_default=func.now())


class PlayerProfile(Base):
    """Impressão digital do jogador — atualizada periodicamente."""
    __tablename__ = "player_profiles"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True)
    favorite_opening = Column(String(255), nullable=True)
    strongest_phase = Column(String(20), nullable=True)
    most_lost_piece = Column(String(10), nullable=True)
    recurring_error_pattern = Column(Text, nullable=True)
    current_rating = Column(Integer, nullable=True)
    peak_rating = Column(Integer, nullable=True)
    total_games = Column(Integer, default=0)
    total_puzzles = Column(Integer, default=0)
    updated_at = Column(DateTime, onupdate=func.now())
