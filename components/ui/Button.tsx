"use client";

import {
  ButtonHTMLAttributes,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
  children?: ReactNode;
};

// 디자인 기준:
// - 한 화면에서 핵심 행동 1개만 primary
// - 나머지 액션은 ghost(보더 기반) 사용
export default function Button({
  variant = "ghost",
  asChild = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-200)] disabled:cursor-not-allowed disabled:opacity-60";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]",
    ghost:
      "border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] hover:border-[var(--color-primary-200)] hover:text-[var(--color-primary-600)]",
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: `${base} ${variants[variant]} ${child.props.className ?? ""} ${className}`.trim(),
    });
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
