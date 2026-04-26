import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { LEVEL_ICON, LEVEL_LABEL } from "../../utils/levels";
import Layout from "../../components/Layout";

function ClassList() {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teachers/classes").then((r) => r.data),
  });

  return (
    <Layout>
      {isLoading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">📚</p>
          <p className="empty-state-text">Nenhuma turma cadastrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c: any) => (
            <Link
              key={c.id}
              to={`/professor/turmas/${c.id}`}
              className="card-hover flex items-center justify-between"
            >
              <div>
                <h2 className="font-semibold text-primary">{c.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{c.total_students} aluno(s)</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

function ClassDetail({ classId }: { classId: string }) {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["class-students", classId],
    queryFn: () => api.get(`/teachers/classes/${classId}/students`).then((r) => r.data),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teachers/classes").then((r) => r.data),
  });

  const cls = classes.find((c: any) => String(c.id) === classId);

  return (
    <Layout>
      {isLoading ? (
        <p className="text-gray-400 text-sm">Carregando alunos...</p>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">Nenhum aluno matriculado nesta turma.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">{cls?.name ?? "Turma"} · {students.length} aluno(s)</h2>
            <Link to={`/professor/revisao?class=${classId}`} className="btn-primary">
              Ver revisão semanal
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th className="text-center">Nível</th>
                  <th className="text-center">Partidas</th>
                  <th className="text-center">Analisadas</th>
                  <th>Lichess</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-medium text-primary">{s.name}</td>
                    <td className="text-center">
                      {LEVEL_ICON[s.level] ?? "♟"} {LEVEL_LABEL[s.level] ?? s.level}
                    </td>
                    <td className="text-center text-gray-600">{s.total_games}</td>
                    <td className="text-center">
                      <span className={s.total_analyzed > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                        {s.total_analyzed}
                      </span>
                    </td>
                    <td className="text-gray-400">{s.lichess_username ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}

export default function TeacherClasses() {
  const { id } = useParams<{ id?: string }>();
  return id ? <ClassDetail classId={id} /> : <ClassList />;
}
