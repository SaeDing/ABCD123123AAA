// Firebase 설정
const firebaseConfig = {
    databaseURL: "https://liesheep-default-rtdb.firebaseio.com",
    projectId: "liesheep"
};


// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 기부 정보 테이블 (상수)
const DONATION_INFO = [
    { level: 1, diamonds: 0, arti: 2000, coins: 200, exp: 2000, contribution: 2000 },
    { level: 2, diamonds: 500, arti: 5000, coins: 500, exp: 5000, contribution: 5000 },
    { level: 3, diamonds: 1000, arti: 10000, coins: 1000, exp: 10000, contribution: 10000 }
];

// DOM 요소들
const elements = {
    // 공지사항 관련
    editNoticeBtn: document.getElementById('edit-notice'),
    noticeDisplay: document.getElementById('notice-display'),
    noticeEdit: document.getElementById('notice-edit'),
    noticeText: document.getElementById('notice-text'),
    saveNoticeBtn: document.getElementById('save-notice'),
    cancelNoticeBtn: document.getElementById('cancel-notice'),
    
    // 자원 관련
    totalArti: document.getElementById('total-arti'),
    totalCoins: document.getElementById('total-coins'),
    totalExp: document.getElementById('total-exp'),
    totalContribution: document.getElementById('total-contribution'),
    resourcesChart: document.getElementById('resources-chart'),
    editResourceBtns: document.querySelectorAll('.edit-resource-btn'),
    resourcesTabs: document.getElementById('resources-tabs'),
    resourcesContents: document.querySelectorAll('.resources-content'),
    dynamicOwnerResources: document.getElementById('dynamic-owner-resources'),
    
    // 자원 수정 모달
    resourceEditModal: document.getElementById('resource-edit-modal'),
    resourceEditLabel: document.getElementById('resource-edit-label'),
    resourceEditValue: document.getElementById('resource-edit-value'),
    resourceEditConfirm: document.getElementById('resource-edit-confirm'),
    resourceEditCancel: document.getElementById('resource-edit-cancel'),
    
    // 캐릭터 수정 모달
    characterEditModal: document.getElementById('character-edit-modal'),
    editCharName: document.getElementById('edit-char-name'),
    editCharLevel: document.getElementById('edit-char-level'),
    editCharDiamonds: document.getElementById('edit-char-diamonds'),
    characterEditConfirm: document.getElementById('character-edit-confirm'),
    characterEditCancel: document.getElementById('character-edit-cancel'),
    
    // 소유자 관련
    addOwnerBtn: document.getElementById('add-owner-btn'),
    ownerForm: document.getElementById('owner-form'),
    saveOwnerBtn: document.getElementById('save-owner'),
    cancelOwnerBtn: document.getElementById('cancel-owner'),
    newOwner: document.getElementById('new-owner'),
    ownerList: document.getElementById('owner-list'),
    
    // 캐릭터 관련
    addCharacterBtn: document.getElementById('add-character-btn'),
    deleteSelectedCharsBtn: document.getElementById('delete-selected-chars'),
    characterForm: document.getElementById('character-form'),
    saveCharacterBtn: document.getElementById('save-character'),
    cancelCharacterBtn: document.getElementById('cancel-character'),
    charName: document.getElementById('char-name'),
    charLevel: document.getElementById('char-level'),
    charDiamonds: document.getElementById('char-diamonds'),
    charOwner: document.getElementById('char-owner'),
    characterList: document.getElementById('character-list'),
    ownerFilter: document.getElementById('owner-filter'),
    characterSearch: document.getElementById('character-search'),
    
    // 기부 컨트롤
    donateSelected: document.getElementById('donate-selected'),
    donateAll: document.getElementById('donate-all'),
    resetSelectedDonations: document.getElementById('reset-selected-donations'),
    
    // 모달
    confirmModal: document.getElementById('confirm-modal'),
    modalMessage: document.getElementById('modal-message'),
    modalConfirm: document.getElementById('modal-confirm'),
    modalCancel: document.getElementById('modal-cancel'),
    
    // 토스트 및 상태
    toast: document.getElementById('toast'),
    saveStatus: document.getElementById('save-status'),

    // 리셋 버튼
    resetDonations: document.getElementById('reset-donations'),
    lastResetDate: document.getElementById('last-reset-date'),
    
    // 기부 로그
    donationLogContent: document.getElementById('donation-log-content')
};


