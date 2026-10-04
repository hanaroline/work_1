#!/usr/bin/env node
/**
 * 펀드 탐색 10차 — 제로인(FUND DOCTOR)은 우리에게 **세 번째 출처**다.
 *
 *   node scripts/probe_fund_funddoctor.mjs
 *   -> tools/discovery/fund_funddoctor.{json,md} + fund_funddoctor_*.png
 *
 * 사용자가 준 주소:
 *   funddoctor.co.kr/afn/fund/fprofile2.jsp?fund_cd=KR5207553060&gijun_ymd=20260828
 *
 * 여기가 값진 이유는 **네이버가 아니라는 것**이다. 지금 우리 자료의 수익률·
 * 보유종목·위험지표는 전부 네이버 하나에 기대고 있고, 금투협은 그 항목들을
 * 요약화면에 싣지 않아 대조가 안 됐다. 재검증 보고에 "2차 출처 단독 근거" 로
 * 적어 남긴 자리가 그것이다. 제로인이 그 자리를 메울 수 있는지 본다.
 *
 * 그리고 이 주소도 **클래스 코드**다(KR5207553060 = 신탁1 ClassA). 우리
 * 자료에는 부모 KR5207553052 아래 클래스로만 있다. 사람이 손에 든 코드는
 * 클래스 코드라는 것이 두 번째로 확인된 셈이다.
 *
 * **날짜를 맞추지 않으면 헛대조가 된다.** 사용자 화면은 gijun_ymd=20260828,
 * 우리 자료는 2026-08-27 이다. 그 하루에 이 펀드는 +1.63% 움직였다. 날짜를
 * 안 맞추고 견주면 멀쩡한 값이 3%p 어긋난 것으로 잡힌다 — 기준일이 다른 두
 * 값을 "틀렸다" 고 말할 수 없다. 그래서 gijun_ymd 를 우리 기준일로 맞춰
 * 부르고, 맞춘 것과 안 맞춘 것을 **둘 다** 적는다.
 *
 * 가릴 것:
 *   1. robots.txt 가 이 경로를 막는가 (막으면 여기서 멈춘다)
 *   2. gijun_ymd 를 우리 기준일로 주면 그 날짜로 답하는가
 *   3. 화면의 숫자를 파싱할 수 있는가 (구조를 모르니 실물을 먼저 찍는다)
 *   4. 맞춘 날짜에서 우리 값과 얼마나 어긋나는가
 *   5. 제로인등급(별점)은 네이버·금투협 어디에도 없다. 받을 수 있는가.
 *
 * 이 회차는 **수집기가 아니라 조사**다. 여기서 되는 것이 확인돼야 그 다음을
 * 정한다. 표본은 12개로 좁힌다 — 남의 서버를 조사 목적으로 두드리는 것이므로
 * 필요한 최소만 부른다.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_funddoctor.json';
const OUT_MD = 'tools/discovery/fund_funddoctor.md';
const BASE = 'https://funddoctor.co.kr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const out = { at: new Date().toISOString(), robots: null, rows: [], dumps: [], notes: [] };

// ─────────────── 우리 자료에서 표본을 고른다 ───────────────
const s = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
const BY_CLASS = new Map();
for (const f of DATA.funds) {
  for (const c of (f.classes || [])) BY_CLASS.set(c.code, { parent: f, cls: c });
}

// 사용자가 준 둘을 반드시 넣는다. 나머지는 유형이 갈리게 고른다 —
// 한 유형만 보면 그 유형에서만 맞는 규칙을 전체로 착각한다.
const PICKED = ['KR5207553060', 'K55207BJ1791'];
{
  const perType = new Map();
  for (const f of DATA.funds) {
    if (!f.classes?.length || !f.ret) continue;
    const t = f.type || '기타';
    if ((perType.get(t) || 0) >= 2) continue;
    const c = f.classes.find((x) => x.ret && x.ret['1y'] != null);
    if (!c || PICKED.includes(c.code)) continue;
    perType.set(t, (perType.get(t) || 0) + 1);
    PICKED.push(c.code);
    if (PICKED.length >= 12) break;
  }
}

// ─────────────── 1번: robots.txt ───────────────
try {
  const r = await fetch(`${BASE}/robots.txt`, { headers: { 'User-Agent': UA } });
  out.robots = { status: r.status, body: (await r.text()).slice(0, 2000) };
} catch (e) {
  out.robots = { error: String(e).slice(0, 200) };
}
// 막혀 있으면 더 두드리지 않는다. 조사여도 남의 규칙이 먼저다.
const blocked = /Disallow:\s*\/\s*$/mi.test(out.robots?.body || '') ||
                /Disallow:\s*\/afn/mi.test(out.robots?.body || '');
out.notes.push({ 물음: 'robots 가 막는가', 막힘: blocked, 근거: (out.robots?.body || '').slice(0, 300) });

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1400, height: 1600 } });

/** 화면 하나를 열고 글자를 통째로 가져온다. 구조를 모르니 우리가 정하지 않는다. */
async function grab(code, ymd) {
  const url = `${BASE}/afn/fund/fprofile2.jsp?fund_cd=${code}` + (ymd ? `&gijun_ymd=${ymd}` : '');
  const page = await ctx.newPage();
  const rec = { code, ymd: ymd || null, url };
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    rec.status = resp?.status() ?? null;
    rec.text = (await page.evaluate(() => document.body.innerText || ''))
      .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').slice(0, 6000);
  } catch (e) {
    rec.error = String(e).slice(0, 300);
  }
  await page.close();
  return rec;
}

