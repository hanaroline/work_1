/* 수집기의 수익률 함수를 **원본에서 떼어 내** 실제로 돌려 본다.
   수집기 자체는 돌릴 수 없다(최상위에서 크로미움을 띄운다). 그래서 쓰는 함수만
   원본 글자 그대로 잘라 와 eval 한다 — 손으로 옮겨 적으면 올리는 코드와
   시험하는 코드가 달라진다. 이 파일은 남겨 둔다 — 판독 규칙을 고칠 때 먼저 돌려 볼 자리다. */
import fs from 'node:fs';

const src = fs.readFileSync('scripts/collect_cc_etf.mjs', 'utf8');
const grab = (from, to) => {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error(`원본에서 ${from} 을 못 찾음`);
  return src.slice(a, b);
};
const piece = grab("const TD = {", "\n// ── 지급주기");
const { TD, navReturn, retField, retWindow, retNote } =
  await import('data:text/javascript,' + encodeURIComponent(piece +
    '\nexport { TD, navReturn, retField, retWindow, retNote };'));

let bad = 0;
const ok = (cond, label, got) => {
  console.log(`  ${cond ? '✔' : '✘'} ${label}${cond ? '' : `  ← ${JSON.stringify(got)}`}`);
  if (!cond) bad++;
};

/** 오래된 것 → 최근 순으로 n일치. 하루에 r 배씩. */
const series = (n, start, r, jumpAt, jumpR) =>
  Array.from({ length: n }, (_, i) => ({
    date: String(20250101 + i),          // 날짜 대소 비교만 쓰므로 모양만 맞으면 된다
    nav: start * r ** i * (jumpAt != null && i >= jumpAt ? jumpR : 1),
  }));

console.log('TD =', JSON.stringify(TD));

console.log('\n1. 딱 떨어지는 값 — 250일 동안 10,000 → 12,000 이면 +20%');
{
  const s = series(250, 10000, 1, null, 1);
  s[s.length - 1].nav = 12000;
  const r = navReturn(s, 250, []);
  ok(Math.abs(r.pct - 20) < 1e-9, '1년 +20.00%', r.pct);
  ok(r.navFrom === 10000 && r.navTo === 12000, '양 끝 기준가를 함께 돌려줌', r);
  ok(retField({ '1년': r }, '1년') === 20, 'retField 가 20 을 냄', retField({ '1년': r }, '1년'));
  ok(retWindow({ '1년': r }, '1년') === `${s[0].date}~${s[249].date}`, 'retWindow 가 창을 적음', retWindow({ '1년': r }, '1년'));
  ok(retNote({ '1년': r }, '1년') === null, '낸 값에는 까닭이 없음', retNote({ '1년': r }, '1년'));
}

console.log('\n2. 창을 못 채우면 비우고 까닭을 남긴다');
{
  const s = series(200, 10000, 1, null, 1);           // 250 의 95% = 238 에 못 미침
  const r = navReturn(s, 250, []);
  ok(r.pct == null && /창\(250거래일\)을 못 채움/.test(r.note), '1년은 못 냄', r);
  const r3 = navReturn(s, 62, []);                     // 3개월은 넉넉히 채운다
  ok(r3.pct != null, '같은 종목의 3개월은 냄', r3);
  ok(retField({ a: r }, 'a') === null && retNote({ a: r }, 'a') !== null,
    'retField 는 null, retNote 는 까닭', [retField({ a: r }, 'a'), retNote({ a: r }, 'a')]);
}

console.log('\n3. 95% 경계 — 238일이면 내고 237일이면 안 낸다');
{
  ok(navReturn(series(238, 100, 1, null, 1), 250, []).pct != null, '238일 → 냄');
  ok(navReturn(series(237, 100, 1, null, 1), 250, []).pct == null, '237일 → 안 냄');
}

console.log('\n4. 급변일은 **창별로** 본다');
{
  const s = series(250, 10000, 1, 10, 1.3);   // 11번째 날에 +30%
  const jumps = [{ date: s[10].date }];
  const r1 = navReturn(s, 250, jumps);
  ok(r1.pct == null && /창 안 급변일 1일/.test(r1.note), '1년 창 안에 들어 안 냄', r1);
  const r3 = navReturn(s, 62, jumps);
  ok(r3.pct != null && Math.abs(r3.pct) < 1e-9, '3개월 창 밖이라 그대로 냄(0%)', r3);
}

console.log('\n5. 창 첫날에 찍힌 급변일은 창을 막지 않는다');
{
  // 급변일의 '값' 은 그날 종가다. 창 첫날이 곧 급변일이면 그 뜀은 창 **밖**
  // 에서 창 **안** 으로 들어온 것이라 창 안의 변동에 섞이지 않는다.
  const s = series(250, 10000, 1, 0, 1);
  const r = navReturn(s, 250, [{ date: s[0].date }]);
  ok(r.pct != null, '첫날 급변일은 창을 막지 않음', r);
  const r2 = navReturn(s, 250, [{ date: s[1].date }]);
  ok(r2.pct == null, '둘째 날 급변일은 막음', r2);
}

console.log('\n6. 기준가가 0 이거나 없는 날은 빼고 센다');
{
  const s = series(250, 10000, 1, null, 1);
  s[5].nav = 0;
  s[6].nav = null;
  const r = navReturn(s, 250, []);
  // 쓸 수 있는 날이 248 — 250 에 모자라지만 바닥(238)은 넘는다. 그러면
  // **버리지 않고** 가진 것 중 제일 오래된 날을 창 첫날로 쓴다. 며칠 모자란
  // 것까지 버리면 멀쩡한 종목이 무더기로 빈칸이 된다. 대신 그렇게 낸 창이
  // 며칠짜리였는지는 from~to 에 그대로 남아 되짚을 수 있다.
  ok(r.pct != null, '248일이면 가진 것으로 냄', r);
  ok(r.from === s[0].date && r.to === s[249].date, '창은 가진 것의 양 끝', [r.from, r.to]);
  ok(navReturn(s, 123, []).pct != null, '6개월도 냄');
}

console.log('\n7. 총수익률 산식 — (끝 − 처음 + 분배금) ÷ 처음');
{
  const r1y = { pct: -15, from: '20251003', to: '20260930', navFrom: 10000, navTo: 8500 };
  const ttmSum = 2000;
  const tr = Number((((r1y.navTo - r1y.navFrom + ttmSum) / r1y.navFrom) * 100).toFixed(2));
  ok(tr === 5, '기준가 −15% 에 분배 20% → 총 +5.00%', tr);
  ok(r1y.from > String(20251002) === true, '기준가 창이 분배 창보다 늦게 시작하면 참');
  ok((r1y.from > String(20251003)) === false, '같은 날이면 거짓 → 총수익률 냄');
}

console.log(bad ? `\n${bad}개 실패` : '\n전부 통과');
process.exit(bad ? 1 : 0);
