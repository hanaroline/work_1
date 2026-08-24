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
import { analyze, kindOf, tierOf, KINDS, TIER_RULE, money, baseOf, unitOf, josa } from './lib/els-analysis.mjs';

const A = await analyze(process.argv[2]);
const OUT = 'els-proposal.pptx';

// ── 미래에셋 팔레트 ─────────────────────────────────────────────────────────
const ORANGE = 'F58220', ACTIVE = 'CB6015', SOFT = 'FAB072', BLUE = '043B72';
const INK = '1A1A1A', BODY = '3D3D3D', MUTED = '6C6C6C', FAINT = '84888B';
const HAIR = 'CDCECB', SURF = 'F7F8FA', TINT = 'ECEFF4', WHITE = 'FFFFFF';
const BAD = 'C62828', WARN = '8A6A0B', OK = '2E8540';
const TIER_INK = [OK, WARN, BAD];                       // 방어적 / 중간 / 공격적 — HTML 칩과 같은 색
const TIER_BG = ['E7F1E9', 'FBF2DC', 'FAE7E7'];
const F = '맑은 고딕';                      // 한국 사무용 PC 표준

const W = 13.333, H = 7.5, M = 0.62, CW = W - M * 2;

const f1 = (v, d = 1) => v == null || Number.isNaN(v) ? '–' : v.toFixed(d);
const sgn = (v, d = 1) => v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d);
const won = (n) => n == null ? '–' : Math.round(n).toLocaleString('ko-KR');
const dot = (s) => (s || '').replace(/-/g, '.');
const avgLossOf = (kind) => {
  const g = A.items.filter((i) => kindOf(i) === kind && i.mcAvgLoss != null);
  return g.length ? Math.abs(g.reduce((s, i) => s + i.mcAvgLoss, 0) / g.length) : null;
};

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
  s.addText(`${A.filedOn}에 공시된 투자설명서 원문을 그대로 읽어 ${A.items.length}종 전부를 견줬습니다`, {
    x: M, y: 3.9, w: 7.6, h: 0.34, fontFace: F, fontSize: 14, color: WHITE, margin: 0,
  });

  s.addShape(pres.ShapeType.rect, { x: 8.7, y: 1.9, w: 4.0, h: 2.66, fill: { color: WHITE }, line: { width: 0 } });
  const P = A.plan;
  const box = [
    ['개인 고객이 넣을 수 있는 기간', `${dot(P.start)} ~ ${dot(P.retailEnd)}`, ACTIVE, 17],
    ['서류에 적힌 청약기간 (법인·전문투자자 기준)', `${dot(P.start)} ~ ${dot(P.end)}`, BODY, 14],
    ['시작하는 날 / 끝나는 날', `${dot(A.head.issueDate)} / ${dot(A.head.maturityDate)}`, BODY, 14],
  ];
  box.forEach(([k, v, c, fs], i) => {
    s.addText(k, { x: 9.0, y: 2.1 + i * 0.84, w: 3.4, h: 0.24, fontFace: F, fontSize: 10, color: MUTED, margin: 0 });
    s.addText(v, { x: 9.0, y: 2.34 + i * 0.84, w: 3.4, h: 0.34, fontFace: F, fontSize: fs, bold: true, color: c, margin: 0 });
  });

  // 부제와 안내문 사이가 통째로 비어 추천 요약을 얹는다
  s.addShape(pres.ShapeType.rect, { x: M, y: 4.52, w: 7.6, h: 0.02, fill: { color: WHITE }, line: { width: 0 } });
  s.addText('이번 주 추천', { x: M, y: 4.64, w: 7.6, h: 0.26, fontFace: F, fontSize: 11, bold: true, color: WHITE, charSpacing: 1, margin: 0 });
  A.slots.forEach((sl, i) => {
    s.addText([
      { text: `제${sl.pick.no}회`, options: { bold: true, fontSize: 15 } },
      { text: `  연 ${f1(sl.pick.annualRate)}%  ·  손해 볼 가능성 ${f1(sl.pick.mcLoss)}%`, options: { fontSize: 12 } },
      { text: `\n${sl.label}`, options: { fontSize: 10.5 } },
    ], { x: M + i * 2.55, y: 4.96, w: 2.45, h: 0.62, fontFace: F, color: WHITE, valign: 'top', lineSpacing: 15, margin: 0 });
  });

  s.addText((A.onOfferNow === 0
    ? `홈페이지 확인 ${stamp(A.checkedAt)} — 지금 청약 중인 상품 0건. 이 회차는 ${A.offer[0]}부터 열립니다.`
    : `홈페이지 확인 ${stamp(A.checkedAt)} — 지금 청약 중인 상품 ${A.onOfferNow}건.`)
    + (A.plan.hasCooling ? `  개인 고객 신청 마감은 ${dayLabel(A.plan.retailEnd)}입니다.` : ''), {
    x: M, y: 5.9, w: CW, h: 0.34, fontFace: F, fontSize: 12, color: WHITE, margin: 0,
  });
  s.addText('원금을 잃을 수 있는 상품 · 위험등급 1등급(가장 위험) · 투자 권유 참고자료', {
    x: M, y: 6.26, w: CW, h: 0.3, fontFace: F, fontSize: 11, color: WHITE, margin: 0,
  });
  s.addNotes(`이번 주 ${A.items.length}종. 신청 ${A.offer[0]}~${A.offer[1]}. 전부 원금을 잃을 수 있는 1등급 상품입니다.`);
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
  const y0 = head(s, '언제까지 신청해야 하나',
    `홈페이지와 서류에 적힌 청약기간은 ${dot(P.start)}~${dot(P.end)}입니다. 그런데 개인 고객은 그 뒤쪽 절반을 쓸 수 없습니다 — 뒤쪽은 다시 한 번 생각해 보시라고 법이 비워 둔 기간이라 주문 자체를 받을 수 없습니다.`);

  const steps = [
    ['1단계', '신청 받는 날', `${dot(P.coolStart)} ~ ${dot(P.coolEnd)}`,
      `${dayLabel(P.coolStart)}~${dayLabel(P.coolEnd)} · ${P.retailDays}일`, '이때만 주문 가능', OK],
    ['2단계', '다시 생각하는 기간', `${dot(P.coolingFrom)} ~ ${dot(P.coolingTo)}`,
      '법으로 정해진 2영업일 이상(숙려기간) · "최대 얼마까지 잃을 수 있는지"를 따로 알려드립니다', '주문 못 받음', BAD],
    ['3단계', '정말 하실 건지 확인', dot(P.confirmBy),
      `${P.confirmNote || ''} · 이때 확인이 안 되면 넣으신 돈은 돌려드립니다`, '주문 못 받음', BAD],
    ['4단계', '상품 시작', dot(P.payDate), `돈이 빠져나가고, 이날 종가가 앞으로 ${A.head.months}개월의 "처음 가격"이 됩니다`, '–', FAINT],
  ];
  const rh = 0.78;
  steps.forEach(([k, name, date, note, tag, tc], i) => {
    const y = y0 + i * (rh + 0.09);
    s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: rh,
      fill: { color: i === 0 ? 'F4F8F5' : tc === BAD ? 'FDF6F6' : WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(k, { x: M + 0.22, y, w: 0.7, h: rh, fontFace: F, fontSize: 10.5, color: FAINT, valign: 'middle', margin: 0 });
    s.addText(name, { x: M + 1.0, y, w: 1.72, h: rh, fontFace: F, fontSize: 13, bold: true, color: INK, valign: 'middle', margin: 0 });
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
    { text: `"신청은 ${dayLabel(P.retailEnd)}까지 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 '다시 생각하는 기간'이라 주문을 받을 수 없고, 그 기간이 끝나면 저희가 다시 연락드려 정말 하실 건지 확인합니다. 그때 연락이 닿지 않으면 신청이 그대로 취소됩니다."` },
  ], { x: M + 0.22, y: by, w: CW - 0.44, h: 0.74, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
  s.addText(`법인이나 전문투자자처럼 이 제도의 대상이 아닌 경우에만 ${dot(P.end)}까지 신청할 수 있습니다. 만 65세 이상이시면 확인 절차가 하나 더 붙습니다.`, {
    x: M, y: by + 0.84, w: CW, h: 0.3, fontFace: F, fontSize: 10.5, color: FAINT, margin: 0,
  });
  s.addNotes(`마감일을 잘못 안내하면 고객이 기회를 놓칩니다. 홈페이지의 ${dot(P.end)}이 아니라 ${dayLabel(P.retailEnd)}이 개인 고객의 마감입니다.`);
}

// ══ 2. 이번 회차 한눈에 ════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '이번 주 상품, 한눈에', `조건과 값어치는 투자설명서에 적힌 그대로이고, 손해 볼 가능성은 두 가지 방법으로 각각 쟀습니다.`);
  const stats = [
    ['상품 수', `${A.items.length}종`, `지수만 ${A.byKind.find((r) => r.key === '지수')?.n ?? 0} · 섞임 ${A.byKind.find((r) => r.key === '혼합')?.n ?? 0} · 개별 종목 ${A.byKind.find((r) => r.key === '종목')?.n ?? 0}`],
    ['잘 되면 연 수익률', `${f1(A.rateMin)}~${f1(A.rateMax)}%`, `제일 높은 건 제${A.items.find((i) => i.annualRate === A.rateMax).no}회`],
    ['돈이 묶이는 기간', `최장 ${A.head.months}개월`, `${dot(A.head.maturityDate)}까지 · 중간에 끝날 수 있음`],
    ['이 문서가 매긴 등급', A.tierCount.join(' / '), '방어적 / 중간 / 공격적'],
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
    `${A.items.length}종 전부 원금을 잃을 수 있는 상품이고, 위험등급도 가장 높은 1등급입니다. 이 문서가 붙인 등급은 안전하다는 뜻이 아니라 ${A.items.length}종끼리 줄 세운 순서입니다.`,
    `같은 1만원을 넣어도 실제 값어치가 다릅니다. 가장 좋은 제${A.gapBest.no}회는 ${money(A.gapBest, A.gapBest.fairValue / 100)}, 가장 나쁜 제${A.gapWorst.no}회는 ${money(A.gapWorst, A.gapWorst.fairValue / 100)}입니다. 홈페이지 상품 목록에는 나오지 않는 차이입니다.`,
    `컴퓨터로 다시 돌린 손해 볼 가능성은 이번 주 평균 ${f1(A.mcAvgAll)}%입니다. 가장 낮은 제${A.safest[0].no}회 ${f1(A.safest[0].mcLoss)}%부터 가장 높은 제${A.safest[A.safest.length - 1].no}회 ${f1(A.safest[A.safest.length - 1].mcLoss)}%까지 벌어집니다.`,
    `개별 종목이 섞이면 손해 볼 가능성이 지수만 담은 상품의 ${f1(A.kindRatio)}배입니다. 다만 상품 하나하나로 보면 뒤집히는 경우가 있어, 자산 종류가 아니라 상품별 가능성으로 등급을 매겼습니다.`,
  ];
  s.addText(bullets.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < bullets.length - 1 } })), {
    x: M, y: y0 + 1.86, w: CW, h: 3.4, fontFace: F, fontSize: 14, color: BODY, valign: 'top', lineSpacing: 23, paraSpaceAfter: 14, margin: 0,
  });
  s.addNotes('등급은 안전 등급이 아니라 이번 회차 안에서의 상대 순서라는 점을 먼저 말씀하십시오.');
}

