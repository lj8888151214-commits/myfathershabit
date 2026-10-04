package com.example.RC.repository;

import com.example.RC.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 소셜 로그인 계정(이메일 또는 아이디)으로 유저 조회
    Optional<User> findByUsername(String username);

    // 💡 동·호수 정보로 세대 유저 조회 (가족 공유 포인트 관리용)
    Optional<User> findByBuildingAndUnit(String building, String unit);
    Optional<User> findByAddressAndBuildingAndUnit(String address, String building, String unit);
}