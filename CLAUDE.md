# 이 저장소에서 일할 때

새 세션이 가장 먼저 읽는 파일입니다.

## ★ 새 Claude 계정에서 처음 열었다면 여기부터

계정을 옮겨 온 경우 **[docs/handover/00-저장소-전체-인계.md](docs/handover/00-저장소-전체-인계.md)**
를 먼저 읽으십시오. 저장소 전체의 지도이고, 갈래마다 어느 문서를 봐야 하는지가 거기 있습니다.

| 무엇이 필요한가 | 읽을 것 |
|---|---|
| 저장소 전체 지도 · 갈래 안내 | **[docs/handover/00-저장소-전체-인계.md](docs/handover/00-저장소-전체-인계.md)** |
| 계정 설정(커넥터·스킬·예약) 복원 절차 | [docs/claude-handoff/ACCOUNT-SETUP.md](docs/claude-handoff/ACCOUNT-SETUP.md) |
| 예약 19건 프롬프트 원문 | [docs/claude-handoff/ROUTINES.md](docs/claude-handoff/ROUTINES.md) · 기계 판독용 [routines.json](docs/claude-handoff/routines.json) |
| 저장소 **밖에서** 볼 한 파일 사본 | [인계-보관본.txt](인계-보관본.txt) — 활성 예약 12건 전문 + 지침 + 설정 |

**예약(Routine)·대화 기록·아티팩트는 계정에 묶여 있어 넘어오지 않습니다.** 저장소 파일만
넘어옵니다. 그래서 위 문서들이 있는 것입니다 — 자세한 것은 각 문서의 0절에 있습니다.

`인계-보관본.txt` 는 **손으로 고치지 마십시오.** 3절(예약)은
`python3 scripts/build_handoff_archive.py` 가 `routines.json` 에서 만듭니다.
예약을 고쳤으면 스냅샷을 새로 뜬 뒤 이 스크립트를 다시 돌리십시오
(`--check` 로 어긋남만 볼 수 있습니다).

## 갈래별 문서

**일거리가 여럿입니다.** 아래는 자주 손대는 둘이고, 나머지(매매 타이밍·100대 기업·
금융상품 조회·마포 WM 링크)는 위 전체 지도에서 찾으십시오.

- **증시 일정 캘린더** — 맥락은 **[HANDOFF.md](HANDOFF.md)**, 프롬프트와 설정은
  **[PROMPTS.txt](PROMPTS.txt)**.
- **시황 브리핑** — 맥락은 **[docs/HANDOVER.md](docs/HANDOVER.md)**, 예약 프롬프트와
  설정은 **[docs/routine-prompts.md](docs/routine-prompts.md)**, 작업 규칙 전체는
  **[docs/briefing-playbook.md](docs/briefing-playbook.md)**(2,024줄). 브리핑 일을
  맡았다면 playbook 을 **처음부터 끝까지** 읽고 시작하십시오.

## 무엇을 하는 저장소인가

미래에셋증권 WM 업무용 화면과 그 데이터를 만드는 곳입니다. 화면은 대부분 **단일 HTML 파일**
이고, 데이터는 `scripts/*.py` 가 만들어 `data/` 에 두며, 갱신은 `.github/workflows/*.yml`
이 저절로 돌립니다. 화면 목록과 각각의 설명은 `README.md` 에 있습니다.

## 반드시 지키는 것

**날짜와 숫자를 지어내지 않습니다.** 확인하지 못한 것은 비워 두고 `gaps`·`undated`·`links`
에 출처 주소와 함께 남깁니다. "아마 이쯤일 것"으로 채우지 않습니다. 캘린더는 확정도를
`official · websearch · tentative · estimate · rule` 다섯 단계로 구분해 화면에 표시합니다.

**시세·ELS·브리핑 자료는 웹사이트(GitHub Pages)로 노출하지 않습니다.** `pages.yml` 에
그 지침이 적혀 있습니다. 사람이 받아 갈 파일은 데이터 브랜치의 고정 주소에 둡니다.

**비밀은 저장소 파일에 넣지 않습니다.** API 키는 GitHub 저장소 시크릿에만 둡니다
(`Settings → Secrets and variables → Actions`).

**회사 망이 `*.translate.goog` 를 비업무용으로 막습니다.** 번역 프록시를 쓰지 마십시오.

## 손대기 전에

- 작업은 `claude/...` 가지에서 하고, `main` 에는 병합으로 넣습니다.
- 워크플로의 `schedule`·`workflow_run` 은 **기본 가지(main)에서만 발동**합니다. 작업
  가지에서 고친 예약은 병합 전까지 아무 일도 하지 않습니다.
- 파이썬 쪽(`scripts/*.py`)은 **표준 라이브러리만** 씁니다. 깔 것이 없어야 합니다.
- 브라우저가 필요한 일은 playwright 1.56.1 을 씁니다. `.claude/hooks/session-start.sh`
  가 세션 시작 때 깔아 둡니다 — 크로미움은 `/opt/pw-browsers` 에 이미 있으니
  `playwright install` 을 다시 부르지 마십시오.
- `package.json`·`package-lock.json`·`node_modules` 는 `.gitignore` 에 있습니다.

## 고치고 나서

만든 것을 **실제로 돌려 보고** 결과를 보고합니다. 화면은 크로미움으로 열어 보고, 수집기는
한 번 돌려 보고, 워크플로는 `bash -n` 과 YAML 파싱으로 확인합니다. 시험이 깨지면 깨졌다고
그대로 적습니다.

## 데이터가 큰 파일은 데이터 브랜치로

매번 통째로 바뀌는 큰 산출물(오프라인 단일 파일, 시세 스냅샷)은 `main` 히스토리에 쌓지
않고 전용 브랜치에 **부모 없는 커밋 하나**로 갈아 끼웁니다 — `calendar-data`,
`kr100-data`, `us100-data`. 실제 일은 `scripts/publish_data_branch.sh` 가 합니다.
