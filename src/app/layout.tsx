import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MobileLayout from "@/components/MobileLayout";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "호키동자 - AI 사주 상담 서비스",
  description: "AI 기반 친근한 사주팔자 상담 챗봇 서비스. 10-12세의 밝고 호기심 많은 어린 수행자 호키동자가 사용자의 사주를 분석하고 상담해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: ColorZilla 등 브라우저 확장이 추가하는 속성으로 인한 hydration 경고 방지 */}
      <body className={`${pretendard.variable} antialiased`} suppressHydrationWarning>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
