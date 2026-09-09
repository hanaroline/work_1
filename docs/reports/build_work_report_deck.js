const pptxgen = require("pptxgenjs");

// ── Mirae Asset Design System tokens ────────────────────────────
const ORANGE = "F58220";
const ORANGE_DEEP = "CB6015";
const BLUE = "043B72";
const SOFT = "FAB072";
const TINT = "ECEFF4";
const SUBTLE = "F7F8FA";
const HAIR = "CDCECB";
const INK = "1A1A1A";
const BODY = "3D3D3D";
const MUTED = "6C6C6C";
const W = "FFFFFF";
const ON_ORANGE_SOFT = "FFE7D1";
const ON_BLUE_SOFT = "C6D6E8";

const F = "Spoqa Han Sans Neo"; // 브랜드 지정 국문/영문 단일 패밀리

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "마포WM";
pres.title = "Claude Code 기반 업무 자동화 구축 결과 보고";

const SW = 13.3;
const M = 0.6; // 좌우 여백
const CW = SW - M * 2; // 12.1 콘텐츠 폭

// 1px 오렌지 섹션 룰 + 좌측 제목 (브랜드 시그니처 §9.1)
function sectionHead(slide, title, kicker) {
  slide.addShape(pres.ShapeType.rect, {
    x: M, y: 0.52, w: CW, h: 0.013, fill: { color: ORANGE }, line: { type: "none" },
  });
  if (kicker) {
    slide.addText(kicker, {
      x: M, y: 0.6, w: 4.0, h: 0.28, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, bold: true, color: ORANGE, charSpacing: 1.2,
    });
  }
  slide.addText(title, {
    x: M, y: kicker ? 0.88 : 0.66, w: CW, h: 0.62, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 28, bold: true, color: INK, charSpacing: -0.4,
  });
}

function footnote(slide, text) {
  slide.addText(text, {
    x: M, y: 6.94, w: CW, h: 0.34, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10.5, color: MUTED, valign: "top",
  });
}

// 번호 칩 (모티프: 2px 라운드 정사각 칩) ──────────────────────────
function chip(slide, x, y, n, bg) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w: 0.46, h: 0.46, rectRadius: 0.03,
    fill: { color: bg }, line: { type: "none" },
  });
  slide.addText(n, {
    x, y, w: 0.46, h: 0.46, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: W, align: "center", valign: "middle",
  });
}

