"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Camera,
  Flag,
  Sparkles,
  X,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Share2,
  Clock,
  Flame,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  isOfficialRole,
  FeedSortOrder,
  sortCommunityPosts,
  togglePostLike,
  getPostMediaUrls,
  PostComment,
  loadCachedComments,
  cacheComments,
  formatTimeAgo,
} from "@/lib/communityPosts";
import { optimizeImage, isSupportedMediaType, isVideoFile } from "@/lib/imageOptimizer";
import {
  isVideoUrl,
  compressVideoIfNeeded,
  getVideoMetadata,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
} from "@/lib/videoCompressor";
import { MediaSliderViewer } from "@/components/MediaSliderViewer";
import { signInWithKakao } from "@/lib/auth/kakao";
import { useSearchParams } from "next/navigation";

interface PostMediaCarouselProps {
  mediaUrls: string[];
  author: string;
  onOpenViewer: (mediaUrls: string[], index: number, author?: string) => void;
}

function PostMediaCarousel({ mediaUrls, author, onOpenViewer }: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (diffX > threshold) {
      setActiveIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
    } else if (diffX < -threshold) {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentMedia = mediaUrls[activeIndex] || mediaUrls[0];
  const isVideo = isVideoUrl(currentMedia);

  return (
    <div
      data-testid="post-media-thumbnail"
      onClick={() => onOpenViewer(mediaUrls, activeIndex, author)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-square sm:aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer select-none group"
    >
      {isVideo ? (
        <video
          key={currentMedia}
          src={currentMedia}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          key={currentMedia}
          src={currentMedia}
          alt={`순례 인증샷 ${activeIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
      )}

      {/* 멀티 미디어 캐러셀 화살표 네비게이션 */}
      {mediaUrls.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-xs opacity-80 group-hover:opacity-100 shadow-md z-10"
            title="이전 사진/영상"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-xs opacity-80 group-hover:opacity-100 shadow-md z-10"
            title="다음 사진/영상"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* 멀티이미지 여부 판별 및 다중 이미지 뱃지 (DoD 3 호환 & 인덱스 표시) */}
      {mediaUrls.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-md z-10">
          <Layers className="w-3.5 h-3.5" />
          <span>
            {activeIndex + 1}/{mediaUrls.length}
          </span>
        </div>
      )}

      {/* 캐러셀 하단 페이지 도트 인디케이터 */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs z-10">
          {mediaUrls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(idx);
              }}
              className={`rounded-full transition-all ${
                activeIndex === idx
                  ? "w-2.5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              }`}
              title={`${idx + 1}번째 미디어`}
            />
          ))}
        </div>
      )}

      {/* 비디오 단독 뱃지 */}
      {isVideo && (
        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs z-10">
          동영상
        </span>
      )}
    </div>
  );
}

export function CommunityFeedView() {
  const searchParams = useSearchParams();
  const targetPostId = searchParams.get("postId");
  const actionParam = searchParams.get("action");
  const { user } = useUser();
  const isKakaoSignedIn = !!(user && (user.email || user.provider === "kakao"));
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputTexts, setCommentInputTexts] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<FeedSortOrder>("latest");

  // 업로드 모달 상태 (DoD 4)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미디어 전체화면 슬라이드 뷰어 상태
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerMediaUrls, setViewerMediaUrls] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerAuthor, setViewerAuthor] = useState<string | undefined>(undefined);

  // action=write 쿼리 파라미터 처리: 글작성 모달 자동 열기
  useEffect(() => {
    if (actionParam === "write") {
      if (isKakaoSignedIn) {
        setIsUploadModalOpen(true);
      } else {
        alert("소통피드 글쓰기는 카카오 로그인이 필요합니다.");
        signInWithKakao();
      }
    }
  }, [actionParam, isKakaoSignedIn]);

  // 1. 컴포넌트 마운트 시: LocalStorage 오프라인 캐시(게시글 & 댓글) 즉시 복원 + Supabase 원격 피드 동기화
  useEffect(() => {
    const cachedPosts = loadCachedPosts();
    if (cachedPosts.length > 0) {
      setPosts(mergeCommunityPosts([], cachedPosts, INITIAL_POSTS));
    }

    const cachedComments = loadCachedComments();
    if (cachedComments && Object.keys(cachedComments).length > 0) {
      setCommentsMap(cachedComments);
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

  // 딥링크 postId 파라미터 처리: 해당 게시글로 스크롤 및 댓글 열기
  useEffect(() => {
    if (targetPostId) {
      setActiveCommentPostId(targetPostId);
      setTimeout(() => {
        const el = document.getElementById(`post-${targetPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [targetPostId]);

  // 모달 오픈 시 배경 스크롤 락 (DoD 5)
  useEffect(() => {
    if (isUploadModalOpen || reportingPost || viewerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isUploadModalOpen, reportingPost, viewerOpen]);

  const handleCloseUploadModal = React.useCallback(() => {
    if (isPosting) return;
    if (newContent.trim() || selectedFiles.length > 0) {
      if (!confirm("작성 중인 내용이 있습니다. 닫으시겠습니까?")) {
        return;
      }
    }
    setNewContent("");
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsUploadModalOpen(false);
  }, [isPosting, newContent, selectedFiles, previewUrls]);

  // 신고 모달 / 업로드 모달 ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (reportingPost) setReportingPost(null);
        if (isUploadModalOpen && !isPosting) handleCloseUploadModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reportingPost, isUploadModalOpen, isPosting, handleCloseUploadModal]);

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
        post.id === id ? togglePostLike(post) : post
      );
      cachePosts(updated);
      return updated;
    });
  };

  const handleCommentSubmit = (postId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = (commentInputTexts[postId] || "").trim();
    if (!text) return;

    const newComment: PostComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId,
      author: user?.name || "참가 청년",
      parish: user?.parish || "부산",
      role: user?.role || "청년",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setCommentsMap((prev) => {
      const list = prev[postId] || [];
      const updated = {
        ...prev,
        [postId]: [...list, newComment],
      };
      cacheComments(updated);
      return updated;
    });

    setCommentInputTexts((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    if (selectedFiles.length + rawFiles.length > 5) {
      alert("한 번에 최대 5개의 사진/동영상만 첨부할 수 있습니다.");
      return;
    }

    const newOptimizedFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of rawFiles) {
      if (!isSupportedMediaType(file.type, file.name)) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF, HEIC, MP4, MOV 등 지원)`);
        continue;
      }

      if (isVideoFile(file) && file.size > MAX_VIDEO_SIZE_BYTES) {
        alert(
          `${file.name}: 동영상 크기는 최대 ${(MAX_VIDEO_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`
        );
        continue;
      }

      if (!isVideoFile(file) && file.size > 15 * 1024 * 1024) {
        alert(`${file.name}: 사진 크기는 15MB 이하여야 합니다.`);
        continue;
      }

      try {
        if (isVideoFile(file)) {
          // 1분(60초) 이내 숏츠 재생시간 검증
          const meta = await getVideoMetadata(file);
          if (meta.duration > MAX_VIDEO_DURATION_SECONDS) {
            alert(
              `${file.name}: 동영상은 ${MAX_VIDEO_DURATION_SECONDS}초(1분) 이내의 숏츠 영상만 등록할 수 있습니다. (현재: ${Math.round(meta.duration)}초)`
            );
            continue;
          }

          const validated = await compressVideoIfNeeded(file);
          newOptimizedFiles.push(validated as File);
          newPreviews.push(URL.createObjectURL(validated));
        } else {
          const optimized = await optimizeImage(file, { maxDimension: 1920, quality: 0.85, mimeType: "image/webp" });
          newOptimizedFiles.push(optimized as File);
          newPreviews.push(URL.createObjectURL(optimized));
        }
      } catch (err) {
        console.warn("Media processing error:", err);
        const errMsg = err instanceof Error ? err.message : "미디어 처리 중 오류가 발생했습니다.";
        if (errMsg.includes("숏츠") || errMsg.includes("MB")) {
          alert(`${file.name}: ${errMsg}`);
          continue;
        }
        newOptimizedFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setSelectedFiles((prev) => [...prev, ...newOptimizedFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openViewer = (mediaUrls: string[], initialIdx = 0, author?: string) => {
    if (!mediaUrls || mediaUrls.length === 0) return;
    setViewerMediaUrls(mediaUrls);
    setViewerIndex(initialIdx);
    setViewerAuthor(author);
    setViewerOpen(true);
  };

  const handleSharePost = async (post: CommunityPost) => {
    const shareData = {
      title: "2026 BYD 소통 피드",
      text: `[2026 BYD] ${post.author}님의 순례 이야기: "${post.content.slice(0, 60)}..."`,
      url: typeof window !== "undefined" ? window.location.href : "https://busan-youth-day.vercel.app",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Navigator share failed:", err);
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("게시글 공유 링크가 클립보드에 복사되었습니다! 📋");
      } catch (err) {
        console.warn("Clipboard copy failed:", err);
        alert("링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKakaoSignedIn) {
      alert("소통피드 글쓰기는 카카오 로그인이 필요합니다.");
      signInWithKakao();
      return;
    }
    if (!newContent.trim()) return;

    setIsPosting(true);
    const uploadedUrls: string[] = [];

    // Cloudflare R2 멀티 파일 순차/병렬 업로드
    if (selectedFiles.length > 0) {
      try {
        for (const file of selectedFiles) {
          const presignedRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type || "application/octet-stream",
            }),
          });

          if (!presignedRes.ok) {
            throw new Error(`Presigned URL 발급 실패 (${file.name})`);
          }

          const { uploadUrl, publicUrl } = await presignedRes.json();
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error(`스토리지 전송 실패 (${file.name})`);
          }

          uploadedUrls.push(publicUrl);
        }
      } catch (err) {
        console.error("Media upload failed:", err);
        alert("사진/동영상 업로드 중 오류가 발생했습니다. 네트워크 상태를 확인 후 다시 시도해 주세요.");
        setIsPosting(false);
        return;
      }
    }

    const newPost = createPostPayload({
      author: user?.name || "참가 청년",
      parish: user?.parish || "하단",
      role: user?.role || "청년",
      content: newContent,
      imageUrl: uploadedUrls[0],
      mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      userId: user?.id,
    });

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    cachePosts(nextPosts);

    setNewContent("");
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsPosting(false);
    setIsUploadModalOpen(false);

    try {
      const supabase = createClient();
      await syncPostToSupabase(supabase, newPost);
    } catch (err) {
      console.warn("Background Supabase sync deferred:", err);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 상단 해시태그 & 배너 + 새 게시물 작성 버튼 */}
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
              청년의 날 은혜로운 여정을 인스타그램 피드로 함께 나눠요.
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

        {/* 상단 액션: 글쓰기 모달 트리거 버튼 */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
          <span className="text-xs text-blue-100">
            {isKakaoSignedIn ? `${user?.name || "참가자"}님, 지금 축제 순간을 기록해보세요!` : "로그인하고 축제 인증샷을 남겨보세요!"}
          </span>
          <button
            type="button"
            onClick={() => {
              if (!isKakaoSignedIn) {
                alert("소통피드 글쓰기는 카카오 로그인이 필요합니다.");
                signInWithKakao();
                return;
              }
              setIsUploadModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>새 게시물 작성</span>
          </button>
        </div>
      </div>

      {/* 정렬 필터 탭 (Latest vs Popular) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setSortOrder("latest")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sortOrder === "latest"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>최신순 [Latest]</span>
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("popular")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sortOrder === "popular"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>인기순 [Popular]</span>
          </button>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          총 {posts.length}건
        </span>
      </div>

      {/* 피드 목록 (인스타그램 카드 스타일) */}
      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-2">
            <p className="font-bold text-slate-700">등록된 소통피드 게시물이 없습니다.</p>
            <p className="text-[11px] text-slate-400">
              상단의 &apos;+ 새 게시물 작성&apos; 버튼을 눌러 첫 번째 축제 소식을 전해보세요!
            </p>
          </div>
        ) : (
          sortCommunityPosts(posts, sortOrder).map((post) => {
            const mediaList = getPostMediaUrls(post);
            const postComments = commentsMap[post.id] || [];
            const isCommentsOpen = activeCommentPostId === post.id;
            const currentCommentText = commentInputTexts[post.id] || "";

          return (
            <article
              key={post.id}
              id={`post-${post.id}`}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* 1. 인스타그램 프로필 헤더 */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-xs">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-800">
                      {post.author[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 flex-wrap">
                      <span>{post.author}</span>
                      {(post.isOfficial || isOfficialRole(post.role)) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldCheck className="w-3 h-3 mr-0.5 text-amber-600" />
                          인증
                        </span>
                      )}
                      <span className="text-[10px] font-normal text-slate-400">· {post.timeAgo || formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">
                      {post.parish ? `${post.parish}성당` : "부산교구"} · {post.role}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingPost(post)}
                  className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                  title="게시글 신고"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* 2. 미디어 렌더링: 이미지·영상 캐러셀 (DoD 3 & 캐러셀) */}
              {mediaList.length > 0 && (
                <PostMediaCarousel
                  mediaUrls={mediaList}
                  author={post.author}
                  onOpenViewer={openViewer}
                />
              )}

              {/* 3. 인스타그램 액션 바 (하트 좋아요, 말풍선 댓글, 공유) */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      data-testid="like-button"
                      data-post-id={post.id}
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition-transform active:scale-90 ${
                        post.isLiked ? "text-rose-600" : "text-slate-700 hover:text-rose-600"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                      <span data-testid="like-count" className="font-bold">{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCommentPostId((cur) => (cur === post.id ? null : post.id))}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-bold">{postComments.length}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSharePost(post)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="게시글 공유"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 본문 텍스트 */}
                <div className="text-xs text-slate-800 leading-relaxed space-x-1.5">
                  <span className="font-bold text-slate-900">{post.author}</span>
                  <span className="whitespace-pre-wrap">{post.content}</span>
                </div>

                {/* 4. 댓글 섹션 (DoD 4) */}
                <div className="pt-2 border-t border-slate-50 space-y-2">
                  {/* 댓글 미리보기 및 펼쳐보기 */}
                  {postComments.length > 0 && (
                    <div className="space-y-1.5">
                      {!isCommentsOpen && postComments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setActiveCommentPostId(post.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                        >
                          댓글 {postComments.length}개 모두 보기
                        </button>
                      )}

                      {(isCommentsOpen ? postComments : postComments.slice(-2)).map((c) => (
                        <div key={c.id} className="text-xs text-slate-700 flex items-start space-x-1.5 leading-snug">
                          <span className="font-bold text-slate-900 shrink-0">{c.author}:</span>
                          <span className="text-slate-700 break-all">{c.content}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-auto">
                            {formatTimeAgo(c.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 인라인 댓글 작성 폼 */}
                  <form
                    onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    className="flex items-center space-x-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="댓글 달기..."
                      value={currentCommentText}
                      onChange={(e) =>
                        setCommentInputTexts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      className="flex-1 text-xs px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!currentCommentText.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full text-xs font-bold transition-all shrink-0"
                    >
                      게시
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        }))}
      </div>

      {/* 새 게시글 작성 모달 다이얼로그 (DoD 4 & DoD 5) */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPosting) {
              handleCloseUploadModal();
            }
          }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">✨</span>
                <h3 className="font-bold text-sm text-slate-900">새 게시물 작성</h3>
              </div>
              <button
                type="button"
                disabled={isPosting}
                onClick={handleCloseUploadModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || "P"}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {user?.name || "참가자"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {user?.parish ? `${user.parish}성당` : "부산교구"} · {user?.saintGroup ? `${user.saintGroup} · ` : ""}{user?.role || "청년"}
                  </div>
                </div>
              </div>

              <textarea
                rows={4}
                placeholder="청년의 날 은혜로운 순간이나 응원 한마디를 남겨보세요..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {/* 첨부된 미디어 미리보기 */}
              {previewUrls.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>첨부된 미디어 ({previewUrls.length}/5)</span>
                    <button
                      type="button"
                      onClick={() => {
                        previewUrls.forEach((url) => URL.revokeObjectURL(url));
                        setSelectedFiles([]);
                        setPreviewUrls([]);
                      }}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      전체 취소
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {previewUrls.map((url, idx) => {
                      const file = selectedFiles[idx];
                      const isVideo = file ? isVideoFile(file) : isVideoUrl(url);

                      return (
                        <div
                          key={`${url}-${idx}`}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group"
                        >
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={url} alt={`미리보기 ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                          {isVideo && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 text-white">
                              동영상
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors shadow-sm"
                            title="삭제"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  data-testid="media-file-input"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold bg-blue-50 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>사진·동영상 첨부 {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isPosting}
                    onClick={handleCloseUploadModal}
                    className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all"
                  >
                    취소
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 게시글 신고 다이얼로그 모달 */}
      {reportingPost && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportingPost(null);
          }}
        >
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">게시글 신고</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              &apos;{reportingPost.author}&apos; 님의 게시글을 부적절한 콘텐츠(비방, 스팸, 혐오 표현 등)로 신고하시겠습니까?
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setReportingPost(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("신고가 정상 접수되었습니다. 운영진 검토 후 조치됩니다.");
                  setReportingPost(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                신고 접수
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전체화면 확대 슬라이드 뷰어 */}
      <MediaSliderViewer
        isOpen={viewerOpen}
        mediaUrls={viewerMediaUrls}
        initialIndex={viewerIndex}
        authorName={viewerAuthor}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
