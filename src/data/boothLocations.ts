// 스포원파크 (금정체육공원) 및 4대 테마존 부스/시설 좌표 정의
// 기준 중심 좌표: 스포원파크 야외 분수광장 / 수변공원 (35.291961, 129.105222)

import { OFFICIAL_ZONES } from "./officialBooths";

export interface MapPoint {
  id: string;
  name: string;
  category: "sacrament" | "zone" | "facility" | "stage";
  zoneId?: "faith" | "hope" | "love" | "sharing";
  zoneName?: string;
  lat: number;
  lng: number;
  description: string;
  boothNumber?: number;
  isSacrament?: boolean;
  sacramentType?: string;
  tag?: string;
  photoUrl?: string;
  photoTitle?: string;
}

// 스포원파크 중심 좌표 (수변공원 / 야외 분수광장)
export const SPOWON_CENTER = {
  lat: 35.291961,
  lng: 129.105222,
};

// 주요 행사장 거점 & 시설 (카카오 로컬 공식 실측 좌표)
const FACILITIES_AND_STAGES: MapPoint[] = [
  {
    id: "facility-reception",
    name: "본당 등록 및 접수처",
    category: "facility",
    lat: 35.293450,
    lng: 129.104850,
    description: "스포원 북측 주차장 방면 실내체육관 입구 접수대 (09:00~14:00 운영, 인솔대표 접수 후 교환권 수령)",
    tag: "접수처",
    photoUrl: "/assets/reception_desk.webp",
    photoTitle: "스포원 북측 실내체육관 입구 본당 접수대 현장 사진",
  },
  {
    id: "facility-package-pickup",
    name: "참가자 패키지 수령처",
    category: "facility",
    lat: 35.293150,
    lng: 129.104400,
    description: "접수대에서 수령한 패키지 교환권으로 참가자 패키지 및 굿즈 수령 (에나버거/키즈랜드 광장 방면)",
    tag: "패키지수령처",
    photoUrl: "/assets/package_pickup.webp",
    photoTitle: "스포원 참가자 패키지 배부처 현장 사진",
  },
  {
    id: "facility-main-square",
    name: "A구역 · 야외 분수광장 (수변공원 부스존)",
    category: "facility",
    lat: 35.291961,
    lng: 129.105222,
    description: "4대 테마존 81개 공식 부스, 안내소, 의료지원 및 상품 수령처 운영",
    tag: "A구역 부스존",
  },
  {
    id: "stage-gym",
    name: "B구역 · 실내체육관 (파견미사 & 무대)",
    category: "stage",
    lat: 35.293054,
    lng: 129.104745,
    description: "12:00 개방 무대공연, 1F 문화홀 지성소 성체조배, 16:30 BYD 파견미사",
    tag: "B구역 실내체육관",
  },
  {
    id: "stage-outdoor",
    name: "C구역 · 가족공원 야외무대 (버스킹)",
    category: "stage",
    lat: 35.292723,
    lng: 129.103672,
    description: "청년 버스킹 문화공연, 상설 고해소(13:30~15:30) 운영",
    tag: "C구역 야외무대",
  },
  {
    id: "facility-tennis-stadium",
    name: "테니스경기장 (실내 센터)",
    category: "facility",
    lat: 35.292953,
    lng: 129.105999,
    description: "스포원파크 테니스경기장 및 실내 편의시설 (화장실 외 출입금지)",
    tag: "테니스경기장",
  },
  {
    id: "facility-tennis-court",
    name: "테니스장 (야외 코트)",
    category: "facility",
    lat: 35.291489,
    lng: 129.106735,
    description: "스포원파크 동남측 야외 테니스 코트 구역 (화장실 외 출입금지)",
    tag: "테니스장",
  },
  {
    id: "facility-shuttle",
    name: "북측 셔틀버스 정류장 (12번 게이트)",
    category: "facility",
    lat: 35.293800,
    lng: 129.104900,
    description: "노포역 ↔ 스포원파크 15분 간격 무료 셔틀버스 승하차장",
    tag: "셔틀버스",
  },
  {
    id: "facility-west-gate",
    name: "서측 주차장 (마을버스/귀가 셔틀)",
    category: "facility",
    lat: 35.292500,
    lng: 129.101800,
    description: "마을버스 정류장 및 오후 귀가 셔틀버스(19:00~20:30) 탑승지",
    tag: "서측주차장",
  },
  {
    id: "facility-reward",
    name: "공식 상품 수령처 & 식수 배부처",
    category: "facility",
    lat: 35.291800,
    lng: 129.105050,
    description: "스탬프 완주 기념 굿즈 교환 및 미션북 선물 수령처",
    tag: "상품수령처",
  },
];

