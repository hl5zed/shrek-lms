import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayoutFrame from "@/components/layout/AdminLayoutFrame";

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

  return <AdminLayoutFrame name={profile.name ?? "관리자"}>{children}</AdminLayoutFrame>;
}
