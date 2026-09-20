#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""매크로 엑셀(.xlsm)이 **정말 도는지** 기계가 확인한다.

왜 필요한가
──────────────────────────────────────────────────────────────────────
VBA 프로젝트를 손으로 지어 넣었다(`vba_project.py`). MS-OVBA 는 압축·암호화·
`dir` 스트림 레코드가 얽혀 있어, **한 바이트만 틀려도 엑셀이 「복구할 수
없습니다」를 띄운다.** 그런데 여태 검증이 「리브레오피스가 PDF 로 바꿔 준다」
뿐이었다 — 그것은 시트가 멀쩡하다는 말이지 매크로가 돈다는 말이 아니다.
표지에 「아직 실제로 못 열어 봤습니다」라고 적어 둔 채로 고객에게 나갈 뻔했다.

무엇을 확인하나 — 셋
──────────────────────────────────────────────────────────────────────
① **제3의 파서가 읽는가** (olevba). 오피스 도구·백신이 쓰는 MS-OVBA 구현이다.
   모듈 아홉 개가 다 보이고, 뽑아낸 소스가 넣은 소스와 **한 글자까지 같은지**
   대조한다. 이 대조가 실제로 고장을 하나 잡았다 — 코드페이지에 없는 줄표가
   `?` 로 조용히 바뀌어 있었다.
② **VBA 해석기가 들여오는가** (리브레오피스). 모듈 이름·프로시저 이름이
   살아서 `VBAProject` 라이브러리에 올라오는지 본다.
③ **실제로 돌아 칸을 바꾸는가.** 「조회」 칸을 꺼 두고 `조회_실행` 을 부른
   뒤, 칸이 켜졌는지 확인한다. 모듈은 통째로 컴파일되므로 이것이 통하면
   같은 모듈의 `조건_초기화` 도 문법 오류가 없다는 뜻이다.

**한계 — 리브레오피스는 엑셀이 아니다.**
①②③ 이 다 통해도 진짜 엑셀에서 같다는 보장은 아니다. `Application.Goto`,
`.Select`, `MsgBox` 대화상자, 엑셀 자체의 매크로 보안 경고는 여기서 확인되지
않는다. 확인되는 것은 **「파일이 깨지지 않았고, VBA 가 들여와지고, 로직이
돈다」** 까지다. 그것만으로도 여태 못 하던 확인이다.

쓰는 법
  python3 scripts/verify_xlsm_macro.py
  python3 scripts/verify_xlsm_macro.py --file 고객제안서_자산배분_매크로.xlsm
"""

import argparse
import os
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DEFAULT = os.path.join(ROOT, "고객제안서_자산배분_매크로.xlsm")
PORT = 2002
SHEET = "제안서"
GO_ON = "▶ 조회 실행"
GO_OFF = "… 조건 입력 중"

# VBA 를 「실행 가능한 코드」로 들여오게 하는 설정. 기본값이면 리브레오피스는
# VBA 를 주석으로만 들여와 부를 수가 없다 — 통과한 것처럼 보이고 아무것도
# 확인 못 한다.
XCU = """<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry"
 xmlns:xs="http://www.w3.org/2001/XMLSchema">
