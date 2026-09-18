# -*- coding: utf-8 -*-
"""오늘의 매수/매도 신호를 산출한다.

`data/signals/latest.json` 한 장에 지수·KR100·US100 의 오늘 판을 담는다. 화면은
이것만 읽는다 — 화면이 지표를 다시 셈하면 백테스트와 다른 값을 낼 자리가 생긴다.

**시계 네 개를 나란히 낸다.** 같은 종목이 5일과 60일에서 서로 다른 쪽을 가리키는
일이 흔하고 그 어긋남이 정보다. 하나로 뭉개면 그게 사라진다.
"""

import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import signal_lib as S
import signal_backtest as B
import vol_backtest as VB
import vol_lib as V

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))

OUT_DIR = os.path.join(ROOT, 'data', 'signals')

# 시나리오 확률은 표본 20일 미만이면 내지 않는다. vol_backtest 가 세운 규칙을
# 그대로 따른다 — 두 화면이 서로 다른 잣대로 확률을 내면 안 된다.
MIN_SCENARIO_OBS = VB.MIN_OBS if hasattr(VB, 'MIN_OBS') else 20


def engine_hash():
    """엔진 파일의 지문. 성적이 어느 모델의 것인지 대조하는 데 쓴다.

    signal_lib.py 하나만 본다 — build_signals.py 가 바뀌어도(화면에 실어 보낼
    항목을 늘리는 따위) 성적은 달라지지 않기 때문이다. 셈이 달라지는 자리는
    signal_lib.py 다.
    """
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'signal_lib.py')
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]


def kst_now():
    return datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')


import re

# 종목 이름표는 화면(kr-top100.html / us-top100.html)의 COMPANIES 배열이 갖고 있다.
# 거기 말고는 이 저장소에 한글명을 온전히 담은 자리가 없다 — kr100-data 가지의
# latest.json·quotes.json 에는 시세만 있고 이름이 없다. 같은 표를 여기 또 적어 두면
# 목록이 바뀔 때 한쪽만 고쳐져 어긋나므로, **있는 것을 읽어 쓴다.**
_COMPANY_ROW = re.compile(r"\['([^']+)','([^']*)','([^']*)'")


def load_names(market):
    """종목코드 → 이름. 못 찾으면 코드를 그대로 쓴다(빈 이름을 지어내지 않는다)."""
    out = {}
    page = 'kr-top100.html' if market == 'KR' else 'us-top100.html'
    p = os.path.join(ROOT, page)
    if not os.path.exists(p):
        return out
    txt = open(p, encoding='utf-8').read()
    m = re.search(r'var COMPANIES = \[(.*?)\n\];', txt, re.S)
    if not m:
        return out
    for sym, en, ko in _COMPANY_ROW.findall(m.group(1)):
        nm = (ko or en).strip()
        if sym and nm:
            out[sym] = nm
            out[sym.split('.')[0]] = nm
    return out


FLOW_PATH = os.path.join(ROOT, 'data', 'flows', 'kr100.json')


def load_flows(path=None):
    """종목별 외국인·기관 수급. 없으면 빈 것을 낸다 — 없는 축은 없는 채로 둔다."""
    path = path or FLOW_PATH
    if not os.path.exists(path):
        return {}
    try:
        return json.load(open(path, encoding='utf-8')).get('stocks') or {}
    except Exception as e:
        sys.stderr.write('수급 파일을 읽지 못했다: %s\n' % e)
        return {}


