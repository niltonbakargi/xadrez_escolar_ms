import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Layout from "../../components/Layout";

const STATS = [
  { key: "total_schools",  label: "Escolas",     icon: "🏫" },
  { key: "total_classes",  label: "Turmas",       icon: "📚" },
  { key: "total_students", label: "Alunos",       icon: "♟" },
  { key: "total_teachers", label: "Professores",  icon: "👤" },
  { key: "total_games",    label: "Partidas",     icon: "♜" },
  { key: "total_analyses", label: "Analisadas",   icon: "🔍" },
];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data),
  });

  async function handleExport() {
    const res = await api.get("/admin/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "alunos_xadrez.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map((s) => (
          <div key={s.key} className="stat-card">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="stat-value text-2xl">{isLoading ? "..." : (data?.[s.key] ?? 0)}</p>
            <p className="stat-label text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/gestao/escolas" className="card-hover">
          <p className="text-2xl mb-2">🏫</p>
          <h2 className="font-semibold text-primary">Escolas e Turmas</h2>
          <p className="text-sm text-gray-500 mt-1">Cadastrar escolas, criar turmas, ver indicadores</p>
        </Link>
        <Link to="/gestao/usuarios" className="card-hover">
          <p className="text-2xl mb-2">👤</p>
          <h2 className="font-semibold text-primary">Usuários</h2>
          <p className="text-sm text-gray-500 mt-1">Professores e alunos cadastrados</p>
        </Link>
        <button onClick={handleExport} className="card-hover text-left">
          <p className="text-2xl mb-2">📊</p>
          <h2 className="font-semibold text-primary">Exportar CSV</h2>
          <p className="text-sm text-gray-500 mt-1">Dados consolidados de todos os alunos</p>
        </button>
      </div>

      <div className="alert-info">
        <p className="font-semibold mb-1">Conformidade LGPD</p>
        <p className="text-gray-600">
          O acesso aos dados é restrito a administradores autorizados.
          A exportação CSV deve ser armazenada em ambiente seguro.
        </p>
      </div>
    </Layout>
  );
}
