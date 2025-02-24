
const skill1_values = [0, 50, 61, 72, 83, 94, 105, 116, 127, 138, 150, 160, 170, 180, 190, 200];
const skill2_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];
const skill3_values = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const skill4_values = [10, 10.05, 10.1, 10.21, 10.2, 10.25, 10.3, 10.35, 10.4, 10.45, 10.5, 10.52, 10.54, 10.56, 10.58, 10.6];
const skill5_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];

// 스킬 값을 셀렉트 박스에 채우는 함수
function populateSelect(id, values) {
    let select = document.getElementById(id);
    select.innerHTML = "";
    values.forEach((value, i) => {
        let option = document.createElement("option");
                       option.value = i;
    if (id === "skill2") {
        option.text = `LV.${i.toString().padStart(2, '0')} (${value}%)`;
    } else {
        option.text = `LV.${i.toString().padStart(2, '0')} (${value})`;
    }
        select.appendChild(option);
    });
}

window.onload = function() {
    ["skill1", "skill2", "skill3", "skill4", "skill5"].forEach(id => populateSelect(id, eval(id + "_values")));
    updateTable();
}

let waveGolds = []; // 각 Wave의 골드를 저장할 배열


// 테이블 업데이트 함수
function updateTable() {
    let tableBody = document.getElementById("goldTable").getElementsByTagName("tbody")[0];
tableBody.innerHTML = "";
    let skill1 = skill1_values[document.getElementById("skill1").value];
    let skill2 = skill2_values[document.getElementById("skill2").value];
    let skill3 = skill3_values[document.getElementById("skill3").value];
    let skill4 = skill4_values[document.getElementById("skill4").value];
    let skill5 = skill5_values[document.getElementById("skill5").value];
    let gold = (150 + skill1) * (1 + skill2 / 100);

    let firstWaveOver200K = null; // 20만원 넘은 첫 Wave를 추적할 변수
    let previousGold = null; // 이전 Wave 골드
    let nextGold = null; // 다음 Wave 골드
    let previousWaveGold = null; // 이전 Wave의 골드를 추적하기 위한 변수

    let isOver200K = false;

    for (let wave = 0; wave <= 30; wave++) {
        if (wave === 1) {
            
            let mobCount = (wave === 1) ? 50 : 50;
            let critMultiplier = (wave < 21) ? 9 : 9;
            let critGold = mobCount * (((1 - (1 - (0.6 * (skill5 / 100)))**3) + (1 - (1 - (0.6 * (skill5 / 100)))**5)) / 3) * critMultiplier;

            
            gold = gold * (1 + skill2 / 100) + skill3 + 10000;  // 1Wave 계산 (5% 증가 + 추가 골드 + 10000)
            

            
        }

        if (wave > 1) {
            let mobCount = (wave === 1) ? 50 : 50;
            let critMultiplier = (wave < 21) ? 9 : 9;
            let critGold = mobCount * (((1 - (1 - (0.9 * (skill5 / 100)))**3) + (1 - (1 - (0.9 * (skill5 / 100)))**5)) / 3) * critMultiplier;

            gold = gold * (1 + skill2 / 100) + 200 + skill3;
            if (wave % 5 !== 0) {
                gold += mobCount * skill4 + critGold;
            }
        }

// waveGolds 배열에 각 Wave의 골드를 저장
waveGolds[wave] = Math.floor(gold);

        if (gold > 200000 && !isOver200K) {
            firstWaveOver200K = { wave: wave, gold: gold };
            isOver200K = true;
        }

        if (previousWaveGold !== null) {
            previousGold = previousWaveGold;
        }

        previousWaveGold = Math.floor(gold).toLocaleString();

        let row = tableBody.insertRow();
        row.insertCell(0).innerText = wave;

        let goldCell = row.insertCell(1);
        goldCell.innerText = Math.floor(gold).toLocaleString();
        if (gold > 200000) { 
            goldCell.style.color = "red";
        }

        if (firstWaveOver200K && wave === firstWaveOver200K.wave + 1) {
            nextGold = Math.floor(gold).toLocaleString();
        }
    }

    // 첫 번째 20만원을 초과한 Wave 표시
    if (firstWaveOver200K) {
        let firstWaveElement = document.getElementById("firstWaveOver200K");
        firstWaveElement.innerText = `20만원을 넘어간 Wave ${firstWaveOver200K.wave} / ${Math.floor(firstWaveOver200K.gold).toLocaleString()} 골드`;

        let previousAndNextElement = document.getElementById("previousAndNextWaves");
        previousAndNextElement.innerText = `이전 Wave: ${firstWaveOver200K.wave - 1} / ${previousGold || 'N/A'} 골드 | Wave: ${firstWaveOver200K.wave} / ${Math.floor(firstWaveOver200K.gold).toLocaleString()} 골드`;
    } else {
        let firstWaveElement = document.getElementById("firstWaveOver200K");
        firstWaveElement.innerText = "20만원을 넘어간 Wave가 없습니다.";
        let previousAndNextElement = document.getElementById("previousAndNextWaves");
        previousAndNextElement.innerText = "";
    }


    
    
    let goldMarkers = document.getElementById("goldMarkers");
    goldMarkers.innerHTML = `
        5 Wave 골드: ${waveGolds[5] ? waveGolds[5].toLocaleString() : 'N/A'}<br>
        10 Wave 골드: ${waveGolds[10] ? waveGolds[10].toLocaleString() : 'N/A'}<br>
        15 Wave 골드: ${waveGolds[15] ? waveGolds[15].toLocaleString() : 'N/A'}<br>
        20 Wave 골드: ${waveGolds[20] ? waveGolds[20].toLocaleString() : 'N/A'}<br>
        25 Wave 골드: ${waveGolds[25] ? waveGolds[25].toLocaleString() : 'N/A'}
    `;
}

// 클릭 시 셀 색상 변경 기능
document.addEventListener("DOMContentLoaded", function() {
    const table = document.getElementById("goldTable");

    table.addEventListener("click", function(e) {
        if (e.target && e.target.nodeName === "TD") {
            e.target.classList.toggle("selected");
        }
    });
});

// 스킬 값을 일괄 설정하는 함수
function setSkills(level) {
    ["skill1", "skill2", "skill3", "skill4", "skill5"].forEach(id => {
        document.getElementById(id).value = level;
    });
    updateTable();
    
}




window.onload = function() {
["skill1", "skill2", "skill3", "skill4", "skill5"].forEach(id => populateSelect(id, eval(id + "_values")));
updateTable();
}