---
name: mas-design
description: >-
  미래에셋증권 브랜드 산출물을 만들 때 사용하는 디자인 기준입니다.
  HTML 페이지, 리포트, 대시보드, PPT, Word 문서의 색상·폰트·레이아웃·표·차트 스타일을 일관되게 적용합니다.
  미래에셋 오렌지/블루 컬러, 승인 폰트, 한/영 UI 규칙, 품질 점검 기준을 포함합니다.
  미래에셋 브랜드 문서나 화면을 제작할 때 디자인 관련 요청이 있으면 이 기준을 사용합니다.
---

# Mirae Asset Design System

> 미래에셋증권 산출물의 디자인 의사결정을 통제하는 유일한 소스
> 이 문서를 읽고 작업하는 어시스턴트는 미래에셋의 designer expert 역할을 한다.

---

## 0. 이 문서의 사용 규칙 (Meta Guide)

### 어떻게 읽나
이 문서는 사전이자 워크플로우다. 매번 처음부터 끝까지 읽지 말고, 작업 단계별로 필요한 섹션을 참조한다.

| 상황                     | 읽어야 할 섹션 |
|---|---|
| 작업 시작               | §1 (Context) → §2 (Workflow) → §3 (Voice) |
| 출력 형식 결정         | §2.3 (Default = HTML) |
| 자료를 받았는데 막막함 | §2.2 (10 Questions) |
| 한/영 토글 디자인 / 위치 | §4 (Bilingual Toggle Spec) |
| HTML 최적화 디자인     | §5 (HTML-First Design) |
| 본격 빌드 시작         | §6-§9 (Typography / Colors / Layout / Components) |
| 빌드 직전 자기 점검   | §10 (AI Slop Blacklist) |
| docx/pptx 가 필요할 때 | §11 (Secondary Formats) |
| 자주 쓰는 장면         | §12 (Scene Templates) |
| 산출물 완성 후         | §13 (Self-Critique) → §14 (Verification) |
| 빠른 토큰 조회         | §15 (Quick Reference) |

### 핵심 원칙 (Doctrine)
1.  **HTML 기본 출력** — 모든 산출물은 HTML 로. docx/pptx/keynote 는 명시적 요청 시에만 (§2.3).
2.  **한/영 토글 디자인은 명세, 구현은 자유** — 토글 버튼의 위치/스타일은 통일. 토글 로직(JS) 은 빌드 시점에 자유롭게 구현, MD 에는 코드 박지 않음 (§4).
3.  **컨텍스트 우선** — 색/폰트/레이아웃 결정은 이미 내려졌다.
4.  **콘텐츠 중심** — 사용자가 제공한 작업물 내용이 있으면 그 위주로 생성. 콘텐츠나 제목만 제공되었을 때만 추가 자료 생성 (불필요한 가정 최소화).
5.  **Anti-slop 우선** — "예쁘게" 보다 "AI 슬롭" 회피가 더 중요.
6.  **검증으로 끝낸다** — 자가 평가 + 시각 검증 통과해야 완료.
7.  **로고/워드마크/사인오프 흉내 금지** — §10.6 참조. 원본 로고 자산이 없으면 빈 자리로 둔다.
8.  **폰트 4 패밀리 + Aptos 고정** — Spoqa Han Sans Neo / Noto Sans KR / KoPub Batang Pro / KoPub Dotum Pro / Aptos. 그 외 (Pretendard, Inter, Roboto, Apple SD Gothic, Malgun 등) 일체 사용 금지 (§6).
9.  **수정 가능한 산출물** — PPT/Keynote 는 텍스트·도형·차트가 모두 편집 가능한 형태로 생성. 이미지로 박힌 (rasterized) 슬라이드 금지.
10. **차트 데이터 편집성** — PPT/Keynote 차트는 데이터를 사용자가 직접 수정할 수 있는 네이티브 차트 형태로 생성 (스크린샷 / 이미지 금지).
11. **포맷 간 디자인 일관성** — PPT/Keynote/docx 산출물은 동일 주제의 HTML 버전과 시각적으로 동일해야 한다 (색 / 폰트 / 레이아웃 / 위계). 생성 후 HTML 과 나란히 비교 검증 (§14).

---

## 1. Design Context (이 시스템의 출발점)

