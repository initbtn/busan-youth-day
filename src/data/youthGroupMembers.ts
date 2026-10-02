export interface YouthGroupMember {
  id: string;
  name: string;
  baptismalName?: string;
  parish: string;
  district: string;
  role: string;
  saintId: string;
  avatarUrl?: string;
  motto?: string;
}

export const YOUTH_GROUP_MEMBERS: YouthGroupMember[] = [
  // 1. 성 요한 바오로 2세 모둠 (john-paul-ii)
  {
    id: "m-jp2-1",
    name: "박요셉",
    baptismalName: "요셉",
    parish: "남천",
    district: "남천지구",
    role: "교리교사",
    saintId: "john-paul-ii",
    avatarUrl: "/assets/characters/jjuyang1.png",
    motto: "그리스도께 문을 활짝 열고 청년들과 함께 뜁니다!",
  },
  {
    id: "m-jp2-2",
    name: "정루시아",
    baptismalName: "루시아",
    parish: "광안",
    district: "남천지구",
    role: "청년",
    saintId: "john-paul-ii",
    avatarUrl: "/assets/characters/jjuyang2.png",
    motto: "빛으로 인도하시는 주님을 따릅니다.",
  },
  {
    id: "m-jp2-3",
    name: "강프란치스코",
    baptismalName: "프란치스코",
    parish: "해운대",
    district: "해운대지구",
    role: "청년",
    saintId: "john-paul-ii",
    avatarUrl: "/assets/characters/jjuyang3.png",
    motto: "두려워하지 않고 믿음의 한 걸음을 내딛겠습니다.",
  },

  // 2. 성 김대건 안드레아 모둠 (andrew-kim-taegon)
  {
    id: "m-kim-1",
    name: "김마리아",
    baptismalName: "마리아",
    parish: "하단",
    district: "서부산지구",
    role: "청년",
    saintId: "andrew-kim-taegon",
    avatarUrl: "/assets/characters/jjuyang1.png",
    motto: "부디 서로 사랑하고 화목하여 영원한 복락을 누립시다.",
  },
  {
    id: "m-kim-2",
    name: "이베드로",
    baptismalName: "베드로",
    parish: "복산",
    district: "동래지구",
    role: "청년",
    saintId: "andrew-kim-taegon",
    avatarUrl: "/assets/characters/jjuyang4.png",
    motto: "한국 청년 신앙의 굳건한 반석이 되겠습니다.",
  },
  {
    id: "m-kim-3",
    name: "최안드레아",
    baptismalName: "안드레아",
    parish: "괴정",
    district: "서부산지구",
    role: "교리교사",
    saintId: "andrew-kim-taegon",
    avatarUrl: "/assets/characters/jjuyang2.png",
    motto: "순교자의 열정을 본받아 부산 청년 복음화에 헌신합니다.",
  },

  // 3. 성 프란체스카 카브리니 모둠 (francesca-cabrini)
  {
    id: "m-cab-1",
    name: "윤아녜스",
    baptismalName: "아녜스",
    parish: "서면",
    district: "중부산지구",
    role: "청년",
    saintId: "francesca-cabrini",
    avatarUrl: "/assets/characters/jjuyang3.png",
    motto: "모든 사람에게 따뜻한 사랑과 환대를 전하고 싶어요.",
  },
  {
    id: "m-cab-2",
    name: "송미카엘",
    baptismalName: "미카엘",
    parish: "전포",
    district: "중부산지구",
    role: "청년",
    saintId: "francesca-cabrini",
    avatarUrl: "/assets/characters/jjuyang1.png",
    motto: "작은 나눔에서 시작되는 주님의 큰 사랑을 믿습니다.",
  },

  // 4. 성 요세피나 바키타 모둠 (josephine-bakhita)
  {
    id: "m-bak-1",
    name: "한체칠리아",
    baptismalName: "체칠리아",
    parish: "범일",
    district: "중부산지구",
    role: "청년",
    saintId: "josephine-bakhita",
    avatarUrl: "/assets/characters/jjuyang2.png",
    motto: "용서와 희망을 전하는 맑은 영혼으로 살아가겠습니다.",
  },
  {
    id: "m-bak-2",
    name: "오가브리엘",
    baptismalName: "가브리엘",
    parish: "초량",
    district: "원도심지구",
    role: "청년",
    saintId: "josephine-bakhita",
    avatarUrl: "/assets/characters/jjuyang4.png",
    motto: "어려운 이웃 곁에서 함께 기도하는 청년이 되겠습니다.",
  },

  // 5. 성 카를로 아쿠티스 모둠 (carlo-acutis)
  {
    id: "m-acu-1",
    name: "신바오로",
    baptismalName: "바오로",
    parish: "주례",
    district: "북부산지구",
    role: "청년",
    saintId: "carlo-acutis",
    avatarUrl: "/assets/characters/jjuyang1.png",
    motto: "성체는 하늘나라로 향하는 고속도로! 디지털 선교에 앞장섭니다.",
  },
  {
    id: "m-acu-2",
    name: "문헬레나",
    baptismalName: "헬레나",
    parish: "덕천",
    district: "북부산지구",
    role: "교리교사",
    saintId: "carlo-acutis",
    avatarUrl: "/assets/characters/jjuyang3.png",
    motto: "스마트폰 속에서도 주님의 향기를 피워 올리는 청년 공동체!",
  },
];

export function getYouthGroupMembers(saintId: string): YouthGroupMember[] {
  return YOUTH_GROUP_MEMBERS.filter((m) => m.saintId === saintId);
}
