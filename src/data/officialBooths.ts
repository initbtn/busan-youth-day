export interface OfficialBooth {
  number: number;
  name: string;
  isSacrament?: boolean; // 7성사 부스 여부
  sacramentType?: string;
  notes?: string;
  organization?: string;
  description?: string;
  activities?: string[];
  operatingHours?: string;
}

export interface ZoneData {
  id: "faith" | "hope" | "love" | "sharing";
  name: string;
  koreanName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  rule: string;
  booths: OfficialBooth[];
}

export const OFFICIAL_ZONES: ZoneData[] = [
  {
    id: "faith",
    name: "Faith Zone",
    koreanName: "믿음존",
    color: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    description: "교구 수도회와 청년 단체들이 신앙의 기쁨을 전하는 부스",
    rule: "7성사 부스 1개 + 일반 부스 2개 = 총 3개 획득",
    booths: [
      { number: 1, name: "노틀담 수녀회" },
      { number: 2, name: "대한적십자사 부산혈액원" },
      { number: 3, name: "부산가톨릭대학교 중독회복이음센터" },
      { number: 4, name: "부산가톨릭상담센터(무지개청소년상담실)" },
      { number: 5, name: "식수 배부처" },
      { number: 6, name: "성바오로딸 수도회" },
      { number: 7, name: "야음지구 유니트" },
      { number: 8, name: "비다누에바 (VIDA NUEVA), 새로운 삶" },
      { number: 9, name: "청년레지오 연합회(나만의 묵주 만들기 1)" },
      { number: 10, name: "청년레지오 연합회(나만의 묵주 만들기 2)" },
      { number: 11, name: "성품성사 체험관", isSacrament: true, sacramentType: "성품성사" },
      { number: 12, name: "유리공방 어느날" },
      { number: 13, name: "Laus (라우스)" },
      { number: 14, name: "혼인성사 체험관", isSacrament: true, sacramentType: "혼인성사" },
      { number: 15, name: "정오살롱" },
      { number: 16, name: "이틀상점" },
      { number: 17, name: "삼계지구 유니트" },
      { number: 18, name: "올리베따노 성 베네딕도 수녀회" },
      { number: 19, name: "예수성심시녀회" },
    ],
  },
  {
    id: "hope",
    name: "Hope Zone",
    koreanName: "희망존",
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    description: "생명과 사랑의 복음을 체험하는 희망의 공간",
    rule: "7성사 부스 1개 + 일반 부스 2개 = 총 3개 획득",
    booths: [
      { number: 1, name: "미리내 성모성심 수녀회" },
      { number: 2, name: "한국순교복자빨마수녀회" },
      { number: 3, name: "천주교부산교구 성소국" },
      { number: 4, name: "언니네문구점" },
      { number: 5, name: "엘리의 굿즈" },
      { number: 6, name: "담프나" },
      { number: 7, name: "문달아트" },
      { number: 8, name: "한국외방선교 수녀회 (1)" },
      { number: 9, name: "한국외방선교 수녀회 (2)" },
      { number: 10, name: "도전 100세 (100세까지 사제 미사 봉헌하기)" },
      { number: 11, name: "가야지구 청년연합회" },
      { number: 12, name: "젊은이 성령쇄신 봉사회(VSS) (1)" },
      { number: 13, name: "젊은이 성령쇄신 봉사회(VSS) (2)" },
      { number: 14, name: "젊은이 성령쇄신 봉사회(VSS) (3)" },
      { number: 15, name: "가톨릭 스카우트" },
      { number: 16, name: "고해성사 체험관", isSacrament: true, sacramentType: "고해성사" },
      { number: 17, name: "병자성사 체험관", isSacrament: true, sacramentType: "병자성사" },
      { number: 18, name: "부산가톨릭대학교, 가톨릭센터, 오순절평화의마을" },
      { number: 19, name: "부산가톨릭의료원 (부산성모병원, 메리놀병원)" },
      { number: 20, name: "CPBC부산가톨릭평화방송" },
      { number: 21, name: "천주교부산교구 전산홍보국 사회복지법인 로사리오카리타스" },
    ],
  },
  {
    id: "love",
    name: "Love Zone",
    koreanName: "사랑존",
    color: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    description: "이웃 사랑과 헌신, 나눔을 배우는 은총의 공간",
    rule: "7성사 부스 1개 + 일반 부스 2개 = 총 3개 획득",
    booths: [
      { number: 1, name: "예수 성심 전교 수녀회" },
      { number: 2, name: "예수 마음 공방" },
      { number: 3, name: "부산 가톨릭 농아인 선교회" },
      { number: 4, name: "피스넬렐러 진단" },
      { number: 5, name: "부산 가톨릭 시각장애인 선교회" },
      { number: 6, name: "부산교구 ARCA 청소년성서모임 (1)" },
      { number: 7, name: "부산교구 ARCA 청소년성서모임 (2)" },
      { number: 8, name: "금정지구 유니트" },
      { number: 9, name: "티 없으신 마리아 성심수녀회" },
      { number: 10, name: "아베마리아 출판사" },
      { number: 11, name: "포콜라레" },
      { number: 12, name: "젤라부로 물들어~" },
      { number: 13, name: "세례성사 체험관", isSacrament: true, sacramentType: "세례성사" },
      { number: 14, name: "2027 WYD 그것이 궁금하다" },
      { number: 15, name: "청년합창단 셀레스티스" },
      { number: 16, name: "식수 배부처" },
      { number: 17, name: "바티카노 성물" },
      { number: 18, name: "아임우드" },
      { number: 19, name: "Made In Pualus" },
      { number: 20, name: "홀리벨(Holy bell)" },
      { number: 21, name: "남천지구 유니트" },
      { number: 22, name: "남천지구 유니트" },
      { number: 23, name: "살뜨르 성바오로 수녀회" },
      { number: 24, name: "스승예수의 제자 수녀회 (1)" },
      { number: 25, name: "스승예수의 제자 수녀회 (2)" },
      { number: 26, name: "러빙젠" },
      { number: 27, name: "더스팀" },
      { number: 28, name: "드높임" },
      { number: 29, name: "견진성사 체험관", isSacrament: true, sacramentType: "견진성사" },
      { number: 30, name: "성체성사 체험관", isSacrament: true, sacramentType: "성체성사" },
      { number: 31, name: "살레시오회" },
    ],
  },
  {
    id: "sharing",
    name: "Sharing Zone",
    koreanName: "나눔존",
    color: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    description: "굿즈, 서적, 성물과 플리마켓으로 풍성한 나눔 광장",
    rule: "체험 및 자유 탐방 (스탬프 합산 외 추가 이벤트 혜택)",
    booths: [
      { number: 1, name: "바오로딸 서원" },
      { number: 2, name: "가톨릭.Zip" },
      { number: 3, name: "아로마로온" },
      { number: 4, name: "한 땀 한 땀" },
      { number: 5, name: "안나의 도토리바구니" },
      { number: 6, name: "오병이어 만물상" },
      { number: 7, name: "찌니네 잡화점" },
      { number: 8, name: "해운대성당 플리마켓" },
      { number: 9, name: "학교법인 성모학원" },
      { number: 10, name: "나눔 플레이존" },
    ],
  },
];

