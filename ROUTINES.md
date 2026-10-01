# 예약(Routine) 원문 보관 — 계정 이관용

> 추출 시각: 2026-10-01 (KST) · 계정 `송재섭(마포WM)` · 저장소 `hanaroline/work_1`
>
> **이 파일이 존재하는 이유.** 예약(Routine)은 GitHub 저장소가 아니라 **Claude 계정**에
> 저장됩니다. 지금 쓰는 유료 계정을 해지하면 아래 예약은 **전부 사라지고**, 새 계정에서
> 저장소를 다시 연결해도 **되살아나지 않습니다.** 새 계정에서 아래 프롬프트를 그대로
> 붙여 넣어 다시 만들어야 합니다.
>
> 아래 프롬프트는 손으로 옮겨 적은 것이 아니라 `list_triggers` 응답에서 **기계가 그대로
> 떠낸 원문**입니다. 글자 하나 바뀌지 않았습니다.

## 목록 — 켜져 있는 예약 12개

| 이름 | cron (UTC) | KST | 고정 창 | 모델 |
|---|---|---|---|---|
| 마포WM 모닝 브리핑 (매일 07:30 KST) — 현행 · 이 대화로 전달 | `30 22 * * *` | 매일 07:30 | `session_019DwJVGyKHarxkuos9AWteb` | (기본) |
| 마포WM 장마감 시황 브리핑 (평일 16:10 KST) — 전용 창 | `10 7 * * 1-5` | 평일 16:10 | `session_01JWC6C7hmFNcQgLJVh4Scy7` | (기본) |
| 증권사 리포트 자동 배포 (평일 11:00 KST · 이 대화로 전달) | `0 2 * * 1-5` | 평일 11:00 | `session_01JPV7nE6FdLsQmeCLywoRnf` | (기본) |
| ELS 신규 회차 점검·검증 (월·수·금 16:30 KST) | `30 7 * * 1-5` | 평일 16:30(실슬롯 월·수·금) | 새 세션 | claude-opus-5 |
| ELS 신규 회차 오후 점검 (평일 14:30 KST) | `30 5 * * 1-5` | 평일 14:30 | `session_01VCJsx5t4b9gVHeJHDNoCqg` | (기본) |
| ELS 상품 구조 페이지 주간 갱신 (월 08:00 KST) — 현행 | `0 23 * * 0` | 월 08:00 | 새 세션 | (기본) |
| 평일(화~금) 08:40 상품설명의무 스크립트 갱신 | `40 23 * * 1-4` | 화~금 08:40 | `session_01VCJsx5t4b9gVHeJHDNoCqg` | (기본) |
| 월요일 08:40 상품설명의무 스크립트 자동 갱신 | `40 23 * * 0` | 월 08:40 | `session_01VCJsx5t4b9gVHeJHDNoCqg` | (기본) |
| 펀드 원천 반영 재갱신 (월요일 15:30 KST) | `30 6 * * 1` | 월 15:30 | `session_01VCJsx5t4b9gVHeJHDNoCqg` | (기본) |
| 미국 100대 기업 — 주간 목록 자동 교체 | `0 23 * * 0` | 월 08:00 | 새 세션 | (기본) |
| 세션 산출물 자료실 자동 갱신 (월·목) | `0 23 * * 0,3` | 월·목 08:00 | `session_01CrrJp8ryCeMx9e3uFSNoUp` | (기본) |
| 다음 월요일(10/5) 주간 수집이 몇 시에 닿았나 | `—` | 1회 10/05 11:30 | `session_01E2iCnG33WUWGjNT4bbZxQa` | (기본) |

`persist_session` 이 있는 예약은 **매번 같은 대화 창**으로 들어옵니다. 새 계정에서는 그 창이
없으므로, 먼저 해당 용도의 대화를 하나 열고 그 세션 ID 를 `persistent_session_id` 로 걸어야
합니다. `update_trigger` 로는 창을 바꿀 수 없습니다 — `create_trigger` 로 새로 만들어야 합니다.

---

## 프롬프트 원문

### 1. 마포WM 모닝 브리핑 (매일 07:30 KST) — 현행 · 이 대화로 전달

- cron: `30 22 * * *` (UTC)
- 고정 창: `session_019DwJVGyKHarxkuos9AWteb`
- 모델 지정: `(계정 기본값)`

````text
오늘 아침 마포WM 브리핑을 만들어 **이 대화에 파일로 올려** 주십시오. 지금은 07:30 KST 입니다. **이 루틴은 주말·휴장일을 포함해 매일 돕니다.**

이 대화는 브리핑 파이프라인을 만들어 온 자리입니다. 앞의 맥락이 요약돼 있을 수 있으니, 기억에 의존하지 말고 **저장소의 `docs/briefing-playbook.md` 를 처음부터 끝까지 다시 읽고 그대로 따르십시오.** 아래는 빠뜨리면 안 되는 것만 추린 것입니다.

**2026-08-27 개편: 판은 이제 10절이고, 어제 파일을 복사해 짓지 않습니다.** 옛 19절 구조나 스크래치패드의 `build08NN.py` 로 돌아가지 마십시오. 오른쪽 상세 패널도 없앴습니다 — 되살리지 마십시오.

**2026-09-12 개편: 산출물은 「전체 판 + 핵심본」 둘이고 「요약 PDF」는 없앴습니다.** 되살리지 마십시오 — 상세를 접어 인쇄하면 종이에는 펼칠 단추가 없어 **제목만 찍히고 본문이 사라집니다.** 짧은 판이 필요하면 접어서 감추지 말고 **핵심본**을 쓰십시오.

0. **이 예약은 하루에 여러 번 뜹니다. 무엇이든 만들기 전에 오늘 판이 이미 있는지 보십시오**(지침 0-2절).
   ```bash
   cd "$(git rev-parse --show-toplevel)" && git checkout -q main && git pull -q origin main
   ls docs/briefings/$(TZ=Asia/Seoul date +%F)-*.html 2>/dev/null
   ```
   - **파일이 있으면** `python3 scripts/recheck.py <그 파일>` 로 성한 판인지 보고, `index.json` 의 `url` 과 `git log`/`git status` 로 발행·커밋이 끝났는지 확인한 뒤 **「이미 만들어 올렸습니다」라고 보고하고 끝내십시오. 파일도 다시 보내지 마십시오.**
   - **어느 하나가 어긋나 있으면** 그 단계부터 이어서 마치십시오. `recheck.py` 가 FAIL 을 내거나 절 수가 목차와 어긋나면 중간에 끊긴 판이니 다시 지으십시오.
   - **파일이 없으면** 아래 1번부터 진행하십시오.

1. 컨테이너는 회수되므로 매번 새로 받은 상태에서 시작합니다. 작업 브랜치가 아니라 **main** 에서 시작하십시오.

2. **오늘 국내 증시가 열리는지 먼저 판정합니다.** 주말·휴장일이면 거르지 말고 **판을 바꿉니다**(지침 0절). 거래일이면 `--kind morning`(`<날짜>-morning.html`), 아니면 `--kind global`(`<날짜>-global.html`) 입니다. **어느 쪽이든 산출물은 반드시 나옵니다.** 휴장일 판정은 `data/market/holidays.json` 을 보십시오 — 빌더도 08절 휴장일 표를 이 파일에서 만듭니다.

3. **시세 신선도부터 확인합니다**(0-1절). `python3 scripts/check_market_fresh.py morning` 이 0이면 진행하고, 1이면 `bash scripts/request_market_refresh.sh` 로 수집을 발동한 뒤 `python3 scripts/check_market_fresh.py --wait morning` 으로 기다립니다. 보통 1~3분입니다. **`workflow_dispatch` 를 API 로 부르지 마십시오(403).** 낡은 값을 오늘 값처럼 쓰지 마십시오.

4. **`data/market/latest.json` 을 읽고 그날의 축을 잡습니다.** 검색은 숫자가 아니라 맥락에만 씁니다. 놓치기 쉬운 것:
   - **원인은 `news.articles` 의 본문에서 씁니다.** 시세는 「무엇이」를 말하지만 「왜」는 말하지 않습니다.
   - **`earnings.items`** 에 그날 실적·컨퍼런스콜 대목이 원문 그대로 뽑혀 있습니다. `call_quotes` 가 05절의 본론입니다.
   - **`supply_bands`** 가 매물대 근사입니다. `money_flow.*_delta` 로 예탁금·신용 증감을 씁니다(`*_chg` 는 부호 없는 절대값이라 감소를 증가로 읽습니다).
   - 환율은 `indices` 가 아니라 **`fx`** 를 씁니다.

