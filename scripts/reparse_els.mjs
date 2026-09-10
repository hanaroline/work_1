#!/usr/bin/env node
/**
 * 이미 수집된 data/els.js 의 평가 일정을 다시 계산한다.
 *
 * 배리어 시퀀스는 홈페이지 원문 표기(structureDesc)에서 뽑는데, 파서가 고쳐지면
 * 다음 주 수집 전까지는 옛 파싱 결과가 그대로 남는다. 이 스크립트는 저장된
 * structureDesc 를 같은 파서로 다시 읽어 schedule 만 갱신한다.
 * 수집기(collect_els.mjs)와 파서를 공유하므로 규칙이 갈라지지 않는다.
 *
 * 사용: node scripts/reparse_els.mjs
 */

import { writeFile } from 'node:fs/promises';
import { parseStructure, readData, serializeData } from './collect_els.mjs';

const OUT_DATA = 'data/els.js';

const { header, data } = await readData(OUT_DATA);

let changed = 0;
for (const p of data.products) {
  const { barriers, lizard } = parseStructure(p.structureDesc);
  if (!barriers || !barriers.length) continue;

  const step = p.maturityMonths / barriers.length;
  const schedule = barriers.map((barrier, i) => ({
    months: Math.round(step * (i + 1)),
    barrier,
    ...(lizard && lizard.index === i
      ? { lizard: lizard.barrier, lizardRate: lizard.rate ?? null }
      : {}),
  }));

  if (JSON.stringify(schedule) === JSON.stringify(p.schedule)) continue;
  console.log(
    `  ${p.name}: ${p.schedule.length}회차 → ${schedule.length}회차` +
    (lizard ? ` (리자드 ${lizard.barrier}%` + (lizard.rate ? ` / 연 ${lizard.rate}%` : '') + ')' : '')
  );
  p.schedule = schedule;
  changed++;
}

if (!changed) {
  console.log('갱신할 항목이 없습니다.');
  process.exit(0);
}

await writeFile(OUT_DATA, header + 'window.ELS_DATA = ' + serializeData(data) + ';\n');
console.log(`${OUT_DATA} 갱신 완료 — ${changed}건`);
