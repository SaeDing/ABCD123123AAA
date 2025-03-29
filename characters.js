// 캐릭터 카드 생성
function createCharacterCard(character) {
    try {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = character.id;
        
        // 소유자 색상 적용
        const ownerColor = state.ownerColors[character.owner] || '#8a2be2'; // 기본값
        card.style.borderLeft = `3px solid ${ownerColor}`;

        // 기부 완료 뱃지 (모든 기부 완료 시)
        if (character.donationLevel >= 3) {
            const badge = document.createElement('div');
            badge.className = 'completed-badge';
            badge.innerHTML = '<i class="fas fa-check"></i>';
            card.appendChild(badge);
        }
        
        // 메모 표시 (맨 위에 배치)
        if (character.memo) {
            const memoDiv = document.createElement('div');
            memoDiv.className = 'character-memo';
            memoDiv.innerHTML = `<i class="fas fa-sticky-note"></i> ${character.memo}`;
            card.appendChild(memoDiv);
        }
        
        // 카드 헤더
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        
        // 현재 다이아 기준으로 남은 기부 횟수 계산
        const diamonds = character.diamonds || 0;
        const remainingDonations = Math.max(0, Math.floor(diamonds / 1500));
        
        // 이름과 남은 기부 횟수 표시
        cardTitle.innerHTML = `
            <div style="display: flex; align-items: center;">
                <h4 style="margin-right: 8px;">${character.name}</h4>
                <span class="donation-count-badge" style="background-color: #4caf50; font-size: 10px;">남은기부 ${remainingDonations}회</span>
            </div>
        `;
        
        // 레벨, 다이아, 기부횟수 표시
        const levelBadge = document.createElement('div');
        levelBadge.className = 'card-details';
        
        // 캐릭터 기부횟수 확인
        const donationCount = character.donationCount || 0;
        
        levelBadge.innerHTML = `
            <span class="level-badge">Lv.${character.level}</span>
            <span style="margin: 0 2px;"></span>
            <span class="diamonds-badge">💎 ${formatNumber(diamonds)}</span>
            <span style="margin: 0 2px;"></span>
            <span class="donation-count-badge">기부 ${donationCount}회</span>
        `;
        cardTitle.appendChild(levelBadge);
        
        // 카드 헤더에는 이제 카드 타이틀만 포함
        cardHeader.appendChild(cardTitle);
        
        // 카드 조립
        card.appendChild(cardHeader);
        
        // 기부 진행 상황
        const donationProgress = document.createElement('div');
        donationProgress.className = 'donation-progress';
        
        for (let i = 0; i < 3; i++) {
            const step = document.createElement('div');
            step.className = 'progress-step';
            if (i < character.donationLevel) {
                step.classList.add('completed');
                step.innerHTML = `<i class="fas fa-check"></i>`;
            } else if (i === character.donationLevel) {
                step.classList.add('active');
                step.textContent = `${i + 1}회차`;
            } else {
                step.textContent = `${i + 1}회차`;
            }
            donationProgress.appendChild(step);
        }
        
        card.appendChild(donationProgress);
        
        // 기부 버튼 영역
        const donationButtons = document.createElement('div');
        donationButtons.className = 'character-donation-buttons';
        
        if (character.donationLevel < 3) {
            // 1회 기부 버튼
            const donateBtn = document.createElement('button');
            donateBtn.className = 'btn btn-small btn-primary donate-btn';
            donateBtn.innerHTML = `<i class="fas fa-plus"></i> 1회 기부`;
            donateBtn.addEventListener('click', () => donateSingleCharacter(character.id, 1));
            
            // 최대 기부 버튼
            const donateMaxBtn = document.createElement('button');
            donateMaxBtn.className = 'btn btn-small btn-secondary donate-max-btn';
            donateMaxBtn.innerHTML = `<i class="fas fa-arrow-up"></i> 최대 기부`;
            donateMaxBtn.addEventListener('click', () => donateSingleCharacter(character.id, 3 - character.donationLevel));
            
            donationButtons.appendChild(donateBtn);
            donationButtons.appendChild(donateMaxBtn);
        } else {
            const completedMessage = document.createElement('div');
            completedMessage.className = 'donation-completed-message';
            completedMessage.innerHTML = '<i class="fas fa-check-circle"></i> 모든 기부 완료';
            donationButtons.appendChild(completedMessage);
        }
        
        card.appendChild(donationButtons);
        
        // 선택 체크박스와 버튼들을 포함하는 하단 영역
        const bottomSection = document.createElement('div');
        bottomSection.style.display = 'flex';
        bottomSection.style.justifyContent = 'space-between';
        bottomSection.style.alignItems = 'center';
        bottomSection.style.marginTop = '8px';
        
        // 선택 체크박스
        const charSelect = document.createElement('div');
        charSelect.className = 'char-select';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `select-${character.id}`;
        checkbox.dataset.id = character.id;
        
        const label = document.createElement('label');
        label.htmlFor = `select-${character.id}`;
        label.textContent = '일괄 기부용 선택';
        
        charSelect.appendChild(checkbox);
        charSelect.appendChild(label);
        
        // 액션 버튼들
        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';
        cardActions.style.display = 'flex';
        cardActions.style.gap = '8px';
        
        // 수정 버튼 (톱니바퀴 아이콘)
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-character-btn';
        editBtn.innerHTML = '<i class="fas fa-cog"></i>';
        editBtn.title = '캐릭터 정보 수정';
        editBtn.addEventListener('click', () => editCharacter(character.id));
        
        // 메모 버튼
        const memoBtn = document.createElement('button');
        memoBtn.className = 'memo-btn';
        memoBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
        memoBtn.title = '메모 추가';
        memoBtn.addEventListener('click', () => addCharacterMemo(character.id));
        
        // 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = '캐릭터 삭제';
        deleteBtn.addEventListener('click', () => deleteCharacter(character.id));
        
        cardActions.appendChild(editBtn);
        cardActions.appendChild(memoBtn);
        cardActions.appendChild(deleteBtn);
        
        // 하단 영역에 체크박스와 버튼들 추가
        bottomSection.appendChild(charSelect);
        bottomSection.appendChild(cardActions);
        
        card.appendChild(bottomSection);

        return card;
    } catch (error) {
        console.error('캐릭터 카드 생성 에러:', error);
        
        // 기본 카드 반환
        const errorCard = document.createElement('div');
        errorCard.className = 'character-card';
        errorCard.dataset.id = character.id;
        errorCard.innerHTML = `<h4>${character.name || '알 수 없는 캐릭터'}</h4><p>에러 발생</p>`;
        return errorCard;
    }
}

