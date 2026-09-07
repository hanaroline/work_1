/**
 * 은퇴자산 운용 제안서 (6p) — 미래에셋 디자인 시스템 적용
 * 인쇄되는 모든 수치는 deck_data.json (model.py --export) 에서 읽는다.
 */
const pptxgen = require("pptxgenjs");
const D = require("./deck_data.json");

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

const SRC_LINE =
  `상품 지표(분배율·총수익·보수·순자산)는 국내 상장 ETF ${D.etfMeta.universeCount}종 실측 데이터셋 ` +
  `(${D.etfMeta.provider} 수집 ${D.etfMeta.collectedAt}, 수익률 기준일 ${D.etfMeta.retAsOf})에서 인용했습니다.`;

// ═══════════════════════════════════════════════ P1 표지
{
  const s = pres.addSlide();
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText("[고객 제안용]", {
    x: 0.75, y: 0.6, w: 4, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 10.5, color: WHITE, charSpacing: 1,
  });
  s.addText("은퇴자산 운용 제안서", {
    x: 0.75, y: 1.95, w: 11.5, h: 1.0, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 44, bold: true, color: WHITE, charSpacing: -1,
  });
  s.addText("인컴 중심 노후 현금흐름 설계 — 이자·배당으로 매월 생활비를 만드는 구조", {
    x: 0.75, y: 3.05, w: 11.5, h: 0.5, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 18, color: WHITE,
  });
  [["가구 총자산", `${D.total}억원`], ["목표수익률", `연 ${D.target.toFixed(1)}%`],
   ["설계 구간", "2026 → 2034+"], ["작성 기준일", "2026.09.07"]]
    .forEach(([label, value], i) => {
      const x = 0.75 + i * 3.0;
      s.addText(label, {
        x, y: 4.55, w: 2.7, h: 0.28, isTextBox: true, margin: 0,
        fontFace: KR, fontSize: 10, color: WHITE, charSpacing: 0.6,
      });
      s.addText(value, {
        x, y: 4.85, w: 2.7, h: 0.5, isTextBox: true, margin: 0,
        fontFace: KR, fontSize: 22, bold: true, color: WHITE,
      });
    });
  s.addShape(pres.ShapeType.rect, {
    x: 0.75, y: 5.7, w: 11.83, h: 0.011, fill: { color: WHITE }, line: { type: "none" },
  });
  s.addText(
    "대상: 만 57세 남성(은퇴 2029년 7월 예정) · 배우자 만 58세(2028년 은퇴, 월 280만원 연금 수령)\n" +
    `상품 선정은 국내 상장 ETF ${D.etfMeta.universeCount}종 실측 데이터(수익률 기준일 ${D.etfMeta.retAsOf})에 근거했습니다. ` +
    "기대수익률은 설계 가정이며 미래 수익을 보장하지 않습니다.",
    { x: 0.75, y: 5.95, w: 11.83, h: 0.9, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, lineSpacing: 15 });
  s.addNotes(`가구 총자산 ${D.total}억(본인 ${D.self} + 배우자 ${D.spouse}). ` +
    `목표 연 ${D.target}%는 고객 지정값. 설계안 기대수익률 ${D.portRate}%, 예금 만기 후 ${D.p3Rate}%.`);
}

