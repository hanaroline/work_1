# work_1 — 완전판매 스크립트 자동완성

이 브랜치(`claude/sales-script`)는 미래에셋증권 지점 직원이
미스터리쇼핑에 대응할 때 쓰는 **완전판매 스크립트 자동완성기**를 만듭니다.

## 시작하기 전에 가지부터 확인하십시오

이 저장소는 일거리가 여럿이고, 세션 컨테이너가 **다른 이력을 체크아웃해 오는 일이 있습니다.**

```bash
git branch --show-current     # claude/sales-script 여야 합니다
ls sales-script-standalone-v4.html
```

v4 파일이 안 보이면 가지가 틀린 것입니다:

```bash
git fetch origin claude/sales-script && git checkout claude/sales-script
```

> 옛 이름 `claude/complete-sales-script-automation-cjsx8e` 는 다른 작업과 섞여 쓰여
> 2026-10-02 에 여기로 옮겼습니다. 그 이름으로는 작업하지 마십시오.

## 먼저 읽을 것

새 대화를 시작하면 **아래 세 문서를 먼저 읽고** 맥락을 잡으십시오. 그 전에는 코드를 고치지 마십시오.

- `docs/handover/01-인수인계.md` — 핵심 맥락 · 자료 구조 · 쌓아 온 판단 · 함정
- `docs/handover/02-자주-쓰는-프롬프트.txt` — 자주 쓰는 요청문
- `docs/handover/03-환경과-시스템설정.txt` — 저장소 · 네트워크 · 워크플로 · 도구

## 지켜야 할 규칙

- 개발·커밋·푸시는 **`claude/sales-script`** 브랜치에만.
- `git push -u origin <브랜치>`. **네트워크 오류일 때만** 2s·4s·8s·16s 로 4회 재시도.
  정책 거절(403 등)은 재시도하지 않습니다.
- **PR 은 명시적으로 요청받았을 때만** 만듭니다.
- 커밋 메시지·PR·코드 주석 등 **저장소에 올라가는 어떤 것에도 모델 이름을 넣지 않습니다.**
- **기존 작업분은 그대로 둡니다** — `sales-script-standalone.html` / `-v2` / `-v3` 은
  얼린 판이라 건드리지 않습니다. 현재 작업본은 **`-v4`** 입니다.
- 빌드는 **반드시 파일명을 주어서** 합니다 (안 주면 v1 을 덮어씁니다):

  ```bash
  node scripts/build_sales_script.mjs sales-script-standalone-v4.html
  ```

- 설명은 한국어로. 안 된 것은 안 됐다고 그대로 말합니다.

## 바꾼 뒤에는 반드시 검증

```bash
node tools/verify/audit-stored.mjs    # 저장된 값 자체 — 다섯 관문 모두 0건
node tools/verify/irp-dist.mjs        # IRP 총보수 출처 분포
node tools/verify/reg.mjs             # 8시트 · 외부 요청 0건
node tools/verify/missall2.mjs        # 확인필요 건수 정합
node tools/verify/prof5.mjs           # 투자자성향 원문
node tools/verify/elb-fix.mjs         # ELB/ELS 문구 갈림
node tools/verify/kofia-check.mjs     # 금투협 원천이 메운 양
node tools/verify/feeguard.mjs        # 보수율 가드
```

통과 기준은 `tools/verify/README.md` 에 적어 두었습니다.

## 자주 틀리는 곳

- `data/*.js` 를 `new Function` 으로 읽을 때 **`globalThis` 가 아니라 `window`** 에 붙습니다.
- `fund-catalog.js` 의 `clsPExp`/`clsAExp`/`clsCExp`/`clsExp` 는 **풀 색인이 아니라 그냥 숫자**입니다.
- 전량 재판독은 **2시간 반 이상** 걸립니다. 규칙을 다듬는 중이면 `fund-prospectus-sample.yml` 로 먼저.
- 원천 사이트(DART·금투협·판매회사)는 이 컨테이너에서 **막혀 있습니다.** 수집·판독은 GitHub Actions
  러너에서 하고, 결과는 `mcp__github__get_job_logs` 로 읽습니다(아티팩트 내려받기는 막힘).
- 확인필요 칩은 **제 이름표를 글자로 내보냅니다.** `innerText` 만 긁으면 이름표가 값처럼 읽힙니다.
