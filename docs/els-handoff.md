# ELS 주간 자료 — 인수인계

새 대화에서 이 일을 이어받는 사람(또는 세션)이 **맨 먼저 읽을 파일**이다.
절차는 `docs/els-autorun.md`(런북)가 기준이고, 이 문서는 그 위의 맥락 —
무엇을 왜 그렇게 정했는지, 손대면 안 되는 것이 무엇인지를 적는다.

최종 갱신 2026-10-01 · 마지막으로 만든 회차 제38152~38169회 (청약 09-29~10-07)

---

## 1. 무엇을 만드는 일인가

미래에셋증권이 매주 새로 모집하는 ELS(주가연계증권)를 받아, 창구에서 쓰는
**세일즈 자료 세 가지**를 만든다. 숫자는 사람이 옮겨 적지 않고 공시 원문에서
뽑아 계산한다.

| 자료 | 파일 | 분량 | 쓰는 자리 |
|---|---|---|---|
| **제안서** | `els-sales-deck.pptx` / `.pdf` | 8장 | 고객 앞에 펴는 것 |
| **분석자료 · 문서판** | `els-analysis.html` / `.pdf` | 11쪽 | 담당자가 상담 전에 읽는 것 |
| **분석자료 · 발표판** | `els-analysis-deck.pptx` / `.pdf` | 16장 | 회의에서 넘기는 것 |

제안서는 **결론만**, 분석자료는 **그 결론이 어디서 나왔는지**를 끝까지 편다.
셋을 합치자는 제안이 나오면: 8장에 근거를 다 넣으면 고객 앞에서 못 넘기는 장이
되고, 11쪽을 8장으로 줄이면 "왜 그런가"가 통째로 빠진다. 다만 셋은 같은
`analyze()` 에서 숫자를 가져오고 **주장 대장 하나를 같이 쓰므로** 어느 한쪽만
틀릴 수가 없다. 나뉜 것은 문서지 계산이 아니다.

## 2. 숫자가 어디서 오는가

```
공시 원문(DART 일괄신고추가서류)
  → scripts/parse_prospectus.mjs        정합성 게이트 있음
  → tools/discovery/prospectus_parsed.json
  → scripts/lib/els-analysis.mjs  analyze(rcpNo)   ★ 모든 수치의 유일한 출처
  → 빌더 셋 + scripts/build_els_claims.mjs(주장 대장)
```

**빌더에 숫자를 직접 써 넣지 않는다.** 각자 계산하면 언젠가 반드시 갈라진다.

### A 와 B — 절대 섞지 않는다

- **A = 발행사 백테스트** (공시 원문에 실린 값. 과거 실제 시세에 상품을 얹어 본 결과)
- **B = 자체 몬테카를로** (공시 변동성·상관계수를 입력으로 10만 경로. 상품끼리 견주는 용도)

표 머리글에 `A.` `B.` 를 붙여 출처를 드러낸다. 같은 개념이 양쪽에 있으면
(1차 상환 확률 등) 반드시 어느 쪽인지 표기한다. 2장 표의
**"1차에 끝날 확률"·"만기까지 갈 확률" 도 B 다** — 2026-09-21 에 표기를 붙였다.

### 등급은 B 하나로만 가른다

손실 확률 15% 이하 방어적 / 15~25% 중간 / 25% 초과 공격적.
수익률이나 기초자산 종류는 등급에 넣지 않는다. **전부 원금비보장 1등급이므로
"안전"이 아니라 서로 견준 순서다.**

## 3. 매주 어떻게 도는가 (2026-09-29 부터)

```
평일 (예약 01:10 UTC)  러너(.github/workflows/els-autobuild.yml)
   실제로는 06:40 UTC   수집 → 판정 → 파싱 → 주장 대장 → 검산 → 산출물 셋
   = 15:40 KST 쯤       → 역방향 대조·경계·빈값 → 작업 브랜치에 커밋
                        (검산이 걸리면 잡이 죽고 아무것도 커밋되지 않는다)

평일 16:30 KST  예약 세션(trig_013cJbMp7sK3Vp6bHyPDdvV2)
                전 장을 **눈으로 보고** → 이상 없으면 파일 여섯 개 전달
                → 결함이 있으면 그 사실을 알린다 (고치지는 못한다)
```

