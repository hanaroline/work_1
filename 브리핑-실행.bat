@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   보유자산 통합 브리핑을 시작합니다 (PowerShell / Python 불필요)...
echo   브라우저가 자동으로 열립니다. 이 검은 창은 닫지 마세요.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
echo.
echo   서버가 종료되었습니다.
pause
