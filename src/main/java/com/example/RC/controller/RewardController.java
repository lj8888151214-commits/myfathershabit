package com.example.RC.controller;

import com.example.RC.dto.RewardRecordRequestDto;
import com.example.RC.entity.RewardHistory;
import com.example.RC.entity.User;
import com.example.RC.repository.RewardHistoryRepository;
import com.example.RC.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = {"http://localhost:5173", "https://plasticmoney.duckdns.org"}, allowCredentials = "true")
public class RewardController {

    private final RewardHistoryRepository rewardHistoryRepository;
    private final UserRepository userRepository;

    public RewardController(RewardHistoryRepository rewardHistoryRepository, UserRepository userRepository) {
        this.rewardHistoryRepository = rewardHistoryRepository;
        this.userRepository = userRepository;
    }

    // 1. 재활용 감지 시 이력 저장 및 포인트 적립 API (소셜 로그인 & 동·호수 세대 공용)
    @PostMapping("/record")
    public ResponseEntity<?> recordReward(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody RewardRecordRequestDto request) {

        String username = null;
        String address = request.getAddress();
        String building = request.getBuilding();
        String unit = request.getUnit();
        int earnPoints = request.getEarn() > 0 ? request.getEarn() : 100;

        // 1) 소셜 로그인 사용자 정보 추출 (principal 최우선)
        if (principal != null) {
            Map<String, Object> attributes = principal.getAttributes();
            username = (String) principal.getAttribute("email");

            if (username == null && attributes.containsKey("response")) {
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                if (response != null) username = (String) response.get("email");
            }
            if (username == null && attributes.containsKey("kakao_account")) {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                if (kakaoAccount != null) username = (String) kakaoAccount.get("email");
            }
            if (username == null) {
                username = principal.getName();
            }
        } else if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            username = request.getUsername();
        }

        final String reqAddress = (request.getAddress() != null && !request.getAddress().isBlank()) ? request.getAddress().trim() : null;
        final String reqBuilding = (request.getBuilding() != null && !request.getBuilding().isBlank()) ? request.getBuilding().trim() : null;
        final String reqUnit = (request.getUnit() != null && !request.getUnit().isBlank()) ? request.getUnit().trim() : null;

        User targetUser = null;

        // 2) 유저 조회 및 포인트 / 주소 / 동·호수 업데이트
        if (username != null && !username.isEmpty()) {
            // [경로 A] 소셜 로그인 계정 기준 처리
            targetUser = userRepository.findByUsername(username).orElse(null);
            if (targetUser != null) {
                targetUser.setPoints(targetUser.getPoints() + earnPoints);

                // 💡 [핵심] 도로명 주소 업데이트 및 변수 동기화
                if (reqAddress != null) {
                    targetUser.setAddress(reqAddress);
                    address = reqAddress;
                } else if (targetUser.getAddress() != null && !targetUser.getAddress().isBlank()) {
                    address = targetUser.getAddress();
                }

                // 건물 동 업데이트 및 변수 동기화
                if (reqBuilding != null) {
                    targetUser.setBuilding(reqBuilding);
                    building = reqBuilding;
                } else if (targetUser.getBuilding() != null) {
                    building = targetUser.getBuilding();
                }

                // 상세 호수 업데이트 및 변수 동기화
                if (reqUnit != null) {
                    targetUser.setUnit(reqUnit);
                    unit = reqUnit;
                } else if (targetUser.getUnit() != null) {
                    unit = targetUser.getUnit();
                }

                userRepository.save(targetUser);
            }
        } else if (building != null && !building.isEmpty() && unit != null && !unit.isEmpty()) {
            // [경로 B] 비로그인 동·호수 세대 기준 처리 (가족 공유 포인트)
            targetUser = userRepository.findByBuildingAndUnit(building, unit).orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername(reqBuilding + "_" + reqUnit + "_household");
                newUser.setAddress(reqAddress);
                newUser.setBuilding(reqBuilding);
                newUser.setUnit(reqUnit);
                newUser.setPoints(0);
                return userRepository.save(newUser);
            });

            targetUser.setPoints(targetUser.getPoints() + earnPoints);

            // 기존 세대 유저에 주소가 채워지지 않은 상태였고 이번에 주소가 들어왔다면 보강
            if (reqAddress != null) {
                targetUser.setAddress(reqAddress);
                address = reqAddress;
            } else if (targetUser.getAddress() != null) {
                address = targetUser.getAddress();
            }

            userRepository.save(targetUser);
        } else {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인 정보 또는 동·호수 정보가 필요합니다."));
        }

        // 3) 리워드 히스토리(reward_history) 엔티티 생성 및 저장
        RewardHistory history = new RewardHistory();

        if (targetUser != null) {
            if (address == null || address.isBlank()) {
                address = targetUser.getAddress();
            }
            if (targetUser.getBuilding() != null && !targetUser.getBuilding().isBlank()) {
                building = targetUser.getBuilding();
            }
            if (targetUser.getUnit() != null && !targetUser.getUnit().isBlank()) {
                unit = targetUser.getUnit();
            }
            if (username == null || username.isBlank()) {
                username = targetUser.getUsername();
            }
        }

        history.setUsername(username != null ? username : "guest");
        history.setAddress(address); // 👈 확정된 도로명 주소 매핑
        history.setBuilding(building != null ? building : "");
        history.setUnit(unit != null ? unit : "");
        history.setItem(request.getItem() != null ? request.getItem() : "일반 재활용품");
        history.setMaterialType(request.getMaterialType() != null ? request.getMaterialType() : "PET");
        history.setCount(request.getCount() > 0 ? request.getCount() : 1);
        history.setEarn(earnPoints);
        history.setRecordedAt(java.time.LocalDateTime.now());

        rewardHistoryRepository.save(history);

        System.out.println(">>> [DB 저장 성공] username: " + history.getUsername()
                + ", address: " + history.getAddress()
                + ", building: " + history.getBuilding()
                + ", unit: " + history.getUnit());

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("message", "리워드 저장 및 포인트 적립 완료");
        result.put("earnedPoints", earnPoints);
        result.put("totalPoints", targetUser != null ? targetUser.getPoints() : earnPoints);
        result.put("address", address != null ? address : "");
        result.put("building", building != null ? building : "");
        result.put("unit", unit != null ? unit : "");

        return ResponseEntity.ok(result);
    }

    // 2. 맞춤형 리워드 상세 내역 조회 API
    @GetMapping("/history")
    public ResponseEntity<List<RewardHistory>> getRewardHistory(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String unit) {

        List<RewardHistory> historyList;

        if (username != null && !username.isEmpty()) {
            historyList = rewardHistoryRepository.findByUsernameOrderByIdDesc(username);
        } else if (building != null && !building.isEmpty() && unit != null && !unit.isEmpty()) {
            historyList = rewardHistoryRepository.findByBuildingAndUnitOrderByIdDesc(building, unit);
        } else {
            historyList = rewardHistoryRepository.findAllByOrderByIdDesc();
        }

        return ResponseEntity.ok(historyList);
    }
}