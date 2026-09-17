#!/usr/bin/env python3
"""
주장 대장(claim ledger) 검산기.

금융자료에 인쇄될 수치를 담은 claims.json 을 읽어
(1) 메타데이터 누락  (2) 미확인→단정 누출  (3) 계열 혼용
(4) 파생 수치 산술 오류  를 잡아냅니다.

    python check_claims.py claims.json
    python check_claims.py claims.json --fix     # 파생값을 계산값으로 덮어쓰기
    python check_claims.py claims.json --json    # 결과를 JSON 으로

종료코드: 0 = 통과(경고 있을 수 있음), 1 = 실패, 2 = 파일/스키마 오류
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

VERDICTS = {"confirmed", "unverified", "refuted"}
RENDERS = {"assert", "marked", "omit"}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

errors: list[str] = []
warnings: list[str] = []
notes: list[str] = []


def err(cid: str, msg: str) -> None:
    errors.append(f"[{cid}] {msg}")


def warn(cid: str, msg: str) -> None:
    warnings.append(f"[{cid}] {msg}")


# ---------------------------------------------------------------- claims

def check_claim(c: dict) -> None:
    cid = c.get("id") or "?"

    for f in ("text", "value", "unit", "as_of", "tier", "source_url", "verdict"):
        if c.get(f) in (None, ""):
            err(cid, f"필수 필드 누락: {f}")

    as_of = c.get("as_of")
    if as_of and not DATE_RE.match(str(as_of)):
        err(cid, f"as_of 형식은 YYYY-MM-DD 여야 함 (현재: {as_of!r})")

    verdict = c.get("verdict")
    if verdict and verdict not in VERDICTS:
        err(cid, f"verdict 는 {sorted(VERDICTS)} 중 하나 (현재: {verdict!r})")

    render = c.get("render", "assert")
    if render not in RENDERS:
        err(cid, f"render 는 {sorted(RENDERS)} 중 하나 (현재: {render!r})")

    # 핵심 규칙: 미확인은 단정할 수 없다
    if verdict == "unverified" and render == "assert":
        err(cid, "verdict=unverified 인 항목을 render=assert 로 인쇄할 수 없음. "
                 "'marked'(미확인 표기) 또는 'omit'(자료에서 제외) 로 바꿀 것")
    if verdict == "refuted":
        err(cid, "verdict=refuted — 반증된 수치가 대장에 남아 있음. 삭제하거나 정정할 것")

    printed = render != "omit"   # 자료에 인쇄되지 않는 항목은 인쇄 품질 요건 면제

    tier = c.get("tier")
    if tier == 3 and printed and not c.get("corroborating_urls"):
        warn(cid, "tier 3(위키·블로그·집계사이트) 단독 근거. "
                  "1·2차 출처로 교차확인하거나 자료에서 뺄 것")
    if printed and tier == 2 and c.get("kind") == "institution_forecast":
        if not c.get("announced_on"):
            err(cid, "기관 전망을 2차 보도에서 인용 중 — 원 보고서 발표일(announced_on)이 없음. "
                     "보도일을 발표일로 쓰면 안 됨")
        elif c.get("announced_on") == as_of:
            warn(cid, "announced_on 과 as_of 가 동일 — 보도일을 그대로 발표일로 적은 것이 아닌지 확인")

    if printed and c.get("kind") in ("quote", "institution_forecast") and not c.get("attributed_to"):
        err(cid, "발언/전망인데 attributed_to(기관+화자) 없음. "
                 "한 기사에 여러 전문가가 등장하므로 원문에서 화자 확인 필요")

    if printed and c.get("kind") == "institution_forecast":
        if not c.get("target_period"):
            err(cid, "기관 전망에 target_period(대상시점) 없음 — '연말'인지 '12개월'인지 구분 필요")
        if c.get("revision") not in (None, "up", "down", "unchanged", "new"):
            err(cid, "revision 은 up/down/unchanged/new 중 하나여야 함")
        if c.get("revision") is None:
            warn(cid, "조정방향(revision) 미기재. 상향/하향을 뒤집으면 전망 의미가 반대가 됨")
        rf, rev, v = c.get("revision_from"), c.get("revision"), c.get("value")
        if isinstance(rf, (int, float)) and isinstance(v, (int, float)) and rev in ("up", "down"):
            actual = "up" if v > rf else "down" if v < rf else "unchanged"
            if actual != rev:
                err(cid, f"조정방향 모순: revision={rev!r} 인데 {rf} → {v} 는 실제 {actual!r}. "
                         f"하향을 상향으로 쓰면 그 기관이 정반대를 말한 것이 됨")
        elif rev in ("up", "down") and rf is None:
            warn(cid, f"revision={rev!r} 인데 종전 전망치(revision_from) 없음 — 방향을 검산할 수 없음")

    txt = str(c.get("text", ""))
    if re.search(r"(하지\s*않는다|않음|없다|미공표|비공개|공표하지)", txt) and verdict != "confirmed":
        err(cid, "부정 단정 문구인데 verdict!=confirmed. "
                 "검색 실패는 부재의 근거가 아님 — '공개 자료에서 확인되지 않음(기준일)' 으로 서술할 것")


def check_unit_policy(claims: list[dict], unit_policy: dict) -> None:
    """metric 별 기대 단위와 실제 단위가 맞는지. 'USD/BRL 4.50' 을 '4.50원'으로
    쓰는 사고가 여기서 막힌다 — 통화쌍 전망을 원화 단위로 적으면 즉시 실패."""
    for c in claims:
        m, u = c.get("metric"), c.get("unit")
        if not m or c.get("render") == "omit":
            continue
        expected = unit_policy.get(m)
        if expected and u != expected:
            err(c.get("id", "?"), f"단위 불일치: metric {m!r} 의 기대 단위는 {expected!r} "
                                  f"인데 {u!r} 로 기재됨")
        if not expected:
            notes.append(f"[{c.get('id','?')}] unit_policy 에 {m!r} 기대 단위 미선언 "
                         f"(현재 {u!r}) — 선언하면 단위 오류를 자동으로 잡을 수 있음")


def check_series_policy(claims: list[dict], policy: dict) -> None:
    """같은 지표에 두 개 이상의 계열/단위가 섞였는지."""
    by_metric: dict[str, set] = {}
    units: dict[str, set] = {}
    for c in claims:
        m = c.get("metric")
        if not m or c.get("render") == "omit":
            continue
        if c.get("series"):
            by_metric.setdefault(m, set()).add(c["series"])
        if c.get("unit"):
            units.setdefault(m, set()).add(c["unit"])

    for m, s in sorted(by_metric.items()):
        declared = policy.get(m)
        if len(s) > 1:
            err(m, f"계열 혼용: {sorted(s)} — 한 산출물에서 한 지표는 한 계열로 통일하고 "
                   f"다른 계열은 각주로만 병기할 것")
        elif declared and declared not in s:
            warn(m, f"series_policy 선언({declared!r})과 실제 사용({sorted(s)})이 불일치")
        elif not declared and any(
                c.get("metric") == m and c.get("kind") in ("market_level", "timeseries")
                for c in claims):
            notes.append(f"[{m}] series_policy 에 계열 선언 없음 (권장: {sorted(s)[0]!r})")

    for m, u in sorted(units.items()):
        if len(u) > 1:
            err(m, f"단위 혼용: {sorted(u)}")


# ---------------------------------------------------------------- derived

def _val(idx: dict, ref, field="value"):
    """숫자면 그대로, 문자열이면 claim id 로 조회."""
    if isinstance(ref, (int, float)):
        return float(ref)
    c = idx.get(ref)
    if c is None:
        return None
    v = c.get(field)
    return float(v) if isinstance(v, (int, float)) else None


def check_derived(d: dict, idx: dict, fix: bool) -> None:
    did = d.get("id") or "?"
    kind = d.get("kind")
    tol = float(d.get("tolerance", 0.05))  # 표시 자릿수 기준 허용 오차
    printed = d.get("printed")
    computed = None
    detail = ""

    if kind == "pct_change":
        a, b = _val(idx, d.get("from")), _val(idx, d.get("to"))
        if a in (None, 0) or b is None:
            err(did, f"pct_change 참조 해석 실패 (from={d.get('from')!r}, to={d.get('to')!r})")
            return
        computed = 100.0 * (b / a - 1.0)
        detail = f"{a} → {b}"

    elif kind == "ratio":
        n, den = _val(idx, d.get("numerator")), _val(idx, d.get("denominator"))
        if n is None or den in (None, 0):
            err(did, "ratio 참조 해석 실패")
            return
        computed = n / den
        detail = f"{n} / {den}"

    elif kind == "product":
        x, y = _val(idx, d.get("a")), _val(idx, d.get("b"))
        if x is None or y is None:
            err(did, "product 참조 해석 실패")
            return
        computed = x * y
        detail = f"{x} × {y}"

    elif kind == "cross":
        # a / b 가 result 와 일치하는지 (예: USD/KRW ÷ USD/BRL = BRL/KRW)
        a, b, r = _val(idx, d.get("a")), _val(idx, d.get("b")), _val(idx, d.get("result"))
        if a is None or b in (None, 0) or r in (None, 0):
            err(did, "cross 참조 해석 실패")
            return
        implied = a / b
        gap = 100.0 * abs(implied / r - 1.0)
        limit = float(d.get("tolerance_pct", 0.5))
        msg = f"교차환율 {a}/{b} = {implied:.4g} vs 대장값 {r:.4g} (괴리 {gap:.2f}%)"
        if gap > limit:
            err(did, msg + f" — 허용 {limit}% 초과. 기준일이 서로 다르거나 계열이 섞였을 가능성")
        else:
            notes.append(f"[{did}] {msg} — 정합")
        return

    elif kind == "log_decomposition":
        # 요인 기여도: 각 factor 의 로그변화 합이 total 의 로그변화와 맞는지
        tot = d.get("total", {})
        a, b = _val(idx, tot.get("from")), _val(idx, tot.get("to"))
        if a in (None, 0) or b in (None, 0):
            err(did, "log_decomposition total 참조 해석 실패")
            return
        lt = math.log(b / a)
        parts = []
        for f in d.get("factors", []):
            fa, fb = _val(idx, f.get("from")), _val(idx, f.get("to"))
            if fa in (None, 0) or fb in (None, 0):
                err(did, f"factor {f.get('name')!r} 참조 해석 실패")
                return
            lf = math.log(fb / fa)
            if f.get("invert"):
                lf = -lf
            parts.append((f.get("name", "?"), lf))
        s = sum(p for _, p in parts)
        if s == 0:
            err(did, "기여도 합이 0 — 분해 불가")
            return
        gap = 100.0 * abs(s / lt - 1.0) if lt else float("inf")
        shares = {n: round(100.0 * p / s, 1) for n, p in parts}
        notes.append(f"[{did}] 기여도 {shares} (합 검증: 분해합 {s:+.5f} vs 실제 {lt:+.5f}, 괴리 {gap:.1f}%)")
        if gap > float(d.get("tolerance_pct", 5.0)):
            warn(did, f"분해합과 실제 변화의 괴리 {gap:.1f}% — 입력값 반올림 또는 기준일 불일치 확인")
        for n, pr in (d.get("printed_shares") or {}).items():
            if n not in shares:
                err(did, f"printed_shares 의 {n!r} 가 factors 에 없음")
            elif abs(shares[n] - float(pr)) > float(d.get("share_tolerance", 1.0)):
                err(did, f"기여도 불일치: {n} 인쇄 {pr}% vs 계산 {shares[n]}%")
        return

    elif kind == "sum":
        vals = [_val(idx, x) for x in d.get("terms", [])]
        if any(v is None for v in vals):
            err(did, "sum 참조 해석 실패")
            return
        computed = sum(vals)
        detail = " + ".join(str(v) for v in vals)

    else:
        err(did, f"알 수 없는 kind: {kind!r}")
        return

    if printed is None:
        notes.append(f"[{did}] {kind}: {detail} = {computed:.4g} (인쇄값 미기재)")
        d["printed"] = round(computed, 4)
        return

    if abs(float(printed) - computed) > tol:
        line = (f"{kind} 불일치: 인쇄 {printed} vs 계산 {computed:.4g} ({detail}, 허용 ±{tol})")
        if fix:
            d["printed"] = round(computed, 4)
            notes.append(f"[{did}] 수정됨 — {line}")
        else:
            err(did, line)
    else:
        notes.append(f"[{did}] {kind}: {detail} = {computed:.4g} — 인쇄값 {printed} 정합")


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description="금융자료 주장 대장 검산기")
    ap.add_argument("ledger", help="claims.json 경로")
    ap.add_argument("--fix", action="store_true", help="파생값을 계산값으로 덮어써서 저장")
    ap.add_argument("--json", action="store_true", help="결과를 JSON 으로 출력")
    a = ap.parse_args()

    p = Path(a.ledger)
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"파일을 찾을 수 없음: {p}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 실패: {e}", file=sys.stderr)
        return 2

    claims = data.get("claims") or []
    derived = data.get("derived") or []
    policy = data.get("series_policy") or {}

    if not claims:
        print("claims 가 비어 있음 — 인쇄될 수치를 먼저 등록할 것", file=sys.stderr)
        return 2

    if not data.get("as_of"):
        warnings.append("[문서] 최상위 as_of(기준일) 없음 — 자료 각주에 기준일이 반드시 들어가야 함")

    seen: set[str] = set()
    for c in claims:
        cid = c.get("id")
        if not cid:
            err("?", "claim 에 id 없음")
        elif cid in seen:
            err(cid, "id 중복")
        else:
            seen.add(cid)
        check_claim(c)

    check_series_policy(claims, policy)
    check_unit_policy(claims, data.get("unit_policy") or {})

    idx = {c["id"]: c for c in claims if c.get("id")}
    for d in derived:
        check_derived(d, idx, a.fix)

    if a.fix:
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    n_unver = sum(1 for c in claims if c.get("verdict") == "unverified")
    n_t1 = sum(1 for c in claims if c.get("tier") == 1)

    if a.json:
        print(json.dumps({
            "passed": not errors, "errors": errors, "warnings": warnings, "notes": notes,
            "claims": len(claims), "derived": len(derived),
            "unverified": n_unver, "tier1": n_t1,
        }, ensure_ascii=False, indent=2))
        return 1 if errors else 0

    print(f"주장 {len(claims)}건 · 파생 {len(derived)}건 · "
          f"1차 출처 {n_t1}건 · 미확인 {n_unver}건\n")
    for label, items in (("실패", errors), ("경고", warnings), ("확인", notes)):
        if not items:
            continue
        print(f"── {label} ({len(items)})")
        for i in items:
            print(f"   {i}")
        print()

    if errors:
        print("검산 실패 — 대장을 고친 뒤 빌드할 것. 이 상태로 산출물을 만들면 안 됩니다.")
        return 1

    print("검산 통과. 빌드 진행 가능.")
    if n_unver:
        print(f"주의: 미확인 {n_unver}건 — 자료에 미확인으로 표기되었는지, "
              f"사용자 보고에 포함되었는지 확인할 것.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
