import test, { describe } from "node:test";
import assert from "node:assert/strict";

describe("소통피드 미디어 고도화 단위 테스트 (Issue #33)", () => {
  test("DoD 1 & 하위 호환성: CommunityPost mediaUrls 정규화 및 단일 imageUrl 호환 검증", async () => {
    const { getPostMediaUrls } = await import("../src/lib/communityPosts.ts");

    // 1. 기존 레거시 포스트 (단일 imageUrl만 있는 경우)
    const legacyPost = {
      id: "post-legacy-1",
      author: "김마리아",
      parish: "중앙성당",
      role: "청년",
      content: "레거시 사진 글",
      imageUrl: "https://r2.example.com/legacy.jpg",
      likes: 10,
    };
    const urls1 = getPostMediaUrls(legacyPost);
    assert.deepEqual(urls1, ["https://r2.example.com/legacy.jpg"], "legacy imageUrl은 길이 1의 mediaUrls 배열로 정규화되어야 함");

    // 2. 신규 멀티 미디어 포스트 (mediaUrls가 있는 경우)
    const multiPost = {
      id: "post-multi-1",
      author: "이베드로",
      parish: "범일성당",
      role: "청년",
      content: "멀티 사진 글",
      imageUrl: "https://r2.example.com/photo1.jpg",
      mediaUrls: [
        "https://r2.example.com/photo1.jpg",
        "https://r2.example.com/photo2.jpg",
        "https://r2.example.com/video1.mp4",
      ],
      likes: 5,
    };
    const urls2 = getPostMediaUrls(multiPost);
    assert.equal(urls2.length, 3);
    assert.equal(urls2[1], "https://r2.example.com/photo2.jpg");

    // 3. 미디어가 없는 텍스트 포스트
    const textPost = {
      id: "post-text-1",
      author: "박요한",
      parish: "남천성당",
      role: "청년",
      content: "글만 있는 포스트",
      likes: 2,
    };
    assert.deepEqual(getPostMediaUrls(textPost), [], "미디어가 없는 포스트는 빈 배열을 반환해야 함");
  });

  test("DoD 3: 클라이언트 이미지 최적화 알고리즘 (calculateTargetDimensions, isSupportedMediaType)", async () => {
    const { calculateTargetDimensions, isSupportedMediaType } = await import("../src/lib/imageOptimizer.ts");

    // 1. 장변 1920px 이하인 이미지는 원본 크기 유지
    const dims1 = calculateTargetDimensions(1200, 800, 1920);
    assert.deepEqual(dims1, { width: 1200, height: 800 }, "1920px 이하인 이미지는 축소되지 않아야 함");

    // 2. 가로가 1920px 초과인 가로형 이미지 리사이즈
    const dims2 = calculateTargetDimensions(3840, 2160, 1920);
    assert.equal(dims2.width, 1920, "가로 장변이 1920px로 리사이즈되어야 함");
    assert.equal(dims2.height, 1080, "가로세로 비율이 정확하게 유지되어야 함");

    // 3. 세로가 1920px 초과인 세로형 이미지 리사이즈
    const dims3 = calculateTargetDimensions(2000, 4000, 1920);
    assert.equal(dims3.height, 1920, "세로 장변이 1920px로 리사이즈되어야 함");
    assert.equal(dims3.width, 960, "세로형 가로 비율이 정확하게 유지되어야 함");

    // 4. 지원 미디어 타입 검증
    assert.equal(isSupportedMediaType("image/jpeg"), true);
    assert.equal(isSupportedMediaType("image/png"), true);
    assert.equal(isSupportedMediaType("image/webp"), true);
    assert.equal(isSupportedMediaType("video/mp4"), true);
    assert.equal(isSupportedMediaType("video/webm"), true);
    assert.equal(isSupportedMediaType("video/quicktime"), true);
    assert.equal(isSupportedMediaType("application/pdf"), false);
  });

  test("DoD 2: 영상 압축 유틸리티 사양 및 가용성 체크 (getVideoMeta, checkVideoCompressionSupport)", async () => {
    const { checkVideoCompressionSupport, isVideoUrl } = await import("../src/lib/videoCompressor.ts");

    assert.equal(typeof checkVideoCompressionSupport, "function");
    assert.equal(isVideoUrl("https://r2.example.com/test.mp4"), true);
    assert.equal(isVideoUrl("https://r2.example.com/test.webm"), true);
    assert.equal(isVideoUrl("https://r2.example.com/test.mov"), true);
    assert.equal(isVideoUrl("https://r2.example.com/test.jpg"), false);
    assert.equal(isVideoUrl("https://r2.example.com/test.png"), false);
  });

  test("DoD 4: 1분 이내 숏츠 영상 제한(60s) 및 보수적 용량 제한(15MB) 검증 (Issue #71)", async () => {
    const {
      MAX_VIDEO_SIZE_BYTES,
      MAX_VIDEO_DURATION_SECONDS,
      compressVideoIfNeeded,
    } = await import("../src/lib/videoCompressor.ts");

    assert.equal(MAX_VIDEO_SIZE_BYTES, 15 * 1024 * 1024, "최대 비디오 용량은 15MB여야 함");
    assert.equal(MAX_VIDEO_DURATION_SECONDS, 60, "최대 비디오 길이는 60초(1분) 숏츠여야 함");

    // 15MB 초과 mock file 테스트
    const oversizedFile = {
      name: "large_video.mp4",
      size: 16 * 1024 * 1024,
      type: "video/mp4",
    };

    await assert.rejects(
      async () => {
        await compressVideoIfNeeded(oversizedFile);
      },
      /최대 15MB까지/,
      "15MB 초과 영상은 에러를 던져야 함"
    );

    // 15MB 이하 허용 범위 mock file 테스트
    const validFile = {
      name: "valid_short.mp4",
      size: 8 * 1024 * 1024,
      type: "video/mp4",
    };

    const result = await compressVideoIfNeeded(validFile);
    assert.equal(result.name, "valid_short.mp4");
  });
});

