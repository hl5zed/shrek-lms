"use client";

import { useActionState } from "react";
import EssayTextarea from "./EssayTextarea";

type AssignmentSubmitFormProps = {
  action: (formData: FormData) => void;
  initialText?: string;
  readOnly?: boolean;
};

export default function AssignmentSubmitForm({
  action,
  initialText = "",
  readOnly = false,
}: AssignmentSubmitFormProps) {
  const [, formAction, isPending] = useActionState(async (_prev: null, formData: FormData) => {
    await action(formData);
    return null;
  }, null);

  if (readOnly) {
    return (
      <div className="rounded-xl border border-[#D4D9F5] bg-[#F5F7FF] p-3 text-sm text-[#4A55A8]">
        첨삭 완료된 답안은 수정할 수 없습니다.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <EssayTextarea initialValue={initialText} />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-lg bg-[#3A4BFF] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "제출 중..." : "최종 제출"}
      </button>
    </form>
  );
}

