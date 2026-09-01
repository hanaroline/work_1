#!/usr/bin/env node
/**
 * ELS 세일즈 제안서 — els-sales-deck.pptx (6장)
 *
 *   node scripts/build_els_sales_deck.mjs [접수번호]
 *
 * els-proposal.pptx(15장)는 근거를 다 펼쳐 보이는 분석 자료다. 이 덱은 상담 자리에
 * 그대로 들고 들어가는 6장짜리로, 결론과 반박 스크립트만 남긴다. 숫자는 같은
 * 분석층(lib/els-analysis.mjs)에서만 가져온다 — 두 산출물이 각자 계산하면 갈라진다.
 *
 * 표·도형은 전부 네이티브라 파워포인트에서 그대로 고칠 수 있다.
 */
import { readFile } from 'node:fs/promises';
import pptxgen from 'pptxgenjs';
import { analyze, kindOf, tierOf, unitOf, TIER_CUT } from './lib/els-analysis.mjs';

const A = await analyze(process.argv[2]);   // 인자가 없으면 가장 최근 공시 회차
const OUT = 'els-sales-deck.pptx';

// ── 미래에셋 팔레트 ─────────────────────────────────────────────────────────
const ORANGE = 'F58220', ACTIVE = 'CB6015', SOFT = 'FAB072', BLUE = '043B72';
const INK = '1A1A1A', BODY = '3D3D3D', MUTED = '6C6C6C';
const HAIR = 'CDCECB', SURF = 'F7F8FA', TINT = 'ECEFF4', WHITE = 'FFFFFF';
const BAD = 'C62828', WARN = '8A6A0B', OK = '2E8540';
const TIER_INK = [OK, WARN, BAD];
const TIER_BG = ['E7F1E9', 'FBF2DC', 'FAE7E7'];
const F = '맑은 고딕';

const W = 13.333, H = 7.5, M = 0.62, CW = W - M * 2;   // CW = 12.093

const f1 = (v, d = 1) => (v == null || Number.isNaN(v) ? '–' : v.toFixed(d));
const sgn = (v, d = 1) => (v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d));
const won = (n) => (n == null ? '–' : Math.round(n).toLocaleString('ko-KR'));
const dot = (s) => (s || '').replace(/-/g, '.');
// 공정가격은 상품 통화 그대로 적는다. 달러청약 상품(액면 USD 10,000)을 "원"으로
// 찍으면 환위험이 있는 상품을 원화 상품으로 읽게 만든다.
const fv = (it) => `${won(it.fairValue)}${it.currency === 'KRW' ? '원' : unitOf(it)}`;
const byNo = (n) => A.items.find((i) => i.no === n);
// 배리어 수열은 12차 상품에서 35자가 넘는다. 같은 값이 이어지면 묶어 적는다
// (85-85-85-80-75-70 -> 85x3-80-75-70). 정보는 그대로고 폭은 절반이다.
const barrierText = (it) => {
  const out = [];
  for (const b of it.barriers) {
    const last = out[out.length - 1];
    if (last && last.v === b) last.n++;
    else out.push({ v: b, n: 1 });
  }
  return out.map((g) => (g.n > 1 ? `${g.v}\u00d7${g.n}` : `${g.v}`)).join('-')
    + (it.lizard ? ` (L${it.lizard.step}\u00b7${it.lizard.barrier})` : '');
};
// 조기상환 확률 — 만기 전에 끝날 확률과 만기까지 갈 확률
const early = (it) => (it.mcByStep ? it.mcByStep.slice(0, -1).reduce((a, c) => a + c, 0) : null);
const atMaturity = (it) => (it.mcByStep ? it.mcByStep[it.mcByStep.length - 1] : null);
// 등급 경계에 걸친 상품 — 시뮬레이션 오차 범위 안에 경계가 들어오면 라벨을 단정하면 안 된다
const onEdge = (it) => it.mcCI != null && TIER_CUT.some((c) => Math.abs(it.mcLoss - c) < 2 * it.mcCI);

// 온라인 전용 — 홈페이지 상품명 끝의 e. 영업점 창구 청약이 안 되므로 상담에서 먼저 말해야 한다.
const w = {};
new Function('window', await readFile('data/els.js', 'utf8'))(w);
const ONLINE = new Set(
  w.ELS_DATA.products
    .map((p) => (p.name.match(/\(ELS\)(\d{5})e$/) || [])[1])
    .filter(Boolean)
    .map(Number),
);
const onl = (it) => (ONLINE.has(it.no) ? ' (온라인 전용)' : '');
// 시세 수집이 짧게 돌아와 직전 종가를 이월한 기초자산. 백테스트(A)의 꼬리가
// 실관측이 아니므로 자료에 밝힌다.
const STALE = w.ELS_DATA.history.stale || [];

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = '미래에셋증권';
pres.title = `제${A.items[0].no}~${A.items.at(-1).no}회 ELS 세일즈 제안서`;

/** 절 제목 — 미래에셋 시그니처인 1px 오렌지 룰 위에 제목을 얹는다 */
function head(s, title, sub) {
  s.addShape(pres.ShapeType.rect, { x: M, y: 0.42, w: CW, h: 0.014, fill: { color: ORANGE }, line: { width: 0 } });
  s.addText(title, { x: M, y: 0.50, w: CW, h: 0.44, fontFace: F, fontSize: 23, bold: true, color: INK, margin: 0 });
  if (sub) s.addText(sub, { x: M, y: 0.95, w: CW, h: 0.32, fontFace: F, fontSize: 12, color: MUTED, margin: 0 });
  return sub ? 1.38 : 1.08;
}
const slide = () => pres.addSlide();

