@echo off
rem ===========================================================================
rem  Mirae Asset - Product Finder / local launcher
rem
rem  ASCII-only on purpose: Korean text plus "chcp 65001" makes cmd.exe
rem  mis-parse the rest of a batch file and exit silently.
rem
rem  Detection strategy: DO NOT inspect the interpreter from batch.
rem  Earlier attempts (where / --version / for-f on -c output) all misfired -
rem  the Microsoft Store placeholder can satisfy those checks, and nested
rem  quotes inside for-f are fragile. Instead we simply ask each candidate to
rem  run THIS script with --probe. Only a real Python 3 can do that and return
rem  0; the Store placeholder dies with 9009. That is exactly what we need.
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Mirae Product Finder

echo ==============================================================
echo  Mirae Asset - Product Finder (local server)
echo ==============================================================
echo.

if not exist "serve-products.py" goto nofile

set "PYEXE="

rem --- candidates on PATH -------------------------------------------------
for %%P in (python.exe py.exe python3.exe) do call :try "%%P"

rem --- candidates in the usual install folders ----------------------------
set "PF86=%ProgramFiles(x86)%"
for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do call :try "%%D\python.exe"
for /d %%D in ("%ProgramFiles%\Python3*") do call :try "%%D\python.exe"
for /d %%D in ("%PF86%\Python3*") do call :try "%%D\python.exe"
for /d %%D in ("C:\Python3*") do call :try "%%D\python.exe"

if not defined PYEXE goto nopython

echo  Python : %PYEXE%
echo  Folder : %CD%
echo.
echo  Starting the server. Your browser should open by itself.
echo  IMPORTANT: the address bar must start with 127.0.0.1
echo             If it starts with C:\ you opened the file directly and
echo             live data cannot load. Use the address printed below.
echo.
echo  Keep this window open. Stop the server with Ctrl+C.
echo.

"%PYEXE%" serve-products.py %*
set "RC=%errorlevel%"
echo.
if not "%RC%"=="0" echo  [ERROR] Server exited with code %RC%
if not "%RC%"=="0" echo          Diagnose with: "%PYEXE%" serve-products.py --report
echo  Server stopped.
echo.
pause
exit /b %RC%

rem --- try one candidate --------------------------------------------------
rem  Ask it to run this very script. Real Python 3 -> exit 0.
rem  Store placeholder / Python 2 / broken install -> non-zero, so skipped.
:try
if defined PYEXE goto :eof
%1 serve-products.py --probe >nul 2>nul
if errorlevel 1 goto :eof
set "PYEXE=%~1"
goto :eof

:nofile
echo  [ERROR] serve-products.py is not in this folder:
echo          %CD%
echo          Unzip the whole folder, then run this file from inside it.
echo.
pause
exit /b 1

:nopython
echo  [!] Could not run serve-products.py with any Python on this PC.
echo.
echo      If you know Python works, open a command window here and run:
echo          python serve-products.py
echo      then tell us what it prints - that is the fastest way to fix this.
echo.
echo      Note: a "py" or "python" that only prints the word "Python" is the
echo      Microsoft Store placeholder, not a real interpreter.
echo.
echo      Install Python: https://www.python.org/downloads/
echo      Tick "Add Python to PATH" during installation.
echo.
echo      Opening products-standalone.html so you can still see the screen,
echo      but it will show illustrative data, not live KRX data.
echo.
if exist "products-standalone.html" start "" "products-standalone.html"
echo.
pause
exit /b 1
