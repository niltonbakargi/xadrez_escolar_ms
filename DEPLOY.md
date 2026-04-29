# Deploy na Nuvem — Plano e Registro

**Última atualização:** 2026-04-29

---

## Status atual (29/04/2026)

### O que está no ar
- **Backend FastAPI** rodando no Railway: `https://xadrezescolarms-production.up.railway.app`
- **Frontend React** rodando no Vercel: `https://xadrez-escolar-ms.vercel.app`
- **MySQL** no Railway: `nozomi.proxy.rlwy.net:26502` (banco `railway`)
- **Redis** no Railway: `redis.railway.internal:6379`

### Pendências
- Apontar domínio `escoladolivre.com` (Hostgator) para o Vercel — problema com o domínio em aberto
- Rodar `alembic upgrade head` no Railway para criar as tabelas
- CORS: adicionar URL do Vercel em `ALLOWED_ORIGINS` no backend
- Bug em `backend/app/api/routes/students.py` linha ~81: `p.rating` não existe no modelo `Puzzle`

---

## Ambiente local

### O que está funcionando localmente
- **XAMPP** rodando MySQL na porta 3306
- **Backend** FastAPI rodando em `http://localhost:8000`
- **Frontend** React/Vite rodando em `http://localhost:5173`
- **Login e cadastro** funcionando após subir o XAMPP e rodar as migrations
- **Inicialização** via duplo clique em `INICIAR.bat` na raiz do projeto

### Como subir o ambiente local
1. Abrir **XAMPP Control Panel** → Start **Apache** + **MySQL**
2. Duplo clique em `INICIAR.bat` na raiz do projeto
3. Acessar `http://localhost:5173`

---

## Arquitetura de produção

```
GitHub (niltonbakargi/xadrez_escolar_ms)
    │
    ├── push → Vercel   → Frontend (React)  https://xadrez-escolar-ms.vercel.app
    └── push → Railway  → Backend (FastAPI) https://xadrezescolarms-production.up.railway.app
                        → MySQL             nozomi.proxy.rlwy.net:26502
                        → Redis             redis.railway.internal:6379
```

### Serviços e custos

| Serviço | O que roda | Custo |
|---|---|---|
| **Vercel** | Frontend React | Grátis (Hobby plan) |
| **Railway** | Backend FastAPI | Trial $5 → depois ~$5-10/mês |
| **Railway** | MySQL | Incluso |
| **Railway** | Redis | Incluso |
| **GitHub** | Repositório | Grátis |

---

## Como foi feito o deploy (passo a passo)

### Etapa 1 — GitHub
- Repositório criado em: `https://github.com/niltonbakargi/xadrez_escolar_ms`
- Repositório público (necessário para Railway conectar)
- Push feito com: `git remote set-url origin <url>` + `git push -u origin main --force`

### Etapa 2 — Railway: banco de dados
- Conta criada em [railway.app](https://railway.app) com login GitHub
- Projeto criado: **ample-art**
- Serviços adicionados:
  - **MySQL** → URL: `mysql://root:<senha>@nozomi.proxy.rlwy.net:26502/railway`
  - **Redis** → URL: `redis://default:<senha>@redis.railway.internal:6379`

### Etapa 3 — Railway: backend
- Serviço conectado ao GitHub repo `xadrez_escolar_ms`
- **Root Directory:** `/backend`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Arquivo `backend/railway.toml` criado com o start command
- Variável `RAILPACK_PYTHON_VERSION=3.12` necessária (Railway usa Python 3.13 por padrão, incompatível com pydantic-core 2.18.2)
- `pandas` atualizado de 2.2.2 para 2.2.3 (wheel para Python 3.13 ausente)

#### Variáveis de ambiente no Railway (serviço backend)

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `mysql+aiomysql://root:<senha>@nozomi.proxy.rlwy.net:26502/railway` |
| `REDIS_URL` | `redis://default:<senha>@redis.railway.internal:6379` |
| `SECRET_KEY` | `362b7490f1ccc964a5058b250aad36702bf50376ec10ac8dddea08c92df13485` |
| `LICHESS_API_TOKEN` | token gerado em lichess.org/account/oauth/token |
| `STOCKFISH_PATH` | `/usr/bin/stockfish` |
| `DEBUG` | `False` |
| `RAILPACK_PYTHON_VERSION` | `3.12` |

> **Atenção:** O Railway CLI (`railway up`) não funciona corretamente quando Root Directory está configurado.
> O deploy deve ser feito via push no GitHub (webhook automático) ou pelo dashboard do Railway.

#### Problemas encontrados e soluções

| Problema | Solução |
|---|---|
| Railway não detectava pushes do GitHub | Disconnect + reconnect do repo nas Settings |
| Build falhava com erro no pydantic-core | Adicionar `RAILPACK_PYTHON_VERSION=3.12` nas variáveis |
| pandas 2.2.2 sem wheel para Python 3.13 | Atualizar para pandas 2.2.3 no requirements.txt |
| nixpacksPythonVersion ignorado pelo Railpack | Substituído por variável de ambiente `RAILPACK_PYTHON_VERSION` |
| Variáveis coladas erradas no Raw Editor | Adicionar cada variável individualmente com New Variable |
| Navegador traduzia nomes das variáveis | Desativar tradução automática do navegador |

### Etapa 4 — Vercel: frontend
- Conta criada em [vercel.com](https://vercel.com) com login GitHub
- Projeto importado do repositório `xadrez_escolar_ms`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- Variável adicionada:
  - `VITE_API_URL=https://xadrezescolarms-production.up.railway.app/api`
- URL gerada: `https://xadrez-escolar-ms.vercel.app`

### Etapa 5 — Domínio (pendente)
- Domínio: `escoladolivre.com` (Hostgator)
- Problema com o domínio em aberto — retomar quando resolver
- Quando resolver:
  1. No Vercel: **Settings → Domains** → adicionar `escoladolivre.com`
  2. No cPanel Hostgator: **Zone Editor** → adicionar registro CNAME:
     - Nome: `www` (ou subdomínio desejado)
     - Valor: `cname.vercel-dns.com`

---

## Fluxo de desenvolvimento após o deploy

```
1. Desenvolve localmente (XAMPP + INICIAR.bat)
2. Testa em localhost:5173
3. git add + git commit + git push
4. Railway e Vercel detectam o push automaticamente
5. Em ~2 minutos está no ar
```

---

## Migrations no banco de produção (pendente)

Após o backend estar estável, rodar no Railway Shell (serviço backend):
```
alembic upgrade head
```

Isso cria todas as tabelas no MySQL de produção.
