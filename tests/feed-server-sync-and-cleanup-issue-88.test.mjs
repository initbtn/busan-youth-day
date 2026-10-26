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

describe("게시글 서버·로컬 상태 불일치 정리 및 동기화 무결성 검증 (Issue #88)", () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  test("DoD 1: 마이페이지(MyProfileView.tsx)에서 캐시가 비어 있어도 Supabase 원격 조회를 통해 내 글을 로드한다", () => {
    const profileViewPath = path.resolve("src/components/MyProfileView.tsx");
    assert.ok(fs.existsSync(profileViewPath), "MyProfileView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(profileViewPath, "utf-8");

    assert.match(
      content,
      /fetchPostsFromSupabase/,
      "MyProfileView.tsx에서 fetchPostsFromSupabase를 호출하여 원격 게시글을 조회해야 합니다."
    );
    assert.match(
      content,
      /mergeCommunityPosts/,
      "MyProfileView.tsx에서 원격 게시글과 로컬 캐시를 병합해야 합니다."
    );
  });

  test("DoD 2: 게시글 삭제 시 로컬뿐만 아니라 deletePostFromSupabase를 호출하여 원격 삭제를 동기화한다", async () => {
    const communityPosts = await import("../src/lib/communityPosts.ts");
    assert.equal(
      typeof communityPosts.deletePostFromSupabase,
      "function",
      "deletePostFromSupabase 함수가 communityPosts.ts에서 export 되어야 합니다."
    );

    let deletedId = null;
    const mockSupabase = {
      from: (table) => {
        assert.equal(table, "posts");
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

    const res = await communityPosts.deletePostFromSupabase(mockSupabase, "post-del-123");
    assert.equal(res.success, true);
    assert.equal(deletedId, "post-del-123");

    const profileViewPath = path.resolve("src/components/MyProfileView.tsx");
    const content = fs.readFileSync(profileViewPath, "utf-8");
    assert.match(
      content,
      /deletePostFromSupabase/,
      "MyProfileView.tsx 내 handleDeletePost에서 deletePostFromSupabase를 호출해야 합니다."
    );
  });

  test("DoD 3: 게시글 수정 시 로컬뿐만 아니라 updatePostInSupabase를 호출하여 원격 수정을 동기화하고 schema.sql에 UPDATE 정책이 존재한다", async () => {
    const communityPosts = await import("../src/lib/communityPosts.ts");
    assert.equal(
      typeof communityPosts.updatePostInSupabase,
      "function",
      "updatePostInSupabase 함수가 communityPosts.ts에서 export 되어야 합니다."
    );

    let updatedPayload = null;
    let updatedId = null;
    const mockSupabase = {
      from: (table) => {
        assert.equal(table, "posts");
        return {
          update: (payload) => ({
            eq: async (col, val) => {
              assert.equal(col, "id");
              updatedId = val;
              updatedPayload = payload;
              return { data: { id: val, ...payload }, error: null };
            },
          }),
        };
      },
    };

    const res = await communityPosts.updatePostInSupabase(mockSupabase, "post-edit-123", {
      content: "수정된 내용입니다",
      imageUrl: "https://example.com/new.png",
    });
    assert.equal(res.success, true);
    assert.equal(updatedId, "post-edit-123");
    assert.equal(updatedPayload.content, "수정된 내용입니다");
    assert.equal(updatedPayload.image_url, "https://example.com/new.png");

    const schemaPath = path.resolve("supabase/schema.sql");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    assert.match(
      schemaContent,
      /CREATE\s+POLICY\s+["'].*?["']\s+ON\s+public\.posts\s+FOR\s+UPDATE/,
      "supabase/schema.sql에 posts 테이블에 대한 UPDATE RLS 정책이 선언되어 있어야 합니다."
    );
  });

  test("DoD 4: mergeCommunityPosts는 서버에서 삭제된 유령 게시물을 제거하고, 아직 서버에 올라가지 않은 로컬 글은 보존한다", async () => {
    const { mergeCommunityPosts } = await import("../src/lib/communityPosts.ts");

    const remotePost = {
      id: "post-server-1",
      author: "베드로",
      content: "서버에 남아있는 정상 글",
      likes: 3,
      createdAt: new Date("2026-10-27T01:00:00Z").toISOString(),
      isSynced: true,
    };

    const ghostLocalPost = {
      id: "post-ghost-old",
      author: "김마리아",
      content: "서버에서 이미 삭제된 유령 글",
      likes: 1,
      createdAt: new Date("2026-10-27T00:30:00Z").toISOString(),
      isSynced: true, // 이전에 서버 동기화 완료되었던 표식
    };

    const offlineDraftPost = {
      id: "post-local-draft",
      author: "이요셉",
      content: "오프라인에서 방금 작성해 아직 서버에 올라가지 않은 글",
      likes: 0,
      createdAt: new Date("2026-10-27T02:00:00Z").toISOString(),
      isSynced: false, // 아직 서버 동기화 안 된 글
    };

    const merged = mergeCommunityPosts([remotePost], [ghostLocalPost, offlineDraftPost]);

    // 1. 서버에 있는 글은 포함
    assert.ok(merged.some((p) => p.id === "post-server-1"), "원격 정상 글은 포함되어야 합니다.");
    // 2. 서버에서 삭제된 유령 글은 제거
    assert.ok(!merged.some((p) => p.id === "post-ghost-old"), "서버에서 지워진 유령 글은 병합 후 제거되어야 합니다.");
    // 3. 아직 서버에 안 올라간 로컬 작성 글은 온전히 보존
    assert.ok(merged.some((p) => p.id === "post-local-draft"), "미동기화 로컬 작성 글은 제거되지 않고 보존되어야 합니다.");
  });

  test("DoD 5: 게시글이 삭제되거나 유령 글이 정리되면 commentsMap에서 해당 게시글의 댓글도 연쇄 제거된다", async () => {
    const { removeCommentsForPost, removeCommentsForDeletedPosts, getMyComments } = await import(
      "../src/lib/communityPosts.ts"
    );

    const commentsMap = {
      "post-1": [
        { id: "c-1", postId: "post-1", author: "김마리아", content: "댓글 1", createdAt: new Date().toISOString() },
      ],
      "post-2": [
        { id: "c-2", postId: "post-2", author: "김마리아", content: "댓글 2", createdAt: new Date().toISOString() },
      ],
    };

    // 1. 단일 글 삭제 연쇄 제거
    const nextMap = removeCommentsForPost(commentsMap, "post-1");
    assert.equal(nextMap["post-1"], undefined, "post-1의 댓글 목록이 commentsMap에서 완전히 삭제되어야 합니다.");
    assert.ok(Array.isArray(nextMap["post-2"]) && nextMap["post-2"].length === 1, "post-2의 댓글은 유지되어야 합니다.");

    const myCommentsAfterDelete = getMyComments(nextMap, "김마리아");
    assert.equal(myCommentsAfterDelete.length, 1);
    assert.equal(myCommentsAfterDelete[0].postId, "post-2");

    // 2. 유령 글 일괄 정리 연쇄 제거
    const cleanedMap = removeCommentsForDeletedPosts(commentsMap, new Set(["post-2"]));
    assert.equal(cleanedMap["post-1"], undefined);
    assert.equal(cleanedMap["post-2"].length, 1);
  });

  test("DoD 6: syncPostToSupabase는 post.userId가 유효한 UUID이거나 Supabase auth 사용자 ID를 바인딩하여 user_id NULL 방지", async () => {
    const { syncPostToSupabase } = await import("../src/lib/communityPosts.ts");

    let insertedRow = null;
    const mockSupabaseWithAuth = {
      auth: {
        getUser: async () => ({
          data: { user: { id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d" } },
          error: null,
        }),
      },
      from: (table) => ({
        insert: (rows) => {
          insertedRow = rows[0];
          return Promise.resolve({ data: rows, error: null });
        },
      }),
    };

    const postWithInvalidId = {
      id: "post-1234",
      content: "테스트 본문",
      author: "김마리아",
      parish: "하단",
      role: "청년",
      likes: 1,
      userId: "invalid-mock-id", // UUID 형식이 아님
    };

    const res = await syncPostToSupabase(mockSupabaseWithAuth, postWithInvalidId);
    assert.equal(res.success, true);
    assert.equal(
      insertedRow.user_id,
      "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      "post.userId가 비정상이더라도 현재 세션 authUser.id가 유효한 UUID라면 user_id에 바인딩되어야 합니다."
    );
  });
});
