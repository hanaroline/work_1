#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 속보기 — 수집한 자료를 정리해 **한 파일 HTML** 로 굽는다.

  python3 scripts/build_etf_holdings.py        → etf-holdings.html

받은 사람이 두 번 눌러 열면 인터넷 없이 그대로 돌아야 한다(사내망). 그래서 자료·
글꼴 설정·스크립트를 전부 이 한 파일에 넣고, 바깥 주소는 하나도 부르지 않는다.
check_etf_holdings.py 가 그것을 확인한다.

여기서 **판정**하는 것이 셋이다. 셋 다 원천이 준 값만 보고, 판정 까닭을 레코드에 남긴다.

  규모 기준(ab) — 'fund' 펀드 전체(다른 클래스·다른 상장 합산) 값 → 순위에서 뺀다
                  'etf'  그런 증거가 없음
      증거는 **한 푼도 안 틀리고 같은 순자산** 하나뿐이다.
      · 미국 ETF 의 순자산이 어느 뮤추얼펀드 클래스의 순자산과 똑같으면(VTI ↔ VTSAX)
        그 값은 펀드 전체의 것이다 — 뱅가드처럼 ETF 가 한 펀드의 한 종류일 때.
      · 서로 다른 거래소의 상장이 똑같은 순자산을 가지면 교차 상장이다. 미국 상장이
        하나 있으면 그것을 본래 것으로 두고 나머지를 'fund'(3455.HK·587A.T ↔ QQQ).
      처음에는 순자산 ÷ (발행 좌수 × 가격)으로 갈랐는데 **틀렸다** — 야후의 좌수가 낡아
      iShares(IJH 6.7배, IVV 1.85배)까지 걸렸다. 그래서 비율은 버렸다.
  거래 정지(st) — 국내는 네이버 tradeStopType, 해외는 마지막 체결이 STALE_DAYS 넘게
                  지났는가(원천이 정지 여부를 따로 주지 않는다 — 화면에 그렇게 적는다).
  레버리지·인버스(lv) — 야후 분류 'Trading--Leveraged/Inverse', 네이버 파생 탭, 이름.
