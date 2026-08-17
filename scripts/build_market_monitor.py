#!/usr/bin/env python3
"""마켓 모니터 — 시장 지표 추이 대시보드를 만든다.

브리핑은 «어제 무슨 일이 있었나» 를 답한다. 이 화면은 «요즘 흐름이 어떤가» 를
답한다. 수집기가 하루 3~4번 188개 소스를 받아 두는데 그 값이 그날 브리핑
한 장에만 쓰이고 버려지던 것을, 추이로 세워 놓는 것이 목적이다.

두 곳에서 읽는다.

  data/market/latest.json   그날 스냅숏. 안에 이미 여러 날짜가 들어 있다 —
                            index_daily(20거래일), investors_kospi(29일),
                            money_flow.series(20일), 그리고 모든 종목·지수·
                            업종의 perf(w1/m1/m3/m6/y1/ytd)
  data/market/history.json  날짜별 누적본. 스냅숏에 시계열이 없는 항목
                            (등락 종목 수·업종 등락률·금리 커브·거래대금)은
                            여기서 온다. 하루 한 행씩 늘어난다

산출물은 `market-monitor.html` 한 파일이다. 저장소의 다른 화면(standalone.html,
els-product-search.html)과 같이 데이터를 안에 박아 넣어 더블클릭만으로 열린다 —
서버도 CORS 도 필요 없다.

    python3 scripts/build_market_monitor.py
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKET = ROOT / 'data' / 'market' / 'latest.json'
HISTORY = ROOT / 'data' / 'market' / 'history.json'
OUT = ROOT / 'market-monitor.html'

import masviz as mv
from masviz import (BLUE, CYAN, ORANGE, SOFT, cell, cls, eok, esc, hbars,
                    num, pct, section, table)


def md(d: str) -> str:
    """2026-08-14 → 08-14. 축 라벨을 짧게."""
    return d[5:] if d and len(d) >= 10 else (d or '')


def get(dct, *path, default=None):
    """중첩 dict 를 안전하게 파고든다. 누적본의 옛 행에는 없는 키가 있다."""
    cur = dct
    for k in path:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur if cur is not None else default


# ---------------------------------------------------------------- 패널
def stat_tile(label, value, sub, sub_v=None, unit=''):
    chg = f'<div class="stat-chg {cls(sub_v)}">{sub}</div>' if sub else ''
    return (f'<div class="stat"><div class="stat-label">{esc(label)}</div>'
            f'<div class="stat-value">{value}<span class="stat-unit">{esc(unit)}</span></div>'
            f'{chg}</div>')


def build(m: dict, hist: dict) -> str:
    rows = hist.get('rows') or []
    idx = m.get('indices') or {}
    kospi, kosdaq = idx.get('kospi') or {}, idx.get('kosdaq') or {}
    kd = m.get('index_daily') or {}
    mf = m.get('money_flow') or {}
    mf_ser = mf.get('series') or []
    inv = m.get('investors_kospi') or []          # 최신이 맨 앞
    ru = m.get('rates_us') or {}
    parts = []

    def w1(d):
        return get(d, 'perf', 'w1')

    # ---- 헤더 --------------------------------------------------------
    turnover = get(kd, 'kospi', 'series', default=[])
    to_today = next((s.get('value_mn_krw') for s in turnover
                     if s.get('date') == kospi.get('date')), None)
    parts.append(
        f'<header class="hero"><div class="hero-inner">'
        f'<div><div class="hero-tag" data-en="INTERNAL USE · MARKET MONITOR">'
        f'[사내한] · 마켓 모니터</div>'
        f'<h1 data-en="Market Monitor">마켓 모니터</h1>'
        f'<p class="hero-sub" data-en="Not what happened yesterday — where things '
        f'have been heading.">어제 무슨 일이 있었나가 아니라, 요즘 흐름이 어떤가.</p>'
        f'<p class="hero-note">수집 {esc(m.get("generated_at_kst", "—"))} KST · '
        f'국내 종가 {esc(kospi.get("date", "—"))} · 누적 {len(rows)}거래일 · '
        f'소스 {get(m, "summary", "sources_ok", default="?")}/'
        f'{get(m, "summary", "sources_tried", default="?")}</p></div>'
        f'{mv.LANG_TOGGLE_HTML}</div></header>')

    # ---- 1. 시장 온도 -------------------------------------------------
    tiles = [
        stat_tile('코스피', num(kospi.get('close')),
                  f'주간 {pct(w1(kospi))}', w1(kospi)),
        stat_tile('코스닥', num(kosdaq.get('close')),
                  f'주간 {pct(w1(kosdaq))}', w1(kosdaq)),
        stat_tile('원/달러', num(get(m, 'usdkrw_naver', 'rate'), 1),
                  '매매기준율'),
        stat_tile('VIX', num(get(idx, 'vix', 'close'), 2),
                  f'주간 {pct(w1(idx.get("vix") or {}))}', w1(idx.get('vix') or {})),
        stat_tile('미 국채 10년', num(get(ru, 'curve', 'ust10y'), 2),
                  f'주간 {mv.bp(get(ru, "perf", "ust10y", "w1"))}',
                  get(ru, 'perf', 'ust10y', 'w1'), unit='%'),
        stat_tile('10년−2년', f'{get(ru, "spread_10y_2y_bp", default="—")}',
                  '역전' if ru.get('inverted') else '우상향',
                  -1 if ru.get('inverted') else None, unit='bp'),
    ]
    if mf_ser:
        latest_mf = mf_ser[0]
        d5 = mf_ser[5] if len(mf_ser) > 5 else None
        tiles.append(stat_tile(
            '고객예탁금', f'{latest_mf["deposit"] / 10000:,.1f}',
            f'5거래일 {eok(latest_mf["deposit"] - d5["deposit"])}' if d5 else '',
            (latest_mf['deposit'] - d5['deposit']) if d5 else None, unit='조원'))
        tiles.append(stat_tile(
            '신용잔고', f'{latest_mf["credit_balance"] / 10000:,.1f}',
            f'5거래일 {eok(latest_mf["credit_balance"] - d5["credit_balance"])}'
            if d5 else '',
            (latest_mf['credit_balance'] - d5['credit_balance']) if d5 else None,
            unit='조원'))
    if to_today:
        tiles.append(stat_tile('코스피 거래대금', f'{to_today / 1_000_000:,.1f}',
                               '당일', unit='조원'))

    parts.append(section(
        1, '시장 온도', '<div class="stats">' + ''.join(tiles) + '</div>',
        '주간 변화는 수집기가 계산한 <code>perf.w1</code> 입니다. 원/달러는 '
        '네이버 매매기준율이고, 야후 <code>KRW=X</code>(런던 기준 24시간)는 '
        '서울 종가가 아니므로 쓰지 않았습니다.'))

    # ---- 2. 국내 지수 추이 --------------------------------------------
    ks = list(reversed([(md(r['date']), r['close'])
                        for r in get(kd, 'kospi', 'series', default=[])]))
    kq = list(reversed([(md(r['date']), r['close'])
                        for r in get(kd, 'kosdaq', 'series', default=[])]))
    body = mv.lines([('코스피', ORANGE, ks), ('코스닥', BLUE, kq)],
                    rebase=True, digits=1)
    # 거래대금은 수준이 지수와 달라 같은 축에 올리지 않는다 — 따로 세운다.
    to_ser = list(reversed([(md(r['date']), r.get('value_mn_krw', 0) / 1_000_000)
                            for r in get(kd, 'kospi', 'series', default=[])
                            if r.get('value_mn_krw')]))
    if to_ser:
        body += ('<h3 class="sub">코스피 거래대금 (조원)</h3>'
                 + mv.lines([('거래대금', ORANGE, to_ser)], digits=1,
                            fmt=lambda v: f'{v:,.1f}조'))
    parts.append(section(
        2, f'국내 지수 — 최근 {len(ks)}거래일', body,
        '지수 선은 기간 첫날을 100 으로 맞춘 값입니다(축 하나). 거래대금은 '
        '수준이 달라 같은 축에 올리지 않고 따로 세웠습니다 — 이중축은 쓰지 '
        '않습니다.'))

    # ---- 3. 등락 종목 수 ----------------------------------------------
    br = [(r['date'], get(r, 'breadth', 'kospi', default={})) for r in rows]
    br = [(d, b) for d, b in br if b]
    if br:
        body = mv.diverging_bars(
            [md(d) for d, _ in br],
            [b.get('advancing') for _, b in br],
            [b.get('declining') for _, b in br],
            '상승', '하락', unit='개')
        body += table(
            ['날짜', '상승', '하락', '보합', '상한', '하한', '상승−하락'],
            [[d, num(b.get('advancing'), 0), num(b.get('declining'), 0),
              num(b.get('unchanged'), 0), num(b.get('limit_up'), 0),
              num(b.get('limit_down'), 0),
              cell((b.get('advancing') or 0) - (b.get('declining') or 0), 0, 'num')]
             for d, b in reversed(br)],
            ['left'] + ['right'] * 6, compact=True)
        parts.append(section(
            3, '등락 종목 수 (코스피)', body,
            '지수가 올라도 오른 종목이 적으면 상승의 폭이 좁다는 뜻입니다. '
            '누적본이 쌓이는 만큼만 보입니다.'))

    # ---- 4. 투자자별 수급 ---------------------------------------------
    if inv:
        # investors_kospi 의 date 는 26.08.14 꼴이다.
        seq = list(reversed(inv))
        body = mv.lines(
            [('외국인', ORANGE, [(r['date'][3:], r.get('foreign')) for r in seq]),
             ('기관', BLUE, [(r['date'][3:], r.get('institution')) for r in seq]),
             ('개인', SOFT, [(r['date'][3:], r.get('retail')) for r in seq])],
            digits=0, zero_line=0, fmt=lambda v: f'{v:,.0f}')
        cum = []
        for n in (5, 20):
            take = inv[:n]
            if len(take) < n:
                continue
            cum.append([f'{n}거래일 누적',
                        cell(sum(r.get('foreign') or 0 for r in take), 0, 'num'),
                        cell(sum(r.get('institution') or 0 for r in take), 0, 'num'),
                        cell(sum(r.get('retail') or 0 for r in take), 0, 'num')])
        body += table(['구간', '외국인', '기관', '개인'], cum,
                      ['left', 'right', 'right', 'right'])
        parts.append(section(
            4, f'투자자별 순매수 — 최근 {len(inv)}거래일', body,
            '코스피 기준, 단위 억원. 0 선 위가 순매수입니다. 세 주체의 합은 '
            '대체로 0 근처가 됩니다(기타 제외).'))

    # ---- 5. 예탁금 · 신용잔고 -----------------------------------------
    if len(mf_ser) >= 3:
        seq = list(reversed(mf_ser))
        # 두 값의 수준이 3배 이상 달라 한 축에 겹치면 한쪽이 눌린다.
        # 이중축 대신 작은 차트 둘로 나눈다(small multiples).
        body = ('<div class="panel-grid">'
                '<div class="panel"><h3 class="sub">고객예탁금 (조원)</h3>'
                + mv.lines([('예탁금', ORANGE,
                             [(md(r['date']), r['deposit'] / 10000) for r in seq])],
                           width=560, height=220, digits=1,
                           fmt=lambda v: f'{v:,.1f}조')
                + '</div><div class="panel"><h3 class="sub">신용잔고 (조원)</h3>'
                + mv.lines([('신용잔고', BLUE,
                             [(md(r['date']), r['credit_balance'] / 10000)
                              for r in seq])],
                           width=560, height=220, digits=1,
                           fmt=lambda v: f'{v:,.1f}조')
                + '</div></div>')
        body += table(
            ['날짜', '고객예탁금', '전일대비', '신용잔고', '전일대비', '주식형 펀드'],
            [[r['date'], num(r['deposit'], 0),
              cell(r.get('deposit_delta'), 0, 'num'),
              num(r['credit_balance'], 0),
              cell(r.get('credit_balance_delta'), 0, 'num'),
              num(r.get('fund_equity'), 0)] for r in mf_ser[:10]],
            ['left'] + ['right'] * 5, compact=True)
        parts.append(section(
            5, '고객예탁금 · 신용잔고', body,
            esc(mf.get('note', '')) + ' ' + esc(mf.get('delta_note', ''))))

    # ---- 6. 업종 강약 히트맵 -------------------------------------------
    sec_rows = [(r['date'], r.get('sectors') or {}) for r in rows]
    sec_rows = [(d, s) for d, s in sec_rows if s]
    if sec_rows:
        # 마지막 날 기준 상위·하위 8개씩만 세운다. 79개를 다 세우면 읽히지 않는다.
        last = sec_rows[-1][1]
        ranked = sorted(last.items(), key=lambda kv: kv[1] or 0, reverse=True)
        picks = [n for n, _ in ranked[:8]] + [n for n, _ in ranked[-8:]]
        cols = [md(d) for d, _ in sec_rows]
        matrix = [[s.get(name) for _, s in sec_rows] for name in picks]
        body = mv.heatmap(cols, picks, matrix)
        body += table(
            ['업종', '최근 등락', '누적 합'],
            [[n, cell(last.get(n)),
              cell(sum(s.get(n) or 0 for _, s in sec_rows))] for n in picks],
            ['left', 'right', 'right'], compact=True)
        parts.append(section(
            6, '업종 강약', body,
            f'{sec_rows[-1][0]} 기준 상위·하위 8개 업종의 일별 등락률입니다. '
            f'수집 업종은 {len(last)}개이고 화면에는 16개만 세웠습니다. '
            f'«누적 합» 은 단순 일별 합이므로 복리 수익률이 아닙니다.'))

    # ---- 7. 미 국채 커브 ----------------------------------------------
    curve, perf = ru.get('curve') or {}, ru.get('perf') or {}
    TENOR = [('ust3m', '3M'), ('ust6m', '6M'), ('ust1y', '1Y'), ('ust2y', '2Y'),
             ('ust3y', '3Y'), ('ust5y', '5Y'), ('ust7y', '7Y'),
             ('ust10y', '10Y'), ('ust20y', '20Y'), ('ust30y', '30Y')]
    if curve:
        # 1주 전·1개월 전 곡선은 현재 수준에서 perf(bp)를 되돌려 만든다.
        def back(key, span):
            lvl, chg = curve.get(key), get(perf, key, span)
            return None if lvl is None or chg is None else lvl - chg / 100.0

        body = mv.lines(
            [('현재', ORANGE, [(lbl, curve.get(k)) for k, lbl in TENOR]),
             ('1주 전', BLUE, [(lbl, back(k, 'w1')) for k, lbl in TENOR]),
             ('1개월 전', SOFT, [(lbl, back(k, 'm1')) for k, lbl in TENOR])],
            digits=2, fmt=lambda v: f'{v:.2f}%')
        body += ('<h3 class="sub">주간 변화 (bp)</h3>'
                 + hbars([(lbl, get(perf, k, 'w1')) for k, lbl in TENOR],
                         unit='bp', digits=0, label_w=90))
        body += table(
            ['만기', '현재', '1주 전', '주간', '1개월', 'YTD'],
            [[lbl, f'{curve[k]:.2f}%',
              f'{back(k, "w1"):.2f}%' if back(k, 'w1') is not None else '—',
              cell(get(perf, k, 'w1'), kind='bp'),
              cell(get(perf, k, 'm1'), kind='bp'),
              cell(get(perf, k, 'ytd'), kind='bp')]
             for k, lbl in TENOR if k in curve],
            ['left'] + ['right'] * 5)
        be = get(m, 'breakeven', 'curve', default={})
        if be:
            body += (f'<p class="callout">기대인플레이션(브레이크이븐) '
                     + ' · '.join(f'{k.replace("ust", "").upper()} {v:.2f}%'
                                  for k, v in be.items())
                     + f' · 기준일 {esc(get(m, "breakeven", "curve") and get(m, "rates_us_real", "date") or "—")}</p>')
        parts.append(section(
            7, '미 국채 수익률 곡선', body,
            '재무부 일별 곡선입니다. 1주 전·1개월 전 곡선은 현재 수준에서 '
            '<code>perf</code>(bp)를 되돌려 만든 값이라 실제 그날 공시치와 '
            '소수점 아래에서 다를 수 있습니다. 금리는 «수익률» 이 아니라 '
            '«변화(bp)» 로 읽습니다.'))

    # ---- 8. 국내 금리 추이 ---------------------------------------------
    kr_rows = [(r['date'], r.get('rates_kr') or {}) for r in rows]
    kr_rows = [(d, v) for d, v in kr_rows if v]
    if len(kr_rows) >= 2:
        body = mv.lines(
            [('국고 3년', ORANGE, [(md(d), v.get('ktb3y')) for d, v in kr_rows]),
             ('국고 10년', BLUE, [(md(d), v.get('ktb10y')) for d, v in kr_rows]),
             ('회사채 3년', SOFT, [(md(d), v.get('corp3y')) for d, v in kr_rows]),
             ('CD 91일', CYAN, [(md(d), v.get('cd91')) for d, v in kr_rows])],
            digits=2, fmt=lambda v: f'{v:.2f}%')
        rk = m.get('rates_kr') or {}
        body += table(
            ['항목', '현재', '누적 첫날', '변화'],
            [[nm, f'{rk[k]:.3f}%' if rk.get(k) is not None else '—',
              f'{kr_rows[0][1][k]:.3f}%' if kr_rows[0][1].get(k) is not None else '—',
              cell((rk[k] - kr_rows[0][1][k]) * 100, kind='bp')
              if rk.get(k) is not None and kr_rows[0][1].get(k) is not None else '—']
             for nm, k in [('국고 1년', 'ktb1y'), ('국고 3년', 'ktb3y'),
                           ('국고 5년', 'ktb5y'), ('국고 10년', 'ktb10y'),
                           ('회사채 3년(AA-)', 'corp3y'), ('CD 91일', 'cd91'),
                           ('콜금리', 'call'), ('코픽스(신규)', 'cofix_new')]],
            ['left', 'right', 'right', 'right'])
        parts.append(section(
            8, f'국내 금리 — 누적 {len(kr_rows)}거래일', body,
            '네이버 시장지표 기준입니다. 공시 시점이 하루 늦을 수 있고, '
            '«누적 첫날» 은 이 파일이 쌓기 시작한 날일 뿐 연초가 아닙니다.'))

    # ---- 9. 환율 · 원자재 ----------------------------------------------
    fx = m.get('fx') or {}
    fx_rows = [[f'{r["name_ko"]} <span class="dim">{esc(r["symbol"])}</span>',
                num(r['close'], 2), cell(r.get('change_pct')),
                cell(get(r, 'perf', 'w1')), cell(get(r, 'perf', 'm1')),
                cell(get(r, 'perf', 'ytd'))] for r in fx.get('rows', [])]
    COMMOD = [('WTI', 'wti'), ('브렌트', 'brent'), ('금', 'gold'),
              ('은', 'silver'), ('구리', 'copper'), ('천연가스', 'natgas'),
              ('백금', 'platinum')]
    com_rows = [[nm, num(get(idx, k, 'close')), cell(get(idx, k, 'change_pct')),
                 cell(get(idx, k, 'perf', 'w1')), cell(get(idx, k, 'perf', 'm1')),
                 cell(get(idx, k, 'perf', 'ytd'))]
                for nm, k in COMMOD if get(idx, k, 'close') is not None]
    hdr = ['항목', '값', '일간', '1주', '1개월', 'YTD']
    al = ['left'] + ['right'] * 5
    body = ('<h3 class="sub">환율</h3>' + table(hdr, fx_rows, al)
            + '<h3 class="sub">원자재</h3>' + table(hdr, com_rows, al))
    parts.append(section(9, '환율 · 원자재', body, esc(fx.get('note', ''))))

    # ---- 10. 데이터 상태 ------------------------------------------------
    srcs = m.get('sources') or {}
    bad = [(k, get(v, 'error', default='')) for k, v in srcs.items()
           if not (isinstance(v, dict) and v.get('ok') is True)]
    body = table(
        ['항목', '값'],
        [['수집 시각', esc(m.get('generated_at_kst', '—')) + ' KST'],
         ['국내 지수 종가일', esc(kospi.get('date', '—'))],
         ['미 국채 곡선 기준일', esc(ru.get('date', '—'))],
         ['예탁금·신용잔고 기준일', esc(get(mf, 'latest', 'date', default='—'))],
         ['누적본 기간',
          f'{rows[0]["date"]} ~ {rows[-1]["date"]} ({len(rows)}거래일)'
          if rows else '없음'],
         ['소스 성공',
          f'{get(m, "summary", "sources_ok", default="?")} / '
          f'{get(m, "summary", "sources_tried", default="?")}']],
        ['left', 'right'])
    if bad:
        body += '<h3 class="sub">받지 못한 소스</h3>'
        body += table(['소스', '사유'],
                      [[f'<code>{esc(k)}</code>', esc(e)[:160]] for k, e in bad],
                      ['left', 'left'], compact=True)
    parts.append(section(
        10, '데이터 상태', body,
        '실패한 소스가 있어도 화면은 그 항목만 비우고 나머지를 그대로 그립니다. '
        '누적본은 하루 한 행씩 늘어나며 120거래일까지 남습니다 — 기간이 짧은 '
        '패널은 아직 쌓이는 중이라는 뜻입니다.'))

    parts.append(
        '<footer class="section"><p class="note">'
        '사내 참고 자료입니다. 투자 권유가 아니며, 모든 수치는 세전·수수료 전 '
        '기준입니다. 원본은 <code>data/market/latest.json</code> · '
        '<code>data/market/history.json</code> 이고, 이 파일은 '
        '<code>scripts/build_market_monitor.py</code> 가 만듭니다.'
        '</p></footer>')

    return PAGE.replace('__BODY__', ''.join(parts)).replace(
        '__BUILT__', date.today().isoformat())


PAGE_CSS = """
.hero{background:var(--primary);color:var(--on-primary);padding:38px 0 34px;margin-bottom:56px}
.hero-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;
  align-items:flex-start;justify-content:space-between;gap:19px}
