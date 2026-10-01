import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Kakao Map & Booth Overlay Integrity (Issue #19)", () => {
  // 1. SSOT 연동 및 데이터 무결성 테스트
  test("DoD 1: 4대 테마존 및 7성사 부스 SSOT 연동 검증", async () => {
    const { SPOWON_MAP_POINTS, SPOWON_CENTER } = await import(
      "../src/data/boothLocations.ts"
    );
    const { OFFICIAL_ZONES } = await import("../src/data/officialBooths.ts");

    // 중심 좌표 검증 (스포원파크 야외 분수광장)
    assert.equal(SPOWON_CENTER.lat, 35.28173);
    assert.equal(SPOWON_CENTER.lng, 129.09845);

    // 7성사 부스 목록 추출
    const expectedSacraments = [];
    OFFICIAL_ZONES.forEach((z) => {
      z.booths.forEach((b) => {
        if (b.isSacrament) {
          expectedSacraments.push({
            zoneId: z.id,
            number: b.number,
            name: b.name,
            sacramentType: b.sacramentType,
          });
        }
      });
    });

    // 7개 7성사 부스가 존재해야 함
    assert.equal(expectedSacraments.length, 7);

    // SPOWON_MAP_POINTS 내 7성사 포인트와 대조
    const sacramentMapPoints = SPOWON_MAP_POINTS.filter(
      (p) => p.category === "sacrament"
    );
    assert.equal(sacramentMapPoints.length, 7);

    expectedSacraments.forEach((expected) => {
      const match = sacramentMapPoints.find(
        (p) => p.zoneId === expected.zoneId && p.boothNumber === expected.number
      );
      assert.ok(match, `7성사 부스 누락: ${expected.zoneId} ${expected.number}번`);
      assert.equal(match.isSacrament, true);
      assert.equal(match.sacramentType, expected.sacramentType);
      assert.ok(match.name.includes(expected.name));
    });
  });

  // 2. 4대 테마존 대표 핀 및 주요 거점 좌표 범위 유효성
  test("DoD 2: 4대 테마존 및 주요 시설 좌표 범위(스포원파크 반경) 검증", async () => {
    const { SPOWON_MAP_POINTS } = await import("../src/data/boothLocations.ts");

    const zonePins = SPOWON_MAP_POINTS.filter((p) => p.category === "zone");
    assert.equal(zonePins.length, 4);

    const facilityPins = SPOWON_MAP_POINTS.filter(
      (p) => p.category === "facility" || p.category === "stage"
    );
    assert.ok(facilityPins.length >= 5);

    // 모든 좌표가 스포원파크 지리적 경계 내에 있는지 검증
    // 위도: 35.27 ~ 35.29, 경도: 129.09 ~ 129.11
    SPOWON_MAP_POINTS.forEach((point) => {
      assert.ok(
        point.lat >= 35.27 && point.lat <= 35.29,
        `위도 범위 초과: ${point.name} (${point.lat})`
      );
      assert.ok(
        point.lng >= 129.09 && point.lng <= 129.11,
        `경도 범위 초과: ${point.name} (${point.lng})`
      );
      assert.ok(point.name && point.name.length > 0);
      assert.ok(point.description && point.description.length > 0);
    });
  });

  // 3. 필터링 로직 단위 테스트
  test("DoD 3: 카테고리 필터링(전체/7성사/테마존/시설) 순수 필터 분리 검증", async () => {
    const { SPOWON_MAP_POINTS } = await import("../src/data/boothLocations.ts");

    const filterPoints = (filter) => {
      return SPOWON_MAP_POINTS.filter((p) => {
        if (filter === "all") return true;
        if (filter === "sacrament") return p.category === "sacrament";
        if (filter === "zone") return p.category === "zone";
        if (filter === "facility")
          return p.category === "facility" || p.category === "stage";
        return true;
      });
    };

    const all = filterPoints("all");
    const sacraments = filterPoints("sacrament");
    const zones = filterPoints("zone");
    const facilities = filterPoints("facility");

    assert.equal(all.length, SPOWON_MAP_POINTS.length);
    assert.equal(sacraments.length, 7);
    assert.equal(zones.length, 4);
    assert.equal(facilities.length, 6);

    // 7성사 필터에는 비-7성사 부스가 포함되지 않아야 함
    sacraments.forEach((p) => {
      assert.equal(p.category, "sacrament");
      assert.equal(p.isSacrament, true);
    });
  });
});
