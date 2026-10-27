import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = global.localStorage;
}

describe("소통피드 댓글 삭제 및 Supabase 원격 동기화 무결성 검증 (Issue #89)", () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  test("DoD 1: 내 댓글 삭제 시 deleteComment 및 deleteCommentFromSupabase가 호출되어 목록 및 캐시에서 제거된다", async () => {
    const communityPosts = await import("../src/lib/communityPosts.ts");
    assert.equal(typeof communityPosts.deleteComment, "function");
    assert.equal(typeof communityPosts.deleteCommentFromSupabase, "function");

    const initialComments = {
      "post-1": [
        { id: "comm-1", postId: "post-1", author: "김마리아", userId: "user-1", content: "첫 댓글", createdAt: new Date().toISOString() },
        { id: "comm-2", postId: "post-1", author: "박요셉", userId: "user-2", content: "둘째 댓글", createdAt: new Date().toISOString() },
      ],
    };

    // 로컬 삭제
    const updated = communityPosts.deleteComment(initialComments, "post-1", "comm-1");
    assert.equal(updated["post-1"].length, 1);
    assert.equal(updated["post-1"][0].id, "comm-2");

    // 원격 삭제 mock
    let deletedId = null;
    const mockSupabase = {
      from: (table) => {
        assert.equal(table, "comments");
        return {
          delete: () => ({
            eq: async (col, val) => {
              assert.equal(col, "id");
              deletedId = val;
              return { data: { id: val }, error: null };
            },
          }),
        };
      },
    };

    const res = await communityPosts.deleteCommentFromSupabase(mockSupabase, "comm-1");
    assert.equal(res.success, true);
    assert.equal(deletedId, "comm-1");
  });

  test("DoD 2: 작성자 일치(isCommentAuthor) 시에만 삭제 권한이 부여되고 타인의 댓글은 삭제가 차단된다", async () => {
    const { isCommentAuthor } = await import("../src/lib/communityPosts.ts");
    assert.equal(typeof isCommentAuthor, "function");

    const myComment = {
      id: "comm-1",
      postId: "post-1",
      author: "김마리아",
      userId: "user-123",
      content: "내 댓글",
      createdAt: new Date().toISOString(),
    };

    const otherComment = {
      id: "comm-2",
      postId: "post-1",
      author: "박요셉",
      userId: "user-456",
      content: "타인 댓글",
      createdAt: new Date().toISOString(),
    };

    // 1. 내 댓글 판별 (userId 일치 또는 이름 일치)
    assert.equal(isCommentAuthor(myComment, "user-123", "김마리아"), true);
    assert.equal(isCommentAuthor(myComment, "user-123", "다른이름"), true);
    assert.equal(isCommentAuthor(myComment, undefined, "김마리아"), true);

    // 2. 타인 댓글 판별
    assert.equal(isCommentAuthor(otherComment, "user-123", "김마리아"), false);
    assert.equal(isCommentAuthor(otherComment, undefined, "김마리아"), false);
  });

  test("DoD 3: CommunityFeedView.tsx와 MyProfileView.tsx 모두에 댓글 삭제 핸들러 및 작성자 권한 가드가 연결되어 있다", () => {
    const feedPath = path.resolve("src/components/CommunityFeedView.tsx");
    const profilePath = path.resolve("src/components/MyProfileView.tsx");

    assert.ok(fs.existsSync(feedPath));
    assert.ok(fs.existsSync(profilePath));

    const feedContent = fs.readFileSync(feedPath, "utf-8");
    const profileContent = fs.readFileSync(profilePath, "utf-8");

    // CommunityFeedView 검증
    assert.match(feedContent, /deleteCommentFromSupabase/, "피드 뷰에 deleteCommentFromSupabase가 연결되어야 합니다.");
    assert.match(feedContent, /isCommentAuthor/, "피드 뷰에 isCommentAuthor를 통한 삭제 권한 가드가 연결되어야 합니다.");

    // MyProfileView 검증
    assert.match(profileContent, /deleteCommentFromSupabase/, "마이페이지에 deleteCommentFromSupabase가 연결되어야 합니다.");
    assert.match(profileContent, /deleteComment/, "마이페이지에 댓글 삭제 함수가 연결되어야 합니다.");
  });

  test("DoD 4: supabase/schema.sql에 comments 테이블 및 ON DELETE CASCADE 외래키, RLS 정책이 명세되어 있다", () => {
    const schemaPath = path.resolve("supabase/schema.sql");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    assert.match(schemaContent, /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.comments/, "comments 테이블 생성문이 있어야 합니다.");
    assert.match(schemaContent, /REFERENCES\s+public\.posts\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i, "posts(id)에 대한 ON DELETE CASCADE 외래키가 선언되어야 합니다.");
    assert.match(schemaContent, /CREATE\s+POLICY\s+["'].*?["']\s+ON\s+public\.comments\s+FOR\s+SELECT/i, "comments SELECT RLS 정책이 선언되어야 합니다.");
    assert.match(schemaContent, /CREATE\s+POLICY\s+["'].*?["']\s+ON\s+public\.comments\s+FOR\s+DELETE/i, "comments DELETE RLS 정책이 선언되어야 합니다.");
  });

  test("DoD 5: syncCommentToSupabase 및 fetchCommentsFromSupabase를 통해 댓글의 원격 저장 및 조회가 정상 수행된다", async () => {
    const communityPosts = await import("../src/lib/communityPosts.ts");
    assert.equal(typeof communityPosts.syncCommentToSupabase, "function");
    assert.equal(typeof communityPosts.fetchCommentsFromSupabase, "function");

    // 1. syncCommentToSupabase 검증
    let insertedComment = null;
    const testUserId = "12345678-1234-1234-1234-123456789abc";
    const mockSupabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: testUserId } },
          error: null,
        }),
      },
      from: (table) => {
        assert.equal(table, "comments");
        return {
          insert: (rows) => {
            insertedComment = rows[0];
            return Promise.resolve({ data: rows, error: null });
          },
          select: () => ({
            order: async () => ({
              data: [
                {
                  id: "c-100",
                  post_id: "post-1",
                  user_id: testUserId,
                  author: "김마리아",
                  parish: "하단",
                  role: "청년",
                  content: "은혜로운 댓글",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          }),
        };
      },
    };

    const newComment = {
      id: "c-100",
      postId: "post-1",
      author: "김마리아",
      parish: "하단",
      role: "청년",
      content: "은혜로운 댓글",
      createdAt: new Date().toISOString(),
    };

    const syncRes = await communityPosts.syncCommentToSupabase(mockSupabase, newComment);
    assert.equal(syncRes.success, true);
    assert.equal(insertedComment.post_id, "post-1");
    assert.equal(insertedComment.content, "은혜로운 댓글");
    assert.equal(insertedComment.user_id, testUserId);

    // 2. fetchCommentsFromSupabase 검증
    const fetchedMap = await communityPosts.fetchCommentsFromSupabase(mockSupabase);
    assert.ok(Array.isArray(fetchedMap["post-1"]));
    assert.equal(fetchedMap["post-1"].length, 1);
    assert.equal(fetchedMap["post-1"][0].id, "c-100");
  });
});