5. **그날 할 일은 서술 파일을 쓰는 것입니다.** 표·날짜 이름표·비율·개수·주도 종목은 빌더가 자료에서 만듭니다.
   ```bash
   cp data/briefing/narrative-EXAMPLE.json data/briefing/narrative-$(TZ=Asia/Seoul date +%F)-<morning|global>.json
   # 편집한 뒤
   python3 scripts/build_briefing.py            # 주말·휴장일이면 --kind global
   python3 scripts/build_briefing.py --core     # 핵심본도 함께
   ```
   - **서술 파일 이름에 반드시 판 이름을 붙이십시오**(`-morning` / `-close` / `-global`). 접미사를 빼면 그날 장마감 판이 아침 판을 덮어씁니다 — 8/28 과 9/8 에 실제로 그랬습니다.
   - **숫자를 문장에 손으로 적지 마십시오.** 표에 있는 값을 서술에 옮겨 적으면 다음 날 어긋납니다.
   - 키를 비우면 자료에서 계산한 한 줄이 대신 나가고 검증 노트 (b) 에 몇 개가 비었는지 찍힙니다. **비운 채로 내지 말고 채우십시오.**
   - **`deep` 키는 큰 이벤트가 있는 날만** 채웁니다(지침 7-4절). 없으면 절 자체가 실리지 않습니다.
   - 종목 표의 「사유」(`why`)는 **확인된 것만** 답니다. 지수를 따라 움직였을 뿐인 종목에 이야기를 붙이면 그 자체가 틀린 정보입니다.

6. **후처리 셋을 전체 판과 핵심본 **둘 다**에 이 순서로 한 번씩 돌립니다.**
   ```bash
   for F in docs/briefings/<오늘>.html docs/briefings/<오늘>-core.html; do
     python3 scripts/inline_notes.py $F && python3 scripts/fold_perf.py $F && python3 scripts/print_fit.py $F
   done
   ```

7. **보관본과 목록.** `docs/briefings/index.json` 에 오늘 항목(`url` 은 일단 null)을 넣고 `python3 scripts/build_archive_nav.py` 를 돌립니다. 핵심본에는 `--beta <핵심본 경로>` 로 목록을 넣습니다. **날짜를 손으로 적거나 잘라 걸지 마십시오.** 8번·9번보다 **먼저** 돌려야 PDF 에도 목록이 실립니다.
   **목록은 자르지 않습니다** — 어느 판을 열어도 최신 판으로 갈 수 있도록 판마다 **모든 판**을 싣고, 머리글은 **「브리핑 목록」**입니다.

8. **검증은 두 겹입니다. 둘 다, 그리고 전체 판과 핵심본 모두에 하십시오**(지침 6-1절).
   - **(가) 렌더링** — Playwright(`executablePath:'/opt/pw-browsers/chromium'`)로 **340~1920px 를 20px 씩 훑어** 넘침이 **전 구간 0** 인지 확인합니다. 네 폭만 재면 놓칩니다. 열 수 불일치 0, 한/영 반대언어 노출 0, JS 오류 0, 화면 중복 0 도 수치로 잽니다.
   - **(나) 발행 직전 재검증**
     ```bash
     python3 scripts/recheck.py $F && python3 scripts/audit_numbers.py $F
     python3 scripts/dupcheck.py $F docs/briefings/<직전 같은 종류 판>.html
     python3 scripts/stale.py $F $(TZ=Asia/Seoul date +%F) <직전 거래일 MM-DD>
     ```
     **네 개를 다 돌리십시오 — 겹치지 않습니다.** FAIL 은 고치고, **WARN 은 「고치거나, 판에 적거나」 둘 중 하나**입니다. `audit_numbers.py` 는 오탐이 섞이므로 개수만 보지 말고 하나씩 판단하십시오.

9. **파일을 만들어 이 대화에 올립니다 — 이것이 이 루틴의 산출물입니다. 어떤 경우에도 건너뛰지 마십시오.** 8번이 끝난 **뒤에** 만드십시오.
   ```bash
   bash scripts/make_outputs.sh docs/briefings/<오늘>.html
   bash scripts/make_outputs.sh docs/briefings/<오늘>-core.html
   ```
   `out/` 의 **네 파일**(단독 HTML, 전체 PDF, 핵심 HTML, 핵심 PDF)을 **모두 `SendUserFile`** 로 보냅니다(HTML 은 `display:"render"`). **목표는 전체 22~24쪽 · 핵심본 8쪽 안팎**입니다. 보내기 전에 `pdftotext -layout` 으로 기간 수익률과 설명이 둘 다 살아 있는지, `pdftoppm` 으로 빈 띠가 평균 10%·최대 25% 안인지 확인하십시오.
   **이미 보낸 뒤에 고칠 것이 나오면** 다시 만들어 다시 보내고 「이것으로 바꿔 쓰십시오」라고 한 줄 붙이십시오.

10. **아티팩트는 날짜마다 새로 만듭니다.** `favicon` 📈, label `MM-DD · 모닝`(또는 `· 해외`). 받은 주소를 `index.json` 의 오늘 항목 `url` 에 적고 `build_archive_nav.py` 를 한 번 더 돌립니다. **같은 주소를 돌려쓰지 마십시오.** `index.json` 에 이미 `url` 이 있으면 새로 발행하지 마십시오.

11. **브리핑 목록 한 장도 같이 갱신합니다 — 빠뜨리지 마십시오.** 10번에서 오늘 `url` 을 적은 **뒤에**:
    ```bash
    python3 scripts/build_archive_page.py     # docs/briefings/archive.html
    ```
    그리고 이 파일을 **`index.json` 의 `archive_page.url` 주소에 `url` 파라미터로 덮어써** 발행합니다(`favicon` 🗂️). **새 주소를 만들지 마십시오 — 이 한 장은 주소가 바뀌지 않는 것이 존재 이유입니다.**

12. `docs/briefings/`, `data/briefing/`, `index.json` 변경분을 커밋해 **main** 에 밀어 넣습니다. 푸시가 네트워크 오류로 실패하면 2·4·8·16초 간격으로 최대 4회 재시도합니다. **PR 은 만들지 마십시오.**

국내 거래일에는 09시 개장 전에 손에 들려야 합니다 — **08:10 KST 안에 끝내십시오.** 시간이 모자라면 절을 줄이지 말고 서술의 깊이를 줄이되, **8번(재검증)과 9번(파일 전달)은 어떤 경우에도 하십시오.** 시세가 끝내 안 들어오면 포기하지 말고 「시세 파일이 (수집 시각) 기준이라 (항목)은 (날짜) 값입니다」를 머리말과 검증 노트에 명시한 뒤 확보된 범위까지만 내보내십시오.

**어디선가 막혀 브리핑을 못 만들게 되면 조용히 끝내지 말고, 무엇이 어디서 막혔는지 이 대화에 한국어로 적어 주십시오.** 사용자가 이 화면을 보고 있습니다.

마지막에 한국어 존댓말로 짧게 보고해 주십시오: 오늘이 어느 판인지와 그 이유, 그날의 축 한두 줄, **서술을 손으로 쓴 자리와 자료에서 만든 자리의 개수**, 검증 수치(절·표 개수, 340~1920px 넘침 0 여부, 재검증 FAIL/WARN 개수와 남긴 경고를 어디에 적었는지, 판 안 중복과 지난 판 반복 비율, PDF 쪽수와 빈 띠 평균), 브리핑 목록 아티팩트를 갱신했는지, 확인하지 못한 항목.
````

### 2. 마포WM 장마감 시황 브리핑 (평일 16:10 KST) — 전용 창

- cron: `10 7 * * 1-5` (UTC)
- 고정 창: `session_01JWC6C7hmFNcQgLJVh4Scy7`
- 모델 지정: `(계정 기본값)`

````text
미래에셋증권 마포WM의 **장마감 시황 브리핑**을 만들어 **이 창에 파일로 올리고** 아티팩트로 발행하세요. 지금은 오늘 한국 증시 마감(15:30 KST) 후 약 40분 시점입니다.

이 창은 장마감 전용입니다. 모닝 브리핑은 다른 창에서 돕니다 — 여기서는 장마감만 만듭니다. 앞의 맥락이 요약돼 있을 수 있으니 기억에 의존하지 말고 저장소의 지침을 다시 읽으십시오.

오늘이 한국 증시 휴장일이면 만들지 말고 그 사실만 보고하고 종료하세요.

■ 0단계 — **오늘 판이 이미 있는지 먼저 보십시오** (지침 0-2절)

**이 예약은 하루에 한 번 뜨는 것이 원칙이지만 실제로는 여러 번 뜹니다.** 2026년 8월 21일에는 예정(16:10)보다 20분 이른 15:50 에 떴고, 예정 시각에 한 번 더 뜰 자리가 남아 있었습니다. 그대로 두면 같은 날 판을 두세 번 만들고 아티팩트가 여러 개 생기며 `index.json` 에 같은 날짜가 겹칩니다.

```bash
cd "$(git rev-parse --show-toplevel)" && git checkout -q main && git pull -q origin main
ls docs/briefings/$(TZ=Asia/Seoul date +%F)-close*.html 2>/dev/null
```

