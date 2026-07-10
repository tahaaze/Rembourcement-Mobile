@echo off
title Remboursement Mobile - Cloudflare
cd /d "%~dp0"

echo.
echo ========================================
echo   Remboursement Mobile - Cloudflare
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    pause
    exit /b 1
)

where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] cloudflared n'est pas installe ou pas encore dans le PATH.
    echo Fermez cette fenetre puis relancez run-cloudflare.bat.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installation des dependances...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERREUR] Echec de npm install
        pause
        exit /b 1
    )
)

if not exist "data\" mkdir data

echo Demarrage du serveur local...
start "Remboursement Serveur" cmd /c "cd /d %~dp0 && npm start"

echo Attente du serveur...
timeout /t 4 /nobreak >nul

echo.
echo Creation du lien Cloudflare...
echo Copiez le lien qui finit par .trycloudflare.com
echo.
echo Appuyez sur Ctrl+C pour arreter le tunnel.
echo.

cloudflared tunnel --url http://localhost:3000

pause
