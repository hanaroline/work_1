# -*- coding: utf-8 -*-
"""자산배분 ETF 종목 목록 (2026-09-18 기준 표).

사람이 준 표를 그대로 옮겨 적은 것이다. **여기서 지어낸 것은 하나도 없다** —
번호·구분·테마·티커·이름 모두 표에 적힌 대로다.

ETN 여섯 종목(Q520074/78/80/72/66/89)은 **뺐다**. 지시대로다.

왜 티커 후보를 여러 개 두는가
──────────────────────────────────────────────────────────────────────
해외상장분은 야후 심볼이 표의 티커와 다를 수 있다. 도쿄 상장은 `.T`, 홍콩은
`.HK`, 호주는 `.AX` 가 붙는다. 그리고 **같은 글자가 다른 것을 가리키는 일**이
있다 — `GOLD` 는 야후에서 Barrick(금광 회사 주식)이고, 표가 말하는 Global X
Physical Gold ETF 는 호주 상장 `GOLD.AX` 다. 후보를 차례로 시험하되
**받아 온 이름과 종목 유형(ETF인가 주식인가)을 반드시 맞대 본다.** 조용히 엉뚱한
것을 분석하는 것이 가장 나쁘다.

`expect` 는 야후가 돌려준 이름에 들어 있어야 할 낱말이다. 하나도 안 겹치면
검산기가 잡는다.
"""

