@echo off
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           TALOS — Frontend + Backend + Google Sheet        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

if not exist "%~dp0symposium-backend" (
    echo [ERROR] symposium-backend folder not found.
    pause
    exit /b 1
)

echo [1/2] Starting backend ^(serves dashboard + API^)...
start cmd /k "cd /d %~dp0symposium-backend && call INSTALL_AND_START.bat"

echo.
echo [2/2] Waiting for server to start...
timeout /t 8 /nobreak >nul

echo.
echo Opening dashboard at http://localhost:5000 ...
start http://localhost:5000

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SYSTEM STARTED                          ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Dashboard:    http://localhost:5000                       ║
echo ║  Register:     http://localhost:5000/register              ║
echo ║  API:          http://localhost:5000/api/register          ║
echo ║  Google Sheet: TALOS Live Registrations ^(Sheet1^)          ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Keep the backend terminal open. Close it to stop.         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
