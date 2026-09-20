#!/usr/bin/env python3
"""ETF 합의종목 리포트 — 한 파일 HTML. 시장 하나를 한 장으로 낸다.

    python3 scripts/build_kr_etf_report.py                      # 국내ETF
    python3 scripts/build_kr_etf_report.py --market KR_OV_ETF   # 국내상장 해외ETF
    python3 scripts/build_kr_etf_report.py --out /tmp/보낼판.html

**한 대본이 시장 둘을 낸다.** 파일을 두 벌 두면 한쪽만 고쳐지고, 그 뒤로는 두
리포트가 같은 자료를 놓고 서로 다른 말을 하게 된다. 시장마다 다른 것은 `MARKETS`
표에 모았고 나머지는 모두 자료에서 셈한다.

## 왜 국내ETF 만이었나 — 그리고 그 까닭이 더는 성립하지 않는다

처음 이 리포트를 만들 때의 까닭은 「네 시장 가운데 근거가 가장 두꺼운 곳」이었다.
**그 말은 이제 참이 아니다.**

2026-09-20 에 두 가지가 바뀌었다. ① 국내ETF 칸에 섞여 있던 해외 노출(KODEX 200 과
TIGER 미국나스닥100 이 한 칸에 있었다)을 갈라냈고, ② 우주를 19 → 60종으로 넓혔다.

    갈라내기 전 · 48종(해외 섞임)    검증구간 합의 K=2 초과수익 +3.85%p
    갈라낸 뒤   · 19종(순수 국내)                            +0.28%p
    넓힌 뒤     · 60종                                       +0.12%p

**+3.85%p 는 국내 ETF 의 성적이 아니었다.** 이제 이 시장은 다섯 시장 가운데
초과수익이 가장 얇다. 그래도 이 리포트를 남기는 까닭은 자료 구간이 8해로 가장
길고 거래가 가장 두껍기(전 구간 6,932건) 때문이지, 성적이 가장 좋아서가 아니다.
**리포트가 그렇게 적는다.** 앞면에 그 말이 없으면 읽는 사람은 예전 이야기를
그대로 읽는다.

## 인쇄되는 수는 모두 자료에서 온다

이 파일에는 **손으로 적은 숫자가 없다.** 처음 판에는 있었고, 우주가 바뀌자
그것들이 조용히 거짓이 됐다 — 「다섯 번 중 세 번은 손절에 잘린다」가 그랬다.
실제로 손절로 끝난 거래는 3.4% 뿐이고 96.5% 는 청산 신호로 끝난다. 승률이 낮은
것은 맞지만 그게 손절 탓이라는 말은 틀렸다.

그래서 문장 안의 수와 **그 수에서 나오는 말**(몇 번 중 몇 번인가, 어느 쪽이 큰가)을
모두 `build()` 에서 셈해 넣는다. 자료가 바뀌면 문장도 함께 바뀐다.

## 무엇이 docs/kis-timing/index.html 과 다른가

그쪽은 **다섯 시장을 한꺼번에 보는 화면**이다. 이 파일은 **국내ETF 한 장**이고,
`build_client_page.py` 가 세운 규율을 따라 **층을 나눈다.**

    앞면  오늘의 자리 · 무엇을 보고 그렇게 말하는가 · 이 숫자를 어떻게 읽는가
    ───── 여기까지가 건넬 수 있는 층 ─────
    뒷면  근거(전략별 성적·합의 K) · 가정과 한계

**「어떻게 읽는가」를 앞면에 둔다.** 걷어내는 것은 *복잡한 것*이지 *불리한 것*이
아니다. 승률과 「다섯 번 중 몇 번은 지는 거래인가」를 빼고 매수 종목만 적으면
그건 줄인 게 아니라 속인 것이다.

## 디자인

미래에셋 기준 — 오렌지 #F58220 / 블루 #043B72, 1px 섹션 룰, FAB072 테이블 헤더,
모서리 4px 이하, 이모지·그라데이션 없음.

**글꼴 CDN 을 걸지 않는다.** 인터넷이 막힌 자리에서 열릴 파일이라(이 세션의
프록시도 바깥을 막는다) 못 받아 올 요청을 넣으면 열릴 때마다 그만큼 기다린다.
사내 PC 에 흔히 있는 것들로 대체 사슬을 세운다.

**한/영 토글을 넣지 않는다.** 디자인 기준의 기본값이 「KO 단일, 토글 요청 시
페어 작성」이고, 여기 실리는 것은 종목명·전략명처럼 번역이 뜻을 바꾸는 말들이다.
반쯤 번역된 토글은 없느니만 못하다.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
LATEST = os.path.join(ROOT, 'data', 'kis_timing', 'latest.json')
BACKTEST = os.path.join(ROOT, 'data', 'kis_timing', 'backtest.json')
# **한 대본이 시장 둘을 낸다.** 파일을 두 벌 두면 한쪽만 고쳐지고, 그 뒤로는
# 두 리포트가 서로 다른 말을 하게 된다. 시장마다 다른 것은 아래 표에 모은다 —
# 나머지(수·문장·순위·K 설명)는 모두 `derived()` 가 자료에서 셈한다.
MARKETS = {
    'KR_ETF': {
        'slug': 'kr-etf',
        'csv': 'kr-etf-timing',
        # 이 시장에만 있는 내력. 예전 판이 싣던 수가 무엇이었고 왜 달라졌는지
        # 적지 않으면, 그 판을 본 사람은 수가 줄어든 것을 성적이 나빠진 것으로 읽는다.
        'history': (
            '예전 판은 <b>+3.85%%p</b> 를 싣고 있었습니다. 그때 「국내ETF」 칸에는 '
            'KODEX 200 과 TIGER 미국나스닥100 이 함께 들어 있었고, 그 수는 '
            '<b>국내 ETF 의 성적이 아니었습니다.</b> 기초자산으로 갈라내고 우주를 '
            '%(count)d 종으로 넓히자 위의 값이 나왔습니다.'),
        'scope': (
            '대상은 국내 상장 ETF <b>전부가 아니라</b> 이 저장소가 시가·고가·저가까지 '
            '모아 둔 %(count)d 종입니다. <b>기초자산이 해외인 ETF는 여기에 없습니다</b> — '
            '미국나스닥100·니케이225 처럼 국내에 상장됐지만 해외를 따라가는 것들은 '
            '따로 셉니다. 한 칸에 섞으면 「국내ETF 에서 먹혔다」가 실은 미국 지수에서 '
            '먹힌 것일 수 있습니다.'),
    },
    'KR_OV_ETF': {
        'slug': 'kr-ov-etf',
        'csv': 'kr-ov-etf-timing',
        'history': (
            '<b>이 시장은 2026-09-20 에 새로 세웠습니다.</b> 그전에는 이 종목들이 '
            '「국내ETF」 칸에 섞여 있었고, 그 칸의 성적(+3.85%%p)은 사실 상당 부분 '
            '여기서 나온 것이었습니다. 갈라내어 따로 재자 위의 값이 나왔습니다 — '
            '<b>섞여 있을 때의 수보다 낮습니다.</b> 우주가 %(count)d 종으로 넓어져 '
            '표본이 두꺼워진 값이라 이쪽이 더 믿을 만합니다.'),
        'scope': (
            '대상은 <b>국내에 상장됐지만 기초자산이 해외인 ETF</b> %(count)d 종입니다 — '
            '미국나스닥100·MSCI선진국·니케이225·CSI300 같은 것들입니다. '
            '<b>원화로 사고팝니다.</b> 달러로 사는 미국 상장 ETF(해외ETF)는 거래시간도 '
            '환위험도 달라 따로 셉니다. 환헤지 여부는 종목마다 다르며 이 리포트는 '
            '그것을 가르지 않습니다 — 이름에 (H) 가 붙은 것이 환헤지형입니다.'),
    },
}
DEFAULT_MARKET = 'KR_ETF'
MARKET = DEFAULT_MARKET          # main() 이 --market 으로 바꾼다


def esc(s):
    return (str('' if s is None else s).replace('&', '&amp;')
            .replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;'))


def won(x):
    return '—' if x is None else '{:,.0f}원'.format(x)


# 숫자 뒤에 붙는 조사. **한글로 읽었을 때 받침이 있는가**로 갈린다 —
# 1(일)·3(삼)·6(육)·7(칠)·8(팔)·0(영)은 받침이 있고 2(이)·4(사)·5(오)·9(구)는 없다.
# 「K=3 가 더 높습니다」처럼 틀린 조사는 읽는 사람이 곧바로 알아차린다.
_JONG = {0: True, 1: True, 2: False, 3: True, 4: False,
         5: False, 6: True, 7: True, 8: True, 9: False}


def josa(n, with_jong, without):
    return with_jong if _JONG.get(int(n) % 10, False) else without


def pct(x, d=2, sign=True):
    if x is None:
        return '—'
    return ('%+.*f%%' if sign else '%.*f%%') % (d, x)


def plan_rows(plans, names, kind):
    if not plans:
        return ('<p class="none">오늘은 해당 종목이 없습니다. '
                '합의가 뜨는 날은 드뭅니다 — 종목·날 기준 1~2% 입니다.</p>')
    out = ['<div class="tblwrap"><table class="data"><thead><tr>'
           '<th>종목</th><th>코드</th><th class="n">기준 종가</th>'
           + ('<th class="n">손절 기준</th><th class="n">비중</th>' if kind == 'buy' else '')
           + '<th>겹친 전략</th></tr></thead><tbody>']
    for p in plans:
        hits = ' · '.join(names.get(s, s) for s in
                          (p['buy_hits'] if kind == 'buy' else p['sell_hits']))
        out.append(
            '<tr><td class="nm">%s</td><td class="mono">%s</td><td class="n">%s</td>%s<td>%s</td></tr>'
            % (esc(p['name']), esc(p['code']), won(p['close']),
               ('<td class="n hl">%s</td><td class="n">%s</td>'
                % (won(p['stop_ref']), '%d%%' % p['weight_hint'] if p['weight_hint'] else '—'))
               if kind == 'buy' else '',
               esc(hits)))
    return '\n'.join(out) + '</tbody></table></div>'


def build(doc, bt):
    m = doc['markets'][MARKET]
    names = {s['id']: s['name'] for s in doc['strategies']}
    g = m['consensus_full'] or {}
    gt = m['consensus_test'] or {}
    base = (g.get('base') or {})
    uni = m.get('universe') or {}
    rule = doc['rule']
    asm = doc['backtest_assumptions']

    grades = {x['strategy']: x for x in bt['grades'] if x['market'] == MARKET}
    cons = [c for c in bt['consensus'] if c['market'] == MARKET]

    # 전략별 성적 — 매수 신호를 내는 것만, 초과수익 큰 차례로
    srows = []
    for s in doc['strategies']:
        if not s['buy_rule']:
            continue
        x = grades.get(s['id'])
        if not x:
            continue
        mem = s['id'] in m['members']
        srows.append((x.get('edge') or -99, s['name'], x, mem))
    srows.sort(reverse=True)

    strategy_table = '\n'.join(
        '<tr%s><td class="nm">%s%s</td><td class="n">%s</td><td class="n">%s</td>'
        '<td class="n">%s</td><td class="n">%s</td><td class="n">%s</td></tr>'
        % (' class="member"' if mem else '', esc(nm),
           ' <span class="tag">합의</span>' if mem else '',
           x.get('trades'), pct(x.get('win_rate'), 1, sign=False), pct(x.get('avg')),
           pct((x.get('train') or {}).get('edge')), pct((x.get('test') or {}).get('edge')))
        for _, nm, x, mem in srows)

    k_table = '\n'.join(
        '<tr%s><td>%s</td><td class="n">%d</td><td class="n">%s</td><td class="n">%s</td>'
        '<td class="n">%s</td><td class="n">%s</td></tr>'
        % (' class="member"' if c['k'] == rule['k'] and c['scope'] == 'test' else '',
           '검증구간' if c['scope'] == 'test' else '전 구간', c['k'], c.get('trades'),
           pct(c.get('win_rate'), 1, sign=False), pct(c.get('avg')), pct(c.get('edge')))
        for c in sorted(cons, key=lambda c: (c['scope'] != 'test', c['k'])))

    return TEMPLATE % dict(derived(m, bt, g, gt, base, rule), **{
        'asof': esc(m['asof']),
        'generated': esc(doc['generated_at_kst']),
        'count': m['count'],
        # 제목은 **자료의 이름표**를 쓴다. 여기 또 적어 두면 시장을 늘릴 때
        # 한쪽만 고쳐져 「국내ETF」라 적힌 해외ETF 리포트가 나온다.
        'title': esc(m['label']),
        'history': MARKETS[MARKET]['history'] % {'count': m['count']},
        'scope': MARKETS[MARKET]['scope'] % {'count': m['count']},
        'k': rule['k'],
        'stop': rule['stop_loss_pct'],
        'members': esc(' · '.join(m['member_names'])),
        'n_members': len(m['members']),
        'buy': plan_rows(m['buy'], names, 'buy'),
        'concentration': concentration(m['buy']),
        'sell': plan_rows(m['sell'], names, 'sell'),
        'n_watch': len(m['watch_buy']),
        'trades': g.get('trades'),
        # **승률에는 부호를 붙이지 않는다.** 방향이 있는 수가 아니라서 +40.9%% 는
        # 「40.9%%p 올랐다」로 읽힌다. 초과수익·평균처럼 부호가 뜻을 갖는 칸과
        # 같은 서식을 쓴 것이 잘못이었다.
        'win': pct(g.get('win_rate'), 1, sign=False),
        'base_win': pct(base.get('win_rate'), 1, sign=False),
        'avg': pct(g.get('avg')),
        'base_avg': pct(base.get('avg')),
        'edge': pct(g.get('edge')),
        'test_trades': gt.get('trades'),
        'test_edge': pct(gt.get('edge')),
        'span_from': esc(uni.get('from')), 'span_to': esc(uni.get('to')),
        'split': esc(uni.get('split_at')),
        'cost': (asm.get('왕복비용_bp') or {}).get(MARKET),
        'entry': esc(rule['entry']),
        'exit': esc(rule['exit']),
        'price_note': esc(rule['price_note']),
        'weight_note': esc(rule['weight_note']),
        'strategy_table': strategy_table,
        'k_table': k_table,
        'watch_table': watch_rows(m['watch_buy'], names),
        'payload': json.dumps(payload(m, names, doc, derived(m, bt, g, gt, base, rule)),
                              ensure_ascii=False,
                              separators=(',', ':')).replace('</', '<\\/'),
        'built': datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
    })


# 이름에서 읽히는 노출. **이름만 본 것**이고 실제 보유 종목이나 상관은 재지 않는다 —
# 그 둘은 다른 말이라 리포트가 그렇게 적는다.
_EXPOSURE = [
    ('미국', ('미국', 'S&P', 'SP500', '나스닥', '다우', '러셀', '빅테크')),
    ('중국', ('중국', '차이나', 'CSI', '항셍', 'H지수')),
    ('일본', ('일본', '니케이', 'TOPIX')),
    ('인도', ('인도', '니프티')),
    ('베트남', ('베트남', 'VN30')),
    ('유럽', ('유럽', '유로', '독일')),
    ('글로벌·선진', ('글로벌', '선진', 'MSCI', '토탈')),
    ('채권', ('국고채', '회사채', '채권', '금리', 'SOFR', '단기자금')),
    ('금·원자재', ('금현물', '골드', '은선물', '원유', '원자재')),
    ('리츠·부동산', ('리츠', '부동산', '인프라')),
]


def concentration(plans):
    """매수 자리가 한쪽에 몰려 있는가.

    **목록이 길다고 분산이 아니다.** 열세 종을 샀는데 열 종이 미국 테크면 그건
    한 자리에 열세 번 건 것에 가깝다. 표만 보면 그 사실이 읽히지 않으므로
    표 아래에 적는다.

    가르는 잣대는 **이름에 든 말**이다. 실제 보유 종목이나 상관을 잰 것이 아니고,
    그렇게 적는다 — 이름으로 짐작한 것을 측정한 것처럼 말하지 않는다.
    """
    if len(plans) < 3:
        return ''
    hit = {}
    for p in plans:
        nm = (p.get('name') or '').upper()
        for label, keys in _EXPOSURE:
            if any(k.upper() in nm for k in keys):
                hit.setdefault(label, []).append(p['name'])
                break
    if not hit:
        return ''
    label, got = max(hit.items(), key=lambda kv: len(kv[1]))
    if len(got) * 2 < len(plans):          # 절반에 못 미치면 몰렸다고 하지 않는다
        return ''
    return ('<div class="warn"><p><b>매수 자리가 한쪽에 몰려 있습니다.</b> '
            '%d 종 가운데 <b>%d 종이 「%s」 노출</b>입니다. 목록이 길다고 분산이 '
            '아닙니다 — 그쪽이 흔들리면 함께 흔들립니다. 나누어 담을 생각이라면 '
            '이 점을 먼저 보십시오.</p>'
            '<p class="cap">가른 잣대는 <b>종목 이름에 든 말</b>입니다. 실제 보유 '
            '종목이나 수익률 상관을 잰 것이 아닙니다.</p></div>'
            % (len(plans), len(got), esc(label)))


def derived(m, bt, g, gt, base, rule):
    """문장 안에 들어갈 **말**을 수에서 만든다.

    「다섯 번 중 세 번」·「가장 두껍다」·「K=3 은 거래가 줄어 말할 수 없다」 같은
    말은 숫자가 아니라서 손으로 적기 쉽고, 그래서 자료가 바뀌면 **조용히 거짓이
    된다.** 실제로 그랬다 — 우주를 넓히자 손절 비중이 3.4% 인데 「다섯 번 중
    세 번은 손절」이 그대로 인쇄될 뻔했다.

    그래서 말도 여기서 셈한다. 자료가 바뀌면 문장이 함께 바뀐다.
    """
    k = rule['k']
    out = {}

    # 「다섯 번 중 몇 번이 지는 거래인가」 — 승률에서 바로 나온다.
    wr = g.get('win_rate')
    out['lose5'] = '—' if wr is None else '%.1f' % ((100.0 - wr) / 20.0)

    # 끝나는 자리 — 손절인가 청산 신호인가. **이것을 짐작하지 않는다.**
    mix = g.get('exit_mix') or {}
    tot = sum(mix.values()) or 1
    stop_n = sum(v for kk, v in mix.items() if kk.startswith('손절'))
    sig_n = mix.get('청산신호', 0)
    out['exit_stop'] = '%.1f%%' % (stop_n / tot * 100.0)
    out['exit_signal'] = '%.1f%%' % (sig_n / tot * 100.0)

    # **「자주 사고 자주 파는」·「드물게 닿는」·「얇습니다」는 수가 아니라 말이다.**
    # 손으로 적으면 시장이 바뀔 때 조용히 거짓이 된다 — 실제로 국내상장 해외ETF
    # 에서 보유 13 거래일이 「자주 사고 자주 파는」으로, 초과수익 2위가
    # 「얇습니다」로 인쇄될 뻔했다. 문턱은 **여기 적어 두고** 고른 것이다.
    hm = g.get('hold_median') or 0
    out['hold_note'] = ('자주 사고 자주 파는 방식' if hm <= 5
                        else '며칠에서 몇 주를 들고 가는 방식' if hm <= 20
                        else '몇 달을 들고 가는 방식')
    sp = (stop_n / tot * 100.0)
    out['stop_note'] = ('드물게 닿는' if sp < 5 else '열에 한 번쯤 닿는' if sp < 20
                        else '자주 닿는')

    out['avg_win'] = pct(g.get('avg_win'))
    out['avg_loss'] = pct(g.get('avg_loss'))
    out['hold'] = g.get('hold_median')

    # 「한 번 지면 몇 번 이긴 것이 날아가는가」 — 승률만 보면 안 보이는 수다.
    aw, al = g.get('avg_win'), g.get('avg_loss')
    if aw and al:
        r = abs(al) / aw
        out['size_note'] = ('한 번 지면 이긴 것 %.1f 번이 날아갑니다.' % r if r >= 1
                            else '한 번 져도 이긴 것 %.1f 번이면 메워집니다.' % r)
    else:
        out['size_note'] = ''

    # 다섯 시장 가운데 이 시장이 몇째인가 — **순위를 손으로 적지 않는다.**
    edges = []
    for c in bt['consensus']:
        if c['k'] == k and c.get('scope') == 'test' and c.get('edge') is not None:
            edges.append((c['edge'], c['market']))
    edges.sort(reverse=True)
    mine = next((i for i, (_, mk) in enumerate(edges) if mk == MARKET), None)
    if mine is None or len(edges) < 2:
        out['rank_note'] = ''
        out['edge_note'] = '이 시장의 초과수익이 얼마나 두꺼운지는 잴 수 없었습니다.'
    else:
        labels = {mk: (bt['universe'].get(mk) or {}).get('label', mk) for _, mk in edges}
        best = labels[edges[0][1]]
        out['rank_note'] = ('같은 잣대로 잰 %d 개 시장 가운데 <b>%d번째</b>입니다 '
                            '(가장 두꺼운 곳은 %s %+.2f%%p).'
                            % (len(edges), mine + 1, esc(best), edges[0][0]))
        # 위에서 몇째인가로 머리말을 가른다. 앞 두 자리면 「두꺼운 축」,
        # 그 아래면 「얇습니다」. 자리를 손으로 적지 않는다.
        out['edge_note'] = ('이 시장은 근거가 두꺼운 축입니다.' if mine < 2
                            else '이 시장의 초과수익은 얇습니다.')

    # K 를 왜 이 값으로 두는가 — 표의 수에서 문장을 만든다.
    per_k = {c['k']: c for c in bt['consensus']
             if c['market'] == MARKET and c.get('scope') == 'test'}
    here = per_k.get(k)
    better = [kk for kk, c in sorted(per_k.items())
              if kk != k and c.get('edge') is not None and here
              and c['edge'] > (here.get('edge') or 0) and (c.get('trades') or 0) >= 100]
    why = ['K는 같은 날 겹친 전략의 수입니다. 이 리포트는 <b>K=%d</b> 를 씁니다.' % k]
    if better:
        # **더 좋아 보이는 칸이 있으면 숨기지 않는다.** 숨기면 표를 본 사람이
        # 먼저 알아차리고, 그때는 나머지 문장도 믿지 않게 된다.
        bk = better[-1]
        others = [(c['edge'], (bt['universe'].get(c['market']) or {}).get('label', c['market']))
                  for c in bt['consensus']
                  if c['k'] == bk and c.get('scope') == 'test' and c.get('edge') is not None]
        neg = [nm for e, nm in others if e <= 0]
        why.append('이 시장만 보면 <b>K=%d %s 더 높습니다</b>(%+.2f%%p · %s 거래). '
                   '그래도 K=%d 를 쓰는 까닭은, 시장마다 가장 좋아 보이는 K 를 골라 쓰면 '
                   '그건 <b>자료에 맞춰 깎은 것</b>이 되기 때문입니다.'
                   % (bk, josa(bk, '이', '가'), per_k[bk]['edge'],
                      per_k[bk]['trades'], k))
        if neg:
            why.append('실제로 K=%d %s %s 에서 음수입니다 — 한 시장에서 좋아 보인 값이 '
                       '다른 시장에서 뒤집힙니다. K=%d %s 다섯 시장에 두루 견디는 자리로 '
                       '고른 것입니다.' % (bk, josa(bk, '은', '는'), esc(' · '.join(neg)),
                                      k, josa(k, '은', '는')))
    else:
        why.append('K 를 낮추면 초과수익이 얇아지고 높이면 거래가 줄어듭니다. '
                   'K=%d 가 둘을 함께 갖춘 자리입니다.' % k)
    out['k_why'] = ' '.join(why)
    return out


def watch_rows(plans, names):
    """관찰 종목. **본문에서 접어 둔다** — 사는 자리가 아니기 때문이다.

    빼 버리지는 않는다. 한 전략만 켜진 자리도 며칠 뒤 합의로 자라는 일이 있고,
    없는 것과 접어 둔 것은 다르다.
    """
    if not plans:
        return '<p class="none">오늘은 관찰 종목이 없습니다.</p>'
    out = ['<div class="tblwrap"><table class="data"><thead><tr>'
           '<th>종목</th><th>코드</th><th class="n">기준 종가</th>'
           '<th class="n">손절 기준</th><th>켜진 전략</th>'
           '</tr></thead><tbody>']
    for p in plans:
        # 관찰은 합의가 아니므로 켜진 것을 다 보여 준다 — 무엇이 켜졌는지가
        # 곧 이 칸의 내용이다. 대신 「합의가 아니다」를 표 위에 적어 둔다.
        hits = ' · '.join(names.get(s, s) for s in (p['buy_hits'] + p.get('other_buy', [])))
        out.append('<tr><td class="nm">%s</td><td class="mono">%s</td>'
                   '<td class="n">%s</td><td class="n">%s</td><td>%s</td></tr>'
                   % (esc(p['name']), esc(p['code']), won(p['close']),
                      won(p['stop_ref']), esc(hits)))
    return '\n'.join(out) + '</tbody></table></div>'


def payload(m, names, doc, dv):
    """복사·저장 단추가 쓰는 자료. **화면에 찍은 것과 같은 것을 담는다.**

    여기서 따로 셈하면 본문의 수와 갈라진다.
    """
    # **합의 멤버만 싣는다.** `other_buy` 에는 검증을 통과하지 못한 전략이 들어
    # 있는데(「강한 종가」 따위), 그것을 이름표 없이 같은 줄에 붙이면 복사한 글을
    # 받는 사람은 그것도 근거인 줄 읽는다. 본문 표가 멤버만 보여 주므로 여기도
    # 같아야 한다 — 같은 파일 안에서 두 수가 갈리면 어느 쪽도 믿을 수 없다.
    def rows(key, hitkey):
        return [{'name': p['name'], 'code': p['code'], 'close': p['close'],
                 'chg': p['change_pct'], 'stop': p['stop_ref'], 'w': p['weight_hint'],
                 'hits': [names.get(s, s) for s in p[hitkey]]}
                for p in m[key]]
    return {
        'label': m['label'], 'asof': m['asof'],
        'csv_slug': MARKETS[MARKET]['csv'],
        'buy': rows('buy', 'buy_hits'), 'sell': rows('sell', 'sell_hits'),
        'watch': rows('watch_buy', 'buy_hits'),
        'win': (m['consensus_full'] or {}).get('win_rate'),
        # 복사문에 들어갈 수도 **본문과 같은 셈에서** 가져온다. 여기서 따로
        # 셈하면 화면에는 맞는 말이 메신저에서는 틀린 말이 된다.
        'base_win': ((m['consensus_full'] or {}).get('base') or {}).get('win_rate'),
        'lose5': dv.get('lose5'),
        'test_edge': (m['consensus_test'] or {}).get('edge'),
        'entry': doc['rule']['entry'], 'stop_pct': doc['rule']['stop_loss_pct'],
    }


# **raw 문자열이어야 한다.** 안에 든 \n · \r\n · \ufeff 는 자바스크립트의
# 이스케이프인데, 보통 문자열로 두면 파이썬이 먼저 먹어 진짜 줄바꿈으로 바꿔
# 버린다. 그러면 생성된 쪽에서 문자열이 줄 가운데서 끊겨 구문 오류가 난다.
TEMPLATE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>%(title)s 매매 타이밍 — %(asof)s</title>
<!--
  scripts/build_kr_etf_report.py 가 만든 판이다. 손으로 고치지 않는다 —
  다음 번에 다시 만들면 덮인다.

  **층이 둘이다.** 「근거」 앞까지가 건넬 수 있는 층이고, 그 뒤는 판단하는
  사람이 보는 대목이다. 경계가 종이에서도 보이도록 띠를 넣어 두었다.
-->
<style>
  :root {
    --orange: #F58220; --blue: #043B72; --soft: #FAB072;
    --canvas: #FFFFFF; --surface: #F7F8FA; --tint: #ECEFF4;
    --hair: #CDCECB; --hair-soft: #E5E4E1; --highlight: #D7D7D7;
    --ink: #1A1A1A; --body: #3D3D3D; --muted: #6C6C6C;
    --error: #C62828; --success: #2E8540;
    /* 사내 PC 에 흔히 있는 것들로 사슬을 세운다. CDN 을 걸지 않는 까닭은
       대본 머리말에 적어 두었다. */
    --kr: 'Spoqa Han Sans Neo', 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕',
          'Apple SD Gothic Neo', sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: var(--kr); background: var(--canvas); color: var(--body);
    font-size: 19px; line-height: 1.65; -webkit-font-smoothing: antialiased;
  }
  .page { max-width: 1040px; margin: 0 auto; padding: 0 32px 96px; }

  .hero { background: var(--orange); color: #fff; padding: 56px 0 48px; margin-bottom: 56px; }
  .hero .page { padding-bottom: 0; }
  .hero .tag {
    display: inline-block; border: 1px solid rgba(255,255,255,.55);
    padding: 3px 10px; font-size: 14px; letter-spacing: .4px; margin-bottom: 19px;
  }
  .hero h1 { font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -.5px; margin: 0; }
  .hero .sub { font-size: 22px; margin-top: 14px; opacity: .95; }

  .section { margin-top: 72px; }
  .section-rule { height: 1px; background: var(--orange); margin-bottom: 19px; }
  .section-title { font-size: 26px; font-weight: 700; color: var(--ink); margin: 0 0 19px; }
  h3 { font-size: 22px; font-weight: 600; color: var(--ink); margin: 38px 0 14px; }
  p { margin: 0 0 19px; }
  .lead { font-size: 19px; color: var(--body); }
  .none { color: var(--muted); font-size: 17px; }
  .cap { font-size: 14px; color: var(--muted); letter-spacing: .2px; }
  b, strong { color: var(--ink); font-weight: 700; }

  /* **표만 가로로 밀리게 한다.** 감싸지 않으면 쪽 전체가 밀려 좁은 화면에서
     본문까지 잘린다. docs/kis-timing 에서 먼저 겪고 고친 자리다. */
  .tblwrap { overflow-x: auto; margin: 0 0 14px; }
  table.data { border-collapse: collapse; width: 100%%; font-size: 17px; margin: 0 0 14px;
               border: 1px solid var(--hair); }
  table.data th {
    background: var(--soft); color: var(--ink); font-weight: 700; font-size: 16px;
    text-align: left; padding: 11px 13px; border-bottom: 1px solid var(--hair);
  }
  table.data td { padding: 11px 13px; border-bottom: 1px solid var(--hair-soft); }
  table.data tbody tr:last-child td { border-bottom: 0; }
  table.data .n { text-align: right; font-variant-numeric: tabular-nums; }
  table.data td.nm { color: var(--ink); font-weight: 600; }
  table.data td.mono { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 16px; }
  table.data td.hl { background: var(--highlight); font-weight: 700; color: var(--ink); }
  table.data tr.member td { background: var(--surface); }
  .tag { font-size: 13px; background: var(--blue); color: #fff; padding: 1px 7px; font-weight: 500; }

  .stats { display: flex; gap: 14px; flex-wrap: wrap; margin: 0 0 28px; }
  .stat { border: 1px solid var(--hair); padding: 19px 22px; min-width: 190px; flex: 1; }
  .stat .lb { font-size: 16px; font-weight: 500; color: var(--muted); letter-spacing: .6px; }
  .stat .v { font-size: 38px; font-weight: 700; line-height: 1.1; margin-top: 6px;
             font-variant-numeric: tabular-nums; }
  .stat .v.o { color: var(--orange); } .stat .v.b { color: var(--blue); }
  .stat .note { font-size: 14px; color: var(--muted); margin-top: 6px; }

  .callout { background: var(--tint); border-radius: 4px; padding: 28px 32px; margin: 0 0 28px; }
  .callout p:last-child { margin-bottom: 0; }
  .warn { border-left: 3px solid var(--error); background: var(--surface);
          padding: 19px 24px; margin: 0 0 28px; border-radius: 0 4px 4px 0; }
  .warn p:last-child { margin-bottom: 0; }

  /* 층의 경계 — 종이에서도 보여야 한다 */
  .divider { margin: 96px 0 0; border-top: 3px double var(--hair); padding-top: 19px; }
  .divider .lb { font-size: 16px; color: var(--muted); letter-spacing: .6px; }

  /* 단추 — 미래에셋 기준(모서리 2px, 이모지 없음). 인쇄물에는 나가지 않는다. */
  .tools { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
  .tools button {
    font-family: var(--kr); font-size: 16px; font-weight: 500;
    color: #fff; background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.55); border-radius: 2px;
    padding: 9px 17px; cursor: pointer; letter-spacing: .3px;
  }
  .tools button:hover { background: rgba(255,255,255,.26); }
  .tools button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .tools .said { font-size: 15px; color: #fff; align-self: center; opacity: 0; }
  .tools .said.on { opacity: .95; }

  details.watch { margin: 14px 0 0; border: 1px solid var(--hair); border-radius: 4px; }
  details.watch > summary {
    cursor: pointer; padding: 14px 19px; font-size: 17px; color: var(--ink);
    font-weight: 600; list-style: none;
  }
  details.watch > summary::-webkit-details-marker { display: none; }
  details.watch > summary::before { content: "+ "; color: var(--orange); font-weight: 700; }
  details.watch[open] > summary::before { content: "- "; }
  details.watch .inner { padding: 0 19px 14px; }

  footer { margin-top: 72px; padding-top: 19px; border-top: 1px solid var(--hair);
           font-size: 14px; color: var(--muted); }

  @media (max-width: 768px) {
    body { font-size: 17px; }
    .hero h1 { font-size: 34px; } .hero .sub { font-size: 19px; }
    .page { padding: 0 20px 64px; }
    .section { margin-top: 56px; }
    .stat .v { font-size: 30px; }
    table.data { font-size: 15px; }
  }

  @media print {
    @page { margin: 14mm; }
    body { font-size: 13pt; line-height: 1.45; }
    .page { max-width: 100%%; padding: 0; }
    .hero { padding: 24px 0 20px; margin-bottom: 28px;
            -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .hero h1 { font-size: 26pt; } .hero .sub { font-size: 13pt; }
    .section { margin-top: 26px; page-break-inside: avoid; }
    .section-title, h3 { page-break-after: avoid; }
    table.data, .stat, .callout, .warn { page-break-inside: avoid; }
    .tblwrap { overflow: visible; }
    table.data th, table.data td.hl, .hero {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .divider { page-break-before: always; margin-top: 0; }
    .tools { display: none !important; }
    /* **접힌 것을 종이에서는 편다.** 인쇄물은 눌러 볼 수 없다. */
    details.watch { border: 0; }
    details.watch > summary { padding-left: 0; }
    details.watch .inner { padding: 0; }
  }
</style>
</head>
<body>

<div class="hero">
  <div class="page">
    <span class="tag">사내한 · 정보 제공 목적</span>
    <h1>%(title)s 매매 타이밍</h1>
    <div class="sub">%(asof)s 종가 기준 · 대상 %(count)d 종</div>
    <div class="tools">
      <button id="btnPrint" type="button">인쇄 · PDF 저장</button>
      <button id="btnCsv" type="button">CSV 저장</button>
      <button id="btnCopy" type="button">요약 복사</button>
      <span class="said" id="said" role="status" aria-live="polite"></span>
    </div>
  </div>
</div>

<div class="page">

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">오늘의 자리</h2>
    <p class="lead">
      한국투자증권 전략빌더의 기본 전략 가운데 <b>검증을 통과한 %(n_members)d 종</b>을
      쓰고, 그 중 <b>%(k)d 종 이상이 같은 날 같은 종목을 가리킬 때</b>만 자리로 냅니다.
      진입은 %(entry)s 입니다.
    </p>
    <div class="warn">
      <p>
        <b>먼저 알아야 할 것 — %(edge_note)s</b> 검증구간
        합의 K=%(k)d 의 초과수익이 <b>%(test_edge)s</b>(%(test_trades)s 거래)입니다.
        %(rank_note)s
      </p>
      <p class="cap">%(history)s</p>
    </div>

    <h3>매수</h3>
    %(buy)s
    %(concentration)s
    <p class="cap">%(price_note)s %(weight_note)s</p>

    <h3>청산 — 들고 있다면 내려놓을 자리</h3>
    %(sell)s

    <details class="watch">
      <summary>관찰 — 한 전략만 켜진 자리 %(n_watch)d 종 (합의가 아닙니다)</summary>
      <div class="inner">
        <p class="cap">
          신호 하나로는 백테스트가 초과수익을 거의 내지 못했습니다. <b>사는 자리가
          아니라 며칠 더 보는 자리</b>로 읽으십시오. 며칠 뒤 다른 전략이 겹치면
          합의로 올라옵니다.
        </p>
        %(watch_table)s
      </div>
    </details>
  </div>

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">무엇을 보고 그렇게 말하는가</h2>
    <p>
      쓰는 전략은 <b>%(members)s</b> 입니다. 서로 다른 것을 봅니다 — 추세를 보는 것,
      되돌림을 보는 것, 돌파를 보는 것. 서로 다른 잣대가 같은 날 같은 종목을 가리키면
      그건 한 잣대의 우연이 아닐 공산이 큽니다.
    </p>
    <p>
      남길 전략은 <b>자료의 앞 구간에서 고르고 뒤 구간에서 다시 재어</b> 두 구간 모두
      대조군을 이긴 것만 씁니다. 그러지 않으면 「이미 이긴 것만 골랐다」가 됩니다.
    </p>
    <div class="callout">
      <p><b>청산은 셋 중 먼저 오는 것입니다.</b> %(exit)s</p>
    </div>
  </div>

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">이 숫자를 어떻게 읽어야 하는가</h2>

    <div class="stats">
      <div class="stat">
        <div class="lb">승률</div>
        <div class="v b">%(win)s</div>
        <div class="note">아무 날에나 샀을 때 %(base_win)s</div>
      </div>
      <div class="stat">
        <div class="lb">거래당 평균</div>
        <div class="v o">%(avg)s</div>
        <div class="note">아무 날에나 샀을 때 %(base_avg)s</div>
      </div>
      <div class="stat">
        <div class="lb">초과수익</div>
        <div class="v o">%(edge)s</div>
        <div class="note">%(trades)s 거래 · 전 구간</div>
      </div>
    </div>

    <div class="warn">
      <p>
        <b>승률을 높여 주는 전략이 아닙니다 — 낮춥니다.</b> 승률 %(win)s 는 아무 날에나
        산 것(%(base_win)s)보다 낮습니다. <b>다섯 번 중 %(lose5)s 번은 지는 거래입니다.</b>
      </p>
      <p>
        <b>지는 자리가 손절은 아닙니다.</b> 끝난 거래의 %(exit_signal)s 는 청산 신호로,
        손절로 잘린 것은 %(exit_stop)s 입니다. 손절 %(stop)s%% 는 %(stop_note)s
        마지막 방벽이지 이 방식이 지는 주된 자리가 아닙니다.
      </p>
      <p>
        좋아지는 것은 <b>한 번의 크기</b>입니다 — 이길 때 %(avg_win)s, 질 때 %(avg_loss)s.
        %(size_note)s 평균 보유는 %(hold)s 거래일이라 <b>%(hold_note)s</b>입니다.
        <b>연속으로 지는 구간을 견디지 못하면 성적이 나오지 않습니다</b> — 그 구간에서
        규칙을 버리면 이기는 한 번을 놓치고 지는 쪽만 갖게 됩니다.
      </p>
    </div>

    <p>
      숫자는 <b>거래당</b>이고 연간이 아닙니다. 대조군은 「같은 시장·같은 기간에 아무
      날에나 사서 같은 기간 들고 있기」이며, <b>매수 후 보유와 견준 것이 아닙니다.</b>
      거래비용은 왕복 %(cost)sbp 로 가정했고 실제 계좌의 것과 다릅니다.
    </p>
  </div>

  <div class="divider">
    <div class="lb">여기까지가 건넬 수 있는 층입니다. 아래는 판단하는 사람이 보는 근거입니다.</div>
  </div>

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">근거 · 전략별 성적</h2>
    <p class="cap">
      초과수익은 그 전략의 거래당 평균수익에서 같은 구간·같은 보유기간의 무작위 진입
      평균을 뺀 값(%%p)입니다. 음영이 합의에 쓰는 전략입니다.
    </p>
    <div class="tblwrap"><table class="data">
      <thead><tr><th>전략</th><th class="n">거래</th><th class="n">승률</th>
      <th class="n">평균</th><th class="n">학습 초과</th><th class="n">검증 초과</th></tr></thead>
      <tbody>
%(strategy_table)s
      </tbody>
    </table></div>
    <p class="cap">
      학습·검증 두 구간 모두 초과수익이 양수인 것만 남깁니다. 한 구간에서 크게 이긴
      것은 자주 우연이지만, 두 장세에서 모두 이긴 것은 덜 그렇습니다.
    </p>
  </div>

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">근거 · 몇 개가 겹쳐야 사는가</h2>
    <p class="cap">
      K는 같은 날 같은 종목에 매수 신호를 낸 전략의 수입니다. <b>검증구간</b>은 앞
      구간만 보고 고른 조합을 뒤 구간에서 다시 잰 것이라 성적을 미리 알고 고른 효과가
      없습니다 — 믿을 것은 그쪽입니다. 음영이 이 리포트가 쓰는 자리입니다.
    </p>
    <div class="tblwrap"><table class="data">
      <thead><tr><th>구간</th><th class="n">K</th><th class="n">거래</th>
      <th class="n">승률</th><th class="n">평균</th><th class="n">초과수익</th></tr></thead>
      <tbody>
%(k_table)s
      </tbody>
    </table></div>
    <p class="cap">%(k_why)s</p>
  </div>

  <div class="section">
    <div class="section-rule"></div>
    <h2 class="section-title">가정과 한계</h2>
    <p>
      자료 구간은 <b>%(span_from)s ~ %(span_to)s</b> 이고 학습/검증 경계는
      <b>%(split)s</b> 입니다. 검증구간 성적은 %(test_trades)s 거래에 초과수익
      %(test_edge)s 였습니다.
    </p>
    <p>
      매매는 이렇게 흉내냈습니다 — 신호는 종가로 확정되고 매수는 다음 거래일 시가에
      일어납니다. 손절·익절은 장중 고저로 보고, 같은 봉에서 둘 다 닿으면 <b>손절 쪽</b>을
      택합니다. 일봉으로는 어느 쪽이 먼저였는지 알 수 없고, 모를 때 유리한 쪽을 고르면
      성적이 부풉니다.
    </p>
    <p>%(scope)s</p>
    <p>
      초과수익은 <b>거래비용 가정에 흔들리지 않습니다</b> — 대조군도 같은 비용을 내기
      때문입니다. 다만 <b>손에 남는 수익은 흔들립니다.</b> 평균 보유가 %(hold)s 거래일이라,
      왕복 %(cost)sbp 가정이 실제보다 낮으면 거래당 평균 %(avg)s 는 그만큼 줄어듭니다.
      초과수익이 얇을수록 이 가정이 결론을 좌우합니다.
    </p>
  </div>

  <footer>
    정보 제공 목적의 사내 참고 자료이며 <b>투자 권유가 아닙니다.</b> 과거 일봉으로 잰
    성적이고, 같은 규칙이 앞으로도 같은 성적을 낸다는 보장은 없습니다. 거래비용·세금은
    가정값이며 실제 계좌의 것과 다릅니다. 매매 판단과 그 결과는 전적으로 본인의
    책임입니다. <b>고객에게 보여주는 자료로 쓸 경우 준법감시 부서 확인이 필요합니다.</b>
    <br /><br />
    산출 %(generated)s · 리포트 생성 %(built)s ·
    전략 원본 한국투자증권 오픈API 공식 저장소(open-trading-api)
  </footer>

</div>

<script id="report-data" type="application/json">%(payload)s</script>
<script>
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('report-data').textContent);
  var said = document.getElementById('said');
  function say(t) {
    said.textContent = t; said.className = 'said on';
    setTimeout(function () { said.className = 'said'; }, 2600);
  }
  function won(x) { return x == null ? '-' : Number(x).toLocaleString('ko-KR') + '원'; }

  document.getElementById('btnPrint').onclick = function () { window.print(); };

  /* **요약은 경고를 달고 나간다.** 메신저에 붙여 넣는 순간 이 글은 원래 자리를
     떠나는데, 종목과 가격만 남고 승률과 초과수익의 두께가 빠지면 그건 줄인
     게 아니라 속인 것이 된다. **여기 적히는 수는 모두 자료에서 온다** — 손으로
     적어 두면 우주가 바뀔 때 조용히 거짓이 된다. 실제로 한 번 그랬다. */
  function summary() {
    var L = [D.label + ' 매매 타이밍 (' + D.asof + ' 종가 기준)', ''];
    if (D.buy.length) {
      D.buy.forEach(function (p) {
        L.push('[매수] ' + p.name + ' (' + p.code + ')');
        L.push('  기준 종가 ' + won(p.close) + ' / 손절 ' + won(p.stop) +
               ' (-' + D.stop_pct + '%%)');
        L.push('  겹친 전략: ' + p.hits.join(' + '));
      });
    } else { L.push('[매수] 오늘은 합의 매수 자리가 없습니다.'); }
    if (D.sell.length) {
      L.push('');
      D.sell.forEach(function (p) {
        L.push('[청산] ' + p.name + ' (' + p.code + ') 기준 종가 ' + won(p.close));
      });
    }
    L.push('');
    L.push('※ 진입은 ' + D.entry + '. 화면의 손절가는 신호일 종가 기준입니다.');
    if (D.win != null) {
      L.push('※ 이 방식의 승률은 ' + D.win + '%% 입니다 (아무 날에나 사면 ' +
             D.base_win + '%%) — 다섯 번 중 ' + D.lose5 + ' 번은 지는 거래입니다.');
    }
    if (D.test_edge != null) {
      L.push('※ 검증구간 초과수익은 ' + D.test_edge + '%%p 입니다 — 얇습니다. ' +
             '거래비용 가정이 실제보다 낮으면 손에 남는 것은 더 줄어듭니다.');
    }
    L.push('※ 정보 제공 목적의 사내 참고 자료이며 투자 권유가 아닙니다.');
    return L.join('\n');
  }

  document.getElementById('btnCopy').onclick = function () {
    var t = summary();
    function fallback() {
      /* 사내 PC 는 클립보드 권한이 막혀 있는 일이 잦다. 조용히 실패하면
         눌렀는데 아무 일도 안 일어난 것처럼 보이므로, 골라 둔 채로 알린다. */
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      say(ok ? '요약을 복사했습니다' : '복사가 막혀 있습니다 — 아래 상자에서 직접 복사하십시오');
      if (!ok) {
        var box = document.createElement('textarea');
        box.value = t; box.rows = 12;
        box.style.cssText = 'width:100%%;margin-top:14px;font:15px/1.5 inherit;' +
          'border:1px solid #CDCECB;border-radius:2px;padding:12px;';
        said.parentNode.parentNode.appendChild(box); box.select();
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        say('요약을 복사했습니다');
      }).catch(fallback);
    } else { fallback(); }
  };

  /* CSV — 엑셀이 한글을 깨뜨리지 않게 BOM 을 붙인다. 코드는 앞자리 0 이 날아가므로
     따옴표로 싸도 소용없고, 이름이 함께 실려 있으니 코드가 망가져도 종목은 안다. */
  function cell(v) {
    if (v == null) return '';
    var s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  document.getElementById('btnCsv').onclick = function () {
    var rows = [['구분', '종목', '종목코드', '기준일', '종가', '등락(%%)', '손절 기준',
                 '비중(%%)', '겹친 전략']];
    [['합의 매수', D.buy], ['합의 청산', D.sell], ['관찰', D.watch]].forEach(function (g) {
      g[1].forEach(function (p) {
        rows.push([g[0], p.name, p.code, D.asof, p.close, p.chg, p.stop, p.w,
                   p.hits.join(' + ')]);
      });
    });
    var csv = rows.map(function (r) { return r.map(cell).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv],
             { type: 'text/csv;charset=utf-8' }));
    /* 파일 이름은 아스키로 — 한글 이름은 환경에 따라 통째로 무시된다. */
    a.download = D.csv_slug + '_' + D.asof + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    say('CSV 를 저장했습니다');
  };
})();
</script>
</body>
</html>
"""


