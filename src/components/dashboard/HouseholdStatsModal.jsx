// src/components/dashboard/HouseholdStatsModal.jsx
import React from 'react';

export default function HouseholdStatsModal({
  isOpen,
  onClose,
  isSocialUser, // 소셜 로그인 여부 (소셜이면 동호수 입력 생략)
  searchApartment,
  onOpenKakaoPostcode,
  searched,
  nearbyApartments,
  t
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: '420px', width: '90%' }}>
        <h3>{t.statsTitle}</h3>
        <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '4px 0 12px 0' }}>
          {isSocialUser
            ? "기기(GPS) 위치를 기반으로 주변 아파트 단지 통계를 실시간으로 확인합니다."
            : "로그인 시 인증된 아파트 주소를 기반으로 주변 단지 통계를 실시간으로 확인합니다."}
        </p>

        {/* 주소 표시 및 재검색 영역 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="등록된 아파트 주소가 없습니다"
            value={searchApartment}
            readOnly
            className="custom-input"
            style={{ flex: 1, margin: 0, backgroundColor: '#0f172a', color: '#34d399' }}
          />
          <button
            type="button"
            className="menu-action-btn primary"
            style={{ padding: '6px 12px', whiteSpace: 'nowrap', background: '#334155' }}
            onClick={onOpenKakaoPostcode}
          >
            주소 재검색
          </button>
        </div>

        {/* 옛날 소스 그대로의 아파트 랭킹 리스트 */}
        {searched && (
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#1e293b',
            padding: '8px',
            borderRadius: '6px',
            marginBottom: '12px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '11px', color: '#34d399', marginBottom: '6px', fontWeight: 'bold' }}>
              📍 '{searchApartment || '우리 동네'}' 인근 동·단지별 통계 리스트
            </div>
            {nearbyApartments.map((apt, idx) => (
              <div key={idx} style={{
                padding: '6px 8px',
                borderBottom: idx < nearbyApartments.length - 1 ? '1px solid #334155' : 'none',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>{apt.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>범위: {apt.dong}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#34d399', fontWeight: 'bold' }}>{apt.rank}</span>
                  <div style={{ color: '#cbd5e1', fontSize: '10px' }}>탄소절감 {apt.carbon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="menu-action-btn primary"
          onClick={onClose}
        >
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
}