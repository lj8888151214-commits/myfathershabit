// src/components/Landing.jsx
import React from 'react';

export default function Landing({ onStart }) {
  return (
    <div className="hero-background">
      <div className="blob"></div>
      <div className="blob-2"></div>

      <div className="content-container">
        <div className="badge">♻️ AI-Powered Eco Platform</div>
        <h1>
          스마트한 재활용의 시작,<br />
          <span>My father's habit</span>
        </h1>
        <p>
          분리수거를 실시간으로 인증하고,
          지구와 환경을 지키는 가치 있는 리워드를 경험해 보세요.
        </p>
        <button className="cta-button" onClick={onStart}>
          재활용 인증 시작하기 🚀
        </button>
      </div>
    </div>
  );
}