// 디렉토리 상태 관리
const STATE_KEY = 'directoryState';
let expandedState = new Set();

export const DirectoryState = {
    // 상태 저장
    saveExpandedState() {
        const state = Array.from(expandedState);
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    },

    // 상태 로드
    loadExpandedState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            if (saved) {
                expandedState = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.error('상태 로드 실패:', e);
            expandedState = new Set();
        }
    },

    // 상태 복원
    restoreExpandedState() {
        expandedState.forEach(id => {
            const wrapper = document.querySelector(`.directory-item[data-id="${id}"]`)?.closest('.directory-wrapper');
            if (wrapper) {
                const childrenContainer = wrapper.querySelector('.directory-children');
                const toggleIcon = wrapper.querySelector('.directory-toggle i');
                if (childrenContainer && toggleIcon) {
                    childrenContainer.classList.add('expanded');
                    toggleIcon.classList.replace('bi-plus-square', 'bi-dash-square');
                }
            }
        });
    },

    // 디렉토리 펼침 상태 확인
    isExpanded(id) {
        return expandedState.has(id);
    },

    // 디렉토리 펼침 상태 토글
    toggleDirectory(id) {
        if (this.isExpanded(id)) {
            expandedState.delete(id);
        } else {
            expandedState.add(id);
        }
        this.saveExpandedState();
    },

    // 현재 상태 가져오기
    getCurrentState() {
        return new Set(expandedState);
    },

    // 상태 설정
    setState(state) {
        expandedState = new Set(state);
        this.saveExpandedState();
    }
}; 