### ⚠ GitHub 예약은 제때 돌지 않는다

cron 을 `10 1 * * 1-5`(10:10 KST)로 걸었는데 **실제 발동은 06:36~06:48 UTC
(15:36~15:50 KST)** 였다. 2026-09-29·09-30 두 번 다 그랬다. 5시간 반이 밀린다.

그래서 예약 세션을 **16:30 KST** 로 옮겼다. 10:30 에 두면 러너가 아직 안 돌아
"오늘 커밋이 없다" 만 보고하게 된다.

**이 지연은 GitHub 쪽 사정이라 우리가 못 줄인다.** cron 을 앞당겨도 같은 만큼
밀린다. 자료가 오후에 나오는 것을 받아들이는 편이 맞다 — 청약기간이 9일쯤이라
당일 오전이냐 오후냐가 급한 일은 아니다.

지연 폭이 달라지면 예약 시각을 다시 맞춰야 한다. 확인은
`Actions → ELS 신규 회차 자동 빌드` 의 `run_started_at` 으로 한다.

### 왜 눈으로 보는 검증이 사람 몫인가

**이번 주 결함 다섯 건이 전부 기계 검사를 통과한 뒤 눈에 걸렸다.** 숫자는
맞는데 문장이 틀린 종류라 기계가 못 잡는다.

1. "제일 높은 건 연 20.0%인 제38168회" — 실제 1위는 23.0%인 제38165회
2. 분석자료 발표판 표지가 "ELS 제안서" — 제안서는 8장짜리 하나뿐
3. 수익 자리 추천 사유 "가장 높은 수익률입니다" — 아닌데
4. "연 23.0%짜리도 있는데 왜 23.0%짜리를 먼저 권하냐" — 같은 값을 대비
5. 위험당 대가 배수를 원값으로 나눔 — 이건 대장 검산이 잡았다

## 4. 유지해야 할 규칙

### 저장소

- 작업 브랜치는 **항상** `claude/els-product-structure-page-ljsucw`.
  **다른 브랜치에 밀지 않는다.** 예외는 아래 하나뿐이다.
- `main` 에는 `.github/workflows/els-autobuild.yml` **한 파일만** 둔다
  (2026-09-29 사용자 승인). GitHub 이 기본 브랜치의 schedule 만 발동하기 때문이다.
  산출물·스크립트는 작업 브랜치에만 들어간다.
- **PR 은 사용자가 명시적으로 요청할 때만 만든다.**
- `git push -u origin <브랜치>`, 네트워크 오류면 2s→4s→8s→16s 로 최대 4회 재시도.
- 커밋 메시지 끝에:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_…
  ```
- 커밋·PR·코드 주석 어디에도 모델 식별자를 적지 않는다(위 Co-Authored-By 줄 제외).

### 작업 범위

- **요청 범위 밖의 기존 산출물은 건드리지 않는다.** 지금 작업한 것만 바꾸고
  기존 작업분은 기존 방식대로 둔다.
- 임시 파일은 세션 스크래치패드에. `/tmp` 를 쓰지 않는다.
- TLS 검증을 끄거나 `HTTPS_PROXY` 를 해제하지 않는다.

### 자료 내용

- 색은 미래에셋 오렌지 `#F58220` / 블루 `#043B72`(`mas-design` 스킬).
- 차트·표·도형은 **네이티브**로. 이미지로 박힌 장을 만들지 않는다.
- **개인 일반투자자 마감일은 홈페이지 표기와 다르다.** 숙려제도 대상자는
  그 앞에서 끊긴다. 홈페이지 날짜를 그대로 안내하면 고객이 청약 기회를 놓친다.
  보고에 반드시 이 날짜를 적는다.
