package com.example.RC.dto;

public class PointClaimResponseDto {
    private boolean success;
    private String message;
    private String token;
    private String claimUrl;
    private int earnedPoints;
    private int totalPoints;
    private boolean requireLogin;
    private int points; // 👈 이 필드가 없어서 setPoints에 빨간불이 떴던 것입니다!

    public PointClaimResponseDto() {
    }

    public PointClaimResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // 성공/실패 팩토리 헬퍼 메서드
    public static PointClaimResponseDto fail(String message) {
        PointClaimResponseDto dto = new PointClaimResponseDto();
        dto.setSuccess(false);
        dto.setMessage(message);
        return dto;
    }

    public static PointClaimResponseDto requireLogin(String message) {
        PointClaimResponseDto dto = new PointClaimResponseDto();
        dto.setSuccess(false);
        dto.setRequireLogin(true);
        dto.setMessage(message);
        return dto;
    }

    // Getter & Setter
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getClaimUrl() {
        return claimUrl;
    }

    public void setClaimUrl(String claimUrl) {
        this.claimUrl = claimUrl;
    }

    public int getEarnedPoints() {
        return earnedPoints;
    }

    public void setEarnedPoints(int earnedPoints) {
        this.earnedPoints = earnedPoints;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public boolean isRequireLogin() {
        return requireLogin;
    }

    public void setRequireLogin(boolean requireLogin) {
        this.requireLogin = requireLogin;
    }
}