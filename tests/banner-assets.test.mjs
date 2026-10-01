import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

test("배너 정적 자산 존재 및 무결성 검증", async (t) => {
  const bannersDir = path.resolve(process.cwd(), "public/assets/banners");

  await t.test("배너 디렉터리가 존재해야 한다", () => {
    assert.equal(fs.existsSync(bannersDir), true, "public/assets/banners 디렉터리가 있어야 합니다.");
  });

  const heroBanner = path.join(bannersDir, "byd-hero-banner.webp");
  const pastoralBannerWebp = path.join(bannersDir, "pastoral-guidelines-banner.webp");

  await t.test("byd-hero-banner.webp 자산이 존재하고 0바이트 초과여야 한다", () => {
    assert.equal(fs.existsSync(heroBanner), true, "byd-hero-banner.webp 가 존재해야 합니다.");
    const stat = fs.statSync(heroBanner);
    assert.ok(stat.size > 1000, `byd-hero-banner.webp 크기가 너무 작습니다: ${stat.size} 바이트`);
  });

  await t.test("pastoral-guidelines-banner.webp 자산이 존재하고 0바이트 초과여야 한다", () => {
    assert.equal(fs.existsSync(pastoralBannerWebp), true, "pastoral-guidelines-banner.webp 가 존재해야 합니다.");
    const stat = fs.statSync(pastoralBannerWebp);
    assert.ok(stat.size > 1000, `pastoral-guidelines-banner.webp 크기가 너무 작습니다: ${stat.size} 바이트`);
  });
});
