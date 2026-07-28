# -*- coding: utf-8 -*-
"""
경량 2D 모션그래픽 엔진 (가로 16:9, 흰 캔버스).

핵심 최적화: 배경이 흰색이므로 알파를 '흰색 쪽으로 색을 블렌드'해 표현하고
모든 요소를 RGB 캔버스에 불투명하게 직접 그린다(레이어 합성 없음 → 고속).

미래에셋 팔레트 기반. 그라데이션·이모지 없음, 샤프한 모서리.
"""
import math
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
MARGIN = 80

# ----------------------------------------------------------------- 팔레트
ORANGE      = (245, 130, 32)
ORANGE_ACT  = (203, 96, 21)
ORANGE_SOFT = (250, 176, 114)
ORANGE_TINT = (253, 236, 222)
BLUE        = (4, 59, 114)
BLUE_MID    = (0, 134, 184)
BLUE_SOFT   = (126, 159, 195)
TEAL        = (0, 169, 206)
INK         = (26, 26, 26)
BODY        = (61, 61, 61)
MUTED       = (108, 108, 108)
MUTED_SOFT  = (132, 136, 139)
HAIRLINE    = (205, 206, 203)
SURFACE     = (247, 248, 250)
SURFACE_2   = (236, 239, 244)
WHITE       = (255, 255, 255)
GREEN       = (46, 133, 64)
RED         = (198, 40, 40)
SKIN_A      = (245, 214, 185)
SKIN_B      = (232, 195, 165)

# ----------------------------------------------------------------- 폰트
def _font_dir():
    env = os.environ.get("RE_FONT_DIR")
    if env and os.path.isdir(env):
        return env
    local = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
    return local

_FD = _font_dir()
_CACHE = {}


def font(weight, size):
    key = (weight, size)
    if key not in _CACHE:
        _CACHE[key] = ImageFont.truetype(
            os.path.join(_FD, f"NotoSansKR-{weight}.ttf"), size)
    return _CACHE[key]


def black(s):  return font("Black", s)
def bold(s):   return font("Bold", s)
def med(s):    return font("Medium", s)
def reg(s):    return font("Regular", s)

# ----------------------------------------------------------------- 이징
def clamp(x, lo=0.0, hi=1.0): return max(lo, min(hi, x))
def lerp(a, b, t): return a + (b - a) * t
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def ease_io(t): t = clamp(t); return 3 * t * t - 2 * t * t * t
def ease_out_back(t):
    t = clamp(t); c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def seg(t, s, e):
    if e <= s: return 1.0 if t >= e else 0.0
    return clamp((t - s) / (e - s))


def mix(color, alpha, bg=WHITE):
    """알파(0~1)를 배경색 쪽 블렌드로 표현 → 불투명 색 반환."""
    a = clamp(alpha)
    return (int(round(lerp(bg[0], color[0], a))),
            int(round(lerp(bg[1], color[1], a))),
            int(round(lerp(bg[2], color[2], a))))

# ----------------------------------------------------------------- 캔버스
class Frame:
    def __init__(self, bg=WHITE):
        self.img = Image.new("RGB", (W, H), bg)
        self.d = ImageDraw.Draw(self.img)
        self.bg = bg

    def out(self, np):
        return np.asarray(self.img)

# ----------------------------------------------------------------- 기본 도형
def text(fr, xy, s, fnt, color, alpha=1.0, anchor="la", spacing=8,
         align="left", bg=None):
    if alpha <= 0.003:
        return
    fr.d.text(xy, s, font=fnt, fill=mix(color, alpha, bg or fr.bg),
              anchor=anchor, spacing=spacing, align=align)


def rrect(fr, box, color, alpha=1.0, radius=8, outline=None, ow=0, bg=None):
    if alpha <= 0.003:
        return
    b = bg or fr.bg
    ol = mix(outline, alpha, b) if outline else None
    fr.d.rounded_rectangle(box, radius=radius, fill=mix(color, alpha, b),
                           outline=ol, width=ow)


def rect(fr, box, color, alpha=1.0, bg=None):
    if alpha <= 0.003:
        return
    fr.d.rectangle(box, fill=mix(color, alpha, bg or fr.bg))


def line(fr, box, color, alpha=1.0, width=2, bg=None):
    if alpha <= 0.003:
        return
    fr.d.line(box, fill=mix(color, alpha, bg or fr.bg), width=width)


def polyline(fr, pts, color, alpha=1.0, width=5, bg=None):
    if alpha <= 0.003 or len(pts) < 2:
        return
    fr.d.line(pts, fill=mix(color, alpha, bg or fr.bg), width=width,
              joint="curve")


