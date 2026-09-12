@echo off
rem ==========================================================================
rem  Radio . TV On-Air - local launcher (Windows)
rem
rem  Opening the HTML by double-click (file://) makes YouTube fail with
rem  "Error 153", because YouTube requires an HTTP Referer header and
rem  file:// sends none. This script serves the file over http://127.0.0.1
rem  so the header exists and video plays.
rem
rem  Usage : keep this next to radio-standalone.html and double-click it.
rem  Stop  : close the black window.
rem
rem  NOTE for maintainers:
rem   - This file MUST be saved with CRLF line endings.
rem   - Everything above "goto :eof" MUST stay ASCII. Korean text here gets
rem     mangled by the CP949 console and breaks the command line.
rem   - Korean text lives below the marker; cmd never parses those lines.
rem ==========================================================================
setlocal
title Radio - TV On-Air
echo.
echo   Radio . TV On-Air
echo   Starting a small local server...
echo.

where powershell >nul 2>nul
if errorlevel 1 (
  echo   [X] PowerShell was not found on this PC.
  echo       Tell Claude - we will publish it to a https address instead.
  echo.
  pause
  goto :eof
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Continue'; $here = Split-Path -Parent '%~f0'; try { $src = Get-Content -Raw -Encoding UTF8 -LiteralPath '%~f0' } catch { Write-Host ('  [X] cannot read this file: ' + $_.Exception.Message); Read-Host '  Press Enter to close'; exit 1 }; $i = $src.LastIndexOf([char]35 + 'PS-START'); if ($i -lt 0) { Write-Host '  [X] start marker not found'; Read-Host '  Press Enter to close'; exit 1 }; try { Invoke-Expression $src.Substring($i) } catch { Write-Host ''; Write-Host ('  [X] ' + $_.Exception.Message); Write-Host ''; Read-Host '  Press Enter to close' }"

echo.
echo   Server stopped. Read the messages above.
echo.
pause
endlocal
goto :eof

#PS-START
# ---------------------------------------------------------------------------
# 여기부터 PowerShell. cmd 는 위의 goto :eof 에서 멈추므로 이 줄들을 읽지 않는다.
# 그래서 여기서는 한글을 써도 안전하다 (위쪽은 ASCII 여야 한다).
# $here 는 cmd 가 넘겨준다 ($MyInvocation 은 -Command 로 부르면 비어 있다).
# ---------------------------------------------------------------------------
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

if (-not $here) { $here = (Get-Location).Path }

$file = Join-Path $here 'radio-standalone.html'
if (-not (Test-Path -LiteralPath $file)) {
  Write-Host ''
  Write-Host '  radio-standalone.html 을 찾지 못했습니다.'
  Write-Host ('  찾아본 곳 : ' + $file)
  Write-Host '  두 파일을 같은 폴더에 두고 다시 실행해 주세요.'
  Write-Host ''
  Read-Host '  엔터를 누르면 닫습니다'
  return
}

$listener = $null
$port = 0
foreach ($try in 8765, 8766, 8767, 8768, 8769) {
  try {
    $l = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $try
    $l.Start()
    $listener = $l
    $port = $try
    break
  } catch { }
}

if (-not $listener) {
  Write-Host ''
  Write-Host '  8765~8769 번을 모두 쓸 수 없습니다.'
  Write-Host '  이 도구가 이미 떠 있는지 확인해 주세요.'
  Write-Host ''
  Read-Host '  엔터를 누르면 닫습니다'
  return
}

$url = "http://127.0.0.1:$port/"
Write-Host ''
Write-Host "  열린 주소 : $url"
Write-Host '  브라우저가 저절로 열리지 않으면 위 주소를 직접 붙여 넣으세요.'
Write-Host '  이 창을 닫으면 꺼집니다.'
Write-Host ''

try { Start-Process $url } catch {
  Write-Host '  브라우저를 자동으로 열지 못했습니다. 위 주소를 직접 여세요.'
}

# 단일 파일이므로 어떤 경로로 들어와도 같은 것을 돌려준다.
$bytes = [System.IO.File]::ReadAllBytes($file)
$head  = "HTTP/1.1 200 OK`r`n" +
         "Content-Type: text/html; charset=utf-8`r`n" +
         "Content-Length: $($bytes.Length)`r`n" +
         "Cache-Control: no-store`r`n" +
         "Connection: close`r`n`r`n"
$headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)

while ($true) {
  try {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()

    $buf = New-Object byte[] 4096
    $stream.ReadTimeout = 2000
    try { $null = $stream.Read($buf, 0, $buf.Length) } catch { }

    $stream.Write($headBytes, 0, $headBytes.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
    $client.Close()
  } catch {
    # 브라우저가 연결을 먼저 끊는 일은 흔하다. 서버는 계속 돈다.
  }
}
