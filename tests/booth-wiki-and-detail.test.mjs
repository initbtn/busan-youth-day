import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("부스 구역 다이렉트 모달 및 독립 위키 상세/리뷰 페이지 계약 검증 (Issue #54)", () => {
  // 1. KakaoMapView 폴리곤 클릭 시 BoothListModal 다이렉트 트리거 계약
  test("DoD 1: KakaoMapView 폴리곤 터치 시 해당 존 BoothListModal 다이렉트 오픈 계약 검증", () => {
    const mapViewPath = path.join(process.cwd(), "src/components/KakaoMapView.tsx");
    assert.ok(fs.existsSync(mapViewPath), "KakaoMapView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(mapViewPath, "utf-8");

    // handleSelectBlock에서 setBoothModalInitialZone 및 setIsBoothModalOpen(true) 직접 트리거 확인
    assert.ok(
      content.includes("setBoothModalInitialZone(block.zoneId)") &&
      content.includes("setIsBoothModalOpen(true)"),
      "handleSelectBlock 함수 내에서 setBoothModalInitialZone 및 setIsBoothModalOpen(true)가 즉시 호출되어야 합니다."
    );
  });

  // 2. BoothListModal 부스 클릭 시 /booth/[id] 라우팅 계약
  test("DoD 2: BoothListModal 부스 클릭 시 /booth/[id] 라우팅 연동 계약 검증", () => {
    const modalPath = path.join(process.cwd(), "src/components/BoothListModal.tsx");
    assert.ok(fs.existsSync(modalPath), "BoothListModal.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(modalPath, "utf-8");

    assert.ok(
      content.includes("useRouter") || content.includes("/booth/"),
      "BoothListModal 내에 useRouter 또는 /booth/ 라우팅 경로가 포함되어야 합니다."
    );
  });

  // 3. /booth/[id] 라우트 파일 및 뷰 계약
  test("DoD 3: src/app/(tabs)/booth/[id]/page.tsx 라우트 파일 및 핵심 인터페이스 검증", () => {
    const boothPagePath = path.join(process.cwd(), "src/app/(tabs)/booth/[id]/page.tsx");
    assert.ok(fs.existsSync(boothPagePath), "src/app/(tabs)/booth/[id]/page.tsx 라우트 파일이 실재해야 합니다.");
    const content = fs.readFileSync(boothPagePath, "utf-8");

    assert.ok(content.includes("지도에서 위치 보기"), "지도에서 위치 보기 버튼이 포함되어야 합니다.");
    assert.ok(content.includes("/map"), "지도로 복귀하는 링크/경로가 포함되어야 합니다.");
    assert.ok(content.includes("목록으로"), "상단 목록으로 복귀 내비게이션이 포함되어야 합니다.");
  });

  // 4. 부스별 리뷰 및 방명록 로직 검증 (boothReviews.ts)
  test("DoD 4: 부스별 리뷰 로컬 캐싱 및 순수 로직 검증 (src/lib/boothReviews.ts)", async () => {
    const reviewModulePath = path.join(process.cwd(), "src/lib/boothReviews.ts");
    assert.ok(fs.existsSync(reviewModulePath), "src/lib/boothReviews.ts 파일이 존재해야 합니다.");

    const {
      getBoothReviews,
      saveBoothReview,
      formatRelativeTime,
    } = await import("../src/lib/boothReviews.ts");

    // Mock localStorage
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };

    const boothId = "faith-11";
    // 1. 초기 상태 빈 배열
    const initialReviews = getBoothReviews(boothId);
    assert.deepEqual(initialReviews, []);

    // 2. 리뷰 작성
    const newReview = saveBoothReview({
      boothId,
      userName: "부산청년",
      content: "성품성사 체험관에서 신부님과 나눈 대화가 정말 뜻깊었습니다!",
    });

    assert.ok(newReview.id);
    assert.equal(newReview.boothId, boothId);
    assert.equal(newReview.userName, "부산청년");

    // 3. 재조회 시 포함 확인
    const updatedReviews = getBoothReviews(boothId);
    assert.equal(updatedReviews.length, 1);
    assert.equal(updatedReviews[0].id, newReview.id);

    // 4. 다른 부스 ID와 격리 검증
    const otherReviews = getBoothReviews("love-13");
    assert.deepEqual(otherReviews, []);

    // 5. 상대 시간 포맷팅 검증
    assert.equal(typeof formatRelativeTime(new Date().toISOString()), "string");
  });

  // 5. officialBooths.ts 부스 조회 헬퍼 및 메타데이터 확장 검증
  test("DoD 5: officialBooths.ts findBoothById 헬퍼 및 위키 메타데이터 확장 검증", async () => {
    const { findBoothById, OFFICIAL_ZONES } = await import(
      "../src/data/officialBooths.ts"
    );

    assert.ok(typeof findBoothById === "function", "findBoothById 헬퍼 함수가 export되어야 합니다.");

    // 존재하는 부스 조회 (성품성사)
    const faith11 = findBoothById("faith-11");
    assert.ok(faith11, "faith-11 부스가 정상 조회되어야 합니다.");
    assert.equal(faith11.number, 11);
    assert.equal(faith11.zoneId, "faith");
    assert.equal(faith11.isSacrament, true);
    assert.equal(faith11.sacramentType, "성품성사");
    assert.ok(faith11.description && faith11.description.length > 0);
    assert.ok(faith11.operatingHours && faith11.operatingHours.length > 0);

    // 일반 부스 조회
    const sharing1 = findBoothById("sharing-1");
    assert.ok(sharing1, "sharing-1 부스가 정상 조회되어야 합니다.");
    assert.equal(sharing1.number, 1);
    assert.equal(sharing1.zoneId, "sharing");

    // 존재하지 않는 부스 방어
    const notFound = findBoothById("unknown-999");
    assert.equal(notFound, null, "존재하지 않는 부스는 null을 반환해야 합니다.");
  });
});
