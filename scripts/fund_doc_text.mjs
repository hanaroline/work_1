/**
 * PDF 한 부에서 **쪽마다의 글**을 뽑는다.
 *
 * ★ 왜 따로 떼어 냈나 ★
 *
 * 규칙(ANCHORS)은 fund_doc_anchors.mjs 한 곳에 모아 뒀다. 표본과 전량이 규칙을
 * 두 벌로 가지면 표본에서 잰 적중률이 전량에서 안 나오기 때문이다. 그런데
 * **글 뽑는 법은 두 벌이었다.**
 *
 *   전량 판독기 — x/y 좌표로 줄을 다시 세우고, 칸 사이에 탭을 넣고, unwrap() 으로
 *                 잘린 문장을 이어 붙였다
 *   조사 도구   — 조각을 그냥 공백으로 이어 붙였다
 *
 * 공백을 하나로 줄이는 flat() 을 거쳐도 둘은 같아지지 않는다. 판독기는 한 줄 안의
 * 조각을 **붙여서** 내놓고(「제1부.모집또는매출」), 조사는 **띄워서** 내놓는다
 * (「제 1 부 . 모집 또는 매출」). 정규식이 \s* 를 넉넉히 허용해 대개는 둘 다 걸리지만,
 * 늘 그런 것은 아니다.
 *
 * 그래서 표본 조사 숫자가 전량을 예고하지 못했다. KR5212472819(브이코리아국가대표2)
 * 는 조사에서 7/7 로 멀쩡히 통과하는데 전량 지도에는 없다 — 같은 규칙, 같은 커밋인데
 * 답이 다르다. 규칙만 모아서는 부족하다. **같은 글을 봐야 같은 답이 나온다.**
 *
 * 이 파일이 그 한 곳이다. 판독기와 조사가 함께 쓴다.
 */

/**
 * 줄을 다시 세운다 — 붙여 놓은 글자 조각을 사람이 읽는 줄로 되돌린다.
 *
 * pdfjs 가 내놓는 조각은 글자 몇 개 단위라, 그냥 이으면 낱말이 붙거나 칸이 뭉개진다.
 * y 좌표가 바뀌면 줄을 끊고, x 가 크게 벌어지면 칸 사이로 보아 탭을 넣는다.
 */
function lines(tc) {
  let lastY = null, lastEnd = null, line = [];
  const out = [];
  const flush = () => { if (line.length) out.push(line.join('').replace(/[ \t]+$/, '')); line = []; };
  for (const it of tc.items) {
    const tr = it.transform || [];
    const y = tr.length ? Math.round(tr[5]) : null;
    const x = tr.length ? tr[4] : null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { flush(); lastEnd = null; }
    if (/^\s*$/.test(it.str)) {
      if (x !== null) lastEnd = x + (it.width || 0);
      if (y !== null) lastY = y;
      if (line.length) line.push((it.width || 0) > 8 ? '\t' : ' ');
      continue;
    }
    if (lastEnd !== null && x !== null && x - lastEnd > 8 && !/\t$/.test(line[line.length - 1] || '')) line.push('\t');
    line.push(it.str);
    if (x !== null) lastEnd = x + (it.width || 0);
    lastY = y;
  }
  flush();
  return out;
}

/** 쪽 너비에서 잘린 문장을 도로 잇는다 — 표(탭이 있는 줄)는 건드리지 않는다 */
function unwrap(ls) {
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    let cur = ls[i];
    while (cur.indexOf('\t') < 0 && cur.length >= 40 && /[가-힣,·]$/.test(cur) &&
      i + 1 < ls.length && ls[i + 1].indexOf('\t') < 0 &&
      !/^\s*(?:\d+\s*[.)]|[○◦□■※【(])/.test(ls[i + 1]) && ls[i + 1].trim()) {
      cur += ls[i + 1].trim(); i++;
    }
    out.push(cur);
  }
  return out;
}

/**
 * 이미 연 pdfjs 문서에서 쪽마다의 글을 뽑는다.
 *
 * @param doc pdfjs 문서 (getDocument(...).promise 의 결과)
 * @returns { pages, perPage } — perPage[i] 가 i+1 쪽의 글
 */
export async function docPages(doc) {
  const perPage = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    perPage.push(unwrap(lines(tc)).join('\n'));
  }
  return { pages: doc.numPages, perPage };
}
