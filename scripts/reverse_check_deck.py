#!/usr/bin/env python3
"""렌더된 덱에서 숫자를 거꾸로 뽑아 주장 대장에 있는지 대조한다.

    python3 scripts/reverse_check_deck.py els-sales-deck.pdf tools/discovery/els-claims.json

주장 대장(check_claims.py)은 "대장에 올린 값이 서로 맞는가"를 본다. 그것만으로는
대장에 없는 숫자가 슬라이드에 인쇄되는 것을 못 막는다 — 실제로 덱이 원값으로 나눈
위험당 대가를 인쇄해 대장(1.25)과 한 자리 어긋난 적이 있다. 그래서 방향을 뒤집어,
PDF 에 찍힌 숫자 하나하나가 대장까지 거슬러 올라가는지 확인한다.

숫자라고 다 주장은 아니다. 회차 번호·접수번호·날짜·배리어 나열·종목명 속 숫자처럼
"값" 이 아니라 "이름" 인 것은 먼저 걷어낸다. 걷어내는 규칙은 아래 STRIP 에 모아
두었고, 구조상 늘 나오지만 대장에 올릴 성질이 아닌 값은 STRUCTURAL 에 둔다.

한계 — 이 검사는 "값 집합" 대조다. 인쇄된 숫자가 대장의 **어느** 항목과든 같으면
통과하므로, 틀린 값이 우연히 다른 항목의 값과 겹치면 못 잡는다(값을 일부러 틀리게
넣어 본 시험에서 네 건 중 한 건만 걸렸다). 근거 없는 값이 새로 인쇄되는 것은 잡지만,
항목끼리 뒤바뀐 것까지 잡지는 못한다 — 그쪽은 check_claims.py 의 파생 검산이 맡는다.
claims[].printed_on 으로 장별 범위를 좁히면 더 조일 수 있으나, 표기가 비어 있는
항목이 많아 지금 그렇게 하면 거짓 경보가 난다.

종료코드 0 = 미등록 없음.
"""
import json
import re
import sys

import pymupdf

PDF = sys.argv[1] if len(sys.argv) > 1 else 'els-sales-deck.pdf'
LEDGER = sys.argv[2] if len(sys.argv) > 2 else 'tools/discovery/els-claims.json'

# ── 값이 아니라 이름인 것들 — 뽑기 전에 지운다 ──────────────────────────────
STRIP = [
    # "제38133회", "제38133~38151회", "제38150·38151·38149·38148회" 를 모두 받는다.
    (r'제\s*\d+(?:\s*[·,~]\s*\d+)*\s*회', '회차 라벨'),
    (r'\b\d{14}\b', '접수번호'),
    (r'\d{4}\s*[.\-]\s*\d{1,2}\s*[.\-]\s*\d{1,2}', '날짜'),
    # 분석자료(HTML)는 날짜를 한글로 적는다 — "2026년 10월 01일 오후 5시"
    (r'\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일', '날짜(한글)'),
    (r'\d{4}\s*년', '연도 라벨'),          # "2008년 금융위기", "최근 9년(2016년~)"
    (r'\d{1,2}\s*시', '시각'),
    # 배리어 나열 — "85×3-80-75-70", "65×5-60", "90-85-80-75-70-65"
    (r'\d{2,3}(?:\s*[×xX]\s*\d+)?(?:\s*-\s*\d{2,3}(?:\s*[×xX]\s*\d+)?)+', '배리어 나열'),
    # 종목·지수 이름에 붙은 숫자
    (r'KOSPI\s*200|S&P\s*500|Nikkei\s*225|EuroStoxx\s*50|HSCEI|KRX\s*\d+', '기초자산 이름'),
    (r'\d+\s*차', '차수 라벨'),
    (r'\bAA\b|\b1\s*등급\b', '등급 라벨'),
]

# 구조상 늘 인쇄되지만 시장 데이터가 아니라 자료의 뼈대인 값.
# 대장에 "주장" 으로 올리면 출처가 없는 항목이 늘어나므로 여기에 둔다.
STRUCTURAL = {
    95: '신뢰구간 수준 (95%)',
    10: '몬테카를로 경로 수를 "10만 번" 으로 적은 표기',
    100: '액면 100% 기준·백분율 기준점',
    10000: '액면 1만 단위',
    1: '차수·항목 번호', 2: '항목 번호', 3: '항목 번호',
    4: '항목 번호', 5: '항목 번호', 6: '항목 번호',
    65: '고령투자자 기준 연령 (만 65세)',
    12: '연 환산에 쓰는 개월 수',
}

doc = pymupdf.open(PDF)
led = json.load(open(LEDGER, encoding='utf-8'))

# ── 대장이 떠받치는 값 모으기 ───────────────────────────────────────────────
allowed = {}   # 값 -> 근거 id


def put(v, src):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return
    allowed.setdefault(round(f, 4), src)
    # 인쇄는 자리수를 줄여 나간다. 반올림한 꼴도 같은 근거로 받아 준다.
    for nd in (0, 1, 2):
        allowed.setdefault(round(round(f, nd), 4), src)
    # 백분율은 부호를 떼고 적는 자리가 있다 ("평균 63.2% 를 잃습니다")
    if f < 0:
        put(-f, src)


for c in led['claims']:
    put(c.get('value'), c['id'])
for d in led.get('derived', []):
    put(d.get('printed'), d['id'])
    for k in ('a', 'b', 'from', 'to', 'numerator', 'denominator'):
        if isinstance(d.get(k), (int, float)):
            put(d[k], d['id'])
for v, why in STRUCTURAL.items():
    allowed.setdefault(float(v), f'구조값: {why}')

# 회차 번호는 값이 아니라 이름이다. 표의 첫 칸에는 "제…회" 없이 번호만 찍히므로
# 정규식으로는 걸러지지 않는다. 대장의 항목 id 에서 이번 회차 번호를 그대로 읽어
# 그 번호만 지운다 — 5자리 숫자를 통째로 무시하면 진짜 값까지 놓친다.
ROUNDS = sorted({m.group(1) for m in (re.match(r'^R(\d+)_', c['id']) for c in led['claims']) if m},
                key=len, reverse=True)
if ROUNDS:
    STRIP.append((r'\b(?:' + '|'.join(ROUNDS) + r')\b', '회차 번호'))

NUM = re.compile(r'-?\d[\d,]*(?:\.\d+)?')

bad = []
for pno, page in enumerate(doc, 1):
    text = page.get_text()
    for pat, _why in STRIP:
        text = re.sub(pat, ' ', text)
    for m in NUM.finditer(text):
        raw = m.group(0)
        try:
            v = float(raw.replace(',', ''))
        except ValueError:
            continue
        if round(abs(v), 4) in allowed or round(v, 4) in allowed:
            continue
        ctx = text[max(0, m.start() - 34):m.end() + 24].replace('\n', ' ')
        bad.append((pno, raw, ' '.join(ctx.split())))

print(f'{PDF} — {doc.page_count}장 · 대장이 떠받치는 값 {len(allowed)}개')
if bad:
    print(f'\n── 대장에 없는 숫자 ({len(bad)})')
    for pno, raw, ctx in bad:
        print(f'   p{pno}  {raw:>12}   …{ctx}…')
    print('\n근거 없는 값이 인쇄되었습니다. 대장에 올리거나 인쇄에서 빼십시오.')
    sys.exit(1)

print('미등록 0 — 인쇄된 모든 숫자가 대장까지 거슬러 올라갑니다.')
