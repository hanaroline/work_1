# -*- coding: utf-8 -*-
"""판에 인쇄된 수치를 **어느 계열의 어느 기준인가**까지 밝혀 시세 파일과 맞춘다.

`scripts/audit_numbers.py` 는 「이름 옆 숫자」를 계열의 `change_pct` 하나와만
맞췄다. 그래서 두 가지를 구별하지 못했다.

1. **기준(basis)** — 「주간으로 SOX 는 −1.08%」는 일간 등락이 아니라 `perf.w1`
   이다. 8월 27일 모닝 판에서 실제로 이것이 오류로 신고됐다. 판은 맞았고
   검사기가 틀렸다.
2. **어느 수집본인가** — 판 하나에 밤사이 해외 마감과 국내 마감이 함께 들어간다
   (지침 4-3·「휴장 뒤 첫 판」). 두 세션은 **서로 다른 수집 파일**에 있다.
   그래서 어떤 파일 하나를 골라도 60~90 건이 어긋난 것처럼 나왔다.

   같은 판(2026-08-27-morning)을 세 파일로 대조한 실측:

       latest.json(=08-27 수집)   맞은 41 / 어긋난 63
       2026-08-26.json            맞은 17 / 어긋난 87
       2026-08-25.json            맞은  0 / 어긋난 104

   어느 쪽도 판의 상태를 말해 주지 않는다.

여기서는 셋을 바꾼다.

* **계열의 날짜를 본다.** 수집 파일 이름은 *수집한 날*이고 계열의 `date` 는
  *그 값이 속한 세션*이다. `2026-08-27.json` 의 SOX 는 `date=2026-08-26` 이다.
  이 둘을 섞는 것이 「금요일 숫자를 월요일 것이라 말하는」 사고의 통로다.
* **기준을 글에서 읽는다.** 숫자 앞의 말(「주간」·「연초 이후」…)로 `change_pct`
  냐 `perf.w1` 이냐를 가른다.
* **여러 수집본을 함께 본다.** 판이 못박아 둔 수집본 목록 전체에서 찾고,
  **어디에서도 못 찾을 때만** 어긋난 것으로 신고한다.

`resolve()` 가 돌려주는 판정은 셋이다.

    OK       못박은 수집본 가운데 하나에서 그 기준으로 값이 맞았다
    MISMATCH 계열은 찾았는데 어느 수집본·기준으로도 값이 맞지 않는다 — 오류
    UNKNOWN  계열 자체가 시세 파일에 없다 — 사람이 출처를 대야 한다
"""
import hashlib
import io
import json
import os
import re

# ── 계열이 들어 있는 묶음 ────────────────────────────────────────────
# change_pct 를 가진 것만 넣는다. 금리(rates_*)는 bp 로 말하므로 여기서 보지
# 않는다 — recheck.py 가 본다.
GROUPS = ("indices", "stocks", "broker_stocks", "fx_pairs", "kr_etf",
          "us_sectors", "us_stocks", "eu_stocks", "jp_stocks", "cn_stocks")

# 지수는 한글·약칭이 섞여 쓰인다. 글에 나오는 이름 → 시세 파일의 키.
ALIAS = {
    "S&P500": "sp500", "S&P 500": "sp500", "에스앤피500": "sp500",
    "나스닥": "nasdaq", "다우": "dow", "SOX": "sox", "필라델피아 반도체": "sox",
    "러셀2000": "russell", "러셀 2000": "russell", "VIX": "vix", "MOVE": "move",
    "STOXX600": "stoxx600", "STOXX 600": "stoxx600", "DAX": "dax",
    "CAC 40": "cac", "CAC": "cac", "FTSE 100": "ftse", "FTSE MIB": "ftsemib",
    "SMI": "smi", "IBEX 35": "ibex", "IBEX": "ibex", "AEX": "aex",
    "니케이": "nikkei", "닛케이": "nikkei", "토픽스": "topix",
    "항셍": "hangseng", "상하이": "shanghai", "선전": "shenzhen",
    "가권": "taiex", "TAIEX": "taiex", "센섹스": "sensex",
    "ASX 200": "asx", "ASX": "asx",
    "코스피": "kospi", "코스닥": "kosdaq", "코스피200": "kospi200",
    "WTI": "wti", "브렌트": "brent", "구리": "copper", "금": "gold",
}

# ── 기준(basis) ──────────────────────────────────────────────────────
# 숫자 **앞쪽** 창에서 이 말들을 찾아 기준을 정한다. 못 찾으면 일간이다.
BASIS_WORDS = [
    (("주간", "한 주", "1주", "일주일", "주 들어", "주중"), "w1"),
    (("한 달", "월간", "1개월", "한달"), "m1"),
    (("3개월", "석 달", "분기"), "m3"),
    (("6개월", "반년", "여섯 달"), "m6"),
    (("1년", "연간", "12개월", "일 년"), "y1"),
    (("연초 이후", "연초대비", "연초 대비", "YTD", "올해 들어"), "ytd"),
]
BASIS_LABEL = {"day": "일간", "w1": "주간", "m1": "1개월", "m3": "3개월",
               "m6": "6개월", "y1": "1년", "ytd": "연초 이후"}

# 시세 파일이 perf 를 소수 두 자리로 접어 두므로 창은 그에 맞춘다.
TOL = 0.015


def sha12(path):
    """수집본을 못박을 때 쓰는 짧은 지문."""
    h = hashlib.sha256(io.open(path, "rb").read()).hexdigest()
    return h[:12]


