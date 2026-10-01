#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""만든 .pptx 의 상자 배치를 좌표로 검사한다.

이 환경의 LibreOffice 가 고장나 있어(txt 조차 "source file could not be
loaded") 슬라이드를 그려 볼 수가 없다. 눈으로 못 보면 겹침과 넘침을 놓친다 —
실제로 자료 A 4면에서 표가 각주를 0.04인치 덮고 있었는데 숫자는 전부 맞아
검산으로는 잡히지 않았다.

그래서 렌더링 대신 **기하**로 본다. 슬라이드 XML 에서 모든 도형의 좌표와
글을 꺼내, 바깥으로 나갔는지 · 서로 겹치는지 · 글이 상자보다 긴지 센다.
글자폭은 한글 1.0em · 영숫자 0.52em · 공백 0.30em 으로 어림한다.

    python3 tools/tax-brief/geomqa.py  a.pptx b.pptx
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
}
EMU = 914400.0
PAGE_W, PAGE_H = 13.333, 7.5
MARGIN = 0.30          # 이보다 가장자리에 붙으면 알린다
OVERLAP_TOL = 0.015    # 이 아래 겹침은 선 두께로 본다


def width_em(s):
    """글자 폭을 em 으로 어림한다."""
    w = 0.0
    for ch in s:
        if ch == ' ':
            w += 0.30
        elif ord(ch) > 0x2000:          # 한글·한자·전각 기호
            w += 1.00
        else:
            w += 0.52
    return w


def texts_of(sp):
    out = []
    for t in sp.iter('{%s}t' % NS['a']):
        if t.text:
            out.append(t.text)
    return out


def paras_of(sp):
    """문단 단위로 끊어 돌려준다. 줄 수를 세려면 문단 경계가 필요하다."""
    out = []
    for p in sp.iter('{%s}p' % NS['a']):
        s = ''.join(t.text or '' for t in p.iter('{%s}t' % NS['a']))
        out.append(s)
    return out


def font_size(sp):
    """그 도형에서 쓰인 가장 큰 글자 크기(pt). 없으면 10."""
    sizes = []
    for rpr in sp.iter('{%s}rPr' % NS['a']):
        if rpr.get('sz'):
            sizes.append(int(rpr.get('sz')) / 100.0)
    for dpr in sp.iter('{%s}defRPr' % NS['a']):
        if dpr.get('sz'):
            sizes.append(int(dpr.get('sz')) / 100.0)
    return max(sizes) if sizes else 10.0


def shapes(root):
    """(종류, x, y, w, h, 글, pt) 목록. 표는 행 높이를 합쳐 한 덩이로 본다."""
    out = []
    tree = root.find('.//p:cSld/p:spTree', NS)
    if tree is None:
        return out
    for sp in list(tree):
        tag = sp.tag.split('}')[-1]
        if tag not in ('sp', 'graphicFrame', 'pic'):
            continue
        xfrm = sp.find('.//a:xfrm', NS)
        if xfrm is None:
            continue
        off, ext = xfrm.find('a:off', NS), xfrm.find('a:ext', NS)
        if off is None or ext is None:
            continue
        x, y = int(off.get('x')) / EMU, int(off.get('y')) / EMU
        w, h = int(ext.get('cx')) / EMU, int(ext.get('cy')) / EMU
        kind = tag
        if tag == 'graphicFrame' and sp.find('.//a:tbl', NS) is not None:
            kind = 'table'
            # 표의 실제 높이는 ext 가 아니라 행 높이의 합이다. ext 는 만들 때
            # 적은 값이라 글이 길어 행이 자라면 그만큼 어긋난다.
            rows = sp.findall('.//a:tr', NS)
            hsum = sum(int(r.get('h') or 0) for r in rows) / EMU
            if hsum > 0:
                h = max(h, hsum)
        out.append((kind, x, y, w, h, ' '.join(texts_of(sp)), font_size(sp),
                    paras_of(sp) if kind == 'sp' else []))
    return out


