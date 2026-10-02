"use client";

import React from "react";
import { X, Sparkles, HeartHandshake, CheckCircle2, ShieldAlert } from "lucide-react";

interface MassGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MassGuideModal({ isOpen, onClose }: MassGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-blue-100 flex flex-col max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-200 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>2026 BYD 축제(파견) 미사 안내</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">미사 참여 3대 수칙 (전례 가이드)</h2>
          <p className="text-xs text-blue-100 mt-1">
            주교단 공동 집전 파견미사의 은혜롭고 질서 있는 참례를 위한 필수 안내
          </p>
        </div>

        {/* 3대 핵심 수칙 카드 리스트 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 수칙 1: 청소년/젊은이를 위한 기도 */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <h3 className="text-sm font-bold text-blue-950">청소년 기도 (젊은이를 위한 기도)</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              본 파견미사는 교구 청소년과 청년들을 축복하는 <span className="font-bold text-blue-900">‘젊은이를 위한 기도’</span>와 함께 봉헌됩니다. 미사 중 배부되는 기도서 및 화면 가사에 맞춰 한목소리로 기도해 주시기 바랍니다.
            </p>
          </div>

          {/* 수칙 2: 봉헌 방식 및 주머니 이동 */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3 className="text-sm font-bold text-indigo-950">봉헌 방식 (봉헌 주머니 이용)</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              대규모 인원의 안전을 위해 <span className="font-bold text-indigo-900">신자 개별 이동 없이 제자리에서 봉헌</span>합니다. 안내 봉사자가 줄별로 배부하는 <span className="font-bold text-indigo-900">봉헌 주머니(가방)</span>를 옆 사람에게 차례로 전달해 주세요.
            </p>
          </div>

          {/* 수칙 3: 영성체 이동 및 질서 통제 */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              <h3 className="text-sm font-bold text-purple-950">영성체 이동 (안내 봉사자 지시 준수)</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              성체를 모실 때에는 좌석 간 혼잡 및 전도를 방지하기 위해 반드시 <span className="font-bold text-purple-900">안내 봉사자의 통제와 줄별 신호</span>에 맞추어 경건하고 순서대로 행렬하여 영성체 대열로 이동해 주시기 바랍니다.
            </p>
          </div>

          {/* 추가 전례 에티켓 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <span>전례 엄수 추가 안내</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 pl-1">
              <li>실내체육관 본당 지정 좌석에 15:30까지 반드시 착석을 완료해 주세요.</li>
              <li>미사 중 전자기기 무음 전환 및 무단 플래시 사진 촬영을 제한합니다.</li>
              <li>개인 미사보 및 묵주 지참을 권장합니다.</li>
            </ul>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>경건한 전례는 우리 모두의 협조로 완성됩니다</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>가이드 숙지 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
}
