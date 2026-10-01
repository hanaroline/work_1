# 예약 프롬프트 · 시스템 설정 보관본

**2026-10-01 기준.** 계정을 옮길 때 **예약(Routine)은 넘어가지 않습니다.**
새 계정에서 이 파일의 프롬프트를 **글자 그대로** 넣어 다시 만드십시오.
요약하거나 줄이면 그만큼 품질이 떨어집니다 — 이 프롬프트들은 사고가
날 때마다 한 줄씩 덧붙여 다듬어 온 것입니다.

---

## 1. 살아 있는 예약

> **2026-10-01 정정.** 이 문서는 오래도록 「살아 있는 예약 **세 개**」라고 적고
> 있었지만, 계정을 실제로 조회해 보니 **켜진 예약이 11개**였습니다. 아래 셋은
> 브리핑·ELS 쪽만 추린 것입니다. **전체 목록과 11개의 지시문 전문은
> [`docs/handover/예약-지시문-전체백업.txt`](handover/예약-지시문-전체백업.txt)
> 에 있습니다. 계정을 옮길 때는 그 파일을 쓰십시오.**

| 예약 이름 | 주기 (KST) | 하는 일 | 받는 곳 |
|---|---|---|---|
| 마포WM 모닝 브리핑 — 현행 | **매일** 07:30 | 거래일이면 모닝 판, 주말·휴장일이면 해외 판 | **모닝 전용 창** |
| 마포WM 장마감 시황 브리핑 — 전용 창 | 평일 16:10 | 장마감 판 | **장마감 전용 창** |
| ELS 상품 구조 페이지 주간 갱신 — 현행 | 월 08:00 | `data/els.js` 재수집 | 새 세션 |

### 창을 갈라 쓰는 이유 (중요)

모닝과 장마감은 **서로 다른 고정 창**으로 들어옵니다.

- 한 창에 몰면 하루에 두 번 긴 작업이 쌓여 맥락이 뒤섞입니다.
- 장마감은 원래 **매번 새 창**을 만들어 돌았는데 **그게 잘못이었습니다** —
  8/20 16:10 실행분이 산출물을 남기지 못했는데, 사용자는 그 창을 열어 볼
  일이 없으니 **아무 일도 없었던 것처럼 보였습니다.**

> **주의.** `update_trigger` 로는 창을 바꿀 수 없습니다 —
> `persistent_session_id` 항목이 없어 조용히 무시됩니다(이름만 바뀝니다).
> 창을 옮기려면 `create_trigger` 로 **새로 만들고** 옛 것을 끄십시오.
> **프롬프트만 바꿀 때는** 삭제하지 말고 `update_trigger` 로 그 예약의
> 프롬프트만 바꾸십시오 — 실행 이력이 남고 사본이 늘지 않습니다.

---

## 2. 모닝 브리핑 예약 — 프롬프트 원문

**주기:** `CRON_TZ=Asia/Seoul 30 7 * * *` (매일 07:30 KST)
**대상:** 모닝 전용 창 (`persistent_session_id`)

```text
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
```

---

## 3. 장마감 브리핑 예약

**주기:** `CRON_TZ=Asia/Seoul 10 16 * * 1-5` (평일 16:10 KST)
**대상:** 장마감 전용 창

> **2026-10-01 정정 — 아래 「모닝과 같은 뼈대」 설명은 낡았습니다.**
> 실제 지시문은 2026-09-18 에 크게 늘었습니다: **3단계 중간 저장**
> (`save_progress.sh` ①서술 ②본문 ③발행 뒤), **핵심본이 기본이고 전체 판이
> 보관본**, `SESSION_FLOOR` 를 쓰는 신선도 검사, 마감 직후 수급이 잠정치라는 것,
> 저녁 수집분으로 갈아 끼우지 말 것 등. 아래 설명대로 복원하면 그 개선이
> 전부 사라집니다.
> **[`docs/handover/예약-지시문-전체백업.txt`](handover/예약-지시문-전체백업.txt)
> §2 의 전문을 쓰십시오.**

