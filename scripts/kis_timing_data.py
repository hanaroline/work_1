# -*- coding: utf-8 -*-
"""매매 타이밍 판이 보는 네 개의 우주 — 국내주식·미국주식·국내ETF·해외ETF.

**신호와 백테스트가 같은 문으로 들어온다.** 여기 하나만 고치면 둘이 함께 바뀐다.
갈라 두면 화면이 네이버 봉으로 낸 신호를 내면서 성적표는 다른 봉으로 잰 것이
되는데, 그건 이 저장소가 `signal_backtest.bars_for` 로 이미 한 번 막아 둔 고장이다.

봉은 어디서 오는가 — 이 저장소가 이미 모아 둔 것을 쓴다. 새로 긁지 않는다.

    KR_STOCK  data/prices_naver/kr100.json          국내 시가총액 100
    US_STOCK  us100-data 가지 data/us100/chart/*     미국 대형주 100
    KR_ETF    data/etf/prices.json (scope=KR)        국내 상장 ETF
    OV_ETF    data/etf/prices.json (scope=OV)        해외 상장 ETF

**왜 네 개로 나누는가.** 전략 성적을 시장마다 따로 재기 위해서다. 같은
「이격도 90 이하면 산다」가 국내주식에서 먹히고 미국 대형주에서 안 먹히는 일은
흔하다. 하나로 뭉쳐 평균을 내면 그 차이가 사라지고, 사라진 뒤에는 어느 시장에
그 전략을 써야 할지 말할 수 없게 된다.
"""

import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VOLATILE = ('generated_at_kst',)


def write_if_changed(path, doc, volatile=VOLATILE):
    """**바뀐 것이 시각뿐이면 파일을 건드리지 않는다.**

    `build_volatility.py` 의 같은 함수와 같은 까닭이다 — 봉이 그대로면 산출물도
    그대로라, 새로 써 봐야 `generated_at_kst` 한 칸만 달라진다. 게다가 줄바꿈 없는
    한 줄 JSON 이라 git 이 줄 델타를 못 만들어, 한 글자가 달라도 90~170KB 가
    통째로 새로 쌓인다.

    그러면 `generated_at_kst` 는 「이 판이 만들어진 때」라는 제 뜻을 되찾는다 —
    「마지막으로 돌린 때」는 Actions 기록이 말해 준다.

    **성적표와 세팅이 이 함수를 함께 쓴다.** 처음에는 세팅 쪽에만 넣었는데, 단추로
    돌린 백테스트가 내용이 같은데도 171KB 를 새로 쌓는 것을 실행 기록에서 보고
    이리로 옮겼다. 한쪽에만 둔 규율은 언젠가 다른 쪽에서 깨진다.
    """
    new = {k: v for k, v in doc.items() if k not in volatile}
    if os.path.exists(path):
        try:
            old = json.load(open(path, encoding='utf-8'))
            if {k: v for k, v in old.items() if k not in volatile} == new:
                return False
        except ValueError:
            pass                      # 깨진 파일이면 새로 쓴다
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
    return True

MARKETS = {
    'KR_STOCK': {'label': '국내주식', 'kind': '주식', 'region': 'KR', 'currency': 'KRW'},
    'US_STOCK': {'label': '미국주식', 'kind': '주식', 'region': 'US', 'currency': 'USD'},
    'KR_ETF': {'label': '국내ETF', 'kind': 'ETF', 'region': 'KR', 'currency': 'KRW'},
    'OV_ETF': {'label': '해외ETF', 'kind': 'ETF', 'region': 'US', 'currency': 'USD'},
}
MARKET_ORDER = ['KR_STOCK', 'US_STOCK', 'KR_ETF', 'OV_ETF']

NAVER_KR = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')
ETF_PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
US_BRANCH = 'origin/us100-data'
US_PREFIX = 'data/us100/chart/'

# 이보다 짧으면 10종을 나란히 셀 수 없다(52주 신고가가 253봉을 본다).
# 거르되 **몇 종목을 걸렀는지 세어 산출물에 적는다** — 조용히 빠지면 목록이
# 구멍 난 것을 아무도 모른다.
MIN_BARS = 260


def _clean(bars):
    """값이 빈 봉을 떨군다. 지어내지 않는다."""
    out = []
    for b in bars:
        if None in (b.get('o'), b.get('h'), b.get('l'), b.get('c')):
            continue
        if not b['c'] or b['h'] < b['l']:
            continue
        out.append(b)
    return out


def _load_kr_stocks():
    if not os.path.exists(NAVER_KR):
        return [], '%s 가 없습니다' % os.path.relpath(NAVER_KR, ROOT)
    doc = json.load(open(NAVER_KR, encoding='utf-8'))
    out = []
    for sym, s in sorted((doc.get('stocks') or {}).items()):
        bars = _clean([{'d': s['d'][i], 'o': s['o'][i], 'h': s['h'][i],
                        'l': s['l'][i], 'c': s['c'][i], 'v': (s['v'][i] or 0)}
                       for i in range(len(s['d']))])
        out.append({'symbol': sym, 'code': sym.split('.')[0], 'bars': bars})
    return out, None