def main(argv=None):
    global MARKET
    ap = argparse.ArgumentParser()
    ap.add_argument('--market', default=DEFAULT_MARKET, choices=sorted(MARKETS))
    ap.add_argument('--out', default='')
    a = ap.parse_args(argv)
    MARKET = a.market
    out = a.out or os.path.join(ROOT, '%s-report.html' % MARKETS[MARKET]['slug'])

    for p in (LATEST, BACKTEST):
        if not os.path.exists(p):
            sys.stderr.write('없음: %s\n' % os.path.relpath(p, ROOT))
            return 1
    doc = json.load(open(LATEST, encoding='utf-8'))
    bt = json.load(open(BACKTEST, encoding='utf-8'))

    m = doc['markets'].get(MARKET)
    if not m:
        sys.stderr.write('%s 가 산출물에 없습니다\n' % MARKET)
        return 1
    # **멤버가 성적표와 어긋나면 멈춘다.** 앞면의 종목과 뒷면의 근거가 서로 다른
    # 것을 가리키는 판을 내보내면, 그건 리포트가 아니라 잘못된 근거다.
    want = (bt.get('picked_live') or {}).get(MARKET) or []
    if m['members'] != want:
        sys.stderr.write('멤버가 성적표와 다릅니다 (%s ≠ %s) — '
                         'build_kis_timing.py 를 다시 돌리십시오\n' % (m['members'], want))
        return 1

    html = build(doc, bt)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('썼다: %s (%.0f KB · %s · %s 기준 · 매수 %d · 청산 %d · 관찰 %d)'
          % (os.path.relpath(out, ROOT), os.path.getsize(out) / 1024.0,
             m['label'], m['asof'], len(m['buy']), len(m['sell']), len(m['watch_buy'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
