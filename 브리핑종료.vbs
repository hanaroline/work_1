' ============================================================
'  Holdings Briefing - STOP the hidden server (no black window)
'  Double-click this file to stop the background briefing server.
' ============================================================
Option Explicit
Dim sh, cmd
Set sh = CreateObject("WScript.Shell")

' Kill only the powershell process that was started with -File ...server.ps1
' (the -Command killer itself has no "-File", so it will not kill itself)
cmd = "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command " & _
      """Get-CimInstance Win32_Process | " & _
      "Where-Object { $_.CommandLine -like '*-File*server.ps1*' } | " & _
      "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"""

' 0 = hidden, True = wait until done
sh.Run cmd, 0, True

MsgBox "Briefing server stopped.", 64, "Stopped"

Set sh = Nothing
