/**
 * '?' 설명 상자.
 *
 * 이 스펙이 생긴 이유: 상담 화면 갈무리가 올라왔는데 설명이 서넛 겹쳐 떠 있어
 * 아래 것이 위 것에 덮여 **둘 다 읽을 수 없었다.** 설명마다 제 상태를 들고
 * 있어서 누르는 대로 쌓였고, 바깥을 눌러도 닫히지 않았다. 게다가 왼쪽 입력 칸은
 * 제 높이만큼 따로 구르는 칸이라 오른쪽 열의 '?' 를 누르면 설명이 칸 밖으로
 * 나가 잘리고 가로 스크롤바가 생겼다.
 *
 * 그래서 (1) 열린 설명은 언제나 하나, (2) 바깥·Esc·× 로 닫힘, (3) 어느 '?' 를
 * 눌러도 상자가 제 테두리 안에 머문다 - 이 셋을 지킨다.
 */
const { openApp, fillCase, button } = require('./helpers');

/** 화면에 보이는 '?' 단추 (인쇄용 숨은 것은 제외) */
const HELP_BTN = 'button[aria-label$=" 설명"]';
/** 펼쳐진 설명 상자 */
const HELP_POP = '[role="note"][aria-label$=" 설명 내용"]';

/** 지금 펼쳐져 있는 설명의 개수 */
const openCount = (page) => page.locator(HELP_POP).count();

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // 계좌 카드 안의 '?' 까지 나오도록 상담 한 건을 채운다
    await fillCase(page, {
      name: '설명', birth: '650115', system: 'DC', joinDate: '2007-11-19',
      retireDate: '2026-06-30', amount: 250000000, deferredTax: 15000000,
      accounts: [
        { kind: 'pension', name: '미래에셋', join: '2013-07-24', balance: 23232950 },
        { kind: 'irp', name: '미래에셋', join: '2010-12-27', balance: 20000000 }
      ]
    });
    await page.waitForTimeout(500);

    const helps = page.locator(HELP_BTN + ':visible');
    const n = await helps.count();
    // 루프가 헛돌지 않는지 먼저 본다 - 0개를 도는 검사도 '통과' 한다
    t.ok(n >= 10, "'?' 단추를 충분히 찾았다 - " + n + '개');
    t.is(await openCount(page), 0, '처음에는 펼쳐진 설명이 없다');

    // --- 1. 열린 설명은 언제나 하나 ---
    //
    // 서로 멀리 떨어진 '?' 를 고른다. 펼쳐진 상자는 바로 아래 '?' 를 덮으므로
    // (팝오버라면 당연한 일이다) 이웃한 것을 눌러 확인하면 화면이 아니라
    // 상자를 누르게 된다.
    await helps.nth(0).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 1, "'?' 를 누르면 설명이 펼쳐진다");

    await helps.nth(n - 1).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 1, '다른 설명을 열면 앞의 것이 닫힌다 (겹치지 않는다)');

    await helps.nth(0).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 1, '셋째를 열어도 여전히 하나뿐이다');

    /* '한 번에 하나' 자체를 따로 본다.
       진짜 마우스 클릭은 pointerdown 이 먼저 앞의 것을 닫아 버리므로, 위
       검사들은 '한 번에 하나' 규칙이 없어도 통과한다 - 실제로 규칙을 빼고
       돌려 보니 그대로 통과했다. 여기서는 pointerdown 없이 눌러 본다. */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    const stacked = await page.evaluate(({ SEL, POP }) => {
      const btns = [...document.querySelectorAll(SEL)].filter((b) => b.offsetParent !== null);
      btns[0].click();
      btns[1].click();
      btns[2].click();
      // 리액트는 한 묶음으로 모아 그리므로 한 프레임 기다린 뒤에 센다
      return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(
        () => res(document.querySelectorAll(POP).length))));
    }, { SEL: HELP_BTN, POP: HELP_POP });
    t.is(stacked, 1, '바깥 누름 없이 셋을 잇달아 열어도 펼쳐진 것은 하나뿐이다');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    await helps.nth(0).click();
    await page.waitForTimeout(150);

    // 열려 있는 것이 방금 누른 그 설명인지 - 개수만 세면 엉뚱한 것이 열려 있어도 통과한다
    const wanted = await helps.nth(0).getAttribute('aria-label');
    t.is(await page.locator(HELP_POP).getAttribute('aria-label'), wanted + ' 내용',
      '펼쳐진 것은 방금 누른 그 설명이다');

    // --- 2. 닫는 길이 셋 ---
    await helps.nth(0).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 0, '같은 ? 를 다시 누르면 닫힌다');

    await helps.nth(0).click();
    await page.waitForTimeout(150);
    await page.getByRole('heading', { name: '퇴직급여 계좌 선택 · 인출 설계' }).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 0, '바깥을 누르면 닫힌다');

    await helps.nth(0).click();
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    t.is(await openCount(page), 0, 'Esc 로 닫힌다');

    await helps.nth(0).click();
    await page.waitForTimeout(150);
    const label = await helps.nth(0).getAttribute('aria-label');
    await page.getByRole('button', { name: label.replace(/ 설명$/, ' 설명 닫기'), exact: true }).click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 0, '× 로 닫힌다');

    /* 바깥을 눌러 닫는 것이 칸을 눌러 버리지는 않는지 - 설명 위에서 뗀 클릭이
       그대로 통과하면 체크가 켜지거나 탭이 바뀐다. 설명 안을 눌러도 닫히지 않고
       아무 일도 일어나지 않아야 한다. */
    await helps.nth(0).click();
    await page.waitForTimeout(150);
    await page.locator(HELP_POP).click({ position: { x: 20, y: 30 } });
    await page.waitForTimeout(150);
    t.is(await openCount(page), 1, '설명 본문을 눌러도 닫히지 않는다');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);

    // --- 3. 어느 '?' 를 눌러도 상자가 테두리 안에 머문다 ---
    //
    // 하나씩 열어 보고, 제 스크롤 칸(없으면 화면) 밖으로 나간 것과 가로
    // 스크롤바를 만든 것을 모아 적는다.
    const probe = (idx) => page.evaluate(({ i, SEL, POP }) => {
      const btns = [...document.querySelectorAll(SEL)].filter((b) => b.offsetParent !== null);
      const b = btns[i];
      if (!b) return { name: '(' + i + '번 없음)', missing: true };
      // 사람이 누를 때처럼 먼저 화면 안으로 굴려 온다. 그러지 않으면 화면 밖에서
      // 펼쳐 놓고 '머리가 안 보인다' 고 적게 된다 - 도구가 만든 허물이다.
      b.scrollIntoView({ block: 'center' });
      return new Promise((res) => requestAnimationFrame(() => {
        b.click();
        requestAnimationFrame(() => requestAnimationFrame(() => {
        const name = b.getAttribute('aria-label');
        const pops = [...document.querySelectorAll(POP)].filter((p) => p.offsetParent !== null);
        if (pops.length !== 1) return res({ name: name, opened: pops.length });
        const p = pops[0];
        const r = p.getBoundingClientRect();

        let clip = { left: 0, right: innerWidth, top: 0, bottom: innerHeight };
        let scrolls = false;
        for (let q = p.parentElement; q; q = q.parentElement) {
          const st = getComputedStyle(q);
          const hides = /(auto|scroll|hidden)/.test(st.overflowX) || /(auto|scroll|hidden)/.test(st.overflowY);
          if (/(auto|scroll)/.test(st.overflowX) && q.scrollWidth - q.clientWidth > 2) scrolls = true;
          if (hides && clip.right === innerWidth && clip.left === 0) {
            const cr = q.getBoundingClientRect();
            clip = {
              left: Math.max(0, cr.left), right: Math.min(innerWidth, cr.right),
              top: Math.max(0, cr.top), bottom: Math.min(innerHeight, cr.bottom)
            };
          }
        }
        res({
          name: name, opened: 1, scrolls: scrolls,
          inside: r.left >= clip.left - 1 && r.right <= clip.right + 1,
          topVisible: r.top >= clip.top - 1 && r.top < clip.bottom,
          box: Math.round(r.left) + '~' + Math.round(r.right) +
            ' / 테두리 ' + Math.round(clip.left) + '~' + Math.round(clip.right)
        });
        }));
      }));
    }, { i: idx, SEL: HELP_BTN, POP: HELP_POP });

    const outside = [], scrolled = [], hiddenTop = [], notOne = [];
    let probed = 0;
    for (let i = 0; i < n; i++) {
      const r = await probe(i);
      if (!r || r.missing) continue;
      probed += 1;
      if (r.opened !== 1) { notOne.push(r.name + '(' + r.opened + '개)'); continue; }
      if (!r.inside) outside.push(r.name + ' [' + r.box + ']');
      if (r.scrolls) scrolled.push(r.name);
      if (!r.topVisible) hiddenTop.push(r.name);
      await page.keyboard.press('Escape');
    }
    t.ok(probed >= 10, probed + "개의 '?' 를 하나씩 열어 확인했다");
    t.is(notOne.length, 0, '눌러 본 모든 ? 가 정확히 하나를 펼친다 - ' + JSON.stringify(notOne));
    t.is(outside.length, 0, '설명이 제 테두리 밖으로 나가지 않는다 - ' + JSON.stringify(outside));
    t.is(scrolled.length, 0, '설명 때문에 가로 스크롤바가 생기지 않는다 - ' + JSON.stringify(scrolled));
    t.is(hiddenTop.length, 0, '설명의 머리가 테두리 안에 보인다 - ' + JSON.stringify(hiddenTop));

    // --- 4. 좁은 화면에서도 같은 약속 ---
    await page.setViewportSize({ width: 412, height: 900 });
    await page.waitForTimeout(400);
    const small = page.locator(HELP_BTN + ':visible');
    const sn = await small.count();
    t.ok(sn >= 10, '좁은 화면에서도 ? 가 그대로 있다 - ' + sn + '개');
    const narrow = [];
    for (let i = 0; i < sn; i += 3) {
      const r = await probe(i);
      if (!r || r.missing || r.opened !== 1) continue;
      if (!r.inside) narrow.push(r.name + ' [' + r.box + ']');
      await page.keyboard.press('Escape');
    }
    t.is(narrow.length, 0, '412px 에서도 설명이 화면 밖으로 나가지 않는다 - ' + JSON.stringify(narrow));

    await page.setViewportSize({ width: 1500, height: 1000 });
    await page.waitForTimeout(300);

    // --- 5. 탭을 옮기면 열린 설명이 따라다니지 않는다 ---
    await page.locator(HELP_BTN + ':visible').first().click();
    await page.waitForTimeout(150);
    t.is(await openCount(page), 1, '설명을 하나 열어 둔 상태');
    await button(page, '판단표').click();
    await page.waitForTimeout(300);
    t.is(await openCount(page), 0, '탭을 옮기면 열려 있던 설명이 닫힌다');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
