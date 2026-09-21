# ELS 신규 회차 자동 점검·갱신 런북

자동 예약(Routine)이 **매주 월·수·금 10시 30분(KST)** 에 이 문서를 따라 도는 것을 전제로 쓴다.
예약 슬롯이 비영업일이면 **다음 영업일**로 밀린다. 그 판정은 사람이 하지 않고
`scripts/els_schedule_check.mjs` 가 한다.

> 예약은 실제로는 **월~금 매일** 깨어난다. 깨어난 세션이 스스로
> "오늘이 내 슬롯인가"를 판정하고 아니면 즉시 끝낸다. 이렇게 해야 월요일이
> 공휴일일 때 화요일로 이월되는 규칙이 성립한다 (월·수·금에만 깨우면 이월할
> 자리가 없다).

작업 브랜치는 항상 `claude/els-product-structure-page-ljsucw` 다. 다른 브랜치에 밀지 않는다.

---

## 0. 준비

```bash
cd /home/user/work_1
git fetch origin claude/els-product-structure-page-ljsucw
git checkout claude/els-product-structure-page-ljsucw || git checkout -b claude/els-product-structure-page-ljsucw origin/claude/els-product-structure-page-ljsucw
git reset --hard origin/claude/els-product-structure-page-ljsucw   # 브랜치 고유 커밋이 없을 때만
npm install --no-audit --no-fund
```

컨테이너가 새로 뜨면 `node_modules` 가 없다. 렌더 검증까지 하려면 다음도 필요하다.

```bash
apt-get install -y libreoffice-impress    # soffice --convert-to pdf
pip install pymupdf                        # PDF 래스터라이즈·텍스트 bbox 검사
```

## 1. 오늘 돌릴 날인지 판정

```bash
node scripts/els_schedule_check.mjs
```

마지막 줄이 `DECISION=SKIP` 이면 **여기서 끝낸다.** 출력에 이유가 적혀 있다
(비영업일이라 이월했는지, 슬롯이 아닌 날인지). 사용자에게 따로 알리지 않는다.

`DECISION=RUN` 이면 이어서 진행한다.

휴장일 표는 `data/kr-holidays.json` 이다. "해당 연도가 표에 없다"는 경고가 뜨면
그 해 한국거래소 휴장일을 채워 넣는다.

## 2. 신규 회차가 올라왔는지 확인

컨테이너에서는 미래에셋·DART 로 나가는 길이 프록시에서 막힌다(403). 수집은
**GitHub Actions 러너에서만** 돈다. `mcp__github__actions_run_trigger` 로
`ref` 를 작업 브랜치로 주고 돌린다.

| 워크플로우 | 하는 일 | 산출물 |
|---|---|---|
| `els-weekly.yml` | 홈페이지 청약중 목록 수집 | `data/els.js`, `tools/discovery/rendered_list.json` |
| `els-prospectus-probe.yml` | 최신 회차 공시 원문(일괄신고추가서류) 추출 | `tools/discovery/prospectus_*.json` |

### 예약 세션은 수집을 스스로 걸지 못한다

이것이 이 런북에서 가장 중요한 사실이다. 예약이 띄우는 세션에는
**GitHub MCP 도구가 없다** (도구 목록이 `Bash · Write · Edit · Read · Glob ·
Grep · Agent` 뿐이다). 그리고 2026-09-15 진단 실행에서 요청 파일을 커밋해
push 시켜 봤지만 **원격에 올라오지 않았다.** 즉 작업 브랜치에 수집을 거는
두 길이 모두 막혀 있다.

대신 **기본 브랜치(main)** 를 읽는다. 거기에는 워크플로의 매일 예약이 목록을
갱신해 두고, 그건 `git fetch` 만으로 읽힌다. 최근 관측으로는 **09:40~10:10 KST**
에 들어온다 — 점검 슬롯을 10:30 으로 잡은 이유가 이것이다.

