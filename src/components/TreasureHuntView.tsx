"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HIDDEN_TREASURE_SPOTS, HiddenTreasureSpot } from "@/data/treasureHunt";
import { useUser } from "@/context/UserContext";
import { QRCameraScanner } from "@/components/QRCameraScanner";
import { Camera, Sparkles, CheckCircle2, MapPin, X, Trophy } from "lucide-react";

export function TreasureHuntView() {
  const { treasures, addTreasure } = useUser();
  const [selectedSpot, setSelectedSpot] = useState<HiddenTreasureSpot | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [foundSuccessSpot, setFoundSuccessSpot] = useState<HiddenTreasureSpot | null>(null);

  const progressPercent = Math.round((treasures.length / HIDDEN_TREASURE_SPOTS.length) * 100);

  const handleScanTreasure = (decodedCode: string) => {
    const matched = HIDDEN_TREASURE_SPOTS.find(
      (s) => s.qrCode === decodedCode || decodedCode.includes(s.qrCode)
    );
    if (matched) {
      addTreasure(matched.id);
      setIsCameraOpen(false);
      setFoundSuccessSpot(matched);
    } else {
      alert("쭈양이 보물 QR 코드가 아닙니다. 힌트 카드를 확인하고 다시 찾아보세요!");
    }
  };

  return (
    <div className="space-y-4">
      {/* 쭈양이 꾹 보물찾기 헤더 카드 */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1 z-10 max-w-[70%]">
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold inline-flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>행사장 전역 어드벤처</span>
            </span>
            <h2 className="text-lg font-black leading-tight">쭈양이 꾹! 행사장 보물찾기</h2>
            <p className="text-[11px] text-orange-100 leading-snug">
              부스 텐트를 벗어나 스포원파크 곳곳에 숨겨진 쭈양이의 5대 보물 발자국을 찾아보세요!
            </p>
          </div>
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src="/assets/characters/jjuyang4.png"
              alt="탐험가 쭈양이"
              fill
              className="object-contain drop-shadow"
            />
          </div>
        </div>

        {/* 진행도 게이지 */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span>보물 발견 현황</span>
            <span>
              {treasures.length} / {HIDDEN_TREASURE_SPOTS.length}개 발견 ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 보물찾기 카메라 스캔 버튼 */}
      <button
        onClick={() => setIsCameraOpen(true)}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md active:scale-98 transition-all"
      >
        <Camera className="w-4 h-4" />
        <span>숨겨진 쭈양이 보물 QR 스캔하기</span>
      </button>

      {/* 5대 히든 보물 힌트 리스트 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500">스포원파크 히든 힌트 레이더</span>
          <span className="text-[10px] text-orange-600 font-semibold">터치하여 힌트 보기</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {HIDDEN_TREASURE_SPOTS.map((spot, idx) => {
            const isFound = treasures.includes(spot.id);
            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                  isFound
                    ? "bg-amber-50/70 border-amber-200 shadow-xs"
                    : "bg-white border-slate-100 hover:border-orange-200 shadow-xs"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      isFound
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isFound ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span>#{idx + 1}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{spot.name}</h4>
                      {isFound && (
                        <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-bold">
                          발견 완료
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{spot.locationArea}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-xl">
                    {isFound ? "축복 보기" : "힌트 열기"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5개 전부 발견 시 마스터 축하 카드 */}
      {treasures.length === HIDDEN_TREASURE_SPOTS.length && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-5 shadow-lg space-y-2 text-center">
          <Trophy className="w-8 h-8 text-amber-200 mx-auto" />
          <h3 className="text-sm font-black">스포원파크 보물찾기 완전 정복!</h3>
          <p className="text-[11px] text-emerald-100 leading-relaxed">
            축하합니다! 5개의 숨겨진 보물을 모두 찾으셨습니다.<br />
            현장 &apos;상품 수령처&apos;에서 쭈양이 한정판 스페셜 스티커를 확인하세요!
          </p>
        </div>
      )}

      {/* 힌트 및 발견 상세 모달 */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  보물 스팟 힌트
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedSpot.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-orange-950 block">🕵️ 탐정 쭈양이의 힌트</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedSpot.clue}
              </p>
              <div className="pt-1 text-[11px] text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>위치: {selectedSpot.locationArea}</span>
              </div>
            </div>

            {treasures.includes(selectedSpot.id) ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-center">
                <span className="text-xs font-bold text-emerald-900 block">✨ 획득한 보물 축복</span>
                <p className="text-xs text-slate-700 italic">&ldquo;{selectedSpot.blessingMessage}&rdquo;</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelectedSpot(null);
                  setIsCameraOpen(true);
                }}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md transition-colors"
              >
                현장에서 찾았어요! (QR 스캔)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 보물 발견 성공 축하 팝업 */}
      {foundSuccessSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="relative w-28 h-28 mx-auto">
              <Image
                src={foundSuccessSpot.characterImg}
                alt="축하 쭈양이"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                보물 발견 성공!
              </span>
              <h3 className="text-lg font-black text-slate-900">{foundSuccessSpot.name}</h3>
              <p className="text-xs text-orange-700 font-bold">{foundSuccessSpot.characterReaction}</p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl italic leading-relaxed">
              &ldquo;{foundSuccessSpot.blessingMessage}&rdquo;
            </p>
            <button
              onClick={() => setFoundSuccessSpot(null)}
              className="w-full py-3 bg-orange-500 text-white font-bold text-xs rounded-2xl shadow-md"
            >
              확인했양! 닫기
            </button>
          </div>
        </div>
      )}

      {/* 카메라 QR 스캐너 */}
      <QRCameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleScanTreasure}
      />
    </div>
  );
}
