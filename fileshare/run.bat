@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8080
if not "%~1"=="" set PORT=%~1

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 server.py --port %PORT%
  goto end
)

where python >nul 2>nul
if %errorlevel%==0 (
  python server.py --port %PORT%
  goto end
)

echo.
echo [안내] 파이썬을 찾을 수 없습니다.
echo        https://www.python.org/downloads/windows/ 에서 Python 3 을 설치한 뒤
echo        (설치 화면에서 "Add python.exe to PATH" 체크) 다시 실행해 주세요.
echo.

:end
pause
