#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""엑셀 매크로판을 만든다 — `.xlsx` 를 받아 진짜 누르는 단추를 단 `.xlsm` 으로.

왜 따로 만드나
──────────────────────────────────────────────────────────────────────
매크로 없는 `.xlsx` 에는 **누르는 단추를 넣을 수 없다.** 그래서 지금은 드롭다운
(「▶ 조회 실행」/「… 조건 입력 중」)으로 단추 흉내를 낸다. 진짜 단추를 원하시면
`.xlsm` 이어야 한다.

**원본 `.xlsx` 는 건드리지 않는다.** 손으로 빚은 VBA 프로젝트가 엑셀에서
「읽을 수 없는 내용」으로 거절될 가능성이 0 은 아니고(이 컨테이너에 진짜 엑셀이
없어 리브레오피스로만 확인할 수 있다), 그때 원래 파일까지 못 쓰게 되면 안 된다.
매크로판이 안 열리면 `.xlsx` 를 쓰면 된다.

회사 PC 에서 매크로가 막혀 있을 수 있다는 점도 그대로다 — 열자마자 「사용 안
함」이 뜨면 단추가 동작하지 않는다. 그 경우에도 드롭다운은 그대로 있다.

무엇을 붙이나
──────────────────────────────────────────────────────────────────────
  · `xl/vbaProject.bin`      vba_project.py 가 만든 VBA 프로젝트
  · `xl/drawings/drawing1.xml`  도형 두 개. 도형에 `macro=` 를 달면 누를 수 있다.
                             양식 컨트롤보다 부품이 훨씬 적다.
  · 콘텐츠 형식·관계·시트 코드명

쓰는 법
  python3 scripts/build_proposal_xlsm.py
  python3 scripts/build_proposal_xlsm.py --in 고객제안서_자산배분.xlsx

확인하는 법
  python3 scripts/verify_xlsm_macro.py

  MS-OVBA 는 한 바이트만 틀려도 엑셀이 「복구할 수 없습니다」를 띄운다.
  그래서 만든 뒤에는 기계로 확인한다 — 제3의 파서(olevba)가 소스를 한 글자
  까지 같게 읽는지, 그리고 리브레오피스가 VBA 를 들여와 `조회_실행` 이
  실제로 칸을 바꾸는지. 리브레오피스는 엑셀이 아니므로 MsgBox·Select·
  매크로 보안 경고까지는 확인되지 않는다.

산출물
  고객제안서_자산배분_매크로.xlsm
