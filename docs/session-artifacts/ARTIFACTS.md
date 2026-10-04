# 아티팩트 전수 목록 · 인계 문서 지도

계정을 옮기면 **아래 아티팩트 URL 은 전부 열리지 않습니다.** 무엇이 있었고
어느 가지에서 다시 만들 수 있는지 남겨 두는 것이 이 문서의 목적입니다.
옮기는 절차와 규칙은 [HANDOVER.md](HANDOVER.md), 프롬프트와 검증 스크립트는
[PROMPTS.md](PROMPTS.md) 에 있습니다.

기준 2026-10-04 · 저장소 `hanaroline/work_1`

---

## 먼저 읽을 것 — 다른 세션들이 남긴 인계 문서

이 자료실 말고도 **거의 모든 세션이 각자 인계 문서를 남겼습니다.** 그중 가장
앞에 두어야 할 것은 브리핑 파이프라인 세션이 만든 진입점입니다.

| 무엇 | 어디 |
|---|---|
| **진입점 — 가장 먼저 읽을 것** | `claude/initial-work-validation-kg344p` 의 `docs/HANDOVER-INDEX.md` |
| **예약(Routine) 11개 지시문 전문** ★ | 같은 가지의 `docs/handover/예약-지시문-전체백업.txt` |
| 브리핑 작성 지침 원본 (1,992줄) | 같은 가지의 `docs/briefing-playbook.md` |
| 인계 문서 통합본 생성기 | `claude/cool-pasteur-dgzvrd` 의 `scripts/build_handover_bundle.py` |

> 예약 지시문 백업은 **계정 밖에도 한 벌 두십시오.** 예약은 계정과 함께
> 사라지는데, 그 지시문에 몇 달치 운영 노하우가 쌓여 있습니다.

꺼내 보는 법:

```bash
git show origin/claude/initial-work-validation-kg344p:docs/HANDOVER-INDEX.md
git show origin/claude/initial-work-validation-kg344p:docs/handover/예약-지시문-전체백업.txt
```

---

## 인계 문서가 있는 가지 — 전체 지도

77개 가지에 인계·지침 문서가 흩어져 있습니다. 작업을 이어받을 파이프라인의
가지를 찾아 그 문서를 먼저 읽으십시오.

