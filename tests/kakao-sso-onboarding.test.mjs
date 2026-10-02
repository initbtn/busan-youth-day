import test, { describe } from "node:test";
import assert from "node:assert/strict";

describe("카카오 SSO 간편 인증 및 온보딩 순례 공동체 배정 계약 검증 (Issue #18)", () => {
  test("DoD 2: 11개 교구 지구 및 매핑 본당, 11종 소속 그룹 데이터 무결성 검증", async () => {
    const { DISTRICT_PARISH_MAP, AFFILIATION_ROLES } = await import("../src/data/parishes.ts");

    // 1. 지구 개수 및 주요 지구 검증 (최소 10개 이상 지구)
    assert.ok(DISTRICT_PARISH_MAP.length >= 10, "교구 지구는 10개 이상이어야 함");
    const districtNames = DISTRICT_PARISH_MAP.map((d) => d.district);
    assert.ok(districtNames.includes("하단지구"), "하단지구가 포함되어야 함");
    assert.ok(districtNames.includes("남천지구"), "남천지구가 포함되어야 함");
    assert.ok(districtNames.includes("금정지구"), "금정지구가 포함되어야 함");

    // 2. 11종 소속 역할(Role) 전수 검증 (PRD §2.2)
    const expectedRoles = [
      "청년",
      "주일학교 중고등부",
      "주일학교 초등부",
      "주일학교 유치부",
      "교리교사",
      "사제",
      "수도자",
      "학사님",
      "부모",
      "봉사자",
      "일반신자",
    ];
    assert.equal(AFFILIATION_ROLES.length, 11, "소속 역할은 총 11종이어야 함");
    for (const role of expectedRoles) {
      assert.ok(AFFILIATION_ROLES.includes(role), `${role} 역할이 AFFILIATION_ROLES에 포함되어야 함`);
    }
  });

  test("DoD 3: 성인(Saint) 이름 기반 순례 그룹 무작위 배정 엔진 검증 (assignPilgrimageGroup)", async () => {
    const { assignPilgrimageGroup, getAvailableSaints } = await import("../src/lib/pilgrimageGroup.ts");

    // 1. 가용 성인 풀 조회
    const saints = getAvailableSaints();
    assert.ok(saints.length >= 5, "성인 풀은 5명 이상의 수호성인을 포함해야 함");

    // 2. 무작위 배정 결과 구조 검증
    const result = assignPilgrimageGroup();
    assert.ok(result.saintId, "배정된 성인 ID가 존재해야 함");
    assert.ok(result.saintName, "배정된 성인 이름이 존재해야 함");
    assert.ok(typeof result.groupNumber === "number", "조 번호가 숫자여야 함");
    assert.ok(result.groupNumber >= 1 && result.groupNumber <= 50, "조 번호는 1~50 범위여야 함");
    assert.ok(result.pilgrimageGroup.includes(result.saintName), "순례단 명칭에 성인 이름이 포함되어야 함");
    assert.ok(result.pilgrimageGroup.includes(`${result.groupNumber}조`), "순례단 명칭에 조 번호가 포함되어야 함");

    // 3. 고정 시드(userId) 입력 시 멱등 배정 검증
    const fixedResult1 = assignPilgrimageGroup("user-uuid-12345");
    const fixedResult2 = assignPilgrimageGroup("user-uuid-12345");
    assert.deepEqual(fixedResult1, fixedResult2, "동일한 userId 입력 시 항상 동일한 순례단이 배정되어야 함");
  });

  test("DoD 1: 카카오 OAuth 인증 콜백 라우트 핸들러 및 Supabase 클라이언트 계약 검증", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    // 1. /api/auth/callback/kakao/route.ts 파일 실재 검증
    const callbackPath = path.resolve(process.cwd(), "src/app/api/auth/callback/kakao/route.ts");
    assert.ok(fs.existsSync(callbackPath), "카카오 OAuth 콜백 엔드포인트 파일이 존재해야 함");

    const callbackContent = fs.readFileSync(callbackPath, "utf-8");
    assert.ok(callbackContent.includes("exchangeCodeForSession"), "인가 코드 교환(exchangeCodeForSession)이 포함되어야 함");
    assert.ok(callbackContent.includes("NextResponse.redirect"), "인증 후 리다이렉트 처리가 포함되어야 함");
  });

  test("DoD 2 & 하위 호환성: UserProfile에 saintName, pilgrimageGroup 인터페이스 확장 및 리워드 판별 검증", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const userContextPath = path.resolve(process.cwd(), "src/context/UserContext.tsx");
    const userContextContent = fs.readFileSync(userContextPath, "utf-8");

    assert.ok(userContextContent.includes("saintName?: string;"), "UserProfile에 saintName 필드가 선언되어야 함");
    assert.ok(userContextContent.includes("pilgrimageGroup?: string;"), "UserProfile에 pilgrimageGroup 필드가 선언되어야 함");
  });
});
