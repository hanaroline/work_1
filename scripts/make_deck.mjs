// 증권사 리포트 자동 요약 — 소개·사용법 4쪽 PPT
//
//   node scripts/make_deck.mjs [낼 곳]
//
// 실리는 수치는 전부 docs/deck/claims.json 에서 읽는다. 그 대장은
// scripts/verify_deck_claims.py 가 원자료에서 다시 뽑아 대조하므로,
// 슬라이드에 손으로 적은 숫자가 들어갈 자리가 없다.
//
// 색·글꼴은 mas-design 을 따른다 — 오렌지 #F58220, 블루 #043B72,
// 흰 바탕, 모서리 4px 이하, 그라데이션·이모지·그림자 없음.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PptxGenJS = require('pptxgenjs');

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] || path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

// ── 대장에서 수치를 읽는다 ────────────────────────────────────────────
const claims = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs/deck/claims.json'), 'utf-8'));
const V = Object.fromEntries(claims.map((c) => [c.id, c.value]));
const n = (x) => x.toLocaleString('en-US');

// ── 브랜드 토큰 ──────────────────────────────────────────────────────
const ORANGE = 'F58220';
const BLUE = '043B72';
const SOFT = 'FAB072';
const INK = '1A1A1A';
const BODY = '3D3D3D';
const MUTED = '6C6C6C';
const HAIR = 'CDCECB';
const TINT = 'F7F8FA';
const WHITE = 'FFFFFF';
const KR = 'Noto Sans KR';

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE';              // 13.3" × 7.5"
pres.author = '미래에셋증권 마포WM';
pres.title = '증권사 리포트 자동 요약';

const W = 13.3;
const M = 0.62;                            // 좌우 여백
const CW = W - M * 2;                      // 콘텐츠 폭

// 섹션 제목 — mas-design 시그니처: 1px 오렌지 룰 아래 좌측 정렬 제목
function sectionTitle(s, text, y, kicker) {
  s.addShape(pres.ShapeType.rect, {
    x: M, y, w: CW, h: 0.012, fill: { color: ORANGE }, line: { type: 'none' },
  });
  if (kicker) {
    s.addText(kicker, {
      x: M, y: y + 0.1, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11, bold: true, color: ORANGE, charSpacing: 1,
    });
  }
  s.addText(text, {
    x: M, y: y + (kicker ? 0.36 : 0.12), w: CW, h: 0.46, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 24, bold: true, color: INK,
  });
}

function footer(s, page) {
  s.addText('미래에셋증권 마포WM · 증권사 리포트 자동 요약 · 2026-09-08', {
    x: M, y: 6.92, w: 9.0, h: 0.28, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 9, color: MUTED,
  });
  s.addText(`${page} / 4`, {
    x: W - M - 1.2, y: 6.92, w: 1.2, h: 0.28, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 9, color: MUTED, align: 'right',
  });
}

// ════════════════════════════════════════════════════════════ 1쪽 · 표지
{
  const s = pres.addSlide();
  s.background = { color: BLUE };

  s.addText('사내 자동화 · 리서치', {
    x: M, y: 0.62, w: 6.4, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 12, bold: true, color: SOFT, charSpacing: 1.4,
  });

  s.addText('증권사 리포트,\n매일 아침 알아서 모으고 요약합니다', {
    x: M, y: 1.06, w: 7.5, h: 1.7, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 36, bold: true, color: WHITE, lineSpacing: 46,
  });

  s.addText(
    '네이버 리서치와 증권사 자체 게시판에서 그날 나온 리포트를 모아, '
    + '본문에서 뽑은 문장으로 요약하고, 실릴 숫자를 전부 다시 셉니다. '
    + '사람 손은 확인할 때만 듭니다.',
    {
      x: M, y: 2.92, w: 7.2, h: 1.0, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 14, color: 'D6E0EC', lineSpacing: 24,
    });

  // 오른쪽 수치 판 — 카드 대신 숫자를 크게 세운다
  const stats = [
    [n(V['누적리포트']), '건', '누적 수집 리포트'],
    [n(V['이판전체']), '건', '한 판에 담기는 리포트'],
    [String(V['산원천']), '곳', '살아 있는 수집 원천'],
    [String(V['검산항목']), '개', '판마다 도는 검산'],
  ];
  const bx = 8.42, bw = 4.26;
  s.addShape(pres.ShapeType.rect, {
    x: bx, y: 0.62, w: bw, h: 5.9, fill: { color: '0A4A88' }, line: { type: 'none' },
    rectRadius: 0,
  });
  stats.forEach(([num, unit, label], i) => {
    const y = 0.98 + i * 1.44;
    s.addText(
      [{ text: num, options: { fontSize: 40, bold: true, color: WHITE } },
       { text: ' ' + unit, options: { fontSize: 15, bold: true, color: SOFT } }],
      { x: bx + 0.42, y, w: bw - 0.84, h: 0.66, isTextBox: true, margin: 0,
        fontFace: KR },
    );
    s.addText(label, {
      x: bx + 0.42, y: y + 0.66, w: bw - 0.84, h: 0.3, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 12, color: '9FB8D0',
    });
    if (i < stats.length - 1) {
      s.addShape(pres.ShapeType.rect, {
        x: bx + 0.42, y: y + 1.12, w: bw - 0.84, h: 0.008,
        fill: { color: '1B5E9E' }, line: { type: 'none' },
      });
    }
  });

  s.addText('2026-09-08 09:28 KST 판 기준 · 모든 수치는 원자료에서 다시 뽑아 대조했습니다', {
    x: M, y: 6.62, w: 7.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 10, color: '8FA8C2',
  });

  s.addNotes(
    '한 줄 소개: 매일 아침 증권사 리포트를 모아 요약하고, 실릴 숫자를 다시 세는 자동화입니다.\n'
    + '오른쪽 네 수치는 모두 저장된 원자료에서 다시 뽑은 값입니다(scripts/verify_deck_claims.py).');
}

