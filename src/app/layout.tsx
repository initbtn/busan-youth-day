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

export const metadata: Metadata = {
  title: "쭈양이 꾹",
  description: "스포원파크 부스 QR 스캔하고 현장 굿즈 교환받자! 🍞🐟",
  metadataBase: new URL("https://byd2026.catb.kr"),

  openGraph: {
    title: "쭈양이 꾹 📱",
    description: "스포원파크 부스 QR 스캔 ➔ 도장 꾹! ➔ 현장 굿즈 교환하기",
    url: "https://byd2026.catb.kr",
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
    title: "쭈양이 꾹 📱",
    description: "스포원파크 부스 QR 스캔 ➔ 도장 꾹! ➔ 현장 굿즈 교환하기",
    images: ["/assets/og_thumbnail/byd2026_og_thumbnail_pwa_v2.png"],
  },
  icons: {
    icon: "/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png",
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
