"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, Share2, BookOpen } from "lucide-react";
import { PATRON_SAINTS_DATA, PatronSaint } from "@/data/patronSaints";

interface FullSpiritualViewerProps {
  type: "prayer" | "song" | "saints" | null;
  onClose: () => void;
}

export function FullSpiritualViewer({ type, onClose }: FullSpiritualViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedPrayerSide, setSelectedPrayerSide] = useState<"front" | "back">("front");
  const [selectedSaint, setSelectedSaint] = useState<PatronSaint>(PATRON_SAINTS_DATA[0]);

  if (!type) return null;

  const isPrayer = type === "prayer";
  const isSong = type === "song";
  const isSaints = type === "saints";

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white animate-in fade-in duration-200">
      {/* 상단 네비게이션 헤더 */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">
            {isPrayer && "2027 WYD 서울 공식 기도문 상본"}
            {isSong && "청·청해 주제가: 하느님 나라에"}
            {isSaints && "2027 서울 WYD 수호성인 5인"}
          </h2>
          <p className="text-[10px] text-slate-400">
            {isPrayer && "앞면(상본 심볼) & 뒷면(공식 기도문)"}
            {isSong && "바오누리 작사·작곡 (공식 전면 악보)"}
            {isSaints && "세계청년대회 공식 수호성인 소개 및 전구 기도"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isSaints && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors ml-1"
            title="닫기"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 1. 수호성인 소개 뷰 */}
      {isSaints && (
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4">
          {/* 성인 선택 탭 */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {PATRON_SAINTS_DATA.map((saint) => (
              <button
                key={saint.id}
                onClick={() => setSelectedSaint(saint)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedSaint.id === saint.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-102"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {saint.name.replace("성 ", "")}
              </button>
            ))}
          </div>

          {/* 성인 상세 카드 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700 shadow-md">
                <Image
                  src={selectedSaint.image}
                  alt={selectedSaint.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-orange-400 font-bold bg-orange-950/60 border border-orange-800/60 px-2 py-0.5 rounded-full inline-block">
                  축일: {selectedSaint.feastDay}
                </span>
                <h3 className="text-base font-black text-white">{selectedSaint.name}</h3>
                <p className="text-xs text-slate-300 font-semibold">{selectedSaint.title}</p>
              </div>
            </div>

            {/* 소개 글 */}
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
              <span className="text-[11px] font-bold text-orange-300 block mb-1">성인 소개</span>
              <p className="text-xs leading-relaxed text-slate-300 font-normal">
                {selectedSaint.description}
              </p>
            </div>

            {/* 상징물 안내 */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-2xl text-xs">
              <span className="text-[11px] font-bold text-amber-300 block mb-0.5">
                수호성인 상징물: {selectedSaint.symbol}
              </span>
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                {selectedSaint.symbolDescription}
              </p>
            </div>

            {/* 수호성인 기도문 */}
            <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-400">
                <BookOpen className="w-4 h-4" />
                <span>수호성인 기도문</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 font-medium italic whitespace-pre-line">
                {selectedSaint.prayer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 기도문 상본 앞/뒤 뷰어 */}
      {isPrayer && (
        <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center space-y-3">
          {/* 앞면/뒷면 전환 버튼 */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedPrayerSide("front")}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                selectedPrayerSide === "front"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              상본 앞면 (심볼 & 성구)
            </button>
            <button
              onClick={() => setSelectedPrayerSide("back")}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                selectedPrayerSide === "back"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              상본 뒷면 (공식 기도문)
            </button>
          </div>

          <div
            className="relative transition-transform duration-200 origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-white"
            style={{
              transform: `scale(${zoomLevel})`,
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <img
              src={
                selectedPrayerSide === "front"
                  ? "/assets/wyd2027_prayer_card_front.webp"
                  : "/assets/wyd2027_prayer_card_back.webp"
              }
              alt="2027 WYD 공식 기도문 상본"
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>
      )}

      {/* 3. 주제가 악보 뷰어 */}
      {isSong && (
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          <div
            className="relative transition-transform duration-200 origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-white"
            style={{
              transform: `scale(${zoomLevel})`,
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <img
              src="/assets/theme_song_sheet_music.webp"
              alt="하느님 나라에 악보"
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>
      )}

      {/* 하단 툴바 안내 */}
      <footer className="py-2.5 px-4 bg-slate-900/90 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          {isSaints ? "2027 서울 세계청년대회 공식 수호성인 소개" : "손가락 핀치 줌으로 확대 가능"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("공유 링크가 복사되었습니다!");
          }}
          className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 font-bold"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>공유</span>
        </button>
      </footer>
    </div>
  );
}
