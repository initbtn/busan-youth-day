export interface HiddenTreasureSpot {
  id: string;
  name: string;
  clue: string;
  locationArea: string;
  qrCode: string;
  characterImg: string;
  characterReaction: string;
  blessingMessage: string;
}

export const HIDDEN_TREASURE_SPOTS: HiddenTreasureSpot[] = [
  {
    id: "treasure-1",
    name: "성령의 바람 언덕",
    clue: "푸른 잔디밭 호수가 보이는 하얀 벤치 아래, 쭈양이가 물고기 쿠션을 안고 쉬고 있어요!",
    locationArea: "A구역 호수 산책로 벤치 구역",
    qrCode: "JJUYANG_TREASURE_WIND_01",
    characterImg: "/assets/characters/jjuyang1.png",
    characterReaction: "와! 첫 번째 보물 발자국을 찾았양! 🐑✨",
    blessingMessage: "바람이 불어오는 곳마다 주님의 평화가 여러분과 함께하길!",
  },
  {
    id: "treasure-2",
    name: "선한 목자의 오솔길",
    clue: "지성소로 향하는 조용한 길목, 키 큰 은행나무 그늘 아래 십자가 표지를 찾아보세요.",
    locationArea: "B구역 실내체육관 문화홀(지성소) 진입로",
    qrCode: "JJUYANG_TREASURE_SHEPHERD_02",
    characterImg: "/assets/characters/jjuyang2.png",
    characterReaction: "조용히 기도하는 쭈양이를 발견했양! 🍞🙏",
    blessingMessage: "주님은 나의 목자, 아쉬울 것 없어라. (시편 23,1)",
  },
  {
    id: "treasure-3",
    name: "오병이어 나눔 쉼터",
    clue: "친구들과 돗자리를 펴고 도시락을 나누는 야외 그늘막 기둥 뒤에 숨어있어요.",
    locationArea: "피크닉 쉼터 잔디광장 C구역 방향",
    qrCode: "JJUYANG_TREASURE_MIRACLE_03",
    characterImg: "/assets/characters/jjuyang3.png",
    characterReaction: "함께 나누어 먹는 기쁨이 최고양! 🐟🥖",
    blessingMessage: "작은 빵 다섯 개와 물고기 두 마리의 기적이 오늘 우리에게도!",
  },
  {
    id: "treasure-4",
    name: "찬양의 울림터",
    clue: "청년들의 노랫소리가 가득한 야외공연장 버스킹 무대 뒤편 계단 난간을 살펴보세요.",
    locationArea: "C구역 가족공원 야외공연 무대 좌측",
    qrCode: "JJUYANG_TREASURE_PRAISE_04",
    characterImg: "/assets/characters/jjuyang4.png",
    characterReaction: "신나게 찬양하는 쭈양이를 찾았양! 🎵🎉",
    blessingMessage: "주님을 찬양하여라, 온 땅아! 기쁨으로 주님을 섬겨라.",
  },
  {
    id: "treasure-5",
    name: "청춘의 출발선",
    clue: "스포원에 처음 발을 디뎠던 북측 셔틀버스 하차 게이트 안내판 근처에 비밀의 문이!",
    locationArea: "북측 주차장 12번 게이트 셔틀버스 정류소 부근",
    qrCode: "JJUYANG_TREASURE_MISSION_05",
    characterImg: "/assets/characters/jjuyang5.png",
    characterReaction: "대단해양! 5개 숨겨진 보물을 모두 정복했양! 🏆👑",
    blessingMessage: "용기를 내어라, 내가 세상을 이겼다! (요한 16,33)",
  },
];
