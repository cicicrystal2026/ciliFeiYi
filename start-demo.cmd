@echo off
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:8769"
  node server.js
  pause
  exit /b
)
set "DEMO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%DEMO_NODE%" (
  start "" "http://127.0.0.1:8769"
  "%DEMO_NODE%" server.js
) else (
  echo Please install Node.js 20 or newer, then run this file again.
)
pause
