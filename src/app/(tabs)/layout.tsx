"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserProvider } from "@/context/UserContext";
import { OnboardingModal } from "@/components/OnboardingModal";
import {
  MapPin,
  Compass,
  Users,
  Map,
  PlusCircle,
} from "lucide-react";

function TabsLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // 최초 방문 또는 온보딩 미완료(카카오 로그인 직후 등) 시 온보딩 모달 자동 오픈 (세션 로딩 완료 후 판정)
  useEffect(() => {
    if (isLoading) return;
    const isCompleted = user?.onboardingCompleted && user?.termsAgreed && !!user?.parish;
    if (!isCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user, isLoading]);

  // 활성 탭 판별
  const isHome = pathname === "/" || pathname === "";
  const isMap = pathname.startsWith("/map");
  const isFeed = pathname.startsWith("/feed");
  const isSeating = pathname.startsWith("/seating");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 flex flex-col">
      {/* 최상단 주황색 띠 공지 배너 */}
      <div className="bg-orange-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">안내</span>
          <span className="truncate">스포원파크 부스 QR 스캔하고 현장 굿즈 교환받자! 🍞🐟</span>
        </div>
      </div>

      {/* 헤더 바 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-200">
            <Image
              src="/assets/characters/jjuyang1.png"
              alt="쭈양이"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight flex items-center space-x-1">
              <span>쭈양이 꾹</span>
              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">2026 BYD</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold">부산교구 청년의날 디지털 순례 가이드</p>
          </div>
        </div>

        {/* 사용자 정보 또는 온보딩 열기 버튼 */}
        {user ? (
          <Link
            href="/profile"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors border border-orange-100"
          >
            <span>{user.name}</span>
            <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full font-bold max-w-[120px] truncate">
              {user.saintGroup || `${user.parish}성당`}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold shadow-md hover:bg-orange-600 transition-colors"
          >
            참가자 등록하기
          </button>
        )}
      </header>

      {/* 메인 뷰 컨텐츠 ({children}) */}
      <main className="max-w-md mx-auto p-4 space-y-5 w-full flex-1">
        {children}
      </main>

      {/* 하단 고정 네비게이션 바 (Persistent Bottom Nav) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center items-center">
          <Link
            href="/"
            className={`flex flex-col items-center py-1 space-y-1 text-[11px] transition-all active:scale-95 ${
              isHome
                ? "text-orange-600 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Compass className={`w-5 h-5 transition-transform ${isHome ? "scale-110" : ""}`} />
            <span>메인</span>
          </Link>

          <Link
            href="/map"
            className={`flex flex-col items-center py-1 space-y-1 text-[11px] transition-all active:scale-95 ${
              isMap
                ? "text-orange-600 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Map className={`w-5 h-5 transition-transform ${isMap ? "scale-110" : ""}`} />
            <span>지도</span>
          </Link>

          <Link
            href="/feed?action=write"
            className="flex flex-col items-center py-0.5 space-y-0.5 text-[11px] font-bold text-slate-500 hover:text-orange-600 transition-all group active:scale-90"
            title="새 게시물 작성"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-center -mt-3.5 group-hover:shadow-lg group-hover:scale-105 transition-all border-2 border-white">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span>새글작성</span>
          </Link>

          <Link
            href="/feed"
            className={`flex flex-col items-center py-1 space-y-1 text-[11px] transition-all active:scale-95 ${
              isFeed
                ? "text-orange-600 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Users className={`w-5 h-5 transition-transform ${isFeed ? "scale-110" : ""}`} />
            <span>이모저모</span>
          </Link>

          <Link
            href="/seating"
            className={`flex flex-col items-center py-1 space-y-1 text-[11px] transition-all active:scale-95 relative ${
              isSeating
                ? "text-orange-600 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <div className="relative">
              <MapPin className={`w-5 h-5 transition-transform ${isSeating ? "scale-110" : ""}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
            <span>미사안내</span>
          </Link>
        </div>
      </nav>

      {/* 전역 모달 */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <TabsLayoutContent>{children}</TabsLayoutContent>
    </UserProvider>
  );
}

