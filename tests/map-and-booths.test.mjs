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

  // 4. (TDD RED) 야외 분수광장 4대 테마존 구역 블록 및 배치도 모델 검증
  test("DoD 4: 야외 분수광장 4대 방위 구역 블록(FOUNTAIN_ZONE_BLOCKS) 데이터 및 좌표 무결성 검증", async () => {
    const { FOUNTAIN_ZONE_BLOCKS } = await import("../src/data/boothLocations.ts");

    assert.ok(FOUNTAIN_ZONE_BLOCKS, "FOUNTAIN_ZONE_BLOCKS가 정의되어 있어야 합니다.");
    assert.equal(FOUNTAIN_ZONE_BLOCKS.length, 4);

    const north = FOUNTAIN_ZONE_BLOCKS.find((b) => b.direction === "north");
    const east = FOUNTAIN_ZONE_BLOCKS.find((b) => b.direction === "east");
    const west = FOUNTAIN_ZONE_BLOCKS.find((b) => b.direction === "west");
    const south = FOUNTAIN_ZONE_BLOCKS.find((b) => b.direction === "south");

    assert.ok(north && north.zoneId === "sharing", "북측은 나눔존이어야 합니다.");
    assert.ok(east && east.zoneId === "love", "동측은 사랑존이어야 합니다.");
    assert.ok(west && west.zoneId === "faith", "서측은 믿음존이어야 합니다.");
    assert.ok(south && south.zoneId === "hope", "남측은 희망존이어야 합니다.");

    FOUNTAIN_ZONE_BLOCKS.forEach((block) => {
      assert.ok(block.coordinates && block.coordinates.length >= 3, "폴리곤 좌표가 최소 3개 이상이어야 합니다.");
      assert.ok(block.centerLat >= 35.27 && block.centerLat <= 35.29);
      assert.ok(block.centerLng >= 129.09 && block.centerLng <= 129.11);
      assert.ok(block.color && block.color.length > 0);
      assert.ok(block.boothCount > 0);
    });
  });

  // 5. KakaoMapView 에러 복원력 및 폴백 안내 규약 검증
  test("DoD 5: KakaoMapView 로드 실패 및 에러 상태 대응 계약 검증", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const viewPath = path.join(process.cwd(), "src/components/KakaoMapView.tsx");
    assert.ok(fs.existsSync(viewPath));
    const content = fs.readFileSync(viewPath, "utf-8");

    // 1. 에러 상태(loadError) 및 안내 폴백 블록이 존재하는지
    assert.ok(content.includes("loadError"), "loadError 상태 관리가 있어야 합니다.");
    assert.ok(content.includes("AlertCircle"), "에러 알림 아이콘이 렌더링되어야 합니다.");

    // 2. 카카오 SDK 로더 스크립트 태그 속성 계약
    assert.ok(content.includes("kakao-map-sdk"), "SDK 스크립트 id 계약(kakao-map-sdk)이 유지되어야 합니다.");
    assert.ok(content.includes("autoload=false"), "비동기 초기화를 위한 autoload=false 플래그가 있어야 합니다.");
    assert.ok(
      content.includes("dapi.kakao.com/v2/maps/sdk.js?appkey="),
      "SDK 스크립트 src에 sdk.js?appkey= 엔드포인트가 포함되어야 브라우저 404가 방지됩니다."
    );

    // 3. 스포원파크 4대 테마존 현장 배치도 폴백 및 부스 안내 연결 여부
    assert.ok(
      content.includes("FOUNTAIN_ZONE_BLOCKS.map"),
      "SDK 실패 시에도 4대 테마존 현장 배치도 블록을 폴백으로 렌더링해야 합니다."
    );
    assert.ok(
      content.includes("4대 테마존 부스 (81개)"),
      "폴백 화면에 상단 부스 탭을 통한 안내 유도 문구가 포함되어야 합니다."
    );
  });
});

