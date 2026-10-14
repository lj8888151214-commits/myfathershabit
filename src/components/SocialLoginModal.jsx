import React from 'react';

export default function SocialLoginModal({ provider, onSuccess, onClose }) {
  const brandStyles = {
    kakao: { name: '카카오', bg: '#FEE500', text: '#191919', accent: '#F7E600' },
    google: { name: 'Google', bg: '#FFFFFF', text: '#374151', accent: '#4285F4' },
    naver: { name: '네이버', bg: '#03C75A', text: '#FFFFFF', accent: '#02b350' }
  };

  const style = brandStyles[provider] || brandStyles.google;

  // 로그인 버튼 클릭 시 곧바로 백엔드 OAuth2 엔드포인트로 이동
/*
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (provider === 'google') {
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    } else if (provider === 'naver') {
      window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
    } else if (provider === 'kakao') {
      window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    }
  };
*/
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (provider === 'google') {
      window.location.href = 'https://plasticmoney.duckdns.org/oauth2/authorization/google';
    } else if (provider === 'naver') {
      window.location.href = 'https://plasticmoney.duckdns.org/oauth2/authorization/naver';
    } else if (provider === 'kakao') {
      window.location.href = 'https://plasticmoney.duckdns.org/oauth2/authorization/kakao';
    }
  };
  return (
    <div className="social-modal-overlay">
      <div className="social-modal-window" style={{ borderTop: `6px solid ${style.bg === '#FFFFFF' ? '#cbd5e1' : style.bg}` }}>
        {/* 로그인 헤더 로고 구역 */}
        <div className="social-modal-header" style={{ backgroundColor: style.bg, color: style.text }}>
          <span className="social-modal-logo">
            {provider === 'kakao' && '💬'}
            {provider === 'google' && 'G'}
            {provider === 'naver' && 'N'}
          </span>
          <h3>{style.name} 계정으로 로그인</h3>
        </div>

        <form onSubmit={handleLoginSubmit} className="social-modal-form">
          <p className="social-modal-notice">
            관리자 권한 인증을 위해 안전한 {style.name} 공식 로그인 페이지로 이동합니다. 🚀
          </p>

          <div style={{ padding: '20px 0', textAlign: 'center', color: '#666', fontSize: '14px' }}>
            아래 버튼을 눌러 로그인을 진행해 주세요.
          </div>

          <button
            type="submit"
            className="social-submit-btn"
            style={{
              backgroundColor: style.bg === '#FFFFFF' ? '#4285F4' : style.bg,
              color: style.text,
              border: provider === 'google' ? '1px solid #d1d5db' : 'none'
            }}
          >
            {style.name} 로그인 시작하기
          </button>

          <button type="button" onClick={onClose} className="social-cancel-btn">
            취소
          </button>
        </form>
      </div>
    </div>
  );
}