/* ══════════════════════════════════════════════════════════════
   SLIDE 1 — 표지 (Orange full-bleed hero)
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: ORANGE };

  s.addText("[ 사내한 ]   업무 보고", {
    x: M, y: 0.52, w: 5.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: ON_ORANGE_SOFT, charSpacing: 1.6,
  });

  s.addText("Claude Code 로 만든\n영업 현장 업무 자동화", {
    x: M, y: 1.22, w: 7.3, h: 2.1, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 40, bold: true, color: W, lineSpacing: 50, charSpacing: -1.0,
  });

  s.addText("시황 브리핑 자동 발행 · 업무 조회 화면 4종 · 데이터 수집 자동화", {
    x: M, y: 3.5, w: 7.3, h: 0.86, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16.5, color: W, lineSpacing: 26,
  });

  s.addText(
    [
      { text: "구축 기간", options: { bold: true, color: W } },
      { text: "   2026.08.06 – 09.09  (32일 연속 운영)", options: { color: ON_ORANGE_SOFT } },
    ],
    { x: M, y: 4.86, w: 7.3, h: 0.34, isTextBox: true, margin: 0, fontFace: F, fontSize: 13.5 }
  );
  s.addText(
    [
      { text: "수행 방식", options: { bold: true, color: W } },
      { text: "   Claude Code 세션 + GitHub Actions 예약 실행", options: { color: ON_ORANGE_SOFT } },
    ],
    { x: M, y: 5.24, w: 7.3, h: 0.34, isTextBox: true, margin: 0, fontFace: F, fontSize: 13.5 }
  );
  s.addText(
    [
      { text: "산출물 위치", options: { bold: true, color: W } },
      { text: "   사내 저장소 work_1 (전 커밋 이력 보존)", options: { color: ON_ORANGE_SOFT } },
    ],
    { x: M, y: 5.62, w: 7.3, h: 0.34, isTextBox: true, margin: 0, fontFace: F, fontSize: 13.5 }
  );

  // 우측 흰 카드 — 핵심 수치 4
  s.addShape(pres.ShapeType.roundRect, {
    x: 8.4, y: 1.22, w: 4.3, h: 5.06, rectRadius: 0.02,
    fill: { color: W }, line: { type: "none" },
  });
  s.addText("한눈에", {
    x: 8.78, y: 1.5, w: 3.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: ORANGE, charSpacing: 1.4,
  });

  const stats = [
    ["60", "판", "자동 발행한 시황 브리핑"],
    ["4", "종", "새로 만든 업무 조회 화면"],
    ["7", "종", "무인 운영 중인 수집·점검 워크플로"],
    ["25,400", "줄", "구축한 화면·스크립트 코드"],
  ];
  stats.forEach(([num, unit, label], i) => {
    const y = 1.95 + i * 1.07;
    s.addText(
      [
        { text: num, options: { fontSize: 30, bold: true, color: BLUE } },
        { text: " " + unit, options: { fontSize: 14, bold: true, color: ORANGE } },
      ],
      { x: 8.78, y, w: 3.6, h: 0.48, isTextBox: true, margin: 0, fontFace: F }
    );
    s.addText(label, {
      x: 8.78, y: y + 0.46, w: 3.6, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: MUTED, lineSpacing: 15,
    });
    if (i < 3) {
      s.addShape(pres.ShapeType.rect, {
        x: 8.78, y: y + 0.95, w: 3.6, h: 0.01, fill: { color: "E5E4E1" }, line: { type: "none" },
      });
    }
  });

  s.addNotes(
    "보고 목적: 8월 6일부터 9월 9일까지 Claude Code 로 수행한 업무 자동화 구축 결과를 보고합니다. " +
    "핵심은 세 가지 — (1) 매일 손으로 쓰던 시황 브리핑을 하루 두 번 예약 자동 발행으로 전환, " +
    "(2) 흩어져 있던 시세·상품 조회를 사내망에서도 열리는 단일 파일 화면 4종으로 통합, " +
    "(3) 데이터 수집과 검증을 무인 워크플로 7종으로 이관. 모든 산출물은 사내 저장소에 커밋되어 있습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   SLIDE 2 — 왜 했나 / 어떻게 풀었나
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "반복 업무 세 가지를 자동화했습니다", "배경 · 접근");

  const problems = [
    [
      "매일 손으로 쓰던 시황 브리핑",
      "지수·금리·환율·수급을 사이트마다 찾아 옮겨 적고, 숫자를 다시 맞춰 보는 데 매일 오전 시간이 들었습니다. 늦게 시작한 날은 발행을 건너뛰었습니다.",
    ],
    [
      "조회 화면이 흩어져 있고, 사내망에서 막힘",
      "국내 종목·미국 대형주·ELS 를 각각 다른 사이트에서 봤고, 업무용 PC 에서는 상당수가 방화벽·CORS 로 열리지 않았습니다.",
    ],
    [
      "고객 안내가 종이 QR 전단",
      "비대면 계좌개설·연금 이전 등 13개 업무를 QR 로 안내해, 고객이 카메라로 비추는 단계를 거쳐야 했습니다.",
    ],
  ];
  problems.forEach(([h, b], i) => {
    const y = 1.86 + i * 1.62;
    chip(s, M, y, String(i + 1).padStart(2, "0"), ORANGE);
    s.addText(h, {
      x: 1.2, y: y - 0.03, w: 6.35, h: 0.36, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 16, bold: true, color: INK,
    });
    s.addText(b, {
      x: 1.2, y: y + 0.36, w: 6.35, h: 1.05, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12.5, color: BODY, lineSpacing: 19,
    });
  });

  // 우측 — 해결 방식 카드
  s.addShape(pres.ShapeType.roundRect, {
    x: 8.1, y: 1.86, w: 4.6, h: 4.86, rectRadius: 0.03,
    fill: { color: TINT }, line: { type: "none" },
  });
  s.addText("해결 방식 — 세 단계", {
    x: 8.46, y: 2.14, w: 3.9, h: 0.34, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: BLUE,
  });

  const steps = [
    ["예약 수집", "정해진 시각에 러너가 원천에서 받아 저장합니다. 사람이 사이트를 돌지 않습니다."],
    ["자동 검증", "스크립트 7종이 숫자·기준·중복·인쇄 맞춤을 판정하고, 어긋나면 발행을 멈춥니다."],
    ["단일 파일 배포", "설치 없이 파일 하나를 브라우저로 열면 동작합니다. 외부가 막히면 저장된 값으로 그립니다."],
  ];
  steps.forEach(([h, b], i) => {
    const y = 2.72 + i * 1.32;
    chip(s, 8.46, y, String(i + 1), BLUE);
    s.addText(h, {
      x: 9.06, y: y - 0.02, w: 3.3, h: 0.32, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: INK,
    });
    s.addText(b, {
      x: 9.06, y: y + 0.32, w: 3.3, h: 0.86, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: BODY, lineSpacing: 16,
    });
  });

  footnote(
    s,
    "구축·검증은 전부 Claude Code 세션에서 수행했고, 화면·수집 스크립트·작성 지침·자동화 설정이 모두 사내 저장소에 커밋되어 있어 담당자가 바뀌어도 그대로 인수됩니다."
  );

  s.addNotes(
    "세 가지 문제 모두 '사람이 매번 같은 일을 반복한다'는 공통점이 있었습니다. " +
    "해결 방식도 하나로 정리됩니다 — 받아오는 일은 예약으로, 맞는지 보는 일은 스크립트로, 보여주는 일은 설치 없는 단일 파일로 옮겼습니다. " +
    "특히 검증을 자동화한 것이 중요합니다. 자동 발행에서 가장 위험한 것은 '틀린 숫자가 조용히 나가는 것'이라서, 어긋나면 발행을 멈추게 설계했습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   SLIDE 3 — 성과 ① 시황 브리핑
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "시황 브리핑 — 32일 연속 무인 발행", "성과 ①");

  const kpis = [
    ["60", "판", "8/6 ~ 9/9 누적 발행"],
    ["32", "일", "휴장일 포함 연속 발행"],
    ["2", "회", "하루 예약 (07:30 · 16:10)"],
    ["1,870", "줄", "기계가 읽는 작성 지침"],
  ];
  kpis.forEach(([num, unit, label], i) => {
    const x = M + i * 3.075;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.74, w: 2.86, h: 1.2, rectRadius: 0.03,
      fill: { color: SUBTLE }, line: { color: HAIR, width: 0.75 },
    });
    s.addText(
      [
        { text: num, options: { fontSize: 27, bold: true, color: i === 0 ? ORANGE : BLUE } },
        { text: " " + unit, options: { fontSize: 13, bold: true, color: MUTED } },
      ],
      { x: x + 0.26, y: 1.9, w: 2.34, h: 0.46, isTextBox: true, margin: 0, fontFace: F }
    );
    s.addText(label, {
      x: x + 0.26, y: 2.4, w: 2.34, h: 0.42, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 14,
    });
  });

  // 네이티브 막대 차트 — 주차별 발행 판수
  s.addText("주차별 발행 판수", {
    x: M, y: 3.24, w: 6.6, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: INK,
  });
  s.addChart(
    pres.ChartType.bar,
    [
      {
        name: "발행 판수",
        labels: ["8/06~", "8/10~", "8/17~", "8/24~", "8/31~", "9/07~"],
        values: [4, 7, 9, 10, 20, 10],
      },
    ],
    {
      x: M - 0.1, y: 3.6, w: 6.8, h: 2.9,
      barDir: "col",
      chartColors: [ORANGE],
      showLegend: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: BODY,
      dataLabelFontFace: F,
      dataLabelFontSize: 11,
      dataLabelFontBold: true,
      catAxisLabelColor: MUTED,
      catAxisLabelFontFace: F,
      catAxisLabelFontSize: 11,
      catAxisLineShow: false,
      catGridLine: { style: "none" },
      valAxisHidden: true,
      valAxisMaxVal: 24,
      valGridLine: { style: "none" },
      barGapWidthPct: 55,
      plotArea: { fill: { color: W } },
    }
  );
  s.addText(
    "8/31 주부터 핵심본·전체본 두 판을 함께 냅니다. 9/07 주는 3일치입니다.",
    { x: M, y: 6.54, w: 6.8, h: 0.3, isTextBox: true, margin: 0, fontFace: F, fontSize: 10.5, color: MUTED }
  );

  // 우측 — 검증 장치 표
  s.addText("발행 전 자동 검증 장치", {
    x: 7.7, y: 3.24, w: 5.0, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: INK,
  });
  s.addTable(
    [
      [
        { text: "검증 장치", options: { bold: true, color: INK, fill: { color: SOFT } } },
        { text: "무엇을 막는가", options: { bold: true, color: INK, fill: { color: SOFT } } },
      ],
      ["숫자 대장 검산", "표와 본문의 수치가 어긋난 채 발행"],
      ["시세 신선도 확인", "지난 거래일 값으로 오늘 판을 작성"],
      ["금리 기준 확인", "기사 추정치를 재무부 곡선처럼 표기"],
      ["지난 판 중복 검사", "어제와 같은 문장·해석 반복"],
      ["인쇄 맞춤 확인", "6쪽 규격 초과·표 잘림"],
    ],
    {
      x: 7.7, y: 3.6, w: 5.0,
      colW: [1.72, 3.28],
      rowH: [0.42, 0.44, 0.44, 0.44, 0.44, 0.44],
      fontFace: F,
      fontSize: 11,
      color: BODY,
      valign: "middle",
      border: { type: "solid", color: "E5E4E1", pt: 0.75 },
      margin: [0.05, 0.1, 0.05, 0.1],
    }
  );
  s.addText("어느 하나라도 어긋나면 발행을 멈추고 사유를 남깁니다.", {
    x: 7.7, y: 6.54, w: 5.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10.5, color: MUTED,
  });

  footnote(
    s,
    "구성 — 모닝 24판 · 장마감 13판 · 핵심본 15판 · 해외 증시(주말·휴장일) 8판.  아침 예약은 휴장일에도 돌며, 국내 장이 없는 날은 「해외 증시 브리핑」으로 판을 바꿔 냅니다."
  );

  s.addNotes(
    "가장 큰 성과는 '거르지 않는다'는 점입니다. 32일 동안 주말·휴장일을 포함해 매일 산출물이 나왔습니다. " +
    "휴장일에는 국내 마감이 없으므로 해외 증시 브리핑으로 판을 바꿔 내도록 지침에 규정해 두었습니다. " +
    "8/31 주에 판수가 20으로 뛴 것은 읽는 사람이 6쪽만 봐도 되도록 '핵심본'을 분리해 두 판을 함께 내기 시작했기 때문입니다. " +
    "검증 장치 5종은 실제 사고에서 나온 것입니다 — 예약 수집이 95분 늦어 금요일 값으로 월요일 판을 쓸 뻔한 일이 있었고, 그 뒤 신선도 확인을 필수 단계로 넣었습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   SLIDE 4 — 성과 ② 업무 조회 화면 4종
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "업무 조회 화면 4종 — 설치 없이 파일 하나로", "성과 ②");

  const cards = [
    [
      "미국 100대 기업 시세 조회",
      "대형주 100개를 검색·비교·차트·컨센서스·실적 일정까지 10개 섹션으로. 장중 10분 주기로 가격이 스스로 갱신됩니다.",
      "100개 기업 · 10개 섹션 · 4종목 동시 비교",
    ],
    [
      "ELS 상품 조회",
      "청약 진행 상품을 매일 자동 수집해 기초자산·조기상환 조건·수익 구조를 한 화면에. 만기 손익 시뮬레이터를 포함합니다.",
      "37개 상품 매일 자동 수집",
    ],
    [
      "국내 종목 통합 리포트",
      "종목명만 넣으면 시세·기술적지표·외국인/기관 수급·증권사 목표주가·뉴스·재무제표를 한 장의 리포트로 묶어 보여줍니다.",
      "6개 섹션 · PDF 저장 · 최대 4종목 비교",
    ],
    [
      "마포WM 모바일 창구",
      "전단의 QR 13개를 링크 한 개로 옮겨, 고객이 문자로 받은 주소를 누르면 해당 업무가 바로 열립니다. 배포는 자동입니다.",
      "13개 업무 · QR 스캔 단계 제거",
    ],
  ];
  cards.forEach(([h, b, metric], i) => {
    const x = i % 2 === 0 ? M : 6.9;
    const y = i < 2 ? 1.9 : 4.06;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.8, h: 1.96, rectRadius: 0.03,
      fill: { color: W }, line: { color: HAIR, width: 0.75 },
    });
    chip(s, x + 0.3, y + 0.28, String(i + 1), i % 2 === 0 ? ORANGE : BLUE);
    s.addText(h, {
      x: x + 0.9, y: y + 0.3, w: 4.6, h: 0.36, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 15.5, bold: true, color: INK,
    });
    s.addText(b, {
      x: x + 0.3, y: y + 0.86, w: 5.2, h: 0.72, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: BODY, lineSpacing: 16,
    });
    s.addText(metric, {
      x: x + 0.3, y: y + 1.56, w: 5.2, h: 0.3, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, bold: true, color: ORANGE_DEEP,
    });
  });

  // 하단 오렌지 콜아웃
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 6.22, w: CW, h: 0.82, rectRadius: 0.03,
    fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText(
    [
      { text: "사내망에서도 열립니다   ", options: { bold: true, fontSize: 14, color: W } },
      {
        text: "외부가 막히면 저장된 값으로 그리고(경로 4중 폴백), 어느 경로가 막혔는지 화면에서 진단해 담당자에게 보낼 요약을 만들어 줍니다. 인터넷이 없는 PC 용 오프라인 단일 파일도 매일 자동 생성됩니다.",
        options: { fontSize: 11.5, color: "FFF0E2" },
      },
    ],
    { x: M + 0.3, y: 6.34, w: CW - 0.6, h: 0.6, isTextBox: true, margin: 0, fontFace: F, lineSpacing: 16, valign: "middle" }
  );

  s.addNotes(
    "네 화면 모두 빌드 도구 없이 파일 하나로 동작합니다. 받는 사람이 설치할 것이 없다는 점이 현장 배포에서 결정적이었습니다. " +
    "가장 공들인 부분은 사내망 대응입니다. 업무용 PC 에서 외부 금융 사이트가 막히는 것을 전제로, " +
    "① 실시간 스트리밍 → ② 10분 주기 가격 파일 → ③ 브라우저 직접 조회 → ④ 저장 스냅샷 순서로 네 경로를 두고, " +
    "모두 막힌 경우에는 '예시 데이터'임을 화면에 명시해 업무에 잘못 쓰이지 않게 했습니다. " +
    "마포WM 창구 페이지의 13개 링크는 전단 QR 을 직접 디코딩해 옮긴 값으로, 추측해 만든 주소는 없습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   SLIDE 5 — 성과 요약 & 다음 단계 (Navy)
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: BLUE };

  s.addShape(pres.ShapeType.rect, {
    x: M, y: 0.52, w: CW, h: 0.013, fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText("마무리", {
    x: M, y: 0.6, w: 4.0, h: 0.28, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11.5, bold: true, color: SOFT, charSpacing: 1.2,
  });
  s.addText("정량 성과와 다음 단계", {
    x: M, y: 0.88, w: CW, h: 0.62, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 28, bold: true, color: W, charSpacing: -0.4,
  });

  // 좌측 — 정량 성과
  s.addText("정량 성과", {
    x: M, y: 1.82, w: 6.3, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: SOFT,
  });

  const rows = [
    ["60판 / 32일", "시황 브리핑 무인 발행 — 휴장일 포함 무결점 연속"],
    ["약 60시간", "브리핑 작성 시간 절감 (추정 · 판당 60분 기준)"],
    ["7종", "무인 운영 워크플로 — 하루 최대 60여 회 자동 실행"],
    ["100 · 37 · 35", "커버리지 — 미국 기업 100개, ELS 37개 상품, 데이터 35계열"],
    ["25,400줄", "화면 14,592줄 + 수집·검증 10,808줄"],
  ];
  rows.forEach(([k, v], i) => {
    const y = 2.3 + i * 0.88;
    s.addText(k, {
      x: M, y, w: 2.3, h: 0.66, isTextBox: true, margin: 0, valign: "middle",
      fontFace: F, fontSize: 17, bold: true, color: SOFT,
    });
    s.addText(v, {
      x: 2.98, y, w: 4.3, h: 0.66, isTextBox: true, margin: 0, valign: "middle",
      fontFace: F, fontSize: 11.5, color: ON_BLUE_SOFT, lineSpacing: 16,
    });
    if (i < 4) {
      s.addShape(pres.ShapeType.rect, {
        x: M, y: y + 0.66, w: 6.25, h: 0.01,
        fill: { color: "1E5288" }, line: { type: "none" },
      });
    }
  });

  // 우측 — 다음 단계 흰 카드
  s.addShape(pres.ShapeType.roundRect, {
    x: 7.4, y: 1.82, w: 5.3, h: 4.86, rectRadius: 0.03,
    fill: { color: W }, line: { type: "none" },
  });
  s.addText("다음 단계", {
    x: 7.76, y: 2.1, w: 4.6, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: BLUE,
  });

  const next = [
    ["사내 프록시 연결", "주소 한 줄만 등록하면 조회 화면이 지연 없는 실시간으로 전환됩니다. 전산 협의가 필요합니다."],
    ["지점 내 공유", "브리핑 목록 주소와 조회 화면을 지점에 열어 사용 의견을 받고, 요청 항목을 화면에 반영합니다."],
    ["다른 업무로 확장", "같은 구조(예약 수집 → 자동 검증 → 단일 파일)를 연금·해외주식 안내 등 다른 반복 업무에 적용합니다."],
  ];
  next.forEach(([h, b], i) => {
    const y = 2.64 + i * 1.18;
    chip(s, 7.76, y, String(i + 1), ORANGE);
    s.addText(h, {
      x: 8.36, y: y - 0.02, w: 4.0, h: 0.32, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: INK,
    });
    s.addText(b, {
      x: 8.36, y: y + 0.32, w: 4.0, h: 0.72, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: BODY, lineSpacing: 16,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 7.76, y: 6.14, w: 4.6, h: 0.01, fill: { color: "E5E4E1" }, line: { type: "none" },
  });
  s.addText(
    "유의 — 조회 화면은 정보 제공용 사내 참고 자료입니다. 고객 대외 배포 시 준법감시 확인이 필요합니다.",
    { x: 7.76, y: 6.24, w: 4.6, h: 0.36, isTextBox: true, margin: 0, fontFace: F, fontSize: 10, color: MUTED, lineSpacing: 13 }
  );

  s.addText(
    "절감 시간 산정 기준 — 시세 취합·작성·검증을 사람이 할 때 판당 60분으로 보고 발행 60판에 곱한 추정치이며, 실측값이 아닙니다.  그 외 수치는 저장소 산출물에서 직접 집계했습니다.",
    { x: M, y: 6.94, w: CW, h: 0.34, isTextBox: true, margin: 0, fontFace: F, fontSize: 10, color: "8FAAC6" }
  );

  s.addNotes(
    "정량 성과에서 유일한 추정치는 절감 시간입니다. 판당 60분으로 보수적으로 잡아 약 60시간이며, 실측이 아니라는 점을 명시했습니다. " +
    "나머지 수치는 저장소에서 직접 집계한 값입니다. " +
    "다음 단계에서 가장 효과가 큰 것은 사내 프록시 연결입니다 — 주소 한 줄 등록으로 조회 화면 전체가 실시간으로 바뀌므로, 전산 부서 협의를 요청드립니다. " +
    "확장 관점에서는 이번에 만든 구조(예약 수집 → 자동 검증 → 단일 파일 배포)가 특정 업무에 종속되지 않으므로, 다른 반복 업무에도 같은 방식으로 적용할 수 있습니다."
  );
}

const OUT = process.argv[2] || "업무자동화_구축결과보고.pptx";
pres.writeFile({ fileName: OUT }).then(() => console.log("생성 완료:", OUT));
