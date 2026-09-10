/**
 * 투자설명서 판독기 — 첨부한 파일에서 설명의무 항목의 값을 뽑아낸다.
 *
 * 원칙 두 가지.
 *   1) 못 찾은 항목은 비워 둔다. 추측해서 채우지 않는다.
 *   2) 찾은 항목은 반드시 **문서에 적힌 문장(excerpt)** 을 함께 돌려준다.
 *      화면이 그 문장을 같이 보여주므로, 인식이 틀리면 사람이 바로 알아챈다.
 *
 * PDF 는 vendor/pdf.min.js + vendor/pdf.worker.min.js 로 읽는다. 워커 스크립트를
 * 같이 로드해 두면 pdf.js 가 globalThis.pdfjsWorker 를 찾아 메인 스레드에서 돌리므로,
 * 워커 파일을 네트워크로 받아오지 않는다 (오프라인 PC 대응).
 *
 * window.DutyExtract = { readFile, fromText }
 */
(function () {
  'use strict';

  /* ---------- 파일 읽기 ---------- */

  function readAsText(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result || '')); };
      fr.onerror = function () { reject(new Error('파일을 읽지 못했습니다.')); };
      fr.readAsText(file, 'utf-8');
    });
  }

  function readAsBuffer(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(new Error('파일을 읽지 못했습니다.')); };
      fr.readAsArrayBuffer(file);
    });
  }

  /** PDF 한 페이지의 텍스트 조각을 줄 단위로 다시 이어붙인다 (y 좌표가 바뀌면 줄바꿈). */
  function pageToText(items) {
    var out = '';
    var lastY = null;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var y = it.transform ? it.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) out += '\n';
      else if (out && !/\s$/.test(out)) out += ' ';
      out += it.str;
      if (y !== null) lastY = y;
    }
    return out;
  }

  async function pdfToText(buffer, onProgress) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF 판독기(vendor/pdf.min.js)를 불러오지 못했습니다.');
    }
    var task = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: false,
      // 폰트·이미지 자원을 외부에서 받아오지 않는다 (오프라인)
      disableFontFace: true
    });
    var pdf = await task.promise;
    var parts = [];
    for (var n = 1; n <= pdf.numPages; n++) {
      var page = await pdf.getPage(n);
      var content = await page.getTextContent();
      parts.push(pageToText(content.items));
      if (onProgress) onProgress(n, pdf.numPages);
    }
    return parts.join('\n\n');
  }

  function stripHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var scripts = doc.querySelectorAll('script,style');
    for (var i = 0; i < scripts.length; i++) scripts[i].remove();
    return doc.body ? doc.body.innerText || doc.body.textContent || '' : '';
  }

  /**
   * @returns {Promise<{text:string, kind:string, pages:number|null}>}
   */
  async function readFile(file, onProgress) {
    var name = (file.name || '').toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      var buf = await readAsBuffer(file);
      var text = await pdfToText(buf, onProgress);
      return { text: text, kind: 'pdf' };
    }
    var raw = await readAsText(file);
    if (name.endsWith('.htm') || name.endsWith('.html') || /^\s*</.test(raw)) {
      return { text: stripHtml(raw), kind: 'html' };
    }
    return { text: raw, kind: 'text' };
  }

  /* ---------- 텍스트 정규화 ---------- */

  function normalize(text) {
    return String(text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[ ​﻿]/g, ' ')
      // 판독 결과는 화면에 HTML 로 꽂히므로, 문서에서 온 꺾쇠는 여기서 없앤다
      .replace(/[<>]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }

  /** '총보수' -> /총\s*보\s*수/ : PDF 가 글자 사이에 공백을 흘려도 걸리게 한다 */
  function kw(word) {
    return String(word)
      .split('')
      .map(function (ch) { return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
      .join('\\s*');
  }

  function alt() {
    return Array.prototype.slice.call(arguments).map(kw).join('|');
  }

  /* ---------- 항목 판독 ---------- */

  var NUM = '([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]+)?)';

  function toNum(s) {
    var n = Number(String(s == null ? '' : s).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function excerptAt(text, index, length) {
    var from = Math.max(0, index - 40);
    var to = Math.min(text.length, index + (length || 0) + 90);
    var s = text.slice(from, to).replace(/\n+/g, ' ').trim();
    return (from > 0 ? '…' : '') + s + (to < text.length ? '…' : '');
  }

  /** 첫 매치를 {value, excerpt} 로. cast 는 캡처그룹 배열 -> 값 */
  function grab(text, re, cast) {
    re.lastIndex = 0;
    var m = re.exec(text);
    if (!m) return null;
    var value = cast ? cast(m) : m[1];
    if (value === null || value === undefined || value === '') return null;
    return { value: value, excerpt: excerptAt(text, m.index, m[0].length) };
  }

  var RISK_LABELS = [
    ['매우높은위험', 1], ['높은위험', 2], ['다소높은위험', 3],
    ['보통위험', 4], ['낮은위험', 5], ['매우낮은위험', 6]
  ];

  /**
   * 위험등급.
   * 설명서에는 "이 상품은 2등급(높은위험)" 바로 뒤에 "1등급(매우높은위험)~6등급(매우낮은위험)"
   * 같은 등급표 설명이 따라붙는다. 문서 전체에서 아무 문구나 집으면 등급표의 첫 문구를
   * 상품 등급으로 오인하므로, **등급 숫자 주변(±60자)** 에서만 문구를 찾는다.
   */
  function readRisk(text) {
    var re = new RegExp('(?:' + alt('투자위험등급', '위험등급') + ')[^0-9\\n]{0,14}([1-6])\\s*(?:' + kw('등급') + ')', 'g');
    var m = re.exec(text);
    if (!m) {
      // 등급 숫자 없이 문구만 있는 문서
      for (var i = 0; i < RISK_LABELS.length; i++) {
        var hit = grab(text, new RegExp('(' + kw(RISK_LABELS[i][0]) + ')', 'g'), function (mm) { return mm[1]; });
        if (hit) return { value: { grade: RISK_LABELS[i][1], label: RISK_LABELS[i][0] }, excerpt: hit.excerpt };
      }
      return null;
    }
    var grade = Number(m[1]);
    var near = text.slice(m.index + m[0].length, Math.min(text.length, m.index + m[0].length + 30));
    // 등급 숫자 **바로 뒤**에 오는 문구가 그 상품의 등급 문구다.
    // 배열 순서대로 찾으면 뒤따르는 등급표("1등급 매우높은위험 ~ 6등급 …")의 문구를 집어버린다.
    var label = null, mismatch = false, at = Infinity;
    for (var j = 0; j < RISK_LABELS.length; j++) {
      var found = near.search(new RegExp(kw(RISK_LABELS[j][0])));
      if (found >= 0 && found < at) {
        at = found;
        label = RISK_LABELS[j][0];
        mismatch = RISK_LABELS[j][1] !== grade;
      }
    }
    return { value: { grade: grade, label: label, mismatch: mismatch }, excerpt: excerptAt(text, m.index, m[0].length) };
  }

  /** 키워드 뒤 가까운 곳의 퍼센트 값 */
  function pctAfter(text, words, window_) {
    var w = window_ || 60;
    return grab(
      text,
      new RegExp('(?:' + alt.apply(null, words) + ')[^%\\n]{0,' + w + '}?' + NUM + '\\s*%', 'g'),
      function (m) { return toNum(m[1]); }
    );
  }

  /**
   * 키워드가 들어간 문장 한 덩어리.
   *
   * 설명서 PDF 는 제목을 "투 자 목 적 및 주 요 투 자 대 상" 처럼 자간을 벌려 찍는다.
   * 키워드만 보고 첫 매치를 집으면 내용이 아니라 **제목**을 가져오게 되므로,
   * 모든 매치를 훑어 키워드 뒤에 실제 내용이 가장 많이 붙은 것을 고른다.
   *
   * @param {function} [test] 후보를 한 번 더 거르는 조건
   */
  function sentence(text, words, len, test) {
    var max = len || 140;
    var re = new RegExp('((?:' + alt.apply(null, words) + ')([^\\n]{0,' + max + '}))', 'g');
    var best = null, m;
    while ((m = re.exec(text)) !== null) {
      var tail = String(m[2] || '');
      var dense = tail.replace(/\s/g, '');
      if (dense.replace(/^[:：\-–]+/, '').length < 8) continue;   // 제목만 걸린 것
      if (test && !test(m[1])) continue;
      if (!best || dense.length > best.score) {
        // 앞머리 라벨은 "주요투자대상 :" 처럼 **구분기호가 있을 때만** 뗀다.
        // "최대손실률은 …" 처럼 키워드가 문장의 주어면 떼는 순간 말이 깨지므로 통째로 둔다.
        // 문장 끝을 못 만나고 잘렸으면 …로 표시한다 (없는 말을 이어 붙이지 않는다).
        var sep = /^\s*[:：\-–]\s*/.exec(tail);
        var value = tidy(sep ? tail.slice(sep[0].length) : m[1]);
        if (value && !/[.。]$/.test(value) && tail.length >= max) value += '…';
        best = { score: dense.length, value: value, excerpt: excerptAt(text, m.index, m[0].length) };
      }
    }
    return best && best.value ? { value: best.value, excerpt: best.excerpt } : null;
  }

  /** PDF 가 흘려 놓은 공백 정리. 근거 문장(excerpt)에는 쓰지 않는다 — 원문 그대로 보여야 하므로. */
  function tidy(s) {
    return String(s)
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,.;:%)\]])/g, '$1')
      .replace(/([(\[])\s+/g, '$1')
      // 숫자와 한글을 붙이거나 하이픈 앞뒤를 붙이는 것은 하지 않는다.
      // "90 일" 을 붙이려다 "38081 제" 까지 붙고, 음수 부호(-100%)를 앞말에 붙여 버린다.
      .replace(/([가-힣])\s+-\s+([가-힣])/g, '$1-$2')
      .trim();
  }

  function readMaturity(text) {
    var byYear = grab(
      text,
      new RegExp('(?:' + alt('만기', '투자기간', '신탁기간') + ')[^0-9\\n]{0,20}([0-9]{1,2})\\s*(?:' + kw('년') + ')', 'g'),
      function (m) { return Number(m[1]) * 12; }
    );
    if (byYear) return byYear;
    return grab(
      text,
      new RegExp('(?:' + alt('만기', '투자기간') + ')[^0-9\\n]{0,20}([0-9]{1,3})\\s*(?:' + kw('개월') + ')', 'g'),
      function (m) { return Number(m[1]); }
    );
  }

  function readBarriers(text) {
    var hit = grab(
      text,
      /([0-9]{2,3}(?:\.[0-9]+)?(?:\s*[-–]\s*[0-9]{2,3}(?:\.[0-9]+)?){2,})/g,
      function (m) { return m[1]; }
    );
    if (!hit) return null;
    var nums = hit.value.split(/\s*[-–]\s*/).map(Number).filter(function (n) {
      return Number.isFinite(n) && n > 20 && n <= 130;
    });
    if (nums.length < 3) return null;
    return { value: nums, excerpt: hit.excerpt };
  }

  function readHedge(text) {
    var h = grab(text, new RegExp('(' + alt('환헤지', '환위험회피', '환율변동위험회피') + ')', 'g'), function (m) { return m[1]; });
    if (h) return { value: 'H', excerpt: h.excerpt };
    var u = grab(text, new RegExp('(' + alt('환노출', '환헤지하지', '환위험을회피하지') + ')', 'g'), function (m) { return m[1]; });
    if (u) return { value: 'UH', excerpt: u.excerpt };
    return null;
  }

  /**
   * 상품명. 표지 앞부분에서 상품명처럼 생긴 **첫 줄**을 고른다.
   * 서술문("…등급은 2등급입니다")도 '투자신탁'을 포함하므로, 문장으로 끝나는 줄은 뺀다.
   */
  function readName(text) {
    var head = text.slice(0, 3000).split('\n');
    for (var i = 0; i < head.length; i++) {
      var line = tidy(head[i]);
      if (line.length < 6 || line.length > 90) continue;
      if (!/(투자신탁|투자회사|ELS|ELB|DLS|DLB|파생결합증권|펀드)/.test(line)) continue;
      if (/^(투자설명서|간이투자설명서|핵심설명서|목\s*차)/.test(line)) continue;
      if (/(입니다|습니다|합니다|하십시오|등급은|바랍니다)/.test(line)) continue;   // 서술문
      if (/^[0-9]+\s*[.)]/.test(line)) continue;                                    // 목차 항목
      return { value: line, excerpt: line };
    }
    return null;
  }

  /**
   * @param {string} rawText 문서 전체 텍스트
   * @returns {{fields:Object, keys:string[], length:number}}
   */
  function fromText(rawText) {
    var text = normalize(rawText);
    var f = {};

    function put(key, hit) { if (hit) f[key] = hit; }

    put('productName', readName(text));
    put('code', grab(text, /\b(KR[0-9A-Z]{10})\b/g, function (m) { return m[1]; }));
    // 운용사·발행사는 문장이 아니라 회사 이름만 남긴다
    put('manager', grab(
      text,
      new RegExp('(?:' + kw('집합투자업자') + ')\\s*[:：]?\\s*([가-힣A-Za-z0-9()\\s]{2,24}?(?:' + alt('자산운용', '투자신탁운용', '운용') + ')[가-힣A-Za-z()]{0,10})', 'g'),
      function (m) { return tidy(m[1]); }
    ) || sentence(text, ['집합투자업자'], 40));
    put('issuer', grab(
      text,
      new RegExp('(?:' + alt('발행회사', '발행인') + ')\\s*[:：]?\\s*([가-힣A-Za-z0-9()\\s]{2,30}?(?:' + alt('주식회사', '증권', '은행') + ')[가-힣A-Za-z()]{0,10})', 'g'),
      function (m) { return tidy(m[1]); }
    ) || sentence(text, ['발행회사', '발행인'], 40));
    put('risk', readRisk(text));

    put('totalExpense', pctAfter(text, ['총보수', '총보수및비용', '연간총보수'], 80));
    put('feeFront', pctAfter(text, ['선취판매수수료', '선취수수료'], 80));
    put('feeBack', pctAfter(text, ['후취판매수수료', '후취수수료'], 80));
    put('redemptionFee', sentence(text, ['환매수수료'], 140));
    put('otherCost', pctAfter(text, ['기타비용'], 60));

    // 환매 관련 문장만 잡는다 ("최초기준가격" 같은 ELS 문구가 딸려오지 않게)
    put('redemptionPricing', sentence(text, ['환매청구일', '환매신청일', '환매를청구'], 120, function (s) {
      return /기준가/.test(s);
    }));
    put('redemptionPayout', sentence(text, ['환매대금', '환매청구일', '환매신청일'], 120, function (s) {
      return /영업일/.test(s) && /지급/.test(s);
    }));

    put('invests', sentence(text, ['주요투자대상', '투자대상', '투자목적'], 220));
    put('benchmark', sentence(text, ['비교지수', '벤치마크'], 90));
    put('hedge', readHedge(text));

    put('underlyings', sentence(text, ['기초자산'], 120));
    put('knockIn', grab(
      text,
      new RegExp('(?:' + alt('낙인', '녹인') + '|KI|Knock[\\s-]?In)[^0-9\\n]{0,20}' + NUM + '\\s*%', 'gi'),
      function (m) { return toNum(m[1]); }
    ));
    put('barriers', readBarriers(text));
    put('couponRate', grab(
      text,
      new RegExp('(?:' + alt('세전', '제시수익률', '수익률') + ')[^0-9\\n]{0,20}(?:' + kw('연') + ')?\\s*' + NUM + '\\s*%', 'g'),
      function (m) { return toNum(m[1]); }
    ));
    put('maturityMonths', readMaturity(text));
    put('maxLoss', sentence(text, ['최대손실', '원금손실'], 120));

    put('highComplexity', grab(
      text,
      new RegExp('(' + kw('고난도금융투자상품') + ')', 'g'),
      function (m) { return true; }
    ));
    put('tax', sentence(text, ['배당소득', '과세'], 120));
    put('docDate', grab(text, /((?:19|20)[0-9]{2})\s*[.\-년]\s*([0-9]{1,2})\s*[.\-월]\s*([0-9]{1,2})/g, function (m) {
      var mm = ('0' + m[2]).slice(-2), dd = ('0' + m[3]).slice(-2);
      return m[1] + '-' + mm + '-' + dd;
    }));

    return { fields: f, keys: Object.keys(f), length: text.length, text: text };
  }

  window.DutyExtract = { readFile: readFile, fromText: fromText, normalize: normalize };
})();