// 캐릭터 목록 업데이트
function updateCharacterList(searchTerm = '') {
    try {
        const ownerFilter = elements.ownerFilter ? elements.ownerFilter.value : 'all';
        if (elements.characterList) elements.characterList.innerHTML = '';
        else return;
        
        // 소유자별로 그룹화
        const charactersByOwner = {};
        
        state.characters.forEach(char => {
            const owner = char.owner || '소유자 미지정';
            
            // 검색어 필터링
            const matchesSearch = !searchTerm || 
                char.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (char.memo && char.memo.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // 필터가 '모든 소유자'이거나 현재 소유자와 일치하고, 검색어와 일치할 때만 표시
            if ((ownerFilter === 'all' || ownerFilter === owner) && matchesSearch) {
                if (!charactersByOwner[owner]) {
                    charactersByOwner[owner] = [];
                }
                charactersByOwner[owner].push(char);
            }
        });
        
        // 그룹별로 캐릭터 목록 생성
        const sortedOwners = Object.keys(charactersByOwner).sort();
        
        if (sortedOwners.length === 0 && searchTerm) {
            // 검색 결과가 없을 때
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <p>'${searchTerm}'에 대한 검색 결과가 없습니다.</p>
            `;
            elements.characterList.appendChild(noResults);
            return;
        }
        
        sortedOwners.forEach(owner => {
            const group = createCharacterGroup(owner, charactersByOwner[owner]);
            elements.characterList.appendChild(group);
            
            // 그룹 애니메이션
            if (typeof gsap !== 'undefined') {
                gsap.from(group, {
                    y: 20,
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: 0.1
                });
            }
        });
    } catch (error) {
        console.error('캐릭터 목록 업데이트 에러:', error);
        showToast('캐릭터 목록 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 그룹 생성
function createCharacterGroup(owner, characters) {
    try {
        const group = document.createElement('div');
        group.className = 'character-group';
        
        // 소유자 색상 적용
        const ownerColor = state.ownerColors[owner] || '#8a2be2'; // 기본값
        
        // 그룹 헤더
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.style.background = `rgba(${hexToRgb(ownerColor)}, 0.1)`;
        groupHeader.style.borderBottom = `1px solid ${ownerColor}`;
        groupHeader.innerHTML = `
            <h3><i class="fas fa-user-friends"></i> ${owner} (${characters.length}명)</h3>
            <div class="group-actions"></div>
        `;
        
        // 캐릭터 카드 컨테이너
        const characterCards = document.createElement('div');
        characterCards.className = 'character-cards';
        
        // 캐릭터 카드 생성
        characters.forEach(char => {
            const card = createCharacterCard(char);
            characterCards.appendChild(card);
        });
        
        group.appendChild(groupHeader);
        group.appendChild(characterCards);
        
        return group;
    } catch (error) {
        console.error('캐릭터 그룹 생성 에러:', error);
        
        // 기본 그룹 반환
        const errorGroup = document.createElement('div');
        errorGroup.className = 'character-group';
        errorGroup.innerHTML = `<h3>${owner || '알 수 없는 소유자'}</h3><p>에러 발생</p>`;
        return errorGroup;
    }
}

// 캐릭터 정보 수정 모달 표시
function editCharacter(characterId) {
    try {
        const character = state.characters.find(char => char.id === characterId);
        if (!character) return;
        
        currentEditingCharacterId = characterId;
        
        // 현재 정보 설정
        if (elements.editCharName) elements.editCharName.value = character.name;
        if (elements.editCharLevel) elements.editCharLevel.value = character.level;
        if (elements.editCharDiamonds) elements.editCharDiamonds.value = character.diamonds;
        
        // 모달 표시
        if (elements.characterEditModal) {
            elements.characterEditModal.classList.add('show');
            if (elements.editCharName) elements.editCharName.focus();
        }
    } catch (error) {
        console.error('캐릭터 수정 모달 표시 에러:', error);
        showToast('캐릭터 수정 모달 표시 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 정보 수정 저장
function saveCharacterEdit() {
    try {
        if (!currentEditingCharacterId) return;
        
        const characterIndex = state.characters.findIndex(char => char.id === currentEditingCharacterId);
        if (characterIndex === -1) return;
        
        if (!elements.editCharName || !elements.editCharLevel || !elements.editCharDiamonds) return;
        
        const name = elements.editCharName.value.trim();
        const level = parseInt(elements.editCharLevel.value) || 1;
        const diamonds = parseInt(elements.editCharDiamonds.value) || 0;
        
        if (!name) {
            showToast('캐릭터 이름을 입력해주세요.', 'warning');
            return;
        }
        
        // 상태 업데이트
        state.characters[characterIndex].name = name;
        state.characters[characterIndex].level = level;
        state.characters[characterIndex].diamonds = diamonds;
        
        // UI 업데이트
        updateCharacterList();
        
        // 모달 닫기
        hideCharacterEditModal();
        
        // 저장
        saveDataToFirebase();
        showToast('캐릭터 정보가 수정되었습니다.', 'success');
    } catch (error) {
        console.error('캐릭터 수정 저장 에러:', error);
        showToast('캐릭터 수정 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 정보 수정 모달 닫기
function hideCharacterEditModal() {
    try {
        if (elements.characterEditModal) {
            elements.characterEditModal.classList.remove('show');
        }
        currentEditingCharacterId = null;
    } catch (error) {
        console.error('캐릭터 수정 모달 닫기 에러:', error);
    }
}

// 캐릭터 추가 폼 표시
function showCharacterForm() {
    try {
        if (elements.characterForm) {
            elements.characterForm.classList.remove('hidden');
            if (elements.charName) elements.charName.focus();
        }
        
        // 애니메이션 효과
        if (typeof gsap !== 'undefined' && elements.characterForm) {
            gsap.from(elements.characterForm, {
                y: -20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    } catch (error) {
        console.error('캐릭터 추가 폼 표시 에러:', error);
        showToast('캐릭터 추가 폼 표시 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 추가 폼 숨김
function hideCharacterForm() {
    try {
        // 애니메이션으로 숨기기
        if (typeof gsap !== 'undefined' && elements.characterForm) {
            gsap.to(elements.characterForm, {
                y: -20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (elements.characterForm) elements.characterForm.classList.add('hidden');
                    if (elements.charName) elements.charName.value = '';
                    if (elements.charLevel) elements.charLevel.value = '';
                    if (elements.charDiamonds) elements.charDiamonds.value = '';
                    // 폼 초기화 후 다시 기본 상태로
                    if (elements.characterForm) gsap.set(elements.characterForm, { y: 0, opacity: 1 });
                }
            });
        } else {
            // gsap이 없는 경우 그냥 숨김
            if (elements.characterForm) elements.characterForm.classList.add('hidden');
            if (elements.charName) elements.charName.value = '';
            if (elements.charLevel) elements.charLevel.value = '';
            if (elements.charDiamonds) elements.charDiamonds.value = '';
        }
    } catch (error) {
        console.error('캐릭터 추가 폼 숨김 에러:', error);
        // 오류 발생 시 폼을 강제로 초기화
        if (elements.characterForm) elements.characterForm.classList.add('hidden');
        if (elements.charName) elements.charName.value = '';
        if (elements.charLevel) elements.charLevel.value = '';
        if (elements.charDiamonds) elements.charDiamonds.value = '';
    }
}

// 캐릭터 저장
function saveCharacter() {
    try {
        if (!elements.charName || !elements.charLevel || !elements.charDiamonds || !elements.charOwner) return;
        
        const name = elements.charName.value.trim();
        const level = parseInt(elements.charLevel.value) || 1;
        const diamonds = parseInt(elements.charDiamonds.value) || 0;
        const owner = elements.charOwner.value;
        
        if (!name) {
            showToast('캐릭터 이름을 입력해주세요.', 'warning');
            return;
        }
        
        const newCharacter = {
            id: Date.now().toString(),
            name,
            level,
            diamonds,
            owner,
            donationLevel: 0,
            donationCount: 0, // 기부 횟수 필드 추가
            memo: '',
            createdAt: new Date().toISOString()
        };
        
        state.characters.push(newCharacter);
        
        hideCharacterForm();
        updateUI();
        saveDataToFirebase();
        
        // 애니메이션 효과로 토스트 표시
        showToast('캐릭터가 추가되었습니다.', 'success');
    } catch (error) {
        console.error('캐릭터 저장 에러:', error);
        showToast('캐릭터 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 검색
function searchCharacters() {
    try {
        if (elements.characterSearch) {
            const searchTerm = elements.characterSearch.value.toLowerCase().trim();
            updateCharacterList(searchTerm);
        }
    } catch (error) {
        console.error('캐릭터 검색 에러:', error);
        showToast('캐릭터 검색 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 삭제
function deleteCharacter(characterId) {
    try {
        const character = state.characters.find(char => char.id === characterId);
        
        if (character) {
            showModal(
                `정말로 "${character.name}" 캐릭터를 삭제하시겠습니까?`,
                () => {
                    state.characters = state.characters.filter(char => char.id !== characterId);
                    
                    updateUI();
                    saveDataToFirebase();
                    showToast('캐릭터가 삭제되었습니다.', 'success');
                }
            );
        }
    } catch (error) {
        console.error('캐릭터 삭제 에러:', error);
        showToast('캐릭터 삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 캐릭터 메모 추가
function addCharacterMemo(characterId) {
    try {
        const character = state.characters.find(char => char.id === characterId);
        
        if (character) {
            const memo = prompt('캐릭터 메모를 입력하세요:', character.memo || '');
            
            if (memo !== null) {
                character.memo = memo.trim();
                updateUI();
                saveDataToFirebase();
                
                if (memo.trim()) {
                    showToast('메모가 저장되었습니다.', 'success');
                } else {
                    showToast('메모가 삭제되었습니다.', 'success');
                }
            }
        }
    } catch (error) {
        console.error('캐릭터 메모 추가 에러:', error);
        showToast('캐릭터 메모 추가 중 오류가 발생했습니다.', 'error');
    }
}

// 선택한 캐릭터 삭제 처리
function deleteSelectedCharacters() {
    try {
        const checkboxes = document.querySelectorAll('.char-select input[type="checkbox"]:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.id);
        
        if (selectedIds.length === 0) {
            showToast('삭제할 캐릭터를 선택해주세요.', 'warning');
            return;
        }
        
        const selectedCharacters = state.characters.filter(char => selectedIds.includes(char.id));
        const characterNames = selectedCharacters.map(char => char.name).join(', ');
        
        showModal(
            `정말로 선택한 ${selectedIds.length}명의 캐릭터를 삭제하시겠습니까?\n${characterNames}`,
            () => {
                state.characters = state.characters.filter(char => !selectedIds.includes(char.id));
                
                updateUI();
                saveDataToFirebase();
                showToast(`${selectedIds.length}명의 캐릭터가 삭제되었습니다.`, 'success');
            }
        );
    } catch (error) {
        console.error('선택한 캐릭터 삭제 에러:', error);
        showToast('선택한 캐릭터 삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 소유자별로 필터링
function filterCharacters() {
    updateCharacterList();
}

// 선택된 캐릭터의 기부 횟수 초기화 및 자원 회수
function resetSelectedCharacterDonations() {
    try {
        const checkboxes = document.querySelectorAll('.char-select input[type="checkbox"]:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.id);
        
        if (selectedIds.length === 0) {
            showToast('기부 횟수를 초기화할 캐릭터를 선택해주세요.', 'warning');
            return;
        }
        
        // 3회차인 캐릭터만 필터링
        const selected3Characters = state.characters.filter(char => 
            selectedIds.includes(char.id) && char.donationLevel >= 3);
        
        if (selected3Characters.length === 0) {
            showToast('선택된 캐릭터 중 3회차 기부 완료된 캐릭터가 없습니다.', 'warning');
            return;
        }
        
        const characterNames = selected3Characters.map(char => char.name).join(', ');
        
        // 총 회수할 자원 및 환불할 다이아 계산
        let totalRefundDiamonds = 0;
        let totalRecoverArti = 0;
        let totalRecoverCoins = 0;
        let totalRecoverExp = 0;
        let totalRecoverContribution = 0;
        
        // 소유자별 회수 자원 계산
        const ownerResourcesRecover = {};
        
        // 각 캐릭터별 회수 자원 계산
        selected3Characters.forEach(char => {
            const donationLevel = char.donationLevel || 0;
            const owner = char.owner || '소유자 미지정';
            
            // 소유자별 자원 회수 추적을 위한 초기화
            if (!ownerResourcesRecover[owner]) {
                ownerResourcesRecover[owner] = {
                    arti: 0,
                    coins: 0,
                    exp: 0,
                    contribution: 0
                };
            }
            
            // 이 캐릭터로부터 회수할 자원 계산
            let charRecoverArti = 0;
            let charRecoverCoins = 0;
            let charRecoverExp = 0;
            let charRecoverContribution = 0;
            let charRefundDiamonds = 0;
            
            for (let i = 0; i < donationLevel; i++) {
                if (i < DONATION_INFO.length) {
                    // 회수할 자원량 누적
                    charRecoverArti += DONATION_INFO[i].arti;
                    charRecoverCoins += DONATION_INFO[i].coins;
                    charRecoverExp += DONATION_INFO[i].exp;
                    charRecoverContribution += DONATION_INFO[i].contribution;
                    
                    // 환불할 다이아 누적
                    charRefundDiamonds += DONATION_INFO[i].diamonds;
                }
            }
            
            // 소유자별 자원 회수 누적
            ownerResourcesRecover[owner].arti += charRecoverArti;
            ownerResourcesRecover[owner].coins += charRecoverCoins;
            ownerResourcesRecover[owner].exp += charRecoverExp;
            ownerResourcesRecover[owner].contribution += charRecoverContribution;
            
            // 총 회수량 누적
            totalRecoverArti += charRecoverArti;
            totalRecoverCoins += charRecoverCoins;
            totalRecoverExp += charRecoverExp;
            totalRecoverContribution += charRecoverContribution;
            totalRefundDiamonds += charRefundDiamonds;
        });
        
        showModal(
            `선택한 ${selected3Characters.length}명의 3회차 캐릭터의 기부 횟수를 초기화하고 자원을 회수합니다.\n\n총 회수 자원:\n아티팩트 ${formatNumber(totalRecoverArti)}\n코인 ${formatNumber(totalRecoverCoins)}\n경험치 ${formatNumber(totalRecoverExp)}\n기여도 ${formatNumber(totalRecoverContribution)}\n\n총 환불 다이아: ${formatNumber(totalRefundDiamonds)}\n\n캐릭터: ${characterNames}`,
            () => {
                // 선택된 캐릭터의 기부 횟수 초기화 및 다이아 환불
                selected3Characters.forEach(char => {
                    const characterIndex = state.characters.findIndex(c => c.id === char.id);
                    if (characterIndex !== -1) {
                        const char = state.characters[characterIndex];
                        const donationLevel = char.donationLevel || 0;
                        
                        // 환불할 다이아 계산
                        let refundDiamonds = 0;
                        for (let i = 0; i < donationLevel; i++) {
                            if (i < DONATION_INFO.length) {
                                refundDiamonds += DONATION_INFO[i].diamonds;
                            }
                        }
                        
                        // 다이아 환불
                        state.characters[characterIndex].diamonds += refundDiamonds;
                        
                        // 기부 레벨 초기화
                        state.characters[characterIndex].donationLevel = 0;
                        
                        // 기부횟수 감소 (최소 0으로 유지)
                        if (state.characters[characterIndex].donationCount > 0) {
                            state.characters[characterIndex].donationCount--;
                        }
                        
                        // 기부 로그 추가
                        addDonationLog(char.id, char.name, -1, char.owner); // -1은 초기화를 의미
                    }
                });
                
                // 소유자별 자원 회수
                Object.entries(ownerResourcesRecover).forEach(([owner, resources]) => {
                    if (!state.ownerResources[owner]) {
                        state.ownerResources[owner] = { arti: 0, coins: 0, exp: 0, contribution: 0 };
                    }
                    
                    // 현재 값에서 회수할 자원 차감
                    const currentArti = state.ownerResources[owner].arti || 0;
                    const currentCoins = state.ownerResources[owner].coins || 0;
                    const currentExp = state.ownerResources[owner].exp || 0;
                    const currentContribution = state.ownerResources[owner].contribution || 0;
                    
                    state.ownerResources[owner].arti = Math.max(0, currentArti - resources.arti);
                    state.ownerResources[owner].coins = Math.max(0, currentCoins - resources.coins);
                    state.ownerResources[owner].exp = Math.max(0, currentExp - resources.exp);
                    state.ownerResources[owner].contribution = Math.max(0, currentContribution - resources.contribution);
                });
                
                // 전체 자원에서도 차감
                if (state.resources) {
                    state.resources.arti = Math.max(0, state.resources.arti - totalRecoverArti);
                    state.resources.coins = Math.max(0, state.resources.coins - totalRecoverCoins);
                    state.resources.exp = Math.max(0, state.resources.exp - totalRecoverExp);
                    state.resources.contribution = Math.max(0, state.resources.contribution - totalRecoverContribution);
                }
                
                // 사용된 다이아에서 환불된 다이아 차감
                state.usedDiamonds = Math.max(0, state.usedDiamonds - totalRefundDiamonds);
                
                updateUI();
                saveDataToFirebase();
                showToast(`${selected3Characters.length}명의 캐릭터 기부 횟수가 초기화되고 자원이 회수되었습니다.`, 'success');
            }
        );
    } catch (error) {
        console.error('선택한 캐릭터 기부 초기화 에러:', error);
        showToast('선택한 캐릭터 기부 초기화 중 오류가 발생했습니다.', 'error');
    }
}



// 기부 로그 업데이트
function updateDonationLogs() {
    try {
        // 로그 컨테이너 확인
        const logContainer = document.getElementById('donation-log-content');
        if (!logContainer) {
            console.error('기부 로그 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 로그 컨테이너 초기화
        logContainer.innerHTML = '';
        
        // 로그가 없는 경우
        if (!state.donationLogs || state.donationLogs.length === 0) {
            logContainer.innerHTML = `
                <div class="no-logs">
                    <i class="fas fa-history"></i>
                    <p>기부 기록이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 디버깅: 콘솔에 로그 데이터 출력
        console.log("기부 로그 업데이트 중:", state.donationLogs.length);
        
        // 로그 날짜별로 그룹화
        const logsByDate = {};
        state.donationLogs.forEach(log => {
            // 로그의 날짜 부분만 추출
            const logDate = new Date(log.timestamp);
            const dateKey = `${logDate.getFullYear()}-${padZero(logDate.getMonth() + 1)}-${padZero(logDate.getDate())}`;
            
            if (!logsByDate[dateKey]) {
                logsByDate[dateKey] = [];
            }
            logsByDate[dateKey].push(log);
        });
        
        // 날짜별로 정렬된 키 배열 생성 (최근 날짜 먼저)
        const sortedDates = Object.keys(logsByDate).sort().reverse();
        
        // 각 날짜별 로그 추가
        sortedDates.forEach(dateKey => {
            // 날짜 헤더 추가
            const dateHeader = document.createElement('div');
            dateHeader.className = 'log-date-header';
            dateHeader.textContent = formatDateHeader(dateKey);
            logContainer.appendChild(dateHeader);
            
            // 해당 날짜의 로그를 시간 역순으로 정렬
            const dateChangedLogs = logsByDate[dateKey]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // 로그 항목 생성 및 추가
            dateChangedLogs.forEach(log => {
                const logItem = createLogItem(log);
                logContainer.appendChild(logItem);
            });
        });
    } catch (error) {
        console.error('기부 로그 업데이트 에러:', error);
    }
}

// 로그 아이템 생성 함수
function createLogItem(log) {
    const logItem = document.createElement('div');
    logItem.className = 'donation-log-item';
    
    // 로그 시간 포맷팅
    const logDate = new Date(log.timestamp);
    const formattedTime = `${padZero(logDate.getHours())}:${padZero(logDate.getMinutes())}`;
    
    // 기부 레벨에 따른 아이콘 및 스타일
    let levelIcon, levelClass, actionText;
    if (log.donationLevel === -1) {
        levelIcon = 'fa-undo';
        levelClass = 'log-reset';
        actionText = '기부 초기화';
    } else {
        levelIcon = 'fa-gift';
        levelClass = `log-level-${log.donationLevel}`;
        actionText = `${log.donationLevel}회차 기부 완료`;
    }
    
    // 소유자 색상 적용
    const ownerColor = state.ownerColors[log.owner] || '#8a2be2';
    
    // 로그 내용 생성
    logItem.innerHTML = `
        <div class="log-timestamp">${formattedTime}</div>
        <div class="log-icon ${levelClass}"><i class="fas ${levelIcon}"></i></div>
        <div class="log-content">
            <span class="log-character" style="color: ${ownerColor};">${log.characterName}</span>
            <span class="log-action">${actionText}</span>
        </div>
    `;
    
    return logItem;
}


// 날짜/시간 포맷팅용 함수
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 날짜 헤더 포맷팅
function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 오늘, 어제 표시
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return `오늘 (${month}월 ${day}일)`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `어제 (${month}월 ${day}일)`;
    } else {
        return `${month}월 ${day}일`;
    }
}