| 세션 가지 | 인계 문서 | 크기 |
|---|---|---|
| `adoring-cannon-ds28a0` | `HANDOVER.md` · `briefing-playbook.md` · `handover/README.md` · `routine-prompts.md` | 170KB |
| `beautiful-hopper-e7j93r` | `briefing-playbook.md` | 129KB |
| `blissful-sagan-sn0yse` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 193KB |
| `bold-knuth-6yq4vn` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `briefing-2026-10-02` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 195KB |
| `briefing-2026-10-02-recheck` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 195KB |
| `complete-sales-script-automation-cjsx8e` | `briefing-playbook.md` | 121KB |
| `cool-pasteur-dgzvrd` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 193KB |
| `customer-proposal-generator-f53dlm` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompts.md` | 169KB |
| `department-shared-storage-vxpl94` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `eager-johnson-xffv94` | `briefing-playbook.md` | 134KB |
| `ecstatic-mccarthy-2kg48k` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 192KB |
| `elegant-mendel-7s02zx` | `briefing-playbook.md` | 134KB |
| `elegant-ritchie-7p11xf` | `briefing-playbook.md` | 134KB |
| `els-fund-disclosure-i6wtii` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `els-product-structure-page-ljsucw` | `briefing-playbook.md` | 69KB |
| `etf-holdings-lookup-tool-wwtz57` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `fervent-euler-j9lt3b` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `fervent-hypatia-bbg6hh` | `briefing-playbook.md` | 134KB |
| `final-file-check-mmcfob` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `financial-calendar-screen-r8dcqf` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `focused-babbage-mv26jj` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `fold-reason` | `briefing-playbook.md` | 134KB |
| `fund-appraised` | `briefing-playbook.md` | 134KB |
| `fund-nav` | `briefing-playbook.md` | 134KB |
| `fund-search-tool` | `briefing-playbook.md` | 108KB |
| `fx-frankfurter` | `briefing-playbook.md` | 134KB |
| `fx-krw-basis` | `briefing-playbook.md` | 134KB |
| `fx-multi-source` | `briefing-playbook.md` | 134KB |
| `gifted-mccarthy-ktb7kg` | `briefing-playbook.md` | 129KB |
| `handoff-account-migration-2026-10` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `handoff-archive-refresh` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `handoff-refresh-2026-10` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `handoff-refresh-2026-10-01` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `handover-account-migration` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `handover-briefing-docs` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 193KB |
| `individual-homepage-server-oyg2sh` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `initial-work-validation-kg344p` | `HANDOVER-INDEX.md` · `HANDOVER.md` · `briefing-playbook.md` · `routine-prompts.md` | 179KB |
| `intelligent-maxwell-dnreiw` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `intranet-file-sharing-site-bk9cwc` | `briefing-playbook.md` | 47KB |
| `ipr-account-products-akf151` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `journal-kis-flows` | `briefing-playbook.md` | 134KB |
| `kind-feynman-4ke7nr` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 191KB |
| `kis-open-api` | `briefing-playbook.md` | 134KB |
| `korean-top-100-companies-cnb2t0` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `law-info-center-query-issue-4ob6uz` | `briefing-playbook.md` | 109KB |
| `magical-bohr-6nz96j` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `market-daily-0928` | `briefing-playbook.md` | 134KB |
| `new-project-recommendation-j3hplb` | `briefing-playbook.md` | 69KB |
| `new-session-5tllo8` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `new-session-5vw1zz` | `HANDOVER.md` · `briefing-playbook.md` · `handover/README.md` · `routine-prompts.md` | 179KB |
| `new-session-b9zci7` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `nice-knuth-ecmzxw` | `HANDOVER.md` · `briefing-playbook.md` · `handover/README.md` · `routine-prompts.md` | 176KB |
| `organize-session-artifacts-fbg82m` | `briefing-playbook.md` | 94KB |
| `overseas-bars-followup` | `briefing-playbook.md` | 134KB |
| `overseas-bars-kis` | `briefing-playbook.md` | 134KB |
| `overseas-etf-10y` | `briefing-playbook.md` | 134KB |
| `pharma-biotech-validation-9awrwc` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `proposal-products` | `briefing-playbook.md` | 134KB |
| `proposal-reason` | `briefing-playbook.md` | 134KB |
| `real-estate-tax-validation-2f31eb` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `real-estate-tax-validation-a39v6m` | `briefing-playbook.md` | 136KB |
| `retirement-asset-proposal-m08jfr` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `sales-script` | `briefing-playbook.md` | 121KB |
| `securities-report-auto-summary-847wst` | `briefing-playbook.md` | 126KB |
| `sharp-planck-q5hets` | `briefing-playbook.md` | 128KB |
| `stock-investment-validation-0mqw5z` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `stock-investment-validation-6d61p5` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 195KB |
| `sweet-darwin-af7cvl` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 197KB |
| `tax-document-verification-99f2sk` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 194KB |
| `us-top-100-companies-dashboard-wn7877` | `HANDOVER.md` · `briefing-playbook.md` · `handover/session-prompts.json` · `routine-prompt-close.md` 외 1건 | 603KB |
| `wonderful-archimedes-a9q11p` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 195KB |
| `wonderful-dijkstra-nc6uye` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompt-close.md` · `routine-prompts.md` | 193KB |
| `work-report-presentation-wfnh58` | `HANDOVER.md` · `briefing-playbook.md` · `routine-prompts.md` | 167KB |
| `xlsm-verify` | `briefing-playbook.md` | 134KB |
| `xlsx-filter-fix` | `briefing-playbook.md` | 134KB |
| `zen-euler-umuf5o` | `briefing-playbook.md` | 128KB |

