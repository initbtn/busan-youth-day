"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Church,
  ShieldAlert,
} from "lucide-react";
import { KakaoMapView } from "@/components/KakaoMapView";
import { OFFICIAL_ZONES, ZoneData } from "@/data/officialBooths";
import { INDOOR_STAGE_PROGRAMS, OUTDOOR_STAGE_PROGRAMS } from "@/data/stageSchedule";
import { HOLIES_SCHEDULE } from "@/data/holiesSchedule";
import { zoneIndexFromScroll } from "@/lib/zoneCarousel";

type ZoneId = ZoneData["id"];

function MapPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const zoneParam = searchParams.get("zone");
  const targetParam = searchParams.get("target");

  const [activeTab, setActiveTab] = useState<"booths" | "stages" | "map">("map");
  const [selectedZone, setSelectedZone] = useState<ZoneId>("faith");
  const [stageFilter, setStageFilter] = useState<"all" | "indoor" | "holies" | "outdoor">("all");

  const carouselRef = useRef<HTMLDivElement>(null);

  // 1. URL 쿼리 파라미터 연동 (?tab=booths&zone=hope, ?tab=stages&target=indoor)
  useEffect(() => {
    if (tabParam === "booths" || tabParam === "stages" || tabParam === "map") {
      setActiveTab(tabParam);
    }

    if (zoneParam && ["faith", "hope", "love", "sharing"].includes(zoneParam)) {
      setSelectedZone(zoneParam as ZoneId);
    }

    if (targetParam && ["indoor", "outdoor", "holies"].includes(targetParam)) {
      setStageFilter(targetParam as "indoor" | "outdoor" | "holies");
    }
  }, [tabParam, zoneParam, targetParam]);

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = zoneIndexFromScroll(el.scrollLeft, el.clientWidth, OFFICIAL_ZONES.length);
    const zoneId = OFFICIAL_ZONES[idx].id;
    if (zoneId !== selectedZone) {
      setSelectedZone(zoneId);
      router.replace(`/map?tab=booths&zone=${zoneId}`, { scroll: false });
    }
  };

  // smooth 로 가면 지나가는 슬라이드마다 handleCarouselScroll 이 선택 존을 바꾸므로 즉시 이동한다
  useEffect(() => {
    if (activeTab !== "booths") return;
    const el = carouselRef.current;
    if (!el) return;
    const idx = OFFICIAL_ZONES.findIndex((z) => z.id === selectedZone);
    if (idx !== -1 && zoneIndexFromScroll(el.scrollLeft, el.clientWidth, OFFICIAL_ZONES.length) !== idx) {
      el.scrollTo({ left: idx * el.clientWidth, behavior: "auto" });
    }
  }, [activeTab, selectedZone]);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (el) {
      el.scrollBy({ left: direction === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4">
      {/* 상단 타이틀 및 뒤로가기 */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block">
              현장 가이드북
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              부스 · 무대 · 행사장 안내
            </h2>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs flex space-x-1.5">
        <button
          onClick={() => {
            setActiveTab("map");
            router.replace("/map?tab=map", { scroll: false });
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "map"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          실시간 지도
        </button>
        <button
          onClick={() => {
            setActiveTab("booths");
            router.replace(`/map?tab=booths&zone=${selectedZone}`, { scroll: false });
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "booths"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          부스 안내
        </button>
        <button
          onClick={() => {
            setActiveTab("stages");
            router.replace("/map?tab=stages", { scroll: false });
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "stages"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          특설무대 일정
        </button>
      </div>

      {/* 1. 실시간 지도 탭 */}
      {activeTab === "map" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[480px]">
            <KakaoMapView
              onSelectZone={(zoneId) => {
                setSelectedZone(zoneId);
                setActiveTab("booths");
                router.replace(`/map?tab=booths&zone=${zoneId}`, { scroll: false });
              }}
              onSelectStageTab={(stageType) => {
                setStageFilter(stageType);
                setActiveTab("stages");
                router.replace(`/map?tab=stages&target=${stageType}`, { scroll: false });
              }}
            />
          </div>
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl text-xs text-orange-800 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <span>📍 스포원파크 야외 분수광장 현장 인터랙티브 맵</span>
            </p>
            <p className="text-[11px] text-orange-700 leading-relaxed">
              지도의 구역 마커나 핀(부스, 접수대, 무대)을 터치하면 상세 부스 목록 또는 현장 실물 사진과 공연 일정을 바로 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {activeTab === "booths" && (
        <div className="space-y-4">
          {/* 4대 테마존 캐러셀 헤더 & 좌우 네비게이션 */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-bold text-slate-800">4대 테마존 탐방 캐러셀</h3>
              <p className="text-[10px] text-slate-500">카드를 넘겨 각 테마존의 부스 구성을 확인하세요</p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => scrollCarousel("left")}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                aria-label="이전 테마존"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                aria-label="다음 테마존"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory items-start"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {OFFICIAL_ZONES.map((zone) => {
              const isSelected = selectedZone === zone.id;
              return (
                <div
                  key={zone.id}
                  data-testid="zone-slide"
                  className="w-full flex-shrink-0 snap-center space-y-3 px-0.5"
                >
                  <div
                    className={`rounded-2xl p-4 transition-all shadow-sm border ${
                      isSelected
                        ? `bg-gradient-to-br ${zone.color} text-white shadow-md ring-2 ring-orange-400`
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white backdrop-blur-xs" : zone.badgeBg + " " + zone.badgeText
                        }`}
                      >
                        {zone.name}
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? "text-white/90" : "text-slate-400"}`}>
                        총 {zone.booths.length}개
                      </span>
                    </div>

                    <h4 className="text-base font-black tracking-tight">{zone.koreanName}</h4>
                    <p
                      className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        isSelected ? "text-white/90" : "text-slate-500"
                      }`}
                    >
                      {zone.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? "text-white/80" : "text-slate-400"}>
                        7성사 부스: {zone.booths.filter((b) => b.isSacrament).length}개
                      </span>
                      <span className={isSelected ? "text-white/80" : "text-slate-400"}>
                        {OFFICIAL_ZONES.findIndex((z) => z.id === zone.id) + 1} / {OFFICIAL_ZONES.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden max-h-[500px] overflow-y-auto">
                    {zone.booths.map((b) => (
                      <Link
                        key={b.number}
                        href={`/booth/${zone.id}-${b.number}`}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-orange-50/60 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            {b.number}
                          </span>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-orange-950 transition-colors">{b.name}</span>
                              {b.isSacrament && (
                                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-bold">
                                  7성사 부스
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {b.isSacrament && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                              필수 1개
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 무대 및 거점 일정 탭 (실내체육관, 지성소, 상설고해소, 야외무대) */}
      {activeTab === "stages" && (
        <div className="space-y-4">
          {/* 일정 서브 필터 */}
          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
            <button
              onClick={() => setStageFilter("all")}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                stageFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setStageFilter("indoor")}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                stageFilter === "indoor" ? "bg-white text-orange-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              실내체육관
            </button>
            <button
              onClick={() => setStageFilter("holies")}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                stageFilter === "holies" ? "bg-white text-purple-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              지성소/고해소
            </button>
            <button
              onClick={() => setStageFilter("outdoor")}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                stageFilter === "outdoor" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              야외무대
            </button>
          </div>

          {/* 3-A. 실내체육관 메인 스테이지 */}
          {(stageFilter === "all" || stageFilter === "indoor") && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-bold text-slate-800">실내체육관 메인 스테이지</h3>
                </div>
                <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                  B구역 · 12:00 개방
                </span>
              </div>
              <div className="space-y-2">
                {INDOOR_STAGE_PROGRAMS.map((prog, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <span className="font-bold text-slate-700 w-24 flex-shrink-0">{prog.time}</span>
                    <span className="font-medium text-slate-900 flex-1 px-2">{prog.performer}</span>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                      {prog.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-B. 지성소 (실내 문화홀) 성체조배 & 상설 고해소 */}
          {(stageFilter === "all" || stageFilter === "holies") && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Church className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-slate-800">지성소(문화홀) 성체조배 & 상설고해소</h3>
                </div>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                  10:00 ~ 15:30
                </span>
              </div>

              {/* 상설 고해소 안내 배너 */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-purple-900">상설 고해소 운영 (가족공원 야외 잔디)</p>
                  <p className="text-[11px] text-purple-700 leading-snug">
                    운영시간: 13:30 ~ 15:30 / 참가 청년 누구나 자유롭게 사제단 고해성사 참례 가능
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {HOLIES_SCHEDULE.map((slot) => (
                  <div key={slot.id} className="p-2.5 rounded-xl bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{slot.time}</span>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded-md">
                        {slot.badge}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900">{slot.title}</span>
                      <span className="text-[11px] text-slate-500">{slot.leaderOrTeam}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{slot.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-C. 야외 분수광장 버스킹/청년무대 */}
          {(stageFilter === "all" || stageFilter === "outdoor") && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-800">야외 분수광장 버스킹/청년무대</h3>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  C구역 · 11:00 ~ 14:45
                </span>
              </div>
              <div className="space-y-2">
                {OUTDOOR_STAGE_PROGRAMS.map((prog, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <span className="font-bold text-slate-700 w-24 flex-shrink-0">{prog.time}</span>
                    <span className="font-medium text-slate-900 flex-1 px-2">{prog.performer}</span>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                      {prog.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">행사장 지도를 불러오는 중...</p>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
