@echo off
echo ===================================
echo Iniciando Servidor Nucleo Tributario
echo ===================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

REM Verificar se .env existe
if not exist .env (
    echo AVISO: Arquivo .env nao encontrado!
    echo Leia GERAR_APP_PASSWORD.md para configurar
    pause
    exit /b 1
)

echo .env encontrado!
echo.

REM Instalar dependências se necessário
echo Verificando dependencias...
if not exist node_modules (
    echo Instalando pacotes npm...
    call npm install
)

echo.
echo ===================================
echo SERVIDOR INICIADO!
echo ===================================
echo.
echo Acesse: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar
echo.

npm start
