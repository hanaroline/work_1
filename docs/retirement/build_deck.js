/**
 * 은퇴자산 운용 제안서 (6p) — 미래에셋 디자인 시스템 적용
 * 인쇄되는 모든 수치는 claims.json / model.py 출력에서 가져온다.
 */
const pptxgen = require("pptxgenjs");

// ── mas-design 토큰 ───────────────────────────────────────────────────────
const ORANGE = "F58220";
const ORANGE_ACTIVE = "CB6015";
const BLUE = "043B72";
const BLUE_MID = "0086B8";
const CYAN = "00A9CE";
const SOFT_ORANGE = "FAB072";
const TAN = "F0B26B";
const TERRA = "AD624E";
const SOFT_BLUE = "7E9FC3";
const GRAY_HL = "D7D7D7";
const SURFACE_SOFT = "ECEFF4";
const SURFACE_SUBTLE = "F7F8FA";
const HAIRLINE = "CDCECB";
const HAIRLINE_SOFT = "E5E4E1";
const INK = "1A1A1A";
const BODY = "3D3D3D";
const MUTED = "6C6C6C";
const MUTED_SOFT = "84888B";
const SUCCESS = "2E8540";
const ERRORC = "C62828";
const WHITE = "FFFFFF";

const KR = "Spoqa Han Sans Neo";
const CHART_PALETTE = [ORANGE, BLUE, SOFT_ORANGE, BLUE_MID, TERRA, CYAN, TAN, SOFT_BLUE, MUTED_SOFT];

const M = 0.5;                 // 좌우 마진
const CW = 13.333 - M * 2;     // 콘텐츠 폭 12.333

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";   // 13.333 x 7.5
pres.author = "미래에셋증권";
pres.title = "은퇴자산 운용 제안서";

// ── 공통 헬퍼 ────────────────────────────────────────────────────────────
function sectionHeader(slide, title, sub) {
  // mas-design 시그니처: 1px 오렌지 섹션 룰 + 룰 아래 좌측정렬 제목
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
    x: M, y: y === undefined ? 7.0 : y, w: CW, h: 0.34, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 7.5, color: MUTED_SOFT, valign: "top", lineSpacing: 11,
  });
}

// 라벨 + 큰 수치 + 보조설명 카드
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

// 제목 + 본문 블록 카드
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

// ═══════════════════════════════════════════════════════════════════════
// P1 — 표지 (mas-design hero-orange)
// ═══════════════════════════════════════════════════════════════════════
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

  const stats = [
    ["가구 총자산", "19.38억원"],
    ["목표수익률", "연 7.0%"],
    ["설계 구간", "2026 → 2034+"],
    ["작성 기준일", "2026.09.07"],
  ];
  stats.forEach(([label, value], i) => {
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
    "본 제안서는 고객이 제공한 자산 현황을 기초로 작성된 참고자료입니다. 기재된 기대수익률·분배율은 설계 가정 또는 과거 실적이며 미래 수익을 보장하지 않습니다.",
    {
      x: 0.75, y: 5.95, w: 11.83, h: 0.9, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, lineSpacing: 15,
    },
  );
  s.addNotes(
    "표지. 가구 총자산 19.38억(본인 15.38 + 배우자 4.00). 목표수익률 연 7%는 고객 지정값이며, " +
    "예금·주식을 포함한 전체 자산 기준입니다."
  );
}

