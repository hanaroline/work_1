#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""역방향 검증 — 슬라이드에 찍힌 숫자가 전부 주장 대장에 있는가.

check_claims.py 는 대장 안의 셈을 본다(대장 → 산출물). 이 도구는 반대로 본다
(산출물 → 대장). 둘은 다른 사고를 잡는다. 대장을 아무리 잘 적어도 슬라이드에
대장에 없는 숫자를 손으로 하나 끼워 넣으면 검산은 통과한다.

근거 줄(7.5pt)과 발표자 노트는 세지 않는다. 거기엔 법령 번호·공포번호·연도가
잔뜩 있고 그것들은 주장이 아니라 출처 표기다.

    python3 tools/tax-brief/validate.py data/law/양도소득세_주장대장.json  a.pptx b.pptx
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
SRC_PT = 750          # 근거 줄의 글자 크기(1/100 pt). 이 크기는 건너뛴다.

# 숫자 + 단위. 긴 것부터 맞춰야 '10만분의 22' 가 '10' 과 '22' 로 쪼개지지 않는다.
TOKEN = re.compile(
    r'(?:\d+만분의\s*\d+)'
    r'|(?:\d+(?:,\d{3})*(?:\.\d+)?\s*(?:억원|만원|천만원|개월|촌|%|퍼센트))'
    r'|(?:\d+억\s*\d+(?:,\d{3})*만원)'
)
# 날짜는 따로 — 시행일 주장과 맞춘다.
DATE = re.compile(r'(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})')

# 숫자가 아니거나 주장이 아닌 것. 조문·호수·면 번호 따위.
IGNORE_CTX = re.compile(r'§|제\d+조|제\d+호|대통령령|부칙')


def printed_text(path):
    """근거 줄을 뺀 본문 글. (면번호, 글) 목록."""
    out = []
    with zipfile.ZipFile(path) as z:
        names = sorted((n for n in z.namelist()
                        if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)),
                       key=lambda n: int(re.search(r'(\d+)', n.split('/')[-1]).group(1)))
        for i, n in enumerate(names, 1):
            root = ET.fromstring(z.read(n))
            for p in root.iter('{%s}p' % A):
                buf = []
                for r in p.iter('{%s}r' % A):
                    rpr = r.find('{%s}rPr' % A)
                    sz = int(rpr.get('sz')) if (rpr is not None and rpr.get('sz')) else 0
                    if sz == SRC_PT:
                        continue
                    t = r.find('{%s}t' % A)
                    if t is not None and t.text:
                        buf.append(t.text)
                s = ''.join(buf).strip()
                if s:
                    out.append((i, s))
    return out


def norm(tok):
    """토큰을 비교 가능한 모양으로. ('50','억원') 꼴."""
    t = tok.replace(' ', '').replace(',', '')
    m = re.fullmatch(r'(\d+)만분의(\d+)', t)
    if m:
        # 「10만분의 22」의 분모는 10 이 아니라 10만이다. 앞의 수는 '만'의
        # 배수다. 이것을 10 으로 읽으면 0.022% 가 220% 가 된다.
        # 비교는 반올림해서 한다 — 22/100000*100 은 0.022 가 아니라
        # 0.022000000000000002 로 나와 그냥 견주면 영영 어긋난다.
        denom = float(m.group(1)) * 10000.0
        return ('만분율', round(float(m.group(2)) / denom * 100, 6))
    m = re.fullmatch(r'(\d+)억(\d+)만원', t)
    if m:
        return ('만원', float(m.group(1)) * 10000 + float(m.group(2)))
    m = re.fullmatch(r'(\d+(?:\.\d+)?)(억원|만원|천만원|개월|촌|%|퍼센트)', t)
    if m:
        v, u = float(m.group(1)), m.group(2)
        if u == '천만원':
            return ('만원', v * 1000)
        if u == '퍼센트':
            u = '%'
        return (u, v)
    return None


def ledger_values(led):
    """대장에 있는 (단위종류, 값) 집합과, 그 값을 주장하는 id 들."""
    unit_map = {
        '지분율': '%', '세율': '%', '거래세율': '%', '가산세': '%',
        '배당분리과세': '%', '배당성향': '%',
        '보유금액': '억원', '과세표준': '억원',
        '산출세액': '만원', '기본공제': '만원', '배당분리과세누진액': '만원',
        '배당구간': '만원',
        '예정신고기한': '개월', '친족범위': '촌',
    }
    vals, dates = {}, {}
    for c in led['claims']:
        u = unit_map.get(c.get('metric'))
        v = c.get('value')
        if c.get('metric') in ('시행일', '일몰'):
            dates.setdefault(str(v), []).append(c['id'])
            continue
        if u is None or not isinstance(v, (int, float)):
            continue
        vals.setdefault((u, float(v)), []).append(c['id'])
        if u == '%':
            # 세법 조문은 백분율을 '1만분의 15' 꼴로도 쓴다. 같은 값이다.
            vals.setdefault(('만분율', round(float(v), 6)), []).append(c['id'])
    for d in led.get('derived', []):
        if isinstance(d.get('printed'), (int, float)) and d.get('unit'):
            u = d['unit'].replace('퍼센트', '%')
            if u == '백만원':
                vals.setdefault(('만원', float(d['printed']) * 100), []).append(d['id'])
            else:
                vals.setdefault((u, float(d['printed'])), []).append(d['id'])
    return vals, dates


def main():
    led = json.load(open(sys.argv[1], encoding='utf-8'))
    vals, dates = ledger_values(led)
    bad, hit = [], {}

    for path in sys.argv[2:]:
        for page, s in printed_text(path):
            if IGNORE_CTX.search(s) and '§' in s:
                pass   # 조문 인용이 섞인 줄도 숫자는 본다. 단위가 붙은 것만 잡힌다.
            for tok in TOKEN.findall(s):
                k = norm(tok)
                if k is None:
                    continue
                if k in vals:
                    for i in vals[k]:
                        hit.setdefault(i, 0)
                        hit[i] += 1
                else:
                    bad.append('%s %d면 — 대장에 없는 수치 「%s」  (%s)'
                               % (path.split('/')[-1], page, tok, s[:46]))
            for y, m, d in DATE.findall(s):
                key = '%04d-%02d-%02d' % (int(y), int(m), int(d))
                if key in dates:
                    for i in dates[key]:
                        hit.setdefault(i, 0)
                        hit[i] += 1

    print('대장 %d주장 + %d파생' % (len(led['claims']), len(led.get('derived', []))))
    print('슬라이드에서 맞춘 항목 %d개' % len(hit))
    if bad:
        print('\n!! 대장에 없는 수치 %d건' % len(bad))
        for b in bad:
            print('   ' + b)
        return 1
    print('\n슬라이드의 모든 수치가 대장에 있다.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
