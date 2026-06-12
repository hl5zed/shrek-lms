import { createClient } from "@/lib/supabase/server";
import SubmissionsClient, { type AdminSubmissionRow } from "@/src/components/admin/SubmissionsClient";

type StatusFilter = "all" | "pending" | "reviewed";

function toStatusFilter(value: string | undefined): StatusFilter {
  if (value === "pending" || value === "reviewed") return value;
  return "all";
}

// 제출 이후 경과 시간을 피드백 페이지와 동일한 방식으로 계산합니다.
function formatElapsed(submittedAt: string): string {
  const submitted = new Date(submittedAt).getTime();
  if (Number.isNaN(submitted)) return "-";

  const diffMs = Date.now() - submitted;
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "1시간 미만";
  if (diffHours < 24) return `${diffHours}시간`;

  const days = Math.floor(diffHours / 24);
  if (days < 7) return `${days}일`;

  const weeks = Math.floor(days / 7);
  return `${weeks}주`;
}

function computeDday(dueDate: string | null): string {
  if (!dueDate) return "날짜 미정";
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return dueDate;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.floor((dueOnly.getTime() - todayOnly.getTime()) / 86400000);

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-Day";
  return dueDate;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; classId?: string; assignmentId?: string }>;
}) {
  const { status, classId, assignmentId } = await searchParams;
  const currentStatus = toStatusFilter(status);
  const currentClassId = typeof classId === "string" ? classId.trim() : "";
  const currentAssignmentId = typeof assignmentId === "string" ? assignmentId.trim() : "";
  const supabase = await createClient();

  // 1) 제출물 목록 조회
  let submissionsQuery = supabase
    .from("submissions")
    .select(`
      id,
      submitted_at,
      status,
      content_text,
      file_urls,
      word_count,
      word_count_pure,
      student_id,
      assignment_id,
      assignments ( id, title, description, due_date, class_id, classes ( name ) ),
      profiles!student_id ( name )
    `)
    .order("submitted_at", { ascending: false });

  // 2) 상태 필터를 쿼리에 반영합니다.
  if (currentStatus === "pending") {
    submissionsQuery = submissionsQuery.eq("status", "submitted");
  } else if (currentStatus === "reviewed") {
    submissionsQuery = submissionsQuery.eq("status", "reviewed");
  }

  // 3) 과제 필터를 쿼리에 반영합니다.
  if (currentAssignmentId) {
    submissionsQuery = submissionsQuery.eq("assignment_id", currentAssignmentId);
  }

  const { data: submissions } = await submissionsQuery;
  const submissionIds = (submissions ?? []).map((item) => item.id);

  // 4) 첨삭 존재 여부 조회
  const { data: feedbacks } = submissionIds.length
    ? await supabase.from("feedbacks").select("submission_id").in("submission_id", submissionIds)
    : { data: [] as Array<{ submission_id: string }> };

  // 5) 반 목록 조회
  const { data: classes } = await supabase.from("classes").select("id, name").order("name");

  // 6) 과제 목록 조회 (반 필터 선택 시 해당 반 과제만)
  let assignmentsQuery = supabase.from("assignments").select("id, title, class_id, due_date").order("title");
  if (currentClassId) {
    assignmentsQuery = assignmentsQuery.eq("class_id", currentClassId);
  }
  const { data: assignments } = await assignmentsQuery;

  const feedbackSet = new Set((feedbacks ?? []).map((item) => item.submission_id));

  // 목록 렌더링에 필요한 형태로 서버에서 미리 가공합니다.
  const normalizedRows = (submissions ?? []).map((submission) => {
    const typed = submission as unknown as {
      id: string;
      submitted_at: string | null;
      status: string | null;
      content_text: string | null;
      file_urls: unknown;
      word_count: number | null;
      word_count_pure: number | null;
      assignment_id: string | null;
      assignments: {
        id?: string;
        title?: string;
        description?: string;
        due_date?: string;
        class_id?: string;
        classes?: { name?: string } | null;
      } | null;
      profiles: { name?: string } | null;
    };

    const normalizedFiles = Array.isArray(typed.file_urls) ? typed.file_urls : [];
    const fileCount = normalizedFiles.length;
    const hasText = Boolean(typed.content_text?.trim());
    const submitType: "text" | "file" | "none" = hasText ? "text" : fileCount > 0 ? "file" : "none";

    const baseText = typed.content_text?.trim() ?? "";
    const contentPreview =
      baseText.length > 120 ? `${baseText.slice(0, 120)}...` : baseText || "텍스트 제출 내용이 없습니다.";

    return {
      id: typed.id,
      studentName: typed.profiles?.name?.trim() ? typed.profiles.name : "학생 정보 없음",
      assignmentId: typed.assignments?.id ?? typed.assignment_id ?? "",
      assignmentTitle: typed.assignments?.title?.trim() ? typed.assignments.title : "과제 정보 없음",
      assignmentDescription: typed.assignments?.description?.trim() || "",
      classId: typed.assignments?.class_id ?? "",
      className: typed.assignments?.classes?.name?.trim() ? typed.assignments.classes.name : "반 정보 없음",
      dueDate: typed.assignments?.due_date ?? null,
      submittedAt: typed.submitted_at,
      submittedAtText: typed.submitted_at ? new Date(typed.submitted_at).toLocaleString("ko-KR") : "제출일 정보 없음",
      elapsed: typed.submitted_at ? formatElapsed(typed.submitted_at) : "-",
      isReviewed: feedbackSet.has(typed.id) || typed.status === "reviewed",
      contentText: typed.content_text ?? "",
      contentPreview,
      wordCount: typed.word_count ?? typed.word_count_pure ?? baseText.length,
      fileUrls: normalizedFiles,
      fileCount,
      submitType,
    } satisfies AdminSubmissionRow;
  });

  // classId 필터는 관계 조인 컬럼을 기준으로 서버에서 추가 적용합니다.
  const filteredRows = currentClassId
    ? normalizedRows.filter((row) => row.classId === currentClassId)
    : normalizedRows;

  const selectedAssignment = (assignments ?? []).find((item) => item.id === currentAssignmentId) ?? null;
  const subtitle = selectedAssignment
    ? `${selectedAssignment.title} · 마감 ${computeDday(selectedAssignment.due_date ?? null)} · 전체 ${filteredRows.length}건`
    : `전체 과제 · ${filteredRows.length}건`;

  return (
    <SubmissionsClient
      rows={filteredRows}
      classes={(classes ?? []).map((item) => ({ id: item.id, name: item.name ?? "이름 없음" }))}
      assignments={(assignments ?? []).map((item) => ({ id: item.id, title: item.title ?? "제목 없음", classId: item.class_id ?? "" }))}
      currentStatus={currentStatus}
      currentClassId={currentClassId}
      currentAssignmentId={currentAssignmentId}
      subtitle={subtitle}
    />
  );
}
