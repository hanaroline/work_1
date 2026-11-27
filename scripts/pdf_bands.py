# -*- coding: utf-8 -*-
"""PDF 각 쪽의 가장 긴 빈 띠를 잰다(지침 6-1절 「빈 띠 평균 10%·최대 25%」).

    python3 scripts/pdf_bands.py <파일.pdf> [...]

아래 여백만 재면 꼬리말 때문에 전부 0 으로 보이므로, 위·아래 6% 를 빼고
그 사이에서 연속으로 빈 줄이 가장 길게 이어진 구간을 쪽 높이 대비로 잰다.
마지막 쪽은 평균·최대에서 뺀다. 평균 10% 초과나 최대 25% 초과면 끝 상태 1.
표준 라이브러리와 pdftoppm(poppler)만 쓴다.
"""
import glob, os, subprocess, sys, tempfile


def bands(pdf):
    d = tempfile.mkdtemp()
    subprocess.run(['pdftoppm', '-r', '30', '-gray', pdf, d + '/p'], check=True)
    fr = []
    for f in sorted(glob.glob(d + '/p*.pgm')):
        b = open(f, 'rb').read()
        parts = b.split(maxsplit=4)
        w, h, px = int(parts[1]), int(parts[2]), parts[4]
        m = int(h * 0.06)
        best = cur = 0
        for y in range(m, h - m):
            if min(px[y * w:(y + 1) * w]) > 245:
                cur += 1
                best = max(best, cur)
            else:
                cur = 0
        fr.append(best / float(h - 2 * m))
        os.remove(f)
    return fr


def main(paths):
    bad = 0
    for pdf in paths:
        fr = bands(pdf)
        body = fr[:-1] or fr
        avg, mx = 100 * sum(body) / len(body), 100 * max(body)
        ok = avg <= 10 and mx <= 25
        bad += not ok
        print('== %s' % os.path.basename(pdf))
        print('   %d쪽 · 빈 띠 평균 %.1f%% · 최대 %.1f%% %s' % (
            len(fr), avg, mx, '정상' if ok else '— 기준 초과'))
        over = ['%d쪽 %.0f%%' % (i + 1, 100 * x) for i, x in enumerate(body) if x > 0.25]
        if over:
            print('   25%% 넘는 쪽: ' + ', '.join(over))
    return 1 if bad else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1:]))
