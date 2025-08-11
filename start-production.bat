@echo off
REM Production startup script for DMHCA CRM (Windows)
echo 🚀 Starting DMHCA CRM in production mode...

REM Check if environment variables are set
if "%NEXT_PUBLIC_API_URL%"=="" (
    echo ⚠️  Warning: NEXT_PUBLIC_API_URL not set, using default
)

REM Check if backend is accessible
echo 🔍 Checking backend connectivity...
set "BACKEND_URL=%NEXT_PUBLIC_API_URL%"
if "%BACKEND_URL%"=="" set "BACKEND_URL=http://localhost:5000/api/v1"

REM Simple connectivity check (you may need to adjust this)
powershell -Command "try { $response = Invoke-WebRequest -Uri '%BACKEND_URL:/api/v1=%/health' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend is accessible' } else { Write-Host '⚠️  Backend not accessible - application will run in demo mode' } } catch { Write-Host '⚠️  Backend not accessible - application will run in demo mode' }"

REM Build the application if not already built
if not exist ".next" (
    echo 📦 Building application...
    npm run build
)

REM Start the application
echo 🌟 Starting Next.js application...
set NODE_ENV=production
npm start
