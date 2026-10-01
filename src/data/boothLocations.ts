// 스포원파크 (금정체육공원) 및 4대 테마존 부스/시설 좌표 정의
// 기준 중심 좌표: 스포원파크 야외 분수광장 (35.28173, 129.09845)

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
}

// 스포원파크 중심 좌표
export const SPOWON_CENTER = {
  lat: 35.28173,
  lng: 129.09845,
};

// 주요 행사장 거점 & 시설
const FACILITIES_AND_STAGES: MapPoint[] = [
  {
    id: "facility-main-square",
    name: "A구역 · 야외 분수광장 (부스존)",
    category: "facility",
    lat: 35.28173,
    lng: 129.09845,
    description: "4대 테마존 81개 공식 부스, 안내소, 의료지원 및 상품 수령처 운영",
    tag: "메인 광장",
  },
  {
    id: "stage-gym",
    name: "B구역 · 실내체육관 (파견미사 & 무대)",
    category: "stage",
    lat: 35.28315,
    lng: 129.09780,
    description: "12:00 개방 무대공연, 1F 문화홀 지성소 성체조배, 16:30 BYD 파견미사",
    tag: "실내체육관",
  },
  {
    id: "stage-outdoor",
    name: "C구역 · 가족공원 야외무대 (버스킹)",
    category: "stage",
    lat: 35.28065,
    lng: 129.09985,
    description: "청년 버스킹 문화공연, 상설 고해소(13:30~15:30) 운영",
    tag: "가족공원",
  },
  {
    id: "facility-shuttle",
    name: "북측 셔틀버스 정류장 (12번 게이트)",
    category: "facility",
    lat: 35.28395,
    lng: 129.09810,
    description: "노포역 ↔ 스포원파크 15분 간격 무료 셔틀버스 승하차장 및 지구별 접수대",
    tag: "셔틀/접수",
  },
  {
    id: "facility-west-gate",
    name: "서측 주차장 (마을버스/귀가 셔틀)",
    category: "facility",
    lat: 35.28250,
    lng: 129.09570,
    description: "마을버스 정류장 및 오후 귀가 셔틀버스(19:00~20:30) 탑승지",
    tag: "서측주차장",
  },
  {
    id: "facility-reward",
    name: "공식 상품 수령처 & 식수 배부처",
    category: "facility",
    lat: 35.28160,
    lng: 129.09825,
    description: "스탬프 완주 기념 굿즈 교환 및 미션북 선물 수령처",
    tag: "상품수령",
  },
];

// 4대 테마존 대표 구역 핀
const ZONE_CENTER_POINTS: MapPoint[] = OFFICIAL_ZONES.map((zone) => {
  let lat = SPOWON_CENTER.lat;
  let lng = SPOWON_CENTER.lng;

  if (zone.id === "faith") {
    lat = 35.28205;
    lng = 129.09830;
  } else if (zone.id === "hope") {
    lat = 35.28160;
    lng = 129.09890;
  } else if (zone.id === "love") {
    lat = 35.28125;
    lng = 129.09825;
  } else if (zone.id === "sharing") {
    lat = 35.28145;
    lng = 129.09785;
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
  "faith-11": { lat: 35.28198, lng: 129.09825 }, // 성품성사
  "faith-14": { lat: 35.28212, lng: 129.09835 }, // 혼인성사
  "hope-16": { lat: 35.28165, lng: 129.09885 },  // 고해성사
  "hope-17": { lat: 35.28155, lng: 129.09895 },  // 병자성사
  "love-13": { lat: 35.28135, lng: 129.09835 },  // 세례성사
  "love-29": { lat: 35.28120, lng: 129.09815 },  // 견진성사
  "love-30": { lat: 35.28115, lng: 129.09805 },  // 성체성사
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
