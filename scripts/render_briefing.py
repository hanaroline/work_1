#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
아침 증시시황 브리핑 렌더러 (JSON -> HTML)

  python3 scripts/render_briefing.py briefing/data/2026-08-04.json
  python3 scripts/render_briefing.py --all        # 전체 재생성
  python3 scripts/render_briefing.py --schema     # JSON 스키마 출력

네트워크를 사용하지 않는 순수 렌더러다. 데이터 수집은
.claude/skills/market-briefing/SKILL.md 절차에 따라 별도로 수행하고,
그 결과를 briefing/data/YYYY-MM-DD.json 으로 저장한 뒤 이 스크립트를 돌린다.

출력물
  briefing/YYYY-MM-DD.html   일자별 브리핑
  briefing/index.html        가장 최근 브리핑
  briefing/archive.html      일자 목록
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "briefing", "data")
OUT_DIR = os.path.join(ROOT, "briefing")

# ----------------------------------------------------------------------------
# 디자인 토큰 — Mirae Asset Design System
# ----------------------------------------------------------------------------
CSS = r"""
*, *::before, *::after { box-sizing: border-box; }
:root {
  --primary: #F58220;
  --primary-active: #CB6015;
  --primary-soft: #FAB072;
  --secondary: #043B72;
  --canvas: #FFFFFF;
  --surface-soft: #ECEFF4;
  --surface-subtle: #F7F8FA;
  --hairline: #CDCECB;
  --hairline-soft: #E5E4E1;
  --ink: #1A1A1A;
  --body: #3D3D3D;
  --muted: #6C6C6C;
  --muted-soft: #84888B;
  --line-dark: #49535B;
  --up: #C62828;
  --down: #043B72;
  --warning: #D4A017;
  --success: #2E8540;
  --font-kr: 'Spoqa Han Sans Neo', 'Noto Sans KR', sans-serif;
  --font-en: 'Inter', 'Aptos', 'Segoe UI', system-ui, sans-serif;
  --font-num: 'Inter', 'SF Mono', monospace;
  --space-section: 104px;
  --space-block: 56px;
  --space-content: 28px;
  --space-tight: 14px;
}
@media (max-width: 768px) {
  :root { --space-section: 72px; --space-block: 36px; }
}
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--canvas);
  color: var(--body);
  font-family: var(--font-kr);
  font-size: 19px;
  line-height: 1.65;
  font-variant-numeric: tabular-nums;
}
html[lang="en"] body { font-family: var(--font-en); }
.num { font-family: var(--font-num); font-variant-numeric: tabular-nums; }
a { color: var(--secondary); text-decoration: none; border-bottom: 1px solid var(--hairline); }
a:hover { color: var(--primary-active); border-bottom-color: var(--primary); }
strong { color: var(--ink); font-weight: 700; }

.page { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 768px) { .page { padding: 0 20px; } }

/* ---- 본문 + 사이드바 레이아웃 ---- */
.shell { display: block; }
@media (min-width: 1080px) {
  .shell { display: grid; grid-template-columns: 208px minmax(0, 1fr); gap: 48px; align-items: start; }
  .sidenav { position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto;
             padding-bottom: 19px; }
  .shell > main { min-width: 0; }
  .shell > main > .section:first-child { margin-top: 56px; }
}
.sidenav-label {
  font-size: 14px; font-weight: 500; letter-spacing: .6px; color: var(--muted-soft);
  margin: 0 0 10px; padding-bottom: 8px; border-bottom: 1px solid var(--primary);
}
.sidenav ul { list-style: none; margin: 0 0 28px; padding: 0; }
.sidenav ul:last-of-type { margin-bottom: 14px; }
.sidenav a {
  display: block; font-size: 16px; line-height: 1.35; color: var(--body);
  padding: 7px 0 7px 12px; border: 0; border-left: 2px solid transparent;
}
.sidenav a:hover { color: var(--primary-active); border-left-color: var(--hairline); background: var(--surface-subtle); }
.sidenav a[aria-current] { color: var(--primary-active); font-weight: 700; border-left-color: var(--primary); }
.sidenav-dates a { font-family: var(--font-num); font-size: 15px; font-variant-numeric: tabular-nums; }
.sidenav-more { font-size: 14px; padding-left: 12px; }
.sidenav-more a { display: inline; padding: 0; border-left: 0; border-bottom: 1px solid var(--hairline); }
.section { scroll-margin-top: 24px; }

/* 좁은 화면 — 사이드바를 상단 가로 스크롤 칩 줄로 전환 */
@media (max-width: 1079px) {
  .sidenav {
    position: sticky; top: 0; z-index: 5; background: var(--canvas);
    border-bottom: 1px solid var(--hairline); padding: 12px 0 10px; margin-bottom: 28px;
  }
  .sidenav-label { display: none; }
  .sidenav ul { display: flex; gap: 8px; overflow-x: auto; margin: 0 0 8px;
                -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
  .sidenav ul:last-of-type { margin-bottom: 0; }
  .sidenav ul li { flex: none; }
  .sidenav a {
    padding: 6px 12px; border: 1px solid var(--hairline); border-radius: 2px;
    white-space: nowrap; font-size: 15px;
  }
  .sidenav a[aria-current] { background: var(--primary); color: #FFFFFF; border-color: var(--primary); }
  .sidenav-more { display: none; }
  .section { scroll-margin-top: 96px; }
}

/* ---- 오른쪽 상세 패널 ----
   넓은 화면에서는 항목을 클릭하면 본문 아래로 펼치지 않고 오른쪽 패널에 띄운다.
   요약(왼쪽)과 근거(오른쪽)를 동시에 보게 하려는 것. 1400px 미만에서는
   패널을 쓸 만한 가로 여유가 없으므로 기존의 인라인 펼침으로 되돌아간다. */
.detailpane { display: none; }
@media (min-width: 1400px) {
  .page.wide { max-width: 1680px; }
  .page.wide .shell {
    grid-template-columns: 200px minmax(0, 1fr) 340px; gap: 36px;
  }
  .detailpane {
    display: block; position: sticky; top: 24px; align-self: start;
    max-height: calc(100vh - 48px); overflow-y: auto;
    border-top: 1px solid var(--primary); padding: 14px 0 19px;
  }
  /* 본문 폭이 좁아지므로 지표 카드는 아주 넓은 화면에서만 4열을 유지한다. */
  .pane-mode .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1680px) {
  .page.wide .shell { grid-template-columns: 200px minmax(0, 1fr) 380px; gap: 40px; }
  .pane-mode .stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.hint-pane { display: none; }
@media (min-width: 1400px) {
  .hint-inline { display: none; }
  .hint-pane { display: inline; }
}
.dp-head {
  display: flex; align-items: flex-start; gap: 10px;
  padding-bottom: 12px; border-bottom: 1px solid var(--hairline); margin-bottom: 16px;
}
.dp-head > div { min-width: 0; flex: 1 1 auto; }
.dp-kicker {
  font-size: 13px; font-weight: 500; letter-spacing: .5px;
  color: var(--primary-active); margin: 0 0 3px;
}
.dp-kicker:empty { display: none; }
.dp-title { font-size: 17px; font-weight: 700; line-height: 1.4; color: var(--ink); margin: 0; }
.dp-title strong { font-weight: 700; }
.dp-close {
  flex: none; width: 26px; height: 26px; padding: 0; cursor: pointer;
  border: 1px solid var(--hairline); border-radius: 2px; background: #FFFFFF;
  font-family: var(--font-num); font-size: 17px; line-height: 22px; color: var(--muted);
}
.dp-close:hover { border-color: var(--primary); color: var(--primary-active); }
.dp-empty { font-size: 16px; line-height: 1.6; color: var(--muted); margin: 0; }
.detailpane .detail {
  margin: 0; padding: 0; background: none; border-left: 0; border-radius: 0;
}
.detailpane .detail > p { font-size: 16px; max-width: none; }
.detailpane .detail dd { font-size: 16px; }
.detailpane .detail-label { display: none; }   /* 패널 머리글이 이미 '상세' 역할 */
.detail-title { display: none; }

/* ---- 한/영 토글 ---- */
.topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-top: 24px; }
.tag {
  display: inline-block; font-size: 14px; letter-spacing: .6px; font-weight: 500;
  color: var(--muted); border: 1px solid var(--hairline); padding: 4px 10px; border-radius: 2px;
}
.lang-toggle { display: inline-flex; border: 1px solid var(--hairline); border-radius: 2px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); flex: none; }
.lang-toggle button {
  font-family: var(--font-en); font-size: 14px; font-weight: 500; letter-spacing: .5px;
  padding: 10px 17px; border: 0; background: #FFFFFF; color: var(--muted); cursor: pointer;
}
.lang-toggle button + button { border-left: 1px solid var(--hairline); }
.lang-toggle button:hover:not([aria-checked="true"]) { background: var(--surface-subtle); color: var(--ink); }
.lang-toggle button[aria-checked="true"] { background: var(--primary); color: #FFFFFF; }
.lang-toggle button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* ---- Hero ---- */
.hero { margin-top: 28px; padding-bottom: var(--space-block); border-bottom: 1px solid var(--hairline-soft); }
.hero-kicker { font-size: 16px; font-weight: 500; letter-spacing: .6px; color: var(--primary-active); margin: 0 0 14px; }
.hero h1 { font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.5px; color: var(--ink); margin: 0 0 19px; }
.hero-lede { font-size: 21px; line-height: 1.6; color: var(--body); margin: 0; max-width: 62em; }
.hero-meta { margin-top: 19px; font-size: 14px; letter-spacing: .2px; color: var(--muted-soft); }
@media (max-width: 768px) { .hero h1 { font-size: 32px; } .hero-lede { font-size: 19px; } }

.tone { display: inline-block; font-size: 14px; font-weight: 500; letter-spacing: .4px; padding: 4px 10px; border-radius: 2px; color: #FFFFFF; background: var(--muted-soft); }
.tone.risk-off { background: var(--up); }
.tone.risk-on { background: var(--success); }
.tone.mixed { background: var(--warning); }
.tone.neutral { background: var(--muted-soft); }

/* ---- 섹션 ---- */
.section { margin-top: var(--space-section); }
.section-rule { height: 1px; background: var(--primary); margin-bottom: 19px; }
.section-title { font-size: 26px; font-weight: 700; letter-spacing: 0; color: var(--ink); margin: 0 0 var(--space-content); }
@media (max-width: 768px) { .section-title { font-size: 22px; } }
.section h3 { font-size: 22px; font-weight: 600; color: var(--ink); margin: var(--space-block) 0 var(--space-tight); }
@media (max-width: 768px) { .section h3 { font-size: 19px; } }
.section h3:first-of-type { margin-top: 0; }
.section p { margin: 0 0 var(--space-content); max-width: 62em; }
.sub { font-size: 17px; line-height: 1.55; color: var(--muted); }

/* ---- 핵심 요약 ---- */
.keypoints { list-style: none; margin: 0; padding: 0; counter-reset: kp; }
.keypoints > li {
  counter-increment: kp; position: relative; padding: 19px 0 19px 52px;
  border-bottom: 1px solid var(--hairline-soft);
}
.keypoints > li:first-child { border-top: 1px solid var(--hairline-soft); }
.keypoints > li::before {
  content: counter(kp, decimal-leading-zero); position: absolute; left: 0; top: 21px;
  font-family: var(--font-num); font-size: 16px; font-weight: 700; color: var(--primary);
  letter-spacing: .6px;
}

/* ---- 지표 카드 ---- */
/* minmax(0, 1fr) — 1fr 만 쓰면 트랙이 min-content 밑으로 못 줄어들어 가로 넘침이 생긴다.
   사이드바가 붙어 본문 폭이 좁아지므로 4열은 넉넉한 화면에서만 쓴다. */
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--hairline-soft); border: 1px solid var(--hairline); }
@media (max-width: 1279px) { .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .stat-grid { grid-template-columns: minmax(0, 1fr); } }
.stat { background: #FFFFFF; padding: 24px 22px; }
.stat-label { font-size: 16px; font-weight: 500; letter-spacing: .6px; line-height: 1.2; color: var(--muted); margin: 0 0 10px; }
.stat-value { font-family: var(--font-num); font-size: 34px; font-weight: 700; line-height: 1.0; letter-spacing: -0.6px; color: var(--ink); }
.stat-chg { font-size: 14px; line-height: 1.4; margin-top: 10px; font-family: var(--font-num); }
.stat-chg.up { color: var(--up); }
.stat-chg.down { color: var(--down); }
.stat-chg.flat { color: var(--muted-soft); }
.stat-note { font-size: 14px; line-height: 1.4; color: var(--muted-soft); margin-top: 8px; font-family: var(--font-kr); }
html[lang="en"] .stat-note { font-family: var(--font-en); }
.hero-stat .stat-value { font-size: 48px; }

/* ---- 표 ---- */
.table-wrap { overflow-x: auto; border: 1px solid var(--hairline); }
table.data { width: 100%; border-collapse: collapse; font-size: 17px; min-width: 560px; }
table.data caption { caption-side: top; text-align: left; font-size: 14px; color: var(--muted-soft); padding: 0 0 10px; }
table.data th, table.data td { padding: 12px 14px; border-bottom: 1px solid var(--hairline-soft); text-align: left; vertical-align: top; }
table.data thead th { background: var(--primary-soft); color: var(--ink); font-size: 16px; font-weight: 700; white-space: nowrap; }
table.data tbody tr:hover { background: var(--surface-subtle); }
table.data td.n, table.data th.n { text-align: right; font-family: var(--font-num); white-space: nowrap; }
table.data td.up { color: var(--up); }
table.data td.down { color: var(--down); }
table.data tr.hl td { background: #D7D7D7; font-weight: 700; }
table.data tr.hl:hover td { background: #D7D7D7; }

/* ---- 등락률 바 ---- */
.bars { display: grid; gap: 10px; margin: 0 0 var(--space-content); }
.bar-row { display: grid; grid-template-columns: minmax(96px, 168px) 1fr 74px; align-items: center; gap: 14px; font-size: 16px; }
.bar-name { color: var(--body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-track { position: relative; height: 20px; background: var(--surface-subtle); border: 1px solid var(--hairline-soft); }
.bar-track .zero { position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: var(--hairline); }
.bar-fill { position: absolute; top: 3px; bottom: 3px; }
.bar-fill.up { background: var(--up); left: 50%; }
.bar-fill.down { background: var(--down); }
.bar-val { text-align: right; font-family: var(--font-num); font-size: 16px; }
.bar-val.up { color: var(--up); }
.bar-val.down { color: var(--down); }
.bar-val.flat { color: var(--muted-soft); }

/* ---- 하우스 뷰 ---- */
.views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--hairline-soft); border: 1px solid var(--hairline); }
@media (max-width: 1023px) { .views { grid-template-columns: minmax(0, 1fr); } }
.view { background: #FFFFFF; padding: 24px 22px; }
.view-firm { font-size: 16px; font-weight: 700; letter-spacing: .3px; color: var(--primary-active); margin: 0 0 4px; }
.view-who { font-size: 14px; color: var(--muted-soft); margin: 0 0 12px; }
.view-body { font-size: 17px; line-height: 1.55; margin: 0; color: var(--body); }
.view-stance { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 500; letter-spacing: .4px; padding: 3px 9px; border-radius: 2px; border: 1px solid var(--hairline); color: var(--muted); }
.view-stance.bull { border-color: var(--up); color: var(--up); }
.view-stance.bear { border-color: var(--down); color: var(--down); }
.view-stance.neutral { border-color: var(--muted-soft); color: var(--muted); }

/* ---- 콜아웃 ---- */
.callout { background: var(--primary); color: #FFFFFF; border-radius: 4px; padding: 38px; margin: 0 0 var(--space-content); }
.callout h3 { color: #FFFFFF; margin: 0 0 14px; font-size: 22px; font-weight: 600; }
.callout p, .callout li { color: #FFFFFF; }
.callout ul { margin: 0; padding-left: 22px; }
.callout li { margin-bottom: 10px; font-size: 17px; line-height: 1.55; }
.callout li:last-child { margin-bottom: 0; }
.soft-card { background: var(--surface-soft); border-radius: 4px; padding: 28px; }
.soft-card h3 { margin-top: 0; }

/* ---- 리스크 / 체크리스트 ---- */
.risks { list-style: none; margin: 0; padding: 0; }
.risks > li { padding: 14px 0 14px 22px; border-bottom: 1px solid var(--hairline-soft); position: relative; font-size: 17px; line-height: 1.55; }
.risks > li::before { content: ""; position: absolute; left: 0; top: 24px; width: 10px; height: 1px; background: var(--primary); }
.qa { margin: 0; }

/* ---- 출처 / 푸터 ---- */
.sources { list-style: none; margin: 0; padding: 0; font-size: 14px; line-height: 1.5; columns: 2; column-gap: 38px; }
@media (max-width: 768px) { .sources { columns: 1; } }
.sources li { margin-bottom: 10px; break-inside: avoid; }
.sources .pub { color: var(--muted-soft); }
footer.foot { margin-top: var(--space-section); padding: 28px 0 56px; border-top: 1px solid var(--hairline); font-size: 14px; color: var(--muted-soft); }
footer.foot p { margin: 0 0 8px; max-width: none; }
.navlinks { margin-top: 19px; font-size: 16px; }
.navlinks a { margin-right: 19px; }

/* ---- 아카이브 ---- */
.arch { list-style: none; margin: 0; padding: 0; }
.arch li { border-bottom: 1px solid var(--hairline-soft); }
.arch li:first-child { border-top: 1px solid var(--hairline-soft); }
.arch a { display: grid; grid-template-columns: 140px 1fr; gap: 19px; padding: 19px 0; border: 0; align-items: baseline; }
@media (max-width: 640px) { .arch a { grid-template-columns: 1fr; gap: 6px; } }
.arch a:hover { background: var(--surface-subtle); }
.arch .d { font-family: var(--font-num); font-size: 16px; color: var(--primary-active); font-weight: 700; }
.arch .t { font-size: 19px; color: var(--ink); }

/* ---- 클릭 드릴다운 ---- */
.exp > summary {
  cursor: pointer; list-style: none; display: block; position: relative;
  padding-right: 34px;
}
.exp > summary::-webkit-details-marker { display: none; }
.exp > summary::marker { content: ""; }
.exp > summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
.exp-mark {
  position: absolute; right: 0; top: 0; width: 22px; height: 22px; flex: none;
  border: 1px solid var(--hairline); border-radius: 2px; background: #FFFFFF;
  font-family: var(--font-num); font-size: 15px; font-weight: 700; line-height: 20px;
  text-align: center; color: var(--primary-active);
}
.exp > summary:hover .exp-mark { background: var(--primary); border-color: var(--primary); color: #FFFFFF; }
.exp[open] > summary .exp-mark::after { content: "\2212"; }
.exp:not([open]) > summary .exp-mark::after { content: "+"; }

.detail {
  margin-top: 19px; padding: 19px 22px; background: var(--surface-subtle);
  border-left: 2px solid var(--primary); border-radius: 0 2px 2px 0;
}
.detail > p { font-size: 17px; line-height: 1.6; margin: 0 0 14px; max-width: 62em; }
.detail > p:last-child { margin-bottom: 0; }
.detail dl { margin: 0 0 14px; }
.detail dl:last-child { margin-bottom: 0; }
.detail dt { font-size: 14px; font-weight: 500; letter-spacing: .4px; color: var(--muted); margin-top: 12px; }
.detail dt:first-child { margin-top: 0; }
.detail dd { margin: 2px 0 0; font-size: 17px; line-height: 1.5; color: var(--ink); }
.detail dd.n { font-variant-numeric: tabular-nums; letter-spacing: 0; }
.detail-links { margin: 14px 0 0; padding: 0; list-style: none; font-size: 14px; line-height: 1.5; }
.detail-links li { margin-bottom: 6px; }
.detail-links li::before { content: "\2192"; color: var(--primary); margin-right: 8px; }
.detail-label {
  display: block; font-size: 14px; font-weight: 500; letter-spacing: .5px;
  color: var(--primary-active); margin-bottom: 10px;
}

/* keypoints / risks / talking points 안의 details */
.keypoints > li > .exp > summary, .risks > li > .exp > summary { padding-right: 34px; }
.qa .exp { border-bottom: 1px solid var(--hairline-soft); padding: 19px 0; }
.qa .exp:first-child { border-top: 1px solid var(--hairline-soft); }
.qa .exp > summary { font-size: 19px; font-weight: 700; color: var(--ink); }
.qa .exp > summary .exp-mark { top: 2px; }

/* 카드형 details */
details.stat > summary, details.view > summary { padding-right: 34px; }
details.stat > summary .exp-mark, details.view > summary .exp-mark { top: -2px; }
details.stat[open], details.view[open] { background: #FFFFFF; }

/* 표 행 확장 */
table.data tr.clickable { cursor: pointer; }
table.data tr.clickable td:first-child { padding-left: 34px; position: relative; }
table.data tr.clickable td:first-child::before {
  content: "+"; position: absolute; left: 14px; top: 12px;
  font-family: var(--font-num); font-size: 15px; font-weight: 700; color: var(--primary-active);
}
table.data tr.clickable[aria-expanded="true"] td:first-child::before { content: "\2212"; }
table.data tr.clickable:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
table.data tr.detail-row > td { background: var(--surface-subtle); padding: 0; }
table.data tr.detail-row:hover > td { background: var(--surface-subtle); }
table.data tr.detail-row .detail { margin: 0; border-radius: 0; }
table.data tr.detail-row[hidden] { display: none; }

/* 전체 펼치기 버튼 */
.expand-all {
  font-family: var(--font-kr); font-size: 14px; font-weight: 500; letter-spacing: .3px;
  padding: 9px 15px; border: 1px solid var(--hairline); border-radius: 2px;
  background: #FFFFFF; color: var(--muted); cursor: pointer; white-space: nowrap;
}
html[lang="en"] .expand-all { font-family: var(--font-en); }
.expand-all:hover { background: var(--surface-subtle); color: var(--ink); border-color: var(--line-mid); }
.expand-all:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.print-btn {
  font-family: var(--font-kr); font-size: 14px; font-weight: 500; letter-spacing: .3px;
  padding: 9px 15px; border: 1px solid var(--primary); border-radius: 2px;
  background: var(--primary); color: #FFFFFF; cursor: pointer; white-space: nowrap;
}
html[lang="en"] .print-btn { font-family: var(--font-en); }
.print-btn:hover { background: var(--primary-active); border-color: var(--primary-active); }
.print-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.print-btn.alt { background: #FFFFFF; color: var(--primary-active); }
.print-btn.alt:hover { background: var(--surface-subtle); border-color: var(--primary-active); }
.expand-all .lbl-collapse { display: none; }
.expand-all[aria-pressed="true"] .lbl-expand { display: none; }
.expand-all[aria-pressed="true"] .lbl-collapse { display: inline; }
.topbar-actions { display: flex; align-items: center; gap: 10px; flex: none; }
@media (max-width: 680px) {
  .topbar { flex-wrap: wrap; }
  .topbar-actions { width: 100%; justify-content: flex-end; flex-wrap: wrap; row-gap: 10px; }
}
.hint { font-size: 14px; color: var(--muted-soft); margin: 14px 0 0; }

/* ---- 패널 모드 표시 (드릴다운 기본 규칙을 덮어야 하므로 반드시 그 뒤에 온다) ----
   '+' 는 아래로 펼친다는 뜻이므로, 옆 패널에 띄우는 모드에서는 '›' 로 바꾼다. */
.pane-mode .exp > summary .exp-mark::after,
.pane-mode .exp[open] > summary .exp-mark::after,
.pane-mode .exp:not([open]) > summary .exp-mark::after { content: "\203A"; }
.pane-mode table.data tr.clickable td:first-child::before,
.pane-mode table.data tr.clickable[aria-expanded="true"] td:first-child::before { content: "\203A"; }
.pane-mode .exp.pane-active > summary {
  background: var(--surface-subtle); box-shadow: inset 2px 0 0 var(--primary);
}
.pane-mode .exp.pane-active > summary .exp-mark {
  background: var(--primary); border-color: var(--primary); color: #FFFFFF;
}
.pane-mode table.data tr.pane-active > td,
.pane-mode table.data tr.pane-active:hover > td { background: var(--surface-soft); }
.pane-mode table.data tr.pane-active td:first-child { box-shadow: inset 2px 0 0 var(--primary); }
.pane-mode table.data tr.pane-active td:first-child::before { color: var(--primary); }

[data-lang-en] { display: none; }
html[lang="en"] [data-lang-ko] { display: none; }
html[lang="en"] [data-lang-en] { display: revert; }

@media print {
  .lang-toggle, .navlinks, .expand-all, .print-btn, .hint, .sidenav,
  .detailpane { display: none !important; }
  .shell, .page.wide .shell { display: block !important; }
  /* 인쇄는 화면 상태를 그대로 따른다(WYSIWYG). 접힌 상세는 인쇄에도 포함되지 않는다.
     '요약 PDF' / '전체 PDF' 버튼이 인쇄 직전에 전개 상태를 맞춘 뒤 복원한다. */
  /* 상세 패널의 근거 수치를 2열로 눕혀 지면을 절약한다 */
  .detail dl { display: grid; grid-template-columns: 32% 1fr; column-gap: 10px; row-gap: 3px; }
  .detail dt, .detail dd { margin: 0 !important; font-size: 9.5pt; }
  .detail { padding: 10px 12px; margin-top: 10px; }
  .detail > p { font-size: 10pt; margin-bottom: 8px; }
  .detail-label { margin-bottom: 6px; }
  .exp > summary { padding-right: 0; }
  .exp-mark, table.data tr.clickable td:first-child::before { display: none !important; }
  table.data tr.clickable td:first-child { padding-left: 14px; }
  .detail { background: #FFF; border-left: 2px solid #999; break-inside: avoid; }
  .detail-links { display: none; }
  body { font-size: 11pt; line-height: 1.4; color: #000; }
  .page { max-width: 100%; padding: 0; }
  .section { margin-top: 28px; }
  :root { --space-section: 28px; --space-block: 19px; --space-content: 14px; }
  .hero h1 { font-size: 24pt; }
  .hero-lede { font-size: 12pt; }
  .section-title { font-size: 15pt; }
  .stat-grid, .views { break-inside: avoid; }
  .section-rule, .section-title, h3 { break-after: avoid; }
  table, .stat, .view, .callout { break-inside: avoid; }
  .callout { background: #FFF !important; color: #000 !important; border: 1px solid #999; }
  .callout h3, .callout p, .callout li { color: #000 !important; }
  a { border-bottom: 0; }
}
"""

