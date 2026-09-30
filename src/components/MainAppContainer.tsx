"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EVENT_SCHEDULE } from "@/data/schedule";
import { FullSpiritualViewer } from "@/components/FullSpiritualViewer";
import { StampBookView } from "@/components/StampBookView";
import { CommunityFeedView } from "@/components/CommunityFeedView";
import GymSeatingViewer from "@/components/GymSeatingViewer";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useUser } from "@/context/UserContext";
import {
  Calendar,
  MapPin,
  Compass,
  QrCode,
  Users,
  Info,
  Car,
  Utensils,
  Megaphone,
  Edit3,
  Bus,
  Sparkles,
} from "lucide-react";

export function MainAppContainer() {
  const { user, isLeader, parishNotices, updateParishNotice } = useUser();
  const [activeTab, setActiveTab] = useState<"home" | "stamp" | "feed" | "info" | "seating">("home");
  const [spiritualViewer, setSpiritualViewer] = useState<"prayer" | "song" | "saints" | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<15 | 16 | 17>(15);

  // 본당 CMS 공지 작성 상태
  const userParish = user?.parish || "하단";
  const currentNotice = parishNotices[userParish];
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState(currentNotice?.content || "");

  const handleSaveNotice = () => {
    if (!noticeDraft.trim()) return;
    updateParishNotice(userParish, noticeDraft);
    setIsEditingNotice(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 최상단 주황색 띠 공지 배너 (목업 Page 6 기반) */}
      <div className="bg-orange-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">공식</span>
          <span className="truncate">스포원파크 부스 QR 스캔하고 현장 굿즈 교환받자! 🍞🐟</span>
        </div>
        <button
          onClick={() => setActiveTab("seating")}
          className="text-[11px] underline font-bold flex-shrink-0 ml-2 bg-black/10 px-2 py-0.5 rounded-full"
        >
          좌석배치
        </button>
      </div>

      {/* 헤더 바 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-200">
            <Image
              src="/assets/characters/jjuyang1.png"
              alt="쭈양이"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight flex items-center space-x-1">
              <span>쭈양이 꾹</span>
              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">2026 BYD</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold">스포원파크 디지털 순례 가이드</p>
          </div>
        </div>

        {/* 사용자 정보 또는 온보딩 열기 버튼 */}
        {user ? (
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors border border-orange-100"
          >
            <span>{user.name}</span>
            <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full font-bold">
              {user.groupNumber ? `${user.groupNumber}조` : user.parish}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold shadow-md hover:bg-orange-600 transition-colors"
          >
            순례 등록하기
          </button>
        )}
      </header>

      {/* 메인 뷰 컨텐츠 */}
      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* 1. 홈 탭 (타임라인, 전면 악보/기도문 카드, 3-Day 탭, 본당 CMS 공지, 쭈양이 배너) */}
        {activeTab === "home" && (
          <div className="space-y-5">
            {/* 공식 마스코트 '쭈양이' 웰컴 카드 */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1.5 z-10 max-w-[65%]">
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>공식 마스코트 쭈양이</span>
                </span>
                <h2 className="text-lg font-black leading-tight">지금 여기, 주님이 함께!</h2>
                <p className="text-[11px] text-orange-100 leading-snug">
                  4대 테마존 부스에서 QR 스탬프 꾹! 도장을 모아 한정판 굿즈를 교환받으세요.
                </p>
                <div className="pt-1 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab("seating")}
                    className="px-3 py-1.5 bg-white text-orange-600 text-xs font-bold rounded-xl shadow-xs hover:bg-orange-50 transition-colors"
                  >
                    체육관 좌석 확인
                  </button>
                  <button
                    onClick={() => setActiveTab("stamp")}
                    className="px-3 py-1.5 bg-black/20 text-white text-xs font-bold rounded-xl hover:bg-black/30 transition-colors"
                  >
                    스탬프 북 ➔
                  </button>
                </div>
              </div>
              <div className="relative w-28 h-28 flex-shrink-0 -mr-2">
                <Image
                  src="/assets/characters/jjuyang1.png"
                  alt="쭈양이 마스코트"
                  fill
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            {/* 본당 공지사항 카드 (참가자 맞춤 + 교리교사/사제/수도자 CMS 작성) */}
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded-xl">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      [{userParish}성당] 참가자 긴급 공지
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {currentNotice ? `${currentNotice.authorRole} · ${currentNotice.updatedAt}` : "본당 인솔자 알림"}
                    </p>
                  </div>
                </div>

                {isLeader && !isEditingNotice && (
                  <button
                    onClick={() => {
                      setNoticeDraft(currentNotice?.content || "");
                      setIsEditingNotice(true);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-[11px] font-bold border border-blue-200 shadow-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>공지 작성/수정</span>
                  </button>
                )}
              </div>

              {isEditingNotice ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows={3}
                    value={noticeDraft}
                    onChange={(e) => setNoticeDraft(e.target.value)}
                    placeholder="우리 본당 참가자들에게 알릴 집결 장소, 식사 위치, 공지사항을 입력하세요..."
                    className="w-full text-xs p-3 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingNotice(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-xl"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveNotice}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm"
                    >
                      공지 게시
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-700 bg-white/80 p-3.5 rounded-2xl border border-blue-50">
                  {currentNotice?.content || "등록된 본당 공지사항이 없습니다. 인솔자의 안내를 확인해 주세요."}
                </p>
              )}
            </div>

            {/* 3-Day 행사 일정 탭 (목업 Page 6: Oct 15, 16, 17) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-2 px-1">BYD 행사 일정</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  onClick={() => setSelectedDay(15)}
                  className={`py-2 px-3 rounded-2xl transition-all border ${
                    selectedDay === 15
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                      : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] block font-medium opacity-80">본대회</span>
                  <span className="text-lg font-black block">10.04</span>
                  <span className="text-[10px] block opacity-80">(주일)</span>
                </button>

                <button
                  onClick={() => setSelectedDay(16)}
                  className={`py-2 px-3 rounded-2xl transition-all border ${
                    selectedDay === 16
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                      : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] block font-medium opacity-80">사목주간</span>
                  <span className="text-lg font-black block">Youth</span>
                  <span className="text-[10px] block opacity-80">(부산교구)</span>
                </button>

                <button
                  onClick={() => setSelectedDay(17)}
                  className={`py-2 px-3 rounded-2xl transition-all border ${
                    selectedDay === 17
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100 scale-102"
                      : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] block font-medium opacity-80">2027</span>
                  <span className="text-lg font-black block">WYD</span>
                  <span className="text-[10px] block opacity-80">(서울)</span>
                </button>
              </div>
            </div>

            {/* 영적 카드 3종: 전면 고화질 상본/악보/수호성인 뷰어 연결 (기획서 Page 6 반영) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500">2027 WYD 영적 순례 자료</h3>
                <span className="text-[10px] text-orange-600 font-semibold">전면 고화질 뷰어</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setSpiritualViewer("prayer")}
                  className="cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-3 shadow-md shadow-blue-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <span className="text-xl mb-3">📜</span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">WYD 공식 기도</h4>
                    <p className="text-[9px] text-blue-100/90 mt-0.5">상본 앞/뒤</p>
                  </div>
                </div>

                <div
                  onClick={() => setSpiritualViewer("saints")}
                  className="cursor-pointer bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-2xl p-3 shadow-md shadow-orange-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <span className="text-xl mb-3">🕊️</span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">수호성인 5인</h4>
                    <p className="text-[9px] text-orange-100/90 mt-0.5">소개 & 기도</p>
                  </div>
                </div>

                <div
                  onClick={() => setSpiritualViewer("song")}
                  className="cursor-pointer bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl p-3 shadow-md shadow-amber-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <span className="text-xl mb-3">🎵</span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">하느님 나라에</h4>
                    <p className="text-[9px] text-amber-100/90 mt-0.5">공식 악보</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 타임라인 (기획서 Page 6) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">본대회 타임라인</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">스포원파크</span>
              </div>

              <div className="space-y-4">
                {EVENT_SCHEDULE.map((item, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs relative">
                    <div className="w-18 flex-shrink-0 font-bold text-slate-600 pt-0.5">
                      {item.time.split(" ~ ")[0]}
                    </div>
                    <div className="flex-1 space-y-0.5 pb-3 border-b border-slate-50">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.zone === "A"
                              ? "bg-blue-100 text-blue-700"
                              : item.zone === "B"
                              ? "bg-amber-100 text-amber-700"
                              : item.zone === "C"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.zone}구역
                        </span>
                        <span
                          className={`font-bold ${
                            item.isImportant ? "text-orange-950 font-black" : "text-slate-800"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 스탬프 북 탭 */}
        {activeTab === "stamp" && <StampBookView />}

        {/* 3. 실내체육관 좌석배치도 탭 (신규) */}
        {activeTab === "seating" && <GymSeatingViewer />}

        {/* 4. 커뮤니티 피드 탭 */}
        {activeTab === "feed" && <CommunityFeedView />}

        {/* 5. 안내 탭 (공문 G26-146 세부 약도 및 셔틀/주차 탑승지 안내) */}
        {activeTab === "info" && (
          <div className="space-y-5 text-xs leading-relaxed">
            {/* 행사장 3대 구역 안내 카드 (공문 2페이지) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-500 block">스포원파크 행사장 3대 구역</span>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <span className="font-bold text-blue-900 text-xs">A구역 · 야외 분수광장</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    축제 부스 체험(믿음·희망·사랑·나눔), 09:00~14:00 본당 대표자 접수 및 패키지 수령처
                  </p>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
                  <span className="font-bold text-amber-900 text-xs">B구역 · 실내체육관</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    실내공연(13:00~15:30 자유석), 지성소 침묵/찬양 기도(1F 문화홀), BYD 파견미사(15:30 착석, 16:30 미사)
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="font-bold text-emerald-900 text-xs">C구역 · 가족공원 야외무대</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    상설 고해소(13:30~15:30 운영), 야외 버스킹 및 문화공연
                  </p>
                </div>
              </div>
            </div>

            {/* 셔틀버스 상세 운행 & 탑승 약도 카드 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Bus className="w-4 h-4 text-orange-600" />
                <span>BYD 셔틀버스 운행 & 상세 탑승지 약도</span>
              </div>

              {/* 오전 노선 안내 */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>[오전] 노포역 ➔ 스포원파크</span>
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    15분 간격 운행
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>운행 시각</strong>: 09:00 ~ 10:45 (10:45 마지막 출발)</p>
                  <p>• <strong>노포역 탑승지</strong>: 노포역 오른쪽 주차장 출구 지나 아래쪽 (안내봉사자 배치)</p>
                  <p>• <strong>스포원 하차지</strong>: 북측주차장 12번 게이트 바깥쪽 하차 후 주출입구(접수대)로 이동</p>
                </div>
              </div>

              {/* 오후 노선 안내 */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>[오후] 스포원파크 ➔ 노포역</span>
                  <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    15분 간격 운행
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>운행 시각</strong>: 19:00 ~ 20:30 (15분 간격)</p>
                  <p>• <strong>스포원 탑승지</strong>: 스포원파크 정문 옆 서측주차장의 마을버스 정류장 근처</p>
                  <p>• <strong>주의</strong>: 정문 1번 게이트 ➔ 14번 게이트로 버스가 이동하므로 보행 안전 유의</p>
                </div>
              </div>
            </div>

            {/* 자가용 및 본당 대형버스 주차 안내 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>주차 및 대형버스 하차 안내</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-[11px]">
                <li><strong>자가용/승합차</strong>: 북측주차장 및 동측주차장(약 958석) 이용 가능 (남측주차장은 경륜장 전용으로 불가)</li>
                <li><strong>본당 대형버스</strong>: 서측주차장 앞 14번 게이트 또는 북측주차장 11번 게이트에서 참가자 하차 후 회차</li>
                <li><strong>대중교통</strong>: 1호선 노포역에서 마을버스(2-2, 2-3) 이용 시 스포원파크 정문 하차</li>
              </ul>
            </div>

            {/* 점심식사 및 행사장 유의사항 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>점심식사 및 실내체육관 좌석 안내</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-[11px]">
                <li><strong>개인 도시락 및 돗자리 지참 필수</strong> (공원 규정상 행사장 내 음식/간식 판매 부스 없음)</li>
                <li>식수 부스에서 1인 1병 생수 지급 (개인 물병 권장)</li>
                <li>실내체육관은 12:00부터 입장 가능하며 음식물 반입 절대 불가 (바닥 보호를 위해 <strong>운동화 착용 필수</strong>)</li>
                <li>파견미사는 15:30부터 본당별 지정 좌석으로 운영되며, 15:55까지 착석 완료해야 합니다.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 6. 공통 하단 필수 저작권 표기 (컴플라이언스 규정 준수) */}
        <footer className="pt-4 pb-2 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-500">
            ⓒ 부산교구 청소년사목국 · 2026 BYD
          </p>
          <p className="text-[9px] text-slate-400">
            공식 마스코트 쭈양이(JJUYANG!) · 문의: purunnamu@catb.kr
          </p>
        </footer>
      </main>

      {/* 하단 고정 네비게이션 바 */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              activeTab === "home" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>홈</span>
          </button>

          <button
            onClick={() => setActiveTab("stamp")}
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              activeTab === "stamp" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>스탬프</span>
          </button>

          <button
            onClick={() => setActiveTab("seating")}
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors relative ${
              activeTab === "seating" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative">
              <MapPin className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
            <span>미사좌석</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              activeTab === "feed" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>소통피드</span>
          </button>

          <button
            onClick={() => setActiveTab("info")}
            className={`flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
              activeTab === "info" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Info className="w-5 h-5" />
            <span>안내</span>
          </button>
        </div>
      </nav>

      {/* 전면 고화질 영적 뷰어 및 온보딩 모달 */}
      <FullSpiritualViewer
        type={spiritualViewer}
        onClose={() => setSpiritualViewer(null)}
      />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