def align_flow(bars, s):
    """수급을 일봉 날짜에 맞춰 세우고 누적을 셈한다.

    `signal_lib.axis_flow` 가 먹는 꼴로 맞춘다 — foreign_cum5/20, inst_cum5/20.
    **없는 날은 None 이다. 0 이 아니다.** 0 으로 채우면 「사지도 팔지도 않았다」가
    되어 자료가 빠진 날마다 수급 축이 중립으로 끌려간다.

    누적은 **그날까지의 뒤돌아본 5·20일 합**이다. 창 안에 빠진 날이 절반을 넘으면
    그 누적도 내지 않는다 — 두 날치로 잰 「20일 누적」은 20일 누적이 아니다.
    """
    if not s or not s.get('d'):
        return None
    by = {}
    for k, d in enumerate(s['d']):
        by[d] = (s['f'][k] if k < len(s.get('f') or []) else None,
                 s['i'][k] if k < len(s.get('i') or []) else None)
    n = len(bars)
    f = [None] * n
    i_ = [None] * n
    for k, b in enumerate(bars):
        v = by.get(b['d'])
        if v:
            f[k], i_[k] = v

    def cum(xs, w):
        out = [None] * n
        for k in range(n):
            lo = max(0, k - w + 1)
            win = xs[lo:k + 1]
            have = [x for x in win if x is not None]
            if len(win) == w and len(have) > w * 0.5:
                out[k] = sum(have)
        return out

    if not any(x is not None for x in f) and not any(x is not None for x in i_):
        return None
    return {'foreign': f, 'inst': i_,
            'foreign_cum5': cum(f, 5), 'foreign_cum20': cum(f, 20),
            'inst_cum5': cum(i_, 5), 'inst_cum20': cum(i_, 20)}


