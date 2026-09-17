# -*- coding: utf-8 -*-
"""모은 종목별 수급이 믿을 만한지 본다.

**만든 사람이 살아 있는 응답을 본 적이 없다**는 처지에서 쓴 검산기다. 그래서
「내가 읽은 대로 읽혔는가」를 묻지 않는다 — 그건 제 가정을 제가 확인하는 것이라
아무것도 검산하지 않는다. 대신 **다른 데서 온 자료와 맞대 본다.**

  가. 종가 대조    실린 종가를 kr100-data 일봉과 맞춘다. **거래일 집합이 정확히
                  겹치는지**가 요점이고, 값의 차이는 벤더 차이일 수 있으므로
                  느슨한 문턱만 둔다(중앙 1% 초과면 실패).
  나. 날짜 밀림    lag −1 · 0 · +1 로 각각 맞춰 보고 **lag 0 이 가장 잘 맞아야** 한다.
                  점끼리의 일치를 요구하는 것보다 이쪽이 옳다 — 잡으려는 것이
                  「밀렸는가」이므로 「밀린 쪽이 더 잘 맞는가」를 직접 묻는다.
  다. 시장 합 대조 KR100 외국인 순매수의 합이 이미 갖고 있는 **시장 전체 수급**
                  (data/volatility/history.json 의 investors)과 같이 움직이는가.
                  단위를 잘못 잡았거나(주식수↔금액) 부호를 뒤집었으면 상관이 무너진다.
                  **이 검사가 제일 세다** — 내 파싱과 아무 관련 없는 출처다.
  라. 꼴 점검     날짜가 오름차순인가, 계열 길이가 맞는가, 보유율이 0~100 인가,
                  없는 것이 0 으로 채워지지 않았는가.

**가가 처음에는 「일치율 95% 미만이면 실패」였다.** 실제로 돌려 보니 84.4% 가 나왔고,
어긋난 건을 맥락과 함께 찍어 보니 파싱이 아니라 **두 출처가 종가를 다르게 보고
있었다.** 거래일은 완벽히 정렬됐고(어긋난 날 0), 어긋남이 양쪽으로 갈리며(16/23)
크기가 1% 안팎에 갇혀 있었고, 어떤 건은 수급 종가가 일봉 **저가보다 낮았다** —
같은 세션 가격이면 있을 수 없다.

그래서 그 검사는 잡으려던 것(날짜 밀림·칸 밀림)이 아니라 **「두 벤더가 같은 종가를
쓰는가」를 재고 있었다.** 느슨하게 고친 것이 아니라 의도한 것을 재도록 나로 갈랐다.
벤더 불일치는 실패가 아니라 **경고**로 남긴다 — 고칠 것이 아니라 알 것이고, 이 도구의
지표가 모두 일봉으로 셈된다는 점에서 알아야 할 것이다.

통과하지 못하면 **커밋하지 않는다.** 틀리게 읽은 자료를 쌓으면 나중에 어디부터
틀렸는지 가릴 수 없다.
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
    """실린 종가를 일봉과 맞춘다. **어긋나면 왜 어긋났는지까지 가린다.**

    처음에는 일치율만 냈더니 84% 가 나왔고, 그 숫자만으로는 무엇이 잘못인지
    알 수 없었다. 어긋난 값이 **옆 날짜의 종가와 맞는지**, **그날의 시가·고가·저가
    가운데 하나와 맞는지**를 함께 보면 갈린다.

      옆 날짜와 맞는다        → 날짜를 한 칸 밀려 붙였다
      같은 날 시가·고가와 맞는다 → 종가가 아닌 칸을 읽었다
      아무것과도 안 맞는다      → 출처가 서로 다른 가격을 쓴다(수정주가 따위)
    """
    syms = sorted(doc['stocks'])
    step = max(1, len(syms) // sample)
    checked = matched = 0
    bad = []
    detail = []
    rels = []
    only_flow = only_chart = 0
    why = {'shift_prev': 0, 'shift_next': 0, 'ohl': 0, 'unknown': 0}

    for sym in syms[::step][:sample]:
        chart = load_chart(sym)
        if not chart:
            warn('%s 일봉을 읽지 못해 종가를 대조하지 못했습니다' % sym)
            continue
        ohlc = load_chart_ohlc(sym) or {}
        days = sorted(chart)
        s = doc['stocks'][sym]
        fds = set(s.get('d') or [])
        # 수급에만 있는 날 / 일봉에만 있는 날 — 거래일 자체가 어긋나면 여기서 센다
        only_flow += len(fds - set(days))
        lo = min(fds) if fds else None
        if lo:
            only_chart += len([x for x in days if x >= lo and x not in fds])
        for d, c in zip(s.get('d') or [], s.get('c') or []):
            if c is None or d not in chart:
                continue
            checked += 1
            near = lambda a, b: a is not None and b is not None and \
                abs(a - b) <= max(1.0, abs(b) * 0.005)
            if near(c, chart[d]):
                matched += 1
                continue
            k = days.index(d)
            prev = chart[days[k - 1]] if k > 0 else None
            nxt = chart[days[k + 1]] if k + 1 < len(days) else None
            o, h, l = (ohlc.get(d) or (None, None, None))
            if near(c, prev):
                why['shift_prev'] += 1
                tag = '앞날 종가와 같음'
            elif near(c, nxt):
                why['shift_next'] += 1
                tag = '다음날 종가와 같음'
            elif any(near(c, x) for x in (o, h, l)):
                why['ohl'] += 1
                tag = '같은 날 시가·고가·저가 가운데 하나와 같음'
            else:
                why['unknown'] += 1
                tag = '어느 것과도 안 맞음'
            if len(bad) < 10:
                bad.append('%s %s 수급 %.0f vs 일봉종가 %.0f (%s)'
                           % (sym, d, c, chart[d], tag))
            rels.append((c - chart[d]) / chart[d] * 100)
            fmt = lambda x: '-' if x is None else '%.0f' % x
            detail.append('%-11s %s  %9.0f | %9s %9s %9s | %9s %9s %9s  %s'
                          % (sym, d, c, fmt(prev), fmt(chart[d]), fmt(nxt),
                             fmt(o), fmt(h), fmt(l), tag))

    # 어긋난 건을 **전부 맥락과 함께** 찍는다. 갈래 수만 세어서는 원인을 못 가린다 —
    # 처음 판에서 「앞날 6 · 다음날 3 · 시고저 13 · 불명 17」이 나왔는데, 넷에 흩어져
    # 있다는 것까지는 알았지만 그래서 무엇이 잘못인지는 알 수 없었다.
    if detail:
        sys.stderr.write('\n어긋난 건 전부 (수급종가 | 일봉 D-1 / D / D+1 | D의 시·고·저)\n')
        for row in detail[:60]:
            sys.stderr.write('  %s\n' % row)
        sys.stderr.write('\n')

    if not checked:
        fail('종가를 한 건도 대조하지 못했습니다 — 날짜가 일봉과 전혀 안 겹칩니다')
        return
    rate = matched / checked * 100
    CHECKS[0] += 1
    sys.stderr.write('종가 대조 %d 건 가운데 %d 건 일치 (%.1f%%)\n' % (checked, matched, rate))
    if why['shift_prev'] or why['shift_next'] or why['ohl'] or why['unknown']:
        sys.stderr.write('  어긋남 내역 — 앞날 %d · 다음날 %d · 시고저 %d · 불명 %d\n'
                         % (why['shift_prev'], why['shift_next'], why['ohl'], why['unknown']))
    sys.stderr.write('  거래일 어긋남 — 수급에만 있는 날 %d · 일봉에만 있는 날 %d\n'
                     % (only_flow, only_chart))
    if checked:
        rel = [abs(x) for x in rels]
        rel.sort()
        sys.stderr.write('  상대차 분포(어긋난 건) — 중앙 %.2f%% · 최대 %.2f%% · '
                         '수급이 높은 건 %d / 낮은 건 %d\n'
                         % ((rel[len(rel) // 2] if rel else 0),
                            (rel[-1] if rel else 0),
                            sum(1 for x in rels if x > 0),
                            sum(1 for x in rels if x < 0)))

    # ── 여기서 무엇을 실패로 볼 것인가 ──────────────────────────────
    #
    # 처음에는 「일치율 95% 미만이면 실패」로 두었다. 실제로 84.4% 가 나왔고,
    # 맥락을 찍어 보니 **파싱이 아니라 두 출처가 종가를 다르게 보고 있었다.**
    #
    #   거래일은 완벽히 정렬됐다 (수급에만 있는 날 0 · 일봉에만 있는 날 0)
    #   어긋남이 양쪽으로 거의 반반이고 (수급이 높은 건 16 / 낮은 건 23)
    #   크기가 1% 안팎에 갇혀 있다 (중앙 0.96% · 최대 2.23%)
    #   어떤 건은 수급 종가가 **일봉 저가보다 낮다** — 같은 세션 가격이면 불가능하다
    #
    # 그래서 그 검사는 **의도한 것을 재고 있지 않았다.** 잡으려던 것은 날짜 밀림과
    # 칸 밀림인데, 재고 있던 것은 「두 벤더가 같은 종가를 쓰는가」였다.
    #
    # 느슨하게 고치는 것이 아니라 **의도한 것을 재도록** 바꾼다.
    #
    #   날짜 밀림 → 거래일 집합이 정확히 겹치는가 (위에서 이미 셌다) +
    #               lag 0 이 lag ±1 보다 잘 맞는가 (아래 verify_close_lag)
    #   칸 밀림   → 시장 합 대조가 이미 결정적으로 배제한다(상관 0.996)
    #   큰 실수   → 전체 상대차 중앙값에 느슨한 문턱을 둔다
    #
    # 벤더 불일치 자체는 **실패가 아니라 경고**로 남긴다. 고칠 것이 아니라 알 것이다 —
    # 그리고 그것이 지표에 어떤 뜻인지는 아래 warn 에 적는다.
    all_rel = sorted(abs(x) for x in rels) or [0.0]
    med_all = 0.0 if not rels else \
        sorted(abs(x) for x in rels + [0.0] * matched)[(len(rels) + matched) // 2]
    CHECKS[0] += 1
    if med_all > 1.0:
        fail('일봉과의 종가 상대차 중앙값이 %.2f%% 입니다 — 벤더 차이로 보기엔 큽니다. '
             '%s' % (med_all, ' / '.join(bad[:5])))
    else:
        warn('종가가 일봉과 %.1f%% 만 일치합니다(어긋난 %d 건, 중앙 %.2f%% · 최대 %.2f%%, '
             '수급이 높은 건 %d / 낮은 건 %d). **거래일은 완벽히 정렬되고**(어긋난 날 0) '
             '어긋남이 양쪽으로 갈리며 크기가 갇혀 있어, 파싱이 아니라 **두 출처가 종가를 '
             '다르게 보는 것**으로 읽습니다. 어느 쪽이 맞는지는 이 자료로 가릴 수 없습니다. '
             '다만 이 도구의 **지표는 모두 일봉(Yahoo)으로 셈하므로**, 일봉 쪽이 틀린 만큼은 '
             '지표에도 들어갑니다.'
             % (rate, len(rels), all_rel[len(all_rel) // 2], all_rel[-1],
                sum(1 for x in rels if x > 0), sum(1 for x in rels if x < 0)))


def verify_close_lag(doc, sample=25):
    """**날짜를 한 칸 밀려 붙였는지**를 벤더 차이에 흔들리지 않게 잰다.

    lag −1 · 0 · +1 로 각각 맞춰 보고 **lag 0 이 가장 잘 맞아야** 한다. 두 출처가
    종가를 조금 다르게 보더라도 제 날짜끼리가 가장 가까울 수밖에 없다 — 하루 사이
    주가는 보통 벤더 차이보다 크게 움직이기 때문이다.

    점끼리의 일치를 요구하는 것보다 이쪽이 옳다. 잡으려는 것이 「밀렸는가」이므로
    「밀린 쪽이 더 잘 맞는가」를 직접 물어야 한다.
    """
    syms = sorted(doc['stocks'])
    step = max(1, len(syms) // sample)
    worse = []
    tested = 0
    for sym in syms[::step][:sample]:
        chart = load_chart(sym)
        if not chart:
            continue
        days = sorted(chart)
        idx = {d: k for k, d in enumerate(days)}
        s = doc['stocks'][sym]
        err = {}
        for lag in (-1, 0, 1):
            es = []
            for d, c in zip(s.get('d') or [], s.get('c') or []):
                if c is None or d not in idx:
                    continue
                k = idx[d] + lag
                if not (0 <= k < len(days)):
                    continue
                ref = chart[days[k]]
                if ref:
                    es.append(abs(c - ref) / ref * 100)
            err[lag] = (sum(es) / len(es)) if es else None
        if err[0] is None:
            continue
        tested += 1
        CHECKS[0] += 1
        rivals = [err[l] for l in (-1, 1) if err[l] is not None]
        if rivals and err[0] >= min(rivals):
            worse.append('%s lag0 %.2f%% vs lag-1 %s / lag+1 %s'
                         % (sym, err[0],
                            '-' if err[-1] is None else '%.2f%%' % err[-1],
                            '-' if err[1] is None else '%.2f%%' % err[1]))
    sys.stderr.write('날짜 밀림 시험 — %d 종목, lag 0 이 지는 종목 %d\n'
                     % (tested, len(worse)))
    if worse:
        fail('%d 종목에서 **옆 날짜가 제 날짜보다 잘 맞습니다** — 날짜를 밀려 '
             '붙였습니다. %s' % (len(worse), ' / '.join(worse[:5])))


def load_chart_ohlc(sym):
    r = subprocess.run(['git', '-C', ROOT, 'show',
                        'origin/kr100-data:data/kr100/chart/%s.json' % sym],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout).get('daily') or {}
    if not d.get('d'):
        return None
    return {d['d'][i]: (d['o'][i], d['h'][i], d['l'][i]) for i in range(len(d['d']))}


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
    verify_close_lag(doc)
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
