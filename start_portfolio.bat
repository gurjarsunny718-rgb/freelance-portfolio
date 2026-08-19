@echo off
echo ===================================================
echo   SUNNY GURJAR - REELS PORTFOLIO 2026
echo   Starting local web server on http://localhost:3000
echo ===================================================
cd /d "%~dp0"
start http://localhost:3000
node server.js
pause
