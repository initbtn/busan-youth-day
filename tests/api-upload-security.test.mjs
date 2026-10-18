import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("업로드 API 인증 가드 및 파일 크기 제한 검증 (Issue #96)", () => {
  const uploadRoutePath = path.resolve("src/app/api/upload/route.ts");
  const r2LibPath = path.resolve("src/lib/r2.ts");
  const feedViewPath = path.resolve("src/components/CommunityFeedView.tsx");

  test("DoD 1: src/app/api/upload/route.ts 세션 인증 가드 검증 (미인증 시 401 차단)", () => {
    assert.ok(fs.existsSync(uploadRoutePath), "upload/route.ts 파일이 존재해야 합니다.");
    const content = fs.readFileSync(uploadRoutePath, "utf-8");

    // Supabase Auth 세션 조회 및 401 가드
    assert.match(
      content,
      /auth\.getUser\(\)|createServerClient/,
      "Supabase 세션 검증(auth.getUser 또는 createServerClient)이 구현되어야 합니다."
    );
    assert.match(
      content,
      /status:\s*401/,
      "미인증 요청에 대해 401 상태 코드를 반환해야 합니다."
    );
  });

  test("DoD 2: src/app/api/upload/route.ts 파일 크기(15MB) 상한 검증 (누락 또는 초과 시 400 차단)", () => {
    const content = fs.readFileSync(uploadRoutePath, "utf-8");

    // fileSize 또는 contentLength 유효성 검사
    assert.match(
      content,
      /fileSize|contentLength/,
      "요청 본문에서 fileSize(또는 contentLength)를 검증해야 합니다."
    );

    // 15MB 제한 (15 * 1024 * 1024 = 15728640 또는 15 * 1024 * 1024 계산식)
    assert.match(
      content,
      /15\s*\*\s*1024\s*\*\s*1024|15728640/,
      "최대 15MB 파일 크기 상한 가드가 적용되어야 합니다."
    );
  });

  test("DoD 3: src/lib/r2.ts PutObjectCommand에 ContentLength 서명 파라미터 강제 검증", () => {
    assert.ok(fs.existsSync(r2LibPath), "r2.ts 파일이 존재해야 합니다.");
    const content = fs.readFileSync(r2LibPath, "utf-8");

    // ContentLength가 PutObjectCommand 옵션에 포함되어야 함
    assert.match(
      content,
      /ContentLength/,
      "R2 서명 URL 발급 시 ContentLength가 PutObjectCommand에 포함되어야 합니다."
    );
  });

  test("DoD 4: src/components/CommunityFeedView.tsx 호출 시 fileSize 파라미터 전달 검증", () => {
    assert.ok(fs.existsSync(feedViewPath), "CommunityFeedView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // /api/upload 호출 본문에 fileSize가 포함되어야 함
    assert.match(
      content,
      /\/api\/upload[\s\S]*?fileSize/,
      "/api/upload 호출 시 fileSize 파라미터를 함께 전송해야 합니다."
    );
  });
});
