import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssignmentSubmitClient from "@/src/components/student/AssignmentSubmitClient";
import { submitStudentAssignment, submitStudentAssignmentFile } from "./actions";

export default async function StudentAssignmentDetailPage({
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
  if (!user) notFound();

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", user.id);
  const classIds = (classLinks ?? []).map((r) => r.class_id);
  if (!classIds.length) notFound();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, due_date, class_id")
    .eq("id", id)
    .in("class_id", classIds)
    .single();
  if (!assignment) notFound();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, status, content_text, submitted_at, file_urls")
    .eq("assignment_id", assignment.id)
    .eq("student_id", user.id)
    .maybeSingle();

  // 반 이름 조회
  const { data: classData } = await supabase
    .from("classes")
    .select("name")
    .eq("id", assignment.class_id)
    .maybeSingle();

  // D-day 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = assignment.due_date ? new Date(assignment.due_date) : null;
  let dday = "";
  if (due) {
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    dday = diff > 0 ? `D-${diff}` : diff === 0 ? "D-Day" : `D+${Math.abs(diff)}`;
  }

  // description에서 "숫자~숫자자" 패턴으로 글자수 범위 파싱, 없으면 기본값
  let minLen = 800;
  let maxLen = 1200;
  const rangeMatch = assignment.description?.match(/(\d+)[~～\-](\d+)\s*자/);
  if (rangeMatch) {
    minLen = Number(rangeMatch[1]);
    maxLen = Number(rangeMatch[2]);
  }

  const submittedAtFormatted = submission?.submitted_at
    ? new Date(submission.submitted_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : null;

  return (
    <AssignmentSubmitClient
      assignmentId={assignment.id}
      title={assignment.title ?? "과제 제출"}
      description={assignment.description ?? ""}
      className={classData?.name ?? ""}
      dday={dday}
      minLen={minLen}
      maxLen={maxLen}
      submissionStatus={submission?.status ?? null}
      initialText={submission?.content_text ?? ""}
      submittedAtFormatted={submittedAtFormatted}
      serverStatus={status ?? null}
      textAction={submitStudentAssignment.bind(null, assignment.id)}
      fileAction={submitStudentAssignmentFile.bind(null, assignment.id)}
    />
  );
}
