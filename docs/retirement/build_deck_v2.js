/**
 * 은퇴자산 운용 제안서 (6p) — 미래에셋 디자인 시스템 적용
 * 인쇄되는 모든 수치는 deck_data.json (model.py --export) 에서 읽는다.
 */
const pptxgen = require("pptxgenjs");
const D = require("./v2_deck_data.json");

// ── mas-design 토큰 ───────────────────────────────────────────────────────
const ORANGE = "F58220", ORANGE_ACTIVE = "CB6015", BLUE = "043B72";
const BLUE_MID = "0086B8", CYAN = "00A9CE", SOFT_ORANGE = "FAB072";
const TAN = "F0B26B", TERRA = "AD624E", SOFT_BLUE = "7E9FC3";
const GRAY_HL = "D7D7D7", SURFACE_SOFT = "ECEFF4", SURFACE_SUBTLE = "F7F8FA";
const HAIRLINE = "CDCECB", HAIRLINE_SOFT = "E5E4E1";
const INK = "1A1A1A", BODY = "3D3D3D", MUTED = "6C6C6C", MUTED_SOFT = "84888B";
const SUCCESS = "2E8540", ERRORC = "C62828", WHITE = "FFFFFF";

const KR = "Spoqa Han Sans Neo";
const CHART_PALETTE = [ORANGE, BLUE, SOFT_ORANGE, BLUE_MID, TERRA, CYAN, TAN, SOFT_BLUE, MUTED_SOFT];
const M = 0.5, CW = 13.333 - M * 2;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "미래에셋증권";
pres.title = "은퇴자산 운용 제안서";

const n1 = (v) => (v === null || v === undefined ? "-" : v.toFixed(1));
const n2 = (v) => (v === null || v === undefined ? "-" : v.toFixed(2));
const pct = (v) => (v === null || v === undefined ? "-" : v.toFixed(1) + "%");
const won = (v) => v.toLocaleString("en-US");

function sectionHeader(slide, title, sub) {
  slide.addShape(pres.ShapeType.rect, {
    x: M, y: 0.42, w: CW, h: 0.012, fill: { color: ORANGE }, line: { type: "none" },
  });
  slide.addText(title, {
    x: M, y: 0.5, w: CW, h: 0.42, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 23, bold: true, color: INK, valign: "top",
  });
  if (sub) {
    slide.addText(sub, {
      x: M, y: 0.95, w: CW, h: 0.26, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11, color: MUTED, valign: "top",
    });
  }
}
function footnote(slide, text, y) {
  slide.addText(text, {
    x: M, y: y === undefined ? 7.0 : y, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 7.5, color: MUTED_SOFT, valign: "top", lineSpacing: 11,
  });
}
function statCard(slide, o) {
  slide.addShape(pres.ShapeType.rect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || SURFACE_SUBTLE }, line: { color: HAIRLINE, width: 0.75 },
  });
  slide.addText(o.label, {
    x: o.x + 0.22, y: o.y + 0.16, w: o.w - 0.44, h: 0.34, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 9.5, color: MUTED, valign: "top", lineSpacing: 13,
  });
  slide.addText(o.value, {
    x: o.x + 0.22, y: o.y + 0.5, w: o.w - 0.44, h: 0.46, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 26, bold: true, color: o.accent || ORANGE, valign: "top",
  });
  slide.addText(o.note, {
    x: o.x + 0.22, y: o.y + 1.0, w: o.w - 0.44, h: o.h - 1.12, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 8.5, color: BODY, valign: "top", lineSpacing: 12,
  });
}
function panel(slide, o) {
  slide.addShape(pres.ShapeType.rect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || WHITE }, line: { color: HAIRLINE, width: 0.75 },
  });
  slide.addText(o.title, {
    x: o.x + 0.2, y: o.y + 0.14, w: o.w - 0.4, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 12, bold: true, color: o.titleColor || BLUE, valign: "top",
  });
  slide.addText(o.body, {
    x: o.x + 0.2, y: o.y + 0.5, w: o.w - 0.4, h: o.h - 0.66, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: o.bodySize || 9.5, color: BODY, valign: "top",
    lineSpacing: o.bodyLine || 15, paraSpaceAfter: o.bodyGap === undefined ? 5 : o.bodyGap,
  });
}
const TBL_BASE = {
  fontFace: KR, border: { type: "solid", color: HAIRLINE_SOFT, pt: 0.5 },
  autoPage: false, valign: "middle",
};
function th(text, opts) {
  return {
    text,
    options: Object.assign({
      fill: { color: SOFT_ORANGE }, bold: true, color: INK, fontSize: 9,
      align: "center", fontFace: KR,
    }, opts || {}),
  };
}
function td(text, opts) {
  return {
    text,
    options: Object.assign({ fontSize: 8.5, color: BODY, fontFace: KR }, opts || {}),
  };
}


