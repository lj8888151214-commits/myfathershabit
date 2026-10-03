# ♻️ RC (Recycle Clean) - 아빠의 습관 (myfathershabit)
> **AI 컴퓨터 비전 기반 객체 인식 및 분리배출 리워드/포인트 관리 웹 서비스**

---

### 💡 1. 기획 의도 및 배경

| 항목 | 내용 |
| :--- | :--- |
| **올바른 분리배출 문화 정착** | 모호하고 복잡한 분리수거 규정으로 인한 오분류를 줄이고, AI 비전 인식을 통해 올바른 배출 가이드를 즉각 제시합니다. |
| **친환경 행동에 대한 즉각적 보상** | 재활용 실천 시 포인트 리워드를 실시간 적립해 주어 분리배출 참여를 지속적이고 자발적인 습관으로 유도합니다. |
| **인근 배출 거점 접근성 개선** | 사용자 현재 위치 기반 카카오맵 연동으로 주변 무인 회수기 및 재활용 거점 수거함을 손쉽게 탐색할 수 있도록 돕습니다. |

---

### 🛠 2. 사용 기술 (Tech Stack)

#### Backend & Security
<p>
  <img src="https://img.shields.io/badge/Java_17-007396?style=flat-square&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot_3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>
</p>

#### AI & Data Pipeline
<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white"/>
  <img src="https://img.shields.io/badge/YOLO-00FFFF?style=flat-square&logo=yolo&logoColor=black"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white"/>
</p>

#### Database & ORM
<p>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Data_JPA-59666C?style=flat-square&logo=hibernate&logoColor=white"/>
</p>

#### Frontend & External API
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/Kakao_Map_API-FFCD00?style=flat-square&logo=kakao&logoColor=black"/>
</p>

#### DevOps & Tools
<p>
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/>
  <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=amazonec2&logoColor=white"/>
</p>

---

### ⏱ 3. 제작 기간 (총 5주 Sprint)

| 주차 | 단계 | 주요 작업 내용 |
| :---: | :--- | :--- |
| **1주차** | **요구사항 분석 및 설계** | 분리배출 도메인 모델링, DB ERD 설계, RESTful API 규격 명세화 |
| **2주차** | **백엔드 구축 및 인증** | Spring Security & JWT 무상태 인증 환경 구축, 수거함/배출 이력 CRUD 구현 |
| **3주차** | **AI 비전 추론 모델 연동** | Spring Boot - Python(OpenCV/YOLO) 멀티파트 이미지 연동 및 보상 계산 로직 |
| **4주차** | **프론트엔드 연동 & 외부 API** | React 모바일 화면 구축, 카메라 촬영 인터페이스, 카카오맵 거점 탐색 연동 |
| **5주차** | **동시성 검증 및 배포** | 포인트 트랜잭션 격리 제어, Docker 빌드, AWS EC2 배포 및 통합 테스트 |

---

### 🚀 4. 핵심 기술 구현 사항

- **Spring Boot - Python 간 AI 비전 판별 파이프라인 구축**
  - 클라이언트가 업로드한 이미지를 Spring Boot를 거쳐 Python(OpenCV/YOLO) 추론 서버로 전달하는 Multipart 통신 체계 구현
  - 인식 신뢰도(Confidence Threshold) 검증을 통해 오인식을 방지하고 품목별 적합 여부 자동 판별
- **재활용 보상 포인트 산출 및 트랜잭션 무결성 보장**
  - 판별 결과에 따른 품목별 기준 단가 기반 포인트 자동 계산 및 적립 처리
  - 동시 요청 시 중복 지급을 방지하기 위한 트랜잭션 격리 및 무결성 보장 로직 적용
- **카카오맵 API 연동 위치 기반 배출 거점 탐색**
  - 사용자 현재 GPS 좌표를 수신하여 반경 내 무인 회수기 및 거점 수거함 위치 오버레이 표시
  - React 라이프사이클(`useEffect`)과 외부 지도 SDK 로딩 동기화 트러블슈팅 해결
- **수거 통계 및 대시보드 시각화**
  - 일별·주별·품목별(플라스틱, 캔, 페트 등) 집계 쿼리를 최적화하고 Chart.js와 연동하여 배출 현황 제공

---

### 📱 5. 주요 화면 시각 자료

| 카메라 촬영 및 AI 객체 인식 | 포인트 적립 및 리워드 대시보드 |
| :---: | :---: |
| <img src="이미지주소1" width="380" alt="AI 분리배출 촬영 화면"/> | <img src="이미지주소2" width="380" alt="포인트 적립 화면"/> |
| *업로드 이미지 분석 및 품목/신뢰도 검증* | *배출 품목별 리워드 포인트 자동 적립 내역* |

| 카카오맵 기반 주변 수거 거점 탐색 | 배출 통계 및 마이페이지 |
| :---: | :---: |
| <img src="이미지주소3" width="380" alt="거점 지도 화면"/> | <img src="이미지주소4" width="380" alt="통계 차트 화면"/> |
| *현재 위치 기반 인근 무인 회수기 좌표 오버레이* | *Chart.js 기반 일별/품목별 배출 통계 시각화* |
