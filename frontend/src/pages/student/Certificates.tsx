import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { LEVEL_ICON, LEVEL_LABEL } from "../../utils/levels";
import Layout from "../../components/Layout";

export default function StudentCertificates() {
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => api.get("/students/me/certificates").then((r) => r.data),
  });

  return (
    <Layout>
      {isLoading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : certs.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">♟</p>
          <p className="font-semibold text-primary">Nenhum certificado ainda</p>
          <p className="empty-state-text">
            Continue jogando e evoluindo. O primeiro certificado chega ao completar o nível Cavalo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c: any) => (
            <div key={c.id} className="card flex items-center gap-4 border-l-4 border-accent">
              <span className="text-4xl">{LEVEL_ICON[c.level] ?? "🏆"}</span>
              <div>
                <p className="font-bold text-primary">Nível {LEVEL_LABEL[c.level] ?? c.level}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Conquistado em {c.issued_at ? new Date(c.issued_at).toLocaleDateString("pt-BR") : "—"}
                </p>
                {c.pdf_path && (
                  <a href={c.pdf_path} className="text-xs text-primary underline mt-1 inline-block" target="_blank" rel="noreferrer">
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
