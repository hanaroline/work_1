# 이 저장소에서 일할 때

새 세션이 가장 먼저 읽는 파일입니다.

## ★ 계정을 옮겨 왔거나 처음 오셨다면

**[docs/handover/00-저장소-전체-인계.md](docs/handover/00-저장소-전체-인계.md)**
를 먼저 읽으십시오. **저장소 전체 지도**입니다 — 일거리가 **열넷**이고, 가지가
**셋이며 서로 조상이 없다**는 구조, 갈래마다 어느 인계 문서를 봐야 하는지,
계정을 바꿀 때 무엇이 넘어오고 무엇이 사라지는지가 거기 있습니다.
갈래별 인계 문서는 모두 **[docs/handover/](docs/handover/)** 아래에 있습니다.

저장소 **밖으로** 들고 갈 사본은 루트의 **[인계-보관본.txt](인계-보관본.txt)**
하나면 됩니다 — 예약 프롬프트 원문, 작업 규칙, 시스템 설정, 겪은 함정을
한 파일에 모았습니다.

## 갈래별 문서

**증시 일정 캘린더** — 맥락은 **[HANDOFF.md](HANDOFF.md)**, 자주 쓰는
프롬프트와 설정은 **[PROMPTS.txt](PROMPTS.txt)**.

**시황 브리핑** — 맥락은 **[docs/HANDOVER.md](docs/HANDOVER.md)**,
예약 프롬프트와 설정은 **[docs/routine-prompts.md](docs/routine-prompts.md)**,
작업 규칙 전체는 **[docs/briefing-playbook.md](docs/briefing-playbook.md)**(2,024줄)
입니다. 브리핑 일을 맡았다면 playbook 을 **처음부터 끝까지** 읽고 시작하십시오.

그 밖의 갈래(증권사 리포트 · 매매 타이밍 · 100대 기업 대시보드 · 마포 WM ·
데이터센터 밸류체인 맵)는 `docs/handover/` 의 해당 문서를, 문서가 없는 갈래는
`README.md`(252KB)의 해당 절을 보십시오.

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
- **푸시 전에 지금 들고 있는 것이 무엇인지 확인하십시오** — 세션 컨테이너가
  `main` 내용을 받아 놓고 가지 이름만 옛 기능 가지로 달아 주는 일이 있습니다.
  `git rev-parse --short HEAD origin/main` 이 같으면 들고 있는 것은 `main` 입니다.
  **기능 가지에 `-f` 로 푸시하지 마십시오** — 그 가지의 작업이 통째로 사라집니다.
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
