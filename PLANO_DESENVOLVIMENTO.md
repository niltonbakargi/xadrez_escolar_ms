# Plano de Desenvolvimento — Plataforma de Xadrez Escolar

> Última atualização: 26/04/2026

---

## Estado Atual do Projeto

| Componente | Status |
|---|---|
| Infraestrutura FastAPI | ✅ Pronto |
| Modelos de banco de dados (11 tabelas) | ✅ Pronto |
| Serviço de análise Stockfish | ✅ Pronto |
| Gerador de PDF (ReportLab) | ✅ Pronto |
| Cliente Lichess (puzzle diário + partidas) | ✅ Pronto |
| Endpoints da API (auth, alunos, professores, análise, lichess, relatórios, admin) | ✅ Pronto |
| Frontend — todas as páginas | ✅ Pronto |
| Página de Puzzles (react-chessboard + Lichess) | ✅ Pronto |
| Banco MySQL criado e migrations rodadas | ✅ Pronto |
| Arquivo `.env` configurado | ✅ Pronto |
| Scripts de inicialização (`INICIAR.bat`) | ✅ Pronto |
| Cadastro e login funcionando | ⏳ Em validação |
| Docker | ⏸ Não priorizado — usando XAMPP local |

---

## Ambiente de desenvolvimento

**Banco de dados:** MySQL via XAMPP
- Nome do banco: `xadrez`
- Usuário: `root` (sem senha)
- Porta: `3306`

**Para subir a plataforma localmente:**
1. Abrir o XAMPP e garantir que o MySQL está verde (rodando)
2. Dar duplo clique em `INICIAR.bat` na raiz do projeto
3. Aguardar — o navegador abre automaticamente em `http://localhost:5173`

**Para subir manualmente (se o .bat falhar):**

Terminal 1 — Backend:
```
cd "C:\xampp\htdocs\treinamento de xadrez\backend"
python -m uvicorn app.main:app --reload --port 8000
```

Terminal 2 — Frontend:
```
cd "C:\xampp\htdocs\treinamento de xadrez\frontend"
npm run dev
```

**Documentação da API (Swagger):** http://localhost:8000/docs

---

## Correções aplicadas em 26/04/2026

### Enum `StudentLevel` — conflito MySQL
O modelo Python usava valores com acento (`"Peão"`, `"Cavalo"`) mas o MySQL armazenava
pelos nomes da chave (`"peao"`, `"cavalo"`). Isso causava erro 500 no cadastro.

**Solução:**
- Modelo corrigido para usar valores iguais às chaves (`peao`, `cavalo`...)
- Migration `5967cfac9bd2` reverteu o enum do banco para lowercase
- Frontend usa `LEVEL_LABEL` de `src/utils/levels.ts` para exibição amigável

### Página de Login — cadastro adicionado
- Adicionada aba "Cadastrar" com formulário completo
- Campos: nome, email, senha, perfil (Aluno/Professor), Lichess (opcional)
- Consentimento LGPD obrigatório para criar conta
- Após cadastro, redireciona direto para o dashboard do perfil escolhido

### Rota `/gestao/usuarios` — adicionada ao App.tsx
O componente `AdminUsers` existia mas não estava conectado ao roteador.

---

## Etapa 0 — Ambiente ✅ Concluída

- [x] Banco `xadrez` criado no MySQL
- [x] Migrations rodadas (`alembic upgrade head`) — 11 tabelas criadas
- [x] Arquivo `backend/.env` criado com `SECRET_KEY` e configurações
- [x] Backend sobe em `http://localhost:8000`
- [x] Frontend sobe em `http://localhost:5173`
- [x] Scripts `INICIAR.bat` e `PARAR.bat` criados

---

## Etapa 1 — Autenticação ✅ Concluída

### Backend
- [x] `POST /api/auth/login` — JWT via bcrypt
- [x] `POST /api/auth/register` — cadastro com consentimento LGPD
- [x] `GET /api/auth/me` — retorna usuário autenticado
- [x] `PATCH /api/auth/me` — atualiza perfil (nome, lichess username)
- [x] Dependência `get_current_user` — todas as rotas protegidas

### Frontend
- [x] Tela de login conectada ao endpoint real
- [x] Tela de cadastro com seletor de perfil e checkbox LGPD
- [x] Token salvo no `authStore` (Zustand) + localStorage
- [x] Redirecionamento por papel (aluno → `/aluno`, professor → `/professor`, admin → `/gestao`)
- [x] Logout implementado

---

## Etapa 2 — Importar partidas do Lichess ✅ Concluída

### Backend
- [x] `POST /api/lichess/sync` — sincroniza partidas do próprio aluno
- [x] `POST /api/lichess/sync/{student_id}` — professor sincroniza partidas de um aluno
- [x] PGN, resultado, abertura, cor, rating armazenados em `games`
- [x] Duplicatas evitadas via `lichess_game_id`

### Frontend
- [x] Botão "Sincronizar partidas" no dashboard do aluno
- [x] Mensagem de retorno com número de partidas importadas

> **Pendente:** configurar `LICHESS_API_TOKEN` real no `backend/.env`

---

## Etapa 3 — Análise das partidas (Mapa do Jogo) ✅ Concluída