---

## 아티팩트 전수 목록

색인에 실린 70개 항목입니다. 이 중 65개가 아티팩트 링크를 가지고 있었고,
**계정이 닫히면 전부 열리지 않습니다.** 「세션 가지」 칸이 그 화면을 다시
만들 수 있는 곳입니다.

### 시황 · 브리핑

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 모닝 브리핑 첫 판 · 2026-08-04 | 자동 증시시황 수집 및 브리핑 | 2026-08-06 | https://claude.ai/code/artifact/52dcf057-d3b2-421c-a418-1741e617e27f |
| 모닝 마켓 브리핑 · 9/11 | 모닝 시황 브리핑 | 2026-09-11 | https://claude.ai/code/artifact/ebb9ba15-22ba-4f79-8354-bcc3a0e0d665 |
| 브리핑 목록 | 모닝 시황 브리핑 | 2026-08-30 | https://claude.ai/code/artifact/d71cdafd-9cd4-4eea-8500-a37da78b8f47 |
| 브리핑 아카이브 (8월 중순판) | 새로운 프로젝트 추천 | 2026-08-17 | https://claude.ai/code/artifact/c33e2992-1bc7-47ef-98ed-25dc750b7965 |
| 주간 마켓 다이제스트 · 2026-W33 | 새로운 프로젝트 추천 | 2026-08-17 | https://claude.ai/code/artifact/45054867-2a98-4733-9ed7-43a269f6cbd1 |
| 브리핑 개편안 | 모닝 시황 브리핑 | 2026-08-22 | https://claude.ai/code/artifact/4694c9cc-d07f-4d10-af16-db2d6ef3085d |
| 해외 증시 브리핑 (베타) · 8/22 | 모닝 시황 브리핑 | 2026-08-22 | https://claude.ai/code/artifact/961b8d2b-624f-4fd1-80ee-e6e242b93f99 |
| 증권사 아침 시황 종합 | 블룸버그 브리핑 자동 번역 및 요약 | 2026-07-27 | https://claude.ai/code/artifact/a89553cf-9f85-46b0-8b7e-b8eb4ec4d952 |
| Bloomberg 브리핑 · 미리보기 | 블룸버그 브리핑 자동 번역 및 요약 | 2026-07-27 | https://claude.ai/code/artifact/6ba8c13c-26b1-41e9-91f7-ad8be51bf834 |
| 국내 시장일지 | 국내 시장일지 | 2026-09-22 | https://claude.ai/artifact/G2nyjm2Ta52Qhi8BWgmwo5 |

### 보유자산 · 포트폴리오

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 보유자산 통합 브리핑 | Asset briefing dashboard setup | 2026-08-21 | https://claude.ai/code/artifact/15a26735-c8c5-428c-aec8-7ab437e4f04d |
| 보유자산 브리핑 7월판 | 미래에셋증권 시세 데이터 통합 | 2026-08-05 | https://claude.ai/code/artifact/e34b5f2b-f58a-44a9-abf0-04af84d21990 |
| 포트폴리오 점검 | 새로운 프로젝트 추천 | 2026-08-17 | https://claude.ai/code/artifact/ab051636-2c6e-4e33-a6fe-4955c1130655 |
| 은퇴자산 운용 제안서 · v2 | 은퇴자산 설계 제안서 | 2026-09-07 | https://claude.ai/code/artifact/a4d9d351-0a19-4ac7-b9f4-f9c17b8c964c |
| 마켓 모니터 | 새로운 프로젝트 추천 | 2026-08-17 | https://claude.ai/code/artifact/323b2c82-af94-49c2-bca8-04605a0bf903 |

