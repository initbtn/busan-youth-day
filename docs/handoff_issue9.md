# 2026 BYD 프로젝트 인계 브리프 (Handoff to Worker Session - Issue #9)

## 1. 인계 대상 및 목표
- **대상 저장소**: [`initbtn/busan-youth-day`](https://github.com/initbtn/busan-youth-day)
- **작업 브랜치**: `feat-issue-9-feed-persistence` (또는 `fix/issue-9-feed-refresh-persistence`)
- **대상 프로젝트 보드**: [2026 BYD 프로젝트 보드 (#3)](https://github.com/users/initbtn/projects/3)
- **마일스톤**: [`MVP-2026-BYD` (Milestone #1)](https://github.com/initbtn/busan-youth-day/milestone/1)
- **작업 이슈**: [**Issue #9: fix: 커뮤니티 피드 새로고침 시 게시글/사진 소실 방지 (Supabase posts 연동 및 LocalStorage 오프라인 캐싱, R2 실연동)**](https://github.com/initbtn/busan-youth-day/issues/9)
- **라이브 URL**: [https://busan-youth-day.vercel.app](https://busan-youth-day.vercel.app)

---

## 2. 작업 수용 기준 (DoD - 완료 조건)
새 워커 세션은 [`change-flow`](/home/waffle/projects/domstack/skills/change-flow/SKILL.md) 절차에 따라 다음 항목들을 구현 및 검증해야 합니다:

1. **Supabase DB 영구 저장 (`posts` 테이블)**:
   - `src/components/CommunityFeedView.tsx`에서 게시글 작성 시 `createClient()`를 통해 Supabase `posts` 테이블에 `insert` 연동
   - 컬럼: `content`, `image_url` (R2 CDN 공개 주소), `user_id`, `created_at`
2. **최신 피드 조회 및 렌더링 (`select`)**:
   - 컴포넌트 마운트 시 Supabase `posts` 테이블에서 최신 게시글 목록 조회 (`select("*").order("created_at", { ascending: false })`)
3. **오프라인 / Graceful LocalStorage 폴백**:
   - `UserContext.tsx`처럼 Supabase 미연동이나 네트워크 오류 시에도 `localStorage`(`byd2026_community_posts`)에 자동 캐싱되어 새로고침 후 글이 사라지지 않도록 양방향 동기화
4. **Cloudflare R2 영구 이미지 URL 연결**:
   - R2 업로드 성공 시 생성된 영구 CDN URL(`NEXT_PUBLIC_R2_PUBLIC_URL/posts/...`)을 `posts.image_url`에 기록
5. **빌드 검증 & PR 머지 & 배포**:
   - `npm run build` 검증 통과
   - PR 생성 (`closes #9`) → 리뷰 통과 → [사람 머지 게이트] → Vercel 재배포 완료

---

## 3. 환경 및 시크릿 상태
- **domstack**: `/home/waffle/projects/domstack` 최신 설치 완료 (`./setup --check` drift 0, `toolPermission: always-proceed` 활성화)
- **Supabase**: `pass show supabase/api-token` 등록 완료 (Project ID: `rhkrhkxrnpfnrqxwjojo`, URL: `https://rhkrhkxrnpfnrqxwjojo.supabase.co`)
- **Vercel**: `pass show vercel.com/token-jsconn` 등록 완료 (Team scope 권한 필요)
- **Cloudflare**: `pass show cloudflare/api-token`

---

## 4. 새 세션 실행 가이드
새 세션에서 다음 프롬프트를 입력하여 작업을 시작하세요:
```text
이슈 #9 "fix: 커뮤니티 피드 새로고침 시 게시글/사진 소실 방지 (Supabase posts 연동 및 LocalStorage 오프라인 캐싱, R2 실연동)" 작업을 인계받았습니다.
.claude/handoff/brief.md 인계 브리프에 정의된 DoD에 따라 change-flow 스텝(브랜치/워크트리 생성 -> TDD/구현 -> 빌드 검증 -> PR 발행 -> 머지 -> 배포)을 순서대로 진행해 주세요.
```
