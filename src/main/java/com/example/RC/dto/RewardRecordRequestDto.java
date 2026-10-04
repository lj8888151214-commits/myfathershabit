package com.example.RC.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RewardRecordRequestDto {
    private String username;    // (선택) 요청하는 유저의 이메일 또는 식별 ID
    private String address;   // 👈 도로명 주소 추가
    private String building;    // (선택) 동 정보 (예: "101동")
    private String unit;        // (선택) 호수 정보 (예: "1204호")

    private String item;        // 재활용품 항목 (예: "투명 페트병")
    private String materialType;// 재질 유형 (예: "PET")
    private int count;          // 개수
    private int earn;           // 적립 포인트


    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // --- 수동 세터 메서드 ---
    public void setUsername(String username) { this.username = username; }
    public void setBuilding(String building) { this.building = building; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setItem(String item) { this.item = item; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }
    public void setCount(int count) { this.count = count; }
    public void setEarn(int earn) { this.earn = earn; }

    // --- 수동 겟터 메서드 ---
    public String getUsername() { return username; }
    public String getBuilding() { return building; }
    public String getUnit() { return unit; }
    public String getItem() { return item; }
    public String getMaterialType() { return materialType; }
    public int getCount() { return count; }
    public int getEarn() { return earn; }
}