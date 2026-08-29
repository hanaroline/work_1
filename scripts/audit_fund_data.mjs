#!/usr/bin/env node
/**
 * 펀드 화면에 실리는 모든 숫자를 전수 감사한다.
 *
 *   node scripts/audit_fund_data.mjs
 *   -> tools/discovery/fund_audit.{json,md}
 *   오류가 하나라도 있으면 종료 코드 1
 *
 * 일일 수집 워크플로의 **커밋 앞**에 관문으로 걸린다. 오류가 있으면
 * 커밋되지 않는다.
 *
 * 왜 만드나 —
 * 원천이 단기채권 펀드의 1개월 수익률을 +244.94% 로 준다. 기준가 계열에
 * 재산정 계단이 있고 네이버가 그것을 수익률로 계산했기 때문이다. 눈으로
 * 훑어서는 3,200종목에서 이런 것을 찾을 수 없다. 그래서 **화면에 실리는
 * 항목마다 반증 가능한 규칙을 걸어 전부 돌린다.**
 *
 * 이 감사는 바깥에 붙지 않는다. `data/fund.js` 안에서 서로 어긋나는 것만
 * 잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.
 *
 * 가장 센 규칙은 **수집기가 제 관문을 지켰는가** 이다.
 *
 * 수집기는 계단이 있다고 무조건 비우지 않는다. 계단에는 두 가지가 있고
 * 네이버는 그중 하나만 수익률에 흘려 넣기 때문이다.
 *
 *   위로 나는 계단(기준가 재산정) → 네이버가 그대로 수익률로 낸다. 거짓이다.
 *   아래로 나는 계단(결산·분배)   → 네이버가 보정한다. 값은 멀쩡하다.
 *
 * 그래서 수집기는 "그 숫자가 계단을 먹었는가" 로 가르고, 남긴 칸에는
 * 근거(생값)를 `retChecked` 에 적어 둔다. 감사는 **그 셈을 다시 해 본다.**
 * 근거 없이 남긴 칸과, 근거가 셈에 안 맞는 칸을 잡는다. 수집기의 판단을
 * 그냥 믿으면 관문이 하나로 줄어든다.
 *
 * ── 규칙이 틀릴 수 있다 ────────────────────────────────────────────────────
 * ETF 감사에서 처음 잡은 7,252건 중 대부분이 규칙이 틀린 오탐이었다.
 * 이 감사에서도 한 번 겪었다 — "짧은 구간이 거의 0 인데 긴 구간이 튄다" 는
 * 규칙을 오류로 걸었다가, 그 규칙이 잡은 두 펀드를 실물로 보니 계단이
 * 하나도 없는 정상적인 수익률 모양이었다. 지금은 경고다.
 *
 * 대량으로 잡히면 규칙부터 의심하고 실물을 봐야 한다. 그래서 이 감사는
 * 심각도를 셋으로 나눈다 — error 만 커밋을 막고, warn·info 는 보고만 한다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_audit.json';
const OUT_MD = 'tools/discovery/fund_audit.md';

const findings = [];
/** 한 건을 적는다. sev: 'error' 는 화면에 내보내면 안 되는 것. */
function flag(sev, rule, f, detail, nums) {
  findings.push({ sev, rule, id: f.id, code: f.code, name: f.name,
                  type: f.type, detail, ...nums });
}

const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
console.log(`감사 대상 ${FUNDS.length}개 (기준 ${DATA.updatedAt})\n`);

// 기간의 되돌아가는 길이. 계단이 그 구간 안에 있는지 재는 데 쓴다.
const BACK = {
  '1d': (d) => d.setDate(d.getDate() - 1),
  '1w': (d) => d.setDate(d.getDate() - 7),
  '1m': (d) => d.setMonth(d.getMonth() - 1),
  '3m': (d) => d.setMonth(d.getMonth() - 3),
  '6m': (d) => d.setMonth(d.getMonth() - 6),
  '9m': (d) => d.setMonth(d.getMonth() - 9),
  '1y': (d) => d.setFullYear(d.getFullYear() - 1),
  '2y': (d) => d.setFullYear(d.getFullYear() - 2),
  '3y': (d) => d.setFullYear(d.getFullYear() - 3),
  '5y': (d) => d.setFullYear(d.getFullYear() - 5),
};
// 구간이 몇 해치인가. 설정일보다 긴 구간이 있는지 보는 데 쓴다.
const YEARS = { '1d': 1 / 252, '1w': 1 / 52, '1m': 1 / 12, '3m': 0.25, '6m': 0.5,
                '9m': 0.75, ytd: null, '1y': 1, '2y': 2, '3y': 3, '5y': 5 };

