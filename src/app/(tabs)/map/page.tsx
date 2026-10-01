"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Music, Sparkles } from "lucide-react";
import { KakaoMapView } from "@/components/KakaoMapView";
import { OFFICIAL_ZONES, ZoneData } from "@/data/officialBooths";
import { INDOOR_STAGE_PROGRAMS, OUTDOOR_STAGE_PROGRAMS } from "@/data/stageSchedule";

type ZoneId = ZoneData["id"];

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<"booths" | "stages" | "map">("map");
  const [selectedZone, setSelectedZone] = useState<ZoneId>("faith");

  const currentZoneData = OFFICIAL_ZONES.find((z) => z.id === selectedZone)!;

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
              공식 부스 · 무대 · 행사장 안내
            </h2>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs flex space-x-1.5">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "map"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          실시간 지도
        </button>
        <button
          onClick={() => setActiveTab("booths")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "booths"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          4대 테마존 부스 (81개)
        </button>
        <button
          onClick={() => setActiveTab("stages")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "stages"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          특설무대 일정
        </button>
      </div>

      {/* 실시간 지도 탭 */}
      {activeTab === "map" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[480px]">
            <KakaoMapView />
          </div>
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl text-xs text-orange-800 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <span>📍 스포원파크 야외 분수광장 현장</span>
            </p>
            <p className="text-[11px] text-orange-700">
              지도의 구역 마커나 핀을 터치하면 상세 부스 목록과 번호를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 부스 목록 탭 */}
      {activeTab === "booths" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-1.5">
            {OFFICIAL_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  selectedZone === zone.id
                    ? `bg-gradient-to-r ${zone.color} text-white shadow-sm scale-[1.02]`
                    : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                }`}
              >
                <span>{zone.name.split(" ")[0]}</span>
                <span className="text-[10px] opacity-80">{zone.booths.length}개</span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${currentZoneData.color}`}>
                  {currentZoneData.name}
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-1">{currentZoneData.koreanName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{currentZoneData.description}</p>
              </div>
              <span className="text-xs font-bold text-slate-400">총 {currentZoneData.booths.length}개 부스</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden max-h-[500px] overflow-y-auto">
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
        </div>
      )}

      {/* 무대 일정 탭 */}
      {activeTab === "stages" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold text-slate-800">실내체육관 메인 스테이지</h3>
            </div>
            <div className="space-y-2">
              {INDOOR_STAGE_PROGRAMS.map((prog, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-700">{prog.time}</span>
                  <span className="font-medium text-slate-900">{prog.performer}</span>
                  <span className="text-[10px] text-slate-400">{prog.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Music className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800">야외 분수광장 버스킹/청년무대</h3>
            </div>
            <div className="space-y-2">
              {OUTDOOR_STAGE_PROGRAMS.map((prog, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-700">{prog.time}</span>
                  <span className="font-medium text-slate-900">{prog.performer}</span>
                  <span className="text-[10px] text-slate-400">{prog.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
