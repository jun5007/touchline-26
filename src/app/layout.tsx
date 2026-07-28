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
      "2026 월드컵 A조 4개국·6경기의 13개 결정적 순간에서 교체와 전술을 다시 판단하는 회고형 감독 시뮬레이션",
    applicationName: "TOUCHLINE 26",
    openGraph: {
      title: "TOUCHLINE 26 | 월드컵 감독의 선택",
      description:
        "4개국·6경기·13개 미션을 판단하고, 세 경기의 감독 성향을 리포트로 돌아봅니다.",
      type: "website",
      locale: "ko_KR",
      siteName: "TOUCHLINE 26",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "TOUCHLINE 26 - World Cup Group A, 4 teams, 6 matches, 13 decisions",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TOUCHLINE 26",
      description: "A조 4개국·6경기·13개 미션을 다시 판단하는 감독 시뮬레이션",
      images: ["/opengraph-image"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
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