// ═══════════════════════════════════════════════ P2 현황 진단
{
  const s = pres.addSlide();
  sectionHeader(s, "현황 진단 — 자산은 충분하나, 현금흐름 배치가 비어 있다",
    `가구 총자산 ${D.total}억 · 즉시 재배치 가능 ${D.realloc}억(${D.reallocPct}%) · ` +
    `만기·유지 제약 ${D.locked}억(${D.lockedPct}%)`);

  const rows = [
    [th("구분", { align: "left" }), th("자산"), th("금액(억)"), th("현재 상태 / 제약")],
    [td("본인"), td("퇴직연금 DC"), td("6.40", { align: "right", bold: true }),
      td("현금성 자산으로 방치 — 즉시 전환 대상", { color: ERRORC })],
    [td("본인"), td("개인 IRP"), td("0.88", { align: "right" }), td("운용 중 — 재배치 대상")],
    [td("본인"), td("은행 5년 정기예금"), td("3.70", { align: "right" }),
      td("연 5% 확정 · 만기까지 인출 불가")],
    [td("본인"), td("증권 현금"), td("2.00", { align: "right" }), td("미운용 — 즉시 전환 대상")],
    [td("본인"), td("국내·해외주식"), td("2.40", { align: "right" }), td("매도하지 않고 그대로 유지")],
    [td("배우자"), td("보유자산"), td("4.00", { align: "right" }), td("전액 재배치 가능")],
    [td("합계", { bold: true, fill: { color: GRAY_HL }, color: INK }),
     td("가구 전체", { bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(D.total.toFixed(2), { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(`본인 ${D.self} + 배우자 ${D.spouse}`, { bold: true, fill: { color: GRAY_HL }, color: INK })],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 1.42, w: 6.55, colW: [0.72, 1.55, 0.92, 3.36], rowH: 0.33,
  }));

  panel(s, {
    x: M, y: 4.38, w: 6.55, h: 2.27, fill: SURFACE_SOFT,
    title: "핵심 과제 — 이 셋을 동시에 풀어야 한다",
    body: [
      { text: `현금성 6.40억의 즉시 전환 — 퇴직연금 DC가 현금으로 놀고 있어, 은퇴까지 ${D.monthsToRetire}개월간 약 ${won(D.dcCostTotal)}만원의 수익 기회를 잃는 상태`, options: { bullet: true, breakLine: true } },
      { text: "5년의 소득 공백 — 본인 은퇴(2029.7)부터 국민연금 개시(2034)까지는 배우자 연금 280만원이 유일한 확정 소득", options: { bullet: true, breakLine: true } },
      { text: `제약 안에서의 연 ${D.target.toFixed(0)}% — 은행예금 3.70억은 만기까지 묶여 있고 주식 2.40억은 유지 대상이므로, 남은 ${D.realloc}억만으로 목표를 만들어야 함`, options: { bullet: true } },
    ],
  });

  const cx = 7.35, cw = 5.48;
  statCard(s, { x: cx, y: 1.42, w: cw, h: 1.42,
    label: "DC 6.4억을 현금성으로 두는 데 드는 기회비용",
    value: `연 ${won(D.dcCostYr)}만원`, accent: ERRORC,
    note: `제안 포트폴리오 ${D.rateA}% vs 대기성 현금 ${D.cashParkRate.toFixed(2)}%(가정) 격차 ${D.dcGapRate}%p. ` +
      `은퇴까지 남은 ${D.monthsToRetire}개월 누적 약 ${won(D.dcCostTotal)}만원.` });
  statCard(s, { x: cx, y: 3.0, w: cw, h: 1.42,
    label: "매월 필요자금 (생활 650 + 부모님 용돈 100)",
    value: `${D.needBase}만원`, accent: BLUE,
    note: `생활자금 600~700만원의 중간값 기준. 확보된 연금은 배우자 ${D.spousePension}만원(2028~), ` +
      `본인 국민연금 ${D.npsSelf}만원(2034~).` });
  statCard(s, { x: cx, y: 4.58, w: cw, h: 1.42,
    label: "목표 연 7%를 위해 신규 운용자산이 내야 할 수익률",
    value: `연 ${D.requiredRate}%`, accent: ORANGE,
    note: `예금 3.70억(5%)·주식 2.40억(8% 가정) 기여를 제외하면, 남은 ${D.realloc}억이 ` +
      `연 ${D.requiredRate}%를 내야 전체 7%가 성립.` });

  footnote(s, "자산·지출·연금 금액은 고객 제공 자료(2026.09.07 기준). 대기성 현금 2.50%와 주식 기대수익률 8.00%는 제안자 설계 가정으로 보장되지 않습니다. " +
    "은행예금 연 5%는 기존 가입 상품의 확정금리이며, 2026년 9월 신규 5년 예금 시장금리(3%대)보다 크게 높은 이례적 조건입니다.", 6.8);
  s.addNotes(`DC 기회비용 = 6.40억 x (${D.rateA}% - ${D.cashParkRate}%) = 연 ${won(D.dcCostYr)}만원, ` +
    `${D.monthsToRetire}개월 누적 ${won(D.dcCostTotal)}만원.`);
}

// ═══════════════════════════════════════════════ P3 로드맵
{
  const s = pres.addSlide();
  sectionHeader(s, "시점별 자금흐름 로드맵 — 5단계",
    "지금 운용할 자산 / DC의 IRP 이전 / 예금 만기 / 국민연금 개시 시점을 하나의 흐름으로 배치");

  const phases = [["Phase 0", "2026.9~2029.6", ORANGE], ["Phase 1", "2029.7~2031", ORANGE_ACTIVE],
    ["Phase 2", "2031", MUTED_SOFT], ["Phase 3", "2031~2034", BLUE], ["Phase 4", "2034~", BLUE_MID]];
  const pw = CW / 5;
  phases.forEach(([name, span, color], i) => {
    const x = M + i * pw;
    s.addShape(pres.ShapeType.chevron, {
      x, y: 1.36, w: pw - 0.03, h: 0.62, fill: { color }, line: { type: "none" } });
    s.addText(name, { x: x + 0.3, y: 1.42, w: pw - 0.55, h: 0.26, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, bold: true, color: WHITE, align: "center" });
    s.addText(span, { x: x + 0.3, y: 1.67, w: pw - 0.55, h: 0.24, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, align: "center" });
  });

  const surplus = (v) => (v <= 0
    ? td(`여유 ${Math.abs(v)}`, { align: "center", color: SUCCESS, bold: true })
    : td(`부족 ${v}`, { align: "center", color: ERRORC, bold: true }));

  const rows = [
    [th("단계", { align: "left" }), th("주요 이벤트"), th("월 유입"), th("월 필요"), th("판정"), th("실행 조치")],
    [td("Phase 0", { bold: true, color: ORANGE }), td("본인 재직 · 배우자 은퇴(2028)"),
     td("근로소득\n+ 280 (2028~)", { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }),
     td("근로소득 충당", { align: "center", color: SUCCESS }),
     td("DC 6.40억 계좌 내 운용 전환 · 증권현금 2.00억 · 배우자 4.00억 인컴 편입. 발생 인컴은 전액 재투자")],
    [td("Phase 1", { bold: true, color: ORANGE_ACTIVE }), td("본인 은퇴(만 60) · DC→IRP 이전"),
     td(`280 + 인컴 ${D.p1Income}\n= ${280 + D.p1Income}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), surplus(D.p1Gap),
     td("DC+IRP 7.28억 통합. 실측 분배율 기준 인컴만으로 필요액을 충족 → 연금계좌 인출 없이 과세이연 유지")],
    [td("Phase 2", { bold: true, color: MUTED_SOFT }), td("은행예금 만기 · 자녀 결혼"),
     td(`만기 원리금\n${D.depMaturity}억 유입`, { align: "center", fontSize: 8 }),
     td("3.00억\n일시 지출", { align: "center", fontSize: 8 }),
     td("목적자금 집행", { align: "center", color: BLUE }),
     td(`결혼자금 3.00억 지급 후 잔여 ${D.depReinvest}억을 인컴 포트폴리오로 재투자 → 월 인컴 +${D.mReinv}만원`)],
    [td("Phase 3", { bold: true, color: BLUE }), td("인컴 자립기 (국민연금 개시 전)"),
     td(`280 + 인컴 ${D.p3Income}\n= ${280 + D.p3Income}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), surplus(D.p3Gap),
     td(`예금이 5% 확정에서 인컴 포트폴리오로 넘어와 전체 기대수익률이 ${D.portRate}% → ${D.p3Rate}%로 상승`)],
    [td("Phase 4", { bold: true, color: BLUE_MID }), td("본인 국민연금 개시(만 65)"),
     td(`530 + 인컴 ${D.p3Income}\n= ${530 + D.p3Income}`, { align: "center", fontSize: 8 }),
     td(String(D.needBase), { align: "center" }), surplus(D.p4Gap),
     td(`잉여 ${Math.abs(D.p4Gap)}만원으로 의료·장기요양 준비금 별도 적립. 인플레이션 대응 인출률 상향 여력 확보`)],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 2.14, w: CW, colW: [0.85, 2.45, 1.35, 0.9, 1.15, 5.633], rowH: 0.72,
  }));

  footnote(s, "단위: 만원/월(별도 표기 제외). 본인 은퇴시점은 2026.09 기준 잔여 2년 10개월을 적용해 2029년 7월로 산정. " +
    `은행예금 만기는 자녀 결혼 시점(5년 후)과 일치한다는 고객 진술에 따라 2031년으로 가정했으며, 만기 원리금 ${D.depMaturity}억은 단리·이자소득세 15.4% 차감 기준입니다. ` +
    `월 인컴은 실측 분배율 기준 추정치이며, 만기를 2031년에 맞춘 만기매칭형 채권 ETF는 위 데이터셋(${D.etfMeta.universeCount}종)에서 확인되지 않았습니다(최장 2028-12).`, 6.95);
  s.addNotes(`예금 만기: 3.70억 x 5% x 5년 = 세전 0.925억 → 세후 이자 ${D.depInterestNet}억 → 원리금 ${D.depMaturity}억. ` +
    `3억 지출 후 ${D.depReinvest}억 재투자 → 월 ${D.mReinv}만원.`);
}

