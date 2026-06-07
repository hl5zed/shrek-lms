import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 학생 개별 첨삭 결과 + 성장지표 확인
export default async function StudentFeedbackDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      id,
      content_text,
      word_count,
      submitted_at,
      assignments ( title )
    `)
    .eq("id", submissionId)
    .eq("student_id", user!.id)
    .single();

  if (!submission) notFound();

  const { data: feedback } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("submission_id", submissionId)
    .single();

  if (!feedback) notFound();

  const scoreFields = [
    { key: "score_reading", label: "독해력" },
    { key: "score_thinking", label: "사고력" },
    { key: "score_logic", label: "논리력" },
    { key: "score_structure", label: "구성력" },
    { key: "score_expression", label: "표현력" },
  ];

  return (
    <div>
      {/* 뒤로가기 */}
      <Link href="/student/feedback" className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700">
        ← 첨삭 목록
      </Link>

      {/* 제목 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {(submission.assignments as unknown as { title: string } | null)?.title ?? "과제"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {new Date(submission.submitted_at).toLocaleDateString("ko-KR")} 제출 ·{" "}
          {submission.word_count}자
        </p>
      </div>

      {/* 성장지표 */}
      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="mb-5 text-sm font-semibold text-zinc-800">성장지표</p>
        <div className="space-y-4">
          {scoreFields.map((field) => {
            const score = (feedback as Record<string, number>)[field.key] ?? 0;
            return (
              <div key={field.key} className="flex items-center gap-4">
                <span className="w-16 shrink-0 text-sm text-zinc-600">{field.label}</span>
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`h-2.5 flex-1 rounded-full transition-colors ${
                        n <= score ? "bg-blue-500" : "bg-zinc-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-8 text-right text-sm font-semibold text-zinc-800">{score}점</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선생님 코멘트 */}
      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-zinc-800">선생님 코멘트</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {feedback.comment}
        </p>
      </div>

      {/* 내 답안 */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">내 답안</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {submission.content_text}
        </p>
      </div>
    </div>
  );
}
