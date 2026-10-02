"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, BookOpen, Music } from "lucide-react";
import prayerData from "../../public/assets/yd2027-official-prayer.json";
import themeSongData from "../../public/assets/theme-song-gods-kingdom.json";

interface SpiritualModalProps {
  type: "prayer" | "song" | null;
  onClose: () => void;
}

export function SpiritualModal({ type, onClose }: SpiritualModalProps) {
  const [activeTab, setActiveTab] = useState<"text" | "sheet">("text");

  useEffect(() => {
    if (type) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [type]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 overscroll-contain">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            {type === "prayer" ? (
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Music className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {type === "prayer" ? prayerData.title : themeSongData.title}
              </h2>
              <p className="text-xs text-slate-500">
                {type === "prayer" ? prayerData.subtitle : themeSongData.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 기도문 모달 내용 */}
        {type === "prayer" && (
          <div className="p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-700">
            <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-800">
              {prayerData.intro_notice}
            </div>

            {prayerData.sections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-blue-700 rounded-md">
                  {section.tag}
                </span>
                <p className="whitespace-pre-line text-slate-800 pl-1 pt-1 font-serif">
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

            <div className="text-right text-xs text-slate-400 font-medium">
              {prayerData.footnote}
            </div>
          </div>
        )}

        {/* 주제가 모달 내용 (악보 / 가사 전환) */}
        {type === "song" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-100 px-5 pt-2">
              <button
                onClick={() => setActiveTab("text")}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "text"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                가사 및 코드 ({themeSongData.tempo})
              </button>
              <button
                onClick={() => setActiveTab("sheet")}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "sheet"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                악보 보기
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {activeTab === "sheet" ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full aspect-[3/4] max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <Image
                      src="/assets/theme_song_sheet_music.webp"
                      alt="하느님 나라에 악보"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {themeSongData.structure.map((part, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-xs font-bold text-amber-700 mb-2">
                        {part.section} ({part.measures}마디)
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {part.chords_and_lyrics.map((item, mIdx) => (
                          <div key={mIdx} className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="font-mono font-bold text-blue-600 block text-[11px]">
                              {item.chord}
                            </span>
                            <span className="text-slate-800">{item.lyrics}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