/** 기준일에서 그 기간만큼 되돌아간 날짜. */
function cutoffOf(period, asOf) {
  if (!asOf) return null;
  if (period === 'ytd') return `${asOf.slice(0, 4)}-01-01`;
  const back = BACK[period];
  if (!back) return null;
  const d = new Date(`${asOf}T00:00:00Z`);
  back(d);
  return d.toISOString().slice(0, 10);
}

for (const f of FUNDS) {
  const ret = f.ret || {};
  const srcRet = f.retSrc || {};
  const bench = f.retBenchmark || {};
  const asOf = f.retAsOf || f.tradeDate || null;
  // 계단 구간을 다시 잴 때는 **수집기가 쓴 기준일**을 쓴다. 수집기는 기준가
  // 계열의 마지막 날을 기준으로 재는데, 그것이 retAsOf 와 하루이틀 다를 수
  // 있다. 다른 자로 재면 계단이 경계에 놓인 펀드에서 없던 오류가 생겨
  // 커밋 관문이 헛되이 막힌다.
  const anchor = f.retAnchor || asOf;

  // ── 1. 수집기가 제 관문을 지켰는가 ──────────────────────────────────────
  //
  // 수집기의 규칙은 "계단이 있으면 비운다" 가 **아니다.** 계단에는 두 가지가
  // 있고 네이버는 그중 하나만 흘려 넣는다.
  //
  //   위로 나는 계단(기준가 재산정) → 네이버가 그대로 수익률로 낸다. 거짓이다.
  //   아래로 나는 계단(결산·분배)   → 네이버가 보정한다. 값은 멀쩡하다.
  //
  // 그래서 수집기는 "그 숫자가 계단을 먹었는가" 로 가른다. 계단을 가로지르는데
  // 남긴 칸은 `retChecked` 에 근거(생값)를 남기게 되어 있다. 감사는 그 셈을
  // **다시 해 본다** — 근거 없이 남긴 칸과, 근거가 셈에 안 맞는 칸을 잡는다.
  const stepDays = (f.steps || []).map((s) => s.day).filter(Boolean);
  const checkedOf = {};
  for (const c of f.retChecked || []) checkedOf[c.period] = c;
  if (stepDays.length && anchor) {
    for (const [k, v] of Object.entries(ret)) {
      const cutoff = cutoffOf(k, anchor);
      if (!cutoff) continue;
      const hit = stepDays.filter((d) => d > cutoff && d <= anchor);
      if (!hit.length) continue;
      const c = checkedOf[k];
      if (!c) {
        flag('error', '계단구간-근거없이남김', f,
             `${k} = ${v}% 가 ${hit[0]} 계단을 가로지르는데 남긴 근거가 없다 (구간 ${cutoff}~${anchor})`,
             { period: k, value: v, stepAt: hit[0] });
      } else if (c.raw == null || !Number.isFinite(Number(c.raw))) {
        flag('error', '계단구간-근거없음', f, `${k}: retChecked 에 생값이 없다`, { period: k });
      } else if (Math.abs(Number(v) - Number(c.raw)) <= 20) {
        // 생값과 원천이 붙어 있다 = 원천이 계단을 흘려 넣었다. 비웠어야 한다.
        flag('error', '계단구간-흘려넣은값남김', f,
             `${k} = ${v}% 가 생값 ${c.raw}% 와 ${Math.abs(Number(v) - Number(c.raw)).toFixed(2)}%p 차로 붙어 있다 ` +
             `— 원천이 ${c.at} 계단을 그대로 흘려 넣은 값이다`,
             { period: k, value: v, raw: c.raw, stepAt: c.at });
      }
    }
  }
  // 같은 기간이 남기도 하고 버려지기도 할 수는 없다.
  for (const d of f.retDropped || []) {
    if (ret[d.period] != null) {
      flag('error', '수익률-남김과버림-겹침', f,
           `${d.period} 를 버렸다고 적어 놓고 값 ${ret[d.period]}% 를 실었다`, { period: d.period });
    }
  }

  // ── 2. 원천 스스로의 앞뒤 ───────────────────────────────────────────────
  // 짧은 구간이 거의 0 인데 그것을 품은 긴 구간이 통째로 튀면 눈여겨볼 일이다.
  // 수집기의 계단 탐지가 실패해도 여기서 보인다.
  //
  // **다만 오류가 아니라 경고다.** 처음에는 오류로 걸었는데, 이 규칙이 잡은
  // 두 펀드(한화천연자원 6개월 0.19% → 1년 50.60%, 에셋플러스코리아리치투게더
  // 1.04% → 50.47%)를 실물로 확인해 보니 **계단이 하나도 없었다.** 최근
  // 6개월이 잠잠하고 그 앞 6개월에 50% 오른 것뿐이다. 그건 정상적인 수익률
  // 모양이지 오류가 아니다(tools/discovery/fund_returns_verify4.md).
  //
  // 규칙이 틀릴 수 있다. 오류로 걸어 커밋을 막으면 멀쩡한 자료가 못 나간다.
  // 그래서 보고만 하고, 새로운 실패 방식이 나타나면 사람이 보게 한다.
  const PAIRS = [['1d', '1w'], ['1w', '1m'], ['1m', '3m'], ['3m', '6m'], ['6m', '1y'], ['1y', '2y']];
  for (const [shortK, longK] of PAIRS) {
    const s = ret[shortK], l = ret[longK];
    // Number(null) 은 0 이다. null 을 먼저 본다 — 없는 것을 0 이라고 보면
    // "짧은 구간이 0% 였다" 는 거짓 전제로 규칙이 돈다.
    if (s == null || l == null) continue;
    if (!Number.isFinite(Number(s)) || !Number.isFinite(Number(l))) continue;
    if (Math.abs(s) < 3 && Math.abs(l) > 50) {
      flag('warn', '수익률-앞뒤안맞음', f,
           `${shortK} ${s}% 인데 ${longK} ${l}% — 짧은 구간을 품은 긴 구간이 혼자 튄다`,
           { shortPeriod: shortK, short: s, longPeriod: longK, long: l });
    }
  }

  // ── 3. 원천 값을 그대로 실었는가 ────────────────────────────────────────
  // 수집기는 검산을 통과한 원천 값을 **그대로** 싣는다. 다른 값이 들어 있으면
  // 어딘가에서 값이 갈아 끼워진 것이다.
  for (const [k, v] of Object.entries(ret)) {
    const s = srcRet[k];
    if (s == null) {
      flag('warn', '수익률-원천없음', f, `${k} = ${v}% 인데 원천 값이 없다`, { period: k });
    } else if (Math.abs(Number(s) - Number(v)) > 0.0002) {
      flag('error', '수익률-원천과다름', f, `${k}: 실은 값 ${v}% vs 원천 ${s}%`,
           { period: k, stored: v, source: s });
    }
  }
  // 벤치마크만 있고 펀드 값이 없으면 화면에서 견줄 수 없는 두 칸이 나란히 선다.
  for (const k of Object.keys(bench)) {
    if (ret[k] == null) {
      flag('error', '벤치마크-짝없음', f, `${k}: 펀드 값은 없는데 벤치마크 ${bench[k]}% 만 있다`,
           { period: k });
    }
  }

  // ── 4. 수익률 자체의 범위 ───────────────────────────────────────────────
  // 펀드는 바스켓이라 개별 종목보다 훨씬 둔하다. 국내 가격제한폭이 ±30% 인데
  // 그것을 하루에 다 먹는 펀드는 없다. 2배 레버리지·파생형은 넓게 잡는다.
  const geared = /레버리지|인버스|선물|파생/.test(f.name || '');
  for (const [k, v] of Object.entries(ret)) {
    if (!Number.isFinite(Number(v))) {
      flag('error', '수익률-비수치', f, `${k} = ${v}`, { period: k });
      continue;
    }
    if (v <= -100) flag('error', '수익률-전손이하', f, `${k} = ${v}% (-100% 이하)`, { period: k, value: v });
    const cap = k === '1d' ? (geared ? 25 : 12)
              : k === '1w' ? (geared ? 60 : 30)
              : k === '1m' ? (geared ? 120 : 60)
              : (geared ? 900 : 400);
    if (Math.abs(v) > cap) {
      flag('error', '수익률-범위밖', f, `${k} = ${v}% (한도 ${cap}%)`, { period: k, value: v, cap });
    }
  }

  // ── 5. 설정일보다 긴 구간 ───────────────────────────────────────────────
  // 설정 2년 된 펀드에 5년 수익률이 있으면 그 값은 어딘가에서 잘못 붙은 것이다.
  if (/^\d{4}-\d{2}-\d{2}$/.test(f.inceptionDate || '') && asOf) {
    const ageY = (Date.parse(asOf) - Date.parse(f.inceptionDate)) / (365.25 * 864e5);
    for (const [k, v] of Object.entries(ret)) {
      const need = YEARS[k];
      if (need == null) continue;
      // 20거래일(≈0.08년)은 봐 준다 — 설정 직후 기준가가 비는 경우가 있다.
      if (ageY < need - 0.08) {
        flag('error', '설정전-수익률', f,
             `${k} = ${v}% 인데 설정 ${ageY.toFixed(1)}년밖에 안 됐다 (설정 ${f.inceptionDate})`,
             { period: k, ageYears: +ageY.toFixed(2) });
      }
    }
  }

  // ── 6. 등락률과 1일 수익률 ──────────────────────────────────────────────
  const rate = f.changeRate;
  if (rate != null && Number.isFinite(Number(rate)) && ret['1d'] != null
      && Math.abs(Number(rate) - Number(ret['1d'])) > 0.02) {
    flag('warn', '등락률-1일수익률-불일치', f, `등락률 ${rate}% vs 1일 수익률 ${ret['1d']}%`,
         { changeRate: rate, d1: ret['1d'] });
  }
  // 기준가와 전일대비로 등락률을 되짚는다.
  const bp = Number(f.basePrice), cp = Number(f.changePrice);
  if (Number.isFinite(bp) && Number.isFinite(cp) && f.basePrice != null && f.changePrice != null
      && bp - cp > 0 && rate != null) {
    const recomputed = (cp / (bp - cp)) * 100;
    if (Math.abs(recomputed - Number(rate)) > 0.02) {
      flag('warn', '등락률-불일치', f, `저장 ${rate}% vs 재계산 ${recomputed.toFixed(4)}%`,
           { stored: rate, recomputed: +recomputed.toFixed(4) });
    }
  }
  if (f.basePrice != null && !(bp > 0)) flag('error', '기준가-영이하', f, `basePrice=${f.basePrice}`);

  // ── 7. 보유종목 ─────────────────────────────────────────────────────────
  const hs = Array.isArray(f.holdings) ? f.holdings : [];
  if (hs.length) {
    const known = hs.filter((h) => h.weight != null && Number.isFinite(Number(h.weight)));
    const stocks = hs.filter((h) => !h.cash);
    const knownStocks = stocks.filter((h) => h.weight != null && Number.isFinite(Number(h.weight)));
    const sum = known.reduce((s, h) => s + Number(h.weight), 0);

    // 펀드는 ETF 만큼 스왑·선물로 노출을 부풀리지 않지만, 파생형·재간접형에는
    // 담보와 노출을 각각 적는 것이 있다. ETF 에서 이 잣대를 100% 로 걸었다가
    // 67건을 헛잡았다.
    const cap = geared ? 310 : 101;
    if (known.length && sum > cap) {
      flag('error', '보유비중-합초과', f, `${hs.length}종목 비중 합 ${sum.toFixed(2)}% (한도 ${cap}%)`,
           { sumWeight: +sum.toFixed(2) });
    }
    if (!known.length) flag('info', '보유비중-미공시', f, `${hs.length}종목 모두 비중 없음`);
    else if (known.length < hs.length) {
      flag('warn', '보유비중-일부없음', f, `${hs.length}종목 중 ${hs.length - known.length}개 비중 없음`);
    }
    for (const h of hs) {
      const w = Number(h.weight);
      // 현금 줄은 음수일 수 있다(미수금·차입). 종목 줄이 음수인 것만 오류다.
      const lo = h.cash ? -100 : 0;
      if (h.weight != null && (!Number.isFinite(w) || w < lo || w > 310)) {
        flag('error', '보유비중-범위밖', f, `${h.name || h.code}: ${h.weight}`);
      }
      if (!h.name && !h.code) flag('warn', '보유종목-이름없음', f, JSON.stringify(h).slice(0, 80));
    }
    const codes = hs.map((h) => h.code).filter(Boolean);
    if (new Set(codes).size !== codes.length) {
      const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
      flag('error', '보유종목-중복', f, [...new Set(dup)].slice(0, 6).join(', '));
    }

    // 화면이 쓰는 파생값이 실제 배열과 맞는가.
    // 비중을 모르는데 합계를 적어 두면 화면이 거짓을 말한다. 없는 것을 0 이라고
    // 하는 건 거짓이다 — 빈칸이어야 한다.
    if (knownStocks.length < stocks.length && f.totalWeight != null) {
      flag('error', 'totalWeight-거짓', f,
           `비중을 모르는 종목이 ${stocks.length - knownStocks.length}개인데 합계를 ${f.totalWeight}% 로 적었다`,
           { stored: f.totalWeight });
    } else if (f.totalWeight != null && knownStocks.length === stocks.length) {
      const re = knownStocks.reduce((s, h) => s + Number(h.weight), 0);
      if (Math.abs(re - f.totalWeight) > 0.05) {
        flag('error', 'totalWeight-불일치', f, `저장 ${f.totalWeight}% vs 재계산 ${re.toFixed(2)}%`,
             { stored: f.totalWeight, recomputed: +re.toFixed(2) });
      }
    }
    if (f.top10Weight != null && f.totalWeight != null && f.top10Weight > f.totalWeight + 0.05) {
      flag('error', 'top10Weight-전체초과', f,
           `상위10 합계 ${f.top10Weight}% 가 전체 합계 ${f.totalWeight}% 보다 크다`);
    }
    if (f.holdingCount != null && f.holdingCount !== stocks.length) {
      flag('warn', 'holdingCount-불일치', f, `저장 ${f.holdingCount} vs 종목 줄 ${stocks.length} (현금 제외)`);
    }
    if (f.weightsKnown === true && knownStocks.length < stocks.length) {
      flag('error', 'weightsKnown-거짓', f, '비중을 다 안다고 적어 놓고 모르는 종목이 있다');
    }
  }

  // ── 8. 설정액·순자산 ────────────────────────────────────────────────────
  const aum = Number(f.aum), nav = Number(f.nav);
  if (f.aum != null) {
    if (!(aum > 0)) flag('error', '설정액-영이하', f, `aum=${f.aum}`);
    // 국내 공모펀드에 100조는 없다. 단위(원/억원)가 섞이면 여기서 걸린다.
    else if (aum > 1e14) flag('error', '설정액-단위의심', f, `aum=${aum} (100조 초과)`, { aum });
    else if (aum < 1e6) flag('warn', '설정액-과소', f, `aum=${aum} (100만원 미만)`, { aum });
  }
  // 순자산은 설정액에 평가손익이 얹힌 것이다. 자릿수로 벌어지면 한쪽이
  // 다른 단위이거나 다른 펀드의 값이다.
  if (aum > 0 && nav > 0) {
    const r = nav / aum;
    if (r > 20 || r < 0.05) {
      flag('error', '순자산-설정액-괴리', f, `순자산 ${nav} / 설정액 ${aum} = ${r.toFixed(2)}배`,
           { nav, aum, ratio: +r.toFixed(3) });
    }
  }

  // ── 9. 총보수 ───────────────────────────────────────────────────────────
  // 이 원천은 총보수를 주지 않는다(표본 60 중 59가 null). 그래서 화면에도
  // 항목이 없다. 혹시 값이 들어오면 그것대로 앞뒤를 본다 — 특히 0 은
  // "0.000%" 로 찍혀 모르는 것을 안다고 말하게 되므로 오류다.
  if (f.totalFee != null) {
    const fee = Number(f.totalFee);
    if (!Number.isFinite(fee) || fee < 0) flag('error', '총보수-음수', f, `totalFee=${f.totalFee}`);
    else if (fee === 0) flag('error', '총보수-영', f, 'totalFee=0 → 화면에 "0.000%" 로 찍힌다. 빈칸이어야 한다');
    else if (fee > 5) flag('error', '총보수-과다', f, `totalFee=${fee}% (5% 초과)`, { totalFee: fee });
  }

  // ── 10. 위험지표 ────────────────────────────────────────────────────────
  const m = f.metrics;
  if (m) {
    if (m.standardDeviation != null && Number(m.standardDeviation) < 0) {
      flag('error', '표준편차-음수', f, `standardDeviation=${m.standardDeviation}`);
    }
    if (m.trackingError != null && Number(m.trackingError) < 0) {
      flag('error', '추적오차-음수', f, `trackingError=${m.trackingError}`);
    }
    // 베타는 음수일 수 있다(인버스). 다만 자릿수 밖은 계산이 깨진 것이다.
    if (m.beta != null && Math.abs(Number(m.beta)) > 10) {
      flag('warn', '베타-범위밖', f, `beta=${m.beta}`, { beta: m.beta });
    }
    if (m.sharpe != null && Math.abs(Number(m.sharpe)) > 20) {
      flag('warn', '샤프-범위밖', f, `sharpe=${m.sharpe}`, { sharpe: m.sharpe });
    }
  }

  // ── 11. 유형·지역·자산군의 앞뒤 ─────────────────────────────────────────
  // 지역은 유형 이름 앞머리에서 읽은 것이다. 둘이 어긋나면 어딘가에서
  // 분류를 지어낸 것이다.
  if (f.type) {
    const expect = f.type.startsWith('국내') ? 'domestic'
                 : f.type.startsWith('해외') ? 'overseas' : null;
    if ((f.region ?? null) !== expect) {
      flag('error', '지역-유형과어긋남', f, `유형 "${f.type}" 인데 지역이 ${f.region ?? '없음'}`,
           { region: f.region ?? null, expect });
    }
  } else {
    flag('warn', '유형-없음', f, 'parentPeerGroupName 이 없다');
  }
  if (f.riskGrade != null) {
    const g = Number(f.riskGrade);
    if (!Number.isFinite(g) || g < 1 || g > 6) {
      flag('warn', '위험등급-범위밖', f, `riskGrade=${f.riskGrade}`);
    }
  }
}

