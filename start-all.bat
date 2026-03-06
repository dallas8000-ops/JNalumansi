
echo All servers started and admin login page opened.
@echo off
REM Start backend server in new window
start cmd /k "cd /d %~dp0kistie-store\backend && npm install && node index.js"

REM Start Flask backend in new window
start cmd /k "cd /d %~dp0kistie-store\flask_backend && python app.py"

REM Start React frontend in new window
start cmd /k "cd /d %~dp0kistie-store\React && npm install && npm run dev"

REM Import products automatically in new window
start cmd /k "cd /d %~dp0kistie-store && node import-products-to-backend.js"

REM Open admin login page in default browser
start http://localhost:5173/admin

pause
