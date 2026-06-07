import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

// 강사 영역 공통 레이아웃
export default async function TeacherLayout({
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

  if (profile?.role !== "teacher") redirect("/login");

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar role="teacher" name={profile.name ?? "강사"} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
