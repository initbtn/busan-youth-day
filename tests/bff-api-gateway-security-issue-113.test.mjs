import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Next.js API 게이트웨이(BFF) 보안 및 스토리지 직접 쓰기 격리 검증 (Issue #113)", () => {
  const postsRoutePath = path.resolve("src/app/api/posts/route.ts");
  const postsIdRoutePath = path.resolve("src/app/api/posts/[id]/route.ts");
  const commentsRoutePath = path.resolve("src/app/api/comments/route.ts");
  const uploadRoutePath = path.resolve("src/app/api/upload/route.ts");
  const r2LibPath = path.resolve("src/lib/r2.ts");
  const communityPostsLibPath = path.resolve("src/lib/communityPosts.ts");
  const feedViewPath = path.resolve("src/components/CommunityFeedView.tsx");
  const profileViewPath = path.resolve("src/components/MyProfileView.tsx");

  test("DoD 1: /api/posts 및 /api/comments 서버 API 게이트웨이 라우트 파일 및 핸들러 실재 검증", () => {
    assert.ok(fs.existsSync(postsRoutePath), "src/app/api/posts/route.ts 파일이 존재해야 합니다.");
    assert.ok(fs.existsSync(postsIdRoutePath), "src/app/api/posts/[id]/route.ts 파일이 존재해야 합니다.");
    assert.ok(fs.existsSync(commentsRoutePath), "src/app/api/comments/route.ts 파일이 존재해야 합니다.");

    const postsContent = fs.readFileSync(postsRoutePath, "utf-8");
    const postsIdContent = fs.readFileSync(postsIdRoutePath, "utf-8");
    const commentsContent = fs.readFileSync(commentsRoutePath, "utf-8");

    // posts GET 및 POST 핸들러
    assert.match(postsContent, /export\s+async\s+function\s+GET/, "/api/posts 에 GET 핸들러가 존재해야 합니다.");
    assert.match(postsContent, /export\s+async\s+function\s+POST/, "/api/posts 에 POST 핸들러가 존재해야 합니다.");
    assert.match(postsContent, /from\(["']posts["']\)/, "서버에서 posts 테이블에 쿼리해야 합니다.");

    // posts/[id] PATCH 및 DELETE 핸들러
    assert.match(postsIdContent, /export\s+async\s+function\s+PATCH/, "/api/posts/[id] 에 PATCH 핸들러가 존재해야 합니다.");
    assert.match(postsIdContent, /export\s+async\s+function\s+DELETE/, "/api/posts/[id] 에 DELETE 핸들러가 존재해야 합니다.");

    // comments GET, POST, DELETE 핸들러
    assert.match(commentsContent, /export\s+async\s+function\s+GET/, "/api/comments 에 GET 핸들러가 존재해야 합니다.");
    assert.match(commentsContent, /export\s+async\s+function\s+POST/, "/api/comments 에 POST 핸들러가 존재해야 합니다.");
    assert.match(commentsContent, /export\s+async\s+function\s+DELETE/, "/api/comments 에 DELETE 핸들러가 존재해야 합니다.");
  });

  test("DoD 2: /api/upload 가 multipart/form-data 를 수신하여 백엔드 R2 SDK(uploadBufferToR2)로 업로드하고 클라이언트 R2 직접 쓰기 제거", () => {
    assert.ok(fs.existsSync(uploadRoutePath), "upload/route.ts 파일이 존재해야 합니다.");
    const uploadContent = fs.readFileSync(uploadRoutePath, "utf-8");
    const r2Content = fs.readFileSync(r2LibPath, "utf-8");
    const feedContent = fs.readFileSync(feedViewPath, "utf-8");

    // upload/route.ts 에서 multipart 및 uploadBufferToR2 호출 검증
    assert.match(uploadContent, /multipart\/form-data/, "upload route가 multipart/form-data를 처리해야 합니다.");
    assert.match(uploadContent, /uploadBufferToR2/, "서버 내부에서 uploadBufferToR2를 호출하여 R2로 업로드해야 합니다.");

    // r2.ts 에서 uploadBufferToR2 선언 및 PutObjectCommand Body 전달 검증
    assert.match(r2Content, /export\s+async\s+function\s+uploadBufferToR2/, "r2.ts에 uploadBufferToR2 함수가 선언되어야 합니다.");
    assert.match(r2Content, /Body:\s*buffer/, "PutObjectCommand에 Body로 바이너리 버퍼를 전달해야 합니다.");

    // CommunityFeedView.tsx 에서 R2 Presigned PUT 직접 호출 제거 검증
    assert.doesNotMatch(feedContent, /fetch\(\s*uploadUrl\s*,\s*\{\s*method:\s*["']PUT["']/, "클라이언트에서 R2 Presigned URL로 직접 PUT하는 코드가 제거되어야 합니다.");
  });

  test("DoD 3: 클라이언트 컴포넌트(CommunityFeedView, MyProfileView)에서 createClient 직접 호출 및 Supabase 직접 접근 제거", () => {
    const feedContent = fs.readFileSync(feedViewPath, "utf-8");
    const profileContent = fs.readFileSync(profileViewPath, "utf-8");

    // CommunityFeedView 검증
    assert.doesNotMatch(feedContent, /import\s*\{\s*createClient\s*\}\s*from\s*["']@\/lib\/supabase\/client["']/, "피드 뷰에서 @/lib/supabase/client import가 제거되어야 합니다.");
    assert.doesNotMatch(feedContent, /createClient\(\)/, "피드 뷰에서 createClient() 직접 호출이 제거되어야 합니다.");

    // MyProfileView 검증
    assert.doesNotMatch(profileContent, /import\s*\{\s*createClient\s*\}\s*from\s*["']@\/lib\/supabase\/client["']/, "마이프로필에서 @/lib/supabase/client import가 제거되어야 합니다.");
    assert.doesNotMatch(profileContent, /createClient\(\)/, "마이프로필에서 createClient() 직접 호출이 제거되어야 합니다.");
  });

  test("DoD 4: src/lib/communityPosts.ts 에 BFF 게이트웨이 전용 호출 래퍼 함수들이 구현되어 있다", async () => {
    const communityPosts = await import("../src/lib/communityPosts.ts");

    assert.equal(typeof communityPosts.fetchPostsViaGateway, "function", "fetchPostsViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.syncPostViaGateway, "function", "syncPostViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.deletePostViaGateway, "function", "deletePostViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.updatePostViaGateway, "function", "updatePostViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.fetchCommentsViaGateway, "function", "fetchCommentsViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.syncCommentViaGateway, "function", "syncCommentViaGateway 함수가 존재해야 합니다.");
    assert.equal(typeof communityPosts.deleteCommentViaGateway, "function", "deleteCommentViaGateway 함수가 존재해야 합니다.");
  });
});
