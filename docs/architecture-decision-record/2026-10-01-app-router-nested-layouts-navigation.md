# 2026-10-01 모바일 하단 탭 네비게이션을 위한 Next.js App Router Nested Layouts 채택

- **상태**: Accepted (결정됨)
- **날짜**: 2026-10-01
- **결정자**: 사용자(PO), Antigravity

---

## 컨텍스트 및 문제 제기

현재 웹앱은 프레임워크로 Next.js 14 App Router를 사용하고 있으나, 실제 화면 구현은 단일 루트 엔드포인트(`src/app/page.tsx`) 내에서 `useState<"home" | "stamp" | "feed" | "info" | "seating">("home")` 메모리 상태로 5대 탭 컴포넌트를 단순 조건부 렌더링하고 있다.

이로 인해 다음과 같은 심각한 UX 결함 및 구조적 한계가 발생한다:
1. **새로고침 시 홈 리셋**: 커뮤니티 피드나 스탬프 투어 탭을 보다가 브라우저를 새로고침(F5)하면 URL이 여전히 `/`이므로 항상 초기 `home` 탭으로 튕긴다.
2. **모바일 뒤로가기 제스처 오류**: 모바일 PWA 환경에서 뒤로가기 제스처 시 이전 탭으로 이동하지 못하고 웹앱 외부로 이탈한다.
3. **딥링크(Deep Link) 불가**: 특정 탭(예: 공지 안내, 스탬프 북)으로의 직접 링크 공유가 불가능하다.

---

## 결정

GitHub 인기 오픈소스 생태계(Dub.co, Cal.com, shadcn/taxonomy 등) 및 Next.js 표준 패턴에 따라, **Next.js App Router의 Route Groups `(tabs)`와 중첩 레이아웃(Nested Layouts) 아키텍처를 전면 채택**한다.

1. **디렉터리 구조**:
   - `src/app/(tabs)/layout.tsx`: 공통 헤더 띠 배너, 하단 5대 고정 네비게이션 탭 바, 공통 모달 컨테이너를 배치하여 영구 보존(Persistent Layout)
   - `src/app/(tabs)/page.tsx` (또는 `/home`): 홈 타임라인 및 마스코트 메인 화면
   - `src/app/(tabs)/stamp/page.tsx`: 스탬프 북 및 보물찾기 뷰
   - `src/app/(tabs)/feed/page.tsx`: 순례자 소통 및 인증샷 피드 뷰
   - `src/app/(tabs)/seating/page.tsx`: 실내체육관 미사 좌석배치도 뷰
   - `src/app/(tabs)/info/page.tsx`: 셔틀버스 및 행사 종합 안내 뷰
2. **상태 관리**:
   - URL 패스(`usePathname`)를 기반으로 현재 활성화된 하단 탭 아이콘 스타일을 동기화한다.
   - PWA 모바일 뒤로가기 시 이전 서브 경로로 부드럽게 네비게이션되도록 Next.js `Link` 및 `useRouter`를 사용한다.

---

## 결과 및 트레이드오프

### 얻는 것 (Pros)
- **완벽한 새로고침 보존**: 어느 탭에서 F5를 누르거나 브라우저 탭을 닫았다 다시 열어도 보고 있던 탭 페이지가 그대로 복원된다.
- **네이티브 앱급 뒤로가기 탐색**: 브라우저 히스토리 스택이 페이지 단위로 적재되어 모바일 제스처 내비게이션이 자연스럽게 작동한다.
- **코드 관심사 분리(SoC)**: 500줄이 넘던 거대 `MainAppContainer.tsx`가 공통 레이아웃과 독립적인 서브 탭 페이지들로 깔끔하게 모듈화된다.
- **딥링크 및 공유 가능**: 외부에서 `/feed`, `/stamp`로 직접 연결되는 QR 코드나 푸시 링크 생성이 가능해진다.

### 감수하는 것 (Cons / Trade-offs)
- `MainAppContainer.tsx`의 단일 컴포넌트 상태를 레이아웃과 서브페이지 컴포넌트로 분리하고 라우트 구조를 재구성하는 마이그레이션 작업이 수반된다. (단, 기존 하위 컴포넌트인 `CommunityFeedView`, `StampBookView`, `GymSeatingViewer` 등은 그대로 재사용 가능)
