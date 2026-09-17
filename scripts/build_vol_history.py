# -*- coding: utf-8 -*-
"""변동성 모델이 먹을 이력을 한 파일로 모은다 — data/volatility/history.json

    python3 scripts/build_vol_history.py [--out data/volatility/history.json]

**왜 따로 모으는가.** data/market/<날짜>.json 은 그날의 스냅숏이라 지수 일봉이
하루씩만 들어 있다. 마흔 판을 다 훑어도 마흔 세션이고, 그 정도로는 볼린저(20)와
MACD(26)를 겹쳐 놓을 자리가 없다 — 백테스트는 더 말할 것도 없다.

**어디서 깊이를 가져오는가.** `kr100-data` 가지에 시가총액 상위 100 종목의
**2년치 일봉(484 세션)** 이 종목마다 들어 있다. 그것을 시가총액으로 가중해 지수
하나로 묶으면 코스피를 대신할 계열이 된다. 대신하는 것이지 코스피가 아니므로,
스냅숏에 남은 **실제 코스피 종가와 겹쳐 보고 그 결과를 파일에 적어 둔다**
(`index.validation`). 상관이 무너지면 대신할 자격을 잃은 것이니 거기서 멈춘다.

**수급은 따로다.** 외국인·기관 순매수, 고객예탁금, 신용잔고, 프로그램 매매는
스냅숏에서만 나오고 쉰 날 남짓뿐이다. 가격 계열과 길이가 다르다 — 섞어 한 계열인
척하지 않고 `flows` 로 갈라 담고, 쓰는 쪽에서 겹치는 구간만 쓴다.

원천 셋.
  가. kr100-data 가지의 종목 일봉      → 지수 프록시 (2년)
  나. data/market/<날짜>.json 스냅숏   → VIX·환율·S&P, 수급, 예탁금 (두 달 남짓)
  다. 스냅숏의 index_daily·indices     → 실제 코스피 종가 (검증·눈금 맞추기)

이 저장소의 파이썬은 표준 라이브러리만 쓴다.
"""
import os, sys, json, glob, math, subprocess, datetime, statistics as st

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHART_REF = 'origin/kr100-data'
CHART_DIR = 'data/kr100/chart'
KST = datetime.timezone(datetime.timedelta(hours=9))

# 프록시를 세우는 최소 조건. 이보다 적은 종목으로 셈한 날은 지수로 치지 않는다 —
# 휴장 직전·직후에 몇 종목만 값이 들어오는 날이 있어 그날만 지수가 튄다.
MIN_MEMBERS = 80


def log(*a):
    print(*a, file=sys.stderr)


# ─────────────────────────────────────────────────────────────────────
# 가. 종목 일봉 — kr100-data 가지
# ─────────────────────────────────────────────────────────────────────

def _git(*args):
    return subprocess.run(['git', '-C', ROOT] + list(args),
                          capture_output=True, text=True)


def load_charts(ref=CHART_REF, local_dir=None):
    """종목 일봉을 {심볼: {날짜: (o,h,l,c,v)}} 로 읽는다.

    가지에서 바로 읽는다(`git show`). 받아 두지 않았으면 한 번 받아 본다 —
    러너에서는 checkout 이 기본 가지만 가져오므로 여기서 채운다.
    """
    if local_dir:
        files = sorted(glob.glob(os.path.join(local_dir, '*.json')))
        blobs = [(os.path.basename(f), open(f, encoding='utf-8').read()) for f in files]
    else:
        ls = _git('ls-tree', '-r', '--name-only', ref, CHART_DIR)
        if ls.returncode != 0:
            log('· %s 가 없어 받아 온다' % ref)
            br = ref.split('/', 1)[-1]
            # **refspec 을 손으로 적는다.** `git fetch origin <가지>` 만 하면
            # FETCH_HEAD 만 서고 `origin/<가지>` 는 안 생길 수 있다 — 원격의
            # fetch refspec 이 좁을 때 그렇고, actions/checkout 이 만드는 작업본이
            # 바로 그 경우다(+refs/heads/main:refs/remotes/origin/main 하나뿐).
            # 이 저장소에서는 refspec 이 넓어 손으로 돌릴 때는 통과하므로,
            # 러너에서 첫 실행이 죽고 나서야 드러난다.
            fe = _git('fetch', '--depth', '1', 'origin',
                      '+refs/heads/%s:refs/remotes/origin/%s' % (br, br))
            if fe.returncode != 0:
                raise SystemExit('kr100-data 가지를 받지 못했습니다:\n' + fe.stderr)
            ls = _git('ls-tree', '-r', '--name-only', ref, CHART_DIR)
            if ls.returncode != 0:
                raise SystemExit('kr100-data 가지에서 일봉을 찾지 못했습니다')
        names = [n for n in ls.stdout.split('\n') if n.endswith('.json')]
        blobs = []
        for n in names:
            sh = _git('show', '%s:%s' % (ref, n))
            if sh.returncode == 0:
                blobs.append((os.path.basename(n), sh.stdout))

    out = {}
    for name, text in blobs:
        try:
            d = json.loads(text)
        except ValueError:
            log('! %s 파싱 실패 — 건너뜀' % name)
            continue
        s = d.get('daily') or {}
        if not s.get('d'):
            continue
        bars = {}
        for i, dt in enumerate(s['d']):
            c = s['c'][i]
            if c is None:
                continue                      # 휴장·정지일은 빈 봉으로 온다
            o = s['o'][i] if s['o'][i] is not None else c
            h = s['h'][i] if s['h'][i] is not None else c
            l = s['l'][i] if s['l'][i] is not None else c
            bars[dt] = (o, h, l, c, s['v'][i] or 0)
        if bars:
            out[d.get('symbol') or name.replace('.json', '')] = bars
    return out


