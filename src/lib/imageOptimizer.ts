/**
 * 이미지 최적화 및 미디어 타입 검증 유틸리티 (Issue #33)
 * 순수 브라우저 Canvas API를 활용하여 무거운 외부 라이브러리 없이 
 * 장변 1920px 리사이즈 및 JPEG/WebP 85% 품질 압축을 수행합니다.
 */

export interface OptimizeImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function isSupportedMediaType(mimeType: string): boolean {
  if (!mimeType) return false;
  const normalized = mimeType.toLowerCase().trim();
  return SUPPORTED_IMAGE_TYPES.has(normalized) || SUPPORTED_VIDEO_TYPES.has(normalized);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * 장변(maxDimension) 기준 비율 유지 리사이즈 계산
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  maxDimension = 1920
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: Math.max(1, origWidth), height: Math.max(1, origHeight) };
  }

  if (origWidth <= maxDimension && origHeight <= maxDimension) {
    return { width: origWidth, height: origHeight };
  }

  if (origWidth >= origHeight) {
    const scale = maxDimension / origWidth;
    return {
      width: maxDimension,
      height: Math.round(origHeight * scale),
    };
  } else {
    const scale = maxDimension / origHeight;
    return {
      width: Math.round(origWidth * scale),
      height: maxDimension,
    };
  }
}

/**
 * 클라이언트 이미지 최적화 (Canvas API)
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File | Blob> {
  const { maxDimension = 1920, quality = 0.85, mimeType = "image/jpeg" } = options;

  // SSR 환경이거나 애니메이션 GIF인 경우 원본 반환
  if (typeof window === "undefined" || typeof document === "undefined" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = calculateTargetDimensions(img.width, img.height, maxDimension);

      // 리사이즈가 필요 없고 이미 품질이 양호한 작은 파일인 경우 원본 유지
      if (width === img.width && height === img.height && file.size < 500 * 1024 && file.type === mimeType) {
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // 부드러운 이미지 스케일링 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // 압축 후 용량이 오히려 증가한 경우 원본 반환
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // 에러 발생 시 원본으로 graceful fallback
    };

    img.src = objectUrl;
  });
}
