import { test, expect } from "@playwright/test";

test.describe("순례자 온보딩 플로우 E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지 초기화하여 첫 방문 상태 시뮬레이션
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Step 1 -> Step 2 -> Step 3 배정 완료 후 메인 화면 진입", async ({ page }) => {
    // 1. 온보딩 모달 표시 확인
    const welcomeText = page.locator("text=환영합니다!");
    if (!(await welcomeText.isVisible({ timeout: 2000 }).catch(() => false))) {
      const registerBtn = page.locator("button:has-text('순례 등록하기')");
      if (await registerBtn.isVisible().catch(() => false)) {
        await registerBtn.click();
      }
    }
    await expect(welcomeText).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Step 1 of 3")).toBeVisible();

    // 이름 입력
    const nameInput = page.locator("input[placeholder*='홍길동']");
    await nameInput.fill("김베드로");

    // 다음 단계 버튼 클릭
    await page.click("button:has-text('다음 단계: 소속 선택')");

    // 2. Step 2 역할 선택 확인
    await expect(page.locator("text=Step 2 of 3")).toBeVisible();
    await expect(page.locator("text=소속 역할을 선택해 주세요")).toBeVisible();

    // '청년' 역할 칩 클릭
    await page.click("button:has-text('청년')");

    // 순례 그룹 배정 버튼 클릭
    await page.click("button:has-text('순례 그룹 배정 및 시작')");

    // 3. Step 3 배정 완료 모달 확인 (애니메이션 대기)
    await expect(page.locator("text=Step 3 of 3")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=순례 등록 완료!")).toBeVisible();
    await expect(page.locator("text=김베드로님")).toBeVisible();
    await expect(page.locator("text=청년 순례")).toBeVisible();

    // 순례 여정 시작하기 클릭
    await page.click("button:has-text('순례 여정 시작하기')");

    // 4. 모달이 닫히고 메인 화면에 프로필 렌더링 확인
    await expect(page.locator("text=환영합니다!")).not.toBeVisible();
    await expect(page.locator("text=김베드로")).toBeVisible();
  });
});
