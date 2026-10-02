import { PILGRIM_SAINTS, PilgrimSaint } from "@/data/saints";

export interface PilgrimageGroupResult {
  saintId: string;
  saintName: string;
  groupNumber: number;
  pilgrimageGroup: string;
  title: string;
  symbol: string;
  blessingMessage: string;
}

export function getAvailableSaints(): PilgrimSaint[] {
  return PILGRIM_SAINTS;
}

function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 성인(Saint) 이름 기반 순례 그룹 무작위 배정 엔진 (PRD §2.3)
 * @param seed 고정 식별자 (userId 등). 제공 시 멱등 배정, 미제공 시 무작위 배정.
 * @param maxGroups 배정 가능한 최대 조 번호 (기본 50조)
 */
export function assignPilgrimageGroup(seed?: string, maxGroups: number = 50): PilgrimageGroupResult {
  const saints = PILGRIM_SAINTS;

  let saintIndex: number;
  let groupNum: number;

  if (seed && typeof seed === "string") {
    const hash = stringToHash(seed);
    saintIndex = hash % saints.length;
    groupNum = (Math.floor(hash / saints.length) % maxGroups) + 1;
  } else {
    saintIndex = Math.floor(Math.random() * saints.length);
    groupNum = Math.floor(Math.random() * maxGroups) + 1;
  }

  const selectedSaint = saints[saintIndex];
  const pilgrimageGroup = `${selectedSaint.name} ${groupNum}조`;

  return {
    saintId: selectedSaint.id,
    saintName: selectedSaint.name,
    groupNumber: groupNum,
    pilgrimageGroup,
    title: selectedSaint.title,
    symbol: selectedSaint.patronage || selectedSaint.groupName,
    blessingMessage: selectedSaint.motto || "주님 안에서 함께 걸어가는 순례길이 되기를 기도합니다.",
  };
}
