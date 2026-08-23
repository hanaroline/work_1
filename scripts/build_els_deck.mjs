#!/usr/bin/env node
/**
 * ELS 주간 제안서 발표 덱 — els-proposal.pptx
 *
 *   node scripts/build_els_deck.mjs [접수번호]
 *
 * els-proposal.html 과 같은 분석층(lib/els-analysis.mjs)을 쓴다. 두 산출물이 각자
 * 계산하면 언젠가 반드시 갈라지므로, 등급·추천·자산군 평균은 그쪽 한 곳에만 둔다.
 *
 * 표·도형·차트는 전부 네이티브라 파워포인트에서 그대로 고칠 수 있다.
 */
import pptxgen from 'pptxgenjs';
import { analyze, kindOf, tierOf, KINDS, money, baseOf, unitOf, josa } from './lib/els-analysis.mjs';

const A = await analyze(process.argv[2]);
const OUT = 'els-proposal.pptx';

// ── 미래에셋 팔레트 ─────────────────────────────────────────────────────────
const ORANGE = 'F58220', ACTIVE = 'CB6015', SOFT = 'FAB072', BLUE = '043B72';
const INK = '1A1A1A', BODY = '3D3D3D', MUTED = '6C6C6C', FAINT = '84888B';
const HAIR = 'CDCECB', SURF = 'F7F8FA', TINT = 'ECEFF4', WHITE = 'FFFFFF';
const BAD = 'C62828', WARN = '8A6A0B', OK = '2E8540';
const F = '맑은 고딕';                      // 한국 사무용 PC 표준

const W = 13.333, H = 7.5, M = 0.62, CW = W - M * 2;

const f1 = (v, d = 1) => v == null || Number.isNaN(v) ? '–' : v.toFixed(d);
const sgn = (v, d = 1) => v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d);
const won = (n) => n == null ? '–' : Math.round(n).toLocaleString('ko-KR');
const dot = (s) => (s || '').replace(/-/g, '.');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';                // 반드시 슬라이드 추가 전에
pres.author = '미래에셋증권';
pres.title = `제${A.items[0].no}~${A.items[A.items.length - 1].no}회 ELS 제안서`;

/** 절 제목 — 미래에셋 시그니처인 1px 오렌지 룰 위에 제목을 얹는다 */
function head(s, title, sub) {
  s.addShape(pres.ShapeType.rect, { x: M, y: 0.46, w: CW, h: 0.014, fill: { color: ORANGE }, line: { width: 0 } });
  s.addText(title, { x: M, y: 0.54, w: CW, h: 0.46, fontFace: F, fontSize: 24, bold: true, color: INK, margin: 0 });
  if (sub) s.addText(sub, { x: M, y: 1.0, w: CW, h: 0.34, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0 });
  return sub ? 1.44 : 1.14;
}

const slide = () => pres.addSlide();

// ══ 1. 표지 ════════════════════════════════════════════════════════════════
{
  const s = slide();
  s.background = { color: ORANGE };
  s.addText('MIRAE ASSET · ELS WEEKLY', {
    x: M, y: 1.5, w: 7.6, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: WHITE, charSpacing: 2, margin: 0,
  });
  s.addText(`제${A.items[0].no}~${A.items[A.items.length - 1].no}회\nELS 제안서`, {
    x: M, y: 1.9, w: 7.6, h: 1.9, fontFace: F, fontSize: 42, bold: true, color: WHITE, lineSpacing: 50, margin: 0,
  });
  s.addText(`투자설명서(일괄신고추가서류) ${A.filedOn} 공시 원문 기준 · 전 ${A.items.length}종 분석`, {
    x: M, y: 3.9, w: 7.6, h: 0.34, fontFace: F, fontSize: 14, color: WHITE, margin: 0,
  });

  s.addShape(pres.ShapeType.rect, { x: 8.7, y: 1.9, w: 4.0, h: 2.66, fill: { color: WHITE }, line: { width: 0 } });
  const P = A.plan;
  const box = [
    ['개인 일반투자자 청약', `${dot(P.start)} ~ ${dot(P.retailEnd)}`, ACTIVE, 17],
    ['전체 청약기간 (숙려 대상 아닌 경우)', `${dot(P.start)} ~ ${dot(P.end)}`, BODY, 14],
    ['발행일 / 만기', `${dot(A.head.issueDate)} / ${dot(A.head.maturityDate)}`, BODY, 14],
  ];
  box.forEach(([k, v, c, fs], i) => {
    s.addText(k, { x: 9.0, y: 2.1 + i * 0.84, w: 3.4, h: 0.24, fontFace: F, fontSize: 10, color: MUTED, margin: 0 });
    s.addText(v, { x: 9.0, y: 2.34 + i * 0.84, w: 3.4, h: 0.34, fontFace: F, fontSize: fs, bold: true, color: c, margin: 0 });
  });

  // 부제와 안내문 사이가 통째로 비어 추천 요약을 얹는다
  s.addShape(pres.ShapeType.rect, { x: M, y: 4.52, w: 7.6, h: 0.02, fill: { color: WHITE }, line: { width: 0 } });
  s.addText('이번 회차 추천', { x: M, y: 4.64, w: 7.6, h: 0.26, fontFace: F, fontSize: 11, bold: true, color: WHITE, charSpacing: 1, margin: 0 });
  A.slots.forEach((sl, i) => {
    s.addText([
      { text: `제${sl.pick.no}회`, options: { bold: true, fontSize: 15 } },
      { text: `  연 ${f1(sl.pick.annualRate)}%  ·  손실 ${f1(sl.pick.mcLoss)}%`, options: { fontSize: 12 } },
      { text: `\n${sl.label}`, options: { fontSize: 10.5 } },
    ], { x: M + i * 2.55, y: 4.96, w: 2.45, h: 0.62, fontFace: F, color: WHITE, valign: 'top', lineSpacing: 15, margin: 0 });
  });

  s.addText((A.onOfferNow === 0
    ? `홈페이지 확인 ${stamp(A.checkedAt)} — 현재 청약 진행중 0건. 이 회차는 ${A.offer[0]}부터 열립니다.`
    : `홈페이지 확인 ${stamp(A.checkedAt)} — 현재 청약 진행중 ${A.onOfferNow}건.`)
    + (A.plan.hasCooling ? `  개인 일반투자자 청약 마감은 ${dayLabel(A.plan.retailEnd)}입니다.` : ''), {
    x: M, y: 5.9, w: CW, h: 0.34, fontFace: F, fontSize: 12, color: WHITE, margin: 0,
  });
  s.addText('원금비보장 · 상품위험등급 1등급(매우높은위험) · 투자 권유 참고자료', {
    x: M, y: 6.26, w: CW, h: 0.3, fontFace: F, fontSize: 11, color: WHITE, margin: 0,
  });
  s.addNotes(`이번 회차 ${A.items.length}종. 청약 ${A.offer[0]}~${A.offer[1]}. 전부 원금비보장 1등급입니다.`);
}

