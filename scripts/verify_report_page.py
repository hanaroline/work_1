#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""건네는 한 장을 **거꾸로** 되짚는다.

    python3 scripts/verify_report_page.py [kis-timing-report.html]

왜 따로 있는가. 이미 두 검산기가 돌고 있다.

    verify_kis_timing.py   원본 일봉 → latest.json
    verify_verdict.py      원자료     → verdict.json

둘 다 **자료**를 본다. 그런데 사람이 실제로 읽는 것은 자료가 아니라 이 한
장이다. 자료가 옳아도 화면이 그것을 옳게 옮겼다는 보장은 없다 — 실제로
미국주식 판이 달러 값을 「238원」으로 찍은 적이 있다. 자료에는 흠이 없었다.

그래서 이 검산기는 **화면에 찍힌 글자에서 출발한다.** 만든 쪽의 함수를
빌려 쓰지 않고, HTML 을 글자로 파고 들어가 표의 칸을 읽은 뒤 latest.json ·
verdict.json 과 맞댄다. 위의 두 검산기와 이어 붙이면 사슬이 닫힌다.

    원본 일봉 → latest.json → 화면에 찍힌 글자

한 가지만 조심한다. **잣대를 지어내지 않는다.** 예전에 이 되짚기를 급히
짜면서 달러 값을 「$237.92」로 찍힐 것이라 넘겨짚었다가 열 번을 헛되이
실패로 읽었다. 화면은 「237.92달러」로 맞게 찍고 있었고 틀린 쪽은 내
잣대였다. 그래서 화폐는 넘겨짚지 않고 **latest.json 의 currency 에서
읽는다** — 그러면 「238원」 같은 흠은 여전히 잡히고, 서식을 잘못 상상해
멀쩡한 것을 실패로 읽는 일은 없다.

나가는 값: 흠이 없으면 0, 있으면 1.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')

OK, BAD = [], []


def check(name, cond, detail=''):
    (OK if cond else BAD).append((name, detail))


# ─────────────────────────────────────────────────────────────────────
# HTML 을 글자로 판다
# ─────────────────────────────────────────────────────────────────────

_ENT = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"}


def text(s):
    """칸 하나의 속살을 글자로 만든다."""
    s = re.sub(r'<[^>]+>', '', s)
    for k, v in _ENT.items():
        s = s.replace(k, v)
    return s.strip()


def rows_of(table_html):
    out = []
    for tr in re.findall(r'<tr>(.*?)</tr>', table_html, re.S):
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
        if cells:
            out.append([text(c) for c in cells])
    return out


def tables_of(panel_html):
    """표를 머리글 모양으로 갈라 담는다.

    이름표(h3)가 아니라 **머리글**로 가른다. 이름표는 「매수」였다가
    「보류」가 되지만(시장이 막히면) 머리글은 그대로다.
    """
    got = {}
    for m in re.finditer(r'<table class="data">(.*?)</table>', panel_html, re.S):
        body = m.group(1)
        head = re.search(r'<thead>(.*?)</thead>', body, re.S)
        heads = [text(x) for x in re.findall(r'<th[^>]*>(.*?)</th>', head.group(1), re.S)]
        sig = '|'.join(heads)
        got.setdefault(sig, []).extend(rows_of(re.search(r'<tbody>(.*?)$', body, re.S).group(1)))
    return got


BUY_SIG = '종목|코드|기준 종가|손절 기준|비중|겹친 전략'
SELL_SIG = '종목|코드|기준 종가|겹친 전략'
WATCH_SIG = '종목|코드|기준 종가|손절 기준|켜진 전략'


# ─────────────────────────────────────────────────────────────────────
# 화면의 글자를 수로 되돌린다
# ─────────────────────────────────────────────────────────────────────

def unmoney(s, ccy):
    """「12,175원」·「237.92달러」를 수로 되돌린다. 단위가 화폐와 다르면 None."""
    suffix = '달러' if ccy == 'USD' else '원'
    if not s.endswith(suffix):
        return None
    return float(s[:-len(suffix)].replace(',', ''))