**로고**: `./logo.svg` 경로에 로고 파일이 있으면 `src/pages/GlobalTech/GlobalReports/MASDesignSystem/logo.svg`에서 가져와서 사용하고, 없으면 생략한다.

미래에셋의 디자인 결정은 다음과 같이 확립되어 있다. 그대로 따른다.

| 자산 종류             | 값                                              |
| --------------------- | ----------------------------------------------- |
| **Primary 컬러**      | Mirae Asset Orange `#F58220` (RGB 245, 130, 32) |
| **Secondary 컬러**    | Mirae Asset Blue `#043B72` (RGB 4, 59, 114)     |
| **Table Header**      | Soft Orange `#FAB072` (RGB 250, 176, 114)       |
| **Cell Highlight**    | Gray `#D7D7D7` (RGB 215, 215, 215)              |
| **Primary 폰트**      | Spoqa Han Sans Neo                              |
| **Web 대체 폰트**     | Noto Sans KR (Google Fonts CDN)                 |
| **정식 명조**         | KoPub Batang Pro                                |
| **정식 고딕**         | KoPub Dotum Pro                                 |
| **영문**              | Aptos                                            |
| **레이아웃 시그니처** | 1px 오렌지 섹션 룰                              |
| **테이블 시그니처**   | FAB072 헤더 + D7D7D7 셀 강조                    |
| **차트 페어**         | 시리즈 1 = Orange, 시리즈 2 = Blue (고정)       |

**컨텍스트 우선 원칙**: 새 작업 시작 시 "이 시스템 값으로 95% 해결되는가?" 자문. 그렇다면 그대로, 아니라면 명시.

**절대 금지**: 컬러를 "비슷한 값"으로 새로 잡기, 폰트를 임의의 무료 폰트로 교체.

---

## 2. Workflow (작업 흐름)

### 2.1 Junior Designer 4-Pass

**Pass 1 · Assumptions + Placeholders (5-15분)**
- 가정과 미해결 질문 명시
- 본문은 placeholder
- 사용자에게 방향 먼저 확인

**Pass 2 · 실제 콘텐츠 + 구조**
- placeholder → 실제 콘텐츠
- 한/영 페어 동시 작성 (한/영 토글 필요한 경우)
- 토큰 시스템 적용
- 중간 사용자 확인

**Pass 3 · 디테일 다듬기**
- 자간, 행간, 정렬 미세 조정
- 강조 일관성 점검
- 한/영 길이 차이 점검

**Pass 4 · 자가 평가 + 검증**
- §13 (Self-Critique) 점검
- §14 (Verification) 시각 검증 — 한국어 / 영문 모드 둘 다
- 사용자에게 caveats + next steps 짧게 보고

### 2.2 시작 전 10가지 질문

새 작업이 모호하면, 한 번에 모아서 묻는다.

```
시작 전에 몇 가지 확인할게:

**컨텍스트**
1. 누가 읽는 자료야? (사내 임원 / 기관 투자자 / 일반 고객 / 외부 파트너)
2. 어떤 매체에서 소비돼? (데스크탑 / 모바일 / 인쇄 후 배포)
3. 톤은? (정식 보고 / 마케팅 / 분석 / 교육)

**범위 / 깊이**
4. 분량? (1페이지 요약 / 본격 분석 / 발표용 덱)
5. 데이터는 내가 만들어도 되나, 받을 거 있나?
6. 강조 포인트? (특정 메시지 / 특정 수치 / 특정 권고)

**언어 / 형식**
7. 한/영 토글 필요해? (기본은 KO 단일, 토글 요청 시 페어 작성)
8. 시작 언어는? (기본 한국어)
9. 분기 / 연간 / 일회성?
10. 이전 같은 종류 자료 있어? 있으면 그거에 맞춰서.
```

### 2.3 Output Format Decision Tree

```
[기본 출력 = HTML]

명시적 요청이 있나?
  "PPT / 슬라이드 / 발표 자료 / deck"   → pptx
  "Word / 워드 / .docx 파일"            → docx
  "PDF / 인쇄용"                       → HTML → 사용자가 브라우저 인쇄 → PDF
  그 외 모두                           → HTML

HTML 이 기본인 이유:
- 인터랙티브 (차트 hover, 인쇄 모드, PDF 저장) 가능
- 어디서나 열림 (브라우저만 있으면)
- 반응형 (데스크탑 + 태블릿 + 모바일)
- 사용자가 인쇄해서 PDF 저장 가능
- 한/영 토글 손쉽게 구현 가능
```

