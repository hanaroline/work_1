/* 중도상환 자리의 대비책을 **조사 로그에서 옮긴 원문 꼴**로 시험한다.
 *
 *   node scripts/test_doc_midredeem.mjs
 *
 * 왜 여기서 먼저 가리나
 *   통계만 보고 규칙을 고쳐 여러 번 틀렸다. 전량(38회차 · 러너에서 2분 30초)을
 *   돌리기 전에 원문 꼴로 가린다. 본보기의 글은 조사 36676951759 에서 그대로 옮겼다.
 *
 * ★ 본보기를 처음에 잘못 적어 시험이 헛되이 초록이었다 ★
 *   「중도상환가격평가일」 을 p.19 앞부분에 넣었더니 1순위 규칙이 그냥 잡아 버렸다.
 *   실제 원문은 그 낱말이 **220자 밖**에 있다. 본보기를 원문에 맞게 고치고 나서야
 *   시험이 뜻을 가졌다. 고친 뒤 대비책을 빼고 돌려 **실제로 빨간 것**도 확인했다.
 */
const HEAD_CHARS = 220;
const BOUNDARY = /투\s*자\s*설\s*명\s*서\s*20\d\d년/;

/* 생성기(build_doc_pages.mjs)의 midRedeem 줄과 같아야 한다 */
const ANCHORS = [
  ['midRedeem', 'brief', /중도상환가격\s*평가일/, '중도상환 가격평가일',
    { re: /5\s*\.\s*중도상환에\s*대한\s*사항/, whole: true, why: '절 제목' }],
];

/* 생성기의 mapPages 와 같은 셈법 */
function run(pages) {
  let bIdx = pages.findIndex((t) => BOUNDARY.test(t.slice(0, HEAD_CHARS)));
  if (bIdx < 0) bIdx = pages.length;
  const found = {}, ambiguous = [], missing = [], viaFallback = [];
  for (const [key, zone, re, what, fb] of ANCHORS) {
    const from = zone === 'full' ? bIdx : 0;
    const to = zone === 'full' ? pages.length : bIdx;
    const scan = (rx, whole) => {
      const h = [];
      for (let i = from; i < to; i++) if (rx.test(whole ? pages[i] : pages[i].slice(0, HEAD_CHARS))) h.push(i + 1);
      return h;
    };
    const hits = scan(re, false);
    if (hits.length === 1) { found[key] = hits[0]; continue; }
    if (fb && hits.length === 0) {
      const f = scan(fb.re, fb.whole);
      if (f.length === 1) { found[key] = f[0]; viaFallback.push(what); continue; }
    }
    if (hits.length === 0) missing.push(what); else ambiguous.push(`${what} (p.${hits.join(',')})`);
  }
  return { found, ambiguous, missing, viaFallback };
}

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

/* 76쪽 꼴 (38169e) — 표가 쪽 맨 앞(0자)에서 시작한다 */
const 정상 = [
  'p1', 'p2', 'p3', 'p4', 'p5',
  pad('상환구분 수익률 발생횟수 발생빈도 Total 3,327 100.00% 주1) 위 그래프와 표는', 420)
    + '5. 중도상환에 대한 사항 ｏ 만기 또는 자동조기상환이 원칙이나 투자자가 원할 경우 중도상환을 신청하실 수 있습니다. 단, 미래에셋증권은 중도상환가격평가일에 시장이',
  '중도상환가격 평가일 중도상환신청일 익거래소영업일 및 영업일 (단, 기초자산이 복수인 경우, 중도상환가격평가일은 중도상환 신청일 직후의)',
  '6. 투자자 유의사항 기초자산의 가격변동에',
  '투 자 설 명 서 2026년 09월',
];

/* 81쪽 꼴 (38158·38165e) — 간이 구간이 2쪽 길어 표 제목행이 쪽 아래로 밀린다 */
const 밀린꼴 = [
  'p1', 'p2', 'p3', 'p4', 'p5',
  pad('상환구분 수익률 발생횟수 발생빈도 만기상환손실 -20% ~ -10% 0 0.00% Total 5,109', 530)
    + '5. 중도상환에 대한 사항 ｏ 만기 또는 자동조기상환이 원칙이나 투자자가 원할 경우 중도상환을 신청하실 수 있습니다. 단, 미래에셋증권은 중도상환가격평가일에 시장이 열리지',
  /* 실제 p.19 — 표 중간 행부터 시작하고, 「중도상환가격평가일」 은 220자 밖에 있다 */
  '신청가능일 일(단, 조기/만기 상환평가 확정시 중도상환 신청 불가) 중도상환 신청불가능일 다음 ①부터 ④까지의 해당 영업일 ① 최종 관찰일 이전 4영업일부터 최종 관찰일(포함) 까지의 영업일 ② 자동조기상환평가일과 그 직전 영업일 ③ 만기평가일과 그 직전 영업일 ④ 수익지급평가일과 그 직전 영업일 중도상환 요청의 철회 오전 10시 59분 이전 신청분은 당일 철회 가능 '
    + '(단, 기초자산이 복수인 경우, 중도상환가격평가일은 중도상환 신청일 직후의 기초자산 모두의 거래소영업일로 한다.)',
  '중도상환요청시 : 중도상환결정일= 환매신청일(T)+ 익영업일(1) 월요일 공정가액',
  '6. 투자자 유의사항 기초자산의',
  '투 자 설 명 서 2026년 09월',
];

/* 절 제목이 두 쪽에 나오는 꼴 — 대비책도 고를 수 없으니 비워야 한다 */
const 절제목두번 = [
  'p1', 'p2',
  '가나다 5. 중도상환에 대한 사항 어쩌고',
  '라마바 5. 중도상환에 대한 사항 저쩌고',
  '투 자 설 명 서 2026년 09월',
];

const T = [
  ['76쪽 꼴 — 표가 쪽 맨 앞 (1순위로 잡혀야 함 · 회귀)', 정상, 7, false],
  ['★81쪽 꼴 — 제목행이 쪽 아래로 밀림 (대비책으로 채워야 함)', 밀린꼴, 6, true],
  ['절 제목이 두 쪽에 — 대비책도 못 고르니 비워야 함', 절제목두번, 0, false],
];

let bad = 0;
for (const [name, pages, wantPage, wantFb] of T) {
  const r = run(pages);
  const got = r.found.midRedeem || 0;
  const fb = r.viaFallback.length > 0;
  const ok = got === wantPage && fb === wantFb;
  if (!ok) bad++;
  console.log(`${ok ? '  ok  ' : '★FAIL '} ${name}`);
  console.log(`         바람 p.${wantPage}${wantFb ? ' (대비책)' : ''} · 나옴 p.${got}${fb ? ' (대비책)' : ''}`);
}
console.log(bad ? `\n★ ${bad}건 실패 — 고치지 말고 다시 볼 것` : '\n모두 통과');
process.exit(bad ? 1 : 0);
