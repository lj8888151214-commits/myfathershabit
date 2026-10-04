package com.example.RC.repository;

import com.example.RC.entity.RewardHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardHistoryRepository extends JpaRepository<RewardHistory, Long> {

    // 전체 내역 최신순 조회
    List<RewardHistory> findAllByOrderByIdDesc();

    // 💡 소셜 아이디(username)별 히스토리 최신순 조회
    List<RewardHistory> findByUsernameOrderByIdDesc(String username);

    // 💡 동·호수 세대별 히스토리 최신순 조회
    List<RewardHistory> findByBuildingAndUnitOrderByIdDesc(String building, String unit);
}