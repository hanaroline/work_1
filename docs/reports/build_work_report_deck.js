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

const F = "Spoqa Han Sans Neo"; // 브랜드 지정 단일 패밀리

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "마포WM";
pres.title = "Claude Code 기반 업무 자동화 구축 결과 보고";

const SW = 13.3;
const M = 0.6;
const CW = SW - M * 2; // 12.1

// 1px 오렌지 섹션 룰 + 좌측 제목 (브랜드 시그니처 §9.1)
function sectionHead(slide, title, kicker) {
  slide.addShape(pres.ShapeType.rect, {
    x: M, y: 0.44, w: CW, h: 0.013, fill: { color: ORANGE }, line: { type: "none" },
  });
  if (kicker) {
    slide.addText(kicker, {
      x: M, y: 0.52, w: 5.0, h: 0.26, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, bold: true, color: ORANGE, charSpacing: 1.2,
    });
  }
  slide.addText(title, {
    x: M, y: kicker ? 0.78 : 0.56, w: CW, h: 0.56, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 26, bold: true, color: INK, charSpacing: -0.4,
  });
}

function footnote(slide, text, dark) {
  slide.addText(text, {
    x: M, y: 6.98, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10, color: dark ? "8FAAC6" : MUTED, valign: "top",
  });
}

function chip(slide, x, y, n, bg, size) {
  const s = size || 0.44;
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w: s, h: s, rectRadius: 0.03, fill: { color: bg }, line: { type: "none" },
  });
  slide.addText(n, {
    x, y, w: s, h: s, isTextBox: true, margin: 0,
    fontFace: F, fontSize: s > 0.5 ? 15 : 13, bold: true, color: W,
    align: "center", valign: "middle",
  });
}

// 카드 한 장 — 번호 · 제목 · 설명 · 성과 수치
function featureCard(slide, o) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.03,
    fill: { color: W }, line: { color: HAIR, width: 0.75 },
  });
  chip(slide, o.x + 0.26, o.y + 0.24, o.n, o.accent);
  slide.addText(o.title, {
    x: o.x + 0.82, y: o.y + 0.26, w: o.w - 1.08, h: 0.34, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14.5, bold: true, color: INK,
  });
  slide.addText(o.body, {
    x: o.x + 0.26, y: o.y + 0.76, w: o.w - 0.52, h: o.h - 1.36, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, color: BODY, lineSpacing: 15.5,
  });
  slide.addText(o.metric, {
    x: o.x + 0.26, y: o.y + o.h - 0.5, w: o.w - 0.52, h: 0.28, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10.5, bold: true, color: ORANGE_DEEP,
  });
}