### 2.4 Variations 정책
- 2-3개가 sweet spot. 4개 이상은 선택 피로.
- 각 버전은 다른 축에서 변형 (보수 vs 모던, 정보 위주 vs 시각 위주).

---

## 3. Brand Voice & Atmosphere

### 3.1 한 줄 정의
**Mirae Asset 은 "institutional, confident, trust-driven" 이다. Editorial 이 아니다. Consumer-fintech 가 아니다.**

### 3.2 포지셔닝

| 브랜드           | 캐릭터 | 미래에셋과의 차이 |
|---|---|---|
| Claude.com      | 따뜻한 cream + serif editorial | 우리는 white canvas + sans-serif institutional |
| Toss / 카카오뱅크 | 친근한 consumer fintech, 둥근 모서리 | 우리는 자산 관리 — 날카로운 모서리, 진중함 |
| Bloomberg       | 검은 배경 + 노란 강조 | 우리는 흰 배경 + 오렌지 강조 |
| Goldman Sachs   | 매우 어두운 navy 단색 | 우리는 navy + 오렌지 페어로 더 접근 가능 |

### 3.3 3 표면 모드
1. **White canvas** (`#FFFFFF`) — 본문 페이지 기본 (90%)
2. **Orange full-bleed** (`#F58220`) — Hero, 강조 콜아웃 (5%)
3. **Soft tint** (`#ECEFF4`) — 차트 배경, 콜아웃 카드 (5%)

### 3.4 보이스 체크리스트
- [ ] cream/beige 없는가?
- [ ] 본문 sans-serif?
- [ ] 오렌지가 전략적 지점에만 집중?
- [ ] 차트 시리즈 #1 오렌지, #2 블루?
- [ ] 모서리 sharp? (12px+ 라운드 아웃)
- [ ] 그라데이션, emoji, drop shadow 없는가?

---

## 4. Bilingual Toggle Spec (한/영 토글 — 디자인/위치만)

**모든 HTML 산출물에 한/영 토글을 갖춘다.** 토글 버튼의 위치와 스타일은 이 명세를 따르고, 토글 로직 (JS) 은 빌드 시점에 자유롭게 구현한다. MD 파일에는 구현 코드를 박지 않는다 (생성 속도 우선).

### 4.1 토글 버튼 디자인 사양

| 항목                | 값 |
|---|---|
| **위치**            | 우상단 (스크롤 시 고정 안 함, `position: static` 또는 `relative`) |
| **배치**            | 페이지/섹션 상단 또는 헤더 영역에 배치 — 스크롤 흐름에 따라 자연스럽게 움직임 |
| **모바일 위치**     | 우상단 유지 (모바일에서도 접근 용이, 콘텐츠 가림 최소화) |
| **반응형 대응**     | 화면 크기에 따라 자동 정렬 (데스크탑 우측, 모바일 우측 상단) |
| **버튼 표기**       | "KO" / "EN" (2자리 ISO 코드) |
| **버튼 크기**       | 패딩 10px × 17px, 높이 ~38px |
| **글꼴**            | Inter / Aptos (영문), 14px / Medium 500 / 자간 0.5px |
| **모서리**          | `border-radius: 2px` (시스템 sharp 미감) |
| **외곽**            | 1px solid `#CDCECB` |
| **그림자**          | 매우 약하게 (`0 2px 8px rgba(0,0,0,0.06)`) — 떠 있는 느낌 |
| **두 버튼 사이**    | 1px `#CDCECB` 세로 분리선 |
| **활성 상태**       | 배경 `#F58220`, 글자 `#FFFFFF` |
| **비활성 상태**     | 배경 `#FFFFFF`, 글자 `#6C6C6C` |
| **호버 (비활성)**   | 배경 `#F7F8FA`, 글자 `#1A1A1A` |
| **언어 유지**       | localStorage 로 사용자 선택 기억 (구현 자유) |

### 4.2 한/영 번역 가이드라인

**번역 수준** — 기본 = "둘 다 풀 번역":
- 모든 본문, 헤딩, bullet, 캡션을 영문화
- 단, 다음은 영문판에서도 그대로 유지:
  - 수치 (12.4%, $268B, 2,680조)
  - 외래 약자 (FOMC, BOJ, ECB, AUM, YTD)
  - 코드 / 단위
  - 한국 인명/지명 (필요 시 음역)

