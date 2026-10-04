package com.example.RC.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter

public class PointClaimCreateRequestDto {
    private int points;
    private String username; // 👈 추가

    private String building;
    private String unit;

    public PointClaimCreateRequestDto() {
    }

    public PointClaimCreateRequestDto(int points, String building, String unit) {
        this.points = points;
        this.building = building;
        this.unit = unit;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    // 👈 이 메서드가 없어서 빨간 줄이 떴던 부분입니다.
    public String getUsername() {
        return username;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}