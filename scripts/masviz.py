#!/usr/bin/env python3
"""미래에셋 브랜드 HTML 산출물의 공통 조각 — 숫자 표기 · 차트 · 표.

브리핑 주간판(build_weekly_digest.py), 마켓 모니터(build_market_monitor.py),
포트폴리오 점검(build_portfolio_report.py)이 같은 규칙으로 그리도록 여기에
모아 둔다. 페이지 고유의 레이아웃 CSS 는 각 빌더가 갖고, 토큰·차트·표·툴팁만
공유한다.

색 규칙 — 왜 이렇게 묶었는지
    브랜드 색은 고정값이라 팔레트 검증기의 두 항목을 통과시킬 수 없다.
    #043B72 는 명도 밴드보다 어둡고, #F58220 은 표면 대비가 2.53:1 이다.
    검증기가 요구하는 완화 조건을 대신 지킨다.

      · 한 차트의 계열은 4개를 넘기지 않는다 (4개까지는 CVD·정상시야
        분리도가 모두 통과한다)
      · 등락은 상승 #C62828 / 하락 #043B72 다이버징 페어를 쓴다
        (둘 다 대비 3:1 통과, 국내 표기 관행과도 맞는다)
      · 대비가 낮은 색에 크기 판단을 맡기지 않는다 — 모든 차트는 수치
        라벨을 직접 달고, 같은 값을 표로도 싣는다
      · 축은 언제나 하나다. 단위가 다른 두 계열은 리베이스하거나 차트를
        나눈다 (이중축 금지)
"""

from __future__ import annotations

# ---------------------------------------------------------------- 색
UP = '#C62828'        # 상승
DOWN = '#043B72'      # 하락
ORANGE = '#F58220'    # 계열 1
BLUE = '#043B72'      # 계열 2
SOFT = '#FAB072'      # 계열 3
CYAN = '#0086B8'      # 계열 4
NEUTRAL = '#84888B'   # 기타 · 0
GRID = '#A0A6A8'
AXIS = '#49535B'

SERIES = [ORANGE, BLUE, SOFT, CYAN]


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


def eok(v, unit='원'):
    """억 단위 값. 조가 되면 조로 접는다."""
    if v is None:
        return '—'
    if abs(v) >= 10000:
        return f'{v / 10000:+,.1f}조{unit}'
    return f'{v:+,.0f}억{unit}'


def cls(v):
    if v is None:
        return 'flat'
    return 'up' if v > 0 else ('down' if v < 0 else 'flat')


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


# ---------------------------------------------------------------- 차트
def hbars(rows, unit='%', width=760, row_h=26, digits=2, label_w=190):
    """가로 막대 — 등락 다이버징. rows = [(라벨, 값), ...]

    부호가 한쪽뿐이면 0 을 끝으로 밀어 폭을 다 쓰고, 섞여 있을 때만 0 을
    가운데 둔다. 값은 막대 끝에 직접 적는다.
    """
    rows = [(l, v) for l, v in rows if v is not None]
    if not rows:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    value_w, pad = 84, 8
    plot_w = width - label_w - value_w - pad * 2
    height = row_h * len(rows) + 22
    vmax = max(abs(v) for _, v in rows) or 1.0

    has_pos = any(v > 0 for _, v in rows)
    has_neg = any(v < 0 for _, v in rows)
    if has_pos and has_neg:
        zero, scale = label_w + pad + plot_w / 2, (plot_w / 2) / vmax
    elif has_neg:
        zero, scale = label_w + pad + plot_w, plot_w / vmax
    else:
        zero, scale = label_w + pad, plot_w / vmax

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']
    out.append(f'<line x1="{zero:.1f}" y1="4" x2="{zero:.1f}" y2="{height - 18:.1f}" '
               f'stroke="{AXIS}" stroke-width="1"/>')

    for i, (label, v) in enumerate(rows):
        y = 4 + i * row_h
        bar_h = row_h - 10
        w = abs(v) * scale
        x = zero if v >= 0 else zero - w
        color = UP if v > 0 else (DOWN if v < 0 else NEUTRAL)
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
            f'</g>')

    anchor = 'middle' if (has_pos and has_neg) else ('end' if has_neg else 'start')
    reach = '좌우' if (has_pos and has_neg) else '최대'
    out.append(f'<text class="axis-note" x="{zero:.1f}" y="{height - 4:.1f}" '
               f'text-anchor="{anchor}">0{unit} 기준 · {reach} {vmax:,.2f}{unit}</text>')
    out.append('</svg>')
    return ''.join(out)


