"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, BookOpen } from "lucide-react";
import { PATRON_SAINTS_DATA, PatronSaint } from "@/data/patronSaints";

export default function SaintsPage() {
  const [selectedSaint, setSelectedSaint] = useState<PatronSaint>(PATRON_SAINTS_DATA[0]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "2027 서울 WYD 수호성인 5인",
          text: `${selectedSaint.name} 수호성인 소개 및 전구 기도문을 확인해보세요.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("공유 취소 또는 오류", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("수호성인 페이지 링크가 복사되었습니다.");
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
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              영적 순례 자료
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              2027 서울 WYD 수호성인 5인
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

      {/* 5인 수호성인 선택 가로 스크롤 탭 */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {PATRON_SAINTS_DATA.map((saint) => {
          const isSelected = selectedSaint.id === saint.id;
          return (
            <button
              key={saint.id}
              onClick={() => setSelectedSaint(saint)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 scale-[1.02]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-white/50">
                <Image
                  src={saint.image}
                  alt={saint.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{saint.name}</p>
                <p className={`text-[10px] ${isSelected ? "text-rose-100" : "text-slate-400"}`}>
                  {saint.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 성인 상세 카드 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 pb-4 border-b border-slate-100">
          <div className="relative w-28 h-36 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-slate-100 border border-slate-200">
            <Image
              src={selectedSaint.image}
              alt={selectedSaint.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              축일: {selectedSaint.feastDay}
            </span>
            <h3 className="text-lg font-black text-slate-900">{selectedSaint.name}</h3>
            <p className="text-xs font-semibold text-slate-500">{selectedSaint.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {selectedSaint.description}
            </p>
          </div>
        </div>

        {/* 전구 기도문 */}
        <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl space-y-2">
          <div className="flex items-center space-x-1.5 text-rose-700">
            <BookOpen className="w-4 h-4" />
            <h4 className="text-xs font-bold">성인 전구 기도문</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line italic">
            &ldquo;{selectedSaint.prayer}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