// ═══════════════════════════════════════════════════════════════════════
// P2 — 현황 진단
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  sectionHeader(
    s,
    "현황 진단 — 자산은 충분하나, 현금흐름 배치가 비어 있다",
    "가구 총자산 19.38억 · 즉시 재배치 가능 13.28억(68.5%) · 만기·유지 제약 6.10억(31.5%)"
  );

  const rows = [
    [th("구분", { align: "left" }), th("자산"), th("금액(억)"), th("현재 상태 / 제약")],
    [td("본인"), td("퇴직연금 DC"), td("6.40", { align: "right", bold: true }),
      td("현금성 자산으로 방치 — 즉시 전환 대상", { color: ERRORC })],
    [td("본인"), td("개인 IRP"), td("0.88", { align: "right" }), td("운용 중 — 재배치 대상")],
    [td("본인"), td("은행 5년 정기예금"), td("3.70", { align: "right" }),
      td("연 5% 확정 · 만기까지 인출 불가")],
    [td("본인"), td("증권 현금"), td("2.00", { align: "right" }), td("미운용 — 즉시 전환 대상")],
    [td("본인"), td("국내·해외주식"), td("2.40", { align: "right" }),
      td("매도하지 않고 그대로 유지")],
    [td("배우자"), td("보유자산"), td("4.00", { align: "right" }), td("전액 재배치 가능")],
    [
      td("합계", { bold: true, fill: { color: GRAY_HL }, color: INK }),
      td("가구 전체", { bold: true, fill: { color: GRAY_HL }, color: INK }),
      td("19.38", { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
      td("본인 15.38 + 배우자 4.00", { bold: true, fill: { color: GRAY_HL }, color: INK }),
    ],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 1.42, w: 6.55, colW: [0.72, 1.55, 0.92, 3.36], rowH: 0.33,
  }));

  panel(s, {
    x: M, y: 4.38, w: 6.55, h: 2.27, fill: SURFACE_SOFT,
    title: "핵심 과제 — 이 셋을 동시에 풀어야 한다",
    body: [
      { text: "현금성 6.40억의 즉시 전환 — 퇴직연금 DC가 현금으로 놀고 있어, 은퇴까지 34개월간 약 8,600만원의 수익 기회를 잃는 상태", options: { bullet: true, breakLine: true } },
      { text: "5년의 소득 공백 — 본인 은퇴(2029.7)부터 국민연금 개시(2034)까지는 배우자 연금 280만원이 유일한 확정 소득", options: { bullet: true, breakLine: true } },
      { text: "제약 안에서의 연 7% — 은행예금 3.70억은 만기까지 묶여 있고 주식 2.40억은 유지 대상이므로, 남은 13.28억만으로 목표를 만들어야 함", options: { bullet: true } },
    ],
  });

  const cx = 7.35, cw = 5.48;
  statCard(s, {
    x: cx, y: 1.42, w: cw, h: 1.42,
    label: "DC 6.4억을 현금성으로 두는 데 드는 기회비용",
    value: "연 3,039만원",
    accent: ERRORC,
    note: "제안 포트폴리오 7.25% vs 대기성 현금 2.50%(가정) 격차 4.75%p. 은퇴까지 남은 34개월 누적 약 8,600만원.",
  });
  statCard(s, {
    x: cx, y: 3.0, w: cw, h: 1.42,
    label: "매월 필요자금 (생활 650 + 부모님 용돈 100)",
    value: "750만원",
    accent: BLUE,
    note: "생활자금 600~700만원의 중간값 기준. 확보된 연금은 배우자 280만원(2028~), 본인 국민연금 250만원(2034~).",
  });
  statCard(s, {
    x: cx, y: 4.58, w: cw, h: 1.42,
    label: "목표 연 7%를 위해 신규 운용자산이 내야 할 수익률",
    value: "연 7.38%",
    accent: ORANGE,
    note: "예금 3.70억(5%)·주식 2.40억(8% 가정) 기여를 제외하면, 남은 13.28억이 연 7.38%를 내야 전체 7%가 성립.",
  });

  footnote(s,
    "자산·지출·연금 금액은 고객 제공 자료(2026.09.07 기준). 대기성 현금 2.50%와 주식 기대수익률 8.00%는 제안자 설계 가정으로 보장되지 않습니다. " +
    "은행예금 연 5%는 기존 가입 상품의 확정금리이며, 2026년 9월 신규 5년 예금 시장금리(3%대)보다 크게 높은 이례적 조건입니다.", 6.8);
  s.addNotes(
    "DC 기회비용 = 6.40억 x (7.25% - 2.50%) = 연 3,039만원. 34개월 누적 8,611만원. " +
    "신규 운용 요구수익률 = (1.3566 - 0.185 - 0.192) / 13.28 = 7.38%."
  );
}