def polygon(fr, pts, color, alpha=1.0, outline=None, ow=0, bg=None):
    if alpha <= 0.003 or len(pts) < 3:
        return
    b = bg or fr.bg
    ol = mix(outline, alpha, b) if outline else None
    fr.d.polygon(pts, fill=mix(color, alpha, b), outline=ol, width=ow)


def dot(fr, c, r, color, alpha=1.0, outline=None, ow=0, bg=None):
    if alpha <= 0.003:
        return
    x, y = c
    b = bg or fr.bg
    ol = mix(outline, alpha, b) if outline else None
    fr.d.ellipse([x - r, y - r, x + r, y + r], fill=mix(color, alpha, b),
                 outline=ol, width=ow)


def measure(fnt, s):
    b = fnt.getbbox(s)
    return b[2] - b[0], b[3] - b[1]


def wrap(fnt, s, max_w):
    words = s.split(" ")
    lines, cur = [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip()
        if fnt.getlength(trial) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur); cur = w_
    if cur:
        lines.append(cur)
    return "\n".join(lines)

# ----------------------------------------------------------------- 공통 프레임 장식
def top_rule(fr, tag, sub, alpha=1.0):
    text(fr, (MARGIN, 40), tag, bold(22), ORANGE, alpha)
    if sub:
        text(fr, (W - MARGIN, 46), sub, med(20), MUTED, alpha, anchor="ra")
    line(fr, [(MARGIN, 86), (W - MARGIN, 86)], ORANGE, alpha, width=2)


def progress_bar(fr, p, chapter_label=""):
    y = H - 40
    line(fr, [(MARGIN, y), (W - MARGIN, y)], HAIRLINE, 1.0, width=3)
    line(fr, [(MARGIN, y), (MARGIN + (W - 2 * MARGIN) * clamp(p), y)],
         ORANGE, 1.0, width=3)
    if chapter_label:
        text(fr, (MARGIN, y - 34), chapter_label, med(19), MUTED_SOFT, 1.0)


def disclaimer(fr, alpha=1.0):
    text(fr, (W - MARGIN, H - 74),
         "본 영상은 2026년 7월 기준 교육용 개요이며, 실제 적용 전 최신 법령·세무/대출 상담 확인이 필요합니다.",
         reg(16), MUTED_SOFT, alpha, anchor="ra")

# ----------------------------------------------------------------- 섹션 타이틀(챕터 헤더)
def chapter_header(fr, no, title, lt, appear=0.0):
    a1 = ease_out(seg(lt, appear, appear + 0.5))
    # 번호 칩
    chip = 64
    x0, y0 = MARGIN, 120
    rrect(fr, [x0, y0, x0 + chip, y0 + chip], ORANGE, a1, radius=6)
    text(fr, (x0 + chip / 2, y0 + chip / 2), no, black(30), WHITE, a1,
         anchor="mm")
    a2 = ease_out(seg(lt, appear + 0.15, appear + 0.7))
    dx = (1 - a2) * 30
    text(fr, (x0 + chip + 28 + dx, y0 + chip / 2), title, black(46), INK, a2,
         anchor="lm")

# ----------------------------------------------------------------- 캐릭터(플랫 버스트)
# kind: 'host'(진행자), 'expert'(전문가/안경), 'a'(매수자A), 'b'(매수자B)
_PRESET = {
    "host":   dict(shirt=ORANGE,  hair=(52, 40, 33),  skin=SKIN_A, glasses=False, tie=True),
    "expert": dict(shirt=BLUE,    hair=(40, 40, 44),  skin=SKIN_B, glasses=True,  tie=True),
    "a":      dict(shirt=TEAL,    hair=(70, 50, 38),  skin=SKIN_A, glasses=False, tie=False),
    "b":      dict(shirt=(173,98,78), hair=(30,30,34),skin=SKIN_B, glasses=False, tie=False),
}


