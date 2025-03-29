// 자원 총합 업데이트
function updateResourceTotals() {
    try {
        // 이전에 저장된 총 자원 값 보존
        const savedTotalResources = {
            arti: state.resources?.arti || 0,
            coins: state.resources?.coins || 0,
            exp: state.resources?.exp || 0,
            contribution: state.resources?.contribution || 0
        };
        
        // 이전에 계산된 기부 자원값 (없으면 0으로 초기화)
        const previousCalculatedResources = state.previousCalculatedResources || {
            arti: 0,
            coins: 0,
            exp: 0,
            contribution: 0
        };
        
        // 소유자별 자원 계산 (기부로 인한 기본 계산값)
        const calculatedOwnerResources = {};
        
        // 소유자별 초기화
        Array.from(state.owners).forEach(owner => {
            calculatedOwnerResources[owner] = {
                arti: 0,
                coins: 0,
                exp: 0,
                contribution: 0
            };
        });
        
        // 기부로 인한 자원 계산 (소유자별)
        state.characters.forEach(char => {
            const donationLevel = char.donationLevel || 0;
            const owner = char.owner || '소유자 미지정';
            
            if (!calculatedOwnerResources[owner]) {
                calculatedOwnerResources[owner] = {
                    arti: 0,
                    coins: 0,
                    exp: 0,
                    contribution: 0
                };
            }
            
            for (let i = 0; i < donationLevel; i++) {
                if (i < DONATION_INFO.length) {
                    calculatedOwnerResources[owner].arti += DONATION_INFO[i].arti;
                    calculatedOwnerResources[owner].coins += DONATION_INFO[i].coins;
                    calculatedOwnerResources[owner].exp += DONATION_INFO[i].exp;
                    calculatedOwnerResources[owner].contribution += DONATION_INFO[i].contribution;
                }
            }
        });
        
        // 최종 소유자별 자원 (사용자 수정값 적용)
        const finalOwnerResources = {};

        // 기본 계산값을 복사
        Object.entries(calculatedOwnerResources).forEach(([owner, resources]) => {
            // 기부로 인한 계산값 + 사용자 수정 추가값
            if (!state.resourceModifiers || !state.resourceModifiers[owner]) {
                finalOwnerResources[owner] = { ...resources };
            } else {
                finalOwnerResources[owner] = {
                    arti: resources.arti + (state.resourceModifiers[owner].arti || 0),
                    coins: resources.coins + (state.resourceModifiers[owner].coins || 0),
                    exp: resources.exp + (state.resourceModifiers[owner].exp || 0),
                    contribution: resources.contribution + (state.resourceModifiers[owner].contribution || 0)
                };
            }
        });
        
        // 전체 합계 계산 (모든 소유자 합산)
        let calculatedTotalArti = 0;
        let calculatedTotalCoins = 0;
        let calculatedTotalExp = 0;
        let calculatedTotalContribution = 0;
        
        Object.values(finalOwnerResources).forEach(resources => {
            calculatedTotalArti += resources.arti;
            calculatedTotalCoins += resources.coins;
            calculatedTotalExp += resources.exp;
            calculatedTotalContribution += resources.contribution;
        });
        
        // 새로운 기부분 계산 (현재 계산값 - 이전 계산값)
        const newDonationArti = Math.max(0, calculatedTotalArti - previousCalculatedResources.arti);
        const newDonationCoins = Math.max(0, calculatedTotalCoins - previousCalculatedResources.coins);
        const newDonationExp = Math.max(0, calculatedTotalExp - previousCalculatedResources.exp);
        const newDonationContribution = Math.max(0, calculatedTotalContribution - previousCalculatedResources.contribution);
        
        // 기존 값에 새로운 기부분을 더한 최종값 계산
        let finalTotalArti = savedTotalResources.arti + newDonationArti;
        let finalTotalCoins = savedTotalResources.coins + newDonationCoins;
        let finalTotalExp = savedTotalResources.exp + newDonationExp;
        let finalTotalContribution = savedTotalResources.contribution + newDonationContribution;
        
        // 현재 계산값을 다음 계산을 위해 저장
        state.previousCalculatedResources = {
            arti: calculatedTotalArti,
            coins: calculatedTotalCoins,
            exp: calculatedTotalExp,
            contribution: calculatedTotalContribution
        };
        
        // 전체 자원 상태 업데이트
        if (!state.resources) state.resources = {};
        state.resources.arti = finalTotalArti;
        state.resources.coins = finalTotalCoins;
        state.resources.exp = finalTotalExp;
        state.resources.contribution = finalTotalContribution;
        
        // UI 업데이트 - 전체 값
        if (elements.totalArti) elements.totalArti.textContent = formatNumber(finalTotalArti);
        if (elements.totalCoins) elements.totalCoins.textContent = formatNumber(finalTotalCoins);
        if (elements.totalExp) elements.totalExp.textContent = formatNumber(finalTotalExp);
        if (elements.totalContribution) elements.totalContribution.textContent = formatNumber(finalTotalContribution);
        
        // UI 업데이트 - 소유자별 값
        Object.entries(finalOwnerResources).forEach(([owner, resources]) => {
            const artiElement = document.getElementById(`${owner}-total-arti`);
            const coinsElement = document.getElementById(`${owner}-total-coins`);
            const expElement = document.getElementById(`${owner}-total-exp`);
            const contributionElement = document.getElementById(`${owner}-total-contribution`);
            
            if (artiElement) artiElement.textContent = formatNumber(resources.arti);
            if (coinsElement) coinsElement.textContent = formatNumber(resources.coins);
            if (expElement) expElement.textContent = formatNumber(resources.exp);
            if (contributionElement) contributionElement.textContent = formatNumber(resources.contribution);
        });
        
        // 계산 결과 반환 (차트 업데이트 등에 사용)
        return {
            totals: {
                totalArti: finalTotalArti,
                totalCoins: finalTotalCoins,
                totalExp: finalTotalExp,
                totalContribution: finalTotalContribution
            },
            ownerResources: finalOwnerResources
        };
    } catch (error) {
        console.error('자원 업데이트 에러:', error);
        showToast('자원 업데이트 중 오류가 발생했습니다.', 'error');
        
        // 기본값 반환
        return {
            totals: { totalArti: 0, totalCoins: 0, totalExp: 0, totalContribution: 0 },
            ownerResources: {}
        };
    }
}

