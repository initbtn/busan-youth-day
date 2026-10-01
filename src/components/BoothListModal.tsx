"use client";

import React, { useState, useMemo, useEffect } from "react";
import { OFFICIAL_ZONES, OfficialBooth, ZoneData } from "@/data/officialBooths";
import { MapPoint } from "@/data/boothLocations";
import {
  X,
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";

export interface BoothItemWithZone extends OfficialBooth {
  zoneId: ZoneData["id"];
  zoneName: string;
  zoneColor: string;
}

interface BoothListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialZoneId?: ZoneData["id"] | "all";
  onSelectBooth?: (point: Partial<MapPoint>) => void;
}

export function BoothListModal({
  isOpen,
  onClose,
  initialZoneId = "all",
  onSelectBooth,
}: BoothListModalProps) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<ZoneData["id"] | "all">(
    initialZoneId
  );
  const [onlySacrament, setOnlySacrament] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 모달이 열릴 때 또는 initialZoneId prop 변경 시 필터 상태 동기화 (stale state 방지)
  useEffect(() => {
    if (isOpen) {
      setSelectedZoneFilter(initialZoneId);
      setOnlySacrament(false);
      setSearchQuery("");
    }
  }, [isOpen, initialZoneId]);

  // ESC 키 입력 시 모달 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 81개 전체 부스 목록 평탄화 (Zone 정보 결합)
  const allBooths = useMemo<BoothItemWithZone[]>(() => {
    return OFFICIAL_ZONES.flatMap((zone) =>
      zone.booths.map((booth) => ({
        ...booth,
        zoneId: zone.id,
        zoneName: zone.koreanName,
        zoneColor: zone.color,
      }))
    );
  }, []);

  // 존별 및 7성사 부스 개수 동적 산출 (하드코딩 방지)
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allBooths.length,
      sacrament: allBooths.filter((b) => b.isSacrament).length,
    };
    OFFICIAL_ZONES.forEach((z) => {
      counts[z.id] = z.booths.length;
    });
    return counts;
  }, [allBooths]);

  // 필터링 및 검색 로직
  const filteredBooths = useMemo(() => {
    return allBooths.filter((booth) => {
      // 1. 테마존 필터
      if (selectedZoneFilter !== "all" && booth.zoneId !== selectedZoneFilter) {
        return false;
      }
      // 2. 7성사 필터
      if (onlySacrament && !booth.isSacrament) {
        return false;
      }
      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = booth.name.toLowerCase().includes(query);
        const matchZone = booth.zoneName.toLowerCase().includes(query);
        const matchNumber = booth.number.toString().includes(query);
        const matchSacrament = booth.sacramentType?.toLowerCase().includes(query);
        return matchName || matchZone || matchNumber || Boolean(matchSacrament);
      }
      return true;
    });
  }, [allBooths, selectedZoneFilter, onlySacrament, searchQuery]);

  if (!isOpen) return null;

  const handleBoothClick = (booth: BoothItemWithZone) => {
    if (onSelectBooth) {
      onSelectBooth({
        name: `${booth.name} (${booth.zoneName} ${booth.number}번)`,
        zoneId: booth.zoneId,
        zoneName: booth.zoneName,
        boothNumber: booth.number,
        isSacrament: booth.isSacrament,
        sacramentType: booth.sacramentType,
      });
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] border border-slate-100 overflow-hidden"
      >
        {/* 모달 헤더 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                공식 안내
              </span>
              <h3 className="text-sm font-black text-slate-900">
                81개 전체 부스 목록 및 위치 탐색
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              원하는 부스를 선택하면 지도가 해당 좌표로 이동합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-200/80 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
            aria-label="모달 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="p-3 space-y-2 border-b border-slate-100 bg-white">
          {/* 검색창 input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="부스 이름, 단체명, 번호 또는 7성사 검색..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 4대 테마존 및 7성사 필터 칩 */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
            <button
              onClick={() => setSelectedZoneFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedZoneFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              전체 ({zoneCounts.all})
            </button>
            <button
              onClick={() => setSelectedZoneFilter("faith")}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedZoneFilter === "faith"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              믿음존 ({zoneCounts.faith || 19})
            </button>
            <button
              onClick={() => setSelectedZoneFilter("hope")}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedZoneFilter === "hope"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              희망존 ({zoneCounts.hope || 21})
            </button>
            <button
              onClick={() => setSelectedZoneFilter("love")}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedZoneFilter === "love"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              사랑존 ({zoneCounts.love || 31})
            </button>
            <button
              onClick={() => setSelectedZoneFilter("sharing")}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedZoneFilter === "sharing"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              나눔존 ({zoneCounts.sharing || 10})
            </button>
            <button
              onClick={() => setOnlySacrament((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                onlySacrament
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>7성사 필수 ({zoneCounts.sacrament || 7})</span>
            </button>
          </div>
        </div>

        {/* 부스 리스트 영역 */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredBooths.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">조건에 맞는 부스를 찾을 수 없습니다.</p>
              <p className="text-[11px] text-slate-400">검색어 또는 필터를 변경해보세요.</p>
            </div>
          ) : (
            filteredBooths.map((booth) => (
              <div
                key={`${booth.zoneId}-${booth.number}`}
                onClick={() => handleBoothClick(booth)}
                className="p-2.5 rounded-xl hover:bg-orange-50/60 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {booth.number}
                  </span>
                  <div>
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-orange-950">
                        {booth.name}
                      </span>
                      {booth.isSacrament && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full inline-flex items-center space-x-0.5">
                          <span>✝️ 7성사</span>
                          {booth.sacramentType && <span>({booth.sacramentType})</span>}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {booth.zoneName} · 부스 {booth.number}번
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-orange-600 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 푸터 카운터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            총 <strong className="text-slate-800">{allBooths.length}</strong>개 부스 중{" "}
            <strong className="text-orange-600">{filteredBooths.length}</strong>개 표시 중
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
