# -*- coding: utf-8 -*-
"""실적 서프라이즈 뒤에 정말 움직이는가 — **대조군을 세우고 재려다 못 잰 기록.**

## 먼저 결론

**잴 수 없었다.** 이 저장소에 **실적 발표일이 없기 때문이다.**

야후가 주는 `surprises[].ts` 는 발표일처럼 보이지만 실은 **그 분기의 마지막
날**이다. 국내 293 건이 딱 네 날짜(9·12·3·6월 말)에 몰려 있는 것이 증거고,
미국도 395 건 중 82% 가 분기말이다. 실제 발표는 결산일로부터 사오 주 뒤다.

그 날짜로 「다음 거래일에 산다」고 하면 **아직 공표되지 않은 실적을 알고 산 것**이
된다. 미리보기 편향이고, 그렇게 나온 초과수익(국내 20일 「크게 웃돔」 +7.89%p)은
실전에서 낼 수 없는 수다. 대본이 그것을 스스로 알아채고 산출물과 화면에 「실전
규칙이 아님」을 박는다 — `date_quality` 를 보라.

**그래서 실적은 점수가 아니라 딱지로 쓴다.** 판정 엔진이 실적에 가중치를 주지
않는 까닭이 이것이다. 잴 수 없는 것에 무게를 매기면 그 무게는 지어낸 것이 된다.
앞으로 발표일을 모으게 되면(캘린더의 `earnings` 는 앞일만 있다) 이 대본을 그대로
다시 돌려 점수로 올릴지 가릴 수 있다.

## 그래도 왜 남겨 두는가

셋 때문이다. ① 다음에 누가 같은 생각을 할 때 **여기까지 와 봤다는 기록**이 되고,
② 발표일이 생기면 곧바로 다시 돌릴 수 있고, ③ 대조군·클러스터 부트스트랩·
다중검정 보정이라는 **잣대 자체는 옳아서** 다른 사건에 그대로 쓸 수 있다.

## 원래 무엇을 재려 했는가

「실적이 좋은 종목을 사라」는 누구나 할 수 있는 말이다. 이 대본이 하려던 일은 그
말에 숫자를 붙이는 것이다 — 추정치를 웃돈 발표 뒤 20 거래일에 얼마를 벌었고,
**아무 날에나 사서 같은 기간 들고 있은 것보다 나았는가.**

## 무엇을 재는가

    사건    kr100-data / us100-data 의 surprises — 최근 네 분기 발표
            (추정 EPS, 실제 EPS, 차이, 서프라이즈 %)
    진입    발표일 **다음 거래일 시가**. 매매 타이밍 백테스트와 같은 규칙이다.
            발표가 장중이었는지 장 마감 뒤였는지 일봉으로는 알 수 없으므로
            하루를 통째로 건너뛴다 — 모를 때 유리한 쪽을 고르지 않는다.
    청산    5 · 10 · 20 · 60 거래일 뒤 시가
    대조군  같은 시장 · 같은 보유일수 · 같은 문(시가→시가)의 무작위 진입.
            `kis_timing_backtest.baseline` 을 그대로 부른다.

## 왜 이것만 잴 수 있는가

기업 자료는 **오늘 한 장의 스냅샷**이다. 어제의 PER 도, 석 달 전의 목표주가도
이 저장소에 없다. 그래서 「PER 이 낮을 때 샀으면」은 **잴 수 없다** — 그 값을
과거 시점으로 되돌릴 방법이 없기 때문이다.

서프라이즈만 다르다. 발표일(ts)과 그때의 추정·실제가 함께 적혀 있어, 일봉과
맞대면 **그 사건 뒤에 무슨 일이 있었는지**를 실제로 잴 수 있다. 실적 겹에서
숫자로 말할 수 있는 것은 지금 이것뿐이고, 나머지는 잴 수 없으니 **가중치를 주지
않고 딱지로만 쓴다.**

## 이 수를 얼마나 믿을 것인가

세 가지를 깎아 읽어야 한다. 산출물에도 그대로 적는다.

  1. **종목당 네 분기뿐이다.** 한 시장에 400 건 안팎이고, 그마저 같은 몇 주에
     몰려 있다 — 서로 독립이 아니다. 같은 장세를 여러 번 센 것에 가깝다.
  2. **오늘의 100대 기업만 본다.** 그 사이 밀려난 회사는 목록에 없다(생존 편향).
  3. **한 번 재고 고르면 그건 자료에 맞춰 깎은 것이다.** 이 표는 실적 겹을
     점수로 쓸지 딱지로 쓸지 가리는 잣대이지, 여기서 문턱을 골라 실전에 넣는
     도구가 아니다.

쓰는 법
  python3 scripts/earnings_drift.py                  # 국내·미국 주식 모두
  python3 scripts/earnings_drift.py --market US_STOCK
  python3 scripts/earnings_drift.py --json data/kis_timing/earnings_drift.json
"""

