export interface PilgrimSaint {
  id: string;
  name: string;
  groupName: string;
  title: string;
  feastDay: string;
  patronage?: string;
  motto?: string;
}

export const PILGRIM_SAINTS: PilgrimSaint[] = [
  {
    id: "andrew-kim-taegon",
    name: "성 김대건 안드레아",
    groupName: "김대건 안드레아 그룹",
    title: "한국 최초의 사제이자 순교자",
    feastDay: "7월 5일 (대축일 9월 20일)",
    patronage: "한국 성직자들의 주보",
    motto: "부디 서로 사랑하고 화목하여 천국에서 영원히 만나자",
  },
  {
    id: "paul-chong-hasang",
    name: "성 정하상 바오로",
    groupName: "정하상 바오로 그룹",
    title: "평신도 지도자이자 순교자",
    feastDay: "9월 20일",
    patronage: "평신도 사도직의 주보",
    motto: "주님을 증언하기 위해 목숨까지 바친 불꽃 같은 신앙",
  },
  {
    id: "john-paul-ii",
    name: "성 요한 바오로 2세",
    groupName: "요한 바오로 2세 그룹",
    title: "교황 · 세계청년대회(WYD) 창설자",
    feastDay: "10월 22일",
    patronage: "세계 가톨릭 젊은이들의 주보",
    motto: "두려워하지 마십시오! 그리스도께 문을 활짝 여십시오!",
  },
  {
    id: "carlo-acutis",
    name: "성 카를로 아쿠티스",
    groupName: "카를로 아쿠티스 그룹",
    title: "평신도 · 디지털 인터넷의 주보",
    feastDay: "10월 12일",
    patronage: "청소년 및 컴퓨터 프로그래머의 주보",
    motto: "성체는 하늘나라로 향하는 나의 고속도로입니다",
  },
  {
    id: "francesca-cabrini",
    name: "성 프란체스카 카브리니",
    groupName: "프란체스카 카브리니 그룹",
    title: "수녀 · 이민자들의 어머니",
    feastDay: "11월 13일",
    patronage: "이민자와 난민들의 주보",
    motto: "모든 사람에게 그리스도의 사랑과 따뜻한 환대를",
  },
  {
    id: "josephine-bakhita",
    name: "성 요세피나 바키타",
    groupName: "요세피나 바키타 그룹",
    title: "수녀 · 용서와 희망의 증인",
    feastDay: "2월 8일",
    patronage: "인신매매 피해자 및 억압받는 이들의 주보",
    motto: "온전히 주님께 내어맡길 때 우리는 참된 자유를 얻습니다",
  },
  {
    id: "francis-assisi",
    name: "성 프란치스코 (아시시)",
    groupName: "아시시 프란치스코 그룹",
    title: "작은 형제회 창설자 · 평화의 사도",
    feastDay: "10월 4일",
    patronage: "생태계와 환경, 평화의 주보",
    motto: "주여 나를 평화의 도구로 써 주소서",
  },
  {
    id: "therese-lisieux",
    name: "성녀 소화 데레사 (리지외)",
    groupName: "리지외 소화 데레사 그룹",
    title: "선교의 주보성인 · 교회 학자",
    feastDay: "10월 1일",
    patronage: "선교사와 비행사의 주보",
    motto: "나의 소명은 사랑입니다. 사랑의 작은 꽃이 되겠습니다",
  },
  {
    id: "teresa-calcutta",
    name: "성녀 마더 데레사 (콜카타)",
    groupName: "콜카타 마더 데레사 그룹",
    title: "사랑의 선교 수녀회 창설자",
    feastDay: "9월 5일",
    patronage: "가장 가난하고 소외된 이들의 주보",
    motto: "위대한 일은 작은 일들을 지극한 사랑으로 행하는 것입니다",
  },
  {
    id: "ignatius-loyola",
    name: "성 이냐시오 데 로욜라",
    groupName: "이냐시오 데 로욜라 그룹",
    title: "예수회 창설자 · 영신수련",
    feastDay: "7월 31일",
    patronage: "영신수련 피정의 주보",
    motto: "하느님의 더 큰 영광을 위하여 (AMDG)",
  },
  {
    id: "benedict-nursia",
    name: "성 베네딕토",
    groupName: "누르시아 베네딕토 그룹",
    title: "서방 수도회의 아버지",
    feastDay: "7월 11일",
    patronage: "유럽과 수도자들의 주보",
    motto: "기도하고 일하라 (Ora et Labora)",
  },
  {
    id: "cecilia-rome",
    name: "성녀 체칠리아",
    groupName: "로마 체칠리아 그룹",
    title: "동정 순교자",
    feastDay: "11월 22일",
    patronage: "교회 음악가와 성가대의 주보",
    motto: "내 영혼이 주님께 찬미 노래를 바치나이다",
  },
  {
    id: "joan-arc",
    name: "성녀 잔 다르크",
    groupName: "오를레앙 잔 다르크 그룹",
    title: "동정 순교자 · 신념의 용사",
    feastDay: "5월 30일",
    patronage: "군인과 청년 신념의 주보",
    motto: "나는 두렵지 않습니다. 하느님께서 나와 함께 계시기 때문입니다",
  },
  {
    id: "stephen-martyr",
    name: "성 스테파노",
    groupName: "첫 순교자 스테파노 그룹",
    title: "교회 최초의 부제이자 순교자",
    feastDay: "12월 26일",
    patronage: "부제들과 봉사자들의 주보",
    motto: "주 예수님, 제 영을 받아 주소서",
  },
];

/**
 * 온보딩 완료 시 순례 그룹으로 배정할 성인을 무작위로 추첨합니다.
 */
export function getRandomPilgrimSaint(): PilgrimSaint {
  const index = Math.floor(Math.random() * PILGRIM_SAINTS.length);
  return PILGRIM_SAINTS[index];
}

/**
 * 성인 ID로 성인 정보를 조회합니다.
 */
export function getPilgrimSaintById(id: string): PilgrimSaint | undefined {
  return PILGRIM_SAINTS.find((s) => s.id === id);
}