- **파일이 있으면** `python3 scripts/recheck.py <그 파일>` 로 성한 판인지 보고, `index.json` 의 `url` 과 `git log`/`git status` 로 발행·커밋이 끝났는지 확인한 뒤 **「이미 만들어 올렸습니다」라고 보고하고 끝내십시오. 파일도 다시 보내지 마십시오.**
- **어느 하나라도 어긋나 있으면** 그 어긋난 단계부터 이어서 마치십시오(커밋만, 발행만).
- **`index.json` 에 오늘 항목은 있는데 `url` 이 `null` 이면** 중간 저장까지만 되고 발행에서 끊긴 것입니다 — **다시 짓지 말고 발행부터** 이어 가십시오.
- **`recheck.py` 가 FAIL 을 내거나 절 수가 목차와 어긋나면** 중간에 끊긴 판이니 처음부터 다시 지으십시오.
- **파일이 없으면** 아래 1단계부터 진행하십시오.

■ 1단계 — 시세가 오늘 것인지 확인 (건너뛰지 마십시오)

```bash
python3 scripts/check_market_fresh.py close
```

끝 상태 0 이면 진행합니다. **1 이면 낡았거나 마감 전 스냅숏입니다** — 한 줄도 쓰기 전에:

```bash
bash scripts/request_market_refresh.sh
python3 scripts/check_market_fresh.py --wait close
```

`workflow_dispatch` 를 API 로 부르지 마십시오. 세션 토큰에는 Actions 쓰기 권한이 없어 403 입니다.

**이 검사는 2026-08-31 에 고쳤습니다.** 전에는 날짜만 비교해서 **장중에 찍힌 파일을 통과시켰습니다** — 8/27 은 12:03, 8/28 은 15:03, 8/31 은 09:24 에 찍힌 것이 사흘 연속 「쓸 수 있다」로 나왔고 셋 다 종가도 수급도 그날 것이 아니었습니다. 이제 `SESSION_FLOOR` 가 **그 판이 다루는 장의 15:30** 을 하한으로 잡습니다. 그래도 1 이 나오면 낡은 값을 오늘 값처럼 쓰지 말고, 머리말과 검증 노트에 «시세 파일이 (수집 시각) 기준» 이라고 명시한 뒤, 확보된 범위까지만 씁니다. **낡은 줄 모르고 쓰는 것이 못 쓰는 것보다 나쁩니다.**

**수집이 마감 직후(16:1x)에 돌았다면 투자자별 수급과 프로그램 매매는 잠정치입니다.** 실제로 9/14~9/17 나흘 모두 다음 날 확정치로 갱신됐습니다. 그 사실을 판에 적으십시오. **저녁(21:30) 수집분으로 갈아 끼우지 마십시오** — 수급은 확정되지만 원/달러가 서울 마감이 아닌 24시간 호가로 바뀝니다.

■ 그다음 작성 지침을 읽으세요

```bash
cat docs/briefing-playbook.md
```

**문서의 지침이 이 프롬프트보다 우선합니다.** 특히 6-1절(파이프라인 순서와 **중간 저장**), 7-0절(핵심본), 7절(절 구성), 4-3절(기간 수익률)을 보십시오.

■ **순서가 바뀌었습니다 — 커밋은 맨 끝이 아니라 중간에 합니다** (2026-09-17)

2026-09-16 판이 빌드·검증·PDF 까지 끝난 상태에서 **아티팩트 발행 직전에 실행이 끊겼습니다.** 그때까지 만든 것은 손으로 쓴 45KB 서술 파일까지 **전부 작업트리에만** 있었습니다. 컨테이너가 살아남아 다음 날 이어 마쳤지만 그것은 운이었습니다. **그래서 커밋을 셋으로 나눕니다.**

| | 언제 | 무엇을 |
|---|---|---|
| ① | 서술 파일을 쓴 **직후** | 서술 파일만 |
| ② | 재검증 **오류 0** 을 본 직후, **발행 전** | 판 둘 + `index.json`(`url` 은 `null`) + 목록 |
| ③ | 아티팩트 주소를 적고 목록을 다시 만든 뒤 | `index.json` + 사이드바 + `archive.html` |

```bash
bash scripts/save_progress.sh "<메시지>" <파일...>
```

되받아 네 번 밀어 보고 실패해도 **커밋만 남기고 0 으로 끝납니다** — 수집기가 동시에 밀어 넣는 저장소라 흔한 일이고, 다음 저장이 함께 밀어 줍니다. **여기서 판 만들기를 멈추지 마십시오.** ③ 은 `save_progress.sh` 가 아니라 제대로 된 커밋 메시지로 직접 하십시오.

■ 이 실행에서 만들 것 — **핵심본이 기본이고, 전체 판이 보관본입니다**

빌더가 만듭니다. **판을 물려 짓지 마십시오.** 그날 손으로 쓰는 것은 서술 파일 하나뿐입니다.

```bash
# 1) 그날의 서술을 씁니다 — 이것이 유일하게 손으로 쓰는 것입니다
#    견본: data/briefing/narrative-EXAMPLE.json
#    파일: data/briefing/narrative-<오늘 날짜>.json
bash scripts/save_progress.sh "장마감 <오늘> 서술" data/briefing/narrative-<오늘>.json   # ★ 중간 저장 ①
# 2) 두 벌을 냅니다
python3 scripts/build_briefing.py --kind close --date <오늘>          # 전체 판 (보관본)
python3 scripts/build_briefing.py --kind close --date <오늘> --core   # 핵심본 (8쪽 안팎)
```

**핵심본이 고객에게 가는 것입니다**(지침 7-0). 전체 판은 브리핑을 준비하는 사람이 읽는 보관본이고, `index.json` 에 오르는 것도 전체 판입니다. **핵심본은 index.json 에 올리지 마십시오.**

서술 파일에서 비운 키는 **어제 문장이 남는 것이 아니라** 자료에서 계산한 한 줄이 대신 나가고, 몇 개가 비었는지 검증 노트에 숫자로 찍힙니다. **키를 다 채우십시오** — 「자료에서 만든 자리 0」이 목표입니다.

**숫자를 문장에 손으로 적지 마십시오.** 표에 있는 값을 서술에 옮겨 적으면 다음 날 어긋납니다.

**심층 분석(`deep`) 은 큰 이벤트가 있는 날만**(지침 7-4절): 대형주 실적·컨콜, 중앙은행 **결정**, 큰 지표가 예상과 갈린 날, 정책·규제가 업종을 통째로 움직인 날, 지수가 ±3% 움직인 날. 아니면 **넣지 말고 그 판단을 검증 노트에 적으십시오** — 9/16 판이 「결과가 아직 안 나왔다」로 뺐고 9/17 판이 결과가 나와 넣었습니다.

**검색은 「왜 그랬는지」에만 씁니다.** 등락 종목 수·52주·수급·금리·환율·거래대금은 전부 `data/market/latest.json` 에 있습니다. 기사 원문이 `news.articles` 에 본문째 들어 있으니 검색 요약보다 그쪽을 먼저 보십시오. **검증 노트에 적을 숫자는 기사 본문에 실제로 있는지 되짚으십시오**(지침 4-3절의 blob 검사).

**없는 수치는 지어내지 않습니다.** 비워 두고 배지를 답니다. 지금 확실히 못 받는 것은 VKOSPI·미수금·반대매매, 그리고 **기타법인 수급**입니다 — 자사주 매입이 지수를 좌우하는 날에는 이것이 크게 걸리므로 보도에서 인용하고 1 SOURCE 배지와 검증 노트를 다십시오.

**16:10 시점에 미국은 아직 열지 않았습니다.** 미국 날짜는 「전일 마감(날짜)」으로 이름표를 답니다. 미 14:00 ET 는 **다음 날 03:00 KST** 입니다.

■ 후처리와 목록

```bash
for f in docs/briefings/<오늘>-close.html docs/briefings/<오늘>-close-core.html; do
  python3 scripts/inline_notes.py $f && python3 scripts/fold_perf.py $f && python3 scripts/print_fit.py $f
done
# index.json 에 오늘 «전체 판» 항목을 넣는다 — 이때 url 은 null 이다.
# 자리는 맨 앞이 아니라 build_archive_nav.SESSION_ORDER 로 정렬해 정한다
# (하루에 판이 셋인 날이 있다 — 이벤트·장마감·모닝).
python3 scripts/build_archive_nav.py
python3 scripts/build_archive_nav.py --beta docs/briefings/<오늘>-close-core.html
```

**검증보다 먼저** 돌려야 PDF 에도 목록이 실립니다.

■ 검증은 두 겹입니다. **두 벌 모두** 하십시오 (지침 6-1절)

**(가) 렌더링 검사.** Playwright(`executablePath:'/opt/pw-browsers/chromium'`)로 **340px 부터 1920px 까지 20px 씩 훑어** 각 `table.data` 의 `scrollWidth` 가 감싼 `.table-wrap` 의 `clientWidth` 를 넘지 않는지, 문서 가로 넘침이 없는지 **전 구간 0** 을 확인하십시오. **네 폭만 재면 놓칩니다.** 넘치면 CSS 로 버티지 말고 **열을 줄이십시오**. 열 수 불일치 0, 한/영 반대언어 노출 0, JS 오류 0, 설명 중복 0 도 함께 봅니다. 검사 스크립트는 **저장소 뿌리에서** 돌리고 끝나면 지웁니다.

