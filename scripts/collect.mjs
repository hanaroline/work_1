// 증권사 아침 시황 종합 — 서버 수집기 (GitHub Actions에서 실행)
// 의존성 없음: Node 20+ 내장 fetch / TextDecoder(euc-kr) 사용.
// 하는 일:
//   1) 네이버 금융 리서치 '시황' 목록(EUC-KR)에서 증권사별 리포트 제목 수집
//   2) Google 뉴스 RSS에서 시황 뉴스 수집
//   3) (선택) ANTHROPIC_API_KEY가 있으면 Claude로 하나의 '종합요약' 생성
//   4) 완성된 정적 HTML(docs/market.html, docs/index.html)과 아카이브 JSON 출력
//
// 환경변수:
//   ANTHROPIC_API_KEY  (선택) 있으면 AI 종합요약 수행
//   MARKET_MODEL       (선택) 기본 claude-opus-5
//   MARKET_QUERIES     (선택) 콤마로 구분한 뉴스 검색어. 없으면 기본값 사용.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'docs');

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
const NAVER_URL = 'https://finance.naver.com/research/market_info_list.naver';
const MODEL = process.env.MARKET_MODEL || 'claude-opus-5';
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const DEFAULT_Q = ['증시 시황 모닝브리프', '코스피 마감 시황', '증시 개장 전 체크포인트'];
const QUERIES = (process.env.MARKET_QUERIES
  ? process.env.MARKET_QUERIES.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_Q);

// ===== 날짜 (KST) =====
function kstNow() { return new Date(Date.now() + 9 * 3600 * 1000); }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function todayStr() { const d = kstNow(); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
function nowLabel() {
  const d = kstNow();
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
    ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' KST';
}

// ===== 유틸 =====
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

async function fetchText(url, charset) {
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; MarketBriefBot/1.0)',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'ko,en;q=0.8'
    }
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
  const buf = await r.arrayBuffer();
  try { return new TextDecoder(charset || 'utf-8').decode(buf); }
  catch { return new TextDecoder('utf-8').decode(buf); }
}

// ===== 네이버 금융 리서치 시황 파싱 =====
function parseNaver(html) {
  // table.type_1 안의 각 행에서 market_info_read 링크(제목)와 증권사/날짜 추출
  const byFirm = {};
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = trRe.exec(html))) {
    const row = m[1];
    const a = row.match(/<a[^>]*href="([^"]*market_info_read[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) continue;
    const title = norm(decodeEntities(a[2]));
    if (!title) continue;
    let href = a[1].replace(/&amp;/g, '&');
    let link;
    if (href.indexOf('http') === 0) link = href;
    else if (href.charAt(0) === '/') link = 'https://finance.naver.com' + href;
    else link = 'https://finance.naver.com/research/' + href;
    // td 셀 추출
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let t;
    while ((t = tdRe.exec(row))) cells.push(norm(decodeEntities(t[1])));
    let firm = cells.length >= 2 ? cells[1] : '';
    let date = '';
    for (const c of cells) {
      if (/^\d{2}\.\d{2}\.\d{2}$/.test(c) || /^\d{4}\.\d{2}\.\d{2}$/.test(c)) date = c;
    }
    if (!firm || firm === title) firm = '기타';
    if (!byFirm[firm]) byFirm[firm] = [];
    if (byFirm[firm].length < 6 && !byFirm[firm].some(x => x.title === title)) {
      byFirm[firm].push({ title, date, link });
    }
  }
  const out = Object.keys(byFirm).map(f => ({ firm: f, items: byFirm[f] }));
  out.sort((a, b) => b.items.length - a.items.length);
  return out.slice(0, 20);
}

