import Card from "@/components/ui/Card";
import LmsBadge from "./LmsBadge";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "success" | "warning" | "danger";
};

export default function StatCard({ label, value, delta, tone }: StatCardProps) {
  return (
    <Card className="rounded-[var(--lms-rl)] p-3">
      <p className="mb-1 text-[10px] text-[var(--color-neutral-400)]">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-[20px] leading-[1.1] font-bold text-[var(--color-neutral-1000)]">{value}</p>
        <LmsBadge tone={tone}>{delta}</LmsBadge>
      </div>
    </Card>
  );
}
