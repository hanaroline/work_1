# 프롬프트 · 지침 · 시스템 설정 보관함

> 자주 쓰는 프롬프트, 프로젝트 지침, 이 작업 환경의 설정을 복사·보관하는 파일입니다.
> 새 계정/새 대화에서 복사해 붙여 쓰면 됩니다. 최종 갱신: 2026-10-01

---

## A. 바로 쓰는 프롬프트 (복사용)

### A-1. 새 대화에서 이 프로젝트 이어가기
```
이 저장소의 HANDOFF.md 와 PROMPTS.md 를 먼저 읽고,
프로젝트 맥락 · 결정사항 · 작업 규칙을 파악한 뒤 이어서 작업해줘.
개발 브랜치는 claude/query-site-builder-wad3bb 를 사용하고,
작업이 끝나면 커밋 · 푸시까지 해줘.
```

### A-2. 종목 조회 사이트(다크 스타일) 수정 요청 템플릿
```
money.html(moneyland 다크 스타일)에서 [바꾸고 싶은 부분]을 수정해줘.
- 국내 시세 색 관례(상승=빨강, 하락=파랑)와 이모지 섹션 헤더는 유지
- MONEYLAND 워드마크/로고는 복제하지 말 것(중립 브랜드 유지)
- 수정 후 money-standalone.html(단일 파일)도 다시 생성해줘
```

### A-3. 실시간 데이터 실행 안내 (사용자 본인 PC용)
```
serve.py 와 money-standalone.html 을 같은 폴더에 두고:
  python serve.py
브라우저가 http://localhost:8000 을 자동으로 열며 실시간 조회됨.
(이 PC가 finance.naver.com 등에 접근 가능해야 함. 막히면 자동 샘플 폴백)
더블클릭(파일 직접 열기)은 샘플 데이터만 표시됨.
```

### A-4. 사내 시세 API 연동 요청 템플릿
```
미래에셋 사내 시세 API를 연동하고 싶어. 아래 정보를 줄게:
- 엔드포인트 URL:
- 요청 방식(GET/POST, 헤더/파라미터):
- 응답 JSON 구조(예시 응답):
serve.py 의 ALLOW_HOSTS 에 호스트를 추가하거나 fetch 대상 URL을 이걸로 바꿔줘.
(ALLOW_HOSTS 화이트리스트 + 트래버설 가드는 반드시 유지)
```

### A-5. 미래에셋 브랜드 산출물 요청
```
mas-design 스킬 기준(오렌지 #F58220 / 블루 #043B72, Noto Sans KR+Inter,
그라데이션·이모지 지양)으로 [산출물]을 만들어줘.
```

---

## B. 프로젝트 지침 (유지 규칙 요약)

1. 개발 브랜치: `claude/query-site-builder-wad3bb` (다른 브랜치 push 금지)
2. PR은 명시적 요청 시에만 생성
3. 정책/보안 우회 금지 (차단된 egress를 우회하지 않음)
4. `serve.py`: `ALLOW_HOSTS` 화이트리스트 + 디렉터리 트래버설 가드 유지
5. moneyland 워드마크/로고 복제 금지(브랜드 사칭 방지)
6. 모델 식별자를 커밋/PR/코드 등 산출물에 넣지 않음
7. 사용자 이메일은 식별/저작자 표기용으로만 사용

> 상세 맥락·결정사항은 `HANDOFF.md` 참고.

---

## C. 이 작업 환경(시스템) 설정 메모

- **실행 환경**: Claude Code (클라우드 원격 실행 — claude.ai/code). 컨테이너는 비영속(세션 종료 시 회수) → **커밋·푸시한 것만 보존됨**.
- **연동 저장소**: `hanaroline/work_1` (이 저장소가 모든 산출물의 영구 보관소)
- **GitHub 접근**: `gh` CLI 없음. GitHub MCP 툴(`mcp__github__*`) 또는 git 명령 사용.
- **네트워크**: 아웃바운드는 에이전트 프록시 경유. 샌드박스가 moneyland/naver/yahoo 등 외부 시세 호스트를 차단 → 샌드박스 내부에서는 실시간 조회가 안 되고 샘플로 표시됨(정상). 사용자 PC(사내망/개인망)에서 `serve.py` 실행 시 실시간 동작.
- **브라우저**: Chromium + Playwright 사전 설치(검증용). `playwright install` 실행 불필요.
- **git push**: `git push -u origin <branch>`, 네트워크 오류 시 지수 백오프 재시도(2s/4s/8s/16s).

---

## D. 파일 맵 (무엇이 어디에)

```
index.html             원본 대시보드(데이터 로직 원본)
money.html             moneyland 다크 스타일 (주력)
money-standalone.html  money.html 단일 파일(더블클릭 실행용, ~300KB)
mas.html               미래에셋 브랜드 버전
serve.py               실시간용 로컬 프록시 실행기(파이썬 표준 라이브러리)
standalone.html        index.html 단일 파일 버전
vendor/chart.umd.js    Chart.js 4.4.1 (로컬)
data/tickers.js        종목 코드 매핑
data/sample.js         샘플 폴백 데이터
README.md              사용자용 실행 설명서
HANDOFF.md             인수인계(맥락·결정·규칙)
PROMPTS.md             이 파일(프롬프트·지침·설정 보관)
```

### money-standalone.html 재생성 방법 (money.html 수정 후)
`money.html`의 `vendor/chart.umd.js`, `data/tickers.js`, `data/sample.js`를
`<script>...</script>`로 인라인하고(`</script>` → `<\/script>` 이스케이프),
Chart CDN 폴백 `<script>` 블록을 제거하면 단일 파일이 됩니다.
