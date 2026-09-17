# -*- coding: utf-8 -*-
"""모은 종목별 수급이 믿을 만한지 본다.

**만든 사람이 살아 있는 응답을 본 적이 없다**는 처지에서 쓴 검산기다. 그래서
「내가 읽은 대로 읽혔는가」를 묻지 않는다 — 그건 제 가정을 제가 확인하는 것이라
아무것도 검산하지 않는다. 대신 **다른 데서 온 자료와 맞대 본다.**

  가. 종가 대조   실린 종가가 kr100-data 가지의 일봉 종가와 같은가.
                  날짜를 잘못 짚었거나 표의 칸이 밀렸으면 여기서 어긋난다.
  나. 시장 합 대조 KR100 외국인 순매수의 합이 이미 갖고 있는 **시장 전체 수급**
                  (data/volatility/history.json 의 investors)과 같이 움직이는가.
                  단위를 잘못 잡았거나(주식수↔금액) 부호를 뒤집었으면 상관이 무너진다.
                  **이 검사가 제일 세다** — 내 파싱과 아무 관련 없는 출처다.
  다. 꼴 점검     날짜가 오름차순인가, 계열 길이가 맞는가, 보유율이 0~100 인가,
                  없는 것이 0 으로 채워지지 않았는가.

가·나가 통과하면 「대충 맞게 읽고 있다」고 말할 근거가 생긴다. 통과하지 못하면
**파서가 틀렸다는 뜻이므로 커밋하지 않는다.**
"""

import json
import math
import os
import statistics as st
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FAILS = []
WARNS = []
CHECKS = [0]


def fail(msg):
    FAILS.append(msg)


def warn(msg):
    WARNS.append(msg)


def check(cond, msg):
    CHECKS[0] += 1
    if not cond:
        fail(msg)
    return cond


def load_chart(sym):
    r = subprocess.run(['git', '-C', ROOT, 'show',
                        'origin/kr100-data:data/kr100/chart/%s.json' % sym],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout).get('daily') or {}
    if not d.get('d'):
        return None
    return {d['d'][i]: d['c'][i] for i in range(len(d['d'])) if d['c'][i] is not None}


def pearson(xs, ys):
    if len(xs) < 5:
        return None
    mx, my = st.mean(xs), st.mean(ys)
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if not sx or not sy:
        return None
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy)


# ─────────────────────────────────────────────────────────────────────
# 가. 종가 대조
# ─────────────────────────────────────────────────────────────────────

