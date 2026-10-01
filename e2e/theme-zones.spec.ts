import { test, expect } from "@playwright/test";

test.describe("주요 뷰 및 네비게이션 탭 전환 E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem(
        "byd2026_user",
        JSON.stringify({
          id: "user-nav-tester",
          name: "박순례",
          district: "남천",
          parish: "남천",
          role: "청년",
          groupNumber: 12,
        })
      );
    });
    await page.reload();
  });

  test("스탬프 투어, 미사 좌석배치도, 안내 탭 전환 및 렌더링 무결성 확인", async ({ page }) => {
    // 1. 스탬프 탭 확인
    await page.locator("nav button:has-text('스탬프')").click();
    await expect(page.locator("text=공식 부스 스탬프 투어")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=카메라로 공식 부스 QR 스캔하기")).toBeVisible();

    // 2. 미사좌석 탭 확인 (공문 G26-146 좌석배치도)
    await page.locator("nav button:has-text('미사좌석')").click();
    await expect(page.locator("text=내 본당 실내체육관 미사 지정석")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=전체 본당 좌석배치도 검색")).toBeVisible();
    await expect(page.locator("button:has-text('1층')")).toBeVisible();
    await expect(page.locator("button:has-text('2층')")).toBeVisible();

    // 3. 안내 탭 확인
    await page.locator("nav button:has-text('안내')").click();
    await expect(page.locator("text=BYD 셔틀버스 운행")).toBeVisible({ timeout: 5000 });

    // 4. 홈 탭으로 복귀
    await page.locator("nav button:has-text('홈')").click();
    await expect(page.locator("text=박순례")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=12조")).toBeVisible();
  });
});
