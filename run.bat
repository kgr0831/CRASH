@echo off
title CRASH Dev Server

echo [CRASH] Starting backend (FastAPI :8000)...
start /b cmd /c "python -m uvicorn api.index:app --host 127.0.0.1 --port 8000 2>&1"

echo [CRASH] Starting frontend (Next.js :3000)...
start /b cmd /c "npm run dev 2>&1"

echo [CRASH] Waiting for servers to start...
ping -n 6 127.0.0.1 >nul

echo [CRASH] Opening browser...
start "" "http://localhost:3000"

echo.
echo ========================================
echo   CRASH Dev Server Running
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo   Press Ctrl+C to stop all servers
echo ========================================
echo.

cmd /k
