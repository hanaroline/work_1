# -*- coding: utf-8 -*-
"""2026-08-22(토) 해외 증시 브리핑 — 주말 판.

국내 장이 열리지 않는 날이라 간밤 해외 마감을 앞에 두고 직전 국내 마감(8/21)은
「되짚기」로 뒤에 둔다(지침 7-3절).

축 둘.
① **이번 주를 지배한 것은 경기가 아니라 금리였다.** 미 재무부가 바이백을 두 배로
   늘렸는데도 30년물은 5.276%, 10년물은 4.737% 로 올라섰다. 21일 하루는 강한
   서비스업에 반등했지만 **주간으로는 S&P·나스닥이 3주 연속 상승을 끝냈다.**
② **국내는 두 종목이 시장을 대신했다.** 삼성전자 110조 주주환원에 코스피는
   +0.88% 올랐는데 **오른 종목은 193개, 내린 종목은 683개**였고 코스닥은
   **−4.63%** 였다. 삼전닉스가 코스피 시총의 50.93%, 거래대금의 54.44% 다.

표의 숫자는 전부 data/market/latest.json 에서 계산한다.
설명은 note 열에만 둔다. 작성 시각은 시계에서 읽는다.
"""
import json, io, re, datetime

ROOT = "/home/user/work_1"
SCR = "/tmp/claude-0/-home-user-work-1/bedbaced-75fb-50f2-a2d1-7c1cd6b73740/scratchpad"
OUT = ROOT + "/docs/briefings/beta/2026-08-22-global-beta.html"

NOW = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
HHMM = NOW.strftime("%H:%M")

D = json.load(io.open(ROOT + "/data/market/latest.json", encoding="utf-8"))
H = json.load(io.open(ROOT + "/data/market/history.json", encoding="utf-8"))
I, FX = D["indices"], D["fx"]
MI = D["market_internals"]


def n(v, d=2):
    if v is None: return "&mdash;"
    return ("{:,.%df}" % d).format(v)

def pct(v, d=2, plus=True):
    if v is None: return '<span class="mut">&mdash;</span>'
    s = ("{:+,.%df}" % d).format(v) if plus else ("{:,.%df}" % d).format(v)
    s = s.replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="' + cls + '">' + s + '%</span>'

def bp(v, d=1):
    if v is None: return '<span class="mut">&mdash;</span>'
    s = ("{:+,.%df}" % d).format(v).replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="' + cls + '">' + s + 'bp</span>'

def cell(v, d=2, plus=True):
    return '<td class="n">' + pct(v, d, plus) + '</td>'

def perf_cells(p, unit="%"):
    f = bp if unit == "bp" else (lambda x: pct(x))
    out = []
    for k in ("w1", "m1", "m3", "ytd"):
        v = (p or {}).get(k)
        out.append('<td class="n perf">' + (f(v) if v is not None else '<span class="mut">&mdash;</span>') + '</td>')
    return "".join(out)

def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def L(ko, en):
    return '<span data-lang-ko>' + ko + '</span><span data-lang-en>' + en + '</span>'

def P(ko, en):
    return '<p>' + L(ko, en) + '</p>'

def note(v):
    return esc(v.get("note_ko") or ""), esc(v.get("note_en") or v.get("note_ko") or "")

def jo(eok, d=2):
    if eok is None: return "&mdash;"
    return n(eok / 10000.0, d) + "조"

def signjo(eok, d=2):
    if eok is None: return '<span class="mut">&mdash;</span>'
    v = eok / 10000.0
    s = ("{:+,.%df}" % d).format(v).replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="' + cls + '">' + s + '조</span>'

def signeok(eok, d=0):
    if eok is None: return '<span class="mut">&mdash;</span>'
    s = ("{:+,.%df}" % d).format(eok).replace("-", "&minus;")
    cls = "up" if eok > 0 else ("down" if eok < 0 else "flat")
    return '<span class="' + cls + '">' + s + '억</span>'


KS, KQ = I["kospi"], I["kosdaq"]
KSI, KQI = MI["kospi"], MI["kosdaq"]
kd = D["index_daily"]["kospi"]["series"]
qd = D["index_daily"]["kosdaq"]["series"]
S42 = D["stocks"]
ru = D["rates_us"]
ec = D["rates_ecos"]
rkr = D["rates_kr"]
kf, qf = KSI["investor_flows"], KQI["investor_flows"]
fu = D["futures"]
mfl = D["money_flow"]["latest"]

def fw(mi, close):
    f = mi["fifty_two_week"]
    return (close - f["low"]) / (f["high"] - f["low"]) * 100.0

KS_POS, KQ_POS = fw(KSI, KS["close"]), fw(KQI, KQ["close"])
KS_VAL = kd[0]["value_mn_krw"] / 1000000.0
KQ_VAL = qd[0]["value_mn_krw"] / 1000000.0

VF_MD = '<span class="vf ok">MARKET DATA</span>'
VF_2 = '<span class="vf ok">2 SOURCES</span>'
VF_1 = '<span class="vf solo">1 SOURCE</span>'
VF_C = '<span class="vf ok">CALCULATED</span>'
VF_N = '<span class="vf none">NOT FOUND</span>'

S = []
def sec(sid, ko, en, body):
    S.append('<section class="section" id="' + sid + '">\n  <div class="section-rule"></div>\n'
             '  <span class="sec-num">00</span>\n'
             '  <h2 class="section-title">' + L(ko, en) + '</h2>\n' + body + '\n</section>')

def tbl(cap_ko, cap_en, head, rows, cls="data", foot_ko=None, foot_en=None):
    out = ['<div class="table-wrap">\n<table class="' + cls + '">']
    out.append('  <caption>' + L(cap_ko, cap_en) + '</caption>')
    out.append('  <thead><tr>' + "".join(head) + '</tr></thead>')
    out.append('  <tbody>\n' + "\n".join(rows) + '\n  </tbody>')
    out.append('</table>\n</div>')
    if foot_ko:
        out.append('<p class="cap">' + L(foot_ko, foot_en or foot_ko) + '</p>')
    return "\n".join(out)

TH = lambda ko, en, c="": '<th class="' + c + '">' + L(ko, en) + '</th>'
THP = lambda: (TH("1주", "1W", "n perf") + TH("1개월", "1M", "n perf")
               + TH("3개월", "3M", "n perf") + TH("연초", "YTD", "n perf"))

def exp(sum_ko, sum_en, body):
    return ('<details class="exp">\n  <summary>' + L(sum_ko, sum_en) + '</summary>\n'
            '  <div class="exp-body">\n' + body + '\n  </div>\n</details>')

def stat(lab_ko, lab_en, val, chg, nk, ne, small=False):
    return ('<div class="stat">\n  <p class="stat-label">' + L(lab_ko, lab_en) + '</p>\n'
            '  <p class="stat-value' + (" sm" if small else "") + '">' + val + '</p>\n'
            '  <p class="stat-chg">' + chg + '</p>\n'
            '  <p class="stat-note">' + L(nk, ne) + '</p>\n</div>')

def view(tk, te, bk, be):
    return ('<div class="view">\n  <p class="view-title">' + L(tk, te) + '</p>\n'
            '  <p>' + L(bk, be) + '</p>\n</div>')



# 주간 누적 — 직전 금요일(8/14) 종가 기준
KS_FRI, KQ_FRI = 6977.94, 864.65
KS_WK = (KS["close"] / KS_FRI - 1) * 100.0
KQ_WK = (KQ["close"] / KQ_FRI - 1) * 100.0
ksb, kqb = KSI["breadth"], KQI["breadth"]

