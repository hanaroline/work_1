# 한국투자증권 전략빌더 — 실행 기록과 내 PC 에서 돌리는 법

공식 저장소 <https://github.com/koreainvestment/open-trading-api> 의 `strategy_builder` 를
2026-09-18 에 실제로 내려받아 띄워 보고 적는다. **어디까지 되고 어디서 막히는지**가 요점이다.

---

## 한눈에

| 항목 | 결과 |
|---|---|
| 내려받기 | 됨 |
| 백엔드(FastAPI, 8000) | **뜬다** — 전략 10종 정상 반환 |
| 프론트엔드(Next.js, 3000) | **뜬다** — 빌더·실행 두 화면 모두 렌더 |
| KIS API 키 연결 | **못 한다** — 망 차단. 키 문제가 아니다 |

---

## 무엇인가

코딩 없이 기술적 지표를 조합해 매매 전략을 만드는 **로컬 웹 앱**이다. 두 조각으로 돈다.

```
프론트엔드 (Next.js)  localhost:3000
   /builder   전략 설계 — 지표 → 진입 → 청산 → 리스크 → 정보 5단계
   /execute   전략 실행 — 종목 넣고 BUY/SELL/HOLD 시그널, 주문
         │  Next.js rewrite (/api/* → :8000)
         ▼
백엔드 (FastAPI)      localhost:8000
   /api/strategies    기본 전략 10종
   /api/auth/*        KIS 인증
   /api/market/*      시세·호가
   /api/orders/*      주문
         │
         ▼
   KIS Open API (모의투자 / 실전투자)
```

들어 있는 것 — 기본 전략 10종(골든크로스·모멘텀·52주 신고가·연속 상승/하락·이격도 등),
기술지표 80개, 캔들스틱 패턴 57개, `.kis.yaml` 내보내기/불러오기, 빌더 상태를 실행 가능한
Python 으로 바꿔 주는 미리보기. 설계한 전략을 `.kis.yaml` 로 빼서 같은 저장소의
`backtester` 로 과거 검증한 뒤 다시 빌더에서 돌리는 흐름이다.

---

## 실행해 보니 — 걸린 자리 하나

README 의 「빠른 시작」은 `cd strategy_builder && ./start.sh` 뿐인데, **그대로 하면 백엔드가
뜨지 않는다.**

```
FileNotFoundError: [Errno 2] No such file or directory:
  '/home/<나>/KIS/config/KIS20260918'
```

`kis_auth.py` 가 **import 시점에**(런타임이 아니라) `~/KIS/config/kis_devlp.yaml` 을 열고
같은 폴더에 토큰 파일을 쓰려 들기 때문이다. 폴더와 설정 파일을 **먼저** 만들어야 한다.
`scripts/setup_kis_config.py` 가 그 일을 한다.

그 밖에는 걸리는 것이 없었다. `uv sync` 로 파이썬 의존성(fastapi·uvicorn·pandas 등 가벼움),
`npm install` 로 프론트엔드가 그대로 깔린다. 저장소 최상위 `requirements.txt` 에는
PyQt6·PySide6 같은 무거운 GUI 꾸러미가 있지만 **전략빌더는 그것을 쓰지 않는다** —
`strategy_builder/pyproject.toml` 이 따로 있고 훨씬 가볍다.

---

## 내 PC 에서 돌리는 법

필요한 것: Python 3.11+, [uv](https://docs.astral.sh/uv/), Node.js 18+.

```bash
# 1. 공식 저장소를 받는다
git clone https://github.com/koreainvestment/open-trading-api
cd open-trading-api/strategy_builder

# 2. 개인 환경파일을 먼저 만든다 (이 단계를 빼면 백엔드가 안 뜬다)
#    앱키는 화면에 찍히지 않고 ~/KIS/config/kis_devlp.yaml 에 0600 으로 저장된다
python3 <이 저장소>/scripts/setup_kis_config.py

# 3. 띄운다 — 백엔드 8000, 프론트엔드 3000 을 함께 올린다
./start.sh
```

브라우저에서 <http://localhost:3000> → 전략 빌더 화면이 뜬다.
**우측 상단 톱니(설정)에서 인증**해야 `/execute` 의 시그널 생성과 주문이 열린다.
인증 전에는 「인증이 필요합니다. 우측 상단 설정에서 인증해주세요.」가 뜬다.

처음에는 반드시 **모의투자(vps)** 로 붙인다. 실전(prod)으로 붙으면 진짜 주문이 나간다.

---

## 클로드 세션에서는 왜 키를 연결할 수 없나

앱을 띄우는 것까지는 여기서 다 됐다. 막히는 것은 **KIS 서버로 나가는 길** 하나다.

| 시도 | 결과 |
|---|---|
| `openapi.koreainvestment.com:9443` (실전) | Connection reset by peer |
| `openapivts.koreainvestment.com:29443` (모의) | Connection reset by peer |
| 같은 호스트 443 포트 | CONNECT tunnel failed, **403** |
| 전략빌더 `POST /api/auth/login {"mode":"vps"}` | `('Connection aborted.', ConnectionResetError(104, ...))` |

마지막 줄이 핵심이다. 전략빌더를 통해 붙어도 **curl 로 직접 잰 것과 똑같이 실패한다** —
키를 검사하기도 전에 TCP 단계에서 끊긴다. 이 환경의 이그레스 프록시가 **비-443 HTTPS
포트를 지원하지 않고**(`/root/.ccr/README.md`), KIS 는 9443·29443 을 쓴다. 443 으로 우회해도
호스트 자체가 정책상 막혀 있다. 개발자포털(`apiportal.koreainvestment.com`)도 같은 이유로
열리지 않는다.

그러니 **앱키를 채팅에 붙여 넣어도 소용이 없다.** 소용이 없을 뿐 아니라 위험하다 —
대화 기록과, 얼마 뒤 회수되는 컨테이너에 살아 있는 자격증명이 남는다. 앱키는 내 PC 에서만
넣는다.

---

## 그래서 어떻게 나누어 하는가

| 하는 일 | 어디서 |
|---|---|
| 전략 설계·백테스트·주문 (전략빌더) | **내 PC** — 위 3단계 |
| 시세 수집해서 이 저장소 화면에 쓰기 | **GitHub Actions 러너** — `kis-probe.yml` 등 |
| 수집기·화면 코드 고치기 | 여기(클로드 세션) |

러너에는 이 제약이 없다. 네이버·ETFCHECK·ELS 수집을 러너에서 도는 것과 같은 사정이라,
KIS 시세도 같은 자리에 둔다.

---

## 곁들여 둔 것

- `scripts/kis_lib.py` — 토큰 발급·캐싱, 호출 래퍼. 접근토큰은 24시간 유효한데 발급이
  1분에 1회로 막혀 있어 파일 캐싱이 필수다. 도메인·포트는 공식 `kis_devlp.yaml` 과 맞춰 두었다.
- `scripts/probe_kis.py` — 모의투자 앱키로 **어떤 시세 TR 이 실제로 응답하는지** 재는 도구.
- `.github/workflows/kis-probe.yml` — 그 실측을 러너에서 돌린다.
- `scripts/setup_kis_config.py` — 위 2단계의 개인 환경파일을 만든다.
