@echo off
REM Quick Start Integration Script - Frontend + Backend + Google Sheets
REM This script sets everything up and starts the system

title TALOS Registration System - Starting...

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   TALOS REGISTRATION SYSTEM                    ║
echo ║             Frontend ↔ Backend ↔ Google Sheets                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Change to backend directory
cd /d "%~dp0"
if not exist "server.js" (
    echo ❌ ERROR: server.js not found!
    echo    Please run this script from: symposium-backend folder
    pause
    exit /b 1
)

echo [✓] Backend directory verified
echo.

REM Check .env
if not exist ".env" (
    echo ❌ ERROR: .env configuration file not found!
    echo.
    echo Steps to fix:
    echo 1. Copy .env.example to .env
    echo 2. Add your Google Sheets credentials:
    echo    - SHEET_ID (already set)
    echo    - GS_CLIENT_EMAIL
    echo    - GS_PRIVATE_KEY
    echo.
    echo See GOOGLE_SHEETS_SETUP.md for detailed instructions
    echo.
    pause
    exit /b 1
)
echo [✓] .env configuration file found
echo.

REM Check dependencies
if not exist "node_modules" (
    echo [!] Installing dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)
echo [✓] Dependencies installed
echo.

REM Display connection info
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    SYSTEM INFORMATION                          ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ Frontend (Dashboard):                                          ║
echo ║   URL: http://localhost:5000                                   ║
echo ║   File: public/index.html                                      ║
echo ║                                                                ║
echo ║ Registration Form:                                             ║
echo ║   URL: http://localhost:5000/register                          ║
echo ║   File: public/register.html                                   ║
echo ║                                                                ║
echo ║ Backend API:                                                   ║
echo ║   Base: http://localhost:5000/api/register                    ║
echo ║   Stats: http://localhost:5000/api/register/stats             ║
echo ║   Data: http://localhost:5000/api/register/excel              ║
echo ║   Server: server.js on port 5000                              ║
echo ║                                                                ║
echo ║ Google Sheets:                                                 ║
echo ║   Sheet ID: 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk   ║
echo ║   Sync: Real-time (every 10 seconds)                          ║
echo ║                                                                ║
echo ║ Database:                                                      ║
echo ║   MongoDB: Optional (app works in demo mode without it)        ║
echo ║   Demo Data: Enabled as fallback                               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [*] Starting backend server...
echo [*] Press Ctrl+C to stop the server
echo.
echo ============================================================
echo Server output begins below:
echo ============================================================
echo.

REM Start the server
npm start

REM If npm start fails, show error
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Failed to start server
    echo.
    echo Common solutions:
    echo 1. Port 5000 already in use: Close other apps using port 5000
    echo 2. Missing dependencies: Run "npm install"
    echo 3. Invalid .env: Check GOOGLE_SHEETS_SETUP.md
    echo.
    pause
    exit /b 1
)
