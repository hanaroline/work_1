/**
 * 투자설명서 조회 · 자동 반영 모듈
 *
 * 상품을 선택했을 때 각 항목에 투자설명서 내용을 자동으로 채우는 경로를 제공한다.
 *
 *   ① 사내 상품 API      설정된 엔드포인트에서 상품코드로 조회 (사내망 전용)
 *   ② 투자설명서 PDF     PDF를 올리면 텍스트를 추출해 항목별로 자동 반영
 *   ③ JSON 가져오기      다른 담당자가 내보낸 상품 프로필을 그대로 적용
 *   ④ 필수입력           위 경로가 모두 불가할 때 담당자가 직접 입력
 *
 * PDF 자동 반영은 반드시 '근거 문구' 를 함께 보여주고, 담당자가 확인(승인)한
 * 값만 스크립트에 반영한다. 근거 없이 값을 확정하면 부정확한 설명으로
 * 부당권유행위 감점 사유가 되기 때문이다.
 */
(function (g) {
  'use strict';

  /* ==========================================================
     1. 추출 규칙
     - id       : 투자설명서 필드 id
     - re       : 정규식 (첫 그룹이 값). 배열이면 순서대로 시도
     - map      : 매치 → 최종 값
     ========================================================== */
  /* 설명서마다 "매우높은위험" / "매우 높은 위험" 이 섞여 있어 띄어쓰기를 허용한다 */
  var GRADE_WORD = '매우\\s*높은\\s*위험|높은\\s*위험|다소\\s*높은\\s*위험|보통\\s*위험|낮은\\s*위험|매우\\s*낮은\\s*위험';
  var despace = function (s) { return String(s).replace(/\s+/g, ''); };

  /* ----------------------------------------------------------
     표 읽기
     pdfToText 가 표의 칸을 탭으로 끊어 준다. 펀드 투자설명서는 명칭·운용사·보수가
     전부 표 안에 있어, 「라벨 <탭> 값」 구조로 읽는 편이 본문 정규식보다 훨씬 정확하다.
     (본문 정규식은 옆 칸 값을 잘못 집어 오기 쉽다 — 총보수 자리에 선취수수료가 들어오는 식)
     ---------------------------------------------------------- */
  function cellsOf(line) { return line.split('\t').map(function (s) { return s.trim(); }); }

  /** 첫 칸이 라벨과 맞는 행을 찾아 나머지 칸을 값으로 돌려준다 */
  function rowValue(text, labelRe) {
    var lines = String(text).split('\n');
    var at = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], c = cellsOf(line);
      if (c.length >= 2 && labelRe.test(c[0])) {
        var v = c.slice(1).filter(function (x) { return x && x !== '-'; }).join(' ').trim();
        if (v) return { value: v, index: at, length: line.length };
      }
      at += line.length + 1;
    }
    return null;
  }

  /**
   * 보수·수수료 표에서 특정 클래스 행의 특정 열을 읽는다.
   * 머리글 행에서 열 번호를 찾고, 그 아래 클래스 행에서 같은 번호의 칸을 가져온다.
   */
  function feeCell(text, colRes, clsRe) {
    var lines = String(text).split('\n');
    var at = 0, head = -1, headAt = 0, col = -1;
    for (var i = 0; i < lines.length; i++) {
      var c = cellsOf(lines[i]);
      if (head < 0) {
        for (var k = 0; k < colRes.length && col < 0; k++) {
          for (var j = 0; j < c.length; j++) {
            if (colRes[k].test(c[j])) { col = j; break; }
          }
        }
        if (col >= 0) { head = i; headAt = at; }
      } else if (clsRe.test(c[0] || '') && c.length > col) {
        var v = c[col];
        if (v && v !== '-') return { value: v, index: headAt, length: lines[i].length + (at - headAt) };
      }
      at += lines[i].length + 1;
      /* 머리글에서 너무 멀어지면 다른 표다 */
      if (head >= 0 && i - head > 12) { head = -1; col = -1; }
    }
    return null;
  }

  /**
   * 줄바꿈으로 끊긴 본문을 잇는다.
   * PDF 는 폭에 맞춰 문장을 자르므로 "…성과를 추구합 / 니다." 처럼 갈라진다. 그대로 두면
   * 투자전략·투자대상 같은 서술 항목이 문장 중간에서 잘린 채 스크립트에 들어간다.
   * 표 행(탭 포함)과 짧은 줄(머리글·제목)은 손대지 않는다 — 그것까지 이으면 제목이 붙어 버린다.
   */
  function unwrap(lines) {
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var cur = lines[i];
      while (
        cur.indexOf('\t') < 0 && cur.length >= 40 && /[가-힣,·]$/.test(cur) &&
        i + 1 < lines.length && lines[i + 1].indexOf('\t') < 0 &&
        !/^\s*(?:\d+\s*[.)]|[○◦□■※【(])/.test(lines[i + 1]) && lines[i + 1].trim()
      ) {
        cur += lines[i + 1].trim();
        i++;
      }
      out.push(cur);
    }
    return out;
  }

  function num(m, i) { return m[i == null ? 1 : i].replace(/,/g, ''); }
  /**
   * 연·월·일 세 조각을 한국어 날짜로.
   * 아래쪽에 ISO 문자열 한 개를 받는 kdate(iso) 가 따로 있다. 이름이 같으면 함수 선언이
   * 호이스팅되면서 뒤엣것이 이겨, 추출 규칙의 모든 날짜가 「2026」 처럼 연도만 남았다.
   * (효력발생일·최초기준가격평가일·발행일·만기일 등 전 상품군의 날짜 항목이 조용히 깨진다.)
   */
  function kdateYMD(y, mo, d) { return y + '년 ' + (+mo) + '월 ' + (+d) + '일'; }

  /* 날짜 : 2026년 8월 1일 / 2026-08-01 / 2026.08.01 */
  var DATE = '(\\d{4})\\s*[년.\\-/]\\s*(\\d{1,2})\\s*[월.\\-/]\\s*(\\d{1,2})\\s*일?';

  var COMMON_RULES = [
    {
      id: 'riskGrade', label: '위험등급(숫자)',
      re: [new RegExp('(?:투자위험등급|위험등급|상품위험등급)[^\\d]{0,20}(\\d)\\s*등급'),
      new RegExp('(\\d)\\s*등급\\s*[\\(\\[]?\\s*(?:' + GRADE_WORD + ')')],
      map: function (m) { return num(m); }
    },
    {
      id: 'riskLabel', label: '위험등급(명칭)',
      re: [new RegExp('(?:\\d\\s*등급\\s*[\\(\\[]?\\s*)(' + GRADE_WORD + ')'),
      new RegExp('(' + GRADE_WORD + ')')],
      /* "매우 높은 위험" 처럼 띄어 쓴 표기도 항목 값은 붙여서 통일한다 */
      map: function (m) { return despace(m[1]); }
    }
  ];

  var RULES = {
    /**
     * 펀드 — 간이투자설명서는 거의 전부 표다. 「라벨 <탭> 값」 행을 먼저 읽고,
     * 표에서 못 찾은 것만 본문 정규식으로 넘긴다.
     */
    fund: COMMON_RULES.concat([
      {
        id: 'name', label: '펀드 명칭',
        fn: function (t) { return rowValue(t, /^(?:집합투자기구의?\s*명칭|펀드\s*명칭|상품\s*명|펀드명)$/); },
        re: [/(?:집합투자기구의?\s*명칭|펀드\s*명칭|상품명)\s*[:：]?\s*([^\n]{6,90}?(?:투자신탁|투자회사)[^\n]{0,30})/,
        /([가-힣A-Za-z0-9()\[\]·\-\s]{6,70}(?:증권\s*)?자?투자신탁\s*\d*호?\s*\([^)]{1,20}\))/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'mgr', label: '자산운용사',
        fn: function (t) { return rowValue(t, /^(?:집합투자업자|자산운용회사|자산운용사|운용회사|운용사)$/); },
        re: [/(?:집합투자업자|자산운용회사|운용회사)\s*[:：]?\s*([가-힣A-Za-z()\s]{2,30}?(?:자산운용|투자신탁운용|운용)(?:주식회사|㈜)?)/,
        /([가-힣A-Za-z]{2,20}자산운용)/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'fundType', label: '펀드 유형',
        fn: function (t) { return rowValue(t, /^(?:집합투자기구의?\s*종류|펀드\s*유형|펀드의?\s*종류|상품\s*유형)$/); }
      },
      {
        /**
         * A클래스 총보수(연).
         * 표에서 클래스 A 행의 「합성 총보수·비용」(없으면 「총보수」) 칸을 읽는다.
         * 본문 정규식만 쓰면 머리글 바로 뒤에 오는 선취판매수수료 값(납입금액의 1.00%)을
         * 총보수로 집어 온다 — 실제로 그렇게 틀리고 있었다.
         */
        id: 'clsAExp', label: '총보수(연)',
        fn: function (t) {
          return feeCell(t, [/합성\s*총\s*보수/, /총\s*보수[·\s]*비용/, /^총\s*보수/], /^A(?:[\s\-]|클래스|$)/i);
        },
        re: [/합성\s*총\s*보수[·\s]*비용[^가-힣\d%]{0,20}?연?\s*(\d+\.\d+)\s*%/,
        /총\s*보수[·\s]*비용[^가-힣\d%]{0,20}?연?\s*(\d+\.\d+)\s*%/],
        map: function (m) { return num(m); }
      },
      {
        id: 'clsCExp', label: 'C클래스 총보수(연)',
        fn: function (t) {
          return feeCell(t, [/합성\s*총\s*보수/, /총\s*보수[·\s]*비용/, /^총\s*보수/], /^C(?:[\s\-]|클래스|$)/i);
        }
      },
      {
        id: 'clsA', label: '선취판매수수료',
        fn: function (t) {
          var r = feeCell(t, [/선취\s*판매\s*수수료/, /선취\s*수수료/, /판매\s*수수료/], /^A(?:[\s\-]|클래스|$)/i);
          if (!r) return null;
          /* 표에 "1.00% 이내" 만 적힌 경우 기준(납입금액)을 붙여 준다 */
          if (/^\d/.test(r.value)) r.value = '납입금액의 ' + r.value;
          return r;
        },
        re: [/선취\s*판매\s*수수료[^\d%]{0,40}?(\d+(?:\.\d+)?)\s*%\s*(이내)?/],
        map: function (m) { return '납입금액의 ' + num(m) + '%' + (m[2] ? ' 이내' : ''); }
      },
      {
        id: 'redeemFee', label: '환매수수료',
        fn: function (t) { return rowValue(t, /^환매\s*수수료$/); },
        re: [/환매\s*수수료\s*[:：]?\s*(없음|해당\s*없음|징구하지\s*않(?:음|습니다))/,
        /환매\s*수수료[^\n]{0,40}?(\d+(?:\.\d+)?\s*%[^\n]{0,40})/],
        map: function (m) { return /없|않/.test(m[1]) ? '없음' : m[1].trim(); }
      },
      {
        id: 'buyCut', label: '매입 기준시각',
        re: [/(\d{1,2})\s*시\s*(\d{1,2})?\s*분?\s*(?:이전|까지|경과)/],
        map: function (m) { return m[1] + '시' + (m[2] ? ' ' + (+m[2]) + '분' : ''); }
      },
      {
        id: 'buyBefore', label: '기준시각 이전 매입 적용',
        re: [/(\d{1,2})\s*시\s*(?:\d{1,2}\s*분\s*)?이전에?\s*(?:매입|취득)[^\n]{0,20}?제?\s*(\d)\s*영업일/],
        map: function (m) { return '제' + m[2] + '영업일 기준가격 적용'; }
      },
      {
        id: 'redPay', label: '환매대금 지급일',
        re: [/제?\s*(\d)\s*영업일\s*에?\s*환매\s*대금/,
        /환매\s*대금[^\n]{0,16}?제?\s*(\d)\s*영업일/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        id: 'redBefore', label: '기준시각 이전 환매 적용',
        re: [/(\d{1,2})\s*시\s*(?:\d{1,2}\s*분\s*)?이전에?\s*환매[^\n]{0,24}?제?\s*(\d)\s*영업일/],
        map: function (m) { return '제' + m[2] + '영업일 기준가격 적용'; }
      },
      {
        id: 'term', label: '계약기간',
        fn: function (t) { return rowValue(t, /^(?:존속기간|계약기간|신탁계약기간)$/); },
        re: [/(추가|개방)형/, /(단위|폐쇄)형/],
        map: function (m) { return /추가|개방/.test(m[1]) ? '환매가 가능한 개방형' : '폐쇄형'; }
      },
      {
        id: 'redeemable', label: '환매 가능 여부',
        re: [/(추가|개방)형/],
        map: function () { return '가능 (개방형)'; }
      },
      {
        id: 'docDate', label: '증권신고서 효력발생일',
        fn: function (t) {
          var r = rowValue(t, /효력\s*발생일?/);
          if (!r) return null;
          var m = new RegExp(DATE).exec(r.value);
          return m ? { value: kdateYMD(m[1], m[2], m[3]), index: r.index, length: r.length } : null;
        },
        re: [new RegExp('효력\\s*발생일?\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'targets', label: '투자대상 자산',
        fn: function (t) { return rowValue(t, /^(?:투자\s*대상|주된?\s*투자\s*대상|투자대상\s*자산)$/); },
        re: [/투자\s*대상\s*(?:및\s*투자\s*전략)?\s*[:：]\s*([^\n]{10,180})/],
        map: function (m) { return m[1].replace(/^[:：\s]+/, '').trim(); }
      },
      {
        id: 'strategy', label: '투자전략',
        fn: function (t) { return rowValue(t, /^(?:투자\s*전략|주된?\s*투자\s*전략|운용\s*전략)$/); },
        re: [/투자\s*전략\s*[:：]\s*([^\n]{10,200})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'varPct', label: 'VaR 값(%)',
        re: [/VaR[^\d%]{0,30}?(\d+(?:\.\d+)?)\s*%/i],
        map: function (m) { return num(m); }
      },
      {
        id: 'fxHedge', label: '환헤지 여부',
        re: [/환(?:율)?\s*헤지[^\n]{0,20}?(하지\s*않|미실시|실시하지)/, /환(?:율)?\s*헤지[^\n]{0,16}?(실시|합니다|수행)/],
        map: function (m) { return /않|미실시|하지/.test(m[1]) ? '환헤지 미실시' : '환헤지 실시'; }
      }
    ]),

    els: COMMON_RULES.concat([
      {
        id: 'name', label: '상품 명칭',
        re: [/((?:미래에셋증권|[가-힣A-Za-z]{2,12}증권)\s*제?\s*\d{3,6}\s*회[^\n]{0,40}?(?:파생결합증권|ELS|DLS|ELB|DLB)[^\n]{0,20})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'round', label: '발행회차',
        re: [/제?\s*(\d{3,6})\s*회/],
        map: function (m) { return '제' + num(m) + '회'; }
      },
      {
        id: 'issuer', label: '발행사',
        re: [/(?:발행\s*회사|발행인|발행사)\s*[:：]?\s*([가-힣A-Za-z()\s]{2,24}증권(?:주식회사|㈜)?)/,
        /([가-힣A-Za-z]{2,12}증권)\s*제?\s*\d{3,6}\s*회/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'under', label: '기초자산',
        re: [/기초\s*자산\s*[:：]?\s*([^\n]{4,120})/],
        map: function (m) { return m[1].replace(/\s{2,}/g, ' ').trim(); }
      },
      {
        id: 'fixDate', label: '최초기준가격 평가일',
        re: [new RegExp('최초\\s*기준\\s*가격\\s*평가일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'issueDate', label: '발행일',
        re: [new RegExp('발행일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'matDate', label: '만기일',
        re: [new RegExp('만기(?:상환)?일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'earlyCycle', label: '조기상환 주기',
        re: [/(?:자동\s*)?조기\s*상환\s*(?:주기|평가\s*주기)\s*[:：]?\s*(?:매)?\s*(\d{1,2})\s*개월/],
        map: function (m) { return num(m) + '개월'; }
      },
      {
        id: 'knockIn', label: 'KI 배리어',
        re: [/(?:원금손실발생조건|KI|Knock[\s\-]?In)[^\d%]{0,40}?(\d{2,3})\s*%/],
        map: function (m) { return num(m) + '%'; }
      },
      {
        id: 'coupon', label: '제시수익률',
        re: [/(?:세전\s*)?(?:제시\s*)?수익률[^\d%]{0,30}?연\s*(\d+(?:\.\d+)?)\s*%/,
        /연\s*(\d+(?:\.\d+)?)\s*%/],
        map: function (m) { return '연 ' + num(m) + '%'; }
      },
      {
        id: 'midAmt6', label: '6개월 이내 중도상환금액',
        re: [/6\s*개월[^\n]{0,40}?공정가액[^\d%]{0,20}?(\d{2}(?:\.\d)?)\s*%\s*이상/],
        map: function (m) { return '공정가액(기준가)의 ' + num(m) + '% 이상'; }
      },
      {
        id: 'midAmtAfter', label: '6개월 경과 후 중도상환금액',
        re: [/(?:그\s*이후|6\s*개월\s*(?:이후|경과))[^\n]{0,40}?공정가액[^\d%]{0,20}?(\d{2}(?:\.\d)?)\s*%\s*이상/],
        map: function (m) { return '공정가액(기준가)의 ' + num(m) + '% 이상'; }
      },
      {
        id: 'subUnit', label: '청약단위',
        re: [/청약\s*단위\s*[:：]?\s*([^\n]{2,40})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'docDate', label: '투자설명서 기준일',
        re: [new RegExp('(?:효력\\s*발생일?|작성\\s*기준일)\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      }
    ]),

    bondKrw: COMMON_RULES.concat([
      {
        id: 'name', label: '종목명',
        re: [/종목\s*명\s*[:：]?\s*([^\n]{3,50})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'issuer', label: '발행사',
        re: [/(?:발행\s*(?:회사|기관|인|사))\s*[:：]?\s*([^\n]{2,40})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'kind', label: '채권의 종류',
        re: [/(국고채권|국채|지방채|특수채|통화안정증권|회사채|금융채|여신전문금융회사채|은행채|신종자본증권|후순위채)/],
        map: function (m) { return m[1]; }
      },
      {
        id: 'coupon', label: '표면이자율',
        re: [/(?:표면\s*이(?:자)?율|발행\s*이자율|표면\s*금리)\s*[:：]?\s*연?\s*(\d+(?:\.\d+)?)\s*%/],
        map: function (m) { return num(m); }
      },
      {
        id: 'payCycle', label: '이자지급주기',
        re: [/이자\s*지급\s*주기\s*[:：]?\s*(?:매)?\s*(\d{1,2})\s*개월/],
        map: function (m) { return num(m) + '개월'; }
      },
      {
        id: 'payType', label: '이자지급유형',
        re: [/(이표채|할인채|복리채|단리채)/],
        map: function (m) { return m[1]; }
      },
      {
        id: 'issueDate', label: '발행일',
        re: [new RegExp('발행일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'matDate', label: '만기일',
        re: [new RegExp('만기일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'credit', label: '신용등급',
        re: [/신용\s*등급\s*[:：]?\s*(AAA|AA[+\-]?|A[+\-]?|BBB[+\-]?|BB[+\-]?|B[+\-]?|CCC[+\-]?|CC|C|D)(?![A-Za-z])/],
        map: function (m) { return m[1]; }
      },
      {
        id: 'guarantee', label: '보증 여부',
        re: [/(무보증\s*사채|무보증\s*채권|보증\s*사채|담보부\s*사채)/],
        map: function (m) { return m[1].replace(/\s+/g, ' '); }
      },
      {
        id: 'fee', label: '매매수수료',
        re: [/(?:매매)?\s*수수료\s*[:：]?\s*(없음|해당\s*없음)/, /수수료[^\n]{0,20}?(\d+(?:\.\d+)?\s*%)/],
        map: function (m) { return /없/.test(m[1]) ? '없음' : m[1].trim(); }
      },
      {
        id: 'mpRate', label: '민평금리',
        re: [/민평\s*금리\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%?/],
        map: function (m) { return num(m) + '%'; }
      },
      {
        id: 'mpPrice', label: '민평단가',
        re: [/민평\s*단가\s*[:：]?\s*([\d,]+(?:\.\d+)?)/],
        map: function (m) { return num(m); }
      },
      {
        id: 'tradePrice', label: '매매단가',
        re: [/매매\s*단가\s*[:：]?\s*([\d,]+(?:\.\d+)?)/],
        map: function (m) { return num(m); }
      }
    ]),

    bondFx: COMMON_RULES.concat([
      {
        id: 'name', label: '종목명',
        re: [/종목\s*명\s*[:：]?\s*([^\n]{3,50})/, /^([A-Z]{1,8}\s+[\d\/\s.]{1,14}\s+\d{1,2}\/\d{1,2}\/\d{2,4})/m],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'issuer', label: '발행사(국)',
        re: [/(?:발행\s*(?:회사|기관|인|사|국))\s*[:：]?\s*([^\n]{2,40})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'ccy', label: '발행통화',
        re: [/발행\s*통화\s*[:：]?\s*([A-Z]{3})/, /\b(USD|EUR|JPY|BRL|CNY|AUD|GBP|MXN|IDR|INR|TRY)\b/],
        map: function (m) { return m[1]; }
      },
      {
        id: 'coupon', label: '표면금리',
        re: [/(?:표면\s*금리|표면\s*이(?:자)?율|Coupon)\s*[:：]?\s*연?\s*(\d+(?:\.\d+)?)\s*%/],
        map: function (m) { return num(m); }
      },
      {
        id: 'payCycle', label: '이자지급주기',
        re: [/이자\s*지급\s*주기\s*[:：]?\s*(?:매)?\s*(\d{1,2})\s*개월/],
        map: function (m) { return num(m) + '개월'; }
      },
      {
        id: 'payType', label: '이자지급유형',
        re: [/(이표채|할인채|복리채|단리채)/],
        map: function (m) { return m[1]; }
      },
      {
        id: 'issueDate', label: '발행일',
        re: [new RegExp('발행일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'matDate', label: '만기일',
        re: [new RegExp('만기일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'credit', label: '국제신용등급',
        re: [/(?:국제\s*)?신용\s*등급\s*[:：]?\s*((?:AAA|AA[+\-]?|A[+\-]?|BBB[+\-]?|BB[+\-]?|B[+\-]?|Aaa|Aa\d|A\d|Baa\d|Ba\d|B\d)(?:\s*\([^)]{2,20}\))?)/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'country', label: '투자대상 국가',
        re: [/(?:투자\s*대상\s*국가|발행\s*국가)\s*[:：]?\s*([^\n]{2,30})/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'fee', label: '매매수수료',
        re: [/(?:매매)?\s*수수료\s*[:：]?\s*(없음|해당\s*없음)/, /수수료[^\n]{0,20}?(\d+(?:\.\d+)?\s*%)/],
        map: function (m) { return /없/.test(m[1]) ? '없음' : m[1].trim(); }
      }
    ]),

    irp: COMMON_RULES.concat([
      {
        id: 'name', label: '편입 펀드 명칭',
        re: [/([가-힣A-Za-z0-9()\[\]·\-\s]{6,70}(?:증권\s*)?자?투자신탁\s*\d*호?\s*\([^)]{1,20}\))/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'clsExp', label: '펀드 총보수(연)',
        re: [/총\s*보수[·\s]*비용?[^\d%]{0,30}?연?\s*(\d+\.\d+)\s*%/],
        map: function (m) { return num(m); }
      },
      {
        id: 'feeTotal', label: 'IRP 총수수료율',
        re: [/총\s*수수료\s*율?\s*[:：]?\s*연?\s*(\d+(?:\.\d+)?)\s*%/],
        map: function (m) { return '연 ' + num(m) + '%'; }
      },
      {
        id: 'limitYear', label: '연간 납입한도',
        re: [/납입\s*한도[^\d]{0,20}?([\d,]{3,6})\s*만?\s*원/],
        map: function (m) { return '연간 ' + m[1] + '만원'; }
      },
      {
        id: 'riskLimit', label: '실적배당 운용비율 제한',
        re: [/(?:위험자산|실적배당)[^\d%]{0,30}?(\d{2})\s*%/],
        map: function (m) { return '적립금의 ' + num(m) + '% 한도'; }
      }
    ])
  };

  /* ==========================================================
     2. 텍스트에서 필드 추출
     ========================================================== */
  function evidenceOf(text, idx, len) {
    var s = Math.max(0, idx - 45), e = Math.min(text.length, idx + len + 45);
    return (s > 0 ? '…' : '') + text.slice(s, e).replace(/\s+/g, ' ').trim() + (e < text.length ? '…' : '');
  }

  /**
   * @param {string} text  투자설명서 전체 텍스트
   * @param {string} cat   fund | els | bondKrw | bondFx | irp
   * @returns {Array<{id,label,value,evidence}>}
   */
  function extract(text, cat) {
    var rules = RULES[cat] || [];
    var out = [];
    rules.forEach(function (r) {
      /* 표 기반 규칙이 있으면 먼저 쓴다 — 본문 정규식보다 옆 칸을 잘못 집을 위험이 적다 */
      if (r.fn) {
        var t = null;
        try { t = r.fn(text); } catch (e) { t = null; }
        if (t && t.value != null && t.value !== '') {
          out.push({
            id: r.id, label: r.label, value: String(t.value).trim(),
            evidence: evidenceOf(text, t.index || 0, t.length || 0),
            fallback: false
          });
          return;
        }
      }
      if (!r.re) return;
      var res = Array.isArray(r.re) ? r.re : [r.re];
      for (var i = 0; i < res.length; i++) {
        var m = res[i].exec(text);
        if (!m) continue;
        var v;
        try { v = r.map ? r.map(m) : m[1]; } catch (e) { continue; }
        if (v == null || v === '') continue;
        out.push({
          id: r.id, label: r.label, value: String(v).trim(),
          evidence: evidenceOf(text, m.index, m[0].length),
          fallback: i > 0
        });
        return;
      }
    });
    return out;
  }

  /* ==========================================================
     3. PDF → 텍스트
     ========================================================== */
  var pdfReady = null;

  function ensurePdfjs() {
    if (pdfReady) return pdfReady;
    pdfReady = new Promise(function (resolve, reject) {
      var lib = g.pdfjsLib;
      if (!lib) { reject(new Error('pdf.js 를 불러오지 못했습니다. vendor/pdf.min.js 를 확인하세요.')); return; }
      /* 단일 파일 배포본은 워커 소스를 인라인 문자열로 갖고 있다 */
      if (g.SS_PDF_WORKER_SRC) {
        try {
          var blob = new Blob([g.SS_PDF_WORKER_SRC], { type: 'application/javascript' });
          lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
        } catch (e) { /* 워커 생성 실패 시 pdf.js 가 메인 스레드로 폴백 */ }
      } else {
        lib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
      }
      resolve(lib);
    });
    return pdfReady;
  }

  /**
   * @param {File|ArrayBuffer} file
   * @param {function(number,number)} [onPage]
   * @returns {Promise<{text:string, pages:number}>}
   */
  function pdfToText(file, onPage) {
    return ensurePdfjs().then(function (lib) {
      var buf = file instanceof ArrayBuffer ? Promise.resolve(file) : file.arrayBuffer();
      return buf.then(function (ab) {
        return lib.getDocument({ data: new Uint8Array(ab) }).promise;
      }).then(function (doc) {
        var chunks = [];
        /**
         * file:// 로 열면 브라우저가 Blob 워커 생성을 막아 pdf.js 가 메인 스레드로 내려온다
         * ("Setting up fake worker"). 프로미스 체인만 쓰면 마이크로태스크라 화면이 다시 그려지지
         * 않아, 수십 쪽짜리 설명서에서는 진행 표시가 멈춘 채 브라우저가 멈춘 것처럼 보인다.
         * 페이지마다 매크로태스크로 한 번 양보해 진행 상황이 보이게 한다.
         */
        var yieldToUI = function () { return new Promise(function (r) { setTimeout(r, 0); }); };
        var seq = Promise.resolve();
        for (var i = 1; i <= doc.numPages; i++) {
          (function (n) {
            seq = seq.then(yieldToUI).then(function () {
              return doc.getPage(n).then(function (page) {
                return page.getTextContent().then(function (tc) {
                  /**
                   * 좌표를 무시하고 이어붙이면 표가 뭉개진다.
                   *  - y 가 바뀌면 줄을 나눈다.
                   *  - 같은 줄 안에서 가로 간격이 벌어지면 「칸」이 바뀐 것이므로 탭을 넣는다.
                   * 펀드 투자설명서는 보수·수수료가 표로만 적혀 있어, 칸 구분이 없으면
                   * "총보수(연)" 머리글 뒤에 옆 칸의 선취수수료 값이 붙어 잘못 읽힌다.
                   */
                  var lastY = null, lastEnd = null, line = [], lines = [];
                  var flush = function () {
                    if (line.length) lines.push(line.join('').replace(/[ \t]+$/, ''));
                    line = [];
                  };
                  tc.items.forEach(function (it) {
                    var tr = it.transform || [];
                    var y = tr.length ? Math.round(tr[5]) : null;
                    var x = tr.length ? tr[4] : null;
                    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { flush(); lastEnd = null; }

                    /**
                     * pdf.js 는 칸 사이 여백을 「폭이 넓은 공백 항목」 하나로 준다
                     * (예: {str:" ", width:56}). 폭을 보고 칸 구분인지 낱말 사이 띄어쓰기인지 가른다.
                     */
                    if (/^\s*$/.test(it.str)) {
                      if (x !== null) lastEnd = x + (it.width || 0);
                      lastY = y === null ? lastY : y;
                      if (line.length) line.push((it.width || 0) > 8 ? '\t' : ' ');
                      return;
                    }
                    /* 공백 항목 없이 좌표만 벌어진 문서도 있다 */
                    if (lastEnd !== null && x !== null && x - lastEnd > 8 && !/\t$/.test(line[line.length - 1] || '')) {
                      line.push('\t');
                    }
                    line.push(it.str);
                    if (x !== null) lastEnd = x + (it.width || 0);
                    lastY = y;
                  });
                  flush();
                  chunks.push(unwrap(lines).join('\n'));
                  if (onPage) onPage(n, doc.numPages);
                });
              });
            });
          })(i);
        }
        return seq.then(function () {
          return { text: chunks.join('\n'), pages: doc.numPages };
        });
      });
    });
  }

  /* ==========================================================
     4. 사내 상품 API 어댑터
     ------------------------------------------------------------
     사내망에서 아래 형태의 엔드포인트를 설정하면 그대로 붙는다.
       GET {base}?cat={상품군}&code={상품코드}
       → { "fields": { "필드id": "값", ... } }  또는 필드가 평면으로 담긴 객체
     사내 시스템 응답 형태가 다르면 mapResponse 만 고치면 된다.
     ========================================================== */
  function apiConfig() {
    try { return JSON.parse(localStorage.getItem('ss_api_v1') || '{}'); }
    catch (e) { return {}; }
  }
  function setApiConfig(cfg) {
    try { localStorage.setItem('ss_api_v1', JSON.stringify(cfg || {})); } catch (e) { /* 저장 불가 환경 */ }
  }

  function mapResponse(json) {
    if (!json || typeof json !== 'object') return {};
    var src = json.fields && typeof json.fields === 'object' ? json.fields : json;
    var out = {};
    Object.keys(src).forEach(function (k) {
      var v = src[k];
      if (v == null || typeof v === 'object') return;
      out[k] = String(v);
    });
    return out;
  }

  function fetchFromApi(cat, code) {
    var cfg = apiConfig();
    if (!cfg.base) return Promise.reject(new Error('사내 상품 API 엔드포인트가 설정되지 않았습니다.'));
    var url = cfg.base + (cfg.base.indexOf('?') >= 0 ? '&' : '?') +
      'cat=' + encodeURIComponent(cat) + '&code=' + encodeURIComponent(code);
    var opt = { method: 'GET', headers: {} };
    if (cfg.header && cfg.headerValue) opt.headers[cfg.header] = cfg.headerValue;
    return fetch(url, opt).then(function (r) {
      if (!r.ok) throw new Error('조회 실패 (HTTP ' + r.status + ')');
      return r.json();
    }).then(function (j) {
      var fields = mapResponse(j);
      return Object.keys(fields).map(function (k) {
        return { id: k, label: k, value: fields[k], evidence: '사내 상품 API 응답', api: true };
      });
    });
  }

  /* ==========================================================
     5. ELS·DLS 차수별 상환조건 표
     ------------------------------------------------------------
     투자설명서의 상환조건 표를 구조로 갖고 있으면, 스크립트의
     「자동조기상환의 조건과 수익률」·「만기상환 조건과 수익률」 문구를
     빠짐없이 자동 생성할 수 있다. 표가 없으면 그 부분만 «확인필요» 로 남는다.

     schedule 행 : { months, barrier, payRate, annRate }
       months  경과 개월 (3, 6, 9 …)
       barrier 관찰 배리어 % (최초기준가격 대비)
       payRate 액면금액 대비 지급률 % (예: 102.13)
       annRate 연 수익률 % (예: 8.50)
     ========================================================== */

  var ORD = ['1차', '2차', '3차', '4차', '5차', '6차', '7차', '8차', '9차', '10차',
    '11차', '12차', '13차', '14차', '15차', '16차', '17차', '18차', '19차', '20차'];

  /** 107250000 -> '1억 725만원' */
  function krwWords(n) {
    n = Math.round(Number(n) || 0);
    var eok = Math.floor(n / 100000000);
    var man = Math.floor((n % 100000000) / 10000);
    var rest = n % 10000;
    var out = [];
    if (eok) out.push(eok.toLocaleString() + '억');
    if (man) out.push(man.toLocaleString() + '만');
    if (rest) out.push(rest.toLocaleString());
    return (out.join(' ') || '0') + '원';
  }

  /** 2026-11-30 -> 2026년 11월 30일 */
  function kdate(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? m[1] + '년 ' + (+m[2]) + '월 ' + (+m[3]) + '일' : String(iso || '');
  }

  function fmtPct(v) {
    if (v == null || v === '') return null;
    var n = Number(v);
    return Number.isFinite(n) ? (Math.round(n * 100) / 100).toFixed(2) : String(v);
  }

  /** 표 한 행 → 지급률·연수익률 문구 (없으면 «» 마커) */
  function payPhrase(row, seq, monthlyPP) {
    var pay = fmtPct(row.payRate), ann = fmtPct(row.annRate);
    var payTxt = pay != null ? pay + '%' : '«' + seq + ' 지급률(%)»';
    var annTxt = ann != null ? '연 ' + ann + '%' : '연 «' + seq + ' 연수익률(%)»';
    /**
     * 원금지급형 월지급식(ELB)은 상환금액이 액면금액(원금)이고 수익은 월수익으로 따로 나온다.
     * "액면금액의 100.00%(연 6.00%)" 로 읽으면 상환 자체에 6% 가 붙는 것처럼 들린다.
     */
    if (monthlyPP) return '액면금액의 ' + payTxt + '(원금, 월수익 포함 세전 ' + annTxt + ')';
    return '액면금액의 ' + payTxt + '(' + annTxt + ')';
  }

  /**
   * 스크립트에 쓰이는 ELS 손익구조 문구를 만든다.
   * @param {{schedule:Array, knockIn:(number|string), matBarrier:number}} doc
   * @returns {{earlyTable:string, matCond:string, coupon:string, knockIn:string, filled:number, total:number}}
   */
  /**
   * 차수 간격이 일정하면 비어 있는 경과개월을 산술로 채운다.
   * (차수 순서 × 주기는 계산으로 확정되는 값이므로 추정이 아니다.
   *  간격이 일정하지 않거나 근거가 1개뿐이면 채우지 않는다.)
   */
  function normalizeSchedule(rows) {
    var s = (rows || []).slice().map(function (r, i) {
      return {
        seq: r.seq != null ? Number(r.seq) : i + 1,
        months: r.months == null || r.months === '' ? null : Number(r.months),
        barrier: r.barrier == null || r.barrier === '' ? null : Number(r.barrier),
        payRate: r.payRate == null || r.payRate === '' ? null : Number(r.payRate),
        annRate: r.annRate == null || r.annRate === '' ? null : Number(r.annRate),
        evalDate: r.evalDate || null,
        maturity: !!r.maturity,
        evidence: r.evidence
      };
    });
    s.sort(function (a, b) { return a.seq - b.seq; });

    /* ELS 상환일정의 실제 규칙은 「N차 평가일 = N × 조기상환주기」 다.
       근거로 얻은 모든 행이 하나의 양의 정수 주기로 이 식을 만족할 때만
       비어 있는 경과개월을 채운다. 두 점만으로 주기를 역산하면 오독된 행
       하나가 전체 일정을 틀리게 만들 수 있어 그렇게 하지 않는다. */
    var known = s.filter(function (r) { return r.months != null && r.seq > 0; });
    if (known.length) {
      var step = known[0].months / known[0].seq;
      var ok = Number.isInteger(step) && step > 0 && known.every(function (r) {
        return r.months === r.seq * step;
      });
      if (ok) {
        s.forEach(function (r) {
          if (r.months == null && r.seq > 0) r.months = r.seq * step;
        });
      }
    }
    return s;
  }

  function buildElsTexts(doc) {
    var sched = normalizeSchedule(doc && doc.schedule)
      .filter(function (r) { return r.months != null || r.barrier != null; });
    if (!sched.length) return null;

    /* 원금지급형 월지급식이면 상환금액·수익 문구가 달라진다 */
    var mpp = !!(doc.principalProtected && doc.monthlyNote);

    var filled = 0, total = 0;
    var rows = sched.map(function (r, i) {
      /* 라벨은 배열 순서가 아니라 실제 차수를 쓴다.
         설명서 표에서 일부 차수만 읽힌 경우 순서로 매기면 4차가 2차로 표시된다. */
      var n = r.seq != null ? r.seq : i + 1;
      var seq = ORD[n - 1] || n + '차';
      total += 2;
      if (r.payRate != null && r.payRate !== '') filled++;
      if (r.annRate != null && r.annRate !== '') filled++;
      var bar = r.barrier != null && r.barrier !== '' ? fmtPct(r.barrier) + '%' : '«' + seq + ' 배리어(%)»';
      /* 실제 평가일이 있으면 함께 읽는다 — 평가표는 기준가격 결정일 설명을 요구한다 */
      var when = (r.months ? r.months + '개월' : '«' + seq + ' 경과개월»') + (r.evalDate ? ', ' + kdate(r.evalDate) : '');
      return '  · ' + seq + ' 자동조기상환평가일(' + when +
        ') : 모든 기초자산의 자동조기상환평가가격이 각 최초기준가격의 ' + bar + ' 이상인 경우 → ' +
        payPhrase(r, seq, mpp) + '를 지급';
    });

    var last = sched[sched.length - 1];
    var matBar = doc.matBarrier != null && doc.matBarrier !== '' ? doc.matBarrier : last.barrier;
    var matBarTxt = matBar != null && matBar !== '' ? fmtPct(matBar) + '%' : '«만기 배리어(%)»';
    var ki = doc.knockIn;
    var kiNum = (ki == null || ki === '') ? null : String(ki).replace(/[^0-9.]/g, '');
    var noKi = kiNum === '' || kiNum === null || /없음|노낙인|no.?ki/i.test(String(ki));

    var matWhen = last.evalDate ? '만기평가일(' + kdate(last.evalDate) + ')' : '만기평가일';
    var mat;
    if (doc.principalProtected) {
      /* 파생결합사채는 만기상환 표가 조건 충족·미충족 양쪽 모두 「액면금액」이다.
         만기 배리어를 조건처럼 읽으면 원금이 배리어에 걸린다고 잘못 설명하게 된다. */
      mat = '[상환금액] 자동조기상환이 발생하지 않을 경우, ' + matWhen +
        '에 기초자산 가격과 무관하게 액면금액의 100%(원금)를 상환합니다.' +
        (doc.monthlyNote ? ' 수익은 매월 월수익지급 조건에 따라 별도로 지급됩니다.' : '');
    } else {
      mat = '[이익조건] 자동조기상환이 발생하지 않을 경우, ' + matWhen + '에 모든 기초자산의 만기평가가격이 각 최초기준가격의 ' +
        matBarTxt + ' 이상인 경우 ' + payPhrase(last, '만기') + '의 세전수익률을 지급합니다.';
    }

    /**
     * 원금지급형(파생결합사채 ELB·DLB)은 조건을 못 맞춰도 원금이 깎이지 않는다.
     * 파생결합증권과 같은 「하락률만큼 원금손실」 문구를 읽으면 원금이 지켜지는 상품을
     * 두고 손실을 설명하는 것이 되어 그대로 부정확한 설명이다.
     */
    if (doc.principalProtected) {
      mat += '\n[원금 지급] 이 상품은 파생결합사채로, 만기까지 보유하시면 조건 충족 여부와 무관하게 투자원금이 지급됩니다.' +
        ' 조건을 만족하지 못하면 약정 수익을 받지 못할 뿐 원금손실은 발생하지 않습니다.' +
        '\n[유의사항] 다만 만기 전 중도상환을 신청하시는 경우 공정가액을 기준으로 상환금액이 산정되어 원금에 미달할 수 있고,' +
        ' 발행사인 미래에셋증권의 신용위험(파산·지급불능 등)이 발생하면 원금을 돌려받지 못할 수 있습니다.';
    } else if (!noKi) {
      mat += '\n위 조건을 만족하지 못하더라도, 모든 기초자산 중 어느 하나도 종가기준으로 각 최초기준가격의 ' + kiNum +
        '% 미만으로 하락한 적이 없는 경우 ' + payPhrase(last, '만기') + '의 세전수익률을 지급합니다.' +
        '\n[손실조건] 모든 기초자산 중 어느 하나라도 종가기준으로 각 최초기준가격의 ' + kiNum +
        '% 미만으로 하락한 적이 있는 경우, 모든 기초자산 중 하락률이 큰 기초자산의 하락률만큼 원금손실이 발생합니다.';
    } else {
      mat += '\n[손실조건] 위 조건을 만족하지 못하는 경우, 모든 기초자산 중 하락률이 큰 기초자산의 하락률만큼 원금손실이 발생합니다.';
    }

    /* 「이해를 돕기 위한 추가 설명」 예시 — 표 값으로 그대로 계산된다.
       평가표 탁월사례가 1억원 기준이므로 같은 기준을 쓴다. */
    var example = null;
    var ex = sched.find(function (r) { return r.payRate != null && r.barrier != null; });
    if (ex) {
      var n = ex.seq != null ? ex.seq : 1;
      var seqTxt = (ORD[n - 1] || n + '차');
      var base = 100000000;
      var amt = Math.round(base * ex.payRate / 100);
      example = '예를 들어 1억원을 투자하셨을 경우, ' + seqTxt + ' 자동조기상환 평가일' +
        (ex.evalDate ? '(' + kdate(ex.evalDate) + ')' : '') +
        '에 모든 기초자산의 평가가격이 모두 최초 기준가의 ' + fmtPct(ex.barrier) + '% 이상으로 ' + seqTxt +
        ' 조건을 만족했다면, ' + seqTxt + ' 수익률인 ' + fmtPct(ex.payRate - 100) + '%를 적용하여 ' +
        amt.toLocaleString() + '원(' + krwWords(amt) + ')으로 조기상환 됩니다.';
    }

    var ann = fmtPct(last.annRate);
    /* 주기는 경과개월이 둘 다 있는 인접 차수에서만 계산한다 */
    var cycle = null;
    for (var i = 1; i < sched.length; i++) {
      if (sched[i].months != null && sched[i - 1].months != null) {
        cycle = sched[i].months - sched[i - 1].months; break;
      }
    }
    if (cycle == null && sched.length === 1) cycle = sched[0].months;

    /* 월지급식이면 매달 조건·지급률을 조기상환 표 앞에 세운다 — 이 상품의 핵심 조항이다 */
    var early = rows.join('\n');
    if (doc.monthlyNote) early = '  · ' + doc.monthlyNote + '\n' + early;

    return {
      earlyTable: early,
      payoffExample: example,
      matCond: mat,
      coupon: ann != null ? '연 ' + ann + '%' : null,
      knockIn: noKi ? (doc.principalProtected ? '해당 없음 (원금지급형)' : '없음 (노낙인)') : kiNum + '%',
      earlyCycle: cycle ? cycle + '개월' : null,
      matTerm: last.months ? (last.months % 12 === 0 ? (last.months / 12) + '년' : last.months + '개월') : null,
      filled: filled, total: total
    };
  }

  /**
   * 투자설명서 텍스트에서 차수별 상환조건 표를 뽑는다.
   * 한 줄에 "N차" + 배리어%(≤100) + 지급률%(보통 100 초과) 가 함께 있는 행을 찾는다.
   * 서식이 달라 못 읽는 경우가 많으므로, 결과는 반드시 담당자가 표에서 확인·보정한다.
   */
  function parseSchedule(text) {
    var out = [];
    String(text || '').split('\n').forEach(function (line) {
      var seqM = line.match(/(\d{1,2})\s*차/);
      if (!seqM) return;
      var pcts = [];
      var re = /(\d{1,3}(?:\.\d{1,4})?)\s*%/g, m;
      while ((m = re.exec(line))) pcts.push(Number(m[1]));
      if (pcts.length < 2) return;

      var annM = line.match(/연\s*(\d{1,3}(?:\.\d{1,4})?)\s*%/);
      var ann = annM ? Number(annM[1]) : null;
      var monM = line.match(/(\d{1,3})\s*개월/);

      /* 배리어 = 100 이하 중 가장 큰 값, 지급률 = 100 이상 중 가장 작은 값 */
      var bars = pcts.filter(function (v) { return v > 0 && v <= 100; });
      var pays = pcts.filter(function (v) { return v > 100; });
      /* 연수익률로 이미 쓰인 값은 배리어 후보에서 제외 */
      if (ann != null) bars = bars.filter(function (v) { return v !== ann; });
      if (!bars.length && !pays.length) return;

      out.push({
        seq: Number(seqM[1]),
        months: monM ? Number(monM[1]) : null,
        barrier: bars.length ? Math.max.apply(null, bars) : null,
        payRate: pays.length ? Math.min.apply(null, pays) : null,
        annRate: ann,
        evidence: line.replace(/\s+/g, ' ').trim().slice(0, 140)
      });
    });

    /* 차수 중복 제거 후 정렬 */
    var seen = {}, rows = [];
    out.forEach(function (r) {
      if (seen[r.seq]) return;
      seen[r.seq] = 1; rows.push(r);
    });
    rows.sort(function (a, b) { return a.seq - b.seq; });

    /* 개월이 비어 있으면 차수 간격으로 추정하지 않는다 (부정확 설명 방지) */
    return rows;
  }

  g.SS_PROS = {
    RULES: RULES,
    extract: extract,
    pdfToText: pdfToText,
    fetchFromApi: fetchFromApi,
    apiConfig: apiConfig,
    setApiConfig: setApiConfig,
    buildElsTexts: buildElsTexts,
    parseSchedule: parseSchedule,
    normalizeSchedule: normalizeSchedule,
    pdfAvailable: function () { return !!g.pdfjsLib; }
  };
})(window);
