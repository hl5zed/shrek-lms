import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import { LmsMockData } from "@/lib/lms/types";

type PortfolioPanelProps = {
  data: LmsMockData;
};

export default function PortfolioPanel({ data }: PortfolioPanelProps) {
  return (
    <section className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-2">
          <select className="h-10 rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm">
            <option>월별 전체</option>
          </select>
          <select className="h-10 rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm">
            <option>과제별 전체</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {data.portfolio.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{item.assignmentTitle}</h3>
              <LmsBadge tone="primary">{item.month}</LmsBadge>
            </div>
            <p className="mt-1 text-xs text-[var(--color-neutral-600)]">{item.studentName}</p>
            <p className="mt-3 text-sm text-[var(--color-neutral-700)]">{item.feedbackSummary}</p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-primary-700)]">점수 {item.score}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
