import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Supabase 마이그레이션 단일 정본 및 운영 런북 검증 (Issue #91, #116)", () => {
  const migrationsDir = path.resolve("supabase/migrations");
  const baselineSqlPath = path.join(migrationsDir, "20261005000000_baseline_schema.sql");
  const commentsSqlPath = path.join(migrationsDir, "20261029000000_add_comments_table.sql");
  const schemaSqlPath = path.resolve("supabase/schema.sql");
  const configTomlPath = path.resolve("supabase/config.toml");
  const runbookPath = path.resolve("docs/operations/supabase-migration.md");
  const adapterPath = path.resolve("change-flow-adapter.md");
  const adrPath = path.resolve("docs/architecture-decision-record/2026-10-29-supabase-migration-management.md");

  test("DoD 1: supabase/migrations 내 기준선 및 댓글 마이그레이션 파일 무결성 검증", () => {
    assert.ok(fs.existsSync(migrationsDir), "supabase/migrations 디렉터리가 존재해야 합니다.");
    assert.ok(fs.existsSync(baselineSqlPath), "초기 기준선 마이그레이션 파일이 존재해야 합니다.");
    assert.ok(fs.existsSync(commentsSqlPath), "댓글 추가 마이그레이션 파일이 존재해야 합니다.");

    const baselineSql = fs.readFileSync(baselineSqlPath, "utf-8");
    const commentsSql = fs.readFileSync(commentsSqlPath, "utf-8");

    // 기준선 테이블 5개 정의 검증
    assert.match(baselineSql, /CREATE TABLE IF NOT EXISTS public\.profiles/);
    assert.match(baselineSql, /CREATE TABLE IF NOT EXISTS public\.booths/);
    assert.match(baselineSql, /CREATE TABLE IF NOT EXISTS public\.stamps/);
    assert.match(baselineSql, /CREATE TABLE IF NOT EXISTS public\.posts/);
    assert.match(baselineSql, /CREATE TABLE IF NOT EXISTS public\.reward_entries/);
    assert.match(baselineSql, /ALTER TABLE public\.posts\s+ADD COLUMN IF NOT EXISTS media_urls/);

    // RLS 활성화 검증
    assert.match(baselineSql, /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY;/);
    assert.match(baselineSql, /ALTER TABLE public\.booths ENABLE ROW LEVEL SECURITY;/);
    assert.match(baselineSql, /ALTER TABLE public\.stamps ENABLE ROW LEVEL SECURITY;/);
    assert.match(baselineSql, /ALTER TABLE public\.posts ENABLE ROW LEVEL SECURITY;/);
    assert.match(baselineSql, /ALTER TABLE public\.reward_entries ENABLE ROW LEVEL SECURITY;/);

    // 댓글 테이블 1개 정의 및 RLS/GRANT 검증 (Issue #116)
    assert.match(commentsSql, /CREATE TABLE IF NOT EXISTS public\.comments/);
    assert.match(commentsSql, /ALTER TABLE public\.comments ENABLE ROW LEVEL SECURITY;/);
    assert.match(commentsSql, /CREATE POLICY "Comments are viewable by everyone"/);
    assert.match(commentsSql, /CREATE POLICY "Anyone can create comments"/);
    assert.match(commentsSql, /CREATE POLICY "Users can delete their own comments"/);
    assert.match(commentsSql, /GRANT ALL ON public\.comments TO anon, authenticated, service_role;/);
  });

  test("DoD 2: 운영 적용 런북 (docs/operations/supabase-migration.md) 필수 단계 검증", () => {
    assert.ok(fs.existsSync(runbookPath), "supabase-migration.md 런북 문서가 존재해야 합니다.");
    const runbook = fs.readFileSync(runbookPath, "utf-8");

    // 핵심 원칙 및 정본 안내
    assert.match(runbook, /단일 정본 \(Single Source of Truth\)/);
    assert.match(runbook, /supabase\/migrations/);

    // 4대 필수 단계
    assert.match(runbook, /사전 상태 점검 \(Pre-Migration Query\)/);
    assert.match(runbook, /사람 승인 게이트 \(Human Approval Gate\)/);
    assert.match(runbook, /마이그레이션 실행 \(Migration Execution\)/);
    assert.match(runbook, /사후 상태 검증 \(Post-Migration Verification\)/);

    // 대상 프로젝트 특정
    assert.match(runbook, /NEXT_PUBLIC_SUPABASE_URL/);
    assert.match(runbook, /PROJECT_REF/);
  });

  test("DoD 3: 어댑터 및 schema.sql 단일 정본 배선 및 ADR 검증", () => {
    assert.ok(fs.existsSync(adapterPath), "change-flow-adapter.md 파일이 존재해야 합니다.");
    const adapter = fs.readFileSync(adapterPath, "utf-8");
    assert.match(adapter, /\*\*DB 마이그레이션\(②\)\*\*/);
    assert.match(adapter, /supabase\/migrations\/` 단일 정본/);
    assert.match(adapter, /docs\/operations\/supabase-migration\.md/);

    assert.ok(fs.existsSync(schemaSqlPath), "supabase/schema.sql 파일이 존재해야 합니다.");
    const schemaSql = fs.readFileSync(schemaSqlPath, "utf-8");
    assert.match(schemaSql, /단일 정본\(Single Source of Truth\) 안내/);
    assert.match(schemaSql, /supabase\/migrations\//);

    // 공식 결정 기록(ADR) 검증
    assert.ok(fs.existsSync(adrPath), "마이그레이션 관리 체계 ADR 문서가 존재해야 합니다.");
    const adr = fs.readFileSync(adrPath, "utf-8");
    assert.match(adr, /Accepted \(결정됨\)/);
    assert.match(adr, /단일 정본 \(Single Source of Truth\) 확립/);
  });

  test("DoD 4: supabase/config.toml 설정 파일 검증", () => {
    assert.ok(fs.existsSync(configTomlPath), "supabase/config.toml 파일이 존재해야 합니다.");
    const configToml = fs.readFileSync(configTomlPath, "utf-8");
    assert.match(configToml, /project_id = "busan-youth-day"/);
    assert.match(configToml, /\[api\]/);
    assert.match(configToml, /\[db\]/);
  });
});
