# 프롬프트 · 프로젝트 지침 · 시스템 설정 보관

> 새 Claude 계정/대화에서 이 작업을 이어갈 때 **복사해서 붙여넣는 용도**입니다.
> 최종 갱신: 2026-10-01

---

## 1. 페르소나 프롬프트 (매 대화 첫 메시지에 붙여넣기)

```
너는 부동산 세제/대출/금융/규제 전문가야. 그리고 국세청에서 오래 근무한 베테랑 세무 전문가야.
그리고 금융권에서 오래 근무한 금융전문가야. 또한 건강보험공단에서 오래 근무한 건강보험 쪽 관련 전문가야.
또한 변호사 자격증을 갖고 있어서 법규에 대한 지식이 탁월해.
```

## 2. 작업 요청 프롬프트 템플릿

### 2-1. 신규 자료 검증
```
첨부 자료의 내용을 철저히 검증하고, 오류 또는 수정·추가·보완할 부분이 있으면 알려주고, 변경해줘.
서식 및 텍스트들이 다른 텍스트와 중첩되지 않는지도 체크하고, 레이아웃 잘 맞추고.
오늘이 YYYY년 M월 D일인데, 최신 데이터에 맞게.
정부 관련기관, 금융기관 등 확인할 수 있는 사이트에서 체크하고. 질문사항 있으면 질문하고.
```

### 2-2. 기존 자료 최신화 (정기 점검)
```
docs/tax-seminar-2026/HANDOFF.md 를 먼저 읽고 맥락을 파악해줘.
files/ 의 v3 자료 6종을 오늘 기준 최신 법령·고시로 다시 검증하고,
바뀐 부분만 수정해서 v4로 만들어줘. 바꾸지 말라고 정리된 항목은 건드리지 말고.
수정한 슬라이드는 반드시 렌더링해서 겹침·넘침을 눈으로 확인해줘.
```

### 2-3. 작업 지시 시 반드시 함께 줄 것
- 오늘 날짜 (모델의 지식 컷오프 때문에 필수)
- "정부기관·공식 사이트에서 확인" (블로그 2차 보도만으로 단정하지 않게)
- "질문사항 있으면 질문하고" (단정 대신 확인을 유도)

---

## 3. 프로젝트 지침 (작업 규칙)

1. **원본 서식 보존** — pptx 수정은 zip을 다시 만들지 말고 대상 슬라이드 XML만 문자열 치환.
   서식·네이티브 차트·레이아웃·미디어가 그대로 유지됨. 차트를 이미지로 바꾸지 말 것.
2. **치환 전 단언** — `old` 문자열이 정확히 1회 나타나는지 확인 후 치환. 오치환 방지.
3. **육안 검수 필수** — 좌표 기반 자동 검사만으로는 겹침을 못 잡음. 반드시 PNG로 렌더링해서 확인.
4. **근거 없는 단정 금지** — 조문 번호를 찾지 못하면 수치를 고치지 말고 주의 문구만 추가.
5. **2차 보도 ≠ 1차 출처** — 블로그·요약 기사로 수치를 확정하지 말 것. 부처 보도자료·법령·고시 우선.
6. **내가 틀릴 수 있음** — 슬라이드 안의 계산 예제가 내 수정과 모순되면, 대개 **원문이 맞음**.
7. **디자인** — 미래에셋 기준: 오렌지 `#F58220`, 블루 `#043B72`, 표 헤더 `#FAB072`,
   Noto Sans KR / Spoqa Han Sans Neo, 모서리 4px 이하, 그라데이션·이모지 금지.

---

## 4. 환경 재구축 (새 컨테이너에서 매번 필요)

```bash
# 1) pptx 렌더링 도구 — apt-get update 를 먼저 하지 않으면 404 로 실패한다
apt-get update -qq
apt-get install -y libreoffice-impress fonts-noto-cjk
fc-cache -f

# 2) 파이썬 도구
pip install pymupdf pillow

# 3) 변환 확인
soffice --headless -env:UserInstallation=file:///tmp/lo1 \
        --convert-to pdf --outdir render files/*.pptx
```

**주의**: `libreoffice-core`만 있고 `libreoffice-impress`가 없으면
`Error: source file could not be loaded` 만 나오고 원인을 알기 어렵다. 이 한 줄이 핵심이다.

---

## 5. 재사용 스크립트

### 5-1. 슬라이드 텍스트 덤프
```python
import zipfile, re, sys
z = zipfile.ZipFile(sys.argv[1])
sl = sorted([n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)],
            key=lambda n: int(re.findall(r'\d+', n)[0]))
for n in sl:
    p = int(re.findall(r'\d+', n)[0])
    for t in re.findall(r'<a:t>(.*?)</a:t>', z.read(n).decode(), re.S):
        if len(t.strip()) > 3:
            print(f'p{p:>2} | {t}')
```
XML 안에서 작은따옴표는 `&apos;`, 큰따옴표는 `&quot;` 로 들어 있다. 치환 문자열에 그대로 써야 한다.

