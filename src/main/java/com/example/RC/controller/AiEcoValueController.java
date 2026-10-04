// com/example/RC/controller/AiEcoValueController.java
package com.example.RC.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/eco-ai")
public class AiEcoValueController {

    @GetMapping("/convert-value")
    public ResponseEntity<Map<String, Object>> getRealtimeEcoValue(
            @RequestParam int points,
            @RequestParam(required = false) String itemName) {

        Map<String, Object> result = new HashMap<>();

        // 💡 AI 프롬프트에 넣을 계절/물가 파라미터 (현재 월 반영)
        int month = LocalDate.now().getMonthValue();
        String seasonItem = (month >= 11 || month <= 2) ? "붕어빵/호빵" : (month >= 6 && month <= 8) ? "시원한 아이스바" : "메가커피 아메리카노";

        /*
         * 만약 백엔드에 OpenAI Service(gpt-4o-mini 등)가 연결되어 있다면:
         * String prompt = String.format("현재 사용자가 재활용으로 모은 에코포인트는 %d P(1P=1원)입니다. "
         *     + "방금 투입한 품목: %s. "
         *     + "2026년 한국 실생활 물가(종량제봉투, %s, 관리비 등)를 기준으로 2줄 내외로 위트 있게 환산해 주세요.",
         *     points, itemName != null ? itemName : "없음", seasonItem);
         * String aiText = openAiService.call(prompt);
         */

        // 실시간 물가 추정 알고리즘 (AI 백엔드 연결 전 즉시 동작하는 스마트 생성기)
        int trashBagCount = points / 640; // 2026년 기준 봉투 단가
        int coffeeCount = points / 1500;
        int seasonCount = points / 1000;

        StringBuilder sb = new StringBuilder();
        if (itemName != null && !itemName.isBlank()) {
            sb.append("🔍 [").append(itemName).append("] 감지 완료! ");
        }
        sb.append("현재 보유하신 ").append(String.format("%,d", points)).append(" ECO P는 실생활에서 이런 가치예요! 💡\n");
        sb.append("• 🏢 이번 달 아파트 관리비 약 ").append(String.format("%,d", points)).append("원 즉시 감면\n");
        if (trashBagCount > 0) {
            sb.append("• 🗑️ 20L 종량제 봉투 약 ").append(trashBagCount).append("장\n");
        }
        if (seasonCount > 0) {
            sb.append("• 🐟 제철 간식 ").append(seasonItem).append(" 약 ").append(seasonCount).append("개\n");
        }
        if (coffeeCount > 0) {
            sb.append("• ☕ 메가커피 아메리카노 ").append(String.format("%.1f", (double) points / 1500)).append("잔\n");
        }
        sb.append("환경도 지키고 지갑도 든든해지는 중입니다! 🌱");

        result.put("success", true);
        result.put("points", points);
        result.put("convertedText", sb.toString());

        return ResponseEntity.ok(result);
    }
}