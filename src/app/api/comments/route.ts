import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CreateCommentPayload {
  id?: string;
  postId: string;
  content: string;
  author?: string;
  parish?: string;
  role?: string;
  userId?: string;
  createdAt?: string;
}

/**
 * GET /api/comments — 댓글 목록 조회 (Next.js BFF 게이트웨이)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    let query = supabase.from("comments").select("*").order("created_at", { ascending: true });
    if (postId) {
      query = query.eq("post_id", postId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase GET /api/comments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // post_id 별로 묶어서 반환 (클라이언트 commentsMap 구조와 일치)
    const commentsMap: Record<string, unknown[]> = {};
    if (Array.isArray(data)) {
      data.forEach((row) => {
        const pId = row.post_id;
        if (!commentsMap[pId]) commentsMap[pId] = [];
        commentsMap[pId].push({
          id: row.id,
          postId: row.post_id,
          userId: row.user_id,
          author: row.author,
          parish: row.parish,
          role: row.role,
          content: row.content,
          createdAt: row.created_at,
        });
      });
    }

    return NextResponse.json({ commentsMap });
  } catch (err) {
    console.error("Exception in GET /api/comments:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/comments — 댓글 작성 (Next.js BFF 게이트웨이)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body: CreateCommentPayload = await request.json();

    if (!body.postId || !body.content || !body.content.trim()) {
      return NextResponse.json({ error: "postId and content are required" }, { status: 400 });
    }

    const effectiveUserId = user?.id || body.userId;

    const payload: Record<string, unknown> = {
      post_id: body.postId,
      content: body.content.trim(),
      author: body.author || "순례자",
      parish: body.parish || "부산",
      role: body.role || "청년",
      created_at: body.createdAt || new Date().toISOString(),
    };

    if (body.id) {
      payload.id = body.id;
    }
    if (effectiveUserId) {
      payload.user_id = effectiveUserId;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert([payload])
      .select();

    if (error) {
      console.warn("Supabase POST /api/comments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment: data?.[0], userId: effectiveUserId });
  } catch (err) {
    console.error("Exception in POST /api/comments:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/comments — 댓글 삭제 (Next.js BFF 게이트웨이)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json({ error: "Comment id query parameter is required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.warn(`Supabase DELETE /api/comments?id=${commentId} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Exception in DELETE /api/comments:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
