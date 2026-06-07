import { HTMLAttributes } from "react";

type BadgeTone = "info" | "success" | "warning" | "danger" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export default function Badge({
  tone = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    info: "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]",
    success: "bg-[var(--color-success-light)] text-[var(--color-success-dark)]",
    warning: "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]",
    danger: "bg-[var(--color-error-light)] text-[var(--color-error-dark)]",
    neutral: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
