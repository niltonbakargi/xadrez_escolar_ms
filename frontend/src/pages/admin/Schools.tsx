import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { LEVEL_ORDER, LEVEL_LABEL } from "../../utils/levels";
import Layout from "../../components/Layout";

interface School {
  id: number;
  name: string;
  city: string;
  state: string;
  inep_code: string | null;
  total_classes: number;
  total_students: number;
}

interface SchoolMetrics {
  school_name: string;
  city: string;
  total_classes: number;
  total_students: number;
  total_games: number;
  total_analyses: number;
  level_distribution: Record<string, number>;
}

export default function AdminSchools() {
  const qc = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: "", city: "Campo Grande", state: "MS", inep_code: "" });
  const [classForm, setClassForm] = useState({ name: "", school_id: 0, teacher_id: 0 });
  const [formError, setFormError] = useState("");

  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ["admin-schools"],
    queryFn: () => api.get("/admin/schools").then((r) => r.data),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<SchoolMetrics>({
    queryKey: ["school-metrics", selectedSchool],
    queryFn: () => api.get(`/admin/schools/${selectedSchool}/metrics`).then((r) => r.data),
    enabled: selectedSchool !== null,
  });

  const { data: teachers = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["admin-teachers"],
    queryFn: () => api.get("/admin/users?role=teacher").then((r) => r.data),
  });

  const createSchool = useMutation({
    mutationFn: (data: typeof schoolForm) => api.post("/admin/schools", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schools"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setShowCreateSchool(false);
      setSchoolForm({ name: "", city: "Campo Grande", state: "MS", inep_code: "" });
      setFormError("");
    },
    onError: () => setFormError("Erro ao criar escola."),
  });

  const createClass = useMutation({
    mutationFn: (data: typeof classForm) => api.post("/admin/classes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schools"] });
      qc.invalidateQueries({ queryKey: ["school-metrics", selectedSchool] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setShowCreateClass(false);
      setClassForm({ name: "", school_id: selectedSchool ?? 0, teacher_id: 0 });
      setFormError("");
    },
    onError: () => setFormError("Erro ao criar turma."),
  });

  function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolForm.name.trim()) { setFormError("Nome obrigatório."); return; }
    createSchool.mutate(schoolForm);
  }

  function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!classForm.name.trim() || !classForm.teacher_id) { setFormError("Preencha todos os campos."); return; }
    createClass.mutate({ ...classForm, school_id: selectedSchool! });
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Lista de escolas */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Escolas cadastradas</h2>
            <button
              onClick={() => { setShowCreateSchool(true); setFormError(""); }}
              className="btn-primary"
            >
              + Nova escola
            </button>
          </div>

          {isLoading ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : schools.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma escola cadastrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {schools.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSchool(s.id === selectedSchool ? null : s.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left ${
                    selectedSchool === s.id ? "bg-primary text-white" : "bg-gray-50 hover:bg-primary-light"
                  }`}
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className={`text-xs mt-0.5 ${selectedSchool === s.id ? "opacity-70" : "text-gray-400"}`}>
                      {s.city}, {s.state} {s.inep_code ? `· INEP: ${s.inep_code}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>{s.total_classes} turmas</span>
                    <span>{s.total_students} alunos</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Detalhes da escola selecionada */}
        {selectedSchool && (
          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">
                {metricsLoading ? "Carregando..." : metrics?.school_name}
              </h2>
              <button
                onClick={() => { setShowCreateClass(true); setClassForm(f => ({ ...f, school_id: selectedSchool, teacher_id: 0 })); setFormError(""); }}
                className="btn-accent"
              >
                + Nova turma
              </button>
            </div>

            {metricsLoading ? (
              <p className="text-gray-400 text-sm">Carregando métricas...</p>
            ) : metrics ? (
              <>
                {/* Cards de métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Turmas", value: metrics.total_classes },
                    { label: "Alunos", value: metrics.total_students },
                    { label: "Partidas", value: metrics.total_games },
                    { label: "Analisadas", value: metrics.total_analyses },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{m.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Distribuição de níveis */}
                {Object.keys(metrics.level_distribution).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Distribuição de níveis
                    </h3>
                    <div className="space-y-2">
                      {LEVEL_ORDER.filter(lv => metrics.level_distribution[lv]).map((lv) => {
                        const count = metrics.level_distribution[lv] ?? 0;
                        const pct = metrics.total_students > 0 ? (count / metrics.total_students) * 100 : 0;
                        return (
                          <div key={lv} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-16">{LEVEL_LABEL[lv] ?? lv}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>
        )}

        {/* Modal: criar escola */}
        {showCreateSchool && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Nova escola</h3>
              <form onSubmit={handleCreateSchool} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome da escola *</label>
                  <input
                    className="input"
                    value={schoolForm.name}
                    onChange={e => setSchoolForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: E.E. João da Silva"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Cidade</label>
                    <input
                      className="input"
                      value={schoolForm.city}
                      onChange={e => setSchoolForm(f => ({ ...f, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                    <input
                      className="input"
                      value={schoolForm.state}
                      onChange={e => setSchoolForm(f => ({ ...f, state: e.target.value }))}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Código INEP (opcional)</label>
                  <input
                    className="input"
                    value={schoolForm.inep_code}
                    onChange={e => setSchoolForm(f => ({ ...f, inep_code: e.target.value }))}
                    placeholder="8 dígitos"
                  />
                </div>
                {formError && <p className="text-red-500 text-xs">{formError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateSchool(false); setFormError(""); }}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createSchool.isPending}
                    className="flex-1 btn-primary"
                  >
                    {createSchool.isPending ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: criar turma */}
        {showCreateClass && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Nova turma</h3>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome da turma *</label>
                  <input
                    className="input"
                    value={classForm.name}
                    onChange={e => setClassForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: 6º Ano A"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Professor responsável *</label>
                  <select
                    className="input"
                    value={classForm.teacher_id}
                    onChange={e => setClassForm(f => ({ ...f, teacher_id: Number(e.target.value) }))}
                  >
                    <option value={0}>Selecione um professor</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-red-500 text-xs">{formError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateClass(false); setFormError(""); }}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createClass.isPending}
                    className="flex-1 btn-accent"
                  >
                    {createClass.isPending ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
