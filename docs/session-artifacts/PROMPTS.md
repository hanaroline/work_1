# 자주 쓰는 프롬프트 · 설정 모음

새 계정에서 그대로 복사해 쓰도록 모아 둔 것입니다.
짝이 되는 문서는 같은 폴더의 `HANDOVER.md` 입니다.

---

## 1. 자료실 자동 갱신 — 예약 작업 프롬프트

지금 쓰던 예약 작업의 내용입니다. 새 계정에서 Routine 을 다시 만들 때
**그대로 붙여 넣으십시오.**

- 주기: 주 2회 · 월·목 08:00 KST (UTC 로는 `0 23 * * 0,3`)
- 실행 방식: 같은 세션을 깨워 대화를 이어 가는 방식
- 새 산출물 처리: 확인 후 바로 게시하고 색인·문서까지 갱신

```
세션 산출물 자료실을 갱신할 차례입니다. 지난번과 같은 기준으로 진행하세요.

먼저 확인 — 이 실행에 `Artifact` 도구가 있습니까? 없으면 게시가 불가능하므로,
새 산출물 목록과 무엇을 게시해야 하는지만 정리해 보고하고 「Artifact 도구가 없어
게시하지 못했습니다」를 명시하십시오. 조용히 건너뛰지 마십시오.

작업 순서
1. `git fetch origin --prune` 후 모든 원격 브랜치의 최종 산출물을 다시 훑습니다.
   세션 목록으로 새 세션도 확인합니다.
2. 저장소의 `docs/session-artifacts/README.md`(세션↔아티팩트 대응표)와 `Artifact`
   `action:"list"` 결과를 대조해, 지난번 이후 **새로 생긴 산출물**과 **최종본이
   갱신된 산출물**만 골라냅니다. 중간 판·실험본은 넣지 않습니다.
3. 게시 전에 각 파일 내용을 반드시 확인합니다(가시 텍스트·외부 요청 URL·자격정보
   패턴 점검). 자체 완결이 아닌 파일은 standalone 판을 씁니다.
4. HTML 산출물은 파일을 그대로 게시합니다. PPTX·MP4 등은
   `docs/session-artifacts/tools/` 의 `build_decks.py`·`build_videos.py` 방식으로
   미리보기 + 원본 내려받기 페이지를 만듭니다(`capabilities: {"downloads": true}`).
5. 이미 아티팩트가 있고 파일이 그보다 새롭지 않으면 다시 올리지 않고 링크만 씁니다.
   같은 산출물의 새 판이면 같은 아티팩트 URL 에 `url` 파라미터로 덮어씁니다.
6. 색인 아티팩트를 갱신합니다 — <색인 아티팩트 URL> 을 `url` 로 넘겨 같은 링크를
   유지하고, `build_hub.py` 의 GROUPS 에 새 항목을 넣어 다시 만듭니다. 주제 분류·
   한/영 토글·미래에셋 디자인 기준(mas-design)을 그대로 유지합니다.
7. `make_index_md.py` 로 `docs/session-artifacts/README.md` 를 다시 만들고, 브랜치
   `claude/organize-session-artifacts-fbg82m` 에 커밋·푸시합니다. PR 은 만들지 않습니다.
8. 마지막에 무엇이 새로 올라갔고 무엇이 그대로인지 짧게 보고합니다. 새 산출물이
   없으면 「변화 없음」 한 줄로 끝냅니다.

주의 — 아티팩트는 비공개가 기본입니다. 공유 설정을 임의로 바꾸지 마세요. 실시간
시세 화면은 아티팩트에서 외부 요청이 막히는 한계를 설명에 유지합니다. 생성기
스크립트는 저장소에 있으니 기억에 의존하지 말고 그것을 읽고 쓰십시오.
```

> `<색인 아티팩트 URL>` 자리는 새 계정에서 색인을 처음 올린 뒤 그 주소로 바꾸십시오.

---

## 2. 자료실을 처음부터 다시 세우는 프롬프트

새 계정에서 **한 번만** 쓰는 것입니다.

