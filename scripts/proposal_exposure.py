#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""상품이 **실제로 무엇에 노출돼 있는지**를 가린다.

왜 이것이 따로 필요한가
──────────────────────────────────────────────────────────────────────
제안서의 여섯 자산군(국내·해외 × 주식·ETF·펀드)은 **포장지**다. 상장지가
한국이라고 해서 담긴 것이 한국 자산인 것은 아니다. 실제로 이런 일이 있었다.

    「국내ETF 15%」로 인쇄되는 칸에 실제로 담긴 다섯 종목
      TIGER 미국S&P500 · TIGER 미국나스닥100
      KODEX 미국S&P500 · KODEX 미국나스닥100 · KODEX 머니마켓액티브
    → 한국 주식 0%. 같은 지수를 운용사만 바꿔 두 번. 나머지 하나는 현금.

    「국내펀드 20%」에 담긴 다섯 종목은 **전부 MMF** — 사실상 현금이다.

그래서 「국내 40% · 해외 45% · 위험자산 85%」라고 인쇄된 문서의 실제 노출은
한국 주식 5% · 해외 주식 57% · 현금성 38% 였다. 도넛이 사실과 달랐다.

무엇을 돌려주나
──────────────────────────────────────────────────────────────────────
한 상품 → **노출 묶음**(dict). 하나로 몰지 않는 까닭은 혼합형 때문이다.
「채권혼합」이나 TDF 를 주식으로도 채권으로도 적을 수 없어, 쪼개서 적는다.

    exposure(피델리티글로벌테크놀로지)  → {"해외주식": 1.0}
    exposure(칸서스튼튼채권탄탄공모주)   → {"국내주식": 0.3, "국내채권": 0.7}
    exposure(KODEX 머니마켓액티브)      → {"현금성": 1.0}

