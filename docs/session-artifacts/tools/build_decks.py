#!/usr/bin/env python3
# 세션 산출물 PPTX -> 슬라이드 미리보기 + 원본 내려받기 HTML
import json, base64, html, os, zipfile, re

BASE = os.path.dirname(os.path.abspath(__file__))
DECKS = os.path.join(BASE, 'decks')
OUT = os.path.join(BASE, 'pages')
os.makedirs(OUT, exist_ok=True)
data = json.load(open(os.path.join(DECKS, 'decks.json'), encoding='utf-8'))

CSS = """
:root{
  --orange:#F58220; --orange-active:#CB6015; --orange-soft:#FAB072;
  --blue:#043B72; --canvas:#FFFFFF; --soft:#ECEFF4; --subtle:#F7F8FA;
  --hair:#CDCECB; --hair-soft:#E5E4E1; --ink:#1A1A1A; --body:#3D3D3D;
  --muted:#6C6C6C; --muted-soft:#84888B; --err:#C62828;
  --kr:'Noto Sans KR','Spoqa Han Sans Neo','Apple SD Gothic Neo',sans-serif;
  --en:'Inter','Aptos','Segoe UI',system-ui,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--canvas);color:var(--body);
  font-family:var(--kr);font-size:19px;line-height:1.65;
  -webkit-font-smoothing:antialiased}
.page{max-width:1080px;margin:0 auto;padding:0 32px 96px}
@media (max-width:768px){.page{padding:0 20px 64px}body{font-size:17px}}

.tag{display:inline-block;font-family:var(--en);font-size:12px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--orange);
  border:1px solid var(--orange);border-radius:2px;padding:3px 9px}
header.head{padding:56px 0 0}
h1{font-family:var(--kr);font-size:34px;font-weight:700;line-height:1.25;
  letter-spacing:-.3px;color:var(--ink);margin:19px 0 0;text-wrap:balance}
@media (max-width:768px){h1{font-size:26px}}
.sub{font-size:19px;color:var(--muted);margin:14px 0 0;max-width:62ch}
.meta{display:flex;flex-wrap:wrap;gap:0 28px;margin:28px 0 0;
  padding:14px 0;border-top:1px solid var(--hair-soft);border-bottom:1px solid var(--hair-soft)}
.meta div{font-size:14px;color:var(--muted-soft)}
.meta b{display:block;font-family:var(--en);font-size:15px;font-weight:600;
  color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:0}

.note{background:var(--subtle);border-left:2px solid var(--orange);
  border-radius:0 4px 4px 0;padding:19px 24px;margin:38px 0 0;font-size:17px}
.note p{margin:0}
.note p+p{margin-top:10px}

.bar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:28px 0 0}
button.dl{font-family:var(--kr);font-size:17px;font-weight:500;color:#fff;
  background:var(--orange);border:0;border-radius:2px;padding:11px 21px;
  cursor:pointer;line-height:1.3}
button.dl:hover{background:var(--orange-active)}
button.dl:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
button.dl[disabled]{background:var(--hair);color:#fff;cursor:not-allowed}
button.dl .sz{font-family:var(--en);font-size:14px;opacity:.85;margin-left:8px;
  font-variant-numeric:tabular-nums}
.dlmsg{font-size:15px;color:var(--muted);margin:14px 0 0}
.dlmsg.err{color:var(--err)}
code{font-family:var(--en);font-size:.9em;background:var(--soft);
  padding:2px 6px;border-radius:2px;color:var(--ink);word-break:break-all}

section.sec{margin-top:56px}
.rule{height:1px;background:var(--orange)}
h2{font-size:26px;font-weight:600;color:var(--ink);margin:19px 0 0}
@media (max-width:768px){h2{font-size:22px}}
.seccount{font-family:var(--en);font-size:14px;color:var(--muted-soft);
  margin:6px 0 0;font-variant-numeric:tabular-nums}

.slides{display:flex;flex-direction:column;gap:19px;margin-top:28px}
.slide{border:1px solid var(--hair);border-radius:4px;background:var(--canvas);
  padding:24px 28px;display:grid;grid-template-columns:52px 1fr;gap:0 19px}
@media (max-width:768px){.slide{grid-template-columns:1fr;padding:19px}}
.num{font-family:var(--en);font-size:26px;font-weight:700;color:var(--orange-soft);
  line-height:1.1;font-variant-numeric:tabular-nums}
.eyebrow{font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--muted);
  text-transform:none;margin:0 0 6px}
h3{font-size:22px;font-weight:600;color:var(--ink);margin:0;line-height:1.35;
  text-wrap:balance}
@media (max-width:768px){h3{font-size:19px}}
ul.runs{list-style:none;margin:14px 0 0;padding:0;display:flex;
  flex-direction:column;gap:7px}
ul.runs li{font-size:17px;line-height:1.55;color:var(--body);
  padding-left:14px;position:relative;white-space:pre-line}
ul.runs li::before{content:"";position:absolute;left:0;top:.72em;width:5px;
  height:1px;background:var(--hair)}
figure{margin:19px 0 0;border:1px solid var(--hair-soft);border-radius:4px;
  padding:14px;background:var(--subtle);overflow-x:auto}
figure img{display:block;max-width:100%;height:auto;margin:0 auto;background:#fff}
figcaption{font-size:14px;color:var(--muted-soft);margin-top:10px;text-align:center}

footer{margin-top:72px;padding-top:19px;border-top:1px solid var(--hair-soft);
  font-size:14px;color:var(--muted-soft)}
footer p{margin:0}
footer p+p{margin-top:7px}

@media print{
  button.dl,.bar{display:none!important}
  body{font-size:12pt;line-height:1.4}
  .page{max-width:100%;padding:0}
  .slide{page-break-inside:avoid;border-color:#999}
  h2,h3{page-break-after:avoid}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
"""

