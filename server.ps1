# -*- coding: utf-8 -*-
# 보유자산 통합 브리핑 - 로컬 프록시 서버 (PowerShell 판)
#
# Python 설치가 막힌 환경(사내망 등)을 위해, 윈도우에 기본 내장된
# PowerShell 만으로 server.py 와 동일한 역할을 수행한다.
#  - briefing.html(정적 파일) 제공
#  - 네이버 증권 / 야후 파이낸스 API 를 서버 측에서 대신 호출(프록시)
#    브라우저가 직접 부르면 CORS 에 막히지만, 서버가 부르면 Referer 를
#    붙일 수 있어 정상적으로 데이터를 받아온다.
#
# 실행: 이 폴더에서  powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# TLS 1.2 이상 강제(구형 기본값 회피)
try {
  [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.SecurityProtocolType]::Tls12 -bor `
    [System.Net.SecurityProtocolType]::Tls11 -bor `
    [System.Net.SecurityProtocolType]::Tls
} catch {}
try { [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls13 } catch {}

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ROOT

$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
$ALLOW = @('ac.stock.naver.com','m.stock.naver.com','api.stock.naver.com','query1.finance.yahoo.com','query2.finance.yahoo.com')

# 야후 crumb 인증용 쿠키/크럼(브라우저에선 막히지만 서버에선 가능)
$script:YHCookies = New-Object System.Net.CookieContainer
$script:YHCrumb   = $null

function Escape-Json([string]$s) {
  if ($null -eq $s) { return '' }
  $s = $s -replace '\\','\\\\'
  $s = $s -replace '"','\"'
  $s = $s -replace "`r",' '
  $s = $s -replace "`n",' '
  return $s
}

# 지정 URL 을 헤더 붙여 가져와 byte[] 반환
function Http-Get {
  param([string]$Url, [string]$Referer, [switch]$UseYhCookies)
  $req = [System.Net.HttpWebRequest]::Create($Url)
  $req.UserAgent = $UA
  $req.Accept = "application/json, text/plain, */*"
  $req.Timeout = 15000
  $req.ReadWriteTimeout = 15000
  $req.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
  if ($Referer) { $req.Referer = $Referer }
  if ($UseYhCookies) { $req.CookieContainer = $script:YHCookies }
  # 사내 프록시(있다면) 자동 사용 + 현재 사용자 자격증명(NTLM 등)
  try {
    $proxy = [System.Net.WebRequest]::GetSystemWebProxy()
    $proxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials
    $req.Proxy = $proxy
  } catch {}
  $resp = $req.GetResponse()
  try {
    $rs = $resp.GetResponseStream()
    $ms = New-Object System.IO.MemoryStream
    $rs.CopyTo($ms)
    return ,$ms.ToArray()
  } finally { $resp.Close() }
}

function Get-YhCrumb {
  param([switch]$Force)
  if ($script:YHCrumb -and -not $Force) { return $script:YHCrumb }
  try { [void](Http-Get -Url "https://fc.yahoo.com/" -UseYhCookies) } catch {}
  $b = Http-Get -Url "https://query2.finance.yahoo.com/v1/test/getcrumb" -UseYhCookies
  $script:YHCrumb = ([System.Text.Encoding]::UTF8.GetString($b)).Trim()
  return $script:YHCrumb
}

function Send-Response {
  param($Stream, [int]$Status, [string]$ContentType, [byte[]]$Body)
  $texts = @{ 200='OK'; 400='Bad Request'; 403='Forbidden'; 404='Not Found'; 500='Internal Server Error'; 502='Bad Gateway' }
  $st = $texts[$Status]; if (-not $st) { $st = 'OK' }
  if ($null -eq $Body) { $Body = New-Object byte[] 0 }
  $head  = "HTTP/1.1 $Status $st`r`n"
  $head += "Content-Type: $ContentType`r`n"
  $head += "Content-Length: $($Body.Length)`r`n"
  $head += "Access-Control-Allow-Origin: *`r`n"
  $head += "Cache-Control: no-store`r`n"
  $head += "Connection: close`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $Stream.Write($hb, 0, $hb.Length)
  if ($Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
  $Stream.Flush()
}
function Send-Json {
  param($Stream, [int]$Status, [string]$Json)
  Send-Response -Stream $Stream -Status $Status -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($Json))
}

function Parse-Query([string]$QueryString) {
  $h = @{}
  if ($QueryString) {
    foreach ($pair in $QueryString.Split('&')) {
      if ($pair -eq '') { continue }
      $idx = $pair.IndexOf('=')
      if ($idx -ge 0) {
        $k = $pair.Substring(0, $idx)
        $v = $pair.Substring($idx + 1)
        $h[$k] = [System.Uri]::UnescapeDataString($v)
      } else {
        $h[$pair] = ''
      }
    }
  }
  return $h
}

function Guess-Type([string]$path) {
  if ($path -match '\.html?$') { return 'text/html; charset=utf-8' }
  if ($path -match '\.js$')    { return 'application/javascript; charset=utf-8' }
  if ($path -match '\.css$')   { return 'text/css; charset=utf-8' }
  if ($path -match '\.json$')  { return 'application/json; charset=utf-8' }
  if ($path -match '\.svg$')   { return 'image/svg+xml' }
  return 'application/octet-stream'
}

function Fund-Fetch($base, $ref, $enc, $p, $extra) {
  $sep = '?'; if ($p.Contains('?')) { $sep = '&' }
  $url = $base + $p + $sep + 'fundCode=' + $enc + $extra
  $b = Http-Get -Url $url -Referer $ref
  return ([System.Text.Encoding]::UTF8.GetString($b) | ConvertFrom-Json)
}

function Handle-Fund($Stream, [string]$query) {
  $q = Parse-Query $query
  $code = $q['code']
  if (-not ($code -match '^[A-Za-z0-9]+$')) { Send-Json $Stream 400 '{"error":"invalid code"}'; return }
  $base = "https://m.stock.naver.com/front-api/fund/"
  $ref  = "https://m.stock.naver.com/domestic/fund/$code/total"
  $enc  = [System.Uri]::EscapeDataString($code)

  $out = [ordered]@{}
  try {
    $out['detail'] = (Fund-Fetch $base $ref $enc 'detail' '').result
  } catch {
    Send-Json $Stream 502 ('{"error":"' + (Escape-Json $_.Exception.Message) + '"}'); return
  }
  try { $out['term']       = (Fund-Fetch $base $ref $enc 'term/list' '').result }        catch { $out['term'] = $null }
  try { $out['returns']    = (Fund-Fetch $base $ref $enc 'return/period' '').result.returns } catch { $out['returns'] = $null }
  try { $out['assetAlloc'] = (Fund-Fetch $base $ref $enc 'asset/allocation' '').result.assetTypes } catch { $out['assetAlloc'] = $null }
  try { $out['sectorAlloc']= (Fund-Fetch $base $ref $enc 'sector/allocation' '').result.result } catch { $out['sectorAlloc'] = $null }
  try { $out['metrics']    = (Fund-Fetch $base $ref $enc 'metrics/detail' '&term=1y').result } catch { $out['metrics'] = $null }

  $json = $out | ConvertTo-Json -Depth 25 -Compress
  Send-Json $Stream 200 $json
}

function Handle-Yq($Stream, [string]$query) {
  $q = Parse-Query $query
  $symbol = $q['symbol']
  $modules = $q['modules']; if (-not $modules) { $modules = 'assetProfile' }
  if (-not $symbol) { Send-Json $Stream 400 '{"error":"no symbol"}'; return }
  $lastErr = $null
  for ($attempt = 0; $attempt -lt 2; $attempt++) {
    try {
      if ($attempt -eq 1) { $script:YHCookies = New-Object System.Net.CookieContainer; $script:YHCrumb = $null }
      $crumb = Get-YhCrumb
      $url = "https://query2.finance.yahoo.com/v10/finance/quoteSummary/" + [System.Uri]::EscapeDataString($symbol) +
             "?modules=" + [System.Uri]::EscapeDataString($modules) + "&crumb=" + [System.Uri]::EscapeDataString($crumb)
      $body = Http-Get -Url $url -UseYhCookies
      Send-Response $Stream 200 "application/json; charset=utf-8" $body
      return
    } catch { $lastErr = $_ }
  }
  Send-Json $Stream 502 ('{"error":"' + (Escape-Json $lastErr.Exception.Message) + '"}')
}

function Handle-Proxy($Stream, [string]$query) {
  $q = Parse-Query $query
  $target = $q['u']
  $uri = $null
  try { $uri = [System.Uri]$target } catch { $uri = $null }
  if ((-not $uri) -or ($uri.Scheme -ne 'https') -or ($ALLOW -notcontains $uri.Host)) {
    Send-Json $Stream 403 '{"error":"host not allowed"}'; return
  }
  $ref = $null
  if ($uri.Host -like '*naver.com') { $ref = 'https://m.stock.naver.com/' }
  try {
    $body = Http-Get -Url $target -Referer $ref
    Send-Response $Stream 200 "application/json; charset=utf-8" $body
  } catch {
    Send-Json $Stream 502 ('{"error":"' + (Escape-Json $_.Exception.Message) + '"}')
  }
}

function Handle-Request($Stream, [string]$Method, [string]$RawPath) {
  $qidx = $RawPath.IndexOf('?')
  if ($qidx -ge 0) { $path = $RawPath.Substring(0, $qidx); $query = $RawPath.Substring($qidx + 1) }
  else { $path = $RawPath; $query = '' }

  if ($path -eq '/api/proxy') { Handle-Proxy $Stream $query; return }
  if ($path -eq '/api/fund')  { Handle-Fund  $Stream $query; return }
  if ($path -eq '/api/yq')    { Handle-Yq    $Stream $query; return }

  if ($path -eq '/' -or $path -eq '') { $path = '/briefing.html' }
  $rel  = $path.TrimStart('/')
  $full = [System.IO.Path]::GetFullPath((Join-Path $ROOT $rel))
  $rootFull = [System.IO.Path]::GetFullPath($ROOT)
  if (-not $full.StartsWith($rootFull)) { Send-Json $Stream 403 '{"error":"forbidden"}'; return }
  if (Test-Path -LiteralPath $full -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($full)
    Send-Response $Stream 200 (Guess-Type $full) $bytes
  } else {
    Send-Json $Stream 404 '{"error":"not found"}'
  }
}

function Read-RequestHeaders($stream) {
  $buf = New-Object System.Collections.Generic.List[byte]
  $tmp = New-Object byte[] 1
  $count = 0
  while ($true) {
    $n = $stream.Read($tmp, 0, 1)
    if ($n -le 0) { break }
    $buf.Add($tmp[0]); $count++
    if ($count -ge 4) {
      $c = $buf.Count
      if ($buf[$c-4] -eq 13 -and $buf[$c-3] -eq 10 -and $buf[$c-2] -eq 13 -and $buf[$c-1] -eq 10) { break }
    }
    if ($count -gt 65536) { break }
  }
  return [System.Text.Encoding]::ASCII.GetString($buf.ToArray())
}

# ---- 서버 시작 ----
$listener = $null
$port = 0
for ($p = 8899; $p -lt 8919; $p++) {
  try {
    $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
    $l.Start()
    $listener = $l; $port = $p; break
  } catch { $listener = $null }
}
if (-not $listener) {
  Write-Host ""
  Write-Host "[오류] 사용 가능한 포트를 찾지 못했습니다." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료합니다"
  return
}

$url = "http://localhost:$port/"
$line = ('=' * 56)
Write-Host $line
Write-Host "  보유자산 통합 브리핑 서버가 실행되었습니다. (PowerShell 판)"
Write-Host "  브라우저가 자동으로 열립니다:  $url"
Write-Host "  (안 열리면 위 주소를 브라우저 주소창에 직접 붙여넣으세요)"
Write-Host ""
Write-Host "  * 이 창은 닫지 마세요. 닫으면 대시보드도 멈춥니다." -ForegroundColor Yellow
Write-Host "  종료하려면: 이 창을 클릭한 뒤 Ctrl+C"
Write-Host $line

try { Start-Process $url | Out-Null } catch {}

while ($true) {
  $client = $null
  try {
    $client = $listener.AcceptTcpClient()
    $client.ReceiveTimeout = 15000
    $client.SendTimeout = 15000
    $stream = $client.GetStream()
    $reqText = Read-RequestHeaders $stream
    if ($reqText) {
      $firstLine = ($reqText -split "`r`n")[0]
      $parts = $firstLine.Split(' ')
      if ($parts.Length -ge 2) {
        Handle-Request $stream $parts[0] $parts[1]
      }
    }
  } catch {
    # 개별 연결 오류는 무시하고 계속 서비스
  } finally {
    if ($client) { try { $client.Close() } catch {} }
  }
}
