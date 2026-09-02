#!/usr/bin/env node
/**
 * 공모펀드 카탈로그 — 완전판매 스크립트가 쓰는 형태로 추린다.
 *
 *   node scripts/build_fund_catalog.mjs <fund.js 경로>   ->  data/fund-catalog.js
 *
 * 원천은 claude/fund-search-tool 브랜치의 data/fund.js (네이버 Npay 증권 수집분,
 * 금융투자협회 전자공시와 3,192건 전량 대조 완료 · tools/discovery/fund_verify_kofia.md).
 * 그 파일은 25MB 라 그대로 실을 수 없다. 스크립트가 읽는 항목만 남긴다.
 *
 * ★ 여기서 값을 만들어내지 않는다 ★
 *   수집분에 없는 것은 담지 않아 화면에서 「확인필요」로 남는다.
 *   동종유형 평균 수익률만 계산해서 넣는다 — 평가 기준이 「펀드유형 + 위험등급이 모두
 *   일치해야 동일유형」 이라 그 정의대로 같은 (유형, 위험등급) 집단의 평균을 낸다.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SRC = process.argv[2] || 'data/fund.js';
const OUT = 'data/fund-catalog.js';

/* 수집분의 위험등급 표기 -> 평가표의 1~6등급 */
const GRADE = {
  veryHighRisk: 1, highRisk: 2, moderatelyHighRisk: 3,
  moderateRisk: 4, lowRisk: 5, veryLowRisk: 6,
};
const GRADE_LABEL = ['매우높은위험', '높은위험', '다소높은위험', '보통위험', '낮은위험', '매우낮은위험'];

const src = await readFile(SRC, 'utf8');
const g = {};
new Function('window', src)(g);
const all = (g.FUND_DATA && g.FUND_DATA.funds) || [];
if (!all.length) throw new Error(`${SRC} 에서 펀드 목록을 찾지 못했습니다.`);

/* ── 동종유형 평균 1년 수익률 ─────────────────────────────
   (유형, 위험등급) 이 모두 같은 집단의 평균. 계열에 계단이 있어 수익률을 비운
   펀드(retDropped)는 평균에서도 뺀다 — 틀린 값으로 평균을 오염시키지 않는다. */
const peer = {};
for (const f of all) {
  const r = f.ret && f.ret['1y'];
  if (r == null || !isFinite(r)) continue;
  const k = f.type + '|' + f.riskGrade;
  (peer[k] = peer[k] || []).push(r);
}
const peerAvg = {};
for (const [k, v] of Object.entries(peer)) {
  if (v.length < 3) continue;              /* 표본이 두 개 이하면 평균이라 하기 어렵다 */
  peerAvg[k] = +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2);
}

/**
 * 문서 URL 은 모두 같은 틀이다.
 *   https://stock.pstatic.net/stock-research/fund/{코드}/{코드}_{T|G}_{일련}.pdf
 * 3,000건 × 2개를 통째로 실으면 그것만 0.5MB 다. 일련번호만 담고 앱에서 되살린다.
 */
/** 첫 문장까지 (없으면 max 자까지) */
const firstSentence = (v, max) => {
  if (!v) return null;
  const t = String(v).replace(/\s+/g, ' ').trim();
  const m = t.slice(0, max).match(/^[\s\S]*?니다\./);
  return (m ? m[0] : t.slice(0, max)).trim() || null;
};
const docKey = (f, type) => {
  const d = (f.documents || []).find((x) => x.type === type);
  if (!d || !d.url) return null;
  const m = String(d.url).match(/_([A-Z])_(\d+)\.pdf$/);
  return m ? m[2] : null;
};
const docAt = (f, type) => ((f.documents || []).find((d) => d.type === type) || {}).receivedAt || null;
/**
 * 클래스 목록에서 A·C 종류의 총보수를 고른다.
 * 표기가 운용사마다 다르다 — 종류A / ClassA / _A / (A) / A.
 * 그래서 클래스명에서 모펀드 이름을 떼어낸 「꼬리」만 보고 판정한다.
 * 온라인·연금 클래스(A-e, Ce, C-P 등)는 오프라인 A·C 가 아니므로 제외한다.
 */
