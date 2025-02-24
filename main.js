/*****************************************************
 * 1) 전역 스킬 레벨별 값 정의
 *****************************************************/
const skill1_values = [0, 50, 61, 72, 83, 94, 105, 116, 127, 138, 150, 160, 170, 180, 190, 200];   // 1-3
const skill2_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];        // 1-1 (%)
const skill3_values = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];                  // 1-2
const skill4_values = [10, 10.05, 10.1, 10.21, 10.2, 10.25, 10.3, 10.35, 10.4, 10.45, 10.5, 10.52, 10.54, 10.56, 10.58, 10.6]; // 2-1
const skill5_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];        // 1-4

/*****************************************************
 * 2) 전역 데이터: 계산기 목록
 *****************************************************/
let calculatorsData = [];  // 각 요소: { calcId, skillLevels, waveGolds }


// 스크롤 상단 생성

// 1) HTML 요소 참조
const topScrollWrapper = document.getElementById('topScrollWrapper');
const topScrollTrack   = document.getElementById('topScrollTrack');
const calculatorContainer = document.getElementById('calculatorContainer');

// 2) 스크롤 동기화
topScrollWrapper.addEventListener('scroll', () => {
  calculatorContainer.scrollLeft = topScrollWrapper.scrollLeft;
});
calculatorContainer.addEventListener('scroll', () => {
  topScrollWrapper.scrollLeft = calculatorContainer.scrollLeft;
});

// 3) 스크롤 트랙의 width를 실제 컨테이너 내용폭에 맞추기
function updateTopScrollTrackWidth() {
  // calculatorContainer.scrollWidth가 실제 컨테이너의 내용 전체 너비
  topScrollTrack.style.width = calculatorContainer.scrollWidth + 'px';
}


/*****************************************************
 * 3) 계산기(템플릿) 동적 생성
 *****************************************************/
function addCalculator() {
  const template = document.getElementById('calculatorTemplate');
  const container = document.getElementById('calculatorContainer');

  // 템플릿 복제
  const clone = document.importNode(template.content, true);
  const calculatorInstance = clone.querySelector('.calculator-instance');

  // calcId 부여 (고유값)
  const calcId = Date.now(); // 간단히 timestamp 사용
  calculatorInstance.setAttribute('data-calc-id', calcId);

  // 각 스킬 셀렉트에 초기값 채우기
  const selects = calculatorInstance.querySelectorAll('select[data-skill]');
  selects.forEach(select => {
    const skillKey = select.getAttribute('data-skill'); // 1-1, 1-2 등
    populateSelect(select, skillKey);
    select.value = 0; // 기본 0렙
  });

  // calculatorsData에 새 항목 추가
  calculatorsData.push({
    calcId: calcId,
    skillLevels: {
      '1-1': 0,
      '1-2': 0,
      '1-3': 0,
      '1-4': 0,
      '2-1': 0
    },
    waveGolds: {}
  });

  // DOM에 추가
  container.appendChild(clone);

  // 초기 테이블 갱신
  updateTableInCalculator(selects[0]);

  updateTopScrollTrackWidth();
}

/*****************************************************
 * 4) 스킬 Select에 옵션 채우는 함수
 *****************************************************/
function populateSelect(selectEl, skillKey) {
  // skillKey: '1-1', '1-2', '1-3', '1-4', '2-1'
  // 해당 키에 맞는 배열 찾기
  let values;
  switch (skillKey) {
    case '1-1': values = skill2_values; break;  // skill2_values가 1-1
    case '1-2': values = skill3_values; break;  // skill3_values가 1-2
    case '1-3': values = skill1_values; break;  // skill1_values가 1-3
    case '1-4': values = skill5_values; break;  // skill5_values가 1-4
    case '2-1': values = skill4_values; break;  // skill4_values가 2-1
    default: values = [];
  }

  selectEl.innerHTML = '';
  values.forEach((val, i) => {
    const option = document.createElement('option');
    // 1-1은 퍼센트 표기
    if (skillKey === '1-1') {
      option.text = `LV.${String(i).padStart(2,'0')} (${val}%)`;
    } else {
      option.text = `LV.${String(i).padStart(2,'0')} (${val})`;
    }
    option.value = i;
    selectEl.appendChild(option);
  });
}

/*****************************************************
 * 5) 각 계산기에서 스킬이 바뀔 때 호출 → 테이블 갱신
 *****************************************************/
