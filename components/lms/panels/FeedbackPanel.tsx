import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import { LmsMockData } from "@/lib/lms/types";

type FeedbackPanelProps = {
  data: LmsMockData;
};

export default function FeedbackPanel({ data }: FeedbackPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-[var(--color-neutral-1000)]">첨삭 관리</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-400)]">대기 5건 · 긴급 2건 · AI 분석 완료 3건</p>
        </div>
        <LmsBadge tone="danger">긴급 2건</LmsBadge>
      </div>

      <div className="grid h-[500px] grid-cols-[168px_1fr] gap-3">
        <div className="lms-scrollbar space-y-1 overflow-y-auto">
          <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-400)]">대기 목록</p>
          {data.feedback.queue.map((item) => (
            <div
              key={item.id}
              className={`cursor-pointer rounded-[var(--lms-r)] p-2.5 ${item.urgency === "높음" ? "border-2 border-[var(--lms-br)] bg-[var(--lms-br-l)]" : "border border-[var(--color-neutral-200)] bg-white"}`}
            >
              <p className="text-[12px] font-bold text-[var(--color-neutral-1000)]">{item.studentName}</p>
              <p className="mt-0.5 text-[10px] text-[var(--color-neutral-500)]">{item.assignmentTitle}</p>
              <div className="mt-1">
                <LmsBadge tone={item.urgency === "높음" ? "danger" : "neutral"}>
                  {item.urgency === "높음" ? `긴급 ${item.submittedAt}` : item.submittedAt}
                </LmsBadge>
              </div>
            </div>
          ))}
        </div>

        <Card className="lms-shell-card flex min-h-0 flex-col gap-2 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[var(--color-neutral-1000)]">신동현 — 6월 2주차 논술</p>
              <p className="text-[10px] text-[var(--color-neutral-400)]">중3 A반 · 이미지(손글씨) 첨부</p>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" className="h-7 rounded-[var(--lms-r)] px-2.5 text-[11px]">임시저장</Button>
              <Button variant="ghost" className="h-7 rounded-[var(--lms-r)] px-2.5 text-[11px]">음성 첨삭</Button>
              <Button variant="primary" className="h-7 rounded-[var(--lms-r)] px-2.5 text-[11px]">첨삭 완료</Button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_172px] gap-2">
            <div className="lms-scrollbar min-h-0 overflow-y-auto rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-2.5">
              <p className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">제출 원고</p>
              <div className="mb-2 flex h-[160px] items-center justify-center rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] bg-white text-[11px] text-[var(--color-neutral-400)]">
                손글씨 원고 이미지
              </div>
              <p className="text-[11.5px] leading-relaxed text-[var(--color-neutral-800)]">{data.feedback.manuscript}</p>
            </div>

            <div className="lms-scrollbar min-h-0 space-y-2 overflow-y-auto">
              <div className="rounded-[var(--lms-r)] bg-[var(--lms-pu-l)] p-2">
                <p className="text-[10px] font-bold text-[var(--lms-pu)]">AI 첨삭 보조</p>
                <ul className="mt-1 space-y-0.5 text-[10.5px] text-[var(--color-neutral-800)]">
                  {data.feedback.aiAnalysis.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold text-[var(--color-neutral-600)]">강사 코멘트</p>
                <textarea
                  className="h-20 w-full resize-none rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] p-2 text-[10.5px] outline-none focus:border-[var(--lms-br-2)]"
                  placeholder="코멘트를 입력하세요."
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