// ═══════════════════════════════════════════════════════════════════════
// P3 — 시점별 로드맵
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  sectionHeader(
    s,
    "시점별 자금흐름 로드맵 — 5단계",
    "지금 운용할 자산 / DC의 IRP 이전 / 예금 만기 / 국민연금 개시 시점을 하나의 흐름으로 배치"
  );

  const phases = [
    ["Phase 0", "2026.9~2029.6", ORANGE],
    ["Phase 1", "2029.7~2031", ORANGE_ACTIVE],
    ["Phase 2", "2031", MUTED_SOFT],
    ["Phase 3", "2031~2034", BLUE],
    ["Phase 4", "2034~", BLUE_MID],
  ];
  const pw = CW / 5;
  phases.forEach(([name, span, color], i) => {
    const x = M + i * pw;
    s.addShape(pres.ShapeType.chevron, {
      x, y: 1.36, w: pw - 0.03, h: 0.62, fill: { color }, line: { type: "none" },
    });
    s.addText(name, {
      x: x + 0.3, y: 1.42, w: pw - 0.55, h: 0.26, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, bold: true, color: WHITE, align: "center",
    });
    s.addText(span, {
      x: x + 0.3, y: 1.67, w: pw - 0.55, h: 0.24, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 9, color: WHITE, align: "center",
    });
  });

  const rows = [
    [th("단계", { align: "left" }), th("주요 이벤트"), th("월 유입"), th("월 필요"),
      th("판정"), th("실행 조치")],
    [
      td("Phase 0", { bold: true, color: ORANGE }),
      td("본인 재직 · 배우자 은퇴(2028)"),
      td("근로소득\n+ 280 (2028~)", { align: "center", fontSize: 8 }),
      td("750", { align: "center" }),
      td("근로소득 충당", { align: "center", color: SUCCESS }),
      td("DC 6.40억 계좌 내 운용 전환 · 증권현금 2.00억 · 배우자 4.00억 인컴 편입. 발생 인컴은 전액 재투자"),
    ],
    [
      td("Phase 1", { bold: true, color: ORANGE_ACTIVE }),
      td("본인 은퇴(만 60) · DC→IRP 이전"),
      td("280 + 인컴 431\n= 711", { align: "center", fontSize: 8 }),
      td("750", { align: "center" }),
      td("부족 39", { align: "center", color: ERRORC, bold: true }),
      td("DC+IRP 7.28억 통합. 부족분은 연금계좌에서 연 466만원 인출(사적연금 1,500만원 한도 이내)"),
    ],
    [
      td("Phase 2", { bold: true, color: MUTED_SOFT }),
      td("은행예금 만기 · 자녀 결혼"),
      td("만기 원리금\n4.48억 유입", { align: "center", fontSize: 8 }),
      td("3.00억\n일시 지출", { align: "center", fontSize: 8 }),
      td("목적자금 집행", { align: "center", color: BLUE }),
      td("결혼자금 3.00억 지급 후 잔여 1.48억을 인컴 포트폴리오로 재투자 → 월 인컴 +91만원"),
    ],
    [
      td("Phase 3", { bold: true, color: BLUE }),
      td("인컴 자립기 (국민연금 개시 전)"),
      td("280 + 인컴 523\n= 803", { align: "center", fontSize: 8 }),
      td("750", { align: "center" }),
      td("여유 53", { align: "center", color: SUCCESS, bold: true }),
      td("연금계좌 인출 중단 → 과세이연 유지. 잉여 53만원은 인컴 재투자로 복리 누적"),
    ],
    [
      td("Phase 4", { bold: true, color: BLUE_MID }),
      td("본인 국민연금 개시(만 65)"),
      td("530 + 인컴 523\n= 1,053", { align: "center", fontSize: 8 }),
      td("750", { align: "center" }),
      td("여유 303", { align: "center", color: SUCCESS, bold: true }),
      td("잉여 303만원으로 의료·장기요양 준비금 별도 적립. 인플레이션 대응 인출률 상향 여력 확보"),
    ],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: M, y: 2.14, w: CW, colW: [0.85, 2.45, 1.35, 0.9, 1.15, 5.633], rowH: 0.72,
  }));

  footnote(s,
    "단위: 만원/월(별도 표기 제외). 본인 은퇴시점은 2026.09 기준 잔여 2년 10개월을 적용해 2029년 7월로 산정. " +
    "은행예금 만기는 자녀 결혼 시점(5년 후)과 일치한다는 고객 진술에 따라 2031년으로 가정했으며, 만기 원리금 4.48억은 단리·이자소득세 15.4% 차감 기준입니다. " +
    "인컴 수익은 설계 가정 분배율에 기초한 추정치입니다.", 6.95);
  s.addNotes(
    "예금 만기: 3.70억 x 5% x 5년 = 세전 0.925억 → 세후 이자 0.783억 → 원리금 4.48억. " +
    "3억 지출 후 1.48억 재투자 → 7.39% 적용 시 월 91만원."
  );
}

