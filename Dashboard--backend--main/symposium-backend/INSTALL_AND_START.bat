@echo off
cd /d "%~dp0"

echo.
echo TALOS Backend - Install and Start
echo ================================
echo.

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo Created .env from .env.example. Add GS_CLIENT_EMAIL and GS_PRIVATE_KEY for Google Sheets.
        echo See GOOGLE_SHEETS_SETUP.md
        echo.
    )
)

set npm_config_offline=
set npm_config_prefer_offline=
set offline=
set npm_config_offline=false
set npm_config_prefer_offline=false
set npm_config_cache=%CD%\.npm-cache

echo [1/2] Installing dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo npm install failed. In a normal Command Prompt or PowerShell, run:
    echo   npm config set offline false
    echo   cd "%~dp0"
    echo   npm install --legacy-peer-deps
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting server on http://localhost:5000 ...
echo Dashboard: http://localhost:5000
echo API:       http://localhost:5000/api/register
echo.
call npm start

pause