def load_caps(ref=CHART_REF, local_file=None):
    """시가총액 — 가중치의 바탕. latest.json 의 quote.cap 을 쓴다."""
    if local_file:
        text = open(local_file, encoding='utf-8').read()
    else:
        sh = _git('show', '%s:data/kr100/latest.json' % ref)
        if sh.returncode != 0:
            raise SystemExit('kr100-data 가지에 latest.json 이 없습니다')
        text = sh.stdout
    d = json.loads(text)
    caps, names = {}, {}
    for sym, v in (d.get('companies') or {}).items():
        q = v.get('quote') or {}
        if q.get('cap'):
            caps[sym] = float(q['cap'])
        nm = (v.get('profile') or {}).get('nameKo') or v.get('name') or ''
        if nm:
            names[sym] = nm
    return caps, names, d.get('fetchedAt')


def build_proxy(charts, caps, members):
    """시가총액 가중 지수를 세운다.

    **주식수를 고정해 셈한다.** 가중치를 날마다 그날 시총으로 다시 주면 그건
    지수가 아니라 날마다 갈아 끼운 바구니가 된다 — 오른 종목의 몫이 자동으로
    커져 지수가 실제보다 덜 떨어진다. 그래서 마지막 날 시총을 그날 종가로 나눠
    **주식수**를 구하고, 그 주식수를 이력 내내 고정한다. 실제 지수가 하는 셈과
    같다(유동주식 조정은 하지 않는다 — 원자료에 없다).
    """
    dates = sorted(set().union(*[set(charts[s]) for s in members]))
    last = dates[-1]
    shares = {}
    for s in members:
        c = charts[s].get(last, (None,) * 4)[3]
        if c and caps.get(s):
            shares[s] = caps[s] / c
    if not shares:
        raise SystemExit('가중치를 세울 수 없습니다 — 마지막 날 종가나 시총이 없습니다')

    bars = []
    for dt in dates:
        o = h = l = c = v = 0.0
        n = 0
        for s, sh in shares.items():
            r = charts[s].get(dt)
            if not r:
                continue
            o += r[0] * sh; h += r[1] * sh; l += r[2] * sh; c += r[3] * sh
            v += r[4] * r[3]              # 거래대금으로 더한다 — 주식수는 종목마다 뜻이 다르다
            n += 1
        if n >= MIN_MEMBERS:
            bars.append({'d': dt, 'o': o, 'h': h, 'l': l, 'c': c, 'value': v, 'n': n})
    return bars, shares


# ─────────────────────────────────────────────────────────────────────
# 나·다. 스냅숏 — 보조지수, 수급, 실제 코스피 종가
# ─────────────────────────────────────────────────────────────────────

AUX = ['vix', 'usdkrw', 'sp500', 'move', 'ust10y', 'dxy']


