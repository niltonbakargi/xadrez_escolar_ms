# Plataforma de Treinamento de Xadrez Online
**Documento Executivo + Plano de Desenvolvimento**

> Xadrez como ferramenta de desenvolvimento cognitivo, autonomia e superação pessoal

**Versão:** 1.0 | **Data:** 2025 | **Autor:** Professor de Educação Física

---

# PARTE 1 — O PROJETO

## 1. Sumário Executivo

Este documento descreve a concepção e o plano de desenvolvimento de uma plataforma digital profissional para treinamento de xadrez escolar, idealizada por um professor de Educação Física com experiência na rede pública de ensino de Campo Grande, MS.

A plataforma não é apenas uma ferramenta de xadrez — é um sistema de desenvolvimento cognitivo que usa o jogo como espelho do raciocínio. O diferencial central é uma filosofia pedagógica onde o adversário principal de cada aluno é ele mesmo: o objetivo é sempre superar o próprio desempenho anterior, não o do colega.

A solução é construída sobre ferramentas open source consolidadas — Stockfish, python-chess e lichess — com uma camada de gestão, identidade visual e metodologia pedagógica exclusivas, desenvolvida para atender secretarias de educação, escolas públicas e privadas.

---

## 2. Visão e Filosofia Pedagógica

### 2.1 O xadrez como medidor de raciocínio

O rating no xadrez não é um troféu — é um espelho do raciocínio. Ele mede até onde o jogador consegue ir antes que a mente cometa um erro. E o inimigo quase nunca é o adversário: é o próprio padrão de erro que se repete.

Essa percepção, que vem da experiência prática do jogo, transforma o xadrez em uma ferramenta pedagógica única: ele registra os padrões de pensamento do aluno com uma precisão que nenhuma prova escolar consegue. Um aluno que comete sempre o mesmo tipo de erro no tabuleiro provavelmente repete o mesmo padrão em matemática, em leitura, em decisões cotidianas.

### 2.2 Modelo de superação pessoal

A plataforma é construída sobre o princípio da motivação intrínseca por maestria — conceito consolidado na psicologia do esporte. Sempre existirá alguém melhor. O que importa é ser melhor a cada dia.

Na prática, isso significa que o sistema nunca exibe ao aluno sua posição no ranking geral. Exibe sua evolução: quantos pontos progrediu este mês, quantos puzzles a mais resolveu esta semana, qual seu melhor desempenho em aberturas. A comparação é sempre com o histórico do próprio aluno.

Alunos que desenvolvem motivação intrínseca abandonam menos, evoluem mais consistentemente e desenvolvem uma relação mais saudável com o erro e a derrota — habilidades transferíveis para todas as áreas da vida.

### 2.3 Conexão com a Educação Física e a BNCC

O projeto nasce da formação em Educação Física, que traz conceitos fundamentais: planejamento estratégico sob pressão, tomada de decisão, leitura de padrões e gestão emocional em situações competitivas. Essas são as mesmas competências desenvolvidas no esporte de alto rendimento.

Pedagogicamente, a proposta se alinha diretamente às competências da BNCC: desenvolvimento de autonomia, autoconhecimento, pensamento crítico e superação pessoal — com justificativa técnica sólida para qualquer secretaria de educação.

---

## 3. Público-alvo e Modelo de Operação

| | |
|---|---|
| **Público principal** | Escolas públicas e privadas, secretarias municipais e estaduais de educação |
| **Perfil do aluno** | Crianças e adolescentes do Ensino Fundamental e Médio |
| **Modelo de receita** | Contratos de treinamento esportivo com escolas e secretarias |
| **Plataforma** | Gratuita para acesso — receita via horas de treinamento presencial/online |
| **Abrangência inicial** | Campo Grande, MS — expansão progressiva |

A plataforma funciona como vitrine profissional e ferramenta de gestão do treinamento. O professor não vende assinatura — usa a plataforma para validar sua metodologia, demonstrar resultados e conquistar contratos com instituições de ensino.

