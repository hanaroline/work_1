#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고객 제안서가 쓸 **상품 유니버스**를 하나로 모은다.

왜 따로 만드는가
──────────────────────────────────────────────────────────────────────
제안서는 여섯 자산군(국내·해외 × 주식·ETF·펀드)을 한 표에 올린다. 그런데 원천이
네 갈래로 흩어져 있고 가지도 다르다 — 펀드는 claude/fund-search-tool, 해외주식은
us100-data, 국내주식은 data/prices_naver, ETF 는 main 이다. 화면과 엑셀이 저마다
이 네 곳을 뒤지면 **둘이 서로 다른 숫자를 싣는 날이 온다.** 그래서 한 번 모아
한 파일로 못 박고, 산출물은 그 파일만 본다.

지켜야 할 것 — 이 저장소가 이미 정한 원칙이다
──────────────────────────────────────────────────────────────────────
build_etf_proposal.py 머리말에 이렇게 적혀 있다:

    **여기서는 어떤 수치도 만들어 내지 않는다.** 원천에 없는 값은 빈칸으로 두고,
    (…) 그럴듯한 숫자가 박힌 제안서가 고객에게 나가는 것이 이 작업에서 제일
    비싼 고장이다.

그대로 잇는다. 값마다 **어디서 왔는지(src)와 언제 기준인지(asOf)** 를 달고,
못 셈한 것은 null 로 둔다. 특히:

  · **펀드는 변동성을 셈하지 않는다.** 기준가 이력이 7 거래일뿐이라 연변동성을
    낼 수 없다. 원천의 위험등급(riskGrade)을 쓰고, 그 사실을 flags 에 적는다.
    7 일치로 연변동성을 내면 숫자는 나오지만 그 숫자는 거짓이다.

  · **펀드 보수는 하나로 줄이지 않는다.** 원천 note 가 「국내 공모펀드의 보수는
    원래 클래스마다 다르므로 하나의 숫자로 줄이지 않고 범위로 싣는다」고 적어
    두었다. feeMin~feeMax 를 그대로 옮긴다.

  · **이상치는 버리되 버렸다고 적는다.** 수집기가 기준가 점프(step)를 잡아
    일부 기간을 버리는데 놓치는 것이 있다 — 2026-09-14 판에서 단기채권형 두
    종목이 3 개월 수익률 241%·215% 로 남아 있었다. 자산군별 상한을 넘으면
    그 기간을 빼고 flags 에 적는다.

쓰는 법
  python3 scripts/build_proposal_universe.py
  python3 scripts/build_proposal_universe.py --min-aum 0     # 규모 제한 없이

산출물
  data/proposal/universe.json
