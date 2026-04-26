import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LEVEL_LABEL } from "../utils/levels";

const NAV = {
  student: [
    { label: "Início", href: "/aluno" },
    { label: "Mapa do Jogo", href: "/aluno/mapa" },
    { label: "Puzzles", href: "/aluno/puzzles" },
    { label: "Diário", href: "/aluno/diario" },
    { label: "Certificados", href: "/aluno/certificados" },
  ],
  teacher: [
    { label: "Início", href: "/professor" },
    { label: "Turmas", href: "/professor/turmas" },
    { label: "Revisão Semanal", href: "/professor/revisao" },
    { label: "Relatórios", href: "/professor/relatorios" },
  ],
  admin: [
    { label: "Início", href: "/gestao" },
    { label: "Escolas", href: "/gestao/escolas" },
    { label: "Usuários", href: "/gestao/usuarios" },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Gestão",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const links = NAV[user?.role as keyof typeof NAV] ?? [];

  function isActive(href: string) {
    if (href === "/aluno" || href === "/professor" || href === "/gestao") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♟</span>
            <span className="font-bold text-base tracking-tight">Xadrez Escolar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium leading-tight">{user?.name}</span>
              <span className="text-xs opacity-60">
                {ROLE_LABEL[user?.role ?? ""] ?? ""}
                {user?.role === "student" && user?.level
                  ? ` · ${LEVEL_LABEL[user.level] ?? user.level}`
                  : ""}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-[52px] z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-0 overflow-x-auto scrollbar-hide">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive(link.href)
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-300 py-4 mt-4 border-t border-gray-100">
        Xadrez Escolar · Campo Grande, MS · O rating é um espelho do raciocínio.
      </footer>
    </div>
  );
}