/* ══════════════════════════════════════════════════════════════
   1 — 표지
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

  s.addText("매일·매주 도는 자동 산출물 4종 · 현장 업무 화면 8종 · 자동화 워크플로 30종", {
    x: M, y: 3.5, w: 7.3, h: 0.86, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16, color: W, lineSpacing: 25,
  });

  [
    ["구축 기간", "   2026.06 – 09.09  (약 4개월)"],
    ["수행 방식", "   Claude Code 세션 45회 + GitHub Actions 예약 실행"],
    ["산출물 위치", "   사내 저장소 work_1 — 작업 브랜치 36개"],
  ].forEach(([k, v], i) => {
    s.addText(
      [
        { text: k, options: { bold: true, color: W } },
        { text: v, options: { color: ON_ORANGE_SOFT } },
      ],
      { x: M, y: 4.86 + i * 0.38, w: 7.3, h: 0.34, isTextBox: true, margin: 0, fontFace: F, fontSize: 13 }
    );
  });

  // 우측 흰 카드 — 핵심 수치 4
  s.addShape(pres.ShapeType.roundRect, {
    x: 8.4, y: 1.22, w: 4.3, h: 5.06, rectRadius: 0.02,
    fill: { color: W }, line: { type: "none" },
  });
  s.addText("한눈에", {
    x: 8.78, y: 1.5, w: 3.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: ORANGE, charSpacing: 1.4,
  });

  [
    ["12", "종", "현장에서 쓰고 있는 화면·자동 산출물"],
    ["30", "종", "무인 운영 중인 수집·검증 워크플로"],
    ["60", "판", "자동 발행한 시황 브리핑 (32일 연속)"],
    ["4,600", "여", "조회 가능한 상품·종목 (펀드·ETF·ELS·주식)"],
  ].forEach(([num, unit, label], i) => {
    const y = 1.95 + i * 1.07;
    s.addText(
      [
        { text: num, options: { fontSize: 29, bold: true, color: BLUE } },
        { text: " " + unit, options: { fontSize: 14, bold: true, color: ORANGE } },
      ],
      { x: 8.78, y, w: 3.6, h: 0.46, isTextBox: true, margin: 0, fontFace: F }
    );
    s.addText(label, {
      x: 8.78, y: y + 0.46, w: 3.6, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 14.5,
    });
    if (i < 3) {
      s.addShape(pres.ShapeType.rect, {
        x: 8.78, y: y + 0.95, w: 3.6, h: 0.01, fill: { color: "E5E4E1" }, line: { type: "none" },
      });
    }
  });

  s.addNotes(
    "6월부터 9월까지 약 4개월간 Claude Code 로 수행한 업무 자동화 구축 결과입니다. " +
    "작업은 세션 45회, 저장소 작업 브랜치 36개로 남아 있습니다. " +
    "성과는 세 갈래입니다 — (1) 매일·매주 스스로 도는 자동 산출물 4종, " +
    "(2) 상품 판매와 고객 잔고를 다루는 현장 업무 화면 4종, " +
    "(3) 시세·상품 조회 화면 4종. 전부 지금 쓰고 있는 것들입니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   2 — 작업 지도
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "네 달 동안 무엇을 만들었나", "작업 지도");

  // 3단계 진행
  const phases = [
    ["1단계", "6 ~ 7월", "도입 · 개별 요청 처리", "자료 검증, 고객 제안서, 세미나 강의안, 세금 계산기 등 그때그때 들어오는 일을 처리하며 도구를 익혔습니다."],
    ["2단계", "8월", "매일 도는 자동 산출물", "사람이 매일 하던 일을 예약으로 옮겼습니다 — 시황 브리핑, 증권사 리포트 요약, 상품 데이터 수집."],
    ["3단계", "8 ~ 9월", "현장 업무 화면 구축", "상품 판매·고객 잔고·시세 조회를 설치 없는 단일 화면으로 묶었습니다."],
  ];
  phases.forEach(([tag, period, title, body], i) => {
    const x = M + i * 4.08;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.7, w: 3.86, h: 2.1, rectRadius: 0.03,
      fill: { color: i === 1 ? TINT : SUBTLE }, line: { color: HAIR, width: 0.75 },
    });
    s.addText(
      [
        { text: tag, options: { bold: true, color: W, fontSize: 10.5 } },
      ],
      { x: x + 0.26, y: 1.94, w: 0.72, h: 0.28, isTextBox: true, margin: 0, fontFace: F,
        align: "center", valign: "middle", fill: { color: i === 1 ? ORANGE : BLUE } }
    );
    s.addText(period, {
      x: x + 1.08, y: 1.94, w: 2.5, h: 0.28, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, bold: true, color: MUTED, valign: "middle",
    });
    s.addText(title, {
      x: x + 0.26, y: 2.34, w: 3.34, h: 0.34, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14.5, bold: true, color: INK,
    });
    s.addText(body, {
      x: x + 0.26, y: 2.76, w: 3.34, h: 0.9, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: BODY, lineSpacing: 15.5,
    });
  });

  // 갈래별 산출물 표
  s.addText("갈래별 산출물", {
    x: M, y: 4.06, w: 6.0, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: INK,
  });
  s.addTable(
    [
      [
        { text: "갈래", options: { bold: true, color: INK, fill: { color: SOFT } } },
        { text: "산출물", options: { bold: true, color: INK, fill: { color: SOFT } } },
        { text: "돌아가는 방식", options: { bold: true, color: INK, fill: { color: SOFT } } },
      ],
      ["자동 산출물", "모닝 시황 브리핑 · 장마감 시황 브리핑 · 증권사 리포트 다이제스트 · ELS 주간 분석", "예약 무인 실행"],
      ["판매·잔고 업무", "완전판매 스크립트 자동완성 · ETF 편입종목 조회 · 국내 공모펀드 조회 · 보유자산 통합 브리핑", "화면 + 매일 수집"],
      ["시세·상품 조회", "미국 100대 기업 · ELS 상품 조회 · 국내 종목 통합 리포트 · 마포WM 모바일 창구", "단일 파일 배포"],
      ["그 외 단건", "부동산 세금 계산기 · 고객 상품 제안서 · 반도체 세미나 강의안 · 데이터센터 밸류체인 맵 등", "요청 시 제작"],
    ],
    {
      x: M, y: 4.44, w: CW,
      colW: [1.55, 8.15, 2.4],
      rowH: [0.36, 0.5, 0.5, 0.5, 0.5],
      fontFace: F, fontSize: 10.5, color: BODY, valign: "middle",
      border: { type: "solid", color: "E5E4E1", pt: 0.75 },
      margin: [0.04, 0.1, 0.04, 0.1],
    }
  );

  footnote(
    s,
    "세션 기록으로 확인되는 작업은 7월 9일부터 45회입니다. 6월은 도구를 익히던 시기로 별도 산출물 기록이 남아 있지 않습니다."
  );

  s.addNotes(
    "네 달을 세 단계로 나눠 보면 성격이 분명히 갈립니다. " +
    "6~7월은 들어오는 일을 하나씩 처리하며 도구를 익힌 시기이고, 8월부터 '매일 반복되는 일'을 예약으로 넘겼습니다. " +
    "8월 말부터 9월까지는 상품 판매와 고객 잔고를 다루는 현장 화면을 만들었습니다. " +
    "6월은 세션 기록이 남아 있지 않아 도입기로만 적었습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   3 — 성과 ① 자동 산출물
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "사람 없이 매일 나오는 산출물 4종", "성과 ①");

  const items = [
    ["07:30", "매일", "모닝 시황 브리핑", "전 거래일 국내 마감 + 간밤 미국 마감 + 오늘 일정. 휴장일에는 「해외 증시 브리핑」으로 판을 바꿔 냅니다."],
    ["16:10", "거래일", "장마감 시황 브리핑", "그날 국내 장을 지수·수급·업종·종목으로 정리합니다. 국내 장이 없으면 돌지 않습니다."],
    ["08:40 · 17:10", "매일", "증권사 리포트 다이제스트", "네이버 리서치 6판 + 미래에셋·하나 리서치를 모아 원문 문장으로 요약하고 목표주가 변경을 뽑습니다."],
    ["주간", "매주", "ELS 상품 분석", "청약 진행 상품을 모아 기초자산·조기상환 조건·수익 구조를 비교하고 DART 투자설명서를 붙입니다."],
  ];
  items.forEach(([time, freq, title, body], i) => {
    const y = 1.62 + i * 1.3;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: 1.42, h: 0.62, rectRadius: 0.03,
      fill: { color: i < 2 ? ORANGE : BLUE }, line: { type: "none" },
    });
    s.addText(time, {
      x: M, y: y + 0.06, w: 1.42, h: 0.28, isTextBox: true, margin: 0,
      fontFace: F, fontSize: time.length > 6 ? 10 : 13, bold: true, color: W, align: "center",
    });
    s.addText(freq, {
      x: M, y: y + 0.33, w: 1.42, h: 0.24, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 9.5, color: i < 2 ? "FFE7D1" : ON_BLUE_SOFT, align: "center",
    });
    s.addText(title, {
      x: 2.2, y: y - 0.02, w: 4.9, h: 0.34, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK,
    });
    s.addText(body, {
      x: 2.2, y: y + 0.34, w: 4.9, h: 0.78, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: BODY, lineSpacing: 15.5,
    });
  });

  // 우측 — 브리핑 발행 실적
  s.addText("시황 브리핑 발행 실적 (주차별 판수)", {
    x: 7.5, y: 1.58, w: 5.2, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13.5, bold: true, color: INK,
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
      x: 7.36, y: 1.9, w: 5.5, h: 2.32,
      barDir: "col",
      chartColors: [ORANGE],
      showLegend: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: BODY,
      dataLabelFontFace: F,
      dataLabelFontSize: 10,
      dataLabelFontBold: true,
      catAxisLabelColor: MUTED,
      catAxisLabelFontFace: F,
      catAxisLabelFontSize: 10,
      catAxisLineShow: false,
      catGridLine: { style: "none" },
      valAxisHidden: true,
      valAxisMaxVal: 24,
      valGridLine: { style: "none" },
      barGapWidthPct: 55,
      plotArea: { fill: { color: W } },
    }
  );
  s.addText("8/31 주부터 핵심본·전체본 두 판을 함께 냅니다. 9/07 주는 3일치입니다.", {
    x: 7.5, y: 4.24, w: 5.2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10, color: MUTED,
  });

  s.addText("발행 전 자동 검증 5종", {
    x: 7.5, y: 4.66, w: 5.2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13.5, bold: true, color: INK,
  });
  s.addTable(
    [
      [
        { text: "검증 장치", options: { bold: true, color: INK, fill: { color: SOFT } } },
        { text: "무엇을 막는가", options: { bold: true, color: INK, fill: { color: SOFT } } },
      ],
      ["숫자 대장 검산", "표와 본문 수치가 어긋난 채 발행"],
      ["시세 신선도 확인", "지난 거래일 값으로 오늘 판을 작성"],
      ["금리 기준 확인", "기사 추정치를 재무부 곡선처럼 표기"],
      ["지난 판 중복 검사", "어제와 같은 문장·해석 반복"],
      ["인쇄 맞춤 확인", "6쪽 규격 초과 · 표 잘림"],
    ],
    {
      x: 7.5, y: 4.98, w: 5.2,
      colW: [1.78, 3.42],
      rowH: [0.3, 0.32, 0.32, 0.32, 0.32, 0.32],
      fontFace: F, fontSize: 10.5, color: BODY, valign: "middle",
      border: { type: "solid", color: "E5E4E1", pt: 0.75 },
      margin: [0.04, 0.1, 0.04, 0.1],
    }
  );

  footnote(
    s,
    "브리핑 60판 구성 — 모닝 24판 · 장마감 13판 · 핵심본 15판 · 해외 증시(주말·휴장일) 8판. 검증 중 하나라도 어긋나면 발행을 멈추고 사유를 남깁니다."
  );

  s.addNotes(
    "네 가지 모두 사람이 손대지 않아도 정해진 시각에 산출물이 나옵니다. " +
    "가장 큰 성과는 '거르지 않는다'는 점입니다 — 32일 동안 주말·휴장일을 포함해 매일 나왔습니다. " +
    "증권사 리포트 다이제스트는 하루 두 번 돌며, 요약은 모델이 새로 쓴 문장이 아니라 리포트 원문에서 고른 여섯 줄입니다. " +
    "지어낸 요약이 리포트 자리에 앉는 것보다 원문이 안전하다고 보았습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   4 — 성과 ② 판매·잔고 업무 화면
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "상품 판매와 고객 잔고를 다루는 화면 4종", "성과 ②");

  const cards = [
    {
      n: "1", accent: ORANGE, title: "완전판매 스크립트 자동완성",
      body: "미스터리쇼퍼 대응용 스크립트를 상품별로 자동 완성합니다. 상품을 고르면 DART 투자설명서 항목이 문장에 주입되고, 큰 글씨 프롬프터로 읽으며 셀프 채점까지 이어집니다.",
      metric: "평가표 8종 × 고령/비고령 16조합 · DART 회차 92건 자동수집",
    },
    {
      n: "2", accent: BLUE, title: "ETF 편입종목 조회",
      body: "국내·해외 ETF의 상위 편입종목과 비중을 봅니다. 여러 ETF를 겹쳐 중복 편입 비율을 매트릭스로 보고, 「삼성전자를 담은 ETF」처럼 종목에서 거꾸로도 찾습니다.",
      metric: "ETF 1,348개 (국내 1,163 · 해외 185) · 최대 8개 중복도 비교",
    },
    {
      n: "3", accent: ORANGE, title: "국내 공모펀드 조회",
      body: "국내 설정 공모펀드를 보유종목 전체와 벤치마크 대비 성과로 봅니다. 총보수는 클래스마다 달라 하나로 줄이지 않고 최저~최고 범위와 클래스표를 함께 싣습니다.",
      metric: "펀드 3,192개 · 클래스 19,092개 · 보유종목 전건 수집",
    },
    {
      n: "4", accent: BLUE, title: "보유자산 통합 브리핑",
      body: "고객 보유 종목을 넣으면 주식·채권·ETF·펀드를 자산군별로 브리핑합니다. 채권은 만기 보유·중도매도 시뮬레이션까지 붙습니다. 사내 PC 에서 실행 파일로 열고 태블릿으로도 봅니다.",
      metric: "4개 자산군 · Python 없이 도는 로컬 서버 + 태블릿 열람",
    },
  ];
  cards.forEach((c, i) => {
    featureCard(s, {
      ...c,
      x: i % 2 === 0 ? M : 6.9,
      y: i < 2 ? 1.62 : 4.0,
      w: 5.8, h: 2.22,
    });
  });

  footnote(
    s,
    "완전판매 화면은 ELS·DLS 차수별 지급률을 일부러 자동 계산하지 않습니다 — 표기기준(연율/누적)이 상품마다 달라 자동 계산하면 사실과 다른 설명이 되기 때문입니다."
  );

  s.addNotes(
    "네 화면은 성격이 다릅니다. 완전판매 스크립트는 '규정을 어기지 않게' 돕는 화면이고, " +
    "ETF·펀드 조회는 '고객에게 설명할 근거를 찾는' 화면, 보유자산 통합 브리핑은 '내 고객 자산을 한 장으로 보는' 화면입니다. " +
    "완전판매에서 특히 신경 쓴 것은 자동 계산의 한계를 인정한 부분입니다 — 지급률처럼 상품마다 표기기준이 다른 값은 " +
    "일부러 비워 두고 빨간색으로 '투자설명서에서 옮겨 적으세요'라고 표시합니다. " +
    "16조합 모두 Check Point 를 전부 이행하면 정확히 103점이 나오는 것을 브라우저 테스트로 확인했습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   5 — 성과 ③ 시세·상품 조회 화면
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "시세·상품 조회 화면 4종 — 설치 없이 파일 하나로", "성과 ③");

  const cards = [
    {
      n: "1", accent: ORANGE, title: "미국 100대 기업 시세 조회",
      body: "대형주 100개를 검색·비교·차트·컨센서스·실적 일정까지 10개 섹션으로 봅니다. 장중 10분 주기로 가격이 스스로 갱신됩니다.",
      metric: "100개 기업 · 10개 섹션 · 4종목 동시 비교",
    },
    {
      n: "2", accent: BLUE, title: "ELS 상품 조회",
      body: "청약 진행 상품을 매일 자동 수집해 기초자산·조기상환 조건·수익 구조를 한 화면에 놓고, 만기 손익을 시뮬레이션합니다.",
      metric: "37개 상품 매일 자동 수집 · 손익 시뮬레이터",
    },
    {
      n: "3", accent: ORANGE, title: "국내 종목 통합 리포트",
      body: "종목명만 넣으면 시세·기술적지표·외국인/기관 수급·증권사 목표주가·뉴스·재무제표를 한 장의 리포트로 묶어 보여줍니다.",
      metric: "6개 섹션 · PDF 저장 · 최대 4종목 비교",
    },
    {
      n: "4", accent: BLUE, title: "마포WM 모바일 창구",
      body: "전단의 QR 13개를 링크 한 개로 옮겨, 고객이 문자로 받은 주소를 누르면 해당 업무가 바로 열립니다. 배포는 자동입니다.",
      metric: "13개 업무 · QR 스캔 단계 제거 · Pages 자동 배포",
    },
  ];
  cards.forEach((c, i) => {
    featureCard(s, {
      ...c,
      x: i % 2 === 0 ? M : 6.9,
      y: i < 2 ? 1.62 : 3.72,
      w: 5.8, h: 1.94,
    });
  });

  // 그 외 단건 산출물
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 5.84, w: CW, h: 0.92, rectRadius: 0.03,
    fill: { color: TINT }, line: { type: "none" },
  });
  s.addText(
    [
      { text: "그 외 단건 산출물   ", options: { bold: true, fontSize: 13, color: BLUE } },
      {
        text: "부동산 세금 계산기 · 고객 상품 제안서 생성 도구 · 은퇴자산 설계 제안서 · IRP 상품 제안 · 반도체 세미나 강의안 · " +
          "데이터센터 밸류체인 맵 · 블룸버그 브리핑 자동 번역 · 부서 공유 저장소 · 내부망 파일 공유 사이트",
        options: { fontSize: 11, color: BODY },
      },
    ],
    { x: M + 0.3, y: 5.96, w: CW - 0.6, h: 0.7, isTextBox: true, margin: 0, fontFace: F, lineSpacing: 15.5 }
  );

  footnote(
    s,
    "네 화면 모두 빌드 도구도 설치도 없이 파일 하나로 동작합니다. 받는 사람이 준비할 것이 없다는 점이 현장 배포에서 결정적이었습니다."
  );

  s.addNotes(
    "이 갈래는 '흩어진 조회를 한 곳으로' 묶은 것입니다. " +
    "마포WM 창구 페이지의 13개 링크는 전단 QR 을 직접 디코딩해 옮긴 값이고, 추측해 만든 주소는 없습니다. " +
    "아래 단건 산출물은 그때그때 요청으로 만든 것들인데, 이것들이 쌓이면서 위의 상시 화면으로 이어졌습니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   6 — 공통 설계
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: W };
  sectionHead(s, "업무에 쓸 수 있게 만든 두 가지 장치", "공통 설계");

  // 좌 — 사내망 대응
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.62, w: 5.8, h: 4.4, rectRadius: 0.03,
    fill: { color: SUBTLE }, line: { color: HAIR, width: 0.75 },
  });
  chip(s, M + 0.3, 1.9, "1", ORANGE, 0.52);
  s.addText("사내망에서도 열리게", {
    x: M + 0.96, y: 1.92, w: 4.6, h: 0.36, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16, bold: true, color: INK,
  });
  s.addText(
    "업무용 PC 에서 외부 금융 사이트가 방화벽·CORS 로 막히는 것을 전제로 만들었습니다. " +
    "수집은 사내망 밖(러너)에서 하고, 화면은 저장된 값을 읽어 그립니다.",
    { x: M + 0.3, y: 2.44, w: 5.2, h: 0.66, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: BODY, lineSpacing: 15.5 }
  );
  [
    ["경로 4중 폴백", "실시간 스트리밍 → 10분 주기 가격 파일 → 브라우저 직접 조회 → 저장 스냅샷"],
    ["연결 점검 진단", "어느 경로가 왜 막혔는지 화면에서 판정하고, 담당자에게 보낼 요약을 만들어 줍니다"],
    ["오프라인 단일 파일", "인터넷 없는 PC 용으로 데이터를 파일 안에 넣은 판을 매일 자동 생성합니다"],
    ["로컬 실행 런처", "설치 권한이 없는 PC 에서도 실행 파일 하나로 열립니다 (Python 불필요)"],
  ].forEach(([h, b], i) => {
    const y = 3.2 + i * 0.7;
    s.addText("·", {
      x: M + 0.3, y, w: 0.16, h: 0.26, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: ORANGE,
    });
    s.addText(
      [
        { text: h + "  ", options: { bold: true, color: INK } },
        { text: b, options: { color: BODY } },
      ],
      { x: M + 0.5, y, w: 5.0, h: 0.64, isTextBox: true, margin: 0, fontFace: F, fontSize: 10.5, lineSpacing: 14.5 }
    );
  });

  // 우 — 자동 검증
  s.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 1.62, w: 5.8, h: 4.4, rectRadius: 0.03,
    fill: { color: SUBTLE }, line: { color: HAIR, width: 0.75 },
  });
  chip(s, 7.2, 1.9, "2", BLUE, 0.52);
  s.addText("틀린 숫자가 조용히 나가지 않게", {
    x: 7.86, y: 1.92, w: 4.6, h: 0.36, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16, bold: true, color: INK,
  });
  s.addText(
    "자동 산출에서 가장 위험한 것은 사람이 검토하지 않은 숫자입니다. " +
    "원천이 주는 값을 그대로 싣지 않고, 판정에 걸리면 비우거나 멈춥니다.",
    { x: 7.2, y: 2.44, w: 5.2, h: 0.66, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: BODY, lineSpacing: 15.5 }
  );
  s.addTable(
    [
      [
        { text: "위험", options: { bold: true, color: INK, fill: { color: SOFT } } },
        { text: "막은 방법", options: { bold: true, color: INK, fill: { color: SOFT } } },
      ],
      ["펀드 수익률 +244%", "기준가 재산정 계단을 먹은 칸만 골라 비움"],
      ["ELS 지급률 오설명", "표기기준이 갈리는 값은 자동 계산하지 않음"],
      ["기초자산 누락", "변동성·상관계수 개수가 어긋나면 수집 중단"],
      ["총보수 단일값 왜곡", "클래스별 최저~최고 범위로 표기"],
      ["지어낸 요약", "리포트 원문 문장만 골라 실음"],
    ],
    {
      x: 7.2, y: 3.2, w: 5.2,
      colW: [1.86, 3.34],
      rowH: [0.34, 0.4, 0.4, 0.4, 0.4, 0.4],
      fontFace: F, fontSize: 10.5, color: BODY, valign: "middle",
      border: { type: "solid", color: "E5E4E1", pt: 0.75 },
      margin: [0.04, 0.1, 0.04, 0.1],
    }
  );

  footnote(
    s,
    "두 장치 덕분에 산출물을 그대로 업무에 쓸 수 있습니다. 값이 확실하지 않을 때는 빈칸으로 두고 그 사유를 화면에 적어, 읽는 사람이 무엇을 확인해야 하는지 알 수 있게 했습니다."
  );

  s.addNotes(
    "이 장이 이 보고의 핵심입니다. 화면을 만드는 것보다 어려운 것은 '업무에 쓸 수 있게' 만드는 것이었습니다. " +
    "두 가지가 필요했습니다. 첫째, 사내망에서 열려야 합니다 — 업무용 PC 에서 외부 금융 사이트가 막히므로 " +
    "수집은 사내망 밖에서 하고 화면은 저장된 값을 읽게 했습니다. " +
    "둘째, 숫자가 맞아야 합니다 — 예를 들어 원천이 어떤 단기채권 펀드의 1개월 수익률을 +244% 로 주는데, " +
    "이는 결산으로 기준가를 되돌린 계단 때문입니다. 계단이 있다고 무조건 비우면 실제 값도 사라지므로, " +
    "화면에 실릴 그 숫자가 계단을 먹었는지만 판정해 그 칸만 비웁니다."
  );
}

/* ══════════════════════════════════════════════════════════════
   7 — 정량 성과 & 다음 단계
   ══════════════════════════════════════════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: BLUE };

  s.addShape(pres.ShapeType.rect, {
    x: M, y: 0.44, w: CW, h: 0.013, fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText("마무리", {
    x: M, y: 0.52, w: 4.0, h: 0.26, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, bold: true, color: SOFT, charSpacing: 1.2,
  });
  s.addText("정량 성과와 다음 단계", {
    x: M, y: 0.78, w: CW, h: 0.56, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 26, bold: true, color: W, charSpacing: -0.4,
  });

  s.addText("정량 성과", {
    x: M, y: 1.72, w: 6.3, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: SOFT,
  });

  const rows = [
    ["12종", "현장에서 쓰고 있는 화면·자동 산출물 (그 외 단건 다수)"],
    ["30종", "무인 운영 워크플로 — 예약 15종 · 장중 10분 주기 갱신"],
    ["60판 / 32일", "시황 브리핑 무인 발행 — 휴장일 포함 무결점 연속"],
    ["약 60시간", "브리핑 작성 시간 절감 (추정 · 판당 60분 기준)"],
    ["4,677", "커버리지 — 펀드 3,192 · ETF 1,348 · 미국 100 · ELS 37"],
    ["36개", "작업 브랜치 — 산출물·수집·검증이 저장소에 남음"],
  ];
  rows.forEach(([k, v], i) => {
    const y = 2.14 + i * 0.74;
    s.addText(k, {
      x: M, y, w: 2.3, h: 0.58, isTextBox: true, margin: 0, valign: "middle",
      fontFace: F, fontSize: 16, bold: true, color: SOFT,
    });
    s.addText(v, {
      x: 2.98, y, w: 4.3, h: 0.58, isTextBox: true, margin: 0, valign: "middle",
      fontFace: F, fontSize: 11, color: ON_BLUE_SOFT, lineSpacing: 15,
    });
    if (i < 5) {
      s.addShape(pres.ShapeType.rect, {
        x: M, y: y + 0.58, w: 6.25, h: 0.01,
        fill: { color: "1E5288" }, line: { type: "none" },
      });
    }
  });

  // 우측 — 다음 단계
  s.addShape(pres.ShapeType.roundRect, {
    x: 7.4, y: 1.72, w: 5.3, h: 4.98, rectRadius: 0.03,
    fill: { color: W }, line: { type: "none" },
  });
  s.addText("다음 단계", {
    x: 7.76, y: 2.0, w: 4.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: BLUE,
  });

  [
    ["사내 프록시 연결", "주소 한 줄만 등록하면 조회 화면이 지연 없는 실시간으로 바뀝니다. 전산 협의가 필요합니다."],
    ["지점·부서 공유", "지금은 개인 단위로 쓰고 있습니다. 브리핑 목록과 조회 화면을 열어 사용 의견을 받고 반영합니다."],
    ["완전판매 상품군 확대", "ELS 는 DART 자동수집이 붙었습니다. 펀드·채권 설명서까지 넓히면 전 상품군이 자동완성됩니다."],
    ["다른 반복 업무로", "같은 구조(예약 수집 → 자동 검증 → 단일 파일)를 연금·해외주식 안내로 옮깁니다."],
  ].forEach(([h, b], i) => {
    const y = 2.4 + i * 0.96;
    chip(s, 7.76, y, String(i + 1), ORANGE, 0.4);
    s.addText(h, {
      x: 8.3, y: y - 0.03, w: 4.06, h: 0.3, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: INK,
    });
    s.addText(b, {
      x: 8.3, y: y + 0.28, w: 4.06, h: 0.6, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 10.5, color: BODY, lineSpacing: 14,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 7.76, y: 6.1, w: 4.6, h: 0.01, fill: { color: "E5E4E1" }, line: { type: "none" },
  });
  s.addText(
    "유의 — 조회 화면은 정보 제공용 사내 참고 자료입니다. 고객 대외 배포 시 준법감시 확인이 필요합니다.",
    { x: 7.76, y: 6.2, w: 4.6, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 9.5, color: MUTED, lineSpacing: 12.5 }
  );

  footnote(
    s,
    "절감 시간 산정 기준 — 시세 취합·작성·검증을 사람이 할 때 판당 60분으로 보고 발행 60판에 곱한 추정치이며, 실측값이 아닙니다. 그 외 수치는 저장소 산출물과 세션 기록에서 직접 집계했습니다.",
    true
  );

  s.addNotes(
    "정량 성과에서 유일한 추정치는 절감 시간입니다. 판당 60분으로 보수적으로 잡아 약 60시간이며, 실측이 아니라고 명시했습니다. " +
    "나머지는 저장소와 세션 기록에서 직접 집계한 값입니다. " +
    "다음 단계에서 효과가 가장 큰 것은 사내 프록시 연결입니다 — 주소 한 줄 등록으로 조회 화면 전체가 실시간이 되므로 전산 부서 협의를 요청드립니다. " +
    "그리고 지금은 대부분 개인 단위로 쓰고 있어, 지점·부서로 넓히면 같은 구축 비용으로 쓰는 사람만 늘어납니다."
  );
}

const OUT = process.argv[2] || "업무자동화_구축결과보고.pptx";
pres.writeFile({ fileName: OUT }).then(() => console.log("생성 완료:", OUT));
