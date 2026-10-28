import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CreatePostPayload {
  id?: string;
  author?: string;
  parish?: string;
  role?: string;
  content: string;
  imageUrl?: string | null;
  mediaUrls?: string[] | null;
  likes?: number;
  createdAt?: string;
  userId?: string;
}

/**
 * GET /api/posts — 게시글 목록 조회 (Next.js BFF 게이트웨이)
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase GET /api/posts error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err) {
    console.error("Exception in GET /api/posts:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/posts — 신규 게시글 등록 (Next.js BFF 게이트웨이)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body: CreatePostPayload = await request.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      content: body.content.trim(),
      image_url: body.imageUrl || null,
      author: body.author || "순례자",
      parish: body.parish || "부산",
      role: body.role || "청년",
      likes: typeof body.likes === "number" ? body.likes : 1,
      created_at: body.createdAt || new Date().toISOString(),
    };

    if (body.id) {
      payload.id = body.id;
    }

    if (Array.isArray(body.mediaUrls) && body.mediaUrls.length > 0) {
      payload.media_urls = body.mediaUrls;
    }

    // 서버 인증 세션의 user.id를 최우선 바인딩 (BFF 보안 원칙)
    const effectiveUserId = user?.id || body.userId;
    if (effectiveUserId) {
      payload.user_id = effectiveUserId;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([payload])
      .select();

    if (error) {
      console.warn("Supabase POST /api/posts error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data?.[0], userId: effectiveUserId });
  } catch (err) {
    console.error("Exception in POST /api/posts:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