**날짜 표기 차이**:
- 한국어: "2026년 9월" / "2026.09"
- 영문: "September 2026" / "2026-09"
- 분기: "Q3 2026" (한/영 동일)

**숫자 표기 차이**:
- 한국 자산: 한글판 "₩268조", 영문판 "$200B" 또는 "KRW 268 trillion"
- 천 단위: 한/영 모두 콤마 (`1,000,000`)
- 퍼센트, bp: 한/영 동일

### 4.3 페어드 콘텐츠 길이 관리

영문은 한국어보다 보통 **1.3-1.5배 길어진다.** 레이아웃 가이드:

| 요소         | 한국어  | 영문 권장 길이 |
|---|---|---|
| Hero 제목    | 7-12자  | 4-7 단어 |
| 페이지 헤딩  | 8-15자  | 5-9 단어 |
| Bullet 한 줄 | 30-50자 | 12-20 단어 |
| 표 셀        | 4-8자   | 2-4 단어 |
| 버튼 라벨    | 2-4자   | 1-3 단어 |

영문이 너무 길어지면 한국어를 더 짧게 줄이거나, 영문을 더 압축한다. **레이아웃이 한 언어에서만 깨지면 안 된다.**

### 4.4 폰트 자동 스위칭 (디자인 사양)

- 한국어 모드: `html[lang="ko"]` → Spoqa Han Sans Neo / Noto Sans KR
- 영문 모드: `html[lang="en"]` → Inter / Aptos
- CSS `:lang()` 셀렉터 활용 권장
- 구현 방식은 빌드 시점에 자유롭게 결정

---

## 5. HTML-First Design

웹 매체에 최적화된 디자인 결정.

### 5.1 웹과 인쇄의 차이

| 측면           | 인쇄 (docx/pptx) | 웹 (HTML) |
|---|---|---|
| 본문 폰트 사이즈 | 13pt (≈17px) | **19px** |
| 라인 하이트    | 1.15-1.25 | **1.65-1.75** |
| 페이지 마진    | 1.5cm | **양쪽 24-32px**, max-width 1200px 중앙 |
| 섹션 간격      | 1-2줄 spacing | **72-104px** |
| 색 대비        | print contrast | **WCAG AA 이상** |
| 인터랙션       | 없음 | hover, click, focus 상태 필요 |

### 5.2 HTML 본문 타이포

| 토큰           | 사이즈 | 두께 | 라인 하이트 | 자간  | 용도 |
|---|---|---|---|---|---|
| `display-hero` | **67px** (모바일 43px) | 700 | 1.1 | -1.0px | Hero 메인 헤드라인 |
| `display-lg`   | **48px** (모바일 34px) | 700 | 1.15 | -0.5px | 섹션 디바이더 |
| `h1`           | **34px** (모바일 26px) | 700 | 1.25 | -0.3px | 페이지 메인 헤딩 |
| `h2`           | **26px** (모바일 22px) | 600 | 1.3 | 0 | 섹션 헤딩 |
| `h3`           | **22px** (모바일 19px) | 600 | 1.3 | 0 | 서브섹션 |
| `body`         | **19px** | 400 | 1.65 | 0 | 본문 |
| `body-sm`      | **17px** | 400 | 1.55 | 0 | 보조 본문 |
| `caption`      | **14px** | 400 | 1.4 | 0.2px | 표 주석, 푸터 |
| `stat-hero`    | **67px** (모바일 48px) | 700 | 1.0 | -0.6px | 큰 수치 (AUM, %) |
| `stat-label`   | **16px** | 500 | 1.2 | 0.6px | 수치 위 작은 레이블 |

### 5.3 웹 레이아웃 호흡

```
:root {
  /* 웹 spacing */
  --space-section: 104px;
  --space-block:   56px;
  --space-content: 28px;
  --space-tight:   14px;
}
@media (max-width: 768px) {
  :root {
    --space-section: 72px;
    --space-block: 36px;
  }
}

.page { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 768px) {
  .page { padding: 0 20px; }
}
```

### 5.4 인터랙티브 요소 (필수)

**차트 hover tooltip** — 막대/라인 위 hover 시 정확한 수치. 박스 `#1A1A1A`, 텍스트 흰색, 13px

**표 행 hover** — `background: #F7F8FA` 살짝 강조. 클릭 가능 행은 cursor `pointer`

