#!/usr/bin/env bash
# Setup inicial da plataforma — execute uma vez após clonar o repositório

set -e

echo "=== Plataforma de Xadrez Escolar — Setup ==="

# Backend
echo ""
echo "[1/4] Configurando backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
echo "  -> Edite backend/.env com suas credenciais antes de prosseguir."
deactivate
cd ..

# Stockfish
echo ""
echo "[2/4] Stockfish..."
echo "  -> Baixe o Stockfish em https://stockfishchess.org/download/"
echo "  -> Coloque o executável em: stockfish/engines/stockfish"

# Frontend
echo ""
echo "[3/4] Configurando frontend..."
cd frontend
npm install
cd ..

# Banco de dados
echo ""
echo "[4/4] Banco de dados..."
echo "  -> Certifique-se de que o PostgreSQL está rodando."
echo "  -> Execute: cd backend && alembic upgrade head"

echo ""
echo "=== Setup concluído ==="
echo "  Backend:  cd backend && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo "  Docker:   cd docker && docker compose up -d"
