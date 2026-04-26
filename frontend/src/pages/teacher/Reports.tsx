import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Layout from "../../components/Layout";
import { LEVEL_LABEL } from "../../utils/levels";

export default function TeacherReports() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teachers/classes").then((r) => r.data),
  });

  async function downloadReport(classId: number, className: string) {
    const key = `class-${classId}`;
    setLoading((p) => ({ ...p, [key]: true }));
    setError((p) => ({ ...p, [key]: "" }));
    try {
      const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const res = await api.get(`/reports/classes/${classId}/monthly`, { params: { month }, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${className.replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 7)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      const msg = e.response?.data ? await e.response.data.text?.() : "Erro ao gerar relatório.";
      setError((p) => ({ ...p, [key]: typeof msg === "string" ? msg : "Erro ao gerar relatório." }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }

  async function downloadStudentReport(studentId: number, studentName: string) {
    const key = `student-${studentId}`;
    setLoading((p) => ({ ...p, [key]: true }));
    setError((p) => ({ ...p, [key]: "" }));
    try {
      const res = await api.get(`/reports/students/${studentId}/progress`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `progresso-${studentName.replace(/\s/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError((p) => ({ ...p, [key]: "Erro ao gerar relatório." }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }

  return (
    <Layout>
      {/* Relatórios por turma */}
      <section className="card">
        <h2 className="text-base font-semibold text-primary mb-1">Relatório Mensal da Turma</h2>
        <p className="text-sm text-gray-500 mb-4">
          Inclui evolução de todos os alunos, acurácia por fase e padrões de erro identificados pelo Stockfish.
        </p>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Carregando turmas...</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma turma encontrada.</p>
        ) : (
          <div className="space-y-3">
            {classes.map((c: any) => {
              const key = `class-${c.id}`;
              return (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="font-medium text-primary">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.total_students} aluno(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {error[key] && <span className="text-xs text-red-500">{error[key]}</span>}
                    <button onClick={() => downloadReport(c.id, c.name)} disabled={loading[key]} className="btn-primary">
                      {loading[key] ? "Gerando..." : "↓ Baixar PDF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Relatórios individuais */}
      <section className="card">
        <h2 className="text-base font-semibold text-primary mb-1">Relatório Individual do Aluno</h2>
        <p className="text-sm text-gray-500 mb-4">
          Relatório detalhado com impressão digital, mapa do jogo e histórico de evolução.
        </p>
        {classes.map((c: any) => (
          <ClassStudentList
            key={c.id}
            classId={c.id}
            className={c.name}
            loading={loading}
            error={error}
            onDownload={downloadStudentReport}
          />
        ))}
      </section>

      <div className="alert-info">
        <p className="font-semibold mb-1">Conformidade legal</p>
        <p className="text-gray-600">
          Os relatórios seguem as diretrizes da LGPD, ECA e Lei Fléxa (Lei 14.460/2022).
          Os dados são de uso exclusivo da equipe pedagógica.
        </p>
      </div>
    </Layout>
  );
}

function ClassStudentList({ classId, className, loading, error, onDownload }: {
  classId: number; className: string;
  loading: Record<string, boolean>; error: Record<string, string>;
  onDownload: (id: number, name: string) => void;
}) {
  const { data: students = [] } = useQuery({
    queryKey: ["class-students", classId],
    queryFn: () => api.get(`/teachers/classes/${classId}/students`).then((r) => r.data),
  });

  if (students.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="divider mb-3">{className}</p>
      <div className="space-y-2">
        {students.map((s: any) => {
          const key = `student-${s.id}`;
          return (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-medium text-primary text-sm">{s.name}</p>
                <p className="text-xs text-gray-400">{LEVEL_LABEL[s.level] ?? s.level} · {s.total_games} partidas</p>
              </div>
              <div className="flex items-center gap-2">
                {error[key] && <span className="text-xs text-red-500">{error[key]}</span>}
                <button onClick={() => onDownload(s.id, s.name)} disabled={loading[key]} className="btn-accent">
                  {loading[key] ? "Gerando..." : "↓ PDF individual"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
