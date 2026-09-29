# -*- coding: utf-8 -*-
"""ETF 이름에서 테마를 붙이는 규칙.

**이름만 본다.** 구성종목이나 업종 분류를 보고 붙이는 것이 아니다. 그래서 틀릴 수
있고, 화면의 「테마 점검」 칸이 그것을 사람이 훑어보라고 있다 — 붙은 테마마다
**어느 낱말에 걸려서 붙었는지**를 함께 남긴다(`match`).

규칙은 (테마 id, 한글 이름, 영문 이름, 낱말들). 낱말은 대소문자를 가리지 않고
이름 안에 들어 있으면 걸린다. 영문 낱말 가운데 짧아서 다른 낱말 속에 섞이기 쉬운
것(AI, EV, REIT 따위)은 앞뒤가 글자가 아닐 때만 걸리게 `\\b` 로 감싼다.

`EXCLUDE` 는 걸렸어도 떼는 낱말이다. 예) '반도체' 는 반도체지만
'반도체소부장' 도 반도체로 두고, 'AI전력' 은 AI 와 전력 둘 다 붙는다 — 둘 다 이름에
적힌 말이라서다. 떼는 것은 **이름에 있어도 그 테마가 아닌 것이 확실한 경우**뿐이다.
"""

import re

RULES = [
    ('semi', '반도체', 'Semiconductors',
     ['반도체', '半导体', '芯片', 'semiconductor', 'semi ', r'\bSOX\b', 'chip', '半導体']),
    ('ai', 'AI·로봇', 'AI & Robotics',
     [r'\bAI\b', 'AI', '인공지능', '로봇', '휴머노이드', 'robot', 'artificial intelligence',
      '人工智能', '机器人', 'ロボ']),
    ('bigtech', '빅테크·나스닥', 'Big Tech & Nasdaq',
     ['나스닥', 'nasdaq', '빅테크', 'big tech', 'magnificent', 'FANG', '纳斯达克', '纳指', 'テック']),
    ('sp500', 'S&P500·미국 대표지수', 'S&P 500 & US broad',
     ['S&P500', 'S&P 500', 'SP500', '500 index', 'total stock market', 'total market', '标普500',
      '미국500', '다우존스30', 'dow jones industrial']),
    ('kospi', '코스피·코스닥 대표지수', 'KOSPI & KOSDAQ',
     [r'^[A-Z]+ 200$', '코스피', 'KOSPI', '코스닥', 'KOSDAQ', ' 200 ', '200TR', 'TOP10', '코리아밸류업',
      '밸류업']),
    ('china', '중국', 'China',
     ['중국', '차이나', 'china', 'chinese', 'CSI', '沪深', '中证', '上证', '深证', '创业板', 'chinext',
      '과창판', 'STAR50', '科创', '항셍', 'hang seng', '恒生', 'HSCEI', 'H주']),
    ('japan', '일본', 'Japan',
     ['일본', 'japan', 'nikkei', '니케이', 'TOPIX', '日経', 'JPX', '日本']),
    ('india', '인도', 'India', ['인도', 'india', 'nifty', 'sensex', '印度']),
    ('dividend', '배당', 'Dividend',
     ['배당', 'dividend', 'income', '高配当', '红利', '红利', 'yield']),
    ('covered', '커버드콜·옵션', 'Covered call & options',
     ['커버드콜', 'covered call', 'buywrite', 'premium income', '프리미엄', 'option income', 'buffer']),
    ('bond', '채권·금리', 'Bonds & rates',
     ['채권', '국채', '국고채', '회사채', '금리', 'treasury', 'bond', 'aggregate', 'fixed income',
      'T-bill', 'CD금리', 'KOFR', 'SOFR', 'MMF', '머니마켓', '单债', '国债', '债', '債']),
    ('gold', '금·원자재', 'Gold & commodities',
     ['금현물', '골드', r'\bgold\b', '은현물', 'silver', '원자재', 'commodit', '원유', 'crude', 'oil',
      '구리', 'copper', '黄金', '金価格', '金ETF', '商品']),
    ('reit', '리츠·부동산', 'REITs & real estate',
     ['리츠', r'\bREIT', 'real estate', '부동산', '인프라', 'infrastructure', '房地产', '不動産']),
    ('battery', '2차전지·전기차', 'Batteries & EV',
     ['2차전지', '이차전지', '배터리', 'battery', 'lithium', '리튬', '전기차', r'\bEV\b',
      'electric vehicle', '新能源', '电池', '자율주행']),
    ('bio', '바이오·헬스케어', 'Biotech & health care',
     ['바이오', '헬스케어', '제약', 'biotech', 'health', 'pharma', 'medical', '医药', '医疗', '生物']),
    ('energy', '에너지·전력·원자력', 'Energy, power & nuclear',
     ['에너지', '전력', '원자력', '원전', 'SMR', 'energy', 'uranium', 'nuclear', 'utilities', 'power',
      '태양광', 'solar', 'clean', '수소', 'hydrogen', '能源', '电力', '光伏']),
    ('finance', '금융·은행', 'Financials',
     ['금융', '은행', '증권', '보험', 'bank', 'financ', 'insurance', '银行', '证券', '金融']),
    ('defense', '방산·조선·우주', 'Defense, shipbuilding & space',
     ['방산', '방위', '조선', '우주', 'defense', 'aerospace', 'space', 'shipbuild', '军工', '国防']),
    ('consumer', '소비재·K컬처', 'Consumer & K-culture',
     ['소비', '화장품', '뷰티', 'K컬처', '미디어', '엔터', '게임', 'consumer', 'retail', 'game',
      'media', 'entertainment', '消费', '白酒', '食品']),
    ('internet', '인터넷·플랫폼·소프트웨어', 'Internet & software',
     ['인터넷', '플랫폼', '소프트웨어', '클라우드', '사이버', 'internet', 'software', 'cloud', 'cyber',
      'fintech', 'blockchain', '블록체인', '互联网', '软件', '计算机']),
    ('global', '글로벌·선진국', 'Global & developed',
     ['글로벌', '선진국', '세계', 'MSCI World', 'ACWI', 'global', 'world', 'international',
      'developed', 'EAFE', '全球']),
    ('em', '신흥국', 'Emerging markets',
     ['신흥국', 'emerging', '베트남', 'vietnam', '인도네시아', 'indonesia', '브라질', 'brazil',
      '멕시코', 'mexico', '新兴']),
    ('esg', 'ESG', 'ESG', [r'\bESG\b', 'ESG', 'sustainab', 'climate', '탄소', 'carbon', 'low carbon']),
    ('tdf', 'TDF·자산배분', 'Target date & allocation',
     ['TDF', 'TRF', '자산배분', '혼합', 'allocation', 'balanced', 'target date', 'multi-asset', '채권혼합']),
]

