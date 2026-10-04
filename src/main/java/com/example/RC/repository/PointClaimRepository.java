package com.example.RC.repository;

import com.example.RC.entity.PointClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PointClaimRepository extends JpaRepository<PointClaim, Long> {
    Optional<PointClaim> findByToken(String token);

    // 💡 중복 토큰 발생 시에도 가장 최근 레코드 1건만 안전하게 가져오는 메서드
    Optional<PointClaim> findFirstByTokenOrderByIdDesc(String token);
}