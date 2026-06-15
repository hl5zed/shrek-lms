import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

// 관리자 대시보드 — 인증/역할 검증은 app/admin/layout.tsx 에서 처리합니다.
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  assertAdminSupabaseEnv();
  const { status } = await searchParams;
  const supabase = await createClient();

  async function sendStudentAlert(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const studentId = formData.get("studentId") as string;
    const message   = (formData.get("message") as string).trim();
    if (!studentId || !message) {
      redirect("/admin/dashboard?status=alert_error");
    }
    try {
      await adminSupabase.from("notifications").insert({
        recipient_id: studentId,
        type: "student_alert",
        message,
        is_read: false,
      });
    } catch {
      // 에러 무시
    }
    revalidatePath("/admin/dashboard");
    redirect("/admin/dashboard?status=student_sent");
  }

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

  const nowMs = now.getTime();
  const pendingFeedbackItems = (pendingRows ?? []).map((row) => {
    const submittedAtRaw = row.submitted_at;
    const submittedAt = submittedAtRaw ? new Date(submittedAtRaw) : null;
    const elapsedHours = submittedAt
      ? Math.max(0, Math.floor((nowMs - submittedAt.getTime()) / (1000 * 60 * 60)))
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

  // 알림 발송용 학생 목록
  const { data: studentProfiles } = await adminSupabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .order("name");
  const students = (studentProfiles ?? []) as Array<{ id: string; name: string | null }>;

  return (
    <>
      <AdminDashboardContent
        data={{
          studentCount,
          pendingFeedbackCount,
          weeklySubmissionRate,
          pendingFeedbackItems,
        }}
      />

      {/* 학생 알림 발송 */}
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-1 text-base font-bold text-zinc-900">학생 알림 발송</h2>
        <p className="mb-4 text-xs text-zinc-500">선택한 학생의 대시보드에 알림을 전송합니다.</p>

        {status === "student_sent" && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✅ 알림이 발송되었습니다.
          </p>
        )}
        {status === "alert_error" && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            학생과 메시지를 모두 입력해주세요.
          </p>
        )}

        <form action={sendStudentAlert} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">학생 선택</label>
              <select
                name="studentId"
                required
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">-- 학생을 선택하세요 --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? "이름 없음"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">알림 메시지</label>
              <textarea
                name="message"
                required
                rows={2}
                placeholder="학생에게 전달할 내용을 입력하세요"
                className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] sm:w-auto sm:px-6"
          >
            알림 발송
          </button>
        </form>
      </div>
    </>
  );
}
