import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import AssignmentItem from "@/src/components/student/AssignmentItem";
import { getStudentAssignmentsByUserId } from "@/src/lib/student/assignments";

export default async function StudentAssignmentsPage() {
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

  const result = await getStudentAssignmentsByUserId(user.id);

  return (
    <StudentShell title="과제 목록">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">진행 과제</h2>
        {!result.ok ? (
          <p className="mt-3 text-sm text-[#C03232]">
            과제 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : result.rows.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">
            현재 제출할 과제가 없습니다. 새 과제가 등록되면 이곳에 표시됩니다.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {result.rows.map((assignment) => (
              <AssignmentItem key={assignment.id} {...assignment} />
            ))}
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}
