# -*- coding: utf-8 -*-
"""봉이 아닌 모든 것을 읽는 **하나의 문** — 실적·추정치·목표가·이벤트·수급·시황.

`kis_timing_data` 가 봉의 문이라면 이쪽은 그 나머지의 문이다. 같은 까닭으로
하나로 둔다 — 판정 엔진과 검색 화면과 검산기가 각자 파일을 열면, 언젠가 한쪽만
고쳐져 화면과 판정이 서로 다른 실적을 보게 된다.

## 무엇이 어디서 오는가

    실적·추정치·목표가·뉴스   kr100-data / us100-data 가지의 latest.json
      quote      PER·PBR·ROE·영업이익률·매출성장·52주 고저 …  (40칸)
      target     증권사 목표주가 평균·중앙·최고·최저, 투자의견 분포
      calendar   **다음 실적 발표일**, 그 분기 EPS·매출 추정치, 배당락일
      surprises  최근 네 분기 **서프라이즈** (추정 대비 실제)
      epsTrend   0분기·다음분기·올해·내년 추정치와 그 성장률, 참여 애널리스트 수
      financials 연간 4개 · 분기 4개 (매출·영업이익·순이익·이익률)
      news/newsKo 최근 기사 (제목·매체·시각)

    증권사 리포트            data/reports/YYYY-MM-DD.json  (하루 400여 건, 24일치)
    종목별 수급              data/flows/kr100.json         (외국인·기관·개인 12일치)
    시황                     data/market/latest.json       (지수 50 · 금리곡선 ·
                             등락종목수 · 투자자 수급 · 업종 순환 · 예탁금)

## 없는 것을 없다고 말한다

**ETF 에는 EPS 가 없다.** 그건 자료가 빠진 것이 아니라 상품이 그런 것이다.
실적 겹이 비는 것과 「실적이 나쁘다」는 전혀 다른 말이라, 산출물이 `coverage`
로 어느 겹에 자료가 있는지 먼저 밝힌다.

마찬가지로 **증권사 리포트와 종목별 수급은 국내 100종에만 있다.** 미국 종목에는
리포트가 없고, ETF 에는 수급이 없다. 있는 척하지 않는다.

## 시각을 그대로 옮긴다

야후가 주는 시각은 초 단위 유닉스 시각이다. 여기서 날짜로 바꾸되 **어느 시간대로
바꾸었는지 함께 적는다** — 실적 발표가 「내일」인지 「모레」인지가 시간대 하나로
갈리기 때문이다. 국내 종목은 KST, 미국 종목은 미 동부시를 쓴다.
"""

import json
import os
import re
import subprocess
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
ET = timezone(timedelta(hours=-4))          # 미 동부 서머타임. 겨울에는 한 시간 어긋난다

KR_BRANCH = 'origin/kr100-data'
KR_PATH = 'data/kr100/latest.json'
US_BRANCH = 'origin/us100-data'
US_PATH = 'data/us100/latest.json'

MARKET = os.path.join(ROOT, 'data', 'market', 'latest.json')
REPORTS_DIR = os.path.join(ROOT, 'data', 'reports')
FLOWS = os.path.join(ROOT, 'data', 'flows', 'kr100.json')

# 리포트를 몇 날치 훑는가. 자료가 24일치뿐이라 그 안에서 고른다.
REPORT_DAYS = 20

_CACHE = {}


def _git_json(branch, path):
    """가지에서 파일 하나를 읽는다. 가지가 없으면 None — 멈추지 않는다."""
    key = (branch, path)
    if key in _CACHE:
        return _CACHE[key]
    r = subprocess.run(['git', '-C', ROOT, 'show', '%s:%s' % (branch, path)],
                       capture_output=True, text=True)
    out = None
    if r.returncode == 0:
        try:
            out = json.loads(r.stdout)
        except ValueError:
            out = None
    _CACHE[key] = out
    return out


def _file_json(path):
    if path in _CACHE:
        return _CACHE[path]
    out = None
    if os.path.exists(path):
        try:
            out = json.load(open(path, encoding='utf-8'))
        except ValueError:
            out = None
    _CACHE[path] = out
    return out


def _day(ts, tz):
    if not ts:
        return None
    try:
        return datetime.fromtimestamp(float(ts), tz).strftime('%Y-%m-%d')
    except (ValueError, OSError, OverflowError):
        return None


def _days_between(a, b):
    """a 에서 b 까지 달력 날수. 둘 중 하나가 없으면 None."""
    if not (a and b):
        return None
    try:
        return (datetime.strptime(b, '%Y-%m-%d') - datetime.strptime(a, '%Y-%m-%d')).days
    except ValueError:
        return None


