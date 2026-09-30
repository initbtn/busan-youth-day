"use client";

import React, { useState } from "react";
import { DISTRICT_PARISH_MAP, AFFILIATION_ROLES, AffiliationRole } from "@/data/parishes";
import { useUser } from "@/context/UserContext";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { setUserProfile } = useUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 폼 입력 상태
  const [name, setName] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_PARISH_MAP[0].district);
  const [selectedParish, setSelectedParish] = useState(DISTRICT_PARISH_MAP[0].parishes[0]);
  const [selectedRole, setSelectedRole] = useState<AffiliationRole>("청년");
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocatedGroup, setAllocatedGroup] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentParishes =
    DISTRICT_PARISH_MAP.find((d) => d.district === selectedDistrict)?.parishes || [];

  const handleStartAllocation = () => {
    setIsAllocating(true);
    // 무작위 순례 소그룹 배정 (1~50조)
    setTimeout(() => {
      const groupNum = Math.floor(Math.random() * 50) + 1;
      setAllocatedGroup(groupNum);
      setIsAllocating(false);
      setStep(3);

      setUserProfile({
        id: "user-" + Date.now(),
        name: name || "순례 청년",
        district: selectedDistrict,
        parish: selectedParish,
        role: selectedRole,
        groupNumber: groupNum,
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 탭 / 단계 안내 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
              Step {step} of 3
            </span>
            <span className="text-sm font-medium text-slate-500">순례 등록</span>
          </div>
          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* 1단계: 카카오/이름 입력 & 지구/본당 선택 */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                🐑
              </div>
              <h2 className="text-xl font-bold text-slate-900">환영합니다!</h2>
              <p className="text-xs text-slate-500 mt-1">
                2026 부산교구 젊은이의 날 (BYD) 디지털 순례 여정
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                참가자 이름 (또는 세례명)
              </label>
              <input
                type="text"
                placeholder="예: 홍길동 (베드로)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">지구 선택</label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  const firstP =
                    DISTRICT_PARISH_MAP.find((d) => d.district === e.target.value)?.parishes[0] ||
                    "";
                  setSelectedParish(firstP);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DISTRICT_PARISH_MAP.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">본당 선택</label>
              <select
                value={selectedParish}
                onChange={(e) => setSelectedParish(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentParishes.map((p) => (
                  <option key={p} value={p}>
                    {p}성당
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-md"
            >
              다음 단계: 소속 선택
            </button>
          </div>
        )}

        {/* 2단계: 11개 역할 소속 칩 선택 */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">소속 역할을 선택해 주세요</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                행사 참여 및 부스 체험 안내에 활용됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 py-2 max-h-56 overflow-y-auto">
              {AFFILIATION_ROLES.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleStartAllocation}
                disabled={isAllocating}
                className="w-2/3 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-1"
              >
                {isAllocating ? (
                  <span>순례 그룹 무작위 배정 중...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>순례 그룹 배정 및 시작</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 배정 완료 축하 모달 */}
        {step === 3 && (
          <div className="mt-5 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">순례 등록 완료!</h2>
              <p className="text-sm text-slate-600 mt-1">
                <span className="font-semibold text-blue-600">{selectedParish}성당</span>{" "}
                <span className="font-medium text-slate-900">{name || "순례자"}</span>님
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                무작위 배정 순례단
              </span>
              <p className="text-2xl font-black text-amber-900 mt-1">
                청년 순례 {allocatedGroup}조
              </p>
              <p className="text-xs text-amber-700/80 mt-1">
                다른 본당 청년들과 함께 4대 테마존 부스를 탐색해보세요!
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-md"
            >
              순례 여정 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
