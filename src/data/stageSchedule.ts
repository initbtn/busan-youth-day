export interface StageProgram {
  time: string;
  performer: string;
  category?: string;
  description?: string;
}

export const INDOOR_STAGE_PROGRAMS: StageProgram[] = [
  { time: "12:00 ~ 13:00", performer: "실내 체육관 개방 및 자유석 착석", category: "입장" },
  { time: "13:00 ~ 13:10", performer: "CPBC 부산소년소녀합창단", category: "합창" },
  { time: "13:10 ~ 13:40", performer: "버튜버 '레옹 신부' 특별 LIVE 방송", category: "특별방송" },
  { time: "13:45 ~ 14:15", performer: "밴드 나마스테", category: "밴드공연" },
  { time: "14:20 ~ 14:30", performer: "부산교구 수녀연합회", category: "찬양" },
  { time: "14:35 ~ 14:55", performer: "부산교구 사제악단 <살아있네!>", category: "사제악단" },
  { time: "15:00 ~ 15:30", performer: "Des Worship", category: "찬양워십" },
];

export const OUTDOOR_STAGE_PROGRAMS: StageProgram[] = [
  { time: "11:00 ~ 11:15", performer: "처음", category: "청년팀" },
  { time: "11:15 ~ 11:35", performer: "카톨리카", category: "생활성가" },
  { time: "11:35 ~ 12:00", performer: "오후의 정원", category: "청년팀" },
  { time: "12:00 ~ 12:25", performer: "소울브릿지", category: "생활성가" },
  { time: "12:25 ~ 12:35", performer: "1부 브레이크 타임", category: "휴식" },
  { time: "12:35 ~ 12:55", performer: "빈세진 X 진우성 (힙합 듀오)", category: "힙합" },
  { time: "12:55 ~ 13:20", performer: "주와", category: "생활성가" },
  { time: "13:20 ~ 13:45", performer: "하늘씨앗 찬양단", category: "찬양단" },
  { time: "13:45 ~ 14:15", performer: "픽카드 밴드", category: "밴드" },
  { time: "14:15 ~ 14:45", performer: "부산가톨릭챔버오케스트라", category: "오케스트라" },
];