def scenario_probs(bars, rows, scores, self_pcts, i):
    """오늘과 **같은 신호대**였던 과거 날들의 이후 분포.

    열쇠를 국면(phase)이 아니라 신호대로 둔다 — 여기서 묻는 것이 「이 신호가
    나왔을 때 그 뒤가 어땠나」이기 때문이다. 표본이 모자라면 확률을 내지 않고
    모자라다고 적는다. 아무 말도 못 하는 것이 틀린 말을 하는 것보다 낫다.
    """
    band, _ = S.band_of(self_pcts[i])
    if band is None:
        return {'note': '표본이 모자라 확률을 내지 않습니다', 'samples': 0}
    out = {'band': band, 'horizons': {}}
    for h in S.HORIZONS:
        rs = []
        for j in range(i):
            if self_pcts[j] is None:
                continue
            b2, _ = S.band_of(self_pcts[j])
            if b2 != band:
                continue
            r = S.forward_ret(bars, j, h)
            if r is not None:
                rs.append(r)
        if len(rs) < MIN_SCENARIO_OBS:
            out['horizons'][h] = {'samples': len(rs),
                                  'note': '같은 신호대 표본 %d 일 — 확률을 내지 않습니다' % len(rs)}
            continue
        rs.sort()
        n = len(rs)
        up = sum(1 for x in rs if x > 0)
        out['horizons'][h] = {
            'samples': n,
            'up_prob': round(up / n * 100, 1),
            'median': round(rs[n // 2], 2),
            'p10': round(rs[int(n * 0.10)], 2),
            'p90': round(rs[int(n * 0.90)], 2),
            'mean': round(sum(rs) / n, 2),
        }
    return out


def reasons(ind, row, i, plan):
    """왜 이 신호인가 — 사람이 읽는 문장. 숫자를 그대로 달아 검산할 수 있게 한다."""
    out = []
    ax = {'trend': ('추세', row['t']), 'momentum': ('모멘텀', row['m']),
          'flow': ('자금수급', row['f']), 'supply': ('매물대', row['s'])}
    for k, (ko, val) in ax.items():
        if val is None:
            out.append({'axis': k, 'text': '%s 축은 자료가 모자라 셈하지 못했습니다' % ko,
                        'value': None})
            continue
        w = (row['weights_used'] or {}).get(k)
        out.append({'axis': k, 'value': round(val, 1), 'weight': w,
                    'text': '%s %+.0f점 (가중 %.0f%%)' % (ko, val, (w or 0) * 100)})

    vp = row.get('vp')
    if vp:
        out.append({'axis': 'supply_detail',
                    'text': '현재가 위에 %.0f%%, 아래에 %.0f%% 의 물량이 쌓여 있습니다 '
                            '(최근 %d세션 거래대금 기준)'
                            % (vp['above_pct'], vp['below_pct'], vp['sessions']),
                    'value': round(vp['above_pct'], 1)})
    if ind['rsi14'][i] is not None:
        out.append({'axis': 'rsi', 'value': round(ind['rsi14'][i], 1),
                    'text': 'RSI(14) %.1f' % ind['rsi14'][i]})
    if ind['macd_hist'][i] is not None:
        out.append({'axis': 'macd', 'value': round(ind['macd_hist'][i], 4),
                    'text': 'MACD 히스토그램 %+.2f' % ind['macd_hist'][i]})
    if ind['adx14'][i] is not None:
        t = S.trend_tilt(ind, i)
        out.append({'axis': 'adx', 'value': round(ind['adx14'][i], 1),
                    'text': 'ADX %.0f — %s 장으로 보고 모멘텀을 %s 로 읽었습니다'
                            % (ind['adx14'][i],
                               '추세' if (t or 0) > 0 else '횡보',
                               '순추세' if (t or 0) > 0 else '되돌림')})
    if ind['squeeze'][i]:
        out.append({'axis': 'squeeze',
                    'text': '볼린저·켈트너 스퀴즈 %d일째 — 방향은 아직 없고 에너지만 쌓인 자리입니다'
                            % (ind['squeeze_days'][i] or 0),
                    'value': ind['squeeze_days'][i]})
    return out


def one(bars, bench, name, symbol, market, flow=None):
    """종목 하나의 오늘 판."""
    if len(bars) < S.BURN_IN + 60:
        return {'symbol': symbol, 'name': name, 'market': market,
                'note': '일봉 %d 세션 — 점수를 내기에 모자랍니다' % len(bars)}
    ind = S.compute_indicators(bars, bench)
    fl = align_flow(bars, flow) if flow else None
    rows = S.score_series(ind, bars, flow=fl)
    i = len(bars) - 1

    out = {'symbol': symbol, 'name': name, 'market': market,
           'asof': bars[i]['d'], 'close': bars[i]['c'],
           'change_pct': round((bars[i]['c'] / bars[i - 1]['c'] - 1) * 100, 2),
           'axes': {}, 'horizons': {}}

    for k, ko in (('t', 'trend'), ('m', 'momentum'), ('f', 'flow'), ('s', 'supply')):
        v = rows[i][k]
        out['axes'][ko] = None if v is None else round(v, 1)
    out['conf'] = None if rows[i]['conf'] is None else round(rows[i]['conf'], 1)
    out['axes_missing'] = rows[i]['axes_missing']

    # 수급 축에 **종목별 외국인·기관 자료가 실제로 들어간 날이 며칠인지** 적는다.
    # 백테스트는 이 자료 없이 잰 것이라, 들어가기 시작하면 화면이 그 사실을 말해야
    # 한다. (자료가 쌓이는 만큼 λ 가 올라가 가중치도 저절로 커진다)
    if fl:
        cov = sum(1 for x in fl['foreign'] if x is not None)
        out['flow_data'] = {
            'sessions': cov,
            'in_score': sum(1 for x in fl['foreign_cum20'] if x is not None),
            'latest_foreign': _r(fl['foreign'][i]),
            'latest_inst': _r(fl['inst'][i]),
            'cum20_foreign': _r(fl['foreign_cum20'][i]),
            'cum20_inst': _r(fl['inst_cum20'][i]),
        }
        # **점수에 들어갔는지와 자료가 실렸는지는 다른 말이다.**
        #
        # 처음에는 「수급 축에 N 세션 실렸습니다」로 시작하는 문구를 냈다. 그런데
        # 자료가 열흘뿐인 지금은 20일 누적이 서지 않고 z점수의 최소관측(15)도 못
        # 채워 **점수에 한 날도 들어가지 않는다.** 그 상태에서 「실렸습니다」로
        # 시작하면 급히 보는 사람은 반영된 줄로 읽는다. 들어갔을 때와 아직
        # 아닐 때를 갈라 적는다.
        if out['flow_data']['in_score'] == 0:
            out['flow_data']['note'] = (
                '외국인·기관 순매수를 %d 세션 모았지만 **아직 점수에 들어가지 '
                '않습니다.** 20일 누적이 서려면 스무 세션이, z점수를 재려면 열닷새가 '
                '더 필요합니다 — 날마다 쌓이고 있으니 저절로 들어갑니다. 아래 수치는 '
                '참고로만 보십시오.' % cov)
        else:
            out['flow_data']['note'] = (
                '외국인·기관 순매수가 %d 세션 실렸고 그 가운데 %d 일이 점수에 '
                '들어갔습니다. **백테스트는 이 자료 없이 잰 것입니다** — 성적표가 '
                '이 축을 포함하지 않습니다.'
                % (cov, out['flow_data']['in_score']))

    vp = rows[i].get('vp')
    if vp:
        out['volume_profile'] = {
            'poc': round(vp['poc'], 2), 'val': round(vp['val'], 2),
            'vah': round(vp['vah'], 2),
            'above_pct': round(vp['above_pct'], 1),
            'below_pct': round(vp['below_pct'], 1),
            'nearest_up': None if vp['nearest_up'] is None else round(vp['nearest_up'], 2),
            'nearest_dn': None if vp['nearest_dn'] is None else round(vp['nearest_dn'], 2),
            'sessions': vp['sessions'],
            'bins': [{'lo': round(vp['lo'] + k * vp['width'], 2),
                      'hi': round(vp['lo'] + (k + 1) * vp['width'], 2),
                      'pct': round(vp['buckets'][k] / vp['total'] * 100, 2)}
                     for k in range(vp['bins'])],
        }

    for h in S.HORIZONS:
        scores, wmap, hist = S.adaptive_series(bars, rows, h=h)
        sp = S.self_pct_series(scores)
        if scores[i] is None:
            out['horizons'][h] = {'note': '가중치를 재기에 이력이 모자랍니다'}
            continue
        rw = dict(rows[i])
        rw['weights_used'] = wmap[i] or rows[i]['weights_used']
        plan = S.plan_of(ind, rw, i, h, sp[i])
        out['horizons'][h] = {
            'score': round(scores[i], 1),
            'self_pct': None if sp[i] is None else round(sp[i], 1),
            'weights': wmap[i],
            'weight_fit': hist[-1]['detail'] if hist else None,
            'plan': plan,
            'scenario': scenario_probs(bars, rows, scores, sp, i),
            'reasons': reasons(ind, rw, i, plan),
        }

    out['indicators'] = {
        'rsi14': _r(ind['rsi14'][i]), 'macd': _r(ind['macd'][i]),
        'macd_signal': _r(ind['macd_signal'][i]), 'macd_hist': _r(ind['macd_hist'][i]),
        'bb_up': _r(ind['bb_up'][i]), 'bb_lo': _r(ind['bb_lo'][i]),
        'bb_mid': _r(ind['bb_mid'][i]), 'pctb': _r(ind['pctb'][i], 3),
        'bbw': _r(ind['bbw'][i]), 'squeeze': bool(ind['squeeze'][i]),
        'squeeze_days': ind['squeeze_days'][i],
        'atr14': _r(ind['atr14'][i]), 'atrp': _r(ind['atrp'][i]),
        'rv20': _r(ind['rv20'][i]), 'rv5': _r(ind['rv5'][i]),
        'adx14': _r(ind['adx14'][i]), 'plus_di': _r(ind['plus_di'][i]),
        'minus_di': _r(ind['minus_di'][i]),
        'mfi14': _r(ind['mfi14'][i]), 'stoch_k': _r(ind['stoch_k'][i]),
        'stoch_d': _r(ind['stoch_d'][i]),
        'ma5': _r(ind['ma5'][i]), 'ma20': _r(ind['ma20'][i]),
        'ma60': _r(ind['ma60'][i]), 'ma120': _r(ind['ma120'][i]),
        'pos52': _r(ind['pos52'][i]), 'rs20': _r(ind['rs20'][i]),
        'obv_slope20': _r(ind['obv_slope20'][i], 4),
        'disparity20': _r(ind['disparity20'][i]),
    }
    # 화면이 차트를 그릴 만큼만 실어 보낸다(마지막 250세션).
    #
    # **화면이 실제로 쓰는 계열만 싣는다.** 처음에는 고가·저가·거래량·RSI·MACD 도
    # 함께 실었는데, 화면이 그리지 않는 것들이라 파일만 6.5MB 로 불었다. 날마다
    # 커밋되는 파일이므로 저장소 이력이 그만큼 무거워진다. 나중에 쓸지 모른다는
    # 이유로 싣지 않는다 — 쓸 때 늘리면 된다.
    lo = max(0, len(bars) - 250)
    out['chart'] = {
        'd': [b['d'] for b in bars[lo:]],
        'c': [_p(b['c']) for b in bars[lo:]],
        'ma20': [_p(x) for x in ind['ma20'][lo:]],
        'ma60': [_p(x) for x in ind['ma60'][lo:]],
        'bb_up': [_p(x) for x in ind['bb_up'][lo:]],
        'bb_lo': [_p(x) for x in ind['bb_lo'][lo:]],
    }
    return out


def _r(x, n=2):
    return None if x is None else round(x, n)


def _p(x):
    """차트용 가격 — 자리수를 값 크기에 맞춘다.

    25만원짜리를 253500.0 이 아니라 253500 으로 적는다. 화면에서 소수점 아래가
    보이지도 않는데 글자만 차지한다. 1000 미만은 소수 둘째 자리까지 남긴다.
    """
    if x is None:
        return None
    return round(x) if abs(x) >= 1000 else round(x, 2)


def main(argv):
    limit = int(argv[argv.index('--limit') + 1]) if '--limit' in argv else 0
    markets = (argv[argv.index('--market') + 1].split(',')
               if '--market' in argv else ['KR', 'US'])
    out_dir = argv[argv.index('--out-dir') + 1] if '--out-dir' in argv else OUT_DIR

    os.makedirs(out_dir, exist_ok=True)
    result = {'generated_at_kst': kst_now(), 'horizons': S.HORIZONS,
              'items': [], 'universe': {}}

    # 지수 먼저 — 코스피 프록시
    hp = os.path.join(ROOT, 'data/volatility/history.json')
    idx_bars = None
    if os.path.exists(hp):
        h = json.load(open(hp, encoding='utf-8'))
        ib = (h.get('index') or {}).get('bars') or []
        if ib:
            idx_bars = [{'d': b['d'], 'o': b['o'], 'h': b['h'], 'l': b['l'],
                         'c': b['c'], 'v': b.get('value') or 0} for b in ib]
            r = one(idx_bars, None, (h.get('index') or {}).get('name') or '코스피 프록시',
                    'KOSPI_PROXY', 'INDEX')
            r['index_basis'] = (h.get('index') or {}).get('basis')
            r['index_validation'] = (h.get('index') or {}).get('validation')
            result['items'].append(r)

    idx_close = {b['d']: b['c'] for b in idx_bars} if idx_bars else None

    flows = load_flows(argv[argv.index('--flows') + 1] if '--flows' in argv else None)
    if flows:
        sys.stderr.write('종목별 수급 %d 종목\n' % len(flows))

    for mk, branch, prefix in B.UNIVERSES:
        if mk not in markets:
            continue
        names = load_names(mk)
        paths = B.list_universe(branch, prefix)
        if limit:
            paths = paths[:limit]
        cnt = 0
        used = {}
        for p in paths:
            # **백테스트와 같은 문을 쓴다**(B.bars_for). 갈라 두면 화면이 네이버로
            # 셈한 신호를 내면서 성적표는 야후로 잰 것이 된다.
            bars, src = B.bars_for(mk, branch, p)
            if not bars:
                continue
            used[src] = used.get(src, 0) + 1
            sym = os.path.basename(p)[:-5]
            bench = [idx_close.get(b['d']) for b in bars] if (mk == 'KR' and idx_close) else None
            result['items'].append(one(bars, bench, names.get(sym, sym), sym, mk,
                                       flow=flows.get(sym) if mk == 'KR' else None))
            cnt += 1
        result['universe'][mk] = cnt
        result.setdefault('price_sources', {})[mk] = used
        sys.stderr.write('%s %d 종목 — 가격 출처 %s\n'
                         % (mk, cnt, json.dumps(used, ensure_ascii=False)))

    # 화면이 목록을 빨리 그릴 수 있도록 요약만 따로 뽑아 둔다
    result['summary'] = []
    for it in result['items']:
        h20 = (it.get('horizons') or {}).get(20) or (it.get('horizons') or {}).get('20') or {}
        plan = h20.get('plan') or {}
        result['summary'].append({
            'symbol': it['symbol'], 'name': it.get('name'), 'market': it.get('market'),
            'close': it.get('close'), 'change_pct': it.get('change_pct'),
            'band': plan.get('band'), 'band_label': plan.get('band_label'),
            'score': h20.get('score'), 'self_pct': h20.get('self_pct'),
            'conf': it.get('conf'),
        })

    # 시장마다 백테스트가 다른 말을 한다. **그 말을 종목 옆에 붙여 보낸다.**
    #
    # 이 자료에서 미국 100종목은 시계 넷이 모두 음수였다 — 신호가 높은 날 뒤가
    # 오히려 평상시보다 나빴다는 뜻이다. 그걸 화면 맨 아래 한계 문단에만 적어 두면
    # 종목 하나를 띄워 놓고 「적극 매수」를 보는 사람에게는 닿지 않는다.
    result['market_caveats'] = {}
    result['engine_hash'] = engine_hash()
    btp = os.path.join(out_dir, 'backtest.json')
    if os.path.exists(btp):
        try:
            bt = json.load(open(btp, encoding='utf-8'))
            # **성적이 어느 모델의 것인지 대조한다.**
            #
            # 백테스트는 손으로만 돌리므로(성적이 날마다 바뀌면 안 되니까) 모델을
            # 고친 뒤 다시 돌리는 것을 잊으면, 화면은 새 모델의 신호를 내면서
            # 옛 모델의 성적을 「이 신호는 이렇습니다」로 싣게 된다. 사람이 기억해서
            # 막을 일이 아니다 — 엔진 해시를 양쪽에 적어 두고 어긋나면 적는다.
            # 해시가 **없는** 것도 낡은 것으로 친다. 확인할 수 없는 것을 괜찮다고
            # 치면, 해시를 붙이기 전에 만들어진 판이 조용히 통과한다 — 실제로
            # 이 저장소에서 그 일이 한 번 났다.
            bh = bt.get('engine_hash')
            if bh != result['engine_hash']:
                result['backtest_stale'] = {
                    'backtest_engine': bh or '(적히지 않음)',
                    'current_engine': result['engine_hash'],
                    'text': (('아래 성적은 **지금 모델의 것이 아닙니다.** signal_lib.py 가 '
                              '백테스트를 돌린 뒤에 바뀌었습니다.')
                             if bh else
                             ('아래 성적이 **어느 모델의 것인지 적혀 있지 않습니다.** '
                              '엔진 해시를 붙이기 전에 만들어진 판입니다.')) +
                            ' 다시 돌리기 전까지는 성적을 그대로 읽지 마십시오.'}
                sys.stderr.write('::warning::backtest.json 이 지금 모델의 것이 아니다 '
                                 '(%s != %s)\n' % (bh or '없음', result['engine_hash']))

            # **어느 가격으로 잰 성적인가.** 모델이 같아도 가격 출처가 다르면
            # 그 성적은 지금 신호의 것이 아니다. 2026-09-18 에 국내 일봉을
            # 야후에서 네이버로 옮기면서 실제로 생긴 문제다 — 엔진 해시는 그대로라
            # 기존 검사로는 잡히지 않는다. 있는 검사를 늘리는 것이 아니라
            # **다른 것을 재는 검사를 하나 더 두는 것**이다.
            def _kind(srcs):
                """{'KR': {'naver': 100}} → 'KR:naver' 꼴로 견줄 수 있게 줄인다."""
                out = []
                for m in sorted(srcs or {}):
                    u = srcs[m] or {}
                    out.append('%s:%s' % (m, '+'.join(sorted(k for k in u if k))))
                return ','.join(out) or '(적히지 않음)'

            cur_src, bt_src = _kind(result.get('price_sources')), _kind(bt.get('price_sources'))
            if cur_src != bt_src:
                result['backtest_price_stale'] = {
                    'backtest_prices': bt_src, 'current_prices': cur_src,
                    'text': ('아래 성적은 **지금과 다른 가격으로 잰 것입니다** '
                             '(성적 %s / 지금 %s). 모델은 같지만 먹인 일봉이 다릅니다 — '
                             '다시 돌리기 전까지 성적을 그대로 읽지 마십시오.'
                             % (bt_src, cur_src))}
                sys.stderr.write('::warning::backtest.json 이 다른 가격으로 잰 것이다 '
                                 '(%s != %s)\n' % (bt_src, cur_src))
            for mk in ('KR', 'US'):
                ds = []
                for h, hv in (bt.get('horizons') or {}).items():
                    m = ((hv.get('flip') or {}).get(mk) or {})
                    bo = (m.get('event') or {}).get('bootstrap') or {}
                    if bo.get('diff') is not None:
                        ds.append(bo['diff'])
                if len(ds) < 3:
                    continue
                if all(d < 0 for d in ds):
                    result['market_caveats'][mk] = {
                        'level': 'danger',
                        'text': ('백테스트에서 이 시장은 **시계 넷이 모두 음수**였습니다'
                                 '(%s%%p) — 신호가 높던 날 뒤가 오히려 평상시보다 나빴습니다. '
                                 '이 시장의 신호는 그대로 따르지 마십시오.'
                                 % ' / '.join('%+.2f' % d for d in ds))}
                elif all(d > 0 for d in ds):
                    result['market_caveats'][mk] = {
                        'level': 'warn',
                        'text': ('백테스트에서 이 시장은 시계 넷이 모두 양수였습니다'
                                 '(%s%%p). 다만 **여러 번 시험한 것을 보정하면 유의하지 '
                                 '않습니다** — 방향이 일관된다는 약한 증거일 뿐입니다.'
                                 % ' / '.join('%+.2f' % d for d in ds))}
            result['backtest_summary_ko'] = bt.get('summary_ko')
        except Exception as e:
            sys.stderr.write('백테스트를 읽지 못했다: %s\n' % e)

    result['disclaimer'] = (
        '정보 제공 목적의 사내 참고 자료이며 투자 권유가 아닙니다. 신호는 과거 자료로 '
        '만든 규칙의 출력이지 앞일에 대한 예측이 아닙니다. 백테스트 결과와 그 한계는 '
        'data/signals/backtest.json 과 README 를 함께 보십시오. 고객에게 보여주는 '
        '자료로 쓸 경우 준법감시 부서 확인이 필요합니다.')

    p = os.path.join(out_dir, 'latest.json')
    json.dump(result, open(p, 'w', encoding='utf-8'), ensure_ascii=False,
              separators=(',', ':'))
    sys.stderr.write('썼다: %s (%d 종목)\n' % (p, len(result['items'])))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
