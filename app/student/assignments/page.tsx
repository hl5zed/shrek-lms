import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 학생 과제 목록 — 본인 반 과제 + 제출 여부 표시
export default async function StudentAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 본인 반 과제 + 제출 여부
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      description,
      due_date,
      classes!inner ( name, class_students!inner ( student_id ) ),
      submissions ( id, status )
    `)
    .eq("classes.class_students.student_id", user!.id)
    .order("due_date", { ascending: true });

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">과제</h1>
        <p className="mt-1 text-sm text-zinc-500">내 반 과제 목록입니다.</p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 과제가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {assignments.map((asgn) => {
            const submission = (asgn.submissions as { id: string; status: string }[] | null)?.[0];
            return (
              <li key={asgn.id}>
                <Link
                  href={`/student/assignments/${asgn.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{asgn.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">마감: {asgn.due_date}</p>
                  </div>
                  <StatusBadge submission={submission} dueDate={asgn.due_date} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({
  submission,
  dueDate,
}: {
  submission: { status: string } | undefined;
  dueDate: string;
}) {
  if (submission?.status === "reviewed") {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        첨삭완료
      </span>
    );
  }
  if (submission?.status === "submitted") {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        첨삭대기
      </span>
    );
  }
  const isOverdue = new Date(dueDate) < new Date();
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOverdue
          ? "bg-red-100 text-red-700"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {isOverdue ? "기한초과" : "미제출"}
    </span>
  );
}
