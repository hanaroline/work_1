#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자산배분 ETF 76종의 일봉을 받는다.

두 쪽을 각각 그 시장의 기준 출처에서 받는다.

  국내상장 55종 — **네이버 금융.** 2026-09-18 에 국내 일봉 기준을 야후에서
      네이버로 옮겼고(야후가 2025-09-19 거래일을 통째로 빠뜨렸다) 그 결정을
      여기서도 그대로 따른다. 받는 코드는 fetch_kr_prices_naver 의 것을
      **그대로 쓴다** — 같은 일을 하는 수집기를 두 벌 두면 한쪽만 고쳐진다.
  해외상장 21종 — **야후 차트.** 이 저장소의 해외 일봉 관행과 같다.

**이름을 반드시 맞대 본다.** 티커 일흔여섯 개를 사진에서 옮겨 적었고, 코드 한 자만
틀려도 엉뚱한 펀드를 분석하게 된다. 그런데 틀린 코드가 대개 **빈 응답이 아니라 다른
종목의 멀쩡한 응답**을 준다. 그래서 받아 온 이름과 종목 유형(ETF인가 주식인가)을
산출물에 적어 두고 verify_etf_signals.py 가 표의 이름과 맞대게 한다. 야후의 `GOLD` 는
금광 회사(Barrick) 주식이고 표가 말하는 것은 호주 상장 금 ETF 다 — 이 검사가
없으면 그 둘을 구별할 길이 없다.

  python3 scripts/fetch_etf_prices.py
  python3 scripts/fetch_etf_prices.py --only KR --limit 5
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import etf_list as L
import fetch_kr_prices_naver as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT = os.path.join(ROOT, 'data', 'etf', 'prices.json')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')
TIMEOUT = 25
SLEEP = 0.35
YEARS = 3


def kst_now():
    return datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')


# ─────────────────────────────────────────────────────────────────────
# 국내 — 네이버
# ─────────────────────────────────────────────────────────────────────

NAME_ROUTES = [
    'https://m.stock.naver.com/api/stock/%s/basic',
    'https://m.stock.naver.com/api/stock/%s/integration',
]


def naver_name(code):
    """종목코드가 정말 그 ETF 인지 확인할 이름. 못 받으면 None 을 낸다.

    **지어내지 않는다.** 이름을 못 받은 것과 이름이 다른 것은 다른 일이고,
    검산기가 그 둘을 갈라 봐야 한다.
    """
    for tpl in NAME_ROUTES:
        try:
            doc = json.loads(P._get(tpl % code))
        except Exception:                                       # noqa: BLE001
            continue
        for k in ('stockName', 'itemName', 'name', 'stockNameEng'):
            v = (doc or {}).get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
        st = (doc or {}).get('stockItemTotalInfos') or (doc or {}).get('stock') or {}
        if isinstance(st, dict):
            v = st.get('stockName') or st.get('name')
            if isinstance(v, str) and v.strip():
                return v.strip()
    return None


def fetch_kr(it, span):
    rows, route, errs = P.fetch_one(it['code'], span)
    if not rows:
        return None, {'route': None, 'errors': errs}
    return rows, {'route': route, 'name_source': naver_name(it['code']),
                  'currency': 'KRW', 'instrument_type': None,
                  'exchange': None, 'symbol_used': it['code'], 'errors': errs}


# ─────────────────────────────────────────────────────────────────────
# 해외 — 야후 차트
# ─────────────────────────────────────────────────────────────────────