**(나) 발행 직전 재검증.**

```bash
python3 scripts/recheck.py       docs/briefings/<오늘>-close.html
python3 scripts/recheck.py       docs/briefings/<오늘>-close-core.html
python3 scripts/audit_numbers.py docs/briefings/<오늘>-close.html
python3 scripts/dupcheck.py      docs/briefings/<오늘>-close.html docs/briefings/<지난 거래일>-close.html
```

- **FAIL 은 고치고 다시 돕니다.**
- **WARN 은 「고치거나, 판에 적거나」 둘 중 하나입니다.** 남긴 경고는 그것이 판의 어느 줄에 적혀 있는지 말할 수 있어야 합니다.
- `audit_numbers.py` 는 오탐이 섞입니다(「유틸리티」가 「전기유틸리티」에, 이익수익률이 등락률에 걸리는 것). 개수만 보지 말고 **하나씩 판단**하십시오.
- `dupcheck.py` 의 수를 **검증 노트에 적습니다**(지침 7절 규칙 4).
- **핵심본에 상세가 0 인 것은 FAIL 이 아닙니다** — 설계입니다.

```bash
bash scripts/save_progress.sh "장마감 <오늘> 판 본문" docs/briefings data/briefing   # ★ 중간 저장 ②
```

**여기까지 왔으면 판은 저장소에 있습니다.** 이 뒤로 실행이 끊겨도 다음 실행이 「발행만 남았다」를 알아봅니다.

■ 파일 전달 — **이 루틴의 산출물입니다. 어떤 경우에도 건너뛰지 마십시오**

```bash
bash scripts/make_outputs.sh docs/briefings/<오늘>-close-core.html   # 핵심 HTML + 핵심 PDF
bash scripts/make_outputs.sh docs/briefings/<오늘>-close.html        # 단독 HTML + 전체 PDF
```

**핵심본부터 보내십시오** — 고객에게 가는 것이 그것입니다. `SendUserFile` 로 **이 창에** 올립니다(HTML 은 `display: "render"`, PDF 는 그대로). 전체 판도 이어서 보냅니다. **컨테이너는 회수되므로 반드시 같은 실행 안에서 보내야 합니다.**

보내기 전에 PDF 를 **두 가지로** 확인하십시오.

```bash
pdftotext -layout out/미래에셋_마포WM_*_전체.pdf - | grep -E '삼성전기|국고채|원/100엔'
pdftoppm -r 50 -png out/미래에셋_마포WM_*_전체.pdf /tmp/pg
```

두 번째는 각 쪽에서 잉크가 있는 첫 줄과 마지막 줄 **사이**의 가장 긴 빈 구간을 재는 것입니다. **아래 여백만 재면 꼬리말 때문에 전부 0으로 보입니다.** 마지막 쪽을 빼고 **평균 10% 이하, 최대 25% 이하**면 정상입니다. **핵심본은 8쪽 안팎**, 전체 판은 22~24쪽입니다.

**이미 보낸 뒤에 고칠 것이 나오면** 다시 만들어 다시 보내고 「이것으로 바꿔 쓰십시오」라고 한 줄 붙이십시오. 조용히 저장소만 고치지 마십시오.

■ 발행

**아티팩트는 날짜마다 새로 만듭니다.** 오늘 판을 **새 아티팩트 둘로** 발행합니다(`favicon` 은 🔔):

- 핵심본 — label `MM-DD · 장마감 핵심본`
- 전체 판 — label `MM-DD · 장마감`

전체 판의 주소를 `index.json` 의 오늘 항목 `url` 에 적은 뒤 `build_archive_nav.py` 와 `build_archive_page.py` 를 다시 돌립니다. **핵심본 주소는 index.json 에 적지 않습니다.** 목록이 바뀌면 오늘 판 HTML 도 바뀌므로 **같은 파일 경로로 다시 발행**해 저장소와 아티팩트를 맞추십시오(주소는 그대로입니다). 지난 판은 다시 올리지 않습니다.

주소가 바뀌지 않는 「브리핑 목록」 한 장(`d71cdafd-…`)도 갱신합니다 — **다른 창이 먼저 덮어썼을 수 있으니 거절당하면 라이브 판을 읽고, 내 것이 상위집합인지 UUID 로 대조한 뒤** 다시 올리십시오. 모닝 창이 올린 항목(이벤트 브리프 등)이 내 `index.json` 에 없을 수 있습니다.

그다음 **마지막 커밋 ③** 으로 `docs/briefings/` 와 `index.json` 변경분을 **main** 에 밀어 넣습니다. `data/market/latest.json` 이 수집기 때문에 바뀌어 있으면 **그것은 커밋하지 말고 되돌린 뒤** 받으십시오. 푸시가 거절되면 `git pull --rebase origin main` 뒤 다시 미십시오. **PR 은 만들지 마십시오.**

**어디선가 막혀 브리핑을 못 만들게 되면 조용히 끝내지 말고, 무엇이 어디서 막혔는지 이 창에 한국어로 적어 주십시오.**

■ 보고

한국어 존댓말로 짧게: 그날의 축 한두 줄, 검증 수치(절·표 개수, 340~1920px 넘침 0 여부, **재검증 FAIL/WARN 개수와 남긴 경고를 어디에 적었는지**, dupcheck 수, PDF 쪽수와 빈 띠 평균), 보낸 파일, 확인하지 못한 항목.
````

### 3. 증권사 리포트 자동 배포 (평일 11:00 KST · 이 대화로 전달)

- cron: `0 2 * * 1-5` (UTC)
- 고정 창: `session_01JPV7nE6FdLsQmeCLywoRnf`
- 모델 지정: `(계정 기본값)`

````text
오늘 자 증권사 리포트를 뽑을 시각입니다(평일 11:00 KST). 늘 하던 순서 그대로, main 에서 합니다.

왜 11:00 인가 — 10:30 판이 하루치를 덜 담는 것을 사흘 내리 실측했습니다.
9/28 은 10:33 에 94 건이던 것이 11:47 에 113 건(+20%), 9/30 도 10:52 89 건 →
11:23 91 건으로 그 시각까지 계속 들어오고 있었습니다. 08 시대는 거의 비어
있고(7~10 건), 09:00~09:30 에 크게 늘었다가 11 시 무렵까지 이어집니다.
다만 하루가 끝난 값은 아니므로, 이 판은 「그 시각까지의 판」이지 완성본이
아닙니다 — 보고에 수집 시각을 반드시 적습니다.

1. git fetch origin main && git checkout main && git reset --hard origin/main

2. 수집을 직접 부릅니다 — 예약(GitHub cron)을 기다리지 않습니다.
   BASE=$(git rev-parse origin/main)   # 밀어 넣기 전에 적어 둔다
   bash scripts/request_reports_refresh.sh "11:00 판"

3. 러너가 끝나기를 기다립니다. 「리포트 수집 요청」(내가 민 것)과
   「리포트 수집 2026-…」(러너가 민 것)을 헷갈리지 않게 자릿수까지 봅니다.
     until git fetch -q origin main && [ -n "$(git log --format=%h $BASE..origin/main --grep='^리포트 수집 [0-9]')" ]; do sleep 30; done
   보통 2 분 30 초~3 분 30 초입니다.

   **8 분이 지나도 안 오면 기다리기를 그만두지 말고, 먼저 실행 기록을
   열어 보십시오.** 9/30 에 18 분이 걸린 적이 있는데, 그때 「안 돈다」고
   보고한 것은 틀린 판단이었습니다 — 멈춘 것이 아니라 수집 단계가 오래
   걸리는 중이었습니다. 멈춘 것인지 느린 것인지는 기록을 봐야 압니다.
     mcp__github__actions_list(method=list_workflow_runs, owner=hanaroline,
       repo=work_1, resource_id=reports.yml)
     → status 가 in_progress 면 기다린다. list_workflow_jobs 로 어느 단계인지 본다.
     → 아예 실행이 없으면 그때가 진짜 「안 돈 것」이다.
   끝내 못 받으면 저장소에 있는 가장 최근 판으로 진행하되 「11:00 수집이
   돌지 않아 ○시 ○분 판을 썼다」고 반드시 적어 알립니다.

4. git reset --hard origin/main 뒤 검산을 **먼저** 돌립니다.
   python3 scripts/verify_reports.py data/reports/latest.json
   나가는 값이 0 이 아니면 자료를 내지 않습니다. 어느 검사가 어떻게 어긋났는지
   그대로 옮겨 알리고, 원인을 찾아 고친 뒤 다시 돌립니다. 42 개 「모두 맞음」이
   나와야 통과입니다.

   **사1 에 원천이 죽었다고 나오면** 곧바로 판을 통째로 한 번 더 부르십시오.
   9/30 에 미래에셋·하나 둘이 한꺼번에 죽었는데(18 분 지연의 원인), 다시
   부르니 2 분 48 초 만에 여덟 곳 모두 정상으로 들어왔습니다. 수집기 안의
   재시도로는 안 되고 판을 통째로 다시 부르면 되는 양상입니다. 두 번 불러도
   안 되면 자료를 내지 말고 그 사실을 적어 알립니다.