// ===== Google 뉴스 RSS 파싱 =====
function parseNews(xml, bySource) {
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m, count = 0;
  while ((m = itemRe.exec(xml)) && count < 12) {
    const it = m[1];
    const tRaw = norm(decodeEntities((it.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ''));
    const src = norm(decodeEntities((it.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || '')) || '뉴스';
    let title = tRaw.replace(new RegExp('\\s+-\\s+' + src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '');
    title = title.replace(/\s+-\s+[^-]+$/, '');
    const link = norm(decodeEntities((it.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || ''));
    const pd = (it.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    let date = '';
    try { const dd = new Date(pd); if (!isNaN(dd)) date = pad(dd.getMonth() + 1) + '.' + pad(dd.getDate()); } catch {}
    count++;
    if (!title) continue;
    if (!bySource[src]) bySource[src] = [];
    if (bySource[src].length < 6 && !bySource[src].some(x => x.title === title)) {
      bySource[src].push({ title, date, link });
    }
  }
}

async function collectNaver() {
  try {
    const html = await fetchText(NAVER_URL, 'euc-kr');
    return parseNaver(html);
  } catch (e) { console.error('[naver] 실패:', e.message); return []; }
}

async function collectNews(queries) {
  const bySource = {};
  for (const q of queries) {
    const url = 'https://news.google.com/rss/search?q=' +
      encodeURIComponent(q + ' when:1d') + '&hl=ko&gl=KR&ceid=KR:ko';
    try { parseNews(await fetchText(url, 'utf-8'), bySource); }
    catch (e) { console.error('[news] 실패(' + q + '):', e.message); }
  }
  const out = Object.keys(bySource).map(s => ({ firm: s, items: bySource[s] }));
  out.sort((a, b) => b.items.length - a.items.length);
  return out.slice(0, 20);
}

// ===== AI 종합요약 =====
function flatten(data) {
  const lines = [];
  (data.firms || []).forEach(g => g.items.forEach(it => lines.push('[' + g.firm + '] ' + it.title)));
  (data.news || []).forEach(g => g.items.forEach(it => lines.push('(' + g.firm + ') ' + it.title)));
  return lines;
}

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['date_label', 'headline_ko', 'summary_ko', 'key_points', 'markets', 'watch'],
  properties: {
    date_label: { type: 'string' }, headline_ko: { type: 'string' }, summary_ko: { type: 'string' },
    key_points: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ko'], properties: { ko: { type: 'string' } } } },
    markets: {
      type: 'array', items: {
        type: 'object', additionalProperties: false, required: ['name', 'value', 'change', 'note'],
        properties: { name: { type: 'string' }, value: { type: 'string' }, change: { type: 'string' }, note: { type: 'string' } }
      }
    },
    watch: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ko'], properties: { ko: { type: 'string' } } } }
  }
};

function aiPrompt(lines) {
  return [
    '당신은 미래에셋증권의 시황 전략가입니다. 아래는 오늘 아침 여러 증권사·매체가 낸 시황 코멘트 제목 모음입니다.',
    '이들을 종합해 한국 투자자를 위한 "오늘의 시황 종합 브리핑" 한 장을 작성하세요.',
    '규칙:',
    '- 중복·유사 내용은 합치고, 여러 곳에서 공통으로 언급된 테마를 우선하세요.',
    '- 특정 증권사 편향 없이 균형 있게 종합하세요.',
    '- 지수/금리/환율/미국증시/유가 등 언급된 지표는 markets에 정리(값이 없으면 비워두고 지어내지 마세요). change는 "+0.8%", "-12bp"처럼 부호 포함.',
    '- 제목만 있는 경우 정성적으로 요약하고 수치를 임의로 만들지 마세요.',
    '- key_points 5~7개, 각 한 문장. 모두 한국어(개조식/간결체).',
    '- date_label은 오늘 날짜.',
    '',
    '--- 오늘 아침 시황 제목 모음 ---',
    lines.join('\n')
  ].join('\n');
}

async function callClaude(lines) {
  const body = {
    model: MODEL, max_tokens: 8000,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: aiPrompt(lines) }]
  };
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': API_VERSION },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  let data; try { data = JSON.parse(t); } catch { throw new Error('응답 파싱 실패: ' + t.slice(0, 200)); }
  if (!r.ok) throw new Error('API 오류: ' + ((data && data.error && data.error.message) || ('HTTP ' + r.status)));
  if (data.stop_reason === 'refusal') throw new Error('요청 거부(safety)');
  let tb = null; (data.content || []).forEach(b => { if (b.type === 'text' && !tb) tb = b.text; });
  if (!tb) throw new Error('텍스트 응답 없음');
  return { data: JSON.parse(tb), model: MODEL, at: nowLabel() };
}

// ===== 정적 HTML 렌더 =====
function chgClass(c) { c = (c || '').trim(); const f = c.charAt(0); if (f === '+') return 'up'; if (f === '-') return 'down'; return ''; }

function groupHTML(title, groups) {
  if (!groups || !groups.length) return '';
  let h = '<section class="block"><div class="section-rule"></div><h2 class="section-title">' + esc(title) + '</h2>';
  groups.forEach(g => {
    h += '<div class="grp"><div class="gh"><span class="firm">' + esc(g.firm) + '</span><span class="cnt">' + g.items.length + '건</span></div><ul class="items">';
    g.items.forEach(it => {
      const t = it.link ? ('<a href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>') : esc(it.title);
      h += '<li><span class="t">' + t + '</span><span class="d">' + esc(it.date || '') + '</span></li>';
    });
    h += '</ul></div>';
  });
  return h + '</section>';
}

function aiHTML(ai) {
  if (!ai) return '';
  const d = ai.data;
  const kp = (d.key_points || []).map(p => '<li>' + esc(p.ko) + '</li>').join('');
  const mk = (d.markets || []).map(m => {
    const cc = chgClass(m.change);
    return '<tr><td class="name">' + esc(m.name) + '</td><td class="val">' + esc(m.value || '') + '</td><td class="chg ' + cc + '">' + esc(m.change || '') + '</td><td class="note">' + esc(m.note || '') + '</td></tr>';
  }).join('');
  const wt = (d.watch || []).map(w => '<li>' + esc(w.ko) + '</li>').join('');
  let h = '<div class="card ai"><div class="hero-tag">AI 종합요약 · Morning Briefing</div><h1 class="headline">' + esc(d.headline_ko) + '</h1><div class="summary">' + esc(d.summary_ko) + '</div>';
  if (kp) h += '<section class="block"><div class="section-rule"></div><h2 class="section-title">핵심 포인트</h2><ol class="keypoints">' + kp + '</ol></section>';
  if (mk) h += '<section class="block"><div class="section-rule"></div><h2 class="section-title">시장 동향</h2><div class="table-wrap"><table class="markets"><thead><tr><th>자산</th><th>수준</th><th>변동</th><th>코멘트</th></tr></thead><tbody>' + mk + '</tbody></table></div></section>';
  if (wt) h += '<section class="block"><div class="section-rule"></div><h2 class="section-title">오늘 체크포인트</h2><ol class="keypoints">' + wt + '</ol></section>';
  h += '<div class="disclaimer">여러 증권사·매체 아침 시황을 AI가 종합·요약한 사내 참고용 자료입니다. 투자 판단의 근거가 아니며 원문과 대조하시기 바랍니다.</div></div>';
  return h;
}

const CSS = `
:root{--mas-orange:#F58220;--mas-orange-active:#CB6015;--mas-blue:#043B72;--accent-blue:#043B72;--th-bg:#FAB072;--th-fg:#1A1A1A;
  --canvas:#fff;--surface-soft:#ECEFF4;--surface-subtle:#F7F8FA;--hairline:#CDCECB;--hairline-soft:#E5E4E1;
  --ink:#1A1A1A;--body:#3D3D3D;--muted:#6C6C6C;--muted-soft:#84888B;--up:#C62828;--down:#043B72;--page:#EEF0F3;
  --font-kr:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;--font-num:'Inter','SF Mono',ui-monospace,monospace;}
@media (prefers-color-scheme:dark){:root{--canvas:#16181c;--surface-soft:#1e2229;--surface-subtle:#1a1d22;--hairline:#33373e;
  --hairline-soft:#262a31;--ink:#f2f3f5;--body:#c7cbd1;--muted:#9aa0a8;--muted-soft:#7d838b;--up:#ff6b6b;--down:#5b9be0;
  --accent-blue:#5b9be0;--th-bg:#7a5230;--th-fg:#f2f3f5;--page:#0e1013;}}
*{box-sizing:border-box;}html,body{margin:0;padding:0;}
body{background:var(--page);color:var(--ink);font-family:var(--font-kr);line-height:1.6;-webkit-font-smoothing:antialiased;}
a{color:var(--accent-blue);text-decoration:none;}a:hover{text-decoration:underline;}
.topbar{background:var(--canvas);border-bottom:1px solid var(--hairline);display:flex;align-items:center;gap:12px;padding:12px 20px;}
.brand{display:flex;align-items:baseline;gap:9px;}.brand .logo{width:13px;height:13px;background:var(--mas-orange);border-radius:2px;display:inline-block;}
.brand .name{font-weight:700;font-size:16px;letter-spacing:-.02em;}.brand .sub{font-size:12px;color:var(--muted);}.spacer{flex:1 1 auto;}
.btn{border:1px solid var(--hairline);background:var(--canvas);color:var(--ink);padding:8px 14px;font-size:13px;border-radius:2px;cursor:pointer;font-family:inherit;}
.btn:hover{border-color:var(--mas-orange);}
.page{max-width:960px;margin:0 auto;padding:24px 20px 70px;}
.badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.badge{font-size:11px;font-family:var(--font-num);letter-spacing:.3px;padding:4px 9px;border-radius:2px;border:1px solid var(--hairline);color:var(--muted);}
.badge.live{border-color:var(--mas-orange);color:var(--mas-orange-active);}.badge.blue{border-color:var(--accent-blue);color:var(--accent-blue);}
.card{background:var(--canvas);border:1px solid var(--hairline);border-radius:4px;padding:28px 32px;margin-bottom:22px;}
.card.ai{border-top:3px solid var(--mas-orange);}
@media (max-width:768px){.card{padding:20px 18px;}}
.hero-tag{font-family:var(--font-num);font-size:12px;font-weight:600;letter-spacing:1px;color:var(--mas-orange);text-transform:uppercase;margin-bottom:6px;}
h1.headline{font-size:26px;font-weight:700;line-height:1.25;letter-spacing:-.3px;margin:0 0 14px;text-wrap:balance;}
@media (max-width:768px){h1.headline{font-size:21px;}}
.summary{font-size:16px;line-height:1.7;color:var(--body);padding:16px 18px;background:var(--surface-soft);border-left:3px solid var(--mas-orange);border-radius:0 3px 3px 0;margin-bottom:28px;}
section.block{margin-bottom:28px;}section.block:last-child{margin-bottom:0;}
.section-rule{height:1px;background:var(--mas-orange);margin-bottom:12px;}
.section-title{font-size:18px;font-weight:700;margin:0 0 14px;letter-spacing:-.2px;}
ol.keypoints{list-style:none;counter-reset:kp;margin:0;padding:0;}
ol.keypoints li{counter-increment:kp;position:relative;padding:9px 0 9px 42px;border-bottom:1px solid var(--hairline-soft);font-size:15px;line-height:1.6;color:var(--body);}
ol.keypoints li:last-child{border-bottom:none;}
ol.keypoints li::before{content:counter(kp);position:absolute;left:0;top:9px;width:26px;height:26px;background:var(--mas-blue);color:#fff;font-family:var(--font-num);font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;border-radius:2px;}
.table-wrap{overflow-x:auto;}
table.markets{width:100%;border-collapse:collapse;border:1px solid var(--hairline);font-size:14px;}
table.markets th{background:var(--th-bg);color:var(--th-fg);font-weight:700;text-align:left;padding:9px 13px;font-size:13px;}
table.markets td{padding:9px 13px;border-top:1px solid var(--hairline-soft);vertical-align:top;}
table.markets td.name{font-weight:600;white-space:nowrap;}table.markets td.val,table.markets td.chg{font-family:var(--font-num);white-space:nowrap;}
table.markets td.chg{font-weight:600;}table.markets td.chg.up{color:var(--up);}table.markets td.chg.down{color:var(--down);}table.markets td.note{color:var(--muted);}
.grp{margin-bottom:20px;}.grp .gh{display:flex;align-items:baseline;gap:8px;margin-bottom:6px;}
.grp .gh .firm{font-weight:700;font-size:15px;}.grp .gh .cnt{font-size:12px;color:var(--muted-soft);font-family:var(--font-num);}
ul.items{list-style:none;margin:0;padding:0;}ul.items li{padding:7px 0;border-bottom:1px solid var(--hairline-soft);font-size:14px;line-height:1.5;display:flex;gap:10px;}
ul.items li:last-child{border-bottom:none;}ul.items li .t{flex:1;color:var(--body);}ul.items li .d{color:var(--muted-soft);font-family:var(--font-num);font-size:12px;white-space:nowrap;}
.disclaimer{margin-top:8px;font-size:12px;color:var(--muted-soft);line-height:1.6;}
.empty{text-align:center;padding:40px 20px;color:var(--muted);}.empty .big{font-size:17px;color:var(--ink);font-weight:600;margin-bottom:8px;}
@media print{.topbar,.badges{display:none!important;}body{background:#fff;}.page{padding:0;}.card{border:none;padding:0 0 18px;}section.block{page-break-inside:avoid;}@page{margin:14mm;}}
`;

function renderHTML(data, ai) {
  const nf = (data.firms || []).length, nn = (data.news || []).length;
  let badges = '<span class="badge live">서버 자동 수집</span>' +
    '<span class="badge">' + esc(data.date) + '</span>' +
    '<span class="badge">증권사 ' + nf + '곳 · 매체 ' + nn + '곳</span>' +
    '<span class="badge">갱신 ' + esc(data.generated_at || '') + '</span>';
  if (ai) badges += '<span class="badge blue">AI 종합 ' + esc(ai.model) + '</span>';

  const g1 = groupHTML('증권사 시황 리포트 (네이버 금융 리서치)', data.firms);
  const g2 = groupHTML('주요 시황 뉴스 (Google 뉴스)', data.news);
  let agg;
  if (!g1 && !g2) {
    agg = '<div class="card"><div class="empty"><div class="big">오늘 수집된 항목이 없습니다</div>' +
      '<div>소스 페이지 구조 변경 또는 일시적 접속 오류일 수 있습니다. 잠시 후 자동 재수집됩니다.</div></div></div>';
  } else {
    agg = '<div class="card">' + g1 + g2 + '</div>';
  }

  return '<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>증권사 아침 시황 종합 · ' + esc(data.date) + '</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
    '<style>' + CSS + '</style>\n</head>\n<body>\n' +
    '<div class="topbar"><div class="brand"><span class="logo"></span><span class="name">증권사 아침 시황 종합</span>' +
    '<span class="sub">매일 아침 서버가 자동 수집 · ' + esc(data.date) + '</span></div><div class="spacer"></div>' +
    '<button class="btn" onclick="window.print()">🖨 인쇄 / PDF</button></div>\n' +
    '<div class="page"><div class="badges">' + badges + '</div>' + aiHTML(ai) + agg + '</div>\n</body>\n</html>\n';
}

// ===== 실행 =====
async function main() {
  console.log('[collect] 날짜(KST):', todayStr());
  const [firms, news] = await Promise.all([collectNaver(), collectNews(QUERIES)]);
  const data = { date: todayStr(), generated_at: nowLabel(), firms, news };
  const nItems = flatten(data).length;
  console.log('[collect] 증권사 그룹:', firms.length, '/ 뉴스 소스:', news.length, '/ 총 제목:', nItems);

  let ai = null;
  if (API_KEY && nItems > 0) {
    try { ai = await callClaude(flatten(data)); console.log('[ai] 종합요약 완료:', MODEL); }
    catch (e) { console.error('[ai] 실패(모아보기만 게시):', e.message); }
  } else if (!API_KEY) {
    console.log('[ai] ANTHROPIC_API_KEY 없음 → 모아보기만 게시');
  }

  mkdirSync(DOCS, { recursive: true });
  mkdirSync(join(DOCS, 'data'), { recursive: true });
  const html = renderHTML(data, ai);
  writeFileSync(join(DOCS, 'market.html'), html, 'utf-8');
  writeFileSync(join(DOCS, 'index.html'), html, 'utf-8');
  writeFileSync(join(DOCS, 'data', 'market-' + data.date + '.json'), JSON.stringify({ data, ai }, null, 2), 'utf-8');
  writeFileSync(join(DOCS, 'data', 'latest.json'), JSON.stringify({ data, ai }, null, 2), 'utf-8');
  console.log('[collect] docs/market.html, docs/index.html 작성 완료');
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1); });
