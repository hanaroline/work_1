@echo off
rem ===========================================================================
rem  Mirae Asset - Product Finder / double-click launcher
rem
rem  Kept deliberately simple. Earlier versions used for-loops, call, quoted
rem  candidates and delayed expansion to detect Python, and each of those
rem  misfired on a real PC. Straight-line code only: no for, no call, no
rem  nested quotes, no delayed expansion, no chcp, ASCII only.
rem
rem  The probe runs THIS script with --help. Only a real Python 3 can do that
rem  and return 0; the Microsoft Store placeholder returns 9009 and is skipped.
rem ===========================================================================
cd /d "%~dp0"
title Mirae Product Finder

echo.
echo  ==========================================================
echo   Mirae Asset - Product Finder
echo  ==========================================================
echo.

if not exist "serve-products.py" goto nofile

set PY=
python serve-products.py --help >nul 2>nul
if not errorlevel 1 set PY=python
if defined PY goto run

py -3 serve-products.py --help >nul 2>nul
if not errorlevel 1 set PY=py -3
if defined PY goto run

python3 serve-products.py --help >nul 2>nul
if not errorlevel 1 set PY=python3
if defined PY goto run

goto nopython

:run
echo   Python  : %PY%
echo   Folder  : %CD%
echo.
echo   Starting the server. Your browser opens by itself.
echo   The address must start with 127.0.0.1
echo   Keep this window open. Stop with Ctrl+C.
echo.
%PY% serve-products.py %*
echo.
echo   Server stopped.
goto end

:nofile
echo   [ERROR] serve-products.py is not in this folder:
echo           %CD%
echo           Unzip the whole folder, then run this file from inside it.
goto end

:nopython
echo   [ERROR] No working Python 3 was found.
echo.
echo   Open a command window in this folder and run:
echo       python serve-products.py
echo   and send us what it prints.
echo.
echo   Note: a "py" or "python" that only prints the word "Python"
echo   is the Microsoft Store placeholder, not a real interpreter.
echo   Install Python: https://www.python.org/downloads/
echo   Tick "Add Python to PATH" during installation.

:end
echo.
pause
