package com.dropand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DropAnd 애플리케이션의 메인 클래스
 * 
 * 주요 기능:
 * 1. 스프링 부트 애플리케이션 시작점
 * 2. 애플리케이션 설정 및 초기화
 * 3. 컴포넌트 스캔 및 빈 등록
 */

@SpringBootApplication
public class DropAndApplication {
    public static void main(String[] args) {
        SpringApplication.run(DropAndApplication.class, args);
    }
} 