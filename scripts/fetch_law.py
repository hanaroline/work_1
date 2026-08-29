#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국가법령정보센터 OPEN API 로 법령 원문을 받아 data/law/ 아래에 저장한다.

이 스크립트는 GitHub Actions 러너에서 돈다. 브리핑·자료를 만드는 Claude
세션은 사내 이그레스 정책 때문에 law.go.kr 에 직접 붙지 못한다(CONNECT 403).
러너가 대신 받아 저장소에 커밋하고, 세션은 커밋된 파일을 읽는다. 시세를
`scripts/fetch_market.py` 로 받아 오는 것과 같은 구조다.

법령을 검색으로 요약해 인용하면 안 되는 이유는 하나다. **시행일이 다르면
다른 조문이다.** 검색 결과 요약에는 시행일이 없거나 옛 조문이 섞인다.
여기서는 시행일자·공포번호를 조문과 함께 저장해, 인용할 때 어느 판인지
같이 밝힐 수 있게 한다.

    export LAW_OC=<발급받은 OC 키>
    python3 scripts/fetch_law.py                     # data/law/targets.json 전부
    python3 scripts/fetch_law.py --only 자본시장       # 이름에 이 말이 든 것만
    python3 scripts/fetch_law.py --query 상법          # 목록에 없는 법령을 즉석에서
    python3 scripts/fetch_law.py --selftest           # 망 없이 파서만 점검

저장물
    data/law/index.json          받아 둔 법령 목록 + 시행일자·공포번호
    data/law/raw/<법령명>.json    API 응답 원문 그대로 (1차 출처)
    data/law/articles/<법령명>.json  조문 단위로 끊어 놓은 것 (law_lookup.py 가 읽는다)
    data/law/text/<법령명>.txt    사람이 읽는 전문

끝 상태(exit code)
    0  하나라도 받았다
    1  하나도 못 받았다 (키가 없거나 API 가 죽었거나)
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "law")
TIMEOUT = 25
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")

# 호출 간격. 국가법령정보 OPEN API 는 하루 호출량에 제한이 있다. 목록 하나에
# 검색 1 + 본문 1 이라 12개면 24회다. 넉넉히 쉬어 간다.
PAUSE = 0.4

# 응답에서 목록이 담기는 열쇠. target 마다 다르다. 없으면 리스트인 값을 찾는다.
LIST_KEY = {"law": "law", "admrul": "admrul", "ordin": "ordin", "expc": "expc"}

# 본문 조회에 넘길 식별자. target 마다 받는 이름이 다르고, 공개된 안내서와
# 실제 응답이 어긋나는 경우가 있어 **여러 후보를 차례로 시도한다**. 하나가
# 되면 거기서 멈춘다. 어느 조합이 통했는지는 index.json 에 남긴다.
ID_CANDIDATES = {
    "law": [("MST", "법령일련번호"), ("ID", "법령ID")],
    "admrul": [("ID", "행정규칙일련번호"), ("LID", "행정규칙ID"),
               ("ID", "행정규칙ID")],
    "ordin": [("ID", "자치법규일련번호"), ("MST", "자치법규일련번호")],
    "expc": [("ID", "법령해석례일련번호")],
}


# ── 잔손질 ────────────────────────────────────────────────────────
def clean(s):
    """조문 본문에서 태그와 엔티티를 걷어낸다. 줄바꿈과 들여쓰기는 남긴다.

    법령 본문은 들여쓰기가 의미를 가진다(항·호·목). 공백을 전부 뭉개면
    읽을 수 없게 되므로 줄 끝만 다듬는다.
    """
    if not isinstance(s, str):
        return ""
    s = re.sub(r"<[^>]+>", "", s)
    s = (s.replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">")
          .replace("&amp;", "&").replace("&quot;", '"').replace("\u00a0", " "))
    return "\n".join(line.rstrip() for line in s.replace("\r\n", "\n").split("\n"))


def squash(s):
    """이름 맞춤용. 띄어쓰기·가운뎃점 차이로 못 찾는 일을 막는다."""
    return re.sub(r"[\s·ㆍ‧・]", "", s or "")