---

## 4. Funcionalidades da Plataforma

### 4.1 Área do aluno

- Tabuleiro interativo integrado via lichess (puzzles, partidas, estudos)
- Painel de evolução pessoal — rating, partidas jogadas, puzzles resolvidos
- Sistema de níveis progressivos: **Peão → Cavalo → Bispo → Torre → Dama → Rei**
- Certificado digital ao concluir cada nível ou módulo
- Diário do jogador — reflexão rápida após cada sessão
- Desafio da semana — puzzle especial com ranking dentro do grupo
- Monitoramento de tempo de tela com avisos de pausa por faixa etária

### 4.2 Mapa do jogo — análise estatística

O diferencial técnico mais poderoso da plataforma. Usando Stockfish + python-chess, o sistema analisa cada partida do aluno e gera automaticamente:

- Identificação de erros por fase — abertura, meio-jogo, final
- Classificação por tipo — erro grave, imprecisão, oportunidade perdida
- Análise por peça envolvida no erro
- Padrões de erro recorrentes — o sistema identifica a tendência, não o erro isolado
- Evolução temporal — o mesmo mapa semana a semana, mostrando progresso real
- **Impressão digital do jogador** — perfil único com abertura favorita, peça mais perdida, fase mais forte

### 4.3 Área do professor

- Dashboard de turmas — todos os alunos com evolução de rating e engajamento
- Sessão de revisão semanal — sistema separa automaticamente as 3 piores jogadas de cada aluno
- Criação de aulas com IA — professor descreve o tema e a IA monta posições, comentários e puzzles
- Relatório mensal automático para a escola — gerado em PDF com identidade do projeto

### 4.4 Área da gestão (secretaria/escola)

- Visão consolidada de todas as turmas e escolas
- Indicadores de engajamento e evolução por escola
- Exportação de relatórios no formato da rede de ensino
- Integração com Google Classroom e Moodle

---

## 5. Conformidade Legal

### 5.1 LGPD — Lei Geral de Proteção de Dados

- Consentimento via autorização física assinada pelo responsável, arquivada pela escola
- Email e contato cadastrados são do responsável legal, não do aluno
- Coleta mínima e com finalidade específica — apenas dados necessários ao treinamento
- Direito de exclusão dos dados a qualquer momento pelo responsável
- Política de privacidade em linguagem clara e acessível

### 5.2 ECA e Lei Fléxa (Lei 14.460/2022)

- Uso de imagem do aluno somente com autorização específica e separada
- Chat desligado na versão inicial — comunicação mediada pelo professor em sala
- Ambiente seguro sem contato com usuários externos à turma
- Monitoramento de tempo de tela com limites por faixa etária
- Todas as interações registradas e auditáveis

---

## 6. Tecnologia — Stack Open Source

A plataforma é construída 100% sobre ferramentas gratuitas e open source, sem dependência de licenças proprietárias:

| Componente | Ferramenta | Função |
|---|---|---|
| Motor de xadrez | Stockfish | Análise de partidas, avaliação de lances, geração de puzzles |
| Biblioteca Python | python-chess | Interface com Stockfish, leitura de PGN, classificação de erros |
| Plataforma de jogo | lichess.org + API | Tabuleiro, partidas, puzzles, times, torneios |
| Backend | FastAPI (Python) | API da plataforma, integração lichess, processamento de dados |
| Banco de dados | PostgreSQL | Cadastro de alunos, histórico, estatísticas |
| Visualização | Plotly | Gráficos interativos do mapa do jogo |
| Frontend | React + Tailwind | Interface web responsiva |
| IA pedagógica (fase 2) | Ollama + Llama 3 | Criação de aulas, feedback em português |
| PDF de relatórios | ReportLab | Geração automática de relatórios mensais |

---

## 7. Roadmap — Fases do Projeto

