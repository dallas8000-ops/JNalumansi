@echo off
REM Start backend server
start "" /b cmd /c "cd backend && if not exist node_modules (echo [backend] node_modules missing - run npm install once) else npm run dev"

REM Start React frontend
start "" /b cmd /c "cd React && if not exist node_modules (echo [React] node_modules missing - run npm install once) else npm run dev"

echo Both backend and frontend are starting in new terminals.
REM IMPORTANT: Do not block with `pause` so Cursor/Open-App actions don't hang.
