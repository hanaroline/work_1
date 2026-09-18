#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자산배분 ETF 76종의 오늘 신호를 낸다.

**엔진은 손대지 않는다.** signal_lib.py 를 그대로 먹이고 build_signals.one() 을
그대로 부른다 — 여기서 셈을 한 줄이라도 다시 쓰면 같은 종목이 화면 두 곳에서 다른
점수를 내는 자리가 생긴다. 이 대본이 하는 일은 셋뿐이다: 일봉을 먹이고, **이력이
모자란 것을 모자란 대로 갈라 적고**, 견줄 수 있게 줄을 세운다.

이력으로 세 등급을 나눈다
──────────────────────────────────────────────────────────────────────
  온전(210세션 이상) — 축 넷 + 시계 넷 + 신호대 + 매매계획. 엔진의 온전한 출력.
  부분(120~209)      — 축과 지표만. **신호대와 매매계획을 내지 않는다.** 적응
                       가중치가 150세션을 태우고 시작하고 자기백분위는 60관측이
                       필요한데, 그걸 못 채운 채 「적극 매수」를 내면 그 글자는
                       근거가 없다.
  짧음(120 미만)     — 이름과 세션 수만. 이동평균 120일조차 서지 않는다.

**신설 ETF 가 많은 표다.** 짧은 것을 억지로 채워 점수를 내는 것이 이 표에서 가장
하기 쉬운 잘못이다. 모자란 것은 모자라다고 적는다.

성적표에 대하여
──────────────────────────────────────────────────────────────────────
data/signals/backtest.json 은 **국내 100 종목과 미국 100 종목의 개별 주식으로 잰
것이다.** ETF 로 잰 것이 아니다. 채권 ETF·채권혼합 50·커버드콜은 가격이 움직이는
방식 자체가 달라 그 성적을 옮겨 붙일 수 없다. 그래서 여기서는 백테스트 숫자를
싣지 않고 **싣지 않는 까닭을 싣는다.**

  python3 scripts/build_etf_signals.py
