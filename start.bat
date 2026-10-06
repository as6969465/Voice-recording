@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist .env (
  copy .env.example .env >nul
  echo [提醒] 已建立 .env，請用記事本開啟並填入 GEMINI_API_KEY 後重新執行。
  notepad .env
  exit /b
)
start "" msedge --app=http://localhost:8765/index.html
node server.js
