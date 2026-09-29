// 분류 — 자산군·투자지역·레버리지/인버스·테마·섹터 1위.
//
// **분류는 자료를 받을 때가 아니라 화면을 만들 때 붙인다.** 수집 파일에는 원천 값만
// 남기고, 규칙을 고치면 다시 받지 않고 빌드만 다시 한다.
// **이름으로 가르는 낱말은 전부 data/etfh/dictionary.json 한 곳에 있다.** 여기엔 맞추는 방법만 둔다.
//
// 투자 지역은 자료의 지역 값으로 정한다(국내: 네이버 국가별 비중 1위, 해외: 야후 분류명,
// 그것도 없으면 편입종목 상장지 비중). 이름에서 뽑은 지역(nameRegion)은 분류 점검에서
// 어긋난 것을 보여 줄 때만 쓴다.

import fs from 'node:fs';

export function loadDict(path = 'data/etfh/dictionary.json') {
  const d = JSON.parse(fs.readFileSync(path, 'utf8'));
  const clean = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => !k.startsWith('_')));
  return { themes: clean(d['테마']), guards: clean(d['보호어']), lev: d['레버리지'] || [], inv: d['인버스'] || [], regionNames: clean(d['지역이름']) };
}

// ── 낱말 맞추기 ──
const isAlnum = (c) => !!c && /[a-z0-9]/i.test(c);
const isHangul = (c) => !!c && /[가-힣]/.test(c);

function findAll(text, kw) {
  const out = [];
  let i = text.indexOf(kw);
  while (i >= 0) { out.push(i); i = text.indexOf(kw, i + 1); }
  return out;
}

// text 안에 kw 가 규칙대로 들어 있나.
//  - 대소문자 무시
//  - kw 의 첫 글자가 영·숫자면 바로 앞 글자가 영·숫자가 아니어야, 끝 글자가 영·숫자면 바로 뒤가 영·숫자가 아니어야
//  - 보호어: kw 자리에서 시작하는(또는 kw 를 품은) 더 긴 낱말이 보호어면 그 자리는 안 친다
//  - 원래 형태와, 띄어쓰기를 지운 형태 둘 다 본다
export function hasWord(text, kw, guards = {}) {
  if (!text || !kw) return false;
  const T = String(text).toLowerCase();
  const K = String(kw).toLowerCase();
  // 띄어쓰기를 지운 형태 — 경계는 원래 글자 자리로 되짚어 본다(지우면 'KODEX 2차전지' 가
  // 'kodex2차전지' 가 되어 '2' 앞이 영·숫자처럼 보인다).
  const map = [];
  let Tn = '';
  for (let i = 0; i < T.length; i++) if (!/\s/.test(T[i])) { map.push(i); Tn += T[i]; }
  const Kn = K.replace(/\s+/g, '');
  const tries = [[T, K, null]];
  if (Tn !== T || Kn !== K) tries.push([Tn, Kn, map]);
  const gs = (guards[kw] || guards[K] || []).map((g) => g.toLowerCase());
  for (const [t, k, m] of tries) {
    if (!k) continue;
    for (const i of findAll(t, k)) {
      const bi = m ? m[i] - 1 : i - 1;
      const ai = m ? m[i + k.length - 1] + 1 : i + k.length;
      const before = T[bi], after = T[ai];
      if (isAlnum(k[0]) && isAlnum(before)) continue;
      if (isAlnum(k[k.length - 1]) && isAlnum(after)) continue;
      // 보호어 — 이 자리를 덮는 보호어가 있으면 건너뛴다
      let guarded = false;
      for (const g of gs) {
        const off = g.indexOf(k);
        if (off >= 0 && t.slice(i - off, i - off + g.length) === g) { guarded = true; break; }
      }
      if (guarded) continue;
      return true;
    }
  }
  return false;
}

// 낱말 목록 중 하나라도 맞고, '!' 낱말은 하나도 안 맞아야 한다
export function matchList(text, words, guards) {
  const pos = words.filter((w) => !w.startsWith('!'));
  const neg = words.filter((w) => w.startsWith('!')).map((w) => w.slice(1));
  if (neg.some((w) => hasWord(text, w, guards))) return false;
  return pos.some((w) => hasWord(text, w, guards));
}

const textOf = (r) => [r.name, r.nameEn, r.index].filter(Boolean).join(' / ');

export function themesOf(r, dict) {
  const t = textOf(r);
  return Object.entries(dict.themes).filter(([, ws]) => matchList(t, ws, dict.guards)).map(([k]) => k);
}

export function nameRegion(r, dict) {
  const t = textOf(r);
  const hit = Object.entries(dict.regionNames).filter(([, ws]) => matchList(t, ws, dict.guards)).map(([k]) => k);
  return hit.length === 1 ? hit[0] : hit.length > 1 ? hit.join('+') : null;
}

// 레버리지·인버스 — 사전 낱말(이름) + 운용목적의 배수 문구(국내) + 야후 분류명(해외)
export function levInv(r, dict) {
  const t = textOf(r);
  const cat = r.category || '';
  const summary = r.summary || '';
  const w = r.wiseType || '';
  // 이름에 배수가 적혀 있으면 그것이 먼저다 — 홍콩 CSOP 는 시리즈 이름("Leveraged and Inverse
  // Series")에 두 낱말이 다 들어 있어 낱말로는 못 가른다.
  const mult = String(r.name || '').match(/\(\s*(-?)\s*(\d+(?:\.\d+)?)\s*x\s*\)/i);
  if (mult) { if (mult[1] === '-') return 'I'; if (Number(mult[2]) > 1) return 'L'; }
  if (/인버스/.test(w)) return 'I';
  if (/레버리지/.test(w)) return 'L';
  if (/Trading--Inverse/i.test(cat) || matchList(t, dict.inv, dict.guards) || /음의\s*\d?\s*배수|-\s*\d(\.\d)?\s*배수|역방향/.test(summary)) return 'I';
  if (/Trading--Leveraged/i.test(cat) || matchList(t, dict.lev, dict.guards) || /일간\s*(변동률|수익률)[^.]{0,40}[2-3](\.\d)?\s*배수/.test(summary)) return 'L';
  return null;
}

