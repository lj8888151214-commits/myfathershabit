package com.example.RC.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // 루트, OAuth2, 로그인 관련, 정적 리소스(js, css, 이미지 등) 모두 허용
                        .requestMatchers("/", "/oauth2/**", "/login/**", "/error", "/favicon.ico", "/assets/**", "/*.js", "/*.css").permitAll()
                        .requestMatchers("/api/user/me").authenticated()
                        .requestMatchers("/api/rewards/**").permitAll()
                        // 그 외의 요청도 일단 열어두고 리액트 라우터에 맡기거나, API별로 제어
                        .anyRequest().permitAll() // 임시로 전체 허용 후 필요한 곳만 authenticated로 잠그는 것이 테스트에 수월합니다.
                )
                .formLogin(form -> form.disable())
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("https://plasticmoney.duckdns.org", true)
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(authorizationRequestResolver(clientRegistrationRepository))
                        )
                );

        return http.build();
    }

    // 카카오 PKCE 파라미터 충돌(:1 오류)을 방지하는 리졸버 설정
    private OAuth2AuthorizationRequestResolver authorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");

        resolver.setAuthorizationRequestCustomizer(customizer -> {
            customizer.attributes(attributes -> {
                attributes.remove("code_challenge");
                attributes.remove("code_challenge_method");
            }).additionalParameters(params -> {
                params.remove("code_challenge");
                params.remove("code_challenge_method");
            });
        });

        return resolver;
    }

    // CORS 허용 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "https://plasticmoney.duckdns.org"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}