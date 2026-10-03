# 완전판매 스크립트 검증 도구

완성본(`sales-script-standalone-v4.html`)과 그 재료가 되는 판독 결과를 훑는 검사 묶음입니다.
원래는 세션 scratchpad 에만 있었는데, 컨테이너가 회수되면 사라지므로 저장소로 옮겼습니다.

## 돌리는 법

```bash
# 저장된 자료만 본다 — 브라우저가 필요 없다
node tools/verify/audit-stored.mjs
node tools/verify/irp-dist.mjs

# 완성본을 실제로 열어서 본다 — playwright + 미리 깔린 크로미움
node tools/verify/reg.mjs
node tools/verify/missall2.mjs
node tools/verify/prof5.mjs
node tools/verify/elb-fix.mjs
node tools/verify/kofia-check.mjs
node tools/verify/feeguard.mjs
```

브라우저 검사는 첫 번째 인자로 다른 파일을 받습니다:

```bash
node tools/verify/reg.mjs /home/user/work_1/sales-script-standalone-v3.html
```

주지 않으면 저장소 뿌리의 `sales-script-standalone-v4.html` 을 봅니다
(`_browser.mjs` 의 `TARGET`).

## 무엇을 보는가

| 도구 | 보는 것 |
|---|---|
| `audit-stored.mjs` | `data/fund-prospectus.js` **안의 값 자체**. 보수율 아닌 값, `clsPName` 오염(개인연금 섞임·「퇴직」 없음·숫자 칸 둘 이상), 위험 항목 앞 행번호 잔존 — 다섯 관문이 모두 0건이어야 한다 |
| `irp-dist.mjs` | IRP 총보수를 어디서 가져왔는지 카탈로그 전 종목의 분포 |
| `reg.mjs` | 8시트 상품 수·확인필요 건수·로드 시간·**외부 요청 0건** |
| `missall2.mjs` | 확인필요 배너 머리글 건수 = 묶음 합 = 칩 개수. 접힌 묶음 0 |
| `prof5.mjs` | 다섯 투자자성향의 **사내 원문** 일치와, 옛 문장이 저장된 화면의 이관 |
| `elb-fix.mjs` | ELB(원금지급형)와 ELS(고난도)의 문구가 갈리는지 |
| `kofia-check.mjs` | 금투협(두 번째 원천)이 메운 양 — v3 과 v4 를 견준다 |
| `feeguard.mjs` | 보수율 가드가 화면에서 도는지. 말도 안 되는 수치가 노출되지 않는지 |

## 통과 기준 (2026-10-03 실측)

```
로드 3.8초 · 페이지 오류 0 · 외부/실패 요청 0
시트 8개 — 펀드 1,502/1,502/1,682 · ELS 38/38 · 원화채권 100 · 외화채권 8 · IRP 3,184
확인필요    9 / 17 / 17 / 8 / 17 / 16 / 26 / 9
건수 어긋난 시트 0 · 접힌 묶음 0
어긋난 성향 0개 · 옛 문장 이관 OK
보수율 아닌 값 0건 · clsPName 오염 0/0/0 · 행번호 잔존 0건
IRP 출처 531 / 905 / 0 / 1,243 / 100 / 405
금투협 메움 BNK 13→4 · 삼성 11→1 · 다올 24→4 · 신한 11→4
```

**상품 수는 자료를 갱신할 때마다 움직입니다** (판매 종료·신규 설정). 품질 지표는
상품 수가 아니라 **확인필요 건수**입니다 — 그쪽이 그대로여야 합니다.

## 읽을 때 주의

**확인필요 칩은 제 이름표를 글자로 내보냅니다.** 그래서 `innerText` 만 긁으면 이름표가
값처럼 읽힙니다 — 예를 들어 `신영중기채권` 은 보수 자료가 어느 원천에도 없어 확인필요로
남는데, 화면 글자만 보면 「총보수는 연 **펀드 총보수 (연)**%」 처럼 보입니다.
값인지 칩인지는 `.v.miss` 의 `data-key` 로 가르십시오 (`feeguard.mjs` 가 그렇게 합니다).

**검사 도구도 틀릴 수 있습니다.** `prof5.mjs` 의 이관 검사는 한동안 저장통 키를
`/sales|script/i` 로 찾고 있어서 실제 키(`ss_state_v1`)를 영영 못 찾았고, 아무것도 심지 못한 채
조용히 X 를 내고 있었습니다. 제품이 아니라 검사가 고장나 있던 경우입니다.
검사가 실패를 말하면 제품을 의심하기 전에 검사부터 한 번 보십시오.

## 경로를 박지 마십시오

`_browser.mjs` 가 크로미움 실행 파일(`/opt/pw-browsers/chromium-<판번호>/chrome-linux/chrome`)을
그때그때 찾습니다. 판번호는 컨테이너마다 다르므로 직접 적어 두면 다음 세션에서 깨집니다.
