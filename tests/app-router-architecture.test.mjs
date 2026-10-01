import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Next.js App Router Route Groups (tabs) 파일 및 아키텍처 계약 검증 (Issue #24)", () => {
  const rootDir = process.cwd();
  const tabsDir = path.join(rootDir, "src/app/(tabs)");

  test("DoD 1-a: App Router Route Groups (tabs) 중첩 레이아웃 및 5대 탭 페이지 파일 실재 검증", () => {
    const requiredFiles = [
      path.join(tabsDir, "layout.tsx"),
      path.join(tabsDir, "page.tsx"),
      path.join(tabsDir, "stamp/page.tsx"),
      path.join(tabsDir, "seating/page.tsx"),
      path.join(tabsDir, "feed/page.tsx"),
      path.join(tabsDir, "info/page.tsx"),
    ];

    requiredFiles.forEach((filePath) => {
      assert.ok(
        fs.existsSync(filePath),
        `필수 라우트 파일 누락: ${path.relative(rootDir, filePath)}`
      );
    });
  });

  test("DoD 1-b: (tabs)/layout.tsx Persistent Layout 구조 및 5대 서브 라우트 Link 계약 검증", () => {
    const layoutPath = path.join(tabsDir, "layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "layout.tsx가 존재해야 합니다.");
    const content = fs.readFileSync(layoutPath, "utf-8");

    // 1. 하단 5대 서브 라우트 링크 존재 여부
    assert.ok(content.includes('href="/"') || content.includes("href='/'"), "홈 링크('/')가 있어야 합니다.");
    assert.ok(content.includes('href="/stamp"'), "스탬프 링크('/stamp')가 있어야 합니다.");
    assert.ok(content.includes('href="/seating"'), "미사좌석 링크('/seating')가 있어야 합니다.");
    assert.ok(content.includes('href="/feed"'), "소통피드 링크('/feed')가 있어야 합니다.");
    assert.ok(content.includes('href="/info"'), "안내 링크('/info')가 있어야 합니다.");

    // 2. URL 경로 동기화를 위한 usePathname 사용 여부
    assert.ok(content.includes("usePathname"), "URL 활성 상태 동기화를 위해 usePathname을 사용해야 합니다.");

    // 3. 자식 페이지 렌더링 {children} 슬롯 보존 여부
    assert.ok(content.includes("{children}"), "{children} 슬롯을 통해 서브페이지가 렌더링되어야 합니다.");
  });

  test("DoD 1-c: 기존 src/app/page.tsx가 UserProvider 및 (tabs) 라우팅을 지원하거나 깔끔히 연계되는지 검증", () => {
    // 루트 app/layout.tsx 또는 app/(tabs)/layout.tsx에서 UserProvider가 상위 주입되어야 함
    const rootLayoutPath = path.join(rootDir, "src/app/layout.tsx");
    const tabsLayoutPath = path.join(tabsDir, "layout.tsx");

    const rootContent = fs.existsSync(rootLayoutPath) ? fs.readFileSync(rootLayoutPath, "utf-8") : "";
    const tabsContent = fs.existsSync(tabsLayoutPath) ? fs.readFileSync(tabsLayoutPath, "utf-8") : "";

    const hasUserProvider = rootContent.includes("UserProvider") || tabsContent.includes("UserProvider");
    assert.ok(hasUserProvider, "전역 사용자 상태를 위해 UserProvider가 레이아웃 계층에 주입되어야 합니다.");
  });
});
