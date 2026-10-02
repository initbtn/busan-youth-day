import { Suspense } from "react";
import { CommunityFeedView } from "@/components/CommunityFeedView";

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">피드 불러오는 중...</div>}>
      <CommunityFeedView />
    </Suspense>
  );
}
