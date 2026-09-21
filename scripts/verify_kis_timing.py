# -*- coding: utf-8 -*-
"""산출물을 **다시 셈해서** 대조한다. 같은 코드로 두 번 부르는 것은 검산이 아니다.

여기의 지표는 `kis_strategy_lib` 을 **쓰지 않고** 다시 쓴 것이다. 일부러 느리고
순진하게 — 매 봉에서 창을 통째로 다시 자른다. 빠른 쪽(누적합을 굴리는 SMA,
직전 값을 물려받는 연속일수)에 미끄러진 자리가 있으면 여기서 갈린다.

여섯 가지를 본다.

    1. 지표      독립 구현과 라이브러리가 같은 값을 내는가
    2. 신호      화면에 올라간 매수/청산 종목이 정말 그 조건을 만족하는가
    3. 성적표    백테스트 몇 칸을 다시 돌려 같은 수가 나오는가
    4. 가격      화면의 종가가 원본 일봉의 마지막 봉과 같은가
    5. 산술      손절가 = 종가 × (1 − 손절%) 가 맞는가
    6. 칸 나눔   합의/관찰이 겹치지 않는가, 멤버가 백테스트가 고른 것과 같은가

한 줄이라도 FAIL 이면 산출물을 내보내지 않는다 — 조용히 틀린 매수 신호가
나가는 것보다 소리를 내고 멈추는 편이 낫다.

세 번째(성적표)만 **SKIP** 이 날 수 있다. 성적표는 단추로만 다시 나는데 봉은
날마다 자라므로, 「성적표를 낸 그 우주」가 아닌 자리에서는 댈 것이 없다.
건너뛴 것을 통과로 적지 않는다 — 자세한 것은 `verify_grades` 에 적어 두었다.

## --self-only

위 여섯 중 **1·2·4 는 봉을 다시 읽어야 한다.** 그런데 미국 주식 봉은 이 가지에
없고 `us100-data` 가지에서 오며 **날마다 자란다.** 커밋된 `latest.json` 은 어제
마지막 봉으로 셈한 것이라, 가지가 하루 나아가면 「화면의 기준일이 마지막 봉과
다르다」가 뜬다. 그건 흠이 아니라 **자료가 자란 것**이다.

`--self-only` 는 봉에 기대지 않는 검사(3·5·6 과 전략 수)만 돌린다. PR CI 는
커밋된 자료에 이것을 대고, **새로 만든 자료에는 전부**를 댄다 — 변동성 잡이
「같은가」가 아니라 「스스로 아귀가 맞는가」를 보는 것과 같은 규율이다.
"""

import json
import math
import os
import random
import statistics as st
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import kis_timing_backtest as B

ROOT = D.ROOT
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')
EPS = 1e-9

lines = []
fails = 0
skips = 0


def check(ok, label, detail=''):
    global fails
    if not ok:
        fails += 1
    lines.append('%s  %s%s' % ('PASS' if ok else 'FAIL', label,
                               ('  — ' + detail) if detail else ''))
    return ok


def skip(label, detail=''):
    """**댈 수 없어서 안 댄 것**을 통과로 적지 않는다.

    FAIL 이 아닌 까닭은 어긋난 수를 찾은 것이 아니기 때문이고, PASS 가 아닌
    까닭은 대 보지 않았기 때문이다. 셋째 칸이 없으면 둘 중 하나로 거짓말을
    하게 된다.
    """
    global skips
    skips += 1
    lines.append('SKIP  %s%s' % (label, ('  — ' + detail) if detail else ''))


def close_to(a, b, tol=1e-6):
    if a is None or b is None:
        return a is b
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


# ─────────────────────────────────────────────────────────────────────
# 1. 지표 — 순진한 독립 구현
# ─────────────────────────────────────────────────────────────────────

def naive_sma(xs, n):
    return [None if i + 1 < n else sum(xs[i - n + 1:i + 1]) / n for i in range(len(xs))]


def naive_disparity(xs, n):
    ma = naive_sma(xs, n)
    return [None if not ma[i] else xs[i] / ma[i] * 100.0 for i in range(len(xs))]


def naive_roc(xs, n):
    return [None if (i < n or not xs[i - n]) else (xs[i] - xs[i - n]) / xs[i - n] * 100.0
            for i in range(len(xs))]


