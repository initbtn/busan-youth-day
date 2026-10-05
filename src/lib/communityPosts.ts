export interface CommunityPost {
  id: string;
  author: string;
  parish: string;
  role: string;
  content: string;
  imageUrl?: string;
  mediaUrls?: string[];
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  createdAt?: string;
  userId?: string;
  isOfficial?: boolean;
}

export function getPostMediaUrls(post: Partial<CommunityPost>): string[] {
  if (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
    return post.mediaUrls;
  }
  if (post.imageUrl) {
    return [post.imageUrl];
  }
  return [];
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

export const INITIAL_POSTS: CommunityPost[] = [];

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
      let cleaned = post;
      if (post.imageUrl && post.imageUrl.startsWith("blob:")) {
        cleaned = { ...cleaned };
        delete cleaned.imageUrl;
      }
      if (Array.isArray(cleaned.mediaUrls)) {
        const filtered = cleaned.mediaUrls.filter((u: string) => typeof u === "string" && !u.startsWith("blob:"));
        if (filtered.length !== cleaned.mediaUrls.length) {
          cleaned = { ...cleaned, mediaUrls: filtered };
        }
      }
      return cleaned;
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
  mediaUrls?: string[];
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
  const sanitizedMediaUrls = Array.isArray(params.mediaUrls)
    ? params.mediaUrls.filter((u) => typeof u === "string" && !u.startsWith("blob:"))
    : sanitizedImageUrl
      ? [sanitizedImageUrl]
      : undefined;

  return {
    id: generateUuid(),
    author: params.author || "순례자",
    parish: params.parish || "부산",
    role: params.role || "청년",
    content: params.content,
    imageUrl: sanitizedImageUrl || (sanitizedMediaUrls && sanitizedMediaUrls.length > 0 ? sanitizedMediaUrls[0] : undefined),
    mediaUrls: sanitizedMediaUrls,
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
  media_urls?: string[] | null;
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
    const payload: Record<string, string | number | string[] | null | undefined> = {
      content: post.content,
      image_url: post.imageUrl || null,
      author: post.author,
      parish: post.parish,
      role: post.role,
      likes: post.likes || 1,
      created_at: post.createdAt || new Date().toISOString(),
    };

    // 1장짜리는 image_url 만으로 충분하다 — media_urls 컬럼 마이그레이션 전에 배포돼도 일반 글은 저장된다.
    const mediaUrls = getPostMediaUrls(post);
    if (mediaUrls.length > 1) {
      payload.media_urls = mediaUrls;
    }

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
      mediaUrls:
        Array.isArray(row.media_urls) && row.media_urls.length > 0 ? row.media_urls : undefined,
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

export function togglePostLike(post: CommunityPost): CommunityPost {
  const willLike = !post.isLiked;
  const currentLikes = typeof post.likes === "number" ? post.likes : 0;
  const nextLikes = willLike ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  return {
    ...post,
    isLiked: willLike,
    likes: nextLikes,
  };
}

export function mergeCommunityPosts(
  remotePosts: CommunityPost[],
  localPosts: CommunityPost[],
  initialFallback: CommunityPost[] = INITIAL_POSTS
): CommunityPost[] {
  // 로컬 캐시 맵 (사용자가 상호작용하거나 오프라인에서 작성한 게시글)
  const localMap = new Map<string, CommunityPost>();
  localPosts.forEach((p) => localMap.set(p.id, p));

  const map = new Map<string, CommunityPost>();

  // 1. Initial 기본 게시글 등록
  initialFallback.forEach((p) => map.set(p.id, p));

  // 2. 로컬 캐시 게시글 등록 (사용자가 오프라인/최근 작성 및 좋아요 토글한 것)
  localPosts.forEach((p) => map.set(p.id, p));

  // 3. Supabase 원격 게시글 등록
  remotePosts.forEach((p) => {
    const local = localMap.get(p.id);
    let resolvedLikes = typeof p.likes === "number" ? p.likes : 0;
    let resolvedIsLiked = p.isLiked ?? false;

    // 사용자의 로컬 상호작용/캐시가 있는 경우에만 로컬 수치 및 상태 보존
    if (local) {
      if (typeof local.isLiked === "boolean") {
        resolvedIsLiked = local.isLiked;
      }
      if (typeof local.likes === "number") {
        resolvedLikes = Math.max(0, local.likes);
      }
    }

    map.set(p.id, {
      ...p,
      likes: resolvedLikes,
      isLiked: resolvedIsLiked,
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

export interface PostComment {
  id: string;
  postId: string;
  author: string;
  parish: string;
  role: string;
  content: string;
  createdAt: string;
}

export const POST_COMMENTS_STORAGE_KEY = "byd2026_post_comments";

export function loadCachedComments(): Record<string, PostComment[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(POST_COMMENTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load cached comments:", err);
    return {};
  }
}

export function cacheComments(comments: Record<string, PostComment[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POST_COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  } catch (err) {
    console.warn("Failed to cache comments:", err);
  }
}

/**
 * 특정 작성자명 또는 사용자 ID에 해당하는 내 게시글 목록 조회
 */
export function getPostsByAuthorOrUser(
  posts: CommunityPost[],
  userId?: string,
  authorName?: string
): CommunityPost[] {
  return posts.filter((p) => {
    if (userId && p.userId && p.userId === userId) {
      return true;
    }
    if (authorName && p.author === authorName) {
      return true;
    }
    return false;
  });
}

/**
 * 게시글 본문 및 미디어 수정
 */
export function updateCommunityPost(
  posts: CommunityPost[],
  postId: string,
  changes: Partial<Pick<CommunityPost, "content" | "imageUrl" | "mediaUrls">>
): CommunityPost[] {
  return posts.map((p) => {
    if (p.id !== postId) return p;
    const updatedMediaUrls = changes.mediaUrls !== undefined ? changes.mediaUrls : p.mediaUrls;
    const updatedImageUrl =
      changes.imageUrl !== undefined
        ? changes.imageUrl
        : updatedMediaUrls && updatedMediaUrls.length > 0
          ? updatedMediaUrls[0]
          : p.imageUrl;

    return {
      ...p,
      ...changes,
      imageUrl: updatedImageUrl,
      mediaUrls: updatedMediaUrls,
    };
  });
}

/**
 * 게시글 삭제
 */
export function deleteCommunityPost(
  posts: CommunityPost[],
  postId: string
): CommunityPost[] {
  return posts.filter((p) => p.id !== postId);
}

/**
 * 사용자가 작성한 댓글 목록 전체 조회 (게시글 ID 포함)
 */
export function getMyComments(
  commentsMap: Record<string, PostComment[]>,
  authorName: string
): PostComment[] {
  if (!commentsMap || !authorName) return [];
  const results: PostComment[] = [];

  Object.values(commentsMap).forEach((comments) => {
    if (Array.isArray(comments)) {
      comments.forEach((c) => {
        if (c.author === authorName) {
          results.push(c);
        }
      });
    }
  });

  // 최신 작성순 정렬
  results.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return results;
}

