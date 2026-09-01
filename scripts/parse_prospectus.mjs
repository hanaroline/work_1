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

/**
 * 기초자산 표기는 회차마다 제각각이다 — "S&P500 지수 / HSCEI 지수" 처럼 슬래시로 나눈 것도 있고
 * "Applied Materials, Inc.(Applied Materials+AMAT UW Equity)Micron Technology Inc(...)" 처럼
 * 괄호로 붙여 쓴 것도 있다. 구분자로 자르는 대신 알려진 기초자산을 찾아 등장 순서대로 세운다.
 * 이름은 data/els.js 의 과거 시세 키와 같게 맞춘다.
 */
const ASSETS = [
  [/EURO\s?STOXX\s?50|EUROSTOXX50/i, 'EuroStoxx50'],
  [/S&P\s?500/i, 'S&P500'],
  [/NIKKEI\s?225/i, 'Nikkei225'],
  [/KOSPI\s?200/i, 'KOSPI200'],
  [/HSCEI/i, 'HSCEI'],
  [/삼성전자/, '삼성전자'],
  [/SK\s?하이닉스/, 'SK하이닉스'],
  [/Micron|MU UW/i, '마이크론 테크놀로지'],
  [/Applied Materials|AMAT/i, '어플라이드 머티어리얼즈'],
  [/Broadcom|AVGO|브로드컴/i, '브로드컴'],
  [/Tesla|TSLA|테슬라/i, '테슬라'],
  [/Palantir|PLTR/i, '팔란티어 테크'],
];
const parseUnderlyings = (s) => {
  const line = clean(s);
  return ASSETS
    .map(([re, name]) => [line.search(re), name])
    .filter(([at]) => at >= 0)
    .sort((a, b) => a[0] - b[0])
    .map(([, name]) => name);
};

/**
 * 목표시장 설정 및 설정 근거 — 회차마다 「상품개요(종목명)」 바로 앞에 붙는 블록이다.
 *
 * 완전판매 스크립트의 「위험등급 유의사항」은 지금까지 공용 문구(사내 핵심요약설명서)로만
 * 채울 수 있어 회차마다 「확인필요」로 남았다. 그런데 그 근거가 되는 내용이 투자설명서
 * 안에 회차별로 그대로 있다 — 목표시장 분석표의 위험추구성향·손실감내능력·투자기간과
 * 목표시장 등급이다. 여기서 뽑아 두면 등급별 유의사항을 원문 근거로 채울 수 있다.
 *
 * 표는 「라벨 / ■□ 선택지」 구조로 떨어진다. ■ 만 골라 담는다.
 */
const TM_ROWS = [
  ['clientType', '고객유형'],
  ['knowledge', '지식과 경험'],
  ['lossTolerance', '손실감내능력'],
  ['appetite', '위험추구성향'],
  ['horizon', '투자목적을 고려한 투자기간'],
  ['holding', '보유 가능기간'],
];
function parseTargetMarket(pre) {
  const at = pre.lastIndexOf('목표시장 설정 및 설정 근거');
  if (at < 0) return null;
  const seg = pre.slice(at);
  const tm = {};

  const gm = seg.match(/위험등급\s*\(\s*6\s*단계\s*\)\s*중\s*([^해]*?)\s*에?\s*해당하는/);
  tm.grades = gm ? [...gm[1].matchAll(/(\d)\s*등급/g)].map((m) => Number(m[1])) : [];

  /* 라벨 위치로 행을 자르고 그 안에서 ■ 항목만 담는다 */
  const idx = TM_ROWS.map(([, label]) => [label, seg.indexOf(label)]).filter(([, i]) => i >= 0);
  for (let i = 0; i < idx.length; i++) {
    const [label, from] = idx[i];
    const to = i + 1 < idx.length ? idx[i + 1][1] : seg.length;
    const row = seg.slice(from + label.length, to);
    const key = (TM_ROWS.find(([, l]) => l === label) || [])[0];
    tm[key] = [...row.matchAll(/■\s*([^\n□■]+)/g)].map((m) => clean(m[1])).filter(Boolean);
  }

  /**
   * 위험추구성향 칸은 선택지 이름 아래 줄에 투자성향·상품위험등급 대응이 달려 있다.
   *   ■ 위험선호형
   *   (투자성향:성장형,성장추구형 / 상품위험등급:1,2,3등급)
   * 이 대응이 등급별 유의사항을 쓸 수 있는 근거다.
   */
  const am = seg.match(/■\s*(위험회피형|위험중립형|위험선호형)[\s\S]{0,20}?\(\s*투자성향\s*:\s*([^/]+?)\s*\/\s*상품위험등급\s*:\s*([^)]+?)\s*\)/);
  tm.appetiteDetail = am
    ? { name: clean(am[1]), profile: clean(am[2]).replace(/\s*,\s*/g, '·'), grades: clean(am[3]) }
    : null;

  const bm = seg.match(/목표시장 설정 근거\s*:\s*([\s\S]*?)(?=\n\s*\d\.\s*상품개요|종목명|$)/);
  tm.basis = bm ? clean(bm[1]) : null;

  return tm.grades.length || tm.appetiteDetail ? tm : null;
}

