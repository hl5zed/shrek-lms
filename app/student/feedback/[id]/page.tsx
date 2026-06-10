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
  const assignmentTitle =
    typeof row.assignmentTitle === "string" && row.assignmentTitle.trim().length > 0
      ? row.assignmentTitle
      : "과제 정보를 불러오지 못했습니다.";
  const className =
    typeof row.className === "string" && row.className.trim().length > 0
      ? row.className
      : "반 정보 없음";
  const contentText =
    typeof row.contentText === "string" ? row.contentText : "";
  const commentText =
    typeof row.feedback?.comment === "string" ? row.feedback.comment : "";
  const hasSubmissionContent = Boolean(contentText.trim());
  const hasFeedbackComment = Boolean(commentText.trim());
  const hasAreaComments = Boolean(
    row.feedback?.areaComments && Object.keys(row.feedback.areaComments).length > 0
  );
  const hasAnyScore = Boolean(
    row.feedback &&
      [
        row.feedback.scoreReading,
        row.feedback.scoreThinking,
        row.feedback.scoreLogic,
        row.feedback.scoreStructure,
        row.feedback.scoreExpression,
      ].some((score) => score !== null)
  );
  const hasFeedbackDetail = hasFeedbackComment || hasAreaComments || hasAnyScore;
  const submittedAtText =
    typeof row.submittedAt === "string" && row.submittedAt.trim().length > 0
      ? new Date(row.submittedAt).toLocaleString("ko-KR")
      : "제출일 정보 없음";

  return (
    <StudentShell title="첨삭 상세" backHref="/student/feedback">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">{assignmentTitle}</h2>
        <p className="mt-1 text-xs text-[#6470BF]">
          {className} · 제출일 {submittedAtText}
        </p>
      </StudentCard>

      {!hasSubmissionContent || (row.feedback && !hasFeedbackDetail) ? (
        <StudentCard>
          <p className="rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#A86A00]">
            일부 정보를 불러오지 못했습니다. 필요한 경우 담당 선생님 또는 관리자에게 문의해 주세요.
          </p>
        </StudentCard>
      ) : null}

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
        {!hasAnyScore ? (
          <p className="mt-3 text-sm text-[#A86A00]">점수는 아직 입력되지 않았습니다.</p>
        ) : null}
      </StudentCard>

      <CommentBox comment={row.feedback?.comment ?? null} />
      {!hasFeedbackComment ? (
        <StudentCard>
          <p className="text-sm text-[#A86A00]">코멘트가 없습니다.</p>
        </StudentCard>
      ) : null}

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
        <p className="mt-3 whitespace-pre-wrap text-sm text-[#161D55]">
          {hasSubmissionContent ? contentText : "제출 답안이 없습니다."}
        </p>
      </StudentCard>

      <AudioPlayer src={null} />
    </StudentShell>
  );
}

