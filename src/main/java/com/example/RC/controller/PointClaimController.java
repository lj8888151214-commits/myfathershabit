package com.example.RC.controller;

import com.example.RC.dto.PointClaimCreateRequestDto;
import com.example.RC.dto.PointClaimResponseDto;
import com.example.RC.service.PointClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/claim")
@CrossOrigin(origins = {"https://plasticmoney.duckdns.org", "http://localhost:5173"}, allowCredentials = "true")
public class PointClaimController {

    private final PointClaimService pointClaimService;

    public PointClaimController(PointClaimService pointClaimService) {
        this.pointClaimService = pointClaimService;
    }

    // 1. 수령 토큰 발급 (현장 QR 생성 및 카카오톡 공유 공용)
    @PostMapping("/create-token")
    public ResponseEntity<PointClaimResponseDto> createToken(@RequestBody PointClaimCreateRequestDto request) {
        PointClaimResponseDto response = pointClaimService.createClaimToken(request);
        return ResponseEntity.ok(response);
    }

    // 2. 통합 포인트 합산 (QR 스캔 즉시 합산 & 카카오톡 메시지 링크 수령 공용)
    @PostMapping("/process")
    public ResponseEntity<PointClaimResponseDto> processClaim(
            @RequestParam String token,
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody(required = false) Map<String, String> body) {

        String username = null;
        String building = null;
        String unit = null;

        // 1) OAuth2 로그인 세션 확인 (카카오 / 네이버 등)
        if (principal != null) {
            username = (String) principal.getAttribute("email");
            if (username == null && principal.getAttributes().containsKey("response")) {
                Map<String, Object> resp = (Map<String, Object>) principal.getAttribute("response");
                if (resp != null) username = (String) resp.get("email");
            }
            if (username == null && principal.getAttributes().containsKey("kakao_account")) {
                Map<String, Object> kakao = (Map<String, Object>) principal.getAttribute("kakao_account");
                if (kakao != null) username = (String) kakao.get("email");
            }
            if (username == null) {
                username = principal.getName();
            }
        }

        // 2) 바디 파라미터 확인 (동/호수 수령자 또는 로컬 스토리지 계정)
        if (body != null) {
            if (username == null && body.containsKey("username") && !body.get("username").isBlank()) {
                username = body.get("username");
            }
            if (body.containsKey("building")) {
                building = body.get("building");
            }
            if (body.containsKey("unit")) {
                unit = body.get("unit");
            }
        }

        // 소셜 계정도 없고 동/호수 정보도 없으면 식별 불가 에러
        if ((username == null || username.isBlank()) && (building == null || unit == null || building.isBlank() || unit.isBlank())) {
            return ResponseEntity.status(401).body(
                    PointClaimResponseDto.requireLogin("포인트를 합산받을 소셜 로그인이나 동/호수 정보가 필요합니다.")
            );
        }

        // 유연한 포인트 합산 로직 호출
        PointClaimResponseDto response = pointClaimService.processClaimFlexible(token, username, building, unit);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(response);
    }
}