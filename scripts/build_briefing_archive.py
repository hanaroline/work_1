#!/usr/bin/env python3
"""브리핑 아카이브 페이지를 만든다.

docs/briefings/index.json 의 보관 목록과 그 옆의 원본 HTML 을 읽어

  docs/index.html                    아카이브 셸 (목록 + 검색 + 본문 보기)
  docs/briefings/search-index.json   소제목·본문 발췌 색인

두 개를 만든다. 색인은 셸 안에도 그대로 박아 넣으므로 목록과 검색은
파일을 그냥 열어도(file://) 동작한다. 본문 보기만 로컬 서버나
GitHub Pages 처럼 HTTP 로 열었을 때 동작한다 — 원본이 <html> 없는
아티팩트 본문이라 fetch 로 받아 UTF-8 로 직접 디코딩해 넣기 때문이다.

    python3 scripts/build_briefing_archive.py
"""

from __future__ import annotations

import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRIEF_DIR = ROOT / 'docs' / 'briefings'
INDEX_JSON = BRIEF_DIR / 'index.json'
OUT_INDEX = BRIEF_DIR / 'search-index.json'
OUT_PAGE = ROOT / 'docs' / 'index.html'

WEEKDAY_KO = ['월', '화', '수', '목', '금', '토', '일']
WEEKDAY_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

# 본문 발췌 길이. 검색은 이 범위 안에서만 걸린다. 브리핑 한 판이 450KB
# 이므로 전문을 색인하면 셸이 수 MB 가 된다.
EXCERPT_CHARS = 3500

# session 값 → 화면 라벨. index.json 에 label 이 있으면 그것을 우선한다.
SESSION_LABELS = {
    'morning': ('모닝 마켓', 'Morning'),
    'close': ('장마감', 'Close'),
    'global': ('해외 증시', 'Global'),
    'global-morning': ('해외 증시', 'Global'),
    'weekly': ('주간', 'Weekly'),
}


def strip_markup(src: str) -> str:
    """스타일·스크립트를 지우고 눈에 보이는 텍스트만 남긴다."""
    src = re.sub(r'<style\b[^>]*>.*?</style>', ' ', src, flags=re.S | re.I)
    src = re.sub(r'<script\b[^>]*>.*?</script>', ' ', src, flags=re.S | re.I)
    src = re.sub(r'<!--.*?-->', ' ', src, flags=re.S)
    # 블록 경계는 공백으로 벌려 단어가 붙지 않게 한다.
    src = re.sub(r'</(p|div|li|tr|h[1-6]|section|td|th)>', ' ', src, flags=re.I)
    src = re.sub(r'<[^>]+>', ' ', src)
    return re.sub(r'\s+', ' ', html.unescape(src)).strip()


def extract(path: Path) -> dict:
    src = path.read_text(encoding='utf-8')

    title = ''
    m = re.search(r'<title\b[^>]*>(.*?)</title>', src, flags=re.S | re.I)
    if m:
        title = strip_markup(m.group(1))

    headings: list[str] = []
    for m in re.finditer(r'<h([23])\b[^>]*>(.*?)</h\1>', src, flags=re.S | re.I):
        text = strip_markup(m.group(2))
        # 절 번호만 있는 껍데기나 지나치게 긴 것은 목차로 쓸모가 없다.
        if 2 <= len(text) <= 80 and text not in headings:
            headings.append(text)

    body = strip_markup(src)
    if title and body.startswith(title):
        body = body[len(title):].lstrip()

    return {
        # 목록에는 index.json 의 짧은 제목을 쓰고, 문서 제목은 검색용으로만 둔다.
        'doc_title': title,
        'headings': headings,
        'excerpt': body[:EXCERPT_CHARS],
        'chars': len(body),
        'bytes': path.stat().st_size,
    }


