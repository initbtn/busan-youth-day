import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("사랑존 카드 및 테마존 Tailwind CSS 클래스 번들 계약 검증 (Issue #87)", () => {
  const tailwindConfigPath = path.resolve("tailwind.config.ts");
  const officialBoothsPath = path.resolve("src/data/officialBooths.ts");

  test("DoD 1-a: tailwind.config.ts content 목록에 ./src/data 경로가 등록되어 있어야 한다", () => {
    assert.ok(fs.existsSync(tailwindConfigPath), "tailwind.config.ts 파일이 존재해야 합니다.");
    const configContent = fs.readFileSync(tailwindConfigPath, "utf-8");

    assert.match(
      configContent,
      /["']\.\/src\/data\/\*\*\/\*\.\{(?:[a-zA-Z,]+)\}["']/,
      "tailwind.config.ts의 content 배열에 ./src/data 경로가 포함되어야 합니다."
    );
  });

  test("DoD 1-b: officialBooths.ts 내 4대 테마존(믿음/희망/사랑/나눔)의 gradient 및 badge 클래스가 모두 정의되어 있다", async () => {
    assert.ok(fs.existsSync(officialBoothsPath), "src/data/officialBooths.ts 파일이 존재해야 합니다.");
    const boothsModule = await import("../src/data/officialBooths.ts");
    const zones = boothsModule.OFFICIAL_ZONES || boothsModule.default?.OFFICIAL_ZONES;

    assert.ok(Array.isArray(zones) && zones.length === 4, "OFFICIAL_ZONES에 4개 존이 정의되어 있어야 합니다.");

    const loveZone = zones.find((z) => z.id === "love");
    assert.ok(loveZone, "사랑존(love)이 정의되어 있어야 합니다.");
    assert.equal(loveZone.color, "from-rose-500 to-pink-600");
    assert.equal(loveZone.badgeBg, "bg-rose-100");
    assert.equal(loveZone.badgeText, "text-rose-700");

    for (const zone of zones) {
      assert.ok(zone.color && zone.color.length > 0, `${zone.name}의 color 클래스가 지정되어야 합니다.`);
      assert.ok(zone.badgeBg && zone.badgeBg.length > 0, `${zone.name}의 badgeBg 클래스가 지정되어야 합니다.`);
      assert.ok(zone.badgeText && zone.badgeText.length > 0, `${zone.name}의 badgeText 클래스가 지정되어야 합니다.`);
    }
  });
});