// 소유자별 자원 탭 업데이트
function updateResourceTabs() {
    try {
        // 기본 소유자(쫌붕이, 스턴)은 이미 HTML에 있으므로 추가 소유자만 업데이트
        const defaultOwners = new Set(['쫌붕이', '스턴', 'all']);
        const tabsContainer = elements.resourcesTabs;
        
        if (!tabsContainer) return;
        
        // 추가된 소유자를 위한 탭 및 콘텐츠 생성
        Array.from(state.owners).forEach(owner => {
            if (!defaultOwners.has(owner)) {
                // 탭이 없는 경우에만 추가
                if (!document.querySelector(`.resources-tab[data-owner="${owner}"]`)) {
                    // 탭 생성
                    const tab = document.createElement('button');
                    tab.className = 'resources-tab';
                    tab.dataset.owner = owner;
                    tab.textContent = owner;
                    tab.addEventListener('click', () => switchResourceTab(owner));
                    tabsContainer.appendChild(tab);
                    
                    // 콘텐츠 생성
                    const content = createOwnerResourceContent(owner);
                    if (elements.dynamicOwnerResources) {
                        elements.dynamicOwnerResources.appendChild(content);
                    }
                    
                    // 차트 객체 초기화
                    resourcesCharts[owner] = null;
                }
            }
        });
        
        // 제거된 소유자 탭 및 콘텐츠 삭제
        document.querySelectorAll('.resources-tab').forEach(tab => {
            const owner = tab.dataset.owner;
            if (owner !== 'all' && !state.owners.has(owner)) {
                tab.remove();
                
                const content = document.querySelector(`.resources-content[data-owner="${owner}"]`);
                if (content) content.remove();
                
                // 차트 객체 삭제
                if (resourcesCharts[owner]) {
                    resourcesCharts[owner].destroy();
                    delete resourcesCharts[owner];
                }
            }
        });
    } catch (error) {
        console.error('자원 탭 업데이트 에러:', error);
        showToast('자원 탭 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 소유자별 자원 콘텐츠 생성
function createOwnerResourceContent(owner) {
    try {
        const content = document.createElement('div');
        content.className = 'resources-content';
        content.dataset.owner = owner;
        
        content.innerHTML = `
            <div class="resources-grid">
                <div class="resource">
                    <div class="resource-header">
                        <i class="fas fa-scroll"></i>
                        <button class="edit-resource-btn" data-resource="arti" data-owner="${owner}"><i class="fas fa-edit"></i></button>
                    </div>
                    <h3>아티팩트</h3>
                    <span id="${owner}-total-arti">0</span>
                </div>
                <div class="resource">
                    <div class="resource-header">
                        <i class="fas fa-coins"></i>
                        <button class="edit-resource-btn" data-resource="coins" data-owner="${owner}"><i class="fas fa-edit"></i></button>
                    </div>
                    <h3>길드 코인</h3>
                    <span id="${owner}-total-coins">0</span>
                </div>
                <div class="resource">
                    <div class="resource-header">
                        <i class="fas fa-star"></i>
                        <button class="edit-resource-btn" data-resource="exp" data-owner="${owner}"><i class="fas fa-edit"></i></button>
                    </div>
                    <h3>길드 경험치</h3>
                    <span id="${owner}-total-exp">0</span>
                </div>
                <div class="resource">
                    <div class="resource-header">
                        <i class="fas fa-hands-helping"></i>
                        <button class="edit-resource-btn" data-resource="contribution" data-owner="${owner}"><i class="fas fa-edit"></i></button>
                    </div>
                    <h3>기여도</h3>
                    <span id="${owner}-total-contribution">0</span>
                </div>
            </div>
            <div class="resource-chart">
                <canvas id="${owner}-resources-chart"></canvas>
            </div>
        `;
        
        // 버튼에 이벤트 리스너 추가
        const editButtons = content.querySelectorAll('.edit-resource-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceType = e.currentTarget.dataset.resource;
                const owner = e.currentTarget.dataset.owner;
                showResourceEditModal(resourceType, owner);
            });
        });
        
        return content;
    } catch (error) {
        console.error('자원 콘텐츠 생성 에러:', error);
        showToast('자원 콘텐츠 생성 중 오류가 발생했습니다.', 'error');
        
        // 기본 div 반환
        const errorDiv = document.createElement('div');
        errorDiv.className = 'resources-content';
        errorDiv.dataset.owner = owner;
        return errorDiv;
    }
}

