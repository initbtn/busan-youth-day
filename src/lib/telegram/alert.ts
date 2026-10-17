export interface TelegramAlertOptions {
  project?: string;
  env?: string;
  area: string;
  error?: unknown;
  extra?: Record<string, unknown>;
}

/**
 * 전역 텔레그램 웹훅 알림 유틸리티
 * 다중 프로젝트 식별을 위해 [busan-youth-day ({env})] 헤더를 필수 포함합니다.
 */
export async function sendTelegramAlert({
  project = "busan-youth-day",
  env = process.env.NODE_ENV || "production",
  area,
  error,
  extra,
}: TelegramAlertOptions): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return;
  }

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : "N/A";

  const lines = [
    `🚨 [${project} (${env})] 장애/경고 알림`,
    `• 영역: ${area}`,
    `• 에러: ${errorMessage}`,
  ];

  if (extra && Object.keys(extra).length > 0) {
    lines.push(`• 상세: ${JSON.stringify(extra)}`);
  }

  const text = lines.join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Telegram API responded with HTTP ${res.status}: ${errorText}`);
    }
  } catch (alertError) {
    // 알림 발송 실패가 메인 런타임에 영향을 주지 않도록 로깅만 수행
    console.error("[TelegramAlert] Failed to send alert:", alertError);
  }
}
