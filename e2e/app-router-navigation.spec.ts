import { test, expect } from "@playwright/test";

test.describe("App Router (tabs) 파일 라우팅 및 상태 유지 E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem(
        "byd2026_user",
        JSON.stringify({
          id: "user-router-tester",
          name: "김루터",
          district: "중앙",
          parish: "중앙",
          role: "청년",
          groupNumber: 7,
        })
      );
    });
    await page.reload();
  });

  test("DoD 1: 각 탭 클릭 시 독립 URL(/stamp, /seating, /feed, /info, /)로 이동하고 네비게이션 활성 상태가 동기화된다", async ({ page }) => {
    // 1. 스탬프 탭 이동
    await page.locator("nav a[href='/stamp'], nav button:has-text('스탬프')").click();
    await expect(page).toHaveURL(/\/stamp/);
    await expect(page.locator("text=공식 부스 스탬프 투어")).toBeVisible({ timeout: 5000 });

    // 2. 미사좌석 탭 이동
    await page.locator("nav a[href='/seating'], nav button:has-text('미사좌석')").click();
    await expect(page).toHaveURL(/\/seating/);
    await expect(page.locator("text=내 본당 실내체육관 미사 지정석")).toBeVisible({ timeout: 5000 });

    // 3. 소통피드 탭 이동
    await page.locator("nav a[href='/feed'], nav button:has-text('소통피드')").click();
    await expect(page).toHaveURL(/\/feed/);
    await expect(page.locator("text=BYD 순례자 광장")).toBeVisible({ timeout: 5000 });

    // 4. 행사안내 탭 이동
    await page.locator("nav a[href='/info'], nav button:has-text('안내')").click();
    await expect(page).toHaveURL(/\/info/);
    await expect(page.locator("text=BYD 셔틀버스 운행")).toBeVisible({ timeout: 5000 });

    // 5. 홈 탭 이동
    await page.locator("nav a[href='/'], nav button:has-text('홈')").click();
    await expect(page).toHaveURL(/^(?!.*(stamp|seating|feed|info)).*$/);
    await expect(page.locator("text=김루터")).toBeVisible({ timeout: 5000 });
  });

  test("DoD 2: 서브 탭(/feed, /stamp)에서 새로고침(F5) 시 홈으로 리셋되지 않고 해당 화면이 그대로 유지된다", async ({ page }) => {
    // 직접 /feed URL로 접근
    await page.goto("/feed");
    await expect(page).toHaveURL(/\/feed/);
    await expect(page.locator("text=BYD 순례자 광장")).toBeVisible({ timeout: 5000 });

    // 새로고침 실행
    await page.reload();
    await expect(page).toHaveURL(/\/feed/);
    await expect(page.locator("text=BYD 순례자 광장")).toBeVisible({ timeout: 5000 });

    // 직접 /stamp URL로 이동 후 새로고침
    await page.goto("/stamp");
    await expect(page).toHaveURL(/\/stamp/);
    await expect(page.locator("text=공식 부스 스탬프 투어")).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page).toHaveURL(/\/stamp/);
    await expect(page.locator("text=공식 부스 스탬프 투어")).toBeVisible({ timeout: 5000 });
  });

  test("DoD 3: 브라우저 뒤로가기/앞으로가기 네비게이션 시 히스토리가 정상 유지된다", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav a[href='/info'], nav button:has-text('안내')").click();
    await expect(page).toHaveURL(/\/info/);

    await page.locator("nav a[href='/seating'], nav button:has-text('미사좌석')").click();
    await expect(page).toHaveURL(/\/seating/);

    // 뒤로가기 -> /info
    await page.goBack();
    await expect(page).toHaveURL(/\/info/);
    await expect(page.locator("text=BYD 셔틀버스 운행")).toBeVisible({ timeout: 5000 });

    // 앞으로가기 -> /seating
    await page.goForward();
    await expect(page).toHaveURL(/\/seating/);
    await expect(page.locator("text=내 본당 실내체육관 미사 지정석")).toBeVisible({ timeout: 5000 });
  });
});
