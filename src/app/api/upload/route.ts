import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getR2PresignedUploadUrl, uploadBufferToR2 } from "@/lib/r2";
import { sanitizeUploadFileName, ALLOWED_MIME_TYPES } from "@/lib/uploadSanitizer";

// 최대 파일 크기: 15MB (이미지 및 동영상 공통 상한)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Supabase Auth 세션 검증
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const contentTypeHeader = request.headers.get("content-type") || "";

    // 1. multipart/form-data 직접 업로드 프록시 (BFF 패턴: R2 직접 쓰기 완전 차단)
    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const rawFileSize = formData.get("fileSize");

      if (!file) {
        return NextResponse.json(
          { error: "file is required in formData" },
          { status: 400 }
        );
      }

      const fileSize = rawFileSize !== null && rawFileSize !== undefined ? Number(rawFileSize) : file.size;

      // 파일 크기 유효성 및 15MB 상한 가드
      if (isNaN(fileSize) || fileSize <= 0) {
        return NextResponse.json(
          { error: "Valid fileSize is required" },
          { status: 400 }
        );
      }

      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds the 15MB limit (${MAX_FILE_SIZE} bytes)` },
          { status: 400 }
        );
      }

      const contentType = (formData.get("contentType") as string) || file.type;
      if (!ALLOWED_MIME_TYPES.includes(contentType)) {
        return NextResponse.json(
          { error: "Only image (jpeg, png, webp, gif) and video (mp4, webm, mov) files are allowed" },
          { status: 400 }
        );
      }

      const sanitizedFileName = sanitizeUploadFileName(file.name, contentType);
      const uniqueKey = `posts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { publicUrl, key } = await uploadBufferToR2(buffer, uniqueKey, contentType);

      return NextResponse.json({
        publicUrl,
        key,
      });
    }

    // 2. JSON 기반 Fallback 처리
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // 파일 크기 유효성 및 15MB 상한 가드
    if (fileSize === undefined || typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json(
        { error: "Valid fileSize is required" },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 15MB limit (${MAX_FILE_SIZE} bytes)` },
        { status: 400 }
      );
    }

    // 허용 이미지 및 영상 MIME 타입 검증 (uploadSanitizer SSOT 참조)
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Only image (jpeg, png, webp, gif) and video (mp4, webm, mov) files are allowed" },
        { status: 400 }
      );
    }

    const sanitizedFileName = sanitizeUploadFileName(fileName, contentType);
    const uniqueKey = `posts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedFileName}`;
    const { uploadUrl, publicUrl, key } = await getR2PresignedUploadUrl(
      uniqueKey,
      contentType,
      fileSize
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
