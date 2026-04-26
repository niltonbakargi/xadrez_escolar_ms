@echo off
cd /d "C:\xampp\htdocs\treinamento de xadrez\backend"
python -m uvicorn app.main:app --reload --port 8000
pause
