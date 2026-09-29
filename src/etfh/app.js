/* ETF 편입종목 조회 — 화면. 자료는 빌드 때 #etfh-data 에 심긴다(바깥 호출 없음). */
(function () {
  'use strict';
  const D = JSON.parse(document.getElementById('etfh-data').textContent);
  const META = D.meta, ITEMS = D.items;
  const PERIODS = ['D1', 'W1', 'M1', 'M3', 'M6', 'YTD', 'Y1', 'Y3', 'Y5', 'Y10'];
  const SECTORS = ['IT', '금융', '산업재', '헬스케어', '경기소비재', '필수소비재', '커뮤니케이션', '소재', '에너지', '유틸리티', '부동산', '미분류'];
  const SECTOR_COLORS = ['#F58220', '#043B72', '#00A9CE', '#F0B26B', '#AD624E', '#84888B', '#2E8540', '#D4A017', '#0086B8', '#CB6015', '#6C6C6C', '#D7D7D7'];
  const PAGE = 60;

  // ── 말 ──
  const T = {
    ko: {
      title: '이 ETF는 무엇을 담고 있나', base: '기준일', count: '종목', print: '이 화면 인쇄 · PDF 저장', sample: '예시 데이터',
      tabs: ['ETF 찾기', '비교 · 중복도', '종목 → ETF', '랭킹', '분류 점검', '수익률 기준', '사용법'], soon: '다음 단계에서 만듭니다',
      findH: 'ETF 찾기', findLead: '조건으로 좁히고, 눌러서 편입종목을 봅니다',
      searchPh: 'ETF명 · 종목코드 · 기초지수 · 편입종목명으로 찾기',
      f: { mkt: '상장 시장', region: '투자 지역', asset: '자산군', index: '기초지수', sector: '섹터 (비중 1위)', theme: '테마', issuer: '운용사', aum: '설정액(순자산)' },
      all: '전체', themeWait: '사전 파일을 받으면 붙입니다',
      aumBands: ['1조원 이상', '3,000억~1조', '1,000억~3,000억', '1,000억 미만', '값 없음'],
      period: '수익률 기간', lev: '레버리지·인버스 포함', onlyHold: '편입종목 있는 것만', nItems: (n) => `${n.toLocaleString()}종목`, reset: '조건 초기화',
      cols: { cmp: '비교', etf: 'ETF', mkt: '상장', issuer: '운용사', index: '기초지수', ret: '수익률', aum: '설정액', fee: '총보수', top10: '상위10 합계' },
      more: (n) => `더 보기 (${n.toLocaleString()}종목 남음)`, none: '조건에 맞는 ETF가 없습니다',
      noHold: '편입종목 미제공', li: { L: '레버리지', I: '인버스' }, stop: '거래정지', wide: '펀드 전체 기준',
      P: { D1: '1일', W1: '1주', M1: '1개월', M3: '3개월', M6: '6개월', YTD: '연초 이후', Y1: '1년', Y3: '3년(연율)', Y5: '5년(연율)', Y10: '10년(연율)' },
      mk: { KR: '국내', US: '미국', HK: '홍콩', JP: '일본', SH: '상해', SZ: '심천' },
      det: { issuer: '운용사', index: '기초지수', aum: '설정액(순자산)', fee: '총보수', price: '현재가', top10: '상위 종목 합계', cash: '현금성', div: '분배율(TTM)', dev: '괴리율', te: '추적오차', listed: '상장일', retBase: '수익률 기준일' },
      holdH: '상위 10개 편입종목', hCols: ['#', '종목', '비중'], wUnknown: '비중 미제공',
      holdNote: '막대 길이는 현금을 뺀 종목 가운데 가장 큰 비중을 기준으로 합니다. 비중을 모르는 종목은 막대를 그리지 않습니다.',
      holdNone: '이 ETF는 원천이 편입종목을 주지 않습니다.', cnHold: '중국 본토 상장 ETF는 편입종목을 주는 원천이 없습니다. 같은 지수를 따르는 홍콩·미국 상장 ETF에서 확인하십시오.',
      secH: '섹터 비중', secNone: '섹터 비중 자료가 없습니다.', secSum: (s) => `섹터 합계 ${s}% (원천 값 그대로)`,
      retH: '기간 수익률 (총수익률 기준)', rCols: ['기간', '총수익률', '동일 유형 내 백분율 순위', '유형 평균 대비'],
      since: (d) => `${d} 대비`, rankOf: (n) => `모수 ${n}`,
      rankNote: (g) => `동일 유형: ${g}. 순위는 1이 최고, 100이 최저입니다. 값을 가진 ETF가 20개 미만이면 순위를 비웁니다.`,
      retNone: '총수익률을 셀 수 없습니다', retWhy: '분배금 자료를 확인하지 못해 총수익률을 비워 둡니다(가격수익률로 대신하지 않습니다).',
      divSrc: '분배금 출처', aumSrcOther: (s) => `출처: ${s} — 순위·평균에서 제외`,
      bandNoPeriod: (ps) => `${ps} 총수익률은 자료에 없어 칸을 비웠습니다 — 받은 가격 이력이 그 기간보다 짧습니다.`,
      unknown: '미분류', na: '—',
    },
    en: {
      title: 'What does this ETF hold?', base: 'As of', count: 'ETFs', print: 'Print this view · Save PDF', sample: 'Sample data',
      tabs: ['Find ETFs', 'Compare · Overlap', 'Holding → ETFs', 'Rankings', 'Tag audit', 'Return basis', 'How to use'], soon: 'Coming in a later step',
      findH: 'Find ETFs', findLead: 'Narrow by filters, click a row to see its holdings',
      searchPh: 'Search by name, ticker, index or holding',
      f: { mkt: 'Listing market', region: 'Investment region', asset: 'Asset class', index: 'Underlying index', sector: 'Sector (top weight)', theme: 'Theme', issuer: 'Issuer', aum: 'AUM (net assets)' },
      all: 'All', themeWait: 'Added once the dictionary file arrives',
      aumBands: ['KRW 1T+', 'KRW 300B–1T', 'KRW 100B–300B', 'Under KRW 100B', 'No value'],
      period: 'Return period', lev: 'Include leveraged / inverse', onlyHold: 'With holdings only', nItems: (n) => `${n.toLocaleString()} ETFs`, reset: 'Reset filters',
      cols: { cmp: 'Cmp', etf: 'ETF', mkt: 'Mkt', issuer: 'Issuer', index: 'Index', ret: 'Return', aum: 'AUM', fee: 'TER', top10: 'Top-10 total' },
      more: (n) => `Show more (${n.toLocaleString()} left)`, none: 'No ETFs match these filters',
      noHold: 'Holdings n/a', li: { L: 'Leveraged', I: 'Inverse' }, stop: 'Halted', wide: 'whole-fund basis',
      P: { D1: '1D', W1: '1W', M1: '1M', M3: '3M', M6: '6M', YTD: 'YTD', Y1: '1Y', Y3: '3Y (ann.)', Y5: '5Y (ann.)', Y10: '10Y (ann.)' },
      mk: { KR: 'Korea', US: 'US', HK: 'Hong Kong', JP: 'Japan', SH: 'Shanghai', SZ: 'Shenzhen' },
      det: { issuer: 'Issuer', index: 'Underlying index', aum: 'AUM (net assets)', fee: 'Total expense', price: 'Last price', top10: 'Top holdings total', cash: 'Cash & equiv.', div: 'Yield (TTM)', dev: 'Premium/discount', te: 'Tracking error', listed: 'Listed', retBase: 'Return as-of' },
      holdH: 'Top 10 holdings', hCols: ['#', 'Holding', 'Weight'], wUnknown: 'weight n/a',
      holdNote: 'Bar length is scaled to the largest non-cash weight. Holdings with no reported weight get no bar.',
      holdNone: 'The source does not report holdings for this ETF.', cnHold: 'No source reports holdings for mainland-China-listed ETFs. Check a Hong Kong- or US-listed ETF on the same index.',
      secH: 'Sector weights', secNone: 'No sector data.', secSum: (s) => `Sectors sum to ${s}% (as reported)`,
      retH: 'Period returns (total return)', rCols: ['Period', 'Total return', 'Percentile rank in peer group', 'vs. peer average'],
      since: (d) => `since ${d}`, rankOf: (n) => `of ${n}`,
      rankNote: (g) => `Peer group: ${g}. 1 = best, 100 = worst. Left blank when fewer than 20 peers have a value.`,
      retNone: 'Total return unavailable', retWhy: 'Distributions could not be verified, so total return is left blank (price return is not substituted).',
      divSrc: 'Distribution source', aumSrcOther: (s) => `Source: ${s} — excluded from ranks and averages`,
      bandNoPeriod: (ps) => `${ps} total returns are blank: the price history received is shorter than that period.`,
      unknown: 'Unclassified', na: '—',
    },
  };
  const LBL = {
    en: {
      asset: { 주식: 'Equity', 채권: 'Bond', 원자재: 'Commodity', 부동산: 'Real estate', 혼합: 'Multi-asset', 통화: 'Currency', 기타: 'Other', 미분류: 'Unclassified' },
      region: { 국내: 'Korea', 미국: 'US', 일본: 'Japan', 홍콩: 'Hong Kong', 중국: 'China', '글로벌·기타': 'Global/other', 미분류: 'Unclassified' },
      sector: { IT: 'IT', 금융: 'Financials', 산업재: 'Industrials', 헬스케어: 'Health care', 경기소비재: 'Cons. discretionary', 필수소비재: 'Cons. staples', 커뮤니케이션: 'Communication', 소재: 'Materials', 에너지: 'Energy', 유틸리티: 'Utilities', 부동산: 'Real estate', 미분류: 'Unclassified' },
    },
  };
  let lang = 'ko';
  try { lang = localStorage.getItem('etfh-lang') === 'en' ? 'en' : 'ko'; } catch (e) { /* 없어도 된다 */ }
  const t = () => T[lang];
  const L = (kind, v) => (lang === 'en' && LBL.en[kind] && LBL.en[kind][v]) || v;

  // ── 숫자 모양 ──
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isNum = (v) => typeof v === 'number' && isFinite(v);
  const f2 = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function pctSigned(v) { if (!isNum(v)) return ''; const s = (v > 0 ? '+' : '') + f2(v) + '%'; return `<span class="${v > 0 ? 'up' : v < 0 ? 'down' : ''}">${s}</span>`; }
  function pct(v) { return isNum(v) ? f2(v) + '%' : ''; }
  function eok(v) { // 억원 → 글자
    if (!isNum(v)) return '';
    if (lang === 'en') { const b = v / 10; return 'KRW ' + (Math.abs(b) >= 1000 ? (b / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'T' : b.toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'B'); }
    if (Math.abs(v) >= 10000) return (v / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) + '조원';
    return Math.round(v).toLocaleString('ko-KR') + '억원';
  }
  const CUR = { USD: '$', HKD: 'HK$', JPY: '¥', CNY: 'CN¥', KRW: '₩' };
  function money(v, cur) {
    if (!isNum(v)) return '';
    const s = CUR[cur] || (cur ? cur + ' ' : '');
    const a = Math.abs(v);
    if (a >= 1e12) return s + (v / 1e12).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'T';
    if (a >= 1e9) return s + (v / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'B';
    if (a >= 1e6) return s + (v / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M';
    return s + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  function price(it) {
    if (!isNum(it.price)) return '';
    if (it.cur === 'KRW') return '₩' + it.price.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    const main = (CUR[it.cur] || '') + it.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    return isNum(it.priceKrw) ? `${main} <span class="sm">≈ ₩${Math.round(it.priceKrw).toLocaleString('ko-KR')}</span>` : main;
  }
  function aumCell(it) {
    if (it.cur === 'KRW') return eok(it.aumKrw);
    if (!isNum(it.aum)) return '';
    return `${money(it.aum, it.cur)}${isNum(it.aumKrw) ? `<span class="sm">≈ ${eok(it.aumKrw)}</span>` : ''}${it.aumWide ? `<span class="sm">${t().wide}</span>` : ''}`;
  }
  const mmdd = (d) => (d ? d.slice(5) : '');
  const since = (d, p) => (d ? (/^Y(3|5|10)$/.test(p) ? d : mmdd(d)) : '');

  // ── 상태 ──
  const S = { q: '', f: { mkt: '', region: '', asset: '', index: '', sector: '', theme: '', issuer: '', aum: '' }, period: 'Y1', lev: false, onlyHold: true, sort: { k: 'aum', dir: -1 }, shown: PAGE, open: null, cmp: new Set() };
  const DEFAULT = JSON.stringify({ q: S.q, f: S.f, period: S.period, lev: S.lev, onlyHold: S.onlyHold });

  const periodHas = {};
  for (const p of PERIODS) periodHas[p] = ITEMS.some((it) => it.ret && it.ret[p]);

  function aumBand(it) {
    const v = it.aumKrw;
    if (!isNum(v)) return 4;
    if (v >= 10000) return 0; if (v >= 3000) return 1; if (v >= 1000) return 2; return 3;
  }
  const searchText = ITEMS.map((it) => [it.name, it.nameLocal, it.code, it.index, ...(it.holdings || []).map((h) => h.name)].filter(Boolean).join('\u0001').toLowerCase());

  function filtered() {
    const q = S.q.trim().toLowerCase();
    const f = S.f;
    const out = [];
    ITEMS.forEach((it, i) => {
      if (!S.lev && it.li) return;
      if (S.onlyHold && !(it.holdings && it.holdings.length)) return;
      if (f.mkt && it.mkt !== f.mkt) return;
      if (f.region && it.region !== f.region) return;
      if (f.asset && it.asset !== f.asset) return;
      if (f.index && it.index !== f.index) return;
      if (f.sector && it.sector1 !== f.sector) return;
      if (f.issuer && it.issuer !== f.issuer) return;
      if (f.aum !== '' && String(aumBand(it)) !== f.aum) return;
      if (q && !searchText[i].includes(q)) return;
      out.push(it);
    });
    const { k, dir } = S.sort;
    const val = (it) => {
      switch (k) {
        case 'name': return it.name; case 'mkt': return it.mkt; case 'issuer': return it.issuer || '';
        case 'ret': return it.ret && it.ret[S.period] ? it.ret[S.period][0] : null;
        case 'aum': return it.aumWide ? null : it.aumKrw; case 'fee': return it.fee; case 'top10': return it.top10;
        default: return null;
      }
    };
    out.sort((a, b) => {
      const x = val(a), y = val(b);
      const xn = x === null || x === undefined || x === '', yn = y === null || y === undefined || y === '';
      if (xn && yn) return 0; if (xn) return 1; if (yn) return -1; // 빈 값은 늘 맨 아래
      if (typeof x === 'string') return dir * x.localeCompare(y, lang === 'ko' ? 'ko' : 'en');
      return dir * (x - y);
    });
    return out;
  }

  // ── 그리기 ──
  const $ = (s, el) => (el || document).querySelector(s);

  function renderHead() {
    const tt = t();
    document.documentElement.lang = lang;
    document.title = tt.title;
    $('#h-title').innerHTML = esc(tt.title) + (META.sample ? `<span class="badge-sample">${esc(tt.sample)}</span>` : '');
    const bases = Object.entries(META.base || {}).map(([m, d]) => `${esc(tt.mk[m] || m)} ${esc(d)}`).join(' · ');
    $('#h-sub').innerHTML = `${esc(tt.base)} <b>${bases}</b> · <b>${ITEMS.length.toLocaleString()}</b>${esc(tt.count)}`;
    $('#btn-print').textContent = tt.print;
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.lang === lang)));
    document.querySelectorAll('.tabs button').forEach((b, i) => { b.textContent = tt.tabs[i]; if (b.disabled) b.title = tt.soon; });
    $('#find-h').textContent = tt.findH;
    $('#find-lead').textContent = tt.findLead;
    $('#q').placeholder = tt.searchPh;
    $('#lbl-period').textContent = tt.period;
    $('#lbl-lev').textContent = tt.lev;
    $('#lbl-hold').textContent = tt.onlyHold;
    $('#btn-reset').textContent = tt.reset;
    const miss = PERIODS.filter((p) => !periodHas[p]);
    const band = $('#band-period');
    if (miss.length) { band.hidden = false; band.textContent = tt.bandNoPeriod(miss.map((p) => tt.P[p]).join(', ')); } else band.hidden = true;
  }

  function opts(values, cur, lab) {
    return `<option value="">${esc(t().all)}</option>` + values.map((v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(lab ? lab(v) : v)}</option>`).join('');
  }
  function uniq(key) { return [...new Set(ITEMS.map((it) => it[key]).filter(Boolean))]; }
  const byCount = (key) => { const c = {}; ITEMS.forEach((it) => { if (it[key]) c[it[key]] = (c[it[key]] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b)); };

  function renderFilters() {
    const tt = t();
    const MK = ['KR', 'US', 'HK', 'JP', 'SH', 'SZ'].filter((m) => ITEMS.some((it) => it.mkt === m));
    const defs = [
      ['mkt', MK, (v) => tt.mk[v] || v],
      ['region', byCount('region'), (v) => L('region', v)],
      ['asset', byCount('asset'), (v) => L('asset', v)],
      ['index', uniq('index').sort((a, b) => a.localeCompare(b, 'ko')), null],
      ['sector', SECTORS.filter((s) => ITEMS.some((it) => it.sector1 === s)), (v) => L('sector', v)],
      ['theme', [], null],
      ['issuer', byCount('issuer'), null],
      ['aum', ['0', '1', '2', '3', '4'], (v) => tt.aumBands[+v]],
    ];
    $('#filters').innerHTML = defs.map(([k, vals, lab]) => {
      const dis = k === 'theme' && !vals.length;
      return `<label>${esc(tt.f[k])}<select data-f="${k}"${dis ? ` disabled title="${esc(tt.themeWait)}"` : ''}>${dis ? `<option>${esc(tt.themeWait)}</option>` : opts(vals, S.f[k], lab)}</select></label>`;
    }).join('');
    $('#period').innerHTML = PERIODS.map((p) => `<option value="${p}"${p === S.period ? ' selected' : ''}${periodHas[p] ? '' : ' disabled'}>${esc(tt.P[p])}</option>`).join('');
    $('#lev').checked = S.lev;
    $('#hold').checked = S.onlyHold;
    $('#q').value = S.q;
  }

  function badges(it) {
    const tt = t();
    let s = '';
    if (it.li) s += `<span class="bdg li">${esc(tt.li[it.li])}</span>`;
    if (it.stop) s += `<span class="bdg stop">${esc(tt.stop)}</span>`;
    if (!(it.holdings && it.holdings.length)) s += `<span class="bdg no">${esc(tt.noHold)}</span>`;
    return s;
  }

  function renderTable() {
    const tt = t();
    const rows = filtered();
    $('#count').textContent = tt.nItems(rows.length);
    const c = tt.cols;
    const th = (k, label, cls) => {
      const sortable = k && k !== 'index';
      const arr = S.sort.k === k ? `<span class="arr">${S.sort.dir < 0 ? '▼' : '▲'}</span>` : '';
      return `<th class="${cls || ''}${sortable ? ' sort' : ''}"${sortable ? ` data-sort="${k}" aria-sort="${S.sort.k === k ? (S.sort.dir < 0 ? 'descending' : 'ascending') : 'none'}"` : ''}>${esc(label)}${arr}</th>`;
    };
    let h = `<table class="dt"><thead><tr>${th(null, c.cmp, 'chk')}${th('name', c.etf)}${th('mkt', c.mkt)}${th('issuer', c.issuer, 'hide-m')}${th('index', c.index, 'hide-m')}${th('ret', `${c.ret} (${tt.P[S.period]})`, 'n')}${th('aum', c.aum, 'n')}${th('fee', c.fee, 'n hide-m')}${th('top10', c.top10, 'n hide-m')}</tr></thead><tbody>`;
    if (!rows.length) h += `<tr><td colspan="9" class="empty">${esc(tt.none)}</td></tr>`;
    for (const it of rows.slice(0, S.shown)) {
      const r = it.ret && it.ret[S.period];
      const open = S.open === it.id;
      h += `<tr class="row${open ? ' open' : ''}" data-id="${it.id}" tabindex="0" aria-expanded="${open}">` +
        `<td class="chk"><input type="checkbox" data-cmp="${it.id}" aria-label="${esc(c.cmp)}"${S.cmp.has(it.id) ? ' checked' : ''}></td>` +
        `<td><span class="nm">${esc(it.name)}</span><span class="cd">${esc(it.code)}</span>${badges(it)}${it.nameLocal ? `<span class="sm">${esc(it.nameLocal)}</span>` : ''}</td>` +
        `<td>${esc(tt.mk[it.mkt] || it.mkt)}</td>` +
        `<td class="hide-m">${esc(it.issuer || '')}</td>` +
        `<td class="hide-m">${esc(it.index || '')}</td>` +
        `<td class="n">${r ? pctSigned(r[0]) : ''}</td>` +
        `<td class="n">${aumCell(it)}</td>` +
        `<td class="n hide-m">${pct(it.fee)}</td>` +
        `<td class="n hide-m">${pct(it.top10)}</td></tr>`;
      if (open) h += `<tr class="detail"><td colspan="9">${detail(it)}</td></tr>`;
    }
    h += '</tbody></table>';
    $('#tbl').innerHTML = h;
    const left = rows.length - S.shown;
    const more = $('#more');
    more.hidden = left <= 0;
    if (left > 0) more.textContent = tt.more(left);
  }

  // ── 상세 ──
  const isCash = (h) => /현금|예금|원화|달러|설정현금|cash|money market|treasury bill|^\[?(usd|krw|jpy|hkd|cny)\]?/i.test(h.name || '') && !h.code;
  function detail(it) {
    const tt = t(), d = tt.det;
    const kv = [
      [d.issuer, esc(it.issuer || '')], [d.index, esc(it.index || '')], [d.aum, aumCell(it) + (it.aumSrc ? `<span class="sm">${esc(tt.aumSrcOther(it.aumSrc))}</span>` : '')], [d.fee, pct(it.fee)],
      [d.price, price(it) + (it.priceDate ? `<span class="sm">${esc(it.priceDate)}</span>` : '')], [d.top10, pct(it.top10)], [d.cash, pct(it.cash)], [d.div, pct(it.divYield)],
      [d.dev, isNum(it.dev) ? (it.dev > 0 ? '+' : '') + f2(it.dev) + '%' : ''], [d.te, pct(it.te)], [d.listed, esc(it.listed || '')], [d.retBase, esc(it.retBase || '')],
    ];
    let h = `<div class="det"><div class="det-h"><h3>${esc(it.name)} <span class="cd">${esc(it.code)} · ${esc(tt.mk[it.mkt])}</span></h3>` +
      `<span class="sm">${esc(L('asset', it.asset || tt.unknown))} · ${esc(L('region', it.region || tt.unknown))}${it.li ? ' · ' + esc(tt.li[it.li]) : ''}</span></div>`;
    h += `<dl class="kv">${kv.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v || tt.na}</dd></div>`).join('')}</dl>`;
    h += `<div class="det-grid"><div>${holdingsBlock(it)}</div><div>${donut(it)}</div></div>`;
    h += returnsBlock(it);
    return h + '</div>';
  }

  function holdingsBlock(it) {
    const tt = t();
    let h = `<h4>${esc(tt.holdH)}</h4>`;
    const hs = it.holdings || [];
    if (!hs.length) return h + `<p class="empty">${esc(it.mkt === 'SH' || it.mkt === 'SZ' ? tt.cnHold : tt.holdNone)}</p>`;
    const ref = Math.max(0, ...hs.filter((x) => isNum(x.w) && !isCash(x)).map((x) => x.w));
    h += `<div class="tw"><table class="dt"><thead><tr><th class="n">${tt.hCols[0]}</th><th>${tt.hCols[1]}</th><th class="n">${tt.hCols[2]}</th><th style="width:38%"></th></tr></thead><tbody>`;
    hs.forEach((x, i) => {
      const known = isNum(x.w);
      const width = known && ref > 0 ? Math.min(100, (x.w / ref) * 100) : 0;
      h += `<tr><td class="n">${i + 1}</td><td>${esc(x.name)}${x.code ? `<span class="cd">${esc(x.code)}</span>` : ''}</td>` +
        `<td class="n">${known ? f2(x.w) + '%' : `<span class="mut">${esc(tt.wUnknown)}</span>`}</td>` +
        `<td>${known ? `<div class="hb"><i class="${isCash(x) ? 'cash' : ''}" style="width:${width.toFixed(2)}%"></i></div>` : ''}</td></tr>`;
    });
    return h + `</tbody></table></div><p class="note">${esc(tt.holdNote)}</p>`;
  }

  function donut(it) {
    const tt = t();
    let h = `<h4>${esc(tt.secH)}</h4>`;
    const s = it.sectors;
    if (!s) return h + `<p class="empty">${esc(tt.secNone)}</p>`;
    const parts = SECTORS.map((k, i) => ({ k, v: s[k], c: SECTOR_COLORS[i] })).filter((x) => isNum(x.v) && x.v > 0);
    const sum = parts.reduce((a, x) => a + x.v, 0);
    if (!parts.length || sum <= 0) return h + `<p class="empty">${esc(tt.secNone)}</p>`;
    const R = 60, r = 36, C = 70;
    let a0 = -Math.PI / 2, paths = '';
    for (const p of parts) {
      const frac = p.v / sum;
      const a1 = a0 + frac * 2 * Math.PI;
      if (frac >= 0.9999) { paths += `<circle cx="${C}" cy="${C}" r="${(R + r) / 2}" fill="none" stroke="${p.c}" stroke-width="${R - r}"><title>${esc(L('sector', p.k))} ${f2(p.v)}%</title></circle>`; break; }
      const big = a1 - a0 > Math.PI ? 1 : 0;
      const P = (ang, rad) => `${(C + rad * Math.cos(ang)).toFixed(2)},${(C + rad * Math.sin(ang)).toFixed(2)}`;
      paths += `<path d="M${P(a0, R)} A${R},${R} 0 ${big} 1 ${P(a1, R)} L${P(a1, r)} A${r},${r} 0 ${big} 0 ${P(a0, r)} Z" fill="${p.c}" stroke="#fff" stroke-width="1"><title>${esc(L('sector', p.k))} ${f2(p.v)}%</title></path>`;
      a0 = a1;
    }
    h += `<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="${esc(tt.secH)}">${paths}</svg>`;
    h += `<ul class="legend">${parts.sort((a, b) => b.v - a.v).map((p) => `<li><i style="background:${p.c}"></i>${esc(L('sector', p.k))}<span class="v">${f2(p.v)}%</span></li>`).join('')}</ul></div>`;
    if (Math.abs(sum - 100) > 1) h += `<p class="note">${esc(tt.secSum(f2(sum)))}</p>`;
    return h;
  }

  function returnsBlock(it) {
    const tt = t();
    let h = `<h4 style="margin-top:18px">${esc(tt.retH)}</h4>`;
    if (!it.ret) return h + `<p class="empty">${esc(tt.retNone)} — ${esc(tt.retWhy)}</p>`;
    h += `<div class="tw"><table class="dt"><thead><tr>${tt.rCols.map((c, i) => `<th${i ? ' class="n"' : ''}>${esc(c)}</th>`).join('')}</tr></thead><tbody>`;
    for (const p of PERIODS) {
      if (!periodHas[p]) continue;
      const r = it.ret[p];
      const rk = it.rank && it.rank[p];
      const av = it.avg && it.avg[p];
      h += `<tr><td>${esc(tt.P[p])}${r ? ` <span class="sm" style="display:inline">${esc(tt.since(since(r[1], p)))}</span>` : ''}</td>` +
        `<td class="n">${r ? pctSigned(r[0]) : ''}</td>` +
        `<td class="n">${rk ? `<span class="${rk[0] > 50 ? 'mut' : ''}">${rk[0]}</span> <span class="sm" style="display:inline">${esc(tt.rankOf(rk[1]))}</span>` : ''}</td>` +
        `<td class="n">${r && isNum(av) ? `${r[0] - av > 0 ? '+' : ''}${f2(r[0] - av)}%p` : ''}</td></tr>`;
    }
    h += '</tbody></table></div>';
    const g = it.group ? it.group.split('|').map((x, i) => (i === 0 ? tt.mk[x] || x : x === 'LI' ? tt.li.L + '·' + tt.li.I : L(i === 1 ? 'asset' : 'region', x))).join(' × ') : '';
    h += `<p class="note">${esc(tt.rankNote(g))}${it.divSrc ? ` ${esc(tt.divSrc)}: ${esc(it.divSrc)}.` : ''}</p>`;
    return h;
  }

  // ── 이벤트 ──
  function rerender() { renderHead(); renderFilters(); renderTable(); }
  document.addEventListener('input', (e) => {
    if (e.target.id === 'q') { S.q = e.target.value; S.shown = PAGE; renderTable(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.f) { S.f[el.dataset.f] = el.value; S.shown = PAGE; renderTable(); }
    else if (el.id === 'period') { S.period = el.value; renderTable(); }
    else if (el.id === 'lev') { S.lev = el.checked; S.shown = PAGE; renderTable(); }
    else if (el.id === 'hold') { S.onlyHold = el.checked; S.shown = PAGE; renderTable(); }
    else if (el.dataset.cmp) { const id = +el.dataset.cmp; if (el.checked) { if (S.cmp.size >= 8) { el.checked = false; return; } S.cmp.add(id); } else S.cmp.delete(id); }
  });
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (el.closest('[data-cmp]')) return;
    const sortTh = el.closest('th[data-sort]');
    if (sortTh) { const k = sortTh.dataset.sort; S.sort = S.sort.k === k ? { k, dir: -S.sort.dir } : { k, dir: ['name', 'mkt', 'issuer', 'fee'].includes(k) ? 1 : -1 }; renderTable(); return; }
    const row = el.closest('tr.row');
    if (row) { const id = +row.dataset.id; S.open = S.open === id ? null : id; renderTable(); return; }
    if (el.id === 'more') { S.shown += PAGE; renderTable(); return; }
    if (el.id === 'btn-reset') { Object.assign(S, JSON.parse(DEFAULT)); S.shown = PAGE; S.open = null; renderFilters(); renderTable(); return; }
    if (el.id === 'btn-print') { window.print(); return; }
    const lb = el.closest('.lang button');
    if (lb) { lang = lb.dataset.lang; try { localStorage.setItem('etfh-lang', lang); } catch (x) { /* 괜찮다 */ } rerender(); return; }
    const tab = el.closest('.tabs button');
    if (tab && !tab.disabled) {
      document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b === tab)));
      document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === tab.getAttribute('aria-controls')));
    }
  });
  document.addEventListener('keydown', (e) => {
    const row = e.target.closest && e.target.closest('tr.row');
    if (row && (e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); row.click(); }
  });

  rerender();
  window.__etfh = { S, ITEMS, META, filtered };
})();