### Fase 1 — Piloto (Meses 1 a 4)

- Seleção de 2 a 3 escolas em Campo Grande para projeto piloto
- Configuração do lichess com times e estudos da rede
- Formação dos professores condutores
- 1 aula por semana — 8 encontros por turma
- Torneio interno entre as escolas ao final — gera engajamento e visibilidade
- Coleta de dados e relatório para a secretaria

### Fase 2 — Plataforma base (Meses 5 a 8)

- Desenvolvimento do portal web com identidade visual do projeto
- Integração com API do lichess — painel do aluno e dashboard do professor
- Sistema de níveis e certificados digitais
- Mapa do jogo — análise estatística com Stockfish e python-chess
- Monitoramento de tempo de tela
- Formulário de cadastro com conformidade LGPD

### Fase 3 — IA pedagógica (Meses 9 a 12)

- Integração do Ollama + Llama 3 para criação assistida de aulas
- Sessão de revisão semanal automatizada
- Relatórios mensais em PDF gerados automaticamente
- Expansão para novas escolas e municípios

---

## 8. Diferenciais Competitivos

O que nenhuma plataforma de xadrez do mercado oferece:

| Diferencial | Descrição |
|---|---|
| **Metodologia pedagógica** | Criada por professor de Educação Física com experiência dentro da secretaria de educação — une o olhar esportivo, pedagógico e administrativo |
| **Filosofia de superação pessoal** | O aluno compete contra si mesmo. O sistema nunca exibe ranking comparativo — exibe evolução individual |
| **Mapa do jogo** | Análise estatística automática dos padrões de erro de cada aluno — não o erro isolado, mas a tendência |
| **Conformidade legal completa** | LGPD, ECA e Lei Fléxa considerados desde o design — essencial para contratos com o setor público |
| **100% open source** | Sem licenças proprietárias, sem dependência de fornecedores, custo operacional mínimo |
| **Integração institucional** | Relatórios no formato da rede, integração com Google Classroom e Moodle |

---

---

# PARTE 2 — PLANO DE DESENVOLVIMENTO

> Baseado na análise completa do código em 26/04/2026

---

## Estado Atual do Código

| Componente | Status |
|---|---|
| Infraestrutura FastAPI | Pronto |
| Modelos de banco de dados (11 tabelas) | Pronto |
| Serviço de análise Stockfish | Pronto |
| Gerador de PDF (ReportLab) | Pronto |
| Cliente Lichess (puzzle diário + perfil) | Parcial |
| Endpoints da API (auth, alunos, professores, admin) | Esqueleto |
| Frontend (roteamento + tela de login) | Parcial |
| Páginas do frontend | Esqueleto |
| Docker | Conflito de banco de dados |

**Problema crítico:** o `docker-compose.yml` usa PostgreSQL, mas o `config.py` aponta para MySQL (XAMPP). Precisa ser resolvido antes de qualquer outra etapa.

---

## O que já está pronto e não precisa ser construído

- Modelos de banco de dados (11 tabelas completas)
- Serviço de análise com Stockfish (`analyze_pgn`, classificação de lances, detecção de padrões)
- Gerador de PDF com ReportLab
- Cliente Lichess (busca de usuário, partidas, puzzle diário)
- Infraestrutura FastAPI (CORS, JWT, bcrypt, Pydantic)
- Roteamento completo do frontend (11 páginas)
- Interceptor de token no Axios
- Store de autenticação com Zustand

---

## Etapa 0 — Corrigir a base

**Objetivo:** ambiente funciona de ponta a ponta antes de qualquer código novo.

- [ ] Decidir: MySQL (XAMPP local) ou PostgreSQL (Docker)
- [ ] Alinhar `config.py` e `docker-compose.yml` com o banco escolhido
- [ ] Criar o banco e rodar as migrations do Alembic
- [ ] Confirmar que `GET /` retorna `{"status": "ok"}`
- [ ] Instalar dependências do frontend (`npm install`)
- [ ] Confirmar que o frontend sobe em `localhost:5173`

