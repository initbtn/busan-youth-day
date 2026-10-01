"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AffiliationRole } from "@/data/parishes";

export interface UserProfile {
  id: string;
  name: string;
  district: string;
  parish: string;
  role: AffiliationRole;
  groupNumber?: number; // 무작위 배정된 순례 소그룹 번호
}

export interface ParishNotice {
  parish: string;
  authorRole: string;
  authorName: string;
  content: string;
  updatedAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  stamps: string[]; // 획득한 공식 booth id 목록
  addStamp: (boothId: string) => boolean;
  hasRewardCoupon: boolean;
  claimReward: () => void;
  treasures: string[]; // 획득한 쭈양이 보물 ID 목록
  addTreasure: (treasureId: string) => boolean;
  isRewardEligible: boolean; // 초등부, 중고등부, 청년, 교리교사만 수령 가능
  isLeader: boolean; // 교리교사, 사제, 수도자 등 인솔 권한
  parishNotices: Record<string, ParishNotice>;
  updateParishNotice: (parish: string, content: string) => void;
}

const DEFAULT_NOTICES: Record<string, ParishNotice> = {
  하단: {
    parish: "하단",
    authorRole: "교리교사",
    authorName: "김선생님",
    content: "우리 하단성당 청년·학생들은 12:00에 실내체육관 2층 2-7구역 앞에서 모여 점심식사를 진행합니다! 돗자리 챙겨오세요.",
    updatedAt: "오늘 09:30",
  },
  남천: {
    parish: "남천",
    authorRole: "사제",
    authorName: "담당 신부님",
    content: "남천성당 순례단은 15:30까지 1층 1-1, 1-5 구역에 착석을 완료해 주시기 바랍니다. 미사 후 단체 사진 촬영이 있습니다.",
    updatedAt: "오늘 10:15",
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stamps, setStamps] = useState<string[]>([]);
  const [treasures, setTreasures] = useState<string[]>([]);
  const [hasRewardCoupon, setHasRewardCoupon] = useState<boolean>(false);
  const [parishNotices, setParishNotices] = useState<Record<string, ParishNotice>>(DEFAULT_NOTICES);

  const isLeader =
    user?.role === "교리교사" ||
    user?.role === "사제" ||
    user?.role === "수도자" ||
    user?.role === "학사님";

  // PRD §5.1 리워드 대상자 그룹 판별: 초등부, 중고등부, 청년, 교리교사만 수령 가능
  const isRewardEligible =
    user?.role === "청년" ||
    user?.role === "주일학교 중고등부" ||
    user?.role === "주일학교 초등부" ||
    user?.role === "교리교사";

  useEffect(() => {
    const savedUser = localStorage.getItem("byd2026_user");
    const savedStamps = localStorage.getItem("byd2026_stamps");
    const savedTreasures = localStorage.getItem("byd2026_treasures");
    const savedReward = localStorage.getItem("byd2026_reward");
    const savedNotices = localStorage.getItem("byd2026_parish_notices");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedStamps) {
      try {
        setStamps(JSON.parse(savedStamps));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedTreasures) {
      try {
        setTreasures(JSON.parse(savedTreasures));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedReward === "true") {
      setHasRewardCoupon(true);
    }
    if (savedNotices) {
      try {
        setParishNotices(JSON.parse(savedNotices));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("byd2026_user", JSON.stringify(profile));
  };

  const addStamp = (boothId: string) => {
    if (stamps.includes(boothId)) {
      return false;
    }
    const updated = [...stamps, boothId];
    setStamps(updated);
    localStorage.setItem("byd2026_stamps", JSON.stringify(updated));

    if (updated.length >= 9 && !hasRewardCoupon) {
      setHasRewardCoupon(true);
      localStorage.setItem("byd2026_reward", "true");
    }
    return true;
  };

  const addTreasure = (treasureId: string) => {
    if (treasures.includes(treasureId)) {
      return false;
    }
    const updated = [...treasures, treasureId];
    setTreasures(updated);
    localStorage.setItem("byd2026_treasures", JSON.stringify(updated));

    // 보물찾기 5개 완주 시 굿즈 교환권 활성화 (PRD §5)
    if (updated.length >= 5 && !hasRewardCoupon) {
      setHasRewardCoupon(true);
      localStorage.setItem("byd2026_reward", "true");
    }
    return true;
  };

  const claimReward = () => {
    setHasRewardCoupon(true);
    localStorage.setItem("byd2026_reward", "true");
  };

  const updateParishNotice = (parish: string, content: string) => {
    const updated = {
      ...parishNotices,
      [parish]: {
        parish,
        authorRole: user?.role || "인솔자",
        authorName: user?.name || "본당 인솔자",
        content,
        updatedAt: "방금 전",
      },
    };
    setParishNotices(updated);
    localStorage.setItem("byd2026_parish_notices", JSON.stringify(updated));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUserProfile,
        stamps,
        addStamp,
        hasRewardCoupon,
        claimReward,
        treasures,
        addTreasure,
        isRewardEligible,
        isLeader,
        parishNotices,
        updateParishNotice,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