function dayLabel(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일(${['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]})`;
}

function stamp(iso) {
  if (!iso) return '–';
  const d = new Date(new Date(iso).getTime() + 9 * 3600000);
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()];
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}(${dow}) `
       + `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

// ══ 1-A. 언제까지 청약해야 하나 ════════════════════════════════════════════
if (A.plan.hasCooling) {
  const P = A.plan;
  const s = slide();
  const y0 = head(s, '언제까지 청약해야 하나',
    `홈페이지와 공시 표지의 청약기간은 ${dot(P.start)}~${dot(P.end)}입니다. 그런데 개인 일반투자자는 그 뒤쪽 절반을 쓸 수 없습니다 — 숙려기간과 가입의사확인기간에는 청약 자체가 불가능합니다.`);

  const steps = [
    ['1단계', '청약 접수', `${dot(P.coolStart)} ~ ${dot(P.coolEnd)}`,
      `${dayLabel(P.coolStart)}~${dayLabel(P.coolEnd)} · ${P.retailDays}일`, '이때만 주문 가능', OK],
    ['2단계', '숙려기간', `${dot(P.coolingFrom)} ~ ${dot(P.coolingTo)}`,
      '2영업일 이상 · 최대 원금손실 가능금액을 고지받습니다', '청약 불가', BAD],
    ['3단계', '가입의사 확인', dot(P.confirmBy),
      `${P.confirmNote || ''} · 확인을 못 받으면 청약금은 환불됩니다`, '청약 불가', BAD],
    ['4단계', '발행', dot(P.payDate), '납입 · 배정 · 환불 · 최초기준가격 평가', '–', FAINT],
  ];
  const rh = 0.78;
  steps.forEach(([k, name, date, note, tag, tc], i) => {
    const y = y0 + i * (rh + 0.09);
    s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: rh,
      fill: { color: i === 0 ? 'F4F8F5' : tc === BAD ? 'FDF6F6' : WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(k, { x: M + 0.22, y, w: 0.7, h: rh, fontFace: F, fontSize: 10.5, color: FAINT, valign: 'middle', margin: 0 });
    s.addText(name, { x: M + 1.0, y, w: 1.7, h: rh, fontFace: F, fontSize: 15, bold: true, color: INK, valign: 'middle', margin: 0 });
    s.addText(date, { x: M + 2.76, y, w: 2.5, h: rh, fontFace: F, fontSize: 14, bold: true, color: INK, valign: 'middle', margin: 0 });
    s.addText(note, { x: M + 5.34, y, w: CW - 6.9, h: rh, fontFace: F, fontSize: 11.5, color: MUTED, valign: 'middle', lineSpacing: 15, margin: 0 });
    s.addShape(pres.ShapeType.rect, { x: M + CW - 1.44, y: y + 0.23, w: 1.24, h: 0.32,
      fill: { color: tc === FAINT ? SURF : tc }, line: { width: 0 } });
    s.addText(tag, { x: M + CW - 1.44, y: y + 0.23, w: 1.24, h: 0.32, fontFace: F, fontSize: 10.5, bold: true,
      color: tc === FAINT ? FAINT : WHITE, align: 'center', valign: 'middle', margin: 0 });
  });

  const by = y0 + 4 * (rh + 0.09) + 0.12;
  s.addShape(pres.ShapeType.rect, { x: M, y: by, w: CW, h: 0.74, fill: { color: TINT }, line: { width: 0 } });
  s.addText([
    { text: '상담에서 이렇게 말씀하십시오  ', options: { bold: true, color: INK } },
    { text: `"청약은 ${dayLabel(P.retailEnd)}까지 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 숙려기간이라 주문을 받을 수 없고, 숙려기간이 끝나면 저희가 다시 연락드려 최종 의사를 확인합니다. 그때 확인이 안 되면 청약이 집행되지 않습니다."` },
  ], { x: M + 0.22, y: by, w: CW - 0.44, h: 0.74, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
  s.addText(`전문투자자·법인 등 숙려제도 대상이 아닌 경우에만 ${dot(P.end)}까지 청약할 수 있습니다. 만 65세 이상 고령투자자는 별도 확인 절차가 더해질 수 있습니다.`, {
    x: M, y: by + 0.84, w: CW, h: 0.3, fontFace: F, fontSize: 10.5, color: FAINT, margin: 0,
  });
  s.addNotes(`마감일을 잘못 안내하면 고객이 청약 기회를 놓칩니다. 홈페이지의 ${dot(P.end)}이 아니라 ${dayLabel(P.retailEnd)}이 개인 일반투자자의 마감입니다.`);
}

// ══ 2. 이번 회차 한눈에 ════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '이번 회차 한눈에', `조건과 가격은 투자설명서 원문 그대로이고, 손실 확률은 두 가지 방법으로 각각 쟀습니다.`);
  const stats = [
    ['상품 수', `${A.items.length}종`, `지수형 ${A.byKind.find((r) => r.key === '지수')?.n ?? 0} · 혼합 ${A.byKind.find((r) => r.key === '혼합')?.n ?? 0} · 종목형 ${A.byKind.find((r) => r.key === '종목')?.n ?? 0}`],
    ['연 수익률', `${f1(A.rateMin)}~${f1(A.rateMax)}%`, `최고 제${A.items.find((i) => i.annualRate === A.rateMax).no}회`],
    ['만기', `${A.head.months}개월`, `${dot(A.head.maturityDate)} 만기`],
    ['등급 분포', A.tierCount.join(' / '), '방어적 / 중간 / 공격적'],
  ];
  const cw = (CW - 0.3 * 3) / 4;
  stats.forEach(([k, v, sub], i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 1.5, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(k, { x: x + 0.22, y: y0 + 0.18, w: cw - 0.44, h: 0.26, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0 });
    s.addText(v, { x: x + 0.18, y: y0 + 0.46, w: cw - 0.36, h: 0.62, fontFace: F, fontSize: 24, bold: true, color: BLUE, valign: 'middle', margin: 0 });
    s.addText(sub, { x: x + 0.22, y: y0 + 1.1, w: cw - 0.44, h: 0.3, fontFace: F, fontSize: 10.5, color: FAINT, margin: 0 });
  });

  const bullets = [
    `모두 원금비보장 1등급(매우높은위험) 상품입니다. 아래 등급은 안전하다는 뜻이 아니라 ${A.items.length}종끼리 견준 순서입니다.`,
    `같은 1만원이라도 출발 가치가 다릅니다. 가장 좋은 제${A.gapBest.no}회는 ${money(A.gapBest, A.gapBest.fairValue / 100)}, 가장 나쁜 제${A.gapWorst.no}회는 ${money(A.gapWorst, A.gapWorst.fairValue / 100)}입니다. 홈페이지 상품 목록에는 나오지 않는 차이입니다.`,
    `같은 조건으로 돌린 손실 확률은 이번 회차 평균 ${f1(A.mcAvgAll)}%입니다. 가장 낮은 제${A.safest[0].no}회 ${f1(A.safest[0].mcLoss)}%부터 가장 높은 제${A.safest[A.safest.length - 1].no}회 ${f1(A.safest[A.safest.length - 1].mcLoss)}%까지 벌어집니다.`,
    `기초자산에 종목이 섞이면 평균 손실 확률이 지수형의 ${f1(A.kindRatio)}배입니다. 다만 개별로는 뒤집히는 경우가 있어, 자산군이 아니라 상품별 손실 확률로 등급을 매겼습니다.`,
  ];
  s.addText(bullets.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < bullets.length - 1 } })), {
    x: M, y: y0 + 1.86, w: CW, h: 3.4, fontFace: F, fontSize: 14, color: BODY, valign: 'top', lineSpacing: 23, paraSpaceAfter: 14, margin: 0,
  });
  s.addNotes('등급은 안전 등급이 아니라 이번 회차 안에서의 상대 순서라는 점을 먼저 말씀하십시오.');
}