5. 통과했으면 그날 날짜를 주어 뽑고 SendUserFile 로 네 파일을 올립니다.
   bash scripts/make_reports_outputs.sh <오늘 날짜 YYYY-MM-DD>

6. 보고에 담을 것 — 숫자는 실린 값과 reports 배열을 직접 센 값을 대조해 적습니다.
   - 오늘 자 몇 건 · 전체 몇 건 · 한 주 몇 건 · 증권사 몇 곳 · 죽은 원천
   - 머리 요약(overview 의 text) 원문 그대로
   - 목표주가를 올리거나 내린 리포트 — 있으면 **본문 근거를 눈으로 확인한 뒤**
     그 문장을 옮겨 적고, 없으면 없다고. 「실적 추정치를 상향」 같은 문장은
     목표주가 근거가 아니므로 쓰지 않습니다.
   - 검산 42 개 통과 여부 · 수집 시각 · 앞날 같은 시각 판과의 비교

어림하거나 지어내지 않습니다. 못 한 것은 못 했다고 적습니다.
````

### 4. ELS 신규 회차 점검·검증 (월·수·금 16:30 KST)

- cron: `30 7 * * 1-5` (UTC)
- 고정 창: `없음 (매번 새 세션)`
- 모델 지정: `claude-opus-5`

````text
미래에셋증권 ELS 신규 회차 정기 점검이다. 저장소는 hanaroline/work_1, 작업 브랜치는 claude/els-product-structure-page-ljsucw 다. 다른 브랜치에는 절대 밀지 않는다. PR 은 만들지 않는다.

■ 이 예약이 하는 일이 2026-09-29 에 바뀌었다

수집·파싱·주장 대장·검산·빌드·역방향 대조는 이제 **러너가 평일 10:10 KST 에 혼자
끝낸다**(.github/workflows/els-autobuild.yml, main 에 있음). 당신이 깨어나는 10:30 에는
이미 커밋돼 있다.

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

- 최근 커밋에 `feat(els): 제…회 세일즈 자료 3종 (자동 빌드)` 가 있으면 → 2) 로 간다.
- `chore(els): 신규 회차 점검 (NONE)` 만 있으면 새 회차가 없는 날이다. 사용자에게
  한 줄만 보고하고 끝낸다 (예: "9/30 확인 · 새 회차 없음 · 목록 20건").
  조용히 끝내지 않는다 — 점검이 돈 것과 안 돈 것이 구분되어야 한다.
- **오늘 커밋이 아예 없으면 러너가 실패한 것이다.** 조용히 넘기지 말고
  "오늘 자동 빌드가 돌지 않았습니다" 라고 알린다. GitHub MCP 도구가 보이면
  els-autobuild.yml 을 ref=main 으로 돌려 보고, 없으면 그 사실을 적는다.

■ 2) 눈으로 보는 검증 — 이것이 본론이다

렌더해서 전 장을 **실제로 본다**. 텍스트만 읽지 말고 이미지로 봐야 한다.

  bash scripts/install_fonts.sh
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm install --no-save playwright@1.56.1
  soffice --headless --convert-to pdf els-sales-deck.pptx
  soffice --headless --convert-to pdf els-analysis-deck.pptx
  node scripts/proposal_to_pdf.mjs els-analysis.html els-analysis.pdf
  # 110dpi 로 래스터라이즈해 제안서 8장 · 분석자료 10쪽 · 발표판 15장을 전부 본다

보면서 이것들을 확인한다. 자세한 목록은 docs/els-autorun.md 의 6절과
"스타일 고정값" 을 기준으로 한다.

  - 문장이 전제하는 것이 이번 회차에 성립하는가. "제일 높은" 이 정말 1위인가,
    "가장 낮은" 이 정말 최저인가, 대비하는 두 값이 같지 않은가,
    "조건이 달라서" 가 실제로 다른 조건을 짚는가.
  - 낙인이 없는 회차, 기초자산이 하나뿐인 회차, 외화 상품이 없는 주에
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
````

### 5. ELS 신규 회차 오후 점검 (평일 14:30 KST)

- cron: `30 5 * * 1-5` (UTC)
- 고정 창: `session_01VCJsx5t4b9gVHeJHDNoCqg`
- 모델 지정: `(계정 기본값)`

````text
[평일 14:30 KST · ELS 신규 회차 오후 점검]

사용자가 「신규 회차 올라오면 알려줘」 라고 했고, 아침 점검(08:40)만으로는 주중 오후에
올라온 회차를 다음 날까지 놓치므로 지연을 반나절로 줄이려고 건 예약이다.

■ 아침 판과 다른 점 — **가볍게 본다**
ELS 상품 목록만 받는다. 펀드 카탈로그·설명서 판독·쪽 지도·재빌드는 하지 않는다.
새 회차가 있을 때만 전체 사슬을 돌린다.

■ 할 일

1) 실행 전 값을 먼저 기록한다 (이름으로 대조해야 하므로 건수만 보면 안 된다).

     cd /home/user/work_1
     git fetch origin claude/els-fund-disclosure-i6wtii
     git show origin/claude/els-fund-disclosure-i6wtii:data/els.js > <스크래치>/pm-before.js
   ELS_DATA.products 의 code·name·status·offerEnd 를 뽑아 둔다.

2) ELS 상품 목록만 수집한다 — `els-weekly.yml` 을 발동한다.
     mcp__github__actions_run_trigger · method=run_workflow · owner=hanaroline
     · repo=work_1 · workflow_id=els-weekly.yml · ref=claude/els-fund-disclosure-i6wtii
   보통 1분 안에 끝난다. list_workflow_runs 로 완료를 확인한다.

3) 다시 받아 **code 로 맞대어** 신규·빠짐·상태 변화를 센다.

■ 보고 — 시끄럽지 않게

- **새 회차가 있으면 — 이것이 본론이다.**
  ① `PushNotification` 으로 먼저 한 줄 (200자 이내, 예: 「ELS 신규 5회차 38152~38156,
     청약마감 10-08」).
  ② 이어서 `weekly-refresh.yml` 을 같은 브랜치에서 발동해 전체 사슬(설명서·쪽 지도·
     배포본 재빌드)을 돌리고, 끝나면 검산하고 배포판·테스트판을 SendUserFile 로 올린다.
  ③ 대화에는 회차 번호 · 기초자산 · 청약마감일 · 만기 · 쿠폰 · 위험등급을 표로 적는다.

- **새 회차가 없으면 아무 말도 하지 않는다.** 아침 점검이 매일 한 줄을 남기므로
  오후까지 「변화 없음」 을 적으면 잡음이 된다. 조용히 끝낸다.
  (다만 **상태가 「청약 마지막날」 로 바뀐 회차가 새로 생겼으면** 그건 한 줄 적는다 —
   창구가 오늘 안에 받아야 하는 건이다.)

- **수집이 실패했으면 조용히 넘기지 말고 알린다.** 잡 로그를 읽어 까닭을 요약하고,
  그 데이터가 아침 값으로 남는다는 사실을 분명히 적는다.

■ 하지 말 것
코드 수정 · `claude/els-fund-disclosure-i6wtii` 아닌 브랜치로의 push · PR 생성.
새 회차가 없는데 펀드 쪽을 건드리는 일.

■ 참고 (관측한 것)
회차 묶음은 주 단위가 아니라 열흘쯤 가고 다음 묶음은 주중에 올라온다.
9/7 시작분 → 9/16 마감 · 9/14 시작분 → 9/22 마감 · 9/18 시작분 → 10/1 마감.
지난 두 번 모두 앞 묶음 마감 나흘쯤 전에 다음 묶음이 올라왔다.
````

### 6. ELS 상품 구조 페이지 주간 갱신 (월 08:00 KST) — 현행

- cron: `0 23 * * 0` (UTC)
- 고정 창: `없음 (매번 새 세션)`
- 모델 지정: `(계정 기본값)`

````text
미래에셋증권 ELS 상품 구조 페이지의 주간 데이터 갱신 작업이다.

저장소: hanaroline/work_1
브랜치: claude/els-product-structure-page-ljsucw (이미 main 에 머지되었다면 main 에서 작업)

배경
- els.html / els-standalone.html 은 ELS 상품의 기초자산·조기상환 조건·수익 구조를
  고객이 한 화면에서 이해하도록 만든 페이지다.
- 상품 데이터는 data/els.js 이고, scripts/collect_els.mjs 가 미래에셋 홈페이지의
  공개 API(POST /hks/hks4022/a01.json)에서 매주 수집한다.
- 이 세션의 네트워크는 GitHub 외 외부 사이트가 막혀 있다. 수집은 반드시
  GitHub Actions 러너에서 실행해야 한다.

