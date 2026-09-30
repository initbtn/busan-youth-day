# Handover Brief: 2026 BYD 프로젝트 후속 작업 인계

## 1. 완료된 작업 요약
- **저장소 및 보드 온보딩**:
  - `initbtn/busan-youth-day` 생성 및 Projects v2 [2026 BYD 프로젝트 보드 (#3)](https://github.com/users/initbtn/projects/3) 바인딩 완료
  - 마일스톤 [`MVP-2026-BYD`](https://github.com/initbtn/busan-youth-day/milestone/1) 생성 및 어댑터(`change-flow-adapter.md`) 기계 배선 완료
- **MVP 배포 완료**:
  - TSD 디자인 토큰 수립 (4대 테마존 컬러 팔레트)
  - 온보딩 모달, 영적 모달, 스탬프 투어, 피드, 행사 안내 5대 뷰 구현
  - Issue #1 종결 및 PR #2 스쿼시 머지 완료
  - Vercel 프로덕션 배포 완료: [https://busan-youth-day.vercel.app](https://busan-youth-day.vercel.app) (HTTP 200 OK)

## 2. 현재 환경 상태
- **브랜치**: `main` (최신 커밋 동기화 완료)
- **작업트리**: Clean (`git status` 깨끗함)
- **다음 대상 이슈**: [**Issue #3**](https://github.com/initbtn/busan-youth-day/issues/3)
  - 제목: `feat: 목업 1:1 정렬, 웹 카메라 QR 스캐너, 전면 악보/기도문 뷰어 및 PWA/R2 최적화`

## 3. 다음 워커 세션 착수 항목 (DoD)
새 워커 세션은 `change-flow` 절차(브랜치 생성 -> 구현 -> 빌드 -> PR -> 머지 -> 배포)에 따라 다음 작업을 수행해야 합니다:
1. **악보 및 기도문 전면(Full Screen) 뷰어**:
   - `theme_song_sheet_music.webp` 및 `yd2027_official_prayer_image.webp`를 화면 전체를 활용하여 가독성 높게 표시
2. **실제 스마트폰 웹 카메라 QR 스캐너 연동**:
   - `html5-qrcode` 패키지를 이용해 후면 카메라로 부스 QR 인식 시 스탬프 자동 적립
3. **PWA 설정**:
   - `manifest.json` 및 standalone 메타태그로 모바일 브라우저 주소창 제거
4. **Cloudflare R2 스토리지 실 연동**:
   - API Route (`/api/upload`) 및 클라이언트 이미지 리사이징(1200px) 후 R2 직업로드
5. **Next.js 캐싱 & 도메인 최적화**:
   - `next.config.mjs`에 `Cache-Control: public, max-age=31536000, immutable` 및 R2 도메인 `remotePatterns` 등록
6. **디자인 목업 1:1 정렬**:
   - 쭈양이 캐릭터, 3-Day 날짜 탭, 4대 테마존 맵 뷰 정밀 반영
7. **SEO & OpenGraph (OG) & 파비콘**:
   - 카카오톡/SNS 공유 시 대표 썸네일(`byd2026_combined_final_vibe_mockup.webp`) 및 메타태그 등록, 쭈양이 파비콘 및 `apple-touch-icon.png` 적용
8. **빌드 검증 & PR 머지 & 배포**:
   - `npm run build` 통과 -> PR 생성 (`closes #3`) -> Vercel 재배포
