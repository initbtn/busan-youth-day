import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("하단 탭바 5대 메뉴 재구성, 소통피드 표기 정정 및 프로필 소속 변경 검증 (Issue #64)", () => {
  test("DoD 1: 소통피드 및 작성 모달에서 올바른 본당·역할·모둠 표기 노출 검증", async () => {
    const feedViewPath = path.resolve("src/components/CommunityFeedView.tsx");
    assert.ok(fs.existsSync(feedViewPath), "CommunityFeedView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // '{post.parish} 모둠' 오기 및 '부산 청년의날 BYD' 불필요 접두어 제거 여부 확인
    assert.ok(
      !content.includes("부산 청년의날 BYD {post.parish} 모둠"),
      "피드 목록에서 불필요한 접두어 및 '모둠' 오기가 제거되어야 합니다."
    );
    assert.ok(
      !content.includes("부산 청년의날 BYD {user?.parish || \"부산\"} 모둠"),
      "작성 모달에서 불필요한 접두어 및 '모둠' 오기가 제거되어야 합니다."
    );

    // 정규화된 라벨 표기 확인
    assert.match(
      content,
      /post\.parish \? `\$\{post\.parish\}성당` : "부산교구"/,
      "피드 목록에 올바른 {parish}성당 표기가 포함되어야 합니다."
    );
    assert.match(
      content,
      /actionParam === "write"/,
      "URL 쿼리 파라미터 action=write 수신 시 작성 모달 자동 열기가 지원되어야 합니다."
    );
  });

  test("DoD 2: 마이프로필에서 지구, 본당, 역할, 5대 수호성인 모둠 선택 및 변경 저장 검증", async () => {
    const profileViewPath = path.resolve("src/components/MyProfileView.tsx");
    assert.ok(fs.existsSync(profileViewPath), "MyProfileView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(profileViewPath, "utf-8");

    assert.match(content, /selectedDistrict/, "지구 선택 상태(selectedDistrict)가 있어야 합니다.");
    assert.match(content, /selectedParish/, "본당 선택 상태(selectedParish)가 있어야 합니다.");
    assert.match(content, /selectedRole/, "역할 선택 상태(selectedRole)가 있어야 합니다.");
    assert.match(content, /selectedSaintId/, "5대 수호성인 모둠 선택 상태(selectedSaintId)가 있어야 합니다.");
    assert.match(content, /DISTRICT_PARISH_MAP/, "지구 및 본당 매핑 데이터가 연결되어야 합니다.");
    assert.match(content, /PILGRIM_SAINTS/, "2027 WYD 5대 수호성인 목록이 연결되어야 합니다.");
    assert.match(content, /AFFILIATION_ROLES/, "소속 역할 옵션이 연결되어야 합니다.");
    assert.match(content, /handleSaveProfile/, "프로필 저장 핸들러가 구성되어 있어야 합니다.");
  });

  test("DoD 3: 모둠원 샘플 목 데이터 제거 및 빈 상태 안내 렌더링 검증", async () => {
    const { YOUTH_GROUP_MEMBERS, getYouthGroupMembers } = await import("../src/data/youthGroupMembers.ts");
    assert.equal(YOUTH_GROUP_MEMBERS.length, 0, "샘플 목 데이터는 완전히 제거되어 빈 배열이어야 합니다.");
    assert.equal(getYouthGroupMembers("andrew-kim-taegon").length, 0);

    const profileViewPath = path.resolve("src/components/MyProfileView.tsx");
    const content = fs.readFileSync(profileViewPath, "utf-8");
    assert.match(
      content,
      /등록된 모둠원이 아직 없습니다/,
      "모둠원이 없을 때 빈 상태 안내 메시지가 렌더링되어야 합니다."
    );
  });

  test("DoD 4: 상단 헤더 배너에서 '현장지도', '좌석배치' 버튼 제거 검증", async () => {
    const layoutPath = path.resolve("src/app/(tabs)/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    // 상단 오렌지 배너 내 중복 링크 제거 여부
    assert.ok(
      !content.includes("현장지도</span>"),
      "상단 주황색 공지 배너에서 '현장지도' 버튼 링크가 제거되어야 합니다."
    );
    assert.ok(
      !content.includes("좌석배치\n          </Link>"),
      "상단 주황색 공지 배너에서 '좌석배치' 버튼 링크가 제거되어야 합니다."
    );
  });

  test("DoD 5: 하단 탭바 5대 메뉴(메인, 지도, 새글작성, 이모저모, 미사안내) 재편 및 스탬프 탭 제거 검증", async () => {
    const layoutPath = path.resolve("src/app/(tabs)/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(!content.includes("<span>스탬프</span>"), "하단 탭바에서 '스탬프' 메뉴가 제거되어야 합니다.");
    assert.match(content, /<span>메인<\/span>/, "메인 탭이 포함되어야 합니다.");
    assert.match(content, /<span>지도<\/span>/, "지도 탭이 포함되어야 합니다.");
    assert.match(content, /<span>새글작성<\/span>/, "새글작성 탭이 포함되어야 합니다.");
    assert.match(content, /<span>이모저모<\/span>/, "이모저모(소통피드) 탭이 포함되어야 합니다.");
    assert.match(content, /<span>미사안내<\/span>/, "미사안내(좌석배치) 탭이 포함되어야 합니다.");
    assert.match(content, /href="\/feed\?action=write"/, "새글작성은 /feed?action=write 경로로 연결되어야 합니다.");
  });

  test("DoD 6: 메인 홈 화면 쭈양이 카드 문구 정제 및 내비게이션 연결 검증", async () => {
    const homeViewPath = path.resolve("src/components/HomeTimelineView.tsx");
    const content = fs.readFileSync(homeViewPath, "utf-8");

    assert.ok(
      !content.includes("스탬프 북 ➔"),
      "홈 화면 마스코트 카드에서 스탬프 북 버튼이 제거되어야 합니다."
    );
    assert.match(content, /이모저모 ➔/, "이모저모 바로가기 버튼이 탑재되어야 합니다.");
  });
});
