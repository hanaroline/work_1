// 자산배분 제안서 — 슬라이드로 옮기는 쪽.
//
// **여기서는 아무것도 셈하지 않는다.** build_proposal_pptx.py 가 proposal_lib 로
// 다 셈해 넘긴 것을 그리기만 한다. 배분 산수가 세 번째로 복제되면 화면·엑셀·PPT
// 가 서로 다른 비중을 보여 주는 날이 온다.
//
// 디자인은 미래에셋 기준이다 — 오렌지 #F58220 · 블루 #043B72, 표 머리 #FAB072,
// 차트 시리즈 고정 순서, 모서리는 날카롭게. 차트는 **네이티브**로 넣는다(그림이
// 아니다). 고객 앞에서 숫자를 고칠 수 있어야 한다.
//
//   node scripts/proposal_deck.mjs <payload.json>

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PptxGenJS = require('pptxgenjs');

const D = JSON.parse(readFileSync(process.argv[2], 'utf-8'));

const ORANGE = 'F58220', BLUE = '043B72', SOFT = 'FAB072';
const INK = '1A1A1A', BODY = '3D3D3D', MUTED = '6C6C6C', HAIR = 'CDCECB';
const SURFACE = 'F7F8FA', GRAY = '84888B';
// 미래에셋 차트 고정 순서. 현금은 「잔여」라 중성 회색으로 뺀다 — 시리즈 색을
// 주면 현금이 하나의 투자 자산처럼 읽힌다.
const SERIES = [ORANGE, BLUE, SOFT, '0086B8', 'AD624E', '00A9CE', 'F0B26B'];
const KR = 'Spoqa Han Sans Neo';

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE';            // 13.3 × 7.5 인치
pres.author = '미래에셋증권';
pres.title = '자산배분 제안서';

const pct = (v, n = 1) => (v === null || v === undefined || Number.isNaN(v))
  ? '—' : `${Number(v).toFixed(n)}%`;
const won = (man) => {                   // 만원 단위 → 읽기 좋은 한국어
  if (!man) return '0원';
  const eok = Math.floor(man / 10000), rest = man % 10000;
  return (eok ? `${eok.toLocaleString()}억 ` : '') +
         (rest ? `${rest.toLocaleString()}만` : '') + '원';
};
const size = (v) => {
  if (v === null || v === undefined) return '—';
  if (v >= 1e12) return `${Math.round(v / 1e12).toLocaleString()}조원`;
  if (v >= 1e8) return `${Math.round(v / 1e8).toLocaleString()}억원`;
  return `${Math.round(v).toLocaleString()}원`;
};
const fee = (p) => {
  if (p.feeMin === null || p.feeMin === undefined) return '—';
  if (p.feeMax !== null && p.feeMax !== undefined && p.feeMax !== p.feeMin)
    return `${p.feeMin.toFixed(2)}~${p.feeMax.toFixed(2)}%`;
  return `${p.feeMin.toFixed(2)}%`;
};

// 슬라이드 머리. 미래에셋의 1px 오렌지 룰 + 그 아래 좌측 정렬 제목이 레이아웃
// 시그니처다(장식 띠가 아니라 브랜드 규칙이라 쓴다).
function header(s, num, title) {
  s.addText(title, { x: 0.6, y: 0.42, w: 12.1, h: 0.5, fontFace: KR,
    fontSize: 26, bold: true, color: INK, isTextBox: true, margin: 0 });
  s.addShape(pres.ShapeType.line, { x: 0.6, y: 0.35, w: 12.1, h: 0,
    line: { color: ORANGE, width: 1 } });
  if (num) s.addText(num, { x: 12.2, y: 0.45, w: 0.5, h: 0.4, fontFace: KR,
    fontSize: 12, color: MUTED, align: 'right', isTextBox: true, margin: 0 });
}
function foot(s, text) {
  s.addText(text, { x: 0.6, y: 6.95, w: 12.1, h: 0.35, fontFace: KR,
    fontSize: 9, color: MUTED, isTextBox: true, margin: 0 });
}
const TH = { fill: SOFT, color: INK, bold: true };
const td = (t, opts = {}) => ({ text: t, options: { fontSize: 11, color: BODY, ...opts } });