def load_snapshots(pattern='data/market/2*.json'):
    files = sorted(glob.glob(os.path.join(ROOT, pattern)))
    aux = {k: {} for k in AUX}
    real = {}
    investors, money, program, breadth = {}, {}, {}, {}

    for f in files:
        try:
            d = json.load(open(f, encoding='utf-8'))
        except ValueError:
            log('! %s 파싱 실패 — 건너뜀' % os.path.basename(f))
            continue

        I = d.get('indices') or {}
        for k in AUX:
            v = I.get(k)
            if v and v.get('date') and v.get('close') is not None:
                aux[k][v['date']] = {'d': v['date'], 'c': v['close'],
                                     'h': v.get('high'), 'l': v.get('low')}

        # 실제 코스피 종가 — 두 자리에서 나온다. 일별 계열(index_daily)이 더 길고,
        # indices 쪽은 야후라 값이 조금 다를 수 있으므로 **일별 계열을 먼저 믿는다**.
        k = I.get('kospi')
        if k and k.get('date') and k.get('close') is not None:
            real.setdefault(k['date'], {'d': k['date'], 'c': k['close'], 'src': 'yahoo'})
        for s in ((d.get('index_daily') or {}).get('kospi') or {}).get('series', []):
            if s.get('date') and s.get('close') is not None:
                real[s['date']] = {'d': s['date'], 'c': s['close'], 'src': 'naver'}

        for r in d.get('investors_kospi') or []:
            dt = _iso_ymd(r.get('date'))
            if dt:
                investors[dt] = {'d': dt, 'retail': r.get('retail'),
                                 'foreign': r.get('foreign'), 'institution': r.get('institution')}

        for r in ((d.get('money_flow') or {}).get('series') or []):
            if r.get('date'):
                money[r['date']] = {'d': r['date'], 'deposit': r.get('deposit'),
                                    'credit': r.get('credit_balance'),
                                    'fund_equity': r.get('fund_equity')}

        mi = ((d.get('market_internals') or {}).get('kospi') or {})
        bd = mi.get('bizdate')
        if bd and len(bd) == 8:
            dt = '%s-%s-%s' % (bd[:4], bd[4:6], bd[6:])
            pt = mi.get('program_trading') or {}
            if pt:
                program[dt] = {'d': dt, 'arb': pt.get('arb'),
                               'non_arb': pt.get('non_arb'), 'total': pt.get('total')}
            br = mi.get('breadth') or {}
            if br:
                breadth[dt] = {'d': dt, 'adv': br.get('advancing'),
                               'dec': br.get('declining'), 'unch': br.get('unchanged')}

    srt = lambda m: [m[k] for k in sorted(m)]
    return {
        'aux': {k: srt(v) for k, v in aux.items() if v},
        'real_kospi': srt(real),
        'flows': {'investors': srt(investors), 'money': srt(money),
                  'program': srt(program), 'breadth': srt(breadth)},
        'snapshots': len(files),
    }


def _iso_ymd(s):
    """'26.09.17' · '2026-09-17' 을 ISO 로 맞춘다."""
    if not s:
        return None
    s = s.strip()
    if len(s) == 10 and s[4] == '-':
        return s
    p = s.split('.')
    if len(p) == 3 and len(p[0]) == 2:
        return '20%s-%s-%s' % (p[0], p[1].zfill(2), p[2].zfill(2))
    return None


# ─────────────────────────────────────────────────────────────────────
# 검증 — 프록시가 코스피를 대신할 자격이 있는가
# ─────────────────────────────────────────────────────────────────────

def validate(bars, real):
    """겹치는 날의 **일간수익률**을 견준다.

    수준(level)이 아니라 수익률을 본다 — 프록시는 눈금이 달라 수준은 애초에
    다르고, 우리가 쓰는 지표는 모두 수익률·변동폭에서 나오기 때문이다.
    """
    P = {b['d']: b['c'] for b in bars}
    R = {r['d']: r['c'] for r in real}
    ov = sorted(set(P) & set(R))
    out = {'overlap_sessions': len(ov),
           'from': ov[0] if ov else None, 'to': ov[-1] if ov else None}
    pr, pi = [], []
    for a, b in zip(ov, ov[1:]):
        pr.append(R[b] / R[a] - 1)
        pi.append(P[b] / P[a] - 1)
    out['return_pairs'] = len(pr)
    if len(pr) >= 10:
        mr, mi = st.mean(pr), st.mean(pi)
        sr, si = st.pstdev(pr), st.pstdev(pi)
        cov = sum((x - mr) * (y - mi) for x, y in zip(pr, pi)) / len(pr)
        out['corr_daily_return'] = round(cov / (sr * si), 4) if sr and si else None
        out['tracking_error_pct'] = round(st.pstdev([x - y for x, y in zip(pr, pi)]) * 100, 3)
        out['proxy_ann_vol_pct'] = round(si * math.sqrt(252) * 100, 1)
        out['real_ann_vol_pct'] = round(sr * math.sqrt(252) * 100, 1)
        out['verdict'] = ('대신할 수 있음' if (out['corr_daily_return'] or 0) >= 0.97
                          else '상관이 낮음 — 프록시로 쓰지 말 것')
    else:
        out['verdict'] = '겹치는 날이 열흘도 안 됨 — 검증 못 함'
    return out


