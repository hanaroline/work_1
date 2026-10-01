# -*- coding: utf-8 -*-
"""국내 상장 우주를 넓힌다 — 매매 타이밍 판에만 쓰는 곁 목록(국내분).

`data/kis_timing/kr_extra.json` 을 쓴다. `kis_timing_data` 가 이것을 국내 쪽
우주에 **합쳐서** 읽는다. 해외 쪽의 `fetch_kis_timing_ov.py` 와 짝이다.

## 무엇이 늘어나는가

`data/proposal/kr_bars.json` 에 국내 상장 256 종의 일봉이 이미 있다. 그 중
157 종이 매매 타이밍 우주에 없다.

    국내ETF            +57   채권·금·은행·배당 — 지금 우주(48종)에 없던 자산군
    국내상장 해외ETF   +100   미국나스닥100 · MSCI선진국 · 니케이225 · CSI300 …
    국내주식            +0    99 종이 모두 이미 있다

뒤엣것이 요점이다. **원화로 사는 해외 노출**은 지금 우주 어디에도 없다.
해외ETF(OV_ETF)는 달러로 사는 미국 상장분이라 환위험도 거래시간도 다르다.

## 왜 그 파일을 그대로 쓰지 않는가

`kr_bars.json` 은 **종가뿐**이다(`d`, `c`). 전략 10종 가운데 셋은 시가·고가·저가가
있어야 셈한다 — 강한 종가(IBS), 52주 신고가, 돌파 실패. 종가만 있는 봉에 나머지를
지어 넣으면 IBS 가 늘 0.5 가 되어 「강한 종가」가 영영 켜지지 않는다. 그건 오류가
아니라 **조용한 거짓**이다. 해외ETF 때 이미 한 번 내린 결정을 그대로 따른다.

그래서 **종목 목록만 그 파일에서 얻고, 봉은 네이버에서 OHLCV 로 다시 받는다.**
목록을 여기 또 적어 두면 한쪽만 고쳐져 어긋나므로 적지 않는다.

## 받아 온 것이 정말 그 종목인가

네이버가 답했다고 받아들이지 않는다. `fetch_etf_prices.fetch_kr` 이 종목명을
함께 받아 오므로, 그것을 `kr_bars.json` 의 이름과 맞대어 `name_match` 로 남긴다.
어긋난 것을 여기서 버리지는 않는다 — **버리는 것과 알리는 것은 다른 일이고**,
워크플로가 그 수를 보고 커밋을 멈출 수 있어야 하기 때문이다.
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

SOURCE = os.path.join(ROOT, 'data', 'proposal', 'kr_bars.json')
HAVE_STOCK = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')
HAVE_ETF = os.path.join(ROOT, 'data', 'etf', 'prices.json')
OUT = os.path.join(ROOT, 'data', 'kis_timing', 'kr_extra.json')

YEARS = 8.0
SLEEP = 0.45

# kr_bars 의 cls → 매매 타이밍의 시장. 국내주식은 이미 다 있어 실제로는 비지만,
# 목록이 늘어날 때를 위해 길을 열어 둔다.
BUCKET = {'국내ETF': 'KR_ETF', '해외ETF': 'KR_OV_ETF', '국내주식': 'KR_STOCK'}


def have_codes():
    """이미 매매 타이밍 우주에 있는 국내 종목코드."""
    out = set()
    if os.path.exists(HAVE_STOCK):
        doc = json.load(open(HAVE_STOCK, encoding='utf-8'))
        out |= {s.split('.')[0] for s in (doc.get('stocks') or {})}
    if os.path.exists(HAVE_ETF):
        doc = json.load(open(HAVE_ETF, encoding='utf-8'))
        for tk, r in (doc.get('items') or {}).items():
            if r.get('scope') == 'KR':
                out.add(str(r.get('code') or tk).split('.')[0])
    return out


def candidates():
    """(코드, 이름, 시장). 이미 가진 것과 모르는 갈래는 뺀다."""
    if not os.path.exists(SOURCE):
        raise SystemExit('%s 가 없습니다' % os.path.relpath(SOURCE, ROOT))
    src = json.load(open(SOURCE, encoding='utf-8'))
    have = have_codes()
    out, skipped = [], {'이미 있음': 0, '모르는 갈래': 0}
    for code, rec in sorted((src.get('items') or {}).items()):
        if code in have:
            skipped['이미 있음'] += 1
            continue
        mk = BUCKET.get(rec.get('cls'))
        if not mk:
            skipped['모르는 갈래'] += 1
            continue
        out.append((code, rec.get('name') or code, mk))
    return out, skipped, sorted(have)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--years', type=float, default=YEARS)
    ap.add_argument('--limit', type=int, default=0, help='앞에서 몇 종만 (연습용)')
    ap.add_argument('--only', default='', help='쉼표로 종목코드 몇 개만')
    a = ap.parse_args(argv)

    rows, skipped, have = candidates()
    if a.only:
        want = {s.strip() for s in a.only.split(',') if s.strip()}
        rows = [r for r in rows if r[0] in want]
    if a.limit:
        rows = rows[:a.limit]
    if not rows:
        raise SystemExit('받을 종목이 없습니다 (이미 가진 국내 종목 %d 개)' % len(have))

    per = {}
    for _, _, mk in rows:
        per[mk] = per.get(mk, 0) + 1
    sys.stderr.write('국내 상장 %d 종을 %.1f 해치 받습니다 — %s\n'
                     % (len(rows), a.years,
                        ' · '.join('%s %d' % (k, v) for k, v in sorted(per.items()))))
    sys.stderr.write('건너뛴 것: %s\n'
                     % ' · '.join('%s %d' % (k, v) for k, v in skipped.items() if v))

    today = datetime.now(KST)
    span = ((today - timedelta(days=int(a.years * 372))).strftime('%Y%m%d'),
            today.strftime('%Y%m%d'))

    items, failed, mismatched = {}, [], []
    for i, (code, name, mk) in enumerate(rows, 1):
        bars, meta = F.fetch_kr({'code': code}, span)
        if not bars:
            failed.append({'code': code, 'name': name, 'market': mk,
                           'why': '; '.join(meta['errors'])[:200] or '빈 응답'})
            sys.stderr.write('  %3d/%d  %s %-24s  받지 못함\n' % (i, len(rows), code, name[:24]))
            time.sleep(SLEEP)
            continue
        ser = F.to_series(bars)
        got = meta.get('name_source')
        # 이름은 띄어쓰기와 브랜드 표기가 갈려 글자 그대로 같기를 바랄 수 없다.
        # 공백을 뺀 뒤 한쪽이 다른 쪽을 품는지만 본다. 못 받았으면 None 으로 둔다.
        match = None
        if got:
            a_, b_ = got.replace(' ', ''), name.replace(' ', '')
            match = (a_ in b_) or (b_ in a_)
            if not match:
                mismatched.append({'code': code, 'want': name, 'got': got})
        items[code] = {
            'market': mk, 'code': code, 'name': name,
            'name_source': got, 'name_match': match,
            'route': meta.get('route'), 'currency': meta.get('currency'),
            'bars': ser, 'bars_n': len(ser['d']),
            'from': ser['d'][0], 'to': ser['d'][-1],
        }
        sys.stderr.write('  %3d/%d  %s %-24s %5d봉  %s~%s  %s\n'
                         % (i, len(rows), code, name[:24], len(ser['d']),
                            ser['d'][0], ser['d'][-1],
                            '' if match is not False else '← 이름 어긋남: %s' % got))
        time.sleep(SLEEP)

    doc = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'source': '네이버 금융 일봉 (fetch_etf_prices.fetch_kr → fetch_kr_prices_naver)',
        'note': ('data/proposal/kr_bars.json 의 국내 상장 종목 가운데 매매 타이밍 '
                 '우주에 없던 것을 OHLCV 로 다시 받은 것입니다. 그 파일은 종가뿐이라 '
                 '시가·고가·저가를 지어 넣지 않고 다시 받았습니다.'),
        'years_requested': a.years,
        'count': len(items),
        'per_market': {mk: sum(1 for v in items.values() if v['market'] == mk)
                       for mk in sorted({v['market'] for v in items.values()})},
        'failed': failed,
        'name_mismatched': mismatched,
        'items': items,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    import kis_timing_data as D
    if D.write_if_changed(OUT, doc):
        sys.stderr.write('\n%s 에 적었습니다 (%d 종%s%s)\n'
                         % (os.path.relpath(OUT, ROOT), len(items),
                            ', 실패 %d' % len(failed) if failed else '',
                            ', 이름 어긋남 %d' % len(mismatched) if mismatched else ''))
    else:
        sys.stderr.write('\n%s — 시각 말고 달라진 것이 없어 그대로 둡니다\n'
                         % os.path.relpath(OUT, ROOT))
    return 1 if (failed and not items) else 0


if __name__ == '__main__':
    sys.exit(main())
