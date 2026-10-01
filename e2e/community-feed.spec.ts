import { test, expect } from "@playwright/test";

test.describe("커뮤니티 피드 영구 보존 및 새로고침 E2E (Issue #9 회귀 방지)", () => {
  test.beforeEach(async ({ page }) => {
    // 1. 온보딩 완료 상태 로컬스토리지 사전 주입
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem(
        "byd2026_user",
        JSON.stringify({
          id: "user-e2e-tester",
          name: "이테스터",
          district: "중앙",
          parish: "중앙",
          role: "청년",
          groupNumber: 7,
        })
      );
    });
    await page.reload();
  });

  test("게시글 작성 -> 즉시 DOM 반영 -> 브라우저 새로고침(F5) 후에도 글 소실 방지 검증", async ({
    page,
  }) => {
    // 2. 소통피드 탭으로 이동
    const feedTabButton = page.locator("nav button:has-text('소통피드')");
    await feedTabButton.click();

    // 피드 헤더 렌더링 대기
    await expect(page.locator("h2:has-text('#2026BYD')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=이테스터 (중앙성당 / 청년)")).toBeVisible();

    // 3. 새 게시글 입력
    const uniqueContent = `E2E 자동화 테스트 방명록입니다! [${Date.now()}]`;
    const textarea = page.locator(
      "textarea[placeholder*='청년의 날 은혜로운 순간이나 응원 한마디']"
    );
    await textarea.fill(uniqueContent);

    // 4. 게시하기 버튼 클릭
    const submitButton = page.locator("button:has-text('게시하기')");
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 5. 피드 목록에 즉시 추가되었는지 확인
    await expect(page.locator(`text=${uniqueContent}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=이테스터").first()).toBeVisible();

    // 6. 브라우저 새로고침 (F5 시뮬레이션)
    await page.reload();

    // 새로고침 후 다시 소통피드 탭 클릭 (SPA 상태 복원)
    await page.locator("nav button:has-text('소통피드')").click();

    // 7. 핵심 검증: 새로고침 후에도 작성한 글이 사라지지 않고 LocalStorage에서 복원되었는지 확인
    await expect(page.locator(`text=${uniqueContent}`)).toBeVisible({ timeout: 8000 });

    // 8. 수동 새로고침 아이콘 버튼 동작 확인
    const refreshBtn = page.locator("button[title='피드 새로고침']");
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await expect(page.locator(`text=${uniqueContent}`)).toBeVisible();
  });

  test("DoD Issue #25: 좋아요 토글(+1 / -1) 및 브라우저 새로고침 후 수치 롤백 방지 E2E", async ({
    page,
  }) => {
    // 1. 소통피드 탭으로 이동
    const feedTabButton = page.locator("nav button:has-text('소통피드')");
    await feedTabButton.click();

    // 2. 피드 로드 대기
    await expect(page.locator("h2:has-text('#2026BYD')")).toBeVisible({ timeout: 5000 });

    // 3. 첫 번째 게시글의 좋아요 버튼 및 카운트 요소 식별
    const firstLikeBtn = page.locator("button[data-testid='like-button']").first();
    await expect(firstLikeBtn).toBeVisible();

    const likeCountSpan = firstLikeBtn.locator("[data-testid='like-count']");
    const initialCountText = await likeCountSpan.innerText();
    const initialCount = parseInt(initialCountText, 10);

    // 4. 좋아요 클릭 (+1 검증)
    await firstLikeBtn.click();
    await expect(likeCountSpan).toHaveText(String(initialCount + 1));
    await expect(firstLikeBtn).toHaveClass(/text-rose-600/);

    // 5. 브라우저 새로고침(F5) 후에도 증가된 좋아요 수와 상태 유지 검증 (수치 롤백 방어)
    await page.reload();
    await page.locator("nav button:has-text('소통피드')").click();

    const reloadedLikeBtn = page.locator("button[data-testid='like-button']").first();
    const reloadedCountSpan = reloadedLikeBtn.locator("[data-testid='like-count']");
    await expect(reloadedCountSpan).toHaveText(String(initialCount + 1));
    await expect(reloadedLikeBtn).toHaveClass(/text-rose-600/);

    // 6. 좋아요 재클릭 (취소 -1 검증)
    await reloadedLikeBtn.click();
    await expect(reloadedCountSpan).toHaveText(String(initialCount));
    await expect(reloadedLikeBtn).not.toHaveClass(/text-rose-600/);

    // 7. 다시 새로고침 후에도 취소된 수치가 원본으로 롤백되지 않는지 검증
    await page.reload();
    await page.locator("nav button:has-text('소통피드')").click();

    const finalLikeBtn = page.locator("button[data-testid='like-button']").first();
    const finalCountSpan = finalLikeBtn.locator("[data-testid='like-count']");
    await expect(finalCountSpan).toHaveText(String(initialCount));
  });
});
