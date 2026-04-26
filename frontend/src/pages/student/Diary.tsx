import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Layout from "../../components/Layout";

const MOODS = [
  { value: 1, label: "😔" },
  { value: 2, label: "😐" },
  { value: 3, label: "🙂" },
  { value: 4, label: "😊" },
  { value: 5, label: "🤩" },
];

export default function StudentDiary() {
  const qc = useQueryClient();
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["diary"],
    queryFn: () => api.get("/students/me/diary").then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post("/students/me/diary", { reflection, mood_rating: mood }),
    onSuccess: () => {
      setReflection("");
      setMood(null);
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["diary"] });
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <Layout>
      {/* Formulário */}
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-primary">Nova reflexão</h2>
        <div className="input-group">
          <label className="label">O que você aprendeu hoje?</label>
          <textarea
            rows={4}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="input resize-none"
            placeholder="Escreva sua reflexão..."
          />
        </div>

        <div>
          <label className="label">Como você se sentiu?</label>
          <div className="flex gap-3">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  mood === m.value ? "bg-primary scale-110" : "hover:bg-gray-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!reflection.trim() || saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar reflexão"}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">Salvo!</span>}
        </div>
      </section>

      {/* Histórico */}
      <section className="space-y-3">
        <p className="divider">Reflexões anteriores</p>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-icon">📝</p>
            <p className="empty-state-text">Nenhuma reflexão ainda. Escreva a primeira!</p>
          </div>
        ) : (
          entries.map((e: any) => (
            <div key={e.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {e.session_date ? new Date(e.session_date).toLocaleDateString("pt-BR") : ""}
                </span>
                {e.mood_rating && (
                  <span className="text-lg">{MOODS.find((m) => m.value === e.mood_rating)?.label}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{e.reflection}</p>
            </div>
          ))
        )}
      </section>
    </Layout>
  );
}
