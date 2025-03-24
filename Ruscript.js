document.addEventListener('DOMContentLoaded', function() {
    // FontAwesome 추가
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
    
    // 캐러셀 광고 크기 조정
    function adjustCarouselAdSize() {
        const carousel = document.getElementById('coupang-carousel-ad');
        if (carousel) {
            const containerWidth = carousel.parentElement.clientWidth;
            // 680px 기준으로 비율 유지하여 높이 조정 (140px 기본 높이)
            const height = Math.max(140 * (containerWidth / 680), 100);
            carousel.style.height = `${height}px`;
        }
    }
    
    // 창 크기 변경 시 캐러셀 광고 크기 조정
    window.addEventListener('resize', adjustCarouselAdSize);
    
    // 초기 로드 후 캐러셀 광고 크기 조정
    window.addEventListener('load', function() {
        setTimeout(adjustCarouselAdSize, 1000); // 광고가 로드된 후 크기 조정
    });
    
    // 스크롤에 따른 고정 광고 표시 제어
    const stickyAd = document.querySelector('.sticky-ad');
    let lastScrollTop = 0;
    let adShown = false;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // 페이지의 25% 이상 스크롤했을 때 광고 표시
        if (scrollTop > scrollHeight * 0.3 && !adShown) {
            stickyAd.style.display = 'block';
            adShown = true;
            
            // 3초 후에 애니메이션 효과로 표시
            setTimeout(function() {
                stickyAd.style.opacity = '1';
            }, 500);
        }
        
        // 페이지 하단 도달 시 광고 숨김
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            stickyAd.style.display = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // ====== 기본 요소 참조 (기존 계산기) ======
    const prizeList = document.getElementById('prize-list');
    const addPrizeButton = document.getElementById('add-prize');
    const calculateButton = document.getElementById('calculate-button');
    const errorContainer = document.getElementById('error-container');
    const totalProbability = document.getElementById('total-probability');
    const starLevels = document.querySelectorAll('.star-level');
    const resultsBody = document.getElementById('results-body');
    const starProbabilityDisplay = document.getElementById('star-probability');
    const failProbabilityDisplay = document.getElementById('fail-probability');
    const copyResultsButton = document.getElementById('copy-results');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // ====== 시뮬레이션 관련 요소 참조 ======
    const singleCostInput = document.getElementById('single-cost');
    const simulationTimesInput = document.getElementById('simulation-times');
    const fixedStarLevelSelect = document.getElementById('fixed-star-level');
    const simModeForms = document.getElementsByName('sim-mode');
    const simTypeTabs = document.querySelectorAll('[data-sim-tab]');
    const simTypeContents = document.querySelectorAll('.sim-type-content');
    const targetItemSelect = document.getElementById('target-item');
    const targetCountInput = document.getElementById('target-count');
    const statsTrialsInput = document.getElementById('stats-trials');
    const runSimulationButton = document.getElementById('run-simulation');
    const simulationResults = document.querySelector('.simulation-results');
    const simResultContents = document.querySelectorAll('.sim-result-content');
    
    // ====== 기본 설정 값 ======
    
    // 별 증가 확률 (기본값)
    const starIncreaseRate = {
        1: 0.70, // 1성 -> 2성: 70%
        2: 0.20, // 2성 -> 3성: 20%
        3: 0.07, // 3성 -> 4성: 7%
        4: 0.03  // 4성 -> 5성: 3%
    };

    // 별 감소 계수 (꽝 확률 조정)
    const starFailRateMultiplier = {
        1: 1,    // 1성: 꽝 확률 100%
        2: 0.8,  // 2성: 꽝 확률 80%
        3: 0.5,  // 3성: 꽝 확률 50%
        4: 0.3,  // 4성: 꽝 확률 30%
        5: 0.1   // 5성: 꽝 확률 10%
    };

    // 현재 선택된 별 개수
    let currentStars = 1;
    
    // 현재 상품 목록 (시뮬레이션에서 사용)
    let currentPrizes = [];
    let currentActualProbabilities = [];
    let currentTotalProbabilities = [];
    
    // ====== 기존 계산기 기능 구현 ======
    
    // 결과 탭 전환 기능 설정
    const resultsTabs = document.querySelectorAll('[data-results-tab]');
    resultsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 탭 활성화 상태 변경
            resultsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 탭 내용 표시/숨김
            const tabId = tab.getAttribute('data-results-tab');
            
            // 모든 결과 탭 컨테이너 숨기기
            document.querySelectorAll('.results-table-container').forEach(el => {
                el.style.display = 'none';
            });
            
            // 선택한 탭 표시
            if (tabId === 'all') {
                document.getElementById('all-results-tab').style.display = 'block';
            } else if (tabId === 'compare') {
                document.getElementById('compare-results-tab').style.display = 'block';
            }
        });
    });

    // 탭 전환 기능
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            if (!tabId) return; // 데이터 가져오기 버튼은 건너뛰기
            
            // 모든 탭 비활성화
            tabs.forEach(t => {
                if (t.getAttribute('data-tab')) {
                    t.classList.remove('active');
                }
            });
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택한 탭 활성화
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // 별 개수 선택 이벤트
    starLevels.forEach(level => {
        level.addEventListener('click', () => {
            starLevels.forEach(l => l.classList.remove('active'));
            level.classList.add('active');
            currentStars = parseInt(level.getAttribute('data-stars'));
            calculateAndDisplayResults();
        });
    });

    // 상품 추가 기능
    addPrizeButton.addEventListener('click', () => {
        const prizeCount = document.querySelectorAll('.prize-item').length;
        if (prizeCount >= 10) {
            showError('최대 10개의 상품만 추가할 수 있습니다.');
            return;
        }

        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-item';
        prizeItem.id = `prize-item-${prizeCount}`;
        
        prizeItem.innerHTML = `
            <input type="text" class="prize-name" placeholder="상품명" required>
            <input type="number" class="prize-probability" min="0" max="100" step="0.1" placeholder="확률(%)" required>
            <button class="remove-prize">✕</button>
        `;
        
        prizeList.appendChild(prizeItem);
        
        // 삭제 버튼 이벤트 추가
        const removeButton = prizeItem.querySelector('.remove-prize');
        removeButton.addEventListener('click', () => {
            prizeItem.remove();
            updateTotalProbability();
        });

        // 확률 입력 이벤트 추가
        const probabilityInput = prizeItem.querySelector('.prize-probability');
        probabilityInput.addEventListener('input', updateTotalProbability);
    });

    // 초기 꽝 상품의 확률 입력 이벤트 추가
    const initialProbabilityInput = document.querySelector('#prize-item-0 .prize-probability');
    if (initialProbabilityInput) {
        initialProbabilityInput.addEventListener('input', updateTotalProbability);
    }

    // 총 확률 업데이트 함수
    function updateTotalProbability() {
        const probabilityInputs = document.querySelectorAll('.prize-probability');
        let total = 0;
        
        probabilityInputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            total += value;
        });
        
        totalProbability.textContent = total.toFixed(3) + '%';
        
        // 100%가 아닌 경우 경고
        if (Math.abs(total - 100) > 0.001) {
            totalProbability.style.color = 'var(--error-color)';
        } else {
            totalProbability.style.color = 'var(--success-color)';
        }
    }

    // 오류 표시 함수
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // 3초 후 오류 메시지 숨기기
        setTimeout(() => {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }, 3000);
    }

    // 계산 버튼 이벤트
    calculateButton.addEventListener('click', calculateAndDisplayResults);

    // 결과 계산 및 표시 함수
    function calculateAndDisplayResults() {
        // 입력 데이터 수집
        const prizes = [];
        const prizeItems = document.querySelectorAll('.prize-item');
        let totalProbability = 0;
        
        prizeItems.forEach(item => {
            const nameInput = item.querySelector('.prize-name');
            const probabilityInput = item.querySelector('.prize-probability');
            
            const name = nameInput.value.trim();
            const probability = parseFloat(probabilityInput.value) || 0;
            
            if (name && probability > 0) {
                prizes.push({ name, probability });
                totalProbability += probability;
            }
        });
        
        // 유효성 검사
        if (prizes.length === 0) {
            showError('최소 한 개 이상의 상품을 추가하세요.');
            return;
        }
        
        if (Math.abs(totalProbability - 100) > 0.1) {
            showError('모든 상품의 확률 합이 100%가 되어야 합니다.');
            return;
        }
        
        // 꽝 상품이 첫 번째에 있는지 확인
        if (prizes[0].name !== '꽝') {
            showError('첫 번째 상품은 반드시 "꽝"이어야 합니다.');
            return;
        }

        // 별 확률 계산
        const starProbabilities = calculateStarProbabilities();
        
        // 별 확률 표시 변경
        if (currentStars === 1) {
            starProbabilityDisplay.textContent = "★ → ★★: 70%";
        } else if (currentStars === 2) {
            starProbabilityDisplay.textContent = "★★ → ★★★: 20%";
        } else if (currentStars === 3) {
            starProbabilityDisplay.textContent = "★★★ → ★★★★: 7%";
        } else if (currentStars === 4) {
            starProbabilityDisplay.textContent = "★★★★ → ★★★★★: 3%";
        } else {
            starProbabilityDisplay.textContent = "최고 등급";
        }
        
        // 실제 확률 계산
        const actualProbabilities = calculateActualProbabilities(prizes, currentStars);
        
        // 소수점 표시 방식 수정 - 백분율 정수로 표시
        let failProbValue = actualProbabilities[0].actualProbability;
        failProbabilityDisplay.textContent = formatPercentage(failProbValue) + '%';
        
        // 종합 확률 계산 (1~5성 모두 고려)
        const totalActualProbabilities = calculateTotalActualProbabilities(prizes);
        let totalFailProbValue = totalActualProbabilities[0].actualProbability;
        document.getElementById('total-actual-probability').textContent = 
            formatPercentage(totalFailProbValue) + '%';
        
        // 결과 테이블 업데이트
        updateResultsTable(prizes, actualProbabilities);
        
        // 별 단계별 비교 테이블 업데이트
        updateStarComparisonTable(prizes);
        
        // 현재 상품 및 확률 정보 저장 (시뮬레이션용)
        currentPrizes = prizes;
        currentActualProbabilities = actualProbabilities;
        currentTotalProbabilities = totalActualProbabilities;
        
        // 목표 시뮬레이션을 위한 상품 목록 업데이트
        updateTargetItemSelect();
    }
    
    // 백분율 형식화 함수
    function formatPercentage(value) {
        if (value >= 10) {
            // 10% 이상이면 정수로 표시
            return Math.round(value);
        } else if (value >= 1) {
            // 1% 이상 10% 미만이면 소수점 한 자리까지 표시
            return value.toFixed(1);
        } else {
            // 1% 미만이면 소수점 두 자리까지 표시
            return value.toFixed(2);
        }
    }

    // 별 확률 계산 함수
    function calculateStarProbabilities() {
        const probabilities = { 1: 1 }; // 기본 1성은 100%
        
        // 2성 확률 = 1성 확률 * 1성→2성 확률
        probabilities[2] = probabilities[1] * starIncreaseRate[1];
        
        // 3성 확률 = 2성 확률 * 2성→3성 확률
        probabilities[3] = probabilities[2] * starIncreaseRate[2];
        
        // 4성 확률 = 3성 확률 * 3성→4성 확률
        probabilities[4] = probabilities[3] * starIncreaseRate[3];
        
        // 5성 확률 = 4성 확률 * 4성→5성 확률
        probabilities[5] = probabilities[4] * starIncreaseRate[4];
        
        return probabilities;
    }

    // 실제 확률 계산 함수
    function calculateActualProbabilities(prizes, stars) {
        const results = [];
        
        // 꽝 확률 조정
        const originalFailProbability = prizes[0].probability;
        const adjustedFailProbability = originalFailProbability * starFailRateMultiplier[stars];
        const failProbabilityDifference = originalFailProbability - adjustedFailProbability;
        
        // 비꽝 상품들의 원래 확률 합
        let totalNonFailProbability = 0;
        for (let i = 1; i < prizes.length; i++) {
            totalNonFailProbability += prizes[i].probability;
        }
        
        // 각 상품의 실제 확률 계산
        for (let i = 0; i < prizes.length; i++) {
            const prize = { ...prizes[i] };
            
            if (i === 0) { // 꽝
                prize.actualProbability = adjustedFailProbability;
            } else { // 비꽝 상품
                // 감소한 꽝 확률을 비꽝 상품들에게 비율에 맞게 재분배
                const redistributionRatio = prize.probability / totalNonFailProbability;
                const additionalProbability = failProbabilityDifference * redistributionRatio;
                prize.actualProbability = prize.probability + additionalProbability;
            }
            
            results.push(prize);
        }
        
        return results;
    }
    
    // 종합 확률 계산 함수 (1~5성 모두 고려)
    function calculateTotalActualProbabilities(prizes) {
        const results = [];
        const failProbability = prizes[0].probability;
        
        // 꽝 확률 계산 (제공된 코드 로직과 동일)
        let actualFailProbability = 
            (failProbability * 1.0) * (0.3) +                        // 1성일 때 (꽝 확률 100% * 0.3)
            (failProbability * 0.8) * (0.7 * 0.8) +                  // 2성일 때 (꽝 확률 80% * 0.7 * 0.8)
            (failProbability * 0.5) * (0.7 * 0.2 * 0.93) +           // 3성일 때 (꽝 확률 50% * 0.7 * 0.2 * 0.93)
            (failProbability * 0.3) * (0.7 * 0.2 * 0.07 * 0.97) +    // 4성일 때 (꽝 확률 30% * 0.7 * 0.2 * 0.07 * 0.97)
            (failProbability * 0.1) * (0.7 * 0.2 * 0.07 * 0.03);     // 5성일 때 (꽝 확률 10% * 0.7 * 0.2 * 0.07 * 0.03)
        
        // 실제 꽝 확률이 원래 꽝 확률보다 낮아진 비율을 계산
        const extraProbabilityFactor = (failProbability - actualFailProbability) / (100 - failProbability);
        
        // 각 상품의 실제 확률 계산
        for (let i = 0; i < prizes.length; i++) {
            const prize = {
                name: prizes[i].name,
                probability: prizes[i].probability
            };
            
            if (i === 0) { // 꽝
                prize.actualProbability = actualFailProbability;
            } else { // 비꽝 상품
                // 비꽝 상품의 확률을 factor만큼 증가
                prize.actualProbability = prize.probability * (1 + extraProbabilityFactor);
            }
            
            results.push(prize);
        }
        
        // 반올림 오차 보정 (합이 정확히 100%가 되도록)
        let sum = 0;
        results.forEach(item => {
            sum += item.actualProbability;
        });
        
        if (Math.abs(sum - 100) > 0.01) {
            const ratio = 100 / sum;
            results.forEach(item => {
                item.actualProbability *= ratio;
            });
        }
        
        return results;
    }

    // 결과 테이블 업데이트 함수
    function updateResultsTable(prizes, actualProbabilities) {
        // 현재 별 결과 테이블 업데이트
        resultsBody.innerHTML = '';
        
        actualProbabilities.forEach((prize, index) => {
            const row = document.createElement('tr');
            if (index === 0) row.classList.add('highlight'); // 꽝 행 강조
            
            row.innerHTML = `
                <td>${prize.name}</td>
                <td>${prize.probability.toFixed(4)}%</td>
                <td>${prize.actualProbability.toFixed(4)}%</td>
            `;
            
            resultsBody.appendChild(row);
        });
        
        // 종합 확률 결과 테이블 업데이트
        const totalActualProbabilities = calculateTotalActualProbabilities(prizes);
        const totalResultsBody = document.getElementById('total-results-body');
        totalResultsBody.innerHTML = '';
        
        totalActualProbabilities.forEach((prize, index) => {
            const row = document.createElement('tr');
            if (index === 0) row.classList.add('highlight'); // 꽝 행 강조
            
            row.innerHTML = `
                <td>${prize.name}</td>
                <td>${prize.probability.toFixed(4)}%</td>
                <td>${prize.actualProbability.toFixed(4)}%</td>
            `;
            
            totalResultsBody.appendChild(row);
        });
    }

    // 별 단계별 비교 테이블 업데이트 함수
    function updateStarComparisonTable(prizes) {
        const comparisonContainer = document.querySelector('.star-comparison-container');
        comparisonContainer.innerHTML = '';
        
        // 모든 별 단계에 대한 계산 결과를 저장할 객체
        const allStarResults = {};
        
        // 1~5성 각각에 대한 확률 계산
        for (let stars = 1; stars <= 5; stars++) {
            allStarResults[stars] = calculateActualProbabilities(prizes, stars);
        }
        
        // 비교 테이블 생성
        const table = document.createElement('table');
        table.className = 'star-comparison-table';
        
        // 테이블 헤더
        const thead = document.createElement('thead');
        let headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th style="width: 20%;">상품</th>
            <th style="width: 15%;">등록확률</th>
            <th style="width: 13%;">1성 확률</th>
            <th style="width: 13%;">2성 확률</th>
            <th style="width: 13%;">3성 확률</th>
            <th style="width: 13%;">4성 확률</th>
            <th style="width: 13%;">5성 확률</th>
        `;
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 테이블 바디
        const tbody = document.createElement('tbody');
        
        // 별 단계별 꽝 확률 감소 및 재분배 정보 추가
        const infoRow = document.createElement('tr');
        infoRow.className = 'star-header';
        infoRow.innerHTML = `
            <td colspan="7">
                <span class="star-rating">★</span> 별 단계별 꽝 확률 변화:
                1성(100%) → 2성(80%) → 3성(50%) → 4성(30%) → 5성(10%)
            </td>
        `;
        tbody.appendChild(infoRow);
        
        // 각 상품별 행 추가
        prizes.forEach((prize, prizeIndex) => {
            const row = document.createElement('tr');
            
            // 상품명과 등록확률
            let rowHTML = `
                <td>${prize.name}</td>
                <td>${prize.probability.toFixed(4)}%</td>
            `;
            
            // 1~5성 각각의 실제 확률
            for (let stars = 1; stars <= 5; stars++) {
                const actualProb = allStarResults[stars][prizeIndex].actualProbability;
                let changeInfo = '';
                
                // 1성 이후부터는 확률 변화량 표시
                if (stars > 1) {
                    const prevActualProb = allStarResults[stars-1][prizeIndex].actualProbability;
                    const change = actualProb - prevActualProb;
                    const changeClass = change > 0 ? 'increase' : (change < 0 ? 'decrease' : '');
                    const changeSign = change > 0 ? '↑' : (change < 0 ? '↓' : '');
                    
                    if (change !== 0) {
                        changeInfo = `<span class="change-indicator ${changeClass}">${changeSign} <span class="change-value">${Math.abs(change).toFixed(3)}%</span></span>`;
                    }
                }
                
                rowHTML += `<td>${actualProb.toFixed(3)}%${changeInfo}</td>`;
            }
            
            row.innerHTML = rowHTML;
            
            // 꽝 행 강조
            if (prizeIndex === 0) {
                row.className = 'highlight';
            }
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        comparisonContainer.appendChild(table);
    }
    
    // 결과 복사 기능
    copyResultsButton.addEventListener('click', function() {
        let resultsText = `룰렛 종합 확률 (1~5성 모두 고려)\n\n`;
        
        const rows = document.querySelectorAll('#total-results-table tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            resultsText += `${cells[0].textContent}: ${cells[2].textContent}\n`;
        });
        
        // 복사 기능 구현
        const textarea = document.createElement('textarea');
        textarea.value = resultsText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // 결과 표시
        const originalText = copyResultsButton.textContent;
        copyResultsButton.textContent = '복사 완료!';
        
        setTimeout(() => {
            copyResultsButton.textContent = originalText;
        }, 500);
    });
    
    // 현재 별 확률 복사 기능
    document.getElementById('copy-current-results').addEventListener('click', function() {
        let resultsText = `별 ${currentStars}개 룰렛 확률\n\n`;
        
        const rows = document.querySelectorAll('#results-table tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            resultsText += `${cells[0].textContent}: ${cells[2].textContent}\n`;
        });
        
        // 복사 기능 구현
        const textarea = document.createElement('textarea');
        textarea.value = resultsText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // 결과 표시
        const originalText = this.textContent;
        this.textContent = '복사 완료!';
        
        setTimeout(() => {
            this.textContent = originalText;
        }, 500);
    });
    
    // ====== 시뮬레이션 관련 기능 구현 ======
    
    // 시뮬레이션 모드 선택 이벤트
    simModeForms.forEach(radio => {
        radio.addEventListener('change', function() {
            const simModeName = this.value;
            const fixedModeForm = document.querySelector('.sim-mode-fixed');
            
            if (simModeName === 'fixed') {
                fixedModeForm.style.display = 'block';
            } else {
                fixedModeForm.style.display = 'none';
            }
        });
    });
    
    // 별 단계 변화 선택 변경 이벤트 추가
    fixedStarLevelSelect.addEventListener('change', function() {
        // 선택된 값이 변경되면 시뮬레이션 데이터를 다시 준비하기 위한 플래그
        if (document.querySelector('input[name="sim-mode"]:checked').value === 'fixed') {
            // 현재 선택된 별 단계에 맞게 기대 확률 업데이트
            updateExpectedProbabilities();
        }
    });
    
    // 기대 확률 업데이트 함수
    function updateExpectedProbabilities() {
        // 별 단계 변화 모드일 때는 선택된 별 단계의 확률을 사용
        if (document.querySelector('input[name="sim-mode"]:checked').value === 'fixed') {
            const fixedStarLevel = parseInt(fixedStarLevelSelect.value) || 1;
            
            // 현재 선택된 별 단계로 확률 계산
            if (currentPrizes && currentPrizes.length > 0) {
                currentActualProbabilities = calculateActualProbabilities(currentPrizes, fixedStarLevel);
            }
        } else {
            // 고정 별 단계 모드일 때는 종합 확률 사용
            if (currentPrizes && currentPrizes.length > 0) {
                currentTotalProbabilities = calculateTotalActualProbabilities(currentPrizes);
            }
        }
    }
    
    // 시뮬레이션 유형 탭 전환
    simTypeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            simTypeTabs.forEach(t => t.classList.remove('active'));
            simTypeContents.forEach(content => content.style.display = 'none');
            
            // 선택한 탭 활성화
            tab.classList.add('active');
            const simType = tab.getAttribute('data-sim-tab');
            
            if (simType === 'target') {
                document.getElementById('target-sim-content').style.display = 'block';
            } else if (simType === 'stats') {
                document.getElementById('stats-sim-content').style.display = 'block';
            }
        });
    });
    
    // 상품 목록 업데이트 함수 (목표 시뮬레이션용)
    function updateTargetItemSelect() {
        targetItemSelect.innerHTML = '';
        
        currentPrizes.forEach((prize, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = prize.name;
            targetItemSelect.appendChild(option);
        });
    }
    
    // 시뮬레이션 실행 버튼 이벤트
    runSimulationButton.addEventListener('click', runSimulation);
    
    // 시뮬레이션 실행 함수
    function runSimulation() {
        // 유효성 검사
        if (!currentPrizes || currentPrizes.length === 0) {
            showError('먼저 상품과 확률을 설정하고 계산하기 버튼을 클릭하세요.');
            return;
        }
        
        // 입력값 가져오기
        const singleCost = parseFloat(singleCostInput.value) || 1000;
        const simulationTimes = parseInt(simulationTimesInput.value) || 100;
        const simMode = document.querySelector('input[name="sim-mode"]:checked').value;
        const fixedStarLevel = parseInt(fixedStarLevelSelect.value) || 1;
        const simType = document.querySelector('.sim-type-tabs .tab.active').getAttribute('data-sim-tab');
        
        // 선택된 모드에 따라 기대 확률 업데이트
        updateExpectedProbabilities();
        
        // 시뮬레이션 유형에 따라 다른 함수 실행
        let simResult;
        if (simType === 'simple') {
            simResult = runSimpleSimulation(simulationTimes, singleCost, simMode, fixedStarLevel);
            displaySimpleSimulationResults(simResult);
        } else if (simType === 'target') {
            const targetItemIndex = parseInt(targetItemSelect.value) || 0;
            const targetCount = parseInt(targetCountInput.value) || 1;
            simResult = runTargetSimulation(targetItemIndex, targetCount, singleCost, simMode, fixedStarLevel);
            displayTargetSimulationResults(simResult, targetItemIndex, targetCount);
        } else if (simType === 'stats') {
            const statsTrials = parseInt(statsTrialsInput.value) || 100;
            simResult = runStatsSimulation(simulationTimes, statsTrials, singleCost, simMode, fixedStarLevel);
            displayStatsSimulationResults(simResult, statsTrials);
        }
        
        // 결과 영역 표시
        simulationResults.style.display = 'block';
        
        // 해당 결과 내용만 표시
        simResultContents.forEach(content => {
            content.style.display = 'none';
        });
        
        document.getElementById(`${simType}-sim-results`).style.display = 'block';
        
        // 결과 영역으로 스크롤
        simulationResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 1. 단순 시뮬레이션 실행
    function runSimpleSimulation(times, cost, mode, fixedStarLevel) {
        const results = {
            prizeResults: Array(currentPrizes.length).fill(0),  // 각 상품별 당첨 횟수
            totalCost: times * cost,                           // 총 비용
            startStars: mode === 'fixed' ? fixedStarLevel : 1,  // 시작 별 등급
            endStars: mode === 'fixed' ? fixedStarLevel : 1,    // 종료 별 등급
            totalTries: times                                   // 총 시도 횟수
        };
        
        let currentStarLevel = results.startStars;
        
        // 시뮬레이션 실행
        for (let i = 0; i < times; i++) {
            // 현재 별 등급에 따른 실제 확률 계산
            const actualProbabilities = calculateActualProbabilities(currentPrizes, currentStarLevel);
            
            // 확률에 따라 상품 선택
            const selectedPrize = selectPrizeByProbability(actualProbabilities);
            results.prizeResults[selectedPrize]++;
            
            // 별 등급 변화 (dynamic 모드일 경우)
            if (mode === 'dynamic' && currentStarLevel < 5) {
                // 이 별 등급에서 다음 별 등급으로 올라갈 확률
                const upgradeRate = starIncreaseRate[currentStarLevel];
                
                // 랜덤 확률에 따라 별 등급 상승 여부 결정
                if (Math.random() < upgradeRate) {
                    currentStarLevel++;
                }
            }
        }
        
        // 최종 별 등급 저장
        results.endStars = currentStarLevel;
        
        return results;
    }
    
    // 2. 목표 시뮬레이션 실행
    function runTargetSimulation(targetIndex, targetCount, cost, mode, fixedStarLevel) {
        const MAX_TRIES = 100000; // 무한 루프 방지를 위한 최대 시도 횟수
        const results = {
            targetItemIndex: targetIndex,
            targetCount: targetCount,
            trials: []  // 각 시도별 결과 저장
        };
        
        // 10번의 시도 실행
        for (let trial = 0; trial < 10; trial++) {
            let triesNeeded = 0;
            let totalCost = 0;
            let targetAchieved = 0;
            let currentStarLevel = mode === 'fixed' ? fixedStarLevel : 1;
            
            // 목표 달성할 때까지 시뮬레이션
            while (targetAchieved < targetCount && triesNeeded < MAX_TRIES) {
                triesNeeded++;
                totalCost += cost;
                
                // 현재 별 등급에 따른 실제 확률 계산
                const actualProbabilities = calculateActualProbabilities(currentPrizes, currentStarLevel);
                
                // 확률에 따라 상품 선택
                const selectedPrize = selectPrizeByProbability(actualProbabilities);
                
                // 목표 상품이 당첨되었는지 확인
                if (selectedPrize === targetIndex) {
                    targetAchieved++;
                }
                
                // 별 등급 변화 (dynamic 모드일 경우)
                if (mode === 'dynamic' && currentStarLevel < 5) {
                    // 이 별 등급에서 다음 별 등급으로 올라갈 확률
                    const upgradeRate = starIncreaseRate[currentStarLevel];
                    
                    // 랜덤 확률에 따라 별 등급 상승 여부 결정
                    if (Math.random() < upgradeRate) {
                        currentStarLevel++;
                    }
                }
            }
            
            // 시도 결과 저장
            results.trials.push({
                triesNeeded: triesNeeded,
                totalCost: totalCost,
                success: targetAchieved >= targetCount
            });
        }
        
        // 통계 계산
        results.avgTries = results.trials.reduce((sum, trial) => sum + trial.triesNeeded, 0) / results.trials.length;
        results.avgCost = results.trials.reduce((sum, trial) => sum + trial.totalCost, 0) / results.trials.length;
        results.minTries = Math.min(...results.trials.map(trial => trial.triesNeeded));
        results.maxTries = Math.max(...results.trials.map(trial => trial.triesNeeded));
        
        // 중간값 계산
        const sortedTries = [...results.trials.map(trial => trial.triesNeeded)].sort((a, b) => a - b);
        const midIndex = Math.floor(sortedTries.length / 2);
        results.medianTries = sortedTries.length % 2 === 0
            ? (sortedTries[midIndex - 1] + sortedTries[midIndex]) / 2
            : sortedTries[midIndex];
        
        // 성공률 계산
        results.successRate = results.trials.filter(trial => trial.success).length / results.trials.length * 100;
        
        return results;
    }
    
    // 3. 통계 시뮬레이션 실행
    function runStatsSimulation(timesPerTrial, numTrials, cost, mode, fixedStarLevel) {
        const results = {
            trials: [],
            avgPrizeResults: Array(currentPrizes.length).fill(0),
            avgCost: 0,
            avgFinalStars: 0,
            totalTrials: numTrials,
            timesPerTrial: timesPerTrial
        };
        
        // 여러 번의 시도 실행
        for (let trial = 0; trial < numTrials; trial++) {
            // 각 시도는 단순 시뮬레이션과 동일
            const simResult = runSimpleSimulation(timesPerTrial, cost, mode, fixedStarLevel);
            results.trials.push(simResult);
            
            // 평균 계산을 위한 누적
            results.avgCost += simResult.totalCost;
            results.avgFinalStars += simResult.endStars;
            
            // 각 상품별 당첨 횟수 누적
            for (let i = 0; i < simResult.prizeResults.length; i++) {
                results.avgPrizeResults[i] += simResult.prizeResults[i];
            }
        }
        
        // 평균 계산
        results.avgCost /= numTrials;
        results.avgFinalStars /= numTrials;
        
        for (let i = 0; i < results.avgPrizeResults.length; i++) {
            results.avgPrizeResults[i] /= numTrials;
        }
        
        return results;
    }
    
    // 확률에 따라 상품 선택하는 함수
    function selectPrizeByProbability(probabilities) {
        const random = Math.random() * 100; // 0~100 사이의 랜덤 값
        let cumulativeProbability = 0;
        
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i].actualProbability;
            if (random <= cumulativeProbability) {
                return i;
            }
        }
        
        // 반올림 오차로 인해 마지막 상품이 선택되지 않을 수도 있으므로, 기본값으로 마지막 상품 반환
        return probabilities.length - 1;
    }
    
    // 단순 시뮬레이션 결과 표시 함수
    function displaySimpleSimulationResults(results) {
        // 요약 정보 업데이트
        document.getElementById('sim-total-tries').textContent = results.totalTries.toLocaleString();
        document.getElementById('sim-total-cost').textContent = results.totalCost.toLocaleString() + '원';
        document.getElementById('sim-start-stars').textContent = `${results.startStars}성`;
        document.getElementById('sim-end-stars').textContent = `${results.endStars}성`;
        
        // 결과 테이블 업데이트
        const simResultsBody = document.getElementById('sim-results-body');
        simResultsBody.innerHTML = '';
        
        // 선택된 모드에 따라 적절한 확률 정보 사용
        const simMode = document.querySelector('input[name="sim-mode"]:checked').value;
        let expectedProbabilities;
        
        if (simMode === 'fixed') {
            const fixedStarLevel = parseInt(fixedStarLevelSelect.value) || 1;
            expectedProbabilities = calculateActualProbabilities(currentPrizes, fixedStarLevel);
        } else {
            expectedProbabilities = calculateTotalActualProbabilities(currentPrizes);
        }
        
        // 각 상품별 결과 행 추가
        currentPrizes.forEach((prize, index) => {
            const winCount = results.prizeResults[index];
            const winRate = (winCount / results.totalTries) * 100;
            const expectedRate = expectedProbabilities[index].actualProbability;
            
            const row = document.createElement('tr');
            if (index === 0) row.classList.add('highlight'); // 꽝 행 강조
            
            row.innerHTML = `
                <td>${prize.name}</td>
                <td>${winCount.toLocaleString()}</td>
                <td>${winRate.toFixed(2)}%</td>
                <td>${expectedRate.toFixed(4)}%</td>
            `;
            
            simResultsBody.appendChild(row);
        });
    }
    
    // 목표 시뮬레이션 결과 표시 함수 수정
function displayTargetSimulationResults(results, targetIndex, targetCount) {
    // 비용 계산
    const singleCost = parseFloat(singleCostInput.value) || 1000;
    const minCost = results.minTries * singleCost;
    const maxCost = results.maxTries * singleCost;
    const avgCost = results.avgCost;
    
    // 목표 상품 확률 정보 계산
    let targetProbability;
    const simMode = document.querySelector('input[name="sim-mode"]:checked').value;
    
    if (simMode === 'fixed') {
        // 고정 별 단계 모드: 선택된 별 단계의 확률 사용
        const fixedStarLevel = parseInt(fixedStarLevelSelect.value) || 1;
        const fixedProbabilities = calculateActualProbabilities(currentPrizes, fixedStarLevel);
        targetProbability = fixedProbabilities[targetIndex].actualProbability;
    } else {
        // 별 단계 변화 모드: 종합 확률 사용
        const totalProbabilities = calculateTotalActualProbabilities(currentPrizes);
        targetProbability = totalProbabilities[targetIndex].actualProbability;
    }
    
    // 요약 정보 업데이트
    document.getElementById('target-item-name').textContent = currentPrizes[targetIndex].name;
    document.getElementById('target-achieved-count').textContent = targetCount;
    document.getElementById('target-item-probability').textContent = targetProbability.toFixed(5) + '%';
    document.getElementById('target-avg-tries').textContent = Math.round(results.avgTries).toLocaleString();
    
    // 비용 정보 업데이트
    document.getElementById('target-min-cost').textContent = minCost.toLocaleString() + '원';
    document.getElementById('target-avg-cost').textContent = Math.round(avgCost).toLocaleString() + '원';
    document.getElementById('target-max-cost').textContent = maxCost.toLocaleString() + '원';
    
    document.getElementById('target-min-tries-info').textContent = results.minTries.toLocaleString() + '회';
    document.getElementById('target-avg-tries-info').textContent = Math.round(results.avgTries).toLocaleString() + '회';
    document.getElementById('target-max-tries-info').textContent = results.maxTries.toLocaleString() + '회';
    
    // 상세 정보 업데이트
    document.getElementById('target-min-tries').textContent = results.minTries.toLocaleString();
    document.getElementById('target-max-tries').textContent = results.maxTries.toLocaleString();
    document.getElementById('target-median-tries').textContent = Math.round(results.medianTries).toLocaleString();
    document.getElementById('target-success-rate').textContent = results.successRate.toFixed(1) + '%';
    
    // 이론적 시도 횟수 계산 (1/확률)
    const theoreticalTries = 100 / targetProbability;
    
    // 상세 정보에 이론적 시도 횟수 추가
    const detailsContainer = document.querySelector('.target-details');
    
    // 기존 이론 시도 횟수 행이 있으면 업데이트, 없으면 추가
    let theoreticalRow = document.getElementById('theoretical-tries-row');
    if (!theoreticalRow) {
        theoreticalRow = document.createElement('div');
        theoreticalRow.className = 'detail-row';
        theoreticalRow.id = 'theoretical-tries-row';
        detailsContainer.appendChild(theoreticalRow);
    }
    
    theoreticalRow.innerHTML = `
        <span>이론적 시도 횟수 (1/확률):</span>
        <span id="theoretical-tries">${Math.round(theoreticalTries).toLocaleString()}</span>
    `;
}
    
    // 통계 시뮬레이션 결과 표시 함수
    function displayStatsSimulationResults(results, numTrials) {
        // 요약 정보 업데이트
        document.getElementById('stats-total-trials').textContent = results.totalTrials.toLocaleString();
        document.getElementById('stats-avg-cost').textContent = Math.round(results.avgCost).toLocaleString() + '원';
        document.getElementById('stats-avg-stars').textContent = results.avgFinalStars.toFixed(1) + '성';
        
        // 결과 테이블 업데이트
        const statsResultsBody = document.getElementById('stats-results-body');
        statsResultsBody.innerHTML = '';
        
        // 선택된 모드에 따라 적절한 확률 정보 사용
        const simMode = document.querySelector('input[name="sim-mode"]:checked').value;
        let expectedProbabilities;
        
        if (simMode === 'fixed') {
            const fixedStarLevel = parseInt(fixedStarLevelSelect.value) || 1;
            expectedProbabilities = calculateActualProbabilities(currentPrizes, fixedStarLevel);
        } else {
            expectedProbabilities = calculateTotalActualProbabilities(currentPrizes);
        }
        
        // 각 상품별 결과 행 추가
        currentPrizes.forEach((prize, index) => {
            const avgWinCount = results.avgPrizeResults[index];
            const avgWinRate = (avgWinCount / results.timesPerTrial) * 100;
            const expectedRate = expectedProbabilities[index].actualProbability;
            
            const row = document.createElement('tr');
            if (index === 0) row.classList.add('highlight'); // 꽝 행 강조
            
            row.innerHTML = `
                <td>${prize.name}</td>
                <td>${avgWinCount.toFixed(1)}</td>
                <td>${avgWinRate.toFixed(2)}%</td>
                <td>${expectedRate.toFixed(4)}%</td>
            `;
            
            statsResultsBody.appendChild(row);
        });
        
        // 분포 차트 표시 (간단한 텍스트 기반 시각화)
        const distributionContainer = document.getElementById('stats-distribution-container');
        distributionContainer.innerHTML = '';
        
        const distributionText = document.createElement('p');
        distributionText.innerHTML = '각 상품의 당첨 분포 (막대 길이는 당첨 확률 비례):<br><br>';
        
        currentPrizes.forEach((prize, index) => {
            const avgWinRate = (results.avgPrizeResults[index] / results.timesPerTrial) * 100;
            const barLength = Math.round(avgWinRate); // 확률에 비례하는 막대 길이
            
            const bar = '█'.repeat(Math.min(barLength, 50)); // 최대 50 길이로 제한
            
            distributionText.innerHTML += `${prize.name}: ${bar} ${avgWinRate.toFixed(2)}%<br>`;
        });
        
        distributionContainer.appendChild(distributionText);
    }
    
    // ====== 모달 관련 기능 ======
    
    // 모달 요소 참조
    const importBtn = document.getElementById('import-data-btn');
    const importModal = document.getElementById('import-modal');
    const closeBtn = document.querySelector('.close-button');
    const applyBtn = document.getElementById('apply-data-btn');
    const importText = document.getElementById('import-data-text');
    const importStatus = document.getElementById('import-status');
    
    // 모달 열기
    importBtn.addEventListener('click', function() {
        importModal.style.display = 'block';
    });
    
    // 모달 닫기
    closeBtn.addEventListener('click', function() {
        importModal.style.display = 'none';
    });
    
    // 외부 클릭 시 모달 닫기
    window.addEventListener('click', function(event) {
        if (event.target === importModal) {
            importModal.style.display = 'none';
        }
    });
    
    // 적용하기 버튼 클릭 이벤트
    applyBtn.addEventListener('click', function() {
        const text = importText.value.trim();
        
        if (!text) {
            showImportStatus('error', '데이터를 입력해주세요');
            return;
        }
        
        try {
            // 데이터 파싱
            const parseResult = parseImportData(text);
            const items = parseResult.items;
            const price = parseResult.price;
            
            if (items.length === 0) {
                showImportStatus('error', '유효한 데이터가 없습니다');
                return;
            }
            
            // 기존 상품 초기화 (첫 번째 꽝은 유지)
            clearExistingItems();
            
            // 첫 번째 항목이 꽝인 경우 확률 설정
            const firstPrizeItem = document.querySelector('#prize-item-0');
            const firstProbabilityInput = firstPrizeItem.querySelector('.prize-probability');
            
            if (items[0].name.toLowerCase().includes('꽝')) {
                firstProbabilityInput.value = items[0].probability;
                
                // 나머지 항목 추가
                for (let i = 1; i < items.length; i++) {
                    addPrizeItem(items[i].name, items[i].probability);
                }
            } else {
                // 첫 번째 항목이 꽝이 아닌 경우
                firstProbabilityInput.value = '';
                
                // 모든 항목 추가
                for (let i = 0; i < items.length; i++) {
                    addPrizeItem(items[i].name, items[i].probability);
                }
            }
            
            // 가격 설정 (있는 경우에만)
            if (price) {
                document.getElementById('single-cost').value = price;
            }
            
            // 총 확률 업데이트
            updateTotalProbability();
            
            showImportStatus('success', `${items.length}개 항목 추가 완료${price ? ', 가격 ' + price + '원 설정' : ''}`);
            
            // 모달 닫기 전에 계산하기 버튼 자동 클릭
            calculateButton.click();
            
            // 모달 닫기
            setTimeout(function() {
                importModal.style.display = 'none';
            }, 500);
            
        } catch (error) {
            showImportStatus('error', error.message);
        }
    });
    
    // 상태 메시지 표시
    function showImportStatus(type, message) {
        importStatus.textContent = message;
        importStatus.className = type;
        importStatus.style.display = 'block';
        
        setTimeout(function() {
            importStatus.style.display = 'none';
        }, 3000);
    }
    
    // 데이터 파싱
function parseImportData(text) {
    const lines = text.split('\n');
    const result = [];
    let price = null;
    
    // 첫 줄이 헤더인지 확인
    let startLine = 0;
    if (lines[0].includes('상품') && lines[0].includes('확률')) {
        startLine = 1;
    }
    
    // 룰렛 가격 찾기
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        if (line.includes('룰렛') && line.includes('가격')) {
            // 다음 라인에서 가격 찾기
            if (i + 1 < lines.length) {
                const priceLine = lines[i + 1].trim();
                const priceValue = parseInt(priceLine.replace(/[^0-9]/g, ''));
                if (priceValue > 0) {
                    price = priceValue;
                }
            }
        }
    }
    
    // 모든 텍스트를 하나로 합치기 (줄바꿈 제거)
    let allText = text.replace(/\n/g, ' ');
    
    // %를 기준으로 분리하여 각 부분을 처리
    const parts = allText.split('%');
    
    for (let i = 0; i < parts.length - 1; i++) {  // 마지막 부분은 % 뒤의 텍스트이므로 제외
        const part = parts[i].trim();
        if (!part) continue;
        
        // 마지막 숫자 부분이 확률
        const match = part.match(/([0-9.]+)$/);
        if (match) {
            const probability = parseFloat(match[0]);
            
            // 숫자 앞 부분이 상품명
            let name = part.substring(0, part.length - match[0].length).trim();
            
            if (name && !isNaN(probability)) {
                result.push({
                    name: name,
                    probability: probability
                });
            }
        }
    }
    
    return {
        items: result,
        price: price
    };
}
    
    // 기존 상품 아이템 초기화 (첫 번째 꽝은 유지)
    function clearExistingItems() {
        const prizeItems = document.querySelectorAll('.prize-item');
        
        // 첫 번째 항목(꽝)을 제외한 나머지 삭제
        for (let i = prizeItems.length - 1; i > 0; i--) {
            prizeItems[i].remove();
        }
    }
    
    // 상품 아이템 추가
    function addPrizeItem(name, probability) {
        // 기존 "상품 추가" 버튼 클릭 (이벤트 시뮬레이션)
        document.getElementById('add-prize').click();
        
        // 방금 추가된 아이템 찾기
        const prizeItems = document.querySelectorAll('.prize-item');
        const newItem = prizeItems[prizeItems.length - 1];
        
        // 이름과 확률 설정
        const nameInput = newItem.querySelector('.prize-name');
        const probabilityInput = newItem.querySelector('.prize-probability');
        
        nameInput.value = name;
        probabilityInput.value = probability;
    }
    
    // 초기 계산 수행 (페이지 로드 후)
    setTimeout(() => {
        if (document.querySelector('#prize-item-0 .prize-probability').value) {
            calculateButton.click();
        }
    }, 500);
});