/* ============================================================================
 * 금융상품 통합조회 — 실데이터 연동 계층
 * ----------------------------------------------------------------------------
 * 공개 소스에서 실제 상품 데이터를 가져와 MASP 스키마로 정규화한다.
 *
 * [연동 가능 — KRX 정보데이터시스템 공개 엔드포인트]
 *   ETF   전종목 기본정보  MDCSTAT04601  종목명·코드·기초지수·운용사·총보수·상장일
 *   ETF   전종목 시세      MDCSTAT04301  종가·NAV·순자산총액·거래량
 *   ETF   전종목 등락률    MDCSTAT04401  기간 수익률 (1M/3M/6M/1Y)
 *   ETF   개별종목 시세    MDCSTAT04501  일별 시계열 (상세 열 때 지연 조회)
 *   ETN   전종목 기본정보  MDCSTAT06701 / 시세 MDCSTAT06401
 *   채권  전종목 시세      MDCSTAT09801 / 장외 채권수익률 MDCSTAT11401
 *
 *   엔드포인트·파라미터명은 pykrx(https://github.com/sharebook-kr/pykrx)에
 *   공개된 KRX 메뉴 카탈로그(path_bld_information.json)에서 확인한 값이다.
 *
 * [연동 불가 — 공개 API 부재]
 *   펀드 수익률·보수      금융투자협회 전자공시(dis.kofia.or.kr) — 공개 API 없음
 *   ELS/DLS 회차별 조건   미래에셋증권 홈페이지 — 공개 API 없음
 *   RP·CMA 금리           미래에셋증권 홈페이지 — 공개 API 없음
 *   랩·신탁               공개 소스 없음
 *   위험등급·세제·판매채널  KRX 공개데이터에 없음 (투자설명서 항목)
 *   => 위 항목은 사내 상품 API 또는 CSV 임포트로 채운다. 임의 생성하지 않는다.
 *
 * 브라우저에서 직접 호출하면 CORS 로 막히는 경우가 많아 프록시 폴백을 둔다.
 * 사내망에서는 PROXIES 맨 앞에 사내 프록시(예: '/api/proxy?url=')를 추가하면 된다.
 * ========================================================================== */