"""

import argparse
import json
import math
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "universe.json")

FUND_BRANCH = "origin/claude/fund-search-tool"
US_BRANCH = "origin/us100-data"
KR_BRANCH = "origin/kr100-data"

# 제안에 올릴 만한 규모. 너무 작은 펀드는 환매·운용 안정성이 떨어지고 고객에게
# 권하기 어렵다. 100 억은 실무에서 흔히 쓰는 선이다.
MIN_AUM = 10_000_000_000

# 자산군별 「이 정도를 넘으면 자료가 튄 것」 선. 수집기의 step 보정이 놓친 것을
# 잡는 마지막 그물이다. 넉넉히 잡는다 — 진짜 수익률을 버리면 안 되므로.
SANE_1Y = {"bond": 30.0, "mmf": 15.0, "equity": 200.0,
           "mixed": 100.0, "alternative": 150.0, "other": 150.0}

# 자산군 코드를 우리말로. 고객 제안서의 「유형」 칸에 `equity` 가 그대로 찍혀
# 나갔다 — 원천의 코드를 옮겨 적은 것일 뿐인데 고객에게는 읽을 수 없는 글자다.
ASSET_KO = {"equity": "주식", "bond": "채권", "alternative": "대체",
            "mixed": "혼합", "mmf": "MMF", "other": "기타"}

TRADING_DAYS = 252

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import proposal_exposure as EXP                                   # noqa: E402
import proposal_metrics as MET                                    # noqa: E402


def sh(args):
    r = subprocess.run(args, capture_output=True, text=True, cwd=ROOT)
    return r.stdout if r.returncode == 0 else None


# ── 봉에서 재는 것들 ─────────────────────────────────────────────────

def annual_vol(closes):
    """연변동성(%). 일간 로그수익률의 표준편차에 √252 를 곱한다."""
    if len(closes) < 60:            # 석 달은 있어야 변동성이라 부를 만하다
        return None
    rets = []
    for i in range(1, len(closes)):
        a, b = closes[i - 1], closes[i]
        if a and b and a > 0 and b > 0:
            rets.append(math.log(b / a))
    if len(rets) < 60:
        return None
    mu = sum(rets) / len(rets)
    var = sum((x - mu) ** 2 for x in rets) / (len(rets) - 1)
    return math.sqrt(var) * math.sqrt(TRADING_DAYS) * 100


def max_drawdown(closes):
    """최대낙폭(%). 고점 대비 가장 깊이 빠진 폭."""
    if len(closes) < 20:
        return None
    peak, mdd = None, 0.0
    for c in closes:
        if not c or c <= 0:
            continue
        peak = c if peak is None else max(peak, c)
        mdd = min(mdd, (c - peak) / peak)
    return mdd * 100


def ret_pct(closes, days):
    """최근 `days` 거래일 수익률(%). 봉이 모자라면 None."""
    if len(closes) <= days:
        return None
    a, b = closes[-days - 1], closes[-1]
    if not a or a <= 0 or not b:
        return None
    return (b / a - 1) * 100


def from_bars(closes):
    return {
        "ret1y": ret_pct(closes, TRADING_DAYS),
        "ret6m": ret_pct(closes, TRADING_DAYS // 2),
        "vol": annual_vol(closes),
        "mdd": max_drawdown(closes),
        "bars": len(closes),
    }


# ── 원천별 읽기 ─────────────────────────────────────────────────────

def load_funds(min_aum):
    """국내 설정 공모펀드. 투자지역으로 국내/해외를 가른다.

    「해외펀드」는 해외에 설정된 뮤추얼펀드가 아니라 **해외에 투자하는, 국내에
    설정된 펀드**다. 실무에서 쓰는 뜻과 같지만 산출물에 그렇게 적어 둔다.
    """
    raw = sh(["git", "show", "%s:data/fund.js" % FUND_BRANCH])
    if not raw:
        return [], {"error": "%s 에서 data/fund.js 를 읽지 못했습니다" % FUND_BRANCH}
    m = re.search(r"=\s*(\{.*\})\s*;?\s*$", raw, re.S)
    if not m:
        return [], {"error": "data/fund.js 를 해석하지 못했습니다"}
    doc = json.loads(m.group(1))

    src = "네이버 Npay 증권 + 금융투자협회 전자공시(투자지역)"
    as_of = doc.get("updatedAt", "")[:10]
    out, dropped = [], 0
    for f in doc.get("funds", []):
        region = f.get("region")
        if region not in ("domestic", "overseas"):
            continue                       # 혼합 369 종은 자산군을 못 정한다
        aum = f.get("aum") or 0
        if aum < min_aum:
            continue
        ret = f.get("ret") or {}
        r1y = ret.get("1y")
        if not isinstance(r1y, (int, float)):
            continue

        flags = []
        cap = SANE_1Y.get(f.get("assetClass"), 150.0)
        if abs(r1y) > cap:
            dropped += 1
            flags.append("ret1y_이상치_제외(%.0f%%>%.0f%%)" % (abs(r1y), cap))
            r1y = None
        if f.get("retDropped"):
            flags.append("원천이_버린기간_%s"
                         % ",".join(x.get("period", "?")
                                    for x in f["retDropped"])[:40])

        out.append({
            "id": f["id"],
            "code": f.get("code"),
            "name": f.get("name"),
            "cls": "국내펀드" if region == "domestic" else "해외펀드",
            "kind": "펀드",
            "region": region,
            "assetClass": f.get("assetClass"),
            "type": f.get("type"),
            "company": f.get("company"),
            "riskGrade": f.get("riskGrade"),
            "size": aum,
            "ret1y": r1y,
            "ret6m": ret.get("6m") if isinstance(ret.get("6m"), (int, float)) else None,
            # **변동성은 셈하지 않는다.** 이력이 7 거래일뿐이다.
            "vol": None,
            "mdd": None,
            "feeMin": f.get("feeMin"),
            "feeMax": f.get("feeMax"),
            "src": src,
            "asOf": f.get("retAsOf") or as_of,
            "flags": flags + ["변동성_미산출_이력부족"],
        })
    meta = {"src": src, "asOf": as_of, "count": len(out),
            "ret1y_이상치": dropped,
            "note": ("보수는 클래스마다 달라 하나로 줄이지 않고 범위(feeMin~feeMax)로 "
                     "싣습니다. 변동성·최대낙폭은 기준가 이력이 7 거래일뿐이라 "
                     "셈하지 않고 위험등급을 씁니다.")}
    return out, meta


# 업종코드 → 한글. 화면에 `equity` 나 `semi` 가 그대로 나가면 고객 자료가 아니다.
# 두 화면(kr-top100·us-top100)에서 실제로 쓰이는 23 개를 모두 덮는다.
SECTOR_KO = {
    "fin": "금융", "it": "IT", "semi": "반도체", "heavy": "중공업",
    "hc": "헬스케어", "bio": "바이오", "hold": "지주", "ind": "산업재",
    "infra": "인프라", "comm": "커뮤니케이션", "cs": "필수소비재",
    "cd": "경기소비재", "cons": "건설", "bat": "2차전지", "chem": "화학",
    "elec": "전기전자", "auto": "자동차", "tel": "통신", "eng": "에너지",
    "steel": "철강", "util": "유틸리티", "mat": "소재", "re": "부동산",
}


def load_stock_meta(page, branch, subdir):
    """종목의 **한글명·시총·업종**을 모은다.

    이것이 없으면 제안서 상품표에 `000100.KS` 와 `equity` 가 찍힌다 — 고객에게
    낼 수 없는 표다. 처음 판이 그렇게 나왔고, 게다가 시총이 없어 「규모 순」
    정렬이 사실상 사전순이 되어 **과거 1년 599% 인 종목이 맨 위에 실렸다.**

    이름은 화면 파일의 COMPANIES 배열([심볼, 영문명, 한글명, 업종코드])에서,
    시총은 자료 가지의 latest.json(quote.cap)에서 가져온다.
    """
    meta = {}
    p = os.path.join(ROOT, page)
    if os.path.exists(p):
        body = open(p, encoding="utf-8").read()
        # **COMPANIES 블록 안만 본다.** 파일 뒤쪽에 업종별 종목 묶음 배열이
        # 또 있는데(['005930.KS','000660.KS','042700.KS','036930.KQ'] 꼴), 모양이
        # 같아 함께 잡힌다. 나중 것이 이름을 덮어써 삼성전자의 이름이
        # 「042700.KS」가 됐다 — 고객 표에 종목코드가 이름으로 찍힌 채로.
        start = body.find("COMPANIES")
        block = ""
        if start >= 0:
            end = body.find("\n];", start)
            block = body[start:end if end > 0 else start + 40000]
        # 배열 안에 주석이 섞여 있어 통째로 JSON 파싱이 안 된다. 줄 단위로 집는다.
        # 따옴표는 두 가지가 섞여 있다 — 이름에 아포스트로피가 있으면 큰따옴표를
        # 쓴다("McDonald's"). 홑따옴표만 보면 그런 종목이 조용히 빠진다.
        q = r"""(?:'([^']*)'|"([^"]*)")"""
        for row in re.finditer(r"\[\s*%s\s*,\s*%s\s*,\s*%s\s*,\s*%s\s*\]"
                               % (q, q, q, q), block):
            g = row.groups()
            sym, en, ko, sect = (g[0] or g[1], g[2] or g[3],
                                 g[4] or g[5], g[6] or g[7])
            if not sym:
                continue
            # 3·4 번째 칸이 또 종목코드면 COMPANIES 행이 아니다 — 건너뛴다.
            if re.match(r"^[0-9A-Z.\-]+$", ko) and "." in ko:
                continue
            meta.setdefault(sym, {})
            meta[sym].update({"name": ko or en,
                              "sector": SECTOR_KO.get(sect, sect or None)})

    raw = sh(["git", "show", "%s:%s/latest.json" % (branch, subdir)])
    if raw:
        try:
            doc = json.loads(raw)
            # 환율은 자료에 적힌 것을 쓴다. 해외 시총을 원화로 견주려면 필요한데,
            # 여기서 아무 환율이나 가져다 쓰면 그 수치의 기준일이 사라진다.
            fx = (doc.get("fx") or {}).get("usdkrw")
            if isinstance(fx, (int, float)):
                meta["_fx"] = {"usdkrw": fx, "src": "%s/latest.json" % subdir}
            for sym, c in (doc.get("companies") or {}).items():
                q = c.get("quote") or {}
                meta.setdefault(sym, {})
                if isinstance(q.get("cap"), (int, float)):
                    meta[sym]["cap"] = q["cap"]
                if not meta[sym].get("sector"):
                    prof = c.get("profile") or {}
                    meta[sym]["sector"] = prof.get("sector")
        except ValueError:
            pass
    return meta