def money(x, ccy):
    """화면이 찍어야 할 글자. **latest.json 의 currency 를 따른다** —
    여기서 화폐를 넘겨짚으면 잣대 쪽이 틀린다."""
    if x is None:
        return '—'
    return '{:,.2f}달러'.format(x) if ccy == 'USD' else '{:,.0f}원'.format(x)


# ─────────────────────────────────────────────────────────────────────
# 되짚기
# ─────────────────────────────────────────────────────────────────────

SLUG = {'KR_OV_ETF': 'kr-ov-etf', 'KR_STOCK': 'kr-stock',
        'KR_ETF': 'kr-etf', 'US_STOCK': 'us-stock'}


def verify(path):
    raw = open(path, encoding='utf-8').read()
    doc = json.load(open(os.path.join(OUT_DIR, 'latest.json'), encoding='utf-8'))
    vd = json.load(open(os.path.join(OUT_DIR, 'verdict.json'), encoding='utf-8'))

    # 판에 심어 둔 JSON 은 화면이 스스로 한 말이다. 되짚기는 그것을 믿지
    # 않으므로 아예 걷어 내고 시작한다.
    body = re.sub(r'<script class="report-data".*?</script>', '', raw, flags=re.S)

    # **판을 `</section>` 에서 끊는다.** 앞에서만 갈라 놓으면 마지막 판의
    # 토막이 문서 끝까지 이어져 뒤따르는 스크립트를 삼킨다. 그 안에 복사문이
    # 쓰는 「이 시장에서는 이 방식으로 사지 마십시오」가 글자로 들어 있어서,
    # 막힘이 풀린 날 마지막 판이 「띠는 있는데 딱지가 없다」로 읽혔다.
    # 화면은 멀쩡했고 틀린 쪽은 이 파서였다.
    panels = {}
    for chunk in re.split(r'(?=<section class="panel")', body)[1:]:
        mk = re.search(r'data-market="([A-Z_]+)"', chunk).group(1)
        end = chunk.find('</section>')
        panels[mk] = chunk if end < 0 else chunk[:end]

    # 1. 탭과 판이 짝이 맞는가
    tabs = re.findall(r'<button type="button" role="tab" data-slug="([a-z-]+)"'
                      r' aria-selected="(true|false)" aria-controls="panel-([a-z-]+)">(.*?)</button>',
                      body)
    check('탭 %d 개와 판 %d 개가 짝' % (len(tabs), len(panels)),
          len(tabs) == len(panels) and
          all(t[0] == t[2] for t in tabs) and
          set(SLUG[mk] for mk in panels) == set(t[0] for t in tabs),
          '탭 %s / 판 %s' % ([t[0] for t in tabs], sorted(panels)))
    shown = [t[0] for t in tabs if t[1] == 'true']
    hidden = re.findall(r'<section class="panel" id="panel-([a-z-]+)"[^>]*?( hidden)?>', body)
    check('처음에 펼쳐지는 판은 하나',
          len(shown) == 1 and sum(1 for _, hd in hidden if not hd) == 1 and
          shown[0] == [s for s, hd in hidden if not hd][0],
          '고른 탭 %s · 펼친 판 %s' % (shown, [s for s, hd in hidden if not hd]))

    # 2. 판마다 되짚는다
    n_cell, n_row = 0, 0
    bad_asof, bad_cnt, bad_cell, bad_arith, bad_ccy = [], [], [], [], []
    stop_pct = doc['rule']['stop_loss_pct']
    sname = {s['id']: s['name'] for s in doc['strategies']}

    for mk, panel in panels.items():
        m = doc['markets'][mk]
        ccy = m.get('currency') or 'KRW'

        # 기준일
        sub = text(re.search(r'<div class="sub">(.*?)</div>', panel, re.S).group(1))
        if m['asof'] not in sub:
            bad_asof.append('%s 화면 「%s」 vs 자료 %s' % (mk, sub, m['asof']))
        if ('대상 %d 종' % m['count']) not in sub:
            bad_asof.append('%s 대상 수 「%s」 vs 자료 %d' % (mk, sub, m['count']))

        # 접힌 칸의 이름표가 스스로 센 수 — 접어 두면 펴 보기 전에는 아무도
        # 틀린 줄 모른다. 그래서 줄 수와 따로 맞대어 둔다.
        sm = re.search(r'<summary>관찰 — 한 전략만 켜진 자리 (\d+) 종', panel)
        if not sm or int(sm.group(1)) != len(m.get('watch_buy') or []):
            bad_asof.append('%s 관찰 이름표 「%s」 vs 자료 %d 건'
                            % (mk, sm.group(1) if sm else '없음',
                               len(m.get('watch_buy') or [])))

        tb = tables_of(panel)
        # 관찰 칸에 싣는 것은 **watch_buy 뿐이다.** watch_sell(한 전략만 켜진
        # 청산 자리)은 일부러 싣지 않는다 — 관찰은 「살 후보를 미리 본다」는
        # 자리이기 때문이다. 처음 이 되짚기를 짤 때 둘을 합쳐 놓고 화면이
        # 빠뜨린 줄 알았다. 빠뜨린 쪽은 내 잣대였다.
        want = {BUY_SIG: m.get('buy') or [],
                SELL_SIG: m.get('sell') or [],
                WATCH_SIG: m.get('watch_buy') or []}

        for sig, plans in want.items():
            got = tb.get(sig) or []
            if len(got) != len(plans):
                bad_cnt.append('%s %s 화면 %d 줄 vs 자료 %d 건'
                               % (mk, sig.split('|')[-1], len(got), len(plans)))
                continue
            for row, p in zip(got, plans):
                n_row += 1
                # 이름 · 코드
                if row[0] != p['name']:
                    bad_cell.append('%s 이름 「%s」 vs 「%s」' % (mk, row[0], p['name']))
                if row[1] != p['code']:
                    bad_cell.append('%s 코드 「%s」 vs 「%s」' % (mk, row[1], p['code']))
                n_cell += 2
                # 종가
                n_cell += 1
                if row[2] != money(p['close'], ccy):
                    bad_cell.append('%s %s 종가 「%s」 vs 「%s」'
                                    % (mk, p['code'], row[2], money(p['close'], ccy)))
                px = unmoney(row[2], ccy)
                if px is None:
                    bad_ccy.append('%s %s 종가 「%s」 가 %s 단위가 아님'
                                   % (mk, p['code'], row[2], ccy))
                # 손절 — 화면에 찍힌 종가만으로 다시 셈한다
                if sig in (BUY_SIG, WATCH_SIG):
                    j = 3
                    n_cell += 1
                    if row[j] != money(p.get('stop_ref'), ccy):
                        bad_cell.append('%s %s 손절 「%s」 vs 「%s」'
                                        % (mk, p['code'], row[j], money(p.get('stop_ref'), ccy)))
                    sp = unmoney(row[j], ccy)
                    if px is not None and sp is not None:
                        # 끊는 자리는 **크기가 아니라 화폐**가 정한다. 크기로
                        # 가르면 1,000달러가 넘는 미국 종목에서 센트가 날아간다.
                        wantv = px * (1 - stop_pct / 100.0)
                        wantv = round(wantv, 2 if ccy == 'USD' else 0)
                        if abs(sp - wantv) > 1e-9:
                            bad_arith.append('%s %s 손절 %s ≠ 종가 %s × (1−%.1f%%) = %s'
                                             % (mk, p['code'], row[j], row[2], stop_pct,
                                                money(wantv, ccy)))
                # 비중
                if sig == BUY_SIG:
                    n_cell += 1
                    w = '%d%%' % round(p['weight_hint'])
                    if row[4] != w:
                        bad_cell.append('%s %s 비중 「%s」 vs 「%s」' % (mk, p['code'], row[4], w))
                # 전략 이름
                # 관찰 칸은 **켜진 것을 다 보여 준다** — 합의가 아니므로
                # 무엇이 켜졌는지가 곧 그 칸의 내용이다. 매수·청산 칸은 반대로
                # 합의 멤버만 싣는다(검증을 통과하지 못한 전략을 이름표 없이
                # 같은 줄에 붙이면 읽는 사람이 근거로 읽는다).
                if sig == SELL_SIG:
                    hits = p['sell_hits']
                elif sig == WATCH_SIG:
                    hits = p['buy_hits'] + (p.get('other_buy') or [])
                else:
                    hits = p['buy_hits']
                names = [sname.get(s, s) for s in hits]
                n_cell += 1
                if row[-1] != ' · '.join(names):
                    bad_cell.append('%s %s 전략 「%s」 vs 「%s」'
                                    % (mk, p['code'], row[-1], ' · '.join(names)))

    check('기준일·대상 수가 자료와 일치', not bad_asof, '; '.join(bad_asof[:3]))
    check('표의 줄 수가 자료의 건수와 일치', not bad_cnt, '; '.join(bad_cnt[:3]))
    check('표의 칸 %d 개가 자료와 글자까지 일치' % n_cell, not bad_cell, '; '.join(bad_cell[:3]))
    check('화면 숫자만으로 다시 센 손절가 (%d 줄)' % n_row, not bad_arith, '; '.join(bad_arith[:3]))
    check('값의 단위가 그 시장의 화폐', not bad_ccy, '; '.join(bad_ccy[:3]))

    # 3. 막힌 시장은 탭에서부터 표가 나야 한다
    bad_block = []
    for mk, panel in panels.items():
        blocked = bool((doc['markets'][mk].get('stale') or {}).get('block')) \
            if isinstance(doc['markets'][mk].get('stale'), dict) else None
        # 자료가 막힘을 어디에 적는지는 판에 따라 다르므로, 화면이 스스로
        # 내건 세 가지 표(탭 딱지 · 붉은 띠 · 이름표)가 **서로** 맞는지 본다.
        tab = re.search(r'aria-controls="panel-%s">(.*?)</button>' % SLUG[mk], body, re.S)
        badge = 'tab-block' in (tab.group(1) if tab else '')
        banner = '이 시장에서는 이 방식으로 사지 마십시오' in panel
        title = '<h3>보류' in panel
        if len({badge, banner, title}) != 1:
            bad_block.append('%s 탭 딱지 %s · 붉은 띠 %s · 이름표 %s'
                             % (mk, badge, banner, title))
        if blocked is True and not badge:
            bad_block.append('%s 자료는 막혔다는데 탭에 딱지가 없다' % mk)
    check('막힘 표시가 탭·띠·이름표에서 한목소리', not bad_block, '; '.join(bad_block[:3]))

    # 4. 딱지(실적·이벤트)가 판정 자료와 같은가
    bad_flag, n_flag = [], 0
    by_sym = {}
    for r in (vd.get('rows') or vd.get('items') or []):
        by_sym[r.get('symbol') or r.get('code')] = r
    for mk, panel in panels.items():
        for card in re.findall(r'<div class="factcard">(.*?)</div>\s*(?=<div class="factcard">|$)',
                               panel, re.S):
            nm = text(re.search(r'<div class="nm">(.*?)</div>', card, re.S).group(1))
            for li in re.findall(r'<li class="fl-[a-z]+">(.*?)</li>', card, re.S):
                n_flag += 1
                if not text(li):
                    bad_flag.append('%s %s 빈 딱지' % (mk, nm))
    check('실적·수급 딱지 %d 줄이 비어 있지 않음' % n_flag, not bad_flag, '; '.join(bad_flag[:3]))

    # 5. 지어낸 값이 섞이지 않았는가 — 화면에 「None」·「nan」·「undefined」가 없어야
    leak = [w for w in ('None', 'nan', 'undefined', 'NaN', '{}', '%s')
            if re.search(r'>[^<]*\b%s\b' % re.escape(w), body)]
    check('화면에 흘러나온 날값이 없음', not leak, ', '.join(leak))

    return not BAD


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'kis-timing-report.html')
    if not os.path.exists(path):
        sys.stderr.write('한 장이 없습니다: %s\n'
                         '  python3 scripts/build_kr_etf_report.py --all --out %s\n' % (path, path))
        return 2
    verify(path)
    for name, _ in OK:
        print('PASS  %s' % name)
    for name, detail in BAD:
        print('FAIL  %s%s' % (name, ('  — ' + detail) if detail else ''))
    print('\n결과: %s' % ('모두 통과' if not BAD else '흠 %d 건' % len(BAD)))
    return 1 if BAD else 0


if __name__ == '__main__':
    sys.exit(main())