export interface BoothDetail extends OfficialBooth {
  zoneId: "faith" | "hope" | "love" | "sharing";
  zoneName: string;
  zoneColor: string;
  badgeBg: string;
  badgeText: string;
}

export function findBoothById(id: string): BoothDetail | null {
  if (!id || typeof id !== "string") return null;
  const parts = id.split("-");
  if (parts.length < 2) return null;
  const zoneId = parts[0] as "faith" | "hope" | "love" | "sharing";
  const boothNumber = parseInt(parts[1], 10);
  if (isNaN(boothNumber)) return null;

  const zone = OFFICIAL_ZONES.find((z) => z.id === zoneId);
  if (!zone) return null;

  const booth = zone.booths.find((b) => b.number === boothNumber);
  if (!booth) return null;

  const defaultDescription = booth.isSacrament
    ? `${booth.name}은(는) 가톨릭 교회의 거룩한 7성사 중 하나인 [${booth.sacramentType}]의 은총과 의미를 청년들의 시선에서 체험하고 사제 및 수도자들과 영적 나눔을 갖는 공식 체험관입니다.`
    : `${booth.name} 부스는 2026 부산교구 젊은이의 날(BYD) 행사에서 청년 참가자들과 함께 신앙과 친교를 나누는 공식 운영 부스입니다.`;

  const defaultActivities = booth.isSacrament
    ? [`${booth.sacramentType} 교리 및 성사 의미 안내`, "영적 대화 및 기도 지향 봉헌", "기념 축복 카드 배부"]
    : ["부스 고유 프로그램 및 미션 체험", "수도회/단체 소개 및 홍보물 배부", "스탬프 투어 확인"];

  return {
    ...booth,
    zoneId: zone.id,
    zoneName: zone.koreanName,
    zoneColor: zone.color,
    badgeBg: zone.badgeBg,
    badgeText: zone.badgeText,
    organization: booth.organization || (booth.isSacrament ? "부산교구 성소국 / 사제단" : booth.name),
    description: booth.description || defaultDescription,
    activities: booth.activities || defaultActivities,
    operatingHours: booth.operatingHours || "10:00 - 15:00",
  };
}
