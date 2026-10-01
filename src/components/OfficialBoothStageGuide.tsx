"use client";

import React, { useState } from "react";
import { OFFICIAL_ZONES } from "@/data/officialBooths";
import { INDOOR_STAGE_PROGRAMS, OUTDOOR_STAGE_PROGRAMS } from "@/data/stageSchedule";
import { KakaoMapView } from "@/components/KakaoMapView";
import { X, Music, Sparkles, Info, MapPin } from "lucide-react";

interface OfficialBoothStageGuideProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "booths" | "stages" | "map";
}

export function OfficialBoothStageGuide({ isOpen, onClose, defaultTab = "booths" }: OfficialBoothStageGuideProps) {
  const [activeTab, setActiveTab] = useState<"booths" | "stages" | "map">(defaultTab);
  const [selectedZone, setSelectedZone] = useState<"faith" | "hope" | "love" | "sharing">("faith");

  if (!isOpen) return null;

  const currentZoneData = OFFICIAL_ZONES.find((z) => z.id === selectedZone)!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col bg-slate-50 overflow-hidden shadow-2xl relative">
        {/* 상단 헤더 */}
        <header className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-0.5">
              공식 가이드북
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              공식 부스 · 무대 · 행사장 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* 탭 네비게이션 */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex space-x-2">
          <button
            onClick={() => setActiveTab("booths")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "booths"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            4대 테마존 부스 (81개)
          </button>
          <button
            onClick={() => setActiveTab("stages")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "stages"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            무대 공연 일정
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "map"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            배치도 & 접수
          </button>
        </div>

        {/* 탭 본문 내용 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. 4대 테마존 공식 부스 탭 */}
          {activeTab === "booths" && (
            <div className="space-y-4">
              {/* 스탬프 획득 규칙 배너 */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/70 rounded-3xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-orange-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>공식 스탬프 획득 및 굿즈 교환 규칙</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  • <strong>운영 시간</strong>: 10:00 ~ 15:00 (A구역 야외 분수광장)<br />
                  • <strong>스탬프 완성</strong>: 믿음·희망·사랑 각 존별 <strong>7성사 부스 1개 + 일반 부스 2개 = 총 9개</strong> 달성 시 &apos;상품 수령처&apos;에서 공식 굿즈 선착순 교환!
                </p>
              </div>

              {/* 존 선택 칩 */}
              <div className="grid grid-cols-4 gap-1.5">
                {OFFICIAL_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`py-2 px-1 rounded-2xl text-xs font-bold text-center transition-all ${
                      selectedZone === zone.id
                        ? "bg-slate-900 text-white shadow-md scale-102"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{zone.koreanName}</span>
                    <span className="block text-[9px] font-normal opacity-70">
                      {zone.booths.length}개
                    </span>
                  </button>
                ))}
              </div>

              {/* 선택된 존 헤더 카드 */}
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentZoneData.badgeBg} ${currentZoneData.badgeText}`}>
                    {currentZoneData.name} ({currentZoneData.koreanName})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    총 {currentZoneData.booths.length}개 부스
                  </span>
                </div>
                <p className="text-xs text-slate-700 pt-1 font-medium">{currentZoneData.description}</p>
                <p className="text-[11px] text-orange-600 font-semibold bg-orange-50/70 p-2 rounded-xl mt-1">
                  🎯 스탬프 규칙: {currentZoneData.rule}
                </p>
              </div>

              {/* 부스 리스트 */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {currentZoneData.booths.map((b) => (
                  <div key={b.number} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center flex-shrink-0">
                        {b.number}
                      </span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">{b.name}</span>
                          {b.isSacrament && (
                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-bold">
                              7성사 부스
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {b.isSacrament && (
                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                        필수 1개
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 무대 공연 타임테이블 탭 */}
          {activeTab === "stages" && (
            <div className="space-y-4">
              {/* 실내 무대 공연 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-900">실내 체육관 무대 공연</h3>
                  </div>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                    12:00 개방 · 자유석
                  </span>
                </div>
                <div className="divide-y divide-slate-50 text-xs">
                  {INDOOR_STAGE_PROGRAMS.map((p, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{p.performer}</span>
                        <span className="text-[10px] text-slate-400">{p.category}</span>
                      </div>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 야외 무대 공연 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900">야외무대 버스킹 공연</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    C구역 가족공원
                  </span>
                </div>
                <div className="divide-y divide-slate-50 text-xs">
                  {OUTDOOR_STAGE_PROGRAMS.map((p, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{p.performer}</span>
                        <span className="text-[10px] text-slate-400">{p.category}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. 배치도 & 접수 안내 탭 */}
          {activeTab === "map" && (
            <div className="space-y-4 text-xs leading-relaxed">
              {/* 카카오맵 인터랙티브 지도 카드 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>스포원파크 4대 테마존 & 7성사 부스 지도</span>
                  </div>
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    카카오맵 연동
                  </span>
                </div>
                <KakaoMapView />
              </div>

              {/* 접수 안내 카드 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Info className="w-4 h-4 text-orange-500" />
                  <span>행사 당일 접수 및 패키지 수령</span>
                </div>
                <ul className="space-y-2 text-slate-600 text-[11px]">
                  <li>• <strong>운영 시간</strong>: 09:00 ~ 14:00 (14시 이후 마감)</li>
                  <li>• <strong>장소</strong>: 스포원 북측 주차장쪽 실내 체육관 입구 (지구별 접수대 운영)</li>
                  <li>• <strong>진행 방식</strong>: 본당 대표자 1인이 접수대에서 인원 확인 후 패키지 교환권을 수령하여 패키지 배부처로 이동합니다. (개인 접수 불가)</li>
                  <li>• <strong>패키지 대상</strong>: 초등부·중고등부·청년·교리교사 1인 1개 (사제/수도자 제외)</li>
                </ul>
              </div>

              {/* 사전 이벤트 미션북 지참 안내 */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-3xl p-5 space-y-2">
                <span className="text-xs font-bold text-blue-900 block">
                  🎁 추가 이벤트: 「일상적인 전례 참여」 미션북 선물
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  본당 신부님의 서명을 받은 <strong>「일상적인 전례 참여」 미션북</strong>을 지참하신 참가자는 부스존 내 <strong>&apos;상품 수령처&apos;</strong>에서 도장 수에 따라 추가 특별 선물을 받으실 수 있습니다!
                </p>
              </div>

              {/* 행사장 3대 구역 배치 요약 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-900 block">행사장 3대 메인 존 요약</span>
                <div className="grid grid-cols-1 gap-2 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <strong>A구역 (야외 분수광장)</strong>: 믿음·희망·사랑·나눔 4대 테마존 81개 부스, 식수대, 의료지원, 상품 수령처
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <strong>B구역 (실내체육관)</strong>: 12시 개방 무대공연, 1F 문화홀 지성소 성체조배, 16:30 BYD 파견미사
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <strong>C구역 (가족공원)</strong>: 야외 버스킹 공연 무대, 상설 고해소(13:30~15:30)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
