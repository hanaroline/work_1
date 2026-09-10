# -*- coding: utf-8 -*-
"""빠진 덩어리를 «같은 장을 담은 다른 스냅숏» 에서 메워 넣는다.

왜 필요한가 — 2026-09-10 저녁 수집 세 번(20:48·21:09·23:20)이 모두 네이버를
못 받아 `market_internals`(등락 종목 수·투자자별·프로그램·52주·장중 고저)와
`sectors` 없이 커밋됐다. 종가·환율·수급은 멀쩡한데 그 두 덩어리가 없어서
빌더가 `KeyError` 로 멈췄고, 그날 장마감 판을 내지 못했다.

되짚을 수 있는 이유 — **장 열리기 전에 찍힌 스냅숏은 전날 마감을 담는다.**
실측으로 확인했다.

    9/10 07:40  index_daily[0] 9/9 · breadth 463/400 (9/9 마감값) · sectors 9/9 마감값
    9/10 08:30  breadth 가 전부 0 — 개장 전에 이미 초기화됐다. **쓰면 안 된다**
    9/10 09:04  9/10 장중값

그래서 쓸 수 있는 것은 **07:4x 무렵 한 판뿐**이다. 08:30 은 늦다.

무엇을 메우고 무엇을 못 메우나

    메운다   market_internals · sectors   — 같은 장의 마감값이다
    못 메운다 news                          — 아침 수집은 «그날 아침» 기사다.
                                            전날 마감 보도는 들어 있지 않다.
                                            「왜 그랬는지」는 따로 찾아야 한다.

    money_flow 는 원래 결제일 기준이라 하루이틀 늦다. 날짜를 함께 실으면 된다.

쓰는 법

    python3 scripts/splice_market.py \
        --base   /tmp/base.json      # 그날 마감 뒤 스냅숏(종가·환율이 맞는 것)
        --donor  /tmp/donor.json     # 다음 날 07:4x 개장 전 스냅숏
        --out    /tmp/spliced.json
        --expect 2026-09-10          # 이 날짜의 마감인지 양쪽 다 확인한다

    python3 scripts/build_briefing.py --market /tmp/spliced.json --core --date 2026-09-10
    python3 scripts/recheck.py <판> /tmp/spliced.json

**어긋나면 멈춘다.** 기증본이 그 장을 담고 있지 않으면(날짜가 안 맞거나 등락
종목 수가 0 이면) 아무것도 쓰지 않고 끝 상태 1 을 준다 — 다른 날 수급을
그날 것처럼 싣는 것이 판을 못 내는 것보다 나쁘기 때문이다.

메운 자리는 `spliced_from` 에 남는다. **검증 노트에 반드시 적으십시오.**
"""
import argparse
import datetime
import json
import sys

# 메울 수 있는 덩어리. 「같은 장의 마감값」인 것만 넣는다.
FILLABLE = ["market_internals", "sectors", "money_flow"]

KST = datetime.timezone(datetime.timedelta(hours=9))
CLOSE = datetime.time(15, 30)   # 국내 정규장 마감


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def capture_time(j):
    s = (j.get("generated_at_kst") or "").strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            return datetime.datetime.strptime(s, fmt).replace(tzinfo=KST)
        except ValueError:
            pass
    return None


def kr_close_date(j):
    """이 스냅숏이 담고 있는 «국내 마감» 날짜."""
    ser = ((j.get("index_daily", {}).get("kospi") or {}).get("series") or [{}])
    return ser[0].get("date")


def breadth_alive(j):
    """등락 종목 수가 살아 있는가. 개장 전 초기화된 판은 전부 0 이다."""
    b = ((j.get("market_internals") or {}).get("kospi") or {}).get("breadth") or {}
    return (b.get("advancing") or 0) + (b.get("declining") or 0) > 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True, help="그날 마감 뒤 스냅숏")
    ap.add_argument("--donor", required=True, help="다음 날 개장 «전» 스냅숏")
    ap.add_argument("--out", required=True)
    ap.add_argument("--expect", required=True, help="담고 있어야 할 국내 마감 날짜 (YYYY-MM-DD)")
    a = ap.parse_args()

    base, donor = load(a.base), load(a.donor)
    say = []

    bd, dd = kr_close_date(base), kr_close_date(donor)
    say.append("바탕  %s · 국내 마감 %s" % (base.get("generated_at_kst"), bd))
    say.append("기증  %s · 국내 마감 %s" % (donor.get("generated_at_kst"), dd))

    bad = []
    if bd != a.expect:
        bad.append("바탕이 담은 마감은 %s 인데 %s 를 기대했다" % (bd, a.expect))
    if dd != a.expect:
        bad.append("기증본이 담은 마감은 %s 인데 %s 를 기대했다 "
                   "— 개장 «전» 판인지 보십시오" % (dd, a.expect))
    if not breadth_alive(donor):
        bad.append("기증본의 등락 종목 수가 0 이다 — 개장 직전 초기화된 판이라 쓸 수 없다"
                   "(07:4x 판을 쓰십시오)")

    # 날짜가 맞아도 **그 장이 끝나기 전에 찍힌 것**이면 장중값이다. 9/10 09:04
    # 판은 index_daily 날짜가 9/10 이고 등락 종목 수도 살아 있지만 «장중» 이라
    # 마감값이 아니다 — 이것을 마감으로 싣는 것이 8/27·8/28·8/31 의 잘못이었다.
    cap = capture_time(donor)
    try:
        floor = datetime.datetime.combine(
            datetime.date.fromisoformat(a.expect), CLOSE, tzinfo=KST)
    except ValueError:
        floor = None
        bad.append("--expect 를 날짜로 읽지 못했다: %s" % a.expect)
    if floor is not None:
        if cap is None:
            bad.append("기증본의 수집 시각을 읽지 못했다 — 장중 자료인지 가릴 수 없다")
        elif cap < floor:
            bad.append("기증본이 %s 에 찍혔다 — %s 마감(%s) «전» 이라 장중값이다"
                       % (cap.strftime("%m-%d %H:%M"), a.expect, floor.strftime("%H:%M")))

    missing = [k for k in FILLABLE if not base.get(k)]
    if not missing:
        bad.append("바탕에 빠진 덩어리가 없다 — 메울 것이 없으니 바탕을 그대로 쓰십시오")

    if bad:
        print("\n".join(say))
        for m in bad:
            print("  X " + m)
        print("판정: 메우지 않았다")
        return 1

    out = dict(base)
    took, skipped = [], []
    for k in missing:
        if donor.get(k):
            out[k] = donor[k]
            took.append(k)
        else:
            skipped.append(k)

    out["spliced_from"] = {
        "donor_generated_at_kst": donor.get("generated_at_kst"),
        "sections": took,
        "note": ("개장 전 스냅숏에서 같은 장의 마감값을 옮겨 왔다. "
                 "검증 노트에 적을 것."),
    }
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)

    print("\n".join(say))
    print("  O 메웠다: %s" % ", ".join(took))
    if skipped:
        print("  ~ 기증본에도 없어 못 메웠다: %s" % ", ".join(skipped))
    print("  ~ news 는 메우지 않는다 — 아침 수집은 그날 아침 기사다")
    print("냄: %s" % a.out)
    print("판정: 썼다 — 검증 노트에 «메운 자리» 를 적으십시오")
    return 0


if __name__ == "__main__":
    sys.exit(main())
