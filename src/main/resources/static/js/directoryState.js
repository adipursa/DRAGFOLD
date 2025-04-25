/**
 * 디렉토리 상태 관리 모듈
 * 디렉토리의 확장/축소 상태와 전체 상태를 관리합니다.
 * 브라우저의 localStorage를 사용하여 상태를 영구적으로 저장합니다.
 */

const DirectoryState = {
    // 확장된 디렉토리 ID를 저장하는 Set 객체
    expandedState: new Set(),
    
    // 현재 디렉토리 상태를 저장하는 객체
    currentState: null,

    /**
     * 현재 확장된 디렉토리 상태를 localStorage에 저장합니다.
     * 페이지를 새로고침해도 상태가 유지됩니다.
     */
    saveExpandedState() {
        // Set 객체를 배열로 변환하여 JSON 문자열로 저장
        localStorage.setItem('expandedState', JSON.stringify([...this.expandedState]));
    },

    /**
     * localStorage에서 저장된 확장 상태를 불러옵니다.
     * 페이지 로드 시 이전 상태를 복원하는데 사용됩니다.
     */
    loadExpandedState() {
        try {
            // localStorage에서 상태를 불러와 Set 객체로 변환
            const savedState = localStorage.getItem('expandedState');
            if (savedState) {
                this.expandedState = new Set(JSON.parse(savedState));
            }
        } catch (error) {
            console.error('확장 상태 로드 중 오류 발생:', error);
            // 오류 발생 시 빈 상태로 초기화
            this.expandedState = new Set();
        }
    },

    /**
     * 특정 디렉토리의 확장/축소 상태를 토글(전환)합니다.
     * @param {string} id - 토글할 디렉토리의 ID
     */
    toggleDirectory(id) {
        if (this.expandedState.has(id)) {
            // 이미 확장된 상태면 축소
            this.expandedState.delete(id);
        } else {
            // 축소된 상태면 확장
            this.expandedState.add(id);
        }
        // 변경된 상태를 저장
        this.saveExpandedState();
    },

    /**
     * 특정 디렉토리가 확장된 상태인지 확인합니다.
     * @param {string} id - 확인할 디렉토리의 ID
     * @returns {boolean} 확장된 상태이면 true, 아니면 false
     */
    isExpanded(id) {
        return this.expandedState.has(id);
    },

    /**
     * 현재 전체 디렉토리 상태를 저장합니다.
     * 드래그 앤 드롭 작업 전에 상태를 백업하는데 사용됩니다.
     */
    getCurrentState() {
        return this.currentState;
    },

    /**
     * 저장된 디렉토리 상태를 복원합니다.
     * 드래그 앤 드롭 작업이 실패했을 때 이전 상태로 되돌리는데 사용됩니다.
     * @param {Object} state - 복원할 디렉토리 상태
     */
    setState(state) {
        this.currentState = state;
    },

    /**
     * UI에 현재 확장/축소 상태를 적용합니다.
     * 페이지 로드나 상태 변경 후 화면을 업데이트하는데 사용됩니다.
     */
    restoreExpandedState() {
        // 모든 디렉토리 요소를 순회
        document.querySelectorAll('.directory').forEach(element => {
            const id = element.dataset.id;
            const childrenContainer = element.querySelector('.children');
            const arrow = element.querySelector('.arrow');
            
            if (childrenContainer) {
                if (this.isExpanded(id)) {
                    // 확장된 상태면 자식 요소들을 보여주고 화살표 방향 변경
                    childrenContainer.style.display = 'block';
                    arrow.textContent = '▼';
                } else {
                    // 축소된 상태면 자식 요소들을 숨기고 화살표 방향 변경
                    childrenContainer.style.display = 'none';
                    arrow.textContent = '▶';
                }
            }
        });
    }
}; 