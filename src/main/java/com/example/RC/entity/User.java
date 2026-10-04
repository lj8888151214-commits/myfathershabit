package com.example.RC.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "address")
    private String address;

    @Column(unique = true, nullable = false)
    private String username; // 소셜 로그인의 경우 이메일 또는 고유 ID, 주민의 경우 입력한 주소(아이디)

    private String role; // 'ROLE_ADMIN' (소셜 로그인 관리자) 또는 'ROLE_USER' (주민)

    @Column(nullable = false)
    private int points = 0; // 사용자별 개별 포인트 (기본값 0)


    // --- 새로 추가하면 좋은 동·호수 및 소셜 로그인 필드 ---
    private String building; // 동 (예: "101동")
    private String unit;     // 호수 (예: "1204호")

    private String provider;   // 소셜 로그인 제공자 (KAKAO, NAVER, GOOGLE 등)
    private String providerId; // 소셜 서비스에서의 고유 사용자 번호

    // --- 수동 세터/겟터 메서드 (필요에 따라 확장) ---
    public void setBuilding(String building) {
        this.building = building;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getBuilding() {
        return building;
    }

    public String getUnit() {
        return unit;
    }

    // --- 수동 세터 메서드 ---
    public void setRole(String role) {
        this.role = role;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // --- 수동 겟터 메서드 (남은 에러 방지용) ---
    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public int getPoints() {
        return points;
    }

    public Long getId() {
        return id;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }



    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}