@echo off
rem ===============================================================
rem  Holdings Briefing - stop the hidden server (WSH/.vbs not needed)
rem ===============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*-File*server.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
exit
