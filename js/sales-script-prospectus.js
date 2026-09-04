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
        var rest = c.slice(1).filter(function (x) { return x && x !== '-'; });
        /**
         * 표처럼 보이지만 표가 아닌 두 가지를 걸러낸다.
         *  ① 양쪽정렬된 본문 — 낱말마다 탭이 들어와 칸이 많고 다 짧다.
         *    ("집합투자업자 | 또는 | 판매회사는 | 이 | 투자신탁 …" 을 운용사명으로 읽었다)
         *  ② 머리글 행 — 값 칸이 전부 짧은 라벨이다.
         *    ("투자대상 | 투자비율 | 투자내용" 을 투자대상 자산으로 읽었다)
         */
        var avg = rest.join('').length / Math.max(1, rest.length);
        var prose = rest.length >= 4 && avg < 6;
        var header = rest.length >= 2 && rest.every(function (x) { return x.length <= 6; });
        if (!prose && !header) {
          var v = rest.join(' ').trim();
          if (v) return { value: v, index: at, length: line.length };
        }
      }
      at += line.length + 1;
    }
    return null;
  }

  /**
   * 라벨 뒤 몇 줄을 이어 붙인다.
   * 정식 투자설명서는 표 한 칸이 여러 줄로 쪼개져 나온다
   * ("환매\n방법\n오후 5 시 이전에 …"). 한 줄만 보면 값을 못 읽는다.
   */
  function joinAfter(text, labelRe, n) {
    var lines = String(text).split('\n');
    var at = 0;
    for (var i = 0; i < lines.length; i++) {
      if (labelRe.test(lines[i])) {
        var seg = lines.slice(i, i + (n || 8)).join(' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
        return { value: seg, index: at, length: seg.length };
      }
      at += lines[i].length + 1;
    }
    return null;
  }

  /**
   * 요약정보의 「투자자가 부담하는 수수료·총보수 및 비용」 표.
   *
   * 클래스 이름이 여러 줄로 쪼개지고 판매수수료 칸도 따로 떨어져, 칸 수가 행마다 다르다.
   * 그래서 왼쪽이 아니라 오른쪽 끝을 기준으로 센다 — 뒤 5칸은 투자기간별 예시 금액,
   * 그 앞 4칸이 순서대로 총보수 / 판매보수 / 동종유형 총보수 / 합성 총보수·비용이다.
   *   예) 0.8620  0.7000  0.8900  1.9652  298  508  728  1,201  2,607
   */
  function fundFeeTable(text) {
    var lines = String(text).split('\n');
    var rows = [], at = 0;
    var isInt = function (x) { return /^[\d,]+$/.test(x); };
    var isRate = function (x) { return /^\d+(?:\.\d+)?$/.test(x) || x === '-'; };
    for (var i = 0; i < lines.length; i++) {
      var c = cellsOf(lines[i]).filter(function (x) { return x !== ''; });
      if (c.length >= 9 && c.slice(-5).every(isInt) && c.slice(-9, -5).every(isRate)) {
        /* 클래스 이름·판매수수료는 앞 몇 줄에 흩어져 있다 */
        var label = '', cls = null;
        for (var k = i - 1; k >= 0 && k >= i - 6; k--) {
          var t = lines[k].replace(/\t/g, ' ').trim();
          if (!t || /^[\d,.\s%-]+$/.test(t)) break;
          label = t + ' ' + label;
          var mm = t.match(/\(([A-Za-z]{1,2}\d?(?:-[A-Za-z])?)\)\s*$/);
          if (mm) { cls = mm[1]; break; }
        }
        label = label.replace(/\s+/g, ' ').trim();
        var front = c.length >= 10 ? c[c.length - 10] : null;
        var salesFee = front && !isRate(front) ? front
          : (label.match(/납입금액의\s*[\d.]+\s*%\s*이내|없음/) || [null])[0];
        rows.push({
          cls: cls, label: label, salesFee: salesFee,
          total: c[c.length - 9], mgmtFee: c[c.length - 8],
          peerTotal: c[c.length - 7], synthetic: c[c.length - 6],
          index: at, length: lines[i].length
        });
      }
      at += lines[i].length + 1;
    }
    return rows;
  }

  /** 클래스 한 줄 골라내기 — A / A-e / C / C1 / C-e 표기가 섞여 있다 */
  function feeRow(text, clsRe) {
    var rows = fundFeeTable(text);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].cls && clsRe.test(rows[i].cls)) return rows[i];
    }
    return null;
  }

  /**
   * 「투자실적 추이(연평균 수익률)」 표의 최근 1년.
   * 머리글 아래 첫 실적 행을 쓰되 참조지수·변동성 행은 건너뛴다.
   */
  function fundReturn1y(text) {
    var lines = String(text).split('\n');
    var head = -1, at = 0, headAt = 0;
    var isDate = function (x) { return /^\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}$/.test(x); };
    for (var i = 0; i < lines.length; i++) {
      if (head < 0) {
        if (/최근\s*1\s*년/.test(lines[i]) && /최근\s*[235]\s*년/.test(lines[i])) { head = i; headAt = at; }
      } else if (i - head <= 16) {
        var c = cellsOf(lines[i]).filter(function (x) { return x !== ''; });
        if (c.length >= 3 && !/참조지수|비교지수|변동성|BM|벤치마크/i.test(c[0])) {
          var di = isDate(c[0]) ? 1 : (isDate(c[1] || '') ? 2 : -1);
          if (di > 0 && /^-?\d+(?:\.\d+)?$/.test(c[di] || '')) {
            return { value: c[di], index: headAt, length: (at - headAt) + lines[i].length };
          }
        }
      } else { break; }
      at += lines[i].length + 1;
    }
    return null;
  }

  /* ==========================================================
     펀드 완전 판매 관련 자료 판독
     ------------------------------------------------------------
     투자설명서가 아니라 지점에 내려오는 월간 사내 자료다. 실제 자료를 보고
     구조에 맞춰 읽는다 — 담긴 것이 생각보다 많다.

       ① 표지    「펀드 완전 판매 관련 자료 안내(2026 년 09 월)」  -> 자료 기준월
       ② 글로벌 시황  미국 / 한국 / 중국 / 채권 을 각각 한 단락으로 적어 둔다
                      -> 고른 펀드의 투자지역·유형에 맞는 단락을 골라 쓴다
       ③ 투자자 성향별 적합 상품위험등급  성장형=1 / 성장추구형=2·3 /
                      위험중립형=4 / 안정추구형=5 / 안정형=6
       ④ 위험등급별 주요 상품 정보 (기준일: 2026.08.25)
                      펀드명 · 위험등급 · 추천상품(●) · 제로인 소유형 ·
                      수익률 1M/3M/6M/1Y × (펀드, 동종유형) ·
                      표준편차 6M/1Y × (펀드, 동종유형) ·
                      총보수(펀드, 동종유형) · 합성총보수

     ④ 가 중요하다 — 동종유형 평균 수익률과 A Class 총보수·합성총보수가 여기 있다.
     투자설명서에서 못 읽던 값이고, 평가에서 인정하는 「동종유형」 정의(제로인
     소유형)와도 맞는다. 그래서 이 자료의 값을 카탈로그 수집분보다 앞세운다.
     ---------------------------------------------------------- */

  /** 자료 기준월 — 표지 제목의 「(2026 년 09 월)」 */
  function marketAsOf(text) {
    var t = String(text).slice(0, 8000);
    var best = null, at = 0;
    var push = function (y, mo, idx) {
      y = +y; mo = +mo;
      if (y < 100) y += 2000;
      if (!(y >= 2000 && y <= 2100) || !(mo >= 1 && mo <= 12)) return;
      var k = y * 100 + mo;
      if (best == null || k > best) { best = k; at = idx; }
    };
    var RES = [
      /완전\s*판매[^\n(（]{0,30}[(（]\s*(\d{4})\s*년\s*(\d{1,2})\s*월/g,
      /['’]?(\d{2,4})\s*년\s*(\d{1,2})\s*월/g,
      /(?:발간|작성)\s*[:：]?\s*(\d{4})\s*[.\-\/]\s*(\d{1,2})/g
    ];
    for (var i = 0; i < RES.length; i++) {
      var m;
      while ((m = RES[i].exec(t))) push(m[1], m[2], m.index);
      if (best != null) break;    /* 앞 규칙이 더 정확하다 — 잡히면 그것으로 끝낸다 */
    }
    if (best == null) return null;
    return { value: Math.floor(best / 100) + '년 ' + (best % 100) + '월', index: at };
  }
  /** 수익률·보수 기준일 — 「(기준일: 2026.08.25)」 */
  function marketBaseDate(text) {
    var m = /기준일\s*[:：]\s*(\d{4})\s*[.\-\/]\s*(\d{1,2})\s*[.\-\/]\s*(\d{1,2})/.exec(String(text));
    return m ? { value: kdateYMD(m[1], m[2], m[3]), index: m.index } : null;
  }
  /**
   * 글로벌 시황 — 「■ 글로벌 시황」 아래의 단락들. 실제 자료는 「- 미국은 …」
   * 「- 한국은 …」 「- 중국은 …」 「- 채권은 …」 처럼 대상별로 한 단락씩이다.
   * 대상을 함께 담아 두면, 고른 펀드에 맞는 단락만 골라 읽을 수 있다.
   */
  function marketOutlook(text) {
    var lines = String(text).split('\n');
    var HEAD = /^\s*[■▶◆●○□]*\s*(?:글로벌\s*)?시황(?:\s*및\s*전망)?\s*$|^\s*[■▶◆●○□]*\s*(?:증시|시장)\s*전망\s*$/;
    var NEXT = /^\s*[■▶◆●○□]\s*\S/;                 /* 다음 대제목 */
    var start = -1;
    for (var i = 0; i < lines.length; i++) { if (HEAD.test(lines[i])) { start = i; break; } }
    if (start < 0) return null;
    /* 단락을 모은다 — 「-」 로 시작하면 새 단락, 아니면 앞 단락에 이어 붙는다 */
    var paras = [];
    for (var j = start + 1; j < lines.length && j < start + 80; j++) {
      var raw = lines[j];
      if (NEXT.test(raw)) break;
      var s = raw.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
      if (!s || /^\d+$/.test(s) || /^-\s*\d+\s*-$/.test(s)) continue;
      if (/^[-–‐]\s*\S/.test(s)) paras.push(s.replace(/^[-–‐]\s*/, ''));
      else if (paras.length) paras[paras.length - 1] += ' ' + s;
    }
    paras = paras.filter(function (x) { return x.length >= 25; });
    if (!paras.length) return null;
    /* 단락마다 무엇을 말하는지 앞머리에서 읽는다 (「미국은」 「채권은」) */
    var WHO = [[/^미국/, '미국'], [/^한국|^국내/, '한국'], [/^중국/, '중국'], [/^일본/, '일본'],
      [/^유럽/, '유럽'], [/^인도/, '인도'], [/^신흥국|^이머징/, '신흥국'],
      [/^채권/, '채권'], [/^주식/, '주식'], [/^글로벌|^전\s*세계/, '글로벌']];
    var out = paras.map(function (p) {
      var who = null;
      for (var k = 0; k < WHO.length; k++) { if (WHO[k][0].test(p)) { who = WHO[k][1]; break; } }
      return { who: who, text: p };
    });
    return { value: out, index: start };
  }
  /**
   * 투자자 성향별 적합 상품위험등급. 실제 자료의 표는
   *   성장형 | 성장추구형 | 위험중립형 | 안정추구형 | 안정형
   *   1등급  | 2등급 3등급 | 4등급     | 5등급      | 6등급
   * 로 성향과 등급이 맞물려 있다. 성향 이름과 등급 숫자가 같은 표 안에 있으면
   * 순서대로 이어 붙인다 — 표 서식이 달라지면 비워 두고 사람이 채운다.
   */
  function marketProfileMap(text) {
    var t = String(text);
    var i = t.search(/투자자\s*성향별\s*적합\s*상품\s*위험\s*등급/);
    if (i < 0) return null;
    var seg = t.slice(i, i + 1200);
    var PROF = ['성장형', '성장추구형', '위험중립형', '안정추구형', '안정형'];
    var seen = PROF.filter(function (p) {
      /* 「성장형」 은 「성장추구형」 안에 들어 있다 — 앞뒤를 보고 가른다 */
      return new RegExp('(?:^|[^가-힣])' + p + '(?:[^가-힣]|$)').test(seg);
    });
    if (seen.length < 3) return null;
    var grades = [];
    var re = /(\d)\s*등급/g, m;
    while ((m = re.exec(seg))) { if (grades.indexOf(+m[1]) < 0) grades.push(+m[1]); }
    if (grades.length < 5) return null;
    return { value: seen.join(',') + '|' + grades.join(','), index: i };
  }
  /**
   * 위험등급별 주요 상품 정보 표.
   *
   * 칸이 행마다 흔들린다 — 추천상품(●) 칸이 비기도 하고 펀드명이 두 줄로
   * 쪼개지기도 한다. 그래서 왼쪽이 아니라 오른쪽 끝에서 센다:
   *   맨 뒤 3칸  = 총보수(펀드) · 총보수(동종유형) · 합성총보수
   *   그 앞 4칸  = 표준편차 6M(펀드·동종) · 1Y(펀드·동종)
   *   그 앞 8칸  = 수익률 1M·3M·6M·1Y × (펀드·동종)
   * 앞쪽 글자 칸이 펀드명·위험등급·추천상품·제로인 소유형이다.
   */
  function marketFundRows(text) {
    var lines = String(text).split('\n');
    var isNum = function (x) { return /^-?\d+(?:\.\d+)?$/.test(x); };
    var rows = [];
    for (var i = 0; i < lines.length; i++) {
      var c = cellsOf(lines[i]).map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
      if (c.length < 16) continue;
      var nums = [];
      /* 뒤에서부터 숫자만 걷어 온다 */
      for (var k = c.length - 1; k >= 0 && nums.length < 15; k--) {
        if (!isNum(c[k])) break;
        nums.unshift(c[k]);
      }
      if (nums.length !== 15) continue;
      var head = c.slice(0, c.length - 15);
      if (!head.length) continue;
      /* 앞쪽에서 위험등급·추천·소유형을 걷어내면 남는 것이 펀드명이다 */
      /**
       * 위험등급과 추천상품(●)을 걷어내면 「펀드명 … 제로인 소유형」 이 남는다.
       * 소유형은 낱말 목록으로 알아보려 했더니 「커머더티」 처럼 빠진 것이 펀드명에
       * 붙어 버렸다. 자리로 본다 — 남은 칸의 맨 뒤가 소유형이다.
       */
      var grade = null, rec = false, rest = [];
      head.forEach(function (x) {
        if (new RegExp('^(?:' + GRADE_WORD + ')$').test(despace(x))) { grade = despace(x); return; }
        if (/^[●○•*]$/.test(x)) { rec = true; return; }
        rest.push(x);
      });
      var kind = rest.length >= 2 ? rest.pop() : null;
      var nm = rest.join(' ').replace(/\s+/g, ' ').trim();
      if (nm.length < 4) continue;
      rows.push({
        name: nm, riskLabel: grade, recommended: rec, peerKind: kind,
        ret1m: nums[0], ret1mPeer: nums[1], ret3m: nums[2], ret3mPeer: nums[3],
        ret6m: nums[4], ret6mPeer: nums[5], ret1y: nums[6], ret1yPeer: nums[7],
        sd6m: nums[8], sd6mPeer: nums[9], sd1y: nums[10], sd1yPeer: nums[11],
        fee: nums[12], feePeer: nums[13], feeSynth: nums[14]
      });
    }
    return rows.length ? { value: rows, index: 0 } : null;
  }
  /**
   * 자료 전체를 한 번에 읽는다. 항목마다 모양이 달라(문단 목록·표 행)
   * 일반 extract 의 {id,label,value} 틀에 억지로 넣지 않는다.
   */
  function readMarket(text) {
    var pick = function (fn) { try { var r = fn(text); return r ? r.value : null; } catch (e) { return null; } };
    return {
      asOf: pick(marketAsOf),
      baseDate: pick(marketBaseDate),
      outlook: pick(marketOutlook) || [],
      profileMap: pick(marketProfileMap),
      rows: pick(marketFundRows) || []
    };
  }

  /**
   * 투자전략 — 「투자전략」 제목 아래의 본문을 읽는다.
   *
   * 처음에는 「모투자신탁은…」 같은 문장을 정규식으로 찾았는데, 그런 문장이 없는
   * 운용사가 많아 62% 에서 멈췄다. 실제 서식을 보면 제목 줄이 하나같이 짧고 또렷하다 —
   *   투자전략 / 2. 투자전략 / 2) 투자전략 / (1) 투자전략 / 가. 투자전략 및 위험관리
   * 그 아래에 본문이 온다. 그래서 제목을 찾아 아래를 읽는 방식으로 바꾼다.
   *
   * 다만 「투자전략」 이 투자목적·비교지수를 함께 담는 상위 제목으로도 쓰인다.
   * 바로 다음 줄이 「투자목적」 제목이면 그 자리는 건너뛰고 다음 제목을 찾는다 —
   * 투자목적을 전략이라고 읽으면 평가에서 운용전략 설명으로 인정되지 않는다.
   */
  function fundStrategy(text) {
    var lines = String(text).split('\n');
    var num = '(?:[0-9]{1,2}\\s*[.)]|\\([0-9]{1,2}\\)|[가-힣]\\s*\\.|[■▶◆○●※])?';
    var HEAD = new RegExp('^\\s*' + num + '\\s*(?:기본\\s*)?(?:투자|운용)\\s*전략(?:\\s*(?:및|,)\\s*[가-힣\\s]{0,20})?\\s*$');
    var GOAL = new RegExp('^\\s*' + num + '\\s*투자\\s*목적\\s*$');
    /* 다른 주제로 넘어가면 멈춘다 */
    var STOP = new RegExp('^\\s*' + num + '\\s*(?:투자\\s*목적|비교\\s*지수|수익\\s*구조|투자\\s*위험|위험\\s*관리|투자\\s*비용|분류|투자\\s*대상|매입|환매)');
    var best = null;
    for (var i = 0; i < lines.length; i++) {
      if (!HEAD.test(lines[i])) continue;
      /* 바로 다음의 뜻있는 줄이 「투자목적」 제목이면 이 자리는 상위 제목이다 */
      var nx = i + 1;
      while (nx < lines.length && !lines[nx].trim()) nx++;
      if (nx < lines.length && GOAL.test(lines[nx])) continue;
      var buf = [];
      for (var j = i + 1; j < lines.length && j < i + 14 && buf.join(' ').length < 280; j++) {
        var raw = lines[j];
        if (HEAD.test(raw)) continue;                 /* ■ 기본 운용전략 같은 소제목 */
        if (STOP.test(raw)) break;
        var s = raw.replace(/\t/g, ' ').replace(/^[\s\-•∙·※☞◇▶–]+/, '').replace(/\s+/g, ' ').trim();
        if (!s || /^\d+$/.test(s) || /^-\s*\d+\s*-$/.test(s)) continue;   /* 쪽 번호 */
        /* 어디에나 붙는 유의문구는 전략이 아니다 */
        if (/보장은?\s*없|보장이\s*없|참고하시기|변경될\s*수\s*있|공시될\s*예정|소규모펀드|판매회사는\s*투자실적/.test(s)) continue;
        if (/보수를?\s*부과|기준가격에\s*차이/.test(s)) continue;
        if (s.length < 12) continue;
        if (!/투자|편입|운용|추구|배분|수익/.test(s)) continue;
        buf.push(s);
      }
      var v = buf.join(' ').replace(/\s+/g, ' ').trim();
      /**
       * 다음 절이 같은 줄에 이어 붙는 경우가 있다 —
       *   「…목표 환헤지 비율은 최고 100 % 수준 3. 주요투자위험 – 이 투자신탁 및…」
       * 번호가 붙은 제목에서만 끊는다. 「금리변동에 따른 투자위험을 최소화하면서」 처럼
       * 전략 문장 안에 투자위험이라는 말이 그냥 나오기도 해서, 번호 없이 끊으면
       * 제대로 읽은 문장을 잘라 버린다.
       */
      v = v.split(/\s\d+\s*[.)]\s*(?:주요\s*)?(?:투자\s*위험|수익\s*구조|위험\s*관리)/)[0].trim();
      if (v.length >= 20 && (!best || v.length > best.length)) best = v;
    }
    return best ? { value: best.slice(0, 300), index: 0, length: 0 } : null;
  }

  /**
   * 「주요 투자위험」 표 — 구분(위험 이름)과 내용을 짝지어 돌려준다.
   * 이름만 말하면 평가에서 미인정이라 내용까지 붙여야 한다.
   * 이름 칸이 "투자원금손실 / 위험" 처럼 줄로 쪼개져 있어 짧은 줄을 이어 만든다.
   */
  function riskItems(text) {
    var lines = String(text).split('\n');
    var out = [], at = 0, start = -1, startAt = 0;
    for (var i = 0; i < lines.length; i++) {
      if (start < 0 && /구\s*분\s*\t\s*투자위험의?\s*주요내용/.test(lines[i])) { start = i; startAt = at; }
      at += lines[i].length + 1;
    }
    if (start < 0) return out;
    var name = '';
    for (var j = start + 1; j < lines.length && j < start + 90; j++) {
      var t = lines[j].replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
      if (!t || /^[-.\s]+$/.test(t)) continue;
      if (t.length <= 22 && !/[.。]$/.test(t) && !/니다$/.test(t)) {
        name = (name ? name + ' ' : '') + t;
        if (/위험$/.test(name)) {
          /* 이름 다음 줄부터가 내용이다 */
          var body = [];
          for (var k = j + 1; k < lines.length && body.join('').length < 260; k++) {
            var b = lines[k].replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
            if (!b) continue;
            if (b.length <= 22 && !/니다|습니다|합니다/.test(b)) break;
            body.push(b);
          }
          if (body.length) {
            out.push({ name: name.replace(/\s+/g, ' ').trim(), body: body.join(' ').replace(/\s+/g, ' ') });
          }
          name = '';
        }
      } else {
        name = '';
      }
      if (out.length >= 6) break;
    }
    return out;
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

  /**
   * 원금지급형 여부는 종목명으로만 판단한다.
   * 본문에는 위험등급 분류표("원금의 80% 이상지급형")와 유의사항이 있어,
   * 문서 어디서나 「원금지급」 을 찾으면 원금비보장 ELS 를 원금지급형으로 읽는다.
   * 그러면 최대손실 0%, 고난도 해당없음 으로 나가 상담에서 그대로 틀린 설명이 된다.
   */
  function elsProtected(t) {
    var r = rowValue(t, /^종목명$/);
    var v = r ? r.value
      : ((String(t).match(/((?:[가-힣A-Za-z]{2,12}증권)\s*제?\s*\d{3,6}\s*회[^\n]{0,60})/) || [])[1] || '');
    return { on: /파생결합사채|원금지급|원금보장/.test(v), at: r ? r.index : 0, len: r ? r.length : 0 };
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
    /**
     * 펀드.
     * 간이투자설명서는 「라벨 <탭> 값」 표, 정식 투자설명서는 표 한 칸이 여러 줄로 쪼개진
     * 요약정보 양식이다. 둘 다 읽어야 하므로 순서는 표 판독(fn) -> 구간 고정 정규식이다.
     * 본문 아무 데나 걸리는 넓은 정규식은 쓰지 않는다 — 개정 이력의 옛 값이나 옆 칸을
     * 집어 오기 때문이다(환매대금 지급일이 제8영업일로 읽히던 원인).
     */
    fund: COMMON_RULES.concat([
      {
        id: 'name', label: '펀드 명칭',
        fn: function (t) { return rowValue(t, /^(?:집합투자기구의?\s*명칭|펀드\s*명칭|상품\s*명|펀드명)$/); },
        re: [/(?:집합투자기구의?\s*명칭|펀드\s*명칭|상품명)\s*[:：]\s*([^\n]{6,90})/,
        /([가-힣A-Za-z0-9()\[\]·\-\s]{6,70}(?:증권\s*)?자?투자신탁\s*\d*호?\s*\([^)]{1,20}\))/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim(); }
      },
      {
        id: 'mgr', label: '자산운용사',
        fn: function (t) { return rowValue(t, /^(?:집합투자업자|자산운용회사|자산운용사|운용회사|운용사)$/); },
        /* 콜론을 반드시 요구한다 — 없으면 본문의 "…또는 집합투자업자가 운용하는 다른…" 을 집어 온다 */
        re: [/집합투자업자\s*명칭\s*[:：]\s*([^\n]{2,40}?(?:자산운용|투자신탁운용|운용)(?:주식회사|㈜)?)/,
        /(?:집합투자업자|자산운용회사|운용회사)\s*[:：]\s*([^\n]{2,30}?(?:자산운용|투자신탁운용|운용)(?:주식회사|㈜)?)/,
        /([가-힣A-Za-z]{2,20}자산운용(?:주식회사|㈜)?)/],
        map: function (m) { return m[1].replace(/\s+/g, '').trim(); }
      },
      {
        /* 계열 여부는 판매회사(미래에셋증권) 기준이다 — 운용사명으로 판정한다 */
        id: 'affiliate', label: '계열운용사 여부',
        fn: function (t) {
          var m = /집합투자업자\s*명칭\s*[:：]\s*([^\n]{2,40}?(?:자산운용|투자신탁운용|운용)(?:주식회사|㈜)?)/.exec(t)
            || /([가-힣A-Za-z]{2,20}자산운용(?:주식회사|㈜)?)/.exec(t);
          if (!m) return null;
          var mg = m[1].replace(/\s+/g, '');
          return {
            value: /미래에셋/.test(mg)
              ? '계열 운용사 (' + mg + ') — 계열사 상품이므로 고지 및 유사 비계열 펀드 1개 동반 추천 필요'
              : '비계열 운용사 (' + mg + ')',
            index: m.index, length: m[0].length
          };
        }
      },
      {
        id: 'fundType', label: '펀드 유형',
        fn: function (t) { return rowValue(t, /^(?:집합투자기구의?\s*종류|펀드\s*유형|펀드의?\s*종류|상품\s*유형|분류)$/); },
        re: [/((?:투자신탁|투자회사)\s*,[^\n]*?(?:종류형|모자형|추가형|개방형)[^\n]*?)(?=고난도|투자비용|$)/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').replace(/[,\s]+$/, '').trim(); }
      },
      {
        id: 'targets', label: '투자대상 자산',
        fn: function (t) { return rowValue(t, /^(?:투자\s*대상|주된?\s*투자\s*대상|투자대상\s*자산)$/); },
        re: [/(이\s*(?:투자신탁|집합투자기구)은[^\n]*?%\s*까지[^\n]*?투자합니다\.)/,
        /(이\s*(?:투자신탁|집합투자기구)은[^\n]{20,300}?투자합니다\.)/,
        /투자\s*대상\s*(?:및\s*투자\s*전략)?\s*[:：]\s*([^\n]{10,180})/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim(); }
      },
      {
        id: 'strategy', label: '투자전략',
        fn: function (t) {
          return rowValue(t, /^(?:투자\s*전략|주된?\s*투자\s*전략|운용\s*전략)$/) || fundStrategy(t);
        },
        /* 모자형·재간접은 모(피투자)펀드 전략까지 설명해야 인정된다 */
        re: [/투자합니다\.\s*((?:모투자신탁|피투자)[^\n]{30,600})/,
        /((?:모투자신탁|피투자집합투자기구)은[^\n]{30,600})/,
        /투자\s*전략\s*[:：]\s*([^\n]{10,300})/],
        map: function (m) {
          var v = m[1].replace(/\s+/g, ' ').trim();
          /**
           * 「모투자신탁은…」 으로 시작하는 문장이 여러 개 있다. 그중에는
           * "모투자신탁은 자투자신탁과 달리 투자신탁보수를 부과하지 않으므로 기준가격에
           * 차이가 발생될 수 있습니다" 처럼 전략과 무관한 것도 있어, 그것이 전략으로
           * 들어갔다. 투자 이야기가 아닌 문장은 버린다.
           */
          if (!/투자|편입|운용|추구|배분/.test(v)) return null;
          if (/보수를?\s*부과|기준가격에\s*차이|보수·비용|수수료를?\s*부과/.test(v)) return null;
          return v;
        }
      },
      {
        id: 'risk1', label: '투자위험 핵심사항 ①',
        fn: function (t) {
          var r = riskItems(t);
          return r[0] ? { value: r[0].name + ' — ' + r[0].body.slice(0, 240), index: 0, length: 0 } : null;
        }
      },
      {
        id: 'risk2', label: '투자위험 핵심사항 ②',
        fn: function (t) {
          var r = riskItems(t);
          return r[1] ? { value: r[1].name + ' — ' + r[1].body.slice(0, 240), index: 0, length: 0 } : null;
        }
      },
      {
        id: 'clsA', label: 'A클래스 선취판매수수료',
        fn: function (t) {
          var r = feeRow(t, /^A$/i) || feeRow(t, /^A/i);
          var v = r && r.salesFee;
          /* 요약정보 표가 없으면 「클래스 | 선취판매수수료 | … 」 단순 표를 읽는다 */
          if (!v) {
            var c = feeCell(t, [/선취\s*판매\s*수수료/, /선취\s*수수료/, /판매\s*수수료/], /^A(?:[\s\-]|클래스|$)/i);
            if (!c) return null;
            r = c; v = c.value;
          }
          v = /^\d/.test(v) ? '납입금액의 ' + v : v;
          return { value: v.replace(/%\s*이내/, '% 이내'), index: r.index, length: r.length };
        },
        re: [/선취\s*판매\s*수수료[^\d%]{0,40}?(\d+(?:\.\d+)?)\s*%\s*(이내)?/],
        map: function (m) { return '납입금액의 ' + num(m) + '%' + (m[2] ? ' 이내' : ''); }
      },
      {
        /**
         * A클래스 총보수(연). 스크립트가 "연 {{clsAExp}}%" 로 읽으므로 숫자만 담는다.
         * 모자형·재간접형은 합성 총보수·비용이 인정 기준이라 그 칸을 먼저 쓴다.
         */
        id: 'clsAExp', label: 'A클래스 총보수(연)',
        fn: function (t) {
          var r = feeRow(t, /^A$/i) || feeRow(t, /^A/i);
          if (r) {
            var v = /^\d/.test(r.synthetic || '') ? r.synthetic : r.total;
            if (/^\d/.test(v || '')) return { value: v, index: r.index, length: r.length };
          }
          var c = feeCell(t, [/합성\s*총\s*보수/, /총\s*보수[·•\s]*비용/, /^총\s*보수/], /^A(?:[\s\-]|클래스|$)/i);
          return c ? { value: String(c.value).replace(/%$/, ''), index: c.index, length: c.length } : null;
        },
        re: [/합성\s*총\s*보수[·•\s]*비용[^가-힣\d%]{0,20}?연?\s*(\d+\.\d+)\s*%/,
        /총\s*보수[·•\s]*비용[^가-힣\d%]{0,20}?연?\s*(\d+\.\d+)\s*%/],
        map: function (m) { return num(m); }
      },
      {
        id: 'clsCExp', label: 'C클래스 총보수(연)',
        fn: function (t) {
          var r = feeRow(t, /^C\d?$/i) || feeRow(t, /^C/i);
          if (r) {
            var v = /^\d/.test(r.synthetic || '') ? r.synthetic : r.total;
            if (/^\d/.test(v || '')) return { value: v, index: r.index, length: r.length };
          }
          var c = feeCell(t, [/합성\s*총\s*보수/, /총\s*보수[·•\s]*비용/, /^총\s*보수/], /^C(?:[\s\-]|클래스|$)/i);
          return c ? { value: String(c.value).replace(/%$/, ''), index: c.index, length: c.length } : null;
        }
      },
      {
        id: 'redeemFee', label: '환매수수료',
        /* 표 라벨 읽기는 쓰지 않는다 — 옆 칸의 「전환수수료」 를 값으로 집어 온다 */
        re: [/환매\s*수수료\s*[:：]?\s*(해당사항\s*없음|없음|면제)/,
        /환매수수료를?\s*(부과하지\s*않|징구하지\s*않|면제)/,
        /환매\s*수수료[^\n]{0,30}?(\d+(?:\.\d+)?\s*%[^\n]{0,40})/],
        map: function (m) { return /없|않|면제/.test(m[1]) ? '없음' : m[1].trim(); }
      },
      {
        id: 'buyCut', label: '매입 기준시각',
        re: [/오후\s*(\d{1,2})\s*시\s*(\d{1,2})?\s*분?\s*(?:이전|경과|까지)/,
        /(\d{1,2})\s*시\s*(\d{1,2})?\s*분?\s*(?:이전|까지|경과)/],
        map: function (m) {
          var pm = /오후/.test(m[0]);
          return (pm ? '오후 ' : '') + (+m[1]) + '시' + (m[2] ? ' ' + (+m[2]) + '분' : '');
        }
      },
      {
        id: 'buyBefore', label: '기준시각 前 매입 기준가 적용일',
        re: [/\d{1,2}\s*시[^\n]{0,24}?이전에?[^\n]{0,40}?(?:납입|매입|취득)[^\n]{0,14}?경우[\s\S]{0,140}?제\s*(\d{1,2})\s*영업일/,
        /\d{1,2}\s*시[^\n]{0,24}?이전에?[^\n]{0,40}?(?:납입|매입|취득)[^\n]{0,30}?제\s*(\d{1,2})\s*영업일/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        id: 'buyAfter', label: '기준시각 後 매입 기준가 적용일',
        re: [/\d{1,2}\s*시\s*경과\s*(?:후|이후)[^\n]{0,40}?(?:납입|매입|취득)[^\n]{0,14}?경우[\s\S]{0,140}?제\s*(\d{1,2})\s*영업일/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        id: 'redBefore', label: '기준시각 前 환매 기준가 적용일',
        re: [/\d{1,2}\s*시[^\n]{0,24}?이전에?[^\n]{0,40}?환매[^\n]{0,14}?경우[\s\S]{0,160}?제\s*(\d{1,2})\s*영업일/,
        /\d{1,2}\s*시[^\n]{0,24}?이전에?[^\n]{0,40}?환매[^\n]{0,30}?제\s*(\d{1,2})\s*영업일/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        id: 'redAfter', label: '기준시각 後 환매 기준가 적용일',
        re: [/\d{1,2}\s*시\s*경과\s*(?:후|이후)[^\n]{0,40}?환매[^\n]{0,14}?경우[\s\S]{0,160}?제\s*(\d{1,2})\s*영업일/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        /**
         * 환매대금 지급일.
         * 「제N영업일」 만 찾으면 개정 이력의 옛 값을 읽는다
         * (실제로 "환매대금 지급일 변경: 제8영업일 -> 제6영업일" 에서 제8영업일을 읽었다).
         * 반드시 환매 방법 문장 안에서 읽는다.
         */
        id: 'redPay', label: '환매대금 지급일',
        re: [/기준가격을?\s*적용[.\s]*제\s*(\d{1,2})\s*영업일[\s\S]{0,90}?환매대금을?\s*지급/,
        /환매청구일[\s\S]{0,220}?제\s*(\d{1,2})\s*영업일[\s\S]{0,90}?환매대금을?\s*지급/,
        /제\s*(\d{1,2})\s*영업일\s*에?\s*환매\s*대금/],
        map: function (m) { return '제' + num(m) + '영업일'; }
      },
      {
        id: 'term', label: '계약기간',
        fn: function (t) { return rowValue(t, /^(?:존속기간|계약기간|신탁계약기간)$/); },
        re: [/(추가|개방)형/, /(단위|폐쇄)형/],
        map: function (m) { return /추가|개방/.test(m[1]) ? '환매가 가능한 개방형' : '폐쇄형'; }
      },
      {
        id: 'redeemable', label: '환매·중도해지 가능 여부',
        re: [/(중도환매가능)/, /(추가|개방)형/, /(폐쇄형|중도환매\s*불가)/],
        map: function (m) { return /폐쇄|불가/.test(m[1]) ? '불가 (폐쇄형)' : '가능 (개방형·중도환매 가능)'; }
      },
      {
        /* 유동성위험 단계 = 중도환매불가 / 중도환매시 비용발생 / 중도환매 허용 */
        id: 'liqRisk', label: '유동성위험 단계',
        fn: function (t) {
          /**
           * 「폐쇄형」 이라는 낱말만 찾으면 용어 설명표와 범례("중도환매 불가 | 중도환매 허용")에
           * 걸린다. 이 펀드의 구분을 밝히는 문장에서만 읽는다.
           */
          var m = /개방형\s*[∙·・.]?\s*폐쇄형\s*구분\s*[:：]\s*(개방형|폐쇄형)/.exec(t);
          var open = m ? m[1] === '개방형'
            : (/개방형\s*\(\s*중도환매가능/.test(t) ? true
              : (/(?:^|[\s,(])폐쇄형\s*\(/.test(t) ? false
                : (/개방형/.test(t) ? true : null)));
          if (open === null) return null;
          if (!open) return { value: '중도환매 불가 (폐쇄형)', index: m ? m.index : 0, length: m ? m[0].length : 0 };
          var free = /환매\s*수수료\s*[:：]?\s*(?:해당사항\s*없음|없음|면제)/.test(t) || /환매수수료를?\s*(?:부과하지|징구하지)\s*않/.test(t);
          return {
            value: free ? '중도환매 허용 (환매수수료 없음)' : '중도환매 시 비용발생 (환매수수료 부과)',
            index: m ? m.index : 0, length: m ? m[0].length : 0
          };
        }
      },
      {
        id: 'ret1y', label: '최근 1년 수익률',
        fn: function (t) {
          var r = fundReturn1y(t);
          return r ? { value: r.value + '%', index: r.index, length: r.length } : null;
        }
      },
      {
        /**
         * VaR 값 — 위험등급 산정 근거.
         * "VaR" 근처의 아무 숫자나 잡으면 등급 기준표의 「50% 초과」 를 읽는다.
         * 이 펀드의 실측치는 「최대손실예상액은 34.81%」 문장에 있다.
         */
        /**
         * 실측 VaR 값. 운용사마다 문장이 다르다 — 표본에서 확인한 세 가지 서식:
         *   ㆍ피델리티 「…일간 수익률의 최대손실예상액은 34.81%」
         *   ㆍBNK 「…최대손실예상액)은 0.0000%이며」 (닫는 괄호가 끼어든다)
         *   ㆍ에셋플러스 「…97.5% VaR 모형]은 33.64%였으며」
         *   ㆍ흥국 「최근 3년 실제 수익률 변동성(…(97.5% VaR 모형 사용))이 0.00%이므로」
         *   ㆍKB 「…산출한 값(97.5% VaR*)이」 (줄바꿈·쪽번호) 「29.06%로 3등급에 해당」
         * 마지막 것은 값이 다음 줄에 있어 앞말로는 못 잡는다. 대신 「○○%로 N등급」 이
         * 이 문서에서 실측치에만 쓰이는 꼴이라 그것으로 잡는다.
         * 등급 기준표의 「50% 초과 / 50% 이하」 를 읽지 않도록 뒤말을 막아 둔다.
         */
        id: 'varPct', label: 'VaR 값',
        re: [/최대\s*손실\s*예상액\s*(?:\(\s*VaR\s*\))?\s*[)\]）]*\s*(?:은|이|는)?\s*[:：]?\s*([\d.]+)\s*%/i,
        /실제\s*수익률\s*변동성[^\n]{0,70}?(?:은|이)\s*([\d.]+)\s*%/,
        /VaR\s*모형[^\n]{0,12}?[\]）)]*\s*(?:은|이|는)\s*(?:약\s*)?([\d.]+)\s*%/i,
        /([\d.]+)\s*%\s*(?:로|이며|이므로|이고|였으며|입니다)[^\n]{0,14}?\d\s*등급/,
        /VaR\s*(?:값|는|은)?\s*[:：]?\s*([\d.]+)\s*%(?!\s*(?:초과|이하|미만|이상))/i],
        map: function (m) { return num(m); }
      },
      {
        /**
         * 위험등급 산정 근거 문장. 설정 후 3년이 지난 펀드는 실측 최대손실예상액으로,
         * 3년이 안 된 펀드는 투자대상 자산의 위험수준으로 등급을 매긴다.
         * 3년 미만이면 VaR 수치가 아예 없으므로, 그 사실을 읽어 두어야 스크립트가
         * 없는 수치를 말하지 않고 "실측 값이 없어 자산 위험수준으로 매겼다" 고 말한다.
         */
        id: 'varBasis', label: '위험등급 산정 근거 (설정 3년 경과 여부)',
        /* 표본에서 3년 미만을 알리는 꼴: 「추후 설정기간 3년이 경과하는 경우 …
           등급분류기준이 변경되면서」 · 「설정된 후 3년이 경과하지 않은 집합투자기구는」 */
        re: [/(이\s*(?:투자신탁|집합투자기구|펀드)은\s*설정\s*(?:후|된\s*후)\s*3\s*년이[^\n]{0,120})/,
        /(설정\s*(?:기간\s*)?3\s*년이\s*(?:경과하지\s*아니하|경과하지\s*않|지나지\s*않|경과하는\s*경우)[^\n]{0,120})/,
        /(설정된?\s*후\s*3\s*년이\s*경과하지\s*않은[^\n]{0,120})/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim().slice(0, 160); }
      },
      {
        id: 'fxHedge', label: '환헤지 여부·대상통화',
        re: [/환(?:율)?위험을?\s*헤지/, /환헤지\s*(?:전략을?)?\s*(?:수행|실시)/,
        /환(?:율)?\s*헤지[^\n]{0,20}?(?:하지\s*않|미실시)/],
        map: function (m) { return /않|미실시/.test(m[0]) ? '환헤지 미실시' : '환헤지 실시 (외화표시 투자자산의 환위험 헤지)'; }
      },
      {
        id: 'fxHedgeSize', label: '목표 환헤지 비율',
        re: [/목표\s*환헤지\s*비율은?[\s\S]{0,80}?약?\s*([\d.]+)\s*%/],
        map: function (m) { return '약 ' + num(m) + '% (해외투자분 순자산 대비)'; }
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
      }
    ]),

    /**
     * ELS·DLS.
     * 간이투자설명서의 「1. 상품개요」 는 종목명·기초자산·발행일·만기일이 모두
     * 「라벨 <탭> 값」 표다. 본문 정규식으로 훑으면 유의사항 문단을 값으로 집어 온다
     * (기초자산 자리에 "…의 가격에 연계하여 증권의 수익률이 결정되므로…" 가 들어갔다).
     * 표를 먼저 읽고, 표에 없는 것만 정규식으로 넘긴다.
     */
    els: COMMON_RULES.concat([
      {
        id: 'name', label: '상품 명칭',
        fn: function (t) { return rowValue(t, /^종목명$/); },
        re: [/((?:미래에셋증권|[가-힣A-Za-z]{2,12}증권)\s*제?\s*\d{3,6}\s*회[^\n]{0,40}?(?:파생결합증권|파생결합사채|ELS|DLS|ELB|DLB)[^\n]{0,20})/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim(); }
      },
      {
        id: 'round', label: '발행회차',
        re: [/제\s*(\d{3,6})\s*회/],
        map: function (m) { return '제' + num(m) + '회'; }
      },
      {
        id: 'issuer', label: '발행사',
        /* 발행사는 종목명 앞머리에 있다 — 본문에서 찾으면 유의사항 문장을 집어 온다 */
        fn: function (t) {
          var r = rowValue(t, /^종목명$/);
          var m = r && /^([가-힣A-Za-z]{2,12}증권)/.exec(r.value);
          return m ? { value: m[1], index: r.index, length: r.length } : null;
        },
        re: [/(?:발행\s*회사|발행인|발행사)\s*[:：]\s*([가-힣A-Za-z]{2,20}증권(?:주식회사|㈜)?)/,
        /([가-힣A-Za-z]{2,12}증권)\s*제\s*\d{3,6}\s*회/],
        map: function (m) { return m[1].trim(); }
      },
      {
        id: 'kind', label: '상품 종류',
        fn: function (t) {
          var r = rowValue(t, /^종목명$/);
          var v = r ? r.value : '';
          if (!v) return null;
          var k = /파생결합사채/.test(v) ? (/주가연계/.test(v) ? 'ELB' : 'DLB')
            : (/주가연계증권/.test(v) ? 'ELS' : (/파생결합증권/.test(v) ? 'DLS' : null));
          return k ? { value: k, index: r.index, length: r.length } : null;
        }
      },
      {
        id: 'under', label: '기초자산',
        fn: function (t) { return rowValue(t, /^기초자산$/); },
        re: [/기초\s*자산\s*[:：]\s*([^\n]{4,120})/],
        map: function (m) { return m[1].replace(/\s{2,}/g, ' ').trim(); }
      },
      {
        id: 'fixDate', label: '최초기준가격평가일',
        re: [new RegExp('최초기준가격\\s*평가일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'issueDate', label: '발행일',
        fn: function (t) { return rowValue(t, /^발\s*행\s*일$/); },
        re: [new RegExp('발\\s*행\\s*일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'matDate', label: '만기일',
        fn: function (t) { return rowValue(t, /^만\s*기\s*일(?:\([^)]*\))?$/); },
        re: [new RegExp('만\\s*기\\s*일(?:\\([^)]*\\))?\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        /* 만기(기간) — 발행일과 만기일이 있으면 계산으로 확정된다 */
        id: 'matTerm', label: '만기 (기간)',
        fn: function (t) {
          var a = rowValue(t, /^발\s*행\s*일$/), b2 = rowValue(t, /^만\s*기\s*일(?:\([^)]*\))?$/);
          if (!a || !b2) return null;
          var pa = /(\d{4})\D+(\d{1,2})\D+(\d{1,2})/.exec(a.value), pb = /(\d{4})\D+(\d{1,2})\D+(\d{1,2})/.exec(b2.value);
          if (!pa || !pb) return null;
          var d1 = Date.UTC(+pa[1], +pa[2] - 1, +pa[3]), d2 = Date.UTC(+pb[1], +pb[2] - 1, +pb[3]);
          var mo = Math.round((d2 - d1) / 86400000 / 30.4375);
          if (!(mo > 0)) return null;
          return { value: mo % 12 === 0 ? (mo / 12) + '년' : mo + '개월', index: b2.index, length: b2.length };
        }
      },
      {
        id: 'earlyCycle', label: '조기상환 주기',
        re: [/(\d{1,2})\s*개월\s*(?:마다|단위)/, /매\s*(\d{1,2})\s*개월/],
        map: function (m) { return num(m) + '개월'; }
      },
      {
        /**
         * 낙인 배리어.
         * 반드시 「최초기준가격의 …% 미만으로 하락한 적이」 조항에서만 읽는다.
         * 위험등급 분류 기준 보일러플레이트에도 "낙인 배리어가 60% 이상인 경우" 가 있어
         * 「낙인」 이라는 낱말만 찾으면 그 60% 를 읽는다.
         */
        id: 'knockIn', label: '낙인 배리어',
        re: [/최초\s*기준가격의?\s*\[?\s*(\d{2,3}(?:\.\d+)?)\s*%?\s*\]?\s*%?\s*미만으로\s*하락한\s*적이/,
        /(?:노\s*낙인|NO\s*KI|낙인\s*없음)/i],
        map: function (m) { return m[1] ? m[1] + '%' : '없음 (노낙인)'; }
      },
      {
        /* 이론가 산출에 쓴 기초자산별 변동성 — "- EUROSTOXX50 지수 : 22.63%" 가 줄마다 이어진다 */
        id: 'underVol', label: '기초자산별 변동성',
        fn: function (t) {
          var at = String(t).search(/기초자산\s*가격\s*변동성/);
          if (at < 0) return null;
          var seg = String(t).slice(at, at + 600);
          /* 뒤이어 나오는 상관계수 줄(% 없음)은 걸러진다 */
          var v = [], re = /-\s*([^\n:]{2,40}?)\s*:\s*([\d.]+)\s*%/g, m;
          while ((m = re.exec(seg))) v.push(m[1].trim() + ' ' + m[2] + '%');
          return v.length ? { value: v.join(', '), index: at, length: 40 } : null;
        }
      },
      {
        id: 'fixMethod', label: '최초기준가격 평가방법',
        re: [/최초기준가격\s*[:：]\s*([^\n]{6,80})/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim(); }
      },
      {
        /**
         * 중도상환 가격평가일 — 기초자산 소재지로 갈린다.
         * 모두 아시아면 신청일 당일 종가, 비아시아가 섞이면 익거래소영업일 종가가 반영된다.
         */
        id: 'midPriceDate', label: '중도상환 가격평가일',
        fn: function (t) {
          var r = rowValue(t, /^기초자산$/);
          if (!r) return null;
          var nonAsia = /S&P|EURO|STOXX|NASDAQ|DOW|NIKKEI|Micron|Applied|Broadcom|Tesla|Palantir|마이크론|어플라이드|브로드컴|테슬라|팔란티어|NVIDIA|엔비디아/i.test(r.value);
          return {
            value: nonAsia
              ? '중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)'
              : '중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)',
            index: r.index, length: r.length
          };
        }
      },
      {
        /* 손실 발생 상황 — 문서에 있는 낙인·만기 배리어 조항만으로 만든다 */
        id: 'lossExample', label: '손실 발생 상황 및 손실 추정액',
        fn: function (t) {
          var pp = elsProtected(t);
          var u = rowValue(t, /^기초자산$/);
          if (pp.on) {
            return {
              value: '이 상품은 원금지급형(파생결합사채)으로 만기까지 보유하시면 투자원금은 지급됩니다. '
                + '다만 만기 전 중도상환 시에는 공정가액을 기준으로 상환금액이 산정되어 투자원금에 미달할 수 있으며, '
                + '발행사인 미래에셋증권의 신용위험이 발생하면 원금을 돌려받지 못할 수 있습니다.',
              index: pp.at, length: pp.len
            };
          }
          var mb = t.match(/만기평가가격이\s*각\s*최초\s*기?\s*준?\s*가격의\s*\[?\s*(\d{2,3}(?:\.\d+)?)\s*%?\s*\]?\s*이상/);
          if (!mb) return null;
          var ki = t.match(/최초\s*기준가격의?\s*\[?\s*(\d{2,3}(?:\.\d+)?)\s*%?\s*\]?\s*미만으로\s*하락한\s*적이/);
          var un = u ? '(' + u.value + ')' : '';
          var v = ki
            ? '만기평가일에 모든 기초자산' + un + ' 중 어느 하나라도 종가기준으로 각 최초기준가격의 ' + ki[1]
              + '% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 ' + mb[1] + '% 미만인 경우, '
            : '이 상품은 낙인(원금손실 발생) 조건이 없어 투자기간 중 하락 자체로는 손실이 확정되지 않습니다. '
              + '다만 만기평가일에 모든 기초자산' + un + ' 중 어느 하나라도 만기평가가격이 각 최초기준가격의 ' + mb[1] + '% 미만인 경우, ';
          return {
            value: v + '하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.',
            index: mb.index, length: mb[0].length
          };
        }
      },
      {
        id: 'coupon', label: '제시수익률',
        re: [/\(\s*연\s*([\d.]+)\s*%\s*\)/],
        map: function (m) { return '연 ' + num(m) + '%'; }
      },
      {
        id: 'highDiff', label: '고난도 금융투자상품 해당 여부',
        fn: function (t) {
          var p2 = elsProtected(t);
          if (p2.on) return { value: '해당 없음 (원금지급형)', index: p2.at, length: p2.len };
          var m = /고난도금융투자상품에?\s*해당/.exec(t);
          return m ? { value: '해당 (고난도 금융투자상품)', index: m.index, length: m[0].length } : null;
        }
      },
      {
        id: 'maxLoss', label: '최대 손실 가능성',
        fn: function (t) {
          var p2 = elsProtected(t);
          if (p2.on) return { value: '0% (원금지급형)', index: p2.at, length: p2.len };
          var m = /원금의?\s*20\s*%\s*를?\s*초과하는\s*손실/.exec(t);
          return m ? { value: '100%', index: m.index, length: m[0].length } : null;
        }
      },
      {
        id: 'riskReason', label: '해당 위험등급으로 정해진 이유',
        fn: function (t) {
          var p2 = elsProtected(t);
          if (p2.on) return { value: '원금지급형', index: p2.at, length: p2.len };
          var m = /최대\s*원금손실\s*가능금액이?\s*원금의\s*100\s*분의\s*20\s*을?\s*초과/.exec(t);
          return m ? { value: '최대 원금손실가능금액 20% 초과형', index: m.index, length: m[0].length } : null;
        }
      },
      {
        /* 라벨이 "중도상환 / 신청가능일" 로 줄이 갈려 있어 표 읽기로는 안 잡힌다 */
        id: 'midPeriod', label: '중도상환 신청가능기간',
        /* 값 안에도 "중도상환 신청 불가능일" 이 나오므로 다음 라벨로 끊으면 안 된다 —
           조항이 "…중도상환 신청 불가)" 로 닫히는 것을 끝으로 삼는다 */
        re: [/중도상환\s*신청\s*가능일\s*([\s\S]{10,240}?불가\))/,
        /중도상환\s*신청\s*가능일\s*([\s\S]{10,160}?)(?=\n\s*중도상환\s*\n\s*신청\s*불가능일)/],
        map: function (m) { return m[1].replace(/\s+/g, ' ').trim(); }
      },
      {
        id: 'midAmt6', label: '중도상환금액 (6개월 이내)',
        re: [/발행\s*후\s*6\s*개월\s*까?지?는?\s*(\d{2,3})\s*%\s*이상/],
        map: function (m) { return '공정가액(기준가)의 ' + num(m) + '% 이상'; }
      },
      {
        id: 'midAmtAfter', label: '중도상환금액 (6개월 경과)',
        re: [/공정가액\s*\(기준가\)의?\s*(\d{2,3})\s*%\s*이상/],
        map: function (m) { return '공정가액(기준가)의 ' + num(m) + '% 이상'; }
      },
      {
        id: 'subUnit', label: '청약단위',
        fn: function (t) {
          var r = rowValue(t, /^최소\s*청약금액$/);
          return r ? { value: '최소 ' + r.value, index: r.index, length: r.length } : null;
        },
        re: [/최소\s*청약금액[^\n]{0,10}?([\d,]+\s*원)/,
        /청약\s*단위\s*[:：]?\s*([^\n]{2,40})/],
        map: function (m) { return '최소 ' + m[1].trim(); }
      },
      {
        id: 'offerEnd', label: '청약종료일',
        fn: function (t) {
          var r = rowValue(t, /^청약종료일$/);
          if (!r) return null;
          var m = new RegExp(DATE).exec(r.value);
          return m ? { value: kdateYMD(m[1], m[2], m[3]), index: r.index, length: r.length } : null;
        },
        re: [new RegExp('청약\\s*종료일\\s*[:：]?\\s*' + DATE)],
        map: function (m) { return kdateYMD(m[1], m[2], m[3]); }
      },
      {
        id: 'fairValueNote', label: '공정가액 (액면 대비)',
        re: [new RegExp('본\\s*증권의\\s*공정가격은\\s*' + DATE + '\\s*기준\\s*\\[?\\s*([\\d,.]+)\\s*원')],
        map: function (m) {
          var fv = Number(m[4].replace(/,/g, ''));
          var gap = isFinite(fv) ? ' (액면 10,000원 대비 ' + (Math.round((fv / 10000 - 1) * 10000) / 100) + '%)' : '';
          return kdateYMD(m[1], m[2], m[3]) + ' 기준 액면 10,000원 당 ' + m[4] + '원' + gap
            + '. 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다.';
        }
      },
      {
        id: 'coolNote', label: '숙려기간 · 가입의사확인 실제 일정',
        fn: function (t) {
          var c = rowValue(t, /^숙\s*려\s*기\s*간$/), k = rowValue(t, /^가입의사확인기간$/);
          if (!c) return null;
          var v = '이 회차의 숙려기간은 ' + c.value + ' 이며';
          v += k ? ', 가입의사 확인은 ' + k.value + ' 입니다.' : ' 입니다.';
          return { value: v, index: c.index, length: c.length };
        }
      },
      {
        id: 'docDate', label: '투자설명서 기준일',
        re: [new RegExp('(?:작성기준일|기준일|효력\\s*발생일?)\\s*[:：]?\\s*' + DATE)],
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
    ]),

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
  /**
   * ELS·DLS 투자설명서의 차수별 상환조건 표.
   *
   * 문서는 조건과 금액을 두 개의 표로 나눠 싣는다.
   *   ○ 자동조기상환 발생조건        1차 | …각 최초기준가격의 [80%] 이상인 경우
   *   ○ 자동조기상환평가일 및 상환금액  1차 | 2027년 02월 10일 | 액면금액 × 111.00%
   * 한 줄에 배리어와 지급률이 같이 있는 형태가 아니라서, 줄 단위 어림짐작으로는
   * 한 행도 못 읽는다(실제로 0행이었다). 두 표를 차수로 맞춰 합친다.
   */
  function parseElsSchedule(text) {
    var lines = String(text || '').split('\n');
    var bar = {}, pay = {}, when = {};
    lines.forEach(function (line) {
      var t = line.replace(/\t/g, ' ');
      /* 발생조건 행 — 차수로 시작하고 「최초기준가격의 [N%] 이상」 이 있다 */
      /* '차' 뒤에 \b 를 쓰면 안 된다 — 한글은 \w 가 아니라 경계가 성립하지 않는다 */
      var b = t.match(/^\s*(\d{1,2})\s*차[\s:：][^\n]*?최초기준가격의?\s*\[?\s*(\d{2,3}(?:\.\d+)?)\s*%?\s*\]?\s*이상/);
      if (b) bar[+b[1]] = Number(b[2]);
      /* 평가일·상환금액 행 */
      var d = t.match(/^\s*(\d{1,2})\s*차\s+(\d{4})\D{1,2}\s*(\d{1,2})\D{1,2}\s*(\d{1,2})\D?\s+액면금액\s*[×xX*]\s*([\d.]+)\s*%/);
      if (d) {
        when[+d[1]] = d[2] + '-' + ('0' + d[3]).slice(-2) + '-' + ('0' + d[4]).slice(-2);
        pay[+d[1]] = Number(d[5]);
      }
    });
    var seqs = Object.keys(bar).concat(Object.keys(pay))
      .map(Number).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b2) { return a - b2; });
    if (!seqs.length) return [];

    /* 경과개월은 발행일과의 일수로 센다 (영업일에 맞춰 며칠씩 당겨지므로 달 번호 차이로 세면 틀린다) */
    var iso = function (m) { return m ? m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2) : null; };
    var issue = iso(text.match(/발\s*행\s*일\s*[\t:：]?\s*(\d{4})\D{1,2}\s*(\d{1,2})\D{1,2}\s*(\d{1,2})/));
    var months = function (to) {
      if (!issue || !to) return null;
      var a = Date.parse(issue + 'T00:00:00Z'), b2 = Date.parse(to + 'T00:00:00Z');
      if (isNaN(a) || isNaN(b2) || b2 < a) return null;
      return Math.round((b2 - a) / 86400000 / 30.4375);
    };
    /* 연 수익률은 문서 전체에서 가장 큰 「(연 N%)」 를 쓴다 — 차수별로 따로 적히지 않는다 */
    var anns = [].concat.apply([], (text.match(/\(\s*연\s*[\d.]+\s*%\s*\)/g) || [])
      .map(function (x) { return [Number(x.replace(/[^\d.]/g, ''))]; }));
    var ann = anns.length ? Math.max.apply(null, anns) : null;

    var rows = seqs.map(function (n2) {
      return {
        seq: n2, months: months(when[n2]),
        barrier: bar[n2] != null ? bar[n2] : null,
        payRate: pay[n2] != null ? pay[n2] : null,
        annRate: ann, evalDate: when[n2] || null
      };
    });

    /**
     * 만기 행. 조건 문구가 "…각 최초기 / 준가격의 [70%] 이상…" 처럼 줄 중간에서 갈려 있어
     * 줄 단위로는 안 잡힌다. 본문 전체에서 공백을 건너뛰며 찾는다.
     */
    var mb = text.match(/만기평가가격이\s*각\s*최초\s*기?\s*준?\s*가격의\s*\[?\s*(\d{2,3}(?:\.\d+)?)\s*%?\s*\]?\s*이상/);
    var mp = null;
    if (mb) {
      var after = text.slice(mb.index, mb.index + 300).match(/액면금액\s*[×xX*]\s*([\d.]+)\s*%/);
      mp = after ? Number(after[1]) : null;
    }
    var md = iso(text.match(/만기평가일\s*[\t:：]\s*(\d{4})\D{1,2}\s*(\d{1,2})\D{1,2}\s*(\d{1,2})/))
      || iso(text.match(/만\s*기\s*일\s*[\t:：]?\s*(\d{4})\D{1,2}\s*(\d{1,2})\D{1,2}\s*(\d{1,2})/));
    if (mb && md) {
      var last = rows[rows.length - 1];
      var cyc = rows.length >= 2 && rows[1].months != null && rows[0].months != null
        ? rows[1].months - rows[0].months : null;
      var mo = months(md);
      var seq = cyc && mo ? Math.round(mo / cyc) : (last ? last.seq + 1 : 1);
      if (!last || seq > last.seq) {
        rows.push({
          seq: seq, months: mo, barrier: Number(mb[1]), payRate: mp,
          annRate: ann, evalDate: md, maturity: true
        });
      }
    }
    return rows;
  }

  function parseSchedule(text) {
    /* 투자설명서 서식이면 두 표를 맞춰 읽는다 — 줄 단위 어림짐작보다 정확하다 */
    var exact = parseElsSchedule(text);
    if (exact.length) return exact;
    var out = [];
    String(text || '').split('\n').forEach(function (line) {
      var seqM = line.match(/(\d{1,2})\s*차/);
      if (!seqM) return;
      /**
       * 「수익률 모의실험」 표도 "1차 조기상환 5.50% 3,220 69.20%" 처럼 차수와 %가 같이 있다.
       * 그 69.20% 는 발생빈도지 배리어가 아니다. 그대로 읽으면 손익구조 스크립트가
       * 통째로 틀린 숫자로 완성된다. 모의실험 행은 버린다.
       */
      if (/발생\s*빈도|발생\s*횟수|모의실험|Total/i.test(line)) return;
      /* 상환조건 행은 배리어를 「최초기준가격의 …%」 로 적는다 — 그 문구가 없으면 조건표가 아니다 */
      if (!/기준가격|배리어|이상인\s*경우|액면금액/.test(line)) return;
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

  /* ==========================================================
     표 파일 읽기 — 엑셀(.xlsx) · CSV · TSV
     ----------------------------------------------------------
     상품판매 안내장은 지점에 엑셀로 내려온다. 여러 종목이 한 장에 담겨
     있어 종목마다 손으로 넣던 값을 한 번에 받을 수 있다.

     외부 라이브러리를 쓸 수 없다 (단일 파일이 file:// 로 열리고 CDN 이
     막혀 있다). 그래서 xlsx 를 직접 읽는다 — xlsx 는 ZIP 이고, 압축은
     브라우저가 가진 DecompressionStream('deflate-raw') 으로 푼다.
     ========================================================== */

  /** ZIP 에서 파일들을 꺼낸다 (저장 0 · deflate 8 만 — xlsx 가 쓰는 방식) */
  function unzip(buf) {
    var u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    /* 끝에서 중앙 디렉터리를 찾는다 (주석이 붙어 있어도 버티도록 뒤에서 훑는다) */
    var eocd = -1;
    for (var i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) return Promise.reject(new Error('ZIP 형식이 아닙니다'));
    var count = dv.getUint16(eocd + 10, true);
    var cdOff = dv.getUint32(eocd + 16, true);
    var jobs = [], p = cdOff;
    for (var k = 0; k < count && p + 46 <= u8.length; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true);
      var csize = dv.getUint32(p + 20, true);
      var nlen = dv.getUint16(p + 28, true);
      var elen = dv.getUint16(p + 30, true);
      var clen = dv.getUint16(p + 32, true);
      var lho = dv.getUint32(p + 42, true);
      var name = new TextDecoder('utf-8').decode(u8.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + elen + clen;
      /* 로컬 헤더에서 실제 자료 시작 위치를 다시 읽는다 (이름·부가정보 길이가 다를 수 있다) */
      if (dv.getUint32(lho, true) !== 0x04034b50) continue;
      var lnl = dv.getUint16(lho + 26, true), lel = dv.getUint16(lho + 28, true);
      var start = lho + 30 + lnl + lel;
      jobs.push({ name: name, method: method, bytes: u8.subarray(start, start + csize) });
    }
    var out = {};
    return jobs.reduce(function (chain, j) {
      return chain.then(function () {
        if (j.method === 0) { out[j.name] = j.bytes; return null; }
        if (j.method !== 8 || typeof DecompressionStream !== 'function') return null;
        var ds = new DecompressionStream('deflate-raw');
        var w = ds.writable.getWriter();
        w.write(j.bytes); w.close();
        return new Response(ds.readable).arrayBuffer().then(function (ab) {
          out[j.name] = new Uint8Array(ab);
        }, function () { /* 못 푼 항목은 건너뛴다 */ });
      });
    }, Promise.resolve()).then(function () { return out; });
  }

  var dec = function (u8) { return u8 ? new TextDecoder('utf-8').decode(u8) : ''; };
  function unesc(s) {
    return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); })
      .replace(/&amp;/g, '&');
  }
  /** A1 → 0, B1 → 1, AA1 → 26 */
  function colOf(ref) {
    var m = /^([A-Z]+)/.exec(String(ref) || '');
    if (!m) return 0;
    var n = 0;
    for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64);
    return n - 1;
  }
  /** 엑셀 일자 일련번호 → YYYY-MM-DD (1900 윤년 버그 포함한 관행 그대로) */
  function serialDate(n) {
    if (!(n > 20000 && n < 80000)) return null;
    var ms = (n - 25569) * 86400000;
    var d = new Date(Math.round(ms));
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }

  /** xlsx 를 시트별 행 배열로 */
  function xlsxSheets(files) {
    /* 공유 문자열 — 셀이 t="s" 면 이 목록의 번호를 가리킨다 */
    var shared = [];
    var ss = dec(files['xl/sharedStrings.xml']);
    if (ss) {
      (ss.match(/<si\b[\s\S]*?<\/si>|<si\b[^>]*\/>/g) || []).forEach(function (si) {
        /* <si> 안에 <t> 가 여러 개면(서식이 섞인 글자) 이어 붙인다 */
        var t = (si.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [])
          .map(function (x) { return unesc(x.replace(/<[^>]+>/g, '')); }).join('');
        shared.push(t);
      });
    }
    /* 시트 이름·순서 — workbook.xml 이 알려 준다 */
    var names = [];
    var wb = dec(files['xl/workbook.xml']);
    (wb.match(/<sheet\b[^>]*>/g) || []).forEach(function (s) {
      var nm = /name="([^"]*)"/.exec(s);
      names.push(nm ? unesc(nm[1]) : '');
    });
    var paths = Object.keys(files)
      .filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); })
      .sort(function (a, b) {
        return (+(/(\d+)/.exec(a) || [])[1] || 0) - (+(/(\d+)/.exec(b) || [])[1] || 0);
      });
    return paths.map(function (path, idx) {
      var xml = dec(files[path]);
      var rows = [];
      (xml.match(/<row\b[\s\S]*?<\/row>|<row\b[^>]*\/>/g) || []).forEach(function (r) {
        var cells = [];
        (r.match(/<c\b[\s\S]*?<\/c>|<c\b[^>]*\/>/g) || []).forEach(function (c) {
          var at = /^<c\b([^>]*)/.exec(c)[1];
          var ref = (/r="([^"]*)"/.exec(at) || [])[1];
          var ty = (/t="([^"]*)"/.exec(at) || [])[1];
          var v;
          if (ty === 'inlineStr') {
            v = (c.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [])
              .map(function (x) { return unesc(x.replace(/<[^>]+>/g, '')); }).join('');
          } else {
            var vm = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(c);
            v = vm ? unesc(vm[1]) : '';
            if (ty === 's') v = shared[+v] != null ? shared[+v] : '';
          }
          cells[colOf(ref)] = String(v == null ? '' : v).trim();
        });
        for (var i = 0; i < cells.length; i++) if (cells[i] == null) cells[i] = '';
        rows.push(cells);
      });
      return { name: names[idx] || path.replace(/^.*\//, ''), rows: rows };
    });
  }

  /** CSV·TSV — 따옴표 안의 구분자와 줄바꿈을 지킨다 */
  function delimRows(text) {
    var head = text.split(/\r?\n/)[0] || '';
    var d = (head.split('\t').length > head.split(',').length) ? '\t' : ',';
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
        continue;
      }
      if (ch === '"') { q = true; continue; }
      if (ch === d) { row.push(cell.trim()); cell = ''; continue; }
      if (ch === '\r') continue;
      if (ch === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; continue; }
      cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell.trim()); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c !== ''; }); });
  }

  /**
   * 표 파일을 읽어 시트별 행 배열로 준다.
   *   readTable(file, function (err, res) { ... })
   *   res = { kind: 'xlsx'|'csv', sheets: [{ name, rows: [[셀,…],…] }] }
   * 못 읽으면 err 에 사람이 읽을 수 있는 이유가 담긴다 — 화면에 그대로 띄운다.
   */
  function readTable(file, cb) {
    var nm = String((file && file.name) || '').toLowerCase();
    var fr = new FileReader();
    fr.onerror = function () { cb(new Error('파일을 읽지 못했습니다.')); };
    if (/\.xlsx$|\.xlsm$/.test(nm)) {
      if (typeof DecompressionStream !== 'function') {
        cb(new Error('이 브라우저는 엑셀 압축을 풀 수 없습니다. 엑셀에서 「다른 이름으로 저장 → CSV」 로 저장해 올리거나, 표를 복사해 붙여넣으십시오.'));
        return;
      }
      fr.onload = function () {
        unzip(fr.result).then(function (files) {
          if (!files['xl/workbook.xml'] && !Object.keys(files).some(function (n) { return /worksheets\/sheet1\.xml$/.test(n); })) {
            throw new Error('엑셀 파일 안에서 표를 찾지 못했습니다.');
          }
          var sheets = xlsxSheets(files).filter(function (s) { return s.rows.length; });
          if (!sheets.length) throw new Error('엑셀에 읽을 행이 없습니다.');
          cb(null, { kind: 'xlsx', sheets: sheets });
        }).catch(function (e) { cb(e instanceof Error ? e : new Error(String(e))); });
      };
      fr.readAsArrayBuffer(file);
      return;
    }
    if (/\.xls$/.test(nm)) {
      cb(new Error('옛 형식(.xls)은 읽을 수 없습니다. 엑셀에서 「다른 이름으로 저장 → .xlsx」 또는 CSV 로 저장해 올리십시오.'));
      return;
    }
    fr.onload = function () {
      /* 사내 엑셀에서 저장한 CSV 는 EUC-KR 인 경우가 많다 — 깨지면 다시 읽는다 */
      var txt = new TextDecoder('utf-8').decode(new Uint8Array(fr.result));
      if (/�/.test(txt)) {
        try { txt = new TextDecoder('euc-kr').decode(new Uint8Array(fr.result)); } catch (e) { /* 그대로 */ }
      }
      var rows = delimRows(txt.replace(/^﻿/, ''));
      if (!rows.length) { cb(new Error('읽을 행이 없습니다.')); return; }
      cb(null, { kind: 'csv', sheets: [{ name: file.name || 'CSV', rows: rows }] });
    };
    fr.readAsArrayBuffer(file);
  }

  g.SS_PROS = {
    RULES: RULES,
    extract: extract,
    readMarket: readMarket,
    pdfToText: pdfToText,
    readTable: readTable,
    tableRowsFromText: delimRows,
    excelSerialDate: serialDate,
    fetchFromApi: fetchFromApi,
    apiConfig: apiConfig,
    setApiConfig: setApiConfig,
    buildElsTexts: buildElsTexts,
    parseSchedule: parseSchedule,
    normalizeSchedule: normalizeSchedule,
    pdfAvailable: function () { return !!g.pdfjsLib; }
  };
})(window);
