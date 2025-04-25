package com.dropand.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

/**
 * 디렉토리(폴더) 정보를 저장하는 엔티티 클래스
 * JPA를 사용하여 데이터베이스의 directory 테이블과 매핑됩니다.
 */
@Entity // JPA 엔티티임을 표시
@Table(name = "directory") // 데이터베이스 테이블 이름 지정
@Getter // Lombok: 모든 필드의 getter 메소드 자동 생성
@Setter // Lombok: 모든 필드의 setter 메소드 자동 생성
public class Directory {

    /**
     * 디렉토리의 고유 식별자 (Primary Key)
     * 자동으로 증가하는 값이 할당됩니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 디렉토리의 이름
     * null이 될 수 없으며, 반드시 값이 있어야 합니다.
     */
    @Column(nullable = false)
    private String name;

    /**
     * 상위 디렉토리 참조
     * 다대일(N:1) 관계를 설정합니다.
     * 최상위 디렉토리의 경우 null이 됩니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Directory parent;

    /**
     * 하위 디렉토리 목록
     * 일대다(1:N) 관계를 설정합니다.
     * 양방향 관계에서 부모 측의 컬렉션입니다.
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Directory> children = new ArrayList<>();

    /**
     * 같은 부모 디렉토리 내에서의 정렬 순서
     */
    @Column(name = "order_index")
    private Integer orderIndex;

    /**
     * 하위 디렉토리를 추가하는 메소드
     * 양방향 관계의 양쪽을 모두 설정합니다.
     * 
     * @param child 추가할 하위 디렉토리
     */
    public void addChild(Directory child) {
        // 자식 디렉토리 목록에 추가
        this.children.add(child);
        // 자식 디렉토리의 부모로 현재 디렉토리 설정
        child.setParent(this);
        // 자식 디렉토리의 순서 인덱스 설정
        child.setOrderIndex(this.children.size() - 1);
    }

    /**
     * 하위 디렉토리를 제거하는 메소드
     * 양방향 관계의 양쪽을 모두 해제합니다.
     * 
     * @param child 제거할 하위 디렉토리
     */
    public void removeChild(Directory child) {
        // 자식 디렉토리 목록에서 제거
        this.children.remove(child);
        // 자식 디렉토리의 부모 참조 제거
        child.setParent(null);
        // 남은 자식 디렉토리들의 순서 인덱스 재정렬
        reorderChildren();
    }

    /**
     * 하위 디렉토리들의 순서를 재정렬하는 메소드
     * 디렉토리가 제거되었을 때 호출됩니다.
     */
    private void reorderChildren() {
        for (int i = 0; i < children.size(); i++) {
            children.get(i).setOrderIndex(i);
        }
    }

    /**
     * 현재 디렉토리가 특정 디렉토리의 하위 디렉토리인지 확인하는 메소드
     * 순환 참조를 방지하기 위해 사용됩니다.
     * 
     * @param directory 상위 디렉토리인지 확인할 디렉토리
     * @return 하위 디렉토리인 경우 true, 아닌 경우 false
     */
    public boolean isChildOf(Directory directory) {
        if (directory == null) {
            return false;
        }
        
        // 현재 디렉토리의 부모를 따라 올라가면서 확인
        Directory current = this.parent;
        while (current != null) {
            if (current.equals(directory)) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
} 