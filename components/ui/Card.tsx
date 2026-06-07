import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-neutral-200)] bg-white ${className}`.trim()}
      {...props}
    />
  );
}
