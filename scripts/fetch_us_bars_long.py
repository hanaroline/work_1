#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""미국 100대 기업 일봉을 **백테스트가 쓸 만큼 길게** 받는다.

    python3 scripts/fetch_us_bars_long.py [--years 8] [--limit 5] [--only AAPL,MSFT]

    data/us100/bars8y/{SYM}.json   종목별 일봉 8해치
    data/us100/bars8y/_meta.json   받은 시각 · 해치 · 온전/짧음 · 미끄러짐/잘림

■ 왜 따로 받는가

`fetch_us100.py` 가 받는 `data/us100/chart/` 는 **2해치**다(`range=2y`). 그건
us-top100 화면이 그리는 자리이고, 날마다 커밋된다. 두 해로 충분하다.

그런데 매매 타이밍은 같은 자료로 **대조군 백테스트**를 한다. 2해치를 앞뒤로
나누면 검증구간이 아홉 달 반밖에 안 되고, 그 안에서 겪은 장세는 하나다.
실제로 미국주식만 검증구간 초과수익이 음수(-0.64%p · 472 거래)로 나와
「보류」가 붙어 있다. 다른 네 시장은 모두 양수다.

**화면이 읽는 2해치를 8해치로 늘리지는 않는다.** 그러면 날마다 10 MB 가
커밋되고, 화면은 쓰지도 않는 것을 지고 다닌다. 백테스트만 읽는 긴 판을
따로 두고 **주 1회** 받는다.

■ 이력이 줄어드는 것을 막는다 — ETF 수집기에서 배운 그대로

이 대본도 받은 것으로 파일을 통째로 다시 쓴다. 그러면 짧은 해치로 한 번
잘못 부르면 **이력이 그 자리에서 사라진다.** ETF 에서 실제로 그랬다
(79,575 → 45,383 봉). 그래서 두 가지를 그대로 옮겨 왔다.

  --years 0   **지금 파일과 같은 해치.** 기본값을 숫자로 박아 두면 단추를
              그냥 누른 사람이 이력을 줄인다.
  잘리면 멈춘다  예전보다 짧게 왔으면 쓰지 않고 1 로 끝낸다.

다만 **미끄러진 것과 잘린 것은 다르다.** 창은 오늘에 매여 있어서, 하루가
지나면 가장 오래된 봉 하나가 밖으로 밀려난다. 봉 수만 보고 막으면 날마다
넘어진다 — 그것도 실제로 겪었다. 가르는 잣대는 **시작 날짜가 얼마나
밀렸는가**다. 창은 지난 날수만큼만 미끄러진다.

■ 왜 옛것과 새것을 이어 붙이지 않는가

야후의 조정종가는 배당·분할이 생길 때마다 **과거까지 거슬러 다시 계산된다.**
3해치로 받은 것과 8해치로 받은 것을 날짜로 기워 붙이면, 이음매를 사이에 두고
기준이 다른 값이 한 계열에 섞인다. 수익률 분포가 조용히 일그러지고, 그 위에서
잰 초과수익은 무엇을 잰 것인지 알 수 없게 된다. 그래서 **한 번에 받은 것만**
쓴다.