def _legend(items):
    keys = ' '.join(f'<span class="key"><i style="background:{c}"></i>{esc(n)}</span>'
                    for n, c in items)
    return f'<div class="legend">{keys}</div>'


def lines(series, width=760, height=260, unit='', rebase=False, digits=2,
          zero_line=None, fmt=None):
    """선 차트. series = [(이름, 색, [(x라벨, 값), ...]), ...] — 계열 4개까지.

    rebase=True 면 각 계열의 첫 유효값을 100 으로 맞춘다. 단위가 다른 값을
    한 축에 올릴 때만 쓴다. 이중축은 만들지 않는다.
    """
    series = [(n, c, [p for p in pts if p[1] is not None]) for n, c, pts in series]
    series = [s for s in series if len(s[2]) >= 2][:4]
    if not series:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    if rebase:
        series = [(n, c, [(x, v / pts[0][1] * 100) for x, v in pts])
                  for n, c, pts in series]
        zero_line = 100

    fmt = fmt or (lambda v: f'{v:,.{digits}f}{unit}')
    ml, mr, mt, mb = 54, 58, 14, 34
    pw, ph = width - ml - mr, height - mt - mb
    n = max(len(pts) for _, _, pts in series)

    vals = [v for _, _, pts in series for _, v in pts]
    lo, hi = min(vals), max(vals)
    if zero_line is not None:
        lo, hi = min(lo, zero_line), max(hi, zero_line)
    span = (hi - lo) or (abs(hi) or 1.0)
    lo, hi = lo - span * 0.10, hi + span * 0.10

    def X(i):
        return ml + (pw * i / (n - 1) if n > 1 else pw / 2)

    def Y(v):
        return mt + ph - (v - lo) / (hi - lo) * ph

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']

    for k in range(5):
        v = lo + (hi - lo) * k / 4
        y = Y(v)
        out.append(f'<line x1="{ml}" y1="{y:.1f}" x2="{ml + pw}" y2="{y:.1f}" '
                   f'stroke="{GRID}" stroke-width="1" stroke-dasharray="3 3" opacity=".45"/>')
        out.append(f'<text class="axis-note" x="{ml - 8}" y="{y + 4:.1f}" '
                   f'text-anchor="end">{v:,.{digits if abs(hi - lo) < 10 else 0}f}</text>')

    if zero_line is not None and lo <= zero_line <= hi:
        out.append(f'<line x1="{ml}" y1="{Y(zero_line):.1f}" x2="{ml + pw}" '
                   f'y2="{Y(zero_line):.1f}" stroke="{AXIS}" stroke-width="1"/>')

    for name, color, pts in series:
        d = ' '.join(f'{"M" if i == 0 else "L"}{X(i):.1f} {Y(v):.1f}'
                     for i, (_, v) in enumerate(pts))
        out.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2" '
                   f'stroke-linejoin="round" stroke-linecap="round"/>')
        # 끝점만 표식 + 직접 라벨. 모든 점에 숫자를 달지 않는다.
        lx, lv = X(len(pts) - 1), pts[-1][1]
        out.append(f'<circle cx="{lx:.1f}" cy="{Y(lv):.1f}" r="4.5" fill="{color}" '
                   f'stroke="#fff" stroke-width="2"/>')
        out.append(f'<text class="end-label" x="{lx + 9:.1f}" y="{Y(lv) + 4:.1f}" '
                   f'fill="{color}">{esc(fmt(lv))}</text>')

    xs = series[0][2]
    for i in (0, (n - 1) // 2, n - 1):
        if i >= len(xs):
            continue
        anchor = 'start' if i == 0 else ('end' if i == n - 1 else 'middle')
        out.append(f'<text class="axis-note" x="{X(i):.1f}" y="{height - 12}" '
                   f'text-anchor="{anchor}">{esc(xs[i][0])}</text>')

    # hover 히트 존 — 한 칸이 그 날짜의 모든 계열 값을 보여준다.
    step = pw / max(n - 1, 1)
    for i in range(n):
        tip = ' · '.join(f'{nm} {fmt(pts[i][1])}'
                         for nm, _, pts in series if i < len(pts))
        label = xs[i][0] if i < len(xs) else ''
        out.append(f'<rect class="hit" x="{X(i) - step / 2:.1f}" y="{mt}" '
                   f'width="{step:.1f}" height="{ph}" fill="transparent" '
                   f'data-label="{esc(label)}" data-value="{esc(tip)}"/>')

    out.append('</svg>')
    head = _legend([(n, c) for n, c, _ in series]) if len(series) > 1 else ''
    return head + ''.join(out)


def diverging_bars(labels, up_vals, down_vals, up_name, down_name,
                   width=760, height=220, unit='', digits=0):
    """날짜별 상승/하락을 0 위아래로 세운다 — 축 하나, 계열 둘.

    등락 종목 수처럼 «양쪽이 동시에 있는» 값에 쓴다. 두 채움 사이에
    2px 표면 간격을 둔다.
    """
    pts = [(l, u, d) for l, u, d in zip(labels, up_vals, down_vals)
           if u is not None and d is not None]
    if not pts:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    ml, mr, mt, mb = 54, 14, 14, 34
    pw, ph = width - ml - mr, height - mt - mb
    vmax = max(max(u, d) for _, u, d in pts) or 1
    zero = mt + ph / 2
    scale = (ph / 2) / vmax
    bw = min(pw / len(pts) * 0.62, 26)

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']
    for k in (-1, -0.5, 0.5, 1):
        y = zero - k * (ph / 2)
        out.append(f'<line x1="{ml}" y1="{y:.1f}" x2="{ml + pw}" y2="{y:.1f}" '
                   f'stroke="{GRID}" stroke-width="1" stroke-dasharray="3 3" opacity=".45"/>')
        out.append(f'<text class="axis-note" x="{ml - 8}" y="{y + 4:.1f}" '
                   f'text-anchor="end">{abs(k) * vmax:,.0f}</text>')

    for i, (label, u, d) in enumerate(pts):
        cx = ml + pw * (i + 0.5) / len(pts)
        uh, dh = u * scale, d * scale
        out.append(
            f'<g class="mark" tabindex="0" data-label="{esc(label)}" '
            f'data-value="{up_name} {u:,.{digits}f}{unit} · {down_name} {d:,.{digits}f}{unit}">'
            f'<rect class="row-hit" x="{cx - pw / len(pts) / 2:.1f}" y="{mt}" '
            f'width="{pw / len(pts):.1f}" height="{ph}" fill="transparent"/>'
            # 0 선에서 2px 띄워 두 채움이 붙지 않게 한다.
            f'<rect x="{cx - bw / 2:.1f}" y="{zero - uh - 1:.1f}" width="{bw:.1f}" '
            f'height="{max(uh, 1):.1f}" rx="3" fill="{UP}"/>'
            f'<rect x="{cx - bw / 2:.1f}" y="{zero + 1:.1f}" width="{bw:.1f}" '
            f'height="{max(dh, 1):.1f}" rx="3" fill="{DOWN}"/>'
            f'</g>')

    out.append(f'<line x1="{ml}" y1="{zero:.1f}" x2="{ml + pw}" y2="{zero:.1f}" '
               f'stroke="{AXIS}" stroke-width="1"/>')
    for i in (0, len(pts) - 1):
        cx = ml + pw * (i + 0.5) / len(pts)
        anchor = 'start' if i == 0 else 'end'
        out.append(f'<text class="axis-note" x="{cx:.1f}" y="{height - 12}" '
                   f'text-anchor="{anchor}">{esc(pts[i][0])}</text>')
    out.append('</svg>')
    return _legend([(up_name, UP), (down_name, DOWN)]) + ''.join(out)


def heatmap(col_labels, row_labels, matrix, width=760, unit='%',
            cell_h=24, label_w=150):
    """다이버징 히트맵 — 두 색 + 회색 중간. 무지개는 쓰지 않는다.

    matrix[r][c] 는 None 이면 빈 칸으로 둔다.
    """
    if not col_labels or not row_labels:
        return '<p class="chart-empty">표시할 값이 없습니다.</p>'

    vals = [abs(v) for row in matrix for v in row if v is not None]
    vmax = max(vals) if vals else 1.0
    pad = 6
    grid_w = width - label_w - pad
    cw = grid_w / len(col_labels)
    # 위 20px 는 열 머리글, 아래 24px 는 범례 문구 자리다.
    height = cell_h * len(row_labels) + 44

    def fill(v):
        if v is None:
            return 'transparent'
        t = min(abs(v) / vmax, 1.0)
        # 0 근처는 회색, 멀어질수록 상승 적 / 하락 청으로 짙어진다.
        base = UP if v > 0 else DOWN
        return f'color-mix(in srgb, {base} {t * 100:.0f}%, var(--surface-soft))'

    out = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
           f'preserveAspectRatio="xMidYMid meet">']
    for c, cl in enumerate(col_labels):
        out.append(f'<text class="axis-note" x="{label_w + pad + cw * (c + 0.5):.1f}" '
                   f'y="12" text-anchor="middle">{esc(cl)}</text>')
    for r, rl in enumerate(row_labels):
        y = 20 + r * cell_h
        out.append(f'<text class="bar-label" x="{label_w:.0f}" '
                   f'y="{y + cell_h * 0.5 + 4:.1f}" text-anchor="end">{esc(rl)}</text>')
        for c in range(len(col_labels)):
            v = matrix[r][c] if c < len(matrix[r]) else None
            x = label_w + pad + cw * c
            tip = f'{pct(v)}' if v is not None else '값 없음'
            out.append(
                f'<g class="mark" tabindex="0" data-label="{esc(rl)} · {esc(col_labels[c])}" '
                f'data-value="{esc(tip)}">'
                # 2px 표면 간격 — 인접한 칸이 서로 붙지 않게 한다.
                f'<rect x="{x + 1:.1f}" y="{y + 1:.1f}" width="{cw - 2:.1f}" '
                f'height="{cell_h - 2:.1f}" rx="2" fill="{fill(v)}"/>'
                f'</g>')
    out.append(f'<text class="axis-note" x="{label_w + pad:.0f}" y="{height - 6}">'
               f'짙을수록 큰 폭 · 최대 {vmax:.2f}{unit} · 상승 적 / 하락 청</text>')
    out.append('</svg>')
    return ''.join(out)


