# 디렉토리 관리 애플리케이션 (Directory Management Application)

## 프로젝트 개요
이 프로젝트는 웹 기반의 디렉토리 관리 시스템으로, 사용자가 직관적인 인터페이스를 통해 디렉토리 구조를 생성하고 관리할 수 있습니다.

## 주요 기능
- 계층적 디렉토리 구조 관리
- 드래그 앤 드롭으로 디렉토리 이동
- 실시간 상태 저장 및 복원
- 직관적인 사용자 인터페이스
- 반응형 디자인 지원

## 기술 스택
- Backend: Spring Boot
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- UI Framework: Bootstrap 5.1.3
- 템플릿 엔진: Thymeleaf
- 데이터베이스: H2 (개발용)

## 프로젝트 구조
```
dropAnd/
├── src/
│   ├── main/
│   │   ├── java/         # Java 소스 코드
│   │   │   ├── resources/    # 리소스 파일
│   │   │   │   ├── static/   # 정적 파일
│   │   │   │   │   └── css/  # CSS 파일
│   │   │   │   │   └── directory.css    # 디렉토리 트리 스타일링
│   │   │   │   └── js/   # JavaScript 모듈
│   │   │   │       ├── directory.js           # 메인 모듈
│   │   │   │       ├── directoryState.js      # 상태 관리
│   │   │   │       ├── directoryRender.js     # UI 렌더링
│   │   │   │       ├── directoryDragDrop.js   # 드래그 앤 드롭
│   │   │   │       ├── directoryOperations.js # CRUD 작업
│   │   │   │       └── notification.js        # 알림 처리
│   │   │   └── templates/  # Thymeleaf 템플릿
│   │   │       └── directory/
│   │   │           └── list.html   # 메인 페이지
│   │   └── resources/
│   │       └── application.properties  # 애플리케이션 설정
│   └── test/  # 테스트 코드
├── pom.xml    # Maven 설정
└── README.md  # 프로젝트 문서
```

## 주요 컴포넌트 설명

### Frontend 컴포넌트

#### 1. HTML (list.html)
- 역할: 메인 사용자 인터페이스 제공
- 주요 기능:
  - 디렉토리 트리 표시 영역
  - 새 디렉토리 생성 모달
  - 알림 토스트 메시지
  - 반응형 레이아웃

#### 2. CSS (directory.css)
- 역할: 디렉토리 트리 시각화 및 스타일링
- 주요 스타일:
  - 트리 구조 레이아웃
  - 드래그 앤 드롭 시각적 피드백
  - 반응형 디자인 지원
  - 애니메이션 효과

#### 3. JavaScript 모듈
- **directory.js**
  - 역할: 메인 진입점 및 모듈 통합
  - 기능: 이벤트 처리 및 모듈 간 조정

- **directoryState.js**
  - 역할: 디렉토리 상태 관리
  - 기능: 
    - 확장/축소 상태 저장
    - localStorage를 통한 상태 유지
    - 상태 복원 및 동기화

- **directoryRender.js**
  - 역할: UI 렌더링 처리
  - 기능:
    - 디렉토리 트리 DOM 생성
    - 동적 UI 업데이트
    - 시각적 피드백 제공

- **directoryDragDrop.js**
  - 역할: 드래그 앤 드롭 기능
  - 기능:
    - 드래그 이벤트 처리
    - 드롭 위치 계산
    - 시각적 피드백 제공

- **directoryOperations.js**
  - 역할: CRUD 작업 처리
  - 기능:
    - 디렉토리 생성/수정/삭제
    - 서버 통신
    - 상태 업데이트

- **notification.js**
  - 역할: 사용자 피드백
  - 기능:
    - 토스트 메시지 표시
    - 작업 결과 알림
    - 에러 메시지 처리

### Backend 컴포넌트

#### 1. Controller
- **DirectoryController.java**
  - 역할: REST API 엔드포인트 제공
  - 주요 기능:
    - `GET /api/directories`: 전체 디렉토리 목록 조회
    - `POST /api/directories`: 새 디렉토리 생성
    - `PUT /api/directories/{id}`: 디렉토리 정보 수정
    - `DELETE /api/directories/{id}`: 디렉토리 삭제
    - `POST /api/directories/move`: 디렉토리 위치 이동