JS = """
(function () {
  var root = document.documentElement;
  var KEY = 'mas-briefing-lang';
  function apply(lang) {
    root.setAttribute('lang', lang);
    var btns = document.querySelectorAll('.lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-checked', btns[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'ko' || saved === 'en') apply(saved);
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lang-toggle button') : null;
    if (b) apply(b.getAttribute('data-lang'));
  });

  /* ---- 표 행 클릭 확장 ---- */
  function detailRowOf(tr) {
    var n = tr.nextElementSibling;
    return (n && n.classList.contains('detail-row')) ? n : null;
  }
  function toggleRow(tr, force) {
    var d = detailRowOf(tr);
    if (!d) return;
    var open = force !== undefined ? force : tr.getAttribute('aria-expanded') !== 'true';
    tr.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { d.removeAttribute('hidden'); } else { d.setAttribute('hidden', ''); }
  }

  /* ---- 오른쪽 상세 패널 ----
     넓은 화면(>=1400px)에서는 클릭한 항목의 상세를 본문 아래가 아니라 오른쪽 패널에 띄운다.
     요약을 눈에서 놓치지 않은 채 근거를 읽게 하려는 것. 좁은 화면이나 '전체 펼치기'
     상태에서는 패널 모드를 끄고 원래의 인라인 펼침으로 돌아간다. */
  var pane = document.querySelector('.detailpane');
  var mq = window.matchMedia('(min-width: 1400px)');
  var paneOn = false, activeHost = null;
  var dpBody, dpTitle, dpKicker, dpClose, emptyBody, emptyTitle;
  if (pane) {
    dpBody = pane.querySelector('.dp-body');
    dpTitle = pane.querySelector('.dp-title');
    dpKicker = pane.querySelector('.dp-kicker');
    dpClose = pane.querySelector('.dp-close');
    emptyBody = dpBody.innerHTML;
    emptyTitle = dpTitle.innerHTML;
    dpClose.addEventListener('click', closePane);
  }

  function closePane() {
    if (!pane) return;
    if (activeHost) { activeHost.classList.remove('pane-active'); activeHost = null; }
    dpBody.innerHTML = emptyBody;
    dpTitle.innerHTML = emptyTitle;
    dpKicker.innerHTML = '';
    dpClose.setAttribute('hidden', '');
  }

  function detailOf(host, isRow) {
    if (isRow) {
      var dr = detailRowOf(host);
      return dr ? dr.querySelector('.detail') : null;
    }
    var kids = host.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].classList.contains('detail')) return kids[i];
    }
    return null;
  }

  /* 패널 머리글에 쓸 항목 이름. 렌더러가 넣어준 .detail-title 이 있으면 그것을,
     없으면 요약(또는 표의 첫 칸)에서 뽑는다. 어느 쪽이든 한/영 span 을 통째로
     옮기므로 패널을 연 채 언어를 바꿔도 그대로 따라간다. */
  function paneTitleOf(detailEl, host, isRow) {
    var t = detailEl.querySelector('.detail-title');
    if (t) return t.innerHTML;
    if (isRow) {
      var td = host.querySelector('td');
      return td ? td.innerHTML : '';
    }
    var sm = host.querySelector('summary');
    if (!sm) return '';
    var c = sm.cloneNode(true);
    var m = c.querySelector('.exp-mark');
    if (m) m.parentNode.removeChild(m);
    return c.innerHTML;
  }

  function openPane(host, isRow) {
    var detailEl = detailOf(host, isRow);
    if (!detailEl) return;
    if (activeHost === host) { closePane(); return; }   /* 같은 항목 재클릭 = 닫기 */
    if (activeHost) activeHost.classList.remove('pane-active');
    activeHost = host;
    host.classList.add('pane-active');

    dpTitle.innerHTML = paneTitleOf(detailEl, host, isRow);
    var sec = host.closest ? host.closest('.section') : null;
    var st = sec ? sec.querySelector('.section-title') : null;
    dpKicker.innerHTML = st ? st.innerHTML : '';

    var clone = detailEl.cloneNode(true);
    var dt = clone.querySelector('.detail-title');
    if (dt) dt.parentNode.removeChild(dt);
    dpBody.innerHTML = '';
    dpBody.appendChild(clone);
    dpClose.removeAttribute('hidden');
    pane.scrollTop = 0;
  }

  function syncPaneMode() {
    if (!pane) return;
    var b = document.querySelector('.expand-all');
    var allOpen = !!b && b.getAttribute('aria-pressed') === 'true';
    var on = mq.matches && !allOpen;
    if (on === paneOn) return;
    paneOn = on;
    document.body.classList.toggle('pane-mode', on);
    if (!on) closePane();
  }
  if (mq.addEventListener) { mq.addEventListener('change', syncPaneMode); }
  else if (mq.addListener) { mq.addListener(syncPaneMode); }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('a')) return;              /* 링크 클릭은 통과 */
    if (e.target.closest('.detailpane')) return;    /* 패널 내부 클릭은 통과 */
    var tr = e.target.closest('tr.clickable');
    if (tr) {
      if (paneOn) { e.preventDefault(); openPane(tr, true); } else { toggleRow(tr); }
      return;
    }
    if (paneOn) {
      var sm = e.target.closest('summary');
      var host = sm && sm.parentNode;
      if (host && host.classList && host.classList.contains('exp')) {
        e.preventDefault();                          /* 인라인 펼침 대신 패널로 */
        openPane(host, false);
      }
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePane(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var tr = e.target.closest ? e.target.closest('tr.clickable') : null;
    if (tr) {
      e.preventDefault();
      if (paneOn) { openPane(tr, true); } else { toggleRow(tr); }
    }
  });

  /* ---- 전체 펼치기 / 접기 ---- */
  function setAll(open) {
    var ds = document.querySelectorAll('details.exp');
    for (var i = 0; i < ds.length; i++) { if (open) { ds[i].setAttribute('open', ''); } else { ds[i].removeAttribute('open'); } }
    var rows = document.querySelectorAll('tr.clickable');
    for (var j = 0; j < rows.length; j++) toggleRow(rows[j], open);
    var btn = document.querySelector('.expand-all');
    if (btn) btn.setAttribute('aria-pressed', open ? 'true' : 'false');
    syncPaneMode();          /* 전체 펼침 중에는 패널 모드를 끈다(중복 표시 방지) */
  }
  var eb = document.querySelector('.expand-all');
  if (eb) {
    eb.addEventListener('click', function () {
      setAll(eb.getAttribute('aria-pressed') !== 'true');
    });
  }

  /* ---- PDF 저장 / 인쇄 ----
     '요약 PDF'  = 상세를 접은 상태로 인쇄 (고객 전달용)
     '전체 PDF'  = 상세를 모두 펼친 상태로 인쇄 (브리핑 준비용)
     둘 다 인쇄 직전에 전개 상태를 맞추고, 인쇄가 끝나면 원래 화면 상태로 되돌린다.
     Ctrl+P 로 직접 인쇄하면 화면에 보이는 그대로 인쇄된다. */
  function snapshot() {
    var s = { d: [], r: [] };
    var ds = document.querySelectorAll('details.exp');
    var rows = document.querySelectorAll('tr.clickable');
    for (var i = 0; i < ds.length; i++) s.d.push(ds[i].hasAttribute('open'));
    for (var j = 0; j < rows.length; j++) s.r.push(rows[j].getAttribute('aria-expanded') === 'true');
    return s;
  }
  function restoreFrom(s) {
    if (!s) return;
    var ds = document.querySelectorAll('details.exp');
    var rows = document.querySelectorAll('tr.clickable');
    for (var i = 0; i < ds.length; i++) {
      if (s.d[i]) { ds[i].setAttribute('open', ''); } else { ds[i].removeAttribute('open'); }
    }
    for (var j = 0; j < rows.length; j++) toggleRow(rows[j], s.r[j]);
    var btn = document.querySelector('.expand-all');   /* 버튼 라벨도 원래대로 */
    if (btn) {
      var allOpen = ds.length > 0 && document.querySelectorAll('details.exp[open]').length === ds.length;
      btn.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
    }
    syncPaneMode();
  }
  /* ---- 사이드바 목차: 현재 보고 있는 섹션 강조 ---- */
  var tocLinks = document.querySelectorAll('.sidenav-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    var targets = [];
    for (var t = 0; t < tocLinks.length; t++) {
      var id = tocLinks[t].getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { byId[id] = tocLinks[t]; targets.push(el); }
    }
    var visible = {};
    function paint() {
      var best = null;
      for (var i = 0; i < targets.length; i++) {
        if (visible[targets[i].id]) { best = targets[i].id; break; }   /* 문서 순서상 최상단 */
      }
      for (var id in byId) {
        if (id === best) { byId[id].setAttribute('aria-current', 'true'); }
        else { byId[id].removeAttribute('aria-current'); }
      }
      /* 좁은 화면 칩 줄에서는 활성 칩이 보이도록 가로 스크롤 */
      if (best && window.innerWidth < 1080) {
        var a = byId[best];
        var ul = a.parentNode.parentNode;
        if (ul.scrollWidth > ul.clientWidth) {
          var target = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2;
          ul.scrollTo ? ul.scrollTo({ left: target, behavior: 'smooth' }) : (ul.scrollLeft = target);
        }
      }
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        visible[entries[i].target.id] = entries[i].isIntersecting;
      }
      paint();
    }, { rootMargin: '-96px 0px -55% 0px', threshold: 0 });
    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  var pbs = document.querySelectorAll('.print-btn');
  for (var k = 0; k < pbs.length; k++) {
    pbs[k].addEventListener('click', function (ev) {
      var full = ev.currentTarget.getAttribute('data-print') === 'full';
      var before = snapshot();
      var paneWas = activeHost;                 /* 인쇄 후 열려 있던 상세 패널도 되돌린다 */
      setAll(full);
      void document.body.offsetHeight;          /* 레이아웃 확정 */
      try { window.focus(); } catch (e) {}      /* iframe 안에서도 자기 프레임 인쇄 */
      try { window.print(); } finally {
        restoreFrom(before);
        if (paneWas && paneOn && !activeHost) {
          openPane(paneWas, paneWas.tagName === 'TR');
        }
      }
    });
  }

  syncPaneMode();
})();
"""

