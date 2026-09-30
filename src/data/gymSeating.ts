export interface ParishSeatInfo {
  parish: string;
  district: string;
  floor: "1층" | "2층";
  sector: string;
  seatCount?: number;
  notes?: string;
}

// 공문 G26-146 실내체육관 좌석배치도 1층 및 2층 매핑 데이터
export const PARISH_SEATING_DATA: ParishSeatInfo[] = [
  // --- 1층 섹터 (1-1 ~ 1-8) ---
  // 1-1 (남천지구)
  { parish: "수영", district: "남천지구", floor: "1층", sector: "1-1", seatCount: 31 },
  { parish: "석포", district: "남천지구", floor: "1층", sector: "1-1", seatCount: 27 },
  { parish: "이기대", district: "남천지구", floor: "1층", sector: "1-1", seatCount: 51 },
  { parish: "광안", district: "남천지구", floor: "1층", sector: "1-1", seatCount: 29 },

  // 1-2 (가야지구)
  { parish: "모라성요한", district: "가야지구", floor: "1층", sector: "1-2", seatCount: 20 },
  { parish: "전포", district: "가야지구", floor: "1층", sector: "1-2", seatCount: 28 },
  { parish: "가야", district: "가야지구", floor: "1층", sector: "1-2", seatCount: 52 },
  { parish: "연산", district: "가야지구", floor: "1층", sector: "1-2", seatCount: 42 },
  { parish: "성지", district: "가야지구", floor: "1층", sector: "1-2 (일부)", seatCount: 38, notes: "1-2구역 및 1-6구역 분산" },

  // 1-3 (복산지구)
  { parish: "성안", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 18 },
  { parish: "병영", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 15 },
  { parish: "명촌", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 6 },
  { parish: "우정", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 9 },
  { parish: "복산", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 25 },
  { parish: "천곡", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 16 },
  { parish: "호계", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 25 },
  { parish: "방어진", district: "복산지구", floor: "1층", sector: "1-3", seatCount: 29 },

  // 1-4 (삼계지구 & 청년 신심 단체)
  { parish: "연지", district: "삼계지구", floor: "1층", sector: "1-4", seatCount: 28, notes: "연지① 1층 1-4, 연지② 1층 1-8" },
  { parish: "젊은이성령쇄신", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "청년레지오", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "부산선택", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "선율", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "포콜라레", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "아르카", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "부가대연", district: "청년신심단체", floor: "1층", sector: "1-4" },
  { parish: "비다누에바", district: "청년신심단체", floor: "1층", sector: "1-4" },

  // 1-5 (남천지구)
  { parish: "대연", district: "남천지구", floor: "1층", sector: "1-5", seatCount: 32 },
  { parish: "민락", district: "남천지구", floor: "1층", sector: "1-5", seatCount: 39 },
  { parish: "못골", district: "남천지구", floor: "1층", sector: "1-5", seatCount: 19 },
  { parish: "망미", district: "남천지구", floor: "1층", sector: "1-5", seatCount: 35 },
  { parish: "용호", district: "남천지구", floor: "1층", sector: "1-5", seatCount: 37 },

  // 1-6 (가야·남천지구)
  { parish: "양정", district: "가야지구", floor: "1층", sector: "1-6", seatCount: 22 },
  { parish: "개금", district: "가야지구", floor: "1층", sector: "1-6", seatCount: 15 },
  { parish: "서면", district: "가야지구", floor: "1층", sector: "1-6", seatCount: 33 },
  { parish: "문현", district: "남천지구", floor: "1층", sector: "1-6", seatCount: 38 },
  { parish: "동항", district: "남천지구", floor: "1층", sector: "1-6", seatCount: 18 },

  // 1-7 (가야·복산지구)
  { parish: "남목", district: "복산지구", floor: "1층", sector: "1-7", seatCount: 25 },
  { parish: "거제동", district: "가야지구", floor: "1층", sector: "1-7", seatCount: 53 },
  { parish: "사상", district: "가야지구", floor: "1층", sector: "1-7", seatCount: 28 },
  { parish: "당감", district: "가야지구", floor: "1층", sector: "1-7", seatCount: 38 },
  { parish: "엄궁", district: "가야지구", floor: "1층", sector: "1-7", seatCount: 16 },
  { parish: "성바오로", district: "복산지구", floor: "1층", sector: "1-7", notes: "성바오로① 1-7, 성바오로② 1-8" },

  // 1-8 (삼계·복산지구)
  { parish: "남밀양", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 11 },
  { parish: "임호", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 10 },
  { parish: "지내", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 6 },
  { parish: "율하", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 23 },
  { parish: "장유대청", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 44 },
  { parish: "김해", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 21 },
  { parish: "밀양", district: "삼계지구", floor: "1층", sector: "1-8", seatCount: 26 },
  { parish: "삼계", district: "삼계지구", floor: "1층", sector: "1-8" },

  // --- 2층 스탠드 섹터 (2-5 ~ 2-20) ---
  // 2-5 (하단지구)
  { parish: "사하", district: "하단지구", floor: "2층", sector: "2-5", seatCount: 20 },
  { parish: "송도", district: "하단지구", floor: "2층", sector: "2-5", seatCount: 9 },

  // 2-6 (하단지구)
  { parish: "당리", district: "하단지구", floor: "2층", sector: "2-6", seatCount: 28 },
  { parish: "동대신", district: "하단지구", floor: "2층", sector: "2-6", seatCount: 26 },
  { parish: "몰운대", district: "하단지구", floor: "2층", sector: "2-6", seatCount: 38 },
  { parish: "명지", district: "하단지구", floor: "2층", sector: "2-6", seatCount: 64 },

  // 2-7 (하단지구)
  { parish: "괴정", district: "하단지구", floor: "2층", sector: "2-7", seatCount: 8 },
  { parish: "다대", district: "하단지구", floor: "2층", sector: "2-7", seatCount: 35 },
  { parish: "서대신", district: "하단지구", floor: "2층", sector: "2-7", seatCount: 60 },
  { parish: "아미", district: "하단지구", floor: "2층", sector: "2-7", seatCount: 16 },
  { parish: "하단", district: "하단지구", floor: "2층", sector: "2-7", seatCount: 37 },

  // 2-8 (금정·하단지구)
  { parish: "동래", district: "금정지구", floor: "2층", sector: "2-8", seatCount: 33 },
  { parish: "반송", district: "금정지구", floor: "2층", sector: "2-8", seatCount: 21 },
  { parish: "사직", district: "금정지구", floor: "2층", sector: "2-8", seatCount: 32 },
  { parish: "안락", district: "금정지구", floor: "2층", sector: "2-8", seatCount: 6 },
  { parish: "장림", district: "하단지구", floor: "2층", sector: "2-8", seatCount: 24 },
  { parish: "명지파티마성모", district: "하단지구", floor: "2층", sector: "2-8", seatCount: 7 },

  // 2-9 (금정지구)
  { parish: "사직대건", district: "금정지구", floor: "2층", sector: "2-9", seatCount: 20 },
  { parish: "온천", district: "금정지구", floor: "2층", sector: "2-9", seatCount: 80 },

  // 2-10 (금정지구)
  { parish: "금정", district: "금정지구", floor: "2층", sector: "2-10", seatCount: 38 },
  { parish: "부곡", district: "금정지구", floor: "2층", sector: "2-10", seatCount: 16 },
  { parish: "서동", district: "금정지구", floor: "2층", sector: "2-10", seatCount: 13 },
  { parish: "토현", district: "금정지구", floor: "2층", sector: "2-10", seatCount: 39 },

  // 2-11 (가야·금정·남천지구)
  { parish: "주례", district: "가야지구", floor: "2층", sector: "2-11", seatCount: 30, notes: "주례① 2-11, 주례② 2-12" },
  { parish: "남산", district: "금정지구", floor: "2층", sector: "2-11", seatCount: 59 },
  { parish: "남천", district: "남천지구", floor: "2층", sector: "2-11" },

  // 2-12 (가야·우동지구)
  { parish: "반여", district: "우동지구", floor: "2층", sector: "2-12", seatCount: 7 },
  { parish: "우동", district: "우동지구", floor: "2층", sector: "2-12", seatCount: 26 },
  { parish: "장산", district: "우동지구", floor: "2층", sector: "2-12", seatCount: 52 },
  { parish: "좌동", district: "우동지구", floor: "2층", sector: "2-12", seatCount: 40 },
  { parish: "해운대", district: "우동지구", floor: "2층", sector: "2-12", seatCount: 23 },

  // 2-13 (야음·우동지구)
  { parish: "삼산", district: "야음지구", floor: "2층", sector: "2-13", seatCount: 26 },
  { parish: "언양성야고보", district: "야음지구", floor: "2층", sector: "2-13", seatCount: 16 },
  { parish: "교리", district: "우동지구", floor: "2층", sector: "2-13", seatCount: 15 },
  { parish: "기장", district: "우동지구", floor: "2층", sector: "2-13", seatCount: 36 },
  { parish: "달맞이", district: "우동지구", floor: "2층", sector: "2-13", seatCount: 9 },
  { parish: "성가정", district: "우동지구", floor: "2층", sector: "2-13", seatCount: 57 },
  { parish: "정관", district: "우동지구", floor: "2층", sector: "2-13", seatCount: 14 },

  // 2-14 (야음지구)
  { parish: "두왕성베드로", district: "야음지구", floor: "2층", sector: "2-14", seatCount: 34 },
  { parish: "무거", district: "야음지구", floor: "2층", sector: "2-14", seatCount: 24 },
  { parish: "범서", district: "야음지구", floor: "2층", sector: "2-14", seatCount: 21 },
  { parish: "야음", district: "야음지구", floor: "2층", sector: "2-14", seatCount: 34 },
  { parish: "옥동", district: "야음지구", floor: "2층", sector: "2-14", seatCount: 31 },

  // 2-15 (노동사목 이주민공동체 & 특별 참례석)
  { parish: "노동사목", district: "교구사목국", floor: "2층", sector: "2-15", notes: "이주민 공동체 전용 배정석" },

  // 2-16 (양산지구)
  { parish: "구포", district: "양산지구", floor: "2층", sector: "2-16", seatCount: 28 },
  { parish: "대천", district: "양산지구", floor: "2층", sector: "2-16", seatCount: 31 },
  { parish: "덕천", district: "양산지구", floor: "2층", sector: "2-16", seatCount: 17 },
  { parish: "물금", district: "양산지구", floor: "2층", sector: "2-16", seatCount: 28 },
  { parish: "수정마을", district: "양산지구", floor: "2층", sector: "2-16", seatCount: 25 },

  // 2-17 (양산지구)
  { parish: "덕계", district: "양산지구", floor: "2층", sector: "2-17", seatCount: 22 },
  { parish: "만덕", district: "양산지구", floor: "2층", sector: "2-17", seatCount: 30 },
  { parish: "양산", district: "양산지구", floor: "2층", sector: "2-17", seatCount: 51 },
  { parish: "웅상", district: "양산지구", floor: "2층", sector: "2-17", seatCount: 30 },

  // 2-18 (양산지구)
  { parish: "금곡", district: "양산지구", floor: "2층", sector: "2-18", seatCount: 18 },
  { parish: "남양산", district: "양산지구", floor: "2층", sector: "2-18", seatCount: 80 },
  { parish: "북양산", district: "양산지구", floor: "2층", sector: "2-18", seatCount: 8 },
  { parish: "화명", district: "양산지구", floor: "2층", sector: "2-18", seatCount: 50 },

  // 2-19 (중앙지구)
  { parish: "범일", district: "중앙지구", floor: "2층", sector: "2-19", seatCount: 41 },
  { parish: "봉래", district: "중앙지구", floor: "2층", sector: "2-19", seatCount: 54 },
  { parish: "중앙", district: "중앙지구", floor: "2층", sector: "2-19", seatCount: 49 },
  { parish: "청학", district: "중앙지구", floor: "2층", sector: "2-19", seatCount: 14 },

  // 2-20 (중앙지구)
  { parish: "구봉", district: "중앙지구", floor: "2층", sector: "2-20", seatCount: 20 },
  { parish: "수정", district: "중앙지구", floor: "2층", sector: "2-20", seatCount: 12 },
  { parish: "태종대", district: "중앙지구", floor: "2층", sector: "2-20", seatCount: 18 },
];

export function findSeatByParish(parishName: string): ParishSeatInfo | undefined {
  if (!parishName) return undefined;
  const cleanName = parishName.replace(/성당$/, "").trim();
  return PARISH_SEATING_DATA.find((item) =>
    item.parish === cleanName || cleanName.includes(item.parish) || item.parish.includes(cleanName)
  );
}
