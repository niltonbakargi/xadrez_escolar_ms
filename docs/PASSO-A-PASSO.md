# Passo a Passo — Plataforma de Xadrez Escolar

> Guia completo de instalação e configuração no Windows com XAMPP.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalando o Python](#2-instalando-o-python)
3. [Instalando o Node.js](#3-instalando-o-nodejs)
4. [Instalando o PostgreSQL](#4-instalando-o-postgresql)
5. [Instalando o Redis](#5-instalando-o-redis)
6. [Baixando o Stockfish](#6-baixando-o-stockfish)
7. [Configurando o Backend](#7-configurando-o-backend)
8. [Configurando o Banco de Dados](#8-configurando-o-banco-de-dados)
9. [Configurando o lichess](#9-configurando-o-lichess)
10. [Configurando o Frontend](#10-configurando-o-frontend)
11. [Rodando o Projeto](#11-rodando-o-projeto)
12. [Verificando se Tudo Funciona](#12-verificando-se-tudo-funciona)
13. [Criando o Primeiro Usuário](#13-criando-o-primeiro-usuário)
14. [Fluxo de Uso Diário](#14-fluxo-de-uso-diário)
15. [Solução de Problemas](#15-solução-de-problemas)

---

## 1. Pré-requisitos

Você vai precisar instalar os programas abaixo. Cada um tem link e instruções.

| Programa | Versão mínima | Para quê serve |
|----------|--------------|----------------|
| Python | 3.11 | Rodar o backend (FastAPI) |
| Node.js | 20 | Rodar o frontend (React) |
| XAMPP (MySQL) | qualquer | Banco de dados — já incluso no XAMPP |
| Redis | 7 | Fila de análise de partidas |
| Git | qualquer | Versionar o código |

---

## 2. Instalando o Python

### 2.1 Baixar

Acesse **python.org/downloads** e baixe a versão **3.11** ou superior.

### 2.2 Instalar

Durante a instalação, **marque obrigatoriamente a opção:**

```
☑ Add Python to PATH
```

Sem isso, o Python não funcionará no terminal.

### 2.3 Verificar

Abra o **Prompt de Comando** (Win + R → `cmd`) e digite:

```bash
python --version
```

Deve aparecer algo como `Python 3.11.9`.

---

## 3. Instalando o Node.js

### 3.1 Baixar

Acesse **nodejs.org** e baixe a versão **LTS** (Long Term Support).

### 3.2 Instalar

Clique em "Next" em todas as telas — sem configurações especiais.

### 3.3 Verificar

```bash
node --version
npm --version
```

Deve aparecer algo como `v20.x.x` e `10.x.x`.

---

## 4. Instalando o PostgreSQL

### 4.1 Baixar

Acesse **postgresql.org/download/windows** e baixe o instalador.

### 4.2 Instalar

Durante a instalação:
- **Senha do superusuário:** anote bem — você precisará dela depois
- **Porta:** mantenha `5432` (padrão)
- **Locale:** pode deixar o padrão

### 4.3 Criar o banco de dados

Após instalar, abra o **pgAdmin** (instalado junto com o PostgreSQL) ou use o terminal:

```bash
# Abra o SQL Shell (psql) que foi instalado junto
# e execute:
CREATE DATABASE xadrez_escolar;
CREATE USER xadrez WITH PASSWORD 'xadrez123';
GRANT ALL PRIVILEGES ON DATABASE xadrez_escolar TO xadrez;
```

> Anote o usuário e senha — você vai usá-los no arquivo `.env`.

### 4.4 Verificar

```bash
psql -U xadrez -d xadrez_escolar -c "\conninfo"
```

---

## 5. Instalando o Redis

O Redis é usado para processar as análises de partidas em segundo plano (sem travar a tela do aluno enquanto o Stockfish trabalha).

### 5.1 No Windows

O Redis não tem suporte oficial nativo no Windows. Use o **WSL** (recomendado) ou o **Memurai** (alternativa gratuita para Windows).

**Opção A — WSL (recomendada):**

1. Abra o PowerShell como administrador e execute:
   ```powershell
   wsl --install
   ```
2. Reinicie o computador
3. Abra o Ubuntu (que foi instalado) e execute:
   ```bash
   sudo apt update
   sudo apt install redis-server -y
   sudo service redis-server start
   ```

**Opção B — Memurai (mais simples):**

Acesse **memurai.com** e baixe a versão gratuita Developer Edition.

### 5.2 Verificar

```bash
redis-cli ping
```

Deve responder `PONG`.

---

## 6. Baixando o Stockfish

O Stockfish é o motor de análise — ele examina cada lance da partida.

### 6.1 Baixar

Acesse **stockfishchess.org/download** e baixe a versão para **Windows 64-bit**.

### 6.2 Instalar

Descompacte o arquivo baixado. Dentro haverá um executável chamado `stockfish-windows-x86-64.exe` (ou similar).

### 6.3 Copiar para o projeto

Coloque o executável na pasta:

```
treinamento de xadrez/
└── stockfish/
    └── engines/
        └── stockfish.exe      ← copie aqui e renomeie para stockfish.exe
```

> O caminho exato no seu caso será:
> `C:\xampp\htdocs\treinamento de xadrez\stockfish\engines\stockfish.exe`

---

## 7. Configurando o Backend

### 7.1 Abrir o terminal na pasta do projeto

No Windows Explorer, navegue até:
```
C:\xampp\htdocs\treinamento de xadrez\backend
```

Clique na barra de endereço, digite `cmd` e pressione Enter.
Isso abre o terminal já dentro da pasta correta.

### 7.2 Criar o ambiente virtual Python

```bash
python -m venv venv
```

Isso cria uma pasta `venv` com Python isolado para o projeto.

### 7.3 Ativar o ambiente virtual

```bash
venv\Scripts\activate
```

O terminal deve mostrar `(venv)` no início da linha. Isso confirma que está ativado.

> Você precisará fazer isso **toda vez** que abrir um novo terminal para trabalhar no backend.

### 7.4 Instalar as dependências

```bash
pip install -r requirements.txt
```

Isso pode levar alguns minutos. Você verá vários pacotes sendo baixados.

### 7.5 Criar o arquivo de configuração

```bash
copy .env.example .env
```

Agora **abra o arquivo `.env`** com o Bloco de Notas e preencha:

```env
# Segurança — gere uma chave aleatória
SECRET_KEY=cole-uma-sequencia-de-50-caracteres-aleatorios-aqui

# Banco de dados — use os dados que você criou no passo 4
DATABASE_URL=postgresql+asyncpg://xadrez:xadrez123@localhost:5432/xadrez_escolar

# lichess — você vai pegar no passo 9
LICHESS_API_TOKEN=lip_SeuTokenAqui

# Stockfish
STOCKFISH_PATH=../stockfish/engines/stockfish.exe
STOCKFISH_DEPTH=18

# Redis
REDIS_URL=redis://localhost:6379/0
```

**Como gerar a SECRET_KEY:**

Abra um novo terminal com o ambiente virtual ativo e execute:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copie o resultado e cole no `.env`.

---

## 8. Configurando o Banco de Dados

### 8.1 Inicializar o Alembic (sistema de migrações)

Com o terminal dentro da pasta `backend` e o ambiente virtual ativo:

```bash
alembic init alembic
```

### 8.2 Configurar o Alembic

Abra o arquivo `alembic/env.py` e **substitua** as linhas de configuração do target_metadata:

```python
# Adicione estas importações no topo
from app.core.config import settings
from app.db.base import Base
from app.models import user, school, game, progress  # importa todos os modelos

# Encontre a linha:
target_metadata = None
# E substitua por:
target_metadata = Base.metadata

# Encontre a linha:
# connstr = config.get_main_option("sqlalchemy.url")
# E substitua por:
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", ""))
```

### 8.3 Criar as tabelas

```bash
alembic revision --autogenerate -m "tabelas iniciais"
alembic upgrade head
```

Se tudo correr bem, verá a mensagem `Running upgrade ... -> ...`.

### 8.4 Verificar as tabelas criadas

No pgAdmin ou no psql:
```sql
\dt
```

Deve listar: `users`, `schools`, `classes`, `enrollments`, `games`, `game_analyses`, `puzzles`, `player_profiles`, `certificates`, `game_diaries`, `screen_time_logs`.

---

## 9. Configurando o lichess

O lichess é onde os alunos jogam. A plataforma se conecta ao lichess para buscar as partidas e puzzles automaticamente.

### 9.1 Criar conta no lichess

Acesse **lichess.org** e crie uma conta para o projeto (ex: `xadrez-escolar-campogrande`).

### 9.2 Gerar o token de API

1. Acesse **lichess.org/account/oauth/token**
2. Clique em **"Generate a personal access token"**
3. Dê um nome ao token: `plataforma-xadrez-escolar`
4. Marque as permissões:
   - `Read preferences`
   - `Read game history`
   - `Read puzzle history`
   - `Create tournaments`
   - `Manage teams`
5. Clique em **"Generate"**
6. **Copie o token gerado** (começa com `lip_...`) — ele aparece só uma vez

Cole no seu arquivo `.env`:
```env
LICHESS_API_TOKEN=lip_SeuTokenGeradoAqui
```

### 9.3 Criar um Time no lichess

1. Acesse **lichess.org/team/new**
2. Crie o time: ex: `Xadrez Escolar Campo Grande`
3. Anote o ID do time (aparece na URL: `lichess.org/team/xadrez-escolar-campo-grande`)

Os alunos vão entrar nesse time para participar de torneios e sessões de jogo.

---

## 10. Configurando o Frontend

### 10.1 Abrir o terminal na pasta do frontend

```
C:\xampp\htdocs\treinamento de xadrez\frontend
```

Clique na barra de endereço do Explorer, digite `cmd`, Enter.

### 10.2 Instalar as dependências

```bash
npm install
```

Isso cria a pasta `node_modules` e pode levar alguns minutos.

### 10.3 Criar o arquivo de variáveis de ambiente

Crie um arquivo chamado `.env.local` dentro da pasta `frontend`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 11. Rodando o Projeto

Você precisará de **3 terminais abertos ao mesmo tempo**.

### Terminal 1 — Backend (API)

```bash
# Entre na pasta backend
cd "C:\xampp\htdocs\treinamento de xadrez\backend"

# Ative o ambiente virtual
venv\Scripts\activate

# Inicie o servidor
uvicorn app.main:app --reload --port 8000
```

Você verá:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Terminal 2 — Worker (análise em background)

```bash
cd "C:\xampp\htdocs\treinamento de xadrez\backend"
venv\Scripts\activate

# Inicie o worker de análise
celery -A app.worker worker --loglevel=info --pool=solo
```

> O `--pool=solo` é necessário no Windows por limitações do Celery.

### Terminal 3 — Frontend

```bash
cd "C:\xampp\htdocs\treinamento de xadrez\frontend"

npm run dev
```

Você verá:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Acessar a plataforma

Abra o navegador e acesse:

| Área | Endereço |
|------|---------|
| Plataforma (frontend) | http://localhost:5173 |
| API (documentação) | http://localhost:8000/docs |
| API (alternativa) | http://localhost:8000/redoc |

---

## 12. Verificando se Tudo Funciona

### 12.1 Backend

Acesse **http://localhost:8000** no navegador.

Deve aparecer:
```json
{"status": "online", "plataforma": "Xadrez Escolar"}
```

### 12.2 Documentação da API

Acesse **http://localhost:8000/docs**

Você verá a documentação interativa de todos os endpoints. Isso confirma que o backend está no ar.

### 12.3 Banco de dados

Na documentação da API (http://localhost:8000/docs), clique em qualquer endpoint e tente executá-lo. Se não der erro de conexão com o banco, está funcionando.

### 12.4 lichess

No terminal do backend, observe os logs. Se aparecer erro com `LICHESS_API_TOKEN`, revise o token no `.env`.

### 12.5 Frontend

Acesse **http://localhost:5173**

Deve aparecer a tela de login com a mensagem:
> "O rating é um espelho do raciocínio."

---

## 13. Criando o Primeiro Usuário

Como o sistema de autenticação ainda está em desenvolvimento (a rota `/api/auth/login` retorna 501), você pode criar o primeiro usuário diretamente no banco de dados.

### 13.1 Gerar o hash da senha

No terminal com o ambiente virtual ativo:

```bash
python -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print(ctx.hash('senha123'))"
```

Copie o resultado (começa com `$2b$12$...`).

### 13.2 Inserir no banco

No psql ou pgAdmin, execute:

```sql
INSERT INTO users (name, email, hashed_password, role, lgpd_consent, is_active)
VALUES (
  'Professor Fulano',
  'professor@escola.com',
  '$2b$12$SeuHashGeradoAqui',
  'teacher',
  true,
  true
);
```

---

## 14. Fluxo de Uso Diário

### Para o professor

**Antes da aula:**
1. Acesse http://localhost:5173/professor
2. Verifique o dashboard da turma — quem evoluiu, quem precisa de atenção
3. Veja a revisão semanal — os erros mais graves da semana anterior

**Durante a aula:**
1. Os alunos acessam http://localhost:5173/aluno
2. Jogam partidas ou resolvem puzzles no lichess
3. A sincronização puxa as partidas automaticamente

**Após a aula:**
1. Os alunos preenchem o Diário do Jogador
2. O sistema de análise (Stockfish) processa as partidas em background
3. O Mapa do Jogo é atualizado automaticamente

**Ao final do mês:**
1. Acesse o endpoint de relatório para gerar o PDF da turma
2. Envie para a coordenação da escola

### Para o aluno

1. Acessa a plataforma → vê sua evolução pessoal (nunca ranking comparativo)
2. Joga no lichess (link direto no time da escola)
3. Resolve puzzles
4. Escreve no Diário do Jogador
5. Acompanha seu Mapa do Jogo — onde estão os erros

---

## 15. Solução de Problemas

### "python não é reconhecido como comando"

O Python não foi adicionado ao PATH durante a instalação.

**Solução:** Desinstale o Python e reinstale marcando a opção `Add Python to PATH`.

---

### "pip install falhou com erro de compilação"

Alguns pacotes precisam de compiladores C.

**Solução:**
```bash
pip install --upgrade pip wheel setuptools
pip install -r requirements.txt
```

Se ainda falhar, instale o [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

---

### "Cannot connect to database"

O PostgreSQL não está rodando ou as credenciais estão erradas.

**Verificar:**
1. Abra o pgAdmin — o servidor está verde?
2. Confirme as credenciais no `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://USUARIO:SENHA@localhost:5432/xadrez_escolar
   ```
3. Verifique se o banco `xadrez_escolar` foi criado

---

### "redis.exceptions.ConnectionError"

O Redis não está rodando.

**No WSL:**
```bash
sudo service redis-server start
redis-cli ping  # deve responder PONG
```

**No Memurai:** verifique se o serviço está iniciado no Windows Services.

---

### "stockfish: executable not found"

O executável do Stockfish não está no caminho correto.

**Verificar:**
1. O arquivo existe em `stockfish/engines/stockfish.exe`?
2. O caminho no `.env` está correto?
   ```
   STOCKFISH_PATH=../stockfish/engines/stockfish.exe
   ```
3. No Windows, o executável deve ter extensão `.exe`

---

### "lichess API: 401 Unauthorized"

O token do lichess é inválido ou expirou.

**Solução:** Gere um novo token em lichess.org/account/oauth/token e atualize o `.env`.

---

### A página do frontend aparece em branco

Abra o console do navegador (F12 → Console) e verifique o erro.

**Causa mais comum:** o backend não está rodando. Verifique o Terminal 1.

---

### npm install falhou

```bash
npm cache clean --force
npm install
```

---

## Atalhos Úteis

| Ação | Comando |
|------|---------|
| Ver logs do backend em tempo real | Terminal 1 — os logs aparecem automaticamente |
| Reiniciar o backend | Ctrl+C no Terminal 1, depois `uvicorn app.main:app --reload` |
| Ver todas as tabelas do banco | psql → `\dt` |
| Testar um endpoint da API | http://localhost:8000/docs |
| Parar todos os serviços | Ctrl+C em cada terminal |

---

## Estrutura de Pastas — Referência Rápida

```
treinamento de xadrez/
├── backend/
│   ├── .env                    ← suas credenciais (nunca commitar)
│   ├── app/
│   │   ├── main.py             ← ponto de entrada da API
│   │   ├── core/config.py      ← todas as configurações
│   │   ├── models/             ← estrutura do banco de dados
│   │   ├── services/           ← Stockfish, lichess, PDF
│   │   └── api/routes/         ← endpoints da API
│   └── alembic/                ← migrações do banco
├── frontend/
│   ├── src/pages/              ← telas (aluno, professor, gestão)
│   └── src/services/api.ts     ← conexão com o backend
├── stockfish/engines/          ← executável do Stockfish
└── docs/                       ← documentação e checklists
```

---

*Plataforma de Xadrez Escolar — desenvolvida para escolas públicas de Campo Grande, MS.*
*Stack 100% open source: FastAPI · React · PostgreSQL · Stockfish · lichess*