// ── 1. 표지 ───────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: ORANGE };
  s.addText('고객 제안용', { x: 0.8, y: 1.6, w: 8, h: 0.35, fontFace: KR,
    fontSize: 13, color: 'FFFFFF', isTextBox: true, margin: 0 });
  s.addText('자산배분 제안서', { x: 0.8, y: 2.0, w: 11.5, h: 1.2, fontFace: KR,
    fontSize: 48, bold: true, color: 'FFFFFF', isTextBox: true, margin: 0 });
  const who = D.client ? `${D.client}  ·  ` : '';
  s.addText(`${who}${D.riskName}  ·  ${D.yearsLabel}  ·  ${won(D.amount)}`,
    { x: 0.8, y: 3.3, w: 11.5, h: 0.5, fontFace: KR, fontSize: 20,
      color: 'FFFFFF', isTextBox: true, margin: 0 });
  s.addText('미래에셋증권', { x: 0.8, y: 6.5, w: 6, h: 0.35, fontFace: KR,
    fontSize: 12, color: 'FFFFFF', isTextBox: true, margin: 0 });
  s.addText(D.generated, { x: 6.5, y: 6.5, w: 5.8, h: 0.35, fontFace: KR,
    fontSize: 12, color: 'FFFFFF', align: 'right', isTextBox: true, margin: 0 });
  s.addNotes('표지. 고객명·성향·기간·금액은 build_proposal_pptx.py 인자로 바뀝니다.');
}

// ── 2. 제안 배분 (도넛 + 표) ──────────────────────────────────────────
{
  const s = pres.addSlide();
  header(s, '2', '제안 배분');
  const labels = D.rows.map(r => r.cls);
  const values = D.rows.map(r => Number(r.pct.toFixed(1)));
  const colors = D.rows.map((r, i) => r.cls === '현금' ? GRAY : SERIES[i % SERIES.length]);

  s.addChart(pres.ChartType.doughnut,
    [{ name: '비중', labels, values }],
    { x: 0.5, y: 1.15, w: 5.4, h: 5.0, holeSize: 55,
      chartColors: colors, showLegend: true, legendPos: 'b',
      legendFontFace: KR, legendFontSize: 11, legendColor: BODY,
      showValue: true, dataLabelFormatCode: '0.0"%"',
      dataLabelFontFace: KR, dataLabelFontSize: 10, dataLabelColor: 'FFFFFF',
      showTitle: false });

  const rows = [[
    { text: '자산군', options: TH }, { text: '비중', options: TH },
    { text: '금액', options: TH }, { text: '과거 1년', options: TH },
    { text: '변동성', options: TH },
  ]];
  D.rows.forEach(r => rows.push([
    td(r.cls), td(pct(r.pct), { align: 'right' }),
    td(won(r.amount), { align: 'right' }),
    td(pct(r.ret1y), { align: 'right', color: r.ret1y == null ? MUTED : BODY }),
    td(pct(r.vol), { align: 'right', color: r.vol == null ? MUTED : BODY }),
  ]));
  rows.push([
    td('합계', { bold: true, fill: 'D7D7D7' }),
    td('100.0%', { align: 'right', bold: true, fill: 'D7D7D7' }),
    td(won(D.amount), { align: 'right', bold: true, fill: 'D7D7D7' }),
    td(pct(D.metrics['과거1년실적']), { align: 'right', bold: true, fill: 'D7D7D7' }),
    td(pct(D.metrics['변동성_가중합']), { align: 'right', bold: true, fill: 'D7D7D7' }),
  ]);
  s.addTable(rows, { x: 6.2, y: 1.25, w: 6.5, colW: [1.5, 1.0, 1.6, 1.2, 1.2],
    border: { type: 'solid', color: HAIR, pt: 0.5 }, fontFace: KR,
    rowH: 0.34, valign: 'middle' });

  const n = D.notes.length ? D.notes.join('  ·  ') : '';
  foot(s, n || '성향과 투자기간으로 정한 배분입니다.');
  s.addNotes('도넛과 표는 네이티브라 고객 앞에서 숫자를 고칠 수 있습니다. '
    + '「과거 1년」은 지나간 실적이며 미래 수익률이 아닙니다.');
}

