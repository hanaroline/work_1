#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 관련 페이지/엔드포인트 탐색기 (조사용)
 *
 * v2 변경점
 *  - EUC-KR 응답을 TextDecoder 로 올바르게 디코딩 (v1 은 UTF-8 강제라 한글 키워드가 전부 미스)
 *  - 1홉은 키워드 무관하게 전부 따라가고, 2홉부터 키워드 필터 (홈이 JS 셸이라 링크가 얕음)
 *  - 404 페이지에 사이트 전체 네비게이션이 들어있어 이를 사이트맵 대용으로 활용
 *  - 정적 HTML 로 안 잡히면 Playwright 로 렌더 후 재시도 (RENDER=1)
 *
 * 사용: node scripts/discover_els.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'discovery';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const HOSTS = /(securities\.miraeasset\.com|m\.securities\.miraeasset\.com)/i;

const SEEDS = [
  'https://securities.miraeasset.com/',
  'https://m.securities.miraeasset.com/',
  // 404 페이지에 전체 GNB 가 들어있다 (1차 탐색에서 28KB 확인) — 사이트맵 대용
  'https://securities.miraeasset.com/bbs/maf/pdt/list.do',
  'https://securities.miraeasset.com/sitemap.do',
  'https://securities.miraeasset.com/main/sitemap.do',
];

// 2홉 이후 따라갈 링크 판단 (URL 문자열 + 링크 텍스트 양쪽에서 확인)
const KEYWORD = /(els|elb|dls|dlb|파생결합|주가연계|청약|구조화|금융상품|상품몰|product|pdt)/i;

const results = [];
const seen = new Set();

