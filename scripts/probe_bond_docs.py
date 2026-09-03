#!/usr/bin/env python3
"""
채권 설명서 탐색 ⑪ — 설명서 PDF 87개의 첫 쪽을 읽어 무슨 문서인지 가려낸다

    pip install pymupdf
    python3 scripts/probe_bond_docs.py

10차에서 드러난 두 가지
  ① 내 9차 판단이 틀렸다 — n81 을 「위험등급 안내」로 적었는데, 그것은 화면의
     옆 제목이었다. hki3031n81.pdf 를 실제로 읽어 보니 담당자가 준 그
     「개인형 IRP 핵심(요약)설명서」 였다. 화면 제목을 믿을 수 없으므로
     PDF 자체의 첫 쪽을 읽어 문서를 가려야 한다.
  ② ★ pdf.js 는 이 PDF 들을 못 읽는다 (6쪽에서 15자). pymupdf 는 읽는다
     (9,145자). 글자가 없는 것이 아니라 pdf.js 가 이 글꼴의 글자표를 못 푼다.
     그래서 이 탐색은 파이썬으로 한다.

찾는 것 — 창구가 종목마다 손으로 넣던 문구의 원문
  ㆍ위험등급의 의미·유의사항 (1~6등급)
  ㆍ채권 신용등급의 정의
  ㆍ장외채권 거래설명서 (매매수수료·중도매도·원리금 계산)

저장소에 아무것도 쓰지 않는다.
"""
import io
import re
import sys
import urllib.request

import pymupdf

IMG = 'https://img.securities.miraeasset.com/download/pdf/'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')
REF = 'https://securities.miraeasset.com/hki/hki3031/a00.do'

# 9차에서 열린 번호들. 이름이 t96 인 것 하나만 규칙이 다르다.
NUMS = [f'n{i}' for i in range(1, 103)] + ['t96']

WANT = {
    '위험등급': re.compile(r'위험등급'),
    '신용등급의 정의': re.compile(r'신용등급[^\n]{0,8}(정의|의미)'),
    '장외채권': re.compile(r'장외\s*채권'),
    '매매수수료': re.compile(r'매매\s*수수료'),
    '중도매도': re.compile(r'중도\s*매도'),
    '이표채': re.compile(r'이표채|복리채|할인채'),
}


def fetch(name):
    req = urllib.request.Request(IMG + f'hki3031{name}.pdf',
                                 headers={'User-Agent': UA, 'Referer': REF})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()


def title_of(text):
    """첫 쪽에서 문서 이름으로 보이는 줄 — 빈 줄·쪽번호를 걷어내고 앞줄을 잇는다."""
    lines = [re.sub(r'\s+', ' ', x).strip() for x in text.split('\n')]
    lines = [x for x in lines if x and not re.fullmatch(r'[-–\d./·]+', x)]
    return ' '.join(lines[:6])[:110]


print(f'설명서 PDF {len(NUMS)}개의 첫 쪽을 읽는다')
rows, hits = [], []
for name in NUMS:
    try:
        buf = fetch(name)
    except Exception as e:
        continue
    if buf[:5] != b'%PDF-':
        continue
    try:
        doc = pymupdf.open(stream=io.BytesIO(buf), filetype='pdf')
        first = doc[0].get_text()
        full = ''.join(p.get_text() for p in doc)
        pages = doc.page_count
        doc.close()
    except Exception as e:
        print(f'   {name}: 판독 실패 {e}')
        continue
    t = title_of(first)
    found = [k for k, re_ in WANT.items() if re_.search(full)]
    rows.append((name, pages, len(buf) // 1024, len(full), t, found))
    if found:
        hits.append((name, t, found, full))

print(f'\n받아 읽은 PDF {len(rows)}개')
for name, pages, kb, chars, t, found in rows:
    mark = ' ★' if found else '  '
    print(f'  {name:>5}{mark} {pages:>3}쪽 {kb:>5}KB {chars:>6}자  {t}')
    if found:
        print(f'         찾은 문구: {" · ".join(found)}')

print('\n' + '=' * 72)
print('찾는 문구가 있는 문서 — 원문을 본다')
print('=' * 72)
for name, t, found, full in hits:
    print(f'\n■ {name} — {t}')
    print(f'   {" · ".join(found)}')
    for k, re_ in WANT.items():
        m = re_.search(full)
        if not m:
            continue
        s = re.sub(r'\s+', ' ', full[max(0, m.start() - 120):m.start() + 500])
        print(f'   [{k}] …{s}…')

print('\n탐색 끝.')
