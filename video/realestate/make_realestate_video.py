# -*- coding: utf-8 -*-
"""
부동산 세금·대출·규제 이해하기 (가로 16:9 강의형 설명 영상) 생성기.

- 순수 Python(Pillow) + imageio-ffmpeg 인코딩. engine.py 사용.
- 미래에셋 브랜드. 캐릭터 대화 + 아이콘/다이어그램 혼합.
- 모든 수치·문구는 아래 CONTENT 에 모아둠 → 기준일 갱신은 이 부분만 수정.
- 기준일: 2026년 7월. 교육용 개요이며 실제 적용 전 최신 법령·상담 확인 필요.

사용:
    pip install pillow imageio imageio-ffmpeg numpy
    python3 make_realestate_video.py     # -> out/realestate_tax_guide.mp4
"""
import os
import numpy as np
import imageio.v2 as imageio

import engine as e
from engine import (Frame, seg, ease_out, ease_io, ease_out_back, clamp, lerp,
                    text, rrect, rect, line, polyline, polygon, dot, wrap,
                    W, H, MARGIN, ICONS,
                    ORANGE, ORANGE_ACT, ORANGE_SOFT, ORANGE_TINT, BLUE, BLUE_MID,
                    TEAL, INK, BODY, MUTED, MUTED_SOFT, HAIRLINE, SURFACE,
                    SURFACE_2, WHITE, GREEN, RED)

FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out")
OUT_PATH = os.path.join(OUT_DIR, "realestate_tax_guide.mp4")

# ==================================================================
#  CONTENT  — 2026년 7월 기준(교육용). 수치 갱신은 여기만 수정.
# ==================================================================
BRAND = "부동산 세금·대출·규제 한눈에"

# 리서치 확정치로 채워짐(update 단계에서 반영)
C = {}   # 각 챕터 콘텐츠 딕셔너리는 build_content() 에서 구성

# ------------------------------------------------------------------ 레이아웃 헬퍼
def wrapper(fr, gt, chapter_label, show_disc=True):
    e.top_rule(fr, BRAND, "2026년 7월 기준 · 교육용", 1.0)
    e.progress_bar(fr, gt / TOTAL, chapter_label)
    if show_disc:
        e.disclaimer(fr, 1.0)


CONTENT_X = 470   # 오른쪽 콘텐츠 시작 x (좌측은 화자 전용 컬럼)


def mini_speaker(fr, kind, lt, title, bubble, start=0.1, talk_phase=0.0,
                 bubble_w=350):
    """좌측 컬럼: 상단 말풍선 + 하단 소형 화자 (오른쪽 콘텐츠와 분리)."""
    import math
    a = ease_out(seg(lt, start, start + 0.5))
    base_y = H - 78
    talk = (0.5 + 0.5 * math.sin((lt + talk_phase) * 8)) if a > 0.95 else 0.15
    e.person(fr, kind, 215, base_y, scale=0.5, alpha=a, look=0.2,
             talk=max(0.0, talk) * 0.8)
    if bubble:
        e.speech(fr, 80, 225, bubble_w, bubble, e.med(23), alpha=a,
                 title=title, tfont=e.bold(21), tail="left")


def card(fr, box, lt, start, label, value, unit="", sub="", color=ORANGE,
         icon=None):
    x0, y0, x1, y1 = box
    a = ease_out(seg(lt, start, start + 0.55))
    dy = (1 - a) * 26
    Y0, Y1 = y0 + dy, y1 + dy
    rrect(fr, [x0, Y0, x1, Y1], WHITE, a, radius=10, outline=HAIRLINE, ow=2)
    rrect(fr, [x0, Y0, x0 + 8, Y1], color, a, radius=4)
    cx = x0 + 34
    if icon:
        ICONS[icon](fr, x1 - 46, Y0 + 42, 24, a, color=color)
    text(fr, (cx, Y0 + 22), label, e.med(22), MUTED, a)
    vfont = e.black(46)
    text(fr, (cx, Y0 + 56), value, vfont, color, a)
    if unit:
        vw = vfont.getlength(value)
        text(fr, (cx + vw + 10, Y0 + 56 + 46), unit, e.bold(24), INK, a,
             anchor="ls")
    if sub:
        text(fr, (cx, Y1 - 32), sub, e.reg(20), BODY, a)


