import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import ProgressBar from "@/components/lms/ProgressBar";
import { LmsMockData } from "@/lib/lms/types";

type LessonsPanelProps = {
  data: LmsMockData;
};

export default function LessonsPanel({ data }: LessonsPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap justify-end gap-1.5">
        <Button variant="ghost" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">스트리밍 설정</Button>
        <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">콘텐츠 업로드</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.contents.map((content) => (
          <Card key={content.id} className="rounded-[var(--lms-rl)] p-3">
            <div
              className={`mb-2 flex h-[72px] items-center justify-center rounded-[var(--lms-r)] ${
                content.type === "영상"
                  ? "bg-[var(--lms-br-l)]"
                  : content.type === "음성"
                    ? "bg-[var(--lms-ok-l)]"
                    : "bg-[var(--lms-er-l)]"
              }`}
            />
            <div className="flex items-center justify-between">
              <LmsBadge tone="primary">{content.type}</LmsBadge>
              <LmsBadge tone={content.visibility === "공개" ? "success" : "warning"}>{content.visibility}</LmsBadge>
            </div>
            <h3 className="mt-2 text-[12.5px] font-bold text-[var(--color-neutral-1000)]">{content.title}</h3>
            <p className="mt-0.5 text-[10.5px] text-[var(--color-neutral-400)]">수강자 {content.learners}명</p>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-[var(--color-neutral-400)]">평균 이용률 {content.engagementRate}%</p>
              <ProgressBar value={content.engagementRate} />
            </div>
          </Card>
        ))}
      </div>
      <Card className="rounded-[var(--lms-r)] bg-[var(--lms-pu-l)] p-2.5">
        <p className="text-[11px] font-semibold text-[var(--lms-pu)]">
          비공개 버킷 / Signed URL 안내
        </p>
        <p className="mt-1 break-words text-[11px] text-[var(--color-neutral-700)]">
          실서비스에서는 원본 파일을 private bucket에 저장하고, 수강 권한 확인 후 signed URL을 발급하여 접근을 통제합니다.
        </p>
      </Card>
    </section>
  );
}
