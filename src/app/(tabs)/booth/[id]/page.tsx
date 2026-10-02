"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  Info,
} from "lucide-react";
import { findBoothById, ZoneData } from "@/data/officialBooths";
import {
  BoothReview,
  getBoothReviews,
  saveBoothReview,
  formatRelativeTime,
} from "@/lib/boothReviews";
import { useUser } from "@/context/UserContext";
import { signInWithKakao } from "@/lib/auth/kakao";

export default function BoothDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boothId = typeof params?.id === "string" ? params.id : "";
  const { user } = useUser();
  const isKakaoSignedIn = !!(user && (user.email || user.provider === "kakao"));

  const [booth, setBooth] = useState<ReturnType<typeof findBoothById>>(null);
  const [reviews, setReviews] = useState<BoothReview[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!boothId) return;
    const data = findBoothById(boothId);
    setBooth(data);
    if (data) {
      setReviews(getBoothReviews(boothId));
    }
  }, [boothId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKakaoSignedIn) {
      alert("부스 방명록 작성은 카카오 로그인이 필요합니다.");
      signInWithKakao();
      return;
    }
    if (!boothId || !reviewContent.trim()) return;

    setIsSubmitting(true);
    try {
      const saved = saveBoothReview({
        boothId,
        userName: authorName.trim() || "익명의 청년",
        content: reviewContent.trim(),
      });
      setReviews((prev) => [saved, ...prev]);
      setReviewContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Info className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">부스를 찾을 수 없습니다</h2>
          <p className="text-xs text-slate-500 mt-1">
            요청하신 부스 식별자({boothId}) 정보가 존재하지 않습니다.
          </p>
        </div>
        <div className="flex space-x-2 pt-2">
          <Link
            href="/map"
            className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-orange-600 transition-colors"
          >
            지도 및 부스 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const zoneColorBadge: Record<ZoneData["id"], string> = {
    faith: "bg-blue-100 text-blue-800 border-blue-200",
    love: "bg-rose-100 text-rose-800 border-rose-200",
    sharing: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hope: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 상단 내비게이션 바 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors flex items-center space-x-1"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">목록으로</span>
          </button>
        </div>
        <Link
          href={`/map?focus=${booth.zoneId}-${booth.number}`}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>지도에서 위치 보기</span>
        </Link>
      </div>

      {/* 부스 메인 카드 (위키 헤더) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span
            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
              zoneColorBadge[booth.zoneId]
            }`}
          >
            {booth.zoneName} {booth.number}번 부스
          </span>
          {booth.isSacrament && (
            <span className="text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
              <span>✝️ 7성사 연계 부스</span>
              {booth.sacramentType && <span>({booth.sacramentType})</span>}
            </span>
          )}
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {booth.name}
        </h1>

        {/* 요약 메타 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">운영 단체:</span>
            <span className="font-bold text-slate-800">
              {booth.organization || "부산교구 청소년사목국 연계 단체"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">운영 시간:</span>
            <span className="font-bold text-slate-800">
              {booth.operatingHours || "10:00 - 17:00"}
            </span>
          </div>
        </div>
      </div>

      {/* 부스 상세 소개 (위키 콘텐츠) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-black text-slate-900">부스 소개 및 안내</h2>
        </div>

        <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line font-medium">
          {booth.description ||
            `${booth.zoneName} ${booth.number}번 부스 「${booth.name}」입니다. 청년 여러분을 환영합니다.`}
        </div>

        {/* 주요 활동 / 체험 프로그램 */}
        {booth.activities && booth.activities.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>주요 체험 프로그램</span>
            </h3>
            <ul className="space-y-1.5">
              {booth.activities.map((act, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 참여자 방명록 및 리뷰 위키 섹션 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-black text-slate-900">
              청년 방명록 & 생생 후기
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            총 {reviews.length}개
          </span>
        </div>

        {/* 후기 작성 폼 또는 로그인 안내 */}
        {!isKakaoSignedIn ? (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              부스 방명록 및 후기 작성은 <strong>카카오 간편 로그인</strong> 후 이용하실 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => signInWithKakao()}
              className="py-2.5 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 shadow-xs transition-all active:scale-[0.99]"
            >
              <span>카카오로 간편 로그인하기</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="작성자 이름 또는 세례명 (기본: 내 프로필)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
            <div className="flex space-x-2">
              <textarea
                placeholder="부스 체험 소감이나 응원의 한마디를 남겨보세요!"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={2}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 resize-none font-medium"
              />
              <button
                type="submit"
                disabled={isSubmitting || !reviewContent.trim()}
                className="px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5 mb-0.5" />
                <span>등록</span>
              </button>
            </div>
          </form>
        )}

        {/* 후기 목록 */}
        <div className="space-y-2.5 pt-1">
          {reviews.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <p className="text-xs font-bold">아직 등록된 방명록이 없습니다.</p>
              <p className="text-[11px] text-slate-400">
                첫 번째 응원 메시지를 남겨보세요! ✨
              </p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{r.userName}</span>
                  <span className="text-slate-400">{formatRelativeTime(r.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                  {r.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