FONT_LINKS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap">'
)

# ----------------------------------------------------------------------------
# UI 문구 (한/영)
# ----------------------------------------------------------------------------
T = {
    "brand":       ("Mirae Asset Securities", "Mirae Asset Securities"),
    "doc":         ("모닝 마켓 브리핑", "Morning Market Briefing"),
    "internal":    ("고객 브리핑용", "For client briefing"),
    "asof":        ("기준", "As of"),
    "keypoints":   ("한눈에 보는 핵심", "Key Takeaways"),
    "kr":          ("국내 증시", "Korean Equities"),
    "global":      ("글로벌 증시", "Global Equities"),
    "macro":       ("금리 · 환율 · 원자재", "Rates, FX & Commodities"),
    "flows":       ("수급", "Fund Flows"),
    "sectors":     ("업종 · 종목 흐름", "Sectors & Movers"),
    "views":       ("증권사 · 글로벌 하우스 시각", "House Views"),
    "calendar":    ("오늘의 일정 · 체크포인트", "Today's Calendar & Checkpoints"),
    "risks":       ("리스크 점검", "Risk Check"),
    "talking":     ("고객 응대 포인트", "Client Talking Points"),
    "sources":     ("출처", "Sources"),
    "chg":         ("전일대비", "Change"),
    "pct":         ("등락률", "% Change"),
    "index":       ("지수", "Index"),
    "close":       ("종가", "Close"),
    "note":        ("비고", "Note"),
    "investor":    ("투자자", "Investor"),
    "amount":      ("순매수(억원)", "Net buy (KRW bn)"),
    "sector":      ("업종 · 종목", "Sector / Name"),
    "move":        ("등락", "Move"),
    "comment":     ("코멘트", "Comment"),
    "time":        ("시각", "Time"),
    "event":       ("일정", "Event"),
    "impact":      ("체크 포인트", "What to watch"),
    "latest":      ("최신 브리핑", "Latest briefing"),
    "archive":     ("지난 브리핑", "Archive"),
    "archive_ttl": ("모닝 마켓 브리핑 아카이브", "Morning Market Briefing Archive"),
    "barcap":      ("주요 지수 등락률", "Index performance"),
    "disc": (
        "본 자료는 공개된 시장 정보와 언론 보도를 자동 수집·요약한 정보 제공 목적의 참고 자료입니다. "
        "특정 종목의 매매를 권유하거나 수익을 보장하지 않으며, 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있습니다. "
        "수치는 원출처 기준이며 정정·재집계로 변경될 수 있으므로, 고객 안내 전 원출처를 확인하십시오.",
        "This material is an automatically compiled summary of publicly available market information and news reports, "
        "provided for reference only. It is not a solicitation to trade any security and does not guarantee any return. "
        "Investment decisions and their outcomes are the responsibility of the investor. "
        "Figures follow the original sources and may be revised; please verify against the original source before briefing clients.",
    ),
    "auto": ("자동 생성 브리핑", "Auto-generated briefing"),
    "nodata": ("확인된 수치 없음", "No verified figure"),
    "expand_all": ("전체 펼치기", "Expand all"),
    "collapse_all": ("전체 접기", "Collapse all"),
    "print_brief": ("요약 PDF", "Summary PDF"),
    "print_brief_t": ("상세를 접은 요약본으로 인쇄 / PDF 저장 — 고객 전달용",
                      "Print or save the summary only — for handing to clients"),
    "print_full": ("전체 PDF", "Full PDF"),
    "print_full_t": ("모든 상세를 펼친 전체본으로 인쇄 / PDF 저장 — 브리핑 준비용",
                     "Print or save with every detail expanded — for your own preparation"),
    "detail": ("상세", "Detail"),
    "detailpane": ("상세 보기", "Detail view"),
    "pane_empty": ("왼쪽에서 항목을 클릭하면 근거 수치와 배경, 원문 링크가 여기에 표시됩니다.",
                   "Click an item on the left to show its underlying figures, "
                   "background and source links here."),
    "pane_close": ("상세 닫기", "Close detail"),
    "toc": ("목차", "Contents"),
    "talking_a": ("응대 스크립트", "Suggested response"),
    "srclink": ("원문", "Source"),
    "hint": (
        "각 항목을 클릭하면 근거 수치와 배경, 원문 링크가 펼쳐집니다. "
        "고객 전달용은 «요약 PDF», 브리핑 준비용은 «전체 PDF» 로 저장하십시오.",
        "Click any item to reveal the underlying figures, background and source links. "
        "Use «Summary PDF» for client hand-outs and «Full PDF» for your own preparation.",
    ),
    "hint_pane": (
        "각 항목을 클릭하면 근거 수치와 배경, 원문 링크가 오른쪽 패널에 표시됩니다. "
        "고객 전달용은 «요약 PDF», 브리핑 준비용은 «전체 PDF» 로 저장하십시오.",
        "Click any item to show the underlying figures, background and source links "
        "in the panel on the right. "
        "Use «Summary PDF» for client hand-outs and «Full PDF» for your own preparation.",
    ),
}

