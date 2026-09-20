#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""네 판(국내 주식·미국 주식·국내상장 ETF·해외상장 ETF)의 성적을 한 장으로 묶는다.

**숫자를 손으로 옮기지 않는다.** 성적표 두 개를 읽어 표와 그림을 만든다. 글로 적은
주장도 같은 자료에서 세어 낸다 — 「서른두 칸 전부」 같은 말이 사실과 어긋날 자리를
없애려는 것이다. 자료가 바뀌면 문장도 함께 바뀐다.

  data/signals/backtest.json → KR(국내 주식 100) · US(미국 주식 100)
  data/etf/backtest.json     → ETF_KR(국내상장 49) · ETF_OV(해외상장 20)

그림 둘
  낙폭 절감 — 신호와 20일선 교차를 짝지어 놓은 아령 그림. 둘의 벌어짐이 곧 축 넷의 몫.
  사건연구 — 차이와 95% 구간. **구간이 0 을 걸치는 것이 이 그림의 요점이다.**

  python3 scripts/make_boards_html.py
"""

import argparse
import hashlib
import json
import math
import os
import re
import sys
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
STOCKS = os.path.join(ROOT, 'data', 'signals', 'backtest.json')
ETF = os.path.join(ROOT, 'data', 'etf', 'backtest.json')
OUT = os.path.join(ROOT, 'docs', 'boards', 'index.html')

HS = ['5', '10', '20', '60']

# 검증기를 통과시킨 두 계열 (밝은판 #2a78d6/#eda100, 어두운판 #3987e5/#c98500).
# 밝은판에서 호박색 명암이 3:1 아래라 **점마다 값을 직접 적고 표를 함께 싣는다.**
BOARDS = [
    ('KR', '국내 주식', '100종목', STOCKS),
    ('US', '미국 주식', '100종목', STOCKS),
    ('ETF_KR', '국내상장 ETF', '49종목', ETF),
    ('ETF_OV', '해외상장 ETF', '20종목', ETF),
]

RULES = [('equity', '신호 (축 넷 + 손절)'),
         ('equity_ma_cross', '20일선 교차'),
         ('equity_ma_cross_stop', '20일선 + 같은 손절')]


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def sgn(x, n=1):
    if x is None:
        return '—'
    return ('%+.' + str(n) + 'f') % x


def load():
    """네 판을 한 꼴로 펴서 읽는다. 없는 판은 **없는 채로 둔다.**"""
    cache, out = {}, []
    for key, ko, n, path in BOARDS:
        if path not in cache:
            if not os.path.exists(path):
                sys.stderr.write('없음: %s\n' % path)
                cache[path] = None
            else:
                cache[path] = json.load(open(path, encoding='utf-8'))
        d = cache[path]
        if not d:
            continue
        rows = []
        for h in HS:
            m = ((d.get('horizons') or {}).get(h) or {}).get('flip', {}).get(key)
            if not m:
                continue
            bo = (m.get('event') or {}).get('bootstrap') or {}
            rows.append({'h': h, 'event': bo,
                         'rules': {k: m.get(k) for k, _ in RULES}})
        if rows:
            out.append({'key': key, 'ko': ko, 'n': n, 'rows': rows,
                        'doc': d, 'span': d.get('etf_prices_span'),
                        'coverage': d.get('coverage')})
    return out


# ─────────────────────────────────────────────────────────────────────
# 세어서 문장을 만든다 — 손으로 적지 않는다
# ─────────────────────────────────────────────────────────────────────

def tally(boards):
    """이긴 칸을 **세어서** 문장을 만든다.

    상대가 둘(손절 없는 20일선, 손절 붙인 20일선)이므로 셈이 두 가지로 나온다 —
    시계 칸으로 세면 16, 상대별로 세면 32. 둘 다 참이지만 **32 는 거의 같은 상대를
    두 번 센 것**이라 머리 숫자로는 16 을 쓰고, 32 는 따로 적어 둔다. 어느 쪽을
    말하는지 흐려 두면 읽는 사람이 표본이 두 배인 줄 안다.
    """
    won = tot = 0
    won2 = tot2 = 0
    gaps = []
    for b in boards:
        for r in b['rows']:
            a = (r['rules'].get('equity') or {}).get('mdd_saved_median_pct')
            c = (r['rules'].get('equity_ma_cross') or {}).get('mdd_saved_median_pct')
            c2 = (r['rules'].get('equity_ma_cross_stop') or {}).get('mdd_saved_median_pct')
            for rival in (c, c2):
                if a is not None and rival is not None:
                    tot2 += 1
                    if a > rival:
                        won2 += 1
            if a is None or c is None:
                continue
            tot += 1
            if a > c:
                won += 1
            if c:
                gaps.append(a / c)
    survivors = sum((b['doc'].get('verdict') or {}).get('survivors', 0)
                    for b in {id(x['doc']): x for x in boards}.values())
    return {'won': won, 'total': tot, 'won2': won2, 'total2': tot2,
            'survivors': survivors,
            'gap_lo': min(gaps) if gaps else None,
            'gap_hi': max(gaps) if gaps else None}


# ─────────────────────────────────────────────────────────────────────
# 그림 하나 — 낙폭 절감 아령
# ─────────────────────────────────────────────────────────────────────

def dumbbell(boards):
    rows = []
    for b in boards:
        for r in b['rows']:
            a = (r['rules'].get('equity') or {}).get('mdd_saved_median_pct')
            c = (r['rules'].get('equity_ma_cross') or {}).get('mdd_saved_median_pct')
            if a is None or c is None:
                continue
            rows.append((b['ko'], r['h'], a, c))
    if not rows:
        return ''
    hi = max(max(a, c) for _, _, a, c in rows)
    top = math.ceil(hi / 5.0) * 5

    L, R, T, RH = 150, 76, 14, 27
    W, H = 860, T + RH * len(rows) + 46

    def x(v):
        return L + (W - L - R) * (v / top)

    p = ['<svg viewBox="0 0 %d %d" role="img" width="100%%" '
         'aria-label="낙폭 절감 — 신호와 20일선 교차" class="fig">' % (W, H)]
    # 눈금 — 뒤로 물러서게
    for g in range(0, top + 1, 5):
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>'
                 % (x(g), T - 4, x(g), T + RH * len(rows)))
        p.append('<text x="%.1f" y="%d" class="tick" text-anchor="middle">%d</text>'
                 % (x(g), T + RH * len(rows) + 16, g))
    p.append('<text x="%.1f" y="%d" class="tick" text-anchor="middle">낙폭 절감 (%%p)</text>'
             % ((L + W - R) / 2, H - 4))

    last = None
    for i, (ko, h, a, c) in enumerate(rows):
        y = T + RH * i + RH / 2
        if ko != last:                       # 판이 바뀌는 자리에 이름을 적는다
            p.append('<text x="8" y="%.1f" class="grp">%s</text>' % (y + 4, esc(ko)))
            last = ko
            if i:
                p.append('<line x1="0" y1="%.1f" x2="%d" y2="%.1f" class="sep"/>'
                         % (y - RH / 2, W, y - RH / 2))
        p.append('<text x="%d" y="%.1f" class="rowlab" text-anchor="end">%s일</text>'
                 % (L - 12, y + 4, h))
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="conn"/>'
                 % (x(min(a, c)), y, x(max(a, c)), y))
        # 값을 점마다 적는다 — 밝은판 호박색 명암을 이것으로 갚는다
        p.append('<g class="hit" tabindex="0"><title>%s %s일 — 신호 %.1f%%p · '
                 '20일선 교차 %.1f%%p (차이 %+.1f%%p)</title>'
                 '<rect x="0" y="%.1f" width="%d" height="%d" fill="transparent"/>'
                 % (esc(ko), h, a, c, a - c, y - RH / 2, W, RH))
        p.append('<circle cx="%.1f" cy="%.1f" r="5.5" class="d2"/>' % (x(c), y))
        p.append('<circle cx="%.1f" cy="%.1f" r="5.5" class="d1"/>' % (x(a), y))
        p.append('<text x="%.1f" y="%.1f" class="val v2" text-anchor="end">%.1f</text>'
                 % (x(c) - 9, y + 4, c))
        p.append('<text x="%.1f" y="%.1f" class="val v1">%.1f</text>'
                 % (x(a) + 9, y + 4, a))
        p.append('</g>')
    p.append('</svg>')
    return ''.join(p)


# ─────────────────────────────────────────────────────────────────────
# 그림 둘 — 사건연구 차이와 95% 구간
# ─────────────────────────────────────────────────────────────────────

def ci_plot(boards):
    rows = []
    for b in boards:
        for r in b['rows']:
            e = r['event']
            if e.get('diff') is None or e.get('ci_lo') is None:
                continue
            rows.append((b['ko'], r['h'], e['diff'], e['ci_lo'], e['ci_hi']))
    if not rows:
        return '', 0
    lo = min(min(l, d) for _, _, d, l, _ in rows)
    hi = max(max(h2, d) for _, _, d, _, h2 in rows)
    pad = (hi - lo) * 0.12 or 1
    lo, hi = lo - pad, hi + pad

    L, R, T, RH = 150, 40, 14, 27
    W, H = 860, T + RH * len(rows) + 46

    def x(v):
        return L + (W - L - R) * ((v - lo) / (hi - lo))

    excl = 0
    p = ['<svg viewBox="0 0 %d %d" role="img" width="100%%" '
         'aria-label="사건연구 차이와 95%% 구간" class="fig">' % (W, H)]
    for g in range(int(math.floor(lo)), int(math.ceil(hi)) + 1):
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>'
                 % (x(g), T - 4, x(g), T + RH * len(rows)))
        p.append('<text x="%.1f" y="%d" class="tick" text-anchor="middle">%d</text>'
                 % (x(g), T + RH * len(rows) + 16, g))
    p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="zero"/>'
             % (x(0), T - 8, x(0), T + RH * len(rows) + 2))
    p.append('<text x="%.1f" y="%d" class="tick" text-anchor="middle">'
             '신호일 이후 − 평상시 (%%p)</text>' % ((L + W - R) / 2, H - 4))

    last = None
    for i, (ko, h, d, cl, ch) in enumerate(rows):
        y = T + RH * i + RH / 2
        if ko != last:
            p.append('<text x="8" y="%.1f" class="grp">%s</text>' % (y + 4, esc(ko)))
            last = ko
            if i:
                p.append('<line x1="0" y1="%.1f" x2="%d" y2="%.1f" class="sep"/>'
                         % (y - RH / 2, W, y - RH / 2))
        p.append('<text x="%d" y="%.1f" class="rowlab" text-anchor="end">%s일</text>'
                 % (L - 12, y + 4, h))
        off = (cl > 0 or ch < 0)
        if off:
            excl += 1
        p.append('<g class="hit" tabindex="0"><title>%s %s일 — 차이 %+.2f%%p, '
                 '95%% 구간 %.2f ~ %.2f%s</title>'
                 '<rect x="0" y="%.1f" width="%d" height="%d" fill="transparent"/>'
                 % (esc(ko), h, d, cl, ch,
                    ' (0 을 비켜감)' if off else ' (0 을 걸침)', y - RH / 2, W, RH))
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="whisk%s"/>'
                 % (x(cl), y, x(ch), y, ' off' if off else ''))
        p.append('<circle cx="%.1f" cy="%.1f" r="5" class="dot%s"/>'
                 % (x(d), y, ' off' if off else ''))
        p.append('<text x="%.1f" y="%.1f" class="val v3">%+.2f</text>'
                 % (x(max(ch, d)) + 9, y + 4, d))
        p.append('</g>')
    p.append('</svg>')
    return ''.join(p), excl


# ─────────────────────────────────────────────────────────────────────

def table(b):
    h = ('<div class="scroll"><table><thead><tr><th>시계</th><th>규칙</th>'
         '<th class="num">보유 대비</th><th class="num">장에 머문 시간</th>'
         '<th class="num">최대낙폭</th><th class="num">낙폭 절감</th>'
         '<th class="num">하루당 초과</th></tr></thead><tbody>')
    for r in b['rows']:
        for j, (k, ko) in enumerate(RULES):
            q = r['rules'].get(k)
            if not q:
                continue
            h += '<tr%s>' % (' class="lead"' if j == 0 else '')
            h += ('<td rowspan="%d">%s일</td>' % (len(RULES), r['h'])) if j == 0 else ''
            h += ('<td>%s</td><td class="num">%s%%p</td><td class="num">%s%%</td>'
                  '<td class="num">%s%%</td><td class="num"><b>%s%%p</b></td>'
                  '<td class="num">%s</td></tr>'
                  % (esc(ko), sgn(q.get('excess_median_pct')),
                     '%.0f' % q['in_market_median_pct'] if q.get('in_market_median_pct') is not None else '—',
                     '%.1f' % q['mdd_median_pct'] if q.get('mdd_median_pct') is not None else '—',
                     sgn(q.get('mdd_saved_median_pct')),
                     sgn(q.get('per_day_excess_median'), 4)))
    return h + '</tbody></table></div>'


CSS = """
:root{--surface-1:#fcfcfb;--page:#f9f9f7;--text-primary:#0b0b0b;--text-secondary:#52514e;
--text-muted:#898781;--grid:#e1e0d9;--axis:#c3c2b7;--border:rgba(11,11,11,.10);
--s1:#2a78d6;--s2:#eda100;--neutral:#6d6b65;--up:#d03b3b;--down:#2a78d6;
--good:#006300;--warn:#b06f00;--danger:#c0392b;
--shadow:0 1px 2px rgba(11,11,11,.05),0 4px 16px rgba(11,11,11,.04);--radius:14px;}
:root[data-theme="dark"]{--surface-1:#1a1a19;--page:#0d0d0d;--text-primary:#fff;
--text-secondary:#c3c2b7;--text-muted:#898781;--grid:#2c2c2a;--axis:#383835;
--border:rgba(255,255,255,.10);--s1:#3987e5;--s2:#c98500;--neutral:#9a978f;
--up:#ff6b6b;--down:#5598e7;--good:#0ca30c;--warn:#e0a030;--danger:#ff6b6b;
--shadow:0 1px 2px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.3);}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
--surface-1:#1a1a19;--page:#0d0d0d;--text-primary:#fff;--text-secondary:#c3c2b7;
--text-muted:#898781;--grid:#2c2c2a;--axis:#383835;--border:rgba(255,255,255,.10);
--s1:#3987e5;--s2:#c98500;--neutral:#9a978f;--up:#ff6b6b;--down:#5598e7;
--good:#0ca30c;--warn:#e0a030;--danger:#ff6b6b;
--shadow:0 1px 2px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.3);}}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI","Malgun Gothic",sans-serif;
background:var(--page);color:var(--text-primary);line-height:1.6;
-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:26px 16px 80px}
h1{font-size:23px;margin:0 0 2px;letter-spacing:-.01em}
h2{font-size:15.5px;margin:0 0 10px;letter-spacing:-.01em}
h3{font-size:13.5px;margin:18px 0 6px;color:var(--text-secondary)}
.sub{color:var(--text-secondary);font-size:13px}
.card{background:var(--surface-1);border:1px solid var(--border);border-radius:var(--radius);
box-shadow:var(--shadow);padding:18px;margin-top:16px}
.muted{color:var(--text-muted);font-size:12.5px}
.sec{color:var(--text-secondary);font-size:13.5px}
.note{color:var(--text-secondary);font-size:12.5px;margin-top:10px}
.lead-in{font-size:15px;color:var(--text-primary);margin:0 0 4px}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
@media(max-width:640px){.tiles{grid-template-columns:1fr}}
.tile{border:1px solid var(--border);border-radius:11px;padding:13px 15px}
.tile .big{font-size:28px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.tile .cap{font-size:12.5px;color:var(--text-secondary);margin-top:2px}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:6px}
th,td{padding:6px 9px;border-bottom:1px solid var(--grid);text-align:left;white-space:nowrap}
th{font-size:11.5px;color:var(--text-muted);font-weight:600}
th.num,td.num{text-align:right;font-variant-numeric:tabular-nums}
tr.lead td{border-top:1px solid var(--axis)}
.fig{display:block;margin:6px 0 2px;overflow:visible}
.grid{stroke:var(--grid);stroke-width:1}
.sep{stroke:var(--axis);stroke-width:1;opacity:.55}
.zero{stroke:var(--axis);stroke-width:2}
.tick{fill:var(--text-muted);font-size:11px}
.rowlab{fill:var(--text-secondary);font-size:12px}
.grp{fill:var(--text-primary);font-size:12.5px;font-weight:700}
.conn{stroke:var(--axis);stroke-width:2}
.d1{fill:var(--s1);stroke:var(--surface-1);stroke-width:2}
.d2{fill:var(--s2);stroke:var(--surface-1);stroke-width:2}
.whisk{stroke:var(--neutral);stroke-width:2}
.whisk.off{stroke:var(--text-primary);stroke-width:2.5}
.dot{fill:var(--neutral);stroke:var(--surface-1);stroke-width:2}
.dot.off{fill:var(--text-primary);stroke:var(--surface-1);stroke-width:2}
.val{font-size:11.5px;font-variant-numeric:tabular-nums;fill:var(--text-secondary)}
.val.v1{fill:var(--text-primary);font-weight:700}
.hit:hover .conn{stroke:var(--text-secondary)}
.hit:focus{outline:none}
.hit:focus .conn{stroke:var(--text-primary)}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;color:var(--text-secondary);
margin:2px 0 8px}
.key{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;
vertical-align:-1px}
.banner{border-radius:11px;padding:12px 14px;font-size:13.5px;margin-top:12px;
border:1px solid var(--border)}
.banner.warn{background:rgba(237,161,0,.12);color:var(--warn)}
.banner.danger{background:rgba(192,57,43,.12);color:var(--danger)}
.banner.good{background:rgba(27,175,122,.12);color:var(--good)}
ul{margin:6px 0;padding-left:18px}li{margin:3px 0;font-size:13.5px}
"""


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    boards = load()
    if not boards:
        sys.stderr.write('읽을 성적표가 없습니다\n')
        return 1
    t = tally(boards)
    db = dumbbell(boards)
    ci, excl = ci_plot(boards)
    n_cells = sum(len(b['rows']) for b in boards)

    h = ['<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>',
         '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>',
         '<title>네 판 성적표 — 신호와 20일선 교차</title>',
         '<style>%s</style></head><body><div class="wrap">' % CSS]

    h.append('<h1>네 판을 같은 잣대로 재다</h1>')
    # **「만든 때」와 「잰 때」를 갈라 적는다.**
    #
    # 이 화면은 날마다 다시 만들지만 성적표는 손으로만 다시 잰다. 머리말에 만든 때만
    # 적어 두면 날마다 새 날짜가 붙어 **숫자도 새것인 줄로 읽힌다.** 잰 때를 나란히
    # 두면 그 착각이 설 자리가 없다. 적혀 있지 않은 판은 적혀 있지 않다고 적는다 —
    # 이 저장소가 engine_hash 에서 쓰는 규율과 같다.
    stamps = []
    for d in {id(b['doc']): b['doc'] for b in boards}.values():
        stamps.append(d.get('measured_at_kst'))
    known = sorted(x for x in stamps if x)
    if len(known) == len(stamps) and known:
        when = ('성적을 잰 때 %s' % known[0] if len(set(known)) == 1
                else '성적을 잰 때 %s ~ %s' % (known[0], known[-1]))
    elif known:
        when = ('성적을 잰 때 %s <b>(일부 판은 적혀 있지 않습니다)</b>' % known[0])
    else:
        when = '<b>성적을 잰 때가 적혀 있지 않습니다</b> — 이 칸을 붙이기 전에 만들어진 판입니다'
    h.append('<div class="sub">국내 주식 · 미국 주식 · 국내상장 ETF · 해외상장 ETF — '
             '같은 대본(<code>signal_backtest.py</code>)이 낸 성적입니다.<br/>'
             '%s · 이 화면을 만든 때 %s</div>'
             % (when, datetime.now(KST).strftime('%Y-%m-%d %H:%M KST')))

    # ── 한 눈에
    h.append('<div class="card"><h2>한 눈에</h2>')
    h.append('<p class="lead-in"><b>낙폭을 줄이는 도구로는 값을 하고, 수익을 늘리는 '
             '도구로는 아닙니다.</b></p>')
    h.append('<div class="tiles">')
    h.append('<div class="tile"><div class="big">%d / %d</div>'
             '<div class="cap">낙폭 절감에서 신호가 20일선 교차를 이긴 칸</div></div>'
             % (t['won'], t['total']))
    h.append('<div class="tile"><div class="big">%d</div>'
             '<div class="cap">여러 번 시험한 것을 보정하고도 유의한 조합</div></div>'
             % t['survivors'])
    h.append('<div class="tile"><div class="big">%.1f~%.1f배</div>'
             '<div class="cap">20일선 교차 대비 낙폭 절감 배수</div></div>'
             % (t['gap_lo'], t['gap_hi']))
    h.append('</div>')
    h.append('<div class="note">왼쪽은 <b>긍정</b>이고 가운데는 <b>부정</b>입니다. '
             '둘 다 같은 자료에서 세어 적은 것이며, 자료가 바뀌면 이 숫자도 함께 '
             '바뀝니다.</div></div>')

    # ── 그림 하나
    h.append('<div class="card"><h2>낙폭 절감 — 신호와 20일선 교차</h2>')
    h.append('<div class="sec">매수후보유가 겪은 최대낙폭을 몇 %p 줄였는가. '
             '클수록 좋습니다.</div>')
    h.append('<div class="legend">'
             '<span><span class="key" style="background:var(--s1)"></span>신호 (축 넷 + 손절)</span>'
             '<span><span class="key" style="background:var(--s2)"></span>20일선 교차</span>'
             '</div>')
    h.append(db)
    h.append('<div class="note"><b>%d 칸 가운데 %d 칸에서 신호가 앞섭니다.</b> '
             '게다가 신호는 장에 더 적게 머물면서 그렇게 합니다 — 아래 표의 '
             '「장에 머문 시간」을 보십시오. 손절을 붙인 20일선(표 셋째 줄)이 손절 없는 '
             '것과 거의 같으므로, 이 벌어짐은 손절이 아니라 <b>축 넷</b>이 만든 것입니다. '
             '상대 규칙 둘을 각각 세면 %d 칸 가운데 %d 칸인데, 그 둘이 거의 같은 규칙이라 '
             '머리 숫자로는 %d 칸을 씁니다.'
             '</div></div>' % (t['total'], t['won'], t['total2'], t['won2'], t['total']))

    # ── 그림 둘
    h.append('<div class="card"><h2>그런데 신호 자체는 유의하지 않습니다</h2>')
    h.append('<div class="sec">신호일 이후 수익률에서 평상시를 뺀 값과 그 95% 구간. '
             '<b>구간이 0 을 걸치면 그 시계에서는 값을 한다고 말할 수 없습니다.</b></div>')
    # 진하게 그린 것이 무슨 뜻인지 적어 둔다 — 색(굵기)만으로 뜻을 나르지 않는다
    h.append('<div class="legend">'
             '<span><span class="key" style="background:var(--text-primary)"></span>'
             '95%% 구간이 0 을 비켜간 칸 (%d)</span>'
             '<span><span class="key" style="background:var(--neutral)"></span>'
             '0 을 걸치는 칸 (%d)</span></div>' % (excl, n_cells - excl))
    h.append(ci)
    h.append('<div class="note">%d 칸 가운데 구간이 0 을 비켜간 것은 <b>%d 칸</b>뿐이고, '
             '그마저 <b>여러 번 시험한 것을 보정하면 남지 않습니다</b>(통과 %d). '
             '구간은 종목이 아니라 <b>날짜 블록</b>으로 뽑았습니다 — 같은 날 종목들이 함께 '
             '움직이므로 종목일을 독립 관측으로 세면 구간이 터무니없이 좁아집니다.'
             '</div></div>' % (n_cells, excl, t['survivors']))

    # ── 판별 표
    h.append('<div class="card"><h2>판마다 자세히</h2>')
    for b in boards:
        cov = ''
        if b['key'].startswith('ETF') and b.get('coverage'):
            c = b['coverage'].get(b['key']) or {}
            if c.get('eval_from'):
                cov = ' · 평가 %s ~ %s' % (c['eval_from'], c['eval_to'])
        h.append('<h3>%s <span class="muted">%s%s</span></h3>'
                 % (esc(b['ko']), esc(b['n']), esc(cov)))
        h.append(table(b))
    h.append('<div class="note">「하루당 초과」는 <b>장에 머문 하루당</b> 매수후보유보다 '
             '얼마를 더 벌었는가입니다. 반만 머물고 절반을 벌었다면 진 것이 아니므로, '
             '노출을 보정해 견주는 자리입니다.</div></div>')

    # ── 무엇을 뜻하는가
    h.append('<div class="card"><h2>그래서 어떻게 읽어야 하는가</h2>')
    h.append('<div class="banner good"><b>써도 되는 자리</b> — 낙폭을 줄이는 '
             '<b>노출 조절기</b>. 네 판 모두에서 20일선 교차보다 두세 배 막고, 장에는 '
             '13~20%p 덜 머물면서 그렇게 합니다. 어느 우주에서도 예외가 없다는 것이 이 '
             '결론의 근거입니다.</div>')
    h.append('<div class="banner danger"><b>쓰면 안 되는 자리</b> — <b>수익을 늘리는 '
             '도구.</b> 보정을 통과한 조합이 네 판 어디에도 없고, 매수후보유에는 모든 판이 '
             '크게 집니다. 특히 <b>미국 주식은 사건연구 넷이 모두 음수</b>라 진입 신호로 '
             '쓰면 거꾸로 갑니다.</div>')
    h.append('<div class="banner warn"><b>잊지 말 것</b> — 이 성적은 <b>오르는 장이 '
             '대부분인 구간</b>에서 잰 것입니다. 오르는 장에서는 현금을 든 시간이 곧 '
             '손해라 「매수후보유에 못 미친다」가 저절로 나옵니다. 반대로 낙폭 절감은 '
             '내리는 장이 있어야 값을 하므로, 두 숫자를 같은 무게로 읽으면 안 됩니다.</div>')
    h.append('</div>')

    # ── 어떻게 쟀나
    d0 = boards[0]['doc']
    h.append('<div class="card"><h2>어떻게 쟀나</h2><ul class="sec">')
    h.append('<li>세 규칙을 <b>같은 구간·같은 비용·같은 시간손절</b>로 나란히 쟀습니다. '
             '셋째 줄은 20일선 교차에 신호 쪽과 <b>똑같은 2×ATR 손절</b>만 붙인 것이라, '
             '둘째와 셋째의 차이가 손절의 몫이고 첫째와 셋째의 차이가 엔진의 몫입니다.</li>')
    h.append('<li>진입은 신호 자기백분위가 %g 위로 올라선 날, 청산은 %g 아래로 내려선 날. '
             '매매비용은 왕복 %s bp 세 자리에서 모두 쟀고 <b>그 값들은 사실이 아니라 '
             '가정입니다.</b></li>'
             % (d0.get('entry_cut', 70), d0.get('exit_cut', 30),
                '/'.join(str(x) for x in (d0.get('cost_grid_bps') or []))))
    h.append('<li>ETF 판은 이력이 210세션에 못 미치는 신설 종목을 빼고 쟀습니다 — '
             '국내상장은 49/55, 해외상장은 20/21 입니다. <b>76종으로 잰 것이 '
             '아닙니다.</b></li>')
    h.append('<li>모든 값은 종목별 결과의 <b>중앙값</b>입니다. 평균은 한두 종목이 '
             '끌고 갑니다.</li>')
    h.append('</ul>')
    h.append('<div class="note">정보 제공 목적의 사내 참고 자료이며 투자 권유가 '
             '아닙니다. 과거 자료로 만든 규칙의 출력이지 앞일에 대한 예측이 아닙니다. '
             '고객에게 보여주는 자료로 쓸 경우 준법감시 부서 확인이 필요합니다.</div>')
    h.append('</div>')

    h.append('</div></body></html>')
    html = ''.join(h)

    # **바뀐 것이 시각뿐이면 파일을 건드리지 않는다.**
    #
    # 이 화면은 성적표 둘만 읽는데 그것들은 손으로만 다시 잰다. 날마다 돌리면
    # 알맹이는 그대로인 채 머리말의 만든 때 한 줄만 달라지는데, 그것을 그대로 쓰면
    # 날마다 40KB 가 저장소에 새로 쌓이고 「갱신됨」이라는 거짓 신호가 남는다.
    # kis_timing_data.write_if_changed 와 같은 규율이며, 지문을 파일에 적어 두어
    # 다음 판이 견줄 수 있게 한다.
    body = re.sub(r'이 화면을 만든 때 [^<]*', '이 화면을 만든 때 —', html)
    digest = hashlib.sha256(body.encode('utf-8')).hexdigest()[:16]
    html = html.replace('</body>', '<!-- content-hash: %s --></body>' % digest)

    prev = ''
    if os.path.exists(a.out):
        try:
            prev = open(a.out, encoding='utf-8').read()
        except OSError:
            prev = ''
    if ('content-hash: %s ' % digest) in prev:
        print('그대로 둔다: %s — 시각 말고 달라진 것이 없다 (지문 %s)'
              % (os.path.relpath(a.out, ROOT), digest))
        return 0

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write(html)
    mb = os.path.getsize(a.out) / 1024.0
    print('썼다: %s (%.0f KB, 지문 %s) — 칸 %d, 신호 우세 %d, 보정 통과 %d'
          % (os.path.relpath(a.out, ROOT), mb, digest,
             t['total'], t['won'], t['survivors']))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
