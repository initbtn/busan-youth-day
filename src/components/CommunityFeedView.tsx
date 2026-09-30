"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Camera, Flag, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface CommunityPost {
  id: string;
  author: string;
  parish: string;
  role: string;
  content: string;
  imageUrl?: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "p-1",
    author: "김마리아",
    parish: "하단",
    role: "청년",
    content: "오늘 청년의 날 축제 너무 감동적입니다! 지성소 성체조배에서 큰 은혜 받고 가요 🕊️ #2026BYD #청년축제",
    imageUrl: "/assets/yd2027_official_prayer_image.webp",
    likes: 24,
    timeAgo: "10분 전",
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
  },
  {
    id: "p-3",
    author: "이베드로",
    parish: "복산",
    role: "청년",
    content: "스포원파크 날씨 최고입니다! 신부님, 수녀님들과 함께 찬양 부르는 중입니다.",
    likes: 31,
    timeAgo: "1시간 전",
  },
];

export function CommunityFeedView() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsPosting(true);
    const newPost: CommunityPost = {
      id: "post-" + Date.now(),
      author: user?.name || "익명의 순례자",
      parish: user?.parish || "하단",
      role: user?.role || "청년",
      content: newContent,
      likes: 1,
      timeAgo: "방금 전",
      isLiked: true,
    };

    setTimeout(() => {
      setPosts([newPost, ...posts]);
      setNewContent("");
      setIsPosting(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 상단 해시태그 & 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-5 shadow-sm">
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
          <div className="text-3xl">📸</div>
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

        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center space-x-1 text-slate-400 text-xs">
            <Camera className="w-4 h-4" />
            <span className="text-[11px]">Cloudflare R2 스토리지 연동 준비</span>
          </div>

          <button
            type="submit"
            disabled={isPosting || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            {isPosting ? "등록 중..." : "게시하기"}
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
                <Image
                  src={post.imageUrl}
                  alt="순례 인증샷"
                  fill
                  className="object-cover"
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
