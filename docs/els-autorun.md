# ELS 신규 회차 자동 점검·갱신 런북

자동 예약(Routine)이 **매주 월·수·금 아침 8시 30분(KST)** 에 이 문서를 따라 도는 것을 전제로 쓴다.
예약 슬롯이 비영업일이면 **다음 영업일**로 밀린다. 그 판정은 사람이 하지 않고
`scripts/els_schedule_check.mjs` 가 한다.

> 예약은 실제로는 **월~금 매일 아침** 깨어난다. 깨어난 세션이 스스로
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

**두 워크플로 모두 스스로 걸어야 한다.** `els-weekly.yml` 에 매일 도는 스케줄이
있긴 하지만 (가) 기본 브랜치(main)에서만 돌고 (나) GitHub 스케줄 지연 때문에
실제로는 09:30~10:00 KST 에 실행된다. 08:30 슬롯에서는 아직 그날 목록이 없다.

MCP 도구가 없는 세션이라면 **git push 로 부른다.** 두 워크플로에 요청 파일
경로가 `push.paths` 로 걸려 있다.

```bash
date -u +'마지막 요청: %Y-%m-%dT%H:%M:%SZ' >> tools/discovery/collect-request.txt
git commit -am "chore(els): 목록 수집 요청" && git push origin claude/els-product-structure-page-ljsucw
# 공시 원문이 필요할 때
date -u +'마지막 요청: %Y-%m-%dT%H:%M:%SZ' >> tools/discovery/prospectus-request.txt
git commit -am "chore(els): 공시 원문 수집 요청" && git push origin claude/els-product-structure-page-ljsucw
```

워크플로가 끝나면 결과를 같은 브랜치에 커밋하므로 받아온다.

```bash
git pull --ff-only origin claude/els-product-structure-page-ljsucw
node -e '
const fs=require("fs");const w={};new Function("window",fs.readFileSync("data/els.js","utf8"))(w);
const d=w.ELS_DATA;
console.log("기준",d.updatedAt,"· 상품",d.products.length,"건");
console.log([...new Set(d.products.map(p=>(p.name.match(/(\d{5})e?\s*$/)||[])[1]))].sort().join(" "));
'
```

여기서 나온 회차 번호를 **직전 제안서가 다룬 회차**와 비교한다. 직전 회차 목록은
`tools/discovery/els-claims.json` 또는 최근 커밋 메시지(`feat(els): 제…회 세일즈 제안서`)로 확인한다.

- **새 회차가 없다** → 갱신할 것이 없다. 아무것도 커밋하지 않고 끝낸다.
  사용자에게 보고하지 않는다(조용한 확인).
- **새 회차가 있다** → 3절로 간다.

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

## 5. 덱 빌드

```bash
node scripts/build_els_sales_deck.mjs <rcpNo>   # → els-sales-deck.pptx (6장)
soffice --headless --convert-to pdf els-sales-deck.pptx
```

모든 수치는 `scripts/lib/els-analysis.mjs` 의 `analyze(rcpNo)` 한 곳에서 나온다.
덱에 숫자를 직접 써 넣지 않는다.

몬테카를로는 `tools/discovery/mc-cache.json` 에 캐시된다 (버전·회차·경로수·시드로
키를 잡는다). 모델을 고쳤으면 `MC_VERSION` 을 올려야 캐시가 무효화된다.

## 6. 재검증

1. **시각 검증** — PDF 를 110dpi 로 래스터라이즈해 6장을 눈으로 본다. 표가 안내문을
   덮거나 글자가 셀 밖으로 나가지 않았는지 텍스트 bbox 로도 확인한다.
2. **역추적 검증** — 렌더된 PDF에서 숫자를 모두 뽑아, 하나하나가 대장에 있는지 본다
   (식별번호·배리어 나열·종목명 속 숫자·날짜·회차 라벨은 먼저 걷어낸다).
   대장에 없는 숫자가 남으면 근거 없는 값이 인쇄된 것이다.
3. **1페이지 추천 1순위 = 3페이지 추천 3종의 첫 칸**인지 확인한다. 예전에
   두 곳이 서로 다른 상품을 가리킨 적이 있다.
4. 온라인 전용 회차 표시가 붙었는지 확인한다. 판정 출처는 `rendered_list.json`
   (홈페이지 화면)이 1순위, 목록 API가 2순위다.

## 7. 커밋·푸시·전달

```bash
git add -A
git commit    # feat(els): 제…회 세일즈 제안서
git push -u origin claude/els-product-structure-page-ljsucw
```

푸시가 네트워크 오류로 실패하면 2s → 4s → 8s → 16s 로 최대 4회 재시도한다.
**PR 은 사용자가 명시적으로 요청할 때만 만든다.**

마지막으로 `els-sales-deck.pptx` 와 `els-sales-deck.pdf` 를 사용자에게 보낸다.
보고에는 이번 회차 범위, 상품 수, 추천 1순위, 주의 회차, 온라인 전용 여부를 담는다.

---

## 스타일 고정값 (바꾸지 말 것)

- 6장 구성: ① 표지·추천 1순위 ② 전체 상품 표 ③ 성향별 추천 3종 ④ 구조 설명
  ⑤ 반박 스크립트 ⑥ 유의사항
- **A = 발행사 백테스트**(공시 원문), **B = 자체 몬테카를로**. 표 머리글에 A/B 를 붙여
  출처를 드러낸다. 같은 개념(1차 상환 확률 등)이 A와 B 양쪽에 있으면 어느 쪽인지
  반드시 표기한다.
- 손실 확률에는 `±` 신뢰구간을 함께 적고, 등급 경계선에 걸리면 `△` 를 붙인다.
- 색은 미래에셋 오렌지 `#F58220` / 블루 `#043B72` 기준(`mas-design`).
- 요청 범위 밖의 기존 산출물은 건드리지 않는다.
