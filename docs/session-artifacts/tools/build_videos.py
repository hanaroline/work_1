#!/usr/bin/env python3
# 세션 산출물 MP4 -> 재생 + 원본 내려받기 HTML
import base64, html, os

BASE = os.path.dirname(os.path.abspath(__file__))
DECKS = os.path.join(BASE, 'decks')
OUT = os.path.join(BASE, 'pages')
os.makedirs(OUT, exist_ok=True)

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
body{margin:0;background:var(--canvas);color:var(--body);font-family:var(--kr);
  font-size:19px;line-height:1.65;-webkit-font-smoothing:antialiased}
.page{max-width:1080px;margin:0 auto;padding:0 32px 96px}
@media (max-width:768px){.page{padding:0 20px 64px}body{font-size:17px}}
.tag{display:inline-block;font-family:var(--en);font-size:12px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--orange);
  border:1px solid var(--orange);border-radius:2px;padding:3px 9px}
header.head{padding:56px 0 0}
h1{font-size:34px;font-weight:700;line-height:1.25;letter-spacing:-.3px;
  color:var(--ink);margin:19px 0 0;text-wrap:balance}
@media (max-width:768px){h1{font-size:26px}}
.sub{font-size:19px;color:var(--muted);margin:14px 0 0;max-width:62ch}
.meta{display:flex;flex-wrap:wrap;gap:0 28px;margin:28px 0 0;padding:14px 0;
  border-top:1px solid var(--hair-soft);border-bottom:1px solid var(--hair-soft)}
.meta div{font-size:14px;color:var(--muted-soft)}
.meta b{display:block;font-family:var(--en);font-size:15px;font-weight:600;
  color:var(--ink);font-variant-numeric:tabular-nums}
.player{margin:38px 0 0;background:var(--soft);border:1px solid var(--hair-soft);
  border-radius:4px;padding:19px;display:flex;justify-content:center}
video{display:block;max-width:100%;background:#000;border-radius:2px}
video.portrait{max-height:78vh;width:auto}
video.landscape{width:100%;height:auto}
.playmsg{font-size:15px;color:var(--muted);margin:14px 0 0}
.playmsg.err{color:var(--err)}
.bar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:24px 0 0}
button.dl{font-family:var(--kr);font-size:17px;font-weight:500;color:#fff;
  background:var(--orange);border:0;border-radius:2px;padding:11px 21px;cursor:pointer}
button.dl:hover{background:var(--orange-active)}
button.dl:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
button.dl[disabled]{background:var(--hair);cursor:not-allowed}
button.dl .sz{font-family:var(--en);font-size:14px;opacity:.85;margin-left:8px;
  font-variant-numeric:tabular-nums}
.dlmsg{font-size:15px;color:var(--muted);margin:14px 0 0}
.dlmsg.err{color:var(--err)}
.note{background:var(--subtle);border-left:2px solid var(--orange);
  border-radius:0 4px 4px 0;padding:19px 24px;margin:28px 0 0;font-size:17px}
.note p{margin:0}.note p+p{margin-top:10px}
section.sec{margin-top:56px}
.rule{height:1px;background:var(--orange)}
h2{font-size:26px;font-weight:600;color:var(--ink);margin:19px 0 0}
@media (max-width:768px){h2{font-size:22px}}
table{width:100%;border-collapse:collapse;margin-top:24px;
  border:1px solid var(--hair);font-size:17px}
thead th{background:var(--orange-soft);color:var(--ink);font-weight:700;
  font-size:16px;text-align:left;padding:11px 14px;border:1px solid var(--hair)}
tbody td{padding:11px 14px;border:1px solid var(--hair-soft);vertical-align:top}
tbody tr:hover{background:var(--subtle)}
td.ch{font-family:var(--en);font-weight:600;color:var(--blue);
  white-space:nowrap;font-variant-numeric:tabular-nums}
.tablewrap{overflow-x:auto}
ul.plain{margin:19px 0 0;padding:0;list-style:none;display:flex;
  flex-direction:column;gap:9px}
