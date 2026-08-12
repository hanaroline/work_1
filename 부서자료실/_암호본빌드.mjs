// 부서 자료실 — 암호 잠금본 빌드
//
//   node _암호본빌드.mjs <게시본.html> [출력.html] [--pw 암호]
//
// 게시본(자료가 전부 담긴 단일 HTML)을 통째로 AES-256-GCM 으로 암호화해
// 잠금 화면 한 장에 넣습니다. 결과 파일에는 암호문만 들어가므로, 파일을
// 손에 넣어도 암호 없이는 자료를 볼 수 없습니다.
//
// 흔한 "자바스크립트로 비밀번호를 확인하는" 방식과 다릅니다. 그 방식은
// 자료가 평문으로 들어 있어 소스만 열면 그대로 보입니다. 여기서는 암호가
// 곧 복호화 키라, 암호를 모르면 복호화할 것이 없습니다.
//
// 한계는 분명히 해 둡니다. 암호문을 가진 사람은 시간을 들여 암호를 대입해
// 볼 수 있습니다(오프라인 공격). 그래서 PBKDF2 반복을 310,000 회로 두어
// 한 번의 시도를 느리게 만들고, 암호를 길게 뽑습니다. 짧은 암호로 바꾸면
// 이 방어가 무너집니다.

import { createCipheriv, pbkdf2Sync, randomBytes, randomInt } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const ITERATIONS = 310000;

// 헷갈리는 글자(0/O, 1/I/L)를 뺀 사전. 받아 적어 전달하는 일이 있어서다.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makePassword() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let s = '';
    for (let i = 0; i < 5; i++) s += ALPHABET[randomInt(ALPHABET.length)];
    groups.push(s);
  }
  return groups.join('-');
}

function parseArgs(argv) {
  const rest = [];
  let pw = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pw') pw = argv[++i];
    else rest.push(argv[i]);
  }
  return { pw, rest };
}

const { pw, rest } = parseArgs(process.argv.slice(2));
const srcPath = rest[0];
const outPath = rest[1] || '자료실-암호본.html';

if (!srcPath) {
  console.error('사용법: node _암호본빌드.mjs <게시본.html> [출력.html] [--pw 암호]');
  process.exit(1);
}

const password = pw || makePassword();
const generated = !pw;

if (password.length < 12) {
  console.error('[오류] 암호가 너무 짧습니다. 오프라인 대입에 견디려면 12자 이상이어야 합니다.');
  process.exit(1);
}

const plaintext = readFileSync(srcPath);

const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');

const cipher = createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);
// WebCrypto 는 암호문 뒤에 인증 태그가 붙어 있기를 기대한다.
const payload = Buffer.concat([body, cipher.getAuthTag()]);

const b64 = (buf) => buf.toString('base64');

