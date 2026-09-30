import { NextResponse } from "next/server";
import { getR2PresignedUploadUrl } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // 허용 이미지 MIME 타입 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Only image files (jpeg, png, webp, gif) are allowed" },
        { status: 400 }
      );
    }

    const uniqueKey = `posts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;
    const { uploadUrl, publicUrl, key } = await getR2PresignedUploadUrl(uniqueKey, contentType);

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
