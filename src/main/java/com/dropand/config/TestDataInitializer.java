package com.dropand.config;

import com.dropand.domain.Directory;
import com.dropand.repository.DirectoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 테스트용 초기 데이터를 생성하는 설정 클래스
 * 
 * 주요 기능:
 * 1. 애플리케이션 시작 시 테스트 데이터 생성
 * 2. 샘플 디렉토리 구조 생성
 * 3. 테스트 사용자 계정 생성
 */

@Configuration
@RequiredArgsConstructor
public class TestDataInitializer {

    private final DirectoryRepository directoryRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // 루트 디렉토리 생성
            Directory root1 = new Directory();
            root1.setName("프로젝트");
            root1.setSortOrder(1);
            root1.setPath("/projects");
            directoryRepository.save(root1);

            Directory root2 = new Directory();
            root2.setName("문서");
            root2.setSortOrder(2);
            root2.setPath("/documents");
            directoryRepository.save(root2);

            // 하위 디렉토리 생성
            Directory sub1 = new Directory();
            sub1.setName("웹 개발");
            sub1.setSortOrder(1);
            sub1.setPath("/projects/web");
            sub1.setParent(root1);
            directoryRepository.save(sub1);

            Directory sub2 = new Directory();
            sub2.setName("모바일 앱");
            sub2.setSortOrder(2);
            sub2.setPath("/projects/mobile");
            sub2.setParent(root1);
            directoryRepository.save(sub2);

            Directory sub3 = new Directory();
            sub3.setName("기술 문서");
            sub3.setSortOrder(1);
            sub3.setPath("/documents/tech");
            sub3.setParent(root2);
            directoryRepository.save(sub3);
        };
    }
} 