def slugify(name):
    """파일 이름. 한글은 그대로 두고 경로에 위험한 글자만 바꾼다."""
    s = re.sub(r"[\\/:*?\"<>|]", "", name or "")
    return re.sub(r"\s+", "_", s.strip()) or "무제"


# ── 내려받기 ──────────────────────────────────────────────────────
def get(path, params):
    """DRF 엔드포인트 호출. https 가 막히면 http 로 한 번 더 시도한다.

    law.go.kr 은 오래된 안내서가 http 로 적혀 있고 실제로 둘 다 열려 있다.
    러너 쪽 TLS 사정으로 https 가 실패해도 수집이 통째로 죽지 않게 한다.
    """
    qs = urllib.parse.urlencode(params, encoding="utf-8")
    last = None
    for scheme in ("https", "http"):
        url = "%s://www.law.go.kr/DRF/%s?%s" % (scheme, path, qs)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = r.read()
            break
        except Exception as e:                                    # noqa: BLE001
            last = e
    else:
        raise RuntimeError("접속 실패: %s: %s" % (type(last).__name__, last))

    text = body.decode("utf-8", "replace").lstrip("\ufeff").strip()
    if not text:
        raise RuntimeError("빈 응답")
    if text[0] not in "{[":
        # 키가 잘못됐거나 승인 전이면 JSON 대신 안내 HTML 이 온다.
        plain = re.sub(r"<[^>]+>", " ", text)
        plain = re.sub(r"\s+", " ", plain).strip()
        raise RuntimeError("JSON 이 아닌 응답: %s" % plain[:200])
    return json.loads(text)


def search(oc, name, target="law", display=100):
    """법령명으로 찾아 후보 목록을 돌려준다."""
    data = get("lawSearch.do", {
        "OC": oc, "target": target, "type": "JSON",
        "query": name, "display": display, "search": 1, "page": 1,
    })
    return search_items(data)


def search_items(data):
    """검색 응답에서 목록을 꺼낸다. 껍데기 이름이 target 마다 달라 넓게 본다."""
    if not isinstance(data, dict):
        return []
    root = data
    # {"LawSearch": {...}} / {"AdmRulSearch": {...}} 같은 한 겹 껍데기
    if len(data) == 1:
        only = next(iter(data.values()))
        if isinstance(only, dict):
            root = only

    msg = str(root.get("resultMsg", ""))
    code = str(root.get("resultCode", ""))
    if code and code not in ("00", "0"):
        raise RuntimeError("검색 실패 [%s] %s" % (code, msg))

    for key in list(LIST_KEY.values()) + [k for k in root if k not in LIST_KEY.values()]:
        v = root.get(key)
        if isinstance(v, list):
            return [x for x in v if isinstance(x, dict)]
        if isinstance(v, dict) and any(k.endswith("일련번호") or k.endswith("명한글")
                                       for k in v):
            return [v]          # 결과가 하나면 리스트가 아니라 객체로 온다
    return []


def pick(items, name):
    """검색 결과에서 **정확히 그 법령**을 고른다.

    "자본시장과 금융투자업에 관한 법률" 로 찾으면 시행령·시행규칙까지 3건이
    같이 온다. 첫 번째를 집으면 엉뚱한 것을 인용하게 되므로 이름을 맞춘다.
    띄어쓰기만 다른 경우는 같은 것으로 본다.
    """
    want = squash(name)
    fields = ("법령명한글", "행정규칙명", "자치법규명", "법령약칭명", "법령명")
    for f in fields:
        for it in items:
            if squash(it.get(f, "")) == want:
                return it
    if len(items) == 1:
        return items[0]
    return None


def fetch_detail(oc, item, target):
    """본문을 받는다. 식별자 이름이 target 마다 달라 후보를 차례로 시도한다."""
    tried = []
    for param, field in ID_CANDIDATES.get(target, [("ID", "법령ID")]):
        val = item.get(field)
        if not val:
            continue
        try:
            data = get("lawService.do", {
                "OC": oc, "target": target, "type": "JSON", param: val,
            })
        except Exception as e:                                    # noqa: BLE001
            tried.append("%s=%s → %s" % (param, val, e))
            continue
        if articles(data) or basic_info(data):
            return data, "%s=%s" % (param, val)
        tried.append("%s=%s → 조문을 찾지 못함" % (param, val))
        time.sleep(PAUSE)
    raise RuntimeError("본문 조회 실패 (%s)" % " / ".join(tried or ["식별자 없음"]))


