"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";

type TeacherSidebarWrapperProps = {
  children: React.ReactNode;
  role: string;
  name: string;
};

export default function TeacherSidebarWrapper({
  children,
  role,
  name,
}: TeacherSidebarWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isTeacherLecturesPage = role === "teacher" && pathname === "/teacher/lectures";

  if (isTeacherLecturesPage) {
    const slimNavItems = [
      { label: "대시보드", href: "/teacher/dashboard" },
      { label: "강의", href: "/teacher/lectures" },
      { label: "과제", href: "/teacher/assignments" },
      { label: "제출함", href: "/teacher/submissions" },
      { label: "계정 설정", href: "/teacher/settings" },
    ];

    return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
        {/* /teacher/lectures 전용: 글씨 중심의 슬림 사이드바 */}
        <div className="hidden min-h-screen md:flex">
          <aside className="shrink-0 border-r border-slate-200 bg-white md:w-28 lg:w-40">
            <div className="border-b border-slate-200 px-3 py-3">
              <p className="truncate text-sm font-semibold text-slate-800">강의 메뉴</p>
            </div>
            <nav className="space-y-1 px-2 py-3">
              {slimNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block truncate rounded-md px-2.5 py-2 text-sm leading-none whitespace-nowrap break-keep transition ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-slate-200 px-2 py-3">
              <p className="mb-2 truncate text-xs text-slate-500">{name}</p>
              <LogoutButton />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8 lg:py-8">{children}</div>
          </main>
        </div>

        {/* 모바일: 검은 오버레이 없이 흰색 드롭다운 메뉴 */}
        <div className="flex min-h-screen flex-col md:hidden">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              aria-expanded={isSidebarOpen}
              aria-label="강의 메뉴 열기"
            >
              메뉴
            </button>

            {isSidebarOpen ? (
              <nav className="mt-3 space-y-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                {slimNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`block truncate rounded-md px-2.5 py-2 text-sm leading-none whitespace-nowrap break-keep transition ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="pt-1">
                  <LogoutButton />
                </div>
              </nav>
            ) : null}
          </div>

          <main className="min-w-0 flex-1 px-4 py-4">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden h-screen bg-zinc-50 lg:flex">
        <Sidebar role={role} name={name} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      <div className="flex min-h-screen flex-col bg-zinc-50 lg:hidden">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700"
            aria-label="사이드바 열기"
          >
            ☰
          </button>
          <p className="text-sm font-semibold text-zinc-900">슈렉샘 LMS</p>
          <LogoutButton />
        </div>

        {isSidebarOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="h-full w-64 bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-end border-b border-zinc-200 p-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700"
                  aria-label="사이드바 닫기"
                >
                  ✕
                </button>
              </div>
              <Sidebar role={role} name={name} />
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto p-4 pb-8">{children}</main>
      </div>
    </>
  );
}
