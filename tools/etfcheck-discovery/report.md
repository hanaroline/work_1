# ETFCHECK 관찰 2026-09-16T03:12:12.155Z

```
[마스터] 1535행
[앱이 보낸 머리글]
   sec-ch-ua-platform: "Windows"
   authorization: Bearer
   referer: https://www.etfcheck.co.kr/mobile/main
   accept-language: ko-KR
   sec-ch-ua: "HeadlessChrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"
   sec-ch-ua-mobile: ?0
   checkclient: 370ecb56a6a26f8a6e81e900aabba8ed3583379591a09e4ef91a7dfd62229922
   user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36
   accept: application/json, text/plain, */*

[재현] {"맨몸":{"status":403,"bytes":0},"머리글 복사":{"status":200,"bytes":1177037}}

[분류대응] 9092행, 표본:
   [{"F16012":"0P0001YK57","F16013":null,"domestic_flag":0,"ctgInfo":"06|0606|0606014|"},{"F16012":"0P0001YK59","F16013":null,"domestic_flag":0,"ctgInfo":"06|0606|0606014|"},{"F16012":"F000002N19","F16013":null,"domestic_flag":0,"ctgInfo":"01|0101|0101001|USA,03|0301|0301001|USA,06|0606|0606021|,02|0201|0201002|USA"}]
   커버드콜(0609005) 279행, 월배당(0609002) 1766행
   커버드콜 표본: [{"F16012":"F00000OBHG","F16013":null,"domestic_flag":0,"ctgInfo":"03|0301|0301001|USA,06|0609|0609005|,02|0201|0201002|USA,01|0101|0101999|,06|0609|0609002|,06|0606|0606008|"},{"F16012":"F00000PGIJ","F16013":null,"domestic_flag":0,"ctgInfo":"02|0201|0201004|USA,09|0901|0901001|,03|0301|0301001|USA,01|0105|0105006|,06|0606|0606008|,06|0609|0609005|,06|0609|0609002|,06|0606|0606014|,11|1101|1101006|,07|0701|0701076|"},{"F16012":"F00000PHVY","F16013":null,"domestic_flag":0,"ctgInfo":"06|0609|0609002|,06|0606|0606014|,02|0201|0201002|USA,04|0401|0401007|,01|0101|0101001|,03|0301|0301001|USA,06|06

[낱개] 표본 498400 (KODEX 200타겟위클리커버드콜)

  /mobile/etpitem/498400/basic → 200, 새 XHR 51건
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 2541B https://www.etfcheck.co.kr/user/common/getEtpCtgLarge
      (기존) 200 78904B https://www.etfcheck.co.kr/user/common/getEtpCtgMiddle
      (기존) 200 83190B https://www.etfcheck.co.kr/stock/etp/getEtfTotalExpenseRatio
      (기존) 200 110B https://www.etfcheck.co.kr/user/common/getJangGubun
      (기존) 200 1106B https://www.etfcheck.co.kr/user/etp/getEtpScreenerLog
      (기존) 200 519B https://www.etfcheck.co.kr/user/etp/getEtpMainTIekcerList?dataInfo[]=%7B%22type%22:%22index%22,%22na
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 419B https://www.etfcheck.co.kr/etc/etp/getBreakingNewsList?timeDiff=7200
      (기존) 200 317B https://www.etfcheck.co.kr/user/cust/getAdPopupList?testSuffix=
      (기존) 200 3468B https://www.etfcheck.co.kr/etc/etp/getNewsList?gubun=1&limit=14
      (기존) 200 93B https://www.etfcheck.co.kr/user/common/getLastBusinessDay?date=20260916
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 175B https://www.etfcheck.co.kr/user/member/updateBannerViewCount
      (기존) 200 162B https://www.etfcheck.co.kr/user/member/insertUserAppLog
      (기존) 200 181B https://www.etfcheck.co.kr/user/member/insertAdPopupLog
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 1177028B https://www.etfcheck.co.kr/user/common/getEtpMast
      (기존) 200 1482623B https://www.etfcheck.co.kr/user/common/getEtpCtgMap
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 162B https://www.etfcheck.co.kr/user/member/insertUserAppLog
      ★ 200 142B https://www.etfcheck.co.kr/user/etp/getEtpDiffHistAvg?F16013=498400&limit=60&type=diff
        {"success":true,"results":[{"AVG_DIFF_20D":"-0.07","AVG_DIFF_60D":"0.06","AVG_DIFF_120D":"0.08","AVG_DIFF_250D":"0.05"}],"date":1789528301921}
      ★ 200 14222B https://www.etfcheck.co.kr/user/etp/getEtpTermHist?F16013=498400&gubun=1Y
        {"success":true,"results":[{"F12506":"20260916","F15001":"19730","F15015":"3008153"},{"F12506":"20260915","F15001":"19485","F15015":"5505731"},{"F12506":"20260914","F15001":"19700","F15015":"8694404"},{"F12506":"20260911","F15001":"20460","F15015":"10898870"},{"F12506":"20260910","F15001":"20864","F15015":"6535611"},{"F12506":"20260909","F15001":"20873","F15015":"5300379"},{"F12506":"20260908","F15001":"20573","F15015":"7853416"},{"F12506":"20260907","F15001":"20553","F15015":"6071646"},{"F12506":"20260904","F15001":"19784","F15015":"5436109"},{"F12506":"20260903","F15001":"19430","F15015":"7913551"},{"F12506":"20260902","F15001":"19395","F15015":"9278717"},{"F12506":"20260901","F15001":"20198","F15015":"4333606"},{"F12506":"20260831","F15001":"20095","F15015":"5583426"},{"F12506":"20260828","F15001":"20055","F15015":"4034673"},{"F12506":"20260827","F15001":"20371","F15015":"4317887"},{"F12506":"20260826","F15001":"20085","F15015":"4537866"},{"F12506":"20260825","F15001":"19937","F15015":"4475082"},{"F12506":"20260824","F15001":"19804","F15015":"5849075"},{"F12506":"20260821","F15001":"20474","F15015":"6260582"},{"F12506":"20260820","F15001":"20188","F15015":"8812491"},{"F12506":"20260819","F15001":"18966","F15015":"8767957"},{"F12506":"20260818","F15001":"20169","F15015":"9080927"},{"F12506":"20260814","F15001":"20450","F15015":"7250314"},{"F12506":"20260813","F15001":"19908","F15015":"7719747"},{"F12506":"20260812","F15001":"19336","F15015":"8280126"},{"F12506":"20260811","F15001":"18572","F15015":"6603046"},{"F12506":"20260810","F15001":"18398","F15015":"7407031"},{"F12506":"20260807","F15001":"18368","F15015":"6334664"},{"F12506":"20260806","F15001":"18514","F15015":"7993436"},{"F12506":"20260805","F15001":"19477","F15015":"6814757"},{"F12506":"20260804","F15001":"18757","F15015":"8005966"},{"F12506":"20260803","F15001":"18572","F15015":"8688202"},{"F12506":"20260731","F15001":"19734","F15015":"10112351"},{"F12506":"20260730","F15001":"16468","F15015":"12305024"
      ★ 200 5331B https://www.etfcheck.co.kr/user/etp/getEtpItemOutline?code=498400&befDate=20250916
        {"success":true,"results":[{"ctg_large_code":"0101","ctg_large_name":"주식","DESCRIPTION":"“KODEX 200 Target Weekly Covered Call” seeks to track the daily performance of the “KOSPI 200 Target Weekly Covered Call Index” by investing in companies listed on KRX with covered call strategy using KOSPI 200 call options.","DESCRIPTION_K":"이 투자신탁은 한국거래소에서 산출하는 코스피 200 타겟 위클리 커버드콜 지수를 기초지수로 하여 1좌당 순자산가치의 변동률이 기초지수의 변동률과 유사하도록 투자신탁재산을 운용할 계획입니다. ※ 그러나 상기의 투자목적이 반드시 달성된다는 보장은 없으며, 집합투자업자, 신탁업자, 판매회사 등 이 투자신탁과 관련된 어떠한 당사자도 투자원금의 보장 또는 투자목적의 달성을 보장하지 아니합니다.","F12506":"20260916","F16012":"KR7498400001","F16013":"498400","F16002":"KODEX 200타겟위클리커버드콜","F16003":"KODEX 200타겟위클리커버드콜","F16004":"KODEX 200 Target Weekly Covered Call","F16017":"20241203","F15001":"19730","F15472":"245","F15004":"1.26","F15006":"2","F15009":"19485","F15010":"19745","F15011":"19435","F15015":"3008153","F15023":"58998474426","F15028":"5759831000000","F15029":"0.10","F30812":"0","F30813":"0.00","F18438":"0.0000","F16143":"292600000","F16073":"00","F15007":"19485","F16493":"2","F15301":"19742.00","F15302":"0.02","F15303":"201.92","F15304":"-0.06","F15305":"-12.00","F30818":"1.03","F15318":"3136.6000","F16497":"202","F31892":"0","F18450":"KRW","F18001":"99638","F16500":"5717427","F33307":"0","F33308":"0","F33951":"1","F15319":"31.2900","F30823":"1.01","F15602":"19742.00","F15631":"1.0281","F15632":"1.0026","F15633":"0.0255","F19288":"0.00","F34515":"1969762000","F16499":"100000.0000","F03329":"19540.08","F18439":"","F16109":"292600000","F16257":"36030","F34777":"코스피 200 타겟 15% 위클리 커버드콜 지수","F16166":null,"F34521":"0","F34776":"","F34514":"P","F34239":"168","F34241":"K","F34769":"0","F34770":"1","F34771":"1","F34772":"0","F34775":"0","F34778":"1","F34779":"3","F34780":"5","F34781":"0","F34782":"0","F34783":"0","F33960":"3020","F33961":"삼성자산운용(ETF)","F33962":"SAMSUNG ASSET MANAGEMENT","F33929":"1","F33267":"12110200","F30824":"0.00","F18453":"1.00","F34240":"N","F30819":"0.00","F18101":"0.000000","F34374":"0.00","F1
      (기존) 200 2541B https://www.etfcheck.co.kr/user/common/getEtpCtgLarge
      ★ 200 286B https://www.etfcheck.co.kr/user/etp/getEtpDesc?code=498400
        {"success":true,"results":[{"DESCRIPTION_K":"이 투자신탁은 한국거래소에서 산출하는 코스피 200 타겟 위클리 커버드콜 지수를 기초지수로 하여 1좌당 순자산가치의 변동률이 기초지수의 변동률과 유사하도록 투자신탁재산을 운용할 계획입니다. ※ 그러나 상기의 투자목적이 반드시 달성된다는 보장은 없으며, 집합투자업자, 신탁업자, 판매회사 등 이 투자신탁과 관련된 어떠한 당사자도 투자원금의 보장 또는 투자목적의 달성을 보장하지 아니합니다."}],"date":1789528302208}
      (기존) 200 747B https://www.etfcheck.co.kr/user/etp/getScaleCtgName
      (기존) 200 78904B https://www.etfcheck.co.kr/user/common/getEtpCtgMiddle
      (기존) 200 182B https://www.etfcheck.co.kr/user/member/insertEtpInfoLog
      (기존) 200 93B https://www.etfcheck.co.kr/user/common/getLastBusinessDay?date=20260916
      (기존) 200 83190B https://www.etfcheck.co.kr/stock/etp/getEtfTotalExpenseRatio
      (기존) 200 110B https://www.etfcheck.co.kr/user/common/getJangGubun
      (기존) 200 519B https://www.etfcheck.co.kr/user/etp/getEtpMainTIekcerList?dataInfo[]=%7B%22type%22:%22index%22,%22na
      (기존) 200 1106B https://www.etfcheck.co.kr/user/etp/getEtpScreenerLog
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      ★ 200 12962B https://www.etfcheck.co.kr/user/etp/getSimpleEtpHist?F16013=498400&limit=60&type=diff
        {"success":true,"results":[{"F12506":"20260916","F15001":"19735","F16500":"5717427","F15301":"19748.88","F15304":"-0.07","F33293":"-0.07","F15303":"208.80","F33835":"0","F33836":"0","F19330":"-0.28","inflow":"0.00","DAY_WEEK":2},{"F12506":"20260915","F15001":"19485","F16500":"5717427","F15301":"19540.08","F15304":"-0.28","F33293":"-0.28","F15303":"-150.57","F33835":"0","F33836":"0","F19330":"0.04","inflow":"0.00","DAY_WEEK":1},{"F12506":"20260914","F15001":"19700","F16500":"5761719","F15301":"19691.45","F15304":"0.02","F33293":"0.02","F15303":"-740.63","F33835":"0","F33836":"0","F19330":"1.59","inflow":"0.00","DAY_WEEK":0},{"F12506":"20260911","F15001":"20460","F16500":"5979427","F15301":"20435.50","F15304":"0.12","F33293":"0.12","F15303":"-402.76","F33835":"3100000","F33836":"0","F19330":"0.16","inflow":"64598606000.00","DAY_WEEK":4},{"F12506":"20260910","F15001":"20864","F16500":"6119026","F15301":"21136.53","F15304":"0.16","F33293":"0.16","F15303":"-31.65","F33835":"500000","F33836":"0","F19330":"0.06","inflow":"10584090000.00","DAY_WEEK":3},{"F12506":"20260909","F15001":"20873","F16500":"6117603","F15301":"21168.18","F15304":"0.06","F33293":"0.06","F15303":"277.83","F33835":"1500000","F33836":"0","F19330":"-0.07","inflow":"31335525000.00","DAY_WEEK":2},{"F12506":"20260908","F15001":"20573","F16500":"6005975","F15301":"20890.35","F15304":"-0.07","F33293":"-0.08","F15303":"-86.80","F33835":"300000","F33836":"0","F19330":"-0.58","inflow":"6293145000.00","DAY_WEEK":1},{"F12506":"20260907","F15001":"20553","F16500":"6024638","F15301":"20977.15","F15304":"-0.58","F33293":"-0.26","F15303":"913.35","F33835":"1400000","F33836":"0","F19330":"0.06","inflow":"28089320000.00","DAY_WEEK":0},{"F12506":"20260904","F15001":"19784","F16500":"5734233","F15301":"20063.80","F15304":"0.06","F33293":"0.14","F15303":"340.56","F33835":"4600000","F33836":"0","F19330":"-0.04","inflow":"90726904000.00","DAY_WEEK":4},{"F12506":"20260903","F15001":"19430","F16500":"5546175","F15301":"19723.2
      ★ 200 110B https://www.etfcheck.co.kr/user/etp/getEtpLatestFee?code=498400
        {"success":true,"results":[{"TRADEDATE":"202608","TER":"0.42000","TOTAL_FEE":"0.50950"}],"date":1789528302886}
      ★ 200 136B https://www.etfcheck.co.kr/user/etp/getEtpItemOutlineAssetRank2?code=498400&F16012=KR7498400001&ctgLargeCode=0101&etpType=ETF
        {"success":true,"results":[{"F16012":"KR7498400001","NET_ASSET":"5759831000000","TOTAL_CNT":"1171","ROWNUM":"11"}],"date":1789528302972}
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 175B https://www.etfcheck.co.kr/user/member/updateBannerViewCount
      (기존) 200 162B https://www.etfcheck.co.kr/user/member/insertUserAppLog
      ★ 200 136B https://www.etfcheck.co.kr/user/etp/getEtpItemOutlineAssetRank?code=498400&F16012=KR7498400001&ctgLargeCode=0101&etpType=ETF
        {"success":true,"results":[{"F16012":"KR7498400001","NET_ASSET":"5717427000000","TOTAL_CNT":"1171","ROWNUM":"11"}],"date":1789528303310}
      (기존) 200 1482623B https://www.etfcheck.co.kr/user/common/getEtpCtgMap
      (기존) 200 1177032B https://www.etfcheck.co.kr/user/common/getEtpMast
      ★ 200 608B https://www.etfcheck.co.kr/user/etp/getEtpItemRecommendList?limit=3&code=498400&type=ETF&assetCode=0101&scaleCode=0301001&ctgCodeList[]=1101002&ctgCodeList[]=1101003&ctgCodeList[]=0609002&ctgCodeList[]=0609005&ctgCodeList[]=0606008&ctgCodeList[]=0501002
        {"success":true,"results":[{"F16002":"TIGER 미국나스닥100타겟데일리커버드콜","F16013":"486290","F15001":"10230","F15004":"0.44","F15028":"2435426000000","ETP_TYPE":"ETF","ctgCode":"0609005","assetCode":"0101","scaleCode":"0301001"},{"F16002":"TIGER 배당커버드콜액티브","F16013":"472150","F15001":"19840","F15004":"1.04","F15028":"2396790000000","ETP_TYPE":"ETF","ctgCode":"0609005","assetCode":"0101","scaleCode":"0301001"},{"F16002":"KODEX 미국배당커버드콜액티브","F16013":"441640","F15001":"12330","F15004":"0.41","F15028":"1701540000000","ETP_TYPE":"ETF","ctgCode":"0609005","assetCode":"0101","scaleCode":"0301001"}],"date":1789528305764}
      ★ 200 50B https://www.etfcheck.co.kr/etc/etp/getTodayDisclosureTitleList?code=498400
        {"success":true,"results":[],"date":1789528305766}
      ★ 200 173B https://www.etfcheck.co.kr/user/etp/getEtpItemCash?code=498400
        {"success":true,"results":[{"F12506":"20260914","F15007":"20460","F03003":"20460","F31892":"300","DIV_RATE":"1.45","DIV_COUNT":"12","TAX_BASE":"2.00"}],"date":1789528305824}
      ★ 200 50B https://www.etfcheck.co.kr/user/member/checkFavorItem?email=&code=498400
        {"success":true,"results":[],"date":1789528305957}
      ★ 200 587B https://www.etfcheck.co.kr/user/etp/getGlobalEtfItemRecommendList?limit=2&code=498400&assetCode=0101&scaleCode=0301001&ctgCodeList[]=1101002&ctgCodeList[]=1101003&ctgCodeList[]=0609002&ctgCodeList[]=0609005&ctgCodeList[]=0606008&ctgCodeList[]=0501002
        {"success":true,"results":[{"MSTARID":"F000014SF4","FUNDNAME":"JPMorgan Equity Premium Income ETF","SYMBOL":"JEPI","F15001":"56.19","F15004":"-0.57","F15028":"45270878250","ETP_TYPE":"ETF","F16012":"F000014SF4","ctg_code":"0609005","assetCode":"0101","scaleCode":"0301001","ctgCode":"0609005"},{"MSTARID":"F00001DH2R","FUNDNAME":"JPMorgan Nasdaq Equity Premium Inc ETF","SYMBOL":"JEPQ","F15001":"59.08","F15004":"-0.45","F15028":"41997018000","ETP_TYPE":"ETF","F16012":"F00001DH2R","ctg_code":"0609005","assetCode":"0101","scaleCode":"0301001","ctgCode":"0609005"}],"date":1789528306079}
      ★ 200 2726327B https://www.etfcheck.co.kr/user/common/getGlobalEtfMast
        {"success":true,"results":[{"MSTARID":"F00001DC2E","FUNDNAME":"-1x Short VIX Futures ETF","SIMPLE_CODE":"SVIX.K","SYMBOL":"SVIX","INCEPDATE":"20220328","COMNAME":"VS TRUST","F11011":"20260915","F15001":"27.79","F15004":"-0.22","UPDATE_TIME":"2026-09-16 12:04:06","W01001":"-1.59348","W01005":"14.69253","YLD1D":"-0.93655","YLD1W":"-3.09238","YLDYTD":"14.87664","W01011":"-2.05503","W01015":"16.05448","GROSSEXPRTO":"3.93000","NETEXPRTO":"3.93000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SEA9","FUNDNAME":"21Shares 2x Long Dogecoin ETF","SIMPLE_CODE":"TXXD.O","SYMBOL":"TXXD","INCEPDATE":"20251119","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"36.12","F15004":"-9.39","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-19.58904","W01005":"-72.02421","YLD1D":"0.06439","YLD1W":"-1.45085","YLDYTD":"-68.99020","W01011":"-1.64183","W01015":"-69.11235","GROSSEXPRTO":"3.36000","NETEXPRTO":"3.36000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001TA1A","FUNDNAME":"21Shares 2x Long HYPE ETF","SIMPLE_CODE":"TXXH.O","SYMBOL":"TXXH","INCEPDATE":"20260429","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"56.25","F15004":"-10.09","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-17.40819","W01005":null,"YLD1D":"2.31452","YLD1W":"-9.89114","YLDYTD":"0.00000","W01011":"-10.92908","W01015":null,"GROSSEXPRTO":"1.89000","NETEXPRTO":"1.89000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SW45","FUNDNAME":"21Shares 2x Long Sui ETF","SIMPLE_CODE":"TXXS.O","SYMBOL":"TXXS","INCEPDATE":"20251203","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"18.53","F15004":"-12.33","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-28.76464","W01005":"-88.40218","YLD1D":"2.31459","YLD1W":"-7.44643","YLDYTD":"-86.69326","W01011":"-9.65452","W01015":"-87.02648","GROSSEXPRTO":"4.55000","NETEXPRTO":"4.55000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SUUX","FUNDNAME":"21Shares Active Crypto ETF","SIMP

  /mobile/etpitem/498400/dividend → 실패 Error: page.goto: net::ERR_EMPTY_RESPONSE at https://www.etfcheck.co.kr/mobile/etpitem/498, 새 XHR 19건
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 2541B https://www.etfcheck.co.kr/user/common/getEtpCtgLarge
      (기존) 200 317B https://www.etfcheck.co.kr/user/cust/getAdPopupList?testSuffix=
      (기존) 200 78904B https://www.etfcheck.co.kr/user/common/getEtpCtgMiddle
      (기존) 200 83190B https://www.etfcheck.co.kr/stock/etp/getEtfTotalExpenseRatio
      (기존) 200 3468B https://www.etfcheck.co.kr/etc/etp/getNewsList?gubun=1&limit=14
      (기존) 200 419B https://www.etfcheck.co.kr/etc/etp/getBreakingNewsList?timeDiff=7200
      (기존) 200 93B https://www.etfcheck.co.kr/user/common/getLastBusinessDay?date=20260916
      (기존) 200 519B https://www.etfcheck.co.kr/user/etp/getEtpMainTIekcerList?dataInfo[]=%7B%22type%22:%22index%22,%22na
      (기존) 200 1106B https://www.etfcheck.co.kr/user/etp/getEtpScreenerLog
      (기존) 200 110B https://www.etfcheck.co.kr/user/common/getJangGubun
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 175B https://www.etfcheck.co.kr/user/member/updateBannerViewCount
      (기존) 200 181B https://www.etfcheck.co.kr/user/member/insertAdPopupLog
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 3432B https://www.etfcheck.co.kr/user/cust/getbannerInfo?testSuffix=
      (기존) 200 1482623B https://www.etfcheck.co.kr/user/common/getEtpCtgMap
      (기존) 200 1177034B https://www.etfcheck.co.kr/user/common/getEtpMast
      ★ 200 2726327B https://www.etfcheck.co.kr/user/common/getGlobalEtfMast
        {"success":true,"results":[{"MSTARID":"F00001DC2E","FUNDNAME":"-1x Short VIX Futures ETF","SIMPLE_CODE":"SVIX.K","SYMBOL":"SVIX","INCEPDATE":"20220328","COMNAME":"VS TRUST","F11011":"20260915","F15001":"27.79","F15004":"-0.22","UPDATE_TIME":"2026-09-16 12:04:06","W01001":"-1.59348","W01005":"14.69253","YLD1D":"-0.93655","YLD1W":"-3.09238","YLDYTD":"14.87664","W01011":"-2.05503","W01015":"16.05448","GROSSEXPRTO":"3.93000","NETEXPRTO":"3.93000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SEA9","FUNDNAME":"21Shares 2x Long Dogecoin ETF","SIMPLE_CODE":"TXXD.O","SYMBOL":"TXXD","INCEPDATE":"20251119","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"36.12","F15004":"-9.39","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-19.58904","W01005":"-72.02421","YLD1D":"0.06439","YLD1W":"-1.45085","YLDYTD":"-68.99020","W01011":"-1.64183","W01015":"-69.11235","GROSSEXPRTO":"3.36000","NETEXPRTO":"3.36000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001TA1A","FUNDNAME":"21Shares 2x Long HYPE ETF","SIMPLE_CODE":"TXXH.O","SYMBOL":"TXXH","INCEPDATE":"20260429","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"56.25","F15004":"-10.09","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-17.40819","W01005":null,"YLD1D":"2.31452","YLD1W":"-9.89114","YLDYTD":"0.00000","W01011":"-10.92908","W01015":null,"GROSSEXPRTO":"1.89000","NETEXPRTO":"1.89000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SW45","FUNDNAME":"21Shares 2x Long Sui ETF","SIMPLE_CODE":"TXXS.O","SYMBOL":"TXXS","INCEPDATE":"20251203","COMNAME":"21Shares US LLC","F11011":"20260915","F15001":"18.53","F15004":"-12.33","UPDATE_TIME":"2026-09-16 12:04:11","W01001":"-28.76464","W01005":"-88.40218","YLD1D":"2.31459","YLD1W":"-7.44643","YLDYTD":"-86.69326","W01011":"-9.65452","W01015":"-87.02648","GROSSEXPRTO":"4.55000","NETEXPRTO":"4.55000","TRADEDATE":"20260914","TRADEDATE_TRI":"20260911"},{"MSTARID":"F00001SUUX","FUNDNAME":"21Shares Active Crypto ETF","SIMP
```
