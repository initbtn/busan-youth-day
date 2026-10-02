import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface KakaoAuthOptions {
  redirectTo?: string;
}

/**
 * Supabase Auth를 통한 카카오 SSO 간편 로그인
 * PRD §2.1 요구사항: 카카오 프로필 및 계정(Email) 필수 수집 스코프 포함
 */
export async function signInWithKakao(
  client?: SupabaseClient,
  options?: KakaoAuthOptions
) {
  const supabase = client || createClient();

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const redirectTo =
    options?.redirectTo || `${origin}/api/auth/callback/kakao`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo,
      scopes: "profile_nickname profile_image account_email",
    },
  });

  if (error) {
    console.error("[KakaoAuth] Failed to initiate Kakao OAuth:", error);
    throw error;
  }

  return data;
}

/**
 * 로그아웃 수행
 */
export async function signOut(client?: SupabaseClient) {
  const supabase = client || createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[KakaoAuth] Sign out error:", error);
    throw error;
  }
}

/**
 * 현재 로그인된 세션 및 사용자 프로필 조회
 */
export async function getCurrentUser(client?: SupabaseClient) {
  const supabase = client || createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * 온보딩 완료 시 프로필 및 순례 공동체 메타데이터를 Supabase 유저 객체에 저장
 */
export async function syncOnboardingMetadata(
  client: SupabaseClient | undefined,
  metadata: {
    name: string;
    district: string;
    parish: string;
    role: string;
    saintGroup: string;
    saintId: string;
    termsAgreed: boolean;
  }
) {
  const supabase = client || createClient();
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: metadata.name,
      district: metadata.district,
      parish: metadata.parish,
      affiliation_role: metadata.role,
      pilgrim_saint_group: metadata.saintGroup,
      pilgrim_saint_id: metadata.saintId,
      terms_agreed: metadata.termsAgreed,
      onboarding_completed_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("[KakaoAuth] Failed to update user metadata:", error);
    throw error;
  }

  return data.user;
}
