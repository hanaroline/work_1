#!/usr/bin/env node
/**
 * ETF 화면에 실리는 모든 숫자를 전수 감사한다.
 *
 *   node scripts/audit_etf_data.mjs [--json]
 *   -> tools/discovery/etf_audit.{json,md}
 *
 * 왜 만드나 —
 * HANARO Fn전기&수소차(381560) 의 6개월 총수익률이 +1837% 로 찍혔다.
 * 52주 저 7,860 / 고 26,065 인 종목이 반 년에 19배가 될 수 없다.
 * 한 종목이 이러면 나머지도 못 믿는다. 그래서 눈으로 훑는 대신
 * **화면에 실리는 항목마다 반증 가능한 규칙을 걸어 전부 돌린다.**
 *
 * 이 감사는 바깥에 붙지 않는다. data/etf.js 안에서 서로 어긋나는 것만
 * 잡는다. 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 필요도 없이 틀린 것이다.
 *
 * 가장 센 규칙은 **총수익률이 내포하는 분배율**이다.
 *
 *   내포분배율 = (1 + tr/100) / (1 + price/100) - 1
 *
 * 총수익률은 시장가수익률에 분배금 재투자분만 얹은 것이므로, 1년 구간의
 * 내포분배율은 그 ETF 의 분배율(TTM)과 비슷해야 한다. 0.51% 짜리가
 * 1558% 를 내포하면 그 tr 은 계산이 깨진 것이다. 바깥 자료가 필요 없다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/etf_audit.json';
const OUT_MD = 'tools/discovery/etf_audit.md';

// 기간별 연수. 내포분배율을 연율로 되돌려 분배율(TTM)과 견주는 데 쓴다.
const YEARS = { D1: 1 / 252, W1: 1 / 52, M1: 1 / 12, M3: 0.25, M6: 0.5, YTD: null, Y1: 1, Y3: 3, Y5: 5 };
// 3년·5년은 수집기가 연율로 저장한다. 내포분배율도 이미 연율이다.
const ANNUALIZED = new Set(['Y3', 'Y5']);

const findings = [];
/** 한 건을 적는다. sev: 'error' 는 화면에 내보내면 안 되는 것. */
function flag(sev, rule, etf, detail, nums) {
  findings.push({ sev, rule, id: etf.id, code: etf.code, market: etf.market,
                  name: etf.name, detail, ...nums });
}

