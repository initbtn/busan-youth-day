import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("본대회 구역별 다차원 시간표 그리드, 지성소 일정 및 미사 가이드 검증 (Issue #50)", () => {
  const rootDir = process.cwd();
  const scheduleDataPath = path.join(rootDir, "src/data/schedule.ts");
  const holiesDataPath = path.join(rootDir, "src/data/holiesSchedule.ts");
  const holiesModalPath = path.join(rootDir, "src/components/HoliesScheduleModal.tsx");
  const massModalPath = path.join(rootDir, "src/components/MassGuideModal.tsx");
  const zoneGridPath = path.join(rootDir, "src/components/ZoneScheduleGridView.tsx");
  const homeTimelinePath = path.join(rootDir, "src/components/HomeTimelineView.tsx");

  test("DoD 1: 지성소(B구역) 5대 타임슬롯 데이터 무결성 검증 (PRD §3.3)", async () => {
    assert.ok(fs.existsSync(holiesDataPath), "src/data/holiesSchedule.ts가 존재해야 합니다.");
    const { HOLIES_SCHEDULE } = await import("../src/data/holiesSchedule.ts");

    assert.equal(Array.isArray(HOLIES_SCHEDULE), true, "HOLIES_SCHEDULE은 배열이어야 합니다.");
    assert.equal(HOLIES_SCHEDULE.length, 5, "지성소 타임슬롯은 5개여야 합니다.");

    const titles = HOLIES_SCHEDULE.map((s) => s.title);
    assert.ok(titles.some((t) => t.includes("침묵 중 성체조배")), "침묵 중 성체조배 슬롯 포함");
    assert.ok(titles.some((t) => t.includes("찬양 성시간 1")), "찬양 성시간 1 슬롯 포함");
    assert.ok(titles.some((t) => t.includes("육시경") || t.includes("낮기도")), "낮기도(육시경) 슬롯 포함");
    assert.ok(titles.some((t) => t.includes("찬양 성시간 2")), "찬양 성시간 2 슬롯 포함");
    assert.ok(titles.some((t) => t.includes("구시경") || t.includes("성체 강복")), "성체 강복 슬롯 포함");
  });

  test("DoD 2: B구역 지성소 전용 모달 및 미사 참여 3대 가이드 모달 컴포넌트 검증 (PRD §3.4)", () => {
    assert.ok(fs.existsSync(holiesModalPath), "src/components/HoliesScheduleModal.tsx가 존재해야 합니다.");
    const holiesContent = fs.readFileSync(holiesModalPath, "utf-8");
    assert.ok(holiesContent.includes("지성소") || holiesContent.includes("성체조배"), "지성소 모달 헤더 또는 안내 포함");
    assert.ok(holiesContent.includes("isOpen"), "모달 isOpen prop 지원");
    assert.ok(holiesContent.includes("onClose"), "모달 onClose callback 지원");

    assert.ok(fs.existsSync(massModalPath), "src/components/MassGuideModal.tsx가 존재해야 합니다.");
    const massContent = fs.readFileSync(massModalPath, "utf-8");
    // PRD §3.4 3대 수칙 검증
    assert.ok(massContent.includes("젊은이를 위한 기도") || massContent.includes("청소년 기도"), "수칙 1: 청소년/젊은이를 위한 기도");
    assert.ok(massContent.includes("봉헌") && massContent.includes("주머니"), "수칙 2: 봉헌 주머니 안내");
    assert.ok(massContent.includes("영성체") && massContent.includes("안내 봉사자"), "수칙 3: 영성체 이동 수칙");
    assert.ok(massContent.includes("isOpen") && massContent.includes("onClose"), "모달 isOpen/onClose 인터페이스 지원");
  });

  test("DoD 3: ZoneScheduleGridView 컴포넌트 및 구역별 컬럼 매트릭스 그리드 검증 (PRD §3.2)", () => {
    assert.ok(fs.existsSync(zoneGridPath), "src/components/ZoneScheduleGridView.tsx가 존재해야 합니다.");
    const gridContent = fs.readFileSync(zoneGridPath, "utf-8");

    // A구역, B구역, C구역 컬럼 확인
    assert.ok(gridContent.includes("A구역") && gridContent.includes("분수광장"), "A구역(분수광장) 컬럼 존재");
    assert.ok(gridContent.includes("B구역") && gridContent.includes("실내체육관"), "B구역(실내체육관) 컬럼 존재");
    assert.ok(gridContent.includes("C구역") && gridContent.includes("가족공원"), "C구역(가족공원 야외무대) 컬럼 존재");

    // 지성소 모달 및 미사 가이드 모달 트리거 액션 확인
    assert.ok(gridContent.includes("onOpenHolies") || gridContent.includes("Holies"), "지성소 일정 보기 트리거 연동");
    assert.ok(gridContent.includes("onOpenMassGuide") || gridContent.includes("MassGuide"), "미사 가이드 보기 트리거 연동");
  });

  test("DoD 4: HomeTimelineView 내 리스트/그리드 토글 스위처 및 모달 통합 검증", () => {
    assert.ok(fs.existsSync(homeTimelinePath), "src/components/HomeTimelineView.tsx가 존재해야 합니다.");
    const homeContent = fs.readFileSync(homeTimelinePath, "utf-8");

    assert.ok(homeContent.includes("ZoneScheduleGridView"), "ZoneScheduleGridView 임포트 및 렌더링");
    assert.ok(homeContent.includes("HoliesScheduleModal"), "HoliesScheduleModal 임포트 및 렌더링");
    assert.ok(homeContent.includes("MassGuideModal"), "MassGuideModal 임포트 및 렌더링");
    assert.ok(homeContent.includes("viewMode") || homeContent.includes("isGridView") || homeContent.includes("grid"), "시간표 뷰 토글 상태 존재");
  });
});