// ── 12. 한 종목이 유형 전체의 평균을 흔드는가 ─────────────────────────────
// 화면의 "동일 유형 평균 대비" 는 같은 유형 펀드들의 산술평균을 뺀 값이다.
// 값 하나가 깨지면 그 한 펀드가 무리 전체의 파생 칸을 오염시킨다. ETF 에서
// 총수익률 3,582% 짜리 하나가 420종목의 6개월 평균 부호를 뒤집었다.
//
// 이 규칙의 목적은 검출이 아니라 **피해 규모**를 말하는 것이다. 평균이
// 흔들리는 것 자체는 오류가 아니다 — 정말로 크게 오른 펀드가 있으면 평균은
// 원래 흔들린다. 그래서 **다른 규칙이 이미 오류로 잡은 펀드**일 때만 오류로
// 올린다. ETF 에서 절대값 1%p 로 걸었다가 34종목을 헛잡은 자리다.
const cohorts = {};
for (const f of FUNDS) {
  const key = f.type || '(미상)';       // 원천이 준 유형을 그대로 쓴다
  (cohorts[key] ??= []).push(f);
}
const brokenIds = new Set(findings.filter((x) => x.sev === 'error').map((x) => x.id));
for (const [key, members] of Object.entries(cohorts)) {
  if (members.length < 20) continue;              // 작은 무리는 원래 한둘에 휘둘린다
  for (const period of Object.keys(YEARS)) {
    const vals = [];
    for (const f of members) {
      const v = f.ret?.[period];
      if (v != null && Number.isFinite(Number(v))) vals.push({ f, v: Number(v) });
    }
    if (vals.length < 20) continue;
    const mean = vals.reduce((s, x) => s + x.v, 0) / vals.length;
    for (const { f, v } of vals) {
      const shift = (mean - v) / (vals.length - 1);   // 이 펀드를 빼면 평균이 이만큼 움직인다
      if (Math.abs(shift) > 1) {
        flag(brokenIds.has(f.id) ? 'error' : 'warn', '유형평균-한펀드가흔듦', f,
             `${key} ${period}: 이 펀드(${v}%)를 빼면 ${vals.length}개 평균이 ` +
             `${mean.toFixed(2)}% → ${(mean + shift).toFixed(2)}% 로 ` +
             `${shift > 0 ? '+' : ''}${shift.toFixed(2)}%p 움직인다`,
             { period, cohort: key, cohortN: vals.length, value: v,
               cohortMean: +mean.toFixed(2), shiftPp: +shift.toFixed(2) });
      }
    }
  }
}