// ══ 3. 손실 확률을 두 가지로 잰다 ══════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '손해 볼 가능성, 두 가지로 쟀습니다', '서로 다른 질문에 답하는 숫자라 값도 꽤 다릅니다. 하나만 보고 말씀드리면 틀린 안내가 됩니다.');
  const panels = [
    { k: 'A. 회사가 과거로 돌려본 결과', q: `"지난 ${A.head.simYearsWhole}년이 그대로 되풀이된다면?"`, tag: '투자설명서',
      rows: [
        ['무엇', `${dot(A.head.simRange?.from ?? '')}~${dot(A.head.simRange?.to ?? '')} 사이 매일 하루도 빠짐없이 가입했다고 치고 계산 (제${A.head.no}회 ${A.head.simRuns?.toLocaleString('ko-KR')}번)`],
        ['좋은 점', '지어낸 값이 아니라 실제로 있었던 가격입니다. 2008년 금융위기도 들어 있습니다.'],
        ['조심', `그 ${A.head.simYearsWhole}년은 대체로 오르는 장이었고, 상품마다 돌려본 기간도 다릅니다. 기간이 다른 두 상품을 나란히 놓고 비교하면 안 됩니다.`],
      ] },
    { k: 'B. 컴퓨터로 다시 돌린 결과', q: '"회사가 값 매길 때 잡은 만큼 실제로 출렁인다면?"', tag: '직접 계산',
      rows: [
        ['무엇', `${A.items.length}종 전부를 똑같은 횟수(40,000번)·똑같은 기간·똑같은 규칙으로. 출렁임과 같이 움직이는 정도는 투자설명서 값 그대로.`],
        ['좋은 점', '기간 차이가 없어져서 전 상품을 공평하게 줄 세울 수 있습니다.'],
        ['조심', '어느 자산도 오른다고 보지 않았고, 회사가 쓴 출렁임 수치는 실제보다 크게 잡히는 게 보통입니다. 넉넉하게 잡은 최대치로 읽으셔야 합니다.'],
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
    { text: '진짜 값은 A와 B 사이 어딘가입니다. 상품끼리 견줄 때는 B를, "그래서 얼마나 위험하냐"를 가늠할 때는 A와 B를 같이 보십시오. "자산이 해마다 6%씩 오른다"고 바꿔 돌려도 순서는 거의 그대로였습니다.' },
  ], { x: M + 0.26, y: y0 + 3.84, w: CW - 0.52, h: 0.62, fontFace: F, fontSize: 12, color: BODY, valign: 'middle', margin: 0 });
  s.addNotes('서류에 적힌 손실 숫자를 그대로 "이 상품의 손실 확률"이라고 말하면 안 됩니다.');
}

