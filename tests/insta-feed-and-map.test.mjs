import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

describe("지도 핀 간소화, 부스 상세 직결, 인스타그램 스타일 피드 및 모달 업로드 검증 (Issue #59)", () => {
  it("DoD 1: 카카오 지도 핀 간소화 및 길안내 버튼 제거, 부스 상세 링크 탑재 검증", () => {
    const kakaoMapPath = path.join(projectRoot, "src/components/KakaoMapView.tsx");
    const content = fs.readFileSync(kakaoMapPath, "utf-8");

    // 카카오맵 길안내 버튼 제거 확인
    assert.ok(
      !content.includes("handleOpenKakaoNavi"),
      "외부 카카오맵 길안내 버튼 핸들러가 제거되어야 함"
    );
    assert.ok(
      !content.includes("카카오맵 길안내"),
      "'카카오맵 길안내' 텍스트 버튼이 제거되어야 함"
    );

    // 부스 상세 보기 버튼 탑재 확인
    assert.ok(
      content.includes("부스 상세") || content.includes("booth/"),
      "핀 터치 시 부스 상세페이지로 이동하는 동선이 제공되어야 함"
    );
  });

  it("DoD 2: /map 부스 탭 81개 리스트에서 /booth/[id] 라우팅 링크 연동 검증", () => {
    const mapPagePath = path.join(projectRoot, "src/app/(tabs)/map/page.tsx");
    const content = fs.readFileSync(mapPagePath, "utf-8");

    // 81개 부스 리스트에서 Link를 통한 /booth/ 이동 확인
    assert.ok(
      content.includes("Link") && content.includes("/booth/"),
      "/map 페이지의 4대 테마존 부스 목록에서 /booth/[id]로 이동하는 Link가 연결되어야 함"
    );
  });

  it("DoD 3: 소통피드 목록에서 멀티이미지 첫 장 대표 노출 및 다중 이미지 뱃지 검증", () => {
    const feedPath = path.join(projectRoot, "src/components/CommunityFeedView.tsx");
    const content = fs.readFileSync(feedPath, "utf-8");

    // 2x2 분할 그리드 제거 확인
    assert.ok(
      !content.includes("grid-cols-2 gap-1 w-full aspect-video"),
      "올드한 페이스북형 2x2 분할 그리드가 제거되어야 함"
    );

    // 멀티이미지 뱃지 또는 인디케이터 표시 확인
    assert.ok(
      content.includes("mediaList.length > 1") || content.includes("mediaUrls.length > 1"),
      "멀티이미지 여부 판별 로직이 존재해야 함"
    );
  });

  it("DoD 4: 소통피드 인스타그램 스타일(프로필/본문/댓글/좋아요) 및 모달형 업로드 검증", () => {
    const feedPath = path.join(projectRoot, "src/components/CommunityFeedView.tsx");
    const content = fs.readFileSync(feedPath, "utf-8");

    // 모달형 업로드 도입 확인 (인라인 대형 폼 제거 및 모달 트리거)
    assert.ok(
      content.includes("isUploadModalOpen") || content.includes("showUploadModal") || content.includes("isPostModalOpen"),
      "글쓰기 업로드 모달 상태가 정의되어 있어야 함"
    );

    // 댓글 입력 및 인터랙션 인터페이스 확인
    assert.ok(
      content.includes("comments") || content.includes("handleComment") || content.includes("댓글"),
      "댓글 표시 및 작성 인터페이스가 포함되어야 함"
    );
  });

  it("DoD 5: 모달 배경 스크롤 차단 및 전역 스크롤바 숨김 CSS 검증", () => {
    const globalsCssPath = path.join(projectRoot, "src/app/globals.css");
    const cssContent = fs.readFileSync(globalsCssPath, "utf-8");

    // 전역 스크롤바 숨김 규칙 확인
    assert.ok(
      cssContent.includes("scrollbar-width: none") || cssContent.includes("::-webkit-scrollbar"),
      "전역 CSS에 스크롤바 숨김(scrollbar-width: none 또는 ::-webkit-scrollbar)이 설정되어야 함"
    );
  });
});