// 자원 탭 전환
function switchResourceTab(owner) {
    try {
        // 모든 탭 비활성화
        document.querySelectorAll('.resources-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 모든 콘텐츠 숨김
        document.querySelectorAll('.resources-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 선택한 탭 활성화
        const selectedTab = document.querySelector(`.resources-tab[data-owner="${owner}"]`);
        if (selectedTab) selectedTab.classList.add('active');
        
        // 선택한 콘텐츠 표시
        const selectedContent = document.querySelector(`.resources-content[data-owner="${owner}"]`);
        if (selectedContent) selectedContent.classList.add('active');
        
        // 차트 업데이트
        updateResourcesCharts();
    } catch (error) {
        console.error('탭 전환 에러:', error);
        showToast('탭 전환 중 오류가 발생했습니다.', 'error');
    }
}

// 리소스 차트 업데이트
function updateResourcesCharts() {
    try {
        const { totals, ownerResources } = updateResourceTotals();
        
        // 전체 차트 업데이트
        updateSingleResourceChart('all', totals.totalArti, totals.totalCoins, totals.totalExp, totals.totalContribution);
        
        // 소유자별 차트 업데이트
        Object.entries(ownerResources).forEach(([owner, resources]) => {
            updateSingleResourceChart(owner, resources.arti, resources.coins, resources.exp, resources.contribution);
        });
    } catch (error) {
        console.error('리소스 차트 업데이트 에러:', error);
        showToast('리소스 차트 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 단일 리소스 차트 업데이트
function updateSingleResourceChart(owner, arti, coins, exp, contribution) {
    try {
        // 전체 탭은 특별히 처리 (ID가 다름)
        const chartId = owner === 'all' ? 'resources-chart' : `${owner}-resources-chart`;
        const chartElement = document.getElementById(chartId);
        
        if (!chartElement) return;
        
        // Chart.js가 로드되었는지 확인
        if (typeof Chart === 'undefined') {
            console.error('Chart.js가 로드되지 않았습니다.');
            return;
        }
        
        // 이미 차트가 있으면 파괴
        if (resourcesCharts[owner]) {
            resourcesCharts[owner].destroy();
        }
        
        // 새로운 차트 생성
        const ctx = chartElement.getContext('2d');
        resourcesCharts[owner] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['아티팩트', '길드 코인', '길드 경험치', '기여도'],
                datasets: [{
                    label: '누적 획득 자원',
                    data: [arti, coins, exp, contribution],
                    backgroundColor: [
                        'rgba(138, 43, 226, 0.7)',
                        'rgba(0, 180, 216, 0.7)',
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(255, 152, 0, 0.7)'
                    ],
                    borderColor: [
                        'rgba(138, 43, 226, 1)',
                        'rgba(0, 180, 216, 1)',
                        'rgba(76, 175, 80, 1)',
                        'rgba(255, 152, 0, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('단일 리소스 차트 업데이트 에러:', error);
    }
}

// 소유자 목록 업데이트
function updateOwnerList() {
    try {
        const ownerList = elements.ownerList;
        if (!ownerList) return;
        ownerList.innerHTML = '';
        
        // 소유자 목록 생성
        Array.from(state.owners).sort().forEach(owner => {
            const isDefault = owner === '쫌붕이' || owner === '스턴';
            const ownerCard = document.createElement('div');
            ownerCard.className = `owner-card ${isDefault ? 'default' : ''}`;
            
            // 소유자 색상 적용
            const ownerColor = state.ownerColors[owner] || '#8a2be2'; // 기본 보라색
            ownerCard.style.borderLeftColor = ownerColor;
            
            const ownerInfo = document.createElement('div');
            ownerInfo.className = 'owner-info';
            ownerInfo.innerHTML = `
                <i class="fas ${isDefault ? 'fa-user-shield' : 'fa-user'} owner-icon"></i>
                <span class="owner-name">${owner}</span>
            `;
            
            // 색상 선택기 추가
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.className = 'owner-color-picker';
            colorPicker.value = ownerColor;
            colorPicker.title = '소유자 색상 변경';
            colorPicker.addEventListener('change', (e) => updateOwnerColor(owner, e.target.value));
            
            const ownerActions = document.createElement('div');
            ownerActions.className = 'owner-actions';
            
            // 색상 선택기 추가
            ownerActions.appendChild(colorPicker);
            
            // 삭제 버튼 (기본 소유자가 아닌 경우만)
            if (!isDefault) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.title = '소유자 삭제';
                deleteBtn.addEventListener('click', () => deleteOwner(owner));
                ownerActions.appendChild(deleteBtn);
            }
            
            ownerCard.appendChild(ownerInfo);
            ownerCard.appendChild(ownerActions);
            ownerList.appendChild(ownerCard);
        });
    } catch (error) {
        console.error('소유자 목록 업데이트 에러:', error);
        showToast('소유자 목록 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 4. 색상 변경 함수 추가 - resources.js에 추가
function updateOwnerColor(owner, color) {
    try {
        // 상태 업데이트
        if (!state.ownerColors) state.ownerColors = {};
        state.ownerColors[owner] = color;
        
        // 모든 캐릭터 카드 스타일 업데이트
        document.querySelectorAll('.character-group').forEach(group => {
            const groupOwner = group.querySelector('.group-header h3').textContent.split(' ')[0];
            if (groupOwner === owner) {
                // 그룹 헤더 색상 변경
                const header = group.querySelector('.group-header');
                if (header) {
                    header.style.background = `rgba(${hexToRgb(color)}, 0.1)`;
                    header.style.borderBottom = `1px solid ${color}`;
                }
                
                // 소유자의 모든 캐릭터 카드 테두리 색상 변경
                group.querySelectorAll('.character-card').forEach(card => {
                    card.style.borderLeft = `3px solid ${color}`;
                });
            }
        });
        
        // Firebase에 저장
        saveDataToFirebase();
        showToast(`${owner}의 색상이 변경되었습니다.`, 'success');
    } catch (error) {
        console.error('소유자 색상 업데이트 에러:', error);
        showToast('소유자 색상 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 소유자 필터 업데이트
function updateOwnerFilter() {
    try {
        const ownerFilter = elements.ownerFilter;
        const charOwnerSelect = elements.charOwner;
        
        if (!ownerFilter || !charOwnerSelect) return;
        
        const currentValue = ownerFilter.value;
        
        // 기존 옵션 제거 (필터)
        while (ownerFilter.options.length > 1) {
            ownerFilter.remove(1);
        }
        
        // 기존 옵션 제거 (캐릭터 추가 폼)
        while (charOwnerSelect.options.length > 0) {
            charOwnerSelect.remove(0);
        }
        
        // 소유자 옵션 추가
        Array.from(state.owners).sort().forEach(owner => {
            // 필터 옵션
            const filterOption = document.createElement('option');
            filterOption.value = owner;
            filterOption.textContent = owner;
            ownerFilter.appendChild(filterOption);
            
            // 캐릭터 추가 폼 옵션
            const formOption = document.createElement('option');
            formOption.value = owner;
            formOption.textContent = owner;
            charOwnerSelect.appendChild(formOption);
        });
        
        // 이전 값으로 다시 설정 (필터)
        if (Array.from(ownerFilter.options).some(opt => opt.value === currentValue)) {
            ownerFilter.value = currentValue;
        }
    } catch (error) {
        console.error('소유자 필터 업데이트 에러:', error);
        showToast('소유자 필터 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 현재 수정 중인 소유자
let currentEditingOwner = null;

// 자원 수정 모달 표시
function showResourceEditModal(resourceType, owner = 'all') {
    try {
        currentEditingResource = resourceType;
        currentEditingOwner = owner;
        
        // 자원 타입에 따른 라벨 설정
        const resourceLabels = {
            arti: '아티팩트 수정',
            coins: '길드 코인 수정',
            exp: '길드 경험치 수정',
            contribution: '기여도 수정'
        };
        
        if (elements.resourceEditLabel) {
            const ownerText = owner === 'all' ? '' : ` (${owner})`;
            elements.resourceEditLabel.textContent = (resourceLabels[resourceType] || '자원 수정') + ownerText;
        }
        
        // 현재 값 설정
        if (elements.resourceEditValue) {
            let currentValue = 0;
            if (owner === 'all') {
                // 전체 자원의 경우
                currentValue = state.resources[resourceType] || 0;
            } else {
                // 소유자별 자원의 경우
                if (state.ownerResources[owner] && state.ownerResources[owner][resourceType] !== undefined) {
                    currentValue = state.ownerResources[owner][resourceType];
                } else {
                    // 계산된 값 가져오기
                    let calculatedValue = 0;
                    state.characters.forEach(char => {
                        if (char.owner === owner) {
                            const donationLevel = char.donationLevel || 0;
                            for (let i = 0; i < donationLevel; i++) {
                                if (i < DONATION_INFO.length) {
                                    calculatedValue += DONATION_INFO[i][resourceType];
                                }
                            }
                        }
                    });
                    currentValue = calculatedValue;
                }
            }
            elements.resourceEditValue.value = currentValue;
        }
        
        // 모달 표시
        if (elements.resourceEditModal) {
            elements.resourceEditModal.classList.add('show');
            if (elements.resourceEditValue) elements.resourceEditValue.focus();
        }
    } catch (error) {
        console.error('자원 수정 모달 표시 에러:', error);
        showToast('자원 수정 모달 표시 중 오류가 발생했습니다.', 'error');
    }
}

// 자원 수정 저장
// 자원 수정 저장 (수정된 버전)
function saveResourceEdit() {
    try {
        if (!currentEditingResource) return;
       
        if (!elements.resourceEditValue) return;
        const newValue = parseInt(elements.resourceEditValue.value) || 0;
       
        // 음수 값은 0으로 처리
        if (newValue < 0) {
            showToast('음수 값은 입력할 수 없습니다.', 'warning');
            return;
        }
       
        // 상태 업데이트
        if (currentEditingOwner === 'all') {
            // 전체 자원 수정
            if (!state.resources) state.resources = {};
            state.resources[currentEditingResource] = newValue; // 이 부분은 변경 없음
        } else {
            // 소유자별 자원 수정 - 사용자가 입력한 절대값을 그대로 사용
           
            // 기존 동작 보존 - 수정자 값 저장
            if (!state.resourceModifiers) state.resourceModifiers = {};
            if (!state.resourceModifiers[currentEditingOwner]) {
                state.resourceModifiers[currentEditingOwner] = {};
            }
           
            // 1. 현재 기부로 계산된 값 가져오기 (UI 표시용)
            let calculatedValue = 0;
            state.characters.forEach(char => {
                if (char.owner === currentEditingOwner) {
                    const donationLevel = char.donationLevel || 0;
                    for (let i = 0; i < donationLevel; i++) {
                        if (i < DONATION_INFO.length) {
                            calculatedValue += DONATION_INFO[i][currentEditingResource];
                        }
                    }
                }
            });
           
            // 절대값 대신 수정자 값으로 저장 (수정된 부분)
            state.resourceModifiers[currentEditingOwner][currentEditingResource] = newValue - calculatedValue;
           
            // 소유자별 자원도 동일하게 수정자로 저장
            if (!state.ownerResources) state.ownerResources = {};
            if (!state.ownerResources[currentEditingOwner]) {
                state.ownerResources[currentEditingOwner] = {};
            }
           
            // 절대값으로 저장 (기존 코드와 동일)
            state.ownerResources[currentEditingOwner][currentEditingResource] = newValue;
        }
       
        // UI 업데이트
        updateResourceTotals();
        updateResourcesCharts();
       
        // 모달 닫기
        hideResourceEditModal();
       
        // 저장
        saveDataToFirebase();
       
        const resourceName =
            currentEditingResource === 'arti' ? '아티' :
            currentEditingResource === 'coins' ? '길드 코인' :
            currentEditingResource === 'exp' ? '길드 경험치' : '기여도';
           
        // 수정된 부분: 소유자 이름 처리 개선
        let ownerName;
        if (currentEditingOwner === 'all') {
            ownerName = '전체';
        } else if (!currentEditingOwner || currentEditingOwner === 'null' || String(currentEditingOwner).toLowerCase() === 'null' || String(currentEditingOwner).toLowerCase() === 'undefined') {
            ownerName = '미지정 소유자';  // null이나 undefined 대신 표시할 이름
        } else {
            ownerName = currentEditingOwner;
        }
       
        showToast(`${ownerName}의 ${resourceName} 값이 수정되었습니다.`, 'success');
    } catch (error) {
        console.error('자원 수정 저장 에러:', error);
        showToast('자원 수정 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 자원 수정 모달 닫기
function hideResourceEditModal() {
    try {
        if (elements.resourceEditModal) {
            elements.resourceEditModal.classList.remove('show');
        }
        currentEditingResource = null;
        currentEditingOwner = null;
    } catch (error) {
        console.error('자원 수정 모달 닫기 에러:', error);
    }
}

// 소유자 추가 폼 표시
function showOwnerForm() {
    try {
        if (elements.ownerForm) {
            elements.ownerForm.classList.remove('hidden');
            if (elements.newOwner) elements.newOwner.focus();
        }
    } catch (error) {
        console.error('소유자 추가 폼 표시 에러:', error);
        showToast('소유자 추가 폼 표시 중 오류가 발생했습니다.', 'error');
    }
}

// 소유자 추가 폼 숨김
function hideOwnerForm() {
    try {
        if (elements.ownerForm) {
            elements.ownerForm.classList.add('hidden');
            if (elements.newOwner) elements.newOwner.value = '';
        }
    } catch (error) {
        console.error('소유자 추가 폼 숨김 에러:', error);
    }
}

// 소유자 저장
// 8. 소유자 생성 시 기본 색상 설정 - resources.js의 saveOwner 함수 수정
function saveOwner() {
    try {
        if (!elements.newOwner) return;
        
        const newOwner = elements.newOwner.value.trim();
        
        if (!newOwner) {
            showToast('소유자 이름을 입력해주세요.', 'warning');
            return;
        }
        
        if (state.owners.has(newOwner)) {
            showToast('이미 존재하는 소유자입니다.', 'warning');
            return;
        }
        
        // 소유자 추가
        state.owners.add(newOwner);
        
        // 임의의 색상 생성 및 저장
        if (!state.ownerColors) state.ownerColors = {};
        state.ownerColors[newOwner] = generateRandomColor();
        
        hideOwnerForm();
        updateUI();
        saveDataToFirebase();
        showToast('소유자가 추가되었습니다.', 'success');
    } catch (error) {
        console.error('소유자 저장 에러:', error);
        showToast('소유자 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 소유자 삭제
function deleteOwner(owner) {
    try {
        // 기본 소유자는 삭제 불가
        if (owner === '쫌붕이' || owner === '스턴') {
            showToast('기본 소유자는 삭제할 수 없습니다.', 'warning');
            return;
        }
        
        // 해당 소유자의 캐릭터가 있는지 확인
        const hasCharacters = state.characters.some(char => char.owner === owner);
        
        if (hasCharacters) {
            showModal(
                `"${owner}" 소유자를 삭제하면 해당 소유자의 모든 캐릭터의 소유자가 '쫌붕이'로 변경됩니다. 계속하시겠습니까?`,
                () => {
                    // 소유자 삭제 및 캐릭터 소유자 변경
                    state.owners.delete(owner);
                    
                    // 캐릭터 소유자 변경
                    state.characters.forEach(char => {
                        if (char.owner === owner) {
                            char.owner = '쫌붕이';
                        }
                    });
                    
                    updateUI();
                    saveDataToFirebase();
                    showToast(`"${owner}" 소유자가 삭제되었습니다.`, 'success');
                }
            );
        } else {
            // 캐릭터가 없는 경우 즉시 삭제
            state.owners.delete(owner);
            updateUI();
            saveDataToFirebase();
            showToast(`"${owner}" 소유자가 삭제되었습니다.`, 'success');
        }
    } catch (error) {
        console.error('소유자 삭제 에러:', error);
        showToast('소유자 삭제 중 오류가 발생했습니다.', 'error');
    }
}



//캐릭터 색상//