const clsTail = (parent, name) => {
  const s = String(name || '').replace(/[\s_]/g, '');
  const p = String(parent || '').replace(/[\s_]/g, '');
  /**
   * 클래스명은 보통 「펀드명 + 종류A」 꼴이다. 그런데 펀드명 뒤에 (운) 같은 꼬리가
   * 붙는 경우가 있어(「다올전단채증권투자신탁[채권](운)」 의 클래스는
   * 「다올전단채증권투자신탁[채권]종류A」) 펀드명을 그대로 떼면 하나도 안 맞았다.
   * 그래서 종류·클래스·Class 뒤를 먼저 본다 — 그것이 곧 클래스 표기다.
   */
  /* 「…(종류C1)」 처럼 괄호로 감싸는 곳이 있어 남은 괄호를 떼어 준다 */
  const clean = (x) => x.replace(/^[([]+/, '').replace(/[)\]]+$/, '').trim();
  if (/종류|클래스|Class/i.test(s)) return clean(s.split(/종류|클래스|Class/i).pop());
  if (p && s.startsWith(p)) return clean(s.slice(p.length));
  const b = s.match(/\(([A-Za-z][A-Za-z0-9-]*)\)$/);          /* 「…(A)」 「…(C-e)」 */
  if (b) return b[1];
  let i = 0;                                                   /* 공통 앞부분을 뗀다 */
  while (i < s.length && i < p.length && s[i] === p[i]) i++;
  return clean(s.slice(i));
};
const clsFee = (f, re) => {
  const c = (f.classes || []).find((x) => re.test(clsTail(f.name, x.name)));
  return c && c.totalFee != null ? c.totalFee : null;
};
/**
 * 이 펀드가 실제로 발행하는 클래스 표기 목록.
 *
 * 왜 담나. 연금저축·퇴직연금 전용 펀드는 A클래스를 아예 발행하지 않고 C 계열만 있다
 * (예: 신한연금저축POP펀드셀렉션 = 종류C1·종류C-e). 그런 펀드에서 「A클래스
 * 선취판매수수료」 를 빈칸으로 남기면 창구에서 찾을 수 없는 값을 찾게 된다.
 * 목록이 있으면 「A클래스 미발행」 이라고 말할 수 있다 — 그것이 사실이다.
 */
const clsList = (f) => {
  const t = (f.classes || []).map((x) => clsTail(f.name, x.name)).filter(Boolean);
  return t.length ? t.filter((v, i, a) => a.indexOf(v) === i).join(',') : null;
};

const items = all.map((f) => {
  const grade = GRADE[f.riskGrade] || null;
  const k = f.type + '|' + f.riskGrade;
  const o = {
    code: f.code,
    name: f.name,
    mgr: f.company || null,
    fundType: f.type || null,
    region: f.region || null,
    riskGrade: grade,
    riskLabel: grade ? GRADE_LABEL[grade - 1] : null,
    ret1y: (f.ret && f.ret['1y'] != null) ? f.ret['1y'] : null,
    peerRet1y: peerAvg[k] != null ? peerAvg[k] : null,
    /* 매입·환매 기준시각과 영업일 (D+N -> 제(N+1)영업일) */
    /* 칸 이름을 3,192번 반복하면 그것만 0.25MB 다 — 배열로 담는다
       [기준시각, 매입前, 매입後, 환매前, 환매後, 지급前, 지급後] (D+N) */
    terms: f.terms ? [f.terms.standardTime || null, f.terms.buyBefore, f.terms.buyAfter,
      f.terms.redeemBefore, f.terms.redeemAfter, f.terms.payBefore, f.terms.payAfter] : null,
    /**
     * 클래스별 총보수. 종류A·종류C 행을 골라 담는다 (원천에 클래스 단위로 있다).
     * 검산: 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) 종류A 0.862 /
     *       종류C1 1.362 — 투자설명서 원문의 A 0.8620 / C1 1.3620 과 일치.
     *
     * 단 이것은 「총보수」다. 모자형·재간접형은 평가 인정 기준이 「합성 총보수·비용」이라
     * 이 값으로 채우면 실제 비용을 낮게 말하게 된다. 그래서 재간접·모자형은 담지 않고
     * 투자설명서에서 읽도록 비워 둔다(indirect 플래그로 표시).
     */
    ind: /재간접|모자형|피투자/.test(f.name || '') || undefined,
    /**
     * 투자목적 — 첫 문장까지만 남긴다.
     * 전문을 실으면 그것만 1.4MB 라 단일 파일이 두 배가 된다. 스크립트가 읽는
     * 「투자대상 자산」 은 첫 문장에 들어 있고, 자세한 것은 투자설명서를 올려 읽는다.
     */
    objective: firstSentence(f.objective, 200),
    clsAExp: clsFee(f, /^\(?A\)?$/i),
    clsCExp: clsFee(f, /^\(?C1?\)?$/i),
    cls: clsList(f),
    docT: docKey(f, 'prospectus'),          /* 투자설명서 일련번호 */
    docG: docKey(f, 'summary_prospectus'),  /* 간이투자설명서 일련번호 */
    docAt: docAt(f, 'prospectus') || docAt(f, 'summary_prospectus'),
  };
  if (o.ind) { delete o.clsAExp; delete o.clsCExp; }
  delete o.ind;
  Object.keys(o).forEach((x) => { if (o[x] == null) delete o[x]; });
  return o;
});

