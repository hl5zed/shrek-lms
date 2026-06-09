import { createClient } from "@/lib/supabase/server";

type SubmissionJoinRow = {
  id: string;
  submitted_at: string | null;
  content_text: string | null;
  status: string | null;
  assignments: {
    title: string | null;
    classes: { name: string | null } | null;
  } | null;
};

type FeedbackScoreRow = {
  submission_id: string;
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
  updated_at: string | null;
};

type FeedbackBasicRow = {
  submission_id: string;
  updated_at: string | null;
};

export type PortfolioSubmissionItem = {
  submissionId: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string | null;
  reviewStatus: "reviewed" | "submitted";
  score: number | null;
  previewText: string;
  feedbackUpdatedAt: string | null;
};

export type StudentPortfolioData = {
  totalSubmissions: number;
  reviewedCount: number;
  revisedCount: number;
  representative: PortfolioSubmissionItem | null;
  items: PortfolioSubmissionItem[];
};

function roundAverage(values: Array<number | null | undefined>): number | null {
  const scores = values.filter((value): value is number => typeof value === "number");
  if (scores.length === 0) return null;
  const avg = scores.reduce((acc, value) => acc + value, 0) / scores.length;
  return Math.round(avg);
}

function getPreviewText(contentText: string | null): string {
  const source = (contentText ?? "").trim();
  if (!source) return "작성된 답안 내용이 없습니다.";
  if (source.length <= 120) return source;
  return `${source.slice(0, 120)}...`;
}

export async function getStudentPortfolioByUserId(userId: string): Promise<{
  ok: boolean;
  data: StudentPortfolioData;
}> {
  const supabase = await createClient();

  const empty: StudentPortfolioData = {
    totalSubmissions: 0,
    reviewedCount: 0,
    revisedCount: 0,
    representative: null,
    items: [],
  };

  const { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select("id, submitted_at, content_text, status, assignments ( title, classes ( name ) )")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false });

  if (submissionError || !submissions) {
    return { ok: false, data: empty };
  }

  const typedSubmissions = submissions as unknown as SubmissionJoinRow[];
  if (typedSubmissions.length === 0) {
    return { ok: true, data: empty };
  }

  const submissionIds = typedSubmissions.map((submission) => submission.id);

  let scoreRows: FeedbackScoreRow[] = [];
  let basicRows: FeedbackBasicRow[] = [];
  let hasScoreColumns = true;

  const scoreQuery = await supabase
    .from("feedbacks")
    .select(
      "submission_id, score_reading, score_thinking, score_logic, score_structure, score_expression, updated_at",
    )
    .in("submission_id", submissionIds);

  if (scoreQuery.error) {
    hasScoreColumns = false;
    const fallbackQuery = await supabase
      .from("feedbacks")
      .select("submission_id, updated_at")
      .in("submission_id", submissionIds);

    if (fallbackQuery.error) {
      return {
        ok: true,
        data: {
          totalSubmissions: typedSubmissions.length,
          reviewedCount: 0,
          revisedCount: 0,
          representative: null,
          items: typedSubmissions.map((submission) => ({
            submissionId: submission.id,
            assignmentTitle: submission.assignments?.title ?? "과제",
            className: submission.assignments?.classes?.name ?? "반 정보 없음",
            submittedAt: submission.submitted_at ?? null,
            reviewStatus: "submitted",
            score: null,
            previewText: getPreviewText(submission.content_text),
            feedbackUpdatedAt: null,
          })),
        },
      };
    }

    basicRows = (fallbackQuery.data ?? []) as FeedbackBasicRow[];
  } else {
    scoreRows = (scoreQuery.data ?? []) as FeedbackScoreRow[];
  }

  const feedbackBySubmission = new Map<
    string,
    { updatedAt: string | null; score: number | null; hasFeedback: boolean }
  >();

  if (hasScoreColumns) {
    scoreRows.forEach((feedback) => {
      feedbackBySubmission.set(feedback.submission_id, {
        updatedAt: feedback.updated_at ?? null,
        score: roundAverage([
          feedback.score_reading,
          feedback.score_thinking,
          feedback.score_logic,
          feedback.score_structure,
          feedback.score_expression,
        ]),
        hasFeedback: true,
      });
    });
  } else {
    basicRows.forEach((feedback) => {
      feedbackBySubmission.set(feedback.submission_id, {
        updatedAt: feedback.updated_at ?? null,
        score: null,
        hasFeedback: true,
      });
    });
  }

  const items: PortfolioSubmissionItem[] = typedSubmissions.map((submission) => {
    const feedback = feedbackBySubmission.get(submission.id);
    return {
      submissionId: submission.id,
      assignmentTitle: submission.assignments?.title ?? "과제",
      className: submission.assignments?.classes?.name ?? "반 정보 없음",
      submittedAt: submission.submitted_at ?? null,
      reviewStatus: feedback?.hasFeedback ? "reviewed" : "submitted",
      score: feedback?.score ?? null,
      previewText: getPreviewText(submission.content_text),
      feedbackUpdatedAt: feedback?.updatedAt ?? null,
    };
  });

  const reviewedItems = items.filter((item) => item.reviewStatus === "reviewed");

  let representative: PortfolioSubmissionItem | null = null;
  if (reviewedItems.length > 0) {
    const scoredItems = reviewedItems.filter((item) => item.score !== null);
    if (scoredItems.length > 0) {
      representative = [...scoredItems].sort((a, b) => {
        const scoreGap = (b.score ?? -1) - (a.score ?? -1);
        if (scoreGap !== 0) return scoreGap;
        const aTime = a.feedbackUpdatedAt ? Date.parse(a.feedbackUpdatedAt) : 0;
        const bTime = b.feedbackUpdatedAt ? Date.parse(b.feedbackUpdatedAt) : 0;
        return bTime - aTime;
      })[0];
    } else {
      representative = [...reviewedItems].sort((a, b) => {
        const aTime = a.feedbackUpdatedAt ? Date.parse(a.feedbackUpdatedAt) : 0;
        const bTime = b.feedbackUpdatedAt ? Date.parse(b.feedbackUpdatedAt) : 0;
        return bTime - aTime;
      })[0];
    }
  }

  return {
    ok: true,
    data: {
      totalSubmissions: items.length,
      reviewedCount: reviewedItems.length,
      revisedCount: 0,
      representative,
      items,
    },
  };
}

