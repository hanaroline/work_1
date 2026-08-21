#!/usr/bin/env node
/**
 * tools/discovery/prospectus_<접수번호>.txt -> tools/discovery/prospectus_parsed.json
 *
 * 일괄신고추가서류 본문에서 회차별 조건·이론가 변수·발행사 수익률 모의실험을 뽑는다.
 * 문서는 회차마다 "종목명" 으로 시작하는 블록이 반복되는 구조라 그 경계로 자른다.
 *
 * 홈페이지 목록에는 리자드 조항·공정가액·적용 변동성 칸이 아예 없다. 세일즈 자료에서
 * 그 세 가지를 말하려면 이 문서가 유일한 출처다.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const DIR = 'tools/discovery';
const OUT = `${DIR}/prospectus_parsed.json`;

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();
const numOf = (s) => (s == null ? null : Number(String(s).replace(/[^0-9.\-]/g, '')));
const ymd = (s) => {
  const m = s && s.match(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

/** "S&P500 지수 / HSCEI 지수 / NIKKEI225 지수" -> ["S&P500","HSCEI","NIKKEI225"] */
const parseUnderlyings = (s) => clean(s)
  .split(/\s*\/\s*|\)(?=[A-Z가-힣])/)   // 구분자가 "/" 인 회차와 괄호로 이어붙인 회차가 섞여 있다
  .map((x) => x.replace(/\([^)]*\)/g, '').replace(/\s*(지수|보통주|주식)\s*$/, '').replace(/,?\s*Inc\.?$|\s*Class A$/i, '').trim())
  .filter(Boolean);

