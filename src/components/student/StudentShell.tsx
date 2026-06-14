import { createClient } from "@/lib/supabase/server";
import StudentBottomNav from "./StudentBottomNav";
import StudentHeader from "./StudentHeader";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

type StudentShellProps = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  showGreeting?: boolean;
};

export default async function StudentShell({
  title,
  children,
  backHref,
  showGreeting = false,
}: StudentShellProps) {
  assertAdminSupabaseEnv();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const studentName = profile?.name ?? "학생";
  const studentEmail = profile?.email ?? "";

  // 학생 알림 카운트 (student_alert 타입만, adminSupabase로 RLS 우회)
  const { data: notiRows } = user
    ? await adminSupabase
        .from("notifications")
        .select("id")
        .eq("recipient_id", user.id)
        .eq("type", "student_alert")
        .eq("is_read", false)
    : { data: [] };
  const notificationCount = (notiRows ?? []).length;

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <StudentHeader
        title={title}
        backHref={backHref}
        studentName={studentName}
        studentEmail={studentEmail}
        showGreeting={showGreeting}
        notificationCount={notificationCount}
      />
      <main className="mx-auto w-full max-w-sm space-y-4 px-4 py-4 pb-28">
        {children}
      </main>
      <StudentBottomNav />
    </div>
  );
}

