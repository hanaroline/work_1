#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 속보기 자료 수집 — 한국·미국·홍콩·일본·중국 상장 ETF 의 상위 10종목과 비중,
규모, 분배금 포함 수익률.

러너에서 돈다. 클로드 세션은 이그레스 정책으로 네이버·야후에 못 붙는다.

어느 원천에서 무엇을 받는가 (2026-09-29 탐색으로 정함 — tools/etf-holdings-discovery/)
──────────────────────────────────────────────────────────────────────
  한국  목록            네이버 etfItemList
        구성·운용사·지수·순자산·수익률   네이버 etfAnalysis
        거래 정지 여부   네이버 basic 의 tradeStopType
        영문 이름        야후 스크리너 (이름만 — 숫자는 받지 않는다)
  미국·홍콩·일본  목록·순자산   야후 스크리너 (quoteType ETF)
        구성·운용사·분류  야후 quoteSummary (topHoldings · fundProfile)
        수익률           야후 일봉의 배당 보정 종가(adjclose)로 직접 셈
  중국 본토  목록        야후 v7 quote 로 ETF 코드 범위를 훑는다(스크리너는 본토 ETF 를
                         EQUITY 로 두고 시총이 없어 걸러 주지 못한다)
        구성            **없음** — 주는 원천이 없다. 같은 지수의 홍콩·미국 상장을 안내한다.
        수익률           야후 일봉 adjclose

수익률은 한 가지다 — 분배금 포함 총수익
──────────────────────────────────────────────────────────────────────
네이버 etfAnalysis 의 기간 수익률은 **분배금을 반영한 수정 종가 기준**이다. 짐작이
아니라 쟀다(scripts/probe_etf_tr.py → tr_test.json). 분배가 큰 커버드콜 여덟 종목에서
네이버 1년 값이 야후 배당 보정 종가의 1년 값과 0.1~0.4%p 안에서 맞았고, 날것의 가격
수익률과는 최대 46%p 벌어졌다(498400: 네이버 109.5 · 야후 보정 109.6 · 날가격 76.5).

해외는 야후 adjclose 로 **네이버와 같은 약속**으로 셈한다 — 1일·1주·1·3·6개월·연초·1년은
누적, 3·5·10년은 연환산. 그 약속이 네이버와 정말 같은지는 국내 표본 몇 종목을 네이버
일봉으로 직접 셈해 네이버 값과 맞대 본다(`verify_kr`). 어긋나면 report.md 에 남는다.

**모르면 비운다.** 원천이 안 준 값은 None 이다. 다른 원천에서 메운 값은 `alt` 에 출처를
적고 화면이 순위에서 뺀다. 이 수집기는 지금 **메우지 않는다** — 메울 곳을 정한 적이
없어서다.

  python3 scripts/fetch_etf_holdings.py                  # 전부
  python3 scripts/fetch_etf_holdings.py --markets KR --limit 20
