"""
Análise de partidas com Stockfish + python-chess.
Gera o 'Mapa do Jogo': padrões de erro, acurácia por fase, impressão digital do jogador.
"""
import chess
import chess.pgn
import chess.engine
import io
from dataclasses import dataclass, field
from typing import List, Optional
from app.core.config import settings


@dataclass
class MoveAnalysis:
    move_number: int
    move_san: str
    color: str
    eval_before: float
    eval_after: float
    best_move: str
    classification: str  # "best", "excellent", "good", "inaccuracy", "mistake", "blunder"
    centipawn_loss: int
    phase: str           # "opening", "middlegame", "endgame"
    piece_moved: str


@dataclass
class GameAnalysisResult:
    blunders: int = 0
    mistakes: int = 0
    inaccuracies: int = 0
    missed_wins: int = 0
    opening_accuracy: float = 0.0
    middlegame_accuracy: float = 0.0
    endgame_accuracy: float = 0.0
    moves: List[MoveAnalysis] = field(default_factory=list)
    recurring_pattern: Optional[str] = None


def classify_move(centipawn_loss: int) -> str:
    if centipawn_loss < 10:
        return "best"
    if centipawn_loss < 30:
        return "excellent"
    if centipawn_loss < 60:
        return "good"
    if centipawn_loss < 120:
        return "inaccuracy"
    if centipawn_loss < 250:
        return "mistake"
    return "blunder"


def detect_game_phase(board: chess.Board, move_number: int) -> str:
    piece_count = len(board.piece_map())
    if move_number <= 10:
        return "opening"
    if piece_count <= 12:
        return "endgame"
    return "middlegame"


def analyze_pgn(pgn_text: str, player_color: str = "white") -> GameAnalysisResult:
    game = chess.pgn.read_game(io.StringIO(pgn_text))
    if game is None:
        raise ValueError("PGN inválido")

    result = GameAnalysisResult()
    phase_moves: dict = {"opening": [], "middlegame": [], "endgame": []}

    with chess.engine.SimpleEngine.popen_uci(settings.STOCKFISH_PATH) as engine:
        board = game.board()
        move_number = 0

        for node in game.mainline():
            move_number += 1
            color = "white" if board.turn == chess.WHITE else "black"

            info_before = engine.analyse(board, chess.engine.Limit(depth=settings.STOCKFISH_DEPTH))
            eval_before = _score_to_cp(info_before["score"])

            best_move = info_before.get("pv", [None])[0]
            best_san = board.san(best_move) if best_move and best_move in board.legal_moves else "?"

            san = board.san(node.move)
            board.push(node.move)
            phase = detect_game_phase(board, move_number)

            info_after = engine.analyse(board, chess.engine.Limit(depth=settings.STOCKFISH_DEPTH))
            eval_after = _score_to_cp(info_after["score"])

            cp_loss = max(0, (eval_before - eval_after) if color == "white" else (eval_after - eval_before))
            classification = classify_move(int(cp_loss))

            piece = board.piece_at(node.move.to_square)
            piece_name = piece.symbol().upper() if piece else "?"

            move_analysis = MoveAnalysis(
                move_number=move_number,
                move_san=san,
                color=color,
                eval_before=eval_before,
                eval_after=eval_after,
                best_move=best_san,
                classification=classification,
                centipawn_loss=int(cp_loss),
                phase=phase,
                piece_moved=piece_name,
            )

            if color == player_color:
                if classification == "blunder":
                    result.blunders += 1
                elif classification == "mistake":
                    result.mistakes += 1
                elif classification == "inaccuracy":
                    result.inaccuracies += 1

                phase_moves[phase].append(cp_loss)

            result.moves.append(move_analysis)

    result.opening_accuracy = _phase_accuracy(phase_moves["opening"])
    result.middlegame_accuracy = _phase_accuracy(phase_moves["middlegame"])
    result.endgame_accuracy = _phase_accuracy(phase_moves["endgame"])
    result.recurring_pattern = _detect_pattern(result.moves, player_color)

    return result


def _score_to_cp(score: chess.engine.PovScore) -> float:
    white_score = score.white()
    if white_score.is_mate():
        return 3000.0 if (white_score.mate() or 0) > 0 else -3000.0
    cp = white_score.score()
    return cp / 100.0 if cp is not None else 0.0


def _phase_accuracy(cp_losses: list) -> float:
    if not cp_losses:
        return 100.0
    avg_loss = sum(cp_losses) / len(cp_losses)
    return max(0.0, round(100.0 - avg_loss * 0.5, 1))


def _detect_pattern(moves: List[MoveAnalysis], player_color: str) -> Optional[str]:
    """Identifica padrão recorrente de erro do jogador."""
    player_moves = [m for m in moves if m.color == player_color and m.classification in ("mistake", "blunder")]
    if not player_moves:
        return None

    phase_errors = {}
    for m in player_moves:
        phase_errors[m.phase] = phase_errors.get(m.phase, 0) + 1

    worst_phase = max(phase_errors, key=phase_errors.get)
    return f"Erros concentrados no {worst_phase}"
