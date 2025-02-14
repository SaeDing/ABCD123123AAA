// 보상 데이터
const rewardsData = {
    "SS": { "마족 소환권": 6, "잡동사니 소환권": 6, 다이아: 480, 골드: 9600, 경험치: 3200, 잼: 80, 뺑뺑이: 240 },
    "어려움": { "마족 소환권": 6, "잡동사니 소환권": 6, 다이아: 480, 골드: 20000, 경험치: 3200, 잼: 80, 뺑뺑이: 240 },
    "매우 어려움": { "마족 소환권": 7, "잡동사니 소환권": 7, 다이아: 480, 골드: 30000, 경험치: 3200, 잼: 80, 뺑뺑이: 240 },
    "쉬움": { "마족 소환권": 2, "잡동사니 소환권": 2, 다이아: 160, 골드: 3200, 경험치: 3200, 잼: 80, 뺑뺑이: 240 },
    "불지옥": { "마족 소환권": 7, "잡동사니 소환권": 7, 다이아: 480, 골드: 40000, 경험치: 3200, 잼: 80, 뺑뺑이: 240 }
};



// 계산 버튼 클릭 이벤트
document.getElementById('calculate-btn').addEventListener('click', calculate);

document.getElementById('meat-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') calculate();
});

// 계산 함수
function calculate() {
    const meatCount = parseInt(document.getElementById('meat-input').value, 10);
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    // 결과 초기화
    const errorMsgEl = document.getElementById('error-msg');
    const rewardsEl = document.getElementById('rewards');
    const startTimeEl = document.getElementById('start-time');
    const endTimeEl = document.getElementById('end-time');
    const roundsEl = document.getElementById('rounds');
    const estimatedTimeEl = document.getElementById('estimated-time');

    errorMsgEl.textContent = '';
    startTimeEl.textContent = '';
    endTimeEl.textContent = '';
    roundsEl.textContent = '';
    estimatedTimeEl.textContent = '';
    rewardsEl.innerHTML = ''; // 줄바꿈을 허용하기 위해 innerHTML 사용

    if (isNaN(meatCount) || meatCount <= 0 || meatCount % 10 !== 0) {
        errorMsgEl.textContent = '10의 배수만 입력하세요!';
        return;
    }

    const rounds = meatCount / 10;
    const estimatedTime = rounds * 11;

    // 예상 시간 포맷팅 (60분 초과 시 시간과 분 표시)
    let estimatedTimeText = `${estimatedTime}분`;
    if (estimatedTime > 60) {
        const hours = Math.floor(estimatedTime / 60);
        const minutes = estimatedTime % 60;
        estimatedTimeText += ` (${hours}시간 ${minutes}분)`;
    }

    const endTime = new Date(Date.now() + estimatedTime * 60000);

    // 시작 시간 포맷팅 (연, 월, 일, 시, 분)
    const startTime = new Date();
    const startFormatted = `${startTime.getFullYear()}년 ${String(startTime.getMonth() + 1).padStart(2, '0')}월 ${String(startTime.getDate()).padStart(2, '0')}일 ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;

    // 종료 시간 포맷팅 (연, 월, 일, 시, 분)
    const endFormatted = `${endTime.getFullYear()}년 ${String(endTime.getMonth() + 1).padStart(2, '0')}월 ${String(endTime.getDate()).padStart(2, '0')}일 ${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

    startTimeEl.textContent = `시작 시간 : ${startFormatted}`;
    endTimeEl.textContent = `종료 시간 : ${endFormatted}`;
    roundsEl.innerHTML = `게임 판수 : <span class="highlight">${rounds}</span>`;
    estimatedTimeEl.textContent = `예상 시간 : ${estimatedTimeText}`;

    const rewards = rewardsData[difficulty];
    const rewardsText = Object.entries(rewards)
        .map(([key, value]) => {
            const formattedValue = (value * rounds).toLocaleString(); // 숫자 포맷팅
            return `${key}: ${formattedValue}`;
        })
        .join(', ')
        .replace(/, 골드:/, ',<br>골드:'); // "골드:" 앞에서 줄바꿈

    rewardsEl.innerHTML = `보상 : ${rewardsText}`;
}

function navigate(page) {
    window.location.href = page;
  }


// 초기화 버튼
document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('meat-input').value = '';
    ['error-msg', 'start-time', 'end-time', 'rounds', 'estimated-time', 'rewards']
        .forEach(id => document.getElementById(id).textContent = '');
});

// 초기 로드 시 SS 버튼 강조 표시
document.addEventListener('DOMContentLoaded', () => {
    const defaultButton = document.querySelector('input[name="difficulty"][value="SS"]');
    if (defaultButton) {
        defaultButton.checked = true; // 초기 상태 SS 버튼 체크
    }
});

// 난이도 버튼 클릭 시 효과 갱신 및 자동 계산
document.querySelectorAll('input[name="difficulty"]').forEach(button => {
    button.addEventListener('change', () => {
        updateButtonStyles();
        const meatCount = parseInt(document.getElementById('meat-input').value, 10);
        if (!isNaN(meatCount) && meatCount > 0 && meatCount % 10 === 0) {
            calculate(); // 계산 함수 호출
        }
    });
});

// 난이도 버튼 스타일 업데이트
function updateButtonStyles() {
    const labels = document.querySelectorAll('.difficulty-buttons label');
    labels.forEach(label => label.style.boxShadow = ''); // 초기화
    const selectedButton = document.querySelector('input[name="difficulty"]:checked + label');
    if (selectedButton) {
        selectedButton.style.boxShadow = '0 0 8px rgba(255, 99, 71, 0.5)';
    }
}
