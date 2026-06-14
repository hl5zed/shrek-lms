import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StatCard from "@/src/components/student/StatCard";
import StudentCard from "@/src/components/student/StudentCard";
import CourseItem from "@/src/components/student/CourseItem";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

type ScoreFeedback = {
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
};

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function StudentDashboardPage() {
  assertAdminSupabaseEnv();

  async function markNotifAsRead(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const supabaseInner = await createClient();
    const { data: { user } } = await supabaseInner.auth.getUser();
    if (!user) return;
    const notifId = formData.get("notifId") as string;
    try {
      await adminSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notifId)
        .eq("recipient_id", user.id);
    } catch { /* 에러 무시 */ }
    revalidatePath("/student/dashboard");
  }

  async function markAllNotifsAsRead() {
    "use server";
    assertAdminSupabaseEnv();
    const supabaseInner = await createClient();
    const { data: { user } } = await supabaseInner.auth.getUser();
    if (!user) return;
    try {
      await adminSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("type", "student_alert")
        .eq("is_read", false);
    } catch { /* 에러 무시 */ }
    revalidatePath("/student/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", user.id);

  // 기존 학생 대시보드 흐름을 유지하기 위해 상태/강의/첨삭 지표를 서버에서 실데이터로 집계합니다.
  const classIds = Array.from(new Set((classLinks ?? []).map((row) => row.class_id).filter(Boolean)));

  const { data: assignments } = classIds.length
    ? await supabase.from("assignments").select("id, class_id").in("class_id", classIds)
    : { data: [] as Array<{ id: string; class_id: string }> };
  const assignmentIds = (assignments ?? []).map((row) => row.id);

  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("submissions")
        .select("id, assignment_id, status")
        .eq("student_id", user.id)
        .in("assignment_id", assignmentIds)
    : { data: [] as Array<{ id: string; assignment_id: string; status: string | null }> };

  const totalAssignments = assignmentIds.length;
  const submittedCount = (submissions ?? []).filter((row) =>
    row.status === "submitted" || row.status === "reviewed" || row.status === "completed"
  ).length;
  const submitRate = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0;

  const submissionIds = (submissions ?? []).map((row) => row.id);
  const { data: feedbackSubmissionRows } = submissionIds.length
    ? await supabase.from("feedbacks").select("submission_id").in("submission_id", submissionIds)
    : { data: [] as Array<{ submission_id: string }> };
  const reviewedCount = new Set((feedbackSubmissionRows ?? []).map((row) => row.submission_id)).size;

  const { data: feedbacks } = submissionIds.length
    ? await supabase
        .from("feedbacks")
        .select("score_reading, score_thinking, score_logic, score_structure, score_expression")
        .in("submission_id", submissionIds)
    : { data: [] as ScoreFeedback[] };

  const allScores = (feedbacks ?? []).flatMap((feedback) =>
    [
      feedback.score_reading,
      feedback.score_thinking,
      feedback.score_logic,
      feedback.score_structure,
      feedback.score_expression,
    ].filter((score): score is number => typeof score === "number")
  );
  const averageScore = average(allScores);

  const { data: lectures } = classIds.length
    ? await supabase
        .from("lectures")
        .select("id, title, description, created_at, class_id, classes!inner(name, teacher_id)")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
        .limit(3)
    : {
        data: [] as Array<{
          id: string;
          title: string | null;
          description: string | null;
          created_at: string;
          class_id: string;
          classes: { name?: string; teacher_id?: string } | null;
        }>,
      };

  const teacherIds = Array.from(
    new Set(
      (lectures ?? [])
        .map((lecture) => (lecture.classes as { teacher_id?: string } | null)?.teacher_id)
        .filter((id): id is string => Boolean(id))
    )
  );
  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", teacherIds)
    : { data: [] as Array<{ id: string; name: string | null }> };
  const teacherMap = new Map((teachers ?? []).map((teacher) => [teacher.id, teacher.name ?? "담당 강사"]));

  const lectureItems = (lectures ?? []).map((lecture) => {
    const classInfo = lecture.classes as { name?: string; teacher_id?: string } | null;
    const teacherName = classInfo?.teacher_id ? teacherMap.get(classInfo.teacher_id) ?? "담당 강사" : "담당 강사";
    return {
      id: lecture.id,
      title: lecture.title?.trim() ? lecture.title : "제목 없음",
      teacherName,
      schedule: classInfo?.name?.trim() ? classInfo.name : "반 정보 없음",
      progress: 0,
      status: "in_progress",
      description: lecture.description?.trim() ? lecture.description : undefined,
    };
  });

  // 학생 알림 조회
  const { data: rawStudentNotifs } = await adminSupabase
    .from("notifications")
    .select("id, message, type, created_at, is_read")
    .eq("recipient_id", user.id)
    .eq("type", "student_alert")
    .order("created_at", { ascending: false })
    .limit(20);

  const studentNotifs = (rawStudentNotifs ?? []) as Array<{
    id: string; message: string; created_at: string; is_read: boolean;
  }>;
  const unreadNotifCount = studentNotifs.filter((n) => !n.is_read).length;

  // 공지사항: 전체 또는 학생 대상 공개 게시글
  const { data: noticePosts } = await adminSupabase
    .from("posts")
    .select("id, title, category, content, created_at")
    .eq("visibility", "공개")
    .or("target_role.eq.all,target_role.eq.student")
    .order("created_at", { ascending: false })
    .limit(5);

  const CATEGORY_COLOR: Record<string, string> = {
    공지: "bg-indigo-100 text-indigo-700",
    학습자료: "bg-emerald-100 text-emerald-700",
    과제안내: "bg-amber-100 text-amber-700",
    기타: "bg-zinc-100 text-zinc-500",
  };

  return (
    <StudentShell title="학생 홈" showGreeting>
      <div className="rounded-2xl bg-[#EEF1FF] p-4">
        <p className="text-sm text-[#161D55]">안녕하세요, {profile?.name ?? "학생"}님!</p>
      </div>

      {/* 알림 */}
      {studentNotifs.length > 0 && (
        <StudentCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#06091F]">알림</h2>
              {unreadNotifCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {unreadNotifCount}
                </span>
              )}
            </div>
            {unreadNotifCount > 0 && (
              <form action={markAllNotifsAsRead}>
                <button
                  type="submit"
                  className="text-[10px] text-[#6470BF] underline underline-offset-2"
                >
                  모두 읽음
                </button>
              </form>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {studentNotifs.map((notif) => (
              <li
                key={notif.id}
                className={`rounded-lg border p-3 ${
                  notif.is_read
                    ? "border-[#D4D9F5] bg-white"
                    : "border-indigo-200 bg-[#EEF1FF]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-line text-xs text-[#06091F]">{notif.message}</p>
                  {!notif.is_read && (
                    <form action={markNotifAsRead} className="shrink-0">
                      <input type="hidden" name="notifId" value={notif.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-indigo-300 bg-white px-2 py-1 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        확인
                      </button>
                    </form>
                  )}
                  {notif.is_read && (
                    <span className="shrink-0 text-[10px] text-zinc-400">확인됨</span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  {new Date(notif.created_at).toLocaleDateString("ko-KR", {
                    month: "long", day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </StudentCard>
      )}

      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">공지사항</h2>
        {!noticePosts || noticePosts.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {noticePosts.map((post) => (
              <li key={post.id} className="border-b border-[#D4D9F5] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[post.category] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {post.category}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[#06091F]">{post.title}</p>
                {post.content && (
                  <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{post.content}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StudentCard>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard label="제출률" value={`${submitRate}%`} />
        <StatCard label="첨삭 완료 수" value={`${reviewedCount}건`} />
        <StatCard label="평균점수" value={averageScore === null ? "-" : `${averageScore.toFixed(1)}점`} />
      </div>

      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">수강 중 강의</h2>
        {lectureItems.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">등록된 강의가 없습니다.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {lectureItems.map((course) => (
              <CourseItem key={course.id} {...course} />
            ))}
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}
