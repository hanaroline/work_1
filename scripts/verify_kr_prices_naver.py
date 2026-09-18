#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""네이버 일봉이 믿을 만한지 보고, **야후와 얼마나 어긋나는지 잰다.**

이 대본이 답해야 하는 질문은 둘이다.

  하나. 네이버 일봉 자체가 말이 되는가   — 한쪽 자료만으로 답할 수 있다
  둘.   야후와 어디서 얼마나 갈리는가     — 두 자료를 맞대야 답할 수 있다

**둘째는 「어느 쪽이 맞는가」에 스스로 답하지 못한다.** 두 벤더가 다르다는 사실만
재는 것이고, 심판은 제3의 출처가 있어야 한다. 그래서 갈림을 실패로 적지 않고
**크기와 모양을 적어 사람이 판단할 재료로 남긴다.**

**그 제3의 출처가 2026-09-18 에 생겼다.** 한국투자증권 오픈API 로 100 종목 496
거래일을 받아 심판했고(scripts/verify_kr_prices_kis.py), 판정문이
data/prices_kis/verdict.txt 에 있다. 이 대본은 그 판정문을 **읽어서** 적는다 —
숫자를 여기 박아 두면 다시 심판했을 때 두 곳이 어긋나기 때문이다.

다만 한 가지는 가릴 수 있다 — **한쪽 종가가 다른 쪽 고저 범위를 벗어나면** 그 종가는
그 세션의 것일 수 없다. 그 건수를 양쪽 모두에 대해 센다. 한쪽에만 쏠리면 그쪽이
그 세션 가격을 안 쓰고 있다는 뜻이다.

  python3 scripts/verify_kr_prices_naver.py