const MT = D.meta;
const SRC_LINE =
  `상품 지표는 국내 상장 ETF ${MT.etfUniverse}종·국내 설정 공모펀드 ${MT.fundUniverse}종 실측 데이터셋 ` +
  `(${MT.provider} 수집 ${MT.etfCollectedAt}, 수익률 기준일 ${MT.retAsOf})에서 인용했습니다. ` +
  `ETF 3년은 연율, 펀드 3년은 누적이므로 펀드는 연율로 환산해 비교했습니다.`;
const MGR_SHORT = { "한국투자신탁운용": "한국투신", "한국투신운용": "한국투신", "미래에셋": "미래에셋", "삼성": "삼성",
  "하나": "하나", "코레이트": "코레이트", "피델리티": "피델리티" };
const shortMgr = (m) => (m ? (MGR_SHORT[m.replace("자산운용", "")] || m.replace("자산운용", "").slice(0, 6)) : "-");
const KIND_COLOR = { ETF: BLUE, "펀드": ORANGE_ACTIVE, "예금": MUTED_SOFT };

// ═════════════════════════════════ P1 표지
{
  const s = pres.addSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: ORANGE }, line: { type: "none" } });
  s.addText("[고객 제안용 · 개정판]", { x: 0.75, y: 0.6, w: 5, h: 0.3, isTextBox: true,
    margin: 0, fontFace: KR, fontSize: 10.5, color: WHITE, charSpacing: 1 });
  s.addText("은퇴자산 운용 제안서", { x: 0.75, y: 1.85, w: 11.5, h: 1.0, isTextBox: true,
    margin: 0, fontFace: KR, fontSize: 44, bold: true, color: WHITE, charSpacing: -1 });
  s.addText("전체 운용사 ETF + 채권형 펀드로 구성한 인컴 포트폴리오", {
    x: 0.75, y: 2.95, w: 11.5, h: 0.5, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 18, color: WHITE });
  s.addText(`ETF ${MT.etfUniverse}종 · 공모펀드 ${MT.fundUniverse}종 실측 비교로 선별 (수익률 기준일 ${MT.retAsOf})`, {
    x: 0.75, y: 3.42, w: 11.5, h: 0.4, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 13, color: WHITE });
  [["가구 총자산", `${D.total.toFixed(2)}억원`],
   ["목표 / 설계안", `연 ${D.target.toFixed(1)}% / ${D.portRate.toFixed(2)}%`],
   ["운용사 분산", `${D.managers.length}개사`],
   ["작성 기준일", "2026.09.07"]].forEach(([l, v], i) => {
    const x = 0.75 + i * 3.0;
    s.addText(l, { x, y: 4.5, w: 2.8, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 10, color: WHITE, charSpacing: 0.6 });
    s.addText(v, { x, y: 4.8, w: 2.8, h: 0.5, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 21, bold: true, color: WHITE });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.75, y: 5.66, w: 11.83, h: 0.011,
    fill: { color: WHITE }, line: { type: "none" } });
  s.addText(
    "대상: 만 57세 남성(은퇴 2029년 7월 예정) · 배우자 만 58세(2028년 은퇴, 월 280만원 연금 수령)\n" +
    "기대수익률은 3년 실측 총수익을 감액 적용한 설계 가정이며 미래 수익을 보장하지 않습니다. " +
    "펀드 수익률·보수는 실제 매수 가능한 클래스 기준입니다.",
    { x: 0.75, y: 5.92, w: 11.83, h: 0.9, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, lineSpacing: 15 });
  s.addNotes(`v2 개정판. 운용사 제약을 풀고 채권형 펀드를 편입해 전체 기대수익률 ${D.v1PortRate}% → ${D.portRate}%.`);
}