`scripts/els_check_new.mjs` 가 작업 브랜치 사본과 `origin/main` 사본 중
수집 시각이 늦은 쪽을 **자동으로 고른다.** 세션이 따로 할 일은 없다.

> 사람이 돌릴 때(=이 대화처럼 MCP 도구가 있는 세션)는 그냥
> `mcp__github__actions_run_trigger` 로 `els-weekly.yml` 을 `ref` = 작업 브랜치로
> 돌리는 편이 빠르다. 결과는 같은 브랜치에 커밋되므로 `git pull` 로 받는다.

### 판정

**수집 시각은 건너뛸 수 없다.** `data/els.js` 가 어제 것이어도 파일은 멀쩡해
보이고 회차도 그럴듯하게 들어 있다. 그것을 읽고 "새 회차 없음" 이라고 끝내면
점검이 돈 적이 없는데 성공으로 기록된다 — 2026-09-11 에 실제로 그렇게 됐고,
09-14 에는 그래서 신규 18종을 통째로 놓쳤다. 판정은 눈으로 하지 말고
아래 스크립트에 맡긴다.

```bash
git pull --ff-only origin claude/els-product-structure-page-ljsucw
node scripts/els_check_new.mjs --log
```

이 스크립트는 고른 사본의 수집 시각이 **오늘(KST)** 인지 먼저 보고, 오늘 것이
아니면 비교를 거부한다. 목록에 실린 회차와 `tools/discovery/prospectus_parsed.json`
에 파싱돼 있는 회차(= 이미 제안서로 다룬 회차)를 맞춰 판정하고,
`docs/els-autorun-log.md` 에 한 줄 남긴다.

| STATUS | 뜻 | 할 일 |
|---|---|---|
| `STALE` | 어느 사본에도 오늘 목록이 없다 | **점검 실패다.** 조용히 끝내지 말고 사용자에게 그 사실을 알린다 |
| `NONE` | 오늘 목록을 받았고 새 회차가 없다 | 기록 줄만 커밋하고 끝낸다 |
| `NEW` | 새 회차가 있다 (`NEW_NOS` 에 나열) | 3절로 간다 |

`--log` 는 **3절(파싱)보다 먼저** 불러야 한다. 파싱을 끝낸 뒤에 부르면 새 회차가
이미 "다룬 회차" 로 넘어가 있어 `NONE` 이 찍힌다 — 그날 19종을 처리하고도 기록에는
"새 회차 없음" 이 남는다(2026-09-21 에 실제로 그렇게 되어 손으로 고쳤다).

`NONE` 으로 끝낼 때도 **기록 줄은 커밋·푸시하고, 사용자에게 한 줄 보고한다**
("오늘 확인함 · 새 회차 없음"). 조용히 끝내면 점검이 돈 것과 안 돈 것이
구분되지 않는다.

## 3. 공시 원문 수집·파싱

`els-prospectus-probe.yml` 을 같은 방식으로 돌리고 받아온 뒤 파싱한다.

```bash
git pull --ff-only origin claude/els-product-structure-page-ljsucw
node scripts/parse_prospectus.mjs <rcpNo>
```

파서에는 **정합성 게이트**가 들어 있다. 기초자산 수 대 변동성 수, 상관계수 쌍
개수 대 `n(n-1)/2`, 각 쌍 이름 대 기초자산 이름을 대조해 어긋나면 경고를 찍고
`exitCode = 1` 로 끝난다. **경고가 있으면 그대로 진행하지 말 것** — 새 기초자산이
`ASSETS` 표에 없어서 종목이 통째로 빠지는 사고가 실제로 있었다
(브로드컴·테슬라·AMD). 종목명을 추가하고 다시 돌린다.

## 4. 주장 대장 → 기계 검산

인쇄될 모든 수치를 대장에 올리고 검산한 뒤에 빌드한다 (`fin-data-integrity` 스킬 절차).