def list_row(fr, x, y, w, lt, start, icon, head, sub, color=BLUE):
    a = ease_out(seg(lt, start, start + 0.5))
    dx = (1 - a) * 34
    r = 30
    ICONS[icon](fr, x + r, y + r + 4, r - 4, a, color=color)
    text(fr, (x + 2 * r + 22 + dx, y + 4), head, e.bold(30), INK, a)
    if sub:
        text(fr, (x + 2 * r + 22 + dx, y + 44), wrap(e.reg(23), sub, w - 2 * r - 40),
             e.reg(23), BODY, a, spacing=8)


def table(fr, x, y, col_w, rows, lt, start, header=None, highlight_last=False,
          row_h=58):
    """간단 표. rows = [[c1,c2,...], ...]. col_w = [w1,w2,...]."""
    tw = sum(col_w)
    yy = y
    if header:
        a = ease_out(seg(lt, start, start + 0.4))
        rrect(fr, [x, yy, x + tw, yy + row_h], ORANGE_SOFT, a, radius=8)
        cx = x
        for c, w_ in zip(header, col_w):
            text(fr, (cx + w_ / 2, yy + row_h / 2), c, e.bold(24), INK, a,
                 anchor="mm")
            cx += w_
        yy += row_h
    for i, row in enumerate(rows):
        a = ease_out(seg(lt, start + 0.3 + i * 0.18, start + 0.9 + i * 0.18))
        last = highlight_last and i == len(rows) - 1
        bgc = ORANGE_TINT if last else (SURFACE if i % 2 else WHITE)
        rect(fr, [x, yy, x + tw, yy + row_h], bgc, a)
        line(fr, [(x, yy + row_h), (x + tw, yy + row_h)], HAIRLINE, a, width=1)
        cx = x
        for j, (cval, w_) in enumerate(zip(row, col_w)):
            col = ORANGE_ACT if last else (INK if j == 0 else BODY)
            fnt = e.bold(24) if (j == 0 or last) else e.med(24)
            text(fr, (cx + w_ / 2, yy + row_h / 2), cval, fnt, col, a, anchor="mm")
            cx += w_
        yy += row_h
    # 외곽선
    aa = ease_out(seg(lt, start, start + 1.0))
    fr.d.rounded_rectangle([x, y, x + tw, yy], radius=8,
                           outline=e.mix(HAIRLINE, aa, WHITE), width=2)
    return yy

# ==================================================================
#  씬 함수들
# ==================================================================
def sc_intro(fr, lt, dur):
    # 타이틀
    a1 = ease_out(seg(lt, 0.2, 1.0))
    text(fr, (MARGIN, 150 + (1 - a1) * 30), "부동산, 살 때부터 팔 때까지", e.black(58),
         INK, a1)
    a2 = ease_out(seg(lt, 0.5, 1.3))
    text(fr, (MARGIN, 228 + (1 - a2) * 30),
         "세금 · 대출 · 규제 한 번에 이해하기", e.black(58), ORANGE, a2)
    ua = ease_out(seg(lt, 1.2, 1.9))
    rect(fr, [MARGIN, 320, MARGIN + 360 * ua, 328], ORANGE)
    a3 = ease_out(seg(lt, 1.8, 2.6))
    text(fr, (MARGIN, 360), "2026년 7월 기준 · 중급 수준 · 교육용 개요", e.med(28),
         MUTED, a3)

    # 4인 등장(스태거)
    order = [("host", 300), ("expert", 560), ("a", 820), ("b", 1060)]
    import math
    for i, (kind, cx) in enumerate(order):
        st = 2.4 + i * 0.35
        pa = ease_out(seg(lt, st, st + 0.6))
        base_y = H - 30 + (1 - pa) * 120
        talk = 0.6 * (0.5 + 0.5 * math.sin(lt * 7 + i)) if kind == "host" and pa > 0.9 else 0.1
        e.person(fr, kind, cx, base_y, scale=0.62, alpha=pa,
                 look=0.0, talk=max(0.0, talk))
    # 진행자 말풍선
    ba = ease_out(seg(lt, 3.6, 4.3))
    e.speech(fr, 90, 430, 560,
             "취득세부터 양도세까지, 그리고 대출·규제 규칙을 사례로 쉽게 풀어드릴게요.",
             e.med(25), alpha=ba, title="진행자 · 세무/대출 가이드",
             tfont=e.bold(23))


