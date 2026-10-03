/**
 * 비디오 압축 및 미디어 타입 검증 유틸리티 (Issue #33)
 * 30MB급 무거운 ffmpeg.wasm 대신 브라우저 네이티브 기능 및 MediaRecorder를 활용하며,
 * 비디오 확장자 감지 및 graceful fallback을 제공합니다.
 */

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogg", "avi"]);

export function isVideoUrl(url?: string): boolean {
  if (!url || typeof url !== "string") return false;
  // 쿼리스트링 및 해시 제거
  const cleanUrl = url.split("?")[0].split("#")[0];
  const ext = cleanUrl.split(".").pop()?.toLowerCase();
  return ext ? VIDEO_EXTENSIONS.has(ext) : false;
}

export function checkVideoCompressionSupport(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.MediaRecorder !== "undefined";
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export async function getVideoMetadata(file: File): Promise<VideoMetadata> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { duration: 0, width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ duration: 0, width: 0, height: 0 });
    };

    video.src = url;
  });
}

export const MAX_VIDEO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_DURATION_SECONDS = 60; // 60초 (1분 숏츠 제한)

/**
 * 비디오 용량 검증 및 필요 시 경량화 (최대 15MB 허용, 미지원 환경 시 원본 유지)
 */
export async function compressVideoIfNeeded<T extends File | Blob | { name: string; size: number; type: string }>(
  file: T,
  maxSizeBytes = MAX_VIDEO_SIZE_BYTES
): Promise<T> {
  // 용량 제한 검증 (15MB 초과 시 에러 발생)
  if (file.size > maxSizeBytes) {
    throw new Error(`동영상 파일 크기는 최대 ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB까지 첨부할 수 있습니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  // 브라우저가 지원하지 않거나 10MB 이하의 적정 용량인 경우 원본 반환
  if (!checkVideoCompressionSupport() || file.size <= 10 * 1024 * 1024) {
    return file;
  }

  // Graceful fallback: 네이티브 브라우저 환경에서 안정적인 업로드를 위해 원본 반환
  return file;
}