// ═════════════════════════════════ P2 무엇을 바꿨나
{
  const s = pres.addSlide();
  sectionHeader(s, "무엇을 바꿨나 — 운용사 제약을 풀고, 채권형 펀드를 넣었다",
    `ETF ${MT.etfUniverse}종과 공모펀드 ${MT.fundUniverse}종을 성과 기준으로 다시 비교해 선별`);

  const rows = [
    [th("구분", { align: "left" }), th("초판"), th("개정판"), th("차이")],
    [td("상품 범위"), td("TIGER ETF 중심", { align: "center" }),
     td(`${D.managers.length}개 운용사 ETF + 채권형 펀드`, { align: "center", bold: true }),
     td("성과 기준으로 재선별", { align: "center", color: BLUE })],
    [td("자산 유형"), td("ETF 100%", { align: "center" }),
     td(`ETF ${D.etfPct}% · 펀드 ${D.fundPct}% · 예금 ${D.gicPct}%`, { align: "center", bold: true }),
     td("이머징국공채·하이일드 추가", { align: "center", color: BLUE })],
    [td("안전자산 슬리브 기대수익률"), td(`${D.v1SafeRate.toFixed(2)}%`, { align: "center" }),
     td(`${D.safeRate.toFixed(2)}%`, { align: "center", bold: true, color: ORANGE_ACTIVE }),
     td(`+${D.dSafeRate.toFixed(2)}%p`, { align: "center", color: SUCCESS, bold: true })],
    [td("전체 기대수익률"), td(`${D.v1PortRate.toFixed(2)}%`, { align: "center" }),
     td(`${D.portRate.toFixed(2)}%`, { align: "center", bold: true, color: ORANGE_ACTIVE }),
     td(`+${D.dPortRate.toFixed(2)}%p`, { align: "center", color: SUCCESS, bold: true })],
    [td("목표 연 7% 달성", { bold: true, fill: { color: GRAY_HL }, color: INK }),
     td("미달 (−0.18%p)", { align: "center", bold: true, fill: { color: GRAY_HL }, color: ERRORC }),
     td("달성", { align: "center", bold: true, fill: { color: GRAY_HL }, color: SUCCESS }),
     td("규제 비용 축소", { align: "center", bold: true, fill: { color: GRAY_HL }, color: INK })],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 1.42, w: 6.55, colW: [1.85, 1.35, 2.05, 1.3], rowH: 0.44 }));

  panel(s, { x: M, y: 4.5, w: 6.55, h: 2.15, fill: SURFACE_SOFT,
    title: "안전자산 슬리브를 어떻게 끌어올렸나",
    bodySize: 9, bodyLine: 13, bodyGap: 6,
    body: [
      { text: `초판은 안전자산 ${D.safeAmt}억을 머니마켓·만기매칭 채권으로 채워 기대수익률이 ${D.v1SafeRate.toFixed(2)}%에 묶였다`, options: { bullet: true, breakLine: true } },
      { text: "개정판은 퇴직연금 클래스 채권형 펀드를 넣었다 — 삼성 누버거버먼 이머징국공채플러스(H) S-P는 3년 연율 10.45%에 총보수 0.34%", options: { bullet: true, breakLine: true } },
      { text: `채권형 펀드는 퇴직연금에서 안전자산으로 분류되므로, 30% 의무를 지키면서 수익률을 ${D.safeRate.toFixed(2)}%까지 올렸다 (규제 비용 ${D.regCostPp}%p로 축소)`, options: { bullet: true } },
    ] });

  const cx = 7.35, cw = 5.48;
  statCard(s, { x: cx, y: 1.42, w: cw, h: 1.42,
    label: "전체 기대수익률 (목표 연 7.0%)",
    value: `연 ${D.portRate.toFixed(2)}%`, accent: ORANGE,
    note: `초판 ${D.v1PortRate.toFixed(2)}% 대비 +${D.dPortRate.toFixed(2)}%p. 2031년 예금 만기 후 재투자 시 ${D.p3Rate.toFixed(2)}%(+${D.p3GapPp.toFixed(2)}%p).` });
  statCard(s, { x: cx, y: 3.0, w: cw, h: 1.42,
    label: "운용사 분산 (신규 운용자산 기준)",
    value: `${D.managers.length}개사`, accent: BLUE,
    note: D.managers.slice(0, 5).map((m) => `${m.name} ${m.pct}%`).join(" · ") + " 등" });
  statCard(s, { x: cx, y: 4.58, w: cw, h: 1.42,
    label: "채권 자산 편입 (ETF 외 공모펀드)",
    value: `${D.fundAmt.toFixed(2)}억`, accent: ORANGE_ACTIVE,
    note: "국내 크레딧·단기채와 해외 이머징국공채·아시아하이일드. ETF만으로는 담기 어려운 영역을 펀드로 채웠다." });

  footnote(s, SRC_LINE, 6.8);
  s.addNotes(`안전자산 ${D.safeAmt}억 = ${D.safePct}% · 안전 ${D.safeRate}% / 위험 ${D.riskRate}%.`);
}

