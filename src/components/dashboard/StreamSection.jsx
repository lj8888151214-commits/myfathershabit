// src/components/dashboard/StreamSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsQR'; // 💡 QR 코드 실시간 디코딩 라이브러리

export default function StreamSection({ t, onDetect, onQrDetected }) {
  const videoRef = useRef(null);
  const [streamType, setStreamType] = useState('rear'); // 'front' | 'rear' | 'screen'
  const [activeStream, setActiveStream] = useState(null);
  const [annotatedImageSrc, setAnnotatedImageSrc] = useState('');

  // 💡 QR 인식 중복 방지용 즉시 락 (Ref) 및 화면 표시 상태 (State)
  const qrCooldownRef = useRef(false);
  const [isQrCooldown, setIsQrCooldown] = useState(false);

  // 💡 AI 재활용 연속 감지 방지용 쿨다운 락
  const isDetectCoolingDown = useRef(false);

  // 1. 카메라/화면공유 스트림 변경 핸들러
  const handleStreamChange = async (type) => {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      setActiveStream(null);
    }
    setStreamType(type);
    setAnnotatedImageSrc('');

    try {
      let mediaStream;
      if (type === 'front') {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } else if (type === 'rear') {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },
          audio: false
        }).catch(async () => {
          return await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        });
      } else if (type === 'screen') {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      }

      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      setActiveStream(mediaStream);
    } catch (err) {
      console.error("미디어 스트림 권한 오류:", err);
      if (type === 'rear') {
        handleStreamChange('front');
      }
    }
  };

  // 초기 후면 카메라 실행 및 언마운트 시 트랙 정리
  useEffect(() => {
    handleStreamChange('rear');
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. 실시간 AI 모델 서버 프레임 전송 및 QR 코드 스캔 루프 (300ms)
  useEffect(() => {
    const aiInterval = setInterval(async () => {
      if (videoRef.current && streamType !== 'screen') {
        try {
          const video = videoRef.current;
          if (video.videoWidth === 0 || video.videoHeight === 0) return;

          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // 💡 [A. 웹캠 화면 내 QR 코드 즉시 감지 (Ref로 연타 차단)]
          if (!qrCooldownRef.current && onQrDetected) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            });

            if (qrCode && qrCode.data) {
              let tokenFound = null;

              if (qrCode.data.includes('token=')) {
                try {
                  const url = new URL(qrCode.data);
                  tokenFound = url.searchParams.get('token');
                } catch {
                  const params = new URLSearchParams(qrCode.data.split('?')[1]);
                  tokenFound = params.get('token');
                }
              } else if (qrCode.data.length >= 32) {
                tokenFound = qrCode.data;
              }

              if (tokenFound) {
                qrCooldownRef.current = true; // ⚡ 300ms 루프 즉시 잠금
                setIsQrCooldown(true);
                onQrDetected(tokenFound);

                setTimeout(() => {
                  qrCooldownRef.current = false;
                  setIsQrCooldown(false);
                }, 3000); // 3초 쿨다운
              }
            }
          }

          // [B. 실시간 AI 모델 서버 프레임 전송]
          const capturedBase64 = canvas.toDataURL('image/jpeg');
          const response = await fetch('/predict_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: capturedBase64 })
          });

          const data = await response.json();
          if (data.success && data.annotated_image) {
            setAnnotatedImageSrc(data.annotated_image);
          }
        } catch (err) {
          // 일시적 프레임 전송 오류 무시
        }
      }
    }, 300);

    return () => clearInterval(aiInterval);
  }, [streamType, onQrDetected]);

  // 3. 재활용 감지 상태 폴링 루프 (1500ms)
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (!activeStream || !videoRef.current) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) return;

      // 💡 직전 적립 후 4초 쿨다운 중이면 건너뜀 (연속 중복 적립 방지)
      if (isDetectCoolingDown.current) return;

      try {
        const response = await fetch('/action_status');
        const data = await response.json();

        if (data.detected && data.hand_detected && data.item_detected) {
          isDetectCoolingDown.current = true; // ⚡ 중복 적립 즉시 잠금

          const detectedMaterial = data.material_type || data.materialType || 'PET';
          const itemName = data.item_name || 'AI 감지 재활용품';
          const hasLabel = Boolean(data.has_label); // 👈 라벨 상태 읽기

          // 감지 이벤트를 부모(Dashboard)로 전달 (hasLabel 포함)
          if (onDetect) {
            onDetect({
              materialType: detectedMaterial,
              itemName,
              hasLabel
            });
          }

          // 투입 후 물품을 치우는 시간(4초) 동안 추가 적립 차단
          setTimeout(() => {
            isDetectCoolingDown.current = false;
          }, 4000);
        }
      } catch (err) {
        // 폴링 대기 무시
      }
    }, 1500);

    return () => clearInterval(checkInterval);
  }, [activeStream, onDetect]);

  return (
    <div className="stream-section">
      <div className="stream-header">
        <div className="stream-title">{t.title}</div>
        <div className="stream-controls" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            className={`btn-control ${streamType === 'front' ? 'active' : ''}`}
            onClick={() => handleStreamChange('front')}
          >
            {t.webcamFront}
          </button>
          <button
            className={`btn-control ${streamType === 'rear' ? 'active' : ''}`}
            onClick={() => handleStreamChange('rear')}
          >
            {t.webcamRear}
          </button>
          <button
            className={`btn-control ${streamType === 'screen' ? 'active' : ''}`}
            onClick={() => handleStreamChange('screen')}
          >
            {t.screenMode}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '11px', fontWeight: '500' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block' }}></span>
          {streamType !== 'screen' ? t.monitoring : t.liveStreaming}
          {isQrCooldown && <span style={{ color: '#38bdf8', marginLeft: '6px' }}>⚡ QR 인식 완료! 처리 중...</span>}
        </div>
      </div>

      <div className="video-wrapper" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-element"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: streamType === 'front' ? 'scaleX(-1)' : 'none',
            display: (streamType !== 'screen' && annotatedImageSrc) ? 'none' : 'block'
          }}
        />
        {streamType !== 'screen' && annotatedImageSrc && (
          <img
            src={annotatedImageSrc}
            alt="AI Detected Stream"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: streamType === 'front' ? 'scaleX(-1)' : 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}