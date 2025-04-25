package com.dropand.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 메인 페이지 관련 요청을 처리하는 컨트롤러
 * 
 * 주요 기능:
 * 1. 메인 페이지 라우팅
 * 2. 디렉토리 관리 페이지 제공
 * 3. 페이지 접근 권한 관리
 */

@Controller
public class MainController {
    
    @GetMapping("/")
    public String index() {
        return "index";
    }
} 