def _load_us_stocks():
    r = subprocess.run(['git', '-C', ROOT, 'ls-tree', '-r', '--name-only', US_BRANCH],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return [], 'us100-data 가지를 읽지 못했습니다 (git fetch origin us100-data)'
    paths = sorted(p for p in r.stdout.split()
                   if p.startswith(US_PREFIX) and p.endswith('.json'))
    out = []
    for p in paths:
        g = subprocess.run(['git', '-C', ROOT, 'show', '%s:%s' % (US_BRANCH, p)],
                           capture_output=True, text=True)
        if g.returncode != 0:
            continue
        try:
            doc = json.loads(g.stdout)
        except ValueError:
            continue
        s = doc.get('daily') or {}
        if not s.get('d'):
            continue
        sym = doc.get('symbol') or os.path.basename(p)[:-5]
        bars = _clean([{'d': s['d'][i], 'o': s['o'][i], 'h': s['h'][i],
                        'l': s['l'][i], 'c': s['c'][i], 'v': (s['v'][i] or 0)}
                       for i in range(len(s['d']))])
        out.append({'symbol': sym, 'code': sym, 'bars': bars})
    return out, None


def _load_etfs():
    if not os.path.exists(ETF_PRICES):
        return {}, '%s 가 없습니다' % os.path.relpath(ETF_PRICES, ROOT)
    doc = json.load(open(ETF_PRICES, encoding='utf-8'))
    out = {'KR_ETF': [], 'OV_ETF': []}
    for tk, rec in sorted(doc['items'].items()):
        b = rec.get('bars') or {}
        if not b.get('d'):
            continue
        bars = _clean([{'d': b['d'][i], 'o': b['o'][i], 'h': b['h'][i],
                        'l': b['l'][i], 'c': b['c'][i], 'v': (b['v'][i] or 0)}
                       for i in range(len(b['d']))])
        mk = 'KR_ETF' if rec.get('scope') == 'KR' else 'OV_ETF'
        out[mk].append({'symbol': tk, 'code': rec.get('code') or rec.get('symbol_used') or tk,
                        'name': rec.get('name'), 'group': rec.get('group'),
                        'theme': rec.get('theme'), 'bars': bars})
    return out, None


# ─────────────────────────────────────────────────────────────────────
# 이름표 — 화면(kr-top100.html / us-top100.html)의 COMPANIES 배열을 읽어 쓴다.
# 같은 표를 여기 또 적어 두면 목록이 바뀔 때 한쪽만 고쳐져 어긋난다.
# ─────────────────────────────────────────────────────────────────────

import re

_COMPANY_ROW = re.compile(r"\['([^']+)','([^']*)','([^']*)'")


def load_names(region):
    out = {}
    page = 'kr-top100.html' if region == 'KR' else 'us-top100.html'
    p = os.path.join(ROOT, page)
    if not os.path.exists(p):
        return out
    m = re.search(r'var COMPANIES = \[(.*?)\n\];', open(p, encoding='utf-8').read(), re.S)
    if not m:
        return out
    for sym, en, ko in _COMPANY_ROW.findall(m.group(1)):
        nm = (ko or en).strip()
        if sym and nm:
            out[sym] = nm
            out[sym.split('.')[0]] = nm
    return out


def load_universe(min_bars=MIN_BARS):
    """{시장: [{symbol, name, bars}, …]}, 그리고 거른 내역.

    반환값 두 번째는 보고서에 그대로 싣는다 — **몇 종목이 왜 빠졌는지**가
    산출물에 남아야 목록의 구멍을 나중에 알아차릴 수 있다.
    """
    uni, notes, dropped = {}, [], {}

    kr, err = _load_kr_stocks()
    if err:
        notes.append(err)
    us, err = _load_us_stocks()
    if err:
        notes.append(err)
    etf, err = _load_etfs()
    if err:
        notes.append(err)

    raw = {'KR_STOCK': kr, 'US_STOCK': us,
           'KR_ETF': etf.get('KR_ETF', []), 'OV_ETF': etf.get('OV_ETF', [])}

    names = {'KR': load_names('KR'), 'US': load_names('US')}
    for mk in MARKET_ORDER:
        rows, short = [], []
        for it in raw[mk]:
            if not it.get('name'):
                reg = MARKETS[mk]['region']
                it['name'] = names[reg].get(it['symbol']) or names[reg].get(it['code']) or it['symbol']
            if len(it['bars']) < min_bars:
                short.append({'symbol': it['symbol'], 'name': it['name'],
                              'bars': len(it['bars'])})
                continue
            rows.append(it)
        uni[mk] = rows
        if short:
            dropped[mk] = short

    return uni, {'notes': notes, 'dropped': dropped, 'min_bars': min_bars}
