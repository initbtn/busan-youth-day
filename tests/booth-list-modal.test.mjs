import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

describe("Booth List Modal Component & Data Integrity (Issue #30)", () => {
  test("DoD 1: 4대 테마존 81개 전체 부스 합계 및 무결성 검증", async () => {
    const { OFFICIAL_ZONES } = await import("../src/data/officialBooths.ts");
    const totalBooths = OFFICIAL_ZONES.reduce((acc, zone) => acc + zone.booths.length, 0);
    assert.equal(totalBooths, 81, `전체 부스 개수는 81개여야 합니다 (현재: ${totalBooths})`);

    const faithZone = OFFICIAL_ZONES.find((z) => z.id === "faith");
    const hopeZone = OFFICIAL_ZONES.find((z) => z.id === "hope");
    const loveZone = OFFICIAL_ZONES.find((z) => z.id === "love");
    const sharingZone = OFFICIAL_ZONES.find((z) => z.id === "sharing");

    assert.equal(faithZone?.booths.length, 19, "믿음존은 19개 부스여야 함");
    assert.equal(hopeZone?.booths.length, 21, "희망존은 21개 부스여야 함");
    assert.equal(loveZone?.booths.length, 31, "사랑존은 31개 부스여야 함");
    assert.equal(sharingZone?.booths.length, 10, "나눔존은 10개 부스여야 함");
  });

  test("DoD 2: BoothListModal 컴포넌트 파일 실재 및 핵심 인터페이스 검증", () => {
    const modalPath = path.join(PROJECT_ROOT, "src/components/BoothListModal.tsx");
    assert.ok(fs.existsSync(modalPath), "src/components/BoothListModal.tsx 파일이 존재해야 합니다.");

    const modalContent = fs.readFileSync(modalPath, "utf-8");
    // 검색창 존재 확인
    assert.ok(
      modalContent.includes("search") || modalContent.includes("검색") || modalContent.includes("placeholder"),
      "모달 내에 부스 검색창 입력 기능이 포함되어야 합니다."
    );
    // 4대 테마존 필터 탭 또는 필터 칩 확인
    assert.ok(
      modalContent.includes("faith") && modalContent.includes("hope") && modalContent.includes("love") && modalContent.includes("sharing"),
      "4대 테마존 필터 기능이 포함되어야 합니다."
    );
    // 7성사 필터 옵션 확인
    assert.ok(
      modalContent.includes("isSacrament") || modalContent.includes("7성사"),
      "7성사 부스 필터 기능이 포함되어야 합니다."
    );
    // 부스 선택 콜백 prop 확인
    assert.ok(
      modalContent.includes("onSelectBooth") || modalContent.includes("onSelect"),
      "부스 선택 콜백 인터페이스가 정의되어야 합니다."
    );
  });

  test("DoD 3: KakaoMapView 컴포넌트 내 모달 트리거 및 상태 연동 검증", () => {
    const mapViewPath = path.join(PROJECT_ROOT, "src/components/KakaoMapView.tsx");
    const mapContent = fs.readFileSync(mapViewPath, "utf-8");

    // BoothListModal import 확인
    assert.ok(
      mapContent.includes("BoothListModal"),
      "KakaoMapView.tsx에서 BoothListModal 컴포넌트를 import해야 합니다."
    );
    // 모달 오픈 트리거 버튼 존재 확인
    assert.ok(
      mapContent.includes("전체 부스 목록 보기") || mapContent.includes("부스 목록"),
      "테마존 바텀시트에 '전체 부스 목록 보기' 트리거 버튼이 존재해야 합니다."
    );
  });

  test("DoD 4: 부스 검색 및 필터링 순수 함수 로직 검증", async () => {
    const { OFFICIAL_ZONES } = await import("../src/data/officialBooths.ts");
    const allBoothsWithZone = OFFICIAL_ZONES.flatMap((zone) =>
      zone.booths.map((b) => ({
        ...b,
        zoneId: zone.id,
        zoneName: zone.koreanName,
      }))
    );

    assert.equal(allBoothsWithZone.length, 81);

    // 1. 7성사 필터
    const sacraments = allBoothsWithZone.filter((b) => b.isSacrament);
    assert.equal(sacraments.length, 7, "7성사 부스는 총 7개여야 함");

    // 2. 검색어 필터 (예: '수녀회')
    const sisters = allBoothsWithZone.filter((b) => b.name.includes("수녀회"));
    assert.ok(sisters.length >= 5, "수녀회 관련 부스가 검색되어야 함");

    // 3. 특정 존 필터 (예: 'love')
    const loveBooths = allBoothsWithZone.filter((b) => b.zoneId === "love");
    assert.equal(loveBooths.length, 31);
  });
});
