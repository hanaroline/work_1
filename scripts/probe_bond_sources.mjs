#!/usr/bin/env node
/**
 * 채권 원천 탐색 — 러너에서 돌린다
 *
 *   node scripts/probe_bond_sources.mjs
 *
 * 왜 필요한가. 펀드는 수집분(카탈로그)이 있고 ELS 는 DART 에서 끌어오는데, 채권은
 * 원천이 없어 민평금리·민평단가·매매단가·발행회사 재무정보를 창구에서 종목마다
 * 손으로 넣어야 한다. 자동으로 끌어올 길이 있는지 먼저 확인한다.
 *
 * 무엇을 찾나
 *   ① 미래에셋증권이 실제로 판매하는 장외채권 목록 + 설명서 주소
 *      (회사 사이트에만 있다 — 다른 곳에는 「이 회사가 파는 것」 이 없다)
 *   ② 종목 기본정보 — 발행일·만기일·표면금리·이자지급주기·신용등급
 *      (KRX 정보데이터시스템 · 예탁결제원 SEIBRO)
 *   ③ 민평금리·민평단가 (금융투자협회 채권정보센터 — 채권시가평가기준수익률)
 *
 * ★ 짐작하지 않는다 ★ 후보 주소를 두드려 보고 무엇이 돌아오는지 그대로 찍는다.
 *   응답 형태를 눈으로 본 다음에 수집기를 만든다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** 한 번 두드려 보고 결과를 한 줄로 요약한다 */
async function probe(label, url, opt) {
  const o = opt || {};
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      method: o.method || 'GET',
      headers: Object.assign({
        'User-Agent': UA,
        'Accept': o.accept || 'text/html,application/json,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9'
      }, o.headers || {}),
      body: o.body,
      redirect: 'follow',
      signal: AbortSignal.timeout(25000)
    });
    const ct = r.headers.get('content-type') || '';
    const buf = Buffer.from(await r.arrayBuffer());
    const ms = Date.now() - t0;
    console.log(`\n■ ${label}`);
    console.log(`   ${o.method || 'GET'} ${url}`);
    console.log(`   ${r.status} ${r.statusText} · ${ct.split(';')[0]} · ${buf.length}바이트 · ${ms}ms`);
    if (!r.ok) return null;
    /* 한글이 깨지지 않게 EUC-KR 도 시도해 본다 (사내·협회 사이트에 아직 있다) */
    let text = buf.toString('utf8');
    if (/�/.test(text.slice(0, 3000)) || /euc-kr|ks_c_5601/i.test(ct)) {
      try { text = new TextDecoder('euc-kr').decode(buf); } catch (e) { /* 그대로 둔다 */ }
    }
    const flat = text.replace(/\s+/g, ' ').trim();
    console.log(`   ${flat.slice(0, 260)}`);
    return { status: r.status, ct, text, len: buf.length };
  } catch (e) {
    console.log(`\n■ ${label}`);
    console.log(`   ${o.method || 'GET'} ${url}`);
    console.log(`   실패 — ${e.name}: ${e.message}`);
    return null;
  }
}

console.log('='.repeat(72));
console.log('① 미래에셋증권 — 판매 중인 장외채권 목록·설명서');
console.log('='.repeat(72));

/* 먼저 사이트가 닿는지, 그리고 무엇을 공개하는지 본다 */
const mas = 'https://securities.miraeasset.com';
await probe('회사 사이트 (도달 확인)', mas + '/');
const rb = await probe('robots.txt', mas + '/robots.txt');
if (rb && rb.text) {
  const maps = [...rb.text.matchAll(/Sitemap:\s*(\S+)/gi)].map((m) => m[1]);
  console.log('   사이트맵 ' + (maps.length ? maps.join(' , ') : '없음'));
  for (const m of maps.slice(0, 2)) {
    const sm = await probe('사이트맵', m);
    if (sm && sm.text) {
      /* 채권과 관련된 주소만 골라 본다 */
      const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
      const bond = urls.filter((u) => /bond|채권|chae/i.test(u));
      console.log('   주소 ' + urls.length + '개 · 채권 관련 ' + bond.length + '개');
      bond.slice(0, 12).forEach((u) => console.log('     ' + u));
    }
  }
}
/* 장외채권 화면 후보 — 사내 화면 주소 규칙(hkm####)을 몰라 몇 가지를 두드려 본다 */
for (const path of [
  '/bond/main.do', '/bond/list.do', '/hkm/hkm3021/r01.do', '/hkm/hkm3022/r01.do',
  '/product/bond/list.do', '/pdc/pdc3001/r01.do', '/trading/bond/otc.do'
]) {
  await probe('장외채권 화면 후보', mas + path);
}

console.log('\n' + '='.repeat(72));
console.log('② 금융투자협회 채권정보센터 — 민평금리(시가평가기준수익률)');
console.log('='.repeat(72));
for (const [label, url] of [
  ['채권정보센터 (kofiabond)', 'https://www.kofiabond.or.kr/'],
  ['채권정보센터 (bond.kofia)', 'https://bond.kofia.or.kr/'],
  ['협회 전자공시 (dis)', 'https://dis.kofia.or.kr/']
]) await probe(label, url);

console.log('\n' + '='.repeat(72));
console.log('③ KRX 정보데이터시스템 — 채권 종목 기본정보');
console.log('='.repeat(72));
await probe('KRX 데이터시스템', 'https://data.krx.co.kr/');
/* KRX 는 화면마다 bld 값이 다르다. 채권 관련으로 알려진 몇 개를 두드려 본다. */
for (const bld of [
  'dbms/MDC/STAT/standard/MDCSTAT09901',   /* 채권 전종목 시세 (후보) */
  'dbms/MDC/STAT/standard/MDCSTAT10001',
  'dbms/comm/finder/finder_bondisu'        /* 채권 종목 찾기 (후보) */
]) {
  await probe('KRX bld ' + bld.split('/').pop(), 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd'
    },
    accept: 'application/json',
    body: 'bld=' + encodeURIComponent(bld) + '&locale=ko_KR&mktId=ALL&trdDd=' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') + '&share=1&money=1&csvxls_isNo=false'
  });
}

console.log('\n' + '='.repeat(72));
console.log('④ 예탁결제원 SEIBRO — 채권 발행 정보');
console.log('='.repeat(72));
await probe('SEIBRO', 'https://seibro.or.kr/');

console.log('\n탐색 끝. 돌아온 응답을 보고 어디서 무엇을 가져올지 정한다.');