// ═════════════════════════════════ P3 로드맵
{
  const s = pres.addSlide();
  sectionHeader(s, "시점별 자금흐름 로드맵 — 5단계",
    "지금 운용할 자산 / DC의 IRP 이전 / 예금 만기 / 국민연금 개시 시점을 하나의 흐름으로 배치");
  const phases = [["Phase 0", "2026.9~2029.6", ORANGE], ["Phase 1", "2029.7~2031", ORANGE_ACTIVE],
    ["Phase 2", "2031", MUTED_SOFT], ["Phase 3", "2031~2034", BLUE], ["Phase 4", "2034~", BLUE_MID]];
  const pw = CW / 5;
  phases.forEach(([n, sp, c], i) => {
    const x = M + i * pw;
    s.addShape(pres.ShapeType.chevron, { x, y: 1.36, w: pw - 0.03, h: 0.62,
      fill: { color: c }, line: { type: "none" } });
    s.addText(n, { x: x + 0.3, y: 1.42, w: pw - 0.55, h: 0.26, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, bold: true, color: WHITE, align: "center" });
    s.addText(sp, { x: x + 0.3, y: 1.67, w: pw - 0.55, h: 0.24, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, align: "center" });
  });
  const verdict = (v) => (v <= 0
    ? td(`여유 ${Math.abs(v)}`, { align: "center", color: SUCCESS, bold: true })
    : td(`부족 ${v}`, { align: "center", color: ERRORC, bold: true }));
  const rows = [
    [th("단계", { align: "left" }), th("주요 이벤트"), th("월 유입"), th("월 필요"), th("판정"), th("실행 조치")],
    [td("Phase 0", { bold: true, color: ORANGE }), td("본인 재직 · 배우자 은퇴(2028)"),
     td("근로소득\n+ 280 (2028~)", { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }),
     td("근로소득 충당", { align: "center", color: SUCCESS }),
     td("DC 6.40억 계좌 내 전환 · 증권현금 2.00억 · 배우자 4.00억 편입. 퇴직연금 클래스 펀드는 DC 계좌에서 바로 매수")],
    [td("Phase 1", { bold: true, color: ORANGE_ACTIVE }), td("본인 은퇴(만 60) · DC→IRP 이전"),
     td(`280 + 인컴 ${D.p1Income}\n= ${280 + D.p1Income}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), verdict(D.p1Gap),
     td(`DC+IRP ${D.trackA.toFixed(2)}억 통합. 부족분은 연금계좌에서 연 ${D.p1Withdraw}만원 인출 (사적연금 1,500만원 한도 이내)`)],
    [td("Phase 2", { bold: true, color: MUTED_SOFT }), td("은행예금 만기 · 자녀 결혼"),
     td(`만기 원리금\n${D.depMaturity}억 유입`, { align: "center", fontSize: 8 }),
     td("3.00억\n일시 지출", { align: "center", fontSize: 8 }),
     td("목적자금 집행", { align: "center", color: BLUE }),
     td(`결혼자금 3.00억 지급 후 잔여 ${D.depReinvest}억 재투자 → 월 인컴 +${D.mReinv}만원`)],
    [td("Phase 3", { bold: true, color: BLUE }), td("인컴 자립기 (국민연금 개시 전)"),
     td(`280 + 인컴 ${D.p3IncomeM}\n= ${280 + D.p3IncomeM}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), verdict(D.p3Gap),
     td(`예금이 5% 확정에서 인컴 포트폴리오로 넘어와 전체 기대수익률 ${D.portRate.toFixed(2)}% → ${D.p3Rate.toFixed(2)}%로 상승`)],
    [td("Phase 4", { bold: true, color: BLUE_MID }), td("본인 국민연금 개시(만 65)"),
     td(`530 + 인컴 ${D.p3IncomeM}\n= ${530 + D.p3IncomeM}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), verdict(D.p4Gap),
     td(`잉여 ${Math.abs(D.p4Gap)}만원으로 의료·장기요양 준비금 별도 적립`)],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 2.14, w: CW, colW: [0.85, 2.45, 1.35, 0.9, 1.15, 5.633], rowH: 0.72 }));
  footnote(s, "단위: 만원/월(별도 표기 제외). 본인 은퇴시점은 2026.09 기준 잔여 2년 10개월을 적용해 2029년 7월로 산정. " +
    `은행예금 만기는 자녀 결혼 시점과 일치한다는 고객 진술에 따라 2031년으로 가정했으며 원리금 ${D.depMaturity}억은 단리·이자소득세 15.4% 차감 기준입니다. ` +
    `월 인컴은 ETF 실측 분배율과, 분배율이 확인되지 않은 채권형 펀드는 기대수익률의 ${D.fundCashShare * 100}%만 현금으로 보는 보수적 가정으로 산출했습니다.`, 6.95);
}

// ═════════════════════════════════ P4 자산배분 + 운용사 분산
{
  const s = pres.addSlide();
  sectionHeader(s, `자산배분 — 목표 연 ${D.target.toFixed(1)}%, 설계안 ${D.portRate.toFixed(2)}%`,
    "신규 주식 편입 없이 이자·배당·옵션프리미엄으로 구성하고, 운용사와 자산 유형을 분산");

  s.addChart(pres.ChartType.doughnut, [{ name: "운용사",
    labels: D.managers.map((m) => m.name), values: D.managers.map((m) => m.pct) }], {
    x: M, y: 1.32, w: 5.5, h: 2.6, holeSize: 50, chartColors: CHART_PALETTE,
    showLegend: true, legendPos: "r", legendFontSize: 8, legendFontFace: KR,
    showValue: true, showPercent: false, dataLabelFontSize: 7.5, dataLabelFontFace: KR,
    dataLabelColor: WHITE, dataLabelFormatCode: '0.0"%"',
    showTitle: true, title: `운용사 분산 (신규 운용 ${D.newAmt.toFixed(2)}억 = 100%)`,
    titleFontSize: 10.5, titleFontFace: KR, titleColor: INK });

  s.addChart(pres.ChartType.bar, [{ name: "금액(억)",
    labels: ["ETF", "채권형 펀드", "원리금보장"],
    values: [D.etfAmt, D.fundAmt, D.gicAmt] }], {
    x: M, y: 4.05, w: 5.5, h: 2.1, barDir: "bar",
    chartColors: [BLUE, ORANGE, MUTED_SOFT], chartColorsOpacity: 100,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 9,
    dataLabelFontFace: KR, dataLabelColor: INK, dataLabelFormatCode: '0.00"억"',
    showLegend: false, valAxisMaxVal: 12,
    catAxisLabelColor: BODY, catAxisLabelFontSize: 9, catAxisLabelFontFace: KR,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 8, valAxisLabelFontFace: KR,
    valGridLine: { color: HAIRLINE_SOFT, size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: "자산 유형별 구성", titleFontSize: 10.5,
    titleFontFace: KR, titleColor: INK });

  const rows = [
    [th("자산 블록", { align: "left" }), th("금액(억)"), th("기대수익률"), th("연 수익(억)")],
    [td("은행 정기예금 — 확정금리"), td("3.70", { align: "right" }),
     td("5.00%", { align: "right" }), td(D.depositIncome.toFixed(3), { align: "right" })],
    [td("기존 보유주식 — 유지, 가정"), td("2.40", { align: "right" }),
     td("8.00%", { align: "right" }), td(D.equityIncome.toFixed(3), { align: "right" })],
    [td("신규 인컴 포트폴리오"), td(D.newAmt.toFixed(2), { align: "right", bold: true }),
     td(`${D.newRate.toFixed(2)}%`, { align: "right", bold: true }),
     td(D.newInc.toFixed(3), { align: "right", bold: true })],
    [td("가구 전체", { bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(D.total.toFixed(2), { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(`${D.portRate.toFixed(2)}%`, { align: "right", bold: true, fill: { color: GRAY_HL }, color: ORANGE_ACTIVE }),
     td(D.portIncome.toFixed(3), { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK })],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: 6.5, y: 1.6, w: 6.33, colW: [2.88, 1.05, 1.2, 1.2], rowH: 0.36 }));

  s.addText([
    { text: `목표 연 ${D.target.toFixed(2)}% → 설계안 ${D.portRate.toFixed(2)}% 달성`, options: { bold: true, fontSize: 12, color: WHITE, breakLine: true } },
    { text: `2031년 예금 만기 후 ${D.p3Rate.toFixed(2)}% (+${D.p3GapPp.toFixed(2)}%p)`, options: { fontSize: 11, color: WHITE } },
  ], { x: 6.5, y: 3.5, w: 6.33, h: 0.68, isTextBox: true, margin: 0,
    fontFace: KR, align: "center", valign: "middle", fill: { color: ORANGE }, lineSpacing: 15 });

  panel(s, { x: 6.5, y: 4.34, w: 6.33, h: 1.9,
    title: "이 배분이 지키는 제약",
    bodySize: 8.5, bodyLine: 12, bodyGap: 5,
    body: [
      { text: `연금계좌 안전자산 ${D.safeAmt}억(${D.safePct}%) — 위험자산 70% 한도 규정 충족. 채권형 펀드를 활용해 슬리브 기대수익률 ${D.safeRate.toFixed(2)}%`, options: { bullet: true, breakLine: true } },
      { text: `직접 주식은 기존 보유 2.40억뿐, 신규 편입 0. 은행예금·보유주식 ${D.locked.toFixed(2)}억은 손대지 않음`, options: { bullet: true, breakLine: true } },
      { text: "1년 총수익이 마이너스인 고분배 상품(미국 장기국채 커버드콜류)은 전부 제외 — 6페이지 참조", options: { bullet: true } },
    ] });

  footnote(s, `은행예금 5.00%는 확정금리(고객 제공)이며, 주식 8.00%와 신규 인컴 포트폴리오 ${D.newRate.toFixed(2)}%는 설계 가정으로 수익을 보장하지 않습니다. ` +
    "커버드콜·리츠 상품의 기초자산은 주식·부동산이며, 주가 상승 참여를 제한하는 대신 옵션프리미엄·임대수익을 현금으로 받는 구조입니다.", 6.36);
}

// ═════════════════════════════════ P5 상품 마스터 (ETF + 펀드)
{
  const s = pres.addSlide();
  sectionHeader(s, "실행 상품 — 운용사 무관 성과 기준 선별",
    `ETF ${MT.etfUniverse}종·공모펀드 ${MT.fundUniverse}종 비교. 펀드는 실제 매수 가능한 클래스 기준 (수익률 기준일 ${MT.retAsOf})`);

  const tiles = [
    ["트랙 A · 퇴직연금 DC → IRP", `${D.trackA.toFixed(2)}억 · 기대 연 ${D.rateA.toFixed(2)}% · 안전자산 ${D.safePct}%`, ORANGE],
    ["트랙 B · 증권 일반계좌", `${D.trackB.toFixed(2)}억 · 기대 연 ${D.rateB.toFixed(2)}%`, BLUE],
    ["트랙 C · 배우자 자산", `${D.trackC.toFixed(2)}억 · 기대 연 ${D.rateC.toFixed(2)}%`, BLUE_MID],
  ];
  const TW = 3.9;
  tiles.forEach(([h, sub, c], i) => {
    const x = M + i * (TW + 0.32);
    s.addShape(pres.ShapeType.rect, { x, y: 1.3, w: TW, h: 0.58,
      fill: { color: c }, line: { type: "none" } });
    s.addText(h, { x: x + 0.16, y: 1.33, w: TW - 0.32, h: 0.27, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 10.5, bold: true, color: WHITE, valign: "middle" });
    s.addText(sub, { x: x + 0.16, y: 1.59, w: TW - 0.32, h: 0.24, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 8.5, color: WHITE, valign: "middle" });
  });

  const H = { fontSize: 7.5 }, C = { fontSize: 7 };
  const rows = [[
    th("구분", H), th("상품명 · 클래스", { align: "left", ...H }), th("종목코드", H),
    th("운용사", H), th("총보수", H), th("분배율", H), th("총수익\n3년", H),
    th("총수익\n1년", H), th("기대", H), th("A", H), th("B", H), th("C", H),
  ]];
  D.masters.forEach((m) => {
    const neg = m.trY1 !== null && m.trY1 < 0;
    rows.push([
      td(m.kind, { ...C, align: "center", bold: true, color: KIND_COLOR[m.kind],
        fill: { color: m.kind === "ETF" ? WHITE : SURFACE_SOFT } }),
      td(m.disp, { ...C, color: INK }),
      td(m.ticker || (m.kind === "펀드" ? m.code || "-" : "-"), { ...C, align: "center", fontSize: 6.5 }),
      td(shortMgr(m.manager), { ...C, align: "center" }),
      td(m.ter === null ? "-" : `${m.ter}%`, { ...C, align: "right" }),
      td(m.dy === null ? "미확인" : `${n2(m.dy)}%`, { ...C, align: "right",
        color: m.dy === null ? MUTED_SOFT : BODY }),
      td(pct(m.trY3), { ...C, align: "right", bold: true }),
      td(pct(m.trY1), { ...C, align: "right", color: neg ? ERRORC : BODY, bold: neg }),
      td(`${n1(m.exp)}%`, { ...C, align: "right", bold: true, color: BLUE }),
      td(m.A ? n2(m.A) : "·", { ...C, align: "center", fill: { color: m.A ? SURFACE_SOFT : WHITE } }),
      td(m.B ? n2(m.B) : "·", { ...C, align: "center", fill: { color: m.B ? SURFACE_SOFT : WHITE } }),
      td(m.C ? n2(m.C) : "·", { ...C, align: "center", fill: { color: m.C ? SURFACE_SOFT : WHITE } }),
    ]);
  });
  rows.push([
    td("합계", { fontSize: 7.5, bold: true, align: "center", fill: { color: GRAY_HL }, color: INK }),
    ...Array(8).fill(null).map(() => td("", { fill: { color: GRAY_HL } })),
    td(D.trackA.toFixed(2), { fontSize: 7.5, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
    td(D.trackB.toFixed(2), { fontSize: 7.5, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
    td(D.trackC.toFixed(2), { fontSize: 7.5, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
  ]);
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 1.96, w: CW, rowH: 0.25,
    colW: [0.48, 4.22, 1.0, 1.0, 0.62, 0.68, 0.72, 0.72, 0.6, 0.56, 0.56, 0.57] }));

  s.addShape(pres.ShapeType.rect, { x: M, y: 5.85, w: CW, h: 0.72,
    fill: { color: SURFACE_SOFT }, line: { type: "none" } });
  s.addText([
    { text: "펀드를 볼 때 반드시 클래스로 봐야 하는 이유   ", options: { bold: true, fontSize: 9, color: ERRORC } },
    { text: "데이터셋의 모(母)펀드 레코드와 실제 매수 가능한 클래스의 수익률은 크게 다릅니다. " +
        "iM에셋 월지급 미국달러하이일드의 경우 모펀드 1년 수익률은 9.58%지만, 판매 클래스는 1.77~3.19%였습니다. " +
        "이 제안서의 펀드 수익률·총보수는 전부 판매 클래스 기준입니다.",
      options: { fontSize: 8, color: BODY } },
  ], { x: M + 0.22, y: 5.92, w: CW - 0.44, h: 0.62, isTextBox: true, margin: 0,
    fontFace: KR, valign: "top", lineSpacing: 12.5 });

  footnote(s, SRC_LINE +
    " 펀드 분배율은 데이터셋에 없어 '미확인'으로 표기했으며, 월지급식 여부와 실제 분배금은 실행 전 판매사에서 확인해야 합니다. " +
    "퇴직연금 클래스(S-P·C-P) 채권형 펀드는 안전자산으로 분류되나 세부 분류는 금융기관 내부기준에 따라 달라질 수 있어 매수 전 확인이 필요합니다. " +
    "기대수익률은 3년 실측 총수익을 45~70% 수준으로 감액한 설계 가정입니다.", 6.7);
  s.addNotes(`안전자산 ${D.safeAmt}억 = ${D.safePct}% 충족. 채권형 펀드 ${D.fundAmt.toFixed(2)}억 편입.`);
}

// ═════════════════════════════════ P6 검증·함정·세제
{
  const s = pres.addSlide();
  sectionHeader(s, "현금흐름 검증 · 제외 판정 · 세제 전략",
    `월 필요자금 ${D.needBase}만원을 어떤 재원으로, 어떤 세율로 조달하는가`);

  const cats = ["Phase 1\n2029.7~2031", "Phase 3\n2031~2034", "Phase 4\n2034~"];
  s.addChart(pres.ChartType.bar, [
    { name: "연금소득", labels: cats,
      values: [D.spousePension, D.spousePension, D.spousePension + D.npsSelf] },
    { name: "포트폴리오 인컴", labels: cats, values: [D.p1Income, D.p3IncomeM, D.p3IncomeM] },
  ], {
    x: M, y: 1.3, w: 6.1, h: 2.55, barDir: "col", barGrouping: "stacked",
    chartColors: [BLUE, ORANGE], showValue: true, dataLabelPosition: "ctr",
    dataLabelFontSize: 9, dataLabelFontFace: KR, dataLabelColor: WHITE,
    showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: KR,
    catAxisLabelColor: BODY, catAxisLabelFontSize: 8.5, catAxisLabelFontFace: KR,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 8.5, valAxisLabelFontFace: KR,
    valAxisMaxVal: 1200, valAxisMinVal: 0,
    valGridLine: { color: HAIRLINE_SOFT, size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: `단계별 월 현금흐름 (만원) — 필요 ${D.needBase}만원 대비`,
    titleFontSize: 10.5, titleFontFace: KR, titleColor: INK });
  s.addText([
    { text: "판정   ", options: { bold: true, fontSize: 9.5, color: BLUE } },
    { text: `Phase 1 부족 ${D.p1Gap}만원 → 연금계좌에서 연 ${D.p1Withdraw}만원 인출(1,500만원 한도 이내) · ` +
        `Phase 3 여유 ${Math.abs(D.p3Gap)}만원 · Phase 4 여유 ${Math.abs(D.p4Gap)}만원`,
      options: { fontSize: 9, color: BODY } },
  ], { x: M, y: 3.88, w: 6.1, h: 0.42, isTextBox: true, margin: 0, fontFace: KR, valign: "top", lineSpacing: 12 });

  s.addText("제외 판정 — 고분배인데 총수익이 마이너스인 상품", {
    x: 6.9, y: 1.3, w: 5.93, h: 0.28, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 12, bold: true, color: ERRORC, valign: "top" });
  const T = { fontSize: 7.5 };
  const trapRows = [[th("상품명", { align: "left", fontSize: 8 }), th("분배율", { fontSize: 8 }),
    th("총수익 1년", { fontSize: 8 }), th("판정", { fontSize: 8 })]];
  D.trap.forEach((t) => {
    const neg = t.trY1 !== null && t.trY1 < 0;
    trapRows.push([
      td(t.name, { ...T, color: INK }),
      td(`${n2(t.dy)}%`, { ...T, align: "right" }),
      td(pct(t.trY1), { ...T, align: "right", color: neg ? ERRORC : BODY, bold: neg }),
      td(t.used ? "축소 편입" : "제외", { ...T, align: "center",
        color: t.used ? ORANGE_ACTIVE : ERRORC, bold: true,
        fill: { color: t.used ? SURFACE_SOFT : WHITE } }),
    ]);
  });
  s.addTable(trapRows, Object.assign({}, TBL_BASE, {
    x: 6.9, y: 1.62, w: 5.93, colW: [3.05, 0.72, 0.9, 1.26], rowH: 0.285 }));
  s.addText("개정판에서는 이 7종을 전부 제외했다. 분배율 13%대 미국 장기국채 커버드콜은 분배금의 상당 부분이 원금 반환이어서 1년 총수익이 마이너스다. 그 자리를 3년 실적이 검증된 채권형 펀드로 대체했다.", {
    x: 6.9, y: 4.02, w: 5.93, h: 0.55, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 8.5, color: BODY, valign: "top", lineSpacing: 12 });

  panel(s, { x: M, y: 4.62, w: 6.1, h: 2.03, fill: SURFACE_SUBTLE,
    title: "세제 전략", bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "퇴직급여는 연금으로 수령 — 이연퇴직소득의 연금소득세율은 퇴직소득세율의 70%(10년차까지), 11년차 이후 60%. 일시금 대비 약 30~40% 절감", options: { bullet: true, breakLine: true } },
      { text: `Phase 1 연금 인출액 연 ${D.p1Withdraw}만원은 사적연금 1,500만원 종합과세 기준 이내. Phase 3부터 인출을 멈춰 과세이연 유지`, options: { bullet: true, breakLine: true } },
      { text: `금융소득종합과세 기준 연 ${won(D.finLimit)}만원 — 본인 ${won(D.selfFin)}만원(이내), 배우자 ${won(D.spouseFin)}만원(초과). 부부 ISA 한도를 매년 소진하면 약 ${won(D.isaShielded)}만원을 과세대상에서 제외`, options: { bullet: true } },
    ] });
  panel(s, { x: 6.9, y: 4.62, w: 5.93, h: 2.03, fill: SURFACE_SUBTLE,
    title: "리스크와 실행", titleColor: BLUE, bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "이머징 채권·하이일드 편입으로 신용·환 리스크가 늘었다. 해외채권 펀드 비중을 신규 운용자산의 " + `${D.fundPct}% 이내로 유지하고 반기 1회 재점검`, options: { bullet: true, breakLine: true } },
      { text: "펀드 총보수는 ETF보다 높다(0.22~1.05%). 같은 전략에 더 싼 클래스가 있으면 교체", options: { bullet: true, breakLine: true } },
      { text: `1개월 내 DC 6.40억 전환·증권 현금 2.00억 편입·부부 ISA 개설 / 3개월 내 배우자 4.00억 재배치 / 2029년 7월 DC를 IRP로 이전해 ${D.trackA.toFixed(2)}억 통합`, options: { bullet: true } },
    ] });

  footnote(s, SRC_LINE +
    " 세율·한도는 2026년 기준이며 세법 개정 시 달라집니다. 개별 세액은 다른 소득과 합산해 산정되므로 실행 전 세무 상담을 권합니다. " +
    "사적연금 인출액의 건강보험료 부과 여부는 국민건강보험공단 1차 자료로 확인하지 못해 단정하지 않았습니다.", 6.78);
}

const out = "은퇴자산_운용제안서_v2_전체운용사_2026-09-07.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("written:", out));
