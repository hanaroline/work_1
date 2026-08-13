import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'fs';
const { chromium } = pw;

const SRC = 'file:///home/user/work_1/fileshare/html/team-fileroom.html';
const OUT = '/tmp/roomtest';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const pass = [], fail = [];
const check = (label, ok, detail = '') => {
  (ok ? pass : fail).push(label);
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}${!ok && detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
const errors = [];
const newPage = async () => {
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  return p;
};

const FILES = [
  { name: '2026년_8월_시황.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF-CONTENT-' + 'x'.repeat(5000)) },
  { name: '팀_예산안.csv', mimeType: 'text/csv', buffer: Buffer.from('항목,금액\n인건비,100\n') },
  { name: 'meeting-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('# 회의록\n내용'.repeat(30)) },
];

// ---------- 1. 빈 상태에서 자료 넣고 저장 ----------
console.log('\n1. 관리자: 파일 추가 후 자료실 파일 만들기');
let page = await newPage();
await page.goto(SRC);
await page.waitForSelector('#listArea .empty');
check('빈 파일은 편집 모드로 열림', await page.getAttribute('body', 'data-mode') === 'edit');
check('빈 틀 안내 표시', await page.isVisible('#blankGuide'));
check('현재 파일명 표시', (await page.textContent('#curFile')).includes('team-fileroom.html'));
await page.screenshot({ path: `${OUT}/01-empty.png` });

await page.click('#addBtn');
await page.setInputFiles('#fileInput', FILES.slice(0, 2));
await page.fill('#addFolder', '리서치');
await page.fill('#addNote', '8월 월간 자료');
await page.setInputFiles('#fileInput', FILES.slice(0, 2)); // 첫 호출은 폴더/설명 입력 전이라 다시 넣음
await page.waitForFunction(() => window.FS_TEST.state.items.length >= 2);
await page.evaluate(() => { window.FS_TEST.state.items = window.FS_TEST.state.items.slice(-2); });
await page.click('[data-close]');
await page.click('#addBtn');
await page.fill('#addFolder', '회의');
await page.setInputFiles('#fileInput', [FILES[2]]);
await page.waitForFunction(() => window.FS_TEST.state.items.length === 3);
await page.click('#addModal [data-close]');
await page.evaluate(() => { window.FS_TEST.state; });
check('파일 3개 등록', await page.locator('table.files tbody tr').count() === 3);
check('변경 안내 표시', await page.isVisible('#dirtyMsg.on'));
await page.screenshot({ path: `${OUT}/02-edit.png` });

await page.click('#saveBtn');
await page.fill('#saveTitle', '리서치팀 자료실');
await page.fill('#savePw', 'team-2026');
await page.fill('#savePw2', 'team-2026');
await page.screenshot({ path: `${OUT}/03-save.png` });
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#saveGo')]);
const savedPath = `${OUT}/room.html`;
await dl.saveAs(savedPath);
check('저장 완료 안내 표시', await page.isVisible('#doneModal .modal'));
check('안내에 생성 파일명 표시', (await page.textContent('#doneName')).includes('리서치팀 자료실_'));
await page.click('#doneModal [data-close]');
const savedSize = fs.statSync(savedPath).size;
check('자료실 HTML 생성', savedSize > 10000, `size=${savedSize}`);
check('생성물에 평문 파일명이 남지 않음(암호화)', !fs.readFileSync(savedPath, 'utf8').includes('팀_예산안.csv'));
await page.close();

// ---------- 2. 받는 사람: 잠금 해제 ----------
console.log('\n2. 받는 사람: 비밀번호로 열기');
page = await newPage();
await page.goto('file://' + savedPath);
await page.waitForSelector('.gate-card');
check('비밀번호 잠금 화면으로 열림', await page.getAttribute('body', 'data-mode') === 'lock');
check('제목이 유지됨', (await page.textContent('.gate-card h1')).trim() === '리서치팀 자료실');
await page.screenshot({ path: `${OUT}/04-lock.png` });

await page.fill('#gatePw', 'wrong-password');
await page.click('#gateBtn');
await page.waitForSelector('#gateErr.on');
check('틀린 비밀번호 거부', await page.isVisible('#gateErr.on'));

await page.fill('#gatePw', 'team-2026');
await page.click('#gateBtn');
await page.waitForSelector('table.files tbody tr');
check('열람 모드 진입', await page.getAttribute('body', 'data-mode') === 'view');
check('파일 3개 표시', await page.locator('table.files tbody tr').count() === 3);
check('조회 모드에는 삭제 버튼 없음', await page.locator('#delBtn').isHidden());
await page.screenshot({ path: `${OUT}/05-view.png` });

// 개별 다운로드 내용 확인
const [d1] = await Promise.all([
  page.waitForEvent('download'),
  page.locator('table.files tbody tr', { hasText: '팀_예산안.csv' }).locator('.fname').click(),
]);
const csvPath = `${OUT}/one.bin`;
await d1.saveAs(csvPath);
check('개별 다운로드 내용 일치', fs.readFileSync(csvPath).equals(FILES[1].buffer));

// ZIP 다운로드
await page.click('table.files thead input[type=checkbox]');
const [d2] = await Promise.all([page.waitForEvent('download'), page.click('#zipBtn')]);
const zipPath = `${OUT}/all.zip`;
await d2.saveAs(zipPath);
check('ZIP 생성', fs.statSync(zipPath).size > 500);

// 검색
await page.fill('#search', '예산');
await page.waitForTimeout(150);
check('검색 동작', await page.locator('table.files tbody tr').count() === 1);
await page.fill('#search', '');

// ---------- 3. 받은 파일을 다시 편집해 갱신 ----------
console.log('\n3. 받은 파일에 자료 추가 후 재저장');
await page.click('#editBtn');
await page.click('#addBtn');
await page.fill('#addFolder', '추가분');
await page.setInputFiles('#fileInput', [{ name: 'extra.txt', mimeType: 'text/plain', buffer: Buffer.from('추가 자료') }]);
await page.waitForFunction(() => window.FS_TEST.state.items.length === 4);
await page.click('#addModal [data-close]');
await page.click('#saveBtn');
await page.fill('#savePw', 'team-2026');
await page.fill('#savePw2', 'team-2026');
const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#saveGo')]);
await page.click('#doneModal [data-close]');
const v2Path = `${OUT}/room-v2.html`;
await dl2.saveAs(v2Path);
check('갱신본 저장', fs.statSync(v2Path).size > savedSize);
await page.close();

page = await newPage();
await page.goto('file://' + v2Path);
await page.fill('#gatePw', 'team-2026');
await page.click('#gateBtn');
await page.waitForSelector('table.files tbody tr');
check('갱신본에 파일 4개', await page.locator('table.files tbody tr').count() === 4);
const [d3] = await Promise.all([
  page.waitForEvent('download'),
  page.locator('table.files tbody tr', { hasText: '2026년_8월_시황.pdf' }).locator('.fname').click(),
]);
await d3.saveAs(`${OUT}/pdf.bin`);
check('갱신본 다운로드 내용 일치', fs.readFileSync(`${OUT}/pdf.bin`).equals(FILES[0].buffer));
await page.close();

// ---------- 4. 비밀번호 없는 자료실 ----------
console.log('\n4. 비밀번호 없이 저장');
page = await newPage();
await page.goto(SRC);
await page.waitForSelector('#listArea .empty');
await page.click('#addBtn');
await page.setInputFiles('#fileInput', [FILES[2]]);
await page.waitForFunction(() => window.FS_TEST.state.items.length === 1);
await page.click('#addModal [data-close]');
await page.click('#saveBtn');
await page.fill('#saveTitle', '공개 자료실');
const [dl3] = await Promise.all([page.waitForEvent('download'), page.click('#saveGo')]);
await page.click('#doneModal [data-close]');
const openPath = `${OUT}/open.html`;
await dl3.saveAs(openPath);
page = await newPage();
await page.goto('file://' + openPath);
await page.waitForSelector('table.files tbody tr');
check('비밀번호 없는 자료실은 바로 열림', await page.getAttribute('body', 'data-mode') === 'view');
check('제목 유지', (await page.textContent('.brand h1')).trim() === '공개 자료실');

// 영문 모드
await page.click('.topbar .lang-btn[data-lang="en"]');
await page.waitForTimeout(200);
check('영문 전환', (await page.textContent('table.files thead th:nth-child(3)')).trim() === 'File name');
await page.screenshot({ path: `${OUT}/06-en.png` });
await page.click('.topbar .lang-btn[data-lang="ko"]');   // 언어 선택은 localStorage 에 남으므로 되돌린다
await page.waitForTimeout(150);
await page.close();

// ---------- 5. 임시 보관 복원 ----------
console.log('\n5. 원본을 다시 열었을 때 임시 보관 복원');
page = await newPage();
await page.goto(SRC);
await page.waitForSelector('#draftBar:not([hidden])', { timeout: 10000 });
check('임시 보관 안내 표시', await page.isVisible('#draftBar'));
await page.click('#draftLoad');
await page.waitForSelector('table.files tbody tr');
check('임시 보관 복원됨', await page.locator('table.files tbody tr').count() >= 1);
await page.screenshot({ path: `${OUT}/07-draft.png` });
await page.close();

// ---------- 6. 관리 기능 ----------
console.log('\n6. 폴더·삭제·되돌리기 등 관리 기능');
page = await newPage();
await page.goto(SRC);
await page.waitForSelector('#listArea .empty');
await page.click('#draftDrop').catch(() => {});
await page.click('#addBtn');
await page.setInputFiles('#fileInput', FILES);
await page.waitForFunction(() => window.FS_TEST.state.items.length === 3);
await page.click('#addModal [data-close]');

// 폴더 만들기
await page.click('#folderBtn');
await page.fill('#fmNew', '리서치');
await page.click('#fmAdd');
await page.fill('#fmNew', '회의');
await page.click('#fmAdd');
await page.fill('#fmNew', '리서치');
await page.click('#fmAdd');
check('중복 폴더 거부', await page.isVisible('#fmErr.on'));
check('빈 폴더도 목록에 유지', (await page.locator('.folder-row').count()) === 3);
await page.screenshot({ path: `${OUT}/09-folders.png` });
await page.click('#folderModal .modal-foot [data-close]');

// 폴더 이동
await page.locator('table.files tbody tr').first().locator('input[type=checkbox]').check();
await page.locator('table.files tbody tr').nth(1).locator('input[type=checkbox]').check();
await page.click('#moveBtn');
await page.selectOption('#mvTarget', '리서치');
await page.click('#mvGo');
await page.waitForTimeout(200);
check('선택 파일 폴더 이동', await page.evaluate(() =>
  window.FS_TEST.state.items.filter(i => i.folder === '리서치').length) === 2);

// 폴더 이름 변경
await page.click('#folderBtn');
await page.waitForSelector('#folderModal:not([hidden]) .folder-row');
page.once('dialog', d => d.accept('리서치자료'));
await page.locator('.folder-row', { hasText: '리서치' }).first().getByRole('button', { name: '이름 변경' }).click();
await page.waitForTimeout(200);
check('폴더 이름 변경 반영', await page.evaluate(() =>
  window.FS_TEST.state.items.filter(i => i.folder === '리서치자료').length) === 2);

// 폴더 삭제 → 파일은 남고 폴더 없음으로
page.once('dialog', d => d.accept());
await page.locator('.folder-row', { hasText: '리서치자료' }).first().getByRole('button', { name: '삭제' }).click();
await page.waitForTimeout(200);
check('폴더 삭제해도 파일 유지', await page.evaluate(() => window.FS_TEST.state.items.length) === 3);
check('삭제된 폴더의 파일은 폴더 없음', await page.evaluate(() =>
  window.FS_TEST.state.items.every(i => i.folder !== '리서치자료')));
await page.click('#folderModal .modal-foot [data-close]');

// 되돌리기
await page.click('#undoBtn');
await page.waitForTimeout(200);
check('실행 취소로 폴더 복구', await page.evaluate(() =>
  window.FS_TEST.state.items.filter(i => i.folder === '리서치자료').length) === 2);

// 중요 표시
await page.locator('table.files tbody tr').last().locator('.pin').click();
await page.waitForTimeout(200);
check('중요 표시가 맨 위로 정렬', await page.locator('table.files tbody tr').first().locator('.pin.on').count() === 1);

// 파일 교체
await page.locator('table.files tbody tr', { hasText: 'meeting-notes.md' }).getByRole('button', { name: '교체' }).click();
await page.setInputFiles('#replaceInput', [{ name: 'new.md', mimeType: 'text/markdown', buffer: Buffer.from('교체된 내용') }]);
await page.waitForFunction(() => window.FS_TEST.state.items.some(i => i.version === 2));
check('교체 시 버전 증가', await page.locator('.ver').first().textContent() === 'v2');

// 삭제
await page.locator('table.files tbody tr').first().locator('input[type=checkbox]').check();
page.once('dialog', d => d.accept());
await page.click('#delBtn');
await page.waitForTimeout(300);
check('선택 삭제', await page.evaluate(() => window.FS_TEST.state.items.length) === 2);
await page.click('#undoBtn');
await page.waitForTimeout(200);
check('삭제 되돌리기', await page.evaluate(() => window.FS_TEST.state.items.length) === 3);

// 자료실 설정(공지)
await page.click('#roomSetBtn');
await page.fill('#rsTitle', '리서치팀 자료실');
await page.fill('#rsOwner', '송재섭');
await page.fill('#rsNotice', '8월 자료입니다. 대외 공유 금지.');
await page.click('#rsSave');
check('공지 표시', (await page.textContent('#noticeText')).includes('대외 공유 금지'));

// CSV
const [csv] = await Promise.all([page.waitForEvent('download'), page.click('#csvBtn')]);
await csv.saveAs(`${OUT}/list.csv`);
const csvText = fs.readFileSync(`${OUT}/list.csv`, 'utf8');
check('CSV 내보내기', csvText.includes('파일명') && csvText.includes('meeting-notes.md'));

// 전체 다운로드
const [zipAll] = await Promise.all([page.waitForEvent('download'), page.click('#zipAllBtn')]);
await zipAll.saveAs(`${OUT}/all2.zip`);
check('전체 다운로드 ZIP', fs.statSync(`${OUT}/all2.zip`).size > 500);
await page.screenshot({ path: `${OUT}/10-admin.png` });

// 저장 → 폴더/공지/핀 유지 확인
await page.click('#saveBtn');
await page.fill('#savePw', 'room-2026');
await page.fill('#savePw2', 'room-2026');
const [dl4] = await Promise.all([page.waitForEvent('download'), page.click('#saveGo')]);
const v3 = `${OUT}/room-v3.html`;
await dl4.saveAs(v3);
check('전달 문구 자동 생성', (await page.inputValue('#shareText')).includes('제1판'));
await page.screenshot({ path: `${OUT}/11-done.png` });
check('암호화 시 폴더명도 감춰짐', !fs.readFileSync(v3, 'utf8').includes('리서치자료'));
await page.close();

page = await newPage();
await page.goto('file://' + v3);
await page.fill('#gatePw', 'room-2026');
await page.click('#gateBtn');
await page.waitForSelector('table.files tbody tr');
check('저장본에 공지 유지', (await page.textContent('#noticeText')).includes('대외 공유 금지'));
check('저장본에 폴더 유지', await page.evaluate(() =>
  window.FS_TEST.state.items.filter(i => i.folder === '리서치자료').length) === 2);
check('저장본에 중요 표시 유지', await page.locator('table.files tbody tr').first().locator('.pin.on').count() === 1);
check('판 정보 표시', (await page.textContent('#revInfo')).includes('제1판'));
check('기준 시각 안내 표시', await page.isVisible('#staleHint'));
await page.screenshot({ path: `${OUT}/12-view-admin.png` });
await page.close();

console.log('\nJS 오류:', errors.length ? errors : 'none');
if (errors.length) fail.push('JS 오류 발생');
console.log('-'.repeat(46));
console.log(`통과 ${pass.length} / 실패 ${fail.length}`);
await browser.close();
process.exit(fail.length ? 1 : 0);
