#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""**76 종목이 몇 개의 베팅인가.**

자산배분 목록에서 신호 점수보다 먼저 봐야 할 것이 이것이다. 이름이 일흔여섯이라고
서로 다른 위험이 일흔여섯 가지인 것이 아니다. 같은 표 안에 이런 것들이 함께 있다.

  · TIGER 미국나스닥100 · TIGER 미국나스닥100TR(H) · QQQ · TIGER 미국나스닥100TR채권혼합Fn
  · TIGER 미국S&P500 · TIGER 미국S&P500TR(H) · SPY · 미국S&P500미국채혼합50 · ACE 미국S&P500채권혼합액티브
  · TIGER 미국배당다우존스 · SOL 미국배당다우존스(H) · SCHD

점수만 줄 세워 위에서 다섯을 고르면 **같은 것을 다섯 번 사는 일**이 벌어진다.
그것을 눈으로 말고 **재서** 보이려고 만든다.

시장을 어떻게 가르고 맞대는가
──────────────────────────────────────────────────────────────────────
장이 열리는 시각이 다르면 날짜를 그대로 맞댈 수 없다. 서울의 오늘 종가는 뉴욕의
어젯밤을 담고 있어 일간으로 재면 상관이 실제보다 낮게 나온다. 그래서
**같은 거래소끼리는 일간 수익률로, 거래소를 건너서는 주간 수익률로** 잰다.

처음에는 「국내/해외」 둘로만 갈랐는데 **그것이 틀렸다** — 해외 21종에는 뉴욕·도쿄·
홍콩·시드니가 섞여 있고, 그것들을 한 시장으로 치면 도쿄와 뉴욕을 일간으로 맞대게
된다. 지금은 **통화로 거래소를 가른다**(KRW·USD·JPY·HKD·AUD). 통화는 원천이
적어 준 것이라 지어낸 데가 없다.

**사슬을 구별한다.** 단일연결로 묶으면 A–B 가 0.95, B–C 가 0.95 여도 A–C 는 0.6 일
수 있다. 그런 덩이를 촘촘한 덩이와 같이 보여 주면 「이 여덟이 다 같은 것」으로
읽힌다. 그래서 덩이마다 **속에서 가장 낮은 짝의 상관**을 함께 적는다 — 그 값이
낮으면 사슬이다.

환헤지에 대하여
──────────────────────────────────────────────────────────────────────
헤지 안 한 국내 상장 미국 ETF 에는 **원/달러가 섞여 있다.** 그래서 SPY 와의 상관이
1 이 되지 않는다. (H) 붙은 것과 안 붙은 것을 각각 본토 ETF 와 맞대 보면 그 몫이
얼마인지 드러난다 — 같은 지수를 사면서도 서로 다른 위험을 지고 있다는 뜻이다.

  python3 scripts/etf_overlap.py
