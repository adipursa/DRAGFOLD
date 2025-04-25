/**
 * 디렉토리 관리 애플리케이션의 메인 모듈
 * 
 * 주요 기능:
 * 1. 각 기능 모듈들의 통합
 * 2. 이벤트 리스너 설정
 * 3. 전역 함수 등록
 * 4. 애플리케이션 초기화
 */

import { DirectoryState } from './directoryState.js';
import { DirectoryRender } from './directoryRender.js';
import { DirectoryDragDrop } from './directoryDragDrop.js';
import { DirectoryOperations } from './directoryOperations.js';

// 전역 변수
let directories = [];
const STATE_KEY = 'directoryState';
let expandedState = new Set(); // 펼쳐진 디렉토리 상태 저장
const createDirectoryModal = new bootstrap.Modal(document.getElementById('createDirectoryModal'));
const notificationToast = new bootstrap.Toast(document.getElementById('notificationToast'));

/**
 * 페이지 로드 시 초기화 작업 수행
 */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    DirectoryOperations.refreshDirectoryTree();
    DirectoryState.loadExpandedState();
});

// 상태 저장/복원 함수들
function saveExpandedState() {
    const state = Array.from(document.querySelectorAll('.directory-children.expanded'))
        .map(el => parseInt(el.closest('.directory-wrapper').querySelector('.directory-item').dataset.id));
    expandedState = new Set(state);
    localStorage.setItem(STATE_KEY, JSON.stringify(Array.from(expandedState)));
}

function loadExpandedState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            expandedState = new Set(JSON.parse(saved));
        }
    } catch (e) {
        console.error('상태 로드 실패:', e);
        expandedState = new Set();
    }
}

function restoreExpandedState() {
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
}

/**
 * 모든 이벤트 리스너 설정
 * - 디렉토리 토글
 * - 드래그 앤 드롭
 * - 디렉토리 생성
 */
function setupEventListeners() {
    const directoryTree = document.getElementById('directoryTree');
    
    // 디렉토리 토글 이벤트
    directoryTree.addEventListener('click', (event) => {
        const toggleBtn = event.target.closest('.directory-toggle');
        if (!toggleBtn) return;

        event.preventDefault();
        event.stopPropagation();
        
        const directoryItem = toggleBtn.closest('.directory-item');
        const id = parseInt(directoryItem.dataset.id);
        
        const wrapper = directoryItem.closest('.directory-wrapper');
        const childrenContainer = wrapper.querySelector('.directory-children');
        const toggleIcon = wrapper.querySelector('.directory-toggle i');
        
        if (!childrenContainer) return;

        const isExpanded = childrenContainer.classList.contains('expanded');
        
        if (isExpanded) {
            childrenContainer.classList.remove('expanded');
            toggleIcon.classList.replace('bi-dash-square', 'bi-plus-square');
        } else {
            childrenContainer.classList.add('expanded');
            toggleIcon.classList.replace('bi-plus-square', 'bi-dash-square');
        }
        
        DirectoryState.toggleDirectory(id);
    });

    // 드래그 앤 드롭 이벤트
    directoryTree.addEventListener('dragstart', DirectoryDragDrop.handleDragStart);
    directoryTree.addEventListener('dragover', DirectoryDragDrop.handleDragOver);
    directoryTree.addEventListener('drop', DirectoryDragDrop.handleDrop);

    // 디렉토리 생성 이벤트
    document.getElementById('createDirectoryBtn').addEventListener('click', async () => {
        const nameInput = document.getElementById('directoryName');
        const name = nameInput.value.trim();

        if (!name) {
            showNotification('디렉토리 이름을 입력해주세요.', 'warning');
            return;
        }

        if (await DirectoryOperations.createDirectory(name)) {
            nameInput.value = '';
            bootstrap.Modal.getInstance(document.getElementById('createDirectoryModal')).hide();
        }
    });
}

/**
 * 전역에서 접근 가능한 디렉토리 수정 함수
 * @param {number} id - 수정할 디렉토리 ID
 */
window.editDirectory = async (id) => {
    const name = prompt('새 디렉토리 이름을 입력하세요:');
    if (name) {
        await DirectoryOperations.editDirectory(id, name);
    }
};

/**
 * 전역에서 접근 가능한 디렉토리 삭제 함수
 * @param {number} id - 삭제할 디렉토리 ID
 */
window.deleteDirectory = async (id) => {
    if (confirm('정말 이 디렉토리를 삭제하시겠습니까?')) {
        await DirectoryOperations.deleteDirectory(id);
    }
};

// 디렉토리 트리 로드
async function loadDirectoryTree() {
    try {
        const response = await fetch('/api/directories/tree');
        if (!response.ok) throw new Error('디렉토리 트리 로드 실패');
        
        directories = await response.json();
        renderDirectoryTree();
        restoreExpandedState();
    } catch (error) {
        console.error('디렉토리 트리 로드 오류:', error);
        showNotification('디렉토리 목록을 불러오는데 실패했습니다.', 'danger');
    }
}

// 디렉토리 생성
async function createDirectory() {
    const nameInput = document.getElementById('directoryName');
    const name = nameInput.value.trim();

    if (!name) {
        showNotification('디렉토리 이름을 입력해주세요.', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/directories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) throw new Error('디렉토리 생성 실패');

        const newDirectory = await response.json();
        directories.push(newDirectory);
        renderDirectoryTree();
        createDirectoryModal.hide();
        showNotification('디렉토리가 생성되었습니다.', 'success');
        nameInput.value = '';
    } catch (error) {
        showNotification('디렉토리 생성에 실패했습니다.', 'danger');
    }
}

// 디렉토리 노드 생성
function createDirectoryNode(directory) {
    const wrapper = document.createElement('div');
    wrapper.className = 'directory-wrapper';
    
    const item = document.createElement('div');
    item.className = 'list-group-item list-group-item-action directory-item';
    item.draggable = true;
    item.dataset.id = directory.id;

    const children = directories.filter(d => d.parent && d.parent.id === directory.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const hasChildren = children.length > 0;
    const isExpanded = expandedState.has(directory.id);

    item.innerHTML = `
        <div class="d-flex align-items-center w-100">
            <div class="directory-toggle">
                ${hasChildren 
                    ? `<i class="bi ${isExpanded ? 'bi-dash-square' : 'bi-plus-square'}"></i>` 
                    : `<i class="bi bi-dot"></i>`
                }
            </div>
            <div class="directory-content">
                <i class="bi bi-folder-fill text-warning"></i>
                <span class="ms-2">${directory.name}</span>
            </div>
            <div class="directory-actions ms-auto">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editDirectory(${directory.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDirectory(${directory.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    wrapper.appendChild(item);

    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'directory-children';
        
        if (isExpanded) {
            childrenContainer.classList.add('expanded');
        } else {
            childrenContainer.classList.remove('expanded');
        }

        children.forEach(child => {
            childrenContainer.appendChild(createDirectoryNode(child));
        });

        wrapper.appendChild(childrenContainer);
    }

    return wrapper;
}

// 디렉토리 트리 렌더링
function renderDirectoryTree() {
    const directoryTree = document.getElementById('directoryTree');
    directoryTree.innerHTML = '';
    
    const rootDirectories = directories.filter(d => !d.parent)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    
    rootDirectories.forEach(directory => {
        directoryTree.appendChild(createDirectoryNode(directory));
    });
}

// 알림 표시
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    toast.querySelector('.toast-body').textContent = message;
    toast.className = `toast bg-${type} text-white`;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
} 