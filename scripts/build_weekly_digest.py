#!/usr/bin/env python3
"""주간 마켓 다이제스트를 만든다.

data/market/latest.json 하나로 한 주를 정리한다. 수집기가 모든 지수·종목·
ETF·업종에 perf(w1/m1/m3/m6/y1/ytd) 를 붙여 두고, index_daily·investors_kospi·
money_flow.series 에 20~29거래일 시계열을 함께 담기 때문에 파일을 여러 날짜로
거슬러 읽을 필요가 없다.

산출물은 다른 브리핑과 같은 규칙을 따른다 — <html>·<body> 없는 본문 조각을
docs/briefings/<날짜>-weekly.html 로 쓰고 index.json 에 등록한다. 그러면
아카이브(docs/index.html) 의 목록·검색·본문 보기가 그대로 걸리고, 아티팩트로
다시 발행할 수도 있다.

    python3 scripts/build_weekly_digest.py            # latest.json 기준
    python3 scripts/build_weekly_digest.py --no-index # index.json 등록 생략

차트 색: 계열은 4개를 넘기지 않고, 등락은 상승 #C62828 / 하락 #043B72
다이버징 페어를 쓴다(둘 다 대비 3:1 통과). 오렌지(#F58220)는 대비가 2.53:1
이라 단독 식별에 기대지 않고 항상 수치 라벨과 표를 함께 싣는다.
"""

from __future__ import annotations

import argparse
import json
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKET = ROOT / 'data' / 'market' / 'latest.json'
BRIEF_DIR = ROOT / 'docs' / 'briefings'
INDEX_JSON = BRIEF_DIR / 'index.json'

import masviz as mv
from masviz import (BLUE, ORANGE, bp, cell, cls, eok, esc, hbars, num, pct,
                    section, table)

WEEKDAY_KO = ['월', '화', '수', '목', '금', '토', '일']


def w1(d):
    """수집기가 붙여 둔 주간 등락률. 없으면 None."""
    return (d.get('perf') or {}).get('w1')


def dual_line(series, **kw):
    """두 계열을 «첫날 = 100» 으로 맞춰 한 축에 올린다."""
    return mv.lines(series, rebase=True, digits=1, **kw)


