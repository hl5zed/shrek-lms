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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const [{ count: studentNewCountRaw, error: studentCountError }, { count: pendingFeedbackCountRaw, error: pendingCountError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student")
        .gte("created_at", thirtyDaysAgoIso),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .neq("status", "reviewed"),
    ]);

  const studentNewCount = studentCountError ? undefined : (studentNewCountRaw ?? 0);
  const pendingFeedbackCount = pendingCountError ? undefined : (pendingFeedbackCountRaw ?? 0);

  return (
    <AdminLayoutFrame
      name={profile.name ?? "관리자"}
      studentNewCount={studentNewCount}
      pendingFeedbackCount={pendingFeedbackCount}
    >
      {children}
    </AdminLayoutFrame>
  );
}