def person(fr, kind, cx, base_y, scale=1.0, alpha=1.0, look=0.0, talk=0.0):
    """
    흉상(머리+어깨) 플랫 캐릭터. base_y = 어깨 하단 기준선.
    look: 시선 좌우(-1~1). talk: 입 벌림(0~1).
    반환: (머리 상단 y, 머리 중심 x) — 말풍선 앵커용.
    """
    p = _PRESET[kind]
    s = scale
    head_r = 58 * s
    head_cy = base_y - 210 * s
    # 어깨/몸통
    body_top = head_cy + head_r - 6 * s
    bw = 210 * s
    poly = [
        (cx - bw / 2, base_y),
        (cx - bw / 2, body_top + 60 * s),
        (cx - bw / 2 + 40 * s, body_top),
        (cx + bw / 2 - 40 * s, body_top),
        (cx + bw / 2, body_top + 60 * s),
        (cx + bw / 2, base_y),
    ]
    polygon(fr, poly, p["shirt"], alpha)
    # 옷깃/넥타이
    if p["tie"]:
        polygon(fr, [(cx - 26 * s, body_top), (cx + 26 * s, body_top),
                     (cx, body_top + 40 * s)], WHITE, alpha)
        polygon(fr, [(cx - 9 * s, body_top + 18 * s), (cx + 9 * s, body_top + 18 * s),
                     (cx + 13 * s, base_y), (cx - 13 * s, base_y)],
                ORANGE_ACT if p["shirt"] != ORANGE else BLUE, alpha)
    else:
        polygon(fr, [(cx - 30 * s, body_top), (cx, body_top + 46 * s),
                     (cx - 6 * s, body_top)], WHITE, alpha)
        polygon(fr, [(cx + 30 * s, body_top), (cx, body_top + 46 * s),
                     (cx + 6 * s, body_top)], WHITE, alpha)
    # 목
    rect(fr, [cx - 20 * s, head_cy + head_r - 20 * s, cx + 20 * s, body_top + 8 * s],
         p["skin"], alpha)
    # 머리
    dot(fr, (cx, head_cy), head_r, p["skin"], alpha)
    # 헤어(위쪽 반원 + 옆)
    hair = p["hair"]
    fr.d.pieslice(
        [cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r],
        start=180, end=360, fill=mix(hair, alpha, fr.bg))
    rect(fr, [cx - head_r, head_cy - 10 * s, cx - head_r + 14 * s, head_cy + 26 * s],
         hair, alpha)
    rect(fr, [cx + head_r - 14 * s, head_cy - 10 * s, cx + head_r, head_cy + 26 * s],
         hair, alpha)
    # 눈
    eo = 22 * s
    ex = look * 6 * s
    ey = head_cy - 4 * s
    dot(fr, (cx - eo + ex, ey), 5 * s, INK, alpha)
    dot(fr, (cx + eo + ex, ey), 5 * s, INK, alpha)
    if p["glasses"]:
        r = 17 * s
        fr.d.ellipse([cx - eo - r, ey - r, cx - eo + r, ey + r],
                     outline=mix(INK, alpha, fr.bg), width=max(2, int(3 * s)))
        fr.d.ellipse([cx + eo - r, ey - r, cx + eo + r, ey + r],
                     outline=mix(INK, alpha, fr.bg), width=max(2, int(3 * s)))
        line(fr, [(cx - eo + r, ey), (cx + eo - r, ey)], INK, alpha,
             width=max(2, int(3 * s)))
    # 입 (talk 로 벌어짐)
    mw = 20 * s
    mh = 4 * s + talk * 14 * s
    my = head_cy + 26 * s
    fr.d.rounded_rectangle([cx - mw / 2, my - mh / 2, cx + mw / 2, my + mh / 2],
                           radius=int(mh / 2), fill=mix((150, 80, 70), alpha, fr.bg))
    return (head_cy - head_r, cx)


def speech(fr, x, y, w, text_str, fnt, alpha=1.0, tail="left",
           fill=SURFACE, tcolor=INK, pad=22, title=None, tfont=None,
           accent=ORANGE):
    """말풍선. (x,y)=좌상단. w=폭. 높이는 텍스트에 맞춰 자동."""
    if alpha <= 0.003:
        return 0
    inner_w = w - pad * 2
    wrapped = wrap(fnt, text_str, inner_w)
    lines = wrapped.split("\n")
    lh = fnt.size + 12
    th = lh * len(lines)
    extra = 0
    if title:
        extra = (tfont or bold(fnt.size + 4)).size + 14
    h = pad * 2 + th + extra
    rrect(fr, [x, y, x + w, y + h], fill, alpha, radius=14,
          outline=HAIRLINE, ow=2)
    # 좌측 강조 바
    rrect(fr, [x, y + 12, x + 6, y + h - 12], accent, alpha, radius=3)
    ty = y + pad
    if title:
        text(fr, (x + pad + 6, ty), title, tfont or bold(fnt.size + 4), accent,
             alpha, bg=fill)
        ty += extra
    text(fr, (x + pad + 6, ty), wrapped, fnt, tcolor, alpha, spacing=12, bg=fill)
    # 꼬리
    if tail == "left":
        polygon(fr, [(x + 34, y + h), (x + 70, y + h), (x + 30, y + h + 24)],
                fill, alpha)
    elif tail == "right":
        polygon(fr, [(x + w - 70, y + h), (x + w - 34, y + h),
                     (x + w - 30, y + h + 24)], fill, alpha)
    return h