- 미확인 항목(표본 짧은 회차, 시세 이월)은 자료에 표기하고 보고에도 포함한다.

### 문장이 전제하는 것이 이번 회차에 성립하는지 늘 확인한다

전부 실제로 틀린 문장이 인쇄된 사례다.

- 낙인 없는 상품에 `knockIn` 을 쓰면 `null%` 가 찍힌다 → `floor` 를 쓴다.
- 기초자산이 하나뿐인 상품에 "두 자산이 같이 움직인다" 는 성립하지 않는다.
- "조건이 달라서 값이 갈린다" 는 **실제로 다른 조건만** 짚는다.
  주기·차수·낙인이 같은 짝에 그 셋을 적으면 "6개월마다냐 6개월마다냐" 가 된다.
- "개별 종목이 위험하지 않나요" 의 답은 **종목이 섞인 추천 상품**으로 한다.
- "제일 높은 것" 은 **실제 수익률 1위**를 가리켜야 한다.
- 대비하는 두 값이 같아지는 주가 있다. 붙으면 문장을 바꾼다.
- 공정가 괴리는 음수다 — 절대값으로 적는다.
- 수익 자리 추천 사유를 "가장 높은 수익률" 로 박아 두지 않는다.
- **배수·비율은 인쇄된 값끼리 나눈다**(`perRiskSpread`). 원값으로 나누면
  자료를 보고 손으로 검산한 사람과 끝자리가 갈린다.

## 5. 검증 — 통과하지 못하면 내지 않는다

| 검사 | 명령 | 잡는 것 |
|---|---|---|
| 파서 정합성 | `parse_prospectus.mjs` | 기초자산·변동성·상관계수 개수/이름 어긋남 |
| 주장 대장 | `vendor/check_claims.py` | 계열 혼용, 미확인→단정 누출, 파생 산술 오류 |
| 역방향 대조 | `scripts/reverse_check_deck.py` | 대장에 없는 숫자가 인쇄된 것 |
| 경계·빈값 | pymupdf bbox + `null|undefined|NaN` | 글자가 장 밖으로, 빈 값 누출 |
| **눈으로 보기** | 110dpi 래스터라이즈 후 전 장 | **위 넷이 못 잡는 전부** |

역방향 대조의 한계: **값 집합 대조라 항목끼리 뒤바뀐 것은 못 잡는다.**
일부러 값 네 개를 틀리게 넣어 보니 한 건만 걸렸다. 그쪽은 파생 검산이 맡는다.

표가 아래 안내 상자를 깔고 앉는 것은 **텍스트 bbox 로 안 잡힌다** — 슬라이드
안에는 있기 때문이다. 표 마지막 글자의 y 와 안내 상자의 y 를 직접 견준다.

## 6. 환경 제약 (바꾸려 들기 전에 읽을 것)

- 컨테이너에서 `securities.miraeasset.com` · `dart.fss.or.kr` 로 못 나간다(프록시 403).
  **수집은 GitHub Actions 러너에서만 돈다.**
- **예약 세션에는 GitHub MCP 도구가 없고, 작업 브랜치로 push 도 안 된다**
  (2026-09-15 확인). 그래서 기계 작업을 러너로 옮겼다. 예약 세션은 보고 알리는
  일만 한다.
- `check_claims.py` 는 스킬 안에만 있어 러너가 못 읽는다 → `vendor/check_claims.py`
  로 들여왔다. **스킬이 갱신되면 이 사본도 같이 갈아야 한다.**
- 러너 크로미움은 한글 글꼴을 통째로 넣는다(분석자료 PDF 3.3MB).
  `scripts/shrink_pdf.py` 가 쓰는 글자만 남긴다.
- 크로미움 경로를 박지 않는다. 컨테이너는 `/opt/pw-browsers/chromium`,
  러너는 playwright 제 캐시다.
- `npm i` 에 `--no-save` 를 붙인다. 없으면 `package.json` 의 핀이 풀려 매 판 커밋된다.

## 7. 자주 쓰는 명령

