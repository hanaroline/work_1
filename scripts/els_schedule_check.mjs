#!/usr/bin/env node
// 자동 예약이 "오늘 돌릴 날인가"를 판정한다.
//
// 예약 슬롯은 매주 월·수·금 아침이다. 슬롯 날이 비영업일(주말·휴장일)이면
// 그 슬롯은 "다음 영업일"로 밀린다. 밀린 자리를 기억해 두는 상태 파일은 쓰지
// 않는다 — 달력만으로 계산되기 때문이다. 오늘이 영업일이고, 최근 슬롯 중
// "그 슬롯을 미뤘을 때 도착하는 첫 영업일"이 오늘인 것이 하나라도 있으면 돌린다.
//
// 예) 월요일이 추석이고 화요일이 영업일 → 월 슬롯이 화요일로 밀려 화요일에 돈다.
//     월·화가 모두 휴장이고 수요일이 영업일 → 월 슬롯과 수 슬롯이 같은 날로
//     겹치므로 수요일에 한 번만 돈다.
//
// 사용법:
//   node scripts/els_schedule_check.mjs            # 오늘(KST) 기준
//   node scripts/els_schedule_check.mjs 2026-09-28 # 특정 날짜로 시험
//
// 종료코드는 항상 0. 판정은 마지막 줄 `DECISION=RUN` / `DECISION=SKIP` 으로 읽는다.

import { readFile } from 'node:fs/promises';

const SLOT_DOW = [1, 3, 5]; // 월·수·금
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const LOOKBACK = 14; // 최장 연휴보다 넉넉하게

const cal = JSON.parse(await readFile(new URL('../data/kr-holidays.json', import.meta.url), 'utf8'));
const HOLIDAY = cal.days;
const YEARS = new Set(Object.keys(HOLIDAY).map((d) => d.slice(0, 4)));

/** 지금 시각의 KST 날짜(YYYY-MM-DD). 컨테이너 시간대가 UTC 여도 맞게 나온다. */
const kstToday = () => {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};

const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
const toIso = (d) => d.toISOString().slice(0, 10);
const shift = (iso, n) => toIso(new Date(toDate(iso).getTime() + n * 86400000));
const dow = (iso) => toDate(iso).getUTCDay();

const isWeekend = (iso) => dow(iso) === 0 || dow(iso) === 6;
const isHoliday = (iso) => Object.prototype.hasOwnProperty.call(HOLIDAY, iso);
const isBusinessDay = (iso) => !isWeekend(iso) && !isHoliday(iso);

/** 그 날 포함, 이후로 처음 오는 영업일. */
const nextBusinessDay = (iso) => {
  let d = iso;
  for (let i = 0; i < 30; i++) {
    if (isBusinessDay(d)) return d;
    d = shift(d, 1);
  }
  return null; // 30일 연속 휴장은 없다
};

const label = (iso) => `${iso}(${DOW[dow(iso)]})`;
const why = (iso) => (isHoliday(iso) ? HOLIDAY[iso] : isWeekend(iso) ? '주말' : null);

const today = process.argv[2] || kstToday();
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`날짜 형식이 잘못됐습니다: ${today}`);
  process.exit(2);
}

const lines = [];
lines.push(`오늘(KST): ${label(today)}`);

// 휴장일 표가 올해를 담고 있는지. 없으면 주말만 걸러지므로 알린다.
const year = today.slice(0, 4);
if (!YEARS.has(year)) {
  lines.push(
    `⚠ ${year}년 휴장일이 data/kr-holidays.json 에 없습니다. 주말만 걸러집니다 — 공휴일에도 돌 수 있으니 표를 갱신하세요.`
  );
} else if ((cal.provisional || []).includes(year)) {
  lines.push(`※ ${year}년 휴장일은 잠정값입니다. ${cal.provisionalNote || ''}`.trim());
}

if (!isBusinessDay(today)) {
  lines.push(`오늘은 비영업일입니다 — ${why(today)}. 다음 영업일 ${label(nextBusinessDay(today))}에 처리합니다.`);
  console.log(lines.join('\n'));
  console.log('DECISION=SKIP');
  process.exit(0);
}

// 최근 슬롯들을 훑어, 밀린 도착지가 오늘인 것을 찾는다.
const arriving = [];
for (let back = LOOKBACK; back >= 0; back--) {
  const slot = shift(today, -back);
  if (!SLOT_DOW.includes(dow(slot))) continue;
  if (nextBusinessDay(slot) === today) arriving.push(slot);
}

if (arriving.length === 0) {
  const upcoming = (() => {
    for (let i = 1; i <= 10; i++) {
      const d = shift(today, i);
      if (SLOT_DOW.includes(dow(d)) && nextBusinessDay(d)) return nextBusinessDay(d);
    }
    return null;
  })();
  lines.push('오늘은 예약 슬롯(월·수·금)이 아닙니다.');
  if (upcoming) lines.push(`다음 실행 예정일: ${label(upcoming)}`);
  console.log(lines.join('\n'));
  console.log('DECISION=SKIP');
  process.exit(0);
}

for (const slot of arriving) {
  if (slot === today) lines.push(`정규 슬롯: ${label(slot)} — 영업일이므로 예정대로 실행합니다.`);
  else lines.push(`이월 슬롯: ${label(slot)}은 비영업일(${why(slot)})이라 오늘로 미뤄졌습니다.`);
}
if (arriving.length > 1) lines.push(`슬롯 ${arriving.length}건이 오늘로 겹쳤습니다 — 한 번만 실행합니다.`);

console.log(lines.join('\n'));
console.log('DECISION=RUN');
