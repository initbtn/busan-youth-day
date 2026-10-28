-- ==============================================================================
-- 20261028000000_add_comments_table.sql
-- 2026 부산교구 젊은이의 날 (BYD) — 소통 피드 댓글 저장소 추가 (Issue #89)
-- 테이블: comments
-- ==============================================================================

-- 6. Comments 테이블 (소통 피드 댓글)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  author TEXT DEFAULT '순례자',
  parish TEXT DEFAULT '부산',
  role TEXT DEFAULT '청년',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.comments TO anon, authenticated, service_role;
