import test, { describe } from "node:test";
import assert from "node:assert/strict";

describe("아이폰 HEIC -> WebP 자동 변환 단위 및 계약 검증 (Issue #78)", () => {
  test("DoD 1: isHeicFile 판별 함수 검증", async () => {
    const { isHeicFile } = await import("../src/lib/imageOptimizer.ts");

    assert.equal(isHeicFile({ name: "IMG_1234.HEIC", type: "" }), true, ".HEIC 대문자 확장자는 HEIC로 판별되어야 함");
    assert.equal(isHeicFile({ name: "photo.heif", type: "" }), true, ".heif 소문자 확장자는 HEIC로 판별되어야 함");
    assert.equal(isHeicFile({ name: "sample.jpg", type: "image/heic" }), true, "MIME이 image/heic이면 HEIC로 판별되어야 함");
    assert.equal(isHeicFile({ name: "sample.jpg", type: "image/heif" }), true, "MIME이 image/heif이면 HEIC로 판별되어야 함");
    assert.equal(isHeicFile({ name: "sample.jpg", type: "image/jpeg" }), false, "일반 JPEG는 HEIC가 아니어야 함");
    assert.equal(isHeicFile({ name: "sample.png", type: "image/png" }), false, "일반 PNG는 HEIC가 아니어야 함");
  });

  test("DoD 2: HEIC 변환 인터페이스 convertHeicToJpegIfPossible 검증", async () => {
    const { convertHeicToJpegIfPossible } = await import("../src/lib/imageOptimizer.ts");

    assert.equal(typeof convertHeicToJpegIfPossible, "function", "convertHeicToJpegIfPossible 함수가 존재해야 함");

    // SSR 환경(window 없음)에서는 원본 파일이 반환되어야 함
    const mockHeic = {
      name: "IMG_0001.HEIC",
      type: "image/heic",
      size: 5 * 1024 * 1024,
    };

    const res = await convertHeicToJpegIfPossible(mockHeic);
    assert.equal(res.name, "IMG_0001.HEIC", "SSR 환경에서는 원본을 보존해 반환해야 함");
  });
});
