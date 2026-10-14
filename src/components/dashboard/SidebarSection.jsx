import React from 'react';

export default function SidebarSection({
  t,
  points,
  onBack,
  onOpenRewardModal,
  onOpenStatsModal,
  selectedLang,
  setSelectedLang
}) {
  return (
    <div className="control-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-title">{t.controlPanel}</div>
        <button className="btn-back" onClick={onBack}>{t.homeBtn}</button>
      </div>

      {/* 리워드 모달 트리거 */}
      <div className="text-menu-item">
        <div className="text-menu-info" onClick={onOpenRewardModal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <span className="text-menu-title" style={{ display: 'block' }}>{t.rewardTitle}</span>
            <span className="text-menu-sub">{t.rewardBtn} (공유 / 합산) &gt;</span>
          </div>
          <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '14px', background: '#1e293b', padding: '4px 8px', borderRadius: '6px', border: '1px solid #334155' }}>
            ⚡ {points.toLocaleString()} ECO P
          </div>
        </div>
      </div>

      {/* 세대별 동네 통계 */}
      <div className="text-menu-item">
        <div className="text-menu-info" onClick={onOpenStatsModal}>
          <span className="text-menu-title">{t.statsTitle}</span>
          <span className="text-menu-sub">{t.statsBtn} &gt;</span>
        </div>
      </div>

      {/* 언어 선택 */}
      <div className="text-menu-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span className="text-menu-title" style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>{t.langTitle}</span>
        <div style={{ display: 'flex', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
          {['ko', 'en', 'zh'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedLang(code)}
              style={{
                padding: '5px 8px',
                backgroundColor: selectedLang === code ? '#2E7D32' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontSize: '10px'
              }}
            >
              {code === 'ko' ? '한국어' : code === 'en' ? 'English' : '中文'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}