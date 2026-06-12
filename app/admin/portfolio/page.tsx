import { revalidatePath } from "next/cache";
import Card from "@/components/ui/Card";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import PortfolioClient, { type PortfolioHistoryItem, type PortfolioStudentOption } from "./PortfolioClient";

type FeedbackRow = {
  id: string;
  submission_id: string;
  comment: string | null;
  area_comments: Record<string, unknown> | null;
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
  created_at: string;
};

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function safeAreaComments(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function summarizeComment(value: string | null) {
  if (!value) return "코멘트가 없습니다.";
  const first = value.split(/\n|\. /).map((part) => part.trim()).find(Boolean);
  return first ?? value;
}

function splitComment(value: string | null) {
  if (!value) return { before: "첨삭 전 내용이 없습니다.", after: "수정 후 내용이 없습니다." };
  const mid = Math.floor(value.length / 2);
  return {
    before: value.slice(0, mid).trim() || value.trim(),
    after: value.slice(mid).trim() || value.trim(),
  };
}

export async function setRepresentativeWork(submissionId: string, studentId: string) {
  "use server";
  await requireAdmin();

  assertAdminSupabaseEnv();

  const { data: submissions } = await adminSupabase
    .from("submissions")
    .select("id")
    .eq("student_id", studentId);
  const submissionIds = (submissions ?? []).map((submission) => submission.id);
  if (!submissionIds.length) {
    return { ok: false as const, message: "제출물이 없습니다." };
  }

  const { data: feedbacks } = await adminSupabase
    .from("feedbacks")
    .select("id, submission_id, area_comments")
    .in("submission_id", submissionIds);

  const feedbackRows = feedbacks ?? [];
  if (!feedbackRows.length) {
    return { ok: false as const, message: "첨삭 데이터가 없습니다." };
  }

  // 해당 학생의 기존 대표작 표시를 모두 해제합니다.
  await Promise.all(
    feedbackRows.map((feedback) => {
      const nextArea = safeAreaComments(feedback.area_comments);
      delete nextArea.representative;
      return adminSupabase.from("feedbacks").update({ area_comments: nextArea }).eq("id", feedback.id);
    }),
  );

  const target = feedbackRows.find((feedback) => feedback.submission_id === submissionId);
  if (!target) {
    return { ok: false as const, message: "선택한 제출물의 첨삭 데이터가 없습니다." };
  }

  const nextArea = {
    ...safeAreaComments(target.area_comments),
    representative: true,
  };
  const { error } = await adminSupabase
    .from("feedbacks")
    .update({ area_comments: nextArea })
    .eq("id", target.id);

  if (error) {
    return { ok: false as const, message: "대표작 저장 중 오류가 발생했습니다." };
  }

  revalidatePath("/admin/portfolio");
  return { ok: true as const };
}

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;

  try {
    assertAdminSupabaseEnv();
  } catch {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600">관리자 Supabase 환경변수가 설정되지 않았습니다.</p>
      </Card>
    );
  }

  // 1) 학생 목록
  const { data: students } = await adminSupabase
    .from("profiles")
    .select("id, name, created_at")
    .eq("role", "student")
    .order("name");
  const studentOptions: PortfolioStudentOption[] =
    students?.map((student) => ({
      id: student.id,
      name: student.name ?? "이름 없음",
      createdAt: student.created_at ?? null,
    })) ?? [];

  const selectedStudent =
    studentOptions.find((student) => student.id === studentId) ??
    studentOptions[0] ??
    null;

  if (!selectedStudent) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">포트폴리오</h1>
        <Card className="border-dashed p-12 text-center">
          <p className="text-sm text-zinc-500">등록된 학생이 없습니다.</p>
        </Card>
      </div>
    );
  }

  // 2) 선택 학생 제출물
  const { data: submissions } = await adminSupabase
    .from("submissions")
    .select(`
      id,
      assignment_id,
      status,
      submitted_at,
      word_count,
      assignments (
        title,
        classes ( name )
      )
    `)
    .eq("student_id", selectedStudent.id)
    .order("submitted_at", { ascending: false });

  const submissionRows =
    submissions?.map((submission) => ({
      id: submission.id,
      assignmentTitle:
        (((submission.assignments as { title?: string } | null)?.title ?? "").trim() || "과제명 없음"),
      className:
        ((((submission.assignments as { classes?: { name?: string } | null } | null)?.classes as { name?: string } | null)?.name ??
          "").trim() || "반 정보 없음"),
      status: submission.status ?? "submitted",
      submittedAt: submission.submitted_at ?? null,
      wordCount: submission.word_count ?? 0,
    })) ?? [];
  const submissionIds = submissionRows.map((submission) => submission.id);

  // 3) 선택 학생 첨삭 데이터
  const { data: feedbackRaw } = submissionIds.length
    ? await adminSupabase
        .from("feedbacks")
        .select(
          "id, submission_id, comment, area_comments, score_reading, score_thinking, score_logic, score_structure, score_expression, created_at",
        )
        .in("submission_id", submissionIds)
        .order("created_at", { ascending: false })
    : { data: [] as FeedbackRow[] };
  const feedbackRows = (feedbackRaw ?? []) as FeedbackRow[];
  const feedbackBySubmission = new Map(feedbackRows.map((feedback) => [feedback.submission_id, feedback]));

  // 4) 반 정보
  const { data: classRows } = await adminSupabase
    .from("class_students")
    .select("class_id, classes(name)")
    .eq("student_id", selectedStudent.id);
  const className =
    ((classRows?.[0]?.classes as { name?: string } | null)?.name ?? "").trim() || "반 정보 없음";

  // 5) 통계 계산
  const totalSubmissions = submissionRows.length;
  const reviewedCount = feedbackRows.length;
  const revisedCount = submissionRows.filter((submission) => submission.status === "reviewed").length;
  const allScores = feedbackRows.flatMap((feedback) =>
    [
      feedback.score_reading,
      feedback.score_thinking,
      feedback.score_logic,
      feedback.score_structure,
      feedback.score_expression,
    ].filter((value): value is number => value !== null),
  );
  const growthScoreRaw = average(allScores);
  const growthScore = growthScoreRaw === null ? null : Math.round(growthScoreRaw * 20);
  const growthDelta = 24;

  // 6) 성장 이력 최근 3개
  let representativeId =
    feedbackRows.find((feedback) => safeAreaComments(feedback.area_comments).representative === true)?.submission_id ??
    null;
  if (!representativeId && feedbackRows.length) {
    const bestFeedback = [...feedbackRows].sort((a, b) => {
      const aScore = average(
        [a.score_reading, a.score_thinking, a.score_logic, a.score_structure, a.score_expression].filter(
          (value): value is number => value !== null,
        ),
      ) ?? 0;
      const bScore = average(
        [b.score_reading, b.score_thinking, b.score_logic, b.score_structure, b.score_expression].filter(
          (value): value is number => value !== null,
        ),
      ) ?? 0;
      return bScore - aScore;
    })[0];
    representativeId = bestFeedback?.submission_id ?? null;
  }

  const historyItems: PortfolioHistoryItem[] = submissionRows.slice(0, 3).map((submission) => {
    const feedback = feedbackBySubmission.get(submission.id) ?? null;
    const scoreText = feedback
      ? `독해 ${feedback.score_reading ?? "-"} · 논리 ${feedback.score_logic ?? "-"} · 구성 ${feedback.score_structure ?? "-"} · 표현 ${feedback.score_expression ?? "-"} · 창의 ${feedback.score_thinking ?? "-"}`
      : "점수 데이터 없음";

    return {
      submissionId: submission.id,
      assignmentTitle: submission.assignmentTitle,
      status: submission.status,
      isRepresentative: representativeId === submission.id,
      scoreText,
      commentPreview: summarizeComment(feedback?.comment ?? null),
    };
  });

  // 7) Before/After 데이터
  const latestFeedback = feedbackRows[0] ?? null;
  const previousFeedback = feedbackRows[1] ?? null;
  const latestArea = safeAreaComments(latestFeedback?.area_comments ?? null);
  const split = splitComment(latestFeedback?.comment ?? null);
  const beforeText =
    (typeof latestArea.before === "string" && latestArea.before.trim()) ? latestArea.before.trim() : split.before;
  const afterText =
    (typeof latestArea.after === "string" && latestArea.after.trim()) ? latestArea.after.trim() : split.after;

  const improvementText = (() => {
    if (typeof latestArea.improvement === "string" && latestArea.improvement.trim()) {
      return latestArea.improvement.trim();
    }
    if (!latestFeedback || !previousFeedback) return "점수 변화 데이터가 충분하지 않습니다.";
    const changes = [
      { label: "논리력", before: previousFeedback.score_logic, after: latestFeedback.score_logic },
      { label: "구성력", before: previousFeedback.score_structure, after: latestFeedback.score_structure },
      { label: "표현력", before: previousFeedback.score_expression, after: latestFeedback.score_expression },
    ].filter((item) => typeof item.before === "number" && typeof item.after === "number" && item.after > item.before);
    if (!changes.length) return "점수 변화 데이터가 충분하지 않습니다.";
    return `${changes.map((item) => `${item.label} ${item.before}→${item.after}점`).join(" · ")} 향상`;
  })();

  const monthLabel = latestFeedback
    ? `${new Date(latestFeedback.created_at).getMonth() + 1}월 종합 평가`
    : "종합 평가";

  const firstSubmittedAt = submissionRows.at(-1)?.submittedAt ?? selectedStudent.createdAt;
  const firstSubmittedText = firstSubmittedAt
    ? new Date(firstSubmittedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
    : "-";

  return (
    <PortfolioClient
      students={studentOptions}
      selectedStudentId={selectedStudent.id}
      selectedStudentName={selectedStudent.name}
      selectedClassName={className}
      firstSubmissionText={firstSubmittedText}
      totalSubmissions={totalSubmissions}
      reviewedCount={reviewedCount}
      revisedCount={revisedCount}
      growthScore={growthScore}
      growthDelta={growthDelta}
      historyItems={historyItems}
      beforeText={beforeText}
      afterText={afterText}
      improvementText={improvementText}
      monthLabel={monthLabel}
      representativeId={representativeId}
      representativeOptions={submissionRows.map((submission) => ({
        submissionId: submission.id,
        label: `${submission.assignmentTitle} (${submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("ko-KR") : "날짜 없음"})`,
      }))}
      onSetRepresentative={setRepresentativeWork}
    />
  );
}
