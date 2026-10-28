import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface UpdatePostPayload {
  content?: string;
  imageUrl?: string | null;
  mediaUrls?: string[] | null;
  likes?: number;
}

/**
 * PATCH /api/posts/[id] — 게시글 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const supabase = createClient();
    const body: UpdatePostPayload = await request.json();

    const payload: Record<string, unknown> = {};
    if (typeof body.content === "string") {
      payload.content = body.content.trim();
    }
    if (body.imageUrl !== undefined) {
      payload.image_url = body.imageUrl;
    }
    if (body.mediaUrls !== undefined) {
      payload.media_urls = body.mediaUrls;
    }
    if (typeof body.likes === "number") {
      payload.likes = body.likes;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId)
      .select();

    if (error) {
      console.warn(`Supabase PATCH /api/posts/${postId} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data?.[0] });
  } catch (err) {
    console.error("Exception in PATCH /api/posts/[id]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id] — 게시글 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.warn(`Supabase DELETE /api/posts/${postId} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Exception in DELETE /api/posts/[id]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
