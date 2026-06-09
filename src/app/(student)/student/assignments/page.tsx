import Link from "next/link";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import StatusBadge from "@/src/components/student/StatusBadge";
import RowItem from "@/src/components/student/RowItem";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentAssignmentsPage() {
  return (
    <StudentShell title="과제 목록">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">진행 과제</h2>
        <div className="mt-3 space-y-2">
          {studentData.assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/student/assignments/${assignment.id}`}
              className="block rounded-xl border border-[#EAEDFA] p-3"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-[#06091F]">{assignment.title}</p>
                <StatusBadge status={assignment.status} />
              </div>
              <div className="mt-2">
                <RowItem label="마감일" value={assignment.dueDate} />
                <RowItem
                  label="점수"
                  value={assignment.score === null ? "-" : `${assignment.score}점`}
                />
              </div>
            </Link>
          ))}
        </div>
      </StudentCard>
    </StudentShell>
  );
}

