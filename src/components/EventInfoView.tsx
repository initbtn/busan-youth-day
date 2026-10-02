"use client";

import React from "react";
import Image from "next/image";
import {
  Bus,
  Car,
  Utensils,
} from "lucide-react";

export function EventInfoView() {
  return (
    <div className="space-y-5 text-xs leading-relaxed">
      {/* 2026 부산교구 사목지침 공식 배너 */}
      <div className="relative w-full aspect-[1920/578] rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
        <Image
          src="/assets/banners/pastoral-guidelines-banner.webp"
          alt="2026년 교구 사목지침 배너"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
        />
      </div>

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
  );
}