// 숫자에 0 패딩 추가
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 단일 캐릭터 기부 처리
function donateSingleCharacter(characterId, count = 1) {
    try {
        const character = state.characters.find(char => char.id === characterId);
        
        if (!character) {
            showToast('해당 캐릭터를 찾을 수 없습니다.', 'error');
            return;
        }
        
        if (character.donationLevel >= 3) {
            showToast('이미 모든 기부를 완료한 캐릭터입니다.', 'warning');
            return;
        }
        
        // 요청한 횟수가 남은 횟수보다 많으면 남은 횟수로 조정
        const remainingDonations = 3 - character.donationLevel;
        const donationCount = Math.min(count, remainingDonations);
        
        // 필요한 다이아 계산
        let diamondsCost = 0;
        for (let i = 0; i < donationCount; i++) {
            const currentLevel = character.donationLevel + i;
            if (currentLevel < 3) {
                diamondsCost += DONATION_INFO[currentLevel].diamonds;
            }
        }
        
        // 캐릭터 데이터에 diamonds가 없으면 기본값 설정
        if (character.diamonds === undefined || character.diamonds === null) {
            character.diamonds = 20000;
        }
        
        // 다이아 부족 여부 확인
        if (character.diamonds < diamondsCost) {
            showToast(`다이아가 부족합니다. 필요: ${formatNumber(diamondsCost)}, 보유: ${formatNumber(character.diamonds)}`, 'error');
            return;
        }
        
        // 기부 확인 모달
        showModal(
            `"${character.name}" 캐릭터의 기부를 ${donationCount}회 진행합니다. ${formatNumber(diamondsCost)} 다이아가 소모됩니다. (현재 💎: ${formatNumber(character.diamonds)}) 계속하시겠습니까?`,
            () => {
                // 기부 처리
                const characterIndex = state.characters.findIndex(c => c.id === characterId);
                
                // 캐릭터의 다이아 차감
                state.characters[characterIndex].diamonds -= diamondsCost;
                
                // 시스템 사용 다이아 증가 (통계용)
                state.usedDiamonds += diamondsCost;
                
                // 애니메이션을 위한 단계적 기부 처리
                processDonationWithAnimation(characterIndex, donationCount);
            }
        );
    } catch (error) {
        console.error('단일 캐릭터 기부 처리 에러:', error);
        showToast('단일 캐릭터 기부 처리 중 오류가 발생했습니다.', 'error');
    }
}

