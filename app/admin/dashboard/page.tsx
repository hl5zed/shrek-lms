import { createClient } from "@/lib/supabase/server";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";

// 관리자 대시보드 — 인증/역할 검증은 app/admin/layout.tsx 에서 처리합니다.
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: studentCountRaw }, { count: pendingFeedbackCountRaw }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .neq("status", "reviewed"),
  ]);

  const studentCount = studentCountRaw ?? 0;
  const pendingFeedbackCount = pendingFeedbackCountRaw ?? 0;

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() + diffToMonday);
  const weekStartIso = weekStart.toISOString();

  const [{ count: weeklyAssignmentCountRaw }, { count: weeklySubmissionCountRaw }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStartIso),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .gte("submitted_at", weekStartIso),
    ]);

  const weeklyAssignmentCount = weeklyAssignmentCountRaw ?? 0;
  const weeklySubmissionCount = weeklySubmissionCountRaw ?? 0;
  const weeklySubmissionRate =
    weeklyAssignmentCount > 0
      ? Math.min(100, Math.round((weeklySubmissionCount / weeklyAssignmentCount) * 100))
      : 0;

  const { data: pendingRows } = await supabase
    .from("submissions")
    .select(`
      id,
      submitted_at,
      status,
      assignments ( title ),
      profiles!student_id ( name )
    `)
    .neq("status", "reviewed")
    .order("submitted_at", { ascending: true })
    .limit(4);

  const pendingFeedbackItems = (pendingRows ?? []).map((row) => {
    const submittedAtRaw = row.submitted_at;
    const submittedAt = submittedAtRaw ? new Date(submittedAtRaw) : null;
    const elapsedHours = submittedAt
      ? Math.max(0, Math.floor((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60)))
      : 0;
    const urgency: "일반" | "높음" = elapsedHours >= 24 ? "높음" : "일반";
    return {
      id: row.id,
      studentName:
        (row.profiles as unknown as { name?: string } | null)?.name?.trim() || "학생 정보 없음",
      assignmentTitle:
        (row.assignments as unknown as { title?: string } | null)?.title?.trim() || "과제 정보 없음",
      elapsedLabel: `${elapsedHours}h`,
      urgency,
    };
  });

  return (
    <AdminDashboardContent
      data={{
        studentCount,
        pendingFeedbackCount,
        weeklySubmissionRate,
        pendingFeedbackItems,
      }}
    />
  );
}
