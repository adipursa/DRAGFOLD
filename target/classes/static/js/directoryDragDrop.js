import { DirectoryState } from './directoryState.js';
import { DirectoryRender } from './directoryRender.js';
import { showNotification } from './notification.js';

export const DirectoryDragDrop = {
    // 드래그 시작
    handleDragStart(e) {
        const item = e.target.closest('.directory-item');
        if (!item) return;
        
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    },

    // 드래그 오버
    handleDragOver(e) {
        e.preventDefault();
        const item = e.target.closest('.directory-item');
        if (!item) return;
        
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem || item === draggingItem) return;
        
        const rect = item.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        document.querySelectorAll('.directory-item').forEach(item => {
            item.style.borderTop = '';
            item.style.borderBottom = '';
        });
        
        if (y < rect.height / 2) {
            item.style.borderTop = '2px solid #0d6efd';
        } else {
            item.style.borderBottom = '2px solid #0d6efd';
        }
    },

    // 드롭
    async handleDrop(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const targetItem = e.target.closest('.directory-item');
        
        document.querySelectorAll('.directory-item').forEach(item => {
            item.style.borderTop = '';
            item.style.borderBottom = '';
        });

        if (!draggingItem || !targetItem || draggingItem === targetItem) {
            draggingItem?.classList.remove('dragging');
            return;
        }

        try {
            const sourceId = parseInt(draggingItem.dataset.id);
            const targetId = parseInt(targetItem.dataset.id);
            const rect = targetItem.getBoundingClientRect();
            const position = e.clientY < (rect.top + rect.height / 2) ? 'before' : 'after';

            // 이동 전 상태 저장
            const currentState = DirectoryState.getCurrentState();
            DirectoryState.saveExpandedState();

            const response = await fetch(`/api/directories/${sourceId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parentId: targetId,
                    sortOrder: position === 'before' ? 0 : 1
                })
            });

            if (!response.ok) throw new Error('디렉토리 이동 실패');

            // 트리 데이터만 새로고침
            const treeResponse = await fetch('/api/directories/tree');
            if (!treeResponse.ok) throw new Error('디렉토리 트리 로드 실패');
            
            // 데이터 업데이트 및 렌더링
            DirectoryRender.setDirectories(await treeResponse.json());
            DirectoryRender.renderDirectoryTree();
            
            // 이동 전 상태 복원
            DirectoryState.setState(currentState);
            DirectoryState.restoreExpandedState();
            
            showNotification('디렉토리가 이동되었습니다.', 'success');
        } catch (error) {
            console.error('드래그 앤 드롭 오류:', error);
            showNotification('디렉토리 이동에 실패했습니다.', 'danger');
        } finally {
            draggingItem.classList.remove('dragging');
        }
    }
}; 