// 애니메이션과 함께 기부 처리
// 이 함수를 완전히 새로 작성합니다
function processDonationWithAnimation(characterIndex, count) {
    try {
        // characterIndex가 유효하지 않거나, 더 이상 기부할 횟수가 없거나, 이미 3회차를 완료한 경우
        if (characterIndex === -1 || count <= 0 || state.characters[characterIndex].donationLevel >= 3) {
            // UI 업데이트 및 저장
            updateUI();
            saveDataToFirebase();
            showToast('기부가 완료되었습니다.', 'success');
            return;
        }
        
        const character = state.characters[characterIndex];
        const currentDonationLevel = character.donationLevel;
        
        // 현재 기부 레벨 증가
        state.characters[characterIndex].donationLevel += 1;
        
        // 증가된 기부 레벨 확인
        const newDonationLevel = state.characters[characterIndex].donationLevel;
        
        // 기부 로그에 추가
        addDonationLog(character.id, character.name, newDonationLevel, character.owner);
        
        // 3회차 기부 완료했으면 기부횟수 증가
        if (newDonationLevel === 3) {
            if (state.characters[characterIndex].donationCount === undefined) {
                state.characters[characterIndex].donationCount = 0;
            }
            state.characters[characterIndex].donationCount += 1;
        }
        
        // 캐릭터 카드 요소 찾기
        const cardElement = document.querySelector(`.character-card[data-id="${character.id}"]`);
        if (cardElement && typeof gsap !== 'undefined') {
            // 진행 단계 표시에 애니메이션 적용
            const progressSteps = cardElement.querySelectorAll('.progress-step');
            if (progressSteps && progressSteps.length > currentDonationLevel) {
                const completedStep = progressSteps[currentDonationLevel];
                
                // 애니메이션 효과
                gsap.to(completedStep, {
                    backgroundColor: '#4caf50',
                    color: 'white',
                    scale: 1.1,
                    duration: 0.3,
                    onComplete: () => {
                        gsap.to(completedStep, {
                            scale: 1,
                            duration: 0.2,
                            onComplete: () => {
                                // 다음 단계 처리 (재귀)
                                setTimeout(() => {
                                    processDonationWithAnimation(characterIndex, count - 1);
                                }, 300);
                            }
                        });
                    }
                });
            } else {
                // 애니메이션 없이 진행
                setTimeout(() => {
                    processDonationWithAnimation(characterIndex, count - 1);
                }, 300);
            }
        } else {
            // DOM 요소를 찾지 못한 경우 재귀 없이 즉시 처리
            setTimeout(() => {
                processDonationWithAnimation(characterIndex, count - 1);
            }, 300);
        }
    } catch (error) {
        console.error('기부 처리 애니메이션 에러:', error);
        
        // 에러 발생 시 강제로 UI 업데이트 및 저장
        updateUI();
        saveDataToFirebase();
        showToast('기부 처리가 완료되었습니다.', 'success');
    }
}