def build_entries() -> list[dict]:
    meta = json.loads(INDEX_JSON.read_text(encoding='utf-8'))
    entries = []
    for item in meta['briefings']:
        file = item.get('file')
        row = {
            'date': item['date'],
            'session': item.get('session') or '',
            'title': item.get('title') or '',
            'url': item.get('url'),
            'file': file,
        }

        d = date.fromisoformat(item['date'])
        row['weekday_ko'] = WEEKDAY_KO[d.weekday()]
        row['weekday_en'] = WEEKDAY_EN[d.weekday()]
        row['iso_week'] = f'{d.isocalendar().year}-W{d.isocalendar().week:02d}'

        label = SESSION_LABELS.get(row['session'])
        row['label_ko'] = item.get('label_ko') or (label[0] if label else row['session'])
        row['label_en'] = item.get('label_en') or (label[1] if label else row['session'])

        if file and (BRIEF_DIR / file).exists():
            row.update(extract(BRIEF_DIR / file))
            row['missing'] = False
        else:
            # url 만 남고 원본이 없는 항목. 목록에는 세우되 검색·보기는 막는다.
            row.update({'doc_title': '', 'headings': [], 'excerpt': '', 'chars': 0, 'bytes': 0})
            row['missing'] = True

        entries.append(row)

    entries.sort(key=lambda r: (r['date'], r['session']), reverse=True)
    return entries


PAGE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>브리핑 아카이브 | 미래에셋증권 마포WM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
  --primary:#F58220; --primary-active:#CB6015; --primary-soft:#FAB072;
  --secondary:#043B72;
  --canvas:#FFFFFF; --surface-soft:#ECEFF4; --surface-subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1; --highlight:#D7D7D7;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted-soft:#84888B;
  --on-primary:#FFFFFF;
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  --font-en:'Inter','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;
  --space-block:56px; --space-content:28px; --space-tight:14px;
}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--canvas); color:var(--body);
  font-family:var(--font-kr); font-size:19px; line-height:1.65;
  font-variant-numeric:tabular-nums;
}
html[lang="en"] body{font-family:var(--font-en)}
h1,h2,h3{color:var(--ink); margin:0}
a{color:var(--secondary)}

.page{max-width:1200px; margin:0 auto; padding:0 32px}
@media (max-width:768px){ .page{padding:0 20px} body{font-size:19px} }

/* ---------- hero ---------- */
.hero{background:var(--primary); color:var(--on-primary); padding:38px 0 34px}
.hero .page{display:flex; align-items:flex-start; justify-content:space-between; gap:19px}
.hero-tag{font-family:var(--font-en); font-size:14px; letter-spacing:.6px; opacity:.9; margin-bottom:10px}
.hero h1{color:var(--on-primary); font-size:34px; font-weight:700; letter-spacing:-.3px; line-height:1.25}
.hero p{margin:10px 0 0; font-size:17px; opacity:.95; max-width:62ch}
@media (max-width:768px){ .hero h1{font-size:26px} }

/* ---------- lang toggle ---------- */
.lang-toggle{display:flex; flex:none; border:1px solid var(--hairline); border-radius:2px;
  overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); background:#fff}
