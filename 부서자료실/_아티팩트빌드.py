#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
부서 자료실 — 게시용 단일 페이지 빌드

'자료실.html' 의 목록을 읽어, 링크된 자료를 전부 페이지 안에 담은 한 개의
HTML 을 만듭니다. 링크를 눌러 파일을 내려받을 필요 없이 그 자리에서 열립니다.

    python3 _아티팩트빌드.py [출력경로]

HTML 자료는 iframe 안에서 원본 그대로 렌더링하고, 그 밖의 텍스트 자료
(md · py · json 등) 는 원문을 그대로 보여 줍니다.
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_HTML = os.path.join(HERE, "자료실.html")
DEFAULT_OUT = os.path.join(HERE, "자료실-게시본.html")

# iframe 으로 렌더링할 확장자. 나머지는 원문을 그대로 보여 준다.
FRAME_EXT = {"html", "htm"}
# 아예 담지 않을 확장자 (브라우저에서 읽을 수 없는 형식)
BINARY_EXT = {"pdf", "xlsx", "xls", "pptx", "ppt", "docx", "doc",
              "hwp", "hwpx", "zip", "png", "jpg", "jpeg", "gif"}


def read_archive():
    html = open(SRC_HTML, encoding="utf-8").read()
    m = re.search(r"window\.ARCHIVE = (\{.*?\});\n/\* ARCHIVE:END", html, re.S)
    if not m:
        sys.exit("[오류] 자료실.html 에서 ARCHIVE 블록을 찾지 못했습니다.")
    return json.loads(m.group(1))


def load_documents(archive):
    """목록의 각 항목에 실제 내용을 붙인다."""
    from urllib.parse import unquote

    docs = []
    missing = []
    for cat in archive["categories"]:
        for f in cat["files"]:
            rel = unquote(f["path"])
            full = os.path.normpath(os.path.join(HERE, rel))
            if not os.path.isfile(full):
                missing.append(rel)
                continue

            ext = f["ext"]
            if ext in BINARY_EXT:
                kind, body = "binary", ""
            else:
                try:
                    body = open(full, encoding="utf-8", errors="replace").read()
                except OSError:
                    missing.append(rel)
                    continue
                kind = "frame" if ext in FRAME_EXT else "text"

            f["doc"] = len(docs)
            docs.append({"kind": kind, "body": body})

    return docs, missing


def to_json_script(value):
    """<script> 안에 안전하게 넣을 JSON. '</' 를 깨 두어 파서가 끊기지 않게 한다."""
    return json.dumps(value, ensure_ascii=False).replace("</", "<\\/")


