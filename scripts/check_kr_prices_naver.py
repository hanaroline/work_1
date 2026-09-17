#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""네이버 일봉 수집기를 **네트워크 없이** 시험한다.

만든 세션은 네이버로 나가는 길이 막혀 있어(CONNECT 403) 살아 있는 응답을 본 적이
없다. 그 처지에서 할 수 있는 것과 없는 것을 갈라 적는다.

**할 수 없는 것** — 세 길 가운데 무엇이 살아 있는지, 필드 이름이 정말 이런지.
그건 러너가 처음 도는 날 verify_kr_prices_naver.py 가 답한다.

**할 수 있는 것** — 파서가 **가정한 꼴**을 제대로 읽는가, 그리고 **말이 안 되는 봉을
거르는가.** 칸이 하나 밀려 읽히면 고가가 저가보다 낮아지는데, 그것을 그냥 쌓으면
나중에 어디부터 틀렸는지 가릴 수 없다. 그래서 파서가 스스로 거르게 해 두었고
여기서 그게 실제로 걸러지는지 본다.

  python3 scripts/check_kr_prices_naver.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_kr_prices_naver as P
import verify_kr_prices_naver as V

FAILS, N = [], [0]


def ok(name, cond, note=''):
    N[0] += 1
    if not cond:
        FAILS.append('%s%s' % (name, (' — ' + note) if note else ''))


# ─────────────────────────────────────────────────────────────────────
# 하나. 파서 셋
# ─────────────────────────────────────────────────────────────────────

SISE = """[['날짜','시가','고가','저가','종가','거래량','외국인소진율'],
['20260916', 248000, 254000, 247500, 253500, 11757106, 46.52],
['20260917', 257000, 259000, 251500, 252500, 12925345, 46.49]]"""


def test_sisejson():
    rows = P.parse_sisejson(SISE)
    ok('siseJson 행 수', len(rows) == 2, '%d 행' % len(rows))
    if len(rows) != 2:
        return
    r = rows[-1]
    ok('siseJson 날짜', r['d'] == '2026-09-17', r['d'])
    ok('siseJson 종가', r['c'] == 252500, str(r['c']))
    # **칸이 밀렸으면 여기서 터진다** — 시가를 종가로 읽으면 257000 이 나온다
    ok('siseJson 시가/종가 안 바뀜', r['o'] == 257000 and r['c'] == 252500,
       'o=%s c=%s' % (r['o'], r['c']))
    ok('siseJson 거래량', r['v'] == 12925345, str(r['v']))
    ok('siseJson 머리글 걸름', all(x['d'].startswith('2026') for x in rows))


def test_mobile():
    doc = json.dumps([
        {'localTradedAt': '2026-09-17', 'openPrice': '257,000', 'highPrice': '259,000',
         'lowPrice': '251,500', 'closePrice': '252,500',
         'accumulatedTradingVolume': '12,925,345'},
        {'localTradedAt': '2026-09-16', 'openPrice': '248,000', 'highPrice': '254,000',
         'lowPrice': '247,500', 'closePrice': '253,500',
         'accumulatedTradingVolume': '11,757,106'},
    ])
    rows = P.parse_mobile_price(doc)
    ok('mobile 행 수', len(rows) == 2, '%d 행' % len(rows))
    if not rows:
        return
    r = [x for x in rows if x['d'] == '2026-09-17'][0]
    ok('mobile 쉼표 섞인 수', r['c'] == 252500 and r['v'] == 12925345,
       'c=%s v=%s' % (r['c'], r['v']))
    # 감싸여 오는 꼴도 읽는가
    ok('mobile 감싼 꼴', len(P.parse_mobile_price(json.dumps({'datas': json.loads(doc)}))) == 2)


def test_fchart():
    xml = ('<chartdata>'
           '<item data="20260916|248000|254000|247500|253500|11757106" />'
           '<item data="20260917|257000|259000|251500|252500|12925345" />'
           '</chartdata>')
    rows = P.parse_fchart_xml(xml)
    ok('fchart 행 수', len(rows) == 2, '%d 행' % len(rows))
    if not rows:
        return
    r = rows[-1]
    ok('fchart 고가', r['h'] == 259000, str(r['h']))
    ok('fchart 저가', r['l'] == 251500, str(r['l']))


# ─────────────────────────────────────────────────────────────────────
# 둘. **말이 안 되는 봉을 거르는가** — 이 대본의 핵심
# ─────────────────────────────────────────────────────────────────────

