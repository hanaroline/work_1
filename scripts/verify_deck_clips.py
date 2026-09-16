#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""세미나에서 틀 방송·뉴스 영상이 실제로 그 영상인지 대조한다.

숫자를 대장에 적어 다시 세듯(verify_deck_claims.py), 영상도 대장에 적어
다시 확인한다. 발표 자리에서 영상이 안 뜨거나 엉뚱한 것이 뜨는 사고는
숫자가 틀리는 것과 똑같이 그 자리에서 신뢰를 잃는 일이다.

    python3 scripts/verify_deck_clips.py docs/deck/clips.json
    python3 scripts/verify_deck_clips.py docs/deck/clips.json --mark

무엇을 보나

  1. 대장 꼴      — 빠진 칸, 이상한 영상 주소, 뒤집힌 구간, 너무 긴 구간
  2. 영상 실체    — 유튜브 oEmbed 로 실제 제목·채널을 받아 대장과 대조한다.
                    영상이 지워졌거나 임베드가 막혀 있으면 여기서 걸린다.
  3. 구간 확인    — 사람이 미리 보고 정한 구간인가(check.range).
                    이것만은 기계가 대신 못 하므로 재생 페이지에서 잡는다.

--mark 를 주면 2번을 통과한 클립의 check.id 를 true 로 적어 둔다.
check.range 는 손대지 않는다 — 사람이 본 적 없는 구간을 「확인」으로
적는 길을 열어 두지 않는다.

이 저장소의 실행 환경에서는 유튜브 망이 막혀 있을 수 있다. 그때는 2번을
돌리지 못하므로 통과가 아니라 「확인 못 함(2)」으로 끝낸다. 발표할 PC에서
한 번 돌려 주면 된다.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from difflib import SequenceMatcher

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OEMBED = "https://www.youtube.com/oembed?url=%s&format=json"
WATCH = "https://www.youtube.com/watch?v=%s"
VIDEO_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
MAX_SPAN = 180          # 세미나에서 한 클립에 쓸 수 있는 최대 초. 3분을 넘기면 흐름이 끊긴다.
MIN_SPAN = 15


# ── 글자 비교 ────────────────────────────────────────────────────────
def norm(s):
    """제목 비교용으로 따옴표·공백·괄호 같은 흔들리는 글자를 털어 낸다."""
    s = (s or "").lower()
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"[\s　]+", "", s)
    s = re.sub(r"[\"'`\[\]()〈〉<>|·•…,.!?~\-–—/\\:]+", "", s)
    return s


def close_enough(mine, theirs):
    a, b = norm(mine), norm(theirs)
    if not a or not b:
        return False
    if a in b or b in a:
        return True
    return SequenceMatcher(None, a, b).ratio() >= 0.62


# ── 유튜브에 물어보기 ────────────────────────────────────────────────
class Unreachable(Exception):
    """유튜브에 닿지 못했다 — 영상이 틀렸다는 뜻이 아니라 확인을 못 했다는 뜻이다."""


