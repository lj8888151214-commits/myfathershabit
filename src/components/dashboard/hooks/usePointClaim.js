// src/components/dashboard/hooks/usePointClaim.js
import { useState, useEffect, useRef } from 'react';

export function usePointClaim({ points, setPoints, userInfo, building, unit, onClaimSuccess }) {
  const [activeQrToken, setActiveQrToken] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const isClaimingRef = useRef(false);

  // 1. 수신자가 링크를 누르고 들어왔을 때 자동 수령
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const claimToken = urlParams.get('claimToken');

    if (claimToken && !isClaimingRef.current) {
      isClaimingRef.current = true;
      const receiverUsername = userInfo?.username || userInfo?.email || '';
      const receiverBuilding = localStorage.getItem('rc_building') || building || '';
      const receiverUnit = localStorage.getItem('rc_unit') || unit || '';

      fetch(`/api/claim/process?token=${encodeURIComponent(claimToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: receiverUsername,
          building: receiverBuilding,
          unit: receiverUnit
        })
      })
        .then(async (res) => {
          const data = await res.json();
          if (!data.success) throw new Error(data.message || "포인트 수령에 실패했습니다.");
          return data;
        })
        .then((data) => {
          alert(`🎉 축하합니다!\n${data.message || '에코포인트가 내 지갑에 정상 적립되었습니다!'}`);
          window.history.replaceState({}, document.title, window.location.pathname);
          if (onClaimSuccess) onClaimSuccess();
        })
        .catch((err) => {
          console.error("포인트 수령 처리 실패:", err);
          alert(err.message || "이미 사용되었거나 유효하지 않은 선물 링크입니다.");
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .finally(() => {
          isClaimingRef.current = false;
        });
    }
  }, [userInfo, building, unit, onClaimSuccess]);

  // 2. 카카오톡 선물 카드 발송 (음성 문구 지원)
  const executeCustomKakaoShare = async ({ targetPerson = '가족', customMessage = '' } = {}) => {
    try {
      const pointsToSend = points > 0 ? points : 100;
      const res = await fetch('/api/claim/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          points: pointsToSend,
          username: userInfo?.username || '',
          building: building || '',
          unit: unit || ''
        })
      });

      let shareUrl = 'https://plasticmoney.duckdns.org';
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          shareUrl = `https://plasticmoney.duckdns.org/?claimToken=${data.token}`;
          if (setPoints) setPoints(0); // 내 화면 포인트 즉시 차감
        }
      }

      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('f7d216c9253bd3d4d3cf2eaf836373f8');
        }

        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `🎁 ${targetPerson}에게 에코포인트 선물 도착!`,
            description: customMessage || `누적된 ${pointsToSend.toLocaleString()} ECO P 선물이 도착했습니다.`,
            imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c3fa4a0d5d',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl
            }
          },
          buttons: [
            {
              title: '포인트 받기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl
              }
            }
          ]
        });
      } else {
        alert("카카오톡 SDK 로딩 실패");
      }
    } catch (err) {
      console.error("카카오 공유 에러:", err);
    }
  };

  // 3. 현장 QR 토큰 생성
  const generateInstantClaimToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await fetch('/api/claim/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          points: points > 0 ? points : 100,
          username: userInfo?.username || userInfo?.email || '',
          building: building || '',
          unit: unit || ''
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setActiveQrToken(data.token);
        if (points > 0) setPoints(0);
      } else {
        setActiveQrToken('');
      }
    } catch {
      setActiveQrToken('');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // 💡 모든 함수 선언이 끝난 후 맨 마지막에 정확히 한 번만 return
  return {
    activeQrToken,
    isGeneratingToken,
    executeCustomKakaoShare,
    generateInstantClaimToken
  };
}