// 기부 로그 추가 함수
function addDonationLog(characterId, characterName, donationLevel, owner) {
    try {
        if (!state.donationLogs) {
            state.donationLogs = [];
        }
        
        // 중복 체크 (최근 5초 이내 같은 캐릭터에 대한 같은 레벨 로그)
        const now = new Date();
        const recentLogs = state.donationLogs.filter(log => {
            const logTime = new Date(log.timestamp);
            const timeElapsed = now - logTime; // 밀리초 단위 시간 차이
            return (
                log.characterId === characterId &&
                log.donationLevel === donationLevel &&
                timeElapsed < 5000 // 5초 이내
            );
        });
        
        // 중복이 있으면 로그 추가하지 않음
        if (recentLogs.length > 0) {
            console.log('중복 로그 방지:', characterName, donationLevel);
            return;
        }
        
        // 고유한 ID 생성 (타임스탬프 + 랜덤값)
        const uniqueId = Date.now() + Math.random().toString(36).substring(2, 8);
        
        // 로그 항목 생성
        const logEntry = {
            id: uniqueId,
            characterId,
            characterName,
            donationLevel,
            owner,
            timestamp: new Date().toISOString()
        };
        
        // 로그 배열에 추가
        state.donationLogs.push(logEntry);
        
        // 로그 UI 업데이트
        updateDonationLogs();
        
        // 여기서는 Firebase 저장하지 않음 - 부모 함수에서 한 번에 저장할 것
    } catch (error) {
        console.error('기부 로그 추가 에러:', error);
    }
}