// 자주 쓰는 상품들
const P = A.plan;
const REC = A.slots.map((s) => s.pick);
const CAU = A.caution;
const REST = A.items.filter((i) => !A.caution.includes(i));    // 주의 종목을 뺀 나머지
const safest = A.safest[0];                                   // 손실 확률 최저
const topRate = [...A.items].sort((a, b) => b.annualRate - a.annualRate)[0];
const best = [...A.items].filter((i) => i.mcLoss).sort((a, b) => b.annualRate / b.mcLoss - a.annualRate / a.mcLoss)[0];
const perRisk = (i) => i.annualRate / i.mcLoss;

// ══ 1. 표지 겸 요약 ═════════════════════════════════════════════════════════
{
  const s = slide();
  s.background = { color: ORANGE };

  s.addText('MIRAE ASSET · ELS 세일즈 제안서', {
    x: M, y: 0.72, w: 7.5, h: 0.28, fontFace: F, fontSize: 11.5, bold: true, color: WHITE, charSpacing: 2, margin: 0,
  });
  s.addText(`제${A.items[0].no}~${A.items.at(-1).no}회\n${A.items.length}종`, {
    x: M, y: 1.06, w: 7.5, h: 1.7, fontFace: F, fontSize: 40, bold: true, color: WHITE, lineSpacing: 46, margin: 0,
  });
  s.addText(`공모 청약 ${dot(P.start)}~${dot(P.end)} · 일괄신고추가서류 ${A.filedOn} 공시 원문 기준`, {
    x: M, y: 2.82, w: 7.5, h: 0.3, fontFace: F, fontSize: 13, color: WHITE, margin: 0,
  });

  // 결론 3줄 — 흰 카드
  const lines = [
    ['추천 1순위', `제${best.no}회 ${best.underlyings.join('·')}${onl(best)}`,
      `연 ${f1(best.annualRate, 1)}% · 손실 확률 ${f1(best.mcLoss)}% — 위험 1%당 연 ${f1(perRisk(best), 2)}%로 ${A.items.length}종 중 1위`],
    ['최고 수익률', `제${topRate.no}회 ${topRate.underlyings.join('·')}${onl(topRate)}`,
      `연 ${f1(topRate.annualRate, 1)}% (${topRate.currency === 'USD' ? '달러청약' : '원화'}) · 손실 확률 ${f1(topRate.mcLoss)}%`],
    ['권하지 않음', `제${CAU.map((c) => c.no).join('·')}회 — 해외종목형 ${CAU.length}종`,
      `발행사 공시 공정가격 ${won(Math.min(...CAU.map((c) => c.fairValue)))}~${won(Math.max(...CAU.map((c) => c.fairValue)))}원 · 손실 확률 ${f1(Math.min(...CAU.map((c) => c.mcLoss)))}~${f1(Math.max(...CAU.map((c) => c.mcLoss)))}%`],
  ];
  s.addShape(pres.ShapeType.rect, { x: M, y: 3.34, w: 7.5, h: 3.16, fill: { color: WHITE }, line: { width: 0 } });
  lines.forEach(([tag, name, why], i) => {
    const y = 3.56 + i * 1.02;
    s.addShape(pres.ShapeType.rect, { x: M + 0.26, y: y + 0.03, w: 1.16, h: 0.28, fill: { color: i === 2 ? BAD : (i === 0 ? ORANGE : BLUE) }, line: { width: 0 } });
    s.addText(tag, { x: M + 0.26, y: y + 0.03, w: 1.16, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(name, { x: M + 1.56, y: y - 0.02, w: 5.7, h: 0.34, fontFace: F, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(why, { x: M + 1.56, y: y + 0.32, w: 5.7, h: 0.46, fontFace: F, fontSize: 10.5, color: BODY, margin: 0, lineSpacing: 14 });
  });

  // 청약 일정 — 개인 일반투자자 마감이 홈페이지 청약종료일보다 나흘 이르다
  s.addShape(pres.ShapeType.rect, { x: 8.52, y: 1.06, w: 4.2, h: 5.44, fill: { color: WHITE }, line: { width: 0 } });
  s.addText('청약 일정', { x: 8.82, y: 1.3, w: 3.6, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INK, margin: 0 });
  s.addShape(pres.ShapeType.rect, { x: 8.82, y: 1.66, w: 3.6, h: 0.012, fill: { color: ORANGE }, line: { width: 0 } });

  const cal = [
    ['개인 일반투자자 청약', `${dot(P.start)} ~ ${dot(P.retailEnd)}`, ACTIVE, 16, '숙려제도 대상 — 실제 마감'],
    ['전체 청약기간', `${dot(P.start)} ~ ${dot(P.end)}`, BODY, 13, '숙려 대상이 아닌 경우'],
    ['숙려기간', `${dot(P.coolingFrom)} ~ ${dot(P.coolingTo)}`, BODY, 13, '이 기간에는 청약 불가'],
    ['가입의사 확인기간', dot(P.confirmBy), BODY, 13, '확인 없으면 청약 취소·환불'],
    ['발행일 / 만기', `${dot(A.head.issueDate)} / ${dot(A.head.maturityDate)}`, BODY, 13, ''],
  ];
  cal.forEach(([k, v, c, fs, note], i) => {
    const y = 1.86 + i * 0.9;
    s.addText(k, { x: 8.82, y, w: 3.6, h: 0.22, fontFace: F, fontSize: 9.5, color: MUTED, margin: 0 });
    s.addText(v, { x: 8.82, y: y + 0.22, w: 3.6, h: 0.32, fontFace: F, fontSize: fs, bold: true, color: c, margin: 0 });
    if (note) s.addText(note, { x: 8.82, y: y + 0.54, w: 3.6, h: 0.22, fontFace: F, fontSize: 8.5, color: i === 0 ? ACTIVE : MUTED, margin: 0 });
  });

  s.addText('전 종목 원금비보장 · 위험등급 1등급(매우높은위험) · 예금자보호 대상 아님', {
    x: M, y: 6.72, w: CW, h: 0.28, fontFace: F, fontSize: 10, color: WHITE, margin: 0,
  });
}

// ══ 2. 전 종목 한 장 ═══════════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, `이번 회차 ${A.items.length}종 — 손실 확률로 줄 세우면`,
    `A는 발행사가 실제 과거 시세 ${A.head.simYearsWhole}년으로 돌린 결과, B는 같은 조건을 공시 변동성·상관계수로 ${(A.mc.paths / 10000).toFixed(0)}만 번 다시 돌린 결과(± 는 95% 신뢰구간). 등급은 B 하나로만 가릅니다 — ${TIER_CUT[0]}% 이하 방어적 / ${TIER_CUT[0]}~${TIER_CUT[1]}% 중간 / ${TIER_CUT[1]}% 초과 공격적.`);

  const hdr = ['회차', '기초자산', '연\n수익률', '조기상환\n주기', '배리어 (%)', '낙인\n(%)',
    'B. 시뮬레이션\n손실 확률', '등급', '1차에\n끝날 확률', '만기까지\n갈 확률',
    'A. 설명서상\n백테스트', '액면 1만\n출발 가치'];
  const colW = [0.66, 2.67, 0.72, 0.70, 1.55, 0.50, 1.15, 0.66, 0.72, 0.72, 1.10, 0.943];  // 합 12.093

  // 종목 수가 회차마다 달라 글자 크기를 고정하면 표가 슬라이드를 넘긴다.
  // 행 수에 맞춰 줄이되, 8pt 아래로는 읽을 수 없으니 그 밑으로는 내리지 않는다.
  // 셀 여백을 줄인 뒤로는 20행도 8.5pt 로 들어간다. 24종을 넘는 회차가 오면 8pt 로 내린다.
  const FS = A.items.length > 23 ? 8 : 8.5;
  const RR = FS === 8 ? 0.190 : 0.202;          // 실측 렌더 행 높이 (셀 여백 [1,3,1,3] 기준)
  const HDR = 0.42;                             // 두 줄짜리 머리행 실측 높이

  const rows = [hdr.map((t) => ({
    text: t, options: { fill: SOFT, color: INK, bold: true, fontSize: FS, align: 'center', valign: 'middle' },
  }))];

  for (const it of [...A.items].sort((a, b) => a.mcLoss - b.mcLoss)) {
    const bad = CAU.includes(it);
    const rec = REC.includes(it);
    const bg = bad ? 'FDF3F3' : rec ? 'FFF6EC' : WHITE;
    const cell = (text, o = {}) => ({ text, options: { fill: bg, fontSize: FS, color: BODY, valign: 'middle', ...o } });
    rows.push([
      cell(String(it.no), { align: 'center', bold: rec || bad, color: rec ? ACTIVE : bad ? BAD : INK }),
      { text: ONLINE.has(it.no)
          ? [{ text: it.underlyings.join('·') + '  ', options: { fontSize: FS - 0.5, color: BODY } },
             { text: '온라인', options: { fontSize: FS - 1.5, color: BLUE, bold: true } }]
          : it.underlyings.join('·'),
        options: { fill: bg, fontSize: FS - 0.5, color: BODY, valign: 'middle' } },
      cell(`${f1(it.annualRate, 1)}%${it.currency === 'USD' ? ' $' : ''}`, { align: 'right', bold: true, color: INK }),
      cell(`${it.every}M · ${it.steps}회`, { align: 'center', fontSize: FS - 0.5 }),
      cell(barrierText(it), { fontSize: FS - 1, align: 'center' }),
      cell(it.knockIn == null ? '없음' : String(it.knockIn), { align: 'center' }),
      cell(`${f1(it.mcLoss)}% ±${f1(it.mcCI, 2)}`, { align: 'right', bold: true, color: TIER_INK[it.tier] }),
      { text: tierOf(it).name + (onEdge(it) ? ' \u25b3' : ''),
        options: { fill: TIER_BG[it.tier], color: TIER_INK[it.tier], bold: true, fontSize: FS, align: 'center', valign: 'middle' } },
      cell(`${f1(it.mcByStep[0])}%`, { align: 'right', color: OK }),
      cell(`${f1(atMaturity(it))}%`, { align: 'right' }),
      cell(`${f1(it.simLoss, 2)}% (${f1(it.simYears)}년)`, {
        align: 'right', color: it.simShort ? WARN : BODY, italic: it.simShort,
      }),
      cell(fv(it), { align: 'right', bold: bad, color: bad ? BAD : BODY }),
    ]);
  }

  // rowH 는 최소값이라 셀이 줄바꿈되면 표가 그만큼 아래로 자란다. 어떤 칸도
  // 두 줄이 되지 않게 폭과 글자 크기를 맞춰 두고, 아래 안내 상자를 그 높이에 붙인다.
  // 행 높이는 rowH(최소값)보다 셀 여백이 좌우한다. 여백을 줄이지 않으면 20행이
  // 슬라이드를 넘겨 마지막 한 줄 — 하필 손실 확률이 가장 높은 회차 — 이 잘린다.
  s.addTable(rows, {
    x: M, y: y0, w: CW, colW, rowH: RR - 0.04, margin: [1, 3, 1, 3],
    border: { type: 'solid', color: HAIR, pt: 0.5 }, fontFace: F,
  });

  // 실제 렌더 행 높이는 rowH(최소값)가 아니라 글자 크기가 정한다.
  // 표 아래 안내 상자는 그 실측치로 자리를 잡는다. 낮춰 잡으면 마지막 줄을 덮는다.
  const yN = y0 + HDR + (rows.length - 1) * RR + 0.12;
  s.addShape(pres.ShapeType.rect, { x: M, y: yN, w: CW, h: 0.46, fill: { color: TINT }, line: { width: 0 } });
  const edge = A.items.filter(onEdge);
  s.addText([
    { text: '읽는 법 — ', options: { bold: true, color: INK } },
    { text: `주황 줄이 추천 ${REC.length}종, 붉은 줄이 권하지 않는 ${CAU.length}종. `, options: { color: BODY } },
    { text: '‘출발 가치’는 발행사가 공시한 공정가격', options: { color: BODY } },
    { text: `으로, 액면 1만 단위를 넣는 순간의 이론 값어치입니다 — 맨 아래 ${CAU.length}종만 ${won(Math.max(...CAU.map((c) => c.fairValue)))}원 이하.  `, options: { color: BODY } },
    { text: '온라인', options: { color: BLUE, bold: true } },
    { text: ' 표시는 영업점 창구 청약이 안 되는 상품입니다.  ', options: { color: MUTED } },
    { text: '\u25b3', options: { color: WARN, bold: true } },
    { text: `${edge.length ? ` ${edge.length}종은` : '는'} 손실 확률이 등급 경계에 걸쳐 있어 등급 라벨을 단정할 수 없습니다. A 열은 검증기간이 짧으면 기울임.`, options: { color: MUTED } },
  ], { x: M + 0.16, y: yN, w: CW - 0.32, h: 0.46, fontFace: F, fontSize: 9, valign: 'middle', margin: 0, lineSpacing: 12 });
}

// ══ 3. 추천 3종 ═════════════════════════════════════════════════════════════
{
  const s = slide();
  // 추천 3종의 공정가는 회차마다 액면 위아래로 갈린다. 문장을 박아 두면 틀린다.
  const recGapMin = Math.min(...REC.map((i) => i.fairValueGap));
  const y0 = head(s, `고객 성향별 추천 ${REC.length}종`,
    recGapMin >= 0
      ? `세 상품 모두 발행사 공시 공정가격이 액면 1만 단위를 넘습니다(+${f1(recGapMin, 2)}% 이상) — 제값 이상으로 사는 자리라는 뜻입니다.`
      : '세 상품 모두 발행사 공시 공정가격이 액면 1만 단위에 가깝습니다 — 제값을 주고 사는 상품이라는 뜻입니다.');

  const cw = (CW - 0.36) / 3;
  A.slots.forEach((sl, i) => {
    const it = sl.pick;
    const x = M + i * (cw + 0.18);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 5.00, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 0.055, fill: { color: i === 0 ? OK : i === 1 ? ORANGE : BLUE }, line: { width: 0 } });

    s.addText(sl.label, { x: x + 0.22, y: y0 + 0.22, w: cw - 0.44, h: 0.26, fontFace: F, fontSize: 11, bold: true, color: i === 0 ? OK : i === 1 ? ACTIVE : BLUE, margin: 0 });
    s.addText(`제${it.no}회`, { x: x + 0.22, y: y0 + 0.5, w: cw - 0.44, h: 0.42, fontFace: F, fontSize: 24, bold: true, color: INK, margin: 0 });
    s.addText(it.underlyings.join(' · ') + onl(it), { x: x + 0.22, y: y0 + 0.94, w: cw - 0.44, h: 0.44, fontFace: F, fontSize: 11, color: BODY, margin: 0, lineSpacing: 14 });

    // 큰 수치 두 개
    s.addShape(pres.ShapeType.rect, { x: x + 0.22, y: y0 + 1.44, w: cw - 0.44, h: 0.9, fill: { color: SURF }, line: { width: 0 } });
    s.addText('조건 충족 시 연 수익률(세전)', { x: x + 0.38, y: y0 + 1.54, w: (cw - 0.76) / 2, h: 0.2, fontFace: F, fontSize: 8.5, color: MUTED, margin: 0 });
    s.addText(`${f1(it.annualRate, 1)}%`, { x: x + 0.38, y: y0 + 1.74, w: (cw - 0.76) / 2, h: 0.46, fontFace: F, fontSize: 26, bold: true, color: ACTIVE, margin: 0 });
    s.addText('손실 확률 (B)', { x: x + 0.38 + (cw - 0.76) / 2, y: y0 + 1.54, w: (cw - 0.76) / 2, h: 0.2, fontFace: F, fontSize: 8.5, color: MUTED, margin: 0 });
    s.addText(`${f1(it.mcLoss)}%`, { x: x + 0.38 + (cw - 0.76) / 2, y: y0 + 1.74, w: (cw - 0.76) / 2, h: 0.46, fontFace: F, fontSize: 26, bold: true, color: TIER_INK[it.tier], margin: 0 });

    // ── 조기상환 확률 ──
    // 상담에서 가장 많이 듣는 질문이 "3년 묶이는 거 아니냐" 다.
    // 차수별 확률을 그대로 보여주는 편이 어떤 설명보다 빠르다.
    const bs = it.mcByStep, nStep = bs.length;
    const p1 = bs[0], pMid = bs.slice(1, -1).reduce((a, c) => a + c, 0), pEnd = bs[nStep - 1];
    const bx = x + 0.22, bw = cw - 0.44, by = y0 + 2.62;
    s.addText('조기상환 확률 (시뮬레이션)', { x: bx, y: y0 + 2.40, w: bw, h: 0.2, fontFace: F, fontSize: 8.5, color: MUTED, margin: 0 });
    let acc = 0;
    [[p1, OK], [pMid, SOFT], [pEnd, '9AA6B2']].forEach(([v, c]) => {
      const w2 = bw * v / 100;
      if (w2 > 0.001) s.addShape(pres.ShapeType.rect, { x: bx + bw * acc / 100, y: by, w: w2, h: 0.17, fill: { color: c }, line: { width: 0 } });
      acc += v;
    });
    s.addText([
      { text: `1차 ${f1(p1)}%`, options: { color: OK, bold: true } },
      { text: `  ·  2~${nStep - 1}차 ${f1(pMid)}%`, options: { color: ACTIVE } },
      { text: `  ·  만기 ${f1(pEnd)}%`, options: { color: MUTED } },
    ], { x: bx, y: by + 0.19, w: bw, h: 0.2, fontFace: F, fontSize: 8.5, margin: 0 });
    s.addText(bs.map((v, k) => `${k + 1}차 ${f1(v)}`).join(' · ') + '  (%)', {
      x: bx, y: by + 0.39, w: bw, h: 0.32, fontFace: F, fontSize: 7.5, color: MUTED, margin: 0, lineSpacing: 10,
    });

    const rows = [
      ['3년 총 수익률', `${f1(it.totalRate, 1)}%${it.currency === 'USD' ? ' (달러청약)' : ''}`],
      ['조기상환', `${it.every}개월마다 ${it.steps}회 · 배리어 ${it.barriers[0]}%부터`],
      ['손실 조건', it.knockIn == null
        ? `만기에 ${100 - it.barriers.at(-1)}% 초과 하락`
        : `${100 - it.knockIn}% 하락 경험 + 만기 ${100 - it.barriers.at(-1)}% 초과 하락`],
      ['설명서 백테스트 (A)', `손실 ${f1(it.simLoss, 2)}% · 1차 상환 ${f1(it.simFirst)}% · ${f1(it.simYears)}년`],
      ['액면 1만 단위 출발 가치', `${fv(it)} (${sgn(it.fairValueGap, 2)}%)`],
      ['위험 1%당 연 수익률', `${f1(perRisk(it), 2)}%`],
    ];
    rows.forEach(([k, v], j) => {
      const y = y0 + 3.36 + j * 0.275;
      s.addText(k, { x: x + 0.22, y, w: 1.42, h: 0.26, fontFace: F, fontSize: 8, color: MUTED, valign: 'top', margin: 0 });
      s.addText(v, { x: x + 1.66, y, w: cw - 1.88, h: 0.26, fontFace: F, fontSize: 8, color: BODY, valign: 'top', margin: 0, lineSpacing: 10 });
    });
  });

  const yN = y0 + 5.12;
  s.addShape(pres.ShapeType.rect, { x: M, y: yN, w: CW, h: 0.46, fill: { color: TINT }, line: { width: 0 } });
  s.addText([
    { text: '한 문장으로 — ', options: { bold: true, color: INK } },
    { text: `제${REC[0].no}회는 연 ${f1(REC[0].annualRate, 1)}%를 받으면서 손실 확률이 ${f1(REC[0].mcLoss)}%로 지수형 평균(${f1(A.byKind.find((k) => k.key === '지수').loss)}%)보다도 낮습니다. 3개월마다 ${REC[0].steps}번 상환 기회가 있고 배리어가 ${REC[0].barriers[0]}%에서 시작하는 구조 덕입니다.`, options: { color: BODY } },
  ], { x: M + 0.16, y: yN, w: CW - 0.32, h: 0.46, fontFace: F, fontSize: 9.5, valign: 'middle', margin: 0 });
}

