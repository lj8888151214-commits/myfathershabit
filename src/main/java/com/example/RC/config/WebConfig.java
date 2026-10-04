package com.example.RC.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174") // 5173과 5174 모두 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // 👈 이 메서드를 추가합니다: /claim 주소로 접근 시 index.html로 포워딩
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/claim")
                .setViewName("forward:/index.html");
    }
}