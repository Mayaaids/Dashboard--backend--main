@echo off
REM Check if both servers are running
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         TALOS SYMPOSIUM - CONNECTION STATUS                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Backend
echo Checking BACKEND (Port 5000)...
netstat -ano | findstr ":5000" > nul
if %errorlevel% equ 0 (
    echo ✅ BACKEND: Running on http://localhost:5000
) else (
    echo ❌ BACKEND: NOT running on port 5000
)

REM Check Frontend
echo Checking FRONTEND (Port 3000)...
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo ✅ FRONTEND: Running on http://localhost:3000
) else (
    echo ❌ FRONTEND: NOT running on port 3000
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    QUICK LINKS                             ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  📊 Dashboard:  http://localhost:3000                      ║
echo ║  🔌 API Stats:  http://localhost:5000/api/register/stats   ║
echo ║  📝 Backend:    http://localhost:5000                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