# ---------------------------------------------------------------- 표
def table(headers, rows, aligns=None, highlight=None, compact=False):
    aligns = aligns or ['left'] * len(headers)
    c = ' class="compact"' if compact else ''
    out = [f'<div class="table-wrap"><table{c}><thead><tr>']
    for h, a in zip(headers, aligns):
        style = ' style="text-align:right"' if a == 'right' else ''
        out.append(f'<th{style}>{h}</th>')
    out.append('</tr></thead><tbody>')
    for r in rows:
        tr_cls = ' class="hl"' if highlight and r[0] in highlight else ''
        out.append(f'<tr{tr_cls}>')
        for cell_, a in zip(r, aligns):
            attr = ' class="n"' if a == 'right' else ''
            out.append(f'<td{attr}>{cell_}</td>')
        out.append('</tr>')
    out.append('</tbody></table></div>')
    return ''.join(out)


def cell(v, digits=2, kind='pct'):
    """등락 셀 — 색은 up/down 클래스로만 준다."""
    if v is None:
        return '<span class="flat">—</span>'
    if kind == 'bp':
        text = bp(v)
    elif kind == 'num':
        text = num(v, digits)
    else:
        text = pct(v, digits)
    return f'<span class="{cls(v)}">{text}</span>'


def section(number, title, body, note=None, sid=None):
    n = f'<span class="sec-num">{number}</span>' if number else ''
    tail = f'<p class="note">{note}</p>' if note else ''
    anchor = sid or (f'sec-{number}' if number else None)
    idattr = f' id="{anchor}"' if anchor else ''
    return (f'<section class="section"{idattr}><div class="section-rule"></div>'
            f'<h2 class="section-title">{n}{esc(title)}</h2>{body}{tail}</section>')


