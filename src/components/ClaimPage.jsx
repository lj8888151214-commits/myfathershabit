// src/components/ClaimPage.jsx
import React, { useEffect, useState } from 'react';

export default function ClaimPage({ token, userInfo, onSuccess, onGoLogin }) {
  const [statusMessage, setStatusMessage] = useState('🎁 에코 포인트를 확인하고 있습니다...');
  const [isProcessing, setIsProcessing] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  // 도로명 주소 및 동/호수로 수령할 때 사용할 상태 (로컬 저장값 우선)
  const [address, setAddress] = useState(() => localStorage.getItem('rc_address') || '');
  const [building, setBuilding] = useState(() => localStorage.getItem('rc_building') || '');
  const [unit, setUnit] = useState(() => localStorage.getItem('rc_unit') || '');

  // 1. 초기 자동 수령 시도
  // 1. 초기 자동 수령 시도
    useEffect(() => {
      if (!token) {
        setStatusMessage('⚠️ 올바르지 않은 접근입니다 (토큰 누락).');
        setIsProcessing(false);
        return;
      }

      let currentUsername = '';
      if (userInfo) {
        currentUsername = userInfo.username || userInfo.id || userInfo.email || '';
        if (typeof currentUsername === 'string' && currentUsername.includes('id=')) {
          currentUsername = currentUsername.replace(/.*id=([^,}]+).*/, '$1').trim();
        }
      }

      const storedAddress = address || localStorage.getItem('rc_address') || '';
      const storedBuilding = building || localStorage.getItem('rc_building') || '';
      const storedUnit = unit || localStorage.getItem('rc_unit') || '';

      // 💡 [핵심] 소셜 로그인이 되어 있더라도 주소 및 동·호수 정보를 반드시 함께 전달
      if (currentUsername) {
        requestClaim({
          username: currentUsername,
          address: storedAddress,
          building: storedBuilding,
          unit: storedUnit
        });
      }
      // 소셜 로그인이 안 되어 있고 세대 정보만 있는 경우
      else if (storedBuilding && storedUnit) {
        requestClaim({
          address: storedAddress,
          building: storedBuilding,
          unit: storedUnit
        });
      } else {
        setIsProcessing(false);
        setShowManualForm(true);
        setStatusMessage('포인트를 합산받을 계정이나 세대 정보를 선택해 주세요.');
      }
    }, [token, userInfo]);

  // 공통 백엔드 수령 요청 함수
  const requestClaim = (payload) => {
    setIsProcessing(true);
    console.log('>>> [ClaimPage] 백엔드로 전송하는 수령 페이로드:', payload);

    fetch(`/api/claim/process?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsProcessing(false);
        if (data.success) {
          setShowManualForm(false);
          setStatusMessage(`🎉 ${data.earnedPoints.toLocaleString()} ECO P가 성공적으로 합산되었습니다!`);

          // 주소 및 동/호수 로컬 캐시 저장
          if (payload.address) {
            localStorage.setItem('rc_address', payload.address);
          }
          if (payload.building && payload.unit) {
            localStorage.setItem('rc_building', payload.building);
            localStorage.setItem('rc_unit', payload.unit);
          }

          setTimeout(() => {
            if (onSuccess) {
              onSuccess(data.totalPoints);
            } else {
              window.location.href = '/';
            }
          }, 1800);
        } else {
          setShowManualForm(true);
          setStatusMessage(data.message || '포인트 수령에 실패했습니다.');
        }
      })
      .catch((err) => {
        console.error('Claim error:', err);
        setIsProcessing(false);
        setShowManualForm(true);
        setStatusMessage('⚠️ 서버 통신 중 오류가 발생했습니다.');
      });
  };

  // 주소 및 동/호수 수동 입력 후 제출 핸들러
  const handleHouseholdSubmit = (e) => {
    e.preventDefault();
    if (!building.trim() || !unit.trim()) {
      alert('동과 호수를 모두 입력해 주세요.');
      return;
    }

    if (address.trim()) {
      localStorage.setItem('rc_address', address.trim());
    }

    requestClaim({
      address: address.trim(),
      building: building.trim(),
      unit: unit.trim()
    });
  };

  // 로그인 이동 핸들러
  const handleLoginClick = () => {
    if (token) {
      localStorage.setItem('pending_claim_token', token);
    }
    if (onGoLogin) {
      onGoLogin();
    } else {
      window.location.href = '/oauth2/authorization/kakao';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0f172a',
      color: '#f8fafc',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '30px 24px',
        borderRadius: '16px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '44px', marginBottom: '12px' }}>🌱</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#34d399' }}>
          플라스틱 머니 포인트 수령
        </h2>
        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 20px 0' }}>
          {statusMessage}
        </p>

        {isProcessing && (
          <div style={{ fontSize: '12px', color: '#94a3b8', margin: '15px 0' }}>
            ⏳ 처리 중입니다...
          </div>
        )}

        {!isProcessing && showManualForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {/* 방법 1: 주소 및 동/호수로 바로 받기 */}
            <form onSubmit={handleHouseholdSubmit} style={{
              background: '#0f172a',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textAlign: 'left' }}>
                🏠 우리 집(주소·동·호수)으로 즉시 합산
              </span>

              {/* 도로명 주소 입력란 */}
              <input
                type="text"
                placeholder="도로명 주소 (예: 판교역로 166)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />

              {/* 동/호수 입력란 */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="예: 101동"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                <input
                  type="text"
                  placeholder="예: 1204호"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '9px',
                  backgroundColor: '#2E7D32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                이 세대로 합산하기
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '11px' }}>
              <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
              <span style={{ padding: '0 8px' }}>또는</span>
              <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
            </div>

            {/* 방법 2: 개인 소셜 로그인 후 받기 */}
            <button
              type="button"
              onClick={handleLoginClick}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🔑 로그인 후 내 지갑으로 받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}