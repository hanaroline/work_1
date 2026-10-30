#!/usr/bin/env python3
"""해외(미국·일본·중국) 반도체 소부장 맵을 국내 맵을 틀로 지어 낸다.

  semi-supply-chain.html (국내 맵 — 화면 틀·CSS·동작의 원본)
  + tools/semi-global/common.js (세 나라 공통: 공정 칸·테마·문구 틀)
  + tools/semi-global/<cc>.js (나라별 데이터: 기업·설명·문구)
  → semi-<cc>.html

국내 맵의 CSS·마크업·동작 스크립트를 그대로 가져오고, 나라마다 달라야 하는 곳만
아래 PATCHES 로 갈아 끼운다(가격 소수 자리, 배당수익률 칸, 바깥 링크, 칸 수 등).
각 치환은 **정확히 한 번** 맞아야 한다 — 국내 맵이 바뀌어 안 맞으면 멈춘다.

대상 파일에 이미 있는 시세 블록(/*METRICS-BEGIN*/…)과 글꼴 블록(/*FONTS-BEGIN*/…)은
그대로 옮겨 담는다. 그래서 다시 지어도 수집한 값과 넣은 글꼴이 사라지지 않는다.
글꼴 블록이 없으면 Google 글꼴 <link> 를 넣으니, 그다음
`python3 scripts/embed_semi_fonts.py --html semi-<cc>.html` 로 파일 안에 넣는다.

쓰는 법
  python3 scripts/build_semi_global.py            # 세 나라 모두
  python3 scripts/build_semi_global.py us jp      # 고른 나라만
  python3 scripts/build_semi_global.py --check    # 지은 결과가 커밋된 파일과 같은지만

표준 라이브러리만 쓴다.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KR = os.path.join(ROOT, 'semi-supply-chain.html')
DATA_DIR = os.path.join(ROOT, 'tools', 'semi-global')
COUNTRIES = ('us', 'jp', 'cn')
TITLE = {'us': '미국 반도체 소부장 맵', 'jp': '일본 반도체 소부장 맵', 'cn': '중국 반도체 소부장 맵'}

METRICS_RE = re.compile(r'/\*METRICS-BEGIN\*/.*?/\*METRICS-END\*/', re.S)
FONTS_RE = re.compile(r'<style>\n/\*FONTS-BEGIN\*/.*?/\*FONTS-END\*/\n</style>\n', re.S)
EMPTY_METRICS = '/*METRICS-BEGIN*/window.SEMI_METRICS=null;/*METRICS-END*/'
# 현지 표기(일본어 가나·중국어 간체)용 글꼴은 그 나라 파일에만
LOCAL_FONT = {'us': '', 'jp': '&family=Noto+Sans+JP:wght@400', 'cn': '&family=Noto+Sans+SC:wght@400'}
# 현지 표기의 한자를 한국식 자형(Noto Sans KR)이 아니라 그 나라 자형으로 그린다
LOCAL_CSS = {'us': '',
             'jp': ".dh .en{font-family:'Inter','Noto Sans JP',var(--font-kr)}\n",
             'cn': ".dh .en{font-family:'Inter','Noto Sans SC',var(--font-kr)}\n"}


def google_links(cc):
    return ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700'
            '&family=Inter:wght@400;500;600;700%s&display=swap" rel="stylesheet">\n' % LOCAL_FONT[cc])

# (찾을 문자열, 바꿀 문자열) — 동작 스크립트에 적용. 나라별 데이터 파일이 CFG 를 정의한다.
PATCHES = [
    # 가격·EPS·BPS 소수 자리(국내는 원 단위 정수)
    ("const fWon=v=>v==null?DASH:T('won')(fNum(v));",
     "const fWon=v=>v==null?DASH:T('won')(Number(v).toLocaleString(lang==='en'?'en-US':'ko-KR',"
     "{minimumFractionDigits:CFG.pxmin,maximumFractionDigits:CFG.pxd}));"),
    # 외국인 소진율 칸 → 배당수익률(해외 시세 원천에 소진율이 없다)
    ("cell(T('mFrgn'),m.frgn==null?DASH:fNum(m.frgn,2)+'%')",
     "cell(T('mFrgn'),m.dy==null?DASH:fNum(m.dy,2)+'%')"),
    # 상장일 칸 → 나라별 데이터가 정한 칸(기본: 거래 통화)
    ("cell(T('mListed'),esc(m.listed||DASH))",
     "cell(T('mListed'),esc(CFG.slot(m,n)||DASH))"),
    # 문서 제목
    ("document.title=lang==='en'?'Semiconductor Supply Chain Map':'반도체 소부장 맵';",
     "document.title=T('docTitle');"),
    # 바깥 링크(네이버·DART → 나라별)
    ("const links=c.c?`<a class=\"btn\" target=\"_blank\" rel=\"noopener\" href=\"https://finance.naver.com/item/main.naver?code=${c.c}\">${T('naver')}</a>\n"
     "     <a class=\"btn ghost\" target=\"_blank\" rel=\"noopener\" href=\"https://dart.fss.or.kr/dsab007/main.do?option=corp&textCrpNm=${encodeURIComponent(n)}\">${T('dart')}</a>`:'';",
     "const links=c.c?CFG.links(c,n,T,esc):'';"),
    # 상세 창 둘째 줄: 한국어 모드는 영문명 · 현지 표기, 영문 모드는 현지 표기만(국내 맵의 '원어 이름' 자리)
    ("$('#dEn').textContent=lang==='en'?n:c.e;",
     "$('#dEn').textContent=lang==='en'?(c.l&&c.l!==c.e?c.l:''):[c.e,c.l&&c.l!==c.e?c.l:''].filter(Boolean).join(' · ');"),
    # 공정 흐름의 전·후공정 구분선 — 국내는 7칸째 고정, 해외는 단계가 바뀌는 곳
    ("$('#flow').innerHTML=COLS.map((c,i)=>(i===7?",
     "$('#flow').innerHTML=COLS.map((c,i)=>(i&&COLS[i-1].st!==c.st?"),
    # 칸 수가 단계마다 달라 격자 열 수를 단계별로
    ("<div class=\"cols\">${\n    COLS.filter(c=>c.st===s)",
     "<div class=\"cols\" style=\"--n:${COLS.filter(c=>c.st===s).length}\">${\n    COLS.filter(c=>c.st===s)"),
    # 검색에 현지 표기·심볼도 걸리게
    ("const hay=[n,c.e,c.c,",
     "const hay=[n,c.e,c.l,c.y,c.c,"),
    # 언어 기억 키를 나라마다 따로
    ("localStorage.getItem('semi-map-lang')", "localStorage.getItem(CFG.lsKey)"),
    ("localStorage.setItem('semi-map-lang',lang)", "localStorage.setItem(CFG.lsKey,lang)"),
]
CSS_PATCHES = [
    # 일본어·중국어 표기(상세 창 둘째 줄)를 그릴 글꼴
    ("--font-kr:'Spoqa Han Sans Neo','Noto Sans KR',sans-serif;",
     "--font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Noto Sans JP','Noto Sans SC',sans-serif;"),
    (".dh .en{font-family:var(--font-en);",
     ".dh .en{font-family:'Inter',var(--font-kr);"),
    (".cols{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px}",
     ".cols{display:grid;grid-template-columns:repeat(var(--n,7),minmax(0,1fr));gap:10px}"),
]
# 본문의 국내 전용 문구 — 비워 두면 동작 스크립트가 data-i18n 으로 채운다
BODY_PATCHES = [
    (re.compile(r'(<h1 data-i18n="title">)[^<]*(</h1>)'), r'\1\2'),
    (re.compile(r'(<p class="lead" data-i18n="lead">)[^<]*(</p>)'), r'\1\2'),
]


def one(text, old, new, what):
    k = text.count(old)
    if k != 1:
        raise SystemExit('%s: 치환할 자리가 %d곳 — 국내 맵이 바뀌었는지 보십시오:\n  %s' % (what, k, old[:120]))
    return text.replace(old, new)


def parts_from_kr():
    with open(KR, encoding='utf-8') as f:
        kr = f.read()
    styles = re.findall(r'<style>\n(.*?)</style>', kr, re.S)
    css = [s for s in styles if 'FONTS-BEGIN' not in s]
    if len(css) != 1:
        raise SystemExit('국내 맵에서 화면 CSS 블록을 하나로 찾지 못했습니다(%d)' % len(css))
    m = re.search(r'<body>\n(.*?)\n<script>/\*METRICS-BEGIN\*/', kr, re.S)
    if not m:
        raise SystemExit('국내 맵에서 본문 마크업을 찾지 못했습니다')
    body = m.group(1)
    for rx, new in BODY_PATCHES:
        body, k = rx.subn(new, body)
        if k != 1:
            raise SystemExit('본문: 치환할 자리가 %d곳 — 국내 맵이 바뀌었는지 보십시오: %s' % (k, rx.pattern))
    scripts = re.findall(r'<script>\n(.*?)</script>', kr, re.S)
    app = [s for s in scripts if s.startswith('(function(){')]
    if len(app) != 1:
        raise SystemExit('국내 맵에서 동작 스크립트를 하나로 찾지 못했습니다(%d)' % len(app))
    css = css[0]
    for old, new in CSS_PATCHES:
        css = one(css, old, new, 'CSS')
    js = app[0]
    for old, new in PATCHES:
        js = one(js, old, new, '동작 스크립트')
    return css, body, js


def build(cc, css, body, js):
    out_path = os.path.join(ROOT, 'semi-%s.html' % cc)
    data = ''
    for name in ('common.js', '%s.js' % cc):  # 공통 틀 → 나라별 데이터
        with open(os.path.join(DATA_DIR, name), encoding='utf-8') as f:
            data += f.read().rstrip('\n') + '\n'
    old = ''
    if os.path.exists(out_path):
        with open(out_path, encoding='utf-8') as f:
            old = f.read()
    mm = METRICS_RE.search(old)
    metrics = mm.group(0) if mm else EMPTY_METRICS
    fm = FONTS_RE.search(old)
    fonts = fm.group(0) if fm else google_links(cc)
    html = ('<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            '<title>%s</title>\n%s<style>\n%s</style>\n</head>\n<body>\n%s\n'
            '<script>%s</script>\n<script>\n%s</script>\n<script>\n%s</script>\n</body>\n</html>\n'
            % (TITLE[cc], fonts, css + LOCAL_CSS[cc], body, metrics, data, js))
    return out_path, html, old


def main(argv):
    check = '--check' in argv
    pick = [a for a in argv if a in COUNTRIES] or list(COUNTRIES)
    css, body, js = parts_from_kr()
    bad = 0
    for cc in pick:
        path, html, old = build(cc, css, body, js)
        if check:
            same = html == old
            bad += not same
            print('%s: %s' % (os.path.basename(path), '같음' if same else '다름 — 다시 지으십시오'))
            continue
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('%s: %.0fKB%s' % (os.path.basename(path), len(html.encode()) / 1024,
                                '' if FONTS_RE.search(html) else ' (글꼴 아직 안 넣음)'))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