### 5-2. 도형 좌표 덤프 (겹침 원인 추적용)
```python
import zipfile, sys
import xml.etree.ElementTree as ET
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
P = '{http://schemas.openxmlformats.org/presentationml/2006/main}'
E = 914400.0   # EMU per inch
z = zipfile.ZipFile(sys.argv[1])
root = ET.fromstring(z.read(f'ppt/slides/slide{sys.argv[2]}.xml'))
for ch in list(root.find(P+'cSld').find(P+'spTree')):
    if ch.tag.split('}')[1] not in ('sp', 'graphicFrame', 'pic'):
        continue
    nv = ch.find('.//'+P+'cNvPr')
    xf = next((c for c in ch.iter() if c.tag == A+'xfrm'), None)
    if xf is None:
        continue
    o, e = xf.find(A+'off'), xf.find(A+'ext')
    x, y = int(o.attrib['x']), int(o.attrib['y'])
    cx, cy = int(e.attrib['cx']), int(e.attrib['cy'])
    tb = ch.find(P+'txBody')
    txt = ''
    if tb is not None:
        for p in tb.findall(A+'p'):
            txt += ''.join((r.find(A+'t').text or '')
                           for r in p.findall(A+'r') if r.find(A+'t') is not None) + ' ¶ '
    print(f"{nv.attrib.get('name',''):12s} y={y/E:6.2f} h={cy/E:5.2f} "
          f"(end {(y+cy)/E:5.2f}) x={x/E:5.2f} w={cx/E:5.2f} | {txt[:100]}")
```
`h` 가 **음수**로 나오는 도형은 그 자체로 버그다. 실제로 1건 있었다.

### 5-3. 텍스트 치환 적용 (서식 보존)
```python
import zipfile, os, re, shutil
EDITS = [ (슬라이드번호, '기존문자열', '새문자열'), ... ]
zin = zipfile.ZipFile(SRC)
with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zo:
    for it in zin.infolist():
        d = zin.read(it.filename)
        m = re.match(r'ppt/slides/slide(\d+)\.xml$', it.filename)
        if m:
            sl = int(m.group(1)); x = d.decode('utf-8')
            for s, old, new in EDITS:
                if s == sl:
                    assert x.count(old) == 1, (sl, x.count(old), old[:40])
                    x = x.replace(old, new)
            d = x.encode('utf-8')
        zo.writestr(it, d)
```
도형 좌표·글자 크기를 바꿀 때는 같은 방식으로 `<a:off x=".." y=".."/>`,
`<a:ext cx=".." cy=".."/>`, `sz="1100"` 을 치환한다 (1인치 = 914400 EMU, 크기는 100배 정수).

### 5-4. 무결성 검사
```python
import zipfile, os, re
import xml.etree.ElementTree as ET
for f in sorted(os.listdir('files')):
    z = zipfile.ZipFile('files/' + f)
    assert z.testzip() is None
    for i in z.infolist():
        if i.filename.endswith(('.xml', '.rels')):
            ET.fromstring(z.read(i.filename))      # 스키마 파싱
    sl = [x for x in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', x)]
    txt = ''.join(z.read(x).decode() for x in sl)
    stale = [s for s in ['고쳤어야 할 옛 문자열들'] if s in txt]
    print(f, len(sl), stale)
```

### 5-5. 렌더링 → 이미지
```python
import pymupdf
doc = pymupdf.open('render/파일.pdf')
doc[페이지번호 - 1].get_pixmap(dpi=100).save('out.png')
```

---

## 6. 시스템 설정 메모

### Claude Code 세션 환경
- 작업 디렉터리 `/home/user/work_1` (= GitHub `hanaroline/work_1`)
- 스크래치패드는 **세션 종료와 함께 삭제됨.** 남길 것은 반드시 git에 커밋
- 업로드한 첨부파일도 세션 종료 시 회수됨 (`/root/.claude/uploads/...`)
- 아웃바운드 HTTPS는 프록시 경유. `law.go.kr`, `nhis.or.kr`, `easylaw.go.kr` 은 **403으로 막힘**
  → 조문 확인은 WebSearch 결과 스니펫으로 교차검증해야 함

### 저장소 설정 (`.claude/settings.json`)
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command",
                     "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh" } ] }
    ]
  }
}
```

### 쓰고 있는 스킬
- `mas-design` — 미래에셋 브랜드 디자인 기준
- `pptx` — PowerPoint 생성·편집
- `fin-data-integrity` — 금융 수치 검산 절차

### 아티팩트 관련 (알아둘 제약)
- 페이지 1개당 **16MB**. 아티팩트 개수 제한은 없음
- 아티팩트가 담을 수 있는 파일 형식: html/css/js/json/txt/md/svg/png/jpg/webp/pdf 등 **웹 서비스 가능 타입만**
- **pptx·docx·xlsx는 담기지 않음.** `downloads` 기능으로 우회할 수는 있으나 뷰어 설정에 따라 막힘
- 아티팩트는 **생성한 계정에 귀속**됨. 계정을 바꾸면 접근 불가 → 원본은 git에 둘 것