.lang-toggle button{
  font-family:var(--font-en); font-size:14px; font-weight:500; letter-spacing:.5px;
  padding:10px 17px; border:0; background:#fff; color:var(--muted); cursor:pointer;
}
.lang-toggle button+button{border-left:1px solid var(--hairline)}
.lang-toggle button[aria-checked="true"]{background:var(--primary); color:#fff}
.lang-toggle button:not([aria-checked="true"]):hover{background:var(--surface-subtle); color:var(--ink)}
.lang-toggle button:focus-visible{outline:2px solid var(--primary); outline-offset:-2px}

/* ---------- controls ---------- */
.controls{margin:var(--space-block) 0 var(--space-content)}
.section-rule{height:1px; background:var(--primary); margin-bottom:19px}
.section-title{font-size:26px; font-weight:600}
@media (max-width:768px){ .section-title{font-size:22px} }

.search-row{display:flex; gap:14px; flex-wrap:wrap; align-items:center; margin-top:19px}
#q{
  flex:1 1 320px; min-width:0; font:inherit; font-size:17px; padding:10px 14px;
  border:1px solid var(--hairline); border-radius:2px; background:#fff; color:var(--ink);
}
#q:focus-visible{outline:2px solid var(--primary); outline-offset:-2px}
.chips{display:flex; gap:8px; flex-wrap:wrap}
.chip{
  font-size:16px; font-weight:500; padding:9px 15px; border:1px solid var(--hairline);
  border-radius:2px; background:#fff; color:var(--muted); cursor:pointer;
}
.chip[aria-pressed="true"]{background:var(--primary); color:#fff; border-color:var(--primary)}
.chip:not([aria-pressed="true"]):hover{background:var(--surface-subtle); color:var(--ink)}
.chip:focus-visible{outline:2px solid var(--primary); outline-offset:-2px}
.count{font-size:14px; color:var(--muted); letter-spacing:.2px}

/* ---------- table ---------- */
.table-wrap{overflow-x:auto; margin-bottom:var(--space-block)}
table{border-collapse:collapse; width:100%; border:1px solid var(--hairline); font-size:17px}
th,td{padding:11px 14px; text-align:left; border-bottom:1px solid var(--hairline-soft); vertical-align:top}
thead th{background:var(--primary-soft); color:#1A1A1A; font-weight:700; font-size:16px; white-space:nowrap}
tbody tr{cursor:pointer}
tbody tr:hover{background:var(--surface-subtle)}
tbody tr[aria-selected="true"]{background:var(--highlight)}
tbody tr.missing{cursor:default; color:var(--muted-soft)}
tbody tr.missing:hover{background:transparent}
td.date{white-space:nowrap; font-family:var(--font-en); font-weight:500; color:var(--ink)}
td.kind{white-space:nowrap}
.kind-tag{
  display:inline-block; font-size:14px; font-weight:500; padding:2px 9px;
  border:1px solid var(--hairline); border-radius:2px; color:var(--body); background:#fff;
}
.kind-morning{border-color:var(--primary); color:var(--primary-active)}
.kind-close{border-color:var(--secondary); color:var(--secondary)}
.kind-global{border-color:var(--muted-soft); color:var(--muted)}
.kind-weekly{border-color:#0086B8; color:#0086B8}
td.topics{font-size:16px; color:var(--muted); line-height:1.5}
td.size{white-space:nowrap; font-family:var(--font-en); font-size:15px; color:var(--muted); text-align:right}
mark{background:var(--primary-soft); color:#1A1A1A; padding:0 2px}
.hit{display:block; font-size:15px; color:var(--body); margin-top:6px; line-height:1.5}
.empty{padding:28px 0; color:var(--muted)}

/* ---------- viewer ---------- */
.viewer{margin-bottom:var(--space-block); display:none}
.viewer.open{display:block}
.viewer-bar{
  display:flex; align-items:baseline; justify-content:space-between; gap:14px;
  flex-wrap:wrap; margin-bottom:14px;
}
.viewer-bar h3{font-size:22px; font-weight:600}
.viewer-actions{display:flex; gap:10px; flex-wrap:wrap}
.btn{
  font:inherit; font-size:16px; font-weight:500; padding:9px 17px; border-radius:2px;
  border:1px solid var(--hairline); background:#fff; color:var(--body);
  cursor:pointer; text-decoration:none; display:inline-block;
}
.btn-primary{background:var(--primary); border-color:var(--primary); color:#fff}
.btn-primary:hover{background:var(--primary-active); border-color:var(--primary-active)}
.btn:not(.btn-primary):hover{background:var(--surface-subtle); color:var(--ink)}
.btn:focus-visible{outline:2px solid var(--primary); outline-offset:2px}
#frame{width:100%; height:78vh; border:1px solid var(--hairline); background:#fff}
.viewer-note{font-size:14px; color:var(--muted); margin-top:10px}

footer{border-top:1px solid var(--hairline); padding:28px 0 56px; font-size:14px; color:var(--muted)}
footer p{margin:0 0 6px}

@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --canvas:#15171B; --surface-soft:#212630; --surface-subtle:#1B1F26;
    --hairline:#3A414C; --hairline-soft:#2A303A; --highlight:#272C34;
    --ink:#F1F3F6; --body:#CDD3DB; --muted:#98A0AB; --muted-soft:#7F8794;
    --primary:#FF9A4A; --primary-active:#FFB169; --primary-soft:#4A331E; --secondary:#82B7EA;
  }
  :root:not([data-theme="light"]) .lang-toggle,
  :root:not([data-theme="light"]) .lang-toggle button,
  :root:not([data-theme="light"]) #q,
  :root:not([data-theme="light"]) .chip,
  :root:not([data-theme="light"]) .btn,
  :root:not([data-theme="light"]) thead th,
  :root:not([data-theme="light"]) .kind-tag{background:#1A1E25; color:var(--body)}
  :root:not([data-theme="light"]) thead th{color:var(--ink)}
  :root:not([data-theme="light"]) .lang-toggle button[aria-checked="true"],
  :root:not([data-theme="light"]) .chip[aria-pressed="true"],
  :root:not([data-theme="light"]) .btn-primary{background:var(--primary); color:#241206}
  :root:not([data-theme="light"]) mark{background:#8A4410; color:#FFF1E4}
  :root:not([data-theme="light"]) .hero{background:#8A4410}
  :root:not([data-theme="light"]) .hero h1{color:#FFF1E4}
}

@media print{
  .lang-toggle,.controls .search-row,.viewer-actions{display:none !important}
  body{font-size:13pt; line-height:1.4}
  .page{max-width:100%; padding:0}
  table{page-break-inside:avoid}
}
</style>
</head>
<body>

<header class="hero">
  <div class="page">
    <div>
      <div class="hero-tag" data-en="INTERNAL USE">[사내한]</div>
      <h1 data-en="Briefing Archive">브리핑 아카이브</h1>
      <p data-en="Every morning, close and global brief published by Mapo WM, searchable by section heading and body text.">
        마포WM 이 발행한 모닝 · 장마감 · 해외 증시 브리핑 보관본입니다. 소제목과 본문으로 검색할 수 있습니다.
      </p>
    </div>
    <div class="lang-toggle" role="radiogroup" aria-label="언어 선택">
      <button type="button" role="radio" data-lang="ko" aria-checked="true">KO</button>
      <button type="button" role="radio" data-lang="en" aria-checked="false">EN</button>
    </div>
  </div>
</header>

<main class="page">

  <section class="controls">
    <div class="section-rule"></div>
    <h2 class="section-title" id="list" data-en="Published briefings">발행 목록</h2>
    <div class="search-row">
      <input id="q" type="search" placeholder="제목 · 소제목 · 본문 검색" data-en-placeholder="Search title, headings, body">
      <div class="chips" id="chips"></div>
      <span class="count" id="count"></span>
    </div>
  </section>

  <section class="viewer" id="viewer">
    <div class="section-rule"></div>
    <div class="viewer-bar">
      <h3 id="viewer-title"></h3>
      <div class="viewer-actions">
        <a class="btn btn-primary" id="open-new" target="_blank" rel="noopener" data-en="Open in new tab">새 창에서 열기</a>
        <a class="btn" id="open-artifact" target="_blank" rel="noopener" data-en="Artifact link">아티팩트 링크</a>
        <button class="btn" type="button" id="close-viewer" data-en="Close">닫기</button>
      </div>
    </div>
    <iframe id="frame" title="브리핑 본문"></iframe>
    <p class="viewer-note" id="viewer-note"></p>
  </section>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th data-en="Date">날짜</th>
          <th data-en="Edition">판</th>
          <th data-en="Title">제목</th>
          <th data-en="Sections">수록 항목</th>
          <th data-en="Size" style="text-align:right">분량</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <p class="empty" id="empty" hidden data-en="No briefing matches that search.">검색어에 맞는 브리핑이 없습니다.</p>
  </div>

</main>

<footer class="page">
  <p id="foot-count"></p>
  <p data-en="Body view decodes the source as UTF-8 over HTTP, so open this page through a local server or GitHub Pages. The list and search work from the file system too.">
    본문 보기는 원본을 HTTP 로 받아 UTF-8 로 디코딩하므로 로컬 서버나 GitHub Pages 에서 열어야 동작합니다. 목록과 검색은 파일로 열어도 됩니다.
  </p>
  <p data-en="Reference material for internal use. Figures are as published on the date shown.">
    사내 참고 자료입니다. 수치는 각 판의 발행 시점 기준입니다.
  </p>
</footer>

<script>
var DATA = __DATA__;
var BUILT_AT = "__BUILT_AT__";

var state = { q: '', kind: 'all', selected: null };

var KINDS = [
  { key: 'all',     ko: '전체',    en: 'All' },
  { key: 'morning', ko: '모닝',    en: 'Morning' },
  { key: 'close',   ko: '장마감',  en: 'Close' },
  { key: 'global',  ko: '해외',    en: 'Global' },
  { key: 'weekly',  ko: '주간',    en: 'Weekly' }
];

function lang() { return document.documentElement.getAttribute('lang') || 'ko'; }
function isEn() { return lang() === 'en'; }

/* session 값은 global-morning 처럼 겹치는 것이 있어 앞부분으로 묶는다. */
function kindOf(row) {
  var s = row.session || '';
  if (s.indexOf('global') === 0) return 'global';
  if (s.indexOf('weekly') === 0) return 'weekly';
  if (s.indexOf('close') === 0) return 'close';
  if (s.indexOf('morning') === 0) return 'morning';
  return 'other';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

/* 검색어가 걸린 자리를 앞뒤 문맥과 함께 한 줄로 돌려준다. */
function snippet(text, q) {
  var i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return '';
  var from = Math.max(0, i - 40);
  var to = Math.min(text.length, i + q.length + 90);
  var head = (from > 0 ? '… ' : '') + text.slice(from, i);
  var tail = text.slice(i + q.length, to) + (to < text.length ? ' …' : '');
  return esc(head) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(tail);
}

function matches(row, q) {
  if (!q) return { ok: true, where: '' };
  var lq = q.toLowerCase();
  var fields = [row.title, row.doc_title || '', (row.headings || []).join(' · '), row.excerpt || ''];
  for (var i = 0; i < fields.length; i++) {
    if ((fields[i] || '').toLowerCase().indexOf(lq) >= 0) {
      return { ok: true, where: snippet(fields[i], q) };
    }
  }
  return { ok: false, where: '' };
}

function fmtDate(row) {
  var wd = isEn() ? row.weekday_en : row.weekday_ko;
  return isEn() ? row.date + ' (' + wd + ')' : row.date.replace(/-/g, '.') + ' (' + wd + ')';
}

function fmtSize(row) {
  if (!row.chars) return '—';
  return Math.round(row.chars / 100) / 10 + (isEn() ? 'k chars' : '천자');
}

function render() {
  var q = state.q.trim();
  var body = document.getElementById('rows');
  var out = [];
  var shown = 0;

  DATA.forEach(function (row, idx) {
    if (state.kind !== 'all' && kindOf(row) !== state.kind) return;
    var m = matches(row, q);
    if (!m.ok) return;
    shown++;

    var kind = kindOf(row);
    var label = isEn() ? row.label_en : row.label_ko;
    var topics = (row.headings || []).slice(0, 4).join(' · ');
    var sel = state.selected === idx ? ' aria-selected="true"' : '';
    var cls = row.missing ? ' class="missing"' : '';

    out.push(
      '<tr data-idx="' + idx + '"' + sel + cls + '>' +
        '<td class="date">' + esc(fmtDate(row)) + '</td>' +
        '<td class="kind"><span class="kind-tag kind-' + kind + '">' + esc(label) + '</span></td>' +
        '<td>' + esc(row.title || '—') +
          (row.missing ? '<span class="hit">' + (isEn() ? 'source not archived' : '원본 미보관') + '</span>' : '') +
          (m.where ? '<span class="hit">' + m.where + '</span>' : '') +
        '</td>' +
        '<td class="topics">' + esc(topics) + '</td>' +
        '<td class="size">' + esc(fmtSize(row)) + '</td>' +
      '</tr>'
    );
  });

  body.innerHTML = out.join('');
  document.getElementById('empty').hidden = shown > 0;
  document.getElementById('count').textContent = isEn()
    ? shown + ' of ' + DATA.length
    : DATA.length + '판 중 ' + shown + '판';
}

function openRow(idx) {
  var row = DATA[idx];
  if (!row || row.missing) return;
  state.selected = idx;
  render();

  var viewer = document.getElementById('viewer');
  viewer.classList.add('open');
  document.getElementById('viewer-title').textContent = fmtDate(row) + ' · ' + (row.title || '');

  var src = 'briefings/' + row.file;
  /* 원본을 그대로 링크하면 charset 선언이 없어 한글이 깨진다. 아래에서
     디코딩이 끝나면 blob 주소로 갈아 끼우고, 그때까지는 원본을 가리켜 둔다. */
  var openNew = document.getElementById('open-new');
  openNew.href = src;
  if (openNew.dataset.blob) { URL.revokeObjectURL(openNew.dataset.blob); delete openNew.dataset.blob; }

  var artifact = document.getElementById('open-artifact');
  if (row.url) { artifact.href = row.url; artifact.hidden = false; }
  else { artifact.removeAttribute('href'); artifact.hidden = true; }

  var frame = document.getElementById('frame');
  var note = document.getElementById('viewer-note');
  note.textContent = isEn() ? 'Loading…' : '본문을 불러오는 중…';

  /* 원본은 <html>·<head> 없는 아티팩트 본문이다. 서버가 charset 을 주지
     않아도 한글이 깨지지 않게 바이트를 받아 UTF-8 로 직접 디코딩한 뒤,
     doctype 과 charset 을 붙여 iframe 에 넣는다. */
  fetch(src)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    })
    .then(function (buf) {
      var text = new TextDecoder('utf-8').decode(buf);
      var page =
        '<!doctype html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '</head><body>' + text + '</body></html>';
      frame.srcdoc = page;
      var blob = URL.createObjectURL(new Blob([page], { type: 'text/html;charset=utf-8' }));
      openNew.href = blob;
      openNew.dataset.blob = blob;
      note.textContent = isEn()
        ? 'Archived source: docs/briefings/' + row.file
        : '보관 원본: docs/briefings/' + row.file;
    })
    .catch(function (e) {
      frame.srcdoc = '';
      note.textContent = isEn()
        ? 'Could not load the source (' + e.message + '). Open this page over HTTP, or use the new-tab link.'
        : '본문을 불러오지 못했습니다 (' + e.message + '). 이 페이지를 HTTP 로 열거나 «새 창에서 열기» 를 쓰십시오.';
    });

  viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- 언어 ---------- */
function applyLang(l) {
  document.documentElement.setAttribute('lang', l);
  document.querySelectorAll('.lang-toggle button').forEach(function (b) {
    b.setAttribute('aria-checked', String(b.dataset.lang === l));
  });
  document.querySelectorAll('[data-en]').forEach(function (el) {
    if (!el.dataset.ko) el.dataset.ko = el.innerHTML;
    el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.ko;
  });
  var q = document.getElementById('q');
  if (!q.dataset.koPlaceholder) q.dataset.koPlaceholder = q.placeholder;
  q.placeholder = l === 'en' ? q.dataset.enPlaceholder : q.dataset.koPlaceholder;

  buildChips();
  render();
  document.getElementById('foot-count').textContent = l === 'en'
    ? DATA.length + ' briefings archived · index built ' + BUILT_AT
    : '보관 ' + DATA.length + '판 · 색인 생성 ' + BUILT_AT;
  try { localStorage.setItem('mas-archive-lang', l); } catch (e) {}
}

function buildChips() {
  var wrap = document.getElementById('chips');
  wrap.innerHTML = KINDS.map(function (k) {
    return '<button class="chip" type="button" data-kind="' + k.key + '" aria-pressed="' +
      (state.kind === k.key) + '">' + (isEn() ? k.en : k.ko) + '</button>';
  }).join('');
}

/* ---------- 이벤트 ---------- */
document.querySelector('.lang-toggle').addEventListener('click', function (e) {
  var b = e.target.closest('button[data-lang]');
  if (b) applyLang(b.dataset.lang);
});

document.getElementById('chips').addEventListener('click', function (e) {
  var b = e.target.closest('button[data-kind]');
  if (!b) return;
  state.kind = b.dataset.kind;
  buildChips();
  render();
});

document.getElementById('q').addEventListener('input', function (e) {
  state.q = e.target.value;
  render();
});

document.getElementById('rows').addEventListener('click', function (e) {
  var tr = e.target.closest('tr[data-idx]');
  if (tr) openRow(Number(tr.dataset.idx));
});

document.getElementById('close-viewer').addEventListener('click', function () {
  document.getElementById('viewer').classList.remove('open');
  document.getElementById('frame').srcdoc = '';
  state.selected = null;
  render();
});

var saved = 'ko';
try { saved = localStorage.getItem('mas-archive-lang') || 'ko'; } catch (e) {}
applyLang(saved);
</script>
</body>
</html>
"""


def main() -> None:
    entries = build_entries()

    OUT_INDEX.write_text(
        json.dumps({
            'note': '브리핑 보관본의 소제목·본문 발췌 색인. scripts/build_briefing_archive.py 가 만든다.',
            'builtAt': date.today().isoformat(),
            'excerptChars': EXCERPT_CHARS,
            'briefings': entries,
        }, ensure_ascii=False, indent=1) + '\n',
        encoding='utf-8',
    )

    page = (PAGE
            .replace('__DATA__', json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
            .replace('__BUILT_AT__', date.today().isoformat()))
    OUT_PAGE.write_text(page, encoding='utf-8')

    archived = sum(1 for e in entries if not e['missing'])
    print(f'{OUT_PAGE.relative_to(ROOT)} 생성 — {len(entries)}판 (원본 보관 {archived}판, '
          f'{OUT_PAGE.stat().st_size // 1024} KB)')
    print(f'{OUT_INDEX.relative_to(ROOT)} 생성 — 발췌 {EXCERPT_CHARS}자 기준')
    for e in entries:
        flag = ' (원본 없음)' if e['missing'] else ''
        print(f"  {e['date']} {e['label_ko']:<8} 소제목 {len(e['headings']):>2}개{flag}")


if __name__ == '__main__':
    main()
