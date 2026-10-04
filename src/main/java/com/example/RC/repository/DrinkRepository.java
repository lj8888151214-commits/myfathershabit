package com.example.RC.repository; // 본인 패키지 경로에 맞게 확인

import com.example.RC.entity.DrinkItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DrinkRepository extends JpaRepository<DrinkItem, Long> {
}