# ── 응답 뜯어보기 ─────────────────────────────────────────────────
#
# 응답의 겉모양은 법령 종류마다 다르고 안내서와도 조금씩 어긋난다. 열쇠
# 이름을 하나 박아 두면 그 종류에서만 조용히 빈 파일이 나온다. 그래서
# **나무 전체를 훑어** 조문처럼 생긴 마디를 찾는 방식으로 짠다.

def walk(node):
    """dict/list 를 깊이 우선으로 훑는다."""
    if isinstance(node, dict):
        yield node
        for v in node.values():
            for x in walk(v):
                yield x
    elif isinstance(node, list):
        for v in node:
            for x in walk(v):
                yield x


def basic_info(data):
    """기본정보 마디. 시행일자·공포번호가 여기 있다."""
    for node in walk(data):
        if any(k in node for k in ("법령명_한글", "법령명한글", "행정규칙명")) and \
           any(k in node for k in ("시행일자", "발령일자", "공포일자")):
            return node
    return {}


def texts_in(node, depth=0):
    """마디 아래의 본문 글줄을 문서 순서대로 모은다.

    「…내용」 으로 끝나는 열쇠(조문내용·항내용·호내용·목내용)만 집는다.
    깊이만큼 들여써서 항·호의 층이 보이게 한다.

    조문제목은 일부러 뺀다. 조문내용이 이미 "제55조(손실보전 등의 금지) …"
    로 시작하므로 제목까지 넣으면 같은 말이 두 줄로 찍힌다.
    """
    out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, str) and k.endswith("내용"):
                t = clean(v)
                if t.strip():
                    pad = "  " * depth
                    out.append("\n".join(pad + ln if ln.strip() else ln
                                         for ln in t.split("\n")))
            elif isinstance(v, (dict, list)):
                out += texts_in(v, depth + 1)
    elif isinstance(node, list):
        for v in node:
            out += texts_in(v, depth)
    return out


def as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def article_body(node):
    """조문 하나의 본문을 **법조문 차례대로** 짓는다.

    응답의 열쇠 선언 순서는 항이 조문내용보다 앞이다. 자본시장법 제55조가
    실제로 그랬다 — 나무를 훑는 순서를 그대로 믿었더니 각 호 네 줄이 조문
    본문보다 먼저 찍혔다. 그래서 조문내용 → 항 → 호 → 목 차례를 여기에
    못 박는다. 겉모양을 모르는 법령만 texts_in 으로 되돌린다.
    """
    out = []
    head = clean(node.get("조문내용", ""))
    if head.strip():
        out.append(head)
    for hang in as_list(node.get("항")):
        if not isinstance(hang, dict):
            continue
        t = clean(hang.get("항내용", ""))
        if t.strip():
            out.append(indent(t, 1))
        for ho in as_list(hang.get("호")):
            if not isinstance(ho, dict):
                continue
            t = clean(ho.get("호내용", ""))
            if t.strip():
                out.append(indent(t, 2))
            for mok in as_list(ho.get("목")):
                if not isinstance(mok, dict):
                    continue
                t = clean(mok.get("목내용", ""))
                if t.strip():
                    out.append(indent(t, 3))
    if not out:
        out = texts_in(node)
    return "\n".join(out).strip()


def indent(text, depth):
    pad = "  " * depth
    return "\n".join(pad + ln if ln.strip() else ln for ln in text.split("\n"))