이번 주에 할 일
1. 워크플로우 "ELS 상품 주간 수집"(.github/workflows/els-weekly.yml)을 실행한다.
   - mcp__github__actions_run_trigger 의 run_workflow 로 els-weekly.yml 을 dispatch.
   - dispatch 가 안 되면(워크플로우가 기본 브랜치에 없는 경우 등) 대신
     scripts/collect_els.mjs 를 아주 작게 손봐 push 해서 push 트리거로 실행시킨다.
2. 실행이 끝나면 결과를 확인한다.
   - 성공: data/els.js 가 갱신되고 els-standalone.html 이 재빌드되어 커밋된다.
   - 실패: data/els.js 는 그대로 유지된다(페이지는 직전 주 데이터로 정상 동작).
     els-collect-debug 아티팩트와 잡 로그를 보고 원인을 파악한다.
       · 화면 경로나 API 가 바뀐 경우 → scripts/discover_els.mjs 를 돌려 다시 특정
       · 응답 필드명이 바뀐 경우 → collect_els.mjs 의 normalize() 를 갱신
     고칠 수 있으면 고쳐서 다시 돌리고, 구조적으로 막히면 무엇이 막혔는지 보고한다.
3. 수집된 데이터를 검증한다. 아래가 하나라도 어긋나면 파서를 의심할 것.
   - 상품 수가 0건이거나 직전 주 대비 급감하지 않았는지
   - schedule 의 배리어가 structureDesc 원문과 일치하는지
   - knockIn 이 null 인 상품이 정말 "노낙인" 표기인지
   - couponRate 가 비정상적으로 크거나 작지 않은지 (rateBasis 는 'annual')
4. 갱신 내용을 요약해 보고한다: 신규 청약 상품, 마감된 상품, 수익률 범위,
   기초자산 분포. 특이사항(수집 실패, 스키마 변경, 이상값)은 반드시 명시한다.

주의
- 사용자가 요청하지 않으면 PR 을 만들지 않는다. 지정 브랜치에 커밋·푸시만 한다.
- 페이지는 투자 권유가 아닌 참고자료다. 문구를 바꿀 때 이 성격을 유지한다.
````

### 7. 평일(화~금) 08:40 상품설명의무 스크립트 갱신

- cron: `40 23 * * 1-4` (UTC)
- 고정 창: `session_01VCJsx5t4b9gVHeJHDNoCqg`
- 모델 지정: `(계정 기본값)`

````text
[평일 화~금 08:40 KST 자동 갱신] 상품설명의무 완전판매 스크립트의 상품·투자설명서 데이터를 오늘 값으로 갱신할 시각입니다. (월요일은 별도 예약이 맡습니다.)

■ 이 예약이 특히 지켜보는 것 — **ELS 신규 회차**
사용자가 「신규 회차 올라오면 알려줘」 라고 했습니다. 관측해 보니 회차는 주 단위가 아니라 열흘쯤 가고 다음 묶음은 주중에 올라옵니다(2026-09-07 시작분은 09-16 마감). 그래서 **새 회차가 잡힌 날이 이 예약의 본론**입니다.

■ 할 일
1) `weekly-refresh.yml` 을 브랜치 `claude/els-fund-disclosure-i6wtii` 에서 발동 (mcp__github__actions_run_trigger · method=run_workflow · owner=hanaroline · repo=work_1). 이름은 「월요일 일괄 갱신」 이지만 평일에도 쓰는 같은 체인입니다.
2) 끝날 때까지 3~5분 간격으로 지켜봅니다(list_workflow_runs). 보통 8분입니다.
3) 갱신 **전·후 상품 목록을 비교**하십시오. 건수만 보면 안 됩니다 — 들어온 회차와 빠진 회차가 같은 수면 건수는 그대로입니다. 실행 전에 `data/els.js` 의 상품 이름 목록을 받아 두고(git fetch 후 읽기), 실행 뒤 다시 읽어 이름으로 대조하십시오.

■ 보고
- **새 회차가 들어왔으면** — 이것이 본론입니다. `PushNotification` 으로 먼저 알린 뒤(예: 「ELS 신규 5회차: 38115~38119, 청약마감 09-25」 · 200자 이내 한 줄), 대화에는 회차 번호 · 기초자산 · 청약마감일 · 만기를 표로 적으십시오.
- **빠진 회차가 있으면** 회차 번호와 청약마감일을 한 줄로 적으십시오(마감돼 빠진 것이 정상입니다).
- **아무 변화 없으면** 한 줄로: 「갱신 완료 · 실질 변화 없음」. 커밋이 생겼다고 갱신됐다고 말하면 안 됩니다 — 데이터 파일의 변경이 updatedAt 뿐인 경우가 흔합니다. 이때는 PushNotification 을 보내지 마십시오.
- **실패한 단계가 있으면** 그 잡 로그를 읽어 원인을 요약하고, **그 데이터가 어제 값으로 남는다**는 사실을 분명히 적으십시오.
- ⑤ 펀드 설명서 판독이 「판독 규칙이 바뀌었습니다」 로 멈췄다면 정상적인 안전장치입니다 — 사람이 Actions 탭에서 fund-prospectus.yml 을 mode=full 로 돌려야 한다고(약 3시간) 알리십시오.

하지 말 것: 코드 수정, 다른 브랜치로의 push, PR 생성. 이 예약은 발동과 보고만 합니다.
(main 에 병합된 뒤에는 워크플로의 매일 예약이 스스로 도므로 이 예약은 지워야 합니다 — 두면 하루에 두 번 돕니다. 다만 「신규 회차 알림」 은 이 예약에만 있으니, 지우기 전에 사용자에게 물어보십시오.)
````

### 8. 월요일 08:40 상품설명의무 스크립트 자동 갱신

- cron: `40 23 * * 0` (UTC)
- 고정 창: `session_01VCJsx5t4b9gVHeJHDNoCqg`
- 모델 지정: `(계정 기본값)`

````text
[매주 월요일 08:40 KST 자동 갱신] 상품설명의무 완전판매 스크립트의 상품·투자설명서 데이터를 이번 주 값으로 갱신할 시각입니다.

■ 이 예약이 특히 지켜보는 것 — **ELS 신규 회차**
사용자가 「신규 회차 올라오면 알려줘」 라고 했습니다. 관측해 보니 회차는 주 단위가 아니라 열흘쯤 가고 다음 묶음은 주중에 올라옵니다(2026-09-07 시작분은 09-16 마감). 월요일에 새 회차가 없는 것은 이상한 일이 아닙니다.

■ 할 일
1) `weekly-refresh.yml` 을 브랜치 `claude/els-fund-disclosure-i6wtii` 에서 발동 (mcp__github__actions_run_trigger · method=run_workflow · owner=hanaroline · repo=work_1).
2) 끝날 때까지 3~5분 간격으로 지켜봅니다(list_workflow_runs). 보통 8분입니다.
3) 갱신 **전·후 상품 목록을 이름으로 대조**하십시오. 건수만 보면 안 됩니다 — 들어온 회차와 빠진 회차가 같은 수면 건수는 그대로입니다. 실행 전에 `data/els.js` 의 상품 이름 목록을 받아 두고(git fetch 후 읽기), 실행 뒤 다시 읽어 비교하십시오.

■ 보고
- **새 회차가 들어왔으면** — `PushNotification` 으로 먼저 알린 뒤(예: 「ELS 신규 5회차: 38115~38119, 청약마감 09-25」 · 200자 이내 한 줄), 대화에는 회차 번호 · 기초자산 · 청약마감일 · 만기를 표로 적으십시오.
- **빠진 회차가 있으면** 회차 번호와 청약마감일을 한 줄로 (마감돼 빠진 것이 정상입니다).
- **아무 변화 없으면** 한 줄로: 「갱신 완료 · 실질 변화 없음」. 커밋이 생겼다고 갱신됐다고 말하면 안 됩니다 — 데이터 파일의 변경이 updatedAt 뿐인 경우가 흔합니다. 이때는 PushNotification 을 보내지 마십시오.
- **실패한 단계가 있으면** 그 잡 로그를 읽어 원인을 요약하고, **그 데이터가 지난주 값으로 남는다**는 사실을 분명히 적으십시오.
- ⑤ 펀드 설명서 판독이 「판독 규칙이 바뀌었습니다」 로 멈췄다면 정상적인 안전장치입니다 — 사람이 Actions 탭에서 fund-prospectus.yml 을 mode=full 로 돌려야 한다고(약 3시간) 알리십시오.

하지 말 것: 코드 수정, 다른 브랜치로의 push, PR 생성. 이 예약은 발동과 보고만 합니다.
(main 에 병합된 뒤에는 워크플로의 schedule 이 스스로 도므로 이 예약은 지워야 합니다 — 두면 월요일에 두 번 돕니다. 다만 「신규 회차 알림」 은 예약에만 있으니, 지우기 전에 사용자에게 물어보십시오.)
````

### 9. 펀드 원천 반영 재갱신 (월요일 15:30 KST)

