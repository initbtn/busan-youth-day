import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("메인 홈 화면 행사 일정 정제, 쭈양이 캐릭터 배너 및 수호성인 명칭 정제 검증 (Issue #81)", async (t) => {
  const homeTimelinePath = path.resolve(process.cwd(), "src/components/HomeTimelineView.tsx");
  const homeContent = fs.readFileSync(homeTimelinePath, "utf-8");

  const layoutPath = path.resolve(process.cwd(), "src/app/(tabs)/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  await t.test("DoD 1: BYD 행사 일정에서 사목주간 및 WYD 탭이 제거되고 10.04 단일 안내로 정제되었는지 검증", () => {
    // 사목주간, WYD 탭 제거 여부
    assert.strictEqual(
      homeContent.includes("사목주간"),
      false,
      "HomeTimelineView에 '사목주간' 탭 텍스트가 남아있지 않아야 함"
    );
    assert.strictEqual(
      homeContent.includes("10.04"),
      true,
      "HomeTimelineView에 '10.04' 본대회 날짜 텍스트가 유지되어야 함"
    );
  });

  await t.test("DoD 2: 쭈양이 배너 타이틀이 '공식 캐릭터 쭈양이'로 변경되고 하단 저작권 표기 및 주제가 버튼 단일화 검증", () => {
    assert.strictEqual(
      homeContent.includes("공식 캐릭터 쭈양이"),
      true,
      "쭈양이 배너에 '공식 캐릭터 쭈양이' 타이틀이 포함되어야 함"
    );
    assert.strictEqual(
      homeContent.includes("공식 마스코트 쭈양이"),
      false,
      "이전 문구인 '공식 마스코트 쭈양이'가 배너 타이틀에 남아있지 않아야 함"
    );

    // 배너 하단 캐릭터 저작권 표기 확인 (배너 카드 내부 또는 바로 아래)
    assert.strictEqual(
      homeContent.includes("ⓒ 부산교구 청소년사목국 · 공식 캐릭터 쭈양이(JJUYANG!)"),
      true,
      "쭈양이 배너 영역에 공식 캐릭터 저작권 표기가 포함되어야 함"
    );

    // 배너 내부 링크 버튼 중 기존 '현장지도', '좌석 확인', '이모저모' 제거 및 '주제가' 버튼만 존재
    assert.strictEqual(
      homeContent.includes('href="/song"'),
      true,
      "쭈양이 배너에 주제가(/song) 바로가기 링크 버튼이 존재해야 함"
    );
    assert.strictEqual(
      homeContent.includes("주제가"),
      true,
      "주제가 버튼 텍스트가 존재해야 함"
    );
    // 기존 배너 내부 버튼 링크들 제거 확인
    const bannerSection = homeContent.slice(
      homeContent.indexOf("공식 캐릭터 쭈양이"),
      homeContent.indexOf("본당 공지사항 카드")
    );
    assert.strictEqual(
      bannerSection.includes('href="/map"'),
      false,
      "배너 내부에 /map 링크 버튼이 남아있지 않아야 함"
    );
    assert.strictEqual(
      bannerSection.includes('href="/seating"'),
      false,
      "배너 내부에 /seating 링크 버튼이 남아있지 않아야 함"
    );
    assert.strictEqual(
      bannerSection.includes('href="/feed"'),
      false,
      "배너 내부에 /feed 링크 버튼이 남아있지 않아야 함"
    );
  });

  await t.test("DoD 3: WYD 영적 순례 자료 카드에서 주제가 카드가 제외되고, '수호성인' 명칭에서 5인이 제거되었는지 검증", () => {
    const spiritualSection = homeContent.slice(
      homeContent.indexOf("2027 WYD 영적 순례 자료"),
      homeContent.indexOf("본대회 타임라인")
    );

    // 주제가 카드 제거 확인
    assert.strictEqual(
      spiritualSection.includes('href="/song"'),
      false,
      "WYD 영적 순례 자료 카드 영역에 /song(주제가) 카드가 없어야 함"
    );
    assert.strictEqual(
      spiritualSection.includes("하느님 나라에"),
      false,
      "WYD 영적 순례 자료 카드 영역에 '하느님 나라에' 카드가 없어야 함"
    );

    // 수호성인 명칭에서 '5인' 제거 확인
    assert.strictEqual(
      spiritualSection.includes("수호성인 5인"),
      false,
      "WYD 카드에 '수호성인 5인' 문구가 없어야 함"
    );
    assert.strictEqual(
      spiritualSection.includes("수호성인"),
      true,
      "WYD 카드에 '수호성인' 문구가 존재해야 함"
    );
  });

  await t.test("DoD 4: 레이아웃 푸터에서 기존 저작권 표기가 제거되었는지 검증", () => {
    assert.strictEqual(
      layoutContent.includes("ⓒ 부산교구 청소년사목국 · 2026 BYD"),
      false,
      "layout.tsx 푸터에서 기존 저작권 문구가 제거되어야 함"
    );
    assert.strictEqual(
      layoutContent.includes("공식 마스코트 쭈양이(JJUYANG!) · 문의: purunnamu@catb.kr"),
      false,
      "layout.tsx 푸터에서 기존 마스코트 문구가 제거되어야 함"
    );
  });
});
