import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("지도 마킹 정제, 인터랙티브 구역 네비게이션 및 테마존 캐러셀/모달 계약 검증 (Issue #80)", () => {
  const rootDir = process.cwd();

  it("DoD 1: 마킹이 제거된 클린 지도 및 접수처/패키지수령처 WebP 에셋이 존재한다", () => {
    const cleanMapPath = path.join(rootDir, "public/assets/spowon_clean_map.webp");
    const receptionDeskPath = path.join(rootDir, "public/assets/reception_desk.webp");
    const packagePickupPath = path.join(rootDir, "public/assets/package_pickup.webp");

    assert.ok(fs.existsSync(cleanMapPath), "public/assets/spowon_clean_map.webp 파일이 존재해야 합니다");
    assert.ok(fs.existsSync(receptionDeskPath), "public/assets/reception_desk.webp 파일이 존재해야 합니다");
    assert.ok(fs.existsSync(packagePickupPath), "public/assets/package_pickup.webp 파일이 존재해야 합니다");

    const cleanMapStat = fs.statSync(cleanMapPath);
    assert.ok(cleanMapStat.size > 10000, "클린 지도 이미지 크기가 유효해야 합니다");
  });

  it("DoD 2: MapPoint 거점에 접수처 및 패키지수령처 메타데이터와 사진 경로가 등록되어 있다", () => {
    const boothLocationsFile = fs.readFileSync(path.join(rootDir, "src/data/boothLocations.ts"), "utf-8");
    assert.match(boothLocationsFile, /facility-reception/);
    assert.match(boothLocationsFile, /facility-package-pickup/);
    assert.match(boothLocationsFile, /reception_desk\.webp/);
    assert.match(boothLocationsFile, /package_pickup\.webp/);
  });

  it("DoD 3: KakaoMapView 및 지도 뷰어에서 접수처/패키지수령처 터치 시 사진 모달 및 구역 터치 연동을 지원한다", () => {
    const kakaoMapFile = fs.readFileSync(path.join(rootDir, "src/components/KakaoMapView.tsx"), "utf-8");
    assert.match(kakaoMapFile, /photoModal|photoUrl|reception_desk/i);
    assert.match(kakaoMapFile, /spowon_clean_map\.webp/);
  });

  it("DoD 4: map 페이지에서 쿼리 파라미터(tab, zone, target) 연동 및 4대 테마존 캐러셀 뷰를 제공한다", () => {
    const mapPageFile = fs.readFileSync(path.join(rootDir, "src/app/(tabs)/map/page.tsx"), "utf-8");
    // useSearchParams 지원
    assert.match(mapPageFile, /useSearchParams/);
    // 캐러셀 슬라이더 지원
    assert.match(mapPageFile, /carousel|slider|overflow-x-auto|scroll-snap/i);
    // 무대 일정 탭(지성소, 상설고해소, 실내외 무대) 포커스 지원
    assert.match(mapPageFile, /지성소|상설고해소|HOLIES_SCHEDULE/);
  });
});
