// src/components/dashboard/ecoValueConverter.js

/**
 * AI 기반 실시간 체감 가치 변환 API 호출
 * @param {number} totalPoints - 세대 누적 총 포인트
 * @param {object|null} recentItem - 최근 투입 품목 { itemName, earnedPoints }
 */
export async function convertPointsToRealValue(totalPoints, recentItem = null) {
  const itemName = recentItem?.itemName || '';

  try {
    const res = await fetch(`/api/eco-ai/convert-value?points=${totalPoints}&itemName=${encodeURIComponent(itemName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.convertedText) {
        return data.convertedText;
      }
    }
  } catch (err) {
    console.warn("AI 가치 변환 API 호출 실패, 기본 변환기 작동:", err);
  }

  // 네트워크 장애 또는 백엔드 미응답 시 fallback 처리
  const bags = Math.floor(totalPoints / 600);
  const coffees = (totalPoints / 1500).toFixed(1);
  const prefix = recentItem ? `🔍 [${recentItem.itemName}] 감지 완료! (+${recentItem.earnedPoints}P)\n` : '';

  return `${prefix}💡 현재 세대 누적 총 ${totalPoints.toLocaleString()} ECO P는 아파트 관리비 약 ${totalPoints.toLocaleString()}원 감면 가능 또는 종량제 봉투 20L ${bags}장, 커피 약 ${coffees}잔의 가치입니다! ☕♻️`;
}