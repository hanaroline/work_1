"""상장일 원천 정찰 — 러너에서 어느 곳이 열리고 상장일을 주는지 본다(일회성).

KIS 상품기본조회는 저장소 키가 모의투자 앱키라 못 쓴다(EGW02006/EGW02004).
표본 2곳(삼성전자 005930, 한미반도체 042700)으로 원천마다 상태와 '상장' 주변 글을 남긴다.
"""
import json, re, sys, urllib.parse, urllib.request

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
CODES = ['005930', '042700']


def get(url, ref=None, data=None, enc='utf-8'):
    h = {'User-Agent': UA, 'Accept': '*/*'}
    if ref:
        h['Referer'] = ref
    if data is not None:
        h['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        data = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=data, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode(enc, 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:300].decode('utf-8', 'replace')
    except Exception as e:                                       # noqa: BLE001
        return 'ERR', str(e)[:200]


def around(text, pats, width=90):
    out = []
    for p in pats:
        for m in list(re.finditer(p, text))[:3]:
            s = text[max(0, m.start() - width):m.end() + width]
            out.append(re.sub(r'\s+', ' ', s))
    return out


SRC = [
    ('KIND 상장법인목록', lambda c: get('https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13&marketType=', enc='euc-kr'), ['상장일', r'(?s)042700.{0,500}']),
    ('Daum 시세 API', lambda c: get('https://finance.daum.net/api/quotes/A%s?summary=false&changeStatistics=true' % c, ref='https://finance.daum.net/quotes/A%s' % c), [r'[Ll]isting[A-Za-z]*"\s*:\s*"[^"]*"', r'"[a-zA-Z]*[Dd]ate"\s*:\s*"[^"]*"']),
    ('Daum 기업개요', lambda c: get('https://finance.daum.net/api/quote/A%s/company' % c, ref='https://finance.daum.net/quotes/A%s' % c), [r'[Ll]isting[A-Za-z]*"\s*:\s*"[^"]*"', '상장']),
    ('FnGuide 스냅샷', lambda c: get('https://comp.fnguide.com/SVO2/ASP/SVD_Main.asp?pGB=1&gicode=A%s' % c), ['상장일', '상장']),
    ('FnGuide 기업개요', lambda c: get('https://comp.fnguide.com/SVO2/ASP/SVD_Corp.asp?pGB=1&gicode=A%s' % c), ['상장일', '상장']),
    ('WiseReport 기업개요', lambda c: get('https://navercomp.wisereport.co.kr/v2/company/c1020001.aspx?cmp_cd=%s' % c), ['상장일', '상장']),
    ('Naver integration', lambda c: get('https://m.stock.naver.com/api/stock/%s/integration' % c, ref='https://m.stock.naver.com/'), ['상장', r'[Ll]ist[A-Za-z]*"\s*:\s*"[^"]*"']),
    ('KRX 정보데이터 01901', lambda c: get('http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd', ref='http://data.krx.co.kr/', data={'bld': 'dbms/MDC/STAT/standard/MDCSTAT01901', 'mktId': 'ALL', 'share': '1', 'csvxls_isNo': 'false'}), ['%s[^}]{0,400}']),
]


def main():
    lines = ['# 상장일 원천 정찰', '']
    for name, fn, pats in SRC:
        for c in CODES[: (1 if name.startswith(('KIND', 'KRX')) else 2)]:
            st, body = fn(c)
            hits = around(body, [p.replace('%s', c) for p in pats]) if st == 200 else []
            lines.append('## %s · %s → %s (%d자)' % (name, c, st, len(body)))
            lines += ['- `%s`' % h.replace('`', "'") for h in hits[:6]] or ['- 앞부분: `%s`' % re.sub(r'\s+', ' ', body[:240]).replace('`', "'")]
            lines.append('')
    text = '\n'.join(lines)
    print(text)
    with open('data/semi-listed-probe.md', 'w', encoding='utf-8') as f:
        f.write(text + '\n')


if __name__ == '__main__':
    sys.exit(main())
