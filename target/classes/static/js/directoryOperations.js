import { DirectoryRender } from './directoryRender.js';
import { DirectoryState } from './directoryState.js';
import { showNotification } from './notification.js';

export const DirectoryOperations = {
    // 디렉토리 생성
    async createDirectory(name) {
        try {
            const response = await fetch('/api/directories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (!response.ok) throw new Error('디렉토리 생성 실패');

            await this.refreshDirectoryTree();
            showNotification('디렉토리가 생성되었습니다.', 'success');
            return true;
        } catch (error) {
            console.error('디렉토리 생성 오류:', error);
            showNotification('디렉토리 생성에 실패했습니다.', 'danger');
            return false;
        }
    },

    // 디렉토리 수정
    async editDirectory(id, name) {
        try {
            const response = await fetch(`/api/directories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (!response.ok) throw new Error('디렉토리 수정 실패');

            await this.refreshDirectoryTree();
            showNotification('디렉토리가 수정되었습니다.', 'success');
            return true;
        } catch (error) {
            console.error('디렉토리 수정 오류:', error);
            showNotification('디렉토리 수정에 실패했습니다.', 'danger');
            return false;
        }
    },

    // 디렉토리 삭제
    async deleteDirectory(id) {
        try {
            const response = await fetch(`/api/directories/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('디렉토리 삭제 실패');

            await this.refreshDirectoryTree();
            showNotification('디렉토리가 삭제되었습니다.', 'success');
            return true;
        } catch (error) {
            console.error('디렉토리 삭제 오류:', error);
            showNotification('디렉토리 삭제에 실패했습니다.', 'danger');
            return false;
        }
    },

    // 디렉토리 트리 새로고침
    async refreshDirectoryTree() {
        try {
            const response = await fetch('/api/directories/tree');
            if (!response.ok) throw new Error('디렉토리 트리 로드 실패');
            
            DirectoryRender.setDirectories(await response.json());
            DirectoryRender.renderDirectoryTree();
            DirectoryState.restoreExpandedState();
        } catch (error) {
            console.error('디렉토리 트리 로드 오류:', error);
            showNotification('디렉토리 목록을 불러오는데 실패했습니다.', 'danger');
        }
    }
}; 