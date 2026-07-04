@echo off
SETLOCAL EnableDelayedExpansion

echo.
echo ==========================================
echo    TMDT ChatBot AI - Starter Script
echo ==========================================
echo.

:: 1. Kiểm tra node_modules
if not exist "node_modules\" (
    echo [INFO] Thu muc node_modules khong ton tai. Dang cai dat...
    call npm install
) else (
    echo [OK] Node modules da san sang.
)

:: 2. Khởi động PostgreSQL và Redis qua Docker
echo [INFO] Dang khoi dong ha tang (PostgreSQL, Redis)...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker-compose that bai. Hay dam bao Docker Desktop da duoc bat!
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Đợi database một chút (tùy chọn nhưng an toàn)
echo [INFO] Cho database san sang...
timeout /t 5 /nobreak > nul

:: 4. Prisma Generate
echo [INFO] Dang sync Prisma schema...
call npx prisma generate

:: 5. Mo Prisma Studio trong cua so moi
echo [INFO] Dang bat Prisma Studio (Database GUI)...
start "Prisma Studio" npx prisma studio

:: 6. Chay ung dung
echo.
echo [SUCCESS] Moi thu da san sang! Dang bat app...
echo ------------------------------------------
call npm run dev

pause
