package com.dropand.service;

import com.dropand.domain.Directory;
import com.dropand.dto.DirectoryOrderDto;
import com.dropand.repository.DirectoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 디렉토리 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 컨트롤러와 리포지토리 사이에서 실제 업무 로직을 처리합니다.
 */
@Service // 스프링의 서비스 컴포넌트임을 표시
public class DirectoryService {
    
    private static final Logger log = LoggerFactory.getLogger(DirectoryService.class);
    /**
     * 디렉토리 리포지토리 객체
     * 데이터베이스 작업을 처리합니다.
     */
    private final DirectoryRepository directoryRepository;
    
    /**
     * 생성자를 통한 의존성 주입
     * 스프링이 자동으로 DirectoryRepository 구현체를 주입합니다.
     */
    public DirectoryService(DirectoryRepository directoryRepository) {
        this.directoryRepository = directoryRepository;
        log.info("DirectoryService 초기화됨");
    }
    
    /**
     * 전체 디렉토리 목록을 조회하는 메소드
     * 
     * @return 전체 디렉토리 목록
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 설정
    public List<Directory> getAllDirectories() {
        log.debug("모든 디렉토리 조회");
        List<Directory> directories = directoryRepository.findAll();
        log.debug("전체 디렉토리 조회 완료 - 조회된 디렉토리 수: {}", directories.size());
        return directories;
    }
    
    /**
     * 루트 디렉토리 목록을 조회하는 메소드
     * 
     * @return 루트 디렉토리 목록
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 설정
    public List<Directory> getDirectoryTree() {
        log.debug("루트 디렉토리 목록 조회");
        List<Directory> rootDirectories = directoryRepository.findByParentIsNullOrderBySortOrder();
        log.debug("루트 디렉토리 조회 완료 - 조회된 디렉토리 수: {}", rootDirectories.size());
        return rootDirectories;
    }
    
    /**
     * 하위 디렉토리 목록을 조회하는 메소드
     * 
     * @param parentId 부모 디렉토리 ID
     * @return 하위 디렉토리 목록
     * @throws IllegalArgumentException 부모 디렉토리가 존재하지 않는 경우
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 설정
    public List<Directory> getSubDirectories(Long parentId) {
        log.debug("하위 디렉토리 조회 시작 - parentId: {}", parentId);
        Directory parent = directoryRepository.findById(parentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent directory not found with id: " + parentId));
        List<Directory> directories = directoryRepository.findByParentOrderBySortOrder(parent);
        log.debug("하위 디렉토리 조회 완료 - 조회된 디렉토리 수: {}", directories.size());
        return directories;
    }
    
    /**
     * 디렉토리 순서를 업데이트하는 메소드
     * 
     * @param orderList 업데이트할 디렉토리 순서 목록
     * @throws Exception 디렉토리 순서 업데이트 중 오류 발생 시
     */
    @Transactional
    public void updateDirectoryOrder(List<DirectoryOrderDto> orderList) {
        log.debug("디렉토리 순서 업데이트 시작 - 업데이트할 항목 수: {}", orderList.size());
        
        try {
            // 모든 디렉토리를 한 번에 조회
            List<Long> directoryIds = orderList.stream()
                    .map(DirectoryOrderDto::getId)
                    .collect(Collectors.toList());
            log.debug("업데이트할 디렉토리 ID 목록: {}", directoryIds);
            
            List<Directory> directories = directoryRepository.findAllById(directoryIds);
            log.debug("조회된 디렉토리 수: {}", directories.size());
            
            Map<Long, Directory> directoryMap = directories.stream()
                    .collect(Collectors.toMap(Directory::getId, d -> d));
            
            for (DirectoryOrderDto orderDto : orderList) {
                log.debug("디렉토리 업데이트 처리 중 - ID: {}, ParentID: {}, SortOrder: {}", 
                    orderDto.getId(), orderDto.getParentId(), orderDto.getSortOrder());
                
                Directory directory = directoryMap.get(orderDto.getId());
                if (directory == null) {
                    log.error("디렉토리를 찾을 수 없음 - ID: {}", orderDto.getId());
                    throw new IllegalArgumentException("Directory not found with id: " + orderDto.getId());
                }
                
                Directory parent = null;
                if (orderDto.getParentId() != null) {
                    parent = directoryRepository.findById(orderDto.getParentId())
                            .orElseThrow(() -> {
                                log.error("부모 디렉토리를 찾을 수 없음 - ID: {}", orderDto.getParentId());
                                return new IllegalArgumentException("Parent directory not found with id: " + orderDto.getParentId());
                            });
                }
                
                log.debug("디렉토리 정보 업데이트 - Name: {}, OldPath: {}", directory.getName(), directory.getPath());
                directory.setParent(parent);
                directory.setSortOrder(orderDto.getSortOrder());
                
                // 경로 업데이트
                String newPath = parent == null ? "/" + directory.getName() : parent.getPath() + "/" + directory.getName();
                directory.setPath(newPath);
                log.debug("새로운 경로 설정 - NewPath: {}", newPath);
                
                directoryRepository.save(directory);
                log.debug("디렉토리 저장 완료 - ID: {}", directory.getId());
                
                // 하위 디렉토리들의 경로도 업데이트
                updateChildrenPaths(directory);
            }
            log.debug("디렉토리 순서 업데이트 완료");
        } catch (Exception e) {
            log.error("디렉토리 순서 업데이트 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * 새로운 디렉토리를 생성하는 메소드
     * 
     * @param name 생성할 디렉토리 이름
     * @param parentId 부모 디렉토리 ID
     * @return 생성된 디렉토리
     * @throws Exception 디렉토리 생성 중 오류 발생 시
     */
    @Transactional
    public Directory createDirectory(String name, Long parentId) {
        try {
            log.info("디렉토리 생성 시작 - 이름: {}, 부모 ID: {}", name, parentId);
            
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("디렉토리 이름은 필수입니다.");
            }

            // 부모 디렉토리 조회
            Directory parent = null;
            if (parentId != null) {
                parent = directoryRepository.findById(parentId)
                        .orElseThrow(() -> {
                            log.error("부모 디렉토리를 찾을 수 없음 - ID: {}", parentId);
                            return new IllegalArgumentException("부모 디렉토리를 찾을 수 없습니다. ID: " + parentId);
                        });
                log.debug("부모 디렉토리 조회됨 - 이름: {}, 경로: {}", parent.getName(), parent.getPath());
            }

            // 디렉토리 생성
            Directory directory = new Directory();
            directory.setName(name.trim());
            
            // 정렬 순서 설정
            List<Directory> siblings = parentId == null ? 
                directoryRepository.findByParentIsNullOrderBySortOrder() :
                directoryRepository.findByParentOrderBySortOrder(parent);
            
            int maxSortOrder = siblings.isEmpty() ? 0 : 
                siblings.stream()
                    .mapToInt(Directory::getSortOrder)
                    .max()
                    .orElse(0);
            
            directory.setSortOrder(maxSortOrder + 1);
            
            // 부모-자식 관계 설정
            directory.setParent(parent);
            
            // 저장
            Directory savedDirectory = directoryRepository.saveAndFlush(directory);
            
            log.info("디렉토리 생성 완료 - ID: {}, 이름: {}, 경로: {}, 부모 ID: {}", 
                savedDirectory.getId(), savedDirectory.getName(), savedDirectory.getPath(),
                savedDirectory.getParent() != null ? savedDirectory.getParent().getId() : null);
            
            return savedDirectory;
            
        } catch (Exception e) {
            log.error("디렉토리 생성 중 오류 발생 - 이름: {}, 부모 ID: {}", name, parentId, e);
            throw e;
        }
    }

    /**
     * 디렉토리를 다른 위치로 이동하는 메소드
     * 
     * @param id 이동할 디렉토리 ID
     * @param newParentId 새로운 부모 디렉토리 ID
     * @param newSortOrder 새로운 정렬 순서
     * @throws IllegalArgumentException 디렉토리가 존재하지 않거나 순환 참조가 발생하는 경우
     */
    @Transactional
    public void moveDirectory(Long id, Long newParentId, int newSortOrder) {
        log.debug("디렉토리 이동 시작 - ID: {}, 새 부모 ID: {}, 새 정렬 순서: {}", id, newParentId, newSortOrder);
        
        Directory directory = directoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Directory not found with id: " + id));
        log.debug("이동할 디렉토리 조회됨 - 이름: {}, 현재 경로: {}", directory.getName(), directory.getPath());

        // 새 부모 설정
        Directory newParent = null;
        if (newParentId != null) {
            newParent = directoryRepository.findById(newParentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent directory not found with id: " + newParentId));
            
            // 순환 참조 체크
            Directory current = newParent;
            while (current != null) {
                if (current.getId().equals(id)) {
                    throw new IllegalArgumentException("Cannot move a directory to its own subdirectory");
                }
                current = current.getParent();
            }
            log.debug("새 부모 디렉토리 조회됨 - 이름: {}, 경로: {}", newParent.getName(), newParent.getPath());
        }

        // 정렬 순서 설정
        directory.setSortOrder(newSortOrder);
        
        // 부모 설정 (이 메서드 내에서 자동으로 이전 부모에서 제거하고 새 부모에 추가함)
        directory.setParent(newParent);
        
        // 저장
        directoryRepository.save(directory);
        
        // 하위 디렉토리들의 경로도 업데이트
        updateChildrenPaths(directory);
        
        log.debug("디렉토리 이동 완료 - 새 경로: {}", directory.getPath());
    }

    private void updateDirectoryPath(Directory directory) {
        Directory parent = directory.getParent();
        String newPath = parent == null ? "/" + directory.getName() : parent.getPath() + "/" + directory.getName();
        directory.setPath(newPath);
        log.debug("디렉토리 경로 업데이트 - ID: {}, 새 경로: {}", directory.getId(), newPath);
    }

    private void updateChildrenPaths(Directory parent) {
        Directory refreshedParent = directoryRepository.findById(parent.getId())
            .orElseThrow(() -> new IllegalArgumentException("Parent directory not found with id: " + parent.getId()));
        List<Directory> children = directoryRepository.findByParentOrderBySortOrder(refreshedParent);
        for (Directory child : children) {
            updateDirectoryPath(child);
            directoryRepository.save(child);
            log.debug("하위 디렉토리 경로 업데이트 - ID: {}, 새 경로: {}", child.getId(), child.getPath());
            updateChildrenPaths(child);
        }
    }

    /**
     * 디렉토리를 삭제하는 메소드
     * 
     * @param id 삭제할 디렉토리 ID
     * @throws IllegalArgumentException 디렉토리가 존재하지 않는 경우
     */
    @Transactional
    public void deleteDirectory(Long id) {
        log.debug("디렉토리 삭제 시작 - ID: {}", id);
        
        Directory directory = directoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Directory not found with id: " + id));
        
        // 하위 디렉토리가 있는지 확인
        Directory refreshedDirectory = directoryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Directory not found with id: " + id));
        List<Directory> children = directoryRepository.findByParentOrderBySortOrder(refreshedDirectory);
        if (!children.isEmpty()) {
            log.debug("하위 디렉토리가 있어 재귀적으로 삭제 - 하위 디렉토리 수: {}", children.size());
            for (Directory child : children) {
                deleteDirectory(child.getId());
            }
        }
        
        // 부모 디렉토리에서 제거
        Directory parent = directory.getParent();
        if (parent != null) {
            parent.getChildren().remove(directory);
            directoryRepository.save(parent);
            log.debug("부모 디렉토리에서 제거됨 - 부모 ID: {}", parent.getId());
        }
        
        // 디렉토리 삭제
        directoryRepository.delete(directory);
        log.debug("디렉토리 삭제 완료 - ID: {}", id);
    }
}