def kis_kr_overrides():
    """국내주식 일봉을 **증권사 값으로 갈아 끼운다.**

    왜 — kr100-data 의 일봉은 야후 파이낸스다. 그런데 이 저장소는 야후·네이버를
    한국투자증권으로 심판해 `data/prices_kis/verdict.txt` 에 결론을 적어 두었다:
    갈리는 봉의 **89.1% 에서 네이버가 맞고 야후가 틀렸다**. 그 결론을 내려놓고
    고객 제안서만 야후로 만들면, 회사가 스스로 틀렸다고 판정한 숫자를 고객에게
    내미는 셈이 된다. 실제로 벌어지던 차이는 작지 않다 — 삼성전자 1년 수익률이
    야후 272.3%, 증권사 223.0% 로 49%p 어긋났다.

    무엇을 바꾸나 — 수익률·변동성·최대낙폭, 그리고 **시가총액**. 시총은 원천이
    주가로 셈한 값이라 주가가 틀리면 같이 틀린다. 주식수(= 시총 ÷ 야후 종가)는
    어느 쪽 시세를 쓰든 같으므로, 거기에 증권사 종가를 곱해 고쳐 놓는다.

    없으면 갈아 끼우지 않고 야후 그대로 둔다 — 빈칸으로 만들지 않는다. 대신
    무엇을 썼는지는 상품마다 `src` 에 남으므로 표에서 섞이지 않는다.
    """
    p = os.path.join(ROOT, "data", "prices_kis", "kr100.json")
    if not os.path.exists(p):
        return {}, None
    try:
        doc = json.load(open(p, encoding="utf-8"))
    except ValueError:
        return {}, None
    out = {}
    for code, v in (doc.get("stocks") or {}).items():
        closes = [c for c in (v.get("c") or []) if isinstance(c, (int, float))]
        if len(closes) < 60:
            continue
        out[code] = {"m": from_bars(closes), "last": closes[-1],
                     "closes": closes, "dates": v.get("d") or [],
                     "asOf": (v.get("d") or [None])[-1]}
    return out, doc.get("source")