def naive_std(xs, n):
    out = []
    for i in range(len(xs)):
        if i < n:
            out.append(None)
            continue
        r = [(xs[j] - xs[j - 1]) / xs[j - 1] for j in range(i - n + 1, i + 1)]
        m = sum(r) / n
        out.append(math.sqrt(sum((v - m) ** 2 for v in r) / (n - 1)))
    return out


def naive_consec(xs, up):
    out = []
    for i in range(len(xs)):
        c = 0
        j = i
        while j > 0 and ((xs[j] > xs[j - 1]) if up else (xs[j] < xs[j - 1])):
            c += 1
            j -= 1
        out.append(c)
    return out


def verify_indicators(uni):
    rng = random.Random(20260919)
    picks = []
    for mk in D.MARKET_ORDER:
        rows = uni.get(mk) or []
        picks += rng.sample(rows, min(4, len(rows)))
    bad = []
    for it in picks:
        c = [b['c'] for b in it['bars']]
        h = [b['h'] for b in it['bars']]
        l = [b['l'] for b in it['bars']]
        pairs = [
            ('sma20', K.sma(c, 20), naive_sma(c, 20)),
            ('sma60', K.sma(c, 60), naive_sma(c, 60)),
            ('disparity5', K.disparity(c, 5), naive_disparity(c, 5)),
            ('roc60', K.roc_pct(c, 60), naive_roc(c, 60)),
            ('std10', K.ret_std(c, 10), naive_std(c, 10)),
            ('consec_up', K.consecutive(c, 'up'), naive_consec(c, True)),
            ('consec_down', K.consecutive(c, 'down'), naive_consec(c, False)),
            ('ibs', K.ibs(h, l, c),
             [0.5 if h[i] == l[i] else (c[i] - l[i]) / (h[i] - l[i]) for i in range(len(c))]),
        ]
        for nm, a, b in pairs:
            for i in range(len(c)):
                if (a[i] is None) != (b[i] is None):
                    bad.append('%s %s[%d] 한쪽만 None' % (it['symbol'], nm, i))
                    break
                if a[i] is not None and not close_to(a[i], b[i], 1e-9):
                    bad.append('%s %s[%d] %r vs %r' % (it['symbol'], nm, i, a[i], b[i]))
                    break
    check(not bad, '지표 %d 종목 × 8개를 독립 구현과 대조' % len(picks),
          '; '.join(bad[:3]) if bad else '')


# ─────────────────────────────────────────────────────────────────────
# 2. 신호 — 화면에 올라간 종목이 정말 그 조건인가
# ─────────────────────────────────────────────────────────────────────

def _holds(bars, sid, i, want):
    """전략 조건을 **말 그대로** 다시 확인한다. actions() 를 부르지 않는다."""
    c = [b['c'] for b in bars]
    h = [b['h'] for b in bars]
    l = [b['l'] for b in bars]
    if sid == 'golden_cross':
        f, s = naive_sma(c, 5), naive_sma(c, 20)
        if None in (f[i], s[i], f[i - 1], s[i - 1]):
            return False
        return (f[i - 1] < s[i - 1] and f[i] > s[i]) if want == 'BUY' else \
               (f[i - 1] > s[i - 1] and f[i] < s[i])
    if sid == 'momentum':
        r = naive_roc(c, 60)[i]
        return r is not None and (r >= 30 if want == 'BUY' else r <= -20)
    if sid == 'week52_high':
        if i < 252:
            return False
        hh = max(h[i - 252:i])
        return (c[i] > hh) if want == 'BUY' else (c[i] < hh)
    if sid == 'consecutive':
        n = naive_consec(c, want == 'BUY')[i]
        return n >= 5
    if sid == 'disparity':
        d = naive_disparity(c, 20)[i]
        return d is not None and (d < 90 if want == 'BUY' else d > 110)
    if sid == 'strong_close':
        v = 0.5 if h[i] == l[i] else (c[i] - l[i]) / (h[i] - l[i])
        return v >= 0.8 if want == 'BUY' else v < 0.5
    if sid == 'volatility':
        chg = (c[i] / c[i - 1] - 1) * 100
        vol = naive_std(c, 10)
        w = vol[i - 9:i + 1]
        fired = (vol[i] is not None and None not in w and len(w) == 10
                 and vol[i] <= min(w) * 1.1 and chg >= 3)
        return fired if want == 'BUY' else (not fired and chg <= -3)
    if sid == 'mean_reversion':
        ma = naive_sma(c, 5)[i]
        if not ma:
            return False
        dev = (c[i] - ma) / ma * 100
        return dev <= -3 if want == 'BUY' else dev >= 3
    if sid == 'trend_filter':
        ma = naive_sma(c, 60)[i]
        if ma is None:
            return False
        chg = c[i] - c[i - 1]
        return (c[i] > ma and chg > 0) if want == 'BUY' else (c[i] < ma and chg < 0)
    if sid == 'breakout_fail':
        if i < 24 or want != 'SELL':
            return False
        rec = max(h[i - 2:i + 1])
        prv = max(h[i - 22:i - 2])
        return rec > prv and (c[i] - rec) / rec * 100 <= -3
    raise AssertionError('모르는 전략 %s' % sid)


