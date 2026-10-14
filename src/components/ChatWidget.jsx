// src/components/ChatWidget.jsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ChatWidget.css';

// 💡 정확한 상대 경로 확인 (components 기준 하위 dashboard 폴더)
import { convertPointsToRealValue } from './dashboard/ecoValueConverter';

// 💡 언어별 챗봇 다국어 텍스트 정의
const chatTranslations = {
  ko: {
    title: '🤖 RC 스마트 비서 (음성지원)',
    greeting: '안녕하세요! 에코 챗봇입니다. 🤖\n챗봇이 열리며 바로 음성 인식을 시작합니다!\n(예: "내 포인트로 뭐 할 수 있어?", "엄마한테 포인트 보내줘")',
    listening: '🎤 듣고 있어요... 말씀하세요!',
    placeholder: '메시지 입력 또는 마이크',
    btnSend: '전송',
    unknown: '죄송해요, 잘 이해하지 못했어요.',
    register: (name) => `"${name}"(으)로 DB 등록 창을 열고 이름을 입력했습니다! 🥤\n이제 "2단계 저장해줘"라고 말씀해 보세요.`,
    saving: (text) => `음성 명령("${text}")을 인식하여 2단계 DB 저장을 실행합니다! 💾`,
    reward: '리워드 상세 내역을 불러옵니다. 📊',
    intro: "저는 스마트 재활용 플랫폼 'RC'의 인공지능 비서입니다! 🤖♻️\n\n실시간 AI 비전 스캐너로 페트병/캔을 감지하고\n음성 및 챗팅으로 DB 등록과 앱을 제어할 수 있습니다.",
    login: "🌱 RC 에코 서비스 로그인 방법입니다!\n\n" +
              "1️⃣ 일반 로그인: 관리자가 아니시라면 주소검색으로 선택 후 주민으로 시작하기를 눌러주세요.\n" +
              "2️⃣ 구글/카카오/네이버 로그인: 상단 소셜 로그인으로 물품 등록 등 관리를 하실 수 있어요.\n\n"
  },
  en: {
    title: '🤖 RC Smart Assistant (Voice)',
    greeting: 'Hello! I am your Eco Chatbot. 🤖\nListening starts automatically as it opens!\n(e.g., "What can I do with my points?", "Send points to mom")',
    listening: '🎤 Listening... Please speak!',
    placeholder: 'Type a message or use mic',
    btnSend: 'Send',
    unknown: "Sorry, I didn't understand that.",
    register: (name) => `Opened DB form and entered "${name}"! 🥤\nNow try saying "Save step 2".`,
    saving: (text) => `Recognized command ("${text}"). Executing step 2 DB save! 💾`,
    reward: 'Loading detailed reward history. 📊',
    intro: "I am the AI assistant for the smart recycling platform 'RC'! 🤖♻️\n\nDetects PET/cans with real-time AI vision\nControls DB registration and app features via voice/chat."
  },
  zh: {
    title: '🤖 RC 智能助手 (语音支持)',
    greeting: '您好！我是环保聊天机器人。🤖\n打开后将立即开始语音识别！\n(例如："我的积分能做什么？", "把积分送给妈妈")',
    listening: '🎤 正在倾听... 请说话！',
    placeholder: '输入消息或使用麦克风',
    btnSend: '发送',
    unknown: '抱歉，我不太明白您的意思。',
    register: (name) => `已打开数据库表单并输入“${name}”！ 🥤\n现在请说“保存第二步”。`,
    saving: (text) => `识别到指令（"${text}"），正在执行第二步数据库保存！ 💾`,
    reward: '正在加载奖励详细信息。 📊',
    intro: "我是智能回收平台“RC”的AI助手！ 🤖♻️\n\n通过实时AI视觉扫描检测塑料瓶/易拉罐\n通过语音和聊天控制数据库注册和应用功能。"
  }
};

