import Link from "next/link";

type FeedbackItemProps = {
  submissionId: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  feedbackUpdatedAt: string | null;
  status: "첨삭 완료" | "첨삭 대기";
};

function badgeClass(status: FeedbackItemProps["status"]) {
  return status === "첨삭 완료"
    ? "bg-[#E8F8EE] text-[#1F8B4C]"
    : "bg-[#FFF6E8] text-[#A86A00]";
}

export default function FeedbackItem({
  submissionId,
  assignmentTitle,
  className,
  submittedAt,
  feedbackUpdatedAt,
  status,
}: FeedbackItemProps) {
  return (
    <Link href={`/student/feedback/${submissionId}`} className="block rounded-xl border border-[#EAEDFA] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-[#06091F]">{assignmentTitle}</p>
          <p className="truncate text-xs text-[#6470BF]">{className}</p>
        </div>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs text-[#4A55A8]">
        제출일: {new Date(submittedAt).toLocaleString("ko-KR")}
      </p>
      <p className="mt-1 text-xs text-[#6470BF]">
        {feedbackUpdatedAt
          ? `첨삭 업데이트: ${new Date(feedbackUpdatedAt).toLocaleString("ko-KR")}`
          : "첨삭 상태: 첨삭 대기"}
      </p>
    </Link>
  );
}

