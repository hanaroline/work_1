/**
 * 엑셀 산출물을 **검사 쪽에서 독립적으로 읽고 계산해 보는** 도구.
 *
 * 앱이 쓴 수식의 계산값(<v>)을 그대로 믿으면 아무것도 검증하지 못한다. 앱이 수식을
 * 틀리게 써 놓고 계산값만 맞게 적어 두면 엑셀에서 여는 순간 다른 숫자가 나오는데,
 * 검사는 통과해 버린다. 그래서 여기서 **수식을 직접 계산해** 맞대 본다.
 *
 * zip 은 파이썬 zipfile 같은 완성품을 쓸 수 없어(노드 표준 라이브러리에 없다) 직접
 * 읽는다. 앱이 무압축(STORE)으로만 쓰므로 읽는 쪽도 무압축만 받는다 - 압축된 항목이
 * 나오면 그 자체가 규격 이탈이라 끊는다. CRC 는 여기서 다시 계산해 대조한다.
 */

/* ── zip 읽기 ─────────────────────────────────────────────────── */

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/**
 * 중앙 디렉터리부터 읽는다.
 *
 * 로컬 헤더만 훑으면 앱이 중앙 디렉터리를 엉터리로 써 놓아도 모르고 지나간다.
 * 실제 zip 프로그램은 중앙 디렉터리를 먼저 보므로 같은 길로 읽는다.
 */
function unzip(buf) {
  const u16 = (o) => buf[o] | (buf[o + 1] << 8);
  const u32 = (o) => (buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16) | (buf[o + 3] << 24)) >>> 0;

  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (u32(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('zip 끝 표지(EOCD)를 찾지 못했습니다');

  const count = u16(eocd + 10);
  let at = u32(eocd + 16);
  const out = {};
  for (let n = 0; n < count; n++) {
    if (u32(at) !== 0x02014b50) throw new Error('중앙 디렉터리 항목이 깨졌습니다 (' + n + ')');
    const method = u16(at + 10);
    const crc = u32(at + 16);
    const size = u32(at + 24);
    const nameLen = u16(at + 28);
    const extraLen = u16(at + 30);
    const cmtLen = u16(at + 32);
    const localAt = u32(at + 42);
    const name = buf.slice(at + 46, at + 46 + nameLen).toString('utf8');
    if (method !== 0) throw new Error('무압축이 아닙니다: ' + name);

    if (u32(localAt) !== 0x04034b50) throw new Error('로컬 헤더가 깨졌습니다: ' + name);
    const lNameLen = u16(localAt + 26);
    const lExtraLen = u16(localAt + 28);
    const dataAt = localAt + 30 + lNameLen + lExtraLen;
    const data = buf.slice(dataAt, dataAt + size);
    if (crc32(data) !== crc) throw new Error('CRC 가 맞지 않습니다: ' + name);
    out[name] = data;
    at += 46 + nameLen + extraLen + cmtLen;
  }
  return out;
}

/* ── 시트 읽기 ───────────────────────────────────────────────── */

const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** 시트 XML → { 'A1': {f, v, s}, ... } */
function readSheet(xml) {
  const cells = {};
  const re = /<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g;
  let m;
  while ((m = re.exec(xml))) {
    const ref = m[1];
    const attrs = m[2];
    const body = m[3];
    const sm = /\ss="(\d+)"/.exec(attrs);
    const cell = { s: sm ? Number(sm[1]) : 0 };
    const fm = /<f>([\s\S]*?)<\/f>/.exec(body);
    if (fm) cell.f = unesc(fm[1]);
    const vm = /<v>([\s\S]*?)<\/v>/.exec(body);
    if (vm) cell.v = Number(vm[1]);
    const tm = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
    if (tm && !vm) { cell.text = unesc(tm[1]); cell.v = cell.text; }
    cells[ref] = cell;
  }
  return cells;
}

/** 워크북 → [{name, cells}] (workbook.xml 의 순서 = sheet1, sheet2 …) */
function readWorkbook(buf) {
  const files = unzip(buf);
  const wb = files['xl/workbook.xml'].toString('utf8');
  const names = [];
  const re = /<sheet name="([^"]*)"/g;
  let m;
  while ((m = re.exec(wb))) names.push(unesc(m[1]));
  return {
    files,
    sheets: names.map((name, i) => ({
      name,
      cells: readSheet(files['xl/worksheets/sheet' + (i + 1) + '.xml'].toString('utf8'))
    }))
  };
}

/* ── 수식 계산 ───────────────────────────────────────────────── */

/**
 * 엑셀 수식을 계산한다. 앱이 쓰는 만큼만 받는다 - 숫자 · 셀 참조 · 범위 ·
 * 괄호 · 사칙연산 · 비교 · MIN/MAX/IF/AND/SUM.
 *
 * 받지 않는 것이 나오면 조용히 넘기지 않고 끊는다. 모르는 함수를 0 으로 두면
 * 어긋남이 0 으로 나와 검사가 통과해 버린다.
 */
