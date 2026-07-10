@echo off
title Configuration Email
cd /d "%~dp0"

if exist ".env" del ".env"
node setup.js
echo.
pause