# ─────────────────────────────────────────────────────────────────────
# 기업 자료 — kr100-data / us100-data
# ─────────────────────────────────────────────────────────────────────

def companies(region):
    """{심볼: 기업자료}. 가지를 못 읽으면 빈 사전."""
    doc = (_git_json(KR_BRANCH, KR_PATH) if region == 'KR'
           else _git_json(US_BRANCH, US_PATH))
    return ((doc or {}).get('companies') or {}), (doc or {}).get('fetchedAt')


def _surprise_summary(rows, tz):
    """최근 네 분기 서프라이즈를 한 줄로. 값이 없으면 None 을 남긴다."""
    got = [r for r in (rows or []) if r.get('surprise') is not None]
    if not got:
        return None
    pcts = [r['surprise'] for r in got]
    beats = sum(1 for p in pcts if p > 0)
    # 가장 최근 분기(ts 가 가장 큰 것)
    last = max(got, key=lambda r: r.get('ts') or 0)
    return {
        'n': len(got), 'beats': beats, 'misses': len(got) - beats,
        'avg_pct': round(sum(pcts) / len(pcts), 2),
        'last_pct': round(last['surprise'], 2),
        'last_period': last.get('period'),
        'last_date': _day(last.get('ts'), tz),
        'all': [{'period': r.get('period'), 'date': _day(r.get('ts'), tz),
                 'est': r.get('est'), 'act': r.get('act'),
                 'surprise_pct': round(r['surprise'], 2)} for r in got],
    }


def _trend_summary(rows):
    """추정치가 오르고 있는가 내리고 있는가 — 기간별 성장률과 참여 인원."""
    out = {}
    for r in (rows or []):
        p = r.get('period')
        if not p:
            continue
        out[p] = {'end': r.get('endDate'), 'eps_avg': r.get('avg'),
                  'eps_growth_pct': r.get('growth'), 'analysts': r.get('n'),
                  'rev_growth_pct': r.get('revGrowth')}
    return out or None


def _target_summary(t, price):
    if not t or t.get('mean') is None:
        return None
    up = None
    if price:
        up = round((t['mean'] / price - 1.0) * 100.0, 1)
    return {'mean': t.get('mean'), 'median': t.get('median'),
            'low': t.get('low'), 'high': t.get('high'),
            'analysts': t.get('analysts'), 'rating': t.get('rating'),
            'rating_mean': t.get('ratingMean'), 'dist': t.get('dist'),
            'upside_pct': up}


QUOTE_KEEP = ('price', 'prevClose', 'changePct', 'cap', 'currency', 'per', 'fwdPer',
              'pbr', 'psr', 'peg', 'roe', 'opMargin', 'netMargin', 'grossMargin',
              'revenueGrowth', 'earningsGrowth', 'debtToEquity', 'divYield', 'payout',
              'beta', 'high52', 'low52', 'avgVolume', 'volume', 'evEbitda')


def fundamentals(symbol, region, today=None):
    """한 종목의 실적·추정치·목표가·이벤트. 자료가 없으면 None."""
    comp, fetched = companies(region)
    c = comp.get(symbol)
    if not c:
        return None
    tz = KST if region == 'KR' else ET
    q = c.get('quote') or {}
    cal = c.get('calendar') or {}
    today = today or datetime.now(tz).strftime('%Y-%m-%d')

    next_earn = None
    for ts in (cal.get('dates') or []):
        d = _day(ts, tz)
        if d and (next_earn is None or d < next_earn):
            next_earn = d
    ex_div = _day(cal.get('exDiv'), tz)

    return {
        'fetched_at': fetched,
        'timezone': 'KST' if region == 'KR' else 'US/Eastern(-04:00)',
        'quote': {k: q.get(k) for k in QUOTE_KEEP if q.get(k) is not None},
        'target': _target_summary(c.get('target'), q.get('price')),
        'surprises': _surprise_summary(c.get('surprises'), tz),
        'eps_trend': _trend_summary(c.get('epsTrend')),
        'financials': c.get('financials'),
        'profile': {k: (c.get('profile') or {}).get(k)
                    for k in ('sector', 'industry', 'country', 'employees')},
        'earnings': {
            'next_date': next_earn,
            'next_in_days': _days_between(today, next_earn),
            'estimated': bool(cal.get('estimate')),
            'eps_est': cal.get('epsEst'), 'rev_est': cal.get('revEst'),
        },
        'dividend': {
            'ex_date': ex_div, 'ex_in_days': _days_between(today, ex_div),
            'yield_pct': q.get('divYield'), 'rate': q.get('divRate'),
        },
        'news': [{'title': n.get('title'), 'source': n.get('source'),
                  'date': _day(n.get('ts'), tz), 'url': n.get('url')}
                 for n in ((c.get('newsKo') or []) + (c.get('news') or []))[:8]],
    }


