import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = global.localStorage;
}

describe("마이페이지 프로필 수정, 청년의 날 모둠원 조회, 내 게시글/댓글 관리 및 답글 연동 (Issue #58)", () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  test("DoD 1: 마이페이지 라우트/컴포넌트 실재 및 이름, 프로필 사진, 세례명 수정 검증", async () => {
    const pagePath = path.resolve("src/app/(tabs)/profile/page.tsx");
    const componentPath = path.resolve("src/components/MyProfileView.tsx");
    assert.ok(fs.existsSync(pagePath), "src/app/(tabs)/profile/page.tsx 라우트가 존재해야 합니다.");
    assert.ok(fs.existsSync(componentPath), "src/components/MyProfileView.tsx 컴포넌트가 존재해야 합니다.");

    const pageContent = fs.readFileSync(pagePath, "utf-8");
    assert.match(pageContent, /MyProfileView/, "ProfilePage는 MyProfileView를 렌더링해야 합니다.");

    const componentContent = fs.readFileSync(componentPath, "utf-8");
    assert.match(componentContent, /baptismalName/i, "세례명(baptismalName) 입력/수정 지원 필드가 포함되어야 합니다.");
    assert.match(componentContent, /avatarUrl/i, "프로필 아바타(avatarUrl) 변경/업로드 로직이 포함되어야 합니다.");
    assert.match(componentContent, /setUserProfile/, "UserContext의 프로필 갱신 함수가 연결되어야 합니다.");
  });

  test("DoD 2: 2027 서울 WYD 5인 수호성인 청년의 날 모둠 및 모둠원 명단 조회 모듈 검증", async () => {
    const { getPilgrimSaintById, PILGRIM_SAINTS } = await import("../src/data/saints.ts");
    const { getYouthGroupMembers, YOUTH_GROUP_MEMBERS } = await import("../src/data/youthGroupMembers.ts");

    assert.equal(PILGRIM_SAINTS.length, 5, "2027 WYD 5인 수호성인이 정의되어 있어야 합니다.");
    
    // 5인 성인 각각에 대해 모둠원 조회가 가능해야 함
    PILGRIM_SAINTS.forEach((saint) => {
      const members = getYouthGroupMembers(saint.id);
      assert.ok(Array.isArray(members), `${saint.name} 모둠의 모둠원 목록이 배열이어야 합니다.`);
      assert.ok(members.length > 0, `${saint.name} 모둠에 배정된 청년(모둠원)이 최소 1명 이상 존재해야 합니다.`);
      members.forEach((m) => {
        assert.ok(m.name, "모둠원 이름이 있어야 합니다.");
        assert.ok(m.parish, "모둠원 본당 정보가 있어야 합니다.");
        assert.ok(m.saintId === saint.id, "모둠원 saintId가 일치해야 합니다.");
      });
    });
  });

  test("DoD 3: 내가 작성한 소통피드 게시글 및 첨부 사진 목록 조회, 본문/사진 수정 및 삭제 검증", async () => {
    const {
      createPostPayload,
      cachePosts,
      loadCachedPosts,
      updateCommunityPost,
      deleteCommunityPost,
      getPostsByAuthorOrUser,
    } = await import("../src/lib/communityPosts.ts");

    // 1. 게시글 생성
    const post1 = createPostPayload({
      author: "김마리아",
      parish: "하단",
      role: "청년",
      content: "첫 번째 게시글 작성",
      userId: "user-123",
      imageUrl: "https://example.com/photo1.jpg",
    });

    const post2 = createPostPayload({
      author: "박요셉",
      parish: "남천",
      role: "청년",
      content: "다른 사람의 게시글",
      userId: "user-456",
    });

    cachePosts([post1, post2]);

    // 2. 내 게시글 필터링
    const myPosts = getPostsByAuthorOrUser([post1, post2], "user-123", "김마리아");
    assert.equal(myPosts.length, 1);
    assert.equal(myPosts[0].id, post1.id);

    // 3. 내 게시글 수정
    const updated = updateCommunityPost([post1, post2], post1.id, {
      content: "수정된 첫 번째 게시글 본문",
      imageUrl: "https://example.com/photo-updated.jpg",
    });
    const foundUpdated = updated.find((p) => p.id === post1.id);
    assert.equal(foundUpdated.content, "수정된 첫 번째 게시글 본문");
    assert.equal(foundUpdated.imageUrl, "https://example.com/photo-updated.jpg");

    // 4. 내 게시글 삭제
    const remaining = deleteCommunityPost(updated, post1.id);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, post2.id);
  });

  test("DoD 4: 내가 작성한 댓글 모아보기 및 게시글 딥링크 연동 정보 검증", async () => {
    const {
      cacheComments,
      loadCachedComments,
      getMyComments,
    } = await import("../src/lib/communityPosts.ts");

    const commentsMap = {
      "p-1": [
        {
          id: "c-1",
          postId: "p-1",
          author: "김마리아",
          parish: "하단",
          role: "청년",
          content: "은혜로운 피드네요!",
          createdAt: new Date().toISOString(),
        },
        {
          id: "c-2",
          postId: "p-1",
          author: "이안나",
          parish: "중앙",
          role: "청년",
          content: "저도 함께 기도합니다.",
          createdAt: new Date().toISOString(),
        },
      ],
      "p-2": [
        {
          id: "c-3",
          postId: "p-2",
          author: "김마리아",
          parish: "하단",
          role: "청년",
          content: "스탬프 투어 파이팅입니다!",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    cacheComments(commentsMap);

    const myComments = getMyComments(commentsMap, "김마리아");
    assert.equal(myComments.length, 2, "김마리아가 작성한 댓글 2개가 추출되어야 합니다.");
    assert.ok(myComments.some((c) => c.postId === "p-1" && c.content === "은혜로운 피드네요!"));
    assert.ok(myComments.some((c) => c.postId === "p-2" && c.content === "스탬프 투어 파이팅입니다!"));
  });

  test("DoD 5: UI 용어 정제 (순례자 -> 참가 청년, 순례 그룹 -> 청년의 날 모둠) 일관성 검증", async () => {
    const layoutPath = path.resolve("src/app/(tabs)/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    assert.match(layoutContent, /\/profile/, "하단 탭 또는 헤더에 마이페이지(/profile) 접근 링크가 존재해야 합니다.");
    
    const componentPath = path.resolve("src/components/MyProfileView.tsx");
    const profileContent = fs.readFileSync(componentPath, "utf-8");
    assert.ok(!profileContent.includes("순례자 등록"), "용어 정제: '순례자 등록' 대신 '참가자 등록' 또는 '프로필' 용어를 사용해야 합니다.");
    assert.match(profileContent, /청년의 날 모둠|모둠원/, "청년의 날 모둠 및 모둠원 명칭이 올바르게 반영되어야 합니다.");
  });
});
