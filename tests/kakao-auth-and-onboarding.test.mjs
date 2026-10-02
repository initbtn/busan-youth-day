import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

test("카카오 SSO 간편 인증 및 온보딩 순례 그룹 무작위 배정 계약 검증 (Issue #18)", async (t) => {
  await t.test("DoD 1: src/data/saints.ts 성인 명단 및 무작위 순례 그룹 배정 함수 검증", async () => {
    const saintsPath = path.join(ROOT_DIR, "src/data/saints.ts");
    assert.ok(fs.existsSync(saintsPath), "src/data/saints.ts 파일이 존재해야 합니다.");

    const saintsModule = await import(path.join(ROOT_DIR, "src/data/saints.ts"));
    assert.ok(Array.isArray(saintsModule.PILGRIM_SAINTS), "PILGRIM_SAINTS 배열이 정의되어 있어야 합니다.");
    assert.ok(saintsModule.PILGRIM_SAINTS.length >= 10, "순례 그룹 성인은 최소 10명 이상 등록되어야 합니다.");

    // 성인 데이터 구조 검증
    for (const saint of saintsModule.PILGRIM_SAINTS) {
      assert.ok(saint.id, "성인 id가 존재해야 합니다.");
      assert.ok(saint.name, "성인 name이 존재해야 합니다.");
      assert.ok(saint.groupName, "순례 그룹명(groupName)이 존재해야 합니다.");
    }

    // 무작위 배정 함수 검증
    assert.equal(typeof saintsModule.getRandomPilgrimSaint, "function", "getRandomPilgrimSaint 함수가 구현되어 있어야 합니다.");
    const randomSaint = saintsModule.getRandomPilgrimSaint();
    assert.ok(randomSaint && randomSaint.name, "무작위 성인이 정상 반환되어야 합니다.");
    assert.ok(saintsModule.PILGRIM_SAINTS.some((s) => s.id === randomSaint.id), "반환된 성인은 목록 내에 존재해야 합니다.");
  });

  await t.test("DoD 2: src/lib/auth/kakao.ts 및 /api/auth/callback/kakao 엔드포인트 계약 검증", async () => {
    const kakaoAuthPath = path.join(ROOT_DIR, "src/lib/auth/kakao.ts");
    assert.ok(fs.existsSync(kakaoAuthPath), "src/lib/auth/kakao.ts 파일이 존재해야 합니다.");

    const callbackRoutePath = path.join(ROOT_DIR, "src/app/api/auth/callback/kakao/route.ts");
    assert.ok(fs.existsSync(callbackRoutePath), "src/app/api/auth/callback/kakao/route.ts 파일이 존재해야 합니다.");

    const callbackContent = fs.readFileSync(callbackRoutePath, "utf-8");
    assert.ok(callbackContent.includes("exchangeCodeForSession"), "인가 코드를 세션으로 교환해야 합니다.");
    assert.ok(callbackContent.includes("createClient"), "Supabase 클라이언트를 초기화해야 합니다.");

    const kakaoAuthContent = fs.readFileSync(kakaoAuthPath, "utf-8");
    assert.ok(kakaoAuthContent.includes("signInWithKakao"), "signInWithKakao 함수가 정의되어 있어야 합니다.");
    assert.ok(kakaoAuthContent.includes("provider: \"kakao\"") || kakaoAuthContent.includes("provider: 'kakao'"), "kakao provider가 설정되어야 합니다.");
    assert.ok(kakaoAuthContent.includes("/api/auth/callback/kakao"), "콜백 경로가 /api/auth/callback/kakao 로 지정되어야 합니다.");
  });

  await t.test("DoD 3: UserContext 및 OnboardingModal 메타데이터 저장 및 성인 순례 그룹 연동 검증", async () => {
    const modalPath = path.join(ROOT_DIR, "src/components/OnboardingModal.tsx");
    assert.ok(fs.existsSync(modalPath), "OnboardingModal.tsx 파일이 존재해야 합니다.");

    const modalContent = fs.readFileSync(modalPath, "utf-8");
    assert.ok(modalContent.includes("signInWithKakao"), "OnboardingModal에서 카카오 로그인을 호출해야 합니다.");
    assert.ok(modalContent.includes("약관") || modalContent.includes("개인정보"), "약관 동의 단계가 포함되어야 합니다.");
    assert.ok(modalContent.includes("getRandomPilgrimSaint") || modalContent.includes("saints"), "성인 무작위 배정 로직이 연동되어야 합니다.");

    const userContextPath = path.join(ROOT_DIR, "src/context/UserContext.tsx");
    const userContextContent = fs.readFileSync(userContextPath, "utf-8");
    assert.ok(userContextContent.includes("pilgrimSaint") || userContextContent.includes("saintGroup") || userContextContent.includes("pilgrimGroup"), "UserProfile에 성인 순례 그룹 필드가 존재해야 합니다.");
  });
});
