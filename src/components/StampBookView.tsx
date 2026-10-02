"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BOOTHS_DATA, BoothItem } from "@/data/booths";
import { useUser } from "@/context/UserContext";
import { QRCameraScanner } from "@/components/QRCameraScanner";
import { OfficialBoothStageGuide } from "@/components/OfficialBoothStageGuide";
import { TreasureHuntView } from "@/components/TreasureHuntView";
import { signInWithKakao } from "@/lib/auth/kakao";
import { QrCode, Gift, MapPin, Camera, BookOpen, Compass } from "lucide-react";

export function StampBookView() {
  const { stamps, addStamp, hasRewardCoupon, isRewardEligible, user } = useUser();
  const isKakaoSignedIn = !!(user && (user.email || user.provider === "kakao"));
  const [activeSubTab, setActiveSubTab] = useState<"official" | "treasure">("treasure");
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOfficialGuideOpen, setIsOfficialGuideOpen] = useState(false);
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

  const handleApplyStamp = (qrCodeText: string) => {
    if (!isKakaoSignedIn) {
      setScanMessage({ text: "스탬프 획득을 위해 먼저 카카오 로그인을 진행해 주세요.", error: true });
      setTimeout(() => setScanMessage(null), 3500);
      return;
    }

    const matched = BOOTHS_DATA.find(
      (b) =>
        b.qrCode.toLowerCase() === qrCodeText.trim().toLowerCase() ||
        b.id.toLowerCase() === qrCodeText.trim().toLowerCase()
    );

    if (matched) {
      const success = addStamp(matched.id);
      if (success) {
        setScanMessage({ text: `🎉 [${matched.name}] 스탬프를 획득했습니다!` });
      } else {
        setScanMessage({ text: `이미 스탬프를 획득한 부스입니다.`, error: true });
      }
    } else {
      setScanMessage({ text: "유효하지 않은 부스 QR 코드입니다.", error: true });
    }
    setTimeout(() => setScanMessage(null), 3500);
  };

  const handleOpenScanner = () => {
    if (!isKakaoSignedIn) {
      alert("스탬프 투어 및 QR 스캔은 카카오 로그인이 필요합니다.");
      signInWithKakao();
      return;
    }
    setIsCameraOpen(true);
  };

  const progressPercent = Math.min(100, Math.round((stamps.length / 9) * 100));

  return (
    <div className="space-y-4">
      {/* 1. 최상단 부스 & 무대 프로그램 안내 배너 */}
      <div
        onClick={() => setIsOfficialGuideOpen(true)}
        className="cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-4 shadow-md flex items-center justify-between hover:shadow-lg transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">
                공문 배치도 연동
              </span>
              <span className="text-xs font-black">81개 부스 & 무대 타임테이블</span>
            </div>
            <p className="text-[10px] text-orange-100 mt-0.5">
              믿음·희망·사랑·나눔 부스 위치와 실내/야외 공연 순서 보기 ➔
            </p>
          </div>
        </div>
      </div>

      {/* 2. 사전 이벤트 미션북 지참자 선물 교환 인지 카드 */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-[11px] text-slate-700 leading-snug">
            <strong>「일상적인 전례 참여」 미션북</strong> 지참 시 상품 수령처에서 추가 선물을 드려요!
          </p>
        </div>
      </div>

      {/* 3. 투-트랙 탭 전환 (쭈양이 꾹! 행사장 보물찾기 vs 부스 9개 스탬프) */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("treasure")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === "treasure"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-orange-500" />
          <span>쭈양이 꾹! 행사장 보물찾기 (메인)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("official")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === "official"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>부스 9개 스탬프</span>
        </button>
      </div>

      {/* 30초 동적 QR 굿즈 교환권 (보물 5개 또는 부스 9개 달성 시 - 기획서 Page 9 & PRD §5.1) */}
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
            <span className="text-xs font-bold text-slate-500 mb-1">BYD 현장 굿즈 교환권</span>
            {isRewardEligible ? (
              <>
                <div className="w-36 h-36 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-2 relative">
                  <QrCode className="w-28 h-28 text-slate-800" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 font-mono text-[9px] pointer-events-none break-all text-center">
                    BYD-VOUCHER-{couponSeconds}-{Date.now().toString().slice(-4)}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-semibold text-rose-600">
                    유효시간: {couponSeconds}초
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    캡처 화면 공유 방지를 위해 30초마다 동적 갱신됩니다.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <span className="text-xs font-bold text-slate-700 block">선물 수령 대상 안내</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  현장 굿즈 수령 대상자는 <strong>초등부, 중고등부, 청년, 교리교사</strong>입니다.<br />
                  완주를 축하드리며, 함께해 주셔서 진심으로 감사드립니다! 🙏
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 트랙 1: 부스 9개 스탬프 뷰 */}
      {activeSubTab === "official" && (
        <div className="space-y-4">
          {/* 상단 프로그레스 바 & 스탬프 북 요약 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl">📋</span>
                  <h2 className="text-base font-black text-slate-900">부스 스탬프 투어</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  믿음·희망·사랑 (각 존별 7성사 1개 + 일반 2개 = 총 9개)
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-orange-600">{stamps.length}</span>
                <span className="text-xs text-slate-400 font-bold"> / 9</span>
              </div>
            </div>

            {/* 진행도 게이지 */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>9개 완성 시 상품 수령처에서 굿즈 교환</span>
              <span>{progressPercent}% 달성</span>
            </div>

            {/* 실제 모바일 카메라 QR 스캐너 버튼 */}
            <button
              onClick={handleOpenScanner}
              className="mt-4 w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md active:scale-98 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>카메라로 부스 QR 스캔하기</span>
            </button>

            {/* 안내 메시지 */}
            {scanMessage && (
              <div
                className={`mt-3 p-3 rounded-2xl text-xs font-semibold animate-in fade-in ${
                  scanMessage.error
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {scanMessage.text}
              </div>
            )}
          </div>

          {/* 9개 스탬프 슬롯 그리드 (목업 Page 8 기반) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 px-1">4대 테마존 스탬프 현황</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {BOOTHS_DATA.map((booth, idx) => {
                const isCollected = stamps.includes(booth.id);
                return (
                  <div
                    key={booth.id}
                    onClick={() => setSelectedBooth(booth)}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col items-center justify-between text-center min-h-[120px] ${
                      isCollected
                        ? "bg-white border-orange-200 shadow-md shadow-orange-50 ring-2 ring-orange-500/20"
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
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center p-1 shadow-inner ring-2 ring-orange-300">
                          <Image
                            src="/assets/characters/jjuyang1.png"
                            alt="쭈양이 도장"
                            width={38}
                            height={38}
                            className="object-contain"
                          />
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
        </div>
      )}

      {/* 트랙 2: 쭈양이 꾹! 행사장 보물찾기 뷰 */}
      {activeSubTab === "treasure" && <TreasureHuntView />}

      {/* 공식 부스 & 무대 프로그램 전체 안내 모달 */}
      <OfficialBoothStageGuide
        isOpen={isOfficialGuideOpen}
        onClose={() => setIsOfficialGuideOpen(false)}
      />

      {/* 부스 상세 위키 바텀시트 / 모달 */}
      {selectedBooth && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold text-orange-600">{selectedBooth.zoneName}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedBooth.name}</h3>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>위치: {selectedBooth.location}</span>
              </div>
              <p className="leading-relaxed">{selectedBooth.description}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  handleApplyStamp(selectedBooth.qrCode);
                  setSelectedBooth(null);
                }}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                이 부스 스탬프 획득 (테스트 인증)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실제 스마트폰 카메라 QR 스캐너 모달 */}
      <QRCameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(decodedText) => handleApplyStamp(decodedText)}
      />
    </div>
  );
}