TONE_LABEL = {
    "risk-off": ("위험회피", "Risk-off"),
    "risk-on": ("위험선호", "Risk-on"),
    "mixed": ("혼조", "Mixed"),
    "neutral": ("중립", "Neutral"),
}

MONTHS_EN = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]
DOW_KO = ["월", "화", "수", "목", "금", "토", "일"]
DOW_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ----------------------------------------------------------------------------
# 유틸
# ----------------------------------------------------------------------------
def esc(s):
    if s is None:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def rich(s):
    """**강조** 만 지원하는 최소 인라인 마크업."""
    out = esc(s)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    return out


def bi(node, key, wrap="span"):
    """key / key_en 쌍을 한/영 토글 마크업으로 만든다. EN 이 없으면 KO 하나만."""
    ko = node.get(key)
    en = node.get(key + "_en")
    if ko is None and en is None:
        return ""
    if en is None or en == ko:
        return rich(ko)
    return ('<%s data-lang-ko>%s</%s><%s data-lang-en>%s</%s>'
            % (wrap, rich(ko), wrap, wrap, rich(en), wrap))


def label(key):
    ko, en = T[key]
    return ('<span data-lang-ko>%s</span><span data-lang-en>%s</span>'
            % (esc(ko), esc(en)))


def dual(ko, en, wrap="span"):
    if en is None or en == ko:
        return rich(ko)
    return ('<%s data-lang-ko>%s</%s><%s data-lang-en>%s</%s>'
            % (wrap, rich(ko), wrap, wrap, rich(en), wrap))


