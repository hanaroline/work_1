/* 검증 스크립트가 함께 쓰는 브라우저·파일 경로 해석기.
 *
 * 컨테이너가 바뀌면 /opt/pw-browsers 밑의 판번호(chromium-1194 따위)가 달라진다.
 * 경로를 적어 두면 다음 세션에서 깨지므로 그때그때 찾아 쓴다. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** 검사 대상 단일 파일 — 인자로 덮어쓸 수 있다 */
export const TARGET = process.argv[2]
  || path.resolve(fileURLToPath(new URL('../../', import.meta.url)), 'sales-script-standalone-v4.html');

/** playwright 가 쓸 크로미움 실행 파일. 못 찾으면 undefined 를 돌려
 *  playwright 가 제 기본 경로를 쓰게 둔다. */
export function chromePath() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  let dirs = [];
  try { dirs = fs.readdirSync(root); } catch { return undefined; }
  const cand = dirs
    .filter(d => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of cand) {
    const p = path.join(root, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

/** chromium.launch 에 그대로 넘기는 설정 */
export function launchOpts() {
  const executablePath = chromePath();
  return executablePath ? { executablePath } : {};
}
