// 미래에셋 디자인 토큰과 슬라이드 조립 부품.
//
// 두 덱(deckA·deckB)이 같은 자를 쓰도록 여기 한 곳에 모은다. 색을 손으로
// 적지 않는 것이 목적이다 — "비슷한 오렌지"가 섞이는 순간 자료가 티난다.
//
// pptxgenjs 에서 걸렸던 것들을 여기서 한 번에 막는다.
//   - 색에 '#' 를 붙이면 조용히 검정이 된다. 토큰에 '#' 를 넣지 않는다.
//   - pres.layout 은 첫 슬라이드보다 먼저 정해야 한다.
//   - 옵션 객체를 재사용하면 pptxgenjs 가 그 안을 고쳐 다음 호출이 오염된다.
//     부품마다 객체를 새로 짓는다.
//   - 글상자는 isTextBox:true + margin:0 이라야 좌표대로 선다.

const C = {
  orange:   'F58220',
  navy:     '043B72',
  soft:     'FAB072',   // 표 머리
  hi:       'D7D7D7',   // 셀 강조
  surface:  'ECEFF4',
  subtle:   'F7F8FA',
  hair:     'CDCECB',
  hairsoft: 'E5E4E1',
  white:    'FFFFFF',
  ink:      '1A1A1A',
  body:     '3D3D3D',
  muted:    '6C6C6C',
  mutedsoft:'84888B',
};

const FONT = 'Spoqa Han Sans Neo';

// 13.333 × 7.5인치(16:9 와이드). 좌우 여백 0.60.
const G = {
  W_PAGE: 13.333,
  H_PAGE: 7.5,
  L: 0.60,
  W: 12.10,
  yEyebrow: 0.28,
  yTitle:   0.55,
  yRule:    1.18,
  yBody:    1.40,
};

function layout(pres) {
  pres.defineLayout({ name: 'MAS_WIDE', width: G.W_PAGE, height: G.H_PAGE });
  pres.layout = 'MAS_WIDE';
}

// ── 머리: 눈썹글 + 제목 + 1px 오렌지 룰 ───────────────────────────────
function head(s, eyebrow, title) {
  s.addText(eyebrow, {
    x: G.L, y: G.yEyebrow, w: G.W, h: 0.22,
    fontFace: FONT, fontSize: 10, bold: true, color: C.orange,
    charSpacing: 0.6, isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(title, {
    x: G.L, y: G.yTitle, w: G.W, h: 0.52,
    fontFace: FONT, fontSize: 21, bold: true, color: C.ink,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  // 시그니처 1px 룰. 도형 높이 0 은 안 먹으므로 아주 얇은 사각형으로 긋는다.
  s.addShape('rect', {
    x: G.L, y: G.yRule, w: G.W, h: 0.012, fill: { color: C.orange }, line: { width: 0 },
  });
}

// ── 구역 제목: 작은 오렌지 머리글 ────────────────────────────────────
function sect(s, y, text, x, w) {
  s.addText(text, {
    x: x === undefined ? G.L : x, y: y, w: w === undefined ? G.W : w, h: 0.24,
    fontFace: FONT, fontSize: 11.5, bold: true, color: C.navy,
    isTextBox: true, margin: 0, valign: 'middle',
  });
}

// ── 카드: 옅은 면 + 제목 + 본문 ──────────────────────────────────────
function card(s, x, y, w, h, title, lines) {
  s.addShape('rect', {
    x: x, y: y, w: w, h: h,
    fill: { color: C.surface }, line: { color: C.hairsoft, width: 0.75 },
    rectRadius: 0.04,
  });
  s.addText(title, {
    x: x + 0.18, y: y + 0.13, w: w - 0.36, h: 0.26,
    fontFace: FONT, fontSize: 11.5, bold: true, color: C.orange,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(lines.map((t) => ({ text: t, options: { breakLine: true } })), {
    x: x + 0.18, y: y + 0.41, w: w - 0.36, h: h - 0.55,
    fontFace: FONT, fontSize: 10, color: C.body, lineSpacingMultiple: 1.22,
    isTextBox: true, margin: 0, valign: 'top',
  });
}

// ── 표 ───────────────────────────────────────────────────────────────
// rows[0] 이 머리. opts.hi 에 든 행 번호(머리 제외 0부터)는 D7D7D7 로 강조.
function table(s, x, y, w, rows, opts) {
  const o = opts || {};
  const colW = o.colW;
  const fs = o.fontSize || 9.5;
  const rowH = o.rowH || 0.27;
  const hi = o.hi || [];
  const align = o.align || [];

  const body = rows.map((r, ri) => r.map((cell, ci) => {
    const isHead = ri === 0;
    const marked = hi.indexOf(ri - 1) >= 0;
    return {
      text: String(cell),
      options: {
        fill: { color: isHead ? C.soft : (marked ? C.hi : C.white) },
        color: isHead ? C.ink : C.body,
        bold: isHead || marked,
        fontSize: fs,
        align: isHead ? 'center' : (align[ci] || 'center'),
        valign: 'middle',
      },
    };
  }));

  s.addTable(body, {
    x: x, y: y, w: w, colW: colW,
    rowH: rowH,
    fontFace: FONT,
    border: { type: 'solid', color: C.hairsoft, pt: 0.5 },
    margin: [1, 4, 1, 4],
    autoPage: false,
  });
}

// ── 주석 한 덩이 ─────────────────────────────────────────────────────
function note(s, x, y, w, lines, h) {
  s.addText(lines.map((t) => ({ text: t, options: { breakLine: true } })), {
    x: x, y: y, w: w, h: h || 0.44,
    fontFace: FONT, fontSize: 8.5, color: C.muted, lineSpacingMultiple: 1.18,
    isTextBox: true, margin: 0, valign: 'top',
  });
}

// ── 근거 줄 ──────────────────────────────────────────────────────────
// h 를 받는 이유: 근거가 두 줄이 되면 0.34 짜리 상자를 넘쳐 아래 글과 겹친다.
// 실제로 자료 A 3면과 자료 B 1면에서 그렇게 됐다.
function source(s, y, text, h) {
  s.addText(text, {
    x: G.L, y: y, w: G.W, h: h || 0.34,
    fontFace: FONT, fontSize: 7.5, color: C.mutedsoft, lineSpacingMultiple: 1.15,
    isTextBox: true, margin: 0, valign: 'top',
  });
}

// ── 글머리 ───────────────────────────────────────────────────────────
function bullets(s, x, y, w, h, items, fs) {
  s.addText(items.map((t) => ({
    text: t, options: { bullet: { code: '2013' }, breakLine: true },
  })), {
    x: x, y: y, w: w, h: h,
    fontFace: FONT, fontSize: fs || 10, color: C.body, lineSpacingMultiple: 1.25,
    isTextBox: true, margin: 0, valign: 'top',
  });
}

module.exports = { C, FONT, G, layout, head, sect, card, table, note, source, bullets };
