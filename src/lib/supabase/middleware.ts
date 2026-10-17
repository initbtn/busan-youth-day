import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendTelegramAlert } from "@/lib/telegram/alert";

const SUPABASE_AUTH_TIMEOUT_MS = 3000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let timerId: NodeJS.Timeout | undefined;
  try {
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>(
      (_, reject) => {
        timerId = setTimeout(
          () => reject(new Error("Supabase auth.getUser timeout (3s limit exceeded)")),
          SUPABASE_AUTH_TIMEOUT_MS
        );
      }
    );

    await Promise.race([supabase.auth.getUser(), timeoutPromise]);
  } catch (error) {
    console.error("[Middleware] Supabase auth check failed or timed out:", error);
    // 장애 알림 비차단(non-blocking) 발송
    sendTelegramAlert({
      project: "busan-youth-day",
      env: process.env.NODE_ENV || "production",
      area: "Auth Middleware (updateSession)",
      error,
      extra: {
        path: request.nextUrl.pathname,
      },
    }).catch((err) => console.error("[Middleware] Failed to send Telegram alert:", err));

    // Supabase가 다운되거나 지연되어도 일반 공개 페이지는 정상 반환 (Graceful Degradation)
  } finally {
    if (timerId) {
      clearTimeout(timerId);
    }
  }

  return supabaseResponse;
}
