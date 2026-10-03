# 마포 WM 링크 페이지 · 공개 범위 — 운영 인계

마지막 갱신 2026-10-01 · 계정을 옮겨도 이 갈래를 그대로 이어 가기 위한 기록.

이 문서가 다루는 것은 **고객에게 보내는 링크 페이지(`mapo-wm.html`)** 와
**저장소를 어디까지 공개할 것인가** 하나입니다. 시황 브리핑은
`docs/HANDOVER.md`, 증권사 리포트는 `docs/handover/증권사리포트-운영인계.md`
를 보십시오.

---

## 1. 무엇을 만들었나

기존 **QR 전단**(`mapowmmobiledesk.pdf`, 미래에셋증권 마포 WM)을
**링크 한 개로 보내는 모바일 페이지**로 옮겼습니다.

> 고객이 문자·카카오톡으로 받은 링크를 누름 → 화면이 뜸 → 원하는 항목을
> 누르면 그 업무가 **바로 실행**. 카메라로 QR을 비추는 단계가 사라집니다.

- 파일: **`mapo-wm.html`** — CSS·JS 인라인, **단일 파일**, 모바일 우선
- 현재 주소: **https://hanaroline.github.io/work_1/**
- 배포: `.github/workflows/pages.yml` — `main` 의 `mapo-wm.html` 이 바뀌면
  자동으로 다시 올라갑니다(1~2분)

### 화면 구성

| 영역 | 내용 |
|---|---|
| ① 비대면 계좌개설 | 01 주식(국내/해외)+CMA · 02 개인연금(이전/신규) · 03 퇴직연금(IRP) · 04 중개형 ISA · 05 개인투자용국채 · 06 RIA |
| ② 자주 찾는 업무 | 07 계좌비밀번호 재등록 · 08 통보처 관리 · 09 타사연금 가져오기 · 10 반송해지 · 11 해외주식 매매신청 · 12 외화증권 약정신청 · 13 해외 ETF 거래신청 |
| 준비물 스트립 | 신분증·본인명의 계좌·휴대폰 |
| 유의사항 | ※ 2줄 |
| 지점 안내 | 전화 걸기(`tel:`) · 주소 · 지도 링크 |
| 부가 | 한/영 토글(선택이 `localStorage` 에 남음) · 링크 복사 단추 · 인쇄 CSS |

---

## 2. 반드시 지켜야 할 것 — 사고가 났거나, 날 뻔한 것

### 2-1. 링크 13개는 **전단 QR을 디코딩한 값** 입니다. 지어내지 마십시오

전단 PDF를 `pypdfium2` 로 렌더링하고 OpenCV `QRCodeDetector` 로 읽어
**항목 번호와 QR 위치를 1:1 로 대조**해 옮겼습니다. 추측해서 만든 링크는
하나도 없습니다. 링크를 고쳐야 할 일이 생기면 **전단을 다시 디코딩하거나
지점에서 받은 값**으로만 바꾸십시오.

| 번호 | 링크 |
|---|---|
| 01 | `https://securities.miraeasset.com/mka/private/MjkzMDI1Nzk5/n02.do` |
| 02 | `https://securities.miraeasset.com/mka/pensiongain/MjAwMDI1/n02.do` |
| 03 | `https://securities.miraeasset.com/mka/pensionirp/MjAwMDI1/n02.do` |
| 04 | `https://securities.miraeasset.com/mka/brokerageisa/MjkzMDI1Nzk5/n02.do` |
| 05 | `https://securities.miraeasset.com/mka/persgovbond/MjkzMDI1Nzk5/n02.do` |
| 06 | `https://securities.miraeasset.com/mka/ria/MjkzMDI1Nzk5/n02.do` |
| 07 | `https://link.miraeasset.com/kzjl314` |
| 08 | `https://link.miraeasset.com/nmx30mz` |
| 09 | `https://link.miraeasset.com/y2xj3l4` |
| 10 | `https://link.miraeasset.com/0mjk3nz` |
| 11 | `https://link.miraeasset.com/kzw2k4j` |
| 12 | `https://link.miraeasset.com/4j054m3` |
| 13 | `https://link.miraeasset.com/wwmzl03` |

- QR 두 개(02·08)는 전체 판에서 안 읽혀 **배율 12로 올려 개별 크롭**
  (half=240)해 읽었고, 13번은 half=200 에서 읽혔습니다
- `link.miraeasset.com/...` 단축링크(07~13)의 **최종 목적지는 이 저장소에서
  확인할 수 없습니다.** 전단이 유효한 동안에는 같게 동작합니다
- **01~06 에는 마포 WM 지점 코드가 박혀 있습니다.** 다른 지점에서 그대로
  쓰면 안 됩니다

### 2-2. `tel:` 은 **하이픈을 넣어** 적습니다 — 실제로 틀렸던 자리