"""

import argparse
import os
import re
import shutil
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vba_project as V                                          # noqa: E402
import proposal_lib as P                                         # noqa: E402
from build_proposal_xlsx import GO_OFF, GO_ON                    # noqa: E402

ROOT = P.ROOT
DEFAULT_IN = os.path.join(ROOT, "고객제안서_자산배분.xlsx")
DEFAULT_OUT = os.path.join(ROOT, "고객제안서_자산배분_매크로.xlsm")

VBA_CT = "application/vnd.ms-office.vbaProject"
WB_CT_OLD = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"
WB_CT_NEW = "application/vnd.ms-excel.sheet.macroEnabled.main+xml"
DRAW_CT = "application/vnd.openxmlformats-officedocument.drawing+xml"
VBA_REL = "http://schemas.microsoft.com/office/2006/relationships/vbaProject"
DRAW_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"

# ── 매크로 ──────────────────────────────────────────────────────────
#
# 셀 주소를 박지 않는다. 이름이 아니라 **글자로 찾아** 쓴다 — 시트 모양이
# 바뀌면 박아 둔 주소는 조용히 엉뚱한 칸을 가리키는데, 그게 제일 고약하다.
MACRO = '''Option Explicit

' 「조회」 칸을 글자로 찾는다. 행 번호를 박아 두면 시트가 한 줄만 밀려도
' 엉뚱한 칸을 고친다 ― 틀렸다는 티도 안 난다.
Private Function 조회칸(ws As Worksheet) As Range
    Dim c As Range
    Set c = ws.Columns(1).Find(What:="조회", LookAt:=xlWhole, MatchCase:=False)
    If c Is Nothing Then
        Set 조회칸 = Nothing
    Else
        Set 조회칸 = ws.Cells(c.Row, 2)
    End If
End Function

Public Sub 조회_실행()
    Dim ws As Worksheet, g As Range, amt As Variant
    Set ws = ThisWorkbook.Worksheets("제안서")
    Set g = 조회칸(ws)
    If g Is Nothing Then
        MsgBox "「조회」 칸을 찾지 못했습니다. 시트가 바뀐 것 같습니다.", vbExclamation
        Exit Sub
    End If

    amt = ws.Cells(g.Row - 4, 2).Value            ' 투자금액
    If Not IsNumeric(amt) Or Val(amt) <= 0 Then
        MsgBox "투자금액을 넣으십시오.", vbExclamation
        ws.Cells(g.Row - 4, 2).Select
        Exit Sub
    End If

    g.Value = "%(on)s"
    Application.CalculateFull
    ' 배분표가 보이게 옮겨 준다. 조회했는데 화면이 그대로면 안 된 줄 안다.
    ws.Activate
    ws.Range("A1").Select
    Application.Goto ws.Cells(g.Row + 5, 1), True
End Sub

Public Sub 조건_초기화()
    Dim ws As Worksheet, g As Range, i As Long
    If MsgBox("조건과 조정 비중을 처음 값으로 되돌립니다. 계속할까요?", _
              vbOKCancel + vbQuestion) <> vbOK Then Exit Sub
    Set ws = ThisWorkbook.Worksheets("제안서")
    Set g = 조회칸(ws)
    If g Is Nothing Then Exit Sub

    ws.Cells(g.Row - 5, 2).ClearContents          ' 고객명
    ws.Cells(g.Row - 4, 2).Value = 10000          ' 투자금액
    ws.Cells(g.Row - 1, 2).ClearContents          ' 목표 연수익률
    g.Value = "%(off)s"

    ' 「조정 비중」 열(C)을 비운다 ― 자산군 줄만 훑는다.
    For i = g.Row + 4 To g.Row + 20
        If ws.Cells(i, 1).Value = "합계" Then Exit For
        If Len(ws.Cells(i, 1).Value) > 0 Then ws.Cells(i, 3).ClearContents
    Next i
    Application.CalculateFull
End Sub
''' % {"on": GO_ON, "off": GO_OFF}

# ── 단추 도형 ───────────────────────────────────────────────────────
#
# 도형에 `macro=` 를 달면 누를 수 있다. 양식 컨트롤(ctrlProps·vmlDrawing)을
# 쓰면 부품이 네댓 개 더 붙는데, 도형은 그림 한 장이면 된다.
DRAWING = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
%s</xdr:wsDr>'''

SHAPE = '''  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>%(c0)d</xdr:col><xdr:colOff>%(x0)d</xdr:colOff>
      <xdr:row>%(r0)d</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>%(c1)d</xdr:col><xdr:colOff>%(x1)d</xdr:colOff>
      <xdr:row>%(r1)d</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:sp macro="%(macro)s" textlink="">
      <xdr:nvSpPr>
        <xdr:cNvPr id="%(id)d" name="%(name)s"/>
        <xdr:cNvSpPr/>
      </xdr:nvSpPr>
      <xdr:spPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm>
        <a:prstGeom prst="roundRect"><a:avLst>
          <a:gd name="adj" fmla="val 8000"/></a:avLst></a:prstGeom>
        <a:solidFill><a:srgbClr val="%(fill)s"/></a:solidFill>
        <a:ln w="9525"><a:solidFill><a:srgbClr val="%(line)s"/></a:solidFill></a:ln>
      </xdr:spPr>
      <xdr:txBody>
        <a:bodyPr vertOverflow="clip" horzOverflow="clip" rtlCol="0" anchor="ctr"/>
        <a:lstStyle/>
        <a:p><a:pPr algn="ctr"/>
          <a:r>
            <a:rPr lang="ko-KR" sz="1100" b="1">
              <a:solidFill><a:srgbClr val="%(text)s"/></a:solidFill>
            </a:rPr>
            <a:t>%(label)s</a:t>
          </a:r>
        </a:p>
      </xdr:txBody>
    </xdr:sp>
    <xdr:clientData fLocksWithSheet="0"/>
  </xdr:twoCellAnchor>
'''

EMU = 9525          # 1 픽셀 = 9525 EMU


def find_sheet_part(z):
    """「제안서」 시트가 어느 sheetN.xml 인지 찾는다.

    파일 이름 순서와 시트 순서는 **같지 않을 수 있다.** workbook.xml 의 r:id 를
    workbook.xml.rels 로 풀어야 확실하다.
    """
    wb = z.read("xl/workbook.xml").decode("utf-8")
    rels = z.read("xl/_rels/workbook.xml.rels").decode("utf-8")
    rid = None
    for m in re.finditer(r"<sheet\b[^>]*>", wb):
        tag = m.group(0)
        name = re.search(r'name="([^"]*)"', tag)
        if name and name.group(1) == "제안서":
            got = re.search(r'r:id="([^"]*)"', tag)
            rid = got.group(1) if got else None
            break
    if not rid:
        return None
    # **속성 순서를 가정하지 않는다.** openpyxl 은 Type·Target·Id 차례로 쓰는데,
    # Id 를 먼저 찾는 정규식으로 잡으려다 한 번 놓쳤다. 태그를 통째로 집고 그
    # 안에서 따로 읽는다.
    for m in re.finditer(r"<Relationship\b[^>]*/?>", rels):
        tag = m.group(0)
        got_id = re.search(r'Id="([^"]*)"', tag)
        if not got_id or got_id.group(1) != rid:
            continue
        got_t = re.search(r'Target="([^"]*)"', tag)
        if not got_t:
            return None
        tgt = got_t.group(1).lstrip("/")
        return tgt if tgt.startswith("xl/") else "xl/" + tgt
    return None


def sheet_codenames(z):
    """시트 순서대로 코드명을 정한다 — VBA 문서 모듈 이름과 맞춰야 한다."""
    wb = z.read("xl/workbook.xml").decode("utf-8")
    return ["Sheet%d" % (i + 1)
            for i, _ in enumerate(re.finditer(r"<sheet\b[^>]*>", wb))]


def buttons_xml(row):
    """단추 두 개.

    「조회」 줄 옆에 놓았더니 그 줄의 안내문(C:G 병합)을 덮었다. 입력칸
    오른쪽 빈 자리(고객 정보 블록 옆)로 올린다 — 조건을 넣는 곳 바로 옆이라
    손이 가는 자리이기도 하다. 숨은 도우미 열(H·I)에는 놓지 않는다.
    """
    top = row - 5                       # 고객 정보 첫 줄
    shapes = []
    for i, (label, macro, fill, line, text) in enumerate([
            ("▶ 조회 실행", "조회_실행", "F58220", "CB6015", "FFFFFF"),
            ("조건 초기화", "조건_초기화", "FFFFFF", "84888B", "43474A")]):
        shapes.append(SHAPE % {
            # 열만 옮긴다. 행에도 간격을 주었더니 두 단추가 대각선으로 엇갈렸다.
            "c0": 3 + i * 2, "x0": 6 * EMU, "r0": top - 1,
            "c1": 4 + i * 2, "x1": 70 * EMU, "r1": top + 1,
            "macro": macro, "id": 2 + i, "name": "단추%d" % (i + 1),
            "fill": fill, "line": line, "text": text, "label": label})
    return DRAWING % "".join(shapes)


def find_go_row(path):
    """「조회」가 적힌 줄을 찾는다 — 도형을 그 옆에 놓기 위해서."""
    from openpyxl import load_workbook
    ws = load_workbook(path)["제안서"]
    for r in range(1, 60):
        if ws.cell(row=r, column=1).value == "조회":
            return r
    return 13


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", default=DEFAULT_IN)
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()
    if not os.path.exists(args.src):
        raise SystemExit("%s 가 없습니다 — 먼저 build_proposal_xlsx.py 를 "
                         "돌리십시오." % os.path.relpath(args.src, ROOT))

    go_row = find_go_row(args.src)
    zin = zipfile.ZipFile(args.src)
    sheet_part = find_sheet_part(zin)
    if not sheet_part:
        raise SystemExit("「제안서」 시트를 찾지 못했습니다.")
    codes = sheet_codenames(zin)

    # VBA 프로젝트 — 문서 모듈(ThisWorkbook + 시트마다 하나)과 표준 모듈 하나.
    mods = [{"name": "ThisWorkbook", "code": "", "document": True}]
    mods += [{"name": c, "code": "", "document": True} for c in codes]
    mods.append({"name": "제안서매크로", "code": MACRO})
    vba, pid = V.build_vba_project(mods)

    names = zin.namelist()
    with zipfile.ZipFile(args.out, "w", zipfile.ZIP_DEFLATED) as zout:
        for n in names:
            data = zin.read(n)
            if n == "[Content_Types].xml":
                x = data.decode("utf-8")
                x = x.replace(WB_CT_OLD, WB_CT_NEW)
                add = ('<Override PartName="/xl/vbaProject.bin" '
                       'ContentType="%s"/>' % VBA_CT)
                add += ('<Override PartName="/xl/drawings/drawing1.xml" '
                        'ContentType="%s"/>' % DRAW_CT)
                x = x.replace("</Types>", add + "</Types>")
                data = x.encode("utf-8")
            elif n == "xl/_rels/workbook.xml.rels":
                x = data.decode("utf-8")
                x = x.replace("</Relationships>",
                              '<Relationship Id="rIdVBA" Type="%s" '
                              'Target="vbaProject.bin"/></Relationships>' % VBA_REL)
                data = x.encode("utf-8")
            elif n == "xl/workbook.xml":
                x = data.decode("utf-8")
                # 워크북 코드명 — VBA 의 ThisWorkbook 모듈과 맞춘다.
                if "codeName=" not in x:
                    if "<workbookPr" in x:
                        x = re.sub(r"<workbookPr\b",
                                   '<workbookPr codeName="ThisWorkbook"', x, 1)
                    else:
                        x = x.replace("<sheets>",
                                      '<workbookPr codeName="ThisWorkbook"/>'
                                      "<sheets>", 1)
                data = x.encode("utf-8")
            elif re.match(r"xl/worksheets/sheet\d+\.xml$", n):
                x = data.decode("utf-8")
                idx = names_order(names, n)
                if idx is not None and idx < len(codes):
                    x = set_codename(x, codes[idx])
                if n == sheet_part:
                    # **`r:` 네임스페이스를 먼저 선언한다.** openpyxl 이 쓰는
                    # 시트 XML 에는 기본 네임스페이스밖에 없어서, 선언 없이
                    # `r:id` 를 넣으면 XML 이 네임스페이스 규칙을 어긴다.
                    # 그러면 읽는 쪽이 시트를 통째로 못 읽고, 서식이 전부
                    # 날아간 채로 열린다 — 도형만 안 보이는 게 아니다.
                    if "xmlns:r=" not in x[:500]:
                        x = x.replace(
                            "<worksheet ",
                            '<worksheet xmlns:r="http://schemas.openxmlformats.'
                            'org/officeDocument/2006/relationships" ', 1)
                    x = x.replace("</worksheet>",
                                  '<drawing r:id="rIdDraw"/></worksheet>')
                data = x.encode("utf-8")
            zout.writestr(n, data)

        # 시트 관계에 도형을 달아 준다. 원래 rels 가 있으면 이어 붙인다.
        rel_part = sheet_part.replace("xl/worksheets/",
                                      "xl/worksheets/_rels/") + ".rels"
        draw_rel = ('<Relationship Id="rIdDraw" Type="%s" '
                    'Target="../drawings/drawing1.xml"/>' % DRAW_REL)
        if rel_part in names:
            x = zin.read(rel_part).decode("utf-8")
            x = x.replace("</Relationships>", draw_rel + "</Relationships>")
        else:
            x = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                 '<Relationships xmlns="http://schemas.openxmlformats.org/'
                 'package/2006/relationships">' + draw_rel + "</Relationships>")
        if rel_part in names:
            # 이미 위 루프에서 원본을 썼으므로 겹쳐 쓸 수 없다 — 새 이름이 아니라
            # 같은 이름을 두 번 넣으면 엑셀이 첫 번째만 본다. 그래서 원본 루프에서
            # 빼 두고 여기서만 쓴다.
            raise SystemExit("시트 rels 가 이미 있습니다 — 이 경로는 아직 다루지 "
                             "않습니다(openpyxl 산출물에는 없습니다).")
        zout.writestr(rel_part, x)
        zout.writestr("xl/drawings/drawing1.xml", buttons_xml(go_row))
        zout.writestr("xl/vbaProject.bin", vba)

    print("%s (%.0f KB)" % (os.path.relpath(args.out, ROOT),
                            os.path.getsize(args.out) / 1024))
    print("  VBA 프로젝트 %d 바이트 · 모듈 %d(문서 %d + 표준 1)"
          % (len(vba), len(mods), len(mods) - 1))
    print("  단추 2개 — 「▶ 조회 실행」·「조건 초기화」 (%d 행 옆)" % go_row)
    print("  원본 %s 는 그대로 둡니다." % os.path.basename(args.src))


def names_order(names, part):
    """sheetN.xml 이 몇 번째 시트인지 — 파일 이름의 숫자를 쓴다."""
    m = re.search(r"sheet(\d+)\.xml$", part)
    return int(m.group(1)) - 1 if m else None


def set_codename(x, code):
    if "codeName=" in x:
        return x
    if "<sheetPr" in x:
        return re.sub(r"<sheetPr\b", '<sheetPr codeName="%s"' % code, x, 1)
    return re.sub(r"(<worksheet\b[^>]*>)", r'\1<sheetPr codeName="%s"/>' % code,
                  x, 1)


if __name__ == "__main__":
    main()
