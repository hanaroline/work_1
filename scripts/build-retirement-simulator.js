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

/**
 * 0) 웹폰트를 base64 로 인라인.
 *
 * 지점 PC 에 승인 폰트가 깔려 있지 않아도 동일하게 렌더링되도록 파일 안에 심는다.
 * Spoqa Han Sans Neo(한글) 는 KS X 1001 서브셋본(2,574 음절)이라 고객명까지 커버하고,
 * Inter(숫자·영문) 는 latin 서브셋만 써서 표의 고정폭 숫자(tabular-nums)를 보장한다.
 * 둘 다 SIL Open Font License 1.1 이라 임베딩·재배포가 허용된다.
 */
const FONTS = [
  { family: 'Spoqa Han Sans Neo', weight: 400, file: 'spoqa-han-sans/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.woff2' },
  { family: 'Spoqa Han Sans Neo', weight: 500, file: 'spoqa-han-sans/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Medium.woff2' },
  { family: 'Spoqa Han Sans Neo', weight: 700, file: 'spoqa-han-sans/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.woff2' },
  { family: 'Inter', weight: 400, file: '@fontsource/inter/files/inter-latin-400-normal.woff2' },
  { family: 'Inter', weight: 500, file: '@fontsource/inter/files/inter-latin-500-normal.woff2' },
  { family: 'Inter', weight: 700, file: '@fontsource/inter/files/inter-latin-700-normal.woff2' }
];

const FONT_LICENSE_NOTICE = [
  '/*',
  ' * 임베드 폰트 (SIL Open Font License 1.1)',
  ' *   Spoqa Han Sans Neo - Copyright (c) 2020-11-30 Spoqa (spoqa.com),',
  ' *     with Reserved Font Name Spoqa Han Sans Neo.',
  ' *   Inter - Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter),',
  ' *     with Reserved Font Name Inter.',
  ' *   전문: https://scripts.sil.org/OFL · 사본은 tools/retirement-simulator/fonts/ 에 있음',
  ' */'
].join('\n');

function buildFontCss() {
  console.log('[0/5] 웹폰트 인라인');
  let total = 0;
  const faces = FONTS.map((f) => {
    const p = path.join(ROOT, 'node_modules', f.file);
    if (!fs.existsSync(p)) {
      console.error('폰트 파일이 없습니다: ' + f.file +
        '\n  npm install --no-save spoqa-han-sans@3.3.0 @fontsource/inter@5.3.0');
      process.exit(1);
    }
    const b64 = fs.readFileSync(p).toString('base64');
    total += b64.length;
    return "@font-face{font-family:'" + f.family + "';font-style:normal;font-weight:" + f.weight +
      ";font-display:block;src:url(data:font/woff2;base64," + b64 + ") format('woff2')}";
  });
  console.log('      폰트 ' + FONTS.length + '종, base64 ' + Math.round(total / 1024) + ' KB');
  return FONT_LICENSE_NOTICE + '\n' + faces.join('\n');
}

const fontCss = buildFontCss();

// 1) Tailwind — 실제 사용된 클래스만 추출해 최소 CSS 생성
console.log('[1/5] Tailwind CSS 생성');
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
console.log('[2/5] JSX 트랜스파일');
const babel = require(requireDep('@babel/standalone', 'npm install --no-save @babel/standalone@7.25.6'));
const jsx = read(path.join(SRC, 'app.jsx'));
const appJs = babel.transform(jsx, {
  presets: [['react', { runtime: 'classic' }]],
  compact: false
}).code;

// 3) React UMD 번들
console.log('[3/5] React 번들 인라인');
const react = read(path.join(requireDep('react', 'npm install --no-save react@18.3.1'), 'umd', 'react.production.min.js'));
const reactDom = read(path.join(requireDep('react-dom', 'npm install --no-save react-dom@18.3.1'), 'umd', 'react-dom.production.min.js'));

// 4) 조립 — 치환 문자열($& 등)이 해석되지 않도록 함수형 replace 사용
console.log('[4/5] 단일 HTML 조립');
const html = read(path.join(SRC, 'shell.html'))
  .replace('/*__STYLES__*/', () => '\n' + fontCss + '\n' + css + '\n')
  .replace('/*__REACT__*/', () => '\n' + react + '\n' + reactDom + '\n')
  .replace('/*__APP__*/', () => '\n' + appJs + '\n');

if (html.includes('__STYLES__') || html.includes('__REACT__') || html.includes('__APP__')) {
  console.error('조립 실패: shell.html 의 플레이스홀더가 치환되지 않았습니다.');
  process.exit(1);
}

fs.writeFileSync(OUT, html);
console.log('완료 → ' + path.relative(ROOT, OUT) + ' (' + Math.round(html.length / 1024) + ' KB)');
