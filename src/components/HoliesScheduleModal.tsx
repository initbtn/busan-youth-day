"use client";

import React from "react";
import { HOLIES_SCHEDULE } from "@/data/holiesSchedule";
import { X, Clock, MapPin, Sparkles, Users, Info, Heart } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";

interface HoliesScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HoliesScheduleModal({ isOpen, onClose }: HoliesScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-100 flex flex-col max-h-[90vh]">
          {/* 모달 헤더 */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 p-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-200 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>B구역 실내체육관 1F 문화홀</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">지성소 (Holy Presence) 상세 일정</h2>
            <p className="text-xs text-amber-100 mt-1">
              주님 대전에서 침묵과 찬양으로 머무는 거룩한 영적 쉼터
            </p>
          </div>

          {/* 안내 배너 */}
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-start space-x-2 text-[11px] text-amber-900">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">입장 수칙: </span>
              성체 대전 정숙 유지를 위해 1회 100명 정원제로 운영되며 대기 번호표가 배부될 수 있습니다. (신발주머니 지참)
            </div>
          </div>

          {/* 5대 타임슬롯 리스트 */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
            {HOLIES_SCHEDULE.map((slot) => {
              const badgeColor =
                slot.badge === "성체조배"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : slot.badge === "찬양"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : slot.badge === "기도"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-purple-100 text-purple-800 border-purple-200";

              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-amber-50/30 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-black text-slate-800">{slot.time}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                    >
                      {slot.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{slot.title}</h3>
                    <p className="text-xs text-amber-700 font-medium">{slot.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{slot.description}</p>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>진행: {slot.leaderOrTeam}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>문화홀 제대 앞</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 모달 푸터 */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>침묵과 경당 내 음식물 섭취 금지</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              확인 및 닫기
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