```bash
# 준비
cd /home/user/work_1
git fetch origin claude/els-product-structure-page-ljsucw
git checkout claude/els-product-structure-page-ljsucw
git reset --hard origin/claude/els-product-structure-page-ljsucw
npm install --no-audit --no-fund

# 오늘 돌릴 날인지 / 새 회차가 있는지
node scripts/els_schedule_check.mjs      # DECISION=SKIP 이면 즉시 끝
node scripts/els_check_new.mjs --log     # ★ 파싱보다 먼저 부른다

# 수동 빌드 (러너가 실패했을 때)
R=<접수번호>
node scripts/build_els_claims.mjs $R
python3 vendor/check_claims.py tools/discovery/els-claims.json   # 종료코드 0 필수
node scripts/build_els_sales_deck.mjs $R
node scripts/build_els_analysis.mjs $R
node scripts/build_els_analysis_deck.mjs $R

# 렌더
bash scripts/install_fonts.sh
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  npm install --no-save playwright@1.56.1
soffice --headless --convert-to pdf els-sales-deck.pptx
soffice --headless --convert-to pdf els-analysis-deck.pptx
node scripts/proposal_to_pdf.mjs els-analysis.html els-analysis.pdf
python3 scripts/shrink_pdf.py els-sales-deck.pdf els-analysis.pdf els-analysis-deck.pdf

# 검증
for f in els-sales-deck els-analysis els-analysis-deck; do
  python3 scripts/reverse_check_deck.py $f.pdf tools/discovery/els-claims.json
done

# 러너를 손으로 돌리기 (GitHub MCP 가 있는 세션에서만)
#   workflow_id=els-autobuild.yml · ref=main · inputs.force=true 면 새 회차 없어도 빌드
```

## 8. 사용자가 매주 쓰는 말

> "오늘은 YYYY년 M월 D일이야. 미래에셋증권 홈페이지에 청약 가능한 ELS 상품이
> 새로 올라왔을거야. ELS 상품 세일즈 분석자료 만들어주고, 완성될 경우 재검증해줘."

"분석자료" 라고만 해도 **세 가지를 다 만든다**(제안서 8장 + 분석자료 두 판).
"재검증" 은 기계 검사뿐 아니라 **전 장을 눈으로 보는 것**까지 뜻한다.

## 9. 다른 클로드 계정으로 옮길 때

저장소에 들어 있는 것은 전부 따라간다 — 스크립트·워크플로·런북·이 문서·산출물.
**계정에 묶여 있어 따라가지 않는 것이 넷이다.**

| 따라가지 않는 것 | 새 계정에서 할 일 |
|---|---|
| **예약(Routine)** | 아래 §9.1 의 프롬프트로 다시 만든다 |
| **GitHub 연결** | `hanaroline/work_1` 접근을 다시 승인한다 |
| **스킬** | `mas-design`(미래에셋 디자인), `fin-data-integrity`(검산 절차)를 다시 깐다 |
| **대화 맥락** | 이 문서가 대신한다. 새 대화 첫 머리에 이 파일을 읽힌다 |

검산기는 `vendor/check_claims.py` 로 저장소에 들여놨으므로 **러너 쪽은 스킬 없이도
돈다.** 다만 세션에서 `fin-data-integrity` 절차를 따를 때는 스킬이 있는 편이 낫다.

GitHub Actions 는 저장소에 묶여 있으므로 **클로드 계정과 무관하게 계속 돈다.**
즉 계정을 옮기는 동안에도 평일 10:10 KST 자동 빌드는 멈추지 않는다. 멈추는 것은
10:30 의 눈으로 보는 검증·전달뿐이다.

### 9.1 예약 다시 만들기

- 이름: `ELS 신규 회차 점검·검증 (월·수·금 16:30 KST)`
- cron: `30 7 * * 1-5` (UTC 기준. KST 16:30)
  — 10:30 이 아닌 이유는 §3 의 「GitHub 예약은 제때 돌지 않는다」 참고
- 모델: `claude-opus-5`
- 알림: 푸시 켬 / 메일 끔
- 프롬프트: 아래를 그대로 붙여 넣는다.

