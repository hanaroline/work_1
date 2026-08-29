#!/usr/bin/env node
/**
 * 탐침 — 금융투자협회에서 **과거 설정원본**을 받을 수 있는가.
 *
 *   node scripts/probe_fund_kofia_flow.mjs
 *   -> tools/discovery/fund_kofia_flow.{md,json}
 *
 * ── 무엇을 알아보려는 것인가 ────────────────────────────────────────────────
 *
 * ETF 화면에는 "3개월 자금 유입 상위" 가 있다. 원천(네이버)이 ETF 에는
 * `cumulativeNetInflowList` 를 그냥 주기 때문이다. 펀드 쪽 응답에는 그 필드가
 * 없다 — 지금까지 뜬 응답 원본 5건을 훑어 한 건도 못 찾았다.
 *
 * 유입액 자체가 없어도 **설정원본의 3개월 차이**로 낼 수 있다. 설정원본은
 * 좌수 × 1,000 이라 수익률로 움직이지 않고 설정·해지로만 움직인다. 문제는
 * 3개월 전 설정원본이 없다는 것이다 — 이 화면은 오늘 만들었다.
 *
 * 그런데 투자지역을 받는 전자공시 팝업 주소에 **기준일자 파라미터가 이미
 * 있다**:
 *
 *   DISComFundSmryInfo.xml&companyCd=&standardCd={표준코드}&standardDt=&grntGb=
 *                                                          ^^^^^^^^^^
 *
 * 지금은 비워서 부르고 있다. 여기에 과거 날짜를 넣어 그날의 설정원본이 오면
 * 3개월을 기다릴 것 없이 소급해서 채울 수 있다.
 *
 * ── 어떻게 확인하나 ─────────────────────────────────────────────────────────
 *
 * **태그 이름을 외워서 찾지 않는다.** 이 저장소에서 이름을 짐작했다가 틀린
 * 것이 여러 번이다. 우리는 그 펀드의 오늘 설정원본과 순자산을 이미 알고
 * 있으니, 응답 XML 의 모든 숫자 태그를 훑어 **값이 맞는 태그를 찾는다.**
 * 이름이 아니라 값으로 붙잡는 것이라 계약이 바뀌어도 같은 방법이 통한다.
 *
 * 그런 다음 기준일자만 갈아 끼워 다시 부르고, **값이 실제로 달라지는지**
 * 본다. 파라미터가 있어도 무시하고 늘 최신치를 주는 경우가 흔하다.
 * 값이 안 변하면 그 길은 막힌 것이고, 그렇게 보고한다.
 *
 * ── 이 세션에서는 못 돌린다 ─────────────────────────────────────────────────
 *
 * 여기서는 금투협에 못 붙는다(CONNECT 403). GitHub Actions 에서 돌린다.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const POST_URL = 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const SAMPLE = 8;          // 표본 펀드 수. 하나만 보고 단정하지 않는다.

const out = { at: new Date().toISOString(), steps: [], funds: [], verdict: null };

function say(s) { console.log(s); out.steps.push(s); }

// ── 대상 ────────────────────────────────────────────────────────────────────
const src = await readFile('data/fund-kr.js', 'utf8');
const KR = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const all = (KR.funds || []).filter((f) => f.code && f.aum != null && f.nav != null);
if (!all.length) throw new Error('설정액이 있는 펀드가 없다');

// 큰 것과 작은 것을 섞는다. 큰 펀드만 보면 소수 자릿수 문제를 못 본다.
const sorted = all.slice().sort((a, b) => Number(b.aum) - Number(a.aum));
const picks = [];
for (let i = 0; i < SAMPLE; i += 1) {
  picks.push(sorted[Math.floor((i / SAMPLE) * sorted.length)]);
}
say(`표본 ${picks.length}개 (설정액 ${Number(picks[0].aum).toExponential(2)} ~ ` +
    `${Number(picks[picks.length - 1].aum).toExponential(2)})`);

const seed = picks[0];
const today = KR.funds[0]?.tradeDate || null;
say(`오늘 기준일 ${today}`);

// ── 1. 조회 계약을 관찰한다 ─────────────────────────────────────────────────
say('팝업을 열어 오가는 POST 를 잡는다…');
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });
const page = await ctx.newPage();

const captured = [];
page.on('request', (r) => {
  if (r.method() === 'POST' && r.url().includes('/proframeWeb/XMLSERVICES/')) {
    captured.push({ body: r.postData() || '' });
  }
});
page.on('response', async (r) => {
  if (r.request().method() !== 'POST') return;
  if (!r.url().includes('/proframeWeb/XMLSERVICES/')) return;
  const hit = captured.find((c) => c.body === (r.request().postData() || '') && c.res == null);
  if (hit) { try { hit.res = await r.text(); } catch { hit.res = null; } }
});

await page.goto(
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
  `&companyCd=&standardCd=${encodeURIComponent(seed.code)}&standardDt=&grntGb=`,
  { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(8000);
await page.close(); await ctx.close(); await browser.close();

say(`POST ${captured.length}건을 잡았다`);
out.captured = captured.map((c) => ({
  bodyLen: c.body.length,
  body: c.body.slice(0, 4000),
  resLen: c.res ? c.res.length : null,
  res: c.res ? c.res.slice(0, 4000) : null,
}));

// ── 2. 값으로 태그를 찾는다 ─────────────────────────────────────────────────
/**
 * XML 에서 <태그>숫자</태그> 를 모두 뽑는다. 이름은 보지 않는다.
 */
