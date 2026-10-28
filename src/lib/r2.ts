import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * R2 객체 키로부터 브라우저에서 안전하게 접근 가능한 공개 URL 생성
 * - 키 내부 경로 구분자(/)는 유지하고 각 세그먼트를 RFC 3986 퍼센트 인코딩
 * - 한글, 공백 등 비ASCII 문자가 URL 조각(#)이나 쿼리(?)로 오인되는 결함 방어
 */
export function getPublicUrl(key: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/${encodedKey}`;
}

/**
 * Cloudflare R2 버킷에 서버에서 직접 바이너리 버퍼 업로드 (Next.js 게이트웨이 프록시 전용)
 */
export async function uploadBufferToR2(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<{ publicUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  const publicUrl = getPublicUrl(key);
  return { publicUrl, key };
}

/**
 * Cloudflare R2 업로드를 위한 Presigned URL 발급
 * @param fileName 저장할 파일명/키 (예: posts/unique-id.jpg)
 * @param contentType 파일 MIME 타입 (예: image/jpeg)
 * @param fileSize 업로드할 파일의 크기(바이트) — 서명에 ContentLength를 강제하여 임의 크기 업로드 방어
 */
export async function getR2PresignedUploadUrl(
  fileName: string,
  contentType: string,
  fileSize?: number
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
    ...(fileSize !== undefined && { ContentLength: fileSize }),
  });

  // 유효시간 60초
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });
  const publicUrl = getPublicUrl(fileName);

  return { uploadUrl, publicUrl, key: fileName };
}