import argparse
import json
import math
import os
import random
import statistics as st
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_timing_data as D
import kis_timing_backtest as B
import stock_facts as S

ROOT = D.ROOT
KST = timezone(timedelta(hours=9))

HORIZONS = [5, 10, 20, 60]
MARKETS = ['KR_STOCK', 'US_STOCK']

# 서프라이즈 크기 칸. **먼저 정하고 재는 것**이 요점이다 — 재고 나서 칸을
# 그리면 어디를 잘라도 좋아 보이는 자리가 나온다.
BUCKETS = [
    ('크게 웃돔', lambda p: p >= 10),
    ('웃돔', lambda p: 0 < p < 10),
    ('밑돎', lambda p: -10 < p <= 0),
    ('크게 밑돎', lambda p: p <= -10),
]

MIN_EVENTS = 20


def _is_quarter_end(d):
    """분기말인가 — 3·6·9·12월의 마지막 사흘."""
    try:
        t = datetime.strptime(d, '%Y-%m-%d')
    except ValueError:
        return False
    if t.month not in (3, 6, 9, 12):
        return False
    nxt = (t.replace(day=28) + timedelta(days=4)).replace(day=1)
    return (nxt - t).days <= 3


def date_quality(evs):
    """**이 날짜가 정말 「발표일」인가.**

    야후가 주는 `surprises[].ts` 는 발표일이 아니라 **그 분기의 마지막 날**인 때가
    많다. 국내 293 건이 딱 네 날짜(9·12·3·6월 말)에 몰려 있는 것이 그 증거다.

    그걸 발표일로 알고 「다음 거래일에 산다」고 하면, 실제 발표는 그로부터 사오 주
    뒤이므로 **아직 공표되지 않은 실적을 알고 산 것**이 된다. 미리보기 편향이고,
    그렇게 나온 초과수익은 실전에서 낼 수 없는 수다.

    자료로 막을 방법이 없으니 **재고 나서 알아채는 대신 재기 전에 표시한다.**
    """
    dates = [d for *_, d in evs]
    if not dates:
        return {'events': 0, 'tradable': False, 'why': '사건이 없습니다'}
    uniq = sorted(set(dates))
    qe = [d for d in dates if _is_quarter_end(d)]
    share = len(qe) / len(dates)
    tradable = share < 0.5
    return {
        'events': len(dates), 'distinct_dates': len(uniq),
        'quarter_end_share_pct': round(share * 100.0, 1),
        'tradable': tradable,
        'why': (None if tradable else
                '사건 날짜의 %.0f%% 가 분기말입니다 — 이것은 **발표일이 아니라 결산일**입니다. '
                '실제 발표는 그로부터 사오 주 뒤이므로, 이 날짜로 진입을 잡으면 아직 '
                '공표되지 않은 실적을 알고 산 것이 됩니다(미리보기 편향). '
                '아래 수는 **실전 규칙이 아닙니다.**' % (share * 100.0)),
    }


def _pct(a, b):
    return (b / a - 1.0) * 100.0


def events(market, rows, today=None):
    """(종목번호, 진입봉번호, 서프라이즈%) 목록.

    진입봉은 **발표일보다 뒤인 첫 봉**이다. 발표 당일 봉은 쓰지 않는다.
    """
    region = 'KR' if market == 'KR_STOCK' else 'US'
    tz = S.KST if region == 'KR' else S.ET
    comp, _ = S.companies(region)
    out, missing = [], 0
    for k, it in enumerate(rows):
        c = comp.get(it['symbol'])
        if not c:
            missing += 1
            continue
        ds = [b['d'] for b in it['bars']]
        for r in (c.get('surprises') or []):
            p = r.get('surprise')
            d = S._day(r.get('ts'), tz)
            if p is None or not d:
                continue
            e = next((i for i, x in enumerate(ds) if x > d), None)
            if e is None:
                continue
            out.append((k, e, float(p), d))
    return out, missing


