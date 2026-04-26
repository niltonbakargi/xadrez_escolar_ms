import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import api from "../../services/api";

type PuzzleState = "waiting" | "playing" | "correct" | "wrong";

function usePuzzleGame(fen: string, solution: string[]) {
  const [chess] = useState(() => {
    const g = new Chess();
    g.load(fen);
    return g;
  });
  const [position, setPosition] = useState(() => {
    const g = new Chess();
    g.load(fen);
    return g.fen();
  });
  const [moveIndex, setMoveIndex] = useState(0);
  const [state, setState] = useState<PuzzleState>("playing");

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (state !== "playing") return false;

      const expectedUci = solution[moveIndex];

      // Allow promotion to queen by default
      const isPromotion =
        chess.get(sourceSquare as any)?.type === "p" &&
        (targetSquare[1] === "8" || targetSquare[1] === "1");

      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      const played = move.from + move.to + (move.promotion ?? "");
      const expected = expectedUci + (isPromotion ? "q" : "");

      if (played !== expected) {
        // Wrong move — undo
        chess.undo();
        setState("wrong");
        return false;
      }

      setPosition(chess.fen());
      const nextIndex = moveIndex + 1;

      if (nextIndex >= solution.length) {
        setState("correct");
        return true;
      }

      // Make the opponent's response automatically
      const opponentUci = solution[nextIndex];
      chess.move({
        from: opponentUci.slice(0, 2),
        to: opponentUci.slice(2, 4),
        promotion: opponentUci.length > 4 ? opponentUci[4] : undefined,
      });
      setPosition(chess.fen());
      setMoveIndex(nextIndex + 1);

      if (nextIndex + 1 >= solution.length) {
        setState("correct");
      }

      return true;
    },
    [chess, moveIndex, solution, state]
  );

  function retry() {
    chess.load(fen);
    setPosition(chess.fen());
    setMoveIndex(0);
    setState("playing");
  }

  return { position, state, onDrop, retry };
}

function PuzzleBoard({
  puzzle,
  orientation,
}: {
  puzzle: any;
  orientation: "white" | "black";
}) {
  const initialFen: string = puzzle.puzzle?.initialFen ?? "";
  const rawSolution: string[] = puzzle.puzzle?.solution ?? [];

  // The initial FEN is before the last move of the "setup" — we need to play the first solution move
  // to show the position from which the player solves
  const [setupFen] = useState(() => {
    if (!initialFen || rawSolution.length === 0) return initialFen;
    const g = new Chess();
    g.load(initialFen);
    const firstMove = rawSolution[0];
    g.move({
      from: firstMove.slice(0, 2),
      to: firstMove.slice(2, 4),
      promotion: firstMove.length > 4 ? firstMove[4] : undefined,
    });
    return g.fen();
  });

  // The solution from the player's perspective starts at index 1
  const playerSolution = rawSolution.slice(1);

  const { position, state, onDrop, retry } = usePuzzleGame(setupFen, playerSolution);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Dificuldade: <strong className="text-[#1a3c5e]">{puzzle.puzzle?.rating ?? "—"}</strong></span>
        <span>Temas: {puzzle.puzzle?.themes?.slice(0, 2).join(", ") ?? "—"}</span>
      </div>

      <div className="max-w-sm mx-auto">
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          customDarkSquareStyle={{ backgroundColor: "#1a3c5e" }}
          customLightSquareStyle={{ backgroundColor: "#e8d5b7" }}
        />
      </div>

      {state === "correct" && (
        <div className="text-center py-3 bg-green-50 rounded-xl border border-green-200">
          <p className="text-green-700 font-semibold">Correto! Excelente jogada.</p>
        </div>
      )}

      {state === "wrong" && (
        <div className="text-center py-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
          <p className="text-red-600 font-semibold">Não é essa jogada. Tente novamente.</p>
          <button
            onClick={retry}
            className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
          >
            Recomeçar
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentPuzzles() {
  const { data: puzzle, isLoading, error, refetch } = useQuery({
    queryKey: ["daily-puzzle"],
    queryFn: () => api.get("/lichess/puzzle/daily").then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  });

  // Determine board orientation from the puzzle's initial FEN turn
  const orientation: "white" | "black" = (() => {
    if (!puzzle?.puzzle?.initialFen) return "white";
    const g = new Chess();
    try {
      g.load(puzzle.puzzle.initialFen);
      // After white moves, black plays — so if it's black's turn initially,
      // the first move in solution is black's, and player is white (next)
      return g.turn() === "b" ? "white" : "black";
    } catch {
      return "white";
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3c5e] text-white px-6 py-4 flex items-center gap-4">
        <Link to="/aluno" className="text-white opacity-70 hover:opacity-100 text-sm">
          ← Voltar
        </Link>
        <div>
          <h1 className="text-xl font-bold">Puzzle do Dia</h1>
          <p className="text-sm opacity-70">Encontre a melhor sequência de lances</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {isLoading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            Carregando puzzle...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-8 text-center space-y-3">
            <p className="text-gray-500">Não foi possível carregar o puzzle do dia.</p>
            <button
              onClick={() => refetch()}
              className="text-sm bg-[#1a3c5e] text-white px-4 py-2 rounded-lg"
            >
              Tentar novamente
            </button>
          </div>
        ) : puzzle ? (
          <section className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1a3c5e]">
                {puzzle.game?.pgn
                  ? `Partida: ${puzzle.game.pgn.split("\n")[0]?.replace(/\[|\]/g, "").trim()}`
                  : "Puzzle Lichess"}
              </h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                Você joga com as {orientation === "white" ? "brancas ♙" : "pretas ♟"}
              </span>
            </div>

            <PuzzleBoard puzzle={puzzle} orientation={orientation} />
          </section>
        ) : null}

        {/* Instrução */}
        <div className="bg-[#f0f4f8] rounded-xl p-4 text-sm text-gray-600">
          <p className="font-semibold text-[#1a3c5e] mb-1">Como funciona</p>
          <p>
            Um puzzle é uma posição real de partida onde existe uma sequência ótima de lances.
            Arraste as peças para jogar. O objetivo é pensar antes de mover — como na partida real.
          </p>
        </div>
      </main>
    </div>
  );
}
