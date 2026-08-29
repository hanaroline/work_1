#!/usr/bin/env node
/**
 * 펀드 탐색 12차 — 업종구성의 모양을 눈으로 본다.
 *
 *   node scripts/probe_fund_sectors.mjs
 *   -> tools/discovery/fund_sectors.{json,md}
 *
 * 11차에서 `/fund-allocation` 안에 `allocationsSectors` 라는 열쇠가 있다는
 * 것까지는 봤다. 그런데 그때 남긴 것은 **열쇠 이름 목록뿐이고 본문은
 * 잘려 있었다.** 그 상태로 수집기에 이렇게 적었다.
 *
 *     sectors: shapeAssets(fa?.allocationsSectors),
 *
 * 자산구성과 같은 모양이겠거니 하고 **짐작한 것이다.** 결과는 3,196개 중
 * 0개. 짐작이 틀렸다. 그런데 `shapeAssets` 는 모양이 안 맞으면 조용히
 * null 을 돌려주므로 수집 로그에도 아무 말이 없었다 — 없는 것을 없다고
 * 알려 주지 않는 자리를 또 만든 셈이다.
 *
 * 이번에는 짐작하지 않는다. **본문을 통째로 찍어 놓고 모양을 읽는다.**
 *
 * 가릴 것:
 *   1. `allocationsSectors` 의 실제 모양 (배열인가, `{result:[...]}` 인가,
 *      항목의 이름 열쇠는 무엇인가)
 *   2. 그 비중의 분모 — 합이 100 근처인가, 자산구성처럼 부풀어 있는가
 *   3. 업종이 있는 펀드가 얼마나 되는가 (주식형만인가)
 *
 * 2번을 반드시 함께 본다. 자산구성 비중은 전수 감사에서 **분모를 모른다**는
 * 결론이 났다(3,106개 중 합이 100 근처인 것은 21.9%뿐). 업종구성도 같은
 * 처지라면 모양을 알아내도 화면에 실을 수 없다. 뜻을 모르는 숫자를 싣느니
 * 빈칸이 낫다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

import { getJson, mapLimit } from './etf_lib.mjs';

const OUT_JSON = 'tools/discovery/fund_sectors.json';
const OUT_MD = 'tools/discovery/fund_sectors.md';
const API = 'https://stock.naver.com/api/fund/funds';
const headers = { Referer: 'https://stock.naver.com/domestic/fund' };

const out = { at: new Date().toISOString(), raw: [], shapes: {}, sums: [], notes: [] };

/** 12차 1회차는 표본 3개에 그쳤다. 목록 항목에는 `parentPeerGroupName` 이
 *  없는데(유형은 상세인 left-panel 에 있다) 그것으로 묶으려 했으니 전부
 *  한 칸에 몰렸고, 칸마다 3개씩만 뽑는 규칙에 걸려 3개가 됐다. 게다가 그
 *  3개는 `availability.sectors` 가 **false** 인 펀드였다 — 업종이 원래
 *  없는 펀드를 들여다보고 "업종구성이 안 온다" 고 적을 뻔했다.
 *
 *  이번엔 유형으로 묶지 않는다. 넓게 훑어 `availability.sectors` 가 true 인
 *  펀드만 골라 본다. 그것이 업종을 준다고 원천이 말한 펀드다. */
const list = [];
for (let page = 1; page <= 12; page += 1) {
  const r = await getJson(`${API}?page=${page}&size=20`, { headers }).catch(() => null);
  for (const it of (r?.funds || [])) list.push(it);
}
out.notes.push(`목록 ${list.length}개 확보`);

const avails = await mapLimit(list, 4, async (it) => {
  const cp = await getJson(`${API}/${it.fundCode}/chart-price-panel`, { headers }).catch(() => null);
  return { code: it.fundCode, name: it.fundName, avail: cp?.availability ?? null,
           basePrice: cp?.basePrice ?? it.basePrice ?? null };
});
const flat = avails.map((r) => r?.value ?? r).filter(Boolean);
const withSec = flat.filter((r) => r.avail?.sectors === true);
const noSec = flat.filter((r) => r.avail?.sectors === false);
out.notes.push(`availability.sectors=true ${withSec.length}개 · false ${noSec.length}개 / ${flat.length}개`);

// sectors 가 true 라는 것만 본다. false 인 펀드는 애초에 업종이 없다.
const picks = withSec.slice(0, 40);
if (!picks.length) out.notes.push('sectors=true 인 펀드를 못 찾았다. 표본을 넓혀야 한다.');