def has_detail(node):
    if not isinstance(node, dict):
        return False
    return bool(node.get("detail") or node.get("facts") or node.get("links"))


def detail_body(node, title=""):
    """상세 패널 본문. detail(문단) + facts(수치 목록) + links(원문).

    title 은 오른쪽 상세 패널의 머리글로만 쓰이는 숨은 항목명이다. 요약문이 그대로
    제목이 되면 지나치게 긴 항목(지표 카드·표 행·하우스 뷰)에만 넘긴다.
    """
    if not has_detail(node):
        return ""
    parts = []
    if title:
        parts.append('<span class="detail-title">%s</span>' % title)
    parts.append('<span class="detail-label">%s</span>' % label("detail"))

    facts = node.get("facts") or []
    if facts:
        rows = []
        for f in facts:
            val = f.get("value")
            cls = ' class="n"' if isinstance(val, (int, float)) or f.get("numeric") else ""
            rows.append("<dt>%s</dt><dd%s>%s</dd>"
                        % (bi(f, "label", wrap="span"), cls, bi(f, "value", wrap="span")))
        parts.append("<dl>%s</dl>" % "".join(rows))

    parts.append(paras(node, "detail"))

    links = node.get("links") or []
    if links:
        items = []
        for l in links:
            title = esc(l.get("title") or l.get("url"))
            url = esc(l.get("url") or "")
            pub = l.get("publisher")
            items.append(
                "<li>%s%s</li>" % (
                    ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (url, title))
                    if url else title,
                    (' <span class="pub">&middot; %s</span>' % esc(pub)) if pub else "",
                )
            )
        parts.append('<ul class="detail-links">%s</ul>' % "".join(items))

    return '<div class="detail">%s</div>' % "".join(parts)