const withDoc = items.filter((x) => x.docT || x.docG).length;

/**
 * 겹치는 문구는 pool 에 한 번만 담고 항목은 번호로 가리킨다.
 * 운용사·펀드유형·지역·위험등급명은 3,192건이 80여 개 값을 돌려쓰고,
 * 투자목적도 고유값 2,519개가 3,190건을 덮는다 — 그대로 실으면 이것만 1.3MB 다.
 * 화면에서는 앱이 불러올 때 한 번에 되살린다(js/sales-script-app.js 의 fundCat).
 */
const POOLED = ['mgr', 'fundType', 'region', 'riskLabel', 'objective', 'cls'];
const pool = [];
const poolIdx = new Map();
const intern = (v) => {
  if (poolIdx.has(v)) return poolIdx.get(v);
  const i = pool.length;
  pool.push(v); poolIdx.set(v, i);
  return i;
};
items.forEach((o) => POOLED.forEach((k) => { if (o[k] != null) o[k] = intern(o[k]); }));
const body =
  '/**\n' +
  ' * 공모펀드 카탈로그 — 완전판매 스크립트용\n' +
  ' *\n' +
  ' * 생성 : scripts/build_fund_catalog.mjs\n' +
  ' * 원천 : 네이버 Npay 증권 수집분 (claude/fund-search-tool 의 data/fund.js)\n' +
  ' *        금융투자협회 전자공시와 전량 대조 완료 — tools/discovery/fund_verify_kofia.md\n' +
  ' *\n' +
  ' * FUND_CATALOG.items[] = { code, name, mgr, fundType, riskGrade, feeMin/feeMax,\n' +
  ' *                          ret1y, peerRet1y, terms, objective, docT, docG }\n' +
  ' *\n' +
  ' * mgr·fundType·region·riskLabel·objective 는 pool 번호로 담긴다 (pooled 목록 참조) —\n' +
  ' * 앱이 불러올 때 되살린다. 실제 값 = FUND_CATALOG.pool[ items[i].mgr ]\n' +
  ' *\n' +
  ' * 문서 주소는 docUrl(code, docT|docG, \'T\'|\'G\') 로 되살린다 —\n' +
  ' *   https://stock.pstatic.net/stock-research/fund/{code}/{code}_{T|G}_{일련}.pdf\n' +
  ' *\n' +
  ' * peerRet1y 는 (펀드유형, 위험등급) 이 모두 같은 집단의 1년 수익률 평균이다\n' +
  ' * (평가 기준: 「펀드유형 + 위험등급이 모두 일치해야 동일유형」).\n' +
  ' * 원천에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
  ' */\n' +
  'window.FUND_CATALOG = ' + JSON.stringify({
    updatedAt: g.FUND_DATA.updatedAt || null,
    docBase: 'https://stock.pstatic.net/stock-research/fund/',
    source: '네이버 Npay 증권 (금융투자협회 전자공시 대조)',
    count: items.length,
    withProspectus: withDoc,
    pooled: POOLED,
    pool,
    items,
  }) + ';\n';

await writeFile(OUT, body);
console.log(`${OUT} 기록 — 펀드 ${items.length}건 · 투자설명서 링크 ${withDoc}건`);
console.log(`  동종유형 평균 산출 집단 ${Object.keys(peerAvg).length}개`);
console.log(`  문구 풀 ${pool.length}개 (${POOLED.join('·')} 중복 제거)`);
console.log(`  크기 ${(body.length / 1024 / 1024).toFixed(2)}MB`);