def articles(data):
    """조문 단위로 끊는다. [{조문번호, 가지번호, 제목, 본문}, ...]"""
    out = []
    seen = set()
    for node in walk(data):
        if not isinstance(node, dict) or "조문번호" not in node:
            continue
        # 조문여부가 '전문' 인 마디는 편·장·절 제목이다. 조문 번호를 달고
        # 있어서 그냥 두면 제55조를 찾을 때 장 제목이 같이 걸린다.
        if str(node.get("조문여부", "")).strip() == "전문":
            continue
        no = str(node.get("조문번호", "")).strip()
        branch = str(node.get("조문가지번호", "") or "").strip()
        key = (no, branch, str(node.get("조문제목", "")))
        if key in seen:
            continue
        seen.add(key)
        body = article_body(node)
        if not body:
            continue
        out.append({
            "조문번호": no,
            "조문가지번호": branch,
            "조문제목": clean(node.get("조문제목", "")).strip(),
            "조문여부": node.get("조문여부", ""),
            "시행일자": str(node.get("조문시행일자", "") or ""),
            "본문": body,
        })
    return out


ADMRUL_HEAD = re.compile(r"제(\d+(?:-\d+)*)조(?:의(\d+))?(?=\s*[(（①])")


def admrul_articles(data):
    """행정규칙(고시·규정)을 조문으로 끊는다.

    법령과 겉모양이 아예 다르다. 조문단위 목록이 없고 「조문내용」 하나에
    전문이 통째로 들어 있거나(금융투자업규정 35만 자), 조문별 글줄의
    목록으로 온다(금융소비자 감독규정 36개). 조문번호 열쇠가 없어서
    articles() 로는 0개가 나온다.

    통글은 조문 머리글에서 자른다. 다만 본문에는 「법 제13조제4항」 같은
    인용이 널려 있어 머리글 모양만 보면 잘못 자른다. 그래서 번호가 앞으로만
    나아가는 것을 조건으로 건다 — 인용은 번호가 되돌아가므로 걸러진다.
    """
    root = data[list(data)[0]] if len(data) == 1 and isinstance(data, dict) else data
    if not isinstance(root, dict):
        return []
    body = root.get("조문내용")
    if isinstance(body, list):
        # 이미 조문별로 끊겨 온 경우 — 머리글만 읽어 번호를 뗀다
        out = []
        for t in body:
            t = clean(str(t)).strip()
            if not t:
                continue
            m = ADMRUL_HEAD.match(t)
            out.append({
                "조문번호": m.group(1) if m else "",
                "조문가지번호": (m.group(2) or "") if m else "",
                "조문제목": title_of(t),
                "조문여부": "조문",
                "시행일자": "",
                "본문": t,
            })
        return out
    if not isinstance(body, str) or not body.strip():
        return []

    text = clean(body)
    kept, last = [], None
    for m in ADMRUL_HEAD.finditer(text):
        k = [int(x) for x in m.group(1).split("-")] + [int(m.group(2) or 0)]
        if last is not None and (len(k) != len(last) or k <= last):
            continue
        kept.append((m, k))
        last = k
    out = []
    for i, (m, _) in enumerate(kept):
        end = kept[i + 1][0].start() if i + 1 < len(kept) else len(text)
        chunk = text[m.start():end].strip()
        out.append({
            "조문번호": m.group(1),
            "조문가지번호": m.group(2) or "",
            "조문제목": title_of(chunk),
            "조문여부": "조문",
            "시행일자": "",
            "본문": chunk,
        })
    return out


def title_of(chunk):
    """"제1-1조(목적) 이 규정은…" 에서 괄호 안 제목만 뗀다."""
    m = re.match(r"제\d+(?:-\d+)*조(?:의\d+)?\s*[(（]([^)）]{1,60})[)）]", chunk)
    return m.group(1).strip() if m else ""


def label(a):
    """제55조 / 제55조의2 — 사람이 부르는 이름."""
    no = a.get("조문번호", "")
    br = a.get("조문가지번호", "")
    s = "제%s조" % no if no else ""
    if br and br not in ("0", "00", ""):
        s += "의%s" % br
    title = a.get("조문제목", "")
    return "%s(%s)" % (s, title) if title else s


def render(a):
    """찍을 본문. 조문내용에 이미 "제55조(…)" 가 들어 있으면 머리글을 덧대지 않는다."""
    body = a.get("본문", "")
    head = "제%s조" % a.get("조문번호", "")
    return body if body.lstrip().startswith(head) else (label(a) + "\n" + body)


