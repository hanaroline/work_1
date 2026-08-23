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
import { readFile, writeFile } from 'node:fs/promises';
import { drawdown, backtest, fromProspectus, startIndex } from './lib/els-engine.mjs';

const OUT = 'els-proposal.html';

const w = {};
new Function('window', await readFile('data/els.js', 'utf8'))(w);
const H = w.ELS_DATA.history;
const P = JSON.parse(await readFile('tools/discovery/prospectus_parsed.json', 'utf8'));

const RCP = process.argv[2] || Object.keys(P).sort().pop();
if (!P[RCP]) { console.error(`접수번호 ${RCP} 없음. 가능: ${Object.keys(P).join(', ')}`); process.exit(1); }

// 홈페이지를 언제 확인했고 그때 무엇이 걸려 있었는지. 공시는 청약 며칠 전에 올라오므로
// 문서만 보면 "지금 살 수 있다"고 읽힌다. 상담 자리에서 그 오해가 제일 비싸다.
const states = await readFile('tools/discovery/offer_states.json', 'utf8').then(JSON.parse).catch(() => null);
const onOfferNow = states?.['01']?.count ?? null;                      // prgs_scd=01 = 청약 진행중
const checkedAt = w.ELS_DATA.checkedAt || w.ELS_DATA.updatedAt || null;

// ── 표기 도우미 ──────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = (v, d = 1) => v == null || Number.isNaN(v) ? '–' : v.toFixed(d);
const sgn = (v, d = 1) => v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d);
const dot = (s) => (s || '').replace(/-/g, '.');
const won = (n) => n == null ? '–' : Math.round(n).toLocaleString('ko-KR');
/** 105.75% → "10,575원" (1만원 기준) */
const money = (pct) => pct == null ? '–' : won(pct * 100) + '원';
const monthsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000 / 30.44);

// ── 회차별 지표 ──────────────────────────────────────────────────────────────
function enrich(item) {
  const p = fromProspectus(item);
  const bt = p && backtest(p, H);
  const dd = p && drawdown(p, H);
  const first = item.schedule[0];
  const every = first ? monthsBetween(item.baseDate || item.issueDate, first.date) : null;

  // 검증 구간은 상품마다 다르다 — 상장이 늦은 기초자산이 섞이면 그만큼 짧아진다
  const ser = item.underlyings.map((u) => H.series[u]);
  const covAt = ser.every(Boolean) ? H.dates[startIndex(ser, H.dates.length)] : null;
  const covYears = covAt ? Math.floor((H.dates[H.dates.length - 1] - covAt) / 10000) : null;

  const gap = item.fairValueGap;
  const simLoss = item.simLoss;
  const ourLoss = bt?.lossRate;
  // 상대 등급 — 이 회차 전부가 원금비보장 1등급이므로 "안전"이 아니라 서로 견준 순서다.
  const tier = (ourLoss >= 1 || simLoss >= 2 || (gap != null && gap <= -15)) ? 2
             : (ourLoss > 0 || simLoss >= 0.4 || (gap != null && gap <= -5)) ? 1
             : 0;

  return {
    ...item,
    months: p?.maturityMonths,
    every,                                   // 관찰 주기(개월)
    steps: p ? p.schedule.length : null,
    barriers: p ? p.schedule.map((s) => s.barrier) : [],
    totalRate: p?.totalRate,
    ourLoss, ourFirst: bt?.firstRate, ourKi: bt?.kiRate, ourWorst: bt?.worst, runs: bt?.runs,
    covAt, covYears,
    low: dd?.min,                            // 워스트 퍼포머가 검증 구간 안에서 닿았던 최저 수준
    floor: item.knockIn ?? item.maturityBarrier,   // 원금이 깨지기 시작하는 선
    margin: dd && item.knockIn != null ? dd.min - item.knockIn : null,
    tier,
    // 가성비 — 연 수익률에서 공정가액 괴리(=출발 시점에 이미 빠져 있는 몫)를 뺀다
    value: (item.annualRate ?? 0) + (gap ?? 0),
  };
}