def sc_agenda(fr, lt, dur):
    e.chapter_header(fr, "▶", "오늘 다룰 3가지", lt, 0.0)
    groups = [
        ("pin", "살 때 규제", "규제지역·토지거래허가·자금조달계획"),
        ("won", "낼 때 세금", "취득세·재산세·종부세·양도세·임대소득세"),
        ("bank", "빌릴 때 규칙", "LTV·DSR·스트레스DSR·대출한도"),
    ]
    cw = 360
    gap = 30
    x0 = (W - (cw * 3 + gap * 2)) / 2
    for i, (icon, head, sub) in enumerate(groups):
        st = 0.7 + i * 0.4
        a = ease_out(seg(lt, st, st + 0.6))
        x = x0 + i * (cw + gap)
        y = 250
        rrect(fr, [x, y + (1 - a) * 30, x + cw, y + 300 + (1 - a) * 30],
              SURFACE, a, radius=14)
        ICONS[icon](fr, x + cw / 2, y + 90, 52, a, color=ORANGE)
        text(fr, (x + cw / 2, y + 180), head, e.black(38), INK, a, anchor="mm")
        text(fr, (x + cw / 2, y + 235),
             wrap(e.med(21), sub, cw - 60), e.med(21), BODY, a,
             anchor="ma", align="center", spacing=8)


def _rows(fr, lt, key, y0, step, x=CONTENT_X, w=None, base=0.7, gap=0.38):
    w = w if w else (W - x - 70)
    for i, (icon, head, sub, col) in enumerate(C[key]["rows"]):
        list_row(fr, x, y0 + i * step, w, lt, base + i * gap, icon, head, sub,
                 color=col)


def sc_regions(fr, lt, dur):
    e.chapter_header(fr, "01", "살 때 ① 규제지역·토지거래허가", lt, 0.0)
    mini_speaker(fr, "expert", lt, "세무·대출 전문가", C["regions"]["say"], 0.3)
    _rows(fr, lt, "regions", 205, 118)


def sc_acq_tax(fr, lt, dur):
    e.chapter_header(fr, "02", "낼 때 ① 취득세", lt, 0.0)
    mini_speaker(fr, "a", lt, "매수자 A", C["acq"]["say"], 0.3)
    yy = table(fr, CONTENT_X, 165, [280, 230, 200], C["acq"]["rows"], lt, 0.6,
               header=C["acq"]["header"], highlight_last=True, row_h=50)
    text(fr, (CONTENT_X, yy + 10), C["acq"]["caption"], e.reg(20), MUTED,
         ease_out(seg(lt, 1.6, 2.1)))
    for i, (icon, head, sub, col) in enumerate(C["acq"]["notes"]):
        list_row(fr, CONTENT_X, yy + 52 + i * 88, W - CONTENT_X - 70, lt,
                 1.9 + i * 0.35, icon, head, sub, color=col)


def sc_loan(fr, lt, dur):
    e.chapter_header(fr, "03", "빌릴 때 대출 규제", lt, 0.0)
    mini_speaker(fr, "b", lt, "매수자 B", C["loan"]["say"], 0.3)
    _rows(fr, lt, "loan", 200, 116)


def sc_prop_tax(fr, lt, dur):
    e.chapter_header(fr, "04", "가질 때 ① 재산세", lt, 0.0)
    mini_speaker(fr, "expert", lt, "세무·대출 전문가", C["prop"]["say"], 0.3)
    _rows(fr, lt, "prop", 205, 118)


