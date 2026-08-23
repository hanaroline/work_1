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
  if (it.mcLoss != null && it.mcLoss > 25) r.push(`같은 조건으로 돌렸을 때 <b>100번 중 ${f1(it.mcLoss, 0)}번</b>이 손실입니다 (이번 회차 평균 ${f1(mcAvgAll, 0)}번)`);
  if ((it.fairValueGap ?? 0) <= -10) r.push(`${baseOf(it)}${josa(baseOf(it), '을', '를')} 넣는 순간의 가치가 <b>${money(it, it.fairValue / 100)}</b>입니다`);
  if (it.simShort) r.push(`발행사 모의실험 표본이 ${f1(it.simYears, 1)}년(${it.simRuns.toLocaleString('ko-KR')}회)뿐입니다 — ${esc(it.underlyings[it.underlyings.length - 1])}가 늦게 상장해 큰 하락장이 표본에 없습니다. 공시의 손실 ${f1(it.simLoss, 2)}%를 20년짜리와 나란히 놓으면 안 됩니다`);
  if (it.vmax != null && it.vmax >= 90) r.push(`발행사가 이론가에 쓴 변동성이 <b>${f1(it.vmax, 0)}%</b>입니다 — 이번 회차에서 가장 높은 축입니다`);
  if (it.margin != null && it.margin < 0) r.push(`${covLabel(it)} 안에 원금 지키는 선을 이미 ${f1(-it.margin)}%p 뚫고 내려간 적이 있습니다`);
  return r.slice(0, 4);
};

// 적용 변동성 — 문장 한 줄에만 쓴다
const vols = [...new Map(items.flatMap((it) => it.volatility.map((v) => [v.asset, v.vol]))).entries()]
  .sort((a, b) => b[1] - a[1]);

// ── 상품 한 줄 설명 (전문 용어를 풀어쓴다) ───────────────────────────────────
const judgeLine = (it) => it.underlyings.length === 1
  ? `${esc(it.underlyings[0])} 하나만 봅니다.`
  : `${esc(it.underlyings.join(' · '))} 중 <b>더 많이 떨어진 하나</b>로 판정합니다.`;
const earlyLine = (it) => {
  const b = it.barriers[0];
  return `${it.every}개월마다 확인해서 처음 가격의 <b>${b}% 이상</b>(${sgn(b - 100, 0)}% 이내)이면 그 자리에서 끝나고 `
       + `${baseOf(it)}${josa(baseOf(it), '이', '가')} <b>${money(it, it.schedule[0].payout)}</b>${josa(unitOf(it), '이', '가')} 됩니다.`;
};
const floorLine = (it) => it.knockIn != null
  ? `만기까지 한 번도 <b>${it.knockIn}%</b>(${sgn(it.knockIn - 100, 0)}%) 아래로 종가가 내려간 적이 없으면, `
    + `마지막에 얼마든 원금과 이자를 다 받습니다.`
  : `중간 하락은 따지지 않습니다. 만기 그날 <b>${it.maturityBarrier}%</b> 이상이면 원금과 이자를 다 받습니다.`;
const lossLine = (it) => it.knockIn != null
  ? `${it.knockIn}% 아래를 밟은 적이 있고 만기에도 ${it.maturityBarrier}% 미만이면, 떨어진 만큼 그대로 손실입니다.`
  : `만기에 ${it.maturityBarrier}% 미만이면 떨어진 만큼 그대로 손실입니다.`;

// ── 조각 ─────────────────────────────────────────────────────────────────────
const tierChip = (it) => `<span class="tier t${it.tier}">${tierOf(it).name}</span>`;

