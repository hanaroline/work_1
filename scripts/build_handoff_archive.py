#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""인계-보관본.txt 를 다시 만든다 — 저장소 밖에서도 쓸 수 있는 한 파일 사본.

왜 스크립트로 만드는가
    예약(Routine)은 계정에 묶여 있어 계정을 닫으면 사라진다. 그래서 프롬프트
    원문을 저장소에 떠 두는데, 손으로 옮기면 빠진다. 실제로 전판에는 19건 중
    4건만 실려 있었다. 이 스크립트는 docs/claude-handoff/routines.json 을
    원천으로 삼아 활성 예약 전부를 싣는다.

무엇을 건드리고 무엇을 두는가
    3절(예약)만 다시 만들고 나머지 절(지도·지침·설정·함정·열린 일)은
    사람이 쓴 글이므로 그대로 둔다. 머리말의 날짜만 갱신한다.

쓰는 법
    python3 scripts/build_handoff_archive.py            # 다시 만든다
    python3 scripts/build_handoff_archive.py --check    # 안 쓰고 어긋남만 알린다

표준 라이브러리만 쓴다(CLAUDE.md 규칙).
"""
import argparse
import datetime
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVE = os.path.join(ROOT, '인계-보관본.txt')
ROUTINES = os.path.join(ROOT, 'docs', 'claude-handoff', 'routines.json')

BANNER = '#' * 80
RULE = '-' * 80

# 사람이 쓴 글을 다시 만들 때도 잃지 않도록 경계를 표시해 둔다.
# 이 표시가 없으면(첫 실행) 옛 판의 생김새로 어림잡는다.
KEEP_ON = ' <<< 사람이 쓴 글 — 다시 만들어도 그대로 옮깁니다'
KEEP_OFF = ' >>> 사람이 쓴 글 끝'


def load_routines():
    with io.open(ROUTINES, encoding='utf-8') as fp:
        d = json.load(fp)
    rs = d if isinstance(d, list) else (d.get('routines') or d.get('data') or d.get('triggers'))
    if not rs:
        sys.exit('routines.json 에서 예약 목록을 찾지 못했습니다.')
    return rs


def kst_cron(cron):
    """UTC 크론을 한국시각 설명과 함께 보여 준다."""
    if not cron:
        return '-'
    if cron.startswith('CRON_TZ='):
        return cron
    m = re.match(r'^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$', cron.strip())
    if not m:
        return cron
    mi, hh = m.group(1), m.group(2)
    try:
        kst = (int(hh) + 9) % 24
        return '%s   (한국시각 %02d:%s)' % (cron, kst, mi.zfill(2))
    except ValueError:
        return cron


def split_sections(text):
    """`####` 배너로 둘러싼 `# N. 제목` 을 기준으로 쪼갠다."""
    lines = text.split('\n')
    marks = []
    for i in range(len(lines) - 2):
        if (lines[i].startswith('####') and lines[i + 2].startswith('####')
                and re.match(r'^#\s*\d+\.', lines[i + 1])):
            num = int(re.match(r'^#\s*(\d+)\.', lines[i + 1]).group(1))
            marks.append((i, num, lines[i + 1]))
    out, head = [], '\n'.join(lines[:marks[0][0]]) if marks else text
    for j, (start, num, title) in enumerate(marks):
        end = marks[j + 1][0] if j + 1 < len(marks) else len(lines)
        out.append({'num': num, 'title': title, 'body': '\n'.join(lines[start:end])})
    return head, out


def carry_over(body):
    """3절에서 사람이 쓴 부분(공통 주의 · 만들지 말 것)만 떼어 둔다.

    경계 표시가 있으면 그 사이만 가져온다 — 이래야 여러 번 돌려도 생성분이
    사람 글에 섞여 들어가지 않는다. 표시가 없는 첫 실행에서는 옛 판의
    생김새(첫 `3-N` 앞까지가 머리글, `만들지 말 것` 이후가 꼬리)로 어림잡는다.
    """
    blocks = re.findall(
        re.escape(KEEP_ON) + r'\n(.*?)\n' + re.escape(KEEP_OFF), body, re.S)
    if blocks:
        pre = blocks[0].strip('\n')
        tail = blocks[1].strip('\n') if len(blocks) > 1 else ''
        return pre, tail

    lines = body.split('\n')
    preamble = []
    for i, ln in enumerate(lines):
        if re.match(r'^\s*3-\d', ln):
            preamble = lines[3:i]
            break
    else:
        preamble = lines[3:]
    tail = []
    m = re.search(r'^\s*3-\d+\.\s*만들지 말 것\s*$', body, re.M)
    if m:
        tail = body[m.start():].split('\n')
    while tail and (tail[-1].strip() == '' or tail[-1].startswith('####')):
        tail.pop()
    while preamble and preamble[-1].strip() == '':
        preamble.pop()
    return '\n'.join(preamble).strip('\n'), '\n'.join(tail).strip('\n')


def build_section3(routines, preamble, tail):
    on = [t for t in routines if t.get('enabled')]
    off = [t for t in routines if not t.get('enabled')]
    on.sort(key=lambda t: (t.get('cron_expression') or 'zz', t.get('name') or ''))

    p = []
    p.append(BANNER)
    p.append('# 3. 예약(Routine) — 프롬프트 원문')
    p.append(BANNER)
    p.append('')
    p.append(' ※ 예약은 계정에 묶여 있어 넘어오지 않습니다. 새 계정에서 다시 만드십시오.')
    p.append(' ※ 이 절은 scripts/build_handoff_archive.py 가 routines.json 에서 만듭니다.')
    p.append('    손으로 고치지 마십시오 — 다시 만들면 지워집니다.')
    p.append('')
    p.append(' 활성 %d건 · 폐기/중지 %d건 (합 %d건)' % (len(on), len(off), len(routines)))
    p.append('')
    if preamble.strip():
        p.append(KEEP_ON)
        p.append(preamble)
        p.append(KEEP_OFF)
        p.append('')

    for i, t in enumerate(on, 1):
        p.append(RULE)
        p.append(' 3-%d. %s' % (i, (t.get('name') or '').strip()))
        p.append('       일정 : %s' % kst_cron(t.get('cron_expression') or t.get('run_once_at')))
        p.append('       id   : %s' % t.get('id', '-'))
        p.append(RULE)
        p.append('')
        p.append((t.get('prompt') or '(프롬프트가 비어 있습니다)').rstrip())
        p.append('')
        p.append('')

    p.append(RULE)
    p.append(' 3-%d. 폐기·중지한 예약 — 되살리지 마십시오' % (len(on) + 1))
    p.append(RULE)
    p.append('')
    p.append(' 끄기만 하고 지우지 않은 것들입니다. 같은 일을 하는 현행판이 따로 있거나,')
    p.append(' 두 번 돌면 어느 것이 최신인지 헷갈려서 껐습니다. 새 계정에서는')
    p.append(' **다시 만들지 마십시오.**')
    p.append('')
    for t in off:
        p.append('   · %s' % (t.get('name') or '').strip())
        p.append('     일정 %s' % (t.get('cron_expression') or '-'))
    p.append('')
    if tail.strip():
        # 이어받은 꼬리의 번호를 다시 매긴다 — 원문은 3-5 였는데 생성분과 부딪힌다
        tail = re.sub(r'^(\s*)3-\d+\.', r'\g<1>3-%d.' % (len(on) + 2), tail, count=1)
        p.append(RULE)
        p.append(KEEP_ON)
        p.append(tail)
        p.append(KEEP_OFF)
        p.append('')
    p.append('')
    return '\n'.join(p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='쓰지 않고 어긋남만 알린다')
    args = ap.parse_args()

    with io.open(ARCHIVE, encoding='utf-8') as fp:
        old = fp.read()

    routines = load_routines()
    head, sections = split_sections(old)
    if not sections:
        sys.exit('보관본에서 절 구분을 찾지 못했습니다.')

    today = datetime.date.today().isoformat()
    head = re.sub(r'(작성\s+)\d{4}-\d{2}-\d{2}', r'\g<1>' + today, head)

    rebuilt = []
    for sec in sections:
        if sec['num'] == 3:
            pre, tail = carry_over(sec['body'])
            rebuilt.append(build_section3(routines, pre, tail))
        else:
            rebuilt.append(sec['body'])

    new = head + '\n' + '\n'.join(rebuilt)
    new = re.sub(r'\n{4,}', '\n\n\n', new).rstrip() + '\n'

    on = len([t for t in routines if t.get('enabled')])
    carried = len(re.findall(r'^\s*3-\d+\.', new, re.M))

    if args.check:
        if new == old:
            print('어긋남 없음 — 보관본이 routines.json 과 맞습니다.')
            return 0
        print('어긋남 있음 — `python3 scripts/build_handoff_archive.py` 로 다시 만드십시오.')
        return 1

    with io.open(ARCHIVE, 'w', encoding='utf-8') as fp:
        fp.write(new)

    print('인계-보관본.txt 다시 만듦')
    print('  활성 예약 %d건 전문 수록 (이전 판에는 4건만 있었음)' % on)
    print('  절 안 항목 %d개 · %d행 · %d bytes'
          % (carried, len(new.split('\n')), len(new.encode('utf-8'))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