// 선택된 캐릭터 최대 기부
function donateSelected() {
    try {
        const checkboxes = document.querySelectorAll('.char-select input[type="checkbox"]:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.id);
        
        if (selectedIds.length === 0) {
            showToast('기부할 캐릭터를 선택해주세요.', 'warning');
            return;
        }
        
        const selectedCharacters = state.characters.filter(char => selectedIds.includes(char.id));
        state.selectedCharacters = selectedCharacters;
        
        // 기부 가능한 캐릭터가 있는지 확인
        const eligibleCharacters = selectedCharacters.filter(char => char.donationLevel < 3);
        
        if (eligibleCharacters.length === 0) {
            showToast('선택한 캐릭터 중 기부 가능한 캐릭터가 없습니다.', 'warning');
            return;
        }
        
        let totalDiamondsCost = 0;
        let details = [];
        
        eligibleCharacters.forEach(char => {
            let charCost = 0;
            const remainingDonations = 3 - char.donationLevel;
            
            for (let i = 0; i < remainingDonations; i++) {
                const level = char.donationLevel + i;
                if (level < DONATION_INFO.length) {
                    charCost += DONATION_INFO[level].diamonds;
                }
            }
            
            totalDiamondsCost += charCost;
            details.push(`${char.name}: ${formatNumber(charCost)} 다이아 (${char.donationLevel}→3회, 현재 💎: ${formatNumber(char.diamonds || 0)})`);
        });
        
        showModal(
            `선택한 ${eligibleCharacters.length}명의 캐릭터에 대해 최대 기부를 진행합니다.\n총 ${formatNumber(totalDiamondsCost)} 다이아가 소모됩니다.\n\n${details.join('\n')}\n\n계속하시겠습니까?`,
            processSelectedMaxDonation
        );
    } catch (error) {
        console.error('선택된 캐릭터 최대 기부 에러:', error);
        showToast('선택된 캐릭터 최대 기부 처리 중 오류가 발생했습니다.', 'error');
    }
}


// 전체 캐릭터 최대 기부
function donateAll() {
    try {
        // 현재 필터링된 소유자의 캐릭터만 대상으로 처리
        const ownerFilter = elements.ownerFilter ? elements.ownerFilter.value : 'all';
        const searchTerm = elements.characterSearch ? elements.characterSearch.value.toLowerCase().trim() : '';
        
        const eligibleCharacters = state.characters.filter(char => {
            // 검색어와 소유자 필터 적용
            const matchesOwner = ownerFilter === 'all' || char.owner === ownerFilter;
            const matchesSearch = !searchTerm || 
                char.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (char.memo && char.memo.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return char.donationLevel < 3 && matchesOwner && matchesSearch;
        });
        
        if (eligibleCharacters.length === 0) {
            showToast('기부 가능한 캐릭터가 없습니다.', 'warning');
            return;
        }
        
        // 다이아 소모량 계산 및 최대 기부 횟수 설정
        let totalDiamondsCost = 0;
        let details = [];
        
        eligibleCharacters.forEach(char => {
            if (char.donationLevel < 3) {
                let charCost = 0;
                const remainingDonations = 3 - char.donationLevel;
                
                for (let i = 0; i < remainingDonations; i++) {
                    const level = char.donationLevel + i;
                    if (level < DONATION_INFO.length) {
                        charCost += DONATION_INFO[level].diamonds;
                    }
                }
                
                totalDiamondsCost += charCost;
                details.push(`${char.name}: ${formatNumber(charCost)} 다이아 (${char.donationLevel}→3회, 현재 💎: ${formatNumber(char.diamonds || 0)})`);
            }
        });
        
        state.selectedCharacters = eligibleCharacters;
        state.selectedAction = 'donateAll';
        
        showModal(
            `현재 표시된 캐릭터 ${eligibleCharacters.length}명에 대해 최대 기부(3회차)를 진행합니다.\n총 ${formatNumber(totalDiamondsCost)} 다이아가 소모됩니다.\n\n${details.join('\n')}\n\n계속하시겠습니까?`,
            processAllMaxDonation
        );
    } catch (error) {
        console.error('전체 캐릭터 최대 기부 에러:', error);
        showToast('전체 캐릭터 최대 기부 처리 중 오류가 발생했습니다.', 'error');
    }
}


// 전체 캐릭터 최대 기부 처리
function processAllMaxDonation() {
    try {
        let totalDiamondsCost = 0;
        let donationCount = 0;
        
        if (!state.selectedCharacters) {
            showToast('선택된 캐릭터가 없습니다.', 'warning');
            return;
        }
        
        // 다이아 부족 캐릭터 체크
        const insufficientDiamonds = [];
        
        state.selectedCharacters.forEach(char => {
            const characterIndex = state.characters.findIndex(c => c.id === char.id);
            
            if (characterIndex !== -1 && state.characters[characterIndex].donationLevel < 3) {
                let charCost = 0;
                const remainingDonations = 3 - state.characters[characterIndex].donationLevel;
                
                for (let i = 0; i < remainingDonations; i++) {
                    const level = state.characters[characterIndex].donationLevel + i;
                    if (level < DONATION_INFO.length) {
                        charCost += DONATION_INFO[level].diamonds;
                    }
                }
                
                // 다이아 부족 체크
                if ((state.characters[characterIndex].diamonds || 0) < charCost) {
                    insufficientDiamonds.push({
                        name: state.characters[characterIndex].name,
                        needed: charCost,
                        have: state.characters[characterIndex].diamonds || 0
                    });
                }
            }
        });
        
        // 다이아 부족 캐릭터가 있으면 처리 중단
        if (insufficientDiamonds.length > 0) {
            let message = '다음 캐릭터들은 다이아가 부족하여 기부할 수 없습니다:\n\n';
            insufficientDiamonds.forEach(char => {
                message += `${char.name}: 필요 ${formatNumber(char.needed)}, 보유 ${formatNumber(char.have)}\n`;
            });
            
            showToast('일부 캐릭터는 다이아가 부족합니다.', 'error');
            showModal(message, null);
            return;
        }
        
        // 충분한 다이아를 가진 캐릭터만 기부 처리
        state.selectedCharacters.forEach(char => {
            const characterIndex = state.characters.findIndex(c => c.id === char.id);
            
            if (characterIndex !== -1 && state.characters[characterIndex].donationLevel < 3) {
                let charCost = 0;
                const remainingDonations = 3 - state.characters[characterIndex].donationLevel;
                
                for (let i = 0; i < remainingDonations; i++) {
                    const level = state.characters[characterIndex].donationLevel + i;
                    if (level < DONATION_INFO.length) {
                        charCost += DONATION_INFO[level].diamonds;
                    }
                }
                
                totalDiamondsCost += charCost;
                
                // 캐릭터의 다이아 차감
                state.characters[characterIndex].diamonds -= charCost;
                
                // 기부 레벨 최대로 설정
                state.characters[characterIndex].donationLevel = 3;
                donationCount++;
            }
        });
        
        // 시스템 사용 다이아 증가 (통계용)
        state.usedDiamonds += totalDiamondsCost;
        
        updateUI();
        saveDataToFirebase();
        
        showToast(`${donationCount}명의 캐릭터 최대 기부가 완료되었습니다.`, 'success');
    } catch (error) {
        console.error('전체 캐릭터 최대 기부 처리 에러:', error);
        showToast('전체 캐릭터 최대 기부 처리 중 오류가 발생했습니다.', 'error');
        
        // 에러 발생 시에도 UI 업데이트 시도
        updateUI();
        saveDataToFirebase();
    }
}


/**
 * 다이아 확인 및 기부 처리 함수 개선
 */
function processSelectedMaxDonation() {
    try {
        const selectedCharacters = state.selectedCharacters;
        
        if (!selectedCharacters || selectedCharacters.length === 0) {
            showToast('선택된 캐릭터가 없습니다.', 'warning');
            return;
        }
        
        let totalDiamondsCost = 0;
        let donationCount = 0;
        
        // 다이아 부족 캐릭터 체크
        const insufficientDiamonds = [];
        
        selectedCharacters.forEach(char => {
            const characterIndex = state.characters.findIndex(c => c.id === char.id);
            
            if (characterIndex !== -1 && state.characters[characterIndex].donationLevel < 3) {
                let charCost = 0;
                const remainingDonations = 3 - state.characters[characterIndex].donationLevel;
                
                for (let i = 0; i < remainingDonations; i++) {
                    const level = state.characters[characterIndex].donationLevel + i;
                    if (level < DONATION_INFO.length) {
                        charCost += DONATION_INFO[level].diamonds;
                    }
                }
                
                // 다이아 부족 체크
                if ((state.characters[characterIndex].diamonds || 0) < charCost) {
                    insufficientDiamonds.push({
                        name: state.characters[characterIndex].name,
                        needed: charCost,
                        have: state.characters[characterIndex].diamonds || 0
                    });
                }
            }
        });
        
        // 다이아 부족 캐릭터가 있으면 처리 중단
        if (insufficientDiamonds.length > 0) {
            let message = '다음 캐릭터들은 다이아가 부족하여 기부할 수 없습니다:\n\n';
            insufficientDiamonds.forEach(char => {
                message += `${char.name}: 필요 ${formatNumber(char.needed)}, 보유 ${formatNumber(char.have)}\n`;
            });
            
            showToast('일부 캐릭터는 다이아가 부족합니다.', 'error');
            showModal(message, null);
            return;
        }
        
        // 충분한 다이아를 가진 캐릭터만 기부 처리
        selectedCharacters.forEach(char => {
            const characterIndex = state.characters.findIndex(c => c.id === char.id);
            
            if (characterIndex !== -1 && state.characters[characterIndex].donationLevel < 3) {
                let charCost = 0;
                const remainingDonations = 3 - state.characters[characterIndex].donationLevel;
                
                for (let i = 0; i < remainingDonations; i++) {
                    const level = state.characters[characterIndex].donationLevel + i;
                    if (level < DONATION_INFO.length) {
                        charCost += DONATION_INFO[level].diamonds;
                    }
                }
                
                totalDiamondsCost += charCost;
                
                // 캐릭터의 다이아 차감
                state.characters[characterIndex].diamonds -= charCost;
                
                // 기부 레벨 최대로 설정
                state.characters[characterIndex].donationLevel = 3;
                donationCount++;
            }
        });
        
        // 시스템 사용 다이아 증가 (통계용)
        state.usedDiamonds += totalDiamondsCost;
        
        updateUI();
        saveDataToFirebase();
        
        showToast(`${donationCount}명의 캐릭터 최대 기부가 완료되었습니다.`, 'success');
    } catch (error) {
        console.error('선택된 캐릭터 최대 기부 처리 에러:', error);
        showToast('선택된 캐릭터 최대 기부 처리 중 오류가 발생했습니다.', 'error');
        
        // 에러 발생 시에도 UI 업데이트 시도
        updateUI();
        saveDataToFirebase();
    }
}


function resetDonationStatus() {
    try {
        showModal(
            "모든 캐릭터의 기부 상태를 리셋하시겠습니까?\n이 작업은 되돌릴 수 없습니다.\n해당 버튼은 00시가 지난후에 눌러주세요.\n00시 자동 초기화 기능은 오류가 많아서 안만듭니다..",
            () => {
                // 중요: 현재 자원 상태 백업
                const currentResourcesBackup = JSON.parse(JSON.stringify(state.resources || {}));
                const currentOwnerResourcesBackup = JSON.parse(JSON.stringify(state.ownerResources || {}));
                const currentResourceModifiersBackup = JSON.parse(JSON.stringify(state.resourceModifiers || {}));
                
                // 현재 3회차인 캐릭터들 기록
                const completed3Characters = state.characters.filter(char => char.donationLevel >= 3);
                
                // 기부 상태 초기화
                state.characters.forEach(char => {
                    // 3회차 캐릭터는 기부횟수 증가시키지 않음 (이미 processDonationWithAnimation에서 증가했으므로)
                    char.donationLevel = 0;
                });
                
                state.lastResetDate = new Date().toISOString().split('T')[0];
                
                // 캐릭터 목록만 업데이트 (전체 UI는 업데이트하지 않음)
                updateCharacterList();
                
                // 자원 상태 복원 (중요!)
                state.resources = currentResourcesBackup;
                state.ownerResources = currentOwnerResourcesBackup;
                state.resourceModifiers = currentResourceModifiersBackup;
                
                // 자원 화면 업데이트 (차트 등)
                if (elements.totalArti) elements.totalArti.textContent = formatNumber(state.resources.arti || 0);
                if (elements.totalCoins) elements.totalCoins.textContent = formatNumber(state.resources.coins || 0);
                if (elements.totalExp) elements.totalExp.textContent = formatNumber(state.resources.exp || 0);
                if (elements.totalContribution) elements.totalContribution.textContent = formatNumber(state.resources.contribution || 0);
                
                // 소유자별 자원 UI 업데이트
                Object.entries(state.ownerResources || {}).forEach(([owner, resources]) => {
                    const artiElement = document.getElementById(`${owner}-total-arti`);
                    const coinsElement = document.getElementById(`${owner}-total-coins`);
                    const expElement = document.getElementById(`${owner}-total-exp`);
                    const contributionElement = document.getElementById(`${owner}-total-contribution`);
                    
                    if (artiElement) artiElement.textContent = formatNumber(resources.arti || 0);
                    if (coinsElement) coinsElement.textContent = formatNumber(resources.coins || 0);
                    if (expElement) expElement.textContent = formatNumber(resources.exp || 0);
                    if (contributionElement) contributionElement.textContent = formatNumber(resources.contribution || 0);
                });
                
                // 변경사항 저장
                saveDataToFirebase();
                
                showToast('모든 캐릭터의 기부 상태가 리셋되었습니다.', 'info');
            }
        );
    } catch (error) {
        console.error('기부 상태 리셋 에러:', error);
        showToast('기부 상태 리셋 중 오류가 발생했습니다.', 'error');
    }
}

// 현재 보이는 모든 캐릭터 선택
function selectAllVisibleCharacters() {
    try {
        // 현재 필터 및 검색어 상태 가져오기
        const ownerFilter = elements.ownerFilter ? elements.ownerFilter.value : 'all';
        const searchTerm = elements.characterSearch ? elements.characterSearch.value.toLowerCase().trim() : '';
        
        // 체크 상태를 토글하기 위해 현재 체크된 캐릭터 수 확인
        const visibleCheckboxes = document.querySelectorAll('.character-card:not([style*="display: none"]) .char-select input[type="checkbox"]:not(:disabled)');
        const checkedCount = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
        
        // 모두 체크되어 있으면 체크 해제, 일부만 체크되어 있으면 모두 체크
        const shouldCheck = checkedCount < visibleCheckboxes.length;
        
        // 모든 체크박스 순회
        visibleCheckboxes.forEach(checkbox => {
            checkbox.checked = shouldCheck;
        });
        
        if (shouldCheck) {
            showToast(`현재 표시된 ${visibleCheckboxes.length}개의 캐릭터가 선택되었습니다.`, 'info');
        } else {
            showToast('모든 선택이 해제되었습니다.', 'info');
        }
    } catch (error) {
        console.error('전체 선택 에러:', error);
        showToast('캐릭터 선택 중 오류가 발생했습니다.', 'error');
    }
}