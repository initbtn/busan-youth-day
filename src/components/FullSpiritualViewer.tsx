"use client";

import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, Share2 } from "lucide-react";

interface FullSpiritualViewerProps {
  type: "prayer" | "song" | null;
  onClose: () => void;
}

export function FullSpiritualViewer({ type, onClose }: FullSpiritualViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!type) return null;

  const isPrayer = type === "prayer";
  const title = isPrayer ? "2027 WYD 서울 공식 기도문" : "청·청해 주제가: 하느님 나라에";
  const subtitle = isPrayer
    ? "2026 부산 젊은이의 날(BYD) 영적 준비"
    : "바오누리 작사·작곡 (공식 악보)";
  const imageSrc = isPrayer
    ? "/assets/yd2027_official_prayer_image.webp"
    : "/assets/theme_song_sheet_music.webp";

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white animate-in fade-in duration-200">
      {/* 상단 네비게이션 헤더 */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 줌 조절 버튼 */}
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
          <button
            onClick={onClose}
            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 전면 이미지 뷰어 본문 (모바일 최적화 및 스크롤/줌) */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div
          className="relative transition-transform duration-200 origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-white"
          style={{
            transform: `scale(${zoomLevel})`,
            width: "100%",
            maxWidth: isPrayer ? "480px" : "600px",
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto object-contain block"
          />
        </div>
      </div>

      {/* 하단 툴바 안내 */}
      <footer className="py-2.5 px-4 bg-slate-900/90 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between">
        <span>스마트폰 손가락 핀치 줌으로 확대하여 편하게 보실 수 있습니다.</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("링크가 복사되었습니다!");
          }}
          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>공유</span>
        </button>
      </footer>
    </div>
  );
}
