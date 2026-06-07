import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 학생 대시보드 — 인증/역할 검증은 app/student/layout.tsx 에서 처리합니다.
export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 학생이 속한 반의 과제 목록 (최근 5건)
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      due_date,
      class_id,
      classes!inner ( class_students!inner ( student_id ) )
    `)
    .eq("classes.class_students.student_id", user!.id)
    .order("due_date", { ascending: true })
    .limit(5);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">학생 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">이번 주 과제를 확인합니다.</p>
      </div>

      {/* 다가오는 과제 */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">다가오는 과제</h2>

        {!assignments || assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-400">등록된 과제가 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {assignments.map((asgn) => {
              const isOverdue = new Date(asgn.due_date) < new Date();
              return (
                <li key={asgn.id}>
                  <Link
                    href={`/student/assignments/${asgn.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <p className="text-sm font-medium text-zinc-900">{asgn.title}</p>
                    <p className={`text-xs font-medium ${isOverdue ? "text-red-500" : "text-zinc-400"}`}>
                      마감: {asgn.due_date}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4">
          <Link
            href="/student/assignments"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            전체 과제 보기 →
          </Link>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="mt-10 grid grid-cols-3 gap-3">
        {[
          { label: "강의", href: "/student/lectures", desc: "내 반 강의 목록" },
          { label: "과제", href: "/student/assignments", desc: "과제 제출 현황" },
          { label: "첨삭 결과", href: "/student/feedback", desc: "완료된 첨삭 보기" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-zinc-800">{item.label}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