"""

import argparse
import json
import math
import os
import statistics as st
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import etf_list as L

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
OUT = os.path.join(ROOT, 'data', 'etf', 'overlap.json')

MIN_OBS_D = 120        # 일간 상관을 낼 최소 관측
MIN_OBS_W = 40         # 주간 상관을 낼 최소 관측
CLUSTER_RHO = 0.90     # 이 위로 이어지면 「사실상 같은 베팅」으로 묶는다


def returns(days, closes):
    """날짜 → 일간 로그수익률."""
    out = {}
    for i in range(1, len(closes)):
        a, b = closes[i - 1], closes[i]
        if a and b and a > 0 and b > 0:
            out[days[i]] = math.log(b / a)
    return out


def weekly(days, closes):
    """날짜 → 주간(ISO 주) 수익률. 그 주의 마지막 종가끼리 견준다.

    **시장이 다르면 이것으로 잰다.** 국내 오늘 종가가 미국 어젯밤을 담는 하루
    어긋남이 주 단위에서는 대체로 묻힌다.
    """
    last = {}
    for d, c in zip(days, closes):
        if not c or c <= 0:
            continue
        y, w, _ = date.fromisoformat(d).isocalendar()
        last[(y, w)] = c
    ks = sorted(last)
    out = {}
    for i in range(1, len(ks)):
        # 주가 건너뛰면(휴장 주) 그 구간은 버린다 — 2주치를 1주로 세지 않는다
        if _wdist(ks[i - 1], ks[i]) != 1:
            continue
        a, b = last[ks[i - 1]], last[ks[i]]
        out[ks[i]] = math.log(b / a)
    return out


def _wdist(a, b):
    return (date.fromisocalendar(b[0], b[1], 1) -
            date.fromisocalendar(a[0], a[1], 1)).days // 7


def corr(x, y):
    """겹치는 날만 모아 피어슨 상관. 관측이 모자라면 None."""
    ks = sorted(set(x) & set(y))
    if len(ks) < 3:
        return None, 0
    a = [x[k] for k in ks]
    b = [y[k] for k in ks]
    sa, sb = st.pstdev(a), st.pstdev(b)
    if sa == 0 or sb == 0:
        return None, len(ks)
    ma, mb = st.mean(a), st.mean(b)
    cv = sum((p - ma) * (q - mb) for p, q in zip(a, b)) / len(ks)
    return cv / (sa * sb), len(ks)


def clusters(tickers, rho, cut=CLUSTER_RHO):
    """ρ ≥ cut 으로 이어지면 한 덩이(단일연결). **덩이 하나가 베팅 하나다.**"""
    parent = {t: t for t in tickers}

    def find(t):
        while parent[t] != t:
            parent[t] = parent[parent[t]]
            t = parent[t]
        return t

    for (a, b), v in rho.items():
        if v is not None and v >= cut:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
    out = {}
    for t in tickers:
        out.setdefault(find(t), []).append(t)
    return sorted(out.values(), key=lambda g: (-len(g), g[0]))


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--prices', default=PRICES)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    px = json.load(open(a.prices, encoding='utf-8'))
    items = px['items']
    meta = {x['ticker']: x for x in L.items()}

    dly, wly, venue = {}, {}, {}
    for tk, rec in items.items():
        b = rec['bars']
        dly[tk] = returns(b['d'], b['c'])
        wly[tk] = weekly(b['d'], b['c'])
        # **통화가 거래소를 가른다.** 원천이 적어 준 값이라 지어낸 데가 없다.
        venue[tk] = rec.get('currency') or rec['scope']

    tks = sorted(items)
    rho, basis, obs = {}, {}, {}
    for i, x in enumerate(tks):
        for y in tks[i + 1:]:
            if venue[x] == venue[y]:
                r, n = corr(dly[x], dly[y])
                bs, need = 'daily', MIN_OBS_D
            else:
                r, n = corr(wly[x], wly[y])
                bs, need = 'weekly', MIN_OBS_W
            if r is None or n < need:
                r = None
            rho[(x, y)] = r
            basis[(x, y)] = bs
            obs[(x, y)] = n

    gs = clusters(tks, rho)

    def tightness(g):
        """덩이 속 **가장 느슨한 짝**. 낮으면 사슬로 이어진 것이다."""
        vs = []
        for i, x in enumerate(sorted(g)):
            for y in sorted(g)[i + 1:]:
                v = rho.get((x, y)) if (x, y) in rho else rho.get((y, x))
                vs.append(v)
        got = [v for v in vs if v is not None]
        if not got:
            return None, None, len(vs) - len(got)
        return min(got), st.median(got), len(vs) - len(got)

    # **환헤지가 무엇을 바꾸는가** — 같은 지수의 (H)/비(H) 를 본토 ETF 와 맞댄다
    hedge_pairs = [
        ('A360750', 'A448290', 'SPY', 'S&P500'),
        ('A133690', 'A448300', 'QQQ', '나스닥100'),
        ('A458730', 'A452360', 'SCHD', '미국배당다우존스'),
    ]
    hedge = []
    for plain, hedged, home, what in hedge_pairs:
        if not all(t in dly for t in (plain, hedged, home)):
            continue
        rp, np_ = corr(wly[plain], wly[home])
        rh, nh = corr(wly[hedged], wly[home])
        if rp is None or rh is None:
            continue
        hedge.append({'what': what, 'home': home,
                      'plain': plain, 'plain_name': meta[plain]['name'],
                      'hedged': hedged, 'hedged_name': meta[hedged]['name'],
                      'rho_plain': round(rp, 3), 'rho_hedged': round(rh, 3),
                      'obs': min(np_, nh), 'basis': 'weekly',
                      'gap': round(rh - rp, 3)})

    doc = {
        'generated_from': px.get('generated_at_kst'),
        'method': ('통화로 거래소를 가르고(KRW·USD·JPY·HKD·AUD), 같은 거래소끼리는 '
                   '일간 로그수익률, 거래소를 건너서는 주간 수익률로 잽니다. 서울 오늘 '
                   '종가가 뉴욕 어젯밤을 담는 하루 어긋남이 일간에서는 상관을 실제보다 '
                   '낮게 보이게 하기 때문입니다. 덩이마다 속에서 **가장 느슨한 짝**을 '
                   '적었습니다 — 그 값이 낮으면 사슬로 이어진 덩이입니다.'),
        'cluster_cut': CLUSTER_RHO,
        'min_obs': {'daily': MIN_OBS_D, 'weekly': MIN_OBS_W},
        'clusters': [dict(zip(('min_rho', 'median_rho', 'unmeasured'), tightness(g)),
                          n=len(g),
                          members=[{'ticker': t, 'name': meta[t]['name'],
                                    'group': meta[t]['group'], 'theme': meta[t]['theme']}
                                   for t in sorted(g, key=lambda t: meta[t]['no'])])
                     for g in gs],
        'cluster_count': len(gs),
        'hedge': hedge,
        'pairs': [{'a': x, 'b': y, 'rho': None if v is None else round(v, 3),
                   'basis': basis[(x, y)], 'obs': obs[(x, y)]}
                  for (x, y), v in sorted(rho.items()) if v is not None and v >= 0.80],
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(doc, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)
    sys.stderr.write('종목 %d → 덩이 %d · ρ≥0.80 짝 %d\n'
                     % (len(tks), len(gs), len(doc['pairs'])))
    print('썼다: %s' % a.out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
