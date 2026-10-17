import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("미들웨어 장애 격리(Graceful Degradation) 및 텔레그램 알림 연동 검증 (Issue #99)", () => {
  test("DoD 1: src/lib/supabase/middleware.ts 에러 격리(try...catch) 및 타임아웃 가드 검증", () => {
    const middlewarePath = path.resolve("src/lib/supabase/middleware.ts");
    assert.ok(fs.existsSync(middlewarePath), "middleware.ts 파일이 존재해야 합니다.");
    const content = fs.readFileSync(middlewarePath, "utf-8");

    // getUser 호출부를 try-catch로 감싸야 함
    assert.match(
      content,
      /try\s*\{[\s\S]*?getUser[\s\S]*?\}\s*catch/,
      "supabase.auth.getUser() 호출부는 try...catch로 예외 격리되어야 합니다."
    );

    // 타임아웃 가드 (Promise.race 또는 AbortController/타임아웃)
    assert.match(
      content,
      /Promise\.race|timeout|setTimeout/,
      "Supabase 무한 지연을 방지하기 위한 타임아웃 가드가 포함되어야 합니다."
    );
  });

  test("DoD 2: src/lib/telegram/alert.ts 프로젝트 식별 포맷 텔레그램 알림 유틸 검증", () => {
    const alertUtilPath = path.resolve("src/lib/telegram/alert.ts");
    assert.ok(fs.existsSync(alertUtilPath), "src/lib/telegram/alert.ts 파일이 존재해야 합니다.");
    const content = fs.readFileSync(alertUtilPath, "utf-8");

    // sendTelegramAlert 함수 노출 확인
    assert.match(content, /export (async )?function sendTelegramAlert/, "sendTelegramAlert 함수가 export되어야 합니다.");

    // 멀티 프로젝트 식별자 필수 확인
    assert.match(
      content,
      /busan-youth-day/,
      "텔레그램 메시지 헤더에 [busan-youth-day] 프로젝트 식별자가 포함되어야 합니다."
    );
  });

  test("DoD 3: supabase-keepalive.yml 실패 시 텔레그램 알림 발송 스텝 검증", () => {
    const keepalivePath = path.resolve(".github/workflows/supabase-keepalive.yml");
    assert.ok(fs.existsSync(keepalivePath), "supabase-keepalive.yml 워크플로가 존재해야 합니다.");
    const content = fs.readFileSync(keepalivePath, "utf-8");

    // if: failure() 가드 확인
    assert.match(content, /if:\s*failure\(\)/, "실패 시 발송 가드 if: failure()가 포함되어야 합니다.");

    // 텔레그램 봇 토큰 및 챗 ID 환경변수 참조 확인
    assert.match(content, /TELEGRAM_BOT_TOKEN/, "TELEGRAM_BOT_TOKEN 시크릿을 참조해야 합니다.");
    assert.match(content, /TELEGRAM_CHAT_ID/, "TELEGRAM_CHAT_ID 시크릿을 참조해야 합니다.");
    assert.match(content, /busan-youth-day/, "실패 알림 본문에 busan-youth-day 프로젝트 식별자가 포함되어야 합니다.");
  });
});
