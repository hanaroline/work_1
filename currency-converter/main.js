const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertButton = document.getElementById('convert');
const resultBox = document.getElementById('result');

// 숫자와 소수점 외의 문자 입력을 막는다 (e, +, - 등)
amountInput.addEventListener('keydown', (event) => {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
});

function showResult(text, isError = false) {
  resultBox.textContent = text;
  resultBox.classList.toggle('error', isError);
}

function formatNumber(value, currency) {
  const digits = currency === 'KRW' || currency === 'JPY' ? 0 : 2;
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

async function convert() {
  const amount = Number(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (amountInput.value.trim() === '' || !Number.isFinite(amount) || amount < 0) {
    showResult('올바른 금액을 입력하세요.', true);
    return;
  }

  convertButton.disabled = true;
  showResult('변환 중...');

  try {
    const response = await fetch(API_URL + from);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const rate = data.rates[to];
    if (typeof rate !== 'number') {
      throw new Error('환율 정보 없음');
    }

    const converted = amount * rate;
    showResult(`${formatNumber(amount, from)} ${from} = ${formatNumber(converted, to)} ${to}`);
  } catch (error) {
    showResult('환율 정보를 불러오지 못했습니다. 잠시 후 다시 시도하세요.', true);
  } finally {
    convertButton.disabled = false;
  }
}

convertButton.addEventListener('click', convert);