def build(m: dict, briefings: list[dict]) -> tuple[str, dict]:
    idx = m['indices']
    kospi, kosdaq = idx['kospi'], idx['kosdaq']

    # 기준일 — 국내 지수 종가 날짜. 주 범위는 그 날이 속한 ISO 주.
    ref = date.fromisoformat(kospi['date'])
    monday = ref - timedelta(days=ref.weekday())
    friday = monday + timedelta(days=4)
    iso = ref.isocalendar()
    week_tag = f'{iso.year}-W{iso.week:02d}'
    span = (f'{monday.year}년 {monday.month}월 {monday.day}일'
            f'({WEEKDAY_KO[monday.weekday()]}) ~ '
            f'{friday.month}월 {friday.day}일({WEEKDAY_KO[friday.weekday()]})')

    parts = []

    # ---- 헤로 -------------------------------------------------------
    parts.append(
        f'<header class="hero">'
        f'<div class="hero-tag">[사내한] · 주간 판</div>'
        f'<h1>주간 마켓 다이제스트</h1>'
        f'<p class="hero-sub">{esc(span)} · {week_tag} · 미래에셋증권 마포WM</p>'
        f'<p class="hero-note">국내 종가는 {esc(kospi["date"])} 기준입니다. '
        f'수치는 모두 수집 파일(<code>data/market/latest.json</code>, '
        f'{esc(m["generated_at_kst"])} KST)에서 계산했습니다.</p>'
        f'</header>'
    )

    # ---- 1. 한 주 요약 ---------------------------------------------
    cards = [
        ('코스피', kospi['close'], w1(kospi), 2),
        ('코스닥', kosdaq['close'], w1(kosdaq), 2),
        ('S&P 500', idx['sp500']['close'], w1(idx['sp500']), 2),
        ('원/달러', m.get('usdkrw_naver', {}).get('rate'),
         w1(next((r for r in m['fx']['rows'] if r['key'] == 'usdkrw'), {})), 1),
    ]
    stat = ['<div class="stats">']
    for label, close, chg, dg in cards:
        stat.append(
            f'<div class="stat"><div class="stat-label">{esc(label)}</div>'
            f'<div class="stat-value">{num(close, dg)}</div>'
            f'<div class="stat-chg {cls(chg)}">주간 {pct(chg)}</div></div>')
    stat.append('</div>')
    parts.append(section(
        1, '한 주 요약', ''.join(stat),
        '원/달러는 네이버 매매기준율입니다. 야후 <code>KRW=X</code> 는 런던 기준 '
        '24시간 시세라 서울 종가가 아니므로 쓰지 않았습니다.'))

    # ---- 2. 국내 지수 경로 ------------------------------------------
    kd = m.get('index_daily', {})
    ks_series = list(reversed([(r['date'], r['close'])
                               for r in kd.get('kospi', {}).get('series', [])]))
    kq_series = list(reversed([(r['date'], r['close'])
                               for r in kd.get('kosdaq', {}).get('series', [])]))
    body = dual_line([('코스피', ORANGE, ks_series), ('코스닥', BLUE, kq_series)])

    # 같은 값을 표로도 준다 — 대비 경고에 대한 상시 대안.
    rows = []
    for r in (kd.get('kospi', {}).get('series') or [])[:5]:
        kq = next((x for x in kd.get('kosdaq', {}).get('series', [])
                   if x['date'] == r['date']), {})
        rows.append([
            r['date'], num(r['close']), cell(r.get('change_pct')),
            num(kq.get('close')) if kq else '—', cell(kq.get('change_pct')),
            f"{r.get('value_mn_krw', 0) / 1_000_000:,.1f}조원"
            if r.get('value_mn_krw') else '—',
        ])
    body += table(['날짜', '코스피', '등락', '코스닥', '등락', '코스피 거래대금'],
                  rows, ['left', 'right', 'right', 'right', 'right', 'right'])
    parts.append(section(
        2, '국내 지수 — 최근 흐름', body,
        f'선은 기간 첫날을 100 으로 맞춘 값입니다(축 하나). 표는 직전 5거래일 '
        f'실제 종가이며, 거래대금은 거래소 일별시세 기준입니다.'))

    # ---- 3. 지수 주간 등락 ------------------------------------------
    groups = [
        ('국내·아시아', ['kospi', 'kosdaq', 'nikkei', 'hangseng', 'shanghai', 'taiwan']),
        ('미국', ['sp500', 'nasdaq', 'dow', 'russell', 'sox']),
        ('유럽', ['eurostoxx', 'dax', 'ftse', 'stoxx600']),
    ]
    NAMES = {
        'kospi': '코스피', 'kosdaq': '코스닥', 'nikkei': '니케이225',
        'hangseng': '항셍', 'shanghai': '상하이종합', 'taiwan': '대만가권',
        'sp500': 'S&P 500', 'nasdaq': '나스닥', 'dow': '다우',
        'russell': '러셀2000', 'sox': '필라델피아반도체',
        'eurostoxx': '유로스톡스50', 'dax': 'DAX', 'ftse': 'FTSE 100',
        'stoxx600': '스톡스600',
    }
    bars, trows = [], []
    for gname, keys in groups:
        for k in keys:
            d = idx.get(k)
            if not d:
                continue
            bars.append((NAMES.get(k, k), w1(d)))
            p = d.get('perf') or {}
            trows.append([
                f'{NAMES.get(k, k)} <span class="dim">{gname}</span>',
                num(d['close']), cell(d.get('change_pct')), cell(p.get('w1')),
                cell(p.get('m1')), cell(p.get('ytd')),
            ])
    body = hbars(bars)
    body += table(['지수', '종가', '일간', '1주', '1개월', 'YTD'], trows,
                  ['left', 'right', 'right', 'right', 'right', 'right'])
    parts.append(section(
        3, '지수 주간 등락', body,
        '막대는 주간 등락률입니다. 상승은 적색, 하락은 청색 — 국내 표기 관행을 '
        '따랐습니다. 종가일은 시장마다 다를 수 있습니다(휴장).'))

    # ---- 4. 국내 주도·부진 종목 --------------------------------------
    stocks = [(nm, d) for nm, d in m.get('stocks', {}).items() if w1(d) is not None]
    stocks.sort(key=lambda x: w1(x[1]), reverse=True)
    top, bottom = stocks[:8], stocks[-8:]
    body = ('<h3 class="sub">주간 상위 8</h3>'
            + hbars([(nm, w1(d)) for nm, d in top]))
    body += ('<h3 class="sub">주간 하위 8</h3>'
             + hbars([(nm, w1(d)) for nm, d in bottom]))
    trows = []
    for nm, d in top + list(reversed(bottom)):
        p = d.get('perf') or {}
        trows.append([nm, num(d['close'], 0), cell(d.get('change_pct')),
                      cell(p.get('w1')), cell(p.get('m1')), cell(p.get('ytd'))])
    body += table(['종목', '종가', '일간', '1주', '1개월', 'YTD'], trows,
                  ['left', 'right', 'right', 'right', 'right', 'right'])
    parts.append(section(
        4, '국내 주요 종목 — 주간 강약', body,
        f'수집 대상 {len(stocks)}종목 가운데 주간 등락 상·하위입니다. '
        f'전체 목록이 아니므로 «시장 전체 1위» 로 읽지 마십시오.'))

    # ---- 5. 미 업종 --------------------------------------------------
    us = [(nm, d) for nm, d in m.get('us_sectors', {}).items() if w1(d) is not None]
    us.sort(key=lambda x: w1(x[1]), reverse=True)
    body = hbars([(nm, w1(d)) for nm, d in us])
    body += table(['업종(ETF)', '종가', '일간', '1주', '1개월', 'YTD'],
                  [[f'{nm} <span class="dim">{d["symbol"]}</span>', num(d['close']),
                    cell(d.get('change_pct')), cell((d.get('perf') or {}).get('w1')),
                    cell((d.get('perf') or {}).get('m1')),
                    cell((d.get('perf') or {}).get('ytd'))] for nm, d in us],
                  ['left', 'right', 'right', 'right', 'right', 'right'])
    parts.append(section(5, '미국 업종 강약 (SPDR 섹터 ETF)', body,
                         '섹터 ETF 가격 등락이며 업종 지수 자체가 아닙니다.'))

    # ---- 6. 금리 -----------------------------------------------------
    ru = m.get('rates_us', {})
    curve, perf = ru.get('curve', {}), ru.get('perf', {})
    TENOR = {'ust1m': '1M', 'ust3m': '3M', 'ust6m': '6M', 'ust1y': '1Y',
             'ust2y': '2Y', 'ust3y': '3Y', 'ust5y': '5Y', 'ust7y': '7Y',
             'ust10y': '10Y', 'ust20y': '20Y', 'ust30y': '30Y'}
    body = ''
    if curve:
        body += hbars([(TENOR.get(k, k), (perf.get(k) or {}).get('w1'))
                       for k in TENOR if k in curve], unit='bp', digits=0)
        body += table(
            ['만기', '금리', '주간', '1개월', 'YTD'],
            [[TENOR[k], f'{curve[k]:.2f}%',
              cell((perf.get(k) or {}).get('w1'), kind='bp'),
              cell((perf.get(k) or {}).get('m1'), kind='bp'),
              cell((perf.get(k) or {}).get('ytd'), kind='bp')]
             for k in TENOR if k in curve],
            ['left', 'right', 'right', 'right', 'right'])
        sp = ru.get('spread_10y_2y_bp')
        body += (f'<p class="callout">10년−2년 스프레드 <strong>{sp}bp</strong>'
                 f'{" · 역전 상태" if ru.get("inverted") else " · 정상(우상향)"}'
                 f' · 기준일 {esc(ru.get("date", "—"))}</p>')

    rk = m.get('rates_kr', {})
    if rk:
        KR = [('국고 1년', 'ktb1y'), ('국고 3년', 'ktb3y'), ('국고 5년', 'ktb5y'),
              ('국고 10년', 'ktb10y'), ('회사채 3년(AA-)', 'corp3y'),
              ('CD 91일', 'cd91'), ('콜금리', 'call'),
              ('코픽스(신규)', 'cofix_new')]
        body += '<h3 class="sub">국내 금리</h3>'
        body += table(['항목', '금리'],
                      [[nm, f'{rk[k]:.3f}%'] for nm, k in KR if rk.get(k) is not None],
                      ['left', 'right'])
    parts.append(section(
        6, '금리', body,
        '미 국채는 재무부 일별 수익률 곡선이고, 주간 변화는 bp 입니다 — 금리는 '
        '«수익률» 이 아니라 «변화» 로 읽습니다. 국내 금리는 네이버 시장지표 '
        '기준으로 공시 시점이 하루 늦을 수 있습니다.'))

    # ---- 7. 수급·자금 ------------------------------------------------
    inv = m.get('investors_kospi', [])[:5]
    body = ''
    if inv:
        agg = {k: sum(r.get(k) or 0 for r in inv)
               for k in ('foreign', 'institution', 'retail')}
        body += hbars([('외국인', agg['foreign']), ('기관', agg['institution']),
                       ('개인', agg['retail'])], unit='억원', digits=0)
        body += table(
            ['날짜', '외국인', '기관', '개인'],
            [[r['date'],
              f'<span class="{cls(r.get("foreign"))}">{num(r.get("foreign"), 0)}</span>',
              f'<span class="{cls(r.get("institution"))}">{num(r.get("institution"), 0)}</span>',
              f'<span class="{cls(r.get("retail"))}">{num(r.get("retail"), 0)}</span>']
             for r in inv] +
            [['<strong>5거래일 누적</strong>',
              f'<strong class="{cls(agg["foreign"])}">{num(agg["foreign"], 0)}</strong>',
              f'<strong class="{cls(agg["institution"])}">{num(agg["institution"], 0)}</strong>',
              f'<strong class="{cls(agg["retail"])}">{num(agg["retail"], 0)}</strong>']],
            ['left', 'right', 'right', 'right'],
            highlight={'<strong>5거래일 누적</strong>'})

    mf = m.get('money_flow', {})
    ser = mf.get('series') or []
    if len(ser) >= 6:
        now, then = ser[0], ser[5]
        body += '<h3 class="sub">고객예탁금 · 신용잔고</h3>'
        body += table(
            ['항목', '최신', '5거래일 전', '변화'],
            [['고객예탁금', num(now['deposit'], 0), num(then['deposit'], 0),
              f'<span class="{cls(now["deposit"] - then["deposit"])}">'
              f'{eok(now["deposit"] - then["deposit"])}</span>'],
             ['신용잔고', num(now['credit_balance'], 0), num(then['credit_balance'], 0),
              f'<span class="{cls(now["credit_balance"] - then["credit_balance"])}">'
              f'{eok(now["credit_balance"] - then["credit_balance"])}</span>'],
             ['주식형 펀드', num(now['fund_equity'], 0), num(then['fund_equity'], 0),
              f'<span class="{cls(now["fund_equity"] - then["fund_equity"])}">'
              f'{eok(now["fund_equity"] - then["fund_equity"])}</span>']],
            ['left', 'right', 'right', 'right'])
        body += (f'<p class="note">단위 억원. 예탁금·신용잔고 기준일은 '
                 f'{esc(now["date"])} 입니다 — 신용잔고는 결제일 기준이라 '
                 f'종가일보다 1~2영업일 늦습니다.</p>')

    parts.append(section(7, '수급 · 자금', body,
                         '투자자별 순매수는 코스피 기준, 단위는 억원입니다.'))

    # ---- 8. 환율 -----------------------------------------------------
    fx = m.get('fx', {})
    rows = [[f'{r["name_ko"]} <span class="dim">{r["symbol"]}</span>',
             num(r['close'], 2), cell(r.get('change_pct')),
             cell((r.get('perf') or {}).get('w1')),
             cell((r.get('perf') or {}).get('m1')),
             cell((r.get('perf') or {}).get('ytd'))]
            for r in fx.get('rows', [])]
    parts.append(section(
        8, '환율', table(['통화쌍', '값', '일간', '1주', '1개월', 'YTD'], rows,
                         ['left', 'right', 'right', 'right', 'right', 'right']),
        esc(fx.get('note', ''))))

    # ---- 9. 이번 주 발행 브리핑 ---------------------------------------
    wk = [b for b in briefings
          if monday.isoformat() <= b['date'] <= (monday + timedelta(days=6)).isoformat()]
    if wk:
        rows = []
        for b in sorted(wk, key=lambda x: x['date']):
            d = date.fromisoformat(b['date'])
            link = (f'<a href="{esc(b["file"])}">원본</a>' if b.get('file') else '—')
            if b.get('url'):
                link += f' · <a href="{esc(b["url"])}">아티팩트</a>'
            rows.append([f'{b["date"]} ({WEEKDAY_KO[d.weekday()]})',
                         esc(b.get('label_ko') or b.get('session', '')),
                         esc(b.get('title', '')), link])
        body = table(['날짜', '판', '제목', '보기'], rows)
    else:
        body = '<p class="chart-empty">이 주에 보관된 브리핑이 없습니다.</p>'
    parts.append(section(9, '이번 주 발행 브리핑', body))

    # ---- 10. 검증 노트 ------------------------------------------------
    s = m.get('summary', {})
    parts.append(section(10, '검증 노트', (
        '<ul class="checks">'
        f'<li>수집 파일 생성 <strong>{esc(m["generated_at_kst"])} KST</strong> · '
        f'소스 {s.get("sources_ok", "?")}/{s.get("sources_tried", "?")} 성공</li>'
        f'<li>국내 지수 종가일 <strong>{esc(kospi["date"])}</strong> · '
        f'미 국채 곡선 기준일 <strong>{esc(ru.get("date", "—"))}</strong></li>'
        f'<li>주간 등락(<code>perf.w1</code>)은 수집기가 계산한 값을 그대로 옮겼습니다. '
        f'달력 기준이라 휴장이면 직전 거래일을 씁니다.</li>'
        f'<li>원/달러 종가는 <code>usdkrw_naver</code>(매매기준율)를, 야후 '
        f'<code>KRW=X</code> 는 «간밤 흐름» 으로만 씁니다.</li>'
        f'<li>세전·수수료 전 기준이며, 투자 권유가 아닌 사내 참고 자료입니다.</li>'
        '</ul>')))

    html = STYLE + ''.join(parts) + SCRIPT

    meta = {
        'date': ref.isoformat(),
        'session': 'weekly',
        'title': '주간 마켓 다이제스트',
        'label_ko': '주간',
        'label_en': 'Weekly',
        'url': None,
        'file': f'{ref.isoformat()}-weekly.html',
        'week': week_tag,
    }
    return html, meta