def load_branch_bars(branch, subdir, cls, kind, limit=0, meta=None):
    """자료 가지의 일봉 파일들을 읽는다(kr100-data · us100-data 공통 모양)."""
    listing = sh(["git", "ls-tree", "--name-only",
                  "%s:%s" % (branch, subdir)])
    if not listing:
        return [], {"error": "%s:%s 를 읽지 못했습니다" % (branch, subdir)}
    names = [x for x in listing.split() if x.endswith(".json")]
    if limit:
        names = names[:limit]

    meta = meta or {}
    fx = (meta.get("_fx") or {}).get("usdkrw")
    ccy = "KRW" if cls.startswith("국내") else "USD"
    # 국내주식만 증권사 값으로 갈아 끼운다. 해외주식은 심판을 돌린 적이 없으므로
    # 손대지 않는다 — 검증하지 않은 것을 검증한 것처럼 바꾸면 안 된다.
    kis, kis_src = kis_kr_overrides() if cls == "국내주식" else ({}, None)
    swapped = 0

    out = []
    for name in names:
        raw = sh(["git", "show", "%s:%s/%s" % (branch, subdir, name)])
        if not raw:
            continue
        try:
            doc = json.loads(raw)
        except ValueError:
            continue
        d = doc.get("daily") or {}
        closes = [c for c in (d.get("c") or []) if isinstance(c, (int, float))]
        if len(closes) < 60:
            continue
        sym = doc.get("symbol") or name[:-5]
        m = from_bars(closes)
        info = meta.get(sym) or {}
        # 시총은 원화로 통일한다 — 표에서 국내·해외를 나란히 견주려면 통화가
        # 같아야 한다. 환산에 쓴 환율과 기준을 doc 에 적어 두고, 환산했다는
        # 사실도 남긴다(원 통화 값을 잃지 않게).
        cap = info.get("cap")
        cap_krw = cap
        if cap is not None and ccy == "USD":
            cap_krw = cap * fx if fx else None

        src = "야후 파이낸스 일봉 %d 봉 (%s)" % (m["bars"], branch)
        as_of_one = (d.get("d") or [None])[-1]
        flags = []
        k = kis.get(sym)
        if k:
            m = k["m"]
            # 주식수는 시세와 무관하다 — 야후 시총을 야후 종가로 나누면 나온다.
            if cap_krw and closes[-1]:
                cap_krw = cap_krw / closes[-1] * k["last"]
                cap = cap_krw
            src = "%s %d 봉" % (kis_src or "한국투자증권 오픈API", m["bars"])
            as_of_one = k["asOf"] or as_of_one
            flags.append("야후_대신_증권사시세_사용")
            swapped += 1
        out.append({
            "id": "%s:%s" % (kind, sym),
            "code": sym,
            "name": info.get("name") or sym,
            "cls": cls, "kind": kind,
            "region": "domestic" if cls.startswith("국내") else "overseas",
            "assetClass": "equity",
            "type": info.get("sector"),
            "size": cap_krw, "sizeCcy": "KRW",
            "sizeNative": cap, "sizeNativeCcy": ccy,
            "riskGrade": None,
            "ret1y": m["ret1y"], "ret6m": m["ret6m"],
            "vol": m["vol"], "mdd": m["mdd"],
            "feeMin": None, "feeMax": None,
            "src": src,
            "asOf": as_of_one,
            "flags": flags,
            # 지표를 셈할 때 쓰고 버린다 — 산출물에는 남기지 않는다.
            "_closes": (k["closes"] if k and k.get("closes") else closes),
            "_dates": (k["dates"] if k and k.get("dates") else (d.get("d") or None)),
        })
    as_of = max((p["asOf"] for p in out if p.get("asOf")), default=None)
    if swapped:
        src_label = ("%s — %d 종 (나머지 %d 종은 야후 파이낸스)"
                     % (kis_src or "한국투자증권 오픈API", swapped,
                        len(out) - swapped))
        note = ("야후·네이버를 증권사 값으로 심판한 결과(data/prices_kis/verdict.txt) "
                "야후가 갈리는 봉의 89.1%에서 틀렸으므로, 국내주식은 증권사 "
                "일봉으로 갈아 끼웠습니다. 시가총액도 같은 종가로 고쳐 셈했습니다.")
    else:
        src_label = "야후 파이낸스 일봉 (자료 가지 %s)" % branch.split("/")[-1]
        note = None
    return out, {"src": src_label, "count": len(out), "asOf": as_of,
                 "note": note, "환율": meta.get("_fx")}


