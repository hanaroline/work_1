#!/usr/bin/env node
/**
 * etf.html + data/*.js -> 아티팩트에 올릴 한 조각.
 *
 *   cd <etf 브랜치 체크아웃>
 *   node <이 파일> [출력경로]
 *
 * 원본 브랜치(`claude/etf-holdings-lookup-tool-wwtz57`)의
 * `scripts/build_etf_artifact.mjs` 를 고쳐 쓴 것이다. 원본은 두 군데가
 * 어긋나 있다.
 *
 *  1. 본문을 `/<body>([\s\S]*?)<\/body>/` 로 뽑는다. 8/31 에 들어온
 *     `howtoStandalone()` 이 자바스크립트 문자열 안에 통째로 된 문서
 *     (`<body>` … `</body></html>`)를 담고 있어, 게으른 매칭이 **그
 *     문자열 안의** `</body>` 에서 멈춘다. 결과물은 마지막 <script> 가
 *     닫히지 않은 채 함수 중간에서 끊기고, 브라우저는 그 조각을 통째로
 *     버린다 — 오류 한 줄 없이 빈 화면이 된다. 여기서는 **마지막**
 *     `</body>` 까지를 본문으로 본다.
 *
 *  2. `data/etf-howto-pdf.js` 와 `data/etf-howto-shots.js` 를 `<script
 *     src=...>` 그대로 남긴다. 아티팩트는 외부·상대 경로 요청이 모두
 *     막혀 있어 사용법 탭의 그림과 PDF 단추가 조용히 사라진다. 여기서는
 *     배포용 단일 파일(build_etf_page.mjs)과 같게 인라인한다.
 *
 * 알맹이 = <title> + <style> + <body> 안쪽. 아티팩트 호스트가
 * <!doctype>·<html>·<head>·<body> 를 직접 씌우므로 그 안에 들어갈 것만
 * 넘긴다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'etf.html';
const OUT = process.argv[2] || 'etf-artifact.html';

const FONTS = "@import url('https://fonts.googleapis.com/css2?" +
              "family=Noto+Sans+KR:wght@300;400;500;700" +
              "&family=Inter:wght@400;500;600;700&display=swap');";

const html = await readFile(SRC, 'utf8');

function die(msg) {
  console.error('[artifact] ' + msg);
  process.exit(1);
}

// <title> 과 <style> 은 문서 머리에 있고 howto 문자열보다 앞선다 —
// 첫 번째 것을 집으면 된다.
const mTitle = html.match(/<title>([\s\S]*?)<\/title>/);
if (!mTitle) die(`${SRC} 에서 <title> 을 찾지 못했습니다.`);
const title = mTitle[1];

const mStyle = html.match(/<style>([\s\S]*?)<\/style>/);
if (!mStyle) die(`${SRC} 에서 <style> 을 찾지 못했습니다.`);
let style = mStyle[1];

// 본문은 첫 <body> 부터 **마지막** </body> 까지. 게으른 정규식을 쓰면
// howtoStandalone() 안의 문자열에서 끊긴다(위 주석 1번).
const bStart = html.indexOf('<body>');
const bEnd = html.lastIndexOf('</body>');
if (bStart < 0 || bEnd < 0 || bEnd < bStart) die(`${SRC} 에서 <body> 를 찾지 못했습니다.`);
let body = html.slice(bStart + '<body>'.length, bEnd);

// 데이터를 인라인한다 (배포용 단일 파일과 같은 방식).
function inline(src, label, required) {
  const tag = `<script src="${src}"></script>`;
  if (!body.includes(tag)) {
    if (required) die(`${src} 스크립트 태그를 찾지 못했습니다.`);
    return;
  }
  let js;
  try {
    js = readFileSyncish(src);
  } catch {
    body = body.replace(tag, '');
    console.log(`[artifact] ${label} 없음 — 자리를 접는다`);
    return;
  }
  body = body.replace(tag, `<script>\n/* ==== ${src} (인라인) ==== */\n${js}\n</script>`);
  console.log(`[artifact] ${label} 포함 (${(js.length / 1024).toFixed(0)} KB)`);
}

// readFile 은 비동기라 replace 안에서 쓰기 번거롭다. 미리 다 읽어 둔다.
const cache = {};
for (const f of ['data/etf.js', 'data/etf-howto-pdf.js', 'data/etf-howto-shots.js']) {
  try { cache[f] = await readFile(f, 'utf8'); } catch { /* 없으면 없는 대로 */ }
}
function readFileSyncish(f) {
  if (cache[f] === undefined) throw new Error('없음');
  return cache[f];
}

inline('data/etf.js', '종목 데이터', true);
inline('data/etf-howto-pdf.js', '사용법 PDF', false);
inline('data/etf-howto-shots.js', '화면 그림', false);

// @import 는 스타일시트 맨 앞에 있어야 브라우저가 받아들인다.
style = FONTS + '\n' + style;

// 이 페이지는 미래에셋 브랜드 화면이라 밝은 한 가지 모습으로만 간다.
// 아티팩트는 보는 사람의 테마 위에 얹히므로 바탕을 직접 칠한다.
style += '\n/* 아티팩트 전용 — 보는 사람의 테마와 무관하게 바탕을 직접 칠한다 */\n' +
         'html{background:var(--canvas); color-scheme:light;}\n';

// 내려받기 단추를 살린다.
//
// 사용법 탭의 두 단추(HTML·PDF)는 Blob 을 만들어 `<a download>` 로 떨어뜨린다.
// 사내망을 염두에 둔 옳은 방식이지만, 아티팩트 뷰어는 페이지가 스스로 시작한
// 내려받기를 전부 막는다 — 눌러도 아무 일이 없다. 뷰어가 파일을 건네받는
// 길은 `downloads` 능력 하나뿐이다.
//
// 원본 코드를 고치는 대신 여기서 감싼다. `download` 속성이 붙은 링크의
// 클릭만 가로채 같은 Blob 을 `claude.downloads.save()` 로 넘긴다. 능력이
// 없는 자리(파일로 직접 연 경우 등)에서는 원래 동작으로 되돌린다.
const SHIM = `
<script>
/* ==== 아티팩트 전용 — 내려받기 중계 ==== */
(function () {
  var blobs = new Map();
  var mkURL = URL.createObjectURL.bind(URL);
  var rmURL = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var u = mkURL(obj);
    if (obj instanceof Blob) blobs.set(u, obj);
    return u;
  };
  URL.revokeObjectURL = function (u) { blobs.delete(u); return rmURL(u); };

  var pending = null;                       // claude.use('downloads') 한 번만
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var name = this.getAttribute('download');
    var blob = name ? blobs.get(this.href) : null;
    if (!blob) return click.call(this);
    var a = this;
    if (!pending) {
      pending = (window.claude && window.claude.use)
        ? Promise.resolve(window.claude.use('downloads')).catch(function () { return null; })
        : Promise.resolve(null);
    }
    pending.then(function (d) {
      if (!d) return click.call(a);         // 아티팩트 밖 — 원래대로
      return d.save({ filename: name, data: blob }).catch(function () {});
    });
  };
})();
<\/script>
`;

const out = `<title>${title}</title>\n<style>\n${style}\n</style>\n${body}\n${SHIM}`;

// 조각이 온전한지 마지막으로 본다. <script> 와 </script> 개수가 어긋나면
// 어딘가에서 잘린 것이다 — 그대로 올리면 또 빈 화면이 된다.
const open = (out.match(/<script[\s>]/g) || []).length;
const close = (out.match(/<\/script>/g) || []).length;
if (open !== close) die(`<script> ${open}개 / </script> ${close}개 — 조각이 잘렸습니다.`);
if (/<\/body>|<\/html>|<!doctype/i.test(out.slice(-200))) die('조각 끝에 문서 닫는 태그가 남았습니다.');

await writeFile(OUT, out);
console.log(`[artifact] ${OUT} 생성 완료 (${(out.length / 1024 / 1024).toFixed(2)} MB, script ${open}쌍)`);
