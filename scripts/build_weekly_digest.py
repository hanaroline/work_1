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

UP = '#C62828'      # 상승
DOWN = '#043B72'    # 하락
ORANGE = '#F58220'
BLUE = '#043B72'
GRID = '#A0A6A8'
AXIS = '#49535B'

WEEKDAY_KO = ['월', '화', '수', '목', '금', '토', '일']


# ---------------------------------------------------------------- 숫자 표기

def num(v, digits=2):
    if v is None:
        return '—'
    return f'{v:,.{digits}f}'


def pct(v, digits=2):
    """등락률. 부호를 항상 붙인다."""
    if v is None:
        return '—'
    return f'{v:+.{digits}f}%'


def bp(v):
    if v is None:
        return '—'
    return f'{v:+,.0f}bp'


def eok(v):
    """억원. 조 단위가 되면 조로 접는다."""
    if v is None:
        return '—'
    if abs(v) >= 10000:
        return f'{v / 10000:+,.1f}조원'
    return f'{v:+,.0f}억원'


def cls(v):
    if v is None:
        return 'flat'
    return 'up' if v > 0 else ('down' if v < 0 else 'flat')


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


# ---------------------------------------------------------------- 차트

def hbars(rows, unit='%', width=760, row_h=26, digits=2):
    """가로 막대. rows = [(라벨, 값), ...]

    등락 다이버징이므로 0 을 가운데 두고 좌우로 뻗는다. 값은 막대 끝에
    직접 적는다 — 오렌지 대비 경고와 같은 이유로, 색만으로 크기를 읽게
    하지 않는다.
    """
    rows = [(l, v) for l, v in rows if v is not None]
    if not rows:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    label_w, value_w, pad = 190, 78, 8
    plot_w = width - label_w - value_w - pad * 2
    height = row_h * len(rows) + 22
    vmax = max(abs(v) for _, v in rows) or 1.0
    # 부호가 한쪽뿐이면 0 을 끝으로 밀어 폭을 다 쓴다. 섞여 있을 때만 가운데.
    has_pos = any(v > 0 for _, v in rows)
    has_neg = any(v < 0 for _, v in rows)
    if has_pos and has_neg:
        zero = label_w + pad + plot_w / 2
        scale = (plot_w / 2) / vmax
    elif has_neg:
        zero = label_w + pad + plot_w
        scale = plot_w / vmax
    else:
        zero = label_w + pad
        scale = plot_w / vmax

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']
    # 0 기준선
    out.append(f'<line x1="{zero:.1f}" y1="4" x2="{zero:.1f}" y2="{height - 18:.1f}" '
               f'stroke="{AXIS}" stroke-width="1"/>')

    for i, (label, v) in enumerate(rows):
        y = 4 + i * row_h
        bar_h = row_h - 10
        w = abs(v) * scale
        x = zero if v >= 0 else zero - w
        color = UP if v > 0 else (DOWN if v < 0 else GRID)
        # 4px 라운드는 데이터 끝쪽만 — 기준선에 붙는 쪽은 각지게 둔다.
        r = '4' if w >= 4 else '0'
        out.append(
            f'<g class="mark" tabindex="0" data-label="{esc(label)}" '
            f'data-value="{v:+.{digits}f}{unit}">'
            # 막대보다 넓은 히트 존 — 행 어디에 커서를 두어도 값이 뜬다.
            f'<rect class="row-hit" x="0" y="{y - 5:.1f}" width="{width}" '
            f'height="{row_h}" fill="transparent"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{max(w, 1):.1f}" height="{bar_h}" '
            f'rx="{r}" fill="{color}"/>'
            f'<text class="bar-label" x="{label_w:.0f}" y="{y + bar_h * 0.5 + 4:.1f}" '
            f'text-anchor="end">{esc(label)}</text>'
            f'<text class="bar-value {cls(v)}" x="{width - value_w + 4:.0f}" '
            f'y="{y + bar_h * 0.5 + 4:.1f}">{v:+.{digits}f}{unit}</text>'
            f'</g>'
        )

    anchor = 'middle' if (has_pos and has_neg) else ('end' if has_neg else 'start')
    reach = '좌우' if (has_pos and has_neg) else '최대'
    out.append(f'<text class="axis-note" x="{zero:.1f}" y="{height - 4:.1f}" '
               f'text-anchor="{anchor}">0{unit} 기준 · {reach} {vmax:.2f}{unit}</text>')
    out.append('</svg>')
    return ''.join(out)


