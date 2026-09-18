#!/usr/bin/env python3
"""변동성 화면 + 자료 + 차트 라이브러리 → 파일 하나로 (인터넷 불필요).

    python3 scripts/make_volatility_offline.py
    python3 scripts/make_volatility_offline.py --out /tmp/보낼판.html

**왜 이런 파일이 필요한가.** 인터넷이 막힌 업무용 PC 에서는 화면이 어떤 길로도
자료를 못 받는다. 옆에 json 을 같이 두는 것도 안 된다 — 브라우저는 file:// 로
열린 쪽이 옆 파일을 fetch 하는 것을 CORS 로 막는다(origin 'null'). 그러니 자료를
HTML 안에 넣어 두는 수밖에 없다.

**하는 일.** `data/volatility/latest.json` 을
`<script id="vol-embedded" type="application/json">` 으로 심고, `vendor/chart.umd.js`
도 함께 넣는다. 화면은 심어 둔 것이 있으면 그것으로 먼저 그리고, 인터넷이 되는
자리에서는 더 새 파일이 오면 그 위에 덮는다.

**주의.** 심어 둔 값은 만든 시점에 고정된다. 위쪽 배지가 기준일을 밝히므로 오래된
판을 오늘 시세로 착각할 일은 없지만, 새 값이 필요하면 다시 만들어 옮겨야 한다.

내보내는 판은 저장소에 남기지 않는다(.gitignore) — 만들 때마다 통째로 바뀌고,
`python3 scripts/make_volatility_offline.py` 한 줄이면 다시 나온다.
"""
import os, sys, json, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = 'docs/volatility/index.html'
DATA = 'data/volatility/latest.json'
VENDOR = 'vendor/chart.umd.js'
OUT = 'volatility-offline.html'
ANCHOR = '<script src="../../vendor/chart.umd.js"></script>'


def main(argv):
    out = OUT
    for i, a in enumerate(argv):
        if a == '--out':
            out = argv[i + 1]

    for p in (PAGE, DATA, VENDOR):
        if not os.path.exists(os.path.join(ROOT, p)):
            raise SystemExit('%s 가 없습니다. 먼저 build_volatility.py 를 돌리십시오.' % p)

    html = open(os.path.join(ROOT, PAGE), encoding='utf-8').read()
    data = open(os.path.join(ROOT, DATA), encoding='utf-8').read()
    chart = open(os.path.join(ROOT, VENDOR), encoding='utf-8').read()

    # </script> 가 자료 안에 들어 있으면 블록이 거기서 끊긴다. 자료는 우리가 만든
    # 것이라 그럴 일이 없지만, 막아 두는 값이 훨씬 싸다.
    data = data.replace('</script>', '<\\/script>')

    if ANCHOR not in html:
        raise SystemExit('화면에서 차트 라이브러리 자리를 찾지 못했습니다 — %s' % ANCHOR)

    block = ('<script id="vol-embedded" type="application/json">' + data + '</script>\n'
             '<script>/* vendor/chart.umd.js — 한 파일 판이라 안에 넣는다 */\n'
             + chart + '\n</script>')
    html = html.replace(ANCHOR, block)

    path = os.path.join(ROOT, out) if not os.path.isabs(out) else out
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)

    d = json.loads(open(os.path.join(ROOT, DATA), encoding='utf-8').read())
    print('· %s (%.1f MB) — %s 기준, 경보 %.0f점 %s'
          % (out, os.path.getsize(path) / 1024 / 1024, d['asof'],
             d['score']['total'], d['score']['grade']))
    print('  두 번 눌러 바로 열립니다. 인터넷이 없어도 됩니다.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
