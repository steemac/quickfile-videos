@echo off
REM Refreshes the QuickFile video list from YouTube.
REM Put your YouTube Data API key in youtube-api-key.txt next to this file (optional).
REM To run it automatically, add this file to Windows Task Scheduler (see README).
cd /d "%~dp0"
node update-videos.js
if errorlevel 1 (
  echo.
  echo Update failed. Check the message above.
  if "%1"=="" pause
  exit /b 1
)
if "%1"=="" pause