`href="tel:0227198861"` 로 적었더니 휴대폰에서 **02-2719-8861** 로 걸렸습니다
(사용자가 다이얼 화면으로 확인). 02 지역번호 뒤 국번이 세 자리라 단말이
끊는 자리를 잘못 잡습니다. **반드시 이렇게 적습니다.**

```html
<a class="btn-line solid" href="tel:02-719-8861">
```

고친 뒤에도 **실기기에서 한 번 눌러 확인**하십시오. 화면에 적힌 라벨과
`href` 가 같은 모양이라야 다음 사람이 눈으로 대조할 수 있습니다.

### 2-3. 배포는 **저장소 전체가 아니라 그 페이지만** 올립니다

`pages.yml` 은 `_site/` 를 손으로 꾸려서 올립니다. 저장소를 통째로 올리면
시세·ELS·브리핑 자료가 전부 웹에 노출됩니다. **이 구조를 무너뜨리지
마십시오.**

```yaml
- name: 배포할 파일만 모은다
  run: |
    mkdir -p _site
    cp mapo-wm.html _site/index.html
    cp mapo-wm.html _site/mapo-wm.html
    printf 'User-agent: *\nDisallow: /\n' > _site/robots.txt
```

### 2-4. 검색에 걸리지 않게 둡니다

페이지 `<meta name="robots" content="noindex, nofollow">` + `_site/robots.txt`.
지점 코드가 박힌 링크가 검색에 잡히면 안 됩니다. **문자·메신저로만** 배포.

### 2-5. 모바일 320~360px 에서 깨지지 않는지 봅니다

실제로 깨졌던 것: 제목 줄바꿈, 320px 에서 전화 단추 넘침. 지금 쓰는 규칙 —
`word-break:keep-all`, 제목 17px, CTA 14px, eyebrow 13px,
`≤360px` 에서 `.branch-actions{flex-direction:column}`.

화면 확인은 Playwright 로 하되 **이 실행 환경에서는 실행 파일을 지정해야
합니다**: `executable_path="/opt/pw-browsers/chromium"`.

### 2-6. `github.io` 는 **미래에셋 공식 도메인이 아닙니다**

고객이 비공식 도메인 링크에 익숙해지면 그 자체가 피싱 통로가 됩니다.
**사내 공식 서비스**(`securities.miraeasset.com/lfl/...` 형태)로 옮기는 것이
본래 가야 할 길입니다. 대외 배포 전 **준법감시 확인**을 권합니다.

---

## 3. 공개 범위 — 왜 저장소를 가르기로 했나

`hanaroline/work_1` 은 지금 **공개(public)** 입니다. Pages 를 쓰려면 공개여야
했기 때문입니다. 그런데 이 저장소에는 고객에게 보일 것이 아닌 것이 섞여
있습니다.

감사해서 확인한 것(2026-10-01 기준):

| 확인 | 결과 |
|---|---|
| API 키·토큰·개인키 | **없음** |
| `[사내한]` 표시가 붙은 브리핑 | **49건** |
| 회사 이메일 노출 | 있음 |
| 시세·ELS·리포트 수집물 | 전부 공개 상태 |

### 리스크

- **열람**: 공개 저장소는 주소만 알면 누구나 전부 봅니다. 커밋 이력까지
  남으므로 **지웠던 내용도 과거 커밋에서 꺼낼 수 있습니다**
- **피싱 재활용**: 13개 링크와 지점 안내를 베껴 비슷한 페이지를 만들면
  고객은 구분하기 어렵습니다
- **계정 탈취**: GitHub 계정이 털리면 **라이브 페이지의 링크를 바꿔치기**
  할 수 있습니다 — 이것이 가장 큰 위험입니다. **2FA 를 반드시 켜십시오**

### 결정 — 저장소를 둘로 가른다

| 저장소 | 공개 | 담는 것 |
|---|---|---|
| **`hanaroline/mapo-wm`** (새로 만들 것) | 공개 | 고객용 페이지 **하나만** |
| `hanaroline/work_1` | **비공개로 전환** | 나머지 전부 |

> **GitHub Free 에서 비공개 저장소는 개수 제한 없이 무료**입니다. 다만
> **비공개 저장소에서는 Pages 를 쓸 수 없습니다**(Pro 이상 필요). 그래서
> 고객 페이지만 공개 저장소로 떼어 내는 것입니다.
> 또 하나 — 공개 저장소의 Actions 는 무료 무제한이지만, **비공개로 바꾸면
> 월 2,000분 한도를 쓰기 시작합니다.** work_1 은 수집 워크플로가 44개라
> 전환 뒤 사용량을 반드시 지켜보십시오(넘치면 수집 주기를 줄입니다).

---

## 4. 아직 안 끝난 일 (넘겨 드립니다)

