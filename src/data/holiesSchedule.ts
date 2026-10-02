export interface HoliesSlot {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  leaderOrTeam: string;
  description: string;
  badge: "성체조배" | "찬양" | "기도" | "강복";
}

export const HOLIES_SCHEDULE: HoliesSlot[] = [
  {
    id: "holies-1",
    time: "10:00 ~ 10:30",
    title: "침묵 중 성체조배",
    subtitle: "주님 앞에 머무는 고요한 시간",
    leaderOrTeam: "개인 침묵 기도",
    description: "성체 대전에서 침묵과 묵상으로 주님과 일치하는 시간입니다. 1회 입장 100명 제한으로 순차 입장합니다.",
    badge: "성체조배",
  },
  {
    id: "holies-2",
    time: "10:30 ~ 11:30",
    title: "찬양 성시간 1 (선율)",
    subtitle: "찬양사도 선율과 함께하는 찬양 기도",
    leaderOrTeam: "찬양사도 선율",
    description: "선율의 아름다운 성가 연주와 찬양으로 마음을 열고 성체 예수님을 찬미하는 성시간입니다.",
    badge: "찬양",
  },
  {
    id: "holies-3",
    time: "12:00 ~ 12:30",
    title: "낮기도 (육시경)",
    subtitle: "성무일도 정오 낮기도 공동 바침",
    leaderOrTeam: "교구 청소년사목국",
    description: "낮 열두 시, 교구 청소년과 청년들이 한마음으로 바치는 공식 성무일도 육시경 기도입니다.",
    badge: "기도",
  },
  {
    id: "holies-4",
    time: "13:30 ~ 14:30",
    title: "찬양 성시간 2 (딸기나무)",
    subtitle: "청년 찬양밴드 딸기나무와 함께하는 은혜의 시간",
    leaderOrTeam: "청년 찬양밴드 딸기나무",
    description: "역동적인 찬양과 감미로운 묵상곡으로 청년들의 신앙 열정을 주님께 봉헌하는 성시간입니다.",
    badge: "찬양",
  },
  {
    id: "holies-5",
    time: "15:00 ~ 15:30",
    title: "낮기도 (구시경) 및 성체 강복",
    subtitle: "오후 낮기도와 거룩한 성체 강복 예식",
    leaderOrTeam: "지도사제단 집전",
    description: "오후 3시 구시경 기도와 함께 파견미사 전 지성소 일정을 마무리하는 장엄 성체 강복 예식입니다.",
    badge: "강복",
  },
];