// ══ 4. 권하지 않는 3종 ══════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, `이번 회차에서 권하지 않는 ${CAU.length}종`,
    `연 ${f1(Math.min(...CAU.map((c) => c.annualRate)), 1)}~${f1(Math.max(...CAU.map((c) => c.annualRate)), 1)}%라는 수익률만 보면 눈에 띄는 상품들입니다. 세 가지 지표가 모두 반대를 가리킵니다.`);

  // 좌: 세 상품 카드
  const cw = 7.2;
  // 주의 종목은 회차마다 3~4종으로 달라진다. 칸 높이를 종목 수에 맞춰 잡지 않으면
  // 넷째 카드가 아래 파란 상자를 덮는다.
  const CH = CAU.length >= 4 ? 1.005 : 1.34, CB = CH - 0.16;
  CAU.forEach((it, i) => {
    const y = y0 + i * CH;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: cw, h: CB, fill: { color: 'FDF3F3' }, line: { color: 'F0C9C9', width: 1 } });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.05, h: CB, fill: { color: BAD }, line: { width: 0 } });
    s.addText(`제${it.no}회`, { x: M + 0.24, y: y + 0.09, w: 1.2, h: 0.28, fontFace: F, fontSize: 14.5, bold: true, color: BAD, margin: 0 });
    s.addText(it.underlyings.join(' · ') + onl(it), { x: M + 1.4, y: y + 0.12, w: 3.36, h: 0.24, fontFace: F, fontSize: 10, color: INK, margin: 0 });
    s.addText(`연 ${f1(it.annualRate, 1)}%`, { x: M + 4.8, y: y + 0.08, w: 2.2, h: 0.28, fontFace: F, fontSize: 13.5, bold: true, color: MUTED, align: 'right', margin: 0 });

    const mini = [
      ['출발 가치 (액면 1만)', fv(it), BAD],
      ['손실 확률 (B)', `${f1(it.mcLoss)}%`, BAD],
      ['적용 변동성', `${f1(it.vmax)}%`, BAD],
      ['위험 1%당 연 수익률', `${f1(perRisk(it), 2)}%`, BAD],
    ];
    mini.forEach(([k, v, c], j) => {
      const mx = M + 0.24 + j * 1.72;
      s.addText(k, { x: mx, y: y + 0.42, w: 1.66, h: 0.2, fontFace: F, fontSize: 8, color: MUTED, margin: 0 });
      s.addText(v, { x: mx, y: y + 0.60, w: 1.66, h: 0.28, fontFace: F, fontSize: 13, bold: true, color: c, margin: 0 });
    });
  });

  // 우: 이유 세 가지
  const rx = M + cw + 0.24, rw = CW - cw - 0.24;
  // 근거 문구는 회차마다 값이 달라진다. 회차 번호나 종목명을 문장에 박으면
  // 다음 주에 조용히 틀린 자료가 된다 — 전부 이번 회차 값에서 뽑는다.
  const restKrw = REST.filter((i2) => i2.currency === 'KRW');
  const cauGapWorst = Math.min(...CAU.map((c) => c.fairValueGap));
  const cauLossAvg = CAU.reduce((a, b) => a + b.mcLoss, 0) / CAU.length;
  const restLossAvg = REST.reduce((a, b) => a + b.mcLoss, 0) / REST.length;
  // 같은 종목이 여러 회차에 걸쳐 나오므로 이름으로 한 번씩만 센다.
  // 중복을 두면 "마이크론 97.8%, 마이크론 97.8%" 같은 문장이 나간다.
  const volTop = [...new Map(CAU.flatMap((c) => c.volatility).map((v) => [v.asset, v])).values()]
    .sort((a, b) => b.vol - a.vol).slice(0, 2);
  const idxVols = A.items.filter((i2) => kindOf(i2) === '지수').map((i2) => i2.vmax);

  const why = [
    [`1. 넣는 순간 ${Math.abs(Math.round(cauGapWorst))}%까지 깎입니다`,
      `발행사가 공시한 공정가격이 ${won(Math.min(...CAU.map((c) => c.fairValue)))}~${won(Math.max(...CAU.map((c) => c.fairValue)))}원입니다. 액면 1만원을 내고 사는 시점의 이론 값어치가 그것뿐이라는 뜻입니다. 나머지 원화 ${restKrw.length}종은 ${won(Math.min(...restKrw.map((i2) => i2.fairValue)))}원 이상입니다.`],
    [`2. 손실 확률이 ${f1(cauLossAvg / restLossAvg, 1)}배입니다`,
      `${f1(Math.min(...CAU.map((c) => c.mcLoss)))}~${f1(Math.max(...CAU.map((c) => c.mcLoss)))}%. 나머지 ${REST.length}종 평균은 ${f1(restLossAvg)}%입니다. 손실이 나면 평균 ${f1(Math.abs(CAU.reduce((a, b) => a + b.mcAvgLoss, 0) / CAU.length))}%를 잃습니다.`],
    ['3. 변동성이 감당 밖입니다',
      `${volTop.map((v) => `${v.asset} ${f1(v.vol, 2)}%`).join(', ')} — 공시된 적용 변동성입니다. ${idxVols.length ? `이번 회차 지수형은 ${f1(Math.min(...idxVols), 1)}~${f1(Math.max(...idxVols), 1)}%로, 그 두 배를 넘습니다. ` : ''}이 변동성이 그대로 손실 확률로 돌아옵니다.`],
  ];
  why.forEach(([t, b], i) => {
    const y = y0 + i * 1.34;
    s.addText(t, { x: rx, y, w: rw, h: 0.28, fontFace: F, fontSize: 11.5, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: rx, y: y + 0.3, w: rw, h: 0.92, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, lineSpacing: 14, valign: 'top' });
  });

  const yN = y0 + Math.max(CAU.length * CH, 3 * 1.34) + 0.14;
  s.addShape(pres.ShapeType.rect, { x: M, y: yN, w: CW, h: 0.62, fill: { color: BLUE }, line: { width: 0 } });
  s.addText([
    { text: '상담에서 이렇게 말씀하세요  ', options: { bold: true, color: WHITE } },
    { text: `“수익률만 보면 이게 높아 보이는데, 발행사가 공시한 이 상품의 값어치가 1만원이 아니라 ${fv(CAU[0])}입니다. 같은 위험을 지실 거면 제${topRate.no}회가 연 ${f1(topRate.annualRate, 1)}%에 손실 확률은 ${f1(topRate.mcLoss)}%입니다.”`, options: { color: 'D9E3EE' } },
  ], { x: M + 0.2, y: yN, w: CW - 0.4, h: 0.62, fontFace: F, fontSize: 10, valign: 'middle', margin: 0, lineSpacing: 14 });
}