# ---------------------------------------------------------------- 스타일

# ---------------------------------------------------------------- 스타일
# 토큰·차트·표 CSS 는 masviz 가 갖는다. 여기에는 이 판 고유의 헤로와
# 요약 타일만 둔다.
PAGE_CSS = """
.hero{background:var(--primary);color:var(--on-primary);padding:38px 32px 34px;margin-bottom:56px}
.hero-tag{font-family:var(--font-en);font-size:14px;letter-spacing:.6px;opacity:.9;margin-bottom:10px}
.hero h1{color:var(--on-primary);font-size:34px;font-weight:700;letter-spacing:-.3px;line-height:1.25}
.hero-sub{margin:10px 0 0;font-size:19px;opacity:.97}
.hero-note{margin:14px 0 0;font-size:15px;opacity:.92;max-width:70ch}
.hero code{background:rgba(255,255,255,.18);color:#fff}
@media (max-width:768px){.hero{padding:28px 20px}.hero h1{font-size:26px}}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:19px}
@media (max-width:900px){.stats{grid-template-columns:repeat(2,1fr);gap:14px}}
@media (max-width:420px){.stats{grid-template-columns:1fr}}
/* 큰 수치가 트랙을 밀어내지 못하게 한다 — min-width:auto 면 그리드가 안 줄어든다. */
.stat{border:1px solid var(--hairline);border-radius:4px;padding:19px;min-width:0}
.stat-label{font-size:16px;font-weight:500;letter-spacing:.6px;color:var(--muted)}
.stat-value{font-family:var(--font-en);font-size:38px;font-weight:700;line-height:1.1;
  color:var(--ink);margin-top:6px}
.stat-chg{font-size:16px;margin-top:6px;font-weight:500}
@media (max-width:900px){.stat{padding:14px}.stat-value{font-size:30px}}

.checks{margin:0;padding-left:24px;font-size:17px}
.checks li{margin-bottom:8px}

@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .hero{background:#8A4410;--on-primary:#FFF1E4}
  :root:not([data-theme="light"]) .hero h1{color:#FFF1E4}
}
@media print{.hero{padding:16px 0;margin-bottom:24px}}
"""

