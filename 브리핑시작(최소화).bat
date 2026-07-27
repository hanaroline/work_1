@echo off
rem ===============================================================
rem  Holdings Briefing - launch with hidden server window
rem  (WSH/.vbs not required. This .bat window flashes briefly, then
rem   the server runs hidden. Browser opens automatically.)
rem  To stop later: run the STOP batch file.
rem ===============================================================
cd /d "%~dp0"
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0server.ps1"
exit
