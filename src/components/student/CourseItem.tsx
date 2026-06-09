import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";

type CourseItemProps = {
  title: string;
  teacherName: string;
  schedule: string;
  progress: number;
  status: string;
  lessonCount?: number;
  description?: string;
};

export default function CourseItem({
  title,
  teacherName,
  schedule,
  progress,
  status,
  lessonCount,
  description,
}: CourseItemProps) {
  return (
    <article className="rounded-xl border border-[#D4D9F5] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-[#06091F]">{title}</p>
          <p className="truncate text-xs text-[#6470BF]">
            {teacherName} · {schedule}
          </p>
          {description ? <p className="mt-1 line-clamp-2 text-xs text-[#4A55A8]">{description}</p> : null}
          {typeof lessonCount === "number" ? (
            <p className="mt-1 text-xs text-[#6470BF]">강의 수: {lessonCount}개</p>
          ) : null}
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} />
        <p className="mt-1 text-right text-xs text-[#4A55A8]">{progress}%</p>
      </div>
    </article>
  );
}

