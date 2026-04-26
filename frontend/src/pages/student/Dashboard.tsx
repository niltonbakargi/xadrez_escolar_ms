import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import { LEVEL_ORDER, LEVEL_LABEL } from "../../utils/levels";
import Layout from "../../components/Layout";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [syncMsg, setSyncMsg] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api.get("/students/me/profile").then((r) => r.data),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post("/lichess/sync?max_games=20"),
    onSuccess: (res) => {
      setSyncMsg(`${res.data.imported} nova(s) partida(s) importada(s).`);
      qc.invalidateQueries({ queryKey: ["student-profile"] });
    },
    onError: (err: any) => {
      setSyncMsg(err.response?.data?.detail ?? "Erro ao sincronizar.");
    },
  });

  const levelKey = profile?.level ?? "peao";
  const levelIndex = LEVEL_ORDER.indexOf(levelKey as any);
  const progressPct = Math.round(((levelIndex + 1) / LEVEL_ORDER.length) * 100);

  return (
    <Layout>
      {/* Nível */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-primary">Seu nível atual</h2>
          <span className="badge-gray">{levelIndex + 1} de {LEVEL_ORDER.length}</span>
        </div>
        <p className="text-4xl font-bold text-accent mb-3">
          {isLoading ? "..." : LEVEL_LABEL[levelKey]}
        </p>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          {LEVEL_ORDER.map((l) => (
            <span key={l} className={l === levelKey ? "font-bold text-primary" : ""}>
              {LEVEL_LABEL[l]}
            </span>
          ))}
        </div>
      </section>

      {/* Evolução */}
      <section className="card">
        <h2 className="text-base font-semibold text-primary mb-4">Sua evolução</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{isLoading ? "..." : (profile?.total_games ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Partidas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{isLoading ? "..." : (profile?.total_puzzles ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Puzzles</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary truncate">{isLoading ? "..." : (profile?.lichess_username ?? "—")}</p>
            <p className="text-sm text-gray-500 mt-1">Lichess</p>
          </div>
        </div>
      </section>

      {/* Sincronizar */}
      <section className="card">
        <h2 className="text-base font-semibold text-primary mb-1">Partidas do Lichess</h2>
        <p className="text-sm text-gray-500 mb-4">Importe suas partidas para gerar o Mapa do Jogo.</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setSyncMsg(""); syncMutation.mutate(); }}
            disabled={syncMutation.isPending || !profile?.lichess_username}
            className="btn-primary"
          >
            {syncMutation.isPending ? "Sincronizando..." : "Sincronizar partidas"}
          </button>
          {!profile?.lichess_username && (
            <span className="text-xs text-amber-600">Configure seu usuário Lichess primeiro.</span>
          )}
        </div>
        {syncMsg && <p className="mt-3 text-sm text-green-600">{syncMsg}</p>}
      </section>
    </Layout>
  );
}
