import { DirectoryState } from './directoryState.js';

let directories = [];

export const DirectoryRender = {
    // 디렉토리 데이터 설정
    setDirectories(data) {
        directories = data;
    },

    // 디렉토리 노드 생성
    createDirectoryNode(directory) {
        const wrapper = document.createElement('div');
        wrapper.className = 'directory-wrapper';
        
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action directory-item';
        item.draggable = true;
        item.dataset.id = directory.id;

        const children = directories.filter(d => d.parent && d.parent.id === directory.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        const hasChildren = children.length > 0;
        const isExpanded = DirectoryState.isExpanded(directory.id);

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
            }

            children.forEach(child => {
                childrenContainer.appendChild(this.createDirectoryNode(child));
            });

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    },

    // 디렉토리 트리 렌더링
    renderDirectoryTree() {
        const directoryTree = document.getElementById('directoryTree');
        directoryTree.innerHTML = '';
        
        const rootDirectories = directories.filter(d => !d.parent)
            .sort((a, b) => a.sortOrder - b.sortOrder);
        
        rootDirectories.forEach(directory => {
            directoryTree.appendChild(this.createDirectoryNode(directory));
        });
    }
}; 