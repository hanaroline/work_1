#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 관(管)을 **네트워크 없이** 시험한다.

왜 이것이 따로 있는가
──────────────────────────────────────────────────────────────────────
이 저장소에서 한 번 이런 일이 났다 — 네이버 수집기가 러너에서 **0 초 만에** 죽었다.
파서 시험 스물일곱 가지가 모두 통과한 채로. 시험이 파서만 보고 있었고 종목 목록을
읽는 자리는 아무도 안 봤기 때문이다. 수집기가 첫 줄에서 죽으면 뒤의 어떤 검산도
돌지 못한다.

그래서 여기서는 **길 전체를 한 번 통과시킨다.** 살아 있는 응답 대신 저장소에 이미
있는 국내 일봉을 76 티커에 빌려 끼워 넣고 build_etf_signals → verify_etf 를
끝까지 돌린다. 값의 뜻은 없다. 보는 것은 셋이다.

  · 목록을 읽는가, ETN 이 새어들지 않았는가
  · 이력 길이에 따라 등급이 갈리는가 — 모자란 것에 신호대가 붙지 않는가
  · 검산기가 **심은 흠을 무는가**

**여기서 시험하지 못하는 것** — 야후·네이버가 정말 그 꼴로 답하는지, 티커가 정말
그 펀드인지. 그건 살아 있는 응답을 봐야 알고, 러너가 도는 날 verify_etf.py 의
이름 맞대기가 답한다.

  python3 scripts/check_etf.py