def load_kr_etf():
    """국내 ETF — 시세 76 종(봉 있음) + 커버드콜 664 종(봉 없음, 파생값만)."""
    out = []
    meta = {}

    p = os.path.join(ROOT, "data", "etf", "prices.json")
    if os.path.exists(p):
        doc = json.load(open(p, encoding="utf-8"))
        for it in (doc.get("items") or {}).values():
            # 봉은 {d:[...], o:[...], …} 꼴이다 — 봉마다 하나씩인 리스트가 아니다.
            # 처음에 리스트로 읽어 76 종이 통째로 빠졌고, 그러면 ETF 수익률이
            # 조용히 빈칸이 된다. 빈칸이 조용히 생기는 것이 제일 나쁘다.
            bars = it.get("bars") or {}
            closes = [c for c in (bars.get("c") or [])
                      if isinstance(c, (int, float))]
            if len(closes) < 60:
                continue
            m = from_bars(closes)
            out.append({
                "id": "ETF:%s" % it.get("code"),
                "code": it.get("code"), "name": it.get("name"),
                "cls": "국내ETF", "kind": "ETF", "region": "domestic",
                "assetClass": "equity", "type": it.get("theme"),
                "size": None, "riskGrade": None,
                "ret1y": m["ret1y"], "ret6m": m["ret6m"],
                "vol": m["vol"], "mdd": m["mdd"],
                "feeMin": None, "feeMax": None,
                "src": "data/etf/prices.json (일봉 %d 봉)" % m["bars"],
                "asOf": (doc.get("generated_at_kst") or "")[:10],
                "flags": [],
            })
        meta["시세"] = {"src": doc.get("source"), "count": len(out),
                        "asOf": (doc.get("generated_at_kst") or "")[:10]}

    # ETFCHECK 수집본 — 664 종. 봉은 없지만 **연변동성·보수·설정액·분배율**이
    # 이미 셈해져 있다(변동성은 일간 NAV 로그수익률 × √252 × 100 으로, 여기서
    # 봉으로 내는 것과 같은 방식이다). 다만 **총수익률이 없다** — 분배율은
    # 분배금만 본 것이라 가격 등락을 담지 않는다. 그래서 수익률은 빈칸으로 두고,
    # 봉이 있는 종목(data/etf/prices.json)과 겹치면 그쪽 수익률을 가져다 붙인다.
    by_code = {p["code"]: p for p in out}
    p = os.path.join(ROOT, "data", "cc_etf.json")
    if os.path.exists(p):
        doc = json.load(open(p, encoding="utf-8"))
        as_of = (doc.get("asOf") or doc.get("collectedAt") or "")[:10]
        src = "data/cc_etf.json (%s)" % (doc.get("source") or "ETFCHECK")
        n = skipped = 0
        for it in doc.get("items", []):
            # 수집기가 스스로 「채택하지 않음」으로 판정한 것은 따르지 않는다.
            # 그 판정 근거는 excludeReason 에 있다.
            if it.get("adopted") is False:
                skipped += 1
                continue
            code = it.get("code")
            if not code:
                continue
            merged = by_code.get(code)
            row = {
                "id": "ETF:%s" % code, "code": code, "name": it.get("name"),
                "cls": "국내ETF", "kind": "ETF", "region": "domestic",
                "assetClass": it.get("assetClass"), "type": it.get("type"),
                "company": it.get("manager"),
                "size": it.get("aum"), "riskGrade": None,
                # 수익률은 봉이 있는 쪽에서만 온다. 없으면 빈칸이다.
                "ret1y": merged.get("ret1y") if merged else None,
                "ret6m": merged.get("ret6m") if merged else None,
                "vol": it.get("volatility"),
                "mdd": merged.get("mdd") if merged else None,
                "distTtmRate": it.get("distTtmRate"),
                "payoutFreq": it.get("payoutFreq"),
                "feeMin": it.get("expenseRatio"), "feeMax": it.get("ter"),
                "src": src if not merged else "%s + %s" % (src, merged["src"]),
                "asOf": as_of,
                "flags": [] if merged else ["수익률_미제공_배분계산_제외"],
            }
            if it.get("volatilityDays"):
                row["volDays"] = it["volatilityDays"]
            if merged:
                out[out.index(merged)] = row       # 봉 쪽 값을 살려 덮어쓴다
            else:
                out.append(row)
            n += 1
        meta["ETFCHECK"] = {"src": doc.get("source"), "count": n,
                            "채택안함_제외": skipped, "asOf": as_of}

    # 출처 표는 자산군마다 한 줄이다. 안에 또 갈래를 두면 그 줄이 「—」로 비어
    # 고객이 보는 자료에 원천이 사라진다. 그래서 겉에 한 줄로 요약해 둔다.
    # 원천 이름이 늘 문자열인 것은 아니다 — etf/prices.json 의 source 는
    # {'KR': …, 'OV': …} 꼴이다. 그대로 적으면 고객 자료에 파이썬 딕셔너리가
    # 찍힌다. 값만 풀어서 사람이 읽을 한 줄로 만든다.
    parts = []
    for m in meta.values():
        src = m.get("src") if isinstance(m, dict) else None
        if isinstance(src, dict):
            parts += [str(v) for v in src.values() if v]
        elif src:
            parts.append(str(src))
    flat = {"src": " + ".join(dict.fromkeys(parts))[:120] or "—",
            "count": len(out),
            "asOf": max((m.get("asOf") for m in meta.values()
                         if isinstance(m, dict) and m.get("asOf")), default=None),
            "갈래": meta}
    return out, flat


