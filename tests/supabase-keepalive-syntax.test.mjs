import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

describe("Supabase Keep-Alive 워크플로 YAML 구문 및 스키마 검증 (Issue #101)", () => {
  const workflowPath = path.resolve(".github/workflows/supabase-keepalive.yml");

  test("DoD 1: 워크플로 파일 존재 및 Python yaml 파서를 통한 무오류 파싱 검증", () => {
    assert.ok(fs.existsSync(workflowPath), "supabase-keepalive.yml 파일이 존재해야 합니다.");
    
    // python3 PyYAML safe_load를 통해 실제 파서 레벨에서 구문 오류가 없음을 증명
    let output;
    try {
      output = execSync(
        `python3 -c 'import yaml; yaml.safe_load(open("${workflowPath}"))'`,
        { encoding: "utf-8" }
      );
    } catch (error) {
      assert.fail(`YAML 파싱 중 구문 오류가 발생했습니다: ${error.stderr || error.message}`);
    }
  });

  test("DoD 2: 실패 시 텔레그램 알림 스텝의 필수 환경변수 및 가드 검증", () => {
    const content = fs.readFileSync(workflowPath, "utf-8");
    assert.match(content, /if:\s*failure\(\)/, "실패 시 발송 가드 if: failure()가 포함되어야 합니다.");
    assert.match(content, /TELEGRAM_BOT_TOKEN/, "TELEGRAM_BOT_TOKEN 시크릿을 참조해야 합니다.");
    assert.match(content, /TELEGRAM_CHAT_ID/, "TELEGRAM_CHAT_ID 시크릿을 참조해야 합니다.");
    assert.match(content, /busan-youth-day/, "실패 알림 본문에 busan-youth-day 프로젝트 식별자가 포함되어야 합니다.");
  });
});
