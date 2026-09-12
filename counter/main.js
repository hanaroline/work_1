// 카운터 앱 - 증가 / 감소 / 리셋

// 현재 카운터 값 (초기값 0)
let count = 0;

const display = document.getElementById('display');

// 현재 값을 화면에 반영한다
function render() {
  display.textContent = count;
}

// 증가 버튼: 1 증가
document.getElementById('increase').addEventListener('click', () => {
  count += 1;
  render();
});

// 감소 버튼: 1 감소
document.getElementById('decrease').addEventListener('click', () => {
  count -= 1;
  render();
});

// 리셋 버튼: 0으로 초기화
document.getElementById('reset').addEventListener('click', () => {
  count = 0;
  render();
});

// 첫 진입 시 초기값 표시
render();
