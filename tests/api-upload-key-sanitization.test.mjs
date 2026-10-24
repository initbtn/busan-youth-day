import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const uploadSanitizer = await import("../src/lib/uploadSanitizer.ts");
const sanitizeUploadFileName =
  uploadSanitizer.sanitizeUploadFileName || uploadSanitizer.default?.sanitizeUploadFileName;
const ALLOWED_MIME_TYPES =
  uploadSanitizer.ALLOWED_MIME_TYPES || uploadSanitizer.default?.ALLOWED_MIME_TYPES;

const r2 = await import("../src/lib/r2.ts");
const getPublicUrl = r2.getPublicUrl || r2.default?.getPublicUrl;

describe("업로드 파일명 저장소 키 및 공개 URL 안전성 검증 (Issue #95)", () => {
  const uploadRoutePath = path.resolve("src/app/api/upload/route.ts");
  const r2LibPath = path.resolve("src/lib/r2.ts");

  describe("DoD 1-a: sanitizeUploadFileName 정규화 및 안전 키 변환 검증", () => {
    test("1. 정상 영문/숫자 파일명은 원본 형태를 보존한다", () => {
      const result = sanitizeUploadFileName("normal_photo_123.png", "image/png");
      assert.equal(result, "normal_photo_123.png");
    });

    test("2. 특수문자(#, ?, %, &, + 등) 및 공백이 포함된 파일명은 안전하게 치환/정돈된다", () => {
      const result = sanitizeUploadFileName("사진 1 #a?b%c&d+e.webp", "image/webp");
      assert.ok(!result.includes("#"), "결과 파일명에 '#'가 포함되지 않아야 합니다.");
      assert.ok(!result.includes("?"), "결과 파일명에 '?'가 포함되지 않아야 합니다.");
      assert.ok(!result.includes("%"), "결과 파일명에 '%'가 포함되지 않아야 합니다.");
      assert.ok(!result.includes("&"), "결과 파일명에 '&'가 포함되지 않아야 합니다.");
      assert.ok(!result.includes("+"), "결과 파일명에 '+'가 포함되지 않아야 합니다.");
      assert.ok(!result.includes(" "), "결과 파일명에 공백이 포함되지 않아야 합니다.");
      assert.equal(result, "사진_1_a_b_c_d_e.webp");
    });

    test("3. 경로 탐색(../, /, \\)이 포함된 경우 디렉터리 경로가 완전히 제거된다", () => {
      const result = sanitizeUploadFileName("../../var/log/secret/upload.jpg", "image/jpeg");
      assert.ok(!result.includes("/"), "결과에 디렉터리 슬래시가 포함되지 않아야 합니다.");
      assert.ok(!result.includes("\\"), "결과에 역슬래시가 포함되지 않아야 합니다.");
      assert.equal(result, "upload.jpg");
    });

    test("4. 한글 파일명 및 안전한 특수문자(-, _)는 정상 보존된다", () => {
      const result = sanitizeUploadFileName("2026_부산청년의날_기념사진.jpg", "image/jpeg");
      assert.equal(result, "2026_부산청년의날_기념사진.jpg");
    });

    test("5. 60자를 초과하는 너무 긴 파일명은 안전 길이(60자)로 절삭된다", () => {
      const longBase = "a".repeat(300);
      const result = sanitizeUploadFileName(`${longBase}.mp4`, "video/mp4");
      assert.equal(result, `${"a".repeat(60)}.mp4`);
      assert.ok(result.length <= 64, "확장자를 포함한 전체 길이가 제한 범위 내여야 합니다.");
    });

    test("6. 확장자가 누락되었거나 비정상인 경우 contentType에 따른 표준 확장자가 자동 부여된다", () => {
      const result1 = sanitizeUploadFileName("blob_without_extension", "image/jpeg");
      assert.equal(result1, "blob_without_extension.jpg");

      const result2 = sanitizeUploadFileName("user_video", "video/mp4");
      assert.equal(result2, "user_video.mp4");
    });

    test("7. 특수문자나 점으로만 구성되어 베이스명이 비어버린 경우 기본값(upload)으로 대체된다", () => {
      const result = sanitizeUploadFileName("###???...///", "image/png");
      assert.equal(result, "upload.png");
    });

    test("8. macOS/iOS Safari NFD 유니코드 분해 자모 파일명이 NFC 완성형으로 온전히 정규화 보존된다", () => {
      // "청년의날_사진"의 NFD 분해 문자열
      const nfdName = "청년의날_사진".normalize("NFD");
      assert.notEqual(nfdName, "청년의날_사진", "NFD는 NFC 완성형과 유니코드 바이트가 달라야 합니다.");

      const result = sanitizeUploadFileName(`${nfdName}.jpg`, "image/jpeg");
      assert.equal(result, "청년의날_사진.jpg", "NFD 한글 파일명이 NFC 완성형으로 정상 합성되어야 합니다.");
      assert.notEqual(result, "upload.jpg", "NFD 한글이 언더스코어로 파괴되어 upload로 대체되어서는 안 됩니다.");
    });
  });

  describe("DoD 1-b: getPublicUrl RFC 3986 URL 유효성 및 인코딩 검증", () => {
    const originalEnv = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    test.before(() => {
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-sample.r2.dev";
    });

    test.after(() => {
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL = originalEnv;
    });

    test("공개 URL은 항상 new URL()로 정상 파싱되며 해시(#)나 쿼리(?)로 잘리지 않는다", () => {
      const sampleKey = "posts/1729700000-abc123-사진_1_행사.webp";
      const publicUrl = getPublicUrl(sampleKey);

      assert.doesNotThrow(() => new URL(publicUrl), "공개 URL은 유효한 URL이어야 합니다.");
      const parsed = new URL(publicUrl);

      // 한글 세그먼트가 퍼센트 인코딩되어 있어야 함
      assert.equal(parsed.hash, "", "URL에 해시 fragment(#)가 없어야 합니다.");
      assert.equal(parsed.search, "", "URL에 쿼리 스트링(?)이 없어야 합니다.");
      assert.equal(
        parsed.pathname,
        `/posts/1729700000-abc123-${encodeURIComponent("사진_1_행사")}.webp`,
        "경로 세그먼트가 올바르게 인코딩되어야 합니다."
      );
    });

    test("기존에 생성된 파일명에 공백이 포함된 경우에도 유효한 %20 인코딩 URL로 변환된다", () => {
      const legacyKey = "posts/1729700000-legacy file name.jpg";
      const publicUrl = getPublicUrl(legacyKey);
      const parsed = new URL(publicUrl);

      assert.ok(!publicUrl.includes(" "), "공개 URL에 unencoded 공백이 없어야 합니다.");
      assert.equal(parsed.pathname, "/posts/1729700000-legacy%20file%20name.jpg");
    });
  });

  describe("DoD 1-c: 소스코드 계약 검증 (정적 분석)", () => {
    test("src/app/api/upload/route.ts에서 sanitizeUploadFileName을 호출하여 uniqueKey를 생성한다", () => {
      assert.ok(fs.existsSync(uploadRoutePath));
      const content = fs.readFileSync(uploadRoutePath, "utf-8");

      assert.match(
        content,
        /sanitizeUploadFileName\(fileName,\s*contentType\)/,
        "upload/route.ts는 sanitizeUploadFileName을 호출해야 합니다."
      );
      assert.match(
        content,
        /uniqueKey\s*=\s*`posts\/\${Date\.now\(\)}-\${.*}-\${sanitizedFileName}`/,
        "uniqueKey는 sanitizedFileName을 기반으로 조립되어야 합니다."
      );
    });

    test("src/app/api/upload/route.ts는 uploadSanitizer의 ALLOWED_MIME_TYPES를 참조하여 MIME을 검증한다", () => {
      const content = fs.readFileSync(uploadRoutePath, "utf-8");

      assert.match(
        content,
        /ALLOWED_MIME_TYPES\.includes\(contentType\)/,
        "upload/route.ts는 uploadSanitizer의 ALLOWED_MIME_TYPES 상수를 재사용해야 합니다."
      );
    });

    test("src/lib/r2.ts에서 getPublicUrl 함수가 세그먼트 인코딩을 수행한다", () => {
      assert.ok(fs.existsSync(r2LibPath));
      const content = fs.readFileSync(r2LibPath, "utf-8");

      assert.match(
        content,
        /encodeURIComponent/,
        "r2.ts의 getPublicUrl은 encodeURIComponent를 사용해야 합니다."
      );
      assert.match(
        content,
        /getPublicUrl\(fileName\)/,
        "getR2PresignedUploadUrl은 getPublicUrl을 활용해야 합니다."
      );
    });
  });
});
