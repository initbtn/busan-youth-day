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

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
]);

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "quicktime",
]);

function getFileExtension(filename?: string): string {
  if (!filename) return "";
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return filename.slice(dotIndex + 1).toLowerCase().trim();
}

export function isSupportedMediaType(mimeType: string, filename?: string): boolean {
  if (mimeType) {
    const normalized = mimeType.toLowerCase().trim();
    if (SUPPORTED_IMAGE_TYPES.has(normalized) || SUPPORTED_VIDEO_TYPES.has(normalized)) {
      return true;
    }
  }

  // 모바일 환경 등에서 MIME 타입이 비어 있거나 application/octet-stream인 경우 확장자 보조 판별
  if (filename) {
    const ext = getFileExtension(filename);
    if (SUPPORTED_IMAGE_EXTENSIONS.has(ext) || SUPPORTED_VIDEO_EXTENSIONS.has(ext)) {
      return true;
    }
  }

  return false;
}

export function isImageFile(file: File | { name?: string; type?: string }): boolean {
  if (file.type && file.type.startsWith("image/")) {
    return true;
  }
  const ext = getFileExtension(file.name);
  return SUPPORTED_IMAGE_EXTENSIONS.has(ext);
}

export function isVideoFile(file: File | { name?: string; type?: string }): boolean {
  if (file.type && file.type.startsWith("video/")) {
    return true;
  }
  const ext = getFileExtension(file.name);
  return SUPPORTED_VIDEO_EXTENSIONS.has(ext);
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
  const { maxDimension = 1920, quality = 0.85, mimeType = "image/webp" } = options;

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

      // WebP 지원 여부 및 생성 실패 시 JPEG 폴백을 처리하는 toBlob 래퍼
      const attemptBlobGeneration = (
        targetMime: string,
        onSuccess: (blob: Blob) => void,
        onFail: () => void
      ) => {
        try {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                onSuccess(blob);
              } else {
                onFail();
              }
            },
            targetMime,
            quality
          );
        } catch {
          onFail();
        }
      };

      const handleSuccess = (blob: Blob, usedMime: string) => {
        // 압축 후 용량이 오히려 증가한 경우 원본 반환
        if (blob.size >= file.size) {
          resolve(file);
          return;
        }

        const targetExt = usedMime === "image/webp" ? ".webp" : ".jpg";
        const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, targetExt), {
          type: usedMime,
          lastModified: Date.now(),
        });
        resolve(optimizedFile);
      };

      // 1차 시도 (요청된 mimeType, 기본 image/webp)
      attemptBlobGeneration(
        mimeType,
        (blob) => handleSuccess(blob, mimeType),
        () => {
          // mimeType이 webp였는데 실패한 경우 jpeg로 2차 폴백 시도
          if (mimeType === "image/webp") {
            attemptBlobGeneration(
              "image/jpeg",
              (blob) => handleSuccess(blob, "image/jpeg"),
              () => resolve(file) // 둘 다 실패 시 원본 파일로 무중단 폴백
            );
          } else {
            resolve(file);
          }
        }
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // 에러 발생 시 원본으로 graceful fallback
    };

    img.src = objectUrl;
  });
}