def sc_comp_tax(fr, lt, dur):
    e.chapter_header(fr, "05", "가질 때 ② 종합부동산세", lt, 0.0)
    mini_speaker(fr, "a", lt, "매수자 A", C["comp"]["say"], 0.3)
    card(fr, [CONTENT_X, 195, CONTENT_X + 355, 350], lt, 0.6, *C["comp"]["c1"],
         color=BLUE, icon="house")
    card(fr, [CONTENT_X + 385, 195, W - 70, 350], lt, 0.9, *C["comp"]["c2"],
         color=ORANGE, icon="won")
    for i, (icon, head, sub, col) in enumerate(C["comp"]["rows"]):
        list_row(fr, CONTENT_X, 385 + i * 108, W - CONTENT_X - 70, lt,
                 1.4 + i * 0.36, icon, head, sub, color=col)


def sc_transfer_tax(fr, lt, dur):
    e.chapter_header(fr, "06", "팔 때 양도소득세", lt, 0.0)
    mini_speaker(fr, "b", lt, "매수자 B", C["trans"]["say"], 0.3)
    _rows(fr, lt, "trans", 205, 116)


def sc_rent_tax(fr, lt, dur):
    e.chapter_header(fr, "07", "빌려줄 때 임대소득세", lt, 0.0)
    mini_speaker(fr, "expert", lt, "세무·대출 전문가", C["rent"]["say"], 0.3)
    yy = table(fr, CONTENT_X, 200, [320, 400], C["rent"]["rows"], lt, 0.6,
               header=C["rent"]["header"])
    for i, (icon, head, sub, col) in enumerate(C["rent"]["notes"]):
        list_row(fr, CONTENT_X, yy + 40 + i * 116, W - CONTENT_X - 70, lt,
                 1.7 + i * 0.36, icon, head, sub, color=col)


def sc_summary(fr, lt, dur):
    a1 = ease_out(seg(lt, 0.2, 0.9))
    text(fr, (W / 2, 140), "핵심만 다시", e.black(50), INK, a1, anchor="mm")
    ua = ease_out(seg(lt, 0.8, 1.4))
    rect(fr, [W / 2 - 110 * ua, 182, W / 2 + 110 * ua, 188], ORANGE)
    for i, (no, txt) in enumerate(C["summary"]):
        st = 1.0 + i * 0.4
        a = ease_out(seg(lt, st, st + 0.6))
        y = 232 + i * 78
        x = 250
        chip = 52
        rrect(fr, [x, y, x + chip, y + chip], ORANGE, a, radius=6)
        text(fr, (x + chip / 2, y + chip / 2), no, e.black(26), WHITE, a,
             anchor="mm")
        text(fr, (x + chip + 24 + (1 - a) * 20, y + chip / 2), txt, e.bold(28),
             INK, a, anchor="lm")
    ea = ease_out(seg(lt, 3.0, 3.8))
    rrect(fr, [200, H - 168, W - 200, H - 96], ORANGE_TINT, ea, radius=12)
    text(fr, (W / 2, H - 132),
         "규칙은 자주 바뀝니다 — 매수·매도 전 최신 기준과 전문가 상담을 꼭 확인하세요.",
         e.med(25), ORANGE_ACT, ea, anchor="mm", bg=e.mix(ORANGE_TINT, ea, WHITE))


