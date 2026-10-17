import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("GitHub Actions Cron Keep-Alive 및 E2E 테스트 분리 검증 (Issue #97)", () => {
  test("DoD 1: Supabase Keep-Alive Cron 워크플로(.github/workflows/supabase-keepalive.yml) 구성 검증", () => {
    const keepalivePath = path.resolve(".github/workflows/supabase-keepalive.yml");
    assert.ok(
      fs.existsSync(keepalivePath),
      "supabase-keepalive.yml 워크플로 파일이 존재해야 합니다."
    );
    const content = fs.readFileSync(keepalivePath, "utf-8");

    // 스케줄(cron) 및 수동(workflow_dispatch) 트리거 확인
    assert.match(content, /schedule:\s*-\s*cron:/, "schedule cron 설정이 포함되어야 합니다.");
    assert.match(content, /workflow_dispatch:/, "workflow_dispatch 수동 트리거가 지원되어야 합니다.");

    // 7일 비활성화 방지를 위한 3일 이하 주기 확인 (e.g. */3)
    assert.match(content, /\*\/3|\*\/2|\*\/4/, "3~4일 이하 주기 cron 표현식이 포함되어야 합니다.");

    // Supabase URL 및 anon key 기반 API 호출 확인
    assert.match(content, /NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL/, "Supabase URL 환경변수를 참조해야 합니다.");
    assert.match(content, /NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY/, "Supabase Anon Key 환경변수를 참조해야 합니다.");

    // Finding 1 개선 검증: 비정상 상태 시 exit 1 (fail-fast) 및 200번대 응답 검증
    assert.match(content, /exit 1/, "비정상 응답 또는 오류 발생 시 exit 1로 실패해야 합니다.");
    assert.match(content, /posts\?select=id|health/, "실제 쿼리 또는 헬스체크 엔드포인트를 호출해야 합니다.");
  });

  test("DoD 2: e2e.yml 워크플로에서 일반 push/PR 시 단위 테스트 상시 실행 및 E2E 실행 조건 분리 검증", () => {
    const e2ePath = path.resolve(".github/workflows/e2e.yml");
    assert.ok(fs.existsSync(e2ePath), "e2e.yml 워크플로 파일이 존재해야 합니다.");
    const content = fs.readFileSync(e2ePath, "utf-8");

    // 단위 테스트는 상시 실행
    assert.match(content, /npm test/, "단위 테스트(npm test) 실행 스텝이 유지되어야 합니다.");

    // E2E 테스트는 수동 트리거(workflow_dispatch) 또는 운영/디버그 조건에서만 실행되도록 분리
    assert.match(content, /workflow_dispatch/, "수동 디버그 및 검증을 위한 workflow_dispatch가 활성화되어야 합니다.");
    assert.match(
      content,
      /github\.event_name\s*==\s*'workflow_dispatch'/,
      "Playwright E2E 실행 스텝 또는 Job에 workflow_dispatch 조건부 가드가 적용되어야 합니다."
    );

    // Finding 2 개선 검증: run_e2e 입력 파라미터 반영 확인
    assert.match(
      content,
      /run_e2e/,
      "run_e2e 입력 파라미터가 조건문에 연동되어야 합니다."
    );
  });

  test("DoD 3: playwright.config.ts 최적화 및 e2e 네비게이션 스펙 최신화 검증", () => {
    const playwrightConfigPath = path.resolve("playwright.config.ts");
    const configContent = fs.readFileSync(playwrightConfigPath, "utf-8");

    // CI 환경에서 1개 실패 시 90초씩 소요되던 retries를 1회로 단축하여 타임아웃 방어
    assert.match(
      configContent,
      /retries:\s*process\.env\.CI\s*\?\s*1\s*:\s*0/,
      "CI 환경 retries는 1회로 최적화되어야 합니다."
    );

    const navSpecPath = path.resolve("e2e/app-router-navigation.spec.ts");
    const navContent = fs.readFileSync(navSpecPath, "utf-8");

    // 구 스탬프 투어 및 '미사좌석' 문구 제거 확인
    assert.ok(
      !navContent.includes("text=공식 부스 스탬프 투어"),
      "구 스탬프 투어 관련 구문이 제거되어야 합니다."
    );
    assert.ok(
      !navContent.includes("미사좌석"),
      "구 미사좌석 탭 명칭 대신 최신 미사안내 명칭이 적용되어야 합니다."
    );
    assert.match(navContent, /미사안내/, "최신 탭바 명칭인 '미사안내'가 매칭되어야 합니다.");
  });
});
