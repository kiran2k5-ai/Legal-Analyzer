@echo off
echo ============================================================
echo Starting Legal AI Document Analyzer...
echo ============================================================

:: 1. Start the FastAPI Backend in a new command window
echo Launching Backend Server on Port 8000...
start "Legal AI Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app:app --reload --port 8000"

:: 2. Start the Vite React Frontend in a new command window
echo Launching Frontend Developer Server...
start "Legal AI Frontend" cmd /k "cd frontend\legal-ai && npm run dev"

:: 3. Wait 3 seconds and open the browser
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul
echo Opening your browser to http://localhost:5173/register...
start http://localhost:5173/register

echo ============================================================
echo Servers launched successfully in separate windows!
echo Keep those command windows open while using the application.
echo ============================================================
pause
