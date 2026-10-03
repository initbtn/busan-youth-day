import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

describe("인증 필수화, WYD 5인 성인 배정, 율동영상 및 명칭 정제 계약 검증 (Issue #56)", () => {
  it("DoD 1: OnboardingModal 직접 이름 입력 우회 제거 및 카카오 로그인 필수화 계약 검증", () => {
    const onboardingPath = path.join(projectRoot, "src/components/OnboardingModal.tsx");
    const content = fs.readFileSync(onboardingPath, "utf-8");

    // "또는 직접 이름 입력" 텍스트 제거 확인
    assert.ok(
      !content.includes("또는 직접 이름 입력"),
      "직접 이름 입력 우회 텍스트가 제거되어야 함"
    );
    // bypass 버튼(다음: 약관 동의로 이름만 치고 넘어가는 버튼) 제거 확인
    assert.ok(
      !content.includes("다음: 약관 동의"),
      "비로그인 상태에서 이름만 넣고 약관 동의로 넘어가는 우회 버튼이 제거되어야 함"
    );
    // 카카오 로그인 버튼이 유효한 진입점이어야 함
    assert.ok(
      content.includes("signInWithKakao"),
      "카카오 로그인 실행 핸들러가 탑재되어 있어야 함"
    );
  });

  it("DoD 2: 소통피드·부스리뷰·스탬프 비로그인 시 인증 게이트(로그인 모달/차단) 검증", () => {
    const feedPath = path.join(projectRoot, "src/components/CommunityFeedView.tsx");
    const feedContent = fs.readFileSync(feedPath, "utf-8");
    assert.ok(
      feedContent.includes("로그인") && (feedContent.includes("isKakaoSignedIn") || feedContent.includes("user?.email") || feedContent.includes("setShowLoginPrompt") || feedContent.includes("setShowAuthModal")),
      "CommunityFeedView에 비로그인 작성 제한 및 로그인 유도 처리가 있어야 함"
    );

    const boothDetailPath = path.join(projectRoot, "src/app/(tabs)/booth/[id]/page.tsx");
    const boothDetailContent = fs.readFileSync(boothDetailPath, "utf-8");
    assert.ok(
      boothDetailContent.includes("로그인") && (boothDetailContent.includes("카카오") || boothDetailContent.includes("login")),
      "부스 상세 페이지에 비로그인 리뷰 작성 제한 및 로그인 안내 처리가 있어야 함"
    );

    const stampPath = path.join(projectRoot, "src/components/StampBookView.tsx");
    const stampContent = fs.readFileSync(stampPath, "utf-8");
    assert.ok(
      stampContent.includes("로그인") && (stampContent.includes("카카오") || stampContent.includes("isLoggedIn") || stampContent.includes("user")),
      "StampBookView에 비로그인 스탬프/보물찾기 제한 및 로그인 안내 처리가 있어야 함"
    );

    const treasurePath = path.join(projectRoot, "src/components/TreasureHuntView.tsx");
    const treasureContent = fs.readFileSync(treasurePath, "utf-8");
    assert.ok(
      treasureContent.includes("isKakaoSignedIn") && treasureContent.includes("보물찾기 참여는 카카오 로그인이 필요합니다"),
      "TreasureHuntView에 비로그인 보물찾기 제한 및 카카오 로그인 안내가 있어야 함"
    );
  });

  it("DoD 3: 2027 서울 WYD 5인 수호성인 풀 및 순례 그룹 배정 범위 검증", () => {
    const saintsPath = path.join(projectRoot, "src/data/saints.ts");
    const saintsContent = fs.readFileSync(saintsPath, "utf-8");

    // 5인 WYD 성인 포함 확인
    assert.ok(saintsContent.includes("andrew-kim-taegon"), "성 김대건 안드레아 포함");
    assert.ok(saintsContent.includes("john-paul-ii"), "성 요한 바오로 2세 포함");
    assert.ok(saintsContent.includes("carlo-acutis"), "성 카를로 아쿠티스 포함");
    assert.ok(saintsContent.includes("francesca-cabrini"), "성 프란체스카 카브리니 포함");
    assert.ok(saintsContent.includes("josephine-bakhita"), "성 요세피나 바키타 포함");

    // PILGRIM_SAINTS 배열에 정확히 5인만 배정되어 있는지 검증
    const pilgrimMatch = saintsContent.match(/export const PILGRIM_SAINTS:\s*(?:readonly\s+)?(?:Saint|PilgrimSaint)\[\]\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(pilgrimMatch, "PILGRIM_SAINTS 배열 정의가 존재해야 함");
    const saintIds = [...pilgrimMatch[1].matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);
    assert.strictEqual(saintIds.length, 5, "PILGRIM_SAINTS는 정확히 5인 수호성인이어야 함");

    // 배정 엔진 파일 검사
    const groupPath = path.join(projectRoot, "src/lib/pilgrimageGroup.ts");
    const groupContent = fs.readFileSync(groupPath, "utf-8");
    assert.ok(groupContent.includes("assignPilgrimageGroup"), "순례 그룹 배정 함수 존재");
  });

  it("DoD 4: /song 악보 경로 정상화 및 율동영상 탭 YouTube iframe 임베드 검증", () => {
    const songPath = path.join(projectRoot, "src/app/(tabs)/song/page.tsx");
    const content = fs.readFileSync(songPath, "utf-8");

    // 깨지던 경로 미포함 확인
    assert.ok(
      !content.includes("/assets/spiritual/theme_song_sheet_gods_kingdom.png"),
      "깨지던 404 악보 경로가 제거되어야 함"
    );
    // 정상 악보 경로 포함 확인
    assert.ok(
      content.includes("/assets/theme_song_sheet_music.webp"),
      "정상 악보 이미지(/assets/theme_song_sheet_music.webp)가 연결되어야 함"
    );
    // 율동영상 탭 명칭 확인
    assert.ok(content.includes("율동영상"), "율동영상 탭 버튼이 존재해야 함");
    // YouTube iframe 미디어 소스 확인
    assert.ok(
      content.includes("https://www.youtube.com/embed/Jvcya-Qw77s"),
      "지정된 YouTube 율동영상 iframe 임베드 주소가 포함되어야 함"
    );
  });

  it("DoD 5: 타이틀 명칭 변경 및 '공식 마스코트 쭈양이' 외 '공식' 텍스트 정제 검증", () => {
    const mainContainerPath = path.join(projectRoot, "src/components/MainAppContainer.tsx");
    const mainContent = fs.readFileSync(mainContainerPath, "utf-8");

    const tabsLayoutPath = path.join(projectRoot, "src/app/(tabs)/layout.tsx");
    const layoutContent = fs.readFileSync(tabsLayoutPath, "utf-8");

    // 타이틀 변경 확인
    assert.ok(
      mainContent.includes("부산교구 청년의날 디지털 순례 가이드"),
      "MainAppContainer 헤더에 '부산교구 청년의날 디지털 순례 가이드'가 반영되어야 함"
    );
    assert.ok(
      layoutContent.includes("부산교구 청년의날 디지털 순례 가이드"),
      "Tabs layout 헤더에 '부산교구 청년의날 디지털 순례 가이드'가 반영되어야 함"
    );
    assert.ok(
      !mainContent.includes("스포원파크 디지털 순례 가이드"),
      "구 '스포원파크 디지털 순례 가이드' 문구가 제거되어야 함"
    );

    // 공식 마스코트 또는 공식 캐릭터 쭈양이 확인
    assert.ok(
      mainContent.includes("공식 캐릭터 쭈양이") || mainContent.includes("공식 마스코트 쭈양이"),
      "'공식 캐릭터 쭈양이' 또는 '공식 마스코트 쭈양이'가 포함되어야 함"
    );

    // 불필요한 '공식' 뱃지 제거 확인 (예: 헤더의 <span ...>공식</span>)
    assert.ok(
      !mainContent.includes('<span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">공식</span>'),
      "헤더의 공식 뱃지가 제거되어야 함"
    );
  });
});
