import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("일정표 시간 정정, 접수/셔틀 독립 안내 분리, C구역 세부공연 및 캐러셀 UI 검증 (Issue #70)", () => {
  const rootDir = process.cwd();
  const scheduleDataPath = path.join(rootDir, "src/data/schedule.ts");
  const stageDataPath = path.join(rootDir, "src/data/stageSchedule.ts");
  const holiesDataPath = path.join(rootDir, "src/data/holiesSchedule.ts");
  const holiesModalPath = path.join(rootDir, "src/components/HoliesScheduleModal.tsx");
  const massModalPath = path.join(rootDir, "src/components/MassGuideModal.tsx");
  const zoneGridPath = path.join(rootDir, "src/components/ZoneScheduleGridView.tsx");
  const homeTimelinePath = path.join(rootDir, "src/components/HomeTimelineView.tsx");

  test("DoD 1: A구역(10:00~15:00 부스) 및 C구역(11:00~14:45 야외무대) 올바른 시간 표기 반영 및 C구역 10개 공연팀 상세 일정 연동 검증", async () => {
    assert.ok(fs.existsSync(scheduleDataPath), "src/data/schedule.ts가 존재해야 합니다.");
    const { EVENT_SCHEDULE, MAIN_NOTICE_ITEMS } = await import("../src/data/schedule.ts");

    // 1. C구역 야외무대 공연 시간 11:00 ~ 14:45 검증
    const cItem = EVENT_SCHEDULE.find((s) => s.zone === "C");
    assert.ok(cItem, "C구역 야외무대 일정이 존재해야 합니다.");
    assert.ok(cItem.time.includes("11:00") && cItem.time.includes("14:45"), "C구역 시간은 11:00 ~ 14:45여야 합니다.");

    // 2. A구역 4대 테마존 축제 부스 시간 10:00 ~ 15:00 검증
    const aBoothItem = EVENT_SCHEDULE.find((s) => s.zone === "A" && s.title.includes("부스"));
    assert.ok(aBoothItem, "A구역 4대 테마존 축제 부스 일정이 존재해야 합니다.");
    assert.ok(aBoothItem.time.includes("10:00") && aBoothItem.time.includes("15:00"), "A구역 부스 시간은 10:00 ~ 15:00여야 합니다.");

    // 3. C구역 10개 공연팀 데이터 연동 확인
    assert.ok(fs.existsSync(stageDataPath), "src/data/stageSchedule.ts가 존재해야 합니다.");
    const { OUTDOOR_STAGE_PROGRAMS } = await import("../src/data/stageSchedule.ts");
    assert.equal(OUTDOOR_STAGE_PROGRAMS.length, 10, "C구역 야외무대 공연팀은 10개팀이어야 합니다.");

    const gridContent = fs.readFileSync(zoneGridPath, "utf-8");
    assert.ok(
      gridContent.includes("OUTDOOR_STAGE_PROGRAMS") || gridContent.includes("stageSchedule"),
      "ZoneScheduleGridView에서 OUTDOOR_STAGE_PROGRAMS를 임포트하여 C구역 상세 공연으로 연동해야 합니다."
    );
  });

  test("DoD 2: 본당 접수/패키지 수령 및 셔틀버스 운행 정보의 독립 안내 카드 분리 렌더링 검증", async () => {
    const { MAIN_NOTICE_ITEMS } = await import("../src/data/schedule.ts");
    assert.ok(Array.isArray(MAIN_NOTICE_ITEMS) || typeof MAIN_NOTICE_ITEMS === "object", "MAIN_NOTICE_ITEMS 또는 별도 독립 안내 데이터 정의 확인");

    const gridContent = fs.readFileSync(zoneGridPath, "utf-8");
    // 접수 및 패키지 수령 독립 안내
    assert.ok(gridContent.includes("접수") && gridContent.includes("패키지"), "독립 안내 카드에 접수 및 패키지 수령 포함");
    assert.ok(gridContent.includes("09:00 ~ 14:00"), "접수 시간 09:00 ~ 14:00 포함");

    // 셔틀버스 독립 안내
    assert.ok(gridContent.includes("셔틀") || gridContent.includes("셔틀버스"), "독립 안내 카드에 셔틀버스 포함");
    assert.ok(gridContent.includes("노포역") || gridContent.includes("15분 간격"), "노포역 셔틀버스 15분 간격 운행 안내 포함");
  });

  test("DoD 3: 상단 탭(A, B, C구역)과 동기화되는 구역별 캐러셀 슬라이더 UI 및 모바일 가시성 개선 검증", () => {
    assert.ok(fs.existsSync(zoneGridPath), "src/components/ZoneScheduleGridView.tsx가 존재해야 합니다.");
    const gridContent = fs.readFileSync(zoneGridPath, "utf-8");

    // 캐러셀 슬라이더 및 스크롤 스냅 검증
    assert.ok(
      gridContent.includes("snap-x") || gridContent.includes("scroll-smooth") || gridContent.includes("carousel"),
      "구역별 캐러셀 슬라이더 스냅 또는 스크롤 구조가 적용되어야 합니다."
    );

    // 구역별 탭 연동
    assert.ok(gridContent.includes("activeZoneTab") || gridContent.includes("activeTab"), "활성 구역 탭 상태 존재");
    assert.ok(gridContent.includes("A구역") && gridContent.includes("B구역") && gridContent.includes("C구역"), "A/B/C 구역 탭 지원");

    // 기존 모달 트리거 유지
    assert.ok(gridContent.includes("onOpenHolies"), "지성소 일정 보기 트리거 연동 유지");
    assert.ok(gridContent.includes("onOpenMassGuide"), "미사 가이드 보기 트리거 연동 유지");
  });

  test("DoD 4: HomeTimelineView 내 통합 및 기존 모달 연동 호환성 검증", () => {
    assert.ok(fs.existsSync(homeTimelinePath), "src/components/HomeTimelineView.tsx가 존재해야 합니다.");
    const homeContent = fs.readFileSync(homeTimelinePath, "utf-8");

    assert.ok(homeContent.includes("ZoneScheduleGridView"), "ZoneScheduleGridView 임포트 및 렌더링 유지");
    assert.ok(homeContent.includes("HoliesScheduleModal"), "HoliesScheduleModal 임포트 및 렌더링 유지");
    assert.ok(homeContent.includes("MassGuideModal"), "MassGuideModal 임포트 및 렌더링 유지");
  });
});
