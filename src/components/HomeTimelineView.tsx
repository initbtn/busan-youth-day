"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { EVENT_SCHEDULE } from "@/data/schedule";
import { FullSpiritualViewer } from "@/components/FullSpiritualViewer";
import { OfficialBoothStageGuide } from "@/components/OfficialBoothStageGuide";
import {
  Calendar,
  MapPin,
  Sparkles,
  Megaphone,
  Edit3,
} from "lucide-react";

export function HomeTimelineView() {
  const { user, isLeader, parishNotices, updateParishNotice } = useUser();
  const [selectedDay, setSelectedDay] = useState<15 | 16 | 17>(15);
  const [spiritualViewer, setSpiritualViewer] = useState<"prayer" | "song" | "saints" | null>(null);
  const [isMapGuideOpen, setIsMapGuideOpen] = useState(false);

  // 본당 CMS 공지 작성 상태
  const userParish = user?.parish || "하단";
  const currentNotice = parishNotices[userParish];
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState(currentNotice?.content || "");

  const handleSaveNotice = () => {
    if (!noticeDraft.trim()) return;
    updateParishNotice(userParish, noticeDraft);
    setIsEditingNotice(false);
  };

  return (
    <div className="space-y-5">
      {/* 공식 마스코트 '쭈양이' 웰컴 카드 */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1.5 z-10 max-w-[65%]">
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>공식 마스코트 쭈양이</span>
          </span>
          <h2 className="text-lg font-black leading-tight">지금 여기, 주님이 함께!</h2>
          <p className="text-[11px] text-orange-100 leading-snug">
            4대 테마존 부스에서 QR 스탬프 꾹! 도장을 모아 한정판 굿즈를 교환받으세요.
          </p>
          <div className="pt-1 flex items-center space-x-2">
            <Link
              href="/map"
              className="px-3 py-1.5 bg-white text-orange-600 text-xs font-bold rounded-xl shadow-xs hover:bg-orange-50 transition-colors flex items-center space-x-1"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>현장지도</span>
            </Link>
            <Link
              href="/seating"
              className="px-3 py-1.5 bg-white/90 text-orange-700 text-xs font-bold rounded-xl shadow-xs hover:bg-white transition-colors"
            >
              좌석 확인
            </Link>
            <Link
              href="/stamp"
              className="px-3 py-1.5 bg-black/20 text-white text-xs font-bold rounded-xl hover:bg-black/30 transition-colors"
            >
              스탬프 북 ➔
            </Link>
          </div>
        </div>
        <div className="relative w-28 h-28 flex-shrink-0 -mr-2">
          <Image
            src="/assets/characters/jjuyang1.png"
            alt="쭈양이 마스코트"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* 본당 공지사항 카드 (참가자 맞춤 + 교리교사/사제/수도자 CMS 작성) */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-xl">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                [{userParish}성당] 참가자 긴급 공지
              </h3>
              <p className="text-[10px] text-slate-500">
                {currentNotice ? `${currentNotice.authorRole} · ${currentNotice.updatedAt}` : "본당 인솔자 알림"}
              </p>
            </div>
          </div>

          {isLeader && !isEditingNotice && (
            <button
              onClick={() => {
                setNoticeDraft(currentNotice?.content || "");
                setIsEditingNotice(true);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-[11px] font-bold border border-blue-200 shadow-xs"
            >
              <Edit3 className="w-3 h-3" />
              <span>공지 작성/수정</span>
            </button>
          )}
        </div>

        {isEditingNotice ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={noticeDraft}
              onChange={(e) => setNoticeDraft(e.target.value)}
              placeholder="우리 본당 참가자들에게 알릴 집결 장소, 식사 위치, 공지사항을 입력하세요..."
              className="w-full text-xs p-3 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingNotice(false)}
                className="px-3 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleSaveNotice}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm"
              >
                공지 게시
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-slate-700 bg-white/80 p-3.5 rounded-2xl border border-blue-50">
            {currentNotice?.content || "등록된 본당 공지사항이 없습니다. 인솔자의 안내를 확인해 주세요."}
          </p>
        )}
      </div>

      {/* 3-Day 행사 일정 탭 (목업 Page 6: Oct 15, 16, 17) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
        <span className="text-xs font-bold text-slate-500 block mb-2 px-1">BYD 행사 일정</span>
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => setSelectedDay(15)}
            className={`py-2 px-3 rounded-2xl transition-all border ${
              selectedDay === 15
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <span className="text-[10px] block font-medium opacity-80">본대회</span>
            <span className="text-lg font-black block">10.04</span>
            <span className="text-[10px] block opacity-80">(주일)</span>
          </button>

          <button
            onClick={() => setSelectedDay(16)}
            className={`py-2 px-3 rounded-2xl transition-all border ${
              selectedDay === 16
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <span className="text-[10px] block font-medium opacity-80">사목주간</span>
            <span className="text-lg font-black block">Youth</span>
            <span className="text-[10px] block opacity-80">(부산교구)</span>
          </button>

          <button
            onClick={() => setSelectedDay(17)}
            className={`py-2 px-3 rounded-2xl transition-all border ${
              selectedDay === 17
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <span className="text-[10px] block font-medium opacity-80">2027</span>
            <span className="text-lg font-black block">WYD</span>
            <span className="text-[10px] block opacity-80">(서울)</span>
          </button>
        </div>
      </div>

      {/* 영적 카드 3종: 전면 고화질 상본/악보/수호성인 뷰어 연결 (기획서 Page 6 반영) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500">2027 WYD 영적 순례 자료</h3>
          <span className="text-[10px] text-orange-600 font-semibold">전면 고화질 뷰어</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/prayer"
            className="cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-3 shadow-md shadow-blue-100 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <span className="text-xl mb-3">📜</span>
            <div>
              <h4 className="text-xs font-bold leading-tight">WYD 공식 기도</h4>
              <p className="text-[9px] text-blue-100/90 mt-0.5">상본 앞/뒤</p>
            </div>
          </Link>

          <Link
            href="/saints"
            className="cursor-pointer bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-2xl p-3 shadow-md shadow-orange-100 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <span className="text-xl mb-3">🕊️</span>
            <div>
              <h4 className="text-xs font-bold leading-tight">수호성인 5인</h4>
              <p className="text-[9px] text-orange-100/90 mt-0.5">소개 & 기도</p>
            </div>
          </Link>

          <Link
            href="/song"
            className="cursor-pointer bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl p-3 shadow-md shadow-amber-100 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <span className="text-xl mb-3">🎵</span>
            <div>
              <h4 className="text-xs font-bold leading-tight">하느님 나라에</h4>
              <p className="text-[9px] text-amber-100/90 mt-0.5">공식 악보</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 실시간 타임라인 (기획서 Page 6) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900">본대회 타임라인</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">스포원파크</span>
        </div>

        <div className="space-y-4">
          {EVENT_SCHEDULE.map((item, idx) => (
            <div key={idx} className="flex space-x-3 text-xs relative">
              <div className="w-18 flex-shrink-0 font-bold text-slate-600 pt-0.5">
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
                      item.isImportant ? "text-orange-950 font-black" : "text-slate-800"
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

      {/* 전면 고화질 영적 뷰어 및 지도 모달 */}
      <FullSpiritualViewer
        type={spiritualViewer}
        onClose={() => setSpiritualViewer(null)}
      />
      <OfficialBoothStageGuide
        isOpen={isMapGuideOpen}
        onClose={() => setIsMapGuideOpen(false)}
        defaultTab="map"
      />
    </div>
  );
}