var MASPSRC = (function () {
  'use strict';

  var KRX_URL = 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd';
  var KRX_REFERER = 'https://data.krx.co.kr/contents/MDC/MDI/outerLoader/index.cmd';
  var TIMEOUT = 8000;

  /* CORS 프록시 폴백 체인 — 앞에서부터 시도하고 처음 성공한 경로를 계속 쓴다 */
  var PROXIES = [
    { name: '직접 호출', wrap: function (u) { return u; }, form: true },
    { name: 'corsproxy.io', wrap: function (u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); }, form: true },
    { name: 'allorigins', wrap: function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); }, form: true }
  ];
  var proxyHint = 0;   /* 성공한 프록시 인덱스를 기억해 이후 요청에 먼저 사용 */

  /* 진단 로그 — 어떤 소스가 성공/실패했는지 화면에서 그대로 보여준다 */
  var diag = [];
  function log(entry) { diag.push(entry); return entry; }
  function getDiag() { return diag.slice(); }
  function resetDiag() { diag = []; }

  /* ------------------------------------------------------------------ HTTP */
  function withTimeout(promise, ms, onAbort) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        if (onAbort) try { onAbort(); } catch (e) { }
        reject(new Error('timeout ' + ms + 'ms'));
      }, ms);
      promise.then(function (v) {
        if (done) return; done = true; clearTimeout(t); resolve(v);
      }, function (e) {
        if (done) return; done = true; clearTimeout(t); reject(e);
      });
    });
  }

  /* KRX 는 form-encoded POST 로 bld + 파라미터를 받는다 */
  function krxPost(bld, params) {
    var body = new URLSearchParams();
    body.set('bld', bld);
    Object.keys(params || {}).forEach(function (k) { body.set(k, params[k]); });

    var order = PROXIES.slice(proxyHint).concat(PROXIES.slice(0, proxyHint));
    var attempt = 0;

    function tryNext() {
      if (attempt >= order.length) return Promise.reject(new Error('all proxies failed'));
      var px = order[attempt++];
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var req = fetch(px.wrap(KRX_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: body.toString(),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (txt) {
        var j;
        try { j = JSON.parse(txt); }
        catch (e) { throw new Error('not JSON (' + txt.slice(0, 60) + ')'); }
        proxyHint = PROXIES.indexOf(px);
        return j;
      });
      return withTimeout(req, TIMEOUT, function () { if (ctrl) ctrl.abort(); })
        .catch(function (e) {
          log({ bld: bld, proxy: px.name, ok: false, msg: String(e.message || e) });
          return tryNext();
        });
    }
    return tryNext();
  }

  /* KRX 응답은 output / OutBlock_1 / block1 중 하나에 배열로 담겨 온다 */
  function rowsOf(json) {
    if (!json) return [];
    var keys = ['output', 'OutBlock_1', 'block1', 'result'];
    for (var i = 0; i < keys.length; i++) {
      var v = json[keys[i]];
      if (Array.isArray(v)) return v;
      if (v && Array.isArray(v.OutBlock_1)) return v.OutBlock_1;
    }
    for (var k in json) if (Array.isArray(json[k])) return json[k];
    return [];
  }

  /* ---------------------------------------------------------- 필드 매핑 유틸 */
  /* KRX 출력 필드명은 메뉴별로 조금씩 다르다. 후보 키를 여러 개 두고 처음
     매칭되는 값을 쓰며, 매칭 실패한 경우 진단 로그에 실제 키를 남긴다.     */
  function pick(row, cands) {
    for (var i = 0; i < cands.length; i++) {
      if (row[cands[i]] !== undefined && row[cands[i]] !== '' && row[cands[i]] !== '-') return row[cands[i]];
    }
    return null;
  }
  function n(v) {
    if (v == null) return null;
    var s = String(v).replace(/,/g, '').replace(/%/g, '').trim();
    if (s === '' || s === '-' || s === '.') return null;
    var f = parseFloat(s);
    return isNaN(f) ? null : f;
  }
  function ymd(v) {
    if (!v) return null;
    var s = String(v).replace(/[^0-9]/g, '');
    return s.length === 8 ? s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8) : null;
  }

  /* KRX 실제 출력 키를 우선 순위대로 나열한다. 메뉴마다 이름이 달라서
     (기초지수는 ETF_OBJ_IDX_NM / IDX_IND_NM, 순자산은 INVSTASST_NETASST_TOTAMT
     / LIST_MKTCAP 등) 후보를 넓게 두고, 전부 실패하면 진단에 실제 키를 남긴다. */
  var K = {
    code: ['ISU_SRT_CD', 'ISU_CD', 'ISU_SRT_CD1'],
    isin: ['ISU_CD', 'ISU_SRT_CD'],
    name: ['ISU_ABBRV', 'ISU_NM', 'ISU_KOR_ABBRV', 'ISU_KOR_NM'],
    index: ['ETF_OBJ_IDX_NM', 'IDX_IND_NM', 'BAS_IDX_NM', 'IDX_NM', 'ETN_OBJ_IDX_NM'],
    manager: ['COM_ABBRV', 'ISUR_NM', 'COM_NM'],
    fee: ['TOT_PAY', 'TOT_FEE', 'TOTL_PAY', 'CMSN_RT', 'FEE_RT', 'ETF_TOT_PAY'],
    listDd: ['LIST_DD', 'LIST_DT'],
    close: ['TDD_CLSPRC', 'CLSPRC', 'ISU_CLSPRC', 'TDD_CLSPRC1'],
    nav: ['NAV', 'LAST_NAV', 'ISU_NAV'],
    netAsset: ['INVSTASST_NETASST_TOTAMT', 'NETASST_TOTAMT', 'LIST_MKTCAP', 'MKTCAP', 'NET_ASST_TOTAMT'],
    volume: ['ACC_TRDVOL', 'TRDVOL'],
    flucRt: ['FLUC_RT', 'CMPPREVDD_RT', 'FLUC_RT1'],
    ytm: ['CLSPRC_YD', 'YD', 'YD_RT', 'BND_YD', 'CLSPRC_YD1'],
    bondName: ['ISU_NM', 'ISU_ABBRV', 'BND_NM'],
    tradeDd: ['TRD_DD', 'BAS_DD']
  };

  /* 매핑 실패 진단 — 실제 응답 키를 그대로 보여줘야 수정이 빠르다 */
  function auditRow(tag, row, needed) {
    var missing = needed.filter(function (f) { return pick(row, K[f]) == null; });
    if (missing.length) {
      log({ bld: tag, ok: true, warn: 'unmapped: ' + missing.join(',') , keys: Object.keys(row).join(' ') });
    }
  }

  /* ------------------------------------------------------------------ 날짜 */
  function fmtDd(d) {
    return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
  }
  /* 조회 기준일: 주말이면 직전 금요일로 당긴다 (공휴일은 응답 비면 재시도) */
  function lastBusinessDay(base) {
    var d = new Date(base.getTime());
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
    return d;
  }
  function monthsAgo(base, m) {
    var d = new Date(base.getTime());
    d.setMonth(d.getMonth() - m);
    return lastBusinessDay(d);
  }

  /* 거래일이 아니면 빈 배열이 오므로 최대 5영업일 뒤로 물러나며 재시도 */
  function krxPostRetry(bld, params, dateKey, baseDate, tries) {
    tries = tries == null ? 5 : tries;
    var d = lastBusinessDay(baseDate);
    function go(left) {
      var p = {};
      Object.keys(params).forEach(function (k) { p[k] = params[k]; });
      if (dateKey) p[dateKey] = fmtDd(d);
      return krxPost(bld, p).then(function (j) {
        var rows = rowsOf(j);
        if (rows.length || left <= 0) return { rows: rows, date: fmtDd(d) };
        d.setDate(d.getDate() - 1);
        d = lastBusinessDay(d);
        return go(left - 1);
      });
    }
    return go(tries);
  }

  /* =========================================================== ETF 어댑터 */
  function loadEtf(asOfDate) {
    var base = lastBusinessDay(asOfDate);
    var periods = [
      { key: 'ret1m', m: 1 }, { key: 'ret3m', m: 3 },
      { key: 'ret6m', m: 6 }, { key: 'ret1y', m: 12 }
    ];

    return Promise.all([
      /* 1) 기본정보 — 종목명/코드/기초지수/운용사/총보수/상장일 */
      krxPost('dbms/MDC/STAT/standard/MDCSTAT04601', {}).then(rowsOf),
      /* 2) 전종목 시세 — 종가/NAV/순자산 */
      krxPostRetry('dbms/MDC/STAT/standard/MDCSTAT04301', {}, 'trdDd', base).catch(function () { return { rows: [] }; }),
      /* 3) 기간 등락률 — 실제 기간 수익률 */
      Promise.all(periods.map(function (p) {
        return krxPost('dbms/MDC/STAT/standard/MDCSTAT04401', {
          strtDd: fmtDd(monthsAgo(base, p.m)), endDd: fmtDd(base)
        }).then(rowsOf).catch(function () { return []; });
      }))
    ]).then(function (res) {
      var info = res[0], quote = res[1].rows || [], rets = res[2];
      if (!info.length) throw new Error('ETF 기본정보 응답 없음');
      auditRow('MDCSTAT04601', info[0], ['code', 'name', 'index', 'manager', 'fee']);
      if (quote.length) auditRow('MDCSTAT04301', quote[0], ['code', 'close', 'nav', 'netAsset']);

      var qByCode = {}, rByCode = [];
      quote.forEach(function (r) { var c = pick(r, K.code); if (c) qByCode[c] = r; });
      rets.forEach(function (rows, i) {
        var m = {};
        rows.forEach(function (r) { var c = pick(r, K.code); if (c) m[c] = n(pick(r, K.flucRt)); });
        rByCode[i] = m;
      });

      var out = info.map(function (r) {
        var code = pick(r, K.code);
        var q = qByCode[code] || {};
        var p = {
          cat: 'etf',
          live: true,
          source: 'KRX',
          sourceUrl: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC020103010101',
          code: String(code || ''),
          isin: String(pick(r, K.isin) || ''),
          name: [String(pick(r, K.name) || ''), String(pick(r, K.name) || '')],
          provider: [String(pick(r, K.manager) || ''), String(pick(r, K.manager) || '')],
          etfIndex: pick(r, K.index),
          etfBrand: brandOf(String(pick(r, K.name) || '')),
          fee: n(pick(r, K.fee)),
          launch: ymd(pick(r, K.listDd)),
          price: n(pick(q, K.close)),
          nav: n(pick(q, K.nav)),
          /* KRX 순자산총액은 원 단위 -> 억원으로 환산 (화면 단위와 일치) */
          aum: n(pick(q, K.netAsset)) != null ? Math.round(n(pick(q, K.netAsset)) / 1e8) : null,
          currency: 'KRW',
          status: 'sale',
          /* 아래 항목은 KRX 공개데이터에 없다 — 임의로 채우지 않고 null 로 둔다 */
          risk: null, tax: [], channel: [], minAmount: null, dist: null,
          asset: assetOf(String(pick(r, K.name) || ''), String(pick(r, K.index) || '')),
          region: regionOf(String(pick(r, K.name) || '')),
          series: null, bench: null, holdings: null
        };
        periods.forEach(function (pd, i) { p[pd.key] = rByCode[i] ? rByCode[i][code] : null; });
        p.ret3y = null;
        p.hedged = /\(H\)/.test(p.name[0]) ? 'h' : 'uh';
        return p;
      }).filter(function (p) { return p.code && p.name[0]; });

      log({ bld: 'ETF', ok: true, msg: out.length + '건 수신 (기본정보 ' + info.length + ' / 시세 ' + quote.length + ')' });
      return out;
    });
  }

  /* ETF/ETN 브랜드는 종목명 접두어로 판별 (KRX 필드에 별도 항목이 없다) */
  var BRANDS = ['TIGER', 'KODEX', 'ACE', 'RISE', 'PLUS', 'SOL', 'KOSEF', 'ARIRANG', 'HANARO', 'TIMEFOLIO', 'BNK', 'WON', 'FOCUS', 'ITF', 'KIWOOM'];
  function brandOf(name) {
    var up = name.toUpperCase();
    for (var i = 0; i < BRANDS.length; i++) if (up.indexOf(BRANDS[i]) === 0) return BRANDS[i];
    return up.split(' ')[0] || null;
  }
  /* 종목명/기초지수 문자열에서 자산유형·투자지역을 추정 (표시용 분류일 뿐) */
  function assetOf(name, index) {
    var s = name + ' ' + index;
    if (/채권|국고|통안|크레딧|회사채|만기매칭|금리|CD|KOFR|단기자금/.test(s)) return 'bd';
    if (/리츠|부동산|인프라|금|은|원유|커머디티|구리/.test(s)) return 'alt';
    if (/혼합|밸런스|TDF|타겟/.test(s)) return 'mx';
    if (/머니마켓|MMF/.test(s)) return 'mm';
    return 'eq';
  }
  function regionOf(name) {
    if (/미국|나스닥|S&P|다우|필라델피아/.test(name)) return 'us';
    if (/중국|차이나|항셍|CSI/.test(name)) return 'cn';
    if (/일본|니케이|TOPIX/.test(name)) return 'jp';
    if (/인도|니프티|NIFTY/i.test(name)) return 'in';
    if (/유럽|유로|STOXX|독일/.test(name)) return 'eu';
    if (/신흥국|이머징|베트남|인도네시아|브라질|멕시코/.test(name)) return 'em';
    if (/글로벌|선진국|세계|월드/.test(name)) return 'gl';
    return 'kr';
  }

  /* =========================================================== ETN 어댑터 */
  function loadEtn(asOfDate) {
    var base = lastBusinessDay(asOfDate);
    return Promise.all([
      krxPost('dbms/MDC/STAT/standard/MDCSTAT06701', {}).then(rowsOf).catch(function () { return []; }),
      krxPostRetry('dbms/MDC/STAT/standard/MDCSTAT06401', {}, 'trdDd', base).catch(function () { return { rows: [] }; })
    ]).then(function (res) {
      var info = res[0], quote = res[1].rows || [];
      var src = info.length ? info : quote;
      if (!src.length) throw new Error('ETN 응답 없음');
      auditRow('MDCSTAT06701', src[0], ['code', 'name']);
      var qByCode = {};
      quote.forEach(function (r) { var c = pick(r, K.code); if (c) qByCode[c] = r; });
      var out = src.map(function (r) {
        var code = pick(r, K.code), q = qByCode[code] || r;
        var nm = String(pick(r, K.name) || '');
        return {
          cat: 'etf', live: true, source: 'KRX',
          sourceUrl: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC020103020101',
          code: String(code || ''), name: [nm, nm],
          provider: [String(pick(r, K.manager) || ''), String(pick(r, K.manager) || '')],
          etfIndex: pick(r, K.index), etfBrand: brandOf(nm),
          fee: n(pick(r, K.fee)), launch: ymd(pick(r, K.listDd)),
          price: n(pick(q, K.close)), nav: n(pick(q, K.nav)),
          aum: n(pick(q, K.netAsset)) != null ? Math.round(n(pick(q, K.netAsset)) / 1e8) : null,
          currency: 'KRW', status: 'sale',
          risk: null, tax: [], channel: [], minAmount: null, dist: null,
          asset: assetOf(nm, ''), region: regionOf(nm),
          ret1m: null, ret3m: null, ret6m: null, ret1y: null, ret3y: null,
          hedged: /\(H\)/.test(nm) ? 'h' : 'uh',
          series: null, bench: null, holdings: null
        };
      }).filter(function (p) { return p.code && p.name[0]; });
      log({ bld: 'ETN', ok: true, msg: out.length + '건 수신' });
      return out;
    });
  }

  /* ========================================================== 채권 어댑터 */
  function loadBond(asOfDate) {
    var base = lastBusinessDay(asOfDate);
    return krxPostRetry('dbms/MDC/STAT/standard/MDCSTAT09801', {}, 'trdDd', base).then(function (r) {
      var rows = r.rows;
      if (!rows.length) throw new Error('채권 전종목 시세 응답 없음');
      auditRow('MDCSTAT09801', rows[0], ['code', 'bondName', 'close']);
      var out = rows.map(function (row) {
        var nm = String(pick(row, K.bondName) || '');
        return {
          cat: 'bond', live: true, source: 'KRX',
          sourceUrl: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC020402010101',
          code: String(pick(row, K.code) || ''), name: [nm, nm],
          provider: [nm.split(/[0-9(]/)[0].trim(), nm.split(/[0-9(]/)[0].trim()],
          price: n(pick(row, K.close)), ytm: n(pick(row, K.ytm)),
          currency: 'KRW', status: 'sale', asset: 'bd', region: 'kr',
          bondType: bondTypeOf(nm),
          /* 신용등급·잔존만기·표면금리·이자지급주기는 이 응답에 없다 */
          rating: null, residualY: null, coupon: null, cycle: null, maturity: null,
          risk: null, tax: [], channel: [], minAmount: null, aum: null,
          series: null, bench: null, holdings: null
        };
      }).filter(function (p) { return p.code && p.name[0]; });
      log({ bld: '채권', ok: true, msg: out.length + '건 수신' });
      return out;
    });
  }
  function bondTypeOf(nm) {
    if (/국고|국민주택|재정증권/.test(nm)) return 'gov';
    if (/통안|지역개발|도시철도|지방/.test(nm)) return 'muni';
    if (/카드|캐피탈|할부|리스/.test(nm)) return 'card';
    if (/조건부자본|신종자본|후순위/.test(nm)) return 'sub';
    return 'corp';
  }

  /* ETF 개별 시계열 — 상세 패널 열 때만 조회 (전체 선조회는 요청 수가 과도) */
  function loadSeries(isin, asOfDate) {
    if (!isin) return Promise.reject(new Error('ISIN 없음'));
    var base = lastBusinessDay(asOfDate);
    return krxPost('dbms/MDC/STAT/standard/MDCSTAT04501', {
      strtDd: fmtDd(monthsAgo(base, 12)), endDd: fmtDd(base), isuCd: isin, isin: isin
    }).then(function (j) {
      var rows = rowsOf(j);
      if (!rows.length) throw new Error('시계열 응답 없음');
      /* KRX 는 최신일이 먼저 오므로 오름차순으로 되돌린다 */
      var pts = rows.map(function (r) {
        return { d: ymd(pick(r, K.tradeDd)), v: n(pick(r, K.close)) };
      }).filter(function (x) { return x.d && x.v != null; }).sort(function (a, b) {
        return a.d < b.d ? -1 : 1;
      });
      if (!pts.length) throw new Error('시계열 파싱 실패');
      /* 13포인트(월 단위)로 리샘플 — 화면 차트/스파크라인 규격에 맞춘다 */
      var out = [], step = (pts.length - 1) / 12;
      for (var i = 0; i <= 12; i++) out.push(pts[Math.round(i * step)].v);
      return out;
    });
  }

  /* ====================================================== CSV / JSON 임포트 */
  /* 공개 소스가 없는 상품군(펀드·ELS·RP·랩·연금)은 사내 데이터를 파일로 받는다.
     헤더명은 한/영 모두 인식한다. 알 수 없는 컬럼은 무시한다.              */
  var CSV_MAP = {
    '상품군': 'cat', 'category': 'cat',
    '상품명': 'name', 'name': 'name', 'product': 'name',
    '상품코드': 'code', 'code': 'code',
    '운용사': 'provider', '발행사': 'provider', 'provider': 'provider',
    '위험등급': 'risk', 'risk': 'risk',
    '판매상태': 'status', 'status': 'status',
    '통화': 'currency', 'currency': 'currency',
    '최소가입금액': 'minAmount', 'minimum': 'minAmount',
    '총보수': 'fee', 'fee': 'fee',
    '일임보수': 'mgmtFee', '신탁보수': 'mgmtFee',
    '설정액': 'aum', '순자산': 'aum', 'aum': 'aum',
    '1개월': 'ret1m', '3개월': 'ret3m', '6개월': 'ret6m', '1년': 'ret1y', '3년': 'ret3y',
    '제시수익률': 'coupon', 'coupon': 'coupon',
    '최초배리어': 'barrier', 'barrier': 'barrier',
    '낙인': 'knockIn', 'knockin': 'knockIn',
    '만기': 'maturityM', 'maturity': 'maturityM',
    '청약마감': 'subEnd',
    '매매수익률': 'ytm', 'ytm': 'ytm',
    '신용등급': 'rating', 'rating': 'rating',
    '잔존기간': 'residualY',
    '약정수익률': 'rate', 'rate': 'rate',
    '약정기간': 'termD',
    '기초자산': 'underlying', 'underlying': 'underlying',
    '기초지수': 'etfIndex',
    '세제혜택': 'tax', '판매채널': 'channel', '투자지역': 'region', '자산유형': 'asset'
  };
  var CAT_ALIAS = {
    '펀드': 'fund', 'fund': 'fund', 'funds': 'fund',
    'etf': 'etf', 'etn': 'etf', 'etf·etn': 'etf',
    'els': 'els', 'dls': 'els', 'els·dls': 'els', 'elb': 'els',
    '채권': 'bond', 'bond': 'bond',
    'rp': 'rp', 'cma': 'rp', 'rp·cma': 'rp',
    '랩': 'wrap', '신탁': 'wrap', '랩·신탁': 'wrap', 'wrap': 'wrap',
    '연금': 'pension', 'irp': 'pension', 'isa': 'pension', '연금·절세': 'pension'
  };

  /* 따옴표·줄바꿈을 포함한 CSV 를 정확히 분해한다 */
  function parseCsv(text) {
    text = text.replace(/^﻿/, '');
    var rows = [], row = [], cur = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c !== '\r') cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  }

  function fromCsv(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) throw new Error('데이터 행이 없습니다');
    var head = rows[0].map(function (h) { return String(h).trim(); });
    var keys = head.map(function (h) {
      return CSV_MAP[h] || CSV_MAP[h.toLowerCase()] || null;
    });
    if (keys.indexOf('name') < 0) {
      throw new Error('필수 컬럼 "상품명"(name) 을 찾을 수 없습니다. 헤더: ' + head.join(', '));
    }
    var NUM = ['risk', 'minAmount', 'fee', 'mgmtFee', 'aum', 'ret1m', 'ret3m', 'ret6m', 'ret1y',
      'ret3y', 'coupon', 'barrier', 'knockIn', 'maturityM', 'ytm', 'residualY', 'rate', 'termD'];
    var LIST = ['tax', 'channel', 'underlying'];
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var p = { live: true, source: 'CSV', tax: [], channel: [] };
      rows[r].forEach(function (cell, ci) {
        var k = keys[ci];
        if (!k) return;
        var v = String(cell).trim();
        if (v === '') return;
        if (k === 'cat') p.cat = CAT_ALIAS[v.toLowerCase()] || v;
        else if (k === 'name' || k === 'provider') p[k] = [v, v];
        else if (NUM.indexOf(k) >= 0) p[k] = n(v);
        else if (LIST.indexOf(k) >= 0) p[k] = v.split(/[;|/]/).map(function (s) { return s.trim(); }).filter(Boolean);
        else p[k] = v;
      });
      if (!p.name) continue;
      if (!p.cat) p.cat = 'fund';
      if (!p.code) p.code = 'CSV' + (r);
      if (!p.currency) p.currency = 'KRW';
      if (!p.status) p.status = 'sale';
      out.push(p);
    }
    if (!out.length) throw new Error('변환된 상품이 없습니다');
    log({ bld: 'CSV', ok: true, msg: out.length + '건 임포트' });
    return out;
  }

  /* ================================================================= 총괄 */
  /* 소스별로 독립 실행 — 하나가 실패해도 나머지는 반영한다 */
  var CATALOG = [
    { id: 'etf', label: ['ETF (KRX 전종목)', 'ETF (KRX all listings)'], cats: ['etf'], run: loadEtf },
    { id: 'etn', label: ['ETN (KRX 전종목)', 'ETN (KRX all listings)'], cats: ['etf'], run: loadEtn },
    { id: 'bond', label: ['채권 (KRX 전종목 시세)', 'Bonds (KRX all listings)'], cats: ['bond'], run: loadBond }
  ];
  /* 공개 소스가 없는 상품군 — 화면에 사유를 그대로 표시한다 */
  var NO_SOURCE = {
    fund: ['공개 API 없음 (금투협 전자공시)', 'No public API (KOFIA disclosure)'],
    els: ['공개 API 없음 (발행사 홈페이지 전용)', 'No public API (issuer site only)'],
    rp: ['공개 API 없음 (발행사 홈페이지 전용)', 'No public API (issuer site only)'],
    wrap: ['공개 소스 없음', 'No public source'],
    pension: ['공개 API 없음', 'No public API']
  };

  function loadAll(asOfDate, onEach) {
    resetDiag();
    var results = {};
    return Promise.all(CATALOG.map(function (s) {
      var t0 = Date.now();
      return s.run(asOfDate).then(function (rows) {
        results[s.id] = { ok: true, rows: rows, ms: Date.now() - t0 };
        if (onEach) onEach(s.id, results[s.id]);
      }).catch(function (e) {
        results[s.id] = { ok: false, rows: [], ms: Date.now() - t0, error: String(e.message || e) };
        log({ bld: s.id, ok: false, msg: String(e.message || e) });
        if (onEach) onEach(s.id, results[s.id]);
      });
    })).then(function () { return results; });
  }

  return {
    loadAll: loadAll,
    loadSeries: loadSeries,
    fromCsv: fromCsv,
    parseCsv: parseCsv,
    getDiag: getDiag,
    CATALOG: CATALOG,
    NO_SOURCE: NO_SOURCE,
    PROXIES: PROXIES,
    _internal: { krxPost: krxPost, rowsOf: rowsOf, pick: pick, K: K, n: n, ymd: ymd, fmtDd: fmtDd }
  };
})();
