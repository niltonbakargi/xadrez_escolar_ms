# ♟ Xadrez Escolar

> *"O rating no xadrez não é um troféu — é um espelho do raciocínio."*

Plataforma web para treinamento de xadrez em escolas públicas de **Campo Grande, MS**.
O aluno compete contra si mesmo — o sistema acompanha a evolução, o professor enxerga os padrões, a escola gera relatórios.

---

## O que a plataforma faz

| Para o aluno | Para o professor | Para a gestão |
|---|---|---|
| Importa partidas do Lichess | Vê as 3 piores jogadas de cada aluno na semana | Indicadores consolidados da rede |
| Mapa do jogo com acurácia por fase | Revisão semanal por turma | Cadastro de escolas e turmas |
| Puzzle diário interativo | Relatório mensal em PDF | Exportação CSV de todos os alunos |
| Diário do jogador com humor | Relatório individual por aluno | Filtro e busca de usuários |
| Certificados por nível (Peão → Rei) | Sincronização de partidas | Conformidade LGPD |

---

## Stack

- **Backend:** FastAPI · SQLAlchemy · Alembic · MySQL
- **Frontend:** React 18 · TypeScript · Tailwind CSS · Vite
- **Xadrez:** Stockfish · python-chess · Lichess API
- **Relatórios:** ReportLab (PDF)
- **Auth:** JWT · bcrypt

---

## Estrutura

```
.
├── backend/          # API FastAPI (Python)
│   ├── app/
│   │   ├── routers/  # auth, students, teachers, admin, analysis, lichess, reports
│   │   ├── models/   # SQLAlchemy (11 tabelas)
│   │   └── services/ # Stockfish, Lichess, PDF
│   └── alembic/      # Migrations
├── frontend/         # React + Tailwind
│   └── src/
│       ├── pages/    # student/, teacher/, admin/, auth/
│       ├── components/
│       └── utils/
├── stockfish/        # Engine (não incluso no repo)
├── scripts/          # Scripts de inicialização
├── INICIAR.bat       # Sobe backend + frontend automaticamente
└── PARAR.bat
```

---

## Instalação local

**Pré-requisitos:** Python 3.11+, Node.js 18+, MySQL (XAMPP)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Criar o arquivo `backend/.env`:
```
SECRET_KEY=sua-chave-secreta
DATABASE_URL=mysql+aiomysql://root:@localhost:3306/xadrez
LICHESS_API_TOKEN=seu-token-lichess
STOCKFISH_PATH=../stockfish/engines/stockfish.exe
```

Criar o banco e rodar as migrations:
```bash
# No MySQL: CREATE DATABASE xadrez;
alembic upgrade head
```

### Frontend
```bash
cd frontend
npm install
```

### Iniciar
```
Duplo clique em INICIAR.bat
```
Ou manualmente:
```bash
# Terminal 1
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Acesse: `http://localhost:5173`
API Swagger: `http://localhost:8000/docs`

---

## Níveis dos alunos

```
♟ Peão  →  ♞ Cavalo  →  ♝ Bispo  →  ♜ Torre  →  ♛ Dama  →  ♚ Rei
```

O nível avança conforme o professor registra a evolução. Cada nível gera um certificado em PDF.

---

## Conformidade legal

- **LGPD** — consentimento obrigatório no cadastro, dados de uso interno exclusivo
- **ECA** — proteção de dados de menores
- **Lei Fléxa (14.460/2022)** — diretrizes para esporte escolar

---

## Fase atual

Desenvolvimento local concluído. Em preparação para piloto com 2–3 escolas de Campo Grande, MS.

**Pendente para o piloto:**
- [ ] Token real do Lichess em `backend/.env`
- [ ] Stockfish em `stockfish/engines/stockfish.exe`
- [ ] Cadastrar primeiro admin via `localhost:8000/docs`
- [ ] Deploy em VPS
