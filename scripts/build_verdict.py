# -*- coding: utf-8 -*-
"""종목 판정 — **이 종목을 지금 사야 하는가, 팔아야 하는가, 들고 있어야 하는가.**

`data/kis_timing/verdict.json` 한 장에 우주 전체를 담는다. 화면은 이것만 읽는다.

## 네 겹을 어떻게 겹치는가 — 그리고 왜 이렇게만 겹치는가

이 판정에서 가장 중요한 결정은 **무게를 어디에 주지 않았는가**이다.

    기술   합의 K=2 (전략빌더 10종 중 두 구간 모두 통과한 것)   ← **판정을 만든다**
    실적   서프라이즈 · 추정치 방향 · 목표가 괴리 · 밸류에이션   ← 딱지만
    이벤트 실적 발표 D-n · 배당락 D-n                          ← 막을 수 있다
    수급   외국인·기관 순매수 · 외국인 보유율 변화               ← 딱지만
    리포트 최근 20일 증권사 리포트 건수와 최신 제목              ← 딱지만
    시황   VIX · 등락종목수 · 투자자 수급 · 금리 · 환율          ← 시장 전체에 건다

**기술만 판정을 만든다.** 대조군을 세워 잰 것이 그것뿐이기 때문이다 — 같은
시장·같은 보유기간의 무작위 진입과 견주어 초과수익이 학습·검증 두 구간 모두
양수인 전략만 합의에 넣었다(kis_timing_backtest.py).

**실적에 무게를 주지 않는 까닭.** 주려고 재 봤고 **잴 수 없었다.** 이 저장소에
실적 발표일이 없다 — 야후가 주는 서프라이즈 시각은 발표일이 아니라 분기말이고,
그것으로 진입을 잡으면 아직 공표되지 않은 실적을 알고 산 셈이 된다(미리보기
편향). `scripts/earnings_drift.py` 에 그 기록이 있다. **잴 수 없는 것에 무게를
매기면 그 무게는 지어낸 것이다.**

## 딱지는 막을 수 있어도 만들 수는 없다

이 판정의 규율이다.

    실적이 좋다  →  기술 신호가 없으면 **매수를 내지 않는다**
    실적이 나쁘다 →  기술 매수 신호가 있어도 **보류로 내린다**

비대칭으로 둔 까닭. 「좋다」로 매수를 만들려면 그것이 먹힌다는 증거가 있어야
하는데 없다. 「나쁘다」로 매수를 미루는 것은 증거가 없어도 치르는 값이 작다 —
하루 늦게 사는 비용과, 발표 갭으로 −15% 를 맞는 비용은 같지 않다.

**막는 딱지는 잰 것이 아니라 정한 것이다.** 그래서 무엇을 정했는지 아래
`BLOCKS` 에 한자리에 모아 두고, 판정마다 어느 규칙이 걸렸는지 산출물에 적는다.

## 다섯 칸

    청산 (SELL)    합의 K개 이상이 오늘 SELL — 들고 있다면 내려놓을 자리
    매수 (BUY)     합의 K개 이상이 오늘 BUY 이고 막는 딱지가 없다
    보류 (BLOCKED) 합의 매수인데 막는 딱지가 걸렸다 — **왜 막혔는지 적는다**
    관찰 (WATCH)   전략 하나만 켜졌다
    보유 (HOLD)    아무 신호도 없다 — 들고 있으면 그대로, 없으면 그대로

「보유」가 대부분이다. 그게 맞다 — 합의가 모이는 날은 종목·날 기준 1~2% 다.
날마다 살 거리를 찾아 주는 화면은 그 자체가 고장이다.
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import kis_timing_backtest as B
import stock_facts as S

ROOT = D.ROOT
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')
BACKTEST = os.path.join(OUT_DIR, 'backtest.json')
OUT = os.path.join(OUT_DIR, 'verdict.json')

K_LIVE = 2
STALE_BARS = 3

VERDICTS = {
    'SELL':    {'label': '청산', 'rank': 0},
    'BUY':     {'label': '매수', 'rank': 1},
    'BLOCKED': {'label': '보류', 'rank': 2},
    'WATCH':   {'label': '관찰', 'rank': 3},
    'HOLD':    {'label': '보유', 'rank': 4},
}

# ─────────────────────────────────────────────────────────────────────
# 막는 규칙 — **잰 것이 아니라 정한 것이다.** 한자리에 모아 둔다.
# ─────────────────────────────────────────────────────────────────────
#
# 규칙마다 「왜 이 문턱인가」를 적는다. 적을 수 없으면 그 규칙은 두지 않는다.

BLOCKS = [
    {
        'id': 'earnings_soon',
        'text': '실적 발표가 %(days)s 일 앞입니다',
        'why': ('발표 갭은 전략이 보는 어떤 지표에도 잡히지 않습니다. 하루 늦게 '
                '사는 비용과 갭으로 크게 잃는 비용은 같지 않습니다.'),
        'threshold': '5 거래일 — 한 주',
    },
    {
        'id': 'ex_div_soon',
        'text': '배당락이 %(days)s 일 앞입니다',
        'why': ('배당락일에는 배당만큼 가격이 떨어집니다. 그 하락은 전략이 보는 '
                '하락과 뜻이 다른데, 지표는 둘을 가르지 못합니다.'),
        'threshold': '3 거래일',
    },
    {
        'id': 'market_negative',
        'text': '이 시장은 검증구간에서 합의의 초과수익이 음수였습니다 (%(edge)s%%p)',
        'why': ('그 시장에서는 이 10종이 서지 않았다는 뜻입니다. 오늘 신호가 켜진 '
                '것과 그 신호가 값이 있었던 것은 다른 말입니다.'),
        'threshold': '검증구간 합의 K=2 초과수익 ≤ 0',
    },
    {
        'id': 'stale_bars',
        'text': '일봉이 시장 최신일보다 %(days)s 거래일 뒤처졌습니다',
        'why': '묵은 봉으로 낸 신호는 오늘의 신호가 아닙니다.',
        'threshold': '%d 거래일' % STALE_BARS,
    },
]
BLOCK_BY_ID = {b['id']: b for b in BLOCKS}

EARNINGS_BLOCK_DAYS = 5
EXDIV_BLOCK_DAYS = 3


def _fmt(px):
    return None if px is None else round(px, 2 if px < 1000 else 0)


def _eok(x):
    """억원을 천 단위로 끊어 부호와 함께. `%` 서식에는 천 단위 쉼표가 없다."""
    return '{:+,.0f}'.format(x or 0)


def _flag(kind, level, text, detail=None):
    """level: block(막음) · warn(주의) · support(보탬) · info(알림)"""
    return {'kind': kind, 'level': level, 'text': text, 'detail': detail}


def slim(fa):
    """검색 화면이 쓸 만큼만 남긴다 — **브라우저가 내려받는 파일이다.**

    처음 판은 1.5MB 였다. 절반이 증권사 리포트 요약문(종목마다 다섯 건 × 300자)
    이었다. 화면은 그 자리에 제목과 매체만 보여 주고 본문은 원문 링크로 보내므로,
    요약문을 통째로 싣는 것은 아무도 읽지 않을 글자를 200 종목분 내려받게 하는
    일이다. 연간 재무제표도 마찬가지다 — 판정에 쓰지 않고 화면에도 없다.

    **지우는 것이 아니라 줄이는 것**이라는 점이 요점이다. 리포트는 세 건으로,
    요약은 한 문장으로 줄이되 원문 주소는 남긴다. 더 보고 싶은 사람은 거기로 간다.
    """
    f = fa.get('fundamentals')
    if f:
        f = dict(f)
        f.pop('financials', None)          # 화면에도 판정에도 쓰지 않는다
        f['news'] = (f.get('news') or [])[:4]
        sp = f.get('surprises')
        if sp:
            sp = dict(sp)
            sp.pop('all', None)            # 요약(n·beats·평균·최근)만 남긴다
            f['surprises'] = sp
    rep = fa.get('reports')
    if rep:
        rep = dict(rep)
        rep['items'] = [{k: (v[:120] if k == 'summary' else v) for k, v in it.items()}
                        for it in (rep.get('items') or [])[:3]]
    return {'fundamentals': f, 'flows': fa.get('flows'), 'reports': rep}


# ─────────────────────────────────────────────────────────────────────
# 겹마다 딱지를 만든다
# ─────────────────────────────────────────────────────────────────────

def earnings_flags(f):
    """실적·추정치·목표가·밸류에이션. **판정을 만들지 않는다.**"""
    out = []
    if not f:
        return out
    sp = f.get('surprises')
    if sp:
        if sp['beats'] == sp['n'] and sp['n'] >= 3:
            out.append(_flag('실적', 'support',
                             '최근 %d 분기 모두 추정치를 웃돌았습니다 (평균 %+.1f%%)'
                             % (sp['n'], sp['avg_pct']),
                             '발표일이 자료에 없어 이 사실이 값이 있는지는 재지 못했습니다'))
        elif sp['avg_pct'] < 0:
            out.append(_flag('실적', 'warn',
                             '최근 %d 분기 서프라이즈 평균이 %+.1f%% 입니다'
                             % (sp['n'], sp['avg_pct'])))
        if sp.get('last_pct') is not None and sp['last_pct'] <= -10:
            out.append(_flag('실적', 'warn',
                             '가장 최근 분기가 추정치를 %.0f%% 밑돌았습니다' % abs(sp['last_pct'])))

    tr = f.get('eps_trend') or {}
    cur, nxt = tr.get('0y'), tr.get('+1y')
    if cur and nxt and cur.get('eps_avg') and nxt.get('eps_avg'):
        g = (nxt['eps_avg'] / cur['eps_avg'] - 1) * 100 if cur['eps_avg'] > 0 else None
        if g is not None and g >= 20:
            out.append(_flag('실적', 'support',
                             '내년 EPS 추정이 올해보다 %.0f%% 높습니다 (애널리스트 %s 명)'
                             % (g, int(nxt.get('analysts') or 0))))
        elif g is not None and g < 0:
            out.append(_flag('실적', 'warn',
                             '내년 EPS 추정이 올해보다 %.0f%% 낮습니다' % abs(g)))

    t = f.get('target')
    if t and t.get('upside_pct') is not None and (t.get('analysts') or 0) >= 5:
        up = t['upside_pct']
        if up <= 0:
            out.append(_flag('목표가', 'warn',
                             '현재가가 증권사 평균 목표주가를 %.0f%% 웃돕니다 (%d 명)'
                             % (abs(up), int(t['analysts'])),
                             '목표주가는 자주 늦게 고쳐집니다 — 상한선으로 읽지 마십시오'))
        elif up >= 20:
            out.append(_flag('목표가', 'support',
                             '증권사 평균 목표주가까지 %.0f%% 남았습니다 (%d 명)'
                             % (up, int(t['analysts']))))
        d = t.get('dist') or {}
        if (d.get('sell', 0) + d.get('strongSell', 0)) >= 3:
            out.append(_flag('목표가', 'warn',
                             '매도 의견이 %d 건 있습니다'
                             % (d.get('sell', 0) + d.get('strongSell', 0))))

    q = f.get('quote') or {}
    if q.get('high52') and q.get('price'):
        off = (q['price'] / q['high52'] - 1) * 100
        if off >= -2:
            out.append(_flag('가격위치', 'info', '52주 최고가 부근입니다 (%.1f%%)' % off))
        elif off <= -40:
            out.append(_flag('가격위치', 'info', '52주 최고가보다 %.0f%% 아래입니다' % abs(off)))
    if q.get('per') and q['per'] > 0 and q['per'] >= 60:
        out.append(_flag('밸류에이션', 'warn', 'PER 이 %.0f 배입니다' % q['per']))
    if q.get('debtToEquity') and q['debtToEquity'] >= 200:
        out.append(_flag('재무', 'warn', '부채비율이 %.0f%% 입니다' % q['debtToEquity']))
    if q.get('roe') is not None and q['roe'] < 0:
        out.append(_flag('재무', 'warn', 'ROE 가 %.1f%% 입니다' % q['roe']))
    return out


def event_flags(f, today):
    """일정 — **여기서만 매수를 막는다.**"""
    out = []
    if not f:
        return out
    e = f.get('earnings') or {}
    n = e.get('next_in_days')
    if n is not None and 0 <= n <= EARNINGS_BLOCK_DAYS:
        out.append(_flag('일정', 'block',
                         BLOCK_BY_ID['earnings_soon']['text'] % {'days': n},
                         '%s%s' % (e.get('next_date') or '',
                                   ' (추정일)' if e.get('estimated') else ' (확정일)')))
    elif n is not None and 0 <= n <= 20:
        out.append(_flag('일정', 'info', '실적 발표가 %d 일 앞입니다 (%s)'
                         % (n, e.get('next_date') or '')))

    dv = f.get('dividend') or {}
    dn = dv.get('ex_in_days')
    if dn is not None and 0 <= dn <= EXDIV_BLOCK_DAYS:
        out.append(_flag('일정', 'block',
                         BLOCK_BY_ID['ex_div_soon']['text'] % {'days': dn},
                         '배당락 %s · 배당수익률 %s%%'
                         % (dv.get('ex_date'), dv.get('yield_pct'))))
    return out


def flow_flags(fl):
    out = []
    if not fl:
        return out
    f20, i20 = fl.get('foreign_20d'), fl.get('inst_20d')
    if f20 is not None and i20 is not None:
        if f20 > 0 and i20 > 0:
            out.append(_flag('수급', 'support',
                             '최근 %d 거래일 외국인·기관이 함께 순매수했습니다 '
                             '(외 %s · 기 %s 억원)' % (fl['days'], _eok(f20), _eok(i20))))
        elif f20 < 0 and i20 < 0:
            out.append(_flag('수급', 'warn',
                             '최근 %d 거래일 외국인·기관이 함께 순매도했습니다 '
                             '(외 %s · 기 %s 억원)' % (fl['days'], _eok(f20), _eok(i20))))
    ch = fl.get('foreign_hold_chg_pp')
    if ch is not None and abs(ch) >= 0.3:
        out.append(_flag('수급', 'support' if ch > 0 else 'warn',
                         '외국인 보유율이 %+.2f%%p 움직였습니다 (현재 %.2f%%)'
                         % (ch, fl.get('foreign_hold_pct') or 0)))
    return out


def report_flags(rep):
    out = []
    if not rep:
        return out
    out.append(_flag('리포트', 'info',
                     '최근 %d 날 증권사 리포트 %d 건 (%s 등 %d 곳)'
                     % (S.REPORT_DAYS, rep['n'], (rep['brokers'] or ['?'])[0],
                        len(rep['brokers'])),
                     rep['items'][0]['title'] if rep['items'] else None))
    return out


# ─────────────────────────────────────────────────────────────────────
# 시황 — 시장 전체에 건다
# ─────────────────────────────────────────────────────────────────────

def regime_flags(rg, region):
    """종목이 아니라 **오늘 장 전체**에 붙는 딱지. 막지는 않는다.

    **지역을 받는 까닭.** 코스피의 등락종목수와 외국인 순매수는 국내 종목에
    걸리는 말이지 애플에 걸리는 말이 아니다. 한 벌로 만들어 모두에게 붙이면
    미국 종목 화면에 「코스피 개인이 3.6조 순매도」가 뜬다 — 틀린 말은 아닌데
    그 자리에 있을 말이 아니고, 그런 줄이 쌓이면 화면 전체가 못 믿을 것이 된다.
    """
    out = []
    if not rg:
        return out
    ix = rg['indices']

    # VIX 는 두 지역 모두에 건다 — 위험자산 전반의 값이다.
    vix = ix.get('vix') or {}
    if vix.get('close') is not None:
        lv = vix['close']
        if lv >= 25:
            out.append(_flag('시황', 'warn', 'VIX 가 %.1f 입니다 — 변동성이 높은 장입니다' % lv))
        elif lv <= 14:
            out.append(_flag('시황', 'info', 'VIX 가 %.1f 로 낮습니다' % lv))

    if region == 'KR':
        br = rg.get('breadth_kospi') or {}
        sh = br.get('advance_share_pct')
        if sh is not None:
            out.append(_flag('시황', 'warn' if sh < 40 else 'info',
                             '코스피에서 오른 종목이 %.0f%% 입니다 (상승 %s · 하락 %s)'
                             % (sh, br.get('advancing'), br.get('declining'))))
        fl = rg.get('investor_flows_kospi') or {}
        if fl.get('foreign') is not None:
            out.append(_flag('시황', 'info',
                             '코스피 투자자 순매수 — 외국인 %s · 기관 %s · 개인 %s 억원'
                             % (_eok(fl.get('foreign')), _eok(fl.get('institution')),
                                _eok(fl.get('retail')))))
        fx = ix.get('usdkrw') or {}
        if fx.get('change_pct') is not None and abs(fx['change_pct']) >= 0.5:
            out.append(_flag('시황', 'info', '원/달러가 %.1f 원 (%+.2f%%) 입니다'
                             % (fx.get('close') or 0, fx['change_pct'])))
    else:
        for k, nm in (('sp500', 'S&P500'), ('nasdaq', '나스닥'), ('sox', '필라델피아 반도체')):
            v = ix.get(k) or {}
            if v.get('change_pct') is not None:
                out.append(_flag('시황', 'info', '%s %+.2f%% (%s)'
                                 % (nm, v['change_pct'], v.get('date') or '')))
        r10 = (rg.get('rates_us') or {}).get('ust10y')
        if r10 is not None:
            out.append(_flag('시황', 'warn' if r10 >= 5.0 else 'info',
                             '미 10년물이 %.2f%% 입니다' % r10))
    return out


# ─────────────────────────────────────────────────────────────────────
# 판정
# ─────────────────────────────────────────────────────────────────────

def decide(buys, sells, flags):
    """다섯 칸 중 하나. **딱지는 막을 수 있어도 만들 수 없다.**"""
    blocks = [f for f in flags if f['level'] == 'block']
    # **칸 나누는 차례를 build_kis_timing.plan() 과 똑같이 둔다.** 둘이 어긋나면
    # 같은 종목이 매매 타이밍 화면에서는 매수, 판정 화면에서는 청산으로 보인다.
    if len(buys) >= K_LIVE and len(buys) >= len(sells):
        return ('BLOCKED' if blocks else 'BUY'), blocks
    if len(sells) >= K_LIVE:
        return 'SELL', blocks
    if buys or sells:
        return 'WATCH', blocks
    return 'HOLD', blocks


def judge(it, mk, members, acts_all, market_flags, today, latest_d):
    bars = it['bars']
    i = len(bars) - 1
    buys = [s for s in members if acts_all[s][i] == 'BUY']
    sells = [s for s in members if acts_all[s][i] == 'SELL']
    other_buy = [s['id'] for s in K.STRATEGIES
                 if s['id'] not in members and acts_all[s['id']][i] == 'BUY']
    other_sell = [s['id'] for s in K.STRATEGIES
                  if s['id'] not in members and acts_all[s['id']][i] == 'SELL']

    fa = S.facts(it['symbol'], mk, it.get('code'), today)
    own = []
    own += event_flags(fa['fundamentals'], today)
    own += earnings_flags(fa['fundamentals'])
    own += flow_flags(fa['flows'])
    own += report_flags(fa['reports'])
    # 묵은 봉 — 시장의 최신일과 견준다.
    if latest_d and bars[i]['d'] < latest_d:
        # 거래일 수로 세려면 시장 달력이 필요하다. 여기서는 달력 날수로 세고
        # 그렇게 적는다 — 어림한 것을 어림했다고 적는 편이 낫다.
        behind = S._days_between(bars[i]['d'], latest_d) or 0
        if behind >= STALE_BARS:
            own.append(_flag('자료', 'block',
                             BLOCK_BY_ID['stale_bars']['text'] % {'days': behind},
                             '이 종목 %s · 시장 최신 %s (달력 날수)' % (bars[i]['d'], latest_d)))

    # 시장 딱지는 **한 시장의 모든 종목에 똑같다.** 종목마다 베껴 실으면 같은
    # 문장이 이백 벌 쌓여 파일이 그만큼 커진다. 판정에는 다 쓰되, 종목에 남기는
    # 것은 판정을 가르는 것(block)뿐이고 나머지는 시장 머리에 한 번 싣는다 —
    # 화면이 둘을 겹쳐 보여 준다.
    verdict, blocks = decide(buys, sells, own + market_flags)
    close = bars[i]['c']
    keep = own + [f for f in market_flags if f['level'] == 'block']
    return {
        'symbol': it['symbol'], 'code': it.get('code'), 'name': it['name'],
        'market': mk, 'asof': bars[i]['d'],
        'close': _fmt(close),
        'change_pct': round((close / bars[i - 1]['c'] - 1) * 100, 2) if i else None,
        'verdict': verdict, 'verdict_label': VERDICTS[verdict]['label'],
        'technical': {
            'buy_hits': buys, 'sell_hits': sells,
            'other_buy': other_buy, 'other_sell': other_sell,
            'k': K_LIVE, 'members': members,
        },
        'stop_ref': _fmt(close * (1 - B.CONSENSUS_STOP / 100.0)) if verdict == 'BUY' else None,
        'stop_pct': B.CONSENSUS_STOP if verdict == 'BUY' else None,
        'flags': keep,
        'blocked_by': [f['text'] for f in blocks],
        'coverage': fa['coverage'],
        'facts': slim(fa),
    }


def main(argv=None):
    if not os.path.exists(BACKTEST):
        raise SystemExit('%s 가 없습니다 — 먼저 kis_timing_backtest.py 를 돌리십시오'
                         % os.path.relpath(BACKTEST, ROOT))
    bt = json.load(open(BACKTEST, encoding='utf-8'))
    uni, meta = D.load_universe()
    rg = S.regime()
    region_flags = {'KR': regime_flags(rg, 'KR'), 'US': regime_flags(rg, 'US')}
    today = datetime.now(KST).strftime('%Y-%m-%d')

    cons = {(c['market'], c['k'], c.get('scope')): c for c in bt['consensus']}

    out = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'k': K_LIVE,
        'how': {
            '판정을 만드는 것': '기술(합의 K=%d) 하나뿐입니다 — 대조군을 세워 잰 것이 그것뿐입니다' % K_LIVE,
            '딱지가 하는 일': '막을 수 있어도 만들 수는 없습니다. 실적이 좋다고 매수를 내지 않고, 나쁘면 매수를 보류로 내립니다',
            '실적에 무게가 없는 까닭': ('발표일이 자료에 없어 사건으로 잴 수 없었습니다 — '
                                'scripts/earnings_drift.py 에 그 기록이 있습니다. '
                                '잴 수 없는 것에 무게를 매기면 그 무게는 지어낸 것입니다'),
            '막는 규칙': BLOCKS,
        },
        'verdict_labels': {k: v['label'] for k, v in VERDICTS.items()},
        # 화면이 전략 id 를 사람 이름으로 바꿔 찍는다. 이름표를 화면에 또 적어 두면
        # 전략을 고칠 때 한쪽만 고쳐져 어긋난다.
        'strategies': bt['strategies'],
        'regime': rg, 'regime_flags': region_flags,
        'facts_summary': S.summary(),
        'view_order': ['KR_ETF', 'KR_OV_ETF', 'KR_STOCK', 'OV_ETF', 'US_STOCK'],
        'markets': {}, 'data_notes': meta,
    }

    for mk in D.MARKET_ORDER:
        rows = uni.get(mk) or []
        if not rows:
            continue
        members = bt['picked_live'].get(mk) or []
        g_test = cons.get((mk, K_LIVE, 'test'))
        edge = (g_test or {}).get('edge')
        latest_d = max(it['bars'][-1]['d'] for it in rows)

        mflags = list(region_flags[D.MARKETS[mk]['region']])
        if edge is not None and edge <= 0:
            mflags.append(_flag('시장', 'block',
                                BLOCK_BY_ID['market_negative']['text'] % {'edge': edge},
                                '%s · 합의 K=%d 검증구간' % (D.MARKETS[mk]['label'], K_LIVE)))

        items = []
        if members:
            acts_all = {}
            for it in rows:
                acts_all[it['symbol']] = K.all_actions(it['bars'])
            for it in rows:
                items.append(judge(it, mk, members, acts_all[it['symbol']],
                                   mflags, today, latest_d))
        else:
            # 검증을 통과한 전략이 없으면 판정을 내지 않는다. 억지로 내는 대신
            # **왜 못 내는지**를 싣는다.
            for it in rows:
                items.append({'symbol': it['symbol'], 'code': it.get('code'),
                              'name': it['name'], 'market': mk,
                              'asof': it['bars'][-1]['d'],
                              'close': _fmt(it['bars'][-1]['c']),
                              'verdict': 'HOLD', 'verdict_label': '보유',
                              'technical': {'members': [], 'buy_hits': [], 'sell_hits': []},
                              'flags': [_flag('시장', 'warn',
                                              '검증을 통과한 전략이 없어 합의를 낼 수 없습니다')],
                              'blocked_by': [], 'coverage': {}, 'facts': {}})

        order = {k: v['rank'] for k, v in VERDICTS.items()}
        items.sort(key=lambda x: (order[x['verdict']],
                                  -len(x['technical'].get('buy_hits') or []),
                                  x['name'] or ''))
        counts = {}
        for x in items:
            counts[x['verdict']] = counts.get(x['verdict'], 0) + 1

        out['markets'][mk] = {
            'label': D.MARKETS[mk]['label'], 'kind': D.MARKETS[mk]['kind'],
            'currency': D.MARKETS[mk]['currency'],
            'symbols': len(rows), 'asof': latest_d,
            'members': members,
            'edge_test': edge,
            'edge_note': (None if edge is None else
                          ('검증구간 합의 K=%d 초과수익 %+.2f%%p' % (K_LIVE, edge))),
            'market_flags': mflags,
            'counts': counts, 'items': items,
        }

    if D.write_if_changed(OUT, out):
        sys.stderr.write('%s 에 적었습니다\n' % os.path.relpath(OUT, ROOT))
    else:
        sys.stderr.write('%s — 시각 말고 달라진 것이 없어 그대로 둡니다\n'
                         % os.path.relpath(OUT, ROOT))
    for mk in out['view_order']:
        m = out['markets'].get(mk)
        if not m:
            continue
        sys.stderr.write('%-16s %s\n' % (m['label'], ' · '.join(
            '%s %d' % (VERDICTS[k]['label'], m['counts'][k])
            for k in ('SELL', 'BUY', 'BLOCKED', 'WATCH', 'HOLD') if m['counts'].get(k))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
