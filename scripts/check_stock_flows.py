# -*- coding: utf-8 -*-
"""수급 수집기를 **네트워크 없이** 시험한다.

만든 세션은 네이버로 나가는 길이 막혀 있어 살아 있는 응답을 본 적이 없다. 그
처지에서 할 수 있는 것과 없는 것을 갈라 적는다.

**할 수 없는 것** — 필드 이름이 맞는지, 표의 칸 차례가 맞는지. 그건 실제 응답을
봐야 안다. 워크플로가 처음 도는 날 verify_stock_flows.py 가 답한다.

**할 수 있는 것, 그리고 여기서 하는 것**
  하나. 파서가 **가정한 꼴**을 제대로 읽는가 — 손으로 만든 조각에 대고 본다.
        칸을 하나 밀려 읽는 따위의 코딩 실수는 여기서 잡힌다.
  둘.   합치기(merge)가 겹치지 않고 빈 날을 메우는가.
  셋.   **검산기가 실제로 흠을 잡는가.** 부호 뒤집기·단위 백 배·칸 밀림·0 메우기를
        일부러 심어 verify_stock_flows.py 가 다 잡는지 본다.

셋째가 이 대본의 핵심이다. 파서가 맞는지는 아직 모르지만, **틀렸을 때 잡히기는
하는가**는 지금 증명할 수 있다. 그걸 증명해 두지 않으면 워크플로가 처음 도는 날
검산기가 통과를 찍어도 그게 「맞다」인지 「검산기가 눈을 감았다」인지 알 수 없다.
"""

import json
import os
import random
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_stock_flows as F
import verify_stock_flows as V

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = os.path.join(ROOT, '.flowcheck.json')

FAILS = []
N = [0]


def ok(name, cond, note=''):
    N[0] += 1
    if not cond:
        FAILS.append('%s%s' % (name, (' — ' + note) if note else ''))


# ─────────────────────────────────────────────────────────────────────
# 하나. 파서
# ─────────────────────────────────────────────────────────────────────

def test_json_parser():
    """index.html 이 쓰는 필드 이름 그대로 만든 조각."""
    doc = {'dealTrendInfos': [
        {'bizdate': '20260916', 'closePrice': '253,500',
         'foreignerPureBuyQuant': '100000', 'organPureBuyQuant': '-50000',
         'individualPureBuyQuant': '-50000', 'foreignerHoldRatio': '52.13'},
        {'bizdate': '20260915', 'closePrice': '248,500',
         'foreignerPureBuyQuant': '-20000', 'organPureBuyQuant': '10000',
         'individualPureBuyQuant': '10000', 'foreignerHoldRatio': '52.09'},
        {'bizdate': '엉터리', 'closePrice': '1'},          # 날짜가 아니면 버린다
        {'closePrice': '1', 'foreignerPureBuyQuant': '1'},  # 날짜가 없으면 버린다
    ]}
    rows = F.parse_trend_json(doc)
    ok('JSON 파서 행 수', len(rows) == 2, '%d 행' % len(rows))
    r = [x for x in rows if x['d'] == '2026-09-16'][0]
    # 100,000주 × 253,500원 ÷ 1e8 = 253.5 억원
    ok('JSON 순매수 억원 환산', abs(r['f'] - 253.5) < 0.01, 'f=%s' % r['f'])
    ok('JSON 기관 부호', r['i'] < 0, 'i=%s' % r['i'])
    ok('JSON 보유율', r['r'] == 52.13, 'r=%s' % r['r'])
    ok('JSON 종가', r['c'] == 253500, 'c=%s' % r['c'])
    ok('JSON 날짜 꼴', r['d'] == '2026-09-16')


