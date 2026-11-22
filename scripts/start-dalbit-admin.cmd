@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0\.."

echo.
echo ========================================
echo   달빛 사주관 · 로컬 관리자
echo ========================================
echo.

if not exist ".env" (
  echo [오류] .env 파일이 없습니다. .env.example 을 복사해 ADMIN_PASSWORD 와 ADMIN_SESSION_SECRET 을 설정하세요.
  pause
  exit /b 1
)

REM 이미 5173 이 응답하면 브라우저만 연다
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:5173/ > "%TEMP%\dalbit-port.txt" 2>nul
set /p PORT_CODE=<"%TEMP%\dalbit-port.txt"
del "%TEMP%\dalbit-port.txt" >nul 2>&1

if "%PORT_CODE%"=="200" (
  echo [확인] 로컬 서버가 이미 실행 중입니다.
  echo 주소: http://localhost:5173/#admin-panel
  start "" "http://localhost:5173/#admin-panel"
  echo.
  echo 이 창을 닫아도 서버는 계속 동작합니다 ^(Cursor/다른 터미널에서 켠 경우^).
  timeout /t 4 >nul
  exit /b 0
)

echo [시작] Vite 개발 서버를 켭니다...
echo 주소: http://localhost:5173/
echo 관리자: http://localhost:5173/#admin-panel
echo.
echo ※ 비밀번호는 프로젝트 .env 의 ADMIN_PASSWORD 입니다.
echo ※ 테스트용 비밀번호는 실제 사용 전에 반드시 교체하세요.
echo.

start "" "http://localhost:5173/#admin-panel"
call npm run dev -- --port 5173 --strictPort
pause
