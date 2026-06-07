import { HTMLAttributes, TableHTMLAttributes } from "react";

export function TableContainer({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-neutral-200)] bg-white ${className}`.trim()}
      {...props}
    />
  );
}

export function Table({ className = "", ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`w-full text-sm ${className}`.trim()} {...props} />
  );
}
