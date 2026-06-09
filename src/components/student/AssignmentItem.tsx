import Link from "next/link";

type AssignmentItemProps = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  description: string;
  submitStatus: "제출 완료" | "미제출" | "첨삭 중" | "첨삭 완료";
};

function statusClass(status: AssignmentItemProps["submitStatus"]) {
  if (status === "첨삭 완료") return "bg-[#E8F8EE] text-[#1F8B4C]";
  if (status === "첨삭 중") return "bg-[#EEF1FF] text-[#3A4BFF]";
  if (status === "제출 완료") return "bg-[#FFF6E8] text-[#A86A00]";
  return "bg-[#FFECEC] text-[#C03232]";
}

export default function AssignmentItem({
  id,
  title,
  className,
  dueDate,
  description,
  submitStatus,
}: AssignmentItemProps) {
  return (
    <Link href={`/student/assignments/${id}`} className="block rounded-xl border border-[#EAEDFA] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-[#06091F]">{title}</p>
          <p className="truncate text-xs text-[#6470BF]">
            {className} · 마감 {dueDate}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(submitStatus)}`}>
          {submitStatus}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-[#4A55A8]">{description}</p>
    </Link>
  );
}

