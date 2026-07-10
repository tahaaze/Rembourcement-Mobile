@echo off
title Remboursement Mobile

set "URL=https://remboursement-mobile.netlify.app"

echo.
echo ========================================
echo   Remboursement Mobile
echo ========================================
echo.
echo Lien public permanent :
echo %URL%
echo.
echo Ouverture de la page...

start "" "%URL%"

echo.
pause