def test_html_parser():
    """네이버 frgn.naver 표의 칸 차례대로 만든 조각.

    칸: 날짜 · 종가 · 전일비 · 등락률 · 거래량 · 기관 순매매량 · 외국인 순매매량 ·
        보유주수 · 보유율
    """
    html = '''
    <table><tbody>
      <tr><th>날짜</th><th>종가</th><th>전일비</th><th>등락률</th><th>거래량</th>
          <th>순매매량</th><th>순매매량</th><th>보유주수</th><th>보유율</th></tr>
      <tr><td>2026.09.16</td><td>253,500</td><td>5,000</td><td>+2.01%</td>
          <td>11,757,106</td><td>-50,000</td><td>100,000</td>
          <td>3,100,000,000</td><td>52.13</td></tr>
      <tr><td>2026.09.15</td><td>248,500</td><td>-500</td><td>-0.20%</td>
          <td>9,000,000</td><td>10,000</td><td>-20,000</td>
          <td>3,099,900,000</td><td>52.09</td></tr>
      <tr><td colspan="9"></td></tr>
    </tbody></table>'''
    rows = F.parse_frgn_html(html)
    ok('HTML 파서 행 수', len(rows) == 2, '%d 행' % len(rows))
    if len(rows) != 2:
        return
    r = [x for x in rows if x['d'] == '2026-09-16'][0]
    ok('HTML 종가', r['c'] == 253500, 'c=%s' % r['c'])
    # **칸이 밀렸으면 여기서 터진다.** 거래량(11,757,106)을 순매수로 읽으면
    # 253.5 가 아니라 29,804 억원이 된다.
    ok('HTML 외국인 순매수 억원', abs(r['f'] - 253.5) < 0.01,
       'f=%s (거래량 칸을 읽었으면 29804 쯤 나온다)' % r['f'])
    ok('HTML 기관 순매수 억원', abs(r['i'] + 126.75) < 0.01, 'i=%s' % r['i'])
    ok('HTML 보유율', r['r'] == 52.13, 'r=%s' % r['r'])
    # 머리글 행과 빈 행은 걸러졌는가
    ok('HTML 머리글 걸름', all(x['d'].startswith('2026') for x in rows))


# ─────────────────────────────────────────────────────────────────────
# 둘. 합치기
# ─────────────────────────────────────────────────────────────────────

def test_merge():
    old = {}
    a = F.merge(old, 'X', [{'d': '2026-09-15', 'c': 1, 'f': 1, 'i': 1, 'p': 1, 'r': 50}])
    b = F.merge({'X': a}, 'X', [{'d': '2026-09-16', 'c': 2, 'f': 2, 'i': 2, 'p': 2, 'r': 51}])
    ok('합치기 — 날짜가 늘어난다', b['d'] == ['2026-09-15', '2026-09-16'], str(b['d']))
    ok('합치기 — 값이 따라온다', b['f'] == [1, 2], str(b['f']))
    # 같은 날을 다시 받으면 겹치지 않고 새 값이 이긴다
    c = F.merge({'X': b}, 'X', [{'d': '2026-09-16', 'c': 9, 'f': 9, 'i': 9, 'p': 9, 'r': 59}])
    ok('합치기 — 겹치지 않는다', len(c['d']) == 2, str(c['d']))
    ok('합치기 — 새 값이 이긴다', c['f'] == [1, 9], str(c['f']))
    # 사이가 빈 날을 나중에 메운다
    d = F.merge({'X': c}, 'X', [{'d': '2026-09-14', 'c': 0, 'f': 0.5, 'i': 0, 'p': 0, 'r': 49}])
    ok('합치기 — 앞날이 끼어든다', d['d'][0] == '2026-09-14', str(d['d']))
    ok('합치기 — 차례가 맞는다', d['d'] == sorted(d['d']))


# ─────────────────────────────────────────────────────────────────────
# 셋. 검산기가 흠을 잡는가 — **이 대본의 핵심**
# ─────────────────────────────────────────────────────────────────────

