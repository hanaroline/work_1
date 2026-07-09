/*
 * 종목 매핑 데이터
 * ----------------
 * 주요 KOSPI / KOSDAQ 종목의 (종목명 → 코드 → 시장) 매핑.
 * - code    : 6자리 종목코드
 * - name    : 한국어 종목명
 * - market  : 'KOSPI' | 'KOSDAQ'
 * - aliases : 검색 시 매칭할 별칭(영문/약칭 등)
 *
 * Yahoo Finance 심볼은 시장에 따라 접미사를 붙여 사용한다.
 *   KOSPI  -> {code}.KS   (예: 005930.KS)
 *   KOSDAQ -> {code}.KQ   (예: 035760.KQ)
 *
 * 전 종목을 담지는 않는다(단일 HTML 크기 고려). 미등록 종목은
 * 6자리 코드를 직접 입력하면 조회할 수 있으며, 시장 판별은
 * resolveMarket()의 휴리스틱을 따른다.
 */
window.TICKERS = [
  // ---- KOSPI 대형주 ----
  { code: "005930", name: "삼성전자", market: "KOSPI", aliases: ["samsung", "삼전"] },
  { code: "000660", name: "SK하이닉스", market: "KOSPI", aliases: ["skhynix", "하이닉스"] },
  { code: "373220", name: "LG에너지솔루션", market: "KOSPI", aliases: ["lgensol", "엘지에너지솔루션", "엔솔"] },
  { code: "207940", name: "삼성바이오로직스", market: "KOSPI", aliases: ["samsungbiologics", "삼바"] },
  { code: "005380", name: "현대차", market: "KOSPI", aliases: ["hyundai", "현대자동차"] },
  { code: "000270", name: "기아", market: "KOSPI", aliases: ["kia"] },
  { code: "005490", name: "POSCO홀딩스", market: "KOSPI", aliases: ["posco", "포스코홀딩스", "포스코"] },
  { code: "051910", name: "LG화학", market: "KOSPI", aliases: ["lgchem", "엘지화학"] },
  { code: "006400", name: "삼성SDI", market: "KOSPI", aliases: ["samsungsdi"] },
  { code: "035420", name: "NAVER", market: "KOSPI", aliases: ["naver", "네이버"] },
  { code: "035720", name: "카카오", market: "KOSPI", aliases: ["kakao"] },
  { code: "005935", name: "삼성전자우", market: "KOSPI", aliases: ["삼성전자우선주"] },
  { code: "068270", name: "셀트리온", market: "KOSPI", aliases: ["celltrion"] },
  { code: "105560", name: "KB금융", market: "KOSPI", aliases: ["kbfinancial", "kb금융지주"] },
  { code: "055550", name: "신한지주", market: "KOSPI", aliases: ["shinhan", "신한금융지주"] },
  { code: "086790", name: "하나금융지주", market: "KOSPI", aliases: ["hana", "하나금융"] },
  { code: "316140", name: "우리금융지주", market: "KOSPI", aliases: ["woori", "우리금융"] },
  { code: "012330", name: "현대모비스", market: "KOSPI", aliases: ["mobis", "hyundaimobis"] },
  { code: "028260", name: "삼성물산", market: "KOSPI", aliases: ["samsungcnt"] },
  { code: "010130", name: "고려아연", market: "KOSPI", aliases: ["koreazinc"] },
  { code: "015760", name: "한국전력", market: "KOSPI", aliases: ["kepco", "한전"] },
  { code: "096770", name: "SK이노베이션", market: "KOSPI", aliases: ["skinnovation"] },
  { code: "034730", name: "SK", market: "KOSPI", aliases: ["sk주식회사"] },
  { code: "003670", name: "포스코퓨처엠", market: "KOSPI", aliases: ["poscofuturem", "포스코케미칼"] },
  { code: "066570", name: "LG전자", market: "KOSPI", aliases: ["lgelectronics", "엘지전자"] },
  { code: "003550", name: "LG", market: "KOSPI", aliases: ["엘지"] },
  { code: "017670", name: "SK텔레콤", market: "KOSPI", aliases: ["skt", "sktelecom"] },
  { code: "030200", name: "KT", market: "KOSPI", aliases: ["kt", "케이티"] },
  { code: "032640", name: "LG유플러스", market: "KOSPI", aliases: ["lguplus", "엘지유플러스"] },
  { code: "009150", name: "삼성전기", market: "KOSPI", aliases: ["samsungelectromech"] },
  { code: "018260", name: "삼성에스디에스", market: "KOSPI", aliases: ["samsungsds", "삼성sds"] },
  { code: "010950", name: "S-Oil", market: "KOSPI", aliases: ["soil", "에쓰오일"] },
  { code: "011200", name: "HMM", market: "KOSPI", aliases: ["hmm", "현대상선"] },
  { code: "090430", name: "아모레퍼시픽", market: "KOSPI", aliases: ["amorepacific"] },
  { code: "051900", name: "LG생활건강", market: "KOSPI", aliases: ["lghnh", "엘지생활건강"] },
  { code: "033780", name: "KT&G", market: "KOSPI", aliases: ["ktng", "케이티앤지"] },
  { code: "259960", name: "크래프톤", market: "KOSPI", aliases: ["krafton"] },
  { code: "047810", name: "한국항공우주", market: "KOSPI", aliases: ["kai"] },
  { code: "042660", name: "한화오션", market: "KOSPI", aliases: ["hanwhaocean", "대우조선해양"] },
  { code: "009540", name: "HD한국조선해양", market: "KOSPI", aliases: ["hdksoe", "현대중공업지주"] },
  { code: "329180", name: "HD현대중공업", market: "KOSPI", aliases: ["hdhi", "현대중공업"] },
  { code: "010140", name: "삼성중공업", market: "KOSPI", aliases: ["samsungheavy"] },
  { code: "012450", name: "한화에어로스페이스", market: "KOSPI", aliases: ["hanwhaaerospace"] },
  { code: "011070", name: "LG이노텍", market: "KOSPI", aliases: ["lginnotek"] },
  { code: "064350", name: "현대로템", market: "KOSPI", aliases: ["hyundairotem"] },
  { code: "086280", name: "현대글로비스", market: "KOSPI", aliases: ["glovis"] },
  { code: "161390", name: "한국타이어앤테크놀로지", market: "KOSPI", aliases: ["hankooktire"] },
  { code: "024110", name: "기업은행", market: "KOSPI", aliases: ["ibk"] },
  { code: "138040", name: "메리츠금융지주", market: "KOSPI", aliases: ["meritz"] },
  { code: "323410", name: "카카오뱅크", market: "KOSPI", aliases: ["kakaobank"] },
  { code: "377300", name: "카카오페이", market: "KOSPI", aliases: ["kakaopay"] },
  { code: "302440", name: "SK바이오사이언스", market: "KOSPI", aliases: ["skbioscience"] },
  { code: "128940", name: "한미약품", market: "KOSPI", aliases: ["hanmi"] },
  { code: "271560", name: "오리온", market: "KOSPI", aliases: ["orion"] },
  { code: "097950", name: "CJ제일제당", market: "KOSPI", aliases: ["cj제일제당"] },
  { code: "139480", name: "이마트", market: "KOSPI", aliases: ["emart"] },
  { code: "023530", name: "롯데쇼핑", market: "KOSPI", aliases: ["lotteshopping"] },
  { code: "000810", name: "삼성화재", market: "KOSPI", aliases: ["samsungfire"] },
  { code: "032830", name: "삼성생명", market: "KOSPI", aliases: ["samsunglife"] },
  { code: "180640", name: "한진칼", market: "KOSPI", aliases: ["hanjinkal"] },
  { code: "003490", name: "대한항공", market: "KOSPI", aliases: ["koreanair"] },
  { code: "004020", name: "현대제철", market: "KOSPI", aliases: ["hyundaisteel"] },
  { code: "001040", name: "CJ", market: "KOSPI", aliases: ["씨제이"] },
  { code: "267250", name: "HD현대", market: "KOSPI", aliases: ["hdhyundai"] },
  { code: "375500", name: "DL이앤씨", market: "KOSPI", aliases: ["dlenc"] },
  { code: "000720", name: "현대건설", market: "KOSPI", aliases: ["hyundaienc"] },
  { code: "047040", name: "대우건설", market: "KOSPI", aliases: ["daewooenc"] },
  { code: "241560", name: "두산밥캣", market: "KOSPI", aliases: ["doosanbobcat"] },
  { code: "034020", name: "두산에너빌리티", market: "KOSPI", aliases: ["doosanenerbility"] },
  { code: "336260", name: "두산퓨얼셀", market: "KOSPI", aliases: ["doosanfuelcell"] },
  { code: "078930", name: "GS", market: "KOSPI", aliases: ["지에스"] },
  { code: "112610", name: "씨에스윈드", market: "KOSPI", aliases: ["cswind"] },
  { code: "010120", name: "LS ELECTRIC", market: "KOSPI", aliases: ["lselectric", "엘에스일렉트릭"] },
  { code: "006800", name: "미래에셋증권", market: "KOSPI", aliases: ["miraeasset", "미래에셋"] },
  { code: "016360", name: "삼성증권", market: "KOSPI", aliases: ["samsungsecurities"] },
  { code: "039490", name: "키움증권", market: "KOSPI", aliases: ["kiwoom"] },
  { code: "071050", name: "한국금융지주", market: "KOSPI", aliases: ["koreainvestment"] },
  { code: "029780", name: "삼성카드", market: "KOSPI", aliases: ["samsungcard"] },

  // ---- KOSDAQ 대표주 ----
  { code: "247540", name: "에코프로비엠", market: "KOSDAQ", aliases: ["ecoprobm"] },
  { code: "086520", name: "에코프로", market: "KOSDAQ", aliases: ["ecopro"] },
  { code: "091990", name: "셀트리온헬스케어", market: "KOSDAQ", aliases: ["celltrionhealthcare"] },
  { code: "196170", name: "알테오젠", market: "KOSDAQ", aliases: ["alteogen"] },
  { code: "328130", name: "루닛", market: "KOSDAQ", aliases: ["lunit"] },
  { code: "058470", name: "리노공업", market: "KOSDAQ", aliases: ["leeno"] },
  { code: "066970", name: "엘앤에프", market: "KOSDAQ", aliases: ["landf"] },
  { code: "357780", name: "솔브레인", market: "KOSDAQ", aliases: ["soulbrain"] },
  { code: "277810", name: "레인보우로보틱스", market: "KOSDAQ", aliases: ["rainbowrobotics"] },
  { code: "112040", name: "위메이드", market: "KOSDAQ", aliases: ["wemade"] },
  { code: "263750", name: "펄어비스", market: "KOSDAQ", aliases: ["pearlabyss"] },
  { code: "293490", name: "카카오게임즈", market: "KOSDAQ", aliases: ["kakaogames"] },
  { code: "041510", name: "에스엠", market: "KOSDAQ", aliases: ["sm엔터", "smentertainment"] },
  { code: "035900", name: "JYP Ent.", market: "KOSDAQ", aliases: ["jyp"] },
  { code: "122870", name: "와이지엔터테인먼트", market: "KOSDAQ", aliases: ["yg"] },
  { code: "096530", name: "씨젠", market: "KOSDAQ", aliases: ["seegene"] },
  { code: "028300", name: "HLB", market: "KOSDAQ", aliases: ["hlb"] },
  { code: "145020", name: "휴젤", market: "KOSDAQ", aliases: ["hugel"] },
  { code: "022100", name: "포스코DX", market: "KOSDAQ", aliases: ["poscodx", "포스코dx"] },
  { code: "240810", name: "원익IPS", market: "KOSDAQ", aliases: ["wonikips"] },
  { code: "042700", name: "한미반도체", market: "KOSDAQ", aliases: ["hanmisemiconductor"] },
  { code: "039030", name: "이오테크닉스", market: "KOSDAQ", aliases: ["eotechnics"] },
  { code: "348370", name: "엔켐", market: "KOSDAQ", aliases: ["enchem"] },
  { code: "403870", name: "HPSP", market: "KOSDAQ", aliases: ["hpsp"] },
  { code: "005290", name: "동진쎄미켐", market: "KOSDAQ", aliases: ["dongjin"] },
  { code: "214150", name: "클래시스", market: "KOSDAQ", aliases: ["classys"] },
  { code: "141080", name: "리가켐바이오", market: "KOSDAQ", aliases: ["ligachem", "레고켐바이오"] },
  { code: "393890", name: "더블유씨피", market: "KOSDAQ", aliases: ["wcp"] },
  { code: "095340", name: "ISC", market: "KOSDAQ", aliases: ["isc"] },
  { code: "137400", name: "피엔티", market: "KOSDAQ", aliases: ["pnt"] }
];

