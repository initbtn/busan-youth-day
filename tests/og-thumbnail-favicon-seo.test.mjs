import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("SNS 공유 썸네일(OG), 쭈양이 파비콘 및 SEO 메타데이터 계약 검증 (Issue #35)", () => {
  const rootDir = process.cwd();
  const layoutPath = path.join(rootDir, "src/app/layout.tsx");

  test("DoD 1: layout.tsx 내 title 및 description에서 이모지가 제거되고 공식 설명문으로 정돈됨", () => {
    assert.ok(fs.existsSync(layoutPath), "src/app/layout.tsx가 존재해야 합니다.");
    const content = fs.readFileSync(layoutPath, "utf-8");

    // 이모지 패턴 검사
    const emojiRegex = /[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u;
    
    // metadata 객체 추출 검증
    assert.ok(!content.includes("🍞🐟"), "description에 🍞🐟 이모지가 없어야 합니다.");
    assert.ok(!content.includes("📱"), "OG/Twitter 제목 및 설명에 📱 이모지가 없어야 합니다.");
    assert.ok(
      content.includes("2026 부산교구 청소년의 날"),
      "공식 행사 명칭('2026 부산교구 청소년의 날')이 포함되어야 합니다."
    );
    assert.ok(
      content.includes("스포원파크"),
      "행사 장소('스포원파크')가 설명에 포함되어야 합니다."
    );
  });

  test("DoD 2: metadataBase 및 OG/Twitter URL이 실배포 도메인(NEXT_PUBLIC_SITE_URL/Vercel)으로 설정됨", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(
      content.includes("https://busan-youth-day.vercel.app"),
      "배포 기본 도메인('https://busan-youth-day.vercel.app')이 명시되어야 합니다."
    );
    assert.ok(
      !content.includes("byd2026.catb.kr"),
      "미연결 레거시 도메인('byd2026.catb.kr')이 제거되어야 합니다."
    );
  });

  test("DoD 3: 쭈양이 파비콘 및 아이콘 에셋 실재 및 바이너리 갱신 검증", () => {
    const appFaviconPath = path.join(rootDir, "src/app/favicon.ico");
    const appIconPath = path.join(rootDir, "src/app/icon.png");
    const publicFaviconPath = path.join(rootDir, "public/favicon.ico");

    assert.ok(fs.existsSync(appFaviconPath), "src/app/favicon.ico가 존재해야 합니다.");
    assert.ok(fs.existsSync(appIconPath), "src/app/icon.png가 존재해야 합니다.");
    assert.ok(fs.existsSync(publicFaviconPath), "public/favicon.ico가 존재해야 합니다.");

    // Next.js 기본 템플릿 favicon.ico 크기(25931 bytes)와 일치하지 않아야 함
    const appFaviconStat = fs.statSync(appFaviconPath);
    assert.notEqual(
      appFaviconStat.size,
      25931,
      "기존 Next.js 기본 파비콘 바이너리가 쭈양이 공식 파비콘으로 교체되어야 합니다."
    );
  });
});
