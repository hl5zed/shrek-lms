type ProgressBarProps = {
  value: number;
};

export default function ProgressBar({ value }: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="h-[3px] w-full rounded-full bg-[var(--color-neutral-100)]">
      <div
        className="h-[3px] rounded-full bg-[var(--lms-br)] transition-all"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
