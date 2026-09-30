# 2026 BYD 프로젝트 인계 브리프 (Handoff to Worker Session)

## 1. 인계 대상 및 목표
- **대상 저장소**: [`initbtn/busan-youth-day`](https://github.com/initbtn/busan-youth-day)
- **대상 프로젝트 보드**: [2026 BYD 프로젝트 보드 (#3)](https://github.com/users/initbtn/projects/3)
- **마일스톤**: [`MVP-2026-BYD` (Milestone #1)](https://github.com/initbtn/busan-youth-day/milestone/1)
- **작업 이슈**: [**Issue #3: feat: 목업 1:1 정렬, 웹 카메라 QR 스캐너, 전면 악보/기도문 뷰어 및 PWA/R2 최적화**](https://github.com/initbtn/busan-youth-day/issues/3)
- **라이브 URL**: [https://busan-youth-day.vercel.app](https://busan-youth-day.vercel.app)

---

## 2. 작업 수용 기준 (DoD - 완료조건)
새 워커 세션은 [`change-flow`](/home/dominic/projects/domstack/skills/change-flow/SKILL.md) 절차에 따라 다음 항목들을 구현 및 검증해야 합니다:

1. **악보 및 기도문 전면(Full Page/Modal) 뷰어 전환**:
   - `public/assets/theme_song_sheet_music.webp` 및 `yd2027_official_prayer_image.webp`를 활용하여 화면 전체를 채우는 고화질 인터랙티브 뷰어로 렌더링 (좁은 텍스트 모달 탈피, 핀치 줌 지원)
2. **실제 스마트폰 웹 카메라 QR 스캐너 구동**:
   - `html5-qrcode` 패키지 활용
   - 사용자가 '부스 QR 스캔' 버튼 클릭 시 브라우저 카메라 권한 요청 및 비디오 스트림 뷰파인더 구동 → 부스 QR 코드 인식 시 즉시 스탬프 적립
3. **PWA 설정**:
   - `public/manifest.json`, 서비스 워커 및 standalone 메타태그 구성으로 모바일 브라우저 주소창 제거 (홈 화면 추가 시 네이티브 앱처럼 동작)
4. **Cloudflare R2 스토리지 실 업로드 파이프라인 연동**:
   - Next.js Route Handler (`/api/upload`) 및 클라이언트 캔버스 기반 이미지 리사이징(1200px) 후 R2 직업로드 연동
5. **Next.js 정적 에셋 불변 캐싱 & 도메인 최적화**:
   - `next.config.mjs`에 `Cache-Control: public, max-age=31536000, immutable` 및 R2 도메인 `remotePatterns` 등록
6. **디자인 목업 1:1 완벽 정렬**:
   - `design/byd2026_combined_final_vibe_mockup.webp` 및 `byd2026_exact_source_based_ui_summary.webp` 기반 쭈양이 캐릭터, 3-Day 날짜 탭, 스포원파크 4대 테마존 맵 뷰 정밀 반영
7. **SEO 최적화 & OpenGraph SNS 공유 썸네일 & 파비콘**:
   - 카카오톡/인스타그램/X 링크 공유 시 표시되는 OpenGraph (`og:image`, `og:title`, `og:description`) 메타데이터 등록
   - `public/assets/byd2026_combined_final_vibe_mockup.webp`를 OG 대표 썸네일로 연결
   - 쭈양이 캐릭터 기반 파비콘 및 애플 터치 아이콘(`apple-touch-icon.png`, `favicon.ico`) 적용
8. **빌드 검증 & PR 머지 & 배포**:
   - `npm run build` 통과 확인 → PR 생성 (`closes #3`) → [사람 머지 게이트] → Vercel 재배포 완료

---

## 3. 새 세션 실행 가이드
새 세션 프롬프트 입력 예시:
```text
이슈 #3 "feat: 목업 1:1 정렬, 웹 카메라 QR 스캐너, 전면 악보/기도문 뷰어 및 PWA/R2 최적화" 작업을 인계받았습니다.
docs/handoff_issue3.md 인계 브리프에 정의된 DoD에 따라 change-flow 스텝(브랜치 생성 -> 구현 -> 빌드 검증 -> PR 발행 -> 머지 -> 배포)을 순서대로 진행해 주세요.
```
