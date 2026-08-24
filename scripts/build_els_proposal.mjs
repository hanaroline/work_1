#!/usr/bin/env node
/**
 * ELS 표준 제안서 생성 — els-proposal.html
 *
 *   node scripts/build_els_proposal.mjs [접수번호]
 *
 * 접수번호를 생략하면 prospectus_parsed.json 에서 가장 최근 회차를 쓴다.
 * 매주 새 일괄신고추가서류가 들어오면 같은 명령으로 다시 돌리면 된다.
 *
 * els-sales.html(4면 분석 자료)이 "왜 그런가"를 다룬다면 이 문서는 "무엇을 권하는가"만 남긴다.
 * 상담 자리에서 그대로 펼쳐 놓고 읽을 수 있게 전문 용어를 전부 풀어쓰고,
 * 비율 대신 1만원당 금액으로 보여준다.
 *
 * 입력
 *  - tools/discovery/prospectus_parsed.json : 일괄신고추가서류에서 뽑은 조건·공정가액·모의실험
 *  - data/els.js                            : 기초자산 일별 종가 (자체 롤링 검증용)
 *
 * 문서에 적히는 수치는 전부 여기서 계산한다. 손으로 옮겨적는 숫자를 두지 않는다.
 */
import { writeFile } from 'node:fs/promises';
import {
  analyze, kindOf, tierOf, KINDS, TIER_RULE, IDX, MC, money, baseOf, unitOf, josa,
} from './lib/els-analysis.mjs';

const OUT = 'els-proposal.html';

// 숫자·등급·추천은 전부 분석층에서 나온다. 이 파일은 그것을 문서로 옮기는 일만 한다.
const A = await analyze(process.argv[2]).catch((e) => { console.error(e.message); process.exit(1); });
const {
  rcp: RCP, items, head, H, filedOn, checkedAt, onOfferNow,
  byKind, mcAvgAll, kindRatio, safest, idxWorst, stockBest,
  slots, caution, perRisk, idxPerRisk, plan,
  rateMin, rateMax, gapBest, gapWorst, tierCount, coupon,
} = A;
const [offerFrom, offerTo] = A.offer;

// ── 표기 도우미 ──────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = (v, d = 1) => v == null || Number.isNaN(v) ? '–' : v.toFixed(d);
const sgn = (v, d = 1) => v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d);
const dot = (s) => (s || '').replace(/-/g, '.');