# ---------------------------------------------------------------- 스타일 · 스크립트
TOKENS = """*,*::before,*::after{box-sizing:border-box}
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
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--body);font-family:var(--font-kr);
  font-size:19px;line-height:1.65;font-variant-numeric:tabular-nums}
html[lang="en"] body{font-family:var(--font-en)}
h1,h2,h3{color:var(--ink);margin:0}
a{color:var(--secondary)}
code{font-family:var(--font-en);font-size:.88em;background:var(--surface-subtle);
  padding:1px 5px;border-radius:2px}

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

.chart{width:100%;height:auto;display:block;margin:8px 0 4px;overflow:visible}
.chart text{font-family:var(--font-kr);font-variant-numeric:tabular-nums}
.bar-label{font-size:15px;fill:var(--body)}
.bar-value{font-size:15px;font-weight:500;font-family:var(--font-en)}
.end-label{font-size:14px;font-weight:600;font-family:var(--font-en)}
.axis-note{font-size:13px;fill:var(--muted-soft);font-family:var(--font-en)}
/* 격자선·선·라벨은 장식이다. 이벤트를 받으면 그 아래 히트 존을 가로막는다. */
.chart line,.chart path,.chart circle,.chart text{pointer-events:none}
.chart .mark{cursor:default}
.chart .mark:hover .row-hit{fill:var(--surface-subtle)}
.chart .mark:focus-visible .row-hit{fill:var(--surface-subtle);stroke:var(--ink);stroke-width:1}
.chart .hit{cursor:crosshair}
.legend{display:flex;gap:19px;flex-wrap:wrap;margin-bottom:6px;font-size:16px}
.legend .key{display:inline-flex;align-items:center;gap:7px;color:var(--body)}
.legend i{width:14px;height:3px;border-radius:2px;display:inline-block}

.table-wrap{overflow-x:auto;margin-top:19px}
table{border-collapse:collapse;width:100%;border:1px solid var(--hairline);font-size:17px}
table.compact{font-size:16px}
th,td{padding:10px 13px;text-align:left;border-bottom:1px solid var(--hairline-soft)}
table.compact th,table.compact td{padding:7px 11px}
thead th{background:var(--primary-soft);color:#1A1A1A;font-weight:700;font-size:16px;white-space:nowrap}
tbody tr:hover{background:var(--surface-subtle)}
tbody tr.hl{background:var(--highlight)}
td.n{text-align:right;font-family:var(--font-en);white-space:nowrap}
.up{color:var(--up)} .down{color:var(--down)} .flat{color:var(--muted-soft)}

#mv-tip{position:fixed;z-index:50;background:#1A1A1A;color:#fff;font-size:13px;
  padding:7px 10px;border-radius:2px;pointer-events:none;opacity:0;transition:opacity .1s;
  font-family:var(--font-kr);max-width:min(80vw,320px)}
#mv-tip strong{display:block;font-weight:600;margin-bottom:2px}

@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --canvas:#15171B;--surface-soft:#212630;--surface-subtle:#1B1F26;
    --hairline:#3A414C;--hairline-soft:#2A303A;--highlight:#272C34;
    --ink:#F1F3F6;--body:#CDD3DB;--muted:#98A0AB;--muted-soft:#7F8794;
    --primary:#FF9A4A;--primary-active:#FFB169;--primary-soft:#4A331E;--secondary:#82B7EA;
    --up:#FF7A7A;--down:#82B7EA;--on-primary:#241206;
  }
  :root:not([data-theme="light"]) thead th{color:#F1F3F6;background:#3A2A1C}
}

@media print{
  body{font-size:13pt;line-height:1.4}
  .section{max-width:100%;padding:0;margin-bottom:24px}
  table,.chart,.stats,.panel{page-break-inside:avoid}
  h2,h3{page-break-after:avoid}
  #mv-tip,.lang-toggle,.controls{display:none !important}
}
"""

