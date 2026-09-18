#!/usr/bin/env python3
"""고객에게 건넬 한 장 — data/volatility/latest.json → 한 파일 HTML.

    python3 scripts/build_client_page.py
    python3 scripts/build_client_page.py --out /tmp/보낼판.html

**docs/volatility/index.html 과 무엇이 다른가.** 그쪽은 **내가 보는 화면**이다.
모델이 스스로의 한계를 드러내는 대목이 다 들어 있다 — 백테스트 표, 축별 순위상관 ρ 와
증거의 힘 λ, 「거의 사전값 — 실력 확인 안 됨」 딱지, 문턱 훑기, 지표 원본. 그것들은
판단하는 사람에게 필요한 것이고, 없으면 내가 이 점수를 믿을 근거가 없다.

이 파일은 **고객에게 건네는 한 장**이다. 위의 것들을 걷어내고 남기는 것은 넷이다.

  하나. 지금 시장이 어느 자리에 있는가 (경보 점수·등급·국면)
  둘.   무엇을 보고 그렇게 말하는가 (네 축을 쉬운 말로)
  셋.   같은 자리였던 과거에 이후 열흘이 어땠는가 (센 빈도, 표본 수와 함께)
  넷.   이 숫자를 어떻게 읽어야 하는가 (한계)

**넷째를 빼지 않는다.** 걷어내는 것은 *복잡한 것*이지 *불리한 것*이 아니다. 급락 확률
5%만 적고 「평소에도 13% 였다」를 빼면 그건 깎은 게 아니라 속인 것이다. 그래서 무조건부
확률과 표본 수는 고객 판에도 그대로 싣고, 「방향을 맞히는 장치가 아니다」도 그대로 싣는다.

디자인은 미래에셋 기준을 따른다 — 오렌지 #F58220 / 블루 #043B72, 1px 섹션 룰,
본문 19px, 모서리 4px 이하, 이모지·그라데이션 없음.

**차트는 인라인 SVG 로 그린다.** 내 화면은 Chart.js(205KB)를 쓰지만 고객 판에 그걸
심으면 파일이 0.3MB 가 된다. 선 하나 그리자고 라이브러리를 통째로 넣을 까닭이 없다.

**글꼴 CDN 을 걸지 않는다.** 인터넷이 막힌 자리에서 열릴 파일이라 못 받아 올 요청을
넣으면 열릴 때마다 그만큼 기다린다. 사내 PC 에 흔히 있는 것들로 대체 사슬을 세운다.

표준 라이브러리만 쓴다.
"""
import os, sys, json, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = datetime.timezone(datetime.timedelta(hours=9))

# 미래에셋 토큰 — 이 값을 "비슷한 값"으로 새로 잡지 않는다
ORANGE, BLUE = '#F58220', '#043B72'
SOFT, ACTIVE = '#FAB072', '#CB6015'
INK, BODY, MUTED = '#1A1A1A', '#3D3D3D', '#6C6C6C'
HAIR, HAIR_SOFT, SURFACE = '#CDCECB', '#E5E4E1', '#F7F8FA'
WARNING, ERROR, SUCCESS = '#D4A017', '#C62828', '#2E8540'

# 등급마다 어떤 색으로 말할 것인가. 의미색은 아껴 쓴다(§7.6).
GRADE_COLOR = {'위험': ERROR, '경계': ERROR, '주의': WARNING, '관심': BLUE, '안정': BLUE}

# 축을 고객의 말로 옮긴다. 「변동성 백분위 44」가 아니라 무엇을 본 것인지로 적는다.
AXIS_KO = {
    'volatility':  ('흔들림', '지수가 하루하루 얼마나 크게 움직이는가'),
    'compression': ('눌림',   '움직임이 좁아져 힘이 쌓이고 있는가'),
    'momentum':    ('흐름',   '추세가 위로 가는가 아래로 가는가'),
    'flow':        ('수급',   '외국인·기관의 돈이 들어오는가 나가는가'),
}
# 국면을 고객의 말로. 원본 설명에는 「밴드」 같은 지표 용어가 들어 있어 그대로 쓰지 않는다.
PHASE_KO = {
    'coiled':   ('힘이 쌓이는 자리',
                 '하루하루 움직임이 좁아졌습니다. 방향은 아직 정해지지 않았지만, '
                 '이런 자리는 한 번 풀릴 때 크게 움직이는 편입니다.'),
    'breaking': ('아래로 가는 자리',
                 '움직임이 커진 채로 흐름이 아래를 향합니다. 이미 조정이 진행 중인 국면입니다.'),
    'unwind':   ('크게 흔들리는 자리',
                 '위아래로 크게 출렁입니다. 방향이 분명치 않아 양쪽으로 다 튈 수 있습니다.'),
    'calm':     ('평온한 자리', '크게 눌리지도 흔들리지도 않은 상태입니다.'),
    'drift':    ('완만히 오르는 자리', '움직임이 잔잔하고 흐름이 위를 향합니다.'),
}

