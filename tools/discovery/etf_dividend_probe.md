# 국내 ETF 분배금 이력 — 원천 탐색

- 탐색 시각: 2026-08-28T13:20:42.319Z
- 찾는 것: 분배율 한 숫자가 아니라 **지급일 + 주당 금액의 이력**

| 결과 | 항목 | 설명 | 요약 |
|---|---|---|---|
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/dividend` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/dividendList` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/etfDividend` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/etfDividendList` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/dividendHistory` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/finance/dividend` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:m.stock.naver.com/api/stock/{code}/distribution` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:api.stock.naver.com/stock/{code}/dividend` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver:api.stock.naver.com/etf/{code}/dividend` | 네이버 분배금 후보 | HTTP 404 |
| ❌ | `naver.rendered` | 네이버 ETF 화면이 부르는 분배금 API 관찰 | 분배금 관련 호출 없음 (전체 API 호출 4건) |
| ✅ | `yahoo.div.069500` | 야후 배당 이력 — KODEX 200 (분배율 0.78%) | 배당 8건 · 합 1684원 · 역산 연분배율 0.8% (실제 0.78%) |
| ✅ | `yahoo.div.458730` | 야후 배당 이력 — TIGER 미국배당다우존스 (분배율 3.2%) | 배당 24건 · 합 880원 · 역산 연분배율 2.9% (실제 3.2%) |
| ✅ | `yahoo.div.472150` | 야후 배당 이력 — TIGER 배당커버드콜액티브 (분배율 21.4%) | 배당 23건 · 합 5269원 · 역산 연분배율 13.1% (실제 21.4%) |
| ✅ | `yahoo.div.498400` | 야후 배당 이력 — KODEX 200타겟위클리커버드콜 (분배율 14.5%) | 배당 20건 · 합 4216원 · 역산 연분배율 10.4% (실제 14.5%) |
| ✅ | `yahoo.adequacy.069500` | 배당 자료 충분한가 — KODEX 200 | TTM 배당 4건 합 849원 → 역산 0.8% (표기 0.78%) · 계산방식 dividends · 1년 시장가 147.16 vs 총수익률 149.63 (격차 2.47) |
| ✅ | `yahoo.adequacy.458730` | 배당 자료 충분한가 — TIGER 미국배당다우존스 | TTM 배당 12건 합 438원 → 역산 2.9% (표기 3.2%) · 계산방식 dividends · 1년 시장가 23.19 vs 총수익률 26.82 (격차 3.63) |
| ✅ | `yahoo.adequacy.472150` | 배당 자료 충분한가 — TIGER 배당커버드콜액티브 | TTM 배당 12건 합 4202원 → 역산 20.9% (표기 21.4%) · 계산방식 dividends · 1년 시장가 76.06 vs 총수익률 120.3 (격차 44.24) |
| ✅ | `yahoo.adequacy.498400` | 배당 자료 충분한가 — KODEX 200타겟위클리커버드콜 | TTM 배당 12건 합 2987원 → 역산 14.7% (표기 14.5%) · 계산방식 dividends · 1년 시장가 82.92 vs 총수익률 116.82 (격차 33.9) |
| ✅ | `site.fnguide.etf` | 에프앤가이드 ETF 스냅샷 | 200 · 1829B · 분배금 흔적 없음 |
| ✅ | `site.fnguide.main` | 에프앤가이드 종목 메인 | 200 · 1829B · 분배금 흔적 없음 |
| ✅ | `site.seibro` | 예탁결제원 SEIBRO | 200 · 1048B · 분배금 흔적 없음 |
| ✅ | `site.kofia` | 금융투자협회 전자공시 | 200 · 536B · 분배금 흔적 없음 |
| ✅ | `site.krx.data` | KRX 정보데이터시스템 | 200 · 474B · 분배금 흔적 없음 |
| ❌ | `site.krx.etf` | KRX ETF 전용 사이트 | TypeError: fetch failed |
| ✅ | `site.kodex` | 삼성 KODEX | 200 · 138726B · 분배금 흔적 있음 |
| ❌ | `site.tiger` | 미래에셋 TIGER | 403 · 261B · 분배금 흔적 없음 · <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><he |
| ✅ | `site.ace` | 한국투자 ACE | 200 · 103788B · 분배금 흔적 없음 |
| ✅ | `site.sol` | 신한 SOL | 200 · 982414B · 분배금 흔적 있음 |
| ✅ | `site.rise` | KB RISE | 200 · 157645B · 분배금 흔적 있음 |
| ❌ | `site.investing` | Investing.com 국내 ETF 배당 | 403 · 3B · 분배금 흔적 없음 · 403 |
