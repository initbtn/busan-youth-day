# 2026 부산교구 젊은이의 날 (BYD) — 환경변수 프로비저닝 운영 가이드

- **문서 버전**: 1.1.0
- **작성 일자**: 2026-10-01
- **적용 대상**: `initbtn/busan-youth-day`
- **연관 이슈**: [#15 (chore: Ansible 및 Makefile 기반 Vercel 환경변수 자동 프로비저닝 프로세스 구축)](https://github.com/initbtn/busan-youth-day/issues/15)

---

## 1. 개요 및 배경

본 문서는 `busan-youth-day` 프로젝트의 외부 서비스(Supabase, Cloudflare R2, Vercel) 환경변수 및 민감 시크릿을 **수동 콘솔 조작 없이, 코드형 인프라(Ansible)와 표준 Makefile 인터페이스를 통해 안전하고 멱등성(Idempotency) 있게 프로비저닝하는 절차**를 정의합니다.

### 핵심 목표
1. **멱등성 및 선언적 관리**: 반복 실행하더라도 동일한 환경변수 상태가 보장됨 (`--force --yes`).
2. **Fail-Fast 무결성**: 8대 필수 환경변수 중 하나라도 누락 시 조기 중단(Fail-Fast)하여 불완전 배포를 원천 차단.
3. **시크릿 평문 노출 방지**: 비밀번호 관리자(`pass`) 연동 및 Ansible `no_log: true` 정책으로 터미널 콘솔/로그에 평문 노출 차단.
4. **단일 명령 인터페이스**: 복잡한 CLI 인자 조립 없이 `make env-sync-vercel`, `make env-check`, `make env-pull` 단일 타겟으로 실행.

---

## 2. 동기화 대상 8대 환경변수 스펙 매트릭스

Next.js 클라이언트 노출 여부 및 Vercel 저장소 유형에 따라 엄격히 분리 관리됩니다:

| 환경변수 키 | 분류 | Vercel Type | 적용 환경 | 설명 |
|---|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | `config` | Prod, Prev, Dev | Supabase 원격 프로젝트 REST API 엔드포인트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 | `config` | Prod, Prev, Dev | 브라우저 클라이언트용 anon 공개 인증 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **비공개** | `secret` | Prod, Prev, Dev | DB 관리자 마스터 키 (클라이언트 번들 격리 필수) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | 공개 | `config` | Prod, Prev, Dev | Cloudflare R2 퍼블릭 CDN 도메인 (`r2.dev`) |
| `R2_ACCOUNT_ID` | **비공개** | `secret` | Prod, Prev, Dev | Cloudflare 계정 식별자 |
| `R2_ACCESS_KEY_ID` | **비공개** | `secret` | Prod, Prev, Dev | R2 S3 호환 API 접근 키 |
| `R2_SECRET_ACCESS_KEY` | **비공개** | `secret` | Prod, Prev, Dev | R2 S3 호환 API 비밀 키 |
| `R2_BUCKET_NAME` | **비공개** | `secret` | Prod, Prev, Dev | R2 오브젝트 버킷 명 (`busan-youth-day`) |

---

## 3. 사전 요구사항

동기화 타겟을 실행하기 위해 로컬 머신에 다음 도구 및 자격증명이 준비되어 있어야 합니다:

1. **Ansible**: `ansible [core 2.16+]` (`sudo apt install ansible`)
2. **GNU Make**: `make 4.x+`
3. **Vercel CLI**: `npx vercel` (Node.js 20+ 환경)
4. **시크릿 스토어 (`pass`) 워밍**:
   * Vercel 인증 토큰: `pass show vercel.com/token-jsconn`
   * 토큰 권한: Team scope `jsconn` 접근 권한 포함

---

## 4. Makefile 명령어 가이드

프로젝트 루트에서 다음 명령어로 환경변수 라이프사이클을 관리합니다:

### 4.1 환경변수 상태 점검 (`make env-check`)
현재 Vercel 클라우드(Scope: `jsconn`)에 등록된 환경변수 목록과 유형(`Config` vs `Secret`), 등록 시점을 실시간 조회합니다:
```bash
make env-check
```
* **사전 검증**: `pass show vercel.com/token-jsconn` 조회가 실패할 경우, 즉시 명확한 오류 메시지와 함께 비영(Non-zero) 종료 코드로 차단됩니다.

### 4.2 Vercel 환경변수 일괄 멱등성 동기화 (`make env-sync-vercel`)
로컬 `.env.local` 및 `pass`의 자격증명을 읽어 Vercel 프로덕션/프리뷰/개발 환경에 선언적으로 주입합니다:
```bash
make env-sync-vercel
```
* **동작 원리**:
  1. `pass show vercel.com/token-jsconn`에서 Vercel 토큰을 메모리에 로드.
  2. 로컬 `.env.local`에서 8대 키 값을 파싱 (모두 `no_log: true`로 마스킹).
  3. **Fail-Fast 검증**: 8대 필수 키 중 하나라도 `.env.local`에 누락되어 있으면 `ansible.builtin.fail`로 즉시 중단.
  4. `npx vercel env add`를 비대화식(`--yes --force`)으로 실행하여 선언적 주입.
  5. 동기화 완료 후 실제 반영/갱신된 건수를 정밀 집계하여 요약 출력.

### 4.3 Vercel 환경변수 로컬 동기화 (`make env-pull`)
Vercel에 등록된 최신 개발 환경변수를 로컬 `.env.local`로 다운로드합니다 (기존 파일은 `.env.local.bak`로 자동 백업):
```bash
make env-pull
```
* **보안 및 에러 방어**: 사전 Vercel 토큰 검증 가드가 적용되어 있으며, 기존 파일 덮어쓰기 전 백업을 강제합니다.

---

## 5. 보안 및 안전 통제 규율

1. **로그 마스킹 (`no_log: true`)**:
   Ansible 플레이북의 토큰 조회, 파일 파싱, CLI 실행 등 모든 민감 태스크에는 `no_log: true`가 선언되어 있어 CI/CD 로그나 터미널 출력에 시크릿이 절대 평문으로 노출되지 않습니다.
2. **Git 추적 방어**:
   동기화 원천 파일인 `.env.local` 및 백업본(`.env.local.bak`)은 프로젝트 루트의 [`.gitignore`](../../.gitignore)에 의해 Git 추적이 원천 차단됩니다.
3. **재배포 연계**:
   Vercel 프로덕션 환경변수가 추가/수정된 후에는, 런타임 서버리스 함수에 환경변수가 주입되도록 프로덕션 재배포(`npx vercel --prod` 또는 `change-flow ⑩`)를 실행해야 합니다.
