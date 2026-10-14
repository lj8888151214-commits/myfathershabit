// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Dashboard.css';
import ChatWidget from './ChatWidget';
import { translations } from "../translations.js";

// 커스텀 훅
import { useHousehold } from './dashboard/hooks/useHousehold';
import { usePointClaim } from './dashboard/hooks/usePointClaim';
import { useKakaoNearbyApartments } from './dashboard/hooks/useKakaoNearbyApartments';

// 하위 컴포넌트
import StreamSection from './dashboard/StreamSection';
import SidebarSection from './dashboard/SidebarSection';
import RewardShareModal from './dashboard/RewardShareModal';
import HouseholdStatsModal from './dashboard/HouseholdStatsModal';

export default function Dashboard({ onBack, userInfo }) {
  const [points, setPoints] = useState(userInfo?.points ?? 1500);
  const [showPointToast, setShowPointToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('🎉 재활용 행위 감지! 포인트 적립됨');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [selectedLang, setSelectedLang] = useState('ko');
  const t = translations[selectedLang] || translations.ko;

  // 💡 챗봇 연동을 위한 Ref
  const chatWidgetRef = useRef(null);

  // 💡 [핵심 1] 소셜 로그인 여부 판별 (소셜 계정이면 true)
  const isSocialUser = Boolean(userInfo?.provider || userInfo?.email);

  // 포인트 동기화 함수
  const fetchLatestPoints = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (userInfo?.username) q.append('username', userInfo.username);
      const res = await fetch(`/api/user/points?${q.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.points !== undefined) setPoints(data.points);
      }
    } catch (e) {
      console.warn("포인트 동기화 실패:", e);
    }
  }, [userInfo]);

  // 1-1. 리워드/재활용 히스토리 서버 동기화 함수
  const fetchRewardHistory = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (userInfo?.username) q.append('username', userInfo.username);
      const res = await fetch(`/api/rewards/history?${q.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setRewardHistory(data);
      }
    } catch (e) {
      console.warn("리워드 히스토리 동기화 실패:", e);
    }
  }, [userInfo]);

  // 마운트 시 포인트 및 히스토리 초기 로드
  useEffect(() => {
    fetchLatestPoints();
    fetchRewardHistory();
  }, [fetchLatestPoints, fetchRewardHistory]);

  // 2. 세대/주소 관리 훅 연결 (일반 로그인용)
  const { address, setAddress, building, setBuilding, unit, setUnit, saveHousehold } = useHousehold(userInfo, fetchLatestPoints);

  // 💡 [핵심 2] 카카오 위치기반 통계 훅 활성화 (GPS & 주변 아파트 검색)
  const {
    searchApartment,
    nearbyApartments,
    searched,
    setSearched,
    loadNearbyStats,
    handleOpenKakaoPostcode
  } = useKakaoNearbyApartments(userInfo?.address || address || '');

  // 3. 토큰 발급/수령/카카오공유 훅 연결
  const { activeQrToken, isGeneratingToken, executeCustomKakaoShare, generateInstantClaimToken } = usePointClaim({
    points,
    setPoints,
    userInfo,
    building,
    unit,
    onClaimSuccess: fetchLatestPoints
  });

  // AI 객체 감지 리워드 적립 (라벨 여부에 따른 2배 적립, 상태 업데이트 및 NaN 방어)
  const handleRecycleDetected = async ({ materialType, itemName, hasLabel }) => {
    const safeMaterial = (materialType || 'PET').toUpperCase();
    const isLabeled = Boolean(hasLabel);

    // 포인트 계산: 페트병일 때 라벨이 없으면 200P(2배), 라벨 있으면 100P, 종이는 50P
    let calculatedPoints = 100;
    if (safeMaterial.includes('PET') || safeMaterial.includes('PLASTIC')) {
      calculatedPoints = isLabeled ? 100 : 200;
    } else if (safeMaterial.includes('PAPER')) {
      calculatedPoints = 50;
    }

    // 💡 2. NaN 방어: 포인트 가산
    setPoints((prev) => {
      const currentValid = (typeof prev === 'number' && !isNaN(prev)) ? prev : 0;
      return currentValid + calculatedPoints;
    });

    // 💡 3. 그래프용 히스토리 실시간 배열 추가
    setRewardHistory((prev) => [
      {
        materialType: safeMaterial,
        count: 1,
        item: `${itemName || safeMaterial} (${isLabeled ? '라벨부착' : '무라벨 2배적립'})`,
        itemName: itemName || safeMaterial,
        earn: calculatedPoints,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    // 💡 토스트 메시지 동적 설정 및 노출
    setToastMessage(`🎉 재활용 행위 감지! +${calculatedPoints} ECO P 적립됨`);
    setShowPointToast(true);

    // 💡 4. 챗봇 자동 오픈 없이 N 배지만 활성화
    if (chatWidgetRef.current && chatWidgetRef.current.triggerLabelAlert) {
      chatWidgetRef.current.triggerLabelAlert({
        itemName: itemName || safeMaterial,
        hasLabel: isLabeled,
        earnedPoints: calculatedPoints
      });
    }

    // 💡 5. 백엔드 적립 기록 DB 전송
    try {
      await fetch('/api/rewards/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userInfo?.username || null,
          address: address || null,
          building: building || null,
          unit: unit || null,
          item: `${itemName || safeMaterial} (${isLabeled ? '라벨부착' : '무라벨 2배적립'})`,
          materialType: safeMaterial,
          count: 1,
          earn: calculatedPoints
        })
      });
    } catch (err) {
      console.error("적립 기록 실패:", err);
    }

    setTimeout(() => setShowPointToast(false), 2000);
  };

  // 웹캠 QR 코드 감지 핸들러
  const handleWebcamQrDetected = async (scannedData) => {
    if (!scannedData) return;
    console.log(">>> [웹캠 QR 감지됨]:", scannedData);

    let cleanToken = scannedData;
    if (scannedData.includes('http://') || scannedData.includes('https://') || scannedData.includes('?')) {
      try {
        const url = new URL(scannedData);
        cleanToken = url.searchParams.get('claimToken') || url.searchParams.get('token') || scannedData;
      } catch {
        const match = scannedData.match(/(?:claimToken|token)=([a-zA-Z0-9-]+)/);
        if (match) cleanToken = match[1];
      }
    }

    console.log(">>> [합산 요청 토큰]:", cleanToken);

    const currentUsername = userInfo?.username || userInfo?.email || '';
    const currentBuilding = building || localStorage.getItem('rc_building') || '';
    const currentUnit = unit || localStorage.getItem('rc_unit') || '';

    try {
      const res = await fetch(`/api/claim/process?token=${encodeURIComponent(cleanToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: currentUsername,
          building: currentBuilding,
          unit: currentUnit
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 [QR 인식 성공] 에코포인트가 내 지갑으로 합산되었습니다!\n${data.message || ''}`);
        fetchLatestPoints();
        fetchRewardHistory();
      } else {
        alert(`⚠️ ${data.message || '유효하지 않거나 이미 사용 완료된 QR 코드입니다.'}`);
      }
    } catch (err) {
      console.error("QR 합산 요청 실패:", err);
    }
  };

  const handleOpenRewardModal = () => {
    setShowRewardModal(true);
    fetchLatestPoints();
    fetchRewardHistory();
    generateInstantClaimToken();
  };

  // 💡 [핵심 3] 통계 모달 열 때 GPS 기반 주변 아파트 검색 즉시 실행
  const handleOpenStatsModal = () => {
    setShowStatsModal(true);
    loadNearbyStats();
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
    setSearched(false);
  };

  return (
    <div className="dashboard-container">
      <StreamSection
        t={t}
        onDetect={handleRecycleDetected}
        onQrDetected={handleWebcamQrDetected}
      />

      <SidebarSection
        t={t}
        points={points}
        onBack={onBack}
        onOpenRewardModal={handleOpenRewardModal}
        onOpenStatsModal={handleOpenStatsModal}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
      />

      {showPointToast && <div className="toast-popup">{toastMessage}</div>}

      <ChatWidget
        ref={chatWidgetRef}
        points={points}
        userInfo={userInfo}
        onShareKakao={executeCustomKakaoShare}
        lang={selectedLang}
      />

      <RewardShareModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        points={points}
        rewardHistory={rewardHistory}
        activeQrToken={activeQrToken}
        isGeneratingToken={isGeneratingToken}
        onRefreshQr={generateInstantClaimToken}
        onShareKakao={executeCustomKakaoShare}
        t={t}
      />

      {/* 💡 [핵심 4] 소셜 로그인 여부와 카카오 위치 기반 데이터 주입 */}
      <HouseholdStatsModal
        isOpen={showStatsModal}
        onClose={handleCloseStatsModal}
        isSocialUser={isSocialUser}
        searchApartment={searchApartment}
        onOpenKakaoPostcode={handleOpenKakaoPostcode}
        searched={searched}
        nearbyApartments={nearbyApartments}
        address={address}
        setAddress={setAddress}
        building={building}
        setBuilding={setBuilding}
        unit={unit}
        setUnit={setUnit}
        onSaveHousehold={saveHousehold}
        t={t}
      />
    </div>
  );
}
