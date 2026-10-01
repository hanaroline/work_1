# 사용자 지정 스킬 백업

> 계정에만 저장되어 있던 스킬의 **원본 전문**입니다. 계정을 종료하면 원본은 사라지므로
> 여기 받아 두었습니다. 새 계정에서 이 폴더의 내용으로 그대로 다시 만들 수 있습니다.
>
> 백업 기준일 **2026-10-01** · 원본과 바이트 단위 일치 확인함

---

## 무엇을 받아 두었나

| 스킬 | 파일 | 역할 | 잃으면 |
|---|---|---|---|
| **mas-design** | `SKILL.md` (24.5 KB) | 미래에셋 브랜드 디자인 기준 — 오렌지 `#F58220` / 블루 `#043B72`, 승인 폰트, 표·차트 스타일, 한/영 UI 규칙, 품질 점검 | 브리핑·제안서의 브랜드 일관성이 깨집니다 |
| **fin-data-integrity** | `SKILL.md` + `references/` 2 + `scripts/` 2 (총 44.7 KB) | 금융 수치 검증 절차 — 주장 대장(claim ledger) 등록 → 산술·단위·계열 검산 → 빌드 | 시황·전망 자료의 수치 검증 절차가 통째로 사라집니다 |

`fin-data-integrity` 는 `scripts/check_claims.py` (15.2 KB) 가 **실제 검산을 수행하는 실행
코드**입니다. 문서만 옮기고 이 파일을 빠뜨리면 스킬이 동작하지 않습니다.

---

## 백업하지 않은 것과 그 까닭

**`morning`** — 이전 문서(`../ACCOUNT-SETUP.md`)는 이 스킬을 "이 계정에만 있던 것"으로
분류했으나, 확인 결과 **Anthropic 기본 제공본(`/mnt/skills/examples/morning`)과 폴더 전체가
완전히 동일**했습니다. 계정과 무관하게 새 계정에도 있으므로 백업이 필요 없습니다.

나머지 동기화 스킬 8종(`docs` `docx` `google-workspace` `import-memory` `pdf` `pptx`
`skill-creator` `xlsx`)도 모두 Anthropic 기본 제공본이라 받아 두지 않았습니다.

---

## 새 계정에서 복원하기

스킬은 **`SKILL.md` 한 장과 그 참조 파일들**이 전부입니다. 폴더를 그대로 옮기면 됩니다.

### 방법 1 — 대화로 시키기 (가장 간단)

새 계정의 대화에 그대로 붙여넣으십시오.

```text
저장소 hanaroline/work_1 의 docs/claude-handoff/skills/ 에 스킬 백업이 있어.
mas-design 과 fin-data-integrity 두 폴더를 그대로 내 스킬로 다시 만들어줘.
폴더 구조(references/, scripts/)와 frontmatter 를 바꾸지 말고 그대로 써.
```

### 방법 2 — 직접 올리기

claude.ai → 설정 → Capabilities → Skills → **Create skill** 에서 폴더째 올립니다.
`SKILL.md` 상단 frontmatter 의 `name` 과 `description` 은 **한 글자도 고치지 마십시오** —
Claude 가 "언제 이 스킬을 쓸지" 판단하는 것이 `description` 이라, 손대면 발동하지 않습니다.

### 방법 3 — 저장소에 두고 쓰기 (계정에 묶이지 않음)

```
.claude/skills/mas-design/SKILL.md
.claude/skills/fin-data-integrity/SKILL.md
```

이 자리에 두면 **저장소를 여는 모든 세션에서 자동으로 읽히고, 계정이 또 바뀌어도 살아남습니다.**
다만 claude.ai 일반 대화(Claude Code 밖)에서는 잡히지 않으므로, 두 곳 모두에 두는 편이 안전합니다.

---

## 복원 확인

새 계정에서 아래를 물어 스킬이 실제로 걸리는지 보십시오.

- `mas-design` → "미래에셋 브랜드로 HTML 리포트 하나 만들어줘" → 오렌지 `#F58220` 와
  승인 폰트를 **묻지 않고** 적용하면 정상입니다.
- `fin-data-integrity` → "환율 전망 자료 만들어줘" → **주장 대장부터 만들자고 하면** 정상입니다.
  바로 숫자를 쓰기 시작하면 스킬이 안 걸린 것입니다.
