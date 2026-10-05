-- 1. Profiles 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'booth_staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Booths 테이블 (행사 부스 정보)
CREATE TABLE IF NOT EXISTS public.booths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  qr_code_hash TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booths are viewable by everyone" 
ON public.booths FOR SELECT USING (true);

CREATE POLICY "Only admins can manage booths" 
ON public.booths FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. Stamps 테이블 (부스 방문 체크인)
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booth_id UUID REFERENCES public.booths(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, booth_id)
);

ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stamps" 
ON public.stamps FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stamps" 
ON public.stamps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can insert their own stamps" 
ON public.stamps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Posts 테이블 (청년 소통 피드 및 방명록)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  author TEXT DEFAULT '순례자',
  parish TEXT DEFAULT '부산',
  role TEXT DEFAULT '청년',
  content TEXT NOT NULL,
  image_url TEXT,
  media_urls TEXT[],
  likes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이미 만들어진 DB 용 (CREATE TABLE IF NOT EXISTS 는 컬럼을 추가하지 않는다)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_urls TEXT[];

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved posts are viewable by everyone" 
ON public.posts FOR SELECT USING (is_approved = true OR is_approved IS NULL);

CREATE POLICY "Anyone can create posts" 
ON public.posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.posts TO anon, authenticated, service_role;

-- 5. Reward Entries 테이블 (경품 응모)
CREATE TABLE IF NOT EXISTS public.reward_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'claimed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.reward_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reward entries" 
ON public.reward_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and update reward entries" 
ON public.reward_entries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