.hero-tag{font-family:var(--font-en);font-size:14px;letter-spacing:.6px;opacity:.9;margin-bottom:10px}
.hero h1{color:var(--on-primary);font-size:34px;font-weight:700;letter-spacing:-.3px;line-height:1.25}
.hero-sub{margin:10px 0 0;font-size:19px;opacity:.97;max-width:60ch}
.hero-note{margin:14px 0 0;font-size:15px;opacity:.92;font-family:var(--font-en)}
@media (max-width:768px){.hero-inner{padding:0 20px}.hero h1{font-size:26px}}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
@media (max-width:1000px){.stats{grid-template-columns:repeat(3,1fr)}}
@media (max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}}
@media (max-width:420px){.stats{grid-template-columns:1fr}}
/* 큰 수치가 트랙을 밀어내지 못하게 한다 — min-width:auto 면 그리드가 안 줄어든다. */
.stat{border:1px solid var(--hairline);border-radius:4px;padding:16px;min-width:0}
.stat-label{font-size:16px;font-weight:500;letter-spacing:.4px;color:var(--muted)}
.stat-value{font-family:var(--font-en);font-size:30px;font-weight:700;line-height:1.1;
  color:var(--ink);margin-top:4px}
.stat-unit{font-size:15px;font-weight:500;color:var(--muted);margin-left:3px}
.stat-chg{font-size:15px;margin-top:4px;font-weight:500}