def load_overseas_etf():
    """해외 ETF — KIS 로 받아 둔 것이 있으면 읽는다.

    **없으면 빈 칸으로 두고 왜 없는지 적는다.** 여기서 그럴듯한 값을 만들어
    넣으면 제안서에 근거 없는 상품이 실린다.
    """
    p = os.path.join(ROOT, "data", "proposal", "overseas_etf.json")
    if not os.path.exists(p):
        return [], {"count": 0,
                    "note": ("아직 받지 않았습니다 — scripts/fetch_overseas_etf_kis.py "
                             "를 러너에서 돌리면 채워집니다. 그 전까지 해외ETF 는 "
                             "제안에 올리지 않습니다.")}
    doc = json.load(open(p, encoding="utf-8"))
    out = []
    for it in doc.get("items", []):
        closes = it.get("c") or []
        if len(closes) < 60:
            continue
        m = from_bars(closes)
        out.append({
            "id": "OETF:%s" % it["symbol"], "code": it["symbol"],
            "name": it.get("name") or it["symbol"],
            "cls": "해외ETF", "kind": "ETF", "region": "overseas",
            "assetClass": it.get("assetClass") or "equity",
            # KIS 일봉 TR 은 운용사도 설정액도 주지 않는다. 그래서 그 두 칸은
            # 비워 둔다(만들어 넣지 않는다). 유형만은 우리말로 옮긴다.
            "type": ASSET_KO.get(it.get("assetClass") or "equity"),
            "company": None,
            "size": None, "riskGrade": None,
            "ret1y": m["ret1y"], "ret6m": m["ret6m"],
            "vol": m["vol"], "mdd": m["mdd"],
            "feeMin": None, "feeMax": None,
            "src": doc.get("source", "한국투자증권 오픈API"),
            "asOf": (doc.get("generated_at_kst") or "")[:10],
            "flags": [],
        })
    return out, {"src": doc.get("source"), "count": len(out),
                 "asOf": (doc.get("generated_at_kst") or "")[:10]}


# ── 자산군 집계 ─────────────────────────────────────────────────────

