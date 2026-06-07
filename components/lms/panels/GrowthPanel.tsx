import Card from "@/components/ui/Card";
import ProgressBar from "@/components/lms/ProgressBar";
import { LmsMockData } from "@/lib/lms/types";

type GrowthPanelProps = {
  data: LmsMockData;
};

export default function GrowthPanel({ data }: GrowthPanelProps) {
  return (
    <section className="grid grid-cols-3 gap-4">
      {data.growth.map((g) => (
        <Card key={g.studentName} className="p-5">
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{g.studentName}</h3>
          <div className="mt-3 space-y-3 text-xs">
            <div>
              <p className="mb-1 text-[var(--color-neutral-600)]">논리력 {g.logic}</p>
              <ProgressBar value={g.logic} />
            </div>
            <div>
              <p className="mb-1 text-[var(--color-neutral-600)]">표현력 {g.expression}</p>
              <ProgressBar value={g.expression} />
            </div>
            <div>
              <p className="mb-1 text-[var(--color-neutral-600)]">독해력 {g.reading}</p>
              <ProgressBar value={g.reading} />
            </div>
            <div>
              <p className="mb-1 text-[var(--color-neutral-600)]">제출성실도 {g.consistency}</p>
              <ProgressBar value={g.consistency} />
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
