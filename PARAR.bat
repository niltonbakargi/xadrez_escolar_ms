@echo off
title Encerrar Xadrez Escolar

echo.
echo  Encerrando a plataforma...
echo.

taskkill /FI "WINDOWTITLE eq Backend - Xadrez Escolar" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend - Xadrez Escolar" /T /F > nul 2>&1

echo  Plataforma encerrada.
echo.
pause