def median(xs):
    xs = sorted(x for x in xs if isinstance(x, (int, float)))
    if not xs:
        return None
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def attach_metrics(products):
    """상품에 **다년 지표**(1·3·5해 CAGR·변동성·최대낙폭)를 붙인다.

    이것이 없으면 상품을 규모나 1 해 수익률로밖에 못 고른다 — 바로 고치려던
    그 문제다. 일봉이 있는 것만 붙고, 없는 것(펀드)은 비워 둔다. 비어 있다는
    사실 자체가 선정에서 「못 쟀습니다」로 드러난다.

    일봉의 출처가 둘이라 겹치면 **긴 쪽이 이긴다** — KIS 로 새로 받은
    kr_bars.json 이 보통 더 길다(10 해). 원천 이름도 함께 적어 둔다.
    """
    bars = {}
    p = os.path.join(OUT_DIR, "kr_bars.json")
    if os.path.exists(p):
        try:
            doc = json.load(open(p, encoding="utf-8"))
            for code, v in (doc.get("items") or {}).items():
                bars[code] = (v.get("d") or [], v.get("c") or [],
                              doc.get("source"))
        except ValueError:
            pass

    n_long, n_any = 0, 0
    for prod in products:
        code = str(prod.get("code") or "").split(".")[0].lstrip("A")
        got = bars.get(code)
        d, c, src = got if got else (None, None, None)
        # 일봉 원천이 없으면, 로더가 이미 들고 있던 봉으로라도 잰다.
        # **어느 쪽이든 임시 필드는 반드시 뺀다.** 처음에는 kr_bars 가 있을 때
        # 안 뺐더니 종가 배열이 산출물에 그대로 실려 파일이 2 MB 로 불었다.
        fallback_c = prod.pop("_closes", None)
        fallback_d = prod.pop("_dates", None)
        if not c:
            c, d, src = fallback_c, fallback_d, prod.get("src")
        if not c or len(c) < 60:
            continue
        if not d or len(d) != len(c):
            d = [""] * len(c)
        m = MET.measure(d, c)
        m["src"] = str(src or "")[:80]
        prod["지표"] = m
        n_any += 1
        if "3" in m["창"] or "5" in m["창"]:
            n_long += 1
    return n_any, n_long


def reassign_by_exposure(products):
    """**자산군을 상장지가 아니라 실제 노출로 다시 정한다.**

    여기가 「국내ETF 15%」에 미국 지수만 담기던 고장의 고침 자리다. 국내에
    상장됐다고 국내 자산인 것이 아니다 — TIGER 미국S&P500 은 국내 상장이지만
    담긴 것은 미국 주식이므로, 고객에게는 「해외」로 보여야 맞다.

    같은 이유로 **현금성은 상품 칸에서 뺀다.** MMF 와 단기채 ETF 는 규모가
    커서 규모 순으로 고르면 늘 맨 위에 오는데, 그것이 「국내펀드 20%」를 통째로
    현금으로 만들었다. 현금은 배분표의 현금 줄이 이미 맡고 있으므로, 상품으로
    또 권할 까닭이 없다.

    자산군을 바꾸되 **원래 무엇이었는지는 남긴다**(cls_원본) — 나중에 왜 옮겼는지
    따져 볼 수 있어야 한다.
    """
    moved, dropped, unknown, levered = 0, 0, 0, 0
    out = []
    for p in products:
        # 레버리지·인버스는 아예 싣지 않는다. 자산배분 제안서에 올릴 물건이
        # 아니고, 규모가 커서 규모 순으로 고르면 실제로 올라온다.
        if EXP.is_leveraged(p):
            levered += 1
            continue
        e = EXP.exposure(p)
        if not e:
            unknown += 1
            p["flags"] = (p.get("flags") or []) + ["노출_미분류"]
            out.append(p)
            continue
        p["노출"] = {k: round(v, 4) for k, v in e.items()}
        # 노출이 현금성뿐이면 **자산군을 「현금성」으로 옮긴다.** 제안 자산군
        # (국내ETF·국내펀드…)에 없으므로 상품으로는 권해지지 않는다.
        #
        # 버리지 않는 까닭 — 처음에는 통째로 지웠는데, 그러자 무위험수익률을
        # MMF 1 년 수익률로 재던 proposal_cma.py 가 잴 것을 잃고 기대수익률
        # 전체가 무너졌다. 권하지 않는 것과 갖고 있지 않은 것은 다르다.
        if set(e) == {"현금성"}:
            dropped += 1
            p["cls_원본"] = p["cls"]
            p["cls"] = "현금성"
            p["flags"] = (p.get("flags") or []) + ["현금성_제안대상아님"]
            out.append(p)
            continue
        if p.get("kind") == "ETF":
            # 주식·채권 어느 쪽이든 **지역**만 보고 국내/해외 ETF 를 다시 정한다.
            share = {"국내": 0.0, "해외": 0.0}
            for c, v in e.items():
                if c.startswith("국내"):
                    share["국내"] += v
                elif c.startswith("해외"):
                    share["해외"] += v
            if share["국내"] or share["해외"]:
                want = "국내ETF" if share["국내"] >= share["해외"] else "해외ETF"
                if want != p["cls"]:
                    p["cls_원본"] = p["cls"]
                    p["cls"] = want
                    p["flags"] = (p.get("flags") or []) + ["노출로_자산군_재분류"]
                    moved += 1
        out.append(p)
    return out, {"재분류": moved, "현금성_제외": dropped, "미분류": unknown,
                 "레버리지_제외": levered}