**섹션 anchor 링크** — 모든 h2 / h3 에 `id` 부여 → URL hash 로 직접 이동

**익명화 모드 (옵션)** — "Anonymize / 익명화" 토글. 수치 → `XXX`, 인명 → `[Analyst Name]`. 외부 공유용

**다크 모드 (선택)** — 기본 OFF. 명시 요청 시만 구현

### 5.5 미디어 쿼리 / 반응형 breakpoints

```
/* Desktop large */ @media (min-width: 1440px) { ... }
/* Desktop */      @media (min-width: 1024px) { ... }
/* Tablet */       @media (min-width: 768px)  { ... }
/* Mobile */       /* default mobile-first */
```

### 5.6 인쇄 모드 CSS (필수)

```
@media print {
  .lang-toggle, nav { display: none !important; }
  body { font-size: 13pt; line-height: 1.4; }
  .page { max-width: 100%; padding: 0; }
  .chart-wrapper { page-break-inside: avoid; }
  .section-header { page-break-after: avoid; }
  h2, h3 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
}
```

### 5.7 접근성 (Accessibility)

- 모든 인터랙티브 요소는 키보드 접근 가능 (tab 순회)
- 토글 버튼은 `role="radiogroup"` + `aria-checked`
- 차트는 `<table>` 데이터 대안 제공 또는 `aria-label`
- 색 대비 WCAG AA 이상
- 폰트 사이즈 user-zoom 허용 (rem 단위 권고)

---

## 6. Typography

### 6.1 4가지 공식 폰트 패밀리

```
Spoqa Han Sans Neo : Thin · Light · Regular · Medium · Bold  (PPT/Word 모던)
Noto Sans KR       : 9 weights (100-900)                      (Web 기본)
KoPub Batang Pro   : Light · Medium · Bold (명조)             (정식 보고서)
KoPub Dotum Pro    : Light · Medium · Bold (돋움)             (정식 보고서)
Aptos / Inter      : 영문                                      (Web 영문, PPT 영문)
```

### 6.2 HTML 폰트 스택

```
:root {
  /* 한국어 모드 */
  --font-kr-modern: 'Spoqa Han Sans Neo', 'Noto Sans KR', 'Pretendard',
                    'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  --font-kr-formal: 'KoPubDotum_Pro', 'Spoqa Han Sans Neo',
                    'Noto Sans KR', sans-serif;
  --font-kr-serif:  'KoPubBatang_Pro', 'Noto Serif KR', serif;

  /* 영문 모드 */
  --font-en:        'Inter', 'Aptos', 'Segoe UI', system-ui,
                    -apple-system, BlinkMacSystemFont, sans-serif;

  /* 숫자 */
  --font-num:       'Inter', 'SF Mono', monospace;
}

/* 언어별 자동 스위칭 — 디자인 규칙만, 구현은 자유 */
html[lang="ko"] body { font-family: var(--font-kr-modern); }
html[lang="en"] body { font-family: var(--font-en); }
```

### 6.3 Google Fonts CDN (Web)

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 6.4 타이포 원칙
- **헤드라인은 Bold 700.** 금융 브랜드는 헤드라인이 단언해야 한다.
- **자간**은 헤드라인에만 약하게 (-0.3 ~ -1.0px). 본문은 0.
- **이탤릭 금지.** 강조는 bold / red / underline 만.
- **숫자는 tabular-nums:** `font-variant-numeric: tabular-nums`
- **본문 19px 이상** — 디지털 가독성 우선.

---

## 7. Colors (검증된 팔레트)

### 7.1 브랜드 코어

| 토큰               | HEX | RGB | 용도 |
|---|---|---|---|
| **primary**        | `#F58220` | 245, 130, 32 | Hero, CTA, 섹션 룰, 토글 active, 차트 시리즈 #1 |
| **secondary**      | `#043B72` | 4, 59, 114 | 차트 시리즈 #2, 강조 수치 |
| primary-active     | `#CB6015` | — | hover/press |
| primary-soft       | `#FAB072` | 250, 176, 114 | 테이블 헤더, 부드러운 강조 |
| primary-disabled   | `#D7D7D7` | — | 비활성 + 테이블 셀 하이라이트 |