DL_JS = """
(function(){
  var ns=null, pending=null;
  function b64(s){
    var bin=atob(s), n=bin.length, u=new Uint8Array(n);
    for(var i=0;i<n;i++) u[i]=bin.charCodeAt(i);
    return u;
  }
  function msg(btn,text,isErr){
    var el=btn.parentElement.querySelector('.dlmsg');
    if(!el){el=document.createElement('p');el.className='dlmsg';btn.parentElement.appendChild(el);}
    el.textContent=text; el.className='dlmsg'+(isErr?' err':'');
  }
  async function init(){
    ns = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    document.querySelectorAll('button.dl').forEach(function(btn){
      if(!ns){ btn.disabled=true; msg(btn,'이 화면에서는 원본 내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 파일을 받으세요.',false); return; }
      btn.addEventListener('click', async function(){
        var id=btn.getAttribute('data-file');
        var name=btn.getAttribute('data-name');
        var node=document.getElementById(id);
        if(!node){ msg(btn,'파일 데이터를 찾지 못했습니다.',true); return; }
        btn.disabled=true; msg(btn,'내려받기 확인창을 띄웠습니다.',false);
        try{
          await ns.save({filename:name, data:b64(node.textContent.trim())});
          msg(btn,'저장했습니다.',false);
        }catch(e){
          var c=(e&&e.code)||'unavailable';
          var t = c==='extension_not_enabled' ? 'PPTX·PDF 내려받기가 이 화면에서 허용되지 않습니다. 아래 저장소 경로에서 원본을 받으세요.'
                : c==='declined' ? '내려받기를 취소했습니다.'
                : c==='too_large' ? '파일이 16MB 한도를 넘습니다.'
                : c==='rate_limited' ? '잠시 뒤 다시 눌러 주세요.'
                : '내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 원본을 받으세요.';
          msg(btn,t, c!=='declined');
        }finally{ btn.disabled=false; }
      });
    });
  }
  init();
})();
"""


def esc(s):
    return html.escape(s, quote=False)


def slide_card(i, s, imgmap):
    runs = [r for r in s['runs'] if r.strip()]
    eyebrow, title, rest = '', '', runs
    if runs:
        if len(runs) >= 2 and len(runs[0]) <= 40:
            eyebrow, title, rest = runs[0], runs[1], runs[2:]
        else:
            title, rest = runs[0], runs[1:]
    parts = ['<article class="slide">', '<div class="num">%02d</div>' % i, '<div>']
    if eyebrow:
        parts.append('<p class="eyebrow">%s</p>' % esc(eyebrow))
    parts.append('<h3>%s</h3>' % esc(title))
    if rest:
        parts.append('<ul class="runs">')
        for r in rest:
            parts.append('<li>%s</li>' % esc(r))
        parts.append('</ul>')
    for im in s['imgs']:
        key = os.path.basename(im)
        if key in imgmap:
            parts.append('<figure><img src="data:image/png;base64,%s" alt="슬라이드 %d 차트">'
                         '<figcaption>원본 슬라이드에 실린 차트</figcaption></figure>'
                         % (imgmap[key], i))
    parts.append('</div></article>')
    return '\n'.join(parts)


