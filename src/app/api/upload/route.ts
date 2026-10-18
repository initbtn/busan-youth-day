import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getR2PresignedUploadUrl } from "@/lib/r2";

// 최대 파일 크기: 15MB (이미지 및 동영상 공통 상한)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Supabase Auth 세션 검증
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 또는 Route Handler 환경 예외 무시
          }
        },
      },
    });

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

    // 허용 이미지 및 영상 MIME 타입 검증
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Only image (jpeg, png, webp, gif) and video (mp4, webm, mov) files are allowed" },
        { status: 400 }
      );
    }

    const uniqueKey = `posts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;
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
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned upload url" },
      { status: 500 }
    );
  }
}