# ── 한 건 받기 ────────────────────────────────────────────────────
def reparse():
    """받아 둔 응답 원문을 다시 뜯어 조문·전문을 새로 쓴다.

    파서를 고쳤을 때 망을 다시 타지 않기 위한 것이다. raw/ 를 1차 출처로
    남겨 둔 값이 여기서 나온다 — law.go.kr 에 못 붙는 세션에서도 뜯는
    방식이 고쳐졌는지 그 자리에서 확인할 수 있다.
    """
    index_path = os.path.join(OUT, "index.json")
    if not os.path.exists(index_path):
        print("!! data/law/index.json 이 없다. 먼저 수집을 돌려야 한다.", file=sys.stderr)
        return 2
    with open(index_path, encoding="utf-8") as f:
        index = json.load(f)

    print("=== 받아 둔 원문 다시 뜯기 ===")
    changed = 0
    for law in index.get("법령", []):
        slug = slugify(law["법령명"])
        raw_path = os.path.join(OUT, "raw", slug + ".json")
        if not os.path.exists(raw_path):
            print("  건너뜀 %s — 원문이 없다" % law["법령명"])
            continue
        with open(raw_path, encoding="utf-8") as f:
            detail = json.load(f)
        arts = articles(detail) or admrul_articles(detail)
        before = law.get("조문수", 0)
        with open(os.path.join(OUT, "articles", slug + ".json"), "w",
                  encoding="utf-8") as f:
            json.dump(arts, f, ensure_ascii=False, indent=2)
        write_text(os.path.join(OUT, "text", slug + ".txt"), law, arts,
                   index.get("수집시각", "?"))
        law["조문수"] = len(arts)
        mark = "" if len(arts) == before else "  (%d → %d)" % (before, len(arts))
        if mark:
            changed += 1
        print("  %s  조문 %d개%s" % (law["법령명"], len(arts), mark))

    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print("\n%d건의 조문 수가 달라졌다." % changed)
    return 0


def write_text(path, law, arts, taken):
    """사람이 읽는 전문. 머리글에 시행일자를 박아 인용 표기가 되게 한다."""
    head = ["%s (%s)" % (law["법령명"], law.get("구분", "")),
            "시행일자 %s / 공포일자 %s / 공포번호 %s"
            % (law.get("시행일자", "?"), law.get("공포일자", "?"),
               law.get("공포번호", "?")),
            "출처 국가법령정보센터 OPEN API — 받은 때 %s" % taken,
            "=" * 60, ""]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(head))
        for a in arts:
            f.write("\n" + render(a) + "\n")


