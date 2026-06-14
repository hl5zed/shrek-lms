"use client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  assignmentId: string;
  assignmentTitle: string;
};

export default function DeleteAssignmentButton({ action, assignmentId, assignmentTitle }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${assignmentTitle}" 과제를 삭제하시겠습니까?\n제출물 등 관련 데이터도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}
