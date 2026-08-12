@echo off
REM ============================================================
REM  Department Archive - rebuild index (double-click this file)
REM  Runs _목록갱신.ps1 without changing the machine's
REM  PowerShell execution policy.
REM ============================================================
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_목록갱신.ps1"
echo.
pause
