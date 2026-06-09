type ScoreBarProps = {
  label: string;
  score: number;
};

export default function ScoreBar({ label, score }: ScoreBarProps) {
  const safe = Math.max(0, Math.min(5, score));
  const percent = (safe / 5) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-[#4A55A8]">
        <span>{label}</span>
        <span>{safe.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-[#EAEDFA]">
        <div className="h-2 rounded-full bg-[#3A4BFF]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