# 점수대별로 뭐라 읽을 것인가
def axis_word(v):
    if v is None:
        return '—'
    if v >= 75: return '강함'
    if v >= 55: return '다소 강함'
    if v >= 35: return '보통'
    return '약함'


def esc(s):
    return html.escape(str(s if s is not None else ''), quote=True)


def fnum(x, d=1):
    return '—' if x is None else ('%.*f' % (d, x))


def sgn(x, d=1):
    return '—' if x is None else ('%+.*f' % (d, x))


# ─────────────────────────────────────────────────────────────────────
# 인라인 SVG 선 그림 — 라이브러리 없이
# ─────────────────────────────────────────────────────────────────────

def line_chart(points, w=1136, h=260, pad_l=64, pad_r=16, pad_t=16, pad_b=34):
    """(날짜, 값) 목록을 선 하나로 그린다. 시리즈 1 이므로 오렌지."""
    vals = [v for _, v in points]
    if len(vals) < 2:
        return '<p style="color:%s">그릴 자료가 모자랍니다.</p>' % MUTED
    lo, hi = min(vals), max(vals)
    span = (hi - lo) or 1
    lo -= span * 0.08
    hi += span * 0.08
    span = hi - lo
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b
    X = lambda i: pad_l + iw * i / (len(points) - 1)
    Y = lambda v: pad_t + ih * (1 - (v - lo) / span)

    # 가로 눈금 넷 — 점선, 흐리게
    grid, ylab = [], []
    for k in range(4):
        v = lo + span * k / 3
        y = Y(v)
        grid.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#A0A6A8" '
                    'stroke-width="1" stroke-dasharray="3 4" />' % (pad_l, y, w - pad_r, y))
        ylab.append('<text x="%.1f" y="%.1f" text-anchor="end" font-size="13" fill="%s">'
                    '%s</text>' % (pad_l - 10, y + 4, MUTED, format(int(round(v)), ',')))

    d = ' '.join(('%s%.1f %.1f' % ('M' if i == 0 else 'L', X(i), Y(v)))
                 for i, (_, v) in enumerate(points))

    # 날짜 눈금 다섯. **양 끝은 가운데 정렬하면 잘린다** — 첫 것은 왼쪽, 끝 것은
    # 오른쪽에 붙인다. 붙이지 않았더니 오른쪽 끝 날짜가 「26-09-1」로 잘렸다.
    xlab = []
    for k in range(5):
        i = round((len(points) - 1) * k / 4)
        anchor = 'start' if k == 0 else ('end' if k == 4 else 'middle')
        xlab.append('<text x="%.1f" y="%.1f" text-anchor="%s" font-size="13" fill="%s">'
                    '%s</text>' % (X(i), h - 10, anchor, MUTED, esc(points[i][0][2:])))

    last_x, last_y = X(len(points) - 1), Y(points[-1][1])
    return (
        '<svg viewBox="0 0 %d %d" width="100%%" role="img" '
        'aria-label="지수 추이 — %s %s 부터 %s %s 까지">'
        % (w, h, points[0][0], format(int(points[0][1]), ','),
           points[-1][0], format(int(points[-1][1]), ',')) +
        ''.join(grid) + ''.join(ylab) +
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#49535B" stroke-width="1" />'
        % (pad_l, pad_t, pad_l, pad_t + ih) +
        '<path d="%s" fill="none" stroke="%s" stroke-width="2" '
        'stroke-linejoin="round" stroke-linecap="round" />' % (d, ORANGE) +
        '<circle cx="%.1f" cy="%.1f" r="4" fill="%s" />' % (last_x, last_y, ORANGE) +
        ''.join(xlab) + '</svg>')


# ─────────────────────────────────────────────────────────────────────