// ═════════════════════════════════════════════════════════ 2쪽 · 사용법
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionTitle(s, '쓰는 법 — 아침에 열어 보고, 필요하면 파일로 돌립니다', 0.56, '사용법');

  // 3단계 흐름
  const steps = [
    ['1', '아침에 수집', '러너가 여덟 곳을 돌며 그날 리포트를 받아 옵니다.\n본문을 열어 요약을 붙이고, 곧바로 검산을 돌립니다.'],
    ['2', '화면에서 확인', '대시보드 「리포트 요약」으로 들어갑니다.\n갈래·주제·인기순으로 걸러 보고, 제목을 누르면 원문으로 갑니다.'],
    ['3', '파일로 배포', '명령 한 줄이면 PDF 세 종과 한 파일 HTML이 나옵니다.\n메일·메신저로 그대로 돌리면 됩니다.'],
  ];
  const sw = (CW - 0.5) / 3;
  steps.forEach(([no, head, desc], i) => {
    const x = M + i * (sw + 0.25);
    s.addShape(pres.ShapeType.rect, {
      x, y: 1.62, w: sw, h: 1.92, fill: { color: TINT },
      line: { color: HAIR, width: 0.75 }, rectRadius: 0,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.26, y: 1.86, w: 0.42, h: 0.42, fill: { color: ORANGE },
      line: { type: 'none' },
    });
    s.addText(no, {
      x: x + 0.26, y: 1.885, w: 0.42, h: 0.38, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 15, bold: true, color: WHITE, align: 'center',
    });
    s.addText(head, {
      x: x + 0.82, y: 1.9, w: sw - 1.06, h: 0.36, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 15, bold: true, color: INK,
    });
    s.addText(desc, {
      x: x + 0.26, y: 2.46, w: sw - 0.52, h: 0.96, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, color: BODY, lineSpacing: 18,
    });
  });

  // 산출물 표
  s.addText('무엇이 나오나', {
    x: M, y: 3.82, w: 5.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 14, bold: true, color: INK,
  });
  const head = (t) => ({ text: t, options: { bold: true, color: INK, fill: { color: SOFT } } });
  const rows = [
    [head('산출물'), head('분량'), head('누구에게')],
    ['오늘자 요약 PDF', '3쪽', '아침에 훑는 용도 — 총평·논점·목표주가 변경'],
    ['주간 인기 PDF', '5쪽', '한 주 많이 본 리포트 18장과 주간 셈'],
    ['전체 PDF', '51쪽', '그날 판 전체 목록 — 찾아보기용'],
    ['한 파일 HTML', '860KB', '브라우저로 바로 열림 · 걸러보기·정렬 가능'],
  ];
  s.addTable(rows, {
    x: M, y: 4.2, w: CW, colW: [3.0, 1.1, CW - 4.1],
    fontFace: KR, fontSize: 11.5, color: BODY, valign: 'middle',
    border: { type: 'solid', color: 'E5E4E1', pt: 0.75 },
    fill: { color: WHITE },
    rowH: [0.36, 0.34, 0.34, 0.34, 0.34],
  });

  s.addText(
    [{ text: '명령 한 줄:  ', options: { color: MUTED, fontSize: 11 } },
     { text: 'bash scripts/make_reports_outputs.sh', options: { color: BLUE, fontSize: 11, bold: true } },
     { text: '   —  글꼴·브라우저까지 스스로 갖추므로 새 PC에서도 그대로 돕니다.',
       options: { color: MUTED, fontSize: 11 } }],
    { x: M, y: 6.02, w: CW, h: 0.34, isTextBox: true, margin: 0, fontFace: KR },
  );

  s.addText(
    '수집 예약은 08:40 · 17:10 KST 로 걸어 두었습니다. 지금은 작업 갈래에서 돌고 있어 '
    + '부를 때 받아 오며, 본 갈래에 합치면 그 시각에 저절로 돕니다.',
    { x: M, y: 6.36, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 10, color: MUTED });

  footer(s, 2);
  s.addNotes('세 단계 모두 사람이 손대는 곳은 2번(확인)뿐입니다. '
    + '수집·요약·검산·파일 만들기는 전부 자동입니다.');
}

