import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };

const {
  syncPostToSupabase,
  fetchPostsFromSupabase,
  mergeCommunityPosts,
  getPostMediaUrls,
} = await import("../src/lib/communityPosts.ts");

function createMockSupabase(initialRows = []) {
  const rows = [...initialRows];
  return {
    rows,
    from: () => ({
      insert: async (data) => {
        rows.push(...data);
        return { data, error: null };
      },
      select: () => ({
        order: () => ({ data: [...rows], error: null }),
      }),
    }),
  };
}

const basePost = {
  id: "11111111-1111-4111-8111-111111111111",
  author: "남성호",
  parish: "하단",
  role: "청년",
  content: "인증샷",
  createdAt: "2026-10-03T00:00:00.000Z",
  likes: 1,
};

describe("Issue #84: 다중 미디어(mediaUrls) Supabase 영속화", () => {
  test("정상값: 3장 게시물을 저장 후 다시 읽으면 순서까지 3장 전부 돌아온다", async () => {
    const urls = ["https://r2.dev/a.webp", "https://r2.dev/b.webp", "https://r2.dev/c.mp4"];
    const db = createMockSupabase();
    const res = await syncPostToSupabase(db, { ...basePost, imageUrl: urls[0], mediaUrls: urls });
    assert.equal(res.success, true);

    const [restored] = await fetchPostsFromSupabase(db);
    assert.deepEqual(getPostMediaUrls(restored), urls);
  });

  test("일부만 맞는 값: 2장 이상이면 첫 장으로 잘리지 않는다", async () => {
    const urls = ["https://r2.dev/1.webp", "https://r2.dev/2.webp"];
    const db = createMockSupabase();
    await syncPostToSupabase(db, { ...basePost, imageUrl: urls[0], mediaUrls: urls });

    const [restored] = await fetchPostsFromSupabase(db);
    assert.equal(restored.mediaUrls.length, 2);
    assert.equal(restored.imageUrl, urls[0]);
  });

  test("틀린값: media_urls 없이 image_url 만 있는 기존 행은 1장으로 표시된다 (하위 호환)", async () => {
    const db = createMockSupabase([
      { id: "legacy-1", content: "옛 글", image_url: "https://r2.dev/legacy.jpg", created_at: "2026-10-01T00:00:00.000Z" },
    ]);
    const [restored] = await fetchPostsFromSupabase(db);
    assert.deepEqual(getPostMediaUrls(restored), ["https://r2.dev/legacy.jpg"]);
  });

  test("헷갈리는 값: media_urls 가 빈 배열/null 이어도 image_url 로 폴백한다", async () => {
    const db = createMockSupabase([
      { id: "e-1", content: "빈 배열", image_url: "https://r2.dev/x.jpg", media_urls: [], created_at: "2026-10-02T00:00:00.000Z" },
      { id: "e-2", content: "null", image_url: "https://r2.dev/y.jpg", media_urls: null, created_at: "2026-10-01T00:00:00.000Z" },
    ]);
    const restored = await fetchPostsFromSupabase(db);
    assert.deepEqual(getPostMediaUrls(restored[0]), ["https://r2.dev/x.jpg"]);
    assert.deepEqual(getPostMediaUrls(restored[1]), ["https://r2.dev/y.jpg"]);
  });

  test("헷갈리는 값: 1장짜리 게시물은 media_urls 컬럼 없이 저장된다 (마이그레이션 적용 전 배포 안전)", async () => {
    const db = createMockSupabase();
    await syncPostToSupabase(db, {
      ...basePost,
      imageUrl: "https://r2.dev/only.webp",
      mediaUrls: ["https://r2.dev/only.webp"],
    });
    assert.equal(db.rows[0].image_url, "https://r2.dev/only.webp");
    assert.equal("media_urls" in db.rows[0], false);
  });

  test("병합: 원격에서 받은 다중 미디어가 로컬 캐시 병합 뒤에도 유지된다", async () => {
    const urls = ["https://r2.dev/m1.webp", "https://r2.dev/m2.webp"];
    const db = createMockSupabase();
    await syncPostToSupabase(db, { ...basePost, imageUrl: urls[0], mediaUrls: urls });
    const remote = await fetchPostsFromSupabase(db);

    const localCopy = { ...basePost, imageUrl: urls[0], mediaUrls: urls, isLiked: true };
    const merged = mergeCommunityPosts(remote, [localCopy], []);
    assert.deepEqual(getPostMediaUrls(merged[0]), urls);
  });

  test("스키마: supabase/schema.sql 에 media_urls 컬럼 추가 구문이 있다 (기존 DB 용 멱등 ALTER 포함)", () => {
    const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
    assert.match(schema, /ALTER TABLE public\.posts\s+ADD COLUMN IF NOT EXISTS media_urls TEXT\[\]/);
  });
});
