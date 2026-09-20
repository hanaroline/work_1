#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""두 벌의 수집물 가운데 **어느 것이 더 새로운가**를 가린다.

왜 이것이 있는가
──────────────────────────────────────────────────────────────────────
수집기가 밀어 넣다 거절당하는 일이 있다. 그사이 다른 판이 먼저 들어간 것이다.
지금까지는 `git pull --rebase` 로 기웠는데, 같은 수집기의 두 판이 부딪히면
**되받기가 반드시 충돌한다** — 산출물이 한 줄짜리 JSON 이라 같은 줄이 양쪽에서
통째로 달라지고, 기울 자리가 없다. 2026-09-20 매매 타이밍 갱신이 그렇게 죽었다.

매매 타이밍 갱신은 **다시 셈해서** 풀었다(kis-timing.yml 의 커밋 단계). 그 판은
저장소 자료의 함수라, 남의 커밋 위에서 다시 내면 그만이기 때문이다.

**수집물은 그렇지 않다.** 이것은 어느 시각에 망에서 받아 온 스냅숏이고, 다시
셈할 수가 없다 — 다시 **받아야** 한다. 157종을 다시 두드리는 것은 비싸고, 무엇보다
더 옳지도 않다. 이미 받아 둔 것이 있으니까.

그래서 수집기에는 다른 규칙을 쓴다. **두 스냅숏이 부딪히면 새것을 남긴다.**
받아 온 시각은 산출물이 스스로 적어 둔다(generated_at_kst).

  내 판이 새롭다  → 0. 부른 쪽이 내 판을 되돌려 놓고 다시 민다.
  남의 판이 새롭다 → 3. 부른 쪽은 아무것도 하지 않는다 — 남의 판이 남는다.
                       그러면 밀어 넣을 것이 없어 「변경 없음」으로 끝난다.
  가릴 수 없다    → 1. 시각이 적혀 있지 않으면 **조용히 지지 않는다.**
                       둘 중 하나가 까닭 없이 사라지는 것보다 빨간 판이 낫다.

  python3 scripts/keep_newer_snapshot.py <남의 판> <내 판>
  python3 scripts/keep_newer_snapshot.py --selftest
"""

import json
import os
import sys

KEY = 'generated_at_kst'
NEWER, ERROR, OLDER = 0, 1, 3


def stamp(path):
    """받아 온 시각을 꺼낸다. 없으면 왜 없는지와 함께 None 을 준다."""
    if not os.path.exists(path):
        return None, '없는 파일'
    try:
        d = json.load(open(path, encoding='utf-8'))
    except (ValueError, OSError) as e:
        return None, '읽지 못했다: %s' % e
    if not isinstance(d, dict) or not d.get(KEY):
        return None, '%s 가 적혀 있지 않다' % KEY
    return str(d[KEY]), ''


def decide(theirs, mine):
    """(종료코드, 할 말) 을 준다. 파일을 건드리지는 않는다."""
    tm, twhy = stamp(theirs)
    mm, mwhy = stamp(mine)

    # 내 판을 읽지 못하면 가릴 것이 없다. 이것은 부른 쪽의 잘못이다.
    if mm is None:
        return ERROR, '내 판을 가릴 수 없다 (%s) — %s' % (mine, mwhy)

    # **남의 판이 아예 없는 것은 흠이 아니다.** 첫 수집이면 그렇다.
    if tm is None and twhy == '없는 파일':
        return NEWER, '남의 판이 없다 — 내 판을 남긴다 (%s)' % mm

    # 있는데 시각이 없으면 가릴 수 없다. 조용히 한쪽을 버리지 않는다.
    if tm is None:
        return ERROR, '남의 판을 가릴 수 없다 (%s) — %s' % (theirs, twhy)

    # 시각은 'YYYY-MM-DD HH:MM:SS' 꼴이라 글자 그대로 견주면 시간순이 된다.
    if mm > tm:
        return NEWER, '내 판이 새롭다 (%s > %s) — 내 판을 남긴다' % (mm, tm)
    return OLDER, '남의 판이 새롭거나 같다 (%s ≤ %s) — 물러난다' % (mm, tm)


# ─────────────────────────────────────────────────────────────────────
# 스스로 시험한다 — 이 가름이 틀리면 수집물 한 벌이 조용히 사라진다
# ─────────────────────────────────────────────────────────────────────

def _selftest():
    import tempfile
    tmp = tempfile.mkdtemp(prefix='keepnewer')
    fails, n = [], [0]

    def put(name, body):
        p = os.path.join(tmp, name)
        if body is None:
            if os.path.exists(p):
                os.remove(p)
        elif isinstance(body, str):
            open(p, 'w', encoding='utf-8').write(body)
        else:
            json.dump(body, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
        return p

    def ok(name, got, want):
        n[0] += 1
        if got != want:
            fails.append('%s — %s 여야 하는데 %s' % (name, want, got))

    T = put('theirs.json', {KEY: '2026-09-20 21:00:00', 'items': {}})
    M = put('mine.json', {KEY: '2026-09-20 21:30:00', 'items': {}})
    ok('내 판이 나중이면 이긴다', decide(T, M)[0], NEWER)

    M = put('mine.json', {KEY: '2026-09-20 20:30:00'})
    ok('내 판이 먼저면 물러난다', decide(T, M)[0], OLDER)

    M = put('mine.json', {KEY: '2026-09-20 21:00:00'})
    ok('같으면 물러난다', decide(T, M)[0], OLDER)

    # **날짜가 넘어가도 시간순이어야 한다** — 글자 그대로 견주는 것이 맞는지
    T = put('theirs.json', {KEY: '2026-09-20 23:59:59'})
    M = put('mine.json', {KEY: '2026-09-21 00:00:01'})
    ok('자정을 넘겨도 새것을 안다', decide(T, M)[0], NEWER)

    # **한 자리 수 시각에 속지 않는가** — '9:05' 는 '21:00' 보다 글자로는 크다.
    # 산출물은 늘 두 자리로 적지만(%H:%M:%S), 그것이 깨지면 여기서 걸려야 한다.
    T = put('theirs.json', {KEY: '2026-09-20 21:00:00'})
    M = put('mine.json', {KEY: '2026-09-20 09:05:00'})
    ok('한 자리 시각에 속지 않는다', decide(T, M)[0], OLDER)

    put('theirs.json', None)
    ok('남의 판이 없으면 내 판을 남긴다', decide(T, M)[0], NEWER)

    T = put('theirs.json', {'items': {}})            # 시각이 없다
    ok('남의 판에 시각이 없으면 멈춘다', decide(T, M)[0], ERROR)

    T = put('theirs.json', 'JSON 이 아니다')
    ok('남의 판이 깨졌으면 멈춘다', decide(T, M)[0], ERROR)

    T = put('theirs.json', {KEY: '2026-09-20 21:00:00'})
    M = put('mine.json', None)
    ok('내 판이 없으면 멈춘다', decide(T, M)[0], ERROR)

    M = put('mine.json', {'items': {}})
    ok('내 판에 시각이 없으면 멈춘다', decide(T, M)[0], ERROR)

    print('시험 %d 가지' % n[0])
    for f in fails:
        print('  - %s' % f)
    print('실패 없음' if not fails else '실패 %d' % len(fails))
    return 1 if fails else 0


def main(argv):
    if argv[:1] == ['--selftest']:
        return _selftest()
    if len(argv) != 2:
        sys.stderr.write(__doc__)
        return ERROR
    code, why = decide(argv[0], argv[1])
    sys.stderr.write('%s\n' % why)
    return code


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
