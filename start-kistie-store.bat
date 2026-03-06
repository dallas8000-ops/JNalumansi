@echo off
REM Windows batch script to start Kistie Store backend
cd /d %~dp0kistie-store\backend
start cmd /k "node index.js"
REM Optionally, open the frontend in browser (uncomment next line if using Live Server or similar)
REM start http://127.0.0.1:5500/kistie-store/inventory.html
