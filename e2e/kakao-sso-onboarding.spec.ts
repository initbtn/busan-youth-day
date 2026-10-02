import { test, expect } from "@playwright/test";

test.describe("카카오 SSO 간편 인증 및 온보딩 순례 공동체 배정 E2E (Issue #18)", () => {
  test.beforeEach(async ({ page }) => {
    // 로컬 스토리지 초기화로 온보딩 모달이 자연스럽게 열리도록 준비
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");
  });

  test("DoD 1: 온보딩 모달 진입 시 카카오 SSO 로그인 버튼 및 직접 입력 진행 버튼 노출", async ({
    page,
  }) => {
    // 1. 온보딩 모달 헤더 확인
    const onboardingHeader = page.locator("text=순례 등록");
    await expect(onboardingHeader).toBeVisible({ timeout: 5000 });

    // 2. 카카오 로그인 버튼 노출 확인
    const kakaoButton = page.locator("button:has-text('카카오로 3초 만에 시작하기')");
    await expect(kakaoButton).toBeVisible();

    // 3. 직접 입력 모드 / 다음 단계 버튼 노출 확인
    const nextStepButton = page.locator("button:has-text('다음: 약관 동의')");
    await expect(nextStepButton).toBeVisible();
  });

  test("DoD 2: 약관 동의 체크박스 제어 및 11종 역할/본당 선택 단계 진행", async ({
    page,
  }) => {
    // 1. Step 1 -> Step 2(약관 동의) 진입
    const nextStepButton = page.locator("button:has-text('다음: 약관 동의')");
    await nextStepButton.click();

    // 2. 약관 동의 단계(Step 2) 헤더 확인
    await expect(page.locator("h2:has-text('약관에 동의해 주세요')")).toBeVisible();

    // 3. 개인정보 및 캐릭터 자산 필수 약관 확인
    await expect(page.locator("text=[필수] 개인정보 수집 및 이용 동의")).toBeVisible();
    await expect(page.locator("text=[필수] 쭈양이 자산 사용 가이드 동의")).toBeVisible();

    // 4. 다음 단계 버튼 클릭
    const toAffiliationBtn = page.locator("button:has-text('소속 선택으로 이동')");
    await expect(toAffiliationBtn).toBeEnabled();
    await toAffiliationBtn.click();

    // 5. 소속 및 역할 선택(Step 3) 헤더 및 필드 확인
    await expect(page.locator("h2:has-text('소속과 역할을 선택해 주세요')")).toBeVisible();
    await expect(page.locator("text=지구 선택")).toBeVisible();
    await expect(page.locator("text=본당 선택")).toBeVisible();
    await expect(page.locator("text=소속 그룹 (11종)")).toBeVisible();

    // 6. 11종 소속 역할 칩 중 대표 역할('청년', '교리교사') 존재 확인
    await expect(page.locator("button:has-text('청년')")).toBeVisible();
    await expect(page.locator("button:has-text('교리교사')")).toBeVisible();
  });

  test("DoD 3: 순례 그룹 무작위 배정 연출 및 성인(Saint) 순례단 결과 표시", async ({
    page,
  }) => {
    // Step 1 -> Step 2 -> Step 3 이동
    await page.locator("button:has-text('다음: 약관 동의')").click();
    await page.locator("button:has-text('소속 선택으로 이동')").click();

    // 1. 순례 그룹 배정 버튼 확인 및 클릭
    const allocateBtn = page.locator("button:has-text('순례 그룹 배정 및 시작')");
    await expect(allocateBtn).toBeVisible();
    await allocateBtn.click();

    // 2. 배정 완료 축하 모달(Step 4) 및 타이틀 렌더링 확인
    const completionTitle = page.locator("h2:has-text('순례 등록 완료!')");
    await expect(completionTitle).toBeVisible({ timeout: 5000 });

    // 3. 무작위 배정 순례 공동체 배지 확인
    const groupBadge = page.locator("text=무작위 배정 순례 공동체");
    await expect(groupBadge).toBeVisible();

    // 4. 순례 여정 시작 버튼 클릭 시 모달 닫힘
    const startBtn = page.locator("button:has-text('순례 여정 시작하기')");
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(completionTitle).not.toBeVisible();
  });
});
