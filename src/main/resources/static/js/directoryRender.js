/**
 * 디렉토리 트리의 렌더링을 담당하는 모듈
 * 
 * 주요 기능:
 * 1. 디렉토리 트리 구조를 DOM으로 생성
 * 2. 각 디렉토리 노드의 HTML 구조 생성
 * 3. 디렉토리의 계층 구조 표현
 * 4. 펼침/접힘 상태에 따른 아이콘 및 하위 디렉토리 표시
 */

import { DirectoryState } from './directoryState.js';

let directories = [];

export const DirectoryRender = {
    /**
     * 디렉토리 트리를 표시할 컨테이너 요소
     * @type {HTMLElement}
     */
    container: document.getElementById('directoryTree'),

    /**
     * 디렉토리 데이터 설정
     * @param {Array} data - 서버에서 받아온 디렉토리 데이터
     */
    setDirectories(data) {
        directories = data;
    },

    /**
     * 디렉토리 트리를 새로 그립니다.
     * @param {Array} directories - 서버에서 받아온 디렉토리 목록
     */
    renderTree(directories) {
        // 컨테이너 초기화
        this.container.innerHTML = '';
        
        // 각 최상위 디렉토리에 대해 렌더링 수행
        directories.forEach(directory => {
            const directoryElement = this.createDirectoryElement(directory);
            this.container.appendChild(directoryElement);
        });

        // 확장/축소 상태 복원
        DirectoryState.restoreExpandedState();
    },

    /**
     * 단일 디렉토리 요소를 생성합니다.
     * @param {Object} directory - 디렉토리 정보 객체
     * @returns {HTMLElement} 생성된 디렉토리 DOM 요소
     */
    createDirectoryElement(directory) {
        // 디렉토리 컨테이너 생성
        const container = document.createElement('div');
        container.className = 'directory';
        container.dataset.id = directory.id;

        // 디렉토리 헤더 (이름과 아이콘을 포함하는 부분) 생성
        const header = document.createElement('div');
        header.className = 'directory-header';
        
        // 확장/축소 화살표 생성
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = directory.children.length > 0 ? '▶' : ' ';
        
        // 디렉토리 이름 표시
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = directory.name;
        
        // 헤더에 요소들 추가
        header.appendChild(arrow);
        header.appendChild(name);
        container.appendChild(header);

        // 하위 디렉토리가 있는 경우 처리
        if (directory.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children';
            
            // 각 하위 디렉토리를 재귀적으로 생성
            directory.children.forEach(child => {
                const childElement = this.createDirectoryElement(child);
                childrenContainer.appendChild(childElement);
            });
            
            container.appendChild(childrenContainer);
        }

        // 이벤트 리스너 추가
        this.attachEventListeners(container, directory);

        return container;
    },

    /**
     * 디렉토리 요소에 이벤트 리스너를 추가합니다.
     * @param {HTMLElement} element - 디렉토리 DOM 요소
     * @param {Object} directory - 디렉토리 정보 객체
     */
    attachEventListeners(element, directory) {
        const arrow = element.querySelector('.arrow');
        const header = element.querySelector('.directory-header');
        const childrenContainer = element.querySelector('.children');

        // 화살표 클릭 시 확장/축소 처리
        if (arrow && childrenContainer) {
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                DirectoryState.toggleDirectory(directory.id);
                
                // 화살표 방향과 하위 디렉토리 표시 상태 변경
                if (DirectoryState.isExpanded(directory.id)) {
                    childrenContainer.style.display = 'block';
                    arrow.textContent = '▼';
                } else {
                    childrenContainer.style.display = 'none';
                    arrow.textContent = '▶';
                }
            });
        }

        // 드래그 앤 드롭 이벤트 설정
        header.draggable = true;
        header.addEventListener('dragstart', (e) => DirectoryDragDrop.handleDragStart(e, directory));
        element.addEventListener('dragover', (e) => DirectoryDragDrop.handleDragOver(e));
        element.addEventListener('drop', (e) => DirectoryDragDrop.handleDrop(e, directory));

        // 우클릭 메뉴 이벤트 설정
        header.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            DirectoryOperations.showContextMenu(e, directory);
        });
    },

    /**
     * 특정 디렉토리 요소를 업데이트합니다.
     * @param {Object} directory - 업데이트할 디렉토리 정보
     */
    updateDirectoryElement(directory) {
        const element = this.container.querySelector(`[data-id="${directory.id}"]`);
        if (element) {
            const nameElement = element.querySelector('.name');
            nameElement.textContent = directory.name;
        }
    }
}; 