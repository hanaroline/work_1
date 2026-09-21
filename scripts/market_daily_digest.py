#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MARKET DAILY 전달용 요약을 뽑는다 — 메일 본문과 메신저 문구.

    python3 scripts/market_daily_digest.py --edition morning --date 2026-09-18

왜 따로 만드는가
----------------
카드뉴스 HTML 은 40KB 가까이 된다. 메일 본문에 그대로 넣거나 첨부로 옮겨
적는 과정에서 숫자가 한 글자라도 틀리면, 정작 공들여 검산한 표와 어긋난
값이 사람 손에 들어간다. **그래서 전달용 문구도 손으로 적지 않고 여기서
만든다.** 이 스크립트는 빌더가 낸 주장 대장(`*.claims.json`)에서 값을
읽으므로, 메일에 실리는 숫자는 카드뉴스에 인쇄된 숫자와 같은 출처다.

무엇이 나오는가
---------------
    docs/market-daily/<날짜>-<판>.mail.html   메일 본문(인라인 스타일)
    docs/market-daily/<날짜>-<판>.mail.txt    메일 평문 대체
    docs/market-daily/<날짜>-<판>.messenger.txt  메신저용 — 헤드라인 5줄 +
                                                 보드 10종목 등락률

메일 본문은 **인라인 스타일**로 쓴다. 메일 클라이언트는 `<style>` 블록을
지우거나 무시하는 일이 잦아 외부 스타일시트는 물론 문서 머리의 규칙도
믿을 수 없다.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "docs", "market-daily")
NARR_DIR = os.path.join(ROOT, "data", "market_daily")

C_PRIMARY = "#F58220"
C_SECOND = "#043B72"
C_UP = "#C62828"

EDITION_KO = {"morning": "모닝시황", "close": "마감시황"}


def esc(s):
    return html.escape(str(s if s is not None else ""))


def pct(v):
    return "—" if v is None else "{:+.2f}%".format(v)


def color(v):
    if v is None:
        return "#6C6C6C"
    return C_UP if v > 0 else (C_SECOND if v < 0 else "#6C6C6C")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def rows_from_html(path, section):
    """만들어진 카드뉴스에서 표 한 덩어리를 그대로 읽어 온다.

    대장에는 값이 있지만 **표시 순서와 이름**은 판에 있다. 두 곳을 각각
    해석하면 어긋날 수 있으므로, 사람이 보는 그 표에서 읽는다.
    """
    src = open(path, encoding="utf-8").read()
    # 보드 표는 문서에서 유일하게 「종목/종가/등락률/코멘트」 머리를 가진 표다.
    tables = re.findall(r"<table>(.*?)</table>", src, re.S)
    out = []
    for t in tables:
        head = re.search(r"<thead>(.*?)</thead>", t, re.S)
        if not head:
            continue
        htxt = re.sub(r"<[^>]+>", " ", head.group(1))
        if section == "board" and "코멘트" not in htxt:
            continue
        if section == "baseline" and "지표" not in htxt:
            continue
        body = re.search(r"<tbody>(.*?)</tbody>", t, re.S)
        if not body:
            continue
        for tr in re.findall(r"<tr>(.*?)</tr>", body.group(1), re.S):
            tds = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)
            if len(tds) < 3:
                continue
            ko = re.search(r'<span class="ko">(.*?)</span>', tds[0], re.S)
            name = html.unescape(re.sub(r"<[^>]+>", "", ko.group(1) if ko else tds[0])).strip()
            close = html.unescape(re.sub(r"<[^>]+>", "", tds[1])).strip()
            chg = html.unescape(re.sub(r"<[^>]+>", "", tds[2])).strip()
            out.append((name, close, chg))
        break
    return out