TEMPLATE = """<title>부서 자료실</title>
<style>
/* 미래에셋 디자인 시스템을 그대로 따른다. 흰 캔버스에 오렌지 룰이 기본이라
   다크 팔레트를 따로 두지 않고, 대신 모든 색을 명시해 어떤 화면에서도
   같은 톤으로 서게 한다. */
:root{
  --primary:#F58220;
  --primary-active:#CB6015;
  --primary-soft:#FAB072;
  --secondary:#043B72;

  --canvas:#FFFFFF;
  --surface-subtle:#F7F8FA;
  --hairline:#CDCECB;
  --hairline-soft:#E5E4E1;

  --ink:#1A1A1A;
  --body:#3D3D3D;
  --muted:#6C6C6C;
  --muted-soft:#84888B;

  --space-block:56px;
  --space-content:28px;

  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Malgun Gothic','\\B9D1\\C740 \\ACE0\\B515','Apple SD Gothic Neo',sans-serif;
  --font-num:'Consolas','SF Mono','Menlo',monospace;
}
@media (max-width:768px){ :root{ --space-block:36px; } }

*{ box-sizing:border-box; }
html,body{ margin:0; padding:0; }
body{
  background:var(--canvas);
  color:var(--body);
  font-family:var(--font-kr);
  font-size:19px;
  line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
.page{ max-width:1200px; margin:0 auto; padding:0 32px 72px; }
@media (max-width:768px){ .page{ padding:0 20px 56px; } }

/* ---------- 머리말 ---------- */
.masthead{ padding-top:38px; }
.eyebrow{
  font-size:14px; font-weight:500; letter-spacing:.6px;
  color:var(--muted); text-transform:uppercase; margin:0 0 10px;
}
h1{
  font-size:34px; font-weight:700; line-height:1.25; letter-spacing:-.3px;
  color:var(--ink); margin:0; text-wrap:balance;
}
@media (max-width:768px){ h1{ font-size:26px; } }
.subtitle{ font-size:17px; color:var(--muted); margin:10px 0 0; max-width:64ch; }

.stat-row{
  display:grid; grid-template-columns:repeat(3,1fr); gap:19px;
  margin-top:var(--space-content);
}
.stat-card{ border:1px solid var(--hairline); border-radius:4px; padding:19px 24px; background:var(--canvas); }
.stat-label{ font-size:16px; font-weight:500; letter-spacing:.6px; line-height:1.2; color:var(--muted); margin:0 0 5px; }
.stat-value{
  font-size:48px; font-weight:700; line-height:1; letter-spacing:-.6px;
  color:var(--secondary); font-variant-numeric:tabular-nums; margin:0;
}
.stat-value.is-date{ font-size:26px; letter-spacing:0; padding-top:14px; padding-bottom:8px; }
.stat-value.accent{ color:var(--primary); }
@media (max-width:640px){
  .stat-row{ grid-template-columns:1fr; gap:0; border:1px solid var(--hairline); border-radius:4px; }
  .stat-card{
    border:0; border-top:1px solid var(--hairline-soft); border-radius:0;
    display:flex; align-items:baseline; justify-content:space-between; gap:14px; padding:12px 16px;
  }
  .stat-card:first-child{ border-top:0; }
  .stat-label{ margin:0; }
  .stat-value{ font-size:26px; }
  .stat-value.is-date{ font-size:19px; padding:0; }
}

/* ---------- 검색 ---------- */
.controls{ display:flex; gap:14px; flex-wrap:wrap; align-items:center; margin-top:var(--space-content); }
.search-wrap{ flex:1 1 320px; min-width:0; }
input[type="search"],select{
  font-family:inherit; font-size:17px; color:var(--ink);
  padding:10px 14px; min-height:42px;
  border:1px solid var(--hairline); border-radius:2px; background:var(--canvas);
}
input[type="search"]{ width:100%; }
select{ cursor:pointer; }
input:focus-visible,select:focus-visible{ outline:2px solid var(--primary); outline-offset:-2px; }
.result-count{ font-size:16px; color:var(--muted); font-variant-numeric:tabular-nums; }

.chip-row{ display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
.chip{
  font-size:16px; font-weight:500; text-decoration:none; color:var(--body);
  background:var(--canvas); border:1px solid var(--hairline); border-radius:2px; padding:6px 12px;
}
.chip:hover{ background:var(--surface-subtle); color:var(--ink); border-color:var(--muted-soft); }
.chip:focus-visible{ outline:2px solid var(--primary); outline-offset:2px; }
.chip-n{ color:var(--muted); font-variant-numeric:tabular-nums; margin-left:6px; }

/* ---------- 분류 ---------- */
.section{ margin-top:var(--space-block); }
.section-rule{ height:1px; background:var(--primary); margin-bottom:19px; }
.section-title{ font-size:26px; font-weight:600; line-height:1.3; color:var(--ink); margin:0; }
@media (max-width:768px){ .section-title{ font-size:22px; } }
.section-desc{ font-size:17px; color:var(--muted); margin:10px 0 0; }

.table-wrap{ margin-top:19px; border:1px solid var(--hairline); overflow-x:auto; }
table{ width:100%; border-collapse:collapse; font-size:17px; }
thead th{
  background:var(--primary-soft); color:var(--ink);
  font-size:16px; font-weight:700; text-align:left;
  padding:11px 14px; white-space:nowrap; border-bottom:1px solid var(--hairline);
}
tbody td{ padding:0; border-top:1px solid var(--hairline-soft); vertical-align:middle; }
tbody tr:hover{ background:var(--surface-subtle); }
th.col-type,td.col-type{ width:96px; }
th.col-size,td.col-size{ width:110px; }
th.col-date,td.col-date{ width:130px; }

/* 행 전체가 열기 버튼이다 */
.open{
  display:block; width:100%; text-align:left;
  font:inherit; color:var(--ink); font-weight:500;
  background:none; border:0; padding:11px 14px; cursor:pointer;
}
.open:hover{ color:var(--primary-active); text-decoration:underline; }
.open:focus-visible{ outline:2px solid var(--primary); outline-offset:-2px; }
.open[disabled]{ color:var(--muted-soft); cursor:default; text-decoration:none; }
td.col-type,td.col-size,td.col-date{ padding:11px 14px; }
td.col-size{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; color:var(--muted); }
td.col-date{ white-space:nowrap; font-variant-numeric:tabular-nums; color:var(--muted); }

.ext{
  display:inline-block; font-size:13px; font-weight:600; letter-spacing:.4px;
  text-transform:uppercase; padding:2px 8px; border-radius:2px;
  border:1px solid currentColor; background:var(--canvas); white-space:nowrap;
}
.ext-pdf{ color:#CB6015; } .ext-sheet{ color:#2E8540; } .ext-slide{ color:#AD624E; }
.ext-doc{ color:#043B72; } .ext-web{ color:#0086B8; } .ext-data{ color:#7E9FC3; }
.ext-etc{ color:#84888B; }

@media (max-width:640px){
  .table-wrap{ overflow-x:visible; }
  table,tbody,tr,td{ display:block; width:auto; }
  thead{ display:none; }
  tbody tr{ padding:12px 14px; border-top:1px solid var(--hairline-soft); }
  tbody tr:first-child{ border-top:0; }
  tbody td{ border-top:0; }
  td.col-size{ display:none; }
  .open{ padding:0 0 6px; }
  td.col-type,td.col-date{ display:inline-block; width:auto; padding:0; vertical-align:middle; }
  td.col-type{ margin-right:10px; }
  td.col-date{ font-size:14px; }
}

.empty{
  border:1px solid var(--hairline); border-radius:4px; background:var(--surface-subtle);
  padding:38px 28px; margin-top:19px; font-size:17px; color:var(--muted);
}
.empty strong{ display:block; color:var(--ink); font-size:19px; margin-bottom:10px; }

.notice{
  border:1px solid var(--hairline); border-left:3px solid var(--primary);
  background:var(--surface-subtle); border-radius:2px;
  padding:19px 24px; margin-top:var(--space-block); font-size:17px;
}
.notice p{ margin:0 0 10px; } .notice p:last-child{ margin-bottom:0; }
.notice strong{ color:var(--ink); }

footer{
  margin-top:var(--space-block); padding-top:28px;
  border-top:1px solid var(--hairline-soft);
  font-size:14px; line-height:1.5; color:var(--muted-soft);
}
footer p{ margin:0 0 5px; }

/* ---------- 열람창 ---------- */
.viewer{
  position:fixed; inset:0; z-index:50;
  background:var(--canvas); display:flex; flex-direction:column;
}
.viewer[hidden]{ display:none; }
.viewer-bar{
  display:flex; align-items:center; gap:14px;
  padding:12px 20px; border-bottom:1px solid var(--hairline);
  background:var(--canvas); flex:0 0 auto;
}
.viewer-title{
  flex:1 1 auto; min-width:0; margin:0;
  font-size:17px; font-weight:600; color:var(--ink);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.viewer-close{
  flex:0 0 auto; font:inherit; font-size:16px; font-weight:500;
  color:#FFFFFF; background:var(--primary); border:0; border-radius:2px;
  padding:8px 16px; min-height:38px; cursor:pointer;
}
.viewer-close:hover{ background:var(--primary-active); }
.viewer-close:focus-visible{ outline:2px solid var(--secondary); outline-offset:2px; }
.viewer-body{ flex:1 1 auto; min-height:0; overflow:auto; background:var(--canvas); }
.viewer-body iframe{ display:block; width:100%; height:100%; border:0; background:#FFFFFF; }
.viewer-body pre{
  margin:0; padding:24px;
  font-family:var(--font-num); font-size:14px; line-height:1.6; color:var(--body);
  white-space:pre-wrap; word-break:break-word;
}
</style>

<div class="page">

  <header class="masthead">
    <p class="eyebrow">미래에셋증권 마포WM · 부서 공유</p>
    <h1>부서 자료실</h1>
    <p class="subtitle">부서에서 만든 자료를 분류별로 모아 두었습니다. 자료명을 누르면 내려받지 않고 이 자리에서 바로 열립니다.</p>

    <div class="stat-row">
      <div class="stat-card">
        <p class="stat-label">전체 자료</p>
        <p class="stat-value" id="stat-files">0</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">분류</p>
        <p class="stat-value accent" id="stat-cats">0</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">목록 갱신</p>
        <p class="stat-value is-date" id="stat-updated">&mdash;</p>
      </div>
    </div>
  </header>

  <div class="controls">
    <div class="search-wrap">
      <label class="sr" for="q" hidden>자료 검색</label>
      <input type="search" id="q" autocomplete="off" placeholder="자료명 검색 (예: 모닝, 08-12, 플레이북)">
    </div>
    <label for="sort" hidden>정렬</label>
    <select id="sort">
      <option value="date">최신순</option>
      <option value="name">이름순</option>
      <option value="size">용량순</option>
    </select>
    <span class="result-count" id="count"></span>
  </div>

  <nav class="chip-row" id="chips" aria-label="분류 바로가기"></nav>

  <main id="categories"></main>

  <div class="notice">
    <p><strong>이 페이지에 대하여</strong></p>
    <p>자료 원본이 페이지 안에 담겨 있어 네트워크 없이도 열립니다. 종목 대시보드는 시세를 외부에서 받아오는데, 이 페이지에서는 외부 호출이 막혀 있어 내장 샘플 데이터로 표시됩니다.</p>
  </div>

  <footer>
    <p>원본은 GitHub 저장소 <span style="font-family:var(--font-num)">hanaroline/work_1</span> 의 <span style="font-family:var(--font-num)">부서자료실</span> 폴더에 있습니다.</p>
    <p>부서 공유용 자료입니다. 부서 외부로 반출하지 마십시오.</p>
  </footer>

</div>

<div class="viewer" id="viewer" hidden role="dialog" aria-modal="true" aria-labelledby="viewer-title">
  <div class="viewer-bar">
    <h2 class="viewer-title" id="viewer-title">&nbsp;</h2>
    <button type="button" class="viewer-close" id="viewer-close">닫기</button>
  </div>
  <div class="viewer-body" id="viewer-body"></div>
</div>

<script type="application/json" id="archive-data">__ARCHIVE__</script>
<script type="application/json" id="doc-data">__DOCS__</script>

<script>
(function () {
  "use strict";

  var DATA = JSON.parse(document.getElementById("archive-data").textContent);
  var DOCS = JSON.parse(document.getElementById("doc-data").textContent);

  var EXT_CLASS = {
    pdf:"ext-pdf",
    xlsx:"ext-sheet", xls:"ext-sheet", xlsm:"ext-sheet", csv:"ext-sheet",
    pptx:"ext-slide", ppt:"ext-slide",
    docx:"ext-doc", doc:"ext-doc", hwp:"ext-doc", md:"ext-doc", txt:"ext-doc",
    html:"ext-web", htm:"ext-web",
    json:"ext-data", js:"ext-data", mjs:"ext-data", py:"ext-data", sh:"ext-data"
  };

  function fmtSize(b){
    if (typeof b !== "number" || b < 0) return "\\u2014";
    if (b < 1024) return b + " B";
    var kb = b/1024;
    if (kb < 1024) return kb.toFixed(kb < 10 ? 1 : 0) + " KB";
    var mb = kb/1024;
    return mb.toFixed(mb < 10 ? 1 : 0) + " MB";
  }
  function fmtCount(n){ return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ","); }

  var state = { q:"", sort:"date" };
  var elCats  = document.getElementById("categories");
  var elChips = document.getElementById("chips");
  var elCount = document.getElementById("count");
  var elQ     = document.getElementById("q");
  var elSort  = document.getElementById("sort");

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function sortFiles(files){
    var a = files.slice();
    if (state.sort === "name")      a.sort(function(x,y){ return (x.name||"").localeCompare(y.name||"", "ko"); });
    else if (state.sort === "size") a.sort(function(x,y){ return (y.size||0) - (x.size||0); });
    else                            a.sort(function(x,y){ return String(y.mtime||"").localeCompare(String(x.mtime||"")); });
    return a;
  }

  /* ---------- 열람창 ---------- */
  var viewer      = document.getElementById("viewer");
  var viewerBody  = document.getElementById("viewer-body");
  var viewerTitle = document.getElementById("viewer-title");
  var viewerClose = document.getElementById("viewer-close");
  var lastFocus   = null;

  function openDoc(file){
    var doc = DOCS[file.doc];
    if (!doc) return;

    lastFocus = document.activeElement;
    viewerTitle.textContent = file.name;
    viewerBody.textContent = "";

    // 창을 먼저 띄운다. 숨겨진 채로 iframe 에 srcdoc 을 넣으면 브라우저가
    // 로드를 미뤄 빈 화면이 뜬다.
    viewer.hidden = false;
    document.body.style.overflow = "hidden";

    if (doc.kind === "frame") {
      var frame = document.createElement("iframe");
      frame.setAttribute("title", file.name);
      // allow-same-origin 은 주지 않는다. 문서 안 스크립트는 돌되
      // 이 페이지에는 손대지 못한다.
      frame.setAttribute("sandbox", "allow-scripts allow-popups");
      // srcdoc 은 반드시 DOM 에 붙인 뒤 넣는다. 떨어져 있는 iframe 에 먼저
      // 넣으면 로드가 걸리지 않아 빈 화면이 뜬다.
      viewerBody.appendChild(frame);
      frame.srcdoc = doc.body;
    } else {
      viewerBody.appendChild(el("pre", null, doc.body));
    }

    viewerClose.focus();
  }

  function closeDoc(){
    viewer.hidden = true;
    viewerBody.textContent = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  viewerClose.addEventListener("click", closeDoc);
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && !viewer.hidden) closeDoc();
  });

  /* ---------- 목록 ---------- */
  function buildTable(files){
    var wrap = el("div", "table-wrap");
    var table = document.createElement("table");

    var thead = document.createElement("thead");
    var hrow = document.createElement("tr");
    [["자료명",""],["형식","col-type"],["크기","col-size"],["수정일","col-date"]]
      .forEach(function(h){ hrow.appendChild(el("th", h[1] || null, h[0])); });
    thead.appendChild(hrow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    files.forEach(function(f){
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      var btn = el("button", "open", f.name);
      btn.type = "button";
      var doc = DOCS[f.doc];
      if (!doc || doc.kind === "binary") {
        btn.disabled = true;
        btn.title = "브라우저에서 열 수 없는 형식입니다";
      } else {
        btn.addEventListener("click", function(){ openDoc(f); });
      }
      tdName.appendChild(btn);
      tr.appendChild(tdName);

      var tdExt = el("td", "col-type");
      tdExt.appendChild(el("span", "ext " + (EXT_CLASS[f.ext] || "ext-etc"), f.ext || "?"));
      tr.appendChild(tdExt);

      tr.appendChild(el("td", "col-size", fmtSize(f.size)));
      tr.appendChild(el("td", "col-date", f.mtime || "\\u2014"));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function render(){
    var q = state.q.trim().toLowerCase();
    elCats.textContent = "";
    elChips.textContent = "";

    var shown = 0, total = 0, visible = 0;

    DATA.categories.forEach(function(cat){
      total += cat.files.length;
      var files = cat.files.filter(function(f){
        return !q || (f.name || "").toLowerCase().indexOf(q) !== -1;
      });
      if (!files.length) return;

      shown += files.length;
      visible += 1;

      var sec = el("section", "section");
      sec.id = "cat-" + cat.id;
      sec.appendChild(el("div", "section-rule"));
      sec.appendChild(el("h2", "section-title", cat.name));
      if (cat.desc) sec.appendChild(el("p", "section-desc", cat.desc));
      sec.appendChild(buildTable(sortFiles(files)));
      elCats.appendChild(sec);

      var chip = el("a", "chip", cat.name);
      chip.href = "#cat-" + cat.id;
      chip.appendChild(el("span", "chip-n", fmtCount(files.length)));
      elChips.appendChild(chip);
    });

    if (!visible) {
      var empty = el("div", "empty");
      empty.appendChild(el("strong", null, "검색 결과가 없습니다."));
      empty.appendChild(el("p", null, "다른 검색어로 시도해 보세요."));
      elCats.appendChild(empty);
    }

    document.getElementById("stat-files").textContent   = fmtCount(total);
    document.getElementById("stat-cats").textContent    = fmtCount(DATA.categories.length);
    document.getElementById("stat-updated").textContent = DATA.generated || "\\u2014";
    elCount.textContent = q ? fmtCount(total) + "건 중 " + fmtCount(shown) + "건" : "";
  }

  elQ.addEventListener("input", function(){ state.q = elQ.value; render(); });
  elSort.addEventListener("change", function(){ state.sort = elSort.value; render(); });
  render();
})();
</script>
"""


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT

    archive = read_archive()
    docs, missing = load_documents(archive)

    for rel in missing:
        sys.stderr.write("[경고] 담지 못한 자료: %s\n" % rel)

    html = (TEMPLATE
            .replace("__ARCHIVE__", to_json_script(archive))
            .replace("__DOCS__", to_json_script(docs)))

    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(html)

    kinds = {}
    for d in docs:
        kinds[d["kind"]] = kinds.get(d["kind"], 0) + 1

    print("게시본을 만들었습니다: %s" % out_path)
    print("  크기 %.1f MB" % (os.path.getsize(out_path) / 1024 / 1024))
    print("  담은 자료 %d건 (렌더링 %d · 원문 %d · 열 수 없음 %d)"
          % (len(docs), kinds.get("frame", 0), kinds.get("text", 0), kinds.get("binary", 0)))
    if missing:
        print("  담지 못한 자료 %d건" % len(missing))


if __name__ == "__main__":
    main()
