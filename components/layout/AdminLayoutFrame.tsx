"use client";

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
  return (
    <div className="flex h-screen bg-[var(--color-neutral-50)]">
      <Sidebar
        role="admin"
        name={name}
        currentPath={pathname}
        studentNewCount={studentNewCount}
        pendingFeedbackCount={pendingFeedbackCount}
      />
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