function makeEvaluator(cells) {
  const cache = {};
  const busy = {};

  const colIdx = (s) => {
    let n = 0;
    for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n;
  };
  const colStr = (n) => {
    let s = '', k = n;
    while (k > 0) { const r = (k - 1) % 26; s = String.fromCharCode(65 + r) + s; k = Math.floor((k - 1) / 26); }
    return s;
  };

  function valueOf(ref) {
    const key = ref.replace(/\$/g, '');
    if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
    if (busy[key]) throw new Error('수식이 순환 참조합니다: ' + key);
    const c = cells[key];
    if (!c) return 0;                       // 빈 칸은 엑셀과 같이 0
    if (c.f === undefined) return typeof c.v === 'number' ? c.v : 0;
    busy[key] = true;
    const got = evaluate(c.f);
    busy[key] = false;
    cache[key] = got;
    return got;
  }

  function rangeRefs(a, b) {
    const pa = /^\$?([A-Z]+)\$?(\d+)$/.exec(a);
    const pb = /^\$?([A-Z]+)\$?(\d+)$/.exec(b);
    const c1 = colIdx(pa[1]), c2 = colIdx(pb[1]);
    const r1 = Number(pa[2]), r2 = Number(pb[2]);
    const out = [];
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
      for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) out.push(colStr(c) + r);
    }
    return out;
  }

  function evaluate(src) {
    let i = 0;
    const s = src;
    const ws = () => { while (i < s.length && s[i] === ' ') i++; };

    function parseExpr() { return parseCmp(); }

    function parseCmp() {
      let left = parseAdd();
      for (;;) {
        ws();
        const two = s.slice(i, i + 2);
        if (two === '>=' || two === '<=' || two === '<>') {
          i += 2;
          const right = parseAdd();
          left = two === '>=' ? (left >= right) : two === '<=' ? (left <= right) : (left !== right);
        } else if (s[i] === '>' || s[i] === '<' || s[i] === '=') {
          const op = s[i]; i += 1;
          const right = parseAdd();
          left = op === '>' ? (left > right) : op === '<' ? (left < right) : (left === right);
        } else return left;
      }
    }

    function parseAdd() {
      let left = parseMul();
      for (;;) {
        ws();
        if (s[i] === '+' || s[i] === '-') {
          const op = s[i]; i += 1;
          const right = parseMul();
          left = op === '+' ? num(left) + num(right) : num(left) - num(right);
        } else return left;
      }
    }

    function parseMul() {
      let left = parseUnary();
      for (;;) {
        ws();
        if (s[i] === '*' || s[i] === '/') {
          const op = s[i]; i += 1;
          const right = parseUnary();
          left = op === '*' ? num(left) * num(right) : num(left) / num(right);
        } else return left;
      }
    }

    function parseUnary() {
      ws();
      if (s[i] === '-') { i += 1; return -num(parseUnary()); }
      if (s[i] === '+') { i += 1; return num(parseUnary()); }
      return parsePrimary();
    }

    function parseArgs() {
      const args = [];
      i += 1;                               // '('
      ws();
      if (s[i] === ')') { i += 1; return args; }
      for (;;) {
        args.push(parseExpr());
        ws();
        if (s[i] === ',') { i += 1; continue; }
        if (s[i] === ')') { i += 1; return args; }
        throw new Error('인자 목록이 이상합니다: ' + s.slice(0, i + 1));
      }
    }

    function parsePrimary() {
      ws();
      if (s[i] === '(') { i += 1; const v = parseExpr(); ws(); i += 1; return v; }

      const numM = /^\d+(\.\d+)?/.exec(s.slice(i));
      if (numM) { i += numM[0].length; return Number(numM[0]); }

      const idM = /^[A-Z][A-Z0-9_.]*/i.exec(s.slice(i));
      if (idM && s[i + idM[0].length] === '(') {
        const fn = idM[0].toUpperCase();
        i += idM[0].length;
        const before = i;
        // SUM 은 범위를 받으므로 인자를 따로 읽는다
        if (fn === 'SUM') {
          const rangeM = /^\(\s*(\$?[A-Z]+\$?\d+):(\$?[A-Z]+\$?\d+)\s*\)/.exec(s.slice(i));
          if (rangeM) {
            i += rangeM[0].length;
            return rangeRefs(rangeM[1], rangeM[2]).reduce((a, r) => a + num(valueOf(r)), 0);
          }
          i = before;
          return parseArgs().reduce((a, v) => a + num(v), 0);
        }
        const args = parseArgs();
        if (fn === 'MIN') return Math.min.apply(null, args.map(num));
        if (fn === 'MAX') return Math.max.apply(null, args.map(num));
        if (fn === 'AND') return args.every((a) => a === true || num(a) !== 0);
        if (fn === 'OR') return args.some((a) => a === true || num(a) !== 0);
        if (fn === 'IF') return (args[0] === true || (args[0] !== false && num(args[0]) !== 0))
          ? args[1] : (args.length > 2 ? args[2] : false);
        throw new Error('모르는 함수입니다: ' + fn);
      }

      const refM = /^(\$?[A-Z]+\$?\d+)/.exec(s.slice(i));
      if (refM) { i += refM[0].length; return valueOf(refM[1]); }

      throw new Error('읽을 수 없는 수식 조각: ' + s.slice(i) + '  (전체: ' + src + ')');
    }

    const num = (v) => (v === true ? 1 : v === false ? 0 : Number(v) || 0);

    const out = parseExpr();
    ws();
    if (i < s.length) throw new Error('수식이 끝까지 읽히지 않았습니다: ' + src);
    return num(out);
  }

  return { valueOf, evaluate };
}

module.exports = { unzip, readSheet, readWorkbook, makeEvaluator, crc32 };
