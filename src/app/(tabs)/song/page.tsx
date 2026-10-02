"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ZoomIn, ZoomOut, Share2, Music } from "lucide-react";
import themeSongData from "../../../../public/assets/theme-song-gods-kingdom.json";

export default function SongPage() {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"sheet" | "video">("sheet");

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "청·청해 주제가: 하느님 나라에",
          text: "부산교구 청소년의 날 주제가 '하느님 나라에' 악보 및 율동영상입니다.",
          url: window.location.href,
        });
      } catch (err) {
        console.log("공유 취소 또는 오류", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("주제가 페이지 링크가 복사되었습니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 상단 헤더 & 뒤로가기 */}
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
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
              영적 순례 자료
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              청·청해 주제가: 하느님 나라에
            </h2>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
          title="공유하기"
          aria-label="공유하기"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs flex space-x-1.5">
        <button
          onClick={() => setActiveTab("sheet")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sheet"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          전면 악보
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "video"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          율동영상
        </button>
      </div>

      {/* 악보 탭 */}
      {activeTab === "sheet" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600 px-2">
              바오누리 작사·작곡
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-xs border border-slate-200"
                title="축소"
                aria-label="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-xs border border-slate-200"
                title="확대"
                aria-label="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-2xl overflow-auto min-h-[460px] flex items-center justify-center p-4 border border-slate-800 shadow-inner">
            <div
              className="relative transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <Image
                src="/assets/theme_song_sheet_music.webp"
                alt="하느님 나라에 악보"
                width={400}
                height={560}
                className="rounded-xl shadow-2xl object-contain pointer-events-none max-w-full"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* 율동영상 탭 */}
      {activeTab === "video" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">주제가 율동 및 찬양 영상</h3>
              <p className="text-[11px] text-slate-500">2026 청소년·청년의 날 율동을 함께 배워보세요</p>
            </div>
            <Music className="w-5 h-5 text-amber-500" />
          </div>

          {/* YouTube iframe 반응형 미디어 소스 */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
            <iframe
              className="w-full h-full"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/Jvcya-Qw77s?si=1YzDpgXzhwEJagE9"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <span>작곡: <strong className="text-slate-800">{themeSongData.composer}</strong></span>
            <span>·</span>
            <span>Key: <strong className="text-slate-800">{themeSongData.original_key}</strong></span>
            <span>·</span>
            <span>박자: <strong className="text-slate-800">{themeSongData.time_signature}</strong></span>
            <span>·</span>
            <span>빠르기: <strong className="text-slate-800">{themeSongData.tempo}</strong></span>
          </div>

          <div className="space-y-4">
            {themeSongData.structure.map((part, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-amber-700 mb-2">
                  {part.section} ({part.measures}마디)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {part.chords_and_lyrics.map((item, mIdx) => (
                    <div key={mIdx} className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="font-mono font-bold text-amber-600 block text-[10px]">
                        {item.chord}
                      </span>
                      <span className="text-slate-800 font-medium text-xs">{item.lyrics}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
