import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 제출물 상세 + 첨삭 작성 — Server Action으로 feedbacks INSERT 및 submission 상태 갱신
export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      word_count_pure,
      status,
      submitted_at,
      assignments!inner (
        title,
        description,
        classes!inner ( teacher_id )
      ),
      profiles!student_id ( name )
    `)
    .eq("id", id)
    .eq("assignments.classes.teacher_id", user!.id)
    .single();

  if (!submission) notFound();

  // 기존 첨삭 조회
  const { data: feedback } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("submission_id", id)
    .single();

  async function saveFeedback(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const comment = formData.get("comment") as string;
    const scoreReading = Number(formData.get("score_reading"));
    const scoreThinking = Number(formData.get("score_thinking"));
    const scoreLogic = Number(formData.get("score_logic"));
    const scoreStructure = Number(formData.get("score_structure"));
    const scoreExpression = Number(formData.get("score_expression"));

    // feedbacks upsert (submission_id unique 제약 활용)
    await supabase.from("feedbacks").upsert({
      submission_id: id,
      teacher_id: user.id,
      comment,
      score_reading: scoreReading,
      score_thinking: scoreThinking,
      score_logic: scoreLogic,
      score_structure: scoreStructure,
      score_expression: scoreExpression,
    }, { onConflict: "submission_id" });

    // 제출물 상태를 reviewed로 업데이트
    await supabase
      .from("submissions")
      .update({ status: "reviewed" })
      .eq("id", id);

    redirect("/teacher/submissions");
  }

  const scoreFields = [
    { name: "score_reading", label: "독해력" },
    { name: "score_thinking", label: "사고력" },
    { name: "score_logic", label: "논리력" },
    { name: "score_structure", label: "구성력" },
    { name: "score_expression", label: "표현력" },
  ];

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/teacher/submissions"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 제출함으로
      </Link>

      {/* 제출물 헤더 */}
      <div className="mt-4 mb-6">
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">
            {(submission.assignments as unknown as { title: string } | null)?.title ?? "과제"}
          </h1>
          <span
            className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              submission.status === "reviewed"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {submission.status === "reviewed" ? "첨삭완료" : "첨삭대기"}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {(submission.profiles as unknown as { name: string } | null)?.name} ·{" "}
          {submission.word_count}자 (공백 제외 {submission.word_count_pure}자) ·{" "}
          {new Date(submission.submitted_at).toLocaleDateString("ko-KR")} 제출
        </p>
      </div>

      {/* 학생 답안 */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">학생 답안</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
          {submission.content_text}
        </p>
      </div>

      {/* 첨삭 폼 */}
      <form action={saveFeedback} className="max-w-xl space-y-6">
        {/* 성장지표 점수 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-800">성장지표 점수 (1~5점)</p>
          <div className="space-y-4">
            {scoreFields.map((field) => (
              <div key={field.name} className="flex items-center gap-4">
                <label className="w-16 text-sm text-zinc-600">{field.label}</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className="flex cursor-pointer flex-col items-center gap-1 text-xs text-zinc-500"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={n}
                        defaultChecked={
                          feedback
                            ? (feedback as Record<string, number>)[field.name] === n
                            : n === 3
                        }
                        required
                        className="accent-blue-600"
                      />
                      {n}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 종합 코멘트 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-800">
            종합 코멘트 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            rows={7}
            required
            defaultValue={feedback?.comment ?? ""}
            placeholder="학생에게 전달할 종합 첨삭 내용을 작성하세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {feedback ? "첨삭 수정 저장" : "첨삭 완료"}
        </button>
      </form>
    </div>
  );
}
