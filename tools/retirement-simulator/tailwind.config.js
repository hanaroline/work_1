/** 퇴직급여 수령 의사결정 시뮬레이터 — Tailwind 설정 (미래에셋 디자인 토큰) */
module.exports = {
  content: [
    './tools/retirement-simulator/app.jsx',
    './tools/retirement-simulator/shell.html'
  ],
  theme: {
    extend: {
      colors: {
        mas:  { orange: '#F58220', blue: '#043B72', soft: '#FAB072', active: '#CB6015', gray: '#D7D7D7' },
        ink:  { DEFAULT: '#1A1A1A', body: '#3D3D3D', muted: '#6C6C6C', soft: '#84888B' },
        surf: { canvas: '#FFFFFF', soft: '#ECEFF4', subtle: '#F7F8FA' },
        hair: { DEFAULT: '#CDCECB', soft: '#E5E4E1' },
        sig:  { ok: '#2E8540', warn: '#D4A017', err: '#C62828' }
      },
      borderRadius: { none: '0px', xs: '2px', sm: '4px', md: '6px' },
      fontFamily: {
        kr: ['Spoqa Han Sans Neo', 'Noto Sans KR', 'sans-serif'],
        num: ['Inter', 'SF Mono', 'monospace']
      }
    }
  },
  plugins: []
};