- cron: `30 6 * * 1` (UTC)
- 고정 창: `session_01VCJsx5t4b9gVHeJHDNoCqg`
- 모델 지정: `(계정 기본값)`

````text
[월요일 15:30 KST · 펀드 원천 반영 재갱신]

■ 왜 있는 예약인가
월요일 08:40 KST 일괄 갱신은 펀드 카탈로그를 `claude/fund-search-tool` 의
`data/fund.js` 에서 만든다. 그런데 그 원천을 새로 받는 판(main 의 fund-weekly.yml
→ 가지의 fund-daily.yml)은 **월요일 10:00 KST 이후**에 돈다. 그래서 아침 갱신 때는
펀드 목록이 늘 지난주 값이고, 화요일 아침에야 따라잡혔다.
이 예약은 그 하루 지연을 없앤다. 원천이 들어온 뒤 같은 날 오후에 한 번 더 돌린다.

■ ★ 원천 갱신 판정은 반드시 data/fund.js 의 **내용**으로 한다 ★

2026-09-28 에 이걸로 틀릴 뻔했다. 그날 브랜치 마지막 커밋은 06:41 UTC 로 새것이었지만,
그 커밋(d7fe0cd)은 `tools/discovery/` 의 재검증 보고서만 건드렸고 **data/fund.js 는
블롭 해시가 그대로**였다(971d9bf…, 09-21 수집분). 「브랜치 커밋 날짜」 로 판정하면
헛되이 전체 사슬(10~16분)을 돌린다. 날짜가 아니라 블롭을 본다.

1) 판정 :

     cd /home/user/work_1
     git fetch origin claude/fund-search-tool claude/els-fund-disclosure-i6wtii
     # 카탈로그가 지금 담고 있는 원천과, 원천 브랜치의 현재 data/fund.js 를 견준다
     git rev-parse origin/claude/fund-search-tool:data/fund.js
     # 지난 판정값과 견주려면 data/fund-catalog.js 의 updatedAt 도 함께 본다
     git show origin/claude/els-fund-disclosure-i6wtii:data/fund-catalog.js | head -c 400

   - **data/fund.js 블롭이 카탈로그를 만들 때 쓰인 것과 같으면** 원천이 안 들어온 것이다.
     갱신을 돌리지 말고(돌려 봐야 아침과 같은 값이다) 한 줄만 보고한다 :
     「펀드 원천 data/fund.js 가 그대로(블롭 ○○) · 재갱신 건너뜀」.
     그리고 **그날 17:30 KST 에 한 번만 더 보도록 send_later 로 재확인을 잡는다.**
   - 블롭이 바뀌었으면 2) 로 간다.

2) **수집이 실패해서 안 들어온 것인지도 함께 본다.** 이게 흔한 까닭이다.
   fund-weekly.yml(main) · fund-daily.yml(가지)의 그날 실행을 list_workflow_runs 로 보고,
   실패했으면 get_job_logs 로 까닭을 읽어 **한 줄로 알린다**. 조용히 넘기지 말 것.
   2026-09-28 사례 : 수집 자체는 3,200개 성공·단위시험 26/26 통과였는데,
   `audit_fund_data.mjs` 감사가 오류 1건으로 전체를 끊었다 —
   「보유비중-합초과 KR5223AE0551 KB그린성장포커스 65종목 합 104.26% (한도 101%)」.
   한 펀드 때문에 3,200개가 통째로 막히는 구조다. 같은 꼴이면 다시 돌려도 똑같이 실패하니
   **재확인을 잡지 말고** 사람이 손대야 한다고 알린다.
   그 고침은 `claude/fund-search-tool` 에 있고 우리는 그 브랜치에 push 하지 않는다 —
   따로 허락을 받아야 한다.

3) 원천이 실제로 바뀌었으면 실행 전 값을 기록한다 — **표준코드로 대조**해야 한다.

     B=origin/claude/els-fund-disclosure-i6wtii
     git show $B:data/els.js            > <스크래치>/b-els.js
     git show $B:data/fund-catalog.js   > <스크래치>/b-cat.js
     git show $B:data/fund-prospectus.js> <스크래치>/b-pros.js
     git show $B:data/fund-doc-pages.js > <스크래치>/b-pages.js

4) `weekly-refresh.yml` 을 브랜치 `claude/els-fund-disclosure-i6wtii` 에서 발동한다
   (mcp__github__actions_run_trigger · method=run_workflow · owner=hanaroline · repo=work_1).
   10~16분 걸린다. list_workflow_runs 로 완료를 확인한다.

5) 끝나면 <스크래치>/diff922.mjs 로 전·후를 맞댄다(a-*.js 를 새로 받아 두고 돌린다).
   ★ 늘어난 것과 줄어든 것을 함께 셀 것 ★ 이것이 이 작업의 규율이다.

6) 검산 — 제2부 · 본문이 제2부보다 앞 0 · 절 차례 0 · 앞머리 차례 0 · 쪽수 초과 0 ·
   **자리를 잃은 종목 0** · 일곱 자리 평균. 지문은 113364-14inyc1 이어야 한다.
   **자리를 잃었거나 설명 안 되는 값이 나오면 아무것도 올리지 말고 그 사실부터 보고한다.**
   빠진 종목이 카탈로그에서 청산·제외된 그 펀드들과 일치하면 정상이다 — 확인해서 밝힌다.

■ 보고
- **펀드에 실제 변화가 있으면** 신규·청산 펀드를 이름으로 적고(많으면 앞 20건 + 「외 N건」),
  펀드명 변경·위험등급 변경이 있으면 따로 짚는다. 쪽 지도 증감과 그 까닭
  (설명서 문서번호 재발급 등)도 확인해서 적는다. 배포판·테스트판을 SendUserFile 로 올린다.
- **원천은 바뀌었는데 카탈로그가 그대로면** 그 사실을 한 줄로 적고 까닭을 확인한다.
- **실패한 단계가 있으면** 잡 로그를 읽어 까닭을 요약하고, 그 데이터가 아침 값으로
  남는다는 사실을 분명히 적는다.
- 카탈로그의 mgr·fundType·region·riskLabel·objective·cls 가 수천 건 「바뀜」 으로 나오는 것은
  문구 풀을 다시 만들며 색인 번호가 밀린 것이다 — 실제 변화가 아니니 그렇게 보고하지 말 것.

■ 하지 말 것
코드 수정 · `claude/els-fund-disclosure-i6wtii` 아닌 브랜치로의 push · PR 생성.
원천이 안 바뀌었는데 갱신을 돌리는 일.
같은 까닭으로 계속 실패하는 판에 재확인을 거듭 잡는 일.
````

### 10. 미국 100대 기업 — 주간 목록 자동 교체

- cron: `0 23 * * 0` (UTC)
- 고정 창: `없음 (매번 새 세션)`
- 모델 지정: `(계정 기본값)`

````text
저장소 hanaroline/work_1 의 주간 작업입니다. 미국 100대 기업 화면(us-top100.html)의 대상 목록을 지금 시가총액 상위 100에 맞춰 갈아 끼웁니다. 바꿀 것이 없으면 아무것도 하지 않고 끝냅니다(빈 커밋·알림 금지).

이 세션에는 GitHub MCP 도구가 없습니다. 모든 확인은 git 명령으로 합니다.

1) 준비
   - `git fetch origin main && git checkout main && git pull --ff-only origin main`
   - 최신 점검 결과:
     `git fetch --quiet origin "+refs/heads/us100-data:refs/remotes/origin/us100-data"`
     `mkdir -p data/us100 && git show origin/us100-data:data/us100/ranking.json > data/us100/ranking.json`
   - ranking.json 의 builtAt 이 사흘 넘게 낡았으면 `data/us100/RANK_REFRESH` 를 한 줄 고쳐 push 해 점검을 먼저 돌리고, 3분쯤 뒤 다시 받으십시오.

2) 후보 확인
   - `python scripts/us100_list_tool.py report`
   - "이번 주에 바꿀 것이 없다" 면 여기서 끝냅니다. 커밋하지 말고, 사용자에게 알리지도 마십시오.
   - "후보를 하나도 확인하지 못했다"(야후에 못 나감)면 교체하지 말고 그 사실만 한 줄로 보고하고 끝냅니다. 확인 없이 목록을 바꾸면 안 됩니다.

3) 한글 자산 쓰기 — 이 작업의 핵심입니다
   편입할 종목마다 아래를 직접 씁니다. us-top100.html 의 기존 PROFILE_KO 항목을 여러 개 먼저 읽고 같은 말투·길이·구체성으로 맞추십시오. 영문 요약을 그대로 옮기지 마십시오.
   - ko: 한글 기업명. 국내에서 통용되는 표기(램리서치, 어플라이드 머티리얼즈, 크라우드스트라이크처럼). 통용 표기가 없으면 영문명을 그대로 둡니다 — 어색한 음차보다 낫습니다.
   - sector: us-top100.html 의 SECTORS 맵에 있는 코드(it, comm, cd, cs, hc, fin, ind, eng, mat, util, re).
   - keywords: 검색용 한글 낱말 몇 개.
   - foreign: 본사가 미국이 아니면 ["한글 국가명","English"], 아니면 null.
   - profile: [주력사업 한 줄, 개요 서너 문장(150~350자), 키워드 나열] 세 줄. 개요에는 매출 구조·경쟁력·실적을 좌우하는 변수를 담습니다. 데이터 브랜치의 latest.json 에 있는 profile.desc(영문 요약)와 회사의 공개 정보에 근거해 쓰고, 확신 없는 수치는 쓰지 마십시오.

