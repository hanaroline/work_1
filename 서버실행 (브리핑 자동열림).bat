@echo off
setlocal enableextensions
rem ============================================================
rem  Mirae Asset - local server launcher (self-diagnosing)
rem   Serves BOTH tools from this folder:
rem     briefing dashboard : briefing.html  ->  http://localhost:8899/
rem     pension lookup      : search.html   ->  http://localhost:8899/search.html
rem   Keep this window OPEN while you use either screen.
rem   NOTE: file content is ASCII on purpose (corporate-safe).
rem ============================================================
pushd "%~dp0"
title Mirae local server - keep this window OPEN

echo(
echo ============================================================
echo   Mirae Asset - local server
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
if not exist "search.html"   echo [WARN] search.html not found in this folder.

rem --- 2) remove "downloaded from internet" block (MOTW) ------
rem  This is the usual reason a received .bat/.ps1 silently fails.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -File -Recurse | Unblock-File" 1>nul 2>nul

rem --- 3) start the server ------------------------------------
echo Starting server ... open in browser:
echo   http://localhost:8899/            (briefing)
echo   http://localhost:8899/search.html (pension lookup)
echo(
echo (Keep this window OPEN. Close it to STOP the server.)
echo ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -File "server.ps1"

rem --- 4) if we get here, the server stopped or failed --------
echo ------------------------------------------------------------
echo [Server stopped or failed to start]  exit code: %errorlevel%
echo If there are red error lines above, please screenshot this
echo whole window and send it.
echo(
pause
popd