TOOLTIP_JS = """
(function () {
  var tip = document.createElement('div');
  tip.id = 'mv-tip';
  document.body.appendChild(tip);

  function show(el, e) {
    var label = el.getAttribute('data-label') || '';
    var value = el.getAttribute('data-value') || '';
    if (!label && !value) return;
    tip.innerHTML = '<strong>' + label + '</strong>' + value;
    tip.style.opacity = '1';
    move(e);
  }
  function move(e) {
    var x = (e.clientX || 0) + 14, y = (e.clientY || 0) + 14;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = Math.max(8, window.innerWidth - w - 8);
    if (y + h > window.innerHeight - 8) y = Math.max(8, (e.clientY || 0) - h - 12);
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { tip.style.opacity = '0'; }

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.mark, .hit');
    if (el) show(el, e);
  });
  document.addEventListener('mousemove', function (e) {
    if (tip.style.opacity === '1') move(e);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest('.mark, .hit')) hide();
  });
  /* 키보드로도 값을 읽을 수 있게 한다 — 막대·칸은 tabindex 를 갖는다. */
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('.mark');
    if (!el) return;
    var r = el.getBoundingClientRect();
    show(el, { clientX: r.right, clientY: r.top });
  });
  document.addEventListener('focusout', hide);
})();
"""

