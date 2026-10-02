# 계정 설정 인벤토리 · 복원 체크리스트

2026-10-01 기준으로 **현재 계정에만 저장되어 있던 것**을 받아 적은 문서입니다.
계정을 종료하면 아래 항목은 전부 사라집니다. 새 계정에서 같은 상태를 만들려면 이 순서대로 하세요.

---

## 0. 먼저 이해할 것 — 무엇이 남고 무엇이 사라지나

| 구분 | 어디에 저장되나 | 계정 종료 후 |
|---|---|---|
| 저장소 코드·데이터·문서 | **GitHub** | ✅ 그대로 남음 |
| GitHub Actions 워크플로 44건 | **GitHub** | ✅ 그대로 돎 (Secrets 유지 시) |
| 브리핑 플레이북, 세션 훅(`.claude/`) | **GitHub** | ✅ 남음 |
| 이 인수인계 폴더 | **GitHub** | ✅ 남음 |
| 대화 기록 | claude.ai 계정 | ❌ 사라짐 |
| 발행된 아티팩트(링크) | claude.ai 계정 | ❌ 사라짐 (파일은 저장소에 보관해 둠) |
| Routine(예약 작업) 19건 | claude.ai 계정 | ❌ 사라짐 (프롬프트는 `ROUTINES.md`에 보관) |
| 커넥터 인증(Gmail·Gamma) | claude.ai 계정 | ❌ 사라짐 |
| 사용자 지정 스킬 | claude.ai 계정 | ❌ 사라짐 |
| 메모리·프로젝트 지침 | claude.ai 계정 | ❌ 사라짐 (`HANDOFF.md`가 대체) |
| Claude Code 웹 환경(환경변수·네트워크 정책·설정 스크립트) | claude.ai 계정 | ❌ 사라짐 |

> **핵심**: GitHub 연동은 "계정 ↔ 저장소"를 잇는 통로일 뿐,
> 대화·아티팩트·Routine을 저장소에 넣어 주지는 않습니다. 그래서 이 폴더를 만들었습니다.

---

## 1. GitHub 연동 (가장 먼저)

1. 새 계정 로그인 → **claude.ai → 설정 → 커넥터 → GitHub 연결**
2. 조직/계정 권한에서 `hanaroline/work_1` 접근 허용
3. Claude Code 웹에서 저장소가 보이는지 확인

> 조직 소유 저장소라면 조직 관리자가 `claude.ai/admin-settings/claude-tag`에서 저장소 접근을 허용해야 할 수 있습니다.

**GitHub 쪽에서 확인할 것** — 계정이 바뀌어도 Actions는 돌지만, 워크플로가 쓰는
**Repository Secrets는 GitHub에 있으므로 그대로 유지**됩니다. 다만 Claude가 만든 PR·커밋의
작성자 정보는 새 계정으로 바뀝니다.

---

## 2. 커넥터 복원

현재 **연결되어 있던 것**(새 계정에서 다시 인증해야 함):

| 커넥터 | 용도 |
|---|---|
| **Gmail** | 메일 확인·초안 작성 |
| **Gamma** | 프레젠테이션·문서 생성 |

설치는 되어 있으나 **미연결** 상태였던 것: Canva, FactSet AI-Ready Data, Figma, Firecrawl,
Google Calendar, Google Drive, ICE Data Services, Microsoft 365, Netlify, Notion,
PitchBook Premium, PlayMCP, Ramp Data, Supabase, Tripadvisor, Vanguard Advisor Tools
→ 필요한 것만 새로 연결하면 됩니다.

---

## 3. 스킬 복원 ★ 주의

**Anthropic 기본 제공 스킬**(새 계정에도 자동으로 있음):
docs, docx, pptx, xlsx, pdf, google-workspace, skill-creator, import-memory,
artifact-design, artifact-diagramming, artifact-capabilities, dataviz,
code-review, security-review, simplify, init, run, loop, claude-api,
update-config, keybindings-help, workflow-authoring, session-start-hook

**이 계정에만 있던 스킬** — 2026-10-01 21:30 에 **백업 완료**했습니다:

| 스킬 | 출처 | 역할 | 백업 위치 |
|---|---|---|---|
| **mas-design** | `plugin` | 미래에셋 브랜드 디자인 기준(오렌지/블루, 승인 폰트, 표·차트 스타일, 한/영 UI 규칙, AI Slop 블랙리스트) | `skills/mas-design/SKILL.md` |
| **fin-data-integrity** | `plugin` | 금융 수치 검증 절차(주장 대장 등록 → 산술·단위·계열 검산 → 빌드) | `skills/fin-data-integrity/` (5개 파일) |

> **앞선 판의 분류가 한 건 틀렸습니다.** `morning` 을 "이 계정에만 있던 스킬"로
> 적어 두었으나, 실제로는 `anthropic-example` 출처로 **새 계정에도 기본 제공**됩니다.
> 따로 백업할 필요가 없습니다.

**확인한 방법** — 세션 컨테이너의
`~/.claude/skills/synced/<id>/manifest.json` 에 스킬마다 `source` 가 적혀 있습니다.
`plugin` 인 것만 사용자·조직이 설치한 것이고, `anthropic` / `anthropic-example` 은
어느 계정에서나 제공됩니다. 이 기준으로 11개를 전부 다시 분류했습니다.