```
GitHub 저장소 hanaroline/work_1 의 각 세션 가지에 흩어져 있는 최종 작업본을
주제별로 아티팩트에 올려 자료실을 다시 세워 주세요.

- `docs/session-artifacts/HANDOVER.md` 와 `README.md` 를 먼저 읽으십시오.
  무엇이 어느 가지에 있는지, 어떤 규칙으로 올렸는지가 거기 적혀 있습니다.
- 생성기는 `docs/session-artifacts/tools/` 에 있습니다. 기억이 아니라 그것을
  읽고 쓰십시오.
- 올리기 전에 반드시 파일 내용을 확인하고(자격정보·PII·외부 요청), 브라우저로
  실제 렌더링해 빈 화면이 아닌지 봅니다.
- 올린 뒤 `build_hub.py` 의 GROUPS 에 새 URL 을 넣고 색인을 다시 만들어
  `claude/organize-session-artifacts-fbg82m` 에 커밋·푸시하십시오. PR 은 만들지
  않습니다.
```

---

## 3. 한 건만 급히 올릴 때

```
<가지 이름> 의 <파일> 을 아티팩트로 올려 주세요.
올리기 전에 자격정보·PII·외부 요청을 점검하고, 아티팩트의 요청 차단을 흉내 내
브라우저로 렌더링해 실제로 그려지는지 확인한 뒤 올리십시오.
한계(실시간 자료 차단, 저장 단추, 자료 기준일)는 설명에 그대로 적어 주세요.
```

---

## 4. 검증 스크립트 — 아티팩트 환경 흉내 내기

아티팩트는 외부 요청을 거의 다 막습니다. 올리기 전에 그 환경을 흉내 내
**실제로 그려 보는** 것이 이 작업의 핵심 안전장치입니다.

`scratchpad/shot-blocked.mjs` 로 저장해 쓰십시오.
(저장소 뿌리에서 `node <경로> <검사할 파일> <스크린샷 낼 곳>`)

```js
import pw from '/home/user/work_1/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'node:fs/promises';

const src = process.argv[2];
const raw = await fs.readFile(src, 'utf8');
// 아티팩트 호스트가 조각을 감싸는 것과 같은 모양으로 감싼다
await fs.writeFile(src + '.w.html',
 '<!doctype html><html><head><meta charset="utf8">' +
 '<style>:root{color-scheme:light}body{margin:0}</style></head><body>\n'
 + raw + '\n</body></html>');

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1340, height: 1000 } });
const errs = [], blocked = [];
p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
// 아티팩트의 차단을 흉내 낸다 — file: 말고는 전부 막는다
await p.route('**/*', r => {
  const u = r.request().url();
  if (u.startsWith('file:')) return r.continue();
  blocked.push(u.slice(0, 70));
  return r.abort();
});
await p.goto('file://' + src + '.w.html');
await p.waitForTimeout(3000);
await p.screenshot({ path: process.argv[3] });
console.log('title:', await p.title());
const txt = await p.locator('body').innerText();
console.log('body text len:', txt.length);
console.log('first 300:', txt.slice(0, 300).replace(/\n+/g, ' | '));
console.log('blocked requests:', [...new Set(blocked)].slice(0, 6), 'total', blocked.length);
console.log('errors:', errs.slice(0, 3));
await b.close();
```

**읽는 법** — `body text len` 이 수백 자에 그치면 빈 껍데기입니다.
`blocked requests` 에 구글 폰트 말고 다른 것이 있으면 그 기능은 아티팩트에서
동작하지 않습니다. `errors` 는 0이어야 합니다.

표의 행 수까지 보려면 이런 줄을 덧붙입니다.

```js
console.log('rows:', await p.locator('tbody tr').count());
console.log('select options:', await p.locator('select option').count());
```

---

## 5. 자격정보·PII 점검 스크립트

```python
import re, sys
s = open(sys.argv[1], encoding='utf-8', errors='replace').read()
print('U+FFFD', s.count('�'),
      '| fetch', len(re.findall(r'fetch\(|XMLHttpRequest', s)),
      '| script src', len(re.findall(r'<script src=', s)))
u = [x for x in set(re.findall(r'https?://[A-Za-z0-9._~:/?#\[\]@!$&\'()*+,;=%-]+', s))
     if 'fonts.g' not in x and 'w3.org' not in x]
print('외부 URL', len(u)); [print('  ', x[:95]) for x in sorted(u)[:10]]
for pat in [r'api[_-]?key', r'appsecret', r'secret', r'password', r'bearer\s',
            r'\b\d{6}-[1-4]\d{6}\b',              # 주민등록번호
            r'01[016-9]-?\d{3,4}-?\d{4}',          # 휴대전화
            r'[\w.+-]+@[\w-]+\.[\w.]+',            # 이메일
            r'\b(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b']:  # 사설 IP
    m = re.findall(pat, s, re.I)
    if m: print('  %-22s %d %s' % (pat, len(m), sorted(set(m))[:3]))
```

