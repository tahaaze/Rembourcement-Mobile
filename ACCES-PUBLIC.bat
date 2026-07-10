@echo off
title Remboursement - Lien Public
cd /d "%~dp0"

echo.
echo ========================================
echo   Creation du lien public...
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
)

if not exist ".env" (
    call node setup.js --auto
)

if not exist "data\" mkdir data

echo Demarrage du serveur et creation du lien public...
echo Patientez quelques secondes...
echo.
echo Appuyez sur Ctrl+C pour arreter.
echo.

call npm run public

pause