# (번호, 상장지, 구분, 테마, 표의 티커, 표의 이름, 야후 심볼 후보, 이름 낱말)
ROWS = [
    # ── 국내상장 ETF : 지수/지역 ───────────────────────────────────────
    (1, 'KR', '지수/지역', '미국/글로벌', 'A133690', 'TIGER 미국나스닥100'),
    (2, 'KR', '지수/지역', '미국/글로벌', 'A360750', 'TIGER 미국S&P500'),
    (3, 'KR', '지수/지역', '미국/글로벌', 'A448290', 'TIGER 미국S&P500TR(H)'),
    (4, 'KR', '지수/지역', '미국/글로벌', 'A448300', 'TIGER 미국나스닥100TR(H)'),
    (5, 'KR', '지수/지역', '글로벌 분산투자', 'A0060H0', 'TIGER 글로벌토탈스탁액티브'),
    (6, 'KR', '지수/지역', '인도', 'A453870', 'TIGER 인도니프티50'),
    (7, 'KR', '지수/지역', '일본', 'A241180', 'TIGER 일본니케이225'),
    (8, 'KR', '지수/지역', '일본', 'A465660', 'TIGER 일본반도체FACTSET'),
    (9, 'KR', '지수/지역', '일본', 'A469160', 'ACE 일본반도체'),
    (10, 'KR', '지수/지역', '중국', 'A0047A0', 'TIGER 차이나테크TOP10'),
    (11, 'KR', '지수/지역', '중국', 'A0053L0', 'TIGER 차이나휴머노이드로봇'),
    (12, 'KR', '지수/지역', '중국', 'A396520', 'TIGER 차이나반도체FACTSET'),
    (13, 'KR', '지수/지역', '중국', 'A0043Y0', 'TIME 차이나AI테크액티브'),
    (14, 'KR', '지수/지역', '중국', 'A414780', 'TIGER 차이나과창판STAR50(합성)'),
    (15, 'KR', '지수/지역', '중국', 'A416090', 'ACE 중국과창판STAR50'),
    # ── 국내상장 ETF : 글로벌테마 ─────────────────────────────────────
    (16, 'KR', '글로벌테마', '글로벌배당', 'A458730', 'TIGER 미국배당다우존스'),
    (17, 'KR', '글로벌테마', '글로벌배당', 'A452360', 'SOL 미국배당다우존스(H)'),
    (18, 'KR', '글로벌테마', '글로벌배당', 'A490490', 'SOL 미국배당미국채혼합50'),
    (19, 'KR', '글로벌테마', '빅테크', 'A381170', 'TIGER 미국테크TOP10 INDXX'),
    (20, 'KR', '글로벌테마', '반도체&A.I.', 'A466950', 'TIGER 글로벌AI액티브'),
    (21, 'KR', '글로벌테마', '반도체&A.I.', 'A381180', 'TIGER 미국필라델피아반도체나스닥'),
    (22, 'KR', '글로벌테마', '반도체&A.I.', 'A469060', 'RISE 미국반도체NYSE'),
    (23, 'KR', '글로벌테마', '원자력&전력인프라', 'A442320', 'RISE 글로벌원자력'),
    (24, 'KR', '글로벌테마', '원자력&전력인프라', 'A491010', 'TIGER 글로벌AI전력인프라액티브'),
    (25, 'KR', '글로벌테마', '우주/방산', 'A0183J0', 'TIGER 미국우주테크'),
    (26, 'KR', '글로벌테마', '우주/방산', 'A494840', 'TIGER 미국방산TOP10'),
    (27, 'KR', '글로벌테마', '헬스케어&바이오텍', 'A203780', 'TIGER 미국나스닥바이오'),
    (28, 'KR', '글로벌테마', '채권형', 'A302190', 'TIGER 중장기국채'),
    (29, 'KR', '글로벌테마', '채권형', 'A438330', 'TIGER 우량회사채액티브'),
    (30, 'KR', '글로벌테마', '채권형', 'A458260', 'TIGER 미국투자등급회사채액티브(H)'),
    # ── 국내상장 ETF : 자산배분 ───────────────────────────────────────
    (31, 'KR', '자산배분', '채권혼합', 'A0238P0', 'TIGER 미국S&P500미국채혼합50'),
    (32, 'KR', '자산배분', '채권혼합', 'A438080', 'ACE 미국S&P500채권혼합액티브'),
    (33, 'KR', '자산배분', '채권혼합', 'A435420', 'TIGER 미국나스닥100TR채권혼합Fn'),
    (34, 'KR', '자산배분', 'TDF', 'A0025N0', 'TIGER TDF2045'),
    (35, 'KR', '자산배분', 'TDF', 'A442570', 'RISE TDF2050액티브'),
    (36, 'KR', '원자재', '금', 'A0072R0', 'TIGER KRX금현물'),
    # ── 국내상장 ETF : 국내주식형(신설) ───────────────────────────────
    (37, 'KR', '국내주식형(신설)', 'KOSPI', 'A102110', 'TIGER 200'),
    (38, 'KR', '국내주식형(신설)', 'KOSPI', 'A305050', 'ACE 코스피'),
    (39, 'KR', '국내주식형(신설)', 'KOSDAQ', 'A232080', 'TIGER 코스닥150'),
    (40, 'KR', '국내주식형(신설)', 'KOSDAQ', 'A316670', 'KIWOOM 코스닥150'),
    (41, 'KR', '국내주식형(신설)', '대형주TOP10', 'A292150', 'TIGER 코리아TOP10'),
    (42, 'KR', '국내주식형(신설)', '대형주TOP10', 'A411540', 'SOL 200 Top10'),
    (43, 'KR', '국내주식형(신설)', '배당/커버드콜', 'A0052D0', 'TIGER 코리아배당다우존스'),
    (44, 'KR', '국내주식형(신설)', '배당/커버드콜', 'A472150', 'TIGER 배당커버드콜액티브'),
    (45, 'KR', '국내주식형(신설)', '반도체/IT', 'A396500', 'TIGER 반도체TOP10'),
    (46, 'KR', '국내주식형(신설)', '반도체/IT', 'A0093A0', 'RISE AI반도체TOP10'),
    (47, 'KR', '국내주식형(신설)', '반도체/IT', 'A471780', 'TIGER 코리아테크액티브'),
    (48, 'KR', '국내주식형(신설)', '채권혼합', 'A0233J0', 'TIGER 삼성전자SK하이닉스미국채혼합50'),
    (49, 'KR', '국내주식형(신설)', '채권혼합', 'A0206G0', '1Q 현대차기아채권혼합50'),
    (50, 'KR', '국내주식형(신설)', '전력', 'A0101N0', 'RISE AI전력인프라'),
    (51, 'KR', '국내주식형(신설)', '조선', 'A494670', 'TIGER 조선TOP10'),
    (52, 'KR', '국내주식형(신설)', '조선', 'A0141S0', 'SOL 조선기자재'),
    (53, 'KR', '국내주식형(신설)', 'K-로봇', 'A0148J0', 'TIGER 코리아휴머노이드로봇산업'),
    (54, 'KR', '국내주식형(신설)', 'K-로봇', 'A469070', 'RISE AI&로봇'),
    (55, 'KR', '국내주식형(신설)', 'K-우주방산', 'A463250', 'TIGER K방산&우주'),
    # ── 해외상장 ETF : 지수/지역 ──────────────────────────────────────
    (56, 'OV', '지수/지역', '미국/글로벌', 'QQQ', 'INVESCO QQQ TRUST UNIT SER 1 ETF',
     ['QQQ'], ['invesco', 'qqq']),
    (57, 'OV', '지수/지역', '미국/글로벌', 'SPY', 'SPDR S&P 500 ETF',
     ['SPY'], ['spdr', 's&p', '500']),
    (58, 'OV', '지수/지역', '글로벌 분산투자', 'VT', 'Vanguard Total World Stock',
     ['VT'], ['vanguard', 'total', 'world']),
    (59, 'OV', '지수/지역', '일본', '2644', 'Global X Japan Semiconductor',
     ['2644.T'], ['japan', 'semiconductor', '半導体', 'グローバル']),
    (60, 'OV', '지수/지역', '중국', 'KSTR', 'Kraneshares SSE Star Market 50',
     ['KSTR'], ['krane', 'star']),
    (61, 'OV', '지수/지역', '중국', '03191', 'GLOBAL X CHINA SEMICONDUCTOR ETF',
     ['3191.HK', '03191.HK'], ['china', 'semiconductor', '半導體', '半导体']),
    # ── 해외상장 ETF : 섹터/테마 ──────────────────────────────────────
    (62, 'OV', '섹터/테마', '중국', 'CQQQ', 'INVESCO CHINA TECHNOLOGY ETF',
     ['CQQQ'], ['china', 'technology']),
    (63, 'OV', '섹터/테마', '반도체&A.I.', 'SMH', 'VANECK ETF TR SEMICONDUCTOR ETF',
     ['SMH'], ['semiconductor']),
    (64, 'OV', '섹터/테마', '반도체&A.I.', 'CHPX', 'Global X Semiconductor & Quantum',
     ['CHPX'], ['semiconductor', 'quantum', 'chip']),
    (65, 'OV', '섹터/테마', '반도체&A.I.', 'IYW', 'iShares US Technology ETF',
     ['IYW'], ['ishares', 'technology']),
    (66, 'OV', '섹터/테마', '우주/방산', 'ORBX', 'GLOBAL X SPACE TECH',
     ['ORBX'], ['space']),
    (67, 'OV', '섹터/테마', '우주/방산', 'SHLD', 'GLOBAL X FDS DEFENSE TECH ETF',
     ['SHLD'], ['defense', 'defence']),
    (68, 'OV', '섹터/테마', '인프라', 'PAVE', 'GLOBAL X US INFRASTRUCTURE DEVELOPMENT ETF',
     ['PAVE'], ['infrastructure']),
    (69, 'OV', '섹터/테마', '글로벌배당/커버드콜', 'SCHD', 'SCHWAB US DIVIDEND EQUITY ETF',
     ['SCHD'], ['schwab', 'dividend']),
    (70, 'OV', '섹터/테마', '글로벌배당/커버드콜', 'JEPQ',
     'JP MORGAN NASDAQ EQUITY PREMIUM INCOME', ['JEPQ'], ['nasdaq', 'premium', 'income']),
    (71, 'OV', '섹터/테마', '채권형', 'SHY', 'ISHARES 1-3Y TREASURY BOND ETF',
     ['SHY'], ['treasury', 'bond']),
    (72, 'OV', '섹터/테마', '채권형', 'GXIG', 'Global X Investment Grade Corporate Bond ETF',
     ['GXIG'], ['corporate', 'bond', 'grade']),
    (73, 'OV', '섹터/테마', '채권형', 'IEF', 'ISHARES 7-10Y TREASURY BOND ETF',
     ['IEF'], ['treasury', 'bond']),
    # ── 해외상장 ETF : 원자재 ─────────────────────────────────────────
    (74, 'OV', '원자재', '원자재', 'GLD', 'SPDR GOLD TRUST ETF',
     ['GLD'], ['gold']),
    (75, 'OV', '원자재', '원자재', '424A', 'Global X Gold ETF (JPY Hedged)',
     ['424A.T'], ['gold', 'ゴールド', '金']),
    # **표의 GOLD 는 야후의 GOLD(Barrick, 금광 주식)가 아니다.** 호주 상장
    # Global X Physical Gold ETF 이므로 GOLD.AX 를 먼저 본다. 후보에 맨 글자
    # GOLD 를 남기지 않는다 — 그쪽이 응답하면 금광 회사를 금으로 분석한다.
    (76, 'OV', '원자재', '원자재', 'GOLD', 'Global X Physical Gold ETF',
     ['GOLD.AX'], ['gold']),
]