(아래는 구조를 이해하기 위한 참고입니다.) 프롬프트는 **2절과 같은 뼈대**이고
다음이 다릅니다.

- 첫 줄: 「오늘 아침 … 07:30 KST 입니다」 → **「오늘 장마감 … 지금은 16:10 KST 입니다」**
- 2번: `--kind close` (`<날짜>-close.html`). **국내 장이 열리지 않았으면**
  정리할 「오늘 장」이 없으므로 **그 사실만 보고하고 종료**합니다
  (모닝과 다릅니다 — 모닝은 휴장일에도 해외 판을 냅니다)
- 3번: `check_market_fresh.py close`
- 5번: 서술 파일 이름 `narrative-<날짜>-close.json`
- 마감 시각 제한(08:10) 없음
- 10번 label: `MM-DD · 장마감`

---

## 4. 시스템 설정 — 저장소에 들어 있습니다

### `.claude/settings.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

### `.claude/hooks/session-start.sh` — 하는 일

세션이 시작할 때 **playwright 1.56.1** 을 깝니다. 이 저장소는
`package.json` 을 `.gitignore` 로 빼기 때문에, 새 세션의 작업본에는
그것이 **없고** `node_modules` 도 없습니다. 화면 검사·수집·PDF 만들기가
전부 playwright 를 부르므로 미리 깔아 둡니다.

- **브라우저는 내려받지 않습니다** — 이 환경에 크로미움이 미리 있습니다
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). `playwright install` 을
  다시 부르면 수백 MB 를 세션 몫 디스크에 또 쌓습니다
- 러너 워크플로와 **같은 판(1.56.1)** 을 씁니다. 다르면 세션에서 통과한
  시험이 러너에서 깨집니다
- 웹 세션(`CLAUDE_CODE_REMOTE=true`)에서만 돕니다

### `.gitignore` 핵심

```
out/
node_modules/
package-lock.json
package.json
/discovery/
collect-debug/
__pycache__/
*.pyc
```

> `out/` 이 빠져 있다는 뜻은 **완성 파일(HTML·PDF)은 저장소에 없다**는
> 것입니다. 저장소에 남는 것은 `docs/briefings/*.html`(아티팩트 본문)이고,
> 배포용 단독 파일은 `scripts/make_standalone.py` 로 **언제든 다시 만듭니다.**

---

## 5. 시세 수집 워크플로 (`.github/workflows/market-data.yml`)

세션이 사내 이그레스 정책 때문에 KRX·네이버·야후에 **직접 붙지 못하므로**,
GitHub 러너가 대신 받아 `data/market/latest.json` 에 커밋합니다.

**예약은 제때 돌지 않습니다** — 8/10 15:40 예약이 **17:15** 에야 만들어졌고
(95분 지연) 같은 날 06:40 예약도 07:01 에 돌았습니다. 그래서

1. 한 판마다 예약을 **두 번씩** 걸어 한 번이 늦어도 다른 하나를 받고
2. 브리핑 루틴은 **예약을 믿지 않고** `check_market_fresh.py` 로 파일
   날짜를 직접 확인한 뒤, 낡았으면 워크플로를 **직접 발동**합니다

```bash
bash scripts/request_market_refresh.sh        # data/market/REFRESH 를 main 에 밀어 발동
python3 scripts/check_market_fresh.py --wait morning
```

**`workflow_dispatch` 를 API 로 부르지 마십시오 — 403 입니다.**

---

## 6. 새 계정에서 예약을 다시 만들 때 확인할 것

- [ ] 모닝 예약을 **전용 창**에 붙였는가 (`persistent_session_id`)
- [ ] 장마감 예약을 **또 다른 전용 창**에 붙였는가
- [ ] 두 프롬프트를 **글자 그대로** 넣었는가 (요약하지 않았는가)
- [ ] cron 에 `CRON_TZ=Asia/Seoul` 을 붙였는가
- [ ] 모닝은 **매일**(`* * *`), 장마감은 **평일만**(`1-5`)
- [ ] 첫 실행이 끝까지(지침 0→12) 도는지 하루치로 확인했는가
