import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "龙虾学校 - AI Agent 智力测试",
  description: "测测你的小龙虾有多聪明！AI Agent 能力测评 + 排行榜 + 能力升级",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="relative max-w-app mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
