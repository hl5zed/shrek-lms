import { notFound } from "next/navigation";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import RowItem from "@/src/components/student/RowItem";
import StatusBadge from "@/src/components/student/StatusBadge";
import EssayTextarea from "@/src/components/student/EssayTextarea";
import ImageUploadZone from "@/src/components/student/ImageUploadZone";
import SubmitTypeSelector from "@/src/components/student/SubmitTypeSelector";
import { studentData } from "@/src/lib/mock/studentData";

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = studentData.assignments.find((item) => item.id === id);
  if (!assignment) notFound();

  return (
    <StudentShell title="과제 상세" backHref="/student/assignments">
      <StudentCard>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#06091F]">{assignment.title}</h2>
          <StatusBadge status={assignment.status} />
        </div>
        <div className="mt-2">
          <RowItem label="마감일" value={assignment.dueDate} />
          <RowItem label="제출 상태" value={assignment.status} />
        </div>
      </StudentCard>

      <StudentCard>
        <h3 className="text-sm font-semibold text-[#06091F]">답안 작성</h3>
        <div className="mt-3">
          <SubmitTypeSelector />
        </div>
        <div className="mt-3">
          <EssayTextarea />
        </div>
      </StudentCard>

      <ImageUploadZone />
    </StudentShell>
  );
}

