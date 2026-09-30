export interface PatronSaint {
  id: string;
  name: string;
  title: string;
  feastDay: string;
  image: string;
  description: string;
  prayer: string;
  symbol: string;
  symbolDescription: string;
}

export const PATRON_SAINTS_DATA: PatronSaint[] = [
  {
    id: "john-paul-ii",
    name: "성 요한 바오로 2세",
    title: "교황 · 세계청년대회 창설자",
    feastDay: "10월 22일",
    image: "/assets/saints/wyd2027_patron_saint_john_paul_ii.webp",
    description:
      "1920년 폴란드 출생. 제2차 세계대전의 비극 속에서 사제품을 받고 제264대 교황으로 선출되었다. 1984년 세계청년대회(WYD)를 창설하여 전 세계 젊은이들을 신앙 안으로 초대하였으며, 129개국을 사목 방문하며 현대 교회의 쇄신과 복음화에 평생을 바쳤다. 2014년 시성되었다.",
    prayer:
      "자비로우신 하느님, 젊은이들 안에서 희망을 발견하고 그들을 교회로 불러 모은 성 요한 바오로 2세 교황의 전구를 들으시어, 저희도 복음의 기쁨을 온 세상에 전하며 생명의 문화가 자라는 세상을 함께 이루어 가게 하소서. 아멘.",
    symbol: "주교 지팡이 (Crozier)",
    symbolDescription:
      "성령께서 맡기신 양떼를 보호하고 인도하는 '선한 목자'의 직무를 상징하며, 독특한 십자가 형태의 지팡이로 목자의 영성과 사명을 드러낸다.",
  },
  {
    id: "andrew-kim-taegon",
    name: "성 김대건 안드레아",
    title: "사제와 동료 순교자들 · 한국 최초의 사제",
    feastDay: "7월 5일 (대축일 9월 20일)",
    image: "/assets/saints/wyd2027_patron_saint_andrew_kim_taegon.webp",
    description:
      "한국인 최초의 천주교 사제. 1821년 출생하여 마카오 유학 후 1845년 상하이에서 서품받고 입국로 개척에 힘쓰다 1846년 새남터에서 25세의 젊은 나이로 순교하였다. 옥중 서한을 통해 조선 교우들을 끝까지 격려하며 한국 교회의 반석을 놓았으며 1984년 시성되었다.",
    prayer:
      "진리의 근원이신 하느님, 성 김대건 안드레아 사제가 당신 사랑에 응답하여 순교로 당신의 영광을 드러내게 하셨으니, 저희도 '용기를 내어라' 하신 당신의 말씀을 따라 모든 두려움을 이겨내고 뜨거운 사랑으로 그리스도를 담대히 증거하게 하소서. 아멘.",
    symbol: "적색 영대 (Red Stole)",
    symbolDescription:
      "한국인 첫 사제 성 김대건 신부의 순교와 굳은 믿음, 그리고 그리스도를 담대히 증거한 목자의 열정을 상징한다.",
  },
  {
    id: "francesca-cabrini",
    name: "성 프란체스카 사베리아 카브리니",
    title: "수녀 · 이민자들의 수호성인",
    feastDay: "12월 22일 (전례 11월 13일)",
    image: "/assets/saints/wyd2027_patron_saint_francesca_cabrini.webp",
    description:
      "1850년 이탈리아 출생. 예수 성심 선교 수녀회를 설립하고 교황 레오 13세의 명에 따라 미국으로 건너가 소외된 이탈리아 이민자들을 위해 헌신했다. 대서양을 30차례 건너며 67개의 고아원, 병원, 학교를 설립하여 환대의 모범을 보여주었다. 1946년 미국 시민권자 최초로 시성되었다.",
    prayer:
      "모든 이의 하느님, 이민자들의 어머니가 되어 세상에 환대의 모범을 보여준 성 프란체스카 사베리아 카브리니를 기억하며 청하오니, 저희도 낯선 이들 안에서 당신을 알아 뵙고 편견과 차별의 장벽을 허물어 사람과 사람을 잇는 다리를 건설하게 하소서. 아멘.",
    symbol: "증기선 (Steamship)",
    symbolDescription:
      "이웃을 돌보기 위해 대서양을 30차례 횡단한 선교 열정과, 하느님의 부르심에 온전히 자신을 내맡긴 굳은 신뢰를 상징한다.",
  },
  {
    id: "josephine-bakhita",
    name: "성 요세피나 바키타",
    title: "수녀 · 희망의 증인",
    feastDay: "2월 8일 (세계 인신매매 반대 기도의 날)",
    image: "/assets/saints/wyd2027_patron_saint_josephine_bakhita.webp",
    description:
      "1869년 수단 출생. 어린 시절 노예로 납치되어 극심한 고초를 겪었으나 이탈리아에서 가톨릭 신앙을 접하고 참된 해방과 존엄을 얻었다. 카노사 애덕의 딸 수녀회에 입회하여 평생 겸손과 용서, 사랑을 실천하며 '아프리카의 꽃'으로 공경받고 있다. 2000년 시성되었다.",
    prayer:
      "희망의 근원이신 하느님, 노예살이의 고통 속에서도 당신의 사랑을 깨닫고 희망을 증거한 성 요세피나 바키타를 기억하며 비오니, 저희가 서로의 존엄과 자유를 지키며 미움과 폭력의 사슬을 끊어내어 세상에 희망의 빛을 전하게 하소서. 아멘.",
    symbol: "끊어진 쇠사슬 (Broken Chains)",
    symbolDescription:
      "노예의 굴레에서 해방되었음을 상징함과 동시에 하느님의 사랑으로 미움과 폭력의 악순환을 끊어낸 신앙인의 용기와 희망을 뜻한다.",
  },
  {
    id: "carlo-acutis",
    name: "성 카를로 아쿠티스",
    title: "평신도 · 하느님의 인플루언서 · 인터넷의 주보",
    feastDay: "10월 12일",
    image: "/assets/saints/wyd2027_patron_saint_carlo_acutis.webp",
    description:
      "1991년 영국 런던 출생, 이탈리아 밀라노 성장. '성체는 하늘나라로 가는 나의 고속도로'라고 고백하며 매일 미사와 성체조배를 바쳤다. 탁월한 컴퓨터 실력으로 전 세계 '성체 기적 웹사이트'를 제작해 복음을 전파했으며, 2006년 급성 백혈병으로 15세에 선종하였다. 2025년 시성되었다.",
    prayer:
      "성체 안에서 저희를 부르시는 하느님, 성 카를로 아쿠티스의 삶을 통하여 하느님 사랑의 헤아릴 수 없는 풍요로움을 드러내셨으니, 저희도 언제나 하느님과 이웃을 사랑하며 새로운 도구들을 올바로 사용하여 세상 안에서 기쁘게 복음을 전하게 하소서. 아멘.",
    symbol: "컴퓨터 (Computer)",
    symbolDescription:
      "디지털 시대를 살아가는 젊은이들에게 주어진 달란트를 복음화와 성체 공경에 봉헌하는 '디지털 선교사'로서의 사명을 상징한다.",
  },
];
