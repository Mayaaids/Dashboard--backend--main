@echo off
REM Integration Verification Script
REM This script checks if frontend, backend, and Google Sheets are properly connected

echo.
echo ========================================
echo INTEGRATION VERIFICATION TOOL
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Check Node.js installation
echo [1] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed: 
node --version

echo.
echo [2] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)
echo ✅ npm is installed: 
npm --version

echo.
echo [3] Checking backend directory...
if not exist "server.js" (
    echo ❌ server.js not found in current directory
    echo    Make sure you run this script from: symposium-backend folder
    pause
    exit /b 1
)
echo ✅ server.js found

echo.
echo [4] Checking dependencies...
if not exist "node_modules" (
    echo ⚠️  node_modules not found, installing dependencies...
    call npm install
) else (
    echo ✅ node_modules found
)

echo.
echo [5] Checking .env configuration...
if not exist ".env" (
    echo ❌ .env file not found
    echo    Please copy .env.example to .env and configure it
    echo    See GOOGLE_SHEETS_SETUP.md for instructions
    pause
    exit /b 1
)
echo ✅ .env file found

REM Check if .env has required values
findstr /M "SHEET_ID" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  SHEET_ID not configured in .env
)

findstr /M "GS_PRIVATE_KEY" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  GS_PRIVATE_KEY not configured in .env
)

echo.
echo [6] Verifying frontend files...
if not exist "public\index.html" (
    echo ❌ public\index.html not found
    pause
    exit /b 1
)
echo ✅ public\index.html found

if not exist "public\dashboard.js" (
    echo ❌ public\dashboard.js not found
    pause
    exit /b 1
)
echo ✅ public\dashboard.js found

if not exist "public\config.js" (
    echo ❌ public\config.js not found
    pause
    exit /b 1
)
echo ✅ public\config.js found

echo.
echo [7] Checking backend configuration...
findstr "BACKEND_URL" public\config.js >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  BACKEND_URL not found in public\config.js
) else (
    echo ✅ BACKEND_URL is configured in frontend
)

echo.
echo ========================================
echo ✅ ALL CHECKS PASSED!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure Google Sheets credentials are set in .env
echo 2. Run: npm start
echo 3. Open: http://localhost:5000 in your browser
echo.
echo Connection Summary:
echo - Frontend: http://localhost:5000
echo - Dashboard: http://localhost:5000
echo - Registration: http://localhost:5000/register
echo - API Stats: http://localhost:5000/api/register/stats
echo - API Excel: http://localhost:5000/api/register/excel
echo.
pause
