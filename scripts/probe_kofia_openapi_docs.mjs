#!/usr/bin/env node
/**
 * 금융투자협회 오픈API — 이용안내·서비스목록 원문 받아오기.
 *
 *   node scripts/probe_kofia_openapi_docs.mjs
 *   -> tools/discovery/kofia_openapi_docs.md
 *
 * ── 왜 이 스크립트가 있나 ───────────────────────────────────────────────────
 *
 * 사용자가 "금투협 API 키 신청하면 되냐, 신청방법 알려달라" 고 물었다.
 * 세션에서는 openapi.kofia.or.kr 도 data.go.kr 도 이그레스 정책에 막혀
 * (EGRESS_BLOCKED) 열리지 않는다. 검색 요약만 보고 신청 절차를 적으면
 * 그것은 **지어낸 절차**가 된다. 러너는 정책 밖이므로 여기서 원문을 받아
 * 저장소에 남기고, 그 원문을 보고 답한다.
 *
 * 특히 갈라야 하는 것 하나 —
 *   검색 요약은 금투협이 "펀드표준코드" 를 준다고 한다. 그건 코드·명칭이지
 *   **일별 설정원본**이 아니다. 우리가 자금유입을 내려면 필요한 것은 후자다.
 *   서비스 목록에 그 항목이 실제로 있는지 없는지는 원문을 봐야 안다.
 *   "요약에 안 보였다" 는 "없다" 가 아니다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT = 'tools/discovery/kofia_openapi_docs.md';

const PAGES = [
  ['오픈API 메인', 'https://openapi.kofia.or.kr/'],
  ['이용안내', 'http://openapi.kofia.or.kr/guide/sub1.jsp'],
  ['이용안내 2', 'http://openapi.kofia.or.kr/guide/sub2.jsp'],
  ['이용안내 3', 'http://openapi.kofia.or.kr/guide/sub3.jsp'],
  ['서비스 현황', 'http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp'],
];

/** 한글 페이지는 EUC-KR 인 경우가 흔하다. 바이트로 받아 charset 을 보고 푼다. */
async function getText(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 2048).toString('latin1');
  const ct = res.headers.get('content-type') || '';
  const m = /charset\s*=\s*["']?([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?([\w-]+)/i.exec(head);
  let enc = (m?.[1] || 'utf-8').toLowerCase();
  if (enc === 'ks_c_5601-1987' || enc === 'euc-kr' || enc === 'cp949') enc = 'euc-kr';
  let text;
  try {
    text = new TextDecoder(enc).decode(buf);
  } catch {
    text = buf.toString('utf8');
  }
  return { status: res.status, url: res.url, enc, text };
}

/** 태그를 걷어내고 읽을 수 있는 본문만 남긴다. 원문 판단은 사람이 한다. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d|td|th)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/** 페이지 안의 내부 링크 — 신청 화면 주소를 여기서 찾는다. */
function links(html, base) {
  const out = new Map();
  for (const m of html.matchAll(/<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = toText(m[2]).replace(/\s+/g, ' ').trim();
    if (!label) continue;
    let href = m[1];
    if (href.startsWith('#') || href.startsWith('javascript:')) continue;
    try { href = new URL(href, base).href; } catch { continue; }
    if (!out.has(href)) out.set(href, label);
  }
  return out;
}

await mkdir('tools/discovery', { recursive: true });

const md = [
  '# 금융투자협회 오픈API — 이용안내 원문',
  '',
  `받은 때: ${new Date().toISOString()}`,
  '',
  '세션에서는 openapi.kofia.or.kr 이 이그레스 정책에 막혀 열리지 않는다.',
  '이 파일은 러너가 받아 온 **원문**이다. 신청 절차·제공 항목은 여기 적힌 것만 사실이다.',
  '',
];

const allLinks = new Map();

for (const [name, url] of PAGES) {
  md.push(`## ${name}`, '', `\`${url}\``, '');
  try {
    const r = await getText(url);
    md.push(`- HTTP ${r.status} · 인코딩 \`${r.enc}\` · 최종 \`${r.url}\``, '');
    if (r.status >= 400) {
      md.push('> 열리지 않았다.', '');
      continue;
    }
    const body = toText(r.text);
    md.push('```', body.slice(0, 12000), '```', '');
    for (const [href, label] of links(r.text, r.url)) {
      if (!allLinks.has(href)) allLinks.set(href, label);
    }
  } catch (e) {
    md.push(`> 실패: ${e.message}`, '');
  }
}

// 신청·인증키와 관련돼 보이는 링크를 따로 모은다. 주소를 지어내지 않으려는 것이다.
const KEYWORD = /(신청|인증|키|key|apply|가입|회원|regist|login)/i;
md.push('## 링크 (신청·인증키 관련만)', '');
for (const [href, label] of allLinks) {
  if (KEYWORD.test(label) || KEYWORD.test(href)) md.push(`- [${label}](${href})`);
}
md.push('', '## 링크 (전체)', '');
for (const [href, label] of allLinks) md.push(`- [${label}](${href})`);
md.push('');

await writeFile(OUT, md.join('\n'), 'utf8');
console.log(`[kofia-docs] ${OUT} — 페이지 ${PAGES.length}개 · 링크 ${allLinks.size}개`);