### ELS · 상품 제안

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| ELS 상품 조회 · 최신판 | ELS 상품 통합 조회 | 2026-09-06 | https://claude.ai/code/artifact/e8a6b160-154a-4cfa-921f-edc368cf58a4 |
| ELS 상품 구조 한눈에 보기 | ELS 상품 구조 설명 페이지 | 2026-08-20 | https://claude.ai/code/artifact/c3969a8b-8ddc-4f39-aba4-77677e8d3aff |
| ELS 주간 제안서 · 8/24 판매분 | ELS 상품 구조 설명 페이지 | 2026-08-25 | https://claude.ai/code/artifact/292b0dbd-65ef-405c-b8fd-d7843d8f61d3 |
| ELS 세일즈 제안서 · 제38070~38089회 | ELS 상품 구조 설명 페이지 | 2026-09-01 | https://claude.ai/code/artifact/3a975c54-1bd5-403b-8aa8-25ff4e3ac517 |
| ELS 세일즈 분석 8월 4주 | ELS 상품 구조 설명 페이지 | 2026-08-21 | https://claude.ai/code/artifact/8d533746-9e53-444b-86a6-7f5e39f01d4c |
| 8월 ELS 37건 비교분석 | ELS 상품 구조 설명 페이지 | 2026-08-21 | https://claude.ai/code/artifact/4b4bcb92-2b53-4402-9c9a-3d999101cd45 |
| 고객 상품 제안서 생성기 | 고객 상품 제안서 생성 도구 | 2026-08-15 | https://claude.ai/code/artifact/009eca34-5931-471e-acf2-1965a1a839f6 |
| IRP 계좌 운용상품 제안서 | IPR account product proposals | 2026-07-14 | https://claude.ai/code/artifact/3c999e69-3f9a-4854-a0e2-247438b7e542 |
| 퇴직연금 DC 제안서 | IRP product proposal PPT | 2026-07-14 | https://claude.ai/code/artifact/22e1a511-05da-44ec-b31a-cee7d144ae98 |

### 조회 화면 · 대시보드

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 금융상품 통합조회 | 미래에셋증권 금융상품 조회 화면 | 2026-08-05 | https://claude.ai/code/artifact/fb2600c7-6cbe-42af-afca-475ec314a3c5 |
| 종목 통합 리포트 · 실시간 조회 | 조회 사이트 구축 | 2026-07-25 | https://claude.ai/code/artifact/c7e658bd-43c8-46e4-88cb-8870ea93f526 |
| 종목 통합 리포트 초판 | Stock report dashboard | 2026-07-09 | https://claude.ai/code/artifact/35df2517-e8f5-4ae4-ae3e-a9d48b9daa1b |
| 데이터센터 밸류체인 종목 맵 | 데이터센터 밸류체인 맵 | 2026-08-05 | https://claude.ai/code/artifact/b563f426-4248-467e-af3f-bc6c750de2b5 |
| 증권사 리포트 다이제스트 | 증권사 리포트 자동 요약 | 2026-09-30 | https://claude.ai/code/artifact/e0d4d73a-22db-4d93-a0c5-6ab177711daa |
| ETF 속보기 | ETF 속보기 | 2026-09-29 | https://claude.ai/artifact/Ma9mtaRuWF8HWrXUpz7QYk |
| ETF 편입종목 조회 | ETF 편입종목 조회 도구 | 2026-09-13 | https://claude.ai/code/artifact/c3f08597-8d47-45ce-ba27-17fd26a63dc7 |
| ETF 편입종목 조회 사용법 | ETF 편입종목 조회 도구 | 2026-08-31 | https://claude.ai/code/artifact/f38b7755-cfef-4f6d-9359-a4116b847084 |
| 국내 설정 공모펀드 조회 | 펀드조회 화면 | 2026-08-31 | 아티팩트 불가 · 저장소 |
| 국내 100대 기업 시세 조회 | 국내 100대 기업 조회 | 2026-09-09 | https://claude.ai/code/artifact/7645c0af-d6d3-4370-b050-cbb353f23a52 |
| 미국 100대 기업 시세 조회 | 미국 100대 기업 조회 | 2026-09-09 | https://claude.ai/code/artifact/21725cd6-5882-4679-a897-f55566e0190b |
| 증시 일정 캘린더 | 증시 일정 화면 | 2026-09-09 | https://claude.ai/code/artifact/1bde1435-33ce-4cd6-97d6-6e3ef06d26c0 |
| TV · 라디오 온에어 | TV · 라디오 온에어 화면 | 2026-09-13 | 아티팩트 불가 · 저장소 |
| 미국 주요기업 실적 인텔리전스 | 실적 인텔리전스 화면 | 2026-09-17 | https://claude.ai/artifact/4HaVH13cZZuH434S8TtJys |