const src = await readFile('data/etf.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const ETFS = DATA.etfs || [];
console.log(`감사 대상 ${ETFS.length} 종목 (기준 ${DATA.updatedAt})\n`);

for (const e of ETFS) {
  const price = e.ret?.price || {};
  const tr = e.ret?.tr || {};
  const nav = e.ret?.nav || {};

  // ── 1. 총수익률이 내포하는 분배율 ───────────────────────────────────────
  // 이 감사의 핵심. 바깥을 안 보고도 tr 의 붕괴를 잡는다.
  const dy = Number.isFinite(e.dividendYield) ? e.dividendYield : null;
  for (const [k, t] of Object.entries(tr)) {
    const p = price[k];
    if (!Number.isFinite(p) || !Number.isFinite(t)) continue;
    const denom = 1 + p / 100;
    if (denom <= 0) continue;                     // 반토막 이하 구간은 비율이 뜻을 잃는다
    // **누적**으로 본다. 연율로 환산하면 국내 ETF 의 연 1회 분배가
    // 1개월 구간에서 연 56% 로 튀어 정상값이 오류로 잡힌다 —
    // TIGER 증권(분배율 3.52%)의 1개월 격차 3.8%p 가 실은 한 해치를
    // 한 번에 준 것이었다. 처음에 29건을 오류로 잡은 것이 이 착각이었다.
    const span = YEARS[k] ?? 1;
    const ratio = ANNUALIZED.has(k) ? ((1 + t / 100) / denom) ** span : (1 + t / 100) / denom;
    const implied = ratio - 1;                   // 구간 전체의 누적 내포분배율
    const impliedPct = +(implied * 100).toFixed(2);

    // 총수익률이 시장가수익률보다 **낮으면** 분배금을 음수로 먹은 것이다.
    if (implied < -0.005) {
      flag('error', 'tr<price', e, `${k}: 총수익률(${t}%)이 시장가수익률(${p}%)보다 낮다`,
           { period: k, price: p, tr: t, impliedYieldPct: impliedPct, dividendYield: dy });
      continue;
    }
    // 계산이 깨진 것 — 어느 구간이든 100% + 해마다 100% 를 넘는 격차는
    // 분배금으로 설명되지 않는다. 계산기의 방어선과 같은 잣대다.
    const hardCap = (1 + span) * 100;
    // 눈여겨볼 것 — 공시 분배율로 설명되는 크기를 크게 넘는 경우.
    // 한 해치를 한 번에 주는 것을 감안해 최소 1년치는 허용한다.
    const softCap = dy != null ? dy * Math.max(1, span) * 2 + 5 : hardCap;
    if (impliedPct > hardCap) {
      flag('error', 'tr-내포분배율-과다', e,
           `${k}: 총수익률 ${t}% vs 시장가 ${p}% → 누적 내포분배율 ${impliedPct}% (한도 ${hardCap}%)`,
           { period: k, price: p, tr: t, impliedCumPct: impliedPct, dividendYield: dy });
    } else if (impliedPct > softCap) {
      flag('warn', 'tr-내포분배율-큼', e,
           `${k}: 총수익률 ${t}% vs 시장가 ${p}% → 누적 내포분배율 ${impliedPct}%` +
           (dy != null ? ` (공시 분배율 ${dy}%)` : ' (분배율 미상)'),
           { period: k, price: p, tr: t, impliedCumPct: impliedPct, dividendYield: dy });
    }
  }

  // ── 2. 기준가수익률과 시장가수익률의 벌어짐 ──────────────────────────────
  // ETF 는 차익거래로 묶여 있어 두 계열이 크게 벌어질 수 없다. 벌어지면
  // 둘 중 하나가 다른 종목·다른 기간을 보고 있다는 뜻이다.
  for (const [k, p] of Object.entries(price)) {
    const n = nav[k];
    if (!Number.isFinite(p) || !Number.isFinite(n)) continue;
    const gap = Math.abs(p - n);
    // 절대 5%p 와 상대 30% 중 큰 쪽을 넘어설 때만 잡는다(고변동 구간 오탐 방지)
    const tol = Math.max(5, Math.abs(n) * 0.3);
    if (gap > tol) {
      flag('warn', 'price-nav-괴리', e, `${k}: 시장가 ${p}% vs 기준가 ${n}% (${gap.toFixed(1)}%p 차)`,
           { period: k, price: p, navRet: n, gapPp: +gap.toFixed(2) });
    }
  }

  // ── 3. 수익률 자체의 범위 ───────────────────────────────────────────────
  // 하루 ±40% 는 국내 가격제한폭(±30%) 밖이고, 해외에서도 ETF 로는 안 나온다.
  for (const [basis, obj] of [['price', price], ['tr', tr], ['nav', nav]]) {
    for (const [k, v] of Object.entries(obj)) {
      if (!Number.isFinite(v)) { flag('error', '수익률-비수치', e, `${basis}.${k} = ${v}`); continue; }
      if (v <= -100) flag('error', '수익률-전손이하', e, `${basis}.${k} = ${v}% (-100% 이하)`, { period: k });
      // 2배 레버리지는 기초자산이 크게 오른 해에 정말로 이만큼 오른다 —
      // KODEX 반도체레버리지 1년 +535%(기준가 +572%), TIGER 200IT레버리지
      // +843%(기준가 +903%). 시장가와 기준가가 같이 움직였으므로 계산이
      // 아니라 실제 값이다. 그래서 배율 상품은 한도를 넓게 잡는다.
      const geared2 = (e.flags || []).some((f) => f === 'leverage' || f === 'inverse');
      const cap = k === 'D1' ? (geared2 ? 65 : 40)
                : k === 'W1' ? (geared2 ? 130 : 80)
                : (geared2 ? 1500 : 500);
      if (Math.abs(v) > cap) {
        // 거래가 멈춘 종목은 마지막 체결가가 그대로 남아 수익률이 튄다.
        // 이미 suspended 표를 붙여 계산에서 빼고 있으므로 오류가 아니다.
        flag(basis === 'tr' && !e.suspended ? 'error' : 'warn', '수익률-범위밖', e,
             `${basis}.${k} = ${v}% (${cap}% 초과)`, { period: k, value: v });
      }
    }
  }

  // ── 4. 상장일과 기간의 앞뒤 ─────────────────────────────────────────────
  // 상장 2년 된 ETF 에 3년 수익률이 있으면 그 값은 어딘가에서 잘못 붙은 것이다.
  if (/^\d{8}$/.test(e.listedDate || '')) {
    const listed = new Date(`${e.listedDate.slice(0, 4)}-${e.listedDate.slice(4, 6)}-${e.listedDate.slice(6)}`);
    const asOf = e.retAsOf ? new Date(e.retAsOf) : new Date(DATA.updatedAt);
    const ageY = (asOf - listed) / (365.25 * 864e5);
    for (const [basis, obj] of [['price', price], ['tr', tr], ['nav', nav]]) {
      for (const need of [['Y1', 1], ['Y3', 3], ['Y5', 5]]) {
        // 20 거래일(≈0.08년) 은 봐 준다 — 상장 직후 봉이 비는 경우가 있다.
        if (obj[need[0]] != null && ageY < need[1] - 0.08) {
          flag('error', '상장전-수익률', e,
               `${basis}.${need[0]} 이 있는데 상장 ${ageY.toFixed(1)}년밖에 안 됐다 (상장 ${e.listedDate})`,
               { period: need[0], ageYears: +ageY.toFixed(2) });
        }
      }
    }
  }

  // ── 5. 보유종목 ─────────────────────────────────────────────────────────
  const hs = Array.isArray(e.holdings) ? e.holdings : [];
  if (hs.length) {
    // Number(null) 은 0 이므로 null 을 먼저 걸러야 한다. 이걸 빠뜨리면
    // "비중 없음" 이 "비중 0" 으로 둔갑한다.
    const known = hs.filter((h) => h.weight != null && Number.isFinite(Number(h.weight)));
    const sum = known.reduce((s, h) => s + Number(h.weight), 0);
    // 레버리지·인버스는 스왑·선물로 200% 노출을 만든다. 합이 200% 인 것이
    // 정상이므로 여기에 100% 잣대를 들이대면 안 된다 — 처음에 67건을
    // 오류로 잡았던 것이 이 착각이었다.
    // 레버리지·인버스뿐 아니라 **선물형**도 합이 200% 다 — 기초자산 선물
    // 100% 와 증거금으로 맡긴 원화현금 100% 가 나란히 한 줄씩 잡히기 때문이다
    // (KODEX 국채선물10년·TIGER 일본엔선물 등 9종목). 담보와 노출을 각각
    // 적은 것이라 합이 100 을 넘는 게 맞다.
    const geared = (e.flags || []).some((f) => f === 'leverage' || f === 'inverse' || f === 'synthetic')
                || /선물|레버리지|인버스/.test(e.name || '');
    const cap = geared ? 310 : 100.5;
    if (known.length && sum > cap) {
      flag('error', '보유비중-합초과', e, `상위 ${hs.length}개 비중 합 ${sum.toFixed(2)}% (한도 ${cap}%)`, { sumWeight: +sum.toFixed(2) });
    }
    // 비중이 아예 안 오는 무리(네이버는 해외주식·채권·원자재에 수량만 준다)와
    // "비중이 0" 은 다른 이야기다. 앞엣것은 원천의 한계이므로 참고로만 남긴다.
    if (!known.length) flag('info', '보유비중-미공시', e, `${hs.length}종목 모두 비중 없음 (수량만)`);
    else if (known.length < hs.length) flag('warn', '보유비중-일부없음', e, `${hs.length}종목 중 ${hs.length - known.length}개 비중 없음`);
    else if (sum <= 0) flag('error', '보유비중-영', e, `비중 합이 ${sum}`);
    for (const h of hs) {
      const w = Number(h.weight);
      // 비중이 없는 것은 위에서 무리 단위로 한 번만 적었다. 여기서 종목마다
      // 다시 적으면 5,953건이 되어 진짜 오류가 묻힌다.
      // 현금 줄은 음수일 수 있다 — 레버리지가 차입으로 노출을 만들면
      // 원화현금이 -18% 로 잡힌다. 종목 줄이 음수인 것만 오류다.
      const lo = h.cash ? -100 : 0;
      if (h.weight != null && (!Number.isFinite(w) || w < lo || w > 310)) {
        flag('error', '보유비중-범위밖', e, `${h.name || h.code}: ${h.weight}`);
      }
      if (!h.name && !h.code) flag('warn', '보유종목-이름없음', e, JSON.stringify(h).slice(0, 80));
    }
    // 내림차순이어야 화면의 "상위 10개"가 말이 된다.
    for (let i = 1; i < known.length; i += 1) {
      if (Number(known[i].weight) > Number(known[i - 1].weight) + 1e-9) {
        flag('error', '보유종목-정렬어긋남', e, `${i}번째(${known[i].name}) 가 앞보다 크다`);
        break;
      }
    }
    const codes = hs.map((h) => h.code).filter(Boolean);
    if (new Set(codes).size !== codes.length) flag('error', '보유종목-중복', e, codes.join(','));
    // 화면이 쓰는 파생값이 실제 배열과 맞는지
    // 비중을 모르는데 합계를 0 으로 적어 두면 화면이 "상위 종목 합계 0.0%"
    // 라고 말한다. 없는 것을 0 이라고 하는 건 거짓이다 — 빈칸이어야 한다.
    if (known.length < hs.length && e.top10Weight != null) {
      flag('error', 'top10Weight-거짓', e,
           `비중을 모르는 종목이 ${hs.length - known.length}개인데 합계를 ${e.top10Weight}% 로 적었다`,
           { stored: e.top10Weight });
    } else if (Number.isFinite(e.top10Weight) && known.length === hs.length) {
      // 빌드는 현금 줄을 빼고 합한다(현금 100% 를 "집중도 100%" 라고 말하면
      // 거짓이 되므로). 감사도 같은 규칙으로 세야 견줄 수 있다.
      const top10 = known.filter((h) => !h.cash).slice(0, 10).reduce((s, h) => s + Number(h.weight), 0);
      if (Math.abs(top10 - e.top10Weight) > 0.05) {
        flag('error', 'top10Weight-불일치', e, `저장 ${e.top10Weight}% vs 재계산 ${top10.toFixed(2)}%`,
             { stored: e.top10Weight, recomputed: +top10.toFixed(2) });
      }
    }
    // 빌드는 현금 줄을 세지 않는다. 감사도 같은 규칙으로 세야 한다 —
    // 전부를 세면 현금이 있는 262종목이 통째로 어긋난 것처럼 보인다.
    const stockRows = hs.filter((h) => !h.cash).length;
    if (Number.isFinite(e.holdingCount) && e.holdingCount !== stockRows) {
      flag('warn', 'holdingCount-불일치', e, `저장 ${e.holdingCount} vs 종목 줄 ${stockRows} (현금 제외)`);
    }
  } else {
    flag('info', '보유종목-없음', e, '상위 편입종목이 비어 있다');
  }

  // 섹터·자산·국가 비중도 같은 규칙으로 본다.
  for (const [label, obj] of [['섹터', e.sectors], ['자산', e.assets], ['국가', e.countries]]) {
    if (!obj) continue;
    const vals = Object.values(obj).map(Number);
    const sum = vals.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
    // 음수 비중은 이 자산군들에서 **구조 그 자체**다. 처음에 461건을 오류로
    // 잡았다가 실물을 보고 두 번 물러섰다.
    //   현금 -0.5%   선물 증거금·미수금 (TIGER 200)
    //   현금 -22%    환매조건부로 채권을 120% 담은 액티브 채권형
    //   파생 -100%   환헤지형의 통화선도 (KODEX 미국S&P500(H))
    // 그래서 현금·파생이 아닌 칸이 음수일 때만 오류로 본다.
    // 음수로 잡히는 현금이 국가표에서는 KR, 섹터표에서는 UNCLASSIFIED 로
    // 나타난다(해외 ETF 의 KR=-0.21 등). 같은 한 줄이 표마다 다른 이름을
    // 쓸 뿐이므로 이것도 구조에 속한다. 1%p 안쪽의 음수는 넘긴다.
    // 국가표에는 현금 줄이 따로 없다. 그래서 음수 현금·차입·숏 노출이
    // **어느 나라 칸에든** 들어간다 — 해외 ETF 의 KR=-5.97(원화 미수금),
    // KODEX 200선물인버스2X 의 KR=-76.27(숏 노출)이 그것이다. 나라 이름이
    // 붙었을 뿐 자산표의 CASH·DERIVATIVES 와 같은 줄이므로 참고로만 남긴다.
    const NEG_OK = label === '국가'
      ? null
      : new Set(['CASH', 'DERIVATIVES', 'OTHERS', 'UNCLASSIFIED', 'MISC']);
    const negBad = NEG_OK
      ? Object.entries(obj).filter(([k, v]) => Number(v) < 0 && !NEG_OK.has(k) && Number(v) < -1)
      : [];
    const negInfo = !NEG_OK && Object.entries(obj).some(([, v]) => Number(v) < -1);
    if (negInfo) flag('info', '국가비중-음수', e, JSON.stringify(obj).slice(0, 120));
    if (vals.some((v) => !Number.isFinite(v))) flag('error', `${label}비중-비수치`, e, JSON.stringify(obj).slice(0, 120));
    else if (negBad.length) flag('error', `${label}비중-음수`, e, negBad.map(([k, v]) => `${k}=${v}`).join(' '));
    else if (sum > 101 || (sum > 0 && sum < 90)) flag('info', `${label}비중-합이상`, e, `합 ${sum.toFixed(2)}%`, { sum: +sum.toFixed(2) });
  }

  // ── 6. 설정액·순자산·시가총액 ───────────────────────────────────────────
  const aum = Number(e.aum), mcap = Number(e.marketCap);
  if (Number.isFinite(aum)) {
    if (aum <= 0) flag('error', '설정액-영이하', e, `aum=${aum}`);
    // 1조 이상은 있지만 100조는 없다. 단위(원/억원)가 섞이면 여기서 걸린다.
    else if (aum > 1e14) flag('error', '설정액-단위의심', e, `aum=${aum} (100조 초과)`, { aum });
    else if (aum < 1e8) flag('warn', '설정액-과소', e, `aum=${aum} (1억 미만)`, { aum });
  } else flag('info', '설정액-없음', e, 'aum 없음');
  if (Number.isFinite(aum) && Number.isFinite(mcap) && aum > 0 && mcap > 0) {
    const r = mcap / aum;
    // 순자산과 시가총액은 괴리율만큼만 차이 나야 한다. 2배 넘게 벌어지면
    // 한쪽이 다른 단위이거나 다른 종목의 값이다.
    // 거래가 멈춘 종목은 마지막 체결가로 시총이 잡혀 순자산과 벌어진다.
    // 이미 표를 붙였으면 아는 상태이므로 오류가 아니다.
    if (r > 2 || r < 0.5) {
      flag(e.suspended ? 'info' : 'error', '시총-설정액-괴리', e, `시총 ${mcap} / 설정액 ${aum} = ${r.toFixed(2)}배`,
           { marketCap: mcap, aum, ratio: +r.toFixed(2) });
    }
  }

  // ── 7. 자금 유입 ────────────────────────────────────────────────────────
  // 유입액은 누적이므로 순자산을 넘을 수 있다(들어왔다 나가면). 다만
  // 순자산의 20배를 넘는 3개월 유입은 단위가 어긋난 것으로 본다.
  if (e.flow && Number.isFinite(aum) && aum > 0) {
    for (const [k, v] of Object.entries(e.flow)) {
      if (v == null) continue;
      if (!Number.isFinite(v)) { flag('error', '유입-비수치', e, `flow.${k}=${v}`); continue; }
      if (Math.abs(v) > aum * 20) {
        flag('error', '유입-과대', e, `flow.${k}=${v} 가 설정액 ${aum} 의 ${(Math.abs(v) / aum).toFixed(0)}배`,
             { period: k, flow: v, aum });
      }
    }
    // 기간이 길수록 |누적| 이 항상 커지진 않지만, 1일 유입이 1년 유입보다
    // 자릿수로 크면 파싱이 어긋난 것이다.
    const d1 = Math.abs(Number(e.flow.d1) || 0), y1 = Math.abs(Number(e.flow.y1) || 0);
    if (y1 > 0 && d1 > y1 * 10) flag('warn', '유입-기간역전', e, `1일 ${e.flow.d1} vs 1년 ${e.flow.y1}`);
  }

  // ── 8. 총보수·괴리율·추적오차·분배율 ────────────────────────────────────
  const ter = Number(e.ter);
  if (Number.isFinite(ter)) {
    // 국내 ETF 총보수는 0.01%~1.5% 안에 있다. 소수/퍼센트 혼동은 여기서 걸린다.
    if (ter < 0) flag('error', '총보수-음수', e, `ter=${ter}`);
    else if (ter > 3) flag('error', '총보수-과다', e, `ter=${ter}% (3% 초과)`, { ter });
    // 보수가 정말 0 인 ETF 는 없다. 야후가 일본·홍콩 상장에 0 을 준다.
    // 화면은 이걸 "총보수 0.000%" 로 찍는다 — 모르는 것을 안다고 말하는 셈이다.
    else if (ter === 0) flag('error', '총보수-영', e, 'ter=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다');
  } else flag('info', '총보수-없음', e, 'ter 없음');
  if (Number.isFinite(Number(e.premium)) && Math.abs(e.premium) > 10) {
    flag('warn', '괴리율-과다', e, `premium=${e.premium}%`, { premium: e.premium });
  }
  // 액티브·레버리지는 지수를 그대로 따라가지 않으므로 추적오차가 크다.
  // 20% 잣대는 그 종목들만 62건 잡아 냈다 — 규칙이 틀린 것이었다.
  const gearedOrActive = (e.flags || []).some((f) => f === 'active' || f === 'leverage' || f === 'inverse');
  if (Number.isFinite(Number(e.trackingError))) {
    if (e.trackingError < 0) flag('error', '추적오차-음수', e, `trackingError=${e.trackingError}%`);
    else if (e.trackingError > (gearedOrActive ? 50 : 20)) {
      flag('warn', '추적오차-범위밖', e, `trackingError=${e.trackingError}%`);
    }
  }
  if (dy != null && (dy < 0 || dy > 60)) flag('error', '분배율-범위밖', e, `dividendYield=${dy}%`, { dividendYield: dy });

  // ── 8-2. 거래가 멈춘 종목 ────────────────────────────────────────────────
  // ACE 러시아MSCI(합성) 은 가격 8,535 원에 기준가 48.38 원, 거래량 0 이다.
  // 제재로 평가가 동결된 뒤 마지막 체결가만 남은 것이다. 괴리율 17,541% 는
  // 계산이 틀린 게 아니라 그 상태를 그대로 비춘 것이다. 이런 종목을 순위와
  // 유형평균에 섞으면 멀쩡한 종목의 등수까지 흔든다.
  // 빌드가 이미 suspended 표를 붙였으면 알고 있다는 뜻이므로 참고로만 남긴다.
  // 모르고 지나간 것만 오류다.
  if (Math.abs(Number(e.premium) || 0) > 50 || (Number(e.volume) === 0 && Number(e.aum) > 0 && Math.abs(Number(e.premium) || 0) > 10)) {
    flag(e.suspended ? 'info' : 'error', '거래정지-의심', e,
         `괴리율 ${e.premium}% · 거래량 ${e.volume} · 현재가 ${e.price} vs 기준가 ${e.nav}`,
         { premium: e.premium, volume: e.volume, price: e.price, nav: e.nav });
  }

  // ── 9. 현재가와 등락률의 앞뒤 ───────────────────────────────────────────
  const px = Number(e.price), chg = Number(e.change), rate = Number(e.changeRate);
  if (Number.isFinite(px) && px <= 0) flag('error', '현재가-영이하', e, `price=${px}`);
  if (Number.isFinite(px) && Number.isFinite(chg) && Number.isFinite(rate) && px - chg > 0) {
    const recomputed = (chg / (px - chg)) * 100;
    if (Math.abs(recomputed - rate) > 0.15) {
      flag('warn', '등락률-불일치', e, `저장 ${rate}% vs 재계산 ${recomputed.toFixed(2)}%`,
           { stored: rate, recomputed: +recomputed.toFixed(2) });
    }
  }
  // 화면의 1일 수익률은 등락률과 같아야 한다.
  if (Number.isFinite(rate) && Number.isFinite(price.D1) && Math.abs(rate - price.D1) > 0.15) {
    flag('warn', 'D1-등락률-불일치', e, `등락률 ${rate}% vs price.D1 ${price.D1}%`,
         { changeRate: rate, d1: price.D1 });
  }
}

// ── 10. 한 종목이 무리 전체의 평균을 흔드는가 ─────────────────────────────
// 화면의 "유형 평균 대비" 는 같은 유형 종목들의 평균을 뺀 값이다. 그런데
// 값 하나가 깨지면 그 한 종목이 무리 전체의 파생 칸을 오염시킨다.
//
// 실제로 그랬다. HANARO Fn전기&수소차의 1년 총수익률 3,582% 가 국내 주식형
// 479종목의 평균을 이렇게 밀어 올렸다.
//
//   6개월   +0.88%  ->  실제 -3.59%   (4.47%p · 부호가 뒤집힌다)
//   연초이후 +43.96% ->  실제 +36.91%  (7.06%p)
//   1년     +90.80% ->  실제 +81.59%  (9.21%p)
//
// TIGER 반도체의 "유형 평균 대비 +147.36%p" 도 그만큼 틀려 있었다. 한 종목의
// 값을 고치는 것과 별개로, **한 종목이 무리를 흔들 수 있다는 사실 자체**를
// 잡아야 한다. 앞으로 다른 값이 깨져도 여기서 먼저 걸린다.
//
// 재는 법은 간단하다. 그 종목을 뺐을 때 평균이 얼마나 움직이는가 —
//   변화량 = (평균 - 그 종목 값) / (n - 1)
const cohorts = {};
for (const e of ETFS) {
  if (e.suspended) continue;                      // 이미 무리에서 빼는 종목
  // 화면과 같은 기준으로 묶는다. 배율 상품은 1배와 다른 유형이다 —
  // 2배가 1배 무리의 평균에 섞이면 그 평균은 어느 쪽의 평균도 아니다.
  const geared3 = (e.flags || []).some((f) => f === 'leverage' || f === 'inverse');
  const key = `${e.market}|${e.assetClass || '?'}|${e.region || '?'}|${geared3 ? 'x' : '1'}`;
  (cohorts[key] ??= []).push(e);
}
for (const [key, members] of Object.entries(cohorts)) {
  if (members.length < 20) continue;              // 작은 무리는 원래 한둘에 휘둘린다
  for (const period of Object.keys(YEARS)) {
    const vals = [];
    for (const e of members) {
      const v = e.ret?.tr?.[period];
      if (Number.isFinite(v)) vals.push({ e, v });
    }
    if (vals.length < 20) continue;
    const mean = vals.reduce((s, x) => s + x.v, 0) / vals.length;
    for (const { e, v } of vals) {
      const shift = (mean - v) / (vals.length - 1);   // 이 종목을 빼면 평균이 이만큼 움직인다
      // 이 규칙의 목적을 좁힌다. "평균이 흔들린다" 자체는 오류가 아니다 —
      // 배율 상품처럼 정말로 크게 오른 종목이 있으면 평균은 원래 흔들리고,
      // 무리가 작을수록 더 그렇다. 처음에 1%p 절대값으로 걸었더니 34종목이
      // 잡혔는데 대부분이 진짜 값이었다.
      //
      // 잡아야 하는 것은 **깨진 값이 평균을 흔드는 경우**다. 그래서 다른
      // 규칙이 이미 오류로 잡은 종목일 때만 오류로 올린다. 그러면 이 규칙은
      // 검출이 아니라 **피해 규모**를 말한다 — 값 하나가 몇 종목의 화면을
      // 함께 틀리게 했는지.
      if (Math.abs(shift) > 1) {
        const alreadyBroken = findings.some((f) => f.sev === 'error' && f.id === e.id
          && /^tr-|^수익률-/.test(f.rule));
        flag(alreadyBroken && Math.abs(shift) > 1 ? 'error' : 'warn', '유형평균-한종목이흔듦', e,
             `${key} ${period}: 이 종목(${v}%)을 빼면 ${members.length}종목 평균이 ` +
             `${mean.toFixed(2)}% → ${(mean + shift).toFixed(2)}% 로 ${shift > 0 ? '+' : ''}${shift.toFixed(2)}%p 움직인다`,
             { period, cohort: key, cohortN: vals.length, value: v,
               cohortMean: +mean.toFixed(2), shiftPp: +shift.toFixed(2) });
      }
    }
  }
}

// ── 집계 ──────────────────────────────────────────────────────────────────
// 규칙**과 심각도**로 묶는다. 규칙만으로 묶으면 같은 규칙의 오류와 경고가
// 한 줄에 합쳐지고 심각도는 첫 건 것이 찍힌다 — 61건이 전부 오류인 줄 알았는데
// 실은 오류 6건 + 경고 55건이었다. 집계가 거짓말을 하면 감사가 뜻이 없다.
const byRule = {};
for (const f of findings) {
  const gk = `${f.rule}|${f.sev}`;
  byRule[gk] ??= { rule: f.rule, sev: f.sev, count: 0, etfs: new Set(), examples: [] };
  const b = byRule[gk];
  b.count += 1; b.etfs.add(f.id);
  if (b.examples.length < 5) b.examples.push(f);
}
const rules = Object.values(byRule)
  .map((b) => ({ ...b, etfCount: b.etfs.size, etfs: undefined }))
  .sort((a, b) => (a.sev === b.sev ? b.count - a.count : (a.sev === 'error' ? -1 : b.sev === 'error' ? 1 : a.sev === 'warn' ? -1 : 1)));

const errorIds = new Set(findings.filter((f) => f.sev === 'error').map((f) => f.id));
const counts = { error: 0, warn: 0, info: 0 };
for (const f of findings) counts[f.sev] += 1;

console.log('=== 규칙별 ===');
const pad = (s, n) => String(s).padEnd(n, ' ');
for (const r of rules) {
  console.log(`  ${pad(r.sev, 6)} ${pad(r.rule, 24)} ${String(r.count).padStart(6)}건  ${String(r.etfCount).padStart(5)}종목`);
}
console.log(`\n오류 ${counts.error} · 경고 ${counts.warn} · 참고 ${counts.info}`);
console.log(`오류가 하나라도 있는 종목: ${errorIds.size} / ${ETFS.length}`);

console.log('\n=== 오류 상위 20건 ===');
for (const f of findings.filter((x) => x.sev === 'error').slice(0, 20)) {
  console.log(`  [${f.rule}] ${f.code} ${f.name} — ${f.detail}`);
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify({
  at: new Date().toISOString(), dataUpdatedAt: DATA.updatedAt,
  total: ETFS.length, counts, errorEtfCount: errorIds.size, rules, findings,
}, null, 2));

const md = ['# ETF 자료 전수 감사', '', `감사 시각: ${new Date().toISOString()}`,
  `자료 기준: ${DATA.updatedAt}`, `대상: ${ETFS.length} 종목`, '',
  `**오류 ${counts.error}건 · 경고 ${counts.warn}건 · 참고 ${counts.info}건**`,
  `**오류가 있는 종목 ${errorIds.size} / ${ETFS.length}**`, '',
  '이 감사는 바깥 자료에 붙지 않는다. `data/etf.js` 안에서 서로 어긋나는 것만',
  '잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.', '',
  '## 규칙별', '', '| 심각도 | 규칙 | 건수 | 종목수 |', '|---|---|---:|---:|'];
for (const r of rules) md.push(`| ${r.sev} | ${r.rule} | ${r.count} | ${r.etfCount} |`);
md.push('', '## 오류 상세', '', '| 종목 | 규칙 | 내용 |', '|---|---|---|');
for (const f of findings.filter((x) => x.sev === 'error').slice(0, 300)) {
  md.push(`| ${f.code} ${f.name} | ${f.rule} | ${f.detail.replace(/\|/g, '\\|')} |`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[audit] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(counts.error ? 1 : 0);
