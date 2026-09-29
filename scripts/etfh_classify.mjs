// 분류 — 자산군·투자지역·레버리지/인버스·섹터 1위.
//
// **분류는 자료를 받을 때가 아니라 화면을 만들 때 붙인다.** 수집 파일에는 원천 값만
// 남기고, 규칙을 고치면 다시 받지 않고 빌드만 다시 한다.
//
// 투자 지역은 자료의 지역 값으로 정한다(국내: 네이버 국가별 비중, 해외: 야후 분류명,
// 그것도 없으면 편입종목 상장지 비중). 이름에서 뽑은 지역은 쓰지 않는다.
// 테마는 사전 파일(받으면 붙임)로만 붙인다 — 여기서 지어내지 않는다.

const KR_REGION = { KR: '국내', US: '미국', JP: '일본', HK: '홍콩', CN: '중국', MISC: '글로벌·기타' };

// 레버리지·인버스 — 국내는 목록 탭 3(국내 파생)과 이름·운용목적(배수 추종)으로 가른다.
const RE_LEV = /레버리지|2X|울트라|leveraged|\b[23]x\b|daily\s*\(?2x|ブル|bull\s*[23]x/i;
// 'short' 는 넣지 않는다 — "Short Treasury"(단기채) 같은 이름이 인버스로 잡힌다.
const RE_INV = /인버스|곱버스|-1X|-2X|inverse|ultrashort|ベア|\bbear\b|\(-\d(\.\d)?x\)/i;
export function levInv(name, summary = '', category = '') {
  const s = `${name} ${category}`;
  if (RE_INV.test(s) || /Trading--Inverse/i.test(category)) return 'I';
  if (RE_LEV.test(s) || /Trading--Leveraged/i.test(category)) return 'L';
  if (/음의\s*\d?\s*배수|-\s*\d(\.\d)?\s*배수|역방향/.test(summary)) return 'I';
  if (/일간\s*(변동률|수익률)[^.]{0,40}[2-3](\.\d)?\s*배수/.test(summary)) return 'L';
  return null;
}

export function classifyKR(r) {
  // 자산군: 목록 탭(5 원자재, 6 채권)을 먼저, 그다음 네이버 테마 대분류 글자
  let asset = '주식';
  const large = r.theme?.large || '';
  if (r.tab === 6 || /채권/.test(large)) asset = '채권';
  else if (r.tab === 5 || /원자재|금속|에너지.*선물|농산물/.test(large)) asset = '원자재';
  else if (/부동산|리츠/.test(large)) asset = '부동산';
  else if (/혼합|자산배분/.test(large)) asset = '혼합';
  else if (/통화|달러|환율/.test(large)) asset = '통화';
  else if (/머니마켓|단기자금|금리|CD|KOFR|MMF/.test(large)) asset = '채권';
  else if (r.tab === 7 && !/주식/.test(large)) asset = '기타';
  // 지역: 국가별 비중 1위(자료 값)
  let region = '미분류', best = 0;
  for (const [k, v] of Object.entries(r.countries || {})) if (typeof v === 'number' && v > best && KR_REGION[k]) { best = v; region = KR_REGION[k]; }
  return { asset, region, li: levInv(r.name, r.summary) || (r.tab === 3 ? (/인버스/.test(r.name) ? 'I' : 'L') : null) };
}

// 야후(모닝스타) 분류명 → 자산군·지역
function fromCategory(cat) {
  if (!cat) return {};
  const c = cat.toLowerCase();
  let asset, region;
  if (/bond|treasury|government|credit|muni|ultrashort|short-term|inflation-protected|high yield|bank loan|securitized|corporate/.test(c)) asset = '채권';
  else if (/commodit|precious metals|gold|energy limited partnership/.test(c)) asset = '원자재';
  else if (/real estate/.test(c)) asset = '부동산';
  else if (/allocation|multi/.test(c)) asset = '혼합';
  else if (/currency/.test(c)) asset = '통화';
  else asset = '주식';
  if (/china|pacific\/asia ex-japan/.test(c)) region = /china/.test(c) ? '중국' : '글로벌·기타';
  else if (/japan/.test(c)) region = '일본';
  else if (/foreign|world|global|diversified emerging|europe|latin|india|emerging/.test(c)) region = '글로벌·기타';
  else if (/large|mid|small|technology|health|financial|utilities|communications|consumer|industrials|natural resources|equity energy|real estate|derivative income|trading|government|treasury|muni|corporate|intermediate|short|long|ultrashort|high yield|inflation|bank loan|securitized/.test(c)) region = '미국';
  return { asset, region };
}
const SUFFIX_REGION = [[/\.T$/, '일본'], [/\.HK$/, '홍콩'], [/\.(SS|SZ)$/, '중국'], [/\.KS$|\.KQ$/, '국내'], [/\.(L|PA|DE|AS|SW|MI|MC|CO|ST|HE|OL|BR|VI|IR|LS)$/, '글로벌·기타'], [/\.(TO|AX|NZ|SI|TW|BO|NS|JK|KL|BK|SA|MX)$/, '글로벌·기타']];
function regionFromHoldings(hs) {
  const w = {};
  let tot = 0;
  for (const h of hs || []) {
    if (typeof h.w !== 'number' || !h.code) continue;
    let reg = '미국';
    for (const [re, g] of SUFFIX_REGION) if (re.test(h.code)) { reg = g; break; }
    w[reg] = (w[reg] || 0) + h.w; tot += h.w;
  }
  if (!tot) return null;
  return Object.entries(w).sort((a, b) => b[1] - a[1])[0][0];
}

export function classifyGlobal(r) {
  const cat = fromCategory(r.category);
  let asset = cat.asset;
  if (!asset) {
    const p = r.positions || {};
    const top = Object.entries({ 주식: p.stock, 채권: p.bond }).filter(([, v]) => typeof v === 'number').sort((a, b) => b[1] - a[1])[0];
    asset = top && top[1] > 30 ? top[0] : (/gold|silver|commodit|oil|金|原油/i.test(r.name) ? '원자재' : '미분류');
  }
  let region = cat.region || regionFromHoldings(r.holdings);
  if (!region && ['SH', 'SZ'].includes(r.market)) region = null; // 본토는 편입종목이 없어 자료로 정할 수 없다
  return { asset, region: region || '미분류', li: levInv(r.name, '', r.category || '') };
}

export function sector1(sectors) {
  if (!sectors) return null;
  let best = null, bv = 0;
  for (const [k, v] of Object.entries(sectors)) if (typeof v === 'number' && v > bv) { bv = v; best = k; }
  return best;
}
