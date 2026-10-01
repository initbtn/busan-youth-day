import { test, expect } from "@playwright/test";

test.describe("현장지도 (/map) 라우트 및 카카오맵 연동 E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/map");
  });

  test("DoD 1: /map 페이지 진입 시 상단 헤더, 탭 네비게이션 및 지도 컨테이너 표시 검증", async ({ page }) => {
    // 1. 헤더 가이드북 타이틀 확인
    await expect(page.locator("text=공식 부스 · 무대 · 행사장 안내")).toBeVisible();
    await expect(page.locator("text=현장 가이드북")).toBeVisible();

    // 2. 3대 서브 탭(실시간 지도, 4대 테마존 부스, 특설무대 일정) 버튼 존재 확인
    const mapTab = page.locator("button:has-text('실시간 지도')");
    const boothsTab = page.locator("button:has-text('4대 테마존 부스')");
    const stagesTab = page.locator("button:has-text('특설무대 일정')");

    await expect(mapTab).toBeVisible();
    await expect(boothsTab).toBeVisible();
    await expect(stagesTab).toBeVisible();

    // 3. 지도 탭 활성화 상태 확인
    await expect(mapTab).toHaveClass(/bg-orange-500/);

    // 4. 지도 뷰 영역 또는 안내 텍스트 렌더링 확인
    await expect(page.locator("text=스포원파크 야외 분수광장 현장")).toBeVisible();
  });

  test("DoD 2: 테마존 부스 탭 및 특설무대 일정 탭 전환 인터랙션 검증", async ({ page }) => {
    // 1. 4대 테마존 부스 탭 클릭
    await page.locator("button:has-text('4대 테마존 부스')").click();
    await expect(page.locator("text=총 81개 부스").or(page.locator("text=믿음존"))).toBeVisible();

    // 2. 특설무대 일정 탭 클릭
    await page.locator("button:has-text('특설무대 일정')").click();
    await expect(page.locator("text=실내체육관 메인 스테이지")).toBeVisible();
    await expect(page.locator("text=야외 분수광장 버스킹/청년무대")).toBeVisible();
  });

  test("DoD 3: 카카오맵 에러 또는 오프라인 발생 시 안전한 폴백 UI 제공 검증", async ({ page }) => {
    // 카카오맵 SDK 도메인 요청 차단 시뮬레이션
    await page.route("**/dapi.kakao.com/**", (route) => route.abort());
    await page.reload();

    // 1. 에러 안내 카드 렌더링 확인
    const errorCard = page.locator("text=카카오 지도 로드 실패 (현장 배치도 대체)");
    await expect(errorCard).toBeVisible({ timeout: 5000 });

    // 2. 스포원파크 4대 방위 테마존 현장 배치도 폴백 렌더링 확인
    await expect(page.locator("text=스포원파크 야외 분수광장 현장 배치도")).toBeVisible();
    await expect(page.locator("text=북측 (재난대피소 앞)")).toBeVisible();
    await expect(page.locator("text=남측 (실내체육관 방면)")).toBeVisible();
  });
});