if (!blocked) {
  // 우리 자료의 기준일. 이 날짜로 맞춰 부른다.
  const ourDay = (DATA.funds.find((f) => f.tradeDate)?.tradeDate || '').replace(/-/g, '');

  // 3번: 구조를 먼저 본다. 앞 둘은 글자를 통째로 남긴다.
  for (const code of PICKED.slice(0, 2)) {
    out.dumps.push(await grab(code, ourDay));
    out.dumps.push(await grab(code, null));   // 날짜를 안 주면 무엇이 오는가
  }

  /** 화면 글자에서 값을 읽는다. 못 읽으면 null 이다 — 0 이 아니다. */
  function parse(text) {
    if (!text) return null;
    const num = (re) => {
      const m = text.match(re);
      if (!m) return null;
      const v = Number(m[1].replace(/,/g, ''));
      return Number.isFinite(v) ? v : null;
    };
    return {
      기준일: (text.match(/기준일\s*:?\s*(\d{4})[.\-\s]*(\d{2})[.\-\s]*(\d{2})/) || [])
        .slice(1, 4).join('-') || null,
      펀드명: (text.match(/공모펀드\s*\n\s*(.+)/) || [])[1]?.trim() || null,
      기준가: num(/기준가\(KRW\)\s*\n?\s*([\d,]+\.?\d*)/),
      전일대비: num(/전일대비\s*\n?\s*[▲▼△▽+\-]?\s*([\d,]+\.?\d*)/),
      올해: num(/올해\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/),
      '1m': num(/1개월\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/),
      '3m': num(/3개월\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/),
      '1y': num(/(?:^|\n)\s*1년\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/m),
      '3y': num(/(?:^|\n)\s*3년\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/m),
      '5y': num(/(?:^|\n)\s*5년\s*\n?\s*(-?[\d,]+\.?\d*)\s*%/m),
      제로인등급있나: /제로인등급/.test(text),
    };
  }

  // 4번: 날짜를 맞춰 우리 값과 견준다.
  for (const code of PICKED) {
    const mine = BY_CLASS.get(code) || null;
    const day = (mine?.parent?.tradeDate || '').replace(/-/g, '') || ourDay;
    const got = await grab(code, day);
    const parsed = parse(got.text);
    const row = {
      code,
      우리부모: mine?.parent?.code ?? null,
      우리이름: mine?.cls?.name ?? null,
      우리기준일: mine?.parent?.tradeDate ?? null,
      부른날짜: day,
      status: got.status ?? null,
      제로인기준일: parsed?.기준일 ?? null,
      제로인: parsed,
      우리클래스수익률: mine?.cls?.ret ?? null,
      우리부모기준가: mine?.parent?.basePrice ?? null,
      차이: null,
    };
    if (parsed && mine?.cls?.ret) {
      const d = {};
      for (const k of ['1m', '3m', '1y', '3y']) {
        const a = parsed[k], b2 = mine.cls.ret[k];
        // 한쪽이 없으면 차이를 0 이라고 하지 않는다. 모르는 것은 null 이다.
        d[k] = (a == null || b2 == null) ? null : +(a - b2).toFixed(4);
      }
      row.차이 = d;
    }
    out.rows.push(row);
  }
}

await browser.close();

// ─────────────── 적기 ───────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = [];
md.push('# 펀드 탐색 10차 — 제로인(FUND DOCTOR)이 세 번째 출처가 되는가', '');
md.push(`조사 시각: ${out.at}`, '');
md.push('## 1. robots.txt', '', `막는가: **${blocked}**`, '', '```',
        (out.robots?.body || out.robots?.error || '').slice(0, 1200), '```', '');
if (blocked) {
  md.push('robots 가 막는다. 더 두드리지 않는다.', '');
} else {
  md.push('## 4. 날짜를 맞춘 뒤 우리 값과의 차이', '');
  md.push('| 클래스코드 | 우리기준일 | 제로인기준일 | 1개월 | 3개월 | 1년 | 3년 |',
          '|---|---|---|---:|---:|---:|---:|');
  for (const r of out.rows) {
    const d = r.차이 || {};
    const f = (v) => (v == null ? '–' : (v > 0 ? '+' : '') + v);
    md.push(`| ${r.code} | ${r.우리기준일 ?? '–'} | ${r.제로인기준일 ?? '–'} | ` +
            `${f(d['1m'])} | ${f(d['3m'])} | ${f(d['1y'])} | ${f(d['3y'])} |`);
  }
  md.push('');
  md.push('## 3. 화면 실물 (파서를 짜기 전에 먼저 본다)', '');
  for (const d of out.dumps) {
    md.push(`### ${d.code} · gijun_ymd=${d.ymd ?? '(안 줌)'} · HTTP ${d.status ?? d.error}`, '',
            '```', (d.text || '').slice(0, 3000), '```', '');
  }
}
await writeFile(OUT_MD, md.join('\n'));

console.log(`[10차] robots막힘=${blocked} · 표본 ${out.rows.length}개 · 덤프 ${out.dumps.length}개`);