def verify_closes(doc, sample=25):
    syms = sorted(doc['stocks'])
    step = max(1, len(syms) // sample)
    checked = matched = 0
    bad = []
    for sym in syms[::step][:sample]:
        chart = load_chart(sym)
        if not chart:
            warn('%s 일봉을 읽지 못해 종가를 대조하지 못했습니다' % sym)
            continue
        s = doc['stocks'][sym]
        for d, c in zip(s.get('d') or [], s.get('c') or []):
            if c is None or d not in chart:
                continue
            checked += 1
            # 수정주가 때문에 소수점 아래가 다를 수 있다. 0.5% 를 넘으면 다른 값이다.
            if abs(c - chart[d]) <= max(1.0, chart[d] * 0.005):
                matched += 1
            elif len(bad) < 8:
                bad.append('%s %s 수급파일 %.0f vs 일봉 %.0f' % (sym, d, c, chart[d]))
    if not checked:
        fail('종가를 한 건도 대조하지 못했습니다 — 날짜가 일봉과 전혀 안 겹칩니다')
        return
    rate = matched / checked * 100
    CHECKS[0] += 1
    sys.stderr.write('종가 대조 %d 건 가운데 %d 건 일치 (%.1f%%)\n' % (checked, matched, rate))
    if rate < 95:
        fail('종가 일치율 %.1f%% — 날짜를 잘못 짚었거나 표의 칸이 밀렸을 수 있습니다. %s'
             % (rate, ' / '.join(bad)))


# ─────────────────────────────────────────────────────────────────────
# 나. 시장 전체 수급과 맞대기 — **제일 센 검사**
# ─────────────────────────────────────────────────────────────────────

MIN_OVERLAP = 10
MIN_CORR = 0.5


def verify_against_market(doc):
    """KR100 외국인 순매수 합 vs 시장 전체 외국인 순매수.

    KR100 은 코스피 시총의 큰 몫이라 둘은 같이 움직여야 한다. 완전히 같을 수는
    없다 — KR100 에는 코스닥 종목이 섞이고, 시장 전체에는 KR100 밖 종목이 다
    들어가기 때문이다. 그래서 **크기**가 아니라 **같이 움직이는가**를 본다.

    부호를 뒤집어 읽었으면 상관이 음수로 나온다. 주식수를 금액으로 착각했으면
    종목마다 주가가 달라 합이 엉켜 상관이 무너진다. 칸이 밀려 거래량을 순매수로
    읽었으면 **언제나 양수**가 되어 역시 무너진다.
    """
    hp = os.path.join(ROOT, 'data', 'volatility', 'history.json')
    if not os.path.exists(hp):
        warn('시장 전체 수급 파일이 없어 맞대 보지 못했습니다')
        return
    mkt = {r['d']: r.get('foreign') for r in
           ((json.load(open(hp, encoding='utf-8')).get('flows') or {}).get('investors') or [])
           if r.get('foreign') is not None}
    if not mkt:
        warn('시장 전체 수급이 비어 있어 맞대 보지 못했습니다')
        return

    total = {}
    for s in doc['stocks'].values():
        for d, f in zip(s.get('d') or [], s.get('f') or []):
            if f is not None:
                total[d] = total.get(d, 0.0) + f

    days = sorted(set(total) & set(mkt))
    if len(days) < MIN_OVERLAP:
        warn('시장 전체 수급과 겹치는 날이 %d 일뿐이라 맞대 보지 못했습니다 '
             '(적어도 %d 일 필요). 자료가 쌓이면 이 검사가 켜집니다.'
             % (len(days), MIN_OVERLAP))
        return

    xs = [total[d] for d in days]
    ys = [mkt[d] for d in days]
    r = pearson(xs, ys)
    CHECKS[0] += 1
    sys.stderr.write('시장 합 대조 %d 일, 상관 %s\n'
                     % (len(days), 'None' if r is None else '%.3f' % r))
    if r is None:
        fail('시장 전체 수급과의 상관을 셈하지 못했습니다')
        return
    if r < MIN_CORR:
        fail('KR100 외국인 순매수 합이 시장 전체 수급과 따로 놉니다 (상관 %.3f, %d일). '
             '%s' % (r, len(days),
                     '부호가 뒤집혔을 수 있습니다' if r < -0.2 else
                     '단위를 잘못 잡았거나 표의 칸이 밀렸을 수 있습니다'))
    # 크기도 본다 — KR100 합이 시장 전체보다 **크면** 말이 안 된다
    if xs and ys:
        ratio = (sum(abs(x) for x in xs) / len(xs)) / max(1e-9, (sum(abs(y) for y in ys) / len(ys)))
        CHECKS[0] += 1
        sys.stderr.write('크기 비 (KR100 합 ÷ 시장 전체) %.2f\n' % ratio)
        if ratio > 3.0:
            fail('KR100 합이 시장 전체의 %.1f 배입니다 — 단위가 틀렸을 가능성이 큽니다'
                 % ratio)


# ─────────────────────────────────────────────────────────────────────
# 다. 꼴 점검
# ─────────────────────────────────────────────────────────────────────

def verify_shape(doc):
    check(bool(doc.get('unit')), '단위를 적지 않았습니다')
    check(bool(doc.get('derivation')), '순매수를 어떻게 억원으로 바꿨는지 적지 않았습니다')
    cov = doc.get('coverage') or {}
    check('days' in cov and 'stocks' in cov, '적재 범위를 적지 않았습니다')

    zero_filled = 0
    for sym, s in doc['stocks'].items():
        ds = s.get('d') or []
        if not ds:
            continue
        check(ds == sorted(ds), '%s 날짜가 오름차순이 아닙니다' % sym)
        check(len(set(ds)) == len(ds), '%s 날짜가 겹칩니다' % sym)
        for k in ('c', 'f', 'i', 'p', 'r'):
            check(len(s.get(k) or []) == len(ds),
                  '%s %s 계열 길이가 날짜와 다릅니다 (%d vs %d)'
                  % (sym, k, len(s.get(k) or []), len(ds)))
        for rr in (s.get('r') or []):
            if rr is not None:
                check(0 <= rr <= 100, '%s 외국인 보유율이 %.2f 입니다' % (sym, rr))
        # 0 으로 메운 흔적 — 순매수가 **정확히** 0 인 날이 너무 많으면 의심스럽다
        fs = [x for x in (s.get('f') or []) if x is not None]
        if fs and sum(1 for x in fs if x == 0) > len(fs) * 0.5:
            zero_filled += 1
    if zero_filled:
        fail('%d 종목에서 외국인 순매수가 절반 넘게 정확히 0 입니다 — 없는 것을 '
             '0 으로 메웠을 수 있습니다' % zero_filled)


def main(argv):
    path = argv[argv.index('--in') + 1] if '--in' in argv else \
        os.path.join(ROOT, 'data', 'flows', 'kr100.json')
    if not os.path.exists(path):
        sys.stderr.write('::error::%s 가 없습니다\n' % path)
        return 1
    doc = json.load(open(path, encoding='utf-8'))

    verify_shape(doc)
    verify_closes(doc)
    verify_against_market(doc)

    lines = ['검산 %d 가지' % CHECKS[0], '']
    if WARNS:
        lines.append('아직 재지 못한 것 %d' % len(WARNS))
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