def test_rejects_impossible():
    """칸이 밀려 읽힌 응답을 넣어 본다.

    시·고·저·종 차례를 뒤섞으면 「고가가 저가보다 낮은」 봉이 나온다. 파서가 그걸
    통과시키면 그 뒤의 어떤 검산도 소용이 없다 — ATR 이며 매물대며 전부 그 봉으로
    셈해지기 때문이다.
    """
    # 고가 자리에 저가를, 저가 자리에 고가를 넣은 응답
    swapped = "[['20260917', 257000, 251500, 259000, 252500, 12925345, 46.49]]"
    ok('고저가 뒤바뀐 봉을 버린다', P.parse_sisejson(swapped) == [],
       '%s' % P.parse_sisejson(swapped))

    # 종가가 고가보다 높은 봉
    over = "[['20260917', 257000, 259000, 251500, 300000, 12925345, 46.49]]"
    ok('종가가 고가를 넘는 봉을 버린다', P.parse_sisejson(over) == [])

    # 값이 빈 봉
    empty = "[['20260917', 257000, '-', 251500, 252500, 12925345, 46.49]]"
    ok('빈 칸이 있는 봉을 버린다', P.parse_sisejson(empty) == [])

    # 0 이 섞인 봉 (거래정지 따위)
    zero = "[['20260917', 0, 0, 0, 0, 0, 46.49]]"
    ok('0 뿐인 봉을 버린다', P.parse_sisejson(zero) == [])

    # 날짜가 아닌 줄
    ok('머리글 줄을 버린다',
       P.parse_sisejson("[['날짜','시가','고가','저가','종가','거래량']]") == [])

    # **멀쩡한 봉은 통과해야 한다** — 거르기만 하면 그것도 고장이다
    good = "[['20260917', 257000, 259000, 251500, 252500, 12925345, 46.49]]"
    ok('멀쩡한 봉은 통과한다', len(P.parse_sisejson(good)) == 1)


def test_merge():
    a = P.merge({}, 'X', [{'d': '2026-09-16', 'o': 1, 'h': 2, 'l': 1, 'c': 2, 'v': 10}])
    b = P.merge({'X': a}, 'X',
                [{'d': '2026-09-17', 'o': 2, 'h': 3, 'l': 2, 'c': 3, 'v': 20}])
    ok('합치기 — 날짜가 는다', b['d'] == ['2026-09-16', '2026-09-17'], str(b['d']))
    c = P.merge({'X': b}, 'X',
                [{'d': '2026-09-17', 'o': 9, 'h': 9, 'l': 9, 'c': 9, 'v': 99}])
    ok('합치기 — 겹치지 않는다', len(c['d']) == 2, str(c['d']))
    ok('합치기 — 새 값이 이긴다', c['c'] == [2, 9], str(c['c']))
    d = P.merge({'X': c}, 'X',
                [{'d': '2026-09-15', 'o': 1, 'h': 1, 'l': 1, 'c': 1, 'v': 1}])
    ok('합치기 — 차례가 맞는다', d['d'] == sorted(d['d']), str(d['d']))


# ─────────────────────────────────────────────────────────────────────
# 셋. 검산기가 흠을 잡는가
# ─────────────────────────────────────────────────────────────────────

def run_self(stocks):
    V.FAILS.clear(); V.WARNS.clear(); V.CHECKS[0] = 0
    keep = sys.stderr
    try:
        sys.stderr = open(os.devnull, 'w')
        V.verify_self({'stocks': stocks})
    finally:
        sys.stderr.close()
        sys.stderr = keep
    return list(V.FAILS)


def test_verifier_catches():
    good = {'X': {'d': ['2026-09-16', '2026-09-17'],
                  'o': [248000, 257000], 'h': [254000, 259000],
                  'l': [247500, 251500], 'c': [253500, 252500],
                  'v': [11757106, 12925345]}}
    ok('맞는 판은 통과한다', not run_self(good), ' / '.join(run_self(good)[:2]))

    import copy
    bad = copy.deepcopy(good); bad['X']['h'][1] = 240000        # 고가 < 저가
    ok('검산기 — 말이 안 되는 봉을 잡는다', bool(run_self(bad)))

    bad2 = copy.deepcopy(good); bad2['X']['d'] = ['2026-09-17', '2026-09-16']
    ok('검산기 — 날짜 역순을 잡는다', bool(run_self(bad2)))

    bad3 = copy.deepcopy(good); bad3['X']['c'] = [253500]        # 길이 어긋남
    ok('검산기 — 계열 길이 어긋남을 잡는다', bool(run_self(bad3)))

    bad4 = copy.deepcopy(good); bad4['X']['c'][1] = None
    ok('검산기 — 빈 종가를 잡는다', bool(run_self(bad4)))


def main():
    test_sisejson()
    test_mobile()
    test_fchart()
    test_rejects_impossible()
    test_merge()
    test_verifier_catches()

    print('시험 %d 가지' % N[0])
    print()
    print('**여기서 시험하지 못한 것** — 세 길 가운데 무엇이 살아 있는지, 필드 이름이')
    print('정말 이런지. 그건 살아 있는 응답을 봐야 알고, 러너가 처음 도는 날')
    print('verify_kr_prices_naver.py 가 야후와 맞대어 답한다.')
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
