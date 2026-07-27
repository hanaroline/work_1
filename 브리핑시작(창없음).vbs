' ============================================================
'  Holdings Briefing - SILENT launcher (no black window)
'  Double-click this file. The dashboard opens in your browser.
'  To stop the server later, double-click the STOP script (brief-stop).
' ============================================================
Option Explicit
Dim sh, fso, dir, cmd
Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Folder where this .vbs (and server.ps1) live
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir

' Run server.ps1 with a HIDDEN window (0 = hidden, False = do not wait)
cmd = "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\server.ps1"""
sh.Run cmd, 0, False

Set sh  = Nothing
Set fso = Nothing
