@echo off
title MOC TAM DUONG - START SERVER
cd /d "%~dp0"

echo =======================================================
echo     KHOI DONG DU AN WEBSITE MOC TAM DUONG MASSAGE
echo =======================================================
echo.
echo [1/3] Dang nap file cau hinh .env (neu co)...
if exist .env (
    for /f "tokens=*" %%i in (.env) do set %%i
    echo Nap file .env thanh cong!
) else (
    echo Khong tim thay file .env, chay mac dinh.
)

echo.
echo [2/3] Dang kiem tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] May cua anh chua duoc cai dat Node.js. Vui long tai ve tu nodejs.org!
    pause
    exit /b 1
)
echo Node.js da san sang!

echo.
echo [3/3] Dang khoi chay Server Node.js...
echo Server se chay tai dia chi: http://localhost:3000
echo.
node server.js
pause