// ── 13. 데이터 덩어리 자체 ────────────────────────────────────────────────
const meta = [];
if (!FUNDS.length) meta.push({ sev: 'error', rule: '데이터-비었음', detail: 'funds 가 비어 있다' });
const dupCodes = FUNDS.map((f) => f.code).filter((c, i, a) => a.indexOf(c) !== i);
if (dupCodes.length) {
  meta.push({ sev: 'error', rule: '표준코드-중복',
              detail: [...new Set(dupCodes)].slice(0, 10).join(', ') });
}
for (const m of meta) findings.push({ ...m, id: null, code: null, name: null });

// ── 집계 ──────────────────────────────────────────────────────────────────
// 규칙**과 심각도**로 묶는다. 규칙만으로 묶으면 같은 규칙의 오류와 경고가
// 한 줄에 합쳐지고 심각도는 첫 건 것이 찍힌다. 집계가 거짓말을 하면 감사가
// 뜻이 없다.
const byRule = {};
for (const f of findings) {
  const gk = `${f.rule}|${f.sev}`;
  byRule[gk] ??= { rule: f.rule, sev: f.sev, count: 0, ids: new Set(), examples: [] };
  const b = byRule[gk];
  b.count += 1; b.ids.add(f.id);
  if (b.examples.length < 5) b.examples.push(f);
}
const sevOrder = { error: 0, warn: 1, info: 2 };
const rules = Object.values(byRule)
  .map((b) => ({ ...b, fundCount: b.ids.size, ids: undefined }))
  .sort((a, b) => (sevOrder[a.sev] - sevOrder[b.sev]) || (b.count - a.count));