def measure(rows, evs, hold, cost_bps):
    """사건 뒤 hold 거래일 수익률. 자료 끝을 넘는 사건은 뺀다.

    (서프라이즈%, 수익률, **발표 주**) 를 낸다. 주가 따라붙는 까닭은 아래
    `cluster_bootstrap` 에 있다 — 발표는 몇 주에 몰려 있어 서로 독립이 아니다.
    """
    rets = []
    for k, e, p, d in evs:
        bars = rows[k]['bars']
        if e + hold >= len(bars):
            continue
        a, b = bars[e]['o'], bars[e + hold]['o']
        if a and b:
            y, w, _ = datetime.strptime(d, '%Y-%m-%d').isocalendar()
            rets.append((p, _pct(a, b) - cost_bps / 100.0, '%04d-W%02d' % (y, w)))
    return rets


# 부트스트랩을 몇 번 돌리는가. signal_backtest.block_bootstrap_diff 와 같은 수다.
N_BOOT = 2000


def cluster_bootstrap(rs, base_avg, seed=1):
    """**주를 통째로 다시 뽑는다** — 사건 하나하나를 뽑지 않는다.

    실적은 몇 주에 몰려 발표된다. 같은 주의 스무 건은 같은 장세를 스무 번 센
    것에 가깝지 스무 개의 독립된 증거가 아니다. 사건을 낱개로 뽑아 신뢰구간을
    내면 그 구간이 **실제보다 좁아지고**, 좁아진 구간은 유의하지 않은 것을
    유의하다고 말한다.

    그래서 주를 단위로 다시 뽑는다(클러스터 부트스트랩). 이 저장소가
    `signal_backtest.block_bootstrap_diff` 에서 같은 까닭으로 날을 덩어리째
    뽑는 것과 같은 장치다.

    대조군 평균은 고정된 값으로 둔다 — 수만 건에서 나온 수라 그 자체의 흔들림은
    여기 견주면 작다. 그래도 **0 은 아니므로** 이 구간은 조금 낙관적이다.
    """
    if base_avg is None:
        return None
    weeks = {}
    for p, r, wk in rs:
        weeks.setdefault(wk, []).append(r)
    keys = sorted(weeks)
    if len(keys) < 4:
        return {'weeks': len(keys), 'why': '주가 넷도 안 되어 재지 않았습니다'}
    rng = random.Random(seed)
    diffs = []
    for _ in range(N_BOOT):
        vals = [v for k in (rng.choice(keys) for _ in keys) for v in weeks[k]]
        diffs.append(st.mean(vals) - base_avg)
    diffs.sort()
    lo, hi = diffs[int(0.025 * N_BOOT)], diffs[int(0.975 * N_BOOT)]
    se = (hi - lo) / (2 * 1.959964)
    z = (st.mean(diffs) / se) if se > 0 else None
    return {'weeks': len(keys), 'ci_lo': round(lo, 2), 'ci_hi': round(hi, 2),
            'z': round(z, 2) if z is not None else None,
            # 두 쪽 꼬리. signal_backtest._p_two_sided 와 같은 셈이다.
            'p': (math.erfc(abs(z) / math.sqrt(2.0)) if z is not None else None),
            'excludes_zero': bool(lo > 0 or hi < 0)}


def _stat(rs, base):
    if not rs:
        return None
    vals = [r for _, r, _ in rs]
    avg = st.mean(vals)
    boot = cluster_bootstrap(rs, base['avg'] if base else None)
    return {
        'n': len(vals),
        'avg': round(avg, 2),
        'median': round(st.median(vals), 2),
        'win_rate': round(sum(1 for v in vals if v > 0) / len(vals) * 100.0, 1),
        'base_avg': round(base['avg'], 2) if base else None,
        'base_win_rate': round(base['win_rate'], 1) if base else None,
        'edge': round(avg - base['avg'], 2) if base else None,
        'boot': boot,
        'usable': bool(base and len(vals) >= MIN_EVENTS and avg - base['avg'] > 0),
    }