def build(edition, date_s):
    stem = os.path.join(OUT_DIR, "%s-%s" % (date_s, edition))
    page = stem + ".html"
    if not os.path.exists(page):
        raise SystemExit("먼저 카드뉴스를 만드십시오: %s" % os.path.relpath(page, ROOT))
    narr = load(os.path.join(NARR_DIR, "narrative-%s-%s.json" % (date_s, edition)))

    heads = [h["ko"] for h in narr["headlines"]]
    baseline = rows_from_html(page, "baseline")
    board = rows_from_html(page, "board")

    d = dt.date.fromisoformat(date_s)
    wd = "월화수목금토일"[d.weekday()]
    date_ko = "%d년 %d월 %d일(%s)" % (d.year, d.month, d.day, wd)
    title = "[MARKET DAILY] %s %s" % (date_ko, EDITION_KO[edition])

    # ------------------------------------------------ 메일 본문 (인라인 스타일)
    P = []
    a = P.append
    a('<div style="font-family:\'Malgun Gothic\',\'Apple SD Gothic Neo\',sans-serif;'
      'font-size:15px;line-height:1.6;color:#3D3D3D;max-width:640px">')
    a('<div style="background:%s;color:#fff;padding:20px 22px">' % C_PRIMARY)
    a('<div style="font-size:11px;letter-spacing:1.2px;opacity:.92">'
      '미래에셋증권 · 내부 참고용</div>')
    a('<div style="font-size:30px;font-weight:700;letter-spacing:-.5px;'
      'margin-top:4px">MARKET DAILY</div>')
    a('<div style="font-size:15px;margin-top:6px">%s · %s</div>'
      % (esc(date_ko), esc(EDITION_KO[edition])))
    a("</div>")

    a('<div style="padding:18px 22px 4px">')
    a('<div style="border-top:2px solid %s;padding-top:10px;font-size:13px;'
      'font-weight:700;color:%s;letter-spacing:.8px">헤드라인</div>' % (C_PRIMARY, C_PRIMARY))
    a('<ol style="padding-left:20px;margin:10px 0 0">')
    for h in heads:
        a('<li style="margin-bottom:7px">%s</li>' % esc(h))
    a("</ol></div>")

    for label, rows, ncol in (("기준선", baseline, 3), ("보드", board, 3)):
        if not rows:
            continue
        a('<div style="padding:16px 22px 0">')
        a('<div style="border-top:2px solid %s;padding-top:10px;font-size:13px;'
          'font-weight:700;color:%s;letter-spacing:.8px">%s</div>'
          % (C_PRIMARY, C_PRIMARY, esc(label)))
        a('<table cellpadding="0" cellspacing="0" border="0" '
          'style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px">')
        for name, close, chg in rows:
            v = None
            m = re.match(r"([+-]?[\d.]+)%", chg)
            if m:
                v = float(m.group(1))
            a('<tr>'
              '<td style="padding:6px 0;border-bottom:1px solid #E5E4E1;font-weight:600;'
              'color:#1A1A1A">%s</td>'
              '<td style="padding:6px 0;border-bottom:1px solid #E5E4E1;text-align:right">%s</td>'
              '<td style="padding:6px 0 6px 14px;border-bottom:1px solid #E5E4E1;'
              'text-align:right;font-weight:700;color:%s">%s</td>'
              '</tr>' % (esc(name), esc(close), color(v), esc(chg)))
        a("</table></div>")

    a('<div style="padding:18px 22px 22px;font-size:12px;color:#6C6C6C;line-height:1.55">')
    a('<div style="border:1px solid %s;border-left-width:3px;padding:10px 12px;'
      'color:#1A1A1A;margin-bottom:10px">본 자료는 내부 참고용으로 작성되었으며, '
      '특정 종목의 매매를 권유하는 자료가 아닙니다.</div>' % C_SECOND)
    a('전체 카드뉴스(표·뉴스카드 5장·검증 노트)는 저장소의 '
      '<code>docs/market-daily/%s-%s.html</code> 에 있습니다.' % (esc(date_s), esc(edition)))
    a("</div></div>")
    mail_html = "\n".join(P)

    # ------------------------------------------------ 평문 대체
    T = [title, ""]
    T.append("[헤드라인]")
    for i, h in enumerate(heads, 1):
        T.append("%d. %s" % (i, h))
    for label, rows in (("기준선", baseline), ("보드", board)):
        if not rows:
            continue
        T += ["", "[%s]" % label]
        for name, close, chg in rows:
            T.append("%-14s %12s  %8s" % (name, close, chg))
    T += ["", "본 자료는 내부 참고용이며 특정 종목의 매매를 권유하는 자료가 아닙니다.",
          "전체 카드뉴스: docs/market-daily/%s-%s.html" % (date_s, edition)]
    mail_txt = "\n".join(T)

    # ------------------------------------------------ 메신저 문구
    M = ["[MARKET DAILY] %s %s" % (date_ko, EDITION_KO[edition]), ""]
    for i, h in enumerate(heads, 1):
        M.append("%d. %s" % (i, h))
    M += ["", "[보드 %d종목]" % len(board)]
    for name, _close, chg in board:
        M.append("%s %s" % (name, chg))
    M += ["", "※ 내부 참고용 · 특정종목 매매 권유 아님"]
    messenger = "\n".join(M)

    for suffix, text in ((".mail.html", mail_html), (".mail.txt", mail_txt),
                         (".messenger.txt", messenger)):
        with open(stem + suffix, "w", encoding="utf-8") as f:
            f.write(text)
        print("씀: %s (%d자)" % (os.path.relpath(stem + suffix, ROOT), len(text)))
    print("제목: %s" % title)
    print("기준선 %d행 · 보드 %d행" % (len(baseline), len(board)))
    return stem


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--edition", choices=["morning", "close"], default="morning")
    ap.add_argument("--date", required=True)
    args = ap.parse_args()
    build(args.edition, args.date)
    return 0


if __name__ == "__main__":
    sys.exit(main())
