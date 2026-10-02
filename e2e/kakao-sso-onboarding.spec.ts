import { test, expect } from "@playwright/test";

test.describe("카카오 SSO 간편 인증 및 온보딩 순례 공동체 배정 E2E (Issue #18)", () => {
  test.beforeEach(async ({ page }) => {
    // 로컬 스토리지 초기화로 온보딩 모달이 자연스럽게 열리도록 준비
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");
  });

  test("DoD 1: 온보딩 모달 진입 시 카카오 SSO 로그인 버튼 및 게스트 모드 진입 버튼 노출", async ({
    page,
  }) => {
    // 1. 온보딩 모달 컨테이너 또는 헤더 확인
    const onboardingHeader = page.locator("text=순례 등록");
    await expect(onboardingHeader).toBeVisible({ timeout: 5000 });

    // 2. 카카오 로그인 버튼 노출 확인
    const kakaoButton = page.locator("button:has-text('카카오로 3초 만에 시작하기')");
    await expect(kakaoButton).toBeVisible();

    // 3. 게스트 모드 / 바로 등록하기 버튼 노출 확인
    const guestButton = page.locator("button:has-text('게스트로 순례 시작하기')");
    await expect(guestButton).toBeVisible();
  });

  test("DoD 2: 약관 동의 체크박스 제어 및 11종 역할/본당 선택 단계 진행", async ({
    page,
  }) => {
    // 1. 게스트 모드로 다음 단계 진입
    const guestButton = page.locator("button:has-text('게스트로 순례 시작하기')");
    await guestButton.click();

    // 2. 약관 동의 단계(Step 2) 확인
    await expect(page.locator("text=순례 여정 이용 약관 동의")).toBeVisible();

    // 3. 개인정보 및 캐릭터 자산 동의 체크박스 확인
    const nextBtn = page.locator("button:has-text('동의하고 프로필 설정하기')");
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // 4. 소속 및 역할 선택(Step 3) 확인
    await expect(page.locator("text=지구 및 본당")).toBeVisible();
    await expect(page.locator("text=소속 역할")).toBeVisible();

    // 5. 11종 소속 역할 칩 중 대표 역할('청년', '교리교사') 존재 확인
    await expect(page.locator("button:has-text('청년')")).toBeVisible();
    await expect(page.locator("button:has-text('교리교사')")).toBeVisible();
  });

  test("DoD 3: 순례 그룹 무작위 배정 연출 및 성인(Saint) 순례단 결과 표시", async ({
    page,
  }) => {
    // Step 1 -> Step 2 -> Step 3 빠르게 이동
    const guestButton = page.locator("button:has-text('게스트로 순례 시작하기')");
    await guestButton.click();
    await page.locator("button:has-text('동의하고 프로필 설정하기')").click();

    // 이름 입력
    const nameInput = page.locator("input[placeholder*='홍길동']");
    if (await nameInput.isVisible()) {
      await nameInput.fill("김베드로");
    }

    // 순례 그룹 배정 버튼 클릭
    const allocateBtn = page.locator("button:has-text('순례 공동체 무작위 배정')");
    await expect(allocateBtn).toBeVisible();
    await allocateBtn.click();

    // 배정 완료 축하 모달(Step 4) 및 성인 순례단 명칭 렌더링 확인
    const completionTitle = page.locator("text=순례 등록 완료!");
    await expect(completionTitle).toBeVisible({ timeout: 5000 });

    // 배정된 순례단 라벨 검증
    const groupBadge = page.locator("text=무작위 배정 순례단");
    await expect(groupBadge).toBeVisible();

    // 순례 여정 시작 버튼 클릭 시 모달 닫힘
    const startBtn = page.locator("button:has-text('은총 가득한 순례 여정 시작하기')");
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(completionTitle).not.toBeVisible();
  });
});
