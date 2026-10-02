# -*- coding: utf-8 -*-
"""해외 ETF 우주를 넓힌다 — 매매 타이밍 판에만 쓰는 곁 목록.

`data/kis_timing/ov_extra.json` 을 쓴다. `kis_timing_data` 가 이것을
`data/etf/prices.json` 의 해외분과 **합쳐서** 해외ETF 우주로 삼는다.

## 왜 따로 받는가

전략 10종 가운데 셋은 **시가·고가·저가가 있어야 셈할 수 있다** — 강한 종가(IBS),
52주 신고가(전고), 돌파 실패(전고). 그런데 이 저장소가 가진 해외 ETF 봉은 두 갈래고
한쪽에만 그것이 있다.

    data/etf/prices.json          OHLCV 다 있음 · 21종 · 야후
    data/proposal/overseas_etf    **종가뿐** · 19종 · 한국투자증권 오픈API

그래서 처음 판에서는 뒤엣것을 통째로 뺐고, 해외ETF 우주가 18종(260봉 문턱을 넘은
것)에 그쳤다. 열여덟 종목의 성적은 오차가 크다.

여기서 하는 일은 **뒤엣것의 종목을 앞엣것과 같은 문(야후)으로 다시 받는 것**이다.
종가만 있는 봉에 시가·고가·저가를 지어 넣지 않는다 — 그러면 IBS 가 늘 0.5 가 되고
「강한 종가」는 영영 켜지지 않는데, 그건 오류가 아니라 **조용한 거짓**이다.

## 목록을 어디서 얻는가

`data/proposal/overseas_etf.json` 을 **읽어 쓴다.** 티커를 여기 또 적어 두면 목록이
바뀔 때 한쪽만 고쳐져 어긋난다. `etf_list.py` 에 끼워 넣지 않는 까닭은 그 파일이
「사람이 준 표를 그대로 옮긴 것, 여기서 지어낸 것은 하나도 없다」고 못박아 두었기
때문이다 — 다른 데서 온 종목을 그 표에 섞으면 그 말이 거짓이 된다.

이미 `data/etf/prices.json` 에 있는 것(GLD·IEF·QQQ·SCHD·SHY·SPY)은 뺀다. 같은
종목을 두 벌 넣으면 백테스트가 그 종목을 두 번 센다.

## 야후가 답했다고 받아들이지 않는다

`fetch_etf_prices.fetch_ov` 를 그대로 부른다. 그 함수는 **ETF 가 아닌 것이 답하면
건너뛴다** — 같은 글자가 다른 것을 가리키는 일이 있기 때문이다(`GOLD` 는 야후에서
금광 회사 주식이다). 받아 온 이름도 함께 적어 두어 나중에 맞대 볼 수 있게 한다.
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_etf_prices as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))

SOURCE = os.path.join(ROOT, 'data', 'proposal', 'overseas_etf.json')
HAVE = os.path.join(ROOT, 'data', 'etf', 'prices.json')
OUT = os.path.join(ROOT, 'data', 'kis_timing', 'ov_extra.json')

YEARS = 8.0
SLEEP = 1.2

# 기초자산군 이름표. 원본의 assetClass 를 그대로 옮기되 화면에 한글로 보이게만 한다.
ASSET_KO = {'equity': '주식', 'bond': '채권', 'alternative': '대체'}


def candidates():
    """(티커, 이름, 자산군). 이미 가진 것은 뺀다."""
    if not os.path.exists(SOURCE):
        raise SystemExit('%s 가 없습니다' % os.path.relpath(SOURCE, ROOT))
    src = json.load(open(SOURCE, encoding='utf-8'))
    have = set()
    if os.path.exists(HAVE):
        doc = json.load(open(HAVE, encoding='utf-8'))
        have = {t for t, r in doc['items'].items() if r.get('scope') == 'OV'}
    out = []
    for x in src['items']:
        sym = x['symbol']
        if sym in have:
            continue
        out.append((sym, x.get('name') or sym, x.get('assetClass') or ''))
    return out, sorted(have)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--years', type=float, default=YEARS)
    ap.add_argument('--only', default='', help='쉼표로 티커 몇 개만')
    a = ap.parse_args(argv)

    rows, have = candidates()
    if a.only:
        want = {s.strip().upper() for s in a.only.split(',') if s.strip()}
        rows = [r for r in rows if r[0].upper() in want]
    if not rows:
        raise SystemExit('받을 종목이 없습니다 (이미 가진 것: %s)' % ', '.join(have))

    sys.stderr.write('해외 ETF %d 종을 %.1f 해치 받습니다 (이미 가진 %d 종은 뺐습니다)\n'
                     % (len(rows), a.years, len(have)))

    items, failed = {}, []
    for i, (sym, name, cls) in enumerate(rows, 1):
        it = {'symbols': [sym]}
        bars, meta = F.fetch_ov(it, None, a.years)
        if not bars:
            failed.append({'symbol': sym, 'name': name, 'why': '; '.join(meta['errors'])[:200]})
            sys.stderr.write('  %2d/%d  %-5s  받지 못함 — %s\n'
                             % (i, len(rows), sym, '; '.join(meta['errors'])[:80]))
            time.sleep(SLEEP)
            continue
        ser = F.to_series(bars)
        items[sym] = {
            'scope': 'OV', 'ticker': sym, 'name': name,
            'group': '기초자산군', 'theme': ASSET_KO.get(cls, cls or '기타'),
            'asset_class': cls,
            'code': sym, 'symbol_used': meta.get('symbol_used'),
            'route': meta.get('route'),
            # 야후가 돌려준 이름·유형을 **그대로** 남긴다. 표의 이름과 어긋나면
            # 엉뚱한 종목을 받은 것이고, 그건 숫자만 보고는 알 수 없다.
            'name_source': meta.get('name_source'),
            'instrument_type': meta.get('instrument_type'),
            'currency': meta.get('currency'), 'exchange': meta.get('exchange'),
            'bars': ser, 'bars_n': len(ser['d']),
            'from': ser['d'][0], 'to': ser['d'][-1],
        }
        sys.stderr.write('  %2d/%d  %-5s  %5d봉  %s~%s  %s\n'
                         % (i, len(rows), sym, len(ser['d']), ser['d'][0], ser['d'][-1],
                            (meta.get('name_source') or '')[:44]))
        time.sleep(SLEEP)

    doc = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'source': '야후 파이낸스 (fetch_etf_prices.fetch_ov)',
        'note': ('data/proposal/overseas_etf.json 의 종목 가운데 '
                 'data/etf/prices.json 에 없는 것을 OHLCV 로 다시 받은 것입니다. '
                 '종가만 있는 봉에 시가·고가·저가를 지어 넣지 않았습니다.'),
        'years_requested': a.years,
        'already_have': have,
        'count': len(items), 'failed': failed,
        'items': items,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    # 뜻이 같으면 파일을 건드리지 않는다 — 성적표·세팅과 같은 규율이다.
    import kis_timing_data as D
    if D.write_if_changed(OUT, doc):
        sys.stderr.write('\n%s 에 적었습니다 (%d 종%s)\n'
                         % (os.path.relpath(OUT, ROOT), len(items),
                            ', 실패 %d' % len(failed) if failed else ''))
    else:
        sys.stderr.write('\n%s — 시각 말고 달라진 것이 없어 그대로 둡니다\n'
                         % os.path.relpath(OUT, ROOT))
    return 1 if (failed and not items) else 0


if __name__ == '__main__':
    sys.exit(main())