ul.plain li{font-size:17px;padding-left:14px;position:relative}
ul.plain li::before{content:"";position:absolute;left:0;top:.72em;width:5px;
  height:1px;background:var(--hair)}
code{font-family:var(--en);font-size:.9em;background:var(--soft);padding:2px 6px;
  border-radius:2px;color:var(--ink);word-break:break-all}
footer{margin-top:72px;padding-top:19px;border-top:1px solid var(--hair-soft);
  font-size:14px;color:var(--muted-soft)}
footer p{margin:0}footer p+p{margin-top:7px}
@media print{.bar,button.dl,.player{display:none!important}
  body{font-size:12pt;line-height:1.4}.page{max-width:100%;padding:0}
  table{page-break-inside:avoid}h2{page-break-after:avoid}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
"""

JS = """
(function(){
  function bytes(id){
    var node=document.getElementById(id);
    var bin=atob(node.textContent.trim()), n=bin.length, u=new Uint8Array(n);
    for(var i=0;i<n;i++) u[i]=bin.charCodeAt(i);
    return u;
  }
  function msg(sel,text,isErr){
    var el=document.querySelector(sel);
    if(el){el.textContent=text; el.className=el.className.split(' ')[0]+(isErr?' err':'');}
  }
  var vid=document.getElementById('vid');
  var srcId=vid.getAttribute('data-src');
  var data=null;
  try{ data=bytes(srcId); }catch(e){ msg('.playmsg','영상 데이터를 읽지 못했습니다.',true); }
  if(data){
    var url=null;
    try{
      url=URL.createObjectURL(new Blob([data],{type:'video/mp4'}));
      vid.src=url;
    }catch(e){ url=null; }
    vid.addEventListener('error',function(){
      if(vid.getAttribute('data-fallback')==='1'){
        msg('.playmsg','이 화면에서는 영상이 재생되지 않습니다. 아래 원본 내려받기로 받아서 보세요.',true);
        return;
      }
      vid.setAttribute('data-fallback','1');
      var b64=document.getElementById(srcId).textContent.trim();
      vid.src='data:video/mp4;base64,'+b64;
    });
  }
  (async function(){
    var ns = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    var btn=document.querySelector('button.dl');
    if(!btn) return;
    if(!ns){ btn.disabled=true; msg('.dlmsg','이 화면에서는 원본 내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 파일을 받으세요.',false); return; }
    btn.addEventListener('click', async function(){
      if(!data){ msg('.dlmsg','영상 데이터를 읽지 못했습니다.',true); return; }
      btn.disabled=true; msg('.dlmsg','내려받기 확인창을 띄웠습니다.',false);
      try{
        await ns.save({filename:btn.getAttribute('data-name'), data:data});
        msg('.dlmsg','저장했습니다.',false);
      }catch(e){
        var c=(e&&e.code)||'unavailable';
        msg('.dlmsg', c==='declined' ? '내려받기를 취소했습니다.'
          : c==='too_large' ? '파일이 16MB 한도를 넘습니다.'
          : c==='rate_limited' ? '잠시 뒤 다시 눌러 주세요.'
          : '내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 원본을 받으세요.',
          c!=='declined');
      }finally{ btn.disabled=false; }
    });
  })();
})();
"""


def esc(s):
    return html.escape(s, quote=False)


def build(title, tag, sub, metas, notes, orient, src, dl_name, chapters,
          chap_title, chap_head, extras, repo_lines, outfile):
    path = os.path.join(DECKS, src)
    size_mb = '%.1fMB' % (os.path.getsize(path) / 1048576)
    h = ['<title>%s</title>' % esc(title),
         '<link rel="preconnect" href="https://fonts.googleapis.com">',
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Noto+Sans+KR:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap">',
         '<style>%s</style>' % CSS,
         '<div class="page">',
         '<header class="head"><span class="tag">%s</span>' % esc(tag),
         '<h1>%s</h1>' % esc(title),
         '<p class="sub">%s</p>' % esc(sub),
         '<div class="meta">']
    for k, v in metas:
        h.append('<div>%s<b>%s</b></div>' % (esc(k), esc(v)))
    h.append('</div>')
    h.append('<div class="player"><video id="vid" class="%s" data-src="v-data" '
             'controls preload="metadata" playsinline></video></div>' % orient)
    h.append('<p class="playmsg">브라우저에서 바로 재생됩니다. 소리가 있는 영상은 '
             '재생 버튼을 눌러야 소리가 나옵니다.</p>')
    h.append('<div class="bar"><button class="dl" data-name="%s">원본 내려받기'
             '<span class="sz">%s</span></button></div><p class="dlmsg"></p>'
             % (esc(dl_name), size_mb))
    h.append('<div class="note">')
    for n in notes:
        h.append('<p>%s</p>' % n)
    h.append('</div></header>')

    h.append('<section class="sec"><div class="rule"></div><h2>%s</h2>' % esc(chap_title))
    h.append('<div class="tablewrap"><table><thead><tr>')
    for c in chap_head:
        h.append('<th>%s</th>' % esc(c))
    h.append('</tr></thead><tbody>')
    for row in chapters:
        h.append('<tr><td class="ch">%s</td>' % esc(row[0]))
        for cell in row[1:]:
            h.append('<td>%s</td>' % esc(cell))
        h.append('</tr>')
    h.append('</tbody></table></div></section>')

    for sec_title, items in extras:
        h.append('<section class="sec"><div class="rule"></div><h2>%s</h2>' % esc(sec_title))
        h.append('<ul class="plain">')
        for it in items:
            h.append('<li>%s</li>' % it)
        h.append('</ul></section>')

    h.append('<footer>')
    for line in repo_lines:
        h.append('<p>%s</p>' % line)
    h.append('</footer></div>')
    h.append('<script type="application/octet-stream-base64" id="v-data">%s</script>'
             % base64.b64encode(open(path, 'rb').read()).decode())
    h.append('<script>%s</script>' % JS)
    p = os.path.join(OUT, outfile)
    open(p, 'w', encoding='utf-8').write('\n'.join(h))
    print(outfile, os.path.getsize(p) // 1024, 'KB')


build(
    title='부동산 세금 설명 영상',
    tag='사내한 · 교육용',
    sub='부동산을 살 때 · 가질 때 · 팔 때 · 빌려줄 때 단계별로 붙는 세금과 규제를 '
        '캐릭터 대화와 다이어그램으로 설명하는 3분 36초 강의형 영상입니다.',
    metas=[('길이', '3분 36초'), ('규격', '1280×720 · 30fps · H.264'),
           ('소리', '합성 배경음악 (AAC)'), ('기준', '2026년 7월'),
           ('작업 세션', '동영상 제작')],
    notes=['프레임을 파이썬 코드로 그려 인코딩한 영상입니다. 사람 목소리 나레이션은 '
           '제작 환경에서 TTS 서버가 막혀 넣지 못했고, 자막과 배경음악으로 구성했습니다. '
           '나레이션 스크립트는 저장소의 <code>narration_ko.md</code> 에 있습니다.',
           '세금·대출·규제 규칙은 자주 바뀝니다. 교육용 개요이므로 실제 취득·보유·양도·대출 '
           '전에는 최신 법령과 세무·대출 전문가 상담으로 확인해야 합니다.'],
    orient='landscape', src='realestate_tax_guide.mp4',
    dl_name='realestate_tax_guide.mp4',
    chap_title='챕터 구성', chap_head=['챕터', '주제', '핵심'],
    chapters=[
        ('INTRO', '여는 말', '진행자·전문가·매수자 A·B 4인 캐릭터 등장'),
        ('AGENDA', '오늘 다룰 3가지', '살 때 규제 / 낼 때 세금 / 빌릴 때 규칙'),
        ('01', '살 때 · 규제지역·토지거래허가', '규제지역 재확대, 토허구역, 자금조달계획서·전입의무'),
        ('02', '낼 때 · 취득세', '1~3% / 다주택·법인 8~12% 중과, 생애최초 감면'),
        ('03', '빌릴 때 · 대출 규제', 'LTV, 스트레스 DSR 3단계, 6·27 대책 6억 한도'),
        ('04', '가질 때 · 재산세', '6.1 기준일, 공정시장가액비율, 누진세율'),
        ('05', '가질 때 · 종합부동산세', '공제 12억/9억, 세율·중과, 2026 개편 주의'),
        ('06', '팔 때 · 양도소득세', '1주택 비과세 12억, 장특공, 다주택 중과 부활(2026.5.10)'),
        ('07', '빌려줄 때 · 임대소득세', '2천만원 기준 분리/종합과세, 간주임대료'),
        ('SUMMARY', '핵심 요약', '4줄 요약 + 상담 권유'),
    ],
    extras=[('반영한 2026년 주요 변경점', [
        '양도세 다주택 중과 한시 배제 종료(2026.5.9) → 5.10부터 조정지역 다주택 중과(+20~30%p) 부활',
        '규제지역 재확대 — 2025.10 서울 전역·경기 12곳, 2026.7 동탄·기흥·구리 추가',
        '6·27 대책 — 수도권·규제지역 주담대 최대 6억, 6개월 내 전입 의무, 다주택 추가대출 금지',
        '스트레스 DSR 3단계 시행(2025.7)',
        '취득세 다주택 중과 완화안은 미입법 → 현행 8~12% 유지',
    ])],
    repo_lines=['저장소 경로 — <code>claude/video-creation-odmttg : '
                'video/realestate/out/realestate_tax_guide.mp4</code>',
                '생성 코드 — <code>video/realestate/make_realestate_video.py</code>, '
                '<code>engine.py</code>, <code>make_music.py</code>'],
    outfile='video-realestate.html')

build(
    title='AI 투자 트렌드 숏폼',
    tag='사내한 · 숏폼',
    sub='2026년 글로벌 AI 투자 흐름이 인프라 투자에서 수익화로 넘어가는 국면을 '
        '31.7초 세로형 데이터 애니메이션으로 정리했습니다.',
    metas=[('길이', '31.7초'), ('규격', '1080×1920 (9:16) · 30fps · H.264'),
           ('소리', '없음'), ('작업 세션', '동영상 제작')],
    notes=['화면의 수치(1.5조 달러, CAPEX 추이 등)는 트렌드를 설명하기 위한 '
           '<b>예시 데이터</b>이며 특정 기관의 공식 전망치가 아닙니다.',
           '파이썬 한 파일(<code>make_video.py</code>)로 프레임을 그려 MP4 로 인코딩했습니다. '
           '미래에셋 오렌지·블루, 1px 섹션 룰, 하단 진행 바를 적용했습니다.'],
    orient='portrait', src='ai_trends_2026.mp4', dl_name='ai_trends_2026.mp4',
    chap_title='씬 구성', chap_head=['#', '씬', '내용'],
    chapters=[
        ('01', '인트로', '타이틀 · 부제(인프라 → 수익화)'),
        ('02', '빅 스탯', '글로벌 AI 총지출 1.50조 달러 카운트업 · 전년비 +32%'),
        ('03', '막대 차트', '빅테크 AI CAPEX 추이(2023–2026E) 성장 애니메이션'),
        ('04', '라인 차트', 'AI 반도체 시장 전망(2024–2028E) 라인 드로잉'),
        ('05', '핵심 포인트', '2026 3대 포인트 스태거 등장'),
        ('06', '아웃트로', '“규모의 시대에서 수익성의 시대로”'),
    ],
    extras=[],
    repo_lines=['저장소 경로 — <code>claude/video-creation-odmttg : '
                'video/out/ai_trends_2026.mp4</code>',
                '생성 코드 — <code>video/make_video.py</code>'],
    outfile='video-ai-trends.html')