// ── 3. 포트폴리오 지표 ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  header(s, '3', '포트폴리오 지표');
  const cards = [
    ['과거 1년 실적 (가중)', pct(D.metrics['과거1년실적']), BLUE,
     `미래 수익률이 아닙니다.  실적을 덮은 비중 ${pct(D.metrics['실적덮은비중'], 0)}`],
    ['변동성 (가중합)', pct(D.metrics['변동성_가중합']), BLUE,
     `분산효과 제외 — 실제보다 높게 나옵니다.  덮은 비중 ${pct(D.metrics['변동성덮은비중'], 0)}`],
    ['최대낙폭 (가중합)', pct(D.metrics['최대낙폭_가중합']), BLUE,
     `덮은 비중 ${pct(D.metrics['낙폭덮은비중'], 0)}`],
    ['현금', pct(D.metrics['현금비중']), ORANGE,
     won(Math.round(D.amount * D.metrics['현금비중'] / 100))],
  ];
  cards.forEach(([label, value, color, sub], i) => {
    const x = 0.6 + i * 3.12;
    s.addShape(pres.ShapeType.rect, { x, y: 1.3, w: 2.92, h: 2.2,
      fill: { color: 'FFFFFF' }, line: { color: HAIR, width: 0.75 } });
    s.addText(label, { x: x + 0.25, y: 1.5, w: 2.45, h: 0.35, fontFace: KR,
      fontSize: 12, color: MUTED, isTextBox: true, margin: 0 });
    s.addText(value, { x: x + 0.25, y: 1.85, w: 2.45, h: 0.75, fontFace: KR,
      fontSize: 34, bold: true, color, isTextBox: true, margin: 0 });
    s.addText(sub, { x: x + 0.25, y: 2.62, w: 2.45, h: 0.75, fontFace: KR,
      fontSize: 9.5, color: MUTED, isTextBox: true, margin: 0 });
  });

  const cov = D.metrics['변동성덮은비중'];
  const warn = cov >= 99
    ? '포트폴리오 전체의 변동성을 셈했습니다.'
    : `변동성은 이 배분의 ${pct(cov, 0)}만 덮습니다. 나머지 ${pct(100 - cov, 0)}(주로 펀드)는 `
      + '기준가 이력이 7 거래일뿐이라 셈하지 않았습니다. 위 숫자를 포트폴리오 전체의 값으로 '
      + '읽지 마십시오.';
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 3.8, w: 12.1, h: 0.95,
    fill: { color: SURFACE }, line: { color: HAIR, width: 0.75 } });
  s.addText(warn, { x: 0.9, y: 3.95, w: 11.5, h: 0.7, fontFace: KR,
    fontSize: 12, color: INK, isTextBox: true, margin: 0 });

  const stats = D.classStats.filter(c => c['vol_중앙값'] != null);
  if (stats.length) {
    s.addChart(pres.ChartType.bar,
      [{ name: '변동성(중앙)', labels: stats.map(c => c.cls),
         values: stats.map(c => Number(c['vol_중앙값'].toFixed(1))) }],
      { x: 0.6, y: 4.95, w: 12.1, h: 1.85, barDir: 'bar',
        chartColors: [BLUE], showLegend: false,
        showValue: true, dataLabelPosition: 'outEnd',
        dataLabelFontFace: KR, dataLabelFontSize: 10, dataLabelColor: BODY,
        dataLabelFormatCode: '0.0"%"',
        catAxisLabelFontFace: KR, catAxisLabelFontSize: 11, catAxisLabelColor: BODY,
        valAxisLabelFontFace: KR, valAxisLabelFontSize: 10, valAxisLabelColor: MUTED,
        valGridLine: { color: 'E5E4E1', size: 0.5 }, catGridLine: { style: 'none' },
        showTitle: true, title: '자산군별 변동성 (중앙값) — 펀드는 산출 불가로 제외',
        titleFontFace: KR, titleFontSize: 12, titleColor: MUTED });
  }
  foot(s, '변동성은 자산군 사이 상관관계를 셈하지 않은 가중합입니다. 낮게 보이게 만드는 것보다 높게 두는 편이 안전합니다.');
  s.addNotes('덮은 비중을 반드시 함께 설명하십시오. 펀드가 섞이면 변동성은 일부만 덮습니다.');
}

