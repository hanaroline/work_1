#!/usr/bin/env node
/**
 * 공시 원문(일괄신고추가서류)에서 회차별 조건과 발행사 '수익률 모의실험' 표를 뽑는다.
 *
 * 페이지의 과거 시뮬레이션은 우리가 종가로 계산한 값이라 발행사 수치와 다르다.
 * 설명서에는 2003년부터의 롤링 백테스트와 이론가 산출에 쓴 변동성·상관계수가 들어 있어,
 * 그대로 옮겨오면 세일즈 자료로 방어 가능한 숫자가 된다.
 *
 * 개발 컨테이너에서는 KIND·DART 가 egress 차단이라 러너에서만 돈다.
 */
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36';
const OUT_DIR = 'tools/discovery';

const get = async (url, label) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
  const buf = Buffer.from(await r.arrayBuffer());
  console.log(`${label}: HTTP ${r.status} ${buf.length}B ${r.headers.get('content-type') || ''}`);
  if (!r.ok) throw new Error(`${label} HTTP ${r.status}`);
  return buf;
};

/** 공시 HTML 은 EUC-KR 인 경우가 있다. meta charset 을 보고 디코딩한다. */
const decode = (buf) => {
  const probe = buf.subarray(0, 2000).toString('latin1').toLowerCase();
  const enc = /euc-kr|ks_c_5601/.test(probe) ? 'euc-kr' : 'utf-8';
  return new TextDecoder(enc).decode(buf);
};

const toText = (html) => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/(p|div|tr|table|h\d)>/gi, '\n')
  .replace(/<t[dh][^>]*>/gi, '\t')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

// 1) 이미 주소를 아는 공시부터. 6월 발행분(제37821~37839회) 일괄신고추가서류.
const KNOWN = 'https://kind.krx.co.kr/external/2026/06/05/000396/20260605001024/10131.htm';

const html = decode(await get(KNOWN, '일괄신고추가서류(2026-06-05)'));
const text = toText(html);
await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/prospectus_raw.txt`, text);

console.log(`\n텍스트 ${text.length}자`);

const series = [...new Set(text.match(/제\s?3[78]\d{3}\s?회/g) || [])].sort();
console.log(`회차 표기 ${series.length}종: ${series.slice(0, 40).join(' ')}`);

const show = (needle, span = 700, max = 2) => {
  console.log(`\n===== "${needle}" =====`);
  let from = 0, hit = 0;
  while (hit < max) {
    const i = text.indexOf(needle, from);
    if (i < 0) break;
    console.log(text.slice(Math.max(0, i - 120), i + span).replace(/\n{2,}/g, '\n'));
    console.log('-----');
    from = i + needle.length; hit++;
  }
  if (!hit) console.log('(없음)');
};

for (const k of ['모의실험', '조기상환', '변동성', '상관계수', '공정가액', '낙인', '기초자산']) show(k);
