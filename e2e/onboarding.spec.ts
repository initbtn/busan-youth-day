import { test, expect } from "@playwright/test";

test.describe("순례자 온보딩 플로우 E2E (카카오 SSO 및 성인 순례단 배정)", () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지 초기화하여 첫 방문 상태 시뮬레이션
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Step 1 (카카오/이름) -> Step 2 (약관) -> Step 3 (소속/본당) -> Step 4 성인 순례단 배정 완료 후 메인 화면 진입", async ({
    page,
  }) => {
    // 1. 온보딩 모달 및 카카오 SSO 버튼 확인
    const welcomeText = page.locator("text=반갑습니다!");
    if (!(await welcomeText.isVisible({ timeout: 2000 }).catch(() => false))) {
      const registerBtn = page.locator("button:has-text('순례 등록하기')");
      if (await registerBtn.isVisible().catch(() => false)) {
        await registerBtn.click();
      }
    }
    await expect(welcomeText).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Step 1 of 4")).toBeVisible();
    await expect(page.locator("text=카카오로 3초 만에 시작하기")).toBeVisible();

    // 이름 입력
    const nameInput = page.locator("input[placeholder*='홍길동']");
    await nameInput.fill("김베드로");

    // 다음: 약관 동의 클릭
    await page.click("button:has-text('다음: 약관 동의')");

    // 2. Step 2 약관 동의 확인 (PRD §2.1)
    await expect(page.locator("text=Step 2 of 4")).toBeVisible();
    await expect(page.locator("text=약관에 동의해 주세요")).toBeVisible();
    await expect(page.locator("text=개인정보 수집 및 이용 동의")).toBeVisible();
    await expect(page.locator("text=쭈양이 자산 사용 가이드 동의")).toBeVisible();

    // 소속 선택으로 이동 클릭
    await page.click("button:has-text('소속 선택으로 이동')");

    // 3. Step 3 소속 및 본당 선택 (PRD §2.2)
    await expect(page.locator("text=Step 3 of 4")).toBeVisible();
    await expect(page.locator("text=소속과 역할을 선택해 주세요")).toBeVisible();

    // '청년' 역할 칩 클릭
    await page.click("button:has-text('청년')");

    // 순례 그룹 배정 버튼 클릭
    await page.click("button:has-text('순례 그룹 배정 및 시작')");

    // 4. Step 4 성인 순례 공동체 배정 완료 모달 확인 (PRD §2.3)
    await expect(page.locator("text=Step 4 of 4")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=순례 등록 완료!")).toBeVisible();
    await expect(page.locator("text=김베드로님")).toBeVisible();
    await expect(page.locator("text=무작위 배정 순례 공동체")).toBeVisible();

    // 순례 여정 시작하기 클릭
    await page.click("button:has-text('순례 여정 시작하기')");

    // 5. 모달이 닫히고 상단 헤더에 사용자 이름 렌더링 확인
    await expect(page.locator("text=반갑습니다!")).not.toBeVisible();
    await expect(page.locator("text=김베드로")).toBeVisible();
  });
});
