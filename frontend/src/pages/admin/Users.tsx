import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { LEVEL_LABEL } from "../../utils/levels";
import Layout from "../../components/Layout";

interface UserItem {
  id: number; name: string; email: string;
  role: string; level: string | null;
  lichess_username: string | null; is_active: boolean;
}

const ROLE_LABELS: Record<string, string> = { student: "Aluno", teacher: "Professor", admin: "Admin" };

const LEVEL_COLORS: Record<string, string> = {
  peao: "badge-gray", cavalo: "badge-success",
  bispo: "text-blue-600 bg-blue-50", torre: "text-purple-600 bg-purple-50",
  dama: "badge-accent", rei: "badge-danger",
};

export default function AdminUsers() {
  const [role, setRole] = useState("student");
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery<UserItem[]>({
    queryKey: ["admin-users", role],
    queryFn: () => api.get(`/admin/users${role ? `?role=${role}` : ""}`).then((r) => r.data),
  });

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.lichess_username ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        {(["student", "teacher", "admin", ""] as const).map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRole(r)}
            className={role === r ? "btn-primary" : "btn-secondary"}
          >
            {r === "" ? "Todos" : ROLE_LABELS[r]}
          </button>
        ))}
        <input
          type="text"
          placeholder="Buscar nome, email ou Lichess..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input ml-auto max-w-xs"
        />
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-12">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">Nenhum usuário encontrado.</p>
        ) : (
          <>
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Nível</th>
                  <th>Lichess</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-primary">{u.name}</td>
                    <td className="text-gray-500">{u.email}</td>
                    <td><span className="badge-primary">{ROLE_LABELS[u.role] ?? u.role}</span></td>
                    <td>
                      {u.level
                        ? <span className={`badge ${LEVEL_COLORS[u.level] ?? "badge-gray"}`}>{LEVEL_LABEL[u.level] ?? u.level}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-gray-500">{u.lichess_username ?? <span className="text-gray-300">—</span>}</td>
                    <td>
                      <span className={u.is_active ? "badge-success" : "badge-danger"}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? "usuário" : "usuários"}
            </div>
          </>
        )}
      </div>

      <div className="alert-info">
        <p className="font-semibold mb-1">Conformidade LGPD</p>
        <p className="text-gray-600">
          Os dados pessoais são de uso interno exclusivo da equipe gestora.
          O cadastro de menores segue as diretrizes do ECA e da Lei Fléxa (14.460/2022).
        </p>
      </div>
    </Layout>
  );
}
