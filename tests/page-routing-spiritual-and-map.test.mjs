import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Next.js App Router 영적 순례 및 지도 독립 페이지 라우팅 계약 검증 (Issue #32)", () => {
  const rootDir = process.cwd();
  const tabsDir = path.join(rootDir, "src/app/(tabs)");

  test("DoD 1: 4대 독립 라우트 파일(/map, /prayer, /saints, /song) page.tsx 실재 검증", () => {
    const requiredFiles = [
      path.join(tabsDir, "map/page.tsx"),
      path.join(tabsDir, "prayer/page.tsx"),
      path.join(tabsDir, "saints/page.tsx"),
      path.join(tabsDir, "song/page.tsx"),
    ];

    requiredFiles.forEach((filePath) => {
      assert.ok(
        fs.existsSync(filePath),
        `독립 라우트 파일 누락: ${path.relative(rootDir, filePath)}`
      );
    });
  });

  test("DoD 2: HomeTimelineView 내 영적자료 및 지도 진입점이 모달 호출 대신 Next.js Link 계약을 만족하는지 검증", () => {
    const homeViewPath = path.join(rootDir, "src/components/HomeTimelineView.tsx");
    assert.ok(fs.existsSync(homeViewPath), "HomeTimelineView.tsx가 존재해야 합니다.");
    const content = fs.readFileSync(homeViewPath, "utf-8");

    assert.ok(content.includes('href="/map"'), "현장지도 링크('/map')가 있어야 합니다.");
    assert.ok(content.includes('href="/prayer"'), "기도문 링크('/prayer')가 있어야 합니다.");
    assert.ok(content.includes('href="/saints"'), "수호성인 링크('/saints')가 있어야 합니다.");
    assert.ok(content.includes('href="/song"'), "주제가 링크('/song')가 있어야 합니다.");
  });

  test("DoD 3: (tabs)/layout.tsx 상단 현장지도 버튼이 모달 대신 Link('/map')로 연결되어 있는지 검증", () => {
    const layoutPath = path.join(tabsDir, "layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "layout.tsx가 존재해야 합니다.");
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(
      content.includes('href="/map"'),
      "헤더 공지 배너의 현장지도가 href='/map' 링크여야 합니다."
    );
  });
});
