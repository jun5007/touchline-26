import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: {
      default: "TOUCHLINE 26 | 월드컵 감독의 선택",
      template: "%s | TOUCHLINE 26",
    },
    description:
      "실제 2026 월드컵의 결정적인 순간에서 교체 선수와 전술을 직접 선택하는 데이터 기반 감독 시뮬레이션",
    applicationName: "TOUCHLINE 26",
    openGraph: {
      title: "TOUCHLINE 26 | 월드컵 감독의 선택",
      description:
        "가장 높은 선수가 아니라, 지금 이 경기에 가장 필요한 선수를 고른다.",
      type: "website",
      locale: "ko_KR",
      siteName: "TOUCHLINE 26",
      images: [
        {
          url: "/og.png",
          width: 1731,
          height: 909,
          alt: "TOUCHLINE 26 - 69분, 당신의 선택",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TOUCHLINE 26",
      description: "실제 월드컵 데이터로 다시 판단하는 감독의 90초",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <div className="site-shell">
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