def build(D):
    s = D['score']
    ix = D['index']
    I = D['indicators']
    grade = s.get('grade') or '—'
    gc = GRADE_COLOR.get(grade, BLUE)
    asof = D['asof']

    # ── 지수 추이 — 최근 120 거래일만. 고객에게 두 해치는 너무 배다.
    tl = [r for r in (D.get('timeline') or []) if r.get('c') is not None][-120:]
    chart = line_chart([(r['d'], r['c']) for r in tl])

    # ── 네 축
    axis_rows = []
    for key, (ko, why) in AXIS_KO.items():
        v = (s['axes'].get(key) or {}).get('score')
        pctw = 0 if v is None else max(2, min(100, v))
        axis_rows.append(
            '<div class="axis">'
            '<div class="axis-head"><span class="axis-name">%s</span>'
            '<span class="axis-word">%s</span></div>'
            '<div class="axis-why">%s</div>'
            '<div class="track"><div class="fill" style="width:%.0f%%"></div></div>'
            '</div>' % (esc(ko), esc(axis_word(v)), esc(why), pctw))

    # ── 시나리오 — 10 거래일을 싣는다
    h10 = ((D.get('scenarios') or {}).get('horizons') or {}).get('10') or {}
    scen_html = ''
    if h10.get('prob') and h10.get('thresholds_pct'):
        t = h10['thresholds_pct']
        base = (h10.get('baseline') or {}).get('prob') or {}
        rows = [
            ('크게 밀림', 'crash', '저가 기준 %.1f%% 이하' % abs(t['crash'])),
            ('약세',      'down',  '%.1f%% 이하' % abs(t['down'])),
            ('제자리',    'flat',  '±%.1f%% 안' % t['up']),
            ('상승',      'up',    '%.1f%% 이상' % t['up']),
        ]
        trs = []
        for ko, k, rng in rows:
            p, b = h10['prob'].get(k), base.get(k)
            trs.append(
                '<tr><th scope="row">%s</th><td class="rng">%s</td>'
                '<td class="num strong">%s%%</td><td class="num">%s%%</td></tr>'
                % (esc(ko), esc(rng), fnum(p, 0), fnum(b, 0)))
        scen_html = (
            '<table class="data"><caption class="sr">같은 국면이던 과거의 이후 10거래일 결과</caption>'
            '<thead><tr><th scope="col">어떻게 됐나</th><th scope="col">기준</th>'
            '<th scope="col">같은 자리였을 때</th><th scope="col">아무 때나</th></tr></thead>'
            '<tbody>' + ''.join(trs) + '</tbody></table>'
            '<p class="note">같은 국면이던 과거 <strong>%d일</strong>을 세었습니다. '
            '오른쪽 칸은 날짜를 가리지 않고 아무 때나 집었을 때의 같은 비율입니다 — '
            '<strong>둘을 나란히 놓고 보셔야 뜻이 생깁니다.</strong></p>' % h10['n'])
    else:
        scen_html = ('<p class="note">같은 국면이던 과거가 %d일뿐이라 확률을 내지 않았습니다. '
                     '표본이 얕을 때 확률을 적는 것은 아는 척하는 것이라 비워 둡니다.</p>'
                     % (h10.get('n', 0)))

    # ── **내부 문장은 한 줄도 옮기지 않는다.**
    # 처음에는 판정·시나리오·한계 갈래만 골라 실었는데, 한계 문장 안에 「σ 기준 리프트
    # −0.6%p」·「포착률 100%」 같은 내부 잣대가 그대로 들어 있었다. 걸러 내고 보니
    # 남는 말은 아래 「어떻게 읽어야 하나」가 이미 쉬운 말로 하고 있다 — 그래서 뺀다.
    # 원문 문장이 필요하면 내부 화면의 복사 단추를 쓴다.

    parts = []
    parts.append(HEAD % {
        'asof': esc(asof), 'grade': esc(grade), 'gc': gc,
        'title': '시장 변동성 경보 %s' % esc(asof),
    })

    # 히어로
    parts.append(
        '<header class="hero"><div class="page">'
        '<div class="tag">사내 참고 자료</div>'
        '<h1>시장 변동성 경보</h1>'
        '<p class="sub">%s 기준 · 지금 시장이 어느 자리에 있는지를 네 가지 눈으로 재어 '
        '한 장에 담았습니다.</p>'
        '</div></header>' % esc(asof))

    # 1. 지금 자리
    ph_label, ph_note = PHASE_KO.get(
        s.get('phase'), (s.get('phase_label') or '—', s.get('phase_note') or ''))
    self_pct = s.get('self_pct')
    rank_line = ('두 해 이력에서 위쪽 %.0f%% 자리입니다.' % (100 - self_pct)) if self_pct is not None else ''
    parts.append(
        '<section class="section"><div class="page">'
        '<div class="rule"></div><h2>지금 어느 자리인가</h2>'
        '<div class="grid-2">'
        '  <div class="score-box">'
        '    <div class="stat-label">경보 점수</div>'
        '    <div class="stat-hero" style="color:%s">%s</div>'
        '    <div class="grade" style="color:%s">%s</div>'
        '    <p class="score-why">%s %s</p>'
        '  </div>'
        '  <div class="stats">%s</div>'
        '</div>'
        '<p class="lead"><strong>%s</strong> — %s</p>'
        '</div></section>'
        % (gc, fnum(s.get('total'), 0), gc, esc(grade),
           esc(rank_line),
           '0에 가까울수록 평온, 100에 가까울수록 위태롭다는 뜻입니다.',
           stat_cards(ix, I),
           esc(ph_label), esc(ph_note)))

    # 2. 무엇을 보고 그렇게 말하는가
    parts.append(
        '<section class="section"><div class="page">'
        '<div class="rule"></div><h2>무엇을 보고 그렇게 말하는가</h2>'
        '<p class="lead">네 가지를 각각 재어 하나로 모읍니다. 어느 하나만으로는 '
        '속임수 신호에 걸리기 쉬워 넷을 함께 봅니다.</p>'
        '<div class="axes">%s</div>'
        '</div></section>' % ''.join(axis_rows))

    # 3. 지수 추이
    parts.append(
        '<section class="section"><div class="page">'
        '<div class="rule"></div><h2>최근 흐름</h2>'
        '<div class="chart">%s</div>'
        '<p class="note">최근 120 거래일 지수 종가입니다. '
        '실제 코스피가 아니라 시가총액 상위 종목으로 세운 대용 지수이며, '
        '실제 코스피와 일간수익률 상관은 %s 입니다.</p>'
        '</div></section>'
        % (chart, fnum((ix.get('validation') or {}).get('corr_daily_return'), 4)))

    # 4. 과거에는 이랬다
    parts.append(
        '<section class="section"><div class="page">'
        '<div class="rule"></div><h2>같은 자리였던 과거, 이후 열흘</h2>'
        '<p class="lead">앞일을 맞힌 것이 아니라 <strong>과거에 같은 국면이던 날들을 세어</strong> '
        '그 뒤 열흘이 어땠는지를 적은 것입니다.</p>'
        '%s</div></section>' % scen_html)

    # 5. 어떻게 읽어야 하나 — 빼지 않는다
    parts.append(
        '<section class="section"><div class="page">'
        '<div class="rule"></div><h2>이 숫자를 어떻게 읽어야 하나</h2>'
        '<div class="callout">'
        '<p><strong>예측이 아니라 지금 상태를 잰 것입니다.</strong> 경보 점수가 높다는 것은 '
        '「지표들이 제 이력의 나쁜 쪽에 들어와 있다」는 뜻이지, 그만큼의 확률로 떨어진다는 '
        '뜻이 아닙니다.</p>'
        '<p><strong>방향을 맞히는 장치가 아니라 대비를 앞당기는 장치입니다.</strong> '
        '과거를 되짚어 보면 경보가 뜬 뒤에도 상당수는 급락으로 가지 않았습니다. '
        '경보 하나를 사고팔 근거로 삼지 마십시오.</p>'
        '<p><strong>표본이 두 해치뿐입니다.</strong> 이보다 긴 이력에서도 같은 성적이 나올지는 '
        '아직 확인되지 않았습니다.</p>'
        '</div></div></section>')

    parts.append(FOOT % {
        'asof': esc(asof),
        'made': esc(D.get('generated_at_kst', '')),
        'year': datetime.datetime.now(KST).year,
    })
    return '\n'.join(parts)


