@echo off
title Creer un nouveau projet
cd /d "%~dp0"

echo.
echo ========================================
echo   Creer un nouveau projet
echo ========================================
echo.

set /p NOUVEAU_NOM="Nom du nouveau projet : "

if "%NOUVEAU_NOM%"=="" (
    echo Nom invalide.
    pause
    exit /b 1
)

set "DEST=..\%NOUVEAU_NOM%"

if exist "%DEST%" (
    echo Le dossier "%DEST%" existe deja.
    pause
    exit /b 1
)

echo Copie des fichiers...
xcopy /E /I /H "%CD%" "%DEST%" >nul

echo Nettoyage...
if exist "%DEST%\data\" rmdir /s /q "%DEST%\data"
if exist "%DEST%\LIEN-PUBLIC.txt" del "%DEST%\LIEN-PUBLIC.txt"
if exist "%DEST%\cloudflare-output.log" del "%DEST%\cloudflare-output.log"
if exist "%DEST%\cloudflare-error.log" del "%DEST%\cloudflare-error.log"
if exist "%DEST%\.netlify\" rmdir /s /q "%DEST%\.netlify"
if exist "%DEST%\netlify\functions\node_modules\" rmdir /s /q "%DEST%\netlify\functions\node_modules"
if exist "%DEST%\netlify\functions\package.json" del "%DEST%\netlify\functions\package.json"
if exist "%DEST%\netlify\functions\package-lock.json" del "%DEST%\netlify\functions\package-lock.json"

echo.
echo Projet cree : %DEST%
echo.
echo Pour deployer sur Netlify :
echo   cd %NOUVEAU_NOM%
echo   npm exec netlify -- sites:create --name mon-nom
echo   npm exec netlify -- deploy --prod --dir public --functions netlify/functions
echo.

pause
