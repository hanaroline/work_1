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
그 펀드인지. 그건 살아 있는 응답을 봐야 알고, 러너가 도는 날 verify_etf_signals.py 의
이름 맞대기가 답한다.

  python3 scripts/check_etf_signals.py
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
import verify_etf_signals as V

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


def test_years_reaches_yahoo():
    """**--years 가 해외분까지 닿는가.**

    예전에는 fetch_ov 가 yahoo_chart(sym) 을 인자 없이 불러 8해치를 달라고 해도
    3해치가 왔다. 오류가 나지 않으므로 숫자만 보고는 알 수 없는 종류의 손실이다.
    망을 타지 않고 확인하려고 yahoo_chart 를 바꿔치기해 받은 인자를 들여다본다.
    """
    seen = []
    keep = F.yahoo_chart
    try:
        F.yahoo_chart = lambda sym, years=F.YEARS: (
            seen.append((sym, years)) or (None, {'route': None, 'errors': ['시험']}))
        it = [x for x in L.items() if x['scope'] == 'OV'][0]
        F.fetch_ov(it, ('', ''), 8)
    finally:
        F.yahoo_chart = keep
    ok('해외분에 햇수가 닿는다', seen and seen[0][1] == 8, str(seen))


def test_keeps_old_on_failure():
    """**받기에 실패한 날 이력을 잃지 않는가.**

    이 대본은 받은 것으로 파일을 통째로 다시 쓴다. 그러면 한 종목이 실패한 날 그
    종목이 파일에서 통째로 사라진다 — 오류 하나가 조용한 손실이 되는 자리다.
    그 자리를 망 없이 시험한다: 수집기를 전부 실패하게 바꿔 놓고 돌려, 예전 판이
    그대로 남는지 본다.
    """
    tmp = tempfile.mkdtemp(prefix='etfkeep')
    try:
        px = os.path.join(tmp, 'prices.json')
        borrowed_prices(px)
        before = json.load(open(px, encoding='utf-8'))
        n_before = len(before['items'])
        a_before = before['items']['A102110']['bars_n']

        keep_kr, keep_ov = F.fetch_kr, F.fetch_ov
        try:
            F.fetch_kr = lambda it, span: (None, {'route': None, 'errors': ['시험']})
            F.fetch_ov = lambda it, span: (None, {'route': None, 'errors': ['시험']})
            err = sys.stderr
            try:
                sys.stderr = open(os.devnull, 'w')
                F.main(['--out', px, '--limit', '5'])
            finally:
                sys.stderr.close()
                sys.stderr = err
        finally:
            F.fetch_kr, F.fetch_ov = keep_kr, keep_ov

        after = json.load(open(px, encoding='utf-8'))
        # 다섯만 불렀고 그 다섯이 모두 실패했다. 76 종목이 모두 남아 있어야 한다 —
        # 부른 다섯은 예전 것을 그대로, 부르지 않은 일흔하나는 손대지 않은 채로.
        ok('모두 실패해도 종목이 사라지지 않는다',
           len(after['items']) == n_before,
           '%d → %d' % (n_before, len(after['items'])))
        ok('부르지 않은 종목의 봉이 그대로다',
           after['items']['A102110']['bars_n'] == a_before)
        ok('낡았다고 적는다',
           len(after['kept_from_previous']) == 5 and
           all('stale' in after['items'][t] for t in after['kept_from_previous']),
           str(after['kept_from_previous']))
        ok('손대지 않은 것을 셈에 적는다',
           after['coverage']['untouched'] == n_before - 5, str(after['coverage']))
        ok('실패를 셈에 적는다', after['coverage']['failed'] == 5,
           str(after['coverage']))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_refuses_to_shrink():
    """**이력이 줄어드는 판을 쓰지 않는가.**

    2026-09-20 에 실제로 잃었다. 「몇 해치」를 비운 채 단추를 눌렀더니 워크플로의
    기본값 3해치로 받아 8해치 이력이 통째로 잘렸다 — 봉 79,575 → 45,383, 76종 중
    46종이 줄었다. 수집기는 줄어든 것을 `shrank` 에 적어 두었고 경고도 띄웠지만,
    **적어 두기만 하고 덮어썼다.** 판은 초록이었고 커밋까지 됐다.

    기워 붙이는 길은 막혀 있다(fetch_etf_prices.py 의 adjclose 주석). 그러면 답은
    쓰지 않는 것뿐이다. 세 가지를 망 없이 본다 — 막는가, 파일이 그대로인가,
    사람이 뚫으면 써지는가. 그리고 애초에 줄여 부르지 않도록 **햇수를 비우면
    지금 파일과 같은 해치**가 되는지도 함께 본다.
    """
    tmp = tempfile.mkdtemp(prefix='etfshrink')
    try:
        px = os.path.join(tmp, 'prices.json')
        borrowed_prices(px)
        doc = json.load(open(px, encoding='utf-8'))
        doc['years_requested'] = 8
        json.dump(doc, open(px, 'w', encoding='utf-8'), ensure_ascii=False)
        # **해외분으로 돌린다.** 국내분만 부르면 fetch_ov 가 돌지 않아 햇수가 거기까지
        # 닿는지 볼 수 없다 — 바로 그 자리가 예전에 한 번 샌 곳이다
        # (test_years_reaches_yahoo 주석).
        ovs = [x['ticker'] for x in L.items() if x['scope'] == 'OV'][:3]
        tk = ovs[0]
        n_before = doc['items'][tk]['bars_n']

        # 받아 오는 쪽을 **예전의 절반만 주도록** 바꿔치기한다.
        seen_years = []

        def half(it, span, years=None):
            seen_years.append(years)
            prev = doc['items'][it['ticker']]['bars']
            cut = max(3, prev['bars_n'] // 2) if 'bars_n' in prev else 0
            cut = max(3, len(prev['d']) // 2)
            rows = [{'d': prev['d'][-cut:][i], 'o': prev['o'][-cut:][i],
                     'h': prev['h'][-cut:][i], 'l': prev['l'][-cut:][i],
                     'c': prev['c'][-cut:][i], 'v': prev['v'][-cut:][i]}
                    for i in range(cut)]
            return rows, {'route': '시험', 'symbol_used': it['symbols'][0],
                          'name_source': doc['items'][it['ticker']]['name_source'],
                          'currency': 'KRW', 'errors': []}

        keep_kr, keep_ov = F.fetch_kr, F.fetch_ov
        err = sys.stderr
        try:
            F.fetch_kr = lambda it, span: half(it, span)
            F.fetch_ov = lambda it, span, years=None: half(it, span, years)
            sys.stderr = open(os.devnull, 'w')
            args = ['--out', px, '--only', 'OV', '--limit', '3']
            rc_block = F.main(args)
            after_block = json.load(open(px, encoding='utf-8'))
            rc_allow = F.main(args + ['--allow-shrink'])
            after_allow = json.load(open(px, encoding='utf-8'))
        finally:
            sys.stderr.close()
            sys.stderr = err
            F.fetch_kr, F.fetch_ov = keep_kr, keep_ov

        ok('짧게 오면 막는다', rc_block == 1, 'rc=%s' % rc_block)
        ok('막았을 때 파일이 그대로다',
           after_block['items'][tk]['bars_n'] == n_before,
           '%s → %s' % (n_before, after_block['items'][tk]['bars_n']))
        ok('막았을 때 예전 햇수가 남아 있다',
           after_block.get('years_requested') == 8,
           str(after_block.get('years_requested')))
        ok('사람이 뚫으면 써진다', rc_allow == 0, 'rc=%s' % rc_allow)
        ok('뚫고 쓴 판은 실제로 짧다',
           after_allow['items'][tk]['bars_n'] < n_before,
           '%s → %s' % (n_before, after_allow['items'][tk]['bars_n']))
        ok('줄어든 종목을 적어 둔다', len(after_allow.get('shrank') or []) > 0,
           str((after_allow.get('shrank') or [])[:3]))
        # 햇수를 말하지 않았으므로 파일에 적힌 8해치를 물려받아야 한다.
        ok('햇수를 비우면 지금 파일과 같은 해치로 받는다',
           after_allow.get('years_requested') == 8 and 8 in seen_years,
           '적힌 햇수 %s · 해외분에 닿은 햇수 %s'
           % (after_allow.get('years_requested'), sorted(set(seen_years), key=str)))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_backtest_guard():
    """**주식 성적표를 ETF 옆에 붙이려 하면 거부하는가.**

    파일 이름 하나만 틀려도 나는 사고다. 그때 숫자는 멀쩡히 붙고 화면도 멀쩡하다 —
    ETF 와 아무 상관 없는 성적이 실릴 뿐이다. 읽는 사람이 가려낼 길이 없으므로
    붙이는 자리에서 막아야 한다.
    """
    import tempfile
    tmp = tempfile.mkdtemp(prefix='etfbtguard')
    try:
        p = os.path.join(tmp, 'backtest.json')

        # 1) 주식 우주 성적표 — 붙으면 안 된다
        json.dump({'engine_hash': 'abc', 'summary_ko': '주식으로 잰 것',
                   'horizons': {}}, open(p, 'w', encoding='utf-8'))
        r = {'engine_hash': 'abc'}
        BE.attach_backtest(r, p)
        ok('주식 우주 성적표를 붙이지 않는다', 'backtest' not in r)
        ok('붙이지 않은 까닭을 적는다',
           'ETF 우주로 잰 것이 아닙니다' in (r.get('backtest_note') or ''))

        # 2) ETF 우주인데 모델이 다르다 — 붙이되 **낡았다고 적어야** 한다
        json.dump({'universe': 'etf', 'engine_hash': 'old', 'summary_ko': 'x',
                   'horizons': {}}, open(p, 'w', encoding='utf-8'))
        r = {'engine_hash': 'new'}
        BE.attach_backtest(r, p)
        ok('다른 모델이어도 붙는다', 'backtest' in r)
        ok('다른 모델이면 낡음 표시가 붙는다', bool(r.get('backtest_stale')))

        # 3) 제대로 된 것 — 붙고 낡음 표시가 없다
        json.dump({'universe': 'etf', 'engine_hash': 'same', 'summary_ko': 'x',
                   'horizons': {}}, open(p, 'w', encoding='utf-8'))
        r = {'engine_hash': 'same'}
        BE.attach_backtest(r, p)
        ok('맞는 성적표는 붙는다', 'backtest' in r and not r.get('backtest_stale'))

        # 4) 아예 없을 때 — 없다고 적어야 한다
        r = {'engine_hash': 'same'}
        BE.attach_backtest(r, os.path.join(tmp, '없는파일.json'))
        ok('성적표가 없으면 없다고 적는다',
           'backtest' not in r and bool(r.get('backtest_note')))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    test_list()
    test_yahoo_parse()
    test_to_series()
    test_name_agrees()
    test_years_reaches_yahoo()
    test_keeps_old_on_failure()
    test_refuses_to_shrink()
    test_backtest_guard()
    test_pipeline()

    print('시험 %d 가지' % N[0])
    print()
    print('**여기서 시험하지 못한 것** — 야후·네이버가 정말 그 꼴로 답하는지, 티커가')
    print('정말 그 펀드인지. 그건 살아 있는 응답을 봐야 알고, verify_etf_signals.py 의 이름')
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