# ----------------------------------------------------------------- 아이콘(벡터)
def _o(fr, box, color, alpha, w=4):
    fr.d.rounded_rectangle(box, radius=6, outline=mix(color, alpha, fr.bg), width=w)


def ic_house(fr, cx, cy, s, alpha=1.0, color=BLUE, accent=ORANGE):
    # 지붕
    polygon(fr, [(cx, cy - s), (cx - s, cy - s * 0.05), (cx + s, cy - s * 0.05)],
            accent, alpha)
    # 벽
    rrect(fr, [cx - s * 0.7, cy - s * 0.05, cx + s * 0.7, cy + s * 0.8],
          color, alpha, radius=6)
    # 문
    rrect(fr, [cx - s * 0.18, cy + s * 0.25, cx + s * 0.18, cy + s * 0.8],
          WHITE, alpha, radius=3)
    # 창
    rect(fr, [cx - s * 0.5, cy + s * 0.12, cx - s * 0.28, cy + s * 0.34], WHITE, alpha)
    rect(fr, [cx + s * 0.28, cy + s * 0.12, cx + s * 0.5, cy + s * 0.34], WHITE, alpha)


def ic_doc(fr, cx, cy, s, alpha=1.0, color=BLUE, accent=ORANGE):
    x0, y0, x1, y1 = cx - s * 0.55, cy - s * 0.75, cx + s * 0.55, cy + s * 0.75
    rrect(fr, [x0, y0, x1, y1], WHITE, alpha, radius=8, outline=color, ow=4)
    for i, yy in enumerate([-0.35, -0.12, 0.11, 0.34]):
        w_ = 0.8 if i < 3 else 0.5
        line(fr, [(cx - s * 0.32, cy + s * yy),
                  (cx - s * 0.32 + s * w_, cy + s * yy)], color, alpha, width=3)
    # 상단 강조
    rrect(fr, [x0, y0, x1, y0 + s * 0.16], accent, alpha, radius=8)


def ic_won(fr, cx, cy, s, alpha=1.0, color=ORANGE):
    dot(fr, (cx, cy), s * 0.8, color, alpha)
    dot(fr, (cx, cy), s * 0.62, WHITE, alpha)
    text(fr, (cx, cy + 2), "₩", bold(int(s * 1.0)), color, alpha, anchor="mm",
         bg=WHITE)


def ic_coins(fr, cx, cy, s, alpha=1.0, color=ORANGE, color2=ORANGE_SOFT):
    for i, dy in enumerate([0.5, 0.16, -0.18]):
        c = color if i == 2 else color2
        fr.d.ellipse([cx - s * 0.75, cy + s * dy - s * 0.16,
                      cx + s * 0.75, cy + s * dy + s * 0.16],
                     fill=mix(c, alpha, fr.bg), outline=mix(color, alpha, fr.bg),
                     width=3)


def ic_pin(fr, cx, cy, s, alpha=1.0, color=ORANGE):
    top = cy - s * 0.7
    fr.d.pieslice([cx - s * 0.6, top - s * 0.6, cx + s * 0.6, top + s * 0.6],
                  0, 360, fill=mix(color, alpha, fr.bg))
    polygon(fr, [(cx - s * 0.42, top + s * 0.32), (cx + s * 0.42, top + s * 0.32),
                 (cx, cy + s * 0.75)], color, alpha)
    dot(fr, (cx, top), s * 0.24, WHITE, alpha)


def ic_stamp(fr, cx, cy, s, alpha=1.0, color=RED):
    rrect(fr, [cx - s * 0.18, cy - s * 0.7, cx + s * 0.18, cy + s * 0.05],
          color, alpha, radius=6)
    rrect(fr, [cx - s * 0.5, cy + s * 0.0, cx + s * 0.5, cy + s * 0.22],
          color, alpha, radius=6)
    line(fr, [(cx - s * 0.7, cy + s * 0.45), (cx + s * 0.7, cy + s * 0.45)],
         MUTED, alpha, width=4)