# 걸렸어도 떼는 경우. (테마 id, 이 낱말이 이름에 있으면 그 테마를 뗀다)
EXCLUDE = [
    ('kospi', '미국'), ('kospi', '차이나'), ('kospi', '중국'), ('kospi', '일본'),
    ('kospi', '글로벌'), ('kospi', '인도'),
    ('gold', 'golden'), ('gold', 'goldman'),
    ('energy', 'powershares'), ('energy', 'power ranger'),
    ('ai', 'TAIWAN'), ('ai', 'thai'), ('ai', 'CHAIN'), ('ai', 'AIM'),
]


def _compile(word):
    if word.startswith('^') or '\\b' in word:
        return re.compile(word, re.I)
    return re.compile(re.escape(word), re.I)


_RULES = [(tid, ko, en, [(_compile(w), w) for w in words]) for tid, ko, en, words in RULES]


def _is_ascii_word(w):
    return all(ord(ch) < 128 for ch in w)


def themes_for(*names):
    """이름(들)에 걸리는 테마와 **걸린 낱말**을 낸다. {theme_id: matched_text}.

    영문 짧은 낱말 'AI' 는 \\b 판(`\\bAI\\b`)만 쓴다 — 그냥 'AI' 는 한글 이름에
    붙은 'AI'(예: 'KODEX AI반도체')를 잡으려고 둔 것이라 **한글이 섞인 이름에만** 쓴다.
    """
    text = ' '.join(n for n in names if n)
    if not text:
        return {}
    has_hangul = any('가' <= ch <= '힣' for ch in text)
    out = {}
    for tid, _ko, _en, pats in _RULES:
        for rx, w in pats:
            if w == 'AI' and not has_hangul:
                continue
            m = rx.search(text)
            if m:
                out[tid] = m.group(0).strip() or w
                break
    for tid, word in EXCLUDE:
        if tid in out and word.lower() in text.lower():
            del out[tid]
    return out


def theme_table():
    return [{'id': tid, 'ko': ko, 'en': en, 'words': [w for w in words]} for tid, ko, en, words in RULES]


def _selftest():
    cases = [
        ('KODEX 반도체', {'semi'}),
        ('TIGER 미국S&P500', {'sp500'}),
        ('KODEX 200', {'kospi'}),
        ('iShares Semiconductor ETF', {'semi'}),
        ('Global X Robotics & Artificial Intelligence ETF', {'ai', 'global'}),
        ('iShares MSCI Taiwan ETF', set()),
        ('TIGER 차이나항셍테크', {'china'}),
    ]
    bad = 0
    for name, want in cases:
        got = set(themes_for(name))
        if not want <= got or ('ai' in got and 'ai' not in want):
            print('테마 규칙 어긋남:', name, '기대', want, '실제', got)
            bad += 1
    return bad


if __name__ == '__main__':
    import sys
    sys.exit(1 if _selftest() else 0)