LANG_JS = """
(function () {
  function apply(l) {
    document.documentElement.setAttribute('lang', l);
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.lang === l));
    });
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.ko) el.dataset.ko = el.innerHTML;
      el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.ko;
    });
    try { localStorage.setItem(window.MV_LANG_KEY || 'mas-lang', l); } catch (e) {}
  }
  var t = document.querySelector('.lang-toggle');
  if (t) t.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]');
    if (b) apply(b.dataset.lang);
  });
  var saved = 'ko';
  try { saved = localStorage.getItem(window.MV_LANG_KEY || 'mas-lang') || 'ko'; } catch (e) {}
  apply(saved);
})();
"""

LANG_TOGGLE_HTML = """<div class="lang-toggle" role="radiogroup" aria-label="언어 선택">
  <button type="button" role="radio" data-lang="ko" aria-checked="true">KO</button>
  <button type="button" role="radio" data-lang="en" aria-checked="false">EN</button>
</div>"""

LANG_TOGGLE_CSS = """.lang-toggle{display:flex;flex:none;border:1px solid var(--hairline);
  border-radius:2px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);background:#fff}
.lang-toggle button{font-family:var(--font-en);font-size:14px;font-weight:500;
  letter-spacing:.5px;padding:10px 17px;border:0;background:#fff;color:var(--muted);cursor:pointer}
.lang-toggle button+button{border-left:1px solid var(--hairline)}
.lang-toggle button[aria-checked="true"]{background:var(--primary);color:#fff}
.lang-toggle button:not([aria-checked="true"]):hover{background:var(--surface-subtle);color:var(--ink)}
.lang-toggle button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .lang-toggle,
  :root:not([data-theme="light"]) .lang-toggle button{background:#1A1E25;color:var(--body)}
  :root:not([data-theme="light"]) .lang-toggle button[aria-checked="true"]{
    background:var(--primary);color:#241206}
}
"""
