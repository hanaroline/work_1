# 부서 자료실 - 목록 갱신 스크립트 (Windows / PowerShell)
#
# '자료' 폴더 아래의 분류 폴더를 훑어서 파일 목록을 만들고,
# '자료실.html' 안의 ARCHIVE 블록을 통째로 다시 씁니다.
#
# 사용법
#   1) '_목록갱신.cmd' 를 더블클릭        (가장 간단)
#   2) 또는 PowerShell 에서:
#      powershell -ExecutionPolicy Bypass -File "_목록갱신.ps1"
#
# 분류 폴더 이름 규칙
#   NN_분류명  (예: 01_리서치)  -> 앞 숫자는 정렬 순서, 화면에는 '리서치'만 표시
#   숫자 접두어가 없으면 이름순으로 뒤에 배치됩니다.
#
# 분류 설명(선택)
#   각 분류 폴더 안에 '_설명.txt' 를 두면 첫 줄이 분류 설명으로 표시됩니다.

$ErrorActionPreference = 'Stop'

$Here     = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootName = '자료'
$RootDir  = Join-Path $Here $RootName
$HtmlPath = Join-Path $Here '자료실.html'
$DescFile = '_설명.txt'

$SkipExact  = @('.ds_store', 'thumbs.db', 'desktop.ini', $DescFile.ToLower())
$SkipSuffix = @('.tmp', '.lnk')

function Test-Skippable([string]$Name) {
    $low = $Name.ToLower()
    if ($SkipExact -contains $low) { return $true }
    if ($Name.StartsWith('~$') -or $Name.StartsWith('.')) { return $true }
    foreach ($s in $SkipSuffix) { if ($low.EndsWith($s)) { return $true } }
    return $false
}

# JSON 문자열 이스케이프. 비ASCII 문자는 \uXXXX 로 바꿔 인코딩 사고를 원천 차단합니다.
function ConvertTo-JsonString([string]$Value) {
    if ($null -eq $Value) { return '""' }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('"')
    foreach ($ch in $Value.ToCharArray()) {
        $code = [int]$ch
        switch ($ch) {
            '"'  { [void]$sb.Append('\"');  continue }
            '\'  { [void]$sb.Append('\\');  continue }
            "`b" { [void]$sb.Append('\b');  continue }
            "`f" { [void]$sb.Append('\f');  continue }
            "`n" { [void]$sb.Append('\n');  continue }
            "`r" { [void]$sb.Append('\r');  continue }
            "`t" { [void]$sb.Append('\t');  continue }
            default {
                if ($code -lt 32 -or $code -gt 126) {
                    [void]$sb.Append('\u' + $code.ToString('x4'))
                } else {
                    [void]$sb.Append($ch)
                }
                continue
            }
        }
    }
    [void]$sb.Append('"')
    return $sb.ToString()
}

# 파일 링크용 상대 경로. 공백/한글이 있어도 브라우저가 열 수 있게 인코딩합니다.
function ConvertTo-UrlPath([string[]]$Parts) {
    $encoded = foreach ($p in $Parts) { [System.Uri]::EscapeDataString($p) }
    return ($encoded -join '/')
}

function Get-CategoryLabel([string]$DirName) {
    $m = [regex]::Match($DirName, '^(\d+)[_\-. ]\s*(.+)$')
    if ($m.Success) {
        return @{ Order = $m.Groups[1].Value; Label = $m.Groups[2].Value.Trim() }
    }
    return @{ Order = ''; Label = $DirName }
}

function Get-CategoryDesc([string]$CatDir) {
    $path = Join-Path $CatDir $DescFile
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return '' }
    try {
        $lines = Get-Content -LiteralPath $path -Encoding UTF8 -TotalCount 1
        if ($lines) { return ([string]$lines).Trim() }
    } catch { }
    return ''
}

if (-not (Test-Path -LiteralPath $RootDir -PathType Container)) {
    Write-Host "[오류] '$RootName' 폴더를 찾을 수 없습니다: $RootDir" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path -LiteralPath $HtmlPath -PathType Leaf)) {
    Write-Host "[오류] '자료실.html' 을 찾을 수 없습니다: $HtmlPath" -ForegroundColor Red
    exit 1
}