STYLE = ('<meta charset="utf-8">\n'
         '<title>주간 마켓 다이제스트 | 미래에셋증권 마포WM</title>\n'
         '<style>' + mv.TOKENS + PAGE_CSS + '</style>\n')

SCRIPT = '<script>' + mv.TOOLTIP_JS + '</script>\n'


def register(meta: dict) -> None:
    """index.json 에 이번 판을 등록한다. 같은 날짜·판이 있으면 갈아 끼운다."""
    data = json.loads(INDEX_JSON.read_text(encoding='utf-8'))
    entry = {k: meta[k] for k in ('date', 'session', 'title', 'label_ko', 'label_en',
                                 'url', 'file')}
    data['briefings'] = [b for b in data['briefings']
                         if not (b['date'] == meta['date']
                                 and b.get('session') == meta['session'])]
    data['briefings'].append(entry)
    data['briefings'].sort(key=lambda b: (b['date'], b.get('session', '')), reverse=True)
    INDEX_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--no-index', action='store_true',
                    help='docs/briefings/index.json 등록을 건너뛴다')
    args = ap.parse_args()

    m = json.loads(MARKET.read_text(encoding='utf-8'))
    briefings = json.loads(INDEX_JSON.read_text(encoding='utf-8'))['briefings']

    html, meta = build(m, briefings)
    out = BRIEF_DIR / meta['file']
    out.write_text(html, encoding='utf-8')
    print(f'{out.relative_to(ROOT)} 생성 — {meta["week"]} '
          f'({out.stat().st_size // 1024} KB)')

    if not args.no_index:
        register(meta)
        print(f'{INDEX_JSON.relative_to(ROOT)} 등록 완료')
        print('아카이브를 다시 만드십시오: python3 scripts/build_briefing_archive.py')


if __name__ == '__main__':
    main()
