# Change-flow 어댑터 — busan-youth-day (C tier)

`change-flow` 스킬이 `busan-youth-day` 프로젝트를 대상으로 돌 때 읽는 프로젝트 파라미터.

## 파라미터

| 키 | busan-youth-day 값 |
|---|---|
| **issue(◦)** | issue-first (1인 프로젝트, GitHub 이슈 연동 또는 로컬 마일스톤 추적) |
| **마일스톤(◦)** | `MVP-2026-BYD` |
| **프로젝트(◦)** | **3** (owner: `initbtn`, URL: https://github.com/users/initbtn/projects/3) |
| **착수 표시(◦)** | 켠다 |
| **worktree(①)** | 메인 작업트리 또는 기능별 브랜치 |
| **토큰(⓪⑤⑥⑧)** | pass show github/gh-token (WARM 상태 필요) |
| **verify(③)** | `npm test` 단위/계약 테스트 전수 통과, 클라이언트 앱 Playwright E2E/단위 테스트 (`e2e/*.spec.ts`), `npm run build` 및 TypeScript/ESLint 검증, `make env-check` |
| **ADR(②)** | `docs/architecture-decision-record/` |
| **리뷰 차원(⑦)** | 디자인 일관성(TSD 토큰), 보안(Supabase RLS, Presigned URL 유효시간), 기능 무결성, 프로비저닝 멱등성 |
| **커밋(④)** | 한국어, prefix `feat:`/`docs:`/`fix:`/`chore:`/`style:` |
| **PR(⑥)** | PR 생성 시 closes 연동 |
| **merge 모델(⑧)** | squash-only |
| **cleanup(⑨)** | 빌드 아티팩트 및 임시 파일 정리 |
| **배포(⑩)** | Vercel CLI 배포 (진입점: `npx vercel --prod` / 환경변수 프로비저닝: `make env-sync-vercel` / `pass vercel.com/token-jsconn`) |
| **warming** | pass·gpg (`DOMSTACK_WARMING` on) |
