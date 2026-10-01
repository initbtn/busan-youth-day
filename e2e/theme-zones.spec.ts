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

  test("3-Day 행사 일정(본대회, 사목주간, 2027 WYD) 탭 전환 및 타임라인 렌더링 검증", async ({ page }) => {
    // 홈 탭 상의 행사 일정 섹션 확인
    await expect(page.locator("text=BYD 행사 일정")).toBeVisible();

    const day15Button = page.locator("button:has-text('본대회')");
    const day16Button = page.locator("button:has-text('사목주간')");
    const day17Button = page.locator("button:has-text('2027')");

    await expect(day15Button).toBeVisible();
    await expect(day16Button).toBeVisible();
    await expect(day17Button).toBeVisible();

    // Day 16 (사목주간) 탭 클릭 전환
    await day16Button.click();
    await expect(day16Button).toHaveClass(/bg-orange-500/);

    // Day 17 (2027 WYD) 탭 클릭 전환
    await day17Button.click();
    await expect(day17Button).toHaveClass(/bg-orange-500/);

    // Day 15 (본대회) 복귀 및 실시간 타임라인 렌더링 확인
    await day15Button.click();
    await expect(day15Button).toHaveClass(/bg-orange-500/);
    await expect(page.locator("text=본대회 타임라인")).toBeVisible();
    await expect(page.locator("text=본당 접수 및 패키지 수령")).toBeVisible();
    await expect(page.locator("text=4대 테마존 축제 부스 체험")).toBeVisible();
    await expect(page.locator("text=BYD 축제 (파견) 미사")).toBeVisible();
  });

  test("영적 순례 자료 3종(기도문, 수호성인, 악보) 클릭 시 전면 뷰어 모달 렌더링 및 닫기 인터랙션 검증", async ({ page }) => {
    // 1. WYD 공식 기도문 상본 전면 뷰어
    const prayerCard = page.locator("text=WYD 공식 기도");
    await expect(prayerCard).toBeVisible();
    await prayerCard.click();

    await expect(page.locator("text=2027 WYD 서울 공식 기도문 상본")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("button[title='닫기']")).toBeVisible();
    await page.locator("button[title='닫기']").click();
    await expect(page.locator("text=2027 WYD 서울 공식 기도문 상본")).not.toBeVisible();

    // 2. 수호성인 5인 전면 뷰어
    const saintsCard = page.locator("text=수호성인 5인");
    await expect(saintsCard).toBeVisible();
    await saintsCard.click();

    await expect(page.locator("text=2027 서울 WYD 수호성인 5인")).toBeVisible({ timeout: 5000 });
    // 기본 선택된 성 요한 바오로 2세 heading 확인 및 김대건 안드레아 탭 선택
    await expect(page.getByRole("heading", { name: "성 요한 바오로 2세" })).toBeVisible();
    const kimTab = page.locator("button:has-text('김대건 안드레아')");
    await expect(kimTab).toBeVisible();
    await kimTab.click();
    await expect(page.locator("text=한국인 최초의 천주교 사제")).toBeVisible();

    await page.locator("button[title='닫기']").click();
    await expect(page.locator("text=2027 서울 WYD 수호성인 5인")).not.toBeVisible();

    // 3. 주제가 공식 악보 전면 뷰어
    const songCard = page.locator("text=하느님 나라에");
    await expect(songCard).toBeVisible();
    await songCard.click();

    await expect(page.locator("text=청·청해 주제가: 하느님 나라에")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=바오누리 작사·작곡 (공식 전면 악보)")).toBeVisible();
    await page.locator("button[title='닫기']").click();
    await expect(page.locator("text=청·청해 주제가: 하느님 나라에")).not.toBeVisible();
  });
});
