import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

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

export const metadata: Metadata = {
  title: "FH6 调校师 - 地平线6车辆调校辅助工具",
  description: "AI 驱动的《地平线6》车辆调校助手，通过对话获取专业调校方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark h-full">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "font-sans antialiased bg-background text-foreground h-full"
        )}
      >
        {children}
      </body>
    </html>
  );
}
