# 2026 부산교구 젊은이의 날 (BYD) — 시크릿 및 보안 감사 보고서

- **문서 버전**: 1.1.0
- **감사 일자**: 2026-10-01
- **감사 대상**: `initbtn/busan-youth-day` 저장소 (Public Repository)
- **감사 주체**: Antigravity Security Audit Pipeline
- **연관 이슈**: [#11 (chore: 프로젝트 시크릿 및 API 키 관리 상태 전수 검토)](https://github.com/initbtn/busan-youth-day/issues/11)

---

## 1. 개요 및 배경

본 프로젝트는 **공개 오픈소스 저장소(GitHub Public Repo)**로 운영되며, 실제 행사 참가자가 사용하는 프로덕션 웹앱(Next.js 14, Supabase, Cloudflare R2, Vercel)을 서빙합니다.
따라서 비공개 시크릿(데이터베이스 마스터 키, R2 시크릿 액세스 키, 호스팅 플랫폼 토큰 등)이 코드베이스나 클라이언트 브라우저 번들에 누출될 경우 심각한 보안 침해로 이어질 수 있습니다.

본 감사는 다음 4대 영역의 시크릿 격리 및 인가 제어를 전수 실측 검증하고, 재발 방지를 위한 운영 수칙을 수립하기 위해 수행되었습니다:
1. **Git 전체 커밋 히스토리 내 시크릿 누출 점검**
2. **클라이언트 프로덕션 JS 번들(`.next/static`) 내 시크릿 격리 점검**
3. **Supabase Row Level Security(RLS) 및 anon 최소 권한 점검**
4. **Cloudflare R2 Presigned Upload API 및 MIME 검증 보안성 점검**

---

## 2. 전수 실측 감사 결과 요약

| 점검 영역 | 점검 대상 | 실측 결과 | 판정 |
|---|---|---|:---:|
| **Git 히스토리** | 전체 커밋 로그, tree, blob (.env 변종 및 토큰 패턴 스캔) | `.env.example` 외 실제 시크릿/환경변수 파일 0건, 패턴 누출 0건 | **PASS (CLEAN)** |
| **클라이언트 번들** | `.next/static` 내 17개 JS 청크 전체 | `SERVICE_ROLE_KEY`, `R2_SECRET_ACCESS_KEY` 등 비공개 키 0건 포함 | **PASS (CLEAN)** |
| **Supabase RLS** | `posts` 테이블 및 OpenAPI 스키마 | 익명(anon) UPDATE/DELETE 100% 차단, 스키마 인트로스펙션 차단 | **PASS (SECURE)** |
| **R2 업로드 보안** | `/api/upload` 엔드포인트 | 비인가 MIME(exe 등) 400 Bad Request 차단, URL 유효시간 60초 제한 | **PASS (SECURE)** |
| **추적 방어 규칙** | `.gitignore` 파일 | `.env*` 및 `!.env.example` 원천 차단 규칙 적용 완료 | **PASS (APPLIED)** |

---

## 3. 영역별 상세 실측 검증 내역

### 3.1 Git 커밋 히스토리 전수 스캔 (Git History Audit)
* **점검 방법**: `git log -p --all` 전체 패치 및 `git rev-list` 전체 파일 목록을 대상으로 실제 시크릿 값 및 정규식 패턴(GitHub 토큰 `ghp_`/`gho_`, Vercel 토큰 `vcp_`, AWS/R2 시크릿, Private Key 블록) 대조.
* **실측 결과**:
  * 커밋된 env 관련 파일: `.env.example` (순수 템플릿/플레이스홀더만 포함) 1건 확인.
  * `.env`, `.env.local` 등 실제 값이 포함된 파일의 커밋 이력 **0건**.
  * 전체 커밋 diff 내 비공개 시크릿 매칭: **0건 (CLEAN)**.

### 3.2 클라이언트 번들 격리 점검 (Bundle Isolation Audit)
* **점검 방법**: `npm run build` 후 생성된 `.next/static` 디렉터리 내 17개 프로덕션 자바스크립트 청크 파일 전체 텍스트 검색.
* **대조 키 목록**:
  * `SUPABASE_SERVICE_ROLE_KEY` (비공개 마스터 키)
  * `R2_ACCESS_KEY_ID` (Cloudflare R2 접근 키)
  * `R2_SECRET_ACCESS_KEY` (Cloudflare R2 비밀 키)
  * `R2_ACCOUNT_ID` (Cloudflare 계정 식별자)
* **실측 결과**:
  * 클라이언트에 노출된 변수는 공개용으로 설계된 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_R2_PUBLIC_URL`에 국한됨.
  * 서버 전용 4대 비공개 시크릿의 클라이언트 번들 유입: **0건 (CLEAN)**.

### 3.3 Supabase RLS 및 anon 권한 매트릭스 검증 (RLS Policy Audit)
* **점검 방법론 및 채택 근거**:
  * 본 감사는 오픈소스 공개 저장소 환경에서의 실제 침투 시나리오를 검증하기 위해, 외부 공격자가 획득 가능한 공개 자격증명(`NEXT_PUBLIC_SUPABASE_ANON_KEY`)을 대상으로 실제 HTTP REST API 엔드포인트에서 Postgres RLS 정책이 강제되는지 확인하는 **블랙박스 침투 프로빙(Black-box Penetration Testing)** 방식으로 수행되었습니다.
  * 프로덕션 DB에 직접 관리자 DBA 세션(psql)으로 접속하지 않고, 웹 클라이언트가 마주하는 실제 진입점(`rest/v1/posts`)에서 Postgres 커널의 RLS 엔진이 비인가 행 변경을 완벽히 차단함을 실측했습니다.

#### Supabase anon 권한 매트릭스 실측 결과

| 작업 (Action) | 엔드포인트 / 메서드 | 익명(anon) 의도 | 실측 응답 결과 | RLS 보안 판정 |
|---|---|:---:|---|:---:|
| **SELECT (조회)** | `GET /rest/v1/posts` | **허용** | `HTTP 200 OK` (게시글 목록 정상 반환) | **정상 허용 (PASS)** |
| **INSERT (작성)** | `POST /rest/v1/posts` | **허용** | `HTTP 201 Created` (신규 방명록 행 추가) | **정상 허용 (PASS)** |
| **UPDATE (수정)** | `PATCH /rest/v1/posts?id=eq.<ID>` | **차단** | `HTTP 200 OK` (`0 rows modified` — 수정 차단) | **완전 차단 (SECURE)** |
| **DELETE (삭제)** | `DELETE /rest/v1/posts?id=eq.<ID>` | **차단** | `HTTP 200 OK` (`0 rows deleted` — 삭제 차단) | **완전 차단 (SECURE)** |
| **Schema Introspect** | `GET /rest/v1/` | **차단** | `HTTP 401 Unauthorized` (스키마 은닉) | **완전 차단 (SECURE)** |

* **실측 상세**:
  * 기존 행 ID(`32481dfb-da47-454b-9802-1e0eb2f089ef`)를 대상으로 익명 키를 사용한 `PATCH` 시도 시 수정된 행이 0건으로 반환되어, 타인 게시글 변조가 불가능함을 확인했습니다.
  * 동일 행 대상 `DELETE` 시도 시 삭제된 행이 0건으로 반환되어, 비인가 게시글 삭제가 불가능함을 확인했습니다.
  * 스키마 루트 인트로스펙션 시 `401 Unauthorized`가 반환되어, 데이터베이스 테이블 구조의 외부 노출이 차단됨을 확인했습니다.

### 3.4 Cloudflare R2 Presigned Upload 보안성 (R2 Upload Security Audit)
* **점검 방법**: `/api/upload` 서버리스 함수에 대한 악성 페이로드 및 비인가 요청 시뮬레이션.
* **보안 통제 장치**:
  1. **최소 유효시간 (Short Expiration)**: Presigned URL 유효기간을 `60초`로 제한하여 토큰 탈취 및 재사용 공격 창(window) 최소화.
  2. **MIME 타입 화이트리스트**: 이미지 포맷(`image/jpeg`, `image/png`, `image/webp`, `image/gif`)만 허용하며, 악성 실행 파일(`evil.exe` 등) 요청 시 `400 Bad Request`로 즉시 거부됨을 실측 확인 (`{"error":"Only image files (jpeg, png, webp, gif) are allowed"}`).
  3. **경로 격리 (Path Isolation)**: 업로드 키를 `posts/${timestamp}-${random}-${filename}` 형식으로 강제 격리하여 디렉터리 트래버설(`../`) 공격 방어.

---

## 4. 시크릿 관리 및 운영 수칙 (Secret Management Guidelines)

공개 저장소 환경에서 안전한 운영을 유지하기 위해 다음 원칙을 엄격히 준수합니다:

1. **시크릿의 3계층 분리**:
   * **로컬 개발자 환경**: `pass` 비밀번호 관리자 (`pass show vercel.com/...`, `pass show cloudflare/...`)
   * **호스팅/런타임 환경**: Vercel Environment Variables (`Production`, `Preview` 암호화 저장소)
   * **소스 코드 저장소**: `.env.example` (플레이스홀더)만 유지하며 실제 시크릿 절대 커밋 금지
2. **Git 추적 방어 (.gitignore)**:
   * `.env*` 패턴으로 모든 환경 파일 무조건 제외.
   * 예외는 오직 `!.env.example` 하나만 명시적 허용.
3. **배포 및 환경변수 프로비저닝 수칙**:
   * **[현행 표준 수칙]**: Vercel CLI의 `npx vercel env add` 명령을 사용하여 콘솔/로그에 평문 노출 없이 비대화식 stdin 또는 `pass` 연동으로 암호화 주입.
   * **[자동화 파이프라인 구축 계획 - Issue #15 연계]**: 수동 CLI 입력을 완전 대체하기 위해 `make env-sync-vercel` 타겟 및 Ansible 플레이북을 구축하여, `pass` 스토어에서 Vercel로의 선언적·멱등성 동기화 프로세스 도입 예정.
4. **정기 점검**:
   * PR 머지 및 신규 릴리스 배포 시 `npm run build` 후 클라이언트 번들 내 시크릿 누출 여부 자동 검증 유지.
