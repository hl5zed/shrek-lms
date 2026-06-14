"use client";

import { useTransition } from "react";
import { deleteSubmission } from "./actions";

export default function DeleteButton({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("이 제출물을 삭제하시겠습니까? 첨삭 내용도 함께 삭제됩니다.")) return;
    startTransition(async () => {
      await deleteSubmission(submissionId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
