import React, { useState } from 'react';
import SocialLoginModal from './SocialLoginModal';

export default function RegisterRoleSelect({ onComplete, onBack }) {
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [activeProvider, setActiveProvider] = useState(null);

  const handleOpenKakaoPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 스크립트가 로드되지 않았습니다. index.html을 확인해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        let fullAddress = data.roadAddress || data.jibunAddress;
        if (data.buildingName !== '') {
          fullAddress += ` (${data.buildingName})`;
        }
        setAddress(fullAddress);
      }
    }).open();
  };

  const handleResidentSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('아파트 주소를 검색해주세요.');
      return;
    }
    if (!building.trim() || !unit.trim()) {
      alert('가족 포인트 공유를 위해 동과 호수를 모두 입력해주세요.');
      return;
    }
    onComplete({ role: 'resident', address, building, unit });
  };

  const handleSocialSuccess = (adminData) => {
    setActiveProvider(null);
    alert(`관리자 인증 성공!\n제공처: ${adminData.provider}\n관리자 계정: ${adminData.adminId}`);
    onComplete(adminData);
  };

  return (
    <div style={styles.roleContainer}>
      <div style={styles.roleSplitCard}>
        <div style={styles.headerWrap}>
          <p style={styles.roleSubtitle}>등록 또는 로그인 해주세요</p>
        </div>

        <div style={styles.splitGrid}>
          {/* 일반 주민 구역 */}
          <div style={{ ...styles.splitZone, ...styles.residentZoneBox }}>
            <div style={styles.zoneHeader}>
              <span style={styles.zoneIcon}>🏠</span>
              <h3 style={styles.zoneTitle}>일반 주민으로 진행</h3>
              <p style={styles.zoneDesc}>아파트 주소와 동·호수를 입력하여 가족과 함께 세대 포인트를 관리하세요.</p>
            </div>

            <form onSubmit={handleResidentSubmit} style={styles.zoneForm}>
              <div style={styles.inputRow}>
                <input
                  type="text"
                  placeholder="주소 검색 버튼을 누르세요"
                  value={address}
                  readOnly
                  onClick={handleOpenKakaoPostcode}
                  style={{ ...styles.addressInput, flex: 1, cursor: 'pointer', minWidth: 0 }}
                  required
                />
                <button
                  type="button"
                  onClick={handleOpenKakaoPostcode}
                  style={styles.searchBtn}
                >
                  주소 찾기
                </button>
              </div>

              <div style={styles.inputRow}>
                <input
                  type="text"
                  placeholder="동 (예: 101동)"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  style={{ ...styles.addressInput, flex: 1, minWidth: 0 }}
                  required
                />
                <input
                  type="text"
                  placeholder="호수 (예: 1204호)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ ...styles.addressInput, flex: 1, minWidth: 0 }}
                  required
                />
              </div>

              <button type="submit" style={styles.residentSubmitBtn}>
                주민으로 시작하기 ➔
              </button>
            </form>
          </div>

          {/* 관리자 구역 */}
          <div style={{ ...styles.splitZone, ...styles.adminZoneBox }}>
            <div style={styles.zoneHeader}>
              <span style={styles.zoneIcon}>🔒</span>
              <h3 style={styles.zoneTitle}>관리자로 진행</h3>
              <p style={styles.zoneDesc}>음료 DB 관리 및 시스템 통제를 위해 간편 소셜 연동이 필요합니다.</p>
            </div>

            <div style={styles.socialButtonList}>
              <button onClick={() => setActiveProvider('kakao')} style={{ ...styles.brandSocialBtn, backgroundColor: '#FEE500', color: '#191919' }}>
                <span style={styles.brandIcon}>💬</span>
                <span>카카오계정 로그인</span>
              </button>

              <button onClick={() => setActiveProvider('naver')} style={{ ...styles.brandSocialBtn, backgroundColor: '#03C75A', color: '#FFFFFF' }}>
                <span style={styles.brandIcon}>N</span>
                <span>네이버 아이디 로그인</span>
              </button>

              <button onClick={() => setActiveProvider('google')} style={{ ...styles.brandSocialBtn, backgroundColor: '#2A2A2A', color: '#FFFFFF', border: '1px solid #444444' }}>
                <span style={{ ...styles.brandIcon, color: '#EA4335', fontWeight: 'bold' }}>G</span>
                <span>Google 계정 로그인</span>
              </button>
            </div>
          </div>
        </div>

        <div style={styles.footerAction}>
          <button onClick={onBack} style={styles.backLinkText}>
            ⬅️ 메인 화면으로 돌아가기
          </button>
        </div>
      </div>

      {activeProvider && (
        <SocialLoginModal
          provider={activeProvider}
          onSuccess={handleSocialSuccess}
          onClose={() => setActiveProvider(null)}
        />
      )}
    </div>
  );
}

const styles = {
  roleContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 12px',
    backgroundColor: '#121212',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  roleSplitCard: {
    width: '100%',
    maxWidth: '820px',
    backgroundColor: '#1E1E1E',
    borderRadius: '20px',
    padding: '24px 16px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
    border: '1px solid #2C2C2C',
    boxSizing: 'border-box',
  },
  headerWrap: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  roleSubtitle: {
    fontSize: '14px',
    color: '#999999',
    margin: 0,
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },
  splitZone: {
    padding: '20px 16px',
    borderRadius: '16px',
    border: '1px solid #2C2C2C',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: '100%',
  },
  residentZoneBox: {
    backgroundColor: '#18221B',
    borderColor: '#233827',
  },
  adminZoneBox: {
    backgroundColor: '#19202A',
    borderColor: '#223244',
  },
  zoneHeader: {
    marginBottom: '16px',
  },
  zoneIcon: {
    fontSize: '28px',
    display: 'block',
    marginBottom: '8px',
  },
  zoneTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  zoneDesc: {
    fontSize: '13px',
    color: '#AAAAAA',
    lineHeight: '1.4',
    margin: 0,
  },
  zoneForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  addressInput: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '13px',
    backgroundColor: '#121212',
    border: '1px solid #3A3A3A',
    borderRadius: '12px',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  searchBtn: {
    flexShrink: 0,
    padding: '0 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  residentSubmitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  socialButtonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    boxSizing: 'border-box',
  },
  brandSocialBtn: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  brandIcon: {
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAction: {
    textAlign: 'center',
    marginTop: '10px',
  },
  backLinkText: {
    background: 'none',
    border: 'none',
    color: '#888888',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '8px',
  },
};