import React from 'react';

export default function RewardShareModal({
  isOpen,
  onClose,
  points,
  rewardHistory,
  activeQrToken,
  isGeneratingToken,
  onRefreshQr,
  onShareKakao,
  t
}) {
  if (!isOpen) return null;

  // 재질별 비율 및 각도 계산 로직
  const calculateMaterialStats = () => {
    if (!rewardHistory || rewardHistory.length === 0) {
      return { pet: 0, can: 0, paper: 0, total: 0, petAngle: 0, canAngle: 0 };
    }

    let petCount = 0;
    let canCount = 0;
    let paperCount = 0;

    rewardHistory.forEach((item) => {
      const mat = (item.materialType || '').toUpperCase();
      const count = Number(item.count) || 1;
      if (mat.includes('PET') || mat.includes('PLASTIC')) petCount += count;
      else if (mat.includes('CAN')) canCount += count;
      else if (mat.includes('PAPER')) paperCount += count;
    });

    const total = petCount + canCount + paperCount;
    if (total === 0) {
      return { pet: 0, can: 0, paper: 0, total: 0, petAngle: 0, canAngle: 0 };
    }

    const petRatio = petCount / total;
    const canRatio = canCount / total;

    return {
      pet: Math.round(petRatio * 100),
      can: Math.round(canRatio * 100),
      paper: Math.round((paperCount / total) * 100),
      total,
      petAngle: petRatio * 360,
      canAngle: (petRatio + canRatio) * 360
    };
  };

  const stats = calculateMaterialStats();

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: '440px', width: '92%', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>{t.rewardTitle} 및 리워드 공유</h3>
          <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '14px' }}>
            보유 {points.toLocaleString()} ECO P
          </div>
        </div>

        {/* 원형 도넛 그래프 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 16px 0' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: stats.total === 0
              ? '#334155'
              : `conic-gradient(#34d399 0deg ${stats.petAngle}deg, #3b82f6 ${stats.petAngle}deg ${stats.canAngle}deg, #f59e0b ${stats.canAngle}deg 360deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc'
            }}>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>총 건수</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34d399' }}>{stats.total}건</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '10px' }}>
            <span style={{ color: '#cbd5e1' }}><b style={{ color: '#34d399' }}>●</b> 페트 {stats.pet}%</span>
            <span style={{ color: '#cbd5e1' }}><b style={{ color: '#3b82f6' }}>●</b> 캔 {stats.can}%</span>
            <span style={{ color: '#cbd5e1' }}><b style={{ color: '#f59e0b' }}>●</b> 종이 {stats.paper}%</span>
          </div>
        </div>

        {/* 1. 현장 QR 즉시 합산 */}
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '14px', border: '1px solid #334155', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>
            📸 다른 주소 이웃·가족 현장 즉시 합산 QR
          </div>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 10px 0' }}>
            다른 세대 거주자나 지인이 스마트폰 카메라로 QR을 찍으면 본인 주소 지갑으로 즉시 합산됩니다.
          </p>

          <div style={{ background: '#ffffff', padding: '8px', display: 'inline-block', borderRadius: '10px' }}>
            {isGeneratingToken ? (
              <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '11px' }}>
                QR 생성 중...
              </div>
            ) : activeQrToken ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=https://plasticmoney.duckdns.org/claim?token=${activeQrToken}&type=qr`}
                alt="현장 즉시 수령 QR"
                style={{ width: '130px', height: '130px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '11px' }}>
                QR 발급 실패
              </div>
            )}
          </div>

          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={onRefreshQr}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                color: '#94a3b8',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🔄 QR 새로고침
            </button>
          </div>

          <div style={{ margin: '14px 0 12px 0', borderTop: '1px dashed #334155' }}></div>

          {/* 2. 카카오톡 선물하기 */}
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15', marginBottom: '4px' }}>
            💬 소셜 원격 선물 (카카오톡 전송)
          </div>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 8px 0' }}>
            멀리 있는 가족·친구에게 카카오톡 메시지로 포인트를 선물합니다.
          </p>

          <button
            type="button"
            onClick={onShareKakao}
            style={{
              width: '100%',
              backgroundColor: '#fee500',
              color: '#3c1e1e',
              fontWeight: 'bold',
              padding: '9px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            💬 카카오톡 메시지로 포인트 선물하기
          </button>
        </div>

        <button className="menu-action-btn primary" style={{ width: '100%' }} onClick={onClose}>
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
}