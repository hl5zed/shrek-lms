import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";

// 관리자 영역 공통 레이아웃
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <div className="flex h-screen bg-[var(--color-neutral-50)]">
      <Sidebar role="admin" name={profile.name ?? "관리자"} />
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
