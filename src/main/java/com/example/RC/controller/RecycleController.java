package com.example.RC.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recycle")
@CrossOrigin(origins = "http://localhost:5173")
public class RecycleController {

    @PostMapping("/detect-box")
    public ResponseEntity<Map<String, Object>> detectRecycleBox(@RequestBody Map<String, String> payload) {
        String detectedMaterial = payload.getOrDefault("materialType", "PAPER");
        String detectedItem = payload.getOrDefault("item", "Paper");
        int points = Integer.parseInt(payload.getOrDefault("points", "50"));

        // 단순 판별 결과만 프론트/클라이언트로 응답 (DB 저장은 RewardController에서 수행)
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("materialType", detectedMaterial);
        response.put("item", detectedItem);
        response.put("confidence", "95.0% 매치");
        response.put("points", points);
        response.put("message", detectedItem + " 판별 완료! " + points + "포인트가 적립되었습니다.");

        return ResponseEntity.ok(response);
    }
}