/*
 * 입력 문자열(종목명/코드/별칭)로 종목을 찾는다.
 * 6자리 숫자면 코드로 간주하고 매핑에 없으면 최소 정보를 생성해 반환.
 */
window.resolveTicker = function resolveTicker(raw) {
  if (!raw) return null;
  const q = String(raw).trim();
  if (!q) return null;

  // 6자리 숫자 → 코드 직접 조회
  if (/^\d{6}$/.test(q)) {
    const hit = window.TICKERS.find((t) => t.code === q);
    if (hit) return hit;
    return { code: q, name: q, market: resolveMarket(q), aliases: [], unlisted: true };
  }

  const norm = q.toLowerCase().replace(/\s+/g, "");
  // 정확 일치(이름)
  let hit = window.TICKERS.find((t) => t.name.toLowerCase().replace(/\s+/g, "") === norm);
  if (hit) return hit;
  // 별칭 정확 일치
  hit = window.TICKERS.find((t) => (t.aliases || []).some((a) => a.toLowerCase() === norm));
  if (hit) return hit;
  // 부분 일치(이름/별칭)
  hit = window.TICKERS.find(
    (t) =>
      t.name.toLowerCase().replace(/\s+/g, "").includes(norm) ||
      (t.aliases || []).some((a) => a.toLowerCase().includes(norm))
  );
  return hit || null;
};

/*
 * 코드 접두로 시장(KOSPI/KOSDAQ)을 추정한다.
 * 완전히 정확하지는 않으나 미등록 코드의 접미사 결정을 위한 휴리스틱.
 * KOSDAQ 코드는 대체로 0/1/2/3으로 시작하는 특정 대역에 몰려 있으나
 * 예외가 많아, 기본은 KOSPI로 두고 매핑 우선 사용을 권장한다.
 */
function resolveMarket(code) {
  return "KOSPI";
}

/* Yahoo Finance 심볼 생성 */
window.toYahooSymbol = function toYahooSymbol(ticker) {
  const suffix = ticker.market === "KOSDAQ" ? ".KQ" : ".KS";
  return ticker.code + suffix;
};
