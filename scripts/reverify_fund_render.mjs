#!/usr/bin/env node
/**
 * 재검증 L1 — **화면에 찍힌 글자**가 데이터와 같은가.
 *
 *   node scripts/reverify_fund_render.mjs [표본수]
 *   -> tools/discovery/fund_reverify_render.{json,md}
 *
 * ── 왜 필요한가 ────────────────────────────────────────────────────────────
 *
 * 감사는 `data/fund.js` 를 본다. 그런데 사람이 읽는 것은 데이터가 아니라
 * **브라우저가 그려 낸 글자**다. 그 사이에 서식 함수가 있다 — `fmtPct`,
 * `fmtAmount`, `fmtFee`, `fmtWeight`, `labelOf`. 데이터가 맞아도 서식이
 * 틀리면 화면은 거짓을 말한다.
 *
 * 실제로 이 화면에서 그런 일이 한 번 있었다. 저장된 비중은 맞았는데
 * `toFixed(2)` 가 0.0000045% 를 "0.00%" 로 찍어 "담지 않았다" 는 뜻이 됐다.
 *
 * 그래서 화면에서 글자를 **읽어 와** 데이터로 되돌려 맞대 본다.
 * 스킬이 말하는 "역방향 확인 — 슬라이드에서 대장으로" 다.
 *
 * ── 특히 순위·유형평균 ─────────────────────────────────────────────────────
 *
 * 백분율 순위와 유형평균 대비는 **데이터에 없다.** 브라우저가 그 자리에서
 * 3,196개를 훑어 만든다. 그래서 지금까지 어떤 감사도 이 두 칸을 본 적이 없다.
 * 여기서 두 번째 구현으로 다시 계산해 화면 값과 맞댄다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const OUT_JSON = 'tools/discovery/fund_reverify_render.json';
const OUT_MD = 'tools/discovery/fund_reverify_render.md';
const SAMPLE_N = Number(process.argv[2]) || 40;

const out = { at: new Date().toISOString(), findings: [], errors: [] };
function flag(sev, rule, code, detail, nums) {
  out.findings.push({ sev, rule, code, detail, ...nums });
}
const tally = {};
function score(field, ok) {
  tally[field] = tally[field] || { checked: 0, same: 0 };
  tally[field].checked += 1;
  if (ok) tally[field].same += 1;
}

// ── 화면 글자를 수로 되돌리는 **두 번째 구현** ──────────────────────────────
// 화면의 서식 함수를 부르지 않는다. 부르면 자기 자신과 비교하는 셈이다.

/** "+12.34%" / "-3.00%" / "–" → 수 */
function parsePct(text) {
  const t = String(text || '').trim();
  if (!t || t === '–' || t === '-') return null;
  const m = t.match(/^([+-]?[\d,]+\.?\d*)\s*%/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}
/** "1조 2,345억" / "8,983억" / "1,234만" → 원 */
function parseAmount(text) {
  const t = String(text || '').trim();
  if (!t || t === '–') return null;
  const sign = t.startsWith('-') ? -1 : 1;
  const body = t.replace(/^-/, '');
  let total = 0, matched = false;
  const jo = body.match(/([\d,.]+)\s*조/);
  const eok = body.match(/([\d,.]+)\s*억/);
  const man = body.match(/([\d,.]+)\s*만/);
  if (jo) { total += Number(jo[1].replace(/,/g, '')) * 1e12; matched = true; }
  if (eok) { total += Number(eok[1].replace(/,/g, '')) * 1e8; matched = true; }
  if (man) { total += Number(man[1].replace(/,/g, '')) * 1e4; matched = true; }
  if (!matched) {
    const plain = Number(body.replace(/,/g, ''));
    return Number.isFinite(plain) ? sign * plain : null;
  }
  return sign * total;
}
/** "0.14~1.14%" / "0.57%" → [최저, 최고] */
function parseFeeRange(text) {
  const t = String(text || '').trim();
  if (!t || t === '–') return [null, null];
  const m = t.match(/^([\d.]+)\s*~\s*([\d.]+)\s*%$/);
  if (m) return [Number(m[1]), Number(m[2])];
  const s = t.match(/^([\d.]+)\s*%$/);
  return s ? [Number(s[1]), Number(s[1])] : [null, null];
}

/**
 * 화면은 `toFixed(n)` 으로 반올림해 찍는다. 그래서 표기 검증은 **허용오차가
 * 아니라 "올바르게 반올림한 값과 정확히 같은가"** 로 봐야 한다.
 *
 * 처음에 `|화면 − 데이터| < 0.005` 로 걸었다가 28건을 헛잡았다. 정확히 절반인
 * 값들이었다 — 데이터 0.005 는 화면에 "0.01%", 0.645 는 "0.65%" 로 찍히는데
 * 그 차이가 정확히 0.005 라 `< 0.005` 를 통과하지 못했다. 화면은 맞게
 * 반올림했고 내 잣대가 틀린 것이었다.
 *
 * 부동소수 표현 때문에 0.155 는 "0.15", 0.495 는 "0.49" 로 내려간다. 화면이
 * 그것을 그대로 비추는 것이 맞으므로, 나도 같은 `toFixed` 로 견준다.
 */
function roundedEq(shown, actual, digits = 2) {
  if (actual == null) return shown == null;
  if (shown == null) return false;
  return Number(shown) === Number(Number(actual).toFixed(digits));
}

// 화면이 조·억으로 줄여 찍으므로 되돌린 값에는 반올림 오차가 남는다.
// 1억 단위로 끊어 찍는 구간에서는 최대 5천만원까지 벌어질 수 있다.
function amountNear(shown, actual) {
  if (shown == null && actual == null) return true;
  if (shown == null || actual == null) return false;
  const a = Math.abs(actual);
  const tol = a >= 1e12 ? 5e7 : a >= 1e8 ? 5e7 : a >= 1e4 ? 5e3 : 1;
  return Math.abs(shown - actual) <= tol;
}

// ── 서버 ────────────────────────────────────────────────────────────────────
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const b = await readFile(join(process.cwd(), p));
    res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(b);
  } catch { res.writeHead(404).end('nf'); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
await page.goto(`${base}/fund.html`, { waitUntil: 'networkidle' });

// ── 데이터를 따로 읽는다 (브라우저 밖에서) ──────────────────────────────────
const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
const byId = new Map(FUNDS.map((f) => [f.id, f]));
const RISK_LABEL = DATA.labels?.riskGrade || {};
console.log(`데이터 ${FUNDS.length}개 · 화면 ${await page.evaluate(() => (window.FUND_DATA?.funds || []).length)}개`);
out.dataCount = FUNDS.length;

// ── 순위·유형평균을 두 번째 구현으로 다시 만든다 ────────────────────────────
// 화면은 유형(parentPeerGroupName)으로 무리를 가르고, 백분율 순위 하나와
// 산술평균 대비를 낸다. 여기서 같은 규칙을 따로 구현한다.
function peerStats(fund, period) {
  const key = fund.type || '(미상)';
  const vals = [];
  for (const f of FUNDS) {
    if ((f.type || '(미상)') !== key) continue;
    const v = f.ret?.[period];
    if (v != null && Number.isFinite(Number(v))) vals.push(Number(v));
  }
  const me = Number(fund.ret?.[period]);
  if (!Number.isFinite(me)) return null;
  // 백분율 순위: 나보다 큰 값의 개수 + 1 을 모집단으로 나눈다. 1 이 가장 좋다.
  const better = vals.filter((v) => v > me).length;
  const pct = Math.max(1, Math.round(((better + 1) / vals.length) * 100));
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  return { n: vals.length, pct, mean, diff: me - mean };
}

// ── 표본 ────────────────────────────────────────────────────────────────────
// 보유종목·수익률·보수가 다 있는 것과, 비어 있는 것을 섞는다.
const rich = FUNDS.filter((f) => f.holdingCount > 0 && f.retCount > 3 && f.feeMin != null);
const blank = FUNDS.filter((f) => !f.holdingCount || f.retDropped);
const pick = [];
const stepR = Math.max(1, Math.floor(rich.length / Math.ceil(SAMPLE_N * 0.7)));
const stepB = Math.max(1, Math.floor(blank.length / Math.ceil(SAMPLE_N * 0.3)));
rich.filter((_, i) => i % stepR === 0).slice(0, Math.ceil(SAMPLE_N * 0.7)).forEach((f) => pick.push(f));
blank.filter((_, i) => i % stepB === 0).slice(0, Math.ceil(SAMPLE_N * 0.3)).forEach((f) => pick.push(f));
console.log(`표본 ${pick.length}개 (보유종목·수익률 있는 것 ${Math.ceil(SAMPLE_N * 0.7)}, 빈 것 ${Math.ceil(SAMPLE_N * 0.3)})`);
out.sampleSize = pick.length;

// ── 상세 카드의 글자를 읽어 온다 ────────────────────────────────────────────
console.log('\n=== 상세 카드 ===');
for (const f of pick) {
  let shown;
  try {
    shown = await page.evaluate((id) => {
      window.state.selected = id;
      window.renderDetail();
      const root = document.getElementById('detail');
      if (!root) return null;
      const kv = {};
      root.querySelectorAll('.kv > div').forEach((d) => {
        const k = d.querySelector('.k')?.textContent?.trim();
        const v = d.querySelector('.v')?.textContent?.trim();
        if (k) kv[k] = v;
      });
      const rows = [];
      root.querySelectorAll('.ret-table tbody tr').forEach((tr) => {
        const tds = [...tr.querySelectorAll('td')].map((td) => td.textContent.trim());
        rows.push(tds);
      });
      const holds = [];
      root.querySelectorAll('.hold-row').forEach((hr) => {
        holds.push({ name: hr.querySelector('.nm')?.textContent?.trim(),
                     wt: hr.querySelector('.wt')?.textContent?.trim() });
      });
      const rankPct = [...root.querySelectorAll('.rank-pct')].map((n) => n.textContent.trim());
      const rankRaw = [...root.querySelectorAll('.rank-raw')].map((n) => n.textContent.trim());
      return { kv, rows, holds, rankPct, rankRaw, title: root.querySelector('h3')?.textContent?.trim() };
    }, f.id);
  } catch (e) {
    out.errors.push(`${f.code}: ${e.message}`);
    continue;
  }
  if (!shown) { out.errors.push(`${f.code}: 상세가 그려지지 않음`); continue; }

  // 제목 = 이름
  score('제목', shown.title === (f.name || f.code));
  if (shown.title !== (f.name || f.code)) {
    flag('error', '제목-불일치', f.code, `화면 "${shown.title}" vs 데이터 "${f.name}"`);
  }

  // kv 칸들
  const kvChecks = [
    ['표준코드', shown.kv['표준코드'], f.code, (a, b) => a === b],
    ['유형', shown.kv['유형'], f.type ?? '–', (a, b) => a === b],
    ['운용사', shown.kv['운용사'], f.company ?? '–', (a, b) => a === b],
    ['설정일', shown.kv['설정일'], f.inceptionDate ?? '–', (a, b) => a === b],
    ['위험등급', shown.kv['위험등급'],
      f.riskGrade == null ? '–' : (RISK_LABEL[f.riskGrade]?.ko ?? f.riskGrade), (a, b) => a === b],
    ['벤치마크', shown.kv['벤치마크'], f.benchmarkName ?? '–', (a, b) => a === b],
  ];
  for (const [label, got, want, eq] of kvChecks) {
    const ok = eq(got ?? '–', want);
    score(`상세.${label}`, ok);
    if (!ok) flag('error', `상세.${label}-불일치`, f.code, `화면 "${got}" vs 데이터 "${want}"`);
  }

  // 기준가 — 화면은 소수 2자리 + 천단위 쉼표
  {
    const got = shown.kv['기준가'];
    const num = got && got !== '–' ? Number(String(got).replace(/,/g, '')) : null;
    const ok = f.basePrice == null ? (got === '–') : roundedEq(num, f.basePrice, 2);
    score('상세.기준가', ok);
    if (!ok) flag('error', '상세.기준가-불일치', f.code, `화면 "${got}" vs 데이터 ${f.basePrice}`);
  }

  // 설정액·순자산 — 조/억으로 줄여 찍으므로 되돌려 견준다
  for (const [label, key] of [['설정액', 'aum'], ['순자산', 'nav']]) {
    const got = shown.kv[label];
    const parsed = parseAmount(got);
    const ok = f[key] == null ? (got === '–') : amountNear(parsed, f[key]);
    score(`상세.${label}`, ok);
    if (!ok) flag('error', `상세.${label}-불일치`, f.code,
      `화면 "${got}" → ${parsed} vs 데이터 ${f[key]}`);
  }

  // 총보수 범위
  {
    const got = shown.kv['총보수 (클래스별 범위)'];
    const [lo, hi] = parseFeeRange(got);
    const ok = f.feeMin == null
      ? (got === '–' || got == null)
      : (roundedEq(lo, f.feeMin, 2) && roundedEq(hi, f.feeMax ?? f.feeMin, 2));
    score('상세.총보수', ok);
    if (!ok) flag('error', '상세.총보수-불일치', f.code,
      `화면 "${got}" → ${lo}~${hi} vs 데이터 ${f.feeMin}~${f.feeMax}`);
  }

  // 보유종목 수 / 상위10 비중
  {
    const got = shown.kv['보유종목 수'];
    const n = got && got !== '–' ? Number(String(got).replace(/,/g, '')) : null;
    const ok = f.holdingCount ? n === f.holdingCount : (got === '–' || got == null);
    score('상세.보유종목수', ok);
    if (!ok) flag('error', '상세.보유종목수-불일치', f.code, `화면 "${got}" vs 데이터 ${f.holdingCount}`);

    const g2 = shown.kv['상위 10종목 비중'];
    const p2 = parsePct(g2);
    const ok2 = f.top10Weight == null ? (g2 === '–' || g2 == null) : roundedEq(p2, f.top10Weight, 2);
    score('상세.상위10비중', ok2);
    if (!ok2) flag('error', '상세.상위10비중-불일치', f.code, `화면 "${g2}" vs 데이터 ${f.top10Weight}`);
  }

  // ── 수익률 표 ───────────────────────────────────────────────────────────
  // 각 줄: [기간, 수익률, 벤치마크 대비, 백분율 순위, 유형평균 대비]
  const PERIOD_KO = Object.fromEntries((DATA.periods || []).map((p) => [p[1], p[0]]));
  for (const row of shown.rows) {
    const key = PERIOD_KO[row[0]];
    if (!key) continue;
    const stored = f.ret?.[key];

    // 비운 칸은 colspan 이라 칸 수가 다르다.
    if (row.length < 5) {
      const ok = stored == null;
      score('수익률표.빈칸', ok);
      if (!ok) flag('error', '수익률표-빈칸인데값있음', f.code, `${key}: 데이터 ${stored}`);
      continue;
    }

    const shownRet = parsePct(row[1]);
    const ok1 = stored == null ? shownRet == null : roundedEq(shownRet, stored, 2);
    score('수익률표.수익률', ok1);
    if (!ok1) flag('error', '수익률표-수익률불일치', f.code, `${key}: 화면 "${row[1]}" vs 데이터 ${stored}`);

    // 벤치마크 대비 = 수익률 − 벤치마크
    {
      const b = f.retBenchmark?.[key];
      const m = String(row[2]).match(/^([+-]?[\d.]+)%p/);
      const shownDiff = m ? Number(m[1]) : null;
      const want = (stored != null && b != null) ? (stored - b) : null;
      const ok = want == null ? shownDiff == null : roundedEq(shownDiff, want, 2);
      score('수익률표.벤치마크대비', ok);
      if (!ok) {
        flag('error', '수익률표-벤치마크대비불일치', f.code,
          `${key}: 화면 "${row[2]}" → ${shownDiff} vs 재계산 ${want} (수익률 ${stored} − 지수 ${b})`);
      }
    }

    // 백분율 순위 · 유형평균 대비 — 데이터에 없는 값. 두 번째 구현으로 다시 만든다.
    {
      const ps = peerStats(f, key);
      const mRank = String(row[3]).match(/^(\d+)%/);
      const shownRank = mRank ? Number(mRank[1]) : null;
      const mN = String(row[3]).match(/동일 유형 ([\d,]+)개/);
      const shownN = mN ? Number(mN[1].replace(/,/g, '')) : null;

      if (ps && ps.n >= 20) {
        const okR = shownRank != null && Math.abs(shownRank - ps.pct) <= 1;
        score('순위.백분율', okR);
        if (!okR) {
          flag('error', '순위-백분율불일치', f.code,
            `${key}: 화면 ${shownRank}% vs 재계산 ${ps.pct}% (모집단 ${ps.n})`,
            { period: key, shown: shownRank, recomputed: ps.pct, n: ps.n });
        }
        const okN = shownN === ps.n;
        score('순위.모집단수', okN);
        if (!okN) {
          flag('error', '순위-모집단수불일치', f.code,
            `${key}: 화면 ${shownN}개 vs 재계산 ${ps.n}개`);
        }
      }
      if (ps && ps.n >= 5) {
        const mP = String(row[4]).match(/^([+-]?[\d.]+)%p/);
        const shownDiff = mP ? Number(mP[1]) : null;
        const okP = roundedEq(shownDiff, ps.diff, 2);
        score('유형평균.대비', okP);
        if (!okP) {
          flag('error', '유형평균-대비불일치', f.code,
            `${key}: 화면 "${row[4]}" → ${shownDiff} vs 재계산 ${ps.diff.toFixed(2)} (평균 ${ps.mean.toFixed(2)})`,
            { period: key, shown: shownDiff, recomputed: Number(ps.diff.toFixed(2)) });
        }
        const mAvg = String(row[4]).match(/평균 ([+-]?[\d.]+)%/);
        const shownAvg = mAvg ? Number(mAvg[1]) : null;
        const okA = roundedEq(shownAvg, ps.mean, 2);
        score('유형평균.값', okA);
        if (!okA) {
          flag('error', '유형평균-값불일치', f.code,
            `${key}: 화면 평균 ${shownAvg} vs 재계산 ${ps.mean.toFixed(2)}`);
        }
      }
    }
  }

  // ── 보유종목 비중 ───────────────────────────────────────────────────────
  if (f.holdings && f.holdings.length && shown.holds.length) {
    // 화면은 비중 내림차순으로 다시 세운다. 같은 차례로 만들어 견준다.
    const sorted = f.holdings.slice().sort((a, b) => {
      const x = a.weight == null ? -1 : Number(a.weight);
      const y = b.weight == null ? -1 : Number(b.weight);
      return y - x;
    });
    let okAll = true;
    for (let i = 0; i < shown.holds.length && i < sorted.length; i += 1) {
      const s = shown.holds[i], d = sorted[i];
      if (s.name !== (d.name || d.code || '–')) {
        okAll = false;
        flag('error', '보유종목-이름불일치', f.code, `${i}번째: 화면 "${s.name}" vs 데이터 "${d.name}"`);
        break;
      }
      const w = d.weight;
      const txt = s.wt;
      let ok;
      if (w == null) ok = txt === '–';
      else if (w === 0) ok = txt === '0.00%';
      else if (Math.abs(w) < 0.005) ok = /^[<>]/.test(txt);   // "<0.01%" — 0 으로 뭉개지 않았는가
      else { ok = roundedEq(parsePct(txt), w, 2); }
      if (!ok) {
        okAll = false;
        flag('error', '보유종목-비중표기불일치', f.code,
          `${d.name}: 화면 "${txt}" vs 데이터 ${w}`);
        break;
      }
    }
    score('보유종목.비중표기', okAll);
  }
}

// ── 목록 행 ─────────────────────────────────────────────────────────────────
console.log('=== 목록 행 ===');
{
  const listRows = await page.evaluate(() => {
    const rows = [];
    document.querySelectorAll('#list-body tr[data-id]').forEach((tr) => {
      const tds = [...tr.querySelectorAll('td')].map((td) => td.textContent.trim());
      rows.push({ id: tr.getAttribute('data-id'), tds });
    });
    return rows;
  });
  for (const r of listRows) {
    const f = byId.get(r.id);
    if (!f) { flag('error', '목록-정체불명행', r.id, '데이터에 없는 id'); continue; }
    // [pick, 펀드(이름+코드), 유형, 운용사, 위험등급, 설정액, 총보수, 수익률, 보유종목]
    const okName = r.tds[1].includes(f.name || f.code) && r.tds[1].includes(f.code);
    score('목록.이름·코드', okName);
    if (!okName) flag('error', '목록-이름불일치', f.code, `화면 "${r.tds[1]}"`);

    const okType = r.tds[2] === (f.type ?? '–');
    score('목록.유형', okType);
    if (!okType) flag('error', '목록-유형불일치', f.code, `화면 "${r.tds[2]}" vs ${f.type}`);

    const aum = parseAmount(r.tds[5]);
    const okAum = f.aum == null ? r.tds[5] === '–' : amountNear(aum, f.aum);
    score('목록.설정액', okAum);
    if (!okAum) flag('error', '목록-설정액불일치', f.code, `화면 "${r.tds[5]}" → ${aum} vs ${f.aum}`);

    const [lo, hi] = parseFeeRange(r.tds[6]);
    const okFee = f.feeMin == null ? r.tds[6] === '–'
      : (roundedEq(lo, f.feeMin, 2) && roundedEq(hi, f.feeMax ?? f.feeMin, 2));
    score('목록.총보수', okFee);
    if (!okFee) flag('error', '목록-총보수불일치', f.code, `화면 "${r.tds[6]}" vs ${f.feeMin}~${f.feeMax}`);

    const period = await page.evaluate(() => window.state.period);
    const stored = f.ret?.[period];
    const shownRet = parsePct(r.tds[7]);
    const okRet = stored == null ? shownRet == null : roundedEq(shownRet, stored, 2);
    score('목록.수익률', okRet);
    if (!okRet) flag('error', '목록-수익률불일치', f.code, `${period}: 화면 "${r.tds[7]}" vs ${stored}`);
  }
  console.log(`  ${listRows.length}행 확인`);
  out.listRows = listRows.length;
}

score('콘솔오류없음', consoleErrors.length === 0);
if (consoleErrors.length) flag('error', '콘솔오류', null, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
server.close();

// ── 집계 ────────────────────────────────────────────────────────────────────
out.tally = tally;
const errs = out.findings.filter((f) => f.sev === 'error');
out.counts = { error: errs.length };
const rowsT = Object.entries(tally).sort((a, b) => (a[1].same / a[1].checked) - (b[1].same / b[1].checked));
console.log('\n=== 항목별 일치 ===');
for (const [k, v] of rowsT) {
  console.log(`  ${k.padEnd(24)} ${String(v.same).padStart(5)}/${String(v.checked).padStart(5)}  ` +
    `${(v.same / v.checked * 100).toFixed(1)}%`);
}
console.log(`\n오류 ${errs.length}건`);
for (const f of errs.slice(0, 20)) console.log(`  [${f.rule}] ${f.code ?? ''} — ${f.detail}`);

out.verdict = errs.length === 0
  ? `표본 ${out.sampleSize}개 상세 + 목록 ${out.listRows}행의 모든 표기가 데이터와 일치`
  : `오류 ${errs.length}건`;
console.log(`\n판정: ${out.verdict}`);

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 재검증 L1 — 화면에 찍힌 글자가 데이터와 같은가', '', `검증 시각: ${out.at}`,
  `표본: 상세 ${out.sampleSize}개 · 목록 ${out.listRows}행`, '', `**${out.verdict}**`, '',
  '감사는 `data/fund.js` 를 봅니다. 사람이 읽는 것은 브라우저가 그려 낸 **글자**입니다.',
  '그 사이에 서식 함수가 있고, 데이터가 맞아도 서식이 틀리면 화면은 거짓을 말합니다.', '',
  '여기서는 화면에서 글자를 **읽어 와** 수로 되돌려 데이터와 맞댑니다. 되돌리는 파서는',
  '화면의 서식 함수를 부르지 않고 따로 구현했습니다 — 부르면 자기 자신과 비교하는 셈입니다.', '',
  '## 특히 순위·유형평균', '',
  '백분율 순위와 유형평균 대비는 **데이터에 없습니다.** 브라우저가 그 자리에서 3,196개를',
  '훑어 만듭니다. 그래서 지금까지 어떤 감사도 이 두 칸을 본 적이 없습니다. 여기서 두 번째',
  '구현으로 다시 계산해 화면 값과 맞댔습니다.', '',
  '## 항목별 일치', '', '| 항목 | 일치 | 검사 | 비율 |', '|---|---:|---:|---:|'];
for (const [k, v] of rowsT) {
  md.push(`| ${k} | ${v.same} | ${v.checked} | ${(v.same / v.checked * 100).toFixed(1)}% |`);
}
md.push('', `**오류 ${errs.length}건**`, '');
if (errs.length) {
  md.push('## 오류', '', '| 표준코드 | 규칙 | 내용 |', '|---|---|---|');
  for (const f of errs.slice(0, 200)) {
    md.push(`| ${f.code ?? ''} | ${f.rule} | ${String(f.detail).replace(/\|/g, '\\|')} |`);
  }
}
if (out.errors.length) {
  md.push('', '## 실행 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[render] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(errs.length ? 1 : 0);