function parseBlock(text, pre) {
  const p = {};

  const title = clean((text.match(/종목명\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.title = title;
  p.no = numOf((title.match(/제(\d{4,5})회/) || [])[1]);
  /**
   * 위험등급 표기는 상품 종류에 따라 뒤에 오는 글자가 다르다.
   *   파생결합증권: "(높은위험,원금비보장)"   → 쉼표
   *   파생결합사채: "(낮은위험)"              → 닫는 괄호
   * 쉼표만 보면 ELB 전 회차의 위험등급 라벨이 통째로 빠진다.
   */
  p.riskLabel = (title.match(/\((매우높은위험|높은위험|다소높은위험|보통위험|낮은위험|매우낮은위험)[,)]/) || [])[1] || null;
  p.riskGrade = numOf((title.match(/상품위험등급\s*:\s*(\d)/) || [])[1]);
  /**
   * 원금지급형 여부는 제목의 「원금지급」 문구만으로 판단하면 안 된다.
   * 파생결합사채(ELB·DLB)는 사채이므로 종류 자체가 원금지급형인데 제목에 그 말이 없다
   * (예: "제4058회 파생결합사채(주가연계파생결합사채)(낮은위험)(상품위험등급:5등급)").
   * 이걸 놓치면 원금이 지켜지는 상품을 두고 "최대 원금 전액 손실 가능" 이라고 설명하게 된다.
   */
  p.instrument = /파생결합사채/.test(title) ? '파생결합사채' : '파생결합증권';
  p.principalProtected = /원금지급|원금보장/.test(title) || p.instrument === '파생결합사채';

  p.underlyings = parseUnderlyings((text.match(/기초자산\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.issueSize = numOf((text.match(/모 ?집 ?총 ?액\s*\n\s*\t?\s*([\d,]+)원/) || [])[1]);

  p.offerStart = ymd((text.match(/(?<!대상)청약시작일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.offerEnd = ymd((text.match(/(?<!대상)청약종료일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);

  /**
   * 숙려제도 — 개인 일반투자자는 숙려기간과 가입의사확인기간에 청약을 할 수 없다.
   * 즉 이 사람들의 실제 마감은 "숙려제도 대상청약종료일" 이지 위의 청약종료일이 아니다.
   * 홈페이지 목록에는 청약기간만 나오므로 여기서 뽑지 않으면 상담에서 나흘을 잘못 안내한다.
   */
  p.coolStart = ymd((text.match(/숙려제도\s*대상청약시작일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  p.coolEnd = ymd((text.match(/숙려제도\s*대상청약종료일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  const cool = (text.match(/숙\s*려\s*기\s*간\s*\n\s*\t?\s*(\d{4}년\s*\d{2}월\s*\d{2}일)\s*~\s*(\d{4}년\s*\d{2}월\s*\d{2}일)/) || []);
  p.coolingFrom = ymd(cool[1]);
  p.coolingTo = ymd(cool[2]);
  const confirm = (text.match(/가입의사확인기간\s*\n\s*\t?\s*([^\n]+)/) || [])[1] || '';
  p.confirmBy = ymd(confirm);
  p.confirmNote = clean(confirm) || null;          // "2026년 08월 28일 오후 5시까지"
  p.payDate = ymd((text.match(/납 ?입 ?일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  /**
   * 최소청약금액 — 완전판매 스크립트의 '청약단위' 항목이 이 값을 읽는다.
   * 외화 회차는 "USD 1,000" 으로 적혀 있어 「원」을 요구하면 통째로 빠진다
   * (제38032·38041·38057·38059·38081회). 통화를 같이 뽑는다.
   */
  const minLine = (text.match(/최소청약금액\s*\n\s*\t?\s*([^\n]+)/) || [])[1] || '';
  p.minAmount = numOf((minLine.match(/([\d,]+(?:\.\d+)?)/) || [])[1]);
  p.minAmountCcy = /USD/i.test(minLine) ? 'USD'
    : /EUR/i.test(minLine) ? 'EUR'
      : /JPY|엔/i.test(minLine) ? 'JPY'
        : (/원/.test(minLine) ? 'KRW' : null);
  // 판매 절차 조항 — 회차 블록 안에 ※ 로 반복되는 것만 쓴다.
  // (고령투자자 지정 문구는 문서 머리의 유의사항에만 있어 회차별로는 잡히지 않는다)
  p.recordingRight = /판매과정에 대한 녹취 자료를 요청할 수 있으며/.test(text);
  p.riskSummaryDoc = /투자 위험 등을 요약한 설명서를 받으며/.test(text);
  p.maxLossNotice = /최대 원금손실 가능금액 등을 숙려기간 중 고지받습니다/.test(text);
  p.issueDate = ymd((text.match(/발 ?행 ?일\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
  // 실물인도형은 "만 기 일(실물인도일)" 로 적혀 있다
  p.maturityDate = ymd((text.match(/만 ?기 ?일(?:\([^)]*\))?\s*\n\s*\t?\s*([^\n]+)/) || [])[1]);
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
    .map((m) => ({ asset: parseUnderlyings(m[1])[0] || clean(m[1]), vol: Number(m[2]) }));
  /**
   * 상관계수 쌍 이름은 쉼표로 나누면 안 된다 — "Tesla, Inc.,팔란티어 테크" 처럼 회사명 자체에
   * 쉼표가 들어가는 표기가 있어 셋으로 쪼개진다. 그러면 몬테카를로의 corrMatrix() 가 이름을
   * 못 찾아 상관계수를 조용히 0 으로 두고 돌아버린다(경고 없음). 기초자산과 똑같이
   * 알려진 자산을 등장 순서대로 찾는 방식으로 뽑는다.
   */
  const corrLine = (text.match(/상관계수\s*\n\s*\t?\s*([^\n]+)/) || [])[1] || '';
  p.correlation = [...corrLine.matchAll(/-\s*([^:]+?)\s*:\s*(-?[\d.]+)(?!%)/g)]
    .map((m) => {
      const names = parseUnderlyings(m[1]);
      return { pair: (names.length === 2 ? names : [clean(m[1])]).join(' · '), rho: Number(m[2]) };
    });

  // 조기상환 차수별 평가일·상환금액.
  // 리자드 회차는 한 칸에 두 갈래를 적어 "1)액면금액 × 110.00%" 처럼 번호가 앞에 붙는다.
  // 이 번호를 건너뛰지 않으면 그 차수만 표에서 빠져 6회차가 5회차로 줄어든다 (제38048회).
  const schedRows = [...text.matchAll(/(\d{1,2})차\s*\n\s*\t?\s*(\d{4}년\s*\d{2}월\s*\d{2}일)\s*\n\s*\t?\s*(?:\d\))?\s*액면금액\s*×\s*([\d.]+)%/g)];
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

  /**
   * 월수익지급 (월지급식 ELB) — 조기상환·만기상환과 별개로 매달 조건을 보고 쿠폰을 준다.
   *   "매월수익지급평가일에 모든 기초자산의 월수익지급평가가격이 모두 각각의
   *    최초기준가격의 65% 이상인 경우 -> 원금 * 0.50% 지급"
   * 이 조항이 월지급식의 핵심인데 조기상환 표에는 안 나온다. 빠뜨리면 상담에서
   * 「매달 언제 얼마를 받는지」 를 설명할 근거가 없다.
   */
  const mi = text.match(/월수익지급평가가격이[^\n]*?최초기준가격의\s*\[?(\d{2,3}(?:\.\d+)?)%\]?\s*이상인 경우[^\n]*?원금\s*[*×]\s*\[?([\d.]+)%\]?/);
  p.monthlyIncome = mi ? { barrier: Number(mi[1]), rate: Number(mi[2]) } : null;
  if (p.monthlyIncome) {
    /* 월수익지급평가일 차수 — 표에서 가장 큰 차수를 센다 */
    const seg = text.slice(text.indexOf('월수익지급평가일'));
    const seqs = [...seg.slice(0, 6000).matchAll(/(?:^|\n)\s*\t?\s*(\d{1,2})\s*\n\s*\t?\s*\d{4}년\s*\d{2}월\s*\d{2}일/g)]
      .map((m) => Number(m[1]));
    p.monthlyIncome.count = seqs.length ? Math.max(...seqs) : null;
    const pay = seg.match(/월수익지급일\s*:\s*([^\n]+)/);
    p.monthlyIncome.payRule = pay ? clean(pay[1]) : null;
  }

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
  // 월지급식은 "3.1175%(연 37.41%)" 처럼 한 달치가 적혀 있어 문서 값을 그대로 쓰면 안 된다.
  // 총수익률은 연 수익률 × 보유연수로 통일한다.
  const totals = [...text.matchAll(/([\d.]+)%\(연\s*[\d.]+%\)/g)].map((m) => Number(m[1]));
  p.docMaxRate = totals.length ? Math.max(...totals) : null;

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

  /* 목표시장 블록은 종목명 앞에 있으므로 직전 구간(pre)에서 읽는다 */
  p.targetMarket = parseTargetMarket(pre || '');
  return p;
}

const files = (await readdir(DIR)).filter((f) => /^prospectus_\d+\.txt$/.test(f));
const out = {};
const warn = [];
for (const f of files) {
  const text = await readFile(`${DIR}/${f}`, 'utf8');
  const marks = [...text.matchAll(/종목명/g)].map((m) => m.index);
  /* 한 회차만 담긴 간이투자설명서도 있다 (제38005회) — 버리지 않는다 */
  if (!marks.length) continue;
  const items = marks
    .map((s, i) => parseBlock(
      text.slice(s, marks[i + 1] ?? text.length),
      text.slice(i > 0 ? marks[i - 1] : 0, s), /* 목표시장 블록이 들어 있는 직전 구간 */
    ))
    .filter((p) => p.no);
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

  /**
   * 조용히 틀리는 것을 막는다. 기초자산 표기는 회차마다 제각각이라 ASSETS 표에 없는
   * 새 종목이 들어오면 목록에서 통째로 빠지는데, 변동성·상관계수는 그대로 들어오므로
   * 개수가 어긋난다. 이 어긋남이 유일한 신호다 — 놓치면 두 종목 상품이 한 종목으로
   * 잡히고 몬테카를로가 상관계수 없이 돌아간다.
   */
  for (const it of items) {
    const nu = it.underlyings.length;
    if (nu !== it.volatility.length) {
      warn.push(`제${it.no}회 기초자산 ${nu}종인데 변동성은 ${it.volatility.length}종 — ASSETS 표에 없는 종목이 있다`);
    }
    const want = (nu * (nu - 1)) / 2;
    if (it.correlation.length !== want) {
      warn.push(`제${it.no}회 상관계수 ${it.correlation.length}쌍 (기초자산 ${nu}종이면 ${want}쌍이어야 함)`);
    }
    for (const c of it.correlation) {
      const names = c.pair.split(' · ');
      if (names.length !== 2 || names.some((n) => !it.underlyings.includes(n))) {
        warn.push(`제${it.no}회 상관계수 쌍 "${c.pair}" 이 기초자산과 이름이 다르다 — 시뮬레이션에서 0 으로 처리된다`);
      }
    }
  }
}

await writeFile(OUT, JSON.stringify(out, null, 2));
console.log(`\n${OUT} 저장`);
if (warn.length) {
  console.log(`\n★ 정합성 경고 ${warn.length}건`);
  for (const line of warn) console.log(`  - ${line}`);
  process.exitCode = 1;
} else {
  console.log('정합성 검사 통과 — 기초자산·변동성·상관계수 개수와 이름이 모두 맞는다');
}
