import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import RowItem from "@/src/components/student/RowItem";
import StatusBadge from "@/src/components/student/StatusBadge";
import ImageUploadZone from "@/src/components/student/ImageUploadZone";
import SubmitTypeSelector from "@/src/components/student/SubmitTypeSelector";
import AssignmentSubmitForm from "@/src/components/student/AssignmentSubmitForm";
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

  const classIds = (classLinks ?? []).map((row) => row.class_id);
  if (classIds.length === 0) notFound();

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

  const hasTextSubmission = Boolean(submission?.content_text?.trim());
  const hasFileSubmission = Array.isArray(submission?.file_urls) && submission.file_urls.length > 0;
  const hasSubmissionRecordWithoutContent = Boolean(
    submission && !hasTextSubmission && !hasFileSubmission
  );
  const submissionStatusLabel =
    submission?.status === "reviewed"
      ? "첨삭완료"
      : submission?.status === "submitted"
        ? "제출 완료"
        : "미제출";

  const statusLabel =
    submission?.status === "reviewed"
      ? "reviewed"
      : submission?.status === "submitted"
        ? "pending"
        : "pending";

  return (
    <StudentShell title="과제 상세" backHref="/student/assignments">
      <StudentCard>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#06091F]">{assignment.title}</h2>
          <StatusBadge status={statusLabel} />
        </div>
        <div className="mt-2">
          <RowItem label="마감일" value={assignment.due_date} />
          <RowItem
            label="제출 상태"
            value={submissionStatusLabel}
          />
          {assignment.description ? (
            <p className="mt-3 text-sm text-[#4A55A8]">{assignment.description}</p>
          ) : null}
          {submission?.status ? (
            <div className="mt-3 rounded-lg border border-[#D4D9F5] bg-[#F5F7FF] px-3 py-2.5 text-sm text-[#4A55A8]">
              <p className="font-semibold text-[#161D55]">제출 이력</p>
              <ul className="mt-1 space-y-0.5">
                <li>상태: {submissionStatusLabel}</li>
                <li>
                  최근 제출/수정:{" "}
                  {submission.submitted_at
                    ? new Date(submission.submitted_at).toLocaleString("ko-KR")
                    : "기록 없음"}
                </li>
                <li>텍스트 답안: {hasTextSubmission ? "있음" : "없음"}</li>
                <li>이미지/파일 제출: {hasFileSubmission ? "있음" : "없음"}</li>
              </ul>
              {hasSubmissionRecordWithoutContent ? (
                <p className="mt-2 rounded-md bg-[#FFF6E8] px-2.5 py-2 text-xs text-[#A86A00]">
                  일부 정보를 불러오지 못했습니다. 필요한 경우 담당 선생님 또는 관리자에게 문의해 주세요.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-[#D4D9F5] bg-[#F5F7FF] px-3 py-2.5 text-sm text-[#4A55A8]">
              아직 제출 내역이 없습니다. 아래에서 답안을 작성해 제출할 수 있습니다.
            </div>
          )}
        </div>
      </StudentCard>

      <StudentCard>
        <h3 className="text-sm font-semibold text-[#06091F]">답안 작성</h3>
        {status === "submitted" ? (
          <p className="mt-3 rounded-lg bg-[#E8F8EE] px-3 py-2 text-sm text-[#1F8B4C]">
            제출이 완료되었습니다.
          </p>
        ) : null}
        {status === "too_short" ? (
          <p className="mt-3 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            답안이 너무 짧습니다. 최소 50자 이상 입력해 주세요.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-[#FFECEC] px-3 py-2 text-sm text-[#C03232]">
            제출에 실패했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {status === "forbidden" ? (
          <p className="mt-3 rounded-lg bg-[#FFECEC] px-3 py-2 text-sm text-[#C03232]">
            이 화면에 접근할 권한이 없습니다. 필요한 경우 관리자에게 문의해 주세요.
          </p>
        ) : null}
        {status === "file_required" ? (
          <p className="mt-3 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            파일을 먼저 선택해 주세요.
          </p>
        ) : null}
        {status === "invalid_file" ? (
          <p className="mt-3 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            JPG, JPEG, PNG, PDF 파일만 제출할 수 있습니다.
          </p>
        ) : null}
        {status === "file_too_large" ? (
          <p className="mt-3 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            파일 용량은 10MB 이하만 업로드할 수 있습니다.
          </p>
        ) : null}
        {status === "upload_error" ? (
          <p className="mt-3 rounded-lg bg-[#FFECEC] px-3 py-2 text-sm text-[#C03232]">
            파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {status === "bucket_missing" ? (
          <p className="mt-3 rounded-lg bg-[#FFECEC] px-3 py-2 text-sm text-[#C03232]">
            제출용 스토리지 버킷이 준비되지 않았습니다. 관리자에게 문의해 주세요.
          </p>
        ) : null}
        {status === "readonly" ? (
          <p className="mt-3 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            첨삭 완료된 제출물은 수정할 수 없습니다.
          </p>
        ) : null}
        <div className="mt-3">
          <SubmitTypeSelector
            textContent={
              <AssignmentSubmitForm
                action={submitStudentAssignment.bind(null, assignment.id)}
                initialText={submission?.content_text ?? ""}
                readOnly={submission?.status === "reviewed"}
              />
            }
            imageContent={
              <ImageUploadZone
                action={submitStudentAssignmentFile.bind(null, assignment.id)}
                readOnly={submission?.status === "reviewed"}
              />
            }
          />
        </div>
      </StudentCard>
    </StudentShell>
  );
}
