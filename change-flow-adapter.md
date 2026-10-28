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
| **DB 마이그레이션(②)** | Supabase 타임스탬프 마이그레이션 (`supabase/migrations/` 단일 정본, `docs/operations/supabase-migration.md` 런북 준수) |
| **리뷰 차원(⑦)** | 디자인 일관성(TSD 토큰), 보안(Supabase RLS, Presigned URL 유효시간), 기능 무결성, 프로비저닝 멱등성 |
| **커밋(④)** | 한국어, prefix `feat:`/`docs:`/`fix:`/`chore:`/`style:` |
| **PR(⑥)** | PR 생성 시 closes 연동 |
| **merge 모델(⑧)** | squash-only |
| **cleanup(⑨)** | 빌드 아티팩트 및 임시 파일 정리 |
| **배포(⑩)** | Vercel CLI 배포 (진입점: `npx vercel --prod` / 환경변수 프로비저닝: `make env-sync-vercel` / `pass vercel.com/token-jsconn`) |
| **warming** | pass·gpg (`DOMSTACK_WARMING` on) |
| **알림** | 텔레그램 봇 알림 (토큰: `pass show telegram/bot-token` / chat_id: `pass show telegram/chat-id` / 식별자: `[busan-youth-day (${env})]`) |
| **프론트엔드 구조(②)** | 컴포넌트는 $UI = f(State)$ 순수 함수로 쓰고, 데이터 fetch·스트림·타이머 같은 부수효과는 Custom Hook 으로 뺀다(SRP). 새 변종은 기존 `if-else`·`switch` 를 고치지 않고 공통 인터페이스를 따르는 레지스트리에 등록한다(OCP). 같은 인터페이스를 따르는 컴포넌트는 서로 바꿔 끼울 수 있다(LSP). 컴포넌트에는 쓰는 props 만 좁게 넘기고 상태 객체째 넘기지 않는다(ISP). UI 는 I/O 클라이언트를 직접 만들거나 import 하지 않고 Props·Context·Hook 으로 받는다(DIP) |
| **스타일(②)** | 인라인 `style={{ }}` 0개. 3-Layer: `@layer base`(테마 토큰·CSS 변수) · `@layer components`(재사용 클래스) · `@layer utilities`(반응형 그리드·터치 타깃 44px 이상). 색·간격 값은 토큰으로만 쓴다 |
| **시크릿·보안(②)** | 토큰·키·비밀번호·접속 문자열은 코드·문서·주석·커밋·로그·이슈에 적지 않고 env·런타임에서만 받는다. remote URL 에 토큰을 박지 않는다. 노출됐으면 값을 지우는 데서 끝내지 않고 폐기·재발급한다 |
| **중복 처리(②)** | 같은 값(매직 넘버·색·URL·키·문구)이 둘 이상의 자리에 쓰이면 한 곳(상수·토큰·설정)에서 정의해 참조하고, 같은 설명·절차·목록이 둘 이상의 문서나 코드에 있으면 정본 한 곳만 두고 나머지는 그곳을 가리킨다. 환경마다 다른 값은 설정·env 로 받는다. 정본이 따로 있는 문서는 고쳐 쓰지 말고 폐기·stub·링크로 바꾼다 |
| **문서·주석(②)** | 문서는 최소로 쓰고 중복 금지 — 코드·IaC·spec·이슈·git 이 이미 든 내용은 다시 쓰지 않는다. 쓸 때는 지우면 다음 사람이 같은 실수를 하는 것만 남기고, 그 줄만 읽고 이해되게 짧게 쓴다. 주석엔 링크·이슈 번호를 두지 않고, 미룸은 `TODO: <관측되는 사건>이면 <무엇을 한다>` 한 꼴로만 적는다 |
| **Ansible 구조(②)** | 같은 값(주소·포트·경로)은 `group_vars`·inventory 변수 한 곳에서 정의해 참조하고 플레이북에 리터럴로 흩뿌리지 않는다. 시크릿은 평문으로 두지 않고 vault 또는 외부 조회로 받는다. `shell`·`command` 는 맞는 모듈이 없을 때만 쓰고, 재실행해도 같은 결과가 되게(멱등) 한다 |
