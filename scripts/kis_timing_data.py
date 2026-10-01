# -*- coding: utf-8 -*-
"""매매 타이밍 판이 보는 네 개의 우주 — 국내주식·미국주식·국내ETF·해외ETF.

**신호와 백테스트가 같은 문으로 들어온다.** 여기 하나만 고치면 둘이 함께 바뀐다.
갈라 두면 화면이 네이버 봉으로 낸 신호를 내면서 성적표는 다른 봉으로 잰 것이
되는데, 그건 이 저장소가 `signal_backtest.bars_for` 로 이미 한 번 막아 둔 고장이다.

봉은 어디서 오는가 — 이 저장소가 이미 모아 둔 것을 쓴다. 새로 긁지 않는다.

    KR_STOCK   data/prices_naver/kr100.json          국내 시가총액 100
    US_STOCK   us100-data 가지 data/us100/bars8y/*    미국 대형주 100 (8해치)
               없으면 data/us100/chart/* (화면용 2해치)
    KR_ETF     data/etf/prices.json (scope=KR)        국내 상장 ETF
               + data/kis_timing/kr_extra.json        넓히려고 덧댄 곁 목록
    KR_OV_ETF  data/kis_timing/kr_extra.json          국내 상장 · 해외 기초자산 ETF
    OV_ETF     data/etf/prices.json (scope=OV)        해외 상장 ETF
               + data/kis_timing/ov_extra.json        넓히려고 덧댄 곁 목록

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
    # **원화로 사는 해외 노출.** 기초자산은 해외인데 국내에서 원화로 거래한다 —
    # 거래시간도 환위험도 아래 OV_ETF 와 다르므로 한 칸에 섞지 않는다.
    'KR_OV_ETF': {'label': '국내상장 해외ETF', 'kind': 'ETF', 'region': 'KR', 'currency': 'KRW'},
    'OV_ETF': {'label': '해외ETF', 'kind': 'ETF', 'region': 'US', 'currency': 'USD'},
}
MARKET_ORDER = ['KR_STOCK', 'US_STOCK', 'KR_ETF', 'KR_OV_ETF', 'OV_ETF']

NAVER_KR = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')
ETF_PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
# 해외 ETF 곁 목록 — fetch_kis_timing_ov.py 가 채운다. 없으면 없는 대로 돈다.
OV_EXTRA = os.path.join(ROOT, 'data', 'kis_timing', 'ov_extra.json')
# 국내 상장 곁 목록 — fetch_kis_timing_kr.py 가 채운다. 마찬가지로 없으면 없는 대로.
KR_EXTRA = os.path.join(ROOT, 'data', 'kis_timing', 'kr_extra.json')
US_BRANCH = 'origin/us100-data'
# **긴 판을 먼저 본다.** `chart/` 는 화면이 읽는 2해치(`range=2y`)이고, 그걸로
# 앞뒤를 나누면 검증구간이 아홉 달 반밖에 안 된다 — 미국주식만 검증구간
# 초과수익이 음수로 나와 「보류」가 붙은 까닭이 이것이다. `bars8y/` 는
# fetch_us_bars_long.py 가 주 1회 받는 백테스트 전용 긴 판이다. 없으면
# 예전처럼 `chart/` 로 돈다 — 긴 판이 아직 없는 가지에서도 깨지지 않는다.
US_PREFIX_LONG = 'data/us100/bars8y/'
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
    names = r.stdout.split()
    # `_meta.json` 은 받은 시각·해치를 적어 둔 장부지 봉이 아니다 — 섞이면
    # 종목 하나가 늘어난 것처럼 보인다.
    long_paths = sorted(p for p in names
                        if p.startswith(US_PREFIX_LONG) and p.endswith('.json')
                        and not os.path.basename(p).startswith('_'))
    paths = long_paths or sorted(p for p in names
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
    # **어느 판으로 쟀는지 산출물에 남긴다.** 2해치로 잰 성적과 8해치로 잰
    # 성적은 다른 것인데, 파일만 보고는 어느 쪽인지 알 수 없다.
    return out, ('미국 일봉: %s (%d 종)'
                 % ('백테스트용 긴 판 bars8y' if long_paths else '화면용 chart 2해치',
                    len(out)))


# ─────────────────────────────────────────────────────────────────────
# 국내 상장 ETF 의 기초자산은 국내인가 해외인가
# ─────────────────────────────────────────────────────────────────────
#
# **왜 갈라야 하는가.** 본 목록(data/etf/prices.json)의 국내 상장 55종에는
# KODEX 200 과 TIGER 미국나스닥100 이 **한 칸에 들어 있다.** 표가 그렇게 주었기
# 때문이다. 그대로 두면 「국내ETF 에서 이격도가 먹힌다」가 실은 미국 지수에서
# 먹힌 것일 수 있고, 그 말을 듣고 KODEX 200 을 사는 사람이 생긴다.
#
# 가르는 근거를 종목마다 산출물에 남긴다(exposure_basis). 여기서 내린 판단인지
# 원본이 말한 것인지가 구별되어야 나중에 고칠 자리를 찾을 수 있다.

KR_BARS = os.path.join(ROOT, 'data', 'proposal', 'kr_bars.json')

# 표의 group 으로 가르는 판단. **여기서 내린 것이다** — 원본이 말한 것이 아니다.
_GROUP_ABROAD = ('지수/지역', '글로벌테마', '자산배분')
_GROUP_HOME = ('국내주식형(신설)', '원자재')

_KR_CLS_CACHE = None


def _kr_bars_cls():
    """`data/proposal/kr_bars.json` 이 적어 둔 갈래. {코드: '국내ETF'|'해외ETF'|…}

    **원본이 말한 것**이라 아래 group 판단보다 앞선다. 그 파일이 없으면 빈 사전을
    내고, 그러면 group 쪽으로만 가른다 — 없다고 멈추지 않는다.
    """
    global _KR_CLS_CACHE
    if _KR_CLS_CACHE is None:
        out = {}
        if os.path.exists(KR_BARS):
            try:
                doc = json.load(open(KR_BARS, encoding='utf-8'))
                out = {c: (r.get('cls') or '') for c, r in (doc.get('items') or {}).items()}
            except ValueError:
                out = {}
        _KR_CLS_CACHE = out
    return _KR_CLS_CACHE


def kr_etf_market(code, group=None):
    """국내 상장 ETF 하나를 KR_ETF / KR_OV_ETF 중 한 칸에 놓는다. (시장, 근거)"""
    cls = _kr_bars_cls().get(str(code))
    if cls == '해외ETF':
        return 'KR_OV_ETF', 'kr_bars.json 이 「해외ETF」로 적었습니다'
    if cls in ('국내ETF', '국내주식'):
        return 'KR_ETF', 'kr_bars.json 이 「%s」로 적었습니다' % cls
    if group in _GROUP_ABROAD:
        return 'KR_OV_ETF', '표의 갈래가 「%s」라 해외로 보았습니다' % group
    if group in _GROUP_HOME:
        return 'KR_ETF', '표의 갈래가 「%s」라 국내로 보았습니다' % group
    return 'KR_ETF', '갈래를 몰라 국내로 두었습니다 (group=%r)' % group


def _load_etfs():
    if not os.path.exists(ETF_PRICES):
        return {}, '%s 가 없습니다' % os.path.relpath(ETF_PRICES, ROOT)
    doc = json.load(open(ETF_PRICES, encoding='utf-8'))
    items = dict(doc['items'])

    # 곁 목록을 **합친다.** 해외 ETF 우주가 스물한 종뿐이면 성적의 오차가 크다.
    # 같은 티커가 양쪽에 있으면 본 목록(data/etf/prices.json)을 남긴다 — 그쪽이
    # 표에서 온 것이고, 곁 목록은 그것을 넓히려고 덧댄 것이기 때문이다.
    note = None
    if os.path.exists(OV_EXTRA):
        try:
            extra = json.load(open(OV_EXTRA, encoding='utf-8'))
            for tk, rec in (extra.get('items') or {}).items():
                if tk not in items:
                    items[tk] = rec
        except ValueError as e:
            note = '%s 를 읽지 못했습니다: %s' % (os.path.relpath(OV_EXTRA, ROOT), e)

    # KR_STOCK 칸은 표에서 오는 것이 아니라 아래 곁 목록이 채울 수 있어 열어 둔다.
    out = {'KR_STOCK': [], 'KR_ETF': [], 'KR_OV_ETF': [], 'OV_ETF': []}
    for tk, rec in sorted(items.items()):
        b = rec.get('bars') or {}
        if not b.get('d'):
            continue
        bars = _clean([{'d': b['d'][i], 'o': b['o'][i], 'h': b['h'][i],
                        'l': b['l'][i], 'c': b['c'][i], 'v': (b['v'][i] or 0)}
                       for i in range(len(b['d']))])
        code = rec.get('code') or rec.get('symbol_used') or tk
        basis = None
        if rec.get('scope') == 'KR':
            mk, basis = kr_etf_market(code, rec.get('group'))
        else:
            mk = 'OV_ETF'
        sym = tk
        # **맨 숫자 심볼을 그대로 두지 않는다.** 도쿄·홍콩 상장분은 표의 키가
        # `2644`·`03191` 처럼 숫자뿐인데, 그러면 엑셀이 앞자리 0 을 지우고
        # (`03191` → `3191`) 국내 종목코드와도 구별되지 않는다. 받아 올 때 쓴
        # 거래소 붙은 티커(`2644.T`·`3191.HK`)가 있으면 그것을 심볼로 쓴다 —
        # 더 정확하기도 하다. 원래 키는 code 에 그대로 남는다.
        if str(sym).isdigit() and rec.get('symbol_used'):
            sym = rec['symbol_used']
        out[mk].append({'symbol': sym, 'code': code,
                        'name': rec.get('name'), 'group': rec.get('group'),
                        'theme': rec.get('theme'), 'exposure_basis': basis,
                        'bars': bars})

    # 국내 곁 목록. 해외 쪽과 달리 **자기가 어느 시장인지 스스로 적어 온다**
    # (market). 국내ETF 와 국내상장 해외ETF 는 티커 꼴이 같아 코드만 보고는
    # 가를 수 없기 때문이다 — 가르는 것은 목록의 몫이지 여기의 짐작이 아니다.
    if os.path.exists(KR_EXTRA):
        try:
            extra = json.load(open(KR_EXTRA, encoding='utf-8'))
            seen = {it['code'] for rows in out.values() for it in rows}
            for code, rec in sorted((extra.get('items') or {}).items()):
                mk = rec.get('market')
                if mk not in out or code in seen:
                    continue
                b = rec.get('bars') or {}
                if not b.get('d'):
                    continue
                bars = _clean([{'d': b['d'][i], 'o': b['o'][i], 'h': b['h'][i],
                                'l': b['l'][i], 'c': b['c'][i], 'v': (b['v'][i] or 0)}
                               for i in range(len(b['d']))])
                # **심볼에 A 를 붙인다.** 본 목록(data/etf/prices.json)의 국내
                # 상장분이 `A133690` 꼴이라 맞추는 것이기도 하지만, 까닭이 하나
                # 더 있다 — 맨 숫자 심볼은 **엑셀이 앞자리 0 을 지운다.** 화면의
                # CSV 저장이 심볼 칸을 두는 것이 바로 그 자리를 막으려는 것이고,
                # 검사기가 「심볼이 순수 숫자가 아닌가」를 본다. 곁 목록만 맨
                # 코드로 실었더니 463290·273140·329200 이 그 검사에 걸렸다.
                out[mk].append({'symbol': 'A' + code, 'code': code,
                                'name': rec.get('name'),
                                'group': None, 'theme': None,
                                'exposure_basis': '곁 목록이 「%s」로 적어 왔습니다' % mk,
                                'bars': bars})
        except ValueError as e:
            note = '%s 를 읽지 못했습니다: %s' % (os.path.relpath(KR_EXTRA, ROOT), e)
    return out, note


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
           'KR_ETF': etf.get('KR_ETF', []),
           'KR_OV_ETF': etf.get('KR_OV_ETF', []),
           'OV_ETF': etf.get('OV_ETF', [])}
    # 국내 곁 목록이 국내주식을 싣고 오면 KR_STOCK 에 합친다 (지금은 비어 있다).
    raw['KR_STOCK'] = kr + [it for it in etf.get('KR_STOCK', [])]

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
