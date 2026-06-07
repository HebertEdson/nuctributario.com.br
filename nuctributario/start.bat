@echo off
echo.
echo =============================================
echo   NUCLEO TRIBUTARIO - Sistema Completo
echo =============================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js nao esta instalado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    echo.
)

echo [INFO] Iniciando servidor...
echo.
echo Dashboard: http://localhost:3000/admin
echo Landing Page: http://localhost:3000
echo.

call npm start

pause
