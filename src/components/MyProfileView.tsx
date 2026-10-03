"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  Edit3,
  Trash2,
  MessageSquare,
  Users,
  Save,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Heart,
} from "lucide-react";
import { useUser, UserProfile } from "@/context/UserContext";
import {
  CommunityPost,
  loadCachedPosts,
  cachePosts,
  loadCachedComments,
  PostComment,
  getPostsByAuthorOrUser,
  updateCommunityPost,
  deleteCommunityPost,
  getMyComments,
  getPostMediaUrls,
  formatTimeAgo,
} from "@/lib/communityPosts";
import { getYouthGroupMembers } from "@/data/youthGroupMembers";
import { getPilgrimSaintById, PILGRIM_SAINTS } from "@/data/saints";
import { DISTRICT_PARISH_MAP, AFFILIATION_ROLES, AffiliationRole } from "@/data/parishes";
import { optimizeImage } from "@/lib/imageOptimizer";

type ActiveTab = "profile" | "group" | "my_posts" | "my_comments";

export function MyProfileView() {
  const router = useRouter();
  const { user, setUserProfile } = useUser();

  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // 프로필 편집 폼 상태
  const [name, setName] = useState(user?.name || "");
  const [baptismalName, setBaptismalName] = useState(user?.baptismalName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || "하단지구");
  const [selectedParish, setSelectedParish] = useState(user?.parish || "하단");
  const [selectedRole, setSelectedRole] = useState<AffiliationRole>(user?.role || "청년");
  const [selectedSaintId, setSelectedSaintId] = useState(user?.pilgrimSaint?.id || "andrew-kim-taegon");
  const [isSaved, setIsSaved] = useState(false);

  // 내 게시글 & 댓글 상태
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // 모둠원 목록 상태
  const saintId = user?.pilgrimSaint?.id || selectedSaintId;
  const currentSaint = getPilgrimSaintById(saintId);
  const groupMembers = getYouthGroupMembers(saintId);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBaptismalName(user.baptismalName || "");
      setAvatarUrl(user.avatarUrl || "");
      if (user.district) setSelectedDistrict(user.district);
      if (user.parish) setSelectedParish(user.parish);
      if (user.role) setSelectedRole(user.role);
      if (user.pilgrimSaint?.id) setSelectedSaintId(user.pilgrimSaint.id);
    }
  }, [user]);

  useEffect(() => {
    const cachedPosts = loadCachedPosts();
    setAllPosts(cachedPosts);

    const cachedComments = loadCachedComments();
    setCommentsMap(cachedComments);
  }, []);

  const myPosts = getPostsByAuthorOrUser(allPosts, user?.id, user?.name);
  const myComments = getMyComments(commentsMap, user?.name || "");

  // 프로필 저장 핸들러
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const chosenSaint = getPilgrimSaintById(selectedSaintId);
    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      baptismalName: baptismalName.trim(),
      avatarUrl: avatarUrl.trim(),
      district: selectedDistrict,
      parish: selectedParish,
      role: selectedRole,
      pilgrimSaint: chosenSaint
        ? {
            id: chosenSaint.id,
            name: chosenSaint.name,
            groupName: chosenSaint.groupName,
          }
        : user.pilgrimSaint,
      saintGroup: chosenSaint?.groupName || user.saintGroup,
      saintName: chosenSaint?.name || user.saintName,
      pilgrimageGroup: chosenSaint?.groupName || user.pilgrimageGroup,
    };

    setUserProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // 아바타 사진 변경 핸들러
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImage(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === "string") {
          setAvatarUrl(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(optimized);
    } catch (err) {
      console.warn("Avatar optimization failed, using local URL:", err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === "string") {
          setAvatarUrl(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 게시글 수정 시작
  const handleStartEditPost = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setEditImageUrl(post.imageUrl || "");
  };

  // 게시글 수정 저장
  const handleSaveEditPost = (postId: string) => {
    const updated = updateCommunityPost(allPosts, postId, {
      content: editContent,
      imageUrl: editImageUrl || undefined,
    });
    setAllPosts(updated);
    cachePosts(updated);
    setEditingPostId(null);
  };

  // 게시글 삭제
  const handleDeletePost = (postId: string) => {
    if (!confirm("게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      return;
    }
    const remaining = deleteCommunityPost(allPosts, postId);
    setAllPosts(remaining);
    cachePosts(remaining);
  };

  // 댓글 원문으로 이동
  const handleNavigateToCommentPost = (postId: string) => {
    router.push(`/feed?postId=${encodeURIComponent(postId)}`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 마이페이지 상단 프로필 헤더 카드 */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative w-16 h-16 rounded-full border-2 border-white/60 overflow-hidden bg-white/20 flex-shrink-0 shadow-inner flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="프로필 사진"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src="/assets/characters/jjuyang1.png"
                alt="기본 아바타"
                width={50}
                height={50}
                className="object-contain"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black truncate">{name || "참가 청년"}</h2>
              {baptismalName && (
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  {baptismalName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/90 font-medium truncate mt-0.5">
              부산교구 · {user?.district || "하단지구"} · {user?.parish ? `${user.parish}성당` : "성당 미지정"} · {user?.role || "청년"}
            </p>
            <div className="flex items-center space-x-1.5 mt-1.5">
              <span className="text-[10px] bg-white text-orange-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                {user?.saintGroup || (currentSaint ? currentSaint.groupName : "김대건 안드레아 모둠")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4대 네비게이션 탭 버튼 */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-200/70 p-1 rounded-2xl text-[11px] font-bold text-center">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "profile"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          프로필 수정
        </button>
        <button
          onClick={() => setActiveTab("group")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "group"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          청년의 날 모둠
        </button>
        <button
          onClick={() => setActiveTab("my_posts")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "my_posts"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          내 게시글 ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("my_comments")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "my_comments"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          내 댓글 ({myComments.length})
        </button>
      </div>

      {/* 1. 프로필 수정 탭 */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <User className="w-4 h-4 text-orange-600" />
            <span>참가자 프로필 관리</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            {/* 프로필 사진 변경 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                프로필 사진
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/assets/characters/jjuyang1.png"
                      alt="기본"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  )}
                </div>
                <label className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer hover:bg-slate-200 transition-colors flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>사진 선택/업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 이름(닉네임) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                이름 (활동명)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs"
              />
            </div>

            {/* 세례명 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                세례명 (선택)
              </label>
              <input
                type="text"
                value={baptismalName}
                onChange={(e) => setBaptismalName(e.target.value)}
                placeholder="예: 아녜스, 미카엘, 프란치스코"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs"
              />
            </div>

            {/* 소속 교구 지구 및 본당 선택 드롭다운 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  소속 지구
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const newDistrict = e.target.value;
                    setSelectedDistrict(newDistrict);
                    const parishes = DISTRICT_PARISH_MAP.find((d) => d.district === newDistrict)?.parishes || [];
                    if (parishes.length > 0) {
                      setSelectedParish(parishes[0]);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-medium"
                >
                  {DISTRICT_PARISH_MAP.map((d) => (
                    <option key={d.district} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  소속 본당
                </label>
                <select
                  value={selectedParish}
                  onChange={(e) => setSelectedParish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-medium"
                >
                  {(DISTRICT_PARISH_MAP.find((d) => d.district === selectedDistrict)?.parishes || []).map((p) => (
                    <option key={p} value={p}>
                      {p}성당
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 소속 역할 및 수호성인 모둠 선택 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  소속 역할
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AffiliationRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-medium"
                >
                  {AFFILIATION_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  청년의 날 모둠
                </label>
                <select
                  value={selectedSaintId}
                  onChange={(e) => setSelectedSaintId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-medium"
                >
                  {PILGRIM_SAINTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.groupName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 현재 소속 요약 뱃지 */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">소속 교구/지구:</span>
                <span className="font-bold text-slate-800">부산교구 · {selectedDistrict}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">소속 본당:</span>
                <span className="font-bold text-slate-800">{selectedParish ? `${selectedParish}성당` : "미배정"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">청년의 날 모둠:</span>
                <span className="font-bold text-orange-600">
                  {getPilgrimSaintById(selectedSaintId)?.groupName || "김대건 안드레아 모둠"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">소속 역할:</span>
                <span className="font-bold text-slate-800">{selectedRole}</span>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              type="submit"
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1.5"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>수정 사항이 저장되었습니다!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>프로필 수정 저장</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 2. 청년의 날 모둠 및 모둠원 명단 탭 */}
      {activeTab === "group" && (
        <div className="space-y-3">
          {/* 수호성인 모둠 소개 카드 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-orange-100 text-orange-800 font-black px-2 py-0.5 rounded-full">
                2027 서울 WYD 5인 수호성인
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                축일 {currentSaint?.feastDay}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">
                {currentSaint?.name} 모둠
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                {currentSaint?.title}
              </p>
            </div>

            {currentSaint?.motto && (
              <blockquote className="p-3 bg-amber-50/70 border-l-4 border-amber-400 rounded-r-xl text-[11px] font-semibold text-amber-900 italic">
                &ldquo;{currentSaint.motto}&rdquo;
              </blockquote>
            )}
          </div>

          {/* 모둠원 명단 카드 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                <Users className="w-4 h-4 text-orange-600" />
                <span>함께하는 청년의 날 모둠원</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                총 {groupMembers.length + (user ? 1 : 0)}명
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* 나 자신 */}
              {user && (
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-200 bg-orange-50 flex items-center justify-center">
                      <Image
                        src="/assets/characters/jjuyang1.png"
                        alt="나"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-slate-900">{name || "나"}</span>
                        {baptismalName && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            ({baptismalName})
                          </span>
                        )}
                        <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-bold">
                          나
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {user.parish} · {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 다른 모둠원 목록 (등록된 다른 모둠원이 없을 때 빈 상태 안내) */}
              {groupMembers.length === 0 ? (
                <div className="py-6 text-center space-y-1.5 bg-slate-50/50 rounded-2xl my-2">
                  <p className="text-xs font-bold text-slate-600">등록된 모둠원이 아직 없습니다.</p>
                  <p className="text-[10px] text-slate-400">
                    같은 수호성인 모둠으로 참가자들이 등록하면 여기에 자동으로 표시됩니다.
                  </p>
                </div>
              ) : (
                groupMembers.map((member) => (
                  <div key={member.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                        <Image
                          src={member.avatarUrl || "/assets/characters/jjuyang2.png"}
                          alt={member.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">{member.name}</span>
                          {member.baptismalName && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              ({member.baptismalName})
                            </span>
                          )}
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            {member.parish}
                          </span>
                        </div>
                        {member.motto && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[200px]">
                            &ldquo;{member.motto}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {member.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. 내 게시글 관리 탭 */}
      {activeTab === "my_posts" && (
        <div className="space-y-3">
          {myPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-2">
              <p className="font-bold text-slate-600">작성한 소통피드 게시글이 없습니다.</p>
              <p className="text-[11px] text-slate-400">
                소통피드에서 2026 청년의 날 현장 소감과 사진을 남겨보세요!
              </p>
              <Link
                href="/feed"
                className="inline-block mt-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
              >
                소통피드 바로가기
              </Link>
            </div>
          ) : (
            myPosts.map((post) => {
              const isEditing = editingPostId === post.id;
              const media = getPostMediaUrls(post);

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => handleStartEditPost(post)}
                            className="p-1.5 text-slate-500 hover:text-orange-600 transition-colors"
                            title="게시글 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
                            title="게시글 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleSaveEditPost(post.id)}
                            className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingPostId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="이미지 URL (선택)"
                        className="w-full p-2 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                        {post.content}
                      </p>

                      {media.length > 0 && (
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-100">
                          <img
                            src={media[0]}
                            alt="첨부 미디어"
                            className="w-full h-full object-cover"
                          />
                          {media.length > 1 && (
                            <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                              <Layers className="w-3 h-3" />
                              <span>1/{media.length}</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-semibold pt-1">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <span>{post.likes || 0}</span>
                        </span>
                        <Link
                          href={`/feed?postId=${post.id}`}
                          className="flex items-center space-x-1 text-orange-600 hover:underline"
                        >
                          <span>원문 피드에서 보기</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. 내 댓글 모아보기 탭 */}
      {activeTab === "my_comments" && (
        <div className="space-y-3">
          {myComments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-2">
              <p className="font-bold text-slate-600">작성한 댓글이 없습니다.</p>
              <p className="text-[11px] text-slate-400">
                소통피드의 다른 청년들 글에 따뜻한 응원의 댓글을 남겨보세요!
              </p>
              <Link
                href="/feed"
                className="inline-block mt-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
              >
                소통피드 바로가기
              </Link>
            </div>
          ) : (
            myComments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => handleNavigateToCommentPost(comment.postId)}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-orange-200 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>해당 게시글 이동</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <p className="text-slate-800 font-medium leading-relaxed">
                  {comment.content}
                </p>

                <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>게시글 ID: {comment.postId}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
