import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Layout from "../../components/Layout";

export default function StudentGameMap() {
  const { user } = useAuthStore();

  const { data: gameMap, isLoading: mapLoading, refetch: refetchMap } = useQuery({
    queryKey: ["game-map", user?.id],
    queryFn: () => api.get(`/analysis/students/${user?.id}/game-map`).then((r) => r.data),
    enabled: !!user?.id,
  });

  const { data: fingerprint, isLoading: fpLoading, refetch: refetchFp } = useQuery({
    queryKey: ["fingerprint", user?.id],
    queryFn: () => api.get(`/analysis/students/${user?.id}/fingerprint`).then((r) => r.data),
    enabled: !!user?.id,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.post(`/analysis/students/${user?.id}/analyze-all`),
    onSuccess: () => { setTimeout(() => { refetchMap(); refetchFp(); }, 2000); },
  });

  const acc = gameMap?.accuracy_by_phase ?? {};
  const hasData = gameMap?.total_games_analyzed > 0;

  return (
    <Layout>
      {/* Acurácia por fase */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary">Acurácia por fase do jogo</h2>
          {gameMap && (
            <span className="badge-gray">{gameMap.total_games_analyzed}/{gameMap.total_games} analisadas</span>
          )}
        </div>

        {mapLoading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : !hasData ? (
          <div className="empty-state">
            <p className="empty-state-icon">♟</p>
            <p className="font-medium text-gray-600">Nenhuma partida analisada ainda</p>
            <p className="empty-state-text">Sincronize suas partidas e clique em Analisar.</p>
            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="btn-primary"
            >
              {analyzeMutation.isPending ? "Analisando..." : "Analisar partidas"}
            </button>
            {analyzeMutation.isSuccess && (
              <p className="text-green-600 text-xs">Análise em andamento — resultados em alguns minutos.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Abertura", value: acc.opening },
                { label: "Meio-jogo", value: acc.middlegame },
                { label: "Final", value: acc.endgame },
              ].map((phase) => (
                <div key={phase.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-2xl font-bold text-primary">
                    {phase.value != null ? `${phase.value}%` : "—"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{phase.label}</p>
                  {phase.value != null && (
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${phase.value}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {gameMap?.errors && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="alert-error rounded-xl p-3">
                  <p className="text-xl font-bold text-red-600">{gameMap.errors.blunders}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Erros graves</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <p className="text-xl font-bold text-orange-500">{gameMap.errors.mistakes}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Erros</p>
                </div>
                <div className="alert-warning rounded-xl p-3">
                  <p className="text-xl font-bold text-amber-600">{gameMap.errors.inaccuracies}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Imprecisões</p>
                </div>
              </div>
            )}

            {gameMap?.recurring_pattern && (
              <p className="mt-4 alert-warning">{gameMap.recurring_pattern}</p>
            )}
          </>
        )}
      </section>

      {/* Impressão digital */}
      <section className="card">
        <h2 className="text-base font-semibold text-primary mb-4">Impressão digital do jogador</h2>
        {fpLoading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : !fingerprint?.favorite_opening ? (
          <p className="text-gray-400 text-sm">Disponível após a primeira análise de partidas.</p>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Abertura favorita", value: fingerprint.favorite_opening },
              { label: "Fase mais forte", value: fingerprint.strongest_phase },
              { label: "Peça mais envolvida em erros", value: fingerprint.most_lost_piece },
              { label: "Padrão recorrente", value: fingerprint.recurring_pattern },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</dt>
                <dd className="font-semibold text-primary">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </Layout>
  );
}
