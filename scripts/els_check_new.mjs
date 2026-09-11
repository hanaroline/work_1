#!/usr/bin/env node
// 자동 예약이 "새 회차가 있나"를 판정한다.
//
// 판단을 사람(모델)의 눈대중에 맡기지 않는다. 2026-09-11 아침 예약이 전날
// data/els.js 를 그대로 읽고 "새 회차 없음" 으로 끝낸 적이 있다 — 수집을 걸지
// 않았으니 어제 목록을 본 것이고, 성공으로 기록되지만 실제로는 아무것도 안 본 것이다.
// 그래서 신선도를 먼저 확인하고, 낡았으면 비교 자체를 거부한다.
//
//   STATUS=STALE  data/els.js 가 오늘(KST) 것이 아니다. 수집부터 걸고 다시 부를 것.
//   STATUS=NEW    아직 다루지 않은 회차가 있다. NEW_NOS 에 나열된다.
//   STATUS=NONE   목록은 오늘 것이고, 새 회차는 없다.
//
// 사용법:
//   node scripts/els_check_new.mjs          # 판정만
//   node scripts/els_check_new.mjs --log    # docs/els-autorun-log.md 에 한 줄 남긴다
//
// 종료코드는 항상 0. STATUS 줄로 읽는다.

import { readFile, appendFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, ROOT), 'utf8');

const kstNow = () => new Date(Date.now() + 9 * 3600 * 1000);
const kstDay = (d) => d.toISOString().slice(0, 10);
const kstStamp = (d) => `${kstDay(d)} ${d.toISOString().slice(11, 16)}`;

// data/els.js 는 window.ELS_DATA 에 붙는 스크립트다.
const w = {};
new Function('window', await read('data/els.js'))(w);
const data = w.ELS_DATA;

const updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
const collectedKst = updatedAt ? new Date(updatedAt.getTime() + 9 * 3600 * 1000) : null;
const now = kstNow();

// 목록에 실린 회차. 이름 끝의 5자리가 회차, 뒤에 e 가 붙으면 온라인 전용이다.
const listed = new Set();
const online = new Set();
for (const p of data.products || []) {
  const m = String(p.name).match(/(\d{5})(e?)\s*$/);
  if (!m) continue;
  listed.add(Number(m[1]));
  if (m[2]) online.add(Number(m[1]));
}

// 이미 제안서로 다룬 회차 — 공시 원문을 파싱해 둔 것이 곧 다룬 것이다.
const parsed = JSON.parse(await read('tools/discovery/prospectus_parsed.json'));
const covered = new Set();
for (const batch of Object.values(parsed)) {
  for (const it of batch.items || []) if (it.no) covered.add(Number(it.no));
}

const fresh = collectedKst != null && kstDay(collectedKst) === kstDay(now);
const newNos = [...listed].filter((n) => !covered.has(n)).sort((a, b) => a - b);

const out = [];
out.push(`지금(KST): ${kstStamp(now)}`);
out.push(
  `목록 수집 시각: ${collectedKst ? kstStamp(collectedKst) : '없음'} (source=${data.source ?? '?'})`
);
out.push(`목록에 실린 회차 ${listed.size}건 · 이미 다룬 회차 ${covered.size}건`);

let status;
if (!fresh) {
  status = 'STALE';
  out.push(
    '⚠ 오늘 수집한 목록이 아닙니다. 이 상태의 비교는 뜻이 없습니다 — 먼저 els-weekly.yml 로 수집을 걸고 결과를 받은 뒤 다시 부르세요.'
  );
} else if (newNos.length) {
  status = 'NEW';
  out.push(`새 회차 ${newNos.length}건: ${newNos.join(' ')}`);
  const on = newNos.filter((n) => online.has(n));
  out.push(on.length ? `그중 온라인 전용: ${on.join(' ')}` : '그중 온라인 전용: 없음');
} else {
  status = 'NONE';
  out.push('새 회차 없음 — 목록의 회차가 모두 이미 다룬 것입니다.');
}

console.log(out.join('\n'));
if (status === 'NEW') console.log(`NEW_NOS=${newNos.join(',')}`);
console.log(`STATUS=${status}`);

if (process.argv.includes('--log')) {
  const detail =
    status === 'NEW' ? `새 회차 ${newNos.length}건 (${newNos.join(' ')})`
    : status === 'NONE' ? '새 회차 없음'
    : `목록이 낡음 (수집 ${collectedKst ? kstStamp(collectedKst) : '없음'})`;
  const line = `| ${kstStamp(now)} | ${status} | 목록 ${listed.size}건 | ${detail} |\n`;
  await appendFile(new URL('docs/els-autorun-log.md', ROOT), line);
  console.log('docs/els-autorun-log.md 에 기록했습니다.');
}
