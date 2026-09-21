#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 시장일지를 짓는다 — A4 한 장(본지) + 대시보드 두 장.

무엇을 만드나
  docs/journal/<날짜>.html   본지 1쪽 + 대시보드 2쪽 (한 문서, 쪽 나눔)
  docs/journal/<날짜>.txt    텔레그램 전송본 (글자만)
  docs/journal/index.html    지난 판 목록

무엇을 읽나
  data/market/latest.json    지수·환율·금리·예탁금·수급 합계 (fetch_market.py)
  data/journal/latest.json   종목 순위·ETF·테마 (fetch_journal.py)
  data/flows/kr100.json      대형주 100 종목별 외국인·기관 순매수

규칙 — 이 셋이 이 파일의 전부다.

  ① **기준일을 두 파일에서 맞춰 본다.** 어긋나면 머리말에 적고, 어긋난 쪽
     수치에는 그 날짜를 달아 싣는다. 낡은 줄 모르고 쓰는 것이 못 쓰는 것보다
     나쁘다.
  ② **없는 값은 지어내지 않는다.** 빈칸으로 두고 NOT FOUND 배지를 단다.
     표를 못 채우면 표를 뺀다.
  ③ **어림한 값에는 어림했다고 적는다.** 장중에는 원천이 금액을 주지
     않아 수량 × 종가로 어림하므로 그 칸에 「≈」를 달고, 연속 순매수는
     대형주 100 종목 한정이므로 표 이름에 그렇게 박는다. 이름을 떼면
     전체 시장을 센 것이라는 거짓이 된다.
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from journal_lib import (  # noqa: E402
    KST, VF_1, VF_C, VF_MD, VF_N, VF_P, DK, DE, DS, L, block, bp, d, eok,
    eok_plain, empty, esc, n, pct, sgn, strong, table, won,
)

DOCS = "docs/journal"
MARKET = "data/market/latest.json"
JOURNAL = "data/journal/latest.json"


# ── 껍데기 ───────────────────────────────────────────────────────────
CSS = """
:root{
  --orange:#F58220; --orange-a:#CB6015; --soft:#FAB072; --blue:#043B72;
  --ink:#1A1A1A; --body:#3D3D3D; --mut:#6C6C6C; --mut2:#84888B;
  --hair:#CDCECB; --hair2:#E5E4E1; --surf:#F7F8FA; --surf2:#ECEFF4;
  --up:#C62828; --down:#043B72;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:#E9EAEC; color:var(--body);
  font-family:'Spoqa Han Sans Neo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  font-size:13px; line-height:1.45; font-variant-numeric:tabular-nums;
}
html[lang=en] body{font-family:'Inter','Aptos','Segoe UI',system-ui,sans-serif}
[data-lang-en]{display:none}
html[lang=en] [data-lang-ko]{display:none}
html[lang=en] [data-lang-en]{display:inline}

.bar{max-width:210mm;margin:0 auto;padding:14px 6mm 0;display:flex;
     justify-content:flex-end;gap:0}
.lt{display:inline-flex;border:1px solid var(--hair);border-radius:2px;
    box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;background:#fff}
.lt button{appearance:none;border:0;background:#fff;color:var(--mut);
  font:500 14px/1 'Inter','Aptos',sans-serif;letter-spacing:.5px;
  padding:10px 17px;cursor:pointer}
.lt button+button{border-left:1px solid var(--hair)}
.lt button[aria-checked=true]{background:var(--orange);color:#fff}
.lt button:not([aria-checked=true]):hover{background:var(--surf);color:var(--ink)}

.sheet{
  width:210mm; min-height:297mm; margin:14px auto; padding:9mm 9mm 7mm;
  background:#fff; box-shadow:0 1px 10px rgba(0,0,0,.13);
}
/* 머리 */
.hd{display:flex;justify-content:space-between;align-items:flex-end;
    border-bottom:2px solid var(--orange);padding-bottom:6px}
.hd h1{margin:0;font-size:20px;font-weight:700;color:var(--ink);letter-spacing:-.3px}
.hd .sub{font-size:11px;color:var(--mut);text-align:right;line-height:1.5}
.kicker{font-size:10px;letter-spacing:.8px;color:var(--orange);font-weight:700;
        text-transform:uppercase;margin-bottom:2px}

/* 두 칸 격자 */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:0 6mm;margin-top:5px}
.g1{margin-top:7px}
.blk{break-inside:avoid;margin:0 0 5px}
.rule{height:1px;background:var(--orange);margin-bottom:4px}
.blk h2{margin:0 0 2px;font-size:10.8px;font-weight:700;color:var(--ink);
        letter-spacing:-.1px;display:flex;align-items:center;gap:5px}
.note{margin:1px 0 0;font-size:7.9px;color:var(--mut2);line-height:1.3}
.empty{margin:3px 0;font-size:9.5px;color:var(--mut)}

/* 표 */
table.dt{width:100%;border-collapse:collapse;font-size:8.5px;
         border:1px solid var(--hair)}
table.dt th{background:var(--soft);color:#2C2C2C;font-weight:700;
  padding:1.8px 4px;border:1px solid var(--hair2);text-align:left;white-space:nowrap}
table.dt td{padding:1.5px 4px;border:1px solid var(--hair2);color:var(--body);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
table.dt tbody tr:nth-child(even){background:#FBFBFC}
table.dt tbody tr:hover{background:var(--surf)}
table.dt td.n,table.dt th.n{text-align:right}
table.dt td.c,table.dt th.c{text-align:center}
table.dt td.nm{max-width:0;width:34%}
table.dt tfoot td{background:var(--surf2);font-size:8.4px;color:var(--mut);
  white-space:normal;line-height:1.35}
tr.hl td{background:#D7D7D7 !important;font-weight:700}
/* 대시보드의 스무 줄짜리 표 — 한 쪽에 넷을 세우려면 한 단 더 조여야 한다 */
table.dt.dense{font-size:7.7px}
table.dt.dense td{padding:0.9px 3px}
table.dt.dense th{padding:1.4px 3px}

.up{color:var(--up)} .down{color:var(--down)} .flat{color:var(--mut)}
.mut{color:var(--mut2)}
.vf{font-size:7.6px;font-weight:700;letter-spacing:.3px;padding:1px 4px;
    border-radius:2px;vertical-align:middle;white-space:nowrap}
.vf.ok{background:#E8F1EA;color:#2E8540;border:1px solid #BFD9C6}
.vf.solo{background:#FBF2DC;color:#8A6A05;border:1px solid #E7D49A}
.vf.none{background:#F3F3F3;color:#6C6C6C;border:1px solid var(--hair)}

/* 한눈에 띠 */
.strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;
       border:1px solid var(--hair);border-left:3px solid var(--orange)}
.strip div{padding:3px 6px;border-right:1px solid var(--hair2)}
.strip div:last-child{border-right:0}
.strip .k{font-size:8.6px;color:var(--mut);letter-spacing:.3px}
.strip .v{font-size:13px;font-weight:700;color:var(--ink);line-height:1.2}
.strip .c{font-size:9px}

.lede{font-size:9.2px;line-height:1.45;color:var(--body);margin:5px 0 0;
      padding:5px 7px;background:var(--surf2);border-left:3px solid var(--blue)}
ul.iss{margin:2px 0 0;padding-left:13px;font-size:8.8px;line-height:1.42}
ul.iss li{margin-bottom:1px}

.foot{margin-top:6px;border-top:1px solid var(--hair);padding-top:4px;
      font-size:7.6px;color:var(--mut2);line-height:1.38}

@media (max-width:820px){
  .sheet{width:auto;min-height:0;margin:10px;padding:14px 16px}
  .g2{grid-template-columns:1fr;gap:0}
  table.dt{font-size:11px}
  .strip{grid-template-columns:repeat(2,1fr)}
  .hd{flex-direction:column;align-items:flex-start;gap:4px}
  .hd .sub{text-align:left}
}
@page{size:A4;margin:9mm}
@media print{
  body{background:#fff;font-size:9pt}
  .bar{display:none}
  .sheet{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;
         page-break-after:always}
  .sheet:last-child{page-break-after:auto}
  .blk,table{page-break-inside:avoid}
  h2{page-break-after:avoid}
}
"""

