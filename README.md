# 부산 청년대회 2026 (Busan Youth Day, BYD)

> **2026 천주교 부산교구 젊은이의 날 공식 모바일 웹 플랫폼 — 4대 테마존 현장지도, 7성사 부스/스탬프투어, 카카오 SSO, 실시간 소통피드**

[![CI Pipeline](https://github.com/initbtn/busan-youth-day/actions/workflows/e2e.yml/badge.svg)](https://github.com/initbtn/busan-youth-day/actions/workflows/e2e.yml)
[![Supabase Keep-Alive](https://github.com/initbtn/busan-youth-day/actions/workflows/supabase-keepalive.yml/badge.svg)](https://github.com/initbtn/busan-youth-day/actions/workflows/supabase-keepalive.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB_&_Storage-3ECF8E.svg)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Production_Edge-black.svg)](https://busan-youth-day.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-Mobile_Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

---

## 1. 프로젝트 개요 (Overview)

**부산 청년대회 2026 (BYD)**는 천주교 부산교구 청소년사목국 주관으로 개최되는 청년 신앙 축제 참가자를 위한 **올인원 모바일 웹 플랫폼**입니다. 수천 명의 청년과 봉사자가 밀집하는 현장 환경에서 안정적으로 동작하도록 설계되었으며, 직관적인 현장 길안내와 인터랙티브 순례 체험, 청년 간 실시간 신앙 나눔을 지원합니다.

### 🎯 핵심 운영 목표
1. **대규모 현장 안정성**: 단절 없는 축제 운영을 위해 Supabase Auth 장애 격리(Graceful Degradation) 및 텔레그램 실시간 장애 관제 파이프라인 구축
2. **몰입형 순례 UX**: 4대 테마존 81개 부스 안내, 7성사 필수 스탬프투어, QR 보물찾기 게임화(Gamification)
3. **가벼운 실시간 소통**: 카카오 SSO 기반 3초 온보딩 및 아이폰 HEIC 자동 WebP 변환을 통한 고속 피드 업로드

---

## 2. 클라우드-서버리스 아키텍처 (Architecture)

Vercel 엣지 인프라와 Supabase의 완전 관리형 백엔드 서비스를 결합하여 높은 동시성 트래픽을 지연 없이 처리하며, 자동화된 Keep-Alive Cron과 텔레그램 웹훅으로 무중단 운영 체계를 유지합니다.

```mermaid
flowchart TD
    subgraph Client ["📱 모바일 PWA 클라이언트 (Next.js 14 App Router)"]
        UI["반응형 모바일 뷰포트<br>(메인, 지도, 피드, 미사, 프로필)"]
        HEIC["클라이언트 이미지 최적화<br>(HEIC → JPEG/WebP 변환)"]
        PORTAL["참조 카운트 ModalPortal<br>(바디 스크롤 잠금 가드)"]
        UI --> HEIC
        UI --> PORTAL
    end

    subgraph EdgePlatform ["⚡ Vercel Edge & Serverless"]
        MW["Next.js 미들웨어<br>(3초 타임아웃 세션 가드)"]
        API_AUTH["/api/auth/callback/kakao<br>(카카오 OAuth SSO 교환)"]
        API_UPLOAD["/api/upload<br>(S3 Presigned URL 서명)"]
        PROXY["정적 페이지 ISR / CDN 캐싱"]
        MW --> PROXY
    end

    subgraph BackendCloud ["☁️ Supabase Cloud (PostgreSQL 16)"]
        AUTH["Supabase Auth<br>(카카오 토큰 세션 발급)"]
        DB[("PostgreSQL DB<br>(게시글, 부스, 스탬프, 프로필)")]
        STORAGE["Supabase Storage<br>(소통피드 다중 미디어 S3)"]
        RLS["행 단위 보안 (RLS 정책)"]
        DB --- RLS
    end

    subgraph Monitoring ["🛰️ 자동화 관제 & 알림망"]
        CRON["GitHub Actions Cron<br>(3일 주기 Keep-Alive 핑)"]
        TG_BOT["텔레그램 웹훅 봇<br>(다중 프로젝트 식별 장애 경보)"]
    end

    Client -->|HTTPS / PWA| MW
    MW -->|세션 검증 (실패 시 무중단 폴백)| AUTH
    Client -->|REST / RPC API| DB
    Client -->|소통 사진 직업로드| STORAGE
    Client -->|SSO 콜백| API_AUTH
    MW -.->|장애 감지 시 비동기 알림| TG_BOT
    CRON -.->|REST 핑 실패 시 즉시 알림| TG_BOT
    CRON -->|3일 주기 활성 핑| DB
```

---

## 3. 5대 핵심 도메인 기능 (Core Features)

| 서비스 영역 | 핵심 기능 및 사용자 가치 | 기술적 차별점 |
|---|---|---|
| **1. 🗺️ 현장 지도 & 부스 안내** | • 4대 테마존(사랑, 희망, 기쁨, 평화) 81개 부스 상세 검색<br>• 7성사 필수 부스 묶음 핀 및 시트 연동<br>• 존 카드-리스트 동기화 스크롤 슬라이더 | • Leaflet 기반 커스텀 핀 클러스터링<br>• 바텀시트 반응형 레이아웃 및 검색 필터링 |
| **2. 📸 실시간 소통피드** | • 현장의 은혜로운 순간을 사진과 함께 실시간 공유<br>• 본당, 직책, 5대 수호성인 모둠 배지 자동 표기<br>• 좋아요, 댓글 반응 및 무한 스크롤 피드 | • 아이폰 HEIC 자동 WebP 변환 클라이언트 파이프라인<br>• `media_urls` Supabase 배열 영속화 및 CDN 캐싱 |
| **3. 🔑 카카오 SSO & 온보딩** | • 카카오 계정 1초 원클릭 로그인<br>• 지구, 본당, 역할(청년/봉사자/성직자), 수호성인 모둠 설정<br>• 마이프로필 즉시 수정 및 로컬 스토리지 동기화 | • Supabase Auth 카카오 OAuth 브릿지<br>• 비로그인 사용자 기본 열람 허용 (Graceful Access) |
| **4. 🏆 7성사 스탬프 & 보물찾기** | • 7성사 부스 방문 확인 및 디지털 도장 획득<br>• 행사장 곳곳에 숨겨진 QR코드 보물찾기 게임<br>• 순례 완료 시 축복 리워드 증정 | • `html5-qrcode` 카메라 스트림 최적화<br>• 부정 스탬프 방지 검증 해시 로직 |
| **5. 📖 전례 & 영성 가이드** | • 파견미사 순서, 전례 기도문, 독서/복음 수록<br>• 현장 청년 찬양 성가집 및 가사 뷰어<br>• 5대 수호성인 영성 해설 및 묵상 카드 | • 오프라인 PWA 정적 캐싱 지원<br>• 가독성 높은 성경/전례 타이포그래피 |

---

## 4. 디자인 시스템 & 모바일 UX 규율 (Design System & Mobile UX)

부산 청년대회는 직사광선이 내리쬐는 야외 행사장 환경을 고려하여 **고대비 명도 설계**와 **엄격한 스크롤 격리 규율**을 준수합니다:

- **컬러 팔레트 (Theme Tokens)**:
  - **Youth Blue**: `#1D4ED8` / `#2563EB` (부산 바다와 청년의 열정을 상징하는 메인 브랜드 컬러)
  - **Warm Gold**: `#F59E0B` (영성과 축복을 상징하는 서브 액센트)
  - **Surface Light**: `#F8FAFC` / `#FFFFFF` (야외 시인성 극대화 화이트 서피스)
  - **Text Neutral**: `#0F172A` / `#334155` (가독성 보장 고대비 텍스트)
- **참조 카운트 모달 포털 (`ModalPortal`)**:
  - 모달 오버레이가 중첩되거나 닫힐 때 `document.body`의 `overflow: hidden` 잠금이 조기 해제되지 않도록 참조 카운팅(`createScrollLock`) 훅 적용
  - 모든 팝업, 바텀시트, 가이드 뷰는 React Portal을 통해 렌더링되어 z-index 충돌 방지
- **PWA 최적화**:
  - 모바일 사파리/크롬 상하단 툴바를 고려한 `viewport-fit=cover` 및 Safe Area 패딩 대응

---

## 5. 기술 스택 (Tech Stack)

| 계층 | 기술 스택 | 설명 |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5 | SSR/ISR 하이브리드 웹앱, 컴포넌트 모듈화 |
| **Styling** | Tailwind CSS, clsx, tailwind-merge | 유틸리티 퍼스트 CSS, 반응형 디자인 |
| **Backend & DB** | Supabase (PostgreSQL 16), Row Level Security (RLS) | 실시간 데이터베이스, 세션 인증, Storage |
| **Authentication** | Supabase Auth, Kakao REST OAuth 2.0 | 카카오 SSO 간편 회원가입 및 세션 관리 |
| **Media Pipeline** | heic2any, HTML5 Canvas, AWS S3 SDK | 아이폰 HEIC 자동 변환, 클라이언트 리사이징 |
| **Hardware / QR** | html5-qrcode, Lucide React Icons | 카메라 바코드/QR 스캔, 벡터 아이콘 |
| **Testing & CI** | Node.js Test Runner, Playwright, GitHub Actions | 26개 단위/계약 테스트 스위트, E2E 회귀 방지 |
| **Infrastructure** | Vercel (Production), Cloudflare DNS | 글로벌 엣지 배포 및 SSL 자동 프로비저닝 |

---

## 6. 시작하기 (Getting Started)

### 사전 요구사항
- Node.js `v18.17.0` 이상
- npm `9.0.0` 이상

### 1) 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/initbtn/busan-youth-day.git
cd busan-youth-day
npm install
```

### 2) 환경변수 설정 (`.env.local`)
저장소 루트에 `.env.local` 파일을 생성하고 필요한 자격증명을 입력합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
TELEGRAM_CHAT_ID=<your-telegram-chat-id>
```

### 3) 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

### 4) 전체 테스트 및 빌드 검증
```bash
# 전체 단위 및 계약 테스트 스위트 (32개 스위트) 실행
npm test

# 프로덕션 번들 빌드 및 타입 검사
npm run build
```

---

## 7. 프로젝트 거버넌스 및 거버넌스 문서

- **GitHub 공식 저장소**: [initbtn/busan-youth-day](https://github.com/initbtn/busan-youth-day)
- **실배포 프로덕션 도메인**: [https://busan-youth-day.vercel.app](https://busan-youth-day.vercel.app)
- **GitHub Projects v2 보드**: [BYD 2026 Board (#3)](https://github.com/users/initbtn/projects/3)
- **변경 라이프사이클 어댑터**: [`change-flow-adapter.md`](./change-flow-adapter.md)
- **라이선스**: Private (천주교 부산교구 청소년사목국 전용)
