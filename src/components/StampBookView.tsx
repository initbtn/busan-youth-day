"use client";

import React, { useState, useEffect } from "react";
import { BOOTHS_DATA, BoothItem } from "@/data/booths";
import { useUser } from "@/context/UserContext";
import { QrCode, Gift, MapPin } from "lucide-react";

export function StampBookView() {
  const { stamps, addStamp, hasRewardCoupon } = useUser();
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // 30초 동적 굿즈 인증 QR 타이머 (Feature Flag 모듈)
  const [couponSeconds, setCouponSeconds] = useState(30);

  useEffect(() => {
    if (!hasRewardCoupon) return;
    const interval = setInterval(() => {
      setCouponSeconds((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasRewardCoupon]);

  const handleSimulateScan = (booth: BoothItem) => {
    const success = addStamp(booth.id);
    if (success) {
      setScanMessage({ text: `[${booth.name}] 스탬프를 획득했습니다!` });
    } else {
      setScanMessage({ text: `이미 스탬프를 획득한 부스입니다.`, error: true });
    }
    setTimeout(() => setScanMessage(null), 3000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = BOOTHS_DATA.find(
      (b) => b.qrCode.toLowerCase() === scanInput.trim().toLowerCase()
    );
    if (matched) {
      handleSimulateScan(matched);
      setScanInput("");
      setScanning(false);
    } else {
      setScanMessage({ text: "유효하지 않은 부스 QR 코드입니다.", error: true });
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  const progressPercent = Math.min(100, Math.round((stamps.length / 9) * 100));

  return (
    <div className="space-y-6">
      {/* 상단 프로그레스 바 & 스탬프 북 요약 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">순례 스탬프 투어</h2>
            <p className="text-xs text-slate-500">7성사 부스 + 일반 부스 총 9개 슬롯</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{stamps.length}</span>
            <span className="text-xs text-slate-400 font-bold"> / 9</span>
          </div>
        </div>

        {/* 진행도 게이지 */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-amber-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
          <span>5개 이상 획득 시 굿즈 교환권 지급</span>
          <span>{progressPercent}% 달성</span>
        </div>

        {/* 스캔 버튼 */}
        <button
          onClick={() => setScanning(!scanning)}
          className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-blue-100 transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>부스 현장 QR 코드 스캔하기</span>
        </button>

        {/* 스캔 입력 / 시뮬레이션 창 */}
        {scanning && (
          <form
            onSubmit={handleCodeSubmit}
            className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in"
          >
            <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
              <span>카메라 QR 스캐너 / 코드 입력</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="QR 코드 토큰 입력 (예: BYD2026_FAITH_BAPTISM_01)"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
              >
                인증
              </button>
            </div>
          </form>
        )}

        {/* 안내 메시지 */}
        {scanMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-medium ${
              scanMessage.error
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {scanMessage.text}
          </div>
        )}
      </div>

      {/* 5개 이상 달성 시: 30초 동적 QR 굿즈 교환권 (기획서 Page 9) */}
      {hasRewardCoupon && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-amber-100" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Reward Voucher
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
              30초 갱신 보안 모듈
            </span>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl p-4 flex flex-col items-center shadow-inner">
            <span className="text-xs font-bold text-slate-500 mb-1">Jjuyang-i 굿즈 교환권</span>
            <div className="w-36 h-36 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-2 relative">
              <QrCode className="w-28 h-28 text-slate-800" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10 font-mono text-[9px] pointer-events-none break-all text-center">
                DYNAMIC-TOKEN-{couponSeconds}-{Date.now().toString().slice(-4)}
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-rose-600">
                유효시간: {couponSeconds}초
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                캡처 공유 방지를 위해 30초마다 토큰이 자동 갱신됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9개 스탬프 슬롯 그리드 (목업 Page 8 기반) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 px-1">4대 테마존 스탬프 현황</h3>
        <div className="grid grid-cols-3 gap-3">
          {BOOTHS_DATA.map((booth, idx) => {
            const isCollected = stamps.includes(booth.id);
            return (
              <div
                key={booth.id}
                onClick={() => setSelectedBooth(booth)}
                className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col items-center justify-between text-center min-h-[120px] ${
                  isCollected
                    ? "bg-white border-blue-200 shadow-md shadow-blue-50 ring-2 ring-blue-500/20"
                    : "bg-slate-50/70 border-dashed border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>#{idx + 1}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                      booth.zone === "faith"
                        ? "bg-blue-100 text-blue-700"
                        : booth.zone === "hope"
                        ? "bg-amber-100 text-amber-700"
                        : booth.zone === "love"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {booth.category}
                  </span>
                </div>

                <div className="my-1.5 flex items-center justify-center">
                  {isCollected ? (
                    <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-inner font-bold">
                      🐑
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                      <QrCode className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                  {booth.name.split(" ")[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 부스 상세 위키 바텀시트 / 모달 */}
      {selectedBooth && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold text-blue-600">{selectedBooth.zoneName}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedBooth.name}</h3>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>위치: {selectedBooth.location}</span>
              </div>
              <p className="leading-relaxed">{selectedBooth.description}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  handleSimulateScan(selectedBooth);
                  setSelectedBooth(null);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                이 부스 스탬프 획득 (현장 QR 시뮬레이션)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