const ChatWidget = forwardRef((props, ref) => {
  const {
    points = 0,
    userInfo,
    onShareKakao,
    lang = 'ko',
    onOpenDbModal,
    onOpenRewardModal,
    onSetDrinkName,
    onSubmitDb
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false); // 💡 새 알림 대기 상태 (N 아이콘 표시용)
  const ct = chatTranslations[lang] || chatTranslations.ko;

  const [messages, setMessages] = useState([
    { sender: 'bot', text: ct.greeting }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerEcoFeedback: async ({ itemName, earnedPoints, totalPoints }) => {
      // 기존 로직 유지
    },

    // 💡 [수정됨] 재활용 인식 시 창을 열지 않고, 메시지만 추가한 뒤 알림(N)만 띄움
    triggerLabelAlert: ({ itemName, hasLabel, earnedPoints }) => {
      setHasNewAlert(true); // 알림 배지 활성화

      if (hasLabel) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚠️ [${itemName}] 확인되었습니다!\n라벨(종이 슬리브)이 부착되어 있어 기본 ${earnedPoints} ECO P만 적립되었습니다. 🏷️\n\n✂️ 라벨을 뜯어서 다시 비춰주시면 2배(200 ECO P) 보너스가 적립됩니다!`
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `🎉 무라벨 고품질 분리수거 성공!\n라벨을 제거해 주셔서 [에코 보너스 2배] ${earnedPoints} ECO P가 적립되었습니다! 🏆✨`
          }
        ]);
      }
    }
  }));

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. 크롬(Chrome)을 사용해 주세요!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ko-KR';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      setIsListening(false);
      processCommand(speechToText);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // 사용자가 버튼을 눌러 직접 열었을 때만 음성 인식 자동 실행
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleVoiceInput();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const processCommand = async (userText) => {
    setMessages((prev) => [...prev, { sender: 'user', text: `🎤 "${userText}"` }]);
    setInput('');

    const lowerText = userText.toLowerCase();

    // 1. 가치 변환
    if (
      lowerText.includes('뭐 할 수') || lowerText.includes('뭐해') ||
      lowerText.includes('가치') || lowerText.includes('환전') ||
      (lowerText.includes('포인트') && (lowerText.includes('얼마') || lowerText.includes('사용') || lowerText.includes('혜택')))
    ) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '💡 현재 실시간 물가와 포인트를 분석 중입니다...' }]);
      const replyText = await convertPointsToRealValue(points, null);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: 'bot', text: replyText };
        return next;
      });
      return;
    }

    // 2. 카카오톡 공유
    if (
      lowerText.includes('보내') || lowerText.includes('선물') ||
      lowerText.includes('카톡') || lowerText.includes('카카오') ||
      lowerText.includes('엄마') || lowerText.includes('가족')
    ) {
      let customMsg = "엄마 나 오늘 분리수거 완벽함";
      const match = userText.match(/['"](.+?)['"]/);
      if (match) {
        customMsg = match[1];
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `가족에게 보낼 카카오톡 선물 카드를 발송합니다! 🎁\n(메시지: "${customMsg}")` }
      ]);

      if (typeof onShareKakao === 'function') {
        onShareKakao({ targetPerson: '가족', customMessage: customMsg });
        return;
      }

      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('f7d216c9253bd3d4d3cf2eaf836373f8');
        }
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '🎁 분리수거 포인트 선물 도착!',
            description: customMsg,
            imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c3fa4a0d5d',
            link: {
              mobileWebUrl: 'https://plasticmoney.duckdns.org',
              webUrl: 'https://plasticmoney.duckdns.org',
            },
          },
          buttons: [
            {
              title: '포인트 받기',
              link: {
                mobileWebUrl: 'https://plasticmoney.duckdns.org',
                webUrl: 'https://plasticmoney.duckdns.org',
              },
            },
          ],
        });
      } else {
        alert("카카오톡 SDK를 불러오지 못했습니다.");
      }
      return;
    }

    // 3. 포인트 확인
    if (lowerText.includes('포인트') || lowerText.includes('point') || lowerText.includes('잔액')) {
      setMessages((prev) => [...prev, { sender: 'bot', text: `현재 누적 포인트는 ${points.toLocaleString()} ECO P 입니다! 🏆` }]);
      return;
    }

    // 4. 음료수/DB 등록
    if (lowerText.includes('등록') || lowerText.includes('register') || lowerText.includes('注册') || lowerText.includes('음료수')) {
      let extractedName = userText.replace('등록해줘', '').replace('register', '').replace('注册', '').replace('음료수', '').trim();
      if (!extractedName) extractedName = "Eco Beverage";

      setMessages((prev) => [...prev, { sender: 'bot', text: ct.register(extractedName) }]);
      if (onOpenDbModal) onOpenDbModal();
      if (onSetDrinkName) onSetDrinkName(extractedName);
      return;
    }

    // 5. 2단계 DB 저장
    if (lowerText.includes('2단계') || lowerText.includes('step 2') || lowerText.includes('저장') || lowerText.includes('save')) {
      setMessages((prev) => [...prev, { sender: 'bot', text: ct.saving(userText) }]);
      const submitBtn = document.getElementById('db-submit-btn');
      if (submitBtn) {
        submitBtn.click();
      } else if (onSubmitDb) {
        onSubmitDb();
      }
      return;
    }

    // 6. 리워드 내역
    if (lowerText.includes('리워드') || lowerText.includes('reward')) {
      setMessages((prev) => [...prev, { sender: 'bot', text: ct.reward }]);
      if (onOpenRewardModal) onOpenRewardModal();
      return;
    }

    // 7. 앱 소개
    if (lowerText.includes('너는 누구') || lowerText.includes('어떤 앱') || lowerText.includes('소개')) {
      setMessages((prev) => [...prev, { sender: 'bot', text: ct.intro }]);
      return;
    }

    if (lowerText.includes('로그인') || lowerText.includes('어떻게 사용') || lowerText.includes('사용방법')) {
      setMessages((prev) => [...prev, { sender: 'bot', text: ct.login }]);
      return;
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: `${ct.unknown} ("${userText}")` }]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input.trim());
  };

  return (
    <div className="chat-widget-wrapper">
      {!isOpen ? (
        <button
          className="chat-floating-btn"
          onClick={() => {
            setIsOpen(true);
            setHasNewAlert(false); // 사용자가 열면 알림(N) 배지 해제
          }}
          style={{ position: 'relative' }}
        >
          💬 {lang === 'en' ? 'Eco Bot' : lang === 'zh' ? '环保助手' : '에코 챗봇'}
          {hasNewAlert && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid #fff'
            }}>
              N
            </span>
          )}
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <span>{ct.title}</span>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`} style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            {isListening && (
              <div className="chat-message bot" style={{ color: '#34d399', fontStyle: 'italic' }}>
                {ct.listening}
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSend}>
            <button
              type="button"
              onClick={handleVoiceInput}
              style={{
                backgroundColor: isListening ? '#ef4444' : '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '0 8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '4px'
              }}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
            <input
              type="text"
              placeholder={isListening ? "..." : ct.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">{ct.btnSend}</button>
          </form>
        </div>
      )}
    </div>
  );
});

export default ChatWidget;