# 표에 있었지만 **일부러 뺀** 것 — 지시(“ETN은 제외해줘”)대로다.
EXCLUDED_ETN = [
    (77, 'Q520074', '미래에셋 미국 방위산업 TOP3 ETN'),
    (78, 'Q520078', '미래에셋 미국 제약 TOP3 ETN'),
    (79, 'Q520080', '미래에셋 미국 테크&반도체 TOP3 ETN'),
    (80, 'Q520072', '미래에셋 미국 AI TOP3 ETN'),
    (81, 'Q520066', '미래에셋 KRX금현물 AUTO-KO-C2810-01 ETN'),
    (82, 'Q520089', '미래에셋 CAPE실러 US Core Sector ETN'),
]


def items():
    """한 줄을 딕셔너리로 펴서 낸다. 국내분은 후보·이름낱말을 여기서 채운다."""
    out = []
    for r in ROWS:
        no, scope, group, theme, ticker, name = r[:6]
        if scope == 'KR':
            code = ticker[1:] if ticker.startswith('A') else ticker
            syms, expect = [code], []
        else:
            code = ticker
            syms, expect = r[6], r[7]
        out.append({'no': no, 'scope': scope, 'group': group, 'theme': theme,
                    'ticker': ticker, 'name': name, 'code': code,
                    'symbols': syms, 'expect': expect})
    return out


def counts():
    it = items()
    return {'total': len(it),
            'KR': sum(1 for x in it if x['scope'] == 'KR'),
            'OV': sum(1 for x in it if x['scope'] == 'OV'),
            'etn_excluded': len(EXCLUDED_ETN)}