// ══ 3. 손실 확률을 두 가지로 잰다 ══════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '손실 확률을 어떻게 쟀나', '둘은 다른 질문에 답하며, 답이 크게 다릅니다. 어느 하나만 보면 상담에서 틀린 말을 하게 됩니다.');
  const panels = [
    { k: 'A. 발행사 20년 모의실험', q: `"지난 ${A.head.simYearsWhole}년이 그대로 되풀이된다면?"`, tag: '투자설명서',
      rows: [
        ['무엇', `${dot(A.head.simRange?.from ?? '')}~${dot(A.head.simRange?.to ?? '')} 매 영업일에 같은 상품을 새로 샀다고 가정 (제${A.head.no}회 ${A.head.simRuns?.toLocaleString('ko-KR')}회)`],
        ['강점', '실제로 있었던 가격 경로. 2008년 금융위기도 들어 있습니다.'],
        ['한계', '그 20년은 대체로 상승장이었고, 상품마다 표본 구간이 다릅니다. 표본 수가 다른 두 상품을 나란히 놓고 비교하면 안 됩니다.'],
      ] },
    { k: 'B. 같은 조건 모의실험', q: '"발행사가 가격 매길 때 쓴 변동성이 실제로 나타난다면?"', tag: '자체 계산',
      rows: [
        ['무엇', `${A.items.length}종 전부를 같은 경로 수(40,000회)·같은 기간·같은 판정 규칙으로. 변동성·상관계수는 투자설명서 값 그대로.`],
        ['강점', '표본 구간 차이가 사라져 전 상품을 정직하게 줄 세울 수 있습니다.'],
        ['한계', '기대수익률 0으로 두었고, 발행사가 쓴 내재변동성은 보통 실제보다 높습니다. 보수적인 상한으로 읽어야 합니다.'],
      ] },
  ];
  const pw = (CW - 0.34) / 2;
  panels.forEach((p, i) => {
    const x = M + i * (pw + 0.34);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: pw, h: 3.62, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(p.k, { x: x + 0.26, y: y0 + 0.2, w: pw - 1.6, h: 0.32, fontFace: F, fontSize: 15, bold: true, color: INK, margin: 0 });
    s.addShape(pres.ShapeType.rect, { x: x + pw - 1.34, y: y0 + 0.22, w: 1.08, h: 0.28, fill: { color: i ? BLUE : TINT }, line: { width: 0 } });
    s.addText(p.tag, { x: x + pw - 1.34, y: y0 + 0.22, w: 1.08, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: i ? WHITE : BLUE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(p.q, { x: x + 0.26, y: y0 + 0.56, w: pw - 0.52, h: 0.3, fontFace: F, fontSize: 12.5, bold: true, color: ACTIVE, margin: 0 });
    p.rows.forEach(([k, v], j) => {
      const ry = y0 + 0.98 + j * 0.86;
      s.addText(k, { x: x + 0.26, y: ry, w: 0.6, h: 0.26, fontFace: F, fontSize: 11, bold: true, color: BLUE, margin: 0 });
      s.addText(v, { x: x + 0.9, y: ry - 0.03, w: pw - 1.16, h: 0.8, fontFace: F, fontSize: 11.5, color: BODY, valign: 'top', lineSpacing: 16, margin: 0 });
    });
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 3.84, w: CW, h: 0.62, fill: { color: TINT }, line: { width: 0 } });
  s.addText([
    { text: '읽는 법  ', options: { bold: true, color: INK } },
    { text: '절대 수준은 A와 B 사이 어딘가입니다. 상품끼리 견줄 때는 B를, "그래서 얼마나 위험한가"를 가늠할 때는 A와 B를 함께 보십시오. 기대수익률을 0%에서 연 6%로 바꿔도 순위는 거의 그대로였습니다.' },
  ], { x: M + 0.26, y: y0 + 3.84, w: CW - 0.52, h: 0.62, fontFace: F, fontSize: 12, color: BODY, valign: 'middle', margin: 0 });
  s.addNotes('공시의 손실 확률을 그대로 "이 상품의 손실 확률"이라고 말하면 안 됩니다.');
}

// ══ 4. 종목이 섞이면 더 위험한가 ═══════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '종목이 섞이면 더 위험한가', '일반적으로 종목형 ELS가 지수형보다 위험하다고 봅니다. 이번 회차에서 그 말이 맞는지 B로 확인했습니다.');

  s.addChart(pres.ChartType.bar, [
    { name: '손실 확률(평균)', labels: A.byKind.map((r) => `${r.key}형 (${r.n}종)`), values: A.byKind.map((r) => +f1(r.loss, 1)) },
  ], {
    x: M, y: y0, w: 5.5, h: 3.9, barDir: 'col', barGapWidthPct: 60,
    chartColors: [BLUE, ORANGE, ACTIVE],
    varyColors: true,
    showTitle: true, title: '자산군별 손실 확률 (%)', titleFontFace: F, titleFontSize: 13, titleColor: INK,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: F, dataLabelFontSize: 12,
    dataLabelColor: INK, dataLabelFormatCode: '0.0"%"',
    showLegend: false,
    catAxisLabelFontFace: F, catAxisLabelFontSize: 11.5, catAxisLabelColor: BODY, catGridLine: { style: 'none' },
    valAxisLabelFontFace: F, valAxisLabelFontSize: 10, valAxisLabelColor: FAINT,
    valGridLine: { color: 'E5E4E1', size: 1 }, valAxisMaxVal: 35,
  });

  const rows = [[
    { text: '기초자산 종류', options: { bold: true, color: INK, fill: { color: SOFT } } },
    { text: '상품 수', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '적용 변동성', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '손실 확률', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '연 수익률', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
  ]];
  for (const r of A.byKind) {
    rows.push([
      { text: `${r.key}형`, options: { bold: true, color: INK } },
      { text: `${r.n}종`, options: { align: 'right', color: BODY } },
      { text: `${f1(r.vol)}%`, options: { align: 'right', color: BODY } },
      { text: `${f1(r.loss)}%`, options: { align: 'right', bold: true, color: r.key === '종목' ? BAD : r.key === '혼합' ? WARN : BLUE } },
      { text: `${f1(r.rate)}%`, options: { align: 'right', color: BODY } },
    ]);
  }
  s.addTable(rows, {
    x: 6.44, y: y0, w: CW - 5.82, colW: [1.70, 0.92, 1.32, 1.20, 1.13],
    fontFace: F, fontSize: 11.5, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
    rowH: 0.34, valign: 'middle', margin: 5,
  });

  const pts = [
    `평균으로는 맞습니다. 종목형 손실 확률이 지수형의 ${f1(A.kindRatio)}배, 적용 변동성은 ${f1(A.byKind.find((r) => r.key === '지수')?.vol, 0)}% 대 ${f1(A.byKind.find((r) => r.key === '종목')?.vol, 0)}%로 갈립니다.`,
    `개별 상품으로는 뒤집힙니다. 순수 지수형 제${A.idxWorst.no}회가 ${f1(A.idxWorst.mcLoss)}%로 종목형 대부분보다 위험하고, 제${A.stockBest.no}회는 ${f1(A.stockBest.mcLoss)}%로 ${A.items.length}종 중 ${A.safest.findIndex((i) => i.no === A.stockBest.no) + 1}번째로 낮습니다.`,
    `가른 것은 자산군이 아니라 낙인 깊이와 상관계수였습니다. 제${A.idxWorst.no}회는 낙인 ${A.idxWorst.knockIn}%(이번 회차 최저 쿠션)에 상관 ${f1(A.idxWorst.rho, 2)}, 제${A.stockBest.no}회는 낙인 ${A.stockBest.knockIn}%에 상관 ${f1(A.stockBest.rho, 2)}입니다.`,
  ];
  s.addText(pts.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < pts.length - 1 } })), {
    x: 6.44, y: y0 + 1.86, w: CW - 5.82, h: 3.0, fontFace: F, fontSize: 12.5, color: BODY, lineSpacing: 18, paraSpaceAfter: 12, margin: 0,
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 4.06, w: 5.5, h: 0.86, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText(`상관계수가 낮으면 "가장 많이 떨어진 하나"로 판정하는 구조에서 크게 불리해집니다. 자산군보다 이쪽이 결정적입니다.`, {
    x: M + 0.2, y: y0 + 4.06, w: 5.1, h: 0.86, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0,
  });
  s.addNotes('고객이 "종목형은 위험하지 않나요"라고 물으면 이 장을 펴십시오. 일반론은 맞고, 개별로는 확인이 필요하다는 답입니다.');
}

