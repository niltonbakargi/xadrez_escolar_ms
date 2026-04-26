import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Layout from "../../components/Layout";

const PHASE_LABELS: Record<string, string> = {
  opening: "Abertura", middlegame: "Meio-jogo", endgame: "Final",
};

const CLASS_LABELS: Record<string, string> = {
  blunder: "Erro grave", mistake: "Erro", inaccuracy: "Imprecisão",
  good: "Bom", excellent: "Excelente", best: "Melhor",
};

const CLASS_COLORS: Record<string, string> = {
  blunder: "badge-danger", mistake: "text-orange-500 bg-orange-50",
  inaccuracy: "text-yellow-600 bg-yellow-50", good: "badge-success",
  excellent: "text-blue-600 bg-blue-50", best: "badge-gray",
};

export default function TeacherWeeklyReview() {
  const [params] = useSearchParams();
  const classId = params.get("class") ?? "1";

  const { data, isLoading, error } = useQuery({
    queryKey: ["weekly-review", classId],
    queryFn: () => api.get(`/teachers/classes/${classId}/weekly-review`).then((r) => r.data),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teachers/classes").then((r) => r.data),
  });

  const currentClass = classes.find((c: any) => String(c.id) === classId);

  return (
    <Layout>
      {/* Seletor de turma */}
      {classes.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {classes.map((c: any) => (
            <Link
              key={c.id}
              to={`/professor/revisao?class=${c.id}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                String(c.id) === classId
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">
          {currentClass?.name ?? "Turma"}
        </h2>
        {data && (
          <span className="badge-gray">{data.week_start} a {data.week_end}</span>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Carregando revisão...</p>
      ) : error ? (
        <div className="alert-error">Erro ao carregar revisão semanal.</div>
      ) : !data?.students?.length ? (
        <div className="empty-state">
          <p className="empty-state-text">Nenhum aluno encontrado nesta turma.</p>
        </div>
      ) : (
        <>
          {data.students.map((student: any) => (
            <section key={student.student_id} className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">{student.student_name}</h3>
                  {student.lichess_username && (
                    <p className="text-xs text-gray-400">@{student.lichess_username}</p>
                  )}
                </div>
                <span className="badge-gray">{student.games_this_week} partida(s) esta semana</span>
              </div>

              {student.worst_moves.length === 0 ? (
                <div className="px-6 py-4 text-sm text-gray-400">
                  {student.games_this_week === 0 ? "Nenhuma partida esta semana." : "Partidas ainda não analisadas."}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {student.worst_moves.map((move: any, i: number) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-200 w-6 text-center">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-primary">
                            {move.move_number}. {move.move}
                          </span>
                          <span className={`badge ${CLASS_COLORS[move.classification] ?? "badge-gray"}`}>
                            {CLASS_LABELS[move.classification] ?? move.classification}
                          </span>
                          <span className="text-xs text-gray-400">
                            {PHASE_LABELS[move.phase] ?? move.phase}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Perda: {move.centipawn_loss} centipeões</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {data.students.some((s: any) => s.worst_moves.length > 0) && (
            <div className="alert-info">
              <p className="font-semibold mb-1">Como usar na aula</p>
              <p className="text-gray-600">
                Reproduza essas posições no tabuleiro durante a sessão. Pergunte ao aluno o que pensou antes de jogar.
                O objetivo não é apontar o erro — é revelar o padrão de raciocínio.
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
