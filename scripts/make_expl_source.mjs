#!/usr/bin/env node
/**
 * sales-script.html -> sales-script-expl.html (상품설명의무 전용 화면)
 *
 * 두 화면은 CSS·상단바·스크립트 목록이 같고, 다른 것은 셋뿐이다.
 *   ① 제목        ② 상단바 문구        ③ window.SS_MODE = 'expl'
 *
 * 손으로 두 벌을 관리하면 한쪽만 고쳐 놓고 다른 쪽에서 「왜 안 되지」 를 하게 된다.
 * 껍데기(CSS·상단바·스크립트 태그)는 sales-script.html 만 고치고 이 스크립트로 다시 만든다.
 *
 * 사용: node scripts/make_expl_source.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'sales-script.html';
const OUT = 'sales-script-expl.html';

const rules = [
  {
    what: '제목',
    from: '<title>완전판매 스크립트 자동완성 시스템</title>',
    to: '<title>완전판매 스크립트 자동완성 · 상품설명의무</title>',
  },
  {
    what: '상단바 문구',
    from: '<div class="brand">완전판매 스크립트 <span>자동완성</span><small>미스터리쇼퍼 대응 · 금융소비자보호 판매프로세스</small></div>',
    to: '<div class="brand">상품설명의무 <span>스크립트 자동완성</span><small>완전판매 · 상품을 고르면 그 상품의 값으로 완성됩니다 (적합성원칙 제외)</small></div>',
  },
  {
    what: '모드 스위치',
    from: '<script src="vendor/pdf.min.js"></script>',
    to:
      '<!-- 이 화면은 상품설명의무만 다룬다. 화면 구성·데이터·읽기모드는 전체판(sales-script.html)과 같고,\n'
      + '     적합성원칙에 딸린 입력칸(시나리오·투자자성향·현재 투자자금성향·추천상품)만 빠진다.\n'
      + '     이 파일은 scripts/make_expl_source.mjs 가 만든다 — 직접 고치지 말고 sales-script.html 을 고치십시오. -->\n'
      + "<script>window.SS_MODE = 'expl';</script>\n"
      + '<script src="vendor/pdf.min.js"></script>',
  },
];

let html = await readFile(SRC, 'utf8');
for (const r of rules) {
  if (!html.includes(r.from)) {
    console.error(`[expl] ${SRC} 에서 ${r.what} 자리를 찾지 못했습니다 — 규칙을 고쳐야 합니다.`);
    process.exit(1);
  }
  html = html.replace(r.from, r.to);
}

/**
 * 교부자료 쪽 지도를 싣는다 — 앱 스크립트보다 **먼저** 와야 한다 (앱이 로드 시점에 읽는다).
 *
 * 처음에는 테스트판(make_test_source.mjs)에만 실었다. 쪽 번호가 하나라도 틀리면 창구가
 * 고객 앞에서 엉뚱한 곳을 펴게 되므로, 배포본은 건드리지 않고 시험부터 한 것이다.
 * 그 시험을 마치고 배포본에도 싣기로 했다.
 *
 * 아직 만들어지지 않은 지도가 있어도 여기서 멈추지 않는다. 앱은 없는 지도를 빈 것으로
 * 보고 그 상품군에만 쪽 표시를 안 그린다 — 한쪽이 늦었다고 다른 쪽까지 못 쓰게 만들
 * 이유가 없다.
 */
const APP = '<script src="js/sales-script-app.js"></script>';
if (!html.includes(APP)) {
  console.error(`[expl] ${SRC} 에서 앱 스크립트 태그를 찾지 못했습니다 — 쪽 지도를 실을 자리가 없습니다.`);
  process.exit(1);
}
const MAPS = ['data/doc-pages.js', 'data/fund-doc-pages.js'];
for (const m of MAPS) {
  if (!html.includes(m)) html = html.replace(APP, `<script src="${m}"></script>\n` + APP);
}

await writeFile(OUT, html);
console.log(`[expl] ${OUT} 생성 완료 (${rules.map((r) => r.what).join(' · ')} · 쪽 지도 ${MAPS.join(' · ')} 적재)`);
