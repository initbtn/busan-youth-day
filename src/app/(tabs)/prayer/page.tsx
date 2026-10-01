"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import prayerData from "../../../../public/assets/yd2027-official-prayer.json";

export default function PrayerPage() {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedSide, setSelectedSide] = useState<"front" | "back">("front");
  const [activeTab, setActiveTab] = useState<"card" | "text">("card");

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "2027 WYD 서울 공식 기도문 상본",
          text: "2027 서울 세계청년대회 공식 기도문을 확인해보세요.",
          url: window.location.href,
        });
      } catch (err) {
        console.log("공유 취소 또는 오류", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("기도문 페이지 링크가 복사되었습니다.");
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
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              영적 순례 자료
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              2027 WYD 서울 공식 기도문 상본
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleShare}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
            title="공유하기"
            aria-label="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 탭 네비게이션: 고화질 상본 뷰어 vs 텍스트로 읽기 */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs flex space-x-1.5">
        <button
          onClick={() => setActiveTab("card")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "card"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          고화질 상본 앞/뒤
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "text"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          텍스트 전문 읽기
        </button>
      </div>

      {/* 상본 카드 뷰어 */}
      {activeTab === "card" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl">
            <div className="flex space-x-1">
              <button
                onClick={() => setSelectedSide("front")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  selectedSide === "front"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                앞면 (심볼)
              </button>
              <button
                onClick={() => setSelectedSide("back")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  selectedSide === "back"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                뒷면 (기도문)
              </button>
            </div>
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
                src={
                  selectedSide === "front"
                    ? "/assets/spiritual/prayer_card_front.png"
                    : "/assets/spiritual/prayer_card_back.png"
                }
                alt={selectedSide === "front" ? "기도문 상본 앞면" : "기도문 상본 뒷면"}
                width={360}
                height={520}
                className="rounded-xl shadow-2xl object-contain pointer-events-none max-w-full"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* 텍스트 전문 읽기 탭 */}
      {activeTab === "text" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700">
          <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium">
            {prayerData.intro_notice}
          </div>

          {prayerData.sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md inline-block">
                {section.tag}
              </span>
              <p className="text-slate-800 whitespace-pre-line text-xs leading-relaxed pl-1 font-serif">
                {section.content}
              </p>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {prayerData.invocations.map((inv, idx) => (
              <div key={idx} className="text-xs flex justify-between bg-slate-50 p-2.5 rounded-xl">
                <span className="font-semibold text-slate-800">◎ {inv.call}</span>
                <span className="text-blue-600 font-medium">○ {inv.response}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right text-xs text-slate-400 font-medium">
            {prayerData.footnote}
          </div>
        </div>
      )}
    </div>
  );
}
