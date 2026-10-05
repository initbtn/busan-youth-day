"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { isVideoUrl } from "@/lib/videoCompressor";
import { ModalPortal } from "@/components/ModalPortal";

export interface MediaSliderViewerProps {
  isOpen: boolean;
  mediaUrls: string[];
  initialIndex?: number;
  onClose: () => void;
  authorName?: string;
  createdAt?: string;
}

export function MediaSliderViewer({
  isOpen,
  mediaUrls,
  initialIndex = 0,
  onClose,
  authorName,
  createdAt,
}: MediaSliderViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 모달이 열릴 때 initialIndex로 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, mediaUrls.length - 1)));
      setScale(1);
    }
  }, [isOpen, initialIndex, mediaUrls.length]);

  const handlePrev = useCallback(() => {
    setScale(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  }, [mediaUrls.length]);

  const handleNext = useCallback(() => {
    setScale(1);
    setCurrentIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  }, [mediaUrls.length]);

  // 키보드 네비게이션 (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // 터치 스와이프 제스처
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (diffX > swipeThreshold) {
      handleNext();
    } else if (diffX < -swipeThreshold) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || mediaUrls.length === 0) return null;

  const currentMediaUrl = mediaUrls[currentIndex] || "";
  const isVideo = isVideoUrl(currentMediaUrl);

  const toggleZoom = () => {
    setScale((prev) => (prev === 1 ? 2 : 1));
  };

  return (
    <ModalPortal>
      <div
        data-testid="media-slider-viewer"
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 상단 헤더 툴바 */}
        <header className="flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center space-x-3">
            <button
              data-testid="slider-close-button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="닫기 (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              {authorName && (
                <span className="text-sm font-semibold block">
                  {authorName}
                  {createdAt && <span className="text-xs font-normal text-white/60 ml-1.5">· {createdAt}</span>}
                </span>
              )}
              <span data-testid="slider-counter" className="text-xs text-white/70">
                {currentIndex + 1} / {mediaUrls.length}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isVideo && (
              <button
                onClick={toggleZoom}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title={scale > 1 ? "축소" : "확대"}
              >
                {scale > 1 ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
            )}
            <a
              href={currentMediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="다운로드/새창 열기"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* 중앙 미디어 뷰어 영역 */}
        <main className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6">
          {isVideo ? (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <video
                src={currentMediaUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] max-w-[95vw] rounded-lg shadow-2xl object-contain"
              />
            </div>
          ) : (
            <div
              className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
              style={{ transform: `scale(${scale})` }}
              onDoubleClick={toggleZoom}
            >
              <img
                src={currentMediaUrl}
                alt={`미디어 ${currentIndex + 1}`}
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl cursor-zoom-in"
              />
            </div>
          )}

          {/* 이전 / 다음 버튼 (2장 이상일 때만 노출) */}
          {mediaUrls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                title="이전 사진 (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                title="다음 사진 (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </main>

        {/* 하단 썸네일 바 (2장 이상일 때) */}
        {mediaUrls.length > 1 && (
          <footer className="p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center overflow-x-auto space-x-2 z-10">
            {mediaUrls.map((url, idx) => (
              <button
                key={`${url}-${idx}`}
                onClick={() => {
                  setScale(1);
                  setCurrentIndex(idx);
                }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  idx === currentIndex ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {isVideoUrl(url) ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                    VIDEO
                  </div>
                ) : (
                  <img src={url} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </footer>
        )}
      </div>
    </ModalPortal>
  );
}