나가는 값: 흠이 없으면 0, 잘렸으면 1.
"""
import argparse
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import fetch_us100 as U  # noqa: E402  (망 다루는 몫은 여기에 이미 다 있다)

OUT_DIR = os.path.join(ROOT, 'data', 'us100', 'bars8y')
META = '_meta.json'
YEARS = 8
PAUSE = 0.35

# 창이 하루 미끄러지는 것 말고도, 장이 쉰 날·거래정지가 있다. 그만큼의 여유.
SLIDE_MARGIN = 7


def kst_now():
    return datetime.now(timezone(timedelta(hours=9)))


def _days_between(a, b):
    """b − a 를 날수로. 읽지 못하면 0 — 가르지 못하는 것으로 막지는 않는다."""
    try:
        f = '%Y-%m-%d'
        return (datetime.strptime(b, f) - datetime.strptime(a, f)).days
    except (ValueError, TypeError):
        return 0


def load_prev(out_dir):
    """예전 판. {심볼: {'d': [...], ...}} 과 _meta 를 돌려준다."""
    prev, meta = {}, {}
    if not os.path.isdir(out_dir):
        return prev, meta
    for name in os.listdir(out_dir):
        if not name.endswith('.json'):
            continue
        path = os.path.join(out_dir, name)
        try:
            doc = json.load(open(path, encoding='utf-8'))
        except (ValueError, OSError):
            continue
        if name == META:
            meta = doc
            continue
        s = doc.get('daily') or {}
        if s.get('d'):
            prev[doc.get('symbol') or name[:-5]] = s
    return prev, meta


def fetch_one(sym, rng):
    """일봉 한 벌. 야후가 막히면 Stooq 로 돌아간다 — chart 가 404 나는 심볼이
    실제로 있었다(FI·MMC)."""
    try:
        ser, _meta, _d, _s = U.fetch_chart(sym, rng, '1d')
        return ser, 'yahoo'
    except Exception as e:                       # noqa: BLE001
        time.sleep(PAUSE)
        try:
            # Stooq 는 range 를 모르므로 받을 수 있는 만큼 받아 창으로 자른다.
            ser = U.fetch_chart_stooq(sym, 'd', keep_days=10 ** 6)
            return ser, 'stooq'
        except Exception as e2:                  # noqa: BLE001
            raise RuntimeError('%s / stooq: %s' % (e, e2))


def clip(ser, first_day):
    """first_day 보다 앞선 봉을 버린다. Stooq 로 받은 것을 창에 맞춘다."""
    keep = [i for i, d in enumerate(ser['d']) if d >= first_day]
    if len(keep) == len(ser['d']):
        return ser
    return {k: [v[i] for i in keep] for k, v in ser.items()}


def main(argv):
    ap = argparse.ArgumentParser()
    # **0 은 「지금 파일과 같은 해치」다.** 숫자를 기본값으로 박으면, 단추를 그냥
    # 누른 사람이 이력을 줄인다. ETF 에서 정확히 그렇게 잃었다.
    ap.add_argument('--years', type=int, default=0)
    ap.add_argument('--only', default='', help='쉼표로 구분한 심볼만')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--out', default=OUT_DIR)
    ap.add_argument('--allow-shrink', action='store_true',
                    help='예전보다 짧게 와도 그대로 쓴다 (이력이 줄어든다)')
    a = ap.parse_args(argv)

    prev, prev_meta = load_prev(a.out)
    if a.years <= 0:
        a.years = int(prev_meta.get('years_requested') or YEARS)
        sys.stderr.write('햇수를 말하지 않아 %s%d해치로 받는다\n'
                         % ('지금 파일과 같은 ' if prev_meta else '', a.years))
    rng = '%dy' % a.years

    today = kst_now()
    first_day = (today - timedelta(days=a.years * 366)).strftime('%Y-%m-%d')

    # 얼마나 미끄러져도 되는가 = 여유 + 지난번 수집 이후 지난 날수.
    allow_slide = SLIDE_MARGIN
    _prev_at = (prev_meta.get('generated_at_kst') or '')[:10]
    if _prev_at:
        allow_slide += max(0, _days_between(_prev_at, today.strftime('%Y-%m-%d')))

    syms = [c['sym'] for c in U.companies_from_page()]
    if a.only:
        want = {s.strip().upper() for s in a.only.split(',') if s.strip()}
        syms = [s for s in syms if s.upper() in want]
    if a.limit:
        syms = syms[:a.limit]
    if not syms:
        sys.stderr.write('::error::받을 심볼이 없습니다\n')
        return 1

    U.init_crumb()
    got, failed, routes, shrunk, slid, short = {}, [], {}, [], [], []

    for n, sym in enumerate(syms):
        try:
            ser, route = fetch_one(sym, rng)
        except Exception as e:                   # noqa: BLE001
            failed.append('%s %s' % (sym, str(e)[:80]))
            sys.stderr.write('  %-8s 못 받음 — %s\n' % (sym, str(e)[:70]))
            time.sleep(PAUSE)
            continue
        if route == 'stooq':
            ser = clip(ser, first_day)
        routes[route] = routes.get(route, 0) + 1

        was = (prev.get(sym) or {}).get('d') or []
        if was and len(ser['d']) < len(was):
            slide = _days_between(was[0], ser['d'][0])     # 시작이 뒤로 밀린 날수
            back = _days_between(ser['d'][-1], was[-1])    # 끝이 앞당겨진 날수
            if slide > allow_slide or back > 0:
                shrunk.append('%s %d→%d (시작 %s→%s)'
                              % (sym, len(was), len(ser['d']), was[0], ser['d'][0]))
            else:
                slid.append('%s %d→%d' % (sym, len(was), len(ser['d'])))
        # 상장한 지 얼마 안 된 종목은 짧게 오는 것이 정상이다. 세어만 둔다.
        if _days_between(first_day, ser['d'][0]) > 30:
            short.append('%s %s~' % (sym, ser['d'][0]))
        got[sym] = ser
        time.sleep(PAUSE)
        if (n + 1) % 10 == 0:
            sys.stderr.write('  %d/%d\n' % (n + 1, len(syms)))

    if not got:
        sys.stderr.write('::error::한 종목도 받지 못했습니다\n')
        return 1

    # **쓰기 전에 막는다.** 반쯤 쓰고 나서 막으면 이미 늦다.
    if shrunk and not a.allow_shrink:
        sys.stderr.write(
            '::error::예전보다 짧게 온 종목 %d 개 — 쓰지 않고 멈춥니다. %s%s\n'
            % (len(shrunk), ', '.join(shrunk[:8]), ' 외' if len(shrunk) > 8 else ''))
        sys.stderr.write('정말 줄이려면 --allow-shrink 를 주십시오.\n')
        return 1

    os.makedirs(a.out, exist_ok=True)
    bars_n = 0
    for sym, ser in got.items():
        bars_n += len(ser['d'])
        with open(os.path.join(a.out, sym + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'symbol': sym, 'daily': ser,
                       'fetchedAt': datetime.now(timezone.utc)
                                    .strftime('%Y-%m-%dT%H:%M:%SZ')},
                      f, ensure_ascii=False, separators=(',', ':'))

    meta = {
        'generated_at_kst': kst_now().strftime('%Y-%m-%d %H:%M:%S'),
        'years_requested': a.years,
        'source': 'yahoo-finance (막히면 stooq)',
        'note': ('백테스트 전용 긴 일봉. 화면이 읽는 것은 data/us100/chart/ 이고 '
                 '이쪽은 매매 타이밍 백테스트만 읽는다.'),
        'coverage': {'asked': len(syms), 'got': len(got), 'failed': len(failed),
                     'short': len(short), 'slid': len(slid), 'shrank': len(shrunk)},
        'bars': bars_n,
        'from': min(s['d'][0] for s in got.values()),
        'to': max(s['d'][-1] for s in got.values()),
        'routes': routes,
        'failed': failed,
        'short': short,
        'slid': slid,
        'shrank': shrunk,
    }
    with open(os.path.join(a.out, META), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1, sort_keys=True)

    sys.stderr.write('\n%d 종목 · %d 봉 · %s ~ %s · 경로 %s\n'
                     % (len(got), bars_n, meta['from'], meta['to'], routes))
    if slid:
        sys.stderr.write('창이 미끄러진 종목 %d 개 (흠이 아닙니다): %s\n'
                         % (len(slid), ', '.join(slid[:10])))
    if short:
        sys.stderr.write('창보다 짧게 온 종목 %d 개 (상장이 늦은 것): %s\n'
                         % (len(short), ', '.join(short[:10])))
    if failed:
        sys.stderr.write('::warning::못 받은 종목 %d 개: %s\n'
                         % (len(failed), ', '.join(failed[:5])))
    return 0


def selftest():
    """망 없이 **가르는 규칙**만 시험한다.

    받아 오는 몫은 야후가 답해 봐야 알고, 그건 러너가 본다. 여기서 재는 것은
    이 대본이 스스로 정하는 것 — 해치를 물려받는가, 미끄러진 것을 잘린 것으로
    읽지 않는가, 정말 잘렸을 때 **쓰지 않고 멈추는가**.
    """
    import shutil
    import tempfile

    fails = []
    def check(cond, label, detail=''):
        if not cond:
            fails.append(label + ((' — ' + detail) if detail else ''))

    base = (datetime.now() - timedelta(days=400)).date()
    def series(n, drop_front=0, drop_back=0):
        days = [(base + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(n)]
        days = days[drop_front:len(days) - drop_back] if drop_back else days[drop_front:]
        k = len(days)
        return {'d': days, 'o': [10.0] * k, 'h': [11.0] * k,
                'l': [9.0] * k, 'c': [10.5] * k, 'v': [100] * k}

    real_chart, real_pages, real_crumb, real_pause = (
        U.fetch_chart, U.companies_from_page, U.init_crumb, PAUSE)
    globals()['PAUSE'] = 0
    U.init_crumb = lambda *a, **k: None
    U.companies_from_page = lambda: [{'sym': 'AAA'}, {'sym': 'BBB'}]

    def feed(n, drop_front=0, drop_back=0):
        def f(sym, rng, interval, events=False):
            return series(n, drop_front, drop_back), {}, [], []
        return f

    tmp = tempfile.mkdtemp(prefix='usbars')
    try:
        # 1. 처음 받기 — 두 종목이 서고 _meta 가 선다
        U.fetch_chart = feed(300)
        rc = main(['--years', '8', '--out', tmp])
        meta = json.load(open(os.path.join(tmp, META), encoding='utf-8'))
        check(rc == 0, '처음 받기가 통과', 'rc=%d' % rc)
        check(meta['coverage']['got'] == 2, '두 종목이 섰다', str(meta['coverage']))
        check(meta['years_requested'] == 8, '해치가 적혔다', str(meta['years_requested']))
        check(os.path.exists(os.path.join(tmp, 'AAA.json')), 'AAA 가 쓰였다')

        # 2. 해치를 말하지 않으면 지금 파일에서 물려받는다
        U.fetch_chart = feed(300)
        rc = main(['--out', tmp])
        meta = json.load(open(os.path.join(tmp, META), encoding='utf-8'))
        check(rc == 0 and meta['years_requested'] == 8,
              '해치를 말하지 않으면 물려받는다', 'rc=%d years=%s' % (rc, meta['years_requested']))

        # 3. 앞이 하나 밀린 것은 **미끄러짐** — 쓴다
        U.fetch_chart = feed(300, drop_front=1)
        rc = main(['--out', tmp])
        meta = json.load(open(os.path.join(tmp, META), encoding='utf-8'))
        check(rc == 0, '창이 미끄러진 것은 막지 않는다', 'rc=%d' % rc)
        check(meta['coverage']['slid'] == 2 and meta['coverage']['shrank'] == 0,
              '미끄러짐으로 적힌다', str(meta['coverage']))

        # 4. 앞이 절반 날아간 것은 **잘림** — 쓰지 않고 멈춘다
        before = open(os.path.join(tmp, 'AAA.json'), encoding='utf-8').read()
        U.fetch_chart = feed(300, drop_front=150)
        rc = main(['--out', tmp])
        after = open(os.path.join(tmp, 'AAA.json'), encoding='utf-8').read()
        check(rc == 1, '잘린 것은 1 로 멈춘다', 'rc=%d' % rc)
        check(before == after, '멈췄으면 파일이 그대로다')

        # 5. 끝이 앞당겨진 것도 막는다 (하루치가 사라진 것이니 미끄러짐이 아니다)
        U.fetch_chart = feed(300, drop_front=1, drop_back=1)
        rc = main(['--out', tmp])
        check(rc == 1, '끝이 앞당겨지면 막는다', 'rc=%d' % rc)

        # 6. --allow-shrink 를 주면 정말 줄인다
        U.fetch_chart = feed(300, drop_front=150)
        rc = main(['--out', tmp, '--allow-shrink'])
        meta = json.load(open(os.path.join(tmp, META), encoding='utf-8'))
        check(rc == 0 and meta['coverage']['shrank'] == 2,
              '--allow-shrink 는 통과시킨다', 'rc=%d %s' % (rc, meta['coverage']))
    finally:
        U.fetch_chart, U.companies_from_page, U.init_crumb = (
            real_chart, real_pages, real_crumb)
        globals()['PAUSE'] = real_pause
        shutil.rmtree(tmp, ignore_errors=True)

    print('시험 %d 가지' % 12)
    if fails:
        print('\n실패 %d 가지' % len(fails))
        for f in fails:
            print('  !! ' + f)
        return 1
    print('실패 없음')
    return 0


if __name__ == '__main__':
    if '--selftest' in sys.argv[1:]:
        sys.exit(selftest())
    sys.exit(main(sys.argv[1:]))
