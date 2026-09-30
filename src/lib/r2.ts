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
 * Cloudflare R2 업로드를 위한 Presigned URL 발급
 * @param fileName 저장할 파일명 (예: posts/unique-id.jpg)
 * @param contentType 파일 MIME 타입 (예: image/jpeg)
 */
export async function getR2PresignedUploadUrl(fileName: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  // 유효시간 60초
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

  return { uploadUrl, publicUrl, key: fileName };
}
