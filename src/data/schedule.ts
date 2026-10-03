export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  zone: "A" | "B" | "C" | "공통";
  description: string;
  isImportant?: boolean;
}

export interface ImportantNoticeItem {
  id: string;
  title: string;
  time: string;
  location: string;
  badge: string;
  description: string;
  details?: string[];
  theme: "blue" | "emerald" | "amber" | "indigo";
}

// 접수/패키지 수령 및 셔틀버스 등 핵심 독립 안내 항목
export const MAIN_NOTICE_ITEMS: ImportantNoticeItem[] = [
  {
    id: "checkin-package",
    title: "본당 접수 및 참가자 패키지 수령",
    time: "09:00 ~ 14:00",
    location: "A구역 주출입구 / 패키지 수령처",
    badge: "접수 필수",
    description: "본당 대표자 1인이 접수 및 참가자 패키지, 실내체육관 좌석 배치도를 수령합니다.",
    details: [
      "운영 시간: 09:00 ~ 14:00 (14시 이후 수령 불가)",
      "수령 물품: BYD 웰컴 패키지, 기념품, 본당별 실내체육관 좌석 배치도",
      "장소: 스포원파크 A구역 야외 분수광장 주출입구 본부석",
    ],
    theme: "blue",
  },
  {
    id: "shuttle-bus",
    title: "귀가 셔틀버스 운행 안내",
    time: "19:00 ~ 20:30 (15분 간격)",
    location: "스포원파크 정문 / 서측 마을버스 정류장 ↔ 노포역(1호선)",
    badge: "교통 안내",
    description: "파견미사 종료 후 노포역(1호선) 방면 무료 순환 셔틀버스가 15분 간격으로 운행됩니다.",
    details: [
      "운행 구간: 스포원파크 정문/서측 정류장 ↔ 노포역 (지하철 1호선)",
      "운행 시간: 19:00 ~ 20:30 (15분 간격 집중 순환 배차)",
      "안내: 안전을 위해 본당별 순차 퇴장 요원의 안내에 따라 탑승해 주시기 바랍니다.",
    ],
    theme: "indigo",
  },
];

export const EVENT_SCHEDULE: ScheduleItem[] = [
  {
    time: "10:00 ~ 15:00",
    title: "4대 테마존 축제 부스 체험",
    location: "A구역 야외 분수광장 주변",
    zone: "A",
    description: "믿음·희망·사랑·나눔 4대 테마 81개 부스, 7성사 체험, 디지털 스탬프 투어 및 상품 수령처 운영",
    isImportant: true,
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
    time: "11:00 ~ 14:45",
    title: "야외무대 버스킹 공연 및 찬양",
    location: "C구역 야외 가족공원 무대",
    zone: "C",
    description: "카톨리카, 오후의 정원, 소울브릿지 등 10개 청년·찬양팀 릴레이 야외무대 라이브",
    isImportant: true,
  },
  {
    time: "12:00 ~ 15:30",
    title: "실내체육관 입장 및 실내 문화공연",
    location: "B구역 실내체육관",
    zone: "B",
    description: "12:00부터 실내 자유석 입장 가능 (음식물 반입 불가, 운동화 착용 필수)",
  },
  {
    time: "13:30 ~ 15:30",
    title: "상설 고해소 운영",
    location: "C구역 가족공원 및 실내 상설 고해소",
    zone: "공통",
    description: "부산교구 사제단 고해성사 집전",
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
];
