import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import FeedbackItem from "@/src/components/student/FeedbackItem";
import { getStudentFeedbackList } from "@/src/lib/student/feedback";

export default async function StudentFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    redirect("/login");
  }

  const result = await getStudentFeedbackList(user.id);

  return (
    <StudentShell title="첨삭 결과">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">첨삭 리스트</h2>
        {!result.ok ? (
          <p className="mt-3 text-sm text-[#C03232]">
            첨삭 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : result.rows.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">
            아직 제출한 답안이 없습니다. 먼저 과제를 제출하면 첨삭 결과를 볼 수 있습니다.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {result.rows.map((row) => (
              <FeedbackItem key={row.submissionId} {...row} />
            ))}
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}
