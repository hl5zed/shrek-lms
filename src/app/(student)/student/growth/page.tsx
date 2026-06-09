import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import FeedbackScoreGrid from "@/src/components/student/FeedbackScoreGrid";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentGrowthPage() {
  const latest = studentData.feedbacks[0];

  return (
    <StudentShell title="성장 리포트">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">최근 성장 지표</h2>
        <p className="mt-1 text-xs text-[#6470BF]">{latest.createdAt} 기준</p>
        <div className="mt-3">
          <FeedbackScoreGrid
            reading={latest.reading}
            thinking={latest.thinking}
            logic={latest.logic}
            structure={latest.structure}
            expression={latest.expression}
          />
        </div>
      </StudentCard>
    </StudentShell>
  );
}