// 리소스 차트 객체들
let resourcesCharts = {
    'all': null
};

// 현재 수정 중인 자원 타입
let currentEditingResource = null;

// 현재 수정 중인 캐릭터 ID
let currentEditingCharacterId = null;

// 자원 기본값 (수정 기능용)
const defaultResources = {
    arti: 0,
    coins: 0,
    exp: 0,
    contribution: 0
};

// 데이터 상태 객체
let state = {
    notice: '부캐작을 통해 경험치를 모아주세요!',
    initialDiamonds: 0,
    usedDiamonds: 0,
    characters: [],
    owners: new Set(['쫌붕이', '스턴']),
    selectedAction: null,
    selectedCharacters: [],
    lastResetDate: new Date().toISOString().split('T')[0],
    resources: { ...defaultResources },
    ownerResources: {},  // 소유자별 자원 수정값을 저장할 객체 추가
    donationLogs: []     // 기부 로그 추가
};

// 페이지 로드 시 데이터 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromFirebase();
    setupEventListeners();
});

// Firebase에서 데이터 로드
// Firebase에서 데이터 로드
function loadDataFromFirebase() {
    showSaveStatus('로드 중...', 'saving');
    
    database.ref('guildData').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                // 소유자 목록을 Set으로 먼저 변환
                const ownersSet = new Set(['쫌붕이', '스턴']);
                
                // 기존 데이터가 있으면 소유자 목록에 추가
                if (data.characters) {
                    data.characters.forEach(char => {
                        if (char.owner) {
                            ownersSet.add(char.owner);
                        }
                    });
                }
                
                // 상태 업데이트 (주요 객체들은 개별적으로 처리)
                state = {
                    ...state,
                    ...data,
                    owners: ownersSet,
                    resources: data.resources || { ...defaultResources },
                    ownerResources: data.ownerResources || {},
                    ownerColors: data.ownerColors || DEFAULT_OWNER_COLORS,
                    donationLogs: data.donationLogs || [] // 로그 데이터 로드 확인
                };
                
                // 콘솔에 로그 데이터 확인 (디버깅용)
                console.log("로드된 기부 로그:", state.donationLogs ? state.donationLogs.length : 0);
                
                // 캐릭터 데이터 유효성 검사 및 수정
                if (state.characters) {
                    state.characters.forEach(char => {
                        // 기존 캐릭터에 diamonds 속성이 없으면 기본값으로 20000 설정
                        if (char.diamonds === undefined || char.diamonds === null) {
                            char.diamonds = 20000;
                        }
                        // 기부 레벨이 없으면 0으로 초기화
                        if (char.donationLevel === undefined || char.donationLevel === null) {
                            char.donationLevel = 0;
                        }
                        // 기부 횟수가 없으면 0으로 초기화
                        if (char.donationCount === undefined || char.donationCount === null) {
                            char.donationCount = 0;
                        }
                    });
                } else {
                    state.characters = [];
                }
                
                // UI 업데이트
                updateUI();
                showSaveStatus('데이터 로드 완료', 'saved');
            } else {
                showSaveStatus('데이터가 없습니다. 새로 시작합니다.', 'saved');
            }
        })
        .catch(error => {
            console.error('데이터 로드 에러:', error);
            showSaveStatus('데이터 로드 실패', 'error');
            showToast('데이터를 불러오는데 문제가 발생했습니다.', 'error');
        });
}