const errorIds = new Set(findings.filter((f) => f.sev === 'error').map((f) => f.id));
const counts = { error: 0, warn: 0, info: 0 };
for (const f of findings) counts[f.sev] += 1;

console.log('=== 규칙별 ===');
const pad = (s, n) => String(s).padEnd(n, ' ');
for (const r of rules) {
  console.log(`  ${pad(r.sev, 6)} ${pad(r.rule, 26)} ${String(r.count).padStart(6)}건  ${String(r.fundCount).padStart(5)}개`);
}
console.log(`\n오류 ${counts.error} · 경고 ${counts.warn} · 참고 ${counts.info}`);
console.log(`오류가 하나라도 있는 펀드: ${errorIds.size} / ${FUNDS.length}`);

if (counts.error) {
  console.log('\n=== 오류 상위 25건 ===');
  for (const f of findings.filter((x) => x.sev === 'error').slice(0, 25)) {
    console.log(`  [${f.rule}] ${f.code ?? ''} ${f.name ?? ''} — ${f.detail}`);
  }
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify({
  at: new Date().toISOString(), dataUpdatedAt: DATA.updatedAt, dataSource: DATA.source,
  total: FUNDS.length, counts, errorFundCount: errorIds.size, rules, findings,
}, null, 2));

const md = ['# 펀드 자료 전수 감사', '', `감사 시각: ${new Date().toISOString()}`,
  `자료 기준: ${DATA.updatedAt} (${DATA.source})`, `대상: ${FUNDS.length}개`, '',
  `**오류 ${counts.error}건 · 경고 ${counts.warn}건 · 참고 ${counts.info}건**`,
  `**오류가 있는 펀드 ${errorIds.size} / ${FUNDS.length}**`, '',
  '이 감사는 바깥 자료에 붙지 않는다. `data/fund.js` 안에서 서로 어긋나는 것만',
  '잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.', '',
  '일일 수집 워크플로의 **커밋 앞**에 관문으로 걸린다. 오류가 있으면 커밋되지 않는다.', '',
  '## 규칙별', '', '| 심각도 | 규칙 | 건수 | 펀드 수 |', '|---|---|---:|---:|'];
for (const r of rules) md.push(`| ${r.sev} | ${r.rule} | ${r.count} | ${r.fundCount} |`);
if (counts.error) {
  md.push('', '## 오류 상세', '', '| 펀드 | 유형 | 규칙 | 내용 |', '|---|---|---|---|');
  for (const f of findings.filter((x) => x.sev === 'error').slice(0, 300)) {
    md.push(`| ${f.code ?? ''} ${f.name ?? ''} | ${f.type ?? ''} | ${f.rule} | ` +
            `${String(f.detail).replace(/\|/g, '\\|')} |`);
  }
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[audit] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(counts.error ? 1 : 0);
