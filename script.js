// 계산 버튼 클릭 이벤트
document.getElementById('calculate-btn').addEventListener('click', calculate);

// 고기 입력 칸에서 엔터 키를 눌렀을 때 계산 실행
document.getElementById('meat-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        calculate();
    }
});

// 계산 함수
function calculate() {
    const meatCount = parseInt(document.getElementById('meat-input').value, 10);
    const currentTime = new Date();

    // 결과 표시 영역 초기화
    const errorMsgEl = document.getElementById('error-msg');
    const startTimeEl = document.getElementById('start-time');
    const endTimeEl = document.getElementById('end-time');
    const roundsEl = document.getElementById('rounds');
    const estimatedTimeEl = document.getElementById('estimated-time');

    // 기존 오류 메시지와 결과 초기화
    errorMsgEl.textContent = '';
    startTimeEl.textContent = '';
    endTimeEl.textContent = '';
    roundsEl.textContent = '';
    estimatedTimeEl.textContent = '';

    // 입력 값 유효성 검사
    if (isNaN(meatCount) || meatCount <= 0 || meatCount % 10 !== 0) {
        errorMsgEl.textContent = '10의 배수만 입력하세요!';
        return;
    }

    // 게임 판수와 총 예상 시간 계산
    const rounds = meatCount / 10; // 게임 판수
    const estimatedTime = rounds * 11; // 예상 시간 (분)
    const totalMinutes = estimatedTime;
    const endTime = new Date(currentTime.getTime() + totalMinutes * 60000);

    // 예상 시간 포맷팅 (분 및 시간/분 병행 표시)
    let formattedEstimatedTime = `${estimatedTime}분`;
    if (estimatedTime >= 60) {
        const hours = Math.floor(estimatedTime / 60);
        const minutes = estimatedTime % 60;
        formattedEstimatedTime += ` (${hours}시간${minutes > 0 ? `${minutes}분` : ''})`;
    }

    // 시간 포맷 함수
    const formatTime = (date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ` +
               `${date.getHours().toString().padStart(2, '0')}:` +
               `${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // 결과 출력
    startTimeEl.textContent = `시작 시간: ${formatTime(currentTime)}`;
    endTimeEl.textContent = `종료 시간: ${formatTime(endTime)}`;
    roundsEl.textContent = `게임 판수: ${rounds}`;
    estimatedTimeEl.textContent = `예상 시간: ${formattedEstimatedTime}`;
}
// 초기화 버튼 이벤트
document.getElementById('reset-btn').addEventListener('click', function () {
    // 고기 입력 필드 초기화
    document.getElementById('meat-input').value = '';

    // 결과 메시지 초기화
    document.getElementById('error-msg').textContent = '';
    document.getElementById('start-time').textContent = '';
    document.getElementById('end-time').textContent = '';
    document.getElementById('rounds').textContent = '';
    document.getElementById('estimated-time').textContent = '';
});
