#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 관련 페이지/엔드포인트 탐색기 (1회성 조사용)
 *
 * 목적: 실제 ELS 청약 목록이 어디에서, 어떤 형태(HTML/JSON)로 내려오는지 확인한다.
 * 결과는 discovery/ 아래에 원문으로 저장하고, 요약은 stdout 으로 출력한다.
 *
 * 사용: node scripts/discover_els.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'discovery';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const SEEDS = [
  'https://securities.miraeasset.com/',
  'https://securities.miraeasset.com/robots.txt',
  'https://securities.miraeasset.com/sitemap.xml',
  'https://www.miraeassetsecurities.com/',
  // 자주 쓰이는 상품 진입 경로 후보 (존재 여부 확인용)
  'https://securities.miraeasset.com/hkc/hkc2001/p01.do',
  'https://securities.miraeasset.com/hkc/hkc2002/p01.do',
  'https://securities.miraeasset.com/bbs/maf/pdt/list.do',
  // 교차 검증용 공개 소스
  'https://dis.kofia.or.kr/',
  'https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/derivatives/BIP_CNTS10022V.xml',
];

// 링크 추적 시 ELS 관련으로 판단할 키워드
const KEYWORD = /(els|elb|dls|파생결합|주가연계|청약|structured|derivative|상품몰|금융상품)/i;

const results = [];

function slug(u) {
  return u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

async function grab(url, { depth = 0 } = {}) {
  const started = Date.now();
  let rec = { url, depth, ok: false };
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/json,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    const body = await res.text();
    rec = {
      url,
      depth,
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get('content-type') || '',
      bytes: body.length,
      ms: Date.now() - started,
      title: (body.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i) || [, ''])[1].trim(),
      body,
    };
  } catch (e) {
    rec.error = String(e && e.message ? e.message : e);
    rec.ms = Date.now() - started;
  }
  results.push(rec);
  return rec;
}

function extractLinks(rec) {
  if (!rec.body) return [];
  const base = new URL(rec.finalUrl || rec.url);
  const out = new Set();
  const re = /(?:href|src|data-url|action)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(rec.body))) {
    const raw = m[1];
    if (/^(javascript:|mailto:|tel:|#)/i.test(raw)) continue;
    let abs;
    try {
      abs = new URL(raw, base).toString();
    } catch {
      continue;
    }
    if (!/^https?:/i.test(abs)) continue;
    if (!/miraeasset/i.test(abs)) continue;
    if (/\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|css)(\?|$)/i.test(abs)) continue;
    if (KEYWORD.test(decodeURIComponent(abs))) out.add(abs.split('#')[0]);
  }
  return [...out];
}

// JS 번들/인라인 스크립트에서 API 처럼 보이는 경로 뽑기
function extractApiHints(rec) {
  if (!rec.body) return [];
  const out = new Set();
  const re = /["'](\/[a-zA-Z0-9._\-/]*(?:api|json|ajax|list|search|inqire|Inqire)[a-zA-Z0-9._\-/]*)["']/g;
  let m;
  while ((m = re.exec(rec.body))) out.add(m[1]);
  return [...out].slice(0, 60);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // 1) 시드 수집
  for (const u of SEEDS) await grab(u, { depth: 0 });

  // 2) 시드에서 발견한 ELS 관련 링크 1단계 추적
  const seen = new Set(SEEDS);
  const next = [];
  for (const rec of [...results]) {
    for (const l of extractLinks(rec)) {
      if (seen.has(l)) continue;
      seen.add(l);
      next.push(l);
    }
  }
  for (const u of next.slice(0, 40)) await grab(u, { depth: 1 });

  // 3) 원문 저장 + 요약 출력
  const summary = [];
  for (const r of results) {
    if (r.body) {
      const ext = /json/i.test(r.contentType) ? 'json' : /xml/i.test(r.contentType) ? 'xml' : 'html';
      await writeFile(join(OUT, `${slug(r.url)}.${ext}`), r.body);
    }
    summary.push({
      url: r.url,
      finalUrl: r.finalUrl,
      status: r.status ?? null,
      error: r.error ?? null,
      contentType: r.contentType,
      bytes: r.bytes ?? 0,
      title: r.title,
      elsHits: r.body ? (r.body.match(/ELS/g) || []).length : 0,
      apiHints: extractApiHints(r),
    });
  }
  await writeFile(join(OUT, '_summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n===== DISCOVERY SUMMARY =====');
  for (const s of summary) {
    console.log(
      `\n[${s.status ?? 'ERR'}] ${s.url}` +
        (s.error ? `\n      error: ${s.error}` : '') +
        (s.finalUrl && s.finalUrl !== s.url ? `\n      -> ${s.finalUrl}` : '') +
        `\n      type=${s.contentType} bytes=${s.bytes} elsHits=${s.elsHits}` +
        `\n      title=${s.title}`
    );
    if (s.apiHints.length) console.log(`      apiHints: ${s.apiHints.slice(0, 25).join(', ')}`);
  }
  console.log('\n===== END =====');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