---

## Etapa 1 — Autenticação

**Objetivo:** qualquer usuário consegue fazer login e receber um token JWT válido.

### Backend
- [ ] `POST /api/auth/login` — buscar usuário no banco, verificar senha (bcrypt), retornar JWT
- [ ] `POST /api/auth/register` — cadastro de alunos com campos de consentimento LGPD
- [ ] Dependência `get_current_user` — decodifica o JWT e retorna o usuário autenticado
- [ ] Proteger todas as rotas existentes com essa dependência

### Frontend
- [ ] Conectar formulário de login ao endpoint real
- [ ] Salvar token no `authStore` (Zustand) após login
- [ ] Redirecionar para o dashboard correto por papel (aluno / professor / admin)
- [ ] Implementar logout (limpar token + redirecionar)

**Critério de conclusão:** professor e aluno conseguem fazer login e ver o dashboard.

---

## Etapa 2 — Importar partidas do Lichess

**Objetivo:** as partidas do aluno entram no banco automaticamente.

### Backend
- [ ] `POST /api/lichess/sync/{student_id}` — buscar partidas via API Lichess e salvar no banco
- [ ] Armazenar PGN, resultado, adversário, data, rating na tabela `games`
- [ ] Evitar duplicatas (checar `lichess_game_id` antes de inserir)

### Frontend
- [ ] Botão "Sincronizar partidas" no dashboard do aluno
- [ ] Listar partidas importadas

**Critério de conclusão:** aluno clica em sincronizar e suas partidas aparecem na tela.

---

## Etapa 3 — Mapa do Jogo (Análise Stockfish)

**Objetivo:** o Stockfish analisa cada partida e gera o perfil de erros do aluno.

### Backend
- [ ] `POST /api/analysis/games/{game_id}/analyze` — acionar `analyze_pgn()` (serviço já implementado)
- [ ] Salvar resultado em `game_analyses` (erros por fase, classificação dos lances)
- [ ] `GET /api/analysis/students/{student_id}/game-map` — agregar análises por fase
- [ ] `GET /api/analysis/students/{student_id}/fingerprint` — impressão digital (abertura favorita, peça mais perdida, fase mais forte, padrão recorrente)
- [ ] Rodar análise em background com Celery (não travar a requisição)

### Frontend
- [ ] Gráfico de acurácia por fase (abertura / meio-jogo / final) com Plotly
- [ ] Seção "Impressão digital" do jogador
- [ ] Loading state enquanto a análise roda

**Critério de conclusão:** aluno vê seu mapa de erros após sincronizar partidas.

---

## Etapa 4 — Dashboard do Aluno

**Objetivo:** o aluno enxerga sua evolução pessoal — nunca ranking comparativo.

### Backend
- [ ] `GET /api/students/me/profile` — nome, nível atual, rating, lichess username
- [ ] `GET /api/students/me/puzzles` — puzzles resolvidos e histórico
- [ ] `GET /api/students/me/diary` — listar entradas do diário
- [ ] `POST /api/students/me/diary` — salvar reflexão pós-sessão
- [ ] `GET /api/students/me/certificates` — listar certificados conquistados

### Frontend
- [ ] Cards do dashboard conectados a dados reais (rating, partidas, puzzles)
- [ ] Formulário do diário funcionando
- [ ] Lista de certificados
- [ ] Barra de progresso de nível (Peão → Rei)

**Critério de conclusão:** aluno vê dados reais, sem nenhum placeholder.

---

## Etapa 5 — Dashboard do Professor

**Objetivo:** o professor monitora todas as suas turmas e alunos.

### Backend
- [ ] `GET /api/teachers/classes` — listar turmas do professor autenticado
- [ ] `GET /api/teachers/classes/{class_id}/students` — alunos com rating e engajamento
- [ ] `GET /api/teachers/classes/{class_id}/weekly-review` — 3 piores jogadas de cada aluno na semana
- [ ] `POST /api/teachers/classes/{class_id}/lesson` — registrar aula realizada

