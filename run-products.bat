@echo off
rem ===========================================================================
rem  Mirae Asset - Product Finder / local launcher
rem
rem  ASCII-only on purpose: Korean text plus "chcp 65001" makes cmd.exe
rem  mis-parse the rest of a batch file and exit silently. Korean messages are
rem  printed by serve-products.py instead.
rem
rem  Python detection is done by CHECKING THE OUTPUT, not the exit code.
rem  The Microsoft Store alias (py.exe / python.exe under WindowsApps) prints
rem  "Python" and exits 9009, yet can still return 0 for some probes - so an
rem  exit-code check is not enough to tell a real interpreter from the stub.
rem ===========================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Mirae Product Finder

echo ==============================================================
echo  Mirae Asset - Product Finder (local server)
echo ==============================================================
echo.

if not exist "serve-products.py" (
  echo  [ERROR] serve-products.py is not in this folder:
  echo          %CD%
  echo          Unzip the whole folder first, then run this file from inside it.
  echo.
  pause
  exit /b 1
)

set "PYEXE="

rem --- 1) candidates on PATH ---------------------------------------------
rem  python first: on PCs where "py" is the Store alias this finds the real one.
for %%P in (python.exe py.exe python3.exe) do (
  if not defined PYEXE call :probe "%%P"
)

rem --- 2) candidates in the usual install folders -------------------------
set "PF86=%ProgramFiles(x86)%"
if not defined PYEXE (
  for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" call :probe "%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("%ProgramFiles%\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" call :probe "%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("!PF86!\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" call :probe "%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("C:\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" call :probe "%%D\python.exe"
  )
)

if not defined PYEXE goto nopython

echo  Python : !PYEXE!
echo  Folder : %CD%
echo.
echo  Starting server. The browser opens automatically.
echo  If it does not, copy the address printed below into your browser.
echo  Stop with Ctrl+C in this window.
echo.

"!PYEXE!" serve-products.py %*
set "RC=!errorlevel!"
echo.
if not "!RC!"=="0" (
  echo  [ERROR] Server exited with code !RC!
  echo          Run this to see the reason:
  echo            "!PYEXE!" serve-products.py --check
)
echo  Server stopped.
echo.
pause
exit /b !RC!

rem --- probe: only accept an interpreter that really answers --------------
rem  A real Python 3 prints "3". The Store alias prints "Python", so it is
rem  rejected here. No quotes inside -c, to keep cmd parsing simple.
:probe
set "CAND=%~1"
for /f "usebackq delims=" %%V in (`"%CAND%" -c "import sys,http.server;print(sys.version_info[0])" 2^>nul`) do (
  if "%%V"=="3" set "PYEXE=%CAND%"
)
goto :eof

:nopython
echo  [!] No working Python 3 was found on this PC.
echo.
echo      Note: a "py" or "python" that only prints "Python" is the
echo      Microsoft Store placeholder, not a real interpreter.
echo.
echo      Opening products-standalone.html so you can still use the screen.
echo      Live KRX data needs Python - a browser alone is blocked by CORS
echo      and will show illustrative data.
echo.
echo      Install Python: https://www.python.org/downloads/
echo      Tick "Add Python to PATH" during installation.
echo.
if exist "products-standalone.html" (
  start "" "products-standalone.html"
) else (
  echo      [ERROR] products-standalone.html not found in %CD%
)
echo.
pause
exit /b 1