const page = `<title>부서 자료실</title>
<style>
:root{
  --primary:#F58220;
  --primary-active:#CB6015;
  --secondary:#043B72;
  --canvas:#FFFFFF;
  --surface-subtle:#F7F8FA;
  --hairline:#CDCECB;
  --hairline-soft:#E5E4E1;
  --ink:#1A1A1A;
  --body:#3D3D3D;
  --muted:#6C6C6C;
  --error:#C62828;
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Malgun Gothic','\\B9D1\\C740 \\ACE0\\B515','Apple SD Gothic Neo',sans-serif;
  --font-num:'Consolas','SF Mono','Menlo',monospace;
}
*{ box-sizing:border-box; }
html,body{ margin:0; padding:0; height:100%; }
body{
  background:var(--canvas); color:var(--body);
  font-family:var(--font-kr); font-size:19px; line-height:1.65;
  -webkit-font-smoothing:antialiased;
}

.gate{
  min-height:100%;
  display:flex; align-items:center; justify-content:center;
  padding:32px 20px;
}
.card{ width:100%; max-width:460px; }
.rule{ height:1px; background:var(--primary); margin-bottom:24px; }
.eyebrow{
  font-size:14px; font-weight:500; letter-spacing:.6px; text-transform:uppercase;
  color:var(--muted); margin:0 0 10px;
}
h1{
  font-size:34px; font-weight:700; line-height:1.25; letter-spacing:-.3px;
  color:var(--ink); margin:0 0 14px; text-wrap:balance;
}
.lede{ font-size:17px; color:var(--muted); margin:0 0 28px; }

label{
  display:block; font-size:16px; font-weight:500;
  color:var(--ink); margin-bottom:8px;
}
.row{ display:flex; gap:10px; }
input[type="password"]{
  flex:1 1 auto; min-width:0;
  font-family:var(--font-num); font-size:17px; letter-spacing:1px; color:var(--ink);
  padding:11px 14px; min-height:46px;
  border:1px solid var(--hairline); border-radius:2px; background:var(--canvas);
}
input[type="password"]:focus-visible{ outline:2px solid var(--primary); outline-offset:-2px; }
button{
  flex:0 0 auto; font-family:inherit; font-size:17px; font-weight:500;
  color:#FFFFFF; background:var(--primary);
  border:0; border-radius:2px; padding:11px 22px; min-height:46px; cursor:pointer;
}
button:hover:not([disabled]){ background:var(--primary-active); }
button[disabled]{ background:#D7D7D7; cursor:default; }
button:focus-visible{ outline:2px solid var(--secondary); outline-offset:2px; }

.msg{ font-size:16px; margin:14px 0 0; min-height:1.6em; }
.msg.err{ color:var(--error); }
.msg.busy{ color:var(--muted); }

.note{
  margin-top:28px; padding-top:20px; border-top:1px solid var(--hairline-soft);
  font-size:14px; line-height:1.55; color:var(--muted);
}
.note p{ margin:0 0 6px; }

.stage{ position:fixed; inset:0; background:var(--canvas); }
.stage[hidden]{ display:none; }
.stage iframe{ display:block; width:100%; height:100%; border:0; }
</style>

<div class="gate" id="gate">
  <div class="card">
    <div class="rule"></div>
    <p class="eyebrow">미래에셋증권 마포WM</p>
    <h1>부서 자료실</h1>
    <p class="lede">부서 전용 자료입니다. 열람 암호를 입력하십시오.</p>

    <form id="form" autocomplete="off">
      <label for="pw">열람 암호</label>
      <div class="row">
        <input type="password" id="pw" autocomplete="current-password" spellcheck="false" autofocus>
        <button type="submit" id="go">열기</button>
      </div>
      <p class="msg" id="msg" role="status" aria-live="polite"></p>
    </form>

    <div class="note">
      <p>자료는 이 파일 안에 암호화되어 있습니다. 암호가 곧 복호화 키라, 암호 없이는 내용을 꺼낼 수 없습니다.</p>
      <p>암호를 메신저나 메일로 돌리지 마십시오. 한 번 퍼지면 회수할 방법이 없습니다.</p>
    </div>
  </div>
</div>

<div class="stage" id="stage" hidden></div>

<script type="application/json" id="vault">${JSON.stringify({
  v: 1,
  kdf: 'PBKDF2-SHA256',
  iterations: ITERATIONS,
  salt: b64(salt),
  iv: b64(iv),
  data: b64(payload),
})}</script>

<script>
(function () {
  "use strict";

  var VAULT = JSON.parse(document.getElementById("vault").textContent);

  var gate  = document.getElementById("gate");
  var stage = document.getElementById("stage");
  var form  = document.getElementById("form");
  var input = document.getElementById("pw");
  var go    = document.getElementById("go");
  var msg   = document.getElementById("msg");

  function say(text, cls) {
    msg.textContent = text;
    msg.className = "msg" + (cls ? " " + cls : "");
  }

  function fromBase64(s) {
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  if (!window.crypto || !window.crypto.subtle) {
    say("이 브라우저에서는 복호화를 할 수 없습니다. 파일을 HTTPS 주소에서 열거나 최신 브라우저를 사용하십시오.", "err");
    input.disabled = true;
    go.disabled = true;
    return;
  }

  function unlock(password) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: fromBase64(VAULT.salt),
            iterations: VAULT.iterations,
            hash: "SHA-256"
          },
          base,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
      })
      .then(function (key) {
        return crypto.subtle.decrypt(
          { name: "AES-GCM", iv: fromBase64(VAULT.iv) },
          key,
          fromBase64(VAULT.data)
        );
      })
      .then(function (buf) {
        return new TextDecoder().decode(buf);
      });
  }

  function reveal(html) {
    gate.hidden = true;
    stage.hidden = false;
    // 자료실 본체는 iframe 안에서 돌린다. 잠금 화면과 섞이지 않는다.
    var frame = document.createElement("iframe");
    frame.setAttribute("title", "부서 자료실");
    stage.appendChild(frame);
    frame.srcdoc = html;
    document.title = "부서 자료실";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var password = input.value;
    if (!password) { say("암호를 입력하십시오.", "err"); return; }

    input.disabled = true;
    go.disabled = true;
    say("여는 중입니다\\u2026", "busy");

    // 키 유도가 무거워 화면이 멎는다. 안내를 먼저 그리고 넘어간다.
    setTimeout(function () {
      unlock(password).then(reveal).catch(function () {
        input.disabled = false;
        go.disabled = false;
        say("암호가 맞지 않습니다.", "err");
        input.value = "";
        input.focus();
      });
    }, 30);
  });
})();
</script>
`;

writeFileSync(outPath, page);

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log('암호본을 만들었습니다: ' + outPath);
console.log('  원본 ' + mb(plaintext.length) + ' MB → 암호본 ' + mb(Buffer.byteLength(page)) + ' MB');
console.log('  AES-256-GCM / PBKDF2-SHA256 ' + ITERATIONS.toLocaleString() + '회');
if (generated) {
  console.log('');
  console.log('  열람 암호: ' + password);
  console.log('  (이 암호는 파일 어디에도 저장되지 않습니다. 잃어버리면 열 수 없습니다.)');
}