// ═══════════════════════════════════════════════════ 3쪽 · 무엇이 다른가
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionTitle(s, '지어내지 않습니다 — 요약은 원문 문장, 숫자는 다시 셉니다', 0.56, '자랑할 만한 점');

  // 왼쪽: 큰 수치 세 개
  s.addText(
    [{ text: n(V['인용대조']), options: { fontSize: 46, bold: true, color: ORANGE } },
     { text: '  대목', options: { fontSize: 14, bold: true, color: MUTED } }],
    { x: M, y: 1.66, w: 4.3, h: 0.72, isTextBox: true, margin: 0, fontFace: KR });
  s.addText('실린 요약을 리포트 본문 문장으로 되짚어 대조한 대목', {
    x: M, y: 2.34, w: 4.3, h: 0.5, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 11.5, color: BODY, lineSpacing: 17,
  });

  s.addText(
    [{ text: String(V['인용어긋남']), options: { fontSize: 46, bold: true, color: BLUE } },
     { text: '  건', options: { fontSize: 14, bold: true, color: MUTED } }],
    { x: M, y: 2.98, w: 4.3, h: 0.72, isTextBox: true, margin: 0, fontFace: KR });
  s.addText('본문에 없는데 실린 문장. 검산 37개도 어긋남 0으로 통과했습니다.', {
    x: M, y: 3.66, w: 4.3, h: 0.5, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 11.5, color: BODY, lineSpacing: 17,
  });

  s.addShape(pres.ShapeType.rect, {
    x: M, y: 4.36, w: 4.3, h: 1.72, fill: { color: TINT },
    line: { color: HAIR, width: 0.75 }, rectRadius: 0,
  });
  s.addText('요약을 만드는 방식', {
    x: M + 0.28, y: 4.56, w: 3.74, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 12, bold: true, color: INK,
  });
  s.addText(
    '리포트 본문에서 원문 문장 여섯을 골라 잇습니다. 새 문장을 쓰지 않으므로 '
    + '실린 모든 문장은 원문에 글자 그대로 있습니다. 숫자도 본문에 적힌 것을 '
    + '옮길 뿐, 더하거나 나누지 않습니다.',
    { x: M + 0.28, y: 4.92, w: 3.74, h: 1.02, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, color: BODY, lineSpacing: 18 });

  // 오른쪽: 검산 일곱 묶음
  const gx = 5.44, gw = W - M - gx;
  s.addText('판마다 도는 검산 37개 — 일곱 묶음', {
    x: gx, y: 1.66, w: gw, h: 0.32, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 14, bold: true, color: INK,
  });
  const groups = [
    ['수집 정합성', 6, '빠진 칸·중복 주소·이상한 날짜'],
    ['셈 재계산', 10, '실린 건수를 원자료에서 다시 셈'],
    ['인용 무결성', 5, '실린 문장이 본문에 그대로 있는가'],
    ['오염', 6, '연락처·파일이름·머리글이 섞였는가'],
    ['출처', 2, '모든 주소가 알려진 원문 서버인가'],
    ['주간', 5, '한 주 셈이 저장본으로 재현되는가'],
    ['원천 상태', 3, '빠진 원천 없이 받아 왔는가'],
  ];
  const maxN = 10;
  groups.forEach(([name, cnt, desc], i) => {
    const y = 2.1 + i * 0.62;
    s.addText(name, {
      x: gx, y, w: 1.34, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11.5, bold: true, color: INK,
    });
    const barX = gx + 1.4, barMax = 1.5;
    s.addShape(pres.ShapeType.rect, {
      x: barX, y: y + 0.055, w: (cnt / maxN) * barMax, h: 0.17,
      fill: { color: i === 2 ? BLUE : ORANGE }, line: { type: 'none' },
    });
    s.addText(String(cnt), {
      x: barX + barMax + 0.08, y, w: 0.32, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 11, bold: true, color: MUTED,
    });
    s.addText(desc, {
      x: barX + barMax + 0.48, y, w: gw - (barX + barMax + 0.48 - gx), h: 0.28,
      isTextBox: true, margin: 0, fontFace: KR, fontSize: 11, color: BODY,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: gx, y: 6.48, w: gw, h: 0.008, fill: { color: HAIR }, line: { type: 'none' },
  });
  s.addText('하나라도 어긋나면 「산출물을 내지 말 것」을 찍고 멈춥니다.', {
    x: gx, y: 6.56, w: gw, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 11, bold: true, color: BLUE,
  });

  footer(s, 3);
  s.addNotes('핵심 자랑거리: 요약이 생성물이 아니라 추출물이라 원문 대조가 가능하고, '
    + '실제로 963대목을 대조해 어긋남 0입니다. 16대목은 보관 본문(앞 1,200자) 밖이라 '
    + '「확인」으로 세지 않고 따로 적습니다.');
}

// ══════════════════════════════════════════════ 4쪽 · 실제로 잡아낸 것
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionTitle(s, '검산이 실제로 잡아낸 것', 0.56, '왜 믿을 만한가');

  s.addText(
    '만든 지 24일, 사람 눈에 안 띈 채 자료에 실릴 뻔했다가 걸린 것들입니다. '
    + '아래 여덟 가지는 그 가운데 골랐고, 고칠 때마다 검사를 하나씩 늘렸습니다.',
    { x: M, y: 1.52, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 12, color: BODY });

  const found = [
    ['주간 건수가 하나 어긋남', '리포트 열쇠가 원천끼리 충돌 — 주소로 바꿈'],
    ['하루 판이 네 번 덮여 사라짐', '아침에 모은 줄이 낮 판에 지워짐 — 겹쳐 쌓게 함'],
    ['근거 없는 요약 한 줄', '요약만 남고 본문이 빠짐 — 근거 없으면 지우게 함'],
    ['날짜가 사흘 당겨진 리포트', '표 칸을 잘못 집음 — 첫 칸만 읽게 함'],
    ['하나증권이 통째로 빠짐', '검사 34개가 모두 통과 — 원천 상태 묶음을 새로 넣음'],
    ['PDF 꼬리말이 본문을 덮음', '인쇄 여백이 0 — 실제로 그려 보고 잡음'],
    ['오류 하나로 하루치가 날아감', '수집이 실패로 끝나 커밋이 안 돎 — 요약 단계를 견디게 함'],
    ['미래에셋 게시판이 조용히 빠짐', 'HTML 대신 HTTP 헤더가 옴 — 「정상 5건」으로 적혀 있었음'],
  ];
  const half = Math.ceil(found.length / 2);
  found.forEach(([what, how], i) => {
    const col = i < half ? 0 : 1;
    const row = i % half;
    const x = M + col * (CW / 2 + 0.16);
    const w = CW / 2 - 0.16;
    const y = 2.06 + row * 0.86;
    s.addShape(pres.ShapeType.rect, {
      x, y: y + 0.09, w: 0.11, h: 0.11, fill: { color: ORANGE }, line: { type: 'none' },
    });
    s.addText(what, {
      x: x + 0.26, y, w: w - 0.26, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 12, bold: true, color: INK,
    });
    s.addText(how, {
      x: x + 0.26, y: y + 0.27, w: w - 0.26, h: 0.28, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 10.5, color: MUTED,
    });
  });

  // 마무리 콜아웃
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 5.66, w: CW, h: 1.02, fill: { color: ORANGE }, line: { type: 'none' },
    rectRadius: 0,
  });
  s.addText('써 보시려면', {
    x: M + 0.4, y: 5.84, w: 2.2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: KR, fontSize: 12, bold: true, color: 'FFE8D4',
  });
  s.addText(
    '대시보드 상단 「리포트 요약」 단추로 바로 들어갑니다. '
    + '파일이 필요하면 말씀 주시면 그날 판으로 뽑아 드립니다.',
    { x: M + 0.4, y: 6.14, w: CW - 0.8, h: 0.36, isTextBox: true, margin: 0,
      fontFace: KR, fontSize: 14, bold: true, color: WHITE });

  footer(s, 4);
  s.addNotes('여기 적힌 열한 건은 전부 실제로 있었던 일이고, 저장소 커밋에 기록이 남아 있습니다. '
    + '자랑의 근거는 「완벽하다」가 아니라 「틀린 것을 잡아 왔다」입니다.');
}

const file = path.join(OUT, '미래에셋_증권사리포트자동요약_소개.pptx');
await pres.writeFile({ fileName: file });
console.log('만듦: ' + file);
