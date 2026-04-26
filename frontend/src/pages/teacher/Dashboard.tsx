import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Layout from "../../components/Layout";

export default function TeacherDashboard() {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teachers/classes").then((r) => r.data),
  });

  const totalStudents = classes.reduce((acc: number, c: any) => acc + (c.total_students ?? 0), 0);

  return (
    <Layout>
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-value">{isLoading ? "..." : classes.length}</p>
          <p className="stat-label">Turmas ativas</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{isLoading ? "..." : totalStudents}</p>
          <p className="stat-label">Alunos no total</p>
        </div>
        <div className="stat-card col-span-2 md:col-span-1">
          <p className="text-3xl text-accent">♟</p>
          <p className="stat-label">Campo Grande, MS</p>
        </div>
      </div>

      {/* Turmas */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary">Minhas Turmas</h2>
          <Link to="/professor/turmas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : classes.length === 0 ? (
          <div className="empty-state py-8">
            <p className="empty-state-icon">📚</p>
            <p className="empty-state-text">Nenhuma turma cadastrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {classes.map((c: any) => (
              <Link
                key={c.id}
                to={`/professor/turmas/${c.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary-light border border-transparent hover:border-primary/20 transition-all"
              >
                <div>
                  <p className="font-medium text-primary">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.total_students} aluno(s)</p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Acesso rápido */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/professor/revisao" className="card-hover">
          <h2 className="font-semibold text-primary">Revisão Semanal</h2>
          <p className="text-sm text-gray-500 mt-1">3 piores jogadas de cada aluno</p>
        </Link>
        <Link to="/professor/relatorios" className="card-hover">
          <h2 className="font-semibold text-primary">Relatórios PDF</h2>
          <p className="text-sm text-gray-500 mt-1">Relatório mensal para a escola</p>
        </Link>
      </div>
    </Layout>
  );
}
