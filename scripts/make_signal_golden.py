# -*- coding: utf-8 -*-
"""파이썬 엔진의 **기준값**을 뽑아 둔다.

docs/signal/signal_engine.js 는 scripts/signal_lib.py 와 같은 셈을 해야 한다.
그런데 사람이 두 벌을 맞춰 고치는 일은 언젠가 반드시 어긋난다 — 특히 표본표준편차
같은 사소한 약속에서.

그래서 여기서 파이썬이 낸 값을 파일로 박아 두고, check_signal_page.mjs 가 헤드리스
브라우저에서 JS 를 돌려 이 값과 맞는지 본다. 어긋나면 CI 가 멈춘다.

**일봉도 함께 박아 둔다.** 기준값만 두면 JS 시험이 다른 자료를 먹어 다른 값이
나오고도 「어긋났다」고만 나온다. 같은 입력에 같은 출력인지를 물어야 한다.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import signal_lib as S
import signal_backtest as B

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'signal', 'golden.json')

# 성격이 다른 종목을 고른다 — 추세가 센 것, 눌린 것, 크게 빠진 것이 섞여야
# 축마다 다른 갈래가 밟힌다.
CASES = [
    ('KR', 'origin/kr100-data', 'data/kr100/chart/005930.KS.json'),
    ('KR', 'origin/kr100-data', 'data/kr100/chart/000660.KS.json'),
    ('US', 'origin/us100-data', 'data/us100/chart/AAPL.json'),
    ('US', 'origin/us100-data', 'data/us100/chart/NVDA.json'),
]

# 마지막 날만 대조하면 앞쪽 갈래(표본이 모자란 구간, 가중치를 다시 재는 날)를
# 한 번도 안 밟는다. 여러 날을 뽑아 둔다.
OFFSETS = [0, 1, 5, 20, 60, 120]


def _r(x, n=8):
    return None if x is None else round(float(x), n)


def main(argv):
    out = {'note': ('scripts/signal_lib.py 가 낸 값이다. docs/signal/signal_engine.js 가 '
                    '같은 일봉에서 같은 값을 내야 한다. scripts/check_signal_page.mjs 가 대조한다.'),
           'cases': []}
    for market, branch, path in CASES:
        bars = B.load_bars(branch, path)
        if not bars:
            sys.stderr.write('건너뜀: %s\n' % path)
            continue
        ind = S.compute_indicators(bars)
        rows = S.score_series(ind, bars)
        n = len(bars)

        case = {'symbol': os.path.basename(path)[:-5], 'market': market,
                'bars': [{'d': b['d'], 'o': b['o'], 'h': b['h'], 'l': b['l'],
                          'c': b['c'], 'v': b['v']} for b in bars],
                'points': []}

        ikeys = ['rsi14', 'macd', 'macd_signal', 'macd_hist', 'bb_up', 'bb_lo',
                 'bb_mid', 'bbw', 'pctb', 'atr14', 'atrp', 'rv5', 'rv20', 'rv60',
                 'adx14', 'plus_di', 'minus_di', 'mfi14', 'stoch_k', 'stoch_d',
                 'ma5', 'ma20', 'ma60', 'ma120', 'obv_slope20', 'pos52',
                 'disparity20', 'disparity60', 'ma20_slope', 'ret5', 'ret20',
                 'squeeze_days']
        for off in OFFSETS:
            i = n - 1 - off
            if i < 0:
                continue
            pt = {'i': i, 'd': bars[i]['d'],
                  'ind': {k: _r(ind[k][i]) for k in ikeys},
                  'axes': {'t': _r(rows[i]['t']), 'm': _r(rows[i]['m']),
                           'f': _r(rows[i]['f']), 's': _r(rows[i]['s'])},
                  'total': _r(rows[i]['total']), 'conf': _r(rows[i]['conf'])}
            vp = rows[i].get('vp')
            if vp:
                pt['vp'] = {'poc': _r(vp['poc']), 'val': _r(vp['val']), 'vah': _r(vp['vah']),
                            'above_pct': _r(vp['above_pct']), 'below_pct': _r(vp['below_pct']),
                            'nearest_up': _r(vp['nearest_up']), 'nearest_dn': _r(vp['nearest_dn'])}
            case['points'].append(pt)

        # 시계별 워크포워드 결과도 박아 둔다 — 가중치 셈이 어긋나는 것이 지표가
        # 어긋나는 것보다 잡기 어렵다(점수만 조금 달라지고 아무 데도 안 터진다).
        case['horizons'] = {}
        for h in S.HORIZONS:
            sc, wm, hist = S.adaptive_series(bars, rows, h=h)
            sp = S.self_pct_series(sc)
            i = n - 1
            plan = S.plan_of(ind, dict(rows[i], weights_used=wm[i] or rows[i]['weights_used']),
                             i, h, sp[i])
            case['horizons'][str(h)] = {
                'score': _r(sc[i]), 'self_pct': _r(sp[i]),
                'weights': {k: _r(v) for k, v in (wm[i] or {}).items()},
                'band': plan.get('band'),
                'stop': _r(plan.get('stop')), 'target': _r(plan.get('target')),
                'weight': _r(plan.get('weight')),
            }
        out['cases'].append(case)
        sys.stderr.write('%s: 점 %d, 일봉 %d\n' % (case['symbol'], len(case['points']), n))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False,
              separators=(',', ':'))
    sys.stderr.write('썼다: %s (%.1f MB)\n' % (OUT, os.path.getsize(OUT) / 1e6))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
