@echo off
title Xadrez Escolar

echo.
echo  Iniciando Plataforma de Xadrez Escolar...
echo.

start "Backend - Xadrez Escolar" "C:\xampp\htdocs\treinamento de xadrez\scripts\start_backend.bat"

timeout /t 4 /nobreak > nul

start "Frontend - Xadrez Escolar" "C:\xampp\htdocs\treinamento de xadrez\scripts\start_frontend.bat"

timeout /t 6 /nobreak > nul

start "" http://localhost:5173

echo  Pronto! O navegador deve abrir em instantes.
echo  Feche as duas janelas para encerrar a plataforma.
echo.
pause
