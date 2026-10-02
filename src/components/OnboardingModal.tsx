"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DISTRICT_PARISH_MAP, AFFILIATION_ROLES, AffiliationRole } from "@/data/parishes";
import { getRandomPilgrimSaint, getPilgrimSaintById, PilgrimSaint } from "@/data/saints";
import { assignPilgrimageGroup } from "@/lib/pilgrimageGroup";
import { useUser, UserProfile } from "@/context/UserContext";
import { signInWithKakao, syncOnboardingMetadata } from "@/lib/auth/kakao";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, ChevronRight } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { user, setUserProfile } = useUser();
  const isKakaoSignedIn = !!(user && (user.email || user.provider === "kakao"));

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(() => {
    if (user && (user.email || user.provider === "kakao") && !user.termsAgreed) {
      return 2;
    }
    return 1;
  });

  // 폼 입력 상태
  const name = user?.name || "";
  const [selectedDistrict, setSelectedDistrict] = useState(
    user?.district || DISTRICT_PARISH_MAP[0].district
  );
  const [selectedParish, setSelectedParish] = useState(
    user?.parish || DISTRICT_PARISH_MAP[0].parishes[0]
  );
  const [selectedRole, setSelectedRole] = useState<AffiliationRole>(user?.role || "청년");

  // 약관 동의 상태 (PRD §2.1)
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeCharacterAsset, setAgreeCharacterAsset] = useState(true);

  // 성인 순례 그룹 무작위 배정 상태 (PRD §2.3)
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocatedPilgrimageGroup, setAllocatedPilgrimageGroup] = useState<string>(
    user?.pilgrimageGroup || ""
  );
  const [allocatedSaint, setAllocatedSaint] = useState<PilgrimSaint | null>(
    user?.pilgrimSaint
      ? {
          id: user.pilgrimSaint.id,
          name: user.pilgrimSaint.name,
          groupName: user.pilgrimSaint.groupName,
          title: "수호성인",
          feastDay: "",
        }
      : null
  );
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  if (!isOpen) return null;

  const currentParishes =
    DISTRICT_PARISH_MAP.find((d) => d.district === selectedDistrict)?.parishes || [];

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    try {
      await signInWithKakao();
    } catch (e) {
      console.error("[OnboardingModal] Kakao Login failed:", e);
      setIsKakaoLoading(false);
    }
  };

  const handleStartAllocation = async () => {
    setIsAllocating(true);

    // 무작위 성인(Saint) 기반 순례 공동체 배정 (엔진 연동)
    setTimeout(async () => {
      const allocation = assignPilgrimageGroup(user?.id || name || undefined, 20);
      const saint = getPilgrimSaintById(allocation.saintId) || getRandomPilgrimSaint();
      setAllocatedSaint(saint);
      setAllocatedPilgrimageGroup(allocation.pilgrimageGroup);
      setIsAllocating(false);
      setStep(4);

      const updatedProfile: UserProfile = {
        id: user?.id || "user-" + Date.now(),
        name: name || user?.name || "순례 청년",
        district: selectedDistrict,
        parish: selectedParish,
        role: selectedRole,
        groupNumber: allocation.groupNumber,
        pilgrimSaint: {
          id: saint.id,
          name: saint.name,
          groupName: saint.groupName,
        },
        saintGroup: saint.groupName,
        saintName: saint.name,
        pilgrimageGroup: allocation.pilgrimageGroup,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
        termsAgreed: agreePrivacy && agreeCharacterAsset,
        onboardingCompleted: true,
        provider: user?.provider || "kakao",
      };

      setUserProfile(updatedProfile);

      // Supabase 세션이 연결되어 있으면 원격 메타데이터 동기화
      try {
        const supabase = createClient();
        await syncOnboardingMetadata(supabase, {
          name: updatedProfile.name,
          district: selectedDistrict,
          parish: selectedParish,
          role: selectedRole,
          saintGroup: saint.groupName,
          saintId: saint.id,
          saintName: saint.name,
          termsAgreed: true,
        });
      } catch (err) {
        console.warn("[OnboardingModal] Supabase metadata sync skipped:", err);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 탭 / 단계 안내 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              Step {step} of 4
            </span>
            <span className="text-xs font-semibold text-slate-500">순례 등록</span>
          </div>
          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 1단계: 카카오 SSO 간편 인증 & 기본 참가자 식별 */}
        {step === 1 && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-orange-100">
                <Image
                  src="/assets/characters/jjuyang1.png"
                  alt="쭈양이"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-black text-slate-900">반갑습니다!</h2>
              <p className="text-xs text-slate-500 mt-1">
                2026 부산교구 젊은이의 날 (BYD) 디지털 순례 여정
              </p>
            </div>

            {/* 카카오 간편 로그인 버튼 또는 이미 연동된 계정 카드 */}
            {isKakaoSignedIn ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#FEE500] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                    카톡
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-amber-950 truncate">
                      카카오 계정 연동 완료
                    </p>
                    <p className="text-[10px] text-amber-800 truncate">
                      {user?.name || "참가자"} {user?.email ? `(${user.email})` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1"
                >
                  <span>약관 동의 단계로 계속하기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-600 leading-relaxed text-center">
                  2026 부산교구 청년의 날 디지털 순례는<br />
                  <strong className="text-amber-600 font-bold">카카오 간편 로그인</strong>으로 본인 인증 후 참여하실 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  disabled={isKakaoLoading}
                  className="w-full py-3.5 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.99]"
                >
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.84 1.83 5.334 4.606 6.74-.2.748-.73 2.705-.837 3.123-.131.52.19.512.4.373.167-.11 2.65-1.8 3.73-2.54.67.098 1.36.148 2.06.148 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                  </svg>
                  <span>
                    {isKakaoLoading ? "카카오 인가 창으로 이동 중..." : "카카오로 3초 만에 시작하기"}
                  </span>
                </button>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">🔒 참가자 인증 혜택</p>
                  <p>• 소통피드 현장 글쓰기 및 축제 나눔</p>
                  <p>• 부스별 독립 위키 방문 리뷰 및 방명록 작성</p>
                  <p>• QR 스탬프 투어 및 보물찾기 리워드 참여</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2단계: 약관 동의 (PRD §2.1) */}
        {step === 2 && (
          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">약관에 동의해 주세요</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                대회 운영 및 디지털 순례 혜택 제공을 위해 필요합니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-slate-800">[필수] 개인정보 수집 및 이용 동의</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    본 대회 스탬프 적립, 순례 공동체 소속 관리 및 리워드 쿠폰 발급 목적
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeCharacterAsset}
                  onChange={(e) => setAgreeCharacterAsset(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-slate-800">[필수] 쭈양이 자산 사용 가이드 동의</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    2026 BYD 공식 마스코트 캐릭터 자산의 비영리 축제 내 활용 지침 준수
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!agreePrivacy || !agreeCharacterAsset}
                className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center space-x-1"
              >
                <span>소속 선택으로 이동</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 11개 역할 소속 칩 + 지구/본당 선택 (PRD §2.2) */}
        {step === 3 && (
          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">소속과 역할을 선택해 주세요</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                지구·본당 및 11개 그룹에 맞춤형 가이드가 제공됩니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">지구 선택</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    const firstP =
                      DISTRICT_PARISH_MAP.find((d) => d.district === e.target.value)?.parishes[0] ||
                      "";
                    setSelectedParish(firstP);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {DISTRICT_PARISH_MAP.map((d) => (
                    <option key={d.district} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">본당 선택</label>
                <select
                  value={selectedParish}
                  onChange={(e) => setSelectedParish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {currentParishes.map((p) => (
                    <option key={p} value={p}>
                      {p}성당
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                소속 그룹 (11종)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {AFFILIATION_ROLES.map((role) => {
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-md shadow-orange-100 scale-102"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleStartAllocation}
                disabled={isAllocating}
                className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1"
              >
                {isAllocating ? (
                  <span>성인 순례단 무작위 배정 중...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>순례 그룹 배정 및 시작</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 4단계: 성인 이름 기반 순례 그룹 배정 완료 축하 모달 (PRD §2.3) */}
        {step === 4 && (
          <div className="mt-4 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">순례 등록 완료!</h2>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-bold text-orange-600">{selectedParish}성당</span>{" "}
                <span className="font-bold text-slate-900">{name || "순례자"}</span>님
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-orange-200 rounded-2xl shadow-inner text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full">
                  무작위 배정 순례 공동체
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {allocatedSaint?.feastDay || "축일"}
                </span>
              </div>
              <p className="text-xl font-black text-orange-950 mt-1.5 tracking-tight">
                {allocatedPilgrimageGroup || (allocatedSaint ? `${allocatedSaint.name} 1조` : "성 김대건 안드레아 1조")}
              </p>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100/90 px-1.5 py-0.5 rounded">
                  {allocatedSaint?.groupName || "김대건 안드레아 그룹"}
                </span>
                <span className="text-[11px] text-orange-800/90 font-medium">
                  {allocatedSaint?.title}
                </span>
              </div>
              {allocatedSaint?.motto && (
                <p className="text-[10px] italic text-slate-600 mt-2 bg-white/70 p-2 rounded-xl border border-orange-100">
                  &ldquo;{allocatedSaint.motto}&rdquo;
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              순례 여정 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