def run(markets=None, today=None):
    uni, meta = D.load_universe()
    out = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'what': '실적 서프라이즈 발표 뒤 수익률을 같은 시장·같은 보유일수의 무작위 진입과 견준 것',
        'entry': '발표일 다음 거래일 시가 (발표가 장중이었는지 알 수 없어 하루를 건너뜁니다)',
        'exit': '5 · 10 · 20 · 60 거래일 뒤 시가',
        'caveats': [
            '종목당 네 분기뿐이고 같은 몇 주에 몰려 있습니다 — 사건이 서로 독립이 아닙니다.',
            '오늘의 100대 기업만 봅니다. 그 사이 밀려난 회사는 목록에 없습니다(생존 편향).',
            '칸(서프라이즈 크기)은 재기 전에 정했습니다. 재고 나서 칸을 그리면 어디를 잘라도 좋아 보이는 자리가 나옵니다.',
            '이 표는 실적 겹을 점수로 쓸지 딱지로 쓸지 가리는 잣대입니다. 여기서 문턱을 골라 실전에 넣는 도구가 아닙니다.',
        ],
        'horizons': HORIZONS, 'min_events': MIN_EVENTS,
        'buckets': [b[0] for b in BUCKETS],
        'markets': {}, 'data_notes': meta,
    }

    for mk in (markets or MARKETS):
        rows = uni.get(mk) or []
        if not rows:
            continue
        cost = B.COST_BPS[mk]
        evs, missing = events(mk, rows, today)
        if not evs:
            out['markets'][mk] = {'label': D.MARKETS[mk]['label'], 'events': 0,
                                  'why': '기업 자료를 읽지 못했습니다'}
            continue
        span = (min(d for *_, d in evs), max(d for *_, d in evs))
        m = {'label': D.MARKETS[mk]['label'], 'symbols': len(rows),
             'events': len(evs), 'symbols_missing_facts': missing,
             'event_dates': {'from': span[0], 'to': span[1]},
             'date_quality': date_quality(evs),
             'cost_bps': cost, 'by_horizon': {}}
        ub = [it['bars'] for it in rows]
        for h in HORIZONS:
            rs = measure(rows, evs, h, cost)
            base = B.baseline(ub, h, cost, 0)
            cell = {'all': _stat(rs, base), 'by_bucket': {}}
            for name, fn in BUCKETS:
                cell['by_bucket'][name] = _stat([x for x in rs if fn(x[0])], base)
            m['by_horizon'][str(h)] = cell
        out['markets'][mk] = m
    add_verdict(out)
    return out