### 세금 · 계산기 · 영업 도구

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 부동산 세금 계산기 | 부동산 세금 계산기 | 2026-08-07 | https://claude.ai/code/artifact/5897de59-de5a-4f82-8775-d8307d6f20bd |
| 완전판매 스크립트 자동완성 | 완전판매 스크립트 자동화 시스템 | 2026-09-06 | https://claude.ai/code/artifact/6e974295-f4c2-49e3-8bea-33775ef7ca4b |
| 완전판매 스크립트 · 상품설명의무 전용판 | ELS · 펀드 투자설명서 판독 | 2026-09-15 | https://claude.ai/artifact/9bFnJrrFeH7rMYtLGmJE7b |
| 월배당 ETF 고객제안서 | 월배당 ETF 제안서 | 2026-09-16 | 엑셀 · 저장소 |
| 퇴직급여 수령 의사결정 시뮬레이터 | 퇴직급여 판단표 · 시뮬레이터 | 2026-09-23 | https://claude.ai/artifact/5LwwSEjKCS54xCT2qUYab7 |
| 자산배분 제안서 생성기 | 자산배분 제안서 | 2026-09-20 | https://claude.ai/artifact/FDcy9WXPRSh1691JsTHfvn |
| 시장 변동성 경보 · 고객용 | 변동성 경보 모델 | 2026-09-21 | https://claude.ai/artifact/8Vmbp6SC2KLnsrrnCpfp4r |
| 마포WM 모바일 창구 | 개별 홈페이지/서버 구축 | 2026-09-05 | https://claude.ai/code/artifact/7b5fe21e-f844-4f2f-9fd5-2ee873d3d647 |
| 영업 지원 도구 | 작업 검토 및 제안 | 2026-07-29 | https://claude.ai/code/artifact/a86d0d0e-b723-42c5-b7d8-5a64262489b9 |
| 대주주 양도세 원문 대조 | 국가법령정보센터 법령 조회 | 2026-08-30 | https://claude.ai/code/artifact/2e47eb36-ab99-4c84-9390-55c52527e1a4 |
| 2026 세제 세미나 검증본 | 세무 자료 검증 · 부동산 세제 자료 검증 | 2026-08-22 | https://claude.ai/code/artifact/80f98891-6920-42a0-9cdc-a548f564db29 |

### 엑셀 산식 · 업무 매뉴얼

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 산식 길잡이 | 엑셀 함수 및 계산식 정리 | 2026-08-25 | https://claude.ai/code/artifact/4188685b-2521-4240-a3ef-987a8fd0b034 |
| 엑셀 산식 원장 합본 | 엑셀 함수 및 계산식 정리 | 2026-08-25 | https://claude.ai/code/artifact/94e6f911-801c-40f6-8099-196a8c7d0c9c |
| 엑셀 산식 도해 | 엑셀 함수 및 계산식 정리 | 2026-08-25 | https://claude.ai/code/artifact/c2ddc566-2f52-42b9-b549-bdb8b86ba271 |
| 엑셀 산식 원장 · 제1권 | 엑셀 함수 및 계산식 정리 | 2026-08-24 | https://claude.ai/code/artifact/ccb64920-9f9e-4045-91ac-d5809128a878 |
| 영업점 산식 원장 · 제2권 | 엑셀 함수 및 계산식 정리 | 2026-08-25 | https://claude.ai/code/artifact/23202724-7f0d-4318-93d5-f9b438106ff3 |