function slug(u) {
  return u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

/** Content-Type / meta charset 을 보고 올바르게 디코딩 */
function decode(buf, contentType) {
  const head = new TextDecoder('latin1').decode(buf.slice(0, 2048));
  let cs = (contentType.match(/charset=([\w-]+)/i) || [])[1];
  if (!cs) cs = (head.match(/charset\s*=\s*["']?([\w-]+)/i) || [])[1];
  cs = (cs || 'utf-8').toLowerCase();
  if (cs === 'ks_c_5601-1987' || cs === 'ksc5601' || cs === 'cp949') cs = 'euc-kr';
  try {
    return new TextDecoder(cs).decode(buf);
  } catch {
    return new TextDecoder('utf-8').decode(buf);
  }
}

async function grab(url, depth) {
  if (seen.has(url)) return null;
  seen.add(url);
  const started = Date.now();
  const rec = { url, depth, ok: false };
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/json,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        Referer: 'https://securities.miraeasset.com/',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    const contentType = res.headers.get('content-type') || '';
    const body = decode(Buffer.from(await res.arrayBuffer()), contentType);
    Object.assign(rec, {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      contentType,
      bytes: body.length,
      ms: Date.now() - started,
      title: (body.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i) || [, ''])[1].trim(),
      body,
    });
  } catch (e) {
    rec.error = String(e?.message ?? e);
    rec.ms = Date.now() - started;
  }
  results.push(rec);
  return rec;
}

/** <a href> 를 링크 텍스트와 함께 뽑는다 */
function anchors(rec) {
  if (!rec?.body) return [];
  const base = new URL(rec.finalUrl || rec.url);
  const out = [];
  const re = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi;
  let m;
  while ((m = re.exec(rec.body))) {
    const raw = m[1];
    const text = m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (/^(javascript:|mailto:|tel:|#)/i.test(raw)) continue;
    let abs;
    try {
      abs = new URL(raw, base).toString().split('#')[0];
    } catch {
      continue;
    }
    if (!/^https?:/i.test(abs) || !HOSTS.test(abs)) continue;
    if (/\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|css|js)(\?|$)/i.test(abs)) continue;
    out.push({ url: abs, text });
  }
  return out;
}

/** JS 안에 하드코딩된 API/화면 경로 힌트 */
function apiHints(rec) {
  if (!rec?.body) return [];
  const out = new Set();
  const re = /["'](\/[a-zA-Z0-9._\-/]*(?:api|json|ajax|list|search|inqire|Inqire|Lst|lst)[a-zA-Z0-9._\-/]*)["']/g;
  let m;
  while ((m = re.exec(rec.body))) out.add(m[1]);
  return [...out].slice(0, 80);
}

/** 본문에 ELS 상품 같은 문자열이 실제로 들어있는지 */
function elsEvidence(rec) {
  if (!rec?.body) return null;
  const b = rec.body;
  const hits = {
    ELS: (b.match(/ELS/g) || []).length,
    파생결합: (b.match(/파생결합/g) || []).length,
    청약: (b.match(/청약/g) || []).length,
    조기상환: (b.match(/조기상환/g) || []).length,
    기초자산: (b.match(/기초자산/g) || []).length,
    낙인: (b.match(/낙인|녹인|Knock-?In/gi) || []).length,
  };
  const total = Object.values(hits).reduce((a, c) => a + c, 0);
  if (!total) return null;
  // 근처 텍스트 샘플 (파서 작성용)
  const idx = b.search(/(제\s*\d{3,6}\s*회|ELS|파생결합)/);
  const sample = idx >= 0 ? b.slice(Math.max(0, idx - 300), idx + 900).replace(/\s+/g, ' ') : '';
  return { hits, total, sample };
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // depth 0
  for (const u of SEEDS) await grab(u, 0);

  // depth 1 — 키워드 무관, 같은 호스트 전부
  const hop1 = [];
  for (const r of [...results]) for (const a of anchors(r)) hop1.push(a);
  const hop1Urls = [...new Set(hop1.map((a) => a.url))].slice(0, 60);
  for (const u of hop1Urls) await grab(u, 1);

  // depth 2 — 키워드가 걸린 것만
  const hop2 = [];
  for (const r of results.filter((r) => r.depth === 1)) {
    for (const a of anchors(r)) {
      if (KEYWORD.test(decodeURIComponent(a.url)) || KEYWORD.test(a.text)) hop2.push(a.url);
    }
  }
  for (const u of [...new Set(hop2)].slice(0, 60)) await grab(u, 2);

  // 저장 + 요약
  const summary = [];
  for (const r of results) {
    if (r.body) {
      const ext = /json/i.test(r.contentType) ? 'json' : /xml/i.test(r.contentType) ? 'xml' : 'html';
      await writeFile(join(OUT, `${slug(r.url)}.${ext}`), r.body);
    }
    summary.push({
      url: r.url,
      depth: r.depth,
      finalUrl: r.finalUrl,
      status: r.status ?? null,
      error: r.error ?? null,
      contentType: r.contentType,
      bytes: r.bytes ?? 0,
      title: r.title,
      evidence: elsEvidence(r),
      apiHints: apiHints(r),
    });
  }
  await writeFile(join(OUT, '_summary.json'), JSON.stringify(summary, null, 2));

  // 링크 지도도 따로 남긴다 (사이트 구조 파악용)
  const linkMap = results
    .filter((r) => r.body)
    .map((r) => ({ from: r.url, links: anchors(r).slice(0, 120) }));
  await writeFile(join(OUT, '_links.json'), JSON.stringify(linkMap, null, 2));

  console.log('\n===== 1) 접근 결과 =====');
  for (const s of summary) {
    console.log(
      `[${s.status ?? 'ERR'}] d${s.depth} ${s.url}` +
        (s.error ? ` | error=${s.error}` : '') +
        ` | ${s.bytes}B | ${s.title}`
    );
  }

  console.log('\n===== 2) ELS 흔적이 있는 페이지 =====');
  const withEls = summary.filter((s) => s.evidence);
  if (!withEls.length) console.log('(없음 — 정적 HTML 에 ELS 텍스트가 전혀 없음. SPA 렌더링 가능성)');
  for (const s of withEls.sort((a, b) => b.evidence.total - a.evidence.total)) {
    console.log(`\n${s.url}\n   hits=${JSON.stringify(s.evidence.hits)}`);
    console.log(`   sample: ${s.evidence.sample.slice(0, 600)}`);
  }

  console.log('\n===== 3) 상품 관련 링크 후보 =====');
  const cands = new Map();
  for (const r of results) {
    for (const a of anchors(r)) {
      if (KEYWORD.test(decodeURIComponent(a.url)) || KEYWORD.test(a.text)) cands.set(a.url, a.text);
    }
  }
  if (!cands.size) console.log('(없음)');
  for (const [u, txt] of [...cands].slice(0, 80)) console.log(`   ${txt || '(no text)'}  ->  ${u}`);

  console.log('\n===== 4) API 힌트 =====');
  const allHints = new Set();
  for (const s of summary) for (const h of s.apiHints) allHints.add(h);
  console.log([...allHints].slice(0, 100).join('\n') || '(없음)');
  console.log('\n===== END =====');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