"""

import argparse
import json
import os
import statistics as st
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_signals as BS
import etf_list as L
import signal_lib as S

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
OUT = os.path.join(ROOT, 'data', 'etf', 'signals.json')

FULL_MIN = S.BURN_IN + 60      # 210 — build_signals.one() 이 요구하는 것과 같은 값
PARTIAL_MIN = 120              # 이동평균 120일이 서는 자리


def kst_now():
    return datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')


def bars_of(rec):
    b = rec['bars']
    return [{'d': b['d'][i], 'o': b['o'][i], 'h': b['h'][i], 'l': b['l'][i],
             'c': b['c'][i], 'v': b['v'][i] or 0} for i in range(len(b['d']))]


def partial(bars, rec):
    """축과 지표만. **시계·신호대·매매계획을 내지 않는다.**"""
    ind = S.compute_indicators(bars, None)
    rows = S.score_series(ind, bars)
    i = len(bars) - 1
    out = {'asof': bars[i]['d'], 'close': bars[i]['c'],
           'change_pct': round((bars[i]['c'] / bars[i - 1]['c'] - 1) * 100, 2),
           'axes': {}, 'horizons': {}}
    for k, ko in (('t', 'trend'), ('m', 'momentum'), ('f', 'flow'), ('s', 'supply')):
        v = rows[i][k]
        out['axes'][ko] = None if v is None else round(v, 1)
    out['conf'] = None if rows[i]['conf'] is None else round(rows[i]['conf'], 1)
    out['axes_missing'] = rows[i]['axes_missing']
    out['indicators'] = {k: BS._r(ind[k][i]) for k in
                         ('rsi14', 'macd_hist', 'adx14', 'atrp', 'rv20', 'pos52',
                          'ma20', 'ma60', 'ma120', 'disparity20', 'mfi14', 'stoch_k')}
    out['indicators']['squeeze'] = bool(ind['squeeze'][i])
    out['indicators']['squeeze_days'] = ind['squeeze_days'][i]
    return out


def drag(rec):
    """분배금이 **가격 추세를 얼마나 끌어내렸는가.**

    야후가 주는 adjclose(배당 보정)와 close(미보정)의 1년 수익률 차이다. 커버드콜·
    고배당 ETF 는 이 값이 크고, 그만큼 **가격 차트가 총수익보다 나쁘게 보인다.**
    추세·모멘텀 축은 가격만 보므로 그 몫이 점수에 그대로 들어간다 — 값을 적어
    두면 읽는 사람이 그것을 덜어서 읽을 수 있다.

    국내분은 네이버가 보정 계열을 주지 않으므로 잴 수 없다. **못 잰 것을 0 으로
    적지 않는다.**
    """
    adj = rec.get('adjclose')
    b = rec['bars']
    if not adj or len(adj) != len(b['c']):
        return None
    n = len(adj)
    lo = max(0, n - 253)
    if n - lo < 200 or not adj[lo] or not adj[-1] or not b['c'][lo]:
        return None
    tr = (adj[-1] / adj[lo] - 1) * 100
    pr = (b['c'][-1] / b['c'][lo] - 1) * 100
    return {'total_return_1y': round(tr, 2), 'price_return_1y': round(pr, 2),
            'drag_1y': round(tr - pr, 2), 'sessions': n - lo}


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--prices', default=PRICES)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    src = json.load(open(a.prices, encoding='utf-8'))
    items_by_ticker = src['items']

    result = {'generated_at_kst': kst_now(), 'horizons': S.HORIZONS,
              'engine_hash': BS.engine_hash(),
              'prices_generated_at_kst': src.get('generated_at_kst'),
              'price_sources': src.get('source'),
              'list_counts': L.counts(),
              'excluded_etn': [{'no': n, 'ticker': t, 'name': nm}
                               for n, t, nm in L.EXCLUDED_ETN],
              'tiers': {'full_min_sessions': FULL_MIN,
                        'partial_min_sessions': PARTIAL_MIN},
              'items': [], 'missing': []}

    for it in L.items():
        rec = items_by_ticker.get(it['ticker'])
        base = {k: it[k] for k in ('no', 'scope', 'group', 'theme', 'ticker', 'name')}
        if not rec:
            result['missing'].append(dict(base, reason='일봉을 받지 못했습니다'))
            continue
        bars = bars_of(rec)
        base.update({'symbol_used': rec.get('symbol_used'),
                     'name_source': rec.get('name_source'),
                     'instrument_type': rec.get('instrument_type'),
                     'currency': rec.get('currency'),
                     'exchange': rec.get('exchange'),
                     'route': rec.get('route'),
                     'sessions': len(bars),
                     'listed_from': rec.get('from'), 'asof': rec.get('to')})
        d = drag(rec)
        if d:
            base['distribution'] = d

        if len(bars) >= FULL_MIN:
            # **엔진을 그대로 부른다.** 벤치마크는 주지 않는다 — 미국 지수를 따라가는
            # 국내 ETF 를 코스피와 견준 상대강도는 그 ETF 의 추세가 아니다.
            r = BS.one(bars, None, it['name'], it['ticker'], it['scope'])
            r.update(base)
            r['tier'] = 'full'
            result['items'].append(r)
        elif len(bars) >= PARTIAL_MIN:
            r = dict(base, tier='partial')
            r.update(partial(bars, rec))
            r['tier_note'] = (
                '일봉 %d 세션 — 축과 지표는 셈했지만 **신호대와 매매계획은 내지 '
                '않습니다.** 적응가중치가 %d 세션을 태우고 시작하고 자기백분위에 '
                '60 관측이 필요한데 아직 못 채웠습니다.' % (len(bars), S.BURN_IN))
            result['items'].append(r)
        else:
            r = dict(base, tier='short')
            r['tier_note'] = ('일봉 %d 세션 — **점수를 내지 않습니다.** 이동평균 '
                              '120일조차 서지 않습니다.' % len(bars))
            result['items'].append(r)

    # 견줄 수 있게 줄을 세운다 — **온전한 것끼리만.**
    full = [x for x in result['items'] if x['tier'] == 'full']
    for h in S.HORIZONS:
        rows = [(x['ticker'], (x['horizons'].get(h) or {}).get('score'))
                for x in full]
        rows = [(t, s) for t, s in rows if s is not None]
        rows.sort(key=lambda r: -r[1])
        result.setdefault('ranking', {})[h] = [
            {'rank': i + 1, 'ticker': t, 'score': s} for i, (t, s) in enumerate(rows)]

    sc = [s for _, s in [(x['ticker'], (x['horizons'].get(20) or {}).get('score'))
                         for x in full] if s is not None]
    result['summary'] = {
        'full': len(full),
        'partial': sum(1 for x in result['items'] if x['tier'] == 'partial'),
        'short': sum(1 for x in result['items'] if x['tier'] == 'short'),
        'missing': len(result['missing']),
        'score20_median': round(st.median(sc), 1) if sc else None,
        'score20_positive': sum(1 for s in sc if s > 0),
        'score20_n': len(sc),
    }

    result['backtest_note'] = (
        'data/signals/backtest.json 의 성적은 **국내·미국 개별 주식 200 종목으로 잰 '
        '것이며 ETF 로 잰 것이 아닙니다.** 채권 ETF·채권혼합 50·커버드콜은 가격이 '
        '움직이는 방식이 달라 그 성적을 여기 옮겨 붙일 수 없습니다. 그래서 이 판에는 '
        '백테스트 숫자를 싣지 않았습니다 — **이 ETF들의 신호가 맞았는지는 아직 재지 '
        '않았다는 뜻입니다.**')
    result['bench_note'] = (
        '상대강도(rs20) 축은 비워 두었습니다. 지수를 따라가는 ETF 를 코스피와 견준 '
        '상대강도는 그 ETF 의 추세가 아니기 때문입니다 — 추세 축은 나머지 네 조각으로 '
        '셈했습니다.')
    result['disclaimer'] = (
        '정보 제공 목적의 사내 참고 자료이며 투자 권유가 아닙니다. 신호는 과거 자료로 '
        '만든 규칙의 출력이지 앞일에 대한 예측이 아닙니다. 고객에게 보여주는 자료로 '
        '쓸 경우 준법감시 부서 확인이 필요합니다.')

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(result, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False,
              separators=(',', ':'))
    sys.stderr.write('온전 %d · 부분 %d · 짧음 %d · 못받음 %d\n'
                     % (result['summary']['full'], result['summary']['partial'],
                        result['summary']['short'], result['summary']['missing']))
    print('썼다: %s' % a.out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
