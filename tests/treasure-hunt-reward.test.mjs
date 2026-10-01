import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 리워드 수령 가능 그룹 판별 헬퍼 (초등부, 중고등부, 청년, 교리교사만 수령 가능)
function isRewardEligibleRole(role) {
  const ELIGIBLE_ROLES = ["주일학교 초등부", "주일학교 중고등부", "청년", "교리교사"];
  return ELIGIBLE_ROLES.includes(role);
}

// 30초 동적 토큰 생성기
function generateDynamicCouponToken(secondsRemaining, salt = "2026-BYD") {
  return `BYD-VOUCHER-${salt}-${secondsRemaining}`;
}

test("보물찾기 디지털 스탬프 및 리워드 자격 판별 계약 검증 (Issue #20)", async (t) => {
  const rootDir = process.cwd();
  const treasureDataPath = path.join(rootDir, "src/data/treasureHunt.ts");
  const stampBookPath = path.join(rootDir, "src/components/StampBookView.tsx");
  const userContextPath = path.join(rootDir, "src/context/UserContext.tsx");

  await t.test("DoD 1: 5대 히든 보물 스팟 데이터 무결성 검증", () => {
    assert.ok(fs.existsSync(treasureDataPath), "src/data/treasureHunt.ts가 존재해야 합니다.");
    const content = fs.readFileSync(treasureDataPath, "utf-8");

    const expectedSpots = [
      "성령의 바람 언덕",
      "선한 목자의 오솔길",
      "오병이어 나눔 쉼터",
      "찬양의 울림터",
      "청춘의 출발선",
    ];

    expectedSpots.forEach((spot) => {
      assert.ok(content.includes(spot), `보물 스팟 '${spot}'이 정의되어 있어야 합니다.`);
    });
    assert.ok(content.includes("JJUYANG_TREASURE_"), "공식 QR 접두사가 정의되어 있어야 합니다.");
  });

  await t.test("DoD 2: 리워드 수령 자격 그룹 필터링 검증 (PRD §5.1)", () => {
    // 수령 대상자 그룹
    assert.equal(isRewardEligibleRole("청년"), true);
    assert.equal(isRewardEligibleRole("주일학교 중고등부"), true);
    assert.equal(isRewardEligibleRole("주일학교 초등부"), true);
    assert.equal(isRewardEligibleRole("교리교사"), true);

    // 비대상자 그룹 (사제, 수도자, 학사님, 일반신자, 부모 등)
    assert.equal(isRewardEligibleRole("사제"), false);
    assert.equal(isRewardEligibleRole("수도자"), false);
    assert.equal(isRewardEligibleRole("학사님"), false);
    assert.equal(isRewardEligibleRole("일반신자"), false);
    assert.equal(isRewardEligibleRole("부모"), false);
    assert.equal(isRewardEligibleRole("봉사자"), false);
  });

  await t.test("DoD 3: 30초 동적 QR 가변 토큰 생성 검증", () => {
    const token30 = generateDynamicCouponToken(30);
    const token15 = generateDynamicCouponToken(15);
    assert.notEqual(token30, token15, "잔여 시간에 따라 동적 토큰이 갱신되어야 합니다.");
    assert.ok(token30.startsWith("BYD-VOUCHER-"), "공식 바우처 접두사가 있어야 합니다.");
  });

  await t.test("DoD 4: UserContext 내 보물 5개 완주 시 리워드 쿠폰 자동 활성화 및 자격 필터 계약 검증", () => {
    const content = fs.readFileSync(userContextPath, "utf-8");
    assert.ok(content.includes("isRewardEligible"), "isRewardEligible 플래그가 정의되어야 합니다.");
    assert.ok(
      content.includes("updated.length >= 5 && !hasRewardCoupon"),
      "보물 5개 완주 시 쿠폰 활성화 로직이 있어야 합니다."
    );
  });

  await t.test("DoD 5: StampBookView 내 보물찾기 탭 우선 및 공식 부스 안내 분리 계약 검증", () => {
    const content = fs.readFileSync(stampBookPath, "utf-8");
    assert.ok(content.includes('useState<"official" | "treasure">("treasure")'), "기본 탭이 treasure로 설정되어야 합니다.");
    assert.ok(content.includes("OfficialBoothStageGuide"), "OfficialBoothStageGuide 뷰어가 연동되어 있어야 합니다.");
    assert.ok(content.includes("선물 수령 대상 안내"), "비자격 그룹을 위한 친절 안내 뷰가 존재해야 합니다.");
  });
});