def expandable(node, summary_html, extra_cls=""):
    """detail 이 있으면 <details>, 없으면 그냥 감싸지 않은 요약만 반환."""
    body = detail_body(node)
    if not body:
        return summary_html, False
    cls = ("exp " + extra_cls).strip()
    return ('<details class="%s"><summary>%s<span class="exp-mark" aria-hidden="true">'
            '</span></summary>%s</details>' % (cls, summary_html, body)), True


def parse_date(d):
    y, m, day = (int(x) for x in d.split("-"))
    return y, m, day


def dow_index(y, m, d):
    """Zeller 기반 요일 (0=월)."""
    import datetime
    return datetime.date(y, m, d).weekday()


def date_ko(d):
    y, m, day = parse_date(d)
    return "%d년 %d월 %d일(%s)" % (y, m, day, DOW_KO[dow_index(y, m, day)])


def date_en(d):
    y, m, day = parse_date(d)
    return "%s %s %d, %d" % (DOW_EN[dow_index(y, m, day)], MONTHS_EN[m - 1], day, y)


def dircls(v):
    """등락 방향 클래스. v 는 숫자 또는 부호 있는 문자열."""
    if v is None or v == "":
        return "flat"
    try:
        f = float(str(v).replace(",", "").replace("%", "").replace("+", ""))
    except ValueError:
        s = str(v)
        if s.startswith("-") or "▼" in s:
            return "down"
        if s.startswith("+") or "▲" in s:
            return "up"
        return "flat"
    if f > 0:
        return "up"
    if f < 0:
        return "down"
    return "flat"


def signed(v, suffix=""):
    """숫자를 부호 포함 문자열로."""
    if v is None or v == "":
        return "&mdash;"
    if isinstance(v, str):
        return esc(v)
    s = "{:+,.2f}".format(v) if isinstance(v, float) else "{:+,}".format(v)
    return esc(s + suffix)


def plain(v):
    if v is None or v == "":
        return "&mdash;"
    if isinstance(v, float):
        return esc("{:,.2f}".format(v))
    if isinstance(v, int):
        return esc("{:,}".format(v))
    return esc(v)


# ----------------------------------------------------------------------------
# 블록 렌더러
# ----------------------------------------------------------------------------
def render_stat_grid(rows, hero=False):
    if not rows:
        return ""
    cells = []
    for r in rows:
        cls = dircls(r.get("change_pct", r.get("change")))
        chg_bits = []
        if r.get("change") not in (None, ""):
            chg_bits.append(signed(r.get("change")))
        if r.get("change_pct") not in (None, ""):
            chg_bits.append("(" + signed(r.get("change_pct"), "%") + ")")
        chg = " ".join(chg_bits) or "&mdash;"
        note = bi(r, "note") if r.get("note") else ""
        inner = (
            '<p class="stat-label">%s</p>'
            '<div class="stat-value">%s</div>'
            '<div class="stat-chg %s">%s</div>'
            '%s' % (
                bi(r, "name"), plain(r.get("value")), cls, chg,
                ('<div class="stat-note">%s</div>' % note) if note else "",
            )
        )
        body = detail_body(r, bi(r, "name"))
        if body:
            cells.append('<details class="stat exp"><summary>%s'
                         '<span class="exp-mark" aria-hidden="true"></span></summary>%s</details>'
                         % (inner, body))
        else:
            cells.append('<div class="stat">%s</div>' % inner)
    return '<div class="stat-grid%s">%s</div>' % (" hero-stat" if hero else "", "".join(cells))


def render_bars(rows):
    """등락률 수평 바. 상승=적색, 하락=청색 (국내 관행)."""
    vals = []
    for r in rows:
        p = r.get("change_pct")
        if isinstance(p, (int, float)):
            vals.append(abs(float(p)))
    if not vals:
        return ""
    scale = max(vals) or 1.0
    out = []
    for r in rows:
        p = r.get("change_pct")
        cls = dircls(p)
        if isinstance(p, (int, float)):
            w = abs(float(p)) / scale * 50.0
            if cls == "up":
                fill = '<span class="bar-fill up" style="width:%.2f%%"></span>' % w
            elif cls == "down":
                fill = ('<span class="bar-fill down" style="left:%.2f%%;width:%.2f%%"></span>'
                        % (50.0 - w, w))
            else:
                fill = ""
            val = signed(float(p), "%")
        else:
            fill, val = "", "&mdash;"
        out.append(
            '<div class="bar-row">'
            '<span class="bar-name">%s</span>'
            '<span class="bar-track"><span class="zero"></span>%s</span>'
            '<span class="bar-val %s">%s</span>'
            '</div>' % (bi(r, "name"), fill, cls, val)
        )
    return ('<div class="bars" role="img" aria-label="%s">%s</div>'
            % (esc(T["barcap"][0]), "".join(out)))


def expandable_row(r, cells_html, colspan, title=""):
    """detail 이 있으면 클릭 가능한 <tr> + 숨겨진 상세 <tr> 을 함께 반환."""
    body = detail_body(r, title)
    if not body:
        return "<tr>%s</tr>" % cells_html
    return (
        '<tr class="clickable" tabindex="0" role="button" aria-expanded="false">%s</tr>'
        '<tr class="detail-row" hidden><td colspan="%d">%s</td></tr>'
        % (cells_html, colspan, body)
    )


def render_index_table(rows, caption_ko=None, caption_en=None):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("change_pct", r.get("change")))
        cells = (
            '<td>%s</td><td class="n">%s</td><td class="n %s">%s</td>'
            '<td class="n %s">%s</td><td>%s</td>' % (
                bi(r, "name"), plain(r.get("value")),
                cls, signed(r.get("change")),
                cls, signed(r.get("change_pct"), "%"),
                bi(r, "note") if r.get("note") else "&mdash;",
            )
        )
        body.append(expandable_row(r, cells, 5, bi(r, "name")))
    cap = ""
    if caption_ko:
        cap = "<caption>%s</caption>" % dual(caption_ko, caption_en)
    return (
        '<div class="table-wrap"><table class="data">%s<thead><tr>'
        '<th>%s</th><th class="n">%s</th><th class="n">%s</th>'
        '<th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (cap, label("index"), label("close"), label("chg"), label("pct"),
           label("note"), "".join(body))
    )


def render_flow_table(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("amount"))
        cells = (
            '<td>%s</td><td class="n %s">%s</td><td>%s</td>' % (
                bi(r, "name"), cls, signed(r.get("amount")),
                bi(r, "note") if r.get("note") else "&mdash;",
            )
        )
        if r.get("highlight"):
            d = detail_body(r, bi(r, "name"))
            if d:
                body.append(
                    '<tr class="hl clickable" tabindex="0" role="button" aria-expanded="false">%s</tr>'
                    '<tr class="detail-row" hidden><td colspan="3">%s</td></tr>' % (cells, d))
            else:
                body.append('<tr class="hl">%s</tr>' % cells)
        else:
            body.append(expandable_row(r, cells, 3, bi(r, "name")))
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th>%s</th><th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("investor"), label("amount"), label("note"), "".join(body))
    )


def render_mover_table(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("change_pct"))
        cells = (
            '<td>%s</td><td class="n">%s</td><td class="n %s">%s</td><td>%s</td>' % (
                bi(r, "name"), plain(r.get("value")),
                cls, signed(r.get("change_pct"), "%"),
                bi(r, "comment") if r.get("comment") else "&mdash;",
            )
        )
        body.append(expandable_row(r, cells, 4, bi(r, "name")))
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th>%s</th><th class="n">%s</th><th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("sector"), label("close"), label("move"), label("comment"), "".join(body))
    )


def render_calendar(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        cells = (
            '<td class="n">%s</td><td>%s</td><td>%s</td>' % (
                bi(r, "time") if r.get("time") else "&mdash;", bi(r, "event"),
                bi(r, "watch") if r.get("watch") else "&mdash;",
            )
        )
        body.append(expandable_row(r, cells, 3, bi(r, "event")))
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th class="n">%s</th><th>%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("time"), label("event"), label("impact"), "".join(body))
    )


