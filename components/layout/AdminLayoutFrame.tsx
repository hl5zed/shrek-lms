"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";

type AdminLayoutFrameProps = {
  name: string;
  children: React.ReactNode;
};

// /admin/dashboard 에서는 LMS Shell 전용 전체 화면을 보여주기 위해
// 기존 관리자 래퍼(사이드바/상단헤더)를 생략합니다.
export default function AdminLayoutFrame({ name, children }: AdminLayoutFrameProps) {
  const pathname = usePathname();

  if (pathname === "/admin/dashboard") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[var(--color-neutral-50)]">
      <Sidebar role="admin" name={name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          title="관리자"
          description="운영 현황과 관리 화면을 확인합니다."
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