// ══ 5. 반박 스크립트 ════════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '고객 반응별 대응 스크립트',
    '모든 답변의 숫자는 발행사 공시 원문과 이번 회차 시뮬레이션에서 나온 값입니다. 확률을 낮게 말하지 말고, 크기를 함께 말씀하세요.');

  const R = REC[0];               // 추천 1순위 기준으로 답한다
  const HS = A.items.filter((i) => i.underlyings.includes('HSCEI'));   // 회차 번호를 박으면 다음 주에 틀린다
  const hs = HS[0];
  const scripts = [
    ['“원금을 다 날릴 수도 있다면서요.”',
      `손실은 두 가지가 동시에 맞아야 납니다. 제${R.no}회는 3년 안에 한 번이라도 ${100 - R.knockIn}% 떨어진 적이 있고, 만기에도 ${100 - R.barriers.at(-1)}% 넘게 떨어져 있어야 손실입니다. 발행사가 실제 과거 시세 ${A.head.simYearsWhole}년으로 ${R.simRuns.toLocaleString('ko-KR')}번 돌린 결과 손실은 ${f1(R.simLoss, 2)}%였습니다. 다만 그 ${f1(R.mcLoss)}%가 현실이 되면 평균 ${f1(Math.abs(R.mcAvgLoss))}%를 잃습니다. 확률은 낮고 크기는 큽니다.`],
    ['“홍콩 ELS로 크게 물린 분들 많잖아요.”',
      HS.length
        ? `맞습니다. 그때 문제의 핵심은 낙인이 높았다는 것이었습니다. 이번 회차에서 HSCEI가 들어간 건 제${HS.map((i) => i.no).join('·')}회 ${HS.length}종뿐이고, 낙인은 ${HS.map((i) => i.knockIn).join('%·')}%입니다. 제${hs.no}회 기준 지금 지수에서 ${100 - hs.knockIn}%를 더 내려가야 손실 구간에 들어갑니다. 상품을 고르실 때 수익률이 아니라 이 낙인 숫자를 먼저 보시면 됩니다.`
        : `맞습니다. 그때 문제의 핵심은 낙인이 높았다는 것이었습니다. 이번 회차에는 HSCEI가 들어간 상품이 아예 없습니다. 그리고 낙인은 ${Math.min(...A.items.filter((i) => i.knockIn != null).map((i) => i.knockIn))}~${Math.max(...A.items.filter((i) => i.knockIn != null).map((i) => i.knockIn))}% 구간입니다. 상품을 고르실 때 수익률이 아니라 이 낙인 숫자를 먼저 보시면 됩니다.`],
    ['“예금이 안전한데 굳이 왜요.”',
      `같은 자리에 놓고 비교하실 상품이 아닙니다. 예금은 원금이 보장되고 이건 아닙니다. 대신 제${R.no}회는 조건이 맞으면 연 ${f1(R.annualRate, 1)}%, 3년 ${f1(R.totalRate, 1)}%입니다. 예금을 대체하는 돈이 아니라, 예금에 넣지 않기로 한 돈의 일부로만 접근하셔야 합니다.`],
    ['“3년이나 묶이는 거 아닌가요.”',
      `3년은 최장 기간이고 대부분 훨씬 일찍 끝납니다. 제${R.no}회는 ${R.every}개월마다 ${R.steps}번 상환 기회가 있고, 첫 회에 끝난 경우가 백테스트 ${f1(R.simFirst)}%였습니다. 중도상환도 가능합니다만 그때는 원금 손실이 날 수 있어서, 3년 쓸 일 없는 돈으로만 하셔야 합니다.`],
    ['“지금이 고점 아닌가요.”',
      `고점인지 아닌지는 저도 모릅니다. 다만 이 상품은 오르면 버는 구조가 아니라 크게 안 떨어지면 버는 구조입니다. 제${R.no}회는 ${R.barriers[0]}% 배리어라 기초자산이 ${100 - R.barriers[0]}% 떨어져도 첫 회에 상환됩니다. 그래도 부담스러우시면 손실 확률이 가장 낮은 제${safest.no}회(${f1(safest.mcLoss)}%, 연 ${f1(safest.annualRate, 1)}%)를 보시죠.`],
    ['“그냥 수익률 제일 높은 걸로 주세요.”',
      `그게 이번엔 안 맞습니다. 연 ${f1(CAU[0].annualRate, 1)}%인 제${CAU[0].no}회는 손실 확률이 ${f1(CAU[0].mcLoss)}%로, 연 ${f1(topRate.annualRate, 1)}%인 제${topRate.no}회(${f1(topRate.mcLoss)}%)의 ${f1(CAU[0].mcLoss / topRate.mcLoss, 1)}배입니다. 수익률과 위험이 비례하지 않습니다. 같은 위험이면 더 받는 쪽으로 골라 드리겠습니다.`],
  ];

  const cw = (CW - 0.24) / 2, rh = 1.72;
  scripts.forEach(([q, a], i) => {
    const x = M + (i % 2) * (cw + 0.24);
    const y = y0 + Math.floor(i / 2) * (rh + 0.14);
    s.addShape(pres.ShapeType.rect, { x, y, w: cw, h: rh, fill: { color: SURF }, line: { color: HAIR, width: 0.75 } });
    s.addShape(pres.ShapeType.rect, { x, y, w: cw, h: 0.42, fill: { color: TINT }, line: { width: 0 } });
    s.addText(q, { x: x + 0.18, y, w: cw - 0.36, h: 0.42, fontFace: F, fontSize: 11, bold: true, color: BLUE, valign: 'middle', margin: 0 });
    s.addText(a, { x: x + 0.18, y: y + 0.5, w: cw - 0.36, h: rh - 0.62, fontFace: F, fontSize: 9, color: BODY, valign: 'top', margin: 0, lineSpacing: 13 });
  });
}

