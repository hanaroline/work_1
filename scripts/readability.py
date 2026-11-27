#!/usr/bin/env python3
"""브리핑 판에 「읽기 편하게」 층을 씌운다 — 글자 깨짐 · 작은 글자 · 흐린 회색.

    python3 scripts/readability.py docs/briefings/<판>.html [<판>.html ...]

2026-11-12 사용자 불만 세 가지를 한 자리에서 막는다.

1. **글자 깨짐.** 판 본문에는 `<head>` 가 없어 문자 인코딩 선언이 하나도 없었다.
   아티팩트로 열면 바깥 틀이 utf-8 을 알려 주지만, 저장소 파일을 그대로 받아
   열거나 메신저·메일 미리보기로 열면 브라우저가 EUC-KR 등으로 짐작해 한글이
   깨진다. 첫 줄에 `<meta charset="utf-8">` 을 박는다(브라우저는 문서 앞
   1024바이트 안의 선언을 <head> 밖에서도 읽는다). 단독 HTML 쪽은
   `make_standalone.py` 가 BOM 까지 붙인다.
2. **작은 글자.** 표 설명 줄(.sub)·출처 캡션·확정도 꼬리표·사이드바 날짜가
   화면에서 10.5~13px 이었다. 화면에서만 바닥을 올린다 — `@media screen` 안에만
   두므로 **PDF 쪽수와 인쇄 배치는 바뀌지 않는다.**
3. **눈이 침침함.** 본문 #3D3D3D, 보조 #6C6C6C, 캡션 #84888B 회색이 흰 바탕에서
   대비가 낮았다(캡션 3.6:1). 색 토큰을 한 단계씩 진하게 바꾼다 — 캡션도
   6:1 넘게. 어두운 화면 쪽도 같은 방향으로 올린다.

이 층은 **맨 마지막 <style>** 로 들어가야 이긴다. 후처리 셋(inline_notes ·
fold_perf · print_fit)은 첫 <style> 안쪽에 덧붙이므로 이 층보다 앞선다.
핵심본은 `core-density` 블록 바로 뒤에 둔다. 여러 번 돌려도 한 벌만 남는다.
"""
import io
import re
import sys

MARK = 'id="readability"'
META = '<meta charset="utf-8">'

READ_CSS = """<style id="readability">
/* ── 읽기 편하게 (2026-11-12, scripts/readability.py) ─────────────────
   색은 화면·인쇄 모두, 글자 크기 바닥은 화면에서만 올린다.              */
:root,:root[data-theme="light"]{
  --body:#262626; --muted:#474747; --muted-soft:#5A5E62;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){--body:#E2E6EB; --muted:#BCC3CC; --muted-soft:#A9B1BC}
}
:root[data-theme="dark"]{--body:#E2E6EB; --muted:#BCC3CC; --muted-soft:#A9B1BC}
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}

@media screen{
  /* 본문 문단 · 카드 */
  .section > p,.detail > p,.soft-card p,.callout p{line-height:1.7}
  .soft-card p,.soft-grid .soft-card p{font-size:16px!important}
  /* 표 */
  table.data.compact td,table.data.compact th,
  .duo table.data td,.duo table.data th,
  .trio table.data td,.trio table.data th{font-size:14px!important;line-height:1.5!important}
  table.data .sub,.duo table.data .sub{font-size:14px!important;line-height:1.45!important}
  table.data caption,.duo table.data caption,.trio table.data caption{font-size:15px!important}
  table.data .why{font-size:15px!important}
  table.data td.note,table.data td.wh{font-size:15px!important}
  table.data .perfrow,table.data .perfline{font-size:14px!important;line-height:1.5!important}
  table.data .vf,.vf{font-size:12.5px!important;padding:2px 7px!important}
  .tbl-foot,.tbl-foot *{font-size:14px!important;line-height:1.55!important}
  /* 요약 수치 칸 */
  .stat-label,.stat-grid.six .stat-label{font-size:15px!important}
  .stat-grid.six .stat-value{font-size:24px!important}
  .stat-chg,.stat-grid.six .stat-chg{font-size:15px!important}
  .stat-note,.stat-grid.six .stat-note{font-size:14.5px!important;line-height:1.45!important}
  /* 머리말 · 안내 · 각주 */
  .hero-meta{font-size:15px!important}
  .ai-notice p{font-size:15.5px!important;line-height:1.6!important}
  .ai-notice .lbl{font-size:13.5px!important}
  .cap,.disc,.sources,.sources .pub,.foot p,.foot p *{font-size:15px!important;line-height:1.6!important}
  .hol li{font-size:15px!important;line-height:1.55!important}
  .view-who{font-size:15px!important}
  .detail dt{font-size:14.5px!important}
  /* 사이드바 */
  .sidenav a,.sidenav-dates a{font-size:16px!important}
  .sidenav .sn,.sidenav-dates .d{font-size:14px!important}
  .sidenav-dates .na,.sidenav-label{font-size:15px!important}
}
@media screen and (min-width:681px){
  table.data thead th{font-size:15px!important}
}
/* 좁은 화면에서는 표 칸 글자를 껍데기 값(14px · 400px 아래 13px)에 둔다 —
   더 키우면 340~380px 에서 날짜 표가 옆으로 넘친다(폭 훑기로 확인). */
@media screen and (max-width:680px){
  table.data.compact td,table.data.compact th,
  .duo table.data td,.duo table.data th,
  .trio table.data td,.trio table.data th{font-size:14px!important}
  table.data .vf{font-size:12px!important}
}
@media screen and (max-width:400px){
  table.data.compact td,table.data.compact th,
  .duo table.data td,.duo table.data th,
  .trio table.data td,.trio table.data th{font-size:13px!important}
  table.data .sub,.duo table.data .sub{font-size:13px!important}
}
</style>
"""

BLOCK = re.compile(r'\n?<style id="readability">.*?</style>\n?', re.S)


def apply(html):
    html = BLOCK.sub("\n", html, count=1) if MARK in html else html
    # 인코딩 선언 — 맨 앞에 한 번만.
    if not html.lstrip().lower().startswith("<meta charset"):
        html = META + "\n" + html.lstrip("﻿")
    core = html.find('<style id="core-density">')
    i = html.find("</style>", core if core >= 0 else 0)
    if i < 0:
        raise SystemExit("<style> 을 찾지 못했다")
    i += len("</style>")
    return html[:i] + "\n" + READ_CSS + html[i:]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for p in sys.argv[1:]:
        s = io.open(p, encoding="utf-8").read()
        t = apply(s)
        assert t.count(MARK) == 1 and t.count(META) >= 1
        io.open(p, "w", encoding="utf-8").write(t)
        print("읽기층: %s" % p)


if __name__ == "__main__":
    main()
