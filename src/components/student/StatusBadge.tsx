type StatusBadgeProps = {
  status: string;
};

const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-[#EEF1FF] text-[#3A4BFF]",
  completed: "bg-[#E8F8EE] text-[#1F8B4C]",
  submitted: "bg-[#E8F8EE] text-[#1F8B4C]",
  pending: "bg-[#FFF6E8] text-[#A86A00]",
  late: "bg-[#FFECEC] text-[#C03232]",
  reviewed: "bg-[#EEF1FF] text-[#3A4BFF]",
  review_ready: "bg-[#EEF1FF] text-[#3A4BFF]",
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "진행중",
  completed: "완료",
  submitted: "제출",
  pending: "대기",
  late: "지연",
  reviewed: "첨삭완료",
  review_ready: "첨삭완료",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const className = STATUS_STYLE[status] ?? "bg-[#EEF1FF] text-[#3A4BFF]";
  const label = STATUS_LABEL[status] ?? status;

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

