"use client";

import React, { useState } from "react";
import { EVENT_SCHEDULE, ScheduleItem } from "@/data/schedule";
import { Clock, Sparkles, BookOpen, ChevronRight, Church } from "lucide-react";

interface ZoneScheduleGridViewProps {
  onOpenHolies: () => void;
  onOpenMassGuide: () => void;
}

export function ZoneScheduleGridView({
  onOpenHolies,
  onOpenMassGuide,
}: ZoneScheduleGridViewProps) {
  const [activeZoneTab, setActiveZoneTab] = useState<"ALL" | "A" | "B" | "C">("ALL");

  // 시간대 그룹화
  const timeBuckets: { label: string; start: string; items: ScheduleItem[] }[] = [
    { label: "09:00 ~ 10:00", start: "09:00", items: [] },
    { label: "10:00 ~ 11:00", start: "10:00", items: [] },
    { label: "11:00 ~ 12:00", start: "11:00", items: [] },
    { label: "12:00 ~ 13:30", start: "12:00", items: [] },
    { label: "13:30 ~ 15:30", start: "13:30", items: [] },
    { label: "15:30 ~ 16:00", start: "15:30", items: [] },
    { label: "16:00 ~ 18:30", start: "16:00", items: [] },
    { label: "18:30 ~ 19:30", start: "18:30", items: [] },
  ];

  // 각 일정 아이템을 해당 시간 버킷에 매핑
  EVENT_SCHEDULE.forEach((item) => {
    const startTime = item.time.split(" ~ ")[0].trim();
    const bucket = timeBuckets.find((b) => b.start === startTime) || timeBuckets[0];
    bucket.items.push(item);
  });

  return (
    <div className="space-y-4">
      {/* 바로가기 액션 배너 (지성소 & 미사 가이드) */}
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

      {/* 모바일 최적화: 구역 필터 탭 (전체 매트릭스 vs 특정 구역만 보기) */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveZoneTab("ALL")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeZoneTab === "ALL"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          전체 매트릭스
        </button>
        <button
          onClick={() => setActiveZoneTab("A")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeZoneTab === "A"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          A구역(분수)
        </button>
        <button
          onClick={() => setActiveZoneTab("B")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeZoneTab === "B"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          B구역(체육관)
        </button>
        <button
          onClick={() => setActiveZoneTab("C")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeZoneTab === "C"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          C구역(야외무대)
        </button>
      </div>

      {/* 다차원 시간대별 구역 매트릭스 그리드 뷰 */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-12 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 divide-x divide-slate-200">
          <div className="col-span-3 py-2.5 px-2 text-center flex items-center justify-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>시간대</span>
          </div>

          {(activeZoneTab === "ALL" || activeZoneTab === "A") && (
            <div
              className={`${
                activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
              } py-2.5 px-2 text-center bg-blue-50/50 text-blue-900 flex flex-col justify-center`}
            >
              <span>A구역</span>
              <span className="text-[9px] font-normal text-blue-600">분수광장</span>
            </div>
          )}

          {(activeZoneTab === "ALL" || activeZoneTab === "B") && (
            <div
              className={`${
                activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
              } py-2.5 px-2 text-center bg-amber-50/50 text-amber-900 flex flex-col justify-center`}
            >
              <span>B구역</span>
              <span className="text-[9px] font-normal text-amber-600">실내체육관</span>
            </div>
          )}

          {(activeZoneTab === "ALL" || activeZoneTab === "C") && (
            <div
              className={`${
                activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
              } py-2.5 px-2 text-center bg-emerald-50/50 text-emerald-900 flex flex-col justify-center`}
            >
              <span>C구역</span>
              <span className="text-[9px] font-normal text-emerald-600">가족공원</span>
            </div>
          )}
        </div>

        {/* 시간대별 로우 (Row) */}
        <div className="divide-y divide-slate-100 text-xs">
          {timeBuckets.map((bucket, bIdx) => {
            const aItems = bucket.items.filter((i) => i.zone === "A" || i.zone === "공통");
            const bItems = bucket.items.filter((i) => i.zone === "B" || i.zone === "공통");
            const cItems = bucket.items.filter((i) => i.zone === "C" || i.zone === "공통");

            const hasItems =
              (activeZoneTab === "ALL" && (aItems.length > 0 || bItems.length > 0 || cItems.length > 0)) ||
              (activeZoneTab === "A" && aItems.length > 0) ||
              (activeZoneTab === "B" && bItems.length > 0) ||
              (activeZoneTab === "C" && cItems.length > 0);

            if (!hasItems) return null;

            return (
              <div
                key={bIdx}
                className="grid grid-cols-12 divide-x divide-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                {/* 시간 컬럼 */}
                <div className="col-span-3 p-2 bg-slate-50/50 flex flex-col justify-center items-center text-center">
                  <span className="font-bold text-slate-800 text-[11px] leading-tight">
                    {bucket.label.split(" ~ ")[0]}
                  </span>
                  <span className="text-[9px] text-slate-400">~ {bucket.label.split(" ~ ")[1]}</span>
                </div>

                {/* A구역 컬럼 */}
                {(activeZoneTab === "ALL" || activeZoneTab === "A") && (
                  <div
                    className={`${
                      activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
                    } p-2 space-y-1.5 flex flex-col justify-center`}
                  >
                    {aItems.length > 0 ? (
                      aItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-lg border text-left ${
                            item.zone === "공통"
                              ? "bg-slate-100/80 border-slate-200 text-slate-800"
                              : "bg-blue-50/80 border-blue-200 text-blue-950"
                          }`}
                        >
                          <div className="font-bold text-[11px] leading-tight flex items-center space-x-1">
                            {item.isImportant && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                            )}
                            <span className="line-clamp-2">{item.title}</span>
                          </div>
                          <p className="text-[9px] text-blue-700/80 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-300 text-center py-1">-</div>
                    )}
                  </div>
                )}

                {/* B구역 컬럼 */}
                {(activeZoneTab === "ALL" || activeZoneTab === "B") && (
                  <div
                    className={`${
                      activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
                    } p-2 space-y-1.5 flex flex-col justify-center`}
                  >
                    {bItems.length > 0 ? (
                      bItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-lg border text-left ${
                            item.zone === "공통"
                              ? "bg-slate-100/80 border-slate-200 text-slate-800"
                              : item.title.includes("미사")
                              ? "bg-orange-50 border-orange-300 text-orange-950 ring-1 ring-orange-200"
                              : "bg-amber-50/80 border-amber-200 text-amber-950"
                          }`}
                        >
                          <div className="font-bold text-[11px] leading-tight flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {item.isImportant && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                              )}
                              <span className="line-clamp-2">{item.title}</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-amber-800/80 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          {item.title.includes("지성소") && (
                            <button
                              onClick={onOpenHolies}
                              className="mt-1 text-[9px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center space-x-0.5"
                            >
                              <span>지성소 상세 일정 보기</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {item.title.includes("미사") && (
                            <button
                              onClick={onOpenMassGuide}
                              className="mt-1 text-[9px] font-bold text-orange-700 hover:text-orange-900 underline flex items-center space-x-0.5"
                            >
                              <span>미사 3대 수칙 확인</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-300 text-center py-1">-</div>
                    )}
                  </div>
                )}

                {/* C구역 컬럼 */}
                {(activeZoneTab === "ALL" || activeZoneTab === "C") && (
                  <div
                    className={`${
                      activeZoneTab === "ALL" ? "col-span-3" : "col-span-9"
                    } p-2 space-y-1.5 flex flex-col justify-center`}
                  >
                    {cItems.length > 0 ? (
                      cItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-lg border text-left ${
                            item.zone === "공통"
                              ? "bg-slate-100/80 border-slate-200 text-slate-800"
                              : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          }`}
                        >
                          <div className="font-bold text-[11px] leading-tight flex items-center space-x-1">
                            {item.isImportant && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                            )}
                            <span className="line-clamp-2">{item.title}</span>
                          </div>
                          <p className="text-[9px] text-emerald-700/80 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-300 text-center py-1">-</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
