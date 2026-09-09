# data/calendar

`market-calendar.html` 이 읽는 자료가 있는 곳입니다. 자세한 설명은 저장소 README 의
**증시 일정 캘린더** 절을 보십시오.

```
latest.json          화면이 읽는 단 하나의 파일 (빌더가 만든다 — 손으로 고치지 말 것)
fetch-report.json    러너의 수집 결과 (경로별 성공/실패, seed 와의 차이)
REFRESH              한 줄 고쳐 push 하면 수집 워크플로가 돈다
seed/                사람이 확인해 넣는 자리
```

## seed 를 고칠 때

`seed/` 의 네 파일이 **원본**입니다. 날짜를 빌더 코드에 문자열로 박지 않는 이유는
`data/market/holidays.json` 의 머리말에 적힌 것과 같습니다 — 코드 안의 목록은 틀린 채로
굴러다닙니다.

항목을 넣거나 고칠 때 지킬 것:

1. **`url` 과 `source` 를 반드시 적습니다.** 화면 ⑩ 이 출처를 전부 보여주고, 링크 없는
   일정은 점검(`scripts/check_calendar.py`)에서 실패로 잡힙니다.
2. **`source_en` 도 적습니다.** 없으면 영문 모드에 한글이 남고, 점검에서 실패합니다.
   기관 이름이 이미 영문이면 같은 값을 그대로 넣으면 됩니다.
3. **확인한 만큼만 `confirmed` 를 올립니다.** 공식 페이지에서 봤으면 `official`,
   검색으로 교차 확인했으면 `websearch`, 기관이 잠정이라 적었으면 `tentative`.
   **날짜를 모르면 넣지 않습니다** — 학회는 `undated` 로, 제도 일정은 `links` 로 내려
   이름과 공식 링크만 남깁니다.
4. **발표 시각을 모르면 비웁니다.** `time_local` 을 지어내면 화면이 KST 로 환산해
   그럴듯한 거짓을 만듭니다.
5. 한국어 설명(`why_ko`·`rule_note_ko`·`note_ko`)을 넣었으면 `_en` 짝도 넣습니다.

고친 뒤에는:

```bash
python scripts/build_calendar.py     # latest.json 다시 만들기
python scripts/check_calendar.py     # 점검
```

seed 를 push 하면 수집 워크플로가 자동으로 돌아 러너가 공식 페이지로 다시 확인합니다.

## 러너가 덮어쓰는 자리

`scripts/fetch_calendar.py` 는 아래를 공식 페이지 값으로 갈아끼우고 `fetched_at` 을 남깁니다.

| seed 파일 | 갈아끼우는 곳 |
|---|---|
| `centralbanks.json` | `banks[].meetings` (조회 구간 안의 것만. 먼 미래 잠정 일정은 남깁니다) |
| `indicators.json` | `indicators[].known_dates` (BLS·FRED 경로가 있는 지표) |
| `market-events.json` | `links[].upcoming` (미국채 예정 입찰) |

손으로 적은 설명·링크·중요도는 건드리지 않습니다. 파서가 최소 건수·날짜 범위 검사를
통과하지 못하면 **아무것도 덮어쓰지 않고** `fetch-report.json` 에 이유를 남깁니다.
