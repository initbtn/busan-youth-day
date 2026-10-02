export interface BoothReview {
  id: string;
  boothId: string;
  userName: string;
  content: string;
  createdAt: string;
}

const STORAGE_PREFIX = "byd2026_booth_reviews_";

export function getBoothReviews(boothId: string): BoothReview[] {
  if (typeof window === "undefined" && typeof globalThis.localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${boothId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn(`Failed to load reviews for booth ${boothId}:`, err);
    return [];
  }
}

export function saveBoothReview(params: {
  boothId: string;
  userName: string;
  content: string;
}): BoothReview {
  const { boothId, userName, content } = params;
  const newReview: BoothReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    boothId,
    userName: userName.trim() || "익명의 순례자",
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  if (typeof window === "undefined" && typeof globalThis.localStorage === "undefined") {
    return newReview;
  }

  try {
    const existing = getBoothReviews(boothId);
    const updated = [newReview, ...existing];
    localStorage.setItem(`${STORAGE_PREFIX}${boothId}`, JSON.stringify(updated));
  } catch (err) {
    console.error(`Failed to save review for booth ${boothId}:`, err);
  }

  return newReview;
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "최근";
  }
}
