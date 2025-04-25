/**
 * 디렉토리의 드래그 앤 드롭 기능을 담당하는 모듈
 * 
 * 주요 기능:
 * 1. 디렉토리 드래그 시작/진행/종료 처리
 * 2. 드래그 중인 디렉토리의 시각적 피드백 제공
 * 3. 드롭 위치에 따른 디렉토리 이동 처리
 * 4. 이동 전/후의 디렉토리 상태 유지
 */

import { DirectoryState } from './directoryState.js';
import { DirectoryRender } from './directoryRender.js';
import { showNotification } from './notification.js';

export const DirectoryDragDrop = {
    /**
     * 현재 드래그 중인 디렉토리 요소
     * @type {HTMLElement}
     */
    draggedElement: null,

    /**
     * 드래그 중인 디렉토리의 정보
     * @type {Object}
     */
    draggedDirectory: null,

    /**
     * 드래그 시작 시 호출되는 핸들러
     * @param {DragEvent} event - 드래그 이벤트 객체
     * @param {Object} directory - 드래그를 시작한 디렉토리 정보
     */
    handleDragStart(event, directory) {
        // 현재 상태 저장
        DirectoryState.setState(DirectoryState.getCurrentState());
        
        // 드래그 중인 요소와 디렉토리 정보 저장
        this.draggedElement = event.target;
        this.draggedDirectory = directory;
        
        // 드래그 효과 설정
        event.dataTransfer.effectAllowed = 'move';
        
        // 드래그 중인 요소 스타일 변경
        this.draggedElement.classList.add('dragging');
    },

    /**
     * 드래그 오버 시 호출되는 핸들러
     * 드롭 가능 여부를 시각적으로 표시합니다.
     * @param {DragEvent} event - 드래그 오버 이벤트 객체
     */
    handleDragOver(event) {
        // 기본 동작 방지
        event.preventDefault();
        
        // 드래그 효과 설정
        event.dataTransfer.dropEffect = 'move';
        
        const target = event.target.closest('.directory');
        if (!target) return;

        // 드롭 가능 여부 확인
        if (this.isValidDropTarget(target)) {
            target.classList.add('drop-allowed');
        } else {
            target.classList.add('drop-forbidden');
        }
    },

    /**
     * 드롭 시 호출되는 핸들러
     * 실제 디렉토리 이동을 처리합니다.
     * @param {DragEvent} event - 드롭 이벤트 객체
     * @param {Object} targetDirectory - 드롭된 대상 디렉토리 정보
     */
    handleDrop(event) {
        // 기본 동작 방지
        event.preventDefault();
        
        const target = event.target.closest('.directory');
        if (!target) return;

        // 드롭 위치의 디렉토리 ID 가져오기
        const targetId = target.dataset.id;
        
        // 자기 자신이나 자식 디렉토리로의 이동 방지
        if (this.draggedDirectory.id === targetId || 
            this.isChildDirectory(targetId, this.draggedDirectory.id)) {
            return;
        }

        // 서버에 이동 요청 전송
        this.moveDirectory(this.draggedDirectory.id, targetId)
            .then(() => {
                // 성공 시 UI 업데이트
                DirectoryRender.renderTree();
                showNotification('디렉토리가 이동되었습니다.', 'success');
            })
            .catch(error => {
                // 실패 시 이전 상태로 복원
                DirectoryState.setState(DirectoryState.getCurrentState());
                showNotification('디렉토리 이동에 실패했습니다.', 'error');
            });

        // 드래그 앤 드롭 상태 초기화
        this.resetDragState();
    },

    /**
     * 드롭 대상이 유효한지 확인하는 메소드
     * @param {HTMLElement} target - 드롭 대상 요소
     * @returns {boolean} 드롭 가능 여부
     */
    isValidDropTarget(target) {
        if (!target || !this.draggedElement) return false;
        
        const targetId = target.dataset.id;
        const sourceId = this.draggedDirectory.id;
        
        // 자기 자신이나 자식 디렉토리로의 이동 방지
        return targetId !== sourceId && !this.isChildDirectory(targetId, sourceId);
    },

    /**
     * 특정 디렉토리가 다른 디렉토리의 하위 디렉토리인지 확인
     * @param {string} parentId - 상위 디렉토리 ID
     * @param {string} childId - 하위 디렉토리 ID
     * @returns {boolean} 하위 디렉토리 여부
     */
    isChildDirectory(parentId, childId) {
        const parent = document.querySelector(`[data-id="${parentId}"]`);
        if (!parent) return false;
        
        return parent.querySelector(`[data-id="${childId}"]`) !== null;
    },

    /**
     * 서버에 디렉토리 이동 요청을 보내는 메소드
     * @param {string} sourceId - 이동할 디렉토리 ID
     * @param {string} targetId - 대상 디렉토리 ID
     * @returns {Promise} 이동 요청 결과
     */
    async moveDirectory(sourceId, targetId) {
        try {
            const response = await fetch(`/api/directories/${sourceId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parentId: targetId })
            });

            if (!response.ok) {
                throw new Error('디렉토리 이동 실패');
            }

            return response.json();
        } catch (error) {
            console.error('디렉토리 이동 중 오류:', error);
            throw error;
        }
    },

    /**
     * 드래그 앤 드롭 관련 상태를 초기화하는 메소드
     */
    resetDragState() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // 드롭 표시 스타일 제거
        document.querySelectorAll('.directory').forEach(dir => {
            dir.classList.remove('drop-allowed', 'drop-forbidden');
        });
        
        // 상태 초기화
        this.draggedElement = null;
        this.draggedDirectory = null;
    }
}; 