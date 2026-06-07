import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 학부모 자녀 첨삭 결과 목록
export default async function ParentFeedbackPage() {
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

  // 자녀별 첨삭 완료 제출물 수집
  const childData = await Promise.all(
    children.map(async (child) => {
      const { data: submissions } = await supabase
        .from("submissions")
        .select(`
          id,
          submitted_at,
          assignments ( title )
        `)
        .eq("student_id", child.id)
        .eq("status", "reviewed")
        .order("submitted_at", { ascending: false });

      return { child, submissions: submissions ?? [] };
    })
  );

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">첨삭 결과</h1>
        <p className="mt-1 text-sm text-zinc-500">자녀의 첨삭 결과를 확인합니다.</p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
        </div>
      ) : (
        childData.map(({ child, submissions }) => (
          <section key={child.id} className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                {child.name.charAt(0)}
              </div>
              <h2 className="text-base font-semibold text-zinc-800">{child.name}</h2>
            </div>

            {submissions.length === 0 ? (
              <p className="text-sm text-zinc-400">완료된 첨삭이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {submissions.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/parent/feedback/${sub.id}`}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {(sub.assignments as unknown as { title: string } | null)?.title ?? "과제"}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {new Date(sub.submitted_at).toLocaleDateString("ko-KR")} 제출
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        첨삭완료
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