### 세미나 · 발표자료 · 영상

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 2026 하반기 시장 팩트시트 | 투자 세미나 팩트시트 | 2026-08-26 | https://claude.ai/code/artifact/7b47b6a1-ed09-4e4c-a5c6-5cc8b2da293b |
| 반도체·코스피 팩트시트 | 투자 세미나 팩트시트 | 2026-08-26 | https://claude.ai/code/artifact/03bc8628-27ec-48d8-8e15-634043688b66 |
| 반도체 프라이머 2026 | 반도체 자료 검증 및 화면 수정 (2건) | 2026-08-03 | https://claude.ai/code/artifact/42c7cc1a-2ddc-48ec-a560-a5cfd224eaaa |
| 반도체 고객세미나 7월판 | Data update to July 2026 | 2026-07-14 | https://claude.ai/code/artifact/602079f3-0b9e-4bcd-9912-4907a4237bc3 |
| 반도체 투자 세미나 7·29판 | 반도체 세미나 강의안 PPT | 2026-07-28 | https://claude.ai/code/artifact/0e319240-562a-4331-ba3e-cfcf111d99d8 |
| 반도체 투자 세미나 강의안 (미리보기) | 반도체 세미나 강의안 PPT | 2026-07-28 | https://claude.ai/code/artifact/9b45cbdf-ee9e-4e1f-addd-5127bb883818 |
| 부동산 세금 설명 영상 | 동영상 제작 | 2026-07-28 | https://claude.ai/code/artifact/1a896c1f-dba8-4095-b749-30b44b0aab71 |
| 업무자동화 구축 결과보고 | 업무 보고 발표자료 | 2026-09-09 | https://claude.ai/code/artifact/7b11fe2a-9361-4afb-9e58-6166f830e655 |
| AI 투자 트렌드 숏폼 | 동영상 제작 | 2026-07-28 | https://claude.ai/code/artifact/16428998-4c7f-4ae9-9d9a-785cbe5f03f4 |

### 자료실 · 사내 공유

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 부서 자료실 | 부서 내 공유 저장소 설정 | 2026-08-12 | https://claude.ai/code/artifact/8d317770-d6a5-4c8b-b365-2a7549330eb9 |
| 팀 자료실 | 내부망 파일 공유 사이트 | 2026-08-13 | https://claude.ai/code/artifact/bf2d05de-fe34-41bf-b40e-93daa21c2556 |

### 그 밖의 작업

| 산출물 | 세션 가지 | 날짜 | 아티팩트 URL |
|---|---|---|---|
| 신길파크자이 브로슈어 | 신길파크자이 브로슈어 | 2026-07-12 | https://claude.ai/code/artifact/17c78672-8a92-4ad8-8270-87af3afbebd4 |
| 테트리스 | Tetris game | 2026-07-09 | https://claude.ai/code/artifact/1cdb0e41-4561-4c00-9e3a-a9d6edce444a |
| 갤러그 | Tetris game | 2026-07-09 | https://claude.ai/code/artifact/189bc251-61dc-409b-9b78-df39b8f0a092 |
| 한국투자증권 오픈API 붙임쇠 | 증권사 오픈API 연동 | 2026-09-23 | 생성기 · 저장소 |
| 세미나 중간 영상 클립 | 세미나 영상 클립 | 2026-09-16 | 생성기 · 저장소 |

---

## 다시 만들 수 없는 것

| 산출물 | 사정 |
|---|---|
| 엑셀 산식 원장 계열 5건 | 세션이 가지를 푸시하지 않아 **저장소에 파일이 없습니다.** 아티팩트가 원본이었으므로 계정과 함께 사라집니다. 닫기 전에 HTML 로 저장해 두십시오 |
| 시장 팩트시트 2건 | 어느 세션이 만들었는지 확인되지 않았습니다 |
