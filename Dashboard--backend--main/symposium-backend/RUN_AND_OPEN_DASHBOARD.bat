@echo off
cd /d "%~dp0"

echo.
echo TALOS Dashboard - Run and Open
echo ==============================
echo.

:: Check if node_modules exists and has express
if not exist "node_modules\express\package.json" (
    echo Dependencies not installed. Running INSTALL_AND_START.bat first...
    echo.
    call "%~dp0INSTALL_AND_START.bat"
    exit /b
)

echo Starting server on http://localhost:5000 ...
echo.
echo Dashboard will open in your browser in 5 seconds.
echo Keep this window open. Press Ctrl+C to stop.
echo.
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5000"

call npm start

pause
