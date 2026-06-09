import { notFound } from "next/navigation";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import FeedbackScoreGrid from "@/src/components/student/FeedbackScoreGrid";
import CommentBox from "@/src/components/student/CommentBox";
import AudioPlayer from "@/src/components/student/AudioPlayer";
import { studentData } from "@/src/lib/mock/studentData";

export default async function StudentFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feedback = studentData.feedbacks.find((item) => item.id === id);
  if (!feedback) notFound();

  return (
    <StudentShell title="첨삭 상세" backHref="/student/feedback">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">{feedback.title}</h2>
        <p className="mt-1 text-xs text-[#6470BF]">{feedback.createdAt}</p>
      </StudentCard>

      <StudentCard>
        <h3 className="text-sm font-semibold text-[#06091F]">영역별 점수</h3>
        <div className="mt-3">
          <FeedbackScoreGrid
            reading={feedback.reading}
            thinking={feedback.thinking}
            logic={feedback.logic}
            structure={feedback.structure}
            expression={feedback.expression}
          />
        </div>
      </StudentCard>

      <CommentBox comment={feedback.comment} />
      <AudioPlayer />
    </StudentShell>
  );
}

