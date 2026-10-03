"use client";

import React, { useState, useRef } from "react";
import { EVENT_SCHEDULE, ScheduleItem } from "@/data/schedule";
import { OUTDOOR_STAGE_PROGRAMS } from "@/data/stageSchedule";
import {
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  Church,
  Bus,
  Package,
  Music,
  ChevronDown,
  Info,
} from "lucide-react";

interface ZoneScheduleGridViewProps {
  onOpenHolies: () => void;
  onOpenMassGuide: () => void;
}

type ZoneTab = "A" | "B" | "C";

export function ZoneScheduleGridView({
  onOpenHolies,
  onOpenMassGuide,
}: ZoneScheduleGridViewProps) {
  const [activeZoneTab, setActiveZoneTab] = useState<ZoneTab>("A");
  const [isOutdoorExpanded, setIsOutdoorExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 구역별 메타데이터
  const zoneMeta: Record<
    ZoneTab,
    {
      title: string;
      subtitle: string;
      locationName: string;
      themeColor: string;
      bgBadge: string;
      textColor: string;
      borderColor: string;
    }
  > = {
    A: {
      title: "A구역",
      subtitle: "야외 분수광장",
      locationName: "스포원파크 야외 분수광장 & 수변공원",
      themeColor: "from-blue-600 to-indigo-600",
      bgBadge: "bg-blue-50 text-blue-700 border-blue-200",
      textColor: "text-blue-900",
      borderColor: "border-blue-200",
    },
    B: {
      title: "B구역",
      subtitle: "실내체육관",
      locationName: "스포원파크 실내체육관 & 1F 문화홀",
      themeColor: "from-amber-600 to-orange-600",
      bgBadge: "bg-amber-50 text-amber-700 border-amber-200",
      textColor: "text-amber-900",
      borderColor: "border-amber-200",
    },
    C: {
      title: "C구역",
      subtitle: "가족공원 야외무대",
      locationName: "스포원파크 가족공원 버스킹 특설무대",
      themeColor: "from-emerald-600 to-teal-600",
      bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      textColor: "text-emerald-900",
      borderColor: "border-emerald-200",
    },
  };

  const zones: ZoneTab[] = ["A", "B", "C"];

  // 상단 탭 클릭 시 캐러셀 스크롤 이동
  const handleTabClick = (zone: ZoneTab) => {
    setActiveZoneTab(zone);
    if (!carouselRef.current) return;
    const index = zones.indexOf(zone);
    const container = carouselRef.current;
    const slideWidth = container.offsetWidth;
    container.scrollTo({
      left: index * slideWidth,
      behavior: "smooth",
    });
  };

  // 캐러셀 스와이프/스크롤 감지하여 상단 탭 동기화
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const slideWidth = container.offsetWidth;
    if (slideWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    if (newIndex >= 0 && newIndex < zones.length && zones[newIndex] !== activeZoneTab) {
      setActiveZoneTab(zones[newIndex]);
    }
  };

  // 구역별 일정 필터링
  const getZoneItems = (zone: ZoneTab): ScheduleItem[] => {
    return EVENT_SCHEDULE.filter((item) => item.zone === zone || item.zone === "공통");
  };

  return (
    <div className="space-y-4">
      {/* 1. 핵심 독립 안내 카드 (접수/패키지 수령 & 셔틀버스) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 접수 및 패키지 수령 */}
        <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
              <Package className="w-2.5 h-2.5" />
              <span>접수 · 패키지 수령</span>
            </span>
            <span className="text-[11px] font-black text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200/60">
              09:00 ~ 14:00
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              본당 대표자 접수 및 패키지 수령
            </h4>
            <p className="text-[10px] text-slate-600 mt-0.5">
              A구역 주출입구 본부석 · 본당별 실내체육관 좌석 배치도 및 기념품 수령 (14:00 마감)
            </p>
          </div>
        </div>

        {/* 귀가 셔틀버스 운행 */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50/60 rounded-2xl border border-indigo-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              <Bus className="w-2.5 h-2.5" />
              <span>노포역행 셔틀버스</span>
            </span>
            <span className="text-[11px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200/60">
              19:00 ~ 20:30 (15분 간격)
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              귀가 순환 셔틀버스 무료 운행
            </h4>
            <p className="text-[10px] text-slate-600 mt-0.5">
              스포원파크 정문/서측 정류장 ↔ 노포역(1호선) · 파견미사 후 15분 간격 집중 배차
            </p>
          </div>
        </div>
      </div>

      {/* 2. 바로가기 액션 배너 (지성소 & 미사 가이드) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenHolies}
          className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-xs transition-all flex items-center justify-between text-left group"
        >
          <div className="space-y-0.5">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5 text-amber-200" />
              <span>B구역 문화홀</span>
            </span>
            <div className="text-xs font-black">지성소 일정표</div>
            <div className="text-[10px] text-amber-100">성체조배 & 찬양 성시간</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onOpenMassGuide}
          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xs transition-all flex items-center justify-between text-left group"
        >
          <div className="space-y-0.5">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
              <Church className="w-2.5 h-2.5 text-blue-200" />
              <span>16:00 파견미사</span>
            </span>
            <div className="text-xs font-black">미사 참여 가이드</div>
            <div className="text-[10px] text-blue-100">3대 전례 수칙 보기</div>
          </div>
          <BookOpen className="w-4 h-4 text-white/70 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* 3. 모바일 구역 전환 캐러셀 탭 */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => handleTabClick("A")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeZoneTab === "A"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>A구역 (분수광장)</span>
        </button>
        <button
          onClick={() => handleTabClick("B")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeZoneTab === "B"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>B구역 (실내체육관)</span>
        </button>
        <button
          onClick={() => handleTabClick("C")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeZoneTab === "C"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>C구역 (가족공원)</span>
        </button>
      </div>

      {/* 4. 구역별 캐러셀 슬라이더 컨테이너 */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar rounded-2xl border border-slate-200 shadow-xs bg-slate-50/50"
      >
        {zones.map((zone) => {
          const meta = zoneMeta[zone];
          const items = getZoneItems(zone);

          return (
            <div
              key={zone}
              className="w-full flex-shrink-0 snap-center p-3.5 sm:p-4 bg-white space-y-3"
            >
              {/* 슬라이드 상단 헤더 */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.themeColor} flex items-center justify-center text-white font-black text-xs shadow-xs`}
                  >
                    {zone}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">
                      {meta.title} · {meta.subtitle}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{meta.locationName}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bgBadge}`}>
                  {items.length}개 프로그램
                </span>
              </div>

              {/* 구역 타임라인 프로그램 리스트 */}
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      item.title.includes("미사")
                        ? "bg-orange-50/80 border-orange-200 text-orange-950 ring-1 ring-orange-200"
                        : item.zone === "공통"
                        ? "bg-slate-50 border-slate-200 text-slate-900"
                        : zone === "A"
                        ? "bg-blue-50/50 border-blue-100 text-slate-900"
                        : zone === "B"
                        ? "bg-amber-50/50 border-amber-100 text-slate-900"
                        : "bg-emerald-50/50 border-emerald-100 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-bold text-xs text-slate-900">{item.time}</span>
                      </div>
                      {item.isImportant && (
                        <span className="text-[9px] font-bold bg-white/90 px-1.5 py-0.5 rounded-md text-slate-700 shadow-2xs border border-slate-200/60">
                          주요 일정
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* B구역 지성소 및 미사 바로가기 버튼 */}
                    {item.title.includes("지성소") && (
                      <button
                        onClick={onOpenHolies}
                        className="mt-2 text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>지성소 상세 일정표 보기</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {item.title.includes("미사") && (
                      <button
                        onClick={onOpenMassGuide}
                        className="mt-2 text-[10px] font-bold text-orange-700 hover:text-orange-900 bg-orange-100/70 hover:bg-orange-100 px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Church className="w-3 h-3 text-orange-600" />
                        <span>파견미사 3대 전례 수칙 보기</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* C구역 특화: 10개 공연팀 상세 타임테이블 아코디언 확장 */}
                {zone === "C" && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Music className="w-4 h-4 text-emerald-600" />
                        <div>
                          <h4 className="text-xs font-bold text-emerald-950">
                            야외무대 버스킹 10개 공연팀 상세 일정 (11:00 ~ 14:45)
                          </h4>
                          <span className="text-[10px] text-emerald-700">
                            카톨리카 · 오후의 정원 · 소울브릿지 등
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOutdoorExpanded(!isOutdoorExpanded)}
                        className="px-2 py-1 bg-white text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors flex items-center space-x-0.5"
                      >
                        <span>{isOutdoorExpanded ? "접기" : "전체보기"}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            isOutdoorExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isOutdoorExpanded && (
                      <div className="pt-2 divide-y divide-emerald-100 border-t border-emerald-100/80">
                        {OUTDOOR_STAGE_PROGRAMS.map((prog, pIdx) => (
                          <div
                            key={pIdx}
                            className="py-1.5 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-emerald-950">{prog.performer}</span>
                              <span className="text-[9px] text-emerald-600 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                                {prog.category}
                              </span>
                            </div>
                            <span className="font-medium text-emerald-800 text-[10px]">
                              {prog.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 모바일 스와이프 안내 인디케이터 */}
      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3 text-slate-400" />
        <span>좌우로 스와이프하거나 상단 탭을 터치하여 구역별 일정을 이동할 수 있습니다.</span>
      </div>
    </div>
  );
}