```text
미래에셋증권 ELS 신규 회차 정기 점검이다. 저장소는 hanaroline/work_1, 작업 브랜치는 claude/els-product-structure-page-ljsucw 다. 다른 브랜치에는 절대 밀지 않는다. PR 은 만들지 않는다.

**맥락과 규칙은 저장소의 `docs/els-handoff.md` 가 기준이다. 절차는 `docs/els-autorun.md`.**
이 프롬프트와 어긋나면 저장소 쪽이 최신이다.

■ 이 예약이 하는 일

수집·파싱·주장 대장·검산·빌드·역방향 대조는 **러너가 혼자 끝낸다**
(.github/workflows/els-autobuild.yml, main 에 있음). cron 은 10:10 KST 로 걸려 있지만
GitHub 예약 지연 때문에 **실제로는 15:40 KST 쯤** 돈다(2026-09-29·09-30 관측).
그래서 이 예약이 16:30 이다. 당신이 깨어날 때는 이미 커밋돼 있어야 한다.

**당신의 일은 러너가 못 하는 것 하나다 — 눈으로 보는 검증, 그리고 사용자에게 보고·전달.**

이게 왜 당신 몫인지: 2026-09-29 회차에서 결함 다섯 건이 전부 기계 검사를 통과한 뒤
눈에 걸렸다. "제일 높은 건 연 20.0%인 제38168회"(실제 1위는 23.0%인 제38165회),
분석자료 발표판 표지의 "ELS 제안서"(제안서는 8장짜리 하나뿐), 수익 자리 추천 사유의
"가장 높은 수익률입니다"(아닌데), "연 23.0%짜리도 있는데 왜 23.0%짜리를"(같은 값 대비),
위험당 대가 배수를 원값으로 나눈 것. 숫자는 맞는데 문장이 틀린 종류라 기계가 못 잡는다.

■ 먼저 이것부터

  cd /home/user/work_1
  git fetch origin claude/els-product-structure-page-ljsucw
  git checkout claude/els-product-structure-page-ljsucw 2>/dev/null || git checkout -b claude/els-product-structure-page-ljsucw origin/claude/els-product-structure-page-ljsucw
  git reset --hard origin/claude/els-product-structure-page-ljsucw
  npm install --no-audit --no-fund
  node scripts/els_schedule_check.mjs

월~금 매일 깨어나지만 실제 슬롯은 월·수·금이고, 슬롯이 비영업일이면 다음 영업일로
이월된다. DECISION=SKIP 이면 아무것도 하지 말고 즉시 끝낸다. RUN 이면 이어서 한다.

■ 1) 러너가 무엇을 해 놨는지 본다

  git log --oneline -5
  node scripts/els_check_new.mjs        # --log 는 붙이지 않는다(러너가 이미 남겼다)

- `feat(els): 제…회 … 세일즈 자료 3종 (자동 빌드)` 가 오늘 날짜로 있으면 → 2) 로 간다.
- `chore(els): 신규 회차 점검 (NONE)` 만 있으면 새 회차가 없는 날이다. 한 줄만 보고하고
  끝낸다. 조용히 끝내지 않는다 — 점검이 돈 것과 안 돈 것이 구분되어야 한다.
- **오늘 커밋이 아예 없으면 러너가 아직 안 돌았거나 실패한 것이다.** 조용히 넘기지 말고
  알린다. GitHub MCP 도구가 보이면 els-autobuild.yml 을 ref=main 으로 돌려 보고,
  없으면 "오늘 자동 빌드가 아직 안 돌았습니다" 라고 적는다.

■ 2) 눈으로 보는 검증 — 이것이 본론이다

렌더해서 전 장을 **실제로 본다**. 텍스트만 읽지 말고 이미지로 봐야 한다.

  bash scripts/install_fonts.sh
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-save playwright@1.56.1
  soffice --headless --convert-to pdf els-sales-deck.pptx
  soffice --headless --convert-to pdf els-analysis-deck.pptx
  node scripts/proposal_to_pdf.mjs els-analysis.html els-analysis.pdf
  # 110dpi 로 래스터라이즈해 제안서 8장 · 분석자료 11쪽 · 발표판 16장을 전부 본다
  # (분량은 회차에 따라 한두 쪽 달라질 수 있다)

  - 문장이 전제하는 것이 이번 회차에 성립하는가. "제일 높은" 이 정말 1위인가,
    "가장 낮은" 이 정말 최저인가, 대비하는 두 값이 같지 않은가,
    "조건이 달라서" 가 실제로 다른 조건을 짚는가.
  - 낙인 없는 회차, 기초자산이 하나뿐인 회차, 외화 상품이 없는 주에
    빈 값이나 성립하지 않는 문장이 새지 않았는가.
  - 표지 추천 1순위 = 3장 구조 대상 = 4장 추천 첫 칸이 같은 회차인가.
  - 표지 최고 수익률 회차가 "권하지 않는" 목록과 겹치면 표지에 그 사실이 적혀 있는가.
  - 표가 아래 안내 상자를 깔고 앉지 않았는가(텍스트 bbox 로는 안 잡힌다).
  - 분석자료 두 판의 표지가 "분석자료" 인가("제안서" 가 아니라).

■ 3) 보고·전달

- **이상이 없으면**: 여섯 파일을 SendUserFile 로 보낸다 —
  els-sales-deck.pptx/.pdf, els-analysis.html/.pdf, els-analysis-deck.pptx/.pdf.
  보고에는 회차 범위·상품 수·청약기간·**개인 일반투자자 마감일**(홈페이지 표기와
  다르다)·추천 3종·권하지 않는 종목·온라인 전용 여부·미확인 항목을 담는다.
- **결함을 찾으면**: 고치려 들지 말고 **무엇이 어떻게 틀렸는지 그대로 알린다.**
  당신은 작업 브랜치로 push 하지 못한다(2026-09-15 확인). 파일은 보내되
  "이 자리가 틀렸으니 고쳐서 다시 내야 한다" 를 분명히 적는다.
- 어느 경로로 끝나든 사용자에게 한 줄은 남긴다. 아무 말 없이 끝내지 않는다.

■ 하지 말 것

코드 수정(러너가 만든 것을 손대면 다음 빌드와 갈라진다) · 다른 브랜치로의 push ·
PR 생성 · 요청 범위 밖 파일 건드리기 · 없는 것을 있다고 적기.
```