.panel-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}
@media (max-width:900px){.panel-grid{grid-template-columns:1fr}}
.panel{min-width:0}
.panel h3.sub{margin-top:0}

footer .note{border-top:1px solid var(--hairline);padding-top:19px}
@media print{.hero{padding:16px 0;margin-bottom:24px}}
"""

PAGE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>마켓 모니터 | 미래에셋증권 마포WM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
__TOKENS__
__LANG_CSS__
__PAGE_CSS__
</style>
</head>
<body>
__BODY__
<script>
window.MV_LANG_KEY = 'mas-monitor-lang';
__TOOLTIP_JS__
__LANG_JS__
</script>
<!-- 생성 __BUILT__ · scripts/build_market_monitor.py -->
</body>
</html>
"""


def main() -> None:
    m = json.loads(MARKET.read_text(encoding='utf-8'))
    try:
        hist = json.loads(HISTORY.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        hist = {'rows': []}

    global PAGE
    PAGE = (PAGE
            .replace('__TOKENS__', mv.TOKENS)
            .replace('__LANG_CSS__', mv.LANG_TOGGLE_CSS)
            .replace('__PAGE_CSS__', PAGE_CSS)
            .replace('__TOOLTIP_JS__', mv.TOOLTIP_JS)
            .replace('__LANG_JS__', mv.LANG_JS))

    OUT.write_text(build(m, hist), encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)} 생성 — {OUT.stat().st_size // 1024} KB · '
          f'누적 {len(hist.get("rows", []))}거래일 · '
          f'기준 {m.get("generated_at_kst")} KST')


if __name__ == '__main__':
    main()
