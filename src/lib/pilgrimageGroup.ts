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
 * 성인(Saint) 이름 기반 청년의 날 모둠 배정 엔진
 * 2027 WYD 5대 수호성인(김대건 안드레아, 요한 바오로 2세, 프란체스카 카브리니, 요세피나 바키타, 카를로 아쿠티스) 5개 모둠으로 배정
 * (별도 n조는 생성하지 않으며 본당 계층 내에서 5개 수호성인 모둠으로 구성)
 * @param seed 고정 식별자 (userId 등). 제공 시 멱등 배정, 미제공 시 무작위 배정.
 */
export function assignPilgrimageGroup(seed?: string): PilgrimageGroupResult {
  const saints = PILGRIM_SAINTS;

  let saintIndex: number;

  if (seed && typeof seed === "string") {
    const hash = stringToHash(seed);
    saintIndex = hash % saints.length;
  } else {
    saintIndex = Math.floor(Math.random() * saints.length);
  }

  const selectedSaint = saints[saintIndex];
  // n조 제거: '성 김대건 안드레아 모둠' 또는 saint.groupName ('김대건 안드레아 모둠')
  const pilgrimageGroup = selectedSaint.groupName;

  return {
    saintId: selectedSaint.id,
    saintName: selectedSaint.name,
    groupNumber: 1, // 하위 호환용 고정값
    pilgrimageGroup,
    title: selectedSaint.title,
    symbol: selectedSaint.patronage || selectedSaint.groupName,
    blessingMessage: selectedSaint.motto || "주님 안에서 함께 걸어가는 순례길이 되기를 기도합니다.",
  };
}
