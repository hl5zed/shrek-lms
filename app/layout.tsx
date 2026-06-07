import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "논술마루 LMS",
  description: "강의·과제·첨삭·성장 관리를 한곳에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--color-neutral-50)] text-[var(--color-neutral-1000)]">
        {children}
      </body>
    </html>
  );
}