### 7.2 차트 서브 팔레트
- 웜: `#F0B26B` (tan) · `#CB6015` (deep) · `#AD624E` (terracotta)
- 쿨: `#00A9CE` (cyan) · `#0086B8` (blue) · `#7E9FC3` (soft) · `#8DC8E8` (light)
- 중성: `#84888B` — 차트 "기타/잔여" 슬롯 전용

### 7.3 표면
- canvas `#FFFFFF` · surface-soft `#ECEFF4` · surface-subtle `#F7F8FA` · hairline `#CDCECB` · hairline-soft `#E5E4E1`

### 7.4 라인 / 스트로크
- line-dark `#49535B` · line-mid `#84888B` · line-soft `#A0A6A8`

### 7.5 텍스트
- ink `#1A1A1A` · body-strong `#2C2C2C` · body `#3D3D3D` · muted `#6C6C6C` · muted-soft `#84888B` · on-primary `#FFFFFF`

### 7.6 의미 (sparingly)
- success `#2E8540` · warning `#D4A017` · error `#C62828`

### 7.7 차트 팔레트 (고정 순서, 절대 변경 금지)

```
시리즈 1: #F58220  ← 항상 첫 번째 (Orange)
시리즈 2: #043B72  ← 항상 두 번째 (Blue)
시리즈 3: #FAB072
시리즈 4: #0086B8
시리즈 5: #AD624E
시리즈 6: #00A9CE
시리즈 7: #F0B26B
시리즈 8: #7E9FC3
시리즈 9: #84888B  ← 항상 마지막 (Gray, "기타")
```

10개 이상이면 데이터를 합쳐 9개로 줄인다.

---

## 8. Layout

### 8.1 Spacing System

```
:root {
  --space-xxs: 5px;
  --space-xs:  10px;
  --space-sm:  14px;
  --space-md:  19px;
  --space-lg:  28px;
  --space-xl:  38px;
  --space-xxl: 56px;
  --space-section: 104px;
}
```

### 8.2 Grid & Container
- 웹 콘텐츠 폭: 1200px 중앙 정렬, 좌우 24-32px 패딩
- 12-column grid 권고 (CSS Grid 또는 Flexbox)
- 피처 카드: 데스크탑 3-up, 태블릿 2-up, 모바일 1-up

### 8.3 정보 밀도 철학
미래에셋은 dense 하다. 그러나 **웹에서는 호흡이 더 필요**. 19px 본문 + 1.65 라인 + 104px 섹션 = financial research site 미감.

---

## 9. Signature Components

### 9.1 `section-header-rule` ⭐
페이지 폭을 가로지르는 1px Mirae Asset Orange (`#F58220`) 가로 룰. 룰 바로 아래 좌측 정렬 제목.

```
<section class="section">
  <div class="section-rule"></div>
  <h2 class="section-title">시장 환경</h2>
  ...
</section>

.section-rule { height: 1px; background: #F58220; margin-bottom: 19px; }
.section-title { font-size: 26px; font-weight: 700; color: #1A1A1A; }
```

### 9.2 `hero-orange`
- 풀블리드 `#F58220` 배경
- 흰 헤드라인 (display-hero 67px), 흰 부제 24px
- 좌측 상단 "[사내한]" 또는 분류 태그
- 우상단 한/영 토글 버튼 (§4.1) — hero 위에서도 잘 보여야 함
- **마무리 사인오프 / 워드마크 일체 추가 금지**

### 9.3 `data-table` ⭐
- 헤더 행: `#FAB072` 채움, Bold, 16px (웹) / 13pt (docx)
- 본문 행: 흰색 + 옵션 `#F7F8FA` 제브라
- 행 hover: `#F7F8FA`
- 외곽 1px `#CDCECB`, 내부 1px `#E5E4E1`
- 강조 셀: `#D7D7D7` 채움 (총계 / 핵심 행)
- 숫자 셀: `font-variant-numeric: tabular-nums`, 우측 정렬

### 9.4 `callout-card-orange`
- 풀블리드 오렌지 (`#F58220`), 흰 텍스트
- `border-radius: 4px`
- 패딩 56px (웹), 38px (모바일)
- 내부 CTA: 반전 (흰 배경 + 오렌지 텍스트)

### 9.5 `stat-callout-card`
- 흰 배경 + 1px hairline
- 작은 회색 레이블 (stat-label 16px) 위
- 큰 수치 (stat-hero 67px) — 오렌지 또는 블루로 의미 부여
- 작은 변동치 텍스트 14px 아래 (▲ 빨강 / 초록)

