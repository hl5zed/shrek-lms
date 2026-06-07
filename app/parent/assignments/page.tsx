import { createClient } from "@/lib/supabase/server";

// 학부모 자녀 과제 현황 — RLS에 의해 연결된 자녀 데이터만 조회됩니다.
export default async function ParentAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 연결된 자녀 목록
  const { data: parentStudents } = await supabase
    .from("parent_students")
    .select("profiles!student_id ( id, name )")
    .eq("parent_id", user!.id);

  const children = (parentStudents ?? [])
    .map((r) => r.profiles as unknown as { id: string; name: string } | null)
    .filter(Boolean) as { id: string; name: string }[];

  // 자녀별 과제 제출 현황 수집
  const childData = await Promise.all(
    children.map(async (child) => {
      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          due_date,
          classes!inner ( class_students!inner ( student_id ) ),
          submissions ( id, status, student_id )
        `)
        .eq("classes.class_students.student_id", child.id)
        .order("due_date", { ascending: false });

      return { child, assignments: assignments ?? [] };
    })
  );

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">과제 현황</h1>
        <p className="mt-1 text-sm text-zinc-500">자녀의 과제 제출 현황을 확인합니다.</p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
        </div>
      ) : (
        childData.map(({ child, assignments }) => (
          <section key={child.id} className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                {child.name.charAt(0)}
              </div>
              <h2 className="text-base font-semibold text-zinc-800">{child.name}</h2>
            </div>

            {assignments.length === 0 ? (
              <p className="text-sm text-zinc-400">등록된 과제가 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((asgn) => {
                  const subs = asgn.submissions as { id: string; status: string; student_id: string }[] | null ?? [];
                  const childSub = subs.find((s) => s.student_id === child.id);
                  return (
                    <li
                      key={asgn.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{asgn.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">마감: {asgn.due_date}</p>
                      </div>
                      <ChildStatusBadge submission={childSub} dueDate={asgn.due_date} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function ChildStatusBadge({
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
        제출완료
      </span>
    );
  }
  const isOverdue = new Date(dueDate) < new Date();
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOverdue ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {isOverdue ? "기한초과" : "미제출"}
    </span>
  );
}
