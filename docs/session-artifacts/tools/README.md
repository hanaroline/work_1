# 아티팩트 페이지 생성기

세션 산출물을 아티팩트로 올릴 때 쓴 스크립트입니다. 원본이 그대로 아티팩트가 되는
HTML 산출물은 스크립트 없이 파일을 그대로 게시했고, 아래 세 개는 아티팩트로 바로
열 수 없는 자료(PPTX·MP4)와 색인 페이지를 만들 때 썼습니다.

| 스크립트 | 만드는 것 |
|---|---|
| `build_decks.py` | PPTX 원본 → 슬라이드 텍스트·차트 미리보기 + 원본 내려받기 페이지 |
| `build_videos.py` | MP4 원본 → 재생 + 원본 내려받기 페이지 |
| `build_hub.py` | 주제별 색인 페이지 (한/영 토글) |
| `make_index_md.py` | `build_hub.py` 의 데이터로 상위 폴더의 `README.md` 생성 |

## 실행 전제

스크립트는 작업 폴더 기준으로 아래 구조를 기대합니다.

```
<작업폴더>/
  build_*.py
  decks/            # 각 브랜치에서 꺼낸 PPTX·PDF·MP4 원본과 decks.json
  decks/media/      # PPTX 에서 뽑은 차트 PNG
  pages/            # 생성 결과
```

`decks/` 채우는 방법 — 각 세션 브랜치에서 원본을 꺼냅니다.

```bash
git -c core.quotePath=false show \
  "origin/claude/<브랜치>:<파일경로>" > decks/<이름>
```

`decks.json` 은 `build_decks.py` 가 읽는 슬라이드 텍스트 덤프입니다
(`python-pptx` 없이 `zipfile` + `ElementTree` 로 `ppt/slides/slide*.xml` 에서 추출).

## 아티팩트 게시 시 주의

- PPTX·PDF 내려받기는 아티팩트 런타임의 확장 허용 목록에 따라 막힐 수 있습니다.
  스크립트는 `extension_not_enabled` 를 잡아 저장소 경로를 안내합니다.
- MP4 는 기본 허용 목록에 있습니다.
- 페이지 하나의 상한은 16MB 입니다. 영상은 base64 로 실리므로 원본 용량의 약 1.34배로
  계산해야 합니다.
