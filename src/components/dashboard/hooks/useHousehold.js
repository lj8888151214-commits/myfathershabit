import { useState, useEffect, useRef } from 'react';

export function useHousehold(userInfo, onHouseholdSaved) {
  const [address, setAddress] = useState(() => (userInfo && userInfo.address) || localStorage.getItem('rc_address') || '');
  const [building, setBuilding] = useState(() => (userInfo && userInfo.building) || localStorage.getItem('rc_building') || '');
  const [unit, setUnit] = useState(() => (userInfo && userInfo.unit) || localStorage.getItem('rc_unit') || '');

  const householdRef = useRef({ address, building, unit, userInfo });
  useEffect(() => {
    householdRef.current = { address, building, unit, userInfo };
    if (address) localStorage.setItem('rc_address', address);
    if (building) localStorage.setItem('rc_building', building);
    if (unit) localStorage.setItem('rc_unit', unit);
  }, [address, building, unit, userInfo]);

  const saveHousehold = async () => {
    if (!building.trim() || !unit.trim()) {
      alert("동과 호수를 모두 올바르게 입력해 주세요.");
      return;
    }
    try {
      if (address.trim()) localStorage.setItem('rc_address', address.trim());
      localStorage.setItem('rc_building', building.trim());
      localStorage.setItem('rc_unit', unit.trim());

      const res = await fetch('/api/user/update-household', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          address: address.trim(),
          building: building.trim(),
          unit: unit.trim()
        })
      });

      if (res.ok) {
        alert(`🏠 세대 정보 저장 완료:\n${address ? `${address} ` : ''}${building}동 ${unit}호`);
        if (onHouseholdSaved) onHouseholdSaved();
      } else {
        alert("세대 정보 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("세대 저장 오류:", err);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  return { address, setAddress, building, setBuilding, unit, setUnit, householdRef, saveHousehold };
}