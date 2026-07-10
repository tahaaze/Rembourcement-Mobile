@echo off
title Remboursement - Demarrage automatique
cd /d "%~dp0"

echo.
echo ========================================
echo   Page de Remboursement - Demarrage
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Telechargez-le sur https://nodejs.org
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
    echo.
)

if not exist ".env" (
    echo Premiere utilisation - configuration automatique...
    call node setup.js --auto
    echo.
)

if not exist "data\" mkdir data

echo Demarrage du serveur...
echo La page s'ouvrira automatiquement dans votre navigateur.
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur.
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
call npm start

pause