def verify_signals(doc, uni):
    by_sym = {}
    for mk in D.MARKET_ORDER:
        for it in (uni.get(mk) or []):
            by_sym[(mk, it['symbol'])] = it
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for key, hits, want in (('buy', 'buy_hits', 'BUY'), ('sell', 'sell_hits', 'SELL'),
                                ('watch_buy', 'buy_hits', 'BUY'),
                                ('watch_sell', 'sell_hits', 'SELL')):
            for p in m.get(key) or []:
                it = by_sym.get((mk, p['symbol']))
                if not it:
                    bad.append('%s 우주에 없음' % p['symbol'])
                    continue
                i = len(it['bars']) - 1
                for sid in p[hits]:
                    n += 1
                    if not _holds(it['bars'], sid, i, want):
                        bad.append('%s/%s %s 조건 불성립' % (p['symbol'], sid, want))
    check(not bad, '화면의 신호 %d 건이 조건을 만족' % n, '; '.join(bad[:3]))


# ─────────────────────────────────────────────────────────────────────
# 3. 성적표 — 무작위로 몇 칸을 다시 돌린다
# ─────────────────────────────────────────────────────────────────────

FINGERPRINT_KEYS = ('count', 'from', 'to', 'bars_min', 'bars_max')


def fingerprint(rows):
    """성적표를 낸 그 우주인가를 가리는 지문.

    `kis_timing_backtest.run()` 이 `universe[시장]` 에 적어 두는 것과 **같은 값**을
    같은 방법으로 셈한다. 저쪽이 바뀌면 여기도 바꿔야 한다.
    """
    return {'count': len(rows),
            'from': min(it['bars'][0]['d'] for it in rows),
            'to': max(it['bars'][-1]['d'] for it in rows),
            'bars_min': min(len(it['bars']) for it in rows),
            'bars_max': max(len(it['bars']) for it in rows)}


def _moved_why(rec, now):
    d = ['%s %s→%s' % (k, rec.get(k), now[k])
         for k in FINGERPRINT_KEYS if rec.get(k) != now[k]]
    return ', '.join(d)


