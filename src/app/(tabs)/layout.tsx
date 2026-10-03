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

        {/* 공통 하단 필수 저작권 표기 */}
        <footer className="pt-4 pb-2 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-500">
            ⓒ 부산교구 청소년사목국 · 2026 BYD
          </p>
          <p className="text-[9px] text-slate-400">
            공식 마스코트 쭈양이(JJUYANG!) · 문의: purunnamu@catb.kr
          </p>
        </footer>
      </main>

      {/* 하단 고정 네비게이션 바 (Persistent Bottom Nav) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          <Link
            href="/"
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              isHome ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>메인</span>
          </Link>

          <Link
            href="/map"
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              isMap ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Map className="w-5 h-5" />
            <span>지도</span>
          </Link>

          <Link
            href="/feed?action=write"
            className="flex flex-col items-center space-y-1 text-[11px] font-semibold text-slate-400 hover:text-orange-600 transition-colors"
          >
            <div className="p-1 -mt-1 rounded-full bg-orange-500 text-white shadow-sm flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span>새글작성</span>
          </Link>

          <Link
            href="/feed"
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              isFeed ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>이모저모</span>
          </Link>

          <Link
            href="/seating"
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors relative ${
              isSeating ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative">
              <MapPin className="w-5 h-5" />
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

