export interface BoothItem {
  id: string;
  name: string;
  zone: "faith" | "hope" | "love" | "sharing";
  zoneName: string;
  category: "7성사" | "체험" | "청년" | "나눔";
  location: string;
  description: string;
  targetCount: number; // 스탬프 획득용
  qrCode: string;
}

export const BOOTHS_DATA: BoothItem[] = [
  // 1. 믿음 존 (Faith)
  {
    id: "booth-1",
    name: "세례성사 체험관 (빛과 물의 여정)",
    zone: "faith",
    zoneName: "믿음 (Faith)",
    category: "7성사",
    location: "A구역 북측 잔디마당 F-1",
    description: "신앙의 시작, 세례의 의미를 되새기고 내 세례명을 캘리그라피로 남기는 체험",
    targetCount: 1,
    qrCode: "BYD2026_FAITH_BAPTISM_01",
  },
  {
    id: "booth-2",
    name: "견진성사 챌린지 (성령의 칠은)",
    zone: "faith",
    zoneName: "믿음 (Faith)",
    category: "7성사",
    location: "A구역 북측 잔디마당 F-2",
    description: "성령의 7가지 은사를 퀴즈와 미니 게임으로 풀어보는 체험",
    targetCount: 1,
    qrCode: "BYD2026_FAITH_CONFIRM_02",
  },
  // 2. 희망 존 (Hope)
  {
    id: "booth-3",
    name: "성체성사 빵과 포도주 (밀알 공방)",
    zone: "hope",
    zoneName: "희망 (Hope)",
    category: "7성사",
    location: "A구역 서측 분수대 H-1",
    description: "하나 되는 일치와 나눔의 성체성사 묵상",
    targetCount: 1,
    qrCode: "BYD2026_HOPE_EUCHARIST_03",
  },
  {
    id: "booth-4",
    name: "고해성사 (화해와 용서의 나무)",
    zone: "hope",
    zoneName: "희망 (Hope)",
    category: "7성사",
    location: "A구역 서측 분수대 H-2",
    description: "마음의 짐을 내려놓고 평화를 얻는 화해 체험 프로그램",
    targetCount: 1,
    qrCode: "BYD2026_HOPE_RECONCIL_04",
  },
  // 3. 사랑 존 (Love)
  {
    id: "booth-5",
    name: "혼인/신품성사 (소명과 동행)",
    zone: "love",
    zoneName: "사랑 (Love)",
    category: "7성사",
    location: "A구역 남측 광장 L-1",
    description: "교회와 가정, 각자의 자리에서 부름받은 성소 묵상",
    targetCount: 1,
    qrCode: "BYD2026_LOVE_VOCATION_05",
  },
  {
    id: "booth-6",
    name: "병자성사 (치유와 위로의 손길)",
    zone: "love",
    zoneName: "사랑 (Love)",
    category: "7성사",
    location: "A구역 남측 광장 L-2",
    description: "고통받는 이웃과 청년들의 아픔을 안아주는 기도의 장",
    targetCount: 1,
    qrCode: "BYD2026_LOVE_HEALING_06",
  },
  // 4. 나눔 존 (Sharing)
  {
    id: "booth-7",
    name: "부산 청년 플리마켓 & 굿즈샵",
    zone: "sharing",
    zoneName: "나눔 (Sharing)",
    category: "체험",
    location: "A구역 동측 보도 S-1",
    description: "각 본당 청년들이 직접 만든 성물, 핸드메이드 굿즈 및 이벤트 부스",
    targetCount: 1,
    qrCode: "BYD2026_SHARING_FLEA_07",
  },
  {
    id: "booth-8",
    name: "생태 영성 에코 챌린지 (찬미받으소서)",
    zone: "sharing",
    zoneName: "나눔 (Sharing)",
    category: "나눔",
    location: "A구역 동측 보도 S-2",
    description: "지구를 살리는 제로웨이스트 실천 서약 및 씨앗 나눔",
    targetCount: 1,
    qrCode: "BYD2026_SHARING_ECO_08",
  },
  {
    id: "booth-9",
    name: "2027 서울 WYD 홍보 & 포토존",
    zone: "sharing",
    zoneName: "나눔 (Sharing)",
    category: "청년",
    location: "A구역 중앙 잔디 광장 S-3",
    description: "2027 서울 세계청년대회 응원 메시지 및 쭈양이 캐릭터 인생네컷 포토존",
    targetCount: 1,
    qrCode: "BYD2026_SHARING_WYD_09",
  },
];