```bash
node scripts/build_els_claims.mjs <rcpNo>
python3 <fin-data-integrity 스킬 경로>/scripts/check_claims.py tools/discovery/els-claims.json
```

**통과하지 못하면 빌드하지 않는다.** 공시 원문에서 온 값(A)과 모델이 계산한
값(B)은 대장에서 계열이 갈라져 있어야 한다. 섞이면 검산기가 잡는다.

## 5. 산출물 빌드

주간 산출물은 **둘**이다. 제안서(덱)는 결론만, 분석자료는 그 결론의 근거까지 편다.

```bash
# ① 제안서 — 상담 자리에 들고 가는 8장
node scripts/build_els_sales_deck.mjs <rcpNo>   # → els-sales-deck.pptx (8장)
soffice --headless --convert-to pdf els-sales-deck.pptx

# ② 분석자료 — 근거를 끝까지 펼친 HTML (mas-design 기본 출력 형식)
node scripts/build_els_analysis.mjs <rcpNo>     # → els-analysis.html
node scripts/proposal_to_pdf.mjs els-analysis.html els-analysis.pdf
```

분석자료 PDF 를 뽑으려면 한글 글꼴과 playwright 가 있어야 한다. 새 컨테이너에서는

```bash
bash scripts/install_fonts.sh                   # Noto Sans KR / Inter
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  npm install --no-save playwright@1.56.1
```

모든 수치는 `scripts/lib/els-analysis.mjs` 의 `analyze(rcpNo)` 한 곳에서 나온다.
덱에도 분석자료에도 숫자를 직접 써 넣지 않는다. 두 문서가 같은 주장 대장을 쓴다
(인쇄 위치는 덱이 `p*`, 분석자료가 `h*`).

몬테카를로는 `tools/discovery/mc-cache.json` 에 캐시된다 (버전·회차·경로수·시드로
키를 잡는다). 모델을 고쳤으면 `MC_VERSION` 을 올려야 캐시가 무효화된다.

## 6. 재검증

1. **시각 검증** — 두 PDF 를 110dpi 로 래스터라이즈해 덱 8장과 분석자료 전 쪽을
   눈으로 본다. 표가 안내문을 덮거나 글자가 셀 밖으로 나가지 않았는지 텍스트 bbox 로도
   확인한다. **기계 검사가 절대 못 잡는 종류의 결함이 여기서만 나온다** — 숫자는 맞는데
   문장이 틀린 것들이다(아래 스타일 고정값의 마지막 네 줄이 전부 시각 검증에서 나왔다).
2. **역추적 검증** — 렌더된 PDF의 숫자 하나하나가 대장까지 거슬러 올라가는지 본다.
   **두 산출물 모두** 돌린다.

   ```bash
   python3 scripts/reverse_check_deck.py els-sales-deck.pdf tools/discovery/els-claims.json
   python3 scripts/reverse_check_deck.py els-analysis.pdf  tools/discovery/els-claims.json
   ```

   걷어낼 것(회차 라벨·접수번호·날짜·배리어 나열·종목명 속 숫자)과 구조값은 스크립트
   안에 모여 있다. **이 검사는 값 집합 대조라 항목끼리 뒤바뀐 것은 못 잡는다** —
   그쪽은 `check_claims.py` 의 파생 검산이 맡는다. 미등록이 남으면 대장에 올리거나
   인쇄에서 뺀다.
3. **빈값 누출 검사** — 두 PDF 본문에 `null` · `undefined` · `NaN` 이나 값 자리의
   `–` 가 없는지 본다. 기초자산이 하나뿐이거나(상관계수 없음) 낙인이 없는 상품이
   섞이면 여기서 샌다. 실제로 "그 선이 null%로" 가 인쇄된 적이 있다(2026-09-21).
4. **두 문서 대조** — 추천 3종·주의 4종·핵심 수치가 덱과 분석자료에서 같은지 본다.
   둘 다 `analyze()` 에서 나오므로 어긋나면 어느 한쪽이 값을 다시 계산한 것이다.