idx_head = [TH("지수", "Index", "wrap"), TH("설명", "What it says", "note wrap"), TH("종가", "Close", "n"),
            TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
def irows(spec, hl_keys=()):
    out = []
    for k, ko, en, sk, se in spec:
        v = I[k]
        out.append('      <tr' + (' class="hl"' if k in hl_keys else '') + '><th class="wrap">' + L(ko, en) + '</th>'
                   '<td class="n note">' + L(sk, se) + '</td>'
                   '<td class="n">' + n(v["close"]) + '</td>' + cell(v["change_pct"]) +
                   perf_cells(v.get("perf")) + '<td class="n opt">' + VF_2 + '</td></tr>')
    return out

def frow(ko, en, nk, ne, a, b, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td>'
            '<td class="n">' + a + '</td><td class="n">' + b + '</td>'
            '<td class="n">' + VF_MD + '</td></tr>')

def furow(ko, en, nk, ne, val, vf=VF_MD, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td><td class="n">' + val + '</td>'
            '<td class="n">' + vf + '</td></tr>')


# ══════════════════════════════════════════════════════════════════
# 01 한눈에 보는 핵심
# ══════════════════════════════════════════════════════════════════
cards = [
    stat("S&amp;P 500", "S&amp;P 500", n(I["sp500"]["close"]), pct(I["sp500"]["change_pct"]),
         "하루는 반등, <strong>주간은 3주 연속 상승 마감</strong>", "A day up, but <strong>the three-week run ended</strong>"),
    stat("미 30년물", "US 30-year", n(ru["curve"]["ust30y"], 3) + "%", bp(ru["change_bp"]["ust30y"]),
         "<strong>바이백을 두 배로 늘렸는데도 올랐습니다</strong>", "<strong>Up even after buybacks doubled</strong>"),
    stat("SOX (반도체)", "SOX (semis)", n(I["sox"]["close"]), pct(I["sox"]["change_pct"]),
         "주간 <strong>&minus;5.45%</strong> &mdash; 기술주가 한 주 3% 넘게 밀렸습니다",
         "<strong>&minus;5.45% on the week</strong> as tech fell over 3%"),
    stat("브렌트유", "Brent", "$" + n(I["brent"]["close"]), pct(I["brent"]["change_pct"]),
         "<strong>6거래일 연속 상승</strong> &mdash; 주간 +6.04%", "<strong>Six sessions up</strong> &mdash; +6.04% on the week"),
    stat("금", "Gold", "$" + n(I["gold"]["close"]), pct(I["gold"]["change_pct"]),
         "주간 +6.42%, <strong>1개월 +14.50%</strong>", "+6.42% on the week, <strong>+14.50% in a month</strong>"),
    stat("비트코인", "Bitcoin", "$" + n(I["btc"]["close"], 0), pct(I["btc"]["change_pct"]),
         "<strong>주간 +24.39%</strong> &mdash; 장중 7만 9,000달러", "<strong>+24.39% on the week</strong>, 79,000 intraday"),
    stat("코스피 (8/21 마감)", "KOSPI (21 Aug close)", n(KS["close"]), pct(KS["change_pct"]),
         "<strong>오른 종목 193 대 내린 종목 683</strong>", "<strong>193 up against 683 down</strong>"),
    stat("코스닥 (8/21 마감)", "KOSDAQ (21 Aug close)", n(KQ["close"]), pct(KQ["change_pct"]),
         "주간 <strong>" + pct(KQ_WK) + "</strong> &mdash; 코스피와 갈렸습니다",
         "<strong>" + pct(KQ_WK) + " on the week</strong> &mdash; it split from the KOSPI"),
]

# 베타 — 외국계 IB · 투자전문가가 한 말을 1층에 한 줄씩 세운다.
# 따로 절을 만들지 않는다. 모아 두면 맥락이 사라지고, 그 말이 걸리는 절
# 안에서 뜻이 산다. 여기서는 「오늘 누가 무슨 말을 했나」만 훑게 한다.
IBM = (D.get("ib_mentions") or {}).get("mentions") or []
if IBM:
    _lis = "\n".join(
        '    <li><span class="who">' + esc(m["who"]) + '</span>'
        '<span class="sq">' + L(esc(m["sentence"])[:210], esc(m["sentence"])[:210]) + '</span></li>'
        for m in IBM[:6])
    ib_html = ('<div class="ibline">\n  <p class="h">' + L(
        "오늘 외국계 IB &middot; 투자전문가가 한 말 &mdash; 기사 본문에서 그대로 옮겼습니다 " + VF_1,
        "What foreign banks and investors said today &mdash; quoted from article bodies " + VF_1)
        + '</p>\n  <ul>\n' + _lis + '\n  </ul>\n</div>')
else:
    ib_html = ('<div class="ibline">\n  <p class="h">' + L(
        "오늘 수집분에는 외국계 IB &middot; 투자전문가 언급이 없습니다 " + VF_N,
        "No foreign-bank or investor commentary in today's collection " + VF_N) + '</p>\n</div>')

check = """
<div class="callout">
  <p class="callout-title">%s</p>
  %s
  %s
  %s
</div>""" % (
 L("다음 국내 거래일(8월 24일 월요일)에 들고 갈 것 셋",
   "Three things to carry into the next Korean session, Monday 24 August"),
 P("<strong>① 이번 주를 지배한 것은 경기가 아니라 금리였습니다.</strong> 미 재무부가 19일 장기채 바이백을 최소 두 배로 "
   "늘렸는데도 <strong>30년물은 " + n(ru["curve"]["ust30y"], 3) + "%, 10년물은 " + n(ru["curve"]["ust10y"], 3) +
   "%</strong> 로 올라섰습니다 " + VF_2 + ". 이번 주는 <strong>21일 하루만</strong> 반등했고 "
   "<strong>S&amp;P·나스닥은 3주 연속 상승을 끝냈으며 기술주는 한 주 3% 넘게 밀렸습니다</strong>. "
   "패트릭 암스트롱(플루리미웰스)의 말이 이번 주를 요약합니다 &mdash; 「<strong>무제한 대차대조표를 가진 연준이 아닌 이상 "
   "결국 시장이 이긴다</strong>」 " + VF_1 + ".",
   "<strong>① What ruled this week was rates, not growth.</strong> Even after the Treasury at least doubled its long-bond buybacks "
   "on the 19th, the <strong>30-year rose to " + n(ru["curve"]["ust30y"], 3) + "% and the 10-year to " +
   n(ru["curve"]["ust10y"], 3) + "%</strong> " + VF_2 + ". Only <strong>the 21st</strong> rebounded; "
   "<strong>the S&amp;P and NASDAQ ended a three-week run and tech fell more than 3% over the week</strong>. Patrick Armstrong of "
   "Plurimi Wealth summed it up: <strong>&lsquo;unless you are the Fed with an unlimited balance sheet, the market wins&rsquo;</strong> " + VF_1 + "."),
 P("<strong>② 국내는 두 종목이 시장을 대신했습니다.</strong> 삼성전자가 <strong>최대 110조원 주주환원</strong>을 의결하자 "
   "코스피는 " + pct(KS["change_pct"]) + " 올랐는데, <strong>오른 종목은 " + n(ksb["advancing"], 0) + "개, 내린 종목은 " +
   n(ksb["declining"], 0) + "개</strong>였고 코스닥은 <strong>" + pct(KQ["change_pct"]) + "</strong> 였습니다 " + VF_MD +
   ". 삼전닉스 두 종목이 <strong>코스피 시가총액의 50.93%, 거래대금의 54.44%</strong> 를 차지합니다 &mdash; 1년 전 23.07% 에서 두 배가 "
   "됐습니다 " + VF_1 + ". <strong>지수를 보고 시장을 짐작하면 틀리는 국면</strong>입니다.",
   "<strong>② In Korea two stocks stood in for the market.</strong> After Samsung Electronics approved a return of "
   "<strong>up to KRW 110tn</strong>, the KOSPI rose " + pct(KS["change_pct"]) + " &mdash; yet <strong>" +
   n(ksb["advancing"], 0) + " stocks rose against " + n(ksb["declining"], 0) + " that fell</strong>, and the KOSDAQ fell " +
   pct(KQ["change_pct"]) + " " + VF_MD + ". The two names now make up <strong>50.93% of KOSPI market capitalisation and 54.44% of "
   "turnover</strong>, double the 23.07% of a year ago " + VF_1 + ". <strong>Reading the market off the index will mislead you here.</strong>"),
 P("<strong>③ 월요일 아침에는 새 해외 마감이 하나뿐입니다.</strong> 주말이라 8월 21일 뉴욕 마감이 마지막이고, "
   "<strong>그 뒤로 국내가 받을 새 재료는 없습니다.</strong> 대신 다음 주에 셋이 몰려 있습니다 &mdash; "
   "<strong>8/24 베선트 재무장관의 국채시장 대응 계획</strong>, <strong>8/26 엔비디아 실적</strong>, "
   "<strong>8/28 케빈 워시 연준 의장 잭슨홀 연설</strong> " + VF_1 + ". "
   "<strong>월요일은 조용히 열리고 화요일부터 무거워집니다.</strong>",
   "<strong>③ Monday morning brings only one new overseas close.</strong> The 21 August New York session is the last before the "
   "weekend, so <strong>no fresh material arrives until then.</strong> Next week carries three events instead &mdash; "
   "<strong>Bessent&rsquo;s Treasury-market plan on the 24th</strong>, <strong>Nvidia&rsquo;s results on the 26th</strong> and "
   "<strong>Fed Chair Kevin Warsh at Jackson Hole on the 28th</strong> " + VF_1 +
   ". <strong>Monday opens quietly; the weight arrives from Tuesday.</strong>"))

regions = '<div class="views">\n' + "\n".join([
 view("미국 &mdash; 하루는 반등, 한 주는 하락", "United States &mdash; a day up, a week down",
      "21일 다우 " + pct(I["dow"]["change_pct"]) + ", S&amp;P " + pct(I["sp500"]["change_pct"]) + ", 나스닥 " +
      pct(I["nasdaq"]["change_pct"]) + " 로 반등했습니다. 끌어올린 것은 <strong>8월 서비스업 활동이 20개월 만에 가장 빠르게 "
      "성장</strong>했다는 S&amp;P글로벌 지표입니다 " + VF_1 + ". 그런데 <strong>반도체는 또 빠졌습니다</strong> &mdash; SOX " +
      pct(I["sox"]["change_pct"]) + ", 엔비디아 &minus;0.98%, 마이크론 &minus;0.77%. 오른 것은 테슬라(+5.14%)와 "
      "<strong>비트코인 관련주</strong>였습니다.",
      "On the 21st the Dow rose " + pct(I["dow"]["change_pct"]) + ", the S&amp;P " + pct(I["sp500"]["change_pct"]) +
      " and the NASDAQ " + pct(I["nasdaq"]["change_pct"]) + ", lifted by S&amp;P Global data showing <strong>August services "
      "activity growing at its fastest in 20 months</strong> " + VF_1 + ". <strong>Semiconductors fell again</strong> &mdash; the "
      "SOX " + pct(I["sox"]["change_pct"]) + ", Nvidia &minus;0.98%, Micron &minus;0.77%. The winners were Tesla (+5.14%) and "
      "<strong>crypto-linked names</strong>."),
 view("금리 &middot; 유가 &mdash; 이번 주의 진짜 주제", "Rates and oil &mdash; the week&rsquo;s real subject",
      "<strong>이번엔 곡선 전체가 올랐습니다</strong> &mdash; 2년 " + bp(ru["change_bp"]["ust2y"]) + ", 10년 " +
      bp(ru["change_bp"]["ust10y"]) + ", 30년 " + bp(ru["change_bp"]["ust30y"]) + ". "
      "20일에는 긴 쪽만 움직였는데 21일에는 <strong>짧은 쪽까지 같이 올랐습니다</strong> " + VF_2 + " &mdash; 강한 경기지표가 "
      "연준 기대까지 건드렸다는 뜻입니다. 여기에 <strong>브렌트가 6거래일 연속 올라 주간 +6.04%</strong> 입니다. "
      "레오 켈리(버던스캐피털)는 「10년물이 <strong>6~7%로 가면 문제</strong>」라고 했습니다 " + VF_1 + ".",
      "<strong>This time the whole curve moved</strong> &mdash; the 2-year " + bp(ru["change_bp"]["ust2y"]) + ", the 10-year " +
      bp(ru["change_bp"]["ust10y"]) + ", the 30-year " + bp(ru["change_bp"]["ust30y"]) + ". On the 20th only the long end moved; on "
      "the 21st <strong>the short end joined</strong> " + VF_2 + " &mdash; strong data reaching into Fed expectations. Brent has now "
      "risen <strong>six sessions in a row, +6.04% on the week</strong>. Leo Kelly of Verdence warned that <strong>a move to 6&ndash;7% "
      "on the 10-year would be a problem</strong> " + VF_1 + "."),
 view("유럽 &mdash; 모처럼 고르게 올랐습니다", "Europe &mdash; a rare broad advance",
      "STOXX 600 " + pct(I["stoxx600"]["change_pct"]) + ", DAX " + pct(I["dax"]["change_pct"]) + ", FTSE 100 " +
      pct(I["ftse"]["change_pct"]) + ", IBEX " + pct(I["ibex"]["change_pct"]) + " 로 <strong>주요 지수가 모두 올랐습니다.</strong> "
      "이번 주 내내 제자리였던 것과 대비됩니다 &mdash; 유럽은 뉴욕보다 먼저 닫으므로 <strong>21일 미국 서비스업 지표를 장중에 "
      "받은 첫 시장</strong>이었습니다 " + VF_C + ".",
      "The STOXX 600 rose " + pct(I["stoxx600"]["change_pct"]) + ", the DAX " + pct(I["dax"]["change_pct"]) + ", the FTSE 100 " +
      pct(I["ftse"]["change_pct"]) + " and the IBEX " + pct(I["ibex"]["change_pct"]) + " &mdash; <strong>every major index "
      "advanced</strong>, in contrast to a flat week. Europe closes before New York, so it was <strong>the first market to trade the "
      "21 August services data</strong> " + VF_C + "."),
 view("아시아 &mdash; 홍콩만 뚜렷하게 올랐습니다", "Asia &mdash; only Hong Kong clearly rose",
      "항셍 " + pct(I["hangseng"]["change_pct"]) + ", 가권 " + pct(I["taiwan"]["change_pct"]) + " 가 올랐고 닛케이 " +
      pct(I["nikkei"]["change_pct"]) + ", ASX 200 " + pct(I["asx200"]["change_pct"]) + " 는 내렸습니다. 상하이는 " +
      pct(I["shanghai"]["change_pct"]) + " 로 사실상 제자리입니다. <strong>코스피 " + pct(KS["change_pct"]) +
      " 는 아시아 안에서 중간이지만, 그 안을 들여다보면 이야기가 다릅니다</strong> &mdash; 「국내 증시 되짚기」 절을 보십시오.",
      "The Hang Seng rose " + pct(I["hangseng"]["change_pct"]) + " and the TAIEX " + pct(I["taiwan"]["change_pct"]) +
      ", while the Nikkei fell " + pct(I["nikkei"]["change_pct"]) + " and the ASX 200 " + pct(I["asx200"]["change_pct"]) +
      ". Shanghai was flat at " + pct(I["shanghai"]["change_pct"]) + ". <strong>The KOSPI&rsquo;s " + pct(KS["change_pct"]) +
      " sits mid-pack in Asia, but the inside of that number tells another story</strong> &mdash; see the Korea section."),
]) + '\n</div>'

sec("keypoints", "한눈에 보는 핵심", "Key Takeaways",
    '<div class="stat-grid eight">\n' + "\n".join(cards) + '\n</div>\n' + check + '\n' + regions)


# ══════════════════════════════════════════════════════════════════
# 02 미국 증시 마감
# ══════════════════════════════════════════════════════════════════
US_IDX = [("dow", "다우", "Dow", "강한 서비스업 지표가 끌어올렸습니다", "Lifted by strong services data"),
          ("sp500", "S&amp;P 500", "S&amp;P 500", "<strong>3주 연속 상승이 끝났습니다</strong>", "<strong>A three-week run ended</strong>"),
          ("nasdaq", "나스닥", "NASDAQ", "기술주는 한 주 3% 넘게 밀렸습니다", "Tech fell more than 3% on the week"),
          ("sox", "SOX (반도체)", "SOX (semis)", "<strong>주간 &minus;5.45%</strong> &mdash; 반등에도 끼지 못했습니다",
           "<strong>&minus;5.45% on the week</strong> &mdash; it missed the rebound"),
          ("russell", "러셀 2000", "Russell 2000", "중소형주", "Small caps"),
          ("vix", "VIX", "VIX", "15선으로 내려왔습니다", "Back to the 15 handle"),
          ("move", "MOVE", "MOVE", "<strong>채권 변동성</strong>. 주간 +5.49% 로 주식보다 불안했습니다",
           "<strong>Bond volatility</strong> &mdash; +5.49% on the week, more restless than equities")]
us_idx_t = tbl("미국 지수 &mdash; 8월 21일(현지) 마감", "US indices &mdash; close, 21 August local",
    idx_head, irows(US_IDX, ("sox", "dow")), cls="data compact",
    foot_ko="<strong>하루와 한 주를 갈라 보십시오.</strong> 21일은 셋 다 올랐지만 「1주」 열은 전부 마이너스입니다 &mdash; "
      "S&amp;P " + pct(I["sp500"]["perf"]["w1"]) + ", 나스닥 " + pct(I["nasdaq"]["perf"]["w1"]) + ", SOX " +
      pct(I["sox"]["perf"]["w1"]) + ". <strong>이번 주는 19일 바이백 발표에 오르고, 20일 금리 반등에 내리고, 21일 경기지표에 "
      "다시 오른 시소였습니다</strong>(크리스 자카렐리, 노스라이트) " + VF_1 + ".",
    foot_en="<strong>Separate the day from the week.</strong> All three rose on the 21st, yet every &lsquo;1W&rsquo; figure is "
      "negative &mdash; the S&amp;P " + pct(I["sp500"]["perf"]["w1"]) + ", the NASDAQ " + pct(I["nasdaq"]["perf"]["w1"]) +
      " and the SOX " + pct(I["sox"]["perf"]["w1"]) + ". <strong>The week was a seesaw</strong>: up on the buyback announcement of "
      "the 19th, down on the yield rebound of the 20th, up again on the data of the 21st (Chris Zaccarelli, Northlight) " + VF_1 + ".")

USW = {
 "테슬라": ("<strong>이날 상승 1위</strong>", "<strong>The day&rsquo;s biggest riser</strong>"),
 "엔비디아": ("<strong>8월 26일 실적 발표를 앞두고 있습니다</strong>", "<strong>Results due 26 August</strong>"),
 "마이크론": ("전날 +3.97% 를 일부 되돌렸습니다", "It gave back part of the previous day&rsquo;s 3.97%"),
 "애플": ("&nbsp;", "&nbsp;"), "아마존": ("&nbsp;", "&nbsp;"), "알파벳": ("&nbsp;", "&nbsp;"),
 "브로드컴": ("&nbsp;", "&nbsp;"), "AMD": ("&nbsp;", "&nbsp;"), "TSMC": ("&nbsp;", "&nbsp;"),
 "메타": ("&nbsp;", "&nbsp;"), "마이크로소프트": ("&nbsp;", "&nbsp;"), "ASML": ("&nbsp;", "&nbsp;"),
}
stk_head = [TH("종목", "Name", "wrap"), TH("사유 &middot; 설명", "Why", "note wrap"), TH("종가", "Close", "n"),
            TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
us_stk_rows = []
for k, v in sorted(D["us_stocks"].items(), key=lambda kv: -(kv[1].get("change_pct") or 0)):
    wk, we = USW.get(k, ("&nbsp;", "&nbsp;"))
    hl = ' class="hl"' if k in ("테슬라", "엔비디아") else ''
    us_stk_rows.append('      <tr' + hl + '><th class="wrap">' + esc(k) + '</th>'
                       '<td class="n note">' + L(wk, we) + '</td>'
                       '<td class="n">' + n(v["close"]) + '</td>' + cell(v["change_pct"]) +
                       perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
us_stk = tbl("미국 주요 종목 &mdash; 8월 21일, 단위 달러", "US stocks &mdash; 21 August, in dollars", stk_head, us_stk_rows,
    cls="data compact",
    foot_ko="<strong>반도체 안에서도 갈렸습니다</strong> &mdash; 브로드컴 +1.21%, AMD +0.81%, TSMC +0.71% 는 올랐는데 "
      "<strong>엔비디아 &minus;0.98%, 마이크론 &minus;0.77%</strong> 입니다. 비트코인 급등에 로빈후드 약 14%, 코인베이스 8%, "
      "스트래티지 6.1% 가 올랐습니다(표에 없음) " + VF_1 + ".",
    foot_en="<strong>Even within chips it split</strong> &mdash; Broadcom +1.21%, AMD +0.81% and TSMC +0.71% rose while "
      "<strong>Nvidia fell 0.98% and Micron 0.77%</strong>. On the bitcoin surge Robinhood gained about 14%, Coinbase 8% and "
      "Strategy 6.1% (not in this table) " + VF_1 + ".")

sect_rows = []
for k, v in sorted(D["us_sectors"].items(), key=lambda kv: -(kv[1].get("change_pct") or 0)):
    hl = ' class="hl"' if k in ("유틸리티", "소재") else ''
    sect_rows.append('      <tr' + hl + '><th class="wrap">' + esc(k) + '</th>'
                     '<td class="n">' + n(v["close"]) + '</td>' + cell(v["change_pct"]) +
                     perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
us_sec = tbl("S&amp;P 500 업종 ETF &mdash; 8월 21일", "S&amp;P 500 sector ETFs &mdash; 21 August",
    [TH("업종", "Sector", "wrap"), TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
     TH("검증", "Verified", "n opt")], sect_rows, cls="data compact",
    foot_ko="<strong>맨 아래가 유틸리티(&minus;2.28%)</strong>인 것이 이날의 성격을 말합니다 &mdash; 배당으로 사는 업종이라 "
      "<strong>금리가 오르면 가장 먼저 밀립니다</strong> " + VF_C + ". 반대로 소재(+2.14%)는 금&middot;구리 강세를 그대로 받았습니다. "
      "에너지가 &minus;0.17% 로 내린 것은 이날 WTI 가 &minus;1.35% 였기 때문입니다.",
    foot_en="<strong>Utilities at the bottom (&minus;2.28%)</strong> tells you what kind of day it was &mdash; a sector bought for "
      "yield is <strong>the first to give way when rates rise</strong> " + VF_C + ". Materials (+2.14%) took the strength in gold and "
      "copper straight through. Energy slipped 0.17% because WTI fell 1.35% on the day."
    + "\n" + ib_html)

sec("us", "미국 증시 마감", "US Equities Close",
    '<p class="lede">' + L(
      "<strong>21일 뉴욕은 반등했습니다</strong> &mdash; 다우 " + pct(I["dow"]["change_pct"]) + ", S&amp;P " +
      pct(I["sp500"]["change_pct"]) + ", 나스닥 " + pct(I["nasdaq"]["change_pct"]) + ". 끌어올린 것은 <strong>8월 서비스업 활동이 "
      "20개월 만에 가장 빠른 속도로 성장</strong>했다는 S&amp;P글로벌 속보치입니다. 제조업은 재고 축적 둔화와 이란 전쟁에 따른 공급 "
      "차질로 약해졌지만 서비스업이 이를 덮었습니다 " + VF_1 + ". "
      "<strong>다만 한 주 전체로는 하락입니다</strong> &mdash; S&amp;P·나스닥은 3주 연속 상승을 끝냈고, 다우는 2주 연속 내렸으며, "
      "기술주는 한 주 3% 넘게 밀렸습니다.",
      "<strong>New York rebounded on the 21st</strong> &mdash; the Dow " + pct(I["dow"]["change_pct"]) + ", the S&amp;P " +
      pct(I["sp500"]["change_pct"]) + ", the NASDAQ " + pct(I["nasdaq"]["change_pct"]) + ". The lift came from S&amp;P Global&rsquo;s "
      "flash reading showing <strong>August services activity growing at its fastest pace in 20 months</strong>. Manufacturing "
      "weakened on slower restocking and war-related supply disruption, but services more than covered it " + VF_1 + ". "
      "<strong>The week as a whole was still down</strong>: the S&amp;P and NASDAQ ended three-week winning runs, the Dow fell for a "
      "second week, and technology lost more than 3%.") + '</p>\n' + us_idx_t + '\n' + us_stk + '\n' + us_sec)


# ══════════════════════════════════════════════════════════════════
# 03 이번 주를 지배한 것 — 금리와 유가 (조건부 절)
# ══════════════════════════════════════════════════════════════════
wk_head = [TH("날짜", "Date", "wrap"), TH("무슨 일이 있었나", "What happened", "note wrap"),
           TH("30년물", "30-year", "n"), TH("S&amp;P 500", "S&amp;P 500", "n"), TH("검증", "Verified", "n opt")]
WEEK = [
 ("8/19 (수)", "Wed 19 Aug",
  "<strong>미 재무부가 장기채 바이백을 회당 최소 20억 &rarr; 40억달러로 확대</strong>한다고 발표. 30년물이 약 10bp 급락",
  "<strong>The Treasury doubled long-bond buybacks</strong> from at least USD 2bn to USD 4bn per operation; the 30-year fell about 10bp",
  "5.19%", "&mdash;", True),
 ("8/20 (목)", "Thu 20 Aug",
  "<strong>하루 만에 되돌림.</strong> 베선트 장관이 「더 늘릴 수 있다」고 했는데도 금리가 재상승. 월마트 &minus;9.15%",
  "<strong>Undone in a day.</strong> Yields rose again even as Bessent said buybacks could grow. Walmart fell 9.15%",
  "5.24%", "&minus;0.87%", False),
 ("8/21 (금)", "Fri 21 Aug",
  "<strong>강한 서비스업에 증시만 반등.</strong> 금리는 계속 올라 30년물 5.276%, 10년물 4.737%",
  "<strong>Equities alone rebounded on strong services data.</strong> Yields kept rising: 30-year 5.276%, 10-year 4.737%",
  n(ru["curve"]["ust30y"], 3) + "%", pct(I["sp500"]["change_pct"]), True),
]
wkrows = []
for dk, de, nk_, ne_, y, sp, hl in WEEK:
    wkrows.append('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(dk, de) + '</th>'
                  '<td class="n note">' + L(nk_, ne_) + '</td>'
                  '<td class="n">' + y + '</td><td class="n">' + sp + '</td>'
                  '<td class="n opt">' + VF_2 + '</td></tr>')
week_tbl = tbl("이번 주 사흘 &mdash; 바이백은 무엇을 못 했나", "Three sessions &mdash; what the buyback could not do",
    wk_head, wkrows, cls="data compact",
    foot_ko="<strong>바이백은 수급을 잠깐 고쳤을 뿐 원인을 건드리지 못했습니다.</strong> 마크 말렉(뮤리엘시버트)이 꼽은 원인은 넷입니다 "
      "&mdash; <strong>인플레이션 불확실성, 막대한 재정적자, 국채 공급, 기간 프리미엄</strong> " + VF_1 + ". "
      "여기에 미 국가부채가 40조달러를 넘어섰고 AI 투자용 회사채 발행까지 국채와 자금을 다툽니다. "
      "ING 는 이 조치를 <strong>「타이타닉호에서 갑판 의자를 옮기는 일」</strong>에 비유했습니다.",
    foot_en="<strong>The buyback fixed the flow for a moment and left the cause untouched.</strong> Mark Malek of Muriel Siebert "
      "lists four: <strong>inflation uncertainty, the deficit, Treasury supply and the term premium</strong> " + VF_1 +
      ". US debt has passed USD 40tn and AI-driven corporate issuance competes with Treasuries for the same money. ING likened the "
      "measure to <strong>&lsquo;rearranging deck chairs on the Titanic&rsquo;</strong>.")

oil_tbl = tbl("유가 &mdash; 6거래일 연속 상승", "Crude &mdash; six sessions higher",
    [TH("항목", "Measure", "wrap"), TH("설명", "What it says", "note wrap"), TH("값", "Value", "n"),
     TH("검증", "Verified", "n")], [
      furow("브렌트유", "Brent", "<strong>6거래일 연속 상승</strong>. 배럴당 94달러대까지 올랐습니다",
            "<strong>Six sessions up</strong>, reaching the USD 94 area",
            "$" + n(I["brent"]["close"]) + " (주간 " + pct(I["brent"]["perf"]["w1"]) + ")", VF_2, True),
      furow("WTI", "WTI", "이날은 &minus;1.35% 였지만 주간으로는 +5.15% 입니다",
            "Down 1.35% on the day but +5.15% on the week",
            "$" + n(I["wti"]["close"]) + " (주간 " + pct(I["wti"]["perf"]["w1"]) + ")"),
      furow("왜 오르나", "Why", "트럼프 대통령이 <strong>이란과 거래하는 국가에도 경제 제재</strong>를 경고했습니다. "
            "베선트 장관은 <strong>8월 24일 대이란 압박 계획</strong>을 공개하겠다고 예고했습니다",
            "President Trump warned of sanctions on <strong>countries trading with Iran</strong>, and Bessent will publish an "
            "<strong>Iran pressure plan on 24 August</strong>",
            "&mdash;", VF_1),
      furow("무엇을 뜻하나", "What it means",
            "<strong>유가는 물가를 밀어 연준의 인하 여지를 줄이고, 그만큼 장기금리에 추가 상승 압력이 됩니다</strong> &mdash; "
            "금리 이야기와 한 몸입니다",
            "<strong>Oil feeds inflation, narrows the room to cut and adds pressure to long yields</strong> &mdash; it is part of the "
            "same rate story", "&mdash;", VF_1, True),
    ], cls="data compact")

sec("jobs", "이번 주를 지배한 것 &mdash; 금리와 유가", "What Ruled the Week &mdash; Rates and Oil",
    '<p class="lede">' + L(
      "<strong>이번 주 월가를 지배한 것은 경기가 아니라 금리였습니다.</strong> 미 재무부가 <strong>이례적으로 장기채 바이백을 두 배로 "
      "늘렸는데도</strong> 30년물은 " + n(ru["curve"]["ust30y"], 3) + "%, 10년물은 " + n(ru["curve"]["ust10y"], 3) + "% 로 올라섰습니다. "
      "「<strong>30년물 금리를 통제하려 할 때는 무제한 대차대조표를 가진 연준이 아닌 이상 결국 시장이 이깁니다</strong>」 "
      "&mdash; 패트릭 암스트롱(플루리미웰스) " + VF_1 + ". "
      "여기에 <strong>브렌트가 6거래일 연속 올라</strong> 인플레이션 쪽에서도 압력이 붙었습니다.",
      "<strong>What ruled Wall Street this week was rates, not growth.</strong> Even after the Treasury took the unusual step of "
      "<strong>doubling its long-bond buybacks</strong>, the 30-year rose to " + n(ru["curve"]["ust30y"], 3) + "% and the 10-year to " +
      n(ru["curve"]["ust10y"], 3) + "%. <strong>&lsquo;When you try to control the 30-year, unless you are the Fed with an unlimited "
      "balance sheet, the market wins in the end&rsquo;</strong> &mdash; Patrick Armstrong, Plurimi Wealth " + VF_1 +
      ". And with <strong>Brent up for six straight sessions</strong>, pressure is building on the inflation side too.")
    + '</p>\n' + week_tbl + '\n' + oil_tbl)


# ══════════════════════════════════════════════════════════════════
# 04 금리 · 채권시장
# ══════════════════════════════════════════════════════════════════
US_LAB = [("ust3m", "3개월", "3-month"), ("ust6m", "6개월", "6-month"), ("ust1y", "1년", "1-year"),
          ("ust2y", "2년", "2-year"), ("ust3y", "3년", "3-year"), ("ust5y", "5년", "5-year"),
          ("ust7y", "7년", "7-year"), ("ust10y", "10년", "10-year"), ("ust20y", "20년", "20-year"),
          ("ust30y", "30년", "30-year")]
us_curve_rows = []
for k, ko, en in US_LAB:
    p = ru["perf"].get(k) or {}
    hl = ' class="hl"' if k in ("ust2y", "ust10y", "ust30y") else ''
    us_curve_rows.append('      <tr' + hl + '><th class="wrap">' + L(ko, en) + '</th>'
                         '<td class="n">' + n(ru["curve"][k], 3) + '%</td>'
                         '<td class="n">' + bp(ru["change_bp"][k]) + '</td>'
                         + "".join('<td class="n perf">' + (bp(p.get(x)) if p.get(x) is not None
                                                            else '<span class="mut">&mdash;</span>') + '</td>'
                                   for x in ("w1", "m1", "m3", "ytd"))
                         + '<td class="n opt">' + VF_2 + '</td></tr>')
us_curve = tbl("미 재무부 확정 곡선 &mdash; 8월 21일", "US Treasury official curve &mdash; 21 August",
    [TH("만기", "Maturity", "wrap"), TH("금리", "Yield", "n"), TH("전일 대비", "Daily change", "n"), THP(),
     TH("검증", "Verified", "n opt")], us_curve_rows, cls="data compact",
    foot_ko="<strong>단위는 % 가 아니라 bp 입니다</strong>(1bp = 0.01%포인트). <strong>이날은 곡선 전체가 올랐습니다</strong> &mdash; "
      "20일에는 5년 이상만 움직였는데 21일에는 <strong>1년 " + bp(ru["change_bp"]["ust1y"]) + ", 2년 " +
      bp(ru["change_bp"]["ust2y"]) + ", 3년 " + bp(ru["change_bp"]["ust3y"]) + "</strong> 까지 같이 올랐습니다 " + VF_C + ". "
      "<strong>재정·공급만이 아니라 연준 기대까지 움직였다는 뜻</strong>입니다 &mdash; 강한 서비스업 지표가 그 이유입니다. "
      "10년&minus;2년 스프레드는 <strong>+" + str(ru["spread_10y_2y_bp"]) + "bp</strong> 로 전날과 같습니다.",
    foot_en="<strong>Units are basis points, not per cent.</strong> <strong>The whole curve rose on the day</strong> &mdash; on the "
      "20th only five years and longer moved; on the 21st the <strong>1-year " + bp(ru["change_bp"]["ust1y"]) + ", 2-year " +
      bp(ru["change_bp"]["ust2y"]) + " and 3-year " + bp(ru["change_bp"]["ust3y"]) + "</strong> joined " + VF_C +
      ". <strong>That means Fed expectations moved too</strong>, not just fiscal supply &mdash; the strong services print is why. The "
      "10s&minus;2s spread is unchanged at <strong>+" + str(ru["spread_10y_2y_bp"]) + "bp</strong>.")

rate_head = [TH("금리", "Rate", "wrap"), TH("설명", "What it is", "note wrap"), TH("현재", "Level", "n"),
             TH("1주", "1W", "n perf"), TH("1개월", "1M", "n perf"), TH("3개월", "3M", "n perf"),
             TH("연초", "YTD", "n perf"), TH("검증", "Verified", "n opt")]
def rrow(ko, en, nk, ne, val, perf=None, vf=VF_MD, hl=False):
    p = perf or {}
    cells_ = "".join('<td class="n perf">' + (bp(p.get(k)) if p.get(k) is not None else '<span class="mut">&mdash;</span>')
                     + '</td>' for k in ("w1", "m1", "m3", "ytd"))
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td><td class="n">' + val + '</td>' + cells_ +
            '<td class="n opt">' + vf + '</td></tr>')
krrates = tbl("국내 시장금리 &mdash; 8월 21일", "Korean market rates &mdash; 21 August", rate_head, [
      rrow("국고채 1년", "KTB 1-year", "통화정책 기대가 가장 먼저 실립니다", "Policy expectations land here first",
           n(ec["ktb1y"]["value"], 3) + "%"),
      rrow("국고채 3년", "KTB 3-year", "<strong>국내 시장금리의 기준</strong>입니다", "<strong>The domestic benchmark</strong>",
           n(ec["ktb3y"]["value"], 3) + "%", ec["ktb3y"].get("perf"), VF_MD, True),
      rrow("국고채 10년", "KTB 10-year", "<strong>미 장기금리를 따라 한 주 내내 올랐습니다</strong>",
           "<strong>It rose all week with US long yields</strong>",
           n(ec["ktb10y"]["value"], 3) + "%", ec["ktb10y"].get("perf"), VF_MD, True),
      rrow("CD 91일", "CD 91-day", "은행 단기 조달금리", "Bank short-term funding", n(rkr["cd91"], 2) + "%"),
      rrow("COFIX (신규취급액)", "COFIX (new)", "<strong>주택담보대출 변동금리의 기준</strong>입니다",
           "<strong>The base for floating mortgage rates</strong>", n(rkr["cofix_new"], 2) + "%"),
      rrow("회사채 3년 (AA&minus;)", "Corporate 3-year (AA&minus;)", "우량 회사채. 국고채와의 차이가 신용스프레드입니다",
           "Investment grade &mdash; the gap to KTBs is the credit spread", n(rkr["corp3y"], 2) + "%", None, VF_1),
      rrow("회사채 3년 (BBB&minus;)", "Corporate 3-year (BBB&minus;)",
           "<strong>비우량 등급</strong>. 같은 만기인데 AA&minus; 보다 " + n(ec["corp3y_bbb"]["value"] - rkr["corp3y"], 2) + "%포인트 높습니다",
           "<strong>Sub-investment grade</strong> &mdash; " + n(ec["corp3y_bbb"]["value"] - rkr["corp3y"], 2) +
           " points above AA&minus; at the same maturity", n(ec["corp3y_bbb"]["value"], 3) + "%"),
    ], cls="data compact",
    foot_ko="<strong>한미 10년 금리차는 " + bp((ec["ktb10y"]["value"] - ru["curve"]["ust10y"]) * 100) + " 입니다</strong>"
      "(국고채 " + n(ec["ktb10y"]["value"], 3) + "% &minus; 미 국채 " + n(ru["curve"]["ust10y"], 3) + "%, 둘 다 8월 21일) " + VF_C +
      ". <strong>국내 금리가 미국보다 낮은 상태</strong>가 이어져 원화에는 구조적 부담이지만, 이번 주 원화는 오히려 세졌습니다 &mdash; "
      "「환율」 절을 보십시오. 국고채 10년은 8월 20일 " + n(4.323, 3) + "% 에서 " + n(ec["ktb10y"]["value"], 3) + "% 로 올랐습니다.",
    foot_en="<strong>The Korea&ndash;US 10-year spread is " + bp((ec["ktb10y"]["value"] - ru["curve"]["ust10y"]) * 100) +
      "</strong> (KTB " + n(ec["ktb10y"]["value"], 3) + "% less UST " + n(ru["curve"]["ust10y"], 3) + "%, both 21 August) " + VF_C +
      ". <strong>Korean yields below US yields</strong> remain a structural weight on the won &mdash; yet the won strengthened this "
      "week; see the FX section. The 10-year KTB rose from " + n(4.323, 3) + "% on 20 August to " + n(ec["ktb10y"]["value"], 3) + "%.")

sec("rates", "금리 &middot; 채권시장", "Rates and Bonds",
    '<p class="lede">' + L(
      "<strong>21일에는 곡선 전체가 올랐습니다.</strong> 20일에는 5년 이상만 움직였는데 이번엔 2년물까지 " +
      bp(ru["change_bp"]["ust2y"]) + " 올랐습니다 &mdash; <strong>재정·공급 이야기에 연준 기대가 더해졌다는 뜻</strong>입니다. "
      "국내 국고채 10년도 " + n(ec["ktb10y"]["value"], 3) + "% 로 한 주 내내 따라 올랐습니다. "
      "<strong>레이 달리오는 「채권을 줄이고 금을 사라」며 미 재정위기가 3년 내 올 수도 있다고 했습니다</strong> " + VF_1 +
      " &mdash; 판단이 아니라 <strong>이번 주 시장이 무엇을 걱정했는지</strong>를 보여주는 발언으로 읽으십시오.",
      "<strong>The entire curve rose on the 21st.</strong> On the 20th only five years and longer moved; this time the 2-year added " +
      bp(ru["change_bp"]["ust2y"]) + " &mdash; <strong>Fed expectations joining the fiscal-supply story</strong>. Korea&rsquo;s 10-year "
      "followed all week to " + n(ec["ktb10y"]["value"], 3) + "%. <strong>Ray Dalio said to cut bonds and buy gold, warning a US "
      "fiscal crisis could arrive within three years</strong> " + VF_1 + " &mdash; read it not as a judgement but as evidence of "
      "<strong>what the market worried about this week</strong>.") + '</p>\n' + krrates + '\n'
    + exp("미 재무부 확정 곡선 11개 만기 &mdash; 짧은 쪽까지 올랐습니다",
          "The full US Treasury curve &mdash; the short end moved too", us_curve))


# ══════════════════════════════════════════════════════════════════
# 05 환율
# ══════════════════════════════════════════════════════════════════
byk = {r["key"]: r for r in FX["rows"]}
KRW_KEYS = ["usdkrw", "jpykrw", "cnykrw", "eurkrw", "brlkrw", "audkrw"]
USD_KEYS = ["dxy", "usdjpy", "usdcny", "usdchf", "usdtwd", "usdinr", "usdvnd", "usdbrl", "eurusd", "gbpusd"]

def fx_head(fko, fen):
    return [TH(fko, fen, "wrap"), TH("핵심", "Why it matters", "note wrap"), TH("현재", "Level", "n"),
            TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]

def fxrow(r, hl=False, ek="", ee=""):
    nk, ne = note(r)
    dg = 4 if (r["close"] or 0) < 10 else (1 if (r["close"] or 0) < 3000 else 0)
    cellnote = L(nk + ((" &mdash; " + ek) if ek else ""), ne + ((" &mdash; " + ee) if ee else ""))
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' +
            L(esc(r["name_ko"]), esc(r.get("name_en") or r["name_ko"])) + '</th>'
            '<td class="n note">' + cellnote + '</td>'
            '<td class="n">' + n(r["close"], dg) + '</td><td class="n">' + pct(r["change_pct"]) + '</td>' +
            perf_cells(r.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')

krwrows = [fxrow(byk[k], hl=(k == "usdkrw"),
                 ek=("<strong>1,390원도 내줬습니다</strong> &mdash; 미 금리가 올랐는데도 원화가 세진 것은 "
                     "<strong>주주환원發 외국인 자금 기대</strong>가 겹친 결과로 읽힙니다" if k == "usdkrw" else ""),
                 ee=("<strong>Through 1,390 as well</strong> &mdash; the won firmed even as US yields rose, read as "
                     "<strong>expected foreign inflows on the payout story</strong>" if k == "usdkrw" else ""))
           for k in KRW_KEYS]
krwfx = tbl("원화 환율 &mdash; 원화가 얼마나 세졌나", "The won &mdash; how much stronger it got",
    fx_head("통화쌍", "Currency pair"), krwrows, cls="data compact",
    foot_ko="<strong>「통화쌍」은 두 통화를 맞바꾸는 비율입니다</strong> &mdash; 「원/달러 " + n(byk["usdkrw"]["close"], 2) +
      "」은 <strong>달러 1개를 사는 데 원화 " + n(byk["usdkrw"]["close"], 2) + "원이 든다</strong>는 뜻입니다. 그래서 "
      "<strong>이 표는 숫자가 내려가면 원화가 세진 것입니다.</strong> <strong>이 표는 빗금 「뒤」 통화가 1개</strong>이고 "
      "<strong>아래 「달러 상대 통화」 표는 빗금 「앞」이 1개</strong>라 순서가 반대입니다. "
      "원/100엔&middot;원/위안&middot;원/유로&middot;원/헤알&middot;원/호주달러 다섯은 <strong>원/달러에서 계산한 재정환율</strong>이라 "
      "국내 고시와 소수점 아래에서 다를 수 있습니다.",
    foot_en="<strong>A currency pair is the rate at which two currencies exchange</strong> &mdash; &lsquo;KRW/USD " +
      n(byk["usdkrw"]["close"], 2) + "&rsquo; means <strong>it takes " + n(byk["usdkrw"]["close"], 2) +
      " won to buy one dollar</strong>, so <strong>a lower number here means a stronger won</strong>. <strong>Here the unit currency "
      "sits after the slash</strong>; <strong>in the dollar table below it sits before</strong> &mdash; the opposite way round. The "
      "five crosses are <strong>calculated from USD/KRW</strong> and may differ from domestic quotes in the decimals.")

usdrows = []
for k in USD_KEYS:
    r = byk[k]
    flip = k in ("eurusd", "gbpusd")
    usdrows.append(fxrow(r, hl=(k == "dxy"),
        ek=("<strong>이 줄만 시각 기준이 다릅니다</strong> &mdash; 미국 장중 지수라 이 값은 <strong>8월 21일 종가</strong>입니다"
            if k == "dxy" else
           ("<strong>여기는 달러가 뒤에 있습니다</strong> &mdash; 「유로 1개가 " + n(byk["eurusd"]["close"], 4) +
            "달러」라는 뜻이라 <strong>올라가면 달러가 약해진 것</strong>입니다" if flip else "")),
        ee=("<strong>This row is on a different clock</strong> &mdash; a US-session index, so this is the <strong>21 August "
            "close</strong>" if k == "dxy" else
           ("<strong>Here the dollar is the quoted side</strong> &mdash; it reads &lsquo;one euro buys " +
            n(byk["eurusd"]["close"], 4) + " dollars&rsquo;, so <strong>up means a weaker dollar</strong>" if flip else ""))))
usdfx = tbl("달러 상대 통화 &mdash; 달러가 얼마나 약해졌나", "Against the dollar &mdash; how much weaker it got",
    fx_head("통화쌍 &middot; 지수", "Pair or index"), usdrows, cls="data compact",
    foot_ko="<strong>이 표는 빗금 「앞」 통화가 1개입니다.</strong> 달러/엔 " + n(byk["usdjpy"]["close"], 2) +
      " 은 <strong>달러 1개가 " + n(byk["usdjpy"]["close"], 2) + "엔</strong>, 유로/달러 " + n(byk["eurusd"]["close"], 4) +
      " 는 <strong>유로 1개가 " + n(byk["eurusd"]["close"], 4) + "달러</strong>라는 뜻입니다. 그래서 "
      "<strong>달러가 앞에 오면 숫자↑ = 달러 강세</strong>, <strong>달러가 뒤에 오는 맨 뒤 두 줄만 숫자↑ = 달러 약세</strong>입니다. "
      "<strong>바로 위 원화 표는 이것과 반대</strong>이니 두 표를 이어서 읽으실 때 주의하십시오 " + VF_C + ". "
      "<strong>맨 윗줄만 통화쌍이 아닙니다</strong> &mdash; 달러인덱스는 주요 6개 통화를 묶은 <strong>지수</strong>이고 "
      "<strong>미국 장중에만 갱신</strong>됩니다.",
    foot_en="<strong>In this table the currency <em>before</em> the slash is the one unit.</strong> USD/JPY at " +
      n(byk["usdjpy"]["close"], 2) + " means <strong>one dollar buys " + n(byk["usdjpy"]["close"], 2) + " yen</strong>; EUR/USD at " +
      n(byk["eurusd"]["close"], 4) + " means <strong>one euro buys " + n(byk["eurusd"]["close"], 4) + " dollars</strong>. So "
      "<strong>where the dollar comes first, up means a stronger dollar</strong>, and <strong>only the last two rows, where it comes "
      "second, mean up is a weaker dollar</strong>. <strong>The won table above works the other way round</strong> &mdash; take care "
      "reading them together " + VF_C + ". <strong>Only the top row is not a pair</strong>: the dollar index is an <strong>index</strong> "
      "of six majors and <strong>updates only during the US session</strong>.")

sec("fx", "환율", "Foreign Exchange",
    '<p class="lede">' + L(
      "<strong>원/달러가 " + n(byk["usdkrw"]["close"], 2) + "원으로 1,390원도 내줬습니다</strong>(" +
      pct(byk["usdkrw"]["change_pct"]) + "). 원화 크로스 여섯 줄 가운데 넷이 내려 원화가 전방위로 세졌습니다. "
      "<strong>미 금리가 오르면 보통 달러가 세지는데 이번 주는 반대였습니다</strong> &mdash; 삼성전자·SK하이닉스의 역대급 주주환원이 "
      "외국인 자금 유입 기대를 키웠고, 그것이 환율을 눌렀다는 분석이 나옵니다 " + VF_1 + ". "
      "달러인덱스는 " + pct(byk["dxy"]["change_pct"]) + " 로 제자리입니다.",
      "<strong>The won broke 1,390 as well, at " + n(byk["usdkrw"]["close"], 2) + "</strong> (" +
      pct(byk["usdkrw"]["change_pct"]) + "). Four of the six won crosses fell, so it firmed broadly. <strong>Higher US yields usually "
      "mean a stronger dollar; this week did the opposite</strong> &mdash; the record shareholder returns at Samsung Electronics and "
      "SK hynix raised expectations of foreign inflows, and that is read as having capped the rate " + VF_1 +
      ". The dollar index was flat at " + pct(byk["dxy"]["change_pct"]) + ".") + '</p>\n' + krwfx + '\n' + usdfx)


# ══════════════════════════════════════════════════════════════════
# 06 원자재 · 기타 지표
# ══════════════════════════════════════════════════════════════════
CM = [("brent", "브렌트", "Brent", "북해산. 국제 기준유이자 국내 도입가 기준", "The North Sea grade &mdash; the global and Korean import benchmark"),
      ("wti", "WTI", "WTI", "서부텍사스산 원유. 미국 기준유", "US benchmark crude"),
      ("gold", "금", "Gold", "달러가 약해지거나 <strong>재정을 걱정할 때</strong> 오릅니다",
       "Rises when the dollar weakens &mdash; or when <strong>fiscal worries build</strong>"),
      ("silver", "은", "Silver", "산업 수요와 귀금속 수요가 겹칩니다", "Industrial and precious demand overlap"),
      ("platinum", "백금", "Platinum", "자동차 촉매 수요", "Autocatalyst demand"),
      ("copper", "구리", "Copper", "경기의 대리 지표", "A proxy for the cycle"),
      ("natgas", "천연가스", "Natural gas", "난방&middot;발전 수요", "Heating and power"),
      ("btc", "비트코인", "Bitcoin", "위험선호의 온도계이자 <strong>유동성의 온도계</strong>",
       "A gauge of risk appetite &mdash; and of <strong>liquidity</strong>"),
      ("eth", "이더리움", "Ethereum", "&nbsp;", "&nbsp;"),
      ("vix", "VIX", "VIX", "주가 변동성", "Equity volatility"),
      ("move", "MOVE", "MOVE", "<strong>채권 변동성</strong>. 이번 주 주식보다 불안했습니다",
       "<strong>Bond volatility</strong> &mdash; more restless than equities this week")]
cmrows = []
for k, ko, en, sk, se in CM:
    v = I[k]
    hl = ' class="hl"' if k in ("gold", "btc") else ''
    dg = 0 if k == "btc" else (4 if v["close"] < 10 else 2)
    cmrows.append('      <tr' + hl + '><th class="wrap">' + L(ko, en) + '</th>'
                  '<td class="n note">' + L(sk, se) + '</td>'
                  '<td class="n">' + n(v["close"], dg) + '</td><td class="n">' + pct(v["change_pct"]) + '</td>'
                  + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
akc = D["at_kr_close"]
cmtbl = tbl("원자재 &middot; 기타 지표 &mdash; 8월 21일", "Commodities and other gauges &mdash; 21 August",
    [TH("품목", "Item", "wrap"), TH("핵심", "What it is", "note wrap"), TH("현재", "Level", "n"),
     TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")], cmrows, cls="data compact",
    foot_ko="<strong>이번 주 가장 크게 움직인 것은 주식이 아니라 금과 비트코인입니다</strong> &mdash; 금 주간 " +
      pct(I["gold"]["perf"]["w1"]) + "(1개월 " + pct(I["gold"]["perf"]["m1"]) + "), 비트코인 주간 " +
      pct(I["btc"]["perf"]["w1"]) + ", 이더리움 주간 " + pct(I["eth"]["perf"]["w1"]) + ". "
      "번스타인은 비트코인 급등의 촉매로 <strong>재무부의 장기채 바이백</strong>을 꼽으며 「비트코인은 역사적으로 유동성 확대에 "
      "긍정적으로 반응해 왔다」고 했습니다 " + VF_1 + ". <strong>금은 유동성이 아니라 재정 걱정 쪽</strong>으로 읽는 편이 맞습니다 &mdash; "
      "레이 달리오의 「채권 줄이고 금 사라」와 같은 방향입니다. "
      "국내 마감(15:30) 시점 값은 WTI " + n(akc["wti"]["close"]) + "달러&middot;브렌트 " + n(akc["brent"]["close"]) +
      "달러&middot;금 " + n(akc["gold"]["close"]) + "달러였습니다.",
    foot_en="<strong>The biggest movers this week were not equities but gold and bitcoin</strong> &mdash; gold " +
      pct(I["gold"]["perf"]["w1"]) + " on the week (" + pct(I["gold"]["perf"]["m1"]) + " over a month), bitcoin " +
      pct(I["btc"]["perf"]["w1"]) + " and ether " + pct(I["eth"]["perf"]["w1"]) + ". Bernstein named <strong>the Treasury&rsquo;s "
      "long-bond buyback</strong> as the catalyst for bitcoin, noting it &lsquo;has historically responded well to expanding "
      "liquidity&rsquo; " + VF_1 + ". <strong>Gold is better read as fiscal anxiety than as liquidity</strong> &mdash; the same "
      "direction as Ray Dalio&rsquo;s call to cut bonds and buy gold. At the 15:30 Korean close WTI was USD " + n(akc["wti"]["close"]) +
      ", Brent USD " + n(akc["brent"]["close"]) + " and gold USD " + n(akc["gold"]["close"]) + ".")

sec("commodity", "원자재 &middot; 기타 지표", "Commodities and Other Gauges",
    '<p class="lede">' + L(
      "<strong>금이 " + pct(I["gold"]["change_pct"]) + " 올라 " + n(I["gold"]["close"]) + "달러, 백금이 " +
      pct(I["platinum"]["change_pct"]) + " 입니다.</strong> 주간으로 금 " + pct(I["gold"]["perf"]["w1"]) + ", 백금 " +
      pct(I["platinum"]["perf"]["w1"]) + " 로 <strong>귀금속이 이번 주 주식을 크게 앞섰습니다</strong>. "
      "비트코인은 장중 7만 9,000달러를 넘어 <strong>주간 " + pct(I["btc"]["perf"]["w1"]) + "</strong> 입니다. "
      "<strong>금과 비트코인이 같이 오르는 것은 이유가 다릅니다</strong> &mdash; 비트코인은 바이백發 유동성, 금은 재정 걱정입니다.",
      "<strong>Gold rose " + pct(I["gold"]["change_pct"]) + " to USD " + n(I["gold"]["close"]) + " and platinum " +
      pct(I["platinum"]["change_pct"]) + ".</strong> On the week gold is " + pct(I["gold"]["perf"]["w1"]) + " and platinum " +
      pct(I["platinum"]["perf"]["w1"]) + " &mdash; <strong>precious metals well ahead of equities</strong>. Bitcoin passed USD 79,000 "
      "intraday, <strong>" + pct(I["btc"]["perf"]["w1"]) + " on the week</strong>. <strong>Gold and bitcoin rising together are not "
      "the same trade</strong> &mdash; bitcoin on buyback liquidity, gold on fiscal anxiety.") + '</p>\n' + cmtbl)


# ══════════════════════════════════════════════════════════════════
# 07 유럽 증시
# ══════════════════════════════════════════════════════════════════
EU_IDX = [("stoxx600", "STOXX 600", "STOXX 600", "유럽 600개 대형주. 유럽의 기준", "600 European large caps"),
          ("eurostoxx", "유로 STOXX 50", "EURO STOXX 50", "유로존 50종목", "Fifty euro-zone names"),
          ("dax", "DAX (독일)", "DAX (Germany)", "제조업 비중이 큽니다", "Manufacturing heavy"),
          ("cac", "CAC 40 (프랑스)", "CAC 40 (France)", "명품&middot;소비재 비중", "Luxury and consumer heavy"),
          ("ftse", "FTSE 100 (영국)", "FTSE 100 (UK)", "에너지&middot;금융&middot;소재 비중", "Energy, financials and materials"),
          ("ftsemib", "FTSE MIB (이탈리아)", "FTSE MIB (Italy)", "은행 비중이 큽니다", "Bank heavy"),
          ("ibex", "IBEX 35 (스페인)", "IBEX 35 (Spain)", "&nbsp;", "&nbsp;"),
          ("smi", "SMI (스위스)", "SMI (Switzerland)", "제약&middot;필수소비재 중심 방어적 지수", "Pharma and staples &mdash; defensive"),
          ("aex", "AEX (네덜란드)", "AEX (Netherlands)", "ASML 비중이 절대적", "Dominated by ASML")]
eu_tbl = tbl("유럽 지수 &mdash; 8월 21일 현지 마감", "European indices &mdash; local close, 21 August",
    idx_head, irows(EU_IDX, ("stoxx600",)), cls="data compact",
    foot_ko="<strong>이번 주 처음으로 유럽이 고르게 올랐습니다.</strong> 유럽 마감은 00:30 KST 로 뉴욕보다 빠르므로, "
      "<strong>21일 미국 서비스업 지표를 장중에 받은 첫 시장</strong>이 유럽이었습니다 " + VF_C + ". "
      "다만 주간으로는 대부분 마이너스입니다 &mdash; 「1주」 열을 보십시오.",
    foot_en="<strong>Europe rose broadly for the first time this week.</strong> It closes at 00:30 KST, ahead of New York, so it was "
      "<strong>the first market to trade the 21 August services print</strong> " + VF_C +
      ". On the week, though, most are still negative &mdash; see the 1W column.")

def stkrows(key, why=None, dg=2):
    out = []
    for k, v in D[key].items():
        nk, ne = note(v)
        wk, we = (why or {}).get(k, ("", ""))
        cellnote = L(nk, ne) + (('<span class="why">' + L(" &mdash; " + wk, " &mdash; " + we) + '</span>') if wk else "")
        out.append('      <tr><th class="wrap">' + esc(k) + '</th><td class="n note">' + cellnote + '</td>'
                   '<td class="n">' + n(v["close"], dg) + '</td>' + cell(v["change_pct"]) +
                   perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    return out
stk3_head = [TH("종목", "Name", "wrap"), TH("핵심", "What it does", "note wrap"), TH("종가", "Close", "n"),
             TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
eu_stk = tbl("유럽 주요 종목 &mdash; 8월 21일, <strong>거래 통화 기준</strong>",
    "European stocks &mdash; 21 August, <strong>in local trading currency</strong>", stk3_head,
    stkrows("eu_stocks", {"ASML": ("여기는 <strong>암스테르담 원주(유로)</strong>입니다",
                                    "This is the <strong>Amsterdam listing, in euros</strong>")}), cls="data compact",
    foot_ko="<strong>통화가 섞여 있습니다</strong> &mdash; SAP&middot;인피니언&middot;지멘스&middot;ASML&middot;LVMH&middot;로레알은 유로, "
      "쉘&middot;아스트라제네카&middot;HSBC 는 <strong>펜스(GBp)</strong>, 네슬레&middot;노바티스는 스위스프랑, 노보노디스크는 "
      "덴마크크로네입니다. 비교는 종가가 아니라 등락률로 하십시오.",
    foot_en="<strong>Currencies are mixed</strong> &mdash; euros, <strong>pence</strong> for Shell, AstraZeneca and HSBC, Swiss francs "
      "for Nestl&eacute; and Novartis, Danish kroner for Novo Nordisk. Compare percentage changes, not levels.")

sec("europe", "유럽 증시", "European Equities",
    '<p class="lede">' + L(
      "<strong>STOXX 600 이 " + pct(I["stoxx600"]["change_pct"]) + " 올라 이번 주 처음으로 유럽이 고르게 상승했습니다.</strong> "
      "DAX " + pct(I["dax"]["change_pct"]) + ", FTSE 100 " + pct(I["ftse"]["change_pct"]) + ", IBEX " +
      pct(I["ibex"]["change_pct"]) + " 로 주요 지수가 모두 올랐고 내린 곳은 없습니다. "
      "<strong>유럽은 뉴욕보다 먼저 닫으므로 미 서비스업 지표를 장중에 받은 첫 시장</strong>이었습니다.",
      "<strong>The STOXX 600 rose " + pct(I["stoxx600"]["change_pct"]) + ", Europe&rsquo;s first broad advance of the week.</strong> "
      "The DAX gained " + pct(I["dax"]["change_pct"]) + ", the FTSE 100 " + pct(I["ftse"]["change_pct"]) + " and the IBEX " +
      pct(I["ibex"]["change_pct"]) + ", with no major index down. <strong>Closing before New York, Europe was the first market to "
      "trade the US services print.</strong>") + '</p>\n' + eu_tbl + '\n' + eu_stk)


# ══════════════════════════════════════════════════════════════════
# 08 아시아 증시
# ══════════════════════════════════════════════════════════════════
AS_IDX = [("nikkei", "닛케이 225 (일본)", "Nikkei 225 (Japan)", "&nbsp;", "&nbsp;"),
          ("hangseng", "항셍 (홍콩)", "Hang Seng (Hong Kong)", "<strong>아시아에서 가장 많이 올랐습니다</strong>",
           "<strong>Asia&rsquo;s biggest riser</strong>"),
          ("shanghai", "상하이종합 (중국)", "Shanghai Composite (China)", "제자리였습니다", "Flat"),
          ("taiwan", "가권 (대만)", "TAIEX (Taiwan)", "TSMC 비중이 커 국내 반도체와 함께 움직입니다",
           "TSMC-dominated &mdash; it tracks Korean semis"),
          ("sensex", "센섹스 (인도)", "Sensex (India)", "&nbsp;", "&nbsp;"),
          ("asx200", "ASX 200 (호주)", "ASX 200 (Australia)", "자원&middot;금융 비중", "Resources and financials")]
as_tbl = tbl("아시아 지수 &mdash; 8월 21일 현지 마감", "Asian indices &mdash; local close, 21 August",
    idx_head, irows(AS_IDX, ("hangseng",)), cls="data compact",
    foot_ko="<strong>아시아는 갈렸습니다</strong> &mdash; 항셍 " + pct(I["hangseng"]["change_pct"]) + ", 가권 " +
      pct(I["taiwan"]["change_pct"]) + " 는 올랐고 닛케이 " + pct(I["nikkei"]["change_pct"]) + ", ASX 200 " +
      pct(I["asx200"]["change_pct"]) + " 는 내렸습니다. <strong>코스피 " + pct(KS["change_pct"]) +
      " 는 이 가운데 중간</strong>이지만 지수만 그렇습니다 &mdash; 국내는 오른 종목이 " + n(ksb["advancing"], 0) +
      "개뿐이었습니다(「국내 증시 되짚기」 절).",
    foot_en="<strong>Asia split</strong> &mdash; the Hang Seng " + pct(I["hangseng"]["change_pct"]) + " and TAIEX " +
      pct(I["taiwan"]["change_pct"]) + " rose while the Nikkei " + pct(I["nikkei"]["change_pct"]) + " and ASX 200 " +
      pct(I["asx200"]["change_pct"]) + " fell. <strong>The KOSPI&rsquo;s " + pct(KS["change_pct"]) + " sits mid-pack</strong> &mdash; "
      "but only as an index: just " + n(ksb["advancing"], 0) + " Korean stocks rose (see the Korea section).")

jp_stk = tbl("일본 주요 종목 &mdash; 8월 21일, 단위 엔", "Japanese stocks &mdash; 21 August, in yen", stk3_head,
    stkrows("jp_stocks", {"도쿄일렉트론": ("<strong>국내 장비주의 직접 비교군</strong>입니다",
                                            "<strong>The direct comparator for Korean equipment names</strong>")}, dg=0),
    cls="data compact",
    foot_ko="<strong>일본에서도 주주환원이 화제입니다</strong> &mdash; 넥슨이 3조원 규모 「깜짝 배당」을 내놓아 밸류 재평가 기대가 "
      "커졌다는 보도가 있었습니다(표에 없음) " + VF_1 + ".",
    foot_en="<strong>Shareholder returns are a theme in Japan too</strong> &mdash; Nexon announced a surprise dividend of about "
      "KRW 3tn, raising re-rating expectations (not in this table) " + VF_1 + ".")
cn_stk = tbl("중국 &middot; 홍콩 주요 종목 &mdash; 8월 21일", "Chinese and Hong Kong stocks &mdash; 21 August", stk3_head,
    stkrows("cn_stocks", {"SMIC": ("중국 최대 파운드리 &mdash; 국내 반도체와 같은 흐름을 봅니다",
                                    "China&rsquo;s largest foundry &mdash; read it alongside Korean chips")}), cls="data compact",
    foot_ko="홍콩 상장분은 홍콩달러, 상하이&middot;선전 상장분(귀주모태&middot;CATL)은 위안입니다.",
    foot_en="Hong Kong lines are in Hong Kong dollars; the Shanghai and Shenzhen lines are in yuan.")

sec("asia", "아시아 증시", "Asian Equities",
    '<p class="lede">' + L(
      "<strong>홍콩만 뚜렷하게 올랐습니다</strong> &mdash; 항셍 " + pct(I["hangseng"]["change_pct"]) + ", 가권 " +
      pct(I["taiwan"]["change_pct"]) + ", 상하이 " + pct(I["shanghai"]["change_pct"]) + ", 닛케이 " +
      pct(I["nikkei"]["change_pct"]) + ", ASX 200 " + pct(I["asx200"]["change_pct"]) + ". "
      "<strong>대만이 오른 것은 국내에 반가운 신호</strong>입니다 &mdash; TSMC 비중이 큰 지수라 반도체 투심의 대리 지표로 봅니다.",
      "<strong>Only Hong Kong clearly rose</strong> &mdash; the Hang Seng " + pct(I["hangseng"]["change_pct"]) + ", TAIEX " +
      pct(I["taiwan"]["change_pct"]) + ", Shanghai " + pct(I["shanghai"]["change_pct"]) + ", Nikkei " +
      pct(I["nikkei"]["change_pct"]) + " and ASX 200 " + pct(I["asx200"]["change_pct"]) + ". <strong>Taiwan rising is a welcome "
      "signal for Korea</strong> &mdash; a TSMC-heavy index reads as a proxy for semiconductor sentiment.")
    + '</p>\n' + as_tbl + '\n' + jp_stk + '\n' + cn_stk)


# ══════════════════════════════════════════════════════════════════
# 09 국내 증시 되짚기 (8월 21일 금요일 마감)
# ══════════════════════════════════════════════════════════════════
kr_idx_head = [TH("지수", "Index", "wrap"), TH("설명", "What it says", "note wrap"), TH("종가", "Close", "n"),
               TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
kr_idx = tbl("국내 지수 &mdash; 2026년 8월 21일(금) 마감", "Korean indices &mdash; close, Friday 21 August 2026",
    kr_idx_head, [
      '      <tr class="hl"><th class="wrap">' + L("코스피", "KOSPI") + '</th>'
      '<td class="n note">' + L("장중 고 " + n(KSI["intraday"]["high"]) + " &middot; 저 " + n(KSI["intraday"]["low"]) +
        ". <strong>삼성전자 110조 주주환원이 지수를 올렸습니다</strong>",
        "Intraday high " + n(KSI["intraday"]["high"]) + ", low " + n(KSI["intraday"]["low"]) +
        ". <strong>Samsung&rsquo;s KRW 110tn return lifted the index</strong>") + '</td>'
      '<td class="n">' + n(KS["close"]) + '</td>' + cell(KS["change_pct"]) + perf_cells(KS.get("perf")) +
      '<td class="n opt">' + VF_2 + '</td></tr>',
      '      <tr class="hl"><th class="wrap">' + L("코스닥", "KOSDAQ") + '</th>'
      '<td class="n note">' + L("장중 고 " + n(KQI["intraday"]["high"]) + " &middot; 저 " + n(KQI["intraday"]["low"]) +
        ". <strong>같은 날 &minus;4.63%</strong> &mdash; 코스피와 정반대입니다",
        "Intraday high " + n(KQI["intraday"]["high"]) + ", low " + n(KQI["intraday"]["low"]) +
        ". <strong>Down 4.63% on the same day</strong> &mdash; the opposite of the KOSPI") + '</td>'
      '<td class="n">' + n(KQ["close"]) + '</td>' + cell(KQ["change_pct"]) + perf_cells(KQ.get("perf")) +
      '<td class="n opt">' + VF_2 + '</td></tr>',
    ], cls="data compact",
    foot_ko="<strong>주간으로는 둘 다 마이너스이고 그 폭이 크게 다릅니다</strong> &mdash; 직전 금요일(8/14) 종가 대비 코스피 " +
      pct(KS_WK) + ", 코스닥 <strong>" + pct(KQ_WK) + "</strong> " + VF_C + ". "
      "이번 주 코스피는 &minus;1.55% &rarr; &minus;5.80% &rarr; +5.89% &rarr; +0.88% 로 나흘을 지났습니다.",
    foot_en="<strong>Both are down on the week, by very different margins</strong> &mdash; against last Friday&rsquo;s close the "
      "KOSPI is " + pct(KS_WK) + " and the KOSDAQ <strong>" + pct(KQ_WK) + "</strong> " + VF_C +
      ". The KOSPI&rsquo;s four sessions ran &minus;1.55%, &minus;5.80%, +5.89%, +0.88%.")

br_head = [TH("항목", "Measure", "wrap"), TH("설명", "What it says", "note wrap"),
           TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"), TH("검증", "Verified", "n")]
breadth = tbl("등락 종목 수 &middot; 수급 &middot; 52주 위치 &mdash; 8월 21일",
    "Breadth, flows and the 52-week range &mdash; 21 August", br_head, [
      frow("상승 종목", "Advancing", "<strong>지수는 +0.88% 인데 오른 종목은 넷 중 하나뿐</strong>입니다",
           "<strong>The index rose 0.88% but only one stock in four did</strong>",
           n(ksb["advancing"], 0) + "개", n(kqb["advancing"], 0) + "개", True),
      frow("하락 종목", "Declining", "코스닥은 <strong>1,378개</strong>가 내렸습니다", "<strong>1,378</strong> KOSDAQ names fell",
           n(ksb["declining"], 0) + "개", n(kqb["declining"], 0) + "개"),
      frow("상승 / 하락 비율", "Advance-decline ratio", "1.0 이 균형입니다. <strong>0.28 은 8월 19일 폭락일(0.24)과 비슷합니다</strong>",
           "1.0 is balance; <strong>0.28 is close to the 0.24 of the 19 August crash</strong>",
           n(ksb["advancing"] / float(ksb["declining"]), 2), n(kqb["advancing"] / float(kqb["declining"]), 2), True),
      frow("외국인 순매수", "Foreign net buying", "<strong>전날 +1.71조에서 다시 매도로 돌아섰습니다</strong>",
           "<strong>Back to selling after +KRW 1.71tn the day before</strong>",
           signeok(kf["foreign"]) + "원", signeok(qf["foreign"]) + "원"),
      frow("개인 / 기관", "Retail / institution", "코스피는 기관이 받고, 코스닥은 개인이 받았습니다",
           "Institutions absorbed on the KOSPI, retail on the KOSDAQ",
           signeok(kf["retail"]) + " / " + signeok(kf["institution"]),
           signeok(qf["retail"]) + " / " + signeok(qf["institution"])),
      frow("프로그램 (비차익)", "Programme (non-arbitrage)", "<strong>바스켓 매도</strong>가 나왔습니다",
           "<strong>Basket selling</strong>", signeok(KSI["program_trading"]["non_arb"]) + "원",
           '<span class="mut">&mdash;</span>'),
      frow("거래대금", "Turnover", "<strong>삼전닉스 두 종목이 이 가운데 52.37%</strong> 였습니다",
           "<strong>Two stocks were 52.37% of it</strong>", n(kd[0]["value_mn_krw"] / 1e6) + "조원",
           n(qd[0]["value_mn_krw"] / 1e6 if "value_mn_krw" in qd[0] else 0) + "조원"),
      frow("52주 구간 내 위치", "Position in the 52-week range",
           "(종가 &minus; 52주 최저) &divide; (52주 최고 &minus; 52주 최저)",
           "(close &minus; low) &divide; (high &minus; low)",
           n(KS_POS, 1) + "%", n(KQ_POS, 1) + "%"),
    ], cls="data compact",
    foot_ko="<strong>이 표가 오늘 판에서 가장 중요합니다.</strong> 코스피 +0.88% 는 <strong>시가총액 상위 몇 종목이 만든 숫자</strong>이고, "
      "실제로 오른 종목 비율은 코스피 " + n(ksb["advancing"] / float(ksb["advancing"] + ksb["declining"]) * 100, 0) +
      "%, 코스닥 " + n(kqb["advancing"] / float(kqb["advancing"] + kqb["declining"]) * 100, 0) + "% 입니다 " + VF_C + ". "
      "<strong>지수가 오른 날인데 고객 계좌는 대부분 마이너스였을 가능성이 큽니다</strong> &mdash; 월요일 응대에서 이 점을 먼저 "
      "짚어 주십시오. 52주 최고는 네이버 지수 페이지 표기 그대로이며 최근 종가 흐름과 큰 차이가 있습니다(검증 노트 (c)).",
    foot_en="<strong>This is the most important table in today&rsquo;s edition.</strong> The KOSPI&rsquo;s 0.88% was made by a handful "
      "of the largest stocks; the share that actually rose was " +
      n(ksb["advancing"] / float(ksb["advancing"] + ksb["declining"]) * 100, 0) + "% on the KOSPI and " +
      n(kqb["advancing"] / float(kqb["advancing"] + kqb["declining"]) * 100, 0) + "% on the KOSDAQ " + VF_C +
      ". <strong>On a day the index rose, most client accounts were probably down</strong> &mdash; lead with that on Monday. The "
      "52-week high is Naver&rsquo;s published figure and sits far above recent closes (verification note (c)).")

KRW = {
 "삼성생명": ("<strong>업종 1위(생명보험 +8.88%)</strong>. 주주환원 이야기가 보험으로 번졌습니다",
              "<strong>Top sector, life insurance +8.88%</strong> &mdash; the payout story spread to insurers"),
 "삼성화재": ("손해보험 +3.55%", "Non-life insurance +3.55%"),
 "SK텔레콤": ("무선통신서비스 +4.80%", "Wireless services +4.80%"),
 "삼성물산": ("그룹 지배구조 수혜 기대", "Group-structure expectations"),
 "삼성전자": ("<strong>최대 110조원 주주환원 의결</strong>. 다만 <strong>애프터마켓에서 4% 되밀렸습니다</strong>",
              "<strong>A return of up to KRW 110tn approved</strong> &mdash; but it <strong>gave back 4% after hours</strong>"),
 "SK하이닉스": ("<strong>사흘 연속 상승</strong>(19일 &minus;9.75% &rarr; 20일 +12.73% &rarr; 21일 +2.31%)",
                 "<strong>A third day up</strong> (&minus;9.75%, +12.73%, +2.31%)"),
 "하나금융지주": ("금융지주 넷이 모두 올랐습니다", "All four bank holding companies rose"),
 "카카오": ("<strong>이날 낙폭 1위</strong>", "<strong>The day&rsquo;s biggest faller</strong>"),
 "에코프로비엠": ("2차전지에서 자금이 빠졌습니다", "Money left the battery complex"),
 "한화에어로스페이스": ("<strong>우주항공과국방 &minus;6.90%</strong> &mdash; 지정학 불안에도 차익실현이 나왔습니다",
                        "<strong>Aerospace and defence &minus;6.90%</strong> &mdash; profit-taking despite the geopolitics"),
 "삼성전기": ("전자장비와기기 &minus;6.04%", "Electronic equipment &minus;6.04%"),
 "알테오젠": ("전날 +11.86% 를 되돌렸습니다", "It gave back the previous day&rsquo;s 11.86%"),
}
KR_PICK = ["삼성생명", "삼성화재", "SK텔레콤", "삼성물산", "하나금융지주", "삼성전자", "SK하이닉스",
           "알테오젠", "삼성전기", "한화에어로스페이스", "에코프로비엠", "카카오"]
kr_rows = []
for k in KR_PICK:
    v = D["stocks"][k]
    wk, we = KRW.get(k, ("&nbsp;", "&nbsp;"))
    hl = ' class="hl"' if k in ("삼성전자", "카카오") else ''
    kr_rows.append('      <tr' + hl + '><th class="wrap">' + esc(k) + '</th>'
                   '<td class="n note">' + L(wk, we) + '</td>'
                   '<td class="n">' + n(v["close"], 0) + '</td>' + cell(v["change_pct"]) +
                   perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
kr_stk = tbl("국내 주요 종목 &mdash; 8월 21일 마감", "Korean stocks &mdash; close, 21 August", stk_head, kr_rows,
    cls="data compact",
    foot_ko="<strong>표의 위아래가 그날의 자금 흐름입니다.</strong> 위쪽은 보험&middot;통신&middot;지주&middot;금융 &mdash; "
      "<strong>주주환원 이야기가 다음으로 갈 곳</strong>으로 지목된 업종입니다. 아래쪽은 2차전지&middot;방산&middot;바이오&middot;"
      "부품 &mdash; <strong>그 돈이 빠져나온 자리</strong>입니다. 「지수가 올랐다」가 아니라 "
      "<strong>「자금이 옮겨 갔다」</strong>가 어제의 정확한 서술입니다 " + VF_C + ". "
      "삼성전자는 정규장 +3.87%(28만 1,500원) 뒤 <strong>애프터마켓에서 27만~27만 1,000원</strong>으로 상승분을 대부분 반납했습니다 &mdash; "
      "환원 규모가 기대 범위 안이었고 자사주 소각 규모&middot;집행 방식이 확정되지 않았기 때문이라는 해석입니다 " + VF_1 + ".",
    foot_en="<strong>The top and bottom of this table are the day&rsquo;s money flow.</strong> Above: insurers, telecoms, holding "
      "companies and banks &mdash; <strong>where the payout story was expected to go next</strong>. Below: batteries, defence, biotech "
      "and components &mdash; <strong>where the money came from</strong>. The accurate description is not &lsquo;the index rose&rsquo; "
      "but <strong>&lsquo;money moved&rsquo;</strong> " + VF_C + ". Samsung Electronics closed the regular session up 3.87% at KRW "
      "281,500, then <strong>gave most of it back after hours at KRW 270,000&ndash;271,000</strong> &mdash; the size landed inside "
      "expectations and the buyback mechanics are not yet fixed " + VF_1 + ".")

# 투자자별 순매수 — 최근 10거래일. 이번 주(8/18~8/21) 누계를 따로 낸다.
IV = D["investors_kospi"]
IV_WK = [r for r in IV if r["date"] in ("26.08.18", "26.08.19", "26.08.20", "26.08.21")]
WK_RET = sum(r["retail"] for r in IV_WK)
WK_FOR = sum(r["foreign"] for r in IV_WK)
WK_INS = sum(r["institution"] for r in IV_WK)
iv_rows = []
for r in IV[:10]:
    md = r["date"][3:].replace(".", "/")
    iv_rows.append('      <tr' + (' class="hl"' if r["date"] in ("26.08.19", "26.08.21") else '') + '>'
                   '<th class="wrap">' + md + '</th>'
                   '<td class="n">' + signeok(r["retail"]) + '</td>'
                   '<td class="n">' + signeok(r["foreign"]) + '</td>'
                   '<td class="n">' + signeok(r["institution"]) + '</td>'
                   '<td class="n opt">' + VF_MD + '</td></tr>')
iv_rows.append('      <tr class="sum"><th class="wrap">' + L("주간 누계(8/18~8/21)", "Week (18&ndash;21 Aug)") + '</th>'
               '<td class="n">' + signeok(WK_RET) + '</td>'
               '<td class="n">' + signeok(WK_FOR) + '</td>'
               '<td class="n">' + signeok(WK_INS) + '</td>'
               '<td class="n opt">' + VF_C + '</td></tr>')
ivt = tbl("코스피 투자자별 순매수 &mdash; 최근 10거래일", "KOSPI net buying by investor type &mdash; last 10 sessions",
    [TH("날짜", "Date", "wrap"), TH("개인", "Retail", "n"), TH("외국인", "Foreign", "n"),
     TH("기관", "Institution", "n"), TH("검증", "Verified", "n opt")],
    iv_rows, cls="data compact",
    foot_ko="<strong>표시한 두 줄을 견주어 보십시오.</strong> 8월 19일 지수가 &minus;5.80% 이던 날 개인은 "
      + signeok(46357) + " 을 받았고 외국인은 " + signeok(-34726) + " 을 팔았습니다. 이틀 뒤 <strong>8월 21일 지수가 "
      + pct(KS["change_pct"]) + " 오른 날에도 외국인은 " + signeok(-1760) + " 순매도</strong>였습니다 &mdash; "
      "<strong>어제 지수를 올린 것은 외국인 자금이 아니라 삼성전자 한 종목</strong>이었다는 뜻입니다. "
      "주간 누계로는 개인만 사고 외국인&middot;기관이 함께 팔았습니다 " + VF_MD + ". "
      "8월 17일은 광복절 대체휴일이라 이번 주는 4거래일입니다. "
      "코스닥을 포함하지 않은 코스피 기준이며, 세 주체 합이 0 이 아닌 것은 기타법인이 빠져 있기 때문입니다.",
    foot_en="<strong>Compare the two highlighted rows.</strong> On 19 August, when the index fell 5.80%, retail absorbed "
      + signeok(46357) + " while foreigners sold " + signeok(-34726) + ". Two days later, on 21 August, <strong>the index rose "
      + pct(KS["change_pct"]) + " and foreigners were still net sellers at " + signeok(-1760) + "</strong> &mdash; "
      "<strong>what lifted the index yesterday was one stock, not foreign money</strong>. For the week as a whole only retail "
      "bought; foreigners and institutions both sold " + VF_MD + ". Monday 17 August was a substitute holiday, so the week "
      "had four sessions. KOSPI only, and the three columns do not sum to zero because other corporates are excluded.")

hb_rows = []
for r in H["rows"]:
    b = r["breadth"]; ks_, kq_ = b["kospi"], b["kosdaq"]
    miss = (ks_["advancing"] + ks_["declining"]) == 0
    dash = '<span class="mut">&mdash;</span>'
    hb_rows.append('      <tr' + (' class="hl"' if r["date"] == "2026-08-21" else '') + '>'
                   '<th class="wrap">' + r["date"][5:] + '</th>'
                   '<td class="n">' + pct(r["kospi"]["change_pct"]) + '</td>'
                   '<td class="n">' + (dash if miss else n(ks_["advancing"], 0)) + '</td>'
                   '<td class="n">' + (dash if miss else n(ks_["declining"], 0)) + '</td>'
                   '<td class="n">' + pct(r["kosdaq"]["change_pct"]) + '</td>'
                   '<td class="n">' + (dash if miss else n(kq_["advancing"], 0)) + '</td>'
                   '<td class="n">' + (dash if miss else n(kq_["declining"], 0)) + '</td>'
                   '<td class="n opt">' + VF_MD + '</td></tr>')
hb = tbl("등락 종목 수 추이", "Breadth over recent sessions",
    [TH("날짜", "Date", "wrap"), TH("코스피 %", "KOSPI %", "n"), TH("상승", "Adv", "n"), TH("하락", "Dec", "n"),
     TH("코스닥 %", "KOSDAQ %", "n"), TH("상승", "Adv", "n"), TH("하락", "Dec", "n"), TH("검증", "Verified", "n opt")],
    hb_rows, cls="data compact",
    foot_ko="<strong>8월 21일을 8월 19일과 나란히 보십시오.</strong> 19일은 지수가 &minus;5.80% 인 날 171 대 703 이었고, "
      "21일은 지수가 <strong>+0.88%</strong> 인 날 " + n(ksb["advancing"], 0) + " 대 " + n(ksb["declining"], 0) +
      " 입니다 &mdash; <strong>등락 종목 수만 보면 두 날이 거의 같습니다.</strong> 8월 18일은 수집기가 받지 못해 비워 두었습니다 " + VF_N + ".",
    foot_en="<strong>Set 21 August beside 19 August.</strong> On the 19th the index fell 5.80% with 171 up against 703 down; on the "
      "21st it <strong>rose 0.88%</strong> with " + n(ksb["advancing"], 0) + " against " + n(ksb["declining"], 0) +
      " &mdash; <strong>by breadth the two days are nearly identical.</strong> Breadth for 18 August was not captured " + VF_N + ".")

sec("korea", "국내 증시 되짚기", "Korea &mdash; Looking Back",
    '<p class="lede">' + L(
      "<strong>어제 국내는 지수와 시장이 정반대로 갔습니다.</strong> 삼성전자가 <strong>최대 110조원</strong> 주주환원을 의결하자 코스피는 " +
      pct(KS["change_pct"]) + " 올라 " + n(KS["close"]) + " 로 마쳤는데, <strong>오른 종목은 " + n(ksb["advancing"], 0) +
      "개, 내린 종목은 " + n(ksb["declining"], 0) + "개</strong>였습니다. 코스닥은 <strong>" + pct(KQ["change_pct"]) +
      "</strong>, 내린 종목 1,378개입니다. 자금이 <strong>보험&middot;통신&middot;금융으로 몰리고 2차전지&middot;방산&middot;바이오에서 "
      "빠져나갔습니다</strong>. <strong>외국인은 그 오른 날에도 " + signeok(-1760) + " 순매도</strong>였습니다. "
      "주간으로 코스피 " + pct(KS_WK) + ", 코스닥 " + pct(KQ_WK) + " 입니다.",
      "<strong>Index and market went opposite ways in Korea yesterday.</strong> After Samsung Electronics approved a return of "
      "<strong>up to KRW 110tn</strong>, the KOSPI rose " + pct(KS["change_pct"]) + " to " + n(KS["close"]) + " &mdash; yet <strong>" +
      n(ksb["advancing"], 0) + " stocks rose against " + n(ksb["declining"], 0) + "</strong>. The KOSDAQ fell <strong>" +
      pct(KQ["change_pct"]) + "</strong> with 1,378 decliners. Money <strong>crowded into insurers, telecoms and banks and left "
      "batteries, defence and biotech</strong>. <strong>Foreigners were net sellers even on that up day, at " + signeok(-1760) +
      "</strong>. On the week the KOSPI is " + pct(KS_WK) + " and the KOSDAQ " + pct(KQ_WK) + ".")
    + '</p>\n' + kr_idx + '\n' + breadth + '\n' + kr_stk + '\n'
    + exp("등락 종목 수 추이 &mdash; 8월 21일은 8월 19일과 거의 같습니다",
          "Breadth over recent sessions &mdash; the 21st looks like the 19th", hb)
    + exp("투자자별 순매수 추이 &mdash; 어제 지수를 올린 것은 외국인이 아닙니다",
          "Net buying by investor type &mdash; it was not foreigners who lifted the index", ivt))


# ══════════════════════════════════════════════════════════════════
# 10 해외 시장 관심 이슈
# ══════════════════════════════════════════════════════════════════
ISSUES = [
 ("바이백은 「의지」였지 「능력」이 아니었습니다", "The buyback showed will, not ability",
  "재무부가 장기채 바이백을 두 배로 늘렸는데 30년물은 오히려 올랐습니다. 월가는 원인을 <strong>인플레이션 불확실성&middot;재정적자&middot;"
  "국채 공급&middot;기간 프리미엄</strong> 넷으로 봅니다 " + VF_1 + ".",
  "The Treasury doubled its long-bond buyback and the 30-year rose anyway. Wall Street points to four causes: <strong>inflation "
  "uncertainty, the deficit, Treasury supply and the term premium</strong> " + VF_1 + ".",
  "<strong>국내에는 이렇게 닿습니다.</strong> 미 장기금리는 국내 성장주·반도체의 밸류에이션 할인율입니다. "
  "8월 19일 국내 &minus;5.80% 의 방아쇠가 바로 이것이었습니다. <strong>9월 9일 확대 바이백이 실제로 시작</strong>되므로 "
  "그때까지는 「발표」가 아니라 「집행」을 보셔야 합니다.",
  "<strong>How it reaches Korea:</strong> US long yields are the discount rate on Korean growth and semiconductor valuations &mdash; "
  "they triggered the 5.80% fall on 19 August. <strong>The expanded buyback actually starts on 9 September</strong>, so until then "
  "watch execution rather than announcements."),
 ("유가가 인플레이션 쪽에서 다시 밀고 있습니다", "Oil is pushing again from the inflation side",
  "브렌트가 <strong>6거래일 연속</strong> 올라 주간 " + pct(I["brent"]["perf"]["w1"]) + " 입니다. 트럼프 대통령이 이란과 거래하는 "
  "국가에도 제재를 경고했고, 베선트 장관은 <strong>8월 24일</strong> 압박 계획을 공개합니다 " + VF_2 + ".",
  "Brent has risen for <strong>six sessions</strong>, " + pct(I["brent"]["perf"]["w1"]) + " on the week. President Trump warned of "
  "sanctions on countries trading with Iran, and Bessent publishes the plan on <strong>24 August</strong> " + VF_2 + ".",
  "<strong>국내에는 이중으로 닿습니다.</strong> 정유·에너지는 수혜, 항공·해운·소비는 부담입니다. 그리고 <strong>물가를 밀어 "
  "금리 인하 여지를 줄이므로 금리 리스크와 한 몸</strong>입니다 &mdash; 8월 27일 금통위 직전이라 더 그렇습니다.",
  "<strong>It reaches Korea twice.</strong> Refiners and energy benefit; airlines, shipping and consumers are pressured. And it "
  "<strong>feeds inflation, narrowing the room to cut</strong> &mdash; the same risk as rates, and the Bank of Korea meets on 27 August."),
 ("반도체가 반등장에서 빠졌습니다", "Semiconductors sat out the rebound",
  "21일 3대 지수가 오른 날 <strong>SOX 는 " + pct(I["sox"]["change_pct"]) + "</strong>, 엔비디아 &minus;0.98%, 마이크론 &minus;0.77% "
  "였습니다. 주간으로 SOX 는 " + pct(I["sox"]["perf"]["w1"]) + " 입니다 " + VF_MD + ".",
  "On the 21st all three indices rose while <strong>the SOX fell " + pct(I["sox"]["change_pct"]) + "</strong>, Nvidia 0.98% and "
  "Micron 0.77%. On the week the SOX is " + pct(I["sox"]["perf"]["w1"]) + " " + VF_MD + ".",
  "<strong>국내 반도체가 오른 이유는 업황이 아니라 주주환원</strong>이라는 뜻입니다. 두 이야기는 다른 속도로 움직입니다 &mdash; "
  "<strong>8월 26일 엔비디아 실적</strong>이 업황 쪽 답을 줍니다.",
  "<strong>Korean chips rose on payouts, not on the cycle.</strong> The two stories move at different speeds &mdash; "
  "<strong>Nvidia&rsquo;s results on 26 August</strong> will answer the cycle side."),
 ("금과 비트코인이 같이 올랐지만 이유가 다릅니다", "Gold and bitcoin rose together for different reasons",
  "금 주간 " + pct(I["gold"]["perf"]["w1"]) + ", 비트코인 주간 " + pct(I["btc"]["perf"]["w1"]) +
  " 입니다. 번스타인은 비트코인의 촉매로 <strong>바이백發 유동성</strong>을 꼽았고, 레이 달리오는 <strong>「채권 줄이고 금 사라」</strong>며 "
  "미 재정위기가 3년 내 올 수도 있다고 했습니다 " + VF_1 + ".",
  "Gold is " + pct(I["gold"]["perf"]["w1"]) + " on the week and bitcoin " + pct(I["btc"]["perf"]["w1"]) +
  ". Bernstein named <strong>buyback liquidity</strong> as bitcoin&rsquo;s catalyst; Ray Dalio said to <strong>cut bonds and buy "
  "gold</strong>, warning of a US fiscal crisis within three years " + VF_1 + ".",
  "<strong>고객께는 둘을 갈라 설명하십시오.</strong> 비트코인은 유동성에, 금은 재정 불신에 반응했습니다. "
  "<strong>같은 방향으로 움직인다고 같은 위험이 아닙니다</strong> &mdash; 유동성이 마르면 비트코인이 먼저 돌아섭니다.",
  "<strong>Separate the two for clients.</strong> Bitcoin responded to liquidity, gold to distrust of the fiscal path. <strong>Moving "
  "the same way does not make them the same risk</strong> &mdash; if liquidity dries up, bitcoin turns first."),
 ("삼전닉스가 코스피의 절반이 됐습니다", "Two stocks are now half the KOSPI",
  "삼성전자와 SK하이닉스의 합산 시총이 <strong>코스피 전체의 50.93%</strong>, 최근 한 달 거래대금의 <strong>54.44%</strong> 입니다. "
  "1년 전 23.07% 에서 두 배가 됐습니다. 최근 한 달 SK하이닉스는 <strong>23거래일 중 12일</strong> 하루 5% 이상 움직였습니다 " + VF_1 + ".",
  "Samsung Electronics and SK hynix together are <strong>50.93% of KOSPI market capitalisation</strong> and <strong>54.44% of "
  "turnover</strong> over the past month, double the 23.07% of a year ago. SK hynix moved more than 5% on <strong>12 of 23 "
  "sessions</strong> " + VF_1 + ".",
  "<strong>이것이 어제 「지수는 올랐는데 시장은 내린」 이유입니다.</strong> 단일종목 레버리지 ETF 4종에 한 달 66조원이 오가며 "
  "<strong>같은 방향의 매매를 증폭</strong>합니다 &mdash; 오를 때도 내릴 때도 그렇습니다.",
  "<strong>This is why the index rose while the market fell.</strong> KRW 66tn passed through four single-stock leveraged ETFs in a "
  "month, <strong>amplifying moves in the same direction</strong> &mdash; on the way up and on the way down."),
]
sec("issues", "해외 시장 관심 이슈", "Issues to Watch",
    '<p class="lede">' + L(
      "<strong>다음 국내 거래일(8월 24일 월요일)에 들고 갈 다섯 가지입니다.</strong> 각 항목 끝에 "
      "<strong>「국내에는 무엇을 뜻하는가」</strong>를 붙였습니다.",
      "<strong>Five things to carry into the next Korean session on Monday 24 August.</strong> Each ends with "
      "<strong>what it means for Korea</strong>.") + '</p>\n<div class="soft-grid">\n'
    + "\n".join('<div class="soft-card">\n  <p class="q">' + L(a, b) + '</p>\n  <p>' + L(c, d) + '</p>\n'
                '  <p>' + L(e, f) + '</p>\n</div>' for a, b, c, d, e, f in ISSUES) + '\n</div>')


# ══════════════════════════════════════════════════════════════════
# 11 증권사 리포트 요약
# ══════════════════════════════════════════════════════════════════
RPT = [
 ("김동원 &mdash; KB증권 리서치센터장", "Kim Dong-won &mdash; KB Securities",
  "삼성전자에 대해 「높은 배당 수익률이 부각되면서 <strong>단기적으로 30만원대 안착이 가능</strong>할 것」이라며, "
  "「이익 성장과 배당 매력을 동시에 겸비한 대표적 저평가주로 <strong>현재 PER 4배 수준</strong>의 주가는 밸류에이션 정상화와 재평가 "
  "국면에 본격 진입할 것」이라고 했습니다. KB증권은 삼성전자의 연간 주주환원 규모를 <strong>최소 100조~최대 200조원</strong>으로 추정했습니다.",
  "On Samsung Electronics: a high dividend yield should let it <strong>settle above KRW 300,000 in the near term</strong>, and as "
  "&lsquo;a clearly undervalued name combining earnings growth with dividend appeal&rsquo; trading at <strong>about 4x earnings</strong>, "
  "it should enter a re-rating phase. KB estimates the annual return at <strong>KRW 100tn to 200tn</strong>."),
 ("증권가 &mdash; 다음 주 코스피 밴드", "Sell-side &mdash; next week&rsquo;s KOSPI range",
  "다음 주 코스피 예상 범위로 <strong>6,400~7,500</strong> 이 제시됐습니다. 분수령으로는 <strong>엔비디아 실적과 잭슨홀</strong>이 "
  "꼽혔습니다 " + VF_1 + ". <strong>1,100포인트에 이르는 넓은 밴드</strong> 자체가 지금 시장의 불확실성을 말합니다.",
  "A <strong>6,400&ndash;7,500</strong> range is offered for next week, with <strong>Nvidia&rsquo;s results and Jackson Hole</strong> "
  "named as the swing factors " + VF_1 + ". <strong>A band 1,100 points wide</strong> is itself a statement about uncertainty."),
 ("한국신용평가", "Korea Ratings",
  "SK하이닉스(AA+/안정적)의 40조원 환원에 대해 <strong>단기 신용도 영향은 제한적</strong>이라고 평가했습니다 &mdash; 6월 말 순현금 "
  "74조원과 7월 ADR 유상증자 39조 9,000억원이 방어막입니다. 다만 <strong>「환원 규모보다 성장투자 이후의 재무완충력」</strong>이 "
  "중요하며 HBM 은 EUV&middot;TSV&middot;어드밴스드 패키징으로 <strong>투자 규모가 구조적으로 커진다</strong>고 지적했습니다.",
  "On SK hynix (AA+/stable), the <strong>near-term credit impact of the KRW 40tn return is limited</strong> &mdash; KRW 74tn of net "
  "cash at end-June and KRW 39.9tn from the July ADR issue provide the buffer. But <strong>what matters is the buffer left after "
  "growth capex, not the size of the return</strong>, and HBM <strong>structurally raises</strong> the investment needed."),
 ("UBS 글로벌웰스매니지먼트", "UBS Global Wealth Management",
  "기업 실적 전망과 견조한 이익 증가를 이유로 <strong>올해 말 S&amp;P 500 목표치를 8,100 으로 상향</strong>했습니다 &mdash; "
  "21일 종가보다 약 5.5% 높은 수준입니다 " + VF_1 + ".",
  "Raised its <strong>year-end S&amp;P 500 target to 8,100</strong> on the earnings outlook and steady profit growth &mdash; about "
  "5.5% above the 21 August close " + VF_1 + "."),
]
sec("reports", "증권사 리포트 요약", "Broker Notes",
    '<p class="lede">' + L(
      "<strong>기사 본문에서 실명과 소속이 확인된 것만 옮겼습니다.</strong> 리포트 원문이 아니라 보도에 실린 대목이므로 배지는 " +
      VF_1 + " 입니다. <strong>목표주가와 투자의견은 기사에 실린 것만</strong> 적었습니다.",
      "<strong>Only comments with a confirmed name and firm in the article bodies are carried here.</strong> These are press "
      "quotations rather than the reports themselves, hence the " + VF_1 + " badge. <strong>Targets and ratings appear only where the "
      "article carried them.</strong>") + '</p>\n<div class="views">\n'
    + "\n".join('<div class="view">\n  <p class="view-firm">' + L(a, b) + '</p>\n  <p class="view-body">' + L(c, d) + '</p>\n</div>'
                for a, b, c, d in RPT) + '\n</div>')


# ══════════════════════════════════════════════════════════════════
# 12 하우스 시각
# ══════════════════════════════════════════════════════════════════
VIEWS = [
 ("패트릭 암스트롱 &mdash; 플루리미웰스", "Patrick Armstrong &mdash; Plurimi Wealth",
  "베선트 장관의 바이백 전략에 대해 「아마 <strong>역효과가 났고</strong>, 오히려 추가 조치를 해야 하는 상황으로 몰았을 것」이라며, "
  "「30년물 금리를 통제하려 할 때는 <strong>무제한 대차대조표를 가진 연준이 아닌 이상 결국 시장이 이기게 돼 있다</strong>」고 했습니다.",
  "On the buyback strategy: it <strong>probably backfired</strong> and forced the Treasury toward further measures. &lsquo;When you "
  "try to control the 30-year, <strong>unless you are the Fed with an unlimited balance sheet, the market wins in the end</strong>.&rsquo;"),
 ("레오 켈리 &mdash; 버던스캐피털어드바이저스", "Leo Kelly &mdash; Verdence Capital Advisors",
  "시장이 10년물 <strong>4~5%에는 적응했다</strong>고 보면서도, 「어떤 사건으로 금리가 이 범위를 돌파해 <strong>6~7%로 간다면 "
  "문제</strong>가 된다」며 「시장은 좋지 않게 반응할 것」이라고 했습니다. 장기금리 상승과 중동 긴장이 이어지면 "
  "<strong>가을께 조정 영역 진입</strong> 가능성도 있다고 봤습니다.",
  "The market has <strong>adjusted to a 4&ndash;5% ten-year</strong>, but &lsquo;if some event pushes it through that range to "
  "<strong>6&ndash;7%, that is a problem</strong>&rsquo; and markets would react badly. With long yields rising and Middle East "
  "tension persisting, he sees a <strong>possible correction by autumn</strong>."),
 ("울리케 호프만-부르카르디 &mdash; UBS CIO", "Ulrike Hoffmann-Burchardi &mdash; UBS CIO",
  "재무부 개입이 「정책당국이 최근 금리 상승 속도를 불편하게 보고 있다」는 점은 보여줬지만 <strong>「금리 전망을 근본적으로 바꾸지는 "
  "않는다」</strong>고 평가했습니다. 물가가 계속 둔화한다면 <strong>연준이 올해 금리를 인상할 가능성은 낮다</strong>고 봤습니다.",
  "The intervention showed that officials are &lsquo;uncomfortable with the pace&rsquo; of the rise but <strong>&lsquo;does not "
  "fundamentally change the outlook for rates&rsquo;</strong>. If inflation keeps easing, <strong>a Fed hike this year is "
  "unlikely</strong>."),
 ("메리 데일리 &mdash; 샌프란시스코 연은 총재", "Mary Daly &mdash; San Francisco Fed",
  "현재 통화정책이 <strong>적절한 수준</strong>에 있다는 견해를 보였습니다. 연준의 신뢰성이 위험에 처했다는 주장에 동의하지 않으며 "
  "<strong>선제적인 금리 인상도 시급하지 않다</strong>고 했습니다.",
  "Policy is <strong>appropriately calibrated</strong>. She disagreed that the Fed&rsquo;s credibility is at risk and said "
  "<strong>a pre-emptive hike is not urgent</strong>."),
 ("레이 달리오", "Ray Dalio",
  "<strong>반대 시각</strong>입니다. <strong>「채권을 줄이고 금을 사라」</strong>며 미국의 재정위기가 <strong>3년 내</strong> 올 수도 "
  "있다고 경고했습니다 " + VF_1 + ". 이번 주 금이 " + pct(I["gold"]["perf"]["w1"]) + " 오른 배경으로 함께 읽으십시오.",
  "<strong>The dissenting view.</strong> He said to <strong>cut bonds and buy gold</strong>, warning a US fiscal crisis could arrive "
  "<strong>within three years</strong> " + VF_1 + ". Read it alongside gold&rsquo;s " + pct(I["gold"]["perf"]["w1"]) + " week."),
 ("김석환 &mdash; 미래에셋증권", "Kim Seok-hwan &mdash; Mirae Asset Securities",
  "「외국인은 <strong>연간 누적으로 보면 여전히 국내 주식을 순매도</strong>하고 있다」며 「그동안 빠져나간 자금의 <strong>절반만 다시 "
  "들어와도</strong> 지수가 크게 상승할 여지가 있다」고 했습니다. 단서는 <strong>「외국인 수급의 지속성과 반도체 펀더멘털 확인」</strong>입니다.",
  "&lsquo;Year to date foreigners are <strong>still net sellers</strong> of Korean equities&rsquo;, and <strong>if even half</strong> "
  "of what left were to return the index has considerable room. His caveat: <strong>persistence in foreign flow and confirmation of "
  "semiconductor fundamentals</strong>."),
]
sec("views", "하우스 시각", "House View",
    '<p class="lede">' + L(
      "<strong>이번 주 월가의 논점은 하나로 모입니다 &mdash; 재무부가 장기금리를 낮출 「능력」이 있는가.</strong> "
      "대체로 회의적이고, 연준 쪽에서는 「정책이 적절하다」는 목소리가 나왔습니다. 아래는 "
      "<strong>기사 본문에서 실명이 확인된 것만</strong>입니다.",
      "<strong>Wall Street&rsquo;s argument this week converges on one question &mdash; whether the Treasury has the ability to lower "
      "long yields.</strong> The tone is largely sceptical, while the Fed side says policy is appropriate. Only <strong>named "
      "comments confirmed in article bodies</strong> appear below.") + '</p>\n<div class="views">\n'
    + "\n".join('<div class="view">\n  <p class="view-firm">' + L(a, b) + '</p>\n  <p class="view-body">' + L(c, d) + '</p>\n</div>'
                for a, b, c, d in VIEWS) + '\n</div>')


# ══════════════════════════════════════════════════════════════════
# 13 일정 · 휴장일
# ══════════════════════════════════════════════════════════════════
nextopen = """
<div class="callout">
  <p class="callout-title">%s</p>
  %s
</div>""" % (
 L("다음 국내 거래일은 8월 24일(월)입니다", "The next Korean session is Monday 24 August"),
 P("<strong>주말 사이 새 해외 마감은 없습니다.</strong> 8월 21일(금) 뉴욕 마감이 마지막이므로, 월요일 아침 국내가 받는 것은 "
   "<strong>그 하루치 하나뿐</strong>입니다 &mdash; 휴장 뒤 재개장처럼 며칠치를 한꺼번에 받는 상황이 아닙니다. "
   "<strong>대신 다음 주에 셋이 몰려 있습니다</strong>: <strong>8/24 베선트 재무장관의 국채시장 대응 계획</strong>(한국시간 24일 밤~25일 새벽), "
   "<strong>8/26 엔비디아 실적</strong>(한국시간 27일 새벽), <strong>8/28 케빈 워시 연준 의장 잭슨홀 연설</strong>. "
   "여기에 <strong>8/27 한국은행 금통위</strong>가 겹칩니다. <strong>월요일은 조용히 열리고 화요일부터 무거워집니다.</strong>",
   "<strong>No new overseas close arrives over the weekend.</strong> The 21 August New York session is the last one, so Monday "
   "morning brings <strong>a single session&rsquo;s worth</strong> &mdash; not the multi-day catch-up that follows a holiday. "
   "<strong>Next week carries three events instead</strong>: <strong>Bessent&rsquo;s Treasury-market plan on the 24th</strong> "
   "(overnight Korean time), <strong>Nvidia&rsquo;s results on the 26th</strong> (early on the 27th in Korea) and <strong>Fed Chair "
   "Kevin Warsh at Jackson Hole on the 28th</strong> &mdash; with the <strong>Bank of Korea meeting on the 27th</strong> on top. "
   "<strong>Monday opens quietly; the weight arrives from Tuesday.</strong>"))

cal_head = [TH("일시 (KST)", "Date and time", "wrap"), TH("왜 보는가", "Why it matters", "note wrap"),
            TH("구분", "Type", "wrap"), TH("일정", "Event", "wrap"), TH("검증", "Verified", "n opt")]
CAL = [
 ("<strong>8/24 (월) 09:00</strong>", "<strong>Mon 24 Aug, 09:00</strong>",
  "주말 사이 새 재료가 없어 <strong>금요일 뉴욕 마감 하나만</strong> 반영합니다",
  "With no weekend material, it prices <strong>Friday&rsquo;s New York close alone</strong>",
  "한국", "Korea", "국내 증시 재개", "Korean market reopens", True),
 ("<strong>8/24~25 (밤)</strong>", "<strong>24&ndash;25 Aug, overnight</strong>",
  "<strong>바이백을 넘어 재정건전화까지 갈지</strong>가 관건입니다. 「세계 역사상 가장 강력한 경제적 고립」이라 예고한 "
  "<strong>대이란 압박 계획</strong>도 같은 날입니다 &mdash; 유가에 직접 닿습니다",
  "The question is whether it goes <strong>beyond buybacks to fiscal consolidation</strong>. The <strong>Iran pressure plan</strong>, "
  "trailed as the strongest coordinated isolation in history, lands the same day &mdash; it reaches crude directly",
  "미국", "US", "베선트 재무장관 국채시장 대응 계획 &middot; 대이란 압박 계획",
  "Bessent on the Treasury market, and the Iran plan", True),
 ("8/25 (화)", "Tue 25 Aug", "장기금리 5%대에서 주택 수요가 어디까지 버티는지",
  "How housing holds up with long yields above 5%", "미국", "US", "미 7월 신규주택 판매", "US July new home sales", False),
 ("<strong>8/27 (목) 새벽</strong>", "<strong>Thu 27 Aug, overnight</strong>",
  "<strong>HBM 수요 전망이 삼성전자&middot;SK하이닉스에 직접 닿습니다.</strong> 국내 반도체가 오른 이유가 주주환원이었으므로 "
  "<strong>업황 쪽 답은 여기서 나옵니다</strong>. 전망일 뿐 결과가 아닙니다",
  "<strong>The HBM outlook reaches both Korean names directly.</strong> Korean chips rose on payouts, so <strong>the cycle answer "
  "comes here</strong>. These are expectations, not results",
  "기업", "Company", "엔비디아 분기 실적 (미 8/26 장 마감 후)", "Nvidia results, after the US close on 26 Aug", True),
 ("<strong>8/27 (목) 09:00</strong>", "<strong>Thu 27 Aug, 09:00</strong>",
  "원/달러가 1,390원 아래로 내려온 뒤 처음 열리는 회의입니다. <strong>유가 상승이 물가 전망에 어떻게 반영되는지</strong>가 논점",
  "The first meeting since the won broke below 1,390 &mdash; watch <strong>how the oil move enters the inflation outlook</strong>",
  "한국", "Korea", "한국은행 금융통화위원회", "Bank of Korea rate decision", True),
 ("<strong>8/28 (금)</strong>", "<strong>Fri 28 Aug</strong>",
  "<strong>케빈 워시 연준 의장의 잭슨홀 연설</strong>입니다. 장기금리 경로를 다시 정할 수 있는 자리",
  "<strong>Fed Chair Kevin Warsh speaks at Jackson Hole</strong> &mdash; it can reset the path for long yields",
  "미국", "US", "잭슨홀 경제정책 심포지엄", "Jackson Hole symposium", True),
 ("8/28 (금) 21:30", "Fri 28 Aug, 21:30", "연준이 보는 물가 지표. <strong>유가 상승이 반영되기 전 수치</strong>입니다",
  "The Fed&rsquo;s preferred gauge &mdash; <strong>a reading from before the oil move</strong>",
  "미국", "US", "미 7월 개인소비지출(PCE) 물가", "US July PCE price index", False),
 ("9/1 (화) 09:00", "Tue 1 Sep, 09:00", "&nbsp;", "&nbsp;", "한국", "Korea", "8월 수출입 확정치", "Korea August trade, final", False),
 ("9/5 (금) 21:30", "Fri 5 Sep, 21:30", "&nbsp;", "&nbsp;", "미국", "US", "미 8월 고용보고서", "US August employment report", False),
 ("<strong>9/9 (수)</strong>", "<strong>Wed 9 Sep</strong>",
  "<strong>확대된 바이백이 실제로 돌기 시작하는 날</strong>입니다. 11월 4일까지 한시 시행 &mdash; "
  "<strong>「의지」가 「능력」인지 여기서 갈립니다</strong>",
  "<strong>The expanded buyback actually begins</strong>, running to 4 November &mdash; <strong>where will is tested against "
  "ability</strong>", "미국", "US", "미 재무부 장기채 바이백 확대 시행", "Expanded Treasury buybacks begin", True),
 ("9/11 (금)", "Fri 11 Sep", "프로그램 매매가 커지는 날입니다", "Programme flows swell",
  "한국", "Korea", "선물&middot;옵션 동시만기", "Korean quadruple witching", False),
 ("11/19 (목)", "Thu 19 Nov", "SK하이닉스 자사주 <strong>취득 기간의 끝</strong>입니다(8/20 시작)",
  "The <strong>end of SK hynix&rsquo;s buying window</strong>, opened on 20 August",
  "기업", "Company", "SK하이닉스 자사주 취득 종료", "SK hynix buyback window closes", False),
]
calrows = []
for dk, de, nk_, ne_, tk, te, ek, ee, hl in CAL:
    calrows.append('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(dk, de) + '</th>'
                   '<td class="n note">' + L(nk_, ne_) + '</td>'
                   '<td class="wrap">' + L(tk, te) + '</td>'
                   '<td class="wrap">' + L(ek, ee) + '</td>'
                   '<td class="n opt">' + VF_1 + '</td></tr>')

HOL = [("미국 (뉴욕)", "United States", "9/7 노동절 &middot; 11/26 추수감사절 &middot; 12/25 성탄절",
        "7 Sep Labor Day &middot; 26 Nov Thanksgiving &middot; 25 Dec Christmas"),
       ("일본 (도쿄)", "Japan", "9/21 경로의 날 &middot; 9/23 추분 &middot; 10/12 체육의 날 &middot; 11/3 문화의 날 &middot; 11/23 근로감사의 날",
        "21 Sep &middot; 23 Sep &middot; 12 Oct &middot; 3 Nov &middot; 23 Nov"),
       ("홍콩", "Hong Kong", "10/1 국경절 &middot; 10/19 중양절 &middot; 12/25~26 성탄 연휴",
        "1 Oct &middot; 19 Oct &middot; 25&ndash;26 Dec"),
       ("중국 (상하이&middot;선전)", "Mainland China", "<strong>10/1~10/8 국경절 연휴</strong> &mdash; 본토가 8일 쉽니다",
        "<strong>1&ndash;8 Oct National Day</strong> &mdash; eight sessions closed"),
       ("영국&middot;유럽", "UK and Europe", "8/31 서머뱅크홀리데이(영국) &middot; 12/25~26 성탄 연휴",
        "31 Aug Summer Bank Holiday (UK) &middot; 25&ndash;26 Dec"),
       ("한국", "Korea", "10/3 개천절 &middot; 10/9 한글날 &middot; 12/25 성탄절 &mdash; <strong>추석은 이미 지났습니다</strong>",
        "3 Oct &middot; 9 Oct &middot; 25 Dec &mdash; <strong>Chuseok has passed</strong>")]
holrows = ['      <tr><th class="wrap">' + L(a, b) + '</th><td class="wrap">' + L(c, d) + '</td>'
           '<td class="n opt">' + VF_1 + '</td></tr>' for a, b, c, d in HOL]

sec("calendar", "일정 &middot; 휴장일", "Calendar and Market Holidays",
    nextopen + '\n'
    + tbl("예정 일정 &mdash; 2026년 8월 24일 ~ 11월 19일 (한국시간)",
          "Scheduled events &mdash; 24 August to 19 November 2026, KST", cal_head, calrows, cls="data compact",
          foot_ko="<strong>다음 주가 이번 달의 고비입니다</strong> &mdash; 8/24 재무부, 8/26 엔비디아, 8/27 금통위, 8/28 잭슨홀이 "
            "나흘에 몰려 있습니다. 개장&middot;마감처럼 날마다 되풀이되는 시각은 넣지 않았습니다. "
            "<strong>컨센서스와 전망은 전망일 뿐 결과가 아닙니다.</strong>",
          foot_en="<strong>Next week is the month&rsquo;s hinge</strong> &mdash; the Treasury on the 24th, Nvidia on the 26th, the "
            "Bank of Korea on the 27th and Jackson Hole on the 28th, all inside four days. Daily fixtures are excluded. "
            "<strong>Consensus figures are expectations, not results.</strong>")
    + '\n' + tbl("해외 휴장일 &mdash; 앞으로 넉 달", "Overseas market holidays &mdash; the next four months",
          [TH("시장", "Market", "wrap"), TH("휴장일", "Closed", "wrap"), TH("검증", "Verified", "n opt")],
          holrows, cls="data compact",
          foot_ko="<strong>가장 긴 것은 중국 국경절(10/1~10/8)</strong>입니다 &mdash; 본토가 8거래일 쉬는 동안 홍콩은 10/1 하루만 "
            "쉬므로, 그 사이 중화권 뉴스는 <strong>홍콩 가격으로만</strong> 들어옵니다. <strong>날짜는 주문 직전 재확인하십시오.</strong>",
          foot_en="<strong>The longest is China&rsquo;s National Day, 1&ndash;8 October</strong> &mdash; the mainland closes for "
            "eight sessions while Hong Kong closes only on the 1st, so Greater China news arrives <strong>at Hong Kong prices "
            "alone</strong> during that window. <strong>Reconfirm dates before acting.</strong>"))


# ══════════════════════════════════════════════════════════════════
# 14 리스크 점검
# ══════════════════════════════════════════════════════════════════
RISKS = [
 ("장기금리가 바이백을 이겼습니다", "Long yields beat the buyback",
  "30년물 " + n(ru["curve"]["ust30y"], 3) + "%, 10년물 " + n(ru["curve"]["ust10y"], 3) +
  "%. 21일에는 <strong>2년물까지 " + bp(ru["change_bp"]["ust2y"]) + "</strong> 올라 연준 기대까지 움직였습니다. "
  "<strong>10년물이 6~7%로 가면 문제</strong>라는 것이 월가의 선입니다.",
  "The 30-year at " + n(ru["curve"]["ust30y"], 3) + "% and the 10-year at " + n(ru["curve"]["ust10y"], 3) +
  "%. On the 21st even the <strong>2-year rose " + bp(ru["change_bp"]["ust2y"]) + "</strong>, so Fed expectations moved too. "
  "Wall Street&rsquo;s line is that <strong>6&ndash;7% on the 10-year would be a problem</strong>."),
 ("지수가 시장을 가리고 있습니다", "The index is hiding the market",
  "코스피 +0.88% 인 날 오른 종목은 " + n(ksb["advancing"], 0) + "개, 내린 종목은 " + n(ksb["declining"], 0) +
  "개입니다. <strong>삼전닉스가 시총의 50.93%</strong> 이므로 <strong>지수는 두 종목의 안부이지 시장의 안부가 아닙니다.</strong> "
  "고객 계좌의 체감은 지수와 크게 다를 수 있습니다.",
  "On a day the KOSPI rose 0.88%, " + n(ksb["advancing"], 0) + " stocks rose and " + n(ksb["declining"], 0) +
  " fell. With two names at <strong>50.93% of market capitalisation</strong>, <strong>the index reports on them, not on the "
  "market.</strong> Client accounts may feel nothing like it."),
 ("레버리지가 양쪽으로 쌓였습니다", "Leverage built on both sides",
  "신용융자가 8월 19일 <strong>" + jo(mfl["credit_balance"]) + "원</strong>까지 늘었고, 단일종목 레버리지 ETF 4종에 한 달 "
  "<strong>66조 1,298억원</strong>이 오갔습니다 " + VF_1 + ". <strong>리밸런싱이 같은 방향의 매매를 증폭</strong>하므로 "
  "오를 때도 내릴 때도 폭이 커집니다.",
  "Margin loans reached <strong>KRW " + jo(mfl["credit_balance"]) + "</strong> on 19 August, and <strong>KRW 66.1tn</strong> passed "
  "through four single-stock leveraged ETFs in a month " + VF_1 + ". <strong>Rebalancing amplifies moves in the same "
  "direction</strong> &mdash; upward and downward alike."),
 ("유가가 물가 쪽에서 밀고 있습니다", "Oil is pushing from the inflation side",
  "브렌트 6거래일 연속 상승, 주간 " + pct(I["brent"]["perf"]["w1"]) + ". <strong>8월 24일 대이란 압박 계획 발표</strong>가 "
  "예정돼 있고, 8월 27일 금통위가 바로 뒤입니다. <strong>유가는 금리 인하 여지를 줄입니다.</strong>",
  "Brent up six sessions, " + pct(I["brent"]["perf"]["w1"]) + " on the week, with the <strong>Iran plan due on 24 August</strong> and "
  "the Bank of Korea meeting on the 27th. <strong>Oil narrows the room to cut.</strong>"),
 ("반도체 업황은 아직 답하지 않았습니다", "The semiconductor cycle has not answered yet",
  "국내 반도체가 오른 이유는 <strong>업황이 아니라 주주환원</strong>입니다. 같은 주에 SOX 는 " + pct(I["sox"]["perf"]["w1"]) +
  " 였습니다. <strong>8월 26일 엔비디아 실적</strong>이 업황 쪽 답을 줍니다 &mdash; 그전까지는 두 이야기를 갈라 두십시오.",
  "Korean chips rose on <strong>payouts, not the cycle</strong> &mdash; in the same week the SOX was " +
  pct(I["sox"]["perf"]["w1"]) + ". <strong>Nvidia&rsquo;s results on 26 August</strong> answer the cycle side; keep the two stories "
  "apart until then."),
 ("확인하지 못한 것", "What we could not verify",
  "VKOSPI(KRX 인증키 없음), 미수금&middot;반대매매 금액(금투협 방화벽), 한국은행 기준금리(ECOS 샘플키 0행). "
  "<strong>지어내지 않고 비워 두었습니다</strong> &mdash; 검증 노트를 보십시오.",
  "VKOSPI (no KRX key), forced-liquidation amounts (KOFIA firewall) and the Bank of Korea policy rate (ECOS sample key returns zero "
  "rows). <strong>Left blank rather than filled in</strong> &mdash; see the verification notes."),
]
sec("risks", "리스크 점검", "Risk Check",
    '<ul class="risks">\n' + "\n".join(
      '  <li><strong>' + L(a, b) + '</strong><br>' + L(c, d) + '</li>' for a, b, c, d in RISKS) + '\n</ul>')


# ══════════════════════════════════════════════════════════════════
# 베타 — 증권업 · 미래에셋증권 동향
# ══════════════════════════════════════════════════════════════════
# 「동향」이므로 기사와 수치를 함께 놓는다. 기사는 회사가 **한 일**만 쓴다
# (kind=about). 그 회사 사람을 논평자로 인용한 시황 기사는 리서치이지
# 회사 소식이 아니라 쓰지 않는다.
BN = D.get("broker_news") or {}
BS = D.get("broker_stocks") or {}
SEC_SEC = next((x for x in (D.get("sectors") or {}).get("all") or []
                if x.get("name") == "증권"), None)

br_rows = []
for _nm in ("미래에셋증권", "삼성증권", "NH투자증권", "키움증권",
            "한국금융지주", "메리츠증권", "대신증권", "한화투자증권"):
    q = BS.get(_nm)
    if not q:
        continue
    br_rows.append('      <tr' + (' class="hl"' if _nm == "미래에셋증권" else '') +
                   '><th class="wrap">' + _nm + '</th>'
                   '<td class="n">' + n(q["close"], 0) + '</td>' + cell(q["change_pct"]) +
                   perf_cells(q.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
if SEC_SEC:
    _sp = SEC_SEC.get("perf") or {}
    br_rows.append('      <tr class="sum"><th class="wrap">' + L("증권 업종 전체", "Securities sector") +
                   '</th><td class="n"><span class="mut">&mdash;</span></td>' +
                   cell(SEC_SEC["change_pct"]) +
                   '<td class="n perf">' + (pct(_sp["w1"]) if "w1" in _sp else '<span class="mut">&mdash;</span>') + '</td>' +
                   '<td class="n perf"><span class="mut">&mdash;</span></td>' * 3 +
                   '<td class="n opt">' + VF_C + '</td></tr>')

br_tbl = tbl("증권업 주가 &mdash; 8월 21일 마감", "Brokerage share prices &mdash; 21 August close",
    [TH("종목", "Name", "wrap"), TH("종가", "Close", "n"), TH("등락률", "Change %", "n"),
     THP(), TH("검증", "Verified", "n opt")], br_rows, cls="data compact",
    foot_ko="<strong>업종 줄의 기간 수익률은 지수가 아니라 일간 등락률을 이어 곱한 값</strong>이고 쌓인 날이 "
      "닷새뿐이라 1주까지만 냅니다 &mdash; 1개월·3개월은 지어내지 않고 비웠습니다 " + VF_C + ".",
    foot_en="<strong>The sector row compounds daily moves rather than tracking an index</strong>, and only five "
      "sessions have accumulated, so nothing beyond one week is shown " + VF_C + ".") if br_rows else ""

def _bn_cards(items, empty_ko, empty_en):
    got = [a for a in items if a.get("kind") == "about"]
    if not got:
        return ('<div class="soft-card">\n  <p class="q">' + L("오늘은 없습니다", "Nothing today") +
                '</p>\n  <p>' + L(empty_ko, empty_en) + ' ' + VF_N + '</p>\n</div>')
    out = []
    for a in got:
        out.append('<div class="soft-card">\n  <p class="q">' + esc(a["title"])[:120] + '</p>\n'
                   '  <p>' + L("<strong>" + a["company"] + "</strong> &mdash; " + esc(a["body"][:230]).strip() + "&hellip;",
                              "<strong>" + a["company"] + "</strong> &mdash; " + esc(a["body"][:230]).strip() + "&hellip;")
                   + ' ' + VF_1 + '</p>\n</div>')
    return "\n".join(out)

_mirae = _bn_cards(BN.get("mirae") or [],
    "미래에셋증권 자체에 관한 소식이 오늘 수집분에 없습니다. 그 회사 연구원을 인용한 시황 기사 "
    + str(len([a for a in BN.get("mirae") or [] if a.get("kind") != "about"]))
    + "건은 리서치이지 회사 소식이 아니라 쓰지 않았습니다.",
    "No news about the company itself in today's collection.")
_peers = _bn_cards(BN.get("sector") or [],
    "동종 증권사의 회사 소식이 오늘 수집분에 없습니다.",
    "No peer-company news in today's collection.")

_si = BN.get("sector_issues") or []
if _si:
    _si_html = "\n".join(
        '<div class="soft-card">\n  <p class="q">' + esc(x["title"])[:120] + '</p>\n  <p>'
        + L(esc(x.get("sentence") or ""), esc(x.get("sentence") or "")) + ' ' + VF_1 + '</p>\n</div>'
        for x in _si[:4])
else:
    _si_html = ('<div class="soft-card">\n  <p class="q">' + L("업권 이슈 &mdash; 오늘은 없습니다", "Industry issues &mdash; none today")
                + '</p>\n  <p>' + L(
        "규제&middot;수수료&middot;발행어음처럼 <strong>업권 전체에 걸린 기사</strong>가 오늘 수집분에 없습니다. "
        "「증권가에선 …」 같은 <strong>출처를 대는 말투</strong>는 업권 이슈로 세지 않습니다 &mdash; 그렇게 세면 "
        "그날 기사 절반이 들어옵니다.",
        "No industry-wide story in today's collection. Attribution phrases are not counted as industry issues.")
                + ' ' + VF_N + '</p>\n</div>')

sec("broker", "증권업 &middot; 미래에셋증권 동향", "Securities Industry and Mirae Asset",
    '<p class="lede">' + L(
      "<strong>업권과 우리 회사가 어제 어떻게 움직였는지입니다.</strong> 증권 업종은 " +
      (pct(SEC_SEC["change_pct"]) if SEC_SEC else "&mdash;") +
      " 로 코스피(" + pct(KS["change_pct"]) + ")와 <strong>반대로 갔습니다</strong> &mdash; "
      "주주환원 이야기가 삼성전자 한 종목으로 몰리면서 나머지가 밀린 날입니다. "
      "아래 기사는 <strong>회사가 한 일</strong>만 담았습니다. 그 회사 연구원을 인용한 시황&middot;종목 "
      "기사는 리서치이지 회사 소식이 아니라 뺐습니다.",
      "<strong>How the industry and our own firm moved yesterday.</strong> The securities sector was " +
      (pct(SEC_SEC["change_pct"]) if SEC_SEC else "&mdash;") + " against the KOSPI's " + pct(KS["change_pct"]) +
      ". Below are only items about what the companies did &mdash; research notes quoting their analysts are excluded.")
    + '</p>\n' + (br_tbl + '\n' if br_tbl else '')
    + '<h3 class="sub-h">' + L("미래에셋증권", "Mirae Asset Securities") + '</h3>\n'
    + '<div class="soft-grid">\n' + _mirae + '\n</div>\n'
    + '<h3 class="sub-h">' + L("동종 증권사", "Peers") + '</h3>\n'
    + '<div class="soft-grid">\n' + _peers + '\n</div>\n'
    + '<h3 class="sub-h">' + L("업권 전반", "Industry-wide") + '</h3>\n'
    + '<div class="soft-grid">\n' + _si_html + '\n</div>')



# ══════════════════════════════════════════════════════════════════
# 15 WM 업계
# ══════════════════════════════════════════════════════════════════
WM = [
 ("주주환원이 업계의 화두가 됐습니다", "Shareholder returns have become the industry&rsquo;s subject",
  "사흘 사이 <strong>SK하이닉스 40조원</strong>과 <strong>삼성전자 최대 110조원</strong>이 나왔습니다. 삼성전자의 이번 규모는 "
  "종전 최대였던 2020년 20조 3,000억원의 <strong>약 5배</strong>이고, 3분기 현금배당만 약 30조원입니다 &mdash; "
  "다만 <strong>주당 배당액과 정규&middot;특별 구분은 10월 말 이사회에서, 나머지 시행 방안은 내년 1월 말 이사회에서</strong> 확정됩니다 " + VF_1 + ". "
  "<strong>고객께는 「확정된 것」과 「10월·1월에 정해질 것」을 갈라 말씀해 주십시오.</strong>",
  "In three days came <strong>KRW 40tn at SK hynix</strong> and <strong>up to KRW 110tn at Samsung Electronics</strong> &mdash; about "
  "<strong>five times</strong> the previous record of KRW 20.3tn in 2020, with roughly KRW 30tn of cash dividend in the third quarter "
  "alone. But <strong>the per-share amount and the split between regular and special dividends are set at the late-October board, and "
  "the rest of the mechanics at the late-January board</strong> " + VF_1 +
  ". <strong>Separate what is decided from what is still to be decided in October and January.</strong>"),
 ("「배당수익률」만 보면 함정에 빠집니다", "Chasing dividend yield alone is a trap",
  "고배당 상품 문의가 늘고 있습니다. 다만 <strong>배당수익률은 주가가 내리면 자동으로 올라갑니다</strong> &mdash; 수익률이 높다는 "
  "사실 자체가 <strong>주가 하락의 결과</strong>일 수 있습니다. SK하이닉스 사례가 좋은 설명 재료입니다: 환원 재원이 "
  "<strong>회계상 이익이 아니라 설비투자 뒤 남는 잉여현금흐름</strong>에 연동돼 있어 <strong>투자 부담이 커지면 환원도 줄어듭니다</strong> " + VF_1 + ".",
  "Enquiries about high-yield products are rising. But <strong>yield rises automatically when the price falls</strong> &mdash; a high "
  "yield can be <strong>the consequence of a decline</strong>. SK hynix illustrates it: the payout is tied to <strong>free cash flow "
  "after capex, not accounting profit</strong>, so <strong>heavier investment means a smaller return</strong> " + VF_1 + "."),
 ("3배 레버리지를 찾아 해외로 나가고 있습니다", "Money is going offshore for 3x leverage",
  "국내 2배 상한을 피해 <strong>해외 상장 3배 상품</strong>으로 나가는 흐름이 보도되고 있고, 관련 거래액이 <strong>9조원</strong>을 "
  "넘었습니다 " + VF_1 + ". 3배 상품은 <strong>일별 수익률의 3배</strong>를 추종하므로 횡보장에서 원금이 갉아먹히는 정도가 큽니다 &mdash; "
  "<strong>이번 주처럼 하루 5~6% 가 오가는 장에서는 특히 그렇습니다.</strong>",
  "Reports describe money moving to <strong>offshore 3x products</strong> to get around the domestic 2x cap, with turnover past "
  "<strong>KRW 9tn</strong> " + VF_1 + ". A 3x fund tracks <strong>three times the daily return</strong>, so decay in a choppy market "
  "is severe &mdash; <strong>especially in a week that swung 5&ndash;6% a day.</strong>"),
 ("외국인은 7개월 연속 순매도입니다", "Foreigners have sold for seven straight months",
  "금융감독원 집계로 7월 외국인은 상장주식 <strong>31조 6,640억원</strong>을 순매도했고, 시가총액 대비 지분율은 36.4%(역대 최고)에서 "
  "<strong>35.8%</strong>로 내려왔습니다. 반면 <strong>채권은 4개월 연속 순투자</strong>입니다 " + VF_1 + ". "
  "이번 주 주주환원 이야기가 <strong>그 흐름을 되돌릴 재료가 되는지</strong>가 9월의 관전 포인트입니다.",
  "The FSS reports <strong>KRW 31.66tn</strong> of net foreign equity selling in July, with ownership easing from a record 36.4% to "
  "<strong>35.8%</strong>. <strong>Bonds saw a fourth straight month of net investment</strong> " + VF_1 +
  ". Whether the payout story <strong>turns that flow</strong> is September&rsquo;s question."),
]
sec("wm", "WM 업계", "WM Industry",
    '<div class="soft-grid">\n' + "\n".join(
      '<div class="soft-card">\n  <p class="q">' + L(a, b) + '</p>\n  <p>' + L(c, d) + '</p>\n</div>'
      for a, b, c, d in WM) + '\n</div>')


# ══════════════════════════════════════════════════════════════════
# 16 고객 응대 포인트
# ══════════════════════════════════════════════════════════════════
ENTRY = [("2026-08-14", "직전 금요일 종가 &mdash; 한 주 전", "Last Friday&rsquo;s close &mdash; a week ago", 6977.94, 864.65),
         ("2026-08-19", "8월 19일 종가 &mdash; 폭락일", "Close of 19 Aug &mdash; the crash", 6471.17, 824.46),
         ("2026-08-20", "8월 20일 종가 &mdash; 급등일", "Close of 20 Aug &mdash; the surge", 6852.58, 840.89),
         ("2026-08-06", "8월 6일 종가", "Close of 6 August", 6296.38, 801.67),
         ("2026-08-04", "8월 초 (8월 4일 종가)", "Early August &mdash; close of 4 August", 6358.95, 800.0)]
en_rows = []
for dt, ko, en, kb, qb in ENTRY:
    rk_ = (KS["close"] / kb - 1) * 100.0
    rq_ = (KQ["close"] / qb - 1) * 100.0
    en_rows.append('      <tr' + (' class="hl"' if dt == "2026-08-14" else '') + '>'
                   '<th class="wrap">' + L(ko, en) + '</th>'
                   '<td class="n">' + dt[5:] + '</td>'
                   '<td class="n">' + pct(rk_) + '</td>'
                   '<td class="n">' + pct(rq_) + '</td>'
                   '<td class="n opt">' + VF_C + '</td></tr>')
entry = tbl("진입 시점별 손익 &mdash; 8월 21일 종가 기준", "Profit and loss by entry point &mdash; at the 21 August close",
    [TH("진입 시점", "Entry", "wrap"), TH("날짜", "Date", "n"), TH("코스피", "KOSPI", "n"),
     TH("코스닥", "KOSDAQ", "n"), TH("검증", "Verified", "n opt")], en_rows, cls="data compact",
    foot_ko="<strong>코스피와 코스닥의 차이를 보십시오.</strong> 한 주 전에 들어오셨다면 코스피는 " +
      pct(KS_WK) + " 인데 코스닥은 " + pct(KQ_WK) + " 입니다 &mdash; <strong>같은 시장에 같은 날 들어왔는데 손익이 여섯 배 이상 "
      "차이</strong>납니다 " + VF_C + ". <strong>지수 기준이라 개별 계좌와는 또 다릅니다</strong> &mdash; 어제만 해도 오른 종목이 "
      "코스피 " + n(ksb["advancing"], 0) + "개, 코스닥 " + n(kqb["advancing"], 0) + "개뿐이었습니다.",
    foot_en="<strong>Look at the gap between the two boards.</strong> An entry a week ago leaves the KOSPI at " + pct(KS_WK) +
      " and the KOSDAQ at " + pct(KQ_WK) + " &mdash; <strong>the same market on the same day, more than six times apart</strong> " +
      VF_C + ". <strong>These are index figures, not account figures</strong>: yesterday only " + n(ksb["advancing"], 0) +
      " KOSPI and " + n(kqb["advancing"], 0) + " KOSDAQ stocks rose.")

QA = [
 ("코스피는 올랐다는데 제 계좌는 왜 마이너스인가요?", "The KOSPI rose &mdash; why is my account down?",
  "<strong>어제가 정확히 그런 날이었습니다.</strong> 코스피는 " + pct(KS["change_pct"]) + " 올랐지만 <strong>오른 종목은 " +
  n(ksb["advancing"], 0) + "개, 내린 종목은 " + n(ksb["declining"], 0) + "개</strong>였고 코스닥은 " + pct(KQ["change_pct"]) +
  " 였습니다. 이유는 하나입니다 &mdash; <strong>삼성전자와 SK하이닉스가 코스피 시가총액의 50.93%</strong> 를 차지하기 때문입니다 " + VF_1 +
  ". <strong>지수는 두 종목의 안부이지 시장의 안부가 아닙니다.</strong> 보험&middot;통신&middot;금융을 담고 계셨다면 좋은 하루였고, "
  "2차전지&middot;방산&middot;바이오였다면 나쁜 하루였습니다.",
  "<strong>Yesterday was exactly that day.</strong> The KOSPI rose " + pct(KS["change_pct"]) + " while <strong>" +
  n(ksb["advancing"], 0) + " stocks rose and " + n(ksb["declining"], 0) + " fell</strong>, and the KOSDAQ fell " +
  pct(KQ["change_pct"]) + ". There is one reason: <strong>Samsung Electronics and SK hynix are 50.93% of KOSPI market "
  "capitalisation</strong> " + VF_1 + ". <strong>The index reports on them, not on the market.</strong> Insurers, telecoms and banks "
  "had a good day; batteries, defence and biotech did not."),
 ("삼성전자 110조 주주환원, 지금 사도 될까요?", "Samsung&rsquo;s KRW 110tn return &mdash; should I buy now?",
  "<strong>확정된 것과 아직 아닌 것을 갈라 보셔야 합니다.</strong> 확정: 이사회가 <strong>90조~110조원 규모 2026년 주주환원 시행 방안을 "
  "의결</strong>했고 3분기 현금배당은 약 30조원입니다. 아직 아닌 것: <strong>주당 배당액과 정규&middot;특별 구분은 10월 말 이사회</strong>, "
  "<strong>나머지 시행 방안은 내년 1월 말 이사회</strong>에서 정해집니다 " + VF_1 + ". "
  "그리고 <strong>시장은 이미 이 소식에 한 번 반응했습니다</strong> &mdash; 정규장 +3.87% 뒤 애프터마켓에서 4% 되밀렸습니다. "
  "「기대가 선반영됐다」는 것이 그 해석입니다. <strong>확정된 투자 판단이 아닙니다.</strong>",
  "<strong>Separate what is decided from what is not.</strong> Decided: the board <strong>approved a 2026 programme of KRW "
  "90&ndash;110tn</strong>, with about KRW 30tn of cash dividend in the third quarter. Not yet: <strong>the per-share amount and the "
  "regular/special split come at the late-October board</strong>, and <strong>the remaining mechanics at the late-January board</strong> " +
  VF_1 + ". And <strong>the market has already reacted once</strong> &mdash; up 3.87% in the regular session, then 4% lower after "
  "hours, read as expectations having run ahead. <strong>This is not a settled investment judgement.</strong>"),
 ("금값이 계속 오르는데 지금 들어가도 되나요?", "Gold keeps rising &mdash; is it too late?",
  "<strong>먼저 왜 오르는지를 보셔야 합니다.</strong> 이번 주 금은 " + pct(I["gold"]["perf"]["w1"]) + ", 1개월 " +
  pct(I["gold"]["perf"]["m1"]) + " 입니다. 배경은 <strong>미 재정에 대한 불신</strong>입니다 &mdash; 국가부채 40조달러, "
  "바이백으로도 잡히지 않는 장기금리, 그리고 레이 달리오의 「채권 줄이고 금 사라」 " + VF_1 + ". "
  "<strong>이 이유가 유지되는 동안은 방향이 유지되기 쉽지만, 반대로 재정 우려가 걷히면 가장 먼저 되돌아옵니다.</strong> "
  "<strong>한 달에 14% 오른 자산에 한 번에 들어가는 것은 권해 드리기 어렵습니다</strong> &mdash; 나눠 들어가시는 편을 말씀드립니다. "
  "확정된 판단이 아닙니다.",
  "<strong>Start with why it is rising.</strong> Gold is " + pct(I["gold"]["perf"]["w1"]) + " on the week and " +
  pct(I["gold"]["perf"]["m1"]) + " over a month, on <strong>distrust of the US fiscal path</strong> &mdash; USD 40tn of debt, long "
  "yields that buybacks could not hold, and Dalio&rsquo;s call to cut bonds and buy gold " + VF_1 +
  ". <strong>While that reason holds the direction tends to hold; if fiscal worry lifts, this is what turns first.</strong> "
  "<strong>Going in all at once after a 14% month is hard to recommend</strong> &mdash; phasing in is the safer counsel. Not a "
  "settled judgement."),
 ("다음 주에 뭘 보면 되나요?", "What should I watch next week?",
  "<strong>나흘에 넷이 몰려 있습니다.</strong> <strong>8/24 베선트 재무장관</strong>(국채시장 대응 + 대이란 압박 계획), "
  "<strong>8/26 엔비디아 실적</strong>(국내 새벽 8/27), <strong>8/27 한국은행 금통위</strong>, "
  "<strong>8/28 케빈 워시 연준 의장 잭슨홀 연설</strong>. "
  "<strong>월요일은 조용히 열립니다</strong> &mdash; 주말 사이 새 해외 마감이 없어 금요일 뉴욕 하루치만 반영합니다. "
  "증권가가 제시한 다음 주 코스피 범위는 <strong>6,400~7,500</strong> 인데, <strong>1,100포인트짜리 밴드 자체가 「모른다」는 뜻</strong>입니다 " + VF_1 + ".",
  "<strong>Four events in four days.</strong> <strong>Bessent on the 24th</strong> (Treasury market plus the Iran plan), "
  "<strong>Nvidia on the 26th</strong> (early on the 27th in Korea), <strong>the Bank of Korea on the 27th</strong> and <strong>Fed "
  "Chair Kevin Warsh at Jackson Hole on the 28th</strong>. <strong>Monday opens quietly</strong> &mdash; with no weekend material it "
  "prices Friday&rsquo;s New York close alone. The sell-side range for next week is <strong>6,400&ndash;7,500</strong>; <strong>a band "
  "1,100 points wide is a way of saying nobody knows</strong> " + VF_1 + "."),
]
qa_html = "\n".join('<div class="soft-card">\n  <p class="q">' + L("Q. " + a, "Q. " + b) + '</p>\n  <p>' + L(c, d) + '</p>\n</div>'
                    for a, b, c, d in QA)
sec("talking", "고객 응대 포인트", "Talking Points",
    '<p class="lede">' + L(
      "<strong>월요일에 가장 많이 올 질문은 「지수는 올랐다는데 왜 내 계좌는 마이너스냐」입니다.</strong> "
      "어제가 정확히 그런 날이었고, 답은 <strong>삼전닉스가 코스피의 절반</strong>이라는 한 문장에 있습니다. "
      "아래 답변은 모두 이 판의 표에서 나온 숫자로만 만들었습니다. <strong>확정된 투자 판단이 아닙니다.</strong>",
      "<strong>Monday&rsquo;s most common question will be why an account is down when the index rose.</strong> Yesterday was exactly "
      "that day, and the answer is one sentence: <strong>two stocks are half the KOSPI</strong>. Every answer below is built only from "
      "the tables in this edition. <strong>None of it is a settled investment judgement.</strong>") + '</p>\n' + entry
    + '\n<div class="soft-grid">\n' + qa_html + '\n</div>')


# ══════════════════════════════════════════════════════════════════
# 17 데이터 검증 노트
# ══════════════════════════════════════════════════════════════════
lineage_rows = [
 ("지수 종가 &middot; 장중 고저", "Index closes and intraday range", "야후 파이낸스 + 네이버 지수 페이지", "Yahoo Finance + Naver", VF_2),
 ("등락 종목 수 &middot; 상한가", "Breadth and limit moves", "네이버 금융 시세 페이지", "Naver Finance", VF_MD),
 ("투자자별 수급 &middot; 프로그램", "Investor flows and programme trading", "네이버 투자자별 매매동향", "Naver investor flows", VF_MD),
 ("예탁금 &middot; 신용잔고", "Deposits and margin", "네이버 금융 (8/19 기준)", "Naver Finance, as of 19 Aug", VF_MD),
 ("국고채 &middot; CD", "Korean bonds and CD", "한국은행 ECOS 817Y002 (샘플 인증키)", "Bank of Korea ECOS 817Y002 (sample key)", VF_MD),
 ("미 국채 곡선", "US Treasury curve", "미 재무부 확정 고시 (8/21)", "US Treasury official fixing (21 Aug)", VF_2),
 ("환율", "Exchange rates", "야후 (24시간, 8/22 아침)", "Yahoo (24-hour, morning of 22 Aug)", VF_MD),
 ("원자재 &middot; 비트코인", "Commodities and bitcoin", "야후 (24시간 시장 &mdash; 종가 없음)", "Yahoo (24-hour market)", VF_MD),
 ("삼성전자 110조 &middot; 애프터마켓", "Samsung KRW 110tn and after-hours", "수집 기사 본문 24건", "24 collected article bodies", VF_1),
 ("삼전닉스 비중 &middot; 레버리지 ETF 거래대금", "Concentration and leveraged ETF turnover",
  "한국거래소 집계 (언론 인용)", "KRX data via press", VF_1),
 ("7월 외국인 순매도", "July foreign selling", "금융감독원 (언론 인용)", "FSS via press", VF_1),
 ("증권사 코멘트", "Broker comments", "기사 본문의 실명&middot;소속 확인분만", "Only named, firm-confirmed quotes", VF_1),
 ("VKOSPI", "VKOSPI", "KRX 인증키가 없어 받지 못했습니다. VIX 로 대신 봅니다", "No KRX key &mdash; VIX used as a stand-in", VF_N),
 ("미수금 &middot; 반대매매", "Margin calls and forced sales", "금투협 웹방화벽이 막습니다", "Blocked by the KOFIA firewall", VF_N),
 ("한국은행 기준금리", "Bank of Korea policy rate", "ECOS 샘플 인증키로는 0행이 돌아옵니다", "The ECOS sample key returns zero rows", VF_N),
]
lin = tbl("데이터 계보 &mdash; 어느 숫자가 어디서 왔나", "Data lineage &mdash; where each number came from",
    [TH("항목", "Item", "wrap"), TH("출처", "Source", "wrap"), TH("검증", "Verified", "n")],
    ['      <tr><th class="wrap">' + L(a, b) + '</th><td class="wrap">' + L(c, d) + '</td>'
     '<td class="n">' + e + '</td></tr>' for a, b, c, d, e in lineage_rows], cls="data compact")

VN = [
 ("(a) 이 판에는 「오늘 시세」가 없습니다", "(a) There is no &lsquo;today&rsquo; price in this edition",
  "토요일이라 <strong>어느 시장도 열리지 않습니다.</strong> 국내는 8월 21일(금) 마감, 미국&middot;유럽&middot;아시아도 8월 21일 현지 "
  "마감이 마지막입니다. <strong>환율&middot;원자재&middot;비트코인만 24시간 시장이라 오늘 아침(8월 22일) 값</strong>입니다 " + VF_MD +
  ". 표마다 날짜를 적어 두었으니 <strong>「어제」와 「오늘」을 섞어 읽지 마십시오.</strong>",
  "It is Saturday, so <strong>no market is open.</strong> Korea is the 21 August close; the US, Europe and Asia are their 21 August "
  "local closes. <strong>Only FX, commodities and bitcoin trade around the clock, so those are this morning&rsquo;s figures, 22 "
  "August</strong> " + VF_MD + ". Each table carries its date &mdash; <strong>do not mix the two.</strong>"),
 ("(b) 삼성전자 110조는 「범위」이고 세부는 미정입니다", "(b) The KRW 110tn is a range, and the detail is not set",
  "이사회가 의결한 것은 <strong>90조~110조원 규모의 2026년 주주환원 시행 방안</strong>이고, 3분기 현금배당은 약 30조원입니다. "
  "<strong>주당 배당액과 정규&middot;특별 구분은 10월 말 이사회, 나머지 시행 방안은 내년 1월 말 이사회</strong>에서 확정됩니다 " + VF_1 + ". "
  "<strong>「110조원 확정」으로 읽으면 틀립니다.</strong> 자사주 소각의 구체적 규모와 집행 방식도 아직입니다 &mdash; "
  "애프터마켓에서 4% 되밀린 이유가 그것으로 해석됩니다.",
  "The board approved a <strong>2026 programme of KRW 90&ndash;110tn</strong>, with about KRW 30tn of third-quarter cash dividend. "
  "<strong>The per-share amount and the regular/special split come at the late-October board; the rest of the mechanics at the "
  "late-January board</strong> " + VF_1 + ". <strong>Reading it as &lsquo;KRW 110tn confirmed&rsquo; would be wrong.</strong> The size "
  "and method of the buyback are also unset &mdash; which is how the 4% after-hours give-back is explained."),
 ("(c) 52주 고점은 최근 종가 흐름과 큰 차이가 있습니다", "(c) The 52-week high sits far above recent closes",
  "네이버 지수 페이지의 코스피 52주 최고는 <strong>" + n(KSI["fifty_two_week"]["high"]) + "</strong> 인데 최근 종가 흐름의 최고는 "
  "6,977.94(8/14)입니다. <strong>표기 기준을 확인하지 못했습니다</strong> &mdash; 52주 위치 " + n(KS_POS, 1) +
  "% 는 이 값을 그대로 쓴 계산이므로 <strong>참고치로만 보십시오</strong> " + VF_C + ". 52주 저점도 수집 시점마다 달라집니다.",
  "Naver&rsquo;s 52-week high for the KOSPI is <strong>" + n(KSI["fifty_two_week"]["high"]) + "</strong> while the highest recent "
  "close is 6,977.94 on 14 August. <strong>The basis could not be confirmed</strong>; the " + n(KS_POS, 1) +
  "% position derives straight from it, so <strong>treat it as indicative</strong> " + VF_C + ". The low also shifts between collections."),
 ("(d) 달러인덱스는 다른 시계로 돕니다", "(d) The dollar index runs on a different clock",
  "「달러 상대 통화」 표에서 <strong>통화쌍 아홉 줄은 오늘 아침(8/22) 값</strong>인데 <strong>달러인덱스만 8월 21일 종가</strong>입니다 &mdash; "
  "미국 장중에만 갱신되는 지수이기 때문입니다. <strong>방향은 개별 통화쌍으로 읽으십시오</strong> " + VF_C + ".",
  "In the dollar table the <strong>nine pairs are this morning&rsquo;s (22 August) quotes</strong> while <strong>the dollar index "
  "alone is the 21 August close</strong>, because it updates only during the US session. <strong>Read direction from the pairs</strong> " + VF_C + "."),
 ("(e) 회사채 두 줄은 등급이 다릅니다", "(e) The two corporate bond lines are different ratings",
  "네이버가 주는 <strong>" + n(rkr["corp3y"], 2) + "%</strong> 는 AA&minus; 급이고, 한국은행 ECOS 에서 받은 <strong>" +
  n(ec["corp3y_bbb"]["value"], 3) + "%</strong> 는 BBB&minus; 급입니다. 만기는 둘 다 3년입니다 &mdash; "
  "<strong>두 줄을 같은 것으로 보시면 안 됩니다.</strong>",
  "Naver&rsquo;s <strong>" + n(rkr["corp3y"], 2) + "%</strong> is AA&minus;; the <strong>" + n(ec["corp3y_bbb"]["value"], 3) +
  "%</strong> from ECOS is BBB&minus;. Both are three-year &mdash; <strong>do not read them as the same thing.</strong>"),
 ("(f) 유가는 두 값이 다 맞습니다", "(f) Both crude figures are correct",
  "표의 브렌트 <strong>" + n(I["brent"]["close"]) + "달러</strong>는 야후 수집 시각 값이고, 보도의 <strong>94달러대</strong>는 뉴욕 정산 "
  "기준입니다. <strong>24시간 시장이라 시각이 다르면 값도 다릅니다</strong> &mdash; 「6거래일 연속 상승」과 주간 " +
  pct(I["brent"]["perf"]["w1"]) + " 는 둘 다 같습니다 " + VF_C + ".",
  "The table&rsquo;s Brent at <strong>USD " + n(I["brent"]["close"]) + "</strong> is Yahoo&rsquo;s quote at collection; the reported "
  "<strong>USD 94 area</strong> is the New York settlement. <strong>A 24-hour market gives different numbers at different "
  "times</strong> &mdash; the six-session run and the " + pct(I["brent"]["perf"]["w1"]) + " week hold either way " + VF_C + "."),
 ("(g) 확보하지 못한 항목", "(g) What could not be obtained",
  "<strong>VKOSPI</strong>(KRX 인증키 없음 &mdash; VIX 로 대용), <strong>미수금&middot;반대매매 금액</strong>(금투협 웹방화벽 &mdash; "
  "신용잔고로 대용), <strong>한국은행 기준금리</strong>(ECOS 샘플키 0행). <strong>셋 다 지어내지 않고 비워 두었습니다</strong> " + VF_N + ". "
  "예탁금&middot;신용잔고는 결제일 기준이라 <strong>8월 19일</strong> 값입니다.",
  "<strong>VKOSPI</strong> (no KRX key &mdash; VIX substituted), <strong>forced-liquidation amounts</strong> (KOFIA firewall &mdash; "
  "margin balance substituted) and the <strong>Bank of Korea policy rate</strong> (ECOS sample key returns zero rows). <strong>All "
  "three left blank rather than filled in</strong> " + VF_N + ". Deposits and margin are settlement-dated to <strong>19 August</strong>."),
 ("(h) S&amp;P 500 과 나스닥의 일간 등락률이 같습니다", "(h) The S&amp;P 500 and NASDAQ moved by the same amount",
  "두 지수 모두 21일 <strong>" + pct(I["sp500"]["change_pct"]) + "</strong> 입니다 &mdash; 소수점 넷째 자리까지 같습니다. "
  "<strong>베낀 값이 아닙니다.</strong> 서로 다른 계열에서 따로 받았고, 종가(" + n(I["sp500"]["close"]) + " 대 " +
  n(I["nasdaq"]["close"]) + ")와 주간 수익률(" + pct(I["sp500"]["perf"]["w1"]) + " 대 " + pct(I["nasdaq"]["perf"]["w1"]) +
  ")은 서로 다릅니다 " + VF_MD + ". 우연이지만 눈에 띄는 자리라 적어 둡니다.",
  "Both indices are <strong>" + pct(I["sp500"]["change_pct"]) + "</strong> on the 21st &mdash; identical to four decimal places. "
  "<strong>This is not a copied figure.</strong> The two were collected as separate series, and their closes (" +
  n(I["sp500"]["close"]) + " against " + n(I["nasdaq"]["close"]) + ") and weekly returns (" + pct(I["sp500"]["perf"]["w1"]) +
  " against " + pct(I["nasdaq"]["perf"]["w1"]) + ") differ " + VF_MD + ". A coincidence, but a conspicuous one, so it is recorded."),
]
vn_html = "\n".join('<div class="soft-card">\n  <p class="q">' + L(a, b) + '</p>\n  <p>' + L(c, d) + '</p>\n</div>'
                    for a, b, c, d in VN)
sec("verify", "데이터 검증 노트", "Verification Notes",
    '<p class="lede">' + L(
      "<strong>이 판의 시세는 " + D["generated_at_kst"] + " 수집분입니다.</strong> 국내&middot;미국&middot;유럽&middot;아시아는 모두 "
      "<strong>8월 21일(금) 마감</strong>이고, 환율&middot;원자재&middot;비트코인만 <strong>오늘 아침(8월 22일)</strong> 값입니다. "
      "아래는 <strong>쓰지 않았거나, 두 값이 갈렸거나, 확보하지 못한 항목</strong>입니다.",
      "<strong>Market data here was collected at " + D["generated_at_kst"] + ".</strong> Korea, the US, Europe and Asia are all "
      "<strong>21 August closes</strong>; only FX, commodities and bitcoin are <strong>this morning&rsquo;s, 22 August</strong>. "
      "Below are the figures <strong>not used, disputed between sources, or unavailable</strong>.") + '</p>\n'
    + '<div class="soft-grid">\n' + vn_html + '\n</div>\n'
    + exp("데이터 계보 &mdash; 어느 숫자가 어디서 왔나", "Data lineage &mdash; where each number came from", lin))


# ══════════════════════════════════════════════════════════════════
# 18 출처
# ══════════════════════════════════════════════════════════════════
SRC = [
 ("지수 &middot; 종목 &middot; 환율 &middot; 원자재", "Indices, stocks, FX, commodities",
  "야후 파이낸스 (188개 계열)", "Yahoo Finance (188 series)"),
 ("등락 종목 수 &middot; 수급 &middot; 프로그램", "Breadth, flows and programme trading",
  "네이버 금융 &mdash; 지수 시세&middot;투자자별 매매동향 페이지", "Naver Finance"),
 ("국내 금리", "Korean rates", "한국은행 ECOS 817Y002 &middot; 네이버 시장지표", "Bank of Korea ECOS 817Y002 and Naver"),
 ("미 국채 &middot; 정책금리", "US Treasuries and policy rate",
  "미 재무부 일별 확정 고시 &middot; 뉴욕 연은 EFFR &middot; CBOT 연방기금 선물", "US Treasury, NY Fed EFFR, CBOT fed funds futures"),
 ("예탁금 &middot; 신용잔고 &middot; 외국인 월간 수급", "Deposits, margin loans, monthly foreign flow",
  "네이버 금융 &middot; 금융투자협회 &middot; 금융감독원 (언론 인용)", "Naver, KOFIA and the FSS via press"),
 ("간밤 뉴욕 &middot; 삼성전자 주주환원 &middot; 증권사 코멘트", "Overnight New York, the Samsung return, broker comments",
  "이데일리 &middot; 한국경제 &middot; 파이낸셜뉴스 &middot; 헤럴드경제 &middot; 뉴스1 등 기사 본문 24건",
  "24 article bodies from Edaily, Hankyung, FN News, Herald, News1 and others"),
 ("삼전닉스 비중 &middot; 레버리지 ETF", "Concentration and leveraged ETFs", "한국거래소 집계 (언론 인용)", "KRX data via press"),
 ("일정 &middot; 휴장일", "Calendar and holidays",
  "한국은행 금통위 일정 &middot; 연준 캘린더 &middot; 미 재무부 발표 &middot; 각 거래소 휴장일 공지",
  "Bank of Korea, Federal Reserve, US Treasury announcements and exchange holiday notices"),
]
srcrows = ['      <tr><th class="wrap">' + L(a, b) + '</th><td class="wrap">' + L(c, d) + '</td></tr>'
           for a, b, c, d in SRC]
sec("sources", "출처", "Sources",
    tbl("출처", "Sources", [TH("구분", "Category", "wrap"), TH("출처", "Source", "wrap")], srcrows, cls="data compact",
        foot_ko="<strong>이 판은 기사 본문 24건을 직접 읽고 썼습니다</strong> &mdash; 수집기가 <code>id=&quot;dic_area&quot;</code> 에서 "
          "전량 정상 추출했습니다. 시세와 보도가 어긋난 항목은 검증 노트 (d)&middot;(f) 에 적었습니다. "
          "WebFetch 직접 조회는 여전히 대부분 HTTP 403 입니다.",
        foot_en="<strong>This edition was written from 24 article bodies read directly</strong>, all extracted cleanly from "
          "<code>id=&quot;dic_area&quot;</code>. Where market data and reporting disagree, the difference is recorded in notes (d) "
          "and (f). Direct WebFetch still returns HTTP 403 in most cases."))


# ══════════════════════════════════════════════════════════════════
# 조립
# ══════════════════════════════════════════════════════════════════
head = io.open(SCR + "/_chrome_head.html", encoding="utf-8").read()
tail = io.open(SCR + "/_chrome_tail.html", encoding="utf-8").read()

head = re.sub(r"<title>.*?</title>",
              "<title>해외 증시 브리핑 (베타) · 2026년 8월 22일 (토) | 미래에셋증권 마포WM</title>",
              head, count=1, flags=re.S)

BYLINE_KO = "미래에셋증권 마포WM · 송재섭 · 2026년 8월 22일(토) " + HHMM + " KST 작성."
BYLINE_EN = ("Mirae Asset Securities, Mapo WM · Jaeseop Song · "
             "Compiled " + HHMM + " KST, Saturday 22 August 2026.")
DOT = r'(?:&middot;|·)'
_pk = r'미래에셋증권 마포WM\s*' + DOT + r'\s*송재섭\s*' + DOT + r'\s*[^<]*작성\.'
_pe = r'Mirae Asset Securities, Mapo WM\s*' + DOT + r'\s*Jaeseop Song\s*' + DOT + r'\s*Compiled[^<]*\.'
for _pat, _rep, _what in ((_pk, BYLINE_KO, "국문"), (_pe, BYLINE_EN, "영문")):
    _n = len(re.findall(_pat, tail))
    assert _n == 1, "꼬리말의 %s 작성일 줄을 %d 개 찾았다 — 1 개여야 한다" % (_what, _n)
    tail = re.sub(_pat, _rep, tail, count=1)

hero = ('<div class="hero">\n'
        '  <p class="hero-kicker">' + L("2026년 8월 22일(토)", "Saturday, 22 August 2026") + ' &middot; '
        + L("미래에셋증권 마포WM &middot; 해외 증시 브리핑", "Mirae Asset Securities, Mapo WM &middot; Global Market Briefing") + '</p>\n'
        '  <h1>' + L("지수는 두 종목의 안부일 뿐입니다", "The index is reporting on two stocks") + '</h1>\n'
        '  <p class="hero-lede">' + L(
          "<strong>이번 주 월가를 지배한 것은 경기가 아니라 금리였습니다.</strong> 미 재무부가 장기채 바이백을 두 배로 늘렸는데도 "
          "30년물은 " + n(ru["curve"]["ust30y"], 3) + "%, 10년물은 " + n(ru["curve"]["ust10y"], 3) + "% 로 올라섰고, "
          "<strong>S&amp;P·나스닥은 3주 연속 상승을 끝냈습니다.</strong> 21일 하루는 강한 서비스업 지표에 반등했지만 "
          "<strong>반도체는 또 빠졌습니다</strong>(SOX 주간 " + pct(I["sox"]["perf"]["w1"]) + "). "
          "<strong>국내는 더 극적입니다.</strong> 삼성전자가 최대 110조원 주주환원을 의결하자 코스피는 " + pct(KS["change_pct"]) +
          " 올랐는데 <strong>오른 종목은 " + n(ksb["advancing"], 0) + "개, 내린 종목은 " + n(ksb["declining"], 0) +
          "개</strong>였고 코스닥은 <strong>" + pct(KQ["change_pct"]) + "</strong> 였습니다. "
          "삼전닉스 두 종목이 <strong>코스피 시총의 50.93%</strong> 입니다 &mdash; <strong>지수를 보고 시장을 짐작하면 틀립니다.</strong>",
          "<strong>What ruled Wall Street this week was rates, not growth.</strong> Even after the Treasury doubled its long-bond "
          "buybacks, the 30-year rose to " + n(ru["curve"]["ust30y"], 3) + "% and the 10-year to " + n(ru["curve"]["ust10y"], 3) +
          "%, and <strong>the S&amp;P and NASDAQ ended three-week winning runs.</strong> The 21st rebounded on strong services data, "
          "but <strong>semiconductors fell again</strong> (the SOX " + pct(I["sox"]["perf"]["w1"]) + " on the week). "
          "<strong>Korea was starker.</strong> After Samsung Electronics approved a return of up to KRW 110tn the KOSPI rose " +
          pct(KS["change_pct"]) + " &mdash; while <strong>" + n(ksb["advancing"], 0) + " stocks rose and " +
          n(ksb["declining"], 0) + " fell</strong>, and the KOSDAQ dropped <strong>" + pct(KQ["change_pct"]) + "</strong>. Two names "
          "are <strong>50.93% of KOSPI market capitalisation</strong> &mdash; <strong>reading the market off the index will mislead "
          "you.</strong>") + '</p>\n'
        '  <p class="hero-meta"><span class="tone mixed">'
        + L("지수는 올랐고 시장은 내렸습니다", "The index rose; the market fell") + '</span> &nbsp; '
        + L("기준: 국내&middot;미국&middot;유럽&middot;아시아 모두 8월 21일(금) 마감 &middot; 환율&middot;원자재는 8월 22일 아침 &middot; "
            "시세 파일 " + D["generated_at_kst"][5:16] + " 수집 &middot; 작성 2026-08-22(토) " + HHMM +
            " KST &middot; <strong>주말 판 &mdash; 다음 국내 거래일은 8월 24일(월)</strong>",
            "Basis: Korea, the US, Europe and Asia all at their 21 August closes; FX and commodities as of the morning of 22 August "
            "&middot; data collected " + D["generated_at_kst"][5:16] + " &middot; compiled " + HHMM +
            " KST, Saturday 22 August 2026 &middot; <strong>weekend edition &mdash; the next Korean session is Monday 24 August</strong>")
        + '</p>\n'
        '  <p class="hint"><span class="hint-inline">' + L(
          "각 항목을 클릭하면 근거 수치와 배경, 원문 링크가 펼쳐집니다. 고객 전달용은 «요약 PDF», 브리핑 준비용은 «전체 PDF» 로 저장하십시오.",
          "Click any item to reveal the underlying figures, background and source links. Use «Summary PDF» for client hand-outs and "
          "«Full PDF» for your own preparation.") + '</span><span class="hint-pane">' + L(
          "각 항목을 클릭하면 근거 수치와 배경, 원문 링크가 오른쪽 패널에 표시됩니다.",
          "Click any item to show the underlying figures, background and source links in the panel on the right.") + '</span></p>\n'
        '</div>\n\n')


# ══════════════════════════════════════════════════════════════════
# 베타 — 세 층으로 나누고, 3층은 통째로 접는다
# ══════════════════════════════════════════════════════════════════
# 1층 판단 / 2층 본문 / 3층 근거. 3층(검증 노트·출처)이 지금 판의 12% 인데
# 「국내 증시 되짚기」보다 무겁다. 정직성을 지키는 장치라 없앨 수 없지만,
# 고객이 읽는 자리에 있을 이유도 없다 — 접어서 요약 PDF 에서 뺀다.
TIERS = [
    ("1", "오늘의 판단", "What to do today",
     "이것만 읽어도 통화가 됩니다", "Enough to make the call",
     ["keypoints", "talking"]),
    ("2", "왜 그런가", "Why",
     "그날의 축을 만든 절을 앞에 둡니다", "The sections that made the day",
     ["jobs", "rates", "korea", "us", "europe", "asia", "fx", "commodity",
      "issues", "broker", "reports", "views", "calendar", "risks", "wm"]),
    ("3", "근거", "Evidence",
     "쓰지 않은 값·어긋난 값·확보하지 못한 값. 요약본에서는 접힙니다",
     "Unused, disputed and unavailable figures. Folded in the summary PDF",
     ["verify", "sources"]),
]

def _tier_head(num, ko, en, sko, sen):
    return ('<div class="tier">\n'
            '  <span class="t-num">' + L("%s층" % num, "TIER %s" % num) + '</span>\n'
            '  <span class="t-name">' + L(ko, en) + '</span>\n'
            '  <span class="t-say">' + L(sko, sen) + '</span>\n</div>')

_by_id = {}
for _sec in S:
    _m = re.search(r'id="([^"]+)"', _sec)
    _by_id[_m.group(1)] = _sec
_placed, _out = set(), []
for _num, _ko, _en, _sko, _sen, _ids in TIERS:
    _got = [_by_id[i] for i in _ids if i in _by_id]
    if not _got:
        continue
    _placed.update(i for i in _ids if i in _by_id)
    _out.append(_tier_head(_num, _ko, _en, _sko, _sen))
    if _num == "3":
        # 3층은 통째로 접는다. summary 를 details 안에 두어야 요약 PDF 에서 닫힌다.
        _out.append('<details class="exp tier-3-body">\n  <summary>' + L(
            "근거 자료 펼치기 &mdash; 데이터 검증 노트와 출처",
            "Open the evidence &mdash; verification notes and sources")
            + '</summary>\n  <div class="exp-body">\n' + "\n\n".join(_got) + '\n  </div>\n</details>')
    else:
        _out.extend(_got)
_left = [i for i in _by_id if i not in _placed]
assert not _left, "층에 넣지 않은 절이 있다: %s" % _left
S = _out

TOC = [("keypoints", "한눈에 보는 핵심", "Key Takeaways"),
       ("us", "미국 증시 마감", "US Equities Close"),
       ("jobs", "금리와 유가", "Rates and Oil"),
       ("rates", "금리 &middot; 채권시장", "Rates and Bonds"),
       ("fx", "환율", "Foreign Exchange"),
       ("commodity", "원자재 &middot; 기타 지표", "Commodities"),
       ("europe", "유럽 증시", "European Equities"),
       ("asia", "아시아 증시", "Asian Equities"),
       ("korea", "국내 증시 되짚기", "Korea &mdash; Looking Back"),
       ("issues", "해외 시장 관심 이슈", "Issues to Watch"),
       ("reports", "증권사 리포트 요약", "Broker Notes"),
       ("views", "하우스 시각", "House View"),
       ("calendar", "일정 &middot; 휴장일", "Calendar"),
       ("risks", "리스크 점검", "Risk Check"),
       ("broker", "증권업 &middot; 미래에셋증권 동향", "Securities Industry"),
       ("wm", "WM 업계", "WM Industry"),
       ("talking", "고객 응대 포인트", "Talking Points"),
       ("verify", "데이터 검증 노트", "Verification Notes"),
       ("sources", "출처", "Sources")]
# 목차는 **층 차례대로** 다시 세운다. 절을 옮겨 놓고 목차를 손으로 맞추면
# 반드시 어긋난다 — 실제로 첫 빌드에서 절과 목차의 차례가 달랐다.
_TOC_BY_ID = {sid: (ko, en) for sid, ko, en in TOC}
_ORDER = [i for _n, _k, _e, _sk, _se, ids in TIERS for i in ids if i in _TOC_BY_ID]
assert len(_ORDER) == len(TOC), "층에 없는 목차 항목: %s" % (set(_TOC_BY_ID) - set(_ORDER))
TOC = [(sid, _TOC_BY_ID[sid][0], _TOC_BY_ID[sid][1]) for sid in _ORDER]
# S 는 이제 층 머리말과 접는 묶음까지 담고 있어 길이로 견줄 수 없다.
# 진짜 대조는 아래 renum 이 한다 — 만들어진 HTML 의 절 번호 개수와 목차 개수.
assert len(TOC) == len(_ORDER), "목차와 층 차례가 어긋났다"

toc = "\n".join('    <li><a href="#' + sid + '"><span class="sn">' + ("%02d" % (i + 1)) + '</span>' + L(ko, en) + '</a></li>'
                for i, (sid, ko, en) in enumerate(TOC))
nav = ('<div class="shell">\n\n<nav class="sidenav" aria-label="목차">\n'
       '  <p class="sidenav-label">' + L("목차", "Contents") + '</p>\n'
       '  <ul class="sidenav-toc">\n' + toc + '\n  </ul>\n'
       '  <p class="sidenav-label">' + L("지난 브리핑", "Archive") + '</p>\n'
       '  <ul class="sidenav-dates">\n'
       '    <li><a href="#" aria-current="page"><span class="d">08-22</span>'
       + L("해외 증시", "Global brief") + '</a></li>\n  </ul>\n</nav>\n\n')



# ══════════════════════════════════════════════════════════════════
# 베타 — 접는 기준을 「오늘의 축에 필요한가」로 바꾼다
# ══════════════════════════════════════════════════════════════════
# 정식판은 「추이 표를 접는다」였다. 그 결과 8/22 판은 요약 27쪽 / 전체 29쪽 —
# 두 쪽 차이였다. 표 25개 가운데 그날의 이야기에 실제로 쓰이는 것은 8~10개다.
#
# 오늘의 축은 ① 금리 ② 국내 두 종목이다. 그 축을 설명하는 표만 앞면에 두고
# 나머지는 접는다. **지우는 것이 아니라 접는 것**이라 전체 PDF 에는 다 있다.
FRONT_TABLES = (
    "미국 지수",            # ① 축 — 무슨 일이 있었나
    "미 국채 수익률 곡선",   # ① 축 — 이번 주를 지배한 것
    "국내 지수",            # ② 축
    "등락 종목 수",          # ② 축 — 지수와 시장이 갈린 자리
    "국내 특징주",           # ② 축
    "증권업 주가",           # 새 절의 본체
    "원화 환율",            # 고객이 늘 묻는다
    "일정",                 # 다음 거래일 준비
)

def _fold_rest(html):
    """앞면에 남길 표 말고는 모두 접는다. 표마다 캡션으로 가른다."""
    import re as _re
    kept = [0]; folded = [0]
    def one(m):
        blk = m.group(0)
        cap = _re.search(r"<caption>(.*?)</caption>", blk, _re.S)
        txt = _re.sub(r"<[^>]+>", "", cap.group(1)) if cap else ""
        if any(k in txt for k in FRONT_TABLES):
            kept[0] += 1
            return blk
        folded[0] += 1
        short = _re.sub(r"\s*&mdash;.*$", "", txt).strip() or "표"
        return ('<details class="exp">\n  <summary>' + short
                + ' &mdash; <span data-lang-ko>펼쳐 보기</span><span data-lang-en>open</span></summary>\n'
                '  <div class="exp-body">\n' + blk + '\n  </div>\n</details>')
    out = _re.sub(r'<div class="table-wrap">.*?</table>\s*</div>', one, html, flags=_re.S)
    return out, kept[0], folded[0]

# 3층은 이미 통째로 접혀 있으므로 건드리지 않는다. 1·2층에서만 접는다.
_head3 = S.index(next(x for x in S if 'class="tier"' in x and 'TIER 3' in x))
_pre, _post = S[:_head3], S[_head3:]
_pre_html = "\n\n".join(_pre)
_pre_html, _kept, _folded = _fold_rest(_pre_html)
S = [_pre_html] + _post
print("  표 앞면 %d개 · 접음 %d개" % (_kept, _folded))

body = "\n\n".join(S)
cnt = [0]
def renum(m):
    cnt[0] += 1
    return '<span class="sec-num">%02d</span>' % cnt[0]
body = re.sub(r'<span class="sec-num">\d+</span>', renum, body)
assert cnt[0] == len(TOC), "절 번호 %d 개 ≠ 목차 %d 개" % (cnt[0], len(TOC))

EXTRA_CSS = """
/* ══ 베타 ① 죽어 있던 오른쪽 패널을 걷어내고 본문을 넓힌다 ══
   8/8 이후 16판 동안 이 패널에 누를 수 있는 항목이 0개였다. 1,440px 화면에서
   340px 를 차지해 본문을 764px 로 눌러 왔다. 패널이 없던 8/6 판의 본문은
   1,136px 였다. */
@media (min-width:1400px){
  .page.wide{max-width:1320px}
  .page.wide .shell{grid-template-columns:208px minmax(0,1fr);gap:44px}
  .detailpane{display:none!important}
  .pane-mode .stat-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
  .hint-pane{display:none!important}
  .hint-inline{display:inline}
}
@media (min-width:1680px){
  .page.wide{max-width:1400px}
  .page.wide .shell{grid-template-columns:208px minmax(0,1fr);gap:48px}
  .pane-mode .stat-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
}

/* ══ 베타 ② 숫자 카드를 줄인다 ══
   390px 에서 카드 한 장이 243px 였다. 여덟 장이면 「한눈에」가 다섯 화면이다.
   껍데기에 `.stat-grid.eight` 같은 변종이 있어 `.stat-grid` 하나로는 못 이긴다
   — 같은 자리를 겨냥해 다시 쓴다. 뒤에 온다고 이기는 것이 아니다. */
.stat-grid, .stat-grid.eight, .stat-grid.six,
.pane-mode .stat-grid, .pane-mode .stat-grid.eight, .pane-mode .stat-grid.six{
  grid-template-columns:repeat(2,minmax(0,1fr))
}
@media (min-width:700px){
  .stat-grid, .stat-grid.eight, .stat-grid.six,
  .pane-mode .stat-grid, .pane-mode .stat-grid.eight, .pane-mode .stat-grid.six{
    grid-template-columns:repeat(4,minmax(0,1fr))
  }
}
@media (max-width:560px){
  .stat-grid, .stat-grid.eight, .stat-grid.six{grid-template-columns:repeat(2,minmax(0,1fr))}
}
.stat-grid > .stat:nth-child(5):last-child,
.pane-mode .stat-grid > .stat:nth-child(5):last-child{grid-column:auto}
.stat{padding:15px 17px}
.stat-value{font-size:29px;line-height:1.05}
.stat-value.sm{font-size:23px}
.stat-label{font-size:13px;margin-bottom:5px}
.stat-chg{font-size:15px;margin:3px 0 5px}
.stat-note{font-size:12.5px;line-height:1.45}
@media (max-width:420px){
  .stat{padding:11px 12px}
  .stat-value{font-size:23px}
  .stat-value.sm{font-size:19px}
  .stat-label{font-size:12px}
  .stat-note{font-size:11.5px}
}

/* ══ 베타 ③ 층 표지 ══ */
.tier{margin:56px 0 8px;padding:0 0 10px;border-bottom:2px solid var(--primary)}
.tier:first-child{margin-top:0}
.tier .t-num{font-family:var(--font-num,inherit);font-size:13px;font-weight:700;
  letter-spacing:1px;color:var(--primary);display:block;margin-bottom:4px}
.tier .t-name{font-size:23px;font-weight:700;color:var(--ink);display:block;line-height:1.25}
.tier .t-say{font-size:15px;color:var(--muted);display:block;margin-top:5px;line-height:1.5}
@media (max-width:520px){ .tier .t-name{font-size:19px} .tier .t-say{font-size:14px} }

/* 3층(근거)은 화면에서 접어 둔다 — 요약 PDF 에서도 빠진다 */
.tier-3-body{margin-top:8px}

/* ══ 베타 ④ IB 한 줄 목록 ══ */
.ibline{border:1px solid var(--hairline);border-left:3px solid var(--primary);
  border-radius:0 2px 2px 0;padding:14px 18px;margin:0 0 19px}
.ibline > p.h{margin:0 0 10px;font-size:14px;font-weight:700;letter-spacing:.4px;
  color:var(--muted);text-transform:none}
.ibline ul{margin:0;padding:0;list-style:none}
.ibline li{padding:7px 0;border-top:1px solid var(--hairline-soft);
  font-size:15.5px;line-height:1.55;display:flex;gap:11px;align-items:baseline}
.ibline li:first-of-type{border-top:0}
.ibline .who{flex:0 0 auto;font-weight:700;color:var(--primary);min-width:86px}
.ibline .sq{min-width:0;overflow-wrap:anywhere}
@media (max-width:520px){ .ibline li{display:block} .ibline .who{display:block;margin-bottom:2px} }

@media (min-width:861px) and (max-width:1180px),
       (min-width:1400px) and (max-width:1680px){
  table.data .perf{display:none}
  table.data .perfline{display:block;margin-top:4px;font-size:12px;font-weight:400;
    line-height:1.5;color:var(--muted);white-space:normal;word-break:keep-all;
    overflow-wrap:anywhere;max-width:330px}
  table.data .perfline .p{white-space:nowrap}
  table.data .perfline .k{opacity:.72;margin-right:1px}
  table.data .perfline .up{color:var(--up)}
  table.data .perfline .down{color:var(--down)}
  table.data .perfline .na{opacity:.45}
  table.data .perfline i{font-style:normal;opacity:.35;padding:0 4px}
}
@media (max-width:820px), (min-width:1180px) and (max-width:1400px){
  table.data .opt{display:none}
}
.soft-card p,.callout p,.view p,p.cap{overflow-wrap:anywhere}
@media (max-width:360px){
  table.data.compact th,table.data.compact td{padding:6px 5px}
  table.data .vf{font-size:9px;padding:1px 3px;letter-spacing:0}
  table.data.compact{font-size:11.5px}
}
"""

doc = head + hero + nav + "<main>\n\n" + body + "\n\n" + tail
doc = doc.replace("\n</style>", EXTRA_CSS + "\n</style>", 1)
io.open(OUT, "w", encoding="utf-8").write(doc)
print("만듦: %s (%d자, 절 %d개, 상세 %d개)"
      % (OUT, len(doc), cnt[0], doc.count('<details class="exp"')))
