/**
 * 허용 MIME 타입별 표준 파일 확장자 매핑
 */
export const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov"],
};

/**
 * 허용 미디어 MIME 타입 목록 (Single Source of Truth)
 */
export const ALLOWED_MIME_TYPES: string[] = Object.keys(MIME_TO_EXTENSIONS);

/**
 * 업로드 파일명 정규화 및 R2 저장소/URL 안전 키 변환
 * - 유니코드 정규화(NFC): macOS/iOS Safari의 NFD 분해 자모(ᄀ, ᅡ)를 NFC 완성형(가)으로 합성
 * - 경로 탐색(../, /, \) 제거
 * - URL 예약어(#, ?, %, &, +, =, :, ;, @, ", ', <, >, [, ], {, }, |, ^, ~, *) 및 공백 제거/치환
 * - 한글, 영문, 숫자, 안전 구분자(-, _) 보존
 * - 파일명 길이 60자 상한 (확장자 제외)
 * - 확장자 누락 또는 MIME 타입 불일치 시 contentType 기반 표준 확장자 자동 보정
 */
export function sanitizeUploadFileName(fileName: string, contentType: string): string {
  // 0. 유니코드 NFC 정규화 (macOS/iOS 분해형 자모 합성)
  const normalized = (fileName || "").normalize("NFC");

  // 1. 경로 구분자 제거 (디렉터리 탐색 방어)
  const baseOnly = normalized.replace(/^.*[\\\/]/, "").trim();

  // 2. 확장자 분리
  const lastDotIndex = baseOnly.lastIndexOf(".");
  const rawBase = lastDotIndex > 0 ? baseOnly.slice(0, lastDotIndex) : baseOnly;
  const rawExt = lastDotIndex > 0 ? baseOnly.slice(lastDotIndex).toLowerCase() : "";

  // 3. 확장자 검증 및 MIME 매핑 보정
  const allowedExts = MIME_TO_EXTENSIONS[contentType] || [];
  let validExt = allowedExts.find((ext) => ext === rawExt);
  if (!validExt) {
    validExt = allowedExts[0] || (rawExt.startsWith(".") ? rawExt : ".bin");
  }

  // 4. 베이스 파일명 정규화
  // 공백을 언더스코어로 치환
  let sanitizedBase = rawBase.replace(/\s+/g, "_");

  // 안전하지 않은 문자 제거 (한글 완성형 및 자모, 영문, 숫자, _, - 만 허용)
  sanitizedBase = sanitizedBase.replace(/[^a-zA-Z0-9_\-\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FF]/g, "_");

  // 연속된 언더스코어/하이픈 압축
  sanitizedBase = sanitizedBase.replace(/[-_]{2,}/g, "_");

  // 앞뒤 언더스코어, 하이픈, 점 제거
  sanitizedBase = sanitizedBase.replace(/^[-_.]+|[-_.]+$/g, "");

  // 5. 길이 제한 (최대 60자)
  if (sanitizedBase.length > 60) {
    sanitizedBase = sanitizedBase.slice(0, 60).replace(/[-_.]+$/, "");
  }

  // 파일명이 특수문자만 있어 비어버린 경우 기본값 대체
  if (!sanitizedBase) {
    sanitizedBase = "upload";
  }

  return `${sanitizedBase}${validExt}`;
}
