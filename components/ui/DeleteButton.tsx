"use client";

interface DeleteButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function DeleteButton({ className, children }: DeleteButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm("삭제하시겠습니까?")) e.preventDefault();
      }}
    >
      {children ?? "삭제"}
    </button>
  );
}
