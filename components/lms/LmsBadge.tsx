type LmsBadgeTone = "primary" | "success" | "warning" | "danger" | "neutral";

type LmsBadgeProps = {
  tone?: LmsBadgeTone;
  children: React.ReactNode;
};

export default function LmsBadge({ tone = "neutral", children }: LmsBadgeProps) {
  const toneClass: Record<LmsBadgeTone, string> = {
    primary: "bg-[var(--lms-br-l)] text-[var(--lms-br)]",
    success: "bg-[var(--lms-ok-l)] text-[var(--lms-ok-d)]",
    warning: "bg-[var(--lms-wa-l)] text-[var(--lms-wa-d)]",
    danger: "bg-[var(--lms-er-l)] text-[var(--lms-er-d)]",
    neutral: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-[1.4] font-bold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