def verify_grades(bt, uni):
    """성적표 몇 칸을 **그 성적표를 낸 우주에서** 다시 돌려 대조한다.

    ## 왜 우주를 먼저 재는가

    성적표는 단추로만 다시 난다(kis-timing-backtest.yml). 그 결정에는 까닭이
    있다 — 성적이 날마다 조용히 바뀌면 합의 멤버가 날마다 바뀐다. 그래서 날마다
    도는 갱신 잡에서는 **성적표가 어제 것이고 봉은 오늘 것**인 때가 정상이다.

    그 자리에서 성적표를 다시 돌리면 당연히 다른 수가 나온다. 그건 어긋난 것이
    아니라 **자료가 자란 것**이다. 실제로 2026-09-19 해외ETF 우주가 18종에서
    31종으로 늘어난 직후 이 검사가 갱신 잡을 넘어뜨렸다(OV_ETF/연속상승 거래
    266 vs 494). 성적표에는 아무 잘못이 없었다.

    그래서 시장마다 지문을 먼저 맞춰 본다.

        지문이 같다  →  **엄격하게 대조한다.** 여기서 갈리면 진짜 고장이다.
        지문이 다르다 →  그 칸은 건너뛰고 **무엇이 달라졌는지 적는다.**

    건너뛴 것을 통과로 적지 않는 것이 요점이다(skip 참고). PR 검사는 성적표를
    **새로 돌린 뒤** 이것을 대므로 지문이 늘 맞고, 따라서 엄격한 쪽으로 돈다.
    """
    rng = random.Random(4)
    picks = rng.sample(bt['grades'], min(5, len(bt['grades'])))
    bad, done, moved = [], 0, {}
    for g in picks:
        mk = g['market']
        rows = uni.get(mk) or []
        if not rows:
            continue
        if mk not in moved:
            rec = (bt.get('universe') or {}).get(mk) or {}
            now = fingerprint(rows)
            moved[mk] = _moved_why(rec, now)
        if moved[mk]:
            continue
        done += 1
        re = B.grade(mk, g['strategy'], rows, B.COST_BPS[mk])
        for k in ('trades', 'win_rate', 'avg', 'edge', 'hold_median'):
            if re.get(k) != g.get(k):
                bad.append('%s/%s %s %r vs %r' % (mk, g['strategy'], k,
                                                  g.get(k), re.get(k)))
    why = '; '.join('%s %s' % (mk, w) for mk, w in sorted(moved.items()) if w)
    if bad or done:
        check(not bad, '성적표 %d 칸을 다시 돌려 대조' % done,
              '; '.join(bad[:3]) if bad
              else ('%d 칸은 우주가 달라져 건너뜀 — %s' % (len(picks) - done, why) if why else ''))
    else:
        skip('성적표 대조 — 성적표를 낸 뒤 우주가 달라졌습니다', '%s. '
             '성적을 지금 봉에 맞추려면 「매매 타이밍 백테스트」를 다시 돌리십시오' % why)


# ─────────────────────────────────────────────────────────────────────
# 4~6. 가격 · 산술 · 칸 나눔
# ─────────────────────────────────────────────────────────────────────

def verify_prices(doc, uni):
    by_sym = {}
    for mk in D.MARKET_ORDER:
        for it in (uni.get(mk) or []):
            by_sym[(mk, it['symbol'])] = it
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for key in ('buy', 'sell', 'watch_buy', 'watch_sell'):
            for p in m.get(key) or []:
                it = by_sym.get((mk, p['symbol']))
                if not it:
                    continue
                b = it['bars'][-1]
                n += 1
                if b['d'] != p['asof']:
                    bad.append('%s 기준일 %s vs %s' % (p['symbol'], p['asof'], b['d']))
                # **끊는 자리는 크기가 아니라 화폐가 정한다.** 예전에는 값이
                # 1,000 을 넘으면 소수점을 버렸는데, 그러면 1,000달러가 넘는
                # 미국 종목의 센트가 날아간다(ASML 1,679.92 → 1,680).
                want = round(b['c'], 2 if D.MARKETS[mk]['currency'] == 'USD' else 0)
                if not close_to(p['close'], want, 1e-9):
                    bad.append('%s 종가 %r vs %r' % (p['symbol'], p['close'], want))
    check(not bad, '종가·기준일 %d 건이 원본 일봉과 일치' % n, '; '.join(bad[:3]))


def verify_arith(doc):
    bad, n = [], 0
    stop = doc['rule']['stop_loss_pct']
    for mk, m in doc['markets'].items():
        for key in ('buy', 'watch_buy'):
            for p in m.get(key) or []:
                if p.get('stop_ref') is None:
                    bad.append('%s 손절가 없음' % p['symbol'])
                    continue
                n += 1
                # **화면에 찍힌 종가로 센다.** 읽는 사람이 손으로 맞춰 볼 수
                # 있는 값이 그것이기 때문이다. MU 에서 이 둘이 갈렸다 —
                # 화면 종가 1,016 × 0.95 = 965.2 인데 손절가는 끊기 전 값
                # 1,015.8 로 셈한 965.01 이 찍혀 있었다.
                px = p['close']
                want = px * (1 - stop / 100.0)
                want = round(want, 2 if D.MARKETS[mk]['currency'] == 'USD' else 0)
                if not close_to(p['stop_ref'], want, 1e-9):
                    bad.append('%s 손절가 %r vs %r' % (p['symbol'], p['stop_ref'], want))
        for key in ('sell', 'watch_sell'):
            for p in m.get(key) or []:
                if p.get('stop_ref') is not None:
                    bad.append('%s 청산 항목에 손절가가 붙음' % p['symbol'])
    check(not bad, '손절가 %d 건이 종가 × (1 − %s%%)' % (n, stop), '; '.join(bad[:3]))


