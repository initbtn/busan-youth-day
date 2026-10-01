// 스포원파크 (금정체육공원) 및 4대 테마존 부스/시설 좌표 정의
// 기준 중심 좌표: 스포원파크 야외 분수광장 (35.28173, 129.09845)

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

// 4대 테마존 및 주요 시설/7성사 부스 좌표 데이터셋
export const SPOWON_MAP_POINTS: MapPoint[] = [
  // 1. 주요 행사장 3대 거점 & 시설
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

  // 2. 7성사 필수 체험관 (특별 강조 마커)
  {
    id: "sacrament-faith-11",
    name: "성품성사 체험관 (믿음 11)",
    category: "sacrament",
    zoneId: "faith",
    zoneName: "믿음존",
    lat: 35.28198,
    lng: 129.09825,
    description: "사제와 수도자의 거룩한 부르심을 묵상하고 체험하는 부스",
    boothNumber: 11,
    isSacrament: true,
    sacramentType: "성품성사",
    tag: "7성사",
  },
  {
    id: "sacrament-faith-14",
    name: "혼인성사 체험관 (믿음 14)",
    category: "sacrament",
    zoneId: "faith",
    zoneName: "믿음존",
    lat: 35.28212,
    lng: 129.09835,
    description: "거룩한 혼인과 사랑의 서약을 되새기는 성사 체험관",
    boothNumber: 14,
    isSacrament: true,
    sacramentType: "혼인성사",
    tag: "7성사",
  },
  {
    id: "sacrament-hope-16",
    name: "고해성사 체험관 (희망 16)",
    category: "sacrament",
    zoneId: "hope",
    zoneName: "희망존",
    lat: 35.28165,
    lng: 129.09885,
    description: "주님과의 화해와 평화를 선물하는 고해성사 체험관",
    boothNumber: 16,
    isSacrament: true,
    sacramentType: "고해성사",
    tag: "7성사",
  },
  {
    id: "sacrament-hope-17",
    name: "병자성사 체험관 (희망 17)",
    category: "sacrament",
    zoneId: "hope",
    zoneName: "희망존",
    lat: 35.28155,
    lng: 129.09895,
    description: "치유와 위로의 손길을 전하는 병자성사 은총 체험",
    boothNumber: 17,
    isSacrament: true,
    sacramentType: "병자성사",
    tag: "7성사",
  },
  {
    id: "sacrament-love-13",
    name: "세례성사 체험관 (사랑 13)",
    category: "sacrament",
    zoneId: "love",
    zoneName: "사랑존",
    lat: 35.28135,
    lng: 129.09835,
    description: "신앙의 시작, 물과 성령으로 다시 태어남을 기념하는 부스",
    boothNumber: 13,
    isSacrament: true,
    sacramentType: "세례성사",
    tag: "7성사",
  },
  {
    id: "sacrament-love-29",
    name: "견진성사 체험관 (사랑 29)",
    category: "sacrament",
    zoneId: "love",
    zoneName: "사랑존",
    lat: 35.28120,
    lng: 129.09815,
    description: "성령의 칠은을 받고 참된 그리스도의 증인이 되는 체험",
    boothNumber: 29,
    isSacrament: true,
    sacramentType: "견진성사",
    tag: "7성사",
  },
  {
    id: "sacrament-love-30",
    name: "성체성사 체험관 (사랑 30)",
    category: "sacrament",
    zoneId: "love",
    zoneName: "사랑존",
    lat: 35.28115,
    lng: 129.09805,
    description: "일치와 생명의 빵이신 예수 그리스도를 만나는 은총의 성사",
    boothNumber: 30,
    isSacrament: true,
    sacramentType: "성체성사",
    tag: "7성사",
  },

  // 3. 4대 테마존 대표 구역 핀
  {
    id: "zone-faith-main",
    name: "믿음존 부스 구역 (Faith Zone)",
    category: "zone",
    zoneId: "faith",
    zoneName: "믿음존",
    lat: 35.28205,
    lng: 129.09830,
    description: "1~19번 부스: 교구 수도회, 혈액원, 레지오, 가톨릭대 등 19개 단체",
    tag: "믿음존(19개)",
  },
  {
    id: "zone-hope-main",
    name: "희망존 부스 구역 (Hope Zone)",
    category: "zone",
    zoneId: "hope",
    zoneName: "희망존",
    lat: 35.28160,
    lng: 129.09890,
    description: "1~21번 부스: 성소국, 평화방송, 성모병원, 성령쇄신봉사회 등 21개 단체",
    tag: "희망존(21개)",
  },
  {
    id: "zone-love-main",
    name: "사랑존 부스 구역 (Love Zone)",
    category: "zone",
    zoneId: "love",
    zoneName: "사랑존",
    lat: 35.28125,
    lng: 129.09825,
    description: "1~31번 부스: 장애인선교회, 청년성서모임, 지구 청년회 등 31개 단체",
    tag: "사랑존(31개)",
  },
  {
    id: "zone-sharing-main",
    name: "나눔존 플리마켓 구역 (Sharing Zone)",
    category: "zone",
    zoneId: "sharing",
    zoneName: "나눔존",
    lat: 35.28145,
    lng: 129.09785,
    description: "1~10번 부스: 가톨릭 굿즈, 성물 서원, 플리마켓 및 나눔 체험 10개 단체",
    tag: "나눔존(10개)",
  },
];