### Frontend
- [ ] Lista de turmas com número de alunos e média de rating
- [ ] Tela de alunos da turma com indicadores individuais
- [ ] Tela de revisão semanal com as jogadas para analisar em aula

**Critério de conclusão:** professor abre o dashboard e vê todos os alunos com dados reais.

---

## Etapa 6 — Relatórios em PDF

**Objetivo:** geração automática do relatório mensal para a escola.

### Backend
- [ ] `GET /api/reports/classes/{class_id}/monthly` — acionar `generate_monthly_report()` (já implementado) e retornar o arquivo
- [ ] `GET /api/reports/students/{student_id}/progress` — relatório individual do aluno

### Frontend
- [ ] Botão "Gerar relatório PDF" no dashboard do professor
- [ ] Download automático do arquivo

**Critério de conclusão:** professor clica e recebe o PDF para entregar à escola.

---

## Etapa 7 — Área de Gestão (Admin)

**Objetivo:** visão consolidada para secretaria ou gestão da rede.

### Backend
- [ ] `GET /api/admin/schools` — listar escolas
- [ ] `POST /api/admin/schools` — cadastrar nova escola
- [ ] `GET /api/admin/schools/{school_id}/metrics` — indicadores por escola
- [ ] `GET /api/admin/dashboard` — visão geral da rede
- [ ] `GET /api/admin/export` — exportar dados em CSV

### Frontend
- [ ] Tela de escolas com indicadores
- [ ] Dashboard consolidado com gráficos Plotly
- [ ] Exportação CSV

**Critério de conclusão:** gestor vê indicadores consolidados de todas as escolas.

---

## Etapa 8 — Conformidade Legal e Segurança

**Objetivo:** LGPD, ECA e Lei Fléxa garantidos em toda a plataforma.

- [ ] Tela de cadastro com checkbox de consentimento LGPD (responsável legal)
- [ ] Controle de tempo de tela: registrar sessões e emitir alertas por faixa etária
- [ ] Dados de alunos menores nunca expostos publicamente
- [ ] Endpoint de exclusão de dados (direito de apagamento)
- [ ] Auditoria: todas as ações registradas com timestamp

---

## Etapa 9 — Puzzles e Desafio da Semana

**Objetivo:** integração completa com o Lichess para puzzles.

### Backend
- [ ] Conectar `GET /api/lichess/puzzle/daily` ao frontend (endpoint já funciona)
- [ ] Lógica de "desafio da semana" — puzzle especial por turma
- [ ] Registrar puzzles resolvidos no banco

### Frontend
- [ ] Página de puzzles com tabuleiro interativo (react-chessboard)
- [ ] Ranking do desafio da semana dentro da turma (único ranking comparativo permitido)

---

## Etapa 10 — Polimento e Piloto

**Objetivo:** plataforma pronta para as primeiras escolas de Campo Grande.

- [ ] Testes das rotas críticas (auth, sync, análise, relatórios)
- [ ] Revisão da identidade visual (cores, logo, tipografia)
- [ ] Responsividade mobile (alunos usam celular)
- [ ] Manual rápido para o professor
- [ ] Configurar domínio e deploy
- [ ] Onboarding das 2-3 escolas piloto

---

## Sequência de execução

```
Etapa 0  →  Banco de dados funcionando
Etapa 1  →  Login funcionando
Etapa 2  →  Partidas entrando no sistema
Etapa 3  →  Mapa do Jogo com Stockfish
Etapa 4  →  Dashboard do aluno com dados reais
Etapa 5  →  Dashboard do professor
Etapa 6  →  Relatório PDF
Etapa 7  →  Área admin
Etapa 8  →  Conformidade legal
Etapa 9  →  Puzzles
Etapa 10 →  Piloto nas escolas
```