// ── 자산군·지역 (자료 값) ──
const KR_REGION = { KR: '국내', US: '미국', JP: '일본', HK: '홍콩', CN: '중국', MISC: '글로벌·기타' };

export function assetKR(r) {
  const w = r.wiseType || '';
  const large = r.theme?.large || '';
  // wisereport 유형이 있으면 그것을 먼저(자료 값). **순서가 중요하다** — "국내혼합형, 주식/채권" 은
  // '채권' 을 품었지만 혼합이고, "해외상품, 부동산" 은 '상품' 을 품었지만 리츠다.
  if (/혼합/.test(w)) return '혼합';
  if (/부동산|리츠/.test(w)) return '부동산';
  if (/채권/.test(w)) return '채권';
  if (/상품/.test(w)) return '원자재';
  if (/통화/.test(w)) return '통화';
  if (/주식/.test(w)) return '주식';
  // 파생형(해외파생·국내파생)이거나 유형이 없으면 네이버 목록 탭(5 원자재, 6 채권) + 테마 대분류
  if (r.tab === 6 || /채권|단기자금/.test(large)) return '채권';
  if (r.tab === 5 || /원자재/.test(large)) return '원자재';
  if (/멀티에셋/.test(large)) return '혼합';
  if (/통화/.test(large)) return '통화';
  if (/부동산|리츠/.test(large)) return '부동산';
  if ([1, 2, 3, 4].includes(r.tab)) return '주식';
  return '기타';
}

export function regionKR(r) {
  let region = '미분류', best = 0;
  for (const [k, v] of Object.entries(r.countries || {})) if (typeof v === 'number' && v > best && KR_REGION[k]) { best = v; region = KR_REGION[k]; }
  return region;
}

// 야후(모닝스타) 분류명 → 자산군·지역
export function fromCategory(cat) {
  if (!cat) return {};
  const c = cat.toLowerCase();
  let asset, region;
  if (/bond|treasury|government|credit|muni|ultrashort|short-term|inflation-protected|high yield|bank loan|securitized|corporate/.test(c)) asset = '채권';
  else if (/commodit|precious metals|digital assets/.test(c)) asset = /digital/.test(c) ? '기타' : '원자재';
  else if (/real estate/.test(c)) asset = '부동산';
  else if (/allocation|multi/.test(c)) asset = '혼합';
  else if (/currency/.test(c)) asset = '통화';
  else asset = '주식';
  if (/china/.test(c)) region = '중국';
  else if (/japan/.test(c)) region = '일본';
  else if (/foreign|world|global|diversified emerging|europe|latin|india|emerging|pacific|asia/.test(c)) region = '글로벌·기타';
  else if (/commodit|digital/.test(c)) region = '글로벌·기타';
  else region = '미국'; // 모닝스타 미국 분류(Large Blend, Intermediate Core Bond …)는 미국 투자 대상
  return { asset, region };
}
const SUFFIX_REGION = [[/\.T$/, '일본'], [/\.HK$/, '홍콩'], [/\.(SS|SZ)$/, '중국'], [/\.(KS|KQ)$/, '국내'], [/\.[A-Z]{1,3}$/, '글로벌·기타']];
export function regionFromHoldings(hs) {
  const w = {};
  let tot = 0;
  for (const h of hs || []) {
    if (typeof h.w !== 'number' || !h.code) continue;
    let reg = '미국'; // 접미사 없는 야후 기호는 미국 상장
    for (const [re, g] of SUFFIX_REGION) if (re.test(h.code)) { reg = g; break; }
    w[reg] = (w[reg] || 0) + h.w; tot += h.w;
  }
  if (!tot) return null;
  return Object.entries(w).sort((a, b) => b[1] - a[1])[0][0];
}

export function classify(r, dict) {
  const out = { themes: themesOf(r, dict), nameRegion: nameRegion(r, dict), li: levInv(r, dict) };
  if (r.market === 'KR') {
    out.asset = assetKR(r);
    out.region = regionKR(r);
    out.regionSrc = '네이버 국가별 비중 1위';
  } else {
    const cat = fromCategory(r.category);
    out.asset = cat.asset;
    if (!out.asset) {
      const p = r.positions || {};
      const top = Object.entries({ 주식: p.stock, 채권: p.bond }).filter(([, v]) => typeof v === 'number').sort((a, b) => b[1] - a[1])[0];
      out.asset = top && top[1] > 30 ? top[0] : '미분류';
    }
    if (cat.region) { out.region = cat.region; out.regionSrc = '야후 분류명'; }
    else { const h = regionFromHoldings(r.holdings); out.region = h || '미분류'; out.regionSrc = h ? '편입종목 상장지 비중' : null; }
  }
  return out;
}

export function sector1(sectors) {
  if (!sectors) return null;
  let best = null, bv = 0;
  for (const [k, v] of Object.entries(sectors)) if (typeof v === 'number' && v > bv) { bv = v; best = k; }
  return best;
}
