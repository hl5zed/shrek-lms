import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 학생 첨삭 결과 목록
export default async function StudentFeedbackPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id,
      submitted_at,
      assignments ( title )
    `)
    .eq("student_id", user!.id)
    .eq("status", "reviewed")
    .order("submitted_at", { ascending: false });

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">첨삭 결과</h1>
        <p className="mt-1 text-sm text-zinc-500">완료된 첨삭 목록입니다.</p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">아직 완료된 첨삭이 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {submissions.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/student/feedback/${sub.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
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
    </div>
  );
}
