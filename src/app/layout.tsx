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
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://busan-youth-day.vercel.app";

export const metadata: Metadata = {
  title: "2026 부산교구 청소년의 날 디지털 가이드 - 쭈양이 꾹",
  description:
    "2026 부산교구 청소년의 날(BYD) 모바일 가이드 '쭈양이 꾹' - 스포원파크 4대 테마존 부스 QR 스탬프 투어 및 현장 편의 안내",
  metadataBase: new URL(siteUrl),

  openGraph: {
    title: "2026 부산교구 청소년의 날 디지털 가이드 - 쭈양이 꾹",
    description:
      "스포원파크 4대 테마존 부스 QR 스탬프 투어 및 현장 편의 안내",
    url: siteUrl,
    siteName: "쭈양이 꾹",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/assets/og_thumbnail/byd2026_og_thumbnail_pwa_v2.png",
        width: 1200,
        height: 630,
        alt: "BYD 마스코트 쭈양이",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 부산교구 청소년의 날 디지털 가이드 - 쭈양이 꾹",
    description:
      "스포원파크 4대 테마존 부스 QR 스탬프 투어 및 현장 편의 안내",
    images: ["/assets/og_thumbnail/byd2026_og_thumbnail_pwa_v2.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png", type: "image/png" },
    ],
    apple: "/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "쭈양이 꾹",
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
        <link rel="apple-touch-icon" href="/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white`}
      >
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-x-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
