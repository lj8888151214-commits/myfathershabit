// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import Landing from './components/Landing';
import RegisterRoleSelect from './components/RegisterRoleSelect';
import Dashboard from './components/Dashboard';
import ChatWidget from './components/ChatWidget';
import ClaimPage from './components/ClaimPage'; // 👈 포인트 수령 컴포넌트 임포트

function App() {
  const [step, setStep] = useState('landing');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 전역으로 관리할 포인트
  const [points, setPoints] = useState(1500);

  // 💡 카카오톡 수령 링크(?token=xxxx) 파라미터 확인
  const [claimToken, setClaimToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  });

  useEffect(() => {
    // 1. 유저 인증 정보 조회
    fetch('/api/user/me', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        setUserInfo(data);
        if (data.points !== undefined) {
          setPoints(data.points);
        }
        // 카카오톡 수령 토큰이 있는 링크로 유입된 경우 바로 수령 단계로 진입
        if (claimToken) {
          setStep('claim');
        } else {
          setStep('dashboard');
        }
        setLoading(false);
      })
      .catch(() => {
        // 비로그인 상태일 때도 토큰이 있다면 수령 화면으로 안내(로그인 유도 등)
        if (claimToken) {
          setStep('claim');
        }
        setLoading(false);
      });
  }, [claimToken]);

  const handleStart = () => {
    setStep('role-select');
  };

  const handleRoleComplete = (data) => {
    setUserInfo(data);
    if (claimToken) {
      setStep('claim');
    } else {
      setStep('dashboard');
    }
  };

  const handleBackToLanding = () => {
    setStep('landing');
  };

  // 포인트 합산 완료 후 대시보드로 이동시키는 콜백
  const handleClaimSuccess = (updatedTotalPoints) => {
    if (updatedTotalPoints !== undefined) {
      setPoints(updatedTotalPoints);
    }
    // URL에서 ?token 파라미터 제거 (뒤로가기/새로고침 시 중복 호출 방지)
    window.history.replaceState({}, document.title, window.location.pathname);
    setClaimToken(null);
    setStep('dashboard');
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>인증 정보 확인 중...</div>;
  }

  return (
    <>
      {/* 1. 카카오톡 모바일 포인트 수령 화면 */}
      {step === 'claim' && (
        <ClaimPage
          token={claimToken}
          userInfo={userInfo}
          onSuccess={handleClaimSuccess}
          onGoLogin={() => setStep('landing')}
        />
      )}

      {/* 2. 기존 랜딩 화면 */}
      {step === 'landing' && (
        <Landing onStart={handleStart} />
      )}

      {/* 3. 역할 선택 화면 */}
      {step === 'role-select' && (
        <RegisterRoleSelect
          onComplete={handleRoleComplete}
          onBack={handleBackToLanding}
        />
      )}

      {/* 4. 메인 대시보드 화면 */}
      {step === 'dashboard' && (
        <Dashboard
          onBack={handleBackToLanding}
          userInfo={userInfo}
          points={points}
          setPoints={setPoints}
        />
      )}

      {/* 🤖 스마트 에코 챗봇 (수령 단계가 아닐 때 표시) */}
      {step !== 'claim' && (
        <ChatWidget
          step={step}
          userInfo={userInfo}
          points={points}
          onOpenDbModal={step === 'dashboard' ? () => {} : undefined}
        />
      )}
    </>
  );
}

export default App;