### 9.2 옮긴 뒤 확인할 것

1. `git clone` 또는 세션에서 저장소가 보이는지
2. `node scripts/els_check_new.mjs` 가 도는지 (npm install 먼저)
3. GitHub Actions 탭에서 `els-autobuild.yml` 이 계속 돌고 있는지
4. 예약을 다시 만들고, 다음 평일 10:30 에 실제로 깨어나는지
5. `mas-design` · `fin-data-integrity` 스킬이 새 계정에 있는지

### 9.3 이 저장소의 다른 ELS 예약

지금 계정에는 ELS 를 건드리는 예약이 더 있지만 **작업 브랜치가 다르다**
(`claude/els-fund-disclosure-i6wtii` — 상품설명의무 스크립트 쪽).
이 문서가 다루는 주간 세일즈 자료와는 별개다. 옮길 때 혼동하지 말 것.

## 10. 아직 열려 있는 것

- 예약 세션이 push 를 못 한다. 결함을 찾아도 스스로 고치지 못하고 알리기만 한다.
  고치는 것은 사람이 대화를 열 때다.
- 러너가 만든 분석자료 PDF 가 1.5MB 다(컨테이너에서 뽑으면 371KB).
  부분집합까지 했는데도 차이가 남는다. 더 줄일 여지가 있다.
- `els-proposal.pptx`(옛 15장 판)는 2026-09-06 데이터 그대로 남아 있다.
  요청 범위 밖이라 건드리지 않았다. 지울지 여부는 사용자에게 물어야 한다.
