const skill1_values = [0, 50, 61, 72, 83, 94, 105, 116, 127, 138, 150, 160, 170, 180, 190, 200];
const skill2_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];
const skill3_values = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const skill4_values = [2, 2.05, 2.1, 2.21, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.52, 2.54, 2.56, 2.58, 2.6];
const skill5_values = [0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.4, 7.8, 8.2, 8.6, 9];

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

let waveGolds = [];

function updateTable() {
    let tableBody = document.getElementById("goldTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    let skill1 = skill1_values[document.getElementById("skill1").value];
    let skill2 = skill2_values[document.getElementById("skill2").value];
    let skill3 = skill3_values[document.getElementById("skill3").value];
    let skill4 = skill4_values[document.getElementById("skill4").value];
    let skill5 = skill5_values[document.getElementById("skill5").value];
    let gold = (150 + skill1) * (1 + skill2 / 100);

    let firstWaveOver200K = null;
    let previousGold = null;
    let previousWaveIndex = -1;
    let nextGold = null;
    let isOver200K = false;

    // 각 웨이브의 골드를 계산
    for (let wave = 0; wave <= 80; wave++) {
        if (wave > 0) {
            let mobCount = (wave === 1) ? 110 : 40;
            let critMultiplier = (wave < 21) ? 3.5 : 9;
            let critGold = mobCount * (((1 - (1 - (0.6 * (skill5 / 100)))**3) + (1 - (1 - (0.6 * (skill5 / 100)))**5)) / 3) * critMultiplier;

            gold = gold * (1 + skill2 / 100) + 10 + skill3;
            if (wave % 5 !== 0) {
                gold += mobCount * skill4 + critGold;
            }
        }

        waveGolds[wave] = Math.floor(gold);

        // 40만원을 넘는 첫 번째 웨이브를 찾음
        if (gold > 400000 && !isOver200K) {
            firstWaveOver200K = { wave: wave, gold: gold };
            isOver200K = true;
            previousWaveIndex = wave - 1; // 이전 웨이브의 인덱스를 저장
        }

        let row = tableBody.insertRow();
        row.insertCell(0).innerText = wave;

        let goldCell = row.insertCell(1);
        goldCell.innerText = Math.floor(gold).toLocaleString();
        if (gold > 400000) { 
            goldCell.style.color = "red";
        }

        if (firstWaveOver200K && wave === firstWaveOver200K.wave + 1) {
            nextGold = Math.floor(gold).toLocaleString();
        }
    }

    // 이전 웨이브 골드 값 표시
    if (firstWaveOver200K && previousWaveIndex >= 0) {
        let firstWaveElement = document.getElementById("firstWaveOver200K");
        firstWaveElement.innerText = `40만원을 넘어간 Wave ${firstWaveOver200K.wave} / ${Math.floor(firstWaveOver200K.gold).toLocaleString()} 골드`;

        let previousAndNextElement = document.getElementById("previousAndNextWaves");
        previousAndNextElement.innerText = `이전 Wave: ${previousWaveIndex} / ${waveGolds[previousWaveIndex].toLocaleString()} 골드 | Wave: ${firstWaveOver200K.wave} / ${Math.floor(firstWaveOver200K.gold).toLocaleString()} 골드`;
    } else {
        let firstWaveElement = document.getElementById("firstWaveOver200K");
        firstWaveElement.innerText = "40만원을 넘어간 Wave가 없습니다.";
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

document.addEventListener("DOMContentLoaded", function() {
    const table = document.getElementById("goldTable");
    table.addEventListener("click", function(e) {
        if (e.target && e.target.nodeName === "TD") {
            e.target.classList.toggle("selected");
        }
    });
});

function setSkills(level) {
    ["skill1", "skill2", "skill3", "skill4", "skill5"].forEach(id => {
        document.getElementById(id).value = level;
    });
    updateTable();
}