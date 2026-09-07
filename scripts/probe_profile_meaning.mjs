/**
 * 투자자성향 5유형의 사내 설명문을 회사 홈페이지에서 찾는다.
 *
 * 「투자자성향 진단 결과 설명 (투자자성향 + 성향의 의미)」 은 미스터리쇼핑 배점
 * 항목이고 「성향명만 말하면 미인정」 이다. 그런데 담당자가 준 위험도 분류표
 * (2025.11.24)에는 등급 대응만 있고 설명문이 없다. 그래서 성장추구형·위험중립형·
 * 안정추구형·안정형 넷만 채워 두고 성장형은 비워 두었다 — 지어내면 창구가 회사가
 * 쓰지 않는 문장을 읽는다.
 *
 * securities.miraeasset.com 은 이 PC 에서 막혀 있어 러너에서 받아 본다. 어느 화면에
 * 있는지 모르므로 후보를 여러 개 훑고, 다섯 유형 이름이 함께 나오는 곳의 본문을
 * 그대로 찍는다. 값을 만들어내지 않는다 — 못 찾으면 못 찾았다고 적는다.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const PAGES = [
  ['위험도 분류표', 'https://securities.miraeasset.com/hku/hku4028/p01.do'],
  ['투자자정보확인서 등록/수정', 'https://securities.miraeasset.com/hku/hku4028/c03.do?body=Y&pop=Y'],
  ['투자자정보확인서', 'https://securities.miraeasset.com/hku/hku4028/c01.do'],
  ['투자권유시행세칙', 'https://securities.miraeasset.com/hki/hki3072/n02.do'],
  ['고객유의사항 안내', 'https://securities.miraeasset.com/hki/hki3072/n01.do'],
  ['금융소비자보호', 'https://securities.miraeasset.com/hki/hki3071/n01.do'],
  /* 시행세칙에 이름은 있으나 설명문은 없었다 — 준칙·표준투자권유준칙 쪽도 본다 */
  ['투자권유준칙', 'https://securities.miraeasset.com/hki/hki3072/n03.do'],
  ['금융소비자보호 내부통제', 'https://securities.miraeasset.com/hki/hki3071/n02.do'],
  /* 협회 표준투자권유준칙 — 회사 서식이 이것을 따른다 */
  ['금융투자협회 표준투자권유준칙 안내', 'https://www.kofia.or.kr/index.do']
];

const TYPES = ['성장형', '성장추구형', '위험중립형', '안정추구형', '안정형'];

/**
 * 회사 페이지는 euc-kr 이다 (Content-Type: text/html;charset=euc-kr).
 * Node 의 res.text() 는 charset 을 보지 않고 늘 UTF-8 로 푼다. 그래서 첫 판은
 * 여섯 화면이 모두 HTTP 200 인데 유형 이름이 0/5 로 나왔다 — 한글이 깨진 것이다.
 * 바이트로 받아 헤더의 charset 으로 푼다.
 */
async function body(res) {
  const ct = res.headers.get('content-type') || '';
  const m = /charset=([\w-]+)/i.exec(ct);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  const buf = new Uint8Array(await res.arrayBuffer());
  try {
    return new TextDecoder(cs).decode(buf);
  } catch (e) {
    console.log('   ' + cs + ' 를 풀 수 없어 UTF-8 로 읽습니다 — ' + e.message);
    return new TextDecoder('utf-8').decode(buf);
  }
}

/** 태그를 떼고 줄을 정리한다 — 표 칸이 줄로 떨어지게 둔다 */
function text(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(?:br|\/p|\/div|\/td|\/th|\/tr|\/li|\/h\d)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .split('\n').map((l) => l.replace(/[ \t ]+/g, ' ').trim()).filter(Boolean)
    .join('\n');
}

for (const [name, url] of PAGES) {
  console.log('\n══ ' + name + '\n   ' + url);
  let res;
  try {
    res = await fetch(url, {
      headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' },
      signal: AbortSignal.timeout(30000)
    });
  } catch (e) {
    console.log('   받기 실패 — ' + e.constructor.name + ' ' + e.message);
    continue;
  }
  console.log('   HTTP ' + res.status + ' · ' + (res.headers.get('content-type') || ''));
  if (!res.ok) continue;

  const t = text(await body(res));
  const hit = TYPES.filter((x) => t.includes(x));
  console.log('   유형 이름 ' + hit.length + '/5 등장' + (hit.length ? ' — ' + hit.join(', ') : ''));
  if (hit.length < 3) {
    /* 어느 화면인지는 알 수 있게 첫 줄 몇 개를 찍는다 — 껍데기만 온 것인지 가른다 */
    console.log('   본문 ' + t.length + '자 · 머리 : ' + t.split('\n').slice(0, 3).join(' / ').slice(0, 200));
    continue;
  }

  const lines = t.split('\n');

  /*
   * 이미 가진 네 문장은 「… 고객 유형입니다」·「… 타입입니다」 로 끝난다. 그 어미가
   * 이 화면에 있는지가 갈림길이다 — 있으면 설명문이 실린 화면이고, 없으면 이름과
   * 등급 대응만 있는 화면이다(그러면 확인서 서식에서 받아야 한다).
   */
  const ENDS = /(?:고객\s*유형입니다|타입입니다)/;
  const desc = lines.filter((l) => ENDS.test(l));
  console.log('   설명문 꼴의 줄 ' + desc.length + '건');
  desc.slice(0, 12).forEach((l) => console.log('   ★ ' + l.slice(0, 400)));

  /* 별지·별표 서식으로 가는 길이 있는지 — 설명문은 확인서 서식에 있을 수 있다 */
  const forms = lines.filter((l) => /별지|별표|서식|확인서/.test(l) && l.length < 120);
  if (forms.length) {
    console.log('   서식 관련 줄 ' + forms.length + '건 (앞 8건)');
    forms.slice(0, 8).forEach((l) => console.log('   · ' + l.slice(0, 160)));
  }

  /* 유형 이름이 나오는 줄과 그 뒤 몇 줄 — 설명문이 옆 칸에 있으면 여기서 보인다 */
  for (let i = 0; i < lines.length; i++) {
    if (!TYPES.some((x) => lines[i].includes(x))) continue;
    console.log('   ┌ ' + (i + 1) + ': ' + lines[i].slice(0, 300));
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      console.log('   │   ' + lines[j].slice(0, 300));
    }
  }
}
