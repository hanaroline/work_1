@echo off
rem ===========================================================================
rem  Mirae Asset - Product Finder / local launcher
rem
rem  NOTE: This file is intentionally ASCII-only.
rem  Korean text combined with "chcp 65001" makes cmd.exe mis-parse the rest
rem  of a batch file and exit silently (the window just flashes and closes).
rem  User-facing Korean text is printed by serve-products.py instead.
rem ===========================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Mirae Product Finder

echo ==============================================================
echo  Mirae Asset - Product Finder (local server)
echo ==============================================================
echo.

set "PYEXE="
rem  Capture this outside any parenthesised block: the "(x86)" in the variable
rem  name would otherwise close the enclosing if-block at parse time.
set "PF86=%ProgramFiles(x86)%"

rem --- 1) look on PATH, but verify it really runs -------------------------
rem  "py --version" also succeeds for the Microsoft Store stub, which then
rem  just opens the Store and exits. Running -c is what separates them.
for %%P in (py.exe python.exe python3.exe) do (
  if not defined PYEXE (
    where %%P >nul 2>nul
    if not errorlevel 1 (
      %%P -c "import sys, http.server" >nul 2>nul
      if not errorlevel 1 set "PYEXE=%%P"
    )
  )
)

rem --- 2) look in the usual install folders -------------------------------
if not defined PYEXE (
  for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" set "PYEXE=%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("%ProgramFiles%\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" set "PYEXE=%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("!PF86!\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" set "PYEXE=%%D\python.exe"
  )
)
if not defined PYEXE (
  for /d %%D in ("C:\Python3*") do (
    if not defined PYEXE if exist "%%D\python.exe" set "PYEXE=%%D\python.exe"
  )
)

if not defined PYEXE goto nopython

if not exist "serve-products.py" (
  echo  [ERROR] serve-products.py not found in this folder:
  echo          %CD%
  echo          Unzip the whole folder and run the .bat from inside it.
  echo.
  pause
  exit /b 1
)

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

:nopython
echo  [!] No working Python was found on this PC.
echo.
echo      Opening products-standalone.html instead, so you can still
echo      use the screen. Live KRX data needs Python: a browser alone
echo      is blocked by CORS and will show illustrative data.
echo.
echo      To get live data, install Python and run this file again:
echo        https://www.python.org/downloads/
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