"""

import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import etf_themes as T
import fetch_etf_holdings as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'etf_holdings')
TEMPLATE = os.path.join(ROOT, 'tools', 'etf-holdings', 'page.html')
OUT = os.path.join(ROOT, 'etf-holdings.html')
MARKETS = ['KR', 'US', 'HK', 'JP', 'CN']
STALE_DAYS = F.STALE_DAYS
KST = timezone(timedelta(hours=9))

# 한글로 쳐도 외국 종목이 잡히게 하는 별칭. **검색 편의용일 뿐 숫자와는 상관없다.**
# 열쇠는 야후 보유 종목 심볼에서 만든 것(시장:코드)과 같은 꼴이다.
KO_ALIAS = {
    'US:NVDA': '엔비디아', 'US:AAPL': '애플', 'US:MSFT': '마이크로소프트', 'US:AMZN': '아마존',
    'US:GOOGL': '알파벳 A (구글)', 'US:GOOG': '알파벳 C (구글)', 'US:META': '메타', 'US:TSLA': '테슬라',
    'US:AVGO': '브로드컴', 'US:TSM': 'TSMC (ADR)', 'TW:2330': 'TSMC', 'US:BRK-B': '버크셔 해서웨이 B',
    'US:LLY': '일라이 릴리', 'US:JPM': 'JP모건', 'US:V': '비자', 'US:MA': '마스터카드', 'US:NFLX': '넷플릭스',
    'US:AMD': 'AMD', 'US:MU': '마이크론', 'US:PLTR': '팔란티어', 'US:COST': '코스트코', 'US:WMT': '월마트',
    'US:XOM': '엑슨모빌', 'US:JNJ': '존슨앤드존슨', 'US:UNH': '유나이티드헬스', 'US:ORCL': '오라클',
    'US:INTC': '인텔', 'US:QCOM': '퀄컴', 'US:ASML': 'ASML (ADR)', 'AS:ASML': 'ASML', 'US:PG': 'P&G',
    'US:HD': '홈디포', 'US:KO': '코카콜라', 'US:PEP': '펩시코', 'US:ABBV': '애브비', 'US:CRM': '세일즈포스',
    'US:ADBE': '어도비', 'US:CSCO': '시스코', 'US:IBM': 'IBM', 'US:TXN': '텍사스 인스트루먼트',
    'US:LRCX': '램리서치', 'US:AMAT': '어플라이드 머티어리얼즈', 'US:KLAC': 'KLA', 'US:ARM': 'ARM',
    'US:BAC': '뱅크오브아메리카', 'US:GS': '골드만삭스', 'US:O': '리얼티 인컴', 'US:PFE': '화이자',
    'HK:0700': '텐센트', 'HK:9988': '알리바바', 'HK:1810': '샤오미', 'HK:3690': '메이퇀', 'HK:1211': 'BYD',
    'HK:9618': 'JD닷컴', 'HK:1299': 'AIA', 'L:HSBA': 'HSBC', 'HK:0005': 'HSBC (홍콩)',
    'JP:7203': '도요타', 'JP:6758': '소니', 'JP:8035': '도쿄일렉트론', 'JP:6857': '어드반테스트',
    'JP:9983': '패스트리테일링 (유니클로)', 'JP:8306': '미쓰비시UFJ', 'JP:9984': '소프트뱅크그룹',
    'JP:6861': '키엔스', 'JP:6501': '히타치',
}


def load(name):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def market_day(s):
    """'2026-09-29T14:37:19+09:00' 또는 '2026-09-29' → date."""
    if not s:
        return None
    try:
        return date.fromisoformat(s[:10])
    except ValueError:
        return None


class Holdings:
    """보유 종목 사전. 같은 종목이 여러 원천에서 여러 이름으로 들어오므로 열쇠 하나에
    한글·영문 이름을 모은다. 이름만 있는 것('N:')은 **하나로만 맞을 때** 코드 열쇠로 옮긴다."""

    def __init__(self):
        self.idx, self.rows = {}, []
        self.by_norm = {}          # norm_name → set(keys)

    def note(self, key, name, lang):
        if key.startswith('N:'):
            return
        nn = F.norm_name(name)
        if nn:
            self.by_norm.setdefault(nn, set()).add(key)

    def resolve(self, key, name):
        if key.startswith('N:'):
            ks = self.by_norm.get(F.norm_name(name)) or set()
            if len(ks) == 1:
                return next(iter(ks))
        return key

    def add(self, key, name, lang):
        if key not in self.idx:
            self.idx[key] = len(self.rows)
            self.rows.append([key, None, None])
        row = self.rows[self.idx[key]]
        slot = 1 if lang == 'ko' else 2
        if name and not row[slot]:
            row[slot] = name
        return self.idx[key]


def main():
    fx = (load('fx.json') or {}).get('rates') or {}
    krw = {'KRW': 1.0}
    for c, v in fx.items():
        if v.get('krw'):
            krw[c] = v['krw']
    raws = {m: load('raw_%s.json' % m) for m in MARKETS}
    mf_by_aum = {}
    for f in (load('raw_MF.json') or {}).get('funds', []):
        if f.get('aum'):
            mf_by_aum.setdefault(f['aum'], []).append(f['symbol'])
    if not any(raws.values()):
        print('자료가 없다 — data/etf_holdings/raw_*.json 부터 받을 것', file=sys.stderr)
        return 1

    H = Holdings()
    # 먼저 이름 → 코드 열쇠 사전을 채운다 (야후 쪽 보유 종목 이름)
    for m, raw in raws.items():
        for r in (raw or {}).get('etfs', []):
            for h in r.get('hold') or []:
                H.note(h['k'], h['n'], 'en' if r['m'] != 'KR' else 'ko')

    etfs = []
    for m in MARKETS:
        raw = raws.get(m)
        if not raw:
            continue
        coll_day = market_day(raw.get('at'))
        for r in raw['etfs']:
            e = {'k': m + ':' + r['code'], 'm': m, 'c': r['code'], 'n': r.get('name'),
                 'ne': r.get('name_en') if m == 'KR' else None,
                 'is': r.get('issuer') or None, 'ix': r.get('index') or None,
                 'cat': r.get('category') or None, 'ccy': r.get('ccy'),
                 'fee': r.get('fee'), 'err': r.get('err') or None}
            # ── 규모
            aum = r.get('aum')
            e['aum'] = aum
            e['aumK'] = round(aum * krw[e['ccy']]) if aum is not None and krw.get(e['ccy']) else None
            if m == 'KR':
                e['ab'], e['abw'] = ('etf', 'naver 순자산총액') if aum is not None else (None, None)
            elif aum is None:
                e['ab'], e['abw'] = None, None
            elif aum in mf_by_aum:
                e['ab'] = 'fund'
                e['abw'] = '순자산 %s 이(가) 뮤추얼펀드 %s 와 똑같음 — 한 펀드의 전체 값' % (
                    '{:,.0f}'.format(aum), ', '.join(mf_by_aum[aum][:3]))
            else:
                e['ab'], e['abw'] = 'etf', None
            # ── 레버리지·인버스
            lv, why = F.leverage_flag(' '.join(x for x in (r.get('name'), r.get('name_en')) if x),
                                      r.get('category'), r.get('tab'))
            e['lv'], e['lvw'] = lv, why
            # ── 거래 정지
            if m == 'KR':
                ts = r.get('trade_stop')
                if ts is None:
                    e['st'], e['stw'] = None, '정지 여부를 받지 못함'
                elif ts != 'TRADING':
                    e['st'], e['stw'] = 1, 'naver: %s' % (r.get('trade_stop_text') or ts)
                else:
                    e['st'] = 0
            else:
                td = market_day(r.get('traded_at'))
                if td is None:
                    e['st'], e['stw'] = None, '마지막 체결일을 받지 못함'
                elif coll_day and (coll_day - td).days > STALE_DAYS:
                    e['st'], e['stw'] = 1, '마지막 체결 %s — %d일 넘게 거래 없음' % (td.isoformat(), STALE_DAYS)
                else:
                    e['st'] = 0
                e['td'] = r.get('traded_at')
            # ── 수익률
            ret = r.get('ret') or {}
            e['r'] = [ret.get(p) for p in F.PERIODS]
            e['ra'] = r.get('ret_at')
            e['rs'] = (r.get('src') or {}).get('ret')
            e['alt'] = None           # 다른 원천으로 메운 값이 생기면 {'field': 'src'} — 지금은 없다
            # ── 구성
            hs = r.get('h_status') or 'none'
            if m == 'CN':
                hs = 'cn'
            e['hs'] = hs
            hl = []
            for h in r.get('hold') or []:
                key = H.resolve(h['k'], h['n'])
                i = H.add(key, h['n'], 'ko' if m == 'KR' and key.startswith('KR:') else 'en')
                hl.append([i, h.get('w')])
            e['h'] = hl
            ws = [w for _, w in hl if w is not None]
            e['hsum'] = round(sum(ws), 2) if ws else None
            e['hsrc'] = (r.get('src') or {}).get('hold')
            e['hat'] = raw.get('at')
            # ── 테마 (이름만 보고)
            th = T.themes_for(e['n'], e['ne'])
            e['th'] = th
            etfs.append(e)

    # ── 같은 순자산을 나눠 가진 상장들 → 펀드 전체 값
    by_aum = {}
    for e in etfs:
        if e['m'] != 'KR' and e['aum']:
            by_aum.setdefault(e['aum'], []).append(e)
    shared = 0
    for v, grp in by_aum.items():
        if len(grp) < 2:
            continue
        home = [e for e in grp if e['m'] == 'US']
        home = home if len(home) == 1 else []
        for e in grp:
            if e in home:
                continue
            others = ', '.join(x['c'] for x in grp if x is not e)
            if home:
                e['ab'] = 'fund'
                e['abw'] = '순자산 %s 이(가) %s 와 똑같음 — 그 펀드 전체 값(교차 상장)' % ('{:,.0f}'.format(v), home[0]['c'])
            else:
                e['ab'] = 'fund'
                e['abw'] = '순자산이 %s 와 똑같음 — 여러 상장이 함께 쓰는 펀드 전체 값' % others
            shared += 1

    for row in H.rows:
        if row[0] in KO_ALIAS and not row[1]:
            row[1] = KO_ALIAS[row[0]]
            row.append(1)           # 한글 이름이 별칭이라는 표시

    kr_raw = raws.get('KR') or {}
    ver = kr_raw.get('verify') or []
    diffs = [abs(v) for row in ver for v in (row.get('diff') or {}).values() if v is not None]
    meta = {
        'built': datetime.now(KST).strftime('%Y-%m-%d %H:%M KST'),
        'periods': F.PERIODS,
        'fx': fx, 'stale_days': STALE_DAYS,
        'markets': {m: {'at': (raws[m] or {}).get('at'), 'n': len((raws[m] or {}).get('etfs', [])),
                        'n_list': (raws[m] or {}).get('n_list'),
                        'screener_total': (raws[m] or {}).get('screener_total'),
                        'dropped_counters': len((raws[m] or {}).get('dropped_counters') or [])}
                    for m in MARKETS if raws.get(m)},
        'verify_kr': {'n': len(ver), 'max_abs_diff': max(diffs) if diffs else None,
                      'within_0_1': sum(1 for d in diffs if d <= 0.1), 'cells': len(diffs),
                      'rows': [{'code': x.get('code'), 'name': x.get('name'), 'naver': x.get('naver'),
                                'mine': x.get('mine'), 'diff': x.get('diff')} for x in ver]},
        'shared_aum': shared,
        'n_fund': sum(1 for e in etfs if e.get('ab') == 'fund'),
        'themes': T.theme_table(),
    }
    data = {'meta': meta, 'H': H.rows, 'E': etfs}
    blob = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    blob = blob.replace('</', '<\\/')           # 스크립트 태그 안에서 끊기지 않게
    with open(TEMPLATE, encoding='utf-8') as f:
        page = f.read()
    marker = '/*__ETF_DATA__*/null'
    if page.count(marker) != 1:
        print('틀에 자료 자리가 하나가 아니다', file=sys.stderr)
        return 1
    page = page.replace(marker, blob)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(page)
    print('%s — ETF %d · 보유 종목 %d · %.1f MB' % (OUT, len(etfs), len(H.rows), os.path.getsize(OUT) / 1e6))
    return 0


if __name__ == '__main__':
    sys.exit(main())