# ---------- 분류 폴더 수집 ----------
$catDirs = @(Get-ChildItem -LiteralPath $RootDir -Directory |
             Where-Object { -not (Test-Skippable $_.Name) })

$entries = @()
foreach ($d in $catDirs) {
    $info = Get-CategoryLabel $d.Name
    $entries += [PSCustomObject]@{
        Order   = $info.Order
        Label   = $info.Label
        DirName = $d.Name
        FullName= $d.FullName
    }
}
# 숫자 접두어가 있는 분류를 먼저, 그 다음 이름순
$entries = @($entries | Sort-Object @{ Expression = { if ($_.Order -eq '') { 1 } else { 0 } } },
                                    @{ Expression = { $_.Order } },
                                    @{ Expression = { $_.Label } })

# ---------- 카테고리 JSON 조립 ----------
$catJson = New-Object System.Collections.Generic.List[string]
$totalFiles = 0
$summary = @()

foreach ($e in $entries) {
    $files = @(Get-ChildItem -LiteralPath $e.FullName -File -Recurse |
               Where-Object { -not (Test-Skippable $_.Name) } |
               Sort-Object FullName)

    $fileJson = New-Object System.Collections.Generic.List[string]
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($e.FullName.Length).TrimStart('\', '/')
        $parts = @($RootName, $e.DirName) + @($rel -split '[\\/]')

        $ext  = if ($f.Extension) { $f.Extension.TrimStart('.').ToLower() } else { '' }
        $base = if ($f.Extension) { [System.IO.Path]::GetFileNameWithoutExtension($f.Name) } else { $f.Name }

        $fileJson.Add(
            '{"name":'  + (ConvertTo-JsonString $base) +
            ',"ext":'   + (ConvertTo-JsonString $ext) +
            ',"size":'  + $f.Length +
            ',"mtime":' + (ConvertTo-JsonString $f.LastWriteTime.ToString('yyyy-MM-dd')) +
            ',"path":'  + (ConvertTo-JsonString (ConvertTo-UrlPath $parts)) + '}'
        )
    }

    $id = [regex]::Replace($e.DirName, '[^0-9A-Za-z가-힣]+', '-').Trim('-')
    if ([string]::IsNullOrEmpty($id)) { $id = 'cat' }

    $catJson.Add(
        '{"id":'    + (ConvertTo-JsonString $id) +
        ',"name":'  + (ConvertTo-JsonString $e.Label) +
        ',"desc":'  + (ConvertTo-JsonString (Get-CategoryDesc $e.FullName)) +
        ',"files":[' + ($fileJson -join ',') + ']}'
    )

    $totalFiles += $files.Count
    $summary += [PSCustomObject]@{ Name = $e.Label; Count = $files.Count }
}

$generated = Get-Date -Format 'yyyy-MM-dd HH:mm'
$payload = '{"generated":' + (ConvertTo-JsonString $generated) +
           ',"root":'      + (ConvertTo-JsonString $RootName) +
           ',"categories":[' + ($catJson -join ',') + ']}'

# ---------- 자료실.html 의 ARCHIVE 블록 교체 ----------
$html = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

$begin = '/* ARCHIVE:BEGIN'
$end   = '/* ARCHIVE:END */'
$si = $html.IndexOf($begin)
$ei = $html.IndexOf($end)
if ($si -lt 0 -or $ei -lt 0 -or $ei -lt $si) {
    Write-Host "[오류] 자료실.html 에서 ARCHIVE 표시 구간을 찾지 못했습니다." -ForegroundColor Red
    exit 1
}

$block = '/* ARCHIVE:BEGIN — 이 블록은 목록 갱신 스크립트가 통째로 다시 씁니다. 직접 수정하지 마세요. */' +
         "`nwindow.ARCHIVE = " + $payload + ";`n"

$newHtml = $html.Substring(0, $si) + $block + $html.Substring($ei)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($HtmlPath, $newHtml, $utf8NoBom)

# ---------- 결과 보고 ----------
Write-Host ""
Write-Host "목록을 갱신했습니다. ($generated)" -ForegroundColor Green
Write-Host ("  분류 {0}개 / 자료 {1}건" -f $entries.Count, $totalFiles)
foreach ($s in $summary) {
    Write-Host ("    - {0}: {1}건" -f $s.Name, $s.Count)
}
Write-Host ""
Write-Host "'자료실.html' 을 브라우저로 여세요."