// ══ 5-7. 추천 3종 ══════════════════════════════════════════════════════════
A.slots.forEach((slot, idx) => {
  const it = slot.pick;
  const s = slide();
  const y0 = head(s, `추천 ${idx + 1} — ${slot.label}`, null);

  // 회차 · 기초자산 · 등급
  const CHIP0 = 2.92;                                   // "제38044회" 26pt 가 실제로 끝나는 지점 뒤
  s.addText(`제${it.no}회`, { x: M, y: y0, w: CHIP0 - M - 0.12, h: 0.5, fontFace: F, fontSize: 26, bold: true, color: INK, margin: 0 });
  const chips = [[tierOf(it).name, it.tier === 0 ? OK : it.tier === 1 ? WARN : BAD],
                 [`${kindOf(it)}형`, BLUE]].concat(it.currency !== 'KRW' ? [[it.currency, ACTIVE]] : []);
  chips.forEach(([t, c], i) => {
    const cx = CHIP0 + i * 1.02;
    const fx = c === ACTIVE;                            // 통화 칩은 반전해 눈에 띄게 (대비도 확보)
    s.addShape(pres.ShapeType.rect, { x: cx, y: y0 + 0.11, w: 0.94, h: 0.3, fill: { color: fx ? ACTIVE : TINT }, line: { width: 0 } });
    s.addText(t, { x: cx, y: y0 + 0.11, w: 0.94, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, color: fx ? WHITE : c, align: 'center', valign: 'middle', margin: 0 });
  });
  s.addText(`${it.underlyings.join(' · ')}  ·  ${it.months}개월  ·  ${it.every}개월마다 확인`, {
    x: M, y: y0 + 0.54, w: 7.4, h: 0.3, fontFace: F, fontSize: 13, color: MUTED, margin: 0,
  });

  // 큰 수익률
  s.addShape(pres.ShapeType.rect, { x: 9.3, y: y0 - 0.04, w: 3.42, h: 1.0, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText('연 수익률', { x: 9.52, y: y0 + 0.08, w: 3.0, h: 0.24, fontFace: F, fontSize: 10.5, color: MUTED, margin: 0 });
  s.addText([{ text: f1(it.annualRate), options: { fontSize: 34, bold: true, color: ORANGE } },
             { text: '%', options: { fontSize: 20, bold: true, color: ORANGE } }],
    { x: 9.52, y: y0 + 0.32, w: 3.0, h: 0.56, fontFace: F, margin: 0 });
  s.addText(`${baseOf(it)} → ${it.every}개월 뒤 ${money(it, it.schedule[0].payout)}`, {
    x: M, y: y0 + 0.92, w: 7.4, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INK, margin: 0,
  });

  // 4줄 구조 설명
  const how = [
    ['판정', it.underlyings.length === 1 ? `${it.underlyings[0]} 하나만 봅니다.`
      : `${it.underlyings.join(' · ')} 중 더 많이 떨어진 하나로 판정합니다.`],
    ['조기상환', `${it.every}개월마다 확인해서 처음 가격의 ${it.barriers[0]}% 이상(${sgn(it.barriers[0] - 100, 0)}% 이내)이면 그 자리에서 끝나고 ${baseOf(it)}${josa(baseOf(it), '이', '가')} ${money(it, it.schedule[0].payout)}${josa(unitOf(it), '이', '가')} 됩니다.`],
    ['원금', it.knockIn != null
      ? `만기까지 한 번도 ${it.knockIn}%(${sgn(it.knockIn - 100, 0)}%) 아래로 종가가 내려간 적이 없으면, 마지막에 얼마든 원금과 이자를 다 받습니다.`
      : `중간 하락은 따지지 않습니다. 만기 그날 ${it.maturityBarrier}% 이상이면 원금과 이자를 다 받습니다.`],
    ['손실', it.knockIn != null
      ? `${it.knockIn}% 아래를 밟은 적이 있고 만기에도 ${it.maturityBarrier}% 미만이면, 떨어진 만큼 그대로 손실입니다.`
      : `만기에 ${it.maturityBarrier}% 미만이면 떨어진 만큼 그대로 손실입니다.`],
  ];
  const hy = y0 + 1.34;
  how.forEach(([k, v], i) => {
    const y = hy + i * 0.5;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.86, h: 0.3, fill: { color: BLUE }, line: { width: 0 } });
    s.addText(k, { x: M, y, w: 0.86, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(v, { x: M + 1.02, y: y - 0.04, w: CW - 1.02, h: 0.42, fontFace: F, fontSize: 12, color: BODY, valign: 'middle', margin: 0 });
  });

  // 지표 4칸
  const stats = [
    [`A. 발행사 ${it.simYearsWhole}년 모의실험`, `손실 ${f1(it.simLoss, 2)}%`, `${it.simRuns?.toLocaleString('ko-KR')}회 중 ${Math.round((it.simLoss ?? 0) / 100 * (it.simRuns ?? 0))}회`],
    ['B. 같은 조건 모의실험', `손실 ${f1(it.mcLoss)}%`, `${A.items.length}종 평균 ${f1(A.mcAvgAll)}% · 낮은 쪽 ${A.safest.findIndex((x) => x.no === it.no) + 1}번째`],
    [`${baseOf(it)}의 출발 가치`, money(it, it.fairValue / 100), `공정가액 대비 ${sgn(it.fairValueGap, 2)}%`],
    ['적용 변동성 / 상관', `${f1(it.vmax)}%`, it.rho != null ? `기초자산끼리 ${f1(it.rho, 2)}` : '기초자산 하나'],
  ];
  const sy = hy + 2.14, sw = (CW - 0.24 * 3) / 4;
  stats.forEach(([k, v, sub], i) => {
    const x = M + i * (sw + 0.24);
    s.addShape(pres.ShapeType.rect, { x, y: sy, w: sw, h: 1.0, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
    s.addText(k, { x: x + 0.16, y: sy + 0.11, w: sw - 0.32, h: 0.24, fontFace: F, fontSize: 10, color: MUTED, margin: 0 });
    s.addText(v, { x: x + 0.16, y: sy + 0.35, w: sw - 0.32, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(sub, { x: x + 0.16, y: sy + 0.68, w: sw - 0.32, h: 0.26, fontFace: F, fontSize: 9.5, color: FAINT, margin: 0 });
  });

  // 추천 이유 + (종목이면) 반박 대응
  const fx = it.currency !== 'KRW'
    ? ` ${it.currency}로 투자하고 ${it.currency}로 돌려받는 상품이라, 위 수익률에 환율 변동이 그대로 더해지거나 빠집니다.` : '';
  s.addShape(pres.ShapeType.rect, { x: M, y: sy + 1.2, w: CW, h: 0.56, fill: { color: TINT }, line: { width: 0 } });
  s.addText([{ text: '추천 이유  ', options: { bold: true, color: INK } }, { text: slot.why + fx }], {
    x: M + 0.2, y: sy + 1.2, w: CW - 0.4, h: 0.56, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', margin: 0,
  });

  s.addNotes(kindOf(it) === '지수' ? '지수형이라 자산군 관련 반박은 없습니다.' : defence(it));
});

/** 종목이 섞인 상품을 권할 때 쓰는 상담용 답 — 지수형 평균보다 안전한 경우와 아닌 경우가 다르다 */
function defence(it) {
  const idxAvg = A.byKind.find((r) => r.key === '지수')?.loss;
  const stock = it.underlyings.filter((u) => !['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI'].includes(u)).join('·');
  const beats = A.items.filter((i) => kindOf(i) === '지수' && i.mcLoss > it.mcLoss).length;
  const idxN = A.items.filter((i) => kindOf(i) === '지수').length;
  const base = `"종목이 들어갔는데 괜찮나요?" → ${stock}${josa(stock, '이', '가')} 들어간 ${kindOf(it)}형이 맞고, 적용 변동성 ${f1(it.vmax)}%로 지수 평균(${f1(idxAvg === undefined ? null : A.byKind.find((r) => r.key === '지수').vol)}%)보다 높은 것도 맞습니다. `;
  return it.mcLoss <= idxAvg
    ? base + `다만 같은 조건 손실 확률은 ${f1(it.mcLoss)}%로 지수형 평균(${f1(idxAvg)}%)보다 낮고 순수 지수형 ${idxN}종 중 ${beats}종보다도 낮습니다. `
      + (it.rho >= 0.7 ? `상관계수 ${f1(it.rho, 2)}로 거의 같이 움직여 워스트오브 불이익이 거의 없고, 낙인이 ${it.knockIn}%로 깊습니다.` : `낙인이 ${it.knockIn}%로 깊습니다.`)
    : base + `손실 확률도 ${f1(it.mcLoss)}%로 지수형 평균(${f1(idxAvg)}%)보다 높습니다. 이 자리에 올린 이유는 안전해서가 아니라 대가가 크기 때문입니다 — `
      + `손실 확률 1%당 연 ${f1(A.perRisk(it), 2)}%로, 지수형 평균 ${f1(A.idxPerRisk, 2)}%의 ${f1(A.perRisk(it) / A.idxPerRisk)}배입니다. `
      + `원금 보전이 최우선인 분께는 추천 1번을 권하십시오.`;
}

// ══ 8. 전체 17종 ═══════════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, `이번 회차 전체 ${A.items.length}종`,
    '같은 조건으로 돌린 손실 확률(B)이 낮은 순서. A 옆 괄호는 그 상품의 표본 구간 길이 — 10년에 못 미치면(빨강) 다른 상품과 나란히 비교할 수 없습니다. "만기만" = 낙인이 없어 만기 그날만 봅니다.');
  const hdr = ['회차', '기초자산', '종류', '연 수익률', '조기상환', '원금 지키는 선', '적용 변동성', 'B. 손실 확률', 'A. 공시 손실', '출발 가치'];
  const rows = [hdr.map((t, i) => ({
    text: t, options: { bold: true, color: INK, fill: { color: SOFT }, align: i >= 3 ? 'right' : 'left' },
  }))];
  for (const it of [...A.items].sort((a, b) => (a.mcLoss ?? 99) - (b.mcLoss ?? 99))) {
    rows.push([
      { text: `제${it.no}회`, options: { bold: true, color: INK } },
      { text: it.underlyings.join(' · ') + (it.currency !== 'KRW' ? ` (${it.currency})` : ''), options: { color: BODY } },
      { text: kindOf(it), options: { color: kindOf(it) === '종목' ? BAD : kindOf(it) === '혼합' ? WARN : BLUE } },
      { text: `${f1(it.annualRate)}%`, options: { align: 'right', bold: true, color: INK } },
      { text: `${it.every}개월 / ${it.barriers[0]}%`, options: { align: 'right', color: BODY } },
      { text: `${it.floor}%${it.knockIn == null ? ' (만기만)' : ''}`, options: { align: 'right', color: BODY } },
      { text: `${f1(it.vmax)}%`, options: { align: 'right', color: BODY } },
      { text: `${f1(it.mcLoss)}%`, options: { align: 'right', bold: true, color: it.mcLoss > 25 ? BAD : it.mcLoss > 15 ? WARN : BLUE } },
      { text: `${f1(it.simLoss, 2)}%  (${it.simShort ? f1(it.simYears) : it.simYearsWhole}년)`, options: { align: 'right', color: it.simShort ? BAD : BODY } },
      { text: money(it, it.fairValue / 100), options: { align: 'right', color: (it.fairValueGap ?? 0) <= -10 ? BAD : (it.fairValueGap ?? 0) <= -5 ? WARN : BODY } },
    ]);
  }
  s.addTable(rows, {
    x: M, y: y0, w: CW, colW: [0.88, 2.85, 0.58, 0.92, 1.12, 1.22, 1.0, 1.1, 1.4, 1.02],
    fontFace: F, fontSize: 9, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
    rowH: 0.24, valign: 'middle', margin: 2, autoPage: false,
  });
}

// ══ 9. 권하지 않는 상품 ════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '이번 주 권하지 않는 상품', '수익률만 보면 눈에 띄지만, 손실 확률이나 가격에서 대가를 치르고 있습니다. 손실 확률이 높은 순서입니다.');
  const reasons = (it) => {
    const r = [];
    if (it.mcLoss > 25) r.push(`같은 조건으로 돌리면 100번 중 ${f1(it.mcLoss, 0)}번이 손실 (회차 평균 ${f1(A.mcAvgAll, 0)}번)`);
    if ((it.fairValueGap ?? 0) <= -10) r.push(`${baseOf(it)}${josa(baseOf(it), '을', '를')} 넣는 순간의 가치가 ${money(it, it.fairValue / 100)}`);
    if (it.simShort) r.push(`공시 모의실험 표본이 ${f1(it.simYears)}년(${it.simRuns?.toLocaleString('ko-KR')}회)뿐 — 큰 하락장이 표본에 없어 손실 ${f1(it.simLoss, 2)}%를 20년짜리와 견줄 수 없음`);
    if (it.vmax >= 90) r.push(`적용 변동성 ${f1(it.vmax, 0)}% — 이번 회차 최고 축`);
    // 같은 기초자산인데 수익률이 더 높으면서 손실 확률까지 낮은 상품이 있으면 그쪽을 가리킨다
    const key = (x) => [...x.underlyings].sort().join('|');
    const better = A.items.filter((x) => x.no !== it.no && key(x) === key(it)
      && x.annualRate >= it.annualRate && x.mcLoss < it.mcLoss)
      .sort((a, b) => a.mcLoss - b.mcLoss)[0];
    if (better) r.push(`같은 기초자산인 제${better.no}회가 수익률은 더 높고(연 ${f1(better.annualRate)}%) 손실 확률은 더 낮습니다(${f1(better.mcLoss)}%) — ${it.every}개월마다 보는 이 상품과 달리 ${better.every}개월마다 상환 기회가 옵니다`);
    return r.slice(0, 3);
  };
  const cw = (CW - 0.26 * 3) / 4;
  A.caution.forEach((it, i) => {
    const x = M + i * (cw + 0.26);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 3.5, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(`제${it.no}회`, { x: x + 0.2, y: y0 + 0.22, w: cw - 0.4, h: 0.34, fontFace: F, fontSize: 17, bold: true, color: INK, margin: 0 });
    s.addText(it.underlyings.join(' · '), { x: x + 0.2, y: y0 + 0.58, w: cw - 0.4, h: 0.52, fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 15, margin: 0 });
    s.addText([{ text: `연 ${f1(it.annualRate)}%`, options: { bold: true, color: ACTIVE } },
               { text: `   손실 ${f1(it.mcLoss)}%`, options: { bold: true, color: BAD } }],
      { x: x + 0.2, y: y0 + 1.14, w: cw - 0.4, h: 0.3, fontFace: F, fontSize: 13, margin: 0 });
    const rs = reasons(it);
    s.addText(rs.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < rs.length - 1 } })), {
      x: x + 0.2, y: y0 + 1.52, w: cw - 0.4, h: 1.86, fontFace: F, fontSize: 10.5, color: BODY, valign: 'top', lineSpacing: 15, paraSpaceAfter: 9, margin: 0,
    });
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 3.76, w: CW, h: 0.88, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText([
    { text: '거르는 기준  ', options: { bold: true, color: INK } },
    { text: `① 같은 조건 손실 확률이 25%를 넘거나  ② ${baseOf(A.head)} 기준 출발 가치가 공정가액보다 10% 넘게 깎였거나  ③ 발행사 모의실험 표본이 10년에 못 미쳐 다른 상품과 비교할 수 없는 경우. 셋 중 하나라도 걸리면 이 자리로 내립니다. 수익률이 높아 먼저 눈에 띄는 상품들이라, 상담 전에 걸러두는 편이 낫습니다.` },
  ], { x: M + 0.22, y: y0 + 3.76, w: CW - 0.44, h: 0.88, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
}

// ══ 10. 가입 전 꼭 짚어드릴 것 ═════════════════════════════════════════════
{
  const s = slide();
  const chk = [
    ...(A.plan.hasCooling ? [[`청약 마감은 ${dayLabel(A.plan.retailEnd)}입니다`,
      `홈페이지에는 ${dot(A.plan.start)}~${dot(A.plan.end)}로 나오지만 개인 일반투자자는 ${dayLabel(A.plan.retailEnd)}까지만 청약할 수 있습니다. 이후는 숙려·가입의사확인 기간이라 주문을 받을 수 없습니다.`]] : []),
    [`${baseOf(A.head)}이 ${baseOf(A.head)}이 아닙니다`,
      `공정가액이 ${money(A.gapBest, A.gapBest.fairValue / 100)}부터 ${money(A.gapWorst, A.gapWorst.fairValue / 100)}까지 벌어집니다(각 액면 1만 단위). 게다가 만기까지의 헤지비용은 빠진 값입니다.`],
    ['중간에 깨면 손해입니다',
      '중도상환은 그 시점 공정가액의 95%(가입 6개월 안이면 90%). 3년을 묻어둘 수 있는 돈으로만 하셔야 합니다.'],
    ['판정은 종가로 합니다',
      '장중에 잠깐 뚫어도 종가가 위면 괜찮고, 종가가 한 번이라도 아래면 그걸로 기록이 남습니다.'],
    ['손실 확률 숫자를 그대로 옮기지 마십시오',
      `공시의 손실 확률은 "지난 ${A.head.simYearsWhole}년이 되풀이된다면"의 답입니다. 추천 1번 제${A.slots[0].pick.no}회도 공시로는 ${f1(A.slots[0].pick.simLoss, 2)}%지만 같은 조건으로 다시 돌리면 ${f1(A.slots[0].pick.mcLoss)}%입니다.`],
    ...(A.plan.recordingRight ? [['판매 과정은 녹취됩니다',
      `개인 일반투자자는 녹취 자료를 요청할 수 있고, 투자 위험을 요약한 설명서를 받습니다.${A.plan.maxLossNotice ? ' 최대 원금손실 가능금액은 숙려기간 중에 따로 고지됩니다.' : ''} 설명을 건너뛰면 그대로 기록에 남습니다.`]] : []),
  ];
  const NUM = ['한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟'];
  const y0 = head(s, '가입 전 꼭 짚어드릴 것', `상담에서 이 ${NUM[chk.length - 1] || chk.length} 가지를 빠뜨리면 나중에 문제가 됩니다.`);
  const cols = 3, cw = (CW - 0.26 * (cols - 1)) / cols, ch = 1.62;
  chk.forEach(([k, v], i) => {
    const x = M + (i % cols) * (cw + 0.26), y = y0 + Math.floor(i / cols) * (ch + 0.24);
    const first = A.plan.hasCooling && i === 0;                 // 마감일 칸은 눈에 띄어야 한다
    s.addShape(pres.ShapeType.rect, { x, y, w: cw, h: ch,
      fill: { color: first ? 'FDF6F6' : SURF }, line: { color: first ? BAD : HAIR, width: 1 } });
    s.addText(`${i + 1}`, { x: x + 0.2, y: y + 0.14, w: 0.4, h: 0.3, fontFace: F, fontSize: 15, bold: true,
      color: first ? BAD : FAINT, margin: 0 });
    s.addText(k, { x: x + 0.6, y: y + 0.14, w: cw - 0.8, h: 0.56, fontFace: F, fontSize: 13.5, bold: true,
      color: first ? BAD : INK, valign: 'top', lineSpacing: 17, margin: 0 });
    s.addText(v, { x: x + 0.2, y: y + 0.76, w: cw - 0.4, h: ch - 0.9, fontFace: F, fontSize: 11,
      color: BODY, valign: 'top', lineSpacing: 15, margin: 0 });
  });
  s.addNotes('1번은 이번 주에만 해당하는 이야기가 아니라 매 회차 반복됩니다. 마감일을 잘못 안내하면 고객이 청약 기회를 놓칩니다.');
}

// ══ 11. 상담 순서 ══════════════════════════════════════════════════════════
{
  const s = slide();
  const it0 = A.slots[0].pick;
  const y0 = head(s, '상담 시 이 순서로 말씀하시면 됩니다', `추천 1번 제${it0.no}회 기준입니다. 다른 상품이면 회차·기간·낙인 숫자만 바꾸십시오.`);
  const script = [
    ...(A.plan.hasCooling ? [`"먼저 일정부터 말씀드리면, 청약은 ${dayLabel(A.plan.retailEnd)}까지 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 숙려기간이라 주문을 받을 수 없습니다."`] : []),
    `"이 상품은 3년짜리인데, ${it0.every}개월마다 끝날 기회가 옵니다. 대부분은 첫 번째에 끝났습니다."`,
    `"${it0.underlyings.join(' · ')} 중 더 많이 떨어진 하나로 판정합니다."`,
    '"올라야 버는 게 아니라, 많이 안 떨어지면 버는 구조입니다."',
    `"대신 ${it0.knockIn ?? it0.maturityBarrier}% 아래로 크게 떨어지면 그 하락률이 그대로 손실로 옵니다. 원금이 보장되지 않습니다."`,
    `"과거 ${it0.simYearsWhole}년으로 보면 손실은 ${f1(it0.simLoss, 2)}%였지만 그 구간이 좋았던 덕도 있습니다. 보수적으로는 ${f1(it0.mcLoss, 0)}% 정도로 봅니다."`,
    '"3년 동안 안 쓸 돈인지 먼저 확인해 주세요. 중간에 빼면 그날 평가금액의 95%만 받습니다."',
    ...(A.plan.hasCooling ? [`"청약을 넣으셔도 바로 확정되는 게 아닙니다. 이틀 숙려기간을 거친 뒤 저희가 다시 연락드려 최종 의사를 확인합니다. 그때 확인이 안 되면 청약금은 ${dot(A.plan.payDate)}에 돌려드립니다."`] : []),
  ];
  const rh = 0.5;
  script.forEach((t, i) => {
    const y = y0 + i * (rh + 0.06);
    s.addShape(pres.ShapeType.rect, { x: M, y: y + 0.06, w: 0.38, h: 0.38, fill: { color: BLUE }, line: { width: 0 } });
    s.addText(String(i + 1), { x: M, y: y + 0.06, w: 0.38, h: 0.38, fontFace: F, fontSize: 11, bold: true,
      color: WHITE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(t, { x: M + 0.56, y, w: CW - 0.56, h: rh, fontFace: F, fontSize: 12.5, color: BODY,
      valign: 'middle', lineSpacing: 17, margin: 0 });
  });
  const qy = y0 + script.length * (rh + 0.06) + 0.14;
  s.addShape(pres.ShapeType.rect, { x: M, y: qy, w: CW, h: 0.76, fill: { color: TINT }, line: { width: 0 } });
  s.addText([
    { text: '"종목이 들어간 건 더 위험하지 않나요?"  ', options: { bold: true, color: INK } },
    { text: `→ "맞습니다. 이번 회차도 종목형 평균 손실 확률이 지수형의 ${f1(A.kindRatio)}배입니다. 다만 제${it0.no}회는 두 기초자산이 상관계수 ${f1(it0.rho, 2)}로 거의 같이 움직이고 낙인이 ${it0.knockIn}%로 깊어서, 같은 기준으로 재면 지수형 대부분보다 오히려 낮게 나옵니다."` },
  ], { x: M + 0.22, y: qy, w: CW - 0.44, h: 0.76, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
}

// ══ 꼬리말 — 표지 빼고 전 장 ═══════════════════════════════════════════════
pres.slides.forEach((s, i) => {
  if (i === 0) return;
  s.addText(`출처 — 금융감독원 전자공시시스템 일괄신고추가서류 접수번호 ${A.rcp} (${A.filedOn} 공시)  ·  원금 손실이 발생할 수 있는 상품입니다`, {
    x: M, y: H - 0.42, w: CW - 0.7, h: 0.26, fontFace: F, fontSize: 8.5, color: FAINT, margin: 0,
  });
  s.addText(String(i + 1), { x: W - M - 0.6, y: H - 0.42, w: 0.6, h: 0.26, fontFace: F, fontSize: 9, color: FAINT, align: 'right', margin: 0 });
});

await pres.writeFile({ fileName: OUT });
console.log(`${OUT} — ${pres.slides.length}장, 제${A.items[0].no}~${A.items[A.items.length - 1].no}회 `
  + `추천 ${A.slots.map((s) => s.pick.no).join('/')}`);
