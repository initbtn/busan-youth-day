"use client";

import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageSquare, Camera, Flag, Sparkles, X, Upload, RefreshCw } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";
import {
  CommunityPost,
  INITIAL_POSTS,
  loadCachedPosts,
  cachePosts,
  createPostPayload,
  syncPostToSupabase,
  fetchPostsFromSupabase,
  mergeCommunityPosts,
} from "@/lib/communityPosts";

export function CommunityFeedView() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newContent, setNewContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 컴포넌트 마운트 시: LocalStorage 오프라인 캐시 즉시 복원 + Supabase 원격 피드 동기화
  useEffect(() => {
    const cached = loadCachedPosts();
    if (cached.length > 0) {
      setPosts(mergeCommunityPosts([], cached, INITIAL_POSTS));
    }

    const syncWithSupabase = async () => {
      try {
        const supabase = createClient();
        const remote = await fetchPostsFromSupabase(supabase);
        if (remote.length > 0) {
          setPosts((current) => {
            const merged = mergeCommunityPosts(remote, current, INITIAL_POSTS);
            cachePosts(merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn("Supabase initial sync skipped (using cached/fallback):", err);
      }
    };

    syncWithSupabase();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const remote = await fetchPostsFromSupabase(supabase);
      const cached = loadCachedPosts();
      const merged = mergeCommunityPosts(remote, cached, INITIAL_POSTS);
      setPosts(merged);
      cachePosts(merged);
    } catch (err) {
      console.warn("Manual refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLike = (id: string) => {
    setPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      );
      cachePosts(updated);
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 최대 10MB 검증
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsPosting(true);
    let uploadedImageUrl = previewUrl || undefined;

    // Cloudflare R2 업로드 API 시도
    if (selectedFile) {
      try {
        const presignedRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type,
          }),
        });

        if (presignedRes.ok) {
          const { uploadUrl, publicUrl } = await presignedRes.json();
          // S3 직업로드
          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFile.type },
            body: selectedFile,
          });
          // R2 영구 CDN URL 연결
          uploadedImageUrl = publicUrl;
        }
      } catch (err) {
        console.warn("R2 upload fallback to preview", err);
      }
    }

    // 새 게시글 객체 생성 (UUID, 시간, 유저 메타데이터 포함)
    const newPost = createPostPayload({
      author: user?.name || "익명의 순례자",
      parish: user?.parish || "하단",
      role: user?.role || "청년",
      content: newContent,
      imageUrl: uploadedImageUrl,
      userId: user?.id,
    });

    // 낙관적 UI 업데이트 및 LocalStorage 영구 보존
    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    cachePosts(nextPosts);

    setNewContent("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPosting(false);

    // Supabase posts 테이블에 비동기 영구 저장 (백그라운드 동기화)
    try {
      const supabase = createClient();
      await syncPostToSupabase(supabase, newPost);
    } catch (err) {
      console.warn("Background Supabase sync deferred:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 해시태그 & 배너 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                인증샷 & 실시간 피드
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">#2026BYD</h2>
            <p className="text-xs text-blue-100/90 mt-0.5">
              순례 여정의 순간을 인스타그램 스타일 피드로 함께 나눠요.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition-all text-white/90 hover:text-white"
              title="피드 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="text-3xl">📸</div>
          </div>
        </div>
      </div>

      {/* 새 방명록 / 게시글 작성 폼 */}
      <form
        onSubmit={handleCreatePost}
        className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {user?.name?.[0] || "P"}
          </span>
          <span>
            {user?.name || "순례자"} ({user?.parish || "부산"}성당 / {user?.role || "청년"})
          </span>
        </div>

        <textarea
          rows={2}
          placeholder="청년의 날 은혜로운 순간이나 응원 한마디를 남겨보세요..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {/* 선택한 이미지 미리보기 */}
        {previewUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200">
            <img src={previewUrl} alt="선택한 사진 미리보기" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>사진 첨부</span>
          </button>

          <button
            type="submit"
            disabled={isPosting || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isPosting ? "업로드 중..." : "게시하기"}</span>
          </button>
        </div>
      </form>

      {/* 피드 목록 (기획서 Page 10 - 인스타그램 피드 스타일) */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* 작성자 정보 헤더 */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {post.author[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>{post.author}</span>
                    <span className="text-[10px] font-normal text-slate-400">· {post.timeAgo}</span>
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">
                    {post.parish}성당 · {post.role}
                  </div>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 이미지 (선택) */}
            {post.imageUrl && (
              <div className="relative w-full aspect-video bg-slate-100">
                <img
                  src={post.imageUrl}
                  alt="순례 인증샷"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 본문 및 인터랙션 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center space-x-4 text-slate-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 text-xs font-semibold transition-colors ${
                    post.isLiked ? "text-rose-600" : "hover:text-rose-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-600" : ""}`} />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>소통</span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-800 font-normal">
                {post.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
