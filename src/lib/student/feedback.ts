import { createClient } from "@/lib/supabase/server";

export type StudentFeedbackListItem = {
  submissionId: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  feedbackUpdatedAt: string | null;
  status: "첨삭 완료" | "첨삭 대기";
};

export type StudentFeedbackDetail = {
  submissionId: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  contentText: string;
  wordCount: number;
  feedback: {
    comment: string | null;
    areaComments: Record<string, string>;
    scoreReading: number | null;
    scoreThinking: number | null;
    scoreLogic: number | null;
    scoreStructure: number | null;
    scoreExpression: number | null;
    updatedAt: string | null;
  } | null;
};

type SubmissionJoinRow = {
  id: string;
  submitted_at: string;
  content_text: string;
  word_count: number;
  assignments: {
    title: string;
    class_id: string;
    classes: { name: string } | null;
  } | null;
};

type FeedbackRow = {
  submission_id: string;
  comment: string | null;
  area_comments: Record<string, string> | null;
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
  updated_at: string | null;
};

export async function getStudentFeedbackList(userId: string): Promise<{
  ok: boolean;
  rows: StudentFeedbackListItem[];
}> {
  const supabase = await createClient();

  const { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select(
      "id, submitted_at, content_text, word_count, assignments ( title, class_id, classes ( name ) )",
    )
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false });

  if (submissionError || !submissions) {
    return { ok: false, rows: [] };
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const { data: feedbacks } = submissionIds.length
    ? await supabase
        .from("feedbacks")
        .select(
          "submission_id, comment, area_comments, score_reading, score_thinking, score_logic, score_structure, score_expression, updated_at",
        )
        .in("submission_id", submissionIds)
    : { data: [] as FeedbackRow[] };

  const feedbackMap = new Map<string, FeedbackRow>();
  (feedbacks ?? []).forEach((feedback) => {
    feedbackMap.set(feedback.submission_id, feedback as FeedbackRow);
  });

  const rows = submissions.map((raw) => {
    const submission = raw as unknown as SubmissionJoinRow;
    const feedback = feedbackMap.get(submission.id);
    return {
      submissionId: submission.id,
      assignmentTitle: submission.assignments?.title ?? "과제",
      className: submission.assignments?.classes?.name ?? "반 정보 없음",
      submittedAt: submission.submitted_at,
      feedbackUpdatedAt: feedback?.updated_at ?? null,
      status: feedback ? "첨삭 완료" : "첨삭 대기",
    } as StudentFeedbackListItem;
  });

  return { ok: true, rows };
}

export async function getStudentFeedbackDetailBySubmission(
  userId: string,
  submissionId: string,
): Promise<{
  ok: boolean;
  row: StudentFeedbackDetail | null;
}> {
  const supabase = await createClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      "id, submitted_at, content_text, word_count, assignments ( title, class_id, classes ( name ) )",
    )
    .eq("id", submissionId)
    .eq("student_id", userId)
    .single();

  if (submissionError || !submission) {
    return { ok: false, row: null };
  }

  const { data: feedback } = await supabase
    .from("feedbacks")
    .select(
      "submission_id, comment, area_comments, score_reading, score_thinking, score_logic, score_structure, score_expression, updated_at",
    )
    .eq("submission_id", submissionId)
    .maybeSingle();

  const typedSubmission = submission as unknown as SubmissionJoinRow;
  const typedFeedback = (feedback as FeedbackRow | null) ?? null;

  return {
    ok: true,
    row: {
      submissionId: typedSubmission.id,
      assignmentTitle: typedSubmission.assignments?.title ?? "과제",
      className: typedSubmission.assignments?.classes?.name ?? "반 정보 없음",
      submittedAt: typedSubmission.submitted_at,
      contentText: typedSubmission.content_text ?? "",
      wordCount: typedSubmission.word_count ?? 0,
      feedback: typedFeedback
        ? {
            comment: typedFeedback.comment,
            areaComments: typedFeedback.area_comments ?? {},
            scoreReading: typedFeedback.score_reading,
            scoreThinking: typedFeedback.score_thinking,
            scoreLogic: typedFeedback.score_logic,
            scoreStructure: typedFeedback.score_structure,
            scoreExpression: typedFeedback.score_expression,
            updatedAt: typedFeedback.updated_at,
          }
        : null,
    },
  };
}