"""

import argparse
import calendar
import concurrent.futures as cf
import http.cookiejar
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'data', 'etf_holdings')
KST = timezone(timedelta(hours=9))
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')
TIMEOUT = 30
PERIODS = ['1d', '1w', '1m', '3m', '6m', 'ytd', '1y', '3y', '5y', '10y']
NAVER_CODE = {'D1': '1d', 'W1': '1w', 'M1': '1m', 'M3': '3m', 'M6': '6m', 'YTD': 'ytd',
              'Y1': '1y', 'Y3': '3y', 'Y5': '5y', 'Y10': '10y'}
ANNUALIZED = {'3y', '5y', '10y'}
STALE_DAYS = 10      # 해외: 마지막 체결이 이보다 오래면 「최근 거래 없음」


def now_kst():
    return datetime.now(KST)


# ─────────────────────────────────────────────────────────────────────
# HTTP
# ─────────────────────────────────────────────────────────────────────

_CJ = http.cookiejar.CookieJar()
_OP = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_CJ))
CRUMB = None
_crumb_lock = threading.Lock()
STATS = {'req': 0, 'fail': 0, '429': 0}


def _req(url, data=None, headers=None, retry=4):
    h = {'User-Agent': UA, 'Accept': 'application/json,text/plain,*/*',
         'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'}
    if 'naver' in url:
        h['Referer'] = 'https://m.stock.naver.com/'
    h.update(headers or {})
    last = None
    for attempt in range(retry):
        if attempt:
            time.sleep(1.5 * (2 ** (attempt - 1)))
        STATS['req'] += 1
        try:
            with _OP.open(urllib.request.Request(url, data=data, headers=h), timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = 'HTTP %s' % e.code
            if e.code == 429:
                STATS['429'] += 1
                time.sleep(5 * (attempt + 1))
                continue
            if e.code in (400, 401, 403, 404, 409):
                break
        except Exception as e:                              # noqa: BLE001 — 원천 장애는 삼키고 기록
            last = str(e)
    STATS['fail'] += 1
    raise RuntimeError(last or 'unknown')


def get_json(url, **kw):
    return json.loads(_req(url, **kw).decode('utf-8', 'replace'))


def init_crumb():
    global CRUMB
    with _crumb_lock:
        for attempt in range(4):
            _CJ.clear()
            for u in ('https://fc.yahoo.com/', 'https://finance.yahoo.com/quote/SPY/'):
                try:
                    _req(u, retry=1)
                except Exception:                           # noqa: BLE001 — 쿠키만 필요
                    pass
            for host in ('query2', 'query1'):
                try:
                    v = _req('https://%s.finance.yahoo.com/v1/test/getcrumb' % host, retry=1)
                    v = v.decode().strip()
                    if v and len(v) < 40 and '<' not in v:
                        CRUMB = v
                        return v
                except Exception:                           # noqa: BLE001
                    pass
            time.sleep(3 * (attempt + 1))
    CRUMB = None
    return None


def yq(path):
    """야후 — crumb 을 붙이고, 401 이면 crumb 을 다시 받아 한 번 더."""
    for attempt in range(2):
        sep = '&' if '?' in path else '?'
        url = 'https://query2.finance.yahoo.com' + path + (sep + 'crumb=' + urllib.parse.quote(CRUMB) if CRUMB else '')
        try:
            return get_json(url)
        except RuntimeError as e:
            if '401' in str(e) and attempt == 0:
                init_crumb()
                continue
            raise


def y_screener(payload):
    url = ('https://query2.finance.yahoo.com/v1/finance/screener?crumb=' + urllib.parse.quote(CRUMB or '')
           + '&lang=en-US&region=US&formatted=false')
    return json.loads(_req(url, data=json.dumps(payload).encode(),
                           headers={'Content-Type': 'application/json'}).decode('utf-8', 'replace'))


# ─────────────────────────────────────────────────────────────────────
# 파서 — 네트워크 없이 시험할 수 있게 떼어 둔다 (check_etf_holdings.py 가 부른다)
# ─────────────────────────────────────────────────────────────────────

def num(x):
    if isinstance(x, dict):
        x = x.get('raw')
    if x is None or isinstance(x, bool):
        return None
    if isinstance(x, (int, float)):
        return float(x) if x == x else None
    s = str(x).replace(',', '').replace('%', '').replace('+', '').strip()
    if s in ('', '-', 'N/A', 'null', 'None'):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def parse_korean_amount(s):
    """'24조 9,450억' → 24_945_000_000_000 (원). 못 읽으면 None — 지어내지 않는다."""
    if s is None:
        return None
    s = str(s).replace(',', '').replace(' ', '')
    if not s or s == '-':
        return None
    m = re.fullmatch(r'(?:(\d+(?:\.\d+)?)조)?(?:(\d+(?:\.\d+)?)억)?(?:(\d+(?:\.\d+)?)만)?(\d+)?원?', s)
    if not m or not any(m.groups()):
        return None
    jo, eok, man, rest = (float(g) if g else 0.0 for g in m.groups())
    return jo * 1e12 + eok * 1e8 + man * 1e4 + rest


def norm_name(s):
    """외국 종목 이름을 맞대기 위한 열쇠. 'NVIDIA CORP' 와 'NVIDIA Corp' 를 같게."""
    s = (s or '').upper()
    s = re.sub(r'[^A-Z0-9가-힣 ]', ' ', s.replace('&', ' AND '))
    drop = {'INC', 'CORP', 'CORPORATION', 'CO', 'LTD', 'LIMITED', 'PLC', 'SA', 'AG', 'NV', 'SE',
            'HOLDINGS', 'HOLDING', 'GROUP', 'THE', 'ORD', 'ORDINARY', 'SHARES', 'SHS', 'CLASS',
            'CL', 'COMPANY', 'ADR', 'SPON', 'SPONSORED', 'REG', 'COM', 'NEW'}
    parts = [p for p in s.split() if p not in drop]
    while parts and len(parts[-1]) == 1 and parts[-1] in 'ABCH':      # 'CLASS A' 의 A
        parts.pop()
    return ' '.join(parts)


def holding_key_from_yahoo(sym, name):
    """야후 보유 종목 심볼 → 시장:코드. 심볼이 없으면 이름 열쇠."""
    s = (sym or '').strip().upper()
    if not s:
        return 'N:' + norm_name(name)
    m = re.fullmatch(r'(\d{6})\.(KS|KQ)', s)
    if m:
        return 'KR:' + m.group(1)
    if re.fullmatch(r'\d{1,5}\.HK|\d{5}', s):        # 야후가 '00939' 처럼 접미사 없이 주기도 한다
        return 'HK:' + re.match(r'\d+', s).group(0).lstrip('0').zfill(4)
    m = re.fullmatch(r'(\d{4}|\d{3}[A-Z])\.T', s)
    if m:
        return 'JP:' + m.group(1)
    m = re.fullmatch(r'(\d{6})\.(SS|SZ)', s)
    if m:
        return 'CN:' + m.group(1)
    m = re.fullmatch(r'([A-Z0-9.\-]+)\.([A-Z]{1,3})', s)
    if m and m.group(2) not in ('A', 'B', 'C'):
        return m.group(2) + ':' + m.group(1)
    return 'US:' + s.replace('.', '-')


def parse_naver_analysis(doc):
    """네이버 etfAnalysis 한 벌 → 정리된 dict. 원천이 준 것만 옮긴다."""
    out = {'name': doc.get('itemName'), 'issuer': doc.get('issuerName'),
           'index': doc.get('etfBaseIndex'), 'listed': doc.get('listedDate'),
           'aum': parse_korean_amount(doc.get('totalNav')), 'aum_raw': doc.get('totalNav'),
           'mcap': num(doc.get('marketValueRaw')), 'fee': num(doc.get('totalFee')),
           'theme_naver': (doc.get('themeReturns') or {}).get('themeMiddleCodeDesc')}
    ret = {p: None for p in PERIODS}
    for it in doc.get('returnPerformanceList') or []:
        p = NAVER_CODE.get(it.get('periodTypeCode'))
        if p:
            ret[p] = num(it.get('value'))
    out['ret'] = ret
    ref = (doc.get('returnPerformanceReferenceDate') or '').replace('.', '-')
    out['ret_at'] = ref or None
    hold, weights_given = [], 0
    for it in doc.get('etfTop10MajorConstituentAssets') or []:
        w = num(it.get('etfWeight'))
        if w is not None:
            weights_given += 1
        code = (it.get('itemCode') or '').strip()
        nm = (it.get('itemName') or '').strip()
        key = ('KR:' + code) if re.fullmatch(r'[0-9A-Z]{6}', code) else ('N:' + norm_name(nm))
        hold.append({'k': key, 'n': nm, 'w': w})
    if not hold:
        out['h_status'] = 'none'
    elif weights_given == 0:
        out['h_status'] = 'noweight'     # 이름은 주되 비중은 '-' — 순서도 비중 순이 아니다
    else:
        out['h_status'] = 'ok'
    out['hold'] = hold
    return out


def parse_naver_basic(doc):
    ts = doc.get('tradeStopType') or {}
    return {'trade_stop': ts.get('name'), 'trade_stop_text': ts.get('text'),
            'tradable': doc.get('tradableStatus'), 'traded_at': doc.get('localTradedAt'),
            'exchange': doc.get('stockExchangeName')}


def parse_yahoo_summary(doc):
    r = ((doc.get('quoteSummary') or {}).get('result') or [None])[0] or {}
    th = r.get('topHoldings') or {}
    fp = r.get('fundProfile') or {}
    pr = r.get('price') or {}
    hold = []
    for it in th.get('holdings') or []:
        w = num(it.get('holdingPercent'))
        hold.append({'k': holding_key_from_yahoo(it.get('symbol'), it.get('holdingName')),
                     'n': (it.get('holdingName') or '').strip(), 's': it.get('symbol'),
                     'w': None if w is None else round(w * 100, 4)})
    return {'family': fp.get('family'), 'category': fp.get('categoryName'),
            'legal': fp.get('legalType'), 'hold': hold,
            'h_status': 'ok' if hold and any(h['w'] is not None for h in hold) else ('noweight' if hold else 'none'),
            'long_name': pr.get('longName'), 'quote_type': (r.get('quoteType') or {}).get('quoteType')}


def parse_yahoo_chart(doc):
    """야후 일봉 → [(날짜, 배당보정종가)] (현지 거래일 기준). 없으면 []."""
    try:
        r = doc['chart']['result'][0]
    except (KeyError, IndexError, TypeError):
        return [], None
    ts = r.get('timestamp') or []
    off = ((r.get('meta') or {}).get('gmtoffset')) or 0
    adj = (((r.get('indicators') or {}).get('adjclose') or [{}])[0] or {}).get('adjclose') or []
    out = []
    for t, a in zip(ts, adj):
        if a is None or a <= 0:
            continue
        d = datetime.fromtimestamp(t + off, timezone.utc).strftime('%Y-%m-%d')
        if out and out[-1][0] == d:
            out[-1] = (d, a)
        else:
            out.append((d, a))
    return out, r.get('meta') or {}


def _minus_months(d, n):
    y, m = d.year, d.month - n
    while m <= 0:
        m += 12
        y -= 1
    return date(y, m, min(d.day, calendar.monthrange(y, m)[1]))


def returns_from_series(series, gap_days=10):
    """[(YYYY-MM-DD, 값)] → 기간별 수익률(%). 네이버와 같은 약속.

    기준일 = 마지막 날. 기간 시작 = 목표일 당일 또는 그 앞의 가장 가까운 거래일.
    목표일보다 앞선 자료가 없으면(상장이 늦으면) None. 목표일 앞 거래일이
    `gap_days` 넘게 떨어져 있으면 자료가 빠진 것이라 None — 메우지 않는다.
    3·5·10년은 연환산.
    """
    out = {p: None for p in PERIODS}
    if len(series) < 2:
        return out, None
    days = [date.fromisoformat(d) for d, _ in series]
    vals = [v for _, v in series]
    end, ve = days[-1], vals[-1]

    def base(target):
        lo, hi = 0, len(days) - 1
        if days[0] > target:
            return None
        while lo < hi:                          # 마지막 days[i] <= target
            mid = (lo + hi + 1) // 2
            if days[mid] <= target:
                lo = mid
            else:
                hi = mid - 1
        if (target - days[lo]).days > gap_days:
            return None
        return vals[lo]

    targets = {'1w': end - timedelta(days=7), '1m': _minus_months(end, 1), '3m': _minus_months(end, 3),
               '6m': _minus_months(end, 6), 'ytd': date(end.year - 1, 12, 31),
               '1y': _minus_months(end, 12), '3y': _minus_months(end, 36), '5y': _minus_months(end, 60),
               '10y': _minus_months(end, 120)}
    out['1d'] = round((ve / vals[-2] - 1) * 100, 2)
    for p, t in targets.items():
        b = base(t)
        if b is None or b <= 0:
            continue
        g = ve / b
        if p in ANNUALIZED:
            yrs = int(p[:-1])
            out[p] = round((g ** (1.0 / yrs) - 1) * 100, 2)
        else:
            out[p] = round((g - 1) * 100, 2)
    return out, end.isoformat()


LEV_PATTERNS = [
    (1, re.compile(r'레버리지|\b[2-5] ?[xX]\b|[2-5]배|ultra ?pro(?! ?short)|\bultra\b(?![- ]?short)|leveraged'
                   r'|\bbull\b|レバレッジ|daily .*bull|2倍|3倍', re.I)),
    (-1, re.compile(r'인버스|곱버스|inverse|\bbear\b|ultra ?short|ultrapro ?short|インバース'
                    r'|\bshort\b(?![- ]?(term|duration|maturity|dated|treasury|bond|high|corporate|income|vol))'
                    r'|-[1-5] ?[xX]\b|反向', re.I)),
]


def leverage_flag(name, category=None, naver_tab=None):
    """(-1 인버스 | 1 레버리지 | 0, 까닭). 이름·분류가 주는 말만 본다."""
    cat = category or ''
    if cat.startswith('Trading--Inverse'):
        return -1, 'yahoo:' + cat
    if cat.startswith('Trading--Leveraged'):
        return 1, 'yahoo:' + cat
    nm = name or ''
    for flag, rx in (LEV_PATTERNS[1], LEV_PATTERNS[0]):     # 인버스 먼저 — '인버스2X' 는 인버스
        m = rx.search(nm)
        if m:
            return flag, 'name:' + m.group(0).strip()
    if naver_tab == 3:
        return 1, 'naver:파생탭'
    return 0, None


# ─────────────────────────────────────────────────────────────────────
# 국내
# ─────────────────────────────────────────────────────────────────────

def kr_universe():
    raw = _req('https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0'
               '&targetColumn=market_sum&sortOrder=desc').decode('euc-kr', 'replace')
    items = json.loads(raw)['result']['etfItemList']
    return [{'code': it['itemcode'], 'name': it['itemname'], 'tab': it.get('etfTabCode'),
             'mcap_eok': it.get('marketSum'), 'nav': it.get('nav'), 'price': it.get('nowVal')} for it in items]


def kr_one(it):
    code = it['code']
    rec = {'m': 'KR', 'code': code, 'name': it['name'], 'ccy': 'KRW', 'tab': it.get('tab'), 'err': []}
    try:
        an = parse_naver_analysis(get_json('https://m.stock.naver.com/api/stock/%s/etfAnalysis' % code))
        rec.update({k: an[k] for k in ('issuer', 'index', 'listed', 'aum', 'aum_raw', 'mcap', 'fee', 'ret',
                                       'ret_at', 'hold', 'h_status', 'theme_naver')})
        rec['name'] = an.get('name') or rec['name']
    except Exception as e:                                  # noqa: BLE001
        rec['err'].append('etfAnalysis: %s' % e)
        rec['h_status'] = 'err'
    try:
        rec.update(parse_naver_basic(get_json('https://m.stock.naver.com/api/stock/%s/basic' % code)))
    except Exception as e:                                  # noqa: BLE001
        rec['err'].append('basic: %s' % e)
    rec['src'] = {'hold': 'naver', 'ret': 'naver', 'aum': 'naver', 'meta': 'naver'}
    return rec


def kr_english_names():
    """야후 스크리너(region kr)의 영문 이름. 이름만 쓴다."""
    out, off = {}, 0
    while off < 3000:
        payload = {'size': 250, 'offset': off, 'sortField': 'intradayprice', 'sortType': 'DESC',
                   'quoteType': 'ETF', 'topOperator': 'AND',
                   'query': {'operator': 'AND', 'operands': [{'operator': 'eq', 'operands': ['region', 'kr']}]},
                   'userId': '', 'userIdType': 'guid'}
        try:
            r = y_screener(payload)['finance']['result'][0]
        except Exception:                                   # noqa: BLE001
            break
        qs = r.get('quotes') or []
        for q in qs:
            m = re.fullmatch(r'([0-9A-Z]{6})\.K[SQ]', q.get('symbol') or '')
            if m and q.get('longName'):
                out[m.group(1)] = q['longName']
        off += 250
        if len(qs) < 250 or off >= (r.get('total') or 0):
            break
        time.sleep(0.4)
    return out


def verify_kr(recs, n=12):
    """국내 표본 n 종목을 네이버 일봉으로 직접 셈해 네이버 값과 맞댄다.

    일봉(siseJson)은 분배금이 반영된 수정 종가다. 같은 엔진(returns_from_series)을
    해외에 쓰므로, 여기서 맞으면 해외 수익률도 네이버와 같은 약속으로 셈해진 것이다.
    """
    rows = []
    picks = [r for r in recs if r.get('ret') and r['ret'].get('10y') is not None][:n // 2]
    picks += [r for r in recs if r.get('ret') and r['ret'].get('1y') is not None and r not in picks][:n - len(picks)]
    for r in picks:
        end = (r.get('ret_at') or now_kst().strftime('%Y-%m-%d')).replace('-', '')
        start = str(int(end[:4]) - 11) + end[4:]
        try:
            t = _req('https://api.finance.naver.com/siseJson.naver?symbol=%s&requestType=1&startTime=%s'
                     '&endTime=%s&timeframe=day' % (r['code'], start, end)).decode('utf-8', 'replace')
        except Exception as e:                              # noqa: BLE001
            rows.append({'code': r['code'], 'err': str(e)})
            continue
        ser = [('%s-%s-%s' % (d[:4], d[4:6], d[6:]), float(c))
               for d, c in re.findall(r'\["(\d{8})",\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)', t)]
        mine, at = returns_from_series(ser)
        diff = {p: (None if mine[p] is None or r['ret'][p] is None else round(mine[p] - r['ret'][p], 2))
                for p in PERIODS}
        rows.append({'code': r['code'], 'name': r['name'], 'at': at, 'naver_at': r.get('ret_at'),
                     'naver': r['ret'], 'mine': mine, 'diff': diff})
        time.sleep(0.3)
    return rows


# ─────────────────────────────────────────────────────────────────────
# 해외 (야후)
# ─────────────────────────────────────────────────────────────────────

def y_universe(region):
    out, off, total = [], 0, None
    while True:
        payload = {'size': 250, 'offset': off, 'sortField': 'fundnetassets', 'sortType': 'DESC',
                   'quoteType': 'ETF', 'topOperator': 'AND',
                   'query': {'operator': 'AND', 'operands': [{'operator': 'eq', 'operands': ['region', region]}]},
                   'userId': '', 'userIdType': 'guid'}
        r = None
        for attempt in range(3):
            try:
                r = y_screener(payload)['finance']['result'][0]
                break
            except Exception:                               # noqa: BLE001
                init_crumb()
                time.sleep(3)
        if r is None:
            raise RuntimeError('screener %s offset %d 실패' % (region, off))
        total = r.get('total') or 0
        qs = r.get('quotes') or []
        out.extend(qs)
        off += len(qs)
        if not qs or off >= total:
            break
        time.sleep(0.4)
    return out, total


def us_mutualfund_assets(limit=4000):
    """미국 뮤추얼펀드의 순자산 — 「펀드 전체 기준」을 가려낼 증거로만 쓴다.

    뱅가드 ETF 는 한 펀드의 한 종류(클래스)라 야후가 ETF 순자산 칸에 펀드 전체 값을
    준다. 그 값은 같은 펀드의 뮤추얼펀드 클래스(VTI ↔ VTSAX)의 순자산과 **한 푼도 안
    틀리고 같다.** 같으면 펀드 전체 값이라는 증거가 된다. 짐작(비율·운용사 이름)으로
    가르지 않는다 — 야후의 발행 좌수가 낡아 비율로 가르면 iShares 까지 잘못 걸렸다.
    """
    out, off = [], 0
    while off < limit:
        payload = {'size': 250, 'offset': off, 'sortField': 'fundnetassets', 'sortType': 'DESC',
                   'quoteType': 'MUTUALFUND', 'topOperator': 'AND',
                   'query': {'operator': 'AND', 'operands': [{'operator': 'eq', 'operands': ['region', 'us']}]},
                   'userId': '', 'userIdType': 'guid'}
        try:
            r = y_screener(payload)['finance']['result'][0]
        except Exception as e:                              # noqa: BLE001
            print('뮤추얼펀드 목록 실패 offset %d: %s' % (off, e), flush=True)
            break
        qs = r.get('quotes') or []
        for q in qs:
            if q.get('netAssets'):
                out.append({'symbol': q['symbol'], 'name': q.get('longName') or q.get('shortName'),
                            'aum': num(q['netAssets'])})
        off += len(qs)
        if not qs or off >= (r.get('total') or 0):
            break
        time.sleep(0.4)
    return out


def cn_universe():
    """상해 510000-519999·560000-563999·588000-589999, 심천 159000-159999 를 v7 quote 로 훑는다."""
    cands = ['%06d.SS' % i for i in list(range(510000, 520000)) + list(range(560000, 564000)) + list(range(588000, 590000))]
    cands += ['%06d.SZ' % i for i in range(159000, 160000)]
    found = []
    for i in range(0, len(cands), 150):
        chunk = ','.join(cands[i:i + 150])
        for attempt in range(3):
            try:
                res = yq('/v7/finance/quote?symbols=' + chunk)['quoteResponse']['result']
                break
            except Exception:                               # noqa: BLE001
                res = None
                time.sleep(2)
        for q in res or []:
            nm = q.get('longName') or q.get('shortName') or ''
            if q.get('regularMarketPrice') and re.search(r'ETF|Exchange Traded', nm, re.I):
                found.append(q)
        time.sleep(0.3)
    return found


def dedupe_hk(quotes):
    """홍콩은 한 ETF 가 HKD·RMB·USD 카운터로 따로 나온다. 이름이 같으면 HKD 카운터 하나만."""
    groups = {}
    for q in quotes:
        groups.setdefault((q.get('longName') or q.get('symbol')), []).append(q)
    keep, dropped = [], []
    for name, qs in groups.items():
        qs.sort(key=lambda q: (q.get('currency') != 'HKD', len(q.get('symbol') or '')))
        keep.append(qs[0])
        dropped.extend([(q['symbol'], qs[0]['symbol']) for q in qs[1:]])
    return keep, dropped


def overseas_one(q, market, with_holdings=True):
    sym = q['symbol']
    rec = {'m': market, 'code': sym, 'name': q.get('longName') or q.get('shortName') or sym,
           'ccy': q.get('currency'), 'err': [], 'price': q.get('regularMarketPrice'),
           'aum': num(q.get('netAssets')), 'shares': num(q.get('sharesOutstanding')),
           'traded_at': (datetime.fromtimestamp(q['regularMarketTime'], timezone.utc).strftime('%Y-%m-%d')
                         if q.get('regularMarketTime') else None),
           'fee': num(q.get('netExpenseRatio')), 'exchange': q.get('fullExchangeName'),
           'first_trade': q.get('firstTradeDateMilliseconds')}
    if with_holdings:
        try:
            s = parse_yahoo_summary(yq('/v10/finance/quoteSummary/%s?modules=topHoldings,fundProfile,price,quoteType'
                                       '&formatted=false' % urllib.parse.quote(sym)))
            rec.update({'issuer': s['family'], 'category': s['category'], 'hold': s['hold'],
                        'h_status': s['h_status']})
        except Exception as e:                              # noqa: BLE001
            rec['err'].append('quoteSummary: %s' % e)
            rec['h_status'] = 'err'
    else:
        rec['h_status'] = 'cn'
        rec['hold'] = []
    try:
        p1 = int((datetime.now(timezone.utc) - timedelta(days=366 * 10 + 20)).timestamp())
        ser, meta = parse_yahoo_chart(yq('/v8/finance/chart/%s?period1=%d&period2=%d&interval=1d'
                                         '&events=div,split&includeAdjustedClose=true'
                                         % (urllib.parse.quote(sym), p1, int(time.time()) + 86400)))
        rec['ret'], rec['ret_at'] = returns_from_series(ser)
        rec['n_bars'] = len(ser)
        if ser:
            rec['first_bar'] = ser[0][0]
    except Exception as e:                                  # noqa: BLE001
        rec['err'].append('chart: %s' % e)
        rec['ret'], rec['ret_at'] = {p: None for p in PERIODS}, None
    rec['src'] = {'hold': 'yahoo' if with_holdings else None, 'ret': 'yahoo_adj', 'aum': 'yahoo', 'meta': 'yahoo'}
    return rec


def fx_rates():
    out = {}
    for ccy in ('USD', 'HKD', 'JPY', 'CNY'):
        try:
            ser, meta = parse_yahoo_chart(yq('/v8/finance/chart/%sKRW=X?range=5d&interval=1d' % ccy))
            px = (meta or {}).get('regularMarketPrice')
            out[ccy] = {'krw': px, 'at': (datetime.fromtimestamp(meta['regularMarketTime'], timezone.utc)
                                          .strftime('%Y-%m-%d %H:%M UTC') if meta.get('regularMarketTime') else None),
                        'src': 'yahoo %sKRW=X' % ccy}
        except Exception as e:                              # noqa: BLE001
            out[ccy] = {'krw': None, 'err': str(e)}
    return out


def run_pool(fn, items, workers, label):
    out, done, t0 = [], 0, time.time()
    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(fn, it) for it in items]
        for f in cf.as_completed(futs):
            try:
                out.append(f.result())
            except Exception as e:                          # noqa: BLE001
                print('  %s 한 건 실패: %s' % (label, e), flush=True)
            done += 1
            if done % 200 == 0:
                print('  %s %d/%d (%.0fs, 요청 %d, 실패 %d, 429 %d)' % (label, done, len(items), time.time() - t0,
                                                                   STATS['req'], STATS['fail'], STATS['429']),
                      flush=True)
    return out


def save(name, obj):
    os.makedirs(OUT_DIR, exist_ok=True)
    p = os.path.join(OUT_DIR, name)
    tmp = p + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(tmp, p)
    print('저장', p, os.path.getsize(p), 'bytes', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--markets', default='KR,US,HK,JP,CN')
    ap.add_argument('--limit', type=int, default=0, help='시장마다 앞에서 몇 개만 (시험용)')
    ap.add_argument('--workers', type=int, default=4)
    a = ap.parse_args()
    markets = [m.strip().upper() for m in a.markets.split(',') if m.strip()]
    started = now_kst().strftime('%Y-%m-%d %H:%M:%S KST')
    print('crumb:', bool(init_crumb()), flush=True)
    report = ['수집 시작 %s' % started, '']

    if 'KR' in markets:
        uni = kr_universe()
        if a.limit:
            uni = uni[:a.limit]
        print('KR 목록 %d' % len(uni), flush=True)
        recs = run_pool(kr_one, uni, a.workers, 'KR')
        en = kr_english_names()
        for r in recs:
            r['name_en'] = en.get(r['code'])
        ver = verify_kr(recs)
        save('raw_KR.json', {'market': 'KR', 'at': now_kst().strftime('%Y-%m-%d %H:%M:%S KST'),
                             'n_list': len(uni), 'etfs': recs, 'verify': ver, 'n_en': len(en)})
        worst = max((abs(v) for row in ver for v in (row.get('diff') or {}).values() if v is not None), default=None)
        report += ['## 한국', '목록 %d · 받은 것 %d · 영문 이름 %d' % (len(uni), len(recs), len(en)),
                   '네이버 수익률 ↔ 네이버 일봉으로 직접 셈 — 표본 %d종, 가장 큰 차이 %s%%p' % (len(ver), worst), '']

    for mk, region in (('US', 'us'), ('HK', 'hk'), ('JP', 'jp')):
        if mk not in markets:
            continue
        qs, total = y_universe(region)
        dropped = []
        if mk == 'HK':
            qs, dropped = dedupe_hk(qs)
        if a.limit:
            qs = qs[:a.limit]
        print('%s 목록 %d (스크리너 총 %s, 카운터 중복 %d 뺌)' % (mk, len(qs), total, len(dropped)), flush=True)
        recs = run_pool(lambda q, mk=mk: overseas_one(q, mk), qs, a.workers, mk)
        save('raw_%s.json' % mk, {'market': mk, 'at': now_kst().strftime('%Y-%m-%d %H:%M:%S KST'),
                                  'n_list': len(qs), 'screener_total': total, 'dropped_counters': dropped,
                                  'etfs': recs})
        report += ['## %s' % mk, '목록 %d (스크리너 총 %s) · 받은 것 %d · 구성 있음 %d' % (
            len(qs), total, len(recs), sum(1 for r in recs if r.get('h_status') == 'ok')), '']

    if 'US' in markets:
        mf = us_mutualfund_assets(400 if a.limit else 4000)
        save('raw_MF.json', {'at': now_kst().strftime('%Y-%m-%d %H:%M:%S KST'), 'funds': mf})
        report += ['## 미국 뮤추얼펀드 (펀드 전체 기준 가리기용)', '%d 종' % len(mf), '']

    if 'CN' in markets:
        qs = cn_universe()
        if a.limit:
            qs = qs[:a.limit]
        print('CN 목록 %d' % len(qs), flush=True)
        recs = run_pool(lambda q: overseas_one(q, 'CN', with_holdings=False), qs, a.workers, 'CN')
        save('raw_CN.json', {'market': 'CN', 'at': now_kst().strftime('%Y-%m-%d %H:%M:%S KST'),
                             'n_list': len(qs), 'etfs': recs})
        report += ['## CN', '목록 %d · 받은 것 %d (구성종목은 원천 없음)' % (len(qs), len(recs)), '']

    save('fx.json', {'at': now_kst().strftime('%Y-%m-%d %H:%M:%S KST'), 'rates': fx_rates()})
    report += ['요청 %d · 실패 %d · 429 %d' % (STATS['req'], STATS['fail'], STATS['429']),
               '끝 %s' % now_kst().strftime('%Y-%m-%d %H:%M:%S KST')]
    with open(os.path.join(OUT_DIR, 'report.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(report) + '\n')
    print('\n'.join(report))
    return 0


if __name__ == '__main__':
    sys.exit(main())