const batch = P[RCP];
const items = batch.items.map(enrich);
const filedOn = `${RCP.slice(0, 4)}.${RCP.slice(4, 6)}.${RCP.slice(6, 8)}`;
const [offerFrom, offerTo] = (batch.offer || '').split('~').map((s) => dot(s.trim()));
const head = items[0];

// ── 오늘 기준 이 회차의 위치 ─────────────────────────────────────────────────
const kst = (iso) => new Date(new Date(iso).getTime() + 9 * 3600000);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const stamp = (iso) => {
  if (!iso) return null;
  const d = kst(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`
       + `(${DOW[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const dayLabel = (ymd) => {                                  // "2026.08.24" → "8월 24일(월)"
  const [y, m, d] = ymd.split('.').map(Number);
  return `${m}월 ${d}일(${DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
};
const asOf = checkedAt ? kst(checkedAt) : new Date();
const asOfNum = asOf.getUTCFullYear() * 10000 + (asOf.getUTCMonth() + 1) * 100 + asOf.getUTCDate();
const numOfDot = (s) => Number((s || '').replace(/\D/g, ''));
const phase = asOfNum < numOfDot(offerFrom) ? 'before'
            : asOfNum > numOfDot(offerTo) ? 'after' : 'open';
const phaseLine = {
  before: `이 회차는 <b>${dayLabel(offerFrom)}부터</b> 청약이 열립니다. 오늘은 아직 주문을 받을 수 없습니다.`,
  open: `이 회차는 <b>오늘 청약 중</b>입니다. ${dayLabel(offerTo)}에 마감됩니다.`,
  after: `이 회차는 <b>${dayLabel(offerTo)}에 청약이 마감</b>되었습니다. 이 문서로는 주문을 받을 수 없습니다.`,
}[phase];

const TIERS = [
  { key: 'safe', name: '방어적', desc: '조건이 낮게 잡혀 조기상환이 잘 나는 쪽' },
  { key: 'mid', name: '중간', desc: '수익률과 조건이 균형을 이루는 쪽' },
  { key: 'hot', name: '공격적', desc: '수익률이 높은 만큼 조건도 빡빡한 쪽' },
];
const tierOf = (it) => TIERS[it.tier];

const IDX = new Set(['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI']);
const kindOf = (it) => it.underlyings.every((u) => IDX.has(u)) ? '지수'
  : it.underlyings.some((u) => IDX.has(u)) ? '혼합' : '종목';

// ── 추천 3종 — 고객 성향별로 한 자리씩 ───────────────────────────────────────
const krw = (it) => it.currency === 'KRW';
const pickMax = (list, by) => list.length ? list.reduce((a, b) => (by(b) > by(a) ? b : a)) : null;
const slots = [
  {
    label: '원금 방어를 먼저 보는 분',
    why: '이 회차에서 가장 느슨한 조건을 가진 축에 속하면서, 그 안에서는 수익률이 가장 높습니다.',
    pick: pickMax(items.filter((i) => i.tier === 0 && krw(i)), (i) => i.annualRate),
  },
  {
    label: '수익과 안정을 함께 보는 분',
    why: '조건이 한 단계 빡빡해진 대신 수익률이 크게 올라가는 구간입니다.',
    pick: pickMax(items.filter((i) => i.tier === 1 && krw(i) && (i.fairValueGap ?? 0) > -5), (i) => i.value),
  },
  {
    label: '수익률을 우선하는 분',
    why: '이번 회차에서 가장 높은 수익률입니다. 출발 가치가 크게 깎이지 않은 상품 중에서 골랐습니다.',
    pick: pickMax(items.filter((i) => (i.fairValueGap ?? 0) > -5), (i) => i.annualRate),
  },
].filter((s) => s.pick);
// 같은 상품이 두 자리를 차지하면 뒤쪽을 차선책으로 바꾼다
const seen = new Set();
for (const s of slots) {
  if (!seen.has(s.pick.no)) { seen.add(s.pick.no); continue; }
  const alt = pickMax(items.filter((i) => !seen.has(i.no) && (i.fairValueGap ?? 0) > -5 && krw(i)), (i) => i.value);
  if (alt) { s.pick = alt; seen.add(alt.no); }
}

// ── 주의가 필요한 상품 ───────────────────────────────────────────────────────
const caution = items
  .filter((it) => (it.fairValueGap ?? 0) <= -10 || it.tier === 2)
  .sort((a, b) => a.value - b.value)
  .slice(0, 4);
/** 이 상품의 검증 구간을 말로 — 상장이 늦은 기초자산이 섞이면 10년이 아니다 */
const covLabel = (it) => it.covAt == null ? '과거 구간'
  : `최근 ${it.covYears}년(${String(it.covAt).slice(0, 4)}년~)`;

const cautionReason = (it) => {
  const r = [];
  if ((it.fairValueGap ?? 0) <= -10) r.push(`1만원을 넣는 순간의 가치가 ${money(it.fairValue / 100)}입니다`);
  if (it.margin != null && it.margin < 0) r.push(`${covLabel(it)} 안에 원금 지키는 선을 이미 ${f1(-it.margin)}%p 뚫고 내려간 적이 있습니다`);
  else if (it.margin != null && it.margin < 10) r.push(`${covLabel(it)} 최저점이 원금 지키는 선 바로 위 ${f1(it.margin)}%p까지 왔습니다`);
  if ((it.simLoss ?? 0) >= 2) r.push(`발행사 20년 모의실험에서도 100번 중 ${f1(it.simLoss)}번은 손실이었습니다`);
  return r;
};

// 적용 변동성 — 문장 한 줄에만 쓴다
const vols = [...new Map(items.flatMap((it) => it.volatility.map((v) => [v.asset, v.vol]))).entries()]
  .sort((a, b) => b[1] - a[1]);

const rateMin = Math.min(...items.map((i) => i.annualRate));
const rateMax = Math.max(...items.map((i) => i.annualRate));
const gapWorst = items.reduce((a, b) => ((b.fairValueGap ?? 0) < (a.fairValueGap ?? 0) ? b : a));
const gapBest = items.reduce((a, b) => ((b.fairValueGap ?? 0) > (a.fairValueGap ?? 0) ? b : a));
const tierCount = [0, 1, 2].map((t) => items.filter((i) => i.tier === t).length);

// ── 상품 한 줄 설명 (전문 용어를 풀어쓴다) ───────────────────────────────────
const judgeLine = (it) => it.underlyings.length === 1
  ? `${esc(it.underlyings[0])} 하나만 봅니다.`
  : `${esc(it.underlyings.join(' · '))} 중 <b>더 많이 떨어진 하나</b>로 판정합니다.`;
const earlyLine = (it) => {
  const b = it.barriers[0];
  return `${it.every}개월마다 확인해서 처음 가격의 <b>${b}% 이상</b>(${sgn(b - 100, 0)}% 이내)이면 그 자리에서 끝나고 `
       + `1만원이 <b>${money(it.schedule[0].payout)}</b>이 됩니다.`;
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
          <span class="rsub">1만원 → ${it.every}개월 뒤 ${money(it.schedule[0].payout)}</span>
        </div>
        <ul class="how">
          <li><span class="hk">판정</span><span>${judgeLine(it)}</span></li>
          <li><span class="hk">조기상환</span><span>${earlyLine(it)}</span></li>
          <li><span class="hk">원금</span><span>${floorLine(it)}</span></li>
          <li><span class="hk">손실</span><span>${lossLine(it)}</span></li>
        </ul>
        ${stairs(it)}
        <div class="recfoot">
          <div class="rf"><span>${covLabel(it)} 최저점</span><b>${f1(it.low, 0)}%</b><small>원금 지키는 선 ${it.floor}%까지 ${it.margin != null ? sgn(it.margin, 0) + '%p' : '–'}</small></div>
          <div class="rf"><span>발행사 20년 모의실험</span><b>손실 ${f1(it.simLoss, 2)}%</b><small>첫 회 조기상환 ${f1(it.simFirst, 0)}%</small></div>
          <div class="rf"><span>1만원의 출발 가치</span><b>${money(it.fairValue / 100)}</b><small>공정가액 대비 ${sgn(it.fairValueGap, 2)}%</small></div>
        </div>
        <p class="recwhy"><b>추천 이유</b> ${slot.why}${it.currency !== 'KRW'
          ? ` <b>${it.currency}</b>로 투자하고 ${it.currency}로 돌려받는 상품이라, 위 수익률에 환율 변동이 그대로 더해지거나 빠집니다.` : ''}</p>
      </article>`;
};

const rows = [...items].sort((a, b) => a.tier - b.tier || b.value - a.value).map((it) => `          <tr>
            <td class="code">제${it.no}회</td>
            <td class="und">${esc(it.underlyings.join(' · '))}${it.currency !== 'KRW' ? ` <span class="fxs">${it.currency}</span>` : ''}</td>
            <td class="num rate">${f1(it.annualRate, 1)}%</td>
            <td class="num">${it.every}개월</td>
            <td class="num">${it.barriers[0]}%</td>
            <td class="num">${it.floor}%${it.knockIn == null ? '<span class="nk">만기만</span>' : ''}</td>
            <td class="num ${(it.fairValueGap ?? 0) <= -10 ? 'bad' : (it.fairValueGap ?? 0) <= -5 ? 'warn' : ''}">${money(it.fairValue / 100)}</td>
            <td class="num ${it.simLoss >= 2 ? 'bad' : it.simLoss >= 0.4 ? 'warn' : ''}">${f1(it.simLoss, 2)}%</td>
            <td>${tierChip(it)}</td>
          </tr>`).join('\n');

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

/* ── 섹션 ─────────────────────────────────────── */
section{margin-bottom:56px}
.rule{height:1px;background:var(--orange);margin-bottom:16px}
.stitle{font-size:25px;font-weight:700;letter-spacing:-.2px}
.slead{margin:8px 0 26px;color:var(--muted);font-size:16px;max-width:74ch}

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
.tw{overflow-x:auto;border:1px solid var(--hair)}
table{border-collapse:collapse;width:100%;min-width:900px;font-size:15px}
th{background:var(--soft);color:var(--ink);font-weight:700;text-align:left;padding:11px 12px;white-space:nowrap;
  border-bottom:1px solid var(--hair)}
th.num,td.num{text-align:right}
td{padding:10px 12px;border-bottom:1px solid var(--hair-s);white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surf)}
.code{font-family:var(--num);font-weight:600;color:var(--ink)}
.und{white-space:normal;min-width:200px}
.nk{font-size:12px;color:var(--blue);background:var(--tint);padding:1px 5px;margin-left:5px;white-space:nowrap}
.rate{font-weight:700;color:var(--orange-a)}
.fxs{font-family:var(--num);font-size:12px;color:var(--blue);background:var(--tint);padding:1px 5px}
td.warn{color:#8A6A0B}
td.bad{color:var(--bad);font-weight:600}
.tnote{margin:10px 0 0;font-size:14px;color:var(--faint)}

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
  .asof{grid-template-columns:minmax(0,1fr);padding:12px 14px;margin-bottom:32px}
  .asofk{grid-row:auto}
  section{margin-bottom:44px}
}
@media print{
  .asof{margin-bottom:14px;padding:8px 12px;background:none;break-inside:avoid}
  .asofv,.asofn{font-size:9.5pt}
  body{font-size:10pt;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .wrap{max-width:100%;padding:0}
  .mast{padding:16px 0 14px;margin-bottom:18px}
  .mast h1{font-size:24pt}
  .mast .sub,.offer dd{font-size:10pt}
  section{margin-bottom:16px}
  .stitle{font-size:15pt}
  .slead{margin-bottom:12px;font-size:9.5pt}
  .stat b{font-size:19pt}
  .page-break{break-before:page}
  .rec,.cau,.chk,.script,.recs>*,table{break-inside:avoid}
  .recs{gap:12px}
  .rec{padding:14px 16px}
  .rec h3{font-size:14pt}
  .rnum{font-size:26pt}
  .how{margin:12px 0 14px;gap:6px}
  .rf b{font-size:12pt}
  .recwhy{margin-top:10px}
  table{font-size:9pt;min-width:0}
  th,td{padding:5px 7px}
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
      <dt>청약기간</dt><dd>${offerFrom} ~ ${offerTo}</dd>
      <dt>발행일 / 만기</dt><dd>${dot(head.issueDate)} / ${dot(head.maturityDate)}</dd>
    </dl>
  </div>
</header>

<main class="wrap">

<div class="asof ${phase}">
  <p class="asofk">홈페이지 확인</p>
  <p class="asofv">${stamp(checkedAt) || '–'} 기준 · 미래에셋증권 ELS/DLS 캘린더에 <b>청약 진행중 ${onOfferNow == null ? '–' : `${onOfferNow}건`}</b></p>
  <p class="asofn">${phaseLine}</p>
</div>

<section>
  <div class="rule"></div>
  <h2 class="stitle">이번 회차 한눈에</h2>
  <p class="slead">이번 주 청약하는 ${items.length}종을 조건·가격·과거 성과 세 가지로 나눠 봤습니다. 아래 숫자는 모두 투자설명서 원문에서 뽑았습니다.</p>
  <div class="stats">
    <div class="stat"><span>상품 수</span><b>${items.length}종</b><small>지수형 ${items.filter((i) => kindOf(i) === '지수').length} · 혼합 ${items.filter((i) => kindOf(i) === '혼합').length} · 종목형 ${items.filter((i) => kindOf(i) === '종목').length}</small></div>
    <div class="stat"><span>연 수익률</span><b>${f1(rateMin, 1)}~${f1(rateMax, 1)}%</b><small>최고 제${items.find((i) => i.annualRate === rateMax).no}회</small></div>
    <div class="stat"><span>만기</span><b>${head.months}개월</b><small>${dot(head.maturityDate)} 만기</small></div>
    <div class="stat"><span>등급 분포</span><b>${tierCount[0]} / ${tierCount[1]} / ${tierCount[2]}</b><small>방어적 / 중간 / 공격적</small></div>
  </div>
  <ul class="keys">
    <li>모두 <b>원금비보장 1등급(매우높은위험)</b> 상품입니다. 아래 등급은 안전하다는 뜻이 아니라 <b>${items.length}종끼리 견준 순서</b>입니다.</li>
    <li>같은 1만원이라도 상품마다 <b>출발 가치가 다릅니다.</b> 가장 좋은 제${gapBest.no}회는 ${money(gapBest.fairValue / 100)}, 가장 나쁜 제${gapWorst.no}회는 ${money(gapWorst.fairValue / 100)}입니다. 이 차이는 홈페이지 상품 목록에는 나오지 않습니다.</li>
    <li>발행사가 이론가를 계산할 때 쓴 변동성은 ${vols.slice(0, 2).map(([a, v]) => `<b>${esc(a)} ${f1(v, 0)}%</b>`).join(', ')} 순입니다. 변동성이 높을수록 수익률도 높지만 그만큼 흔들린다는 뜻입니다.</li>
  </ul>
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
  <p class="slead">방어적인 순서로 정렬했습니다. 같은 등급 안에서는 수익률에서 출발 가치 손해를 뺀 순서입니다.</p>
  <div class="tw">
    <table>
      <thead>
        <tr>
          <th>회차</th><th>기초자산</th><th class="num">연 수익률</th><th class="num">확인 주기</th>
          <th class="num">첫 조기상환</th><th class="num">원금 지키는 선</th><th class="num">1만원의 출발 가치</th>
          <th class="num">20년 손실 확률</th><th>등급</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
  <p class="tnote">첫 조기상환 = 처음 확인일에 이 수준 이상이면 그 자리에서 끝납니다. 원금 지키는 선 = 만기까지 이 아래로 종가가 내려간 적이 없으면 원금과 이자를 다 받습니다. <b>만기만</b> 표시가 붙은 상품은 낙인이 없어 중간 하락을 따지지 않고 만기 그날만 봅니다. 20년 손실 확률 = 발행사가 투자설명서에 실은 모의실험 결과입니다.</p>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">이번 주 권하지 않는 상품</h2>
  <p class="slead">수익률만 보면 눈에 띄지만, 조건이나 가격에서 대가를 치르고 있는 상품입니다.</p>
  <div class="caus">
${cautionCards}
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2 class="stitle">가입 전 꼭 짚어드릴 4가지</h2>
  <div class="checks">
    <div class="chk">
      <h4>1. 1만원이 1만원이 아닙니다</h4>
      <p>투자설명서에는 발행일 기준 공정가액이 적혀 있습니다. 이번 회차는 ${money(gapBest.fairValue / 100)}부터 ${money(gapWorst.fairValue / 100)}까지 벌어집니다. 게다가 이 값은 만기까지의 헤지비용을 뺀 값이라 실제 비용은 이보다 큽니다.</p>
    </div>
    <div class="chk">
      <h4>2. 중간에 깨면 손해입니다</h4>
      <p>중도상환은 그 시점 공정가액의 95%(가입 6개월 안이면 90%)로 정산됩니다. 원금이 아니라 그날의 평가금액 기준입니다. 3년을 묻어둘 수 있는 돈으로만 하셔야 합니다.</p>
    </div>
    <div class="chk">
      <h4>3. 판정은 종가로 합니다</h4>
      <p>장중에 잠깐 원금 지키는 선을 뚫어도 그날 종가가 위에서 끝나면 괜찮습니다. 반대로 종가가 한 번이라도 아래면 그걸로 기록이 남습니다.</p>
    </div>
    <div class="chk">
      <h4>4. 과거가 미래를 보장하지 않습니다</h4>
      <p>이 문서의 최저점은 최근 시장이 좋았던 구간을 포함합니다. 특히 반도체 종목은 최근 1년 상승분이 커서 과거 수치가 실제보다 안전해 보일 수 있습니다. 상장이 늦은 종목은 검증 구간 자체가 짧습니다.</p>
    </div>
  </div>
  <div class="script">
    <h4>상담 시 이 순서로 말씀하시면 됩니다</h4>
    <ol>
      <li>"이 상품은 3년짜리인데, ${head.every}개월마다 끝날 기회가 옵니다. 대부분은 첫 번째나 두 번째에 끝납니다."</li>
      <li>"${judgeLine(slots[0].pick).replace(/<\/?b>/g, '')}"</li>
      <li>"올라야 버는 게 아니라, 많이 안 떨어지면 버는 구조입니다."</li>
      <li>"대신 크게 떨어지면 그 하락률이 그대로 손실로 옵니다. 원금이 보장되지 않습니다."</li>
      <li>"3년 동안 안 쓸 돈인지 먼저 확인해 주세요. 중간에 빼면 그날 평가금액의 95%만 받습니다."</li>
    </ol>
  </div>
</section>

</main>

<footer class="wrap">
  <p>출처 — 금융감독원 전자공시시스템 일괄신고추가서류 접수번호 ${RCP} (${filedOn} 공시). 조건·공정가액·적용 변동성·수익률 모의실험은 공시 원문에서 자동 추출했습니다.</p>
  <p>판매 상태는 ${stamp(checkedAt) || '–'}에 미래에셋증권 ELS/DLS 캘린더를 진행상태별로 조회해 확인했습니다. 공시는 청약 시작 며칠 전에 올라오므로, 문서에 실린 회차가 오늘 곧바로 청약 가능한 것은 아닙니다.</p>
  <p>최저점과 자체 검증 수치는 ${dot(String(H.dates[0]))}~${dot(String(H.dates[H.dates.length - 1]))} 기초자산 일별 종가로 매 거래일 가입을 가정해 만기까지 돌린 결과입니다. 상장이 늦은 기초자산이 섞인 상품은 검증 구간이 그만큼 짧으며, 상품마다 실제 구간을 표기했습니다.</p>
  <p>본 자료는 투자 권유를 위한 참고 자료이며, 실제 청약 전 투자설명서와 간이투자설명서를 반드시 확인하셔야 합니다. 원금 손실이 발생할 수 있는 상품입니다.</p>
  <p>생성 ${filedOn} · scripts/build_els_proposal.mjs</p>
</footer>
`;

await writeFile(OUT, html);
console.log(`${OUT} — 제${items[0].no}~${items[items.length - 1].no}회 ${items.length}종, 추천 ${slots.map((s) => s.pick.no).join('/')}, 주의 ${caution.map((c) => c.no).join('/')}`);
