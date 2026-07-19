@echo off
title MOC TAM DUONG - STOP SERVER
cd /d "%~dp0"

echo =======================================================
echo     TAT AN TOAN DU AN WEBSITE MOC TAM DUONG MASSAGE
echo =======================================================
echo.
echo [1/2] Dang dung cac tien trinh Node.js dang chay ngam...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo Da tat tat ca cac dich vu Node.exe an toan.
) else (
    echo Khong co dich vu Node.js nao dang hoat dong hoac da tat truoc do.
)

echo.
echo [2/2] Hoan tat tat dich vu! Giao dien se ngung hoat dong.
echo.
pause