const stairs = (it) => {
  const bs = it.barriers;
  const maxB = Math.max(...bs), minB = Math.min(...bs);
  const span = maxB - minB;                       // 계단이 없는 상품(전 회차 동일 조건)도 있다
  const h = (b) => span ? 22 + (b - minB) / span * 42 : 44;
  return `<p class="stcap">조기상환 조건 — ${it.every}개월마다 확인하며 뒤로 갈수록 낮아집니다${span ? ` (${bs[0]}% → ${bs[bs.length - 1]}%)` : ' (전 회차 동일)'}</p>
      <div class="stairs" role="img" aria-label="${it.every}개월마다 확인하며 조기상환 조건이 ${bs[0]}%에서 ${bs[bs.length - 1]}%로 낮아집니다">
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
  return `<p class="stcap">발행사 모의실험 ${it.simRuns?.toLocaleString('ko-KR')}회의 결과 분포 — ${dot(it.simRange?.from ?? '')}~${dot(it.simRange?.to ?? '')}</p>
      <div class="pbar" role="img" aria-label="이익 ${f1(win, 2)}%, 손실 ${f1(loss, 2)}%">
        <div class="pw" style="flex:${Math.max(win, 0.01)}"><span>이익 ${f1(win, 2)}%</span></div>
        <div class="pl" style="flex:${Math.max(loss, 0.01)}"></div>
      </div>
      <p class="pnote">${loss > 0
        ? `손실 <b>${f1(loss, 2)}%</b> — ${buckets.map((b) => `${esc(b.label.replace('만기상환손실', '0~-10%'))} ${b.count}회`).join(' · ')}`
        : `이 구간에서는 <b>손실 사례가 한 번도 없었습니다.</b> 다만 위 B 기준으로는 ${f1(it.mcLoss, 1)}%입니다.`}</p>`;
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

  const head = `<b>"종목이 들어갔는데 괜찮나요?"</b> ${esc(stock)}${josa(stock, '이', '가')} 들어간 ${kindOf(it)}형이 맞습니다. `
    + `적용 변동성도 <b>${f1(it.vmax, 1)}%</b>로 지수 평균(${f1(idxVol, 1)}%)보다 높습니다. 그 말씀이 맞습니다. `;

  // 실제로 지수형 평균보다 안전한 경우와 그렇지 않은 경우는 다른 문장을 써야 한다
  const body = safer
    ? `그런데 같은 조건으로 돌린 손실 확률은 <b>${f1(it.mcLoss, 1)}%</b>로 지수형 평균(${f1(idxAvg, 1)}%)<b>보다 낮고</b>, 순수 지수형 ${idxN}종 중 ${beats}종보다도 낮습니다. `
      + (it.rho != null && it.rho >= 0.7
        ? `이유는 상관계수입니다. 이 둘은 <b>${f1(it.rho, 2)}</b>로 거의 같이 움직여, "더 떨어진 하나"로 판정하는 구조에서도 워스트오브 때문에 잃는 몫이 거의 없습니다. 여기에 낙인이 <b>${it.knockIn ?? it.maturityBarrier}%</b>로 깊게 잡혀 있습니다.`
        : `낙인이 <b>${it.knockIn ?? it.maturityBarrier}%</b>로 깊게 잡혀 있어, 변동성이 높아도 닿기까지 거리가 있습니다.`)
    : `그래서 손실 확률도 <b>${f1(it.mcLoss, 1)}%</b>로 지수형 평균(${f1(idxAvg, 1)}%)보다 <b>높습니다.</b> `
      + `이 자리에 올린 이유는 안전해서가 아니라 <b>그 위험을 받고 받는 대가가 크기 때문</b>입니다. `
      + `손실 확률 1%당 연 <b>${f1(perRisk(it), 2)}%</b>를 주는데, 이번 회차 지수형은 평균 ${f1(idxPerRisk, 2)}%입니다. `
      + `뒤집어 말하면 이만한 수익을 지수형에서 받으려면 위험을 <b>${f1(perRisk(it) / idxPerRisk, 1)}배</b> 져야 합니다. `
      + `원금 보전을 최우선으로 두시는 분께는 이 상품이 아니라 <b>1번 카드</b>를 권해 주십시오.`;

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
          <span class="rlabel">연 수익률</span>
          <span class="rnum">${f1(it.annualRate, 1)}<span class="pct">%</span></span>
          <span class="rsub">${baseOf(it)} → ${it.every}개월 뒤 ${money(it, it.schedule[0].payout)}</span>
        </div>
        <ul class="how">
          <li><span class="hk">판정</span><span>${judgeLine(it)}</span></li>
          <li><span class="hk">조기상환</span><span>${earlyLine(it)}</span></li>
          <li><span class="hk">원금</span><span>${floorLine(it)}</span></li>
          <li><span class="hk">손실</span><span>${lossLine(it)}</span></li>
        </ul>
        ${stairs(it)}
        ${probBar(it)}
        <div class="recfoot">
          <div class="rf"><span>A. 발행사 ${it.simYearsWhole}년 모의실험</span><b>손실 ${f1(it.simLoss, 2)}%</b><small>${it.simRuns?.toLocaleString('ko-KR')}회 중 ${Math.round((it.simLoss ?? 0) / 100 * (it.simRuns ?? 0))}회 · 이익 ${f1(it.simWin, 2)}%</small></div>
          <div class="rf"><span>B. 같은 조건 모의실험</span><b>손실 ${f1(it.mcLoss, 1)}%</b><small>${items.length}종 평균 ${f1(mcAvgAll, 1)}% · ${rankLabel(it)}</small></div>
          <div class="rf"><span>${baseOf(it)}의 출발 가치</span><b>${money(it, it.fairValue / 100)}</b><small>공정가액 대비 ${sgn(it.fairValueGap, 2)}%</small></div>
          <div class="rf"><span>적용 변동성 / 상관</span><b>${f1(it.vmax, 1)}%</b><small>${it.rho != null ? `기초자산끼리 ${f1(it.rho, 2)}` : '기초자산 하나'} · ${covLabel(it)} 최저 ${f1(it.low, 0)}%</small></div>
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
const pp = (o) => (o.p < 0.001 ? '&lt;0.001' : o.p.toFixed(3));
const rhoCell = (o) => `<td class="num"><b>${f1(o.r, 2)}</b><small class="sn">p ${pp(o)}${o.sig ? '' : ' · 유의하지 않음'}</small></td>`;
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
.how li{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;align-items:baseline;font-size:16px}
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
  <h2 class="stitle">이번 회차 한눈에</h2>
  <p class="slead">이번 주 청약하는 ${items.length}종을 조건·가격·손실 확률 세 가지로 나눠 봤습니다. 조건과 가격은 투자설명서 원문 그대로이고, 손실 확률은 두 가지 방법으로 각각 쟀습니다(다음 절).</p>
  <div class="stats">
    <div class="stat"><span>상품 수</span><b>${items.length}종</b><small>지수형 ${items.filter((i) => kindOf(i) === '지수').length} · 혼합 ${items.filter((i) => kindOf(i) === '혼합').length} · 종목형 ${items.filter((i) => kindOf(i) === '종목').length}</small></div>
    <div class="stat"><span>연 수익률</span><b>${f1(rateMin, 1)}~${f1(rateMax, 1)}%</b><small>최고 제${items.find((i) => i.annualRate === rateMax).no}회</small></div>
    <div class="stat"><span>만기</span><b>${head.months}개월</b><small>${dot(head.maturityDate)} 만기</small></div>
    <div class="stat"><span>등급 분포</span><b>${tierCount[0]} / ${tierCount[1]} / ${tierCount[2]}</b><small>방어적 / 중간 / 공격적 · 손실 확률 기준</small></div>
  </div>
  <ul class="keys">
    <li>모두 <b>원금비보장 1등급(매우높은위험)</b> 상품입니다. 아래 등급은 안전하다는 뜻이 아니라 <b>${items.length}종끼리 견준 순서</b>입니다.</li>
    <li>같은 1만원이라도 상품마다 <b>출발 가치가 다릅니다.</b> 가장 좋은 제${gapBest.no}회는 ${money(gapBest, gapBest.fairValue / 100)}, 가장 나쁜 제${gapWorst.no}회는 ${money(gapWorst, gapWorst.fairValue / 100)}입니다. 이 차이는 홈페이지 상품 목록에는 나오지 않습니다.</li>
    <li>발행사가 이론가를 계산할 때 쓴 변동성은 ${vols.slice(0, 2).map(([a, v]) => `<b>${esc(a)} ${f1(v, 0)}%</b>`).join(', ')} 순입니다. 변동성이 높을수록 수익률도 높지만 그만큼 흔들린다는 뜻입니다.</li>
  </ul>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">손실 확률을 어떻게 쟀나</h2>
  <p class="slead">이 문서는 손실 확률을 두 가지로 적습니다. 둘은 다른 질문에 답하며, 답이 크게 다릅니다. 어느 하나만 보면 상담에서 틀린 말을 하게 됩니다.</p>

  <div class="two">
    <div class="mth">
      <p class="mk">A. 발행사 20년 모의실험</p>
      <p class="mq">"지난 ${head.simYearsWhole}년이 그대로 되풀이된다면?"</p>
      <p>투자설명서에 실린 표입니다. ${dot(head.simRange?.from ?? '')}부터 ${dot(head.simRange?.to ?? '')}까지 <b>매 영업일에 같은 상품을 새로 샀다고 가정</b>하고 만기까지 돌린 결과입니다. 제${head.no}회는 ${head.simRuns?.toLocaleString('ko-KR')}회를 돌렸습니다.</p>
      <p><b>강점</b> 실제로 있었던 가격 경로입니다. 2008년 금융위기도 들어 있습니다.</p>
      <p><b>한계</b> 그 20년은 대체로 상승장이었습니다. 그리고 <b>상품마다 표본 구간이 다릅니다</b> — 상장이 늦은 기초자산이 섞이면 표본이 짧아지고, 그 짧은 구간에 큰 하락이 없으면 손실 확률이 낮게 나옵니다. 표본 수가 다른 두 상품의 이 숫자를 나란히 놓고 비교하면 안 됩니다.</p>
    </div>
    <div class="mth">
      <p class="mk">B. 같은 조건 모의실험 <span class="mine">자체 계산</span></p>
      <p class="mq">"발행사가 가격 매길 때 쓴 변동성이 실제로 나타난다면?"</p>
      <p>${items.length}종 전부를 <b>같은 경로 수(${MC.paths.toLocaleString('ko-KR')}회)·같은 기간·같은 판정 규칙</b>으로 돌렸습니다. 변동성과 상관계수는 지어내지 않고 <b>투자설명서에 적힌 값</b>을 그대로 넣었습니다.</p>
      <p><b>강점</b> 표본 구간 차이가 사라져 ${items.length}종을 정직하게 줄 세울 수 있습니다.</p>
      <p><b>한계</b> 어느 기초자산도 오른다고 보지 않았고(기대수익률 0), 발행사가 쓴 변동성은 <b>내재변동성</b>이라 보통 실제로 나타나는 변동성보다 높습니다. 그래서 이 숫자는 <b>보수적인 상한</b>으로 읽어야 합니다.</p>
    </div>
  </div>
  <p class="mnote"><b>읽는 법</b> — 절대 수준은 A와 B 사이 어딘가입니다. 상품끼리 견줄 때는 B를, "그래서 얼마나 위험한가"를 가늠할 때는 A와 B를 함께 보십시오. 기대수익률을 0%에서 연 6%로 바꿔도 <b>순위는 거의 그대로</b>였습니다.</p>

  <h3 class="sub3">그래서, 종목이 섞이면 더 위험한가</h3>
  <p class="slead2">일반적으로 종목형 ELS가 지수형보다 위험하다고 봅니다. 이번 회차에서 그 말이 맞는지 B로 확인했습니다.</p>
  <div class="tw">
    <table class="kt">
      <thead><tr><th>기초자산 종류</th><th class="num">상품 수</th><th class="num">적용 변동성(평균)</th><th class="num">손실 확률(평균)</th><th class="num">가장 낮음~높음</th><th class="num">연 수익률(평균)</th></tr></thead>
      <tbody>
${byKind.map((r) => `        <tr><td><b>${r.key}형</b></td><td class="num">${r.n}종</td><td class="num">${f1(r.vol, 1)}%</td><td class="num ${r.key === '종목' ? 'bad' : r.key === '혼합' ? 'warn' : ''}"><b>${f1(r.loss, 1)}%</b></td><td class="num">${f1(r.lo, 1)} ~ ${f1(r.hi, 1)}%</td><td class="num">${f1(r.rate, 1)}%</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
  <ul class="keys">
    <li><b>평균으로는 맞습니다.</b> 종목형 손실 확률이 지수형의 <b>${f1(kindRatio, 1)}배</b>입니다. 적용 변동성도 ${f1(byKind.find((r) => r.key === '지수')?.vol, 0)}% 대 ${f1(byKind.find((r) => r.key === '종목')?.vol, 0)}%로 확연히 갈립니다. 자산군을 먼저 보는 관행에는 근거가 있습니다.</li>
    <li><b>개별 상품으로는 뒤집힙니다.</b> 순수 지수형인 제${idxWorst.no}회(${esc(idxWorst.underlyings.join('·'))})가 ${f1(idxWorst.mcLoss, 1)}%로, 종목이 섞인 상품 대부분보다 위험합니다. 반대로 제${stockBest.no}회(${esc(stockBest.underlyings.join('·'))})는 ${f1(stockBest.mcLoss, 1)}%로 ${items.length}종 중 ${safest.findIndex((i) => i.no === stockBest.no) + 1}번째로 낮습니다.</li>
    <li><b>가른 것은 자산군이 아니라 두 가지였습니다.</b> 첫째 <b>낙인이 얼마나 깊은가</b> — 제${idxWorst.no}회의 낙인 ${idxWorst.knockIn}%는 이번 회차에서 가장 얕아 쿠션이 가장 적습니다. 둘째 <b>기초자산끼리 얼마나 같이 움직이는가</b> — 상관계수가 낮으면 "둘 중 더 나쁜 것"으로 판정하는 구조에서 훨씬 불리해집니다. 제${idxWorst.no}회는 ${f1(idxWorst.rho, 2)}, 제${stockBest.no}회는 ${f1(stockBest.rho, 2)}입니다.</li>
    <li><b>따라서 이 문서는 자산군으로 거르지 않고 B의 손실 확률로 등급을 매겼습니다.</b> 다만 종목이 섞인 상품을 권할 때는 <b>왜 자산군 관행을 거스르는지</b>를 카드마다 적었습니다. 고객이 "종목형인데 안전하다고요?"라고 물으면 그 문장을 그대로 읽으시면 됩니다.</li>
  </ul>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">쿠폰이 높으면 그만큼 위험한가</h2>
  <p class="slead">"수익률이 높으면 그만큼 위험한 것 아니냐"는 질문을 자주 받습니다. <b>방향은 맞습니다.</b> 다만 정비례는 아니고, 어긋나는 그 자리가 곧 상품을 고르는 자리입니다. 이번 회차 ${coupon.n}종으로 확인했습니다.</p>

  <p class="mnote"><b>왜 우연이 아닌가</b> — ELS 쿠폰은 고객이 발행사에 <b>풋옵션을 팔고 받는 프리미엄</b>입니다. "낙인 아래로 안 떨어지면 이자를 드리겠다"는 곧 "떨어지면 그 손실은 고객이 떠안는다"는 뜻이고, 그 약속의 값이 쿠폰입니다. 변동성이 높을수록 그 풋이 비싸지니 쿠폰도 올라갑니다. 관행이 아니라 가격 산식 자체가 그렇습니다. 그래서 <b>둘이 붙어 있지 않은 상품이 오히려 의심 대상</b>입니다.</p>

  <div class="tw">
    <table class="kt">
      <thead><tr><th>쿠폰과 무엇의 관계</th><th class="num">전체 ${coupon.n}종</th><th class="num">가격 정상 ${coupon.nFair}종</th></tr></thead>
      <tbody>
${rhoRow('적용 변동성', 'vol')}
${rhoRow('손실 확률', 'loss')}
${rhoRow('기대손실 (손실 확률 × 평균 손실폭)', 'expLoss', true)}
      </tbody>
    </table>
  </div>
  <p class="tnote">순위상관(스피어만)과 양측 유의확률. 1에 가까울수록 "쿠폰이 높은 상품이 위험도 높다"가 잘 들어맞습니다. <b>가격 정상</b> = 출발 가치 갭이 -5%보다 나은 ${coupon.nFair}종. 나머지 ${coupon.n - coupon.nFair}종은 아래 ②를 보십시오.</p>

  <ul class="keys">
    <li><b>짝으로 세면 이렇습니다.</b> ${coupon.n}종에서 만들 수 있는 ${CP.all.n}짝 중 <b>${CP.all.ok}짝(${f1(CP.all.pct, 0)}%)</b>이 "쿠폰 높은 쪽이 기대손실도 크다"를 따랐습니다. 가격 정상 ${coupon.nFair}종만 보면 ${CP.fair.n}짝 중 <b>${CP.fair.ok}짝(${f1(CP.fair.pct, 0)}%)</b>입니다.</li>
    <li><b>그런데 비례는 아닙니다.</b> 회귀 설명력이 <b>${f1(CG.r2 * 100, 0)}%</b>에 그칩니다. 쿠폰을 1%p 더 받을 때 손실 확률은 평균 ${f1(CG.slope, 2)}%p 오르지만 산포가 그 몇 배입니다. 가장 실무적인 숫자는 이것입니다 — <b>위험 한 단위당 받는 쿠폰이 ${eff1(CE.worst)}에서 ${eff1(CE.best)}까지 ${f1(CE.spread, 1)}배</b> 벌어집니다. 가격이 정상인 ${coupon.nFair}종만 추려도 ${f1(CE.fairSpread, 1)}배입니다. 완전 비례라면 이 값은 모두 같아야 합니다.</li>
  </ul>

  <h3 class="sub3">어긋나는 이유는 셋입니다</h3>
  <ul class="keys">
    <li><b>① 구조.</b> ${esc(CW.group[0].underlyings.join('·'))}를 기초자산으로 하는 ${CW.group.length}종은 <b>기초자산도 적용 변동성(${f1(CW.group[0].vmax, 1)}%)도 만기(${CW.group[0].months}개월)도 같은데</b> 쿠폰이 ${f1(Math.min(...CW.group.map((i) => i.annualRate)), 1)}~${f1(Math.max(...CW.group.map((i) => i.annualRate)), 1)}%로 갈립니다. 제${CW.twin.hi.no}회는 쿠폰 ${f1(CW.twin.hi.annualRate, 1)}%에 기대손실 ${f1(CW.twin.hi.mcExpLoss, 1)}%, 제${CW.twin.lo.no}회는 쿠폰 ${f1(CW.twin.lo.annualRate, 1)}%에 기대손실 ${f1(CW.twin.lo.mcExpLoss, 1)}% — <b>위험이 사실상 같은데 쿠폰이 ${f1(CW.twin.d, 1)}%p 차이납니다.</b> 조기상환을 ${CW.twin.hi.every}개월마다 보느냐 ${CW.twin.lo.every}개월마다 보느냐(상환 기회 ${CW.twin.hi.steps}번 대 ${CW.twin.lo.steps}번), 낙인이 ${CW.twin.hi.knockIn}%냐 ${CW.twin.lo.knockIn}%냐가 쿠폰과 위험을 각각 다른 방향으로 흔듭니다.</li>
    <li><b>② 가격.</b> 제${CW.priced.no}회는 쿠폰 ${f1(CW.priced.annualRate, 1)}%인데 기대손실이 <b>${f1(CW.priced.mcExpLoss, 1)}%</b>입니다. 출발 가치 갭이 ${f1(CW.priced.fairValueGap, 1)}%이기 때문입니다 — 쿠폰이 위험의 대가로 돌아오는 게 아니라 <b>수수료로 새어나간</b> 경우입니다. 갭이 큰 ${coupon.n - coupon.nFair}종을 빼는 것만으로 쿠폰과 변동성의 상관이 ${f1(CR.vol.all.r, 2)}에서 <b>${f1(CR.vol.fair.r, 2)}</b>로 올라갑니다. 뒤집어 말하면 <b>이 법칙은 제값 받는 상품에서만 성립합니다.</b></li>
    <li><b>③ 통화.</b> 제${CW.fx.fx.no}회(${CW.fx.fx.currency})는 쿠폰 ${f1(CW.fx.fx.annualRate, 1)}%에 기대손실 ${f1(CW.fx.fx.mcExpLoss, 1)}%로, 기초자산이 같은 원화 제${CW.fx.krw.no}회(${f1(CW.fx.krw.annualRate, 1)}%, ${f1(CW.fx.krw.mcExpLoss, 1)}%)보다 <b>더 주면서 덜 위험해 보입니다.</b> ${CW.fx.fx.currency} 금리가 쿠폰에 섞여 있고, 대신 <b>손실 확률에 잡히지 않는 환율 위험</b>이 붙기 때문입니다.</li>
  </ul>

  <h3 class="sub3">한 가지 바로잡을 것 — 쿠폰이 보상하는 것은 확률이 아닙니다</h3>
  <p class="slead2">쿠폰은 손실 <b>확률</b>보다 <b>기대손실</b>과 훨씬 잘 붙습니다(${f1(CR.loss.fair.r, 2)} 대 <b>${f1(CR.expLoss.fair.r, 2)}</b>, 가격 정상 기준). 기대손실은 손실 확률에 평균 손실폭을 곱한 값입니다. 지수형은 떨어질 때 ${f1(avgLossOf('지수'), 0)}% 남짓, 종목형은 ${f1(avgLossOf('종목'), 0)}%가량 잃습니다. <b>발행사는 확률이 아니라 확률 × 크기로 값을 매깁니다.</b> 그래서 손실 확률이 ${f1(idxWorst.mcLoss, 1)}%인 지수형 제${idxWorst.no}회가, 확률이 더 낮은 종목형보다 쿠폰이 낮은 일이 생깁니다. 겉으로는 모순이지만 기대손실로 보면 맞습니다.</p>

  <h3 class="sub3">가장 크게 어긋난 상품을 따로 흔들어 봤습니다</h3>
  <p class="slead2">위험당 대가 1위인 제${CS.no}회${coupon.sensIsPick ? '(이 문서의 추천 상품)' : ''}가 공시 상관계수 <b>${f1(CS.disclosed, 2)}</b> 한 값에 얹혀 있는 것은 아닌지, 상관을 억지로 낮춰가며 다시 돌렸습니다.</p>
  <div class="tw">
    <table class="kt">
      <thead><tr><th>기초자산 상관</th>${CS.rows.map((r) => `<th class="num">${r.rho == null ? '공시 ' + f1(CS.disclosed, 2) : f1(r.rho, 2)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>손실 확률</td>${sensRow((r) => f1(r.loss, 1) + '%')}</tr>
        <tr><td>기대손실</td>${sensRow((r) => f1(r.expLoss, 1) + '%')}</tr>
        <tr><td><b>위험당 쿠폰</b></td>${sensRow((r) => `<b>${f1(r.ratio, 2)}</b>`)}</tr>
      </tbody>
    </table>
  </div>
  <p class="tnote">상관을 ${f1(CS.rows[CS.rows.length - 1].rho, 2)}까지 떨어뜨려도 손실 확률은 ${f1(CS.rows[0].loss, 1)}%에서 ${f1(CS.rows[CS.rows.length - 1].loss, 1)}%로 오르는 데 그치고, 위험당 쿠폰은 ${f1(CS.rows[CS.rows.length - 1].ratio, 2)}로 여전히 이번 회차 1위입니다. 두 기초자산의 변동성이 ${f1(CS.volSpread, 1)}%p나 벌어져 있어 <b>상관과 무관하게 "더 나쁜 쪽"이 거의 항상 같은 자산</b>이기 때문입니다.</p>

  <p class="mnote"><b>상담에서 쓰실 한 줄</b> — 고객이 "쿠폰 ${f1(rateMax, 1)}%짜리가 있는데 왜 ${f1(CE.fairBest.annualRate, 1)}%짜리를 먼저 권하냐"고 물으시면: <b>"쿠폰이 높으면 위험도 높은 건 맞습니다. 다만 같은 위험을 지고도 남들보다 많이 받는 상품이 있습니다. 이번 회차는 그 차이가 ${f1(CE.fairSpread, 1)}배까지 벌어집니다."</b> 그리고 쿠폰이 유난히 높은데 위험은 안 높아 보이는 상품을 만나면 셋 중 하나입니다 — 구조 덕이거나, 통화가 다르거나, <b>아직 못 본 위험이 있거나.</b> 앞의 둘로 설명되지 않으면 세 번째입니다.</p>
</section>

<section class="page-break">
  <div class="rule"></div>
  <h2 class="stitle">추천 ${slots.length}종</h2>
  <p class="slead">고객 성향에 따라 한 자리씩 골랐습니다. 각 상품이 어떻게 돈이 되는지, 어떤 경우에 손해가 나는지를 그대로 적었습니다.</p>
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
          <th class="num">B. 손실 확률<br>· 등급</th><th class="num">A. 공시<br>손실</th><th class="num">1만원의<br>출발 가치</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
  <p class="tnote">조기상환 = 이 주기로 확인해서 처음 가격의 이 수준 이상이면 그 자리에서 끝납니다(뒤 회차로 갈수록 낮아지며, 표는 첫 회 기준). 원금 지키는 선 = 만기까지 이 아래로 종가가 내려간 적이 없으면 원금과 이자를 다 받습니다. <b>만기만</b> 표시가 붙은 상품은 낙인이 없어 중간 하락을 따지지 않고 만기 그날만 봅니다. <b>B</b> = ${items.length}종을 같은 조건(${MC.paths.toLocaleString('ko-KR')}회)으로 돌린 손실 확률 — 상품끼리 견주는 용도입니다. <b>A</b> = 투자설명서에 실린 발행사 모의실험 손실 확률이며, 작은 글씨는 그 상품의 표본 구간 길이입니다. <span class="bad">빨간 A</span>는 표본이 10년에 못 미쳐 다른 상품과 나란히 비교할 수 없다는 뜻입니다. ${TIER_RULE}</p>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">이번 주 권하지 않는 상품</h2>
  <p class="slead">수익률만 보면 눈에 띄지만, 손실 확률이나 가격에서 대가를 치르고 있는 상품입니다. 손실 확률이 높은 순서입니다.</p>
  <div class="caus">
${cautionCards}
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">가입 전 꼭 짚어드릴 것</h2>
  <div class="checks">
    ${plan.hasCooling ? `<div class="chk warnbox">
      <h4>1. 청약 마감은 ${dayLabel(retailEnd)}입니다</h4>
      <p>홈페이지에는 ${offerFrom}~${offerTo}로 나오지만, 개인 일반투자자는 <b>${dayLabel(retailEnd)}까지</b>만 청약할 수 있습니다. ${dot(plan.coolingFrom)}~${dot(plan.coolingTo)}은 숙려기간, ${dot(plan.confirmBy)}은 가입의사확인기간이라 주문을 받을 수 없습니다. 마감일을 잘못 안내하면 고객이 청약 기회를 놓칩니다.</p>
    </div>` : ''}
    <div class="chk">
      <h4>${plan.hasCooling ? 2 : 1}. 1만원이 1만원이 아닙니다</h4>
      <p>투자설명서에는 발행일 기준 공정가액이 적혀 있습니다. 이번 회차는 ${money(gapBest, gapBest.fairValue / 100)}부터 ${money(gapWorst, gapWorst.fairValue / 100)}까지 벌어집니다(각 액면 1만 단위 기준). 게다가 이 값은 만기까지의 헤지비용을 뺀 값이라 실제 비용은 이보다 큽니다.</p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 3 : 2}. 중간에 깨면 손해입니다</h4>
      <p>중도상환은 그 시점 공정가액의 95%(가입 6개월 안이면 90%)로 정산됩니다. 원금이 아니라 그날의 평가금액 기준입니다. 3년을 묻어둘 수 있는 돈으로만 하셔야 합니다.</p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 4 : 3}. 판정은 종가로 합니다</h4>
      <p>장중에 잠깐 원금 지키는 선을 뚫어도 그날 종가가 위에서 끝나면 괜찮습니다. 반대로 종가가 한 번이라도 아래면 그걸로 기록이 남습니다.</p>
    </div>
    <div class="chk">
      <h4>${plan.hasCooling ? 5 : 4}. 손실 확률 숫자를 그대로 옮기지 마십시오</h4>
      <p>공시의 <b>${f1(head.simLoss, 2)}%</b> 같은 숫자는 "지난 ${head.simYearsWhole}년이 되풀이된다면"의 답입니다. 그 ${head.simYearsWhole}년은 대체로 상승장이었고, 상품마다 표본 구간도 다릅니다. 같은 조건으로 다시 돌리면 이번 회차 평균이 <b>${f1(mcAvgAll, 1)}%</b>입니다. <b>"손실 확률 ${f1(head.simLoss, 2)}%인 상품"이라고 말씀하시면 안 됩니다.</b></p>
    </div>
    ${plan.recordingRight ? `<div class="chk">
      <h4>${plan.hasCooling ? 6 : 5}. 판매 과정은 녹취됩니다</h4>
      <p>개인 일반투자자는 판매 과정 녹취 자료를 요청할 수 있고, 투자 위험을 요약한 설명서를 받습니다.${plan.maxLossNotice ? ' 최대 원금손실 가능금액은 숙려기간 중에 따로 고지됩니다.' : ''} 설명을 건너뛰면 그대로 기록에 남습니다.</p>
    </div>` : ''}
  </div>
  <div class="script">
    <h4>상담 시 이 순서로 말씀하시면 됩니다</h4>
    <ol>
      ${plan.hasCooling ? `<li>"먼저 일정부터 말씀드리면, 청약은 <b>${dayLabel(retailEnd)}까지</b> 넣으셔야 합니다. 그 뒤 이틀은 법으로 정해진 숙려기간이라 주문을 받을 수 없습니다."</li>` : ''}
      <li>"이 상품은 3년짜리인데, ${slots[0].pick.every}개월마다 끝날 기회가 옵니다. 대부분은 첫 번째에 끝났습니다."</li>
      <li>"${judgeLine(slots[0].pick).replace(/<\/?b>/g, '')}"</li>
      <li>"올라야 버는 게 아니라, 많이 안 떨어지면 버는 구조입니다."</li>
      <li>"대신 ${slots[0].pick.knockIn ?? slots[0].pick.maturityBarrier}% 아래로 크게 떨어지면 그 하락률이 그대로 손실로 옵니다. 원금이 보장되지 않습니다."</li>
      <li>"과거 ${slots[0].pick.simYearsWhole}년으로 보면 손실은 ${f1(slots[0].pick.simLoss, 2)}%였지만, 그 구간이 좋았던 덕도 있습니다. 보수적으로 잡으면 ${f1(slots[0].pick.mcLoss, 0)}% 정도로 봅니다."</li>
      <li>"3년 동안 안 쓸 돈인지 먼저 확인해 주세요. 중간에 빼면 그날 평가금액의 95%만 받습니다."</li>
      ${plan.hasCooling ? `<li>"청약을 넣으셔도 바로 확정되는 게 아닙니다. 이틀 숙려기간을 거친 뒤 저희가 다시 연락드려 최종 의사를 확인합니다. 그때 확인이 안 되면 청약금은 ${dot(plan.payDate)}에 돌려드립니다."</li>` : ''}
    </ol>
    <p class="qa"><b>"종목이 들어간 건 더 위험하지 않나요?"</b> 라고 물으시면 — "맞습니다. 이번 회차도 종목형 평균 손실 확률이 지수형의 ${f1(kindRatio, 1)}배입니다. 다만 제${slots[0].pick.no}회는 두 기초자산이 상관계수 ${f1(slots[0].pick.rho, 2)}로 거의 같이 움직이고 낙인이 ${slots[0].pick.knockIn}%로 깊어서, 같은 기준으로 재면 지수형 대부분보다 오히려 낮게 나옵니다." 라고 답하시면 됩니다.</p>
  </div>
</section>

</main>

<footer class="wrap">
  <p>출처 — 금융감독원 전자공시시스템 일괄신고추가서류 접수번호 ${RCP} (${filedOn} 공시). 조건·공정가액·적용 변동성·수익률 모의실험은 공시 원문에서 자동 추출했습니다.</p>
  <p>청약 일정(숙려제도 대상청약기간·숙려기간·가입의사확인기간)은 투자설명서 상품개요 표에 적힌 날짜를 그대로 옮긴 것이며, 이번 회차 ${items.length}종이 모두 동일합니다. 자본시장법상 개인 일반투자자는 2영업일 이상의 숙려기간을 거쳐야 하고 그 기간과 가입의사확인기간에는 청약할 수 없습니다.</p>
  <p>판매 상태는 ${stamp(checkedAt) || '–'}에 미래에셋증권 ELS/DLS 캘린더를 진행상태별로 조회해 확인했습니다. 공시는 청약 시작 며칠 전에 올라오므로, 문서에 실린 회차가 오늘 곧바로 청약 가능한 것은 아닙니다.</p>
  <p>최저점과 자체 검증 수치는 ${dot(String(H.dates[0]))}~${dot(String(H.dates[H.dates.length - 1]))} 기초자산 일별 종가로 매 거래일 가입을 가정해 만기까지 돌린 결과입니다. 상장이 늦은 기초자산이 섞인 상품은 검증 구간이 그만큼 짧으며, 상품마다 실제 구간을 표기했습니다.</p>
  <p><b>B. 같은 조건 손실 확률</b>은 자체 계산입니다. 기하 브라운 운동으로 상품별 ${MC.paths.toLocaleString('ko-KR')}개 경로를 생성해 실제 관찰일·낙인·조기상환 규칙대로 판정했습니다. 변동성과 상관계수는 투자설명서의 이론가 산출 변수를 그대로 썼고(발행사 표기 — Volatility Surface에 VIX 방법론을 적용해 산출한 해당 만기 변동성, 상관계수는 180영업일 역사적 값), 기대수익률은 0으로 두어 어느 기초자산도 오르거나 내린다고 가정하지 않았습니다. 난수 시드를 고정해 같은 입력이면 같은 값이 나옵니다. 내재변동성은 실제 실현 변동성보다 높게 형성되는 것이 일반적이므로 이 확률은 <b>보수적인 상한</b>으로 읽어야 하며, 발행사의 이론가·헤지 손익과는 무관한 별개 계산입니다.</p>
  <p>본 자료는 투자 권유를 위한 참고 자료이며, 실제 청약 전 투자설명서와 간이투자설명서를 반드시 확인하셔야 합니다. 원금 손실이 발생할 수 있는 상품입니다.</p>
  <p>생성 ${filedOn} · scripts/build_els_proposal.mjs</p>
</footer>
`;

await writeFile(OUT, html);
console.log(`${OUT} — 제${items[0].no}~${items[items.length - 1].no}회 ${items.length}종, 추천 ${slots.map((s) => s.pick.no).join('/')}, 주의 ${caution.map((c) => c.no).join('/')}`);