// ══ 4. 종목이 섞이면 더 위험한가 ═══════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '개별 종목이 섞이면 더 위험한가', '보통 개별 종목이 들어간 ELS가 지수만 담은 것보다 위험하다고 봅니다. 이번 주 상품에서 그 말이 맞는지 B로 확인했습니다.');
  const KIND_LABEL = { 지수: '지수만', 혼합: '지수 + 종목', 종목: '개별 종목만' };

  s.addChart(pres.ChartType.bar, [
    { name: '손해 볼 가능성(평균)', labels: A.byKind.map((r) => `${KIND_LABEL[r.key] || r.key} (${r.n}종)`), values: A.byKind.map((r) => +f1(r.loss, 1)) },
  ], {
    x: M, y: y0, w: 5.5, h: 3.9, barDir: 'col', barGapWidthPct: 60,
    chartColors: [BLUE, ORANGE, ACTIVE],
    varyColors: true,
    showTitle: true, title: '무엇을 담았느냐에 따른 손해 볼 가능성 (%)', titleFontFace: F, titleFontSize: 13, titleColor: INK,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: F, dataLabelFontSize: 12,
    dataLabelColor: INK, dataLabelFormatCode: '0.0"%"',
    showLegend: false,
    catAxisLabelFontFace: F, catAxisLabelFontSize: 11.5, catAxisLabelColor: BODY, catGridLine: { style: 'none' },
    valAxisLabelFontFace: F, valAxisLabelFontSize: 10, valAxisLabelColor: FAINT,
    valGridLine: { color: 'E5E4E1', size: 1 }, valAxisMaxVal: 35,
  });

  const rows = [[
    { text: '무엇이 기준인가', options: { bold: true, color: INK, fill: { color: SOFT } } },
    { text: '상품 수', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '가격 출렁임', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '손해 볼 가능성', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
    { text: '연 수익률', options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' } },
  ]];
  for (const r of A.byKind) {
    rows.push([
      { text: KIND_LABEL[r.key] || r.key, options: { bold: true, color: INK } },
      { text: `${r.n}종`, options: { align: 'right', color: BODY } },
      { text: `${f1(r.vol)}%`, options: { align: 'right', color: BODY } },
      { text: `${f1(r.loss)}%`, options: { align: 'right', bold: true, color: r.key === '종목' ? BAD : r.key === '혼합' ? WARN : BLUE } },
      { text: `${f1(r.rate)}%`, options: { align: 'right', color: BODY } },
    ]);
  }
  s.addTable(rows, {
    x: 6.44, y: y0, w: CW - 5.82, colW: [1.70, 0.86, 1.18, 1.40, 1.13],
    fontFace: F, fontSize: 11.5, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
    rowH: 0.34, valign: 'middle', margin: 5,
  });

  const pts = [
    `평균으로 보면 맞는 말입니다. 개별 종목만 담은 상품이 지수만 담은 것의 ${f1(A.kindRatio)}배이고, 가격 출렁임도 ${f1(A.byKind.find((r) => r.key === '지수')?.vol, 0)}% 대 ${f1(A.byKind.find((r) => r.key === '종목')?.vol, 0)}%로 갈립니다.`,
    `그런데 상품 하나하나로 내려가면 뒤집힙니다. 지수만 담은 제${A.idxWorst.no}회가 ${f1(A.idxWorst.mcLoss)}%로 종목 섞인 상품 대부분보다 위험하고, 제${A.stockBest.no}회는 ${f1(A.stockBest.mcLoss)}%로 ${A.items.length}종 중 ${A.safest.findIndex((i) => i.no === A.stockBest.no) + 1}번째로 낮습니다.`,
    `실제로 갈라놓은 건 자산 종류가 아니라 "원금 지키는 선이 얼마나 아래인가"와 "두 자산이 얼마나 같이 움직이는가"였습니다. 제${A.idxWorst.no}회는 선이 ${A.idxWorst.knockIn}%(이번 주에서 가장 높아 여유가 제일 적음)에 같이 움직임 ${f1(A.idxWorst.rho, 2)}, 제${A.stockBest.no}회는 선이 ${A.stockBest.knockIn}%에 같이 움직임 ${f1(A.stockBest.rho, 2)}입니다.`,
  ];
  s.addText(pts.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < pts.length - 1 } })), {
    x: 6.44, y: y0 + 1.86, w: CW - 5.82, h: 3.0, fontFace: F, fontSize: 12.5, color: BODY, lineSpacing: 18, paraSpaceAfter: 12, margin: 0,
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 4.06, w: 5.5, h: 0.86, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText(`두 자산이 따로 놀수록 "더 많이 떨어진 하나로 판정한다"는 조건에서 크게 불리해집니다. 무엇을 담았느냐보다 이쪽이 결정적입니다.`, {
    x: M + 0.2, y: y0 + 4.06, w: 5.1, h: 0.86, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0,
  });
  s.addNotes('고객이 "종목 들어간 건 위험하지 않나요"라고 물으면 이 장을 펴십시오. 일반론은 맞고, 상품별로는 확인이 필요하다는 답입니다.');
}

