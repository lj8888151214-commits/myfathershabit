package com.example.RC.service;

import com.example.RC.dto.PointClaimCreateRequestDto;
import com.example.RC.dto.PointClaimResponseDto;
import com.example.RC.entity.PointClaim;
import com.example.RC.entity.RewardHistory;
import com.example.RC.entity.User;
import com.example.RC.repository.PointClaimRepository;
import com.example.RC.repository.RewardHistoryRepository;
import com.example.RC.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PointClaimService {

    private final PointClaimRepository pointClaimRepository;
    private final UserRepository userRepository;
    private final RewardHistoryRepository rewardHistoryRepository;

    public PointClaimService(PointClaimRepository pointClaimRepository,
                             UserRepository userRepository,
                             RewardHistoryRepository rewardHistoryRepository) {
        this.pointClaimRepository = pointClaimRepository;
        this.userRepository = userRepository;
        this.rewardHistoryRepository = rewardHistoryRepository;
    }

    /**
     * 1. 수령 토큰 발급 및 발신자 포인트 즉시 차감
     */
    // PointClaimService.java의 createClaimToken 메서드 상단에 로그 추가

    // PointClaimService.java 내부

    /**
     * 1. 수령 토큰 발급 및 발신자 포인트 즉시 차감 (NPE 및 DB 제약조건 완벽 방어)
     */
    @Transactional
    public PointClaimResponseDto createClaimToken(PointClaimCreateRequestDto request) {
        try {
            // 💡 1. request 자체 및 points 널 방어
            int pointsToSend = 100;
            String username = null;
            String building = null;
            String unit = null;

            if (request != null) {
                if (request.getPoints() > 0) {
                    pointsToSend = request.getPoints();
                }
                username = request.getUsername();
                building = request.getBuilding();
                unit = request.getUnit();
            }

            System.out.println(">>> [QR/선물 토큰 생성 시도] username: " + username
                    + ", building: " + building + ", unit: " + unit + ", points: " + pointsToSend);

            User sender = null;

            // 1) 동·호수 기준 검색
            if (building != null && unit != null && !building.isBlank() && !unit.isBlank()) {
                try {
                    sender = userRepository.findByBuildingAndUnit(building.trim(), unit.trim()).orElse(null);
                } catch (Exception e) {
                    System.err.println(">>> [경고] users 테이블에 동일 동/호수 데이터가 2개 이상 존재합니다. 첫 번째 유저로 매핑합니다: " + e.getMessage());
                    // 만약 UserRepository에 findFirstByBuildingAndUnit가 있다면 호출, 없으면 household 계정명으로 대체
                    sender = userRepository.findByUsername(building.trim() + "_" + unit.trim() + "_household").orElse(null);
                }
            }

            // 2) username 기준 검색
            if (sender == null && username != null && !username.isBlank()) {
                sender = userRepository.findByUsername(username.trim()).orElse(null);
            }

            // 💡 2. 발신자 포인트 차감 시 NPE 방어 (Integer null 체크)
            if (sender != null) {
                int senderPoints = 0;
                try {
                    senderPoints = sender.getPoints(); // 만약 null이면 0으로 처리
                } catch (Exception e) {
                    senderPoints = 0;
                }

                if (senderPoints >= pointsToSend) {
                    sender.setPoints(senderPoints - pointsToSend);
                    userRepository.saveAndFlush(sender);
                    System.out.println(">>> 발신자 포인트 차감 완료: " + sender.getPoints());
                }
            }

            // 💡 3. 토큰 엔티티 생성 및 DB 저장
            String token = UUID.randomUUID().toString();
            PointClaim claim = new PointClaim();
            claim.setToken(token);
            claim.setPoints(pointsToSend);
            claim.setClaimed(false);
            claim.setCreatedAt(LocalDateTime.now());

            // PointClaim 엔티티에 senderUsername 필드가 있다면 주석 해제하여 세팅
            // claim.setSenderUsername(sender != null ? sender.getUsername() : "kiosk_guest");

            pointClaimRepository.saveAndFlush(claim);

            System.out.println(">>> [QR 토큰 발급 성공] token: " + token + ", 포인트: " + pointsToSend);

            PointClaimResponseDto response = new PointClaimResponseDto();
            response.setSuccess(true);
            response.setToken(token);
            return response;

        } catch (Exception e) {
            System.err.println(">>> ❌ [createClaimToken 에러 원인]: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace(); // 콘솔에 정확한 줄 번호 출력
            return PointClaimResponseDto.fail("토큰 생성 실패: " + e.getMessage());
        }
    }

    /**
     * 2. 수령 시 수령자 지갑에 가산
     */
    @Transactional
    public PointClaimResponseDto processClaimFlexible(String token, String targetUsername, String building, String unit) {
        PointClaim claim = pointClaimRepository.findByToken(token).orElse(null);
        if (claim == null) {
            return PointClaimResponseDto.fail("유효하지 않은 포인트 수령 링크입니다.");
        }
        if (claim.isClaimed()) {
            return PointClaimResponseDto.fail("이미 다른 사용자에게 수령 완료된 포인트입니다.");
        }

        User receiver = null;

        // 1. 수령 대상 식별
        if (targetUsername != null && !targetUsername.trim().isEmpty()) {
            receiver = findOrCreateUser(targetUsername);
        } else if (building != null && unit != null && !building.isBlank() && !unit.isBlank()) {
            receiver = userRepository.findByBuildingAndUnit(building.trim(), unit.trim())
                    .orElseGet(() -> findOrCreateUser(building.trim() + "_" + unit.trim() + "_household"));
        }

        if (receiver == null) {
            return PointClaimResponseDto.fail("수령 대상을 찾을 수 없습니다.");
        }

        // 2. 수령자 포인트 가산
        int beforePoints = receiver.getPoints();
        int claimPoints = claim.getPoints();
        int afterPoints = beforePoints + claimPoints;

        System.out.println(">>> [포인트 합산 시작]");
        System.out.println(">>> 수령자(Username): " + receiver.getUsername());
        System.out.println(">>> 수령 전 보유량: " + beforePoints);
        System.out.println(">>> 이번 토큰 금액: " + claimPoints);
        System.out.println(">>> 합산 후 잔액: " + afterPoints);

        receiver.setPoints(afterPoints);
        userRepository.saveAndFlush(receiver);

        // 3. 토큰 무효화
        claim.setClaimed(true);
        claim.setClaimedByUsername(receiver.getUsername());
        claim.setClaimedAt(LocalDateTime.now());
        pointClaimRepository.saveAndFlush(claim);

        // 4. 수령 내역 저장
        saveHistory(receiver, "에코포인트 선물 수령 (합산)", claimPoints);

        // 💡 [핵심 4] 수신자 완료 DTO 반환 (존재하는 변수로만 구성)
        PointClaimResponseDto response = new PointClaimResponseDto();
        response.setSuccess(true);
        response.setMessage(claimPoints + " 에코포인트가 성공적으로 합산되었습니다!");
        response.setToken(token);


        return response;
    }

    private User findOrCreateUser(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return null;
        }

        final String finalTargetUsername = identifier.trim();

        return userRepository.findByUsername(finalTargetUsername)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(finalTargetUsername);
                    newUser.setRole("ROLE_USER");
                    newUser.setPoints(0);
                    return userRepository.save(newUser);
                });
    }

    private void saveHistory(User user, String reason, int points) {
        RewardHistory history = new RewardHistory();
        history.setUsername(user.getUsername());
        history.setBuilding(user.getBuilding());
        history.setUnit(user.getUnit());
        history.setItem(reason);
        history.setMaterialType("BONUS");
        history.setCount(1);
        history.setEarn(points);
        history.setRecordedAt(LocalDateTime.now());
        rewardHistoryRepository.save(history);
    }
}