4) 반영
   - plan.json 을 만들고 `python scripts/us100_list_tool.py apply --plan plan.json`
   - 도구가 거부하면 사유를 고쳐 다시 시도하십시오. 도구를 우회해 파일을 직접 고치지 마십시오.
   - `data/us100/REFRESH` 에 오늘 날짜 한 줄을 적습니다 — 이 파일이 push 되면 전체 수집 워크플로가 곧바로 한 번 더 돕니다(세션 토큰으로는 workflow_dispatch 가 403 이라 push 로 부릅니다).

5) 올리기
   - 브랜치 `claude/us100-weekly-list` 에 커밋하고 `git push -u origin claude/us100-weekly-list`,
     그 다음 main 을 그 브랜치로 fast-forward 해 push 합니다(이 저장소의 기존 방식입니다).
   - 커밋 메시지는 한국어로, 무엇을 넣고 뺐는지와 각 종목의 현재 순위·근거를 적고 끝에
     Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

6) 수집 확인 (git 으로만)
   - push 뒤 8~12분 기다렸다가
     `git fetch --quiet origin "+refs/heads/us100-data:refs/remotes/origin/us100-data"`
     `git show origin/us100-data:data/us100/latest.json` 에서 새 종목이 companies 에 들어왔는지,
     가격·시총·차트가 채워졌는지 확인합니다.
   - 들어오지 않았으면 그 종목을 되돌리는 편이 낫습니다(같은 도구로 반대 방향 plan 을 적용).

7) 보고
   - 사용자에게 한국어로 짧게: 넣은 종목·뺀 종목·순위, 새 판 번호(var BUILD), 수집 확인 결과.
   - 바꾼 것이 없으면 보고하지 마십시오.

규칙
   - 안전장치(100위/130위/최대 3종목/TSM·ASML 보호/시세 확인)는 사람이 바꾸라고 하기 전까지 그대로 둡니다.
   - 목록은 언제나 정확히 100개여야 합니다.
   - 검사를 통과하지 못한 결과는 절대 push 하지 마십시오.
````

### 11. 세션 산출물 자료실 자동 갱신 (월·목)

- cron: `0 23 * * 0,3` (UTC)
- 고정 창: `session_01CrrJp8ryCeMx9e3uFSNoUp`
- 모델 지정: `(계정 기본값)`

````text
세션 산출물 자료실을 갱신할 차례입니다. 지난번과 같은 기준으로 진행하세요.

먼저 확인 — 이 실행에 `Artifact` 도구가 있습니까? 없으면 게시가 불가능하므로, 새 산출물 목록과 무엇을 게시해야 하는지만 정리해 보고하고 「Artifact 도구가 없어 게시하지 못했습니다」를 명시하십시오. 조용히 건너뛰지 마십시오.

작업 순서
1. `git fetch origin --prune` 후 모든 원격 브랜치의 최종 산출물을 다시 훑습니다. `mcp__Claude_Code_Remote__list_sessions`(mine=true)로 새 세션도 확인합니다.
2. 저장소의 `docs/session-artifacts/README.md`(세션↔아티팩트 대응표)와 `Artifact` `action:"list"` 결과를 대조해, 지난번 이후 **새로 생긴 산출물**과 **최종본이 갱신된 산출물**만 골라냅니다. 중간 판·실험본은 넣지 않습니다.
3. 게시 전에 각 파일 내용을 반드시 확인합니다(가시 텍스트·외부 요청 URL·자격정보 패턴 점검). 자체 완결이 아닌 파일은 standalone 판을 씁니다.
4. HTML 산출물은 파일을 그대로 게시합니다. PPTX·MP4 등은 `docs/session-artifacts/tools/` 의 `build_decks.py`·`build_videos.py` 방식으로 미리보기 + 원본 내려받기 페이지를 만듭니다(`capabilities: {"downloads": true}`).
5. 이미 아티팩트가 있고 파일이 그보다 새롭지 않으면 다시 올리지 않고 링크만 씁니다. 같은 산출물의 새 판이면 같은 아티팩트 URL 에 `url` 파라미터로 덮어씁니다.
6. 색인 아티팩트를 갱신합니다 — https://claude.ai/code/artifact/fa511243-84ca-461c-9e58-e373d851e6fa 를 `url` 로 넘겨 같은 링크를 유지하고, `build_hub.py` 의 GROUPS 에 새 항목을 넣어 다시 만듭니다. 주제 분류·한/영 토글·미래에셋 디자인 기준(mas-design)을 그대로 유지합니다.
7. `make_index_md.py` 로 `docs/session-artifacts/README.md` 를 다시 만들고, 브랜치 `claude/organize-session-artifacts-fbg82m` 에 커밋·푸시합니다. PR 은 만들지 않습니다.
8. 마지막에 무엇이 새로 올라갔고 무엇이 그대로인지 짧게 보고합니다. 새 산출물이 없으면 「변화 없음」 한 줄로 끝냅니다.

주의 — 아티팩트는 비공개가 기본입니다. 공유 설정을 임의로 바꾸지 마세요. 실시간 시세 화면은 아티팩트에서 외부 요청이 막히는 한계를 설명에 유지합니다. 생성기 스크립트는 저장소에 있으니 기억에 의존하지 말고 그것을 읽고 쓰십시오.
````

### 12. 다음 월요일(10/5) 주간 수집이 몇 시에 닿았나

- cron: `—` (UTC) · 1회 실행: `2026-10-05T02:30:00Z`
- 고정 창: `session_01E2iCnG33WUWGjNT4bbZxQa`
- 모델 지정: `(계정 기본값)`

````text
고친 가드로 맞는 첫 월요일(2026-10-05)이다. 지난주(9/28)에는 가드가 자기가 만든 빈 판을 「이미 돌았다」로 세어 그 주 수집이 통째로 비었고, 실행 기록 대신 main 의 data/calendar/latest.json 커밋 시각을 보도록 고쳤다. 그 고침이 실제 월요일에 통했는지 확인할 차례다.

확인할 것:
1. calendar-data.yml 의 오늘(월) 첫 **일한** 판 — 건너뛴 빈 판이 아니라 12단계가 다 돈 판이다. run_started_at 을 KST 로 환산해 10:00 과의 차이를 낸다. event 와, workflow_run 이면 어느 상류가 깨웠는지까지 본다.
2. 오늘 불렸지만 건너뛴 빈 판이 몇 개이고, 10:00 뒤에 불린 빈 판의 가드 로그가 「이번 주 갱신이 이미 끝났다 (latest.json …)」인지 — 새 잣대로 건너뛰는 것이 맞는지. 10:00 전 판은 「아직 월요일 10:00 KST 전이다」여야 한다.
3. main 에 `증시 일정 수집 …` 커밋이 오늘 남았는지.
4. 고정 주소 https://raw.githubusercontent.com/hanaroline/work_1/calendar-data/data/calendar/market-calendar-offline.html 를 받아 builtAt·일정 건수·바이트 확인.
5. 9/14 14:38 · 9/21 14:46 · 9/28 11:35(그것도 내가 손으로 밀어서 돈 것) 과 견주어 한 줄 정리.

오늘도 10:00 을 한참 지나 수집이 안 됐으면 그 사실을 그대로 알리고 원인을 파고든다. 없는 것을 있다고 하지 않는다.
````

---

## 꺼 둔 예약 7개 — 되살리지 마십시오

이름 앞에 `[폐기]` 가 붙은 것은 현행판으로 대체된 구판입니다. 새 계정에서 다시 만들 필요가
없습니다. 기록용으로 이름만 남깁니다.

- 증권사 리포트 아침 배포 (평일 09:25 KST · 이 대화로 전달) — `25 0 * * 1-5`
- [폐기] 장마감 구판 (매번 새 창) — 전용 창판 trig_01N4E… 로 대체됨 — `10 7 * * 1-5`
- [폐기] 모닝 브리핑 구판 (07:30) — 현행판 trig_01Bmr… 로 대체됨 — `30 22 * * *`
- [폐기] ELS 안내페이지 중복 예약 A — 현행판 trig_017oq… 로 대체됨 — `0 23 * * 0`
- [폐기] ELS 안내페이지 중복 예약 B — 현행판 trig_017oq… 로 대체됨 — `0 23 * * 0`
- [폐기] 아침 증시시황 브리핑 구판 (07:40) — market-briefing 스킬 시절 — `40 22 * * 0-4`
- [폐기] 아침 브리핑 최초판 (07:00, Gmail 초안) — 파이프라인 이전 — `0 22 * * 0-4`