**추측하지 않는다.** 펀드는 원천이 준 type(국내주식형·MMF…)을 먼저 믿고,
ETF 처럼 type 이 「일반」뿐인 것만 이름으로 가린다. 이름으로도 못 가리면
`None` 을 돌려주고, 부르는 쪽이 그 사실을 세어 적는다 — 못 가린 것을
「국내주식」기본값으로 떨어뜨리면 그 순간 도넛이 또 거짓이 된다.
"""

import re

CLASSES = ["국내주식", "해외주식", "국내채권", "해외채권", "대체", "현금성"]

# 레버리지·인버스는 자산배분 제안서에 올릴 물건이 아니다. 장기 보유하면
# 기초자산이 제자리로 와도 손실이 남는(변동성 끌림) 상품이고, 규모가 커서
# 규모 순으로 고르면 실제로 올라온다 — 「NH-Amundi코리아2배인버스레버리지」가
# 국내펀드 제안 5 종에 들어 있었다.
LEVERAGE_PAT = re.compile(r"레버리지|인버스|2배|3배|LEVERAGE|INVERSE|곱버스|선물\\s*2X|\\b[23]X\\b", re.I)


def is_leveraged(p):
    return bool(LEVERAGE_PAT.search((p.get("name") or "")))

# 혼합형을 쪼개는 비율. 「채권혼합」은 채권이 주(主)라는 뜻이고 「주식혼합」은
# 그 반대다. 실무에서 쓰는 통상값이며, 원천이 실제 비중을 주지 않으므로
# **가정**이다. 산출물에 그렇게 적는다.
MIX = {
    "채권혼합": 0.30,     # 주식 30 / 채권 70
    "주식혼합": 0.70,
    "혼합": 0.50,
}

# ── 이름에서 읽는 표시들 ────────────────────────────────────────────
#
# 순서가 뜻을 갖는다. 위에서부터 맞는 것을 쓴다 — 「미국채권」은 해외이자
# 채권인데, 채권을 먼저 보고 지역을 나중에 보는 식으로 두 축을 따로 가린다.

# **대소문자를 안 가리면 안 된다.** re.I 를 빠뜨렸더니 「Global X Physical
# Gold ETF」가 GOLD 와 안 맞아 금이 아니라 주식으로 분류됐다.
# 「단기채」는 단-기-채라 「단기금융채」·「단기국공채」와 안 맞는다. 실제로
# 이 둘이 현금성이 아니라 **국내주식**으로 분류돼, 「1Q 단기금융채액티브」가
# 국내ETF 추천 1 위에 올라왔다(연변동성 0.2% 짜리가 주식 군에서 견줘졌으니
# 이길 수밖에 없다). 「중단기회사채」는 진짜 크레딧이므로 중이 앞에 붙으면 뺀다.
CASH_PAT = re.compile(
    r"머니마켓|MMF|초단기|(?<!중)단기[가-힣]{0,3}채|KOFR|파킹|통안|양도성|"
    r"CD\s*\d*\s*년?\s*금리|금리플러스|금리액티브|금리투자|"
    r"MONEY\s*MARKET|T-?BILL", re.I)
# 「국고채」는 국-고-채라 「국채」와 안 맞는다. 실제로 ACE 국고채10년과
# KODEX 국고채3년이 채권이 아니라 주식으로 분류됐다.
# 같은 까닭으로 「금융채」·「은행채」·「국공채」도 따로 적어 둔다 — 「채권」과
# 안 맞고, 안 맞으면 마지막 줄에서 주식이 돼 버린다.
BOND_PAT = re.compile(r"채권|국채|국고채|통안채|회사채|금융채|은행채|여전채|특수채|"
                      r"산금채|국공채|크레딧|크레디트|하이일드|물가연동|"
                      r"TIPS|BOND|TREASURY|AGG\b", re.I)
# 「금리」·「기금」처럼 金 자가 들어가는 말에 걸리지 않게 금/은은 따로 본다.
# 「KRX금현물」처럼 금 뒤에 한글이 붙으면 경계 규칙에 안 걸린다.
METAL_PAT = re.compile(r"(^|[^가-힣])(금|은)([^가-힣]|$)|금현물|금선물|은현물|KRX\\s*금|골드|실버|GOLD|SILVER", re.I)
ALT_WORD = re.compile(r"원유|천연가스|원자재|커머디티|리츠|부동산|인프라|"
                      r"OIL|REIT|구리|INFRASTRUCTURE", re.I)

OVERSEAS_PAT = re.compile(
    r"미국|\bUSA?\b|U\.S\.|글로벌|GLOBAL|해외|선진|신흥|이머징|\bEM\b|"
    r"차이나|중국|CHINA|홍콩|항셍|일본|JAPAN|니케이|인도|INDIA|베트남|"
    r"유럽|EURO|독일|대만|TAIWAN|나스닥|NASDAQ|S&P|SP500|다우|DOW|"
    r"필라델피아|서학|MSCI|ACWI|WORLD|러셀|RUSSELL|테슬라|애플|엔비디아|"
    r"빅테크|매그니피센트|아시아|ASIA|브라질|멕시코|영국|프랑스|"
    r"TREASURY|\bUST\b|ISHARES|VANGUARD|SPDR|INVESCO|SCHWAB", re.I)
DOMESTIC_PAT = re.compile(r"코스피|코스닥|KOSPI|KOSDAQ|코리아|KOREA|한국|"
                          r"국고채|통안|국채|KTB", re.I)


def _region(name):
    """이름에서 지역을 가린다.

    **해외 표시를 먼저 본다.** 국내를 먼저 보았더니 「미국채」가 「국채」와
    맞아 국내로 넘어갔다 — 미국 국채를 한국 국채로 적는 셈이다. 해외를
    가리키는 말이 하나라도 있으면 해외로 본다.
    """
    if OVERSEAS_PAT.search(name):
        return "해외"
    if DOMESTIC_PAT.search(name):
        return "국내"
    return None


def _from_name(name):
    """ETF 처럼 type 이 쓸모없을 때 이름으로 가린다. 못 가리면 None."""
    n = name or ""
    if CASH_PAT.search(n):
        return {"현금성": 1.0}
    if ALT_WORD.search(n) or METAL_PAT.search(n):
        return {"대체": 1.0}
    if BOND_PAT.search(n):
        r = _region(n)
        return {"%s채권" % r: 1.0} if r else None
    r = _region(n)
    return {"%s주식" % r: 1.0} if r else None


def _from_fund_type(t, name, region=None):
    """펀드는 원천이 준 것을 믿는다. 이름 짐작보다 이쪽이 정확하다.

    **지역은 반드시 원천이 정한다.** 펀드의 국내/해외는 금융투자협회 전자공시의
    투자지역에서 온 값이고, 그것이 cls(국내펀드·해외펀드)에 이미 들어 있다.
    처음에는 이름으로도 가려 보았는데, 그랬더니 해외펀드 18 종이 이름에 든
    「코리아」·「한국」 때문에 국내주식으로 넘어갔다. 원천이 아는 것을 내가
    다시 짐작할 까닭이 없다.
    """
    t = t or ""
    if "MMF" in t:
        return {"현금성": 1.0}
    if "대체" in t:
        return {"대체": 1.0}
    if not region:
        return None
    # 「기타형」이 그렇듯 type 이 자산 종류를 안 알려 주면 이름에서 찾는다.
    # TDF 56 종이 여기 걸렸다 — type 은 「기타형」인데 이름에 「주식혼합-재간접형」
    # 이라고 적혀 있다.
    src = t if ("혼합" in t or "채권" in t or "주식" in t) else (name or "")
    if "혼합" in src:
        # 「국내혼합형」은 주식·채권 어느 쪽이 주인지 type 만으로는 모른다.
        # 이름에 「채권혼합」·「주식혼합」이 적혀 있으면 그것을 쓰고, 없으면 반반.
        share = MIX["혼합"]
        for k, v in MIX.items():
            if k in src:
                share = v
                break
        return {"%s주식" % region: share, "%s채권" % region: round(1 - share, 4)}
    if "채권" in src:
        return {"%s채권" % region: 1.0}
    if "주식" in src:
        return {"%s주식" % region: 1.0}
    return None


# TDF(타깃데이트펀드)는 그 자체가 **여러 자산군을 섞어 굴리는 자산배분 상품**이다.
# 게다가 목표연도에 따라 구성이 계속 바뀐다. 단일 노출로 잡을 수 없고, 짐작으로
# 비율을 적으면 그 순간 도넛이 또 거짓이 된다. 그래서 가리지 않은 것으로 둔다 —
# 제안 목록에서도 빠진다(자산배분 제안서 안에 또 다른 자산배분을 넣지 않는다).
TDF_PAT = re.compile(r"TDF|타깃데이트|타겟데이트", re.I)

# **혼합형은 순수 프록시로 쓸 수 없다.** 「KODEX 200미국채혼합50」은 KOSPI200
# 절반 + 미국채 절반인데 이름에 「미국채」가 있어 해외채권으로 분류된다. 그것으로
# 해외채권 장기 수익률을 냈더니 8.54% 가 나왔다 — 채권이 아니라 주식 절반이
# 올린 값이다(빌딩블록은 3.81%).
#
# 상품 목록에서까지 뺄 까닭은 없다(채권혼합 ETF 는 실제로 권할 만한 물건이다).
# 다만 기대수익률을 재는 잣대로는 못 쓴다. 그래서 가려내기만 한다.
BLEND_PAT = re.compile(r"혼합|밸런스|BALANCED|ALLOCATION", re.I)


def is_blend(p):
    """여러 자산을 섞은 상품인가 — 순수 프록시로 쓰면 안 되는 것."""
    n = p.get("name") if isinstance(p, dict) else p
    return bool(BLEND_PAT.search(n or "")) or bool(TDF_PAT.search(n or ""))


def exposure(p):
    """상품 하나의 노출 묶음. 가리지 못하면 None 을 돌려준다."""
    cls, kind = p.get("cls") or "", p.get("kind") or ""
    name = p.get("name") or p.get("code") or ""
    if TDF_PAT.search(name):
        return None

    # 개별 주식은 물어볼 것이 없다.
    if kind == "주식":
        return {"국내주식" if cls.startswith("국내") else "해외주식": 1.0}

    if kind == "펀드":
        region = "국내" if cls.startswith("국내") else "해외"
        return _from_fund_type(p.get("type"), name, region)

    # ETF — 해외ETF 는 수집기가 assetClass 를 달아 두었다.
    ac = p.get("assetClass")
    if ac in ("bond", "alternative", "equity") and cls.startswith("해외"):
        return {"equity": {"해외주식": 1.0}, "bond": {"해외채권": 1.0},
                "alternative": {"대체": 1.0}}[ac]
    got = _from_name(name)
    if got:
        return got
    # 이름에 지역 표시가 없으면 **상장지**로 떨어뜨린다. 「TIGER 200」처럼
    # 지수 이름만 적힌 것들이 여기 걸린다. 자산 종류(주식/채권)는 위에서
    # 이미 가렸으므로, 여기서 정하는 것은 지역뿐이다.
    region = "국내" if cls.startswith("국내") else "해외"
    if BOND_PAT.search(name):
        return {"%s채권" % region: 1.0}
    return {"%s주식" % region: 1.0}


def blend(products, weights=None):
    """여러 상품의 노출을 합친다. weights 가 없으면 같은 비중."""
    out = {c: 0.0 for c in CLASSES}
    tot = 0.0
    for i, p in enumerate(products):
        e = exposure(p)
        if not e:
            continue
        w = 1.0 if weights is None else weights[i]
        for c, share in e.items():
            out[c] = out.get(c, 0.0) + w * share
        tot += w
    if tot:
        out = {c: v / tot for c, v in out.items()}
    return {c: v for c, v in out.items() if v > 0}, tot


def audit(products):
    """못 가린 것을 세어 돌려준다. 산출물에 적기 위한 것이다."""
    bad = [p for p in products if not exposure(p)]
    return len(bad), bad[:20]


if __name__ == "__main__":
    import collections
    import json
    import os
    import sys
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    u = json.load(open(os.path.join(root, "data/proposal/universe.json"),
                       encoding="utf-8"))
    per = collections.defaultdict(collections.Counter)
    for p in u["상품"]:
        e = exposure(p)
        key = "·".join(sorted(e)) if e else "못 가림"
        per[p.get("cls")][key] += 1
    for cls in sorted(per):
        print("■ %s" % cls)
        for k, n in per[cls].most_common():
            print("    %-24s %4d" % (k, n))
    n_bad, sample = audit(u["상품"])
    print("\n못 가린 상품 %d" % n_bad)
    for p in sample:
        print("   %-12s %s" % (p.get("cls"), (p.get("name") or "")[:54]))
    sys.exit(0)
