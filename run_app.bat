@echo off
cd /d "%~dp0"
echo Starting FamTalk...
echo.
echo 1. Starting Server (Backend)...
start "FamTalk Server" cmd /k "cd /d "%~dp0server" && npm run dev"
echo.
echo 2. Starting Client (Frontend)...
start "FamTalk Client" cmd /k "cd /d "%~dp0client" && npm run dev"
echo.
echo ✅ Both services started! You can close this window.