def ic_bank(fr, cx, cy, s, alpha=1.0, color=BLUE, accent=ORANGE):
    polygon(fr, [(cx, cy - s * 0.7), (cx - s * 0.8, cy - s * 0.25),
                 (cx + s * 0.8, cy - s * 0.25)], accent, alpha)
    for dx in (-0.55, -0.18, 0.18, 0.55):
        rect(fr, [cx + s * dx - s * 0.07, cy - s * 0.2,
                  cx + s * dx + s * 0.07, cy + s * 0.45], color, alpha)
    rrect(fr, [cx - s * 0.8, cy + s * 0.45, cx + s * 0.8, cy + s * 0.6],
          color, alpha, radius=3)


def ic_key(fr, cx, cy, s, alpha=1.0, color=ORANGE):
    fr.d.ellipse([cx - s * 0.7, cy - s * 0.35, cx - s * 0.1, cy + s * 0.25],
                 outline=mix(color, alpha, fr.bg), width=max(4, int(s * 0.16)))
    line(fr, [(cx - s * 0.16, cy), (cx + s * 0.75, cy)], color, alpha,
         width=max(4, int(s * 0.16)))
    line(fr, [(cx + s * 0.55, cy), (cx + s * 0.55, cy + s * 0.28)], color, alpha,
         width=max(4, int(s * 0.16)))
    line(fr, [(cx + s * 0.75, cy), (cx + s * 0.75, cy + s * 0.2)], color, alpha,
         width=max(4, int(s * 0.16)))


def ic_pct(fr, cx, cy, s, alpha=1.0, color=BLUE):
    dot(fr, (cx - s * 0.35, cy - s * 0.35), s * 0.2, color, alpha)
    dot(fr, (cx + s * 0.35, cy + s * 0.35), s * 0.2, color, alpha)
    line(fr, [(cx - s * 0.55, cy + s * 0.55), (cx + s * 0.55, cy - s * 0.55)],
         color, alpha, width=max(4, int(s * 0.14)))


def ic_lock(fr, cx, cy, s, alpha=1.0, color=BLUE):
    fr.d.arc([cx - s * 0.4, cy - s * 0.7, cx + s * 0.4, cy + s * 0.1],
             180, 360, fill=mix(color, alpha, fr.bg), width=max(4, int(s * 0.14)))
    rrect(fr, [cx - s * 0.5, cy - s * 0.2, cx + s * 0.5, cy + s * 0.6],
          color, alpha, radius=6)
    dot(fr, (cx, cy + s * 0.18), s * 0.1, WHITE, alpha)


def ic_check(fr, cx, cy, s, alpha=1.0, color=GREEN):
    dot(fr, (cx, cy), s * 0.7, color, alpha)
    polyline(fr, [(cx - s * 0.32, cy), (cx - s * 0.08, cy + s * 0.26),
                  (cx + s * 0.34, cy - s * 0.28)], WHITE, alpha,
             width=max(5, int(s * 0.16)))


def ic_warn(fr, cx, cy, s, alpha=1.0, color=(212, 160, 23)):
    polygon(fr, [(cx, cy - s * 0.7), (cx - s * 0.75, cy + s * 0.55),
                 (cx + s * 0.75, cy + s * 0.55)], color, alpha)
    rect(fr, [cx - s * 0.07, cy - s * 0.25, cx + s * 0.07, cy + s * 0.2], WHITE, alpha)
    dot(fr, (cx, cy + s * 0.38), s * 0.08, WHITE, alpha)


def ic_calendar(fr, cx, cy, s, alpha=1.0, color=BLUE, accent=ORANGE):
    rrect(fr, [cx - s * 0.65, cy - s * 0.6, cx + s * 0.65, cy + s * 0.65],
          WHITE, alpha, radius=8, outline=color, ow=4)
    rrect(fr, [cx - s * 0.65, cy - s * 0.6, cx + s * 0.65, cy - s * 0.28],
          accent, alpha, radius=8)
    line(fr, [(cx - s * 0.35, cy - s * 0.75), (cx - s * 0.35, cy - s * 0.45)],
         color, alpha, width=4)
    line(fr, [(cx + s * 0.35, cy - s * 0.75), (cx + s * 0.35, cy - s * 0.45)],
         color, alpha, width=4)


ICONS = {
    "house": ic_house, "doc": ic_doc, "won": ic_won, "coins": ic_coins,
    "pin": ic_pin, "stamp": ic_stamp, "bank": ic_bank, "key": ic_key,
    "pct": ic_pct, "lock": ic_lock, "check": ic_check, "warn": ic_warn,
    "cal": ic_calendar,
}