def stat_cards(ix, I):
    def card(label, value, cls=''):
        return ('<div class="stat"><div class="stat-label">%s</div>'
                '<div class="stat-v %s">%s</div></div>' % (esc(label), cls, value))
    chg = ix.get('change_pct')
    chg_cls = 'up' if (chg or 0) > 0 else ('down' if (chg or 0) < 0 else '')
    dd = I.get('drawdown60')
    return (card('지수', format(int(round(ix['close'])), ',')) +
            card('전일 대비', sgn(chg, 2) + '%', chg_cls) +
            card('연 변동성', fnum(I.get('rv20'), 1) + '%') +
            card('60일 고점 대비', fnum(dd, 1) + '%', 'down' if (dd or 0) < 0 else ''))


def md(s):
    """**굵게** 만 허용한다 — 자료에서 온 글에 태그를 열어 주지 않는다."""
    out, bold = [], False
    for i, chunk in enumerate(esc(s).split('**')):
        if i:
            out.append('<strong>' if not bold else '</strong>')
            bold = not bold
        out.append(chunk)
    if bold:
        out.append('</strong>')
    return ''.join(out)


HEAD = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>%(title)s</title>
<style>
  /* 미래에셋 디자인 기준. 글꼴 CDN 은 걸지 않는다 — 인터넷이 막힌 자리에서 열릴 파일이라
     못 받아 올 요청을 넣으면 열릴 때마다 그만큼 기다린다. */
  :root{
    --orange:#F58220; --blue:#043B72; --soft:#FAB072; --active:#CB6015;
    --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C;
    --hair:#CDCECB; --hair-soft:#E5E4E1; --surface:#F7F8FA; --surface-soft:#ECEFF4;
    --up:#C62828; --down:#043B72;
    --space-section:104px; --space-block:56px;
    --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','KoPubDotum_Pro','Malgun Gothic',sans-serif;
  }
  @media (max-width:768px){ :root{ --space-section:72px; --space-block:36px; } }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{font-family:var(--font-kr); background:#fff; color:var(--body);
       font-size:19px; line-height:1.65; -webkit-font-smoothing:antialiased;}
  .page{max-width:1200px;margin:0 auto;padding:0 32px;}
  @media (max-width:768px){ .page{padding:0 20px;} body{font-size:17px;} }

  .hero{background:var(--orange);color:#fff;padding:56px 0 48px;}
  .hero .tag{font-size:14px;letter-spacing:.6px;opacity:.92;margin-bottom:14px;}
  .hero h1{font-size:67px;font-weight:700;line-height:1.1;letter-spacing:-1px;margin:0 0 14px;}
  .hero .sub{font-size:22px;line-height:1.5;margin:0;max-width:52ch;opacity:.96;}
  @media (max-width:768px){ .hero h1{font-size:43px;} .hero .sub{font-size:18px;} }

  .section{padding:var(--space-section) 0 0;}
  .section:last-of-type{padding-bottom:var(--space-section);}
  .rule{height:1px;background:var(--orange);margin-bottom:19px;}
  h2{font-size:26px;font-weight:700;color:var(--ink);margin:0 0 28px;line-height:1.3;}
  @media (max-width:768px){ h2{font-size:22px;} }
  .lead{font-size:19px;margin:0 0 28px;max-width:66ch;}
  .note{font-size:17px;color:var(--muted);margin:19px 0 0;max-width:72ch;line-height:1.55;}

  .grid-2{display:grid;grid-template-columns:minmax(240px,320px) 1fr;gap:38px;align-items:start;}
  @media (max-width:860px){ .grid-2{grid-template-columns:1fr;gap:28px;} }

  .score-box{border:1px solid var(--hair);border-radius:4px;padding:28px;}
  .stat-label{font-size:16px;font-weight:500;letter-spacing:.6px;color:var(--muted);}
  .stat-hero{font-size:67px;font-weight:700;line-height:1;letter-spacing:-.6px;
             font-variant-numeric:tabular-nums;margin:10px 0 4px;}
  @media (max-width:768px){ .stat-hero{font-size:48px;} }
  .grade{font-size:22px;font-weight:700;}
  .score-why{font-size:16px;color:var(--muted);margin:14px 0 0;line-height:1.5;}

  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;
         background:var(--hair-soft);border:1px solid var(--hair-soft);}
  .stat{background:#fff;padding:19px;}
  .stat-v{font-size:26px;font-weight:700;color:var(--ink);
          font-variant-numeric:tabular-nums;margin-top:5px;}
  .stat-v.up{color:var(--up);} .stat-v.down{color:var(--down);}

  .axes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;}
  .axis{border-top:1px solid var(--hair-soft);padding-top:14px;}
  .axis-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
  .axis-name{font-size:22px;font-weight:600;color:var(--ink);}
  .axis-word{font-size:17px;font-weight:600;color:var(--orange);}
  .axis-why{font-size:16px;color:var(--muted);margin:4px 0 12px;line-height:1.45;}
  .track{height:8px;background:var(--surface-soft);border-radius:2px;overflow:hidden;}
  .fill{height:100%%;background:var(--orange);}

  .chart{border:1px solid var(--hair-soft);border-radius:4px;padding:19px 10px 6px;
         background:#fff;}
  .chart svg{display:block;}

  table.data{width:100%%;border-collapse:collapse;font-size:17px;
             border:1px solid var(--hair);}
  table.data thead th{background:var(--soft);color:var(--ink);font-weight:700;font-size:16px;
                      text-align:right;padding:12px 14px;}
  table.data thead th:first-child,table.data thead th:nth-child(2){text-align:left;}
  table.data th[scope=row]{text-align:left;font-weight:600;color:var(--ink);}
  table.data td,table.data th{padding:12px 14px;border-top:1px solid var(--hair-soft);}
  table.data tbody tr:hover{background:var(--surface);}
  table.data .num{text-align:right;font-variant-numeric:tabular-nums;}
  table.data .strong{font-weight:700;color:var(--ink);}
  table.data .rng{color:var(--muted);font-size:16px;}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}

  .callout{background:var(--surface-soft);border-radius:4px;padding:38px;}
  .callout p{margin:0 0 19px;max-width:70ch;}
  .callout p:last-child{margin-bottom:0;}
  @media (max-width:768px){ .callout{padding:24px;} }

  ul.notes{margin:0;padding-left:22px;}
  ul.notes li{margin-bottom:14px;max-width:72ch;}

  footer{border-top:1px solid var(--hair);margin-top:var(--space-section);
         padding:38px 0 56px;font-size:16px;color:var(--muted);}
  footer p{margin:0 0 10px;max-width:80ch;line-height:1.6;}
  footer strong{color:var(--body);}

  @media print{
    body{font-size:13pt;line-height:1.4;}
    .hero{background:#fff !important;color:var(--ink) !important;
          border-bottom:2px solid var(--orange);padding:0 0 19px;}
    .hero h1{font-size:28pt;} .hero .sub{font-size:12pt;}
    .section{padding:28px 0 0;} .page{max-width:100%%;padding:0;}
    .chart,table,.callout,.axis{page-break-inside:avoid;}
    h2{page-break-after:avoid;}
  }
