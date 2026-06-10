import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 강사 제출함 — 본인 반 학생들의 제출물 목록
export default async function TeacherSubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id,
      status,
      submitted_at,
      word_count,
      assignments!inner ( title, created_by ),
      profiles!student_id ( name )
    `)
    .eq("assignments.created_by", user!.id)
    .order("submitted_at", { ascending: false });

  const pending = (submissions ?? []).filter((s) => s.status === "submitted");
  const reviewed = (submissions ?? []).filter((s) => s.status === "reviewed");

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">제출함</h1>
        <p className="mt-1 text-sm text-zinc-500">학생 제출물을 확인하고 첨삭을 작성합니다.</p>
      </div>

      {/* 첨삭 대기 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-800">첨삭 대기</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {pending.length}건
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500">아직 확인할 제출물이 없습니다.</p>
            <p className="mt-1 text-xs text-zinc-400">
              학생이 과제를 제출하면 이곳에서 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((sub) => (
              <SubmissionRow key={sub.id} sub={sub} />
            ))}
          </ul>
        )}
      </section>

      {/* 첨삭 완료 */}
      {reviewed.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-800">첨삭 완료</h2>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              {reviewed.length}건
            </span>
          </div>
          <ul className="space-y-2">
            {reviewed.map((sub) => (
              <SubmissionRow key={sub.id} sub={sub} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubmissionRow({ sub }: { sub: Record<string, any> }) {
  return (
    <li>
      <Link
        href={`/teacher/submissions/${sub.id}`}
        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
      >
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {(sub.assignments as unknown as { title: string } | null)?.title ?? "과제"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {(sub.profiles as unknown as { name: string } | null)?.name ?? "학생"} ·{" "}
            {sub.word_count}자 ·{" "}
            {new Date(sub.submitted_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            sub.status === "reviewed"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {sub.status === "reviewed" ? "첨삭완료" : "첨삭대기"}
        </span>
      </Link>
    </li>
  );
}
