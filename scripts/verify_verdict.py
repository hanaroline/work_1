# -*- coding: utf-8 -*-
"""종목 판정을 **다시 셈해서** 대조한다. 같은 코드로 두 번 부르는 것은 검산이 아니다.

`verify_kis_timing.py` 와 같은 규율이다. 여기서 보는 것은 여섯 가지다.

    1. 칸 나눔    판정이 정말 그 신호에서 나오는가 (규칙을 다시 적어 대조)
    2. 보류       BLOCKED 는 **막는 딱지가 있을 때만** — 그리고 BUY 에는 없어야 한다
    3. 두 화면    매매 타이밍(latest.json)과 판정(verdict.json)이 같은 말을 하는가
    4. 자료 있음   coverage 가 「있다」고 한 겹에 정말 자료가 있는가
    5. 딱지 근거   딱지에 적힌 수가 원자료의 수와 같은가
    6. 종목 수    우주의 종목이 하나도 빠지지 않았는가

## 세 번째가 이 검산의 핵심이다

같은 저장소가 같은 종목을 두 화면에 올린다. 한쪽은 「매수」, 다른 쪽은 「청산」이
되는 날이 오면 그건 둘 중 하나가 틀린 것보다 나쁘다 — **어느 쪽을 믿어야 할지
알 수 없게 된다.** 이 저장소는 매매 신호 절에서 같은 고장을 한 번 겪었고
(`signal_backtest.bars_for` 가 그 답이었다), 여기서는 칸 나누는 규칙이 두 곳에
적혀 있다는 것이 그 자리다. 그래서 날마다 맞대 본다.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import stock_facts as S
import build_verdict as V

OUT_DIR = os.path.join(D.ROOT, 'data', 'kis_timing')

lines = []
fails = 0


def check(ok, label, detail=''):
    global fails
    if not ok:
        fails += 1
    lines.append('%s  %s%s' % ('PASS' if ok else 'FAIL', label,
                               ('  — ' + detail) if detail else ''))
    return ok


def naive_verdict(buys, sells, has_block):
    """규칙을 **말 그대로** 다시 적는다. V.decide() 를 부르지 않는다."""
    k = V.K_LIVE
    if len(buys) >= k and len(buys) >= len(sells):
        return 'BLOCKED' if has_block else 'BUY'
    if len(sells) >= k:
        return 'SELL'
    if buys or sells:
        return 'WATCH'
    return 'HOLD'


def verify_buckets(doc):
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for x in m['items']:
            t = x.get('technical') or {}
            if not (t.get('members') or []):
                continue
            n += 1
            has_block = any(f['level'] == 'block' for f in (x.get('flags') or []))
            want = naive_verdict(t.get('buy_hits') or [], t.get('sell_hits') or [], has_block)
            if want != x['verdict']:
                bad.append('%s %s vs %s' % (x['symbol'], x['verdict'], want))
    check(not bad, '판정 %d 건이 규칙과 일치' % n, '; '.join(bad[:3]))


def verify_blocks(doc):
    bad, nb = [], 0
    for mk, m in doc['markets'].items():
        for x in m['items']:
            blocks = [f for f in (x.get('flags') or []) if f['level'] == 'block']
            if x['verdict'] == 'BUY' and blocks:
                bad.append('%s 는 매수인데 막는 딱지가 %d 개' % (x['symbol'], len(blocks)))
            if x['verdict'] == 'BLOCKED':
                nb += 1
                if not blocks:
                    bad.append('%s 는 보류인데 막는 딱지가 없음' % x['symbol'])
                if set(x.get('blocked_by') or []) != {f['text'] for f in blocks}:
                    bad.append('%s 의 blocked_by 가 딱지와 다름' % x['symbol'])
    check(not bad, '보류 %d 건과 매수의 막는 딱지' % nb, '; '.join(bad[:3]))


def verify_two_screens(doc, latest):
    """**두 화면이 같은 말을 하는가.** 이 검산의 핵심이다."""
    side = {}
    for mk, m in (latest.get('markets') or {}).items():
        for key, want in (('buy', 'BUY'), ('sell', 'SELL'),
                          ('watch_buy', 'WATCH'), ('watch_sell', 'WATCH')):
            for p in (m.get(key) or []):
                side[(mk, p['symbol'])] = want
    bad, n, mixed_only = [], 0, []
    for mk, m in doc['markets'].items():
        for x in m['items']:
            got = side.get((mk, x['symbol']))
            if got is None:
                # latest.json 이 **일부러 뜻을 내지 않는 자리**가 둘 있다.
                #   ① 아무 신호도 없는 종목 — 싣지 않는다. HOLD 가 맞다.
                #   ② **신호가 엇갈린 종목** — 한 전략은 매수, 다른 전략은 청산인데
                #      둘 다 K 에 못 미치는 자리다. build_kis_timing.plan() 이
                #      side=None 을 내고 네 칸 어디에도 넣지 않아 화면에서 사라진다.
                #      판정 쪽은 그것을 「관찰」로 싣는다 — 엇갈렸다는 사실 자체가
                #      읽을 거리이기 때문이다. 오늘 열두 종목이 그렇다.
                # 그 둘 말고 latest 에 없는 판정이 나오면 그건 어긋난 것이다.
                t = x.get('technical') or {}
                mixed = bool(t.get('buy_hits')) and bool(t.get('sell_hits'))
                if x['verdict'] == 'HOLD':
                    continue
                if x['verdict'] == 'WATCH' and mixed:
                    mixed_only.append(x['symbol'])
                    continue
                bad.append('%s 판정 %s 인데 매매 타이밍에는 없음' % (x['symbol'], x['verdict']))
                continue
            n += 1
            # 판정 쪽은 막는 딱지 때문에 BUY 가 BLOCKED 로 내려갈 수 있다.
            mine = 'BUY' if x['verdict'] == 'BLOCKED' else x['verdict']
            if mine != got:
                bad.append('%s 판정 %s vs 매매 타이밍 %s' % (x['symbol'], x['verdict'], got))
    check(not bad, '두 화면이 같은 말을 하는가 (%d 건 대조)' % n,
          '; '.join(bad[:3]) if bad else
          ('매매 타이밍이 싣지 않는 엇갈린 신호 %d 종은 판정에서 관찰로 실렸습니다'
           % len(mixed_only) if mixed_only else ''))


def verify_coverage(doc):
    bad, n = [], 0
    kr, _ = S.companies('KR')
    us, _ = S.companies('US')
    rep = (S.report_index().get('by_code') or {})
    for mk, m in doc['markets'].items():
        for x in m['items']:
            cov = x.get('coverage') or {}
            if not cov:
                continue
            n += 1
            comp = kr if D.MARKETS[mk]['region'] == 'KR' else us
            want_f = bool(mk in ('KR_STOCK', 'US_STOCK') and x['symbol'] in comp)
            if cov.get('fundamentals') != want_f:
                bad.append('%s 실적 겹 %r 이어야 %r' % (x['symbol'], cov.get('fundamentals'), want_f))
            want_r = bool(mk == 'KR_STOCK' and (x.get('code') in rep))
            if cov.get('reports') != want_r:
                bad.append('%s 리포트 겹 %r 이어야 %r' % (x['symbol'], cov.get('reports'), want_r))
            if cov.get( 'fundamentals') is False and not cov.get('fundamentals_why'):
                bad.append('%s 실적 겹이 없는데 까닭이 없음' % x['symbol'])
    check(not bad, '자료 있음/없음 표시 %d 건' % n, '; '.join(bad[:3]))


def verify_flag_numbers(doc):
    """딱지에 적힌 수가 원자료의 수와 같은가 — 목표가 괴리와 서프라이즈를 다시 센다."""
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for x in m['items']:
            f = ((x.get('facts') or {}).get('fundamentals')) or {}
            t = f.get('target') or {}
            q = f.get('quote') or {}
            if t.get('mean') and q.get('price'):
                n += 1
                want = round((t['mean'] / q['price'] - 1.0) * 100.0, 1)
                if abs((t.get('upside_pct') or 0) - want) > 0.051:
                    bad.append('%s 목표가 괴리 %r vs %r' % (x['symbol'], t.get('upside_pct'), want))
            sp = f.get('surprises')
            if sp and sp.get('n'):
                n += 1
                if not (0 <= sp['beats'] <= sp['n']) or sp['beats'] + sp['misses'] != sp['n']:
                    bad.append('%s 서프라이즈 셈이 맞지 않음 %r' % (x['symbol'], sp))
    check(not bad, '딱지의 수 %d 건을 원자료로 다시 셈' % n, '; '.join(bad[:3]))


def verify_universe(doc, uni):
    bad = []
    for mk in D.MARKET_ORDER:
        rows = uni.get(mk) or []
        m = doc['markets'].get(mk)
        if not rows:
            if m:
                bad.append('%s 우주가 비었는데 판정이 있음' % mk)
            continue
        if not m:
            bad.append('%s 우주에 %d 종이 있는데 판정이 없음' % (mk, len(rows)))
            continue
        want = {it['symbol'] for it in rows}
        got = {x['symbol'] for x in m['items']}
        if want != got:
            bad.append('%s 빠짐 %d · 군더더기 %d' % (mk, len(want - got), len(got - want)))
        if sum(m['counts'].values()) != len(m['items']):
            bad.append('%s 칸 합계가 항목 수와 다름' % mk)
    check(not bad, '우주의 종목이 빠짐없이 실렸는가', '; '.join(bad[:3]))


def main():
    p = os.path.join(OUT_DIR, 'verdict.json')
    if not os.path.exists(p):
        raise SystemExit('%s 가 없습니다 — 먼저 build_verdict.py 를 돌리십시오' % p)
    doc = json.load(open(p, encoding='utf-8'))
    latest_p = os.path.join(OUT_DIR, 'latest.json')
    latest = json.load(open(latest_p, encoding='utf-8')) if os.path.exists(latest_p) else {}
    uni, _ = D.load_universe()

    lines.append('종목 판정 검산 — %s' % doc['generated_at_kst'])
    lines.append('')
    verify_buckets(doc)
    verify_blocks(doc)
    if latest:
        verify_two_screens(doc, latest)
    else:
        lines.append('SKIP  두 화면 대조 — latest.json 이 없습니다')
    verify_coverage(doc)
    verify_flag_numbers(doc)
    verify_universe(doc, uni)

    lines.append('')
    lines.append('결과: %s' % ('모두 통과' if not fails else '%d 건 FAIL' % fails))
    txt = '\n'.join(lines) + '\n'
    with open(os.path.join(OUT_DIR, 'verify-verdict.txt'), 'w', encoding='utf-8') as f:
        f.write(txt)
    sys.stdout.write(txt)
    _ = K
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