def oembed(video):
    url = OEMBED % urllib.parse.quote(WATCH % video, safe="")
    req = urllib.request.Request(url, headers={"User-Agent": "deck-clip-check/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise ValueError("임베드가 막힌 영상(HTTP %d) — 재생 페이지에서 안 뜬다" % e.code)
        if e.code == 404:
            raise ValueError("그런 영상이 없다(HTTP 404) — 지워졌거나 주소가 틀렸다")
        raise Unreachable("HTTP %d" % e.code)
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        raise Unreachable(str(getattr(e, "reason", e)))


# ── 대장 꼴 검사 ─────────────────────────────────────────────────────
def shape_errors(book):
    bad = []
    gids = {g.get("id") for g in book.get("groups", [])}
    seen = set()
    for c in book.get("clips", []):
        cid = c.get("id") or "(이름 없음)"
        for key in ("group", "region", "channel", "title", "video", "gist"):
            if not c.get(key):
                bad.append((cid, "'%s' 칸이 비었다" % key))
        if cid in seen:
            bad.append((cid, "같은 id 가 두 번 나온다"))
        seen.add(cid)
        if c.get("group") not in gids:
            bad.append((cid, "묶음 '%s' 이 groups 에 없다" % c.get("group")))
        if not VIDEO_RE.match(c.get("video") or ""):
            bad.append((cid, "영상 주소가 유튜브 꼴이 아니다: %r" % c.get("video")))
        s, e = c.get("start"), c.get("end")
        if not isinstance(s, int) or not isinstance(e, int):
            bad.append((cid, "구간이 초 단위 정수가 아니다"))
        elif s < 0 or e <= s:
            bad.append((cid, "구간이 뒤집혔다 (%s초 → %s초)" % (s, e)))
        elif e - s > MAX_SPAN:
            bad.append((cid, "구간이 %d초 — %d초를 넘기면 흐름이 끊긴다" % (e - s, MAX_SPAN)))
        elif e - s < MIN_SPAN:
            bad.append((cid, "구간이 %d초 — 너무 짧다(%d초 이상)" % (e - s, MIN_SPAN)))
    return bad


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    mark = "--mark" in argv
    path = args[0] if args else os.path.join(ROOT, "docs/deck/clips.json")

    with open(path, encoding="utf-8") as f:
        book = json.load(f)
    clips = book.get("clips", [])

    print("영상 대장 확인 — %d편 (%s 기준)\n" % (len(clips), book.get("기준", "?")))

    bad = shape_errors(book)
    for cid, why in bad:
        print("  !!  %-14s %s" % (cid, why))
    if bad:
        print()

    unreachable = 0
    confirmed = 0
    broken = {cid for cid, _ in bad}
    for c in clips:
        cid = c["id"]
        if cid in broken:
            continue                       # 대장부터 틀린 클립은 유튜브에 물어볼 것도 없다
        try:
            info = oembed(c["video"])
        except Unreachable as e:
            print("  ??  %-14s 유튜브에 닿지 못함 (%s)" % (cid, e))
            unreachable += 1
            continue
        except ValueError as e:
            print("  !!  %-14s %s" % (cid, e))
            bad.append((cid, str(e)))
            continue

        got_title = info.get("title", "")
        got_chan = info.get("author_name", "")
        ok_title = close_enough(c["title"], got_title)
        ok_chan = close_enough(c["channel"], got_chan)
        if ok_title and ok_chan:
            print("  OK  %-14s %s · %s" % (cid, got_chan, got_title))
            c.setdefault("check", {})["id"] = True
            confirmed += 1
        else:
            print("  !!  %-14s 대장과 다른 영상이다" % cid)
            if not ok_chan:
                print("      %-12s 대장 %s · 실제 %s" % ("채널", c["channel"], got_chan))
            if not ok_title:
                print("      %-12s 대장 %s" % ("제목", c["title"]))
                print("      %-12s 실제 %s" % ("", got_title))
            c.setdefault("check", {})["id"] = False
            bad.append((cid, "대장과 다른 영상"))

    # 구간은 사람이 미리 보고 정했는가
    unseen = [c["id"] for c in clips if not (c.get("check") or {}).get("range")]
    if unseen:
        print("\n  구간 미확인 %d편: %s" % (len(unseen), ", ".join(unseen)))
        print("  → docs/deck/clips.html 에서 미리 보며 잡고, 나온 줄을 대장에 옮겨 적는다.")

    if mark and not unreachable:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(book, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("\n대장에 영상 확인 결과를 적었다: %s" % os.path.relpath(path, ROOT))

    print()
    if bad:
        print("어긋난 영상 %d편 — 이대로 세미나에 걸지 말 것" % len(bad))
        return 1
    if unreachable:
        print("%d편은 확인하지 못했다(망 차단). 발표할 PC에서 다시 돌릴 것" % unreachable)
        return 2
    print("영상 %d편 모두 실체 확인" % confirmed
          + (" · 구간은 %d편이 아직 미확인" % len(unseen) if unseen else " · 구간까지 확인"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
