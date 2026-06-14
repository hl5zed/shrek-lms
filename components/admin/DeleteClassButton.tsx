"use client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  classId: string;
  className: string;
};

export default function DeleteClassButton({ action, classId, className }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${className}" 반을 삭제하시겠습니까?\n소속 학생 연결, 과제 등 관련 데이터도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="classId" value={classId} />
      <button
        type="submit"
        className="h-8 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}