function numericTags(xml) {
  const map = {};
  const re = /<([A-Za-z][\w.]*)>\s*(-?[\d,]+(?:\.\d+)?)\s*<\/\1>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const v = Number(m[2].replace(/,/g, ''));
    if (Number.isFinite(v)) (map[m[1]] ||= []).push(v);
  }
  return map;
}

/** 아는 값과 상대오차 tol 안에서 맞는 태그를 고른다. */
function tagsMatching(map, target, tol = 0.02) {
  if (target == null || !Number.isFinite(Number(target)) || Number(target) === 0) return [];
  const t = Number(target);
  const hits = [];
  for (const [tag, vals] of Object.entries(map)) {
    for (const v of vals) {
      // 금투협은 백만원 단위로 싣는 표가 있다. 배수도 같이 본다.
      for (const [scale, label] of [[1, '원'], [1e6, '백만원'], [1e8, '억원'], [1e3, '천원']]) {
        if (Math.abs(v * scale - t) / Math.abs(t) <= tol) hits.push({ tag, raw: v, scale, unit: label });
      }
    }
  }
  return hits;
}

const withRes = captured.filter((c) => c.res && c.res.length > 200);
if (!withRes.length) {
  out.verdict = '막힘 — 응답을 하나도 못 잡았다. 계약이 바뀌었거나 팝업이 안 열렸다.';
  say(out.verdict);
} else {
  // 씨앗 펀드의 설정원본·순자산이 어느 태그에 있는지 찾는다.
  let found = null;
  for (const c of withRes) {
    const map = numericTags(c.res);
    const aumHits = tagsMatching(map, seed.aum);
    const navHits = tagsMatching(map, seed.nav);
    if (aumHits.length) { found = { body: c.body, res: c.res, map, aumHits, navHits }; break; }
  }

  if (!found) {
    out.verdict = '막힘 — 응답 어디에도 우리가 아는 설정원본 값이 없다. ' +
                  '이 서비스는 설정원본을 주지 않거나 단위가 다르다.';
    out.numericTagsSample = withRes.map((c) => Object.keys(numericTags(c.res)).slice(0, 60));
    say(out.verdict);
  } else {
    out.aumTags = found.aumHits;
    out.navTags = found.navHits;
    say(`설정원본으로 보이는 태그: ${found.aumHits.map((h) => `${h.tag}(${h.unit})`).join(', ')}`);
    say(`순자산으로 보이는 태그: ${found.navHits.map((h) => `${h.tag}(${h.unit})`).join(', ') || '(못 찾음)'}`);

    // ── 3. 기준일자를 갈아 끼워 본다 ────────────────────────────────────────
    // 본문에서 오늘 날짜꼴(yyyymmdd) 을 찾아 바꾼다. 어느 태그가 기준일자인지
    // 이름으로 짐작하지 않고, **날짜꼴 문자열을 전부 바꿔** 값이 변하는지 본다.
    const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}` +
                       `${String(d.getDate()).padStart(2, '0')}`;
    const base = today ? new Date(today) : new Date();
    const past = new Date(base); past.setMonth(past.getMonth() - 3);

    const dateTokens = [...new Set(found.body.match(/\b20\d{6}\b/g) || [])];
    out.dateTokensInBody = dateTokens;
    say(`본문 안의 날짜꼴 토큰: ${dateTokens.join(', ') || '(없음)'}`);

    const aumTag = found.aumHits[0];

    async function post(body) {
      const res = await fetch(POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          Accept: 'application/xml, text/xml, */*',
          'User-Agent': UA,
          Origin: 'https://dis.kofia.or.kr',
          Referer: 'https://dis.kofia.or.kr/websquare/index.jsp',
        },
        body,
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    }

    /** 그 응답에서 설정원본 태그의 값을 꺼낸다(원 단위로 되돌려서). */
    function readAum(xml) {
      const map = numericTags(xml);
      const vals = map[aumTag.tag];
      if (!vals || !vals.length) return null;
      return vals[0] * aumTag.scale;
    }

    // 먼저 재생이 되는지 본다 — 기준일자를 안 건드린 그대로.
    let replayOk = false;
    try {
      const v = readAum(await post(found.body));
      replayOk = v != null;
      out.replay = { value: v, known: Number(seed.aum), ok: replayOk };
      say(`재생 확인 — ${seed.code} 설정원본 ${v} (우리 값 ${seed.aum})`);
    } catch (e) {
      out.replay = { error: String(e.message || e) };
      say(`재생 실패: ${e.message || e}`);
    }

    if (!replayOk) {
      out.verdict = '막힘 — 본문 재생이 안 된다. 브라우저 밖에서는 못 부른다.';
      say(out.verdict);
    } else if (!dateTokens.length) {
      out.verdict = '판정 보류 — 본문에 날짜꼴이 없다. 기준일자를 어디에 넣는지 ' +
                    '본문만으로는 알 수 없다. 잡아 둔 본문 원본을 사람이 읽어야 한다.';
      say(out.verdict);
    } else {
      // 표본 전체로, 오늘치와 3개월 전치를 나란히 받아 본다.
      const pastYmd = ymd(past);
      say(`기준일자를 ${pastYmd} 로 바꿔 표본 ${picks.length}개를 받는다…`);
      let changed = 0, same = 0, failed = 0;
      for (const f of picks) {
        const nowBody = found.body.split(seed.code).join(f.code);
        let pastBody = nowBody;
        for (const t of dateTokens) pastBody = pastBody.split(t).join(pastYmd);
        try {
          const a = readAum(await post(nowBody));
          const b = readAum(await post(pastBody));
          const rec = { code: f.code, name: f.name, ours: Number(f.aum), now: a, past: b };
          if (a != null && b != null) {
            rec.diff = b === a ? 0 : a - b;
            if (a === b) same += 1; else changed += 1;
          } else failed += 1;
          out.funds.push(rec);
          say(`  ${f.code} 오늘 ${a} · ${pastYmd} ${b}` +
              (a != null && b != null ? (a === b ? ' — 같다' : ` — 다르다 (${a - b})`) : ' — 못 읽음'));
        } catch (e) {
          failed += 1;
          out.funds.push({ code: f.code, error: String(e.message || e).slice(0, 80) });
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      out.counts = { changed, same, failed, total: picks.length };
      if (changed >= Math.ceil(picks.length * 0.5)) {
        out.verdict = `됨 — 표본 ${picks.length}개 중 ${changed}개가 기준일자에 따라 값이 ` +
                      '달라진다. 과거 설정원본을 소급해서 받을 수 있다. ' +
                      '다음 할 일: 3,196개 × 필요한 날짜만큼 부르는 비용을 재고 수집기를 만든다.';
      } else if (same >= Math.ceil(picks.length * 0.5)) {
        out.verdict = `막힘 — 표본 ${picks.length}개 중 ${same}개가 기준일자를 바꿔도 ` +
                      '같은 값이다. 파라미터는 있으나 무시된다. 소급은 못 한다 — ' +
                      '오늘부터 쌓는 수밖에 없다.';
      } else {
        out.verdict = `판정 못 함 — 성공 ${changed + same}, 실패 ${failed}. 표본을 늘려 다시 본다.`;
      }
      say(out.verdict);
    }
  }
}

// ── 기록 ────────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile('tools/discovery/fund_kofia_flow.json', JSON.stringify(out, null, 2));

const md = [
  '# 탐침 — 금투협에서 과거 설정원본을 받을 수 있는가',
  '',
  `탐침 시각: ${out.at}`,
  '',
  `**판정: ${out.verdict || '(없음)'}**`,
  '',
  '자금유입은 유입액 필드가 아니라 **설정원본의 차이**로 낸다. 설정원본은',
  '좌수 × 1,000 이라 수익률로 움직이지 않는다. 3개월 전 설정원본만 있으면 된다.',
  '',
  '태그는 이름으로 찾지 않고 **우리가 아는 오늘 값과 맞는지로** 찾았다.',
  '',
  '## 과정',
  '',
  ...out.steps.map((s) => `- ${s}`),
  '',
  ...(out.funds.length ? [
    '## 표본',
    '',
    '| 표준코드 | 우리 값 | 오늘 | 3개월 전 | 차이 |',
    '|---|---:|---:|---:|---:|',
    ...out.funds.map((f) => (f.error
      ? `| ${f.code} | | | | ${f.error} |`
      : `| ${f.code} | ${f.ours ?? ''} | ${f.now ?? ''} | ${f.past ?? ''} | ${f.diff ?? ''} |`)),
    '',
  ] : []),
  '원본 응답과 본문은 `fund_kofia_flow.json` 에 있다.',
  '',
].join('\n');
await writeFile('tools/discovery/fund_kofia_flow.md', md);
console.log('\n[probe] tools/discovery/fund_kofia_flow.{md,json} 에 적었다');
