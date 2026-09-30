"use client";

import React, { useState } from "react";
import { PARISH_SEATING_DATA, findSeatByParish } from "@/data/gymSeating";
import { useUser } from "@/context/UserContext";
import { Search, MapPin, ShieldAlert } from "lucide-react";

export default function GymSeatingViewer() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<"전체" | "1층" | "2층">("전체");

  // 현재 사용자 본당 좌석
  const myParishSeat = user?.parish ? findSeatByParish(user.parish) : undefined;

  // 검색 필터링
  const filteredSeats = PARISH_SEATING_DATA.filter((item) => {
    const matchesQuery =
      item.parish.includes(searchQuery) ||
      item.district.includes(searchQuery) ||
      item.sector.includes(searchQuery);
    const matchesFloor = selectedFloor === "전체" || item.floor === selectedFloor;
    return matchesQuery && matchesFloor;
  });

  return (
    <div className="space-y-4">
      {/* 1. 내 본당 미사 지정석 카드 */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex items-center space-x-2 text-orange-100 text-xs font-semibold mb-1">
          <MapPin className="w-4 h-4 text-orange-200" />
          <span>내 본당 실내체육관 미사 지정석</span>
        </div>

        {myParishSeat ? (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black">{myParishSeat.parish}성당</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {myParishSeat.district}
              </span>
            </div>
            <div className="mt-2 p-3 bg-black/20 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-orange-100 block">배정 구역</span>
                <span className="text-lg font-black text-amber-200">
                  {myParishSeat.floor} [{myParishSeat.sector}]
                </span>
              </div>
              {myParishSeat.seatCount && (
                <div className="text-right">
                  <span className="text-[10px] text-orange-100 block">배정 인원</span>
                  <span className="text-sm font-bold">{myParishSeat.seatCount}석</span>
                </div>
              )}
            </div>
            {myParishSeat.notes && (
              <p className="text-[10px] text-orange-100/90 pt-1">💡 {myParishSeat.notes}</p>
            )}
          </div>
        ) : (
          <div className="mt-3 bg-white/10 p-3 rounded-2xl text-xs text-orange-50">
            <p className="font-semibold">참가자 프로필에서 본당을 선택하면 내 좌석이 자동 표시됩니다.</p>
            <p className="text-[10px] text-orange-200 mt-1">
              (현재: {user?.parish ? `${user.parish} - 매핑 데이터 확인 필요` : "본당 미설정"})
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] text-orange-100 border-t border-white/20 pt-2.5">
          <span>⏰ 15:30 ~ 15:55 지정석 착석 완료</span>
          <span className="font-bold">16:30 미사 봉헌</span>
        </div>
      </div>

      {/* 2. 일반 교구민 및 분산 참례 안내 (공문 G26-146 붙임4 기준) */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
        <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>실내 지정석 대상 및 분산 참례 장소 안내</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          • <strong>실내체육관 지정석 대상</strong>: 사전 등록된 초등부·중고등부·청년·인솔 교리교사 및 인솔 사제·수도자
        </p>
        <p className="text-[11px] leading-relaxed">
          • <strong>일반 교구민/부모/조부모 분산 참례 장소</strong>: 실내체육관 1F 탁구장, 1F 문화홀(지성소), 야외 무대(스크린/음향), 봉사자 식당 (모든 분산 장소에서 영성체 동일 진행)
        </p>
        <p className="text-[10px] text-amber-800 bg-amber-100/60 p-2 rounded-xl">
          👟 체육관 바닥 보호를 위해 <strong>운동화 착용 필수</strong> (구두/슬리퍼 입장 제한)
        </p>
      </div>

      {/* 3. 본당별 전체 좌석 검색기 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">전체 본당 좌석배치도 검색</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {(["전체", "1층", "2층"] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedFloor === floor
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 인풋 */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="본당명, 지구명, 섹터 검색 (예: 몰운대, 남천, 1-1)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 좌석 리스트 */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
          {filteredSeats.length > 0 ? (
            filteredSeats.map((item, idx) => (
              <div
                key={`${item.parish}-${idx}`}
                className={`py-2.5 px-2 flex items-center justify-between rounded-xl transition-colors ${
                  user?.parish && (user.parish === item.parish || user.parish.includes(item.parish))
                    ? "bg-orange-50/80 font-bold border border-orange-200/60"
                    : "hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{item.parish}성당</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.district}
                    </span>
                  </div>
                  {item.notes && <p className="text-[10px] text-orange-600 mt-0.5">{item.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-orange-100 text-orange-700 font-bold rounded-lg text-xs">
                    {item.floor} [{item.sector}]
                  </span>
                  {item.seatCount && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.seatCount}석</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              일치하는 본당 정보가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