def add_verdict(doc):
    """**몇 칸을 시험했는지 세고 그만큼 문턱을 올린다.**

    이 저장소가 매매 신호 절에서 이미 겪은 함정이다 — 「스무 개를 시험하면
    그 중 한 가지쯤은 유의하게 나온다. 그 하나를 집어 싣는 것이 백테스트가
    거짓말하는 가장 흔한 길이다」. 여기서는 시장 2 × 시계 4 × 칸 5 를 다 쟀으므로
    그 수로 나눈 문턱(Bonferroni)을 쓴다.

    그리고 **두 시장이 같은 방향인가**를 따로 본다. 보정을 통과하지 못해도 서로
    독립인 두 시장이 같은 쪽을 가리키면 그건 약한 증거는 된다. 반대로 방향이
    엇갈리면 낱개로 아무리 커 보여도 쓰지 않는다.
    """
    tests = []
    for mk, m in doc['markets'].items():
        for h, cell in (m.get('by_horizon') or {}).items():
            for name in ['전체'] + list(cell['by_bucket']):
                s = cell['all'] if name == '전체' else cell['by_bucket'][name]
                if not s or not (s.get('boot') or {}).get('p'):
                    continue
                tests.append({'market': mk, 'h': int(h), 'bucket': name,
                              'edge': s['edge'], 'p': s['boot']['p']})
    k = len(tests) or 1
    alpha = 0.05 / k
    passed = [t for t in tests if t['p'] < alpha]

    # 칸마다 두 시장의 부호가 맞는가 — 시계 넷을 통틀어 센다.
    agree = {}
    for name in doc['buckets'] + ['전체']:
        cells = [t for t in tests if t['bucket'] == name]
        per = {}
        for t in cells:
            per.setdefault(t['market'], []).append(t['edge'])
        if len(per) < 2:
            continue
        pos = {mk: sum(1 for e in es if e > 0) for mk, es in per.items()}
        tot = {mk: len(es) for mk, es in per.items()}
        both_up = all(pos[mk] == tot[mk] for mk in per)
        both_down = all(pos[mk] == 0 for mk in per)
        agree[name] = {
            'cells': {mk: '%d/%d 칸이 대조군 위' % (pos[mk], tot[mk]) for mk in per},
            'direction': ('모두 위' if both_up else '모두 아래' if both_down else '엇갈림'),
            'consistent': bool(both_up or both_down),
        }

    # **날짜가 발표일이 아니면 위의 모든 수가 실전 규칙이 될 수 없다.**
    bad_dates = {mk: m['date_quality'] for mk, m in doc['markets'].items()
                 if m.get('date_quality') and not m['date_quality']['tradable']}

    doc['verdict'] = {
        'tradable': not bad_dates,
        'not_tradable_because': {mk: q['why'] for mk, q in bad_dates.items()} or None,
        'tests': k, 'alpha_bonferroni': round(alpha, 5),
        'passed_bonferroni': [{'market': t['market'], 'h': t['h'],
                               'bucket': t['bucket'], 'edge': t['edge'],
                               'p': round(t['p'], 6)} for t in sorted(passed, key=lambda x: x['p'])],
        'direction_agreement': agree,
        'how_to_read': ('%d 칸을 시험했으므로 보정 문턱은 p<%.5f 입니다. '
                        '보정을 통과한 칸이 %d 개입니다. 통과하지 못한 칸은 '
                        '「없다」가 아니라 「이 자료로는 말할 수 없다」입니다. '
                        '두 시장의 방향이 엇갈리는 칸은 낱개로 커 보여도 쓰지 않습니다.'
                        % (k, alpha, len(passed))),
    }


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--market', action='append', choices=MARKETS)
    ap.add_argument('--json', default='')
    a = ap.parse_args(argv)

    doc = run(a.market)
    for mk, m in doc['markets'].items():
        if not m.get('events'):
            print('%s — %s' % (m['label'], m.get('why'))); continue
        q = m['date_quality']
        print('\n══ %s · 사건 %d 건 (%s ~ %s) · %d 종목 · 왕복비용 %dbp'
              % (m['label'], m['events'], m['event_dates']['from'],
                 m['event_dates']['to'], m['symbols'], m['cost_bps']))
        print('   서로 다른 날짜 %d 개 · 분기말 비중 %.0f%% → %s'
              % (q['distinct_dates'], q['quarter_end_share_pct'],
                 '발표일로 보아도 됩니다' if q['tradable'] else '**결산일이지 발표일이 아닙니다**'))
        print('%-12s %6s %8s %8s %10s %7s %18s %9s'
              % ('칸', '건수', '평균', '대조군', '초과', '승률', '주묶음 95% 구간', 'p'))
        for h in HORIZONS:
            cell = m['by_horizon'][str(h)]
            print('  ── %d 거래일 뒤' % h)
            for name in ['전체'] + [b[0] for b in BUCKETS]:
                s = cell['all'] if name == '전체' else cell['by_bucket'][name]
                if not s:
                    print('  %-12s %6s  자료 없음' % (name, '—')); continue
                bo = s.get('boot') or {}
                ci = ('[%+6.2f, %+6.2f]' % (bo['ci_lo'], bo['ci_hi'])
                      if bo.get('ci_lo') is not None else (bo.get('why') or '—'))
                print('  %-12s %6d %+7.2f%% %+7.2f%% %+9.2f%%p %6.1f%% %18s %9s'
                      % (name, s['n'], s['avg'], s['base_avg'], s['edge'],
                         s['win_rate'], ci,
                         ('%.4f' % bo['p']) if bo.get('p') is not None else '—'))

    v = doc['verdict']
    if not v['tradable']:
        print('\n' + '━' * 78)
        print('※ 아래 수를 실전 규칙으로 쓰지 마십시오.')
        for mk, why in v['not_tradable_because'].items():
            print('  [%s] %s' % (mk, why))
        print('━' * 78)
    print('\n══ 여러 번 시험한 것을 보정하면')
    print(v['how_to_read'])
    if v['passed_bonferroni']:
        for t in v['passed_bonferroni']:
            print('  통과 · %s %d일 「%s」 초과 %+.2f%%p (p=%.5f)'
                  % (t['market'], t['h'], t['bucket'], t['edge'], t['p']))
    print('\n══ 두 시장이 같은 방향인가')
    for name, ag in v['direction_agreement'].items():
        print('  %-10s %-8s  %s' % (name, ag['direction'],
                                    ' · '.join('%s %s' % (k, x) for k, x in ag['cells'].items())))
    print()
    for c in doc['caveats']:
        print('· %s' % c)

    if a.json:
        p = a.json if os.path.isabs(a.json) else os.path.join(ROOT, a.json)
        if D.write_if_changed(p, doc):
            print('\n%s 에 적었습니다' % os.path.relpath(p, ROOT))
        else:
            print('\n%s — 시각 말고 달라진 것이 없어 그대로 둡니다' % os.path.relpath(p, ROOT))
    return 0


if __name__ == '__main__':
    sys.exit(main())