def build_fixture():
    """저장소에 있는 **진짜 일봉과 진짜 시장 전체 수급**으로 그럴듯한 판을 만든다.

    종가는 일봉에서 그대로 가져오므로 「가. 종가 대조」가 통과한다. 외국인 순매수는
    시장 전체 수급을 시총 비중으로 쪼개고 잡음을 얹어 만들므로 「나. 시장 합 대조」도
    통과한다. **이건 수집기가 맞다는 증거가 아니다** — 검산기가 「맞는 판」을
    통과시키고 「틀린 판」을 잡는지 보려고 만든 자리다.
    """
    hp = os.path.join(ROOT, 'data', 'volatility', 'history.json')
    mkt = {r['d']: r['foreign'] for r in
           ((json.load(open(hp, encoding='utf-8')).get('flows') or {}).get('investors') or [])
           if r.get('foreign') is not None}
    if not mkt:
        return None

    r0 = subprocess.run(['git', '-C', ROOT, 'ls-tree', '-r', '--name-only',
                         'origin/kr100-data'], capture_output=True, text=True)
    paths = [p for p in r0.stdout.split() if '/chart/' in p][:20]
    rnd = random.Random(7)
    stocks = {}
    for p in paths:
        sym = os.path.basename(p)[:-5]
        r = subprocess.run(['git', '-C', ROOT, 'show', 'origin/kr100-data:' + p],
                           capture_output=True, text=True)
        if r.returncode != 0:
            continue
        d = json.loads(r.stdout).get('daily') or {}
        rows = []
        for i in range(len(d['d'])):
            day = d['d'][i]
            if day not in mkt or d['c'][i] is None:
                continue
            share = 1.0 / len(paths)
            f = mkt[day] * share * (1 + rnd.uniform(-0.3, 0.3))
            rows.append({'d': day, 'c': d['c'][i],
                         'f': round(f, 2), 'i': round(-f * 0.4, 2),
                         'p': round(-f * 0.6, 2), 'r': round(40 + rnd.uniform(-5, 5), 2)})
        if rows:
            stocks[sym] = {k: [r[k] for r in rows] for k in ('d', 'c', 'f', 'i', 'p', 'r')}
    if not stocks:
        return None
    days = sorted({x for s in stocks.values() for x in s['d']})
    return {'generated_at_kst': '시험용', 'source': '시험용 합성 자료',
            'unit': {'f': '억원'}, 'derivation': '시험용',
            'coverage': {'stocks': len(stocks), 'days': len(days)},
            'stocks': stocks}


def run_verifier(doc):
    """검산기를 돌려 실패 수를 돌려준다."""
    json.dump(doc, open(TMP, 'w', encoding='utf-8'), ensure_ascii=False)
    V.FAILS.clear(); V.WARNS.clear(); V.CHECKS[0] = 0
    keep_out = sys.stderr
    try:
        sys.stderr = open(os.devnull, 'w')
        V.verify_shape(doc)
        V.verify_closes(doc)
        V.verify_close_lag(doc)
        V.verify_against_market(doc)
    finally:
        sys.stderr.close()
        sys.stderr = keep_out
    return list(V.FAILS)


def test_fault_injection():
    import copy
    base = build_fixture()
    if not base:
        FAILS.append('시험용 판을 만들지 못했습니다 (일봉 가지나 시장 수급이 없습니다)')
        return

    clean = run_verifier(base)
    ok('맞는 판은 통과한다', not clean, ' / '.join(clean[:3]))

    def inject(name, mutate):
        d = copy.deepcopy(base)
        mutate(d)
        got = run_verifier(d)
        N[0] += 1
        if not got:
            FAILS.append('**놓침** %s' % name)
        return bool(got)

    caught = []

    def flip(d):
        for s in d['stocks'].values():
            s['f'] = [None if x is None else -x for x in s['f']]
    caught.append(('부호를 뒤집는다', inject('부호 뒤집기', flip)))

    def unit(d):
        for s in d['stocks'].values():
            s['f'] = [None if x is None else x * 100 for x in s['f']]
    caught.append(('단위를 백 배로 잡는다', inject('단위 백 배', unit)))

    def shift(d):
        # 칸이 밀려 거래량을 순매수로 읽은 꼴 — 언제나 양수이고 크다
        for s in d['stocks'].values():
            s['f'] = [None if c is None else abs(c) * 3 for c in s['c']]
    caught.append(('칸이 밀려 거래량을 읽는다', inject('칸 밀림', shift)))

    def zeros(d):
        for s in d['stocks'].values():
            s['f'] = [0 for _ in s['f']]
    caught.append(('없는 것을 0 으로 메운다', inject('0 메우기', zeros)))

    def shiftdates(d):
        # 종가를 한 칸 밀려 붙인 꼴. verify_close_lag 이 이걸 잡아야 한다.
        for s2 in d['stocks'].values():
            s2['c'] = s2['c'][1:] + [s2['c'][-1]]
    caught.append(('날짜를 한 칸 밀려 붙인다', inject('날짜 밀림', shiftdates)))

    def badclose(d):
        for s in d['stocks'].values():
            s['c'] = [None if c is None else c * 1.2 for c in s['c']]
    caught.append(('종가가 일봉과 다르다', inject('종가 어긋남', badclose)))

    def ragged(d):
        s = list(d['stocks'].values())[0]
        s['f'] = s['f'][:-3]
    caught.append(('계열 길이가 어긋난다', inject('길이 어긋남', ragged)))

    def badratio(d):
        s = list(d['stocks'].values())[0]
        s['r'] = [999 for _ in s['r']]
    caught.append(('보유율이 0~100 을 벗어난다', inject('보유율 범위', badratio)))

    def nounit(d):
        d.pop('unit', None)
        d.pop('derivation', None)
    caught.append(('단위를 안 적는다', inject('단위 누락', nounit)))

    print('흠 심기 — 일부러 틀린 판을 넣고 검산기가 잡는지 본다')
    for nm, got in caught:
        print('  %s %s' % ('잡음' if got else '**놓침**', nm))
    print()


