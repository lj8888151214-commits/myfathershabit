package com.example.RC.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id; // 👈 이 부분을 jakarta.persistence로 변경해야 합니다!
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "drink_item")
@Getter
@Setter                  // 👈 이 부분이 핵심입니다! (Getter/Setter 자동 생성)
@NoArgsConstructor
public class DrinkItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String drinkName;
    private String materialType;
    private String imagePath;

    private LocalDateTime createdAt = LocalDateTime.now();
}