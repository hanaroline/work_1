# -*- coding: utf-8 -*-
"""브리핑 목록 한 장을 만든다 — `docs/briefings/archive.html`.

**왜 따로 두는가.** 판마다 사이드바에 목록이 실리지만, 그 목록은 그 판을 발행한
시점에 굳는다. 8/19 아티팩트를 열면 8/19 까지밖에 안 보였고, 거기서 오늘 판으로
갈 길이 없었다. 이미 발행한 아티팩트를 스물세 개 다시 올릴 수는 없다.

그래서 **주소가 바뀌지 않는 목록 한 장**을 둔다. 이 아티팩트만 즐겨찾기에 두면
언제 열어도 그날까지의 모든 판이 나온다. 날마다 예약 루틴이 같은 주소에 덮어쓴다.

    python3 scripts/build_archive_page.py            # docs/briefings/archive.html
"""
import datetime
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "docs", "briefings")
INDEX = os.path.join(DIR, "index.json")
OUT = os.path.join(DIR, "archive.html")
KST = datetime.timezone(datetime.timedelta(hours=9))
WD = "월화수목금토일"
SESSION_ORDER = {"morning": 3, "close": 2, "global": 1}
KIND = {"morning": ("모닝 마켓", "Morning"), "close": ("장마감 시황", "Close"),
        "global": ("해외 증시", "Overseas")}


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def main():
    bs = json.load(open(INDEX, encoding="utf-8"))["briefings"]
    bs.sort(key=lambda b: (b["date"], SESSION_ORDER.get(b.get("session"), 0)),
            reverse=True)
    now = datetime.datetime.now(KST)

    # 달별로 묶는다. 스물넉 줄을 한 덩어리로 세우면 어느 주의 것인지 눈에 안 들어온다.
    months, order = {}, []
    for b in bs:
        m = b["date"][:7]
        if m not in months:
            months[m] = []
            order.append(m)
        months[m].append(b)

    rows = []
    for m in order:
        y, mo = int(m[:4]), int(m[5:7])
        rows.append('<h2 class="mon"><span data-lang-ko>%d년 %d월</span>'
                    '<span data-lang-en>%s %d</span> '
                    '<span class="cnt">%d</span></h2>'
                    % (y, mo, datetime.date(y, mo, 1).strftime("%B"), y, len(months[m])))
        rows.append('<ul class="ed">')
        for b in months[m]:
            dt = datetime.date(*map(int, b["date"].split("-")))
            ko, en = KIND.get(b.get("session"), (b.get("label_ko", ""), b.get("label_en", "")))
            d_ko = "%d월 %d일(%s)" % (dt.month, dt.day, WD[dt.weekday()])
            d_en = dt.strftime("%-d %b, %a")
            inner = ('<span class="d"><span data-lang-ko>%s</span>'
                     '<span data-lang-en>%s</span></span>'
                     '<span class="k"><span data-lang-ko>%s</span>'
                     '<span data-lang-en>%s</span></span>'
                     % (d_ko, esc(d_en), esc(ko), esc(en)))
            if b.get("url"):
                rows.append('  <li><a href="%s" target="_blank" rel="noopener">%s</a></li>'
                            % (esc(b["url"]), inner))
            else:
                rows.append('  <li class="na">%s<span class="no">'
                            '<span data-lang-ko>보관본 없음</span>'
                            '<span data-lang-en>no hosted copy</span></span></li>' % inner)
        rows.append('</ul>')

    live = len([b for b in bs if b.get("url")])
    html = TPL % {
        "n": len(bs), "live": live, "months": len(order),
        "first": bs[-1]["date"], "last": bs[0]["date"],
        "stamp_ko": "%d년 %d월 %d일(%s) %s KST"
                    % (now.year, now.month, now.day, WD[now.weekday()],
                       now.strftime("%H:%M")),
        "stamp_en": now.strftime("%H:%M KST, %A %-d %B %Y"),
        "rows": "\n".join(rows),
    }
    open(OUT, "w", encoding="utf-8").write(html)
    print("만듦: %s (판 %d개 · 링크 %d개 · %d개월)" % (OUT, len(bs), live, len(order)))