function updateTableInCalculator(el) {
  // el: 변경된 select
  // 상위 .calculator-instance를 찾아 calcId를 얻는다
  const calculatorInstance = el.closest('.calculator-instance');
  const calcId = parseInt(calculatorInstance.getAttribute('data-calc-id'), 10);

  // calculatorsData에서 해당 calcId의 데이터 객체를 찾는다
  const dataIndex = calculatorsData.findIndex(item => item.calcId === calcId);
  if (dataIndex < 0) return; // 혹시 못찾으면 중단

  // 스킬 레벨 갱신
  const selects = calculatorInstance.querySelectorAll('select[data-skill]');
  selects.forEach(select => {
    const skillKey = select.getAttribute('data-skill');
    const levelIndex = parseInt(select.value, 10);
    calculatorsData[dataIndex].skillLevels[skillKey] = levelIndex;
  });

  // waveGolds 계산
  const waveResults = calculateWaves(calculatorsData[dataIndex].skillLevels);
  calculatorsData[dataIndex].waveGolds = waveResults;

  // 화면 테이블에 표시
  renderWaveTable(calculatorInstance, waveResults);

  // 요약 테이블 갱신
  updateSummaryTable();
}

/*****************************************************
 * 6) 실제로 0~30 Wave 골드를 계산하는 로직
 *    (기존 코드를 개별 함수로 분리)
 *****************************************************/
function calculateWaves(skillLevels) {
  // skillLevels: { '1-1': 3, '1-2': 5, '1-3': 0, '1-4': 10, '2-1': 2 } 처럼 인덱스
  // 실제 값 꺼내기
  const skill_1_1 = skill2_values[ skillLevels['1-1'] ]; // 퍼센트
  const skill_1_2 = skill3_values[ skillLevels['1-2'] ];
  const skill_1_3 = skill1_values[ skillLevels['1-3'] ];
  const skill_1_4 = skill5_values[ skillLevels['1-4'] ];
  const skill_2_1 = skill4_values[ skillLevels['2-1'] ];

  // 초기 골드
  let gold = (150 + skill_1_3) * (1 + skill_1_1 / 100);

  let waveGolds = {};
  let firstWaveOver200K = null;
  let isOver200K = false;

  for (let wave = 0; wave <= 30; wave++) {
    if (wave === 1) {
      // wave 1 계산
      gold = gold * (1 + skill_1_1 / 100) + skill_1_2 + 10000;
    } else if (wave > 1) {
      // wave 2~
      gold = gold * (1 + skill_1_1 / 100) + 200 + skill_1_2;
      if (wave % 5 !== 0) {
        // 몹 처치 골드 + 치명타 골드
        const mobCount = 50;
        // (치명타 확률 계산은 원 코드 로직 그대로)
        let critMultiplier = 9; 
        let critGold = mobCount * ( (1 - (1 - (0.9 * (skill_1_4 / 100)))**3 + 1 - (1 - (0.9 * (skill_1_4 / 100)))**5 ) / 3 ) * critMultiplier;
        gold += mobCount * skill_2_1 + critGold;
      }
    }

    waveGolds[wave] = Math.floor(gold);

    if (gold > 200000 && !isOver200K) {
      firstWaveOver200K = { wave, gold };
      isOver200K = true;
    }
  }

  return waveGolds;
}

/*****************************************************
 * 7) 계산 결과를 해당 계산기의 표에 렌더링
 *****************************************************/
function renderWaveTable(calculatorInstance, waveResults) {
  const tbody = calculatorInstance.querySelector('.goldTable tbody');
  tbody.innerHTML = "";

  let firstWaveOver200K = null;
  let previousGold = 0;

  // Wave 5, 10, 15, 20, 25 표시
  const goldMarkersDiv = calculatorInstance.querySelector('.goldMarkers');
  goldMarkersDiv.innerHTML = `
    5 Wave 골드: ${waveResults[5].toLocaleString()}<br>
    10 Wave 골드: ${waveResults[10].toLocaleString()}<br>
    15 Wave 골드: ${waveResults[15].toLocaleString()}<br>
    20 Wave 골드: ${waveResults[20].toLocaleString()}<br>
    25 Wave 골드: ${waveResults[25].toLocaleString()}
  `;

  // 테이블에 0~30 Wave 표시
  for (let wave = 0; wave <= 30; wave++) {
    const goldVal = waveResults[wave];
    const row = document.createElement('tr');

    // Wave 셀
    let cell = document.createElement('td');
    cell.textContent = wave;
    row.appendChild(cell);

    // Gold 셀
    cell = document.createElement('td');
    cell.textContent = goldVal.toLocaleString();
    if (goldVal > 200000) {
      cell.classList.add('red');
      if (!firstWaveOver200K) {
        firstWaveOver200K = { wave, goldVal };
      }
    }
    row.appendChild(cell);

    tbody.appendChild(row);
  }

  // 20만원 초과 Wave 표시
  const firstWaveOver200KDiv = calculatorInstance.querySelector('.firstWaveOver200K');
  const previousAndNextWavesDiv = calculatorInstance.querySelector('.previousAndNextWaves');

  if (firstWaveOver200K) {
    firstWaveOver200KDiv.textContent =
      `20만원을 넘어간 Wave ${firstWaveOver200K.wave} / ${firstWaveOver200K.goldVal.toLocaleString()} 골드`;
    
    // 이전 Wave 골드, 다음 Wave 골드
    let prevWave = firstWaveOver200K.wave - 1;
    let nextWave = firstWaveOver200K.wave + 1;
    let prevGold = waveResults[prevWave] !== undefined ? waveResults[prevWave].toLocaleString() : '-';
    let nextGold = waveResults[nextWave] !== undefined ? waveResults[nextWave].toLocaleString() : '-';

    previousAndNextWavesDiv.textContent =
      `이전 Wave: ${prevWave} / ${prevGold} 골드 | 다음 Wave: ${nextWave} / ${nextGold} 골드`;
  } else {
    firstWaveOver200KDiv.textContent = "20만원을 넘어간 Wave가 없습니다.";
    previousAndNextWavesDiv.textContent = "";
  }
}

