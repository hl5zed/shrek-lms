"use client";

import { useState } from "react";
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