def dual_line(series, width=760, height=260):
    """두 계열 리베이스 선. series = [(이름, 색, [(날짜, 값), ...]), ...]

    두 값 모두 «기간 첫날 = 100» 으로 맞춰 하나의 축에 올린다.
    축이 둘인 차트는 만들지 않는다.
    """
    series = [s for s in series if len(s[2]) >= 2]
    if not series:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    ml, mr, mt, mb = 46, 14, 14, 34
    pw, ph = width - ml - mr, height - mt - mb
    n = max(len(s[2]) for s in series)

    rebased = []
    for name, color, pts in series:
        base = pts[0][1]
        rebased.append((name, color, [(d, v / base * 100) for d, v in pts]))

    vals = [v for _, _, pts in rebased for _, v in pts]
    lo, hi = min(vals), max(vals)
    span = (hi - lo) or 1.0
    lo, hi = lo - span * 0.08, hi + span * 0.08

    def X(i):
        return ml + (pw * i / (n - 1) if n > 1 else 0)

    def Y(v):
        return mt + ph - (v - lo) / (hi - lo) * ph

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']

    # 그리드 + 축 라벨
    for k in range(5):
        v = lo + (hi - lo) * k / 4
        y = Y(v)
        out.append(f'<line x1="{ml}" y1="{y:.1f}" x2="{ml + pw}" y2="{y:.1f}" '
                   f'stroke="{GRID}" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>')
        out.append(f'<text class="axis-note" x="{ml - 8}" y="{y + 4:.1f}" '
                   f'text-anchor="end">{v:.0f}</text>')

    # 100 기준선 — 이 주의 출발점
    if lo <= 100 <= hi:
        out.append(f'<line x1="{ml}" y1="{Y(100):.1f}" x2="{ml + pw}" y2="{Y(100):.1f}" '
                   f'stroke="{AXIS}" stroke-width="1"/>')

    for name, color, pts in rebased:
        d = ' '.join(f'{"M" if i == 0 else "L"}{X(i):.1f} {Y(v):.1f}'
                     for i, (_, v) in enumerate(pts))
        out.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2" '
                   f'stroke-linejoin="round" stroke-linecap="round"/>')
        # 끝점만 표식 + 직접 라벨. 모든 점에 숫자를 달지 않는다.
        lx, lv = X(len(pts) - 1), pts[-1][1]
        out.append(f'<circle cx="{lx:.1f}" cy="{Y(lv):.1f}" r="4.5" fill="{color}" '
                   f'stroke="#fff" stroke-width="2"/>')

    # 날짜 축 — 양 끝과 가운데만
    for i in (0, (n - 1) // 2, n - 1):
        d = rebased[0][2][min(i, len(rebased[0][2]) - 1)][0]
        anchor = 'start' if i == 0 else ('end' if i == n - 1 else 'middle')
        out.append(f'<text class="axis-note" x="{X(i):.1f}" y="{height - 12}" '
                   f'text-anchor="{anchor}">{esc(d[5:])}</text>')

    # hover 크로스헤어용 히트 존
    for i in range(n):
        tip = ' · '.join(
            f'{name} {pts[i][1]:.1f}' for name, _, pts in rebased if i < len(pts))
        d = rebased[0][2][min(i, len(rebased[0][2]) - 1)][0]
        out.append(
            f'<rect class="hit" x="{X(i) - pw / (2 * max(n - 1, 1)):.1f}" y="{mt}" '
            f'width="{pw / max(n - 1, 1):.1f}" height="{ph}" fill="transparent" '
            f'data-label="{esc(d)}" data-value="{esc(tip)} (기준 100)"/>')

    out.append('</svg>')

    legend = ' '.join(
        f'<span class="key"><i style="background:{c}"></i>{esc(nm)}</span>'
        for nm, c, _ in rebased)
    return f'<div class="legend">{legend}</div>' + ''.join(out)


# ---------------------------------------------------------------- 표

def table(headers, rows, aligns=None, highlight=None):
    aligns = aligns or ['left'] * len(headers)
    out = ['<div class="table-wrap"><table><thead><tr>']
    for h, a in zip(headers, aligns):
        style = ' style="text-align:right"' if a == 'right' else ''
        out.append(f'<th{style}>{esc(h)}</th>')
    out.append('</tr></thead><tbody>')
    for r in rows:
        tr_cls = ' class="hl"' if highlight and r[0] in highlight else ''
        out.append(f'<tr{tr_cls}>')
        for cell, a in zip(r, aligns):
            style = ' class="n"' if a == 'right' else ''
            out.append(f'<td{style}>{cell}</td>')
        out.append('</tr>')
    out.append('</tbody></table></div>')
    return ''.join(out)


def cell(v, digits=2, kind='pct'):
    """등락 셀 — 색은 up/down 클래스로만 준다."""
    if v is None:
        return '<span class="flat">—</span>'
    text = bp(v) if kind == 'bp' else pct(v, digits)
    return f'<span class="{cls(v)}">{text}</span>'


# ---------------------------------------------------------------- 본문

def w1(d):
    return (d.get('perf') or {}).get('w1')


def section(num_, title, body, note=None):
    n = f'<span class="sec-num">{num_}</span>' if num_ else ''
    tail = f'<p class="note">{note}</p>' if note else ''
    sid = f'sec-{num_}' if num_ else None
    idattr = f' id="{sid}"' if sid else ''
    return (f'<section class="section"{idattr}><div class="section-rule"></div>'
            f'<h2 class="section-title">{n}{esc(title)}</h2>{body}{tail}</section>')


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

STYLE = """<meta charset="utf-8">
<title>주간 마켓 다이제스트 | 미래에셋증권 마포WM</title>
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
  --primary:#F58220; --primary-active:#CB6015; --primary-soft:#FAB072;
  --secondary:#043B72;
  --canvas:#FFFFFF; --surface-soft:#ECEFF4; --surface-subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1; --highlight:#D7D7D7;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted-soft:#84888B;
  --up:#C62828; --down:#043B72; --on-primary:#FFFFFF;
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  --font-en:'Inter','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;
}
.wd-root,body{font-family:var(--font-kr)}
body{margin:0;background:var(--canvas);color:var(--body);font-size:19px;line-height:1.65;
  font-variant-numeric:tabular-nums;-webkit-text-size-adjust:100%}
h1,h2,h3{color:var(--ink);margin:0}
a{color:var(--secondary)}
code{font-family:var(--font-en);font-size:.88em;background:var(--surface-subtle);
  padding:1px 5px;border-radius:2px}

.hero{background:var(--primary);color:var(--on-primary);padding:38px 32px 34px;margin-bottom:56px}
.hero-tag{font-family:var(--font-en);font-size:14px;letter-spacing:.6px;opacity:.9;margin-bottom:10px}
.hero h1{color:var(--on-primary);font-size:34px;font-weight:700;letter-spacing:-.3px;line-height:1.25}
.hero-sub{margin:10px 0 0;font-size:19px;opacity:.97}
.hero-note{margin:14px 0 0;font-size:15px;opacity:.92;max-width:70ch}
.hero code{background:rgba(255,255,255,.18);color:#fff}
@media (max-width:768px){.hero{padding:28px 20px}.hero h1{font-size:26px}}

.section{max-width:1200px;margin:0 auto 56px;padding:0 32px}
@media (max-width:768px){.section{padding:0 20px;margin-bottom:36px}}
.section-rule{height:1px;background:var(--primary);margin-bottom:19px}
.section-title{font-size:26px;font-weight:600;margin-bottom:19px}
@media (max-width:768px){.section-title{font-size:22px}}
.sec-num{font-family:var(--font-en);color:var(--primary);margin-right:12px;font-weight:700}
h3.sub{font-size:22px;font-weight:600;margin:28px 0 14px}
.note{font-size:15px;color:var(--muted);margin:14px 0 0;line-height:1.55}
.callout{background:var(--surface-soft);border-left:3px solid var(--primary);
  padding:14px 19px;margin:19px 0 0;font-size:17px;border-radius:0 2px 2px 0}
.dim{color:var(--muted-soft);font-size:.85em;font-family:var(--font-en)}
.chart-empty{color:var(--muted);font-size:17px}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:19px}
@media (max-width:900px){.stats{grid-template-columns:repeat(2,1fr);gap:14px}}
@media (max-width:420px){.stats{grid-template-columns:1fr}}
/* 큰 수치가 트랙을 밀어내지 못하게 한다 — min-width:auto 면 그리드가 안 줄어든다. */
.stat{border:1px solid var(--hairline);border-radius:4px;padding:19px;min-width:0}
.stat-label{font-size:16px;font-weight:500;letter-spacing:.6px;color:var(--muted)}
.stat-value{font-family:var(--font-en);font-size:38px;font-weight:700;line-height:1.1;
  color:var(--ink);margin-top:6px}
@media (max-width:900px){.stat{padding:14px}.stat-value{font-size:30px}}
.stat-chg{font-size:16px;margin-top:6px;font-weight:500}

.chart{width:100%;height:auto;display:block;margin:8px 0 4px;overflow:visible}
.chart text{font-family:var(--font-kr);font-variant-numeric:tabular-nums}
.bar-label{font-size:15px;fill:var(--body)}
.bar-value{font-size:15px;font-weight:500;font-family:var(--font-en)}
.axis-note{font-size:13px;fill:var(--muted-soft);font-family:var(--font-en)}
.chart .mark{cursor:default}
.chart .mark:hover .row-hit{fill:var(--surface-subtle)}
.chart .mark:focus-visible .row-hit{fill:var(--surface-subtle);stroke:var(--ink);stroke-width:1}
.chart .hit{cursor:crosshair}
.legend{display:flex;gap:19px;flex-wrap:wrap;margin-bottom:6px;font-size:16px}
.legend .key{display:inline-flex;align-items:center;gap:7px;color:var(--body)}
.legend i{width:14px;height:3px;border-radius:2px;display:inline-block}

.table-wrap{overflow-x:auto;margin-top:19px}
table{border-collapse:collapse;width:100%;border:1px solid var(--hairline);font-size:17px}
th,td{padding:10px 13px;text-align:left;border-bottom:1px solid var(--hairline-soft)}
thead th{background:var(--primary-soft);color:#1A1A1A;font-weight:700;font-size:16px;white-space:nowrap}
tbody tr:hover{background:var(--surface-subtle)}
tbody tr.hl{background:var(--highlight)}
td.n,th[style]{text-align:right;font-family:var(--font-en);white-space:nowrap}
.up{color:var(--up)} .down{color:var(--down)} .flat{color:var(--muted-soft)}
.chart .up{fill:var(--up)} .chart .down{fill:var(--down)} .chart .flat{fill:var(--muted-soft)}

.checks{margin:0;padding-left:24px;font-size:17px}
.checks li{margin-bottom:8px}

#wd-tip{position:fixed;z-index:50;background:#1A1A1A;color:#fff;font-size:13px;
  padding:7px 10px;border-radius:2px;pointer-events:none;opacity:0;transition:opacity .1s;
  font-family:var(--font-kr);white-space:nowrap;max-width:80vw}
#wd-tip strong{display:block;font-weight:600;margin-bottom:2px}

@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --canvas:#15171B;--surface-soft:#212630;--surface-subtle:#1B1F26;
    --hairline:#3A414C;--hairline-soft:#2A303A;--highlight:#272C34;
    --ink:#F1F3F6;--body:#CDD3DB;--muted:#98A0AB;--muted-soft:#7F8794;
    --primary:#FF9A4A;--primary-soft:#4A331E;--secondary:#82B7EA;
    --up:#FF7A7A;--down:#82B7EA;--on-primary:#241206;
  }
  :root:not([data-theme="light"]) .hero{background:#8A4410;--on-primary:#FFF1E4}
  :root:not([data-theme="light"]) .hero h1{color:#FFF1E4}
  :root:not([data-theme="light"]) thead th{color:#F1F3F6;background:#3A2A1C}
}

@media print{
  body{font-size:13pt;line-height:1.4}
  .section{max-width:100%;padding:0;margin-bottom:24px}
  .hero{padding:16px 0;margin-bottom:24px}
  table,.chart,.stats{page-break-inside:avoid}
  h2,h3{page-break-after:avoid}
  #wd-tip{display:none}
}
</style>
"""

SCRIPT = """
<script>
(function () {
  var tip = document.createElement('div');
  tip.id = 'wd-tip';
  document.body.appendChild(tip);

  function show(el, e) {
    var label = el.getAttribute('data-label');
    var value = el.getAttribute('data-value');
    if (!label && !value) return;
    tip.innerHTML = '<strong>' + label + '</strong>' + value;
    tip.style.opacity = '1';
    move(e);
  }
  function move(e) {
    var x = (e.clientX || 0) + 14, y = (e.clientY || 0) + 14;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8;
    if (y + h > window.innerHeight - 8) y = (e.clientY || 0) - h - 12;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { tip.style.opacity = '0'; }

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('.mark, .hit');
    if (el) show(el, e);
  });
  document.addEventListener('mousemove', function (e) {
    if (tip.style.opacity === '1') move(e);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('.mark, .hit')) hide();
  });
  /* 키보드로도 값을 읽을 수 있게 한다 — 막대는 tabindex 를 갖는다. */
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest('.mark');
    if (!el) return;
    var r = el.getBoundingClientRect();
    show(el, { clientX: r.right, clientY: r.top });
  });
  document.addEventListener('focusout', hide);
})();
</script>
"""


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
