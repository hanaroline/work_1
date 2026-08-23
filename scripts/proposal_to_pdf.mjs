#!/usr/bin/env node
/**
 * els-proposal.html -> els-proposal.pdf (A4 세로)
 *
 *   node scripts/proposal_to_pdf.mjs [입력.html] [출력.pdf]
 *
 * 문서의 @media print 규칙을 그대로 쓴다. 여기서 따로 하는 일은 두 가지뿐이다.
 *  1) 웹폰트를 기다린다 — 이 컨테이너는 구글 폰트에 직접 붙지 못하므로 Noto Sans KR /
 *     Inter 를 시스템에 설치해 두고 쓴다(scripts/install_fonts.sh). 없으면 중국어 폰트로
 *     한글이 그려져 자모 모양이 어긋난다.
 *  2) 쪽 번호가 든 꼬리말을 붙인다.
 */
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const { chromium } = createRequire(import.meta.url)('playwright');

const SRC = process.argv[2] || 'els-proposal.html';
const OUT = process.argv[3] || SRC.replace(/\.html$/, '.pdf');
if (!existsSync(SRC)) { console.error(`${SRC} 없음`); process.exit(1); }

// 한글 폰트가 없으면 조용히 깨진 PDF 가 나온다. 미리 막는다.
let hasKR = false;
try { hasKR = /Noto Sans KR/.test(execFileSync('fc-list', [':lang=ko', 'family'], { encoding: 'utf8' })); } catch { /* fc-list 없음 */ }
if (!hasKR) {
  console.error('한글 폰트(Noto Sans KR)가 설치돼 있지 않습니다. scripts/install_fonts.sh 를 먼저 실행하세요.');
  process.exit(1);
}

// 표지에서 회차와 청약기간을 뽑아 꼬리말에 넣는다 — 인쇄본이 돌아다녀도 어느 회차인지 남게
const html = readFileSync(SRC, 'utf8');
const title = (html.match(/<h1>([^<]+)<\/h1>/) || [])[1] || 'ELS 제안서';
const offer = (html.match(/<dt>청약기간<\/dt><dd>([^<]+)<\/dd>/) || [])[1] || '';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1120, height: 1400 } });
await p.goto('file://' + path.resolve(SRC), { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.emulateMedia({ media: 'print' });
await p.waitForTimeout(300);

const foot = (s) => `<div style="width:100%;font-family:'Noto Sans KR',sans-serif;font-size:7.5pt;color:#84888B;
  padding:0 12mm;display:flex;justify-content:space-between;">${s}</div>`;

await p.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: foot(''),
  footerTemplate: foot(
    `<span>${title}${offer ? ` · 청약 ${offer}` : ''}</span>`
    + '<span>미래에셋증권 · 투자 권유 참고자료 (원금 손실 가능)</span>'
    + '<span class="pageNumber"></span>/<span class="totalPages"></span>'),
  margin: { top: '12mm', bottom: '14mm', left: '11mm', right: '11mm' },
});
await b.close();

const pages = (readFileSync(OUT).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`${OUT} — A4 ${pages}쪽`);
