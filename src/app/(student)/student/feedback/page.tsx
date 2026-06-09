import Link from "next/link";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import StatusBadge from "@/src/components/student/StatusBadge";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentFeedbackPage() {
  return (
    <StudentShell title="첨삭 결과">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">첨삭 리스트</h2>
        <div className="mt-3 space-y-2">
          {studentData.feedbacks.map((feedback) => (
            <Link
              key={feedback.id}
              href={`/student/feedback/${feedback.id}`}
              className="block rounded-xl border border-[#EAEDFA] p-3"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-[#06091F]">{feedback.title}</p>
                <StatusBadge status="reviewed" />
              </div>
              <p className="mt-1 text-xs text-[#6470BF]">{feedback.createdAt}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[#4A55A8]">{feedback.comment}</p>
            </Link>
          ))}
        </div>
      </StudentCard>
    </StudentShell>
  );
}