def rescale(bars, real):
    """눈금을 실제 코스피에 맞춘다 — 화면에 찍히는 값이 지수 포인트로 읽히도록.

    겹치는 날의 비(프록시/실제)의 **중앙값**을 제수로 쓴다. 평균이 아니라
    중앙값인 것은 한 날의 어긋남이 눈금 전체를 밀지 않게 하려는 것이다.
    수익률은 제수로 나눠도 그대로이므로 지표 값은 하나도 바뀌지 않는다.
    """
    P = {b['d']: b['c'] for b in bars}
    R = {r['d']: r['c'] for r in real}
    ov = [d for d in sorted(set(P) & set(R)) if R[d]]
    if len(ov) < 5:
        return 1.0
    return st.median([P[d] / R[d] for d in ov])


# ─────────────────────────────────────────────────────────────────────

def main(argv):
    out_path = 'data/volatility/history.json'
    charts_dir = caps_file = None
    for i, a in enumerate(argv):
        if a == '--out':
            out_path = argv[i + 1]
        elif a == '--charts':
            charts_dir = argv[i + 1]
        elif a == '--caps':
            caps_file = argv[i + 1]

    log('· 종목 일봉을 읽는다')
    charts = load_charts(local_dir=charts_dir)
    caps, names, fetched = load_caps(local_file=caps_file)
    log('  종목 %d, 시총 %d' % (len(charts), len(caps)))

    # **코스피 프록시이므로 코스피 종목만 넣는다.** 받아 온 목록에는 코스닥
    # 여섯이 섞여 있다. 넣어도 상관은 거의 그대로지만(둘 다 재어 남긴다),
    # 코스피를 대신할 계열에 코스닥을 섞을 까닭이 없다.
    ks = sorted(s for s in charts if s.endswith('.KS') and s in caps)
    kq = sorted(s for s in charts if s.endswith('.KQ') and s in caps)
    log('  코스피 %d · 코스닥 %d(제외)' % (len(ks), len(kq)))

    snap = load_snapshots()
    log('· 스냅숏 %d 판, 실제 코스피 종가 %d 일' % (snap['snapshots'], len(snap['real_kospi'])))

    bars, shares = build_proxy(charts, caps, ks)
    val = validate(bars, snap['real_kospi'])
    val['members'] = len(shares)
    val['excluded_kosdaq'] = len(kq)
    if kq:
        alt, _ = build_proxy(charts, caps, ks + kq)
        av = validate(alt, snap['real_kospi'])
        val['with_kosdaq_corr'] = av.get('corr_daily_return')

    div = rescale(bars, snap['real_kospi'])
    if div and div != 1.0:
        for b in bars:
            for k in ('o', 'h', 'l', 'c'):
                b[k] = round(b[k] / div, 2)
    log('· 프록시 %d 세션 (%s ~ %s), 상관 %s, 추적오차 %s%%'
        % (len(bars), bars[0]['d'], bars[-1]['d'],
           val.get('corr_daily_return'), val.get('tracking_error_pct')))

    now = datetime.datetime.now(KST)
    doc = {
        'generated_at_kst': now.strftime('%Y-%m-%d %H:%M:%S'),
        'generated_at_utc': now.astimezone(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
        'index': {
            'name': '코스피 프록시',
            'basis': '시가총액 상위 100 가운데 코스피 %d 종목을 시총 가중. '
                     '주식수는 마지막 날 시총÷종가로 구해 이력 내내 고정한다.' % len(shares),
            'source_branch': 'kr100-data (%s)' % (fetched or '수집시각 미상'),
            'divisor': round(div, 6),
            'divisor_note': '겹치는 날의 프록시÷실제 코스피 중앙값. 수준만 맞추고 수익률은 건드리지 않는다.',
            'validation': val,
            'bars': bars,
        },
        'real_kospi': snap['real_kospi'],
        'aux': snap['aux'],
        'flows': snap['flows'],
        'coverage': {
            'index_sessions': len(bars),
            'index_from': bars[0]['d'], 'index_to': bars[-1]['d'],
            'real_kospi_sessions': len(snap['real_kospi']),
            'flows': {k: {'n': len(v), 'from': v[0]['d'] if v else None,
                          'to': v[-1]['d'] if v else None}
                      for k, v in snap['flows'].items()},
            'aux': {k: {'n': len(v), 'from': v[0]['d'] if v else None,
                        'to': v[-1]['d'] if v else None}
                    for k, v in snap['aux'].items()},
            'note': '가격 계열은 2년, 수급 계열은 스냅숏이 쌓인 만큼뿐이다. '
                    '길이가 다르므로 네 축을 모두 쓰는 셈은 겹치는 구간에서만 성립한다.',
        },
    }

    path = os.path.join(ROOT, out_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
    log('· %s (%.0f KB)' % (out_path, os.path.getsize(path) / 1024))

    if val.get('corr_daily_return') is not None and val['corr_daily_return'] < 0.97:
        log('::error::프록시 상관이 %.4f 로 낮습니다 — 지수로 쓰지 마십시오'
            % val['corr_daily_return'])
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