// Firebase에 데이터 저장
function saveDataToFirebase() {
    showSaveStatus('저장 중...', 'saving');
    
    // 로그 데이터가 너무 커지지 않도록 최근 500개만 저장 (선택 사항)
    let logsToSave = state.donationLogs || [];
    if (logsToSave.length > 500) {
        logsToSave = logsToSave.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 500);
    }
    
    const dataToSave = {
        notice: state.notice,
        initialDiamonds: state.initialDiamonds,
        usedDiamonds: state.usedDiamonds,
        characters: state.characters,
        lastResetDate: state.lastResetDate,
        resources: state.resources,
        ownerResources: state.ownerResources,
        ownerColors: state.ownerColors,
        donationLogs: logsToSave // 로그 데이터 저장 확인
    };
    
    // 콘솔에 저장되는 로그 데이터 확인 (디버깅용)
    console.log("저장되는 기부 로그:", logsToSave ? logsToSave.length : 0);
    
    database.ref('guildData').set(dataToSave)
        .then(() => {
            showSaveStatus('저장 완료', 'saved');
        })
        .catch(error => {
            console.error('데이터 저장 에러:', error);
            showSaveStatus('저장 실패', 'error');
            showToast('데이터를 저장하는데 문제가 발생했습니다.', 'error');
        });
}
// 이벤트 리스너 설정
function setupEventListeners() {
    // 전체 선택 버튼
    const selectAllVisibleBtn = document.getElementById('select-all-visible');
    if (selectAllVisibleBtn) {
        selectAllVisibleBtn.addEventListener('click', selectAllVisibleCharacters);
    }

    // 공지사항 관련
    if (elements.editNoticeBtn) elements.editNoticeBtn.addEventListener('click', toggleNoticeEdit);
    if (elements.saveNoticeBtn) elements.saveNoticeBtn.addEventListener('click', saveNotice);
    if (elements.cancelNoticeBtn) elements.cancelNoticeBtn.addEventListener('click', cancelNoticeEdit);
    
    // 자원 수정 관련
    if (elements.editResourceBtns) {
        elements.editResourceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceType = e.currentTarget.dataset.resource;
                const owner = e.currentTarget.dataset.owner || 'all'; // owner 속성 추가
                showResourceEditModal(resourceType, owner);
            });
        });
    }
    
    if (elements.resourceEditConfirm) elements.resourceEditConfirm.addEventListener('click', saveResourceEdit);
    if (elements.resourceEditCancel) elements.resourceEditCancel.addEventListener('click', hideResourceEditModal);
    
    // 자원 탭 클릭 이벤트
    const resourceTabs = document.querySelectorAll('.resources-tab');
    if (resourceTabs) {
        resourceTabs.forEach(tab => {
            tab.addEventListener('click', () => switchResourceTab(tab.dataset.owner));
        });
    }
    
    // 소유자 관련
    if (elements.addOwnerBtn) elements.addOwnerBtn.addEventListener('click', showOwnerForm);
    if (elements.saveOwnerBtn) elements.saveOwnerBtn.addEventListener('click', saveOwner);
    if (elements.cancelOwnerBtn) elements.cancelOwnerBtn.addEventListener('click', hideOwnerForm);
    
    // 캐릭터 관련
    if (elements.addCharacterBtn) elements.addCharacterBtn.addEventListener('click', showCharacterForm);
    if (elements.deleteSelectedCharsBtn) elements.deleteSelectedCharsBtn.addEventListener('click', deleteSelectedCharacters);
    if (elements.saveCharacterBtn) elements.saveCharacterBtn.addEventListener('click', saveCharacter);
    if (elements.cancelCharacterBtn) elements.cancelCharacterBtn.addEventListener('click', hideCharacterForm);
    if (elements.ownerFilter) elements.ownerFilter.addEventListener('change', filterCharacters);
    if (elements.characterSearch) elements.characterSearch.addEventListener('input', searchCharacters);
    
    // 캐릭터 수정 모달 관련
    if (elements.characterEditConfirm) elements.characterEditConfirm.addEventListener('click', saveCharacterEdit);
    if (elements.characterEditCancel) elements.characterEditCancel.addEventListener('click', hideCharacterEditModal);
    
    // 기부 관련
    if (elements.donateSelected) elements.donateSelected.addEventListener('click', donateSelected);
    if (elements.donateAll) elements.donateAll.addEventListener('click', donateAll);
    if (elements.resetSelectedDonations) elements.resetSelectedDonations.addEventListener('click', resetSelectedCharacterDonations);
    
    // 모달 관련
    if (elements.modalConfirm) elements.modalConfirm.addEventListener('click', confirmAction);
    if (elements.modalCancel) elements.modalCancel.addEventListener('click', cancelAction);
    
    // 리셋 버튼
    if (elements.resetDonations) {
        elements.resetDonations.addEventListener('click', resetDonationStatus);
    }
    
    // 애니메이션 효과 추가
    addAnimationEffects();
}

