import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf-8");

describe("Issue #86: 지도 핀 중복 정리 (buildMapPins)", async () => {
  const { SPOWON_MAP_POINTS } = await import("../src/data/boothLocations.ts");

  test("정상값: 폴리곤 라벨이 켜져 있으면 같은 문구의 zone 핀은 그려지지 않는다", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    const pins = buildMapPins(SPOWON_MAP_POINTS, "zone", { showZonePolygons: true });
    assert.equal(pins.length, 0);
  });

  test("반대편 회귀: 폴리곤 라벨이 꺼져 있으면 zone 핀 4개는 그대로 보인다", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    const pins = buildMapPins(SPOWON_MAP_POINTS, "zone", { showZonePolygons: false });
    assert.equal(pins.length, 4);
    assert.deepEqual(
      pins.map((p) => p.point.zoneId).sort(),
      ["faith", "hope", "love", "sharing"]
    );
  });

  test("7성사 핀 7개는 묶음 핀 하나로 합쳐진다 (전체·7성사 필터)", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    for (const filter of ["all", "sacrament"]) {
      const pins = buildMapPins(SPOWON_MAP_POINTS, filter, { showZonePolygons: true });
      const clusters = pins.filter((p) => p.kind === "sacrament-cluster");
      assert.equal(clusters.length, 1, `${filter}: 묶음 핀은 정확히 1개`);
      assert.equal(clusters[0].count, 7);
      assert.equal(
        pins.filter((p) => p.kind === "point" && p.point.category === "sacrament").length,
        0,
        `${filter}: 개별 7성사 핀이 남으면 겹친다`
      );
    }
  });

  test("일부만 맞는 값: 묶음 핀 좌표는 7개 좌표의 평균이다 (첫 점으로 잘리지 않는다)", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    const members = SPOWON_MAP_POINTS.filter((p) => p.category === "sacrament");
    const avgLat = members.reduce((s, p) => s + p.lat, 0) / members.length;
    const avgLng = members.reduce((s, p) => s + p.lng, 0) / members.length;
    const [cluster] = buildMapPins(SPOWON_MAP_POINTS, "sacrament", { showZonePolygons: true });
    assert.ok(Math.abs(cluster.point.lat - avgLat) < 1e-9);
    assert.ok(Math.abs(cluster.point.lng - avgLng) < 1e-9);
    assert.equal(cluster.members.length, 7);
  });

  test("헷갈리는 값: 시설·무대 필터에는 묶음 핀이 없고 시설/무대 핀은 그대로 나온다", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    const pins = buildMapPins(SPOWON_MAP_POINTS, "facility", { showZonePolygons: true });
    assert.equal(pins.filter((p) => p.kind === "sacrament-cluster").length, 0);
    const expected = SPOWON_MAP_POINTS.filter((p) => p.category === "facility" || p.category === "stage");
    assert.equal(pins.length, expected.length);
  });

  test("불변식: 어떤 필터에서도 같은 라벨의 핀이 둘 이상 그려지지 않는다", async () => {
    const { buildMapPins } = await import("../src/lib/mapPins.ts");
    for (const filter of ["all", "sacrament", "zone", "facility"]) {
      const labels = buildMapPins(SPOWON_MAP_POINTS, filter, { showZonePolygons: true }).map((p) => p.label);
      assert.equal(new Set(labels).size, labels.length, `${filter}: 중복 라벨 ${labels}`);
    }
  });
});

describe("Issue #86: 존 카드+리스트 한 슬라이드 (zoneIndexFromScroll)", () => {
  test("스크롤 위치에서 가장 가까운 슬라이드 인덱스를 돌려준다", async () => {
    const { zoneIndexFromScroll } = await import("../src/lib/zoneCarousel.ts");
    assert.equal(zoneIndexFromScroll(0, 360, 4), 0);
    assert.equal(zoneIndexFromScroll(170, 360, 4), 0); // 절반 미만 → 이전 슬라이드
    assert.equal(zoneIndexFromScroll(190, 360, 4), 1); // 절반 초과 → 다음 슬라이드
    assert.equal(zoneIndexFromScroll(1080, 360, 4), 3);
  });

  test("범위 밖 스크롤은 처음/끝으로 고정하고 폭 0 은 0 으로 처리한다", async () => {
    const { zoneIndexFromScroll } = await import("../src/lib/zoneCarousel.ts");
    assert.equal(zoneIndexFromScroll(-50, 360, 4), 0);
    assert.equal(zoneIndexFromScroll(99999, 360, 4), 3);
    assert.equal(zoneIndexFromScroll(100, 0, 4), 0);
  });
});

describe("Issue #86: 탭 라벨 '부스 안내' 와 슬라이드 구조", () => {
  const files = [
    "src/app/(tabs)/map/page.tsx",
    "src/components/OfficialBoothStageGuide.tsx",
    "src/components/KakaoMapView.tsx",
  ];

  test("옛 문구 '4대 테마존 부스 (81개)' 가 UI 소스에 남지 않는다", () => {
    for (const f of files) {
      assert.equal(read(f).includes("4대 테마존 부스 (81개)"), false, `${f} 에 옛 라벨이 남아 있음`);
    }
  });

  test("지도 페이지와 가이드 모달의 부스 탭 버튼 라벨이 '부스 안내' 이다", () => {
    assert.match(read("src/app/(tabs)/map/page.tsx"), />\s*부스 안내\s*</);
    assert.match(read("src/components/OfficialBoothStageGuide.tsx"), />\s*부스 안내\s*</);
  });

  test("지도 폴백 안내 문구가 새 탭 이름 '부스 안내' 를 가리킨다", () => {
    assert.ok(read("src/components/KakaoMapView.tsx").includes("&apos;부스 안내&apos;"));
  });

  test("부스 안내 탭은 존마다 카드+리스트가 한 슬라이드이고 스크롤로 선택 존이 동기화된다", () => {
    const page = read("src/app/(tabs)/map/page.tsx");
    assert.ok(page.includes("zoneIndexFromScroll"), "스크롤 위치→존 동기화 헬퍼를 써야 한다");
    assert.ok(page.includes("data-testid=\"zone-slide\""), "존별 슬라이드(카드+리스트) 컨테이너가 있어야 한다");
    assert.ok(page.includes("snap-x") && page.includes("snap-center"), "스냅 스크롤 슬라이드여야 한다");
  });
});