# ─────────────────────────────────────────────────────────────────────
# 증권사 리포트 — 국내만
# ─────────────────────────────────────────────────────────────────────

_DATE_FILE = re.compile(r'^(\d{4}-\d{2}-\d{2})\.json$')


def report_index(days=REPORT_DAYS):
    """{6자리코드: {n, brokers, latest, items}} — 최근 며칠치를 합친다."""
    key = ('reports', days)
    if key in _CACHE:
        return _CACHE[key]
    files = sorted(f for f in os.listdir(REPORTS_DIR)
                   if _DATE_FILE.match(f)) if os.path.isdir(REPORTS_DIR) else []
    files = files[-days:]
    idx, seen = {}, set()
    for f in files:
        doc = _file_json(os.path.join(REPORTS_DIR, f))
        for r in ((doc or {}).get('reports') or []):
            st = r.get('stock') or {}
            code = st.get('code')
            nid = r.get('nid')
            if not code or (nid and nid in seen):
                continue
            if nid:
                seen.add(nid)
            e = idx.setdefault(code, {'code': code, 'name': st.get('name'),
                                      'n': 0, 'brokers': set(), 'items': []})
            e['n'] += 1
            if r.get('broker'):
                e['brokers'].add(r['broker'])
            e['items'].append({'date': r.get('date'), 'broker': r.get('broker'),
                               'title': r.get('title'), 'url': r.get('url'),
                               'summary': (r.get('summary') or '')[:300]})
    for e in idx.values():
        e['items'].sort(key=lambda x: x.get('date') or '', reverse=True)
        e['brokers'] = sorted(e['brokers'])
        e['latest'] = e['items'][0]['date'] if e['items'] else None
        e['items'] = e['items'][:5]
    out = {'days': len(files), 'from': files[0][:10] if files else None,
           'to': files[-1][:10] if files else None, 'by_code': idx}
    _CACHE[key] = out
    return out


# ─────────────────────────────────────────────────────────────────────
# 종목별 수급 — 국내 100종만
# ─────────────────────────────────────────────────────────────────────

def flows(symbol):
    """최근 며칠 외국인·기관·개인 순매수 합계(억원)와 외국인 보유율 변화."""
    doc = _file_json(FLOWS) or {}
    s = (doc.get('stocks') or {}).get(symbol)
    if not s or not s.get('d'):
        return None

    def _sum(key, n):
        xs = [v for v in (s.get(key) or [])[-n:] if v is not None]
        return round(sum(xs), 1) if xs else None

    r = [v for v in (s.get('r') or []) if v is not None]
    return {
        'from': s['d'][0], 'to': s['d'][-1], 'days': len(s['d']),
        'unit': '억원',
        'foreign_5d': _sum('f', 5), 'foreign_20d': _sum('f', 20),
        'inst_5d': _sum('i', 5), 'inst_20d': _sum('i', 20),
        'retail_5d': _sum('p', 5), 'retail_20d': _sum('p', 20),
        'foreign_hold_pct': r[-1] if r else None,
        'foreign_hold_chg_pp': (round(r[-1] - r[0], 2) if len(r) >= 2 else None),
    }


# ─────────────────────────────────────────────────────────────────────
# 시황 — 종목이 아니라 **시장 전체**에 걸린다
# ─────────────────────────────────────────────────────────────────────