### 9.6 `chart-pair`
- 시리즈 1: `#F58220`, 시리즈 2: `#043B72`
- 축: `#49535B` 1px, 그리드라인: `#A0A6A8` 1px dashed
- hover tooltip: dark `#1A1A1A` 배경

### 9.7 `button-primary`
- 배경 `#F58220`, 흰 텍스트
- 16-17px Medium, 패딩 10×19, 높이 42px
- `border-radius: 2px` (sharp)
- Active: `#CB6015`
- focus-visible 시 2px 오렌지 outline

### 9.8 `lang-toggle` ⭐ (§4.1 참조)
모든 HTML 산출물의 우상단 고정 위치. 디자인 사양은 §4.1, 구현은 빌드 시점 자유.

### 9.9 모서리 (Border Radius)

| 토큰    | 값  | 용도 |
|---|---|---|
| `r-none` | 0px | 테이블, hero 풀블리드 |
| `r-xs`   | 2px | 버튼, 토글, 작은 칩 |
| `r-sm`   | 4px | 웹 카드, 인풋, 콜아웃 |
| `r-md`   | 6px | 대형 웹 카드 (드물게) |

**12px 이상의 라운드는 미래에셋이 아니다.**

---

## 10. Quick Reference

### 컬러
```
브랜드: #F58220 (Orange) · #043B72 (Blue)
연관:   #FAB072 (Soft) · #CB6015 (Active) · #D7D7D7 (Disabled/Highlight)
표면:   #FFFFFF · #ECEFF4 · #F7F8FA
헤어:   #CDCECB · #E5E4E1
텍스트: #1A1A1A · #3D3D3D · #6C6C6C · #84888B
의미:   #2E8540 (Success) · #D4A017 (Warning) · #C62828 (Error)

차트 순서: F58220 → 043B72 → FAB072 → 0086B8 → AD624E → 00A9CE → F0B26B → 7E9FC3 → 84888B
```

### 폰트 (Web)
```
한국어: Spoqa Han Sans Neo → Noto Sans KR
영문:   Inter → Aptos
숫자:   Inter / SF Mono (tabular-nums)
```

### 위계 (Web)
```
Hero:    67px Bold (모바일 43px)
H1:      34px Bold (모바일 26px)
H2:      26px SemiBold (모바일 22px)
H3:      22px SemiBold
Body:    19px Regular, line 1.65
Caption: 14px Regular
Stat:    67px Bold (모바일 48px)
```

### 위계 (Doc)
```
Title:   24pt Bold
H1:      17pt Medium
H2:      14pt Regular
Body:    13pt Regular
Caption: 11pt Regular
```

### 출력 형식 (기본 = HTML)
```
"PPT / 슬라이드 / 발표"  → pptx
"Word / 워드 / .docx"    → docx
"PDF / 인쇄"             → HTML + 사용자가 인쇄 → PDF
그 외 모두               → HTML (한/영 토글 포함)
```

### 한/영 토글 5초 체크
```
□ 우상단에 배치되어 있는가?
□ 스크롤 시 자연스럽게 움직이는가 (고정 안 함)?
□ 활성 = #F58220 배경, 비활성 = 흰 배경?
□ 영문 모드에서 폰트가 Inter 로 바뀌는가?
□ localStorage 로 새로고침 후 유지되는가?
□ 모바일에서도 우상단 접근 가능한가?
□ 영문 모드에서 한글 잔존 없는가?
□ 어떤 화면 크기에서든 mobile-friendly 한가?
```

### Anti-Slop 5초 체크
```
□ 그라데이션 없음
□ Emoji 없음
□ 카드 라운드 ≤ 4px
□ 폰트 ≤ 2 패밀리 (KR + EN)
□ 차트 시리즈 ≤ 9개
□ 본문에 이탤릭 없음
□ 본문 폰트 19px 이상  ⚠️
□ 시그니처 (1px 룰 + FAB072) 적용
□ 로고/워드마크/사인오프 흉내 없음  ⚠️
□ "Thank you" 페이지 없음  ⚠️
□ 한/영 토글 우상단 배치, 스크롤 시 자연스럽게 이동  ⚠️
□ 모바일 반응형: 모든 화면 크기에서 mobile-friendly 함  ⚠️
```

---

# Changelog

### v.1.0
- 최초 오픈