JS = """
(function(){
  var K=document.getElementById('ko'),E=document.getElementById('en');
  function set(l,save){
    document.documentElement.lang=l;
    K.setAttribute('aria-checked',l==='ko');E.setAttribute('aria-checked',l==='en');
    var t=document.querySelector('title');
    if(t&&t.dataset.en){var a=t.dataset.ko||t.textContent;t.dataset.ko=a;
      t.textContent=(l==='en')?t.dataset.en:a;}
    if(save){try{localStorage.setItem('journal-lang',l)}catch(e){}}
  }
  K.onclick=function(){set('ko',1)};E.onclick=function(){set('en',1)};
  var s=null;try{s=localStorage.getItem('journal-lang')}catch(e){}
  set(s==='en'?'en':'ko',0);
})();
"""


def page(title_ko: str, title_en: str, sheets: list[str]) -> str:
    return (
        '<!doctype html>\n<html lang="ko">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title data-en="%s">%s</title>\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700'
        '&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">\n'
        '<style>%s</style>\n</head>\n<body>\n'
        '<div class="bar"><div class="lt" role="radiogroup" aria-label="Language">'
        '<button id="ko" role="radio" aria-checked="true">KO</button>'
        '<button id="en" role="radio" aria-checked="false">EN</button></div></div>\n'
        '%s\n<script>%s</script>\n</body>\n</html>\n'
        % (esc(title_en), esc(title_ko), CSS, "\n".join(sheets), JS)
    )


# ── 자료 읽기 ────────────────────────────────────────────────────────
def load(path: str):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def ymd(s: str | None) -> str | None:
    if not s:
        return None
    s = str(s)
    return f"{s[:4]}-{s[4:6]}-{s[6:]}" if len(s) == 8 and s.isdigit() else s


# ── 조각 ─────────────────────────────────────────────────────────────
def idx_row(label_ko, label_en, o, dp=2, unit="", as_of=None):
    if not o:
        return [L(label_ko, label_en), '<span class="mut">&mdash;</span>', "", ""]
    close = o.get("close")
    return [
        L(label_ko, label_en),
        n(close, dp) + unit,
        pct(o.get("change_pct")),
        '<span class="mut">%s</span>' % (as_of or DS(d(o.get("date"))) if o.get("date") else ""),
    ]


def strip_cell(k_ko, k_en, v, c):
    return ('<div><div class="k">%s</div><div class="v">%s</div>'
            '<div class="c">%s</div></div>' % (L(k_ko, k_en), v, c))


def stock_rows(rows, cols):
    """cols: 리스트의 each 는 (key, fmt) — fmt 는 값을 HTML 로 바꾸는 함수."""
    out = []
    for r in rows:
        out.append([f(r) for f in cols])
    return out


def nm(r):
    mk = "KQ" if r.get("market") == "코스닥" else "KP"
    return ('<span title="%s">%s</span> <span class="mut">%s</span>'
            % (esc(r.get("code")), esc(r.get("name")), mk))