/*****************************************************
 * 8) "전부 0렙/10렙/15렙" 버튼
 *****************************************************/
function setAllSkills(btn, level) {
  // btn: 클릭된 버튼
  // 상위 calculator-instance를 찾아서 모든 select에 level 적용
  const calculatorInstance = btn.closest('.calculator-instance');
  const selects = calculatorInstance.querySelectorAll('select[data-skill]');
  selects.forEach(select => {
    select.value = level;
  });
  // 테이블 업데이트
  updateTableInCalculator(selects[0]);
}

/*****************************************************
 * 9) 계산기 삭제
 *****************************************************/
function removeCalculator(btn) {
  const calculatorInstance = btn.closest('.calculator-instance');
  const calcId = parseInt(calculatorInstance.getAttribute('data-calc-id'), 10);

  // calculatorsData에서 해당 calcId 제거
  calculatorsData = calculatorsData.filter(item => item.calcId !== calcId);

  // DOM 제거
  calculatorInstance.remove();

  // 요약 테이블 갱신
  updateSummaryTable();
}

/*****************************************************
 * 10) 요약 테이블 표시
 *****************************************************/
function updateSummaryTable() {
  const summaryTableBody = document.querySelector('#summaryTable tbody');
  summaryTableBody.innerHTML = "";

  calculatorsData.forEach(item => {
    const { calcId, skillLevels, waveGolds } = item;

    const row = document.createElement('tr');

    // CalcID
    let cell = document.createElement('td');
    cell.textContent = calcId;
    row.appendChild(cell);

    // 1-1, 1-2, 1-3, 1-4, 2-1 레벨
    cell = document.createElement('td');
    cell.textContent = skillLevels['1-1'] || 0;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.textContent = skillLevels['1-2'] || 0;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.textContent = skillLevels['1-3'] || 0;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.textContent = skillLevels['1-4'] || 0;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.textContent = skillLevels['2-1'] || 0;
    row.appendChild(cell);

    // 5,10,15,20,25,30 웨이브 골드
    [5,10,15,20,25,30].forEach(w => {
      cell = document.createElement('td');
      cell.textContent = waveGolds[w] ? waveGolds[w].toLocaleString() : 0;
      row.appendChild(cell);
    });

    summaryTableBody.appendChild(row);
  });
}

/*****************************************************
 * 11) CSV 다운로드
 *****************************************************/
function downloadCSV() {
  // CSV 헤더
  const header = [
    'CalcID',
    '1-1 Level','1-2 Level','1-3 Level','1-4 Level','2-1 Level',
    'Wave5','Wave10','Wave15','Wave20','Wave25','Wave30'
  ];
  // 각 계산기를 한 행씩
  const rows = calculatorsData.map(item => {
    const { calcId, skillLevels, waveGolds } = item;
    return [
      calcId,
      skillLevels['1-1'],
      skillLevels['1-2'],
      skillLevels['1-3'],
      skillLevels['1-4'],
      skillLevels['2-1'],
      waveGolds[5]  || 0,
      waveGolds[10] || 0,
      waveGolds[15] || 0,
      waveGolds[20] || 0,
      waveGolds[25] || 0,
      waveGolds[30] || 0
    ].join(',');
  });

  const csvContent = [
    header.join(','),
    ...rows
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'calculators_summary.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