def run_freshness(doc, bar_date):
    """신선도 검사만 돌려 (실패, 경고) 를 돌려준다.

    흠 심기 틀(inject)을 그대로 못 쓰는 까닭 — 그 틀은 **실패**만 본다. 낡은 자료는
    실패가 아니라 경고다(네이버가 늦는 것은 우리가 고칠 일이 아니고, 받아 둔 날들은
    늦었어도 버릴 것이 아니다). 그래서 경고까지 보는 자리를 따로 둔다.

    잣대(일봉의 마지막 거래일)를 **고정해서 넣는다.** 저장소의 진짜 일봉을 쓰면
    시험 결과가 「오늘 수집이 얼마나 돌았나」에 따라 달라진다 — 코드가 그대로인데
    어제는 통과하고 오늘은 실패하는 시험은 아무것도 지켜 주지 못한다.
    """
    V.FAILS.clear(); V.WARNS.clear(); V.CHECKS[0] = 0
    keep = V.latest_bar_date
    try:
        V.latest_bar_date = lambda sample=25: bar_date
        V.verify_freshness(doc)
    finally:
        V.latest_bar_date = keep
    stale = any('[STALE]' in w for w in V.WARNS)
    return list(V.FAILS), stale


def test_freshness():
    """**그날치가 빠졌는데 조용히 성공하는 것**을 잡는지 본다.

    실제로 그 일이 있었다 — 16:14 에 받은 판이 전날까지만 담고 있었는데 아무도
    그렇다고 말해 주지 않아 하루 늦은 수급으로 신호를 냈다. 그 상태를 그대로
    되살려 본다.
    """
    import copy
    base = build_fixture()
    if not base:
        FAILS.append('신선도 시험용 판을 만들지 못했습니다')
        return
    days = sorted({x for s in base['stocks'].values() for x in s['d']})
    base['coverage']['from'], base['coverage']['to'] = days[0], days[-1]

    # 가) 일봉 끝까지 와 있는 판 — 조용해야 한다
    f, stale = run_freshness(copy.deepcopy(base), days[-1])
    N[0] += 1
    ok('최신인 판에는 낡았다고 하지 않는다', not stale and not f, ' / '.join(f[:2]))

    # 나) 마지막 하루가 빠진 판 — **잡아야 한다**
    d2 = copy.deepcopy(base)
    for s in d2['stocks'].values():
        for k in ('d', 'c', 'f', 'i', 'p', 'r'):
            s[k] = s[k][:-1]
    d2['coverage']['to'] = days[-2]
    _, stale2 = run_freshness(d2, days[-1])
    N[0] += 1
    ok('그날치가 빠지면 잡는다', stale2, '16:14 에 받은 판이 이 꼴이었다')

    # 다) 수급이 일봉보다 **앞서는** 판 — 날짜를 잘못 짚은 것이므로 실패여야 한다
    d3 = copy.deepcopy(base)
    d3['coverage']['to'] = '2099-01-01'
    f3, _ = run_freshness(d3, days[-1])
    N[0] += 1
    ok('수급이 일봉보다 앞서면 실패로 잡는다', bool(f3))


def main():
    test_json_parser()
    test_html_parser()
    test_merge()
    test_fault_injection()
    test_freshness()
    if os.path.exists(TMP):
        os.remove(TMP)

    print('시험 %d 가지' % N[0])
    print()
    print('**여기서 시험하지 못한 것** — 네이버 응답의 필드 이름과 표의 칸 차례가')
    print('정말 여기 적은 대로인지. 그건 살아 있는 응답을 봐야 알 수 있고,')
    print('워크플로가 처음 도는 날 verify_stock_flows.py 가 답한다.')
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