def wrapped_lines(paras, w, pt):
    """상자 폭 w(인치) 안에서 몇 줄이 되는가."""
    n = 0
    for p in paras:
        if not p.strip():
            n += 1
            continue
        need = width_em(p) * pt / 72.0
        n += max(1, int(need / w) + (1 if need % w > 1e-9 else 0))
    return n


def contains(outer, inner):
    """바탕 도형이 제 글상자를 품은 경우. 글 없는 쪽이 바깥이라야 한다."""
    _, ox, oy, ow, oh, otxt = outer[:6]
    _, ix, iy, iw, ih = inner[:5]
    if otxt.strip():
        return False
    return (ox - 0.01 <= ix and oy - 0.01 <= iy
            and ox + ow + 0.01 >= ix + iw and oy + oh + 0.01 >= iy + ih)


def check(path):
    bad = []
    with zipfile.ZipFile(path) as z:
        names = sorted((n for n in z.namelist()
                        if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)),
                       key=lambda n: int(re.search(r'(\d+)', n.split('/')[-1]).group(1)))
        for i, n in enumerate(names, 1):
            sps = shapes(ET.fromstring(z.read(n)))
            for kind, x, y, w, h, txt, pt, paras in sps:
                label = '%s「%s」' % (kind, (txt or '')[:24])
                if x < -0.01 or y < -0.01 or x + w > PAGE_W + 0.01 or y + h > PAGE_H + 0.01:
                    bad.append('%d면 바깥으로 나감 — %s  (%.2f,%.2f %.2f×%.2f)'
                               % (i, label, x, y, w, h))
                elif x < MARGIN - 0.01 or y + h > PAGE_H - MARGIN + 0.01:
                    bad.append('%d면 여백 침범 — %s  (y끝 %.2f)' % (i, label, y + h))
                # 글이 상자보다 긴가 — 한 줄짜리는 폭으로, 여러 줄은 높이로 센다.
                # 각주가 두 줄로 자라 아래 글을 덮은 적이 두 번 있어 둘 다 본다.
                if kind == 'sp' and txt and pt >= 7:
                    if h < 0.40:
                        need = width_em(txt) * pt / 72.0
                        if need > w + 0.05:
                            bad.append('%d면 글 넘침 — %s  필요 %.2f" > 폭 %.2f"'
                                       % (i, label, need, w))
                    else:
                        n = wrapped_lines(paras, w, pt)
                        need = n * pt / 72.0 * 1.20
                        if need > h + 0.06:
                            bad.append('%d면 글 넘침(%d줄) — %s  필요 %.2f" > 높이 %.2f"'
                                       % (i, n, label, need, h))
            for a in range(len(sps)):
                for b in range(a + 1, len(sps)):
                    _, ax, ay, aw, ah, at = sps[a][:6]
                    _, bx, by, bw, bh, bt = sps[b][:6]
                    ox = min(ax + aw, bx + bw) - max(ax, bx)
                    oy = min(ay + ah, by + bh) - max(ay, by)
                    if contains(sps[a], sps[b]) or contains(sps[b], sps[a]):
                        continue   # 카드 바탕이 제 글을 품은 것 — 겹침이 아니다
                    if ox > OVERLAP_TOL and oy > OVERLAP_TOL:
                        bad.append('%d면 겹침 %.2f" — 「%s」 ↔ 「%s」'
                                   % (i, oy, (at or '')[:18], (bt or '')[:18]))
    return len(names), bad


def main():
    files = sys.argv[1:]
    if not files:
        print('쓰는 법: geomqa.py <pptx> [...]')
        return 2
    total = 0
    for f in files:
        n, bad = check(f)
        print('── %s (%d면)' % (f, n))
        if not bad:
            print('   문제 없음')
        for b in bad:
            print('   !! ' + b)
        total += len(bad)
    print('\n합계 %d건' % total)
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