### 4-1. 저장소 분리 — **사용자가 저장소를 만들어 주셔야 진행됩니다**

세션 토큰에 저장소 생성 권한이 없습니다(`create_repository` → 403
`Resource not accessible by integration`). 2026-10-01 기준
`hanaroline/mapo-wm` 은 **아직 없습니다.**

**사용자가 할 일**: GitHub 에서 `mapo-wm` 저장소를 **Public** 으로 생성
(README 체크 해제, 빈 저장소로).

**그 뒤 받는 쪽이 할 일**:

1. `mcp__Claude_Code_Remote__add_repo(owner="hanaroline", repo="mapo-wm", access="push")`
2. 파일 네 개를 `main` 에 올린다 — 내용은 5절에 적어 두었습니다
   - `index.html` ← `work_1/mapo-wm.html` 을 그대로 복사
   - `robots.txt` ← `User-agent: *` / `Disallow: /`
   - `.github/workflows/pages.yml` ← **`actions/configure-pages@v5` 에
     `enablement: true`** 를 넣은 판(신규 저장소는 Pages 가 꺼져 있음)
   - `README.md`
3. 배포 확인 → **https://hanaroline.github.io/mapo-wm/**
4. 13개 링크를 **실기기에서** 한 번씩 눌러 본다
5. 새 주소가 뜨는 것을 확인한 뒤 `work_1` 에서
   `mapo-wm.html` · `.github/workflows/pages.yml` · README 해당 절을 지운다
6. 사용자가 `work_1` 을 **Private** 으로 전환

> **순서를 지키십시오.** 새 주소가 살아 있는 것을 확인하기 전에 work_1 을
> 비공개로 돌리면 고객에게 이미 나간 링크가 죽습니다.

### 4-2. 사용자가 직접 해야 할 것

- [ ] `work_1` Private 전환 (Settings 맨 아래 Danger Zone)
- [ ] GitHub 계정 **2FA**
- [ ] `main` 브랜치 보호
- [ ] 13개 링크 실기기 확인
- [ ] 준법감시 확인 후 대외 배포

### 4-3. 사내 공식 도메인으로 옮기기 — 미착수

`github.io` 는 임시 방편입니다(2-6).

---

## 5. 새 저장소에 올릴 `pages.yml` — 그대로 쓰십시오

`work_1` 의 것과 **다릅니다**. 신규 저장소는 Pages 가 꺼져 있어
`configure-pages` 로 켜야 하고, 파일 이름도 이미 `index.html` 입니다.

```yaml
name: 페이지 배포 (GitHub Pages)

on:
  workflow_dispatch:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      # Pages 가 아직 켜져 있지 않으면 여기서 켠다(Settings 수동 설정 불필요).
      - uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: 배포할 파일만 모은다
        run: |
          mkdir -p _site
          cp index.html robots.txt _site/

      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

      - id: deploy
        uses: actions/deploy-pages@v4
```

---

## 6. 이 환경에서 막혔던 것

- **저장소 생성 403** — 세션 토큰으로는 저장소를 못 만듭니다. 사용자가
  직접 만들어야 합니다
- **바깥으로 못 나갑니다** — `securities.miraeasset.com`,
  `hanaroline.github.io`, `docs.github.com` 모두 `EGRESS_BLOCKED`.
  **참고 페이지도, 배포된 내 페이지도, GitHub 문서도 직접 못 엽니다.**
  그래서 링크가 실제로 동작하는지는 **사용자가 눌러 봐야** 알 수 있습니다
- **PDF 읽기**: `pdftoppm` 없음, `pypdf` 는 `_cffi_backend` 오류 →
  **`pypdfium2`** 로 텍스트 추출·렌더링
- **Playwright**: `executable_path="/opt/pw-browsers/chromium"` 필수
- **머지된 브랜치에서 이어 갈 때**: `git checkout -B <브랜치> origin/main`
  으로 다시 시작한 뒤 force-with-lease 로 미는 편이 안전합니다

---

## 7. 지금까지의 결정 (날짜순)

| 날짜 | 결정 |
|---|---|
| 2026-10-01 | QR 전단을 **링크형 단일 페이지**로 옮김. 기존 전단 형식은 그대로 두고 이번 건부터 적용 |
| 2026-10-01 | 배포는 **GitHub Pages**. 단 저장소 전체가 아니라 `_site` 에 **고객용 페이지만** |
| 2026-10-01 | `noindex` + `robots.txt` 로 검색 노출 차단. 문자·메신저로만 배포 |
| 2026-10-01 | `tel:` 은 **하이픈 표기**(`tel:02-719-8861`) |
| 2026-10-01 | **저장소를 가른다** — 고객 페이지는 공개 `mapo-wm`, 나머지는 비공개 `work_1` |