// UI 업데이트 (통합)
function updateUI() {
    // 공지사항 업데이트
    if (elements.noticeDisplay) elements.noticeDisplay.innerHTML = `<p>${state.notice}</p>`;
    if (elements.noticeText) elements.noticeText.value = state.notice;
    
    // 마지막 리셋 날짜 표시
    if (elements.lastResetDate) {
        elements.lastResetDate.textContent = state.lastResetDate || new Date().toISOString().split('T')[0];
    }
    
    // 누적 자원 업데이트
    updateResourceTotals();
    
    // 소유자별 자원 탭 업데이트
    updateResourceTabs();
    
    // 전체 탭의 수정 버튼 비활성화
    const allTabContent = document.querySelector('.resources-content[data-owner="all"]');
    if (allTabContent) {
        const editButtons = allTabContent.querySelectorAll('.edit-resource-btn');
        editButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.display = 'none'; // 완전히 숨기기
        });
    }

    // 소유자 목록 업데이트
    updateOwnerList();
    
    // 캐릭터 목록 업데이트
    updateCharacterList();
    
    // 소유자 필터 업데이트
    updateOwnerFilter();
    
    // 리소스 차트 업데이트
    updateResourcesCharts();

    // 추가: 기부 로그 업데이트
    updateDonationLogs();
}

// 공지사항 수정 토글
function toggleNoticeEdit() {
    try {
        if (elements.noticeDisplay && elements.noticeEdit) {
            elements.noticeDisplay.classList.toggle('hidden');
            elements.noticeEdit.classList.toggle('hidden');
            if (elements.noticeText) elements.noticeText.focus();
        }
    } catch (error) {
        console.error('공지사항 토글 에러:', error);
        showToast('공지사항 수정 중 오류가 발생했습니다.', 'error');
    }
}