"""

import json
import math
import os
import re
import statistics as st
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IN = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')

FAILS, WARNS, CHECKS = [], [], [0]


def fail(m):
    FAILS.append(m)


def warn(m):
    WARNS.append(m)


def check(cond, m):
    CHECKS[0] += 1
    if not cond:
        fail(m)
    return cond


def yahoo_bars(sym):
    r = subprocess.run(['git', '-C', ROOT, 'show',
                        'origin/kr100-data:data/kr100/chart/%s.json' % sym],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout).get('daily') or {}
    if not d.get('d'):
        return None
    return {d['d'][i]: (d['o'][i], d['h'][i], d['l'][i], d['c'][i], d['v'][i])
            for i in range(len(d['d']))}


# ─────────────────────────────────────────────────────────────────────
# 하나. 네이버 일봉 자체가 말이 되는가
# ─────────────────────────────────────────────────────────────────────

def verify_self(doc):
    bad_ohlc = bad_order = dup = 0
    zero_v = 0
    n_bars = 0
    for sym, s in doc['stocks'].items():
        ds = s['d']
        check(ds == sorted(ds), '%s 날짜가 오름차순이 아닙니다' % sym)
        if len(set(ds)) != len(ds):
            dup += 1
        ragged = False
        for k in ('o', 'h', 'l', 'c', 'v'):
            if not check(len(s[k]) == len(ds),
                         '%s %s 계열 길이가 날짜와 다릅니다 (%d vs %d)'
                         % (sym, k, len(s[k]), len(ds))):
                ragged = True
        # 길이가 어긋난 종목은 봉을 하나씩 짚지 않는다 — 여기서 터지면 **검산기가
        # 보고를 못 하고 죽는다.** 흠을 잡으라고 만든 것이 흠 앞에서 넘어지면
        # 아무것도 지켜 주지 못한다. 길이 어긋남은 위에서 이미 실패로 적었다.
        if ragged:
            continue
        for i in range(len(ds)):
            o, h, l, c, v = s['o'][i], s['h'][i], s['l'][i], s['c'][i], s['v'][i]
            n_bars += 1
            if None in (o, h, l, c):
                bad_ohlc += 1
                continue
            # **봉의 뜻 자체** — 고가는 시·종보다 낮을 수 없고 저가는 높을 수 없다.
            # 칸이 밀려 읽혔으면 여기서 무너진다.
            if h < l or h < max(o, c) or l > min(o, c):
                bad_order += 1
            if not v:
                zero_v += 1
    check(dup == 0, '%d 종목에서 날짜가 겹칩니다' % dup)
    check(bad_ohlc == 0, '%d 봉에서 시·고·저·종 가운데 빈 칸이 있습니다' % bad_ohlc)
    check(bad_order == 0,
          '%d 봉에서 고가<저가 따위로 봉이 말이 안 됩니다 — 칸이 밀렸을 수 있습니다'
          % bad_order)
    if zero_v > n_bars * 0.05:
        warn('거래량이 0 인 봉이 %d 개(%.1f%%)입니다' % (zero_v, zero_v / n_bars * 100))
    sys.stderr.write('네이버 일봉 자체 점검 — 봉 %d, 어긋난 봉 %d\n' % (n_bars, bad_order))


# ─────────────────────────────────────────────────────────────────────
# 둘. 야후와 맞대 보기 — **어느 쪽이 맞는지가 아니라 얼마나 다른지**
# ─────────────────────────────────────────────────────────────────────

def verify_against_yahoo(doc, sample=40):
    syms = sorted(doc['stocks'])
    step = max(1, len(syms) // sample)
    pairs = 0
    rels = []
    naver_out = yahoo_out = 0     # 한쪽 종가가 상대 고저를 벗어난 건수
    only_n = only_y = 0
    worst = []
    # 첫 판에서 어긋남이 **날짜로 뭉치는** 것이 보였다 — 2024-11-07 은 본 다섯 종목
    # 모두에서 어긋났다. 종목이 아니라 날짜로 뭉친다면 그건 벤더의 잡음이 아니라
    # 그날 무슨 일이 있었다는 뜻이다. 그래서 날짜별로 센다.
    by_date = {}
    ohl_same = ohl_diff = 0       # 어긋난 봉에서 시·고·저까지 같은가
    n_days = {}                   # 날짜별 대조한 봉 수 — 뭉침을 재려면 분모가 필요하다
    only_n_days, only_y_days = [], []

    for sym in syms[::step][:sample]:
        yb = yahoo_bars(sym)
        if not yb:
            continue
        s = doc['stocks'][sym]
        nd = {s['d'][i]: (s['o'][i], s['h'][i], s['l'][i], s['c'][i], s['v'][i])
              for i in range(len(s['d']))}
        lo = max(min(nd), min(yb)) if nd and yb else None
        if lo is None:
            continue
        a = [d for d in nd if d >= lo and d not in yb]
        b = [d for d in yb if d >= lo and d not in nd]
        only_n += len(a); only_y += len(b)
        only_n_days += [(sym, d) for d in a]
        only_y_days += [(sym, d) for d in b]
        for d in sorted(set(nd) & set(yb)):
            no, nh, nl, nc, _ = nd[d]
            yo, yh, yl, yc, _ = yb[d]
            if None in (nc, yc, nh, nl, yh, yl):
                continue
            pairs += 1
            n_days[d] = n_days.get(d, 0) + 1
            rel = (nc - yc) / yc * 100
            rels.append(rel)
            if abs(rel) > 0.005:
                by_date[d] = by_date.get(d, 0) + 1
                # **시·고·저까지 같은데 종가만 다른가?** 그렇다면 「다른 세션을
                # 보고 있다」가 아니라 「같은 세션의 마감값을 다르게 적었다」는 뜻이다.
                if (no, nh, nl) == (yo, yh, yl):
                    ohl_same += 1
                else:
                    ohl_diff += 1
            # **가릴 수 있는 한 가지** — 상대의 고저 범위를 벗어난 종가는
            # 그 세션의 종가일 수 없다.
            if nc > yh or nc < yl:
                naver_out += 1
            if yc > nh or yc < nl:
                yahoo_out += 1
            if abs(rel) > 0.5 and len(worst) < 25:
                worst.append('%-11s %s  네이버 %9.0f  야후 %9.0f  (%+.2f%%) '
                             '| 야후 고저 %.0f~%.0f | 네이버 고저 %.0f~%.0f'
                             % (sym, d, nc, yc, rel, yl, yh, nl, nh))

    if not pairs:
        fail('야후와 겹치는 봉이 하나도 없습니다 — 날짜나 종목코드가 어긋납니다')
        return

    CHECKS[0] += 1
    diff = [x for x in rels if abs(x) > 0.005]
    agree = (pairs - len(diff)) / pairs * 100
    ab = sorted(abs(x) for x in diff)
    sys.stderr.write(
        '\n야후 대조 %d 봉 — 같은 값 %.1f%%, 어긋난 %d 건\n' % (pairs, agree, len(diff)))
    if ab:
        sys.stderr.write('  상대차 중앙 %.2f%% · 90분위 %.2f%% · 최대 %.2f%% · '
                         '네이버가 높은 건 %d / 낮은 건 %d\n'
                         % (ab[len(ab) // 2], ab[int(len(ab) * 0.9)], ab[-1],
                            sum(1 for x in diff if x > 0), sum(1 for x in diff if x < 0)))
    sys.stderr.write('  거래일 어긋남 — 네이버에만 %d · 야후에만 %d\n' % (only_n, only_y))
    if only_n_days or only_y_days:
        sys.stderr.write('    네이버에만: %s\n'
                         % ', '.join('%s %s' % x for x in only_n_days[:12]))
        sys.stderr.write('    야후에만:   %s\n'
                         % ', '.join('%s %s' % x for x in only_y_days[:12]))
    if diff:
        sys.stderr.write('  **어긋난 봉에서 시·고·저는** — 똑같음 %d 건 · 다름 %d 건\n'
                         % (ohl_same, ohl_diff))
        # 날짜로 뭉치는가 — 그 날 대조한 봉 가운데 몇이 어긋났는지로 본다
        top = sorted(by_date.items(), key=lambda kv: -kv[1])[:12]
        sys.stderr.write('  어긋남이 많은 날 (그날 대조한 봉 대비)\n')
        for d, k in top:
            sys.stderr.write('    %s  %d/%d 종목\n' % (d, k, n_days.get(d, 0)))
        # 최근 20 거래일에 얼마나 몰렸는가 — 신호가 제일 많이 쓰는 봉이다
        alld = sorted(n_days)
        recent = set(alld[-20:])
        rn = sum(v for d, v in by_date.items() if d in recent)
        rb = sum(v for d, v in n_days.items() if d in recent)
        sys.stderr.write('  최근 20 거래일 — 어긋남 %d/%d (%.1f%%), 그 앞 전체 %d/%d (%.1f%%)\n'
                         % (rn, rb, (rn / rb * 100 if rb else 0),
                            len(diff) - rn, pairs - rb,
                            ((len(diff) - rn) / (pairs - rb) * 100) if pairs - rb else 0))
    sys.stderr.write('  **상대 고저를 벗어난 종가** — 네이버 종가 %d 건 · 야후 종가 %d 건\n'
                     % (naver_out, yahoo_out))
    if worst:
        sys.stderr.write('\n0.5%% 넘게 어긋난 건 (일부)\n')
        for w in worst:
            sys.stderr.write('  %s\n' % w)
        sys.stderr.write('\n')

    # ── 거래일 어긋남을 **어느 쪽 문제로 볼 것인가** ────────────────
    #
    # 처음에는 「한 날이라도 어긋나면 실패」로 두었다. 실제로 걸렸고, 어긋난 날을
    # 찍어 보니 **다섯 종목 모두 2025-09-19 하나**였다 — 네이버에는 있고 야후에는
    # 없다. 저장소의 야후 일봉 100 종목을 전부 뒤져 보니 그날이 **한 종목도 없었고**,
    # 금요일이며 공휴일이 아니다(앞뒤로 09-18 목, 09-22 월이 다 있다).
    #
    # 곧 이 검사는 **야후가 빠뜨린 세션을 네이버 자료의 흠으로 적고 있었다.**
    # 재는 대상을 바로잡는다 — 느슨하게 고치는 것이 아니다.
    #
    #   야후에만 있는 날 → 네이버가 세션을 빠뜨린 것이다. **실패.**
    #   네이버에만 있는 날 → 야후가 빠뜨린 것이다. 네이버 자료의 흠이 아니라
    #                        **야후에 대해 알아 둘 것**이다. 창을 쓰는 지표(이동평균·
    #                        RSI·매물대)는 빠진 세션만큼 다른 날들을 보게 된다.
    check(only_y == 0,
          '네이버가 세션을 %d 일 빠뜨렸습니다 (야후에는 있는 날): %s'
          % (only_y, ', '.join('%s %s' % x for x in only_y_days[:6])))
    if only_n:
        ds = sorted({d for _, d in only_n_days})
        warn('**야후가 거래일을 %d 일 빠뜨렸습니다** (네이버에는 있는 날: %s). '
             '이동평균·RSI·매물대처럼 창을 쓰는 지표는 빠진 세션만큼 실제와 다른 '
             '날들을 보게 됩니다. 네이버 자료의 흠이 아니라 야후 쪽 결손입니다.'
             % (len(ds), ', '.join(ds[:6])))

    # 중앙값이 크게 벌어지면 단위나 수정주가 기준이 다른 것이다
    if ab:
        check(ab[len(ab) // 2] < 3.0,
              '종가 상대차 중앙값이 %.2f%% 입니다 — 벤더 차이로 보기에 큽니다' % ab[len(ab) // 2])

    # **여기서부터는 판정이 아니라 기록이다.**
    if diff:
        side = ('네이버' if naver_out > yahoo_out * 2 else
                '야후' if yahoo_out > naver_out * 2 else None)
        msg = ('두 출처가 종가를 %.1f%% 만 같게 봅니다(어긋난 %d 건, 중앙 %.2f%% · '
               '최대 %.2f%%). 상대의 고저 범위를 벗어난 종가는 네이버 %d 건 · 야후 %d 건입니다. '
               % (agree, len(diff), ab[len(ab) // 2], ab[-1], naver_out, yahoo_out))
        if side:
            msg += ('**%s 쪽이 그 세션 가격을 안 쓰는 쪽으로 기웁니다** — 한쪽에 쏠렸습니다. '
                    % side)
        # 판정문이 있으면 「심판할 수 없습니다」를 적지 않는다. 둘을 나란히 적으면
        # 못 했다는 말과 했다는 말이 한 문단에 들어가 읽는 사람을 헷갈리게 한다.
        verdict = kis_verdict()
        if verdict:
            msg += verdict
        else:
            if not side:
                msg += '어느 쪽으로도 쏠리지 않습니다. '
            msg += ('**이 자료만으로는 심판할 수 없습니다** — 지표의 기준을 바꾸려면 '
                    '제3의 출처(거래소 공시)가 필요합니다.')
        warn(msg)


def kis_verdict():
    """증권사 원본으로 심판한 결과가 있으면 그것을 적는다.

    **이 자리가 오래 「제3의 출처가 필요합니다」로 끝나 있었다.** 두 벤더를 맞대는
    것만으로는 누가 옳은지 말할 수 없기 때문이다(고저를 벗어난 종가가 네이버 629 ·
    야후 629 로 정확히 동점이었다). 2026-09-18 에 한국투자증권 오픈API 로 그 심판을
    했고, 판정문이 data/prices_kis/verdict.txt 에 있다.

    판정문을 **읽어서** 적는다. 숫자를 여기 박아 두면 다시 심판했을 때 두 곳이
    어긋난다 — 이 대본은 날마다 세 번 도는데 판정은 이따금 갱신되므로, 낡은
    숫자를 계속 찍어 내게 된다. 판정문이 없으면 예전처럼 「필요합니다」로 적는다.
    """
    path = os.path.join(ROOT, 'data', 'prices_kis', 'verdict.txt')
    if not os.path.exists(path):
        return ''
    try:
        body = open(path, encoding='utf-8').read()
    except OSError:
        return ''

    got = {}
    for who in ('네이버', '야후'):
        m = re.search(who + r'가 맞았다\s+(\d+) 건\s+\(([\d.]+)%\)', body)
        if m:
            got[who] = (int(m.group(1)), float(m.group(2)))
    if len(got) != 2:
        return ('심판은 했습니다 — data/prices_kis/verdict.txt 를 보십시오.')

    win = max(got, key=lambda k: got[k][1])
    out = ('**심판했습니다** — 한국투자증권 원본과 맞대어 %s 가 %.1f%% 로 맞습니다'
           '(%s %.1f%%). 판정문 data/prices_kis/verdict.txt. '
           % (win, got[win][1],
              '야후' if win == '네이버' else '네이버',
              got['야후' if win == '네이버' else '네이버'][1]))

    # 최근 봉이 뒤집히는지도 함께 적는다. 신호가 제일 많이 쓰는 봉이라
    # 전체 승패만 적으면 오해를 부른다.
    m = re.search(r'최근 (\d+)봉.*?네이버 ([\d.]+)% · 야후 ([\d.]+)%', body)
    if m:
        n_recent, y_recent = float(m.group(2)), float(m.group(3))
        if (n_recent > 50) != (got['네이버'][1] > 50):
            out += ('다만 **최근 %s봉은 뒤집힙니다** — 거기서는 %s 가 %.1f%% 로 맞습니다. '
                    '진 쪽이 확정 전 잠정치를 보여 주는 것으로 읽힙니다. '
                    % (m.group(1),
                       '네이버' if n_recent > y_recent else '야후',
                       max(n_recent, y_recent)))
    return out


def main(argv):
    path = argv[argv.index('--in') + 1] if '--in' in argv else IN
    if not os.path.exists(path):
        sys.stderr.write('::error::%s 가 없습니다 — 먼저 fetch_kr_prices_naver.py 를 돌리십시오\n'
                         % path)
        return 1
    doc = json.load(open(path, encoding='utf-8'))
    if not doc.get('stocks'):
        sys.stderr.write('::error::받은 종목이 없습니다\n')
        return 1

    check(bool(doc.get('unit')), '단위를 적지 않았습니다')
    check(bool(doc.get('routes_used')), '어느 길로 받았는지 적지 않았습니다')
    verify_self(doc)
    verify_against_yahoo(doc)

    lines = ['검산 %d 가지' % CHECKS[0],
             '길 %s' % json.dumps(doc.get('routes_used'), ensure_ascii=False), '']
    if WARNS:
        lines.append('알아 둘 것 %d' % len(WARNS))
        for w in WARNS[:10]:
            lines.append('  · %s' % w)
        lines.append('')
    if FAILS:
        lines.append('실패 %d' % len(FAILS))
        for f in FAILS[:30]:
            lines.append('  - %s' % f)
    else:
        lines.append('실패 없음')
    out = '\n'.join(lines)
    print(out)
    open(os.path.join(os.path.dirname(path), 'verify.txt'), 'w',
         encoding='utf-8').write(out + '\n')
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