def verify_symbols(doc):
    """**심볼이 순수 숫자이면 안 된다** — 엑셀이 앞자리 0 을 지운다.

    화면의 CSV 저장이 종목코드와 따로 심볼 칸을 두는 것이 그 자리를 막으려는
    것이다. 그런데 화면 검사기는 **첫 탭 한 시장만** 내려받아 본다. 2026-09-20
    국내 곁 목록을 맨 코드로 실었을 때 마침 첫 탭이 국내ETF 라 걸렸지만,
    같은 일이 뒤쪽 탭에서 일어났으면 통과했을 것이다. 그래서 자료 쪽에서
    **다섯 시장을 모두** 본다.
    """
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for key in ('buy', 'sell', 'watch_buy', 'watch_sell'):
            for p in m.get(key) or []:
                n += 1
                if str(p['symbol']).isdigit():
                    bad.append('%s (%s) 심볼이 순수 숫자' % (p['symbol'], mk))
    check(not bad, '심볼 %d 건이 순수 숫자가 아님 (엑셀이 앞자리 0 을 지운다)' % n,
          '; '.join(bad[:3]))


def verify_buckets(doc, bt):
    bad = []
    for mk, m in doc['markets'].items():
        if m['members'] != (bt['picked_live'].get(mk) or []):
            bad.append('%s 멤버가 백테스트 선정과 다름' % mk)
        seen = {}
        for key in ('buy', 'sell', 'watch_buy', 'watch_sell'):
            for p in m.get(key) or []:
                if p['symbol'] in seen:
                    bad.append('%s 가 %s 와 %s 에 겹침' % (p['symbol'], seen[p['symbol']], key))
                seen[p['symbol']] = key
        k = doc['rule']['k']
        for p in m.get('buy') or []:
            if len(p['buy_hits']) < k:
                bad.append('%s 합의매수인데 신호 %d 개' % (p['symbol'], len(p['buy_hits'])))
        for p in m.get('watch_buy') or []:
            if len(p['buy_hits']) >= k or p['sell_hits']:
                bad.append('%s 관찰매수 자리가 아님' % p['symbol'])
        for sid in m['members']:
            if sid not in K.BY_ID:
                bad.append('%s 모르는 전략' % sid)
    check(not bad, '합의/관찰 칸 나눔과 멤버 선정', '; '.join(bad[:3]))


def verify_strategy_count(bt):
    ids = [s['id'] for s in bt['strategies']]
    check(len(ids) == 10 and len(set(ids)) == 10,
          '전략이 10종인가', '%d 종: %s' % (len(ids), ','.join(ids)))


def main():
    self_only = '--self-only' in sys.argv
    bt = json.load(open(os.path.join(OUT_DIR, 'backtest.json'), encoding='utf-8'))
    doc = json.load(open(os.path.join(OUT_DIR, 'latest.json'), encoding='utf-8'))

    lines.append('한국투자증권 전략빌더 10종 — 매매 타이밍 산출물 검산')
    lines.append('백테스트 %s · 세팅 %s' % (bt['generated_at_kst'], doc['generated_at_kst']))
    if self_only:
        lines.append('--self-only — 봉에 기대지 않는 검사만 돌립니다')
    lines.append('')

    verify_strategy_count(bt)
    if not self_only:
        uni, _ = D.load_universe()
        verify_indicators(uni)
        verify_signals(doc, uni)
        verify_grades(bt, uni)
        verify_prices(doc, uni)
    verify_arith(doc)
    verify_symbols(doc)
    verify_buckets(doc, bt)

    lines.append('')
    lines.append('결과: %s%s' % ('모두 통과' if not fails else '%d 건 FAIL' % fails,
                                 ' (건너뜀 %d 건)' % skips if skips else ''))
    txt = '\n'.join(lines) + '\n'
    # **부분 검사의 결과로 온전한 검사의 기록을 덮지 않는다.** verify.txt 는
    # 「전부 대 봤다」는 증서라서, --self-only 가 그 자리에 앉으면 다음에 읽는
    # 사람이 덜 본 것을 다 본 것으로 읽는다.
    if not self_only:
        with open(os.path.join(OUT_DIR, 'verify.txt'), 'w', encoding='utf-8') as f:
            f.write(txt)
    sys.stdout.write(txt)
    _ = st
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