function parseBlock(text) {
  const p = {};

  const title = clean((text.match(/종목명\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.title = title;
  p.no = numOf((title.match(/제(\d{4,5})회/) || [])[1]);
  p.riskLabel = (title.match(/\((매우높은위험|높은위험|다소높은위험|보통위험|낮은위험|매우낮은위험),/) || [])[1] || null;
  p.riskGrade = numOf((title.match(/상품위험등급\s*:\s*(\d)/) || [])[1]);
  p.principalProtected = /원금지급|원금보장/.test(title);

  p.underlyings = parseUnderlyings((text.match(/기초자산\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.issueSize = numOf((text.match(/모 ?집 ?총 ?액\s*\n\s*\t?\s*([\d,]+)원/) || [])[1]);

  p.offerStart = ymd((text.match(/청약시작일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.offerEnd = ymd((text.match(/청약종료일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.issueDate = ymd((text.match(/발 ?행 ?일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.maturityDate = ymd((text.match(/만 ?기 ?일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.baseDate = ymd((text.match(/최초기준가격평가일\s*:\s*([^\n○]+)/) || [])[1]);

  // 공정가액 — 발행가 10,000원 대비 얼마나 깎여 있는지가 실질 비용의 하한
  // 원화 표기와 USD 표기("USD10,000 당 [USD 9,908.98]")가 섞여 있다
  const fvKrw = text.match(/공정가격은[^[]*\[([\d,.]+)원\]/);
  const fvUsd = text.match(/공정가격은[^[]*USD\s*([\d,]+)\s*당\s*\[USD\s*([\d,.]+)\]/);
  p.currency = fvUsd ? 'USD' : 'KRW';
  p.faceValue = fvUsd ? numOf(fvUsd[1]) : 10000;
  p.fairValue = fvUsd ? numOf(fvUsd[2]) : numOf(fvKrw && fvKrw[1]);
  p.fairValueDate = ymd((text.match(/본 증권의 공정가격은\s*([^기]+)기준/) || [])[1]);
  if (p.fairValue) p.fairValueGap = +((p.fairValue / p.faceValue - 1) * 100).toFixed(2);

  // 이론가 산출에 쓴 변동성·상관계수
  const volLine = (text.match(/기초자산가격 변동성\s*\n\s*\t?\s*([^\n]+)/) || [])[1] || '';
  p.volatility = [...volLine.matchAll(/-\s*([^:]+?)\s*:\s*([\d.]+)%/g)]
    .map((m) => ({ asset: clean(m[1]).replace(/\s*(지수|보통주)$/, ''), vol: Number(m[2]) }));
  const corrLine = (text.match(/상관계수\s*\n\s*\t?\s*([^\n]+)/) || [])[1] || '';
  p.correlation = [...corrLine.matchAll(/-\s*([^:]+?)\s*:\s*(-?[\d.]+)(?!%)/g)]
    .map((m) => ({ pair: clean(m[1]).replace(/\s*지수/g, ''), rho: Number(m[2]) }));

  // 조기상환 차수별 평가일·상환금액
  const schedRows = [...text.matchAll(/(\d{1,2})차\s*\n\s*\t?\s*(\d{4}년\s*\d{2}월\s*\d{2}일)\s*\n\s*\t?\s*액면금액\s*×\s*([\d.]+)%/g)];
  p.schedule = schedRows.map((m) => ({ step: Number(m[1]), date: ymd(m[2]), payout: Number(m[3]) }));

  // 차수별 배리어. 조건 번호가 (2-1)/(2-2) 로 갈라지는 리자드 상품이 있어
  // 번호가 아니라 "N차 자동조기상환평가일에" 문구로 잡는다.
  const barRows = [...text.matchAll(
    /(\d{1,2})차 자동조기상환평가일에 (?:모든 )?기초자산의 자동조기상환평가가격이 (?:각 )?최초기준가격의\s*\[(\d{2,3}(?:\.\d+)?)%\]\s*이상인 경우[^\n]*?액면금액\s*\*\s*([\d.]+)%/g)];
  for (const m of barRows) {
    const s = p.schedule.find((x) => x.step === Number(m[1]));
    if (s) { s.barrier = Number(m[2]); s.payout = Number(m[3]); }
  }

  // 리자드 — "N차 평가일까지 X% 미만으로 내려간 적 없으면 상환". 홈페이지 목록에 없는 조항이다.
  const lz = text.match(
    /(\d{1,2})차 자동조기상환평가일까지 (?:모든 기초자산 중 어느 하나도|기초자산의 평가가격이) (?:각 )?최초기준가격의\s*\[(\d{2,3}(?:\.\d+)?)%\]\s*미만으로 하락한 적이 없는 경우[^\n]*?액면금액\s*\*\s*([\d.]+)%/);
  p.lizard = lz ? { step: Number(lz[1]), barrier: Number(lz[2]), payout: Number(lz[3]) } : null;

  // 만기 배리어
  p.maturityBarrier = numOf((text.match(/(?:모든 )?기초자산의 만기평가가격이 (?:각 )?최초기준가격의\s*\[(\d{2,3}(?:\.\d+)?)%\]\s*이상인 경우/) || [])[1]);

  // 낙인 — 반드시 "최종관찰일(포함)까지" 조항에서만 읽는다.
  // 리자드 관찰 배리어도 같은 "미만으로 하락한 적이" 문구를 쓰기 때문에 구분이 필요하다.
  p.knockIn = numOf((text.match(
    /최종관찰일\(포함\)까지 (?:모든 기초자산 중 어느 하나(?:도|라도)|기초자산의 평가가격이) (?:각 )?최초기준가격의\s*\[(\d{2,3}(?:\.\d+)?)%\]\s*미만으로 하락한 적이/) || [])[1]);
  p.knockInBasis = p.knockIn != null && /미만으로 하락한 적이[^)]*\(종가 기준\)/.test(text) ? '종가' : null;

  // 연 수익률 (세전)
  const rates = [...text.matchAll(/\(연\s*([\d.]+)%\)/g)].map((m) => Number(m[1]));
  p.annualRate = rates.length ? Math.max(...rates) : null;
  const totals = [...text.matchAll(/([\d.]+)%\(연\s*[\d.]+%\)/g)].map((m) => Number(m[1]));
  p.totalRate = totals.length ? Math.max(...totals) : null;

  // 발행사 수익률 모의실험
  const simIdx = text.indexOf('수익률 모의실험');
  if (simIdx >= 0) {
    const seg = text.slice(simIdx, simIdx + 4000);
    // 표는 "빈 줄로 구분된 탭 셀 묶음" 으로 떨어진다. 손실 구간 행은 수익률 칸이 없어
    // 셀이 3개뿐이라, 정규식 한 방으로 긁으면 그 행들이 통째로 빠진다.
    const rows = seg.split(/\n\s*\n/)
      .map((g) => g.split('\n').map((l) => l.replace(/^\s*\t\s*/, '').trim()).filter(Boolean))
      .filter((cells) => cells.length >= 3 && /^[\d,]+$/.test(cells[cells.length - 2]) && /^[\d.]+%$/.test(cells[cells.length - 1]))
      .map((cells) => ({
        label: clean(cells[0]),
        ret: cells.length >= 4 ? clean(cells[1]) : null,
        count: numOf(cells[cells.length - 2]),
        share: Number(cells[cells.length - 1].replace('%', '')),
      }))
      .filter((r) => r.label && r.label.length < 24);
    p.simulation = rows;
    const note = seg.match(/투자시점이\s*(\d{4}년\s*\d{2}월\s*\d{2}일)부터\s*(\d{4}년\s*\d{2}월\s*\d{2}일)/);
    if (note) p.simRange = { from: ymd(note[1]), to: ymd(note[2]) };
    const tot = rows.find((r) => /Total/i.test(r.label));
    p.simRuns = tot ? tot.count : null;
    p.simFirst = (rows.find((r) => /1차 조기상환/.test(r.label)) || {}).share ?? null;
    p.simLoss = rows.filter((r) => /^-\d|이하$|^-?\d+% ~/.test(r.ret || '') || /^-/.test(r.label))
      .reduce((s, r) => s + (r.share || 0), 0);
    // 손실 구간만 따로 (만기상환손실 이후 행)
    const li = rows.findIndex((r) => /만기상환손실/.test(r.label));
    if (li >= 0) {
      const lossRows = rows.slice(li).filter((r) => !/진행중|Total/i.test(r.label));
      p.lossBuckets = lossRows;
      p.simLoss = +lossRows.reduce((s, r) => s + (r.share || 0), 0).toFixed(2);
    }
  }
  return p;
}

const files = (await readdir(DIR)).filter((f) => /^prospectus_\d+\.txt$/.test(f));
const out = {};
for (const f of files) {
  const text = await readFile(`${DIR}/${f}`, 'utf8');
  const marks = [...text.matchAll(/종목명/g)].map((m) => m.index);
  if (marks.length < 2) continue;
  const blocks = marks.map((s, i) => text.slice(s, marks[i + 1] ?? text.length));
  const items = blocks.map(parseBlock).filter((p) => p.no);
  if (!items.length) continue;
  const rcp = f.match(/(\d+)/)[1];
  out[rcp] = {
    rcpNo: rcp,
    source: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcp}`,
    range: `${Math.min(...items.map((i) => i.no))}~${Math.max(...items.map((i) => i.no))}`,
    offer: `${items[0].offerStart} ~ ${items[0].offerEnd}`,
    count: items.length,
    items,
  };
  console.log(`${f}: 제${out[rcp].range}회 ${items.length}건 / 청약 ${out[rcp].offer}`);
}

await writeFile(OUT, JSON.stringify(out, null, 2));
console.log(`\n${OUT} 저장`);
