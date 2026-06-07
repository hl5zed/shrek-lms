import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 학생 과제 상세 — 제출 여부에 따라 제출 버튼 또는 제출 내용을 표시합니다.
export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, due_date")
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  // 기존 제출물 조회
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, content_text, word_count, status, submitted_at")
    .eq("assignment_id", id)
    .eq("student_id", user!.id)
    .single();

  const isOverdue = new Date(assignment.due_date) < new Date();

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/student/assignments"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 과제 목록
      </Link>

      {/* 과제 헤더 */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">{assignment.title}</h1>
        <p className={`mt-1 text-sm ${isOverdue ? "text-red-500" : "text-zinc-500"}`}>
          마감: {assignment.due_date}{isOverdue ? " (기한 초과)" : ""}
        </p>
      </div>

      {/* 과제 안내 */}
      {assignment.description && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">과제 안내</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {assignment.description}
          </p>
        </div>
      )}

      {/* 제출 완료 상태 */}
      {submission ? (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <p className="text-base font-semibold text-zinc-800">제출한 답안</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                submission.status === "reviewed"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {submission.status === "reviewed" ? "첨삭완료" : "첨삭대기"}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {submission.content_text}
            </p>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            글자 수: {submission.word_count}자 ·{" "}
            제출: {new Date(submission.submitted_at).toLocaleDateString("ko-KR")}
          </p>

          {/* 첨삭 완료 시 결과 보기 링크 */}
          {submission.status === "reviewed" && (
            <Link
              href={`/student/feedback/${submission.id}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              첨삭 결과 보기 →
            </Link>
          )}
        </div>
      ) : (
        <div>
          <Link
            href={`/student/assignments/${id}/submit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            과제 제출하기
          </Link>
          <p className="mt-2 text-xs text-zinc-400">제출 후에는 수정이 불가합니다.</p>
        </div>
      )}
    </div>
  );
}