// 4대 테마존 대표 구역 핀 (수변공원 중심 동서남북 배치)
const ZONE_CENTER_POINTS: MapPoint[] = OFFICIAL_ZONES.map((zone) => {
  let lat = SPOWON_CENTER.lat;
  let lng = SPOWON_CENTER.lng;

  if (zone.id === "faith") {
    lat = 35.291961;
    lng = 129.104522; // 서측
  } else if (zone.id === "hope") {
    lat = 35.291531; // 남측
    lng = 129.105222;
  } else if (zone.id === "love") {
    lat = 35.291961;
    lng = 129.105922; // 동측
  } else if (zone.id === "sharing") {
    lat = 35.292381; // 북측
    lng = 129.105222;
  }

  return {
    id: `zone-${zone.id}-main`,
    name: `${zone.koreanName} 부스 구역 (${zone.name})`,
    category: "zone",
    zoneId: zone.id,
    zoneName: zone.koreanName,
    lat,
    lng,
    description: `${zone.description} (총 ${zone.booths.length}개 부스)`,
    tag: `${zone.koreanName}(${zone.booths.length}개)`,
  };
});

// 7성사 부스 좌표 (SSOT: officialBooths.ts 데이터와 조인하여 메타데이터 일관성 보장)
const SACRAMENT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "faith-11": { lat: 35.292211, lng: 129.105022 }, // 성품성사
  "faith-14": { lat: 35.292351, lng: 129.105122 }, // 혼인성사
  "hope-16": { lat: 35.291881, lng: 129.105622 },  // 고해성사
  "hope-17": { lat: 35.291781, lng: 129.105722 },  // 병자성사
  "love-13": { lat: 35.291581, lng: 129.105122 },  // 세례성사
  "love-29": { lat: 35.291431, lng: 129.104922 },  // 견진성사
  "love-30": { lat: 35.291381, lng: 129.104822 },  // 성체성사
};

const SACRAMENT_POINTS: MapPoint[] = [];

OFFICIAL_ZONES.forEach((zone) => {
  zone.booths.forEach((booth) => {
    if (booth.isSacrament) {
      const key = `${zone.id}-${booth.number}`;
      const coord = SACRAMENT_COORDINATES[key] || {
        lat: SPOWON_CENTER.lat,
        lng: SPOWON_CENTER.lng,
      };

      SACRAMENT_POINTS.push({
        id: `sacrament-${zone.id}-${booth.number}`,
        name: `${booth.name} (${zone.koreanName} ${booth.number}번)`,
        category: "sacrament",
        zoneId: zone.id,
        zoneName: zone.koreanName,
        lat: coord.lat,
        lng: coord.lng,
        description: `${booth.sacramentType || "7성사"} 체험관 및 영적 안내 부스`,
        boothNumber: booth.number,
        isSacrament: true,
        sacramentType: booth.sacramentType,
        tag: "7성사",
      });
    }
  });
});

export const SPOWON_MAP_POINTS: MapPoint[] = [
  ...FACILITIES_AND_STAGES,
  ...SACRAMENT_POINTS,
  ...ZONE_CENTER_POINTS,
];

// =============================================================================
// 야외 분수광장 4대 테마존 부스 블록 및 배치도 (공식 안내문 배치도 기반)
// =============================================================================
export interface FountainZoneBlock {
  id: string;
  zoneId: "faith" | "hope" | "love" | "sharing";
  name: string;
  koreanName: string;
  direction: "north" | "east" | "west" | "south";
  centerLat: number;
  centerLng: number;
  // 카카오맵 폴리곤 꼭짓점 좌표 (위경도 배열)
  coordinates: { lat: number; lng: number }[];
  color: string; // Tailwind hex or css
  fillColor: string;
  strokeColor: string;
  boothRange: string;
  boothCount: number;
  keyFacilities: string[];
  description: string;
}

