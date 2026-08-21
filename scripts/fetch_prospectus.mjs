#!/usr/bin/env node
/**
 * 공시 원문(일괄신고추가서류)에서 회차별 조건·발행사 수익률 모의실험·이론가 변수를 뽑아
 * tools/discovery/ 에 남긴다.
 *
 * 페이지의 과거 시뮬레이션은 우리가 종가로 계산한 값이라 발행사 수치와 다르다.
 * 설명서에는 2003년부터의 롤링 백테스트와 이론가 산출에 쓴 변동성·상관계수가 있어,
 * 그대로 옮겨오면 세일즈 자료로 방어 가능한 숫자가 된다.
 *
 * 개발 컨테이너에서는 KIND·DART 가 egress 차단이라 러너에서만 돈다.
 */
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36';
const OUT = 'tools/discovery';
const SOURCES = [
  { id: '20260605001024', label: '2026-06-05 일괄신고추가서류 (제37821~37839회)',
    url: 'https://kind.krx.co.kr/external/2026/06/05/000396/20260605001024/10131.htm' },
  { id: '20260730001210', label: '2026-07-30 투자설명서',
    url: 'https://kind.krx.co.kr/external/2026/07/30/000510/20260730001210/10603.htm' },
];

const decode = (buf) => {
  const probe = buf.subarray(0, 2000).toString('latin1').toLowerCase();
  return new TextDecoder(/euc-kr|ks_c_5601/.test(probe) ? 'euc-kr' : 'utf-8').decode(buf);
};

/** 표 구조를 살려 텍스트로. 셀은 \t, 행은 \n. */
const toText = (html) => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/tr>/gi, '\n').replace(/<\/(p|div|h\d|table)>/gi, '\n\n')
  .replace(/<t[dh][^>]*>/gi, '\t')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]*\n/g, '\n').replace(/\n{3,}/g, '\n\n');

/** needle 이 나오는 구간을 앞뒤로 잘라 모은다. */
const slices = (text, needle, before, after, max) => {
  const found = [];
  let from = 0;
  while (found.length < max) {
    const i = text.indexOf(needle, from);
    if (i < 0) break;
    found.push(text.slice(Math.max(0, i - before), i + after));
    from = i + after;
  }
  return found;
};

await mkdir(OUT, { recursive: true });

for (const src of SOURCES) {
  console.log(`\n### ${src.label}`);
  let text;
  try {
    const r = await fetch(src.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(90000) });
    const buf = Buffer.from(await r.arrayBuffer());
    console.log(`  HTTP ${r.status} / ${(buf.length / 1024 / 1024).toFixed(2)}MB`);
    if (!r.ok) continue;
    text = toText(decode(buf));
  } catch (e) {
    console.log(`  실패: ${e.name} ${e.message}`);
    continue;
  }

  const series = [...new Set(text.match(/제\s?\d{4,5}\s?회/g) || [])];
  const extract = {
    source: src.url,
    fetchedAt: new Date().toISOString(),
    chars: text.length,
    seriesMentioned: series.slice(0, 60),
    // 발행사 롤링 백테스트
    simulation: slices(text, '모의실험', 400, 3000, 4),
    // 이론가 산출 변수
    volatility: slices(text, '변동성', 300, 1500, 3),
    correlation: slices(text, '상관계수', 300, 1500, 3),
    fairValue: slices(text, '공정가액', 300, 1200, 3),
    // 회차별 조건표
    terms: slices(text, '자동조기상환', 500, 2000, 3),
    earlyRedeem: slices(text, '중도상환', 300, 1500, 2),
  };
  await writeFile(`${OUT}/prospectus_${src.id}.json`, JSON.stringify(extract, null, 2));

  console.log(`  텍스트 ${text.length}자 / 회차표기 ${series.length}종: ${series.slice(0, 25).join(' ')}`);
  for (const [k, v] of Object.entries(extract)) {
    if (Array.isArray(v) && k !== 'seriesMentioned') console.log(`  ${k}: ${v.length}건`);
  }
}
