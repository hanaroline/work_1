# -*- coding: utf-8 -*-
"""판에 적힌 이름-값 쌍을 시세 파일과 대조한다.

    python3 scripts/audit_numbers.py docs/briefings/<파일>.html [data/market/latest.json]

「이름 … 숫자%」 꼴을 훑어 자료의 `change_pct` 와 다르면 신고한다. 표는 자료에서
나오지만 **해설 글은 안 나온다** — 휴장 뒤 첫 판에서 글만 지난 세션에 멈춰 있는
사고를 잡으려고 만들었다.

**오탐이 섞인다.** 「커뮤니케이션」이 「니케이」로, 「SMIC」가 「SMI」로 잡히고,
날짜를 명시해 인용한 지난 세션 수치도 걸린다. 개수를 보고 하나씩 판단할 것.
"""
import io, re, sys, json, html as H

h = io.open(sys.argv[1], encoding='utf-8').read()
t = H.unescape(re.sub(r'<[^>]+>', ' ', h))
t = t.replace('−', '-').replace('−', '-')
t = re.sub(r'\s+', ' ', t)

d = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'data/market/latest.json'))
I = d['indices']
NAME = {}
for ko, k in [('S&P500','sp500'),('S&P 500','sp500'),('나스닥','nasdaq'),('다우','dow'),
              ('SOX','sox'),('러셀2000','russell'),('VIX','vix'),('MOVE','move'),
              ('STOXX600','stoxx600'),('DAX','dax'),('CAC','cac'),('FTSE','ftse'),
              ('SMI','smi'),('IBEX','ibex'),('니케이','nikkei'),('항셍','hangseng'),
              ('상하이','shanghai'),('WTI','wti'),('브렌트','brent'),('구리','copper'),
              ('센섹스','sensex')]:
    if k in I: NAME[ko] = I[k]['change_pct']
for grp in ('us_stocks','eu_stocks','jp_stocks','cn_stocks','stocks','us_sectors'):
    for n, v in d.get(grp, {}).items():
        NAME.setdefault(n, v['change_pct'])

bad, ok = [], 0
for ko, want in NAME.items():
    for m in re.finditer(re.escape(ko) + r'[^0-9%\-+]{0,14}([+-]?\d+\.\d\d)%', t):
        got = float(m.group(1))
        if abs(got - want) < 0.015:
            ok += 1
        else:
            ctx = t[max(0, m.start()-60):m.end()+25]
            bad.append((ko, got, want, ctx))
print('맞은 짝 %d개' % ok)
print('어긋난 짝 %d개' % len(bad))
seen = set()
for ko, got, want, ctx in bad:
    key = (ko, got)
    if key in seen: continue
    seen.add(key)
    print('\n  ! %s  판=%+.2f%%  자료=%+.2f%%' % (ko, got, want))
    print('    …%s…' % ctx.strip()[:150])
