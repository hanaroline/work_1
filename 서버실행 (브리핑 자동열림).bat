@echo off
rem ============================================================
rem  Mirae Asset - local server launcher (self-diagnosing + logging)
rem   Serves BOTH tools from this folder:
rem     briefing dashboard : briefing.html  ->  http://localhost:8899/
rem     pension lookup      : search2.html  ->  http://localhost:8899/search2.html
rem   The console window auto-MINIMIZES to the taskbar on start.
rem   Keep it running (in the taskbar) while you use either screen.
rem   To STOP the server: click the taskbar item, then close the window.
rem   Writes server-log.txt so failures can be diagnosed.
rem   NOTE: file content is ASCII on purpose (corporate-safe).
rem ============================================================

rem --- 0) self-minimize: relaunch this window minimized on first run
if /i "%~1"=="MIN" goto :main
start "Mirae local server" /min "%~f0" MIN
exit /b

:main
setlocal enableextensions
pushd "%~dp0"
title Mirae local server - MINIMIZED (keep running; close to STOP)

echo(
echo ============================================================
echo   Mirae Asset - local server  (this window is minimized)
echo   Folder: %CD%
echo ============================================================
echo(

rem --- 1) required file check ---------------------------------
if not exist "server.ps1" (
  echo [ERROR] server.ps1 was NOT found in this folder.
  echo         Put server.ps1 in the SAME folder as this file.
  echo(
  echo Files in this folder:
  dir /b
  echo(
  pause
  popd
  exit /b 1
)
if not exist "briefing.html" echo [WARN] briefing.html not found in this folder.
if not exist "search2.html"  echo [WARN] search2.html not found in this folder.

rem --- 2) remove "downloaded from internet" block (MOTW) ------
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -File | Unblock-File" 1>nul 2>nul

rem --- 3) open the browser a few seconds after the server binds
rem     (cmd-based open is more reliable than PowerShell on locked PCs)
start "" /b cmd /c "ping 127.0.0.1 -n 4 >nul & start "" http://localhost:8899/"

echo Starting server ...  This window is MINIMIZED in the taskbar.
echo To STOP: click the taskbar item, then close this window.
echo If the browser does not open by itself, type this address:
echo     http://localhost:8899/
echo   (or use the shortcut:  briefing.html re-open .url)
echo ------------------------------------------------------------
echo(

rem --- 4) run server, show output AND save it to server-log.txt
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\server.ps1' *>&1 | Tee-Object -FilePath 'server-log.txt'"

rem --- 5) we only reach here if the server stopped/failed ------
echo ------------------------------------------------------------
echo [Server stopped or failed to start]  exit code: %errorlevel%
echo A log was saved next to this file:  server-log.txt
echo If the briefing did not open, please send me server-log.txt
echo (or screenshot this whole window).
echo(
pause
popd
