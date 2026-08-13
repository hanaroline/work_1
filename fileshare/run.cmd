@echo off
title Team File Share
cd /d "%~dp0"

set "PORT=8080"
if not "%~1"=="" set "PORT=%~1"

echo.
echo  ============================================================
echo   Team File Share - intranet file sharing server
echo  ============================================================
echo   Folder : %CD%
echo.

if not exist "server.py" goto no_source

set "PY="
call :probe py -3
if not defined PY call :probe python
if not defined PY call :probe python3
if not defined PY goto no_python

echo   Python : %PY%
echo   Port   : %PORT%
echo  ------------------------------------------------------------
echo.
%PY% server.py --port %PORT% --open
echo.
echo   [server stopped]
goto hold

:probe
%* -c "pass" >nul 2>nul
if errorlevel 1 exit /b
set "PY=%*"
exit /b

:no_source
echo   [ERROR] server.py not found in this folder.
echo.
echo   Unzip the package FIRST, then run this file from the
echo   extracted folder. Running it from inside the zip preview
echo   does not work.
goto hold

:no_python
echo   [ERROR] Python 3 was not found on this PC.
echo.
echo   Check it yourself: open Command Prompt (cmd) and type
echo       py -V
echo       python -V
echo.
echo   If neither prints a version number, Python is not installed.
echo   Ask IT for Python 3 (intranet software portal), install it
echo   with "Add python.exe to PATH" checked, then run this again.
goto hold

:hold
echo.
pause
