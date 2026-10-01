# 계정을 옮길 때 — 무엇이 따라오고 무엇이 안 따라오나

Claude 유료 계정을 해지하고 새 계정으로 옮길 때의 점검표입니다.
2026-10-01 기준.

---

## 깃허브에 남아 **따라오는 것**

새 계정에서 이 저장소를 연결하기만 하면 그대로 있습니다.

- 소스 전체 — `etf.html`, `scripts/*`, `.github/workflows/*`
- 자료 — `data/etf.js` 등
- 완성 파일 — `etf-holdings-search.html`, `docs/etf-howto.pdf`
- **프롬프트** — `etf-prompt.txt`, `etf-prompt-simple.txt`, `etf-reproduce-prompt.md`
- **프로젝트 지침** — `CLAUDE.md` (세션 시작 때 자동으로 읽힙니다)
- **인수인계 문서** — `HANDOFF.md`
- 탐색 기록 — `tools/discovery/*.md`
- 커밋 메시지 전체 — 무엇을 왜 고쳤는지가 여기 다 적혀 있습니다

## 깃허브에 **없어서 안 따라오는 것**

| 항목 | 어떻게 되나 | 다시 해야 할 일 |
|---|---|---|
| **대화 기록** | 이 대화 자체는 계정에 묶여 있어 넘어가지 않습니다 | `HANDOFF.md` 로 대신합니다 |
| **Claude 기억(memory)** | 계정별입니다 | 필요하면 새로 쌓아야 합니다 |
| **환경 설정** | 네트워크 정책, 환경변수·비밀값, setup 스크립트 | 새 계정에서 다시 만듭니다(아래) |
| **깃허브 연동 권한** | 새 계정에서 다시 승인해야 합니다 | 설정 → 커넥터에서 GitHub 연결 |
| **커넥터·스킬·MCP 서버** | 계정 설정입니다 | 쓰던 것만 다시 켭니다 |
| **claude.ai 에 올린 아티팩트** | 옛 계정 소유입니다 | 필요하면 미리 내려받으십시오 |

### 새 계정에서 환경을 다시 만들 때 필요한 것

이 프로젝트는 **환경 비밀값이 없습니다.** 수집이 전부 GitHub Actions 에서
돌고, 네이버·야후는 키가 필요 없기 때문입니다. 그래서 다시 만들 것은
사실상 **저장소 연결 하나**입니다.

다만 Actions 쪽은 확인하십시오.

- `.github/workflows/etf-daily.yml` 은 `permissions: contents: write` 로
  저장소에 직접 커밋합니다. 별도 토큰을 쓰지 않습니다.
- 예약(cron)은 **기본 브랜치에서만** 돕니다. 작업 브랜치에 있는 동안은
  push 할 때만 돌았습니다.

## 옮기는 순서

1. **(옛 계정에서)** 이 저장소에 전부 커밋·푸시되어 있는지 확인
   ```bash
   git status --short     # 비어 있어야 함
   git log origin/claude/etf-holdings-lookup-tool-wwtz57 -1
   ```
2. **(옛 계정에서)** claude.ai 아티팩트로 올린 것이 있으면 내려받기
3. **(새 계정에서)** GitHub 커넥터 연결 → 이 저장소 접근 허용
4. **(새 계정에서)** 새 세션을 열고 첫 줄로:

   > 이 저장소의 `HANDOFF.md` 와 `CLAUDE.md` 를 읽고, ETF 편입종목 조회
   > 작업을 이어서 해줘.

5. 확인: 아래가 다 통과하면 제대로 이어받은 것입니다
   ```bash
   node scripts/audit_etf_data.mjs
   node scripts/test_etf_page.mjs
   node scripts/test_etf_returns.mjs
   ```

## 한 가지 권하는 것

작업 브랜치를 `main` 에 합치십시오. 지금은 예약 수집이 이 브랜치에서
발동하지 않아 **밀어 넣을 때만 자료가 갱신**됩니다. 합치면 매일 자동으로
돕니다. 계정이 바뀌어도 Actions 는 저장소에 묶여 있어 그대로 돕니다.
