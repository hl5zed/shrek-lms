"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";

type AdminLayoutFrameProps = {
  name: string;
  studentNewCount?: number;
  pendingFeedbackCount?: number;
  children: React.ReactNode;
};

export default function AdminLayoutFrame({
  name,
  studentNewCount,
  pendingFeedbackCount,
  children,
}: AdminLayoutFrameProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[var(--color-neutral-50)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          role="admin"
          name={name}
          currentPath={pathname}
          studentNewCount={studentNewCount}
          pendingFeedbackCount={pendingFeedbackCount}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-zinc-900">슈렉샘 LMS</span>
          <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600">
            관리자
          </span>
        </header>

        <div className="hidden lg:block">
          <TopHeader title="관리자" description="운영 현황과 관리 화면을 확인합니다." />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