"""

import json
import os
import shutil
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import build_etf_signals as BE
import etf_list as L
import fetch_etf_prices as F
import verify_etf as V

FAILS, N = [], [0]
BORROW = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')


def ok(name, cond, note=''):
    N[0] += 1
    if not cond:
        FAILS.append('%s%s' % (name, (' — ' + note) if note else ''))


# ─────────────────────────────────────────────────────────────────────
# 하나. 목록
# ─────────────────────────────────────────────────────────────────────

def test_list():
    c = L.counts()
    ok('76종', c['total'] == 76, '%d종' % c['total'])
    ok('국내 55 · 해외 21', c['KR'] == 55 and c['OV'] == 21,
       'KR %d / OV %d' % (c['KR'], c['OV']))
    its = L.items()
    ok('ETN 이 없다', not any(x['ticker'].startswith('Q5') for x in its))
    ok('국내 코드가 6자리', all(len(x['code']) == 6 for x in its if x['scope'] == 'KR'),
       str([x['code'] for x in its if x['scope'] == 'KR' and len(x['code']) != 6]))
    ok('해외는 심볼 후보가 있다',
       all(x['symbols'] and x['expect'] for x in its if x['scope'] == 'OV'))
    # **야후의 GOLD 는 금광 회사다.** 맨 글자를 후보로 두면 그것을 분석하게 된다.
    g = [x for x in its if x['ticker'] == 'GOLD'][0]
    ok('GOLD 후보에 맨 글자가 없다', 'GOLD' not in g['symbols'], str(g['symbols']))


# ─────────────────────────────────────────────────────────────────────
# 둘. 야후 응답 파싱 — 꼴을 가정한 대로 읽는가
# ─────────────────────────────────────────────────────────────────────

def test_yahoo_parse():
    """`yahoo_chart` 안쪽을 그대로 쓰지 못하므로(그 안에서 망을 탄다) 같은 꼴의
    응답을 만들어 **행 만드는 자리**만 떼어 시험한다."""
    q = {'open': [100.0, 101.0], 'high': [103.0, 104.0], 'low': [99.0, 100.5],
         'close': [102.0, 103.5], 'volume': [1000, 1200]}
    rows = []
    for i in range(2):
        rows.append(F.P._row('2026-09-1%d' % (7 + i),
                             F.P._num(F._at(q['open'], i)), F.P._num(F._at(q['high'], i)),
                             F.P._num(F._at(q['low'], i)), F.P._num(F._at(q['close'], i)),
                             F.P._num(F._at(q['volume'], i))))
    ok('야후 행 두 줄', len([r for r in rows if r]) == 2)
    ok('야후 시가/종가가 안 바뀜', rows[1]['o'] == 101.0 and rows[1]['c'] == 103.5,
       'o=%s c=%s' % (rows[1]['o'], rows[1]['c']))
    # 칸이 밀려 읽힌 경우 — 고가 자리에 저가가 들어간다
    ok('고저가 뒤바뀐 봉을 버린다',
       F.P._row('2026-09-17', 101.0, 100.5, 104.0, 103.5, 1200) is None)
    ok('빈 칸이 있는 봉을 버린다',
       F.P._row('2026-09-17', 101.0, None, 100.5, 103.5, 1200) is None)
    ok('짧은 계열에서 넘치지 않는다', F._at([1, 2], 5) is None)


def test_to_series():
    rows = [{'d': '2026-09-17', 'o': 1, 'h': 2, 'l': 1, 'c': 2, 'v': 3},
            {'d': '2026-09-16', 'o': 1, 'h': 2, 'l': 1, 'c': 1, 'v': 3}]
    s = F.to_series(rows)
    ok('계열이 날짜순', s['d'] == ['2026-09-16', '2026-09-17'], str(s['d']))
    ok('계열이 짝이 맞는다', s['c'] == [1, 2], str(s['c']))


# ─────────────────────────────────────────────────────────────────────
# 셋. 이름 맞대기 — **엉뚱한 종목을 잡는 자리**
# ─────────────────────────────────────────────────────────────────────

def test_name_agrees():
    ok('같은 이름', V.name_agrees('TIGER 미국나스닥100', 'TIGER미국나스닥100') == 1.0)
    ok('괄호가 붙어도', V.name_agrees('SOL 미국배당다우존스(H)',
                                    'SOL 미국배당다우존스 (H)') == 1.0)
    ok('남의 이름은 걸린다',
       (V.name_agrees('TIGER 미국나스닥100', '두산에너빌리티') or 0) < 0.5)
    ok('비슷한 다른 펀드도 갈린다',
       (V.name_agrees('TIGER 200', 'TIGER 코스닥150') or 0) < 0.75)
    ok('빈 것은 None', V.name_agrees('TIGER 200', '') is None)


# ─────────────────────────────────────────────────────────────────────
# 넷. **길 전체를 통과시킨다** — 이 대본이 있는 까닭
# ─────────────────────────────────────────────────────────────────────

def borrowed_prices(path):
    """저장소에 있는 국내 일봉을 76 티커에 빌려 끼운다. 값의 뜻은 없다."""
    src = json.load(open(BORROW, encoding='utf-8'))['stocks']
    keys = sorted(src)
    out = {}
    for n, it in enumerate(L.items()):
        s = src[keys[n % len(keys)]]
        cut = len(s['d'])
        if n % 9 == 0:
            cut = 160                       # 부분 등급이 나오게
        if n % 17 == 0:
            cut = 80                        # 짧음 등급이 나오게
        ser = {k: s[k][-cut:] for k in ('d', 'o', 'h', 'l', 'c', 'v')}
        rec = {k: it[k] for k in ('no', 'scope', 'group', 'theme', 'ticker',
                                  'name', 'code')}
        rec.update({'symbol_used': it['symbols'][0],
                    'route': 'naver' if it['scope'] == 'KR' else 'yahoo',
                    'name_source': (it['name'] if it['scope'] == 'KR'
                                    else it['expect'][0] + ' test fund'),
                    'instrument_type': None if it['scope'] == 'KR' else 'ETF',
                    'currency': 'KRW' if it['scope'] == 'KR' else 'USD',
                    'exchange': None, 'bars': ser, 'bars_n': len(ser['d']),
                    'from': ser['d'][0], 'to': ser['d'][-1]})
        if it['scope'] == 'OV':
            rec['adjclose'] = [c * 1.03 for c in ser['c']]
        out[it['ticker']] = rec
    days = sorted({d for r in out.values() for d in r['bars']['d']})
    json.dump({'generated_at_kst': '시험용', 'source': {'KR': '시험용', 'OV': '시험용'},
               'routes_used': {'borrowed': len(out)}, 'list_counts': L.counts(),
               'note': '시험용', 'failed': [],
               'coverage': {'requested': len(out), 'got': len(out), 'failed': 0,
                            'days': len(days), 'from': days[0], 'to': days[-1]},
               'items': out}, open(path, 'w', encoding='utf-8'), ensure_ascii=False)


def test_pipeline():
    if not os.path.exists(BORROW):
        FAILS.append('빌려 쓸 일봉이 없습니다 — %s' % BORROW)
        N[0] += 1
        return
    tmp = tempfile.mkdtemp(prefix='etfcheck')
    try:
        px, sg = os.path.join(tmp, 'prices.json'), os.path.join(tmp, 'signals.json')
        borrowed_prices(px)
        rc = BE.main(['--prices', px, '--out', sg])
        ok('신호를 냈다', rc == 0)
        doc = json.load(open(sg, encoding='utf-8'))
        ok('76종이 모두 판에 있다',
           len(doc['items']) + len(doc['missing']) == 76,
           '%d + %d' % (len(doc['items']), len(doc['missing'])))
        ok('등급이 갈렸다', doc['summary']['full'] and doc['summary']['partial']
           and doc['summary']['short'],
           json.dumps(doc['summary'], ensure_ascii=False))
        # **모자란 이력에 신호대가 붙지 않았는가** — 이 표에서 가장 하기 쉬운 잘못
        for it in doc['items']:
            if it['tier'] != 'full':
                blob = json.dumps(it, ensure_ascii=False)
                ok('%s 에 신호대가 없다' % it['ticker'], '"band"' not in blob)
                ok('%s 에 매매계획이 없다' % it['ticker'], '"plan"' not in blob)
        ok('성적표를 싣지 않은 까닭이 적혀 있다', bool(doc.get('backtest_note')))

        # 검산기를 그 판에 걸어 본다 — **흠 심기까지 여기서 돈다**
        keep = (V.PRICES, V.SIGNALS)
        V.PRICES, V.SIGNALS = px, sg
        V.FAILS.clear(); V.WARNS.clear(); V.CHECKS[0] = 0
        out = os.dup(1)
        try:
            with open(os.devnull, 'w') as dn:
                os.dup2(dn.fileno(), 1)
                rc = V.main()
        finally:
            os.dup2(out, 1); os.close(out)
            V.PRICES, V.SIGNALS = keep
        ok('검산기가 통과시켰다', rc == 0, ' / '.join(V.FAILS[:3]))
        ok('검산이 넉넉히 돌았다', V.CHECKS[0] > 300, '%d 가지' % V.CHECKS[0])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    test_list()
    test_yahoo_parse()
    test_to_series()
    test_name_agrees()
    test_pipeline()

    print('시험 %d 가지' % N[0])
    print()
    print('**여기서 시험하지 못한 것** — 야후·네이버가 정말 그 꼴로 답하는지, 티커가')
    print('정말 그 펀드인지. 그건 살아 있는 응답을 봐야 알고, verify_etf.py 의 이름')
    print('맞대기가 러너에서 답한다.')
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