// ── 4~. 제안 상품 (자산군 두 개씩) ────────────────────────────────────
{
  const classes = Object.keys(D.products);
  for (let i = 0; i < classes.length; i += 2) {
    const s = pres.addSlide();
    header(s, '4', i === 0 ? '제안 상품' : '제안 상품 (이어서)');
    classes.slice(i, i + 2).forEach((cls, j) => {
      const y = 1.2 + j * 2.85;
      const row = D.rows.find(r => r.cls === cls);
      s.addText(`${cls} — ${pct(row.pct)} · ${won(row.amount)}`,
        { x: 0.6, y, w: 12.1, h: 0.35, fontFace: KR, fontSize: 15,
          bold: true, color: INK, isTextBox: true, margin: 0 });
      const isStock = cls === '국내주식' || cls === '해외주식';
      if (isStock) {
        s.addText('시가총액 상위 종목입니다 — 종목 추천이 아닙니다.',
          { x: 0.6, y: y + 0.33, w: 12.1, h: 0.25, fontFace: KR, fontSize: 9.5,
            color: MUTED, isTextBox: true, margin: 0 });
      }
      const rows = [[
        { text: '상품', options: TH }, { text: '유형', options: TH },
        { text: '운용/발행', options: TH }, { text: '규모', options: TH },
        { text: '과거 1년', options: TH }, { text: '변동성', options: TH },
        { text: '보수', options: TH },
      ]];
      D.products[cls].forEach(p => rows.push([
        td(p.name.length > 30 ? p.name.slice(0, 29) + '…' : p.name),
        td(p.type || '—'), td(p.company || '—'),
        td(size(p.size), { align: 'right' }),
        td(pct(p.ret1y), { align: 'right', color: p.ret1y == null ? MUTED : BODY }),
        td(pct(p.vol), { align: 'right', color: p.vol == null ? MUTED : BODY }),
        td(fee(p), { align: 'right' }),
      ]));
      s.addTable(rows, { x: 0.6, y: y + (isStock ? 0.62 : 0.4), w: 12.1,
        colW: [3.9, 1.7, 2.0, 1.4, 1.1, 1.0, 1.0],
        border: { type: 'solid', color: HAIR, pt: 0.5 }, fontFace: KR,
        rowH: 0.28, valign: 'middle' });
    });
    foot(s, '규모와 보수로 고릅니다. 수익률 순으로 고르지 않습니다 — 지난해 제일 많이 오른 것을 권하는 습관이 고객에게 가장 비쌉니다.');
  }
}

// ── 마지막. 자료 출처와 유의사항 ──────────────────────────────────────
{
  const s = pres.addSlide();
  header(s, '', '자료 출처와 유의사항');
  const rows = [[
    { text: '자산군', options: TH }, { text: '원천', options: TH },
    { text: '종목', options: TH }, { text: '기준일', options: TH },
  ]];
  D.sources.forEach(x => rows.push([
    td(x.name),
    td(x.src.length > 62 ? x.src.slice(0, 61) + '…' : x.src),
    td(x.count == null ? '—' : String(x.count), { align: 'right' }),
    td(x.asOf, { align: 'right' }),
  ]));
  s.addTable(rows, { x: 0.6, y: 1.2, w: 12.1, colW: [1.5, 7.3, 1.1, 2.2],
    border: { type: 'solid', color: HAIR, pt: 0.5 }, fontFace: KR,
    rowH: 0.3, valign: 'middle' });

  const cautions = [
    '「과거 1년」은 원천에서 실제로 잰 값이며 미래 수익률이 아닙니다. 최근 1년이 그랬다는 것과 앞으로 그러리라는 것은 다른 말입니다.',
    '빈칸(—)은 원천에 없어 셈하지 않은 값입니다. 만들어 넣지 않았습니다.',
    '펀드는 기준가 이력이 7 거래일뿐이라 변동성·최대낙폭을 셈하지 않고 위험등급을 씁니다.',
    '펀드 보수는 클래스마다 달라 하나로 줄이지 않고 범위로 싣습니다.',
    '「해외펀드」는 해외에 설정된 뮤추얼펀드가 아니라 해외에 투자하는 국내 설정 공모펀드입니다.',
    '이 자료는 참고용이며 투자 권유가 아닙니다. 실제 제안 전 준법감시 검토를 받으십시오.',
  ];
  if (D.fxNote) cautions.splice(4, 0, D.fxNote + '했습니다.');
  s.addText(cautions.map((t, i) => ({
    text: t, options: { bullet: true, breakLine: i < cautions.length - 1 },
  })), { x: 0.6, y: 3.6, w: 12.1, h: 2.9, fontFace: KR, fontSize: 11.5,
    color: BODY, isTextBox: true, margin: 0, paraSpaceAfter: 7 });
  foot(s, `유니버스 ${D.universeGenerated || '—'} · 문서 ${D.generated} (KST)`);
  s.addNotes('출처와 기준일을 반드시 함께 보여 주십시오. 기준일 없는 수치는 자료가 남는 순간 거짓이 됩니다.');
}

await pres.writeFile({ fileName: D.out });
console.log(`슬라이드 ${pres.slides.length}장`);
