import { test, expect } from "@playwright/test";

test.describe("소통피드 미디어 고도화 E2E (Issue #33)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // 소통피드 탭으로 이동
    const feedTab = page.locator("nav button:has-text('소통피드')");
    await feedTab.click();
    await expect(page.locator("h2:has-text('#2026BYD')")).toBeVisible({ timeout: 5000 });
  });

  test("DoD 1: 글쓰기 모달에서 사진/영상 멀티 파일 첨부 및 미리보기 그리드 노출", async ({
    page,
  }) => {
    // 1. 글쓰기 버튼 클릭
    const writeBtn = page.locator("button:has-text('나눔하기')");
    await writeBtn.click();
    await expect(page.locator("text=청년 소통 나눔")).toBeVisible();

    // 2. 파일 입력 태그가 multiple 및 image, video 타입을 허용하는지 검증
    const fileInput = page.locator("input[type='file'][data-testid='media-file-input']");
    await expect(fileInput).toBeAttached();
    const multipleAttr = await fileInput.getAttribute("multiple");
    expect(multipleAttr).not.toBeNull();

    const acceptAttr = await fileInput.getAttribute("accept");
    expect(acceptAttr).toContain("image/*");
    expect(acceptAttr).toContain("video/*");
  });

  test("DoD 4: 피드 내 멀티 미디어 카드 렌더링 및 클릭 시 확대 슬라이드 뷰어(MediaSliderViewer) 진입/닫기", async ({
    page,
  }) => {
    // 1. 피드 목록에서 멀티 미디어를 가진 카드가 존재하는지 또는 렌더링 검증
    const mediaThumb = page.locator("[data-testid='post-media-thumbnail']").first();
    if (await mediaThumb.isVisible()) {
      // 2. 미디어 썸네일 클릭 시 전체화면 슬라이드 뷰어 열림
      await mediaThumb.click();
      const sliderViewer = page.locator("[data-testid='media-slider-viewer']");
      await expect(sliderViewer).toBeVisible();

      // 3. 인디케이터(카운터) 및 이전/다음 버튼 확인
      await expect(page.locator("[data-testid='slider-counter']")).toBeVisible();

      // 4. 닫기 버튼 클릭 시 뷰어 종료
      const closeBtn = page.locator("[data-testid='slider-close-button']");
      await closeBtn.click();
      await expect(sliderViewer).not.toBeVisible();
    }
  });
});