<item oor:path="/org.openoffice.Office.Calc/Filter/Import/VBA">
<prop oor:name="Load" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Calc/Filter/Import/VBA">
<prop oor:name="Executable" oor:op="fuse"><value>true</value></prop></item>
</oor:items>
"""


def check_olevba(path):
    """① 제3의 파서가 읽는가 + 소스가 한 글자까지 같은가."""
    try:
        from oletools.olevba import VBA_Parser
    except ImportError:
        return None, "olevba 가 없습니다 (pip install oletools) — 건너뜁니다"
    import build_proposal_xlsm as B

    rows = list(VBA_Parser(path).extract_macros())
    names = [n for (_, _, n, _) in rows]
    if len(rows) < 9:
        return False, "모듈이 %d 개뿐입니다: %s" % (len(rows), names)

    code = next((c for (_, _, n, c) in rows if "제안서" in n), None)
    if code is None:
        return False, "표준 모듈(제안서매크로)을 못 찾았습니다: %s" % names

    def norm(lines):
        L = [x for x in lines if not x.startswith("Attribute VB_Name")]
        while L and not L[0].strip():
            L.pop(0)
        while L and not L[-1].strip():
            L.pop()
        return L

    theirs = norm(code.replace("\r\n", "\n").split("\n"))
    mine = norm(B.MACRO.replace("\r\n", "\n").split("\n"))
    if mine != theirs:
        for i, (a, b) in enumerate(zip(mine, theirs)):
            if a != b:
                return False, ("소스가 %d 행에서 어긋납니다\n    넣은 것: %r\n"
                               "    읽은 것: %r" % (i + 1, a[:70], b[:70]))
        return False, "소스 줄 수가 다릅니다 (%d vs %d)" % (len(mine), len(theirs))
    return True, "모듈 %d 개 · 소스 %d 행이 한 글자까지 같습니다" % (len(rows), len(mine))


def check_run(path, profile):
    """②③ 리브레오피스가 VBA 를 들여와 실제로 도는가."""
    try:
        import uno
        from com.sun.star.beans import PropertyValue
    except ImportError:
        return None, "python-uno 가 없습니다 — 건너뜁니다"

    def pv(n, v):
        p = PropertyValue()
        p.Name, p.Value = n, v
        return p

    os.makedirs(os.path.join(profile, "user"), exist_ok=True)
    with open(os.path.join(profile, "user", "registrymodifications.xcu"),
              "w", encoding="utf-8") as fp:
        fp.write(XCU)

    proc = subprocess.Popen(
        ["soffice", "--headless", "--norestore", "--nolockcheck", "--nodefault",
         "-env:UserInstallation=file://" + profile,
         "--accept=socket,host=127.0.0.1,port=%d;urp;" % PORT],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ctxr = uno.getComponentContext()
        res = ctxr.ServiceManager.createInstanceWithContext(
            "com.sun.star.bridge.UnoUrlResolver", ctxr)
        ctx = None
        for _ in range(60):
            try:
                ctx = res.resolve("uno:socket,host=127.0.0.1,port=%d;urp;"
                                  "StarOffice.ComponentContext" % PORT)
                break
            except Exception:                                  # noqa: BLE001
                time.sleep(1)
        if ctx is None:
            return False, "리브레오피스에 붙지 못했습니다"

        desk = ctx.ServiceManager.createInstanceWithContext(
            "com.sun.star.frame.Desktop", ctx)
        doc = desk.loadComponentFromURL(
            uno.systemPathToFileUrl(os.path.abspath(path)), "_blank", 0,
            (pv("Hidden", True), pv("MacroExecutionMode", 4)))
        try:
            ws = doc.Sheets.getByName(SHEET)

            row = None
            for r in range(0, 60):
                if ws.getCellByPosition(0, r).getString().strip() == "조회":
                    row = r
                    break
            if row is None:
                return False, "「조회」 칸을 못 찾았습니다"

            libs = doc.BasicLibraries
            have = list(libs.getElementNames())
            if "VBAProject" not in have:
                return False, "VBA 가 안 들여와졌습니다 (라이브러리: %s)" % have
            if not libs.isLibraryLoaded("VBAProject"):
                libs.loadLibrary("VBAProject")
            mods = list(libs.getByName("VBAProject").getElementNames())
            if "제안서매크로" not in mods:
                return False, "표준 모듈이 안 보입니다: %s" % mods

            # **꺼 두고 부른다.** 이미 켜져 있으면 안 돌아도 통과해 버린다.
            ws.getCellByPosition(1, row).setString(GO_OFF)

            spf = ctx.ServiceManager.createInstanceWithContext(
                "com.sun.star.script.provider.MasterScriptProviderFactory", ctx)
            prov = spf.createScriptProvider(doc)
            prov.getScript(
                "vnd.sun.star.script:VBAProject.제안서매크로.조회_실행"
                "?language=Basic&location=document").invoke((), (), ())

            after = ws.getCellByPosition(1, row).getString().strip()
            if not after.startswith("▶"):
                return False, ("매크로가 칸을 안 바꿨습니다 (지금 %r)" % after)
            return True, ("모듈 %d 개를 들여왔고, 조회_실행 이 칸을 %r → %r 로 "
                          "바꿨습니다" % (len(mods), GO_OFF, after))
        finally:
            try:
                doc.close(False)
            except Exception:                                  # noqa: BLE001
                pass
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=20)
        except Exception:                                      # noqa: BLE001
            proc.kill()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default=DEFAULT)
    ap.add_argument("--strict", action="store_true",
                    help="건너뛴 검사도 실패로 친다")
    args = ap.parse_args()

    if not os.path.exists(args.file):
        raise SystemExit("파일이 없습니다: %s" % args.file)
    print("매크로 엑셀 확인 — %s\n" % os.path.relpath(args.file, ROOT))

    results = []
    ok, msg = check_olevba(args.file)
    results.append(("① 제3의 파서(olevba)가 읽는가", ok, msg))

    with tempfile.TemporaryDirectory() as tmp:
        ok, msg = check_run(args.file, tmp)
    results.append(("②③ VBA 가 들여와지고 실제로 도는가", ok, msg))

    bad = 0
    for label, ok, msg in results:
        mark = {True: "통과", False: "실패", None: "건너뜀"}[ok]
        print("  [%s] %s\n        %s" % (mark, label, msg))
        if ok is False or (ok is None and args.strict):
            bad += 1

    print("\n  리브레오피스는 엑셀이 아닙니다 — Application.Goto·Select·MsgBox·"
          "\n  매크로 보안 경고는 여기서 확인되지 않습니다.")
    if bad:
        raise SystemExit("\n%d 가지가 통과하지 못했습니다." % bad)
    print("\n확인을 마쳤습니다.")


if __name__ == "__main__":
    main()