// ══ 5. 쿠폰이 높으면 그만큼 위험한가 ═══════════════════════════════════════
{
  const C = A.coupon, { rho: CR, pairs: CP, reg: CG, eff: CE } = C;
  const pp = (o) => (o.p < 0.001 ? '0.1% 미만' : `${f1(o.p * 100, 1)}%`);
  const s = slide();
  const y0 = head(s, '수익률이 높으면 그만큼 위험한가',
    `"수익률이 높으면 그만큼 위험한 것 아니냐" — 맞는 말씀입니다. 다만 정확히 비례하지는 않고, 그 어긋나는 자리가 바로 상품을 고르는 자리입니다.`);

  const hd = (t, a) => ({ text: t, options: { bold: true, color: INK, fill: { color: SOFT }, align: a || 'left' } });
  const cell = (o, hi) => ({
    text: [{ text: o.r.toFixed(2), options: { bold: true, fontSize: 13, color: hi ? ACTIVE : INK } },
      { text: `   우연일 확률 ${pp(o)}${o.sig ? '' : ' · 우연일 수도'}`, options: { fontSize: 9, color: FAINT } }],
    options: { align: 'right' },
  });
  s.addTable([
    [hd('연 수익률과 무엇의 관계인가'), hd(`전체 ${C.n}종`, 'right'), hd(`값어치 멀쩡한 ${C.nFair}종`, 'right')],
    [{ text: '가격 출렁임', options: { color: BODY } }, cell(CR.vol.all), cell(CR.vol.fair)],
    [{ text: '손해 볼 가능성', options: { color: BODY } }, cell(CR.loss.all), cell(CR.loss.fair)],
    [{ text: '평균적으로 잃는 크기 (가능성 × 잃을 때의 크기)', options: { bold: true, color: INK } }, cell(CR.expLoss.all, true), cell(CR.expLoss.fair, true)],
  ], {
    x: M, y: y0, w: CW, colW: [5.50, 3.30, 3.293],
    fontFace: F, fontSize: 11.5, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
    rowH: 0.4, valign: 'middle', margin: 5,
  });
  s.addText(`숫자가 1에 가까울수록 "수익률 높은 상품이 위험도 크다"가 잘 들어맞고, 0이면 아무 관계가 없다는 뜻입니다(순서를 견주는 방식으로 쟀습니다).  `
    + `값어치 멀쩡한 ${C.nFair}종 = 넣는 순간의 값어치가 제값보다 5% 넘게 깎이지는 않은 상품 — 나머지 ${C.n - C.nFair}종은 높은 수익률이 위험의 대가가 아니라 비용으로 빠져나간 상품이라 이 법칙 자체가 통하지 않습니다.`, {
    x: M, y: y0 + 1.78, w: CW, h: 0.44, fontFace: F, fontSize: 10, color: FAINT, valign: 'top', lineSpacing: 14, margin: 0,
  });

  const cw = (CW - 0.6) / 3;
  const stats = [
    { k: '둘씩 짝지어 세면', v: `${f1(CP.all.pct, 0)}%`, d: `${C.n}종으로 만들 수 있는 ${CP.all.n}짝 중 ${CP.all.ok}짝에서 "수익률 높은 쪽이 잃는 크기도 컸다"가 맞았습니다`, c: BLUE },
    { k: '그런데 수익률로 맞히는 건', v: `${f1(CG.r2 * 100, 0)}%`, d: `수익률 1%p당 손해 볼 가능성 +${f1(CG.slope, 2)}%p — 방향은 맞지만 상품마다 그 몇 배씩 들쭉날쭉합니다`, c: WARN },
    { k: '같은 위험에 받는 수익률', v: `${f1(CE.spread, 1)}배`, d: `${f1(CE.ratio(CE.worst), 2)}(제${CE.worst.no}회) ~ ${f1(CE.ratio(CE.best), 2)}(제${CE.best.no}회). 정확히 비례한다면 전부 같아야 합니다`, c: ACTIVE },
  ];
  stats.forEach((t, i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(pres.ShapeType.rect, { x, y: y0 + 2.42, w: cw, h: 1.32, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
    s.addText(t.k, { x: x + 0.22, y: y0 + 2.54, w: cw - 0.44, h: 0.24, fontFace: F, fontSize: 10.5, color: MUTED, margin: 0 });
    s.addText(t.v, { x: x + 0.22, y: y0 + 2.76, w: cw - 0.44, h: 0.46, fontFace: F, fontSize: 28, bold: true, color: t.c, margin: 0 });
    s.addText(t.d, { x: x + 0.22, y: y0 + 3.24, w: cw - 0.44, h: 0.44, fontFace: F, fontSize: 10, color: BODY, valign: 'top', lineSpacing: 13, margin: 0 });
  });

  const pw = (CW - 0.3) / 2;
  const panels = [
    { k: '왜 그런가', t: 'ELS의 수익률은 고객이 회사에 "많이 떨어지면 그 손해는 제가 떠안겠습니다"라는 약속을 팔고 받는 값입니다. "많이 안 떨어지면 이자를 드리겠다"를 뒤집으면 "떨어지면 고객이 부담한다"는 뜻이고, 그 약속의 가격이 곧 수익률입니다. 심하게 출렁일수록 그 약속이 비싸집니다. 관행이 아니라 값 매기는 계산식 자체가 그렇습니다.' },
    { k: '수익률이 갚는 건 "가능성"이 아닙니다', t: `수익률은 손해 볼 가능성(${f1(CR.loss.fair.r, 2)})보다 평균적으로 잃는 크기(${f1(CR.expLoss.fair.r, 2)})와 훨씬 잘 붙습니다. 지수만 담은 상품은 잃을 때 ${f1(avgLossOf('지수'), 0)}% 남짓, 개별 종목 상품은 ${f1(avgLossOf('종목'), 0)}%가량 잃습니다. 회사는 "얼마나 자주"가 아니라 "자주 × 크게"로 값을 매깁니다.` },
  ];
  panels.forEach((p, i) => {
    const x = M + i * (pw + 0.3);
    s.addShape(pres.ShapeType.rect, { x, y: y0 + 3.92, w: pw, h: 1.36, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(p.k, { x: x + 0.22, y: y0 + 4.04, w: pw - 0.44, h: 0.26, fontFace: F, fontSize: 12, bold: true, color: BLUE, margin: 0 });
    s.addText(p.t, { x: x + 0.22, y: y0 + 4.32, w: pw - 0.44, h: 0.9, fontFace: F, fontSize: 10.5, color: BODY, valign: 'top', lineSpacing: 14, margin: 0 });
  });
  s.addNotes('"수익률 높으면 위험한 거 아니냐"는 질문에 이 장을 펴십시오. 맞다고 인정하고 시작하되, 같은 위험을 지고도 더 받는 상품이 있다는 것이 다음 장입니다.');
}

// ══ 6. 어디서 갈라지나 ═════════════════════════════════════════════════════
{
  const C = A.coupon, { eff: CE, why: CW2, sens: CS } = C;
  const s = slide();
  const y0 = head(s, '그래서 어디서 갈라지나', '수익률과 위험이 어긋나는 이유는 셋입니다. 셋 다 이번 주 데이터에서 그대로 확인됩니다.');

  const cw = (CW - 0.6) / 3;
  const cards = [
    CW2.twin && { n: '①', k: '상품 조건이 달라서', c: BLUE,
      t: `${CW2.group[0].underlyings.join('·')} ${CW2.group.length}종은 기준 자산도, 가격 출렁임(${f1(CW2.group[0].vmax)}%)도, 기간(${CW2.group[0].months}개월)도 똑같은데 수익률만 갈립니다.\n\n`
        + `제${CW2.twin.hi.no}회 연 ${f1(CW2.twin.hi.annualRate)}% · 평균적으로 잃는 크기 ${f1(CW2.twin.hi.mcExpLoss)}%\n`
        + `제${CW2.twin.lo.no}회 연 ${f1(CW2.twin.lo.annualRate)}% · 평균적으로 잃는 크기 ${f1(CW2.twin.lo.mcExpLoss)}%\n\n`
        + `위험이 사실상 같은데 수익률이 ${f1(CW2.twin.d)}%p 차이 납니다. 끝날 기회를 ${CW2.twin.hi.every}개월마다 보느냐 ${CW2.twin.lo.every}개월마다 보느냐, 원금 지키는 선이 ${CW2.twin.hi.knockIn}%냐 ${CW2.twin.lo.knockIn}%냐가 갈랐습니다.` },
    { n: '②', k: '값어치가 깎여서', c: BAD,
      t: `제${CW2.priced.no}회는 연 ${f1(CW2.priced.annualRate)}%인데 평균적으로 잃는 크기가 ${f1(CW2.priced.mcExpLoss)}%나 됩니다. 넣는 순간의 값어치가 제값보다 ${f1(CW2.priced.fairValueGap)}%나 깎여 있기 때문입니다.\n\n`
        + `높은 수익률이 위험을 진 대가로 돌아오는 게 아니라 비용으로 새어나간 경우입니다.\n\n`
        + `많이 깎인 ${C.n - C.nFair}종만 빼도 수익률과 출렁임의 관계가 ${f1(C.rho.vol.all.r, 2)} → ${f1(C.rho.vol.fair.r, 2)}로 올라갑니다. 이 법칙은 제값 받는 상품에서만 통합니다.` },
    CW2.fx && { n: '③', k: '돈의 종류가 달라서', c: ACTIVE,
      t: `제${CW2.fx.fx.no}회(${CW2.fx.fx.currency})는 연 ${f1(CW2.fx.fx.annualRate)}%에 평균적으로 잃는 크기가 ${f1(CW2.fx.fx.mcExpLoss)}%로, 기준 자산이 똑같은 원화 제${CW2.fx.krw.no}회(${f1(CW2.fx.krw.annualRate)}% · ${f1(CW2.fx.krw.mcExpLoss)}%)보다 더 주면서 덜 위험해 보입니다.\n\n`
        + `${CW2.fx.fx.currency} 이자가 수익률에 섞여 들어간 것이고, 대신 이 손실 계산에 잡히지 않는 환율 위험이 따로 붙기 때문입니다.\n\n`
        + `이 상품의 손해 볼 가능성은 환율을 뺀 숫자입니다.` },
  ].filter(Boolean);
  cards.forEach((c, i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 2.30, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText([
      { text: `${c.n} `, options: { bold: true, color: c.c, fontSize: 13 } },
      { text: c.k, options: { bold: true, color: INK, fontSize: 13 } },
    ], { x: x + 0.22, y: y0 + 0.14, w: cw - 0.44, h: 0.28, fontFace: F, margin: 0 });
    s.addText(c.t, { x: x + 0.22, y: y0 + 0.48, w: cw - 0.44, h: 1.76, fontFace: F, fontSize: 10, color: BODY, valign: 'top', lineSpacing: 13, margin: 0 });
  });

  if (CS) {
    s.addText(`가장 크게 어긋난 제${CS.no}회 — 그 우위가 "두 자산이 ${f1(CS.disclosed, 2)}만큼 같이 움직인다"는 서류 값 하나에 얹혀 있는지 흔들어 봤습니다`
      + `${C.sensIsPick ? ' (이 문서가 추천하는 상품)' : ''}`, {
      x: M, y: y0 + 2.46, w: CW, h: 0.26, fontFace: F, fontSize: 12, bold: true, color: INK, margin: 0,
    });
    const rhoHd = [{ text: '같이 움직이는 정도', options: { bold: true, color: INK, fill: { color: SOFT } } }]
      .concat(CS.rows.map((r) => ({
        text: r.rho == null ? `서류값 ${f1(CS.disclosed, 2)}` : f1(r.rho, 2),
        options: { bold: true, color: INK, fill: { color: SOFT }, align: 'right' },
      })));
    const rrow = (label, f, hi) => [{ text: label, options: { bold: Boolean(hi), color: hi ? INK : BODY } }]
      .concat(CS.rows.map((r) => ({ text: f(r), options: { align: 'right', bold: Boolean(hi), color: hi ? ACTIVE : BODY } })));
    s.addTable([
      rhoHd,
      rrow('손해 볼 가능성', (r) => `${f1(r.loss)}%`),
      rrow('평균적으로 잃는 크기', (r) => `${f1(r.expLoss)}%`),
      rrow('위험 한 단위당 수익률', (r) => f1(r.ratio, 2), true),
    ], {
      x: M, y: y0 + 2.78, w: CW, colW: [2.4].concat(CS.rows.map(() => (CW - 2.4) / CS.rows.length)),
      fontFace: F, fontSize: 11, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
      rowH: 0.3, valign: 'middle', margin: 4,
    });
    const last = CS.rows[CS.rows.length - 1];
    s.addText(`같이 움직이는 정도를 ${f1(last.rho, 2)}까지 억지로 낮춰도 손해 볼 가능성은 ${f1(CS.rows[0].loss)}% → ${f1(last.loss)}% 오르는 데 그치고, 위험 대비 대가는 ${f1(last.ratio, 2)}로 여전히 이번 주 1등입니다. `
      + `두 자산의 출렁임 정도가 ${f1(CS.volSpread)}%p나 벌어져 있어서, 같이 움직이든 말든 "더 나쁜 쪽"이 거의 항상 같은 자산이기 때문입니다. 출렁임이 비슷한 짝이었다면 이렇게 버티지 못합니다.`, {
      x: M, y: y0 + 4.18, w: CW, h: 0.44, fontFace: F, fontSize: 10, color: FAINT, valign: 'top', lineSpacing: 13, margin: 0,
    });
  }

  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 4.78, w: CW, h: 0.72, fill: { color: TINT }, line: { width: 0 } });
  s.addText([
    { text: `"연 ${f1(A.rateMax)}%짜리도 있는데 왜 ${f1(CE.fairBest.annualRate)}%짜리를 먼저 권하나요?"  `, options: { bold: true, color: INK } },
    { text: `→ "수익률이 높으면 위험도 큰 것, 맞습니다. 다만 같은 위험을 지고도 남들보다 많이 받는 상품이 따로 있습니다. 이번 주는 그 차이가 ${f1(CE.fairSpread)}배까지 벌어집니다."` },
  ], { x: M + 0.22, y: y0 + 4.78, w: CW - 0.44, h: 0.72, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
  s.addNotes('수익률만 유난히 높고 위험은 안 높아 보이면 셋 중 하나입니다 — 조건 덕이거나, 돈의 종류가 다르거나, 아직 못 본 위험이 있거나. 앞의 둘로 설명이 안 되면 세 번째입니다.');
}

// ══ 7-9. 추천 3종 ══════════════════════════════════════════════════════════
A.slots.forEach((slot, idx) => {
  const it = slot.pick;
  const s = slide();
  const y0 = head(s, `추천 ${idx + 1} — ${slot.label}`, null);

  // 회차 · 기초자산 · 등급
  const CHIP0 = 2.92;                                   // "제38044회" 26pt 가 실제로 끝나는 지점 뒤
  s.addText(`제${it.no}회`, { x: M, y: y0, w: CHIP0 - M - 0.12, h: 0.5, fontFace: F, fontSize: 26, bold: true, color: INK, margin: 0 });
  const chips = [[tierOf(it).name, TIER_INK[it.tier], TIER_BG[it.tier]],
                 [{ 지수: '지수만', 혼합: '섞임', 종목: '종목만' }[kindOf(it)] || kindOf(it), BLUE, TINT]]
    .concat(it.currency !== 'KRW' ? [[it.currency, WHITE, ACTIVE]] : []);
  chips.forEach(([t, c, bg], i) => {
    const cx = CHIP0 + i * 1.02;
    s.addShape(pres.ShapeType.rect, { x: cx, y: y0 + 0.11, w: 0.94, h: 0.3, fill: { color: bg }, line: { width: 0 } });
    s.addText(t, { x: cx, y: y0 + 0.11, w: 0.94, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, color: c, align: 'center', valign: 'middle', margin: 0 });
  });
  s.addText(`${it.underlyings.join(' · ')}  ·  ${it.months}개월  ·  ${it.every}개월마다 확인`, {
    x: M, y: y0 + 0.54, w: 7.4, h: 0.3, fontFace: F, fontSize: 13, color: MUTED, margin: 0,
  });

  // 큰 수익률
  s.addShape(pres.ShapeType.rect, { x: 9.3, y: y0 - 0.04, w: 3.42, h: 1.0, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText('잘 되면 연 수익률', { x: 9.52, y: y0 + 0.08, w: 3.0, h: 0.24, fontFace: F, fontSize: 10.5, color: MUTED, margin: 0 });
  s.addText([{ text: f1(it.annualRate), options: { fontSize: 34, bold: true, color: ORANGE } },
             { text: '%', options: { fontSize: 20, bold: true, color: ORANGE } }],
    { x: 9.52, y: y0 + 0.32, w: 3.0, h: 0.56, fontFace: F, margin: 0 });
  s.addText(`${baseOf(it)} → 빠르면 ${it.every}개월 뒤 ${money(it, it.schedule[0].payout)}`, {
    x: M, y: y0 + 0.92, w: 7.4, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INK, margin: 0,
  });

  // 4줄 구조 설명
  const how = [
    ['무엇을 보나', it.underlyings.length === 1 ? `${it.underlyings[0]} 하나만 봅니다.`
      : `${it.underlyings.join(' · ')} 중 더 많이 떨어진 하나로 판정합니다. 하나만 나빠도 그쪽을 봅니다.`],
    ['언제 끝나나', `${it.every}개월마다 확인해서 처음 가격의 ${it.barriers[0]}% 이상(${sgn(it.barriers[0] - 100, 0)}%까지 떨어져도 괜찮다는 뜻)이면 그 자리에서 끝나고 ${baseOf(it)}${josa(baseOf(it), '이', '가')} ${money(it, it.schedule[0].payout)}${josa(unitOf(it), '이', '가')} 되어 돌아옵니다.`],
    ['원금 지키기', it.knockIn != null
      ? `끝날 때까지 종가가 단 한 번도 ${it.knockIn}%(처음 가격에서 ${sgn(it.knockIn - 100, 0)}%) 아래로 안 내려가면, 마지막에 얼마가 됐든 원금과 이자를 다 받습니다.`
      : `중간에 얼마나 빠졌든 따지지 않습니다. 마지막 날 하루만 봐서 ${it.maturityBarrier}% 이상이면 원금과 이자를 다 받습니다.`],
    ['손해 나는 때', it.knockIn != null
      ? `${it.knockIn}% 아래를 한 번이라도 밟았고 마지막 날에도 ${it.maturityBarrier}% 아래면, 떨어진 만큼 그대로 손실입니다.`
      : `마지막 날 ${it.maturityBarrier}% 아래면 떨어진 만큼 그대로 손실입니다.`],
  ];
  const hy = y0 + 1.34;
  how.forEach(([k, v], i) => {
    const y = hy + i * 0.5;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 1.14, h: 0.3, fill: { color: BLUE }, line: { width: 0 } });
    s.addText(k, { x: M, y, w: 1.14, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0 });
    s.addText(v, { x: M + 1.3, y: y - 0.04, w: CW - 1.3, h: 0.42, fontFace: F, fontSize: 12, color: BODY, valign: 'middle', margin: 0 });
  });

  // 지표 4칸
  const stats = [
    [`A. 회사가 ${it.simYearsWhole}년 돌려본 손실`, `${f1(it.simLoss, 2)}%`, `${it.simRuns?.toLocaleString('ko-KR')}번 중 ${Math.round((it.simLoss ?? 0) / 100 * (it.simRuns ?? 0))}번`],
    ['B. 컴퓨터로 다시 돌린 손실', `${f1(it.mcLoss)}%`, `${A.items.length}종 평균 ${f1(A.mcAvgAll)}% · 낮은 쪽 ${A.safest.findIndex((x) => x.no === it.no) + 1}번째`],
    [`${baseOf(it)}의 실제 값어치`, money(it, it.fairValue / 100), `제값보다 ${sgn(it.fairValueGap, 2)}%`],
    ['가격 출렁임', `${f1(it.vmax)}%`, it.rho != null ? `둘이 같이 움직임 ${f1(it.rho, 2)}` : '기준 자산 하나'],
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
    ? ` ${it.currency}로 넣고 ${it.currency}로 돌려받는 상품이라, 위 수익률에 환율이 오르내린 만큼이 그대로 더해지거나 빠집니다.` : '';
  s.addShape(pres.ShapeType.rect, { x: M, y: sy + 1.2, w: CW, h: 0.56, fill: { color: TINT }, line: { width: 0 } });
  s.addText([{ text: '이 상품을 권하는 이유  ', options: { bold: true, color: INK } }, { text: slot.why + fx }], {
    x: M + 0.2, y: sy + 1.2, w: CW - 0.4, h: 0.56, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', margin: 0,
  });

  s.addNotes(kindOf(it) === '지수' ? '지수만 담은 상품이라 자산 종류로 들어오는 반박은 없습니다.' : defence(it));
});

/** 종목이 섞인 상품을 권할 때 쓰는 상담용 답 — 지수형 평균보다 안전한 경우와 아닌 경우가 다르다 */
function defence(it) {
  const idxAvg = A.byKind.find((r) => r.key === '지수')?.loss;
  const stock = it.underlyings.filter((u) => !['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI'].includes(u)).join('·');
  const beats = A.items.filter((i) => kindOf(i) === '지수' && i.mcLoss > it.mcLoss).length;
  const idxN = A.items.filter((i) => kindOf(i) === '지수').length;
  const base = `"개별 종목이 들어갔는데 괜찮나요?" → ${stock}${josa(stock, '이', '가')} 들어간 게 맞고, 가격 출렁임 ${f1(it.vmax)}%로 지수만 담은 상품 평균(${f1(idxAvg === undefined ? null : A.byKind.find((r) => r.key === '지수').vol)}%)보다 큰 것도 맞습니다. `;
  return it.mcLoss <= idxAvg
    ? base + `다만 컴퓨터로 똑같이 돌려본 손해 볼 가능성은 ${f1(it.mcLoss)}%로 지수만 담은 상품 평균(${f1(idxAvg)}%)보다 낮고, 지수만 담은 ${idxN}종 중 ${beats}종보다도 낮습니다. `
      + (it.rho >= 0.7 ? `두 자산이 ${f1(it.rho, 2)}만큼 거의 같이 움직여서 "더 나쁜 쪽으로 판정"하는 불이익이 거의 없고, 원금 지키는 선도 ${it.knockIn}%로 훨씬 아래입니다.` : `원금 지키는 선이 ${it.knockIn}%로 훨씬 아래입니다.`)
    : base + `손해 볼 가능성도 ${f1(it.mcLoss)}%로 지수만 담은 상품 평균(${f1(idxAvg)}%)보다 높습니다. 그런데도 올린 이유는 안전해서가 아니라 대가가 크기 때문입니다 — `
      + `손해 볼 가능성 1%마다 연 ${f1(A.perRisk(it), 2)}%로, 지수 상품 평균 ${f1(A.idxPerRisk, 2)}%의 ${f1(A.perRisk(it) / A.idxPerRisk)}배입니다. `
      + `원금 지키는 게 제일 중요한 분께는 추천 1번을 권하십시오.`;
}

// ══ 8. 전체 17종 ═══════════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, `이번 주 ${A.items.length}종 전부`,
    '컴퓨터로 다시 돌린 손해 볼 가능성(B)이 낮은 순서. A 옆 괄호는 그 상품을 몇 년치 과거로 돌려봤는지 — 10년에 못 미치면(빨강) 다른 상품과 나란히 비교할 수 없습니다. "만기만" = 중간 하락을 안 따지고 마지막 날 하루만 봅니다.');
  const hdr = ['회차', '기준 자산', '종류', '연 수익률', '끝나는 조건', '원금 지키는 선', '가격 출렁임', 'B. 손해 가능성', '등급', 'A. 서류 손실', '실제 값어치'];
  const ALIGN = ['left', 'left', 'left', 'right', 'right', 'right', 'right', 'right', 'center', 'right', 'right'];
  const rows = [hdr.map((t, i) => ({
    text: t, options: { bold: true, color: INK, fill: { color: SOFT }, align: ALIGN[i] },
  }))];
  for (const it of [...A.items].sort((a, b) => (a.mcLoss ?? 99) - (b.mcLoss ?? 99))) {
    rows.push([
      { text: `제${it.no}회`, options: { bold: true, color: INK } },
      { text: it.underlyings.join(' · ') + (it.currency !== 'KRW' ? ` (${it.currency})` : ''), options: { color: BODY } },
      { text: { 지수: '지수만', 혼합: '섞임', 종목: '종목만' }[kindOf(it)] || kindOf(it), options: { color: kindOf(it) === '종목' ? BAD : kindOf(it) === '혼합' ? WARN : BLUE } },
      { text: `${f1(it.annualRate)}%`, options: { align: 'right', bold: true, color: INK } },
      { text: `${it.every}개월 / ${it.barriers[0]}%`, options: { align: 'right', color: BODY } },
      { text: `${it.floor}%${it.knockIn == null ? ' (만기만)' : ''}`, options: { align: 'right', color: BODY } },
      { text: `${f1(it.vmax)}%`, options: { align: 'right', color: BODY } },
      { text: `${f1(it.mcLoss)}%`, options: { align: 'right', bold: true, color: [BLUE, WARN, BAD][it.tier] } },
      { text: tierOf(it).name, options: { align: 'center', color: TIER_INK[it.tier], fill: { color: TIER_BG[it.tier] } } },
      { text: `${f1(it.simLoss, 2)}%  (${it.simShort ? f1(it.simYears) : it.simYearsWhole}년)`, options: { align: 'right', color: it.simShort ? BAD : BODY } },
      { text: money(it, it.fairValue / 100), options: { align: 'right', color: (it.fairValueGap ?? 0) <= -10 ? BAD : (it.fairValueGap ?? 0) <= -5 ? WARN : BODY } },
    ]);
  }
  const colW = [0.80, 2.85, 0.58, 0.92, 1.00, 1.12, 0.90, 1.10, 0.62, 1.28, 0.92];
  s.addTable(rows, {
    x: M, y: y0, w: CW, colW,
    fontFace: F, fontSize: 9, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
    rowH: 0.24, valign: 'middle', margin: 2, autoPage: false,
  });
  s.addText(TIER_RULE, {
    x: M, y: y0 + rows.length * 0.24 + 0.16, w: CW, h: 0.34,
    fontFace: F, fontSize: 10.5, color: FAINT, valign: 'top', margin: 0,
  });
}

// ══ 9. 권하지 않는 상품 ════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '이번 주에는 권하지 않는 상품', '수익률만 보면 눈에 띄지만, 그 대가를 손해 볼 가능성이나 값어치에서 치르고 있습니다. 가능성이 큰 순서입니다.');
  const reasons = (it) => {
    const r = [];
    if (it.mcLoss > 25) r.push(`컴퓨터로 똑같이 돌리면 100번 중 ${f1(it.mcLoss, 0)}번이 손실 (이번 주 평균 ${f1(A.mcAvgAll, 0)}번)`);
    if ((it.fairValueGap ?? 0) <= -10) r.push(`${baseOf(it)}${josa(baseOf(it), '을', '를')} 넣는 순간의 실제 값어치가 ${money(it, it.fairValue / 100)}밖에 안 됨`);
    if (it.simShort) r.push(`회사가 과거로 돌려본 기간이 ${f1(it.simYears)}년(${it.simRuns?.toLocaleString('ko-KR')}번)뿐 — 큰 폭락장이 아예 빠져 있어 손실 ${f1(it.simLoss, 2)}%를 20년 돌려본 상품과 견줄 수 없음`);
    if (it.vmax >= 90) r.push(`가격 출렁임 ${f1(it.vmax, 0)}% — 이번 주에서 가장 심한 축`);
    // 같은 기초자산인데 수익률이 더 높으면서 손실 확률까지 낮은 상품이 있으면 그쪽을 가리킨다
    const key = (x) => [...x.underlyings].sort().join('|');
    const better = A.items.filter((x) => x.no !== it.no && key(x) === key(it)
      && x.annualRate >= it.annualRate && x.mcLoss < it.mcLoss)
      .sort((a, b) => a.mcLoss - b.mcLoss)[0];
    if (better) r.push(`기준 자산이 똑같은 제${better.no}회가 수익률은 더 높고(연 ${f1(better.annualRate)}%) 손해 볼 가능성은 더 낮습니다(${f1(better.mcLoss)}%) — ${it.every}개월마다 보는 이 상품과 달리 ${better.every}개월마다 끝날 기회가 옵니다`);
    return r.slice(0, 3);
  };
  const cw = (CW - 0.26 * 3) / 4;
  A.caution.forEach((it, i) => {
    const x = M + i * (cw + 0.26);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 3.5, fill: { color: WHITE }, line: { color: HAIR, width: 1 } });
    s.addText(`제${it.no}회`, { x: x + 0.2, y: y0 + 0.22, w: cw - 0.4, h: 0.34, fontFace: F, fontSize: 17, bold: true, color: INK, margin: 0 });
    s.addText(it.underlyings.join(' · '), { x: x + 0.2, y: y0 + 0.58, w: cw - 0.4, h: 0.52, fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 15, margin: 0 });
    s.addText([{ text: `연 ${f1(it.annualRate)}%`, options: { bold: true, color: ACTIVE } },
               { text: `   손해 ${f1(it.mcLoss)}%`, options: { bold: true, color: BAD } }],
      { x: x + 0.2, y: y0 + 1.14, w: cw - 0.4, h: 0.3, fontFace: F, fontSize: 13, margin: 0 });
    const rs = reasons(it);
    s.addText(rs.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < rs.length - 1 } })), {
      x: x + 0.2, y: y0 + 1.52, w: cw - 0.4, h: 1.86, fontFace: F, fontSize: 10.5, color: BODY, valign: 'top', lineSpacing: 15, paraSpaceAfter: 9, margin: 0,
    });
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: y0 + 3.76, w: CW, h: 0.88, fill: { color: SURF }, line: { color: HAIR, width: 1 } });
  s.addText([
    { text: '거르는 기준  ', options: { bold: true, color: INK } },
    { text: `① 컴퓨터로 돌린 손해 볼 가능성이 25%를 넘거나  ② ${baseOf(A.head)}을 넣는 순간의 값어치가 제값보다 10% 넘게 깎였거나  ③ 회사가 과거로 돌려본 기간이 10년에 못 미쳐 다른 상품과 비교할 수 없는 경우. 셋 중 하나라도 걸리면 이 자리로 내립니다. 수익률이 높아 먼저 눈에 띄는 상품들이라, 상담 전에 걸러두는 편이 낫습니다.` },
  ], { x: M + 0.22, y: y0 + 3.76, w: CW - 0.44, h: 0.88, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
}

// ══ 10. 가입 전 꼭 짚어드릴 것 ═════════════════════════════════════════════
{
  const s = slide();
  const chk = [
    ...(A.plan.hasCooling ? [[`신청 마감은 ${dayLabel(A.plan.retailEnd)}입니다`,
      `홈페이지에는 ${dot(A.plan.start)}~${dot(A.plan.end)}로 나오지만 개인 고객은 ${dayLabel(A.plan.retailEnd)}까지만 신청할 수 있습니다. 이후는 다시 생각하는 기간과 확인하는 날이라 주문을 받을 수 없습니다.`]] : []),
    [`${baseOf(A.head)}을 넣어도 ${baseOf(A.head)}어치가 아닙니다`,
      `넣는 순간의 실제 값어치가 ${money(A.gapBest, A.gapBest.fairValue / 100)}부터 ${money(A.gapWorst, A.gapWorst.fairValue / 100)}까지 벌어집니다. 차액은 회사 몫과 비용이고, 이마저도 앞으로 들 비용을 이미 뺀 값입니다.`],
    ['중간에 빼면 손해입니다',
      `만기 전에 빼시면 원금이 아니라 그날 계산한 값어치의 95%(가입 6개월 안이면 90%)만 받습니다. ${A.head.months}개월 동안 안 쓸 돈으로만 하셔야 합니다.`],
    ['판정은 그날 종가로만 합니다',
      '장중에 잠깐 뚫고 내려가도 종가가 선 위면 아무 일 없고, 종가가 딱 한 번이라도 아래면 그걸로 기록이 남습니다.'],
    ['서류의 손실 숫자를 그대로 옮기지 마십시오',
      `서류의 손실 숫자는 "지난 ${A.head.simYearsWhole}년이 되풀이된다면"의 답입니다. 추천 1번 제${A.slots[0].pick.no}회도 서류로는 ${f1(A.slots[0].pick.simLoss, 2)}%지만 똑같은 조건으로 다시 돌리면 ${f1(A.slots[0].pick.mcLoss)}%입니다.`],
    ...(A.plan.recordingRight ? [['상담 내용은 녹음됩니다',
      `개인 고객은 녹음 파일을 달라고 하실 수 있고, 위험을 한 장으로 정리한 설명서도 받습니다.${A.plan.maxLossNotice ? ' "최대 얼마까지 잃을 수 있는지"는 다시 생각하는 기간에 따로 알려드립니다.' : ''} 설명을 건너뛰면 그것도 그대로 기록에 남습니다.`]] : []),
  ];
  const NUM = ['한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟'];
  const y0 = head(s, '가입 전에 꼭 짚어드릴 것', `상담에서 이 ${NUM[chk.length - 1] || chk.length} 가지를 빠뜨리면 나중에 문제가 됩니다.`);
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
  s.addNotes('1번은 이번 주에만 해당하는 이야기가 아니라 매주 반복됩니다. 마감일을 잘못 안내하면 고객이 기회를 놓칩니다.');
}

// ══ 11. 상담 순서 ══════════════════════════════════════════════════════════
{
  const s = slide();
  const it0 = A.slots[0].pick;
  const y0 = head(s, '상담할 때 이 순서로 말씀하시면 됩니다', `추천 1번 제${it0.no}회 기준입니다. 다른 상품이면 회차·기간·원금 지키는 선 숫자만 바꾸십시오.`);
  const script = [
    ...(A.plan.hasCooling ? [`"먼저 일정부터 말씀드리면, 신청은 ${dayLabel(A.plan.retailEnd)}까지 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 '다시 생각하는 기간'이라 주문을 받을 수 없습니다."`] : []),
    `"이 상품은 최장 ${it0.months}개월짜리인데, ${it0.every}개월마다 끝날 기회가 옵니다. 지금까지는 대부분 첫 번째에 끝났습니다."`,
    `"${it0.underlyings.join(' · ')} 중 더 많이 떨어진 하나로 판정합니다."`,
    '"올라야 버는 게 아니라, 많이 안 떨어지면 버는 구조입니다. 제자리여도 약속한 이자를 다 받습니다."',
    `"대신 ${it0.knockIn ?? it0.maturityBarrier}% 아래로 크게 떨어지면 떨어진 만큼 그대로 손실입니다. 원금은 보장되지 않습니다."`,
    `"지난 ${it0.simYearsWhole}년으로 돌려보면 손실은 ${f1(it0.simLoss, 2)}%였는데 그 기간이 좋았던 덕도 있습니다. 넉넉하게 잡으면 ${f1(it0.mcLoss, 0)}% 정도로 봅니다."`,
    `"${it0.months}개월 동안 안 쓸 돈인지부터 확인해 주세요. 중간에 빼시면 그날 계산한 값어치의 95%만 받습니다."`,
    ...(A.plan.hasCooling ? [`"신청하셨다고 바로 되는 게 아닙니다. 이틀 생각하실 시간을 드린 뒤 저희가 다시 연락드려 정말 하실 건지 확인합니다. 그때 연락이 안 닿으면 넣으신 돈은 ${dot(A.plan.payDate)}에 돌려드립니다."`] : []),
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
    { text: '"개별 종목이 들어간 건 더 위험하지 않나요?"  ', options: { bold: true, color: INK } },
    { text: `→ "맞습니다. 이번 주도 종목만 담은 상품의 손해 볼 가능성이 지수만 담은 것의 ${f1(A.kindRatio)}배입니다. 다만 제${it0.no}회는 두 자산이 거의 같이 움직이고(${f1(it0.rho, 2)}, 1이면 완전히 같이 움직임) 원금 지키는 선도 ${it0.knockIn}%로 훨씬 아래에 있어서, 같은 잣대로 재면 지수 상품 대부분보다 오히려 낮게 나옵니다."` },
  ], { x: M + 0.22, y: qy, w: CW - 0.44, h: 0.76, fontFace: F, fontSize: 11.5, color: BODY, valign: 'middle', lineSpacing: 16, margin: 0 });
}