def regime():
    """오늘 시장이 어떤 자리인가. 지수·변동성·금리·환율·등락종목수·수급."""
    m = _file_json(MARKET)
    if not m:
        return None
    idx = m.get('indices') or {}

    def one(k):
        v = idx.get(k) or {}
        return {'close': v.get('close'), 'change_pct': v.get('change_pct'),
                'date': v.get('date'), 'perf': v.get('perf')} if v else None

    internals = (m.get('market_internals') or {}).get('kospi') or {}
    br = internals.get('breadth') or {}
    adv, dec = br.get('advancing'), br.get('declining')
    flows_kospi = internals.get('investor_flows') or {}
    sectors = ((m.get('sectors') or {}).get('all') or [])

    return {
        'asof_kst': m.get('generated_at_kst'),
        'indices': {k: one(k) for k in
                    ('kospi', 'kosdaq', 'sp500', 'nasdaq', 'sox', 'vix',
                     'usdkrw', 'dxy', 'ust10y', 'gold', 'wti')},
        'breadth_kospi': {
            'advancing': adv, 'declining': dec,
            'limit_up': br.get('limit_up'), 'limit_down': br.get('limit_down'),
            # 오른 종목이 전체에서 몇 할인가. 지수 한 칸만 보면 안 보이는 것이다.
            'advance_share_pct': (round(adv / (adv + dec) * 100.0, 1)
                                  if (adv and dec) else None),
        },
        'investor_flows_kospi': flows_kospi,
        'rates_us': (m.get('rates_us') or {}).get('curve'),
        'rates_kr': {k: (m.get('rates_kr') or {}).get(k)
                     for k in ('call', 'cd91', 'ktb1y', 'ktb5y', 'ktb10y')},
        'sectors_top': [{'name': s.get('name'), 'change_pct': s.get('change_pct'),
                         'm1': (s.get('perf') or {}).get('m1')} for s in sectors[:5]],
        'sectors_bottom': [{'name': s.get('name'), 'change_pct': s.get('change_pct'),
                            'm1': (s.get('perf') or {}).get('m1')} for s in sectors[-5:]],
        'money_flow': (m.get('money_flow') or {}).get('latest'),
    }


# ─────────────────────────────────────────────────────────────────────
# 한 종목의 모든 겹
# ─────────────────────────────────────────────────────────────────────

def facts(symbol, market, code=None, today=None):
    """`kis_timing_data` 의 시장 이름을 그대로 받는다. 없는 겹은 None 으로 둔다."""
    region = 'KR' if market in ('KR_STOCK', 'KR_ETF', 'KR_OV_ETF') else 'US'
    is_stock = market in ('KR_STOCK', 'US_STOCK')
    code = code or symbol.split('.')[0]

    f = fundamentals(symbol, region, today) if is_stock else None
    rep = None
    if market == 'KR_STOCK':
        rep = (report_index().get('by_code') or {}).get(code)
    fl = flows(symbol) if market == 'KR_STOCK' else None

    return {
        'symbol': symbol, 'market': market, 'code': code,
        'fundamentals': f, 'reports': rep, 'flows': fl,
        'coverage': {
            # **왜 비었는지**를 함께 적는다. 「없음」과 「나쁨」은 다른 말이다.
            'fundamentals': bool(f),
            'fundamentals_why': (None if f else
                                 ('ETF 에는 EPS·목표주가가 없습니다' if not is_stock
                                  else '이 종목은 100대 기업 목록에 없습니다')),
            'reports': bool(rep),
            'reports_why': (None if rep else
                            ('증권사 리포트는 국내 종목만 모읍니다' if market != 'KR_STOCK'
                             else '최근 %d 날치에 이 종목 리포트가 없습니다' % REPORT_DAYS)),
            'flows': bool(fl),
            'flows_why': (None if fl else '종목별 수급은 국내 100종만 모읍니다'),
        },
    }


def summary():
    """어느 겹에 자료가 얼마나 있는지 — 산출물 머리에 싣는다."""
    kr, kr_at = companies('KR')
    us, us_at = companies('US')
    rep = report_index()
    fl = _file_json(FLOWS) or {}
    m = _file_json(MARKET) or {}
    return {
        'companies_kr': {'n': len(kr), 'fetched_at': kr_at},
        'companies_us': {'n': len(us), 'fetched_at': us_at},
        'reports': {'codes': len(rep['by_code']), 'days': rep['days'],
                    'from': rep['from'], 'to': rep['to']},
        'flows': {'stocks': len((fl.get('stocks') or {})),
                  'coverage': fl.get('coverage')},
        'market': {'asof_kst': m.get('generated_at_kst'),
                   'sources_ok': (m.get('summary') or {}).get('sources_ok')},
    }


if __name__ == '__main__':
    import sys
    print(json.dumps(summary(), ensure_ascii=False, indent=1))
    for sym, mk in (('005930.KS', 'KR_STOCK'), ('AAPL', 'US_STOCK'),
                    ('A133690', 'KR_OV_ETF')):
        f = facts(sym, mk)
        print('\n══', sym, mk, '— 겹:', {k: v for k, v in f['coverage'].items()
                                          if not k.endswith('_why')})
        print(json.dumps(f, ensure_ascii=False)[:900])
    sys.exit(0)
