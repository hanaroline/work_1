@echo off
chcp 65001 >nul
rem 미래에셋 세일즈 툴킷 - Windows 실행기
rem 이 폴더를 로컬 웹서버(http://localhost)로 띄워 대시보드 실시간 데이터가 동작하게 합니다.
cd /d "%~dp0"
set PORT=8080
set URL=http://localhost:%PORT%/tools.html

echo.
echo   미래에셋 세일즈 툴킷을 시작합니다...
echo.

rem 1) Python 우선 (대부분 PC에 설치되어 있음)
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  py -3 -m http.server %PORT%
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  python -m http.server %PORT%
  goto :eof
)

rem 2) Node.js 대체
where node >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  node serve.mjs %PORT%
  goto :eof
)

echo   [안내] Python 또는 Node.js가 설치되어 있지 않습니다.
echo   둘 중 하나를 설치한 뒤 이 파일을 다시 실행해 주세요.
echo   - Python:  https://www.python.org/downloads/  (설치 시 "Add to PATH" 체크)
echo   - Node.js: https://nodejs.org/
echo.
pause