# ── 본문 ─────────────────────────────────────────────────────────────
def build(market: dict, jr: dict | None, now: datetime.datetime) -> tuple[str, str, dict]:
    warn: list[str] = []
    claims: dict = {}

    ind = market.get("indices") or {}
    mi = market.get("market_internals") or {}
    kospi, kosdaq = ind.get("kospi") or {}, ind.get("kosdaq") or {}

    # ── 기준일 ──────────────────────────────────────────────────────
    close_date = kospi.get("date")
    if not close_date:
        raise SystemExit("코스피 종가 날짜가 없다 — 시세 파일을 먼저 갱신하십시오")
    cdate = d(close_date)

    jr_date = (jr or {}).get("bizdate")
    jr_status = (jr or {}).get("market_status")
    if jr and jr_date != close_date:
        warn.append("순위 파일 기준일(%s)과 지수 종가일(%s)이 다릅니다 — 순위 표에는 순위 파일의 날짜를 답니다."
                    % (jr_date, close_date))
    if jr and jr_status == "OPEN":
        warn.append("순위 파일이 **장중**(%s)에 받아졌습니다. 순위·상한가는 그 시각의 잠정값입니다."
                    % (jr.get("generated_at_kst") or ""))

    mi_biz = ymd((mi.get("kospi") or {}).get("bizdate"))
    if mi_biz and mi_biz != close_date:
        warn.append("투자자별 순매수 합계의 기준일(%s)이 종가일(%s)과 다릅니다." % (mi_biz, close_date))

    # ── 한눈에 띠 ───────────────────────────────────────────────────
    fxrows = {r.get("key"): r for r in ((market.get("fx") or {}).get("rows") or [])}
    usdkrw = fxrows.get("usdkrw") or {}
    seoul = (market.get("usdkrw_naver") or {}).get("rate")
    ktb3 = (market.get("rates_ecos") or {}).get("ktb3y") or {}

    strip = '<div class="strip">%s</div>' % "".join([
        strip_cell("코스피", "KOSPI", n(kospi.get("close"), 2), pct(kospi.get("change_pct"))),
        strip_cell("코스닥", "KOSDAQ", n(kosdaq.get("close"), 2), pct(kosdaq.get("change_pct"))),
        strip_cell("원/달러(매매기준율)", "USD/KRW (MAR)",
                   n(seoul, 1) if seoul else n(usdkrw.get("close"), 1),
                   pct(usdkrw.get("change_pct")) + ' <span class="mut">야후 대비</span>'),
        strip_cell("국고채 3년", "KTB 3Y",
                   (n(ktb3.get("value"), 3) + "%") if ktb3.get("value") is not None else "&mdash;",
                   '<span class="mut">%s</span>' % (ymd(ktb3.get("date")) or "")),
    ])
    claims["kospi_close"] = kospi.get("close")
    claims["kosdaq_close"] = kosdaq.get("close")

    # ── ① 지수·가격 ────────────────────────────────────────────────
    dom_rows = [
        idx_row("코스피", "KOSPI", kospi),
        idx_row("코스닥", "KOSDAQ", kosdaq),
    ]
    idl = (market.get("index_daily") or {})
    for key, ko, en in (("kospi", "코스피 거래대금", "KOSPI value"),
                        ("kosdaq", "코스닥 거래대금", "KOSDAQ value")):
        ser = (idl.get(key) or {}).get("series") or []
        hit = next((s for s in ser if s.get("date") == close_date), None)
        v = (hit or {}).get("value_mn_krw")
        dom_rows.append([L(ko, en),
                         eok_plain(v / 100.0) + "원" if v else '<span class="mut">&mdash;</span>',
                         "", '<span class="mut">%s</span>' % DS(cdate)])
    if seoul:
        dom_rows.append([L("원/달러(서울 매매기준율)", "USD/KRW (Seoul MAR)"),
                         n(seoul, 1), pct(usdkrw.get("change_pct")),
                         '<span class="mut">%s</span>' % DS(cdate)])
    jpy = fxrows.get("jpykrw") or {}
    dom_rows.append([L("원/100엔", "KRW/100JPY"), n(jpy.get("close"), 2),
                     pct(jpy.get("change_pct")),
                     '<span class="mut">재정</span>'])
    if ktb3.get("value") is not None:
        p3 = (ktb3.get("perf") or {})
        dom_rows.append([L("국고채 3년", "KTB 3Y"), n(ktb3.get("value"), 3) + "%",
                         bp(p3.get("w1")) if p3.get("w1") is not None else '<span class="mut">&mdash;</span>',
                         '<span class="mut">%s</span>' % (ymd(ktb3.get("date")) or "")])

    mf = (market.get("money_flow") or {}).get("latest") or {}
    if mf:
        dom_rows.append([L("고객예탁금", "Investor deposits"),
                         eok_plain(mf.get("deposit")) + "원",
                         eok(mf.get("deposit_delta")),
                         '<span class="mut">%s</span>' % (mf.get("date") or "")])
        dom_rows.append([L("신용융자 잔고", "Margin balance"),
                         eok_plain(mf.get("credit_balance")) + "원",
                         eok(mf.get("credit_balance_delta")),
                         '<span class="mut">%s</span>' % (mf.get("date") or "")])
        claims["deposit"] = mf.get("deposit")

    hdr4 = [("항목", "Item", "nm"), ("종가·잔액", "Level", "n"),
            ("전일대비", "Chg", "n"), ("기준", "As of", "c")]
    b_dom = block("국내 지수 · 자금", "Domestic indices & flows",
                  table(hdr4, dom_rows), VF_MD,
                  "거래대금은 거래소 일별시세(백만원)를 억·조로 환산. 예탁금·신용잔고는 결제일 기준이라 종가일보다 1~2영업일 늦습니다.")

    hscei = (jr or {}).get("hscei")
    ov_rows = [
        idx_row("다우", "Dow", ind.get("dow")),
        idx_row("나스닥", "Nasdaq", ind.get("nasdaq")),
        idx_row("유로스톡스50", "Euro Stoxx 50", ind.get("eurostoxx")),
        idx_row("니케이225", "Nikkei 225", ind.get("nikkei")),
        idx_row("상해종합", "Shanghai Comp.", ind.get("shanghai")),
    ]
    if hscei:
        ov_rows.append(idx_row("HSCEI", "HSCEI", hscei))
    else:
        ov_rows.append([L("HSCEI", "HSCEI"), '<span class="mut">&mdash;</span>', "", VF_N])
        warn.append("HSCEI 를 받지 못했습니다 — 항셍(HSI)으로 갈음하지 않고 비워 두었습니다.")
    ov_rows.append(idx_row("항셍", "Hang Seng", ind.get("hangseng")))
    us10 = (market.get("rates_us") or {})
    if us10.get("curve"):
        ov_rows.append([L("미국채 10년", "UST 10Y"),
                        n((us10["curve"] or {}).get("ust10y"), 3) + "%",
                        bp((us10.get("change_bp") or {}).get("ust10y")),
                        '<span class="mut">%s</span>' % (us10.get("date") or "")])
    ov_rows.append(idx_row("WTI", "WTI", ind.get("wti")))
    ov_rows.append(idx_row("금", "Gold", ind.get("gold")))

    b_ov = block("해외 (직전 마감)", "Overseas (latest close)",
                 table(hdr4, ov_rows), VF_MD,
                 "미국·유럽은 국내 마감 이전의 직전 거래일 종가입니다. 미국채는 재무부 곡선.")

    # ── ② 수급 합계 ────────────────────────────────────────────────
    # **날짜가 붙은 계열을 먼저 쓴다.** market_internals 는 「지금」 한 점이라
    # 장중에 받으면 오늘 진행분이 들어온다. 종가일 줄이 계열에 있으면 그것을
    # 쓰고, 없을 때만 한 점짜리로 물러서되 그 날짜를 표에 적는다.
    daily = (jr or {}).get("investor_daily") or {}
    sup_rows, sup_basis, det_row = [], [], {}
    for mk, ko, en in (("kospi", "코스피", "KOSPI"), ("kosdaq", "코스닥", "KOSDAQ")):
        o = (mi.get(mk) or {})
        pg = o.get("program_trading") or {}
        ser = (daily.get(ko) or {}).get("rows") or []
        hit = next((r for r in ser if r.get("date") == close_date), None)
        if hit:
            fl, asof = hit, close_date
            det_row[ko] = hit.get("detail") or {}
        else:
            fl, asof = (o.get("investor_flows") or {}), (mi_biz or close_date)
            if ser:
                warn.append("%s 투자자별 계열에 %s 줄이 없어 %s 시점 한 점을 썼습니다."
                            % (ko, close_date, asof))
        sup_basis.append("%s %s" % (ko, asof))
        sup_rows.append([
            L(ko, en), eok(fl.get("retail")), eok(fl.get("foreign")),
            eok(fl.get("institution")), eok(pg.get("arb")), eok(pg.get("non_arb")),
        ])
    b_sup = block("투자자별 순매수 · 프로그램", "Net buying by investor & program",
                  table([("시장", "Market", "nm"), ("개인", "Retail", "n"),
                         ("외국인", "Foreign", "n"), ("기관", "Inst.", "n"),
                         ("차익", "Arb.", "n"), ("비차익", "Non-arb.", "n")], sup_rows),
                  VF_MD,
                  "단위 억원 · 순매수 기준일 %s · 프로그램 %s. 선물 외국인은 무료 원천이 없어 "
                  "비차익을 대용으로 봅니다."
                  % (" / ".join(sup_basis), mi_biz or close_date))

    # 기관 안쪽 — 시장일지가 묻는 「사모펀드 순매수」는 여기까지 받을 수 있다.
    b_det = None
    if det_row:
        keys = ["금융투자", "보험", "투신", "사모펀드", "은행", "기타금융", "연기금"]
        rows = []
        for ko in ("코스피", "코스닥"):
            dt = det_row.get(ko) or {}
            if not dt:
                continue
            rows.append([L(ko, ko)] + [eok(dt.get(k)) for k in keys])
        if rows:
            b_det = block("기관 안쪽 순매수", "Institutional breakdown",
                          table([("시장", "Market", "nm")]
                                + [(k, k, "n") for k in keys], rows), VF_MD,
                          "단위 억원 · 기준일 %s. **종목별 사모펀드 순매수는 거래소에만 있고 "
                          "수집 서버가 막혀 있어 시장 합계까지만 싣습니다.**" % close_date)
    if not b_det:
        warn.append("기관 안쪽(사모펀드·연기금 등) 순매수를 받지 못했습니다.")

    # 등락 종목수
    br_rows = []
    for mk, ko, en in (("kospi", "코스피", "KOSPI"), ("kosdaq", "코스닥", "KOSDAQ")):
        b = ((mi.get(mk) or {}).get("breadth") or {})
        br_rows.append([L(ko, en), str(b.get("limit_up", "")), str(b.get("advancing", "")),
                        str(b.get("unchanged", "")), str(b.get("declining", "")),
                        str(b.get("limit_down", ""))])
    b_br = block("등락 종목수", "Advancers & decliners",
                 table([("시장", "Market", "nm"), ("상한", "Lim↑", "n"), ("상승", "Adv", "n"),
                        ("보합", "Unch", "n"), ("하락", "Dec", "n"), ("하한", "Lim↓", "n")],
                       br_rows), VF_MD)

    # ── ③ 종목별 수급 ───────────────────────────────────────────────
    # 원천은 시장 × 투자자별로 매수·매도 상위 20 을 준다. 그 스무 줄이 우리가
    # 보는 전부이므로, 「쌍매수」는 **두 명단에 함께 든 종목**으로 정의하고
    # 그렇게 적는다. 전체 종목에서 두 주체가 모두 순매수한 종목이 아니다.
    irank = (jr or {}).get("investor_rank") or {}

    def flow_val(r):
        """금액이 왔으면 금액, 없으면 수량 × 종가로 어림한 값(꼬리표를 단다)."""
        if r.get("value_eok") is not None:
            return eok(r["value_eok"], 0)
        if r.get("value_eok_est") is not None:
            return eok(r["value_eok_est"], 0) + '<span class="mut">≈</span>'
        return '<span class="mut">&mdash;</span>'

    def sort_key(r):
        """**크기 순**으로 세운다 — 매도 쪽은 값이 음수로 오기 때문이다.

        부호를 그대로 두고 내림차순으로 세우면 매도 상위가 가장 적게 판
        종목부터 늘어선다(실제로 그렇게 나왔다: −2억, −3억, −4억…).
        """
        v = r.get("value_eok")
        if v is None:
            v = r.get("value_eok_est")
        return -abs(v if v is not None else 0)

    def flow_block(mkt, side_label, direction, title_ko, title_en, cap=8):
        s = ((irank.get(mkt) or {}).get("sides") or {}).get(side_label)
        if not s or not s.get(direction):
            return None
        rows = sorted(s[direction], key=sort_key)[:cap]
        basis = s.get("rank_basis") or ""
        est = " · **장중 잠정치**" if s.get("estimated") else ""
        nt = ("원천 차례는 %s 기준 · 기준일 %s%s. 「≈」는 금액이 오지 않아 "
              "수량 × 종가로 어림한 값입니다."
              % (esc(basis), esc(ymd(s.get("bizdate")) or ""), est))
        return block(title_ko, title_en,
                     table([("종목", "Name", "nm"), ("순매수", "Net", "n"),
                            ("종가", "Close", "n"), ("등락", "Chg", "n")],
                           [[nm(dict(r, market=mkt)), flow_val(r),
                             won(r.get("close")), pct(r.get("change_pct"))]
                            for r in rows]),
                     VF_MD if not s.get("estimated") else VF_P, nt)

    b_frgn = flow_block("코스피", "외국인", "buy",
                        "코스피 외국인 순매수 상위", "KOSPI — foreign net buy")
    b_inst = flow_block("코스피", "기관", "buy",
                        "코스피 기관 순매수 상위", "KOSPI — institutional net buy")
    b_frgn_kq = flow_block("코스닥", "외국인", "buy",
                           "코스닥 외국인 순매수 상위", "KOSDAQ — foreign net buy")
    b_inst_kq = flow_block("코스닥", "기관", "buy",
                           "코스닥 기관 순매수 상위", "KOSDAQ — institutional net buy")
    b_frgn_sell = flow_block("코스피", "외국인", "sell",
                             "코스피 외국인 순매도 상위", "KOSPI — foreign net sell")
    b_inst_sell = flow_block("코스피", "기관", "sell",
                             "코스피 기관 순매도 상위", "KOSPI — institutional net sell")

    if b_frgn is None and b_inst is None:
        b_frgn = block("종목별 수급", "Net buying by stock",
                       empty("기관·외국인 종목별 순매수를 받지 못했습니다.",
                             "Per-stock investor flows unavailable."), VF_N,
                       "관찰 기록은 data/journal/raw/journal_xhr*.txt 에 있습니다.")
        warn.append("종목별 기관·외국인 순매수를 채우지 못했습니다.")

    # 쌍매수 · 쌍매도 — 두 명단의 교집합
    def both(direction, ko, en):
        rows = []
        for mkt in ("코스피", "코스닥"):
            sides = (irank.get(mkt) or {}).get("sides") or {}
            fo = {r["code"]: r for r in ((sides.get("외국인") or {}).get(direction) or [])}
            io = {r["code"]: r for r in ((sides.get("기관") or {}).get(direction) or [])}
            for code in set(fo) & set(io):
                rows.append((mkt, fo[code], io[code]))
        rows.sort(key=lambda t: sort_key(t[1]) + sort_key(t[2]))
        return [[L(ko, en), nm(dict(t[1], market=t[0])), flow_val(t[1]), flow_val(t[2])]
                for t in rows[:9]]

    rows2 = both("buy", "쌍매수", "Both buy") + both("sell", "쌍매도", "Both sell")
    b_both = block("쌍매수 · 쌍매도", "Both-side buy / sell",
                   table([("구분", "Side", "c"), ("종목", "Name", "nm"),
                          ("외국인", "Foreign", "n"), ("기관", "Inst.", "n")], rows2)
                   if rows2 else empty("겹친 종목이 없습니다.", "No overlap."),
                   VF_C if rows2 else VF_N,
                   "**두 주체의 상위 20 명단에 함께 든 종목**입니다. 전 종목에서 둘 다 "
                   "순매수한 종목을 모두 센 것이 아닙니다.")

    # 연속 순매수는 원천이 하루치만 주므로 대형주 100 누적본에서 가져온다.
    flows = (jr or {}).get("flows_kr100")
    b_streak = None
    if flows and flows.get("rows"):
        nmap = {}
        for code, s in (market.get("stocks") or {}).items():
            nmap[str(code).split(".")[0]] = s.get("name_ko") or s.get("name") or code
        for mkt, kinds in ((jr or {}).get("rank") or {}).items():
            for lst in kinds.values():
                if isinstance(lst, list):
                    for s in lst:
                        nmap.setdefault(s.get("code"), s.get("name"))
        fs = sorted([r for r in flows["rows"] if (r.get("foreign_streak") or 0) >= 3],
                    key=lambda r: -(r["foreign_streak"]))[:8]
        is_ = sorted([r for r in flows["rows"] if (r.get("inst_streak") or 0) >= 3],
                     key=lambda r: -(r["inst_streak"]))[:8]
        rows3 = [[L("외국인", "Foreign"),
                  '%s <span class="mut">%s</span>' % (esc(nmap.get(r["code"], r["code"])), r["code"]),
                  "%d일" % r["foreign_streak"], eok(r.get("foreign_eok"), 0)] for r in fs]
        rows3 += [[L("기관", "Inst."),
                   '%s <span class="mut">%s</span>' % (esc(nmap.get(r["code"], r["code"])), r["code"]),
                   "%d일" % r["inst_streak"], eok(r.get("inst_eok"), 0)] for r in is_]
        b_streak = block("연속 순매수 (3일 이상, 대형주 100 기준)",
                         "Consecutive net buying (3d+, top 100 caps)",
                         table([("주체", "Side", "c"), ("종목", "Name", "nm"),
                                ("연속", "Days", "n"), ("당일", "Today", "n")], rows3)
                         if rows3 else empty("3일 이상 이어 산 종목이 없습니다.", "None."),
                         VF_P,
                         "**시가총액 상위 100 종목 안에서만** 셉니다. 원천이 하루치만 주므로 "
                         "누적본(data/flows/kr100.json)에서 이었습니다 · 기준일 %s"
                         % esc(flows.get("bizdate")))
    else:
        warn.append("연속 순매수를 셀 누적 자료(data/flows/kr100.json)에 기준일 줄이 없습니다.")

    # ── ④ 순위 (전종목) ────────────────────────────────────────────
    def rank_block(market_key, kind, title_ko, title_en, col_ko, col_en, fmt, cap=8,
                   note="", cls="dt"):
        r = ((jr or {}).get("rank") or {}).get(market_key) or {}
        lst = (r.get(kind) or [])[:cap]
        if not lst:
            return block(title_ko, title_en, empty("해당 종목이 없습니다.", "None."), VF_N)
        return block(title_ko, title_en,
                     table([("종목", "Name", "nm"), ("종가", "Close", "n"),
                            ("등락", "Chg", "n"), (col_ko, col_en, "n")],
                           [[nm(s), won(s.get("close")), pct(s.get("change_pct")), fmt(s)]
                            for s in lst], cls=cls),
                     VF_C, note)

    jr_tag = ("순위 기준 %s%s" % (jr_date or "", " · 장중 잠정" if jr_status == "OPEN" else "")) if jr else ""

    b_val_kp = rank_block("코스피", "거래대금상위", "코스피 거래대금 상위", "KOSPI by turnover",
                          "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원",
                          8, jr_tag)
    b_val_kq = rank_block("코스닥", "거래대금상위", "코스닥 거래대금 상위", "KOSDAQ by turnover",
                          "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원",
                          8, jr_tag)
    b_up_kp = rank_block("코스피", "상승률상위", "코스피 상승률 상위", "KOSPI top gainers",
                         "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원",
                         8, jr_tag)
    b_up_kq = rank_block("코스닥", "상승률상위", "코스닥 상승률 상위", "KOSDAQ top gainers",
                         "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원",
                         8, jr_tag)

    # 신고가·상한가·거래량급증은 두 시장을 합쳐 한 표로 — 자리를 아낀다.
    def merged(kind, cap, fmt, col_ko, col_en, key=None):
        out = []
        for mk in ("코스피", "코스닥"):
            out += ((((jr or {}).get("rank") or {}).get(mk) or {}).get(kind) or [])
        if key:
            out.sort(key=key)
        return out[:cap]

    nh = merged("신고가", 8, None, "", "", key=lambda s: -(s.get("value_eok") or 0))
    b_nh = block("52주 신고가 (종가 기준)", "52-week highs (close basis)",
                 table([("종목", "Name", "nm"), ("종가", "Close", "n"), ("등락", "Chg", "n"),
                        ("거래대금", "Turnover", "n")],
                       [[nm(s), won(s.get("close")), pct(s.get("change_pct")),
                         eok_plain(s.get("value_eok")) + "원"] for s in nh]) if nh
                 else empty("종가가 52주 최고가에 닿은 종목이 없습니다.", "None."),
                 VF_C if nh else VF_N,
                 "**오늘 올라서** 종가가 52주 최고가에 닿은 종목 · 거래대금 순 · "
                 "원천의 52주 최고가 칸은 최근 며칠을 반영하지 못할 때가 있습니다 · " + jr_tag)

    lim = merged("상한가", 6, None, "", "", key=lambda s: -(s.get("value_eok") or 0))
    b_lim = block("상한가", "Limit up",
                  table([("종목", "Name", "nm"), ("종가", "Close", "n"), ("등락", "Chg", "n"),
                         ("연속", "Days", "n")],
                        [[nm(s), won(s.get("close")), pct(s.get("change_pct")),
                          str(s.get("continual_upper") or 0) + "일"] for s in lim]) if lim
                  else empty("상한가 종목이 없습니다.", "None."),
                  VF_C if lim else VF_N, jr_tag)

    qs = merged("거래량급증", 8, None, "", "", key=lambda s: -(s.get("volume_diff_pct") or 0))
    b_qs = block("거래량 급증", "Volume surge",
                 table([("종목", "Name", "nm"), ("등락", "Chg", "n"),
                        ("전일대비 거래량", "vs prev vol", "n"), ("거래대금", "Turnover", "n")],
                       [[nm(s), pct(s.get("change_pct")),
                         sgn(s.get("volume_diff_pct"), 0, "%"),
                         eok_plain(s.get("value_eok")) + "원"] for s in qs]) if qs
                 else empty("해당 종목이 없습니다.", "None."),
                 VF_C if qs else VF_N,
                 "거래대금 100억원 이상인 종목 가운데 전일 거래량 대비 증가율 상위. 문턱이 없으면 평소 거래가 거의 없던 종목이 1등을 합니다.")

    # ── ⑤ ETF ──────────────────────────────────────────────────────
    etf = (jr or {}).get("etf") or {}
    LEV = re.compile(r"레버리지|인버스|2X|3X|곱버스|선물\s*ETF", re.I)

    def etf_tbl(kind, col_ko, col_en, fmt, cap=8):
        lst = [e for e in (etf.get(kind) or []) if not LEV.search(e.get("name") or "")][:cap]
        if not lst:
            return None
        return table([("ETF", "ETF", "nm"), ("종가", "Close", "n"), ("등락", "Chg", "n"),
                      (col_ko, col_en, "n")],
                     [[esc(e.get("name")), won(e.get("close")), pct(e.get("change_pct")), fmt(e)]
                      for e in lst])

    t_up = etf_tbl("상승률상위", "거래대금", "Turnover", lambda e: eok_plain(e.get("value_eok")) + "원")
    t_vl = etf_tbl("거래대금상위", "거래대금", "Turnover", lambda e: eok_plain(e.get("value_eok")) + "원")
    etf_note = "레버리지·인버스는 이름으로 걸러 뺐습니다(레버리지·인버스·2X·곱버스)."
    if str(etf.get("상승률_기준") or "").startswith("tradingValueDesc"):
        etf_note += " **상승률 차례는 거래대금 상위 100 안에서 매긴 것**이라 전체 ETF 상승률 상위가 아닙니다."
        warn.append("ETF 상승률 순위가 거래대금 상위 100 안에서 매겨졌습니다.")
    b_etf_up = block("ETF 상승률 상위 (레버리지·인버스 제외)", "ETF top gainers (ex-leveraged/inverse)",
                     t_up or empty("ETF 순위를 받지 못했습니다.", "ETF ranking unavailable."),
                     VF_C if t_up else VF_N, etf_note)
    b_etf_vl = block("ETF 거래대금 상위 (레버리지·인버스 제외)", "ETF by turnover (ex-leveraged/inverse)",
                     t_vl or empty("ETF 순위를 받지 못했습니다.", "ETF ranking unavailable."),
                     VF_C if t_vl else VF_N,
                     "원천이 주는 위 100 줄에서 레버리지·인버스를 뺀 순위입니다 — "
                     "국내 상장 ETF %s 종목 전부를 훑은 것이 아닙니다."
                     % esc(etf.get("총상장") or "?"))
    if not t_up:
        warn.append("ETF 순위를 받지 못했습니다.")

    # ── ⑥ 테마 · 업종 ──────────────────────────────────────────────
    def theme_items(o):
        raw = (o or {}).get("raw") or {}
        return raw.get("items") or []

    th_items = theme_items((jr or {}).get("themes"))[:4]
    if th_items:
        rows = []
        for t in th_items:
            # topByChangeRate 는 **목록**이다. 맨 앞이 그 테마의 주도주다.
            lead = (t.get("topByChangeRate") or [{}])[0]
            lv = lead.get("value")
            rows.append([esc(t.get("name")),
                         pct(float(t["changeRate"])) if t.get("changeRate") is not None else "",
                         '%d↑ / %d↓' % (int(t.get("risingCount") or 0), int(t.get("fallingCount") or 0)),
                         '%s %s' % (esc(lead.get("name") or ""),
                                    pct(float(lv)) if lv is not None else "")])
        b_theme = block("주요 테마 4", "Top 4 themes",
                        table([("테마", "Theme", "nm"), ("등락률", "Chg", "n"),
                               ("등락 종목수", "Adv/Dec", "c"), ("주도주", "Leader", "nm")], rows),
                        VF_MD, "네이버 테마 등락률 상위 · " + jr_tag)
    else:
        b_theme = block("주요 테마 4", "Top 4 themes",
                        empty("테마 순위를 받지 못했습니다.", "Theme ranking unavailable."), VF_N)
        warn.append("테마 순위를 받지 못했습니다.")

    sect = market.get("sectors") or {}
    s_rows = [[esc(s.get("name")), pct(s.get("change_pct")),
               '%s↑ / %s↓' % (s.get("advancing"), s.get("declining"))]
              for s in (sect.get("top5") or [])[:5]]
    s_rows += [[esc(s.get("name")), pct(s.get("change_pct")),
                '%s↑ / %s↓' % (s.get("advancing"), s.get("declining"))]
               for s in (sect.get("bottom5") or [])[:5]]
    b_sect = block("업종 등락 상·하위 5", "Sectors — top/bottom 5",
                   table([("업종", "Sector", "nm"), ("등락률", "Chg", "n"),
                          ("등락 종목수", "Adv/Dec", "c")], s_rows) if s_rows
                   else empty("업종 자료가 없습니다.", "No sector data."),
                   VF_MD if s_rows else VF_N)

    # ── ⑦ 오늘의 이슈 ──────────────────────────────────────────────
    arts = ((market.get("news") or {}).get("articles") or [])[:5]
    if arts:
        lis = "".join('<li>%s</li>' % esc(a.get("title")) for a in arts)
        b_news = block("오늘의 시장 이슈 (수집 기사 제목)", "Today's headlines (as collected)",
                       '<ul class="iss">%s</ul>' % lis, VF_1,
                       "수집기가 받아 둔 증시 기사 **제목 그대로**입니다. 해석·인과는 붙이지 않았습니다. "
                       "기사일 %s" % esc((market.get("news") or {}).get("date") or ""))
    else:
        b_news = block("오늘의 시장 이슈", "Today's headlines",
                       empty("기사를 받지 못했습니다.", "No articles."), VF_N)

    # ── 쪽 짜기 ────────────────────────────────────────────────────
    gen = (jr or {}).get("generated_at_kst") or ""
    hd = (
        '<div class="hd"><div>'
        '<div class="kicker">%s</div>'
        '<h1>%s</h1></div>'
        '<div class="sub">%s<br>%s</div></div>'
        % (L("미래에셋증권 마포WM · 국내 시장일지",
             "Mirae Asset Securities Mapo WM · Korea Market Journal"),
           L("%s 마감" % DK(cdate, True), "Close, %s" % DE(cdate, True)),
           L("KRX 정규장 마감(15:30 KST) 기준",
             "Basis: KRX regular session close, 15:30 KST"),
           L("작성 %s KST" % now.strftime("%Y-%m-%d %H:%M"),
             "Compiled %s KST" % now.strftime("%Y-%m-%d %H:%M"))))

    lede = ""
    if warn:
        lede = ('<div class="lede"><b>%s</b> %s</div>'
                % (L("확인해 주십시오 —", "Please note —"),
                   " / ".join(strong(esc(w)) for w in warn)))

    uni = (jr or {}).get("universe") or {}
    foot = (
        '<div class="foot">%s</div>'
        % L("수치 출처 — 지수·환율·금리·예탁금: 거래소·한국은행·네이버 시장지표 수집본"
            "(data/market/latest.json). 종목 순위: 네이버 종목 목록 API 에서 <b>시가총액 상위 "
            "%s 종목</b>(코스피 %s · 코스닥 %s)을 받아 순위는 직접 매김 — 거래소 상장 전종목이 "
            "아닙니다. 종목별 기관·외국인 순매수는 원천이 주는 <b>상위 20</b>이 전부입니다. "
            "연속 순매수는 시가총액 상위 100 종목 한정. 배지 — MARKET DATA 수집 원천 그대로 · "
            "CALCULATED 원자료에서 우리가 셈 · PARTIAL 표본·시점이 제한됨 · NOT FOUND 확보 실패. "
            "이 자료는 정보 제공 목적이며 투자 권유가 아닙니다."
            % (uni.get("표본", "?"), uni.get("코스피", "?"), uni.get("코스닥", "?")),
            "Sources — indices, FX, rates and deposits from the collected market file. "
            "Stock rankings computed in-house from the <b>top %s stocks by market cap</b> "
            "(KOSPI %s, KOSDAQ %s), not the full listed universe. Per-stock investor flows "
            "are the provider's <b>top 20</b> only. Badges: MARKET DATA, CALCULATED, "
            "PARTIAL, NOT FOUND. For information only; not investment advice."
            % (uni.get("표본", "?"), uni.get("코스피", "?"), uni.get("코스닥", "?"))))

    sheet1 = (
        '<article class="sheet">%s%s%s'
        '<div class="g2"><div>%s%s</div><div>%s%s</div></div>'
        '<div class="g2"><div>%s%s</div><div>%s%s</div></div>'
        '%s%s%s</article>'
        % (hd, lede, strip,
           b_dom, b_sup,
           b_ov, b_br,
           (b_frgn or ""), b_val_kp,
           (b_inst or ""), b_up_kq,
           '<div class="g2"><div>' + b_theme + '</div><div>' + b_news + '</div></div>',
           "", foot))

    hd2 = (
        '<div class="hd"><div><div class="kicker">%s</div><h1>%s</h1></div>'
        '<div class="sub">%s</div></div>'
        % (L("대시보드 · 수급과 순위", "Dashboard · Flows and rankings"),
           L("%s 마감" % DK(cdate, True), "Close, %s" % DE(cdate, True)),
           L("종목별 기관·외국인 매매와 기관 안쪽", "Per-stock flows and the institutional split")))

    # 대시보드 — 상위 20 로 넓힌 판
    def wide(market_key, kind, title_ko, title_en, col_ko, col_en, fmt):
        return rank_block(market_key, kind, title_ko, title_en, col_ko, col_en, fmt, 20,
                          jr_tag, cls="dt dense")

    sheet2 = (
        '<article class="sheet">%s'
        '<div class="g2"><div>%s%s</div><div>%s%s</div></div>'
        '<div class="g2"><div>%s%s</div><div>%s%s</div></div>'
        '<div class="g2"><div>%s</div><div>%s</div></div>'
        '</article>'
        % (hd2,
           (b_frgn_kq or ""), (b_frgn_sell or ""),
           (b_inst_kq or ""), (b_inst_sell or ""),
           b_both, (b_streak or ""),
           (b_det or ""), b_sect,
           b_etf_up, b_etf_vl))

    hd3 = (
        '<div class="hd"><div><div class="kicker">%s</div><h1>%s</h1></div>'
        '<div class="sub">%s</div></div>'
        % (L("대시보드 · ETF와 시장 안쪽", "Dashboard · ETF and internals"),
           L("%s 마감" % DK(cdate, True), "Close, %s" % DE(cdate, True)),
           L("거래대금 10억원 이상 종목 기준 · 레버리지·인버스 제외",
             "Turnover floor KRW 1bn · leveraged/inverse excluded")))

    sheet3 = (
        '<article class="sheet">%s'
        '<div class="g2"><div>%s</div><div>%s</div></div>'
        '<div class="g2"><div>%s</div><div>%s</div></div>'
        '<div class="g2"><div>%s%s</div><div>%s%s</div></div>'
        '</article>'
        % (hd3,
           wide("코스피", "상승률상위", "코스피 상승률 상위 20", "KOSPI top 20 gainers",
                "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원"),
           wide("코스닥", "상승률상위", "코스닥 상승률 상위 20", "KOSDAQ top 20 gainers",
                "거래대금", "Turnover", lambda s: eok_plain(s.get("value_eok")) + "원"),
           wide("코스피", "거래대금상위", "코스피 거래대금 상위 20", "KOSPI top 20 by turnover",
                "거래량증감", "Vol chg", lambda s: sgn(s.get("volume_diff_pct"), 0, "%")),
           wide("코스닥", "거래대금상위", "코스닥 거래대금 상위 20", "KOSDAQ top 20 by turnover",
                "거래량증감", "Vol chg", lambda s: sgn(s.get("volume_diff_pct"), 0, "%")),
           b_nh, b_lim, b_qs, ""))

    html = page("국내 시장일지 %s" % close_date,
                "Korea Market Journal %s" % close_date,
                [sheet1, sheet2, sheet3])

    # ── 텔레그램 전송본 ────────────────────────────────────────────
    def t_pct(v):
        return "—" if v is None else ("%+.2f%%" % v)

    tl = []
    tl.append("[국내 시장일지] %s 마감" % DK(cdate, True))
    tl.append("KRX 정규장 마감(15:30) 기준 · 작성 %s KST" % now.strftime("%H:%M"))
    if warn:
        tl.append("※ " + " / ".join(w.replace("**", "") for w in warn))
    tl.append("")
    tl.append("· 코스피 %s (%s) / 코스닥 %s (%s)"
              % (n(kospi.get("close")).replace("&mdash;", "—"), t_pct(kospi.get("change_pct")),
                 n(kosdaq.get("close")).replace("&mdash;", "—"), t_pct(kosdaq.get("change_pct"))))
    tl.append("· 원/달러 %s (매매기준율) · 국고3년 %s · 미10년 %s"
              % (n(seoul, 1) if seoul else "—",
                 ("%.3f%%" % ktb3["value"]) if ktb3.get("value") is not None else "—",
                 ("%.3f%%" % (us10.get("curve") or {}).get("ust10y")
                  if (us10.get("curve") or {}).get("ust10y") is not None else "—")))
    if mf:
        tl.append("· 고객예탁금 %s원 · 신용잔고 %s원 (%s)"
                  % (eok_plain(mf.get("deposit")).replace("&mdash;", "—"),
                     eok_plain(mf.get("credit_balance")).replace("&mdash;", "—"),
                     mf.get("date")))
    tl.append("")
    for mk, ko in (("kospi", "코스피"), ("kosdaq", "코스닥")):
        ser = ((daily.get(ko) or {}).get("rows") or [])
        fl = next((r for r in ser if r.get("date") == close_date), None) \
            or ((mi.get(mk) or {}).get("investor_flows") or {})
        tl.append("· %s 수급 — 개인 %s / 외국인 %s / 기관 %s (억원)"
                  % (ko, n(fl.get("retail"), 0).replace("&mdash;", "—"),
                     n(fl.get("foreign"), 0).replace("&mdash;", "—"),
                     n(fl.get("institution"), 0).replace("&mdash;", "—")))
        det = (fl.get("detail") or {}) if isinstance(fl, dict) else {}
        if det.get("사모펀드") is not None:
            tl.append("   (기관 안쪽 — 금융투자 %s / 투신 %s / 사모 %s / 연기금 %s)"
                      % tuple(n(det.get(k), 0).replace("&mdash;", "—")
                              for k in ("금융투자", "투신", "사모펀드", "연기금")))

    def t_flow(mkt, side, direction, label):
        s = ((irank.get(mkt) or {}).get("sides") or {}).get(side)
        if not s or not s.get(direction):
            return
        rows = sorted(s[direction], key=sort_key)[:5]
        est = "≈" if rows and rows[0].get("value_eok") is None else ""
        tl.append("· %s — %s" % (label, ", ".join(
            "%s %s%s억" % (r["name"], est,
                          n(r.get("value_eok") if r.get("value_eok") is not None
                            else r.get("value_eok_est"), 0).replace("&mdash;", "—"))
            for r in rows)))

    t_flow("코스피", "외국인", "buy", "코스피 외국인 순매수 상위")
    t_flow("코스피", "기관", "buy", "코스피 기관 순매수 상위")
    t_flow("코스닥", "외국인", "buy", "코스닥 외국인 순매수 상위")
    t_flow("코스닥", "기관", "buy", "코스닥 기관 순매수 상위")
    tl.append("")
    for mkk, ko in (("코스피", "코스피"), ("코스닥", "코스닥")):
        r = ((jr or {}).get("rank") or {}).get(mkk) or {}
        v = (r.get("거래대금상위") or [])[:5]
        if v:
            tl.append("· %s 거래대금 상위 — " % ko
                      + ", ".join("%s(%s)" % (s["name"], t_pct(s.get("change_pct"))) for s in v))
    if th_items:
        tl.append("· 주요 테마 — " + ", ".join(
            "%s %s" % (t.get("name"), t_pct(float(t["changeRate"])) if t.get("changeRate") else "")
            for t in th_items))
    if nh:
        tl.append("· 52주 신고가(종가) %d종목 — %s"
                  % (len(nh), ", ".join(s["name"] for s in nh[:6])))
    if lim:
        tl.append("· 상한가 — " + ", ".join(s["name"] for s in lim))
    tl.append("")
    tl.append("※ 종목 순위는 시가총액 상위 %s종목 표본(거래소 전종목 아님), "
              "종목별 수급은 원천이 주는 상위 20 이 전부입니다."
              % (uni.get("표본", "?")))
    tl.append("※ 정보 제공 목적이며 투자 권유가 아닙니다. 미래에셋증권 마포WM")
    telegram = "\n".join(tl)

    claims["warnings"] = warn
    claims["close_date"] = close_date
    return html, telegram, claims


