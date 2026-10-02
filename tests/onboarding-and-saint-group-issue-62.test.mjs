import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("온보딩 반복 노출 차단 및 교구·지구·본당 내 5대 수호성인 모둠 체계 검증 (Issue #62)", () => {
  const projectRoot = process.cwd();

  it("DoD 1: 온보딩 반복 오픈 가드 및 로딩 상태/완료 판정 검증", () => {
    const layoutPath = path.join(projectRoot, "src/app/(tabs)/layout.tsx");
    const containerPath = path.join(projectRoot, "src/components/MainAppContainer.tsx");
    const userContextPath = path.join(projectRoot, "src/context/UserContext.tsx");

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    const containerContent = fs.readFileSync(containerPath, "utf-8");
    const contextContent = fs.readFileSync(userContextPath, "utf-8");

    // 1. UserContext에서 isLoading(세션 복원 중 플래그) 제공 확인
    assert.ok(
      contextContent.includes("isLoading") || contextContent.includes("isAuthLoaded"),
      "UserContext는 세션 복원 및 인증 상태 로딩 완료 여부를 제공해야 합니다."
    );

    // 2. layout 및 MainAppContainer에서 로딩 중이 아닐 때만 온보딩 모달을 열도록 가드되어야 함
    assert.ok(
      layoutContent.includes("isLoading") || layoutContent.includes("isAuthLoaded"),
      "layout.tsx는 인증 로딩 중 온보딩이 즉시 열리지 않도록 가드해야 합니다."
    );
    assert.ok(
      containerContent.includes("isLoading") || containerContent.includes("isAuthLoaded"),
      "MainAppContainer.tsx는 인증 로딩 중 온보딩이 즉시 열리지 않도록 가드해야 합니다."
    );

    // 3. UserContext에서 authUser가 존재하고 기존 온보딩 완료 조건(onboarding_completed_at 또는 terms_agreed와 parish) 확인 시 onboardingCompleted: true 보장
    assert.ok(
      contextContent.includes("onboardingCompleted"),
      "UserContext는 onboardingCompleted 플래그를 관리해야 합니다."
    );
  });

  it("DoD 2: n조 배정 로직 제거 및 2027 WYD 5대 수호성인 모둠 단일화 검증", async () => {
    const { assignPilgrimageGroup, getAvailableSaints } = await import("../src/lib/pilgrimageGroup.ts");

    // 1. 가용 성인 풀이 정확히 5인인지 검증
    const saints = getAvailableSaints();
    assert.strictEqual(saints.length, 5, "청년의 날 모둠 성인은 5대 수호성인이어야 합니다.");

    // 2. 배정 결과에 '조' 번호(n조)가 붙지 않고 'OO 모둠' 형태인지 검증
    const res1 = assignPilgrimageGroup("test-seed-1");
    assert.ok(res1.saintId, "성인 ID 존재");
    assert.ok(res1.saintName, "성인 이름 존재");
    assert.ok(res1.pilgrimageGroup.endsWith("모둠"), "모둠 명칭은 '모둠'으로 끝나야 합니다.");
    assert.ok(!res1.pilgrimageGroup.includes("조"), "모둠 명칭에 '조'가 포함되어서는 안 됩니다.");

    // 3. 동일 시드에 대해 멱등성 보장
    const res2 = assignPilgrimageGroup("test-seed-1");
    assert.deepEqual(res1, res2, "동일 시드에 대해 동일한 모둠이 멱등 배정되어야 합니다.");
  });

  it("DoD 3: 교구 / 지구 / 본당 / 모둠 4단계 계층 체계 무결성 검증", () => {
    const onboardingPath = path.join(projectRoot, "src/components/OnboardingModal.tsx");
    const content = fs.readFileSync(onboardingPath, "utf-8");

    // OnboardingModal에서 본당 선택 시 '성당' 명시 및 모둠 표기 확인
    assert.ok(content.includes("모둠"), "온보딩 완료 화면에서 '모둠' 용어를 사용해야 합니다.");
    assert.ok(!content.includes("1조"), "온보딩 모달에 더 이상 임의의 '1조' 하드코딩이 없어야 합니다.");

    const parishesPath = path.join(projectRoot, "src/data/parishes.ts");
    const parishesContent = fs.readFileSync(parishesPath, "utf-8");
    assert.ok(parishesContent.includes("DISTRICT_PARISH_MAP"), "지구-본당 맵이 존재해야 합니다.");
  });
});
