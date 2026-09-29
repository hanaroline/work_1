#!/usr/bin/env python3
"""PDF 에 통째로 박힌 글꼴을 쓰는 글자만 남기고 줄인다.

    python3 scripts/shrink_pdf.py els-analysis.pdf [...]

왜 필요한가 — 러너에서 뽑은 분석자료 PDF 가 3.3MB 였다. 이 컨테이너에서 뽑으면
같은 문서가 371KB 다. 차이는 크로미움이 한글 글꼴을 부분집합으로 넣느냐 통째로
넣느냐이고, 러너 쪽이 통째로 넣는다. 매주 저장소에 3MB 씩 쌓일 이유가 없다.

**줄인 파일이 원본보다 작고, 쪽 수와 글자 수가 그대로일 때만 바꿔치기한다.**
하나라도 어긋나면 원본을 그대로 둔다 — 자료가 깨지는 것보다 큰 편이 낫다.

종료코드 0 = 정상(바꿨든 그대로 뒀든). 1 = 파일을 못 읽음.
"""
import os
import re
import sys

import pymupdf

KO = re.compile(r'[가-힣]')


def measure(path):
    d = pymupdf.open(path)
    t = ''.join(p.get_text() for p in d)
    n = (d.page_count, len(KO.findall(t)), len(t))
    d.close()
    return n


def shrink(path):
    if not os.path.exists(path):
        print(f'  {path} 없음')
        return False
    before = os.path.getsize(path)
    base = measure(path)
    tmp = path + '.shrunk'
    d = pymupdf.open(path)
    try:
        d.subset_fonts()
    except Exception as e:                     # 글꼴이 이미 부분집합이면 그냥 넘어간다
        print(f'  {path}: 부분집합 건너뜀 ({e})')
    d.save(tmp, garbage=4, deflate=True, clean=True)
    d.close()

    after = os.path.getsize(tmp)
    now = measure(tmp)
    if after < before and now == base:
        os.replace(tmp, path)
        print(f'  {path}: {before // 1024}KB → {after // 1024}KB ({after * 100 // before}%)')
        return True
    os.remove(tmp)
    why = '더 커져서' if after >= before else f'내용이 달라져서 {base} → {now}'
    print(f'  {path}: 그대로 둠 ({why})')
    return False


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    for f in args:
        shrink(f)