#### 2. Service
- **DirectoryService.java**
  - 역할: 비즈니스 로직 처리
  - 주요 기능:
    - `findAll()`: 전체 디렉토리 조회 및 트리 구조 구성
    - `createDirectory()`: 새 디렉토리 생성 및 유효성 검사
    - `updateDirectory()`: 디렉토리 정보 수정 및 상태 관리
    - `deleteDirectory()`: 디렉토리 삭제 및 하위 구조 처리
    - `moveDirectory()`: 디렉토리 위치 이동 및 순서 관리
    - `validateMove()`: 이동 가능 여부 검증

#### 3. Entity
- **Directory.java**
  - 역할: 디렉토리 데이터 모델
  - 주요 필드:
    - `id`: 디렉토리 고유 식별자 (Long)
    - `name`: 디렉토리 이름 (String)
    - `parent`: 상위 디렉토리 참조 (Directory)
    - `children`: 하위 디렉토리 목록 (List<Directory>)
    - `orderIndex`: 정렬 순서 (Integer)
  - JPA 관계 설정:
    - `@ManyToOne`: 상위 디렉토리와의 관계
    - `@OneToMany`: 하위 디렉토리와의 관계

#### 4. Repository
- **DirectoryRepository.java**
  - 역할: 데이터베이스 접근 인터페이스
  - 주요 메서드:
    - `findByParentIsNull()`: 최상위 디렉토리 조회
    - `findByParentId()`: 특정 부모의 하위 디렉토리 조회
    - `findByNameAndParentId()`: 중복 이름 검사
    - `deleteByIdIn()`: 여러 디렉토리 일괄 삭제

### 스타일링 상세 설명 (directory.css)

#### 1. 기본 레이아웃
```css
/* 디렉토리 트리의 기본 들여쓰기 설정 */
.directory-wrapper {
    margin-left: 20px;  /* 하위 디렉토리 들여쓰기 */
}

/* 디렉토리 아이템의 기본 레이아웃 */
.directory-item {
    display: flex;
    align-items: center;
    padding: 5px;
    margin: 2px 0;
    cursor: pointer;
}
```

#### 2. 시각적 피드백
```css
/* 마우스 호버 효과 */
.directory-item:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6;
}

/* 드래그 중인 아이템 스타일 */
.directory-item.dragging {
    opacity: 0.5;
}

/* 드롭 가능 영역 표시 */
.directory-item.drag-over {
    border: 2px dashed #0d6efd;
}
```

#### 3. 상호작용 요소
```css
/* 토글 버튼 (화살표) */
.directory-toggle {
    visibility: hidden;  /* 기본적으로 숨김 */
    margin-right: 5px;
    cursor: pointer;
}

/* 작업 버튼 (편집, 삭제 등) */
.directory-actions {
    visibility: hidden;  /* 기본적으로 숨김 */
    margin-left: auto;
}

/* 호버 시 버튼 표시 */
.directory-item:hover .directory-actions {
    visibility: visible;
}
```

#### 4. 애니메이션 및 전환 효과
```css
/* 펼침/접힘 애니메이션 */
.directory-children {
    display: none;
    transition: all 0.3s ease;
}

/* 버튼 호버 효과 */
.directory-item .btn-icon:hover {
    background-color: rgba(13, 110, 253, 0.1);
}
```

### 데이터베이스 스키마

#### Directory 테이블
```sql
CREATE TABLE directory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES directory(id)
);

CREATE INDEX idx_parent_id ON directory(parent_id);
CREATE INDEX idx_order_index ON directory(order_index);
```

## 설치 및 실행 방법
1. 프로젝트 클론
```bash
git clone [repository-url]
```

2. 의존성 설치
```bash
cd dropAnd
mvn install
```

3. 애플리케이션 실행
```bash
mvn spring-boot:run
```

4. 브라우저에서 접속
```
http://localhost:8080
```

## 개발 가이드
- Java 11 이상 필요
- Maven 3.6 이상 필요
- 코드 변경 시 자동 리로드 지원 (Spring Boot DevTools)
- Frontend 코드는 모듈 시스템 사용

## 라이선스
이 프로젝트는 MIT 라이선스 하에 있습니다. 