// ── 오늘 기준 이 회차의 위치 ─────────────────────────────────────────────────
const kst = (iso) => new Date(new Date(iso).getTime() + 9 * 3600000);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const stamp = (iso) => {
  if (!iso) return null;
  const d = kst(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`
       + `(${DOW[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const dayLabel = (ymd) => {
  const [y, m, d] = ymd.split('.').map(Number);
  return `${m}월 ${d}일(${DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
};
// 문서를 만든 날 — 공시일(filedOn)과 다르다. 같은 회차를 며칠에 걸쳐 다시 뽑는 일이 있어
// 꼬리말에는 공시일이 아니라 이 파일을 실제로 돌린 날을 적는다.
const builtOn = (() => {
  const d = new Date(Date.now() + 9 * 3600000);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
})();
const asOf = checkedAt ? kst(checkedAt) : new Date();
const asOfNum = asOf.getUTCFullYear() * 10000 + (asOf.getUTCMonth() + 1) * 100 + asOf.getUTCDate();
const numOfDot = (s) => Number((s || '').replace(/\D/g, ''));
const d2 = (iso) => dot(iso || '');
const retailEnd = d2(plan.retailEnd);
// 개인 일반투자자는 숙려기간·가입의사확인기간에 청약을 할 수 없다. 판단 기준은 그 마감이다.
const phase = asOfNum < numOfDot(offerFrom) ? 'before'
            : asOfNum > numOfDot(retailEnd) ? 'after' : 'open';
const phaseLine = {
  before: `개인 일반투자자가 청약할 수 있는 날은 <b>${dayLabel(offerFrom)}부터 ${dayLabel(retailEnd)}까지</b>입니다. 오늘은 아직 주문을 받을 수 없습니다.`,
  open: `개인 일반투자자는 <b>${dayLabel(retailEnd)}까지</b> 청약해야 합니다. 그 다음은 숙려기간이라 주문을 받을 수 없습니다.`,
  after: `개인 일반투자자 청약은 <b>${dayLabel(retailEnd)}에 마감</b>되었습니다. 지금은 숙려·확인 기간이라 주문을 받을 수 없습니다.`,
}[phase];

/** 이 상품의 자체 검증 구간을 말로 — 상장이 늦은 기초자산이 섞이면 10년이 아니다 */
const covLabel = (it) => it.covAt == null ? '과거 구간'
  : `최근 ${it.covYears}년(${String(it.covAt).slice(0, 4)}년~)`;

const cautionReason = (it) => {
  const r = [];
  if (it.mcLoss != null && it.mcLoss > 25) r.push(`컴퓨터로 똑같이 돌려보면 <b>100번 중 ${f1(it.mcLoss, 0)}번</b>이 손실로 끝납니다 (이번 주 상품 평균 ${f1(mcAvgAll, 0)}번)`);
  if ((it.fairValueGap ?? 0) <= -10) r.push(`${baseOf(it)}${josa(baseOf(it), '을', '를')} 넣는 순간의 실제 값어치가 <b>${money(it, it.fairValue / 100)}</b>밖에 안 됩니다`);
  if (it.simShort) r.push(`회사가 과거로 돌려본 기간이 ${f1(it.simYears, 1)}년(${it.simRuns.toLocaleString('ko-KR')}번)뿐입니다 — ${esc(it.underlyings[it.underlyings.length - 1])}${josa(it.underlyings[it.underlyings.length - 1], '이', '가')} 늦게 상장해서 <b>큰 폭락장이 아예 빠져 있습니다.</b> 설명서에 적힌 손실 ${f1(it.simLoss, 2)}%를 20년을 돌려본 상품 옆에 나란히 놓으면 안 됩니다`);
  if (it.vmax != null && it.vmax >= 90) r.push(`회사가 값을 매길 때 잡은 <b>가격 출렁임이 ${f1(it.vmax, 0)}%</b>입니다 — 이번 주에서 가장 심하게 흔들리는 축입니다`);
  if (it.margin != null && it.margin < 0) r.push(`${covLabel(it)} 안에 <b>원금 지키는 선을 이미 ${f1(-it.margin)}%p 뚫고 내려간 적</b>이 있습니다`);
  return r.slice(0, 4);
};

// 가격 출렁임(변동성) — 문장 한 줄에만 쓴다
const vols = [...new Map(items.flatMap((it) => it.volatility.map((v) => [v.asset, v.vol]))).entries()]
  .sort((a, b) => b[1] - a[1]);

// ── 상품 한 줄 설명 (전문 용어를 풀어쓴다) ───────────────────────────────────
const judgeLine = (it) => it.underlyings.length === 1
  ? `${esc(it.underlyings[0])} 하나만 봅니다.`
  : `${esc(it.underlyings.join(' · '))} 중 <b>더 많이 떨어진 하나</b>로 판정합니다. 하나만 나빠도 그쪽을 봅니다.`;
const earlyLine = (it) => {
  const b = it.barriers[0];
  return `${it.every}개월마다 확인해서 처음 가격의 <b>${b}% 이상</b>(${sgn(b - 100, 0)}%까지 떨어져도 괜찮다는 뜻)이면 그 자리에서 끝나고 `
       + `${baseOf(it)}${josa(baseOf(it), '이', '가')} <b>${money(it, it.schedule[0].payout)}</b>${josa(unitOf(it), '이', '가')} 되어 돌아옵니다.`;
};
const floorLine = (it) => it.knockIn != null
  ? `끝날 때까지 종가가 <b>단 한 번도 ${it.knockIn}%</b>(처음 가격에서 ${sgn(it.knockIn - 100, 0)}%) 아래로 안 내려가면, `
    + `마지막에 얼마가 됐든 원금과 이자를 다 받습니다.`
  : `중간에 얼마나 빠졌든 따지지 않습니다. <b>마지막 날 하루만</b> 봐서 ${it.maturityBarrier}% 이상이면 원금과 이자를 다 받습니다.`;
const lossLine = (it) => it.knockIn != null
  ? `${it.knockIn}% 아래를 한 번이라도 밟았고 <b>마지막 날에도</b> ${it.maturityBarrier}% 아래면, 떨어진 만큼 그대로 손실입니다.`
  : `<b>마지막 날</b> ${it.maturityBarrier}% 아래면 떨어진 만큼 그대로 손실입니다.`;

// ── 조각 ─────────────────────────────────────────────────────────────────────
const tierChip = (it) => `<span class="tier t${it.tier}">${tierOf(it).name}</span>`;

const stairs = (it) => {
  const bs = it.barriers;
  const maxB = Math.max(...bs), minB = Math.min(...bs);
  const span = maxB - minB;                       // 계단이 없는 상품(전 회차 동일 조건)도 있다
  const h = (b) => span ? 22 + (b - minB) / span * 42 : 44;
  return `<p class="stcap">미리 끝나는 기준선 — ${it.every}개월마다 확인하고, 뒤로 갈수록 기준이 낮아져 끝나기 쉬워집니다${span ? ` (${bs[0]}% → ${bs[bs.length - 1]}%)` : ' (매번 같은 기준)'}</p>
      <div class="stairs" role="img" aria-label="${it.every}개월마다 확인하며 미리 끝나는 기준선이 ${bs[0]}%에서 ${bs[bs.length - 1]}%로 낮아집니다">
${bs.map((b, i) => `        <div class="st"><div class="stbar" style="height:${h(b)}px"></div><span class="stv">${b}%</span><span class="stn">${(i + 1) * it.every}개월</span></div>`).join('\n')}
      </div>`;
};

/** 이 상품이 17종 중 몇 번째로 손실 확률이 낮은가 */
const rankLabel = (it) => {
  const r = safest.findIndex((x) => x.no === it.no);
  return r < 0 ? '–' : `낮은 쪽 ${r + 1}번째`;
};

/** 이익 / 손실을 한 줄 띠로 — 공시 모의실험의 실제 분포 */
const probBar = (it) => {
  const loss = it.simLoss ?? 0, win = 100 - loss;
  const buckets = (it.lossBuckets || []).filter((b) => b.count > 0);
  return `<p class="stcap">회사가 과거 시세로 ${it.simRuns?.toLocaleString('ko-KR')}번 돌려본 결과 — ${dot(it.simRange?.from ?? '')}~${dot(it.simRange?.to ?? '')} 사이 매일 하나씩 가입했다고 치고 계산</p>
      <div class="pbar" role="img" aria-label="이익 ${f1(win, 2)}%, 손실 ${f1(loss, 2)}%">
        <div class="pw" style="flex:${Math.max(win, 0.01)}"><span>이익 ${f1(win, 2)}%</span></div>
        <div class="pl" style="flex:${Math.max(loss, 0.01)}"></div>
      </div>
      <p class="pnote">${loss > 0
        ? `손실 <b>${f1(loss, 2)}%</b> — ${buckets.map((b) => `${esc(b.label.replace('만기상환손실', '0~-10%'))} ${b.count}번`).join(' · ')}`
        : `이 기간에는 <b>손실이 한 번도 없었습니다.</b> 다만 아래 B 방식으로 재면 ${f1(it.mcLoss, 1)}%입니다.`}</p>`;
};

/** 종목이 섞였는데도 앞자리에 올렸다면, 그 이유를 상담용 문장으로 남긴다 */
const defenceLine = (it) => {
  if (kindOf(it) === '지수') return '';
  const stock = it.underlyings.filter((u) => !IDX.has(u)).join('·');
  const idxAvg = byKind.find((r) => r.key === '지수')?.loss;
  const idxVol = byKind.find((r) => r.key === '지수')?.vol;
  const beats = items.filter((i) => kindOf(i) === '지수' && i.mcLoss > it.mcLoss).length;
  const idxN = items.filter((i) => kindOf(i) === '지수').length;
  const safer = it.mcLoss <= idxAvg;

  const head = `<b>"개별 종목이 들어갔는데 괜찮나요?"</b> ${esc(stock)}${josa(stock, '이', '가')} 들어간 게 맞습니다. `
    + `가격이 출렁이는 정도도 <b>${f1(it.vmax, 1)}%</b>로 지수만 있는 상품 평균(${f1(idxVol, 1)}%)보다 큽니다. 그 말씀이 맞습니다. `;

  // 실제로 지수형 평균보다 안전한 경우와 그렇지 않은 경우는 다른 문장을 써야 한다
  const body = safer
    ? `그런데 컴퓨터로 똑같이 돌려본 손실 확률은 <b>${f1(it.mcLoss, 1)}%</b>로 지수형 평균(${f1(idxAvg, 1)}%)<b>보다 낮고</b>, 지수만 담은 ${idxN}종 중 ${beats}종보다도 낮습니다. `
      + (it.rho != null && it.rho >= 0.7
        ? `이유는 <b>두 자산이 거의 같이 움직이기 때문</b>입니다. 같이 움직이는 정도가 <b>${f1(it.rho, 2)}</b>(1이면 완전히 같이 움직임)라, "더 떨어진 하나로 판정한다"는 조건이 있어도 실제로 손해 볼 일이 거의 없습니다. 여기에 원금 지키는 선도 <b>${it.knockIn ?? it.maturityBarrier}%</b>로 아주 낮게 잡혀 있습니다.`
        : `원금 지키는 선이 <b>${it.knockIn ?? it.maturityBarrier}%</b>로 아주 낮게 잡혀 있어, 많이 출렁여도 거기까지 내려가려면 한참 남았습니다.`)
    : `그래서 손실 확률도 <b>${f1(it.mcLoss, 1)}%</b>로 지수형 평균(${f1(idxAvg, 1)}%)보다 <b>높습니다.</b> `
      + `그런데도 이 자리에 올린 이유는 안전해서가 아니라 <b>그 위험을 지는 대가를 그만큼 많이 주기 때문</b>입니다. `
      + `손실 확률 1%마다 연 <b>${f1(perRisk(it), 2)}%</b>를 주는데, 이번 주 지수형은 평균 ${f1(idxPerRisk, 2)}%입니다. `
      + `바꿔 말하면 이만한 수익을 지수형에서 받으려면 위험을 <b>${f1(perRisk(it) / idxPerRisk, 1)}배</b> 져야 합니다. `
      + `원금을 지키는 게 제일 중요한 분께는 이 상품 말고 <b>1번 카드</b>를 권해 주십시오.`;

  return `<p class="defend">${head}${body}</p>`;
};

const card = (slot, i) => {
  const it = slot.pick;
  return `      <article class="rec">
        <div class="recno">${i + 1}</div>
        <div class="rechead">
          <p class="reclabel">${slot.label}</p>
          <h3>제${it.no}회 ${tierChip(it)}${it.currency !== 'KRW' ? `<span class="tier fx">${it.currency}</span>` : ''}</h3>
          <p class="recund">${esc(it.underlyings.join(' · '))} <span class="sep">·</span> ${kindOf(it)}형 <span class="sep">·</span> ${it.months}개월</p>
        </div>
        <div class="recrate">
          <span class="rlabel">잘 되면 연 수익률</span>
          <span class="rnum">${f1(it.annualRate, 1)}<span class="pct">%</span></span>
          <span class="rsub">${baseOf(it)} → 빠르면 ${it.every}개월 뒤 ${money(it, it.schedule[0].payout)}</span>
        </div>
        <ul class="how">
          <li><span class="hk">무엇을 보나</span><span>${judgeLine(it)}</span></li>
          <li><span class="hk">언제 끝나나</span><span>${earlyLine(it)}</span></li>
          <li><span class="hk">원금 지키기</span><span>${floorLine(it)}</span></li>
          <li><span class="hk">손해 나는 때</span><span>${lossLine(it)}</span></li>
        </ul>
        ${stairs(it)}
        ${probBar(it)}
        <div class="recfoot">
          <div class="rf"><span>A. 발행사 ${it.simYearsWhole}년 백테스트</span><b>${f1(it.simLoss, 2)}%</b><small>${it.simRuns?.toLocaleString('ko-KR')}번 중 ${Math.round((it.simLoss ?? 0) / 100 * (it.simRuns ?? 0))}번 · 이익 ${f1(it.simWin, 2)}%</small></div>
          <div class="rf"><span>B. 같은 조건 시뮬레이션 손실</span><b>${f1(it.mcLoss, 1)}%</b><small>${items.length}종 평균 ${f1(mcAvgAll, 1)}% · ${rankLabel(it)}</small></div>
          <div class="rf"><span>${baseOf(it)}의 실제 값어치</span><b>${money(it, it.fairValue / 100)}</b><small>제값보다 ${sgn(it.fairValueGap, 2)}%</small></div>
          <div class="rf"><span>가격 출렁임</span><b>${f1(it.vmax, 1)}%</b><small>${it.rho != null ? `둘이 같이 움직임 ${f1(it.rho, 2)}` : '기준 자산 하나'} · ${covLabel(it)} 최저 ${f1(it.low, 0)}%</small></div>
        </div>
        <p class="recwhy"><b>추천 이유</b> ${slot.why}${it.currency !== 'KRW'
          ? ` <b>${it.currency}</b>로 투자하고 ${it.currency}로 돌려받는 상품이라, 위 수익률에 환율 변동이 그대로 더해지거나 빠집니다.` : ''}</p>
        ${defenceLine(it)}
      </article>`;
};

const rows = [...items].sort((a, b) => (a.mcLoss ?? 99) - (b.mcLoss ?? 99)).map((it) => `          <tr>
            <td class="code">제${it.no}회</td>
            <td class="und">${esc(it.underlyings.join(' · '))}${it.currency !== 'KRW' ? ` <span class="fxs">${it.currency}</span>` : ''} <span class="kind k${KINDS.indexOf(kindOf(it))}">${kindOf(it)}</span></td>
            <td class="num rate">${f1(it.annualRate, 1)}%</td>
            <td class="num nw">${it.every}개월<span class="slash">/</span>${it.barriers[0]}%</td>
            <td class="num">${it.floor}%${it.knockIn == null ? '<span class="nk">만기만</span>' : ''}</td>
            <td class="num">${f1(it.vmax, 1)}%</td>
            <td class="num ${['', 'warn', 'bad'][it.tier]}"><b>${f1(it.mcLoss, 1)}%</b>${tierChip(it)}</td>
            <td class="num ${it.simShort ? 'bad' : ''}">${f1(it.simLoss, 2)}%<small class="sn">${it.simShort ? f1(it.simYears) : it.simYearsWhole}년</small></td>
            <td class="num ${(it.fairValueGap ?? 0) <= -10 ? 'bad' : (it.fairValueGap ?? 0) <= -5 ? 'warn' : ''}">${money(it, it.fairValue / 100)}</td>
          </tr>`).join('\n');

// ── 쿠폰과 위험 ──────────────────────────────────────────────────────────────
const { rho: CR, pairs: CP, reg: CG, eff: CE, why: CW, sens: CS } = coupon;
const pp = (o) => (o.p < 0.001 ? '0.1% 미만' : `${f1(o.p * 100, 1)}%`);
const rhoCell = (o) => `<td class="num"><b>${f1(o.r, 2)}</b><small class="sn">우연일 확률 ${pp(o)}${o.sig ? '' : ' · 우연일 수도'}</small></td>`;
const rhoRow = (label, k, hi) => `        <tr><td>${hi ? `<b>${label}</b>` : label}</td>`
  + rhoCell(CR[k].all) + rhoCell(CR[k].fair) + '</tr>';
const eff1 = (it) => f1(CE.ratio(it), 2);
const avgLossOf = (kind) => {
  const g = items.filter((i) => kindOf(i) === kind && i.mcAvgLoss != null);
  return g.length ? Math.abs(g.reduce((s, i) => s + i.mcAvgLoss, 0) / g.length) : null;
};
const sensRow = (f) => CS.rows.map((r) => `<td class="num">${f(r)}</td>`).join('');

const cautionCards = caution.map((it) => `        <div class="cau">
          <h4>제${it.no}회 <span class="cund">${esc(it.underlyings.join(' · '))}</span> <span class="crate">연 ${f1(it.annualRate, 1)}%</span></h4>
          <ul>${cautionReason(it).map((r) => `<li>${r}</li>`).join('')}</ul>
        </div>`).join('\n');

// ── 문서 ─────────────────────────────────────────────────────────────────────
const html = `<title>ELS 주간 제안서</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --orange:#F58220; --orange-a:#CB6015; --soft:#FAB072; --blue:#043B72;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --faint:#84888B;
  --hair:#CDCECB; --hair-s:#E5E4E1; --surf:#F7F8FA; --tint:#ECEFF4; --paper:#FFFFFF;
  --ok:#2E8540; --warn:#D4A017; --bad:#C62828;
  --kr:'Noto Sans KR','Spoqa Han Sans Neo','Malgun Gothic',sans-serif;
  --num:'Inter','Noto Sans KR',sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--body);font-family:var(--kr);font-size:17px;line-height:1.65;
  word-break:keep-all;-webkit-font-smoothing:antialiased}
.num,.rnum,table td.num,.stv{font-family:var(--num);font-variant-numeric:tabular-nums}
h1,h2,h3,h4{color:var(--ink);margin:0;text-wrap:balance}
b{font-weight:700;color:var(--ink)}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}

/* ── 표지 ─────────────────────────────────────── */
.mast{background:var(--orange);color:#fff;padding:40px 0 34px;margin-bottom:44px}
.mast .wrap{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between}
.mast .tag{font-family:var(--num);font-size:13px;letter-spacing:1.4px;font-weight:600;opacity:.9;margin:0 0 8px}
.mast h1{color:#fff;font-size:38px;font-weight:700;line-height:1.18;letter-spacing:-.5px}
.mast .sub{margin:10px 0 0;font-size:17px;opacity:.94}
.offer{background:#fff;color:var(--ink);padding:14px 20px;min-width:236px}
.offer dt{font-size:13px;color:var(--muted);letter-spacing:.4px;margin-bottom:2px}
.offer dd{margin:0 0 10px;font-family:var(--num);font-size:19px;font-weight:600;color:var(--ink)}
.offer dd:last-child{margin-bottom:0}
.offer dd.hi{color:var(--orange-a);font-size:20px}
.offer dd.sm{font-size:16px;font-weight:500;color:var(--body)}
.offer .note{display:block;font-family:var(--kr);font-size:12px;font-weight:400;color:var(--faint);margin-top:1px}

/* ── 확인 시각 띠 ──────────────────────────────── */
.asof{display:grid;grid-template-columns:88px minmax(0,1fr);gap:4px 16px;align-items:baseline;
  border:1px solid var(--hair);border-left:3px solid var(--blue);background:var(--surf);
  padding:14px 18px;margin:0 0 40px}
.asof.before{border-left-color:var(--warn)}
.asof.after{border-left-color:var(--bad)}
.asofk{grid-row:span 2;margin:0;align-self:start;font-size:13px;font-weight:600;letter-spacing:.4px;color:var(--faint)}
.asofv{margin:0;font-size:15px;color:var(--body);font-variant-numeric:tabular-nums}
.asofn{margin:0;font-size:15px;color:var(--ink)}
.asof b{font-weight:700}

/* ── 청약 일정 ─────────────────────────────────── */
.steps{list-style:none;padding:0;margin:0 0 16px;display:grid;gap:1px;background:var(--hair);
  border:1px solid var(--hair)}
.steps li{background:var(--paper);display:grid;grid-template-columns:64px 140px 190px minmax(0,1fr) 108px;
  gap:14px;align-items:center;padding:13px 18px}
.steps li.stop{background:#FDF6F6}
.steps li.go{background:#F4F8F5}
.sk{font-family:var(--num);font-size:12px;font-weight:600;color:var(--faint);letter-spacing:.4px}
.steps b{font-size:17px}
.sd{font-family:var(--num);font-size:16px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.ss{font-size:14px;color:var(--muted)}
.stag{font-size:13px;font-weight:500;text-align:center;padding:3px 0;color:var(--faint)}
.stag.ok{background:var(--ok);color:#fff}
.stag.no{background:var(--bad);color:#fff}
.tlnote{margin:0 0 10px;padding:14px 16px;background:var(--tint);border-left:3px solid var(--blue);font-size:15px;line-height:1.6}
.tlsub{margin:0;font-size:14px;color:var(--faint)}
.chk.warnbox{border-left:3px solid var(--bad);background:#FDF6F6}

/* ── 섹션 ─────────────────────────────────────── */
section{margin-bottom:56px}
.rule{height:1px;background:var(--orange);margin-bottom:16px}
.stitle{font-size:25px;font-weight:700;letter-spacing:-.2px}
.slead{margin:8px 0 26px;color:var(--muted);font-size:16px;max-width:74ch}
.sub3{font-size:20px;font-weight:700;margin:38px 0 0;padding-top:22px;border-top:1px solid var(--hair-s)}
.slead2{margin:6px 0 18px;color:var(--muted);font-size:16px;max-width:74ch}

/* ── 두 가지 측정법 ────────────────────────────── */
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1px;background:var(--hair);
  border:1px solid var(--hair);margin-bottom:16px}
.mth{background:var(--paper);padding:20px 22px;min-width:0}
.mth p{margin:0 0 10px;font-size:15px;line-height:1.6}
.mth p:last-child{margin-bottom:0}
.mk{font-size:17px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mine{font-family:var(--kr);font-size:12px;font-weight:500;background:var(--blue);color:#fff;padding:2px 7px;letter-spacing:.3px}
.mq{color:var(--orange-a);font-weight:500;font-size:16px !important}
.mnote{margin:0 0 8px;padding:13px 16px;background:var(--tint);border-left:3px solid var(--blue);font-size:15px}
.kt td:first-child,.kt th:first-child{white-space:nowrap}
.kind{font-family:var(--kr);font-size:12px;padding:2px 7px;white-space:nowrap}
.k0{background:var(--tint);color:var(--blue)}
.k1{background:#FDF0E2;color:var(--orange-a)}
.k2{background:#FBE9E9;color:var(--bad)}
.sn{display:block;font-size:11px;color:var(--faint);font-weight:400;margin-top:1px}

/* ── 이익/손실 띠 ──────────────────────────────── */
.pbar{display:flex;height:26px;margin:0 0 6px;border:1px solid var(--hair);min-width:0;overflow:hidden}
.pw{background:var(--tint);display:grid;place-items:center;min-width:0}
.pw span{font-size:12px;font-weight:600;color:var(--blue);white-space:nowrap}
.pl{background:var(--bad);min-width:2px}
.pnote{margin:0 0 4px;font-size:13px;color:var(--muted)}
.defend{margin:12px 0 0;padding:14px 16px;background:var(--surf);border-left:3px solid var(--orange);font-size:15px;line-height:1.6}

/* ── 요약 카드 ─────────────────────────────────── */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1px;background:var(--hair);
  border:1px solid var(--hair);margin-bottom:26px}
.stat{background:var(--paper);padding:18px 20px}
.stat span{display:block;font-size:14px;color:var(--muted);letter-spacing:.4px}
.stat b{display:block;font-family:var(--num);font-size:31px;font-weight:700;line-height:1.15;margin-top:5px;color:var(--blue)}
.stat small{display:block;font-size:14px;color:var(--faint);margin-top:4px}
.keys{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.keys li{padding-left:18px;position:relative;font-size:17px}
.keys li::before{content:'';position:absolute;left:0;top:11px;width:8px;height:2px;background:var(--orange)}

/* ── 추천 카드 ─────────────────────────────────── */
.recs{display:grid;grid-template-columns:minmax(0,1fr);gap:24px}
.rec{border:1px solid var(--hair);border-top:3px solid var(--orange);padding:24px 26px 22px;position:relative;
  min-width:0;break-inside:avoid}
.recno{position:absolute;top:-3px;right:0;background:var(--orange);color:#fff;font-family:var(--num);
  font-size:15px;font-weight:700;width:30px;height:28px;display:grid;place-items:center}
.rechead{margin-bottom:16px}
.reclabel{margin:0 0 6px;font-size:14px;font-weight:500;color:var(--orange-a);letter-spacing:.4px}
.rec h3{font-size:24px;font-weight:700;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.recund{margin:6px 0 0;color:var(--muted);font-size:16px}
.sep{color:var(--hair)}
.tier{font-family:var(--kr);font-size:13px;font-weight:500;padding:3px 9px;border-radius:2px;letter-spacing:.3px}
.t0{background:#E7F1E9;color:var(--ok)}
.t1{background:#FBF2DC;color:#8A6A0B}
.t2{background:#FAE7E7;color:var(--bad)}
.fx{background:var(--tint);color:var(--blue)}
.recrate{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;padding:14px 0 16px;border-top:1px solid var(--hair-s);
  border-bottom:1px solid var(--hair-s)}
.rlabel{font-size:14px;color:var(--muted);letter-spacing:.5px}
.rnum{font-size:46px;font-weight:700;color:var(--orange);line-height:1}
.rnum .pct{font-size:26px;margin-left:2px}
.rsub{font-size:16px;color:var(--body);margin-left:auto}
.how{list-style:none;padding:0;margin:18px 0 20px;display:grid;gap:10px}
.how li{display:grid;grid-template-columns:92px minmax(0,1fr);gap:12px;align-items:baseline;font-size:16px}
.hk{font-size:13px;font-weight:500;color:#fff;background:var(--blue);padding:2px 0;text-align:center;
  letter-spacing:.5px;align-self:start;line-height:1.6}
.stcap{margin:0;padding-top:14px;border-top:1px dashed var(--hair);font-size:13px;color:var(--muted)}
.stairs{display:flex;align-items:flex-end;gap:6px;padding:8px 0 4px;min-width:0;overflow-x:auto}
.st{flex:1 1 0;min-width:44px;display:flex;flex-direction:column;align-items:center;gap:4px}
.stbar{width:100%;background:var(--soft);border-top:2px solid var(--orange)}
.stv{font-size:13px;font-weight:600;color:var(--ink)}
.stn{font-family:var(--num);font-size:11px;color:var(--faint)}
.recfoot{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--hair-s);
  border:1px solid var(--hair-s);margin-top:16px}
.rf{background:var(--surf);padding:12px 14px}
.rf span{display:block;font-size:13px;color:var(--muted)}
.rf b{display:block;font-family:var(--num);font-size:20px;margin-top:2px}
.rf small{display:block;font-size:13px;color:var(--faint);margin-top:2px}
.recwhy{margin:16px 0 0;font-size:16px;background:var(--tint);padding:12px 16px;border-left:3px solid var(--blue)}

/* ── 표 ───────────────────────────────────────── */
/* 열이 11개라 헤더를 한 줄로 두면 데스크탑에서도 가로 스크롤이 난다.
   머리글은 두 줄까지 접고, 종류·등급은 각각 기초자산·손실확률 칸에 넣어 열을 줄였다. */
.tw{overflow-x:auto;border:1px solid var(--hair)}
table{border-collapse:collapse;width:100%;font-size:14px;table-layout:auto}
th{background:var(--soft);color:var(--ink);font-weight:700;text-align:left;padding:9px 9px;
  white-space:normal;line-height:1.3;border-bottom:1px solid var(--hair);vertical-align:bottom}
th.num,td.num{text-align:right}
td{padding:9px 9px;border-bottom:1px solid var(--hair-s);white-space:nowrap;vertical-align:middle}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surf)}
.code{font-family:var(--num);font-weight:600;color:var(--ink)}
.und{white-space:normal;min-width:172px;line-height:1.4}
td.nw{white-space:nowrap}
/* 좁은 화면에서는 어떤 배치로도 9열이 들어가지 않는다. 그때만 스크롤을 허용한다. */
@media (min-width:1000px){ .tw{overflow-x:visible} }
@media (max-width:999px){ table{min-width:860px} }
.nk{font-size:12px;color:var(--blue);background:var(--tint);padding:1px 5px;margin-left:5px;white-space:nowrap}
.rate{font-weight:700;color:var(--orange-a)}
.fxs{font-family:var(--num);font-size:12px;color:var(--blue);background:var(--tint);padding:1px 5px}
td.warn{color:#8A6A0B}
td.bad{color:var(--bad);font-weight:600}
.tnote{margin:10px 0 0;font-size:14px;color:var(--faint)}
/* 말 풀이 — 뜻풀이 칸은 길어서 접혀야 한다 (표 전역 nowrap 을 여기서만 푼다) */
.gl td{white-space:normal;line-height:1.5;vertical-align:top}
.gl td:first-child{font-weight:700;color:var(--ink);white-space:normal;min-width:118px}
.gl td:nth-child(2){color:var(--orange-a);font-weight:500;min-width:118px}
.gl th:nth-child(3){width:52%}
td .tier{margin-left:6px;font-size:11px;padding:2px 6px;vertical-align:1px}
.slash{color:var(--hair);margin:0 3px}

/* ── 주의 ─────────────────────────────────────── */
.caus{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
.cau{border:1px solid var(--hair);border-left:3px solid var(--bad);padding:16px 18px;break-inside:avoid}
.cau h4{font-size:18px;font-weight:700;display:flex;gap:8px;flex-wrap:wrap;align-items:baseline}
.cund{font-size:15px;font-weight:400;color:var(--muted)}
.crate{font-family:var(--num);font-size:15px;color:var(--orange-a);margin-left:auto}
.cau ul{margin:10px 0 0;padding-left:17px;display:grid;gap:6px;font-size:15px}

/* ── 확인 사항 ─────────────────────────────────── */
.checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1px;background:var(--hair);
  border:1px solid var(--hair)}
.chk{background:var(--paper);padding:18px 20px;break-inside:avoid}
.chk h4{font-size:17px;font-weight:700;margin-bottom:6px}
.chk p{margin:0;font-size:15px;color:var(--body)}
.script{border:1px solid var(--hair);border-top:3px solid var(--blue);padding:20px 24px;margin-top:26px}
.script h4{font-size:18px;margin-bottom:12px}
.script ol{margin:0;padding-left:20px;display:grid;gap:9px;font-size:16px}
.qa{margin:16px 0 0;padding:14px 16px;background:var(--tint);border-left:3px solid var(--orange);font-size:15px;line-height:1.6}

footer{border-top:1px solid var(--hair);margin-top:56px;padding:22px 0 46px;font-size:14px;color:var(--faint)}
footer p{margin:0 0 5px}
footer a{color:var(--muted)}

@media (max-width:760px){
  body{font-size:16px}
  .wrap{padding:0 18px}
  .mast h1{font-size:29px}
  .mast .wrap{align-items:stretch}
  .offer{min-width:0}
  .stitle{font-size:22px}
  .rec{padding:20px 18px}
  .rnum{font-size:38px}
  .rsub{margin-left:0;flex-basis:100%}
  .how li{grid-template-columns:1fr;gap:3px}
  .hk{justify-self:start;padding:2px 10px}
  .steps li{grid-template-columns:minmax(0,1fr);gap:4px;padding:12px 14px}
  .stag{justify-self:start;padding:3px 10px}
  .asof{grid-template-columns:minmax(0,1fr);padding:12px 14px;margin-bottom:32px}
  .asofk{grid-row:auto}
  .two{grid-template-columns:minmax(0,1fr)}
  .mth{padding:16px 16px}
  .sub3{font-size:18px}
  .defend,.mnote,.qa{padding:12px 13px;font-size:14px}
  section{margin-bottom:44px}
}
@media print{
  .steps,.steps li,.tlnote{break-inside:avoid}
  .steps li{padding:6px 10px;grid-template-columns:52px 108px 150px minmax(0,1fr) 88px;gap:9px}
  .steps b{font-size:10pt}
  .sd{font-size:10pt}
  .ss,.stag,.tlnote,.tlsub{font-size:8.5pt}
  .asof{margin-bottom:14px;padding:8px 12px;background:none;break-inside:avoid}
  .asofv,.asofn{font-size:9.5pt}
  .two,.mth,.defend,.mnote,.qa,.pbar{break-inside:avoid}
  .mth p,.defend,.mnote,.qa{font-size:9pt;line-height:1.4}
  .mth{padding:10px 12px}
  .defend,.mnote,.qa{padding:8px 10px}
  .sub3{font-size:12pt;margin-top:16px;padding-top:10px}
  /* 웹의 넉넉한 항목 간격을 인쇄에서 그대로 쓰면 절이 쪽을 조금씩 넘어간다.
     넘어간 꼬리 뒤에는 쪼개지지 않는 추천 카드가 오므로 그 쪽이 통째로 빈다. */
  .keys{gap:7px}
  .keys li{font-size:9.5pt}
  .keys li::before{top:8px}
  .pbar{height:16px}
  .pnote{font-size:8.5pt}
  body{font-size:10pt;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .wrap{max-width:100%;padding:0}
  .mast{padding:16px 0 14px;margin-bottom:18px}
  .mast h1{font-size:24pt}
  .mast .sub,.offer dd{font-size:10pt}
  section{margin-bottom:16px}
  .stitle{font-size:15pt}
  .slead{margin-bottom:12px;font-size:9.5pt}
  .stat b{font-size:19pt}
  /* 강제 개쪽을 걸면 앞쪽 꼬리가 통째로 빈다. 절은 흐르게 두고, 쪼개지면 안 되는
     덩어리(추천 카드·주의 카드·확인사항)에만 break-inside 를 건다. */
  .page-break{break-before:auto}
  .rec,.cau,.chk,.script{break-inside:avoid}
  h2,h3,h4,.stitle,.sub3,.slead,.slead2{break-after:avoid}
  .recs{gap:10px}
  .rec{padding:11px 13px}
  .rec h3{font-size:13pt}
  .recund,.rsub{font-size:9pt}
  .rnum{font-size:22pt}
  .rnum .pct{font-size:13pt}
  .recrate{padding:8px 0 9px}
  .how{margin:9px 0 10px;gap:5px}
  .how li{font-size:9pt}
  .stcap,.stn,.pnote{font-size:8pt}
  .stairs{padding:4px 0 2px}
  .st{min-width:0}
  .stv{font-size:8.5pt}
  /* 인쇄 폭에서는 3열로 접혀 넷째 칸 옆이 통째로 빈다. 2x2 로 고정한다. */
  .recfoot{gap:1px;grid-template-columns:repeat(2,minmax(0,1fr))}
  .rf{padding:7px 9px}
  .rf b{font-size:11pt}
  .rf span,.rf small{font-size:8pt}
  .recwhy{margin-top:8px;font-size:9pt;padding:8px 10px}
  /* 17행짜리 표는 쪼개지게 두되 머리글은 쪽마다 다시 그린다 */
  table{font-size:8.5pt;min-width:0}
  thead{display:table-header-group}
  tr{break-inside:avoid}
  th,td{padding:4px 6px}
  .tw{overflow:visible}
  .caus,.checks{gap:10px}
  footer{margin-top:18px;padding:12px 0 0;font-size:8.5pt}
  a{text-decoration:none}
}
</style>

<header class="mast">
  <div class="wrap">
    <div>
      <p class="tag">MIRAE ASSET · ELS WEEKLY</p>
      <h1>제${items[0].no}~${items[items.length - 1].no}회 ELS 제안서</h1>
      <p class="sub">투자설명서(일괄신고추가서류) ${filedOn} 공시 원문 기준 · 전 ${items.length}종 분석</p>
    </div>
    <dl class="offer">
      <dt>개인 일반투자자 청약</dt><dd class="hi">${offerFrom} ~ ${retailEnd}</dd>
      <dt>전체 청약기간</dt><dd class="sm">${offerFrom} ~ ${offerTo}<span class="note">숙려 대상 아닌 경우</span></dd>
      <dt>발행일 / 만기</dt><dd class="sm">${dot(head.issueDate)} / ${dot(head.maturityDate)}</dd>
    </dl>
  </div>
</header>

<main class="wrap">

<div class="asof ${phase}">
  <p class="asofk">홈페이지 확인</p>
  <p class="asofv">${stamp(checkedAt) || '–'} 기준 · 미래에셋증권 ELS/DLS 캘린더에 <b>청약 진행중 ${onOfferNow == null ? '–' : `${onOfferNow}건`}</b></p>
  <p class="asofn">${phaseLine}</p>
</div>

${plan.hasCooling ? `<section class="tl">
  <div class="rule"></div>
  <h2 class="stitle">언제까지 청약해야 하나</h2>
  <p class="slead">홈페이지와 공시 표지에 적힌 청약기간은 <b>${offerFrom} ~ ${offerTo}</b>입니다. 그런데 개인 일반투자자는 그 뒤쪽 절반을 쓸 수 없습니다. 숙려기간과 가입의사확인기간에는 청약 자체가 불가능하기 때문입니다.</p>
  <ol class="steps">
    <li class="go">
      <span class="sk">1단계</span>
      <b>청약 접수</b>
      <span class="sd">${dot(plan.coolStart)} ~ ${dot(plan.coolEnd)}</span>
      <span class="ss">${dayLabel(dot(plan.coolStart))}~${dayLabel(dot(plan.coolEnd))} · ${plan.retailDays}일</span>
      <span class="stag ok">이때만 주문 가능</span>
    </li>
    <li class="stop">
      <span class="sk">2단계</span>
      <b>숙려기간</b>
      <span class="sd">${dot(plan.coolingFrom)} ~ ${dot(plan.coolingTo)}</span>
      <span class="ss">2영업일 이상 · 이 기간에 최대 원금손실 가능금액을 고지받습니다</span>
      <span class="stag no">청약 불가</span>
    </li>
    <li class="stop">
      <span class="sk">3단계</span>
      <b>가입의사 확인</b>
      <span class="sd">${dot(plan.confirmBy)}</span>
      <span class="ss">${esc(plan.confirmNote || '')} · 확인을 못 받으면 청약금은 환불됩니다</span>
      <span class="stag no">청약 불가</span>
    </li>
    <li>
      <span class="sk">4단계</span>
      <b>발행</b>
      <span class="sd">${dot(plan.payDate)}</span>
      <span class="ss">납입 · 배정 · 환불 · 최초기준가격 평가</span>
      <span class="stag">–</span>
    </li>
  </ol>
  <p class="tlnote"><b>상담에서 이렇게 말씀하십시오</b> — "청약은 <b>${dayLabel(retailEnd)}까지</b> 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 숙려기간이라 주문을 받을 수 없고, 숙려기간이 끝나면 저희가 다시 연락드려 최종 의사를 확인합니다. 그때 확인이 안 되면 청약이 집행되지 않습니다."</p>
  <p class="tlsub">전문투자자·법인 등 숙려제도 대상이 아닌 경우에만 ${offerTo}까지 청약할 수 있습니다. 만 65세 이상 고령투자자는 별도 확인 절차가 더해질 수 있습니다.</p>
</section>` : ''}

<section>
  <div class="rule"></div>
  <h2 class="stitle">이번 주 상품, 한눈에</h2>
  <p class="slead">이번 주에 파는 ${items.length}종을 <b>조건 · 값어치 · 손해 볼 가능성</b> 세 가지로 나눠 봤습니다. 조건과 값어치는 투자설명서에 적힌 그대로이고, 손해 볼 가능성은 두 가지 방법으로 각각 쟀습니다(다음 절에서 설명).</p>
  <div class="stats">
    <div class="stat"><span>상품 수</span><b>${items.length}종</b><small>지수만 ${items.filter((i) => kindOf(i) === '지수').length} · 섞임 ${items.filter((i) => kindOf(i) === '혼합').length} · 개별 종목 ${items.filter((i) => kindOf(i) === '종목').length}</small></div>
    <div class="stat"><span>잘 되면 연 수익률</span><b>${f1(rateMin, 1)}~${f1(rateMax, 1)}%</b><small>제일 높은 건 제${items.find((i) => i.annualRate === rateMax).no}회</small></div>
    <div class="stat"><span>돈이 묶이는 기간</span><b>최장 ${head.months}개월</b><small>${dot(head.maturityDate)}까지 · 중간에 끝날 수 있음</small></div>
    <div class="stat"><span>이 문서가 매긴 등급</span><b>${tierCount[0]} / ${tierCount[1]} / ${tierCount[2]}</b><small>방어적 / 중간 / 공격적</small></div>
  </div>
  <ul class="keys">
    <li>${items.length}종 <b>전부 원금을 잃을 수 있는 상품</b>이고, 위험 등급도 가장 높은 1등급(매우높은위험)입니다. 이 문서가 붙인 방어적·중간·공격적은 안전하다는 뜻이 아니라 <b>${items.length}종끼리 줄을 세운 순서</b>일 뿐입니다.</li>
    <li>같은 1만원을 넣어도 <b>상품마다 실제 값어치가 다릅니다.</b> 가장 좋은 제${gapBest.no}회는 ${money(gapBest, gapBest.fairValue / 100)}, 가장 나쁜 제${gapWorst.no}회는 ${money(gapWorst, gapWorst.fairValue / 100)}입니다. 나머지는 회사 몫으로 빠지는 비용인데, <b>이 차이는 홈페이지 상품 목록에 나오지 않습니다.</b></li>
    <li>회사가 값을 매길 때 잡은 <b>가격 출렁임</b>은 ${vols.slice(0, 2).map(([a, v]) => `<b>${esc(a)} ${f1(v, 0)}%</b>`).join(', ')} 순으로 큽니다. 많이 출렁일수록 받는 수익률도 높지만, 그만큼 <b>아래로도 크게 빠질 수 있다</b>는 뜻입니다.</li>
  </ul>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">손해 볼 가능성, 두 가지로 쟀습니다</h2>
  <p class="slead">이 문서에는 "손해 볼 가능성"이 두 개 나옵니다. 서로 다른 질문에 답하는 숫자라 값도 꽤 다릅니다. <b>하나만 보고 말씀드리면 틀린 안내가 됩니다.</b></p>

  <div class="two">
    <div class="mth">
      <p class="mk">A. 발행사 ${head.simYearsWhole}년 백테스트</p>
      <p class="mq">"지난 ${head.simYearsWhole}년이 그대로 되풀이된다면?"</p>
      <p>투자설명서에 실려 있는 표입니다. ${dot(head.simRange?.from ?? '')}부터 ${dot(head.simRange?.to ?? '')}까지 <b>매일 하루도 빠짐없이 이 상품에 가입했다고 치고</b> 끝까지 돌려본 결과입니다. 제${head.no}회는 ${head.simRuns?.toLocaleString('ko-KR')}번을 돌렸습니다.</p>
      <p><b>좋은 점</b> 지어낸 값이 아니라 <b>실제로 있었던 가격</b>입니다. 2008년 금융위기도 들어 있습니다.</p>
      <p><b>조심할 점</b> 그 ${head.simYearsWhole}년은 대체로 오르는 장이었습니다. 게다가 <b>상품마다 돌려본 기간이 다릅니다</b> — 늦게 상장한 종목이 끼면 기간이 짧아지고, 그 짧은 기간에 폭락이 없었으면 손실이 실제보다 낮게 나옵니다. 기간이 다른 두 상품의 이 숫자를 나란히 놓고 비교하면 안 됩니다.</p>
    </div>
    <div class="mth">
      <p class="mk">B. 같은 조건 시뮬레이션 <span class="mine">직접 계산</span></p>
      <p class="mq">"회사가 값 매길 때 잡은 만큼 실제로 출렁인다면?"</p>
      <p>${items.length}종 전부를 <b>똑같은 횟수(${MC.paths.toLocaleString('ko-KR')}번)·똑같은 기간·똑같은 규칙</b>으로 돌렸습니다. 얼마나 출렁이는지, 두 자산이 얼마나 같이 움직이는지는 지어내지 않고 <b>투자설명서에 적힌 값</b>을 그대로 넣었습니다.</p>
      <p><b>좋은 점</b> 기간 차이가 없어져서 ${items.length}종을 <b>공평하게 줄 세울 수</b> 있습니다.</p>
      <p><b>조심할 점</b> 어느 자산도 오른다고 보지 않았고(본전에서 출발), 회사가 쓴 출렁임 수치는 시장이 미리 걱정해서 얹어 놓은 값이라 <b>실제보다 크게 잡히는 게 보통</b>입니다. 그래서 이 숫자는 <b>넉넉하게 잡은 최대치</b>로 읽으셔야 합니다.</p>
    </div>
  </div>
  <p class="mnote"><b>읽는 법</b> — 진짜 값은 A와 B <b>사이 어딘가</b>입니다. 상품끼리 견줄 때는 B를, "그래서 얼마나 위험하냐"를 가늠할 때는 A와 B를 같이 보십시오. 참고로 "자산이 해마다 6%씩 오른다"고 바꿔서 다시 돌려봐도 <b>순서는 거의 그대로</b>였습니다.</p>

  <h3 class="sub3">그래서, 개별 종목이 섞이면 더 위험한가</h3>
  <p class="slead2">보통 개별 종목이 들어간 ELS가 지수만 담은 것보다 위험하다고 봅니다. 이번 주 상품에서 그 말이 맞는지 B로 확인해 봤습니다.</p>
  <div class="tw">
    <table class="kt">
      <thead><tr><th>기초자산 종류</th><th class="num">상품 수</th><th class="num">가격 출렁임<br>(평균)</th><th class="num">손해 볼 가능성<br>(평균)</th><th class="num">가장 낮음~높음</th><th class="num">연 수익률<br>(평균)</th></tr></thead>
      <tbody>
${byKind.map((r) => `        <tr><td><b>${r.key}형</b></td><td class="num">${r.n}종</td><td class="num">${f1(r.vol, 1)}%</td><td class="num ${r.key === '종목' ? 'bad' : r.key === '혼합' ? 'warn' : ''}"><b>${f1(r.loss, 1)}%</b></td><td class="num">${f1(r.lo, 1)} ~ ${f1(r.hi, 1)}%</td><td class="num">${f1(r.rate, 1)}%</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
  <ul class="keys">
    <li><b>평균으로 보면 맞는 말입니다.</b> 개별 종목만 담은 상품이 손해 볼 가능성이 지수만 담은 것의 <b>${f1(kindRatio, 1)}배</b>입니다. 가격 출렁임도 ${f1(byKind.find((r) => r.key === '지수')?.vol, 0)}% 대 ${f1(byKind.find((r) => r.key === '종목')?.vol, 0)}%로 확연히 갈립니다. 자산 종류부터 보는 관행에는 근거가 있습니다.</li>
    <li><b>그런데 상품 하나하나로 내려가면 뒤집힙니다.</b> 지수만 담은 제${idxWorst.no}회(${esc(idxWorst.underlyings.join('·'))})가 ${f1(idxWorst.mcLoss, 1)}%로, 종목이 섞인 상품 대부분보다 오히려 위험합니다. 반대로 제${stockBest.no}회(${esc(stockBest.underlyings.join('·'))})는 ${f1(stockBest.mcLoss, 1)}%로 ${items.length}종 중 ${safest.findIndex((i) => i.no === stockBest.no) + 1}번째로 낮습니다.</li>
    <li><b>실제로 갈라놓은 건 자산 종류가 아니라 두 가지였습니다.</b> 첫째, <b>원금 지키는 선이 얼마나 아래에 있는가</b> — 제${idxWorst.no}회는 그 선이 ${idxWorst.knockIn}%로 이번 주에서 가장 높아, 조금만 빠져도 닿습니다. 둘째, <b>두 자산이 얼마나 같이 움직이는가</b> — 따로 노는 자산끼리 묶으면 "둘 중 더 나쁜 쪽"으로 판정하는 구조에서 훨씬 불리해집니다. 이 값이 제${idxWorst.no}회는 ${f1(idxWorst.rho, 2)}, 제${stockBest.no}회는 ${f1(stockBest.rho, 2)}입니다(1이면 완전히 같이 움직임).</li>
    <li><b>그래서 이 문서는 자산 종류로 거르지 않고, B의 손해 볼 가능성만 보고 등급을 매겼습니다.</b> 대신 개별 종목이 섞인 상품을 권할 때는 <b>왜 관행을 거스르는지</b>를 카드마다 적어 두었습니다. 고객이 "종목이 들어갔는데 안전하다고요?" 하시면 그 문장을 그대로 읽으시면 됩니다.</li>
  </ul>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">수익률이 높으면 그만큼 위험한가</h2>
  <p class="slead">"수익률이 높으면 그만큼 위험한 것 아니냐"는 질문을 자주 받습니다. <b>맞는 말씀입니다.</b> 다만 <b>정확히 비례하지는 않고</b>, 그 어긋나는 자리가 바로 상품을 고르는 자리입니다. 이번 주 ${coupon.n}종으로 직접 확인했습니다.</p>

  <p class="mnote"><b>왜 그런가</b> — ELS의 수익률은 고객이 회사에 <b>"많이 떨어지면 그 손해는 제가 떠안겠습니다"라는 약속을 팔고 받는 값</b>입니다. "많이 안 떨어지면 이자를 드리겠다"는 말은 뒤집으면 "떨어지면 고객이 부담한다"는 뜻이고, 그 약속의 가격이 곧 수익률입니다. 자산이 심하게 출렁일수록 그 약속이 비싸지니 수익률도 올라갑니다. 업계 관행이 아니라 <b>값을 매기는 계산식 자체가 그렇게 돼 있습니다.</b> 그래서 오히려 <b>둘이 따로 노는 상품이 의심 대상</b>입니다.</p>

  <div class="tw">
    <table class="kt">
      <thead><tr><th>연 수익률과 무엇의 관계인가</th><th class="num">전체 ${coupon.n}종</th><th class="num">값어치 멀쩡한 ${coupon.nFair}종</th></tr></thead>
      <tbody>
${rhoRow('가격 출렁임', 'vol')}
${rhoRow('손해 볼 가능성', 'loss')}
${rhoRow('평균적으로 잃는 크기 (가능성 × 잃을 때의 크기)', 'expLoss', true)}
      </tbody>
    </table>
  </div>
  <p class="tnote">숫자가 <b>1에 가까울수록</b> "수익률 높은 상품이 위험도 크다"가 잘 들어맞고, 0이면 아무 관계가 없다는 뜻입니다(순서를 견주는 방식으로 쟀습니다). <b>값어치 멀쩡한 ${coupon.nFair}종</b> = 넣는 순간의 값어치가 제값보다 5% 넘게 깎이지는 않은 상품 — 나머지 ${coupon.n - coupon.nFair}종은 아래 ②.</p>

  <ul class="keys">
    <li><b>둘씩 짝지어 세어 보면 이렇습니다.</b> ${coupon.n}종으로 만들 수 있는 ${CP.all.n}짝 중 <b>${CP.all.ok}짝(${f1(CP.all.pct, 0)}%)</b>에서 "수익률 높은 쪽이 잃는 크기도 컸다"가 맞았습니다. 값어치 멀쩡한 ${coupon.nFair}종만 보면 ${CP.fair.n}짝 중 <b>${CP.fair.ok}짝(${f1(CP.fair.pct, 0)}%)</b>입니다.</li>
    <li><b>그런데 정비례는 아닙니다.</b> 수익률만 알아서는 위험을 <b>${f1(CG.r2 * 100, 0)}%밖에</b> 맞히지 못합니다. 수익률을 1%p 더 받을 때 손해 볼 가능성은 평균 ${f1(CG.slope, 2)}%p 오르지만, 상품마다 그 몇 배씩 들쭉날쭉합니다. 실무에서 제일 쓸모 있는 숫자는 이것입니다 — <b>같은 위험을 지고 받는 수익률이 상품마다 ${eff1(CE.worst)}에서 ${eff1(CE.best)}까지 ${f1(CE.spread, 1)}배</b> 차이 납니다. 값어치가 멀쩡한 ${coupon.nFair}종만 추려도 ${f1(CE.fairSpread, 1)}배입니다. 정확히 비례한다면 이 값은 전부 같아야 합니다.</li>
  </ul>

  <h3 class="sub3">어긋나는 이유는 세 가지입니다</h3>
  <ul class="keys">
    <li><b>① 상품 조건이 달라서.</b> ${esc(CW.group[0].underlyings.join('·'))}를 기준으로 삼는 ${CW.group.length}종은 <b>기준 자산도, 가격 출렁임(${f1(CW.group[0].vmax, 1)}%)도, 기간(${CW.group[0].months}개월)도 똑같은데</b> 수익률만 ${f1(Math.min(...CW.group.map((i) => i.annualRate)), 1)}~${f1(Math.max(...CW.group.map((i) => i.annualRate)), 1)}%로 갈립니다. 제${CW.twin.hi.no}회는 수익률 ${f1(CW.twin.hi.annualRate, 1)}%에 평균적으로 잃는 크기가 ${f1(CW.twin.hi.mcExpLoss, 1)}%, 제${CW.twin.lo.no}회는 ${f1(CW.twin.lo.annualRate, 1)}%에 ${f1(CW.twin.lo.mcExpLoss, 1)}% — <b>위험이 사실상 같은데 수익률이 ${f1(CW.twin.d, 1)}%p 차이 납니다.</b> ${CW.twin.hi.every}개월마다 끝날 기회를 보느냐 ${CW.twin.lo.every}개월마다 보느냐(끝날 기회 ${CW.twin.hi.steps}번 대 ${CW.twin.lo.steps}번), 원금 지키는 선이 ${CW.twin.hi.knockIn}%냐 ${CW.twin.lo.knockIn}%냐가 수익률과 위험을 서로 다른 방향으로 흔들기 때문입니다.</li>
    <li><b>② 값어치가 깎여서.</b> 제${CW.priced.no}회는 수익률 ${f1(CW.priced.annualRate, 1)}%인데 평균적으로 잃는 크기가 <b>${f1(CW.priced.mcExpLoss, 1)}%</b>나 됩니다. 1만원을 넣는 순간의 값어치가 제값보다 ${f1(CW.priced.fairValueGap, 1)}%나 깎여 있기 때문입니다 — 높은 수익률이 <b>위험을 진 대가로 돌아오는 게 아니라 비용으로 새어나간</b> 경우입니다. 이렇게 값어치가 많이 깎인 ${coupon.n - coupon.nFair}종만 빼도 수익률과 출렁임의 관계가 ${f1(CR.vol.all.r, 2)}에서 <b>${f1(CR.vol.fair.r, 2)}</b>로 올라갑니다. 바꿔 말하면 <b>"높은 수익률 = 높은 위험"은 제값 받는 상품에서만 통합니다.</b></li>
    <li><b>③ 돈의 종류가 달라서.</b> 제${CW.fx.fx.no}회(${CW.fx.fx.currency})는 수익률 ${f1(CW.fx.fx.annualRate, 1)}%에 평균적으로 잃는 크기가 ${f1(CW.fx.fx.mcExpLoss, 1)}%로, 기준 자산이 똑같은 원화 제${CW.fx.krw.no}회(${f1(CW.fx.krw.annualRate, 1)}%, ${f1(CW.fx.krw.mcExpLoss, 1)}%)보다 <b>더 주면서 덜 위험해 보입니다.</b> ${CW.fx.fx.currency} 이자가 수익률에 섞여 들어간 것이고, 대신 <b>이 손실 계산에 잡히지 않는 환율 위험</b>이 따로 붙기 때문입니다.</li>
  </ul>

  <h3 class="sub3">한 가지 바로잡을 것 — 수익률이 갚는 건 "가능성"이 아닙니다</h3>
  <p class="slead2">수익률은 손해 볼 <b>가능성</b>보다 <b>평균적으로 잃는 크기</b>와 훨씬 잘 붙습니다(${f1(CR.loss.fair.r, 2)} 대 <b>${f1(CR.expLoss.fair.r, 2)}</b>). "평균적으로 잃는 크기"는 <b>손해 볼 가능성 × 손해 날 때 잃는 정도</b>를 곱한 값입니다. 지수만 담은 상품은 잃을 때 ${f1(avgLossOf('지수'), 0)}% 남짓 잃지만, 개별 종목 상품은 ${f1(avgLossOf('종목'), 0)}%가량 잃습니다. <b>회사는 "얼마나 자주 잃느냐"가 아니라 "자주 × 크게"로 값을 매깁니다.</b> 그래서 손해 볼 가능성이 ${f1(idxWorst.mcLoss, 1)}%나 되는 지수 상품 제${idxWorst.no}회가, 가능성이 더 낮은 종목 상품보다 수익률이 낮은 일이 생깁니다. 언뜻 앞뒤가 안 맞아 보이지만 잃는 크기까지 보면 맞습니다.</p>

  <h3 class="sub3">가장 크게 어긋난 상품은 따로 흔들어 봤습니다 — 위험 대비 대가 1등인 제${CS.no}회${coupon.sensIsPick ? ' (추천 1번)' : ''}</h3>
  <p class="slead2"><b>"두 자산이 ${f1(CS.disclosed, 2)}만큼 같이 움직인다"는 서류 값 하나에 얹혀 있는 건 아닌지</b> 그 값을 억지로 낮춰가며 다시 돌려봤습니다.</p>
  <div class="tw">
    <table class="kt">
      <thead><tr><th>두 자산이 같이 움직이는 정도</th>${CS.rows.map((r) => `<th class="num">${r.rho == null ? '서류값 ' + f1(CS.disclosed, 2) : f1(r.rho, 2)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>손해 볼 가능성</td>${sensRow((r) => f1(r.loss, 1) + '%')}</tr>
        <tr><td>평균적으로 잃는 크기</td>${sensRow((r) => f1(r.expLoss, 1) + '%')}</tr>
        <tr><td><b>위험 한 단위당 수익률</b></td>${sensRow((r) => `<b>${f1(r.ratio, 2)}</b>`)}</tr>
      </tbody>
    </table>
  </div>
  <p class="tnote">같이 움직이는 정도를 ${f1(CS.rows[CS.rows.length - 1].rho, 2)}까지 억지로 낮춰도 손해 볼 가능성은 ${f1(CS.rows[0].loss, 1)}%에서 ${f1(CS.rows[CS.rows.length - 1].loss, 1)}%로 오르는 데 그치고, 위험 대비 대가는 ${f1(CS.rows[CS.rows.length - 1].ratio, 2)}로 <b>여전히 이번 주 1등</b>입니다. 두 자산의 출렁임 정도가 ${f1(CS.volSpread, 1)}%p나 벌어져 있어서, <b>같이 움직이든 말든 "더 나쁜 쪽"이 거의 항상 같은 자산</b>이기 때문입니다.</p>

  <p class="mnote"><b>상담에서 쓰실 한 줄</b> — 고객이 "연 ${f1(rateMax, 1)}%짜리도 있는데 왜 ${f1(CE.fairBest.annualRate, 1)}%짜리를 먼저 권하냐"고 물으시면: <b>"수익률이 높으면 위험도 큰 것, 맞습니다. 다만 같은 위험을 지고도 남들보다 많이 받는 상품이 따로 있습니다. 이번 주는 그 차이가 ${f1(CE.fairSpread, 1)}배까지 벌어집니다."</b> 그리고 수익률만 유난히 높고 위험은 안 높아 보이는 상품을 만나면 셋 중 하나입니다 — 조건 덕이거나, 돈의 종류가 다르거나, <b>아직 못 본 위험이 있거나.</b> 앞의 둘로 설명이 안 되면 세 번째입니다.</p>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">이 ${slots.length}종을 권합니다</h2>
  <p class="slead">고객이 무엇을 더 중요하게 보시는지에 따라 한 자리씩 골랐습니다. 각 상품이 <b>어떻게 돈이 되는지, 어떤 경우에 손해가 나는지</b>를 있는 그대로 적었습니다.</p>
  <div class="recs">
${slots.map(card).join('\n')}
  </div>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">이번 회차 전체 ${items.length}종</h2>
  <p class="slead">같은 조건으로 돌린 손실 확률(B)이 낮은 순서입니다.</p>
  <div class="tw">
    <table>
      <thead>
        <tr>
          <th>회차</th><th>기초자산</th><th class="num">연<br>수익률</th><th class="num">조기상환<br>주기 / 조건</th>
          <th class="num">원금<br>지키는 선</th><th class="num">적용<br>변동성</th>
          <th class="num">B. 시뮬레이션<br>손실 확률 · 등급</th><th class="num">A. ${head.simYearsWhole}년<br>백테스트 손실</th><th class="num">1만원의<br>출발 가치</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
  <p class="tnote">조기상환 = 이 주기로 확인해서 처음 가격의 이 수준 이상이면 그 자리에서 끝납니다(뒤 회차로 갈수록 낮아지며, 표는 첫 회 기준). 원금 지키는 선 = 만기까지 이 아래로 종가가 내려간 적이 없으면 원금과 이자를 다 받습니다. <b>만기만</b> 표시가 붙은 상품은 낙인이 없어 중간 하락을 따지지 않고 만기 그날만 봅니다. <b>B</b> = ${items.length}종을 같은 조건(${MC.paths.toLocaleString('ko-KR')}회)으로 돌린 손실 확률 — 상품끼리 견주는 용도입니다. <b>A</b> = 투자설명서에 실린 발행사 백테스트 손실 확률로, 과거 실제 시세에 이 상품을 매 영업일 얹어 본 결과입니다. 작은 글씨는 그 상품의 표본 구간 길이이며, <span class="bad">빨간 A</span>는 표본이 10년에 못 미쳐 다른 상품과 나란히 비교할 수 없다는 뜻입니다. ${TIER_RULE}</p>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">이번 주에는 권하지 않는 상품</h2>
  <p class="slead">수익률만 보면 눈에 띄지만, <b>그 대가를 손해 볼 가능성이나 값어치에서 치르고 있는</b> 상품입니다. 손해 볼 가능성이 큰 순서입니다.</p>
  <div class="caus">
${cautionCards}
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">가입 전에 꼭 짚어드릴 것</h2>
  <div class="checks">
    ${plan.hasCooling ? `<div class="chk warnbox">
      <h4>1. 청약 마감은 ${dayLabel(retailEnd)}입니다</h4>
      <p>홈페이지에는 ${offerFrom}~${offerTo}로 나오지만, 개인 일반투자자는 <b>${dayLabel(retailEnd)}까지</b>만 청약할 수 있습니다. ${dot(plan.coolingFrom)}~${dot(plan.coolingTo)}은 숙려기간, ${dot(plan.confirmBy)}은 가입의사확인기간이라 주문을 받을 수 없습니다. <b>마감일을 잘못 안내하면 고객이 청약 기회를 놓칩니다.</b></p>
    </div>` : ''}
    <div class="chk">
      <h4>${plan.hasCooling ? 2 : 1}. 1만원을 넣어도 1만원어치가 아닙니다</h4>
      <p>투자설명서에는 시작하는 날 기준 <b>이 상품의 진짜 값어치</b>가 적혀 있습니다. 이번 주는 ${money(gapBest, gapBest.fairValue / 100)}부터 ${money(gapWorst, gapWorst.fairValue / 100)}까지 벌어집니다(1만원 넣었을 때 기준). 차액은 회사 몫과 비용입니다. 게다가 이 값도 앞으로 들 비용을 이미 뺀 뒤의 값이라, <b>실제로 나가는 돈은 이보다 큽니다.</b></p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 3 : 2}. 중간에 빼면 손해입니다</h4>
      <p>만기 전에 빼시면 <b>원금이 아니라 그날 기준으로 계산한 값어치의 95%</b>만 받습니다(가입한 지 6개월이 안 됐으면 90%). <b>${head.months}개월 동안 안 쓸 돈</b>으로만 하셔야 합니다.</p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 4 : 3}. 판정은 그날 <b>종가</b>로만 합니다</h4>
      <p>장중에 잠깐 원금 지키는 선을 뚫고 내려가도, <b>그날 종가가 선 위에서 끝나면 아무 일 없습니다.</b> 반대로 종가가 딱 한 번이라도 선 아래면 그걸로 기록이 남습니다.</p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 5 : 4}. 서류의 손실 숫자를 그대로 옮기지 마십시오</h4>
      <p>서류에 적힌 <b>${f1(head.simLoss, 2)}%</b> 같은 숫자는 "지난 ${head.simYearsWhole}년이 그대로 되풀이된다면"의 답입니다. 그 ${head.simYearsWhole}년은 대체로 오르는 장이었고, 상품마다 돌려본 기간도 다릅니다. 똑같은 조건으로 다시 돌리면 이번 주 평균이 <b>${f1(mcAvgAll, 1)}%</b>입니다. <b>"손실 확률 ${f1(head.simLoss, 2)}%인 상품"이라고 말씀하시면 안 됩니다.</b></p>
    </div>
    ${plan.recordingRight ? `<div class="chk">
      <h4>${plan.hasCooling ? 6 : 5}. 상담 내용은 녹음됩니다</h4>
      <p>개인 일반투자자는 상담 녹음 파일을 달라고 하실 수 있고, 위험을 한 장으로 정리한 설명서도 받습니다.${plan.maxLossNotice ? ' "최대 얼마까지 잃을 수 있는지"는 숙려기간에 따로 알려드립니다.' : ''} <b>설명을 건너뛰면 그것도 그대로 기록에 남습니다.</b></p>
    </div>` : ''}
  </div>
  <div class="script">
    <h4>상담할 때 이 순서로 말씀하시면 됩니다</h4>
    <ol>
      ${plan.hasCooling ? `<li>"먼저 일정부터 말씀드리면, 청약은 <b>${dayLabel(retailEnd)}까지</b> 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 숙려기간이라 주문을 받을 수 없습니다."</li>` : ''}
      <li>"이 상품은 최장 ${slots[0].pick.months}개월짜리인데, ${slots[0].pick.every}개월마다 끝날 기회가 옵니다. 지금까지는 대부분 첫 번째에 끝났습니다."</li>
      <li>"${judgeLine(slots[0].pick).replace(/<\/?b>/g, '')}"</li>
      <li>"<b>올라야 버는 게 아니라, 많이 안 떨어지면 버는 구조</b>입니다. 제자리여도 약속한 이자를 다 받습니다."</li>
      <li>"대신 ${slots[0].pick.knockIn ?? slots[0].pick.maturityBarrier}% 아래로 크게 떨어지면 <b>떨어진 만큼 그대로 손실</b>입니다. 원금은 보장되지 않습니다."</li>
      <li>"지난 ${slots[0].pick.simYearsWhole}년으로 돌려보면 손실은 ${f1(slots[0].pick.simLoss, 2)}%였는데, 그 기간이 좋았던 덕도 있습니다. 넉넉하게 잡으면 ${f1(slots[0].pick.mcLoss, 0)}% 정도로 봅니다."</li>
      <li>"${slots[0].pick.months}개월 동안 안 쓸 돈인지부터 확인해 주세요. 중간에 빼시면 그날 계산한 값어치의 95%만 받습니다."</li>
      ${plan.hasCooling ? `<li>"청약을 넣으셔도 바로 확정되는 게 아닙니다. 이틀 숙려기간을 거친 뒤 저희가 다시 연락드려 최종 의사를 확인합니다. 그때 확인이 안 되면 청약금은 ${dot(plan.payDate)}에 돌려드립니다."</li>` : ''}
    </ol>
    <p class="qa"><b>"개별 종목이 들어간 건 더 위험하지 않나요?"</b> 라고 물으시면 — "맞습니다. 이번 주도 종목만 담은 상품의 손해 볼 가능성이 지수만 담은 것의 ${f1(kindRatio, 1)}배입니다. 다만 제${slots[0].pick.no}회는 두 자산이 거의 같이 움직이고(${f1(slots[0].pick.rho, 2)}, 1이면 완전히 같이 움직임) 원금 지키는 선도 ${slots[0].pick.knockIn}%로 훨씬 아래에 있어서, 같은 잣대로 재면 지수 상품 대부분보다 오히려 낮게 나옵니다." 라고 답하시면 됩니다.</p>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">말 풀이 — 서류의 말을 쉬운 말로</h2>
  <p class="slead">고객이 투자설명서나 홈페이지를 펴 놓고 <b>"여기 이건 무슨 말이냐"</b>고 물으실 때 쓰시라고 만들었습니다. <b>왼쪽에서 그 말을 찾아, 가운데 말로 바꿔 말씀하시면 됩니다.</b></p>
  <div class="tw">
    <table class="kt gl">
      <thead><tr><th>서류·홈페이지 용어</th><th>쉬운 용어</th><th>무슨 뜻인가</th></tr></thead>
      <tbody>
${[
  ['기초자산', '기준 자산', '이 상품의 성패를 결정하는 주식이나 지수. 이 상품을 사는 게 아니라, 이것이 얼마나 떨어지느냐만 봅니다.'],
  ['최초기준가격', '처음 가격', `상품이 시작하는 날(${dot(head.issueDate)})의 종가. 이후 나오는 모든 %는 전부 이 값과 견준 것입니다.`],
  ['조기상환 배리어', '미리 끝나는 기준선', '몇 개월마다 확인해서 이 선 위에 있으면 그 자리에서 이자까지 얹어 끝납니다. 대부분의 ELS는 이렇게 끝납니다.'],
  ['스텝다운', '뒤로 갈수록 기준이 낮아짐', '회차가 지날수록 끝나는 기준이 낮아져, 시간이 갈수록 끝나기 쉬워지는 구조입니다.'],
  ['낙인(KI) 배리어', '원금 지키는 선', '끝날 때까지 종가가 한 번도 이 밑으로 안 내려가면, 마지막에 얼마가 됐든 원금과 이자를 다 받습니다. 한 번이라도 내려가면 손실이 시작될 수 있습니다.'],
  ['워스트 퍼포머(worst of)', '더 많이 떨어진 하나로 판정', '기준 자산이 둘 이상이면 잘 오른 쪽은 안 보고 <b>제일 못한 하나만</b> 봅니다. 자산이 많을수록 불리합니다.'],
  ['(내재)변동성', '가격 출렁임', '앞으로 1년간 위아래로 얼마나 흔들릴지 시장이 보고 있는 정도. 클수록 받는 수익률도 높지만 그만큼 크게 빠질 수 있습니다.'],
  ['상관계수', '같이 움직이는 정도', '두 자산이 얼마나 나란히 움직이는지. 1이면 완전히 같이, 0에 가까우면 따로 놉니다. <b>따로 놀수록 "더 나쁜 쪽" 판정에 불리</b>합니다.'],
  ['공정가액', '실제 값어치', '1만원을 넣는 순간 이 상품이 실제로 갖는 값. 나머지는 회사 몫과 비용으로 빠집니다.'],
  ['기대손실', '평균적으로 잃는 크기', '<b>손해 볼 가능성 × 손해 날 때 잃는 정도.</b> 회사는 이 값을 보고 수익률을 정합니다.'],
  ['숙려기간', '다시 생각하는 기간', '<b>다시 한 번 생각해 보시라고 법이 비워 둔 2영업일 이상.</b> 이 기간에는 청약을 넣을 수 없고, "최대 얼마까지 잃을 수 있는지"를 따로 안내받습니다.'],
  ['가입의사 확인기간', '정말 하실 건지 확인하는 날', '숙려기간이 끝난 뒤 회사가 연락해 <b>최종 의사를 확인하는 날.</b> 연락이 안 닿으면 청약은 취소됩니다.'],
  ['중도상환', '중간에 빼기', '만기 전에 해지하는 것. 원금이 아니라 <b>그날 계산한 값어치의 95%</b>(가입 6개월 안이면 90%)를 받습니다.'],
].map(([a, b, c]) => `        <tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
  <p class="tnote">위험 등급 <b>1등급(매우높은위험)</b>도 자주 오해받는 말입니다. 1등급이 제일 좋다는 뜻이 아니라 <b>가장 위험하다</b>는 뜻입니다. 이번 주 ${items.length}종이 전부 1등급입니다.</p>
</section>

</main>

<footer class="wrap">
  <p><b>어디서 가져온 숫자인가</b> — 금융감독원 전자공시시스템(DART)에 ${filedOn} 올라온 미래에셋증권 투자설명서(일괄신고추가서류 접수번호 ${RCP})입니다. 조건·값어치·가격 출렁임·회사가 돌려본 결과는 <b>사람이 옮겨 적지 않고 공시 원문에서 그대로 뽑았습니다.</b></p>
  <p>청약 일정(숙려제도 대상청약기간 · 숙려기간 · 가입의사확인기간)도 투자설명서 상품개요 표에 적힌 날짜 그대로이며, 이번 주 ${items.length}종이 전부 같습니다. 자본시장법상 개인 일반투자자는 2영업일 이상의 숙려기간을 거쳐야 하고, 그 기간과 가입의사확인기간에는 청약할 수 없습니다.</p>
  <p>판매 중인지 여부는 ${stamp(checkedAt) || '–'}에 미래에셋증권 홈페이지 ELS/DLS 목록을 상태별로 조회해 확인했습니다. 공시는 판매 시작 며칠 전에 올라오므로, <b>문서에 실린 회차가 오늘 곧바로 살 수 있다는 뜻은 아닙니다.</b></p>
  <p>과거 최저점과 자체 검증 수치는 ${dot(String(H.dates[0]))}~${dot(String(H.dates[H.dates.length - 1]))} 기준 자산의 일별 종가로, 매 거래일 가입했다고 치고 끝까지 돌린 결과입니다. 늦게 상장한 자산이 섞인 상품은 그만큼 돌려본 기간이 짧으며, 상품마다 실제 기간을 적어 두었습니다.</p>
  <p><b>B(같은 조건 시뮬레이션 손실)는 이 문서가 직접 계산한 값입니다.</b> 상품마다 앞으로 나올 법한 가격 흐름을 ${MC.paths.toLocaleString('ko-KR')}가지 만들어, 실제 확인일·원금 지키는 선·조기 종료 규칙을 그대로 적용해 셌습니다. 출렁임 정도와 두 자산이 같이 움직이는 정도는 지어내지 않고 <b>투자설명서에 회사가 적어 놓은 값</b>을 그대로 썼습니다(회사 표기 기준 — 해당 만기의 변동성, 같이 움직이는 정도는 최근 180영업일 실제 값). 어느 자산도 오르거나 내린다고 가정하지 않았고, 난수를 고정해 두어 같은 조건이면 언제 돌려도 같은 값이 나옵니다. 회사가 쓴 출렁임 수치는 실제보다 크게 잡히는 것이 보통이라 이 확률은 <b>넉넉하게 잡은 최대치</b>로 읽으셔야 하며, 회사의 상품 가격 계산이나 손익과는 무관한 별개 계산입니다.</p>
  <p>본 자료는 투자 권유를 위한 참고 자료입니다. 실제로 가입하시기 전에 <b>투자설명서와 간이투자설명서를 반드시 확인</b>하셔야 합니다. <b>원금 손실이 날 수 있는 상품입니다.</b></p>
  <p>생성 ${builtOn} · scripts/build_els_proposal.mjs</p>
</footer>
`;

await writeFile(OUT, html);
console.log(`${OUT} — 제${items[0].no}~${items[items.length - 1].no}회 ${items.length}종, 추천 ${slots.map((s) => s.pick.no).join('/')}, 주의 ${caution.map((c) => c.no).join('/')}`);
