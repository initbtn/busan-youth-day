export interface CommunityPost {
  id: string;
  author: string;
  parish: string;
  role: string;
  content: string;
  imageUrl?: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  createdAt?: string;
  userId?: string;
  isOfficial?: boolean;
}

const OFFICIAL_ROLES = new Set(["사제", "수도자", "학사님", "신부님", "수녀님"]);

export function isOfficialRole(role?: string): boolean {
  if (!role) return false;
  return OFFICIAL_ROLES.has(role.trim());
}

export type FeedSortOrder = "latest" | "popular";

export function sortCommunityPosts(posts: CommunityPost[], sortOrder: FeedSortOrder): CommunityPost[] {
  return [...posts].sort((a, b) => {
    if (sortOrder === "popular") {
      const likesDiff = (b.likes || 0) - (a.likes || 0);
      if (likesDiff !== 0) return likesDiff;
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

export const COMMUNITY_POSTS_STORAGE_KEY = "byd2026_community_posts";

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "p-1",
    author: "김마리아",
    parish: "하단",
    role: "청년",
    content: "오늘 청년의 날 축제 너무 감동적입니다! 지성소 성체조배에서 큰 은혜 받고 가요 🕊️ #2026BYD #청년축제",
    imageUrl: "/assets/yd2027_official_prayer_image.webp",
    likes: 24,
    timeAgo: "10분 전",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "p-2",
    author: "박요셉",
    parish: "남천",
    role: "교리교사",
    content: "우리 남천지구 친구들과 4대 테마존 스탬프 9개 완료했습니다! 쭈양이 굿즈 수령하러 갑니다 ㅎㅎ 🐑",
    imageUrl: "/assets/byd2026_combined_final_vibe_mockup.webp",
    likes: 18,
    timeAgo: "25분 전",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "p-3",
    author: "이베드로",
    parish: "복산",
    role: "청년",
    content: "스포원파크 날씨 최고입니다! 신부님, 수녀님들과 함께 찬양 부르는 중입니다.",
    likes: 31,
    timeAgo: "1시간 전",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "방금 전";
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSec = Math.floor((now - date) / 1000);

  if (isNaN(diffSec) || diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function loadCachedPosts(): CommunityPost[] {
  if (typeof window === "undefined" && typeof globalThis.localStorage === "undefined") {
    return [];
  }
  try {
    const raw = globalThis.localStorage.getItem(COMMUNITY_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    // blob: URL은 일시적인 브라우저 메모리 주소이므로 복원 시 제거 (엑스박스 방어)
    return list.map((post) => {
      if (post.imageUrl && post.imageUrl.startsWith("blob:")) {
        const cleaned = { ...post };
        delete cleaned.imageUrl;
        return cleaned;
      }
      return post;
    });
  } catch (err) {
    console.warn("Failed to load cached posts from localStorage:", err);
    return [];
  }
}

export function cachePosts(posts: CommunityPost[]): void {
  if (typeof window === "undefined" && typeof globalThis.localStorage === "undefined") {
    return;
  }
  try {
    globalThis.localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.warn("Failed to cache posts to localStorage:", err);
  }
}

export interface CreatePostParams {
  author?: string;
  parish?: string;
  role?: string;
  content: string;
  imageUrl?: string;
  userId?: string;
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createPostPayload(params: CreatePostParams): CommunityPost {
  // blob: URL은 브라우저 탭 세션에만 유효한 임시 주소이므로 영구 저장 차단
  const sanitizedImageUrl =
    params.imageUrl && !params.imageUrl.startsWith("blob:") ? params.imageUrl : undefined;

  return {
    id: generateUuid(),
    author: params.author || "순례자",
    parish: params.parish || "부산",
    role: params.role || "청년",
    content: params.content,
    imageUrl: sanitizedImageUrl,
    likes: 1,
    timeAgo: "방금 전",
    isLiked: true,
    createdAt: new Date().toISOString(),
    userId: params.userId,
    isOfficial: isOfficialRole(params.role),
  };
}

export interface SupabasePostRow {
  id: string;
  user_id?: string | null;
  author?: string | null;
  parish?: string | null;
  role?: string | null;
  content: string;
  image_url?: string | null;
  likes?: number | null;
  is_approved?: boolean | null;
  created_at?: string | null;
}

export interface SupabaseSyncResult {
  success: boolean;
  data?: unknown;
  error?: unknown;
}

export async function syncPostToSupabase(
  supabaseClient: unknown,
  post: CommunityPost
): Promise<SupabaseSyncResult> {
  if (!supabaseClient || typeof supabaseClient !== "object") {
    return { success: false, error: "Supabase client not provided" };
  }

  try {
    const payload: Record<string, string | number | null | undefined> = {
      content: post.content,
      image_url: post.imageUrl || null,
      author: post.author,
      parish: post.parish,
      role: post.role,
      likes: post.likes || 1,
      created_at: post.createdAt || new Date().toISOString(),
    };

    if (post.id) {
      payload.id = post.id;
    }
    if (isValidUuid(post.userId)) {
      payload.user_id = post.userId;
    }

    const client = supabaseClient as {
      from: (table: string) => {
        insert: (data: unknown[]) => {
          select?: () => Promise<{ data: unknown; error: unknown }>;
          then?: Promise<{ data: unknown; error: unknown }>["then"];
        };
      };
    };

    const insertObj = client.from("posts").insert([payload]);
    const { data, error } =
      typeof insertObj?.select === "function"
        ? await insertObj.select()
        : await (insertObj as PromiseLike<{ data: unknown; error: unknown }>);

    if (error) {
      console.warn("Supabase posts insert error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.warn("Supabase posts sync exception:", err);
    return { success: false, error: err };
  }
}

export async function fetchPostsFromSupabase(supabaseClient: unknown): Promise<CommunityPost[]> {
  if (!supabaseClient || typeof supabaseClient !== "object") return [];

  try {
    const client = supabaseClient as {
      from: (table: string) => {
        select: (cols: string) => {
          order: (
            col: string,
            opts: { ascending: boolean }
          ) => Promise<{ data: SupabasePostRow[] | null; error: unknown }>;
        };
      };
    };

    const { data, error } = await client
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      console.warn("Failed to fetch posts from Supabase:", error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      author: row.author || "순례자",
      parish: row.parish || "부산",
      role: row.role || "청년",
      content: row.content,
      imageUrl: row.image_url || undefined,
      likes: typeof row.likes === "number" ? row.likes : 0,
      timeAgo: formatTimeAgo(row.created_at || undefined),
      createdAt: row.created_at || undefined,
      userId: row.user_id || undefined,
      isLiked: false,
    }));
  } catch (err) {
    console.warn("Exception during fetchPostsFromSupabase:", err);
    return [];
  }
}

export function mergeCommunityPosts(
  remotePosts: CommunityPost[],
  localPosts: CommunityPost[],
  initialFallback: CommunityPost[] = INITIAL_POSTS
): CommunityPost[] {
  const map = new Map<string, CommunityPost>();

  // 1. Initial 기본 게시글 등록
  initialFallback.forEach((p) => map.set(p.id, p));

  // 2. 로컬 캐시 게시글 등록 (사용자가 오프라인/최근 작성한 것)
  localPosts.forEach((p) => map.set(p.id, p));

  // 3. Supabase 원격 게시글 등록 (원격이 최신 신뢰 정본)
  remotePosts.forEach((p) => {
    const existing = map.get(p.id);
    map.set(p.id, {
      ...p,
      // 로컬 좋아요 상태 보존
      isLiked: existing?.isLiked ?? p.isLiked,
    });
  });

  const all = Array.from(map.values());

  // 최신 생성일(createdAt) 기준 내림차순 정렬
  all.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return all;
}