// ══ 6. 상담 순서와 필수 고지 ════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '상담 진행 순서와 반드시 말해야 할 것',
    '고난도금융투자상품 · 숙려제도 대상 · 녹취 의무 상품입니다. 아래 여섯 가지를 빠뜨리면 나중에 불완전판매가 됩니다.');

  // 좌 — 상담 5단계
  const lw = 6.4;
  s.addText('상담 순서', { x: M, y: y0, w: lw, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INK, margin: 0 });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 0.34, w: lw, h: 0.012, fill: { color: ORANGE }, line: { width: 0 } });
  const steps = [
    ['1', '쓸 일 없는 돈인지 먼저 확인', '3년 안에 쓸 계획이 있는 돈이면 여기서 멈춥니다. 중도상환은 원금 손실이 납니다.'],
    ['2', '손실 조건을 숫자로 설명', `“${R2()}” — 배리어와 낙인을 %가 아니라 “얼마나 떨어져야 하는지”로 바꿔 말합니다.`],
    ['3', '확률과 크기를 함께 제시', `손실 확률 ${f1(REC[0].mcLoss)}%와 손실 시 평균 ${f1(Math.abs(REC[0].mcAvgLoss))}%를 한 문장에 같이 담습니다.`],
    ['4', '성향에 맞는 한 종만 권유', `${A.slots.length}종 중 하나로 좁혀 드립니다. ${CAU.length}종(제${CAU.map((c) => c.no).join('·')}회)은 권유 대상에서 제외합니다.`],
    ['5', '일정과 절차 안내', `개인 일반투자자 마감은 ${dot(P.retailEnd)}입니다. 숙려 후 ${dot(P.confirmBy)}까지 가입의사를 직접 확인하지 않으면 청약이 취소됩니다.`],
  ];
  steps.forEach(([n, t, b], i) => {
    const y = y0 + 0.52 + i * 1.0;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: ORANGE }, line: { width: 0 } });
    s.addText(n, { x: M, y: y + 0.02, w: 0.34, h: 0.34, fontFace: F, fontSize: 11, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(t, { x: M + 0.5, y, w: lw - 0.5, h: 0.28, fontFace: F, fontSize: 11.5, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: M + 0.5, y: y + 0.3, w: lw - 0.5, h: 0.6, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, lineSpacing: 13, valign: 'top' });
  });

  // 우 — 필수 고지 + 근거
  const rx = M + lw + 0.36, rw = CW - lw - 0.36;
  s.addText('반드시 말해야 할 여섯 가지', { x: rx, y: y0, w: rw, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INK, margin: 0 });
  s.addShape(pres.ShapeType.rect, { x: rx, y: y0 + 0.34, w: rw, h: 0.012, fill: { color: BAD }, line: { width: 0 } });
  const must = [
    '원금비보장 · 위험등급 1등급(매우높은위험). 원금 전액(-100%) 손실이 가능합니다.',
    '예금자보호법 대상이 아닙니다.',
    '발행사 신용위험 — 미래에셋증권이 지급 불이행하면 조건과 무관하게 손실이 납니다 (신용등급 AA).',
    '거래소 비상장 — 만기 전 현금화가 어렵고, 중도상환 시 상환비용으로 원금에 미달할 수 있습니다.',
    '개인 일반투자자 판매는 전 과정 녹취 의무입니다. 거부하시면 판매가 불가합니다.',
    '만 65세 이상 고령투자자 유의 상품이며, 고난도금융투자상품입니다.',
  ];
  must.forEach((t, i) => {
    const y = y0 + 0.52 + i * 0.62;
    s.addShape(pres.ShapeType.rect, { x: rx, y: y + 0.06, w: 0.16, h: 0.16, fill: { color: BAD }, line: { width: 0 } });
    s.addText(t, { x: rx + 0.3, y, w: rw - 0.3, h: 0.56, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, lineSpacing: 13, valign: 'top' });
  });

  const yS = y0 + 0.52 + must.length * 0.62 + 0.1;
  s.addShape(pres.ShapeType.rect, { x: rx, y: yS, w: rw, h: 1.78, fill: { color: TINT }, line: { width: 0 } });
  s.addText('이 자료의 근거', { x: rx + 0.18, y: yS + 0.12, w: rw - 0.36, h: 0.24, fontFace: F, fontSize: 10, bold: true, color: INK, margin: 0 });
  // 확인된 것과 확인되지 않은 것을 갈라서 적는다. 한계를 빼면 나머지가 모두
  // 검증된 값처럼 읽힌다.
  const shortSample = A.items.filter((i2) => i2.simShort);
  const caveat = [
    shortSample.length
      ? `제${shortSample.map((i2) => i2.no).join('·')}회는 기초자산 상장이 늦어 검증 표본이 ${f1(Math.min(...shortSample.map((i2) => i2.simYears)))}년뿐입니다 — A 열을 20년 상품과 같은 줄에서 비교할 수 없습니다.`
      : '',
    STALE.length
      ? `${STALE.join('·')} 과거 시세는 최근 수집분이 짧게 들어와 직전 종가를 이월했습니다. A 의 마지막 며칠은 실관측이 아닙니다(B 는 공시 변동성만 쓰므로 영향 없음).`
      : '',
  ].filter(Boolean).join(' ');

  s.addText(
    `조건·공정가격·적용 변동성·상관계수·백테스트(A)는 일괄신고추가서류(접수번호 ${A.rcp}, ${A.filedOn} 공시) 원문에서 그대로 옮겼습니다. 손실 확률(B)은 그 공시 변동성과 상관계수로 같은 조건을 4만 번 다시 돌린 값이며, 공시된 수치가 아닙니다. 수익률은 확정이 아니라 조건 충족 시의 상한입니다.`,
    { x: rx + 0.18, y: yS + 0.36, w: rw - 0.36, h: 0.62, fontFace: F, fontSize: 8.5, color: BODY, margin: 0, lineSpacing: 12, valign: 'top' },
  );
  if (caveat) {
    s.addText([{ text: '확인 못한 것 — ', options: { bold: true, color: BAD } }, { text: caveat, options: { color: BODY } }],
      { x: rx + 0.18, y: yS + 1.02, w: rw - 0.36, h: 0.62, fontFace: F, fontSize: 8.5, margin: 0, lineSpacing: 12, valign: 'top' });
  }
}

/** 2단계 스크립트 문장 — 배리어를 "얼마나 떨어져야 하는지" 로 바꾼다 */
function R2() {
  const it = REC[0];
  return it.knockIn == null
    ? `만기에 ${100 - it.barriers.at(-1)}% 넘게 떨어져 있을 때만 손실입니다`
    : `3년 안에 한 번이라도 ${100 - it.knockIn}% 떨어지고, 만기에도 ${100 - it.barriers.at(-1)}% 넘게 떨어져 있어야 손실입니다`;
}

await pres.writeFile({ fileName: OUT });
console.log(`${OUT} — 6장 / 제${A.items[0].no}~${A.items.at(-1).no}회 ${A.items.length}종`);
console.log(`추천 ${REC.map((r) => r.no).join(', ')} · 주의 ${CAU.map((c) => c.no).join(', ')}`);
