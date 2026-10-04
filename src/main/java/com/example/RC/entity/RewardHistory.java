package com.example.RC.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RewardHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = true)
    private String username; // 소셜 로그인 유저 이메일/ID (선택)

    @Column(name = "building", nullable = true)
    private String building; // 동 정보 (선택, 예: "101동")

    @Column(name = "unit", nullable = true)
    private String unit; // 호수 정보 (선택, 예: "1204호")

    @Column(nullable = false)
    private String item; // 품목 이름 (예: 콜라, 페트병 등)

    @Column(nullable = false)
    private String materialType; // 재질 유형 (PET, CAN, COLA 등)



    @Column(nullable = false)
    private int count; // 건수

    @Column(nullable = false)
    private int earn; // 적립 포인트

    @Column(nullable = false)
    private LocalDateTime recordedAt;


    @Column(name = "address")
    private String address;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @PrePersist
    public void prePersist() {
        this.recordedAt = LocalDateTime.now();
    }




    // --- 수동 세터 메서드 ---
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public void setMaterialType(String materialType) {
        this.materialType = materialType;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public void setEarn(int earn) {
        this.earn = earn;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    // --- 수동 겟터 메서드 ---
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getBuilding() {
        return building;
    }

    public String getUnit() {
        return unit;
    }

    public String getItem() {
        return item;
    }

    public String getMaterialType() {
        return materialType;
    }

    public int getCount() {
        return count;
    }

    public int getEarn() {
        return earn;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
}