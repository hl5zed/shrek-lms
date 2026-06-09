import StatusBadge from "@/src/components/student/StatusBadge";

type PortfolioItemProps = {
  assignmentTitle: string;
  className: string;
  submittedAt: string | null;
  reviewStatus: "reviewed" | "submitted";
  score: number | null;
  previewText: string;
};

export default function PortfolioItem({
  assignmentTitle,
  className,
  submittedAt,
  reviewStatus,
  score,
  previewText,
}: PortfolioItemProps) {
  return (
    <article className="rounded-xl border border-[#EAEDFA] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-[#06091F]">{assignmentTitle}</p>
          <p className="truncate text-xs text-[#6470BF]">
            {className}
            {" · "}
            제출{" "}
            {submittedAt ? new Date(submittedAt).toLocaleDateString("ko-KR") : "-"}
          </p>
        </div>
        <StatusBadge status={reviewStatus} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs text-[#4A55A8]">평균 점수</p>
        <p className="text-sm font-semibold text-[#06091F]">{score === null ? "-" : `${score}점`}</p>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-[#4A55A8]">{previewText}</p>
    </article>
  );
}