def render_views(rows):
    if not rows:
        return ""
    cards = []
    for r in rows:
        stance = (r.get("stance") or "neutral").lower()
        stance = stance if stance in ("bull", "bear", "neutral") else "neutral"
        who = r.get("analyst") or ""
        inner = (
            '<p class="view-firm">%s</p>'
            '%s'
            '<p class="view-body">%s</p>'
            '%s' % (
                bi(r, "firm"),
                ('<p class="view-who">%s</p>' % bi(r, "analyst")) if who else "",
                bi(r, "view"),
                ('<span class="view-stance %s">%s</span>' % (stance, bi(r, "stance_label")))
                if r.get("stance_label") else "",
            )
        )
        body = detail_body(r, bi(r, "firm"))
        if body:
            cards.append('<details class="view exp"><summary>%s'
                         '<span class="exp-mark" aria-hidden="true"></span></summary>%s</details>'
                         % (inner, body))
        else:
            cards.append('<div class="view">%s</div>' % inner)
    return '<div class="views">%s</div>' % "".join(cards)


def render_sources(rows):
    if not rows:
        return ""
    items = []
    for r in rows:
        title = esc(r.get("title") or r.get("url"))
        url = esc(r.get("url") or "")
        pub = r.get("publisher")
        items.append(
            '<li>%s%s</li>' % (
                ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (url, title))
                if url else title,
                (' <span class="pub">&middot; %s</span>' % esc(pub)) if pub else "",
            )
        )
    return '<ul class="sources">%s</ul>' % "".join(items)


def render_sidenav(secs, dates, current):
    """목차 + 지난 브리핑 사이드바. secs = [(anchor, title_key), ...]"""
    if not secs:
        return ""
    items = "".join('<li><a href="#%s">%s</a></li>' % (esc(a), label(k)) for a, k in secs)

    date_block = ""
    if dates:
        recent = list(reversed(dates))[:8]
        dl = []
        for dt in recent:
            cur = ' aria-current="page"' if dt == current else ""
            href = "index.html" if dt == dates[-1] else "%s.html" % dt
            dl.append('<li><a href="%s"%s>%s</a></li>' % (esc(href), cur, esc(dt)))
        more = ""
        if len(dates) > len(recent):
            more = ('<p class="sidenav-more"><a href="archive.html">%s</a></p>'
                    % label("archive"))
        date_block = ('<p class="sidenav-label">%s</p><ul class="sidenav-dates">%s</ul>%s'
                      % (label("archive"), "".join(dl), more))

    return ('<nav class="sidenav" aria-label="%s">'
            '<p class="sidenav-label">%s</p><ul class="sidenav-toc">%s</ul>'
            '%s</nav>'
            % (esc(T["toc"][0]), label("toc"), items, date_block))


def render_detailpane():
    """오른쪽 상세 패널의 빈 껍데기. 내용은 클릭 시 JS 가 채운다."""
    return (
        '<aside class="detailpane" aria-label="%s" aria-live="polite">'
        '<div class="dp-head">'
        '<div><p class="dp-kicker"></p><p class="dp-title">%s</p></div>'
        '<button type="button" class="dp-close" aria-label="%s" title="%s" hidden>'
        '&times;</button>'
        '</div>'
        '<div class="dp-body"><p class="dp-empty">%s</p></div>'
        '</aside>' % (
            esc(T["detailpane"][0]), label("detailpane"),
            esc(T["pane_close"][0]), esc(T["pane_close"][0]),
            dual(T["pane_empty"][0], T["pane_empty"][1]),
        )
    )


def section(anchor, title_key, inner, custom_title=None):
    if not inner:
        return ""
    ttl = custom_title if custom_title else label(title_key)
    return (
        '<section class="section" id="%s">'
        '<div class="section-rule"></div>'
        '<h2 class="section-title">%s</h2>'
        '%s</section>' % (esc(anchor), ttl, inner)
    )


def paras(node, key):
    """문단 목록(list) 또는 단일 문자열을 <p> 로."""
    ko = node.get(key)
    en = node.get(key + "_en")
    if not ko:
        return ""
    ko_list = ko if isinstance(ko, list) else [ko]
    en_list = en if isinstance(en, list) else ([en] if en else [])
    out = []
    for i, p in enumerate(ko_list):
        e = en_list[i] if i < len(en_list) else None
        if e:
            out.append('<p data-lang-ko>%s</p><p data-lang-en>%s</p>' % (rich(p), rich(e)))
        else:
            out.append('<p>%s</p>' % rich(p))
    return "".join(out)


# ----------------------------------------------------------------------------
# 페이지 렌더
# ----------------------------------------------------------------------------
def page_shell(title_ko, title_en, body, start_lang="ko"):
    return (
        '<!DOCTYPE html>\n<html lang="%s">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>%s</title>\n'
        '<meta name="description" content="%s">\n'
        '%s\n<style>%s</style>\n</head>\n<body>\n%s\n<script>%s</script>\n</body>\n</html>\n'
        % (start_lang, esc(title_ko), esc(title_en or title_ko), FONT_LINKS, CSS, body, JS)
    )


def topbar(with_expand=False):
    expand = ""
    if with_expand:
        expand = (
            '<button type="button" class="print-btn" data-print="brief" title="%s">'
            '<span data-lang-ko>%s</span><span data-lang-en>%s</span></button>'
            '<button type="button" class="print-btn alt" data-print="full" title="%s">'
            '<span data-lang-ko>%s</span><span data-lang-en>%s</span></button>'
            '<button type="button" class="expand-all" aria-pressed="false">'
            '<span class="lbl-expand"><span data-lang-ko>%s</span>'
            '<span data-lang-en>%s</span></span>'
            '<span class="lbl-collapse"><span data-lang-ko>%s</span>'
            '<span data-lang-en>%s</span></span>'
            '</button>' % (esc(T["print_brief_t"][0]),
                           esc(T["print_brief"][0]), esc(T["print_brief"][1]),
                           esc(T["print_full_t"][0]),
                           esc(T["print_full"][0]), esc(T["print_full"][1]),
                           esc(T["expand_all"][0]), esc(T["expand_all"][1]),
                           esc(T["collapse_all"][0]), esc(T["collapse_all"][1]))
        )
    return (
        '<div class="topbar">'
        '<span class="tag">%s</span>'
        '<div class="topbar-actions">%s'
        '<div class="lang-toggle" role="radiogroup" aria-label="Language">'
        '<button type="button" data-lang="ko" role="radio" aria-checked="true">KO</button>'
        '<button type="button" data-lang="en" role="radio" aria-checked="false">EN</button>'
        '</div></div></div>' % (label("internal"), expand)
    )


def render_briefing(d, prev_date=None, next_date=None, all_dates=None):
    date = d["date"]
    tone = (d.get("tone") or "neutral").lower()
    tone = tone if tone in TONE_LABEL else "neutral"

    # --- Hero ---
    kicker = '%s &middot; %s' % (
        dual(date_ko(date), date_en(date)), label("doc"))
    hero = (
        '<div class="hero">'
        '<p class="hero-kicker">%s</p>'
        '<h1>%s</h1>'
        '<p class="hero-lede">%s</p>'
        '<p class="hero-meta"><span class="tone %s">%s</span> &nbsp; %s %s</p>'
        '<p class="hint">%s</p>'
        '</div>' % (
            kicker, bi(d, "headline"), bi(d, "lede"), tone,
            dual(TONE_LABEL[tone][0], TONE_LABEL[tone][1]),
            label("asof"), esc(d.get("asof") or ""),
            ('<span class="hint-inline">%s</span><span class="hint-pane">%s</span>'
             % (dual(T["hint"][0], T["hint"][1]),
                dual(T["hint_pane"][0], T["hint_pane"][1]))),
        )
    )

    head = [topbar(with_expand=True), hero]
    parts = []
    secs = []

    def add(anchor, key, inner):
        """내용이 있는 섹션만 본문과 목차에 넣는다."""
        html = section(anchor, key, inner)
        if html:
            parts.append(html)
            secs.append((anchor, key))


    # --- 핵심 요약 ---
    kp = d.get("keypoints") or []
    if kp:
        lis = []
        for item in kp:
            if isinstance(item, dict):
                html, _ = expandable(item, bi(item, "text", wrap="div"))
                lis.append("<li>%s</li>" % html)
            else:
                lis.append("<li>%s</li>" % rich(item))
        add("keypoints", "keypoints",
                             '<ul class="keypoints">%s</ul>' % "".join(lis))

    m = d.get("markets") or {}

    # --- 국내 증시 ---
    kr_inner = "".join([
        render_stat_grid(m.get("kr") or [], hero=True),
        paras(d, "kr_comment"),
    ])
    add("kr", "kr", kr_inner)

    # --- 수급 ---
    flows = d.get("flows") or {}
    flow_inner = "".join([
        render_flow_table(flows.get("rows") or []),
        paras(flows, "comment"),
    ])
    add("flows", "flows", flow_inner)

    # --- 업종 / 종목 ---
    sect_inner = "".join([
        render_mover_table(d.get("movers") or []),
        paras(d, "sector_comment"),
    ])
    add("sectors", "sectors", sect_inner)

    # --- 글로벌 증시 ---
    g = m.get("global") or []
    global_inner = "".join([
        render_bars(g),
        render_index_table(g),
        paras(d, "global_comment"),
    ])
    add("global", "global", global_inner)

    # --- 금리 / 환율 / 원자재 ---
    macro_inner = "".join([
        render_index_table(m.get("macro") or []),
        paras(d, "macro_comment"),
    ])
    add("macro", "macro", macro_inner)

    # --- 하우스 뷰 ---
    add("views", "views", render_views(d.get("views") or []))

    # --- 일정 ---
    add("calendar", "calendar", render_calendar(d.get("calendar") or []))

    # --- 리스크 ---
    risks = d.get("risks") or []
    if risks:
        lis = []
        for r in risks:
            if isinstance(r, dict):
                html, _ = expandable(r, bi(r, "text", wrap="div"))
                lis.append("<li>%s</li>" % html)
            else:
                lis.append("<li>%s</li>" % rich(r))
        add("risks", "risks", '<ul class="risks">%s</ul>' % "".join(lis))

    # --- 고객 응대 포인트 (질문 클릭 시 답변 전개) ---
    tp = d.get("talking_points") or []
    if tp:
        items = []
        for item in tp:
            body = ('<div class="detail">%s%s</div>'
                    % ('<span class="detail-label">%s</span>' % label("talking_a"),
                       paras(item, "a")))
            extra = detail_body(item)
            items.append(
                '<details class="exp"><summary>%s'
                '<span class="exp-mark" aria-hidden="true"></span></summary>%s%s</details>'
                % (bi(item, "q", wrap="div"), body, extra)
            )
        add("talking", "talking", '<div class="qa">%s</div>' % "".join(items))

    # --- 출처 ---
    add("sources", "sources", render_sources(d.get("sources") or []))

    # --- 푸터 ---
    nav = ['<a href="index.html">%s</a>' % label("latest"),
           '<a href="archive.html">%s</a>' % label("archive")]
    if prev_date:
        nav.append('<a href="%s.html">&larr; %s</a>' % (esc(prev_date), esc(prev_date)))
    if next_date:
        nav.append('<a href="%s.html">%s &rarr;</a>' % (esc(next_date), esc(next_date)))
    footer = (
        '<footer class="foot">'
        '<p>%s</p>'
        '<p>%s &middot; %s</p>'
        '<div class="navlinks">%s</div>'
        '</footer>' % (
            dual(T["disc"][0], T["disc"][1], wrap="span"),
            label("auto"), esc(d.get("asof") or date),
            " ".join(nav),
        )
    )

    body = (
        '<div class="page wide">%s'
        '<div class="shell">%s<main>%s%s</main>%s</div>'
        '</div>' % (
            "".join(head),
            render_sidenav(secs, all_dates or [date], date),
            "".join(parts), footer,
            render_detailpane(),
        )
    )
    title_ko = "%s %s | %s" % (date, T["doc"][0], T["brand"][0])
    title_en = "%s %s | %s" % (date, T["doc"][1], T["brand"][1])
    return page_shell(title_ko, title_en, body)