# ── 목록 ─────────────────────────────────────────────────────────────
def build_index() -> str:
    files = sorted((f for f in os.listdir(DOCS)
                    if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.html", f)), reverse=True)
    items = "".join(
        '<li><a href="%s">%s</a></li>' % (f, DK(d(f[:10]), True)) for f in files)
    body = ('<article class="sheet"><div class="hd"><div>'
            '<div class="kicker">미래에셋증권 마포WM</div><h1>국내 시장일지</h1></div>'
            '<div class="sub">거래일마다 16:00 KST 발행</div></div>'
            '<section class="blk"><div class="rule"></div>'
            '<h2>지난 판</h2><ul class="iss">%s</ul></section></article>' % items)
    return page("국내 시장일지 — 목록", "Korea Market Journal — Index", [body])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="기준일을 강제한다 (YYYY-MM-DD). 기본은 시세 파일의 종가일")
    ap.add_argument("--out", default=DOCS)
    args = ap.parse_args()

    market = load(MARKET)
    if not market:
        print("data/market/latest.json 이 없습니다 — scripts/fetch_market.py 를 먼저 돌리십시오",
              file=sys.stderr)
        return 1
    jr = load(JOURNAL)
    if not jr:
        print("data/journal/latest.json 이 없습니다 — 순위 없이 짓습니다", file=sys.stderr)

    now = datetime.datetime.now(KST)
    html, telegram, claims = build(market, jr, now)

    os.makedirs(args.out, exist_ok=True)
    date = args.date or claims["close_date"]
    with open(os.path.join(args.out, f"{date}.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    with open(os.path.join(args.out, f"{date}.txt"), "w", encoding="utf-8") as fh:
        fh.write(telegram + "\n")
    with open(os.path.join(args.out, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(build_index())
    with open(os.path.join("data/journal", f"claims-{date}.json"), "w", encoding="utf-8") as fh:
        json.dump(claims, fh, ensure_ascii=False, indent=1)

    print(f"지었습니다 — {args.out}/{date}.html · {args.out}/{date}.txt")
    for w in claims["warnings"]:
        print("  경고:", w.replace("**", ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
