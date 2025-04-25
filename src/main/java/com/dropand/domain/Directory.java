package com.dropand.domain;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * 디렉토리 도메인 엔티티 클래스
 * 
 * 주요 기능:
 * 1. 디렉토리 정보 저장 (ID, 이름, 정렬 순서)
 * 2. 계층 구조 관리 (부모-자식 관계)
 * 3. JPA 엔티티 매핑
 * 4. 디렉토리 조작을 위한 유틸리티 메서드 제공
 */

@Entity
@Table(name = "directories")
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id"
)
public class Directory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String path;
    
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Directory parent;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @OrderBy("sortOrder ASC")
    @JsonManagedReference
    private List<Directory> children = new ArrayList<>();

    public Directory() {
        this.children = new ArrayList<>();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Directory getParent() {
        return parent;
    }

    public List<Directory> getChildren() {
        return children;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
        updatePath();
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setParent(Directory parent) {
        // 이전 부모와의 관계 제거
        if (this.parent != null && this.parent.getChildren() != null) {
            this.parent.getChildren().remove(this);
        }

        // 새로운 부모 설정
        this.parent = parent;

        // 새로운 부모의 자식 목록에 추가
        if (parent != null && parent.getChildren() != null) {
            if (!parent.getChildren().contains(this)) {
                parent.getChildren().add(this);
            }
            this.path = parent.getPath() + "/" + this.name;
        } else {
            this.path = "/" + this.name;
        }
    }

    private void updatePath() {
        if (this.parent != null) {
            this.path = this.parent.getPath() + "/" + this.name;
        } else {
            this.path = "/" + this.name;
        }
        
        // 자식 디렉토리들의 경로도 업데이트
        if (this.children != null) {
            this.children.forEach(child -> child.updatePath());
        }
    }

    @PrePersist
    @PreUpdate
    private void validateData() {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("디렉토리 이름은 필수입니다.");
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    @JsonProperty("parentId")
    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    @Override
    public String toString() {
        return "Directory{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", path='" + path + '\'' +
            ", sortOrder=" + sortOrder +
            ", parentId=" + getParentId() +
            '}';
    }
} 