// ═══════════════════════════════════════════════════════════════════════
// P4 — 자산배분
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  sectionHeader(
    s,
    "자산배분 — 목표 연 7.0%를 만드는 구조",
    "신규 주식 편입 없이, 이자·배당·옵션프리미엄으로 수익원을 구성"
  );

  const donut = [{
    name: "자산군 비중",
    labels: ["은행 정기예금(만기보유)", "미국 배당+커버드콜", "미국 장기국채 커버드콜",
      "기존 보유주식(유지)", "기타 인컴자산", "국내 리츠·인프라",
      "나스닥100 커버드콜", "국내 우량채권(AA-이상)", "원리금보장·파킹"],
    values: [19.1, 18.1, 13.2, 12.4, 8.9, 7.7, 7.2, 7.2, 6.2],
  }];
  s.addChart(pres.ChartType.doughnut, donut, {
    x: M, y: 1.35, w: 6.1, h: 4.75,
    holeSize: 52,
    chartColors: CHART_PALETTE,
    showLegend: true, legendPos: "r", legendFontSize: 8.5, legendFontFace: KR,
    showValue: true, showPercent: false,
    dataLabelFontSize: 8.5, dataLabelFontFace: KR, dataLabelColor: WHITE,
    dataLabelFormatCode: '0.0"%"',
    showTitle: true, title: "자산군별 배분 (가구 총자산 19.38억 = 100%)",
    titleFontSize: 11, titleFontFace: KR, titleColor: INK,
  });

  const rows = [
    [th("자산 블록", { align: "left" }), th("금액(억)"), th("기대수익률"), th("연 수익(억)")],
    [td("은행 정기예금 — 확정금리"), td("3.70", { align: "right" }),
      td("5.00%", { align: "right" }), td("0.185", { align: "right" })],
    [td("기존 보유주식 — 유지, 가정"), td("2.40", { align: "right" }),
      td("8.00%", { align: "right" }), td("0.192", { align: "right" })],
    [td("신규 인컴 포트폴리오"), td("13.28", { align: "right", bold: true }),
      td("7.39%", { align: "right", bold: true }), td("0.981", { align: "right", bold: true })],
    [
      td("가구 전체", { bold: true, fill: { color: GRAY_HL }, color: INK }),
      td("19.38", { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
      td("7.01%", { align: "right", bold: true, fill: { color: GRAY_HL }, color: ORANGE_ACTIVE }),
      td("1.358", { align: "right", bold: true, fill: { color: GRAY_HL }, color: INK }),
    ],
  ];
  s.addTable(rows, Object.assign({}, TBL_BASE, {
    x: 6.9, y: 1.72, w: 5.93, colW: [2.63, 1.0, 1.15, 1.15], rowH: 0.38,
  }));

  s.addText([
    { text: "목표 연 7.00% → 설계안 7.01%", options: { bold: true, fontSize: 13, color: WHITE } },
  ], {
    x: 6.9, y: 3.85, w: 5.93, h: 0.42, isTextBox: true, margin: 0,
    fontFace: KR, align: "center", valign: "middle",
    fill: { color: ORANGE }, lineSpacing: 18,
  });

  panel(s, {
    x: 6.9, y: 4.45, w: 5.93, h: 1.68,
    title: "이 배분이 지키는 세 가지 제약",
    body: [
      { text: "직접 주식 12.4% — 기존 보유 2.40억뿐, 신규 주식 편입은 0", options: { bullet: true, breakLine: true } },
      { text: "연금계좌 안전자산 30.2% — DC·IRP 위험자산 70% 한도 규정 충족", options: { bullet: true, breakLine: true } },
      { text: "은행예금·보유주식 6.10억은 손대지 않고 만기·유지 그대로 반영", options: { bullet: true } },
    ],
  });

  footnote(s,
    "기타 인컴자산 8.9% = 채권혼합 커버드콜 4.1% + 해외 투자등급 회사채 3.0% + 미국 배당성장 1.8%. " +
    "은행예금 5.00%는 확정금리(고객 제공)이며, 주식 8.00%와 신규 인컴 포트폴리오 7.39%는 제안자 설계 가정으로 수익을 보장하지 않습니다. " +
    "커버드콜 상품의 분배금에는 원금 일부 반환 성격이 포함될 수 있어 분배율과 총수익률은 다릅니다.", 6.28);
  s.addNotes(
    "0.185 + 0.192 + 0.981 = 1.358억 / 19.38억 = 7.01%. 목표 7.00% 대비 +0.01%p."
  );
}

// ═══════════════════════════════════════════════════════════════════════
// P5 — 계좌별 실행 상품
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  sectionHeader(
    s,
    "계좌별 실행 상품 — 국내 상장 ETF 중심",
    "계좌의 세제·규제 특성에 맞춰 상품을 배치. 고분배 상품은 저율과세 연금계좌에 우선 편입"
  );

  const tracks = [
    {
      x: M, color: ORANGE,
      head: "트랙 A · 퇴직연금 DC → IRP",
      sub: "7.28억 · 기대 연 7.25% · 안전자산 30.2%",
      items: [
        ["TIGER 종합채권(AA-이상)액티브 · 451540", "1.00억 · 13.7%", "안전"],
        ["채권혼합형 커버드콜 ETF (주식 50% 미만)", "0.80억 · 11.0%", "안전"],
        ["원리금보장 정기예금 (IRP 예금)", "0.40억 · 5.5%", "안전"],
        ["TIGER 미국배당다우존스타겟커버드콜2호 · 458760", "1.70억 · 23.4%", "위험"],
        ["TIGER 미국30년국채커버드콜액티브(H) · 476550", "1.40억 · 19.2%", "위험"],
        ["TIGER 미국나스닥100커버드콜(합성) · 441680", "0.70억 · 9.6%", "위험"],
        ["TIGER 리츠부동산인프라 · 329200", "0.70억 · 9.6%", "위험"],
        ["TIGER 미국투자등급회사채액티브(H) · 458260", "0.58억 · 8.0%", "위험"],
      ],
    },
    {
      x: 4.68, color: BLUE,
      head: "트랙 B · 증권 일반계좌",
      sub: "2.00억 · 기대 연 7.98% · 유동성 버퍼 포함",
      items: [
        ["TIGER 미국배당다우존스타겟커버드콜2호 · 458760", "0.60억 · 30.0%", "인컴"],
        ["TIGER 미국30년국채커버드콜액티브(H) · 476550", "0.50억 · 25.0%", "인컴"],
        ["TIGER 미국나스닥100커버드콜(합성) · 441680", "0.40억 · 20.0%", "인컴"],
        ["TIGER 리츠부동산인프라 · 329200", "0.20억 · 10.0%", "인컴"],
        ["파킹형 MMF · 단기채 (생활비 6개월분)", "0.30억 · 15.0%", "유동"],
      ],
    },
    {
      x: 8.86, color: BLUE_MID,
      head: "트랙 C · 배우자 자산",
      sub: "4.00억 · 기대 연 7.36% · ISA 한도 우선 활용",
      items: [
        ["TIGER 미국배당다우존스타겟커버드콜2호 · 458760", "1.20억 · 30.0%", "인컴"],
        ["TIGER 미국30년국채커버드콜액티브(H) · 476550", "0.65억 · 16.2%", "인컴"],
        ["TIGER 리츠부동산인프라 · 329200", "0.60억 · 15.0%", "인컴"],
        ["파킹형 MMF · 단기채", "0.50억 · 12.5%", "유동"],
        ["TIGER 종합채권(AA-이상)액티브 · 451540", "0.40억 · 10.0%", "채권"],
        ["TIGER 미국배당다우존스 · 458730", "0.35억 · 8.8%", "배당"],
        ["TIGER 미국나스닥100커버드콜(합성) · 441680", "0.30억 · 7.5%", "인컴"],
      ],
    },
  ];

  const TW = 3.88;
  tracks.forEach((t) => {
    s.addShape(pres.ShapeType.rect, {
      x: t.x, y: 1.35, w: TW, h: 0.62, fill: { color: t.color }, line: { type: "none" },
    });
    s.addText(t.head, {
      x: t.x + 0.16, y: 1.4, w: TW - 0.32, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11, bold: true, color: WHITE, valign: "middle",
    });
    s.addText(t.sub, {
      x: t.x + 0.16, y: 1.67, w: TW - 0.32, h: 0.26, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 8.5, color: WHITE, valign: "middle",
    });

    const rows = [[th("상품명 · 종목코드", { align: "left", fontSize: 8.5 }),
      th("배분", { fontSize: 8.5 }), th("구분", { fontSize: 8.5 })]];
    t.items.forEach(([name, alloc, kind]) => {
      const isSafe = kind === "안전";
      rows.push([
        td(name, { fontSize: 7.5, color: INK }),
        td(alloc, { fontSize: 7.5, align: "right" }),
        td(kind, {
          fontSize: 7, align: "center",
          color: isSafe ? BLUE : kind === "유동" ? MUTED : ORANGE_ACTIVE,
          fill: { color: isSafe ? SURFACE_SOFT : WHITE },
        }),
      ]);
    });
    s.addTable(rows, Object.assign({}, TBL_BASE, {
      x: t.x, y: 1.97, w: TW, colW: [2.16, 1.05, 0.67], rowH: 0.375,
    }));
  });

  s.addShape(pres.ShapeType.rect, {
    x: M, y: 5.75, w: CW, h: 0.9, fill: { color: SURFACE_SOFT }, line: { type: "none" },
  });
  s.addText([
    { text: "참고 · 과거 12개월 분배율 (실적치, 미래 분배 보장 아님 — 실행 전 발행사 확인 필요)\n", options: { bold: true, fontSize: 9, color: BLUE } },
    { text: "458760 약 8.6% · 476550 약 13.2% · 329200 약 7.8% · 441680 12.1%(2023년 확정, 2024.01.04 보도). " +
        "458760·476550·329200 수치는 집계 사이트 기준으로 집계 기준일이 명시되지 않아 미확인 항목입니다. " +
        "채권혼합형 커버드콜 ETF는 증권사별 위험자산 분류 기준이 달라 상품 선정을 실행 시점에 확정합니다.",
      options: { fontSize: 8, color: BODY } },
  ], {
    x: M + 0.22, y: 5.84, w: CW - 0.44, h: 0.76, isTextBox: true, margin: 0,
    fontFace: KR, valign: "top", lineSpacing: 13,
  });

  footnote(s,
    "종목코드는 2026.09.07 기준 한국거래소 상장 코드로, 2개 이상 출처에서 교차확인했습니다. " +
    "TIGER 종합채권(AA-이상)액티브는 451540이며 356540(ACE 종합채권)과 다른 상품입니다. " +
    "연금계좌(DC·IRP)는 위험자산 70% 한도가 적용되어 안전자산 30% 이상 편입이 필요하며, 해외 직상장 ETF·레버리지 상품은 편입할 수 없습니다.", 6.72);
  s.addNotes(
    "트랙 A 안전자산 2.20억 = 1.00 + 0.80 + 0.40 → 7.28억의 30.2%로 규정 충족. " +
    "고분배 커버드콜을 연금계좌에 우선 배치한 이유는 계좌 내 분배금이 과세되지 않고 재투자되기 때문입니다."
  );
}

