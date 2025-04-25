/**
 * 디렉토리의 기본 작업(CRUD)을 담당하는 모듈
 * 
 * 주요 기능:
 * 1. 디렉토리 생성
 * 2. 디렉토리 수정
 * 3. 디렉토리 삭제
 * 4. 디렉토리 트리 새로고침
 */

import { DirectoryRender } from './directoryRender.js';
import { DirectoryState } from './directoryState.js';
import { showNotification } from './notification.js';

export const DirectoryOperations = {
    /**
     * 새 디렉토리 생성
     * @param {string} name - 생성할 디렉토리 이름
     * @returns {Promise<boolean>} 생성 성공 여부
     */
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

    /**
     * 디렉토리 이름 수정
     * @param {number} id - 수정할 디렉토리 ID
     * @param {string} name - 새 디렉토리 이름
     * @returns {Promise<boolean>} 수정 성공 여부
     */
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

    /**
     * 디렉토리 삭제
     * @param {number} id - 삭제할 디렉토리 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
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

    /**
     * 디렉토리 트리 데이터를 서버에서 새로 받아와 화면에 렌더링
     * 기존의 펼침/접힘 상태를 유지
     */
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