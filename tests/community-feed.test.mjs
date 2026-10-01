import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

// 테스트를 위한 간단한 mock localStorage
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

// Global window/localStorage mock
global.localStorage = new MockLocalStorage();

describe("Community Feed Persistence (Issue #9)", () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  test("DoD 3 & 4: 로컬 캐싱 및 새로고침 후 게시글 소실 방지 (LocalStorage graceful fallback)", async () => {
    const {
      COMMUNITY_POSTS_STORAGE_KEY,
      loadCachedPosts,
      cachePosts,
      createPostPayload,
    } = await import("../src/lib/communityPosts.ts");

    assert.equal(COMMUNITY_POSTS_STORAGE_KEY, "byd2026_community_posts");

    // 1. 초기 상태에는 빈 배열 반환
    const initialCached = loadCachedPosts();
    assert.deepEqual(initialCached, []);

    // 2. 새 글 작성 (R2 CDN 이미지 URL 포함)
    const newPost = createPostPayload({
      author: "홍길동",
      parish: "하단",
      role: "청년",
      content: "청년의 날 은혜로운 시간입니다!",
      imageUrl: "https://pub-r2.byd.dev/posts/test.jpg",
      userId: "user-12345",
    });

    assert.equal(newPost.author, "홍길동");
    assert.equal(newPost.imageUrl, "https://pub-r2.byd.dev/posts/test.jpg");
    assert.ok(newPost.id);
    assert.ok(newPost.createdAt);

    // 3. 로컬 캐시에 저장
    cachePosts([newPost]);

    // 4. 새로고침 시뮬레이션: loadCachedPosts()로 다시 불러왔을 때 글이 그대로 남아있는지 검증
    const restored = loadCachedPosts();
    assert.equal(restored.length, 1);
    assert.equal(restored[0].id, newPost.id);
    assert.equal(restored[0].content, "청년의 날 은혜로운 시간입니다!");
    assert.equal(restored[0].imageUrl, "https://pub-r2.byd.dev/posts/test.jpg");
  });

  test("DoD 1 & 2: Supabase 연동 및 원격/로컬 병합 검증", async () => {
    const {
      mergeCommunityPosts,
      syncPostToSupabase,
      fetchPostsFromSupabase,
    } = await import("../src/lib/communityPosts.ts");

    // Supabase Mock Client
    const mockDb = [];
    const mockSupabase = {
      from: (table) => ({
        insert: async (data) => {
          mockDb.push(...data);
          return { data, error: null };
        },
        select: (cols) => ({
          order: (col, { ascending }) => ({
            data: [...mockDb].sort((a, b) => {
              if (ascending) return a[col] > b[col] ? 1 : -1;
              return a[col] < b[col] ? 1 : -1;
            }),
            error: null,
          }),
        }),
      }),
    };

    const postData = {
      id: "post-100",
      author: "김마리아",
      parish: "남천",
      role: "청년",
      content: "성체조배 은혜롭습니다",
      imageUrl: "https://pub-r2.byd.dev/posts/mary.jpg",
      createdAt: new Date().toISOString(),
      userId: "user-999",
      likes: 0,
    };

    // Supabase insert 동기화
    const syncRes = await syncPostToSupabase(mockSupabase, postData);
    assert.equal(syncRes.success, true);
    assert.equal(mockDb.length, 1);
    assert.equal(mockDb[0].content, "성체조배 은혜롭습니다");

    // Supabase select 조회
    const remotePosts = await fetchPostsFromSupabase(mockSupabase);
    assert.equal(remotePosts.length, 1);
    assert.equal(remotePosts[0].author, "김마리아");

    // 원격과 로컬 캐시 병합 검증 (중복 제거 및 최신순 정렬)
    const localOnlyPost = {
      id: "post-101",
      author: "이요셉",
      parish: "중앙",
      role: "교리교사",
      content: "오프라인에서 작성된 글",
      createdAt: new Date(Date.now() + 1000).toISOString(),
      likes: 0,
    };

    const merged = mergeCommunityPosts(remotePosts, [localOnlyPost], []);
    assert.equal(merged.length, 2);
    // 최신 글(post-101)이 맨 앞
    assert.equal(merged[0].id, "post-101");
    assert.equal(merged[1].id, "post-100");
  });

  test("Boundary & Resilience: 손상된 캐시, 네트워크 에러 및 시간 포맷팅 방어 검증", async () => {
    const {
      loadCachedPosts,
      syncPostToSupabase,
      fetchPostsFromSupabase,
      mergeCommunityPosts,
      formatTimeAgo,
      COMMUNITY_POSTS_STORAGE_KEY,
    } = await import("../src/lib/communityPosts.ts");

    // 1. 손상된 JSON / 배열 아닌 값이 들어있는 경우
    global.localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, "invalid-json{{");
    assert.deepEqual(loadCachedPosts(), []);

    global.localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify({ not: "an array" }));
    assert.deepEqual(loadCachedPosts(), []);

    // 2. Supabase 클라이언트가 null이거나 예외 발생 시
    const nullClientRes = await syncPostToSupabase(null, { content: "test" });
    assert.equal(nullClientRes.success, false);

    const throwingClient = {
      from: () => {
        throw new Error("Network offline");
      },
    };
    const throwingRes = await syncPostToSupabase(throwingClient, { content: "test" });
    assert.equal(throwingRes.success, false);

    const throwingFetch = await fetchPostsFromSupabase(throwingClient);
    assert.deepEqual(throwingFetch, []);

    // 3. mergeCommunityPosts 빈 배열 및 중복 ID 처리
    const emptyMerge = mergeCommunityPosts([], [], []);
    assert.deepEqual(emptyMerge, []);

    const duplicatePost1 = { id: "same-id", content: "local", createdAt: "2026-10-01T00:00:00Z" };
    const duplicatePost2 = { id: "same-id", content: "remote", createdAt: "2026-10-01T00:01:00Z" };
    const deduplicated = mergeCommunityPosts([duplicatePost2], [duplicatePost1], []);
    assert.equal(deduplicated.length, 1);
    assert.equal(deduplicated[0].content, "remote");

    // 4. formatTimeAgo 경계값
    assert.equal(formatTimeAgo(undefined), "방금 전");
    assert.equal(formatTimeAgo("invalid-date"), "방금 전");
    assert.equal(formatTimeAgo(new Date(Date.now() - 30 * 1000).toISOString()), "방금 전");
    assert.equal(formatTimeAgo(new Date(Date.now() - 5 * 60 * 1000).toISOString()), "5분 전");
    assert.equal(formatTimeAgo(new Date(Date.now() - 3 * 3600 * 1000).toISOString()), "3시간 전");
    assert.equal(formatTimeAgo(new Date(Date.now() - 2 * 86400 * 1000).toISOString()), "2일 전");
  });

  test("DoD Issue #21: Blob URL 저장 차단, 캐시 정제 및 공식 인증 배지(Official Role) 검증", async () => {
    const {
      createPostPayload,
      loadCachedPosts,
      isOfficialRole,
      COMMUNITY_POSTS_STORAGE_KEY,
    } = await import("../src/lib/communityPosts.ts");

    // 1. Blob URL 인입 시 저장 차단 (undefined 처리)
    const blobPost = createPostPayload({
      author: "남도미니코",
      parish: "중앙",
      role: "청년",
      content: "인증샷 올립니다!",
      imageUrl: "blob:http://localhost:3000/1234-5678-uuid",
    });
    assert.equal(blobPost.imageUrl, undefined, "blob: URL은 휘발성이므로 영구 저장되지 않아야 함");

    // 2. 정상 HTTP/HTTPS URL은 보존
    const validPost = createPostPayload({
      author: "김마리아",
      parish: "하단",
      role: "청년",
      content: "정상 이미지 글",
      imageUrl: "https://pub-r2.byd.dev/posts/real.jpg",
    });
    assert.equal(validPost.imageUrl, "https://pub-r2.byd.dev/posts/real.jpg");

    // 3. 기존 캐시에 blob: 이미지가 남아있을 경우 loadCachedPosts에서 정제
    global.localStorage.setItem(
      COMMUNITY_POSTS_STORAGE_KEY,
      JSON.stringify([
        {
          id: "corrupted-1",
          author: "남도미니코",
          content: "기존 깨진 글",
          imageUrl: "blob:https://busan-youth-day.vercel.app/abc-123",
          createdAt: new Date().toISOString(),
        },
      ])
    );
    const restored = loadCachedPosts();
    assert.equal(restored.length, 1);
    assert.equal(restored[0].imageUrl, undefined, "캐시 복원 시 blob: URL은 제거되어야 함");

    // 4. 공식 인증 마크 (Official Role) 검증
    assert.equal(isOfficialRole("사제"), true);
    assert.equal(isOfficialRole("신부님"), true);
    assert.equal(isOfficialRole("수도자"), true);
    assert.equal(isOfficialRole("수녀님"), true);
    assert.equal(isOfficialRole("학사님"), true);
    assert.equal(isOfficialRole("청년"), false);
    assert.equal(isOfficialRole("교리교사"), false);
    assert.equal(isOfficialRole("일반신자"), false);
    assert.equal(isOfficialRole("수도자지망생"), false, "부분 문자열 오매칭 방어");

    // 5. createPostPayload 내 isOfficial 플래그 연동
    const priestPost = createPostPayload({
      author: "김대건 신부님",
      role: "사제",
      content: "평화를 빕니다.",
    });
    assert.equal(priestPost.isOfficial, true);

    const youthPost = createPostPayload({
      author: "이요한",
      role: "청년",
      content: "찬미예수님!",
    });
    assert.equal(youthPost.isOfficial, false);
  });

  test("DoD Issue #21 (정정): 최신순(Latest) 및 실시간 인기순(Popular) 정렬 엔진 검증", async () => {
    const { sortCommunityPosts } = await import("../src/lib/communityPosts.ts");

    const samplePosts = [
      {
        id: "post-old-popular",
        content: "좋아요가 많은 옛날 글",
        likes: 100,
        createdAt: "2026-10-01T10:00:00Z",
      },
      {
        id: "post-new-normal",
        content: "방금 올라온 글",
        likes: 5,
        createdAt: "2026-10-01T12:00:00Z",
      },
      {
        id: "post-mid-super",
        content: "중간에 올라왔지만 최고 인기 글",
        likes: 250,
        createdAt: "2026-10-01T11:00:00Z",
      },
    ];

    // 1. 최신순 (Latest): 시간 역순
    const latestSorted = sortCommunityPosts(samplePosts, "latest");
    assert.equal(latestSorted[0].id, "post-new-normal");
    assert.equal(latestSorted[1].id, "post-mid-super");
    assert.equal(latestSorted[2].id, "post-old-popular");

    // 2. 인기순 (Popular): 좋아요 역순
    const popularSorted = sortCommunityPosts(samplePosts, "popular");
    assert.equal(popularSorted[0].id, "post-mid-super");
    assert.equal(popularSorted[1].id, "post-old-popular");
    assert.equal(popularSorted[2].id, "post-new-normal");
  });

  test("DoD Issue #25: 좋아요 토글(+1/-1), 최소 0 방어 및 새로고침(merge) 후 카운트 보존 검증", async () => {
    const { togglePostLike, mergeCommunityPosts } = await import("../src/lib/communityPosts.ts");

    // 1. 단일 포스트 좋아요 토글(+1)
    const basePost = {
      id: "post-toggle-1",
      author: "김마리아",
      parish: "하단",
      role: "청년",
      content: "테스트 글입니다",
      likes: 10,
      timeAgo: "방금 전",
      isLiked: false,
      createdAt: "2026-10-01T10:00:00Z",
    };

    const likedPost = togglePostLike(basePost);
    assert.equal(likedPost.likes, 11, "좋아요 클릭 시 +1 증가해야 함");
    assert.equal(likedPost.isLiked, true, "isLiked가 true로 전환되어야 함");

    // 2. 좋아요 취소 토글(-1)
    const unlikedPost = togglePostLike(likedPost);
    assert.equal(unlikedPost.likes, 10, "좋아요 재클릭(취소) 시 -1 감소해야 함");
    assert.equal(unlikedPost.isLiked, false, "isLiked가 false로 전환되어야 함");

    // 3. 좋아요 수가 0일 때 취소 토글 시 음수로 떨어지지 않는 방어 (Math.max(0, ...))
    const zeroLikesPost = {
      ...basePost,
      likes: 0,
      isLiked: true, // 이미 좋아요 눌린 상태에서 취소 시도
    };
    const defensivePost = togglePostLike(zeroLikesPost);
    assert.equal(defensivePost.likes, 0, "좋아요 수는 0 미만으로 내려가지 않아야 함");
    assert.equal(defensivePost.isLiked, false);

    // 4. 새로고침/재동기화(mergeCommunityPosts) 시 로컬에서 변경된 좋아요 수 및 상태 보존 검증
    const remotePosts = [
      {
        id: "post-toggle-1",
        author: "김마리아",
        parish: "하단",
        role: "청년",
        content: "테스트 글입니다 (원격 최신)",
        likes: 10,
        timeAgo: "방금 전",
        isLiked: false,
        createdAt: "2026-10-01T10:00:00Z",
      },
    ];

    const localPosts = [likedPost]; // likes: 11, isLiked: true

    const merged = mergeCommunityPosts(remotePosts, localPosts, []);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, "post-toggle-1");
    assert.equal(
      merged[0].isLiked,
      true,
      "새로고침/병합 후에도 로컬의 좋아요 상태(isLiked: true)가 유지되어야 함"
    );
    assert.equal(
      merged[0].likes,
      11,
      "새로고침/병합 후에도 로컬의 좋아요 수(likes: 11)가 원격 수치(10)로 롤백되지 않고 유지되어야 함"
    );

    // 반대로 로컬에서 좋아요 취소하여 likes가 줄어든 경우 (likes: 9, isLiked: false, 원격은 10)
    const unlikedLocal = {
      ...basePost,
      likes: 9,
      isLiked: false,
    };
    const mergedUnliked = mergeCommunityPosts(remotePosts, [unlikedLocal], []);
    assert.equal(
      mergedUnliked[0].likes,
      9,
      "로컬에서 좋아요 취소된 수치가 원격으로 인해 다시 10으로 롤백되지 않아야 함"
    );
    assert.equal(mergedUnliked[0].isLiked, false);

    // 5. 사용자가 로컬에서 조작하지 않은 fallback 포스트: 원격 최신 likes 증가가 정상 반영되어야 함 (Major finding 검증)
    const fallbackPost = {
      id: "post-1",
      author: "김마리아",
      parish: "중앙성당",
      role: "청년회장",
      content: "초기 게시글",
      likes: 12, // 초기 fallback likes
      timeAgo: "10분 전",
    };
    const remoteUpdatedPost = {
      ...fallbackPost,
      likes: 50, // 원격 DB에서 다른 사용자들이 좋아요 눌러 50으로 증가
    };
    const mergedFallback = mergeCommunityPosts([remoteUpdatedPost], [], [fallbackPost]);
    assert.equal(
      mergedFallback[0].likes,
      50,
      "로컬에서 조작하지 않은 포스트는 원격의 최신 likes(50)가 fallback likes(12)에 의해 덮어씌워지지 않고 반영되어야 함"
    );
  });
});