**걸렸다고 바로 겁먹지 마십시오.** 지금까지 걸린 것은 전부 이런 것들이었습니다.

- `password`·`SECRET` 수십 건 → pdf.js·React 내부 상수
- 휴대전화처럼 보이는 숫자 18건 → pdf.js 의 색변환 계수
- `Secret`·`Bearer` 1건씩 → 회사 이름(Victoria's Secret, Roche Bearer Shares)
- `Authorization`·`Bearer ...` → 설정 입력칸의 `placeholder` (저장된 값 아님)

**어디에 있는지 반드시 확인한 뒤** 판단하십시오.

---

## 6. 내려받기 중계 스크립트

아티팩트 뷰어는 페이지가 스스로 시작한 내려받기를 막습니다. `<a download>` +
Blob 방식 저장 단추는 눌러도 아무 일이 없습니다. 아래를 `</body>` 바로 앞에
붙이고 `capabilities: {"downloads": true}` 를 선언하면 동작합니다.
(저장소의 원본에는 넣지 않습니다 — 아티팩트 판에만 붙입니다.)

```html
<script>
/* ==== 아티팩트 전용 — 내려받기 중계 ==== */
(function () {
  var blobs = new Map();
  var mkURL = URL.createObjectURL.bind(URL);
  var rmURL = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var u = mkURL(obj);
    if (obj instanceof Blob) blobs.set(u, obj);
    return u;
  };
  URL.revokeObjectURL = function (u) { blobs.delete(u); return rmURL(u); };
  var pending = null;
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var name = this.getAttribute('download');
    var blob = name ? blobs.get(this.href) : null;
    if (!blob) return click.call(this);
    var a = this;
    if (!pending) {
      pending = (window.claude && window.claude.use)
        ? Promise.resolve(window.claude.use('downloads')).catch(function () { return null; })
        : Promise.resolve(null);
    }
    pending.then(function (d) {
      if (!d) return click.call(a);          // 아티팩트 밖 — 원래대로
      return d.save({ filename: name, data: blob }).catch(function () {});
    });
  };
})();
</script>
```

**확장자가 허용 목록 안이어야 합니다** — `gif png jpg jpeg webp mp4 webm txt
json md docx pptx epub csv ttf html svg pdf xlsx zip`.

---

## 7. U+FFFD 치우기

배포가 `content has U+FFFD` 로 거절될 때 씁니다.

```python
s = open(src, encoding='utf-8').read()
n = s.count('�')
s = s.replace('�', '\\uFFFD')   # 문자열·정규식 어디서든 뜻이 같다
open(out, 'w', encoding='utf-8').write(s)
print('U+FFFD', n, '-> 0')
```

---

## 8. 디자인 기준 (미래에셋)

브랜드 산출물에는 `mas-design` 스킬을 씁니다. 요점만 적으면,

| 항목 | 값 |
|---|---|
| 오렌지 | `#F58220` (강조·섹션 룰·CTA) / 눌림 `#CB6015` / 연함 `#FAB072` |
| 블루 | `#043B72` (링크·수치) |
| 섹션 | 1px 오렌지 룰로 연다 |
| 표 머리 | `#FAB072` 바탕 |
| 모서리 | 4px 이하 |
| 그림자·이모지·그라데이션 | 쓰지 않는다 |
| 한/영 | KO/EN 토글, 선택은 localStorage 에 남긴다 |
| 국내 관행 | 상승 빨강 `#C62828`, 하락 파랑 |

---

## 9. 아티팩트에서 되는 것과 안 되는 것

| 항목 | 되나 |
|---|---|
| 구글 폰트(`fonts.googleapis.com`) | 된다 — `<link>` 가 아니라 `@import` 로 넣는다 |
| cdnjs·jsDelivr 의 **스크립트** | 된다 (정확한 버전 고정) |
| 그 밖의 모든 외부 요청(fetch·XHR·이미지·미디어·iframe) | **안 된다** |
| `<a download>` · Blob 저장 | **안 된다** (6절의 중계 필요) |
| `localStorage` | 된다 (보는 사람 브라우저에만 남는다) |
| 파일 크기 | 16MB 이하 |
| 공개 범위 | 기본 비공개 |

---

## 10. 커밋 메시지 규칙

- 한국어로, **무엇을 왜 바꿨는지** 적습니다. 무엇을 했는지만 적지 않습니다.
- 모델 이름을 커밋·PR·코드 주석에 넣지 않습니다.
- 끝에 다음 두 줄을 답니다.

```
Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: <세션 URL>
```
