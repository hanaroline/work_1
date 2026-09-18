# 워크플로 규약

이 폴더의 워크플로는 대부분 **수집기**다. 밖에서 자료를 받아 저장소에 커밋한다.
아래는 그 수집기들이 공통으로 지키는 규약이다. 파일마다 베껴 두면 언젠가 조용히
어긋나므로 한 곳에만 적는다.

## 가지 제한

수집기의 `push:` 방아쇠에는 **반드시 `branches: [main]` 이 붙는다.**

### 왜 — 실제로 일어난 일

2026-09-18, 기능 가지 `claude/sweet-darwin-af7cvl` 을 새 main 위로 다시 얹어
force-push 했다. 변동성 모델만 들어 있는 가지였고, 수집기와는 아무 상관이 없었다.
그런데 밀자마자 수집기 셋(`market-data`, `reports`, `probe-limit-xhr`)이 그 가지에서
깨어났고, 그중 하나가 자료를 **그 가지에 커밋했다.** PR 이 자기가 하지 않은 일을
담게 됐다.

까닭은 두 가지가 겹친 것이다.

1. **push 이벤트의 `paths` 는 밀린 구간 전체의 차이로 판정된다.** 마지막 커밋만
   보지 않는다. 다시 얹기(rebase)나 main 병합을 하면 그 사이 main 이 건드린 파일이
   전부 「이번에 바뀐 것」으로 셈해진다. main 에서는 `data/market/REFRESH`,
   `data/reports/REFRESH`, `data/market/PROBE_LIMIT` 같은 호출용 파일이 하루에도
   여러 번 바뀌므로, 며칠치만 얹어도 거의 반드시 걸린다.
2. **수집기는 돌던 가지에 그대로 커밋한다.** `git push origin HEAD:${{ github.ref_name }}`
   이다. 일부러 그렇게 만든 것이다 — 작업 가지에서 수집기를 고쳐 돌렸는데 결과가
   아무 데도 안 남으면 고쳤는지 확인할 수 없기 때문이다. 다만 그 전제는 「일부러
   불렀을 때」이고, 위 1번은 부르지 않았는데 불린 경우다.

`branches: [main]` 한 줄이 1번을 끊는다. 2번은 그대로 둔다 — 수동 실행
(`workflow_dispatch`)으로 일부러 부른 경우에는 여전히 그 가지에 결과가 남아야 한다.

### 잃는 것과 대신 쓰는 길

작업 가지에서 호출용 파일(`REFRESH` 따위)을 고쳐 push 해 수집기를 부르던 길이
막힌다. 대신:

- **`workflow_dispatch`** — 사람은 이쪽이 낫다. 바로 돈다.
- **가지를 직접 적기** — 세션 토큰에는 Actions 쓰기 권한이 없어 `workflow_dispatch`
  를 API 로 부르지 못한다(403). 수집기를 고치는 중이라 정말 그 가지에서 돌려야 하면
  해당 워크플로의 `branches:` 에 그 가지를 한 줄 더 적는다. `els-weekly.yml` 과
  `els-discover.yml` 이 `claude/els-**` 로 그렇게 하고 있다. 일이 끝나면 그 줄을
  뺀다.

이 값은 **밀린 커밋에 있는 워크플로 파일로 판정된다.** 그러니 가지에 줄을 적어
push 하면 그 push 부터 곧바로 먹는다 — 반대로, 가지에 `branches: [main]` 을 담아
밀면 그 push 자체가 이미 보호를 받는다.

### 지금 상태

| 가지 제한 | 워크플로 |
|---|---|
| `main` | calendar-data, kr100-data, kr100-offline, kr100-quotes, kr100-ranking, kr100-weekly, market-data, pages, probe-limit-xhr, reports, signals, us100-data, us100-offline, us100-quotes, us100-ranking, volatility |
| `claude/els-**` | els-discover, els-weekly |
| `push:` 없음 | fund-weekly(예약만), stock-flows(예약·수동), pr-check(PR), signals-backtest(PR·수동) |

새 워크플로를 만들 때 `push:` 를 쓴다면 `branches:` 를 같이 적는다. 빠뜨리면 위
사고가 그대로 되풀이된다.

## 예약(schedule)은 제때 돌지 않는다

깃허브 예약은 부하가 높으면 밀리거나 아예 빠진다. 이 저장소에서 30~95분 지연을
여러 번 겪었다. 그래서 중요한 판은 예약을 두 번씩 걸고, 읽는 쪽(화면·브리핑)은
예약을 믿지 않고 **파일에 적힌 수집 시각**을 그대로 보여 준다.

또한 **예약은 기본 가지(main)에 놓인 워크플로만 발동한다.** 작업 가지의 `cron:` 은
한 번도 돌지 않는다 — `fund-weekly.yml` 머리말에 그 전말이 적혀 있다.

## GITHUB_TOKEN 이 만든 커밋은 다른 워크플로를 부르지 않는다

무한 반복을 막으려고 깃허브가 그렇게 해 두었다. 그래서 「수집기가 커밋하면 다음
워크플로가 따라 돈다」는 연결은 **되지 않는다.** 이어서 할 일이 있으면 같은 판
안에서 하거나(`kr100-weekly.yml`), 예약 시각을 앞뒤로 벌려 둔다
(`volatility` 17:20 → `signals` 17:40).
