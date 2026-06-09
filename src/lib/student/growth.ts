import { createClient } from "@/lib/supabase/server";

type NullableNumber = number | null | undefined;

function average(values: NullableNumber[]): number | null {
  const filtered = values.filter((value): value is number => typeof value === "number");
  if (filtered.length === 0) return null;
  const sum = filtered.reduce((acc, value) => acc + value, 0);
  return Number((sum / filtered.length).toFixed(2));
}

export type StudentGrowthSummary = {
  totalSubmissions: number;
  reviewedCount: number;
  averageScore: number | null;
  recentSubmittedAt: string | null;
  recentFeedbackAt: string | null;
  readingAvg: number | null;
  thinkingAvg: number | null;
  logicAvg: number | null;
  structureAvg: number | null;
  expressionAvg: number | null;
};

type FeedbackRow = {
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
  updated_at: string | null;
};

export async function getStudentGrowthSummaryByUserId(userId: string): Promise<{
  ok: boolean;
  summary: StudentGrowthSummary;
}> {
  const supabase = await createClient();

  const { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select("id, submitted_at, status")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false });

  const emptySummary: StudentGrowthSummary = {
    totalSubmissions: 0,
    reviewedCount: 0,
    averageScore: null,
    recentSubmittedAt: null,
    recentFeedbackAt: null,
    readingAvg: null,
    thinkingAvg: null,
    logicAvg: null,
    structureAvg: null,
    expressionAvg: null,
  };

  if (submissionError || !submissions) {
    return { ok: false, summary: emptySummary };
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const { data: feedbacks, error: feedbackError } = submissionIds.length
    ? await supabase
        .from("feedbacks")
        .select(
          "score_reading, score_thinking, score_logic, score_structure, score_expression, updated_at",
        )
        .in("submission_id", submissionIds)
    : { data: [] as FeedbackRow[], error: null };

  if (feedbackError) {
    return {
      ok: true,
      summary: {
        ...emptySummary,
        totalSubmissions: submissions.length,
        reviewedCount: submissions.filter((submission) => submission.status === "reviewed").length,
        recentSubmittedAt: submissions[0]?.submitted_at ?? null,
      },
    };
  }

  const typedFeedbacks = (feedbacks ?? []) as FeedbackRow[];

  const allScoreBuckets = typedFeedbacks.flatMap((feedback) =>
    [
      feedback.score_reading,
      feedback.score_thinking,
      feedback.score_logic,
      feedback.score_structure,
      feedback.score_expression,
    ].filter((value): value is number => typeof value === "number"),
  );

  return {
    ok: true,
    summary: {
      totalSubmissions: submissions.length,
      reviewedCount: submissions.filter((submission) => submission.status === "reviewed").length,
      averageScore: average(allScoreBuckets),
      recentSubmittedAt: submissions[0]?.submitted_at ?? null,
      recentFeedbackAt: typedFeedbacks
        .map((feedback) => feedback.updated_at)
        .filter((value): value is string => typeof value === "string")
        .sort((a, b) => (a < b ? 1 : -1))[0] ?? null,
      readingAvg: average(typedFeedbacks.map((feedback) => feedback.score_reading)),
      thinkingAvg: average(typedFeedbacks.map((feedback) => feedback.score_thinking)),
      logicAvg: average(typedFeedbacks.map((feedback) => feedback.score_logic)),
      structureAvg: average(typedFeedbacks.map((feedback) => feedback.score_structure)),
      expressionAvg: average(typedFeedbacks.map((feedback) => feedback.score_expression)),
    },
  };
}

