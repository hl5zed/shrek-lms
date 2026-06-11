import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 제출물 상세 + 첨삭 작성 — Server Action으로 feedbacks INSERT 및 submission 상태 갱신
export default async function SubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      id,
      content_text,
      file_urls,
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

  const assignmentTitleRaw = (submission.assignments as unknown as { title?: string } | null)?.title;
  const assignmentTitle =
    typeof assignmentTitleRaw === "string" && assignmentTitleRaw.trim().length > 0
      ? assignmentTitleRaw
      : "과제 정보를 불러오지 못했습니다.";
  const studentNameRaw = (submission.profiles as unknown as { name?: string } | null)?.name;
  const studentName =
    typeof studentNameRaw === "string" && studentNameRaw.trim().length > 0
      ? studentNameRaw
      : "학생 정보를 불러오지 못했습니다.";
  const contentText = typeof submission.content_text === "string" ? submission.content_text : "";
  const hasContentText = contentText.trim().length > 0;
  const fileUrls = Array.isArray(submission.file_urls) ? submission.file_urls : [];
  const hasFiles = fileUrls.length > 0;
  const submittedAtText = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleDateString("ko-KR")
    : "제출 시각이 확인되지 않습니다.";

  // 기존 첨삭 조회
  const { data: feedback } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("submission_id", id)
    .single();

  const feedbackComment = typeof feedback?.comment === "string" ? feedback.comment : "";
  const hasFeedbackComment = feedbackComment.trim().length > 0;
  const hasAnyScore = Boolean(
    feedback &&
      [
        feedback.score_reading,
        feedback.score_thinking,
        feedback.score_logic,
        feedback.score_structure,
        feedback.score_expression,
      ].some((score) => score != null)
  );
  const areaCommentsRaw =
    feedback?.area_comments && typeof feedback.area_comments === "object"
      ? (feedback.area_comments as Record<string, unknown>)
      : {};
  const areaCommentReadingDefault =
    typeof areaCommentsRaw["독해"] === "string" ? areaCommentsRaw["독해"] : "";
  const areaCommentThinkingDefault =
    typeof areaCommentsRaw["사고"] === "string" ? areaCommentsRaw["사고"] : "";
  const areaCommentLogicDefault =
    typeof areaCommentsRaw["논리"] === "string" ? areaCommentsRaw["논리"] : "";
  const areaCommentStructureDefault =
    typeof areaCommentsRaw["구성"] === "string" ? areaCommentsRaw["구성"] : "";
  const areaCommentExpressionDefault =
    typeof areaCommentsRaw["표현"] === "string" ? areaCommentsRaw["표현"] : "";

  async function saveFeedback(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const comment = formData.get("comment") as string;
    // 점수 컬럼은 NULL 허용 + CHECK(1~5) 제약이므로, 빈값/범위외 값은 null로 정규화합니다.
    const normalizeScore = (value: FormDataEntryValue | null): number | null => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return null;
      if (parsed < 1 || parsed > 5) return null;
      return parsed;
    };
    const scoreReading = normalizeScore(formData.get("score_reading"));
    const scoreThinking = normalizeScore(formData.get("score_thinking"));
    const scoreLogic = normalizeScore(formData.get("score_logic"));
    const scoreStructure = normalizeScore(formData.get("score_structure"));
    const scoreExpression = normalizeScore(formData.get("score_expression"));
    const areaCommentReading = String(formData.get("area_comment_reading") ?? "").trim();
    const areaCommentThinking = String(formData.get("area_comment_thinking") ?? "").trim();
    const areaCommentLogic = String(formData.get("area_comment_logic") ?? "").trim();
    const areaCommentStructure = String(formData.get("area_comment_structure") ?? "").trim();
    const areaCommentExpression = String(formData.get("area_comment_expression") ?? "").trim();

    // area_comments jsonb는 docs/database_schema.md 예시 키(독해/사고/논리/구성/표현) 형식으로 저장합니다.
    const areaComments: Record<string, string> = {};
    if (areaCommentReading) areaComments["독해"] = areaCommentReading;
    if (areaCommentThinking) areaComments["사고"] = areaCommentThinking;
    if (areaCommentLogic) areaComments["논리"] = areaCommentLogic;
    if (areaCommentStructure) areaComments["구성"] = areaCommentStructure;
    if (areaCommentExpression) areaComments["표현"] = areaCommentExpression;

    // feedbacks upsert (submission_id unique 제약 활용)
    const { error: feedbackError } = await supabase.from("feedbacks").upsert({
      submission_id: id,
      teacher_id: user.id,
      comment,
      score_reading: scoreReading,
      score_thinking: scoreThinking,
      score_logic: scoreLogic,
      score_structure: scoreStructure,
      score_expression: scoreExpression,
      area_comments: Object.keys(areaComments).length > 0 ? areaComments : null,
    }, { onConflict: "submission_id" });
    if (feedbackError) {
      console.error("Failed to save feedback:", feedbackError);
      redirect(`/teacher/submissions/${id}?status=error`);
    }

    // 제출물 상태를 reviewed로 업데이트
    const { error: submissionError } = await supabase
      .from("submissions")
      .update({ status: "reviewed" })
      .eq("id", id);
    if (submissionError) {
      console.error("Failed to update submission status:", submissionError);
      redirect(`/teacher/submissions/${id}?status=error`);
    }

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
            {assignmentTitle}
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
          {studentName} ·{" "}
          {submission.word_count}자 (공백 제외 {submission.word_count_pure}자) ·{" "}
          {submittedAtText}
        </p>
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            첨삭 저장에 실패했습니다. 다시 시도해 주세요.
          </p>
        ) : null}
      </div>

      {/* 학생 답안 */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">학생 답안</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
          {hasContentText ? contentText : "제출 답안이 없습니다."}
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          첨부 파일: {hasFiles ? `${fileUrls.length}개` : "첨부 파일이 없습니다."}
        </p>
        {!hasContentText && !hasFiles ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            일부 정보를 불러오지 못했습니다. 필요한 경우 담당 선생님 또는 관리자에게 문의해 주세요.
          </p>
        ) : null}
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
                  <label className="flex cursor-pointer flex-col items-center gap-1 text-xs text-zinc-500">
                    <input
                      type="radio"
                      name={field.name}
                      value=""
                      defaultChecked={
                        !feedback
                          ? true
                          : ((feedback as Record<string, number | null>)[field.name] ?? null) === null
                      }
                      className="accent-blue-600"
                    />
                    선택 안 함
                  </label>
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
                            ? (feedback as Record<string, number | null>)[field.name] === n
                            : false
                        }
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

        {/* 영역별 코멘트 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-800">영역별 코멘트 (선택)</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">독해</label>
              <textarea
                name="area_comment_reading"
                rows={3}
                defaultValue={areaCommentReadingDefault}
                placeholder="독해 영역 코멘트를 입력하세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">사고</label>
              <textarea
                name="area_comment_thinking"
                rows={3}
                defaultValue={areaCommentThinkingDefault}
                placeholder="사고 영역 코멘트를 입력하세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">논리</label>
              <textarea
                name="area_comment_logic"
                rows={3}
                defaultValue={areaCommentLogicDefault}
                placeholder="논리 영역 코멘트를 입력하세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">구성</label>
              <textarea
                name="area_comment_structure"
                rows={3}
                defaultValue={areaCommentStructureDefault}
                placeholder="구성 영역 코멘트를 입력하세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">표현</label>
              <textarea
                name="area_comment_expression"
                rows={3}
                defaultValue={areaCommentExpressionDefault}
                placeholder="표현 영역 코멘트를 입력하세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
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

        {feedback && !hasAnyScore ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            점수는 아직 입력되지 않았습니다.
          </p>
        ) : null}
        {feedback && !hasFeedbackComment ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            코멘트가 없습니다.
          </p>
        ) : null}
        <p className="text-xs text-zinc-500">* 종합 코멘트는 필수입니다</p>

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
