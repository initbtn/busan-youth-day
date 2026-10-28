# 2026-10-29 Supabase 마이그레이션 관리 체계 도입 및 단일 정본 확립

- **상태**: Accepted (결정됨)
- **날짜**: 2026-10-29
- **결정자**: 사용자(PO), Antigravity
- **연관 이슈**: [#91](https://github.com/initbtn/busan-youth-day/issues/91)

---

## 컨텍스트 및 문제 제기

기존에는 `supabase/schema.sql` 단일 파일만 관리되어 스키마 변경 이력이 버전으로 남지 않았고, 무엇이 운영 DB에 실제 반영되었는지 추적하기 어려웠다 (#84 `posts.media_urls` 컬럼 누락 및 수동 적용 사례).

또한 `CREATE TABLE IF NOT EXISTS` 구문은 이미 존재하는 테이블에 신규 컬럼이나 정책을 추가하지 못하므로, 기존 운영 데이터베이스에 변경사항을 멱등하고 안전하게 적용할 수 있는 표준화된 마이그레이션 체계와 적용 런북이 요구되었다.

---

## 결정

1. **단일 정본 (Single Source of Truth) 확립**:
   - `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql` 타임스탬프 마이그레이션 파일을 데이터베이스 스키마 정의 및 변경의 유일한 단일 정본으로 선언한다.
   - 초기 운영 DB 스키마(5개 기본 테이블: `profiles`, `booths`, `stamps`, `posts`, `reward_entries`)를 첫 기준선 파일(`20261005000000_baseline_schema.sql`)로 동결한다.

2. **기존 `schema.sql`의 역할 정의**:
   - `supabase/schema.sql`은 폐기하지 않고, 전체 스키마 일괄 참조 및 로컬 빠른 초기화용 합본 파일(Consolidated Reference)로 유지한다.
   - 개별 스키마 변경 시 `schema.sql`을 직접 수정하여 운영에 반영하지 않으며, 반드시 `migrations/`에 새 마이그레이션 파일을 추가한다.

3. **운영 적용 거버넌스 준수**:
   - 운영 DB 적용은 `docs/operations/supabase-migration.md` 런북에 따라 사전 점검, 사람 승인 게이트, 사후 검증 절차를 거친다.

---

## 결과 및 트레이드오프

### 얻는 것 (Pros)
- **명확한 변경 이력**: 언제 어떤 DDL이 추가되었는지 Git 히스토리 및 타임스탬프로 완벽히 추적된다.
- **재현 가능하고 멱등한 배포**: 환경별(Local, Preview, Production)로 마이그레이션을 순차 적용할 수 있다.
- **운영 스키마 드리프트 예방**: 사전/사후 쿼리 점검 및 사람 승인 게이트를 통해 의도치 않은 DDL 오류를 차단한다.

### 감수하는 것 (Cons / Trade-offs)
- 스키마 변경 작업마다 타임스탬프 파일 생성 및 관리 비용이 발생한다.
- `migrations/`가 정본이므로 `schema.sql` 합본 파일과의 관계를 인지하고 유지해야 한다.
