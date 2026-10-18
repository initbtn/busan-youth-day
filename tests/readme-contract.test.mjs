import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("프로젝트 엔지니어링 README 정본 계약 검증 (Issue #103)", () => {
  const readmePath = path.resolve("README.md");

  test("DoD 1: README.md 필수 엔지니어링 섹션 및 벤치마킹 구조 검증", () => {
    assert.ok(fs.existsSync(readmePath), "README.md 파일이 존재해야 합니다.");
    const content = fs.readFileSync(readmePath, "utf-8");

    // 배지
    assert.match(content, /CI Pipeline/, "CI Pipeline 배지가 포함되어야 합니다.");
    assert.match(content, /Next\.js/, "Next.js 배지가 포함되어야 합니다.");
    assert.match(content, /Supabase/, "Supabase 배지가 포함되어야 합니다.");
    assert.match(content, /Vercel/, "Vercel 배지가 포함되어야 합니다.");

    // 주요 섹션
    assert.match(content, /## 1\. 프로젝트 개요 \(Overview\)/, "1. 프로젝트 개요 섹션이 존재해야 합니다.");
    assert.match(content, /## 2\. 클라우드-서버리스 아키텍처 \(Architecture\)/, "2. 아키텍처 섹션이 존재해야 합니다.");
    assert.match(content, /```mermaid[\s\S]*?flowchart TD/, "Mermaid 아키텍처 다이어그램이 포함되어야 합니다.");
    assert.match(content, /## 3\. 5대 핵심 도메인 기능 \(Core Features\)/, "3. 핵심 기능 섹션이 존재해야 합니다.");
    assert.match(content, /## 4\. 디자인 시스템 & 모바일 UX 규율/, "4. 디자인 시스템 섹션이 존재해야 합니다.");
    assert.match(content, /## 5\. 기술 스택 \(Tech Stack\)/, "5. 기술 스택 섹션이 존재해야 합니다.");
    assert.match(content, /## 6\. 시작하기 \(Getting Started\)/, "6. 시작하기 섹션이 존재해야 합니다.");
    assert.match(content, /## 7\. 프로젝트 거버넌스/, "7. 거버넌스 섹션이 존재해야 합니다.");

    // 프로덕션 링크
    assert.match(content, /https:\/\/busan-youth-day\.vercel\.app/, "프로덕션 배포 URL이 명시되어야 합니다.");
  });
});
