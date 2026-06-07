import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 강사 과제 목록 — 본인이 등록한 과제와 제출 현황을 표시합니다.
export default async function TeacherAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      due_date,
      classes ( name ),
      submissions ( id, status )
    `)
    .eq("created_by", user!.id)
    .order("due_date", { ascending: false });

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">과제</h1>
          <p className="mt-1 text-sm text-zinc-500">등록한 과제 목록입니다.</p>
        </div>
        <Link
          href="/teacher/assignments/new"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + 과제 등록
        </Link>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 과제가 없습니다.</p>
          <Link
            href="/teacher/assignments/new"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            첫 과제 등록하기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {assignments.map((asgn) => {
            const subs = (asgn.submissions as { status: string }[]) ?? [];
            const pending = subs.filter((s) => s.status === "submitted").length;
            const reviewed = subs.filter((s) => s.status === "reviewed").length;
            const isOverdue = new Date(asgn.due_date) < new Date();
            return (
              <li
                key={asgn.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{asgn.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {(asgn.classes as unknown as { name: string } | null)?.name} ·{" "}
                    마감:{" "}
                    <span className={isOverdue ? "text-red-400" : ""}>{asgn.due_date}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {pending > 0 && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      대기 {pending}
                    </span>
                  )}
                  {reviewed > 0 && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      완료 {reviewed}
                    </span>
                  )}
                  {pending === 0 && reviewed === 0 && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                      제출 없음
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