### Backend
- [x] `POST /api/analysis/games/{game_id}/analyze` — análise Stockfish em background
- [x] `POST /api/analysis/students/{student_id}/analyze-all` — analisa todas as partidas pendentes
- [x] `GET /api/analysis/games/{game_id}/result` — resultado da análise
- [x] `GET /api/analysis/students/{student_id}/game-map` — mapa do jogo agregado
- [x] `GET /api/analysis/students/{student_id}/fingerprint` — impressão digital do jogador

### Frontend
- [x] Página "Mapa do Jogo" com acurácia por fase (abertura / meio / final)
- [x] Contagem de erros graves, erros e imprecisões
- [x] Impressão digital: abertura favorita, fase mais forte, peça mais envolvida em erros
- [x] Botão para disparar análise com loading state

> **Pendente:** Stockfish precisa estar instalado em `stockfish/engines/stockfish.exe`

---

## Etapa 4 — Dashboard do Aluno ✅ Concluída

### Backend
- [x] `GET /api/students/me/profile`
- [x] `GET /api/students/me/games`
- [x] `GET /api/students/me/puzzles`
- [x] `GET /api/students/me/diary` + `POST /api/students/me/diary`
- [x] `GET /api/students/me/certificates`

### Frontend
- [x] Dashboard com nível atual e barra de progresso (Peão → Rei)
- [x] Cards de evolução (partidas, puzzles, lichess username)
- [x] Diário do jogador com histórico e seletor de humor
- [x] Página de certificados conquistados

---

## Etapa 5 — Dashboard do Professor ✅ Concluída

### Backend
- [x] `GET /api/teachers/classes`
- [x] `GET /api/teachers/classes/{class_id}/students`
- [x] `GET /api/teachers/classes/{class_id}/weekly-review`
- [x] `POST /api/teachers/classes/{class_id}/lesson`

### Frontend
- [x] Dashboard com resumo de turmas e alunos
- [x] Listagem de turmas com detalhes por aluno
- [x] Revisão semanal com as 3 piores jogadas de cada aluno
- [x] Seletor de turma na revisão semanal

---

## Etapa 6 — Relatórios em PDF ✅ Concluída

### Backend
- [x] `GET /api/reports/classes/{class_id}/monthly` — relatório mensal da turma
- [x] `GET /api/reports/students/{student_id}/progress` — relatório individual

### Frontend
- [x] Botão de download PDF por turma
- [x] Botão de download PDF individual por aluno
- [x] Nota de conformidade LGPD na página

---

## Etapa 7 — Área de Gestão (Admin) ✅ Concluída

### Backend
- [x] `GET /api/admin/dashboard` — indicadores consolidados
- [x] `GET /api/admin/schools` + `POST /api/admin/schools`
- [x] `GET /api/admin/schools/{school_id}/metrics`
- [x] `POST /api/admin/classes`
- [x] `GET /api/admin/users`
- [x] `GET /api/admin/export` — exportação CSV

### Frontend
- [x] Dashboard admin com 6 indicadores da rede
- [x] Página de escolas com métricas e cadastro
- [x] Página de usuários com filtro e busca
- [x] Exportação CSV

---

## Etapa 8 — Conformidade Legal ✅ Parcialmente concluída

- [x] Checkbox de consentimento LGPD obrigatório no cadastro
- [x] Campo `lgpd_consent` e `image_consent` no banco
- [x] Tabela `screen_time_logs` criada
- [ ] Lógica de alerta de tempo de tela (a implementar)
- [ ] Endpoint de exclusão de dados do aluno (direito de apagamento)

---

## Etapa 9 — Puzzles ✅ Concluída

### Backend
- [x] `GET /api/lichess/puzzle/daily` — puzzle diário do Lichess

### Frontend
- [x] Tabuleiro interativo com `react-chessboard` e `chess.js`
- [x] Validação da solução lance a lance
- [x] Resposta automática do adversário
- [x] Feedback visual (correto / errado / recomeçar)
- [x] Orientação do tabuleiro automática (brancas ou pretas)

---

## Etapa 10 — Polimento e Piloto ⏳ Próxima

- [ ] Testar fluxo completo: cadastro → login → sincronizar → analisar → relatório
- [ ] Instalar Stockfish em `stockfish/engines/stockfish.exe`
- [ ] Configurar token real do Lichess no `.env`
- [ ] Responsividade mobile (alunos usam celular)
- [ ] Revisão da identidade visual (logo, cores finais)
- [ ] Deploy em VPS (configurar domínio e servidor)
- [ ] Onboarding das 2-3 escolas piloto de Campo Grande

---

## O que está pendente para o piloto funcionar

| Item | O que fazer |
|---|---|
| Token Lichess | Gerar em `lichess.org/account/oauth/token` e colocar no `backend/.env` |
| Stockfish | Baixar em `stockfishchess.org` e colocar em `stockfish/engines/stockfish.exe` |
| Primeiro admin | Cadastrar via `/api/auth/register` com `role: admin` direto na API (`localhost:8000/docs`) |
| Primeira escola | Criar via painel admin após login |
| Deploy | Contratar VPS (ex: Hostinger, DigitalOcean) e configurar |
