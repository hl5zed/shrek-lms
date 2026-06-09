type ProgressBarProps = {
  value: number;
};

export default function ProgressBar({ value }: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-[#EAEDFA]">
      <div
        className="h-2 rounded-full bg-[#3A4BFF]"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