def build(page_title, tagline, subtitle, metas, notes, deck_keys, downloads,
          repo_lines, outfile, sections):
    imgmap = {}
    mediadir = os.path.join(DECKS, 'media')
    if os.path.isdir(mediadir):
        for f in os.listdir(mediadir):
            imgmap[f] = base64.b64encode(open(os.path.join(mediadir, f), 'rb').read()).decode()

    h = []
    h.append('<title>%s</title>' % esc(page_title))
    h.append('<link rel="preconnect" href="https://fonts.googleapis.com">')
    h.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    h.append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
             'family=Noto+Sans+KR:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap">')
    h.append('<style>%s</style>' % CSS)
    h.append('<div class="page">')
    h.append('<header class="head"><span class="tag">%s</span>' % esc(tagline))
    h.append('<h1>%s</h1>' % esc(page_title))
    h.append('<p class="sub">%s</p>' % esc(subtitle))
    h.append('<div class="meta">')
    for k, v in metas:
        h.append('<div>%s<b>%s</b></div>' % (esc(k), esc(v)))
    h.append('</div>')
    h.append('<div class="note">')
    for n in notes:
        h.append('<p>%s</p>' % n)
    h.append('</div>')
    h.append('<div class="bar">')
    for d in downloads:
        h.append('<button class="dl" data-file="%s" data-name="%s">%s<span class="sz">%s</span></button>'
                 % (d['id'], esc(d['name']), esc(d['label']), d['size']))
    h.append('</div>')
    h.append('</header>')

    for sec, key in zip(sections, deck_keys):
        slides = data[key]
        h.append('<section class="sec"><div class="rule"></div>')
        h.append('<h2>%s</h2>' % esc(sec['title']))
        h.append('<p class="seccount">%s · 슬라이드 %d장</p>' % (esc(sec['note']), len(slides)))
        h.append('<div class="slides">')
        for i, s in enumerate(slides, 1):
            h.append(slide_card(i, s, imgmap))
        h.append('</div></section>')

    h.append('<footer>')
    for line in repo_lines:
        h.append('<p>%s</p>' % line)
    h.append('</footer></div>')

    for d in downloads:
        raw = open(os.path.join(DECKS, d['src']), 'rb').read()
        h.append('<script type="application/octet-stream-base64" id="%s">%s</script>'
                 % (d['id'], base64.b64encode(raw).decode()))
    h.append('<script>%s</script>' % DL_JS)

    open(os.path.join(OUT, outfile), 'w', encoding='utf-8').write('\n'.join(h))
    print(outfile, os.path.getsize(os.path.join(OUT, outfile)) // 1024, 'KB')


def kb(p):
    return '%.0fKB' % (os.path.getsize(os.path.join(DECKS, p)) / 1024)


NOTE_COMMON = (
    '이 페이지는 PPTX 원본에서 <b>슬라이드 텍스트와 차트 이미지를 그대로 추출</b>한 '
    '보관본입니다. 원본의 도형 배치·서식은 재현하지 않으므로, 발표에 쓸 때는 아래 '
    '원본 파일을 내려받아 파워포인트에서 여세요.')

build(
    page_title='반도체 프라이머 2026',
    tagline='사내한 · 검증본',
    subtitle='반도체 산업의 구조·밸류체인·사이클을 30장으로 정리한 교육 자료. '
             '두 세션에 걸쳐 검증 지적을 본문에 반영한 최종본입니다.',
    metas=[('원본', 'semiconductor_primer_2026_1_reviewed.pptx'),
           ('슬라이드', '30장'),
           ('작업 세션', '반도체 자료 검증 및 화면 수정'),
           ('최종 수정', '2026-08-03')],
    notes=[NOTE_COMMON,
           '검증본이 두 판 있습니다. 여기 실린 텍스트는 <b>나중 판(reviewed)</b> 기준이고, '
           'PART 3 에 공급 제약·관세 절이 더 들어가 30장 중 21장이 앞 판과 다릅니다. '
           '두 판 모두 아래에서 내려받을 수 있습니다.'],
    downloads=[
        {'id': 'f-reviewed', 'src': 'deck-primer-reviewed1.pptx',
         'name': 'semiconductor_primer_2026_1_reviewed.pptx',
         'label': '원본 내려받기 · 나중 판', 'size': kb('deck-primer-reviewed1.pptx')},
        {'id': 'f-revised', 'src': 'deck-primer-revised.pptx',
         'name': 'semiconductor_primer_2026_revised.pptx',
         'label': '앞 판 (revised)', 'size': kb('deck-primer-revised.pptx')},
    ],
    deck_keys=['deck-primer-reviewed1.pptx'],
    sections=[{'title': '슬라이드 30장', 'note': '추출 텍스트'}],
    repo_lines=[
        '저장소 경로 — <code>claude/semiconductor-review-ui-fix-jnxc84 : '
        'semiconductor_primer_2026_1_reviewed.pptx</code>',
        '앞 판 — <code>claude/semiconductor-review-ui-fix-i5wfu9 : '
        'semiconductor_primer_2026/semiconductor_primer_2026_revised.pptx</code>',
        '수치는 자료 작성 시점(2026년 8월) 기준입니다.'],
    outfile='deck-primer.html')

build(
    page_title='반도체 고객세미나 7월판',
    tagline='사내한 · 고객 세미나',
    subtitle='2026년 7월 15일 고객 세미나 강의안. 6월 고점 대비 조정의 원인을 분해하고 '
             '삼성전자·SK하이닉스를 집중 분석했습니다.',
    metas=[('원본', '반도체_고객세미나_2026.7.14.pptx'),
           ('슬라이드', '19장 · 차트 9개'),
           ('작업 세션', 'Data update to July 2026'),
           ('최종 수정', '2026-07-14')],
    notes=[NOTE_COMMON,
           '슬라이드에 실린 차트는 원본 이미지를 그대로 옮겼습니다. '
           '주가·목표주가는 2026.7.14 종가 기준입니다.'],
    downloads=[
        {'id': 'f-customer', 'src': 'deck-customer-0714.pptx',
         'name': '반도체_고객세미나_2026.7.14.pptx',
         'label': '원본 내려받기', 'size': kb('deck-customer-0714.pptx')},
    ],
    deck_keys=['deck-customer-0714.pptx'],
    sections=[{'title': '슬라이드 19장', 'note': '추출 텍스트 · 원본 차트 포함'}],
    repo_lines=[
        '저장소 경로 — <code>claude/data-update-july-2026-k1k3se : '
        '반도체_고객세미나_2026.7.14.pptx</code>',
        '본 자료의 주가·실적·목표주가는 2026.7.14 KRX 종가 및 컨센서스 기준입니다.'],
    outfile='deck-customer.html')

build(
    page_title='반도체 투자 세미나 7·29판',
    tagline='사내한 · 고객 세미나',
    subtitle='2026년 7월 29일 고객 세미나 강의안. 급락 뒤 반등 국면과 실적 슈퍼위크를 '
             '앞둔 시점에서 무엇을 볼 것인가를 다뤘습니다.',
    metas=[('원본', '반도체_투자_세미나_20260728.pptx'),
           ('슬라이드', '16장'),
           ('작업 세션', '반도체 세미나 강의안 PPT'),
           ('최종 수정', '2026-07-28')],
    notes=[NOTE_COMMON,
           '같은 강의안의 화면 미리보기 아티팩트가 따로 있습니다. 이 페이지는 '
           '최종 PPTX 원본과 그 전체 텍스트를 담은 보관본입니다.'],
    downloads=[
        {'id': 'f-seminar', 'src': 'deck-seminar-0728.pptx',
         'name': '반도체_투자_세미나_20260728.pptx',
         'label': '원본 내려받기', 'size': kb('deck-seminar-0728.pptx')},
    ],
    deck_keys=['deck-seminar-0728.pptx'],
    sections=[{'title': '슬라이드 16장', 'note': '추출 텍스트'}],
    repo_lines=[
        '저장소 경로 — <code>claude/semiconductor-seminar-ppt-elk4i4 : '
        '반도체_투자_세미나_20260728.pptx</code>',
        '시황 수치는 2026.7.27 KRX 종가 기준입니다.'],
    outfile='deck-seminar.html')
