# Holdings briefing - local proxy server (PowerShell edition)
#
# For environments where installing Python is blocked (e.g. corporate network),
# this reproduces server.py using only PowerShell, which ships with Windows.
#  - serves briefing.html (static file)
#  - proxies Naver / Yahoo finance APIs from the server side so the browser
#    is not blocked by CORS (server can attach the Referer header).
#
# NOTE: This file is intentionally ASCII-only so it parses correctly on
# Korean Windows PowerShell 5.1 regardless of file encoding.
#
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# Force TLS 1.2+ (avoid old default)
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

$CRLF = [string]([char]13 + [char]10)
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
$ALLOW = @('ac.stock.naver.com','m.stock.naver.com','api.stock.naver.com','query1.finance.yahoo.com','query2.finance.yahoo.com','data.krx.co.kr')

# Yahoo crumb auth cookie/crumb (blocked in browser, works server-side)
$script:YHCookies = New-Object System.Net.CookieContainer
$script:YHCrumb   = $null

# KRX (Korea Exchange) POST API cookie jar + warmup flag
$script:KRXCookies = New-Object System.Net.CookieContainer
$script:KRXWarmed  = $false

function Escape-Json([string]$s) {
  if ($null -eq $s) { return '' }
  $s = $s -replace '\\','\\\\'
  $s = $s -replace '"','\"'
  $s = $s -replace ([char]13),' '
  $s = $s -replace ([char]10),' '
  return $s
}

# Fetch URL with headers, return byte[]
function Http-Get {
  param([string]$Url, [string]$Referer, [switch]$UseYhCookies, [System.Net.CookieContainer]$Jar)
  $req = [System.Net.HttpWebRequest]::Create($Url)
  $req.UserAgent = $UA
  $req.Accept = "application/json, text/plain, */*"
  $req.Timeout = 15000
  $req.ReadWriteTimeout = 15000
  $req.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
  if ($Referer) { $req.Referer = $Referer }
  if ($UseYhCookies) { $req.CookieContainer = $script:YHCookies }
  if ($Jar) { $req.CookieContainer = $Jar }
  # Use system proxy (if any) + current user credentials (NTLM etc.)
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
  $head  = "HTTP/1.1 $Status $st" + $CRLF
  $head += "Content-Type: $ContentType" + $CRLF
  $head += "Content-Length: $($Body.Length)" + $CRLF
  $head += "Access-Control-Allow-Origin: *" + $CRLF
  $head += "Cache-Control: no-store" + $CRLF
  $head += "Connection: close" + $CRLF + $CRLF
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

function Http-Post {
  param([string]$Url, [string]$Body, [string]$Referer, [System.Net.CookieContainer]$Jar)
  $req = [System.Net.HttpWebRequest]::Create($Url)
  $req.Method = "POST"
  $req.UserAgent = $UA
  $req.Accept = "application/json, text/javascript, */*; q=0.01"
  $req.ContentType = "application/x-www-form-urlencoded; charset=UTF-8"
  $req.Timeout = 20000
  $req.ReadWriteTimeout = 20000
  $req.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
  try { $req.Headers.Add("X-Requested-With","XMLHttpRequest") } catch {}
  if ($Referer) { $req.Referer = $Referer }
  if ($Jar) { $req.CookieContainer = $Jar }
  try {
    $proxy = [System.Net.WebRequest]::GetSystemWebProxy()
    $proxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials
    $req.Proxy = $proxy
  } catch {}
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Body)
  $req.ContentLength = $bytes.Length
  $rs = $req.GetRequestStream(); $rs.Write($bytes, 0, $bytes.Length); $rs.Close()
  $resp = $req.GetResponse()
  try {
    $s = $resp.GetResponseStream(); $ms = New-Object System.IO.MemoryStream; $s.CopyTo($ms); return ,$ms.ToArray()
  } finally { $resp.Close() }
}

# KRX data system (POST) proxy: inbound GET /api/krx?bld=...&<params> -> outbound POST getJsonData.cmd
function Handle-Krx($Stream, [string]$query) {
  $q = Parse-Query $query
  # cmd=finder -> bond issue finder(search); otherwise getJsonData (bld required)
  $isFinder = ($q.ContainsKey('cmd') -and $q['cmd'] -eq 'finder')
  if (-not $isFinder -and -not $q.ContainsKey('bld')) { Send-Json $Stream 400 '{"error":"no bld"}'; return }
  $pairs = @()
  foreach ($k in $q.Keys) { if ($k -eq 'cmd') { continue }; $pairs += ([System.Uri]::EscapeDataString([string]$k) + "=" + [System.Uri]::EscapeDataString([string]$q[$k])) }
  $body = [string]::Join("&", $pairs)
  if ($isFinder) { $target = "http://data.krx.co.kr/comm/finder/finder_bondisu.cmd" }
  else           { $target = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd" }
  try {
    if (-not $script:KRXWarmed) {
      try { [void](Http-Get -Url "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101" -Referer "http://data.krx.co.kr/" -Jar $script:KRXCookies) } catch {}
      $script:KRXWarmed = $true
    }
    $out = Http-Post -Url $target -Body $body -Referer "http://data.krx.co.kr/" -Jar $script:KRXCookies
    Send-Response $Stream 200 "application/json; charset=utf-8" $out
  } catch {
    Send-Json $Stream 502 ('{"error":"' + (Escape-Json $_.Exception.Message) + '"}')
  }
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
  if ($path -eq '/api/krx')   { Handle-Krx   $Stream $query; return }

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

# ---- start server ----
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
  Write-Host "[ERROR] No free port available." -ForegroundColor Red
  Read-Host "Press Enter to exit"
  return
}

$url = "http://localhost:$port/"
$line = ('=' * 56)
Write-Host $line
Write-Host "  Holdings briefing server is running (PowerShell edition)."
Write-Host "  Browser will open automatically:  $url"
Write-Host "  (If not, paste that address into your browser.)"
Write-Host ""
Write-Host "  * Do NOT close this window - the dashboard stops if you do." -ForegroundColor Yellow
Write-Host "  To stop: click this window and press Ctrl+C"
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
      $firstLine = $reqText.Split([char]10)[0]
      $parts = $firstLine.Split(' ')
      if ($parts.Length -ge 2) {
        Handle-Request $stream $parts[0] $parts[1]
      }
    }
  } catch {
    # ignore per-connection errors and keep serving
  } finally {
    if ($client) { try { $client.Close() } catch {} }
  }
}
