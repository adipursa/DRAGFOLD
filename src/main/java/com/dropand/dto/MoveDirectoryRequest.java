package com.dropand.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveDirectoryRequest {
    private Long parentId;
    private Integer sortOrder;

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