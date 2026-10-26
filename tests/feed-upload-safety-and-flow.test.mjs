import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const communityPosts = await import("../src/lib/communityPosts.ts");
const createPostPayload =
  communityPosts.createPostPayload || communityPosts.default?.createPostPayload;

describe("피드 사진 의도 누락 방지 및 업로드 흐름 안정성 검증 (Issue #94)", () => {
  const feedViewPath = path.resolve("src/components/CommunityFeedView.tsx");

  test("DoD 1: 첨부 없이 본문만 작성한 글은 정상적으로 payload를 생성하고 게시된다", () => {
    const textOnlyPayload = createPostPayload({
      author: "마리아",
      parish: "중앙",
      role: "청년",
      content: "은혜로운 청년의 날입니다!",
      userId: "user-123",
    });

    assert.equal(textOnlyPayload.content, "은혜로운 청년의 날입니다!");
    assert.equal(textOnlyPayload.imageUrl, undefined);
    assert.equal(textOnlyPayload.mediaUrls, undefined);
    assert.ok(typeof textOnlyPayload.id === "string" && textOnlyPayload.id.length > 0);
  });

  test("DoD 2 & 3: CommunityFeedView.tsx 정적 계약 — 미디어 처리 중(processingMediaCount) 게시 잠금 및 로딩 플레이스홀더", () => {
    assert.ok(fs.existsSync(feedViewPath), "CommunityFeedView.tsx 파일이 존재해야 합니다.");
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // 1. processingMediaCount 상태 변수 존재
    assert.match(
      content,
      /const\s*\[processingMediaCount,\s*setProcessingMediaCount\]\s*=\s*useState\(0\)/,
      "미디어 처리 상태를 추적하는 processingMediaCount 상태가 선언되어야 합니다."
    );

    // 2. 게시하기 버튼 disabled 조건에 processingMediaCount 포함
    assert.match(
      content,
      /disabled=\{[\s\S]*?processingMediaCount\s*>\s*0/,
      "미디어 처리 중에는 게시하기 버튼이 비활성화되어야 합니다."
    );

    // 3. 처리 중 플레이스홀더 렌더링
    assert.match(
      content,
      /data-testid="processing-placeholder"/,
      "처리 중인 파일 자리에 로딩 플레이스홀더가 렌더링되어야 합니다."
    );
    assert.match(
      content,
      /사진 처리 중\.\.\.|미디어 처리 중\.\.\./,
      "처리 중 라벨이 버튼 또는 상태에 표시되어야 합니다."
    );
  });

  test("DoD 4: CommunityFeedView.tsx 정적 계약 — 업로드 진행률(uploadProgress) 및 순차 업로드 검증", () => {
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // 1. uploadProgress 상태 선언
    assert.match(
      content,
      /const\s*\[uploadProgress,\s*setUploadProgress\]\s*=\s*useState/,
      "업로드 진행률을 관리하는 uploadProgress 상태가 선언되어야 합니다."
    );

    // 2. 몇 장째/전체 업로드 진행률 텍스트 노출
    assert.match(
      content,
      /업로드 중 \(\$\{uploadProgress\.current\}\/\$\{uploadProgress\.total\}\)\.\.\./,
      "업로드 진행 중 (current/total) 인디케이터가 표시되어야 합니다."
    );

    // 3. 루프 내에서 업로드가 순차/모두 성공한 후 createPostPayload 호출
    assert.match(
      content,
      /for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*selectedFiles\.length;\s*i\+\+\)[\s\S]*?createPostPayload/,
      "모든 파일의 업로드가 완료된 이후에 createPostPayload가 호출되어야 합니다."
    );
  });

  test("DoD 5: CommunityFeedView.tsx 정적 계약 — 첨부 시도 후 0장(hasAttemptedAttachment) 게시 차단 및 안내", () => {
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // 1. hasAttemptedAttachment 상태 선언
    assert.match(
      content,
      /const\s*\[hasAttemptedAttachment,\s*setHasAttemptedAttachment\]\s*=\s*useState\(false\)/,
      "첨부 시도 여부를 추적하는 hasAttemptedAttachment 상태가 선언되어야 합니다."
    );

    // 2. 파일 선택 시 hasAttemptedAttachment = true
    assert.match(
      content,
      /setHasAttemptedAttachment\(true\)/,
      "파일 선택 핸들러에서 첨부 시도 상태를 true로 설정해야 합니다."
    );

    // 3. 첨부를 시도했으나 selectedFiles가 0개인 경우 게시 차단 및 버튼 비활성화
    assert.match(
      content,
      /hasAttemptedAttachment\s*&&\s*selectedFiles\.length\s*===\s*0/,
      "첨부 시도 후 0장인 상태를 감지하여 게시를 차단해야 합니다."
    );

    // 4. 첨부 취소(본문만 게시) 옵션 제공
    assert.match(
      content,
      /첨부 취소 \(본문만 게시\)/,
      "사용자가 사진 없이 본문만 등록할 수 있도록 첨부 취소 버튼을 제공해야 합니다."
    );

    // 5. 5개 초과 선택 시 조기 반환이 setHasAttemptedAttachment보다 먼저 위치하여 0장 고착 방지 (Review Finding 1)
    const limitBeforeAttempt = /const handleFileChange = async[\s\S]*?rawFiles\.length > 5[\s\S]*?setHasAttemptedAttachment\(true\)/.test(content);
    assert.ok(
      limitBeforeAttempt,
      "5개 초과 검증 및 early return이 setHasAttemptedAttachment(true)보다 선행되어야 합니다."
    );
  });

  test("DoD 6: CommunityFeedView.tsx 정적 계약 — 업로드 실패 시 등록 취소, 입력 유지 및 실패 원인 안내", () => {
    const content = fs.readFileSync(feedViewPath, "utf-8");

    // 1. 업로드 실패 시 alert 문구에 실패 파일명([${file.name}]) 및 원인 포함
    assert.match(
      content,
      /alert\(`사진\/동영상 업로드에 실패하여 게시글이 등록되지 않았습니다/,
      "업로드 실패 시 글 등록 취소 및 경고 alert를 띄워야 합니다."
    );
    assert.match(
      content,
      /throw new Error\(`\[\$\{file\.name\}\]/,
      "실패한 구체적 파일명을 에러 객체에 명시해야 합니다."
    );

    // 2. catch 블록에서 setIsPosting(false) 및 return으로 조기 종료 (글 생성 건너뜀)
    assert.match(
      content,
      /catch\s*\(err\)[\s\S]*?setIsPosting\(false\)[\s\S]*?return;/,
      "업로드 실패 시 글 저장을 진행하지 않고 상태를 복구한 채 return해야 합니다."
    );
  });
});
