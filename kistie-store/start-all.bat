@echo off
REM Start backend server
start cmd /k "cd backend && if not exist node_modules npm install && npm run dev"

REM Start React frontend
start cmd /k "cd React && if not exist node_modules npm install && npm run dev"

echo Both backend and frontend are starting in new terminals.
pause
