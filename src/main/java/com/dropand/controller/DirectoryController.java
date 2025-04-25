package com.dropand.controller;

import com.dropand.domain.Directory;
import com.dropand.dto.DirectoryOrderDto;
import com.dropand.dto.MoveDirectoryRequest;
import com.dropand.dto.CreateDirectoryRequest;
import com.dropand.service.DirectoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 디렉토리 관련 REST API를 처리하는 컨트롤러
 * 
 * 주요 기능:
 * 1. 디렉토리 CRUD API 엔드포인트 제공
 * 2. 디렉토리 트리 구조 조회 API
 * 3. 디렉토리 이동 API
 * 4. 요청/응답 데이터 변환 및 검증
 */

@RestController
@RequestMapping("/api/directories")
@CrossOrigin(
    origins = "*",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class DirectoryController {

    private static final Logger log = LoggerFactory.getLogger(DirectoryController.class);
    private final DirectoryService directoryService;

    public DirectoryController(DirectoryService directoryService) {
        this.directoryService = directoryService;
        log.info("DirectoryController 초기화됨");
    }

    /**
     * 전체 디렉토리 목록을 조회하는 API
     * HTTP GET 요청을 처리합니다.
     * 
     * @return 전체 디렉토리 목록
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Directory>> getAllDirectories() {
        log.debug("전체 디렉토리 목록 조회 요청");
        return ResponseEntity.ok(directoryService.getAllDirectories());
    }

    @GetMapping(value = "/tree", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Directory>> getDirectoryTree() {
        log.debug("디렉토리 트리 조회 요청");
        return ResponseEntity.ok(directoryService.getDirectoryTree());
    }

    @GetMapping(value = "/{parentId}/children", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Directory>> getSubDirectories(@PathVariable Long parentId) {
        log.debug("하위 디렉토리 조회 요청 - 부모 ID: {}", parentId);
        return ResponseEntity.ok(directoryService.getSubDirectories(parentId));
    }

    /**
     * 새로운 디렉토리를 생성하는 API
     * HTTP POST 요청을 처리합니다.
     * 
     * @param request 생성할 디렉토리 정보
     * @return 생성된 디렉토리 정보
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createDirectory(@RequestBody(required = true) CreateDirectoryRequest request) {
        try {
            log.info("디렉토리 생성 요청 수신 - 요청 데이터: {}", request);
            
            if (request == null) {
                String errorMessage = "요청 본문이 비어있습니다.";
                log.error(errorMessage);
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + errorMessage + "\"}");
            }
            
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                String errorMessage = "디렉토리 이름은 필수입니다.";
                log.error(errorMessage);
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + errorMessage + "\"}");
            }

            Directory directory = directoryService.createDirectory(request.getName().trim(), request.getParentId());
            log.info("디렉토리 생성 성공 - ID: {}, 이름: {}, 경로: {}, 부모 ID: {}", 
                directory.getId(), directory.getName(), directory.getPath(),
                directory.getParent() != null ? directory.getParent().getId() : null);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(directory);
                
        } catch (IllegalArgumentException e) {
            log.error("디렉토리 생성 실패 - 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            log.error("디렉토리 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\": \"디렉토리 생성에 실패했습니다: " + e.getMessage() + "\"}");
        }
    }

    /**
     * 디렉토리를 삭제하는 API
     * HTTP DELETE 요청을 처리합니다.
     * 
     * @param id 삭제할 디렉토리의 ID
     * @return 삭제 성공 여부
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDirectory(@PathVariable Long id) {
        directoryService.deleteDirectory(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 디렉토리를 이동하는 API
     * HTTP POST 요청을 처리합니다.
     * 
     * @param id 이동할 디렉토리의 ID
     * @param request 이동할 대상 디렉토리의 ID와 정렬 순서
     * @return 이동된 디렉토리 정보
     */
    @PostMapping("/{id}/move")
    public ResponseEntity<Void> moveDirectory(
            @PathVariable Long id,
            @RequestBody MoveDirectoryRequest request) {
        if (request.getSortOrder() == null) {
            List<Directory> siblings = request.getParentId() == null ?
                directoryService.getDirectoryTree() :
                directoryService.getSubDirectories(request.getParentId());
            
            int maxSortOrder = siblings.stream()
                .mapToInt(Directory::getSortOrder)
                .max()
                .orElse(0);
            request.setSortOrder(maxSortOrder + 1);
        }
        
        directoryService.moveDirectory(id, request.getParentId(), request.getSortOrder());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/order")
    public ResponseEntity<Void> updateDirectoryOrder(@RequestBody List<DirectoryOrderDto> orderList) {
        directoryService.updateDirectoryOrder(orderList);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<Void> moveDirectoryPut(
            @PathVariable Long id,
            @RequestBody DirectoryOrderDto orderDto) {
        orderDto.setId(id);
        directoryService.updateDirectoryOrder(List.of(orderDto));
        return ResponseEntity.ok().build();
    }
} 