// 공지사항 저장
function saveNotice() {
    try {
        if (!elements.noticeText) return;
        state.notice = elements.noticeText.value.trim();
        
        if (elements.noticeDisplay) {
            elements.noticeDisplay.innerHTML = `<p>${state.notice}</p>`;
            elements.noticeDisplay.classList.remove('hidden');
        }
        
        if (elements.noticeEdit) {
            elements.noticeEdit.classList.add('hidden');
        }
        
        saveDataToFirebase();
        showToast('공지사항이 저장되었습니다.', 'success');
    } catch (error) {
        console.error('공지사항 저장 에러:', error);
        showToast('공지사항 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 공지사항 수정 취소
function cancelNoticeEdit() {
    try {
        if (elements.noticeText) elements.noticeText.value = state.notice;
        if (elements.noticeDisplay) elements.noticeDisplay.classList.remove('hidden');
        if (elements.noticeEdit) elements.noticeEdit.classList.add('hidden');
    } catch (error) {
        console.error('공지사항 수정 취소 에러:', error);
        showToast('공지사항 수정 취소 중 오류가 발생했습니다.', 'error');
    }
}

// 모달 표시
function showModal(message, confirmCallback) {
    try {
        if (elements.modalMessage && elements.confirmModal) {
            elements.modalMessage.innerHTML = message.replace(/\n/g, '<br>');
            elements.confirmModal.classList.add('show');
            
            // 확인 버튼 콜백 설정
            state.confirmCallback = confirmCallback;
        }
    } catch (error) {
        console.error('모달 표시 에러:', error);
        
        // 오류 발생 시 직접 콜백 실행
        if (confirmCallback) confirmCallback();
    }
}

// 모달 액션 확인
function confirmAction() {
    try {
        if (elements.confirmModal) {
            elements.confirmModal.classList.remove('show');
        }
        
        if (state.confirmCallback) {
            state.confirmCallback();
            state.confirmCallback = null;
        }
    } catch (error) {
        console.error('모달 액션 확인 에러:', error);
    }
}

// 모달 액션 취소
function cancelAction() {
    try {
        if (elements.confirmModal) {
            elements.confirmModal.classList.remove('show');
        }
        state.confirmCallback = null;
    } catch (error) {
        console.error('모달 액션 취소 에러:', error);
    }
}

// 저장 상태 표시
function showSaveStatus(message, status) {
    try {
        if (elements.saveStatus) {
            elements.saveStatus.textContent = message;
            elements.saveStatus.className = 'save-status';
            
            if (status) {
                elements.saveStatus.classList.add(status);
            }
            
            setTimeout(() => {
                if (elements.saveStatus) {
                    elements.saveStatus.textContent = '자동 저장됨';
                    elements.saveStatus.className = 'save-status saved';
                }
            }, 2000);
        }
    } catch (error) {
        console.error('저장 상태 표시 에러:', error);
    }
}

// 토스트 알림 표시
function showToast(message, type = 'info') {
    try {
        const toast = elements.toast;
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        
        if (type) {
            toast.classList.add(type);
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } catch (error) {
        console.error('토스트 알림 표시 에러:', error);
    }
}

// 숫자 포맷팅
function formatNumber(number) {
    try {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('숫자 포맷팅 에러:', error);
        return number;
    }
}

// 애니메이션 효과 추가
function addAnimationEffects() {
    try {
        // gsap이 없는 경우 중단
        if (typeof gsap === 'undefined') return;
        
        // 버튼 호버 효과
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                gsap.to(this, { scale: 1.05, duration: 0.2, ease: "power1.out" });
            });
            
            btn.addEventListener('mouseleave', function() {
                gsap.to(this, { scale: 1, duration: 0.2, ease: "power1.in" });
            });
        });
        
        // 리소스 카드 호버 효과
        document.querySelectorAll('.resource').forEach(card => {
            card.addEventListener('mouseenter', function() {
                gsap.to(this, { y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.3)", duration: 0.3 });
            });
            
            card.addEventListener('mouseleave', function() {
                gsap.to(this, { y: 0, boxShadow: "0 4px 8px rgba(0,0,0,0.2)", duration: 0.3 });
            });
        });
    } catch (error) {
        console.error('애니메이션 효과 추가 에러:', error);
    }
}


const DEFAULT_OWNER_COLORS = {
    '쫌붕이': '#8a2be2', // 보라색
    '스턴': '#00b4d8',   // 하늘색
};

// 5. 헥스 색상 코드를 RGB로 변환하는 유틸리티 함수 - core.js에 추가
function hexToRgb(hex) {
    // 헥스 코드에서 # 제거
    hex = hex.replace('#', '');
    
    // 3자리 헥스 코드를 6자리로 변환 (#ABC -> #AABBCC)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    // RGB 값 계산
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// 9. 랜덤 색상 생성 함수 - core.js에 추가
function generateRandomColor() {
    // 기본 색상 배열 (부드러운 색상들)
    const colors = [
        '#8a2be2', // 보라색
        '#00b4d8', // 하늘색
        '#4caf50', // 녹색
        '#ff9800', // 주황색
        '#e91e63', // 분홍색
        '#3f51b5', // 남색
        '#009688', // 청록색
        '#f44336', // 빨간색
        '#9c27b0', // 자주색
        '#607d8b'  // 청회색
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}
