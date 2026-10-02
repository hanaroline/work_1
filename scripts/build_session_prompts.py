#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""세션별 '새 계정용 프롬프트' 묶음을 만든다.

왜 있는가
    Claude Code 세션의 대화 기록은 계정에 묶여 있어 계정을 옮기면 볼 수 없다.
    세션마다 무엇을 했고, 새 계정에서 같은 일을 이어받으려면 첫 메시지로 무엇을
    붙여 넣어야 하는지를 docs/handover/session-prompts.json 에 떠 두고,
    이 스크립트로 사람이 받아 갈 세 가지 꼴을 만든다.

        docs/handover/세션별-프롬프트.md    저장소 안에서 읽는 판
        docs/handover/세션별-프롬프트.html  검색·분류·복사 단추가 있는 단일 파일
        docs/handover/세션별-프롬프트.txt   저장소 밖(메모장)에서 보는 판

쓰는 법
    python3 scripts/build_session_prompts.py            # 다시 만든다
    python3 scripts/build_session_prompts.py --check    # 안 쓰고 어긋남만 알린다

표준 라이브러리만 쓴다(CLAUDE.md 규칙).
"""
import argparse
import html
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HO = os.path.join(ROOT, 'docs', 'handover')
SRC = os.path.join(HO, 'session-prompts.json')
OUT_MD = os.path.join(HO, '세션별-프롬프트.md')
OUT_HTML = os.path.join(HO, '세션별-프롬프트.html')
OUT_TXT = os.path.join(HO, '세션별-프롬프트.txt')

CATS = ['인계·계정·운영', '시황·브리핑', '증권사 리포트', '캘린더·일정', '기업 대시보드',
        'ETF·펀드·ELS 조회', '매매 신호·모델', '고객 제안서·상품', '완전판매·스크립트',
        '자료 검증', '웹·배포·기타 도구', '시험·잡담']
STATUS_ORDER = ['운영중', '완료', '중단·미완', '시험·잡담']

BOOT = ('저장소 hanaroline/work_1 의 CLAUDE.md 와 docs/handover/00-저장소-전체-인계.md 를 먼저 읽어줘.\n'
        '그다음 docs/handover/세션별-프롬프트.md 에서 「{title}」 항목을 찾아 그 프롬프트대로 이어서 해줘.')


def load():
    data = json.load(open(SRC, encoding='utf-8'))
    meta = data['meta']
    rows = data['sessions']
    rows.sort(key=lambda r: (CATS.index(r['category']) if r['category'] in CATS else len(CATS),
                             -int(r['created'][:10].replace('-', ''))))
    return meta, rows


def groups(rows):
    seen = []
    for r in rows:
        if r['category'] not in seen:
            seen.append(r['category'])
    return [(c, [r for r in rows if r['category'] == c]) for c in seen]


def fence(text):
    # 프롬프트 안에 ``` 가 있어도 깨지지 않게 더 긴 울타리를 쓴다.
    n = 3
    while '`' * n in text:
        n += 1
    return '`' * n


def build_md(meta, rows):
    o = []
    o.append('# 세션별 프롬프트 — 새 계정에서 바로 이어 쓰기\n')
    o.append(f'만든 날 {meta["generated"]} · 세션 {len(rows)}건 · 원천 `docs/handover/session-prompts.json`\n')
    o.append('이 파일은 `python3 scripts/build_session_prompts.py` 가 만듭니다. **손으로 고치지 말고** JSON 을 고친 뒤 다시 돌리십시오.\n')
    o.append('## 쓰는 법\n')
    o.append('1. 새 계정의 Claude Code 에서 저장소 `hanaroline/work_1` 을 고르고 새 세션을 엽니다.')
    o.append('2. 아래에서 이어 갈 세션을 찾아 **「새 계정 프롬프트」** 칸을 통째로 복사해 첫 메시지로 붙여 넣습니다.')
    o.append('3. 이어서 할 일이 정해져 있으면 「후속 프롬프트」 중 하나를 그다음 메시지로 보냅니다.')
    o.append('4. 세션 ID 는 **옛 계정 것**이라 새 계정에서는 열리지 않습니다(기록용). 가지는 GitHub 에 있어 그대로 쓸 수 있습니다.')
    o.append('5. 쓰기 전에 **[세션별-프롬프트-유의사항.txt](세션별-프롬프트-유의사항.txt)**(·`.html`)을 먼저 보십시오 — 가지·예약·공개 저장소 주의가 있습니다.\n')
    o.append('## 목차\n')
    o.append('| # | 분류 | 세션 | 날짜 | 상태 |')
    o.append('|---|---|---|---|---|')
    i = 0
    for c, rs in groups(rows):
        for r in rs:
            i += 1
            o.append(f'| {i} | {c} | [{r["title"]}](#s{i}) | {r["created"][:10]} | {r["status"]} |')
    o.append('')
    i = 0
    for c, rs in groups(rows):
        o.append(f'---\n\n## {c}\n')
        for r in rs:
            i += 1
            o.append(f'<a id="s{i}"></a>\n### {i}. {r["title"]}\n')
            o.append(f'- 날짜 {r["created"][:10]} · 상태 **{r["status"]}** · 가지 `{r["branch"] or "-"}` · 세션 `{r["id"]}`')
            o.append(f'- {r["summary"]}')
            if r.get('outputs'):
                o.append('- 산출물: ' + ', '.join(f'`{x}`' for x in r['outputs']))
            if r.get('notes'):
                o.append(f'- 주의: {r["notes"]}')
            o.append('')
            f = fence(r['prompt'])
            o.append('**새 계정 프롬프트**\n')
            o.append(f'{f}text\n{r["prompt"]}\n{f}\n')
            if r.get('followups'):
                o.append('**후속 프롬프트**\n')
                for x in r['followups']:
                    f = fence(x)
                    o.append(f'{f}text\n{x}\n{f}')
                o.append('')
            if r.get('requests'):
                o.append('<details><summary>옛 세션에서 실제로 보낸 요청</summary>\n')
                for x in r['requests']:
                    o.append('- ' + x.replace('\n', ' ').strip())
                o.append('\n</details>\n')
    return '\n'.join(o) + '\n'


def build_txt(meta, rows):
    L = '=' * 78
    S = '-' * 78
    o = [L, '세션별 프롬프트 — 새 계정에서 바로 이어 쓰기',
         f'만든 날 {meta["generated"]} · 세션 {len(rows)}건 · 저장소 hanaroline/work_1', L, '',
         '쓰는 법: 새 계정 Claude Code 에서 저장소 hanaroline/work_1 로 새 세션을 열고,',
         '아래 [새 계정 프롬프트] 블록을 통째로 첫 메시지에 붙여 넣으십시오.',
         '세션 ID 는 옛 계정 기록용입니다(가지는 GitHub 에 있어 그대로 씁니다).',
         '쓰기 전에 세션별-프롬프트-유의사항.txt 를 먼저 보십시오.', '']
    i = 0
    for c, rs in groups(rows):
        o += ['', L, f'■ {c}', L]
        for r in rs:
            i += 1
            o += ['', S, f'{i}. {r["title"]}   ({r["created"][:10]} · {r["status"]})', S,
                  f'세션 {r["id"]} · 가지 {r["branch"] or "-"}', f'요약: {r["summary"]}']
            if r.get('outputs'):
                o.append('산출물: ' + ', '.join(r['outputs']))
            if r.get('notes'):
                o.append(f'주의: {r["notes"]}')
            o += ['', '[새 계정 프롬프트] ▼▼▼', r['prompt'], '▲▲▲']
            for x in r.get('followups') or []:
                o += ['', '[후속]', x]
    return '\n'.join(o) + '\n'


CSS = """
:root{--bg:#f7f7f5;--card:#fff;--fg:#1d1d1f;--muted:#6b6b70;--line:#e3e3e0;--acc:#f58220;--acc2:#043b72;--code:#f2f2ef}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141416;--card:#1d1d20;--fg:#ececee;--muted:#a0a0a8;--line:#2e2e33;--acc:#ff9a45;--acc2:#7fb2ff;--code:#26262a}}
:root[data-theme="dark"]{--bg:#141416;--card:#1d1d20;--fg:#ececee;--muted:#a0a0a8;--line:#2e2e33;--acc:#ff9a45;--acc2:#7fb2ff;--code:#26262a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 16px}
.wrap{max-width:980px;margin:0 auto}h1{font-size:20px;margin:0 0 4px}.sub{color:var(--muted);font-size:13px}
.bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
input,select,button{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px}
input{flex:1 1 220px;min-width:0}button{cursor:pointer}button:hover{border-color:var(--acc)}
main{padding:12px 16px 60px}.how{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-size:14px}
h2{font-size:16px;color:var(--acc2);margin:26px 0 8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0}
.t{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.t b{font-size:15.5px}
.pill{font-size:12px;border-radius:99px;padding:1px 8px;border:1px solid var(--line);color:var(--muted)}
.pill.운영중{border-color:var(--acc);color:var(--acc)}
.meta{font-size:12px;color:var(--muted);word-break:break-all}.sum{margin:6px 0}
pre{background:var(--code);border-radius:8px;padding:10px 12px;white-space:pre-wrap;word-break:break-word;margin:6px 0;font:13px/1.55 ui-monospace,Consolas,monospace}
.lbl{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;margin-top:8px}
.lbl button{font-size:12px;padding:2px 10px}details{font-size:13px;color:var(--muted);margin-top:6px}
.note{font-size:13px;color:var(--muted)}.hide{display:none}
.card,.note,.sum,li,.t b{overflow-wrap:anywhere}
"""

JS = """
const q=document.getElementById('q'),cat=document.getElementById('cat'),st=document.getElementById('st'),cnt=document.getElementById('cnt');
function f(){const s=q.value.trim().toLowerCase();let n=0;
document.querySelectorAll('.card').forEach(c=>{const ok=(!s||c.textContent.toLowerCase().includes(s))&&(!cat.value||c.dataset.cat===cat.value)&&(!st.value||c.dataset.st===st.value);c.classList.toggle('hide',!ok);if(ok)n++});
document.querySelectorAll('section').forEach(x=>x.classList.toggle('hide',!x.querySelector('.card:not(.hide)')));cnt.textContent=n+'건'}
[q,cat,st].forEach(e=>e.addEventListener('input',f));
document.addEventListener('click',e=>{const b=e.target.closest('button[data-copy]');if(!b)return;
const t=document.getElementById(b.dataset.copy).textContent;const done=()=>{const o=b.textContent;b.textContent='복사됨';setTimeout(()=>b.textContent=o,1200)};
if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,()=>fb(t,done));else fb(t,done)});
function fb(t,done){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done()}catch(e){}a.remove()}
document.getElementById('dl').addEventListener('click',()=>{const t=document.getElementById('alltxt').textContent;
const u=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='세션별-프롬프트.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
document.getElementById('th').addEventListener('click',()=>{const r=document.documentElement;const d=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);r.dataset.theme=d?'light':'dark'});
f();
"""


def build_html(meta, rows, txt):
    e = html.escape
    o = ['<!doctype html><html lang="ko"><head><meta charset="utf-8">',
         '<meta name="viewport" content="width=device-width,initial-scale=1">',
         '<title>세션별 프롬프트</title><style>' + CSS + '</style></head><body>',
         '<header><div class="wrap"><h1>세션별 프롬프트 — 새 계정에서 바로 이어 쓰기</h1>',
         f'<div class="sub">만든 날 {e(meta["generated"])} · 세션 {len(rows)}건 · 저장소 hanaroline/work_1</div>',
         '<div class="bar"><input id="q" type="search" placeholder="검색 (제목·요약·프롬프트)">',
         '<select id="cat"><option value="">분류 전체</option>']
    for c, _ in groups(rows):
        o.append(f'<option>{e(c)}</option>')
    o.append('</select><select id="st"><option value="">상태 전체</option>')
    for s in STATUS_ORDER:
        o.append(f'<option>{e(s)}</option>')
    o.append('</select><span class="sub" id="cnt" style="align-self:center"></span>'
             '<button id="dl">전체 .txt 받기</button><button id="th">밝게/어둡게</button></div></div></header>')
    o.append('<main><div class="wrap"><div class="how">새 계정 Claude Code 에서 저장소 <b>hanaroline/work_1</b> 로 새 세션을 열고, '
             '이어 갈 항목의 <b>「새 계정 프롬프트」</b>를 복사해 첫 메시지로 붙여 넣으십시오. '
             '세션 ID 는 옛 계정 기록용이라 새 계정에서는 열리지 않습니다(가지는 GitHub 에 있어 그대로 씁니다). '
             '쓰기 전에 <b>세션별-프롬프트-유의사항</b> 파일을 먼저 보십시오.</div>')
    i = 0
    for c, rs in groups(rows):
        o.append(f'<section><h2>{e(c)} <span class="sub">{len(rs)}건</span></h2>')
        for r in rs:
            i += 1
            o.append(f'<div class="card" data-cat="{e(c)}" data-st="{e(r["status"])}">')
            o.append(f'<div class="t"><b>{i}. {e(r["title"])}</b><span class="pill {e(r["status"])}">{e(r["status"])}</span>'
                     f'<span class="meta">{e(r["created"][:10])}</span></div>')
            o.append(f'<div class="meta">세션 {e(r["id"])} · 가지 {e(r["branch"] or "-")}</div>')
            o.append(f'<div class="sum">{e(r["summary"])}</div>')
            if r.get('outputs'):
                o.append('<div class="note">산출물: ' + ', '.join(e(x) for x in r['outputs']) + '</div>')
            if r.get('notes'):
                o.append(f'<div class="note">주의: {e(r["notes"])}</div>')
            o.append(f'<div class="lbl">새 계정 프롬프트<button data-copy="p{i}">복사</button></div><pre id="p{i}">{e(r["prompt"])}</pre>')
            for j, x in enumerate(r.get('followups') or []):
                o.append(f'<div class="lbl">후속 {j+1}<button data-copy="p{i}f{j}">복사</button></div><pre id="p{i}f{j}">{e(x)}</pre>')
            if r.get('requests'):
                o.append('<details><summary>옛 세션에서 실제로 보낸 요청</summary><ul>' +
                         ''.join(f'<li>{e(x)}</li>' for x in r['requests']) + '</ul></details>')
            o.append('</div>')
        o.append('</section>')
    o.append(f'</div></main><script type="text/plain" id="alltxt">{e(txt)}</script><script>{JS}</script></body></html>')
    return '\n'.join(o)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    meta, rows = load()
    for r in rows:
        for k in ('id', 'title', 'category', 'status', 'summary', 'prompt', 'created'):
            if not r.get(k):
                sys.exit(f'{r.get("id")}: {k} 비어 있음')
    txt = build_txt(meta, rows)
    outs = {OUT_MD: build_md(meta, rows), OUT_TXT: txt, OUT_HTML: build_html(meta, rows, txt)}
    bad = 0
    for p, s in outs.items():
        old = open(p, encoding='utf-8').read() if os.path.exists(p) else None
        if a.check:
            if old != s:
                print('어긋남:', os.path.relpath(p, ROOT)); bad = 1
        else:
            open(p, 'w', encoding='utf-8').write(s)
            print('썼음:', os.path.relpath(p, ROOT), f'{len(s):,}자')
    sys.exit(bad)


if __name__ == '__main__':
    main()
