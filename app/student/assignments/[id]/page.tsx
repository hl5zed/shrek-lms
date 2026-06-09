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
    .select("id, status, content_text")
    .eq("assignment_id", assignment.id)
    .eq("student_id", user.id)
    .maybeSingle();

  const statusLabel =
    submission?.status === "reviewed"
      ? "submitted"
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
            value={
              submission?.status === "reviewed"
                ? "첨삭 완료"
                : submission?.status === "submitted"
                  ? "제출 완료"
                  : "미제출"
            }
          />
          {assignment.description ? (
            <p className="mt-3 text-sm text-[#4A55A8]">{assignment.description}</p>
          ) : null}
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
            접근 권한이 없는 과제입니다.
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