def _yget(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA,
                                               'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode('utf-8', 'replace'))


def yahoo_chart(sym, years=YEARS):
    """일봉과 **메타(이름·유형·통화·거래소)** 를 함께 낸다.

    `close` 를 쓴다 — 이 저장소의 해외 일봉 관행과 같다(collect_history.mjs).
    배당 보정된 `adjclose` 도 함께 받아 **분배금이 가격 추세를 얼마나 끌어내리는지**
    잴 수 있게 남긴다. 고배당·커버드콜 ETF 는 그 차이가 크다.
    """
    err = None
    for host in ('query1.finance.yahoo.com', 'query2.finance.yahoo.com'):
        url = ('https://%s/v8/finance/chart/%s?range=%dy&interval=1d&events=div'
               % (host, urllib.parse.quote(sym), years))
        try:
            doc = _yget(url)
        except Exception as e:                                  # noqa: BLE001
            err = '%s: %s' % (host.split('.')[0], getattr(e, 'code', None) or type(e).__name__)
            continue
        r = ((doc.get('chart') or {}).get('result') or [None])[0]
        if not r:
            err = '%s: 빈 결과' % host.split('.')[0]
            continue
        ts = r.get('timestamp') or []
        q = ((r.get('indicators') or {}).get('quote') or [{}])[0]
        adj = (((r.get('indicators') or {}).get('adjclose') or [{}])[0] or {}).get('adjclose') or []
        meta = r.get('meta') or {}
        rows, adjc = [], []
        for i in range(len(ts)):
            d = datetime.fromtimestamp(ts[i], timezone.utc).strftime('%Y-%m-%d')
            row = P._row(d, P._num(_at(q.get('open'), i)), P._num(_at(q.get('high'), i)),
                         P._num(_at(q.get('low'), i)), P._num(_at(q.get('close'), i)),
                         P._num(_at(q.get('volume'), i)))
            if row:
                rows.append(row)
                adjc.append(P._num(_at(adj, i)))
        if not rows:
            err = '%s: 쓸 만한 봉이 없음' % host.split('.')[0]
            continue
        return rows, {'symbol_used': sym, 'route': 'yahoo',
                      'name_source': meta.get('longName') or meta.get('shortName'),
                      'instrument_type': meta.get('instrumentType'),
                      'currency': meta.get('currency'),
                      'exchange': meta.get('fullExchangeName') or meta.get('exchangeName'),
                      'adjclose': adjc, 'errors': []}
    return None, {'route': None, 'errors': [err or '알 수 없음']}


def _at(xs, i):
    return xs[i] if isinstance(xs, list) and i < len(xs) else None


def fetch_ov(it, span):
    """후보 심볼을 차례로 시험한다. **먼저 답하는 것을 쓰지 않는다** —
    ETF 가 아닌 것(주식)이 답하면 건너뛰고 다음 후보를 본다."""
    errs = []
    fallback = None
    for sym in it['symbols']:
        rows, meta = yahoo_chart(sym)
        if not rows:
            errs += meta['errors']
            continue
        if (meta.get('instrument_type') or '').upper() == 'ETF':
            meta['errors'] = errs
            return rows, meta
        # 답은 왔지만 ETF 가 아니다 — 기억만 해 두고 다음 후보로 간다
        errs.append('%s 는 %s (ETF 아님)' % (sym, meta.get('instrument_type') or '유형 미상'))
        if fallback is None:
            fallback = (rows, meta)
    if fallback:
        fallback[1]['errors'] = errs
        return fallback
    return None, {'route': None, 'errors': errs}


# ─────────────────────────────────────────────────────────────────────

def to_series(rows):
    ds = sorted({r['d'] for r in rows})
    by = {r['d']: r for r in rows}
    out = {'d': ds}
    for k in ('o', 'h', 'l', 'c', 'v'):
        out[k] = [by[d][k] for d in ds]
    return out


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='', help='KR 또는 OV 만')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--years', type=int, default=YEARS)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    today = datetime.now(KST)
    span = ((today - timedelta(days=int(a.years * 372))).strftime('%Y%m%d'),
            today.strftime('%Y%m%d'))

    its = L.items()
    if a.only:
        its = [x for x in its if x['scope'] == a.only.upper()]
    if a.limit:
        its = its[:a.limit]

    out, failed, routes = {}, [], {}
    for n, it in enumerate(its):
        if it['scope'] == 'KR':
            rows, meta = fetch_kr(it, span)
        else:
            rows, meta = fetch_ov(it, span)
        if not rows:
            failed.append({'ticker': it['ticker'], 'name': it['name'],
                           'errors': meta.get('errors') or []})
            sys.stderr.write('  ✗ %s %s — %s\n'
                             % (it['ticker'], it['name'],
                                '; '.join(meta.get('errors') or ['빈 응답'])))
        else:
            ser = to_series(rows)
            rec = {k: it[k] for k in ('no', 'scope', 'group', 'theme', 'ticker',
                                      'name', 'code')}
            rec.update({k: meta.get(k) for k in
                        ('symbol_used', 'route', 'name_source', 'instrument_type',
                         'currency', 'exchange')})
            rec['bars'] = ser
            rec['bars_n'] = len(ser['d'])
            rec['from'], rec['to'] = ser['d'][0], ser['d'][-1]
            if meta.get('adjclose'):
                rec['adjclose'] = meta['adjclose']
            if meta.get('errors'):
                rec['fetch_notes'] = meta['errors']
            out[it['ticker']] = rec
            routes[meta.get('route')] = routes.get(meta.get('route'), 0) + 1
        if (n + 1) % 10 == 0:
            sys.stderr.write('  %d/%d\n' % (n + 1, len(its)))
        time.sleep(SLEEP)

    days = sorted({d for r in out.values() for d in r['bars']['d']})
    doc = {
        'generated_at_kst': kst_now(),
        'source': {'KR': '네이버 금융 일봉', 'OV': '야후 차트 일봉(close, 배당 미보정)'},
        'routes_used': routes,
        'list_counts': L.counts(),
        'note': ('표(2026-09-18 기준 자산배분ETF 종목 LIST)의 ETF 76종이다. '
                 'ETN 6종은 지시대로 뺐다. **받아 온 이름을 표의 이름과 맞대 보기 '
                 '전까지는 참고 자료다** — verify_etf_signals.py 를 먼저 돌려야 한다.'),
        'coverage': {'requested': len(its), 'got': len(out), 'failed': len(failed),
                     'days': len(days),
                     'from': days[0] if days else None,
                     'to': days[-1] if days else None},
        'failed': failed,
        'items': out,
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(doc, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)

    sys.stderr.write('%d/%d 종목 · 날짜 %s ~ %s · 길 %s\n'
                     % (len(out), len(its), doc['coverage']['from'],
                        doc['coverage']['to'], json.dumps(routes, ensure_ascii=False)))
    print('썼다: %s' % a.out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