def render_archive(entries):
    lis = []
    for d in entries:
        lis.append(
            '<li><a href="%s.html"><span class="d">%s</span>'
            '<span class="t">%s</span></a></li>'
            % (esc(d["date"]), esc(d["date"]), bi(d, "headline"))
        )
    body = (
        '<div class="page">%s'
        '<div class="hero"><p class="hero-kicker">%s</p><h1>%s</h1>'
        '<p class="hero-lede">%s</p></div>'
        '<section class="section"><div class="section-rule"></div>'
        '<h2 class="section-title">%s</h2><ul class="arch">%s</ul></section>'
        '<footer class="foot"><p>%s</p><div class="navlinks">'
        '<a href="index.html">%s</a></div></footer>'
        '</div>' % (
            topbar(), label("doc"), label("archive_ttl"),
            dual("일자별 아침 증시시황 브리핑입니다. 최신 브리핑은 index.html 에서 확인하십시오.",
                 "Daily morning market briefings. The most recent briefing is at index.html."),
            label("archive"), "".join(lis),
            dual(T["disc"][0], T["disc"][1], wrap="span"),
            label("latest"),
        )
    )
    return page_shell("%s | %s" % (T["archive_ttl"][0], T["brand"][0]),
                      "%s | %s" % (T["archive_ttl"][1], T["brand"][1]), body)


# ----------------------------------------------------------------------------
# 실행
# ----------------------------------------------------------------------------
SCHEMA_DOC = """\
briefing/data/YYYY-MM-DD.json 스키마
------------------------------------
_en 접미사 필드는 모두 선택. 있으면 EN 토글에 쓰이고, 없으면 KO 를 그대로 노출.
숫자는 문자열이 아닌 number 로 넣는다 (부호/콤마는 렌더러가 붙인다).
확인되지 않은 수치는 필드를 비우거나 생략한다. 절대 추정치를 채우지 않는다.

{
  "date": "2026-08-04",
  "asof": "2026-08-04 07:40 KST",
  "tone": "risk-off | risk-on | mixed | neutral",
  "headline": "...", "headline_en": "...",
  "lede": "...", "lede_en": "...",
  "keypoints": [ {"text": "...", "text_en": "..."} ],
  "markets": {
    "kr":     [ {"name","name_en","value","change","change_pct","note","note_en"} ],
    "global": [ {"name","name_en","value","change","change_pct","note","note_en"} ],
    "macro":  [ {"name","name_en","value","change","change_pct","note","note_en"} ]
  },
  "kr_comment":     ["문단", ...],  "kr_comment_en":     [...],
  "global_comment": [...],          "global_comment_en": [...],
  "macro_comment":  [...],          "macro_comment_en":  [...],
  "sector_comment": [...],          "sector_comment_en": [...],
  "flows": {
    "rows": [ {"name","name_en","amount": -28427, "note","note_en","highlight": false} ],
    "comment": [...], "comment_en": [...]
  },
  "movers":   [ {"name","name_en","value","change_pct","comment","comment_en"} ],
  "views":    [ {"firm","firm_en","analyst","analyst_en","view","view_en",
                 "stance": "bull|bear|neutral", "stance_label","stance_label_en"} ],
  "calendar": [ {"time","event","event_en","watch","watch_en"} ],
  "risks":    [ {"text","text_en"} ],
  "talking_points": [ {"q","q_en","a","a_en"} ],
  "sources":  [ {"title","url","publisher"} ]
}

클릭 드릴다운 (detail / facts / links)
-------------------------------------
keypoints · markets.* · flows.rows · movers · views · calendar · risks · talking_points
의 **모든 항목**에 아래 3개 필드를 붙일 수 있다. 하나라도 있으면 그 항목이 클릭 가능해지고,
없으면 확장 표시 없이 평범하게 렌더된다. 즉 있는 항목만 골라 넣어도 된다.

  "facts":  [ {"label","label_en","value","value_en","numeric": true} ]   근거 수치 목록
  "detail": ["문단", ...],  "detail_en": [...]                            배경·해석 문단
  "links":  [ {"title","url","publisher"} ]                              해당 항목의 원문

표시 순서는 facts -> detail -> links 다.
talking_points 는 `a`(응대 스크립트)가 자동으로 펼쳐지는 본문이 되고,
detail/facts/links 를 추가하면 그 아래 '상세' 패널이 하나 더 붙는다.

숫자 값은 `value` 에 **문자열로** 넣는다("−2조 8,427억원", "4.68% (-7bp)").
표/카드의 `value` 와 달리 facts 는 서식이 있는 표시용 값이다.
"""


def load_all():
    if not os.path.isdir(DATA_DIR):
        return []
    out = []
    for fn in sorted(os.listdir(DATA_DIR)):
        if not fn.endswith(".json"):
            continue
        with open(os.path.join(DATA_DIR, fn), encoding="utf-8") as f:
            d = json.load(f)
        d.setdefault("date", fn[:-5])
        out.append(d)
    out.sort(key=lambda x: x["date"])
    return out


def write(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote %s (%d bytes)" % (os.path.relpath(path, ROOT), len(text.encode("utf-8"))))


def build(targets=None):
    entries = load_all()
    if not entries:
        sys.exit("no data files in %s" % os.path.relpath(DATA_DIR, ROOT))
    os.makedirs(OUT_DIR, exist_ok=True)
    dates = [e["date"] for e in entries]
    for i, e in enumerate(entries):
        if targets and e["date"] not in targets:
            continue
        prev_d = dates[i - 1] if i > 0 else None
        next_d = dates[i + 1] if i < len(dates) - 1 else None
        write(os.path.join(OUT_DIR, e["date"] + ".html"),
              render_briefing(e, prev_d, next_d, dates))
    latest = entries[-1]
    write(os.path.join(OUT_DIR, "index.html"),
          render_briefing(latest, dates[-2] if len(dates) > 1 else None, None, dates))
    write(os.path.join(OUT_DIR, "archive.html"),
          render_archive(list(reversed(entries))))


def main(argv):
    if "--schema" in argv:
        print(SCHEMA_DOC)
        return
    if "--all" in argv or not argv:
        build()
        return
    targets = set()
    for a in argv:
        if a.startswith("-"):
            continue
        base = os.path.basename(a)
        targets.add(base[:-5] if base.endswith(".json") else base)
    build(targets)


if __name__ == "__main__":
    main(sys.argv[1:])