**새 계정에서 되살리는 법**
claude.ai 설정 → 스킬 → 스킬 만들기 에서 백업해 둔 `SKILL.md` 내용을 그대로 넣습니다.
`fin-data-integrity` 는 `references/` 2개와 `scripts/` 2개까지 같이 올려야 검산
스크립트(`check_claims.py`)가 돕니다.
스킬을 다시 만들기 전이라도, **"`docs/claude-handoff/skills/mas-design/SKILL.md` 를
읽고 그 기준대로 만들어 줘"** 라고 일러 주면 같은 결과를 얻습니다.

---

## 4. Routine(예약 작업) 복원 — 19건

프롬프트 전문은 **`ROUTINES.md`**, 기계 판독용 원본은 **`routines.json`** 에 있습니다.
새 계정에서 같은 이름·같은 시각·같은 프롬프트로 다시 등록하면 복원됩니다.

사용 중이던 주요 Routine (KST 기준):

| 시각 | 이름 | 비고 |
|---|---|---|
| 매일 07:30 | 마포WM 모닝 브리핑 | 기존 대화로 전달(persist) |
| 평일 16:10 | 마포WM 장마감 시황 브리핑 | 전용 창 |
| 평일 11:00 | 증권사 리포트 자동 배포 | 이 대화로 전달 |
| 평일 14:30 | ELS 신규 회차 오후 점검 | |
| 평일 16:30 | ELS 신규 회차 점검·검증 | |
| 월 15:30 | 펀드 원천 반영 재갱신 | |
| 월·목 08:00 | 세션 산출물 자료실 자동 갱신 | |
| 월 08:00 | 미국 100대 기업 주간 목록 교체 | |
| 월 08:00 | ELS 상품 구조 페이지 주간 갱신 | |
| 월 08:40 / 화~금 08:40 | 상품설명의무 스크립트 갱신 | 2건 |

중지(폐기) 상태였던 구판 7건도 기록에 남겨 두었습니다 — 다시 만들 필요 없습니다.

**등록 시 주의**
- 저장은 UTC 크론입니다. UTC 22~23시대 작업은 KST로 **다음 날**이 되므로 요일이 하루 밀립니다.
  (예: 모닝 브리핑 `30 22 * * *` = KST 매일 07:30, 자료실 갱신 `0 23 * * 0,3` = KST 월·목 08:00)
  `ROUTINES.md`에 KST와 UTC를 나란히 적어 두었으니 그대로 쓰면 됩니다.
- "이 대화로 전달" 유형은 **새 계정에서 먼저 대화를 하나 만들고** 그 대화에 묶어야 합니다.
- 브리핑 Routine의 프롬프트는 "플레이북을 읽고 따르라"는 지시가 핵심입니다.
  **규칙 변경은 Routine이 아니라 `docs/briefing-playbook.md`를 고치세요.**

---

## 5. Claude Code 웹 환경 재설정

새 계정에서 환경을 만들 때 확인할 것:

- **네트워크 정책** — 시세·리포트 수집이 외부 호출을 하므로 아웃바운드 허용 범위 확인
- **환경 변수·시크릿** — KIS API 키 등 수집 스크립트가 쓰는 값(저장소 Secrets와 별개로
  세션에서 쓰던 것이 있었다면 다시 등록)
- **설정 스크립트** — 저장소의 `.claude/hooks/session-start.sh`가 세션 시작 시 자동 실행됩니다
  (Playwright·Chromium 준비). 이건 저장소에 있으므로 자동으로 따라옵니다.

---

## 6. 복원 체크리스트

**옛 계정을 닫기 전에** (지금 안 하면 되돌릴 수 없습니다)

- [x] 사용자 스킬 2종 본문 백업 → `skills/` (2026-10-01 21:30 완료)
- [x] Routine 19건 프롬프트 원문 백업 → `ROUTINES.md` · `routines.json`
- [ ] 남기고 싶은 대화가 있으면 따로 내려받기 — 닫은 뒤에는 되찾을 수 없습니다
- [ ] 아티팩트 82건 중 계속 쓸 링크가 있으면 내용을 저장소로 옮기기
      (HTML 자체는 `docs/briefings/` 에 이미 있습니다. 잃는 것은 주소뿐입니다)

**새 계정에서**

- [ ] 새 계정 GitHub 커넥터 연결 · `hanaroline/work_1` 접근 확인
- [ ] 새 대화에서 `docs/claude-handoff/` 읽히기 (README의 부팅 프롬프트)
- [ ] Gmail 커넥터 재연결
- [ ] Gamma 커넥터 재연결
- [ ] 사용자 스킬 **2종** 재등록 — `skills/` 의 백업본으로 (morning 은 불필요)
- [ ] Routine 재등록 — 모닝 07:30, 장마감 16:10 **먼저**
- [ ] Routine 재등록 — 리포트 배포, ELS 점검 2건, 펀드·ETF·자료실 갱신
      (활성 13건만. `[폐기]` 6건은 다시 만들 필요 없습니다)
- [ ] 다음 날 아침 브리핑이 정상 생성되는지 확인
- [ ] 10/5(월) 수집 시각 점검을 다시 걸기 (`HANDOFF.md` 5~6절)
- [ ] 엑셀 산식 원장 5종을 다시 발행할지 결정 (파일은 저장소에 있음)
