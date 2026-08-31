#!/usr/bin/env node
/**
 * 화면마다 한 장씩 찍어 사용법에 넣을 그림을 만든다.
 *
 *   node scripts/shoot_etf_screens.mjs
 *   -> data/etf-howto-shots.js  (window.ETF_HOWTO_SHOTS = { browse: 'data:image/...', ... })
 *
 * 글로만 쓴 사용법은 "어디를 누르라는 건지" 가 안 보인다. 그래서 실제 화면을
 * 찍어 넣는다. 손으로 그리지 않고 **도구를 열어 실제로 눌러 가며** 찍으므로
 * 화면이 바뀌면 그림도 같이 바뀐다.
 *
 * 파일 하나에 담아야 하므로 크기가 문제다. 그래서
 *   - 1배로 찍고(2배로 찍으면 네 배가 된다)
 *   - 화면 전체가 아니라 **말하려는 부분만** 잘라 낸다
 *   - 넓이를 900px 로 맞춘다
 * 그러고도 큰 장은 경고를 남긴다.
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const SHOT_WIDTH = 900;
const WARN_KB = 140;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (q, r) => {
  try {
    const p = normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const b = await readFile(join(process.cwd(), p));
    r.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
    r.end(b);
  } catch { r.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, r));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1180, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://127.0.0.1:${server.address().port}/etf-holdings-search.html`,
  { waitUntil: 'networkidle' });

/** 잘라 낼 조각을 한 덩어리로 감싼다 — 여러 요소를 한 장에 담기 위해서다. */
async function clipOf(selectors) {
  return page.evaluate((sels) => {
    let box = null;
    // querySelector 는 첫 하나만 잡는다. 편입종목 열 줄을 찍으려는데 한 줄만
    // 나왔던 것이 이 탓이다. 맞는 것을 모두 모아 감싼다.
    // 숨은 탭에도 같은 클래스가 있으므로, 지금 보이는 탭 안에서만 찾는다.
    // 탭이 아닌 .section 이 하나 섞여 있어(id 없음) 그게 먼저 잡혔다.
    // 탭 섹션만 본다.
    const scope = [...document.querySelectorAll('.section[id^="tab-"]')]
      .find((x) => !x.hidden) || document;
    const nodes = [];
    for (const s of sels) nodes.push(...scope.querySelectorAll(s));
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      // 숨은 요소(display:none)는 사각형이 전부 0 이다. 그대로 합치면 상자가
      // 페이지 꼭대기까지 끌려간다 — 찾기 화면을 찍었더니 머리말과 탭 줄이
      // 나온 것이 이 탓이었다. 다른 탭에도 같은 클래스가 있어서 걸렸다.
      if (r.width < 1 || r.height < 1) continue;
      const b = { x: r.left + scrollX, y: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
      box = box ? { x: Math.min(box.x, b.x), y: Math.min(box.y, b.y),
                    r: Math.max(box.r, b.r), b: Math.max(box.b, b.b) } : b;
    }
    if (!box) return null;
    const pad = 10;
    return { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
             width: box.r - box.x + pad * 2, height: box.b - box.y + pad * 2 };
  }, selectors);
}

const shots = {};
async function shoot(key, selectors, maxH) {
  const clip = await clipOf(selectors);
  if (!clip) { console.log(`  ${key} — 대상을 못 찾음, 건너뜀`); return; }
  if (maxH && clip.height > maxH) clip.height = maxH;
  // clip 은 뷰포트 안에서만 잘린다. 화면 아래쪽(상세·표)은 스크롤 밖이라
  // fullPage 로 찍어야 잡힌다.
  const buf = await page.screenshot({ clip, type: 'png', fullPage: true });
  shots[key] = 'data:image/png;base64,' + buf.toString('base64');
  const kb = buf.length / 1024;
  console.log(`  ${key} · ${Math.round(clip.width)}×${Math.round(clip.height)} · ${kb.toFixed(0)}KB` +
              (kb > WARN_KB ? '  ← 크다' : ''));
}

console.log('[shots] 찍는 중');

// 1) 찾기 — 검색창 + 필터 + 목록 몇 줄
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(300);
await shoot('browse', ['.finder-search', '.finder-filters', '.finder-bar', '#list-table'], 640);

// 2) 상세 — 행을 눌러 펼친 모습
await page.locator('#list-body tr[data-id]').first().click();
await page.waitForTimeout(400);
await shoot('detail', ['#detail .kv'], 260);
await shoot('holdings', ['#detail .hold-row'], 460);
await shoot('rettable', ['#detail .ret-table'], 480);

// 3) 비교 — 여덟 개 담아서
for (let i = 0; i < 4; i += 1) {
  await page.locator('#list-body button[data-pick]').nth(i).click().catch(() => {});
}
await page.locator('.tabs button[data-tab="compare"]').click();
await page.waitForTimeout(500);
await shoot('compare', ['#compare-body .card', '#compare-body table'], 460);
await shoot('matrix', ['#compare-body .matrix'], 460);

// 4) 역조회
await page.locator('.tabs button[data-tab="reverse"]').click();
await page.waitForTimeout(200);
await page.locator('#rq').fill('삼성전자');
await page.waitForTimeout(500);
await shoot('reverse', ['.finder-search', '#reverse-body'], 460);

// 5) 랭킹
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(500);
await shoot('rank', ['#rank-body .grid'], 520);

await browser.close();
server.close();

if (!Object.keys(shots).length) { console.error('[shots] 한 장도 못 찍었다.'); process.exit(1); }

const js = '/* scripts/shoot_etf_screens.mjs 가 만든다. 손으로 고치지 말 것. */\n' +
  'window.ETF_HOWTO_SHOTS = ' + JSON.stringify(shots) + ';\n';
await writeFile('data/etf-howto-shots.js', js);
console.log(`[shots] data/etf-howto-shots.js · ${Object.keys(shots).length}장 · ` +
            `${(js.length / 1024).toFixed(0)}KB`);
