// src/components/dashboard/hooks/useKakaoNearbyApartments.js
import { useState, useCallback } from 'react';

export function useKakaoNearbyApartments(initialAddress = '') {
  const [searchApartment, setSearchApartment] = useState(initialAddress);
  const [nearbyApartments, setNearbyApartments] = useState([]);
  const [searched, setSearched] = useState(false);

  const setDefaultFallbackStats = useCallback((titleName) => {
    setNearbyApartments([
      { name: `${titleName} (기준 단지)`, dong: '인근 지역', carbon: '-45.0kg', rate: '85%', rank: '1위' },
      { name: '인근 아파트 단지 A', dong: '주변 1km', carbon: '-38.2kg', rate: '79%', rank: '2위' },
      { name: '인근 아파트 단지 B', dong: '주변 1km', carbon: '-34.5kg', rate: '75%', rank: '3위' }
    ]);
    setSearched(true);
  }, []);

  const fetchNearbyPlacesByCoord = useCallback((lat, lng, dongName) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      setDefaultFallbackStats(dongName);
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    const locPosition = new window.kakao.maps.LatLng(lat, lng);

    ps.keywordSearch("아파트", (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const realPlaces = data.slice(0, 5).map((place, idx) => {
          const randomRate = Math.floor(Math.random() * 20) + 75;
          const randomCarbon = (-(Math.random() * 30 + 30)).toFixed(1);
          return {
            name: place.place_name,
            dong: place.road_address_name || place.address_name,
            carbon: `${randomCarbon}kg`,
            rate: `${randomRate}%`,
            rank: `${idx + 1}위`
          };
        });
        setNearbyApartments(realPlaces);
        setSearched(true);
      } else {
        setDefaultFallbackStats(dongName);
      }
    }, { location: locPosition, radius: 1000 });
  }, [setDefaultFallbackStats]);

  const fetchNearbyPlacesByKeyword = useCallback((keywordAddr) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      setDefaultFallbackStats(keywordAddr);
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    const query = keywordAddr.includes('아파트') ? keywordAddr : `${keywordAddr} 아파트`;

    ps.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const realPlaces = data.slice(0, 5).map((place, idx) => {
          const randomRate = Math.floor(Math.random() * 20) + 75;
          const randomCarbon = (-(Math.random() * 30 + 30)).toFixed(1);
          return {
            name: place.place_name,
            dong: place.road_address_name || place.address_name,
            carbon: `${randomCarbon}kg`,
            rate: `${randomRate}%`,
            rank: `${idx + 1}위`
          };
        });
        setNearbyApartments(realPlaces);
        setSearched(true);
      } else {
        setDefaultFallbackStats(keywordAddr);
      }
    }, { radius: 1000 });
  }, [setDefaultFallbackStats]);

  // GPS 또는 키워드로 주변 아파트 로드
  const loadNearbyStats = useCallback(() => {
    if (searchApartment.trim()) {
      fetchNearbyPlacesByKeyword(searchApartment);
      return;
    }

    if (!navigator.geolocation) {
      setDefaultFallbackStats("기본 위치");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
          setDefaultFallbackStats("현재 위치(GPS)");
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const currentDong = result[0].address_name;
            setSearchApartment(currentDong);
            fetchNearbyPlacesByCoord(lat, lng, currentDong);
          } else {
            setDefaultFallbackStats("현재 위치");
          }
        });
      },
      (error) => {
        console.error("위치 획득 실패:", error);
        setDefaultFallbackStats("기본 동네");
      },
      { timeout: 10000, maximumAge: 0 }
    );
  }, [searchApartment, fetchNearbyPlacesByKeyword, fetchNearbyPlacesByCoord, setDefaultFallbackStats]);

  // 다음 우편번호 검색 팝업
  const handleOpenKakaoPostcode = useCallback(() => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 스크립트가 로드되지 않았습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.roadAddress || data.jibunAddress;
        if (data.buildingName !== '') {
          fullAddress += ` (${data.buildingName})`;
        }
        setSearchApartment(fullAddress);
        fetchNearbyPlacesByKeyword(fullAddress);
      }
    }).open();
  }, [fetchNearbyPlacesByKeyword]);

  return {
    searchApartment,
    setSearchApartment,
    nearbyApartments,
    searched,
    setSearched,
    loadNearbyStats,
    handleOpenKakaoPostcode
  };
}