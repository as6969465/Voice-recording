@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" msedge --app=http://localhost:8765/index.html
node server.js