5. **1페이지 추천 1순위 = 4페이지 추천 3종의 첫 칸**인지 확인한다. 예전에
   두 곳이 서로 다른 상품을 가리킨 적이 있다.
6. 온라인 전용 회차 표시가 붙었는지 확인한다. 판정 출처는 `rendered_list.json`
   (홈페이지 화면)이 1순위, 목록 API가 2순위다.

## 7. 커밋·푸시·전달

```bash
git add -A
git commit    # feat(els): 제…회 세일즈 제안서
git push -u origin claude/els-product-structure-page-ljsucw
```

푸시가 네트워크 오류로 실패하면 2s → 4s → 8s → 16s 로 최대 4회 재시도한다.
**PR 은 사용자가 명시적으로 요청할 때만 만든다.**

마지막으로 `els-sales-deck.pptx` · `els-sales-deck.pdf` 와
`els-analysis.html` · `els-analysis.pdf` 를 사용자에게 보낸다.
보고에는 이번 회차 범위, 상품 수, 추천 1순위, 주의 회차, 온라인 전용 여부를 담는다.

---

## 스타일 고정값 (바꾸지 말 것)

- 8장 구성: ① 표지·추천 1순위 ② 전체 상품 표 ③ 구조(추천 1순위로 따라가기)
  ④ 성향별 추천 3종 ⑤ 수익률-위험 분석(산점도) ⑥ 권하지 않는 종목
  ⑦ 반박 스크립트 ⑧ 상담 순서·필수 고지
- **"대신 이걸 보시죠" 자리에는 주의 종목을 뺀 나머지에서 고른다.** 최고 수익률
  회차가 주의 종목과 겹치는 주가 있다(2026-09-21, 제38151회). 그때 수익률 1위를
  그대로 쓰면 표지와 스크립트가 권하지 않는 상품을 권하게 된다.
- **A = 발행사 백테스트**(공시 원문), **B = 자체 몬테카를로**. 표 머리글에 A/B 를 붙여
  출처를 드러낸다. 같은 개념(1차 상환 확률 등)이 A와 B 양쪽에 있으면 어느 쪽인지
  반드시 표기한다.
- 손실 확률에는 `±` 신뢰구간을 함께 적고, 등급 경계선에 걸리면 `△` 를 붙인다.
- 색은 미래에셋 오렌지 `#F58220` / 블루 `#043B72` 기준(`mas-design`).
- **위험당 대가(손실 확률 1%당 연 수익률)는 `perRiskOf` 하나만 쓴다.** 나누는 값은
  자료에 인쇄된 소수 1자리 손실 확률이다. 덱·대장·분석자료가 각자 같은 식을 다시
  적으면 한 곳만 고쳐졌을 때 조용히 갈라진다.
- **문장이 전제하는 것이 이번 회차에 성립하는지 확인한다.** 아래 넷은 전부 실제로
  틀린 문장이 인쇄된 사례다.
  - 낙인이 없는 상품(노낙인형)에 `knockIn` 을 쓰면 "null%" 가 찍힌다 → `floor` 를 쓴다.
  - 기초자산이 하나인 상품에 "두 자산이 같이 움직인다" 를 쓰면 상관계수 자리가 빈다.
  - "조건이 달라서 값이 갈린다" 는 **실제로 다른 조건만** 짚는다. 주기·차수·낙인이
    같은 짝에 그 셋을 적으면 "6개월마다냐 6개월마다냐" 가 된다(제38139·38143회).
  - "개별 종목이 위험하지 않나요" 의 답은 **종목이 섞인 추천 상품**으로 한다.
    1순위가 지수형인 주에 그걸 끌어다 쓰면 질문과 답이 어긋난다.
- 공정가 괴리는 음수다. "제값보다 -31.7% 깎여" 는 이중부정이므로 절대값으로 적는다.
- 요청 범위 밖의 기존 산출물은 건드리지 않는다.