// ═══════════════════════════════════════════════ P4 자산배분
{
  const s = pres.addSlide();
  sectionHeader(s, `자산배분 — 목표 연 ${D.target.toFixed(1)}%와 설계안 ${D.portRate}%`,
    "신규 주식 편입 없이, 이자·배당·옵션프리미엄으로 수익원을 구성");

  const cls = D.classes.slice();
  const keep = cls.slice(0, 8);
  const restPct = Math.round((cls.slice(8).reduce((a, b) => a + b.pct, 0)) * 10) / 10;
  const labels = keep.map((c) => c.name).concat(restPct > 0 ? ["기타 인컴자산"] : []);
  const values = keep.map((c) => c.pct).concat(restPct > 0 ? [restPct] : []);
  s.addChart(pres.ChartType.doughnut, [{ name: "자산군 비중", labels, values }], {
    x: M, y: 1.35, w: 6.1, h: 4.75, holeSize: 52, chartColors: CHART_PALETTE,
    showLegend: true, legendPos: "r", legendFontSize: 8.5, legendFontFace: KR,
    showValue: true, showPercent: false,
    dataLabelFontSize: 8.5, dataLabelFontFace: KR, dataLabelColor: WHITE,
    dataLabelFormatCode: '0.0"%"',
    showTitle: true, title: `자산군별 배분 (가구 총자산 ${D.total}억 = 100%)`,
    titleFontSize: 11, titleFontFace: KR, titleColor: INK,
  });

  const rows = [
    [th("자산 블록", { align: "left" }), th("금액(억)"), th("기대수익률"), th("연 수익(억)")],
    [td("은행 정기예금 — 확정금리"), td("3.70", { align: "right" }),
     td("5.00%", { align: "right" }), td(D.depositIncome.toFixed(3), { align: "right" })],
    [td("기존 보유주식 — 유지, 가정"), td("2.40", { align: "right" }),
     td("8.00%", { align: "right" }), td(D.equityIncome.toFixed(3), { align: "right" })],
    [td("신규 인컴 포트폴리오"), td(D.newAmt.toFixed(2), { align: "right", bold: true }),
     td(`${D.newRate}%`, { align: "right", bold: true }),
     td(D.newInc.toFixed(3), { align: "right", bold: true })],
    [td("가구 전체", { bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(D.total.toFixed(2), { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
     td(`${D.portRate}%`, { align: "right", bold: true, fill: { color: GRAY_HL }, color: ORANGE_ACTIVE }),
     td(D.portIncome.toFixed(3), { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK })],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: 6.9, y: 1.6, w: 5.93, colW: [2.63, 1.0, 1.15, 1.15], rowH: 0.36,
  }));

  s.addText([
    { text: `현 시점 ${D.portRate}% (목표 ${D.gapPp}%p)`, options: { bold: true, fontSize: 12, color: WHITE, breakLine: true } },
    { text: `2031년 예금 만기 후 ${D.p3Rate}% (목표 +${D.p3GapPp}%p) — 목표 초과`, options: { fontSize: 11, color: WHITE } },
  ], {
    x: 6.9, y: 3.48, w: 5.93, h: 0.68, isTextBox: true, margin: 0,
    fontFace: KR, align: "center", valign: "middle", fill: { color: ORANGE }, lineSpacing: 15,
  });

  panel(s, {
    x: 6.9, y: 4.32, w: 5.93, h: 1.92,
    title: `목표까지 ${Math.abs(D.gapPp)}%p 부족한 이유는 규제다`,
    titleColor: ERRORC, bodySize: 8.5, bodyLine: 12, bodyGap: 5,
    body: [
      { text: `연금계좌 안전자산 의무 — 7.28억 중 ${D.safeAmt}억(${D.safePct}%)이 기대 ${D.safeRate}%에 묶임. 위험자산 수준(${D.riskRate}%) 적용 시 전체 +${D.regCostPp}%p`, options: { bullet: true, breakLine: true } },
      { text: "분배율 13%대 미국 장기국채 커버드콜은 1년 총수익이 마이너스여서 0.60억으로 축소 (다음 장)", options: { bullet: true, breakLine: true } },
      { text: `직접 주식은 기존 보유 2.40억(${D.equityPct}%)뿐, 신규 편입 0. 순수 채권·현금성 ${D.safeAmt}억`, options: { bullet: true } },
    ],
  });

  footnote(s, `은행예금 5.00%는 확정금리(고객 제공)이며, 주식 8.00%와 신규 인컴 포트폴리오 ${D.newRate}%는 제안자 설계 가정으로 수익을 보장하지 않습니다. ` +
    "커버드콜·리츠 상품의 기초자산은 주식·부동산이며, 주가 상승 참여를 제한하는 대신 옵션프리미엄·임대수익을 현금으로 받는 구조입니다. " +
    "데이터셋의 자산구성 필드는 기초 ETF를 주식으로 분류하므로 룩스루 주식비중은 수치로 제시하지 않았습니다.", 6.4);
  s.addNotes(`${D.depositIncome} + ${D.equityIncome} + ${D.newInc} = ${D.portIncome}억 / ${D.total}억 = ${D.portRate}%. ` +
    `예금 만기 후 ${D.p3Income}억 / ${D.p3Total}억 = ${D.p3Rate}%.`);
}

// ═══════════════════════════════════════════════ P5 실행 상품 (실측 데이터)
{
  const s = pres.addSlide();
  sectionHeader(s, "계좌별 실행 상품 — 실측 데이터로 선별",
    `국내 상장 ETF ${D.etfMeta.universeCount}종의 분배율·총수익·보수·순자산을 비교해 선정 (수익률 기준일 ${D.etfMeta.retAsOf})`);

  const tiles = [
    ["트랙 A · 퇴직연금 DC → IRP", `${D.trackA.toFixed(2)}억 · 기대 연 ${D.rateA}% · 안전자산 ${D.safePct}%`, ORANGE],
    ["트랙 B · 증권 일반계좌", `${D.trackB.toFixed(2)}억 · 기대 연 ${D.rateB}% · 실측 분배율 ${D.cashB}%`, BLUE],
    ["트랙 C · 배우자 자산", `${D.trackC.toFixed(2)}억 · 기대 연 ${D.rateC}% · 실측 분배율 ${D.cashC}%`, BLUE_MID],
  ];
  const TW = 3.9;
  tiles.forEach(([head, sub, color], i) => {
    const x = M + i * (TW + 0.32);
    s.addShape(pres.ShapeType.rect, {
      x, y: 1.3, w: TW, h: 0.6, fill: { color }, line: { type: "none" } });
    s.addText(head, { x: x + 0.16, y: 1.34, w: TW - 0.32, h: 0.27, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 10.5, bold: true, color: WHITE, valign: "middle" });
    s.addText(sub, { x: x + 0.16, y: 1.6, w: TW - 0.32, h: 0.25, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 8.5, color: WHITE, valign: "middle" });
  });

  const H = { fontSize: 8 };
  const rows = [[
    th("상품명", { align: "left", ...H }), th("종목코드", H), th("순자산\n(억)", H),
    th("총보수", H), th("분배율", H), th("총수익\n1년", H), th("총수익\n3년", H),
    th("기대\n수익", H), th("트랙 A", H), th("트랙 B", H), th("트랙 C", H), th("합계", H),
  ]];
  const C = { fontSize: 7.5 };
  D.masters.forEach((m) => {
    const neg = m.trY1 !== null && m.trY1 < 0;
    rows.push([
      td(m.name, { ...C, color: INK }),
      td(m.code === "GIC" ? "-" : m.code, { ...C, align: "center" }),
      td(m.aum === null ? "-" : won(m.aum), { ...C, align: "right" }),
      td(m.ter === null ? "-" : `${m.ter}%`, { ...C, align: "right" }),
      td(m.dy === null ? "-" : `${n2(m.dy)}%`, { ...C, align: "right" }),
      td(pct(m.trY1), { ...C, align: "right", color: neg ? ERRORC : BODY, bold: neg }),
      td(pct(m.trY3), { ...C, align: "right" }),
      td(`${n1(m.exp)}%`, { ...C, align: "right", bold: true, color: BLUE }),
      td(m.A ? n2(m.A) : "·", { ...C, align: "center", fill: { color: m.A ? SURFACE_SOFT : WHITE } }),
      td(m.B ? n2(m.B) : "·", { ...C, align: "center", fill: { color: m.B ? SURFACE_SOFT : WHITE } }),
      td(m.C ? n2(m.C) : "·", { ...C, align: "center", fill: { color: m.C ? SURFACE_SOFT : WHITE } }),
      td(n2(m.total), { ...C, align: "right", bold: true }),
    ]);
  });
  rows.push([
    td("합계", { bold: true, fontSize: 8, fill: { color: GRAY_HL }, color: INK }),
    ...["", "", "", "", "", "", ""].map(() =>
      td("", { fill: { color: GRAY_HL } })),
    td(D.trackA.toFixed(2), { fontSize: 8, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
    td(D.trackB.toFixed(2), { fontSize: 8, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
    td(D.trackC.toFixed(2), { fontSize: 8, align: "center", bold: true, fill: { color: GRAY_HL }, color: INK }),
    td(D.newAmt.toFixed(2), { fontSize: 8, align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
  ]);
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 2.0, w: CW, rowH: 0.28,
    colW: [4.05, 0.78, 0.72, 0.62, 0.72, 0.78, 0.78, 0.72, 0.66, 0.66, 0.66, 0.98],
  }));

  s.addShape(pres.ShapeType.rect, {
    x: M, y: 6.02, w: CW, h: 0.72, fill: { color: SURFACE_SOFT }, line: { type: "none" } });
  s.addText([
    { text: "선정 원칙   ", options: { bold: true, fontSize: 9.5, color: BLUE } },
    { text: "① 분배율이 아니라 총수익(TR)으로 판정 — 1년 총수익이 마이너스인 상품은 고분배라도 배제·축소   " +
        "② 3년 실측 총수익이 있는 상품 우선   ③ 순자산 1,000억 이상·총보수 낮은 순   " +
        "④ 고분배 상품은 분배금이 과세되지 않는 연금계좌에 우선 배치",
      options: { fontSize: 8.5, color: BODY } },
  ], { x: M + 0.22, y: 6.1, w: CW - 0.44, h: 0.6, isTextBox: true, margin: 0,
    fontFace: KR, valign: "middle", lineSpacing: 13 });

  footnote(s, SRC_LINE +
    " 총수익(TR)은 분배금 재투자 기준 과거 실적이며 미래 수익을 보장하지 않습니다. 기대수익률은 3년 실측 총수익을 감액 적용한 설계 가정입니다. " +
    "연금계좌(DC·IRP)는 위험자산 70% 한도가 적용되어 안전자산 30% 이상 편입이 필요하며, 해외 직상장 ETF·레버리지 상품은 편입할 수 없습니다. " +
    "원리금보장 IRP 예금 금리 3.0%는 가정이며 실제 제시금리는 가입 시점에 확정됩니다.", 6.84);
  s.addNotes(`연금계좌 안전자산 ${D.safeAmt}억 = ${D.safePct}%로 규정 충족. ` +
    `안전 슬리브 ${D.safeRate}% / 위험 슬리브 ${D.riskRate}%.`);
}

// ═══════════════════════════════════════════════ P6 검증·세제·리스크
{
  const s = pres.addSlide();
  sectionHeader(s, "현금흐름 검증 · 분배율 함정 점검 · 세제 전략",
    `월 필요자금 ${D.needBase}만원을 어떤 재원으로, 어떤 세율로 조달하는가`);

  const cats = ["Phase 1\n2029.7~2031", "Phase 3\n2031~2034", "Phase 4\n2034~"];
  s.addChart(pres.ChartType.bar, [
    { name: "연금소득", labels: cats, values: [D.spousePension, D.spousePension, D.spousePension + D.npsSelf] },
    { name: "포트폴리오 인컴", labels: cats, values: [D.p1Income, D.p3Income, D.p3Income] },
  ], {
    x: M, y: 1.3, w: 6.1, h: 2.55, barDir: "col", barGrouping: "stacked",
    chartColors: [BLUE, ORANGE],
    showValue: true, dataLabelPosition: "ctr",
    dataLabelFontSize: 9, dataLabelFontFace: KR, dataLabelColor: WHITE,
    showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: KR,
    catAxisLabelColor: BODY, catAxisLabelFontSize: 8.5, catAxisLabelFontFace: KR,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 8.5, valAxisLabelFontFace: KR,
    valAxisMaxVal: 1200, valAxisMinVal: 0,
    valGridLine: { color: HAIRLINE_SOFT, size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: `단계별 월 현금흐름 (만원) — 필요 ${D.needBase}만원 대비`,
    titleFontSize: 10.5, titleFontFace: KR, titleColor: INK,
  });
  s.addText([
    { text: "판정   ", options: { bold: true, fontSize: 9.5, color: BLUE } },
    { text: `Phase 1 여유 ${Math.abs(D.p1Gap)}만원 · Phase 3 여유 ${Math.abs(D.p3Gap)}만원 · Phase 4 여유 ${Math.abs(D.p4Gap)}만원 — 전 구간 연금계좌 인출 불필요`,
      options: { fontSize: 9, color: BODY } },
  ], { x: M, y: 3.88, w: 6.1, h: 0.3, isTextBox: true, margin: 0, fontFace: KR, valign: "middle" });

  s.addText("분배율 함정 점검 — 고분배 상품의 실제 총수익", {
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
      td(t.used ? "축소 편입" : "제외", {
        ...T, align: "center", color: t.used ? ORANGE_ACTIVE : ERRORC, bold: true,
        fill: { color: t.used ? SURFACE_SOFT : WHITE } }),
    ]);
  });
  s.addTable(trapRows, Object.assign({}, TBL_BASE, {
    x: 6.9, y: 1.62, w: 5.93, colW: [3.05, 0.72, 0.9, 1.26], rowH: 0.285,
  }));
  s.addText("분배율 13%대 미국 장기국채 커버드콜은 분배금의 상당 부분이 원금 반환이어서, 1년 총수익이 마이너스다. 분배율만 보고 담으면 원금이 줄어든다.", {
    x: 6.9, y: 4.02, w: 5.93, h: 0.5, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 8.5, color: BODY, valign: "top", lineSpacing: 12 });

  panel(s, {
    x: M, y: 4.55, w: 6.1, h: 2.1, fill: SURFACE_SUBTLE,
    title: "세제 전략 — 같은 돈을 더 낮은 세율로 받는다",
    bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "퇴직급여는 일시금이 아니라 연금으로 수령 — 이연퇴직소득의 연금소득세율은 퇴직소득세율의 70%(10년차까지), 11년차 이후 60%. 일시금 대비 약 30~40% 절감", options: { bullet: true, breakLine: true } },
      { text: "전 구간 연금계좌 인출이 불필요하므로 사적연금 1,500만원 종합과세 기준을 건드리지 않고 과세이연을 계속 유지", options: { bullet: true, breakLine: true } },
      { text: `금융소득종합과세 기준 연 ${won(D.finLimit)}만원 — 설계안대로면 부부 일반계좌 금융소득이 합산 약 ${won(D.coupleFin)}만원으로 초과. 부부 각자 ISA 납입한도를 매년 소진하면 약 ${won(D.isaShielded)}만원을 과세대상에서 제외`, options: { bullet: true } },
    ],
  });
  panel(s, {
    x: 6.9, y: 4.55, w: 5.93, h: 2.1, fill: SURFACE_SUBTLE,
    title: "리스크와 실행",
    titleColor: BLUE, bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "분배금 변동 — 커버드콜 분배금은 옵션프리미엄에 연동되어 시장 변동성이 낮아지면 감소. 반기 1회 분배율·총수익 재점검", options: { bullet: true, breakLine: true } },
      { text: "건강보험료 — 은퇴 후 지역가입자 전환 시 금융소득이 보험료에 반영. 전환 전 공단 모의계산으로 영향 확인", options: { bullet: true, breakLine: true } },
      { text: `1개월 내 DC ${6.40}억 상품 전환·증권 현금 2.00억 편입·부부 ISA 개설 / 3개월 내 배우자 4.00억 재배치 / 2029년 7월 DC를 IRP로 이전해 ${D.trackA.toFixed(2)}억 통합`, options: { bullet: true } },
    ],
  });

  footnote(s, SRC_LINE +
    " 세율·한도는 2026년 기준이며 세법 개정 시 달라집니다. 개별 세액은 다른 소득과 합산해 산정되므로 실행 전 세무 상담을 권합니다. " +
    "2026.08.31 퇴직연금감독규정 개정으로 100% 편입 가능 상품 범위가 확대된 것으로 확인되나 시행일과 대상 상품은 확인하지 못했으므로, 실행 시점에 금융위 보도자료를 직접 확인해야 합니다. " +
    "사적연금 인출액의 건강보험료 부과 여부는 국민건강보험공단 1차 자료로 확인하지 못해 단정하지 않았습니다.", 6.75);
  s.addNotes(`Phase 1: ${D.spousePension} + ${D.p1Income} = ${D.spousePension + D.p1Income} vs ${D.needBase} → 여유 ${Math.abs(D.p1Gap)}. ` +
    `부부 합산 과세대상 금융소득 ${won(D.coupleFin)}만원 (본인 ${won(D.selfFin)} + 배우자 ${won(D.spouseFin)}).`);
}

const out = "은퇴자산_운용제안서_2026-09-07.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("written:", out));
