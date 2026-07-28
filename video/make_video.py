#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
2026 글로벌 AI 투자 트렌드 — 숏폼(9:16) 데이터 애니메이션 영상 생성기.

- 순수 Python(Pillow)으로 프레임을 그리고 imageio-ffmpeg 로 MP4 인코딩.
- 미래에셋 디자인 시스템 적용: 오렌지 #F58220 / 블루 #043B72, 흰 캔버스,
  샤프한 모서리, 그라데이션·이모지 없음, 1px 오렌지 섹션 룰 시그니처.
- 화면 안의 수치는 트렌드를 설명하기 위한 '예시 데이터' 입니다.

사용:
    pip install pillow imageio imageio-ffmpeg numpy
    python3 make_video.py            # -> out/ai_trends_2026.mp4
"""
import math
import os

from PIL import Image, ImageDraw, ImageFont
import imageio.v2 as imageio

# ---------------------------------------------------------------- 설정
W, H = 1080, 1920          # 9:16 세로 숏폼
FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
OUT_DIR = os.path.join(HERE, "out")
OUT_PATH = os.path.join(OUT_DIR, "ai_trends_2026.mp4")

MARGIN = 96

# ---------------------------------------------------------------- 브랜드 팔레트
ORANGE       = (245, 130, 32)
ORANGE_ACT   = (203, 96, 21)
ORANGE_SOFT  = (250, 176, 114)
ORANGE_TINT  = (253, 236, 222)   # 아주 옅은 오렌지(면 채움용)
BLUE         = (4, 59, 114)
BLUE_SOFT    = (126, 159, 195)
INK          = (26, 26, 26)
BODY         = (61, 61, 61)
MUTED        = (108, 108, 108)
MUTED_SOFT   = (132, 136, 139)
HAIRLINE     = (205, 206, 203)
SURFACE_SOFT = (236, 239, 244)
WHITE        = (255, 255, 255)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


# 필요한 웨이트를 미리 로드
class F:
    def __init__(self):
        self.black = lambda s: font("NotoSansKR-Black.ttf", s)
        self.bold = lambda s: font("NotoSansKR-Bold.ttf", s)
        self.med = lambda s: font("NotoSansKR-Medium.ttf", s)
        self.reg = lambda s: font("NotoSansKR-Regular.ttf", s)


FT = F()

# ---------------------------------------------------------------- 이징
def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_out_cubic(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    t = clamp(t)
    return 3 * t * t - 2 * t * t * t


def ease_out_back(t):
    t = clamp(t)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def lerp(a, b, t):
    return a + (b - a) * t


def seg(gt, start, end):
    """구간 [start,end] 안에서의 0~1 진행도(이징 전)."""
    if end <= start:
        return 1.0 if gt >= end else 0.0
    return clamp((gt - start) / (end - start))


# ---------------------------------------------------------------- 그리기 헬퍼
def a(color, alpha):
    """RGB + 알파(0~1) -> RGBA"""
    return (color[0], color[1], color[2], int(round(255 * clamp(alpha))))


def text(img, xy, s, fnt, color, alpha=1.0, anchor="la", spacing=0, align="left"):
    if alpha <= 0:
        return
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text(xy, s, font=fnt, fill=a(color, alpha), anchor=anchor,
           spacing=spacing, align=align)
    img.alpha_composite(layer)


def rect(img, box, color, alpha=1.0, radius=0):
    if alpha <= 0:
        return
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if radius > 0:
        d.rounded_rectangle(box, radius=radius, fill=a(color, alpha))
    else:
        d.rectangle(box, fill=a(color, alpha))
    img.alpha_composite(layer)


def line(img, box, color, alpha=1.0, width=1):
    if alpha <= 0:
        return
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line(box, fill=a(color, alpha), width=width)
    img.alpha_composite(layer)


def polyline(img, pts, color, alpha=1.0, width=6):
    if alpha <= 0 or len(pts) < 2:
        return
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line(pts, fill=a(color, alpha), width=width, joint="curve")
    img.alpha_composite(layer)


def polygon(img, pts, color, alpha=1.0):
    if alpha <= 0 or len(pts) < 3:
        return
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon(pts, fill=a(color, alpha))
    img.alpha_composite(layer)


def dot(img, center, r, color, alpha=1.0):
    if alpha <= 0:
        return
    x, y = center
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([x - r, y - r, x + r, y + r], fill=a(color, alpha))
    img.alpha_composite(layer)


def rise(alpha_progress, offset=40):
    """진행도 -> (alpha, y오프셋) : 아래에서 위로 떠오르며 페이드인."""
    e = ease_out_cubic(alpha_progress)
    return e, (1 - e) * offset


# ---------------------------------------------------------------- 공통 프레임(헤더/푸터)
def base_frame(gt, total):
    img = Image.new("RGBA", (W, H), WHITE + (255,))

    # 상단 카테고리 태그 + 1px 오렌지 룰(시그니처)
    text(img, (MARGIN, 118), "MARKET INSIGHT", FT.bold(30), ORANGE,
         anchor="la", spacing=0)
    text(img, (MARGIN, 160), "마켓 인사이트 · 데이터 브리핑", FT.med(26), MUTED,
         anchor="la")
    line(img, [(MARGIN, 214), (W - MARGIN, 214)], ORANGE, 1.0, width=2)

    # 하단 캡션 + 진행 바
    text(img, (MARGIN, H - 132), "※ 화면의 수치는 트렌드 설명용 예시 데이터입니다.",
         FT.reg(24), MUTED_SOFT, anchor="la")
    track_y = H - 84
    line(img, [(MARGIN, track_y), (W - MARGIN, track_y)], HAIRLINE, 1.0, width=3)
    prog = clamp(gt / total)
    line(img, [(MARGIN, track_y), (MARGIN + (W - 2 * MARGIN) * prog, track_y)],
         ORANGE, 1.0, width=3)
    text(img, (W - MARGIN, H - 132), "01 → 06", FT.med(24), MUTED_SOFT,
         anchor="ra")
    return img


# ---------------------------------------------------------------- 씬 1 : 인트로
def scene_intro(img, lt, dur):
    cx = MARGIN
    top = 520

    a1, dy1 = rise(seg(lt, 0.2, 1.0))
    text(img, (cx, top + dy1), "2026", FT.black(150), ORANGE, a1, anchor="la")

    a2, dy2 = rise(seg(lt, 0.5, 1.3))
    text(img, (cx, top + 168 + dy2), "글로벌 AI", FT.black(118), INK, a2, anchor="la")
    a3, dy3 = rise(seg(lt, 0.7, 1.5))
    text(img, (cx, top + 300 + dy3), "투자 트렌드", FT.black(118), INK, a3, anchor="la")

    # 오렌지 강조 언더바
    ua = ease_out_cubic(seg(lt, 1.3, 2.1))
    rect(img, [cx, top + 452, cx + 300 * ua, top + 470], ORANGE, 1.0)

    a4, dy4 = rise(seg(lt, 1.7, 2.6))
    text(img, (cx, top + 520 + dy4),
         "인프라 투자의 시대에서\n수익화(Monetization)의 시대로",
         FT.med(46), BODY, a4, anchor="la", spacing=18)

    a5 = ease_out_cubic(seg(lt, 2.6, 3.4))
    text(img, (cx, top + 690), "2026. 07  ·  DATA STORY", FT.bold(28), MUTED, a5,
         anchor="la")


# ---------------------------------------------------------------- 씬 2 : 빅 스탯 카운터
def scene_stat(img, lt, dur):
    cx = W // 2
    a0, dy0 = rise(seg(lt, 0.1, 0.9))
    text(img, (cx, 470 + dy0), "글로벌 AI 관련 총지출 (2026E)", FT.med(44), MUTED, a0,
         anchor="ma")

    # 0.00 -> 1.50 카운트업
    p = ease_out_cubic(seg(lt, 0.6, 2.8))
    val = lerp(0.0, 1.50, p)
    num = f"{val:.2f}"
    na = ease_out_cubic(seg(lt, 0.5, 1.0))
    # 큰 수치 + 단위 (베이스라인 정렬을 위해 개별 배치)
    big = FT.black(300)
    nb = ImageDraw.Draw(img).textbbox((0, 0), num, font=big)
    nw = nb[2] - nb[0]
    unit = FT.bold(72)
    ub = ImageDraw.Draw(img).textbbox((0, 0), "조 달러", font=unit)
    uw = ub[2] - ub[0]
    gap = 28
    total_w = nw + gap + uw
    x0 = cx - total_w // 2
    ycen = 820
    text(img, (x0, ycen), num, big, ORANGE, na, anchor="lm")
    text(img, (x0 + nw + gap, ycen + 70), "조 달러", unit, INK, na, anchor="lm")

    # 증감 배지
    a2, dy2 = rise(seg(lt, 2.6, 3.4))
    by = 1060
    bw, bh = 360, 84
    bx = cx - bw // 2
    rect(img, [bx, by, bx + bw, by + bh], ORANGE_TINT, a2, radius=4)
    # 상승 삼각형
    tri = [(bx + 44, by + 54), (bx + 66, by + 54), (bx + 55, by + 30)]
    polygon(img, tri, ORANGE_ACT, a2)
    text(img, (bx + 90, by + bh // 2), "전년 대비  +32%", FT.bold(40), ORANGE_ACT, a2,
         anchor="lm")

    a3, dy3 = rise(seg(lt, 3.2, 4.1))
    text(img, (cx, 1240 + dy3),
         "인프라·모델·서비스 전반의\nAI 투자가 사상 최대 규모로 확대",
         FT.med(42), BODY, a3, anchor="ma", align="center", spacing=16)


# ---------------------------------------------------------------- 씬 3 : 막대 차트
def section_title(img, lt, s, appear=0.0):
    ra = ease_out_cubic(seg(lt, appear, appear + 0.6))
    line(img, [(MARGIN, 300), (MARGIN + (W - 2 * MARGIN) * ra, 300)], ORANGE, 1.0,
         width=3)
    ta, dy = rise(seg(lt, appear + 0.1, appear + 0.8))
    text(img, (MARGIN, 322 + dy), s, FT.bold(56), INK, ta, anchor="la")


def scene_bars(img, lt, dur):
    section_title(img, lt, "빅테크 AI CAPEX 추이")
    text(img, (W - MARGIN, 356), "단위: 억 달러", FT.reg(28), MUTED, anchor="ra")

    labels = ["2023", "2024", "2025", "2026E"]
    vals = [1400, 2300, 3600, 5200]
    vmax = 5600.0

    base_y = 1560
    top_y = 620
    plot_h = base_y - top_y
    n = len(vals)
    slot = (W - 2 * MARGIN) / n
    bw = slot * 0.5

    # 베이스라인
    ba = ease_out_cubic(seg(lt, 0.5, 1.0))
    line(img, [(MARGIN, base_y), (W - MARGIN, base_y)], HAIRLINE, ba, width=3)

    for i, (lb, v) in enumerate(zip(labels, vals)):
        cxi = MARGIN + slot * (i + 0.5)
        start = 0.9 + i * 0.28
        gp = ease_out_cubic(seg(lt, start, start + 1.0))
        h = plot_h * (v / vmax) * gp
        x0 = cxi - bw / 2
        x1 = cxi + bw / 2
        y0 = base_y - h
        highlight = (i == n - 1)
        col = ORANGE if highlight else BLUE
        rect(img, [x0, y0, x1, base_y], col, 1.0)
        # 값 라벨(카운트업)
        va = ease_out_cubic(seg(lt, start + 0.15, start + 1.0))
        cur = int(lerp(0, v, ease_out_cubic(seg(lt, start, start + 1.0))))
        if va > 0.02:
            text(img, (cxi, y0 - 20), f"{cur:,}", FT.bold(40),
                 ORANGE_ACT if highlight else BLUE, va, anchor="mb")
        # x 라벨
        la = ease_out_cubic(seg(lt, start, start + 0.6))
        text(img, (cxi, base_y + 24), lb, FT.med(36),
             INK if highlight else MUTED, la, anchor="ma")

    a3, dy3 = rise(seg(lt, 2.7, 3.6))
    text(img, (MARGIN, 1660 + dy3),
         "3년 새 약 3.7배 — 투자는 여전히\n가속, 관건은 '회수(ROI)' 로 이동",
         FT.med(40), BODY, a3, anchor="la", spacing=14)


# ---------------------------------------------------------------- 씬 4 : 라인 차트
def scene_line(img, lt, dur):
    section_title(img, lt, "AI 반도체 시장 전망")
    text(img, (W - MARGIN, 356), "단위: 억 달러", FT.reg(28), MUTED, anchor="ra")

    labels = ["2024", "2025", "2026E", "2027E", "2028E"]
    vals = [3200, 4600, 6100, 7600, 9000]
    vmax = 9600.0
    vmin = 0.0

    left = MARGIN + 20
    right = W - MARGIN - 20
    base_y = 1520
    top_y = 640
    n = len(vals)

    def px(i):
        return left + (right - left) * (i / (n - 1))

    def py(v):
        return base_y - (base_y - top_y) * ((v - vmin) / (vmax - vmin))

    # 그리드(옅은 가로선)
    ga = ease_out_cubic(seg(lt, 0.4, 1.0))
    for gy in range(1, 4):
        yy = top_y + (base_y - top_y) * gy / 4
        line(img, [(left, yy), (right, yy)], SURFACE_SOFT, ga, width=2)
    line(img, [(left, base_y), (right, base_y)], HAIRLINE, ga, width=3)

    pts = [(px(i), py(v)) for i, v in enumerate(vals)]

    # 선 진행 그리기 (draw reveal)
    draw_p = ease_in_out(seg(lt, 0.9, 3.2))
    span = (n - 1) * draw_p
    k = int(math.floor(span))
    frac = span - k
    shown = pts[:k + 1]
    if k < n - 1:
        x = lerp(pts[k][0], pts[k + 1][0], frac)
        y = lerp(pts[k][1], pts[k + 1][1], frac)
        lead = (x, y)
        shown = shown + [lead]
    else:
        lead = pts[-1]

    # 면 채움(옅은 오렌지)
    if len(shown) >= 2:
        poly = shown + [(shown[-1][0], base_y), (shown[0][0], base_y)]
        polygon(img, poly, ORANGE_TINT, 0.9)

    polyline(img, shown, ORANGE, 1.0, width=8)

    # 지나온 점 + 값
    for i in range(n):
        if i <= span + 0.001:
            dot(img, pts[i], 12, ORANGE, 1.0)
            dot(img, pts[i], 5, WHITE, 1.0)
            text(img, (px(i), base_y + 24), labels[i], FT.med(32), MUTED, 1.0,
                 anchor="ma")
    # 리딩 닷
    dot(img, lead, 16, ORANGE_ACT, 1.0)
    dot(img, lead, 7, WHITE, 1.0)

    # 최종 값 라벨
    fa = ease_out_cubic(seg(lt, 3.2, 3.9))
    if fa > 0:
        text(img, (pts[-1][0], pts[-1][1] - 40), "9,000", FT.bold(44), ORANGE_ACT,
             fa, anchor="mb")

    a3, dy3 = rise(seg(lt, 3.6, 4.4))
    text(img, (MARGIN, 1640 + dy3),
         "연산 수요가 시장을 견인 —\n2028년까지 완만한 우상향 전망",
         FT.med(40), BODY, a3, anchor="la", spacing=14)


# ---------------------------------------------------------------- 씬 5 : 핵심 포인트
def scene_points(img, lt, dur):
    section_title(img, lt, "2026 핵심 포인트")

    items = [
        ("01", "규모에서 수익성으로", "대규모 인프라 투자가 실적으로 검증되는 국면"),
        ("02", "온디바이스·에이전트 AI", "활용처가 단말·업무 자동화로 빠르게 확산"),
        ("03", "전력·데이터센터 병목", "에너지와 인프라가 성장의 새로운 변수로"),
    ]
    y = 520
    row_h = 380
    for i, (no, head, sub) in enumerate(items):
        start = 0.6 + i * 0.5
        ap, dx = rise(seg(lt, start, start + 0.9), offset=60)
        ry = y + i * row_h
        # 번호 칩
        chip = 108
        rect(img, [MARGIN, ry, MARGIN + chip, ry + chip], ORANGE, ap, radius=4)
        text(img, (MARGIN + chip // 2, ry + chip // 2), no, FT.black(52), WHITE, ap,
             anchor="mm")
        tx = MARGIN + chip + 40 + dx
        text(img, (tx, ry + 4), head, FT.bold(58), INK, ap, anchor="la")
        text(img, (tx, ry + 84), sub, FT.med(38), BODY, ap, anchor="la")
        # 구분 hairline
        if i < len(items) - 1:
            la = ease_out_cubic(seg(lt, start + 0.3, start + 0.9))
            line(img, [(MARGIN, ry + row_h - 60), (W - MARGIN, ry + row_h - 60)],
                 HAIRLINE, la, width=2)


# ---------------------------------------------------------------- 씬 6 : 아웃트로
def scene_outro(img, lt, dur):
    cx = W // 2
    a1, dy1 = rise(seg(lt, 0.2, 1.1))
    text(img, (cx, 700 + dy1), "규모의 시대에서", FT.black(96), INK, a1, anchor="ma")
    a2, dy2 = rise(seg(lt, 0.5, 1.4))
    text(img, (cx, 830 + dy2), "수익성의 시대로", FT.black(96), ORANGE, a2, anchor="ma")

    ua = ease_out_cubic(seg(lt, 1.2, 1.9))
    rect(img, [cx - 160 * ua, 980, cx + 160 * ua, 986], ORANGE, 1.0)

    a3, dy3 = rise(seg(lt, 1.8, 2.6))
    text(img, (cx, 1080 + dy3),
         "2026, AI가 증명해야 할\n단 하나의 질문 — \"돈을 버는가\"",
         FT.med(46), BODY, a3, anchor="ma", align="center", spacing=18)


# ---------------------------------------------------------------- 타임라인
SCENES = [
    ("intro", 4.5, scene_intro),
    ("stat", 5.0, scene_stat),
    ("bars", 6.0, scene_bars),
    ("line", 6.0, scene_line),
    ("points", 6.0, scene_points),
    ("outro", 4.2, scene_outro),
]
TOTAL = sum(s[1] for s in SCENES)


def render_frame(gt):
    # 현재 씬 찾기
    acc = 0.0
    cur = SCENES[-1]
    lt = gt - (TOTAL - SCENES[-1][1])
    for name, dur, fn in SCENES:
        if gt < acc + dur or (name == SCENES[-1][0]):
            cur = (name, dur, fn)
            lt = gt - acc
            break
        acc += dur
    name, dur, fn = cur

    img = base_frame(gt, TOTAL)
    fn(img, lt, dur)

    frame = img.convert("RGB")

    # 씬 시작 0.3s: 흰색에서 페이드인 / 전체 마지막 0.4s: 흰색으로 페이드아웃
    fade_in = clamp(lt / 0.32)
    if fade_in < 1.0:
        frame = Image.blend(Image.new("RGB", (W, H), WHITE),
                            frame, ease_out_cubic(fade_in))
    tail = TOTAL - gt
    if tail < 0.45:
        frame = Image.blend(Image.new("RGB", (W, H), WHITE),
                            frame, ease_in_out(clamp(tail / 0.45)))
    return frame


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    n_frames = int(round(TOTAL * FPS))
    print(f"길이 {TOTAL:.1f}s · {n_frames} 프레임 · {W}x{H}@{FPS} -> {OUT_PATH}")
    writer = imageio.get_writer(
        OUT_PATH, fps=FPS, codec="libx264", quality=8,
        macro_block_size=8,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-profile:v", "high",
                       "-preset", "medium", "-movflags", "+faststart"],
    )
    try:
        for i in range(n_frames):
            gt = i / FPS
            frame = render_frame(gt)
            writer.append_data(_as_np(frame))
            if i % 30 == 0:
                print(f"  {i:4d}/{n_frames}  ({gt:4.1f}s)")
    finally:
        writer.close()
    size = os.path.getsize(OUT_PATH)
    print(f"완료: {OUT_PATH}  ({size/1024/1024:.2f} MB)")


def _as_np(img):
    import numpy as np
    return np.asarray(img)


if __name__ == "__main__":
    main()