def collect_one(oc, name, target, log):
    items = search(oc, name, target)
    time.sleep(PAUSE)
    if not items:
        raise RuntimeError("검색 결과 없음")
    item = pick(items, name)
    if item is None:
        cand = ", ".join(str(x.get("법령명한글") or x.get("행정규칙명") or "?")
                         for x in items[:5])
        raise RuntimeError("이름이 정확히 맞는 것이 없음 (후보: %s)" % cand)

    detail, used = fetch_detail(oc, item, target)
    info = basic_info(detail)
    arts = articles(detail)
    if not arts:
        # 행정규칙은 조문단위 목록 없이 전문 한 덩이로 온다 — 조문 0개가
        # 조용히 나오던 자리다. 겉모양으로 갈라 다시 끊는다.
        arts = admrul_articles(detail)
    if not arts:
        raise RuntimeError("조문을 하나도 뜯지 못했다 (응답 겉모양이 낯설다)")

    title = (item.get("법령명한글") or item.get("행정규칙명")
             or info.get("법령명_한글") or info.get("법령명한글") or name)
    slug = slugify(title)

    for sub in ("raw", "articles", "text"):
        os.makedirs(os.path.join(OUT, sub), exist_ok=True)

    # 1차 출처는 응답 원문이다. 우리가 뜯은 것이 틀렸을 때 되돌아갈 곳이
    # 있어야 하므로 손대지 않고 그대로 남긴다.
    with open(os.path.join(OUT, "raw", slug + ".json"), "w", encoding="utf-8") as f:
        json.dump(detail, f, ensure_ascii=False, indent=2)

    with open(os.path.join(OUT, "articles", slug + ".json"), "w", encoding="utf-8") as f:
        json.dump(arts, f, ensure_ascii=False, indent=2)

    eff = str(item.get("시행일자") or info.get("시행일자") or "")
    head = ["%s (%s)" % (title, item.get("법령구분명") or item.get("행정규칙종류") or target),
            "시행일자 %s / 공포일자 %s / 공포번호 %s"
            % (eff or "?", item.get("공포일자") or info.get("공포일자") or "?",
               item.get("공포번호") or info.get("공포번호") or "?"),
            "소관 %s" % (item.get("소관부처명") or info.get("소관부처명") or "?"),
            "출처 국가법령정보센터 OPEN API — 받은 때 %s"
            % datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
            "=" * 60, ""]
    with open(os.path.join(OUT, "text", slug + ".txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(head))
        for a in arts:
            f.write("\n" + render(a) + "\n")

    log("  OK   %s — 조문 %d개, 시행 %s (%s)" % (title, len(arts), eff or "?", used))
    return {
        "법령명": title,
        "약칭": item.get("법령약칭명", ""),
        "구분": item.get("법령구분명") or item.get("행정규칙종류") or "",
        "target": target,
        "소관부처": item.get("소관부처명") or info.get("소관부처명") or "",
        "법령ID": item.get("법령ID") or item.get("행정규칙ID") or "",
        "일련번호": item.get("법령일련번호") or item.get("행정규칙일련번호") or "",
        "시행일자": eff,
        "공포일자": str(item.get("공포일자") or info.get("공포일자") or ""),
        "공포번호": str(item.get("공포번호") or info.get("공포번호") or ""),
        "제개정": item.get("제개정구분명", ""),
        "조문수": len(arts),
        "조회방식": used,
        "파일": {"raw": "data/law/raw/%s.json" % slug,
                 "조문": "data/law/articles/%s.json" % slug,
                 "전문": "data/law/text/%s.txt" % slug},
    }


# ── 파서 자체 점검 ────────────────────────────────────────────────
#
# 이 저장소를 만드는 세션은 law.go.kr 에 못 붙으므로 실제 응답으로 시험할
# 수 없다. 대신 **실제로 받아 본 검색 응답**과, 안내서 모양을 본뜬 본문
# 응답으로 파서만이라도 여기서 돌려 본다. 러너에서 진짜 응답을 받으면
# index.json 의 조문수로 맞는지 바로 드러난다.
SEARCH_FIXTURE = {"LawSearch": {"law": [
    {"현행연혁코드": "현행", "법령일련번호": "283193", "법령명한글": "자본시장과 금융투자업에 관한 법률",
     "법령구분명": "법률", "소관부처명": "금융위원회", "공포번호": "21324", "제개정구분명": "일부개정",
     "법령ID": "010513", "시행일자": "20260804", "공포일자": "20260203", "법령약칭명": "자본시장법"},
    {"현행연혁코드": "현행", "법령일련번호": "288399", "법령명한글": "자본시장과 금융투자업에 관한 법률 시행령",
     "법령구분명": "대통령령", "소관부처명": "금융위원회", "공포번호": "36543", "제개정구분명": "일부개정",
     "법령ID": "010817", "시행일자": "20260804", "공포일자": "20260728", "법령약칭명": "자본시장법 시행령"},
    {"현행연혁코드": "현행", "법령일련번호": "271489", "법령명한글": "자본시장과 금융투자업에 관한 법률 시행규칙",
     "법령구분명": "총리령", "소관부처명": "금융위원회", "공포번호": "02034", "제개정구분명": "일부개정",
     "법령ID": "010820", "시행일자": "20250602", "공포일자": "20250602", "법령약칭명": "자본시장법 시행규칙"}],
    "resultMsg": "success", "resultCode": "00", "totalCnt": "3", "target": "law"}}

DETAIL_FIXTURE = {"법령": {
    "기본정보": {"법령명_한글": "자본시장과 금융투자업에 관한 법률", "시행일자": "20260804",
                 "공포일자": "20260203", "공포번호": "21324", "소관부처명": "금융위원회"},
    "조문": {"조문단위": [
        {"조문번호": "54", "조문가지번호": "0", "조문제목": "직무관련 정보의 이용 금지",
         "조문여부": "조문", "조문내용": "제54조(직무관련 정보의 이용 금지) 금융투자업자는 …"},
        {"조문번호": "55", "조문가지번호": "0", "조문제목": "손실보전 등의 금지",
         "조문여부": "조문",
         "조문내용": "제55조(손실보전 등의 금지) 금융투자업자는 …&nbsp;다음 각 호의 어느 하나에 해당하는 행위를 하여서는 아니 된다.",
         "항": [{"항번호": "1", "항내용": "① …",
                 "호": [{"호번호": "1", "호내용": "1. 투자자가 입을 손실의 전부 또는 일부를 보전하여 줄 것을 <b>사전에</b> 약속하는 행위"},
                        {"호번호": "2", "호내용": "2. 투자자가 입은 손실의 전부 또는 일부를 사후에 보전하여 주는 행위"}]}]},
        {"조문번호": "55", "조문가지번호": "2", "조문제목": "예외",
         "조문여부": "조문", "조문내용": "제55조의2(예외) …"}]}}}


def selftest():
    ok = True

    def check(cond, what):
        nonlocal ok
        print(("  OK   " if cond else "  FAIL ") + what)
        ok = ok and bool(cond)

    items = search_items(SEARCH_FIXTURE)
    check(len(items) == 3, "검색 응답에서 3건을 꺼낸다")
    got = pick(items, "자본시장과 금융투자업에 관한 법률")
    check(got and got.get("법령일련번호") == "283193",
          "이름이 정확히 같은 법률을 고른다 (시행령을 집지 않는다)")
    check(pick(items, "자본시장과  금융투자업에 관한 법률") is got,
          "띄어쓰기가 달라도 같은 것으로 본다")
    check(pick(items, "자본시장법") is got, "약칭으로도 찾는다")
    check(pick(items, "상법") is None, "없는 이름에는 아무것도 주지 않는다")

    info = basic_info(DETAIL_FIXTURE)
    check(info.get("시행일자") == "20260804", "기본정보에서 시행일자를 찾는다")

    arts = articles(DETAIL_FIXTURE)
    check(len(arts) == 3, "조문 3개로 끊는다")
    a55 = [a for a in arts if a["조문번호"] == "55" and not a["조문가지번호"].strip("0")]
    check(len(a55) == 1, "제55조를 하나로 집는다")
    body = a55[0]["본문"] if a55 else ""
    check("사전에 약속하는 행위" in body, "호 본문까지 딸려 온다")
    check("<b>" not in body and "&nbsp;" not in body, "태그와 엔티티를 걷어낸다")
    check(body.startswith("제55조(손실보전 등의 금지)"), "조문내용으로 시작한다")
    check(body.count("손실보전 등의 금지") == 1, "조문제목이 두 번 찍히지 않는다")
    check(render({"조문번호": "3", "조문가지번호": "", "조문제목": "정의", "본문": "① 이 법에서 …"})
          .startswith("제3조(정의)\n"), "조문내용에 머리글이 없으면 붙여 준다")
    check(label({"조문번호": "55", "조문가지번호": "2", "조문제목": "예외"}) == "제55조의2(예외)",
          "가지번호를 제55조의2 로 적는다")
    check(label({"조문번호": "55", "조문가지번호": "0", "조문제목": ""}) == "제55조",
          "제목이 없어도 이름을 만든다")

    check(slugify("자본시장과 금융투자업에 관한 법률") == "자본시장과_금융투자업에_관한_법률",
          "파일 이름을 만든다")
    try:
        search_items({"LawSearch": {"resultCode": "01", "resultMsg": "인증키 오류"}})
        check(False, "인증 실패를 오류로 올린다")
    except RuntimeError as e:
        check("인증키 오류" in str(e), "인증 실패를 오류로 올린다")

    print("\n" + ("자체 점검 통과" if ok else "자체 점검 실패"))
    return 0 if ok else 1


# ── 본체 ──────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="국가법령정보센터 법령 수집")
    ap.add_argument("--only", help="이름에 이 말이 든 대상만 받는다")
    ap.add_argument("--query", action="append", default=[],
                    help="목록에 없는 법령을 즉석에서 받는다 (여러 번 쓸 수 있다)")
    ap.add_argument("--target", default="law", help="--query 의 종류 (law/admrul/ordin)")
    ap.add_argument("--selftest", action="store_true", help="망 없이 파서만 점검한다")
    ap.add_argument("--reparse", action="store_true",
                    help="받아 둔 raw/ 를 다시 뜯는다 (망을 쓰지 않는다)")
    args = ap.parse_args()

    if args.selftest:
        return selftest()
    if args.reparse:
        return reparse()

    oc = os.environ.get("LAW_OC", "").strip()
    if not oc:
        print("!! LAW_OC 가 비어 있다. 국가법령정보센터 OPEN API 인증키(OC)를 넣어야 한다.\n"
              "   러너에서는 저장소 Secrets 의 LAW_OC 를 쓴다.", file=sys.stderr)
        return 1

    targets = []
    if args.query:
        targets = [{"이름": q, "target": args.target} for q in args.query]
    else:
        with open(os.path.join(OUT, "targets.json"), encoding="utf-8") as f:
            targets = json.load(f)["법령"]
        if args.only:
            targets = [t for t in targets if args.only in t["이름"]]
        if not targets:
            print("!! --only 에 걸리는 대상이 없다", file=sys.stderr)
            return 1

    print("=== 국가법령정보센터 수집 (%d건) ==="
          % len(targets))
    laws, sources = [], {}
    dead = 0
    for t in targets:
        name, target = t["이름"], t.get("target", "law")
        if dead >= 2:
            # 앞의 둘이 연달아 '접속 실패' 면 서버에 못 닿는 것이지 법령마다
            # 사정이 다른 것이 아니다. 나머지를 다 돌면 건당 50초씩(https+http
            # 타임아웃) 헛되이 쓴다 — 실제로 한 번 10분 36초를 버렸다.
            msg = "RuntimeError: 접속 실패 (앞선 실패로 건너뜀)"
            print("  SKIP %s  <- 서버에 닿지 않아 남은 대상을 건너뛴다" % name)
            sources[name] = {"ok": False, "error": msg}
            continue
        try:
            laws.append(collect_one(oc, name, target, print))
            sources[name] = {"ok": True}
            dead = 0
        except Exception as e:                                    # noqa: BLE001
            # 한 건이 실패해도 나머지는 받는다. 무엇이 비었는지는 index.json 에
            # 그대로 남기므로, 인용하는 쪽이 확보된 것과 아닌 것을 구별할 수 있다.
            msg = "%s: %s" % (type(e).__name__, e)
            print("  FAIL %s  <- %s" % (name, msg))
            sources[name] = {"ok": False, "error": msg}
            dead = dead + 1 if "접속 실패" in msg else 0
        time.sleep(PAUSE)

    # 이번에 못 받은 법령의 지난 기록은 지우지 않는다. 어제 받아 둔 조문이
    # 오늘 API 가 한 번 흔들렸다고 사라지면 인용하던 자료가 통째로 끊긴다.
    index_path = os.path.join(OUT, "index.json")
    prev = {}
    if os.path.exists(index_path):
        try:
            with open(index_path, encoding="utf-8") as f:
                prev = {x["법령명"]: x for x in json.load(f).get("법령", [])}
        except Exception:                                         # noqa: BLE001
            prev = {}
    merged = dict(prev)
    for l in laws:
        merged[l["법령명"]] = l

    ok = sum(1 for v in sources.values() if v["ok"])
    out = {
        "수집시각": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S KST"),
        "출처": "국가법령정보센터 OPEN API (law.go.kr/DRF)",
        "주의": ("시행일자가 다르면 다른 조문이다. 인용할 때는 아래 시행일자를 "
                 "같이 밝힌다. 이 파일은 받은 시점의 현행본이며, 그 뒤 개정은 "
                 "다시 수집해야 반영된다."),
        "요약": {"시도": len(sources), "성공": ok},
        "sources": sources,
        "법령": sorted(merged.values(), key=lambda x: x["법령명"]),
    }
    os.makedirs(OUT, exist_ok=True)
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print("\n%d/%d 성공" % (ok, len(sources)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
