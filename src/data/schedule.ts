export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  zone: "A" | "B" | "C" | "공통";
  description: string;
  isImportant?: boolean;
}

export const EVENT_SCHEDULE: ScheduleItem[] = [
  {
    time: "09:00 ~ 14:00",
    title: "본당 접수 및 패키지 수령",
    location: "A구역 주출입구 / 패키지 수령처",
    zone: "A",
    description: "본당 대표자 1인이 접수 및 참가자 패키지, 실내체육관 좌석 배치도 수령 (14:00 마감)",
    isImportant: true,
  },
  {
    time: "10:00 ~ 15:00",
    title: "4대 테마존 축제 부스 체험",
    location: "A구역 분수광장 주변",
    zone: "A",
    description: "믿음·희망·사랑·나눔 4대 테마 부스 및 7성사 체험, 디지털 스탬프 투어",
  },
  {
    time: "10:00 ~ 15:30",
    title: "지성소 (성체조배 및 침묵기도)",
    location: "B구역 실내체육관 1F 문화홀",
    zone: "B",
    description: "성체 앞에서 침묵과 찬양으로 머무는 영적 기도 공간 (1회 100명 입장, 대기 발생 가능)",
    isImportant: true,
  },
  {
    time: "11:00 ~ 15:00",
    title: "야외무대 공연 및 찬양",
    location: "C구역 야외 가족공원 무대",
    zone: "C",
    description: "청년 밴드, 율동팀, 찬양사도 야외 공연",
  },
  {
    time: "12:00 ~ 15:30",
    title: "실내체육관 입장 및 실내 문화공연",
    location: "B구역 실내체육관",
    zone: "B",
    description: "12:00부터 입장 가능 (자유석 운영, 음식물 반입 불가, 운동화 착용 필수)",
  },
  {
    time: "13:30 ~ 15:30",
    title: "상설 고해소 운영",
    location: "실내체육관 상설 고해소",
    zone: "B",
    description: "사제단 고해성사 집전",
    isImportant: true,
  },
  {
    time: "15:30 ~ 15:55",
    title: "미사 참례자 지정석 착석",
    location: "B구역 실내체육관",
    zone: "B",
    description: "본당별 지정 구역 좌석으로 이동 및 착석 완료 (안내봉사자 통제)",
    isImportant: true,
  },
  {
    time: "16:00 ~ 18:30",
    title: "BYD 축제 (파견) 미사",
    location: "B구역 실내체육관 (야외 및 분산 생중계)",
    zone: "B",
    description: "총대리 신호철 주교 주례 파견미사, 청청해 주제가 챌린지 시상식",
    isImportant: true,
  },
  {
    time: "18:30 ~ 19:30",
    title: "귀가 및 순차 퇴장 / 셔틀버스 탑승",
    location: "스포원파크 정문 / 서측 마을버스 정류장",
    zone: "공통",
    description: "구역별 순차 퇴장 안내, 노포역행 셔틀버스 15분 간격 운행 (19:00 ~ 20:30)",
  },
];