</style>
</head>
<body>
"""

FOOT = """<footer><div class="page">
<p><strong>기준일 %(asof)s · 작성 %(made)s KST</strong></p>
<p>정보 제공 목적의 사내 참고 자료이며 <strong>투자 권유가 아닙니다.</strong>
이 자료의 경보 점수와 확률은 과거 자료를 정해진 방식으로 셈한 결과로, 장래의 수익을
보장하거나 예측하지 않습니다. 투자 판단의 최종 책임은 투자자 본인에게 있으며,
투자 원금의 손실이 발생할 수 있습니다.</p>
<p>지수는 실제 코스피가 아니라 시가총액 상위 종목으로 세운 대용 지수입니다.
고객에게 제시하기 전 준법감시 부서의 확인을 받으십시오.</p>
</div></footer>
</body>
</html>
"""


def main(argv):
    src = 'data/volatility/latest.json'
    out = 'volatility-client.html'
    for i, a in enumerate(argv):
        if a == '--src':
            src = argv[i + 1]
        elif a == '--out':
            out = argv[i + 1]

    p_in = os.path.join(ROOT, src) if not os.path.isabs(src) else src
    if not os.path.exists(p_in):
        raise SystemExit('%s 가 없습니다. 먼저 build_volatility.py 를 돌리십시오.' % src)
    D = json.load(open(p_in, encoding='utf-8'))

    doc = build(D)
    p_out = os.path.join(ROOT, out) if not os.path.isabs(out) else out
    with open(p_out, 'w', encoding='utf-8') as f:
        f.write(doc)

    print('· %s (%.0f KB) — %s 기준, 경보 %s점 %s'
          % (out, os.path.getsize(p_out) / 1024, D['asof'],
             fnum(D['score'].get('total'), 0), D['score'].get('grade')))
    print('  두 번 눌러 바로 열립니다. 인터넷이 없어도 됩니다.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