// ══ 12. 말 풀이 ════════════════════════════════════════════════════════════
{
  const s = slide();
  const y0 = head(s, '말 풀이 — 서류에 나오는 말과 맞춰 보기',
    '이 자료는 어려운 말을 일부러 풀어서 썼습니다. 홈페이지와 투자설명서에는 원래 용어로 적혀 있으니, 고객이 서류를 펴 놓고 물으시면 두 말을 이어드리십시오.');

  // 한 줄로 세우면 뜻풀이 칸이 너무 넓어져 읽는 눈이 흔들린다. 두 벌로 나눈다.
  const GLOSS = [
    ['기준 자산', '기초자산', '이 상품의 성패를 정하는 주식·지수'],
    ['처음 가격', '최초기준가격', '시작하는 날의 종가. 모든 %의 기준'],
    ['미리 끝나는 기준선', '조기상환 배리어', '이 위에 있으면 이자까지 얹어 그 자리에서 끝남'],
    ['뒤로 갈수록 기준이 낮아짐', '스텝다운', '시간이 갈수록 끝나기 쉬워지는 구조'],
    ['원금 지키는 선', '낙인(KI) 배리어', '한 번도 이 밑으로 안 가면 원금·이자를 다 받음'],
    ['더 떨어진 하나로 판정', '워스트 퍼포머', '잘 오른 쪽은 안 보고 제일 못한 하나만 봄'],
    ['가격 출렁임', '(내재)변동성', '앞으로 1년간 얼마나 흔들릴지 시장이 보는 정도'],
    ['같이 움직이는 정도', '상관계수', '1이면 완전히 같이, 0에 가까우면 따로 놈'],
    ['실제 값어치', '공정가액', '1만원 넣는 순간 이 상품이 실제로 갖는 값'],
    ['평균적으로 잃는 크기', '기대손실', '손해 볼 가능성 × 손해 날 때 잃는 정도'],
    ['다시 생각하는 기간', '숙려기간', '법이 정한 2영업일 이상. 이때는 주문 못 넣음'],
    ['정말 하실 건지 확인', '가입의사 확인기간', '이때 연락이 안 닿으면 신청은 취소됨'],
    ['중간에 빼기', '중도상환', '원금이 아니라 그날 값어치의 95%(6개월 내 90%)'],
    ['1등급', '위험등급 1등급', '제일 좋다가 아니라 가장 위험하다는 뜻'],
  ];
  const half = Math.ceil(GLOSS.length / 2);
  const tw = (CW - 0.3) / 2;
  [GLOSS.slice(0, half), GLOSS.slice(half)].forEach((part, i) => {
    const rows = [[
      { text: '이 자료에서 쓴 말', options: { bold: true, color: INK, fill: { color: SOFT } } },
      { text: '서류 용어', options: { bold: true, color: INK, fill: { color: SOFT } } },
      { text: '무슨 뜻인가', options: { bold: true, color: INK, fill: { color: SOFT } } },
    ]].concat(part.map(([a, b, c]) => [
      { text: a, options: { bold: true, color: INK } },
      { text: b, options: { color: MUTED } },
      { text: c, options: { color: BODY } },
    ]));
    s.addTable(rows, {
      x: M + i * (tw + 0.3), y: y0, w: tw, colW: [1.62, 1.44, tw - 3.06],
      fontFace: F, fontSize: 10.5, border: { type: 'solid', color: 'E5E4E1', pt: 1 },
      rowH: 0.5, valign: 'middle', margin: 6, autoPage: false,
    });
  });
  s.addNotes('고객이 서류의 "낙인", "공정가액" 같은 말을 짚으며 물으실 때 이 장을 펴십시오. 왼쪽이 우리가 쓰는 말, 가운데가 서류에 적힌 말입니다.');
}

// ══ 꼬리말 — 표지 빼고 전 장 ═══════════════════════════════════════════════
pres.slides.forEach((s, i) => {
  if (i === 0) return;
  s.addText(`출처 — 금융감독원 전자공시시스템(DART)에 ${A.filedOn} 올라온 투자설명서 (접수번호 ${A.rcp})  ·  원금을 잃을 수 있는 상품입니다`, {
    x: M, y: H - 0.42, w: CW - 0.7, h: 0.26, fontFace: F, fontSize: 8.5, color: FAINT, margin: 0,
  });
  s.addText(String(i + 1), { x: W - M - 0.6, y: H - 0.42, w: 0.6, h: 0.26, fontFace: F, fontSize: 9, color: FAINT, align: 'right', margin: 0 });
});

await pres.writeFile({ fileName: OUT });
console.log(`${OUT} — ${pres.slides.length}장, 제${A.items[0].no}~${A.items[A.items.length - 1].no}회 `
  + `추천 ${A.slots.map((s) => s.pick.no).join('/')}`);
