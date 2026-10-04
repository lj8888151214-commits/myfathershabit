package com.example.RC.controller;

import com.example.RC.entity.User;
import com.example.RC.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "https://plasticmoney.duckdns.org"}, allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 소셜 로그인 이메일 및 식별자 추출 헬퍼 메서드
    private String resolveSocialUsername(OAuth2User principal, OAuth2AuthenticationToken authToken) {
        if (principal == null) return null;

        String provider = (authToken != null) ? authToken.getAuthorizedClientRegistrationId() : "";
        Map<String, Object> attributes = principal.getAttributes();

        // 1. 네이버 -> response 객체 내부의 email 추출
        if ("naver".equalsIgnoreCase(provider) || attributes.containsKey("response")) {
            Object respObj = attributes.get("response");
            if (respObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseMap = (Map<String, Object>) respObj;
                if (responseMap.get("email") != null && !responseMap.get("email").toString().isBlank()) {
                    return responseMap.get("email").toString().trim();
                }
            }
        }

        // 2. 카카오 -> kakao_account 객체 내부의 email 추출
        if ("kakao".equalsIgnoreCase(provider) || attributes.containsKey("kakao_account")) {
            Object accountObj = attributes.get("kakao_account");
            if (accountObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> kakaoAccount = (Map<String, Object>) accountObj;
                if (kakaoAccount.get("email") != null && !kakaoAccount.get("email").toString().isBlank()) {
                    return kakaoAccount.get("email").toString().trim();
                }
            }
        }

        // 3. 구글 및 최상위 email 속성 추출
        if (attributes.get("email") != null && !attributes.get("email").toString().isBlank()) {
            return attributes.get("email").toString().trim();
        }

        return principal.getName();
    }

    // 1. 내 정보 조회 (/api/user/me)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authToken) {
        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");

        String username = resolveSocialUsername(principal, authToken);
        System.out.println(">>> [/api/user/me 호출] 로그인된 유저 식별자: [" + username + "]");

        String provider = (authToken != null) ? authToken.getAuthorizedClientRegistrationId() : "kakao";

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(username);
                    newUser.setProvider(provider);
                    newUser.setProviderId(principal.getName());
                    newUser.setRole("ROLE_USER");
                    newUser.setPoints(0);
                    return userRepository.save(newUser);
                });

        return ResponseEntity.ok(user);
    }

    // 2. 포인트 조회 (/api/user/points) - 중복 선언 제거 및 세대 완벽 통합
    @GetMapping("/points")
    public ResponseEntity<Map<String, Object>> getUserPoints(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String unit,
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authToken) {

        String targetUsername = username;
        if ((targetUsername == null || targetUsername.isBlank()) && principal != null) {
            targetUsername = resolveSocialUsername(principal, authToken);
        }

        String addr = (address != null) ? address.trim() : "";
        String b = (building != null) ? building.trim() : "";
        String u = (unit != null) ? unit.trim() : "";

        User targetUser = null;

        // 💡 1순위: 도로명 주소와 동·호수가 전달된 경우 동일 세대 계정 우선 조회
        if (!b.isBlank() && !u.isBlank()) {
            if (!addr.isBlank()) {
                targetUser = userRepository.findByAddressAndBuildingAndUnit(addr, b, u).orElse(null);
            }
            if (targetUser == null) {
                targetUser = userRepository.findByBuildingAndUnit(b, u).orElse(null);
            }
            if (targetUser == null) {
                targetUser = userRepository.findByUsername(b + "_" + u + "_household")
                        .or(() -> userRepository.findByUsername(b + "-" + u))
                        .orElse(null);
            }
        }

        // 💡 2순위: 세대 정보로 못 찾았고 소셜 로그인 정보가 있는 경우
        if (targetUser == null && targetUsername != null && !targetUsername.isBlank()) {
            targetUser = userRepository.findByUsername(targetUsername.trim()).orElse(null);
        }

        int currentPoints = (targetUser != null) ? targetUser.getPoints() : 0;
        String finalAddr = (targetUser != null && targetUser.getAddress() != null) ? targetUser.getAddress() : addr;
        String finalBuilding = (targetUser != null && targetUser.getBuilding() != null) ? targetUser.getBuilding() : b;
        String finalUnit = (targetUser != null && targetUser.getUnit() != null) ? targetUser.getUnit() : u;

        System.out.println(">>> [/api/user/points 결과] 주소: [" + finalAddr + "] "
                + finalBuilding + "동 " + finalUnit + "호 -> 포인트: " + currentPoints + " P");

        return ResponseEntity.ok(Map.of(
                "points", currentPoints,
                "address", finalAddr,
                "building", finalBuilding,
                "unit", finalUnit
        ));
    }

    // 3. 세대 동·호수 등록/업데이트 API
    @PatchMapping("/update-household")
    public ResponseEntity<?> updateHousehold(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authToken) {

        String address = request.get("address");
        String building = request.get("building");
        String unit = request.get("unit");

        if (building == null || unit == null || building.isBlank() || unit.isBlank()) {
            return ResponseEntity.badRequest().body("동·호수 정보가 올바르지 않습니다.");
        }

        String username = resolveSocialUsername(principal, authToken);
        if (username != null) {
            User user = userRepository.findByUsername(username).orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername(username);
                newUser.setPoints(0);
                return newUser;
            });
            if (address != null && !address.isBlank()) {
                user.setAddress(address.trim());
            }
            user.setBuilding(building.trim());
            user.setUnit(unit.trim());
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "address", address != null ? address : "",
                "building", building,
                "unit", unit
        ));
    }

    // 4. 포인트 단건 적립
    @PostMapping("/add-point")
    public ResponseEntity<?> addPoint(
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authToken) {
        if (principal == null) return ResponseEntity.status(401).build();

        String username = resolveSocialUsername(principal, authToken);
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setPoints(user.getPoints() + 1);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "points", user.getPoints()));
    }

    // 5. 세대 로그인 및 주소/동·호수 등록 (소셜 세션 무효화 & 동일 세대 포인트 유지)
    @PostMapping("/household-login")
    public ResponseEntity<?> householdLogin(
            @RequestBody Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        String address = request.get("address");
        String building = request.get("building");
        String unit = request.get("unit");

        if (building == null || unit == null || building.isBlank() || unit.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "동·호수 정보를 입력해주세요."));
        }

        String addr = (address != null) ? address.trim() : "";
        String b = building.trim();
        String u = unit.trim();

        // 💡 1. 소셜 로그인 세션 무효화 (소셜 자동 로그아웃)
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 💡 2. [핵심] 주소와 동·호수가 같은 기존 세대 계정 우선 조회 (기존 포인트 보존)
        User householdUser = null;
        if (!addr.isBlank()) {
            householdUser = userRepository.findByAddressAndBuildingAndUnit(addr, b, u).orElse(null);
        }
        if (householdUser == null) {
            householdUser = userRepository.findByBuildingAndUnit(b, u).orElse(null);
        }
        if (householdUser == null) {
            householdUser = userRepository.findByUsername(b + "_" + u + "_household")
                    .or(() -> userRepository.findByUsername(b + "-" + u))
                    .orElse(null);
        }

        // 기존 세대 계정이 없으면 신규 생성
        if (householdUser == null) {
            householdUser = new User();
            householdUser.setUsername(b + "_" + u + "_household");
            householdUser.setAddress(addr);
            householdUser.setBuilding(b);
            householdUser.setUnit(u);
            householdUser.setRole("ROLE_USER");
            householdUser.setPoints(0);
            householdUser = userRepository.save(householdUser);
        } else {
            // 기존 계정이 존재하는데 주소 정보가 비어있던 경우 업데이트
            if ((householdUser.getAddress() == null || householdUser.getAddress().isBlank()) && !addr.isBlank()) {
                householdUser.setAddress(addr);
                userRepository.save(householdUser);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "username", householdUser.getUsername(),
                "address", householdUser.getAddress() != null ? householdUser.getAddress() : "",
                "building", b,
                "unit", u,
                "points", householdUser.getPoints()
        ));
    }
}