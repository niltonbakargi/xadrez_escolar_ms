import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";

type Tab = "login" | "register";

const REDIRECTS: Record<string, string> = {
  student: "/aluno",
  teacher: "/professor",
  admin: "/gestao",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      const { data } = await api.post("/auth/login", form);
      setAuth({ id: data.user_id, name: data.name, email, role: data.role }, data.access_token);
      navigate(REDIRECTS[data.role] ?? "/aluno");
    } catch {
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a3c5e] text-white rounded-lg py-2 font-medium hover:bg-[#0f2a45] transition-colors disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [lichessUsername, setLichessUsername] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lgpdConsent) {
      setError("É necessário aceitar os termos de uso e a política de privacidade.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        lichess_username: lichessUsername || null,
        lgpd_consent: lgpdConsent,
      });
      setAuth({ id: data.user_id, name: data.name, email, role: data.role }, data.access_token);
      navigate(REDIRECTS[data.role] ?? "/aluno");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Email já cadastrado") {
        setError("Este email já está cadastrado. Faça login.");
      } else {
        setError("Erro ao cadastrar. Verifique os dados e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
        <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
        <div className="grid grid-cols-2 gap-2">
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                role === r
                  ? "bg-[#1a3c5e] text-white border-[#1a3c5e]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3c5e]"
              }`}
            >
              {r === "student" ? "♟ Aluno" : "♜ Professor"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usuário no Lichess
          <span className="text-gray-400 font-normal"> (opcional)</span>
        </label>
        <input
          type="text"
          value={lichessUsername}
          onChange={(e) => setLichessUsername(e.target.value)}
          placeholder="ex: joao_silva"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
        />
        <p className="text-xs text-gray-400 mt-1">
          Necessário para importar partidas. Pode ser adicionado depois.
        </p>
      </div>

      {/* Consentimento LGPD */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Privacidade e Consentimento
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lgpdConsent}
            onChange={(e) => setLgpdConsent(e.target.checked)}
            className="mt-0.5 accent-[#1a3c5e]"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            Concordo com o uso dos meus dados para fins pedagógicos, conforme a{" "}
            <strong>LGPD (Lei 13.709/2018)</strong>, o <strong>ECA</strong> e a{" "}
            <strong>Lei Fléxa (14.460/2022)</strong>. Os dados serão usados exclusivamente
            para acompanhar minha evolução no xadrez e nunca serão compartilhados publicamente.
          </span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !lgpdConsent}
        className="w-full bg-[#1a3c5e] text-white rounded-lg py-2 font-medium hover:bg-[#0f2a45] transition-colors disabled:opacity-50"
      >
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div className="min-h-screen bg-[#1a3c5e] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Cabeçalho */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="text-2xl font-bold text-[#1a3c5e]">Xadrez Escolar</h1>
          <p className="text-sm text-gray-400 mt-1">O rating é um espelho do raciocínio.</p>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-100 mx-8">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-[#1a3c5e] text-[#1a3c5e]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Formulário */}
        <div className="px-8 py-6">
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
