package com.dropand.repository;

import com.dropand.domain.Directory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectoryRepository extends JpaRepository<Directory, Long> {
    List<Directory> findByParentIsNullOrderBySortOrder();
    List<Directory> findByParentOrderBySortOrder(Directory parent);
} 