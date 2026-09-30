import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "2026 부산교구 젊은이의 날 (BYD) - 디지털 순례 앱",
  description: "지금 여기, 주님이 함께! 2026 부산교구 젊은이의 날 스탬프 투어 및 영적 순례 가이드",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BYD 2026",
  },
  openGraph: {
    title: "2026 부산교구 젊은이의 날 (BYD)",
    description: "지금 여기, 주님이 함께! 2026 BYD 디지털 순례 나침반 및 스탬프 투어",
    url: "https://busan-youth-day.vercel.app",
    siteName: "2026 BYD",
    images: [
      {
        url: "/assets/byd2026_combined_final_vibe_mockup.webp",
        width: 1200,
        height: 630,
        alt: "2026 부산교구 젊은이의 날",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 부산교구 젊은이의 날 (BYD)",
    description: "지금 여기, 주님이 함께! 2026 BYD 디지털 순례 나침반 및 스탬프 투어",
    images: ["/assets/byd2026_combined_final_vibe_mockup.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/byd2026_combined_final_vibe_mockup.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 select-none`}
      >
        {children}
      </body>
    </html>
  );
}