// ═══════════════════════════════════════════════════════════════════════
// P6 — 현금흐름 검증 · 세제 · 리스크 · 실행
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  sectionHeader(
    s,
    "현금흐름 검증 · 세제 전략 · 리스크 관리",
    "월 필요자금 750만원을 어떤 재원으로, 어떤 세율로 조달하는가"
  );

  s.addChart(pres.ChartType.bar, [
    { name: "연금소득", labels: ["Phase 1\n2029.7~2031", "Phase 3\n2031~2034", "Phase 4\n2034~"], values: [280, 280, 530] },
    { name: "포트폴리오 인컴", labels: ["Phase 1\n2029.7~2031", "Phase 3\n2031~2034", "Phase 4\n2034~"], values: [431, 523, 523] },
  ], {
    x: M, y: 1.32, w: 6.1, h: 2.72,
    barDir: "col", barGrouping: "stacked",
    chartColors: [BLUE, ORANGE],
    showValue: true, dataLabelPosition: "ctr",
    dataLabelFontSize: 9, dataLabelFontFace: KR, dataLabelColor: WHITE,
    showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: KR,
    catAxisLabelColor: BODY, catAxisLabelFontSize: 8.5, catAxisLabelFontFace: KR,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 8.5, valAxisLabelFontFace: KR,
    valAxisMaxVal: 1200, valAxisMinVal: 0,
    valGridLine: { color: HAIRLINE_SOFT, size: 0.75 },
    catGridLine: { style: "none" },
    showTitle: true, title: "단계별 월 현금흐름 (만원) — 필요 750만원 대비",
    titleFontSize: 10.5, titleFontFace: KR, titleColor: INK,
  });

  s.addText([
    { text: "판정   ", options: { bold: true, fontSize: 9.5, color: BLUE } },
    { text: "Phase 1 부족 39만원(연금계좌 인출)   ·   Phase 3 여유 53만원   ·   Phase 4 여유 303만원", options: { fontSize: 9, color: BODY } },
  ], {
    x: M, y: 4.06, w: 6.1, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, valign: "middle",
  });

  panel(s, {
    x: 6.9, y: 1.32, w: 5.93, h: 3.1,
    title: "세제 전략 — 같은 돈을 더 낮은 세율로 받는다",
    bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "퇴직급여는 일시금이 아니라 연금으로 수령 — 이연퇴직소득의 연금소득세율은 퇴직소득세율의 70%(연금수령 10년차까지), 11년차 이후 60%. 일시금 대비 약 30~40% 절감", options: { bullet: true, breakLine: true } },
      { text: "DC 원본에서 나오는 연금은 사적연금 연 1,500만원 종합과세 기준과 무관하게 분리과세. 한도 대상은 IRP 자기부담금·운용수익분뿐", options: { bullet: true, breakLine: true } },
      { text: "Phase 1 인출액 연 466만원은 1,500만원 한도 이내. Phase 3부터 인출을 멈춰 과세이연 유지", options: { bullet: true, breakLine: true } },
      { text: "금융소득종합과세 기준 연 2,000만원 — 설계안대로면 부부 합산 약 5,170만원으로 초과. 부부 각자 ISA 납입한도를 매년 소진해 과세대상 축소 필요", options: { bullet: true } },
    ],
  });

  panel(s, {
    x: M, y: 4.5, w: 6.1, h: 2.15, fill: SURFACE_SUBTLE,
    title: "주요 리스크와 대응",
    titleColor: ERRORC,
    bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "분배금 변동 — 커버드콜 분배금은 옵션프리미엄에 연동되어 시장 변동성이 낮아지면 감소. 원금 일부 반환 성격도 포함되므로 분배율을 수익률로 읽지 않음", options: { bullet: true, breakLine: true } },
      { text: "환율 — (H) 표기 상품은 환헤지, 미표기 상품은 환노출. 환헤지 비중을 절반 수준으로 유지해 방향성 위험을 분산", options: { bullet: true, breakLine: true } },
      { text: "건강보험료 — 은퇴 후 지역가입자 전환 시 금융소득이 보험료에 반영. 전환 전 공단 모의계산으로 영향 확인", options: { bullet: true } },
    ],
  });

  panel(s, {
    x: 6.9, y: 4.5, w: 5.93, h: 2.15, fill: SURFACE_SUBTLE,
    title: "실행 로드맵",
    bodySize: 8.5, bodyLine: 12.5, bodyGap: 6,
    body: [
      { text: "1개월 내 — DC 6.40억 상품 전환, 증권 현금 2.00억 인컴 편입, 부부 ISA 개설·한도 소진", options: { bullet: true, breakLine: true } },
      { text: "3개월 내 — 배우자 4.00억 재배치, 개인 IRP 0.88억 리밸런싱, 분배금 수령계좌 일원화", options: { bullet: true, breakLine: true } },
      { text: "2029년 7월 은퇴 — DC를 IRP로 이전해 7.28억 통합, 연금수령 10년 이상 분할 신청", options: { bullet: true, breakLine: true } },
      { text: "반기 1회 — 분배율·환헤지 비중·안전자산 30% 준수 점검 및 리밸런싱", options: { bullet: true } },
    ],
  });

  footnote(s,
    "세율·한도는 2026년 기준이며 세법 개정 시 달라집니다. 개별 세액은 다른 소득과 합산해 산정되므로 실행 전 세무 상담을 권합니다. " +
    "2026.08.31 퇴직연금감독규정 개정으로 100% 편입 가능 상품 범위가 확대된 것으로 확인되나 시행일과 대상 상품은 확인하지 못했으므로, 실행 시점에 금융위 보도자료를 직접 확인해야 합니다. " +
    "사적연금 인출액의 건강보험료 부과 여부는 국민건강보험공단 1차 자료로 확인하지 못해 단정하지 않았습니다.", 6.75);
  s.addNotes(
    "Phase 1: 280 + 431 = 711 vs 750 → 부족 39 → 연 466만원 인출. " +
    "Phase 3: 예금 만기 잔여 1.48억 재투자로 인컴 +91만원 → 523만원. " +
    "Phase 4: 국민연금 250 추가 → 연금 530 + 인컴 523 = 1,053만원."
  );
}

const out = "은퇴자산_운용제안서_2026-09-07.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("written:", out));
