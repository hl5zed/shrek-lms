import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import FeedbackScoreGrid from "@/src/components/student/FeedbackScoreGrid";
import CommentBox from "@/src/components/student/CommentBox";
import AudioPlayer from "@/src/components/student/AudioPlayer";
import { getStudentFeedbackDetailBySubmission } from "@/src/lib/student/feedback";

export default async function StudentFeedbackDetailByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const result = await getStudentFeedbackDetailBySubmission(user.id, id);
  if (!result.ok || !result.row) notFound();
  const row = result.row;

  return (
    <StudentShell title="첨삭 상세" backHref="/student/feedback">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">{row.assignmentTitle}</h2>
        <p className="mt-1 text-xs text-[#6470BF]">
          {row.className} · 제출일 {new Date(row.submittedAt).toLocaleString("ko-KR")}
        </p>
      </StudentCard>

      <StudentCard>
        <h3 className="text-sm font-semibold text-[#06091F]">영역별 점수</h3>
        <div className="mt-3">
          <FeedbackScoreGrid
            reading={row.feedback?.scoreReading ?? null}
            thinking={row.feedback?.scoreThinking ?? null}
            logic={row.feedback?.scoreLogic ?? null}
            structure={row.feedback?.scoreStructure ?? null}
            expression={row.feedback?.scoreExpression ?? null}
          />
        </div>
      </StudentCard>

      <CommentBox comment={row.feedback?.comment ?? null} />

      {row.feedback?.areaComments && Object.keys(row.feedback.areaComments).length > 0 ? (
        <StudentCard>
          <h3 className="text-sm font-semibold text-[#06091F]">문장별/영역별 코멘트</h3>
          <div className="mt-3 space-y-2">
            {Object.entries(row.feedback.areaComments).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-[#EAEDFA] p-3">
                <p className="text-xs font-semibold text-[#4A55A8]">{key}</p>
                <p className="mt-1 text-sm text-[#161D55]">{value}</p>
              </div>
            ))}
          </div>
        </StudentCard>
      ) : null}

      <StudentCard>
        <h3 className="text-sm font-semibold text-[#06091F]">제출 답안</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-[#161D55]">{row.contentText || "제출 답안이 없습니다."}</p>
      </StudentCard>

      <AudioPlayer src={null} />
    </StudentShell>
  );
}

