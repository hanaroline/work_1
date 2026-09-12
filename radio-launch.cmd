@echo off
rem ===========================================================================
rem  라디오 · TV 온에어 — 여는 도구 (Windows)
rem
rem  파일을 그냥 더블클릭해서 열면(file://) 유튜브 영상이 나오지 않습니다.
rem  유튜브가 임베드에 Referer 헤더를 요구하는데 file:// 에는 그 헤더가 없어
rem  '오류 153 · 동영상 플레이어 구성 오류' 가 납니다. 채널 문제가 아닙니다.
rem
rem  이 도구는 아주 작은 웹 서버를 띄워 http://127.0.0.1:8765 로 열어 줍니다.
rem  그러면 Referer 가 생겨 영상이 정상 재생됩니다.
rem
rem  쓰는 법 : radio-standalone.html 과 같은 폴더에 두고 이 파일을 더블클릭.
rem  끄는 법 : 열린 검은 창을 닫으면 됩니다.
rem
rem  설치할 것이 없습니다. 윈도우에 기본으로 있는 PowerShell 만 씁니다.
rem ===========================================================================
setlocal
echo.
echo   라디오 . TV 온에어 를 엽니다...
echo   이 창을 닫으면 꺼집니다.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$src = Get-Content -Raw -LiteralPath '%~f0'; $i = $src.IndexOf('#PS-START'); Invoke-Expression $src.Substring($i)"
endlocal
goto :eof

#PS-START
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $here) { $here = (Get-Location).Path }

$file = Join-Path $here 'radio-standalone.html'
if (-not (Test-Path $file)) {
  Write-Host ''
  Write-Host '  radio-standalone.html 을 찾지 못했습니다.' -ForegroundColor Red
  Write-Host '  이 파일과 같은 폴더에 두고 다시 실행해 주세요.'
  Write-Host ''
  Read-Host '  엔터를 누르면 닫습니다'
  exit 1
}

$port = 8765
try {
  $listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $port
  $listener.Start()
} catch {
  Write-Host ''
  Write-Host "  $port 번을 쓸 수 없습니다. 이미 열려 있는지 확인해 주세요." -ForegroundColor Red
  Read-Host '  엔터를 누르면 닫습니다'
  exit 1
}

$url = "http://127.0.0.1:$port/"
Write-Host "  주소 : $url" -ForegroundColor Green
Write-Host ''
Start-Process $url

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

    # 요청 첫 줄만 읽고 흘려보낸다. 어차피 돌려줄 것은 하나뿐이다.
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
