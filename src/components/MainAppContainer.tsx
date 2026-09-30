"use client";

import React, { useState } from "react";
import { EVENT_SCHEDULE } from "@/data/schedule";
import { SpiritualModal } from "@/components/SpiritualModal";
import { StampBookView } from "@/components/StampBookView";
import { CommunityFeedView } from "@/components/CommunityFeedView";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useUser } from "@/context/UserContext";
import {
  Calendar,
  MapPin,
  BookOpen,
  Music,
  Sparkles,
  Compass,
  QrCode,
  Users,
  Info,
  Car,
  Utensils,
} from "lucide-react";

export function MainAppContainer() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"home" | "stamp" | "feed" | "info">("home");
  const [spiritualModal, setSpiritualModal] = useState<"prayer" | "song" | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 최상단 긴급 안내 배너 (기획서 Page 6: Disclaimer Banner) */}
      <div className="bg-amber-500 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            [2027 WYD 주제 성구] &quot;용기를 내어라, 내가 세상을 이겼다&quot; (요한 16,33)
          </span>
        </div>
        <button
          onClick={() => setSpiritualModal("prayer")}
          className="text-[11px] underline font-bold flex-shrink-0 ml-2"
        >
          기도문 보기
        </button>
      </div>

      {/* 헤더 바 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-200">
            BYD
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              2026 부산교구 젊은이의 날
            </h1>
            <p className="text-[10px] text-slate-500">디지털 순례 나침반</p>
          </div>
        </div>

        {/* 사용자 정보 또는 온보딩 열기 버튼 */}
        {user ? (
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <span>{user.name}</span>
            <span className="text-[10px] bg-blue-200/60 px-1.5 py-0.5 rounded-full">
              {user.groupNumber ? `${user.groupNumber}조` : user.parish}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            순례 등록하기
          </button>
        )}
      </header>

      {/* 메인 뷰 컨텐츠 */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* 1. 홈 탭 (타임라인, 영적메시지 카드, 행사장 안내) */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* 영적 카드 2종 (기도문 & 주제가 바로가기) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSpiritualModal("prayer")}
                className="cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-4 shadow-md shadow-blue-100 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-2 bg-white/20 w-fit rounded-xl mb-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    2027 WYD 공식
                  </span>
                  <h3 className="text-sm font-bold mt-0.5">대회 공식 기도문</h3>
                  <p className="text-[10px] text-blue-100/80 mt-1">묵주기도 및 영적 준비</p>
                </div>
              </div>

              <div
                onClick={() => setSpiritualModal("song")}
                className="cursor-pointer bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-4 shadow-md shadow-amber-100 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-2 bg-white/20 w-fit rounded-xl mb-3">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                    청청해 주제가
                  </span>
                  <h3 className="text-sm font-bold mt-0.5">하느님 나라에</h3>
                  <p className="text-[10px] text-amber-100/80 mt-1">공식 악보 및 가사</p>
                </div>
              </div>
            </div>

            {/* 메인 비주얼 배너 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  10월 4일 (주일) 스포원파크
                </span>
                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  지금 여기, 주님이 함께! <br />
                  <span className="text-blue-600">청소년·청년의 해 (3) 선포와 나눔</span>
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  5,000~7,000명의 부산교구 젊은이가 함께 모여 신앙을 고백하고 희망을 나누는 축제의
                  장입니다.
                </p>
              </div>
              <div className="absolute right-[-15px] bottom-[-20px] opacity-15 text-9xl pointer-events-none">
                ⛪
              </div>
            </div>

            {/* 타임라인 (기획서 Page 6: Live Timeline) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">행사 타임테이블</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">10.04(주일)</span>
              </div>

              <div className="space-y-4">
                {EVENT_SCHEDULE.map((item, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs relative">
                    <div className="w-20 flex-shrink-0 font-semibold text-slate-500 pt-0.5">
                      {item.time.split(" ~ ")[0]}
                    </div>
                    <div className="flex-1 space-y-0.5 pb-3 border-b border-slate-50">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.zone === "A"
                              ? "bg-blue-100 text-blue-700"
                              : item.zone === "B"
                              ? "bg-amber-100 text-amber-700"
                              : item.zone === "C"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.zone}구역
                        </span>
                        <span
                          className={`font-bold ${
                            item.isImportant ? "text-blue-900" : "text-slate-800"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 스탬프 북 탭 */}
        {activeTab === "stamp" && <StampBookView />}

        {/* 3. 커뮤니티 피드 탭 */}
        {activeTab === "feed" && <CommunityFeedView />}

        {/* 4. 안내 탭 (셔틀버스, 식사, 좌석) */}
        {activeTab === "info" && (
          <div className="space-y-4 text-xs leading-relaxed">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Car className="w-4 h-4 text-blue-600" />
                <span>주차 및 셔틀버스 운행 안내</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li>
                  <strong className="text-slate-900">셔틀버스 운행</strong>: 노포역 ↔ 스포원파크 (15분
                  간격)
                  <br />
                  - 오전: 09:00 ~ 10:45 (노포역 주차장 출구 쪽 탑승)
                  <br />- 오후: 19:00 ~ 20:30 (스포원파크 정문 옆 서측주차장 탑승)
                </li>
                <li>
                  <strong className="text-slate-900">대형버스 하차</strong>: 북측주차장 11번 게이트 또는
                  서측 14번 게이트
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>점심식사 및 행사장 유의사항</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li>
                  <strong className="text-slate-900">개인 도시락 및 돗자리 지참</strong> (공원 내
                  음식 판매 부스 없음)
                </li>
                <li>식수 부스에서 1인 1병 생수 지급 (개인 물병 권장)</li>
                <li>실내체육관은 12:00부터 입장 가능하며 음식물 반입 절대 불가 (운동화 착용 필수)</li>
                <li>미사는 15:30부터 본당별 지정 좌석으로 운영됩니다.</li>
              </ul>
            </div>

            {/* 필수 저작권 표기 (기획서 Page 11) */}
            <div className="text-center p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 font-medium">
              © 부산교구 청소년사목국 · 2026 BYD
            </div>
          </div>
        )}
      </main>

      {/* 하단 고정 네비게이션 바 */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
              activeTab === "home" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>홈</span>
          </button>

          <button
            onClick={() => setActiveTab("stamp")}
            className={`flex flex-col items-center space-y-1 text-xs font-semibold transition-colors relative ${
              activeTab === "stamp" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>스탬프 북</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
              activeTab === "feed" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>소통 피드</span>
          </button>

          <button
            onClick={() => setActiveTab("info")}
            className={`flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
              activeTab === "info" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Info className="w-5 h-5" />
            <span>행사 안내</span>
          </button>
        </div>
      </nav>

      {/* 오버레이 모달들 */}
      <SpiritualModal type={spiritualModal} onClose={() => setSpiritualModal(null)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
