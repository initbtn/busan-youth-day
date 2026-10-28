# 2026 부산교구 젊은이의 날 (BYD) — Supabase 데이터베이스 마이그레이션 운영 런북

- **문서 버전**: 1.0.0
- **작성 일자**: 2026-10-28
- **적용 대상**: `initbtn/busan-youth-day`
- **연관 이슈**: [#91 (chore(db): Supabase 마이그레이션 관리 도입)](https://github.com/initbtn/busan-youth-day/issues/91)

---

## 1. 개요 및 원칙

본 문서는 `busan-youth-day` 프로젝트의 데이터베이스(PostgreSQL / Supabase) 스키마 변경을 안전하게 관리하고, 개발 환경 및 운영 DB에 멱등하게 적용하기 위한 표준 운영 런북입니다.

### 핵심 원칙
1. **단일 정본 (Single Source of Truth)**: 모든 스키마 변경은 `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql` 타임스탬프 파일로 관리하며, `supabase/schema.sql`은 합본 참조용으로만 유지합니다.
2. **사전/사후 조회 필수**: 적용 전 운영 스키마 상태(테이블, 컬럼, RLS, 정책)를 읽기 전용으로 조회하고, 적용 후 정확히 기대한 변경만 반영되었는지 대조합니다.
3. **인간 승인 게이트**: 데이터 유실 가능성(`DROP`, `ALTER ... DROP COLUMN` 등)이나 운영 DB 쓰기는 사람의 명시적 승인 하에 실행합니다.
4. **시크릿 보호**: DB 자격증명 및 API 토큰은 평문 파일이나 로그에 남기지 않고, 보안 스토어(`pass`)를 통해 동적으로 로드합니다.

---

## 2. 마이그레이션 파일 명명 및 저장소 구조

```
supabase/
├── config.toml                     # Supabase CLI 프로젝트 설정 (project_id: busan-youth-day)
├── schema.sql                      # 통합 참조용 전체 합본 스키마 (읽기 전용 참조)
└── migrations/                     # [단일 정본] 마이그레이션 이력
    ├── 20261005000000_baseline_schema.sql      # 초기 운영 DB 기준선 스키마 (기본 5개 테이블)
    └── 20261029000000_add_comments_table.sql   # 댓글 저장소 테이블 (Issue #89, #116)
```

- 파일명 형식: `<YYYYMMDDHHMMSS>_<작업내용_스네이크케이스>.sql`
- 모든 DDL은 가급적 `IF NOT EXISTS` 및 트랜잭션 안전성을 고려하여 작성합니다.

---

## 3. 대상 프로젝트 특정 (Target Project Identification)

운영 및 스테이징 프로젝트는 다음 환경변수와 식별자로 특정합니다:

1. **Supabase 프로젝트 URL**:
   - Vercel 프로덕션 환경변수: `NEXT_PUBLIC_SUPABASE_URL`
   - 형식: `https://<project-ref>.supabase.co`
2. **프로젝트 Ref 추출**:
   ```bash
   SUPABASE_URL="$(pass show vercel.com/supabase-url 2>/dev/null || grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)"
   PROJECT_REF="$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')"
   echo "Target Project Ref: ${PROJECT_REF}"
   ```
3. **프로젝트 접근 자격증명**:
   - Supabase Access Token: `pass show supabase/access-token`
   - Database Connection String: `pass show supabase/db-url`

---

## 4. 운영 적용 단계별 절차 (Step-by-Step Runbook)

### [1단계] 사전 상태 점검 (Pre-Migration Query)
마이그레이션 적용 전, 현재 DB의 테이블 및 정책 상태를 확인합니다.

```sql
-- 현재 public 스키마 내 테이블 목록 및 RLS 활성화 여부 확인
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 정책 목록 확인
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

### [2단계] 사람 승인 게이트 (Human Approval Gate)
- 변경 대상 SQL 스크립트의 diff 확인
- 비가역적 파괴 연산(`DROP`, `CASCADE`, `ALTER TYPE` 등) 포함 여부 점검
- 담당 엔지니어/운영자의 실행 승인 확인

### [3단계] 마이그레이션 실행 (Migration Execution)

#### 방법 A: Supabase Management API를 통한 원격 쿼리 실행
```bash
PROJECT_REF="<project-ref>"
SUPABASE_TOKEN="$(pass show supabase/access-token | head -n 1)"
SQL_FILE="supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql"

curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/query" \
  -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(jq -Rs . < "$SQL_FILE")}"
```

#### 방법 B: Supabase CLI를 통한 DB Push (CLI 워밍 환경)
```bash
# 로컬 CLI 로그인 및 링크
npx supabase link --project-ref "$PROJECT_REF"
npx supabase db push
```

### [4단계] 사후 상태 검증 (Post-Migration Verification)
마이그레이션 실행 후 새로 추가/변경된 테이블 및 컬럼, 인덱스, RLS 정책이 정상 생성되었는지 검증합니다.

```sql
-- 신규 테이블/컬럼 존재 검증 (예: <target_table>)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = '<target_table>'
ORDER BY ordinal_position;

-- RLS 정책 정상 등록 검증
SELECT 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public' AND table_name = '<target_table>';
```

---

## 5. 롤백 및 비상 복구 절차

1. **DDL 오류 발생 시**:
   - Supabase Management API는 트랜잭션 단위로 쿼리를 실행하므로 문법 오류 발생 시 자동 롤백됩니다.
2. **스키마 복원**:
   - 비가역적 스키마 손상이 발생한 경우, Supabase 관리 콘솔의 일일 백업(Point-in-Time Recovery)을 활용해 특정 시점으로 복원합니다.
   - 복원 절차 수행 전 반드시 사용자 세션에 다운타임 공지를 게시합니다.
