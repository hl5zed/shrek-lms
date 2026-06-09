import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import StatusBadge from "@/src/components/student/StatusBadge";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentPortfolioPage() {
  return (
    <StudentShell title="포트폴리오">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">내 제출물</h2>
        <div className="mt-3 space-y-2">
          {studentData.submissions.map((submission) => (
            <article key={submission.id} className="rounded-xl border border-[#EAEDFA] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[#06091F]">{submission.title}</p>
                  <p className="text-xs text-[#6470BF]">{submission.submittedAt}</p>
                </div>
                <StatusBadge status={submission.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-[#4A55A8]">{submission.previewText}</p>
            </article>
          ))}
        </div>
      </StudentCard>
    </StudentShell>
  );
}