# ==================================================================
#  콘텐츠 채우기 (2026-07 기준 · 리서치 반영 지점)
# ==================================================================
def build_content():
    global C
    C = {
        "regions": {
            "say": "2025~2026년 규제가 다시 강해졌어요. 서울 전역과 수도권 상당수가 규제지역입니다.",
            "rows": [
                ("pin", "규제지역 재확대",
                 "2025.10 서울 전역·경기 12곳 지정, 2026.7 화성 동탄·용인 기흥·구리 추가. 규제지역은 LTV 축소·전입의무 강화.", ORANGE),
                ("stamp", "토지거래허가구역",
                 "강남3구·용산 등 아파트는 구청 허가가 있어야 매매. 원칙적으로 실거주 목적만 허용돼 갭투자가 막힙니다.", RED),
                ("doc", "자금조달계획서·실거주",
                 "규제지역 주택은 자금 출처를 신고해야 하고, 대출을 받으면 6개월 내 전입 의무가 붙습니다.", BLUE),
            ],
        },
        "acq": {
            "say": "집을 사면 가장 먼저 내는 세금이 취득세예요. 가격·주택수로 갈려요.",
            "header": ["구분", "취득가액", "세율"],
            "rows": [
                ["1주택", "6억 이하", "1%"],
                ["1주택", "6억~9억", "1~3%"],
                ["1주택", "9억 초과", "3%"],
                ["조정2·3주택↑·법인", "중과", "8~12%"],
            ],
            "caption": "※ 다주택 취득세 중과 완화안은 아직 미입법 — 현행 8~12% 그대로 적용",
            "notes": [
                ("check", "생애최초 감면",
                 "12억↓·무주택이면 취득세 최대 200만원 감면(소득요건 폐지).", GREEN),
                ("doc", "함께 붙는 세금",
                 "농특세(전용 85㎡ 초과)·지방교육세가 함께 부과됩니다.", BLUE),
            ],
        },
        "loan": {
            "say": "대출은 2025~2026년에 특히 빡빡해졌어요. LTV·DSR·한도를 같이 보세요.",
            "rows": [
                ("pct", "LTV (담보인정비율)",
                 "비규제 최대 70%, 규제지역은 40~50%로 축소. 생애최초는 규제지역에서도 70%(전입의무 등 병행).", BLUE),
                ("doc", "스트레스 DSR 3단계",
                 "2025.7 시행. 미래 금리상승분(수도권 +1.5%p)을 더해 상환능력을 더 보수적으로 심사합니다.", ORANGE),
                ("lock", "6·27 대책 한도·조건",
                 "수도권·규제지역 주담대 최대 6억, 6개월 내 전입 의무, 다주택자의 추가 구입용 주담대는 금지.", RED),
            ],
        },
        "prop": {
            "say": "매년 6월 1일 소유자가 보유세를 내요. 먼저 재산세부터 볼게요.",
            "rows": [
                ("cal", "과세기준일 6월 1일",
                 "이 날 소유자가 그해 재산세·종부세 납세의무자. 잔금·등기일 조정이 중요합니다.", ORANGE),
                ("house", "공정시장가액비율",
                 "공시가격 × 비율로 과세표준을 계산. 1주택 특례 43~45%, 그 외·다주택은 60%.", BLUE),
                ("pct", "세율 0.1~0.4%",
                 "과세표준 구간별 누진. 공시 9억 이하 1주택은 특례로 0.05%p 인하됩니다.", GREEN),
            ],
        },
        "comp": {
            "say": "종부세는 고가·다주택에 붙는 국세예요. 공제선과 최근 변화가 핵심!",
            "c1": ["1세대 1주택 공제", "12억", "원", "인별 기준"],
            "c2": ["일반(다주택 등)", "9억", "원", "합산 공제"],
            "rows": [
                ("pct", "세율·중과",
                 "2주택 이하 0.5~2.7%, 3주택 이상은 0.5~5.0%(과표 12억 초과분 중과). 세부담상한 150%.", BLUE),
                ("warn", "2026 개편 주의",
                 "공정시장가액비율(현 60%) 상향(80~100%)이 검토 중 — 확정 시 보유세 부담이 커질 수 있어요.", RED),
            ],
        },
        "trans": {
            "say": "팔아서 차익이 나면 양도세! 2026년에 큰 변화가 있었어요.",
            "rows": [
                ("house", "1세대 1주택 비과세",
                 "2년 보유(조정지역 취득분은 2년 거주)면 양도가 12억까지 비과세, 초과분만 과세.", GREEN),
                ("pct", "장기보유특별공제",
                 "1주택 고가주택은 보유+거주로 최대 80% 공제. 단기 양도는 1년 미만 70%, 1~2년 60%로 높음.", BLUE),
                ("warn", "다주택 중과 부활",
                 "조정지역 다주택 중과 유예가 2026.5.9 종료 → 5.10부터 기본세율 +20~30%p가 다시 적용.", RED),
            ],
        },
        "rent": {
            "say": "월세·전세를 놓으면 임대소득세도 챙겨야 해요.",
            "header": ["연 임대수입", "과세 방법"],
            "rows": [
                ["2천만원 이하", "분리과세 14% 또는 종합과세 선택"],
                ["2천만원 초과", "다른 소득과 합산해 종합과세"],
            ],
            "notes": [
                ("house", "과세 대상 판단",
                 "1주택은 원칙 비과세(단 기준시가 12억 초과 월세는 과세), 2주택 이상 월세는 과세.", BLUE),
                ("won", "간주임대료",
                 "3주택 이상은 전세보증금(합계 3억 초과분)에도 과세. 2026년부터 고가 2주택도 편입.", ORANGE),
            ],
        },
        "summary": [
            ("1", "살 때: 규제지역·토지거래허가 확대 — 서울 전역·수도권 다수"),
            ("2", "낼 때: 취득세(중과 8~12% 유지) → 보유세(6.1 기준) → 양도세"),
            ("3", "양도세 다주택 중과 2026.5.10 부활 — 매도 타이밍 주의"),
            ("4", "빌릴 때: 6·27 대책 6억 한도·전입의무, 스트레스 DSR 3단계"),
        ],
    }


