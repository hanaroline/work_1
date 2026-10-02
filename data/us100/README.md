# data/us100 — 이 폴더에는 데이터가 없습니다

미국 100대 기업 화면(`us-top100.html`)이 쓰는 데이터는 **히스토리를 남기지 않는
데이터 전용 브랜치**에 있습니다.

    https://github.com/hanaroline/work_1/tree/us100-data/data/us100

이유는 크기입니다. 종목별 차트 100개(약 3MB)가 매일 통째로 바뀌고 가격 파일은 장중
10분마다 바뀝니다. 이것을 `main` 히스토리에 쌓으면 저장소가 1년에 1GB 규모로 붇습니다.
이 화면에서 의미가 있는 것은 **지금 조회되는 값**이고 과거에 조회했던 값이 아니므로,
데이터 브랜치는 **갱신할 때마다 부모 없는 커밋 하나로 갈아끼웁니다**(과거 미보존).

| 이 폴더에 남아 있는 것 | 역할 |
|---|---|
| `latest.json` · `quotes.json` | `{"movedTo": ...}` **안내 파일**. 예전 경로를 보고 있는 화면이 새 위치를 찾아갑니다 |
| `REFRESH` | 파일을 고쳐 push 하면 전체 수집 워크플로가 돕니다 |
| `QUOTES_REFRESH` | 파일을 고쳐 push 하면 가격 갱신 워크플로가 돕니다 |
| `RANK_REFRESH` | 파일을 고쳐 push 하면 대상 목록 점검이 돕니다 |

## 데이터 브랜치에 들어 있는 것

| 파일 | 내용 |
|---|---|
| `latest.json` | 전 종목 요약 — 시세·지표·목표주가·일정·실적·뉴스 (약 1 MB) |
| `quotes.json` | 가격만 (약 20 KB, 장중 갱신) |
| `chart/{티커}.json` | 종목별 일봉 2년 + 월봉 10년 (100개, 약 3 MB) |
| `ranking.json` | 대상 목록 점검 결과 (화면이 읽습니다) |
| **`us-top100-offline.html`** | **인터넷 없이 열리는 오프라인 판** (약 4.3 MB) — 위 데이터를 HTML 안에 넣어 만든 파일 하나 |

오프라인 판은 이 주소에서 바로 받습니다(열고 **다른 이름으로 저장**):

    https://raw.githubusercontent.com/hanaroline/work_1/us100-data/data/us100/us-top100-offline.html

Actions 실행 페이지의 **Artifacts** 에도 같은 파일이 올라가지만, 그쪽은 로그인해서 zip 을
풀어야 하고 14일 뒤 사라집니다. 위 주소는 늘 가장 새 판입니다.

올리는 절차는 `scripts/publish_us100_data.sh` 에 있습니다(실제 일은 시장 중립인
`scripts/publish_data_branch.sh` 가 합니다 — 국내 화면도 같은 스크립트를 씁니다).

## 사내망에서 파일로 쓰려면

브라우저가 GitHub 에 못 붙는 환경이라면, 데이터를 이 폴더로 받아 두고 저장소를 로컬에서
띄우면 됩니다(화면은 상대 경로 `data/us100/` 도 후보로 봅니다).

```bash
git fetch origin us100-data
git checkout origin/us100-data -- data/us100      # 안내 파일이 실제 데이터로 덮인다
python3 -m http.server 8000                        # http://localhost:8000/us-top100.html
```

사내 웹서버에 올려 두고 화면 ⑨ 섹션 **데이터 경로 설정**에 그 주소를 넣어도 됩니다.