def summarise(products):
    """자산군마다 중앙값을 낸다. **평균이 아니라 중앙값**을 쓰는 까닭은 한두
    종목이 튀어도 자산군 전체 성격이 흔들리지 않게 하기 위해서다."""
    classes = {}
    for p in products:
        classes.setdefault(p["cls"], []).append(p)
    out = {}
    for cls, items in sorted(classes.items()):
        usable = [p for p in items if isinstance(p.get("ret1y"), (int, float))]
        out[cls] = {
            "종목수": len(items),
            "수익률산출가능": len(usable),
            "ret1y_중앙값": median([p.get("ret1y") for p in usable]),
            "vol_중앙값": median([p.get("vol") for p in items]),
            "mdd_중앙값": median([p.get("mdd") for p in items]),
            "변동성_산출": any(isinstance(p.get("vol"), (int, float)) for p in items),
        }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-aum", type=int, default=MIN_AUM,
                    help="펀드 최소 설정액(원). 0 이면 제한 없음")
    ap.add_argument("--us-limit", type=int, default=0,
                    help="해외주식 몇 종목만 (시험용)")
    args = ap.parse_args()

    print("상품 유니버스를 모읍니다.\n")
    products, sources = [], {}

    for label, fn in (
        ("펀드", lambda: load_funds(args.min_aum)),
        ("국내주식", lambda: load_branch_bars(
            KR_BRANCH, "data/kr100/chart", "국내주식", "주식",
            meta=load_stock_meta("kr-top100.html", KR_BRANCH, "data/kr100"))),
        ("해외주식", lambda: load_branch_bars(
            US_BRANCH, "data/us100/chart", "해외주식", "주식", args.us_limit,
            meta=load_stock_meta("us-top100.html", US_BRANCH, "data/us100"))),
        ("국내ETF", load_kr_etf),
        ("해외ETF", load_overseas_etf),
    ):
        items, meta = fn()
        products += items
        sources[label] = meta
        note = meta.get("error") or meta.get("note") or ""
        print("  %-8s %5d 종 %s" % (label, len(items), note[:70]))

    if not products:
        raise SystemExit("\n모은 것이 없습니다 — 원천 가지를 받았는지 보십시오.")

    # **상장지가 아니라 실제 노출로 자산군을 다시 정한다.** 이 한 줄이 없으면
    # 「국내ETF」 칸에 미국 지수만 담기고 「국내펀드」 칸이 통째로 MMF 가 된다.
    n_any, n_long = attach_metrics(products)
    print("\n다년 지표 — 잰 상품 %d (3해 이상 %d)" % (n_any, n_long))

    products, moves = reassign_by_exposure(products)
    print("\n노출로 다시 봄 — 자산군 옮김 %d · 현금성으로 옮김 %d · "
          "레버리지·인버스 뺌 %d · 못 가림 %d"
          % (moves["재분류"], moves["현금성_제외"],
             moves["레버리지_제외"], moves["미분류"]))

    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "정책": {
            "수익률계열": ("주식·ETF 는 일봉에서 직접 셈합니다(최근 252 거래일). "
                           "펀드는 원천이 주는 1 년 수익률을 씁니다 — 두 계열은 "
                           "기준일이 다를 수 있으므로 상품마다 asOf 를 답니다."),
            "변동성": ("일봉이 있는 상품만 연변동성(일간 로그수익률 표준편차 × √252)을 "
                       "셈합니다. **펀드는 이력이 7 거래일뿐이라 셈하지 않고** "
                       "원천의 위험등급을 씁니다."),
            "펀드보수": "클래스마다 달라 하나로 줄이지 않고 범위로 싣습니다.",
            "해외펀드": ("해외에 설정된 뮤추얼펀드가 아니라 **해외에 투자하는, "
                         "국내 설정 공모펀드**입니다."),
            "최소설정액": args.min_aum,
        },
        "원천": sources,
        "자산군": summarise(products),
        "상품": products,
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))

    print("\n자산군별 (중앙값)")
    print("  %-10s %6s %8s %8s %8s" % ("자산군", "종목", "1년수익", "변동성", "최대낙폭"))
    for cls, s in doc["자산군"].items():
        def f(x):
            return "%8.1f" % x if isinstance(x, (int, float)) else "%8s" % "—"
        print("  %-10s %6d %s %s %s"
              % (cls, s["종목수"], f(s["ret1y_중앙값"]),
                 f(s["vol_중앙값"]), f(s["mdd_중앙값"])))
    print("\n  (— 는 원천에 없어 셈하지 않은 것입니다. 만들어 넣지 않습니다.)")
    print("\n%s" % os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
