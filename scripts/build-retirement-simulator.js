#!/usr/bin/env node
/**
 * 퇴직급여 수령 의사결정 시뮬레이터 — 자립형 단일 HTML 빌드
 *
 *   node scripts/build-retirement-simulator.js
 *
 * tools/retirement-simulator/{app.jsx, styles.css, shell.html} 를
 * React·Tailwind 와 함께 인라인하여 retirement-simulator.html 하나로 만든다.
 * 지점 PC 에서 CDN 없이 열리도록 외부 의존을 전부 제거한다.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'tools', 'retirement-simulator');
const OUT = path.join(ROOT, 'retirement-simulator.html');

const read = (p) => fs.readFileSync(p, 'utf8');

function requireDep(rel, hint) {
  const p = path.join(ROOT, 'node_modules', rel);
  if (!fs.existsSync(p)) {
    console.error('의존성이 없습니다: ' + rel + '\n  ' + hint);
    process.exit(1);
  }
  return p;
}

// 1) Tailwind — 실제 사용된 클래스만 추출해 최소 CSS 생성
console.log('[1/4] Tailwind CSS 생성');
const tailwindBin = requireDep('.bin/tailwindcss',
  'npm install --no-save react@18.3.1 react-dom@18.3.1 @babel/standalone@7.25.6 tailwindcss@3.4.16');
const cssTmp = path.join(SRC, '.tailwind.out.css');
execFileSync(tailwindBin, [
  '-c', path.join(SRC, 'tailwind.config.js'),
  '-i', path.join(SRC, 'styles.css'),
  '-o', cssTmp,
  '--minify'
], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
const css = read(cssTmp);
fs.unlinkSync(cssTmp);

// 2) JSX → JS (빌드 시점에 변환하므로 배포본에 Babel 이 필요 없다)
console.log('[2/4] JSX 트랜스파일');
const babel = require(requireDep('@babel/standalone', 'npm install --no-save @babel/standalone@7.25.6'));
const jsx = read(path.join(SRC, 'app.jsx'));
const appJs = babel.transform(jsx, {
  presets: [['react', { runtime: 'classic' }]],
  compact: false
}).code;

// 3) React UMD 번들
console.log('[3/4] React 번들 인라인');
const react = read(path.join(requireDep('react', 'npm install --no-save react@18.3.1'), 'umd', 'react.production.min.js'));
const reactDom = read(path.join(requireDep('react-dom', 'npm install --no-save react-dom@18.3.1'), 'umd', 'react-dom.production.min.js'));

// 4) 조립 — 치환 문자열($& 등)이 해석되지 않도록 함수형 replace 사용
console.log('[4/4] 단일 HTML 조립');
const html = read(path.join(SRC, 'shell.html'))
  .replace('/*__STYLES__*/', () => '\n' + css + '\n')
  .replace('/*__REACT__*/', () => '\n' + react + '\n' + reactDom + '\n')
  .replace('/*__APP__*/', () => '\n' + appJs + '\n');

if (html.includes('__STYLES__') || html.includes('__REACT__') || html.includes('__APP__')) {
  console.error('조립 실패: shell.html 의 플레이스홀더가 치환되지 않았습니다.');
  process.exit(1);
}

fs.writeFileSync(OUT, html);
console.log('완료 → ' + path.relative(ROOT, OUT) + ' (' + Math.round(html.length / 1024) + ' KB)');
