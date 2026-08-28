# ETF 자료 전수 감사

감사 시각: 2026-08-28T22:35:36.459Z
자료 기준: 2026-08-28T22:33:57.104Z
대상: 1348 종목

**오류 31건 · 경고 1107건 · 참고 1242건**
**오류가 있는 종목 25 / 1348**

이 감사는 바깥 자료에 붙지 않는다. `data/etf.js` 안에서 서로 어긋나는 것만
잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.

## 규칙별

| 심각도 | 규칙 | 건수 | 종목수 |
|---|---|---:|---:|
| error | 총보수-영 | 24 | 24 |
| error | tr-내포분배율-과다 | 4 | 1 |
| error | 수익률-범위밖 | 4 | 2 |
| warn | price-nav-괴리 | 885 | 562 |
| warn | D1-등락률-불일치 | 148 | 148 |
| warn | 보유비중-일부없음 | 63 | 63 |
| warn | tr-내포분배율-큼 | 6 | 3 |
| warn | 유입-기간역전 | 2 | 2 |
| warn | 설정액-과소 | 1 | 1 |
| warn | 괴리율-과다 | 1 | 1 |
| info | 보유비중-미공시 | 668 | 668 |
| info | 섹터비중-합이상 | 138 | 138 |
| info | 자산비중-합이상 | 138 | 138 |
| info | 국가비중-합이상 | 138 | 138 |
| info | 국가비중-음수 | 52 | 52 |
| info | 보유종목-없음 | 52 | 52 |
| info | 설정액-없음 | 28 | 28 |
| info | 총보수-없음 | 26 | 26 |
| info | 시총-설정액-괴리 | 1 | 1 |
| info | 거래정지-의심 | 1 | 1 |

## 오류 상세

| 종목 | 규칙 | 내용 |
|---|---|---|
| 381560 HANARO Fn전기&수소차 | tr-내포분배율-과다 | M6: 총수익률 1837.03% vs 시장가 16.79% → 누적 내포분배율 1558.56% (한도 150%) |
| 381560 HANARO Fn전기&수소차 | tr-내포분배율-과다 | YTD: 총수익률 2887.67% vs 시장가 80.13% → 누적 내포분배율 1558.62% (한도 200%) |
| 381560 HANARO Fn전기&수소차 | tr-내포분배율-과다 | Y1: 총수익률 3582.39% vs 시장가 122.02% → 누적 내포분배율 1558.58% (한도 200%) |
| 381560 HANARO Fn전기&수소차 | tr-내포분배율-과다 | Y3: 총수익률 219.44% vs 시장가 23.95% → 누적 내포분배율 1611.7% (한도 400%) |
| 381560 HANARO Fn전기&수소차 | 수익률-범위밖 | tr.M6 = 1837.03% (500% 초과) |
| 381560 HANARO Fn전기&수소차 | 수익률-범위밖 | tr.YTD = 2887.67% (500% 초과) |
| 381560 HANARO Fn전기&수소차 | 수익률-범위밖 | tr.Y1 = 3582.39% (500% 초과) |
| 2823 iShares Asia Trust - iShares FTSE A50 China Index ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 2801 iShares Asia Trust - iShares Core MSCI China Index ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1306 NEXT FUNDS TOPIX Exchange Traded Fund | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1305 iFreeETF TOPIX (Yearly Dividend Type) | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1348 MAXIS TOPIX ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1321 NEXT FUNDS Nikkei 225 Exchange Traded Fund | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1320 iFreeETF Nikkei225 (Yearly Dividend Type) | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1330 Amova Exchange Traded Index Fund 225 | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1329 iShares Core Nikkei 225 ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 2516 TSE Growth 250 ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1545 NEXT FUNDS NASDAQ-100(R) (Unhedged) Exchange Traded Fund | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 2568 Listed Index Fund US Equity (NASDAQ100) No Currency Hedge | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 2558 MAXIS S&P500 US Equity ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1655 iShares S&P 500 ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1657 iShares Core MSCI Kokusai ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 2559 MAXIS World Equity (MSCI ACWI) ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1343 NEXT FUNDS REIT INDEX ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1476 iShares Core Japan REIT ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1540 Japan Physical Gold ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1671 Simplex WTI ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1489 NEXT FUNDS Nikkei 225 High Dividend Yield Stock 50 Index Exchange Traded Fd | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1478 iShares MSCI Japan High Dividend ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1570 NEXT FUNDS Nikkei 225 Leveraged Index Exchange Traded Fund | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |
| 1357 NEXT FUNDS Nikkei 225 Double Inverse Index ETF | 총보수-영 | ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다 |