TPL = '''<title data-en="Briefing Archive | Mirae Asset Securities Mapo WM">브리핑 목록 | 미래에셋증권 마포WM</title>
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
  --primary:#F58220; --primary-active:#CB6015; --secondary:#043B72;
  --canvas:#FFFFFF; --card:#FFFFFF; --surface-subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted-soft:#84888B;
  --on-primary:#FFFFFF;
  --font-kr:'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',system-ui,sans-serif;
  --font-en:'Aptos','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --primary:#FF9A4A; --primary-active:#FFB169; --secondary:#82B7EA;
  --canvas:#15171B; --card:#1A1E25; --surface-subtle:#1B1F26;
  --hairline:#3A414C; --hairline-soft:#2A303A;
  --ink:#F1F3F6; --body:#CDD3DB; --muted:#98A0AB; --muted-soft:#7F8794;
  --on-primary:#241206;
}}
:root[data-theme="dark"]{
  --primary:#FF9A4A; --primary-active:#FFB169; --secondary:#82B7EA;
  --canvas:#15171B; --card:#1A1E25; --surface-subtle:#1B1F26;
  --hairline:#3A414C; --hairline-soft:#2A303A;
  --ink:#F1F3F6; --body:#CDD3DB; --muted:#98A0AB; --muted-soft:#7F8794;
  --on-primary:#241206;
}
body{margin:0;background:var(--canvas);color:var(--body);font-family:var(--font-kr);
  font-size:19px;line-height:1.65;font-variant-numeric:tabular-nums}
html[lang="en"] body{font-family:var(--font-en)}
.page{max-width:960px;margin:0 auto;padding:0 32px 72px}
@media (max-width:768px){ .page{padding:0 20px 56px} }
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:19px;padding-top:24px}
.chip{display:inline-block;font-size:14px;letter-spacing:.6px;font-weight:500;color:var(--muted);
  border:1px solid var(--hairline);padding:4px 10px;border-radius:2px}
.lang-toggle{display:inline-flex;border:1px solid var(--hairline);border-radius:2px;
  overflow:hidden;background:var(--card);flex:none}
.lang-toggle button{font-family:var(--font-en);font-size:14px;font-weight:500;letter-spacing:.5px;
  padding:10px 17px;border:0;background:var(--card);color:var(--muted);cursor:pointer;line-height:1}
.lang-toggle button + button{border-left:1px solid var(--hairline)}
.lang-toggle button[aria-checked="true"]{background:var(--primary);color:var(--on-primary)}
.hero{background:var(--primary);color:#FFFFFF;margin:24px -32px 0;padding:48px 32px 40px}
@media (max-width:768px){ .hero{margin:24px -20px 0;padding:36px 20px 30px} }
.hero h1{font-size:48px;font-weight:700;line-height:1.1;letter-spacing:-.5px;margin:0 0 12px}
@media (max-width:768px){ .hero h1{font-size:34px} }
.hero p{font-size:19px;line-height:1.55;margin:0;max-width:60ch;color:rgba(255,255,255,.92)}
.facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;
  background:var(--hairline);border:1px solid var(--hairline);margin-top:38px}
@media (max-width:560px){ .facts{grid-template-columns:minmax(0,1fr)} }
.fact{background:var(--card);padding:20px}
.fact .l{font-size:15px;font-weight:500;letter-spacing:.6px;color:var(--muted);margin:0 0 8px}
.fact .v{font-size:32px;font-weight:700;line-height:1;color:var(--ink);margin:0}
.fact .s{font-size:14px;color:var(--muted-soft);margin:8px 0 0}
.mon{font-size:22px;font-weight:600;color:var(--ink);margin:48px 0 0;padding-bottom:10px;
  border-bottom:1px solid var(--primary)}
.mon .cnt{font-size:15px;font-weight:400;color:var(--muted-soft);margin-left:8px}
ul.ed{list-style:none;margin:0;padding:0}
ul.ed li{border-bottom:1px solid var(--hairline-soft)}
ul.ed a,ul.ed li.na{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;
  padding:14px 12px;color:var(--body);text-decoration:none;border:0}
ul.ed a:hover{background:var(--surface-subtle);color:var(--primary-active)}
ul.ed a:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
ul.ed .d{font-weight:700;color:var(--ink);min-width:9.5em}
ul.ed a:hover .d{color:var(--primary-active)}
ul.ed .k{font-size:16px;color:var(--muted)}
ul.ed li.na{color:var(--muted-soft)}
ul.ed li.na .d{color:var(--muted-soft)}
ul.ed .no{font-size:14px;color:var(--muted-soft)}
.foot{margin-top:56px;padding-top:19px;border-top:1px solid var(--hairline);
  font-size:14px;line-height:1.6;color:var(--muted-soft)}
.foot p{margin:0 0 8px}
[data-lang-en]{display:none}
html[lang="en"] [data-lang-ko]{display:none}
html[lang="en"] [data-lang-en]{display:revert}
@media print{ .lang-toggle{display:none!important} ul.ed li{break-inside:avoid} }
</style>

<div class="page">
<div class="top">
  <span class="chip">[사내한]</span>
  <div class="lang-toggle" role="radiogroup" aria-label="언어">
    <button type="button" data-lang="ko" role="radio" aria-checked="true">KO</button>
    <button type="button" data-lang="en" role="radio" aria-checked="false">EN</button>
  </div>
</div>

<div class="hero">
  <h1><span data-lang-ko>브리핑 목록</span><span data-lang-en>Briefing Archive</span></h1>
  <p><span data-lang-ko>미래에셋증권 마포WM 이 펴낸 시황 브리핑 전부입니다.
    이 주소는 바뀌지 않고, 새 판이 나올 때마다 여기에 더해집니다.</span>
    <span data-lang-en>Every market briefing published by Mirae Asset Securities Mapo WM.
    This address does not change; each new edition is added here.</span></p>
</div>

<div class="facts">
  <div class="fact">
    <p class="l"><span data-lang-ko>펴낸 판</span><span data-lang-en>Editions</span></p>
    <p class="v">%(n)d</p>
    <p class="s"><span data-lang-ko>%(first)s 부터</span><span data-lang-en>since %(first)s</span></p>
  </div>
  <div class="fact">
    <p class="l"><span data-lang-ko>열리는 링크</span><span data-lang-en>Live links</span></p>
    <p class="v">%(live)d</p>
    <p class="s"><span data-lang-ko>%(months)d 개월치</span><span data-lang-en>across %(months)d months</span></p>
  </div>
  <div class="fact">
    <p class="l"><span data-lang-ko>가장 새 판</span><span data-lang-en>Latest</span></p>
    <p class="v">%(last)s</p>
    <p class="s"><span data-lang-ko>목록 갱신 %(stamp_ko)s</span>
      <span data-lang-en>list rebuilt %(stamp_en)s</span></p>
  </div>
</div>

%(rows)s

<div class="foot">
  <p><span data-lang-ko>각 줄을 누르면 그날 판이 새 창에서 열립니다. 판 안의 왼쪽 목차 아래에도
    같은 목록이 있습니다.</span>
    <span data-lang-en>Each row opens that edition in a new tab. The same list sits below the
    contents in each edition&rsquo;s left-hand column.</span></p>
  <p><span data-lang-ko>내부 참고용입니다. 특정 종목의 매매를 권유하지 않으며, 투자 판단의 최종
    책임은 투자자 본인에게 있습니다.</span>
    <span data-lang-en>An internal reference. It does not recommend the purchase or sale of any
    security; investment decisions and their consequences rest with the investor.</span></p>
</div>
</div>

<script>
(function () {
  var root = document.documentElement, KEY = 'mas-briefing-lang';
  var tEl = document.querySelector('title');
  var T_KO = tEl ? tEl.textContent : document.title;
  var T_EN = (tEl && tEl.getAttribute('data-en')) || T_KO;
  function applyLang(lang) {
    root.setAttribute('lang', lang);
    var b = document.querySelectorAll('.lang-toggle button');
    for (var i = 0; i < b.length; i++) {
      b[i].setAttribute('aria-checked', b[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    document.title = (lang === 'ko') ? T_KO : T_EN;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  applyLang(saved === 'en' ? 'en' : 'ko');
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lang-toggle button') : null;
    if (b) applyLang(b.getAttribute('data-lang'));
  });
})();
</script>
'''

if __name__ == "__main__":
    main()
