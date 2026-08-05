@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 금융상품 통합조회 - 로컬 실행

echo ================================================================
echo  금융상품 통합조회 - 로컬 실행
echo ================================================================
echo.

py --version >nul 2>nul
if %errorlevel%==0 goto runpy
python --version >nul 2>nul
if %errorlevel%==0 goto runpython

echo [오류] Python 이 설치되어 있지 않습니다.
echo.
echo  설치 없이 보려면 products-standalone.html 을 더블클릭하세요.
echo  (단, 실데이터 조회는 Python 이 필요합니다)
echo.
echo  Python 설치: https://www.python.org/downloads/
echo  설치할 때 "Add Python to PATH" 를 반드시 체크하세요.
echo.
pause
exit /b 1

:runpy
py serve-products.py %*
goto end

:runpython
python serve-products.py %*

:end
echo.
echo 서버가 종료되었습니다.
pause
