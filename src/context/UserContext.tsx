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

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  stamps: string[]; // 획득한 booth id 목록
  addStamp: (boothId: string) => boolean;
  hasRewardCoupon: boolean;
  claimReward: () => void;
  isStaff: boolean;
  setIsStaff: (val: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stamps, setStamps] = useState<string[]>([]);
  const [hasRewardCoupon, setHasRewardCoupon] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  useEffect(() => {
    // 로컬 스토리지에서 이전 상태 복원
    const savedUser = localStorage.getItem("byd2026_user");
    const savedStamps = localStorage.getItem("byd2026_stamps");
    const savedReward = localStorage.getItem("byd2026_reward");

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
    if (savedReward === "true") {
      setHasRewardCoupon(true);
    }
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("byd2026_user", JSON.stringify(profile));
  };

  const addStamp = (boothId: string) => {
    if (stamps.includes(boothId)) {
      return false; // 이미 획득
    }
    const updated = [...stamps, boothId];
    setStamps(updated);
    localStorage.setItem("byd2026_stamps", JSON.stringify(updated));

    // 5개 이상 스탬프 획득 시 굿즈 교환권 자동 부여
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

  return (
    <UserContext.Provider
      value={{
        user,
        setUserProfile,
        stamps,
        addStamp,
        hasRewardCoupon,
        claimReward,
        isStaff,
        setIsStaff,
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