// 분수광장 중심(35.291961, 129.105222) 둘레의 4대 테마존 사각 블록
export const FOUNTAIN_ZONE_BLOCKS: FountainZoneBlock[] = [
  // 1. 북측: 나눔존 (2개 블록 및 굿즈/플리마켓)
  {
    id: "fountain-block-north",
    zoneId: "sharing",
    name: "Sharing Zone",
    koreanName: "나눔존",
    direction: "north",
    centerLat: 35.29238,
    centerLng: 129.10522,
    coordinates: [
      { lat: 35.29253, lng: 129.10472 },
      { lat: 35.29253, lng: 129.10572 },
      { lat: 35.29223, lng: 129.10572 },
      { lat: 35.29223, lng: 129.10472 },
    ],
    color: "#059669", // emerald-600
    fillColor: "#10B981",
    strokeColor: "#047857",
    boothRange: "나눔 1 ~ 10번",
    boothCount: 10,
    keyFacilities: ["가톨릭 굿즈", "바오로딸 서원", "플리마켓"],
    description: "굿즈, 서적, 성물과 플리마켓으로 풍성한 나눔 광장",
  },
  // 2. 동측: 사랑존 (상/하 31개 부스 + 식수대)
  {
    id: "fountain-block-east",
    zoneId: "love",
    name: "Love Zone",
    koreanName: "사랑존",
    direction: "east",
    centerLat: 35.29196,
    centerLng: 129.10592,
    coordinates: [
      { lat: 35.29233, lng: 129.10567 },
      { lat: 35.29233, lng: 129.10617 },
      { lat: 35.29158, lng: 129.10617 },
      { lat: 35.29158, lng: 129.10567 },
    ],
    color: "#E11D48", // rose-600
    fillColor: "#F43F5E",
    strokeColor: "#BE123C",
    boothRange: "사랑 1 ~ 31번",
    boothCount: 31,
    keyFacilities: ["세례성사(13번)", "견진성사(29번)", "성체성사(30번)", "식수 배부처"],
    description: "이웃 사랑과 헌신, 나눔을 배우는 은총의 공간 (7성사 3개)",
  },
  // 3. 서측: 믿음존 (19개 부스 + 식수, 의료지원, 본부)
  {
    id: "fountain-block-west",
    zoneId: "faith",
    name: "Faith Zone",
    koreanName: "믿음존",
    direction: "west",
    centerLat: 35.29196,
    centerLng: 129.10452,
    coordinates: [
      { lat: 35.29233, lng: 129.10427 },
      { lat: 35.29233, lng: 129.10477 },
      { lat: 35.29158, lng: 129.10477 },
      { lat: 35.29158, lng: 129.10427 },
    ],
    color: "#2563EB", // blue-600
    fillColor: "#3B82F6",
    strokeColor: "#1D4ED8",
    boothRange: "믿음 1 ~ 19번",
    boothCount: 19,
    keyFacilities: ["성품성사(11번)", "혼인성사(14번)", "식수대", "의료지원", "운영본부"],
    description: "교구 수도회와 청년 단체들이 신앙의 기쁨을 전하는 부스 (7성사 2개)",
  },
  // 4. 남측: 희망존 (21개 부스 + 믿음 연계 + 상품 수령처)
  {
    id: "fountain-block-south",
    zoneId: "hope",
    name: "Hope Zone",
    koreanName: "희망존",
    direction: "south",
    centerLat: 35.29153,
    centerLng: 129.10522,
    coordinates: [
      { lat: 35.29168, lng: 129.10472 },
      { lat: 35.29168, lng: 129.10572 },
      { lat: 35.29138, lng: 129.10572 },
      { lat: 35.29138, lng: 129.10472 },
    ],
    color: "#EA580C", // orange-600
    fillColor: "#F97316",
    strokeColor: "#C2410C",
    boothRange: "희망 1 ~ 21번",
    boothCount: 21,
    keyFacilities: ["고해성사(16번)", "병자성사(17번)", "공식 상품 수령처", "성소국"],
    description: "생명과 사랑의 복음을 체험하는 희망의 공간 (7성사 2개)",
  },
];