const res = await mapLimit(picks, 4, async (p) => {
  const fa = await getJson(`${API}/${p.fundCode ?? p.code}/fund-allocation`, { headers }).catch(() => null);
  return { code: p.code, type: p.avail?.sectors === true ? 'sectors:true' : 'sectors:false',
           name: p.name, fa, avail: p.avail, basePrice: p.basePrice };
});

for (const r of res) {
  const v = r?.value ?? r;
  if (!v?.fa) continue;
  const sec = v.fa.allocationsSectors;
  // 모양을 있는 그대로 적는다. 열쇠 이름을 정렬해 세면 몇 가지 모양인지 보인다.
  const shape = sec == null ? 'null'
    : Array.isArray(sec) ? `array<${sec.length}>:${Object.keys(sec[0] || {}).sort().join(',')}`
    : typeof sec === 'object' ? `object:${Object.keys(sec).sort().join(',')}`
    : typeof sec;
  out.shapes[shape] = (out.shapes[shape] || 0) + 1;

  // 앞 다섯 개는 본문을 통째로 남긴다. 짐작하지 않으려면 실물이 있어야 한다.
  if (out.raw.length < 5) {
    out.raw.push({ code: v.code, type: v.type, name: v.name, avail: v.avail,
                   basePrice: v.basePrice,
                   allocationsSectors: sec,
                   allocationsAssetsKeys: v.fa.allocationsAssets == null ? null
                     : Object.keys(v.fa.allocationsAssets) });
  }

  // 분모를 본다. 어떤 모양이든 숫자 비중을 긁어 합을 낸다.
  const rows = Array.isArray(sec) ? sec
    : Array.isArray(sec?.result) ? sec.result
    : Array.isArray(sec?.sectors) ? sec.sectors : null;
  if (rows?.length) {
    const sum = rows.reduce((s, x) => {
      const w = Number(x.weight ?? x.ratio ?? x.rate);
      return s + (Number.isFinite(w) ? w : 0);
    }, 0);
    const bp = Number(v.basePrice);
    out.sums.push({ code: v.code, type: v.type, n: rows.length, sum,
                    basePrice: Number.isFinite(bp) ? bp : null,
                    perMil: Number.isFinite(bp) && bp > 0 ? sum / (bp / 1000) : null });
  }
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 1));

const L = [];
L.push('# 펀드 12차 — 업종구성의 모양', '');
L.push(`표본 ${res.length}개. 11차에서 열쇠 이름만 보고 모양을 짐작해 수집기에`);
L.push('넣었다가 3,196개 전부 빈칸이 나왔다. 이번엔 본문을 찍어 놓고 읽는다.', '');
L.push('## 모양별 개수', '', '| 모양 | 개수 |', '|---|---:|');
for (const [k, n] of Object.entries(out.shapes).sort((a, b) => b[1] - a[1])) L.push(`| \`${k}\` | ${n} |`);
L.push('');
L.push('## 비중의 분모', '');
if (!out.sums.length) {
  L.push('업종 비중을 읽어 낸 펀드가 없다. 위 모양 표를 보고 다시 판단해야 한다.');
} else {
  L.push('합이 100 근처면 순자산 대비고, 기준가에 비례해 부풀어 있으면 설정원본 대비다.');
  L.push('둘 다 아니면 **뜻을 모르는 값이므로 싣지 않는다.**', '');
  L.push('| 코드 | 유형 | 항목수 | 합 | 기준가 | 합÷(기준가/1000) |', '|---|---|---:|---:|---:|---:|');
  for (const s of out.sums.slice(0, 25)) {
    L.push(`| ${s.code} | ${s.type} | ${s.n} | ${s.sum.toFixed(2)} | ${s.basePrice ?? '-'} | ${s.perMil == null ? '-' : s.perMil.toFixed(1)} |`);
  }
  const near100 = out.sums.filter((s) => s.sum >= 90 && s.sum <= 110).length;
  const nearMil = out.sums.filter((s) => s.perMil != null && s.perMil >= 90 && s.perMil <= 110).length;
  L.push('');
  L.push(`합이 90~110: ${near100}/${out.sums.length} · 기준가로 나눈 값이 90~110: ${nearMil}/${out.sums.length}`);
}
L.push('');
L.push('## 본문 (앞 다섯)', '', '```json', JSON.stringify(out.raw, null, 1).slice(0, 6000), '```');
await writeFile(OUT_MD, L.join('\n'));

console.log(`모양: ${JSON.stringify(out.shapes)}`);
console.log(`비중 읽힌 펀드: ${out.sums.length}`);
