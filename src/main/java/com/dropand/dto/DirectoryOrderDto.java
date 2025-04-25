package com.dropand.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 디렉토리 순서 변경을 위한 DTO 클래스
 * 
 * 주요 기능:
 * 1. 디렉토리 이동 요청 데이터 전달
 * 2. 부모 디렉토리 ID와 정렬 순서 정보 포함
 * 3. API 요청/응답 데이터 매핑
 */

@Getter
@Setter
public class DirectoryOrderDto {
    private Long id;
    private Long parentId;
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
} 