# ==================================================================
#  타임라인
# ==================================================================
SCENES = [
    ("INTRO",              "여는 말",            13.0, sc_intro),
    ("AGENDA",             "오늘 다룰 3가지",     11.0, sc_agenda),
    ("CH01 살 때 · 규제",   "규제지역·토지거래허가", 27.0, sc_regions),
    ("CH02 낼 때 · 취득세", "취득세",             26.0, sc_acq_tax),
    ("CH03 빌릴 때 · 대출", "대출 규제",           27.0, sc_loan),
    ("CH04 가질 때 · 재산세","재산세",             22.0, sc_prop_tax),
    ("CH05 가질 때 · 종부세","종합부동산세",        25.0, sc_comp_tax),
    ("CH06 팔 때 · 양도세", "양도소득세",          26.0, sc_transfer_tax),
    ("CH07 임대 · 임대소득세","임대소득세",         23.0, sc_rent_tax),
    ("SUMMARY",            "핵심 요약",           16.0, sc_summary),
]
TOTAL = sum(s[2] for s in SCENES)


def render_frame(gt):
    acc = 0.0
    chosen = SCENES[-1]
    lt = gt - (TOTAL - SCENES[-1][2])
    for label, chp, dur, fn in SCENES:
        if gt < acc + dur:
            chosen = (label, chp, dur, fn)
            lt = gt - acc
            break
        acc += dur
    label, chp, dur, fn = chosen

    fr = Frame()
    wrapper(fr, gt, label, show_disc=fn not in (sc_intro, sc_summary))
    fn(fr, lt, dur)

    img = fr.img
    # 씬 시작 페이드인 / 전체 끝 페이드아웃
    fi = clamp(lt / 0.3)
    if fi < 1.0:
        img = _blend_white(img, ease_out(fi))
    tail = TOTAL - gt
    if tail < 0.5:
        img = _blend_white(img, ease_io(clamp(tail / 0.5)))
    return img


def _blend_white(img, a):
    from PIL import Image
    return Image.blend(Image.new("RGB", (W, H), WHITE), img, a)


def main():
    build_content()
    os.makedirs(OUT_DIR, exist_ok=True)
    n = int(round(TOTAL * FPS))
    print(f"길이 {TOTAL:.0f}s · {n} 프레임 · {W}x{H}@{FPS}")
    writer = imageio.get_writer(
        OUT_PATH, fps=FPS, codec="libx264", quality=8, macro_block_size=8,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-profile:v", "high",
                       "-preset", "medium", "-movflags", "+faststart"])
    try:
        for i in range(n):
            writer.append_data(np.asarray(render_frame(i / FPS)))
            if i % 60 == 0:
                print(f"  {i:4d}/{n}")
    finally:
        writer.close()
    print(f"완료: {OUT_PATH}  ({os.path.getsize(OUT_PATH)/1024/1024:.2f} MB)")


if __name__ == "__main__":
    main()
