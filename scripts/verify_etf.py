#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 76종의 일봉과 신호를 검산한다.

**이 대본이 막아야 하는 것 가운데 첫째는 「엉뚱한 종목을 분석하는 것」이다.**
티커를 사진에서 옮겨 적었고, 코드 한 자가 틀려도 대개 빈 응답이 아니라 **다른
종목의 멀쩡한 응답**이 온다. 그러면 표 위에는 'TIGER 미국나스닥100' 이라 적힌 채
남의 값이 실린다. 어떤 지표 검산도 그것을 잡지 못한다 — 숫자는 다 맞기 때문이다.
그래서 **받아 온 이름과 종목 유형을 표의 이름과 맞대는 것**을 첫 검사로 둔다.

둘째는 「모자란 이력으로 점수를 내는 것」이다. 신설 ETF 가 많은 표다. 등급마다
무엇을 내고 무엇을 내지 않아야 하는지 못박아 두고, 넘어서면 잡는다.

마지막에 **흠을 심어 본다.** 검산기가 실제로 물는지 확인하지 않은 검산기는
검산기가 아니다.

  python3 scripts/verify_etf.py
"""

import copy
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import etf_list as L

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
SIGNALS = os.path.join(ROOT, 'data', 'etf', 'signals.json')

FAILS, WARNS, CHECKS = [], [], [0]
MAX_STALE = 5          # 같은 시장 최신일보다 이만큼 넘게 뒤지면 잡는다


def check(cond, msg):
    CHECKS[0] += 1
    if not cond:
        FAILS.append(msg)
    return bool(cond)


def warn(msg):
    WARNS.append(msg)


# ─────────────────────────────────────────────────────────────────────
# 하나. 목록이 표와 같은가 — ETN 이 새어들지 않았는가
# ─────────────────────────────────────────────────────────────────────

def verify_list():
    c = L.counts()
    check(c['total'] == 76, '목록이 76종이 아닙니다 — %d종' % c['total'])
    check(c['KR'] == 55, '국내상장이 55종이 아닙니다 — %d종' % c['KR'])
    check(c['OV'] == 21, '해외상장이 21종이 아닙니다 — %d종' % c['OV'])

    its = L.items()
    tk = [x['ticker'] for x in its]
    check(len(set(tk)) == len(tk), '티커가 겹칩니다 — %s'
          % [t for t in set(tk) if tk.count(t) > 1])
    nos = sorted(x['no'] for x in its)
    check(nos == list(range(1, 77)), '번호가 1~76 이 아닙니다 — 빠진 것 %s'
          % sorted(set(range(1, 77)) - set(nos)))

    # **ETN 이 한 종목도 없어야 한다.** 지시가 그것이었다.
    etn = {t for _, t, _ in L.EXCLUDED_ETN}
    check(not (etn & set(tk)), 'ETN 이 목록에 섞였습니다 — %s' % (etn & set(tk)))
    check(not any(t.startswith('Q5') for t in tk),
          'ETN 꼴(Q5…) 티커가 있습니다 — %s' % [t for t in tk if t.startswith('Q5')])
    check(len(etn) == 6, '뺀 ETN 이 6종이 아닙니다 — %d종' % len(etn))


# ─────────────────────────────────────────────────────────────────────
# 둘. **이름 맞대기** — 이 파일의 핵심
# ─────────────────────────────────────────────────────────────────────

def _norm(s):
    return ''.join(ch for ch in (s or '').upper() if ch.isalnum())


def _bigrams(s):
    return {s[i:i + 2] for i in range(len(s) - 1)} or {s}


def name_agrees(sheet, got):
    """표의 이름과 받아 온 이름이 같은 것을 가리키는가.

    글자가 완전히 같기를 바랄 수는 없다 — 네이버는 'TIGER미국나스닥100' 처럼 띄어쓰기
    없이 주기도 하고 표는 '(H)' 를 붙여 적기도 한다. 그래서 정규화한 뒤 포함관계와
    이글자겹침으로 본다. **0.5 아래는 잡고, 0.5~0.75 는 경고로 남겨 사람이 본다.**
    """
    a, b = _norm(sheet), _norm(got)
    if not a or not b:
        return None
    if a == b or a in b or b in a:
        return 1.0
    A, B = _bigrams(a), _bigrams(b)
    return len(A & B) / max(1, len(A | B))


def verify_names(px):
    its = {x['ticker']: x for x in L.items()}
    for tk, rec in sorted(px['items'].items()):
        it = its.get(tk)
        if not check(it is not None, '가격판에 표에 없는 티커가 있습니다 — %s' % tk):
            continue

        if rec['scope'] == 'OV':
            # **유형이 ETF 여야 한다.** 야후의 GOLD 는 금광 회사 주식이다.
            check((rec.get('instrument_type') or '').upper() == 'ETF',
                  '%s(%s) 가 ETF 가 아닙니다 — 야후 유형 %r, 심볼 %s'
                  % (tk, it['name'], rec.get('instrument_type'), rec.get('symbol_used')))
            got = rec.get('name_source') or ''
            hits = [w for w in it['expect'] if w.lower() in got.lower()]
            check(bool(hits),
                  '%s 의 이름이 표와 어긋납니다 — 표 %r / 받은 %r (심볼 %s)'
                  % (tk, it['name'], got, rec.get('symbol_used')))
        else:
            got = rec.get('name_source')
            if not got:
                warn('%s(%s) 은 네이버에서 이름을 못 받아 맞대 보지 못했습니다 '
                     '— 코드가 맞는지 사람이 봐야 합니다' % (tk, it['name']))
                continue
            sim = name_agrees(it['name'], got)
            check(sim is not None and sim >= 0.5,
                  '%s 의 이름이 표와 어긋납니다 — 표 %r / 네이버 %r (겹침 %.2f)'
                  % (tk, it['name'], got, sim or 0))
            if sim is not None and sim < 0.75:
                warn('%s 이름이 느슨하게만 맞습니다 (겹침 %.2f) — 표 %r / 네이버 %r'
                     % (tk, sim, it['name'], got))


# ─────────────────────────────────────────────────────────────────────
# 셋. 봉이 말이 되는가 · 낡지 않았는가
# ─────────────────────────────────────────────────────────────────────

def market_days(px):
    """시장마다 **거래일 합집합**을 세운다 — 낡음을 셀 잣대다.

    달력 날짜로 재면 연휴가 낡음으로 보이고, 그 종목의 날짜축만 쓰면 뒤진 만큼이
    0 으로 보인다. 그래서 같은 시장 종목들의 날짜 합집합에서 센다.
    """
    u = {}
    for rec in px['items'].values():
        u.setdefault(rec['scope'], set()).update(rec['bars']['d'])
    return {k: sorted(v) for k, v in u.items()}


def verify_bars(px):
    mdays = market_days(px)
    latest = {}
    for tk, rec in px['items'].items():
        b = rec['bars']
        n = len(b['d'])
        if not check(n > 0, '%s 의 봉이 비었습니다' % tk):
            continue
        check(all(len(b[k]) == n for k in ('o', 'h', 'l', 'c', 'v')),
              '%s 의 계열 길이가 어긋납니다 — %s'
              % (tk, {k: len(b[k]) for k in ('d', 'o', 'h', 'l', 'c', 'v')}))
        check(b['d'] == sorted(b['d']), '%s 의 날짜가 오름차순이 아닙니다' % tk)
        check(len(set(b['d'])) == n, '%s 에 겹치는 날짜가 있습니다' % tk)
        bad = []
        for i in range(min(n, len(b['c']))):
            o, h, l, c = b['o'][i], b['h'][i], b['l'][i], b['c'][i]
            if None in (o, h, l, c) or 0 in (o, h, l, c):
                bad.append((b['d'][i], '빈 값 또는 0'))
            elif h < l or h < max(o, c) or l > min(o, c):
                bad.append((b['d'][i], 'h%s l%s o%s c%s' % (h, l, o, c)))
        check(not bad, '%s 에 말이 안 되는 봉 %d 개 — %s' % (tk, len(bad), bad[:3]))
        latest.setdefault(rec['scope'], []).append((rec['to'], tk))

    # **시장별로 잰다.** 도쿄·홍콩·호주·미국은 휴일이 서로 다르고 국내와도 다르다.
    for scope, rows in latest.items():
        newest = max(r[0] for r in rows)
        axis = mdays[scope]
        for to, tk in rows:
            d = 0 if to >= newest else sum(1 for x in axis if to < x <= newest)
            check(d <= MAX_STALE,
                  '%s 의 마지막 봉이 %s 인데 같은 시장 최신은 %s 입니다 (%s 세션 뒤짐)'
                  % (tk, to, newest, d))


# ─────────────────────────────────────────────────────────────────────
# 넷. 등급마다 낼 것만 냈는가
# ─────────────────────────────────────────────────────────────────────

def verify_tiers(sg, px):
    full_min = sg['tiers']['full_min_sessions']
    part_min = sg['tiers']['partial_min_sessions']
    check(full_min == 210, '온전 기준이 210세션이 아닙니다 — %s' % full_min)

    seen = set()
    for it in sg['items']:
        tk, tier, n = it['ticker'], it['tier'], it['sessions']
        seen.add(tk)
        if tier == 'full':
            check(n >= full_min, '%s 가 온전 등급인데 %d 세션뿐입니다' % (tk, n))
            hs = it.get('horizons') or {}
            check(len(hs) == 4, '%s 의 시계가 4개가 아닙니다 — %d개' % (tk, len(hs)))
            for h, hv in hs.items():
                check(hv.get('score') is not None or hv.get('note'),
                      '%s 의 %s일 시계에 점수도 사유도 없습니다' % (tk, h))
        elif tier == 'partial':
            check(part_min <= n < full_min,
                  '%s 가 부분 등급인데 %d 세션입니다' % (tk, n))
            # **여기서 신호대나 매매계획이 나오면 근거 없는 글자다**
            blob = json.dumps(it, ensure_ascii=False)
            check('"band"' not in blob,
                  '%s (부분 등급) 에 신호대가 실렸습니다 — 이력이 모자란 채 나온 글자입니다' % tk)
            check('"plan"' not in blob, '%s (부분 등급) 에 매매계획이 실렸습니다' % tk)
            check(it.get('tier_note'), '%s 에 등급 사유가 없습니다' % tk)
        else:
            check(n < part_min, '%s 가 짧음 등급인데 %d 세션입니다' % (tk, n))
            check('axes' not in it, '%s (짧음 등급) 에 축 점수가 실렸습니다' % tk)
            check(it.get('tier_note'), '%s 에 등급 사유가 없습니다' % tk)

        # 신호판의 기준일이 가격판과 같은가
        rec = px['items'].get(tk)
        if rec and it.get('asof'):
            check(it['asof'] == rec['to'],
                  '%s 의 기준일이 가격판과 다릅니다 — 신호 %s / 가격 %s'
                  % (tk, it['asof'], rec['to']))

    missing = {m['ticker'] for m in sg.get('missing') or []}
    check(seen | missing == {x['ticker'] for x in L.items()},
          '신호판에 빠진 종목이 있습니다 — %s'
          % sorted({x['ticker'] for x in L.items()} - (seen | missing)))

    # 성적표를 붙이지 않았다고 **적어 두었는가**. 이 표는 주식으로 잰 성적을 쓸 수 없다.
    check('backtest_note' in sg, '백테스트를 싣지 않은 까닭이 적혀 있지 않습니다')
    check('disclaimer' in sg, '고지가 없습니다')


# ─────────────────────────────────────────────────────────────────────
# 다섯. **엔진과 따로 셈해 맞대 본다**
# ─────────────────────────────────────────────────────────────────────
#
# signal_lib 자체의 옳음은 verify_signals.py 가 이미 KR100·US100 에서 잰다. 여기서
# 재는 것은 **관(管)** 이다 — 받아 온 일봉이 그 종목의 것인지, 엔진에 제대로
# 들어갔는지. 그래서 지표 몇 개를 여기서 **손으로 다시 짜** 맞대 본다. 엔진 함수를
# 불러 견주면 같은 잘못을 두 번 해서 서로 맞다고 할 뿐이다.

def _sma(xs, w):
    return None if len(xs) < w else sum(xs[-w:]) / w


def _rsi(cs, w=14):
    if len(cs) < w + 1:
        return None
    up = dn = 0.0
    for i in range(1, w + 1):
        ch = cs[i] - cs[i - 1]
        up += max(ch, 0.0)
        dn += max(-ch, 0.0)
    au, ad = up / w, dn / w
    for i in range(w + 1, len(cs)):
        ch = cs[i] - cs[i - 1]
        au = (au * (w - 1) + max(ch, 0.0)) / w
        ad = (ad * (w - 1) + max(-ch, 0.0)) / w
    if ad == 0:
        return 100.0
    return 100.0 - 100.0 / (1.0 + au / ad)


def verify_recompute(sg, px):
    tol = 0.05
    n_done = 0
    for it in sg['items']:
        if it['tier'] == 'short':
            continue
        rec = px['items'][it['ticker']]
        cs = [x for x in rec['bars']['c']]
        # 종가·등락률
        check(abs(it['close'] - cs[-1]) < 1e-9,
              '%s 의 종가가 원자료와 다릅니다 — 신호 %s / 자료 %s'
              % (it['ticker'], it['close'], cs[-1]))
        exp = round((cs[-1] / cs[-2] - 1) * 100, 2)
        check(abs(it['change_pct'] - exp) <= 0.01,
              '%s 의 등락률이 어긋납니다 — 신호 %s / 다시 셈 %s'
              % (it['ticker'], it['change_pct'], exp))
        ind = it.get('indicators') or {}
        for w, key in ((20, 'ma20'), (60, 'ma60'), (120, 'ma120')):
            got, mine = ind.get(key), _sma(cs, w)
            if got is None or mine is None:
                continue
            check(abs(got - mine) <= max(tol, abs(mine) * 1e-6),
                  '%s 의 %s 가 어긋납니다 — 신호 %s / 다시 셈 %.4f'
                  % (it['ticker'], key, got, mine))
        if ind.get('rsi14') is not None:
            mine = _rsi(cs)
            check(mine is not None and abs(ind['rsi14'] - mine) <= tol,
                  '%s 의 RSI 가 어긋납니다 — 신호 %s / 다시 셈 %s'
                  % (it['ticker'], ind['rsi14'], None if mine is None else round(mine, 3)))
        n_done += 1
    check(n_done >= 30, '다시 셈해 맞대 본 종목이 %d 개뿐입니다' % n_done)


# ─────────────────────────────────────────────────────────────────────
# 여섯. **흠을 심어 본다** — 위의 검사가 실제로 무는가
# ─────────────────────────────────────────────────────────────────────

def _run(fn):
    """흠을 심은 판으로 검사를 돌려 **물었는지**만 보고 원래 상태로 되돌린다.

    fn 이 False 를 내면 「심을 자리가 없었다」는 뜻이고, 그것은 놓친 것이 아니다 —
    부분 등급이 하나도 없는 날에 부분 등급 흠을 세는 것은 없는 잘못을 세는 것이다.
    """
    keep_f, keep_w, keep_c = list(FAILS), list(WARNS), CHECKS[0]
    FAILS.clear(); WARNS.clear()
    try:
        applied = fn()
        bit = bool(FAILS)
    finally:
        FAILS.clear(); FAILS.extend(keep_f)
        WARNS.clear(); WARNS.extend(keep_w)
        CHECKS[0] = keep_c
    return (None if applied is False else bit)


def verify_injection(sg, px):
    cases = []

    # 1) 고가가 저가보다 낮은 봉
    def c1():
        p = copy.deepcopy(px)
        tk = sorted(p['items'])[0]
        p['items'][tk]['bars']['h'][-1] = p['items'][tk]['bars']['l'][-1] - 1
        verify_bars(p)
        return True
    cases.append(('말이 안 되는 봉', c1))

    # 2) 남의 이름 — **엉뚱한 종목을 분석하는 경우**
    def c2():
        p = copy.deepcopy(px)
        for tk, rec in sorted(p['items'].items()):
            if rec['scope'] == 'KR' and rec.get('name_source'):
                rec['name_source'] = '두산에너빌리티'
                verify_names(p)
                return True
        return False
    cases.append(('국내 종목에 남의 이름', c2))

    # 3) ETF 가 아닌 것 (야후 GOLD = 금광 주식)
    def c3():
        p = copy.deepcopy(px)
        for tk, rec in sorted(p['items'].items()):
            if rec['scope'] == 'OV':
                rec['instrument_type'] = 'EQUITY'
                verify_names(p)
                return True
        return False
    cases.append(('해외 종목이 주식', c3))

    # 4) 해외 이름이 표와 딴판
    def c4():
        p = copy.deepcopy(px)
        for tk, rec in sorted(p['items'].items()):
            if rec['scope'] == 'OV':
                rec['name_source'] = 'Barrick Mining Corporation'
                rec['instrument_type'] = 'ETF'
                verify_names(p)
                return True
        return False
    cases.append(('해외 이름이 딴판', c4))

    # 5) 이력이 모자란 것에 신호대를 실음
    def c5():
        s = copy.deepcopy(sg)
        for it in s['items']:
            if it['tier'] == 'partial':
                it['band'] = 'strong_buy'
                verify_tiers(s, px)
                return True
        return False          # 부분 등급이 없으면 심을 자리가 없다
    cases.append(('모자란 이력에 신호대', c5))

    # 6) 낡은 봉
    def c6():
        p = copy.deepcopy(px)
        for tk, rec in sorted(p['items'].items()):
            if len(rec['bars']['d']) > 40:
                for k in ('d', 'o', 'h', 'l', 'c', 'v'):
                    rec['bars'][k] = rec['bars'][k][:-20]
                rec['to'] = rec['bars']['d'][-1]
                verify_bars(p)
                return True
        return False
    cases.append(('낡은 봉', c6))

    # 7) 종가를 살짝 흔듦 — 다시 셈 검사가 무는가
    def c7():
        p = copy.deepcopy(px)
        ok_tk = {x['ticker'] for x in sg['items'] if x['tier'] != 'short'}
        for tk in sorted(p['items']):
            if tk in ok_tk and len(p['items'][tk]['bars']['c']) > 10:
                p['items'][tk]['bars']['c'][-5] *= 1.02
                verify_recompute(sg, p)
                return True
        return False
    cases.append(('종가를 흔듦', c7))

    miss, skipped = [], []
    for label, fn in cases:
        bit = _run(fn)
        CHECKS[0] += 1
        if bit is None:
            skipped.append(label)
        elif not bit:
            miss.append(label)
    check(not miss, '흠을 심었는데 검산기가 놓쳤습니다 — %s' % ', '.join(miss))
    for s in skipped:
        warn('흠을 심을 자리가 없어 건너뛴 경우 — %s' % s)
    return len(cases) - len(skipped)


# ─────────────────────────────────────────────────────────────────────

def main():
    px = json.load(open(PRICES, encoding='utf-8'))
    sg = json.load(open(SIGNALS, encoding='utf-8'))

    verify_list()
    verify_names(px)
    verify_bars(px)
    verify_tiers(sg, px)
    verify_recompute(sg, px)
    n_inj = verify_injection(sg, px)

    if px.get('failed'):
        for f in px['failed']:
            warn('못 받은 종목 — %s (%s): %s'
                 % (f['ticker'], f['name'], '; '.join(f.get('errors') or [])))

    print('검사 %d 가지 · 흠 심기 %d 가지' % (CHECKS[0], n_inj))
    print('온전 %s · 부분 %s · 짧음 %s · 못받음 %s'
          % (sg['summary']['full'], sg['summary']['partial'],
             sg['summary']['short'], sg['summary']['missing']))
    if WARNS:
        print()
        print('경고 %d' % len(WARNS))
        for w in WARNS:
            print('  ! %s' % w)
    print()
    if FAILS:
        print('실패 %d' % len(FAILS))
        for f in FAILS:
            print('  - %s' % f)
        return 1
    print('실패 없음')
    return 0


if __name__ == '__main__':
    sys.exit(main())