def load(paths):
    """수집본 여럿을 읽어 [(이름, 자료)] 로 돌려준다."""
    out = []
    for p in paths:
        with io.open(p, encoding="utf-8") as f:
            out.append((os.path.basename(p), json.load(f)))
    return out


def index_series(data):
    """{계열이름: 항목} — 앞 묶음이 이긴다(indices 가 종목보다 앞이다)."""
    idx = {}
    for grp in GROUPS:
        for name, ent in (data.get(grp) or {}).items():
            if isinstance(ent, dict) and "change_pct" in ent:
                idx.setdefault(name, ent)
    return idx


def candidates(name, snapshots):
    """이름에 해당하는 항목을 못박은 수집본 전체에서 모은다."""
    keys = [name]
    if name in ALIAS:
        keys.append(ALIAS[name])
    found = []
    for label, data in snapshots:
        idx = index_series(data)
        for k in keys:
            if k in idx:
                found.append((label, idx[k]))
                break
    return found


def basis_of(text_before):
    """숫자 앞 글에서 기준을 읽는다. 뒤에 나온 말이 가깝다 — 뒤에서부터 본다."""
    win = text_before[-40:]
    best, pos = "day", -1
    for words, key in BASIS_WORDS:
        for w in words:
            i = win.rfind(w)
            if i > pos:
                best, pos = key, i
    return best


def value_for(entry, basis):
    """항목에서 그 기준의 값을 꺼낸다. 없으면 None."""
    if basis == "day":
        return entry.get("change_pct")
    perf = entry.get("perf") or {}
    return perf.get(basis)


# 이름과 숫자 **사이에 다른 주어가 끼면** 그 숫자는 이름의 것이 아니다.
#   「HMM 해운사 업종 -2.42%」      → -2.42% 는 업종의 것, HMM 은 -2.33%
#   「WTI 하락과 겹쳤습니다 … -7.07%」 → -7.07% 는 에너지장비 업종의 것
# 이 말이 사이에 있으면 그 짝은 세지 않는다. 8월 20·21일 장마감 판에서
# 실제로 이렇게 거짓 오류가 났다.
OTHER_SUBJECT = ("업종", "섹터", "sector", "지수", "평균", "합계", "누적", "대비")

# 소수 두 자리로 접힌 값끼리 맞추면 0.0x 짜리 차이가 남는다. 0.05%p 미만은
# **오류가 아니라 근사**로 본다 — 금 +2.25% / 자료 +2.23% 로 막으면 그것도
# 헛경보다. 그 이상 벌어지면 자릿수 문제가 아니다.
NEAR = 0.05


def resolve(name, printed, basis, snapshots):
    """판정 하나를 만든다 → (판정, 사유).

    못박은 수집본을 모두 보고, **하나라도** 그 기준으로 맞으면 OK 다.
    판 하나에 두 세션이 섞이는 것이 정상이기 때문이다.
    """
    found = candidates(name, snapshots)
    if not found:
        return "UNKNOWN", "시세 파일에 계열이 없습니다"

    seen, near = [], False
    for label, ent in found:
        got = value_for(ent, basis)
        if got is None:
            seen.append("%s: %s 값이 없음" % (label, BASIS_LABEL[basis]))
            continue
        seen.append("%s: %s %+.2f%% (계열일자 %s)"
                    % (label, BASIS_LABEL[basis], got, ent.get("date", "?")))
        if abs(got - printed) < TOL:
            return "OK", seen[-1]
        if abs(got - printed) < NEAR:
            near = True
    if near:
        return "NEAR", " / ".join(seen) + " — 0.05%p 미만 차이(반올림)"
    return "MISMATCH", " / ".join(seen)


# ── 판에서 「이름 … 숫자%」를 훑는다 ─────────────────────────────────
def strip_html(raw):
    raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
    import html as H
    t = H.unescape(re.sub(r"(?s)<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", t.replace("−", "-").replace("–", "-"))


# 이름이 다른 이름 **안에** 들어 있는 일이 흔하다 — 「에코프로」는 「에코프로비엠」
# 안에 있고, 「삼성전자」는 「삼성전자우」 안에 있다. 경계를 두지 않으면
# 에코프로비엠의 +5.83% 를 에코프로의 값으로 읽어 거짓 오류를 만든다.
# 실제로 8월 27일 장마감 판에서 그렇게 잡혔다.
def name_pattern(name):
    tail = r"(?![가-힣A-Za-z0-9])" if name[-1:].isalnum() or "가" <= name[-1:] <= "힣" else ""
    head = r"(?<![가-힣A-Za-z0-9])"
    return head + re.escape(name) + tail


def claims(text, names):
    """[(이름, 인쇄값, 기준, 앞뒤 문맥)] — 이름이 긴 것부터 먼저 잡는다."""
    out = []
    for name in sorted(names, key=len, reverse=True):
        pat = name_pattern(name) + r"[^0-9%+\-]{0,14}([+-]?\d+\.\d\d)\s?%"
        for m in re.finditer(pat, text):
            before = text[max(0, m.start() - 60):m.start()]
            out.append((name, float(m.group(1)), basis_of(before),
                        text[max(0, m.start() - 70):m.end() + 40].strip()))
    return out


def known_names(snapshots):
    """글에서 찾아볼 이름 전체 — 시세 파일의 키와 별칭."""
    names = set()
    for _, data in snapshots:
        names |= set(index_series(data))
    names |= set(ALIAS)
    # 한 글자·두 글자 이름은 다른 낱말에 걸려 오탐을 만든다(「금」·「SMI」).
    return {n for n in names if len(n) >= 3 or n in ("SOX", "VIX", "DAX", "WTI")}
