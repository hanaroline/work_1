#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""지은 시장일지를 텔레그램 채널로 보낸다.

두 가지를 보낸다.
  ① 글자 본문 (`docs/journal/<날짜>.txt`) — 채널에서 바로 읽을 수 있게
  ② 파일 하나 — **PDF 가 있으면 PDF**, 없으면 HTML. 받는 쪽이 휴대폰이라도
     PDF 는 그대로 A4 네 쪽으로 열리고 브라우저·글꼴에 기대지 않는다.

**비밀값이 없으면 아무것도 보내지 않고 조용히 끝낸다.** 보내지 못한 것을
보낸 척하지 않는다. 필요한 값은 둘이다.

  TELEGRAM_BOT_TOKEN   BotFather 가 준 토큰
  TELEGRAM_CHAT_ID     보낼 채널·방의 id (채널은 -100… 로 시작한다)

텔레그램 본문은 4,096자가 한계라 넘치면 잘라 두 번에 나눠 보낸다.
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request
import uuid

API = "https://api.telegram.org/bot%s/%s"
LIMIT = 3900          # 4,096 에서 여유를 둔다
CTX = ssl.create_default_context()


def post(token: str, method: str, fields: dict, filename: str | None = None,
         fileblob: bytes | None = None, filefield: str = "document",
         filemime: str = "text/html; charset=utf-8"):
    """multipart/form-data 를 손으로 짠다 — 외부 꾸러미를 들이지 않으려는 것이다."""
    boundary = "----journal" + uuid.uuid4().hex
    body = b""
    for k, v in fields.items():
        body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n"
                 f"{v}\r\n").encode("utf-8")
    if fileblob is not None:
        body += (f"--{boundary}\r\nContent-Disposition: form-data; "
                 f"name=\"{filefield}\"; filename=\"{filename}\"\r\n"
                 f"Content-Type: {filemime}\r\n\r\n").encode("utf-8")
        body += fileblob + b"\r\n"
    body += f"--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        API % (token, method), data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            return True, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, e.read().decode("utf-8", "replace")[:400]
    except Exception as e:  # noqa: BLE001
        return False, str(e)


def main() -> int:
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TOKEN")
    chat = os.environ.get("TELEGRAM_CHAT_ID") or os.environ.get("CHAT")
    if not token or not chat:
        print("TELEGRAM_BOT_TOKEN·TELEGRAM_CHAT_ID 가 없어 보내지 않았습니다", file=sys.stderr)
        return 0

    with open("data/journal/latest.json", encoding="utf-8") as fh:
        jr = json.load(fh)
    with open("data/market/latest.json", encoding="utf-8") as fh:
        date = (json.load(fh).get("indices") or {}).get("kospi", {}).get("date")
    date = date or jr.get("bizdate")

    txt_path = f"docs/journal/{date}.txt"
    # **PDF 를 먼저 찾는다.** 없으면 HTML 로 물러선다 — 굽는 자리(플레이라이트)가
    # 실패해도 판은 나가야 한다.
    doc_path, doc_mime, doc_ext = None, None, None
    for ext, mime in (("pdf", "application/pdf"), ("html", "text/html; charset=utf-8")):
        p = f"docs/journal/{date}.{ext}"
        if os.path.exists(p):
            doc_path, doc_mime, doc_ext = p, mime, ext
            break
    if not os.path.exists(txt_path):
        print(f"{txt_path} 가 없습니다 — 먼저 scripts/build_journal.py 를 돌리십시오",
              file=sys.stderr)
        return 1

    with open(txt_path, encoding="utf-8") as fh:
        text = fh.read()

    # 4,096자 한계. 줄 단위로 끊어 보낸다 — 낱말 가운데서 자르지 않는다.
    chunks, cur = [], ""
    for line in text.split("\n"):
        if len(cur) + len(line) + 1 > LIMIT:
            chunks.append(cur)
            cur = ""
        cur += line + "\n"
    if cur.strip():
        chunks.append(cur)

    fails = 0
    for i, c in enumerate(chunks):
        ok, res = post(token, "sendMessage",
                       {"chat_id": chat, "text": c, "disable_web_page_preview": "true"})
        print(("보냄" if ok else "실패") + f" — 본문 {i + 1}/{len(chunks)}"
              + ("" if ok else f" · {res}"))
        fails += 0 if ok else 1

    if doc_path:
        with open(doc_path, "rb") as fh:
            blob = fh.read()
        ok, res = post(token, "sendDocument",
                       {"chat_id": chat,
                        "caption": f"국내 시장일지 {date} — 본지 A4 1장 + 대시보드 3장"},
                       filename=f"국내시장일지_{date}.{doc_ext}", fileblob=blob,
                       filemime=doc_mime)
        print(("보냄" if ok else "실패") + f" — {doc_ext.upper()} 첨부"
              + ("" if ok else f" · {res}"))
        fails += 0 if ok else 1
    else:
        print("첨부할 PDF·HTML 이 없습니다 — 본문만 보냈습니다", file=sys.stderr)

    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
