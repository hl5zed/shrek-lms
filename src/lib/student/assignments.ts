import { createClient } from "@/lib/supabase/server";

export type StudentAssignmentView = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  description: string;
  submitStatus: "제출 완료" | "미제출" | "첨삭 중" | "첨삭 완료";
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  status: "submitted" | "reviewed";
  submitted_at: string;
};

export async function getStudentAssignmentsByUserId(userId: string): Promise<{
  ok: boolean;
  rows: StudentAssignmentView[];
}> {
  const supabase = await createClient();

  const { data: classLinks, error: classError } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", userId);

  if (classError || !classLinks) return { ok: false, rows: [] };

  const classIds = classLinks.map((row) => row.class_id);
  if (classIds.length === 0) return { ok: true, rows: [] };

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, title, description, due_date, class_id, classes ( name )")
    .in("class_id", classIds)
    .order("due_date", { ascending: true });

  if (assignmentError || !assignments) return { ok: false, rows: [] };

  const assignmentIds = assignments.map((assignment) => assignment.id);
  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("submissions")
        .select("id, assignment_id, status, submitted_at")
        .eq("student_id", userId)
        .in("assignment_id", assignmentIds)
    : { data: [] as SubmissionRow[] };

  const submissionMap = new Map<string, SubmissionRow>();
  (submissions ?? []).forEach((submission) => {
    submissionMap.set(submission.assignment_id, submission as SubmissionRow);
  });

  const submissionIds = (submissions ?? []).map((submission) => submission.id);
  const { data: feedbacks } = submissionIds.length
    ? await supabase
        .from("feedbacks")
        .select("submission_id")
        .in("submission_id", submissionIds)
    : { data: [] as { submission_id: string }[] };

  const feedbackSubmissionSet = new Set(
    (feedbacks ?? []).map((feedback) => feedback.submission_id),
  );

  const rows = assignments.map((assignment) => {
    const submission = submissionMap.get(assignment.id);
    let submitStatus: StudentAssignmentView["submitStatus"] = "미제출";

    if (submission?.status === "reviewed") {
      submitStatus = "첨삭 완료";
    } else if (submission?.status === "submitted") {
      submitStatus = feedbackSubmissionSet.has(submission.id) ? "첨삭 중" : "제출 완료";
    }

    return {
      id: assignment.id,
      title: assignment.title,
      className:
        (assignment.classes as unknown as { name: string } | null)?.name ?? "반 정보 없음",
      dueDate: assignment.due_date,
      description: assignment.description ?? "설명이 없습니다.",
      submitStatus,
    };
  });

  return { ok: true, rows };
}

